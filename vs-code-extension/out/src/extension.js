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


/** Function sidebar */
const functionNodes = require("./functionList");
/** CNC sidebar */
const CNCList = require("./cncList");
/** Machine sidebar */
const machineList = require("./machineList");
/** Property sidebar */
const properties = require("./properties");
const { log } = require("console");
/** List of supported machine file extensions */
const machineFileExtensions = [".machine", ".mch"];

/** Location of the selected CNC file */
let cncFile = "";
/** Location of the active post script */
let postFile = "";
/** Location of the selected machine file */
let machineFile = "";
/** Location of the post executable */
let postExecutable = "";
/** Location of the secondary post executable */
let secondaryPostExecutable = "";
// find and store the location for the application resources
let resLocation = path.join(vscode.extensions.getExtension("Autodesk.hsm-post-processor").extensionPath, "res");
/** The operating systems temporary directory */
let tmp = os.tmpdir();
/** Temporary directory to store data */
let temporaryFolder =  path.join(tmp, "AutodeskPostUtility");
/** Location for the custom CNC files to be stored */
let customCNC = path.join(temporaryFolder, "CustomCNCFiles");
/** Location for the custom machine files to be stored */
let customMachines = path.join(temporaryFolder, "CustomMachineFiles");
/** Temporary location for storing the property JSON */
let propertyJSONpath = path.join(temporaryFolder, "Properties");
/** The directory where all code will be output to */
let outputDir = path.join(temporaryFolder, "OutputFiles")
/** The path containing the NC code */;
let outputpath = path.join(outputDir, "debuggedfile.nc");
/** The path containing the post process log */
let logPath = path.join(outputDir, "debuggedfile.log");
/** The path containing the full debug posted output */
let debugOutputpath = path.join(outputDir, "debuggedfile.nc2");
/** The path containing the NC code from the secondary post exe */;
let secondaryoutputpath = path.join(outputDir, "secondarydebuggedfile.nc");
/** The path containing the secondary post process log */
let secondaryLogPath = path.join(outputDir, "secondarydebuggedfile.log");
/** Set the location of the stored custom files */
let cncFilesLocation = path.join(resLocation, "CNC files");
/** Object for accessing user preferences */
let config = vscode.workspace.getConfiguration("AutodeskPostUtility");
/** checks if the same output line has been selected, if it has, the code will jump to the next parent line */
let lastSelectedLine = undefined;
/** A counter that indicates the current depth of the stack-trace */
let amountToMove = 0;
/** if enabled, auto line-selection will occur (when selecting a line in the outputted code) */
let enableLineSelection = vscode.workspace.getConfiguration("AutodeskPostUtility").get("enableAutoLineSelection");
/** Stores the active debug window */
let currentDebugPanel = undefined;
/** Location of the gcode debugging utility */
const gcodeDebuggerLocation = path.join(resLocation, "g-code-debugger" , "index.html");
let gcontext;
let cncTree, machineTree, propertyTree, functionSelectionProvider;

