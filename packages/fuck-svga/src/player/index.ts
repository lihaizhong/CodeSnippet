import { Brush } from "./brush";
import { Animator } from "./animator";
import benchmark from "../benchmark";

/**
 * SVGA 播放器
 */
export class Player {
  /**
   * 动画当前帧数
   */
  private currFrame: number = 0;
  /**
   * SVGA 元数据
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

  /**
   * 刷头实例
   */
  private brush = new Brush();

  /**
   * 动画实例
   */
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
   * @property {string} container 主屏，播放动画的 Canvas 元素
   * @property {string} secondary 副屏，播放动画的 Canvas 元素
   * @property {number} loop 循环次数，默认值 0（无限循环）
   * @property {string} fillMode 最后停留的目标模式，类似于 animation-fill-mode，接受值 forwards 和 fallbacks，默认值 forwards。
   * @property {string} playMode 播放模式，接受值 forwards 和 fallbacks ，默认值 forwards。
   * @property {number} startFrame 单个循环周期内开始播放的帧数，默认值 0
   * @property {number} endFrame 单个循环周期内结束播放的帧数，默认值 0
   * @property {number} loopStartFrame 循环播放的开始帧，仅影响第一个周期的开始帧，默认值 0
   */
  public async setConfig(
    options: string | PlayerConfigOptions,
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ): Promise<void> {
    let config: PlayerConfigOptions;

    if (typeof options == "string") {
      config = { container: options };
    } else {
      config = options;
    }

    Object.assign(this.config, {
      loop: config.loop ?? 0,
      fillMode: config.fillMode ?? PLAYER_FILL_MODE.FORWARDS,
      playMode: config.playMode ?? PLAYER_PLAY_MODE.FORWARDS,
      startFrame: config.startFrame ?? 0,
      endFrame: config.endFrame ?? 0,
      loopStartFrame: config.loopStartFrame ?? 0,
    });
    await this.brush.register(config.container, config.secondary, component);
    // this.config.isUseIntersectionObserver =
    //   config.isUseIntersectionObserver ?? false;
    // 监听容器是否处于浏览器视窗内
    // this.setIntersectionObserver()
    this.animator = new Animator(this.brush);
    this.animator.onEnd = () => this.onEnd?.(this.currFrame);
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
  //     if (this.intersectionObserver != null) this.intersectionObserver.disconnect()
  //     this.config.isUseIntersectionObserver = false
  //     this.isBeIntersection = true
  //   }
  // }

  /**
   * 装载 SVGA 数据元
   * @param videoEntity SVGA 数据源
   * @returns Promise<void>
   */
  public mount(videoEntity: Video): Promise<void | void[]> {
    if (!videoEntity) {
      throw new Error("videoEntity undefined");
    }

    this.animator!.stop();
    this.currFrame = 0;
    this.entity = videoEntity;
    benchmark.clearTime("RENDER");
    benchmark.clearTime("DRAW");
    benchmark.unlockTime("DRAW");

    const { images, filename, size } = videoEntity;

    this.brush.setRect(size.width, size.height);
    this.brush.clearSecondary();

    return this.brush.loadImage(images, filename);
  }

  /**
   * 开始播放事件回调
   * @param frame
   */
  public onStart?: PlayerEventCallback;
  /**
   * 重新播放事件回调
   * @param frame
   */
  public onResume?: PlayerEventCallback;
  /**
   * 暂停播放事件回调
   * @param frame
   */
  public onPause?: PlayerEventCallback;
  /**
   * 停止播放事件回调
   * @param frame
   */
  public onStop?: PlayerEventCallback;
  /**
   * 播放中事件回调
   * @param percent
   * @param frame
   * @param frames
   */
  public onProcess?: PlayerProcessEventCallback;
  /**
   * 结束播放事件回调
   * @param frame
   */
  public onEnd?: PlayerEventCallback;

  /**
   * 开始播放
   */
  public start(): void {
    this.brush.clearContainer();
    this.startAnimation();
    this.onStart?.(this.currFrame);
  }

  /**
   * 重新播放
   */
  public resume(): void {
    this.startAnimation();
    this.onResume?.(this.currFrame);
  }

  /**
   * 暂停播放
   */
  public pause(): void {
    this.animator!.stop();
    this.onPause?.(this.currFrame);
  }

  /**
   * 停止播放
   */
  public stop(): void {
    this.animator!.stop();
    this.currFrame = 0;
    this.brush.clearContainer();
    this.onStop?.(this.currFrame);
  }

  /**
   * 清理容器画布
   */
  public clear(): void {
    this.brush.clearContainer();
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

  public stepToFrame(frame: number, andPlay = false) {
    if (!this.entity || frame < 0 || frame >= this.entity.frames)  return;

    this.pause();
    this.config.loopStartFrame = frame;
    if (andPlay) {
      this.startAnimation();
    }
  }

  public stepToPercentage(percent: number, andPlay: boolean = false) {
    if (!this.entity) return;

    const { frames } = this.entity;

    this.stepToFrame(
      (Math.round((percent < 0 ? 0 : percent) * frames) % frames),
      andPlay
    );
  }

  /**
   * 开始绘制动画
   */
  private startAnimation(): void {
    const { playMode, loopStartFrame, startFrame, endFrame, fillMode, loop } =
      this.config;
    let { frames, fps, sprites } = this.entity!;
    const spriteCount = sprites.length;
    const start = startFrame > 0 ? startFrame : 0;
    const end = endFrame > 0 && endFrame < frames ? endFrame : frames;
    const reverse = playMode == PLAYER_PLAY_MODE.FALLBACKS

    if (start > end) {
      throw new Error("StartFrame should greater than EndFrame");
    }

    // 更新活动帧总数
    if (end < frames) {
      frames = end - start;
    } else if (start > 0) {
      frames -= start;
    }

    this.currFrame = loopStartFrame;
    // 顺序播放/倒叙播放
    if (reverse) {
      // 如果开始动画的当前帧是最后一帧，重置为开始帧
      if (this.currFrame == 0) {
        this.currFrame = end - 1;
      }
    } else {
      // 如果开始动画的当前帧是最后一帧，重置为开始帧
      if (this.currFrame == frames - 1) {
        this.currFrame = start;
      }
    }

    // 每帧持续的时间
    const frameDuration = 1000 / fps;
    // 更新动画基础信息
    this.animator!.setConfig(
      // 单个周期的运行时长
      (Math.floor(frames * frameDuration * 10 ** 6)) / 10 ** 6,
      // 第一个周期开始时间偏移量
      loopStartFrame > start ? (loopStartFrame - start) * frameDuration : 0,
      // 循环次数
      loop <= 0 ? Infinity : loop,
      // 播放顺序
      fillMode == PLAYER_FILL_MODE.BACKWARDS ? 1 : 0
    );
    // 动画绘制过程
    this.animator!.onUpdate = (timePercent: number) => {
      const value = ~~(reverse ? end - timePercent * frames : timePercent * frames);
      // 是否还有剩余时间
      const hasRemained = this.currFrame == (reverse ? value - 1 : value);
      console.log('onUpdate', reverse, this.currFrame, (reverse ? value - 1 : value), hasRemained ? 'don\'t render' : 'need render');
      // 当前帧的图片还未绘制完成
      if (this.tail != spriteCount) {
        // 1.2和3均为阔值，保证渲染尽快完成
        const nextTail = hasRemained
          ? Math.min(spriteCount * timePercent + 3, spriteCount) << 0
          : spriteCount;

        if (nextTail > this.tail) {
          this.head = this.tail;
          this.tail = nextTail;
          benchmark.time(`DRAW`, () => {
            this.brush.draw(this.entity!, this.currFrame, this.head, this.tail);
          });
        }
      }

      if (hasRemained) return;

      this.brush.clearContainer();
      benchmark.time(
        "RENDER",
        () => this.brush.stick(),
        null,
        (count) => {
          benchmark.log("render count", count);
          benchmark.line(20);
          if (count < benchmark.count) {
            benchmark.clearTime("DRAW");
          } else {
            benchmark.lockTime("DRAW");
          }
        }
      );
      this.brush.clearSecondary();
      this.onProcess?.(~~((value / frames) * 100) / 100, value, frames);
      this.currFrame = value;
      this.tail = 0;
    };

    this.animator!.start();
  }
}
