import {
    AbstractScene,
} from '@babylonjs/core';
import NCChangeEvent from '../../nc-parser/nc-change-event';
import NCCommand from '../../nc-parser/nc-command';
import NCInvocation from '../../nc-parser/nc-invocation';
import NCOutputEvent from '../../nc-parser/nc-output-event';
import NCProgram from '../../nc-parser/nc-program';
import { GCodeLineData, NCStreamLineData } from '../../types';
import { extractGCodeLineData, extractNcStreamLineData } from '../data-converter';

describe('Testing DataConverter', () => {
    const i1 = new NCInvocation('');
    i1.events = [new NCChangeEvent('milling', true)];

    const e1 = new NCChangeEvent('gRotationModal', 'G69');
    e1.callstack = [
        {
            filename: 'fanuc.cps',
            lineNumber: 545,
        },
    ];
    const e2 = new NCChangeEvent('saveShowSequenceNumbers', true);
    e2.callstack = [
        {
            filename: 'fanuc.cps',
            lineNumber: 558,
        },
    ];
    const e3 = new NCOutputEvent('%');
    e3.callstack = [
        {
            filename: 'fanuc.cps',
            lineNumber: 559,
        },
    ];
    const e4 = new NCOutputEvent('O0123');
    e4.callstack = [
        {
            filename: 'fanuc.cps',
            lineNumber: 587,
        },
    ];

    const i2 = new NCInvocation('onOpen()');
    i2.events = [e1, e2, e3, e4];

    const c1 = new NCCommand();
    c1.name = 'test command';
    c1.invocations = [i1, i2];

    // ==============================================

    const c2 = new NCCommand();
    c2.name = 'onParameter';
    c2.args = {
        name: 'http://www.cimco-software.com/namespace/nc/parameter/product-id',
        value: 'inventorhsm',
    };
    c2.invocations = [new NCInvocation("onParameter('product-id', 'inventorhsm')")];

    // ==============================================

    const e5 = new NCChangeEvent('zOutput', 'Z16.');
    e5.callstack = [
        {
            filename: 'fanuc.cps',
            lineNumber: 2520,
        },
    ];
    const e6 = new NCChangeEvent('gMotionModal', 'G00');
    e6.callstack = [
        {
            filename: 'fanuc.cps',
            lineNumber: 2526,
        },
    ];
    const e7 = new NCOutputEvent('N525 G00 Z16.');
    e7.callstack = [
        {
            filename: 'fanuc.cps',
            lineNumber: 378,
        },
        {
            filename: 'fanuc.cps',
            lineNumber: 2526,
        },
    ];

    const i3 = new NCInvocation('onRapid(29.6437, -8.9525, 16)');
    i3.events = [e5, e6, e7];

    const c3 = new NCCommand();
    c3.name = 'onRapid';
    c3.args = {
        end: {
            x: 29.643749237060547,
            y: -8.952500343322754,
            z: 16,
        },
        flags: 0,
    };
    c3.invocations = [i3];

    const testData = new NCProgram();
    testData.commands = [c1, c2, c3];

    it('Testing extractGCodeLineData()', () => {
        const expectedGCodeLineData: GCodeLineData[] = [
            {
                output: '%',
                commandLineNumber: 0,
                invocationNumber: 1,
                eventNumber: 2,
                gCodeLineNumber: 0,
            },
            {
                output: 'O0123',
                commandLineNumber: 0,
                invocationNumber: 1,
                eventNumber: 3,
                gCodeLineNumber: 1,
            },
            {
                output: 'N525 G00 Z16.',
                commandLineNumber: 2,
                invocationNumber: 0,
                eventNumber: 2,
                gCodeLineNumber: 2,
            },
        ];

        const actual = extractGCodeLineData(testData);
        expect(actual).toStrictEqual(expectedGCodeLineData);
    });

    it('Testing extractNcStreamLineData()', () => {
        const expectedNCStreamLineData: NCStreamLineData[] = [
            {
                commandName: 'test command',
                commandLineNumber: 0,
                commandArgs: {},
            },
            // onParameter should be skipped for now
            {
                commandName: 'onRapid',
                commandLineNumber: 2,
                commandArgs: {
                    end: {
                        x: 29.643749237060547,
                        y: -8.952500343322754,
                        z: 16,
                    },
                    flags: 0,
                },
            },
        ];

        const actual = extractNcStreamLineData(testData);
        expect(actual).toStrictEqual(expectedNCStreamLineData);
    });
});