/** Activates the add-in and initializes all user options */
function activate(context) {
  gcontext = context;

  // create temporary folder if required
  makeFolder(outputDir);

  // registering the appropriate event handlers
  vscode.workspace.onDidSaveTextDocument(savedoc);
  vscode.window.onDidChangeActiveTextEditor(checkForAutoComplete);
  vscode.window.onDidChangeActiveTextEditor(setEmbeddedEslintRules);
  vscode.window.onDidChangeTextEditorSelection(handleSelectionChange);
  cleanupProperties();

  // Ensure autocomplete uses the correct path (if active)
  checkForAutoComplete();
  // Backup cnc and machine files
  backupCustomData();
  // Restore any custom data that might have been lost
  restoreCustomData();

  // update the configuration to include the CPS extension
  addCPSToJSLanguage();

  // add sidebars
  cncTree = new CNCList.cncDataProvider(context);
  vscode.window.registerTreeDataProvider('cncList', cncTree);
  machineTree = new machineList.machineDataProvider(context);
  vscode.window.registerTreeDataProvider('machineList', machineTree);
  propertyTree = new properties.propertyDataProvider(context);
  vscode.window.registerTreeDataProvider('propertyList', propertyTree);
  functionSelectionProvider = new functionNodes.functionListProvider(context);
  vscode.window.registerTreeDataProvider('functionList', functionSelectionProvider);

  /** Register all commands */
  context.subscriptions.push(vscode.commands.registerCommand('propertyList.refreshPropertyList', () => { propertyTree.refresh() }));
  context.subscriptions.push(vscode.commands.registerCommand('propertyList.interrogatePost', () => { propertyTree.forceInterrogation() }));
  context.subscriptions.push(vscode.commands.registerCommand('propertyList.checkForDifferences', () => { propertyTree.checkForDifferences(false, false) }));
  context.subscriptions.push(vscode.commands.registerCommand('propertyList.checkForDifferencesSecondary', () => { propertyTree.checkForDifferences(false, true) }));
  context.subscriptions.push(vscode.commands.registerCommand('propertyList.initializePropertyList', () => { propertyTree.refreshTree() }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.importCNC', () => { importCustomFile("cncFile") }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.importMachine', () => { importCustomFile("machineFile") }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.changePostExe', () => { locatePostEXE(false) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.changeSecondaryPostExe', () => { locateSecondaryPostEXE(false) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.findPostExe', () => { checkPostKernel() }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.deleteCNCFile', (element) => { deleteCNCFile(element.src) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.deleteMachineFile', (element) => { deleteMachineFile(element.src) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.openFolder', (element) => { openFolder(element.src) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.foldPropertyList', () => { foldPropertyList() }));
  context.subscriptions.push(vscode.commands.registerCommand("hsm.changeProperty", (element) => { selectItem(element, false) }));
  context.subscriptions.push(vscode.commands.registerCommand("hsm.resetProperty", (element) => { selectItem(element, true) }));
  context.subscriptions.push(vscode.commands.registerCommand("hsm.clearMachineSelection", () => { clearMachineSelection() }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.directSelect', element => { selectItem(element, false) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.mergePost', () => { mergePost() }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.showPostEngineVersion', () => { showPostEngineVersion() }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.encryptPost', () => { postEncryption(true); }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.decryptPost', () => { postEncryption(false); }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.downloadCNCExtractor', () => { downloadCNCExtractor() }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.enableAutoComplete', () => { setAutoComplete(true) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.disableAutoComplete', () => { setAutoComplete(false) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.selectCNCFile', () => { checkDirSize(cncFilesLocation) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.showDebuggedCode', () => { showDebuggedCode() }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.disableLineSelection', () => { disableLineSelection() }));
  context.subscriptions.push(vscode.commands.registerCommand('functionList.refreshEntry', () => { functionSelectionProvider.refresh() }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.editMachineFile', (element) => { editMachineFile(element.src) }));
  context.subscriptions.push(vscode.commands.registerCommand('cncList.refreshCNCList', () => { cncTree.refreshTree() }));
  context.subscriptions.push(vscode.commands.registerCommand('cncList.addFolder', () => { addFolderToCNCTree() }));
  context.subscriptions.push(vscode.commands.registerCommand('machineList.refreshMachineList', () => { machineTree.refreshTree() }));
  context.subscriptions.push(vscode.commands.registerCommand('machineList.addFolder', () => { addFolderToMachineTree() }));  
  context.subscriptions.push(vscode.commands.registerCommand('hsm.setCNC', selectedFile => { setCNCFile(selectedFile) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.setMachine', selectedFile => { setMachineFile(selectedFile) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.postProcess', () => { postProcess(vscode.window.activeTextEditor.document.fileName) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.postCompare', () => { postCompare(vscode.window.activeTextEditor.document.fileName) }));
  context.subscriptions.push(vscode.commands.registerCommand('hsm.setIncludePath', () => { setIncludePath(); }))
  context.subscriptions.push(vscode.commands.registerCommand('hsm.updatePostProperties', () => { updatePostProperties() }));
  context.subscriptions.push(vscode.commands.registerCommand('functionList.revealRange', (editor, range) => { highlightRange(editor, range) }));
  context.subscriptions.push(vscode.commands.registerCommand('extension.startHSMPlugin', () => { generalExtensionOptions() }));
}

exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;

/** Enables auto-complete for the active document */
function setAutoComplete(active) {
  if ((vscode.window.visibleTextEditors.length <= 0) ||
    (vscode.window.activeTextEditor == undefined) ||
    !checkActiveDocumentForPost()) {
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
      vscode.window.activeTextEditor.edit(editBuilder => { editBuilder.replace(new vscode.Range(0, 0, 1, 0), fullIncludeString) });
    } else {
      vscode.window.activeTextEditor.edit(editBuilder => { editBuilder.insert(new vscode.Position(0, 0), fullIncludeString); });
    }
  } else if (firstLine.toLowerCase().includes("globals.d.ts")) {
    vscode.window.activeTextEditor.edit(editBuilder => { editBuilder.delete(new vscode.Range(0, 0, 1, 0)); });
  }
}

/** Sets an option to show the debugged code in the output */
function showDebuggedCode() {
  vscode.window.showQuickPick(["True", "False"]).then(val => {
    if (val == "True") {
      enableLineSelection = false;
      vscode.workspace.getConfiguration("AutodeskPostUtility").update("showDebuggedCode", true, true);
    } else if (val == "False") {
      vscode.workspace.getConfiguration("AutodeskPostUtility").update("showDebuggedCode", false, true);
      enableLineSelection = vscode.workspace.getConfiguration("AutodeskPostUtility").get("enableAutoLineSelection");
    }
  });
}

/** Deletes the specified CNC file */
function deleteCNCFile(src) {
  deleteFile(src);
  deleteFile(path.join(customCNC, getFileName(src)));
  message(path.basename(src) + " deleted");
  cncTree.refreshTree();
}

/** Selectes the specified machine file */
function deleteMachineFile(src) {
  deleteFile(src);
  deleteFile(path.join(customMachines, getFileName(src)));
  message(path.basename(src) + " deleted");
  if (src.toString() == machineFile.toString()) {
    executeCommand('hsm.clearMachineSelection')
  }
  machineTree.refreshTree();
}

/** Shows a messagebox containing the post engine version being used */
function showPostEngineVersion() {
  checkPostKernel();
  var child = require('child_process').execFile;
  var parameters = ["--version"];
  try {
    var _timeout = vscode.workspace.getConfiguration("AutodeskPostUtility").get("timeoutForPostProcessing");
    _timeout *= 1000; // convert to milliseconds
    child(postExecutable, parameters, { timeout: _timeout }, function (err, data) {
      if (err) {
        errorMessage("Post Processing failed.");
      } else {
        message(data); // displays the current post engine version
      }
    });
  } catch (e) {
    message(e.toString());
  }
}

/** Merges the post processor with any files with the '.merge.cps' extension in the same directory */
function mergePost() {
  checkPostKernel();
  let child = require('child_process').execFile;
  let parameters = [];
  postFile = getCpsPath();
  var mergeFile = postFile.split(".cps")[0] + ".merge.cps";
  parameters = [postFile, "--merge", mergeFile];
  try {
    var _timeout = vscode.workspace.getConfiguration("AutodeskPostUtility").get("timeoutForPostProcessing");
    _timeout *= 1000; // convert to milliseconds
    child(postExecutable, parameters, { timeout: _timeout }, function (err, data) {
      if (err) {
        errorMessage("Merge failed.");
      } else {
        message("Merge successful. The merged post can be found in your post processors directory.");
      }
    });
    wait(300);
    showDoc(vscode.workspace.openTextDocument(mergeFile), vscode.ViewColumn.One);
  } catch (e) {
    message(e.toString());
  }
}

/** Clears the selected machine */
function clearMachineSelection() {
  machineFile = ""; // reset
  statusMessage("Machine file unselected.", 2000);
  if (machineFileStatusBar != undefined) {
    machineFileStatusBar.hide();
  }
}

/** Show a selection box for the user to select a property option */
function selectItem(element, reset) {
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
            propertyIds.push({ id: propertySelections[key].values[v].id, title: propertySelections[key].values[v].title });
          } else {
            propertyIds.push({ id: propertySelections[key].values[v], title: propertySelections[key].values[v] });
          }
        }
      }
    }
  }

  if ((string[1] == "false") || (string[1] == "true") || (propertyIds.length > 1)) {
    if (propertyIds.length > 1) {
      var items = [];
      for (var p in propertyIds) {
        items.push({ 'description': "(" + propertyIds[p].title + ")", 'label': propertyIds[p].id })
      }
    } else {
      var items = ["true", "false"];
    }
    var opts = QuickPickOptions = { placeHolder: "'" + string[0] + "'" + " (current setting: '" + string[1] + "')" };
    vscode.window.showQuickPick(items, opts).then((selected) => {
      if (selected != undefined) {
        var option = selected.label == undefined ? selected : selected.label;
        var selection = propertyIds.length > 1 ? option : JSON.parse(option);
        if (obj.changed.properties[string[0]].value != undefined) {
          obj.changed.properties[string[0]].value = selection
        } else {
          obj.changed.properties[string[0]] = selection
        }
        writeJSON(obj, jsonPath);
        vscode.window.setStatusBarMessage("Property '" + string[0] + "' successfully changed to '" + option + "'", 5000);
      }
    });
  } else { // use input box for values
    var options = { placeHolder: "Specify your value for the property here" + " (current value: '" + string[1] + "')" };
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

/** Writes out the property JSON file */
function writeJSON(obj, jsonPath) {
  var JSONData = obj;
  var file = fs.createWriteStream(jsonPath);
  file.on('error', function(errors) {});
  file.write(JSON.stringify(JSONData));
  file.end(function() {
    wait(100);
    vscode.commands.executeCommand('propertyList.refreshPropertyList');
    config = vscode.workspace.getConfiguration("AutodeskPostUtility");
    var postOnPropertyChange = vscode.workspace.getConfiguration("AutodeskPostUtility").get("postOnPropertyChange");
    if (postOnPropertyChange) {
      vscode.commands.executeCommand('hsm.postProcess');
    }
  });
}

/** Saves the active document */
function savedoc() {
  var savedDoc = vscode.window.activeTextEditor.document.fileName;
  if (!checkActiveDocumentForPost()) {
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
  if (isDebugOpen && vscode.workspace.getConfiguration("AutodeskPostUtility").get("postOnSave")) {
    postProcess(savedDoc);
  }
}

/** Write the post processor location to a settings file so it is remembered between sessions */
function writePostToSettings() {
  vscode.workspace.getConfiguration("AutodeskPostUtility").update("postExecutablePath", postExecutable, true);
}

/** Write the secondary post processor location to a settings file so it is remembered between sessions */
function writeSecondaryPostToSettings() {
    vscode.workspace.getConfiguration("AutodeskPostUtility").update("secondaryPostExecutablePath", secondaryPostExecutable, true);
}

/** Used to check whether the user selects the same character twice (for two click line jumping) */
let secondClick = false;
/** The event gets called a few times (VSCode isssue). % 2 ensures we only use this once per click */
let times = 2;
/** Triggers when a user chooses a line in the output. Used for auto-line jumping */
function handleSelectionChange(event) {
  if (event.kind != 2) { // return if TextEditorSelectionChangeKind is not mouse interaction
    return undefined;
  }

  if (vscode.window.activeTextEditor.document.fileName.includes("debuggedfile") && !vscode.window.activeTextEditor.document.fileName.includes(".log") && times % 2 == 0) {
    var selectedLine = vscode.window.activeTextEditor.selection.start.line;
    let needTwoClicks = vscode.workspace.getConfiguration("AutodeskPostUtility").get("twoClickLineJumping"); // Allows users to copy and paste without jumping around in the code
    if (selectedLine != lastSelectedLine) {
      amountToMove = 0;
      secondClick = false;
    }

    if (!secondClick && needTwoClicks) {
      secondClick = true;
      lastSelectedLine = selectedLine;
      return;
    }

    // Read through the lines in the debug output to find the line which is selected in the non-debug view
    fs.readFile(debugOutputpath, function (err, data) {
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

        /**
         * When the line is found, get look at the line above (which is the call stack) and
         * get the characters after the second ':'. These will be an integer with the line
         * number that created the output 
         */
        if (!line.includes("!DEBUG") && notNotes && !moved) {
          if (currentIndex == selectedLine) {
            if (selectedLine == lastSelectedLine) {
              // parsing the int will error (or splitting will error) when it is out of the stack trace
              // so we default back to 0 to start at the bottom of the stack trace again
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
            // move to the defined line
            moveLine(lineToMoveTo);
            // move up the stack trace on next click
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

function checkForAutoComplete() {
  setAutoComplete("onLoad");
}

function onPickedItem(picked) {
  if (picked == "Post process") {
    if (!fileExists(cncFile)) {
      checkDirSize(cncFilesLocation, 'hsm.postProcess');
    } else {
      postProcess(vscode.window.activeTextEditor.document.fileName);
    }
  } else if (picked == "Change CNC file") {
    checkDirSize(cncFilesLocation);
  }
}

/** Selection of a subdirectory containing CNC files */
function selectSub(dir, currentCommand = "") {
  var dirs = getDirectories(dir);
  var newList = [];
  for (var i = 0; i < dirs.length; i++) {
    var basename = getFileName(dirs[i]);
    newList.push(basename);
  }
  newList.push("Browse...");
  vscode.window.showQuickPick(newList).then(val => {
    if (val == "Browse...") {
      vscode.window.showOpenDialog({ openFiles: true, filters: { 'CNC Files': ['cnc'] } }).then(val => {
        var selectedPath = val[0].path.substring(1, val[0].path.length);
        cncFile = selectedPath;
      });
    } else if (val) {
      checkDirSize(path.join(dir, val), currentCommand);
    }
  });
}

/** If a directory is selected, expand it if there are files in it. If not, select the CNC file */
function checkDirSize(dir, currentCommand = "") {
  if (!dir) dir = path.join(resLocation, "CNC files");
  var dirs = getDirectories(dir);
  if (dirs.length > 0) {
    selectSub(dir, currentCommand);
  } else {
    selectCNCFile(dir, currentCommand);
  }
}

function selectCNCFile(p, currentCommand = "") {
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
  vscode.window.showQuickPick(newList).then(val => selectedCNCFile(val, ListItems, currentCommand));
}

function selectedCNCFile(picked, fullList, currentCommand = "") {
  var itemToUse = undefined;
  for (var i = 0; i < fullList.length; i++) {
    var basename = path.basename(fullList[i]);
    if (picked == basename) itemToUse = fullList[i];
  }
  if (itemToUse) setCNCFile(itemToUse, currentCommand);
  if (currentCommand != "") {
    vscode.commands.executeCommand(currentCommand);
  }
}

/** Gets the desired units from the users output settings */
function selectUnits() {
  switch (vscode.workspace.getConfiguration("AutodeskPostUtility").get("outputUnits")) {
    case "MM":
      return 1;
    case "IN":
      return 0;
    default:
      return 1;
  }
}

/**  try and find the error line and move the cursor to the appropriate line in the post processor */
function findErrorLine(log) {
  fs.readFile(log, function (err, data) {
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

function findWarningMessages(log) {
  fs.readFile(log, function (err, data) {
    if (err) throw err;
    var array = data.toString().split('\n');
    for (var i = array.length - 1; i > 0; --i) {
      if (array[i].toUpperCase().includes("WARNING:")) {
          vscode.window.showWarningMessage("Post processing completed with warnings. Do you want to open the log file for details?", "Yes", "No").then(answer => {
          if (answer === "Yes") {
            openAndShowFile(logPath);
          }
        });
        break
      }
    }
  });
}

/** Opens and shows a file */
function openAndShowFile(filePath) {
  if (filePath) {
    // workaround since VS Code does not refresh the output sometimes
    vscode.workspace.openTextDocument(path.join(resLocation, 'loading.txt')).then(document => 
      vscode.window.showTextDocument(document, vscode.ViewColumn.Two, true)).then(complete=>
        vscode.workspace.openTextDocument(filePath).then(outputDoc => 
          vscode.window.showTextDocument(outputDoc, vscode.ViewColumn.Two, true))
        )
  }
}

/** Post processes using the defined post script */
function postProcess(postLocation) {
  if (!checkActiveDocumentForPost()) {
    vscode.window.showWarningMessage("The active document is not a postprocessor file.")
    return
  } else if (!cncFile) {
    checkDirSize(cncFilesLocation, 'hsm.postProcess');
    return
  }
  if (!fileExists(postExecutable)) {
    locatePostEXE(true);
  }

  removeFilesInFolder(outputDir) // clear output folder prior posting
  var child = require('child_process').execFile;
  // get the post processor executable location
  executeCommand('notifications.clearAll');

  
  let newDebugger = vscode.workspace.getConfiguration("AutodeskPostUtility").get("newDebugger");
  let parameters = createParameters(postLocation, false, newDebugger);

  var _timeout = vscode.workspace.getConfiguration("AutodeskPostUtility").get("timeoutForPostProcessing");
  _timeout *= 1000; // convert to milliseconds
  child(postExecutable, parameters, { timeout: _timeout }, function (err, data) {
    if (err) {
      if (err.signal == "SIGTERM") {
        errorMessage("Post processing failed due to timeout.");
        return;
      }
      if (fileExists(logPath)) {
        message("Post processing failed, see the log for details.");
        openAndShowFile(logPath);
        findErrorLine(logPath);
      } else {
        message("Post processing failed: " + err.message + data.toString());
      }
      return;
    }
    
    if (fileExists(outputpath)) {
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
            } catch (e) {
              currentDebugPanel.webview.postMessage({ request: message.request, error: e.toString() });
            }
            currentDebugPanel.webview.postMessage({ request: message.request, data: result });
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
      } else if (!vscode.workspace.getConfiguration("AutodeskPostUtility").get("showDebuggedCode")) {
        removeDebugLines(outputpath, postLocation);
      } else {
        // wait to ensure posting has finished
        wait(100);
        openAndShowFile(outputpath)
      }
    }

    if (!vscode.workspace.getConfiguration("AutodeskPostUtility").get("showDebuggedCode")) {
      var filesInOutputFolder = [];
      fs.readdirSync(outputDir).forEach(file => {
        let fullPath = path.join(outputDir, file);
        filesInOutputFolder.push(fullPath);
      });

      // find files with names other than debuggedfile, used for posts which output subprograms as separate files
      var files = filesInOutputFolder.filter(function (file) {
        return file.indexOf("debuggedfile") === -1;
      });

      for (var i = 0; i < files.length; i++) {
        removeDebugLines(files[i]);
      }
    }
    if (vscode.workspace.getConfiguration("AutodeskPostUtility").get("showWarningMessages")) {
      if (fileExists(logPath)) {
        findWarningMessages(logPath)
      }
    }
  });
}

/** Post processes using the defined post script with the primary and secondary post exes and then compares to outputs */
function postCompare(postLocation) {
  executeCommand('notifications.clearAll');
  
    if (!checkActiveDocumentForPost()) {
      vscode.window.showWarningMessage("The active document is not a postprocessor file.")
      return
    }
    if (!fileExists(postExecutable)) {
      locatePostEXE(true);
      if (!fileExists(postExecutable)) {
        locatePostEXE(false);
        vscode.window.showWarningMessage("Failed to find post processor automatically. Please select a primary post executable to run post compare.");
        return;
      }
    }
    if (!fileExists(secondaryPostExecutable)) {
      locateSecondaryPostEXE(true);
      if (!fileExists(secondaryPostExecutable)) {
        locateSecondaryPostEXE(false);
        vscode.window.showWarningMessage("Failed to find legacy post processor automatically. Please select a secondary post executable to run post compare.");
        return;
      }
    }
    if (!cncFile) {
      checkDirSize(cncFilesLocation, 'hsm.postCompare');
      return
    }

    removeFilesInFolder(outputDir) // clear output folder prior posting
    var child = require('child_process').execFile;
    // get the post processor executable location

    
    let parameters = createParameters(postLocation, true, false, false);
    let secondaryParameters = createParameters(postLocation, true, false, true);

    var _timeout = vscode.workspace.getConfiguration("AutodeskPostUtility").get("timeoutForPostProcessing");
    _timeout *= 1000; // convert to milliseconds
    child(postExecutable, parameters, { timeout: _timeout }, function (err, data) {
        if (err) {
            message("Primary post processing failed. Please post process separately to troubleshoot.");
            return;
        }
    });

    child(secondaryPostExecutable, secondaryParameters, { timeout: _timeout }, function (err, data) {
      if (err) {
        if (err.signal == "SIGTERM") {
          errorMessage("Secondary post processing failed due to timeout.");
          return;
        }
        if (fileExists(secondaryLogPath)) {
          message("Secondary post processing failed, see the log for details.");
          openAndShowFile(secondaryLogPath);
          findErrorLine(secondaryLogPath);
        } else {
          message("Secondary post processing failed: " + err.message + data.toString());
        }
        return;
      }

      if (fileExists(outputpath) && fileExists(secondaryoutputpath)) {
        let uri = vscode.Uri.file(outputpath);
        let secondaryUri = vscode.Uri.file(secondaryoutputpath);
        wait(100);
        vscode.commands.executeCommand("vscode.diff", uri, secondaryUri, 'Primary output <-> Secondary output', { viewColumn: vscode.ViewColumn.Two });
      }
    });

}

/** Creates parameters for post processing */
function createParameters(postLocation, isPostCompare, newDebugger, isSecondary = false) {

    let parameters = ['--noeditor'];

    // Set the machine
    if (machineFile != "") {
        parameters.unshift(machineFile);
        parameters.unshift("--machine");
    }

    // Set the debug mode
    if (!isPostCompare || vscode.workspace.getConfiguration("AutodeskPostUtility").get("showDebuggedCode")) {
      let debugArg = newDebugger ? "--debugreallyall" : "--debugall";
      parameters.push(debugArg);
    }
  
    // Set whether the output should be shortened
    let shorten = vscode.workspace.getConfiguration("AutodeskPostUtility").get("shortenOutputCode");
    let lineLimit = vscode.workspace.getConfiguration("AutodeskPostUtility").get("shortenOutputLineLimit");
    if (shorten) {
        parameters.push("--shorten", lineLimit);
    }
  
    // Set the unit
    let units = selectUnits();
    parameters.push("--property", "unit", units.toString());
  
    // Get the program name from the user settings
    let programName = vscode.workspace.getConfiguration("AutodeskPostUtility").get('programName');
    // If no name has been specified, use 1001
    if (programName == '') {
        vscode.workspace.getConfiguration("AutodeskPostUtility").update('programName', '1001', true);
        programName = '1001';
        vscode.window.showInformationMessage('Program name hasn\'t been specified, using 1001 as the name');
    }
    parameters.push("--property", "programName", programName);
  
    // Set the include path
    let includePath = vscode.workspace.getConfiguration("AutodeskPostUtility").get('includePath');
    if (fileExists(includePath)) {
        parameters.push("--include", includePath);
    }
    
    // Set post, cnc and output paths
    if (isSecondary) {
      parameters.unshift(secondaryoutputpath);
    } else {
      parameters.unshift(outputpath)
    }
    parameters.unshift(postLocation, cncFile);
  
    if (isSecondary) {
      executeCommand('propertyList.checkForDifferencesSecondary');
    } else {
      executeCommand('propertyList.checkForDifferences');  // TAG not needed anymore?
    }
  
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

    return parameters;
}

/** creates a new file that excludes the debug lines outputted for line jumping */
function removeDebugLines(outputFile, postLocation) {
  fs.readFile(outputFile, (err, data) => {
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
        lines = lines + array[i] + '\n';
      }
      if (postLocation != undefined) {
        lineData += array[i] + '\n';
      }
    }

    var file = fs.createWriteStream(outputFile);
    file.on('error', () => { });
    file.write(lines);
    file.end(() => {
      if (postLocation != undefined) {
        openAndShowFile(outputFile);
      }
    });
    if (postLocation != undefined) {
      file = fs.createWriteStream(debugOutputpath);
      file.on('error', () => { });
      file.write(lineData);
      file.end();
    }
  });
}

/** check to ensure a post processor is open in the window */
function checkActiveDocumentForPost() {
  if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
    postFile = vscode.window.activeTextEditor.document.fileName.toString();
    return true;
  }
  return false;
}

/** Downloads the CNC exporting post processor */
function downloadCNCExtractor() {
  vscode.env.openExternal(vscode.Uri.parse('https://cam.autodesk.com/hsmposts?p=export_cnc_file_to_vs_code'));
}

/** Encrypts or decrypts the post process */
function postEncryption(encrypt) {
  if (!checkActiveDocumentForPost()) {
    return
  }

  if (!encrypt) {
    if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf("PROTECTED.CPS") >= 0) {
      postFile = vscode.window.activeTextEditor.document.fileName.toString();
    } else {
      message('Open a .protected.cps file to start decryption');
      return;
    }
  }

  var options = { placeHolder: "Enter your desired password here" };
  if (!encrypt) options.placeHolder = "Enter the post password"
  vscode.window.showInputBox(options).then((input) => {
    if (input != undefined && input != "") {
      checkPostKernel();
      var child = require('child_process').execFile;
      var parameters = [];
      parameters = [postFile, (encrypt ? "--encrypt" : "--decrypt"), input];
      try {
        var _timeout = vscode.workspace.getConfiguration("AutodeskPostUtility").get("timeoutForPostProcessing");
        _timeout *= 1000; // convert to milliseconds
        child(postExecutable, parameters, { timeout: _timeout }, function (err, data) {
          if (err) {
            message((encrypt ? "Encryption" : "Decryption") + " failed");
          } else {
            if (encrypt) {
              message("Encryption successful. The encrypted post can be found in your post processors directory.");
            } else {
              message("Decryption successful. If the password was correct, the unprotected post will be in the same directory as the input protected post.");
            }
          }
        });
      } catch (e) {
        message(e.toString());
      }
    }
  })
}

/** Folds/unfolds the property */
function foldPropertyList() {
  vscode.window.showQuickPick(["Fold", "Unfold"]).then(val => {
    for (var i = 0; i < vscode.window.activeTextEditor.document.lineCount; i++) {
      var currentLine = vscode.window.activeTextEditor.document.lineAt(i).text.replace(/\s/g, '');
      if (currentLine.startsWith("properties=")) {
        vscode.window.activeTextEditor.selection = new vscode.Selection(new vscode.Position(i, 0), new vscode.Position(i, 1000));
        if (val == "Fold") {
          executeCommand('editor.foldRecursively');
        } else {
          executeCommand('editor.unfoldRecursively');
        }
        break;
      }
    }
  });
}

/** Updates the post properties in the active document */
function updatePostProperties() {
  if (getCpsPath() == undefined) {
    return;
  }
  fixEOL();
  executeCommand('propertyList.interrogatePost');
  wait(100);

  var updatedProperties = [];
  var hash = getHash(getCpsPath());
  var jsonTemp = path.join(propertyJSONpath, hash + "_temp.json");
  if (fileExists(jsonTemp)) {
    var lines = fs.readFileSync(jsonTemp);
    if (lines.length > 1) {
      var obj = JSON.parse(lines);
      if (obj.properties) {
        updatedProperties.push("properties = ") // add properties object to the output
        var newProperties = JSON.stringify(obj.properties, null, 2);
        updatedProperties.push(newProperties.replace(/"(\w+)"\s*:/g, '$1:')) // removes quotation marks from object keys
        updatedProperties.push(";");
      } else {
        message("This post processor does not have any properties defined.");
        return;
      }
    }
    if (fileExists(jsonTemp)) {
      fs.unlinkSync(jsonTemp);
    }
  } else {
    errorMessage("Property JSON file does not exist.");
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
          propertyValue = array[i].slice(array[i].indexOf("=") + 1).substring(1, endPosition).replace(/\n|\r/g, "");

          if (str.slice(str.indexOf("=")).search(/[*\;/]/g) > -1) { // extract remaining line, stop if there is a comment or semicolon
            remainingString = array[i].substring(array[i].search(/[*\;/]/g)).replace(/\n|\r/g, '');
          }
          if (propertyKey == "" || propertyValue == "") {
            message("Failed to read property " + "\"" + propertyKey + "\" " + propertyValue + " in line " + (i + 1));
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

    var fileName = getFileName(getCpsPath());
    var currentFolder = path.dirname(getCpsPath());
    var targetFolder = path.join(currentFolder, "updatedPosts");
    makeFolder(targetFolder);
    var cpsFilePath = path.join(targetFolder, fileName);
    var file = fs.createWriteStream(cpsFilePath);
    file.on('error', function (errors) { });
    file.write(array.join(''));
    file.end();
    if (!foundProblem) {
      message("Success, the updated postprocessor is located here: " + cpsFilePath);
    } else {
      message("Completed with errors, the updated postprocessor is located here: " + cpsFilePath);
    }
  });
}

/**
 * COMMON FUNCTIONS
 * Common functions to ensure tasks
 * are performed in a consistent way
 */

/** Cleans up the previously stored properties */
function cleanupProperties() {
  // delete any properties that have been stored
  vscode.workspace.onDidCloseTextDocument((doc) => {
    var cpsPath = doc.fileName.toString();
    var hash = getHash(cpsPath);
    var jsonPath = path.join(propertyJSONpath, hash + ".json");
    if (fileExists(jsonPath)) {
      fs.unlinkSync(jsonPath);
      propertyTree.refresh();
    }
  });
  removeFilesInFolder(propertyJSONpath)
}

/** Adds an include path to the users setting directory */
function setIncludePath() {
  vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false }).then(val => {
    var selectedPath = val[0].path.substring(1, val[0].path.length);
    if (fs.existsSync(selectedPath)) {
      vscode.workspace.getConfiguration("AutodeskPostUtility").update('includePath', selectedPath, true);
      vscode.window.showInformationMessage("Include path successfully set to: " + selectedPath);
    } else {
      vscode.window.showErrorMessage("The selected Include path does not exist: " + selectedPath);
    }
  });
}

/** Updates the settings.json file for ESlint usage depending on the user setting. */
function setEmbeddedEslintRules() {
  let currentEslintConfiguration = vscode.workspace.getConfiguration("eslint");
  let currentEditorConfiguration = vscode.workspace.getConfiguration("editor");
  let newEslintConfiguration = Object.assign({}, currentEslintConfiguration.overrideConfigFile, {"overrideConfigFile": path.join(resLocation, ".eslintrc.json")});
  let newEditorConfiguration
  switch (vscode.workspace.getConfiguration("AutodeskPostUtility").get("useEmbeddedESLintRules")) {
    case "Disabled":
      newEditorConfiguration = Object.assign({}, currentEditorConfiguration.codeActionsOnSave, {"source.fixAll.eslint": false});
      newEslintConfiguration = Object.assign({}, currentEslintConfiguration.overrideConfigFile, {});
      break;
    case "Show ESLint issues only":
      newEditorConfiguration = Object.assign({}, currentEditorConfiguration.codeActionsOnSave, {"source.fixAll.eslint": false});
      break;
    case "Show and fix ESLint issues":
      newEditorConfiguration = Object.assign({}, currentEditorConfiguration.codeActionsOnSave, {"source.fixAll.eslint": true});
      break;
    default:
      errorMessage("Unknown command for setting useEmbeddedESLintRules.")
      return;
  }
  vscode.workspace.getConfiguration("eslint").update("options", newEslintConfiguration, true);
  vscode.workspace.getConfiguration("editor").update("codeActionsOnSave", newEditorConfiguration, true);
}

/**
 *  Locates the post executable on the users system
 *  
 * Boolean argument defines if it should be located automatically
 *  or if a user is prompted to select it
 */
function locatePostEXE(findPostAutomatically) {
  // Try find the fusion install location and use the post exe from there. If we find it, the path is written to user settings
  // if the location isn't found, prompt the user to manually select
  if (findPostAutomatically) {
    /** This prioritizes the latest post kernel */
    let possibleLocations = ['develop', 'pre-production', 'production'];
    if (process.platform == "win32") {
      // ini location tells us the latest install location
      for (const location of possibleLocations) {
        let fusionDataFile = path.join(process.env.LOCALAPPDATA, "autodesk", "webdeploy", location, "6a0c9611291d45bb9226980209917c3d", "FusionLauncher.exe.ini");
        if (fileExists(fusionDataFile)) {
          let lines = fs.readFileSync(fusionDataFile, "utf16le").split("\n");
          // try and find the .exe path
          for (let j = 0; j < lines.length; ++j) {
            let activeLine = lines[j];
            if (activeLine.toLowerCase().includes("fusion360.exe")) {
              // once found, we craft the path of the post.exe
              let fusionInstallLocation = activeLine.substring(8, activeLine.length - 16);
              postExecutable = path.join(fusionInstallLocation, "Applications", "CAM360", "post.exe");
              // if the file exists, it will write it to the settings file
              if (fileExists(postExecutable)) {
                writePostToSettings();
                return;
              }
            }
          }
        }
      }
    } else {
      for (const location of possibleLocations) {
        postExecutable = path.join(process.env.HOME, "Library", "application support", "autodesk", "webdeploy",
          location, "Autodesk Fusion 360" + (location != "production" ? " [" + location + "]" : "") + ".app", "contents", "libraries", "applications", "CAM360", "post")
        if (fileExists(postExecutable)) {
          writePostToSettings();
          return;
        }
      }
    }
  }
  vscode.window.showInformationMessage((findPostAutomatically ? "Post executable cannot be found. " : "") + "Please select your post executable", "Browse...").then((val) => {
    if (val == "Browse...") {
      vscode.window.showOpenDialog({ openFiles: true, filters: {} }).then(val => {
        var selectedPath = val[0].path.substring(1, val[0].path.length);
        if (fileExists(selectedPath) && selectedPath.toLowerCase().includes("post")) {
          postExecutable = selectedPath;
          writePostToSettings();
          message("Post processor location updated correctly.")
        } else {
          message("The post EXE you selected is invalid or does not exist.");
        }
        return false;
      });
    }
  });
}

/**
 *  Locates the legacy post executable on the users system
 *  
 * Boolean argument defines if it should be located automatically
 *  or if a user is prompted to select it
 */
function locateSecondaryPostEXE(findPostAutomatically) {
  // Try find the fusion install location and use the legacy post exe from there. If we find it, the path is written to user settings
  // if the location isn't found, prompt the user to manually select
  if (findPostAutomatically) {
    /** This prioritizes the latest post kernel */
    let possibleLocations = ['develop', 'pre-production', 'production'];
    if (process.platform == "win32") {
      // ini location tells us the latest install location
      for (const location of possibleLocations) {
        let fusionDataFile = path.join(process.env.LOCALAPPDATA, "autodesk", "webdeploy", location, "6a0c9611291d45bb9226980209917c3d", "FusionLauncher.exe.ini");
        if (fileExists(fusionDataFile)) {
          let lines = fs.readFileSync(fusionDataFile, "utf16le").split("\n");
          // try and find the .exe path
          for (let j = 0; j < lines.length; ++j) {
            let activeLine = lines[j];
            if (activeLine.toLowerCase().includes("fusion360.exe")) {
              // once found, we craft the path of the post.exe
              let fusionInstallLocation = activeLine.substring(8, activeLine.length - 16);
              secondaryPostExecutable = path.join(fusionInstallLocation, "Applications", "CAM360", "post-legacy", "post.exe");
              // if the file exists, it will write it to the settings file
              if (fileExists(secondaryPostExecutable)) {
                writeSecondaryPostToSettings();
                return;
              }
            }
          }
        }
      }
    } else {
      for (const location of possibleLocations) {
        secondaryPostExecutable = path.join(process.env.HOME, "Library", "application support", "autodesk", "webdeploy",
          location, "Autodesk Fusion 360" + (location != "production" ? " [" + location + "]" : "") + ".app", "contents", "libraries", "applications", "CAM360", "post-legacy", "post")
        if (fileExists(secondaryPostExecutable)) {
          writeSecondaryPostToSettings();
          return;
        }
      }
    }
  }
    vscode.window.showInformationMessage((findPostAutomatically ? "Secondary post executable cannot be found. " : "") + "Please select your secondary post executable", "Browse...").then((val) => {
        if (val == "Browse...") {
            vscode.window.showOpenDialog({ openFiles: true, filters: {} }).then(val => {
                var selectedPath = val[0].path.substring(1, val[0].path.length);
                if (fileExists(selectedPath) && selectedPath.toLowerCase().includes("post")) {
                    secondaryPostExecutable = selectedPath;
                    writeSecondaryPostToSettings();
                    message("Legacy (secondary) post processor location updated correctly.")
                } else {
                    message("The post EXE you selected is invalid or does not exist.");
                }
                return false;
            });
        }
    });
}

/**
 * Verifies the existance of the post kernel
 * 
 * If non-existant, it will be located automatically
 */
function checkPostKernel() {
  postExecutable = vscode.workspace.getConfiguration("AutodeskPostUtility").get("postExecutablePath");
  if (!fileExists(postExecutable)) {
    locatePostEXE(true);
  }
}

/**
 * Asks the user to choose a custom file to import
 * pass through either "machineFile"
*/
function importCustomFile(type) {
  var fileType = (type == "machineFile") ? "Machines" : "CNC files";
  var fileFilter = { 'Autodesk CAM intermediate file': ['cnc'] };
  if (type == "machineFile") {
    fileFilter = { 'Machine Configuration file': ['machine', 'mch'] };
  }

  makeFolder(path.join(resLocation, fileType, "Custom"));

  let log = "";
  vscode.window.showOpenDialog({ openFiles: true, canSelectMany: true, filters: fileFilter }).then((val) => {
    if (val) {
      for (var i = 0; i < val.length; ++i) {
        var selectedPath = val[i].path.toString().substring(1, val[i].path.length);
        if (fileExists(selectedPath)) {
          let copyLocation = path.join(resLocation, fileType, "Custom", getFileName(selectedPath));
          copyFile(selectedPath, copyLocation);
          log += "\"" + getFileName(selectedPath) + "\"\n";
        } else {
          errorMessage("Import of " + fileType + " file(s) failed.");
          return;
        }
      }
      message("The following " + fileType + " file(s) have been successfully imported:\n" + log);
      if (type == "machineFile") {
        executeCommand('machineList.refreshMachineList');
        return;
      }
      executeCommand('cncList.refreshCNCList');
    }
  });
}

/** Copy the custom data to a temp location for future use */
function backupCustomData() {
  copyCustomFiles("cnc", path.join(resLocation, "CNC files", "Custom"), customCNC, true); // copy custom cnc files to temporary directory
  copyCustomFiles("machine", path.join(resLocation, "Machines", "Custom"), customMachines, true); // copy custom machine files to temporary directory
}

/** Restores custom data from temp location */
function restoreCustomData() {
  if (fileExists(customCNC) && !fileExists(path.join(resLocation, "CNC files", "Custom"))) {
    makeFolder(path.join(resLocation, "CNC files", "Custom"));
    copyCustomFiles("cnc", customCNC, path.join(resLocation, "CNC files", "Custom"), false);
  }
  if (fileExists(customMachines) && !fileExists(path.join(resLocation, "Machines", "Custom"))) {
    makeFolder(path.join(resLocation, "Machines", "Custom"));
    copyCustomFiles("machine", customMachines, path.join(resLocation, "Machines", "Custom"), false);
  }
}
/** Updates users langague file to ensure CPS is detected as a JS file */
function addCPSToJSLanguage() {
  let currentLanguageConfiguration = vscode.workspace.getConfiguration("files");
  let newLanguageConfiguration = Object.assign({}, currentLanguageConfiguration.associations, {"*.cps" : "javascript"});
  vscode.workspace.getConfiguration("files").update("associations", newLanguageConfiguration, true);
}

/** Disables the automatic line finding option on output code */
function disableLineSelection() {
  vscode.window.showQuickPick(["True", "False"]).then(val => {
    if (val == "True") {
      vscode.workspace.getConfiguration("AutodeskPostUtility").update("enableAutoLineSelection", false, true);
      enableLineSelection = false;
    } else if (val == "False") {
      vscode.workspace.getConfiguration("AutodeskPostUtility").update("enableAutoLineSelection", true, true);
      if (!vscode.workspace.getConfiguration("AutodeskPostUtility").get("showDebuggedCode")) {
        enableLineSelection = true;
      }
    }
  });
}

/** Adds an additional folder to the CNC selections sidebar */
function addFolderToCNCTree() {
  vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false }).then(val => {
    if (val) {
      var selectedPath = val[0].path.substring(1, val[0].path.length);
      cncTree.addFolder(selectedPath);
      cncTree.refreshTree();
    }
  });
}

/** Adds an additional folder to the CNC selections sidebar */
function addFolderToMachineTree() {
  vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false }).then(val => {
    var selectedPath = val[0].path.substring(1, val[0].path.length);
    machineTree.addFolder(selectedPath);
    machineTree.refreshTree();
  });
}

/** Edits the selected machine file */
function editMachineFile(machine) {
  if (machine != undefined) {
    showDoc(vscode.workspace.openTextDocument(machine), vscode.ViewColumn.One);
  }
}

/** Activates the selected CNC file */
var cncFileStatusBar = undefined;
function setCNCFile(selectedFile, currentCommand = "") {
  if (selectedFile.toLowerCase().includes(".cnc")) {
    cncFile = selectedFile;
    statusMessage("CNC file set", 2000);
    if (cncFileStatusBar == undefined) {
      cncFileStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
    }
    var cncFileName = path.basename(selectedFile,path.extname(selectedFile));
    cncFileStatusBar.text = "CNC file: " + cncFileName;
    cncFileStatusBar.show();
    if(!checkActiveDocumentForPost()) { return; }
    var postOnSelection = vscode.workspace.getConfiguration("AutodeskPostUtility").get("postOnCNCSelection");
    if (postOnSelection && currentCommand === "") {
      postProcess(vscode.window.activeTextEditor.document.fileName)
    }
  }
}

/** Activates the selected machine */
var machineFileStatusBar = undefined;
function setMachineFile(selectedFile) {
  if (isMachineFile(selectedFile)) {
    machineFile = selectedFile;
    vscode.window.setStatusBarMessage("Machine file updated", 2000);
    if (machineFileStatusBar == undefined) {
      machineFileStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }
    var machineFileName = path.basename(selectedFile, path.extname(selectedFile));
    machineFileStatusBar.text = "Machine: " + machineFileName;
    machineFileStatusBar.show();
    var postOnMachineSelection = vscode.workspace.getConfiguration("AutodeskPostUtility").get("postOnMachineSelection");
    if (postOnMachineSelection) {
      postProcess(vscode.window.activeTextEditor.document.fileName)
    }
  }
}

function isMachineFile(input) {
  return machineFileExtensions.some(ext => input.toLowerCase().includes(ext));
}

/** Fixes the line endings within the active file */
async function fixEOL() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        executeCommand('workbench.action.files.save'),
        vscode.window.activeTextEditor.edit(builder => { builder.setEndOfLine(vscode.EndOfLine.CRLF) })
      );
    }, 100);
  });
}

/** Selects the specified range */
function highlightRange(editor, range) {
  editor.revealRange(range, vscode.TextEditorRevealType.Default);
  editor.selection = new vscode.Selection(range.start, range.start);
  executeCommand('workbench.action.focusActiveEditorGroup');
}

/** Provides a few general extension options to the user */
function generalExtensionOptions() {
  checkActiveDocumentForPost();
  checkPostKernel();

  if (cncFile) {
    if (fileExists(cncFile)) {
      var tmpCNC = path.join(tmp, getFileName(cncFile));
      if (!fileExists(tmpCNC)) {
        copyCNCFile(cncFile);
      }
    }
  }
  var items = ["Change CNC file", "Post process"];
  var opts = QuickPickOptions = { placeHolder: "Select the required command" };
  vscode.window.showQuickPick(items, opts).then(val => onPickedItem(val));
}


/**
 * UTILITIES
 * Quick calls to perform repetitive tasks
 */

/** Tells the script to wait for the defined amount of time */
function wait(milliseconds) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + milliseconds) {
    end = new Date().getTime();
  }
}

/** Displays an information message */
function message(message) {
  vscode.window.showInformationMessage(message);
}

/** Displays an error message */
function errorMessage(message) {
  vscode.window.showErrorMessage(message);
}

/** Executes the defined command (string) */
function executeCommand(command) {
  vscode.commands.executeCommand(command);
}

/** Displays a status message */
function statusMessage(message, time) {
  vscode.window.setStatusBarMessage(message, time)
}

/** Returns a md5 hash for the defined string */
function getHash(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

/** Returns true if the specified path exists on disk */
function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).map(file => path.join(srcpath, file)).filter(path => fs.statSync(path).isDirectory());
}

