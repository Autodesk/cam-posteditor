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
import { readFileSync } from 'fs';
import NCChangeEvent from '../nc-change-event';
import { NCStackFrame } from '../nc-event';
import NCOutputEvent from '../nc-output-event';
import NCProgram from '../nc-program';

let ncCode = '';

beforeAll(() => {
    ncCode = readFileSync(`${__dirname}/test.nc`, { encoding: 'utf8' });
});

test('loads from string', () => {
    const program = new NCProgram(ncCode);
    expect(program.commands).toHaveLength(1797);

    const onSectionCommand = program.commands[342];
    expect(onSectionCommand).toHaveProperty('name', 'onSection');
    expect(onSectionCommand.invocations).toHaveLength(1);

    const invocation = onSectionCommand.lastInvocation();
    expect(invocation.events).toHaveLength(22);

    const modalChangeEvent = invocation.events[1];
    expect(modalChangeEvent).toBeInstanceOf(NCChangeEvent);
    if (modalChangeEvent instanceof NCChangeEvent) {
        expect(modalChangeEvent.variable).toBe('gAbsIncModal');
        expect(modalChangeEvent.value).toBe('G91');
        expect(modalChangeEvent.callstack).toHaveLength(2);
        expect(modalChangeEvent.callstack).toContainEqual<NCStackFrame>({
            filename: 'fanuc.cps',
            lineNumber: 2964,
        });
    }

    const homeOutputEvent = invocation.events[2];
    expect(homeOutputEvent).toBeInstanceOf(NCOutputEvent);
    if (homeOutputEvent instanceof NCOutputEvent) {
        expect(homeOutputEvent.output).toBe('N20 G28 G91 Z0.');
        expect(homeOutputEvent.callstack).toHaveLength(3);
        expect(homeOutputEvent.callstack).toContainEqual<NCStackFrame>({
            filename: 'fanuc.cps',
            lineNumber: 378,
        });
    }
});
