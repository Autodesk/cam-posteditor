"use strict";
// Copyright (c) 2020-2026 by Autodesk, Inc.
// Licensed under MIT. See LICENSE file in the project root.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARCHIVE_EXTENSIONS = void 0;
exports.isFusionArchive = isFusionArchive;
exports.archiveContainsMch = archiveContainsMch;
exports.extractMchFromArchive = extractMchFromArchive;
exports.resolveMachineFile = resolveMachineFile;
exports.tryResolveMachineFile = tryResolveMachineFile;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const zlib = __importStar(require("zlib"));
const utils_1 = require("./utils");
/** Fusion design archives: .f3d is a ZIP (entries usually Zstandard, method 93); .f3z is a ZIP of .f3d files. */
exports.ARCHIVE_EXTENSIONS = ['.f3d', '.f3z'];
const METHOD_STORED = 0;
const METHOD_DEFLATE = 8;
const METHOD_ZSTD = 93;
const SIG_EOCD = 0x06054b50;
const SIG_ZIP64_LOCATOR = 0x07064b50;
const SIG_ZIP64_EOCD = 0x06064b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_LOCAL = 0x04034b50;
/** Archive contents are untrusted: cap decompressed sizes to avoid zip bombs. */
const MAX_MCH_BYTES = 64 * 1024 * 1024;
const MAX_NESTED_ARCHIVE_BYTES = 1024 * 1024 * 1024;
const MAX_NESTING_DEPTH = 2;
const EXTRACT_DIR = path.join(os.tmpdir(), 'AutodeskPostUtility', 'ArchiveMachines');
function isFusionArchive(filePath) {
    const lower = (filePath || '').toLowerCase();
    return exports.ARCHIVE_EXTENSIONS.some(ext => lower.endsWith(ext));
}
function fileSource(fd, size) {
    return {
        size,
        read(offset, length) {
            const buf = Buffer.alloc(length);
            let done = 0;
            while (done < length) {
                const n = fs.readSync(fd, buf, done, length - done, offset + done);
                if (n === 0)
                    throw new Error('Unexpected end of archive');
                done += n;
            }
            return buf;
        },
    };
}
function bufferSource(buf) {
    return {
        size: buf.length,
        read(offset, length) {
            if (offset < 0 || offset + length > buf.length)
                throw new Error('Unexpected end of archive');
            return buf.subarray(offset, offset + length);
        },
    };
}
/** Reads the ZIP central directory and returns { name, method, compressedSize, size, localOffset } per file entry. */
function listEntries(src) {
    const tailLen = Math.min(src.size, 22 + 0xffff);
    const tailStart = src.size - tailLen;
    const tail = src.read(tailStart, tailLen);
    let eocd = -1;
    for (let i = tail.length - 22; i >= 0; i--) {
        if (tail.readUInt32LE(i) === SIG_EOCD) {
            eocd = i;
            break;
        }
    }
    if (eocd < 0)
        throw new Error('Not a ZIP archive');
    let count = tail.readUInt16LE(eocd + 10);
    let cdSize = tail.readUInt32LE(eocd + 12);
    let cdOffset = tail.readUInt32LE(eocd + 16);
    if (cdOffset === 0xffffffff || count === 0xffff) {
        const loc = eocd - 20;
        if (loc >= 0 && tail.readUInt32LE(loc) === SIG_ZIP64_LOCATOR) {
            const z64Offset = Number(tail.readBigUInt64LE(loc + 8));
            const z64 = src.read(z64Offset, 56);
            if (z64.readUInt32LE(0) !== SIG_ZIP64_EOCD)
                throw new Error('Corrupt ZIP64 directory');
            count = Number(z64.readBigUInt64LE(32));
            cdSize = Number(z64.readBigUInt64LE(40));
            cdOffset = Number(z64.readBigUInt64LE(48));
        }
    }
    const cd = src.read(cdOffset, cdSize);
    const entries = [];
    let p = 0;
    for (let i = 0; i < count && p + 46 <= cd.length; i++) {
        if (cd.readUInt32LE(p) !== SIG_CENTRAL)
            throw new Error('Corrupt ZIP central directory');
        const method = cd.readUInt16LE(p + 10);
        let compressedSize = cd.readUInt32LE(p + 20);
        let size = cd.readUInt32LE(p + 24);
        const nameLen = cd.readUInt16LE(p + 28);
        const extraLen = cd.readUInt16LE(p + 30);
        const commentLen = cd.readUInt16LE(p + 32);
        let localOffset = cd.readUInt32LE(p + 42);
        const name = cd.subarray(p + 46, p + 46 + nameLen).toString('utf-8');
        let e = p + 46 + nameLen;
        const extraEnd = e + extraLen;
        while (e + 4 <= extraEnd) {
            const id = cd.readUInt16LE(e);
            const len = cd.readUInt16LE(e + 2);
            if (id === 0x0001) {
                let q = e + 4;
                if (size === 0xffffffff) { size = Number(cd.readBigUInt64LE(q)); q += 8; }
                if (compressedSize === 0xffffffff) { compressedSize = Number(cd.readBigUInt64LE(q)); q += 8; }
                if (localOffset === 0xffffffff) { localOffset = Number(cd.readBigUInt64LE(q)); }
            }
            e += 4 + len;
        }
        if (!name.endsWith('/'))
            entries.push({ name, method, compressedSize, size, localOffset });
        p = extraEnd + commentLen;
    }
    return entries;
}
function readEntry(src, entry, maxBytes) {
    if (entry.size > maxBytes)
        throw new Error(`Archive entry too large: ${entry.name}`);
    const local = src.read(entry.localOffset, 30);
    if (local.readUInt32LE(0) !== SIG_LOCAL)
        throw new Error(`Corrupt ZIP entry: ${entry.name}`);
    const dataStart = entry.localOffset + 30 + local.readUInt16LE(26) + local.readUInt16LE(28);
    const raw = src.read(dataStart, entry.compressedSize);
    switch (entry.method) {
        case METHOD_STORED:
            return raw;
        case METHOD_DEFLATE:
            return zlib.inflateRawSync(raw, { maxOutputLength: maxBytes });
        case METHOD_ZSTD:
            if (typeof zlib.zstdDecompressSync !== 'function')
                throw new Error('This editor\'s Node.js runtime has no Zstandard support, which Fusion archives require. Update VS Code/Cursor.');
            return zlib.zstdDecompressSync(raw, { maxOutputLength: maxBytes });
        default:
            throw new Error(`Unsupported compression method ${entry.method} for ${entry.name}`);
    }
}
function isMchEntry(name) {
    return name.toLowerCase().endsWith('.mch');
}
/** Prefers the active machine asset when a design carries several. */
function pickMchEntry(entries) {
    const mchs = entries.filter(e => isMchEntry(e.name));
    return mchs.find(e => e.name.includes('[Active]')) ?? mchs[0];
}
/** Depth-first search for a .mch inside src and nested .f3d/.f3z entries. Returns the .mch bytes or undefined. */
function findMch(src, depth) {
    const entries = listEntries(src);
    const mch = pickMchEntry(entries);
    if (mch)
        return readEntry(src, mch, MAX_MCH_BYTES);
    if (depth >= MAX_NESTING_DEPTH)
        return undefined;
    for (const entry of entries) {
        if (!isFusionArchive(entry.name))
            continue;
        const nested = readEntry(src, entry, MAX_NESTED_ARCHIVE_BYTES);
        const found = findMch(bufferSource(nested), depth + 1);
        if (found)
            return found;
    }
    return undefined;
}
function withArchive(archivePath, fn) {
    const fd = fs.openSync(archivePath, 'r');
    try {
        return fn(fileSource(fd, fs.fstatSync(fd).size));
    }
    finally {
        fs.closeSync(fd);
    }
}
function statKey(archivePath) {
    const st = fs.statSync(archivePath);
    return `${st.mtimeMs}:${st.size}`;
}
const _containsCache = new Map();
/** Cheap check (central directory only, unless the .mch is inside a nested design) used to hide archives with no machine. */
function archiveContainsMch(archivePath) {
    try {
        const key = statKey(archivePath);
        const cached = _containsCache.get(archivePath);
        if (cached && cached.key === key)
            return cached.value;
        const value = withArchive(archivePath, src => {
            const entries = listEntries(src);
            if (entries.some(e => isMchEntry(e.name)))
                return true;
            return entries.some(e => isFusionArchive(e.name)) && findMch(src, 0) !== undefined;
        });
        _containsCache.set(archivePath, { key, value });
        return value;
    }
    catch {
        return false;
    }
}
/** Extracts the machine definition from a .f3d/.f3z into a temp .mch and returns its path. Throws with a user-facing message on failure. */
function extractMchFromArchive(archivePath) {
    const key = statKey(archivePath);
    // The output name is derived from a hash, never from archive entry names.
    const outPath = path.join(EXTRACT_DIR, `${(0, utils_1.getHash)(`${path.resolve(archivePath)}|${key}`)}.mch`);
    if ((0, utils_1.fileExists)(outPath))
        return outPath;
    const data = withArchive(archivePath, src => findMch(src, 0));
    if (!data)
        throw new Error(`No machine definition (.mch) found in ${path.basename(archivePath)}`);
    (0, utils_1.ensureDir)(EXTRACT_DIR);
    const tmpPath = `${outPath}.${process.pid}.tmp`;
    fs.writeFileSync(tmpPath, data);
    fs.renameSync(tmpPath, outPath);
    return outPath;
}
/** Returns a path to a readable .mch/.machine file: the input itself, or the .mch extracted from a Fusion archive. */
function resolveMachineFile(filePath) {
    return isFusionArchive(filePath) ? extractMchFromArchive(filePath) : filePath;
}
function tryResolveMachineFile(filePath) {
    try {
        return resolveMachineFile(filePath);
    }
    catch {
        return undefined;
    }
}
