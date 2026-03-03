"use strict";
// Copyright (c) 2020-2026 by Autodesk, Inc.
// Extension-provided IntelliSense for .cps/.cpi (completion + hover) without node_modules.
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSymbols = loadSymbols;
exports.provideCompletionItems = provideCompletionItems;
exports.provideHover = provideHover;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const REFERENCE_URL = "https://cam.autodesk.com/posts/reference/index.html";
/** Parse globals.d.ts and return { name, description, kind, signature?, seeUrl?, example? }[]. */
function loadSymbols(extensionPath) {
    const sourcePath = path.join(extensionPath, "res", "language files", "globals.d.ts");
    let content;
    try {
        content = fs.readFileSync(sourcePath, "utf-8");
    }
    catch {
        return getFallbackSymbols();
    }
    const symbols = [];
    // Match /** ... */ followed by declare (var|function|class|const) name ... ;
    // Use (?:[^*]|\*+[^*/])* so we stop at the FIRST */ and don't capture a later block's content
    const blockRe = /\/\*\*((?:[^*]|\*+[^*/])*)\*\/\s*declare\s+(var|function|class|const)\s+(\w+)([^;]*);/g;
    let m;
    while ((m = blockRe.exec(content)) !== null) {
        const rawDesc = m[1];
        const kind = m[2];
        const name = m[3];
        const rest = (m[4] || "").trim();
        const fullDeclare = "declare " + kind + " " + name + (rest ? " " + rest : "") + ";";
        const signature = kind === "function" ? `function ${name}${rest}` : fullDeclare.replace(/^declare\s+/, "");
        const seeMatch = rawDesc.match(/@see\s+(https:\S+)/);
        const seeUrl = seeMatch ? seeMatch[1].trim() : null;
        const flat = rawDesc.replace(/\s*\*\s?/g, " ").replace(/\s+/g, " ").trim();
        const exampleMatch = flat.match(/@example\s+(.*?)(?=@see|$)/);
        const example = exampleMatch ? exampleMatch[1].trim() : null;
        const description = flat
            .replace(/\s*@example\s+.*?(?=@see|$)/, "")
            .replace(/\s*@see\s+\S+.*/, "")
            .trim();
        symbols.push({ name, description: description || name, kind, signature, seeUrl, example });
    }
    if (symbols.length === 0)
        return getFallbackSymbols();
    return symbols;
}
/** Fallback symbols when globals.d.ts is missing. */
function getFallbackSymbols() {
    const entries = [
        ["writeBlock", "Writes one or more blocks to the NC output.", "function"],
        ["writeln", "Writes a line to the NC output.", "function"],
        ["getProperty", "Gets a post processor property value by id.", "function"],
        ["setProperty", "Sets a post processor property value.", "function"],
        ["getSetting", "Gets a setting value.", "function"],
        ["createFormat", "Creates a format for numbers/angles.", "function"],
        ["createOutputVariable", "Creates an output variable (modal).", "function"],
        ["highFeedrate", "The high feedrate value used for rapid substitution.", "var"],
        ["unit", "Current unit (MM or IN).", "var"],
        ["geometry", "Current geometry (positions, tool axis).", "var"],
        ["machine", "Machine configuration.", "var"],
        ["currentSection", "Current NC section.", "var"],
        ["tool", "Current tool.", "var"],
        ["cycle", "Cycle parameters (onCycle/onCyclePoint).", "var"],
        ["programName", "Program name property.", "var"],
        ["MM", "Millimeter unit constant.", "const"],
        ["IN", "Inch unit constant.", "const"],
        ["X", "X axis index.", "const"],
        ["Y", "Y axis index.", "const"],
        ["Z", "Z axis index.", "const"],
        ["Vector", "3D vector class.", "class"],
        ["Section", "NC section class.", "class"],
        ["Tool", "Tool class.", "class"],
        ["onOpen", "Entry: post opens.", "function"],
        ["onClose", "Entry: post closes.", "function"],
        ["onSection", "Entry: section starts.", "function"],
        ["onSectionEnd", "Entry: section ends.", "function"],
        ["onLinear", "Entry: linear move.", "function"],
        ["onRapid", "Entry: rapid move.", "function"],
        ["onCircular", "Entry: circular move.", "function"],
        ["onCycle", "Entry: cycle definition.", "function"],
        ["onCyclePoint", "Entry: cycle point.", "function"],
        ["onCycleEnd", "Entry: cycle end.", "function"],
    ];
    return entries.map(([name, description, kind]) => ({ name, description, kind, signature: undefined, seeUrl: undefined, example: undefined }));
}
function isCpsOrCpiDocument(doc) {
    const p = doc.uri.fsPath || "";
    return p.toLowerCase().endsWith(".cps") || p.toLowerCase().endsWith(".cpi");
}
/** When the file is inside a workspace, the workspace typically has node_modules/globals.d.ts and TS/JS provides IntelliSense. Skip our provider to avoid duplicates. */
function isOutsideWorkspace(doc) {
    return !vscode.workspace.getWorkspaceFolder(doc.uri);
}
function getWordAtPosition(document, position) {
    const range = document.getWordRangeAtPosition(position);
    if (!range)
        return { word: "", range: null };
    const word = document.getText(range);
    return { word, range };
}
function provideCompletionItems(symbols, document, position) {
    if (!isCpsOrCpiDocument(document) || !isOutsideWorkspace(document))
        return undefined;
    const { word, range } = getWordAtPosition(document, position);
    const prefix = word.toLowerCase();
    const items = symbols
        .filter((s) => s.name.toLowerCase().startsWith(prefix))
        .map((s) => {
            const item = new vscode.CompletionItem(s.name, kindToCompletionKind(s.kind));
            item.detail = s.signature || `(${s.kind}) ${s.name}`;
            const md = new vscode.MarkdownString();
            md.appendMarkdown(s.description + "\n\n");
            if (s.example) {
                md.appendMarkdown("@example\n\n");
                md.appendCodeblock(s.example, "javascript");
                md.appendMarkdown("\n");
            }
            if (s.seeUrl)
                md.appendMarkdown(`@see — [${s.seeUrl}](${s.seeUrl})`);
            else
                md.appendMarkdown(`[Post Processor API](${REFERENCE_URL})`);
            item.documentation = md;
            if (range)
                item.range = range;
            return item;
        });
    return items.length ? items : undefined;
}
function provideHover(symbols, document, position) {
    if (!isCpsOrCpiDocument(document) || !isOutsideWorkspace(document))
        return undefined;
    const { word } = getWordAtPosition(document, position);
    if (!word)
        return undefined;
    const sym = symbols.find((s) => s.name === word);
    if (!sym)
        return undefined;
    const md = new vscode.MarkdownString();
    // Match globals.d.ts style: signature (with syntax highlight), description, @example, @see link
    if (sym.signature)
        md.appendCodeblock(sym.signature, "typescript");
    else
        md.appendMarkdown(`**${sym.name}** (${sym.kind})\n\n`);
    md.appendMarkdown("\n" + sym.description + "\n\n");
    if (sym.example) {
        md.appendMarkdown("@example\n\n");
        md.appendCodeblock(sym.example, "javascript");
        md.appendMarkdown("\n");
    }
    if (sym.seeUrl)
        md.appendMarkdown(`@see — [${sym.seeUrl}](${sym.seeUrl})`);
    else
        md.appendMarkdown(`[Post Processor API](${REFERENCE_URL})`);
    return new vscode.Hover(md);
}
function kindToCompletionKind(kind) {
    switch (kind) {
        case "function":
            return vscode.CompletionItemKind.Function;
        case "class":
            return vscode.CompletionItemKind.Class;
        case "var":
            return vscode.CompletionItemKind.Variable;
        case "const":
            return vscode.CompletionItemKind.Constant;
        default:
            return vscode.CompletionItemKind.Symbol;
    }
}
