"use strict";
// Guided editing of QA test case JSON files (same schema as post-library tests/test_cases).
Object.defineProperty(exports, "__esModule", { value: true });
exports.QaTestEditor = void 0;
exports.patchTestCases = patchTestCases;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const utils_1 = require("./utils");
const userLibrary = require("./userLibrary");
const qa = require("./qaTestRunner");
const SUFFIX_PATTERN = /^[A-Za-z0-9_-]*$/;
const MACHINE_EXTENSIONS = ['.mch', '.machine', '.f3d'];
const NUMERIC_TYPES = new Set(['integer', 'number', 'spatial', 'angle', 'float', 'double']);
const DEFAULT_COMMON = {
    type: 'testCases',
    version: 1,
    defaultFlags: '--lang EN --quiet --noeditor',
    defaultProperties: {
        programName: '1234',
        programComment: 'mycomment',
        showSequenceNumbers: false,
    },
    ignored: [],
};
function separator(label) {
    return { label, kind: vscode.QuickPickItemKind.Separator };
}
function extractValue(prop) {
    return typeof prop === 'object' && prop !== null && 'value' in prop ? prop.value : prop;
}
function sameFileContent(a, b) {
    try {
        const sa = fs.statSync(a);
        const sb = fs.statSync(b);
        return sa.size === sb.size && fs.readFileSync(a).equals(fs.readFileSync(b));
    }
    catch {
        return false;
    }
}
function listFiles(dir, extensions, recursive = true) {
    if (!dir || !(0, utils_1.fileExists)(dir))
        return [];
    if (recursive)
        return (0, utils_1.getFilesFromDirRecursive)(dir, extensions).map(rel => path.join(dir, rel));
    try {
        return fs.readdirSync(dir)
            .filter(f => extensions.includes(path.extname(f).toLowerCase()))
            .map(f => path.join(dir, f));
    }
    catch {
        return [];
    }
}
function slug(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24);
}
/** Reads a JSON file and remembers its indentation and trailing newline so writes produce minimal diffs. */
function readJsonWithStyle(file) {
    const text = fs.readFileSync(file, 'utf8');
    const indentMatch = text.match(/^[ \t]+(?=")/m);
    return {
        data: JSON.parse(text),
        indent: indentMatch ? indentMatch[0] : 2,
        newline: text.endsWith('\n') ? (text.endsWith('\r\n') ? '\r\n' : '\n') : '',
        eol: text.includes('\r\n') ? '\r\n' : '\n',
    };
}
function writeJsonWithStyle(file, doc) {
    let text = JSON.stringify(doc.data, null, doc.indent ?? 2);
    if (doc.eol === '\r\n')
        text = text.replace(/\n/g, '\r\n');
    (0, utils_1.ensureDir)(path.dirname(file));
    fs.writeFileSync(file, text + (doc.newline ?? '\n'), 'utf8');
}
/** Minimal JSON parser that records the [start, end) offsets of every value, so single entries can be replaced in place. */
function parseWithSpans(text) {
    let i = 0;
    const ws = () => { while (i < text.length && /\s/.test(text[i])) i++; };
    const value = () => {
        ws();
        const start = i;
        const ch = text[i];
        if (ch === '{') {
            i++;
            const members = {};
            ws();
            if (text[i] === '}') { i++; return { type: 'object', start, end: i, members }; }
            for (;;) {
                ws();
                const key = value();
                ws();
                i++; // ':'
                members[JSON.parse(text.slice(key.start, key.end))] = value();
                ws();
                if (text[i++] === '}')
                    return { type: 'object', start, end: i, members };
            }
        }
        if (ch === '[') {
            i++;
            const items = [];
            ws();
            if (text[i] === ']') { i++; return { type: 'array', start, end: i, items }; }
            for (;;) {
                items.push(value());
                ws();
                if (text[i++] === ']')
                    return { type: 'array', start, end: i, items };
            }
        }
        if (ch === '"') {
            i++;
            while (text[i] !== '"') i += text[i] === '\\' ? 2 : 1;
            i++;
            return { type: 'string', start, end: i };
        }
        while (i < text.length && !/[\s,}\]]/.test(text[i])) i++;
        return { type: 'literal', start, end: i };
    };
    return value();
}
function lineIndentAt(text, offset) {
    const lineStart = text.lastIndexOf('\n', offset - 1) + 1;
    return text.slice(lineStart, offset).match(/^[ \t]*/)[0];
}
function formatAt(obj, baseIndent, unit, eol) {
    return JSON.stringify(obj, null, unit).split('\n').map((l, n) => (n === 0 ? l : baseIndent + l)).join(eol);
}
/**
 * Applies one change to posts[entryIndex].testCases by editing only that part of the file text.
 * op: { kind: 'replace' | 'insert' | 'remove', index, value }. Falls back to a full rewrite if the text cannot be patched safely.
 */
