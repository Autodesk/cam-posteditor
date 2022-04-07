# Autodesk Fusion 360 Post Editor for Visual Studio Code

Welcome to the Autodesk Fusion 360 post editing extension for Visual Studio Code (https://code.visualstudio.com/). This extension adds several functions that will aid you when working on post development specifically for Fusion 360, Inventor HSM, Inventor HSM Express, HSMWorks, and HSMXpress. Please note that this utility is not compatible with FeatureCAM, PartMarker, and PowerMILL.

To learn more about the CAM solutions see:
https://www.autodesk.com/solutions/manufacturing/cam

The repository for the extension is hosted at:
https://github.com/Autodesk/cam-posteditor

You can get the installation for Visual Studio Code at:
https://marketplace.visualstudio.com/items?itemName=Autodesk.hsm-post-processor

The extension is distributed under the MIT license. See LICENSE.txt.

## Features
- Post directly from VS Code.
- Quick view post processor variables and functions.
- Jump to code by clicking line in NC output.


## Get started
To get started with this extension, install from the VS Code marketplace or using the VSIX. Once installed, open a .cps file and press F1 and type 'HSM Post Utility' then click 'help' for instructions on how to use the extension.

You can download factory posts via the online post library:
http://cam.autodesk.com/posts

## Contributions

In order to clarify the intellectual property license granted with Contributions from any person or entity, Autodesk must have a Contributor License Agreement ("CLA") on file that has been signed by each Contributor to this Open Source Project (the “Project”), indicating agreement to the license terms. This license is for your protection as a Contributor to the Project as well as the protection of Autodesk and the other Project users; it does not change your rights to use your own Contributions for any other purpose. There is no need to fill out the agreement until you actually have a contribution ready. Once you have a contribution you simply fill out and sign the applicable agreement (see the contributor folder in the repository) and send it to us at cam.posts@autodesk.com.


## Trademarks

The license does not grant permission to use the trade names, trademarks, service marks, or product names of Autodesk, except as required for reasonable and customary use in describing the origin of the work and reproducing the content of any notice file. Autodesk, the Autodesk logo, Inventor HSM, HSMWorks, HSMXpress, Fusion 360, FeatureCAM, PartMarker, and PowerMILL are registered trademarks or trademarks of Autodesk, Inc., and/or its subsidiaries and/or affiliates in the USA and/or other countries. All other brand names, product names, or trademarks belong to their respective holders. Autodesk is not responsible for typographical or graphical errors that may appear in this document.


The HSM post team

# Developer notes - Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

# Running G Code Debugger in VSCode extension

- Build or get latest postprocessor from https://git.autodesk.com/Fusion360CAM/postprocessor/tree/feature/walnut-innovation.
- Build GCodeDebugger with `npm run build` command. It should create bundled version `VSCodeExtension/res/GCodeDebugger/index.html`.
- In debugger panel choose `Run Extension` and press `F5`. New VSCode window should be opened with running extension.
- Press `F1` and type `HSM`, select `Change post executable`, and select location of postprocessor from first step.
- Open some post from library.
- On the left side panel, in CNC selector select cnc file.
- Press `F1` and type `HSM`, select `post utility\Post Process`.
- If post processing was successfull you should see G-code debugger view.

# Running G Code Debugger in Fusion

- Build or get latest postprocessor from https://git.autodesk.com/Fusion360CAM/postprocessor/tree/feature/walnut-innovation.
- Build GCodeDebugger with `npm run build` command. It should create bundled version `VSCodeExtension/res/GCodeDebugger/index.html`.
- Build release version of FusionMake from https://git.autodesk.com/Fusion360CAM/fusionmake/tree/feature/walnut-innovation.
- Put new postprocessor executable into `fusionmake\Lib64\Release_Build\Release\Applications\CAM360`.
- Put bundled `index.html` into `fusionmake\Lib64\Release_Build\Release\Applications\CAM360\g-code-debugger`.
- Run Fusion and open or create NC program with some operations.
- Select `Open G Code Debugger` checkbox in NC program dialog.
- Post process it.
- If post processing was successfull, debugger window should be opened.
