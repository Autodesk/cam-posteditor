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
const temporaryFolder = path.join(tmp, "Autodesk", "VSCode");
// set a location for the custom CNC Files
const customCNC = path.join(temporaryFolder, "CustomCNCFiles");
const customMachines = path.join(temporaryFolder, "CustomMachineFiles");
// define location for the settings file. Used to store the post.exe location
const settingsLocation = path.join(resLocation, "settings.json");
// set a location for post properties
const propertyJSONpath = path.join(temporaryFolder, "Properties");
// checks if the same output line has been selected, if it has, the code will jump to the next parent line
let lastSelectedLine = undefined;
let amountToMove = 0;
// if enabled, auto line-selection will occur (when selecting a line in the outputted code)
let enableLineSelection = vscode.workspace.getConfiguration("HSMPostUtility").get("enableAutoLineSelection");
// used to determine whether to show the full debugged code output, or just the generated code
let showDebugOutput = false;
// set the output paths
const outputDir = path.join(temporaryFolder, "OutputFiles");
const outputpath = path.join(outputDir, "debuggedfile.nc");
const logPath = path.join(outputDir, "debuggedfile.log");
const debugOutputpath = path.join(outputDir, "debuggedfile.nc2");
let ListItems = undefined;
// set the location of the stored custom files
const cncFilesLocation = path.join(resLocation, "CNC files");
const machineFilesLocation = path.join(resLocation, "Machines");
let config = vscode.workspace.getConfiguration("HSMPostUtility");
const isMac = os.type() != "Windows_NT";

let currentDebugPanel = undefined;
const gcodeDebuggerLocation = path.join(resLocation, "GCodeDebugger/index.html");
let gcontext;

