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
exports.fetchOnlineMachines = fetchOnlineMachines;
exports.getMachineCacheDir = getMachineCacheDir;
exports.enrichMachinesFromMchCache = enrichMachinesFromMchCache;
exports.downloadAllMachinesToCache = downloadAllMachinesToCache;
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const utils_1 = require("./utils");
const MACHINES_JSON_URL = 'https://cam.autodesk.com/machines/machines/machines.json';
const DOWNLOAD_BASE = 'https://cam.autodesk.com/machines/download.php?name=';
const DOWNLOAD_CONCURRENCY = 25;
const HTTPS_AGENT = new https.Agent({ keepAlive: true, maxSockets: 32 });
const MAX_REDIRECTS = 5;
let cachedMachines;
let cacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MACHINING_TO_PURPOSE = {
    MILLING: 'Milling',
    ADDITIVE: 'Additive',
    TURNING: 'Turning',
    'MILL/TURN': 'Mill / Turn',
    JET: 'Waterjet / Laser / Plasma',
    INSPECTION: 'Inspection',
};
function machiningToPurpose(machining) {
    if (!machining)
        return 'Other';
    return MACHINING_TO_PURPOSE[machining] ?? machining;
}
async function fetchOnlineMachines() {
    if (cachedMachines && (Date.now() - cacheTime) < CACHE_TTL_MS) {
        return cachedMachines;
    }
    const json = await httpGet(MACHINES_JSON_URL);
    cachedMachines = parseMachineList(json);
    cacheTime = Date.now();
    return cachedMachines;
}
function getMachineCacheDir() {
    return path.join(os.tmpdir(), 'AutodeskPostUtility', 'MachineCache');
}
const MCH_PURPOSE_MAP = {
    milling: 'Milling',
    additive: 'Additive',
    turning: 'Turning',
    'mill/turn': 'Mill / Turn',
    jet: 'Waterjet / Laser / Plasma',
    inspection: 'Inspection',
};
/** Infer kinematics from kinematics.default.parts only: for each rotary, find descendant with id/type head or table; return Head-Head | Head-Table | Table-Table. */
function getKinematicsFromMch(mch) {
    const parts = mch.kinematics?.default?.parts;
    if (!Array.isArray(parts))
        return undefined;
    /** Returns 'head' | 'table' if node or any descendant has type or id head/table; else undefined. */
    function placementOf(node) {
        if (!node || typeof node !== 'object')
            return undefined;
        const tid = (node.type || node.id || '').toString().toLowerCase();
        if (tid === 'head')
            return 'head';
        if (tid === 'table')
            return 'table';
        if (Array.isArray(node.parts)) {
            for (const child of node.parts) {
                const p = placementOf(child);
                if (p)
                    return p;
            }
        }
        return undefined;
    }
    const placements = [];
    function walk(arr) {
        for (const p of arr) {
            if (!p || typeof p !== 'object')
                continue;
            if (p.type === 'rotary') {
                const pl = placementOf(p);
                if (pl)
                    placements.push(pl);
            }
            if (Array.isArray(p.parts))
                walk(p.parts);
        }
    }
    walk(parts);
    if (placements.length === 0)
        return undefined;
    const hasHead = placements.includes('head');
    const hasTable = placements.includes('table');
    if (hasHead && hasTable)
        return 'Head-Table';
    if (hasTable && !hasHead)
        return 'Table-Table';
    if (hasHead && !hasTable)
        return 'Head-Head';
    return undefined;
}
function readAxisCountAndPurposeFromMchFile(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const mch = JSON.parse(raw);
        let purpose = 'Other';
        const caps = mch.general?.capabilities;
        if (Array.isArray(caps) && caps[0]) {
            const c = String(caps[0]).toLowerCase();
            purpose = MCH_PURPOSE_MAP[c] || (caps[0].charAt(0).toUpperCase() + caps[0].slice(1));
        }
        const parts = mch.controller?.default?.parts || mch.controller?.synced_configuration?.parts;
        let axisCount;
        let hasTcp;
        if (parts && typeof parts === 'object') {
            const linearOrRotary = (k) => /^[A-Z]$/i.test(k) || /^rotary_\d+$/.test(k);
            const axisKeys = Object.keys(parts).filter(linearOrRotary);
            const n = axisKeys.length;
            if (n >= 3 && n <= 9)
                axisCount = n;
            hasTcp = Object.values(parts).some(p => p && p.tcp === true);
        }
        const kinematics = getKinematicsFromMch(mch);
        const vendor = (mch.general?.vendor && String(mch.general.vendor).trim()) || undefined;
        return { axisCount, purpose, kinematics, hasTcp, vendor };
    }
    catch {
        return null;
    }
}
function enrichMachinesFromMchCache(machines, cacheDir) {
    if (!machines || !cacheDir)
        return;
    for (const m of machines) {
        const cachedPath = path.join(cacheDir, m.filename);
        if (!(0, utils_1.fileExists)(cachedPath))
            continue;
        const info = readAxisCountAndPurposeFromMchFile(cachedPath);
        if (info) {
            if (info.axisCount != null)
                m.axisCount = info.axisCount;
            if (info.purpose != null)
                m.purpose = info.purpose;
            if (info.kinematics != null)
                m.kinematics = info.kinematics;
            if (info.hasTcp != null)
                m.hasTcp = info.hasTcp;
            if (info.vendor != null)
                m.vendor = info.vendor;
        }
    }
}
/** Run at most `concurrency` promises at a time; when one settles, start the next from the queue. */
async function runWithConcurrency(tasks, concurrency, onSettle) {
    let index = 0;
    async function runNext() {
        const i = index++;
        if (i >= tasks.length)
            return;
        let err = null;
        try {
            await tasks[i]();
        }
        catch (e) {
            err = e;
        }
        if (onSettle)
            onSettle(i, err);
        await runNext();
    }
    const workers = Math.min(concurrency, tasks.length);
    await Promise.all(Array.from({ length: workers }, () => runNext()));
}
async function downloadAllMachinesToCache(progressCallback) {
    const machines = await fetchOnlineMachines();
    const cacheDir = getMachineCacheDir();
    (0, utils_1.ensureDir)(cacheDir);
    const total = machines.length;
    let done = 0;
    const toDownload = machines.map(m => {
        const destPath = path.join(cacheDir, m.filename);
        return () => {
            if ((0, utils_1.fileExists)(destPath))
                return Promise.resolve();
            return httpGetBuffer(m.downloadUrl).then(data => {
                fs.writeFileSync(destPath, data);
            });
        };
    });
    await runWithConcurrency(toDownload, DOWNLOAD_CONCURRENCY, (i, err) => {
        done++;
        if (progressCallback)
            progressCallback(done, total, machines[i].name, err);
    });
    return { downloaded: total, cacheDir };
}
/** Infer 3, 4, or 5 from text like "3-axis", "5 axis", "4-axis milling". */
function inferAxisCount(name, description) {
    const text = `${name} ${description || ''}`;
    const m = text.match(/\b(3|4|5)[-\s]*axis\b/i);
    if (m)
        return parseInt(m[1], 10);
    return undefined;
}
/** True only for a plain file name that stays inside the directory it is joined to. */
function isSafeCacheFilename(name) {
    return typeof name === 'string' && name.length > 0 && name.length <= 200 &&
        name !== '.' && name !== '..' && !path.isAbsolute(name) &&
        name === path.basename(name) && !/[\u0000-\u001f:*?"<>|]/.test(name);
}
function parseMachineList(json) {
    const machines = [];
    let entries;
    try {
        entries = JSON.parse(json);
    }
    catch {
        return [];
    }
    if (!Array.isArray(entries))
        return [];
    for (const m of entries) {
        const filename = m.filename?.trim();
        if (!filename)
            continue;
        if (!isSafeCacheFilename(filename))
            continue;
        const name = [m.vendor, m.model].filter(Boolean).join(' ') || m.description || filename;
        const purpose = machiningToPurpose(m.machining);
        const downloadUrl = DOWNLOAD_BASE + encodeURIComponent(filename);
        const rawAxis = m.axes ?? m.axis;
        const axisCount = (typeof rawAxis === 'number' && [3, 4, 5].includes(rawAxis))
            ? rawAxis
            : inferAxisCount(name, m.description);
        machines.push({
            name: name.trim() || filename,
            filename,
            purpose,
            downloadUrl,
            thumbnail: m.thumbnail,
            axisCount,
            vendor: (m.vendor && String(m.vendor).trim()) || '',
        });
    }
    return machines;
}
function httpGet(url, redirectsLeft = MAX_REDIRECTS) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Autodesk-Post-Utility/5.0' } }, res => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                const loc = res.headers.location;
                if (loc) {
                    if (redirectsLeft <= 0) {
                        reject(new Error('Too many redirects'));
                        return;
                    }
                    httpGet(loc.startsWith('http') ? loc : `https://cam.autodesk.com${loc}`, redirectsLeft - 1).then(resolve, reject);
                    return;
                }
            }
            if (res.statusCode && res.statusCode >= 400) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}
function httpGetBuffer(url, redirectsLeft = MAX_REDIRECTS) {
    const opts = { agent: HTTPS_AGENT, headers: { 'User-Agent': 'Autodesk-Post-Utility/5.0' } };
    return new Promise((resolve, reject) => {
        https.get(url, opts, res => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                const loc = res.headers.location;
                if (loc) {
                    if (redirectsLeft <= 0) {
                        reject(new Error('Too many redirects'));
                        return;
                    }
                    httpGetBuffer(loc.startsWith('http') ? loc : `https://cam.autodesk.com${loc}`, redirectsLeft - 1).then(resolve, reject);
                    return;
                }
            }
            if (res.statusCode && res.statusCode >= 400) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            const chunks = [];
            res.on('data', (chunk) => { chunks.push(chunk); });
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}
//# sourceMappingURL=onlineLibrary.js.map