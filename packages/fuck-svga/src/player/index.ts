import {
  PLAYER_FILL_MODE,
  PLAYER_PLAY_MODE,
  PlayerConfigOptions,
  Video,
  PlayerConfig,
  Bitmap,
} from "../types";
import { Animator } from "./animator";
import benchmark from "../test/benchmark";
import Brush from "./brush";

type EventCallback = undefined | (() => void);

/**
 * SVGA 播放器
 */
export class Player {
  /**
   * 动画当前帧数
   */
  private currFrame: number = 0;
  /**
   * SVGA 数据源
   * Video Entity
   */
  private entity: Video | undefined = undefined;

  /**
   * 当前配置项
   */
  private readonly config: PlayerConfig = Object.create({
    loop: 0,
    fillMode: PLAYER_FILL_MODE.FORWARDS,
    playMode: PLAYER_PLAY_MODE.FORWARDS,
    startFrame: 0,
    endFrame: 0,
    loopStartFrame: 0,
    // isUseIntersectionObserver: false,
  });

  private brush = new Brush();
  private animator: Animator | null = null;

  // private isBeIntersection = true;
  // private intersectionObserver: IntersectionObserver | null = null
  /**
   * 片段绘制开始位置
   */
  private head: number = 0;
  /**
   * 片段绘制结束位置
   */
  private tail: number = 0;

  /**
   * 设置配置项
   * @param options 可配置项
   */
  public async setConfig(
    options: string | PlayerConfigOptions,
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ): Promise<void> {
    let config: PlayerConfigOptions;

    if (typeof options === "string") {
      config = { container: options };
    } else {
      config = options;
    }

    const { startFrame, endFrame } = config;
    if (startFrame !== undefined && endFrame !== undefined) {
      // if (startFrame < 0) {
      //   throw new Error("StartFrame should greater then zero");
      // }

      // if (endFrame < 0) {
      //   throw new Error("EndFrame should greater then zero");
      // }

      if (startFrame > endFrame) {
        throw new Error("StartFrame should greater than EndFrame");
      }
    }

    Object.assign(this.config, {
      loop: config.loop ?? 0,
      fillMode: config.fillMode ?? PLAYER_FILL_MODE.FORWARDS,
      playMode: config.playMode ?? PLAYER_PLAY_MODE.FORWARDS,
      startFrame: startFrame ?? 0,
      endFrame: endFrame ?? 0,
      loopStartFrame: config.loopStartFrame ?? 0,
    });
    await this.brush.register(config.container, config.secondary, component);
    // this.config.isUseIntersectionObserver =
    //   config.isUseIntersectionObserver ?? false;
    // 监听容器是否处于浏览器视窗内
    // this.setIntersectionObserver()
    this.animator = new Animator(this.brush);
    this.animator.onEnd = () => this.onEnd?.();
  }

  // private setIntersectionObserver (): void {
  //   if (hasIntersectionObserver && this.config.isUseIntersectionObserver) {
  //     this.intersectionObserver = new IntersectionObserver(entries => {
  //       this.isBeIntersection = !(entries[0].intersectionRatio <= 0)
  //     }, {
  //       rootMargin: '0px',
  //       threshold: [0, 0.5, 1]
  //     })
  //     this.intersectionObserver.observe(this.config.container)
  //   } else {
  //     if (this.intersectionObserver !== null) this.intersectionObserver.disconnect()
  //     this.config.isUseIntersectionObserver = false
  //     this.isBeIntersection = true
  //   }
  // }

  /**
   * 装载 SVGA 数据元
   * @param videoEntity SVGA 数据源
   * @returns Promise<void>
   */
  public async mount(videoEntity: Video): Promise<void | void[]> {
    if (!videoEntity) {
      throw new Error("videoEntity undefined");
    }

    this.animator!.stop();
    this.currFrame = 0;
    this.entity = videoEntity;
    benchmark.clearTime("render");
    benchmark.clearTime("draw");
    benchmark.unlockTime("draw");

    const { images, filename, size } = videoEntity;

    this.brush.setRect(size.width, size.height);
    this.brush.clearBack();

    return this.brush.loadImage(images, filename);
  }

