import type { PlatformCanvas } from "../types";
export declare class Animator {
    private readonly canvas;
    /**
     * 动画是否执行
     */
    private isRunning;
    /**
     * 动画开始时间
     */
    private startTime;
    /**
     * 本轮动画已消耗的时间比例
     */
    private currentFrication;
    /**
     * 动画开始帧
     */
    private startValue;
    /**
     * 动画结束帧
     */
    private endValue;
    /**
     * 动画持续时间
     */
    private duration;
    /**
     * 循环播放开始帧与动画开始帧之间的时间偏差
     */
    private loopStart;
    /**
     * 循环持续时间
     */
    private loopDuration;
    /**
     * 最后停留的目标模式，类似于**animation-fill-mode**
     * 0: 倒序播放
     * 1: 正序播放
     */
    private fillRule;
    onStart: () => void;
    onUpdate: (currentValue: number, spendValue: number) => void;
    onEnd: () => void;
    constructor(canvas: PlatformCanvas);
    private now;
    /**
     * 设置动画开始帧和结束帧
     * @param startValue
     * @param endValue
     */
    setRange(startValue: number, endValue: number): void;
    /**
     * 设置动画的必要参数
     * @param duration
     * @param frameDuration
     * @param loopStart
     * @param loop
     * @param fillRule
     */
    setConfig(duration: number, loopStart: number, loop: number, fillRule: number): void;
    start(): void;
    stop(): void;
    private doFrame;
    private doDeltaTime;
}
