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

// pull the relevant node modules
const vscode = require('vscode');
let QuickPickOptions = vscode.QuickPickOptions;
const fs = require('fs');
const path = require('path');
const os = require('os');
const process = require('process');
// require the sidebar JS files
const functionNodes = require('./functionList');
const variableList = require('./variableList');
const CNCList = require('./cncList');
// store the file information when posting
let cncFile = undefined;
let postFile = undefined;
let postLoc = undefined;
let lineData = [];
// find and store the location for the application resources
const resLocation = vscode.extensions.getExtension("Autodesk.hsm-post-processor").extensionPath + "\\res";
// store the OS temporary directory
const tmp = os.tmpdir();
// set a location for the custom CNC Files
const customCNC = tmp + "\\Autodesk\\VSCode\\CustomCNCFiles";
// define location for the settings file. Used to store the post.exe location
const settingsLocation = resLocation + "\\settings.json";
let tmpCPSFile = [];
// checks if the same output line has been selected, if it has, the code will jump to the next parent line
let lastSelectedLine = undefined;
let amountToMove = 0;
// if enabled, auto line-selection will occur (when selecting a line in the outputted code)
let enableLineSelection = true;
// used to determine whether to show the full debugged code output, or just the generated code
let showDebugOutput = false;
// set the output paths
const outputpath = tmp + "\\debuggedfile.nc";
const logPath = tmp + "\\debuggedfile.log";
const debugOutputpath = tmp + "\\debuggedfile.nc2";
let ListItems = undefined;
// set the location of the stored CNC files
const cncFilesLocation = resLocation + "\\CNC files";
let units = 1;