/** Returns all the files from within the defined directory */
function getFilesFromDir(dir, fileTypes) {
  let filesToReturn = [];
  let files = fs.readdirSync(dir);
  for (let i in files) {
    let curFile = path.join(dir, files[i]);
    if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1) {
      filesToReturn.push(curFile.replace(dir, ''));
    }
  }

  return filesToReturn;
}

/** Returns true if the specified path exists on disk */
function fileExists(filePath) {
  return fs.existsSync(filePath)
}


/** Returns the file name */
function getFileName(filePath) {
  return path.basename(filePath)
}

/** Opens the specified file in vscode */
function showDoc(doc, column, visible) {
  vscode.window.showTextDocument(doc, column, visible)
}

function openFolder(path) {
  if (!fileExists(path)) {
    return;
  }
  if (os.type() == "Windows_NT") {
    require('child_process').exec('start "" "' + path + '"');
  } else {
    require('child_process').exec('open "" "' + path + '"');
  }
}

function makeFolder(dir) {
  if (fileExists(dir)) return; // folder already exists
  let tempDir = dir;
  while (!fileExists(path.dirname(tempDir))) {
    tempDir = path.dirname(tempDir);
    if (fileExists(path.dirname(tempDir))) {
      fs.mkdirSync(tempDir);
      tempDir = dir;
    }
  }
  fs.mkdirSync(dir);
}

