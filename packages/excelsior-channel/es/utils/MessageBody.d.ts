export interface MessageNotification<T> {
    jsonrpc: string;
    method: string;
    params: T;
}
export interface MessageRequest<T> extends MessageNotification<T> {
    id: string;
}
export interface MessageResponse<T> {
    jsonrpc: string;
    id: string;
    result?: T;
    error?: MessageResponseError;
}
export interface MessageResponseError {
    code: number;
    message: string;
    data?: any;
}
export declare class MessageBody<T> {
    private jsonrpc;
    static type: string;
    static checkProtocol(data: any): boolean;
    notify(method: string, params: T): MessageNotification<T>;
    request(method: string, params: T): MessageRequest<T>;
    response(id: string, result: T): MessageResponse<T>;
    error(id: string, code: number, message: string, data?: any): MessageResponse<null>;
}
