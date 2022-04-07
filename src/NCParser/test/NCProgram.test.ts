import { readFileSync } from 'fs';
import NCChangeEvent from '../NCChangeEvent';
import { NCStackFrame } from '../NCEvent';
import NCOutputEvent from '../NCOutputEvent';
import NCProgram from '../NCProgram';

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
