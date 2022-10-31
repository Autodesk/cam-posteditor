"use strict";

/*
  Copyright (c) 2017 by Autodesk, Inc.

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

Object.defineProperty(exports, "__esModule", {value: true});
const vsc = require("vscode");
const fs = require("fs");
const path = require("path");

var resLocation = path.join(vsc.extensions.getExtension("Autodesk.hsm-post-processor").extensionPath, "res");

var chmLocation = path.join(resLocation, "varList", "list.txt");
var parents = [];
var setVals = false;
var filter = "";

class variableListDataProvider {
    constructor(_context) {
        this._context = _context;
        this._onDidChangeTreeData = new vsc.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        findVals();
    }

    getChildren(element) {
        var items = [];
        if (!element) {
            for (var i = 0; i < parents.length; ++i) {
                var treeItem = new vsc.TreeItem(parents[i][0], parents[i][1].length > 0 ? vsc.TreeItemCollapsibleState.Collapsed : vsc.TreeItemCollapsibleState.None);
                items.push(treeItem);
            }
        } else {
            for (var i = 0; i < parents.length; ++i) {
                if (element.label == parents[i][0]) {
                    for (var child = 0; child < parents[i][1].length; ++child) {
                        vsc.window.showInformationMessage(parents[i][1][child]);
                        var treeItem = new vsc.TreeItem(parents[i][1][child][0], vsc.TreeItemCollapsibleState.None);
                        treeItem.html = parents[i][1][child][1];    
                        /*treeItem.command = {
                            command: "showCHM",
                            title: "",
                            arguments: [
                                element
                            ]
                        }*/
                        treeItem.contextValue = "child";
                        items.push(treeItem);
                    }
                }
            }
        }
        return items;
    }

    getTreeItem(element) {
        return element;
    }

    _refreshTree() {
        parents = [];
        findVals();
        this._onDidChangeTreeData.fire();
    }

    _filter(filt) {
        filterItems(filt);
        this._onDidChangeTreeData.fire();
    }
}
exports.variableListDataProvider = variableListDataProvider;

function findVals() {
    if (parents.length <= 1) {
        var lines = fs.readFileSync(chmLocation).toString();
        var blocks = lines.split(';');
        for (var i = 0; i < blocks.length; ++i) {
            if (blocks[i].includes("PARENTNAME")) {
                var fullName = blocks[i].split(':')[1];
                var vars = blocks[i].split(':')[2].split(',');
                var deepvars = [];
                for(var v = 0; v < vars.length; v++){
                    deepvars.push([vars[v].split('|')[0], vars[v].split('|')[1]]);
                }
                parents.push([fullName, deepvars]);
            }
        }
    }

}

function filterItems(filter) {
    var parentsToInclude = [];
    findVals();
    for (var i = 0; i < parents.length; ++i) {
        var block = parents[i];
        var parentName = parents[i][0].toString();
        if (parentName.toLowerCase().includes(filter.toString().toLowerCase())) {
            parentsToInclude.push(parentName);
        }
    }
    for (var i = 0; i < parents.length; ++i) {
        for (var c = 0; c < parents[i][1].length; ++c) {
            if (parents[i][1][c][0].toString().toLowerCase().includes(filter.toString().toLowerCase())) {
                var pushParent = true;
                for (var p = 0; p < parentsToInclude.length; ++p) {
                    if (parentsToInclude[p][0] == parents[i][0]) {
                        pushParent = false;
                    }
                }
                if (pushParent) {
                    parentsToInclude.push(parents[i][0]);
                }
            }
        }
    }
    var newParents = [];
    for (var i = 0; i < parents.length; i++) {
        var useParent = false;
        for (var c = 0; c < parentsToInclude.length; ++c) {
            if (parents[i][0] == parentsToInclude[c]) {
                useParent = true;
            }
        }
        var varstr = "";
        if (useParent) {
            var arr = [];
            for (var v = 0; v < parents[i][1].length; ++v) {
                if (parents[i][1][v][0].toLowerCase().includes(filter.toString().toLowerCase()))
                    arr.push([parents[i][1][v][0], parents[i][1][v][1]]);
            }
            newParents.push([parents[i][0].toString(), arr]);
        }
    }
    parents = [];
    for (var i = 0; i < newParents.length; ++i) {
        parents.push(newParents[i]);
    }
}
