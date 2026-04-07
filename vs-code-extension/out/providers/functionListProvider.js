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
exports.FunctionListProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const config = __importStar(require("../config"));
class FunctionNode {
    constructor(symbol) {
        this.symbol = symbol;
        this.children = [];
    }
    addChild(node) {
        this.children.push(node);
    }
    sort() {
        this.children.sort((a, b) => {
            const nameA = a.symbol?.name.toLowerCase() ?? '';
            const nameB = b.symbol?.name.toLowerCase() ?? '';
            return nameA.localeCompare(nameB);
        });
        for (const child of this.children) {
            child.sort();
        }
    }
}
class FunctionListProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.tree = new FunctionNode();
        this.preferredEditor = undefined;
        this.filterText = '';
        vscode.window.onDidChangeActiveTextEditor(e => {
            if (this.preferredEditor && e?.document.uri.fsPath !== this.preferredEditor.document.uri.fsPath)
                this.preferredEditor = undefined;
            if (e)
                this.refresh();
        });
        vscode.workspace.onDidCloseTextDocument(() => this.refresh());
        vscode.workspace.onDidChangeTextDocument(e => {
            if (!e.document.isDirty && this.editor && e.document === this.editor.document) {
                this.refresh();
            }
        });
        vscode.workspace.onDidSaveTextDocument(doc => {
            if (this.editor && doc === this.editor.document)
                this.refresh();
        });
        if (config.get('autoUpdateFunctionList')) {
            vscode.window.onDidChangeTextEditorSelection(e => {
                if (this.editor && e.textEditor.document === this.editor.document) {
                    this.refresh();
                }
            });
        }
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    setPreferredEditor(editor) {
        this.preferredEditor = editor;
    }
    setFilter(text) {
        this.filterText = (text || '').trim().toLowerCase();
        this._onDidChangeTreeData.fire();
    }
    clearFilter() {
        if (this.filterText) {
            this.filterText = '';
            this._onDidChangeTreeData.fire();
        }
    }
    getFilter() {
        return this.filterText;
    }
    async getChildren(node) {
        if (node) {
            return node.children;
        }
        const editor = this.preferredEditor ?? vscode.window.activeTextEditor;
        await this.updateSymbols(editor);
        let children = this.tree.children;
        if (this.filterText) {
            children = this._filterNodes(children, this.filterText);
        }
        return children;
    }
    getTreeItem(node) {
        const sym = node.symbol;
        if (!sym)
            return new vscode.TreeItem('');
        const item = new vscode.TreeItem(sym.name, vscode.TreeItemCollapsibleState.None);
        const range = sym.range;
        const selectedLine = vscode.window.activeTextEditor?.selection.start.line ?? -1;
        const isActive = selectedLine >= range.start.line && selectedLine <= range.end.line;
        item.iconPath = this.getIcon(isActive);
        item.command = {
            command: 'autodesk.post.functionList.revealRange',
            title: '',
            arguments: [this.editor, range],
        };
        return item;
    }
    async updateSymbols(editor) {
        const tree = new FunctionNode();
        this.editor = editor;
        if (!editor) {
            this.tree = tree;
            return;
        }
        let symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', editor.document.uri);
        if (!symbols) {
            this.tree = tree;
            return;
        }
        // Filter to only top-level functions
        const functionKind = vscode.SymbolKind.Function;
        symbols = symbols.filter(s => s.kind === functionKind);
        const nodes = symbols.map(s => new FunctionNode(s));
        const stack = [];
        for (const node of nodes) {
            // Find parent by checking if any stacked node's range contains this node's range
            while (stack.length > 0) {
                const top = stack[stack.length - 1];
                if (top.symbol && node.symbol && top.symbol.range.contains(node.symbol.range)) {
                    break;
                }
                stack.pop();
            }
            if (stack.length === 0) {
                tree.addChild(node);
            }
            else {
                stack[stack.length - 1].addChild(node);
            }
            stack.push(node);
        }
        if (config.get('sortFunctionListAlphabetically')) {
            tree.sort();
        }
        this.tree = tree;
    }
    _filterNodes(nodes, filter) {
        const result = [];
        for (const node of nodes) {
            const name = node.symbol?.name?.toLowerCase() ?? '';
            if (name.includes(filter)) {
                result.push(node);
            }
            else if (node.children.length > 0) {
                const filtered = this._filterNodes(node.children, filter);
                if (filtered.length > 0) {
                    const clone = new FunctionNode(node.symbol);
                    clone.children = filtered;
                    result.push(clone);
                }
            }
        }
        return result;
    }
    getIcon(active) {
        const icon = active ? 'active.svg' : 'func.svg';
        return this.context.asAbsolutePath(path.join('res', 'icons', icon));
    }
}
exports.FunctionListProvider = FunctionListProvider;
//# sourceMappingURL=functionListProvider.js.map