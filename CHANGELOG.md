# Change Log
## 1.9.2
Added:
- Support for deleting custom CNC files by right clicking on them in the CNC tree
- Custom CNC check on installation

Notes:
From this version on, custom CNC files will be stored in your temporary files, as well as the extension directory. These files are then copied to the extension directory, from the temporary directory if the exension is re-installed / updated.

## 1.9.0
Fixed:
- CNC extractor post processor

## 1.8.9
Added:
- 'Auto update' to the function list
- Setting to turn off auto updating the funciton list
- Current function indicator to the function list
- New command 'HSM: Download CNC exporting post processor', used to download a CPS file which can be used to export CNC files to be used in VS Code.

## 1.8.8
Added:
- Ability to reselect the post executable
- Auto CPS language extension support
- Unit selection when choosing a CNC file

Fixed:
- Extension startup issues

## 1.8.7
Fixed:
- Log file remains open when using 'post on-save'
- HSM.postProcess allows posting of all file types

## 1.8.6
Added:
- CNC file browse option
- CNC file selection tree
- User settings

Changed:
- 'Post executable not found' text box now opens an file dialog, allowing you to select the post executable

## 1.8.5
- Initial release