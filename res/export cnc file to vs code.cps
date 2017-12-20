/**
  Copyright (C) 2017 by Autodesk, Inc.
  All rights reserved.
  
  FORKID {D38E0AF6-F1A7-4C6D-A0FA-C99BB29E65AE}
*/

description = "Export CNC file to Visual Studio Code";
vendor = "Autodesk";
vendorUrl = "http://www.autodesk.com";
legal = "Copyright (C) 2012-2017 by Autodesk, Inc.";
certificationLevel = 2;
minimumRevision = 41666;

longDescription = "The post installs the CNC file for use with the Autodesk HSM Post Processor extension for Visual Studio Code.";

capabilities = CAPABILITY_INTERMEDIATE;

function onSection() {
  skipRemainingSection();
}

function onClose() {
  if (!FileSystem.isFolder(FileSystem.getTemporaryFolder())) {
    FileSystem.makeFolder(FileSystem.getTemporaryFolder());
  }
  var path = FileSystem.getTemporaryFile("post");

  var registryPaths = [
    "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{F8A2A208-72B3-4D61-95FC-8A65D340689B}_is1",
    "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{C26E74D1-022E-4238-8B9D-1E7564A36CC9}_is1",
    "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{EA457B21-F73E-494C-ACAB-524FDE069978}_is1",
    "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{1287CAD5-7C8D-410D-88B9-0D1EE4A83FF2}_is1"
  ];

  var exePath;
  for (var i = 0; i < registryPaths.length; ++i) {
    if (hasRegistryValue(registryPaths[i], "InstallLocation")) {
      exePath = getRegistryString(registryPaths[i], "InstallLocation");
      break; // found
    }
  }

  if (exePath) {
    exePath = FileSystem.getCombinedPath(exePath, "\\bin\\code.cmd");
  } else {
    error(localize("Visual Studio Code not found."));
    return;
  }

  var a = "code --list-extensions --show-versions";
  execute(exePath, a + ">" + path, false, "");

  var result = {};
  try {
    var file = new TextFile(path, false, "utf-8");
    while (true) {
      var line = file.readln();
      var index = line.indexOf("@");
      if (index >= 0) {
        var name = line.substr(0, index);
        var value = line.substr(index + 1);
        result[name] = value;
      }
    }
  } catch (e) {
    // fail
  }
  file.close();

  FileSystem.remove(path);

  var gotValues = false;
  for (var name in result) {
    gotValues = true;
    break;
  }

  var foundExtension = false;
  var extension;
  for (var name in result) {
    var value = result[name];
    switch (name) {
    case "Autodesk.hsm-post-processor":
      extension = name + "-" + value;
      foundExtension = true;
      break;
    }
  }
  if (!foundExtension) {
    error(localize("Autodesk HSM Post Processor extension not found."));
    return;
  }

  var cncPath = getIntermediatePath();
  var userProfile = getEnvironmentVariable("USERPROFILE");
  var extensionFolder = FileSystem.getCombinedPath(userProfile, "\\.vscode\\extensions\\" + extension);

  if (FileSystem.isFile(cncPath)) {
    if (!FileSystem.isFolder(extensionFolder)) {
      error(localize("Autodesk HSM Post Processor extension not found."));
      return;
    }
    var customFolder =  FileSystem.getCombinedPath(extensionFolder, "\\res\\CNC files\\Custom");
    if (!FileSystem.isFolder(customFolder)) {
      FileSystem.makeFolder(customFolder);
    }
    var fileName = FileSystem.getFilename(cncPath);
    FileSystem.copyFile(cncPath, FileSystem.getCombinedPath(customFolder, fileName));
  }
  writeln("Success, your CNC file " + "\"" + fileName + "\"" + " is now located in " + "\"" + customFolder + "\"" + " and you can select it in VS Code.");
}
