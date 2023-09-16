import { PlayerConfigOptions, Video } from "../types";
type EventCallback = undefined | (() => void);
/**
 * SVGA 播放器
 */
export declare class Player {
    /**
     * 动画当前帧数
     */
    private currFrame;
    /**
     * SVGA 数据源
     * Video Entity
     */
    private entity;
    /**
     * 当前配置项
     */
    private readonly config;
    private brush;
    private animator;
    /**
     * 片段绘制开始位置
     */
    private head;
    /**
     * 片段绘制结束位置
     */
    private tail;
    /**
     * 设置配置项
     * @param options 可配置项
     */
    setConfig(options: string | PlayerConfigOptions, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<void>;
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @returns Promise<void>
     */
    mount(videoEntity: Video): Promise<void | void[]>;
    /**
     * 开始播放事件回调
     */
    onStart: EventCallback;
    /**
     * 重新播放事件回调
     */
    onResume: EventCallback;
    /**
     * 暂停播放事件回调
     */
    onPause: EventCallback;
    /**
     * 停止播放事件回调
     */
    onStop: EventCallback;
    /**
     * 播放中事件回调
     */
    onProcess: EventCallback;
    /**
     * 播放结束事件回调
     */
    onEnd: EventCallback;
    /**
     * 开始播放
     */
    start(): void;
    /**
     * 重新播放
     */
    resume(): void;
    /**
     * 暂停播放
     */
    pause(): void;
    /**
     * 停止播放
     */
    stop(): void;
    /**
     * 清理容器画布
     */
    clear(): void;
    /**
     * 销毁实例
     */
    destroy(): void;
    /**
     * 开始绘制动画
     */
    private startAnimation;
}
export {};
