import React from 'react';
import {
    DataContextInterface,
} from './types';

const DataContext = React.createContext<DataContextInterface>({
    ncStreamCommands: [],
    gCodeCommands: [],
    formatCommands: [],
    variableCommands: [],
    variableStates: [],
    callStacks: [],
    handleGCodeLineClicked: () => { },
    handleNCStreamLineClicked: () => { },
    handleCallStackLineClicked: () => { },
    handleVariableLineClicked: () => { },
    selectedCommandLine: 0,
    selectedGCodeLine: null,
    selectedCallStack: null,
    currentState: [],
    relevantVariables: [],
    selectedVariable: null,
    selectedCallStackLine: null,
    selectedPostFileLine: null,
    postFilename: '',
    postFileContents: '',
    toolPathData: [],
});

export default DataContext;
