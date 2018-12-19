# Change Log

## 2.0.6
Fixed:
  - line selection only working on the first instance of the stack trace

## 2.0.5
Added:
  - Added some logic to determine the Fusion install location and automatically select the post.exe location
  
## 2.0.4
Updated:
  - Modified export CPS file to support new VSCode update
  
## 2.0.0
Added:
  - Option for two click line jumping
  - Open folder right click option to CNC tree
  - Auto focus on a line which causes an error (if possible)
  - Auto clear notifications

Fixed:
  - Peck drilling CNC file
  - Coolant CNC files

## 1.11.7
Added:
- 'All files' option to the CNC list
- User setting to specify the shorten code line limit

Fixed:
- Log file not opening when NC appears for failed toolpaths

## 1.11.6
Fixed:
- Log stays open after the post failure

Updated:
- Major post processor speed improvement

## 1.11.5
Fixed:
- Stopped the output window from being 'reloaded' when post processing

## 1.11.4
Fixed:
- Keep post window active when post processing

## 1.11.3
Added:
- User setting to keep the 'disable auto line selection' state between sessions
 
## 1.11.2
Added:
- User setting to enable a color-coded output of lines
  - User settings to allow color override for movements
  
## 1.11.1
Fixed: 
- Line jumping issue when the Inventor material appears on multiple lines

## 1.11.0
Added:
- User setting 'HSMPostUtility.shortenOutputCode' to let users disable the code shortening post option
- User setting 'HSMPostUtility.outputUnits' to specify outputted units, rather than having a prompt on CNC file selection
- User setting 'HSMPostUtility.postOnCNCSelection' which when enabled, post processes when a CNC file is selected

Updated:
- Active function icon now uses #00a1ff to support the light color theme

## 1.10.4
Added:
- Post help function
  - Open by right clicking on a variable in the variable list
  - Open by running the command 'HSM: Post help'
- Additional error checking

## 1.10.3
Fixed:
- Line jumping when using operation notes

## 1.10.2
Fixed:
- Minor bug fix

## 1.10.1
Fixed:
- Notes being displayed in the output
- Material being displayed in the output

## 1.9.2
Added:
- Support for deleting custom CNC files by right clicking on them in the CNC tree
- Custom CNC check on installation

Notes:
From this version on, custom CNC files will be stored in your temporary files, as well as the extension directory. These files are then copied to the extension directory, from the temporary directory if the extension is re-installed / updated.

## 1.9.0
Fixed:
- CNC extractor post processor

## 1.8.9
Added:
- 'Auto update' to the function list
- Setting to turn off auto updating the functiton list
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