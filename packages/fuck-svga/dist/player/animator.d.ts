import type { PlatformCanvas, PlatformOffscreenCanvas } from "../types";
export declare class Animator {
    private canvas;
    private isRunning;
    private startTime;
    private currentFrication;
    startValue: number;
    endValue: number;
    duration: number;
    loopStart: number;
    loop: number;
    fillRule: number;
    onStart: () => void;
    onUpdate: (currentValue: number) => void;
    onEnd: () => void;
    constructor(canvas: PlatformCanvas | PlatformOffscreenCanvas);
    currentTimeMillSecond(): number;
    start(): void;
    stop(): void;
    get animatedValue(): number;
    private doFrame;
    private doDeltaTime;
}
