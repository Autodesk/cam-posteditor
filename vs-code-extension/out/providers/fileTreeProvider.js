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
exports.FileTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const config = __importStar(require("../config"));
const utils_1 = require("../utils");
const onlineLibrary_1 = require("../onlineLibrary");
class FileTreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState, filePath = '', 
    /** When set (checkbox mode), tree parent path for unique id and getParent. */
    treeParentPath) {
        super(label, collapsibleState);
        this.filePath = filePath;
        this.treeParentPath = treeParentPath;
    }
}
const ALL_FILES = 'All files';
const SELECTED_FILES = 'Selected files';
const LOCAL_FUSION = 'Local';
const ONLINE_LIBRARY = 'Online Library';
const ONLINE_VENDOR_PREFIX = '__online_vendor:';
const ONLINE_PURPOSE_PREFIX = '__online_purpose:';
const ONLINE_PURPOSE_VENDOR_PREFIX = '__online_pv:';
const SEARCH_RESULTS = '__search_results__';
const PURPOSE_SORT_ORDER = ['Milling', 'Turning', 'Mill / Turn', 'Additive', 'Waterjet / Laser / Plasma', 'Inspection', 'Other'];
const _mchCache = new Map();
function getCachedMch(filePath) {
    const cached = _mchCache.get(filePath);
    try {
        const mtime = fs.statSync(filePath).mtime.getTime();
        if (cached && cached.mtime === mtime)
            return cached.data;
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        _mchCache.set(filePath, { mtime, data });
        return data;
    }
    catch {
        _mchCache.delete(filePath);
        return null;
    }
}
/** Escapes Markdown control characters: every field below comes out of a .mch file we did not write. */
function escapeMarkdownText(text) {
    return String(text).replace(/[\\`*_{}[\]()#+\-.!<>|~]/g, '\\$&').replace(/[\r\n]+/g, ' ');
}
function makeMachineTooltip(name, subtitle, imageUrl, info) {
    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${escapeMarkdownText(name)}**\n`);
    if (info?.description) {
        const desc = info.description.replace(/\s*\*\*\d+-axis\*\*\s*$/i, '').replace(/\s+\d+-axis\s*$/i, '').trim();
        if (desc)
            md.appendMarkdown(`\n\n${escapeMarkdownText(desc)}\n\n`);
    }
    if (info) {
        const lines = [];
        if (info.vendor)
            lines.push(`**Vendor:** ${escapeMarkdownText(info.vendor)}`);
        if (info.purpose && info.purpose !== 'Other')
            lines.push(`**Purpose:** ${escapeMarkdownText(info.purpose)}`);
        const kinematicsPart = [info.axisCount != null ? `${info.axisCount}-axis` : '', info.kinematics].filter(Boolean).join(' ');
        if (kinematicsPart)
            lines.push(`**Kinematics:** ${escapeMarkdownText(kinematicsPart)}`);
        if (info.rotaryRanges && info.rotaryRanges.length > 0) {
            const rangesText = info.rotaryRanges.length > 2
                ? info.rotaryRanges.slice(0, 2).join('; ') + '; …'
                : info.rotaryRanges.join('; ');
            lines.push(`**Rotary:** ${escapeMarkdownText(rangesText)}`);
        }
        if (info.hasTcp != null)
            lines.push(`**TCP:** ${info.hasTcp ? 'Yes' : 'No'}`);
        if (info.feedrateMethod)
            lines.push(`**Feedrate:** ${escapeMarkdownText(info.feedrateMethod)}`);
        if (lines.length > 0)
            md.appendMarkdown(lines.join('  \n') + '\n\n');
    }
    if (subtitle && subtitle !== `File: ${name}`)
        md.appendMarkdown(escapeMarkdownText(subtitle));
    if (imageUrl)
        md.appendMarkdown(`\n\n![preview](${imageUrl})`);
    return md;
}
/** Standard axis letters for rotary by coordinate index (Fusion convention). */
const ROTARY_COORD_TO_LETTER = ['A', 'B', 'C', 'U', 'V', 'W'];
/** Collect all rotary axes from kinematics tree: { id, name, min, max } (min/max optional). */
function collectRotaryAxesFromKinematics(parts) {
    const out = [];
    if (!Array.isArray(parts))
        return out;
    function walk(arr) {
        for (const p of arr) {
            if (!p || typeof p !== 'object')
                continue;
            if (p.type === 'rotary') {
                out.push({
                    id: p.id,
                    name: p.name || p.id || 'rotary',
                    min: typeof p.min === 'number' ? p.min : undefined,
                    max: typeof p.max === 'number' ? p.max : undefined,
                });
            }
            if (Array.isArray(p.parts))
                walk(p.parts);
        }
    }
    walk(parts);
    return out;
}
function buildRotaryRanges(mch) {
    const kinParts = mch.kinematics?.default?.parts;
    const rotaryAxes = collectRotaryAxesFromKinematics(kinParts);
    if (rotaryAxes.length === 0)
        return [];
    const ctrlParts = mch.controller?.default?.parts || mch.controller?.synced_configuration?.parts;
    const ranges = [];
    for (const ax of rotaryAxes) {
        const cp = ctrlParts && ctrlParts[ax.id];
        const coord = cp != null && typeof cp.coordinate === 'number' && cp.coordinate >= 0 && cp.coordinate < ROTARY_COORD_TO_LETTER.length
            ? cp.coordinate
            : undefined;
        const label = coord !== undefined
            ? ROTARY_COORD_TO_LETTER[coord]
            : (ax.name || ax.id);
        let text;
        if (typeof ax.min === 'number' && typeof ax.max === 'number') {
            text = `${ax.min}…${ax.max}`;
        }
        else {
            const wrapMin = cp && typeof cp.wrap_around_at_min === 'number' ? cp.wrap_around_at_min : undefined;
            const wrapMax = cp && typeof cp.wrap_around_at_max === 'number' ? cp.wrap_around_at_max : undefined;
            if (wrapMin !== undefined && wrapMax !== undefined)
                text = `cyclic (${wrapMin}…${wrapMax})`;
            else
                text = 'unlimited';
        }
        ranges.push(`${label}: ${text}`);
    }
    return ranges;
}
/** Always return undefined so callers use the filename instead of vendor/model. */
function getMachineDisplayLabel(filePath) {
    return undefined;
}
function getMachineTooltipInfo(filePath) {
    const mch = getCachedMch(filePath);
    if (!mch)
        return null;
    const base = getAxisCountAndPurposeFromMch(filePath);
    if (!base)
        return null;
    let rotaryRanges = buildRotaryRanges(mch);
    let feedrateMethod = undefined;
    const feedrateObj = mch.multiaxis?.default?.feedrate;
    if (feedrateObj && typeof feedrateObj.method === 'string' && feedrateObj.method.trim())
        feedrateMethod = feedrateObj.method;
    const description = (mch.general?.description && String(mch.general.description).trim()) || undefined;
    return {
        ...base,
        rotaryRanges: rotaryRanges.length ? rotaryRanges : undefined,
        feedrateMethod,
        description,
    };
}
function getEmbeddedImageFromMch(filePath) {
    const mch = getCachedMch(filePath);
    if (!mch)
        return undefined;
    const b64 = mch.fusion?.default?.image;
    const cleaned = typeof b64 === 'string' ? b64.replace(/\s+/g, '') : '';
    if (!cleaned || !/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned))
        return undefined;
    return `data:image/png;base64,${cleaned}`;
}
/** Exclude .machine files that use default Haas vendors from Online Library. */
function isExcludedMachineFile(fullPath) {
    if (!fullPath || !fullPath.toLowerCase().endsWith('.machine'))
        return false;
    try {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        return raw.includes('<vendor>HAAS_machine_default</vendor>') ||
            raw.includes('<vendor>HAAS_rotary_default</vendor>');
    }
    catch {
        return false;
    }
}

