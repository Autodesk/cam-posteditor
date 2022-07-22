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
const resLocation = path.join(vsc.extensions.getExtension("Autodesk.hsm-post-processor").extensionPath, "res");
const settingsLocation = path.join(resLocation, "settings.json");
const os = require('os')
const crypto = require('crypto');
const { strict } = require("assert");
const tmp = os.tmpdir();
// set a location for post properties
const propertyJSONpath = path.join(tmp, "Autodesk", "VSCode", "Properties");
let equal = false;
let postLoc = undefined;
try {
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
            if (vsc.window.activeTextEditor != undefined && vsc.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
                var jsonTemp = getPath().jsonTemp;
                var jsonPath = getPath().jsonPath;
                if (!fs.existsSync(propertyJSONpath)) {
                    if (!fs.existsSync(path.join(tmp, "Autodesk"))) {
                        fs.mkdirSync(path.join(tmp, "Autodesk"))
                    }
                    if (!fs.existsSync(path.join(tmp, "Autodesk", "VSCode"))) {
                        fs.mkdirSync(path.join(tmp, "Autodesk", "VSCode"));
                    }
                    fs.mkdirSync(propertyJSONpath);
                }
                interrogatePost();
                this.checkForDifferences(true, jsonPath, jsonTemp);

                if (!fs.existsSync(jsonPath) || !equal) { // existing user json not found or default properties were modified, start from scratch
                    if (fs.existsSync(jsonTemp)) {
                        var lines = fs.readFileSync(jsonTemp);
                        if (lines.length > 1) {
                            var obj = JSON.parse(lines)
                        } else {
                            vsc.window.showErrorMessage("Failed to read Post Properties.");
                            return;
                        }
                        for (var key in obj.properties) { // extract properties
                            let setting;
                            if (typeof obj.properties[key] === "object") {
                              if (obj.properties[key].value != undefined) {
                                setting = obj.properties[key].value;
                              } else { // property without default value detected 
                                vsc.window.showErrorMessage("Property" + " '" + key + "' " + "is invalid since no default value is defined.");
                                setting = "### ERROR ###"
                              }
                            } else {
                              setting = obj.properties[key];
                            }
                            let treeItem = new vsc.TreeItem(key + " : " + setting);
                            if (obj.hasOwnProperty('propertyDefinitions')) {
                                if (obj.propertyDefinitions[key] != undefined && obj.propertyDefinitions[key].description != undefined) {
                                    treeItem.tooltip = obj.propertyDefinitions[key].description;
                                }
                            } else {
                                if (obj.properties[key] != undefined && obj.properties[key].description != undefined) {
                                    treeItem.tooltip = obj.properties[key].description;
                                }
                            }
                            treeItem.command = {command: "hsm.directSelect", title: "", arguments: [key + " : " + setting]};
                            items.push(treeItem);
                        }
  
                        var JSONData = {"defaults": obj, "changed": obj};
                        this.writeJSON(JSONData);
                    }
                } else {
                    var lines = fs.readFileSync(jsonPath);
                    if (lines.length > 1) {
                        var obj = JSON.parse(lines)
                    }
                    for (var key in obj.changed.properties) { // extract properties
                        let setting;
                        let defaultSetting;
                        if (typeof obj.changed.properties[key] === "object") {
                          if (obj.changed.properties[key].value != undefined) {
                            setting = obj.changed.properties[key].value;
                            defaultSetting = obj.defaults.properties[key].value;
                          } else { // property without default value detected 
                            vsc.window.showErrorMessage("Property" + " '" + key + "' " + "is invalid since no default value is defined.");
                            setting = "### ERROR ###"
                          }
                        } else {
                          setting = obj.changed.properties[key];
                          defaultSetting = obj.defaults.properties[key];
                        }

                        let treeItem = new vsc.TreeItem(key + " : " + setting);
                        if (setting != null && defaultSetting != null) {
                            if (setting.toString() != defaultSetting.toString()) {
                                treeItem.iconPath = this.getIcon();
                            }
                        }
                        if (obj.changed.hasOwnProperty('propertyDefinitions')) {
                            if (obj.changed.propertyDefinitions[key] != undefined && obj.changed.propertyDefinitions[key].description != undefined) {
                                treeItem.tooltip = obj.changed.propertyDefinitions[key].description;
                            }
                        } else {
                            if (obj.changed.properties[key] != undefined && obj.changed.properties[key].description != undefined) {
                                treeItem.tooltip = obj.changed.properties[key].description
                            }
                        }
                        treeItem.command = {command: "hsm.directSelect", title: "", arguments: [key + " : " + setting]};
                        items.push(treeItem);
                    }
                    this.writeJSON(obj);
                }
            }
            const sortProperties = vsc.workspace.getConfiguration("HSMPostUtility").get("sortPropertiesAlphabetically");
            if (sortProperties) {
                items.sort(compare);
            }
            return items;
        }
        getTreeItem(element) {
            return element;
        }
   
        checkForDifferences(skipInterrogate, jsonPath, jsonTemp) {
            if (!skipInterrogate) {
                interrogatePost();
            }
            if (fs.existsSync(jsonPath)) { // check for differences in JSON files
                if (fs.existsSync(jsonTemp)) {
                    var lines = fs.readFileSync(jsonTemp);
                    if (lines.length > 1) {
                        var obj = JSON.parse(lines);
                        var lines1 = Object.entries(obj);
                    }
                    var lines = fs.readFileSync(jsonPath);
                    if (lines.length > 1) {
                        var obj = JSON.parse(lines);
                        var lines2 = Object.entries(obj.defaults);
                    }
                    equal = jsonEqual(lines1, lines2);
  
                    wait(100);
                    if (!equal) {
                        fs.unlinkSync(jsonPath);
                        this._onDidChangeTreeData.fire();
                    } else {
                        if (fs.existsSync(jsonTemp)) {
                            fs.unlinkSync(jsonTemp);
                        }
                    }
                }
            }
        }

        writeJSON(JSONData) {
            var jsonTemp = getPath().jsonTemp;
            if (JSONData == undefined) {
              if (fs.existsSync(jsonTemp)) {
                var lines = fs.readFileSync(jsonTemp);
                if (lines.length > 1) {
                    var obj = JSON.parse(lines)
                    var JSONData = { "defaults": obj, "changed": obj };
                } else {
                    vsc.window.showInformationMessage("Failed to read post properties.");
                    return;
                }
              }
            }

            var file = fs.createWriteStream(getPath().jsonPath);
            file.on('error', function (errors) { })
            file.write(JSON.stringify(JSONData));
            file.end();
            wait(100);
            if (fs.existsSync(jsonTemp)) {
                fs.unlinkSync(jsonTemp);
            }
        }

        refreshTree() {
            if (fs.existsSync(getPath().jsonPath)) {
                fs.unlinkSync(getPath().jsonPath);
            }
            this._onDidChangeTreeData.fire();
        }
        forceInterrogation () {
            interrogatePost();
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

    function getPath() {
        var cpsPath = vsc.window.activeTextEditor.document.fileName.toString();
        var hash = crypto.createHash('md5').update(cpsPath).digest('hex');
        var jsonTemp = path.join(propertyJSONpath, hash + "_temp.json");
        var jsonPath = path.join(propertyJSONpath, hash + ".json");
        return {cpsPath: cpsPath, jsonTemp: jsonTemp, jsonPath: jsonPath};
    }   

    function getPostExePath() {
        if (!postLoc) {
            if (fs.existsSync(settingsLocation)) {
                var lines = fs.readFileSync(settingsLocation);
                if (lines.length > 1) {
                    var sett = JSON.parse(lines);
                    if (sett.postLocation) {
                        postLoc = sett.postLocation;
                        return postLoc;
                    } else {
                        vsc.commands.executeCommand('hsm.findPostExe');
                    }
                }
            } else {
                vsc.commands.executeCommand('hsm.findPostExe');
            }
            return undefined;
        } else {
            return postLoc;
        }
    }

    function interrogatePost() {
        if (getPostExePath() == undefined) {
            return;
        }
        var cpsPath = getPath().cpsPath;
        var jsonTemp = getPath().jsonTemp;
        var child = require('child_process').execFile;
        var executablePath = postLoc;
        var parameters = ["--interrogate", "--quiet", cpsPath, jsonTemp];
        child(executablePath, parameters, function(err, data) {
            if (err) {
                vsc.window.showInformationMessage("Failed to read post properties.");
                return;
            }
        });
        wait(800);
    }

    function compare(a, b) {
        if (a.label < b.label) {
            return -1;
        }
        if (a.label > b.label) {
            return 1;
        }
        return 0;
    }
} catch (e) {
    vsc.window.showErrorMessage(e.toString());
}