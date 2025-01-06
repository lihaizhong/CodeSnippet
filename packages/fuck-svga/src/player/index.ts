import {
  createOffscreenCanvas,
  getCanvas,
  loadImage,
  platform,
  SP,
} from "../adaptor";
import {
  PLAYER_FILL_MODE,
  PLAYER_PLAY_MODE,
  PlayerConfigOptions,
  Video,
  BitmapsCache,
  PlayerConfig,
  PlatformCanvas,
  PlatformOffscreenCanvas,
} from "../types";
import { Animator } from "./animator";
import render from "./render";
import benchmark from "../test/benchmark";

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
    container: null,
    context: null,
    loop: 0,
    fillMode: PLAYER_FILL_MODE.FORWARDS,
    playMode: PLAYER_PLAY_MODE.FORWARDS,
    startFrame: 0,
    endFrame: 0,
    loopStartFrame: 0,
    // isUseIntersectionObserver: false,
  });

  private readonly selector: string = "#svga-board";
  private animator: Animator | null = null;
  private ofsCanvas: PlatformOffscreenCanvas | null = null;
  private ofsContext: OffscreenCanvasRenderingContext2D | null = null;

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
        throw new Error("StartFrame should > EndFrame");
      }
    }

    const result = await getCanvas(
      config.container || this.selector,
      component
    );

    this.config.container = result.canvas;
    this.config.context = result.ctx;
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
    this.ofsCanvas = createOffscreenCanvas({
      width: result.canvas.width,
      height: result.canvas.height,
    });
    this.ofsContext = this.ofsCanvas.getContext("2d");
    this.animator = new Animator(result.canvas);
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
    if (options) {
      await this.setConfig(options, component);
    }

    this.currentFrame = 0;
    this.totalFrames = videoEntity.frames - 1;
    this.videoEntity = videoEntity;
    this.clearContainer();
    this.setSize();
    benchmark.clearTime("render");

    if (this.videoEntity === undefined) {
      return;
    }

    const { images } = this.videoEntity;

    if (Object.keys(images).length === 0) {
      return;
    }

    let imageArr: Promise<void>[] = [];
    for (let key in images) {
      const image = images[key];
      const p = loadImage(this.ofsCanvas!, image).then((img) => {
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

  private clearContainer(): void {
    if (!this.isReady) {
      return;
    }

    const { container } = this.config;

    if (container !== null) {
      const { width } = container;
      container.width = width;
    }
  }

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
    this.clearContainer();
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
    this.clearContainer();
    this.onStop?.();
  }

  /**
   * 清理容器画布
   */
  public clear(): void {
    if (this.isReady) {
      this.clearContainer();
    }
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    if (this.isReady) {
      this.animator!.stop();
      this.clearContainer();

      this.animator = null;
      this.videoEntity = undefined;
      this.ofsCanvas = null;
      this.ofsContext = null;
    }
  }

  private startAnimation(): void {
    if (this.videoEntity === undefined)
      throw new Error("videoEntity undefined");

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

    let { frames, fps } = videoEntity;
    // 更新活动帧总数
    if (endFrame !== totalFrames) {
      frames = endFrame - startFrame;
    } else if (startFrame !== 0) {
      frames -= startFrame;
    }

    // frames * (1 / fps) * 1000
    this.animator!.duration = frames * 1000 / fps;
    // (loopStartFrame - startFrame) * (1 / fps) * 100
    this.animator!.loopStart =
      loopStartFrame > startFrame
        ? (loopStartFrame - startFrame) * 100 / fps
        : 0;
    this.animator!.loop = loop <= 0 ? Infinity : loop;
    this.animator!.fillRule = +(fillMode === PLAYER_FILL_MODE.BACKWARDS);
    this.animator!.onStart = () => {
      this.clearRender();
    };
    this.animator!.onUpdate = (value: number) => {
      this.drawFragmentFrame();

      if (this.currentFrame === value) {
        return;
      }

      this.currentFrame = value;
      this.render();
      this.clearRender();
      this.onProcess?.();
    };

    this.animator!.start();
  }

  private setSize(): void {
    if (this.videoEntity === undefined) {
      throw new Error("videoEntity undefined");
    }

    const { container } = this.config;
    const { width, height } = this.videoEntity.size;

    container!.width = width;
    container!.height = height;
  }

  private clearRender() {
    if (this.videoEntity === undefined) {
      throw new Error("Player VideoEntity undefined");
    }

    this.clearContainer();

    const { container } = this.config;

    const { width = 0, height = 0 } = container as PlatformCanvas;
    let { ofsCanvas } = this;

    // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
    if (platform === SP.H5 && navigator.userAgent.includes("Firefox")) {
      ofsCanvas = createOffscreenCanvas({ width, height });
    } else {
      ofsCanvas!.width = width;
      ofsCanvas!.height = height;
    }
  }

  private drawFragmentFrame(): void {
    benchmark.time("draw", () => {
      let { ofsContext, fragmentStart, fragmentEnd } = this;

      render(
        ofsContext!,
        this.bitmapsCache,
        this.videoEntity!,
        this.currentFrame,
        fragmentStart,
        fragmentEnd
      );
    });
  }

  /// ----------- 描绘一帧 -----------
  private render(): void {
    benchmark.time("render", () => {
      const { container, context } = this.config
      const { width = 0, height = 0 } = container as PlatformCanvas;
      let { ofsContext } = this;

      const imageData = ofsContext!.getImageData(0, 0, width, height);
      context!.putImageData(imageData, 0, 0, 0, 0, width, height);
    });
  }
}
