/*
  Copyright (c) 2020 by Autodesk, Inc.

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

// pull the relevant node modules
const vscode = require("vscode");
const fs = require('fs')
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const process = require("process");

// require the sidebar JS file
const functionNodes = require("./functionList");
const variableList = require("./variableList");
const CNCList = require("./cncList");
const machineList = require("./machineList");
const properties = require("./properties");
// store the file information when posting
let cncFile = "";
let postFile = "";
let machineFile = "";
let postLoc = "";
// find and store the location for the application resources
const resLocation = path.join(vscode.extensions.getExtension("Autodesk.hsm-post-processor").extensionPath, "res");
// store the OS temporary directory
const tmp = os.tmpdir();
// set a location for the custom CNC Files
const customCNC = path.join(tmp, "Autodesk", "VSCode", "CustomCNCFiles");
// define location for the settings file. Used to store the post.exe location
const settingsLocation = path.join(resLocation, "settings.json");
// set a location for post properties
const propertyJSONpath = path.join(tmp, "Autodesk", "VSCode", "Properties");
// checks if the same output line has been selected, if it has, the code will jump to the next parent line
let lastSelectedLine = undefined;
let amountToMove = 0;
// if enabled, auto line-selection will occur (when selecting a line in the outputted code)
let enableLineSelection = vscode.workspace.getConfiguration("HSMPostUtility").get("enableAutoLineSelection");
// used to determine whether to show the full debugged code output, or just the generated code
let showDebugOutput = false;
// set the output paths
const outputpath = path.join(tmp, "debuggedfile.nc");
const logPath = path.join(tmp, "debuggedfile.log");
const debugOutputpath = path.join(tmp, "debuggedfile.nc2");
let ListItems = undefined;
// set the location of the stored CNC files
const cncFilesLocation = path.join(resLocation, "CNC files");
let config = vscode.workspace.getConfiguration("HSMPostUtility");
const isMac = os.type() != "Windows_NT";

function activate(context) {
  // delete any properties that have been stored
  vscode.workspace.onDidCloseTextDocument((doc) => {
    var cpsPath = doc.fileName.toString();
    var hash = crypto.createHash("md5").update(cpsPath).digest("hex");
    var jsonPath = propertyJSONpath + hash + ".json";
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
      propertyTree.refresh();
    }
  });


  // set an event handler for the saving of a document. This is used to post on-save
  vscode.workspace.onDidSaveTextDocument(savedoc);
  vscode.window.onDidChangeActiveTextEditor(checkForAutoComplete);
  vscode.window.onDidChangeTextEditorSelection(handleChange);

  checkForAutoComplete();

  // backup cnc files
  copyCNCFiles(path.join(resLocation, "CNC files", "Custom"), customCNC, true); // copy custom cnc files to temporary directory

  // restore cnc files
  if (fs.existsSync(customCNC) && !fs.existsSync(path.join(resLocation, "CNC files", "Custom"))) {
    fs.mkdirSync(path.join(resLocation, "CNC files", "Custom"));
    copyCNCFiles(customCNC, path.join(resLocation, "CNC files", "Custom"), false);
  }
  
  // update the configuration to include the CPS extension
  let currentLanguageConfiguration = vscode.workspace.getConfiguration("files").get("associations");
  let stringLang = "";
  if (currentLanguageConfiguration) {
    stringLang = JSON.stringify(currentLanguageConfiguration);
  }
  if (!stringLang.toLowerCase().includes("*.cps")) {
    const obj = "\"*.cps\": \"javascript\"";
    if (currentLanguageConfiguration) {
      let tempLanguage = JSON.stringify(currentLanguageConfiguration);
      tempLanguage = tempLanguage.substr(0, tempLanguage.length - 1);
      if (tempLanguage.includes(":")) {
        tempLanguage += ",";
      }
      tempLanguage += obj + "}";
      currentLanguageConfiguration = JSON.parse(tempLanguage);
    } else {
      currentLanguageConfiguration = JSON.parse(obj);
    }
    vscode.workspace.getConfiguration("files").update("associations", currentLanguageConfiguration, true);
  }

  const cncTree = new CNCList.cncDataProvider(context);
  vscode.window.registerTreeDataProvider('cncList', cncTree);

  const machineTree = new machineList.machineDataProvider(context);
  vscode.window.registerTreeDataProvider('machineList', machineTree);

  const propertyTree = new properties.propertyDataProvider(context);
  vscode.window.registerTreeDataProvider('propertyList', propertyTree);

  context.subscriptions.push(vscode.commands.registerCommand('propertyList.refreshPropertyList', () => {
    propertyTree.refresh();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('propertyList.checkForDifferences', () => {
    propertyTree.checkForDifferences(false);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('propertyList.initializePropertyList', () => {
    if (getCpsPath() != undefined) {
      if (fs.existsSync(settingsLocation)) {
        var lines = fs.readFileSync(settingsLocation);
        if (lines.length > 1) {
          var sett = JSON.parse(lines);
          if (sett.postLocation) {
            postLoc = sett.postLocation;
          } else {
            locatePostEXE(true);
          }
        }
      } else {
        locatePostEXE(true);
      }
      propertyTree.refreshTree(); // initialize json data
    }
  }));

  const varList = new variableList.variableListDataProvider(context);
  vscode.window.registerTreeDataProvider('variableList', varList);

  context.subscriptions.push(vscode.commands.registerCommand('variableList.searchVars', () => {
    var inputOpts = vscode.InputBoxOptions;
    var opts = inputOpts = {placeHolder: "Enter your search term"};
    vscode.window.showInputBox(opts).then(result => {
      varList._filter(result);
    });
  }));

  context.subscriptions.push(vscode.commands.registerCommand('variableList.clearSearch', () => {
    varList._refreshTree();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.deleteCNCFile', (element) => {
    if (!element) {
      vscode.window.showErrorMessage("This command can only be executed from the CNC selector tree");
      return;
    }
    let src = element.src;
    fs.unlinkSync(src);
    if (fs.existsSync(path.join(customCNC, path.basename(src)))) {
      fs.unlinkSync(path.join(customCNC, path.basename(src)));
    }
    vscode.window.showInformationMessage(element.label + " deleted");
    cncTree.refreshTree();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.openFolder', (element) => {
    if (!element) {
      vscode.window.showErrorMessage("This command can only be executed from the CNC selector tree");
      return;
    }
    let folderLocation = path.join(cncFilesLocation, element.label);

    if (isMac) {
      //os.system("open " + folderLocation)
      //open(cncFilesLocation, { a: "Finder" }, function(error) {vscode.window.showInformationMessage(folderLocation)});
    } else {
      require('child_process').exec('start "" "' + folderLocation + '"');
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.importCNC', (element) => {
    if (!element) {
      vscode.window.showErrorMessage("This command can only be executed from the CNC selector tree");
      return;
    }
    if (!fs.existsSync(path.join(resLocation, "CNC files", "Custom"))) {
      fs.mkdirSync(path.join(resLocation, "CNC files", "Custom"));
      vscode.window.setStatusBarMessage("Custom CNC folder created", 2000);
    }
    var log = "";
    vscode.window.showOpenDialog({openFiles: true, canSelectMany: true, filters: {'HSM intermediate file': ['cnc']}}).then((val) => {
      for (var i = 0; i < val.length; ++i) {
      var selectedPath = val[i].path.substr(1, val[i].path.length);
      if (fs.existsSync(selectedPath)) {
        let copyLocation = path.join(resLocation, "CNC files", "Custom", path.basename(selectedPath));
        copyFile(selectedPath, copyLocation);
        let separator = "";
        if (i < val.length -1) {
          separator = ", ";
        }
        log+= "\"" + path.basename(selectedPath) + "\"" + separator;
      } else {
        vscode.window.showErrorMessage("Import of CNC file(s) failed.");
        return;
      }
    }
    cncTree.refreshTree();
    vscode.window.showInformationMessage("CNC file(s) " + log + " successfully imported.");
    });
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.changePostExe', () => {
      locatePostEXE(false);
  }));
  context.subscriptions.push(vscode.commands.registerCommand("hsm.findPostExe", () => {
    locatePostEXE(true);
  }));
  context.subscriptions.push(vscode.commands.registerCommand("hsm.changeProperty", (element) => {
    if (!element) {
      vscode.window.showErrorMessage("This command can only be executed from the Post Properties tree.");
      return;
    }
    SelectItem(element, false);
  }));

  context.subscriptions.push(vscode.commands.registerCommand("hsm.resetProperty", (element) => {
    if (!element) {
      vscode.window.showErrorMessage("This command can only be executed from the Post Properties tree.");
      return;
    }
    SelectItem(element, true);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.directSelect', element  => {
      SelectItem(element, false);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.downloadCNCExtractor', () => {
    const ncToCopy = path.join(resLocation, "export cnc file to vs code.cps");
    var uri = vscode.Uri.file(ncToCopy);
    uri.path =  path.join(os.userInfo().homedir.toString(), 'export cnc file to vs code.cps');
    vscode.window.showSaveDialog({filters: {'HSM Post Processor': ['cps']}, defaultUri: uri}).then(val => {
      if (val) {
        fs.createReadStream(ncToCopy).pipe(fs.createWriteStream(val.path.substr(1, val.path.length)));
        vscode.window.showInformationMessage("Post saved");
      }
    });
  }));

  context.subscriptions.push(vscode.commands.registerCommand('cncList.refreshCNCList', () => {
    cncTree.refreshTree();
    copyCNCFiles(path.join(resLocation, "CNC files", "Custom"), customCNC, true); // copy custom cnc files to temporary directory
  }));

  context.subscriptions.push(vscode.commands.registerCommand('machineList.refreshMachineList', () => {
    machineTree.refreshTree();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.enableAutoComplete', () => {
    setAutoComplete(true);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.disableAutoComplete', () => {
    setAutoComplete(false);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.setCNC', selectedFile => {
    if (selectedFile.toLowerCase().includes(".cnc")) {
      cncFile = selectedFile;
      vscode.window.setStatusBarMessage("CNC file set", 2000);
      config = vscode.workspace.getConfiguration("HSMPostUtility");
      var postOnSelection = config.get("postOnCNCSelection");
      if (postOnSelection) {
        vscode.commands.executeCommand('HSM.postProcess');
      }
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.setMachine', selectedFile => {
    if (selectedFile.toLowerCase().includes(".machine")) {
      machineFile = selectedFile;
      vscode.window.setStatusBarMessage("Machine file updated", 2000);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.showDebuggedCode', () => {
    vscode.window.showQuickPick(["True", "False"]).then(val => {
      if (val == "True") {
        showDebugOutput = true;
        enableLineSelection = false;
      } else if (val == "False") {
        showDebugOutput = false;
        enableLineSelection = vscode.workspace.getConfiguration("HSMPostUtility").get("enableAutoLineSelection");
      }
    });
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.disableLineSelection', () => {
    vscode.window.showQuickPick(["True", "False"]).then(val => {
      if (val == "True") {
        vscode.workspace.getConfiguration("HSMPostUtility").update("enableAutoLineSelection", false);
        enableLineSelection = false;
      } else if (val == "False") {
        vscode.workspace.getConfiguration("HSMPostUtility").update("enableAutoLineSelection", true);
        if (!showDebugOutput) {
          enableLineSelection = true;
        }
      }
    });
  }));
  
  const functionSelectionProvider = new functionNodes.functionListProvider(context);
  vscode.window.registerTreeDataProvider('functionList', functionSelectionProvider);

  var disposable = vscode.commands.registerCommand('functionList.refreshEntry', () => {
    functionSelectionProvider.refresh();
  });
  context.subscriptions.push(disposable);

  context.subscriptions.push(vscode.commands.registerCommand('HSM.selectCNCFile', () => {
    checkDirSize(cncFilesLocation);
  }));

  context.subscriptions.push(
    vscode.commands.registerCommand('HSM.postProcess', () => {
      if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
        postFile = vscode.window.activeTextEditor.document.fileName.toString();
      }
      if (path.extname(vscode.window.activeTextEditor.document.fileName).toUpperCase() == ".CPS") {
        if (!fs.existsSync(cncFile)) {
          checkDirSize(cncFilesLocation);
        } else {
          if (!postLoc) {
            try {
              if (fs.existsSync(settingsLocation)) {
                var lines = fs.readFileSync(settingsLocation);
                if (lines.length > 1) {
                  var sett = JSON.parse(lines);
                  if (sett.postLocation) postLoc = sett.postLocation;
                }
              } else {
                fs.writeFileSync(settingsLocation, "");
              }
            } catch (e) {
              vscode.window.showErrorMessage(e.toString());
            }
          }

          var postExists = true;
          if (postLoc) {
            if (!fs.existsSync(postLoc)) {
              locatePostEXE(true);
            }
          } else {
            locatePostEXE(true);
          }
          if (postExists) {
            if (cncFile) {
              if (fs.existsSync(cncFile)) {
                var tmpCNC = path.join(tmp, path.basename(cncFile));
                if (!fs.existsSync(tmpCNC)) {
                  copyF(cncFile);
                }
              }
            }
            postProcess(vscode.window.activeTextEditor.document.fileName);
          }
        }
      }
    })
  );


  context.subscriptions.push(vscode.commands.registerCommand('functionList.revealRange', (editor, range) => {
    editor.revealRange(range, vscode.TextEditorRevealType.Default);
    editor.selection = new vscode.Selection(range.start, range.start);
    vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
  }));

  disposable = vscode.commands.registerCommand('extension.startHSMPlugin', function() {

    if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
      postFile = vscode.window.activeTextEditor.document.fileName.toString();
    } else {
      var items = [];
      var opts = QuickPickOptions = {placeHolder: "Select the required command"};
      vscode.window.showQuickPick(items, opts).then(val => {
        onPickedItem(val);
      });

      return;
    }
    try {
      if (fs.existsSync(settingsLocation)) {
        var lines = fs.readFileSync(settingsLocation);
        if (lines.length > 1) {
          var sett = JSON.parse(lines);
          if (sett.postLocation) postLoc = sett.postLocation;
        }
      } else {
        fs.writeFileSync(settingsLocation, "");
      }
    } catch (e) {
      vscode.window.showErrorMessage(e.toString());
    }
    var postExists = true;
    if (postLoc) {
      if (!fs.existsSync(postLoc)) {
        postExists = false
        locatePostEXE(true);
      }
    } else {
      locatePostEXE(true);
      postExists = false;
    }
    if (postExists) {
      if (cncFile) {
        if (fs.existsSync(cncFile)) {
          var tmpCNC = path.join(tmp, path.basename(cncFile));
          if (!fs.existsSync(tmpCNC)) {
            copyF(cncFile);
          }
        }
      }
      vscode.window.setStatusBarMessage("The Autodesk HSM post utility has been loaded", 10000);
      var items = ["Change CNC file", "Post process"];
      var opts = QuickPickOptions = {placeHolder: "Select the required command"};
      vscode.window.showQuickPick(items, opts).then(val => onPickedItem(val));
    }
  });
  context.subscriptions.push(disposable);
}

exports.activate = activate;
function setAutoComplete(active) {
  if ((vscode.window.visibleTextEditors.length <= 0) || (vscode.window.activeTextEditor == undefined)) {
    return;
  }
  if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") < 0) {
    return;
  }
  let firstLine = vscode.window.activeTextEditor.document.lineAt(0).text;
  if (active == "onLoad") {
    active = firstLine.toLowerCase().includes("globals.d.ts");
  }

  if (active) {
    var languageFileLocation = path.join(resLocation, "language files", "globals.d.ts");
    const fullIncludeString = "/// <reference path=\"" + languageFileLocation + "\" />" + "\n";
    // first line already contains auto complete
    if (firstLine.toLowerCase().includes("globals.d.ts")) {
      vscode.window.activeTextEditor.edit(editBuilder => {editBuilder.replace(new vscode.Range(0, 0, 1, 0), fullIncludeString)});
    } else {
      vscode.window.activeTextEditor.edit(editBuilder => {editBuilder.insert(new vscode.Position(0, 0), fullIncludeString);});
    }
  } else if (firstLine.toLowerCase().includes("globals.d.ts")) {
      vscode.window.activeTextEditor.edit(editBuilder => {editBuilder.delete(new vscode.Range(0, 0, 1, 0));});
  }
}

// Show selected item in a message box
function SelectItem(element, reset) {
  if (element.label != undefined) {
    var string = element.label.toString().replace(/\s/g, "").split(":");
  } else {
    var string = element.toString().replace(/\s/g, "").split(":");
  }

  let cpsPath = getCpsPath();
  var hash = crypto.createHash('md5').update(cpsPath).digest('hex');
  var jsonPath = propertyJSONpath + hash + ".json";

  var lines = fs.readFileSync(jsonPath);
  if (lines.length > 1) {
    var obj = JSON.parse(lines);
  } else {
    vscode.window.showErrorMessage("Post processor properties json file not found!");
    return;
  }

  if (reset) {
    obj.changed.properties[string[0]] = obj.defaults.properties[string[0]];
    writeJSON(obj, jsonPath);
    vscode.window.setStatusBarMessage("Reset of property '" + string[0] + "' was successful", 5000);
    return;
  }

  var propertyIds = [];
  for (var key in obj.changed.properties) {
    if (obj.changed.hasOwnProperty('propertyDefinitions')) {
      if (key == string[0] && obj.changed.propertyDefinitions[key] != undefined) {
        if (obj.changed.propertyDefinitions[key].type == "enum") {
          for (var v in obj.changed.propertyDefinitions[key].values) {
            if (obj.changed.propertyDefinitions[key].values[v].id != undefined) {
              propertyIds.push(obj.changed.propertyDefinitions[key].values[v].id);
            } else {
              propertyIds.push(obj.changed.propertyDefinitions[key].values[v]);
            }
          }
        }
      }
    }
  }

  if ((string[1] == "false") || (string[1] == "true") || (propertyIds.length > 1)) {
    if (propertyIds.length > 1) {
      var items = propertyIds;
    } else {
      var items = ["true", "false"];
    }
    var opts = QuickPickOptions = {placeHolder: "'" + string[0] + "'" + " (current setting: '" + string[1] + "')"};
    vscode.window.showQuickPick(items, opts).then((selected) => {
      if (selected != undefined) {
        vscode.window.setStatusBarMessage("Property '" + string[0] + "' successfully changed to '" + selected + "'", 5000);
        if (propertyIds.length > 1) {
          obj.changed.properties[string[0]] = selected;
        } else {
          obj.changed.properties[string[0]] = JSON.parse(selected);
        }
        writeJSON(obj, jsonPath);
      }
    });
  } else { // use input box for values
    var options = {placeHolder: "Specify your value for the property here" + " (current value: '" + string[1] + "')"};
    vscode.window.showInputBox(options).then((input) => {
      if (input != undefined) {
        vscode.window.setStatusBarMessage("Property '" + string[0] + "' successfully changed to '" + input + "'", 5000);
        obj.changed.properties[string[0]] = parseFloat(input);
        writeJSON(obj, jsonPath);
      }
    });
  }
}

function writeJSON(obj, jsonPath) {
  var JSONData = obj;
  var file = fs.createWriteStream(jsonPath);
  file.on('error', function(errors) {});
  file.write(JSON.stringify(JSONData));
  file.end(function() {
    wait(100);
    vscode.commands.executeCommand('propertyList.refreshPropertyList');
    config = vscode.workspace.getConfiguration("HSMPostUtility");
    var postOnPropertyChange = config.get("postOnPropertyChange");
    if (postOnPropertyChange) {
      vscode.commands.executeCommand('HSM.postProcess');
    }
  });
}

function savedoc() {
  var savedDoc = vscode.window.activeTextEditor.document.fileName;
  if (!savedDoc.toLocaleLowerCase().includes("cps")) {
    return;
  }
  var isDebugOpen = false;
  for (var i = 0; i < vscode.window.visibleTextEditors.length; i++) {
    let visibleEditor = vscode.window.visibleTextEditors[i].document.fileName.toLowerCase()
    if (visibleEditor == outputpath.toLowerCase() || visibleEditor == logPath.toLowerCase() || visibleEditor == debugOutputpath.toLowerCase()) {
      isDebugOpen = true;
      if (vscode.window.visibleTextEditors[i].document.isDirty) {
        vscode.window.visibleTextEditors[i].document.save();
      }
    }
  }
  config = vscode.workspace.getConfiguration("HSMPostUtility");
  var postOnSave = config.get("postOnSave");

  if (isDebugOpen && postOnSave) {
    postProcess(savedDoc);
  }

}

function locatePostEXE(val) {
  if (val) {
    if (process.platform == "win32") {
      let fusionDataFile = path.join(process.env.LOCALAPPDATA, "autodesk", "webdeploy", "production", "6a0c9611291d45bb9226980209917c3d", "FusionLauncher.exe.ini");
      if (fs.existsSync(fusionDataFile)) {
        var data = fs.readFileSync(fusionDataFile, "utf16le");
        let lines = data.split("\n");
        for (let j = 0; j < lines.length; ++j) {
          let activeLine = lines[j];
          if (activeLine.toLowerCase().includes("fusion360.exe")) {
            let fusionInstallLocation = activeLine.substring(8, activeLine.length - 16);
            fusionInstallLocation = path.join(fusionInstallLocation, "Applications", "CAM360", "post.exe");
            if (fs.existsSync(fusionInstallLocation)) {
              postLoc = fusionInstallLocation;
              var JSONData = { "postLocation": fusionInstallLocation };
              var file = fs.createWriteStream(settingsLocation);
              file.on('error', function (errors) { });
              file.write(JSON.stringify(JSONData));
              file.end();
              return;
            }
          }
        }
    }
  } else {
      // Autodesk Fusion 360.app
      postLoc = path.join(process.env.HOME, "Library", "application support", "autodesk", "webdeploy", "production", "Autodesk Fusion 360.app", "contents", "libraries", "applications", "CAM360", "post")
      postLoc = fs.realPathSync(postLoc);
      if (fs.existsSync(postLoc)) {
        var JSONData = { "postLocation": postLoc };
        var file = fs.createWriteStream(settingsLocation);
        file.on('error', function (errors) { });
        file.write(JSON.stringify(JSONData));
        file.end();
        return;
      }
    }
    if (!fs.existsSync(postLoc)) {
      vscode.window.showErrorMessage("Post processor executable cannot be found. Please select your post executable location", "Browse...").then((val) => {
        if (val == "Browse...") {
          vscode.window.showOpenDialog({openFiles: true, filters: {}}).then(val => {
            var selectedPath = val[0].path.substr(1, val[0].path.length);
            if (fs.existsSync(selectedPath) && selectedPath.toLowerCase().includes("post")) {
              postLoc = selectedPath;
              var JSONData = {"postLocation": selectedPath};
              var file = fs.createWriteStream(settingsLocation);
              file.on('error', function(errors) {});
              file.write(JSON.stringify(JSONData));
              file.end();
              vscode.window.showInformationMessage("Post processor location updated correctly.")
            } else {
              vscode.window.showInformationMessage("The post EXE you selected is invalid or does not exist.");
            }
            return false;
          });
        }
      });
    }
  } else {
    vscode.window.showInformationMessage("Please select your post excutable", "Browse...").then((val) => {
      if (val == "Browse...") {
        vscode.window.showOpenDialog({openFiles: true, filters: {}}).then(val => {
          var selectedPath = val[0].path.substr(1, val[0].path.length);
          if (fs.existsSync(selectedPath) && selectedPath.toLowerCase().includes("post")) {
            postLoc = selectedPath;
            var JSONData = {"postLocation": selectedPath};
            var file = fs.createWriteStream(settingsLocation);
            file.on('error', function(errors) {});
            file.write(JSON.stringify(JSONData));
            file.end();
            vscode.window.showInformationMessage("Post processor location updated correctly.")
          } else {
            vscode.window.showInformationMessage("The post EXE you selected is invalid or does not exist.");
          }
          return false;
        });
      }
    });
  }
}

let secondClick = false;
let times = 2;
// this seems to get called twice for each event, which is messing things up. Added times mod 2 to only call it once
function handleChange(event) {
  if (event.kind != 2) { // return if TextEditorSelectionChangeKind is not mouse interaction
    return undefined;
  }
  if (vscode.window.activeTextEditor.document.fileName.includes("debuggedfile") && !vscode.window.activeTextEditor.document.fileName.includes(".log") && times % 2 == 0) {
    var selectedLine = vscode.window.activeTextEditor.selection.start.line;
    config = vscode.workspace.getConfiguration("HSMPostUtility");
    let needTwoClicks = config.get("twoClickLineJumping");
    if (selectedLine != lastSelectedLine) {
      amountToMove = 0;
      secondClick = false;
    }

    if (!secondClick && needTwoClicks) {
      secondClick = true;
      lastSelectedLine = selectedLine;
      return;
    }

     fs.readFile(debugOutputpath, function(err, data) {
      if (err) throw err;
      let array = data.toString().split('\n');
      let lineData = [];
      let lineToMoveTo = 0;
      let currentIndex = 0;
      let notNotes = true;
      let moved = false;
      for (let i = 0; i < array.length; i++) {
        // support for notes. These are not output on debug lines, so they must be skipped
        line = array[i].toUpperCase()
        if (line.includes("!DEBUG")) {
          notNotes = true;
          if (line.includes("NOTES") || line.toUpperCase().includes("MATERIAL")) {
            notNotes = false;
          }
        }

        if (!line.includes("!DEBUG") && notNotes && !moved) {
          if (currentIndex == selectedLine) {
            if (selectedLine == lastSelectedLine) {
              try {
                lineToMoveTo = parseInt(lineData[lineData.length - (amountToMove + 1)].split(':')[2]);
                if (isNaN(lineToMoveTo)) {
                  amountToMove = 0;
                  lineToMoveTo = parseInt(lineData[lineData.length - (amountToMove + 1)].split(':')[2]);
                }
              } catch (e) {
                amountToMove = 0;
                lineToMoveTo = parseInt(lineData[lineData.length - (amountToMove + 1)].split(':')[2]);
              }
            }
            moveLine(lineToMoveTo);
            amountToMove = amountToMove + 1;
            moved = true;
          }
          currentIndex += 1;
        }
        lineData.push(line);
      }
    });
    lastSelectedLine = selectedLine;
  }
  times += 1;
}

function checkForAutoComplete(event) {
  setAutoComplete("onLoad");
}

function onPickedItem(picked) {
  if (picked == "Post process") {
    if (!fs.existsSync(cncFile)) {
      checkDirSize(cncFilesLocation);
    } else {
      postProcess(vscode.window.activeTextEditor.document.fileName);
    }

  } else if (picked == "Change CNC file") {
    checkDirSize(cncFilesLocation);
  } else if (picked == "Intelligent Editing") {
    intelEdit();
  }
}

function intelEdit() {
  var tempDoc = tmp + "/" + path.basename(vscode.window.activeTextEditor.document.fileName.toString()) + ".js";
  fs.createReadStream(vscode.window.activeTextEditor.document.fileName.toString()).pipe(fs.createWriteStream(tempDoc));
  vscode.window.showTextDocument(vscode.workspace.openTextDocument(tempDoc), vscode.window.activeTextEditor.viewColumn);
}

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).map(file => path.join(srcpath, file)).filter(path => fs.statSync(path).isDirectory());
}

function selectSub(dir) {
  var dirs = getDirectories(dir);
  var newList = [];
  for (var i = 0; i < dirs.length; i++) {
    var basename = path.basename(dirs[i]);
    newList.push(basename);
  }
  newList.push("Browse...");
  vscode.window.showQuickPick(newList).then(val => {
    if (val == "Browse...") {
      vscode.window.showOpenDialog({openFiles: true, filters: {'CNC Files': ['cnc']}}).then(val => {
        var selectedPath = val[0].path.substr(1, val[0].path.length);
        cncFile = selectedPath;
      });
    } else {
      checkDirSize(path.join(dir, val));
    }
  });
}

function checkDirSize(dir) {
  if (!dir) dir = path.join(resLocation, "CNC files");
  var dirs = getDirectories(dir);
  if (dirs.length > 0) {
    selectSub(dir);
  } else {
    selectCNCFile(dir);
  }
}

function selectCNCFile(p) {
  // create a quick pick for CNC files
  var lists = fs.readdirSync(p);
  ListItems = [];
  for (var i = 0; i < lists.length; i++) {
    if (lists[i].toString().toUpperCase().includes(".CNC")) {
      ListItems.push(path.join(p, path.basename(lists[i].toString())));
    }
  }

  var newList = [];
  for (var i = 0; i < ListItems.length; i++) {
    var basename = path.basename(ListItems[i]);
    newList.push(basename);
  }
  QuickPickOptions = {placeHolder: "Select a the required CNC to post process"};
  vscode.window.showQuickPick(newList).then(val => selectedCNCFile(val, ListItems));
}

function selectedCNCFile(picked, fullList) {
  var itemToUse = undefined;
  for (var i = 0; i < fullList.length; i++) {
    var basename = path.basename(fullList[i]);
    if (picked == basename) itemToUse = fullList[i];
  }
  if (itemToUse) cncFile = itemToUse;
  vscode.commands.executeCommand('HSM.postProcess');
}

function selectUnits() {
  config = vscode.workspace.getConfiguration("HSMPostUtility");
  switch (config.get("outputUnits")) {
    case "MM":
      return 1;
    case "IN":
      return 0;  
    default:
      return 1;
  }
}

function findErrorLine(log) {
  fs.readFile(log, function(err, data) {
    if (err) throw err;
    var array = data.toString().split('\n');
    for (var i = array.length - 1; i > 0; --i) {
      if (array[i].toUpperCase().includes("ERROR(") && array[i].includes("):") && array[i].toUpperCase().includes(".CPS:")) {
        // found the stack dum. error line is next
          let line = array[i];
          let errorLine = line.split(".cps:")[1].split("):")[0];
        moveLine(+errorLine);
        return;
      }
    }
  });
}


function postProcess(postLocation) {
  var child = require('child_process').execFile;
  var executablePath = postLoc;
  var parameters = [];

  if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
    postFile = vscode.window.activeTextEditor.document.fileName.toString();
  }

  config = vscode.workspace.getConfiguration("HSMPostUtility");
  let shorten = config.get("shortenOutputCode");
  let lineLimit = config.get("shortenOutputLineLimit");
  let units = selectUnits();
  if (showDebugOutput) {
    parameters = ["--noeditor", "--debugall", "--property", "unit", units.toString(), "--property", "programName", "1005", postLocation, cncFile, outputpath];
  } else if (shorten) {
    parameters = ["--noeditor", "--debugall", "--shorten", lineLimit, "--property", "unit", units.toString(), "--property", "programName", "1005", postLocation, cncFile, outputpath];
  } else if (!enableLineSelection) {
    parameters = ["--noeditor", "--property", "unit", units.toString(), "--property", "programName", "1005", postLocation, cncFile, outputpath];
  } else {
    parameters = ["--noeditor", "--debugall", "--property", "unit", units.toString(), "--property", "programName", "1005", postLocation, cncFile, outputpath];
  }
  if (machineFile != "") {
    parameters.unshift(machineFile);
    parameters.unshift("--machine");
  }

  vscode.commands.executeCommand('propertyList.checkForDifferences');
  wait(100);

  var hash = crypto.createHash('md5').update(postFile).digest('hex');
  var jsonPath = propertyJSONpath + hash + ".json";
  if (fs.existsSync(jsonPath)) {
    var lines = fs.readFileSync(jsonPath);
    if (lines.length > 1) {
      var obj = JSON.parse(lines);
      if (obj.changed.properties) {
        for (x in obj.changed.properties) {
          if (typeof obj.changed.properties[x] == "string") {
            obj.changed.properties[x] = "'" + obj.changed.properties[x] + "'";
          }
          parameters.push("--property", x, obj.changed.properties[x]);
        }
      }
    }
  }
  var _timeout = config.get("timeoutForPostProcessing");
  _timeout *= 1000; // in seconds
  child(executablePath, parameters, function(err, data) {
    if (err) {
      if (fs.existsSync(logPath)) {
        if (err.signal == "SIGTERM") {
          vscode.window.showErrorMessage("Post processing failed due to timeout.");
        } else {
          vscode.window.showInformationMessage("Post processing failed, see the log for details.");
        }
        vscode.window.showTextDocument(vscode.workspace.openTextDocument(logPath), vscode.ViewColumn.Two, true);
        findErrorLine(logPath);
      } else {
        vscode.window.showInformationMessage("Post processing failed");
      }
      return;
    } else {
      // workaround since VS Code does not refresh the output sometimes
      vscode.window.showTextDocument(vscode.workspace.openTextDocument(logPath), vscode.ViewColumn.Two, true);
    }
    console.log(err)
    console.log(data.toString());

    if (fs.existsSync(outputpath)) {
      if (!showDebugOutput) {
        fs.readFile(outputpath, function(err, data) {
          let array = data.toString().split('\n');
          let lines = "";
          let lineData = "!DEBUG:" + postLocation + '\n';
          let writeOutput = true;
          // filter out debug lines from the new file
          for (var i = 0; i < array.length; i++) {
            let line = array[i].toUpperCase()
            let debugLine = line.includes("!DEBUG")
            if (!writeOutput && debugLine) {
              writeOutput = true;
            }
            if (debugLine && (line.includes("NOTES") || line.includes("MATERIAL"))) {
              writeOutput = false;
            }
            if (!debugLine && writeOutput) {
              type = 0;
              lines = lines + array[i] + '\n';
            }
            lineData += array[i] + '\n';
          }


          wait(200);
          var file = fs.createWriteStream(outputpath);
          file.on('error', function(errors) {});
          file.write(lines);
          file.end(function(finished) {
            wait(150);
            vscode.window.showTextDocument(vscode.workspace.openTextDocument(outputpath), vscode.ViewColumn.Two, true);
          });

          file = fs.createWriteStream(debugOutputpath);
          file.on('error', function(errors) {});
          file.write(lineData);
          file.end();
        });
      } else {
        // wait to ensure posting has finished
        wait(500);
        fs.readFile(outputpath, function(err, data) {
          let output = data;
          var file = fs.createWriteStream(outputpath);
          file.on('error', function(errors) {});
          file.write(output);
          file.end(function(finished) {
            wait(300);
            vscode.window.showTextDocument(vscode.workspace.openTextDocument(outputpath), vscode.ViewColumn.Two, true);
          });
        });
      }
    }
  });
}

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

function moveLine(line) {
  var docFound = false;
  for (var i = 0; i < vscode.window.visibleTextEditors.length; i++) {
    var activeFile = vscode.window.visibleTextEditors[i];
    if (activeFile.document.fileName == postFile) {
      docFound = true;
      if (enableLineSelection) {
        vscode.window.visibleTextEditors[i].selection = new vscode.Selection(new vscode.Position(line - 1, 0), new vscode.Position(line - 1, 1000));
        vscode.window.visibleTextEditors[i].revealRange(vscode.window.visibleTextEditors[i].selection, vscode.TextEditorRevealType.InCenter);
      }
    }
  }

  if (!docFound) {
    if (!enableLineSelection) {
      vscode.window.showErrorMessage("The post processor (" + postFile + ") that created this output has been closed!");
    }
  }
}

function copyF(fileToCopy) {
  //set the path for the temporary post EXE
  var tmpPostFile = tmp + "/" + path.basename(fileToCopy);
  // if the post exe isn't in the temp directory, copy it
  if (!fs.existsSync(tmpPostFile)) {
    fs.createReadStream(fileToCopy).pipe(fs.createWriteStream(tmpPostFile));
  }
}

function copyFile(src, destination) {
  fs.createReadStream(src).pipe(fs.createWriteStream(destination));
}

function copyCNCFiles(source, destination, clear) {
  if (fs.existsSync(path.join(resLocation, "CNC files", "Custom"))) {
    if (!fs.existsSync(customCNC)) { // create temp folder if needed
      const tempLocation = path.join(tmp, "Autodesk");
      if (!fs.existsSync(tempLocation)) {
        fs.mkdirSync(tempLocation)
      }
      if (!fs.existsSync(path.join(tempLocation, "VSCode"))) {
        fs.mkdirSync(path.join(tmp, "Autodesk", "VSCode"));
      }
      fs.mkdirSync(customCNC);
    }
    if (clear) {
      removeFolder(customCNC); // clear cnc files in temporary directory
    }
    copyFolderSync(source, destination);
  }
}

function getCpsPath() {
  let cpsPath;
  if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
    cpsPath = vscode.window.activeTextEditor.document.fileName.toString();
  } else {
    vscode.window.showErrorMessage("The active file is not a post processor file.");
    return undefined;
  }
  return cpsPath;
}

function copyFolderSync(from, to) {
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      if (!fs.existsSync(path.join(to, element))) {
        fs.mkdirSync(path.join(to, element));
      }
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
};

function removeFolder(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((element) => {
      const currentPath = path.join(dir, element);
      if (fs.lstatSync(currentPath).isFile()) {
        fs.unlinkSync(currentPath);
      } else {
        removeFolder(currentPath);
      }
    });
  }
}
 
function deactivate() {
  console.log("Thank you for using the Fusion post development addin!");
}
exports.deactivate = deactivate;
