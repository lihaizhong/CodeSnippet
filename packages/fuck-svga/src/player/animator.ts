import type { PlatformCanvas } from "../types";
import { platform, startAnimationFrame, SP } from "../adaptor";

export class Animator {
  private isRunning = false;
  private startTime = 0;
  private currentFrication: number = 0.0;
  public startValue: number = 0;
  public endValue: number = 0;
  public duration: number = 0;
  public loopStart: number = 0;
  public loop: number = 1;
  public fillRule: number = 0;
  public onStart: () => void = () => {};
  public onUpdate: (currentValue: number) => void = () => {};
  public onEnd: () => void = () => {};

  constructor(private readonly canvas: PlatformCanvas) {}

  public currentTimeMillSecond(): number {
    if (platform === SP.H5 && performance) {
      return performance.now();
    }

    return Date.now();
  }

  public start(): void {
    this.isRunning = true;
    this.startTime = this.currentTimeMillSecond();
    this.currentFrication = 0.0;
    this.onStart();
    this.doFrame();
  }

  public stop(): void {
    this.isRunning = false;
  }

  public get animatedValue(): number {
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
      this.doDeltaTime(this.currentTimeMillSecond() - this.startTime);
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