function copyCNCFile(cncFile) {
  var tmpCNCFile = tmp + "/" + getFileName(cncFile);
  if (!fileExists(tmpCNCFile)) {
    copyFile(cncFile, tmpCNCFile);
  }
}

function copyFile(src, destination) {
  fs.createReadStream(src).pipe(fs.createWriteStream(destination));
}

function deleteFile(src) {
  if (fileExists(src)) {
    fs.unlinkSync(src)
  }
}

function copyCustomFiles(type, source, destination, clear) {
  var folder = (type == "machine") ? customMachines : customCNC;
  var customFolderName = (type == "machine") ? "Machines" : "CNC files";
  if (fileExists(path.join(resLocation, customFolderName, "Custom"))) {
    if (!fileExists(folder)) { // create temp folder if needed
      makeFolder(folder);
    }
    if (clear) {
      removeFilesInFolder(folder); // clear files in temporary directory
    }
    copyFolderSync(source, destination);
  }
}

/** Returns the path of the active CPS file */
function getCpsPath() {
  let cpsPath;
  if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
    cpsPath = vscode.window.activeTextEditor.document.fileName.toString();
  } else {
    errorMessage("The active file is not a post processor file.");
    return undefined;
  }
  return cpsPath;
}

/** Copys the specified directory to a specified location */
function copyFolderSync(from, to) {
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      if (!fileExists(path.join(to, element))) {
        fs.mkdirSync(path.join(to, element));
      }
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
};

/** Removes all files in the selected directory */
function removeFilesInFolder(dir) {
  if (fileExists(dir)) {
    fs.readdirSync(dir).forEach((element) => {
      const currentPath = path.join(dir, element);
      if (fs.lstatSync(currentPath).isFile()) {
        deleteFile(currentPath);
      } else {
        removeFilesInFolder(currentPath);
      }
    });
  }
}

/** Moves the current selection to the specified line */
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
      errorMessage("The post processor (" + postFile + ") that created this output has been closed!");
    }
  }
}
