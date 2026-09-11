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
exports.LineSelection = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const config = __importStar(require("./config"));
const postRunner_1 = require("./postRunner");
class LineSelection {
    constructor(engine) {
        this.engine = engine;
        this.amountToMove = 0;
        this.secondClick = false;
    }
    parkCursor(editor, line, clickedChar) {
        const docUri = editor.document.uri.fsPath;
        setTimeout(() => {
            const target = vscode.window.visibleTextEditors.find(e => e.document.uri.fsPath === docUri);
            if (!target || !target.selection.isEmpty)
                return;
            // Only park if the caret is still where the click left it, so we never fight the user.
            if (target.selection.start.line !== line || target.selection.start.character !== clickedChar)
                return;
            const lineLen = target.document.lineAt(line).text.length;
            const parkChar = clickedChar === 0 ? Math.min(1, lineLen) : 0;
            if (parkChar === clickedChar)
                return;
            target.selection = new vscode.Selection(line, parkChar, line, parkChar);
        }, 0);
    }
    handleSelectionChange(event) {
        if (event.kind !== vscode.TextEditorSelectionChangeKind.Mouse)
            return;
        const editor = event.textEditor;
        const activeFile = editor.document.fileName;
        if (!activeFile.includes('debuggedfile') || activeFile.includes('.log'))
            return;
        const selection = editor.selection;
        if (!selection.isEmpty) {
            if (selection.start.line !== selection.end.line)
                return;
            const wordRange = editor.document.getWordRangeAtPosition(selection.start);
            if (!wordRange || !wordRange.isEqual(selection))
                return;
        }
        const enabled = config.get('navigateToPostAtLineOnNcClick') ?? config.get('enableClickToJumpInNcOutput') ?? config.get('enableAutoLineSelection') ?? true;
        if (!enabled)
            return;
        const selectedLine = selection.start.line;
        const clickedChar = selection.start.character;
        const sameLine = selectedLine === this.lastSelectedLine;
        this.lastSelectedLine = selectedLine;
        if (!sameLine) {
            this.amountToMove = 0;
            this.secondClick = false;
        }
        this.parkCursor(editor, selectedLine, clickedChar);
        if (config.get('twoClickLineJumping') && !this.secondClick) {
            this.secondClick = true;
            return;
        }
        const doc = editor.document;
        const path = require('path');
        const norm = (p) => path.normalize((p || '').toLowerCase());
        const isOwnDebugOutput = norm(doc.uri.fsPath) === norm(this.engine.outputPath);
        const stackPath = doc.uri.fsPath + '.stack.json';
        const hasStackFile = isOwnDebugOutput && fs.existsSync(stackPath);
        if (hasStackFile) {
            let lineToMoveTo = 0;
            let postPath = this.engine.getDebugPostPath();
            try {
                const raw = fs.readFileSync(stackPath, 'utf-8');
                const parsed = JSON.parse(raw);
                const stacks = parsed && parsed.stacks;
                if (parsed && parsed.postPath)
                    postPath = postPath || parsed.postPath;
                const offset = postRunner_1.PostEngine.getDebugLineCountBefore(doc.getText(), selectedLine + 1);
                const effectiveLine = Math.max(0, selectedLine - offset);
                const stack = Array.isArray(stacks) ? stacks[effectiveLine] : undefined;
                const stackArr = Array.isArray(stack) ? stack : undefined;
                if (stackArr && stackArr.length > 0 && postPath) {
                    const idx = this.amountToMove % stackArr.length;
                    const entry = stackArr[idx];
                    if (entry && entry.line >= 1) {
                        lineToMoveTo = entry.line;
                    }
                }
            }
            catch {
                // fall back to suffix on line
            }
            if (lineToMoveTo < 1) {
                const lineText = doc.getText(new vscode.Range(selectedLine, 0, selectedLine + 1, 0));
                const lnMatch = /\(→\s+\w+\s+ln:(\d+)\)/.exec(lineText);
                if (lnMatch)
                    lineToMoveTo = parseInt(lnMatch[1], 10);
            }
            if (lineToMoveTo >= 1 && postPath) {
                vscode.commands.executeCommand('autodesk.post.openPostAtLine', postPath, lineToMoveTo);
                this.amountToMove++;
                if (config.get('twoClickLineJumping'))
                    this.secondClick = false;
                return;
            }
        }
        const debugPath = this.engine.debugOutputPath;
        if (!fs.existsSync(debugPath))
            return;
        const data = fs.readFileSync(debugPath, 'utf-8');
        const array = data.split('\n');
        const lineData = [];
        let currentIndex = 0;
        let notNotes = true;
        let moved = false;
        function parseCpsLineFromDebugLine(line) {
            if (!line)
                return 0;
            const m = line.match(/\.cps:(\d+)/i) || line.match(/:(\d+)\s*$/);
            return m ? parseInt(m[1], 10) : 0;
        }
        for (const rawLine of array) {
            const upper = rawLine.toUpperCase();
            if (upper.includes('!DEBUG')) {
                notNotes = true;
                if (upper.includes('NOTES') || upper.includes('MATERIAL')) {
                    notNotes = false;
                }
            }
            if (!upper.includes('!DEBUG') && notNotes && !moved) {
                if (currentIndex === selectedLine) {
                    const stackLines = [];
                    for (let i = lineData.length - 1; i >= 0; i--) {
                        if (!lineData[i].includes('!DEBUG'))
                            break;
                        const ln = parseCpsLineFromDebugLine(lineData[i]);
                        if (ln >= 1)
                            stackLines.push(lineData[i]);
                    }
                    const idx = stackLines.length > 0 ? this.amountToMove % stackLines.length : 0;
                    const lineToMoveTo = stackLines.length > 0 ? parseCpsLineFromDebugLine(stackLines[idx]) : 0;
                    if (lineToMoveTo >= 1) {
                        const postPath = this.engine.getDebugPostPath() || this.engine.postFile;
                        if (postPath) {
                            vscode.commands.executeCommand('autodesk.post.openPostAtLine', postPath, lineToMoveTo);
                        }
                        else {
                            (0, postRunner_1.moveLine)(lineToMoveTo, this.engine.postFile);
                        }
                    }
                    this.amountToMove++;
                    moved = true;
                }
                currentIndex++;
            }
            lineData.push(upper);
        }
    }
}
exports.LineSelection = LineSelection;
//# sourceMappingURL=lineSelection.js.map