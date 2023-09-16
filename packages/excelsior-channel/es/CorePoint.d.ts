import { Journal } from "./utils/Journal";
import { MessageBody } from "./utils/MessageBody";
import { MessageQueue } from "./utils/MessageQueue";
export type PointController = (...params: any[]) => any;
export declare class CorePoint {
    protected port: MessagePort | null;
    protected body: MessageBody<any>;
    protected queue: MessageQueue;
    protected controllers: Record<string, PointController>;
    protected subscriptions: Record<string, {
        success: (value: any) => void;
        error: (error: any) => void;
    }>;
    protected isReady: boolean;
    protected journal: Journal;
    /**
     * 包装端口封装
     * @param endpoint
     * @returns
     */
    static wrap<T extends object>(endpoint: CorePoint): T;
    /**
     * 检查唯一标识是否合法
     * @param id
     * @returns
     */
    protected checkIdentification(id: string): boolean;
    /**
     * 获取协议类型
     * @param data
     * @returns
     */
    protected getProtocolType(data: any): string;
    /**
     * 处理json-rpc协议消息
     * @param event
     */
    protected handleJsonRPCMessage(event: MessageEvent): void;
    /**
     * 处理信号消息
     * @param event
     */
    protected handleSignalMessage(event: MessageEvent): void;
    /**
     * 建立通信连接
     * @param port
     */
    protected connect(port: MessagePort): void;
    /**
     * 连接成功后，统一处理等待的消息
     */
    protected ready(): void;
    /**
     * 标准的消息处理
     * @param type
     * @param data
     */
    private postNormalizeMessage;
    /**
     * 处理标准的成功消息
     * @param id
     * @param result
     */
    protected postSuccessMessage(id: string, result: any): void;
    /**
     * 处理标准的失败消息
     * @param id
     * @param statusText
     */
    protected postErrorMessage(id: string, statusText: string): void;
    /**
     * 声明远程调用的函数
     * @param method
     * @param fn
     */
    declare(method: string, fn: PointController): void;
    /**
     * 发送通知消息（只关心消息发送）
     * @param method
     * @param params
     */
    notify(method: string, ...params: any[]): void;
    /**
     * 调用远程函数（消息发送完成后，可以通过订阅的方式获取返回值）
     * @param method
     * @param params
     * @returns
     */
    invoke(method: string, ...params: any[]): Promise<any>;
}