const MCH_PURPOSE_MAP = {
    milling: 'Milling',
    additive: 'Additive',
    turning: 'Turning',
    'mill/turn': 'Mill / Turn',
    jet: 'Waterjet / Laser / Plasma',
    inspection: 'Inspection',
};
/** Infer kinematics from kinematics.default.parts only: for each rotary, find descendant type head/table; return Head-Head | Head-Table | Table-Table. */
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
/** Read axis count, purpose, kinematics, and TCP from a .mch or .machine file. Returns { axisCount, purpose, kinematics, hasTcp } or null. Purely from .mch JSON data. */
function getAxisCountAndPurposeFromMch(filePath) {
    try {
        const mch = getCachedMch(filePath);
        if (!mch)
            return null;
        let purpose = 'Other';
        const caps = mch.general?.capabilities;
        if (Array.isArray(caps) && caps[0]) {
            const c = String(caps[0]).toLowerCase();
            purpose = MCH_PURPOSE_MAP[c] || (caps[0].charAt(0).toUpperCase() + caps[0].slice(1));
        }
        const defaultParts = mch.controller?.default?.parts;
        const syncedParts = mch.controller?.synced_configuration?.parts;
        const parts = defaultParts || syncedParts;
        let axisCount;
        let hasTcp;
        if (parts && typeof parts === 'object') {
            const linearOrRotary = (k) => /^[A-Z]$/i.test(k) || /^rotary_\d+$/.test(k);
            const axisKeys = Object.keys(parts).filter(linearOrRotary);
            const n = axisKeys.length;
            if (n >= 3 && n <= 9)
                axisCount = n;
            const rotaryLetters = /^[ABCUVW]$/i;
            const allRotaryKeys = new Set([
                ...Object.keys(defaultParts || {}).filter(k => rotaryLetters.test(k) || /^rotary_\d+$/.test(k)),
                ...Object.keys(syncedParts || {}).filter(k => rotaryLetters.test(k) || /^rotary_\d+$/.test(k)),
            ]);
            if (allRotaryKeys.size > 0) {
                const hasTcpIn = (partObj, k) => partObj && partObj[k] && partObj[k].tcp === true;
                hasTcp = [...allRotaryKeys].some(k => hasTcpIn(defaultParts, k) || hasTcpIn(syncedParts, k));
            }
        }
        const kinematics = getKinematicsFromMch(mch);
        const vendor = (mch.general?.vendor && String(mch.general.vendor).trim()) || undefined;
        return { axisCount, purpose, kinematics, hasTcp, vendor };
    }
    catch {
        return null;
    }
}
const ALL_FILES_PATH = '__all__';
const RECENT_PATH = '__recent__';
const RECENT_LABEL = 'Recently used';
const RECENT_MAX = 10;
class FileTreeProvider {
    setFilter(text) {
        this.filterText = (text || '').trim().toLowerCase();
        this._matchingDescendantCache = null;
        this.refreshTree(true);
    }
    clearFilter() {
        let changed = false;
        if (this.filterText) {
            this.filterText = '';
            this._matchingDescendantCache = null;
            changed = true;
        }
        if (this.cfg.includeOnlineLibrary && this.onlineLibraryFilter) {
            this.onlineLibraryFilter = null;
            changed = true;
        }
        if (changed)
            this.refreshTree(true);
    }
    getFilter() {
        return this.filterText;
    }
    setOnlineLibraryFilter(filter) {
        this.onlineLibraryFilter = filter;
        this.refreshTree(true);
    }
    getOnlineLibraryFilter() {
        return this.onlineLibraryFilter;
    }
    setOnlineLibraryExpandCallback(fn) {
        this._onOnlineLibraryExpandWhenEmpty = fn;
    }
    applyOnlineLibraryFilter(machines) {
        if (!this.cfg.includeOnlineLibrary || !this.onlineLibraryFilter)
            return machines;
        const { axes, purposes, kinematics = [], tcp, vendors = [] } = this.onlineLibraryFilter;
        return machines.filter(m => {
            const axisOk = axes.length === 0 || (m.axisCount != null && axes.includes(m.axisCount));
            const purposeOk = purposes.length === 0 || purposes.includes(m.purpose || 'Other');
            const kinematicsOk = kinematics.length === 0 || (m.kinematics && kinematics.includes(m.kinematics));
            const tcpOk = tcp == null || (m.hasTcp === tcp);
            const vendorOk = vendors.length === 0 || (m.vendor && vendors.includes(m.vendor));
            return axisOk && purposeOk && kinematicsOk && tcpOk && vendorOk;
        });
    }
    /** True if no machine filter is set, or if the machine file at fullPath matches the current filter. Uses only .mch data. */
    machineMatchesAxisPurposeFilter(fullPath) {
        if (!this.onlineLibraryFilter || !fullPath)
            return true;
        if (!this.isMatchingFile(path.basename(fullPath)))
            return true;
        const info = getAxisCountAndPurposeFromMch(fullPath);
        if (!info)
            return true;
        const { axes, purposes, kinematics = [], tcp, vendors = [] } = this.onlineLibraryFilter;
        const axisOk = axes.length === 0 || (info.axisCount != null && axes.includes(info.axisCount));
        const purposeOk = purposes.length === 0 || purposes.includes(info.purpose || 'Other');
        const kinematicsOk = kinematics.length === 0 || (info.kinematics && kinematics.includes(info.kinematics));
        const tcpOk = tcp == null || (info.hasTcp === tcp);
        const vendorOk = vendors.length === 0 || (info.vendor && vendors.includes(info.vendor));
        return axisOk && purposeOk && kinematicsOk && tcpOk && vendorOk;
    }
    /** True if dir contains at least one machine file that matches the machine filter (when set). */
    hasMatchingMachineDescendant(dirPath) {
        if (!this.onlineLibraryFilter || !(0, utils_1.fileExists)(dirPath))
            return true;
        try {
            const files = (0, utils_1.getFilesFromDirRecursive)(dirPath, this.cfg.fileExtensions);
            for (const rel of files) {
                const fullPath = path.join(dirPath, rel);
                if (isExcludedMachineFile(fullPath))
                    continue;
                if (this.machineMatchesAxisPurposeFilter(fullPath))
                    return true;
            }
        }
        catch {
            /* ignore */
        }
        return false;
    }
    matchesFilter(label, fullPath) {
        if (!this.filterText)
            return true;
        const searchText = label.toLowerCase();
        const pathText = fullPath ? fullPath.toLowerCase() : '';
        const combined = fullPath ? `${searchText} ${pathText}` : searchText;
        // Normalize for fuzzy match: ignore spaces, hyphens, underscores so "umc750" matches "umc-750" / "umc 750"
        const normalize = s => s.replace(/[\s\-_]+/g, '');
        const combinedNorm = normalize(combined);
        // Support tokenized search: "no tcp" matches "noTCP" or "table NoTCP machine"
        const tokens = this.filterText.split(/\s+/).filter(Boolean);
        return tokens.every(tok => {
            const tokNorm = normalize(tok);
            return combined.includes(tok) || (tokNorm.length > 0 && combinedNorm.includes(tokNorm));
        });
    }
    hasMatchingDescendant(dirPath) {
        if (!this.filterText || !(0, utils_1.fileExists)(dirPath))
            return false;
        if (!this._matchingDescendantCache)
            this._matchingDescendantCache = new Map();
        const cacheKey = `${this.filterText}\0${dirPath}`;
        if (this._matchingDescendantCache.has(cacheKey))
            return this._matchingDescendantCache.get(cacheKey);
        let result = false;
        try {
            const files = (0, utils_1.getFilesFromDirRecursive)(dirPath, this.cfg.fileExtensions);
            for (const rel of files) {
                const fullPath = path.join(dirPath, rel);
                const base = path.basename(rel);
                if (this.matchesFilter(base, fullPath)) {
                    result = true;
                    break;
                }
            }
        }
        catch { /* ignore */ }
        this._matchingDescendantCache.set(cacheKey, result);
        return result;
    }
    constructor(context, cfg) {
        this.context = context;
        this.cfg = cfg;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.files = [];
        this.fsWatchers = [];
        this.filterText = '';
        this.selectionMap = new Map();
        /** When set, online library list is filtered by axis and/or purpose. */
        this.onlineLibraryFilter = null;
        /** Optional callback when user expands Online Library and folder is empty: (refreshTree) => Promise<boolean>. Set by extension. */
        this._onOnlineLibraryExpandWhenEmpty = null;
        this.lastFileListHash = '';
        this.customFolderPaths = new Set();
        this.rootDir = path.join(context.extensionPath, 'res', cfg.rootDirName);
        this.loadFiles();
        this.lastFileListHash = this.computeFileListHash();
        // Primary: fs.watch for instant updates
        for (const dir of this.getWatchedDirs()) {
            this.watchDirectory(dir);
        }
        // Fallback: poll every 30s in case fs.watch misses something
        this.pollInterval = setInterval(() => {
            this.refreshTree();
        }, 30000);
        if (this.cfg.checkboxMode && this.cfg.selectionStorageKey !== 'regressionTestSelection') {
            this.restoreSelection();
        }
        context.subscriptions.push({ dispose: () => this.dispose() });
    }
    dispose() {
        for (const w of this.fsWatchers) {
            try {
                w.close();
            }
            catch { /* ignore */ }
        }
        this.fsWatchers.length = 0;
        if (this.refreshTimer)
            clearTimeout(this.refreshTimer);
        if (this.pollInterval)
            clearInterval(this.pollInterval);
    }
    watchDirectory(dir) {
        if (!(0, utils_1.fileExists)(dir))
            return;
        try {
            const watcher = fs.watch(dir, { recursive: true }, (_event, filename) => {
                if (this._suppressWatcherUntil && Date.now() < this._suppressWatcherUntil)
                    return;
                if (this.refreshTimer)
                    clearTimeout(this.refreshTimer);
                this.refreshTimer = setTimeout(() => {
                    this.refreshTree();
                }, 500);
            });
            watcher.on('error', () => { });
            this.fsWatchers.push(watcher);
        }
        catch { /* directory not watchable, polling fallback will cover it */ }
    }
    computeFileListHash() {
        const entries = [];
        for (const dir of this.getWatchedDirs()) {
            this.collectAllEntries(dir, entries);
        }
        return entries.sort().join('|');
    }
    /** Sorted list of vendor names from all machine files in watched dirs. Cached by file list hash; refetched when machines are added/removed. */
    getVendorListForFilter() {
        const hash = this.lastFileListHash || this.computeFileListHash();
        if (this._cachedVendorListHash === hash && this._cachedVendorList)
            return this._cachedVendorList;
        const vendorSet = new Set();
        for (const dir of this.getWatchedDirs()) {
            if (!(0, utils_1.fileExists)(dir))
                continue;
            try {
                const files = (0, utils_1.getFilesFromDirRecursive)(dir, this.cfg.fileExtensions);
                for (const rel of files) {
                    const fullPath = path.join(dir, rel);
                    if (isExcludedMachineFile(fullPath))
                        continue;
                    const v = getAxisCountAndPurposeFromMch(fullPath)?.vendor;
                    if (v && typeof v === 'string') {
                        const trimmed = v.trim();
                        if (trimmed)
                            vendorSet.add(trimmed);
                    }
                }
            }
            catch {
                /* skip dir */
            }
        }
        this._cachedVendorList = [...vendorSet].sort();
        this._cachedVendorListHash = hash;
        return this._cachedVendorList;
    }
    collectAllEntries(dir, result) {
        if (!(0, utils_1.fileExists)(dir))
            return;
        try {
            for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, d.name);
                if (d.isDirectory()) {
                    this.collectAllEntries(full, result);
                }
                else if (this.isMatchingFile(d.name)) {
                    result.push(full);
                }
            }
        }
        catch { /* skip */ }
    }
    getCustomFolders() {
        const stateKey = 'customFolders.' + this.cfg.settingsKey;
        const fromState = this.context.globalState.get(stateKey);
        if (Array.isArray(fromState) && fromState.length > 0)
            return fromState;
        const custom = config.get(this.cfg.settingsKey) ?? {};
        return Array.isArray(custom.folders) ? custom.folders : [];
    }
    getWatchedDirs() {
        const dirs = [this.rootDir];
        const folders = this.getCustomFolders().filter(f => (0, utils_1.fileExists)(f));
        if (folders.length)
            dirs.push(...folders);
        return dirs;
    }
    loadFiles() {
        this.files = [];
        this.customFolderPaths.clear();
        if ((0, utils_1.fileExists)(this.rootDir)) {
            this.files = this.findEntries(this.rootDir);
        }
        const existing = this.getCustomFolders().filter(f => (0, utils_1.fileExists)(f));
        if (existing.length > 0) {
            this.customFolderPaths = new Set(existing);
            // Only show top-level custom folders at root so subfolders (e.g. cnc/milling) appear under their parent, not at root
            const norm = (p) => path.normalize(p).toLowerCase() + path.sep;
            for (const folder of existing) {
                const isNested = existing.some(other => other !== folder && norm(folder).startsWith(norm(other)));
                if (!isNested) {
                    this.files.push([path.basename(folder), folder]);
                }
            }
        }
    }
    getTreeItem(element) {
        if (!element.id) {
            const parentPart = element.treeParentPath ?? '';
            element.id = element.filePath ? `${parentPart}\n${element.filePath}` : `node:${element.label}`;
        }
        if (this.cfg.checkboxMode) {
            const isFile = this.cfg.fileExtensions.some(ext => (element.filePath || '').toLowerCase().endsWith(ext));
            if (isFile && element.filePath) {
                element.checkboxState = this.selectionMap.get(element.filePath)
                    ? vscode.TreeItemCheckboxState.Checked
                    : vscode.TreeItemCheckboxState.Unchecked;
                element.command = undefined;
            }
            else if (element.filePath && element.filePath !== SEARCH_RESULTS && !element.filePath.startsWith('__online')) {
                const isSelectedFilesNode = element.filePath === ALL_FILES_PATH && this.cfg.selectionStorageKey === 'regressionTestSelection';
                if (isSelectedFilesNode) {
                    const selectedCount = Array.from(this.selectionMap.values()).filter(Boolean).length;
                    element.checkboxState = selectedCount > 0 ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
                    if (selectedCount > 0)
                        element.description = `${selectedCount} selected`;
                }
                else {
                    element.checkboxState = this.getFolderCheckboxState(element.filePath);
                    const files = this.getCncFilesInFolder(element.filePath);
                    const selectedCount = files.filter(p => this.selectionMap.get(p)).length;
                    if (selectedCount > 0)
                        element.description = `${selectedCount} selected`;
                }
            }
        }
        return element;
    }
    getParent(element) {
        const parentPath = element.treeParentPath;
        if (!parentPath)
            return undefined;
        if (parentPath === RECENT_PATH)
            return new FileTreeItem(RECENT_LABEL, vscode.TreeItemCollapsibleState.Collapsed, RECENT_PATH);
        const onlineLibraryDir = path.join(this.rootDir, ONLINE_LIBRARY);
        if (parentPath === onlineLibraryDir) {
            const parentItem = new FileTreeItem(ONLINE_LIBRARY, vscode.TreeItemCollapsibleState.Collapsed, parentPath);
            parentItem.contextValue = 'onlineLibrary';
            return parentItem;
        }
        if (!this.cfg.checkboxMode)
            return undefined;
        const allFilesLabel = (this.cfg.selectionStorageKey === 'regressionTestSelection') ? SELECTED_FILES : ALL_FILES;
        let label;
        if (parentPath === ALL_FILES_PATH)
            label = allFilesLabel;
        else if (parentPath.startsWith(ONLINE_VENDOR_PREFIX))
            label = parentPath.slice(ONLINE_VENDOR_PREFIX.length);
        else if (parentPath.startsWith(ONLINE_PURPOSE_VENDOR_PREFIX)) {
            const key = parentPath.slice(ONLINE_PURPOSE_VENDOR_PREFIX.length);
            const sep = key.indexOf('|');
            label = sep >= 0 ? key.slice(0, sep) : key;
            parentPath = ONLINE_PURPOSE_PREFIX + label;
        }
        else if (parentPath.startsWith(ONLINE_PURPOSE_PREFIX))
            label = parentPath.slice(ONLINE_PURPOSE_PREFIX.length);
        else
            label = path.basename(parentPath);
        return new FileTreeItem(label, vscode.TreeItemCollapsibleState.Collapsed, parentPath);
    }
    getChildren(element) {
        if (!element) {
            return this.buildRootItems();
        }
        if (element.filePath === SEARCH_RESULTS) {
            return this.buildSearchResultsItems();
        }
        if (element.filePath === ALL_FILES_PATH) {
            return this.buildAllFilesItems();
        }
        if (element.filePath === RECENT_PATH) {
            return this.buildRecentItems();
        }
        if (element.label === LOCAL_FUSION) {
            return this.buildLocalFusionItems();
        }
        const onlineLibraryDir = path.join(this.rootDir, ONLINE_LIBRARY);
        if (element.filePath === onlineLibraryDir) {
            const files = (0, utils_1.fileExists)(onlineLibraryDir)
                ? (0, utils_1.getFilesFromDirRecursive)(onlineLibraryDir, this.cfg.fileExtensions)
                : [];
            if (files.length === 0 && this._onOnlineLibraryExpandWhenEmpty) {
                return this._onOnlineLibraryExpandWhenEmpty(() => this.refreshTree(true)).then((didDownload) => {
                    if (didDownload)
                        this.loadFiles();
                    return this.buildOnlineLibraryItems();
                });
            }
            return this.buildOnlineLibraryItems();
        }
        if (element.filePath.startsWith(ONLINE_PURPOSE_PREFIX)) {
            return this.buildOnlineLibraryPurposeVendorGroups(element.filePath.slice(ONLINE_PURPOSE_PREFIX.length));
        }
        if (element.filePath.startsWith(ONLINE_PURPOSE_VENDOR_PREFIX)) {
            const key = element.filePath.slice(ONLINE_PURPOSE_VENDOR_PREFIX.length);
            const sep = key.indexOf('|');
            const purposeName = sep >= 0 ? key.slice(0, sep) : key;
            const vendorName = sep >= 0 ? key.slice(sep + 1) : '(No vendor)';
            return this.buildOnlineLibraryPurposeVendorItems(purposeName, vendorName);
        }
        return this.buildChildItems(element);
    }
    refreshTree(force) {
        const newHash = this.computeFileListHash();
        if (newHash !== this.lastFileListHash) {
            this.lastFileListHash = newHash;
            this._matchingDescendantCache = null;
            this.loadFiles();
            this._onDidChangeTreeData.fire(undefined);
        }
        else if (force) {
            this._onDidChangeTreeData.fire(undefined);
        }
    }
    /** Call after a mutation (delete, import, add/remove folder) so the tree updates immediately without waiting for hash. */
    refreshTreeFromMutation() {
        this._suppressWatcherUntil = Date.now() + 1000;
        this._matchingDescendantCache = null;
        this.loadFiles();
        this._onDidChangeTreeData.fire(undefined);
        setTimeout(() => {
            this.lastFileListHash = this.computeFileListHash();
        }, 500);
    }
    /** Refresh only the "Recently used" node so the rest of the tree (e.g. custom folders) is not rescanned. */
    refreshRecentOnly() {
        if (!this.cfg.recentStorageKey)
            return;
        if (this._recentNode)
            this._onDidChangeTreeData.fire(this._recentNode);
        else
            this._onDidChangeTreeData.fire(undefined);
    }
    getSelectedFiles() {
        if (!this.cfg.checkboxMode)
            return [];
        return Array.from(this.selectionMap.entries())
            .filter(([, v]) => v)
            .map(([p]) => p);
    }
    selectAll() {
        if (!this.cfg.checkboxMode)
            return;
        for (const p of this.collectAllCncFiles())
            this.selectionMap.set(p, true);
        this.persistSelection();
        this._onDidChangeTreeData.fire();
    }
    selectNone() {
        if (!this.cfg.checkboxMode)
            return;
        this.selectionMap.clear();
        this.persistSelection();
        this._onDidChangeTreeData.fire();
    }
    handleCheckboxChange(checked, element) {
        if (!this.cfg.checkboxMode)
            return;
        if (this.cfg.fileExtensions.some(ext => (element.filePath || '').toLowerCase().endsWith(ext))) {
            this.selectionMap.set(element.filePath, checked);
        }
        else {
            const isSelectedFilesNode = element.filePath === ALL_FILES_PATH && this.cfg.selectionStorageKey === 'regressionTestSelection';
            const filesToToggle = isSelectedFilesNode
                ? Array.from(this.selectionMap.entries()).filter(([, v]) => v).map(([p]) => p)
                : this.getCncFilesInFolder(element.filePath);
            for (const p of filesToToggle)
                this.selectionMap.set(p, checked);
        }
        this.persistSelection();
        this._onDidChangeTreeData.fire();
    }
    async addFolder(folderPath) {
        const stateKey = 'customFolders.' + this.cfg.settingsKey;
        const list = this.getCustomFolders();
        if (list.indexOf(folderPath) >= 0)
            return;
        list.push(folderPath);
        await this.context.globalState.update(stateKey, list);
        await config.update(this.cfg.settingsKey, { folders: list }, true).catch(() => { });
        this.watchDirectory(folderPath);
    }
    async removeFolder(folderPath) {
        const stateKey = 'customFolders.' + this.cfg.settingsKey;
        const list = this.getCustomFolders().filter(f => f !== folderPath);
        await this.context.globalState.update(stateKey, list);
        await config.update(this.cfg.settingsKey, { folders: list }, true).catch(() => { });
        this.refreshTreeFromMutation();
    }
    async createSubfolder(parentPath) {
        if (!parentPath || !(0, utils_1.fileExists)(parentPath))
            return;
        const parentDir = fs.statSync(parentPath).isDirectory() ? parentPath : path.dirname(parentPath);
        const name = await vscode.window.showInputBox({ placeHolder: 'Enter new folder name' });
        if (!name)
            return;
        const newDir = path.join(parentDir, name);
        if ((0, utils_1.fileExists)(newDir)) {
            vscode.window.showWarningMessage(`Folder "${name}" already exists.`);
            return;
        }
        fs.mkdirSync(newDir, { recursive: true });
        this.refreshTreeFromMutation();
    }
    async deleteFolder(folderPath) {
        if (!folderPath || !(0, utils_1.fileExists)(folderPath))
            return;
        if (!fs.statSync(folderPath).isDirectory())
            return;
        const name = path.basename(folderPath);
        const confirm = await vscode.window.showWarningMessage(`Delete folder "${name}" and all its contents?`, { modal: true }, 'Delete');
        if (confirm !== 'Delete')
            return;
        fs.rmSync(folderPath, { recursive: true, force: true });
        vscode.window.showInformationMessage(`Folder "${name}" deleted.`);
        this.refreshTreeFromMutation();
    }
    deleteFile(src) {
        if ((0, utils_1.fileExists)(src)) {
            fs.unlinkSync(src);
        }
        this.refreshTreeFromMutation();
    }
    // ── Private helpers ───────────────────────────────────────────
    getStorageKey() {
        if (!this.cfg.selectionStorageKey)
            return '';
        const folders = vscode.workspace.workspaceFolders;
        const base = folders?.[0]?.uri.fsPath ?? 'global';
        return `${this.cfg.selectionStorageKey}:${base}`;
    }
    restoreSelection() {
        const key = this.getStorageKey();
        if (!key)
            return;
        try {
            const stored = this.context.workspaceState.get(key);
            this.selectionMap.clear();
            if (stored?.length) {
                for (const p of new Set(stored))
                    this.selectionMap.set(p, true);
            }
        }
        catch { /* ignore */ }
    }
    persistSelection() {
        if (this.cfg.selectionStorageKey === 'regressionTestSelection')
            return;
        const key = this.getStorageKey();
        if (!key)
            return;
        const selected = Array.from(this.selectionMap.entries()).filter(([, v]) => v).map(([p]) => p);
        this.context.workspaceState.update(key, selected);
    }
    getCncFilesInFolder(dirPath) {
        if (dirPath === ALL_FILES_PATH)
            return this.collectAllCncFiles();
        if (!(0, utils_1.fileExists)(dirPath))
            return [];
        const files = (0, utils_1.getFilesFromDirRecursive)(dirPath, this.cfg.fileExtensions);
        return files.map(rel => path.join(dirPath, rel));
    }
    getFolderCheckboxState(dirPath) {
        const files = this.getCncFilesInFolder(dirPath);
        if (files.length === 0)
            return vscode.TreeItemCheckboxState.Unchecked;
        const selected = files.filter(p => this.selectionMap.get(p)).length;
        return selected === files.length ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
    }
    collectAllCncFiles() {
        const seen = new Set();
        const result = [];
        for (const dir of this.getWatchedDirs()) {
            const files = (0, utils_1.getFilesFromDirRecursive)(dir, this.cfg.fileExtensions);
            for (const rel of files) {
                const full = path.join(dir, rel);
                if (!seen.has(full)) {
                    seen.add(full);
                    result.push(full);
                }
            }
        }
        return result;
    }
    buildRootItems() {
        const items = [];
        if (this.filterText) {
            const searchNode = new FileTreeItem(`Search results ("${this.filterText}")`, vscode.TreeItemCollapsibleState.Expanded, SEARCH_RESULTS);
            searchNode.iconPath = new vscode.ThemeIcon('search');
            items.push(searchNode);
        }
        if (this.cfg.includeRecentNode !== false && this.cfg.recentStorageKey) {
            const recent = this.context.globalState.get('recentFiles.' + this.cfg.recentStorageKey);
            const arr = Array.isArray(recent) ? recent.filter(p => typeof p === 'string' && (0, utils_1.fileExists)(p)) : [];
            if (arr.length > 0) {
                if (!this._recentNode) {
                    this._recentNode = new FileTreeItem(RECENT_LABEL, vscode.TreeItemCollapsibleState.Collapsed, RECENT_PATH);
                    this._recentNode.id = '__recent_' + this.cfg.recentStorageKey;
                }
                items.push(this._recentNode);
            }
            else
                this._recentNode = undefined;
        }
        if (this.cfg.includeAllFilesNode !== false) {
            const allFilesPath = this.cfg.checkboxMode ? ALL_FILES_PATH : '';
            const allFilesLabel = (this.cfg.checkboxMode && this.cfg.selectionStorageKey === 'regressionTestSelection') ? SELECTED_FILES : ALL_FILES;
            items.push(new FileTreeItem(allFilesLabel, vscode.TreeItemCollapsibleState.Collapsed, allFilesPath));
        }
        if (this.cfg.includeLocalFusionNode) {
            items.push(new FileTreeItem(LOCAL_FUSION, vscode.TreeItemCollapsibleState.Collapsed));
        }
        const onlineLibraryDir = path.join(this.rootDir, ONLINE_LIBRARY);
        for (const [name, fullPath] of this.files) {
            if (!this.cfg.includeOnlineLibrary && path.normalize(fullPath) === path.normalize(onlineLibraryDir))
                continue;
            const isFile = this.isMatchingFile(name);
            const matches = this.matchesFilter(name, fullPath) ||
                (!isFile && this.hasMatchingDescendant(fullPath));
            if (!matches)
                continue;
            if (this.onlineLibraryFilter && isFile && !this.machineMatchesAxisPurposeFilter(fullPath))
                continue;
            if (this.onlineLibraryFilter && !isFile && !this.hasMatchingMachineDescendant(fullPath))
                continue;
            const state = isFile
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Collapsed;
            const item = new FileTreeItem(name, state, fullPath);
            const normFull = path.normalize(fullPath);
            const normOnline = path.normalize(onlineLibraryDir);
            const isOnlineLibraryNode = !isFile && (normFull === normOnline || name === ONLINE_LIBRARY);
            item.contextValue = isFile ? 'customFile' : (isOnlineLibraryNode ? 'onlineLibrary' : (this.customFolderPaths.has(fullPath) ? 'customFolder' : 'openFolder'));
            items.push(item);
        }
        return items;
    }
    async buildSearchResultsItems() {
        const items = [];
        const addFromDir = (dir, labelPrefix) => {
            if (!(0, utils_1.fileExists)(dir))
                return;
            const files = (0, utils_1.getFilesFromDirRecursive)(dir, this.cfg.fileExtensions);
            for (const rel of files) {
                const fullPath = path.join(dir, rel);
                if (isExcludedMachineFile(fullPath))
                    continue;
                const fileName = path.basename(rel);
                if (!this.matchesFilter(fileName, fullPath))
                    continue;
                if (!this.machineMatchesAxisPurposeFilter(fullPath))
                    continue;
                const label = this.cfg.fileExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
                    ? (getMachineDisplayLabel(fullPath) ?? fileName)
                    : fileName;
                const item = new FileTreeItem(label, vscode.TreeItemCollapsibleState.None, fullPath);
                item.contextValue = 'customFile';
                item.description = path.dirname(rel);
                item.command = { command: this.cfg.selectCommand, title: '', arguments: [fullPath] };
                if (this.cfg.fileExtensions.some(ext => fileName.toLowerCase().endsWith(ext))) {
                    const img = getEmbeddedImageFromMch(fullPath);
                    const tooltipInfo = getMachineTooltipInfo(fullPath);
                    item.tooltip = makeMachineTooltip(label, `${labelPrefix} › ${rel}`, img, tooltipInfo);
                }
                items.push(item);
            }
        };
        addFromDir(this.rootDir, 'Built-in');
        for (const [, folderPath] of this.files) {
            if (this.customFolderPaths.has(folderPath)) {
                addFromDir(folderPath, path.basename(folderPath));
            }
        }
        if (this.cfg.includeLocalFusionNode) {
            let localDir;
            if (process.platform === 'win32') {
                localDir = path.join(process.env.LOCALAPPDATA ?? '', 'autodesk', 'Autodesk Fusion 360');
            }
            else {
                localDir = path.join(process.env.HOME ?? '', 'Library', 'application support', 'autodesk', 'CAM360', 'machines');
            }
            if (localDir)
                addFromDir(localDir, 'Local');
        }
        items.sort((a, b) => a.label.localeCompare(b.label));
        return items;
    }
    buildAllFilesItems() {
        if (this.cfg.checkboxMode) {
            const isSelectedFilesView = this.cfg.selectionStorageKey === 'regressionTestSelection';
            const selectedPaths = isSelectedFilesView
                ? Array.from(this.selectionMap.entries()).filter(([, v]) => v).map(([p]) => p)
                : null;
            const seen = new Set();
            const items = [];
            const addDir = (dirPath) => {
                if (!(0, utils_1.fileExists)(dirPath))
                    return;
                const files = (0, utils_1.getFilesFromDirRecursive)(dirPath, this.cfg.fileExtensions);
                const rootLabel = dirPath === this.rootDir ? (this.cfg.rootDirName || path.basename(dirPath)) : path.basename(dirPath);
                for (const rel of files) {
                    const fullPath = path.join(dirPath, rel);
                    if (seen.has(fullPath) || !this.matchesFilter(path.basename(rel), fullPath))
                        continue;
                    if (isSelectedFilesView && (!selectedPaths || !selectedPaths.includes(fullPath)))
                        continue;
                    seen.add(fullPath);
                    const item = new FileTreeItem(path.basename(rel), vscode.TreeItemCollapsibleState.None, fullPath, ALL_FILES_PATH);
                    item.contextValue = 'customFile';
                    if (isSelectedFilesView) {
                        const folderRel = path.dirname(rel).replace(/\//g, path.sep);
                        item.description = folderRel ? path.join(rootLabel, folderRel) : rootLabel;
                    }
                    items.push(item);
                }
            };
            addDir(this.rootDir);
            for (const folderPath of this.customFolderPaths)
                addDir(folderPath);
            items.sort((a, b) => (a.description || '').localeCompare(b.description || '') || a.label.localeCompare(b.label));
            return items;
        }
        const allFiles = (0, utils_1.getFilesFromDirRecursive)(this.rootDir, this.cfg.fileExtensions);
        return allFiles
            .filter(rel => this.matchesFilter(path.basename(rel), path.join(this.rootDir, rel)))
            .map(rel => {
            const fullPath = path.join(this.rootDir, rel);
            const name = path.basename(rel);
            const item = new FileTreeItem(name, vscode.TreeItemCollapsibleState.None, fullPath);
            item.command = { command: this.cfg.selectCommand, title: '', arguments: [fullPath] };
            item.contextValue = 'customFile';
            return item;
        });
    }
    buildRecentItems() {
        const recent = this.context.globalState.get('recentFiles.' + this.cfg.recentStorageKey);
        const paths = Array.isArray(recent) ? recent : [];
        const items = [];
        const ext = this.cfg.fileExtensions;
        const isMachine = ext.some(e => /\.(mch|machine)$/i.test(e));
        for (let i = 0; i < paths.length && items.length < RECENT_MAX; i++) {
            const fullPath = paths[i];
            if (!fullPath || typeof fullPath !== 'string' || !(0, utils_1.fileExists)(fullPath))
                continue;
            const name = path.basename(fullPath);
            if (!ext.some(e => name.toLowerCase().endsWith(e.toLowerCase())))
                continue;
            const label = isMachine ? (getMachineDisplayLabel(fullPath) ?? name) : name;
            const item = new FileTreeItem(label, vscode.TreeItemCollapsibleState.None, fullPath, RECENT_PATH);
            item.contextValue = 'customFile';
            item.command = { command: this.cfg.selectCommand, title: '', arguments: [fullPath] };
            if (isMachine) {
                const tooltipInfo = getMachineTooltipInfo(fullPath);
                const img = getEmbeddedImageFromMch(fullPath);
                item.tooltip = makeMachineTooltip(label, fullPath, img, tooltipInfo);
            }
            items.push(item);
        }
        return items;
    }
    buildLocalFusionItems() {
        let localDir;
        if (process.platform === 'win32') {
            localDir = path.join(process.env.LOCALAPPDATA ?? '', 'autodesk', 'Autodesk Fusion 360');
        }
        else {
            localDir = path.join(process.env.HOME ?? '', 'Library', 'application support', 'autodesk', 'CAM360', 'machines');
        }
        if (!localDir || !(0, utils_1.fileExists)(localDir))
            return [];
        const allFiles = (0, utils_1.getFilesFromDirRecursive)(localDir, this.cfg.fileExtensions);
        return allFiles
            .filter(rel => this.matchesFilter(path.basename(rel), path.join(localDir, rel)))
            .filter(rel => this.machineMatchesAxisPurposeFilter(path.join(localDir, rel)))
            .map(rel => {
            const fullPath = path.join(localDir, rel);
            const name = path.basename(rel);
            const item = new FileTreeItem(name, vscode.TreeItemCollapsibleState.None, fullPath);
            item.command = { command: this.cfg.selectCommand, title: '', arguments: [fullPath] };
            item.contextValue = 'customFile';
            return item;
        });
    }
    buildOnlineLibraryItems() {
        const onlineLibraryDir = path.join(this.rootDir, ONLINE_LIBRARY);
        if (!(0, utils_1.fileExists)(onlineLibraryDir))
            return [];
        const files = (0, utils_1.getFilesFromDirRecursive)(onlineLibraryDir, this.cfg.fileExtensions);
        const byPurpose = new Map();
        for (const rel of files) {
            const fullPath = path.join(onlineLibraryDir, rel);
            if (isExcludedMachineFile(fullPath))
                continue;
            if (this.onlineLibraryFilter && !this.machineMatchesAxisPurposeFilter(fullPath))
                continue;
            const purpose = getAxisCountAndPurposeFromMch(fullPath)?.purpose || 'Other';
            if (!byPurpose.has(purpose))
                byPurpose.set(purpose, []);
            byPurpose.get(purpose).push(fullPath);
        }
        const purposes = Array.from(byPurpose.keys()).sort((a, b) => {
            const i = PURPOSE_SORT_ORDER.indexOf(a);
            const j = PURPOSE_SORT_ORDER.indexOf(b);
            if (i >= 0 && j >= 0)
                return i - j;
            if (i >= 0)
                return -1;
            if (j >= 0)
                return 1;
            return a.localeCompare(b);
        });
        return purposes.map(purpose => {
            const item = new FileTreeItem(purpose, vscode.TreeItemCollapsibleState.Collapsed, ONLINE_PURPOSE_PREFIX + purpose, path.join(this.rootDir, ONLINE_LIBRARY));
            item.contextValue = 'purposeGroup';
            item.description = `${byPurpose.get(purpose).length} machine(s)`;
            return item;
        });
    }
    buildOnlineLibraryVendorItems(vendorName) {
        const onlineLibraryDir = path.join(this.rootDir, ONLINE_LIBRARY);
        if (!(0, utils_1.fileExists)(onlineLibraryDir))
            return [];
        const noVendorLabel = '(No vendor)';
        const files = (0, utils_1.getFilesFromDirRecursive)(onlineLibraryDir, this.cfg.fileExtensions);
        const items = [];
        for (const rel of files) {
            const fullPath = path.join(onlineLibraryDir, rel);
            if (isExcludedMachineFile(fullPath))
                continue;
            const vendor = (getAxisCountAndPurposeFromMch(fullPath)?.vendor || '').trim() || noVendorLabel;
            if (vendor !== vendorName)
                continue;
            if (this.onlineLibraryFilter && !this.machineMatchesAxisPurposeFilter(fullPath))
                continue;
            const fileName = path.basename(rel);
            const label = getMachineDisplayLabel(fullPath) ?? fileName;
            const treeParent = this.cfg.checkboxMode ? ONLINE_VENDOR_PREFIX + vendorName : undefined;
            const item = new FileTreeItem(label, vscode.TreeItemCollapsibleState.None, fullPath, treeParent);
            if (!this.cfg.checkboxMode)
                item.command = { command: this.cfg.selectCommand, title: '', arguments: [fullPath] };
            item.contextValue = 'customFile';
            if (this.cfg.fileExtensions.some(ext => fileName.toLowerCase().endsWith(ext))) {
                const img = getEmbeddedImageFromMch(fullPath);
                const tooltipInfo = getMachineTooltipInfo(fullPath);
                item.tooltip = makeMachineTooltip(label, `File: ${fileName}`, img, tooltipInfo);
            }
            items.push(item);
        }
        items.sort((a, b) => a.label.localeCompare(b.label));
        return items;
    }
    buildOnlineLibraryPurposeVendorGroups(purposeName) {
        const onlineLibraryDir = path.join(this.rootDir, ONLINE_LIBRARY);
        if (!(0, utils_1.fileExists)(onlineLibraryDir))
            return [];
        const files = (0, utils_1.getFilesFromDirRecursive)(onlineLibraryDir, this.cfg.fileExtensions);
        const byVendor = new Map();
        const noVendorLabel = '(No vendor)';
        for (const rel of files) {
            const fullPath = path.join(onlineLibraryDir, rel);
            if (isExcludedMachineFile(fullPath))
                continue;
            const info = getAxisCountAndPurposeFromMch(fullPath);
            const purpose = info?.purpose || 'Other';
            if (purpose !== purposeName)
                continue;
            if (this.onlineLibraryFilter && !this.machineMatchesAxisPurposeFilter(fullPath))
                continue;
            const vendor = (info?.vendor || '').trim() || noVendorLabel;
            if (!byVendor.has(vendor))
                byVendor.set(vendor, []);
            byVendor.get(vendor).push(fullPath);
        }
        const vendors = Array.from(byVendor.keys()).sort((a, b) => a.localeCompare(b));
        return vendors.map(vendor => {
            const key = purposeName + '|' + vendor;
            const item = new FileTreeItem(vendor, vscode.TreeItemCollapsibleState.Collapsed, ONLINE_PURPOSE_VENDOR_PREFIX + key, ONLINE_PURPOSE_PREFIX + purposeName);
            item.contextValue = 'vendorGroup';
            item.description = `${byVendor.get(vendor).length} machine(s)`;
            return item;
        });
    }
    buildOnlineLibraryPurposeVendorItems(purposeName, vendorName) {
        const onlineLibraryDir = path.join(this.rootDir, ONLINE_LIBRARY);
        if (!(0, utils_1.fileExists)(onlineLibraryDir))
            return [];
        const noVendorLabel = '(No vendor)';
        const files = (0, utils_1.getFilesFromDirRecursive)(onlineLibraryDir, this.cfg.fileExtensions);
        const items = [];
        const pvKey = ONLINE_PURPOSE_VENDOR_PREFIX + purposeName + '|' + vendorName;
        for (const rel of files) {
            const fullPath = path.join(onlineLibraryDir, rel);
            if (isExcludedMachineFile(fullPath))
                continue;
            const info = getAxisCountAndPurposeFromMch(fullPath);
            const purpose = info?.purpose || 'Other';
            const vendor = (info?.vendor || '').trim() || noVendorLabel;
            if (purpose !== purposeName || vendor !== vendorName)
                continue;
            if (this.onlineLibraryFilter && !this.machineMatchesAxisPurposeFilter(fullPath))
                continue;
            const fileName = path.basename(rel);
            const label = getMachineDisplayLabel(fullPath) ?? fileName;
            const treeParent = this.cfg.checkboxMode ? pvKey : undefined;
            const item = new FileTreeItem(label, vscode.TreeItemCollapsibleState.None, fullPath, treeParent);
            if (!this.cfg.checkboxMode)
                item.command = { command: this.cfg.selectCommand, title: '', arguments: [fullPath] };
            item.contextValue = 'customFile';
            if (this.cfg.fileExtensions.some(ext => fileName.toLowerCase().endsWith(ext))) {
                const img = getEmbeddedImageFromMch(fullPath);
                const tooltipInfo = getMachineTooltipInfo(fullPath);
                item.tooltip = makeMachineTooltip(label, `File: ${fileName}`, img, tooltipInfo);
            }
            items.push(item);
        }
        items.sort((a, b) => a.label.localeCompare(b.label));
        return items;
    }
    buildChildItems(element) {
        const dirPath = element.filePath;
        if (!dirPath || dirPath.startsWith(ONLINE_VENDOR_PREFIX) || dirPath.startsWith(ONLINE_PURPOSE_PREFIX) || dirPath.startsWith(ONLINE_PURPOSE_VENDOR_PREFIX) || !(0, utils_1.fileExists)(dirPath))
            return [];
        const entries = this.findEntries(dirPath);
        const items = [];
        for (const [name, fullPath] of entries) {
            const isFile = this.isMatchingFile(name);
            if (isFile && isExcludedMachineFile(fullPath))
                continue;
            const matches = this.matchesFilter(name, fullPath) ||
                (!isFile && this.hasMatchingDescendant(fullPath));
            if (!matches)
                continue;
            if (this.onlineLibraryFilter && isFile && !this.machineMatchesAxisPurposeFilter(fullPath))
                continue;
            if (this.onlineLibraryFilter && !isFile && !this.hasMatchingMachineDescendant(fullPath))
                continue;
            const state = isFile
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Collapsed;
            const isMachineFile = isFile && this.cfg.fileExtensions.some(ext => name.toLowerCase().endsWith(ext));
            const itemLabel = isMachineFile ? (getMachineDisplayLabel(fullPath) ?? name) : name;
            const treeParent = this.cfg.checkboxMode ? element.filePath : undefined;
            const item = new FileTreeItem(itemLabel, state, fullPath, treeParent);
            if (isFile) {
                if (!this.cfg.checkboxMode) {
                    item.command = { command: this.cfg.selectCommand, title: '', arguments: [fullPath] };
                }
                item.contextValue = 'customFile';
                if (isMachineFile) {
                    const img = getEmbeddedImageFromMch(fullPath);
                    const tooltipInfo = getMachineTooltipInfo(fullPath);
                    item.tooltip = makeMachineTooltip(itemLabel, `File: ${name}`, img, tooltipInfo);
                }
            }
            else {
                item.contextValue = 'openFolder';
            }
            items.push(item);
        }
        return items;
    }
    findEntries(dir) {
        if (!(0, utils_1.fileExists)(dir))
            return [];
        try {
            const dirents = fs.readdirSync(dir, { withFileTypes: true });
            const result = [];
            for (const d of dirents) {
                if (d.isDirectory() || this.isMatchingFile(d.name)) {
                    result.push([d.name, path.join(dir, d.name)]);
                }
            }
            return result;
        }
        catch { return []; }
    }
    isMatchingFile(name) {
        const lower = name.toLowerCase();
        return this.cfg.fileExtensions.some(ext => lower.endsWith(ext));
    }
}
exports.FileTreeProvider = FileTreeProvider;
//# sourceMappingURL=fileTreeProvider.js.map