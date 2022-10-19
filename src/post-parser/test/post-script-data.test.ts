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
import PostScriptData from '../post-script-data';

let postScript = '';

beforeAll(() => {
    postScript = readFileSync(`${__dirname}/test.cps`, { encoding: 'utf8' });
});

test('parse a post', () => {
    expect(postScript !== '');
    const postData = new PostScriptData(postScript);
    expect(postData.source === postScript);

    // Clean source should have got rid of any comment
    expect(!postData.cleanSource.includes('/*'));
    expect(!postData.cleanSource.includes('*/'));
    expect(!postData.cleanSource.includes('//'));

    const expectedFormats = [
        'gFormat',
        'mFormat',
        'hFormat',
        'dFormat',
        'probeWCSFormat',
        'xyzFormat',
        'ijkFormat',
        'rFormat',
        'abcFormat',
        'feedFormat',
        'inverseTimeFormat',
        'pitchFormat',
        'toolFormat',
        'rpmFormat',
        'secFormat',
        'milliFormat',
        'taperFormat',
        'oFormat',
        'peckFormat',
    ];

    expect(postData.formats.length = expectedFormats.length);
    expect(postData.formats.every(
        (value, index) => value === expectedFormats[index],
    ));

    const expectedVars = [
        'xOutput',
        'yOutput',
        'zOutput',
        'aOutput',
        'bOutput',
        'cOutput',
        'feedOutput',
        'inverseTimeOutput',
        'pitchOutput',
        'sOutput',
        'dOutput',
        'peckOutput',
        'iOutput',
        'jOutput',
        'kOutput',
        'gMotionModal',
        'gPlaneModal',
        'gAbsIncModal',
        'gFeedModeModal',
        'gUnitModal',
        'gCycleModal',
        'gRetractModal',
        'gRotationModal',
    ];
    expect(postData.variables.length = expectedVars.length);
    expect(postData.variables.every(
        (value, index) => value === expectedVars[index],
    ));
});
