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
const { diffPreview } = require("./qaUnitCompare");
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
/** Post names, test case descriptions and messages come from files; keep them from turning into Markdown. */
function escapeMarkdown(text) {
    return String(text).replace(/[\\`*_[\]<>#|~]/g, '\\$&').replace(/\r?\n/g, ' ');
}
function inlineCode(text) {
    const value = String(text).replace(/\r?\n/g, ' ');
    const longest = Math.max(0, ...(value.match(/`+/g) ?? []).map(run => run.length));
    const fence = '`'.repeat(longest + 1);
    return longest ? `${fence} ${value} ${fence}` : `${fence}${value}${fence}`;
}
/** Fenced block that output lines cannot close, indented to stay inside a list item. */
function codeBlock(language, text, indent = '') {
    const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map(run => run.length));
    const fence = '`'.repeat(Math.max(3, longest + 1));
    return [`${fence}${language}`, ...text.split(/\r?\n/), fence].map(line => `${indent}${line}`);
}
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
            caseKey: `${job.entryFile}::${job.entryIndex}::${job.caseIndex}`,
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
            twinUnit: twin?.unitLabel ?? '',
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
    for (const r of problemRows) {
        if (r.status !== 'differs' || r.sameChangeAs || !r.actual || !r.expected)
            continue;
        try {
            r.diff = diffPreview(fs.readFileSync(r.expected, 'utf8'), fs.readFileSync(r.actual, 'utf8'));
        }
        catch { /* files removed after the run */ }
    }
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
    const outDir = path.join(project.root, 'output'); // nosemgrep: join_resolve_path_traversal -- fixed folder name or checked path
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
    const jsonFile = path.join(outDir, 'qa-report.json'); // nosemgrep: join_resolve_path_traversal -- fixed folder name or checked path
    fs.writeFileSync(jsonFile, `${JSON.stringify(json, null, 2)}\n`);
    const md = [];
    const link = (label, file) => (file ? `[${label}](<${path.relative(outDir, file).split(path.sep).join('/')}>)` : '');
    md.push(`# QA test report: ${exitCode === 0 ? 'all passed' : 'problems found'}`, '');
    md.push(`**${escapeMarkdown(summary)}**`, '');
    md.push(`- Date: ${new Date().toLocaleString()} (${seconds} s)`);
    md.push(`- Project: ${inlineCode(project.root)}`);
    md.push(`- Post engine: ${version ? `${escapeMarkdown(version)}, ` : ''}${inlineCode(exe)}`);
    md.push(`- Every test, including command lines: ${link('qa-report.json', jsonFile)}`, '');
    if (postProblems.length) {
        md.push('## Missing posts', '');
        for (const p of postProblems)
            md.push(`- ${escapeMarkdown(p.name)}: ${inlineCode(p.cpsPath)} not found`);
        md.push('');
    }
    const problemPosts = posts.filter(p => p.state || problemRows.some(r => r.post === p.name));
    md.push('## Posts', '');
    if (problemPosts.length) {
        md.push('| Post | Passed | Problems |', '|---|---|---|');
        for (const p of problemPosts) {
            const rows = problemRows.filter(r => r.post === p.name);
            const byStatus = {};
            for (const r of rows)
                byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
            const problems = p.state ? (STATUS_LABELS[p.state] ?? p.state)
                : Object.entries(byStatus).map(([s, n]) => `${n} ${SUMMARY_LABELS[s] ?? s}`).join(', ');
            md.push(`| ${escapeMarkdown(p.name)} | ${p.state ? '-' : `${p.passed}/${p.total}`} | ${escapeMarkdown(problems)} |`);
        }
        md.push('');
    }
    const passedPosts = posts.length - problemPosts.length;
    if (passedPosts)
        md.push(`${passedPosts} ${passedPosts === 1 ? 'post' : 'posts'} passed all tests.`, '');
    if (problemRows.length)
        md.push('## Problems', '');
    for (const postName of [...new Set(problemRows.map(r => r.post))]) {
        md.push(`### ${escapeMarkdown(postName)}`, '');
        const postRows = problemRows.filter(r => r.post === postName);
        for (const caseKey of [...new Set(postRows.map(r => r.caseKey))]) {
            const caseRows = postRows.filter(r => r.caseKey === caseKey);
            const first = caseRows[0];
            md.push(`#### ${escapeMarkdown(first.testCase || '(no description)')}`, '');
            if (first.machine) {
                const fromMachine = first.machineProperties.length ? `, properties from machine: ${escapeMarkdown(first.machineProperties.join(', '))}` : '';
                md.push(`Machine ${inlineCode(path.basename(first.machine))}${fromMachine}`, '');
            }
            for (const r of caseRows) {
                if (r.sameChangeAs)
                    continue;
                const twin = r.sameChangeIn ? ` (${escapeMarkdown(r.twinUnit || r.twinLabel)}: same change)` : '';
                const files = [link('actual', r.actual), r.status !== 'failed' && r.status !== 'missingExpected' ? link('expected', r.expected) : '']
                    .filter(Boolean).join(' · ');
                md.push(`- **${escapeMarkdown(`${r.input}${r.suffix}`)}**: ${escapeMarkdown(STATUS_LABELS[r.status] ?? r.status)}${twin}${files ? ` · ${files}` : ''}`);
                if (r.diff?.note)
                    md.push(`  ${escapeMarkdown(r.diff.note)}`);
                else if (r.diff?.lines.length) {
                    md.push('', ...codeBlock('diff', r.diff.lines.join('\n'), '  '));
                    if (r.diff.hidden)
                        md.push(`  … ${r.diff.hidden} more changed ${r.diff.hidden === 1 ? 'line' : 'lines'}`);
                }
                if (r.message)
                    md.push('', ...codeBlock('text', r.message, '  '));
                md.push('');
            }
        }
    }
    if (machineNotes.length) {
        md.push('## Notes', '');
        for (const note of machineNotes)
            md.push(`- ${escapeMarkdown(note)}`);
        md.push('');
    }
    const mdFile = path.join(outDir, 'qa-report.md'); // nosemgrep: join_resolve_path_traversal -- fixed folder name or checked path
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
        posts = names.map(n => path.join(project.baseDir, `${n}.cps`)); // nosemgrep: join_resolve_path_traversal -- post names of the command line
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
