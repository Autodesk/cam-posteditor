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
const exten = require("./extension");
var resLocation = path.join(vsc.extensions.getExtension("Autodesk.hsm-post-processor").extensionPath, "res");
var files = [];
var allFilesName = "All files";

class cncDataProvider {
    constructor(_context) {
        this._context = _context;
        this._onDidChangeTreeData = new vsc.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        files = [];
        files = findFiles(path.join(resLocation, "CNC files"));
        files.unshift(allFilesName);
    }

    getChildren(element) {
        var items = [];
        if (!element) {
            for (let i = 0; i < files.length; ++i) {
                if (files[i] != allFilesName) {
                    let treeItem = new vsc.TreeItem(files[i][0], files[i][0].toLowerCase()
                        .includes(".cnc") ? vsc.TreeItemCollapsibleState.None : vsc.TreeItemCollapsibleState.Collapsed);
                    treeItem.contextValue = "openFolder";
                    items.push(treeItem);
                } else {
                    let treeItem = new vsc.TreeItem(allFilesName, vsc.TreeItemCollapsibleState.Collapsed);
                    items.push(treeItem);
                }
            }
        } else {
            for (let i = 0; i < files.length; ++i) {
                if (element.label == files[i][0] && element.label != allFilesName) {
                    if (files[i][0].toLowerCase().includes(".cnc")) {
                        exten.setCNC(files[i][1]);
                    } else {
                        let tempFiles = findFiles(files[i][1]);
                        for (let f = 0; f < tempFiles.length; f++) {
                            let treeItem = new vsc.TreeItem(tempFiles[f][0], tempFiles[f][0].toLowerCase()
                                .includes(".cnc") ? vsc.TreeItemCollapsibleState.None : vsc.TreeItemCollapsibleState.Collapsed);
                            treeItem.command = {command: "hsm.setCNC", title: "", arguments: [tempFiles[f][1]]};
                            if (tempFiles[f][0].toLocaleLowerCase().includes(".cnc") && tempFiles[f][1].toLowerCase().includes("custom")) {
                                treeItem.contextValue = "customFile"; treeItem.src = tempFiles[f][1];
                            }
                            items.push(treeItem);
                        }
                        for (var tf = 0; tf < tempFiles.length; tf++) {files.push(tempFiles[tf]);}
                    }
                    break;
                } else if (element.label == allFilesName) {
                    if (files[i][0].toLowerCase().includes(".cnc")) {
                        exten.setCNC(files[i][1]);
                    } else {
                        let allFiles = getFilesFromDir(path.join(resLocation, "CNC files"), [".cnc"]);;
                        for (let j = 0; j < allFiles.length; ++j) {
                            let fullPath = path.join(resLocation, "CNC files", allFiles[j]);
                            let name = allFiles[j].replace(/^.*[\\\/]/, '');
                            let treeItem = new vsc.TreeItem(name, vsc.TreeItemCollapsibleState.None);
                            treeItem.command = {command: "hsm.setCNC", title: "", arguments: [fullPath]};
                            treeItem.src = fullPath;
                            items.push(treeItem);
                        }
                        for (var tf = 0; tf < allFiles.length; tf++) {files.push(allFiles[tf]);}
                    }
                    break;
                }
            }
        }
        return items;

    }

    getTreeItem(element) {
        return element;
    }

    refreshTree() {
        files = [];
        files = findFiles(path.join(resLocation, "CNC files"));
        files.unshift(allFilesName);
        this._onDidChangeTreeData.fire();
    }
}
exports.cncDataProvider = cncDataProvider;

function getFilesFromDir(dir, fileTypes) {
    var filesToReturn = [];
    function walkDir(currentPath) {
        var files = fs.readdirSync(currentPath);
        for (var i in files) {
            var curFile = path.join(currentPath, files[i]);
            if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1) {
                filesToReturn.push(curFile.replace(dir, ''));
            } else if (fs.statSync(curFile).isDirectory()) {
                walkDir(curFile);
            }
        }
    };
    walkDir(dir);
    return filesToReturn;
}

function findFiles(dir) {
    var cncFiles = getFiles(dir);
    var tempList = [];
    for (var i = 0; i < cncFiles.length; ++i) {
        if (fs.statSync(path.join(dir, cncFiles[i].replace(/^.*[\\\/]/, ''))).isDirectory() || cncFiles[i].toLocaleLowerCase().includes(".cnc"))
            tempList.push([cncFiles[i].replace(/^.*[\\\/]/, ''), path.join(dir, cncFiles[i].replace(/^.*[\\\/]/, ''))]);
    }
    return tempList;
}

function findAllFiles(dir) {
    var cncFiles = getFiles(dir);
    var tempList = [];
    for (var i = 0; i < cncFiles.length; ++i) {
        if (fs.statSync(path.join(dir, cncFiles[i].replace(/^.*[\\\/]/, ''))).isDirectory() || cncFiles[i].toLocaleLowerCase().includes(".cnc"))
            tempList.push([cncFiles[i].replace(/^.*[\\\/]/, ''), path.join(dir, cncFiles[i].replace(/^.*[\\\/]/, ''))]);
    }
    return cncFiles;
}

function getFiles(srcpath) {
    return fs.readdirSync(srcpath);
}
