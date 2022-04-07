import { NCEvent } from './NCEvent';

export default class NCInvocation {
    JsCall: string;

    events: NCEvent[];

    constructor(JsCall: string) {
        this.JsCall = JsCall;
        this.events = [];
    }
}
