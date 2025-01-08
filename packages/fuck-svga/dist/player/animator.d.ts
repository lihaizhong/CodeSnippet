import type { PlatformCanvas } from "../types";
export declare class Animator {
    private readonly canvas;
    /**
     * 动画是否执行
     */
    private isRunning;
    /**
     * 开始时间
     */
    private startTime;
    /**
     * 当前动画已播放完的帧
     */
    private currentFrication;
    /**
     * 开始帧
     */
    private startValue;
    /**
     * 结束帧
     */
    private endValue;
    /**
     * 持续时间
     */
    private duration;
    /**
     * 每帧持续时间
     */
    private frameDuration;
    /**
     * 循环播放开始帧
     */
    private loopStart;
    private loopTotalTime;
    /**
     * 循环次数
     * 可以设置为**Infinity**，默认是**1**
     */
    private loop;
    /**
     * 最后停留的目标模式，类似于**animation-fill-mode**
     */
    private fillRule;
    onStart: () => void;
    onUpdate: (currentValue: number, spendValue: number) => void;
    onEnd: () => void;
    constructor(canvas: PlatformCanvas);
    private now;
    setRange(startValue: number, endValue: number): void;
    setConfig(duration: number, frameDuration: number, loopStart: number, loop: number, fillRule: number): void;
    start(): void;
    stop(): void;
    private get animatedValue();
    private doFrame;
    private doDeltaTime;
}
