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
exports.PostEngine = void 0;
exports.transformDebugOutputToInline = transformDebugOutputToInline;
exports.removeDebugLines = removeDebugLines;
exports.findErrorLine = findErrorLine;
exports.findWarningMessages = findWarningMessages;
exports.moveLine = moveLine;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const process = __importStar(require("process"));
const cp = __importStar(require("child_process"));
const config = __importStar(require("./config"));
const utils_1 = require("./utils");
const MACHINE_EXTENSIONS = ['.machine', '.mch'];
/** Return "vendor model" from .mch/.machine JSON when present, else undefined (caller uses filename). Matches tree label. */
function getMachineDisplayLabelFromPath(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const mch = JSON.parse(raw);
        const vendor = (mch.general?.vendor && String(mch.general.vendor).trim()) || '';
        const model = (mch.general?.model && String(mch.general.model).trim()) || '';
        if (vendor && model)
            return `${vendor} ${model}`.trim();
        if (vendor)
            return vendor;
        if (model)
            return model;
        return undefined;
    }
    catch {
        return undefined;
    }
}
/** Returns "off" | "inline" | "inline-detailed" | "full". Boolean true → inline, false → off. */
function getDebugOutputMode() {
    const raw = config.get('showDebuggedCode');
    if (raw === true)
        return 'inline';
    if (raw === false)
        return 'off';
    if (raw === 'off' || raw === 'inline' || raw === 'inline-detailed' || raw === 'full')
        return raw;
    return 'off';
}
const PF = process.env.ProgramFiles || 'C:\\Program Files';
const PF86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
/** Standard install paths for preset diff tools (Windows). First existing path is used. */
const EXTERNAL_DIFF_STANDARD_PATHS_WIN = {
    winmerge: [path.join(PF, 'WinMerge', 'WinMergeU.exe'), path.join(PF86, 'WinMerge', 'WinMergeU.exe')],
    beyondcompare: [path.join(PF, 'Beyond Compare 4', 'BCompare.exe'), path.join(PF, 'Beyond Compare 3', 'BCompare.exe')],
    kdiff3: [path.join(PF, 'KDiff3', 'kdiff3.exe'), path.join(PF86, 'KDiff3', 'kdiff3.exe')],
    meld: [path.join(PF, 'Meld', 'Meld.exe'), path.join(PF86, 'Meld', 'Meld.exe')],
    p4merge: [path.join(PF, 'Perforce', 'p4merge.exe')],
};
/** Standard install paths for preset diff tools (macOS). First existing path is used. */
const EXTERNAL_DIFF_STANDARD_PATHS_DARWIN = {
    beyondcompare: [
        '/Applications/Beyond Compare.app/Contents/MacOS/bcomp',
        '/usr/local/bin/bcomp',
        '/usr/local/bin/bcompare',
        '/opt/homebrew/bin/bcomp',
    ],
    kdiff3: [
        '/Applications/kdiff3.app/Contents/MacOS/kdiff3',
        '/usr/local/bin/kdiff3',
        '/opt/homebrew/bin/kdiff3',
    ],
    meld: [
        '/Applications/Meld.app/Contents/MacOS/Meld',
        '/usr/local/bin/meld',
        '/opt/homebrew/bin/meld',
    ],
    p4merge: [
        '/Applications/p4merge.app/Contents/Resources/launchp4merge',
        '/usr/local/bin/p4merge',
        '/opt/homebrew/bin/p4merge',
    ],
};
/** Standard install paths for preset diff tools (Linux). First existing path is used. */
const EXTERNAL_DIFF_STANDARD_PATHS_LINUX = {
    beyondcompare: ['/usr/bin/bcompare', '/usr/bin/bcomp'],
    kdiff3: ['/usr/bin/kdiff3'],
    meld: ['/usr/bin/meld'],
    p4merge: ['/usr/bin/p4merge'],
};
function getExternalDiffPathsForPlatform() {
    const p = process.platform;
    if (p === 'win32')
        return EXTERNAL_DIFF_STANDARD_PATHS_WIN;
    if (p === 'darwin')
        return EXTERNAL_DIFF_STANDARD_PATHS_DARWIN;
    if (p === 'linux')
        return EXTERNAL_DIFF_STANDARD_PATHS_LINUX;
    return EXTERNAL_DIFF_STANDARD_PATHS_WIN;
}
/** Resolve external diff tool setting to an executable path. Returns path if valid file, else null. On failure sets errorMessage for the caller to show. */
function resolveExternalDiffToolPath(out) {
    let choice = config.get('externalDiffTool');
    const customPath = config.get('externalDiffToolPath');
    const hasLegacyPath = typeof customPath === 'string' && customPath.replace(/^["']|["']$/g, '').trim().length > 0;
    if ((!choice || choice === '') && !hasLegacyPath) {
        out.errorMessage = undefined;
        return null;
    }
    if ((!choice || choice === '') && hasLegacyPath)
        choice = 'custom';
    let candidate = null;
    if (choice === 'custom') {
        const raw = config.get('externalDiffToolPath');
        candidate = typeof raw === 'string' ? raw.replace(/^["']|["']$/g, '').trim() : '';
        candidate = candidate || null;
    }
    else {
        const pathMap = getExternalDiffPathsForPlatform();
        const paths = pathMap[choice];
        if (paths) {
            candidate = paths.find(p => (0, utils_1.fileExists)(p)) || null;
        }
    }
    if (!candidate) {
        if (choice === 'custom') {
            out.errorMessage = 'External diff tool not found. Set External Diff Tool Custom Path in settings to the executable.';
        }
        else {
            out.errorMessage = `External diff tool "${choice}" not found at standard install path. Install it or choose Custom and set the path.`;
        }
        return null;
    }
    try {
        if (!fs.statSync(candidate).isFile()) {
            out.errorMessage = `External diff tool path must point to an executable, not a folder: ${candidate}`;
            return null;
        }
    }
    catch {
        out.errorMessage = `External diff tool not found: ${candidate}`;
        return null;
    }
    out.errorMessage = undefined;
    return candidate;
}
class PostEngine {
    constructor(context) {
        this.context = context;
        this.cncFile = '';
        this.postFile = '';
        this.machineFile = '';
        this.postExecutable = '';
        this.secondaryPostExecutable = '';
        this.propertyCache = new Map();
        this.resLocation = path.join(context.extensionPath, 'res');
        this.tmpDir = os.tmpdir();
        this.workDir = path.join(this.tmpDir, 'AutodeskPostUtility');
        this.outputDir = path.join(this.workDir, 'OutputFiles');
        this.outputPath = path.join(this.outputDir, 'debuggedfile.nc');
        this.logPath = path.join(this.outputDir, 'debuggedfile.log');
        this.debugOutputPath = path.join(this.outputDir, 'debuggedfile.nc2');
        this.secondaryOutputPath = path.join(this.outputDir, 'secondarydebuggedfile.nc');
        this.secondaryLogPath = path.join(this.outputDir, 'secondarydebuggedfile.log');
        this.customCNCDir = path.join(this.workDir, 'CustomCNCFiles');
        this.customMachinesDir = path.join(this.workDir, 'CustomMachineFiles');
        this.cncFilesBackupDir = path.join(this.workDir, 'CNCFilesBackup');
        this.machinesBackupDir = path.join(this.workDir, 'MachinesBackup');
        this.propertyTempDir = path.join(this.workDir, 'Properties');
        const regressionTestRoot = path.join(this.workDir, 'Regression test');
        this.regressionTestOutputDir = path.join(regressionTestRoot, 'output');
        this.regressionTestReferenceDir = path.join(regressionTestRoot, 'reference');
        (0, utils_1.ensureDir)(this.outputDir);
    }
    /** Clear regression test output and reference folders (e.g. on window close). */
    clearRegressionTestFolders() {
        try {
            if ((0, utils_1.fileExists)(this.regressionTestOutputDir))
                (0, utils_1.removeFilesInFolder)(this.regressionTestOutputDir);
            if ((0, utils_1.fileExists)(this.regressionTestReferenceDir))
                (0, utils_1.removeFilesInFolder)(this.regressionTestReferenceDir);
        }
        catch {
            /* ignore */
        }
    }
    // ── Property cache ──────────────────────────────────────────────
    getPropertyCache(cpsPath) {
        return this.propertyCache.get((0, utils_1.getHash)(cpsPath));
    }
    setPropertyCache(cpsPath, cache) {
        this.propertyCache.set((0, utils_1.getHash)(cpsPath), cache);
    }
    clearPropertyCache(cpsPath) {
        this.propertyCache.delete((0, utils_1.getHash)(cpsPath));
    }
    // ── Post executable management ──────────────────────────────────
    getPostExecutablePath() {
        if (!(0, utils_1.fileExists)(this.postExecutable)) {
            this.postExecutable = config.get('postExecutablePath');
        }
        return this.postExecutable;
    }
    ensurePostKernel() {
        const fromConfig = config.get('postExecutablePath');
        if (fromConfig !== this.postExecutable) {
            this.postExecutable = fromConfig;
            this._cachedPostVersion = null;
        }
        if (!(0, utils_1.fileExists)(this.postExecutable)) {
            this.locatePostExe(true);
        }
    }
    async locatePostExe(autoFind) {
        if (autoFind) {
            const found = this.findFusionPostExe('post.exe', 'post');
            if (found) {
                this.postExecutable = found;
                config.update('postExecutablePath', found, true);
                this.clearPostVersionCache();
                this.getPostEngineVersion().then(() => { });
                return;
            }
        }
        const action = await vscode.window.showInformationMessage((autoFind ? 'Post executable cannot be found. ' : '') + 'Please select your post executable', 'Browse...');
        if (action !== 'Browse...')
            return;
        const uris = await vscode.window.showOpenDialog({ canSelectFiles: true, filters: {} });
        if (!uris?.[0])
            return;
        const selected = uris[0].fsPath;
        if ((0, utils_1.fileExists)(selected) && selected.toLowerCase().includes('post')) {
            this.postExecutable = selected;
            config.update('postExecutablePath', selected, true);
            this.clearPostVersionCache();
            this.getPostEngineVersion().then(() => { });
            vscode.window.showInformationMessage('Post processor location updated.');
        }
        else {
            vscode.window.showErrorMessage('The selected file is invalid or does not exist.');
        }
    }
    async locateSecondaryPostExe(autoFind) {
        if (autoFind) {
            const found = this.findFusionPostExe(path.join('post-legacy', 'post.exe'), path.join('post-legacy', 'post'));
            if (found) {
                this.secondaryPostExecutable = found;
                config.update('secondaryPostExecutablePath', found, true);
                return;
            }
        }
        const action = await vscode.window.showInformationMessage((autoFind ? 'Secondary post executable cannot be found. ' : '') + 'Please select your secondary post executable', 'Browse...');
        if (action !== 'Browse...')
            return;
        const uris = await vscode.window.showOpenDialog({ canSelectFiles: true, filters: {} });
        if (!uris?.[0])
            return;
        const selected = uris[0].fsPath;
        if ((0, utils_1.fileExists)(selected) && selected.toLowerCase().includes('post')) {
            this.secondaryPostExecutable = selected;
            config.update('secondaryPostExecutablePath', selected, true);
            vscode.window.showInformationMessage('Secondary post processor location updated.');
        }
        else {
            vscode.window.showErrorMessage('The selected file is invalid or does not exist.');
        }
    }
    findFusionPostExe(winRelative, macRelative) {
        const locations = ['develop', 'pre-production', 'production'];
        if (process.platform === 'win32') {
            for (const loc of locations) {
                const ini = path.join(process.env.LOCALAPPDATA ?? '', 'autodesk', 'webdeploy', loc, '6a0c9611291d45bb9226980209917c3d', 'FusionLauncher.exe.ini');
                if (!(0, utils_1.fileExists)(ini))
                    continue;
                const lines = fs.readFileSync(ini, 'utf16le').split('\n');
                for (const line of lines) {
                    if (line.toLowerCase().includes('fusion360.exe')) {
                        const installDir = line.substring(8, line.length - 16);
                        const exe = path.join(installDir, 'Applications', 'CAM360', winRelative);
                        if ((0, utils_1.fileExists)(exe))
                            return exe;
                    }
                }
            }
        }
        else {
            for (const loc of locations) {
                const suffix = loc !== 'production' ? ` [${loc}]` : '';
                const exe = path.join(process.env.HOME ?? '', 'Library', 'application support', 'autodesk', 'webdeploy', loc, `Autodesk Fusion${suffix}.app`, 'contents', 'libraries', 'applications', 'CAM360', macRelative);
                if ((0, utils_1.fileExists)(exe))
                    return exe;
            }
        }
        return undefined;
    }
    // ── CPS path helpers ────────────────────────────────────────────
    getCpsPath() {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return undefined;
        const name = editor.document.fileName;
        if (name.toUpperCase().endsWith('.CPS')) {
            this.postFile = name;
            return name;
        }
        return undefined;
    }
    checkActiveDocumentForPost() {
        return this.getCpsPath() !== undefined;
    }
    /** Post path stored when debug output was last generated (for line jumping from .nc to .cps). */
    getDebugPostPath() {
        const stored = this.context.workspaceState.get('debugOutputPostPath');
        return stored && stored.postPath ? stored.postPath : undefined;
    }
    // ── CNC / Machine selection ─────────────────────────────────────
    setCNCFile(selectedFile, skipPost = false) {
        if (!selectedFile.toLowerCase().endsWith('.cnc'))
            return;
        this.cncFile = selectedFile;
        vscode.window.setStatusBarMessage('CNC file set', 2000);
        if (!this.cncStatusBar) {
            this.cncStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
        }
        this.cncStatusBar.text = `CNC file: ${path.basename(selectedFile, path.extname(selectedFile))}`;
        this.cncStatusBar.show();
        if (skipPost || !this.checkActiveDocumentForPost())
            return;
        if (config.get('postOnCNCSelection')) {
            this.postProcess();
        }
    }
    setMachineFile(selectedFile) {
        if (!MACHINE_EXTENSIONS.some(ext => selectedFile.toLowerCase().endsWith(ext)))
            return;
        this.machineFile = selectedFile;
        vscode.window.setStatusBarMessage('Machine file updated', 2000);
        if (!this.machineStatusBar) {
            this.machineStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        }
        const displayName = (0, utils_1.fileExists)(selectedFile)
            ? (getMachineDisplayLabelFromPath(selectedFile) ?? path.basename(selectedFile, path.extname(selectedFile)))
            : path.basename(selectedFile, path.extname(selectedFile));
        this.machineStatusBar.text = `Machine: ${displayName}`;
        this.machineStatusBar.show();
        if (config.get('postOnMachineSelection')) {
            this.postProcess();
        }
    }
    clearMachineSelection() {
        this.machineFile = '';
        vscode.window.setStatusBarMessage('Machine file unselected.', 2000);
        this.machineStatusBar?.hide();
    }
    async selectCNCFromQuickPick(followUpCommand = '') {
        const rootDir = path.join(this.resLocation, 'CNC files');
        await this.browseDirectory(rootDir, followUpCommand);
    }
    async browseDirectory(dir, followUpCommand) {
        if (!(0, utils_1.fileExists)(dir))
            return;
        const entries = fs.readdirSync(dir);
        const dirs = entries
            .filter(e => fs.statSync(path.join(dir, e)).isDirectory())
            .map(e => path.join(dir, e));
        if (dirs.length > 0) {
            const names = dirs.map(d => path.basename(d));
            names.push('Browse...');
            const picked = await vscode.window.showQuickPick(names);
            if (!picked)
                return;
            if (picked === 'Browse...') {
                const uris = await vscode.window.showOpenDialog({ canSelectFiles: true, filters: { 'CNC Files': ['cnc'] } });
                if (uris?.[0]) {
                    this.cncFile = uris[0].fsPath;
                }
            }
            else {
                await this.browseDirectory(path.join(dir, picked), followUpCommand);
            }
        }
        else {
            const cncFiles = entries.filter(e => e.toLowerCase().endsWith('.cnc'))
                .map(e => ({ label: e, fullPath: path.join(dir, e) }));
            const picked = await vscode.window.showQuickPick(cncFiles.map(f => f.label), { placeHolder: 'Select a CNC file to post process' });
            if (!picked)
                return;
            const match = cncFiles.find(f => f.label === picked);
            if (match)
                this.setCNCFile(match.fullPath, true);
            if (followUpCommand) {
                vscode.commands.executeCommand(followUpCommand);
            }
        }
    }
    // ── Unit selection ──────────────────────────────────────────────
    selectUnits() {
        return config.get('outputUnits') === 'IN' ? 0 : 1;
    }
    // ── Interrogation ───────────────────────────────────────────────
    async interrogatePost(cpsPath) {
        const exePath = this.getPostExecutablePath();
        if (!(0, utils_1.fileExists)(exePath))
            return undefined;
        const hash = (0, utils_1.getHash)(cpsPath);
        const tempPath = path.join(this.propertyTempDir, `${hash}_temp.json`);
        (0, utils_1.ensureDir)(this.propertyTempDir);
        try {
            const timeout = config.get('timeoutForPostProcessing') * 1000;
            const args = ['--interrogate', '--quiet', cpsPath, tempPath];
            const includePath = config.get('includePath');
            if ((0, utils_1.fileExists)(includePath)) {
                args.push('--include', includePath);
            }
            await (0, utils_1.execFileAsync)(exePath, args, { timeout });
            if (!(0, utils_1.fileExists)(tempPath))
                return undefined;
            const content = fs.readFileSync(tempPath, 'utf-8');
            try {
                fs.unlinkSync(tempPath);
            }
            catch { /* ignore */ }
            return JSON.parse(content);
        }
        catch {
            try {
                fs.unlinkSync(tempPath);
            }
            catch { /* ignore */ }
            return undefined;
        }
    }
    // ── Parameter building ──────────────────────────────────────────
    createParameters(postLocation, isCompare, isSecondary = false) {
        const params = ['--noeditor'];
        if (this.machineFile) {
            params.unshift(this.machineFile);
            params.unshift('--machine');
        }
        params.push('--debugall'); // always run with debug so line jumping works; strip for display when mode is 'off'
        if (config.get('shortenOutputCode')) {
            params.push('--shorten', String(config.get('shortenOutputLineLimit')));
        }
        params.push('--property', 'unit', String(this.selectUnits()));
        let programName = config.get('programName');
        if (!programName) {
            config.update('programName', '1001', true);
            programName = '1001';
            vscode.window.showInformationMessage("Program name hasn't been specified, using 1001.");
        }
        params.push('--property', 'programName', programName);
        const includePath = config.get('includePath');
        if ((0, utils_1.fileExists)(includePath)) {
            params.push('--include', includePath);
        }
        const outputTarget = isSecondary ? this.secondaryOutputPath : this.outputPath;
        params.unshift(postLocation, this.cncFile, outputTarget);
        // Apply user-modified properties from cache
        const cache = this.getPropertyCache(this.postFile);
        if (cache) {
            for (const [key, val] of Object.entries(cache.changed.properties)) {
                const raw = typeof val === 'object' && val !== null && val.value !== undefined
                    ? val.value
                    : val;
                let setting = String(raw);
                if (typeof raw === 'string') {
                    setting = `'${raw}'`;
                }
                params.push('--property', key, setting);
            }
        }
        return params;
    }
    createParametersForFile(postLocation, cncPath, outputPath, forRegressionTest = false, noDebugAll = false) {
        const params = ['--noeditor'];
        if (this.machineFile) {
            params.unshift(this.machineFile);
            params.unshift('--machine');
        }
        if (!forRegressionTest && !noDebugAll) {
            params.push('--debugall'); // always run with debug so line jumping works when display is 'off'
        }
        if (config.get('shortenOutputCode')) {
            params.push('--shorten', String(config.get('shortenOutputLineLimit')));
        }
        params.push('--property', 'unit', String(this.selectUnits()));
        let programName = config.get('programName') || '1001';
        params.push('--property', 'programName', programName);
        const includePath = config.get('includePath');
        if ((0, utils_1.fileExists)(includePath)) {
            params.push('--include', includePath);
        }
        params.unshift(postLocation, cncPath, outputPath);
        const cache = this.getPropertyCache(this.postFile);
        if (cache) {
            for (const [key, val] of Object.entries(cache.changed.properties)) {
                const raw = typeof val === 'object' && val !== null && val.value !== undefined
                    ? val.value
                    : val;
                let setting = String(raw);
                if (typeof raw === 'string')
                    setting = `'${raw}'`;
                params.push('--property', key, setting);
            }
        }
        return params;
    }
    getRegressionOutputKey(cncPath) {
        const base = path.basename(cncPath, path.extname(cncPath));
        const dirs = this.getWatchedDirs();
        for (const root of dirs) {
            if (cncPath.startsWith(root + path.sep)) {
                const rel = path.relative(root, path.dirname(cncPath));
                if (!rel || rel === '..')
                    return base;
                const sanitized = rel.replace(/[\\/]/g, '__');
                return `${sanitized}__${base}`;
            }
        }
        return base;
    }
    getWatchedDirs() {
        const dirs = [path.join(this.resLocation, 'CNC files')];
        const custom = config.get('customCNCLocations') ?? {};
        if (custom.folders)
            dirs.push(...custom.folders.filter(f => (0, utils_1.fileExists)(f)));
        return dirs;
    }
    async runPostForFile(cncPath, outputPath, forRegressionTest = false) {
        const postLocation = this.getCpsPath();
        if (!postLocation || !(0, utils_1.fileExists)(this.postExecutable))
            return false;
        (0, utils_1.ensureDir)(path.dirname(outputPath));
        const params = this.createParametersForFile(postLocation, cncPath, outputPath, forRegressionTest);
        const timeout = config.get('timeoutForPostProcessing') * 1000;
        try {
            await (0, utils_1.execFileAsync)(this.postExecutable, params, { timeout });
            if (!(0, utils_1.fileExists)(outputPath))
                return false;
            if (forRegressionTest || getDebugOutputMode() === 'off') {
                await removeDebugLines(outputPath, postLocation, this.debugOutputPath);
            }
            return true;
        }
        catch {
            return false;
        }
    }
    /** Run post with explicit paths (e.g. instrumented temp .cps). Uses this.postFile for property cache. noDebugAll: omit --debugall so output has no !DEBUG: lines (e.g. for Show debug). */
    async runPostWithPaths(postPath, cncPath, outputPath, noDebugAll = false) {
        if (!(0, utils_1.fileExists)(this.postExecutable))
            return false;
        (0, utils_1.ensureDir)(path.dirname(outputPath));
        const params = this.createParametersForFile(postPath, cncPath, outputPath, false, noDebugAll);
        const timeout = config.get('timeoutForPostProcessing') * 1000;
        try {
            await (0, utils_1.execFileAsync)(this.postExecutable, params, { timeout });
            return (0, utils_1.fileExists)(outputPath);
        }
        catch {
            return false;
        }
    }
    /** Extract JS identifiers/dotted expressions and no-arg call expressions (e.g. foo.bar()) for debug logging. Skips identifiers inside string literals and comments. */
    static extractExpressionsFromLine(lineText) {
        const reserved = new Set(['true', 'false', 'null', 'undefined', 'function', 'return', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'in', 'of', 'new', 'typeof', 'instanceof', 'getProperty']);
        // Remove string literals first so we don't treat // inside a string as start of comment
        const withoutStrings = lineText
            .replace(/"(?:[^"\\]|\\.)*"/g, ' ')
            .replace(/'(?:[^'\\]|\\.)*'/g, ' ')
            .replace(/`(?:[^`\\]|\\.)*`/g, ' ');
        // Remove comments so we don't treat e.g. "simple" and "positioning" in "// simple positioning" as variables
        const withoutComments = withoutStrings
            .replace(/\/\*[\s\S]*?\*\//g, ' ')
            .replace(/\/\/.*$/g, ' ');
        const seen = new Set();
        const innerOfNegated = new Set();
        const innerOfComparison = new Set();
        const idOrDotted = '[a-zA-Z_$][a-zA-Z0-9_$]*(?:\\.[a-zA-Z_$][a-zA-Z0-9_$]*)*';
        const idOrDottedOrCall = idOrDotted + '(?:\\s*\\(\\s*\\))?';
        const cmpOp = '===?|!==?|<=?|>=?';
        const comparisonRe = new RegExp(`\\b(${idOrDottedOrCall})\\s*(${cmpOp})\\s*(${idOrDottedOrCall})\\b`, 'g');
        let m;
        while ((m = comparisonRe.exec(withoutComments)) !== null) {
            const left = m[1].replace(/\s/g, '').trim();
            const op = m[2];
            const right = m[3].replace(/\s/g, '').trim();
            if (reserved.has(left) || reserved.has(right))
                continue;
            const expr = `${left} ${op} ${right}`.replace(/\s+/g, ' ');
            seen.add(expr);
            innerOfComparison.add(left);
            innerOfComparison.add(right);
            const lastPart = (s) => s.replace(/\s*\(\s*\)\s*$/, '').split('.').pop();
            if (left.includes('.') || left.endsWith('()'))
                innerOfComparison.add(lastPart(left));
            if (right.includes('.') || right.endsWith('()'))
                innerOfComparison.add(lastPart(right));
        }
        // Negated expressions first (e.g. !isFirstSection()); record inner so we don't also add the non-negated form
        const notCallRe = /!(?=[a-zA-Z_$])[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*\s*\(\s*\)/g;
        while ((m = notCallRe.exec(withoutComments)) !== null) {
            const expr = '!' + m[0].slice(1).replace(/\s/g, '');
            const base = expr.slice(1, -2);
            if (!reserved.has(base)) {
                seen.add(expr);
                innerOfNegated.add(expr.slice(1));
            }
        }
        const notIdRe = /!(?=[a-zA-Z_$])[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*(?=\s*[&\|\)\]},;]|\s*$)/g;
        while ((m = notIdRe.exec(withoutComments)) !== null) {
            const expr = m[0].replace(/\s/g, '');
            const inner = expr.slice(1);
            if (!reserved.has(inner) && !/^\d+$/.test(inner)) {
                seen.add(expr);
                innerOfNegated.add(inner);
            }
        }
        // No-arg call expressions; skip if we already added the negated form or they're operands of a comparison
        const callRe = /[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*\s*\(\s*\)/g;
        while ((m = callRe.exec(withoutComments)) !== null) {
            const expr = m[0].replace(/\s/g, '');
            if (innerOfNegated.has(expr) || innerOfComparison.has(expr))
                continue;
            const base = expr.slice(0, -2);
            if (!reserved.has(base) && !reserved.has(expr))
                seen.add(expr);
        }
        // Plain identifiers and dotted property paths; skip if negated form or comparison operands
        const idRe = /[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*/g;
        while ((m = idRe.exec(withoutComments)) !== null) {
            const expr = m[0];
            if (innerOfNegated.has(expr) || innerOfComparison.has(expr))
                continue;
            if (!reserved.has(expr) && !/^\d+$/.test(expr))
                seen.add(expr);
        }
        return Array.from(seen);
    }
    /** For each getProperty("name") or getProperty('name') in the line, return { label, expression } to call getProperty in the injected code. */
    static expandGetPropertyCalls(lineText) {
        const re = /getProperty\s*\(\s*["'][^"']*["']\s*\)/g;
        const out = [];
        let m;
        while ((m = re.exec(lineText)) !== null) {
            const expr = m[0];
            if (expr.length > 0)
                out.push({ label: expr, expression: expr });
        }
        return out;
    }
    /** For var/let/const name = expr, return { label, expression } so we log the initializer result (variable is still undefined before the line runs). */
    static expandVarDeclInitializers(lineText) {
        const out = [];
        const oneLine = lineText.replace(/\r?\n/g, ' ').trim();
        const m = oneLine.match(/^\s*(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(.+)$/);
        if (m) {
            const name = m[1];
            const rhs = m[2].trim().replace(/\s*;\s*$/, '').replace(/\s+/g, ' ');
            if (rhs.length > 0)
                out.push({ label: name, expression: rhs });
        }
        return out;
    }
    /** Identifiers (and dotted paths) that appear in the RHS of any initializer, so we can skip printing them when they are only used as arguments. */
    static getInitializerRhsIdentifiers(initializers) {
        const ids = new Set();
        const idRe = /[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*/g;
        for (const i of initializers) {
            let m;
            while ((m = idRe.exec(i.expression)) !== null)
                ids.add(m[0]);
        }
        return ids;
    }
    /** For plain assignment name = expr (no var/let/const), return { label, expression } so we log the RHS result as the assigned name (LHS is still stale before the line runs). */
    static expandAssignmentRHS(lineText) {
        const oneLine = lineText.replace(/\r?\n/g, ' ').trim();
        if (/^\s*(?:var|let|const)\s+/.test(oneLine))
            return [];
        const m = oneLine.match(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)?)\s*=\s*(.+)$/);
        if (!m)
            return [];
        const lhs = m[1].trim();
        const rhs = m[2].trim().replace(/\s*;\s*$/, '').replace(/\s+/g, ' ');
        return rhs.length > 0 ? [{ label: lhs, expression: rhs }] : [];
    }
    /** If the line is if (condition) or if (condition) {, return the condition expression (handles nested parens). Otherwise return null. */
    static extractConditionFromIf(lineText) {
        const oneLine = lineText.replace(/\r?\n/g, ' ').trim();
        const ifMatch = oneLine.match(/^\s*if\s*\(\s*/);
        if (!ifMatch)
            return null;
        let start = ifMatch[0].length;
        let depth = 1;
        for (let i = start; i < oneLine.length; i++) {
            const c = oneLine[i];
            if (c === '(')
                depth++;
            else if (c === ')') {
                depth--;
                if (depth === 0)
                    return oneLine.slice(start, i).trim().replace(/\s+/g, ' ');
            }
        }
        return null;
    }
    /** Build instrumented .cps content that logs given expressions right before the given line (0-based) so the debug runs unconditionally. When the selected line is a switch statement, inject one line earlier so the parser never sees our code immediately before 'switch'. Each expression is evaluated in its own try-catch so one failure (e.g. getPreviousSection() when none) does not abort the whole block. Objects are serialized via __serialize (copy enumerable own props) so kernel objects show content instead of {}. */
    static buildInstrumentedCps(fullText, lineNum, expressions, eol, getPropertyCalls = [], initializersCount = 0) {
        const serializeHelper = `function __serialize(v, d) { if (d > 10) return "[max depth]"; if (v === null || typeof v !== "object") return v; if (Array.isArray(v)) { var a = []; for (var i = 0; i < v.length; i++) a[i] = __serialize(v[i], d + 1); return a; } var c = {}; try { var names = Object.getOwnPropertyNames(v); for (var i = 0; i < names.length; i++) { var p = names[i]; try { var desc = Object.getOwnPropertyDescriptor(v, p); if (desc && typeof desc.get === "function") { try { c[p] = __serialize(desc.get.call(v), d + 1); } catch (e) { c[p] = "[getter]"; } } else { c[p] = __serialize(v[p], d + 1); } } catch (e) { c[p] = "[error]"; } } } catch (e) { for (var p in v) { if (Object.prototype.hasOwnProperty.call(v, p)) try { c[p] = __serialize(v[p], d + 1); } catch (err) { c[p] = "[error]"; } } } if (Object.keys(c).length === 0) { try { if (typeof v.x !== "undefined") c.x = __serialize(v.x, d + 1); if (typeof v.y !== "undefined") c.y = __serialize(v.y, d + 1); if (typeof v.z !== "undefined") c.z = __serialize(v.z, d + 1); } catch (e) {} try { if (typeof v.length !== "undefined") c.length = __serialize(v.length, d + 1); } catch (e) {} } if (("x" in c) && ("y" in c) && ("z" in c)) return "(" + c.x + "," + c.y + "," + c.z + ")"; return c; }\n`;
        const helper = `function __debugLine(id, fn) { try { var obj = fn(); var out = {}; for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k] === undefined ? "undefined" : obj[k]; } writeln("!DEBUG: 0 __debug " + id + " " + JSON.stringify(out)); } catch (e) { writeln("!DEBUG: 0 __debug " + id + " ERROR: " + String(e).replace(/"/g, "'")); } }\n`;
        const lines = fullText.split(/\r?\n/);
        const lineOneBased = lineNum + 1;
        const isSwitchLine = /^\s*switch\s*\(/.test(lines[lineNum] || '');
        const injectAt = isSwitchLine ? Math.max(0, lineNum - 1) : lineNum;
        const labelEsc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const errSuffix = `String(err).replace(/"/g, "'")`;
        const entries = [];
        getPropertyCalls.forEach((c) => {
            entries.push({ keyEsc: labelEsc(c.label), valueExpr: c.expression });
        });
        expressions.forEach((e) => {
            entries.push({ keyEsc: labelEsc(e), valueExpr: e });
        });
        const tryCatchStmts = entries.map(({ keyEsc, valueExpr }) =>
            `try { out["${keyEsc}"] = __serialize((${valueExpr}), 0); } catch (err) { out["${keyEsc}"] = "ERROR: " + ${errSuffix}; }`).join(' ');
        const body = `var out = {}; ${tryCatchStmts} return out;`;
        const debugCall = serializeHelper + `__debugLine(${lineOneBased}, function() { ${body} });`;
        const before = lines.slice(0, injectAt).join(eol);
        const theLine = lines[injectAt];
        const after = lines.slice(injectAt + 1).join(eol);
        return helper + before + eol + debugCall + eol + theLine + eol + after;
    }
    /** Match our injected !DEBUG line: !DEBUG: 0 __debug <id> <payload> (no extra NC line). */
    static OUR_DEBUG_LINE_RE = /^!DEBUG:\s*0\s+__debug\s+(\d+)\s+(.*)$/;
    /** Consume our !DEBUG lines from raw post output: emit pretty-printed "(DEBUG id ...)" so debug is readable. Call stack offset is corrected by getDebugLineCountBefore when indexing .stack.json. */
    static consumeOurDebugLines(ncContent) {
        const eolMatch = ncContent.match(/\r\n|\r|\n/);
        const eol = eolMatch ? eolMatch[0] : '\n';
        const lines = ncContent.split(/\r?\n/);
        const out = [];
        for (const line of lines) {
            const m = line.match(PostEngine.OUR_DEBUG_LINE_RE);
            if (m) {
                const id = m[1];
                const payload = m[2].trim();
                if (/^ERROR:/.test(payload)) {
                    out.push('(DEBUG ' + id + ' ' + payload + ')');
                    continue;
                }
                try {
                    const data = JSON.parse(payload);
                    const keys = Object.keys(data);
                    const simpleKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
                    const sortedKeys = keys.filter(k => simpleKey.test(k)).concat(keys.filter(k => !simpleKey.test(k)));
                    out.push('(DEBUG line ' + id + ':');
                    for (const k of sortedKeys) {
                        const v = data[k];
                        let str;
                        if (v === null)
                            str = 'null';
                        else if (typeof v === 'string')
                            str = JSON.stringify(v);
                        else if (typeof v === 'object') {
                            try {
                                str = JSON.stringify(v, null, 2);
                            }
                            catch (e) {
                                str = '[object Object] (circular)';
                            }
                        }
                        else
                            str = String(v);
                        if (typeof v === 'object' && v !== null && str.indexOf('\n') >= 0) {
                            const lines = str.split(/\n/);
                            out.push('  ' + k + ' = ' + lines[0]);
                            for (let i = 1; i < lines.length; i++)
                                out.push('    ' + lines[i]);
                        }
                        else {
                            out.push('  ' + k + ' = ' + str);
                        }
                    }
                    out.push(')');
                }
                catch {
                    out.push('(DEBUG ' + id + ' ' + payload + ')');
                }
                continue;
            }
            out.push(line);
        }
        return out.join(eol);
    }
    /** Count how many "extra" lines from DEBUG blocks appear before lineIndex (0-based). Multi-line blocks add more than one; subtract so .stack.json index is correct. */
    static getDebugLineCountBefore(ncContent, lineIndex) {
        const lines = ncContent.split(/\r?\n/);
        const blocks = [];
        for (let i = 0; i < lines.length; i++) {
            if (!/^\(DEBUG\s+(?:line\s+)?\d+/.test(lines[i]))
                continue;
            let end = i;
            if (!lines[i].trim().endsWith(')')) {
                for (let j = i + 1; j < lines.length; j++) {
                    end = j;
                    if (lines[j].trim() === ')')
                        break;
                }
            }
            blocks.push({ start: i, end });
        }
        let offset = 0;
        for (const { start, end } of blocks) {
            if (start >= lineIndex)
                break;
            const lastLineInBlockBefore = Math.min(end, lineIndex - 1);
            offset += (lastLineInBlockBefore - start + 1) - 1;
        }
        return offset > 0 ? offset + 1 : 0;
    }
    /** Parse (DEBUG lineNum json) lines from NC output. Handles single-line and pretty-printed multi-line. Returns { lineNum, data }[]. */
    static parseDebugLines(ncContent) {
        const results = [];
        const lines = ncContent.split(/\r?\n/);
        const errRe = /\(DEBUG\s+(\d+)\s+ERROR:\s*(.+)\)\s*$/;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const idx = line.indexOf('(DEBUG ');
            if (idx < 0)
                continue;
            const rest = line.slice(idx + 7);
            const errMatch = rest.match(/^(\d+)\s+ERROR:\s*(.+)\)\s*$/);
            if (errMatch) {
                results.push({ lineNum: parseInt(errMatch[1], 10), error: errMatch[2].trim() });
                continue;
            }
            const lineMatch = rest.match(/^line\s+(\d+)\s*:?\s*(.*)$/);
            const idMatch = lineMatch ? [null, lineMatch[1], lineMatch[2]] : rest.match(/^(\d+)\s*(.*)$/);
            if (!idMatch)
                continue;
            const lineNum = parseInt(idMatch[1], 10);
            const sameLinePayload = idMatch[2].trim();
            if (sameLinePayload.endsWith(')')) {
                const payload = sameLinePayload.slice(0, sameLinePayload.lastIndexOf(')')).trim();
                if (!payload)
                    continue;
                try {
                    const data = JSON.parse(payload);
                    results.push({ lineNum, data });
                }
                catch {
                    results.push({ lineNum, error: 'Invalid JSON' });
                }
                continue;
            }
            const acc = [sameLinePayload];
            let j = i + 1;
            for (; j < lines.length; j++) {
                const next = lines[j].trim();
                if (next === ')')
                    break;
                acc.push(lines[j]);
            }
            const payload = acc.join('\n').replace(/^\s+/, '').trim();
            if (!payload || j >= lines.length)
                continue;
            const isKeyValueFormat = !payload.startsWith('{');
            if (isKeyValueFormat) {
                const data = {};
                for (const ln of payload.split(/\r?\n/)) {
                    const eqIdx = ln.indexOf(' = ');
                    if (eqIdx < 0)
                        continue;
                    const key = ln.slice(0, eqIdx).trim();
                    const valStr = ln.slice(eqIdx + 3).trim();
                    let val = valStr;
                    if (valStr === 'true')
                        val = true;
                    else if (valStr === 'false')
                        val = false;
                    else if (/^-?\d+$/.test(valStr))
                        val = parseInt(valStr, 10);
                    else if (/^-?\d+\.\d*$/.test(valStr))
                        val = parseFloat(valStr);
                    else if ((valStr.startsWith('"') && valStr.endsWith('"')) || (valStr.startsWith("'") && valStr.endsWith("'")))
                        try {
                            val = JSON.parse(valStr);
                        }
                        catch {
                            val = valStr;
                        }
                    data[key] = val;
                }
                results.push({ lineNum, data });
            }
            else {
                try {
                    const data = JSON.parse(payload);
                    results.push({ lineNum, data });
                }
                catch {
                    results.push({ lineNum, error: 'Invalid JSON' });
                }
            }
            i = j;
        }
        return results;
    }
    async showDebugForLine(document, lineNum, selectedText) {
        const postPath = document.uri.fsPath;
        if (!postPath || !postPath.toLowerCase().endsWith('.cps')) {
            vscode.window.showWarningMessage('Post Utility: Debug selected line(s) is only available in a .cps file.');
            return;
        }
        this.postFile = postPath;
        if (!(0, utils_1.fileExists)(this.postExecutable)) {
            await this.locatePostExe(true);
            if (!(0, utils_1.fileExists)(this.postExecutable)) {
                vscode.window.showWarningMessage('Post executable not found.');
                return;
            }
        }
        const identifiers = PostEngine.extractExpressionsFromLine(selectedText);
        let getPropertyCalls = PostEngine.expandGetPropertyCalls(selectedText);
        const initializers = PostEngine.expandVarDeclInitializers(selectedText);
        const assignmentRhs = PostEngine.expandAssignmentRHS(selectedText);
        const varDeclNames = new Set(initializers.map(i => i.label.trim()));
        const assignmentLhsNames = new Set(assignmentRhs.map(a => a.label.trim()));
        const initializerRhsIds = PostEngine.getInitializerRhsIdentifiers(initializers);
        let expressions = Array.from(new Set(identifiers)).filter(e => !varDeclNames.has(e) && !assignmentLhsNames.has(e) && !initializerRhsIds.has(e));
        const conditionStr = PostEngine.extractConditionFromIf(selectedText);
        const conditionEntry = conditionStr ? [{ label: conditionStr, expression: conditionStr }] : [];
        getPropertyCalls = [...initializers, ...assignmentRhs, ...conditionEntry, ...getPropertyCalls];
        if (expressions.length === 0 && getPropertyCalls.length === 0) {
            vscode.window.showWarningMessage('No identifiers found on this line to debug.');
            return;
        }
        let cncPath = this.cncFile;
        if (!cncPath || !(0, utils_1.fileExists)(cncPath)) {
            await this.selectCNCFromQuickPick('');
            cncPath = this.cncFile;
            if (!cncPath) {
                vscode.window.showWarningMessage('No CNC file selected.');
                return;
            }
        }
        const eol = document.eol === 2 ? '\r\n' : '\n';
        const fullText = document.getText();
        const instrumented = PostEngine.buildInstrumentedCps(fullText, lineNum, expressions, eol, getPropertyCalls, initializers.length + assignmentRhs.length);
        const tmpId = `cps_debug_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const tempCpsPath = path.join(path.dirname(postPath), `_debug_${tmpId}.cps`);
        (0, utils_1.ensureDir)(this.outputDir);
        try {
            fs.writeFileSync(tempCpsPath, instrumented, 'utf-8');
            const ok = await this.runPostWithPaths(tempCpsPath, cncPath, this.outputPath, true);
            if (!ok) {
                let detail = '';
                if ((0, utils_1.fileExists)(this.logPath)) {
                    const logText = fs.readFileSync(this.logPath, 'utf-8');
                    const tail = logText.split(/\r?\n/).slice(-15).join('\n');
                    if (tail.length > 0)
                        detail = '\n\nLog tail:\n' + tail;
                }
                vscode.window.showErrorMessage('Post run failed. Check the log or try running the post normally first.' + detail);
                return;
            }
            let ncContent = fs.readFileSync(this.outputPath, 'utf-8');
            ncContent = PostEngine.consumeOurDebugLines(ncContent);
            fs.writeFileSync(this.outputPath, ncContent, 'utf-8');
            const hits = PostEngine.parseDebugLines(ncContent);
            await (0, utils_1.showOutputFile)(this.outputPath, vscode.ViewColumn.Two);
            if (hits.length === 0) {
                vscode.window.setStatusBarMessage(`Line ${lineNum + 1} was not executed (no DEBUG output).`, 5000);
            }
            else {
                const title = `Debug line ${lineNum + 1} (${hits.length} hit${hits.length === 1 ? '' : 's'}) — see debuggedfile.nc`;
                vscode.window.setStatusBarMessage(title, 5000);
            }
        }
        finally {
            try {
                if (fs.existsSync(tempCpsPath))
                    fs.unlinkSync(tempCpsPath);
            }
            catch { /* ignore */ }
        }
    }
    async runRegressionTest(selectedCncPaths) {
        const postLocation = this.getCpsPath();
        if (!postLocation) {
            vscode.window.showWarningMessage('The active document is not a postprocessor file.');
            return false;
        }
        if (selectedCncPaths.length === 0) {
            vscode.window.showWarningMessage('Select one or more CNC files in the Regression test view.');
            return false;
        }
        if (!(0, utils_1.fileExists)(this.postExecutable)) {
            await this.locatePostExe(true);
            if (!(0, utils_1.fileExists)(this.postExecutable))
                return false;
        }
        (0, utils_1.removeFilesInFolder)(this.regressionTestOutputDir);
        (0, utils_1.ensureDir)(this.regressionTestOutputDir);
        const failedPaths = [];
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Running regression test',
            cancellable: false,
        }, async (progress) => {
            for (let i = 0; i < selectedCncPaths.length; i++) {
                const cncPath = selectedCncPaths[i];
                const base = path.basename(cncPath, path.extname(cncPath));
                const uniqueKey = this.getRegressionOutputKey(cncPath);
                const outputPath = path.join(this.regressionTestOutputDir, `${uniqueKey}.nc`);
                progress.report({ message: base, increment: (100 / selectedCncPaths.length) });
                const ok = await this.runPostForFile(cncPath, outputPath, true);
                if (!ok)
                    failedPaths.push(cncPath);
            }
        });
        if (failedPaths.length > 0) {
            const list = failedPaths.map(p => path.basename(p)).join(', ');
            const detail = failedPaths.length <= 10 ? list : failedPaths.slice(0, 10).map(p => path.basename(p)).join(', ') + ` and ${failedPaths.length - 10} more`;
            vscode.window.showWarningMessage(`Regression test completed. ${failedPaths.length} of ${selectedCncPaths.length} failed: ${detail}`, 'Show full paths').then(choice => {
                if (choice === 'Show full paths') {
                    const channel = vscode.window.createOutputChannel('Regression test (failed)');
                    channel.clear();
                    channel.appendLine(`${failedPaths.length} of ${selectedCncPaths.length} failed:\n`);
                    failedPaths.forEach(p => channel.appendLine(p));
                    channel.show();
                }
            });
        }
        return true;
    }
    async createRegressionReferenceFiles(selectedCncPaths) {
        if (this.hasRegressionReference()) {
            const choice = await vscode.window.showWarningMessage('Reference already exists. Overwrite?', { modal: true }, 'Overwrite', 'Cancel');
            if (choice !== 'Overwrite')
                return;
        }
        const ran = await this.runRegressionTest(selectedCncPaths);
        if (ran)
            await this.saveRegressionOutputAsReference();
    }
    async runRegressionAndCompare(selectedCncPaths) {
        const ran = await this.runRegressionTest(selectedCncPaths);
        if (ran)
            await this.compareRegressionWithReference();
    }
    hasRegressionReference() {
        if (!(0, utils_1.fileExists)(this.regressionTestReferenceDir))
            return false;
        const files = fs.readdirSync(this.regressionTestReferenceDir);
        return files.some(f => f.toLowerCase().endsWith('.nc'));
    }
    async saveRegressionOutputAsReference() {
        if (!(0, utils_1.fileExists)(this.regressionTestOutputDir)) {
            vscode.window.showWarningMessage('No regression test output to save.');
            return;
        }
        const files = fs.readdirSync(this.regressionTestOutputDir).filter(f => f.toLowerCase().endsWith('.nc'));
        if (files.length === 0) {
            vscode.window.showWarningMessage('No NC output in regression test results.');
            return;
        }
        (0, utils_1.removeFilesInFolder)(this.regressionTestReferenceDir);
        (0, utils_1.ensureDir)(this.regressionTestReferenceDir);
        for (const f of files) {
            fs.copyFileSync(path.join(this.regressionTestOutputDir, f), path.join(this.regressionTestReferenceDir, f));
        }
        vscode.window.showInformationMessage(`Reference saved (${files.length} file(s)). Edit your post, then use "Compare with reference" to see changes.`);
    }
    async compareRegressionWithReference() {
        if (!(0, utils_1.fileExists)(this.regressionTestOutputDir) || !(0, utils_1.fileExists)(this.regressionTestReferenceDir)) {
            vscode.window.showWarningMessage('Create reference files first.');
            return;
        }
        const outFiles = fs.readdirSync(this.regressionTestOutputDir).filter(f => f.toLowerCase().endsWith('.nc'));
        const refFiles = new Set(fs.readdirSync(this.regressionTestReferenceDir).filter(f => f.toLowerCase().endsWith('.nc')));
        const matching = outFiles.filter(f => refFiles.has(f));
        const toCompare = matching.filter(f => {
            const leftPath = path.join(this.regressionTestReferenceDir, f);
            const rightPath = path.join(this.regressionTestOutputDir, f);
            try {
                const left = fs.readFileSync(leftPath, 'utf8');
                const right = fs.readFileSync(rightPath, 'utf8');
                return left !== right;
            }
            catch {
                return true;
            }
        });
        if (toCompare.length === 0) {
            if (matching.length === 0)
                vscode.window.showWarningMessage('No matching files between current output and reference.');
            else
                vscode.window.showInformationMessage(`No differences: all ${matching.length} file(s) match the reference.`);
            return;
        }
        const diffToolOut = { errorMessage: undefined };
        const externalTool = resolveExternalDiffToolPath(diffToolOut);
        if (diffToolOut.errorMessage)
            vscode.window.showErrorMessage(diffToolOut.errorMessage);
        if (externalTool) {
            const winmergeSingleInstance = toCompare.length > 1 && /winmerge/i.test(externalTool);
            for (let i = 0; i < toCompare.length; i++) {
                const f = toCompare[i];
                const leftPath = path.resolve(path.join(this.regressionTestReferenceDir, f));
                const rightPath = path.resolve(path.join(this.regressionTestOutputDir, f));
                const args = winmergeSingleInstance ? ['/s', leftPath, rightPath] : [leftPath, rightPath];
                try {
                    cp.spawn(externalTool, args, {
                        detached: true,
                        stdio: 'ignore',
                        windowsHide: false,
                    }).unref();
                    if (i < toCompare.length - 1)
                        await (0, utils_1.delay)(400);
                }
                catch (e) {
                    vscode.window.showErrorMessage(`Failed to open external diff tool. ${e instanceof Error ? e.message : ''}`);
                    break;
                }
            }
            const diffList = toCompare.length <= 8 ? toCompare.join(', ') : toCompare.slice(0, 8).join(', ') + `, ... and ${toCompare.length - 8} more`;
            vscode.window.showInformationMessage(`${toCompare.length} of ${matching.length} file(s) have differences: ${diffList}`);
            return;
        }
        const opts = { viewColumn: vscode.ViewColumn.Two, preview: false };
        for (let i = 0; i < toCompare.length; i++) {
            const f = toCompare[i];
            const left = vscode.Uri.file(path.join(this.regressionTestReferenceDir, f));
            const right = vscode.Uri.file(path.join(this.regressionTestOutputDir, f));
            await vscode.commands.executeCommand('vscode.diff', left, right, `Reference ↔ Current: ${f}`, opts);
            if (i < toCompare.length - 1)
                await (0, utils_1.delay)(250);
        }
        const diffListBuiltin = toCompare.length <= 8 ? toCompare.join(', ') : toCompare.slice(0, 8).join(', ') + `, ... and ${toCompare.length - 8} more`;
        vscode.window.showInformationMessage(`${toCompare.length} of ${matching.length} file(s) have differences: ${diffListBuiltin}`);
    }
    // ── Post processing ─────────────────────────────────────────────
    async postProcess() {
        const postLocation = this.getCpsPath();
        if (!postLocation) {
            vscode.window.showWarningMessage('The active document is not a postprocessor file.');
            return;
        }
        if (!this.cncFile) {
            await this.selectCNCFromQuickPick('autodesk.post.postProcess');
            return;
        }
        if (!(0, utils_1.fileExists)(this.postExecutable)) {
            await this.locatePostExe(true);
        }
        (0, utils_1.removeFilesInFolder)(this.outputDir);
        vscode.commands.executeCommand('notifications.clearAll');
        const params = this.createParameters(postLocation, false);
        const timeout = config.get('timeoutForPostProcessing') * 1000;
        try {
            await (0, utils_1.execFileAsync)(this.postExecutable, params, { timeout });
            if ((0, utils_1.fileExists)(this.outputPath)) {
                const mode = getDebugOutputMode();
                if ((mode === 'inline' || mode === 'inline-detailed') && postLocation) {
                    // 1. Save raw debug output
                    fs.copyFileSync(this.outputPath, this.debugOutputPath);
                    // 2. Run inline transform on a temp copy to get entry-function annotations
                    const tempInline = this.outputPath + '.tmp_inline';
                    fs.copyFileSync(this.outputPath, tempInline);
                    transformDebugOutputToInline(tempInline, postLocation);
                    // 3. Extract annotations and build clean file from the inline output
                    const annotRe = /\s*\(→\s+(\w+)\s+ln:(\d+)\)\s*$/;
                    const inlineLines = fs.readFileSync(tempInline, 'utf-8').split('\n');
                    const annotations = [];
                    const cleanLines = [];
                    for (let i = 0; i < inlineLines.length; i++) {
                        const m = inlineLines[i].match(annotRe);
                        if (m) {
                            annotations.push({ line: i, fn: m[1], ln: parseInt(m[2], 10) });
                            cleanLines.push(inlineLines[i].substring(0, inlineLines[i].length - m[0].length).replace(/\s+$/, ''));
                        } else {
                            cleanLines.push(inlineLines[i]);
                        }
                    }
                    // 4. Write the clean file
                    fs.writeFileSync(this.outputPath, cleanLines.join('\n'));
                    // 5. Write .stack.json for hover support
                    await removeDebugLines(this.debugOutputPath, postLocation, this.debugOutputPath, { writeCleanedFile: false });
                    const srcStack = this.debugOutputPath + '.stack.json';
                    const dstStack = this.outputPath + '.stack.json';
                    try { if ((0, utils_1.fileExists)(srcStack)) fs.copyFileSync(srcStack, dstStack); } catch { /* ignore */ }
                    // 6. For inline-detailed, enrich annotations with output-function info from .stack.json
                    if (mode === 'inline-detailed') {
                        try {
                            const stackData = JSON.parse(fs.readFileSync(dstStack, 'utf-8'));
                            const stacks = stackData?.stacks;
                            if (Array.isArray(stacks)) {
                                for (const a of annotations) {
                                    const stack = stacks[a.line];
                                    if (Array.isArray(stack) && stack.length > 0) {
                                        const innermost = stack[stack.length - 1];
                                        if (innermost?.name) {
                                            a.ofn = innermost.name;
                                            a.oln = innermost.line;
                                        }
                                    }
                                }
                            }
                        } catch { /* ignore */ }
                    }
                    fs.writeFileSync(this.outputPath + '.annotations.json', JSON.stringify(annotations), 'utf-8');
                    try { fs.unlinkSync(tempInline); } catch { /* ignore */ }
                    await this.context.workspaceState.update('debugOutputPostPath', {
                        postPath: postLocation,
                        outputPath: this.outputPath,
                        decorationMode: mode,
                    });
                }
                else if (mode === 'off') {
                    await removeDebugLines(this.outputPath, postLocation, this.debugOutputPath);
                    if (postLocation) {
                        await this.context.workspaceState.update('debugOutputPostPath', {
                            postPath: postLocation,
                            outputPath: this.outputPath,
                        });
                    }
                }
                else if (mode === 'full' && postLocation) {
                    await removeDebugLines(this.outputPath, postLocation, this.debugOutputPath, { writeCleanedFile: false });
                    await this.context.workspaceState.update('debugOutputPostPath', {
                        postPath: postLocation,
                        outputPath: this.outputPath,
                    });
                }
                await (0, utils_1.showOutputFile)(this.outputPath, vscode.ViewColumn.Two);
            }
            // Only the main output (debuggedfile.nc) is shown to the user; skip processing other files in output dir.
            if (config.get('showWarningMessages') && (0, utils_1.fileExists)(this.logPath)) {
                await findWarningMessages(this.logPath);
            }
        }
        catch (err) {
            const e = err;
            if (e.signal === 'SIGTERM') {
                vscode.window.showErrorMessage('Post processing failed due to timeout.');
                return;
            }
            if ((0, utils_1.fileExists)(this.logPath)) {
                vscode.window.showInformationMessage('Post processing failed, see the log for details.');
                await (0, utils_1.showOutputFile)(this.logPath, vscode.ViewColumn.Two);
                findErrorLine(this.logPath, this.postFile);
            }
            else {
                const msg = err.message ?? '';
                vscode.window.showInformationMessage(`Post processing failed: ${msg} ${e.stdout ?? ''}`);
            }
        }
    }
    // ── Post compare ────────────────────────────────────────────────
    async postCompare() {
        const postLocation = this.getCpsPath();
        if (!postLocation) {
            vscode.window.showWarningMessage('The active document is not a postprocessor file.');
            return;
        }
        if (!(0, utils_1.fileExists)(this.postExecutable)) {
            await this.locatePostExe(true);
            if (!(0, utils_1.fileExists)(this.postExecutable)) {
                await this.locatePostExe(false);
                return;
            }
        }
        this.secondaryPostExecutable = config.get('secondaryPostExecutablePath');
        if (!(0, utils_1.fileExists)(this.secondaryPostExecutable)) {
            await this.locateSecondaryPostExe(true);
            if (!(0, utils_1.fileExists)(this.secondaryPostExecutable)) {
                await this.locateSecondaryPostExe(false);
                return;
            }
        }
        if (!this.cncFile) {
            await this.selectCNCFromQuickPick('autodesk.post.postCompare');
            return;
        }
        (0, utils_1.removeFilesInFolder)(this.outputDir);
        vscode.commands.executeCommand('notifications.clearAll');
        const params = this.createParameters(postLocation, true, false);
        const secondaryParams = this.createParameters(postLocation, true, true);
        const timeout = config.get('timeoutForPostProcessing') * 1000;
        try {
            await (0, utils_1.execFileAsync)(this.postExecutable, params, { timeout });
        }
        catch {
            vscode.window.showInformationMessage('Primary post processing failed. Post process separately to troubleshoot.');
            return;
        }
        try {
            await (0, utils_1.execFileAsync)(this.secondaryPostExecutable, secondaryParams, { timeout });
        }
        catch (err) {
            const e = err;
            if (e.signal === 'SIGTERM') {
                vscode.window.showErrorMessage('Secondary post processing failed due to timeout.');
                return;
            }
            if ((0, utils_1.fileExists)(this.secondaryLogPath)) {
                vscode.window.showInformationMessage('Secondary post processing failed, see the log.');
                await (0, utils_1.showOutputFile)(this.secondaryLogPath, vscode.ViewColumn.Two);
                findErrorLine(this.secondaryLogPath, this.postFile);
            }
            else {
                vscode.window.showInformationMessage(`Secondary post processing failed: ${err.message}`);
            }
            return;
        }
        if ((0, utils_1.fileExists)(this.outputPath) && (0, utils_1.fileExists)(this.secondaryOutputPath)) {
            await (0, utils_1.delay)(100);
            const uri1 = vscode.Uri.file(this.outputPath);
            const uri2 = vscode.Uri.file(this.secondaryOutputPath);
            vscode.commands.executeCommand('vscode.diff', uri1, uri2, 'Primary output <-> Secondary output');
        }
    }
    // ── NC diff viewer ──────────────────────────────────────────────
    get referencePath() {
        return path.join(this.workDir, 'reference.nc');
    }
    hasReferenceOutput() {
        return (0, utils_1.fileExists)(this.referencePath);
    }
    async compareNCFiles() {
        const ncFilters = {
            'NC / G-code': ['nc', 'tap', 'cnc', 'gc', 'mpf', 'spf', 'h'],
            'All files': ['*'],
        };
        const uris = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: true,
            filters: ncFilters,
            title: 'Select two NC files to compare',
        });
        if (!uris || uris.length < 2)
            return;
        const [left, right] = uris;
        const title = `${path.basename(left.fsPath)} ↔ ${path.basename(right.fsPath)}`;
        await vscode.commands.executeCommand('vscode.diff', left, right, title);
    }
    async saveOutputAsReference() {
        if (!(0, utils_1.fileExists)(this.outputPath)) {
            vscode.window.showWarningMessage('No NC output to save. Run Post Process first.');
            return;
        }
        (0, utils_1.ensureDir)(path.dirname(this.referencePath));
        fs.copyFileSync(this.outputPath, this.referencePath);
        vscode.window.showInformationMessage('Reference output saved. Edit your post, run again, then use "Compare with reference" to see changes.');
    }
    async compareWithReference() {
        if (!(0, utils_1.fileExists)(this.outputPath)) {
            vscode.window.showWarningMessage('No current output. Run Post Process first.');
            return;
        }
        if (!(0, utils_1.fileExists)(this.referencePath)) {
            const save = await vscode.window.showQuickPick(['Save current output as reference', 'Cancel'], { placeHolder: 'No reference output saved yet. Save current output first?' });
            if (save === 'Save current output as reference') {
                await this.saveOutputAsReference();
            }
            return;
        }
        const diffToolOut = { errorMessage: undefined };
        const externalTool = resolveExternalDiffToolPath(diffToolOut);
        if (diffToolOut.errorMessage)
            vscode.window.showErrorMessage(diffToolOut.errorMessage);
        if (externalTool) {
            try {
                const ref = path.resolve(this.referencePath);
                const cur = path.resolve(this.outputPath);
                cp.spawn(externalTool, [ref, cur], {
                    detached: true,
                    stdio: 'ignore',
                    windowsHide: false,
                }).unref();
            }
            catch (e) {
                vscode.window.showErrorMessage(`Failed to open external diff tool. ${e instanceof Error ? e.message : ''}`);
                const uri1 = vscode.Uri.file(this.referencePath);
                const uri2 = vscode.Uri.file(this.outputPath);
                await vscode.commands.executeCommand('vscode.diff', uri1, uri2, 'Reference (saved earlier) ↔ Current (just generated)');
            }
        }
        else {
            const uri1 = vscode.Uri.file(this.referencePath);
            const uri2 = vscode.Uri.file(this.outputPath);
            await vscode.commands.executeCommand('vscode.diff', uri1, uri2, 'Reference (saved earlier) ↔ Current (just generated)');
        }
    }
    async showNCOutputComparison() {
        const hasRef = this.hasReferenceOutput();
        const hasCurrent = (0, utils_1.fileExists)(this.outputPath);
        const items = [
            { label: '$(git-compare) Compare with reference', id: 'compare' },
            { label: '$(bookmark) Save current output as reference', id: 'save' },
            { label: '$(files) Compare two NC files...', id: 'two' },
        ];
        if (!hasRef) {
            items[0].label += ' (no reference saved yet)';
        }
        const picked = await vscode.window.showQuickPick(items, {
            placeHolder: 'NC output comparison',
            matchOnDescription: false,
        });
        if (!picked)
            return;
        if (picked.id === 'compare') {
            await this.compareWithReference();
        }
        else if (picked.id === 'save') {
            await this.saveOutputAsReference();
        }
        else {
            await this.compareNCFiles();
        }
    }
    // ── Merge ───────────────────────────────────────────────────────
    async mergePost() {
        this.ensurePostKernel();
        const postLocation = this.getCpsPath();
        if (!postLocation)
            return;
        const mergeFile = postLocation.split('.cps')[0] + '.merged.cps';
        const args = [postLocation, '--merge', mergeFile];
        const includePath = config.get('includePath');
        if ((0, utils_1.fileExists)(includePath)) {
            args.push('--include', includePath);
        }
        try {
            const timeout = config.get('timeoutForPostProcessing') * 1000;
            await (0, utils_1.execFileAsync)(this.postExecutable, args, { timeout });
            vscode.window.showInformationMessage('Merge successful. The merged post is in your post processors directory.');
            const doc = await vscode.workspace.openTextDocument(mergeFile);
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
        }
        catch (err) {
            const e = err;
            vscode.window.showErrorMessage(`Merge failed: ${e.stderr ?? err.message}`);
        }
    }
    // ── Encrypt / Decrypt ───────────────────────────────────────────
    async postEncryption(encrypt) {
        if (!this.checkActiveDocumentForPost())
            return;
        if (!encrypt) {
            const name = vscode.window.activeTextEditor.document.fileName;
            if (!name.toUpperCase().includes('PROTECTED.CPS')) {
                vscode.window.showInformationMessage('Open a .protected.cps file to start decryption.');
                return;
            }
            this.postFile = name;
        }
        const password = await vscode.window.showInputBox({
            placeHolder: encrypt ? 'Enter your desired password' : 'Enter the post password',
        });
        if (!password)
            return;
        this.ensurePostKernel();
        const args = [this.postFile, encrypt ? '--encrypt' : '--decrypt', password];
        try {
            const timeout = config.get('timeoutForPostProcessing') * 1000;
            await (0, utils_1.execFileAsync)(this.postExecutable, args, { timeout });
            if (encrypt) {
                vscode.window.showInformationMessage('Encryption successful. The encrypted post is in your post processors directory.');
            }
            else {
                vscode.window.showInformationMessage('Decryption successful. If the password was correct, the unprotected post will be in the same directory.');
            }
        }
        catch {
            vscode.window.showErrorMessage(`${encrypt ? 'Encryption' : 'Decryption'} failed.`);
        }
    }
    // ── Version ─────────────────────────────────────────────────────
    _cachedPostVersion = null;
    clearPostVersionCache() {
        this._cachedPostVersion = null;
    }
    async getPostEngineVersion() {
        if (this._cachedPostVersion != null)
            return this._cachedPostVersion;
        this.ensurePostKernel();
        try {
            if (!(0, utils_1.fileExists)(this.postExecutable)) {
                this._cachedPostVersion = '';
                return '';
            }
            const timeout = config.get('timeoutForPostProcessing') * 1000;
            const { stdout } = await (0, utils_1.execFileAsync)(this.postExecutable, ['--version'], { timeout });
            const v = (stdout && stdout.trim()) || '';
            this._cachedPostVersion = v;
            if (v && !this.engineVersionStatusBar) {
                this.engineVersionStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 3);
                this.context.subscriptions.push(this.engineVersionStatusBar);
                this.engineVersionStatusBar.text = v;
                this.engineVersionStatusBar.show();
            }
            else if (this.engineVersionStatusBar && v) {
                this.engineVersionStatusBar.text = v;
                this.engineVersionStatusBar.show();
            }
            return v;
        }
        catch {
            this._cachedPostVersion = '';
            return '';
        }
    }
    async showPostEngineVersion() {
        const v = await this.getPostEngineVersion();
        if (v)
            vscode.window.showInformationMessage(v);
        else
            vscode.window.showErrorMessage('Post processor version could not be determined.');
    }
    // ── Update post properties code migration ───────────────────────
    async updatePostProperties() {
        const cpsPath = this.getCpsPath();
        if (!cpsPath)
            return;
        const data = await this.interrogatePost(cpsPath);
        if (!data?.properties) {
            vscode.window.showInformationMessage('This post processor does not have any properties defined.');
            return;
        }
        const updatedPropsStr = 'properties = ' +
            JSON.stringify(data.properties, null, 2).replace(/"(\w+)"\s*:/g, '$1:') + ';';
        const raw = fs.readFileSync(cpsPath, 'utf-8');
        const lines = raw.split('\n');
        let deleteLine = false;
        let bracketCount = 0;
        let bracketCount2 = 0;
        let insideFunction = false;
        let skipLine = false;
        let skipMultiLine = false;
        let foundProblem = false;
        let propertiesInserted = false;
        for (let i = 0; i < lines.length; i++) {
            const stripped = lines[i].replace(/\s/g, '');
            if (stripped.startsWith('function') && stripped.includes('{')) {
                insideFunction = true;
            }
            if (insideFunction) {
                if (stripped.startsWith('//'))
                    skipLine = true;
                if (stripped.startsWith('/**') || stripped.startsWith('/*'))
                    skipMultiLine = true;
                if (!skipLine && !skipMultiLine) {
                    if (stripped.includes('{'))
                        bracketCount++;
                    if (stripped.includes('}'))
                        bracketCount--;
                }
                skipLine = false;
                if (stripped.includes('*/'))
                    skipMultiLine = false;
                if (bracketCount === 0)
                    insideFunction = false;
            }
            if (!insideFunction) {
                if (stripped.includes('properties=') || stripped.includes('propertyDefinitions=') ||
                    stripped.startsWith('properties.') || stripped.startsWith('propertyDefinitions.') ||
                    stripped.startsWith('//user-definedpropertydefinitions')) {
                    deleteLine = true;
                }
            }
            if (deleteLine) {
                if (stripped.includes('{'))
                    bracketCount2++;
                if (stripped.includes('}'))
                    bracketCount2--;
                if (bracketCount2 === 0) {
                    deleteLine = false;
                    if (!propertiesInserted) {
                        lines[i] = updatedPropsStr;
                        propertiesInserted = true;
                    }
                    else {
                        lines[i] = '';
                    }
                }
                else {
                    lines[i] = '';
                }
                continue;
            }
            // Transform properties.x = value → setProperty("x", value)
            let isAssignment = false;
            if (lines[i].includes('properties.')) {
                isAssignment = stripped.search(/^properties.*?(?==)|properties[=\n\r]/gm) > -1;
                if (isAssignment) {
                    const propertyKey = stripped.slice(stripped.indexOf('.') + 1, stripped.indexOf('='));
                    const eqIdx = lines[i].indexOf('=');
                    const afterEq = lines[i].slice(eqIdx + 1);
                    let endPos = afterEq.search(/[*;/]/g);
                    if (endPos === -1)
                        endPos = afterEq.length;
                    const propVal = afterEq.substring(1, endPos).replace(/[\n\r]/g, '');
                    let remaining = '';
                    const remainingSearch = lines[i].slice(eqIdx).search(/[*;/]/g);
                    if (remainingSearch > -1) {
                        remaining = lines[i].substring(lines[i].search(/[*;/]/g)).replace(/[\n\r]/g, '');
                    }
                    if (!propertyKey || !propVal) {
                        vscode.window.showInformationMessage(`Failed to read property "${propertyKey}" in line ${i + 1}`);
                        lines[i] = 'ERROR' + stripped + '\n';
                        foundProblem = true;
                        continue;
                    }
                    lines[i].search(/^(\s*)/);
                    const leading = RegExp.$1;
                    lines[i] = `${leading}setProperty("${propertyKey}",${propVal})${remaining}\n`;
                }
                if (!lines[i].includes('error') && !lines[i].includes('warning') && !lines[i].includes('longDescription')) {
                    const re = /properties\.(.?[^\s)\],.+;}*-]*)/g;
                    const matches = lines[i].match(re) || [];
                    for (let j = 0; j < matches.length; j++) {
                        re.lastIndex = 0;
                        const m = re.exec(lines[i]);
                        if (m) {
                            lines[i] = lines[i].replace(`properties.${m[1]}`, `getProperty("${m[1]}")`);
                        }
                    }
                }
            }
            if (stripped.includes('minimumRevision')) {
                const revMatch = stripped.match(/[0-9]{5}/g);
                const requiredRev = 45702;
                if (revMatch && parseInt(revMatch[0]) < requiredRev) {
                    lines[i] = stripped.replace(`minimumRevision=${revMatch[0]}`, `minimumRevision = ${requiredRev}`) + '\n';
                }
            }
            lines[i] = lines[i].replace('\r', '\r\n');
        }
        lines.push('\r\n' +
            'function setProperty(property, value) {\r\n' +
            '  properties[property].current = value;\r\n' +
            '}\r\n');
        const targetDir = path.join(path.dirname(cpsPath), 'updatedPosts');
        (0, utils_1.ensureDir)(targetDir);
        const targetFile = path.join(targetDir, path.basename(cpsPath));
        fs.writeFileSync(targetFile, lines.join(''));
        const status = foundProblem ? 'Completed with errors' : 'Success';
        vscode.window.showInformationMessage(`${status}, updated postprocessor: ${targetFile}`);
    }
    // ── Custom data backup/restore ──────────────────────────────────
    /** Returns a hash of current backup-relevant state (dirs + settings) to skip full backup when unchanged. */
    _computeBackupStateHash() {
        const parts = [];
        const collectDir = (dir, excludeSubdir) => {
            if (!(0, utils_1.fileExists)(dir))
                return;
            const entries = [];
            const walk = (current, relPrefix) => {
                try {
                    for (const d of fs.readdirSync(current, { withFileTypes: true })) {
                        const full = path.join(current, d.name);
                        const rel = relPrefix ? path.join(relPrefix, d.name) : d.name;
                        if (d.isFile()) {
                            try { entries.push(`F:${rel}:${fs.statSync(full).mtime.getTime()}`); }
                            catch { /* skip */ }
                        }
                        else if (d.isDirectory() && d.name !== excludeSubdir) {
                            entries.push(`D:${rel}`);
                            walk(full, rel);
                        }
                    }
                }
                catch { /* skip */ }
            };
            walk(dir, '');
            entries.sort();
            parts.push(entries.join('\n'));
        };
        collectDir(path.join(this.resLocation, 'CNC files'), null);
        collectDir(path.join(this.resLocation, 'Machines'), 'Online Library');
        const cncLocations = config.get('customCNCLocations');
        const machLocations = config.get('customMachineLocations');
        parts.push(JSON.stringify(cncLocations ?? {}));
        parts.push(JSON.stringify(machLocations ?? {}));
        return (0, utils_1.getHash)(parts.join('::'));
    }
    backupCustomData() {
        const currentHash = this._computeBackupStateHash();
        const hashPath = path.join(this.workDir, 'BackupStateHash.txt');
        try {
            if ((0, utils_1.fileExists)(hashPath) && fs.readFileSync(hashPath, 'utf-8').trim() === currentHash)
                return;
        }
        catch { /* proceed with backup */ }
        const cncResDir = path.join(this.resLocation, 'CNC files');
        const machResDir = path.join(this.resLocation, 'Machines');
        const cncFullBackupExisted = (0, utils_1.fileExists)(this.cncFilesBackupDir);
        const machFullBackupExisted = (0, utils_1.fileExists)(this.machinesBackupDir);
        if ((0, utils_1.fileExists)(cncResDir)) {
            if (cncFullBackupExisted)
                fs.rmSync(this.cncFilesBackupDir, { recursive: true, force: true });
            fs.mkdirSync(this.cncFilesBackupDir, { recursive: true });
            (0, utils_1.copyFolderSync)(cncResDir, this.cncFilesBackupDir);
        }
        if ((0, utils_1.fileExists)(machResDir)) {
            if (machFullBackupExisted)
                fs.rmSync(this.machinesBackupDir, { recursive: true, force: true });
            fs.mkdirSync(this.machinesBackupDir, { recursive: true });
            (0, utils_1.copyFolderSync)(machResDir, this.machinesBackupDir);
            const onlineLibInBackup = path.join(this.machinesBackupDir, 'Online Library');
            if ((0, utils_1.fileExists)(onlineLibInBackup))
                fs.rmSync(onlineLibInBackup, { recursive: true, force: true });
        }
        if (!cncFullBackupExisted)
            this.copyCustomFiles(path.join(this.resLocation, 'CNC files', 'Custom'), this.customCNCDir, true);
        if (!machFullBackupExisted)
            this.copyCustomFiles(path.join(this.resLocation, 'Machines', 'Custom'), this.customMachinesDir, true);
        const cncLocations = config.get('customCNCLocations');
        const machLocations = config.get('customMachineLocations');
        if (cncLocations && typeof cncLocations === 'object' && Array.isArray(cncLocations.folders) && cncLocations.folders.length > 0) {
            fs.writeFileSync(path.join(this.workDir, 'CustomCNCLocations.json'), JSON.stringify(cncLocations, null, 0), 'utf-8');
        }
        if (machLocations && typeof machLocations === 'object' && Array.isArray(machLocations.folders) && machLocations.folders.length > 0) {
            fs.writeFileSync(path.join(this.workDir, 'CustomMachineLocations.json'), JSON.stringify(machLocations, null, 0), 'utf-8');
        }
        try {
            fs.writeFileSync(hashPath, currentHash, 'utf-8');
        }
        catch { /* ignore */ }
    }
    restoreCustomData() {
        const cncResDir = path.join(this.resLocation, 'CNC files');
        const machResDir = path.join(this.resLocation, 'Machines');
        if ((0, utils_1.fileExists)(this.cncFilesBackupDir)) {
            (0, utils_1.ensureDir)(cncResDir);
            (0, utils_1.copyFolderSync)(this.cncFilesBackupDir, cncResDir);
        }
        else if ((0, utils_1.fileExists)(this.customCNCDir)) {
            const cncCustom = path.join(cncResDir, 'Custom');
            if (!(0, utils_1.fileExists)(cncCustom)) {
                (0, utils_1.ensureDir)(cncCustom);
                this.copyCustomFiles(this.customCNCDir, cncCustom, false);
            }
        }
        if ((0, utils_1.fileExists)(this.machinesBackupDir)) {
            (0, utils_1.ensureDir)(machResDir);
            (0, utils_1.copyFolderSync)(this.machinesBackupDir, machResDir);
        }
        else if ((0, utils_1.fileExists)(this.customMachinesDir)) {
            const machCustom = path.join(machResDir, 'Custom');
            if (!(0, utils_1.fileExists)(machCustom)) {
                (0, utils_1.ensureDir)(machCustom);
                this.copyCustomFiles(this.customMachinesDir, machCustom, false);
            }
        }
        const cncBackupPath = path.join(this.workDir, 'CustomCNCLocations.json');
        const machBackupPath = path.join(this.workDir, 'CustomMachineLocations.json');
        if ((0, utils_1.fileExists)(cncBackupPath)) {
            try {
                const current = config.get('customCNCLocations');
                const backed = JSON.parse(fs.readFileSync(cncBackupPath, 'utf-8'));
                const currentFolders = current && Array.isArray(current.folders) ? current.folders : [];
                if (Array.isArray(backed.folders) && backed.folders.length > 0 && currentFolders.length === 0) {
                    config.update('customCNCLocations', backed, true);
                }
            }
            catch { /* ignore */ }
        }
        if ((0, utils_1.fileExists)(machBackupPath)) {
            try {
                const current = config.get('customMachineLocations');
                const backed = JSON.parse(fs.readFileSync(machBackupPath, 'utf-8'));
                const currentFolders = current && Array.isArray(current.folders) ? current.folders : [];
                if (Array.isArray(backed.folders) && backed.folders.length > 0 && currentFolders.length === 0) {
                    config.update('customMachineLocations', backed, true);
                }
            }
            catch { /* ignore */ }
        }
    }
    copyCustomFiles(source, destination, clearFirst) {
        if (!(0, utils_1.fileExists)(source))
            return;
        (0, utils_1.ensureDir)(destination);
        if (clearFirst) {
            (0, utils_1.removeFilesInFolder)(destination);
        }
        (0, utils_1.copyFolderSync)(source, destination);
    }
}
exports.PostEngine = PostEngine;
// ── Standalone helpers ──────────────────────────────────────────
/** Parses .cps file for function declarations; returns the function name that contains the given line (1-based). */
function getFunctionNameAtLine(postFile, lineNum) {
    if (!(0, utils_1.fileExists)(postFile) || lineNum < 1)
        return undefined;
    try {
        const content = fs.readFileSync(postFile, 'utf-8');
        const lines = content.split('\n');
        const functions = [];
        const funcRe = /function\s+(\w+)\s*\(/;
        for (let i = 0; i < lines.length; i++) {
            const m = lines[i].match(funcRe);
            if (m)
                functions.push({ line: i + 1, name: m[1] });
        }
        let best;
        for (const f of functions) {
            if (f.line <= lineNum)
                best = f;
        }
        return best?.name;
    }
    catch {
        return undefined;
    }
}
/** Returns the 1-based line number of the first "function name(" declaration in the post file, or undefined. */
function getLineForFunction(postFile, functionName) {
    if (!(0, utils_1.fileExists)(postFile) || !functionName)
        return undefined;
    try {
        const content = fs.readFileSync(postFile, 'utf-8');
        const lines = content.split('\n');
        const funcRe = new RegExp(`function\\s+${functionName.replace(/\W/g, '')}\\s*\\(`);
        for (let i = 0; i < lines.length; i++) {
            if (funcRe.test(lines[i]))
                return i + 1;
        }
        return undefined;
    }
    catch {
        return undefined;
    }
}
/** Parses .cps file once; returns cached getFunctionNameAtLine/getLineForFunction for use in hot loops. Per-run only; next post run reads current file. */
function parsePostFileCache(postFile) {
    if (!(0, utils_1.fileExists)(postFile))
        return null;
    try {
        const content = fs.readFileSync(postFile, 'utf-8');
        const lines = content.split('\n');
        const funcRe = /function\s+(\w+)\s*\(/;
        const functions = [];
        const nameToLine = {};
        for (let i = 0; i < lines.length; i++) {
            const m = lines[i].match(funcRe);
            if (m) {
                functions.push({ line: i + 1, name: m[1] });
                if (nameToLine[m[1]] === undefined)
                    nameToLine[m[1]] = i + 1;
            }
        }
        return {
            getFunctionNameAtLine(lineNum) {
                if (lineNum < 1)
                    return undefined;
                let best;
                for (const f of functions) {
                    if (f.line <= lineNum)
                        best = f;
                }
                return best?.name;
            },
            getLineForFunction(name) {
                const safe = name ? name.replace(/\W/g, '') : '';
                return safe ? nameToLine[safe] : undefined;
            },
        };
    }
    catch {
        return null;
    }
}
/** Parses a !DEBUG stack line "N file.cps:line"; returns { depth, line } or undefined. Path may contain spaces (e.g. "haas next generation.cps"). */
function parseDebugStackFrame(raw) {
    const rest = raw.replace(/^\s*!DEBUG\s*:\s*/i, '').trim();
    const m = rest.match(/^(\d+)\s+.+\.cps\s*:\s*(\d+)/i);
    if (m)
        return { depth: parseInt(m[1], 10), line: parseInt(m[2], 10) };
    return undefined;
}
/** Parses a !DEBUG line; returns { functionName?, line?, isCallSite? }. postCache from parsePostFileCache optional (avoids repeated file reads). */
function parseDebugLine(raw, postFile, postCache) {
    const upper = raw.toUpperCase();
    if (!upper.includes('!DEBUG'))
        return undefined;
    const rest = raw.replace(/^\s*!DEBUG\s*:\s*/i, '').trim();
    const fileLineMatch = rest.match(/(?:^\d+\s+)?.+\.cps\s*:\s*(\d+)/i);
    if (fileLineMatch) {
        const line = parseInt(fileLineMatch[1], 10);
        const functionName = postCache ? postCache.getFunctionNameAtLine(line) : getFunctionNameAtLine(postFile, line);
        return { functionName: functionName ?? path.basename(postFile), line, isCallSite: true };
    }
    const fnMatch = rest.match(/^(\w+)\s*\(/);
    if (fnMatch) {
        const lineMatch = rest.match(/:(\d+)\s*\)?$/);
        return { functionName: fnMatch[1], line: lineMatch ? parseInt(lineMatch[1], 10) : undefined, isCallSite: false };
    }
    return undefined;
}
const TAB_SIZE = 4;
function displayLength(s) {
    let len = 0;
    for (let i = 0; i < s.length; i++)
        len += s[i] === '\t' ? TAB_SIZE : 1;
    return len;
}
function formatDebugSuffix(info) {
    const part = info.functionName ?? '';
    const ln = info.line != null ? ` ln:${info.line}` : '';
    return ` (→ ${part}${ln})`;
}
/** Transforms debug output: one suffix " (→ functionName ln:line)" per NC line, right-aligned. Writes .stack.json for hover. */
function transformDebugOutputToInline(outputFile, postLocation) {
    if (!(0, utils_1.fileExists)(outputFile) || !(0, utils_1.fileExists)(postLocation))
        return;
    const postCache = parsePostFileCache(postLocation);
    const data = fs.readFileSync(outputFile, 'utf-8');
    const lines = data.split('\n');
    const out = [];
    const stacks = [];
    let lastEntry;
    let lastCallSite;
    let lastLineHasDebug = false;
    let callStack = [];
    const annotationRe = / \(→ \w+ ln:\d+\)$/;
    const getFnAtLine = postCache ? (ln) => postCache.getFunctionNameAtLine(ln) : (ln) => getFunctionNameAtLine(postLocation, ln);
    const getLnForFn = postCache ? (name) => postCache.getLineForFunction(name) : (name) => getLineForFunction(postLocation, name);
    for (const rawLine of lines) {
        const upper = rawLine.toUpperCase();
        const isDebug = upper.includes('!DEBUG');
        if (isDebug) {
            const frame = parseDebugStackFrame(rawLine);
            if (frame)
                callStack.push(frame);
            const info = parseDebugLine(rawLine, postLocation, postCache);
            if (info && (info.functionName || info.line != null)) {
                if (info.isCallSite) {
                    lastCallSite = { functionName: info.functionName, line: info.line };
                }
                else {
                    lastEntry = { functionName: info.functionName, line: info.line };
                }
                if (out.length > 0 && !lastLineHasDebug) {
                    let suffixInfo = lastCallSite ?? lastEntry;
                    if (suffixInfo && suffixInfo.functionName && suffixInfo.line == null) {
                        const ln = getLnForFn(suffixInfo.functionName);
                        if (ln != null)
                            suffixInfo = { ...suffixInfo, line: ln };
                    }
                    out[out.length - 1] = out[out.length - 1] + formatDebugSuffix(suffixInfo);
                    lastLineHasDebug = true;
                }
            }
            continue;
        }
        callStack.sort((a, b) => a.depth - b.depth);
        const showInStack = (name) => {
            if (name === 'writeBlock') return config.get('showWriteBlockInCallStack') === true;
            if (name === 'writeStartBlocks') return config.get('showWriteStartBlocksInCallStack') === true;
            return true;
        };
        const stackForLine = callStack.length > 0
            ? callStack
                .map(f => ({ name: getFnAtLine(f.line) ?? '?', line: f.line }))
                .filter(f => showInStack(f.name))
                .reverse()
            : null;
        stacks.push(stackForLine && stackForLine.length > 0 ? stackForLine : null);
        callStack = [];
        let lineOut = rawLine.replace(/\r$/, '');
        let suffixInfo = lastCallSite ?? lastEntry;
        if (suffixInfo && suffixInfo.functionName && suffixInfo.line == null) {
            const ln = getLnForFn(suffixInfo.functionName);
            if (ln != null)
                suffixInfo = { ...suffixInfo, line: ln };
        }
        const addedSuffix = suffixInfo && (suffixInfo.functionName || suffixInfo.line != null);
        if (addedSuffix) {
            lineOut = lineOut + formatDebugSuffix(suffixInfo);
        }
        out.push(lineOut);
        lastEntry = undefined;
        lastCallSite = undefined;
        lastLineHasDebug = !!addedSuffix;
    }
    // Normalize: compute max NC-part display length and re-pad so "(→" aligns — skip when annotations hidden (stripAnnotationPaddingFromFile runs later)
    if ((config.get('columnAlignInlineAnnotations') ?? config.get('showInlineAnnotations') ?? true) !== false) {
        const MIN_ANNOTATION_COLUMN = 45;
        const maxColRaw = config.get('columnAlignPaddingMax') ?? 0;
        const maxCol = maxColRaw > 0 ? Math.min(200, maxColRaw) : 0;
        let maxNcLen = 0;
        for (const line of out) {
            const m = line.match(annotationRe);
            if (m) {
                const idx = line.length - m[0].length;
                maxNcLen = Math.max(maxNcLen, displayLength(line.substring(0, idx)));
            }
        }
        let annotationColumn = Math.max(MIN_ANNOTATION_COLUMN, maxNcLen + 1);
        if (maxCol > 0)
            annotationColumn = Math.min(annotationColumn, maxCol);
        for (let i = 0; i < out.length; i++) {
            const line = out[i];
            const m = line.match(annotationRe);
            if (!m)
                continue;
            const idx = line.length - m[0].length;
            const ncPart = line.substring(0, idx);
            const suffix = line.substring(idx);
            const padLen = Math.max(0, annotationColumn - displayLength(ncPart) - 1);
            out[i] = ncPart + ' '.repeat(padLen) + suffix;
        }
    }
    fs.writeFileSync(outputFile, out.join('\n'));
    const stackPath = outputFile + '.stack.json';
    try {
        fs.writeFileSync(stackPath, JSON.stringify({ postPath: postLocation, stacks }), 'utf-8');
    }
    catch {
        // ignore
    }
}
/** Removes only the right-align padding before " (→ ...)". Keeps the annotation; result is "NC (→ ...)" with no extra spaces. */
function stripAnnotationPaddingFromFile(outputFile) {
    if (!(0, utils_1.fileExists)(outputFile))
        return;
    const annotationRe = / \s*\(→ \w+ ln:\d+\)\s*$/;
    const lines = fs.readFileSync(outputFile, 'utf-8').split('\n');
    const out = lines.map((line) => {
        const m = line.match(annotationRe);
        if (!m)
            return line;
        const idx = line.length - m[0].length;
        const ncPart = line.substring(0, idx).replace(/\s+$/, '');
        const suffix = line.substring(idx).trimStart();
        return ncPart + suffix;
    });
    fs.writeFileSync(outputFile, out.join('\n'));
}
/** When options.writeCleanedFile is false, do not overwrite outputFile; still write .stack.json. */
async function removeDebugLines(outputFile, postLocation, debugOutputPath, options = {}) {
    const writeCleanedFile = options.writeCleanedFile !== false;
    const postCache = postLocation ? parsePostFileCache(postLocation) : null;
    const getFnAtLine = postCache ? (ln) => postCache.getFunctionNameAtLine(ln) : () => undefined;
    const data = fs.readFileSync(outputFile, 'utf-8');
    const array = data.split('\n');
    let cleanedLines = '';
    let debugLines = postLocation ? `!DEBUG:${postLocation}\n` : '';
    let writeOutput = true;
    const stacksForCleanedLine = [];
    let callStack = [];
    const showInStack = (name) => {
        if (name === 'writeBlock')
            return config.get('showWriteBlockInCallStack') === true;
        if (name === 'writeStartBlocks')
            return config.get('showWriteStartBlocksInCallStack') === true;
        return true;
    };
    for (const rawLine of array) {
        const upper = rawLine.toUpperCase();
        const isDebug = upper.includes('!DEBUG');
        if (!writeOutput && isDebug) {
            writeOutput = true;
        }
        if (isDebug && (upper.includes('NOTES') || upper.includes('MATERIAL'))) {
            writeOutput = false;
        }
        if (isDebug) {
            if (writeOutput) {
                const frame = parseDebugStackFrame(rawLine);
                if (frame)
                    callStack.push(frame);
            }
            if (postLocation)
                debugLines += rawLine + '\n';
            continue;
        }
        if (writeOutput) {
            if (postLocation) {
                callStack.sort((a, b) => a.depth - b.depth);
                const stackForLine = callStack.length > 0
                    ? callStack
                        .map(f => ({ name: (postCache ? getFnAtLine(f.line) : getFunctionNameAtLine(postLocation, f.line)) ?? '?', line: f.line }))
                        .filter(f => showInStack(f.name))
                        .reverse()
                    : null;
                stacksForCleanedLine.push(stackForLine && stackForLine.length > 0 ? stackForLine : null);
            }
            cleanedLines += rawLine + '\n';
            callStack = [];
        }
        if (postLocation)
            debugLines += rawLine + '\n';
    }
    if (writeCleanedFile)
        fs.writeFileSync(outputFile, cleanedLines);
    if (postLocation && debugOutputPath) {
        fs.writeFileSync(debugOutputPath, debugLines);
    }
    if (postLocation && stacksForCleanedLine.length > 0) {
        try {
            fs.writeFileSync(outputFile + '.stack.json', JSON.stringify({ postPath: postLocation, stacks: stacksForCleanedLine }), 'utf-8');
        }
        catch {
            // ignore
        }
    }
}
function findErrorLine(logFile, postFile) {
    const data = fs.readFileSync(logFile, 'utf-8');
    const lines = data.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].toUpperCase();
        if (line.includes('ERROR(') && lines[i].includes('):') && line.includes('.CPS:')) {
            const errorLine = parseInt(lines[i].split('.cps:')[1]?.split('):')[0] ?? '0');
            if (errorLine > 0) {
                moveLine(errorLine, postFile);
            }
            return;
        }
    }
}
async function findWarningMessages(logFile) {
    const data = fs.readFileSync(logFile, 'utf-8');
    const lines = data.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].toUpperCase().includes('WARNING:')) {
            const answer = await vscode.window.showWarningMessage('Post processing completed with warnings. Open the log file?', 'Yes', 'No');
            if (answer === 'Yes') {
                await (0, utils_1.showOutputFile)(logFile, vscode.ViewColumn.Two);
            }
            break;
        }
    }
}
function moveLine(line, postFile) {
    for (const editor of vscode.window.visibleTextEditors) {
        if (editor.document.fileName === postFile) {
            const pos = new vscode.Position(line - 1, 0);
            editor.selection = new vscode.Selection(pos, new vscode.Position(line - 1, 1000));
            editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
            return;
        }
    }
}
//# sourceMappingURL=postRunner.js.map