import { NCEvent, NCStackFrame } from './NCEvent';

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
