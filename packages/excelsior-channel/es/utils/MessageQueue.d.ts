export interface MessageReadyBody {
    type: number;
    body: any;
}
export declare class MessageQueue {
    private queue;
    push(body: MessageReadyBody): void;
    pop(): MessageReadyBody | undefined;
}