function activate(context) {
  // set an event handler for the saving of a document. This is used to post on-save
  vscode.workspace.onDidSaveTextDocument(savedoc);
  vscode.window.onDidChangeTextEditorSelection(handleChange);
  copyCNCFiles();
  // if the custom CNC directory exists, check each file
  if (fs.existsSync(customCNC) && !fs.existsSync(resLocation + "\\CNC files\\Custom")) {
    let cncFiles = fs.readdirSync(customCNC);
    let tempList = [];
    fs.mkdirSync(resLocation + "\\CNC files\\Custom");
    for (var i = 0; i < cncFiles.length; ++i) {
      if (cncFiles[i].toLocaleLowerCase().includes(".cnc")) {
        let copyLocation = resLocation + "\\CNC files\\Custom\\" + cncFiles[i];
        copyFile(customCNC + "\\" + cncFiles[i], copyLocation);
      }
    }
    let filesToMove = [];
  }

  // update the configuration to include the CPS extension
  let currentLanguageConfiguration = vscode.workspace.getConfiguration("files").get("associations");
  let stringLang = "";
  if (currentLanguageConfiguration) stringLang = JSON.stringify(currentLanguageConfiguration);
  if (!stringLang.toLowerCase().includes("*.cps")) {
    let obj = '"*.cps": "javascript"';
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
    let src = element.src;
    fs.unlinkSync(src);
    if (fs.existsSync(customCNC + "\\" + path.basename(src))) {
      fs.unlink(customCNC + "\\" + path.basename(src));
    }
    vscode.window.showInformationMessage(element.label + " deleted");
    cncTree.refreshTree();
  }))

  context.subscriptions.push(vscode.commands.registerCommand('hsm.changePostExe', () => {
    locatePostEXE(false);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.downloadCNCExtractor', () => {
    const ncToCopy = resLocation + "\\export cnc file to vs code.cps";
    var uri = vscode.Uri.file(ncToCopy);
    uri.path = os.userInfo().homedir.toString() + '\\export cnc file to vs code.cps';
    vscode.window.showSaveDialog({filters: {'HSM Post Processor': ['cps']}, defaultUri: uri}).then(val => {
      if (val) {
        fs.createReadStream(ncToCopy).pipe(fs.createWriteStream(val.path.substr(1, val.path.length)));
        vscode.window.showInformationMessage("Post saved");
      }
    });
  }));

  context.subscriptions.push(vscode.commands.registerCommand('cncList.refreshCNCList', () => {
    cncTree.refreshTree();
    copyCNCFiles();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.setCNC', selectedFile => {
    if (selectedFile.toLowerCase().includes(".cnc")) {
      cncFile = selectedFile;
      selectUnits();
      vscode.window.setStatusBarMessage("CNC file set", 1000);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.showDebuggedCode', () => {
    vscode.window.showQuickPick(["True", "False"]).then(val => {
      if (val == "True") {
        showDebugOutput = true;
        enableLineSelection = false;
      } else if (val == "False") {
        showDebugOutput = false;
        enableLineSelection = true;
      }
    });
  }));

  context.subscriptions.push(vscode.commands.registerCommand('hsm.disableLineSelection', () => {
    vscode.window.showQuickPick(["True", "False"]).then(val => {
      if (val == "True") {
        enableLineSelection = false;
      } else if (val == "False") {
        if (!showDebugOutput) {
          enableLineSelection = true;
        }
      }
    });
  }));

  var disposable = vscode.commands.registerCommand('showCHM', (element) => {
    var htmlHelp = resLocation + "\\varList\\fullHTML\\" + element.html.split('#')[0];
    var lines = fs.readFileSync(htmlHelp);
    var uri = vscode.Uri.file(htmlHelp);
    // ToDo: Add open html
    // vscode.commands.executeCommand("vscode.previewHtml", uri, vscode.ViewColumn.Two);
  });

  const functionSelectionProvider = new functionNodes.functionListProvider(context);
  vscode.window.registerTreeDataProvider('functionList', functionSelectionProvider);

  var disposable = vscode.commands.registerCommand('functionList.refreshEntry', () => {
    functionSelectionProvider.refresh();
  });
  context.subscriptions.push(disposable);

  context.subscriptions.push(vscode.commands.registerCommand('HSM.selectCNCFile', () => {
    checkDirSize(cncFilesLocation);
  }));

  disposable = vscode.commands.registerCommand('HSM.postProcess', () => {
    if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
      postFile = vscode.window.activeTextEditor.document.fileName.toString();
    }
    if (path.extname(vscode.window.activeTextEditor.document.fileName) == ".cps") {
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
              var tmpCNC = tmp + "/" + path.basename(cncFile);
              if (!fs.exists(tmpCNC)) {
                copyF(cncFile);
              }
            }
          }
          var tmpPostFile = tmp + "\\" + path.basename(cncFile);
          postProcess(tmpPostFile, vscode.window.activeTextEditor.document.fileName);
        }
      }
    }
  });
  context.subscriptions.push(disposable);

  context.subscriptions.push(vscode.commands.registerCommand('functionList.revealRange', (editor, range) => {
    editor.revealRange(range, vscode.TextEditorRevealType.Default);
    editor.selection = new vscode.Selection(range.start, range.start);
    vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
  }));

  disposable = vscode.commands.registerCommand('extension.startHSMPlugin', function() {

    if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
      postFile = vscode.window.activeTextEditor.document.fileName.toString();
    } else {
      var items = ["Help"];
      var pickedItem = "";
      var opts = QuickPickOptions = {placeHolder: "Select the required command"};
      var g = vscode.window.showQuickPick(items, opts).then(val => {
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
          var tmpCNC = tmp + "/" + path.basename(cncFile);
          if (!fs.exists(tmpCNC)) {
            copyF(cncFile);
          }
        }
      }
      vscode.window.setStatusBarMessage("The Autodesk HSM post utility has been loaded", 10000);
      var items = ["Change CNC file", "Post process", "Help"];
      var pickedItem = "";
      var opts = QuickPickOptions = {placeHolder: "Select the required command"};
      var g = vscode.window.showQuickPick(items, opts).then(val => onPickedItem(val));
    }
  });
  context.subscriptions.push(disposable);
}

exports.activate = activate;

