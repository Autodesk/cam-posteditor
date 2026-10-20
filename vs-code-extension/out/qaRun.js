"use strict";
// Copyright (c) 2020-2026 by Autodesk, Inc.
// Licensed under MIT. See LICENSE file in the project root.
//
// Runs the QA tests from a terminal (no VS Code window), for scripts and AI tools.
// Writes <QA project>/output/qa-report.md and qa-report.json. Never accepts outputs.
//
//   node qaRun.js [<QA project folder | folder with posts | post.cps>] [--units both|MM|IN]
//                 [--engine <post engine>] [--parallel N] [--timeout seconds] [--settings <VS Code settings.json>]
//
// Exit code: 0 all passed, 1 problems or new outputs to review, 2 setup error.
Object.defineProperty(exports, "__esModule", { value: true });
const Module = require("module");
const fs = require("fs");
const os = require("os");
const path = require("path");
const USAGE = `Usage: node qaRun.js [<QA project folder | folder with posts | post.cps>] [options]

Runs the QA tests and writes <QA project>/output/qa-report.md and qa-report.json.
Without a path, the current folder is used.

Options:
  --units both|MM|IN       Units to test (default: VS Code setting, else both)
  --engine <file>          Post engine (default: VS Code settings, else none)
  --parallel <n>           Tests run at the same time (default: automatic)
  --timeout <seconds>      Time limit for one post processing run
  --settings <file>        VS Code settings.json to read (default: your VS Code user settings)

Exit code: 0 all passed, 1 problems or new outputs to review, 2 setup error.`;
const SECTION = 'AutodeskPostUtility';
const STATUS_LABELS = {
    passed: 'Success',
    differs: 'Output differs',
    failed: 'Failure',
    missingInput: 'Missing input',
    missingExpected: 'New (no expected file)',
    missingPost: 'Missing post',
    ignored: 'Ignored',
    skipped: 'Skipped',
    unsupported: 'Unsupported',
    noTestCases: 'No test cases',
    notRun: 'Not run',
    stale: 'Not run',
};
function fail(message) {
    process.stderr.write(`qaRun: ${message}\n`);
    process.exit(2);
}
function parseArgs(argv) {
    const options = { target: undefined };
    const valueOptions = new Set(['--units', '--engine', '--parallel', '--timeout', '--settings']);
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            process.stdout.write(`${USAGE}\n`);
            process.exit(0);
        }
        if (valueOptions.has(arg)) {
            if (i + 1 >= argv.length)
                fail(`${arg} needs a value.`);
            options[arg.slice(2)] = argv[++i];
        }
        else if (arg.startsWith('--')) {
            fail(`Unknown option ${arg}. Use --help.`);
        }
        else if (options.target === undefined) {
            options.target = arg;
        }
        else {
            fail('Only one path can be given.');
        }
    }
    if (options.units !== undefined && !['both', 'MM', 'IN'].includes(options.units))
        fail('--units must be both, MM or IN.');
    for (const key of ['parallel', 'timeout']) {
        if (options[key] !== undefined && !(Number.isInteger(Number(options[key])) && Number(options[key]) > 0))
            fail(`--${key} must be a positive whole number.`);
    }
    return options;
}
function defaultSettingsFile() {
    if (process.platform === 'win32')
        return path.join(process.env.APPDATA ?? '', 'Code', 'User', 'settings.json');
    if (process.platform === 'darwin')
        return path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User', 'settings.json');
    return path.join(os.homedir(), '.config', 'Code', 'User', 'settings.json');
}
/** settings.json allows comments and trailing commas. */
function parseJsonc(text) {
    let out = '';
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            const start = i;
            for (i++; i < text.length && text[i] !== '"'; i++) {
                if (text[i] === '\\')
                    i++;
            }
            out += text.slice(start, i + 1);
        }
        else if (c === '/' && text[i + 1] === '/') {
            while (i < text.length && text[i] !== '\n')
                i++;
            out += '\n';
        }
        else if (c === '/' && text[i + 1] === '*') {
            i = text.indexOf('*/', i + 2);
            if (i < 0)
                break;
            i++;
        }
        else {
            out += c;
        }
    }
    return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}
