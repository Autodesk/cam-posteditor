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
const {dir} = require("console");
let resLocation = path.join(vsc.extensions.getExtension("Autodesk.hsm-post-processor").extensionPath, "res");
let additionalFolders = path.join(resLocation, "CNC files", "customLocations.json");
let files = [];
let allFilesName = "All files";

class cncDataProvider {
    constructor(_context) {
        this._context = _context;
        this._onDidChangeTreeData = new vsc.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        files = [];
        files = findFiles(path.join(resLocation, "CNC files"), false);
        if (fs.existsSync(additionalFolders)) {
            let lines = fs.readFileSync(additionalFolders);
            if (lines.length > 1) {
                let lineJson = JSON.parse(lines);
                for (let i = 0; i < lineJson.folders.length; ++i) {
                    if (fs.existsSync(lineJson.folders[i])) {
                        files = files.concat([[path.basename(lineJson.folders[i]),lineJson.folders[i]]]);   
                    }
                }
            }
        }
        files.unshift(allFilesName);
    }

    getChildren(element) {
        let items = [];
        if (!element) {
            for (let i = 0; i < files.length; ++i) {
                if (files[i] != allFilesName) {
                    let treeItem = new vsc.TreeItem(files[i][0], files[i][0].toLowerCase()
                        .includes(".cnc") ? vsc.TreeItemCollapsibleState.None : vsc.TreeItemCollapsibleState.Collapsed);
                    treeItem.contextValue = "openFolder";
                    treeItem.src = files[i][1];
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
                        let tempFiles = findFiles(files[i][1], false);
                        for (let f = 0; f < tempFiles.length; f++) {
                            let treeItem = new vsc.TreeItem(tempFiles[f][0], tempFiles[f][0].toLowerCase()
                                .includes(".cnc") ? vsc.TreeItemCollapsibleState.None : vsc.TreeItemCollapsibleState.Collapsed);
                            treeItem.command = {command: "hsm.setCNC", title: "", arguments: [tempFiles[f][1]]};
                            if (tempFiles[f][0].toLocaleLowerCase().includes(".cnc") && tempFiles[f][1].toLowerCase().includes("custom")) {
                                treeItem.contextValue = "customFile"; treeItem.src = tempFiles[f][1];
                            }
                            items.push(treeItem);
                        }
                        for (let tf = 0; tf < tempFiles.length; tf++) {files.push(tempFiles[tf]);}
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
                        for (let tf = 0; tf < allFiles.length; tf++) {files.push(allFiles[tf]);}
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
        files = findFiles(path.join(resLocation, "CNC files"), false);
        files.unshift(allFilesName);
        if (fs.existsSync(additionalFolders)) {
            let lines = fs.readFileSync(additionalFolders);
            if (lines.length > 1) {
                let lineJson = JSON.parse(lines);
                for (let i = 0; i < lineJson.folders.length; ++i) {
                    if (fs.existsSync(lineJson.folders[i])) {
                        files = files.concat([[path.basename(lineJson.folders[i]),lineJson.folders[i]]]);   
                    }
                }
            }
        }
        this._onDidChangeTreeData.fire();
    }

    addFolder(path) {
        addCustomFolder(path);
    }
}
exports.cncDataProvider = cncDataProvider;

function addCustomFolder(path) {
    let json = {"folders": []};
    if (fs.existsSync(additionalFolders)) {
        let lines = fs.readFileSync(additionalFolders);
        if (lines.length > 1) {
            json = JSON.parse(lines);
        }
    }
    json.folders.push(path);
    fs.writeFileSync(additionalFolders, JSON.stringify(json));
}


function msg(message) {
    vsc.window.showInformationMessage(message.toString());
}

function getFilesFromDir(dir, fileTypes) {
    let filesToReturn = [];
    function walkDir(currentPath) {
        let files = fs.readdirSync(currentPath);
        for (let i in files) {
            let curFile = path.join(currentPath, files[i]);
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

function findFiles(dir, isCustom) {
   let cncFiles = getFiles(dir);
    let tempList = [];
    for (let i = 0; i < cncFiles.length; ++i) {        
        if (fs.statSync(path.join(dir, cncFiles[i].replace(/^.*[\\\/]/, ''))).isDirectory() || cncFiles[i].toLocaleLowerCase().includes(".cnc")) {
            tempList.push([cncFiles[i].replace(/^.*[\\\/]/, ''), path.join(dir, cncFiles[i].replace(/^.*[\\\/]/, ''))]);
        }
    }   
    return tempList;
}

function findAllFiles(dir) {
    let cncFiles = getFiles(dir);
    let tempList = [];
    for (let i = 0; i < cncFiles.length; ++i) {
        if (fs.statSync(path.join(dir, cncFiles[i].replace(/^.*[\\\/]/, ''))).isDirectory() || cncFiles[i].toLocaleLowerCase().includes(".cnc"))
            tempList.push([cncFiles[i].replace(/^.*[\\\/]/, ''), path.join(dir, cncFiles[i].replace(/^.*[\\\/]/, ''))]);
    }
    return cncFiles;
}

function getFiles(srcpath) {
    return fs.readdirSync(srcpath);
}
