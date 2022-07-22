import { NCEvent } from './nc-event';

export default class NCInvocation {
    JsCall: string;

    events: NCEvent[];

    constructor(JsCall: string) {
        this.JsCall = JsCall;
        this.events = [];
    }
}