function loadSettings(file, required) {
    if (!fs.existsSync(file)) {
        if (required)
            fail(`Settings file not found: ${file}`);
        return {};
    }
    try {
        const all = parseJsonc(fs.readFileSync(file, 'utf8'));
        const settings = {};
        for (const [key, value] of Object.entries(all ?? {})) {
            if (key.startsWith(`${SECTION}.`))
                settings[key.slice(SECTION.length + 1)] = value;
        }
        return settings;
    }
    catch (e) {
        if (required)
            fail(`Cannot read ${file}: ${e.message}`);
        process.stderr.write(`qaRun: ignoring unreadable settings ${file}: ${e.message}\n`);
        return {};
    }
}
/** Just enough of the VS Code API for the QA runner: no dialogs, log to stdout. */
function createVscodeStub(settings, messages) {
    const event = () => ({ dispose() { } });
    const record = kind => async (message) => {
        messages.push({ kind, message });
        return undefined;
    };
    return {
        EventEmitter: class {
            constructor() { this.event = event; }
            fire() { }
            dispose() { }
        },
        ProgressLocation: { SourceControl: 1, Window: 10, Notification: 15 },
        ThemeColor: class { constructor(id) { this.id = id; } },
        ThemeIcon: class { constructor(id, color) { this.id = id; this.color = color; } },
        Uri: { file: p => ({ fsPath: p, path: p, scheme: 'file' }) },
        workspace: {
            workspaceFolders: undefined,
            getConfiguration: () => ({
                get: (key, fallback) => (key in settings ? settings[key] : fallback),
                update: async (key, value) => { settings[key] = value; },
            }),
        },
        window: {
            createOutputChannel: () => ({
                append: text => process.stdout.write(text),
                appendLine: line => process.stdout.write(`${line}\n`),
                clear() { },
                show() { },
                dispose() { },
            }),
            // Popups that only close after a delay (not cancellable) are skipped; test runs are cancellable.
            withProgress: (options, task) => (options?.cancellable
                ? task({ report() { } }, { isCancellationRequested: false, onCancellationRequested: event })
                : Promise.resolve()),
            showInformationMessage: record('info'),
            showWarningMessage: record('warning'),
            showErrorMessage: record('error'),
            setStatusBarMessage: () => ({ dispose() { } }),
        },
        commands: { executeCommand: async () => undefined },
    };
}
const SUMMARY_LABELS = {
    differs: 'differ',
    failed: 'failed',
    missingInput: 'missing input',
    missingExpected: 'new (no expected file)',
    missingPost: 'missing post',
    ignored: 'ignored',
    skipped: 'skipped',
    unsupported: 'unsupported',
    notRun: 'not run',
    stale: 'not run',
};
function relative(from, file) {
    return file ? path.relative(from, file) || file : '';
}
function writeReports(runner, { exe, version, started, target }) {
    const project = runner.project;
    const jobs = runner.allJobs();
    const counts = runner.getCounts(jobs);
    const sameChange = runner.countSameChange(jobs);
    const byId = new Map(jobs.map(j => [j.id, j]));
    const jobRows = jobs.map(job => {
        const status = runner.getJobStatus(job);
        const result = runner.getResult(job) ?? {};
        const twin = status === 'differs' ? byId.get(result.unitTwinId) : undefined;
        return {
            id: job.id,
            post: job.post,
            testCase: job.description || '',
            input: job.input ?? '',
            suffix: job.suffix,
            unit: job.unitLabel ?? '',
            status,
            message: result.message ?? '',
            actual: result.actual ?? '',
            expected: result.expected ?? '',
            sameChangeAs: twin && result.sameChangeAs ? twin.id : '',
            sameChangeIn: twin && result.sameChangeIn ? twin.id : '',
            twinLabel: twin ? `${twin.post} | ${twin.input ?? ''}${twin.suffix}` : '',
            commandLine: result.commandLine ?? '',
            machineProperties: result.machineProperties ?? [],
            machineSkipped: result.machineSkipped ?? [],
            machine: job.machine ?? '',
        };
    });
    const posts = runner.model.posts.map(p => {
        const postJobs = p.cases.flatMap(c => c.jobs);
        const postCounts = runner.getCounts(postJobs);
        return { name: p.name, cpsPath: p.cpsPath, state: p.state ?? '', total: postJobs.length, passed: postCounts.passed ?? 0 };
    });
    const problemRows = jobRows.filter(r => runner.isProblem(r.status));
    const machineNotes = [...new Set(jobRows.filter(r => r.machineSkipped.length)
        .map(r => `Machine "${path.basename(r.machine)}": not applied to "${r.post}": ${r.machineSkipped.join(', ')}`))];
    const postProblems = posts.filter(p => p.state === 'missingPost');
    const exitCode = problemRows.length || postProblems.length ? 1 : 0;
    const seconds = Math.round((Date.now() - started) / 1000);
    const summaryParts = [`${counts.passed ?? 0} of ${jobs.length} passed`];
    for (const [status, label] of Object.entries(SUMMARY_LABELS)) {
        if (counts[status])
            summaryParts.push(`${counts[status]} ${label}`);
    }
    if (sameChange)
        summaryParts.push(`${sameChange} same change in IN and MM`);
    const summary = summaryParts.join(', ');
    const outDir = path.join(project.root, 'output');
    fs.mkdirSync(outDir, { recursive: true });
    const json = {
        result: exitCode === 0 ? 'passed' : 'problems',
        date: new Date().toISOString(),
        durationSeconds: seconds,
        target,
        project: project.root,
        postEngine: exe,
        postEngineVersion: version,
        summary,
        counts,
        sameChangeInAndMm: sameChange,
        posts,
        problems: problemRows,
        machineNotes,
        jobs: jobRows,
    };
    const jsonFile = path.join(outDir, 'qa-report.json');
    fs.writeFileSync(jsonFile, `${JSON.stringify(json, null, 2)}\n`);
    const md = [];
    md.push('# QA test report', '');
    md.push(`- Result: **${exitCode === 0 ? 'all passed' : 'problems found'}**`);
    md.push(`- Summary: ${summary}`);
    md.push(`- Date: ${new Date().toLocaleString()} (${seconds} s)`);
    md.push(`- Project: \`${project.root}\``);
    md.push(`- Post engine: \`${exe}\`${version ? ` (${version})` : ''}`);
    md.push(`- Details for every test: \`${jsonFile}\``, '');
    if (postProblems.length) {
        md.push('## Missing posts', '');
        for (const p of postProblems)
            md.push(`- ${p.name}: \`${p.cpsPath}\` not found`);
        md.push('');
    }
    md.push('## Problems', '');
    if (problemRows.length === 0)
        md.push('None.');
    for (const r of problemRows) {
        md.push(`### ${(STATUS_LABELS[r.status] ?? r.status).toUpperCase()}: ${r.post} | ${r.input}${r.suffix}`);
        if (r.testCase)
            md.push(`- Test case: ${r.testCase}`);
        if (r.unit)
            md.push(`- Unit: ${r.unit}`);
        if (r.sameChangeAs)
            md.push(`- Same change as ${r.twinLabel} (one review covers both)`);
        else if (r.sameChangeIn)
            md.push(`- ${r.twinLabel} changed the same way`);
        if (r.actual)
            md.push(`- Actual: \`${r.actual}\``);
        if (r.expected && r.status !== 'failed')
            md.push(`- Expected: \`${r.expected}\``);
        if (r.message)
            md.push('- Message:', '', '```text', r.message, '```');
        if (r.machineProperties.length)
            md.push(`- From machine: ${r.machineProperties.join(', ')}`);
        if (r.machineSkipped.length)
            md.push(`- Machine properties not applied: ${r.machineSkipped.join(', ')}`);
        if (r.commandLine)
            md.push('- Command:', '', '```text', r.commandLine, '```');
        md.push('');
    }
    if (machineNotes.length) {
        md.push('## Notes', '');
        for (const note of machineNotes)
            md.push(`- ${note}`);
        md.push('');
    }
    md.push('## Posts', '');
    for (const p of posts)
        md.push(`- ${p.name}: ${p.state ? STATUS_LABELS[p.state] ?? p.state : `${p.passed}/${p.total} passed`}`);
    md.push('');
    const mdFile = path.join(outDir, 'qa-report.md');
    fs.writeFileSync(mdFile, md.join('\n'));
    process.stdout.write(`\nQA test report: ${relative(process.cwd(), mdFile)}\nResult: ${summary}\n`);
    return exitCode;
}
async function main() {
    const options = parseArgs(process.argv.slice(2));
    const settingsFile = options.settings ? path.resolve(options.settings) : defaultSettingsFile();
    const settings = loadSettings(settingsFile, !!options.settings);
    // The given path decides the QA project, not the view's project folder setting.
    settings.qaProjectFolder = '';
    if (options.units)
        settings.qaUnits = options.units;
    if (options.parallel)
        settings.qaParallel = Number(options.parallel);
    if (options.timeout)
        settings.qaTimeout = Number(options.timeout);
    if (options.engine)
        settings.qaPostEngine = path.resolve(options.engine);
    const messages = [];
    const vscode = createVscodeStub(settings, messages);
    const load = Module._load;
    Module._load = function (request, ...rest) {
        return request === 'vscode' ? vscode : load.call(this, request, ...rest);
    };
    const qa = require("./qaTestRunner");
    const target = path.resolve(options.target ?? process.cwd());
    let stat;
    try {
        stat = fs.statSync(target);
    }
    catch {
        fail(`Path not found: ${target}`);
    }
    if (stat.isFile() && path.extname(target).toLowerCase() !== '.cps')
        fail(`Not a post (.cps) file: ${target}`);
    const root = qa.findProjectRoot(target);
    if (!root)
        fail(`No QA project found for ${target} (a folder containing "test_cases", or a "tests" folder with one).`);
    const project = qa.loadProject(root);
    let posts;
    if (stat.isFile()) {
        posts = [target];
    }
    else if (target === root || target === project.baseDir) {
        const names = [...new Set(project.entries.map(e => e.name))].sort((a, b) => a.localeCompare(b));
        posts = names.map(n => path.join(project.baseDir, `${n}.cps`));
    }
    else {
        const tested = new Set(project.entries.map(e => e.name.toLowerCase()));
        posts = qa.listPostsInFolder(target, false).filter(p => tested.has(path.basename(p, '.cps').toLowerCase()));
    }
    if (posts.length === 0)
        fail(`No posts with test cases found in ${target}.`);
    const context = {
        subscriptions: [],
        globalState: { get: () => true, update: async () => undefined },
        workspaceState: { get: () => undefined, update: async () => undefined },
    };
    const engine = {
        getPostExecutablePath: () => (typeof settings.postExecutablePath === 'string' ? settings.postExecutablePath : ''),
        locatePostExe: async () => undefined,
    };
    const runner = new qa.QaTestRunner(context, engine);
    // Always the built-in runner, also inside a post-library.
    runner.getLibraryConfig = () => undefined;
    runner.setPosts(posts, { auto: false, label: path.basename(target), startPath: target });
    const exe = await runner.resolvePostEngine();
    if (!exe)
        fail('No post engine found. Use --engine <post.exe>, or set "AutodeskPostUtility.qaPostEngine" or "AutodeskPostUtility.postExecutablePath" in VS Code.');
    const started = Date.now();
    await runner.run({ title: 'QA tests' });
    for (const m of messages) {
        if (m.kind !== 'info' && m.kind !== 'warning')
            process.stderr.write(`qaRun: ${m.message}\n`);
    }
    const version = await runner.getEngineVersion(exe);
    process.exitCode = writeReports(runner, { exe, version, started, target });
}
main().catch(e => fail(e?.stack ?? String(e)));
