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
