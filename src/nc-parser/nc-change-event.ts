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
import { NCEvent, NCStackFrame } from './nc-event';

type NCValueType = number | string | boolean;

export interface DebugVariable {
    name: string;
    value: NCValueType;
}

export default class NCChangeEvent implements NCEvent {
    readonly type: string = 'change';

    variable: string;

    value: NCValueType;

    callstack: NCStackFrame[];

    constructor(variable: string, value: NCValueType);
    constructor(instanceData: DebugVariable);
    constructor(varOrInstance: string | DebugVariable, value?: NCValueType) {
        if (typeof varOrInstance === 'string' && value) {
            this.variable = varOrInstance;
            this.value = value;
        } else {
            const instanceData = varOrInstance as DebugVariable;
            this.variable = instanceData.name;
            this.value = instanceData.value;
        }
        this.callstack = [];
    }
}