function patchTestCases(file, entryIndex, op) {
    const doc = readJsonWithStyle(file);
    const cases = doc.data.posts[entryIndex].testCases;
    if (op.kind === 'replace')
        cases[op.index] = op.value;
    else if (op.kind === 'insert')
        cases.splice(op.index, 0, op.value);
    else
        cases.splice(op.index, 1);
    const text = fs.readFileSync(file, 'utf8');
    let patched;
    try {
        const tree = parseWithSpans(text);
        const arr = tree.members.posts.items[entryIndex].members.testCases;
        const unit = typeof doc.indent === 'string' ? doc.indent : ' '.repeat(doc.indent);
        if (op.kind === 'replace') {
            const node = arr.items[op.index];
            patched = text.slice(0, node.start) + formatAt(op.value, lineIndentAt(text, node.start), unit, doc.eol) + text.slice(node.end);
        }
        else if (op.kind === 'insert') {
            if (arr.items.length === 0) {
                const arrIndent = lineIndentAt(text, arr.start);
                const itemIndent = arrIndent + unit + unit;
                patched = text.slice(0, arr.start) + `[${doc.eol}${itemIndent}${formatAt(op.value, itemIndent, unit, doc.eol)}${doc.eol}${arrIndent}${unit}]` + text.slice(arr.end);
            }
            else {
                const ref = arr.items[Math.min(op.index, arr.items.length) - 1] ?? arr.items[0];
                const indent = lineIndentAt(text, ref.start);
                const formatted = formatAt(op.value, indent, unit, doc.eol);
                patched = op.index === 0
                    ? text.slice(0, ref.start) + formatted + `,${doc.eol}${indent}` + text.slice(ref.start)
                    : text.slice(0, ref.end) + `,${doc.eol}${indent}` + formatted + text.slice(ref.end);
            }
        }
        else {
            const node = arr.items[op.index];
            if (arr.items.length === 1)
                patched = text.slice(0, arr.start) + '[]' + text.slice(arr.end);
            else if (op.index > 0)
                patched = text.slice(0, arr.items[op.index - 1].end) + text.slice(node.end);
            else
                patched = text.slice(0, node.start) + text.slice(arr.items[1].start);
        }
        if (JSON.stringify(JSON.parse(patched)) !== JSON.stringify(doc.data))
            patched = undefined;
    }
    catch {
        patched = undefined;
    }
    if (patched === undefined)
        writeJsonWithStyle(file, doc);
    else
        fs.writeFileSync(file, patched, 'utf8');
}
class QaTestEditor {
    constructor(runner, engine) {
        this.runner = runner;
        this.engine = engine;
    }
    get project() {
        return this.runner.project;
    }
    // ── Helpers for nodes ───────────────────────────────────────
    /** Returns the post model for a tree node, or for the active editor's post. */
    async resolvePost(node) {
        if (node?.post)
            return node.post;
        const active = vscode.window.activeTextEditor?.document.fileName;
        if (active && active.toLowerCase().endsWith('.cps')) {
            if (!this.runner.findPostModel(active))
                this.runner.setPosts([active], { auto: true });
            return this.runner.findPostModel(active);
        }
        if (this.runner.model.posts.length === 1)
            return this.runner.model.posts[0];
        if (this.runner.model.posts.length > 1) {
            const picked = await vscode.window.showQuickPick(this.runner.model.posts.map(p => ({ label: p.name, description: p.cpsPath, post: p })), { title: 'Which post?' });
            return picked?.post;
        }
        vscode.window.showInformationMessage('Open a post (.cps) file first.');
        return undefined;
    }
    async ensureProject(postModel) {
        if (this.project)
            return true;
        if (this.runner.outsideRoot) {
            const outside = await vscode.window.showInformationMessage(`This post is outside the open folder. Use the QA tests in ${this.runner.outsideRoot}?`, 'Use these QA tests');
            if (outside !== 'Use these QA tests')
                return false;
            const model = this.runner.model;
            this.runner.setPosts(model.cpsPaths ?? [], { auto: model.auto, label: model.label, allowOutsideWorkspace: true });
            return !!this.project;
        }
        const choice = await vscode.window.showInformationMessage('There is no QA project yet. A QA project is a folder that holds your test cases, input files and expected output.', 'Create QA project', 'Use existing folder...');
        if (choice === 'Create QA project')
            return this.createProject(postModel?.cpsPath, false);
        if (choice === 'Use existing folder...')
            return this.selectProject();
        return false;
    }
    /** Loads the JSON file for a case node and returns { doc, post, testCase } after checking it still matches. */
    loadCase(node) {
        const c = node.testCase;
        const doc = readJsonWithStyle(c.entry.file);
        const post = doc.data.posts?.[c.entry.index];
        const testCase = post?.testCases?.[c.caseIndex];
        if (!post || post.name !== c.entry.name || !testCase) {
            vscode.window.showWarningMessage('The test case file was changed outside the QA test view. The view has been refreshed, please try again.');
            this.runner.reload();
            return undefined;
        }
        return { doc, post, testCase, file: c.entry.file, entryIndex: c.entry.index, caseIndex: c.caseIndex };
    }
    save(file, doc) {
        writeJsonWithStyle(file, doc);
        this.runner.reload();
    }
    saveCase(loaded) {
        patchTestCases(loaded.file, loaded.entryIndex, { kind: 'replace', index: loaded.caseIndex, value: loaded.testCase });
        this.runner.reload();
    }
    allSuffixes(postName, except) {
        const suffixes = [];
        for (const entry of this.project.entries.filter(e => e.name === postName)) {
            entry.def.testCases.forEach((tc, i) => {
                if (except && entry.file === except.file && entry.index === except.index && i === except.caseIndex)
                    return;
                suffixes.push(typeof tc.suffix === 'string' ? tc.suffix : '');
            });
        }
        return suffixes;
    }
    validateSuffix(value, postName, except) {
        if (!SUFFIX_PATTERN.test(value))
            return 'Use only letters, digits, "_" and "-".';
        if (this.allSuffixes(postName, except).includes(value))
            return value === '' ? 'Another test case already uses no suffix. Enter a suffix such as "_misc".' : `Suffix "${value}" is already used by another test case of this post.`;
        return undefined;
    }
    suggestSuffix(postName, description) {
        const used = this.allSuffixes(postName);
        if (!used.includes(''))
            return '';
        const base = `_${slug(description) || 'case'}`;
        let candidate = base;
        for (let i = 2; used.includes(candidate); i++)
            candidate = `${base}${i}`;
        return candidate;
    }
    // ── QA project ──────────────────────────────────────────────
    async createProject(cpsPath, offerFirstTestCase = true) {
        const active = cpsPath ?? vscode.window.activeTextEditor?.document.fileName;
        const postDir = active && active.toLowerCase().endsWith('.cps') ? path.dirname(active) : undefined;
        const items = [];
        if (postDir)
            items.push({ label: '$(new-folder) Create next to my posts', description: path.join(postDir, 'tests'), target: path.join(postDir, 'tests') });
        items.push({ label: '$(folder-opened) Choose a folder...', description: 'The selected folder becomes the QA project', target: undefined });
        const picked = items.length === 1 ? items[0] : await vscode.window.showQuickPick(items, { title: 'Create QA project: where should it be stored?' });
        if (!picked)
            return false;
        let root = picked.target;
        if (!root) {
            const uris = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Use as QA project', defaultUri: postDir ? vscode.Uri.file(postDir) : undefined });
            if (!uris?.[0])
                return false;
            root = uris[0].fsPath;
        }
        for (const sub of ['test_cases', 'cnc', 'machine', 'expected', 'output'])
            (0, utils_1.ensureDir)(path.join(root, sub));
        const common = path.join(root, 'test_cases', 'common.json');
        if (!(0, utils_1.fileExists)(common))
            writeJsonWithStyle(common, { data: DEFAULT_COMMON, indent: 2, newline: '\n' });
        const gitignore = path.join(root, '.gitignore');
        if (!(0, utils_1.fileExists)(gitignore))
            fs.writeFileSync(gitignore, 'output/\n', 'utf8');
        if (qa.findProjectRoot(active) !== root)
            await config.update('qaProjectFolder', root, true);
        this.runner.setPosts(active && active.toLowerCase().endsWith('.cps') ? [active] : [], { auto: true, startPath: root });
        const postName = active && active.toLowerCase().endsWith('.cps') ? path.basename(active, path.extname(active)) : undefined;
        const actions = postName && offerFirstTestCase ? [`Add test case for ${postName}`] : [];
        const choice = await vscode.window.showInformationMessage(`QA project created in ${root}.`, ...actions);
        if (choice && postName && offerFirstTestCase)
            await this.addTestCase({ kind: 'post', post: this.runner.findPostModel(active) });
        return true;
    }
    async selectProject() {
        const uris = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Use as QA project' });
        if (!uris?.[0])
            return false;
        let root = uris[0].fsPath;
        if (!(0, utils_1.fileExists)(path.join(root, 'test_cases')) && (0, utils_1.fileExists)(path.join(root, 'tests', 'test_cases')))
            root = path.join(root, 'tests');
        if (!(0, utils_1.fileExists)(path.join(root, 'test_cases'))) {
            const choice = await vscode.window.showWarningMessage(`"${root}" has no "test_cases" folder. Set it up as a new QA project?`, 'Set up');
            if (choice !== 'Set up')
                return false;
            for (const sub of ['test_cases', 'cnc', 'machine', 'expected', 'output'])
                (0, utils_1.ensureDir)(path.join(root, sub));
            writeJsonWithStyle(path.join(root, 'test_cases', 'common.json'), { data: DEFAULT_COMMON, indent: 2, newline: '\n' });
        }
        await config.update('qaProjectFolder', root, true);
        this.runner.setPosts(this.runner.model.cpsPaths ?? [], { auto: this.runner.model.auto, startPath: root });
        vscode.window.showInformationMessage(`Using QA project ${root}.`);
        return true;
    }
    // ── Pickers ─────────────────────────────────────────────────
    cncFolders() {
        const cncRoot = path.join(this.project.root, 'cnc');
        const folders = new Set();
        for (const rel of (0, utils_1.getFilesFromDirRecursive)(cncRoot, ['.cnc'])) {
            const dir = path.dirname(rel);
            folders.add(dir === '.' ? '' : dir.split(path.sep).join('/'));
        }
        return [...folders].sort();
    }
    async pickInputFolder(cpsPath, title) {
        const suggested = qa.getCapabilityFolder(cpsPath);
        const existing = this.cncFolders();
        if (existing.length === 0)
            return suggested;
        if (existing.length === 1 && existing[0] === suggested)
            return suggested;
        const items = existing.map(f => ({ label: f || '(top level)', description: f === suggested ? 'suggested' : undefined, value: f }));
        if (!existing.includes(suggested))
            items.unshift({ label: suggested, description: 'new folder, suggested for this post', value: suggested });
        items.sort((a, b) => (a.value === suggested ? -1 : b.value === suggested ? 1 : 0));
        items.push({ label: '$(new-folder) New folder...', value: undefined });
        const picked = await vscode.window.showQuickPick(items, { title, placeHolder: 'Folder inside the QA project\'s "cnc" folder that holds the input files' });
        if (!picked)
            return undefined;
        if (picked.value !== undefined)
            return picked.value;
        const name = await vscode.window.showInputBox({
            title,
            prompt: 'Name of the new input folder',
            value: suggested,
            validateInput: v => (/^[A-Za-z0-9 _-]+$/.test(v) ? undefined : 'Use letters, digits, spaces, "_" and "-".'),
        });
        return name?.trim() || undefined;
    }
    /** Multi-select of CNC inputs. Files from outside the project are copied into cnc/<inputFolder>. Returns input names. */
    async pickInputs(inputFolder, current, title) {
        const folderDir = qa.resolveInside(path.join(this.project.root, 'cnc'), inputFolder);
        if (!folderDir)
            return undefined;
        const items = [];
        const projectFiles = listFiles(folderDir, ['.cnc'], false);
        const projectNames = new Set(projectFiles.map(f => path.basename(f, '.cnc')));
        if (projectFiles.length) {
            items.push(separator(`In this QA project (cnc/${inputFolder})`));
            for (const f of projectFiles) {
                const name = path.basename(f, '.cnc');
                items.push({ label: name, picked: current.includes(name), file: f });
            }
        }
        const addSource = (label, dir) => {
            const files = listFiles(dir, ['.cnc']).filter(f => !projectNames.has(path.basename(f, '.cnc')));
            if (!files.length)
                return;
            items.push(separator(label));
            for (const f of files)
                items.push({ label: path.basename(f, '.cnc'), description: path.relative(dir, path.dirname(f)) || undefined, file: f, external: true });
        };
        addSource('From the extension\'s CNC library (copied into the project)', userLibrary.getExamplesDir('cnc'));
        for (const dir of userLibrary.getUserFolders('cnc').filter(d => userLibrary.isUsablePath(d)))
            addSource(`From ${dir} (copied into the project)`, dir);
        for (const missing of current.filter(n => !projectNames.has(n)))
            items.unshift({ label: missing, description: 'file is missing in the project', picked: true, missing: true });
        items.push(separator(''));
        items.push({ label: '$(folder-opened) Browse for other CNC files...', browse: true });
        const picked = await vscode.window.showQuickPick(items, {
            title,
            canPickMany: true,
            matchOnDescription: true,
            placeHolder: 'Tick the CNC files to test with, then press Enter. Type to search.',
        });
        if (!picked)
            return undefined;
        const chosen = picked.filter(i => !i.browse);
        if (picked.some(i => i.browse)) {
            const uris = await vscode.window.showOpenDialog({ canSelectMany: true, filters: { 'CNC files': ['cnc'] }, openLabel: 'Add to test case' });
            for (const uri of uris ?? [])
                chosen.push({ label: path.basename(uri.fsPath, '.cnc'), file: uri.fsPath, external: !qa.isInside(folderDir, uri.fsPath) });
        }
        if (chosen.length === 0) {
            vscode.window.showWarningMessage('Select at least one CNC file.');
            return undefined;
        }
        const names = [];
        for (const item of chosen) {
            if (item.external) {
                const copied = await this.copyIntoProject(item.file, folderDir);
                if (!copied)
                    continue;
            }
            if (!names.includes(item.label))
                names.push(item.label);
        }
        return names;
    }
    async copyIntoProject(source, targetDir) {
        const dest = path.join(targetDir, path.basename(source));
        if ((0, utils_1.fileExists)(dest)) {
            if (sameFileContent(source, dest))
                return dest;
            const choice = await vscode.window.showWarningMessage(`A different "${path.basename(source)}" already exists in the QA project.`, { modal: true }, 'Replace', 'Keep existing');
            if (choice === 'Keep existing')
                return dest;
            if (choice !== 'Replace')
                return undefined;
        }
        (0, utils_1.ensureDir)(targetDir);
        fs.copyFileSync(source, dest);
        return dest;
    }
    /** Returns a machine path relative to the project's parent folder, '' for no machine, or undefined if cancelled. */
    async pickMachine(current, title) {
        const project = this.project;
        const items = [{ label: '$(close) No machine', description: current ? undefined : 'current', value: '' }];
        const seen = new Set();
        const addSource = (label, dir, copy) => {
            const files = listFiles(dir, MACHINE_EXTENSIONS).filter(f => !seen.has(path.resolve(f)));
            if (!files.length)
                return;
            items.push(separator(label));
            for (const f of files) {
                seen.add(path.resolve(f));
                const rel = qa.toPosixRelative(project.baseDir, f);
                items.push({ label: path.basename(f, path.extname(f)), description: copy ? path.relative(dir, path.dirname(f)) || undefined : rel, file: f, copy, picked: rel === current });
            }
        };
        addSource('In this QA project', path.join(project.root, 'machine'), false);
        addSource('From the post library machines folder', path.join(project.baseDir, 'machines'), false);
        addSource('From the extension\'s machine library (copied into the project)', userLibrary.getExamplesDir('machine'), true);
        addSource('From the online machine library (copied into the project)', userLibrary.getOnlineLibraryDir(), true);
        for (const dir of userLibrary.getUserFolders('machine').filter(d => userLibrary.isUsablePath(d)))
            addSource(`From ${dir} (copied into the project)`, dir, !qa.isInside(project.baseDir, dir));
        items.push(separator(''));
        items.push({ label: '$(folder-opened) Browse...', browse: true });
        const currentItem = items.find(i => i.picked);
        if (currentItem)
            currentItem.description = `${currentItem.description ?? ''} (current)`.trim();
        const picked = await vscode.window.showQuickPick(items, { title, matchOnDescription: true, placeHolder: 'Machine definition used for this test case. Type to search.' });
        if (!picked)
            return undefined;
        let file = picked.file;
        let copy = picked.copy;
        if (picked.browse) {
            const uris = await vscode.window.showOpenDialog({ filters: { 'Machine files': ['mch', 'machine', 'f3d'] }, openLabel: 'Use machine' });
            if (!uris?.[0])
                return undefined;
            file = uris[0].fsPath;
            if (path.extname(file).toLowerCase() === '.f3d' && !(0, utils_1.f3dHasMachine)(file)) {
                vscode.window.showWarningMessage(`${path.basename(file)} contains no machine definition (.mch).`);
                return undefined;
            }
            copy = !qa.isInside(project.baseDir, file);
        }
        if (!file)
            return '';
        if (copy) {
            const dest = await this.copyIntoProject(file, path.join(project.root, 'machine'));
            if (!dest)
                return undefined;
            file = dest;
        }
        return qa.toPosixRelative(project.baseDir, file);
    }
    // ── Properties ──────────────────────────────────────────────
    async interrogate(cpsPath) {
        // The engine lookup can ask the user questions, so it must not run inside a progress notification.
        const exe = await this.runner.resolvePostEngine();
        if (!exe)
            return undefined;
        let mtime = 0;
        try {
            mtime = fs.statSync(cpsPath).mtimeMs;
        }
        catch { /* reported by the engine */ }
        const cacheKey = `${exe}|${cpsPath}`;
        const cached = this.propertyDefsCache?.get(cacheKey);
        if (cached && cached.mtime === mtime)
            return cached.defs;
        const data = await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Reading post properties' }, () => this.runner.interrogate(cpsPath, exe));
        if (!data || !data.properties) {
            vscode.window.showErrorMessage('Could not read the properties of this post. Check that the post compiles and that the Fusion post engine is set (command "Change post executable").');
            return undefined;
        }
        const defs = {};
        for (const [key, prop] of Object.entries(data.properties)) {
            const def = data.propertyDefinitions?.[key] ?? (typeof prop === 'object' && prop !== null ? prop : {});
            defs[key] = { key, title: def.title || key, description: def.description, group: def.group, type: def.type, values: def.values, scope: def.scope ?? prop?.scope, defaultValue: extractValue(prop) };
        }
        this.propertyDefsCache = this.propertyDefsCache ?? new Map();
        this.propertyDefsCache.set(cacheKey, { mtime, defs });
        return defs;
    }
    /** Changed properties from the Post Properties view (values that differ from the post defaults). */
    getChangedViewProperties(cpsPath) {
        const cache = this.engine.getPropertyCache(cpsPath);
        if (!cache)
            return undefined;
        const changed = {};
        for (const [key, prop] of Object.entries(cache.changed.properties ?? {})) {
            const value = extractValue(prop);
            const def = extractValue(cache.defaults.properties?.[key]);
            if (value !== undefined && String(value) !== String(def))
                changed[key] = value;
        }
        return changed;
    }
    async pickPropertyValue(def, current, isOverridden, title) {
        const resetItem = { label: '$(discard) Reset to post default', description: String(def?.defaultValue ?? ''), reset: true };
        const type = def?.type ?? typeof (current ?? def?.defaultValue);
        const values = Array.isArray(def?.values) ? def.values.map(v => (typeof v === 'object' && v !== null && 'id' in v ? v : { id: v, title: String(v) })) : [];
        if (type === 'boolean' || values.length > 0) {
            const options = values.length > 0
                ? values.map(v => ({ label: String(v.id), description: v.title !== String(v.id) ? v.title : undefined, value: v.id }))
                : [{ label: 'true', value: true }, { label: 'false', value: false }];
            for (const o of options) {
                if (String(o.value) === String(current))
                    o.description = `${o.description ?? ''} (current)`.trim();
            }
            if (isOverridden)
                options.unshift(resetItem);
            const picked = await vscode.window.showQuickPick(options, { title, placeHolder: def?.description || `Value for ${def?.key ?? ''}` });
            if (!picked)
                return { cancelled: true };
            return picked.reset ? { reset: true } : { value: picked.value };
        }
        const numeric = NUMERIC_TYPES.has(type) || type === 'number';
        if (isOverridden) {
            const choice = await vscode.window.showQuickPick([{ label: '$(edit) Enter a new value', edit: true }, resetItem], { title });
            if (!choice)
                return { cancelled: true };
            if (choice.reset)
                return { reset: true };
        }
        const input = await vscode.window.showInputBox({
            title,
            prompt: def?.description || (numeric ? 'Enter a number' : 'Enter a value'),
            value: current === undefined ? '' : String(current),
            validateInput: v => (numeric && (v.trim() === '' || isNaN(Number(v))) ? 'Enter a number.' : undefined),
        });
        if (input === undefined)
            return { cancelled: true };
        return { value: numeric ? Number(input) : input };
    }
    /** Interactive property editor. Returns the new properties object or undefined if nothing was confirmed. */
    async editPropertiesInteractive(cpsPath, initial, caseLabel, onChange, machineProps = {}) {
        const defs = await this.interrogate(cpsPath);
        if (!defs)
            return undefined;
        const props = { ...initial };
        const title = `Properties for "${caseLabel}"`;
        let lastKey;
        for (;;) {
            const overridden = Object.keys(props);
            const items = [];
            items.push({ label: '$(check) Done', description: overridden.length ? `${overridden.length} propert${overridden.length === 1 ? 'y' : 'ies'} set` : 'post defaults are used', done: true });
            items.push({ label: '$(add) Add a property not listed below...', custom: true });
            if (overridden.length) {
                items.push(separator('Set in this test case'));
                for (const key of overridden.sort()) {
                    const d = defs[key];
                    items.push({ label: `$(edit) ${d?.title ?? key}`, description: `${JSON.stringify(props[key])}   (default: ${d ? JSON.stringify(d.defaultValue) : 'n/a'})`, detail: key, key });
                }
            }
            const fromMachine = Object.keys(machineProps).filter(key => defs[key] && qa.hasMachineScope(defs[key]) && !(key in props)).sort();
            if (fromMachine.length) {
                items.push(separator('From the machine (pick to override in this test case)'));
                for (const key of fromMachine)
                    items.push({ label: `$(server) ${defs[key].title}`, description: `${JSON.stringify(machineProps[key])}   (default: ${JSON.stringify(defs[key].defaultValue)})`, detail: key, key });
            }
            items.push(separator('All post properties'));
            const sorted = Object.values(defs).filter(d => !(d.key in props) && !fromMachine.includes(d.key)).sort((a, b) => String(a.group ?? '').localeCompare(String(b.group ?? '')) || a.title.localeCompare(b.title));
            for (const d of sorted)
                items.push({ label: d.title, description: `${JSON.stringify(d.defaultValue)}${d.group ? `   · ${d.group}` : ''}`, detail: d.key, key: d.key });
            const quickPick = vscode.window.createQuickPick();
            quickPick.title = title;
            quickPick.placeholder = 'Pick a property to change it. Type to search by name or title.';
            quickPick.matchOnDescription = true;
            quickPick.matchOnDetail = true;
            quickPick.items = items;
            const last = lastKey && items.find(i => i.key === lastKey);
            if (last)
                quickPick.activeItems = [last];
            const picked = await new Promise(resolve => {
                quickPick.onDidAccept(() => { resolve(quickPick.selectedItems[0]); quickPick.hide(); });
                quickPick.onDidHide(() => resolve(undefined));
                quickPick.show();
            });
            quickPick.dispose();
            if (!picked || picked.done)
                return props;
            if (picked.custom) {
                const key = await vscode.window.showInputBox({ title, prompt: 'Property name (as used in the post, e.g. "useRadius")', validateInput: v => (/^[A-Za-z_$][\w$]*$/.test(v) ? undefined : 'Enter a valid property name.') });
                if (!key)
                    continue;
                const raw = await vscode.window.showInputBox({ title, prompt: `Value for ${key} (true/false, a number or text)` });
                if (raw === undefined)
                    continue;
                props[key] = raw === 'true' ? true : raw === 'false' ? false : raw.trim() !== '' && !isNaN(Number(raw)) ? Number(raw) : raw;
                lastKey = key;
                onChange?.(props);
                continue;
            }
            const def = defs[picked.key];
            const result = await this.pickPropertyValue(def ?? { key: picked.key }, picked.key in props ? props[picked.key] : def?.defaultValue, picked.key in props, `${title}: ${def?.title ?? picked.key}`);
            if (result.cancelled)
                continue;
            if (result.reset)
                delete props[picked.key];
            else
                props[picked.key] = result.value;
            lastKey = picked.key;
            onChange?.(props);
        }
    }
    // ── Commands ────────────────────────────────────────────────
    async addTestCase(node, presetProperties) {
        const postModel = await this.resolvePost(node);
        if (!postModel || !(await this.ensureProject(postModel)))
            return;
        const post = this.runner.findPostModel(postModel.cpsPath) ?? postModel;
        const steps = 5;
        const t = (n, what) => `Add test case for ${post.name} (${n}/${steps}): ${what}`;
        const firstCase = this.allSuffixes(post.name).length === 0;
        const description = await vscode.window.showInputBox({
            title: t(1, 'description'),
            prompt: 'Short description of what this test case checks',
            value: firstCase ? 'Standard operations' : '',
            placeHolder: 'e.g. Preload tool, 5-axis operations, Inch output',
            validateInput: v => (v.trim() ? undefined : 'Enter a description.'),
        });
        if (description === undefined)
            return;
        const inputFolder = await this.pickInputFolder(post.cpsPath, t(2, 'input folder'));
        if (inputFolder === undefined)
            return;
        const inputs = await this.pickInputs(inputFolder, [], t(3, 'input CNC files'));
        if (!inputs)
            return;
        const machine = await this.pickMachine('', t(4, 'machine (optional)'));
        if (machine === undefined)
            return;
        const suffix = await vscode.window.showInputBox({
            title: t(5, 'output file suffix'),
            prompt: 'Added to the output file names so test cases do not overwrite each other. Leave empty for the main test case.',
            value: this.suggestSuffix(post.name, description),
            validateInput: v => this.validateSuffix(v, post.name),
        });
        if (suffix === undefined)
            return;
        let properties = presetProperties;
        if (!properties) {
            const changed = this.getChangedViewProperties(post.cpsPath);
            const options = [
                { label: '$(check) Use the post defaults', description: 'You can change properties later', mode: 'none' },
                { label: '$(settings) Choose properties now...', mode: 'pick' },
            ];
            if (changed && Object.keys(changed).length)
                options.splice(1, 0, { label: `$(copy) Use the ${Object.keys(changed).length} propert${Object.keys(changed).length === 1 ? 'y' : 'ies'} changed in the Post Properties view`, description: Object.keys(changed).join(', '), mode: 'view' });
            const mode = await vscode.window.showQuickPick(options, { title: `Add test case for ${post.name}: properties` });
            if (!mode)
                return;
            properties = mode.mode === 'view' ? changed : mode.mode === 'pick'
                ? await this.editPropertiesInteractive(post.cpsPath, {}, description, undefined, await qa.readMachineProperties(this.runner.project, machine)) : {};
            if (properties === undefined)
                return;
        }
        const testCase = { description: description.trim(), inputFolder, suffix, properties, input: inputs };
        if (machine)
            testCase.machine = machine;
        const entry = this.project.entries.find(e => e.name === post.name);
        let file;
        let doc;
        if (entry) {
            file = entry.file;
            doc = readJsonWithStyle(file);
            const p = doc.data.posts?.[entry.index];
            if (!p || p.name !== post.name) {
                vscode.window.showWarningMessage('The test case file was changed outside the QA test view. Please try again.');
                this.runner.reload();
                return;
            }
            patchTestCases(file, entry.index, { kind: 'insert', index: p.testCases.length, value: testCase });
            this.runner.reload();
        }
        else {
            const capability = qa.getCapabilityFolder(post.cpsPath);
            file = qa.resolveInside(this.project.testCasesDir, path.join(capability, `${post.name}.json`));
            if (!file) {
                vscode.window.showErrorMessage(`Cannot create a test case file for post name "${post.name}".`);
                return;
            }
            doc = (0, utils_1.fileExists)(file) ? readJsonWithStyle(file) : { data: { type: 'testCases', version: 1, posts: [] }, indent: 2, newline: '\n' };
            if (!Array.isArray(doc.data.posts))
                doc.data.posts = [];
            doc.data.posts.push({ name: post.name, outputFolder: capability, testCases: [testCase] });
            this.save(file, doc);
        }
        const choice = await vscode.window.showInformationMessage(`Test case "${testCase.description}" added to ${post.name}.`, 'Run it now', 'Edit properties');
        const added = this.findCaseNode(post.cpsPath, file, testCase.description, suffix);
        if (choice === 'Run it now' && added)
            vscode.commands.executeCommand('autodesk.post.qaTest.runItem', added);
        else if (choice === 'Edit properties' && added)
            this.editProperties(added);
    }
    findCaseNode(cpsPath, file, description, suffix) {
        const post = this.runner.findPostModel(cpsPath);
        const c = post?.cases.find(x => x.entry.file === file && (x.testCase.suffix ?? '') === suffix && x.testCase.description === description);
        return c ? { kind: 'case', post, testCase: c } : undefined;
    }
    async saveViewPropertiesAsTestCase(node) {
        const post = await this.resolvePost(node);
        if (!post)
            return;
        const changed = this.getChangedViewProperties(post.cpsPath);
        if (!changed) {
            vscode.window.showInformationMessage('Load the properties in the Post Properties view first, change the ones you want to test, then run this again.');
            return;
        }
        if (Object.keys(changed).length === 0) {
            const choice = await vscode.window.showInformationMessage('No properties are changed in the Post Properties view. Create a test case with the post defaults?', 'Create');
            if (choice !== 'Create')
                return;
        }
        await this.addTestCase({ kind: 'post', post }, changed);
    }
    async editProperties(node) {
        const loaded = this.loadCase(node);
        if (!loaded)
            return;
        const label = loaded.testCase.description || loaded.testCase.suffix || 'test case';
        const result = await this.editPropertiesInteractive(node.post.cpsPath, loaded.testCase.properties ?? {}, label, props => {
            const fresh = this.loadCase(node);
            if (!fresh)
                return;
            fresh.testCase.properties = props;
            this.saveCase(fresh);
        }, await qa.readMachineProperties(this.runner.project, loaded.testCase.machine));
        if (result)
            vscode.window.setStatusBarMessage(`Properties of "${label}" saved`, 4000);
    }
    async editInputs(node) {
        const loaded = this.loadCase(node);
        if (!loaded)
            return;
        const inputFolder = typeof loaded.testCase.inputFolder === 'string' ? loaded.testCase.inputFolder : '';
        const inputs = await this.pickInputs(inputFolder, loaded.testCase.input ?? [], `Inputs for "${loaded.testCase.description || loaded.testCase.suffix}"`);
        if (!inputs)
            return;
        const fresh = this.loadCase(node);
        if (!fresh)
            return;
        fresh.testCase.input = inputs;
        this.saveCase(fresh);
    }
    async editMachine(node) {
        const loaded = this.loadCase(node);
        if (!loaded)
            return;
        const machine = await this.pickMachine(loaded.testCase.machine ?? '', `Machine for "${loaded.testCase.description || loaded.testCase.suffix}"`);
        if (machine === undefined)
            return;
        const fresh = this.loadCase(node);
        if (!fresh)
            return;
        if (machine)
            fresh.testCase.machine = machine;
        else
            delete fresh.testCase.machine;
        this.saveCase(fresh);
    }
    async editDescription(node) {
        const loaded = this.loadCase(node);
        if (!loaded)
            return;
        const value = await vscode.window.showInputBox({ title: 'Test case description', value: loaded.testCase.description ?? '', validateInput: v => (v.trim() ? undefined : 'Enter a description.') });
        if (value === undefined)
            return;
        loaded.testCase.description = value.trim();
        this.saveCase(loaded);
    }
    async editSuffix(node) {
        const loaded = this.loadCase(node);
        if (!loaded)
            return;
        const c = node.testCase;
        const except = { file: c.entry.file, index: c.entry.index, caseIndex: c.caseIndex };
        const oldSuffix = loaded.testCase.suffix ?? '';
        const value = await vscode.window.showInputBox({
            title: 'Output file suffix',
            prompt: 'Added to the output file names of this test case',
            value: oldSuffix,
            validateInput: v => this.validateSuffix(v, c.entry.name, except),
        });
        if (value === undefined || value === oldSuffix)
            return;
        const oldJobs = c.jobs.map(j => ({ job: j, paths: qa.getJobPaths(this.project, j) }));
        loaded.testCase.suffix = value;
        this.saveCase(loaded);
        const existing = oldJobs.filter(o => o.paths.expected && (0, utils_1.fileExists)(o.paths.expected));
        if (existing.length === 0)
            return;
        const choice = await vscode.window.showInformationMessage(`Rename the ${existing.length} existing expected file(s) to the new suffix?`, 'Rename', 'Keep');
        if (choice !== 'Rename')
            return;
        for (const o of existing) {
            const renamedJob = { ...o.job, suffix: value + o.job.suffix.slice(oldSuffix.length) };
            const target = qa.getJobPaths(this.project, renamedJob).expected;
            if (target && !(0, utils_1.fileExists)(target))
                fs.renameSync(o.paths.expected, target);
        }
        this.runner.reload();
    }
    async editAdditionalFlags(node) {
        const loaded = this.loadCase(node);
        if (!loaded)
            return;
        const value = await vscode.window.showInputBox({ title: 'Additional post engine flags', prompt: 'Extra command line options for the post engine, e.g. --shorten 200. Leave empty for none.', value: loaded.testCase.additionalFlags ?? '' });
        if (value === undefined)
            return;
        if (value.trim())
            loaded.testCase.additionalFlags = value.trim();
        else
            delete loaded.testCase.additionalFlags;
        this.saveCase(loaded);
    }
    async toggleIgnored(node) {
        const loaded = this.loadCase(node);
        if (!loaded)
            return;
        if (loaded.testCase.ignored)
            delete loaded.testCase.ignored;
        else
            loaded.testCase.ignored = true;
        this.saveCase(loaded);
        vscode.window.setStatusBarMessage(loaded.testCase.ignored ? 'Test case will be skipped' : 'Test case will run again', 4000);
    }
    async toggleUseDefaultProperties(node) {
        const loaded = this.loadCase(node);
        if (!loaded)
            return;
        if (loaded.testCase.useDefaultProperties === false)
            delete loaded.testCase.useDefaultProperties;
        else
            loaded.testCase.useDefaultProperties = false;
        this.saveCase(loaded);
        vscode.window.setStatusBarMessage(loaded.testCase.useDefaultProperties === false
            ? 'Default properties from common.json are no longer applied to this test case'
            : 'Default properties from common.json are applied again', 5000);
    }
    async duplicateTestCase(node) {
        const loaded = this.loadCase(node);
        if (!loaded)
            return;
        const c = node.testCase;
        const description = await vscode.window.showInputBox({ title: 'Duplicate test case: description', value: `${loaded.testCase.description ?? ''} (copy)`, validateInput: v => (v.trim() ? undefined : 'Enter a description.') });
        if (description === undefined)
            return;
        const suffix = await vscode.window.showInputBox({
            title: 'Duplicate test case: output file suffix',
            value: this.suggestSuffix(c.entry.name, description),
            validateInput: v => this.validateSuffix(v, c.entry.name),
        });
        if (suffix === undefined)
            return;
        const copy = (0, utils_1.deepClone)(loaded.testCase);
        copy.description = description.trim();
        copy.suffix = suffix;
        patchTestCases(loaded.file, loaded.entryIndex, { kind: 'insert', index: c.caseIndex + 1, value: copy });
        this.runner.reload();
        const added = this.findCaseNode(node.post.cpsPath, loaded.file, copy.description, suffix);
        const choice = await vscode.window.showInformationMessage(`Test case "${copy.description}" created.`, 'Edit properties');
        if (choice && added)
            this.editProperties(added);
    }
    async removeTestCase(node) {
        const loaded = this.loadCase(node);
        if (!loaded)
            return;
        const c = node.testCase;
        const expectedCount = c.jobs.filter(j => { const e = qa.getJobPaths(this.project, j).expected; return e && (0, utils_1.fileExists)(e); }).length;
        const buttons = expectedCount ? ['Remove', 'Remove and delete expected files'] : ['Remove'];
        const choice = await vscode.window.showWarningMessage(`Remove test case "${loaded.testCase.description || loaded.testCase.suffix}"?`, { modal: true, detail: expectedCount ? `It has ${expectedCount} expected output file(s).` : undefined }, ...buttons);
        if (!choice)
            return;
        if (choice === 'Remove and delete expected files')
            this.runner.deleteExpectedFiles(c.jobs);
        patchTestCases(loaded.file, loaded.entryIndex, { kind: 'remove', index: c.caseIndex });
        this.runner.reload();
    }
    async openTestCaseJson(node) {
        let file;
        let needle;
        if (node?.testCase) {
            file = node.testCase.entry.file;
            needle = node.testCase.testCase.description;
        }
        else {
            const post = await this.resolvePost(node);
            const entry = post && this.project?.entries.find(e => e.name === post.name);
            if (!entry) {
                vscode.window.showInformationMessage('This post has no test cases yet. Use "Add test case" to create them.');
                return;
            }
            file = entry.file;
            needle = entry.name;
        }
        const doc = await vscode.workspace.openTextDocument(file);
        const editor = await vscode.window.showTextDocument(doc, { preview: false });
        if (needle) {
            const index = doc.getText().indexOf(JSON.stringify(needle));
            if (index >= 0) {
                const pos = doc.positionAt(index);
                editor.selection = new vscode.Selection(pos, pos);
                editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
            }
        }
    }
}
exports.QaTestEditor = QaTestEditor;
