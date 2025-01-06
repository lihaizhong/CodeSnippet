import type { PlatformCanvas } from "../types";
import { startAnimationFrame } from "../adaptor";

const noop = () => {};

export class Animator {
  /**
   * 动画是否执行
   */
  private isRunning = false;
  /**
   * 开始时间
   */
  private startTime = 0;
  /**
   * 当前动画已播放完的帧
   */
  private currentFrication: number = 0.0;
  /**
   * 开始帧
   */
  private startValue: number = 0;
  /**
   * 结束帧
   */
  private endValue: number = 0;
  /**
   * 持续时间
   */
  public duration: number = 0;
  /**
   * 循环播放开始帧
   */
  public loopStart: number = 0;
  /**
   * 循环次数
   * 可以设置为**Infinity**，默认是**1**
   */
  public loop: number = 1;
  /**
   * 最后停留的目标模式，类似于**animation-fill-mode**
   */
  public fillRule: number = 0;

  /* ---- 事件钩子 ---- */
  public onStart: () => void = noop;
  public onUpdate: (currentValue: number) => void = noop;
  public onEnd: () => void = noop;

  constructor(private readonly canvas: PlatformCanvas) {}

  private now(): number {
    // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
    return performance?.now ? performance.now() : Date.now();
  }

  public setRange(startValue: number, endValue: number) {
    this.startValue = startValue;
    this.endValue = endValue;
  }

  public start(): void {
    this.isRunning = true;
    this.startTime = this.now();
    this.currentFrication = 0.0;
    this.onStart();
    this.doFrame();
  }

  public stop(): void {
    this.isRunning = false;
  }

  private get animatedValue(): number {
    if (!this.currentFrication) {
      return Math.floor(this.startValue)
    }

    return Math.floor(
      (this.endValue - this.startValue) * this.currentFrication +
        this.startValue
    );
  }

  private doFrame(): void {
    if (this.isRunning) {
      this.doDeltaTime(this.now() - this.startTime);
      if (this.isRunning) {
        startAnimationFrame(this.canvas, this.doFrame.bind(this));
      }
    }
  }

  private doDeltaTime(deltaTime: number): void {
    if (
      deltaTime >=
      this.loopStart + (this.duration - this.loopStart) * this.loop
    ) {
      // 循环已结束
      this.currentFrication = this.fillRule === 1 ? 0.0 : 1.0;
      this.isRunning = false;
    } else {
      this.currentFrication =
        deltaTime <= this.duration
          ? deltaTime / this.duration
          : (((deltaTime - this.loopStart) % (this.duration - this.loopStart)) +
              this.loopStart) /
            this.duration;
    }
    this.onUpdate(this.animatedValue);
    if (!this.isRunning) {
      this.onEnd();
    }
  }
}
