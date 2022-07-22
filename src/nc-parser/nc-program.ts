import NCCommand from './nc-command';
import { NCEvent, NCStackFrame } from './nc-event';
import NCOutputEvent from './nc-output-event';
import NCInvocation from './nc-invocation';
import NCChangeEvent, { DebugVariable } from './nc-change-event';

interface ParseResult{
    kind: 'command' | 'stackFrame' | 'invocation' | 'event';
    ncobj: NCCommand | NCStackFrame | NCInvocation | NCEvent;
}

export default class NCProgram {
    commands: NCCommand[];

    constructor(ncCode?: string) {
        this.commands = [];
        if (ncCode) {
            this.parseString(ncCode);
        }
    }

    parseString(ncCode: string): void {
        let stack : NCStackFrame[] = [];
        ncCode.split('\n').forEach((line : string) => {
            const result = NCProgram.parseLine(line.trim());
            switch (result.kind) {
                case 'command':
                    this.pushCommand(result.ncobj as NCCommand);
                    break;
                case 'invocation':
                    this.lastCommand().pushInvocation(result.ncobj as NCInvocation);
                    break;
                case 'stackFrame':
                    stack.push(result.ncobj as NCStackFrame);
                    break;
                case 'event':
                    {
                        const event = result.ncobj as NCEvent;
                        // Copy stack into event
                        event.callstack = stack.slice();
                        this.lastCommand().lastInvocation().events.push(event);
                        // Reset stack
                        stack = [];
                    }
                    break;
                default:
                    break;
            }
        });
    }

    private static parseLine(line: string): ParseResult {
        const commandRe = /!DEBUG: command:({.+})/;
        const stackRe = /!DEBUG: \d+ (.+):(\d+)/;
        const invokeRe = /!DEBUG: (.+)/;
        const variableRe = /!DEBUG: variable:({.+})/;

        const commandMatch = commandRe.exec(line);
        if (commandMatch) {
            return {
                kind: 'command',
                ncobj: new NCCommand(JSON.parse(commandMatch[1]) as NCCommand),
            };
        }

        const stackMatch = stackRe.exec(line);
        if (stackMatch) {
            return {
                kind: 'stackFrame',
                ncobj: {
                    filename: stackMatch[1],
                    lineNumber: parseInt(stackMatch[2], 10),
                } as NCStackFrame,
            };
        }

        const variableMatch = variableRe.exec(line);
        if (variableMatch) {
            return {
                kind: 'event',
                ncobj: new NCChangeEvent(JSON.parse(variableMatch[1]) as DebugVariable),
            };
        }

        const invokeMatch = invokeRe.exec(line);
        if (invokeMatch) {
            return {
                kind: 'invocation',
                ncobj: new NCInvocation(invokeMatch[1]),
            };
        }

        return {
            kind: 'event',
            ncobj: new NCOutputEvent(line),
        };
    }

    pushCommand(command: NCCommand): void {
        this.commands.push(command);
    }

    lastCommand(): NCCommand {
        if (this.commands.length === 0) {
            this.commands.push(new NCCommand());
        }
        return this.commands[this.commands.length - 1];
    }
}
