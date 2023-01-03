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

Object.defineProperty(exports, "__esModule", {value: true});
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const exten = require("./extension");
let resLocation = path.join(vscode.extensions.getExtension("Autodesk.hsm-post-processor").extensionPath, "res");
/** Contains a list of all available CNC files */
let files = [];
let allFilesName = "All files";

class cncDataProvider {
    constructor(_context) {
        this._context = _context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        files = [];
        // find all the files in the default storage location
        files = findFiles(path.join(resLocation, "CNC files"));
        // find all the files defined in the additional folders
        let additionalFolders = vscode.workspace.getConfiguration("AutodeskPostUtility").get("customCNCLocations")
        if (additionalFolders.folders) {
            for (let i = 0; i < additionalFolders.folders.length; ++i) {
                if (fs.existsSync(additionalFolders.folders[i])) {
                    files = files.concat([[path.basename(additionalFolders.folders[i]),additionalFolders.folders[i]]]);   
                }
            }
        }
        files.unshift(allFilesName);
    }
    /** Gets the children of the selected item */
    getChildren(element) {
        let items = [];
        if (!element) {
            for (let i = 0; i < files.length; ++i) {
                if (files[i] != allFilesName) {
                    // Constructs a tree item for the found CNC file
                    let treeItem = new vscode.TreeItem(files[i][0], files[i][0].toLowerCase()
                        .includes(".cnc") ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
                    treeItem.contextValue = "openFolder";
                    treeItem.src = files[i][1];
                    items.push(treeItem);
                } else {
                    let treeItem = new vscode.TreeItem(allFilesName, vscode.TreeItemCollapsibleState.Collapsed);
                    items.push(treeItem);
                }
            }
        } else {
            for (let i = 0; i < files.length; ++i) {
                /** If the element contains .cnc, it's a CNC file. If not, it's a directory */
                if (element.label == files[i][0] && element.label != allFilesName) {
                    if (files[i][0].toLowerCase().includes(".cnc")) {
                        exten.setCNC(files[i][1]);
                    } else {
                        // If a directory, find all appropriate CNC files within that directory
                        let tempFiles = findFiles(files[i][1]);
                        for (let f = 0; f < tempFiles.length; f++) {
                            // Turn off the collapsed state if it's a CNC file, show it if it's a directory (to allow expansion)
                            let treeItem = new vscode.TreeItem(tempFiles[f][0], tempFiles[f][0].toLowerCase()
                                .includes(".cnc") ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
                            // Set the approrate command for when the item is clicked
                            treeItem.command = {command: "hsm.setCNC", title: "", arguments: [tempFiles[f][1]]};
                            if (tempFiles[f][0].toLocaleLowerCase().includes(".cnc") && tempFiles[f][1].toLowerCase().includes("custom")) {
                                // Sets the full path of the CNC file to the 'src' property
                                treeItem.contextValue = "customFile"; treeItem.src = tempFiles[f][1];
                            }
                            items.push(treeItem);
                        }
                        for (let tf = 0; tf < tempFiles.length; tf++) {files.push(tempFiles[tf]);}
                    }
                    break;
                } else if (element.label == allFilesName) {
                    // If the user selects 'allFiles', display a list of every CNC file in all directories
                    if (files[i][0].toLowerCase().includes(".cnc")) {
                        exten.setCNC(files[i][1]);
                    } else {
                        let allFiles = getFilesFromDir(path.join(resLocation, "CNC files"), [".cnc"]);;
                        for (let j = 0; j < allFiles.length; ++j) {
                            let fullPath = path.join(resLocation, "CNC files", allFiles[j]);
                            let name = allFiles[j].replace(/^.*[\\\/]/, '');
                            let treeItem = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);
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

    /** Check all directories again and re-load the tree */
    refreshTree() {
        files = [];
        files = findFiles(path.join(resLocation, "CNC files"));
        files.unshift(allFilesName);
        let additionalFolders = vscode.workspace.getConfiguration("AutodeskPostUtility").get("customCNCLocations")
        if  (additionalFolders.folders) {
            for (let i = 0; i < additionalFolders.folders.length; i++) {
                if (fs.existsSync(additionalFolders.folders[i])) {
                    files = files.concat([[path.basename(additionalFolders.folders[i]),additionalFolders.folders[i]]]);   
                }
            }
        }
        this._onDidChangeTreeData.fire();
    }

    /** Adds a defined folder to the list of CNC files */
    addFolder(path) {
        addCustomFolder(path);
    }
}
exports.cncDataProvider = cncDataProvider;

/** Adds the defined path to the list of CNC files */
function addCustomFolder(path) {
    let additionalFolders = vscode.workspace.getConfiguration("AutodeskPostUtility").get("customCNCLocations")
    if (!additionalFolders.folders) {
        additionalFolders.folders = []
    }
    additionalFolders.folders.push(path);
    vscode.workspace.getConfiguration("AutodeskPostUtility").update("customCNCLocations", additionalFolders, true);
}

/** Returns all the files from within the defined directory */
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

/** Finds the CNC files in the defined directory */
function findFiles(dir) {
   let cncFiles = getFiles(dir);
    let tempList = [];
    for (let i = 0; i < cncFiles.length; ++i) {        
        if (fs.statSync(path.join(dir, cncFiles[i].replace(/^.*[\\\/]/, ''))).isDirectory() || cncFiles[i].toLocaleLowerCase().includes(".cnc")) {
            tempList.push([cncFiles[i].replace(/^.*[\\\/]/, ''), path.join(dir, cncFiles[i].replace(/^.*[\\\/]/, ''))]);
        }
    }   
    return tempList;
}

/** Returns a list of files from tge defined directory */
function getFiles(srcpath) {
    return fs.readdirSync(srcpath);
}
