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

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const exten = require("./extension");
const process = require("process");
var resLocation = path.join(vscode.extensions.getExtension("Autodesk.hsm-post-processor").extensionPath, "res");
var files = [];
var allFilesName = "All files";
var localFusion = "Local";
try {
    class machineDataProvider {
        constructor(_context) {
            this._context = _context;
            this._onDidChangeTreeData = new vscode.EventEmitter();
            this.onDidChangeTreeData = this._onDidChangeTreeData.event;
            files = [];
            files = findFiles(path.join(resLocation, "Machines"));
            // find all the files defined in the additional folders
            let additionalFolders = vscode.workspace.getConfiguration("AutodeskPostUtility").get("customMachineLocations")
            if (additionalFolders.folders) {
                for (let i = 0; i < additionalFolders.folders.length; ++i) {
                    if (fs.existsSync(additionalFolders.folders[i])) {
                        files = files.concat([[path.basename(additionalFolders.folders[i]),additionalFolders.folders[i]]]);   
                    }
                }
            }
            files.unshift(localFusion);
            files.unshift(allFilesName);
        }

        getChildren(element) {
            var items = [];
            // If nothing is selected, build to root tree
            if (!element) {
                // Create the tree items for all files and folders
                for (let i = 0; i < files.length; ++i) {
                    if (files[i] != allFilesName && files[i] != localFusion) {
                        let treeItem = new vscode.TreeItem(files[i][0], files[i][0].toLowerCase()
                            .includes(".m") ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
                        treeItem.contextValue = "openFolder";
                        treeItem.src = files[i][1];
                        items.push(treeItem);
                    } else {
                        if (files[i] == allFilesName) {
                            let treeItem = new vscode.TreeItem(allFilesName, vscode.TreeItemCollapsibleState.Collapsed);
                            items.push(treeItem);
                        } else {
                            let treeItem = new vscode.TreeItem(localFusion, vscode.TreeItemCollapsibleState.Collapsed);
                            items.push(treeItem);
                        }
                    }
                }
            } else {
                // Find the selected machine file in the files list
                for (let i = 0; i < files.length; ++i) {
                    if (element.label == files[i][0] && element.label != allFilesName && element.label != localFusion) {
                        // set the machine if it's a mahcine file seleced
                        if (files[i][0].toLowerCase().includes(".machine") || files[i][0].toLowerCase().includes(".mch")) {
                            exten.setMachine(files[i][1]);
                        } else {
                            // if not, it's a directory so build up the children
                            let tempFiles = findFiles(files[i][1]);
                            for (let f = 0; f < tempFiles.length; f++) {
                                let treeItem = new vscode.TreeItem(tempFiles[f][0], tempFiles[f][0].toLowerCase()
                                    .includes(".m") ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
                                treeItem.command = { command: "hsm.setMachine", title: "", arguments: [tempFiles[f][1]] };
                                if (tempFiles[f][0].toLocaleLowerCase().includes(".m") && tempFiles[f][1].toLowerCase().includes("custom")) {
                                    treeItem.contextValue = "customFile"; treeItem.src = tempFiles[f][1];
                                }
                                treeItem.src = tempFiles[f][1];
                                items.push(treeItem);
                            }
                            for (var tf = 0; tf < tempFiles.length; tf++) { files.push(tempFiles[tf]); }
                        }
                        break;
                    } else if (element.label == allFilesName) {
                        // display all available machine files
                        if (files[i][0].toLowerCase().includes(".machine") || files[i][0].toLowerCase().includes(".mch")) {
                            exten.setMachine(files[i][1]);
                        } else {
                            let allFiles = getFilesFromDir(path.join(resLocation, "Machines"), [".machine", ".mch"]);;
                            for (let j = 0; j < allFiles.length; ++j) {
                                let fullPath = path.join(resLocation, "Machines", allFiles[j]);
                                let name = allFiles[j].replace(/^.*[\\\/]/, '');
                                let treeItem = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);
                                treeItem.command = { command: "hsm.setMachine", title: "", arguments: [fullPath] };
                                treeItem.src = fullPath;
                                items.push(treeItem);
                            }
                            for (var tf = 0; tf < allFiles.length; tf++) { files.push(allFiles[tf]); }
                        }
                        break;
                    } else if (element.label == localFusion) {
                        // Find all of the machines in the local fusion directory
                        if (files[i][0].toLowerCase().includes(".machine") || files[i][0].toLowerCase().includes(".mch")) {
                            exten.setMachine(files[i][1]);
                        } else {
                            let fusionLocalFolder = "";
                            if (process.platform == "win32") {
                                fusionLocalFolder = path.join(process.env.LOCALAPPDATA, "autodesk", "Autodesk Fusion 360");
                            } else {
                                fusionLocalFolder = path.join(process.env.HOME, "Library", "application support", "autodesk", "CAM360", "machines");
                            }
                            let allFiles = getFilesFromDir(fusionLocalFolder, [".machine", ".mch"]);
                            for (let j = 0; j < allFiles.length; ++j) {
                                let fullPath = path.join(fusionLocalFolder, allFiles[j]);
                                let name = allFiles[j].replace(/^.*[\\\/]/, '');
                                let treeItem = new vscode.TreeItem(name, vscode.TreeItemCollapsibleState.None);
                                treeItem.command = { command: "hsm.setMachine", title: "", arguments: [fullPath] };
                                treeItem.src = fullPath;
                                items.push(treeItem);
                            }
                            for (var tf = 0; tf < allFiles.length; tf++) { files.push(allFiles[tf]); }
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
            files = findFiles(path.join(resLocation, "Machines"));
            files.unshift(localFusion);
            files.unshift(allFilesName);
            this._onDidChangeTreeData.fire();
            let additionalFolders = vscode.workspace.getConfiguration("AutodeskPostUtility").get("customMachineLocations")
            if  (additionalFolders.folders) {
                for (let i = 0; i < additionalFolders.folders.length; i++) {
                    if (fs.existsSync(additionalFolders.folders[i])) {
                        files = files.concat([[path.basename(additionalFolders.folders[i]),additionalFolders.folders[i]]]);   
                    }
                }
            }
        }
         /** Adds a defined folder to the list of machine files */
        addFolder(path) {
            addCustomFolder(path);
        }
    }
    exports.machineDataProvider = machineDataProvider;
    

    /** Adds the defined path to the list of machine files */
    function addCustomFolder(path) {
        let additionalFolders = vscode.workspace.getConfiguration("AutodeskPostUtility").get("customMachineLocations")
        if (!additionalFolders.folders) {
            additionalFolders.folders = []
        }
        additionalFolders.folders.push(path);
        vscode.workspace.getConfiguration("AutodeskPostUtility").update("customMachineLocations", additionalFolders, true);
    }

    /** Finds all files of the defined file type in the specified directory and it's subdirectories */
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

    /** Finds machine diles in the specified directory */
    function findFiles(dir) {
        var machineFiles = getFiles(dir);
        var tempList = [];
        for (var i = 0; i < machineFiles.length; ++i) {
            if (fs.statSync(path.join(dir, machineFiles[i].replace(/^.*[\\\/]/, ''))).isDirectory() || machineFiles[i].toLocaleLowerCase().includes(".mch") || machineFiles[i].toLocaleLowerCase().includes(".machine"))
                tempList.push([machineFiles[i].replace(/^.*[\\\/]/, ''), path.join(dir, machineFiles[i].replace(/^.*[\\\/]/, ''))]);
        }
        return tempList;
    }

    /** Return all files in the defined directroy */
    function getFiles(srcpath) {
        return fs.readdirSync(srcpath);
    }
} catch (e) {
    vscode.window.showErrorMessage(e.toString());
}