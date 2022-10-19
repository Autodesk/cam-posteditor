"use strict";

/*
  Copyright (c) 2022 by Autodesk, Inc.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {try {step(generator.next(value));} catch (e) {reject(e);} }
        function rejected(value) {try {step(generator["throw"](value));} catch (e) {reject(e);} }
        function step(result) {result.done ? resolve(result.value) : new P(function(resolve) {resolve(result.value);}).then(fulfilled, rejected);}
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", {value: true});
const vscode = require("vscode");
const path = require("path");
let topLevel = [];
/** True if the user setting is set to sort alphabetically */
let sortFunctionList = true;
/** True if the user setting wants the function list to automatically update (more resource intensive) */
let autoUpdate = true;
try {
    class functionNode {
        constructor(node) {
            this.funcs = [];
            this.node = node;
        }
        /** Sorts the items */
        sortItems(a, b) {
            if (a.node.name.toLowerCase() > b.node.name.toLowerCase()) {
                return 1;
            }
            return -1;
        }
        addChild(func) {this.funcs.push(func);}
        sort() {
            this.funcs.sort(this.sortItems.bind(this));
            this.funcs.forEach(func => func.sort());
        }
    }
    exports.functionNode = functionNode;
    class functionListProvider {
        constructor(context) {
            this._onDidChangeTreeData = new vscode.EventEmitter();
            this.onDidChangeTreeData = this._onDidChangeTreeData.event;
            this.context = context;
            getSettings();
            // Register the event handlers
            vscode.window.onDidChangeActiveTextEditor(editor => {if (editor) this.refresh();});
            vscode.workspace.onDidCloseTextDocument(document => {if (!this.editor.document) {this.refresh();} });
            vscode.workspace.onDidChangeTextDocument(event => {if (!event.document.isDirty && event.document === this.editor.document) {this.refresh();} });
            if (autoUpdate) {
                vscode.window.onDidChangeTextEditorSelection(event => {if (event.textEditor.document == this.editor.document) {this.refresh();} });
            }
            vscode.workspace.onDidSaveTextDocument(document => {if (document === this.editor.document) {this.refresh();} });
        }

        sortItems(a, b) {
            const startComparison = a.node.location.range.start.compareTo(b.node.location.range.start);
            if (startComparison != 0) return startComparison;
            return b.node.location.range.end.compareTo(a.node.location.range.end);
        }

        updateSymbols(editor) {
            return __awaiter(this, void 0, void 0, function*() {
                const tree = new functionNode();
                this.editor = editor;
                if (editor) {
                    getSettings();
                    /** Contains the functions for the active document */
                    let funcs = yield this.getFunctionList(editor.document);
                    if (!funcs) return;
                    /** Filters out 'lower level' functions so only global functions are shown */
                    if (topLevel.indexOf(-1) < 0) funcs = funcs.filter(func => topLevel.indexOf(func.kind) >= 0);
                    const functions = funcs.map(func => new functionNode(func));
                    let treeFunctions = [];
                    /** Add all the functions to the tree and ensure the range is stored with them */
                    functions.forEach(cfile => {
                        treeFunctions = treeFunctions.
                            filter(cnode => cnode !== cfile && cnode.node.location.range.contains(cfile.node.location.range));
                        if (!treeFunctions.length) {
                            tree.addChild(cfile);
                        }
                        else {
                            const parent = treeFunctions[treeFunctions.length - 1];
                            parent.addChild(cfile);
                        }
                        treeFunctions.push(cfile);
                    });
                    // Sort the function list alphabetically if the user setting is active
                    if (sortFunctionList) {
                        tree.sort();
                    }
                }
                this.tree = tree;
            });
        }
        /** Gets the children of the selected node. Top level functions are shown, so this shouldn't be needed */
        getChildren(node) {
            return __awaiter(this, void 0, void 0, function*() {
                if (node) {
                    return node.funcs;
                }
                else {
                    yield this.updateSymbols(vscode.window.activeTextEditor);
                    return this.tree ? this.tree.funcs : [];
                }
            });
        }
        /** Returns the function list from the vscode document symbol provider */
        getFunctionList(document) {
            return vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri);
        }

        /** Returns the appropriate icon for the function (active or inactive) */
        getIcon(ico) {
            let icon = ico ? 'active.svg' : 'func.svg';
            return this.context.asAbsolutePath(path.join('res', 'icons', icon));
        }

        /** Constructs the tree item for the defined function */
        getTreeItem(funcItem) {
            const {kind} = funcItem.node;
            let treeItem = new vscode.TreeItem(funcItem.node.name);
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            const range = funcItem.node.location.range;
            const selectedLine = vscode.window.activeTextEditor.selection.start.line;
        
            // Sets a custom icon for whichever function the cursor is currently in
            if (selectedLine >= range.start.line && selectedLine <= range.end.line) {
                treeItem.iconPath = this.getIcon(true);
            } else {
                treeItem.iconPath = this.getIcon(false);
            }
            // assigns a range and function to the option in the tree
            treeItem.command = {
                command: 'functionList.revealRange',
                title: '',
                arguments: [
                    this.editor,
                    range
                ]
            };
            return treeItem;
        }
        refresh() {
            this._onDidChangeTreeData.fire();
        }
    }
    exports.functionListProvider = functionListProvider;

    function getNames(names) {
        return names.map(str => {
            let v = vscode.SymbolKind[str];
            return typeof v == "undefined" ? -1 : v;
        });
    }
    /** Gets user defined settings and updates variables */
    function getSettings() {
        let opts = vscode.workspace.getConfiguration("HSMPostUtility");
        sortFunctionList = opts.get("sortFunctionListAlphabetically");
        autoUpdate = opts.get("autoUpdateFunctionList");
        topLevel += getNames(["Function"]);
    }
} catch (e) {
    vscode.window.showErrorMessage(e.toString());
}