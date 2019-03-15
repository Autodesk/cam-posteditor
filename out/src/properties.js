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
const resLocation = vsc.extensions.getExtension("Autodesk.hsm-post-processor").extensionPath + "\\res";
const settingsLocation = resLocation + "\\settings.json";
const os = require('os')
const crypto = require('crypto');;
const tmp = os.tmpdir();
// set a location for post properties
const propertyJSONpath = tmp + "\\Autodesk\\VSCode\\Properties\\";
let equal = false;
let postLoc = undefined;

class propertyDataProvider {
    constructor(_context) {

        vsc.window.onDidChangeActiveTextEditor(editor => {if (editor) this.refresh();});
        vsc.workspace.onDidSaveTextDocument(editor => {if (editor) this.refresh();});
        this._context = _context;
        this._onDidChangeTreeData = new vsc.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    getChildren(element) {
        var items = [];
        var tempJSON;

        if (vsc.window.activeTextEditor != undefined && vsc.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
            if (!fs.existsSync(propertyJSONpath)) {
                if (!fs.existsSync(tmp + "\\Autodesk")) {
                    fs.mkdirSync(tmp + "\\Autodesk")
                }
                if (!fs.existsSync(tmp + "\\Autodesk\\VSCode")) {
                    fs.mkdirSync(tmp + "\\Autodesk\\VSCode");
                }
                fs.mkdirSync(propertyJSONpath);
            }

            let cpsPath = vsc.window.activeTextEditor.document.fileName.toString();
            var hash = crypto.createHash('md5').update(cpsPath).digest('hex');
            var tempJSON = propertyJSONpath + hash + "_temp.json";
            var jsonPath = propertyJSONpath + hash + ".json";

            if (fs.existsSync(settingsLocation)) {
              var lines = fs.readFileSync(settingsLocation);
              if (lines.length > 1) {
                var sett = JSON.parse(lines);
                if (sett.postLocation) postLoc = sett.postLocation;
              }
              if (!fs.existsSync(postLoc)) {
                vsc.commands.executeCommand("hsm.findPostExe");
                return;
              }
            }

            interrogatePost(cpsPath, tempJSON);
            this.checkForDifferences(true);

            if (!fs.existsSync(jsonPath) || !equal) { // existing user json not found or default properties were modified, start from scratch
                var lines = fs.readFileSync(tempJSON);
                if (lines.length > 1) {
                    var obj = JSON.parse(lines)
                } else {
                    vsc.window.showErrorMessage("Failed to read Post Properties.");
                    return;
                }
                for (var key in obj.properties) { // extract properties
                    let treeItem = new vsc.TreeItem(key + " : " + obj.properties[key]);
                    if (obj.hasOwnProperty('propertyDefinitions')) {
                        if (obj.propertyDefinitions[key] != undefined && obj.propertyDefinitions[key].description != undefined) {
                            treeItem.tooltip = obj.propertyDefinitions[key].description;
                        }
                    }
                    treeItem.command = {command: "hsm.directSelect", title: "", arguments: [key + " : " + obj.properties[key]]};
                    items.push(treeItem);
                }

                var JSONData = {"defaults": obj, "changed": obj};
                var file = fs.createWriteStream(jsonPath);
                file.on('error', function(errors) {})
                file.write(JSON.stringify(JSONData));
                file.end();
                wait(100);
                if (fs.existsSync(tempJSON)) {
                  fs.unlinkSync(tempJSON);
                }
            } else {
                var lines = fs.readFileSync(jsonPath);
                if (lines.length > 1) {
                    var obj = JSON.parse(lines)
                }
                for (var key in obj.changed.properties) { // extract properties
                    let treeItem = new vsc.TreeItem(key + " : " + obj.changed.properties[key]);
                    if (obj.changed.properties[key].toString() != obj.defaults.properties[key].toString()) {
                        treeItem.iconPath = this.getIcon();
                    }
                    if (obj.changed.hasOwnProperty('propertyDefinitions')) {
                        if (obj.changed.propertyDefinitions[key] != undefined && obj.changed.propertyDefinitions[key].description != undefined) {
                            treeItem.tooltip = obj.changed.propertyDefinitions[key].description;
                        }
                    }
                    treeItem.command = {command: "hsm.directSelect", title: "", arguments: [key + " : " + obj.changed.properties[key]]};
                    items.push(treeItem);
                }
                var JSONData = obj;
                var file = fs.createWriteStream(jsonPath);
                file.on('error', function(errors) {});
                file.write(JSON.stringify(JSONData));
                file.end();
                if (fs.existsSync(tempJSON)) {
                    fs.unlinkSync(tempJSON);
                }
            }
        }
        return items;
    }
    getTreeItem(element) {
        return element;
    }
   
   checkForDifferences(skipInterrogate) {
       let cpsPath = vsc.window.activeTextEditor.document.fileName.toString();
       var hash = crypto.createHash('md5').update(cpsPath).digest('hex');
       var tempJSON = propertyJSONpath + hash + "_temp.json";
       var jsonPath = propertyJSONpath + hash + ".json";
       
       if (!skipInterrogate) {
         interrogatePost(cpsPath, tempJSON);
       }
       if (fs.existsSync(jsonPath)) { // check for differences in JSON files
           var lines = fs.readFileSync(tempJSON);
           if (lines.length > 1) {
               var obj = JSON.parse(lines);
           }
           var lines1 = Object.entries(obj);

           var lines = fs.readFileSync(jsonPath);
           if (lines.length > 1) {
               var obj = JSON.parse(lines);
           }
           var lines2 = Object.entries(obj.defaults);
           equal = jsonEqual(lines1, lines2);

           wait(100);
           if (!equal) {
               fs.unlinkSync(jsonPath);
               this._onDidChangeTreeData.fire();
           } else {
               if (fs.existsSync(tempJSON)) {
                   fs.unlinkSync(tempJSON);
               }
           }
       }
   }

    refreshTree() {
        let cpsPath = vsc.window.activeTextEditor.document.fileName.toString();
        var hash = crypto.createHash('md5').update(cpsPath).digest('hex');
        var jsonPath = propertyJSONpath + hash + ".json";
        if (fs.existsSync(jsonPath)) {
            fs.unlinkSync(jsonPath);
        }
        this._onDidChangeTreeData.fire();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getIcon() {
        let icon = 'status-modified.svg';
        return this._context.asAbsolutePath(path.join('res', 'icons', icon));
    }
}
exports.propertyDataProvider = propertyDataProvider;

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

function jsonEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function interrogatePost(cpsPath, tempJSON) {
    var child = require('child_process').execFile;
    var executablePath = postLoc;
    var parameters = ["--interrogate", "--quiet", cpsPath, tempJSON];
    child(executablePath, parameters, function(err, data) {
        if (err) {
            vsc.window.showInformationMessage("Failed to read post properties.");
            return;
        }
    });
    wait(400);
}