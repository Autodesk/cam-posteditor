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
exports.delay = delay;
exports.execFileAsync = execFileAsync;
exports.fileExists = fileExists;
exports.ensureDir = ensureDir;
exports.removeFilesInFolder = removeFilesInFolder;
exports.copyFolderSync = copyFolderSync;
exports.getFilesFromDirRecursive = getFilesFromDirRecursive;
exports.f3dHasMachine = f3dHasMachine;
exports.getHash = getHash;
exports.showOutputFile = showOutputFile;
exports.deepClone = deepClone;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
const crypto = __importStar(require("crypto"));
const vscode = __importStar(require("vscode"));
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function execFileAsync(file, args, options) {
    return new Promise((resolve, reject) => {
        cp.execFile(file, args, options, (err, stdout, stderr) => {
            if (err) {
                const e = err;
                e.stdout = stdout?.toString() ?? '';
                e.stderr = stderr?.toString() ?? '';
                reject(err);
            }
            else {
                resolve({
                    stdout: stdout?.toString() ?? '',
                    stderr: stderr?.toString() ?? '',
                });
            }
        });
    });
}
function fileExists(filePath) {
    if (!filePath)
        return false;
    try {
        return fs.existsSync(filePath);
    }
    catch {
        return false;
    }
}
function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}
function removeFilesInFolder(dir) {
    if (!fileExists(dir))
        return;
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.lstatSync(full).isFile()) {
            fs.unlinkSync(full);
        }
        else {
            removeFilesInFolder(full);
        }
    }
}
function copyFolderSync(from, to) {
    ensureDir(to);
    for (const entry of fs.readdirSync(from)) {
        const src = path.join(from, entry);
        const dest = path.join(to, entry);
        if (fs.lstatSync(src).isFile()) {
            fs.copyFileSync(src, dest);
        }
        else {
            copyFolderSync(src, dest);
        }
    }
}
function getFilesFromDirRecursive(dir, extensions) {
    if (!fileExists(dir))
        return [];
    const result = [];
    const walk = (current) => {
        try {
            for (const d of fs.readdirSync(current, { withFileTypes: true })) {
                const full = path.join(current, d.name);
                const ext = path.extname(d.name).toLowerCase();
                if (d.isFile() && extensions.includes(ext)) {
                    if (ext !== '.f3d' || f3dHasMachine(full))
                        result.push(path.relative(dir, full));
                }
                else if (d.isDirectory()) {
                    walk(full);
                }
            }
        }
        catch { /* skip inaccessible directories */ }
    };
    walk(dir);
    return result;
}
const F3D_MACHINE_ENTRIES = new Set([
    'MachineAsset/Machines/simulation.mch',
    'MachineAsset[Active]/Machines/simulation.mch',
]);
const f3dMachineCache = new Map();
/**
 * True if the Fusion design (.f3d) contains a machine definition (.mch) where the post engine looks for it.
 * Only the ZIP central directory is read, nothing is decompressed. Archive contents are untrusted: all offsets
 * are bounds-checked and a broken or non-ZIP file counts as "no machine".
 */
function f3dHasMachine(file) {
    let fd;
    try {
        const stat = fs.statSync(file);
        const key = `${file}|${stat.mtimeMs}|${stat.size}`;
        if (f3dMachineCache.has(key))
            return f3dMachineCache.get(key);
        let found = false;
        fd = fs.openSync(file, 'r');
        const tailSize = Math.min(stat.size, 22 + 0xffff + 20);
        const tail = Buffer.alloc(tailSize);
        fs.readSync(fd, tail, 0, tailSize, stat.size - tailSize);
        const eocd = tail.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
        if (eocd >= 0 && eocd + 22 <= tailSize) {
            let count = tail.readUInt16LE(eocd + 10);
            let dirSize = tail.readUInt32LE(eocd + 12);
            let dirOffset = tail.readUInt32LE(eocd + 16);
            let valid = true;
            if (dirOffset === 0xffffffff || dirSize === 0xffffffff || count === 0xffff) {
                const loc = eocd - 20;
                valid = loc >= 0 && tail.readUInt32LE(loc) === 0x07064b50;
                if (valid) {
                    const z64Offset = Number(tail.readBigUInt64LE(loc + 8));
                    const z64 = Buffer.alloc(56);
                    valid = z64Offset + 56 <= stat.size && fs.readSync(fd, z64, 0, 56, z64Offset) === 56 && z64.readUInt32LE(0) === 0x06064b50;
                    if (valid) {
                        count = Number(z64.readBigUInt64LE(32));
                        dirSize = Number(z64.readBigUInt64LE(40));
                        dirOffset = Number(z64.readBigUInt64LE(48));
                    }
                }
            }
            if (valid && dirSize <= 64 * 1024 * 1024 && dirOffset + dirSize <= stat.size) {
                const dir = Buffer.alloc(dirSize);
                fs.readSync(fd, dir, 0, dirSize, dirOffset);
                for (let p = 0, i = 0; i < count && p + 46 <= dirSize && dir.readUInt32LE(p) === 0x02014b50; i++) {
                    const nameLen = dir.readUInt16LE(p + 28);
                    if (F3D_MACHINE_ENTRIES.has(dir.toString('utf8', p + 46, Math.min(dirSize, p + 46 + nameLen)))) {
                        found = true;
                        break;
                    }
                    p += 46 + nameLen + dir.readUInt16LE(p + 30) + dir.readUInt16LE(p + 32);
                }
            }
        }
        f3dMachineCache.set(key, found);
        return found;
    }
    catch {
        return false;
    }
    finally {
        if (fd !== undefined) {
            try {
                fs.closeSync(fd);
            }
            catch { /* already closed */ }
        }
    }
}
function getHash(input) {
    return crypto.createHash('md5').update(input).digest('hex');
}
async function showOutputFile(filePath, column) {
    const norm = (p) => path.normalize(p).toLowerCase();
    const targetNorm = norm(filePath);
    const uri = vscode.Uri.file(filePath);
    const existingEditor = vscode.window.visibleTextEditors.find(e => norm(e.document.uri.fsPath) === targetNorm);
    if (existingEditor) {
        const prevActive = vscode.window.activeTextEditor;
        await vscode.window.showTextDocument(existingEditor.document, { viewColumn: existingEditor.viewColumn, preserveFocus: false });
        await vscode.commands.executeCommand('workbench.action.files.revert');
        if (prevActive && prevActive !== existingEditor) {
            await vscode.window.showTextDocument(prevActive.document, { viewColumn: prevActive.viewColumn, preserveFocus: false });
        }
    }
    else {
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { viewColumn: column, preserveFocus: true, preview: false });
    }
}
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
//# sourceMappingURL=utils.js.map