try {
  function activate(context) {
    gcontext = context;
    // delete any properties that have been stored
    vscode.workspace.onDidCloseTextDocument((doc) => {
      var cpsPath = doc.fileName.toString();
      var hash = crypto.createHash("md5").update(cpsPath).digest("hex");
      var jsonPath = path.join(propertyJSONpath, hash + ".json");
      if (fs.existsSync(jsonPath)) {
        fs.unlinkSync(jsonPath);
        propertyTree.refresh();
      }
    });

  // create temporary folder if required
  makeFolder(outputDir);
  makeFolder(propertyJSONpath);

  // set an event handler for the saving of a document. This is used to post on-save
  vscode.workspace.onDidSaveTextDocument(savedoc);
  vscode.window.onDidChangeActiveTextEditor(checkForAutoComplete);
  vscode.window.onDidChangeTextEditorSelection(handleChange);

  checkForAutoComplete();

  // backup cnc and machine files
  copyCustomFiles("cnc", path.join(resLocation, "CNC files", "Custom"), customCNC, true); // copy custom cnc files to temporary directory
  copyCustomFiles("machine", path.join(resLocation, "Machines", "Custom"), customMachines, true); // copy custom machine files to temporary directory

  // restore cnc files
  if (fs.existsSync(customCNC) && !fs.existsSync(path.join(resLocation, "CNC files", "Custom"))) {
    makeFolder(path.join(resLocation, "CNC files", "Custom"));
    copyCustomFiles("cnc", customCNC, path.join(resLocation, "CNC files", "Custom"), false);
  }
  // restore machine files
  if (fs.existsSync(customMachines) && !fs.existsSync(path.join(resLocation, "Machines", "Custom"))) {
    makeFolder(path.join(resLocation, "Machines", "Custom"));
    copyCustomFiles("machine", customMachines, path.join(resLocation, "Machines", "Custom"), false);
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

  context.subscriptions.push(vscode.commands.registerCommand('propertyList.interrogatePost', () => {
    propertyTree.forceInterrogation();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('propertyList.checkForDifferences', () => {
    propertyTree.checkForDifferences(false);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('propertyList.initializePropertyList', () => {
    if (getCpsPath() != undefined) {
      propertyTree.refreshTree(); // initialize json data
    }
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

    if(cncFileStatusBar != undefined && (src.toString() == cncFile.toString())) {
      cncFileStatusBar.hide();
    }
    cncTree.refreshTree();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.deleteMachineFile', (element) => {
    if (!element) {
      vscode.window.showErrorMessage("This command can only be executed from the machine selector tree.");
      return;
    }
    let src = element.src;
    fs.unlinkSync(src);
    if (fs.existsSync(path.join(customMachines, path.basename(src)))) {
      fs.unlinkSync(path.join(customMachines, path.basename(src)));
    }
    vscode.window.showInformationMessage(element.label + " deleted");
    if(src.toString() == machineFile.toString()) {
      vscode.commands.executeCommand('hsm.clearMachineSelection')
    }
    machineTree.refreshTree();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.openFolder', (element) => {
    if (!element) {
      vscode.window.showErrorMessage("This command can only be executed from the CNC selector tree");
      return;
    }
    if (element.src != undefined) {
      let folderLocation = element.src;

      if (isMac) {
        //os.system("open " + folderLocation)
        //open(cncFilesLocation, { a: "Finder" }, function(error) {vscode.window.showInformationMessage(folderLocation)});
      } else {
        require('child_process').exec('start "" "' + folderLocation + '"');
      }
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.editMachineFile', (element) => {
    if (element.src != undefined) {
      var openPath = vscode.Uri.file(element.src);
      vscode.workspace.openTextDocument(openPath).then(doc => {
        vscode.window.showTextDocument(doc);
      });
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.importCNC', (element) => {
    importCustomFile(element, "cncFile")
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.importMachine', (element) => {
    importCustomFile(element, "machineFile");
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.changePostExe', () => {
      locatePostEXE(false);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.updatePostProperties', () => {
    async function fixEOL() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(
              vscode.commands.executeCommand('workbench.action.files.save'),
              vscode.window.activeTextEditor.edit(builder => { builder.setEndOfLine(vscode.EndOfLine.CRLF)})
          );
        }, 100);
      });
    }
    fixEOL().then(function() {
      updatePostProperties();
    });
  }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.foldPropertyList', () => {
    vscode.window.showQuickPick(["Fold", "Unfold"]).then(val => {
      if (val == "Fold") {
        foldPropertyList(true);
      } else if (val == "Unfold") {
        foldPropertyList(false);
      }
    });
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

  context.subscriptions.push(vscode.commands.registerCommand("hsm.clearMachineSelection", () => {
    machineFile = ""; // reset
    vscode.window.setStatusBarMessage("Machine file unselected.", 2000);
    if (machineFileStatusBar != undefined) {
      machineFileStatusBar.hide();
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.directSelect', element  => {
      SelectItem(element, false);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.mergePost', () =>{
    checkPostKernel();
    var child = require('child_process').execFile;
    var executablePath = postLoc;
    var parameters = [];
    var postFile = "";
    if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
      postFile = vscode.window.activeTextEditor.document.fileName.toString();
    }
    var mergeFile = postFile.split(".cps")[0] + ".merge.cps";
    parameters = [postFile, "--merge", mergeFile];
    try {
      var _timeout = config.get("timeoutForPostProcessing");
      _timeout *= 1000; // convert to milliseconds
      child(executablePath, parameters, { timeout: _timeout }, function (err, data) {
        if (err) {
          vscode.window.showErrorMessage("Merge failed.");
        } else {
          vscode.window.showInformationMessage("Merge successful. The merged post can be found in your post processors directory.");
        }
      });
      wait(300);
      vscode.window.showTextDocument(vscode.workspace.openTextDocument(mergeFile), vscode.window.activeTextEditor.viewColumn);
    } catch (e) {
      vscode.window.showInformationMessage(e.toString());
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.encryptPost', () => {
    var options = { placeHolder: "Enter your desired password here" };
    vscode.window.showInputBox(options).then((input) => {
      if (input != undefined && input != "") {
        checkPostKernel();
        var child = require('child_process').execFile;
        var executablePath = postLoc;
        var parameters = [];
        var postFile = "";
        if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
          postFile = vscode.window.activeTextEditor.document.fileName.toString();
        }
        parameters = [postFile, "--encrypt", input];
        try {
          var _timeout = config.get("timeoutForPostProcessing");
          _timeout *= 1000; // convert to milliseconds
          child(executablePath, parameters, { timeout: _timeout }, function (err, data) {
            if (err) {
              vscode.window.showInformationMessage("Encryption failed");
            } else {
              vscode.window.showInformationMessage("Encryption successful. The encrypted post can be found in your post processors directory.");
            }
          });
        } catch (e) {
          vscode.window.showInformationMessage(e.toString());
        }
      }
    })
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.decryptPost', () => {
    if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf("PROTECTED.CPS") >= 0) {
      var postFile = vscode.window.activeTextEditor.document.fileName.toString();
    } else {
      vscode.window.showInformationMessage('Open a .protected.cps file to start decryption');
      return;
    }
    var options = { placeHolder: "Enter the post password" };
    vscode.window.showInputBox(options).then((input) => {
      if (input != undefined && input != "") {
        checkPostKernel();
        var child = require('child_process').execFile;
        var executablePath = postLoc;
        var parameters = [];
        parameters = [postFile, "--decrypt", input];
        try {
          var _timeout = config.get("timeoutForPostProcessing");
          _timeout *= 1000; // convert to milliseconds
          child(executablePath, parameters, { timeout: _timeout }, function (err, data) {
            if (err) {
              vscode.window.showInformationMessage("Decryption failed");
            } else {
              vscode.window.showInformationMessage("Decryption successful. If the password was correct, the unprotected post will be in the same directory as the input protected post.");
            }
          });
        } catch (e) {
          vscode.window.showInformationMessage(e.toString());
        }
      }
    })
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
    copyCustomFiles("cnc", path.join(resLocation, "CNC files", "Custom"), customCNC, true); // copy custom cnc files to temporary directory
  }));

  context.subscriptions.push(vscode.commands.registerCommand('cncList.addFolder', () => {
    vscode.window.showOpenDialog({canSelectFolders: true, canSelectFiles: false}).then(val => {
      var selectedPath = val[0].path.substr(1, val[0].path.length);
      cncTree.addFolder(selectedPath);
      cncTree.refreshTree();
    });
  })); 

  context.subscriptions.push(vscode.commands.registerCommand('machineList.refreshMachineList', () => {
    machineTree.refreshTree();
    copyCustomFiles("machine", path.join(resLocation, "Machines", "Custom"), customMachines, true); // copy custom machine files to temporary directory
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.enableAutoComplete', () => {
    setAutoComplete(true);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.disableAutoComplete', () => {
    setAutoComplete(false);
  }));

  var cncFileStatusBar = undefined;
  context.subscriptions.push(vscode.commands.registerCommand('hsm.setCNC', selectedFile => {
    if (selectedFile.toLowerCase().includes(".cnc")) {
      cncFile = selectedFile;
      vscode.window.setStatusBarMessage("CNC file set", 2000);

      if (cncFileStatusBar == undefined) {
        cncFileStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
      }
      var cncFileName = path.basename(selectedFile,path.extname(selectedFile));
      cncFileStatusBar.text = "CNC file: " + cncFileName;
      cncFileStatusBar.show();

      config = vscode.workspace.getConfiguration("HSMPostUtility");
      var postOnSelection = config.get("postOnCNCSelection");
      if (postOnSelection) {
        vscode.commands.executeCommand('HSM.postProcess');
      }
    }
  }));

  var machineFileStatusBar = undefined;
  context.subscriptions.push(vscode.commands.registerCommand('hsm.setMachine', selectedFile => {
    if (selectedFile.toLowerCase().includes(".machine")) {
      machineFile = selectedFile;
      vscode.window.setStatusBarMessage("Machine file updated", 2000);
      if (machineFileStatusBar == undefined) {
        machineFileStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
      }
      var machineFileName = path.basename(selectedFile,path.extname(selectedFile));
      machineFileStatusBar.text = "Machine: " + machineFileName;
      machineFileStatusBar.show();
      var postOnMachineSelection = config.get("postOnMachineSelection");
      if (postOnMachineSelection) {
        vscode.commands.executeCommand('HSM.postProcess');
      }
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
          checkPostKernel();
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
    checkPostKernel();

    if (cncFile) {
      if (fs.existsSync(cncFile)) {
        var tmpCNC = path.join(tmp, path.basename(cncFile));
        if (!fs.existsSync(tmpCNC)) {
          copyF(cncFile);
        }
      }
    }
    var items = ["Change CNC file", "Post process"];
    var opts = QuickPickOptions = {placeHolder: "Select the required command"};
    vscode.window.showQuickPick(items, opts).then(val => onPickedItem(val));
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
  var jsonPath = path.join(propertyJSONpath, hash + ".json");

  var lines = fs.readFileSync(jsonPath);
  if (lines.length > 1) {
    var obj = JSON.parse(lines);
  } else {
    vscode.window.showErrorMessage("Post processor properties json file not found!");
    return;
  }

  if (reset) {
    if (obj.defaults.properties[string[0]].value != undefined) {
      obj.changed.properties[string[0]].value = obj.defaults.properties[string[0]].value;
    } else {
      obj.changed.properties[string[0]] = obj.defaults.properties[string[0]];
    }
    writeJSON(obj, jsonPath);
    vscode.window.setStatusBarMessage("Reset of property '" + string[0] + "' was successful", 5000);
    return;
  }

  var propertyIds = [];
  for (var key in obj.changed.properties) {
    if (obj.changed.hasOwnProperty('propertyDefinitions')) {
      var propertySelections = obj.changed.propertyDefinitions;
    } else {
      var propertySelections = obj.changed.properties;
    }
    if (key == string[0] && propertySelections[key] != undefined) {
      if (propertySelections[key].type == "enum") {
        for (var v in propertySelections[key].values) {
          if (propertySelections[key].values[v].id != undefined) {
            propertyIds.push({id: propertySelections[key].values[v].id, title:propertySelections[key].values[v].title});
          } else {
            propertyIds.push({id: propertySelections[key].values[v], title: propertySelections[key].values[v]});
          }
        }
      }
    }
  }

  if ((string[1] == "false") || (string[1] == "true") || (propertyIds.length > 1)) {
    if (propertyIds.length > 1) {
      var items = [];
      for (var p in propertyIds) {
        items.push({'description': "(" + propertyIds[p].title + ")",'label': propertyIds[p].id})
      }
    } else {
      var items = ["true", "false"];
    }
    var opts = QuickPickOptions = {placeHolder: "'" + string[0] + "'" + " (current setting: '" + string[1] + "')"};
    vscode.window.showQuickPick(items, opts).then((selected) => {
      if (selected != undefined) {
        var option = selected.label == undefined ? selected : selected.label;
        vscode.window.setStatusBarMessage("Property '" + string[0] + "' successfully changed to '" + option + "'", 5000);
        var selection = propertyIds.length > 1 ? option : JSON.parse(option);
        if (obj.changed.properties[string[0]].value != undefined) {
          obj.changed.properties[string[0]].value = selection
        } else {
          obj.changed.properties[string[0]] = selection
        }
        writeJSON(obj, jsonPath);
      }
    });
  } else { // use input box for values
    var options = {placeHolder: "Specify your value for the property here" + " (current value: '" + string[1] + "')"};
    vscode.window.showInputBox(options).then((input) => {
      if (input != undefined && input != "") {
        vscode.window.setStatusBarMessage("Property '" + string[0] + "' successfully changed to '" + input + "'", 5);
        var inputValue = isNaN(input) ? input : parseFloat(input);
        if (obj.changed.properties[string[0]].value != undefined) {
          obj.changed.properties[string[0]].value = inputValue
        } else {
          obj.changed.properties[string[0]] = inputValue
        }
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

function checkPostKernel(){
  // we first try and read the post location from the settings file
  // if it exists, that is used. If not, we try and automatically detect it using locatePostEXE()
  // if automatic detection doesn't work, locatePostEXE will ask the user to manually select
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
  if (!fs.existsSync(postLoc)) {
    locatePostEXE(true);
  }
}

function writePostToSettings() {
              var JSONData = { "postLocation": postLoc };
              var file = fs.createWriteStream(settingsLocation);
              file.on('error', function (errors) { });
              file.write(JSON.stringify(JSONData));
              file.end();
}

function locatePostEXE(findPostAutomatically) {
  // Try find the fusion install location and use the post exe from there. If we find it, the path is written to user settings
  // if the location isn't found, prompt the user to manually select
  if (findPostAutomatically) {
    if (process.platform == "win32") {
      // ini location should tell us the latest install location
      let fusionDataFile = path.join(process.env.LOCALAPPDATA, "autodesk", "webdeploy", "production", "6a0c9611291d45bb9226980209917c3d", "FusionLauncher.exe.ini");
      if (fs.existsSync(fusionDataFile)) {
        var data = fs.readFileSync(fusionDataFile, "utf16le");
        let lines = data.split("\n");
        // try and find the .exe path
        for (let j = 0; j < lines.length; ++j) {
          let activeLine = lines[j];
          if (activeLine.toLowerCase().includes("fusion360.exe")) {
            // once found, we craft the path of the post.exe
            let fusionInstallLocation = activeLine.substring(8, activeLine.length - 16);
            postLoc = path.join(fusionInstallLocation, "Applications", "CAM360", "post.exe");
            // if the file exists, it will write it to the settings file
            if (fs.existsSync(postLoc)) {
              writePostToSettings();
              return;
            }
          }
        }
      }
    } else {
      postLoc = path.join(process.env.HOME, "Library", "application support", "autodesk", "webdeploy", 
      "production", "Autodesk Fusion 360.app", "contents", "libraries", "applications", "CAM360", "post")
      if (fs.existsSync(postLoc)) {
        writePostToSettings();
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
              writePostToSettings();
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
    vscode.window.showInformationMessage("Please select your post executable", "Browse...").then((val) => {
      if (val == "Browse...") {
        vscode.window.showOpenDialog({openFiles: true, filters: {}}).then(val => {
          var selectedPath = val[0].path.substr(1, val[0].path.length);
          if (fs.existsSync(selectedPath) && selectedPath.toLowerCase().includes("post")) {
            postLoc = selectedPath;
            writePostToSettings();
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

// gets the desired units from the users output settings
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

//  try and find the error line and move the cursor to the appropriate line in the post processor
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

// displays the log file if an issue with posting occurs
function showLogFile(logPath) {
  if (logPath) {
    vscode.workspace.openTextDocument(logPath).then(document => vscode.window.showTextDocument(document, vscode.ViewColumn.Two, true));
    // workaround since VS Code does not refresh the output sometimes
    vscode.window.showTextDocument(logPath, vscode.ViewColumn.Two, true)
  }
}

function postProcess(postLocation) {
  removeFilesInFolder(outputDir) // clear output folder prior posting
  var child = require('child_process').execFile;
  var executablePath = postLoc;
  var parameters = [];
  vscode.commands.executeCommand('notifications.clearAll');


  if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
    postFile = vscode.window.activeTextEditor.document.fileName.toString();
  }

  config = vscode.workspace.getConfiguration("HSMPostUtility");
  let shorten = config.get("shortenOutputCode");
  let lineLimit = config.get("shortenOutputLineLimit");
  let units = selectUnits();
  let newDebugger = config.get("newDebugger", false);
  let debugArg = newDebugger ? "--debugreallyall" : "--debugall";
  if (showDebugOutput) {
    parameters = ["--noeditor", debugArg, "--property", "unit", units.toString(), "--property", "programName", "1005", postLocation, cncFile, outputpath];
  } else if (shorten) {
    parameters = ["--noeditor", debugArg, "--shorten", lineLimit, "--property", "unit", units.toString(), "--property", "programName", "1005", postLocation, cncFile, outputpath];
  } else if (!enableLineSelection) {
    parameters = ["--noeditor", "--property", "unit", units.toString(), "--property", "programName", "1005", postLocation, cncFile, outputpath];
  } else {
    parameters = ["--noeditor", debugArg, "--property", "unit", units.toString(), "--property", "programName", "1005", postLocation, cncFile, outputpath];
  }
  if (machineFile != "") {
    parameters.unshift(machineFile);
    parameters.unshift("--machine");
  }

  vscode.commands.executeCommand('propertyList.checkForDifferences');  // TAG not needed anymore?
  wait(100);

  var hash = crypto.createHash('md5').update(postFile).digest('hex');
  var jsonPath = path.join(propertyJSONpath, hash + ".json");
  if (fs.existsSync(jsonPath)) {
    var lines = fs.readFileSync(jsonPath);
    if (lines.length > 1) {
      var obj = JSON.parse(lines);
      if (obj.changed.properties) {
        for (x in obj.changed.properties) {
          var setting = obj.changed.properties[x].value != undefined ? obj.changed.properties[x].value : obj.changed.properties[x]
          if (typeof setting == "string") {
            setting = "'" + setting + "'";
          }
          parameters.push("--property", x, setting);
        }
      }
    }
  }
  var _timeout = config.get("timeoutForPostProcessing");
  _timeout *= 1000; // convert to milliseconds
  child(executablePath, parameters, {timeout:_timeout}, function(err, data) {
    if (err) {
      if (err.signal == "SIGTERM") {
        vscode.window.showErrorMessage("Post processing failed due to timeout.");
        return;
      }
      if (fs.existsSync(logPath)) {
        vscode.window.showInformationMessage("Post processing failed, see the log for details.");  
        showLogFile(logPath);
        findErrorLine(logPath);
      } else {
        vscode.window.showInformationMessage("Post processing failed.");
      }
      vscode.window.showInformationMessage(data.toString())
      console.log(data.toString());
      return;
    } else {
      if (!newDebugger) {
        // workaround since VS Code does not refresh the output sometimes
        vscode.window.showTextDocument(vscode.workspace.openTextDocument(logPath), vscode.ViewColumn.Two, true);
      }
      
      showLogFile(logPath);
    }

    if (fs.existsSync(outputpath)) {
      if (newDebugger) {
        if (currentDebugPanel) {
          // If we already have a panel, show it in the first column
          currentDebugPanel.reveal(vscode.ViewColumn.One);
        } else {
          // Otherwise, create a new panel
          currentDebugPanel = vscode.window.createWebviewPanel(
            'gcodeDebug',
            'G-Code Debugger',
            vscode.ViewColumn.One,
            {
              enableScripts: true
            }
          );
        }
        currentDebugPanel.webview.html = fs.readFileSync(gcodeDebuggerLocation).toString();
        currentDebugPanel.webview.onDidReceiveMessage(
          message => {
            let result = "";
            try {
              switch (message.request) {
                case 'code':
                  result = fs.readFileSync(postLocation).toString();
                  break;
                case 'output':
                  result = fs.readFileSync(outputpath).toString();
                  break;
                default:
                  throw "Unknown command";
              }
            } catch(e) {
              currentDebugPanel.webview.postMessage({request: message.request, error: e.toString()});
            }
            currentDebugPanel.webview.postMessage({request: message.request, data: result});
          },
          undefined,
          gcontext.subscriptions
        );
        // Reset when the current panel is closed
        currentDebugPanel.onDidDispose(
          () => {
            currentDebugPanel = undefined;
          },
          null,
          gcontext.subscriptions
        );
      } else if (!showDebugOutput) {
        removeDebugLines(outputpath, postLocation);
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

    if (!showDebugOutput) {
      var filesInOutputFolder = [];
      fs.readdirSync(outputDir).forEach(file => {
        let fullPath = path.join(outputDir, file);
        filesInOutputFolder.push(fullPath);
      });

      // find files with names other than debuggedfile, used for posts which output subprograms as separate files
      var files = filesInOutputFolder.filter(function(file) {
        return file.indexOf("debuggedfile") === -1;
      });
  
      for (var i = 0; i < files.length; i++) {
        removeDebugLines(files[i]);
      }
    }
  });
}

// creates a new file that excludes the debug lines outputted for line jumping
function removeDebugLines(outputFile, postLocation) {
  fs.readFile(outputFile, function(err, data) {
    let array = data.toString().split('\n');
    let lines = "";
    let lineData;
    if (postLocation != undefined) {
      lineData = "!DEBUG:" + postLocation + '\n';
    }
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
      if (postLocation != undefined) {
        lineData += array[i] + '\n';
      }
    }
    wait(200);
  
    var file = fs.createWriteStream(outputFile);
    file.on('error', function(errors) {});
    file.write(lines);
    file.end(function(finished) {
      wait(150);
      if (postLocation != undefined) {
        vscode.window.showTextDocument(vscode.workspace.openTextDocument(outputFile), vscode.ViewColumn.Two, true);
      }
    });
    if (postLocation != undefined) {
      file = fs.createWriteStream(debugOutputpath);
      file.on('error', function(errors) {});
      file.write(lineData);
      file.end();
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

// moves the selected position to the desired line in the post processor.
function moveLine(line) {
  var docFound = false;
  for (var i = 0; i < vscode.window.visibleTextEditors.length; i++) {
    var activeFile = vscode.window.visibleTextEditors[i];
    if (activeFile.document.fileName == postFile) {
      docFound = true;
      if (enableLineSelection) {
        // selection event selects from char 0 to 1000 to ensure the full line is highlighted
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

function copyCustomFiles(type, source, destination, clear) {
  var folder = (type == "machine") ? customMachines : customCNC;
  var customFolderName = (type == "machine") ? "Machines" : "CNC files";
  if (fs.existsSync(path.join(resLocation, customFolderName, "Custom"))) {
    if (!fs.existsSync(folder)) { // create temp folder if needed
      makeFolder(folder);
    }
    if (clear) {
      removeFilesInFolder(folder); // clear files in temporary directory
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

function removeFilesInFolder(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((element) => {
      const currentPath = path.join(dir, element);
      if (fs.lstatSync(currentPath).isFile()) {
        fs.unlinkSync(currentPath);
      } else {
        removeFilesInFolder(currentPath);
      }
    });
  }
}

function makeFolder(dir) {
  if (fs.existsSync(dir)) {
    return; // folder already exists
  }
  let tempDir = dir;
  while(!fs.existsSync(path.dirname(tempDir))){
    tempDir = path.dirname(tempDir);
    if(fs.existsSync(path.dirname(tempDir))){
      fs.mkdirSync(tempDir);
      tempDir = dir;
    }
  }
  fs.mkdirSync(dir);

}

function foldPropertyList(fold) {
  for (var i = 0; i < vscode.window.activeTextEditor.document.lineCount; i++) {
    var currentLine = vscode.window.activeTextEditor.document.lineAt(i).text.replace(/\s/g, '');
    if (currentLine.startsWith("properties=")) {
      vscode.window.activeTextEditor.selection = new vscode.Selection(new vscode.Position(i, 0), new vscode.Position(i, 1000));
      if (fold) {
        vscode.commands.executeCommand('editor.foldRecursively');
      } else {
        vscode.commands.executeCommand('editor.unfoldRecursively');
      }
      break;
    }    
  }
}

function updatePostProperties() {
  if (getCpsPath() == undefined) {
    return;
  }
  vscode.commands.executeCommand('propertyList.interrogatePost');
  wait(100);

  var updatedProperties = [];
  var hash = crypto.createHash('md5').update(getCpsPath()).digest('hex');
  var jsonTemp = path.join(propertyJSONpath, hash + "_temp.json");
  if (fs.existsSync(jsonTemp)) {
    var lines = fs.readFileSync(jsonTemp);
    if (lines.length > 1) {
      var obj = JSON.parse(lines);
      if (obj.properties) {
        updatedProperties.push("properties = ") // add properties object to the output
        var newProperties = JSON.stringify(obj.properties, null, 2);
        updatedProperties.push(newProperties.replace(/"(\w+)"\s*:/g, '$1:')) // removes quotation marks from object keys
        updatedProperties.push(";");
      } else {
        vscode.window.showInformationMessage("This post processor does not have any properties defined.");
        return;
      }
    }
    if (fs.existsSync(jsonTemp)) {
      fs.unlinkSync(jsonTemp);
    }
  } else {
    vscode.window.showErrorMessage("Property JSON file does not exist.");
    return;
  }
  fs.readFile(getCpsPath(), function (err, data) {
    if (err) throw err;
    var array = data.toString().split('\n');
    var deleteLine = false;
    var countbrackets = 0;
    var countbrackets2 = 0;
    var insideFunction = false;
    var skipLine = false;
    var skipMultiLine = false;
    var foundProblem = false;
    for (var i = 0; i < array.length; ++i) {
      var str = array[i].replace(/\s/g, ''); // remove any whitespace to use 'str' for comparisons
      if (str.startsWith("function") && str.includes("{")) {
        insideFunction = true;
      }
      if (insideFunction) {
        if (str.startsWith("//")) {
          skipLine = true;
        } 
        if (str.startsWith("/**") || str.startsWith("/*")) {
          skipMultiLine = true;
        }
        if (!skipLine && !skipMultiLine) {
          if (str.includes("{")) {
            ++countbrackets;
          }
          if (str.includes("}")) {
            --countbrackets;
          }
        }
        skipLine = false;
        if (str.includes("*/")) {
          skipMultiLine = false
        }
        if (countbrackets == 0) {
          insideFunction = false;
        }
      }
      if (!insideFunction) {
        if (str.includes("properties=") || str.includes("propertyDefinitions=") ||
          str.startsWith("properties.") || str.startsWith("propertyDefinitions.") ||
          str.startsWith("//user-definedpropertydefinitions")) {
          deleteLine = true;
        }
      }
      if (deleteLine) {
        if (str.includes("{")) {
          ++countbrackets2;
        }
        if (str.includes("}")) {
          --countbrackets2;
        }
        if (countbrackets2 == 0) {
          deleteLine = false; // end of object
        }
        if (deleteLine) {
          array[i] = ''
          continue;
        } else {
          array[i] = updatedProperties.join(''); // adds new property object to the cps file
          updatedProperties = [];
        }
      }
      var isAssignment = false;
      var remainingString = "";
      if (array[i].includes("properties.")) {
        isAssignment = str.search(/^properties.*?(?==)|properties[=\n\r]/gm) > -1;
        if (isAssignment) {
          var propertyKey = str.slice(str.indexOf(".") + 1, str.indexOf("="));

          var endPosition = array[i].slice(array[i].indexOf("=") + 1).search(/[*\;/]/g) // find semicolon or begin of comment
          if (endPosition == -1) {
            endPosition = array[i].length;
          }   
          propertyValue = array[i].slice(array[i].indexOf("=") + 1).substring(0, endPosition).replace(/\n|\r/g, "");

          if (str.slice(str.indexOf("=")).search(/[*\;/]/g) > -1) { // extract remaining line, stop if there is a comment or semicolon
            remainingString = array[i].substring(array[i].search(/[*\;/]/g)).replace(/\n|\r/g, '');
          }
          if (propertyKey == "" || propertyValue == "") {
            vscode.window.showInformationMessage("Failed to read property " + "\"" + propertyKey + "\" " + propertyValue + " in line " + (i + 1));
            array[i] = "ERROR" + str + '\n'; // add error text to the output line
            foundProblem = true;
            continue;
          }
          array[i].search(/^(\s*)/);
          var leadingSpaces = RegExp.$1;
          array[i] = leadingSpaces + "setProperty(\"" + propertyKey + "\"," + propertyValue + ")" + remainingString + '\n';
        }
        if (!array[i].includes("error") && !array[i].includes("warning") && !array[i].includes("longDescription")) { // skip post error / warning message lines
          // var re = /properties.(.?[^\s\)\],.;+}*]*)/g; // regex to find property object name
					var re = /properties.(.?[^\s\)\],.+;}*-]*)/g; // regex to find property object name
          var numberOfMatches = (array[i].match(re) || []).length;
          for (var j = 0; j < numberOfMatches; ++j) {
            array[i].search(re);
            array[i] = array[i].replace("properties." + RegExp.$1, "getProperty(\"" + RegExp.$1 + "\")");
          }
        }
      }
      if (str.includes("minimumRevision")) {
        var minimumRev = str.match(/[0-9][0-9][0-9][0-9][0-9]/g);
        var requiredRev = 45702; // new minimum required version to support getProperty()
        if (parseInt(minimumRev) < requiredRev) {
          array[i] = str.replace("minimumRevision=" + minimumRev.toString(), "minimumRevision = " + requiredRev) + '\n';
        } 
      }
      array[i] = array[i].replace('\r', '\r\n'); // fix CRLF for each line
    }
    array.push('\r\n' +
      "function setProperty(property, value) {" + '\r\n' +
      "  properties[property].current = value;" + '\r\n' +
      "}" + '\r\n'
    );

    var fileName = path.basename(getCpsPath());
    var currentFolder = path.dirname(getCpsPath());
    var targetFolder = path.join(currentFolder, "updatedPosts");
    if (!fs.existsSync(targetFolder)) {
      makeFolder(targetFolder);
    }
    var cpsFilePath = path.join(targetFolder, fileName);
    var file = fs.createWriteStream(cpsFilePath);
    file.on('error', function (errors) { });
    file.write(array.join(''));
    file.end();
    if (!foundProblem) {
      vscode.window.showInformationMessage("Success, the updated postprocessor is located here: " + cpsFilePath);
    } else {
      vscode.window.showInformationMessage("Completed with errors, the updated postprocessor is located here: " + cpsFilePath);
    }
  });
}

function importCustomFile(element, type) {
  var fileType = (type == "machineFile") ? "Machine" : "CNC";
  var fileFilter;
  if (type == "machineFile") {
    fileFilter = {'Machine Configuration file': ['machine']};
  } else {
    fileFilter = {'HSM intermediate file': ['cnc']};
  }
  var customFolderName = (type == "machineFile") ? "Machines" : "CNC files";

  if (!element) {
    vscode.window.showErrorMessage("This command can only be executed from the left hand menu tree.");
    return;
  }

  if (!fs.existsSync(path.join(resLocation, customFolderName, "Custom"))) {
    makeFolder(path.join(resLocation, customFolderName, "Custom"));
    vscode.window.setStatusBarMessage("Custom folder created", 2000);
  }
  var log = "";
  vscode.window.showOpenDialog({openFiles: true, canSelectMany: true, filters: fileFilter}).then((val) => {
    for (var i = 0; i < val.length; ++i) {
      var selectedPath = val[i].path.substr(1, val[i].path.length);
      if (fs.existsSync(selectedPath)) {
        let copyLocation = path.join(resLocation, customFolderName, "Custom", path.basename(selectedPath));
        copyFile(selectedPath, copyLocation);
        let separator = "";
        if (i < val.length -1) {
          separator = ", ";
        }
        log+= "\"" + path.basename(selectedPath) + "\"" + separator;
      } else {
        vscode.window.showErrorMessage("Import of " + fileType + " file(s) failed.");
        return;
      }
    }
    vscode.window.showInformationMessage(fileType + " file(s) " + log + " successfully imported.");
    if (type == "machineFile") {
      vscode.commands.executeCommand('machineList.refreshMachineList');
    } else {
      vscode.commands.executeCommand('cncList.refreshCNCList');
    }
  });
}

function msg(message) {
  vscode.window.showInformationMessage(message);
}

function deactivate() {
  console.log("Thank you for using the Fusion post development addin!");
}
exports.deactivate = deactivate;
} catch (e) {
  vscode.window.showErrorMessage("Addin failed to load: " + e.toString());
}