import { noop, now } from "../polyfill";
import Brush from "./brush";

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

  constructor(private readonly brush: Brush) {}

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
    this.startTime = now();
    this.onStart();
    this.doFrame();
  }

  public stop(): void {
    this.isRunning = false;
  }

  private doFrame(): void {
    if (this.isRunning) {
      this.doDeltaTime(now() - this.startTime);
      if (this.isRunning) {
        this.brush.flush(() => this.doFrame());
      }
    }
  }

  private doDeltaTime(DT: number): void {
    const {
      duration: D,
      loopStart: LS,
      loopDuration: LD,
      startValue: SV,
      endValue: EV,
      fillRule: FR,
    } = this;
    // 本轮动画已消耗的时间比例 currentFrication
    let CF: number;
    // 运行时间 大于等于 循环持续时间
    if (DT >= LD) {
      // 循环已结束
      CF = FR ? 0.0 : 1.0;
      this.isRunning = false;
    } else {
      // 本轮动画已消耗的时间比例 = (本轮动画已消耗的时间 + 循环播放开始帧与动画开始帧之间的时间偏差) / 动画持续时间
      CF = DT <= D ? DT / D : (((DT - LS) % (D - LS)) + LS) / D;
    }

    this.onUpdate(((EV - SV) * CF + SV) << 0, CF);
    if (!this.isRunning) {
      this.onEnd();
    }
  }
}
