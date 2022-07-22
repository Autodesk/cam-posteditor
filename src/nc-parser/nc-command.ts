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
import NCInvocation from './nc-invocation';

export type NCVector = { x: number, y: number, z:number };
export type NCArgument = string | number | NCVector;

export default class NCCommand {
    name = '';

    args: Record<string, NCArgument> = {};

    invocations: NCInvocation[] = [];

    constructor(instanceData?: NCCommand) {
        if (instanceData) {
            this.deserialize(instanceData);
        }
    }

    deserialize(instanceData: NCCommand): void {
        this.name = instanceData.name;
        this.args = instanceData.args;
    }

    pushInvocation(invocation: NCInvocation): void {
        this.invocations.push(invocation);
    }

    lastInvocation(): NCInvocation {
        if (this.invocations.length === 0) {
            this.invocations.push(new NCInvocation(''));
        }
        return this.invocations[this.invocations.length - 1];
    }
}
