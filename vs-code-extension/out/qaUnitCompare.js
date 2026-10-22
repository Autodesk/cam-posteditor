"use strict";
// Detects whether the IN and MM outputs of a test changed in the same way, so only one of them needs a review.
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = diff;
exports.isSameChange = isSameChange;
exports.diffPreview = diffPreview;
const MAX_LINE_EDITS = 1000;
const MAX_TOKEN_EDITS = 2000;
const RATIO_TOLERANCE = 0.01;
const NUMBER = /^[-+]?(?:\d+\.?\d*|\.\d+)$/;
const CODE_ADDRESS = /^[GMTHDNOPL]$/i;
/** Myers diff. Returns [{ op: '=' | '-' | '+', value }] or undefined if there are more than maxEdits edits. */
function diff(a, b, maxEdits) {
    const n = a.length;
    const m = b.length;
    const limit = Math.min(n + m, maxEdits);
    const offset = limit + 1;
    const v = new Int32Array(2 * limit + 3);
    const trace = [];
    let found = -1;
    for (let d = 0; d <= limit && found < 0; d++) {
        for (let k = -d; k <= d; k += 2) {
            let x = (k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])) ? v[offset + k + 1] : v[offset + k - 1] + 1;
            let y = x - k;
            while (x < n && y < m && a[x] === b[y]) {
                x++;
                y++;
            }
            v[offset + k] = x;
            if (x >= n && y >= m)
                found = d;
        }
        trace.push(v.slice(offset - d, offset + d + 1));
    }
    if (found < 0)
        return undefined;
    const ops = [];
    let x = n;
    let y = m;
    for (let d = found; d > 0; d--) {
        const prev = trace[d - 1];
        const at = (k) => prev[k + d - 1];
        const k = x - y;
        const prevK = (k === -d || (k !== d && at(k - 1) < at(k + 1))) ? k + 1 : k - 1;
        const prevX = at(prevK);
        const prevY = prevX - prevK;
        const startX = prevK === k + 1 ? prevX : prevX + 1;
        const startY = prevK === k + 1 ? prevY + 1 : prevY;
        while (x > startX && y > startY) {
            ops.push({ op: '=', value: a[--x] });
            y--;
        }
        if (prevK === k + 1)
            ops.push({ op: '+', value: b[--y] });
        else
            ops.push({ op: '-', value: a[--x] });
    }
    while (x > 0 && y > 0) {
        ops.push({ op: '=', value: a[--x] });
        y--;
    }
    return ops.reverse();
}
/** Groups an edit script into blocks of consecutive changes: [{ before, removed: [], added: [] }]. */
function changeBlocks(ops) {
    const blocks = [];
    let current;
    let before = '';
    for (const { op, value } of ops) {
        if (op === '=') {
            current = undefined;
            before = value;
            continue;
        }
        if (!current) {
            current = { before, removed: [], added: [] };
            blocks.push(current);
        }
        (op === '-' ? current.removed : current.added).push(value);
    }
    return blocks;
}
function tokenize(lines) {
    const tokens = [];
    for (const line of lines) {
        tokens.push(...(line.match(/[A-Za-z_]+|[-+]?(?:\d+\.?\d*|\.\d+)|\S/g) ?? []));
        tokens.push('\n');
    }
    return tokens;
}
const normalize = (tokens) => tokens.map(t => (NUMBER.test(t) ? '#' : t)).join(' ');
function sameRatio(oldA, newA, oldB, newB) {
    const [oa, na, ob, nb] = [oldA, newA, oldB, newB].map(Number);
    if (oa === 0 || ob === 0)
        return oa === ob && na === nb;
    const ra = na / oa;
    const rb = nb / ob;
    return Math.abs(ra - rb) <= RATIO_TOLERANCE * Math.max(Math.abs(ra), Math.abs(rb));
}
/**
 * A changed block is the same in both units if its structure matches and each changed number changed the same way:
 * codes (G20, M8, T2...) that are equal in both units must get the same new value, values (X, F...) must scale alike.
 */
