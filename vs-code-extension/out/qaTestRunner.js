"use strict";
// QA test runner: JSON-driven post processor tests, compatible with the post-library tests folder layout.
Object.defineProperty(exports, "__esModule", { value: true });
exports.QaTestRunner = exports.STATUS = void 0;
exports.findProjectRoot = findProjectRoot;
exports.loadProject = loadProject;
exports.createJobs = createJobs;
exports.getJobPaths = getJobPaths;
exports.getPostCapabilities = getPostCapabilities;
exports.getCapabilityFolder = getCapabilityFolder;
exports.resolveInside = resolveInside;
exports.readMachineProperties = readMachineProperties;
exports.hasMachineScope = hasMachineScope;
exports.isInside = isInside;
exports.toPosixRelative = toPosixRelative;
exports.listPostsInFolder = listPostsInFolder;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const os = require("os");
const config = require("./config");
const utils_1 = require("./utils");
const qaUnitCompare_1 = require("./qaUnitCompare");
const qaLibrary = require("./qaLibrary");
const SUPPORTED_CAPABILITIES = [
    'CAPABILITY_MILLING',
    'CAPABILITY_TURNING',
    'CAPABILITY_JET',
    'CAPABILITY_ADDITIVE',
    'CAPABILITY_INSPECTION',
    'CAPABILITY_SETUP_SHEET',
];
const UNITS = ['IN', 'MM'];
const SKIPPED_SCAN_DIRS = new Set(['node_modules', '.git', 'jenkins', 'tests', 'machines', 'packages']);
/** Post engine errors caused by parallel runs accessing the same files; such runs are retried one at a time, like merge_posts.py. */
const ENGINE_BUSY = /Unable to open|Failed to construct/;
const ENGINE_BUSY_RETRIES = 2;
/** Index in UNITS of the unit that runs first: the editor's output unit. */
function firstUnitIndex() {
    return config.get('outputUnits') === 'IN' ? 0 : 1;
}
function isFirstUnit(job) {
    return Number(job.properties?.unit) === firstUnitIndex();
}
function secondUnitSkipMessage() {
    return `Not run: the ${UNITS[firstUnitIndex()]} outputs of this post have problems. Fix them and run the tests again.`;
}
const STATUS = {
    notRun: 'notRun',
    stale: 'stale',
    queued: 'queued',
    running: 'running',
    passed: 'passed',
    differs: 'differs',
    failed: 'failed',
    missingInput: 'missingInput',
    missingExpected: 'missingExpected',
    missingPost: 'missingPost',
    ignored: 'ignored',
    skipped: 'skipped',
    unsupported: 'unsupported',
    noTestCases: 'noTestCases',
};
exports.STATUS = STATUS;
const PROBLEM_STATUSES = new Set([STATUS.differs, STATUS.failed, STATUS.missingInput, STATUS.missingExpected, STATUS.missingPost]);
const STATUS_LABELS = {
    passed: 'Success',
    differs: 'Output differs',
    failed: 'Failure',
    missingInput: 'Missing input',
    missingExpected: 'Missing expected',
    missingPost: 'Missing post',
    ignored: 'Ignored',
    skipped: 'Skipped',
    unsupported: 'Unsupported',
    noTestCases: 'No test cases',
};
// ── Path helpers ────────────────────────────────────────────────
function isInside(parent, child) {
    const rel = path.relative(parent, child);
    return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}
/** Resolves a relative path from test data against base; returns undefined if it escapes base. */
function resolveInside(base, rel) {
    if (typeof rel !== 'string')
        return undefined;
    const resolved = path.resolve(base, rel);
    return isInside(base, resolved) ? resolved : undefined;
}
function toPosixRelative(from, to) {
    return path.relative(from, to).split(path.sep).join('/');
}
function isDirectory(p) {
    try {
        return fs.statSync(p).isDirectory();
    }
    catch {
        return false;
    }
}
function readJsonFile(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function listJsonFiles(dir) {
    const result = [];
    const walk = (current) => {
        let entries;
        try {
            entries = fs.readdirSync(current, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const d of entries) {
            const full = path.join(current, d.name);
            if (d.isDirectory())
                walk(full);
            else if (d.isFile() && d.name.toLowerCase().endsWith('.json'))
                result.push(full);
        }
    };
    walk(dir);
    return result.sort();
}
// ── Project discovery ───────────────────────────────────────────
function hasTestCases(dir) {
    return !!dir && isDirectory(path.join(dir, 'test_cases'));
}
/** True if a folder is open and startPath is outside all workspace folders. */
function isOutsideWorkspace(startPath) {
    const folders = vscode.workspace.workspaceFolders ?? [];
    return !!startPath && folders.length > 0 && !folders.some(f => isInside(f.uri.fsPath, path.resolve(startPath)));
}
/**
 * QA project = folder containing test_cases/. Setting first, then walk up from startPath checking <dir> and <dir>/tests.
 * Workspace folders are only used without startPath. With a folder open, a startPath outside it finds no project
 * unless allowOutsideWorkspace is set, so tests and expected files outside the open folder are only used on request.
 */
function findProjectRoot(startPath, { allowOutsideWorkspace = false } = {}) {
    const configured = config.get('qaProjectFolder');
    if (typeof configured === 'string' && configured.trim() && hasTestCases(configured.trim()))
        return path.resolve(configured.trim());
    if (!allowOutsideWorkspace && isOutsideWorkspace(startPath))
        return undefined;
    const starts = startPath ? [startPath] : (vscode.workspace.workspaceFolders ?? []).map(f => f.uri.fsPath);
    for (const start of starts) {
        let dir = isDirectory(start) ? path.resolve(start) : path.dirname(path.resolve(start));
        for (;;) {
            if (hasTestCases(dir))
                return dir;
            const tests = path.join(dir, 'tests');
            if (hasTestCases(tests))
                return tests;
            const up = path.dirname(dir);
            if (up === dir)
                break;
            dir = up;
        }
    }
    return undefined;
}
/** Reads all test case JSON files. Top-level defaultFlags/defaultProperties/ignored are merged like run-tests.js. */
function loadProject(root) {
    const testCasesDir = path.join(root, 'test_cases');
    const project = {
        root,
        baseDir: path.dirname(root),
        testCasesDir,
        defaultFlags: '',
        defaultProperties: {},
        ignored: [],
        ignoreSingle: [],
        ignoreAll: [],
        entries: [],
        globalFiles: [],
        errors: [],
    };
    for (const file of listJsonFiles(testCasesDir)) {
        let data;
        try {
            data = readJsonFile(file);
        }
        catch (e) {
            project.errors.push(`${path.relative(root, file)}: ${e.message}`);
            continue;
        }
        if (!data || typeof data !== 'object')
            continue;
        if (typeof data.defaultFlags === 'string')
            project.defaultFlags = data.defaultFlags;
        if (data.defaultProperties && typeof data.defaultProperties === 'object')
            project.defaultProperties = { ...project.defaultProperties, ...data.defaultProperties };
        if (Array.isArray(data.ignored))
            project.ignored.push(...data.ignored.filter(i => i && typeof i === 'object'));
        if (!Array.isArray(data.posts))
            project.globalFiles.push(file);
        if (Array.isArray(data.posts)) {
            data.posts.forEach((post, index) => {
                if (post && typeof post.name === 'string' && Array.isArray(post.testCases))
                    project.entries.push({ file, index, name: post.name, def: post });
            });
        }
    }
    project.ignoreSingle = readIgnoreList(path.join(root, 'ignore_single.json'));
    project.ignoreAll = readIgnoreList(path.join(root, 'ignore_all.json'));
    return project;
}
function readIgnoreList(file) {
    if (!(0, utils_1.fileExists)(file))
        return [];
    try {
        const data = readJsonFile(file);
        return Array.isArray(data.ignore) ? data.ignore.filter(n => typeof n === 'string') : [];
    }
    catch {
        return [];
    }
}
function getEntriesForPost(project, postName) {
    const exact = project.entries.filter(e => e.name === postName);
    if (exact.length > 0 || process.platform !== 'win32')
        return exact;
    const lower = postName.toLowerCase();
    return project.entries.filter(e => e.name.toLowerCase() === lower);
}
// ── Post helpers ────────────────────────────────────────────────
function getPostCapabilities(cpsPath) {
    if (cpsPath.toLowerCase().endsWith('.cpsz'))
        return undefined;
    let text;
    try {
        text = fs.readFileSync(cpsPath, 'utf8');
    }
    catch {
        return [];
    }
    if (text.startsWith('ENCRYPTED AUTODESK CAM POST'))
        return undefined;
    const match = text.match(/capabilities\s*=\s*(\w+)(?:\s*\|\s*(\w+))*/);
    if (!match)
        return [];
    const line = text.slice(match.index, match.index + match[0].length);
    return line.replace(/^capabilities\s*=\s*/, '').split('|').map(s => s.trim()).filter(Boolean);
}
/** Same rule as run-tests.js checkCapabilities: encrypted/packaged posts pass, otherwise one supported capability is needed. */
function hasSupportedCapabilities(cpsPath) {
    const caps = getPostCapabilities(cpsPath);
    if (caps === undefined)
        return true;
    return caps.some(c => SUPPORTED_CAPABILITIES.includes(c));
}
function getCapabilityFolder(cpsPath) {
    const caps = getPostCapabilities(cpsPath) ?? [];
    const has = (c) => caps.includes(`CAPABILITY_${c}`);
    if (has('ADDITIVE'))
        return 'additive';
    if (has('MILLING') && has('TURNING'))
        return 'millturn';
    if (has('MILLING') && has('JET'))
        return 'milljet';
    if (has('JET'))
        return 'jet';
    if (has('TURNING'))
        return 'turning';
    return 'milling';
}
function findPackagesDir(postDir) {
    let dir = path.resolve(postDir);
    for (;;) {
        const candidate = path.join(dir, 'packages');
        if (isDirectory(candidate))
            return candidate;
        const up = path.dirname(dir);
        if (up === dir)
            return undefined;
        dir = up;
    }
}
/** Parallel runs when "qaParallel" is 0. More than about 8 runs hardly speeds up the post engine but loads the computer. */
function defaultParallel() {
    const cores = os.cpus().length;
    const byMemory = Math.floor(os.totalmem() / (512 * 1024 * 1024));
    return Math.max(1, Math.min(8, cores - 2, byMemory));
}
/** Notification that closes itself; VS Code messages with buttons stay until the user closes them. */
function showTimedMessage(message, ms) {
    vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: message }, () => new Promise(resolve => setTimeout(resolve, ms)));
}
async function pathExists(p) {
    try {
        await fs.promises.access(p);
        return true;
    }
    catch {
        return false;
    }
}
async function fileSize(p) {
    try {
        return (await fs.promises.stat(p)).size;
    }
    catch {
        return -1;
    }
}
function listPostsInFolder(folder, recursive) {
    const result = [];
    const walk = (dir) => {
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const d of entries) {
            const full = path.join(dir, d.name);
            if (d.isFile() && d.name.toLowerCase().endsWith('.cps'))
                result.push(full);
            else if (recursive && d.isDirectory() && !SKIPPED_SCAN_DIRS.has(d.name.toLowerCase()))
                walk(full);
        }
    };
    walk(folder);
    return result.sort((a, b) => a.localeCompare(b));
}
/** Splits a flag string on whitespace, keeping double-quoted parts together. */
function tokenizeFlags(flags) {
    if (typeof flags !== 'string' || !flags.trim())
        return [];
    const tokens = [];
    const re = /"([^"]*)"|(\S+)/g;
    let m;
    while ((m = re.exec(flags)) !== null)
        tokens.push(m[1] !== undefined ? m[1] : m[2]);
    return tokens;
}
/** Same quoting as run-tests.js getPropertyFlags: strings are wrapped in single quotes. */
function formatPropertyValue(value) {
    if (typeof value === 'string') {
        let p = value;
        if (p.startsWith("'"))
            p = p.slice(1);
        if (p.endsWith("'"))
            p = p.slice(0, -1);
        return `'${p}'`;
    }
    return String(value);
}
// ── Machine post properties ─────────────────────────────────────
const machinePropertiesCache = new Map();
/**
 * Post properties stored in a .mch machine file (post.default.properties). The unit is left out so the
 * job's own unit always wins. Only .mch files are read; .f3d and .machine files are containers.
 */