  /**
   * 开始播放事件回调
   */
  public onStart: EventCallback;
  /**
   * 重新播放事件回调
   */
  public onResume: EventCallback;
  /**
   * 暂停播放事件回调
   */
  public onPause: EventCallback;
  /**
   * 停止播放事件回调
   */
  public onStop: EventCallback;
  /**
   * 播放中事件回调
   */
  public onProcess: EventCallback;
  /**
   * 播放结束事件回调
   */
  public onEnd: EventCallback;

  /**
   * 开始播放
   */
  public start(): void {
    this.brush.clearFront();
    this.startAnimation();
    this.onStart?.();
  }

  /**
   * 重新播放
   */
  public resume(): void {
    this.startAnimation();
    this.onResume?.();
  }

  /**
   * 暂停播放
   */
  public pause(): void {
    this.animator!.stop();
    this.onPause?.();
  }

  /**
   * 停止播放
   */
  public stop(): void {
    this.animator!.stop();
    this.currFrame = 0;
    this.brush.clearFront();
    this.onStop?.();
  }

  /**
   * 清理容器画布
   */
  public clear(): void {
    this.brush.clearFront();
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.animator!.stop();
    this.brush.destroy();
    this.animator = null;
    this.entity = undefined;
  }

  /**
   * 开始绘制动画
   */
  private startAnimation(): void {
    const { playMode, loopStartFrame, startFrame, endFrame, fillMode, loop } =
      this.config;
    let { frames, fps, sprites } = this.entity!;
    const spriteCount = sprites.length;
    const lastFrame = frames - 1;
    const start = startFrame > 0 ? startFrame : 0;
    const end = endFrame > 0 ? endFrame : lastFrame;

    // 如果开始动画的当前帧是最后一帧，重置为开始帧
    if (this.currFrame === lastFrame) {
      this.currFrame = start;
    }

    // 顺序播放/倒叙播放
    if (playMode === PLAYER_PLAY_MODE.FORWARDS) {
      this.animator!.setRange(start, end);
    } else {
      this.animator!.setRange(end, start);
    }

    // 更新活动帧总数
    if (endFrame > 0 && endFrame > startFrame) {
      frames = endFrame - startFrame;
    } else if (endFrame <= 0 && startFrame > 0) {
      frames -= startFrame;
    }

    // 每帧持续的时间
    const frameDuration = 1000 / fps;
    // 更新动画基础信息
    this.animator!.setConfig(
      // duration = frames * (1 / fps) * 1000
      frames * frameDuration,
      // loopStart = (loopStartFrame - startFrame) * (1 / fps) * 1000
      loopStartFrame > startFrame
        ? (loopStartFrame - startFrame) * frameDuration
        : 0,
      loop <= 0 ? Infinity : loop,
      +(fillMode === PLAYER_FILL_MODE.BACKWARDS)
    );
    // 动画绘制过程
    this.animator!.onUpdate = (value: number, spendValue: number) => {
      // 是否还有剩余时间
      const hasRemained = this.currFrame === value;
      // 当前帧的图片还未绘制完成
      if (this.tail !== spriteCount) {
        // 1.2和3均为阔值，保证渲染尽快完成
        const tmp = hasRemained
          ? Math.min((spriteCount * spendValue * 1.2 + 3) << 0, spriteCount)
          : spriteCount;

        if (tmp > this.tail) {
          this.head = this.tail;
          this.tail = tmp;
          benchmark.time(`draw`, () => {
            this.brush.draw(this.entity!, this.currFrame, this.head, this.tail);
          });
        }
      }

      if (hasRemained) {
        return;
      }

      this.brush.clearFront();
      benchmark.time(
        "render",
        () => this.brush.stick(),
        null,
        (count) => {
          benchmark.log("render count", count);
          benchmark.line(20);
          if (count < benchmark.count) {
            benchmark.clearTime("draw");
          } else {
            benchmark.lockTime("draw");
          }
        }
      );
      this.brush.clearBack();
      this.onProcess?.();
      this.currFrame = value;
      this.tail = 0;
    };

    this.animator!.start();
  }
}