function sameBlock(a, b) {
    if (normalize(a.removed) !== normalize(b.removed) || normalize(a.added) !== normalize(b.added))
        return false;
    if (a.removed.length === 0 || a.added.length === 0 || normalize(a.removed) !== normalize(a.added))
        return true;
    for (let i = 0; i < a.removed.length; i++) {
        const [oldA, newA, oldB, newB] = [a.removed[i], a.added[i], b.removed[i], b.added[i]];
        if (!NUMBER.test(oldA) || (oldA === newA && oldB === newB))
            continue;
        const address = i > 0 ? a.removed[i - 1] : a.before;
        if (CODE_ADDRESS.test(address)) {
            if (oldA === oldB && newA !== newB)
                return false;
        }
        else if (!sameRatio(oldA, newA, oldB, newB)) {
            return false;
        }
    }
    return true;
}
function changeOf(expectedText, actualText) {
    const lineOps = diff(expectedText.split(/\r?\n/), actualText.split(/\r?\n/), MAX_LINE_EDITS);
    if (!lineOps)
        return undefined;
    const blocks = [];
    for (const hunk of changeBlocks(lineOps)) {
        const tokenOps = diff(tokenize(hunk.removed), tokenize(hunk.added), MAX_TOKEN_EDITS);
        if (!tokenOps)
            return undefined;
        blocks.push(...changeBlocks(tokenOps));
    }
    return blocks;
}
const MAX_PREVIEW_EDITS = 4000;
const MAX_PREVIEW_LINE_LENGTH = 200;
/**
 * Short unified diff of expected -> actual for reports: hunks with `context` unchanged lines around each change,
 * cut off after `maxChangedLines` changed lines. Returns { lines, changed, hidden, note }.
 */
function diffPreview(expectedText, actualText, { context = 3, maxChangedLines = 40 } = {}) {
    const a = expectedText.split(/\r?\n/);
    const b = actualText.split(/\r?\n/);
    let start = 0;
    while (start < a.length && start < b.length && a[start] === b[start])
        start++;
    let endA = a.length;
    let endB = b.length;
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
        endA--;
        endB--;
    }
    if (start === endA && start === endB)
        return { lines: [], changed: 0, hidden: 0, note: 'Only line endings differ.' };
    const middleA = a.slice(start, endA);
    const middleB = b.slice(start, endB);
    const ops = diff(middleA, middleB, MAX_PREVIEW_EDITS)
        ?? [...middleA.map(value => ({ op: '-', value })), ...middleB.map(value => ({ op: '+', value }))];
    const before = Math.min(context, start);
    const entries = [];
    let lineA = start - before + 1;
    let lineB = start - before + 1;
    for (const value of a.slice(start - before, start))
        entries.push({ op: '=', value, lineA: lineA++, lineB: lineB++ });
    for (const { op, value } of ops) {
        entries.push({ op, value, lineA, lineB });
        if (op !== '+')
            lineA++;
        if (op !== '-')
            lineB++;
    }
    for (const value of a.slice(endA, endA + context))
        entries.push({ op: '=', value, lineA: lineA++, lineB: lineB++ });
    const changes = [];
    entries.forEach((e, i) => {
        if (e.op !== '=')
            changes.push(i);
    });
    const keep = new Array(entries.length).fill(false);
    for (const i of changes) {
        for (let j = Math.max(0, i - context); j <= Math.min(entries.length - 1, i + context); j++)
            keep[j] = true;
    }
    const clip = (text) => (text.length > MAX_PREVIEW_LINE_LENGTH ? `${text.slice(0, MAX_PREVIEW_LINE_LENGTH)}…` : text);
    const lines = [];
    let shown = 0;
    let inHunk = false;
    for (let i = 0; i < entries.length && shown < maxChangedLines; i++) {
        if (!keep[i]) {
            inHunk = false;
            continue;
        }
        const e = entries[i];
        if (!inHunk) {
            lines.push(`@@ expected line ${e.lineA}, actual line ${e.lineB} @@`);
            inHunk = true;
        }
        lines.push(`${e.op === '=' ? ' ' : e.op}${clip(e.value)}`);
        if (e.op !== '=')
            shown++;
    }
    return { lines, changed: changes.length, hidden: changes.length - shown, note: '' };
}
/** True if expectedA -> actualA is the same change as expectedB -> actualB, apart from unit-dependent values. */
function isSameChange(expectedA, actualA, expectedB, actualB) {
    const a = changeOf(expectedA, actualA);
    const b = changeOf(expectedB, actualB);
    if (!a || !b || a.length === 0 || a.length !== b.length)
        return false;
    return a.every((block, i) => sameBlock(block, b[i]));
}
