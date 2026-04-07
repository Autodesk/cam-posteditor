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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const config = __importStar(require("./config"));
const utils_1 = require("./utils");
const postRunner_1 = require("./postRunner");
const onlineLibrary_1 = require("./onlineLibrary");
const lineSelection_1 = require("./lineSelection");
const fileTreeProvider_1 = require("./providers/fileTreeProvider");
const propertyProvider_1 = require("./providers/propertyProvider");
const functionListProvider_1 = require("./providers/functionListProvider");
const postProcessorIntellisense = require("./postProcessorIntellisense");
let _engine;
function activate(context) {
    const engine = new postRunner_1.PostEngine(context);
    _engine = engine;
    const onlineLibDir = path.join(engine.resLocation, 'Machines', 'Online Library');
    utils_1.ensureDir(onlineLibDir);
    const lineSelection = new lineSelection_1.LineSelection(engine);
    // Restore first (so an update doesn't overwrite the old backup). Backup runs async so startup is not blocked.
    engine.restoreCustomData();
    setTimeout(() => { try { engine.backupCustomData(); } catch (_) { /* ignore */ } }, 2000);
    let _backupTimer;
    const refreshBackup = () => {
        clearTimeout(_backupTimer);
        _backupTimer = setTimeout(() => { try { engine.backupCustomData(); } catch (_) { /* ignore */ } }, 5000);
    };
    // Setup
    addCPSToJSLanguage();
    let typeDeclarationsInstalled = false;
    let typeDeclarationsPromptShown = false;
    function ensureTypeDeclarations() {
        if (!typeDeclarationsInstalled) {
            typeDeclarationsInstalled = true;
            installTypeDeclarations(context);
            vscode.commands.executeCommand('typescript.restartTsServer');
        }
    }
    function isCpsOrCpiFile(uri) {
        const p = (uri && uri.fsPath || '').toLowerCase();
        return p.endsWith('.cps') || p.endsWith('.cpi');
    }
    function isInWorkspace(uri) {
        return !!vscode.workspace.getWorkspaceFolder(uri);
    }
    function isTypeDeclarationsAlreadyInstalled() {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders?.length)
            return false;
        const root = folders[0].uri.fsPath;
        const targetIndex = path.join(root, 'node_modules', '@types', 'postprocessor', 'index.d.ts');
        const targetPkg = path.join(root, 'node_modules', '@types', 'postprocessor', 'package.json');
        if (!(0, utils_1.fileExists)(targetIndex) || !(0, utils_1.fileExists)(targetPkg))
            return false;
        // Verify the installed file is up to date
        const sourcePath = path.join(context.extensionPath, 'res', 'language files', 'globals.d.ts');
        try {
            const srcStat = fs.statSync(sourcePath);
            const dstStat = fs.statSync(targetIndex);
            return dstStat.size === srcStat.size;
        }
        catch {
            return false;
        }
    }
    async function promptTypeDeclarationsIfNeeded() {
        if (typeDeclarationsPromptShown)
            return;
        const folders = vscode.workspace.workspaceFolders;
        if (!folders?.length)
            return;
        if (context.workspaceState.get('autodesk.post.dontPromptTypeDeclarations'))
            return;
        if (isTypeDeclarationsAlreadyInstalled()) {
            typeDeclarationsInstalled = true;
            typeDeclarationsPromptShown = true;
            return;
        }
        typeDeclarationsPromptShown = true;
        const choice = await vscode.window.showInformationMessage(
            'Install post processor type declarations in this workspace for better IntelliSense?',
            'Yes',
            'Not now',
            'Don\'t show again for this workspace'
        );
        if (choice === 'Yes')
            ensureTypeDeclarations();
        else if (choice === 'Don\'t show again for this workspace')
            context.workspaceState.update('autodesk.post.dontPromptTypeDeclarations', true);
    }
    // Prompt only when a .cps/.cpi file inside the workspace is opened (not for outside files like C:\posts\fanuc.cps)
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => { if (isCpsOrCpiFile(doc.uri) && isInWorkspace(doc.uri)) promptTypeDeclarationsIfNeeded(); }));
    for (const doc of vscode.workspace.textDocuments) { if (isCpsOrCpiFile(doc.uri) && isInWorkspace(doc.uri)) { promptTypeDeclarationsIfNeeded(); break; } }
    // Post processor IntelliSense (completion + hover) for .cps/.cpi — register once only
    const postProcessorSymbols = postProcessorIntellisense.loadSymbols(context.extensionPath);
    const cpsCpiSelector = { language: 'javascript', scheme: 'file' };
    const completionDisposable = vscode.languages.registerCompletionItemProvider(cpsCpiSelector, {
        provideCompletionItems: (document, position) => postProcessorIntellisense.provideCompletionItems(postProcessorSymbols, document, position),
    });
    const hoverDisposable = vscode.languages.registerHoverProvider(cpsCpiSelector, {
        provideHover: (document, position) => postProcessorIntellisense.provideHover(postProcessorSymbols, document, position),
    });
    context.subscriptions.push(completionDisposable, hoverDisposable);
    // ── Tree providers ────────────────────────────────────────────
    const cncTree = new fileTreeProvider_1.FileTreeProvider(context, {
        rootDirName: 'CNC files',
        fileExtensions: ['.cnc'],
        settingsKey: 'customCNCLocations',
        selectCommand: 'autodesk.post.setCNC',
        includeAllFilesNode: false,
        includeRecentNode: true,
        recentStorageKey: 'recentCNC',
    });
    const regressionTestTree = new fileTreeProvider_1.FileTreeProvider(context, {
        rootDirName: 'CNC files',
        fileExtensions: ['.cnc'],
        settingsKey: 'customCNCLocations',
        selectCommand: 'autodesk.post.setCNC',
        includeAllFilesNode: true,
        includeLocalFusionNode: false,
        includeOnlineLibrary: false,
        checkboxMode: true,
        selectionStorageKey: 'regressionTestSelection',
    });
    const machineTree = new fileTreeProvider_1.FileTreeProvider(context, {
        rootDirName: 'Machines',
        fileExtensions: ['.machine', '.mch'],
        settingsKey: 'customMachineLocations',
        selectCommand: 'autodesk.post.setMachine',
        includeAllFilesNode: false,
        includeOnlineLibrary: true,
        includeRecentNode: true,
        recentStorageKey: 'recentMachine',
    });
    const propertyProvider = new propertyProvider_1.PropertyProvider(context, engine);
    const functionListProvider = new functionListProvider_1.FunctionListProvider(context);
    const cncListView = vscode.window.createTreeView('cncList', { treeDataProvider: cncTree });
    context.subscriptions.push(cncListView);
    const machineListView = vscode.window.createTreeView('machineList', { treeDataProvider: machineTree });
    context.subscriptions.push(machineListView);
    engine.getPostEngineVersion().then(() => { });
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('AutodeskPostUtility.postExecutablePath')) {
            _engine.clearPostVersionCache();
            _engine.getPostEngineVersion().then(() => { });
        }
    }));
    const propertyListView = vscode.window.createTreeView('propertyList', { treeDataProvider: propertyProvider });
    context.subscriptions.push(propertyListView);
    vscode.window.registerTreeDataProvider('functionList', functionListProvider);
    const regressionTestView = vscode.window.createTreeView('regressionTestList', {
        treeDataProvider: regressionTestTree,
        manageCheckboxStateManually: true,
    });
    regressionTestView.onDidChangeCheckboxState(e => {
        for (const [node, state] of e.items) {
            regressionTestTree.handleCheckboxChange(state === vscode.TreeItemCheckboxState.Checked, node);
        }
    });
    context.subscriptions.push(regressionTestView);
    async function promptAndDownloadOnlineLibrary(refreshTree) {
        const choice = await vscode.window.showInformationMessage(
            'Online machine library is empty. Download machines from the online library?',
            'Download',
            'Not now'
        );
        if (choice !== 'Download')
            return false;
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Online Library',
                cancellable: false,
            }, (progress) => {
                progress.report({ message: 'Downloading online machine library...' });
                return (0, onlineLibrary_1.downloadAllMachinesToCache)((done, total) => {
                    progress.report({ message: `Downloading ${done}/${total} machines`, increment: total > 0 ? 100 / total : 0 });
                }).then(({ cacheDir }) => {
                    if ((0, utils_1.fileExists)(cacheDir)) {
                        for (const name of fs.readdirSync(cacheDir)) {
                            const src = path.join(cacheDir, name);
                            if (fs.statSync(src).isFile())
                                fs.copyFileSync(src, path.join(onlineLibDir, name));
                        }
                    }
                    refreshTree();
                });
            });
            return true;
        }
        catch (err) {
            console.error('Online Library download failed', err);
            vscode.window.showErrorMessage('Online Library download failed. Use "Update Online Library" from the Machines view to retry.');
            return false;
        }
    }
    machineTree.setOnlineLibraryExpandCallback(promptAndDownloadOnlineLibrary);
    // ── Event handlers ────────────────────────────────────────────
    vscode.workspace.onDidSaveTextDocument(doc => onDocumentSaved(doc, engine));
    vscode.window.onDidChangeActiveTextEditor(() => { setEmbeddedEslintRules(context); updateCallStackDecorations(vscode.window.activeTextEditor); });
    vscode.workspace.onDidChangeTextDocument(e => {
        if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document)
            updateCallStackDecorations(vscode.window.activeTextEditor);
    });
    vscode.window.onDidChangeTextEditorSelection(e => lineSelection.handleSelectionChange(e));
    // ── Command registration ──────────────────────────────────────
    const sub = context.subscriptions;
    // Debug output: (→ functionName ln:line) — F12 Go to Definition + Ctrl+Click link
    const debugOutputSelector = [{ language: 'nccode' }, { pattern: '**/debuggedfile.nc' }];
    const debugSuffixRe = /\(→\s+\w+\s+ln:(\d+)\)/g;
    const debugAnnotationRe = /\(→\s+(\w+)\s+ln:\d+\)/g;
    const entryFunctionColors = {
        // Lifecycle
        onOpen: '#6ecbff',
        onClose: '#ff9d6e',
        onTerminate: '#ff9d6e',
        onMachine: '#79c0ff',
        // Section
        onSection: '#a6e22e',
        onSectionEnd: '#7ee787',
        onSectionSpecialCycle: '#c3e88d',
        onSectionEndSpecialCycle: '#c3e88d',
        // Comment / parameter
        onComment: '#8b949e',
        onParameter: '#8b949e',
        onPassThrough: '#8b949e',
        // Motion (linear/circular)
        onRapid: '#ff7b72',
        onLinear: '#79c0ff',
        onCircular: '#ffa657',
        onRapid5D: '#ff7b72',
        onLinear5D: '#89ddff',
        onRewindMachine: '#ab9df2',
        onRewindMachineEntry: '#ab9df2',
        onMoveToSafeRetractPosition: '#ab9df2',
        onReturnFromSafeRetractPosition: '#ab9df2',
        onRotateAxes: '#ab9df2',
        // Dwell / spindle / movement / mode
        onDwell: '#ffcb6b',
        onSpindleSpeed: '#ffcb6b',
        onMovement: '#f78c6c',
        onPower: '#f78c6c',
        onRadiusCompensation: '#f78c6c',
        onFeedMode: '#f78c6c',
        onToolCompensation: '#f78c6c',
        // Cycle
        onCycle: '#ff7b72',
        onCyclePoint: '#ff7b72',
        onCyclePath: '#f07178',
        onCyclePathEnd: '#f07178',
        onCycleEnd: '#ff7b72',
        // Command
        onCommand: '#55d6d3',
        onManualNC: '#55d6d3',
        onMachineCommand: '#55d6d3',
        onLiveAlignment: '#55d6d3',
        onOrientateSpindle: '#55d6d3',
        // Additive (FFF/DED)
        onLinearExtrude: '#82aaff',
        onCircularExtrude: '#82aaff',
        onLayer: '#82aaff',
        onLayerEnd: '#82aaff',
        onExtrusionReset: '#82aaff',
        onExtruderChange: '#82aaff',
        onExtruderTemp: '#82aaff',
        onBedTemp: '#82aaff',
        onFanSpeed: '#82aaff',
        onMaxAcceleration: '#82aaff',
        onAcceleration: '#82aaff',
        onJerk: '#82aaff',
        // Internal (callbacks that appear in stack)
        writeBlock: '#ffb86c',
        writeStartBlocks: '#ffb86c',
    };
    const defaultAnnotationColor = '#8b949e';
    const decorationTypesByColor = new Map();
    for (const color of [...new Set([...Object.values(entryFunctionColors), defaultAnnotationColor])]) {
        decorationTypesByColor.set(color, vscode.window.createTextEditorDecorationType({
            color,
            fontStyle: 'italic',
        }));
    }
    sub.push(...decorationTypesByColor.values());
    function getDecorationTypeForFunction(fn) {
        const color = entryFunctionColors[fn] || defaultAnnotationColor;
        return decorationTypesByColor.get(color);
    }
    function updateCallStackDecorations(editor) {
        if (!editor)
            return;
        const doc = editor.document;
        const isDebugOut = doc.languageId === 'nccode' && (path.basename(doc.uri.fsPath).toLowerCase() === 'debuggedfile.nc' || doc.getText().includes('(→'));
        if (!isDebugOut) {
            for (const dec of decorationTypesByColor.values())
                editor.setDecorations(dec, []);
            return;
        }
        const text = doc.getText();
        const rangesByType = new Map();
        for (const dec of decorationTypesByColor.values())
            rangesByType.set(dec, []);
        let m;
        debugAnnotationRe.lastIndex = 0;
        while ((m = debugAnnotationRe.exec(text)) !== null) {
            const start = doc.positionAt(m.index);
            const end = doc.positionAt(m.index + m[0].length);
            const dec = getDecorationTypeForFunction(m[1]);
            rangesByType.get(dec).push(new vscode.Range(start, end));
        }
        for (const [dec, ranges] of rangesByType)
            editor.setDecorations(dec, ranges);
    }
    if (vscode.window.activeTextEditor)
        updateCallStackDecorations(vscode.window.activeTextEditor);
    function isDebugOutputDoc(doc) {
        const stored = context.workspaceState.get('debugOutputPostPath');
        if (!stored?.postPath)
            return null;
        const docPath = doc.uri.fsPath;
        const storedPath = stored.outputPath || '';
        const norm = (p) => path.normalize(p).toLowerCase();
        const ok = norm(docPath) === norm(storedPath) ||
            (path.basename(docPath).toLowerCase() === 'debuggedfile.nc' && docPath.toLowerCase().includes('outputfiles'));
        return ok ? { postPath: stored.postPath } : null;
    }
    // No document links on debug annotations — decorations only; F12 / DefinitionProvider still handles go-to-post.
    // F12 / click: use our command so .cps opens in left pane. Annotation click or .stack.json fallback when no inline annotation.
    const defaultOutputDirForStack = path.join(os.tmpdir(), 'AutodeskPostUtility', 'OutputFiles');
    function resolveStackPathAndPostPath(doc, stored) {
        const docPath = doc.uri.fsPath;
        let stackPath = null;
        if (path.basename(docPath).toLowerCase() === 'debuggedfile.nc') {
            const fallback = path.join(defaultOutputDirForStack, 'debuggedfile.nc.stack.json');
            if (fs.existsSync(fallback))
                stackPath = fallback;
        }
        if (!stackPath)
            stackPath = docPath + '.stack.json';
        if (!fs.existsSync(stackPath) && stored?.outputPath && fs.existsSync(stored.outputPath + '.stack.json'))
            stackPath = stored.outputPath + '.stack.json';
        if (!stackPath || !fs.existsSync(stackPath))
            return null;
        try {
            const raw = fs.readFileSync(stackPath, 'utf-8');
            const parsed = JSON.parse(raw);
            const postPath = (parsed && typeof parsed.postPath === 'string') ? parsed.postPath : stored?.postPath;
            const stacks = parsed && typeof parsed.stacks === 'object' ? parsed.stacks : null;
            return Array.isArray(stacks) && postPath ? { stacks, postPath } : null;
        }
        catch {
            return null;
        }
    }
    // Do not provide definition for debug NC output so Ctrl+hover and Ctrl+click never jump.
    // Jump to post is only via clicking the line (LineSelection).
    sub.push(vscode.languages.registerDefinitionProvider(debugOutputSelector, {
        provideDefinition() {
            return null;
        },
    }));
    // Hover over a line shows full call stack when .stack.json exists.
    sub.push(vscode.languages.registerHoverProvider(debugOutputSelector, {
        provideHover(doc, position) {
            if (!config.get('showCallStackOnHover'))
                return null;
            const stored = isDebugOutputDoc(doc);
            const stackData = resolveStackPathAndPostPath(doc, stored);
            if (!stackData)
                return null;
            const { stacks: stacksArray, postPath } = stackData;
            const lineIndex = position.line;
            const offset = postRunner_1.PostEngine.getDebugLineCountBefore(doc.getText(), lineIndex + 1);
            const effectiveIndex = Math.max(0, lineIndex - offset);
            let stack = Array.isArray(stacksArray) ? stacksArray[effectiveIndex] : undefined;
            if (!stack || !Array.isArray(stack) || stack.length === 0) {
                for (let i = effectiveIndex + 1; i < stacksArray.length; i++) {
                    const s = stacksArray[i];
                    if (Array.isArray(s) && s.length > 0) {
                        stack = s;
                        break;
                    }
                }
                if (!stack || !Array.isArray(stack) || stack.length === 0) {
                    for (let i = effectiveIndex - 1; i >= 0; i--) {
                        const s = stacksArray[i];
                        if (Array.isArray(s) && s.length > 0) {
                            stack = s;
                            break;
                        }
                    }
                }
            }
            try {
                if (!stack || !Array.isArray(stack) || stack.length === 0) {
                    // Still show a hover so user sees the feature is active and can open the post
                    if (!postPath)
                        return null;
                    const md = new vscode.MarkdownString();
                    md.isTrusted = true;
                    md.appendMarkdown('**Call stack**\n\nNo call stack for this line.');
                    const args = encodeURIComponent(JSON.stringify([postPath, 1]));
                    md.appendMarkdown(`\n\n[Open post: ${path.basename(postPath)}](command:autodesk.post.openPostAtLine?${args})`);
                    return new vscode.Hover(md);
                }
                // Collapse consecutive same-name frames (e.g. writeToolCall called via writeStartBlocks callback) so the stack shows each function once, using the innermost line
                stack = stack.reduce((acc, f) => {
                    const prev = acc[acc.length - 1];
                    if (prev && prev.name === f.name) {
                        prev.line = f.line;
                        return acc;
                    }
                    acc.push({ ...f });
                    return acc;
                }, []);
                const md = new vscode.MarkdownString();
                md.isTrusted = true;
                md.appendMarkdown('**Call stack**\n\n');
                stack.forEach((f, i) => {
                    const note = i === stack.length - 1 ? ' ← output' : '';
                    if (postPath && f.line != null) {
                        const args = encodeURIComponent(JSON.stringify([postPath, f.line]));
                        md.appendMarkdown(`${i + 1}. [${f.name} (ln:${f.line})](command:autodesk.post.openPostAtLine?${args})${note}\n`);
                    }
                    else {
                        md.appendMarkdown(`${i + 1}. ${f.name} (ln:${f.line})${note}\n`);
                    }
                });
                return new vscode.Hover(md);
            }
            catch {
                return null;
            }
        },
    }));
    // Post processing
    sub.push(vscode.commands.registerCommand('autodesk.post.postProcess', () => engine.postProcess()));
    sub.push(vscode.commands.registerCommand('autodesk.post.postCompare', () => engine.postCompare()));
    sub.push(vscode.commands.registerCommand('autodesk.post.ncOutputComparison', () => engine.showNCOutputComparison()));
    sub.push(vscode.commands.registerCommand('autodesk.post.compareNCFiles', () => engine.compareNCFiles()));
    sub.push(vscode.commands.registerCommand('autodesk.post.saveOutputAsReference', () => engine.saveOutputAsReference()));
    sub.push(vscode.commands.registerCommand('autodesk.post.compareWithReference', () => engine.compareWithReference()));
    sub.push(vscode.commands.registerCommand('autodesk.post.runRegressionTest', () => {
        const selected = regressionTestTree.getSelectedFiles();
        engine.runRegressionTest(selected);
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.runRegressionAndCompare', () => {
        const selected = regressionTestTree.getSelectedFiles();
        engine.runRegressionAndCompare(selected);
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.createRegressionReferenceFiles', () => {
        const selected = regressionTestTree.getSelectedFiles();
        engine.createRegressionReferenceFiles(selected);
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.saveRegressionAsReference', () => engine.saveRegressionOutputAsReference()));
    sub.push(vscode.commands.registerCommand('autodesk.post.compareRegressionWithReference', () => {
        const selected = regressionTestTree.getSelectedFiles();
        engine.runRegressionAndCompare(selected);
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.regressionTestList.refresh', () => regressionTestTree.refreshTree(true)));
    sub.push(vscode.commands.registerCommand('autodesk.post.regressionTestList.selectAll', () => regressionTestTree.selectAll()));
    sub.push(vscode.commands.registerCommand('autodesk.post.regressionTestList.selectNone', () => regressionTestTree.selectNone()));
    sub.push(vscode.commands.registerCommand('autodesk.post.mergePost', () => engine.mergePost()));
    sub.push(vscode.commands.registerCommand('autodesk.post.encryptPost', () => engine.postEncryption(true)));
    sub.push(vscode.commands.registerCommand('autodesk.post.decryptPost', () => engine.postEncryption(false)));
    sub.push(vscode.commands.registerCommand('autodesk.post.showPostEngineVersion', () => engine.showPostEngineVersion()));
    sub.push(vscode.commands.registerCommand('autodesk.post.showDebugForLine', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.document.fileName.toLowerCase().endsWith('.cps')) {
            vscode.window.showWarningMessage('Open a .cps file and select a line, then use Post Utility: Debug selected line(s).');
            return;
        }
        const doc = editor.document;
        const sel = editor.selection;
        const lineNum = sel.isEmpty ? sel.anchor.line : sel.start.line;
        const lineText = sel.isEmpty ? doc.lineAt(lineNum).text : doc.getText(sel);
        engine.showDebugForLine(doc, lineNum, lineText);
    }));
    // Post executable
    sub.push(vscode.commands.registerCommand('autodesk.post.changePostExe', () => engine.locatePostExe(false)));
    sub.push(vscode.commands.registerCommand('autodesk.post.changeSecondaryPostExe', () => engine.locateSecondaryPostExe(false)));
    let jumpHighlightTimeout;
    const jumpHighlightDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
        isWholeLine: true,
    });
    context.subscriptions.push(jumpHighlightDecorationType);
    // Open post at line (debug link); show in left pane. preserveFocus keeps function list open.
    sub.push(vscode.commands.registerCommand('autodesk.post.openPostAtLine', (postPathOrArgs, line) => {
        let postPath = postPathOrArgs;
        if (typeof postPathOrArgs === 'string' && (line == null || line <= 0)) {
            try {
                const parsed = JSON.parse(postPathOrArgs);
                if (Array.isArray(parsed) && parsed.length >= 2) {
                    postPath = parsed[0];
                    line = parsed[1];
                }
            }
            catch {
                /* not JSON, use as path; line stays undefined */
            }
        }
        if (!postPath || line == null || line <= 0)
            return;
        if (jumpHighlightTimeout)
            clearTimeout(jumpHighlightTimeout);
        const uri = vscode.Uri.file(postPath);
        const lineIndex = line - 1;
        const targetRange = new vscode.Range(lineIndex, 0, lineIndex, 0);
        const norm = (p) => path.normalize(p).toLowerCase();
        const existing = vscode.window.visibleTextEditors.find(e => norm(e.document.uri.fsPath) === norm(postPath));
        vscode.window.showTextDocument(existing ? existing.document.uri : uri, {
            selection: targetRange,
            preserveFocus: true,
            viewColumn: vscode.ViewColumn.One, // always left pane so .cps never opens in right
        }).then(editor => {
            editor.revealRange(targetRange, vscode.TextEditorRevealType.InCenter);
            const lineLength = editor.document.lineAt(lineIndex).text.length;
            const highlightRange = new vscode.Range(lineIndex, 0, lineIndex, Math.max(1, lineLength));
            editor.setDecorations(jumpHighlightDecorationType, [highlightRange]);
            jumpHighlightTimeout = setTimeout(() => {
                editor.setDecorations(jumpHighlightDecorationType, []);
                jumpHighlightTimeout = undefined;
            }, 2500);
            functionListProvider.setPreferredEditor(editor);
            setTimeout(() => functionListProvider.refresh(), 50);
        });
    }));
    // Recently used: persist last 10 selected files per list and refresh tree
    const RECENT_MAX = 10;
    async function addToRecentAndRefresh(context, filePath, storageKey, tree) {
        if (!filePath || typeof filePath !== 'string')
            return;
        const key = 'recentFiles.' + storageKey;
        const prev = context.globalState.get(key);
        const arr = Array.isArray(prev) ? prev : [];
        const next = [filePath, ...arr.filter(p => path.normalize(p) !== path.normalize(filePath))].slice(0, RECENT_MAX);
        await context.globalState.update(key, next);
        if (typeof tree?.refreshRecentOnly === 'function')
            tree.refreshRecentOnly();
    }
    // CNC / Machine selection
    sub.push(vscode.commands.registerCommand('autodesk.post.setCNC', async (file) => {
        engine.setCNCFile(file);
        await addToRecentAndRefresh(context, file, 'recentCNC', cncTree);
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.setMachine', async (file) => {
        engine.setMachineFile(file);
        await addToRecentAndRefresh(context, file, 'recentMachine', machineTree);
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.selectCNCFile', () => engine.selectCNCFromQuickPick()));
    sub.push(vscode.commands.registerCommand('autodesk.post.clearMachineSelection', () => engine.clearMachineSelection()));
    // File management — unified delete so "Delete file" shows in both CNC and machine list context menus
    const deleteFileFromTree = async (el) => {
        if (!el?.filePath)
            return;
        try {
            if (!fs.statSync(el.filePath).isFile())
                return;
        }
        catch {
            return;
        }
        const deleted = await deleteCustomFile(el.filePath, engine);
        if (deleted) {
            const lower = el.filePath.toLowerCase();
            if (lower.endsWith('.cnc'))
                cncTree.refreshTreeFromMutation();
            else {
                if (el.filePath === engine.machineFile)
                    engine.clearMachineSelection();
                machineTree.refreshTreeFromMutation();
            }
            refreshBackup();
        }
    };
    sub.push(vscode.commands.registerCommand('autodesk.post.deleteFile', deleteFileFromTree));
    sub.push(vscode.commands.registerCommand('autodesk.post.deleteCNCFile', deleteFileFromTree));
    sub.push(vscode.commands.registerCommand('autodesk.post.deleteMachineFile', async (el) => {
        if (el?.filePath) {
            const deleted = await deleteCustomFile(el.filePath, engine);
            if (deleted) {
                if (el.filePath === engine.machineFile)
                    engine.clearMachineSelection();
                machineTree.refreshTreeFromMutation();
                refreshBackup();
            }
        }
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.openFolder', (el) => {
        if (el?.filePath)
            openFolder(el.filePath);
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.importCNC', async (el) => { await importCustomFile('cncFile', engine, cncTree, el?.filePath); refreshBackup(); }));
    sub.push(vscode.commands.registerCommand('autodesk.post.importMachine', async (el) => { await importCustomFile('machineFile', engine, machineTree, el?.filePath); refreshBackup(); }));
    sub.push(vscode.commands.registerCommand('autodesk.post.editMachineFile', (el) => {
        if (!el?.filePath)
            return;
        let targetPath = el.filePath;
        if (targetPath.startsWith('__online__:')) {
            try {
                const m = JSON.parse(targetPath.replace('__online__:', ''));
                const downloadDir = path.join(engine.resLocation, 'Machines', 'Online Library');
                targetPath = path.join(downloadDir, m.filename);
            }
            catch {
                return;
            }
            if (!(0, utils_1.fileExists)(targetPath)) {
                vscode.window.showWarningMessage('Download the machine first by clicking it.');
                return;
            }
        }
        editMachineFile(targetPath);
    }));
    // Tree refresh & folder management
    sub.push(vscode.commands.registerCommand('autodesk.post.cncList.addFolder', () => addFolderToTree(cncTree)));
    sub.push(vscode.commands.registerCommand('autodesk.post.cncList.filter', () => promptFilter(cncTree, 'CNC files')));
    sub.push(vscode.commands.registerCommand('autodesk.post.cncList.clearFilter', () => cncTree.clearFilter()));
    sub.push(vscode.commands.registerCommand('autodesk.post.machineList.addFolder', () => addFolderToTree(machineTree)));
    sub.push(vscode.commands.registerCommand('autodesk.post.machineList.filter', () => promptFilter(machineTree, 'machines')));
    sub.push(vscode.commands.registerCommand('autodesk.post.machineList.clearFilter', () => {
        machineTree.clearFilter();
        if (machineListView)
            machineListView.description = undefined;
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.machineList.filterOnlineLibrary', () => promptOnlineLibraryFilter(machineTree, machineListView)));
    sub.push(vscode.commands.registerCommand('autodesk.post.updateOnlineLibrary', async () => {
        const onlineLibDir = path.join(engine.resLocation, 'Machines', 'Online Library');
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Online Library',
                cancellable: false,
            }, async (progress) => {
                progress.report({ message: 'Downloading online machine library...' });
                const { cacheDir } = await (0, onlineLibrary_1.downloadAllMachinesToCache)((done, total, name) => {
                    progress.report({ message: `Downloading ${done}/${total} machines`, increment: total > 0 ? 100 / total : 0 });
                });
                if ((0, utils_1.fileExists)(cacheDir)) {
                    for (const name of fs.readdirSync(cacheDir)) {
                        const src = path.join(cacheDir, name);
                        if (fs.statSync(src).isFile())
                            fs.copyFileSync(src, path.join(onlineLibDir, name));
                    }
                }
                machineTree.refreshTree(true);
            });
            vscode.window.showInformationMessage('Online Library updated.');
            refreshBackup();
        }
        catch (e) {
            const msg = e && typeof e === 'object' && 'message' in e ? e.message : String(e ?? 'Unknown error');
            vscode.window.showErrorMessage(`Online Library update failed: ${msg}`);
        }
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.createCNCFolder', async (el) => { if (el?.filePath) { await cncTree.createSubfolder(el.filePath); refreshBackup(); } }));
    sub.push(vscode.commands.registerCommand('autodesk.post.deleteCNCFolder', async (el) => { if (el?.filePath) { await cncTree.deleteFolder(el.filePath); refreshBackup(); } }));
    sub.push(vscode.commands.registerCommand('autodesk.post.removeCNCFolderRef', (el) => { if (el?.filePath)
        cncTree.removeFolder(el.filePath); }));
    sub.push(vscode.commands.registerCommand('autodesk.post.createMachineFolder', async (el) => { if (el?.filePath) { await machineTree.createSubfolder(el.filePath); refreshBackup(); } }));
    sub.push(vscode.commands.registerCommand('autodesk.post.deleteMachineFolder', async (el) => { if (el?.filePath) { await machineTree.deleteFolder(el.filePath); refreshBackup(); } }));
    sub.push(vscode.commands.registerCommand('autodesk.post.removeMachineFolderRef', (el) => { if (el?.filePath)
        machineTree.removeFolder(el.filePath); }));
    // Properties
    sub.push(vscode.commands.registerCommand('autodesk.post.propertyList.refresh', () => propertyProvider.refreshTree()));
    sub.push(vscode.commands.registerCommand('autodesk.post.propertyList.filter', () => promptFilter(propertyProvider, 'post properties', propertyListView)));
    sub.push(vscode.commands.registerCommand('autodesk.post.propertyList.clearFilter', () => {
        propertyProvider.clearFilter();
        if (propertyListView)
            propertyListView.description = undefined;
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.changeProperty', (el) => {
        const element = el ?? propertyListView.selection?.[0];
        if (!element) {
            vscode.window.showInformationMessage('Select a property in the list first.');
            return;
        }
        propertyProvider.changeProperty(element, false);
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.resetProperty', (el) => {
        const element = el ?? propertyListView.selection?.[0];
        if (!element) {
            vscode.window.showInformationMessage('Select a property in the list first.');
            return;
        }
        propertyProvider.changeProperty(element, true);
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.directSelect', (label) => {
        const item = new vscode.TreeItem(label);
        propertyProvider.changeProperty(item, false);
    }));
    // Function list
    sub.push(vscode.commands.registerCommand('autodesk.post.functionList.refresh', () => functionListProvider.refresh()));
    sub.push(vscode.commands.registerCommand('autodesk.post.functionList.revealRange', highlightRange));
    // Other commands
    sub.push(vscode.commands.registerCommand('autodesk.post.showOptions', () => showOptions(engine)));
    sub.push(vscode.commands.registerCommand('autodesk.post.showDebuggedCode', () => toggleShowDebuggedCode()));
    sub.push(vscode.commands.registerCommand('autodesk.post.disableLineSelection', () => toggleLineSelection()));
    sub.push(vscode.commands.registerCommand('autodesk.post.setIncludePath', () => setIncludePath()));
    sub.push(vscode.commands.registerCommand('autodesk.post.updatePostProperties', () => engine.updatePostProperties()));
    sub.push(vscode.commands.registerCommand('autodesk.post.installTypeDeclarations', () => {
        if (!vscode.workspace.workspaceFolders?.length) {
            vscode.window.showWarningMessage('Install IntelliSense type declarations only works when a folder or workspace is open. Open a folder first.');
            return;
        }
        context.workspaceState.update('autodesk.post.dontPromptTypeDeclarations', undefined);
        installTypeDeclarations(context);
        vscode.commands.executeCommand('typescript.restartTsServer');
        vscode.window.showInformationMessage('Post processor IntelliSense type declarations installed for this workspace.');
    }));
    sub.push(vscode.commands.registerCommand('autodesk.post.foldPropertyList', () => foldPropertyList()));
    sub.push(vscode.commands.registerCommand('autodesk.post.downloadCNCExtractor', () => downloadCNCExtractor()));
    // Backward-compatible aliases for old hsm.* command IDs
    const aliases = {
        'hsm.postProcess': 'autodesk.post.postProcess',
        'hsm.postCompare': 'autodesk.post.postCompare',
        'hsm.mergePost': 'autodesk.post.mergePost',
        'hsm.encryptPost': 'autodesk.post.encryptPost',
        'hsm.decryptPost': 'autodesk.post.decryptPost',
        'hsm.showPostEngineVersion': 'autodesk.post.showPostEngineVersion',
        'hsm.changePostExe': 'autodesk.post.changePostExe',
        'hsm.changeSecondaryPostExe': 'autodesk.post.changeSecondaryPostExe',
        'hsm.setCNC': 'autodesk.post.setCNC',
        'hsm.setMachine': 'autodesk.post.setMachine',
        'hsm.selectCNCFile': 'autodesk.post.selectCNCFile',
        'hsm.clearMachineSelection': 'autodesk.post.clearMachineSelection',
        'hsm.deleteCNCFile': 'autodesk.post.deleteCNCFile',
        'hsm.deleteMachineFile': 'autodesk.post.deleteMachineFile',
        'hsm.openFolder': 'autodesk.post.openFolder',
        'hsm.importCNC': 'autodesk.post.importCNC',
        'hsm.importMachine': 'autodesk.post.importMachine',
        'hsm.editMachineFile': 'autodesk.post.editMachineFile',
        'hsm.changeProperty': 'autodesk.post.changeProperty',
        'hsm.resetProperty': 'autodesk.post.resetProperty',
        'hsm.directSelect': 'autodesk.post.directSelect',
        'hsm.showDebuggedCode': 'autodesk.post.showDebuggedCode',
        'hsm.disableLineSelection': 'autodesk.post.disableLineSelection',
        'hsm.setIncludePath': 'autodesk.post.setIncludePath',
        'hsm.updatePostProperties': 'autodesk.post.updatePostProperties',
        'hsm.foldPropertyList': 'autodesk.post.foldPropertyList',
        'hsm.downloadCNCExtractor': 'autodesk.post.downloadCNCExtractor',
        'hsm.findPostExe': 'autodesk.post.changePostExe',
        'extension.startHSMPlugin': 'autodesk.post.showOptions',
        'functionList.refreshEntry': 'autodesk.post.functionList.refresh',
        'cncList.addFolder': 'autodesk.post.cncList.addFolder',
        'machineList.addFolder': 'autodesk.post.machineList.addFolder',
        'propertyList.initializePropertyList': 'autodesk.post.propertyList.refresh',
        'propertyList.refreshPropertyList': 'autodesk.post.propertyList.refresh',
        'propertyList.interrogatePost': 'autodesk.post.propertyList.refresh',
    };
    for (const [oldId, newId] of Object.entries(aliases)) {
        sub.push(vscode.commands.registerCommand(oldId, (...args) => vscode.commands.executeCommand(newId, ...args)));
    }
}
// ── Save handler ────────────────────────────────────────────────
function onDocumentSaved(doc, engine) {
    if (!engine.checkActiveDocumentForPost())
        return;
    const isDebugOpen = vscode.window.visibleTextEditors.some(ed => {
        const name = ed.document.fileName.toLowerCase();
        return name === engine.outputPath.toLowerCase() ||
            name === engine.logPath.toLowerCase() ||
            name === engine.debugOutputPath.toLowerCase();
    });
    if (isDebugOpen && config.get('postOnSave')) {
        engine.postProcess();
    }
}
// ── Setup functions ─────────────────────────────────────────────
function addCPSToJSLanguage() {
    const current = vscode.workspace.getConfiguration('files').get('associations') ?? {};
    const updated = { ...current, '*.cps': 'javascript', '*.cpi': 'javascript' };
    vscode.workspace.getConfiguration('files').update('associations', updated, true);
}
function ensureTypesPackage(root, extensionTypesPath) {
    const sourcePath = path.join(extensionTypesPath, 'globals.d.ts');
    if (!fs.existsSync(sourcePath))
        return;
    const targetDir = path.join(root, 'node_modules', '@types', 'postprocessor');
    const targetIndex = path.join(targetDir, 'index.d.ts');
    const targetPkg = path.join(targetDir, 'package.json');
    try {
        fs.mkdirSync(targetDir, { recursive: true });
        fs.copyFileSync(sourcePath, targetIndex);
        if (!fs.existsSync(targetPkg)) {
            fs.writeFileSync(targetPkg, JSON.stringify({ name: "@types/postprocessor", version: "1.0.0", types: "index.d.ts" }, null, 2), 'utf-8');
        }
    }
    catch { /* ignore */ }
    // Clean up broken typeRoots from jsconfig.json if present
    const jsconfigPath = path.join(root, 'jsconfig.json');
    try {
        if (fs.existsSync(jsconfigPath)) {
            const raw = fs.readFileSync(jsconfigPath, 'utf-8');
            const config = JSON.parse(raw);
            const roots = config.compilerOptions?.typeRoots;
            if (Array.isArray(roots)) {
                const normalizedExt = path.normalize(extensionTypesPath);
                const filtered = roots.filter(r => path.normalize(path.isAbsolute(r) ? r : path.join(root, r)) !== normalizedExt);
                if (filtered.length !== roots.length) {
                    if (filtered.length === 0 || (filtered.length === 1 && filtered[0] === 'node_modules/@types')) {
                        delete config.compilerOptions.typeRoots;
                    } else {
                        config.compilerOptions.typeRoots = filtered;
                    }
                    if (Object.keys(config.compilerOptions).length === 0)
                        delete config.compilerOptions;
                    if (Object.keys(config).length === 0) {
                        fs.unlinkSync(jsconfigPath);
                    } else {
                        fs.writeFileSync(jsconfigPath, JSON.stringify(config, null, 2), 'utf-8');
                    }
                }
            }
        }
    }
    catch { /* ignore */ }
}
function installTypeDeclarations(context, fallbackDir) {
    const folders = vscode.workspace.workspaceFolders;
    const extensionTypesPath = path.join(context.extensionPath, 'res', 'language files');
    if (!fs.existsSync(path.join(extensionTypesPath, 'globals.d.ts')))
        return;
    try {
        if (folders?.length) {
            const root = folders[0].uri.fsPath;
            ensureTypesPackage(root, extensionTypesPath);
        }
    }
    catch { /* ignore */ }
}
function setEmbeddedEslintRules(context) {
    const resLocation = path.join(context.extensionPath, 'res');
    const eslintConfig = vscode.workspace.getConfiguration('eslint');
    const editorConfig = vscode.workspace.getConfiguration('editor');
    const setting = config.get('useEmbeddedESLintRules');
    let overrideConfigFile = {};
    let codeActions;
    switch (setting) {
        case 'Show ESLint issues only':
            overrideConfigFile = { overrideConfigFile: path.join(resLocation, '.eslintrc.json') };
            codeActions = { 'source.fixAll.eslint': 'never' };
            break;
        case 'Show and fix ESLint issues':
            overrideConfigFile = { overrideConfigFile: path.join(resLocation, '.eslintrc.json') };
            codeActions = { 'source.fixAll.eslint': 'explicit' };
            break;
        default: // Disabled
            codeActions = { 'source.fixAll.eslint': 'never' };
            break;
    }
    eslintConfig.update('options', overrideConfigFile, true);
    editorConfig.update('codeActionsOnSave', codeActions, true);
    eslintConfig.update('useFlatConfig', false, true);
}
// ── UI commands ─────────────────────────────────────────────────
async function showOptions(engine) {
    engine.checkActiveDocumentForPost();
    engine.ensurePostKernel();
    const items = ['Change CNC file', 'Post process'];
    const picked = await vscode.window.showQuickPick(items, { placeHolder: 'Select the required command' });
    if (picked === 'Post process') {
        if (!(0, utils_1.fileExists)(engine.cncFile)) {
            await engine.selectCNCFromQuickPick('autodesk.post.postProcess');
        }
        else {
            engine.postProcess();
        }
    }
    else if (picked === 'Change CNC file') {
        engine.selectCNCFromQuickPick();
    }
}
async function toggleShowDebuggedCode() {
    const current = config.get('showDebuggedCode');
    const cur = (current === 'inline' || current === 'full') ? current : 'off';
    const pick = await vscode.window.showQuickPick([
        { label: 'Off', description: 'Clean NC only; click and hover when enabled' },
        { label: 'Inline', description: 'Entry function and line on each NC line' },
        { label: 'Full', description: '!DEBUG lines kept in output' }
    ], { title: 'Debug output when posting', placeHolder: cur === 'off' ? 'Off' : cur === 'inline' ? 'Inline' : 'Full' });
    if (pick)
        config.update('showDebuggedCode', pick.label.toLowerCase(), true);
}
async function toggleLineSelection() {
    const val = await vscode.window.showQuickPick(['True', 'False']);
    if (val === 'True') {
        config.update('navigateToPostAtLineOnNcClick', false, true);
    }
    else if (val === 'False') {
        config.update('navigateToPostAtLineOnNcClick', true, true);
    }
}
async function setIncludePath() {
    const uris = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false });
    if (!uris?.[0])
        return;
    const selected = uris[0].fsPath;
    if (fs.existsSync(selected)) {
        config.update('includePath', selected, true);
        vscode.window.showInformationMessage(`Include path set to: ${selected}`);
    }
    else {
        vscode.window.showErrorMessage(`Selected path does not exist: ${selected}`);
    }
}
async function foldPropertyList() {
    const val = await vscode.window.showQuickPick(['Fold', 'Unfold']);
    if (!val)
        return;
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    for (let i = 0; i < editor.document.lineCount; i++) {
        const line = editor.document.lineAt(i).text.replace(/\s/g, '');
        if (line.startsWith('properties=')) {
            editor.selection = new vscode.Selection(new vscode.Position(i, 0), new vscode.Position(i, 1000));
            if (val === 'Fold') {
                vscode.commands.executeCommand('editor.foldRecursively');
            }
            else {
                vscode.commands.executeCommand('editor.unfoldRecursively');
            }
            break;
        }
    }
}
function downloadCNCExtractor() {
    vscode.env.openExternal(vscode.Uri.parse('https://cam.autodesk.com/hsmposts?p=export_cnc_file_to_vs_code'));
}
function highlightRange(editor, range) {
    editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
    editor.selection = new vscode.Selection(range.start, range.start);
    vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
}
// ── File management helpers ─────────────────────────────────────
async function deleteCustomFile(filePath, engine) {
    const name = path.basename(filePath);
    const confirm = await vscode.window.showWarningMessage(`Delete file "${name}"?`, { modal: true }, 'Delete');
    if (confirm !== 'Delete')
        return false;
    if ((0, utils_1.fileExists)(filePath)) {
        fs.unlinkSync(filePath);
    }
    // Also remove from backup
    const backupDir = filePath.toLowerCase().includes('machine')
        ? path.join(os.tmpdir(), 'AutodeskPostUtility', 'CustomMachineFiles')
        : path.join(os.tmpdir(), 'AutodeskPostUtility', 'CustomCNCFiles');
    const backupFile = path.join(backupDir, path.basename(filePath));
    if ((0, utils_1.fileExists)(backupFile)) {
        fs.unlinkSync(backupFile);
    }
    vscode.window.showInformationMessage(`${name} deleted.`);
    return true;
}
async function importCustomFile(type, engine, tree, targetPath) {
    const isMachine = type === 'machineFile';
    const fileType = isMachine ? 'Machines' : 'CNC files';
    const filters = isMachine
        ? { 'Machine Configuration file': ['machine', 'mch'] }
        : { 'Autodesk CAM intermediate file': ['cnc'] };
    // Use the right-clicked folder if it's a directory, otherwise fall back to Custom
    let destDir;
    if (targetPath && (0, utils_1.fileExists)(targetPath)) {
        destDir = fs.statSync(targetPath).isDirectory() ? targetPath : path.dirname(targetPath);
    }
    if (!destDir) {
        destDir = path.join(engine.resLocation, fileType, 'Custom');
    }
    (0, utils_1.ensureDir)(destDir);
    const uris = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectMany: true, filters });
    if (!uris?.length)
        return;
    let log = '';
    for (const uri of uris) {
        const src = uri.fsPath;
        if ((0, utils_1.fileExists)(src)) {
            const dest = path.join(destDir, path.basename(src));
            fs.copyFileSync(src, dest);
            log += `"${path.basename(src)}"\n`;
        }
    }
    if (log) {
        vscode.window.showInformationMessage(`Imported to ${path.basename(destDir)}:\n${log}`);
        tree.refreshTreeFromMutation();
    }
}
async function addFolderToTree(tree) {
    const uris = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false });
    if (!uris?.[0])
        return;
    await tree.addFolder(uris[0].fsPath);
    tree.refreshTreeFromMutation();
}
function promptFilter(tree, listType, view) {
    const input = vscode.window.createInputBox();
    input.title = `Search ${listType}`;
    input.placeholder = 'Search...';
    input.value = tree.getFilter();
    input.ignoreFocusOut = true;
    input.prompt = 'Results update as you type. Press Escape to close.';
    let debounceTimer;
    const listener = input.onDidChangeValue(value => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            tree.setFilter(value);
            if (view)
                view.description = (value && value.trim()) ? value.trim() : undefined;
        }, 80);
    });
    input.onDidHide(() => {
        clearTimeout(debounceTimer);
        listener.dispose();
        input.dispose();
    });
    input.show();
}
const ONLINE_LIBRARY_FILTER_AXES = [3, 4, 5];
const ONLINE_LIBRARY_FILTER_PURPOSES = ['Milling', 'Turning', 'Additive', 'Mill / Turn', 'Waterjet / Laser / Plasma', 'Inspection', 'Other'];
const MACHINE_FILTER_KINEMATICS = ['Head-Head', 'Head-Table', 'Table-Table'];
function formatMachineFilterDescription(filter) {
    if (!filter)
        return undefined;
    const parts = [];
    if (filter.purposes?.length)
        parts.push(...filter.purposes);
    if (filter.axes?.length)
        parts.push(filter.axes.map(a => `${a}-axis`).join(', '));
    if (filter.kinematics?.length)
        parts.push(...filter.kinematics);
    if (filter.tcp === true)
        parts.push('TCP');
    if (filter.tcp === false)
        parts.push('No TCP');
    if (filter.vendors?.length)
        parts.push(...filter.vendors.slice(0, 2));
    if (filter.vendors?.length > 2)
        parts.push(`+${filter.vendors.length - 2}`);
    return parts.length ? `Filter: ${parts.join(' • ')}` : undefined;
}
function selectedItemsToFilter(pickedItems, items, vendorList) {
    const clearItem = items[0];
    if (pickedItems.length === 0 || pickedItems.some((p) => p === clearItem))
        return null;
    const axes = [];
    const purposes = [];
    const kinematics = [];
    const vendors = [];
    const hasTcp = pickedItems.some(p => p.label === 'TCP');
    const hasNoTcp = pickedItems.some(p => p.label === 'No TCP');
    const tcp = hasTcp && hasNoTcp ? null : hasTcp ? true : hasNoTcp ? false : null;
    for (const p of pickedItems) {
        const n = ONLINE_LIBRARY_FILTER_AXES.find(a => p.label === `${a}-axis`);
        if (n != null)
            axes.push(n);
        else if (ONLINE_LIBRARY_FILTER_PURPOSES.includes(p.label))
            purposes.push(p.label);
        else if (MACHINE_FILTER_KINEMATICS.includes(p.label))
            kinematics.push(p.label);
        else if (vendorList.includes(p.label))
            vendors.push(p.label);
    }
    return { axes, purposes, kinematics, tcp, vendors };
}
function filterToSelectedItems(currentFilter, items, vendorList) {
    if (!currentFilter)
        return [];
    const selected = [];
    for (const item of items) {
        if (item.kind === vscode.QuickPickItemKind.Separator || item.label === '$(clear-all) Clear filter')
            continue;
        if (item.label === 'TCP' && currentFilter.tcp === true)
            selected.push(item);
        else if (item.label === 'No TCP' && currentFilter.tcp === false)
            selected.push(item);
        else {
            const axisN = ONLINE_LIBRARY_FILTER_AXES.find(a => item.label === `${a}-axis`);
            if (axisN != null && currentFilter.axes?.includes(axisN))
                selected.push(item);
            else if (ONLINE_LIBRARY_FILTER_PURPOSES.includes(item.label) && currentFilter.purposes?.includes(item.label))
                selected.push(item);
            else if (MACHINE_FILTER_KINEMATICS.includes(item.label) && currentFilter.kinematics?.includes(item.label))
                selected.push(item);
            else if (vendorList.includes(item.label) && currentFilter.vendors?.includes(item.label))
                selected.push(item);
        }
    }
    return selected;
}
function promptOnlineLibraryFilter(tree, machineListView) {
    const currentFilter = tree.getOnlineLibraryFilter();
    const selectedLabels = new Set();
    if (currentFilter) {
        if (currentFilter.tcp === true)
            selectedLabels.add('TCP');
        if (currentFilter.tcp === false)
            selectedLabels.add('No TCP');
        currentFilter.axes?.forEach(a => selectedLabels.add(`${a}-axis`));
        currentFilter.purposes?.forEach(p => selectedLabels.add(p));
        currentFilter.kinematics?.forEach(k => selectedLabels.add(k));
        currentFilter.vendors?.forEach(v => selectedLabels.add(v));
    }
    const withPicked = (label, description) => ({ label, description, picked: selectedLabels.has(label) });
    const staticItems = [
        { label: '$(clear-all) Clear filter', description: 'Show all machines' },
        { label: '', kind: vscode.QuickPickItemKind.Separator },
        ...ONLINE_LIBRARY_FILTER_AXES.map(n => withPicked(`${n}-axis`, 'Axis count')),
        { label: '', kind: vscode.QuickPickItemKind.Separator },
        ...ONLINE_LIBRARY_FILTER_PURPOSES.map(p => withPicked(p, 'Purpose')),
        { label: '', kind: vscode.QuickPickItemKind.Separator },
        ...MACHINE_FILTER_KINEMATICS.map(k => withPicked(k, 'Kinematics')),
        { label: '', kind: vscode.QuickPickItemKind.Separator },
        withPicked('TCP', 'Tool center point'),
        withPicked('No TCP', 'No tool center point'),
    ];
    const state = { items: staticItems.slice(), vendorList: [] };
    const quickPick = vscode.window.createQuickPick();
    quickPick.title = 'Filter machines (from .mch)';
    quickPick.placeHolder = 'Select axis, purpose, kinematics, vendor, and/or TCP — updates as you pick';
    quickPick.canSelectMany = true;
    quickPick.matchOnDescription = true;
    quickPick.items = state.items;
    quickPick.selectedItems = filterToSelectedItems(currentFilter, state.items, state.vendorList);
    quickPick.onDidChangeSelection((selected) => {
        const filter = selectedItemsToFilter(selected, state.items, state.vendorList);
        tree.setOnlineLibraryFilter(filter);
        if (machineListView)
            machineListView.description = formatMachineFilterDescription(filter);
    });
    quickPick.onDidAccept(() => quickPick.hide());
    quickPick.show();
    Promise.resolve().then(() => {
        let vendorList = [];
        try {
            vendorList = tree.getVendorListForFilter();
        }
        catch {
            return;
        }
        if (vendorList.length === 0)
            return;
        const vendorItems = [{ label: '', kind: vscode.QuickPickItemKind.Separator }, ...vendorList.map(v => withPicked(v, 'Vendor'))];
        state.vendorList = vendorList;
        state.items = [...staticItems, ...vendorItems];
        try {
            quickPick.items = state.items;
            quickPick.selectedItems = filterToSelectedItems(currentFilter, state.items, state.vendorList);
        }
        catch {
            // Quick pick may already be closed
        }
    });
}
function editMachineFile(filePath) {
    if (!(0, utils_1.fileExists)(filePath))
        return;
    vscode.workspace.openTextDocument(filePath).then(doc => {
        vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
    });
}
function openFolder(itemPath) {
    if (!(0, utils_1.fileExists)(itemPath))
        return;
    // If it's a file, open its parent directory
    const target = fs.statSync(itemPath).isFile() ? path.dirname(itemPath) : itemPath;
    if (os.type() === 'Windows_NT') {
        require('child_process').exec(`start "" "${target}"`);
    }
    else {
        require('child_process').exec(`open "" "${target}"`);
    }
}
function deactivate() {
    if (_engine) {
        try {
            _engine.backupCustomData();
        }
        catch (_) { /* ignore */ }
        _engine.clearRegressionTestFolders();
        _engine = undefined;
    }
}
//# sourceMappingURL=extension.js.map