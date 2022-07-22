/*
Copyright (c) 2021 by Autodesk, Inc.

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
import { Color4, Vector3 } from '@babylonjs/core';
import { NCArgument } from './nc-parser/nc-command';

// ====== Line Data interfaces ======

export interface LineData {
    commandLineNumber: number
}

export interface GCodeLineData extends LineData {
    output: string,
    commandLineNumber: number
    invocationNumber: number
    eventNumber: number,
    gCodeLineNumber: number
}

export interface NCStreamLineData extends LineData {
    commandName: string,
    commandArgs: Record<string, NCArgument>,
    commandLineNumber: number
}

export interface FormatLineData extends LineData {
    name: string
}

export interface VariableLineData extends LineData {
    name: string
}

export interface LineDataProps {
    style: React.CSSProperties,
    data: LineData[],
    index: number,
}

export interface CallStackLineData extends LineData {
    commandLineNumber: number,
    stackFrameNumber: number,
    functionSignature: string,
    lineNumber: number,
}

export interface CallStackData {
    commandLineNumber: number
    invocationNumber: number
    eventNumber: number
    callStackData: CallStackLineData[]
}

// ====== variable Data ======
export interface VariableEventData {
    value: string | boolean | number,
    commandLineNumber: number
    invocationNumber: number
    eventNumber: number,
}

export interface VariableData {
    name: string,
    events: VariableEventData[]
}

export interface VariableState extends VariableEventData {
    name: string,
}

export interface ToolPathSection {
    commandIndex: number;
    colors: Color4[];
    segments: Vector3[];
}

// ====== App Data Context interfaces ======

export type OnGCodeLineClickHandler = (eventData: GCodeLineData) => void;
export type OnNCStreamLineClickHandler = (eventData: NCStreamLineData) => void;
export type OnCallStackLineClickHandler = (eventData: CallStackLineData) => void;
export type OnVariableLineClickHandler = (eventData: VariableState) => void;

export interface DataContextInterface {
    // Main data to be used by the lists
    ncStreamCommands: NCStreamLineData[],
    gCodeCommands: GCodeLineData[],
    // Main data to be used by the middle view
    formatCommands: FormatLineData[],
    variableCommands: VariableLineData[],
    variableStates: VariableData[],
    callStacks: CallStackData[],
    toolPathData: ToolPathSection[],

    // Click handlers for each type of list
    handleGCodeLineClicked: OnGCodeLineClickHandler,
    handleNCStreamLineClicked: OnNCStreamLineClickHandler,
    handleCallStackLineClicked: OnCallStackLineClickHandler,
    handleVariableLineClicked: OnVariableLineClickHandler,

    // Control variables
    selectedCommandLine: number,
    selectedGCodeLine: number | null,
    selectedCallStack: CallStackData | null,
    currentState: VariableState[],
    relevantVariables: string[],
    selectedVariable: string | null;
    selectedCallStackLine: number | null,
    selectedPostFileLine: number | null,
    postFilename: string,
    postFileContents: string,
}
