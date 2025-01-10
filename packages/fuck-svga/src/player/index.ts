import { loadImage } from "../polyfill";
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
  public currFrame: number = 0;
  /**
   * SVGA 数据源
   * Video Entity
   */
  public entity: Video | undefined = undefined;

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

  private brush = new Brush();
  private animator: Animator | null = null;

  // private isBeIntersection = true;
  // private intersectionObserver: IntersectionObserver | null = null
  private cache: Map<string, Bitmap> = new Map();
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
    const canvas = this.brush.getM();
    this.animator = new Animator(canvas);
    this.animator.onEnd = () => {
      this.onEnd?.();
    };
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

    this.currFrame = 0;
    this.entity = videoEntity;
    benchmark.clearTime("render");
    benchmark.clearTime("draw");
    benchmark.unlockTime("draw");

    if (videoEntity === undefined) {
      return;
    }

    const { images, size } = videoEntity;
    const canvas = this.brush.getM();

    this.brush.setConfig(size);
    this.brush.clearS();
    this.cache.clear();
    if (Object.keys(images).length === 0) {
      return;
    }

    let imageArr: Promise<void>[] = [];
    for (let key in images) {
      const p = loadImage(canvas, images[key]).then((img) => {
        this.cache.set(key, img);
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
    this.brush.clearM();
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
    this.brush.clearM();
    this.onStop?.();
  }

  /**
   * 清理容器画布
   */
  public clear(): void {
    this.brush.clearM();
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

  private startAnimation(): void {
    const { config, entity } = this;
    const { playMode, loopStartFrame, startFrame, endFrame, fillMode, loop } = config;
    let { frames, fps, sprites } = entity!;
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
       * loopStart = (loopStartFrame - startFrame) * (1 / fps) * 1000
       */
      loopStartFrame > startFrame
        ? ((loopStartFrame - startFrame) * 1000) / fps
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
      // 是否还有剩余时间
      const hasRemained = this.currFrame === value;
      // 尾帧如果封顶，则无需继续绘制
      if (this.tail !== spriteCount) {
        // 1.2和3均为阔值，保证渲染尽快完成
        const tmp = hasRemained
          ? Math.min(Math.ceil(spriteCount * spendValue * 1.2) + 3, spriteCount)
          : spriteCount;

        if (tmp > this.tail) {
          this.head = this.tail;
          this.tail = tmp;
          benchmark.time(`draw`, () => {
            this.brush.draw(
              this.cache,
              this.entity!,
              this.currFrame,
              this.head,
              this.tail
            );
          });
        }
      }

      if (hasRemained) {
        return;
      }

      this.brush.clearM();
      benchmark.time(
        "render",
        () => this.brush.stick(),
        null,
        (count) => {
          console.log("render count", count);
          benchmark.line(20);
          if (count < benchmark.count) {
            benchmark.clearTime("draw");
          } else {
            benchmark.lockTime("draw");
          }
        }
      );
      this.brush.clearS();
      this.onProcess?.();
      this.currFrame = value;
      this.tail = 0;
    };

    this.animator!.start();
  }
}
