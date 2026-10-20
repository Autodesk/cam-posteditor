"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerQaTestCommands = registerQaTestCommands;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const utils_1 = require("./utils");
const config = require("./config");
const postRunner_1 = require("./postRunner");
const qa = require("./qaTestRunner");
const qaTestProvider_1 = require("./providers/qaTestProvider");
const qaTestEditor_1 = require("./qaTestEditor");
const libraryQa = require("./qaLibrary");
function isCps(file) {
    return typeof file === 'string' && file.toLowerCase().endsWith('.cps');
}
function activeCps() {
    const file = vscode.window.activeTextEditor?.document.fileName;
    return isCps(file) ? file : undefined;
}
function jobsOf(node) {
    if (!node)
        return undefined;
    if (node.kind === 'job')
        return [node.job];
    if (node.kind === 'case')
        return node.testCase.jobs;
    if (node.kind === 'post')
        return node.post.cases.flatMap(c => c.jobs);
    return undefined;
}
function registerQaTestCommands(context, engine) {
    const runner = new qa.QaTestRunner(context, engine);
    const provider = new qaTestProvider_1.QaTestProvider(runner);
    const editor = new qaTestEditor_1.QaTestEditor(runner, engine);
    const view = vscode.window.createTreeView('qaTestList', { treeDataProvider: provider, showCollapseAll: true });
    context.subscriptions.push(view);
    // Shows whether the library post engine matches jenkins/packages.txt.
    const engineStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    engineStatus.command = 'autodesk.post.qaTest.checkLibraryEngine';
    context.subscriptions.push(engineStatus);
    let libraryRoot;
    let engineWatcher;
    const refreshEngineStatus = async (lib) => {
        const check = await libraryQa.checkEngine(lib);
        engineStatus.text = check.ok ? `$(check) Post engine ${check.installed}` : `$(warning) Post engine ${check.installed ?? 'missing'}`;
        engineStatus.tooltip = check.ok
            ? `QA tests use run-tests.js with the post engine pinned in jenkins/packages.txt (${check.required}).`
            : `${check.problems.join('\n')}\nClick to update.`;
        engineStatus.backgroundColor = check.ok ? undefined : new vscode.ThemeColor('statusBarItem.warningBackground');
        engineStatus.show();
    };
    const updateLibraryStatus = () => {
        const lib = config.get('qaTestEnabled') ? runner.getLibraryConfig() : undefined;
        vscode.commands.executeCommand('setContext', 'autodesk.qaTest.libraryMode', !!lib);
        if (lib?.root === libraryRoot)
            return;
        libraryRoot = lib?.root;
        engineWatcher?.dispose();
        engineWatcher = undefined;
        if (!lib) {
            engineStatus.hide();
            return;
        }
        engineWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(lib.jenkins, '{packages.txt,packages/post/**}'));
        const onChange = () => refreshEngineStatus(lib);
        engineWatcher.onDidChange(onChange);
        engineWatcher.onDidCreate(onChange);
        engineWatcher.onDidDelete(onChange);
        context.subscriptions.push(engineWatcher);
        refreshEngineStatus(lib);
    };
    const updateContext = () => {
        view.description = runner.getSummaryText();
        vscode.commands.executeCommand('setContext', 'autodesk.qaTest.hasProject', !!runner.project);
        vscode.commands.executeCommand('setContext', 'autodesk.qaTest.hasPosts', runner.model.posts.length > 0);
        vscode.commands.executeCommand('setContext', 'autodesk.qaTest.problemsOnly', runner.problemsOnly);
        vscode.commands.executeCommand('setContext', 'autodesk.qaTest.running', runner.running);
        vscode.commands.executeCommand('setContext', 'autodesk.qaTest.following', !!runner.model.auto);
        vscode.commands.executeCommand('setContext', 'autodesk.qaTest.outsideProject', !runner.project && !!runner.outsideRoot);
        updateLibraryStatus();
        view.message = !runner.project && runner.outsideRoot
            ? `This post is outside the open folder. QA tests found in ${runner.outsideRoot}`
            : runner.project && runner.problemsOnly && runner.model.posts.length > 0 && provider.getChildren().length === 0
                ? 'No problems. Click "Show all" in the title bar to see every test.'
                : undefined;
    };
    runner.onDidChange(updateContext);
    const enabled = () => !!config.get('qaTestEnabled');
    // Follow the active post unless the user is looking at a folder / multi-post run.
    const followActive = () => {
        const file = activeCps();
        if (!enabled() || runner.running || !runner.model.auto)
            return;
        if (file && runner.model.cpsPaths?.[0] === file && runner.model.posts.length === 1)
            return;
        if (file)
            runner.setPosts([file], { auto: true });
        else if (!runner.project)
            runner.setPosts([], { auto: true });
        else
            updateContext();
    };
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(followActive));
    followActive();
    updateContext();
    // Reload when test case JSON files are saved by hand; earlier results of a saved post are out of date.
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => {
        if (!enabled())
            return;
        if (runner.project && doc.fileName.toLowerCase().endsWith('.json') && qa.isInside(runner.project.testCasesDir, doc.fileName))
            runner.reload();
        else if (isCps(doc.fileName))
            runner.markPostChanged(doc.fileName);
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('AutodeskPostUtility.qaTestEnabled')) {
            followActive();
            return;
        }
        if (!enabled())
            return;
        if (e.affectsConfiguration('AutodeskPostUtility.qaProjectFolder') || e.affectsConfiguration('AutodeskPostUtility.qaUnits') || e.affectsConfiguration('AutodeskPostUtility.outputUnits')) {
            runner.setPosts(runner.model.cpsPaths ?? [], { auto: runner.model.auto, label: runner.model.label, allowOutsideWorkspace: runner.model.allowOutsideWorkspace });
            runner.updateUnitPairs(runner.allJobs());
            runner.fireChanged(true);
        }
    }));
    const showResults = () => vscode.commands.executeCommand('qaTestList.focus');
    const runPosts = async (cpsPaths, label, auto = false) => {
        if (cpsPaths.length === 0) {
            vscode.window.showInformationMessage('No post (.cps) files found.');
            return;
        }
        runner.setPosts(cpsPaths, { auto, label });
        showResults();
        if (!runner.project) {
            await editor.ensureProject(runner.model.posts[0]);
            if (!runner.project)
                return;
        }
        const withCases = runner.model.posts.filter(p => p.cases.length > 0);
        if (withCases.length === 0) {
            const single = runner.model.posts.length === 1 ? runner.model.posts[0] : undefined;
            const choice = await vscode.window.showInformationMessage(single ? `${single.name} has no test cases yet.` : 'None of these posts have test cases yet.', ...(single ? ['Add test case'] : []));
            if (choice && single)
                editor.addTestCase({ kind: 'post', post: single });
            return;
        }
        await runner.run({ title: `QA test: ${label}` });
    };
    const runCurrent = async () => {
        if (runner.model.posts.length > 0)
            return runPosts(runner.model.cpsPaths, runner.model.label || runner.model.posts.map(p => p.name).join(', '), runner.model.auto);
        const file = activeCps();
        if (!file) {
            vscode.window.showInformationMessage('Open a post (.cps) file, or use "Run QA tests for a folder".');
            return;
        }
        return runPosts([file], path.basename(file, '.cps'), true);
    };
    const runFolder = async (folder) => {
        if (!folder) {
            const uris = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Run QA tests', defaultUri: runner.project ? vscode.Uri.file(runner.project.baseDir) : undefined });
            if (!uris?.[0])
                return;
            folder = uris[0].fsPath;
        }
        let recursive = false;
        const hasSubfolders = fs.readdirSync(folder, { withFileTypes: true }).some(d => d.isDirectory() && !['tests', 'jenkins', 'node_modules', '.git', 'machines', 'packages'].includes(d.name.toLowerCase()));
        if (hasSubfolders) {
            const pick = await vscode.window.showQuickPick([
                { label: 'This folder only', recursive: false },
                { label: 'This folder and its subfolders', recursive: true },
            ], { title: `Run QA tests for ${path.basename(folder)}` });
            if (!pick)
                return;
            recursive = pick.recursive;
        }
        const posts = qa.listPostsInFolder(folder, recursive);
        const root = qa.findProjectRoot(folder);
        const project = root ? qa.loadProject(root) : undefined;
        const tested = project ? posts.filter(p => project.entries.some(e => e.name.toLowerCase() === path.basename(p, '.cps').toLowerCase())) : posts;
        let list = posts;
        if (project && tested.length < posts.length) {
            const pick = await vscode.window.showQuickPick([
                { label: `Only posts with test cases (${tested.length})`, only: true },
                { label: `All posts in the folder (${posts.length})`, only: false, description: 'posts without test cases are listed so you can add some' },
            ], { title: `Run QA tests for ${path.basename(folder)}` });
            if (!pick)
                return;
            list = pick.only ? tested : posts;
        }
        await runPosts(list, path.basename(folder));
    };
    const reg = (id, fn) => context.subscriptions.push(vscode.commands.registerCommand(`autodesk.post.qaTest.${id}`, fn));
    reg('enable', async () => {
        await config.update('qaTestEnabled', true);
        showResults();
    });
    reg('disable', () => config.update('qaTestEnabled', false));
    // ── Changed files ───────────────────────────────────────────
    const projectForChanges = () => {
        if (runner.project)
            return runner.project;
        const start = activeCps() ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const root = start ? qa.findProjectRoot(start) : undefined;
        return root ? qa.loadProject(root) : undefined;
    };
    reg('runChangedPosts', async () => {
        const project = projectForChanges();
        if (!project) {
            vscode.window.showInformationMessage('Open a post of a QA project first.');
            return;
        }
        if (!libraryQa.getLibraryConfig(project)) {
            vscode.window.showInformationMessage('This command is not available for this QA project.');
            return;
        }
        let posts;
        try {
            posts = await libraryQa.getChangedPosts(project.baseDir, project.ignoreAll);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Could not read the git changes: ${e?.message ?? e}. Git must be installed and the posts must be in a git repository.`);
            return;
        }
        if (posts.length === 0) {
            vscode.window.showInformationMessage('No staged or unstaged posts found.');
            return;
        }
        await runPosts(posts, `changed posts (${posts.length})`);
    });
    reg('runBranchChanges', async () => {
        const lib = runner.getLibraryConfig();
        if (!lib)
            return;
        const last = context.workspaceState.get('qaTest.dstBranch') ?? await libraryQa.getDefaultBranch(lib.baseDir) ?? 'develop';
        const branch = await vscode.window.showInputBox({
            title: 'Run QA tests for the changes on this branch',
            prompt: 'Base branch to compare with, like Jenkins (needs network access for git fetch). Changes in tests/ (except expected files), jenkins/ or machines/ run all tests.',
            value: last,
            validateInput: v => (libraryQa.isValidBranchName(v.trim()) ? undefined : 'Enter a plain branch name, for example develop.'),
        });
        if (!branch)
            return;
        await context.workspaceState.update('qaTest.dstBranch', branch.trim());
        showResults();
        await runner.runBranchChanges(branch.trim());
    });
    // ── Library post engine ─────────────────────────────────────
    reg('checkLibraryEngine', async () => {
        const lib = runner.getLibraryConfig();
        if (!lib)
            return;
        const check = await libraryQa.checkEngine(lib);
        if (check.ok) {
            vscode.window.setStatusBarMessage(`Library post engine ${check.installed} matches jenkins/packages.txt`, 5000);
            return;
        }
        const choice = await vscode.window.showWarningMessage(check.problems.join(' '), 'Update engine');
        if (choice)
            await runner.updateLibraryEngine(lib);
    });
    reg('updateLibraryEngine', async () => {
        const lib = runner.getLibraryConfig();
        if (lib)
            await runner.updateLibraryEngine(lib);
    });
    // ── Running ─────────────────────────────────────────────────
    reg('run', runCurrent);
    reg('runActivePost', () => {
        const file = activeCps();
        if (!file) {
            vscode.window.showInformationMessage('Open a post (.cps) file first.');
            return;
        }
        return runPosts([file], path.basename(file, '.cps'), true);
    });
    reg('runPost', async () => {
        const dirs = new Set();
        if (runner.project)
            dirs.add(runner.project.baseDir);
        const file = activeCps();
        if (file)
            dirs.add(path.dirname(file));
        const items = [];
        for (const dir of dirs)
            for (const p of qa.listPostsInFolder(dir, false))
                items.push({ label: path.basename(p, '.cps'), description: path.dirname(p), file: p });
        items.push({ label: '$(folder-opened) Browse...', browse: true });
        const picked = await vscode.window.showQuickPick(items, { title: 'Run QA tests for posts', canPickMany: true, matchOnDescription: true, placeHolder: 'Tick one or more posts' });
        if (!picked || picked.length === 0)
            return;
        const files = picked.filter(i => i.file).map(i => i.file);
        if (picked.some(i => i.browse)) {
            const uris = await vscode.window.showOpenDialog({ canSelectMany: true, filters: { 'Post processors': ['cps'] } });
            files.push(...(uris ?? []).map(u => u.fsPath));
        }
        return runPosts(files, files.length === 1 ? path.basename(files[0], '.cps') : `${files.length} posts`);
    });
    reg('runFolder', (uri) => runFolder(uri?.fsPath));
    reg('runAllPosts', async () => {
        if (!runner.project && !(await editor.ensureProject()))
            return;
        const project = runner.project;
        const names = [...new Set(project.entries.map(e => e.name))].sort((a, b) => a.localeCompare(b));
        const files = names.map(n => path.join(project.baseDir, `${n}.cps`));
        return runPosts(files, `all ${names.length} posts with test cases`);
    });
    reg('runExplorer', async (uri, uris) => {
        const selected = (uris && uris.length ? uris : uri ? [uri] : []).map(u => u.fsPath);
        if (selected.length === 1 && fs.statSync(selected[0]).isDirectory())
            return runFolder(selected[0]);
        const files = [];
        for (const p of selected) {
            if (fs.statSync(p).isDirectory())
                files.push(...qa.listPostsInFolder(p, false));
            else if (isCps(p))
                files.push(p);
        }
        return runPosts(files, files.length === 1 ? path.basename(files[0], '.cps') : `${files.length} posts`);
    });
    reg('runItem', async (node) => {
        const jobs = jobsOf(node);
        if (!jobs) {
            return runCurrent();
        }
        if (node.kind === 'post' && node.post.cases.length === 0) {
            return editor.addTestCase(node);
        }
        const ids = new Set(jobs.map(j => j.id));
        await runner.run({ filter: j => ids.has(j.id), title: `QA test: ${node.kind === 'post' ? node.post.name : node.kind === 'case' ? node.testCase.testCase.description : `${node.job.input}${node.job.suffix}`}` });
    });
    reg('rerunProblems', async () => {
        const ids = new Set(runner.allJobs().filter(j => {
            const s = runner.getJobStatus(j);
            return runner.isProblem(s) || s === qa.STATUS.stale;
        }).map(j => j.id));
        if (ids.size === 0) {
            vscode.window.showInformationMessage('There are no failed or changed tests to run again.');
            return;
        }
        await runner.run({ filter: j => ids.has(j.id), title: 'QA test: running failed tests again' });
    });
    // ── Results ─────────────────────────────────────────────────
    const openDiff = async (job) => {
        const r = runner.getResult(job);
        if (!r?.expected || !r?.actual || !(0, utils_1.fileExists)(r.expected) || !(0, utils_1.fileExists)(r.actual)) {
            vscode.window.showInformationMessage('Run the test first; there is no output to compare yet.');
            return;
        }
        const out = { errorMessage: undefined };
        const tool = (0, postRunner_1.resolveExternalDiffToolPath)(out);
        if (out.errorMessage)
            vscode.window.showErrorMessage(out.errorMessage);
        if (tool) {
            cp.spawn(tool, [r.expected, r.actual], { detached: true, stdio: 'ignore', windowsHide: false }).unref();
            return;
        }
        await vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(r.expected), vscode.Uri.file(r.actual), `${path.basename(r.actual)}: expected ↔ actual`, { preview: true });
    };
    const samePath = (a, b) => !!a && !!b && (process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b);
    const acceptableJobForFile = (file) => {
        if (!file || !runner.project)
            return undefined;
        return runner.allJobs().find(j => {
            const status = runner.getJobStatus(j);
            if (status !== qa.STATUS.differs && status !== qa.STATUS.missingExpected)
                return false;
            const r = runner.getResult(j);
            return samePath(r?.actual, file) || samePath(r?.expected, file);
        });
    };
    const updateEditorContext = () => {
        const file = vscode.window.activeTextEditor?.document.uri.fsPath;
        vscode.commands.executeCommand('setContext', 'autodesk.qaTest.canAcceptEditor', !!acceptableJobForFile(file));
    };
    runner.onDidChange(updateEditorContext);
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateEditorContext));
    reg('openJob', async (node) => {
        const job = node?.job;
        if (!job)
            return;
        const status = runner.getJobStatus(job);
        const r = runner.getResult(job);
        if (status === qa.STATUS.differs) {
            await openDiff(job);
        }
        else if (status === qa.STATUS.missingExpected) {
            await vscode.window.showTextDocument(vscode.Uri.file(r.actual), { preview: true });
        }
        else if (status === qa.STATUS.failed || status === qa.STATUS.missingInput || status === qa.STATUS.skipped) {
            const choice = await vscode.window.showErrorMessage(r?.message || job.skipReason || 'The test could not run.', 'Show output', 'Open post');
            if (choice === 'Show output')
                runner.output.show(true);
            else if (choice === 'Open post')
                vscode.window.showTextDocument(vscode.Uri.file(node.post.cpsPath));
        }
        else if (r?.actual && (0, utils_1.fileExists)(r.actual)) {
            await vscode.window.showTextDocument(vscode.Uri.file(r.actual), { preview: true });
        }
        else {
            const choice = await vscode.window.showInformationMessage('This test has not run yet.', 'Run it');
            if (choice)
                vscode.commands.executeCommand('autodesk.post.qaTest.runItem', node);
        }
    });
    reg('diff', (node) => node?.job && openDiff(node.job));
    reg('openOutput', (node) => {
        const r = node?.job && runner.getResult(node.job);
        if (r?.actual && (0, utils_1.fileExists)(r.actual))
            vscode.window.showTextDocument(vscode.Uri.file(r.actual), { preview: true });
    });
    reg('openExpected', (node) => {
        const e = node?.job && qa.getJobPaths(runner.project, node.job).expected;
        if (e && (0, utils_1.fileExists)(e))
            vscode.window.showTextDocument(vscode.Uri.file(e), { preview: true });
        else
            vscode.window.showInformationMessage('There is no expected file for this test yet.');
    });
    reg('accept', (node) => {
        if (node instanceof vscode.Uri) {
            const job = acceptableJobForFile(node.fsPath);
            return job ? runner.acceptJobs([job], false) : undefined;
        }
        const jobs = jobsOf(node) ?? runner.allJobs();
        return runner.acceptJobs(jobs, !(node?.kind === 'job' || node?.kind === 'case'));
    });
    reg('acceptAll', () => runner.acceptJobs(runner.allJobs(), true));
    reg('showOutput', () => runner.output.show(true));
    reg('problemsOnly', () => { runner.problemsOnly = true; runner.fireChanged(true); });
    reg('showAll', () => { runner.problemsOnly = false; runner.fireChanged(true); });
    reg('refresh', () => {
        runner.model.auto = true;
        const file = activeCps();
        if (file && (runner.model.posts.length <= 1))
            runner.setPosts([file], { auto: true, allowOutsideWorkspace: !!runner.model.allowOutsideWorkspace && runner.model.cpsPaths?.[0] === file });
        else
            runner.reload();
    });
    reg('useOutsideProject', () => {
        if (runner.outsideRoot)
            runner.setPosts(runner.model.cpsPaths ?? [], { auto: runner.model.auto, label: runner.model.label, allowOutsideWorkspace: true });
    });
    reg('followActivePost', () => {
        runner.model.auto = true;
        const file = activeCps();
        if (file)
            runner.setPosts([file], { auto: true });
        else
            runner.setPosts([], { auto: true });
    });
    reg('openSettings', () => vscode.commands.executeCommand('workbench.action.openSettings', 'AutodeskPostUtility.qa'));
    // ── Project & editing ───────────────────────────────────────
    reg('createProject', () => editor.createProject());
    reg('selectProject', () => editor.selectProject());
    reg('openProjectFolder', () => runner.project && vscode.env.openExternal(vscode.Uri.file(runner.project.root)));
    reg('addTestCase', (node) => editor.addTestCase(node));
    reg('saveViewProperties', (node) => editor.saveViewPropertiesAsTestCase(node));
    reg('editProperties', (node) => editor.editProperties(node));
    reg('editInputs', (node) => editor.editInputs(node));
    reg('editMachine', (node) => editor.editMachine(node));
    reg('editDescription', (node) => editor.editDescription(node));
    reg('editSuffix', (node) => editor.editSuffix(node));
    reg('editAdditionalFlags', (node) => editor.editAdditionalFlags(node));
    reg('toggleIgnored', (node) => editor.toggleIgnored(node));
    reg('toggleUseDefaultProperties', (node) => editor.toggleUseDefaultProperties(node));
    reg('duplicateTestCase', (node) => editor.duplicateTestCase(node));
    reg('removeTestCase', (node) => editor.removeTestCase(node));
    reg('openTestCaseJson', (node) => editor.openTestCaseJson(node));
    return runner;
}
