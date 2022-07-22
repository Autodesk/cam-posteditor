export interface NCStackFrame {
    filename: string;
    lineNumber: number;
}

export interface NCEvent {
    readonly type: string;
    callstack: NCStackFrame[];
}
