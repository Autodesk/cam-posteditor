"use strict";
// Post-library runs: uses the library's own tests/run-tests.js and checks the post engine pinned in jenkins/packages.txt.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLibraryConfig = getLibraryConfig;
exports.checkEngine = checkEngine;
exports.updateEngine = updateEngine;
exports.runTests = runTests;
exports.parseResultLine = parseResultLine;
exports.jobKey = jobKey;
exports.mapResult = mapResult;
exports.getChangedPosts = getChangedPosts;
exports.getDefaultBranch = getDefaultBranch;
exports.isValidBranchName = isValidBranchName;
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const crypto = require("crypto");
const utils_1 = require("./utils");
function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    catch {
        return undefined;
    }
}
function personalSettingsFile() {
    return process.env.APPDATA ? path.join(process.env.APPDATA, 'PostTestingSystem', 'settings.json') : undefined;
}
/** Returns the library configuration if the QA project is a post-library tests folder that uses run-tests.js. */
function getLibraryConfig(project) {
    if (!project)
        return undefined;
    const runTestsJs = path.join(project.root, 'run-tests.js');
    if (!(0, utils_1.fileExists)(runTestsJs))
        return undefined;
    const personal = personalSettingsFile();
    const personalData = personal && (0, utils_1.fileExists)(personal) ? readJson(personal) : undefined;
    const libraryData = readJson(path.join(project.root, 'settings.json'));
    const environment = typeof personalData?.environment === 'string' ? personalData.environment : libraryData?.environment;
    if (typeof environment !== 'string' || environment.toLowerCase() !== 'autodesk')
        return undefined;
    const jenkins = path.join(project.baseDir, 'jenkins');
    return {
        root: project.root,
        baseDir: project.baseDir,
        runTestsJs,
        jenkins,
        settingsFile: Array.isArray(personalData?.externalDiffTools) ? personal : undefined,
        engine: findLibraryEngine(jenkins),
    };
}
function findLibraryEngine(jenkins) {
    const name = process.platform === 'win32' ? 'post.exe' : 'post';
    const preferred = path.join(jenkins, 'packages', 'post', 'vc142', 'x64', name);
    if ((0, utils_1.fileExists)(preferred))
        return preferred;
    const walk = (dir, depth) => {
        let entries = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        }
        catch {
            return undefined;
        }
        for (const e of entries) {
            const full = path.join(dir, e.name);
            if (e.isFile() && e.name === name)
                return full;
            if (e.isDirectory() && depth > 0) {
                const found = walk(full, depth - 1);
                if (found)
                    return found;
            }
        }
        return undefined;
    };
    return walk(path.join(jenkins, 'packages', 'post'), 4) ?? preferred;
}
// ── Post engine pinned in packages.txt ──────────────────────────
function readPinnedPackage(jenkins) {
    let text;
    try {
        text = fs.readFileSync(path.join(jenkins, 'packages.txt'), 'utf8');
    }
    catch {
        return undefined;
    }
    const osName = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'osx' : 'linux';
    for (const line of text.split(/\r?\n/)) {
        const m = /^PACKAGE\s+(post\/post-[^\s]+\.zip)\s*(.*)$/.exec(line.trim());
        if (!m)
            continue;
        const attrs = Object.fromEntries(m[2].split(/\s+/).filter(Boolean).map(a => a.split('=')).map(([k, ...v]) => [k, v.join('=')]));
        if (attrs.OS !== osName)
            continue;
        const version = /-v(\d+(?:\.\d+)+)_/.exec(m[1])?.[1];
        return { name: m[1], version, digest: attrs.DIGEST };
    }
    return undefined;
}
function mtime(file) {
    try {
        return fs.statSync(file).mtimeMs;
    }
    catch {
        return 0;
    }
}
function sha256(file) {
    return new Promise(resolve => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(file);
        stream.on('error', () => resolve(undefined));
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
    });
}
const engineCheckCache = new Map();
/**
 * Checks that the library post engine is the one pinned in packages.txt: same version, and the downloaded
 * package has the pinned SHA-256 digest. Works offline.
 */
