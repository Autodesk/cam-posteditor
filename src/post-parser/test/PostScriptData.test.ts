import { readFileSync } from 'fs';
import PostScriptData from '../PostScriptData';

let postScript = '';

beforeAll(() => {
    postScript  = readFileSync(`${__dirname}/test.cps`, { encoding: 'utf8' });
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
        'peckFormat'
    ];

    expect(postData.formats.length = expectedFormats.length);
    expect(postData.formats.every(
        (value, index) => {
            return value == expectedFormats[index]
        }
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
        'gRotationModal'
    ];
    expect(postData.variables.length = expectedVars.length);
    expect(postData.variables.every(
        (value, index) => {
            return value == expectedVars[index]
        }
    ));

});