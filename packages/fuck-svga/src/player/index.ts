import { loadImage } from "../adaptor";
import {
  PLAYER_FILL_MODE,
  PLAYER_PLAY_MODE,
  PlayerConfigOptions,
  Video,
  BitmapsCache,
  PlayerConfig,
} from "../types";
import { Animator } from "./animator";
import benchmark from "../test/benchmark";
import CanvasManager from "./canvas-manager";

type EventCallback = undefined | (() => void);

/**
 * SVGA 播放器
 */
export class Player {
  /**
   * 动画当前帧数
   */
  public currentFrame: number = 0;
  /**
   * 动画总帧数
   */
  public totalFrames: number = 0;
  /**
   * SVGA 数据源
   */
  public videoEntity: Video | undefined = undefined;

  /**
   * 当前配置项
   */
  public readonly config: PlayerConfig = Object.create({
    loop: 0,
    fillMode: PLAYER_FILL_MODE.FORWARDS,
    playMode: PLAYER_PLAY_MODE.FORWARDS,
    startFrame: 0,
    endFrame: 0,
    loopStartFrame: 0,
    // isUseIntersectionObserver: false,
  });

  private canvasManager: CanvasManager = new CanvasManager();
  private animator: Animator | null = null;

  // private isBeIntersection = true;
  // private intersectionObserver: IntersectionObserver | null = null
  private bitmapsCache: BitmapsCache = {};
  /**
   * 配置是否准备完成
   */
  private isReady: boolean = false;
  /**
   * 片段绘制开始位置
   */
  private fragmentStart: number = 0;
  /**
   * 片段绘制结束位置
   */
  private fragmentEnd: number = 0;

  private isDrawnFragment: boolean = false;

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

    if (config.startFrame !== undefined && config.endFrame !== undefined) {
      if (config.startFrame > config.endFrame) {
        throw new Error("[SvgaError] StartFrame should > EndFrame");
      }
    }

    await this.canvasManager.register(config.container!, config.secondary, component);
    this.config.loop = config.loop ?? 0;
    this.config.fillMode = config.fillMode ?? PLAYER_FILL_MODE.FORWARDS;
    this.config.playMode = config.playMode ?? PLAYER_PLAY_MODE.FORWARDS;
    this.config.startFrame = config.startFrame ?? 0;
    this.config.endFrame = config.endFrame ?? 0;
    this.config.loopStartFrame = config.loopStartFrame ?? 0;
    // this.config.isUseIntersectionObserver =
    //   config.isUseIntersectionObserver ?? false;
    // 监听容器是否处于浏览器视窗内
    // this.setIntersectionObserver()
    const canvas = this.canvasManager.getMainScreen();
    this.animator = new Animator(canvas);
    this.animator.onEnd = () => {
      this.onEnd?.();
    };
    this.isReady = true;
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
  public async mount(
    videoEntity: Video,
    options: string | PlayerConfigOptions,
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ): Promise<void | void[]> {
    if (videoEntity === undefined) {
      throw new Error("videoEntity undefined");
    }

    if (options) {
      await this.setConfig(options, component);
    }

    this.currentFrame = 0;
    this.totalFrames = videoEntity.frames - 1;
    this.videoEntity = videoEntity;
    this.setSize();
    this.canvasManager.clearSecondaryScreen();
    benchmark.clearTime("render");

    if (this.videoEntity === undefined) {
      return;
    }

    const { images } = this.videoEntity;
    const canvas = this.canvasManager.getMainScreen();

    if (Object.keys(images).length === 0) {
      return;
    }

    let imageArr: Promise<void>[] = [];
    for (let key in images) {
      const image = images[key];
      const p = loadImage(canvas, image).then((img) => {
        this.bitmapsCache[key] = img;
      });

      imageArr.push(p);
    }

    return Promise.all<void>(imageArr);
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
    if (!this.isReady) {
      return;
    }
    if (this.videoEntity === undefined) {
      throw new Error("videoEntity undefined");
    }
    this.canvasManager.clearMainScreen();
    this.startAnimation();
    this.onStart?.();
  }