function machinePropertiesFromMchJson(stored) {
    const properties = {};
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        for (const [key, value] of Object.entries(stored)) {
            if (key !== 'unit' && value !== null && typeof value !== 'object')
                properties[key] = value;
        }
    }
    return properties;
}
/** Sync read for building the test tree; run-time merging uses {@link readMachineProperties}. */
function readMachinePropertiesSync(project, machine) {
    if (!project || typeof machine !== 'string' || path.extname(machine).toLowerCase() !== '.mch')
        return {};
    const file = resolveInside(project.baseDir, machine);
    if (!file)
        return {};
    let mtime;
    try {
        mtime = fs.statSync(file).mtimeMs;
    }
    catch {
        return {};
    }
    const cached = machinePropertiesCache.get(file);
    if (cached && cached.mtime === mtime && cached.properties)
        return cached.properties;
    let properties = {};
    try {
        properties = machinePropertiesFromMchJson(readJsonFile(file)?.post?.default?.properties);
    }
    catch { /* not a JSON machine file */ }
    machinePropertiesCache.set(file, { mtime, properties });
    return properties;
}
async function readMachineProperties(project, machine) {
    if (!project || typeof machine !== 'string' || path.extname(machine).toLowerCase() !== '.mch')
        return {};
    const file = resolveInside(project.baseDir, machine);
    if (!file)
        return {};
    let mtime;
    try {
        mtime = (await fs.promises.stat(file)).mtimeMs;
    }
    catch {
        return {};
    }
    const cached = machinePropertiesCache.get(file);
    if (cached && cached.mtime === mtime && cached.promise)
        return cached.promise;
    const promise = fs.promises.readFile(file, 'utf8')
        .then(text => machinePropertiesFromMchJson(JSON.parse(text)?.post?.default?.properties))
        .catch(() => ({}))
        .then(properties => {
            machinePropertiesCache.set(file, { mtime, properties, promise });
            return properties;
        });
    machinePropertiesCache.set(file, { mtime, promise });
    return promise;
}
/** Only machine-scoped properties are stored in and taken from .mch files. */
function hasMachineScope(def) {
    const scope = def?.scope;
    return Array.isArray(scope) ? scope.includes('machine') : scope === 'machine';
}
// ── Job creation ────────────────────────────────────────────────
/** Mirrors run-tests.js createTestJob: one job per input and unit, unless the case pins the unit. */
function createJobs(project, entry, caseIndex) {
    const post = entry.def;
    const testCase = post.testCases[caseIndex];
    if (!testCase || typeof testCase !== 'object')
        return [];
    const useDefaults = testCase.useDefaultProperties !== undefined ? testCase.useDefaultProperties : true;
    let properties = useDefaults ? { ...project.defaultProperties } : {};
    const caseKeys = testCase.properties && typeof testCase.properties === 'object' ? Object.keys(testCase.properties) : [];
    if (caseKeys.length)
        properties = { ...properties, ...testCase.properties };
    const machine = typeof testCase.machine === 'string' ? testCase.machine : '';
    const machineProperties = readMachinePropertiesSync(project, machine);
    const hasUnit = properties.unit !== undefined;
    const unitSetting = config.get('qaUnits') || 'both';
    const inputs = Array.isArray(testCase.input) ? testCase.input.filter(i => typeof i === 'string') : [null];
    const skipReasons = [];
    if (testCase.command)
        skipReasons.push(`command "${testCase.command}"`);
    if (testCase.checkLog || testCase.checkLogExcludes)
        skipReasons.push('log checks');
    if (testCase.checkSim)
        skipReasons.push('sim stream checks');
    if (testCase.isPackagedPost)
        skipReasons.push('packaged post');
    if (inputs.length === 1 && inputs[0] === null)
        skipReasons.push('no input');
    const relFile = toPosixRelative(project.root, entry.file);
    const jobs = [];
    const unitOrder = config.get('outputUnits') === 'IN' ? [0, 1] : [1, 0];
    for (const input of inputs) {
        for (const i of unitOrder) {
            if (!hasUnit && unitSetting !== 'both' && UNITS[i] !== unitSetting)
                continue;
            let suffix = typeof testCase.suffix === 'string' ? testCase.suffix : '';
            const props = { ...properties };
            if (hasUnit) {
                suffix += `_${UNITS[Number(properties.unit)] ?? properties.unit}`;
            }
            else {
                suffix += `_${UNITS[i]}`;
                props.unit = i;
            }
            const job = {
                id: [post.name, relFile, entry.index, caseIndex, input ?? '', suffix].join('::'),
                unitPairKey: hasUnit ? undefined : [post.name, relFile, entry.index, caseIndex, input ?? ''].join('::'),
                post: post.name,
                entryFile: entry.file,
                entryIndex: entry.index,
                caseIndex,
                description: testCase.description ?? '',
                input: input ?? '',
                suffix,
                unitLabel: hasUnit ? (UNITS[Number(properties.unit)] ?? String(properties.unit)) : UNITS[i],
                properties: props,
                caseKeys,
                machine,
                machineProperties,
                inputFolder: typeof testCase.inputFolder === 'string' ? testCase.inputFolder : '',
                outputFolder: typeof testCase.outputFolder === 'string' ? testCase.outputFolder
                    : typeof post.outputFolder === 'string' ? post.outputFolder : '',
                additionalFlags: typeof testCase.additionalFlags === 'string' ? testCase.additionalFlags : '',
                propertiesFile: typeof testCase.propertiesFile === 'string' ? testCase.propertiesFile : '',
                checkError: !!testCase.checkError,
                checkOutputContains: !!testCase.checkOutputContains,
                ignored: !!(testCase.ignored || post.ignored) || isPlatformIgnored(project, post.name, input),
                skipReason: skipReasons.join(', '),
            };
            job.signature = JSON.stringify([job.properties, job.machine, job.machineProperties, job.inputFolder, job.outputFolder, job.additionalFlags,
                job.propertiesFile, job.checkError, job.checkOutputContains, project.defaultFlags]);
            jobs.push(job);
            if (hasUnit)
                break;
        }
    }
    return jobs;
}
function isPlatformIgnored(project, postName, input) {
    return project.ignored.some(item => {
        if (!Array.isArray(item.platforms) || !item.platforms.includes(process.platform))
            return false;
        if (item.post !== postName)
            return false;
        if (!item.input)
            return true;
        return item.input === input || (Array.isArray(item.input) && item.input.includes(input));
    });
}
function getJobPaths(project, job) {
    const outFolder = job.outputFolder || job.inputFolder;
    const sub = job.checkError ? path.join(outFolder, job.post, 'error_messages') : path.join(outFolder, job.post);
    const fileName = `${job.post}_${job.input}${job.suffix}.output`;
    const outputRoot = path.join(project.root, 'output');
    const expectedRoot = path.join(project.root, 'expected');
    return {
        actual: resolveInside(outputRoot, path.join(sub, fileName)),
        expected: resolveInside(expectedRoot, path.join(sub, fileName)),
        cnc: resolveInside(path.join(project.root, 'cnc'), path.join(job.inputFolder, `${job.input}.cnc`)),
        machine: job.machine ? resolveInside(project.baseDir, job.machine) : undefined,
        propertiesFile: job.propertiesFile
            ? resolveInside(path.join(project.root, 'properties'), path.join(job.inputFolder, job.propertiesFile))
            : undefined,
    };
}
// ── Comparison (ports of run-tests.js compareFiles / checkContains) ─
function splitLines(text) {
    return text.match(/[^\r\n]+/g) ?? [];
}
function checkContains(actualText, expectedText) {
    const a = splitLines(actualText);
    const b = splitLines(expectedText);
    let i = 0;
    for (const line of b) {
        while (i < a.length && !a[i].includes(line))
            i++;
        if (i >= a.length)
            return false;
    }
    return true;
}
// ── Runner ──────────────────────────────────────────────────────
class QaTestRunner {
    constructor(context, engine) {
        this.context = context;
        this.engine = engine;
        this.project = undefined;
        /** Displayed posts: [{ name, cpsPath, state, cases: [{ entry, caseIndex, testCase, jobs }] }] */
        this.model = { posts: [], auto: true, label: '' };
        this.outsideRoot = undefined;
        this.results = new Map();
        this.running = false;
        this.problemsOnly = false;
        this.engineVersions = new Map();
        this.lastSummary = '';
        this._onDidChange = new vscode.EventEmitter();
        this.onDidChange = this._onDidChange.event;
        this._fireTimer = undefined;
        context.subscriptions.push(this._onDidChange);
    }
    get output() {
        if (!this._output) {
            this._output = vscode.window.createOutputChannel('QA test', 'qatest-log');
            this.context.subscriptions.push(this._output);
        }
        return this._output;
    }
    fireChanged(immediate = false) {
        if (immediate) {
            clearTimeout(this._fireTimer);
            this._fireTimer = undefined;
            this._onDidChange.fire();
            return;
        }
        if (this._fireTimer)
            return;
        this._fireTimer = setTimeout(() => {
            this._fireTimer = undefined;
            this._onDidChange.fire();
        }, 250);
    }
    // ── Model ───────────────────────────────────────────────────
    /** Loads the project for startPath (or keeps the current one) and builds the displayed model for the posts. */
    setPosts(cpsPaths, { auto = false, label = '', startPath, allowOutsideWorkspace = false } = {}) {
        const start = startPath ?? cpsPaths[0];
        const root = findProjectRoot(start, { allowOutsideWorkspace });
        this.project = root ? loadProject(root) : undefined;
        /** QA project above a post outside the open folder; only used after the user chose it, until the posts change. */
        this.outsideRoot = !root && isOutsideWorkspace(start) ? findProjectRoot(start, { allowOutsideWorkspace: true }) : undefined;
        this.model = { posts: [], auto, label, cpsPaths: [...cpsPaths], allowOutsideWorkspace };
        if (this.project)
            this.model.posts = cpsPaths.map(p => this.buildPostModel(p));
        this.fireChanged(true);
        return this.project;
    }
    /** Rebuild from disk after edits, keeping results (stale results are detected by job signature). */
    reload() {
        if (!this.model.cpsPaths) {
            this.fireChanged(true);
            return;
        }
        const root = this.project?.root ?? findProjectRoot(this.model.cpsPaths[0], { allowOutsideWorkspace: this.model.allowOutsideWorkspace });
        this.project = root ? loadProject(root) : undefined;
        if (this.project)
            this.model.posts = this.model.cpsPaths.map(p => this.buildPostModel(p));
        this.fireChanged(true);
    }
    buildPostModel(cpsPath) {
        const name = path.basename(cpsPath, path.extname(cpsPath));
        const postModel = { name, cpsPath, state: undefined, cases: [] };
        if (!(0, utils_1.fileExists)(cpsPath)) {
            postModel.state = STATUS.missingPost;
        }
        else if (!hasSupportedCapabilities(cpsPath)) {
            postModel.state = STATUS.unsupported;
        }
        const entries = getEntriesForPost(this.project, name);
        for (const entry of entries) {
            entry.def.testCases.forEach((testCase, caseIndex) => {
                postModel.cases.push({ entry, caseIndex, testCase, jobs: createJobs(this.project, entry, caseIndex) });
            });
        }
        if (!postModel.state && postModel.cases.length === 0)
            postModel.state = STATUS.noTestCases;
        return postModel;
    }
    findPostModel(cpsPathOrName) {
        return this.model.posts.find(p => p.cpsPath === cpsPathOrName || p.name === cpsPathOrName);
    }
    getJobStatus(job) {
        const result = this.results.get(job.id);
        if (result && (result.status === STATUS.running || result.status === STATUS.queued))
            return result.status;
        if (result && result.signature === job.signature && !result.postChanged)
            return result.status;
        if (result)
            return STATUS.stale;
        if (job.ignored)
            return STATUS.ignored;
        if (job.skipReason)
            return STATUS.skipped;
        return STATUS.notRun;
    }
    getResult(job) {
        return this.results.get(job.id);
    }
    /** Marks the second unit of a test as "same change" when its IN and MM outputs changed in the same way. */
    updateUnitPairs(ranJobs) {
        const ran = new Set(ranJobs.map(j => j.unitPairKey).filter(Boolean));
        const pairs = new Map();
        for (const job of this.allJobs()) {
            if (ran.has(job.unitPairKey))
                pairs.set(job.unitPairKey, [...(pairs.get(job.unitPairKey) ?? []), job]);
        }
        for (const jobs of pairs.values()) {
            const results = jobs.map(j => this.results.get(j.id));
            for (const r of results) {
                if (r) {
                    delete r.sameChangeAs;
                    delete r.sameChangeIn;
                    delete r.unitTwinId;
                }
            }
            if (jobs.length !== 2 || jobs.some(j => j.checkError || j.checkOutputContains || this.getJobStatus(j) !== STATUS.differs))
                continue;
            let same = false;
            try {
                const [a, b] = results.map(r => [fs.readFileSync(r.expected, 'utf8'), fs.readFileSync(r.actual, 'utf8')]);
                same = (0, qaUnitCompare_1.isSameChange)(a[0], a[1], b[0], b[1]);
            }
            catch { /* treat as different */ }
            if (!same)
                continue;
            results[0].unitTwinId = jobs[1].id;
            results[0].sameChangeIn = jobs[1].unitLabel;
            results[1].unitTwinId = jobs[0].id;
            results[1].sameChangeAs = jobs[0].unitLabel;
        }
    }
    /** Number of differing outputs that are the same change as their other unit. */
    countSameChange(jobs) {
        return jobs.filter(j => this.getJobStatus(j) === STATUS.differs && this.results.get(j.id)?.sameChangeAs).length;
    }
    /** Marks earlier results of a post as out of date after the post file was saved. */
    markPostChanged(cpsPath) {
        const postModel = this.model.posts.find(p => p.cpsPath === cpsPath);
        if (!postModel)
            return;
        for (const job of postModel.cases.flatMap(c => c.jobs)) {
            const r = this.results.get(job.id);
            if (r && r.status !== STATUS.running && r.status !== STATUS.queued)
                r.postChanged = true;
        }
        this.fireChanged(true);
    }
    isProblem(status) {
        return PROBLEM_STATUSES.has(status);
    }
    getCounts(jobs) {
        const counts = {};
        for (const job of jobs) {
            const s = this.getJobStatus(job);
            counts[s] = (counts[s] ?? 0) + 1;
        }
        return counts;
    }
    allJobs() {
        return this.model.posts.flatMap(p => p.cases.flatMap(c => c.jobs));
    }
    getSummaryText() {
        const jobs = this.allJobs();
        if (jobs.length === 0)
            return '';
        const c = this.getCounts(jobs);
        const parts = [];
        if (c.passed)
            parts.push(`${c.passed} passed`);
        const problems = [...PROBLEM_STATUSES].reduce((n, s) => n + (c[s] ?? 0), 0);
        if (problems)
            parts.push(`${problems} problems`);
        const pending = (c.notRun ?? 0) + (c.stale ?? 0);
        if (pending)
            parts.push(`${pending} not run`);
        if (c.running)
            parts.push(`${c.running} running`);
        if (c.queued)
            parts.push(`${c.queued} queued`);
        return parts.join(', ');
    }
    // ── Post engine ─────────────────────────────────────────────
    async resolvePostEngine() {
        const configured = config.get('qaPostEngine');
        if (typeof configured === 'string' && configured.trim()) {
            const p = configured.trim();
            if ((0, utils_1.fileExists)(p))
                return p;
            vscode.window.showErrorMessage(`QA post engine not found: ${p}. Clear "AutodeskPostUtility.qaPostEngine" to use the Fusion post engine.`);
            return undefined;
        }
        const libraryEngine = this.project
            ? path.join(this.project.baseDir, 'jenkins', 'packages', 'post', 'vc142', 'x64', process.platform === 'win32' ? 'post.exe' : 'post')
            : '';
        const askedKey = 'qaTest.libraryEngineAsked';
        if (libraryEngine && (0, utils_1.fileExists)(libraryEngine) && !this.context.globalState.get(askedKey)) {
            await this.context.globalState.update(askedKey, true);
            const choice = await vscode.window.showInformationMessage('This post library contains its own post engine, which was used to create its expected files. Use it for QA tests?', 'Use library engine', 'Use Fusion engine');
            if (choice === 'Use library engine') {
                await config.update('qaPostEngine', libraryEngine, true);
                return libraryEngine;
            }
        }
        let exe = this.engine.getPostExecutablePath();
        if (!(0, utils_1.fileExists)(exe)) {
            await this.engine.locatePostExe(true);
            exe = this.engine.getPostExecutablePath();
        }
        return (0, utils_1.fileExists)(exe) ? exe : undefined;
    }
    async getEngineVersion(exe) {
        if (this.engineVersions.has(exe))
            return this.engineVersions.get(exe);
        let version = '';
        try {
            const { stdout } = await (0, utils_1.execFileAsync)(exe, ['--version'], { timeout: 20000, windowsHide: true });
            version = (stdout || '').trim();
        }
        catch { /* unknown version */ }
        this.engineVersions.set(exe, version);
        return version;
    }
    /**
     * The job's machine properties that the post defines with machine scope, and the ones skipped with the reason.
     * Properties set by the test case are left out of both. Interrogation is cached per engine, post and post file time.
     */
    postPropertyDefsPromise(cpsPath, exe) {
        let mtime = 0;
        try {
            mtime = fs.statSync(cpsPath).mtimeMs;
        }
        catch { /* reported by the engine */ }
        const cacheKey = `${exe}|${cpsPath}`;
        this.postPropertyNamesCache = this.postPropertyNamesCache ?? new Map();
        let cached = this.postPropertyNamesCache.get(cacheKey);
        if (!cached || cached.mtime !== mtime) {
            cached = {
                mtime, defs: this.interrogate(cpsPath, exe).then(data => {
                    const defs = new Map();
                    for (const [key, prop] of Object.entries(data?.properties ?? {})) {
                        const own = typeof prop === 'object' && prop !== null ? prop : {};
                        const def = data.propertyDefinitions?.[key] ?? own;
                        defs.set(key, { ...def, scope: def.scope ?? own.scope });
                    }
                    return data ? defs : undefined;
                }),
            };
            this.postPropertyNamesCache.set(cacheKey, cached);
        }
        return cached.defs;
    }
    async machinePropertiesForPost(job, cpsPath, exe) {
        const machinePromise = readMachineProperties(this.project, job.machine).then(props => Object.fromEntries(Object.entries(props).filter(([key]) => !job.caseKeys.includes(key))));
        const [machine, defs] = await Promise.all([machinePromise, this.postPropertyDefsPromise(cpsPath, exe)]);
        if (!Object.keys(machine).length)
            return { applied: {}, skipped: [] };
        const applied = {};
        const skipped = [];
        for (const [key, value] of Object.entries(machine)) {
            const def = defs?.get(key);
            if (!defs)
                skipped.push(`${key} (post properties could not be read)`);
            else if (!def)
                skipped.push(`${key} (not in post)`);
            else if (!hasMachineScope(def))
                skipped.push(`${key} (scope: ${[].concat(def.scope ?? 'none').join(', ')})`);
            else
                applied[key] = value;
        }
        return { applied, skipped };
    }
    /** Reads the post's property definitions with the same engine the QA tests use. */
    async interrogate(cpsPath, exe) {
        exe = exe ?? await this.resolvePostEngine();
        if (!exe)
            return undefined;
        const tempFile = path.join(os.tmpdir(), `qa-interrogate-${process.pid}-${Date.now()}.json`);
        const args = ['--interrogate', '--quiet', cpsPath, tempFile];
        const packages = findPackagesDir(path.dirname(cpsPath));
        if (packages)
            args.push('--include', packages);
        try {
            await (0, utils_1.execFileAsync)(exe, args, { timeout: 60000, windowsHide: true });
            return JSON.parse(fs.readFileSync(tempFile, 'utf8'));
        }
        catch {
            return undefined;
        }
        finally {
            try {
                fs.unlinkSync(tempFile);
            }
            catch { /* not created */ }
        }
    }
    getBaselineVersionFile() {
        return this.project ? path.join(this.project.root, 'expected', '.engine-version') : undefined;
    }
    readBaselineVersion() {
        const file = this.getBaselineVersionFile();
        try {
            return file && (0, utils_1.fileExists)(file) ? fs.readFileSync(file, 'utf8').trim() : '';
        }
        catch {
            return '';
        }
    }
    async writeBaselineVersion() {
        if (this.getLibraryConfig())
            return;
        const file = this.getBaselineVersionFile();
        const exe = await this.resolvePostEngine();
        if (!file || !exe)
            return;
        const version = await this.getEngineVersion(exe);
        if (!version)
            return;
        (0, utils_1.ensureDir)(path.dirname(file));
        fs.writeFileSync(file, version + '\n', 'utf8');
    }
    // ── Running ─────────────────────────────────────────────────
    /**
     * filter: optional (job) => boolean to run only some jobs of the displayed model.
     * perUnit: post-library runs only; runs the output unit first and the other unit only when the first has no problems.
     */
    async run({ filter, title = 'Running QA tests', perUnit = false } = {}) {
        if (this.running) {
            vscode.window.showWarningMessage('QA tests are already running.');
            return;
        }
        if (!this.project) {
            const choice = await vscode.window.showWarningMessage('No QA project found (a folder containing "test_cases"). Create one?', 'Create QA project');
            if (choice)
                vscode.commands.executeCommand('autodesk.post.qaTest.createProject');
            return;
        }
        const lib = this.getLibraryConfig();
        const exe = lib ? await this.ensureLibraryEngine(lib) : await this.resolvePostEngine();
        if (!exe) {
            if (!lib)
                vscode.window.showErrorMessage('No post engine found. Install Fusion or set "AutodeskPostUtility.qaPostEngine".');
            return;
        }
        const project = this.project;
        const singlePost = this.model.posts.length === 1;
        const ignoreList = singlePost ? project.ignoreSingle : project.ignoreAll;
        const queue = [];
        for (const postModel of this.model.posts) {
            if (postModel.state)
                continue;
            const postIgnored = ignoreList.includes(postModel.name);
            for (const c of postModel.cases) {
                for (const job of c.jobs) {
                    if (filter && !filter(job))
                        continue;
                    queue.push({ job, cpsPath: postModel.cpsPath, postIgnored });
                }
            }
        }
        if (queue.length === 0) {
            vscode.window.showInformationMessage('No QA test jobs to run.');
            return;
        }
        for (const { job } of queue)
            this.results.set(job.id, { status: STATUS.queued, signature: job.signature });
        this.fireChanged(true);
        this.running = true;
        const version = await this.getEngineVersion(exe);
        const started = Date.now();
        this.output.clear();
        this.output.appendLine(`QA test run: ${this.model.label || this.model.posts.map(p => p.name).join(', ')}`);
        this.output.appendLine(`Project     : ${project.root}`);
        this.output.appendLine(`Post engine : ${exe}${version ? ` (${version})` : ''}`);
        if (lib)
            this.output.appendLine('Runner      : run-tests.js (Autodesk mode)');
        if (lib && perUnit)
            this.output.appendLine(`Units       : ${UNITS[firstUnitIndex()]} first, ${UNITS[1 - firstUnitIndex()]} only for posts without ${UNITS[firstUnitIndex()]} problems`);
        for (const err of project.errors)
            this.output.appendLine(`JSON error  : ${err}`);
        this.output.appendLine('');
        this.machineNotes = new Set();
        const parallelSetting = Number(config.get('qaParallel'));
        const parallel = Math.max(1, Math.min(32, parallelSetting > 0 ? parallelSetting : defaultParallel()));
        const packagesCache = new Map();
        const stopOnFailure = !!config.get('qaStopOnFailure');
        let stopped = false;
        let done = 0;
        if (lib) {
            try {
                stopped = await this.runQueueWithLibrary(lib, exe, queue, { title, parallel: parallelSetting > 0 ? parallel : undefined, stopOnFailure, singlePost, perUnit });
            }
            finally {
                this.finishRun(queue.map(q => q.job), singlePost ? ['ignore_single.json'] : ['ignore_all.json', 'ignore_single.json']);
            }
            await this.reportSummary(queue.map(q => q.job), started, version, stopped, { log: false });
            return;
        }
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title,
                cancellable: true,
            }, async (progress, token) => {
                const record = (item, result) => {
                    const { engineBusy, ...stored } = result;
                    this.results.set(item.job.id, stored);
                    if (this.isProblem(stored.status) || stored.status === STATUS.ignored || stored.status === STATUS.skipped)
                        this.logResult(item.job, stored);
                    if (stopOnFailure && this.isProblem(stored.status) && stored.status !== STATUS.missingExpected)
                        stopped = true;
                    this.fireChanged();
                };
                const runItems = async (items) => {
                    let next = 0;
                    const busy = new Map();
                    const worker = async () => {
                        while (next < items.length && !token.isCancellationRequested && !stopped) {
                            const item = items[next++];
                            this.results.set(item.job.id, { status: STATUS.running, signature: item.job.signature });
                            this.fireChanged();
                            const result = await this.runJob(project, exe, item, packagesCache);
                            done++;
                            progress.report({ message: `${done}/${queue.length} ${item.job.post}`, increment: 100 / queue.length });
                            if (result.engineBusy) {
                                busy.set(item, { result, retries: 0 });
                                this.results.set(item.job.id, { status: STATUS.queued, signature: item.job.signature });
                                this.fireChanged();
                                continue;
                            }
                            record(item, result);
                        }
                    };
                    await Promise.all(Array.from({ length: Math.min(parallel, items.length) }, worker));
                    for (let attempt = 1; attempt <= ENGINE_BUSY_RETRIES && busy.size > 0 && !token.isCancellationRequested && !stopped; attempt++) {
                        this.output.appendLine(`Post engine was busy for ${busy.size} ${busy.size === 1 ? 'test' : 'tests'}. Running ${busy.size === 1 ? 'it' : 'them'} again one at a time (${attempt}/${ENGINE_BUSY_RETRIES}) ...`);
                        for (const item of [...busy.keys()]) {
                            if (token.isCancellationRequested || stopped)
                                break;
                            this.results.set(item.job.id, { status: STATUS.running, signature: item.job.signature });
                            this.fireChanged();
                            progress.report({ message: `Retrying ${item.job.post}` });
                            const result = await this.runJob(project, exe, item, packagesCache);
                            if (result.engineBusy) {
                                busy.set(item, { result, retries: attempt });
                                this.results.set(item.job.id, { status: STATUS.queued, signature: item.job.signature });
                                this.fireChanged();
                                continue;
                            }
                            busy.delete(item);
                            record(item, result);
                        }
                    }
                    for (const [item, { result, retries }] of busy) {
                        const note = retries > 0
                            ? `Post engine was busy, still failing after ${retries} ${retries === 1 ? 'retry' : 'retries'} one at a time.`
                            : 'Post engine was busy, not retried because the run was stopped.';
                        record(item, { ...result, message: `${note}\n${result.message}` });
                    }
                };
                await runItems(queue);
            });
        }
        finally {
            this.finishRun(queue.map(q => q.job), [singlePost ? 'ignore_single.json' : 'ignore_all.json']);
        }
        await this.reportSummary(queue.map(q => q.job), started, version, stopped);
    }
    /**
     * Posts (cpsPath) whose items have problems. New outputs without expected file do not count, so a new test case
     * still gets both units, like run-tests.js --initialUnit.
     */
    postsWithProblems(items) {
        const posts = new Set();
        for (const item of items) {
            const status = this.results.get(item.job.id)?.status;
            if (this.isProblem(status) && status !== STATUS.missingExpected)
                posts.add(item.cpsPath);
        }
        return posts;
    }
    /** Removes results of jobs that did not finish, notes why jobs were ignored and updates the IN/MM pairs. */
    finishRun(jobs, ignoreFiles = []) {
        for (const job of jobs) {
            const status = this.results.get(job.id)?.status;
            if (status === STATUS.running || status === STATUS.queued)
                this.results.delete(job.id);
        }
        this.markIgnoredBy(jobs, ignoreFiles);
        this.running = false;
        this.updateUnitPairs(jobs);
        this.fireChanged(true);
    }
    markIgnoredBy(jobs, ignoreFiles) {
        const lists = { 'ignore_all.json': this.project?.ignoreAll ?? [], 'ignore_single.json': this.project?.ignoreSingle ?? [] };
        for (const job of jobs) {
            const result = this.results.get(job.id);
            if (result?.status !== STATUS.ignored)
                continue;
            result.ignoredBy = ignoreFiles.find(f => lists[f]?.includes(job.post)) ?? (job.ignored ? 'test case' : undefined);
        }
    }
    // ── Post-library run-tests.js ──────────────────────────────
    getLibraryConfig() {
        return qaLibrary.getLibraryConfig(this.project);
    }
    /** Returns the library engine if it matches packages.txt, or after the user chose to update or to run anyway. */
    async ensureLibraryEngine(lib) {
        for (;;) {
            const check = await qaLibrary.checkEngine(lib);
            if (check.ok)
                return lib.engine;
            const actions = ['Update engine'];
            if ((0, utils_1.fileExists)(lib.engine))
                actions.push('Run anyway');
            const choice = await vscode.window.showWarningMessage(check.problems.join(' '), ...actions);
            if (choice === 'Run anyway')
                return lib.engine;
            if (choice !== 'Update engine' || !(await this.updateLibraryEngine(lib)))
                return undefined;
        }
    }
    async updateLibraryEngine(lib) {
        this.output.show(true);
        this.output.appendLine(`Updating the library post engine (packages.py update) in ${lib.jenkins} ...`);
        const ok = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Updating the library post engine...', cancellable: true }, (_p, token) => qaLibrary.updateEngine(lib, text => this.output.append(text), token));
        this.output.appendLine(ok ? 'Post engine updated.' : 'Post engine update failed. See the messages above.');
        this.fireChanged(true);
        return ok;
    }
    /**
     * Common run-tests.js arguments, like run-single.bat / run-all.bat. Without parallel, run-tests.js uses one batch per CPU.
     * perUnit adds --initialUnit with the output unit, like the "Run Single per unit" task.
     */
    libraryArgs(lib, exe, { parallel, stopOnFailure, ignoreFiles, perUnit = false }) {
        const args = [`--postEngine=${exe}`, `--dataDir=${lib.root}`, `--ignore=${ignoreFiles.join(';')}`, '--stopOnErrorOnly'];
        if (perUnit)
            args.push(`--initialUnit=${UNITS[firstUnitIndex()]}`);
        if (parallel)
            args.push(`--parallel=${parallel}`);
        if (stopOnFailure)
            args.push('--stopOnFailure');
        if (lib.settingsFile)
            args.push(`--settings=${lib.settingsFile}`);
        return args;
    }
    /** Lookup from run-tests.js result ids to jobs. */
    jobsByLibraryKey(jobs) {
        const map = new Map();
        for (const job of jobs) {
            const key = qaLibrary.jobKey(job.post, job.input || job.description, job.suffix);
            map.set(key, [...(map.get(key) ?? []), job]);
        }
        return map;
    }
    /**
     * Runs one run-tests.js process and stores the reported results in ctx.reported.
     * Retries with --parallel=1 when the engine was busy, like merge_posts.py. Returns { unsupported }.
     */
    async runLibraryProcess(lib, args, jobsByKey, ctx, log) {
        const project = this.project;
        let unsupported = false;
        let runArgs = args;
        for (let attempt = 0; attempt < 3 && !ctx.token.isCancellationRequested; attempt++) {
            const { code, stderr } = await qaLibrary.runTests(lib, runArgs, line => {
                log(line);
                if (line.includes('MISMATCH DETECTED, TESTS STOPPED'))
                    ctx.stopped = true;
                if (line.includes('Post capabilities not supported'))
                    unsupported = true;
                const parsed = qaLibrary.parseResultLine(line);
                const jobs = parsed && jobsByKey.get(parsed.key);
                if (!jobs)
                    return;
                const mapped = qaLibrary.mapResult(parsed.status);
                for (const job of jobs) {
                    const paths = getJobPaths(project, job);
                    this.results.set(job.id, { status: mapped.status, message: mapped.message, signature: job.signature, finished: Date.now(), actual: paths.actual, expected: paths.expected });
                    ctx.reported.add(job);
                }
                ctx.progress.report({ message: ctx.expected ? `${ctx.reported.size}/${ctx.expected} ${jobs[0].post}` : `${ctx.reported.size} ${jobs[0].post}` });
                this.fireChanged();
            }, ctx.token);
            if (code === 0 || !ENGINE_BUSY.test(stderr))
                break;
            log(`Post engine was busy. Retrying with --parallel=1 (${attempt + 1}/2) ...`);
            runArgs = [...args.filter(a => !a.startsWith('--parallel=')), '--parallel=1'];
        }
        return { unsupported };
    }
    /** Runs one run-tests.js process with a progress notification. Returns { stopped, reported: Set of jobs, unsupported }. */
    async executeLibraryRun(lib, args, jobsByKey, expected, title) {
        const ctx = { reported: new Set(), stopped: false, expected };
        let unsupported = false;
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title, cancellable: true }, async (progress, token) => {
            Object.assign(ctx, { progress, token });
            ({ unsupported } = await this.runLibraryProcess(lib, args, jobsByKey, ctx, line => this.output.appendLine(line)));
        });
        return { stopped: ctx.stopped, reported: ctx.reported, unsupported };
    }
    /**
     * Runs the queue like merge_posts.py --mode QA: one run-tests.js per post, several posts at once.
     * run-tests.js splits its jobs into fixed chunks, so one process for many posts leaves most chunks idle.
     */
    async runQueueWithLibrary(lib, exe, queue, { title, parallel, stopOnFailure, singlePost, perUnit }) {
        const project = this.project;
        const ignoreNames = singlePost ? ['ignore_single.json'] : ['ignore_all.json', 'ignore_single.json'];
        const ignoreLists = { 'ignore_all.json': project.ignoreAll, 'ignore_single.json': project.ignoreSingle };
        const ignoreFiles = ignoreNames.map(f => path.join(lib.root, f));
        const byPost = new Map();
        for (const item of queue) {
            if (ignoreNames.some(f => ignoreLists[f].includes(item.job.post))) {
                this.results.set(item.job.id, { status: STATUS.ignored, signature: item.job.signature, finished: Date.now() });
                continue;
            }
            byPost.set(item.cpsPath, [...(byPost.get(item.cpsPath) ?? []), item.job]);
        }
        this.fireChanged(true);
        const posts = [...byPost.entries()];
        if (posts.length === 0)
            return false;
        const argsFor = (cpsPath, jobs, branches) => {
            const args = this.libraryArgs(lib, exe, { parallel: branches, stopOnFailure, ignoreFiles, perUnit });
            const dataFiles = [...project.globalFiles, ...new Set(jobs.map(j => j.entryFile))];
            args.push(...(dataFiles.some(f => f.includes('+')) ? [project.testCasesDir] : dataFiles));
            args.push(`--post=${cpsPath}`);
            const inputs = [...new Set(jobs.map(j => j.input))];
            if (inputs.length === 1 && inputs[0] && !inputs[0].includes(','))
                args.push(`--include=${jobs[0].post},${inputs[0]}`);
            return args;
        };
        const header = /^(Running post-processor regression tests|Post Engine:|Autodesk CAM Post Processor)/;
        const ctx = { reported: new Set(), stopped: false, expected: posts.reduce((n, [, jobs]) => n + jobs.length, 0) };
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title, cancellable: true }, async (progress, token) => {
            Object.assign(ctx, { progress, token });
            // One budget of post engines for all run-tests.js processes. Each post gets branches (--parallel) in
            // proportion to its share of the tests not started yet, so the last posts get the free engines.
            const budget = parallel ?? Math.max(1, os.cpus().length - 2);
            let remaining = ctx.expected;
            let free = budget;
            const waiting = [];
            const acquire = async (wanted) => {
                while (free < 1)
                    await new Promise(resolve => waiting.push(resolve));
                const granted = Math.min(wanted, free);
                free -= granted;
                return granted;
            };
            const release = (granted) => {
                free += granted;
                waiting.splice(0).forEach(resolve => resolve());
            };
            let next = 0;
            const worker = async () => {
                while (next < posts.length && !token.isCancellationRequested && !(stopOnFailure && ctx.stopped)) {
                    const [cpsPath, jobs] = posts[next++];
                    const wanted = Math.max(1, Math.min(jobs.length, budget, Math.round(jobs.length * budget / remaining)));
                    remaining -= jobs.length;
                    const branches = await acquire(wanted);
                    const lines = [];
                    const log = posts.length === 1 ? (line => this.output.appendLine(line)) : (line => lines.push(line));
                    let unsupported;
                    try {
                        ({ unsupported } = await this.runLibraryProcess(lib, argsFor(cpsPath, jobs, branches), this.jobsByLibraryKey(jobs), ctx, log));
                    }
                    finally {
                        release(branches);
                    }
                    const first = jobs.filter(isFirstUnit).map(job => ({ job, cpsPath }));
                    if (perUnit && this.postsWithProblems(first).size > 0) {
                        const skipped = jobs.filter(job => !isFirstUnit(job) && this.results.get(job.id)?.status === STATUS.queued);
                        for (const job of skipped)
                            this.results.set(job.id, { status: STATUS.notRun, signature: job.signature, message: secondUnitSkipMessage() });
                        if (skipped.length)
                            log(`${UNITS[1 - firstUnitIndex()]} tests not run because the ${UNITS[firstUnitIndex()]} outputs have problems.`);
                    }
                    if (lines.length) {
                        this.output.appendLine(`── ${path.basename(cpsPath, '.cps')} ──`);
                        lines.filter(l => l && !header.test(l)).forEach(l => this.output.appendLine(l));
                        this.output.appendLine('');
                    }
                    if (unsupported) {
                        for (const job of jobs) {
                            if (this.results.get(job.id)?.status === STATUS.queued)
                                this.results.set(job.id, { status: STATUS.unsupported, signature: job.signature, message: 'Post capabilities are not supported by run-tests.js.' });
                        }
                    }
                }
            };
            await Promise.all(Array.from({ length: Math.min(budget, posts.length) }, worker));
        });
        return ctx.stopped;
    }
    /** Runs the tests affected by the commits on this branch (run-tests.js --onlyChanged), like Jenkins. */
    async runBranchChanges(dstBranch) {
        const lib = this.getLibraryConfig();
        if (!lib || this.running)
            return;
        if (!qaLibrary.isValidBranchName(dstBranch)) {
            vscode.window.showErrorMessage(`Invalid branch name: ${dstBranch}`);
            return;
        }
        const exe = await this.ensureLibraryEngine(lib);
        if (!exe)
            return;
        const project = this.project;
        const allJobs = [];
        const cpsByPost = new Map();
        for (const entry of project.entries) {
            entry.def.testCases.forEach((_tc, caseIndex) => allJobs.push(...createJobs(project, entry, caseIndex)));
            cpsByPost.set(entry.name, path.join(project.baseDir, `${entry.name}.cps`));
        }
        const parallelSetting = Number(config.get('qaParallel'));
        const parallel = parallelSetting > 0 ? Math.min(32, parallelSetting) : Math.max(1, os.cpus().length - 2);
        const ignoreFiles = ['ignore_all.json', 'ignore_single.json'].map(f => path.join(lib.root, f));
        const args = [...this.libraryArgs(lib, exe, { parallel, stopOnFailure: !!config.get('qaStopOnFailure'), ignoreFiles }),
            '--onlyChanged', `--dstBranch=${dstBranch}`, `--postDir=${lib.baseDir}`, project.testCasesDir];
        const version = await this.getEngineVersion(exe);
        const started = Date.now();
        this.running = true;
        this.fireChanged(true);
        this.output.clear();
        this.output.appendLine(`QA test run: changes compared with origin/${dstBranch}`);
        this.output.appendLine(`Project     : ${project.root}`);
        this.output.appendLine(`Post engine : ${exe}${version ? ` (${version})` : ''}`);
        this.output.appendLine('Runner      : run-tests.js --onlyChanged (Autodesk mode)');
        this.output.appendLine('');
        this.output.show(true);
        let result;
        try {
            result = await this.executeLibraryRun(lib, args, this.jobsByLibraryKey(allJobs), 0, `QA test: changes compared with ${dstBranch}`);
        }
        finally {
            this.running = false;
        }
        const reportedJobs = [...result.reported];
        const posts = [...new Set(reportedJobs.map(j => cpsByPost.get(j.post)))].filter(p => p && (0, utils_1.fileExists)(p));
        if (posts.length === 0) {
            this.fireChanged(true);
            vscode.window.showInformationMessage(`No QA tests are affected by the changes compared with ${dstBranch}.`);
            return;
        }
        this.setPosts(posts, { auto: false, label: `changes vs ${dstBranch}`, startPath: project.root });
        this.markIgnoredBy(reportedJobs, ['ignore_all.json', 'ignore_single.json']);
        this.updateUnitPairs(this.allJobs());
        this.fireChanged(true);
        const reportedIds = new Set(reportedJobs.map(j => j.id));
        await this.reportSummary(this.allJobs().filter(j => reportedIds.has(j.id)), started, version, result.stopped, { log: false });
    }
    async runJob(project, exe, { job, cpsPath, postIgnored }, packagesCache = new Map()) {
        const base = { signature: job.signature, finished: Date.now() };
        if (job.ignored || postIgnored)
            return { ...base, status: STATUS.ignored };
        if (job.skipReason)
            return { ...base, status: STATUS.skipped, message: `Not supported in the extension: ${job.skipReason}` };
        const paths = getJobPaths(project, job);
        if (!paths.actual || !paths.expected || !paths.cnc)
            return { ...base, status: STATUS.failed, message: 'Input, output or expected path points outside the QA project.' };
        if (!(await pathExists(paths.cnc)))
            return { ...base, status: STATUS.missingInput, message: `CNC file not found: ${paths.cnc}` };
        if (job.machine && !paths.machine)
            return { ...base, status: STATUS.failed, message: `Machine path points outside ${project.baseDir}: ${job.machine}` };
        if (paths.machine && !(await pathExists(paths.machine)))
            return { ...base, status: STATUS.missingInput, message: `Machine file not found: ${paths.machine}` };
        const args = tokenizeFlags(project.defaultFlags);
        const postDir = path.dirname(cpsPath);
        if (!packagesCache.has(postDir)) {
            const found = findPackagesDir(postDir) ?? config.get('includePath');
            packagesCache.set(postDir, found && (await pathExists(found)) ? found : undefined);
        }
        const includePath = packagesCache.get(postDir);
        if (includePath)
            args.push('--include', includePath);
        if (paths.machine)
            args.push('--machine', paths.machine);
        if (paths.propertiesFile)
            args.push('--properties', paths.propertiesFile);
        const machineProps = await this.machinePropertiesForPost(job, cpsPath, exe);
        const properties = { ...job.properties, ...machineProps.applied };
        if (machineProps.skipped.length) {
            const note = `NOTE: Machine "${path.basename(job.machine)}": not applied to "${job.post}": ${machineProps.skipped.join(', ')}`;
            this.machineNotes = this.machineNotes ?? new Set();
            if (!this.machineNotes.has(note)) {
                this.machineNotes.add(note);
                this.output.appendLine(note);
            }
        }
        for (const [key, value] of Object.entries(properties))
            args.push('--property', key, formatPropertyValue(value));
        args.push(...tokenizeFlags(job.additionalFlags));
        args.push(cpsPath, paths.cnc, paths.actual);
        const commandLine = [exe, ...args].map(a => (/\s/.test(a) ? `"${a}"` : a)).join(' ');
        await fs.promises.mkdir(path.dirname(paths.actual), { recursive: true });
        await fs.promises.rm(paths.actual, { force: true }).catch(() => { });
        const timeout = Math.max(5, Number(config.get('qaTimeout')) || 120) * 1000;
        let engineError;
        try {
            await (0, utils_1.execFileAsync)(exe, args, { timeout, windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
        }
        catch (e) {
            engineError = e;
        }
        const withCmd = { ...base, commandLine, actual: paths.actual, expected: paths.expected };
        if (Object.keys(machineProps.applied).length)
            withCmd.machineProperties = Object.keys(machineProps.applied);
        if (machineProps.skipped.length)
            withCmd.machineSkipped = machineProps.skipped;
        if (job.checkError) {
            if (!engineError)
                return { ...withCmd, status: STATUS.differs, message: 'Post processing was expected to fail, but did not.' };
            await fs.promises.writeFile(paths.actual, engineError.stderr || engineError.message || '', 'utf8');
        }
        else if (engineError) {
            const detail = (engineError.stderr || engineError.stdout || engineError.message || '').trim();
            const engineBusy = !engineError.killed && ENGINE_BUSY.test(String(engineError.stderr ?? ''));
            return { ...withCmd, status: STATUS.failed, message: engineError.killed ? `Timed out after ${timeout / 1000}s` : detail.split(/\r?\n/).slice(-15).join('\n'), engineBusy };
        }
        const [actualSize, expectedSize] = await Promise.all([fileSize(paths.actual), fileSize(paths.expected)]);
        if (actualSize < 0)
            return { ...withCmd, status: STATUS.failed, message: 'The post engine did not create an output file.' };
        if (expectedSize < 0)
            return { ...withCmd, status: STATUS.missingExpected };
        const contains = job.checkError || job.checkOutputContains;
        if (!contains && actualSize !== expectedSize)
            return { ...withCmd, status: STATUS.differs };
        const [actualText, expectedText] = await Promise.all([fs.promises.readFile(paths.actual, 'utf8'), fs.promises.readFile(paths.expected, 'utf8')]);
        const ok = contains ? checkContains(actualText, expectedText) : actualText === expectedText;
        return { ...withCmd, status: ok ? STATUS.passed : STATUS.differs };
    }
    jobLabel(job) {
        return `${job.post}_${job.input}${job.suffix}`;
    }
    logResult(job, result) {
        const label = (STATUS_LABELS[result.status] ?? result.status).toUpperCase().padEnd(17);
        this.output.appendLine(`${label}: ${this.jobLabel(job)}${job.description ? `  (${job.description})` : ''}`);
        if (result.message)
            this.output.appendLine(result.message.split('\n').map(l => `    ${l}`).join('\n'));
        if (result.commandLine && (result.status === STATUS.failed || result.status === STATUS.differs))
            this.output.appendLine(`    ${result.commandLine}`);
    }
    async reportSummary(jobs, started, version, stopped, { log = true } = {}) {
        const counts = this.getCounts(jobs);
        for (const p of this.model.posts) {
            if (p.state)
                counts[p.state] = (counts[p.state] ?? 0) + 1;
        }
        const sameChangeCount = this.countSameChange(jobs);
        const problems = [...PROBLEM_STATUSES].filter(s => s !== STATUS.missingExpected).reduce((n, s) => n + (counts[s] ?? 0), 0);
        if (log) {
            this.output.appendLine('');
            this.output.appendLine(`${'Total results'.padEnd(17)}: ${jobs.length}`);
            for (const [status, label] of Object.entries(STATUS_LABELS)) {
                if (counts[status])
                    this.output.appendLine(`${label.padEnd(17)}: ${counts[status]}`);
            }
            if (sameChangeCount)
                this.output.appendLine(`${'  same IN and MM'.padEnd(17)}: ${sameChangeCount}`);
            const sec = (Date.now() - started) / 1000;
            const duration = `${Math.floor(sec / 60)}MIN ${Math.round(sec % 60)}SEC`;
            this.output.appendLine('');
            if (stopped)
                this.output.appendLine('#### MISMATCH DETECTED, TESTS STOPPED ####');
            this.output.appendLine(`${problems === 0 ? 'TESTS SUCCEED' : 'TESTS FAIL'} , RUNTIME(${duration})`);
        }
        else if (sameChangeCount) {
            this.output.appendLine(`Same change in IN and MM: ${sameChangeCount}`);
        }
        const baseline = this.getLibraryConfig() ? '' : this.readBaselineVersion();
        let versionWarning = '';
        if (baseline && version && baseline !== version) {
            versionWarning = ` Expected files were created with "${baseline}", current engine is "${version}".`;
            this.output.appendLine(`WARNING: engine version differs from baseline.${versionWarning}`);
        }
        const newCount = counts.missingExpected ?? 0;
        const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
        const details = [];
        const sameChange = this.countSameChange(jobs);
        if (counts.differs)
            details.push(plural(counts.differs, 'output differs', 'outputs differ') + (sameChange ? ` (${sameChange} of them the same change in IN and MM)` : ''));
        if (counts.failed)
            details.push(plural(counts.failed, 'run failed', 'runs failed'));
        if (counts.missingInput)
            details.push(plural(counts.missingInput, 'input file is missing', 'input files are missing'));
        if (counts.missingPost)
            details.push(plural(counts.missingPost, 'post file was not found', 'post files were not found'));
        if (newCount)
            details.push(`${plural(newCount, 'output has', 'outputs have')} no expected file yet`);
        let message;
        if (problems === 0 && newCount > 0) {
            message = `${stopped ? 'Stopped. ' : ''}QA tests: ${counts.passed ?? 0} passed, ${plural(newCount, 'new output has', 'new outputs have')} no expected file yet. Review them (click in the QA test view) or accept them all as the expected baseline.${versionWarning}`;
        }
        else {
            const head = problems === 0 ? `QA tests passed: ${counts.passed ?? 0} of ${jobs.length}` : `QA tests: ${counts.passed ?? 0} of ${jobs.length} passed`;
            message = `${stopped ? 'Stopped. ' : ''}${head}${details.length ? `. ${details.join(', ')}` : ''}.${versionWarning}`;
        }
        if (problems === 0 && newCount === 0 && !versionWarning && !stopped) {
            showTimedMessage(message, 5000);
            return;
        }
        const actions = ['Show output'];
        if (newCount)
            actions.push(`Accept ${newCount} new as expected`);
        const show = problems === 0 ? vscode.window.showInformationMessage : vscode.window.showWarningMessage;
        const choice = await show(message, ...actions);
        if (choice === 'Show output')
            this.output.show(true);
        else if (choice && choice.startsWith('Accept'))
            await this.acceptJobs(jobs.filter(j => this.getJobStatus(j) === STATUS.missingExpected), false);
    }
    // ── Expected files ──────────────────────────────────────────
    async acceptJobs(jobs, confirm = true) {
        const byId = new Map(this.allJobs().map(j => [j.id, j]));
        const withTwins = new Set(jobs);
        for (const job of jobs) {
            const twin = byId.get(this.results.get(job.id)?.unitTwinId);
            if (twin && this.results.get(twin.id)?.unitTwinId === job.id)
                withTwins.add(twin);
        }
        jobs = [...withTwins];
        const accepted = jobs.filter(j => {
            const r = this.getResult(j);
            return r && r.actual && r.expected && (0, utils_1.fileExists)(r.actual)
                && (r.status === STATUS.differs || r.status === STATUS.missingExpected);
        });
        if (accepted.length === 0) {
            vscode.window.showInformationMessage('Nothing to accept. Only differing or new outputs from the last run can be accepted.');
            return;
        }
        if (confirm) {
            const overwrite = accepted.filter(j => this.getResult(j).status === STATUS.differs).length;
            const detail = overwrite ? `${overwrite} existing expected file(s) will be overwritten.` : undefined;
            const choice = await vscode.window.showWarningMessage(`Accept ${accepted.length} output file(s) as expected?`, { modal: true, detail }, 'Accept');
            if (choice !== 'Accept')
                return;
        }
        for (const job of accepted) {
            const r = this.getResult(job);
            (0, utils_1.ensureDir)(path.dirname(r.expected));
            fs.copyFileSync(r.actual, r.expected);
            this.results.set(job.id, { ...r, status: STATUS.passed, postChanged: false });
        }
        await this.writeBaselineVersion();
        this.fireChanged(true);
        vscode.window.setStatusBarMessage(`Accepted ${accepted.length} QA output file(s) as expected`, 5000);
    }
    deleteExpectedFiles(jobs) {
        let count = 0;
        for (const job of jobs) {
            const { expected } = getJobPaths(this.project, job);
            if (expected && (0, utils_1.fileExists)(expected)) {
                fs.unlinkSync(expected);
                count++;
            }
            this.results.delete(job.id);
        }
        return count;
    }
}
exports.QaTestRunner = QaTestRunner;
