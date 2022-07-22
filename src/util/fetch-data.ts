declare type PromiseCallback = (data: string) => void;
interface PromiseInterface {
    resolve: PromiseCallback,
    reject: PromiseCallback
}

interface VSCodeMessage {
    request: string;
    data?: string;
    error?: string;
}

interface VSCodeEvent {
    data: VSCodeMessage;
}

interface VSCodeRequest {
    request: string;
}

interface VSCodeInterface {
    postMessage: (a: VSCodeRequest) => void;
}

declare function acquireVsCodeApi(): VSCodeInterface;

const registeredRequests: { [key: string]: PromiseInterface } = {};

const vsCodePresent = typeof (acquireVsCodeApi) !== 'undefined';
const vscode: VSCodeInterface | null = vsCodePresent ? acquireVsCodeApi() : null;

window.addEventListener('message', (event: VSCodeEvent) => {
    const message = event.data;
    const request = registeredRequests[message.request];
    if (request) {
        if (message.error) {
            request.reject(message.error);
        } else if (message.data) {
            request.resolve(message.data);
        } else {
            request.reject('Unspecified error');
        }
        delete registeredRequests[message.request];
    }
});

function sendRequest(request: string) {
    if (!vscode) {
        throw Error('No VS Code');
    }
    return new Promise((resolve: PromiseCallback, reject: PromiseCallback) => {
        registeredRequests[request] = { resolve, reject };
        vscode.postMessage({ request });
    });
}

interface Neutron {
    /**
     * Ask Fusion to execute a query.
     *
     * @param query A command to send to Fusion
     * @param args stringified QueryParameters
     */
    executeQuery(query: string, args: string): string;
}

interface NeutronWindow extends Window {
    /** The object injected into the window by Fusion's browser. */
    readonly neutronJavaScriptObject: Neutron;
}

function isNeutronWindow(): boolean {
    return ((window as unknown) as NeutronWindow).neutronJavaScriptObject !== undefined;
}

const neutron: Neutron | null = isNeutronWindow()
    ? ((window as unknown) as NeutronWindow).neutronJavaScriptObject : null;

function sendRequestNeutron(request: string) {
    if (!neutron) {
        throw Error('No Fusion');
    }
    return neutron.executeQuery('get', request);
}

async function getSourceCode(): Promise<string> {
    if (vscode) {
        return sendRequest('code');
    }
    if (neutron) {
        return sendRequestNeutron('code');
    }
    const response = await fetch('./fanuc.cps');
    return response.text();
}

async function getOutputFile(): Promise<string> {
    if (vscode) {
        return sendRequest('output');
    }
    if (neutron) {
        return sendRequestNeutron('output');
    }
    const response = await fetch('./test.nc');
    return response.text();
}

export { getSourceCode, getOutputFile, vsCodePresent };