  /**
   * 重新播放
   */
  public resume(): void {
    if (!this.isReady) {
      return;
    }
    this.startAnimation();
    this.onResume?.();
  }

  /**
   * 暂停播放
   */
  public pause(): void {
    if (!this.isReady) {
      return;
    }
    this.animator!.stop();
    this.onPause?.();
  }

  /**
   * 停止播放
   */
  public stop(): void {
    if (!this.isReady) {
      return;
    }
    this.animator!.stop();
    this.currentFrame = 0;
    this.canvasManager.clearMainScreen();
    this.onStop?.();
  }

  /**
   * 清理容器画布
   */
  public clear(): void {
    if (this.isReady) {
      this.canvasManager.clearMainScreen();
    }
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    if (this.isReady) {
      this.animator!.stop();
      this.canvasManager.destroy();
      this.animator = null;
      this.videoEntity = undefined;
    }
  }

  private startAnimation(): void {
    const { config, totalFrames, videoEntity } = this;
    const { playMode, loopStartFrame, fillMode, loop } = config;
    let startFrame = config.startFrame > 0 ? config.startFrame : 0;
    let endFrame = config.endFrame > 0 ? config.endFrame : totalFrames;

    // 如果开始动画的当前帧是最后一帧，重置为第 0 帧
    if (this.currentFrame === totalFrames) {
      this.currentFrame = startFrame;
    }

    // 顺序播放/倒叙播放
    if (playMode === PLAYER_PLAY_MODE.FORWARDS) {
      this.animator!.setRange(startFrame, endFrame);
    } else {
      this.animator!.setRange(endFrame, startFrame);
    }

    let { frames, fps, sprites } = videoEntity!;
    const spriteCount = sprites.length;
    // 更新活动帧总数
    if (endFrame !== totalFrames) {
      frames = endFrame - startFrame;
    } else if (startFrame !== 0) {
      frames -= startFrame;
    }

    this.animator!.setConfig(
      /**
       * 总帧数 / FPS，获取动画持续的时间
       * duration = frames * (1 / fps) * 1000
       */
      (frames * 1000) / fps,
      /**
       * 每帧持续时间
       */
      1000 / fps,
      /**
       * loopStart = (loopStartFrame - startFrame) * (1 / fps) * 100
       */
      loopStartFrame > startFrame
        ? ((loopStartFrame - startFrame) * 100) / fps
        : 0,
      /**
       * 循环次数
       * loop
       */
      loop <= 0 ? Infinity : loop,
      /**
       * 顺序播放/倒序播放
       * fillRule
       */
      +(fillMode === PLAYER_FILL_MODE.BACKWARDS)
    );
    this.animator!.onUpdate = (value: number, spendValue: number) => {
      if (!this.isDrawnFragment) {
        // **1.2**和**3**均为阔值，保证渲染尽快完成
        const tmp =
          this.currentFrame === value
            ? Math.ceil(spriteCount * spendValue * 1.2) + 3
            : spriteCount;

        // 如果tmp小于结束片段，说明已经进入下一帧渲染，需要立即结束当前帧渲染
        if (tmp > this.fragmentEnd) {
          this.fragmentStart = this.fragmentEnd;
          this.fragmentEnd = Math.min(tmp, spriteCount);
          benchmark.time("draw", () => {
            this.canvasManager.draw(
              this.bitmapsCache,
              this.videoEntity!,
              this.currentFrame,
              this.fragmentStart,
              this.fragmentEnd
            );
          });
          this.isDrawnFragment = this.fragmentEnd === spriteCount;
        }
      }

      if (this.currentFrame === value) {
        return;
      }

      this.canvasManager.clearMainScreen();
      benchmark.time(
        "render",
        () => this.canvasManager.stick(),
        null,
        (count) => {
          benchmark.line(20);
          console.log("render count", count);
          benchmark.clearTime("draw");
        }
      );
      this.canvasManager.clearSecondaryScreen();
      this.onProcess?.();
      this.currentFrame = value;
      this.fragmentEnd = 0;
      this.isDrawnFragment = false;
    };

    this.animator!.start();
  }

  private setSize(): void {
    const { width, height } = this.videoEntity!.size;
    this.canvasManager.setSize(width, height);
  }
}
