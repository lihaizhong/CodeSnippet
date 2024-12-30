import {
  createOffscreenCanvas,
  getCanvas,
  loadImage,
  platform,
  SupportedPlatform,
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
  public readonly config: PlayerConfig = {
    container: null,
    context: null,
    loop: 0,
    fillMode: PLAYER_FILL_MODE.FORWARDS,
    playMode: PLAYER_PLAY_MODE.FORWARDS,
    startFrame: 0,
    endFrame: 0,
    loopStartFrame: 0,
    isUseIntersectionObserver: false,
  };

  private readonly selector: string = "#svga-board";
  private animator: Animator | null;
  private readonly ofsCanvas: PlatformOffscreenCanvas;

  // private isBeIntersection = true;
  // private intersectionObserver: IntersectionObserver | null = null
  private bitmapsCache: BitmapsCache = {};

  constructor() {
    this.ofsCanvas = createOffscreenCanvas({});
    this.animator = new Animator(this.ofsCanvas);
    this.animator.onEnd = () => {
      if (this.onEnd !== undefined) {
        this.onEnd();
      }
    };
  }

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
    this.config.isUseIntersectionObserver =
      config.isUseIntersectionObserver ?? false;
    // 监听容器是否处于浏览器视窗内
    // this.setIntersectionObserver()
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
  public mount(videoEntity: Video): Promise<void> {
    this.currentFrame = 0;
    this.totalFrames = videoEntity.frames - 1;
    this.videoEntity = videoEntity;
    this.clearContainer();
    this.setSize();

    if (this.videoEntity === undefined) {
      return Promise.resolve();
    }

    const { images } = this.videoEntity;

    if (Object.keys(images).length === 0) {
      return Promise.resolve();
    }

    let imageArr: any[] = [];
    for (let key in images) {
      const image = images[key];
      const p = loadImage(this.ofsCanvas, image).then((img) => {
        this.bitmapsCache[key] = img;
      });

      imageArr.push(p);
    }

    return Promise.all(imageArr) as unknown as Promise<void>;
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
    if (this.videoEntity === undefined) {
      throw new Error("videoEntity undefined");
    }
    this.clearContainer();
    this.startAnimation();
    if (this.onStart !== undefined) {
      this.onStart();
    }
  }

  /**
   * 重新播放
   */
  public resume(): void {
    this.startAnimation();
    if (this.onResume !== undefined) {
      this.onResume();
    }
  }

  /**
   * 暂停播放
   */
  public pause(): void {
    (this.animator as Animator).stop();
    if (this.onPause !== undefined) {
      this.onPause();
    }
  }

  /**
   * 停止播放
   */
  public stop(): void {
    (this.animator as Animator).stop();
    this.currentFrame = 0;
    this.clearContainer();
    if (this.onStop !== undefined) {
      this.onStop();
    }
  }

  /**
   * 清理容器画布
   */
  public clear(): void {
    this.clearContainer();
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    (this.animator as Animator).stop();
    this.clearContainer();

    this.animator = null;
    (this.videoEntity as any) = null;
  }

  private startAnimation(): void {
    if (this.videoEntity === undefined)
      throw new Error("videoEntity undefined");

    const { config, totalFrames, videoEntity } = this;
    const { playMode, startFrame, endFrame, loopStartFrame, fillMode, loop } =
      config;

    // 如果开始动画的当前帧是最后一帧，重置为第 0 帧
    if (this.currentFrame === totalFrames) {
      this.currentFrame = startFrame > 0 ? startFrame : 0;
    }

    if (playMode === PLAYER_PLAY_MODE.FORWARDS) {
      (this.animator as Animator).startValue = startFrame > 0 ? startFrame : 0;
      (this.animator as Animator).endValue =
        endFrame > 0 ? endFrame : totalFrames;
    } else {
      // 倒播
      (this.animator as Animator).startValue =
        endFrame > 0 ? endFrame : totalFrames;
      (this.animator as Animator).endValue = startFrame > 0 ? startFrame : 0;
    }

    let frames = videoEntity.frames;

    if (endFrame > 0 && endFrame > startFrame) {
      frames = endFrame - startFrame;
    } else if (endFrame <= 0 && startFrame > 0) {
      frames = videoEntity.frames - startFrame;
    }

    (this.animator as Animator).duration =
      frames * (1.0 / videoEntity.fps) * 1000;
    (this.animator as Animator).loopStart =
      loopStartFrame > startFrame
        ? (loopStartFrame - startFrame) * (1.0 / videoEntity.fps) * 1000
        : 0;
    (this.animator as Animator).loop =
      loop === true || (loop as number) <= 0
        ? Infinity
        : loop === false
        ? 1
        : loop;
    (this.animator as Animator).fillRule = fillMode === "backwards" ? 1 : 0;
    (this.animator as Animator).onUpdate = (value: number) => {
      if (this.currentFrame === value) {
        return;
      }
      this.currentFrame = value;
      this.drawFrame();
      if (this.onProcess !== undefined) {
        this.onProcess();
      }
    };

    (this.animator as Animator).start();
  }

  private setSize(): void {
    if (this.videoEntity === undefined) {
      throw new Error("videoEntity undefined");
    }

    const { container } = this.config;
    const { width, height } = this.videoEntity.size;

    (container as PlatformCanvas).width = width;
    (container as PlatformCanvas).height = height;
  }

  /// ----------- 描绘一帧 -----------
  private drawFrame(): void {
    if (this.videoEntity === undefined) {
      throw new Error("Player VideoEntity undefined");
    }
    // if (this.config.isUseIntersectionObserver && !this.isBeIntersection) return;

    this.clearContainer();

    const { context, container } = this.config;
    if (context === null) {
      throw new Error("Canvas Context cannot be null");
    }

    const { width = 0, height = 0 } = container as PlatformCanvas;
    let { ofsCanvas } = this;

    // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
    if (
      platform === SupportedPlatform.H5 &&
      navigator.userAgent.includes("Firefox")
    ) {
      ofsCanvas = createOffscreenCanvas({ width, height });
    } else {
      ofsCanvas.width = width;
      ofsCanvas.height = height;
    }

    const imageData = render(
      ofsCanvas,
      this.bitmapsCache,
      this.videoEntity.dynamicElements,
      this.videoEntity.replaceElements,
      this.videoEntity,
      this.currentFrame
    );

    context.putImageData(
      imageData,
      0,
      0,
      0,
      0,
      ofsCanvas.width,
      ofsCanvas.height
    );
  }
}
