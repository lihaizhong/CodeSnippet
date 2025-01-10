import type { PlatformCanvas } from "../types";
import { startAnimationFrame } from "../polyfill";

const noop = () => {};

export class Animator {
  /**
   * 动画是否执行
   */
  private isRunning = false;
  /**
   * 动画开始时间
   */
  private startTime = 0;
  /**
   * 本轮动画已消耗的时间比例
   */
  private currentFrication: number = 0.0;
  /**
   * 动画开始帧
   */
  private startValue: number = 0;
  /**
   * 动画结束帧
   */
  private endValue: number = 0;
  /**
   * 动画持续时间
   */
  private duration: number = 0;
  /**
   * 循环播放开始帧与动画开始帧之间的时间偏差
   */
  private loopStart: number = 0;
  /**
   * 循环持续时间
   */
  private loopDuration: number = 0;
  /**
   * 最后停留的目标模式，类似于**animation-fill-mode**
   * 0: 倒序播放
   * 1: 正序播放
   */
  private fillRule: number = 0;

  /* ---- 事件钩子 ---- */
  public onStart: () => void = noop;
  public onUpdate: (currentValue: number, spendValue: number) => void = noop;
  public onEnd: () => void = noop;

  constructor(private readonly canvas: PlatformCanvas) {}

  private now(): number {
    // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
    if (typeof performance !== "undefined") {
      return performance.now();
    }

    return Date.now();
  }

  /**
   * 设置动画开始帧和结束帧
   * @param startValue
   * @param endValue
   */
  public setRange(startValue: number, endValue: number) {
    this.startValue = startValue;
    this.endValue = endValue;
  }

  /**
   * 设置动画的必要参数
   * @param duration
   * @param frameDuration
   * @param loopStart
   * @param loop
   * @param fillRule
   */
  public setConfig(
    duration: number,
    loopStart: number,
    loop: number,
    fillRule: number
  ) {
    this.duration = duration;
    this.loopStart = loopStart;
    this.fillRule = fillRule;
    this.loopDuration = loopStart + (duration - loopStart) * loop;
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

  private doFrame(): void {
    if (this.isRunning) {
      this.doDeltaTime(this.now() - this.startTime);
      if (this.isRunning) {
        startAnimationFrame(this.canvas, this.doFrame.bind(this));
      }
    }
  }

  private doDeltaTime(deltaTime: number): void {
    // 运行时间 大于等于 循环持续时间
    if (deltaTime >= this.loopDuration) {
      // 循环已结束
      this.currentFrication = this.fillRule ? 0.0 : 1.0;
      this.isRunning = false;
    } else {
      const { duration, loopStart } = this;
      // 本轮动画已消耗的时间比例 = (本轮动画已消耗的时间 + 循环播放开始帧与动画开始帧之间的时间偏差) / 动画持续时间
      this.currentFrication =
        deltaTime <= duration
          ? deltaTime / duration
          : (((deltaTime - loopStart) % (duration - loopStart)) + loopStart) /
            duration;
    }

    const { currentFrication, startValue } = this;

    this.onUpdate(
      ~~((this.endValue - startValue) * currentFrication + startValue),
      currentFrication
    );
    if (!this.isRunning) {
      this.onEnd();
    }
  }
}