async function checkEngine(lib) {
    const pinned = readPinnedPackage(lib.jenkins);
    const zip = pinned ? path.join(lib.jenkins, 'packages', 'downloads', pinned.name) : '';
    const key = [lib.engine, mtime(lib.engine), mtime(path.join(lib.jenkins, 'packages.txt')), zip, mtime(zip)].join('|');
    if (engineCheckCache.has(key))
        return engineCheckCache.get(key);
    const result = { ok: false, required: pinned?.version, installed: undefined, problems: [] };
    if (!pinned) {
        result.problems.push('jenkins/packages.txt has no post engine package for this platform.');
    }
    else if (!(0, utils_1.fileExists)(lib.engine)) {
        result.problems.push('The library post engine is not installed.');
    }
    else {
        try {
            const { stdout } = await (0, utils_1.execFileAsync)(lib.engine, ['--version'], { timeout: 20000, windowsHide: true });
            result.installed = stdout.trim().split(/\s+/).pop();
        }
        catch { /* reported below */ }
        if (result.installed !== pinned.version)
            result.problems.push(`The library post engine is ${result.installed ?? 'unknown'}, packages.txt requires ${pinned.version}.`);
        if (pinned.digest?.startsWith('sha256:')) {
            const actual = (0, utils_1.fileExists)(zip) ? await sha256(zip) : undefined;
            if (!actual)
                result.problems.push(`The pinned package ${path.basename(pinned.name)} was not downloaded.`);
            else if (`sha256:${actual}` !== pinned.digest)
                result.problems.push(`The downloaded package ${path.basename(pinned.name)} does not match the digest in packages.txt.`);
        }
    }
    result.ok = result.problems.length === 0;
    engineCheckCache.set(key, result);
    return result;
}
/** Runs "packages.py update ." in the jenkins folder, like run-single.bat. */
async function updateEngine(lib, log, token) {
    const candidates = process.platform === 'win32'
        ? [['py', ['-3', '-E', 'packages.py', 'update', '.']], ['python', ['packages.py', 'update', '.']]]
        : [['python3', ['packages.py', 'update', '.']]];
    for (const [exe, args] of candidates) {
        const code = await new Promise(resolve => {
            const child = cp.spawn(exe, args, { cwd: lib.jenkins, windowsHide: true });
            token?.onCancellationRequested(() => child.kill());
            child.stdout.on('data', d => log(d.toString()));
            child.stderr.on('data', d => log(d.toString()));
            child.on('error', () => resolve('missing'));
            child.on('close', c => resolve(c));
        });
        if (code !== 'missing')
            return code === 0;
    }
    log('Python was not found. Install Python 3 to update the post engine.\n');
    return false;
}
// ── run-tests.js ────────────────────────────────────────────────
/** Same id as run-tests.js reportResult: [post,input,suffix] or [post,description,suffix] without input. */
function jobKey(post, inputOrDescription, suffix) {
    return `[${[post, inputOrDescription, ...(suffix ? [suffix] : [])].join(',')}]`;
}
function parseResultLine(line) {
    // eslint-disable-next-line no-control-regex
    const m = /^([A-Z][A-Z ]*?)\s*: (\[.*\])\s*$/.exec(line.replace(/\x1b\[[0-9;]*m/g, ''));
    return m ? { status: m[1], key: m[2] } : undefined;
}
/** Maps a run-tests.js result name to the view's status. */
function mapResult(name) {
    switch (name) {
        case 'SUCCESS':
        case 'RECREATED':
            return { status: 'passed' };
        case 'OUTPUT DIFFERS':
            return { status: 'differs' };
        case 'MISSING INPUT':
            return { status: 'missingInput', message: 'Input file not found.' };
        case 'MISSING POST':
            return { status: 'missingPost' };
        case 'IGNORED':
            return { status: 'ignored' };
        case 'UNSUPPORTED':
            return { status: 'unsupported' };
        case 'INITIALIZED':
        case 'INITIALIZED SIM':
            return { status: 'missingExpected', message: 'New test: run-tests.js created the expected file from this output. Review it, then accept it.' };
        default:
            return { status: 'failed', message: `run-tests.js: ${name.charAt(0)}${name.slice(1).toLowerCase()}. See the QA test log for details.` };
    }
}
/**
 * Runs run-tests.js with VS Code's own Node runtime. args are passed without a shell.
 * onLine is called for every stdout line. Resolves with { code, stderr }.
 */
function runTests(lib, args, onLine, token) {
    return new Promise(resolve => {
        const child = cp.spawn(process.execPath, [lib.runTestsJs, ...args], {
            cwd: lib.root,
            env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', NODE_NO_WARNINGS: '1' },
            windowsHide: true,
        });
        token?.onCancellationRequested(() => child.kill());
        let stderr = '';
        let buffer = '';
        child.stdout.on('data', d => {
            buffer += d.toString();
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop();
            lines.forEach(onLine);
        });
        child.stderr.on('data', d => {
            stderr += d.toString();
            onLine(d.toString().trimEnd());
        });
        child.on('error', e => resolve({ code: -1, stderr: e.message }));
        child.on('close', code => {
            if (buffer)
                onLine(buffer);
            resolve({ code, stderr });
        });
    });
}
// ── Git ─────────────────────────────────────────────────────────
async function git(cwd, args) {
    const { stdout } = await (0, utils_1.execFileAsync)('git', args, { cwd, windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
    return stdout;
}
const lines = (text) => text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
/**
 * Posts with staged or unstaged changes, like the "Run against all changed files" task (merge_posts.py --mode QA):
 * only posts directly in the post folder, without deleted posts and posts listed in ignore_all.json.
 */
async function getChangedPosts(postDir, ignoreAll) {
    const top = (await git(postDir, ['rev-parse', '--show-toplevel'])).trim();
    const [unstaged, staged, deleted, deletedStaged] = await Promise.all([
        git(top, ['diff', '--name-only', '--', '*.cps']),
        git(top, ['diff', '--name-only', '--cached', '--', '*.cps']),
        git(top, ['diff', '--name-only', '--diff-filter=D']),
        git(top, ['diff', '--name-only', '--diff-filter=D', '--cached']),
    ]);
    const removed = new Set([...lines(deleted), ...lines(deletedStaged)]);
    const posts = new Set();
    for (const rel of [...lines(unstaged), ...lines(staged)]) {
        const full = path.resolve(top, rel);
        if (removed.has(rel) || path.dirname(full).toLowerCase() !== path.resolve(postDir).toLowerCase() || !(0, utils_1.fileExists)(full))
            continue;
        if (ignoreAll.includes(path.basename(full, '.cps')))
            continue;
        posts.add(full);
    }
    return [...posts];
}
async function getDefaultBranch(cwd) {
    try {
        const ref = (await git(cwd, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'])).trim();
        return ref.replace(/^origin\//, '') || undefined;
    }
    catch {
        return undefined;
    }
}
/** run-tests.js passes the branch name to a shell command, so only plain branch names are allowed. */
function isValidBranchName(name) {
    return typeof name === 'string' && /^[A-Za-z0-9._/-]+$/.test(name) && !name.startsWith('-') && !name.includes('..');
}
