/**
 * -32768至-32000为保留的预定义错误代码。在该范围内的错误代码不能被明确定义，保留下列以供将来使用。
 * -32000至-32099为预留的自定义服务器错误。
 */
export declare const MessageStatus: Record<string, any>;
export declare const MessageTypeEnum: {
    REQUEST: number;
    NOTIFY: number;
    RESPONSE: number;
    ERROR: number;
};