function checkForCPS() {
  if (vscode.window.activeTextEditor.document.isUntitled) return;
  var ogName = vscode.window.activeTextEditor.document.fileName;
  var newExtension = path.extname(ogName);
  if (newExtension.toLowerCase() == ".cps") {
    var workspaceDir = vscode.workspace.workspaceFolders;
    var newFile = tmp + "\\" + path.basename(ogName) + ".js";
    fs.createReadStream(ogName).pipe(fs.createWriteStream(newFile));
    tmpCPSFile.push([newFile.toLowerCase(), ogName.toLowerCase()]);
    var jsonPath = tmp + "\\jsconfig.json";
    var tsLib = tmp + "\\globals.d.ts";
    if (!fs.existsSync(jsonPath)) {
      fs.createReadStream(resLocation + "\\language files\\jsconfig.json").pipe(fs.createWriteStream(jsonPath));
    }
    if (!fs.existsSync(tsLib)) {
      fs.createReadStream(resLocation + "\\language files\\globals.d.ts").pipe(fs.createWriteStream(tsLib));
    }
    vscode.window.showTextDocument(vscode.workspace.openTextDocument(newFile), vscode.ViewColumn.One);
  }
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
  var config = vscode.workspace.getConfiguration("HSMPostUtility");
  var postOnSave = config.get("postOnSave");

  if (isDebugOpen && postOnSave) {
    var tmpPostFile = tmp + "\\" + path.basename(cncFile);
    postProcess(tmpPostFile, savedDoc);
  }

}

function help() {
  var uri = vscode.Uri.file(resLocation + "\\help\\helpFile.html");
  vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.Two);
}

function showSetupSheet(lines, name) {
  var cDoc = vscode.window.activeTextEditor.document;
  var previewUri = vscode.Uri.parse('ncPreview://authority/assistant');
  var TextDocumentContentProvider = (function() {
    function TextDocumentContentProvider() {
      this._onDidChange = new vscode.EventEmitter();
    }

    TextDocumentContentProvider.prototype.provideTextDocumentContent = function(uri) {
      return this.createCodePreview();
    };

    Object.defineProperty(TextDocumentContentProvider.prototype, "onDidChange", {
      get: function() {
        return this._onDidChange.event;
      },
      enumerable: true,
      configurable: true
    });
    TextDocumentContentProvider.prototype.update = function(uri) {
      this._onDidChange.fire(uri);
    };

    TextDocumentContentProvider.prototype.createCodePreview = function() {
      return this.extractData();
    };

    TextDocumentContentProvider.prototype.extractData = function() {
      return lines;
    };
    TextDocumentContentProvider.prototype.errorSnippet = function(error) {
      return "\n                <body>\n                    " + error + "\n                </body>";
    };
    return TextDocumentContentProvider;
  }());

  var provider = new TextDocumentContentProvider();
  var registration = vscode.workspace.registerTextDocumentContentProvider('ncPreview', provider);
  vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two).then(function(success) {
    vscode.window.showTextDocument(cDoc);
  }, function(reason) {
    vscode.window.showErrorMessage(reason);
  });
}

function locatePostEXE(val) {
  var post = true;
  if (val) {
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

function handleChange(event) {
  if (vscode.window.activeTextEditor.document.fileName.includes("debuggedfile") && !vscode.window.activeTextEditor.document.fileName.includes(".log")) {
    var selectedLine = vscode.window.activeTextEditor.selection.start.line;
    var fs = require('fs');
    fs.readFile(debugOutputpath, function(err, data) {
      if (err) throw err;
      var array = data.toString().split('\n');
      var lineData = [];
      var lineToMoveTo = 0;
      var currentIndex = 0;
      var notNotes = true;

      for (var i = 0; i < array.length; i++) {
        // support for notes. These are not output on debug lines, so they must be skipped
        if (array[i].includes("!DEBUG")) {
          notNotes = true;
          if (array[i].includes("notes")) {
            notNotes = false;
          }          
        }

        if (!array[i].includes("!DEBUG") && notNotes) {
          if (currentIndex == selectedLine) {
            if (selectedLine == lastSelectedLine) {
              try {
                lineToMoveTo = parseInt(lineData[lineData.length - (amountToMove + 1)].split(':')[2]);
                if (isNaN(lineToMoveTo)) {
                  amountToMove = 0;
                  lineToMoveTo = parseInt(lineData[lineData.length - (amountToMove + 1)].split(':')[2]);
                } else {
                  amountToMove = amountToMove + 1;
                }
              } catch (e) {
                amountToMove = 0;
              }
            }
            moveLine(lineToMoveTo);
          }
          currentIndex += 1;
        }
        lineData.push(array[i]);
      }
    });
    lastSelectedLine = selectedLine;
  }
}

function onPickedItem(picked) {
  if (picked == "Post process") {
    if (!fs.existsSync(cncFile)) {
      checkDirSize(cncFilesLocation);
    } else {
      var tmpPostFile = tmp + "\\" + path.basename(cncFile);
      postProcess(tmpPostFile, vscode.window.activeTextEditor.document.fileName);
    }

  } else if (picked == "Change CNC file") {
    checkDirSize(cncFilesLocation);
  } else if (picked == "Intelligent Editing") {
    intelEdit();
  } else if (picked == "Help") {
    help();
  }
}

function intelEdit() {
  var tempDoc = tmp + "/" + path.basename(vscode.window.activeTextEditor.document.fileName.toString()) + ".js";
  fs.createReadStream(vscode.window.activeTextEditor.document.fileName.toString()).pipe(fs.createWriteStream(tempDoc));
  vscode.window.showTextDocument(vscode.workspace.openTextDocument(tempDoc), vscode.window.activeTextEditor.viewColumn);
}

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath)
    .map(file => path.join(srcpath, file))
    .filter(path => fs.statSync(path).isDirectory());
}

