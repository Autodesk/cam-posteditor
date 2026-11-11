"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QaTestProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const STATUS_TEXT = {
    notRun: 'not run yet',
    stale: 'changed - run again',
    queued: 'queued',
    running: 'running...',
    passed: 'passed',
    differs: 'output differs - click to compare',
    failed: 'post processing failed - click for details',
    missingInput: 'input file missing',
    missingExpected: 'new - click to review and accept',
    missingPost: 'post file not found',
    ignored: 'ignored',
    skipped: 'skipped (not supported)',
    unsupported: 'unsupported post type',
    noTestCases: 'no test cases yet - add one',
};
const STATUS_ICON = {
    notRun: ['circle-outline'],
    stale: ['history', 'list.warningForeground'],
    queued: ['clock', 'disabledForeground'],
    running: ['loading~spin'],
    passed: ['pass', 'testing.iconPassed'],
    differs: ['diff', 'testing.iconFailed'],
    failed: ['error', 'testing.iconFailed'],
    missingInput: ['warning', 'list.warningForeground'],
    missingExpected: ['new-file', 'list.warningForeground'],
    missingPost: ['warning', 'list.warningForeground'],
    ignored: ['circle-slash', 'disabledForeground'],
    skipped: ['debug-step-over', 'disabledForeground'],
    unsupported: ['circle-slash', 'disabledForeground'],
    noTestCases: ['add', 'disabledForeground'],
};
const SEVERITY = ['running', 'queued', 'failed', 'differs', 'missingInput', 'missingPost', 'missingExpected', 'stale', 'notRun', 'passed', 'skipped', 'ignored'];
function icon(status) {
    const [id, color] = STATUS_ICON[status] ?? ['circle-outline'];
    return color ? new vscode.ThemeIcon(id, new vscode.ThemeColor(color)) : new vscode.ThemeIcon(id);
}
function worstStatus(counts) {
    return SEVERITY.find(s => counts[s]) ?? 'notRun';
}
/** Why the jobs were ignored, for example "ignore_single.json"; empty if unknown. */
function ignoreReasons(runner, jobs) {
    return [...new Set(jobs.map(j => runner.getResult(j)?.ignoredBy).filter(Boolean))].join(', ');
}
function sameChangeText(runner, jobs, problems) {
    const same = runner.countSameChange(jobs);
    return same ? ` (${problems - same} unique)` : '';
}
class QaTestProvider {
    constructor(runner) {
        this.runner = runner;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        runner.onDidChange(() => this._onDidChangeTreeData.fire());
        /** Part of the ids of test cases: a new value makes VS Code forget the expand state of all of them. */
        this.caseGeneration = 0;
        /** The same for the posts; only changed when the view has several posts. */
        this.postGeneration = 0;
        this.postsCollapsed = false;
        /** Problems-only view: its own ids, new each time it is turned on, so that its test cases open again. */
        this.filterGeneration = 0;
        this.filterCollapsed = false;
        this.lastProblemsOnly = false;
    }
    /** Collapses all test cases, but leaves the posts open. */
    collapseCases() {
        this.caseGeneration++;
        // with several posts, "one level" is the list of posts: close them too
        if (this.runner.model.posts.length > 1) {
            this.postGeneration++;
            this.postsCollapsed = true;
        }
        if (this.runner.problemsOnly)
            this.filterCollapsed = true;
        this._onDidChangeTreeData.fire();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getChildren(element) {
        const runner = this.runner;
        if (!element) {
            if (!runner.project)
                return [];
            const problemsOnly = !!runner.problemsOnly;
            if (problemsOnly && !this.lastProblemsOnly) {
                this.filterGeneration++;
                this.filterCollapsed = false;
            }
            this.lastProblemsOnly = problemsOnly;
            return runner.model.posts
                .filter(p => !runner.problemsOnly || this.postHasProblems(p))
                .map(p => ({ kind: 'post', post: p }));
        }
        if (element.kind === 'post') {
            return element.post.cases
                .filter(c => !runner.problemsOnly || this.caseHasProblems(c))
                .map(c => ({ kind: 'case', post: element.post, testCase: c }));
        }
        if (element.kind === 'case') {
            return element.testCase.jobs
                .filter(j => !runner.problemsOnly || runner.isProblem(runner.getJobStatus(j)))
                .map(j => ({ kind: 'job', post: element.post, testCase: element.testCase, job: j }));
        }
        return [];
    }
    postHasProblems(postModel) {
        return this.runner.isProblem(postModel.state) || postModel.cases.some(c => this.caseHasProblems(c));
    }
    caseHasProblems(c) {
        return c.jobs.some(j => this.runner.isProblem(this.runner.getJobStatus(j)));
    }
    getTreeItem(element) {
        if (element.kind === 'post')
            return this.postItem(element.post);
        if (element.kind === 'case')
            return this.caseItem(element.testCase);
        return this.jobItem(element.job, element);
    }
    postItem(postModel) {
        const hasCases = postModel.cases.length > 0;
        const single = this.runner.model.posts.length === 1;
        const problemsOnly = !!this.runner.problemsOnly;
        const expanded = single || (this.postHasProblems(postModel) && (problemsOnly ? !this.filterCollapsed : !this.postsCollapsed));
        const item = new vscode.TreeItem(postModel.name, !hasCases ? vscode.TreeItemCollapsibleState.None
            : expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed);
        // new ids after "Collapse test cases" (several posts) and for each problems-only view, like the test cases
        item.id = single ? `post:${postModel.cpsPath}`
            : `post:${postModel.cpsPath}:${this.postGeneration}${problemsOnly ? `:problems${this.filterGeneration}` : ''}`;
        item.tooltip = postModel.cpsPath;
        item.contextValue = postModel.state === 'noTestCases' ? 'qaPost qaPostEmpty' : 'qaPost';
        if (postModel.state) {
            item.description = STATUS_TEXT[postModel.state];
            item.iconPath = icon(postModel.state);
            if (postModel.state === 'noTestCases')
                item.command = { command: 'autodesk.post.qaTest.addTestCase', title: 'Add test case', arguments: [{ kind: 'post', post: postModel }] };
            return item;
        }
        const jobs = postModel.cases.flatMap(c => c.jobs);
        const counts = this.runner.getCounts(jobs);
        const problems = jobs.filter(j => this.runner.isProblem(this.runner.getJobStatus(j))).length;
        const run = jobs.length - (counts.notRun ?? 0) - (counts.stale ?? 0);
        const ignoredBy = counts.ignored === jobs.length ? ignoreReasons(this.runner, jobs) : undefined;
        item.description = run === 0
            ? `${postModel.cases.length} test case(s), not run yet`
            : ignoredBy !== undefined
                ? `ignored${ignoredBy ? ` (${ignoredBy})` : ''}, no tests run`
                : `${counts.passed ?? 0}/${jobs.length} passed${problems ? `, ${problems} to check` : ''}${sameChangeText(this.runner, jobs, problems)}`;
        if (ignoredBy?.endsWith('.json'))
            item.tooltip = `${postModel.cpsPath}\nSkipped because the post is listed in tests/${ignoredBy}.`;
        item.iconPath = icon(worstStatus(counts));
        return item;
    }
    caseItem(c) {
        const tc = c.testCase;
        // problems-only view: the test cases with problems open (until "Collapse test cases");
        // full view: they open only until "Collapse test cases" was used
        const problemsOnly = !!this.runner.problemsOnly;
        const expanded = this.caseHasProblems(c) && (problemsOnly ? !this.filterCollapsed : this.caseGeneration === 0);
        const item = new vscode.TreeItem(tc.description || '(no description)', expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed);
        item.id = `case:${c.entry.file}:${c.entry.index}:${c.caseIndex}:${this.caseGeneration}${problemsOnly ? `:problems${this.filterGeneration}` : ''}`;
        const desc = [];
        const inputs = Array.isArray(tc.input) ? tc.input.length : 0;
        desc.push(`${inputs} input${inputs === 1 ? '' : 's'}`);
        const propCount = Object.keys(tc.properties ?? {}).length;
        if (propCount)
            desc.push(`${propCount} propert${propCount === 1 ? 'y' : 'ies'}`);
        if (tc.machine)
            desc.push(`machine: ${path.basename(tc.machine, path.extname(tc.machine))}`);
        const machineProps = Object.entries(c.jobs[0]?.machineProperties ?? {}).filter(([key]) => !(key in (tc.properties ?? {})));
        if (machineProps.length)
            desc.push(`${machineProps.length} from machine`);
        if (tc.ignored)
            desc.push('ignored');
        item.description = desc.join(' · ');
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**${tc.description || '(no description)'}**\n\n`);
        md.appendMarkdown(`Suffix: \`${tc.suffix || '(none)'}\`  \nInput folder: \`${tc.inputFolder || '(none)'}\`  \nMachine: \`${tc.machine || 'none'}\`\n\n`);
        md.appendMarkdown(`Inputs: ${(tc.input ?? []).join(', ') || '(none)'}\n\n`);
        if (propCount) {
            md.appendMarkdown('Properties:\n');
            md.appendCodeblock(JSON.stringify(tc.properties, null, 2), 'json');
        }
        if (path.extname(tc.machine ?? '').toLowerCase() === '.f3d')
            md.appendMarkdown('_Machine properties are not read from .f3d files._\n\n');
        if (machineProps.length) {
            md.appendMarkdown('From the machine (used when the post defines them with machine scope):\n');
            md.appendCodeblock(JSON.stringify(Object.fromEntries(machineProps), null, 2), 'json');
        }
        md.appendMarkdown(`\n_Right-click to edit. Stored in ${path.relative(this.runner.project?.root ?? '', c.entry.file)}_`);
        item.tooltip = md;
        const acceptable = c.jobs.some(j => {
            const status = this.runner.getJobStatus(j);
            return status === 'differs' || status === 'missingExpected';
        });
        item.contextValue = acceptable ? 'qaCase qaCaseAcceptable' : 'qaCase';
        item.iconPath = icon(worstStatus(this.runner.getCounts(c.jobs)));
        return item;
    }
    jobItem(job, element) {
        const status = this.runner.getJobStatus(job);
        const result = this.runner.getResult(job);
        const item = new vscode.TreeItem(`${job.input}${job.suffix}`, vscode.TreeItemCollapsibleState.None);
        // with the status in the id, VS Code makes a new row when the status changes: otherwise it can keep
        // the hover of the old row (for example "running") until the run ends
        item.id = `job:${job.id}:${status}`;
        const sameChangeAs = status === 'differs' ? result?.sameChangeAs : undefined;
        const sameChangeIn = status === 'differs' ? result?.sameChangeIn : undefined;
        item.description = sameChangeAs ? `same change as ${sameChangeAs} - click to compare`
            : sameChangeIn ? `output differs, same change in ${sameChangeIn} - click to compare`
                : status === 'ignored' && result?.ignoredBy ? `ignored (${result.ignoredBy})`
                    : (STATUS_TEXT[status] ?? status);
        item.iconPath = sameChangeAs ? new vscode.ThemeIcon('diff', new vscode.ThemeColor('disabledForeground')) : icon(status);
        item.contextValue = `qaJob qaJob-${status}`;
        const tooltip = this.jobTooltipLines(job, result, item.description, sameChangeAs ?? sameChangeIn, true).join('\n');
        item.tooltip = (status === 'failed' && this.errorTooltip(job)) || tooltip;
        item.command = { command: 'autodesk.post.qaTest.openJob', title: 'Open', arguments: [element] };
        return item;
    }
    jobTooltipLines(job, result, description, sameChange, withMessage) {
        const lines = [`${job.post}_${job.input}${job.suffix}.output`, `Status: ${description}`];
        if (sameChange)
            lines.push(`The ${job.unitLabel} output changed in the same way as ${sameChange}. Accepting either one accepts both.`);
        if (withMessage && result?.message)
            lines.push('', result.message);
        if (result?.machineProperties?.length)
            lines.push('', `From machine: ${result.machineProperties.join(', ')}`);
        if (result?.machineSkipped?.length)
            lines.push('', `Machine properties not applied: ${result.machineSkipped.join(', ')}`);
        if (result?.commandLine)
            lines.push('', result.commandLine);
        else if (job.skipReason)
            lines.push('', `Not supported in the extension: ${job.skipReason}`);
        return lines;
    }
    /** The tooltip of a failed job with the error from the log of the post engine; undefined if the log has no error. */
    errorTooltip(job) {
        const error = this.runner.getPostError(job);
        if (!error)
            return undefined;
        const lines = this.jobTooltipLines(job, this.runner.getResult(job), STATUS_TEXT.failed, undefined, false);
        const md = new vscode.MarkdownString(undefined, true);
        md.supportHtml = true; // only for the colour of the error
        const text = (s) => { md.appendText(s); md.appendMarkdown('  \n'); };
        // the same name as the row, so that the tooltip can be matched with its test; the red error replaces the status line
        md.appendMarkdown(`**${escapeMarkdown(`${job.input}${job.suffix}`)}**  \n`);
        text([job.description || '(no description)', job.post].join(' · '));
        md.appendMarkdown(`\n---\n\n#### <span style="color:#f14c4c;">Error: ${escapeMarkdown(error.message)}</span>\n\n`);
        for (const d of error.details)
            text(d);
        // no link: a click on the row opens the post at this line together with the matching log
        if (error.line)
            text(`Line ${error.line}${error.file ? ` in ${path.basename(error.file)}` : ''}`);
        if (error.functionName)
            text(`In function: ${error.functionName}()`);
        if (error.operation)
            text(`Operation: ${error.operation}`);
        md.appendMarkdown('\n---\n\n');
        text(`Output: ${lines[0]}`);
        for (const l of lines.slice(2).filter(l => l !== ''))
            text(l);
        return md;
    }
}
function escapeMarkdown(s) {
    return s.replace(/[\\`*_{}[\]()#+\-.!|<>$]/g, '\\$&');
}
exports.QaTestProvider = QaTestProvider;
