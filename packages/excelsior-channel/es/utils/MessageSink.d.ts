export type MessageSinkCallback = (data: any) => void | Promise<void>;
export interface MessageSinkHandler {
    notify: MessageSinkCallback[];
    request: MessageSinkCallback[];
    response: MessageSinkCallback[];
    error: MessageSinkCallback[];
}
export declare class MessageSink {
    private payload;
    private handlers;
    constructor(payload: any);
    bootstrap(): void;
    clean(): void;
    onNotify(fn: MessageSinkCallback): void;
    onRequest(fn: MessageSinkCallback): void;
    onResponse(fn: MessageSinkCallback): void;
    onError(fn: MessageSinkCallback): void;
}