function selectSub(dir) {
  var dirs = getDirectories(dir);
  var newList = [];
  for (var i = 0; i < dirs.length; i++) {
    var basename = dirs[i].replace(/\\/g, '/').replace(/.*\//, '');
    newList.push(basename);
  }
  newList.push("Browse...");
  var selection = vscode.window.showQuickPick(newList).then(val => {
    if (val == "Browse...") {
      vscode.window.showOpenDialog({openFiles: true, filters: {'CNC Files': ['cnc']}}).then(val => {
        var selectedPath = val[0].path.substr(1, val[0].path.length);
        cncFile = selectedPath;
        selectUnits();
      });
    } else {
      checkDirSize(dir + "\\" + val)
    }
  });
}

function checkDirSize(dir) {
  if (!dir) dir = resLocation + "\\CNC files";
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
  // ListItems = vscode.workspace.findFiles( '**/*.cnc', '**/node_modules/**', 10);
  for (var i = 0; i < lists.length; i++) {
    if (lists[i].toString().toUpperCase().includes(".CNC")) {
      ListItems.push(p + "\\" + lists[i].toString());
    }
  }

  var newList = [];
  for (var i = 0; i < ListItems.length; i++) {
    var basename = ListItems[i].replace(/\\/g, '/').replace(/.*\//, '');
    newList.push(basename);
  }
  var opts = QuickPickOptions = {placeHolder: "Select a the required CNC to post process"};
  var g = vscode.window.showQuickPick(newList).then(val => selectedCNCFile(val, ListItems));
}

function selectedCNCFile(picked, fullList) {
  var itemToUse = undefined;
  for (var i = 0; i < fullList.length; i++) {
    var basename = fullList[i].replace(/\\/g, '/').replace(/.*\//, '');
    if (picked == basename) {
      itemToUse = fullList[i];
    }
  }

  if (itemToUse) {
    cncFile = itemToUse;
    selectUnits();
  }
  var htmlPath = cncFile.substring(0, cncFile.length - 3) + "html";
  if (fs.existsSync(htmlPath)) {
    var lines = fs.readFileSync(htmlPath);
    showSetupSheet(lines.toString());
  }

}

function selectUnits() {
  vscode.window.showInformationMessage("Please select the required units", "MM", "INCH").then(val => {
    if (val == "MM") {
      units = 1;
    } else if (val == "INCH") {
      units = 0;
    }
  });
}

function postProcess(cnc, postLocation) {
  var child = require('child_process').execFile;
  var executablePath = postLoc;
  var parameters = [];
  var activeEdit = vscode.window.activeTextEditor;
  var currentLine = vscode.window.activeTextEditor.selection.start.line;
  if (vscode.window.activeTextEditor.document.fileName.toUpperCase().indexOf(".CPS") >= 0) {
    postFile = vscode.window.activeTextEditor.document.fileName.toString();
  }

  if (showDebugOutput) {
    parameters = ["--noeditor", "--quiet", "--debugall", "--property", "unit", units.toString(), "--property", "programName", "1005", postLocation, cncFile, outputpath];
  } else {
    parameters = ["--noeditor", "--quiet", "--debugall", "--shorten", "50", "--property", "unit", units.toString(), "--property", "programName", "1005", postLocation, cncFile, outputpath];
  }
  var passed = false;
  child(executablePath, parameters, function(err, data) {
    if (err) {
      if (fs.existsSync(logPath)) {
        vscode.window.showInformationMessage("Post processing failed, see the log for details");
        vscode.window.showTextDocument(vscode.workspace.openTextDocument(logPath), vscode.ViewColumn.Two);
      } else {
        vscode.window.showInformationMessage("Post processing failed");
      }
    }
    console.log(err)
    console.log(data.toString());
  });

  wait(2000);

  if (fs.existsSync(outputpath)) {
    vscode.window.showTextDocument(vscode.workspace.openTextDocument(outputpath), vscode.ViewColumn.Two);
    if (!showDebugOutput) {
      wait(100);
      fs.readFile(outputpath, function(err, data) {
        var array = data.toString().split('\n');
        var lines = "";
        var lineData = "!DEBUG:" + postLocation + '\n';
        var writeOutput = true;
        for (var i = 0; i < array.length; i++) {
          if (!writeOutput && array[i].includes("!DEBUG")) {
            writeOutput = true;            
          }
          if (array[i].includes("!DEBUG") && (array[i].includes("notes") || array[i].toUpperCase().includes("MATERIAL"))) {
            writeOutput = false;
          }
          if (!array[i].includes("!DEBUG") && writeOutput) {
            lines = lines + array[i] + '\n';
          }
          
          lineData += array[i] + '\n';
        }
        var file = fs.createWriteStream(outputpath);
        file.on('error', function(errors) { /* error handling */});
        file.write(lines);
        file.end();

        file = fs.createWriteStream(debugOutputpath);
        file.on('error', function(errors) { /* error handling */});
        file.write(lineData);
        file.end();
      });
    }
  }

  vscode.window.visibleTextEditors[0].selection.start.line = 10;
}

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

function moveLine(line) {
  var docToShow = undefined;
  var docFound = false;

  for (var i = 0; i < vscode.window.visibleTextEditors.length; i++) {
    var activeFile = vscode.window.visibleTextEditors[i];
    if (activeFile.document.fileName == postFile) {
      docFound = true;
      docToShow = activeFile;
    }
  }

  if (docFound) {
    if (enableLineSelection) {
      vscode.window.showTextDocument(docToShow.document, vscode.ViewColumn.One);
      vscode.commands.executeCommand("cursorMove", {
        to: "up",
        by: "line",
        select: false,
        value: 100000
      });
      vscode.commands.executeCommand("cursorMove", {
        to: "down",
        by: "line",
        select: false,
        value: line - 1
      });
      vscode.commands.executeCommand("cursorMove", {
        to: "wrappedLineEnd",
        select: false
      });
      vscode.commands.executeCommand("cursorMove", {
        to: "wrappedLineStart",
        select: true
      });
    }
  } else {
    if (!enableLineSelection) {
      vscode.window.showErrorMessage("The post processor (" + postFile + ") that created this output has been closed!");
    }
  }
}

function copyF(fileToCopy) {
  //set the path for the temporary post EXE
  var tmpPostFile = tmp + "/" + path.basename(fileToCopy);
  // if the post exe isn't in the temp directory, copy it
  if (!fs.exists(tmpPostFile)) {
    fs.createReadStream(fileToCopy).pipe(fs.createWriteStream(tmpPostFile));
  }
}

function copyFile(src, destination) {
  fs.createReadStream(src).pipe(fs.createWriteStream(destination));
}

function copyCNCFiles() {
  let loc = resLocation + "\\CNC files\\Custom";
  if (fs.existsSync(loc)) {
    let cncFiles = fs.readdirSync(loc);
    if (cncFiles.length > 0) {
      if (!fs.existsSync(customCNC)) {
        if (!fs.existsSync(tmp + "\\Autodesk")) {
          fs.mkdirSync(tmp + "\\Autodesk")
        }
        if (!fs.existsSync(tmp + "\\Autodesk\\VSCode")) {
          fs.mkdirSync(tmp + "\\Autodesk\\VSCode");
        }
        fs.mkdirSync(customCNC);
      }
    }
    for (var i = 0; i < cncFiles.length; ++i) {
      let activeCNC = loc + "\\" + cncFiles[i];
      if (fs.existsSync(activeCNC)) {
        let copyLocation = customCNC + "\\" + cncFiles[i];
        if (!fs.existsSync(copyLocation)) {
          copyFile(activeCNC, copyLocation);
        }
      }
    }
  }
}

function deactivate() {
  console.log("Thank you for using the HSM post development addin!");
}
exports.deactivate = deactivate;
