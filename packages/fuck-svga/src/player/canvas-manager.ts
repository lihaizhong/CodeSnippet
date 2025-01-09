import { getCanvas, getOffscreenCanvas, platform, SP } from "../polyfill";
import {
  BitmapsCache,
  PlatformCanvas,
  PlatformOffscreenCanvas,
  Video,
} from "../types";
import render from "./render";

export default class CanvasManager {
  /**
   * 主屏的 Canvas 元素
   */
  private mainScreen: PlatformCanvas | null = null;
  /**
   * 主屏的 Context 对象
   */
  private mainContext: CanvasRenderingContext2D | null = null;
  /**
   * 副屏的 Canvas 元素
   */
  private secondaryScreen: PlatformCanvas | PlatformOffscreenCanvas | null =
    null;
  /**
   * 副屏的 Context 对象
   */
  private secondaryContext:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;
  /**
   * 副屏的 Canvas 类型
   */
  private type?: "canvas" | "ofscanvas";

  public async register(
    selector: string,
    ofsSelector?: string,
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ) {
    const { canvas, ctx } = await getCanvas(selector, component);
    const { width, height } = canvas;

    this.mainScreen = canvas;
    this.mainContext = ctx;

    let ofsResult;

    if (typeof ofsSelector === "string" && ofsSelector !== "") {
      ofsResult = await getCanvas(ofsSelector, component);
      ofsResult.canvas.width = width;
      ofsResult.canvas.height = height;
      this.type = "canvas";
    } else {
      ofsResult = getOffscreenCanvas({ width, height });
      this.type = "ofscanvas";
    }

    this.secondaryScreen = ofsResult.canvas;
    this.secondaryContext = ofsResult.ctx;
  }

  public setConfig(options: { width: number; height: number }): void {
    this.mainScreen!.width = options.width;
    this.mainScreen!.height = options.height;
  }

  public getMainScreen(): PlatformCanvas {
    return this.mainScreen!;
  }

  public clearMainScreen() {
    const { width, height } = this.mainScreen!;

    this.mainScreen!.width = width;
    this.mainScreen!.height = height;
  }

  public clearSecondaryScreen() {
    const { width, height } = this.mainScreen!;

    if (
      this.type === "ofscanvas" &&
      platform === SP.H5 &&
      // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
      navigator.userAgent.includes("Firefox")
    ) {
      const ofsResult = getOffscreenCanvas({ width, height });
      this.secondaryScreen = ofsResult.canvas;
      this.secondaryContext = ofsResult.ctx;
    } else {
      this.secondaryScreen!.width = width;
      this.secondaryScreen!.height = height;
    }
  }

  public destroy() {
    this.clearMainScreen();
    this.clearSecondaryScreen();
    this.mainScreen = null;
    this.mainContext = null;
    this.secondaryScreen = null;
    this.secondaryContext = null;
    this.type = undefined;
  }

  public draw(
    bitmapsCache: BitmapsCache,
    videoEntity: Video,
    currentFrame: number,
    start?: number,
    end?: number
  ) {
    render(
      this.secondaryContext!,
      bitmapsCache,
      videoEntity,
      currentFrame,
      start,
      end
    );
  }

  public stick() {
    const { width, height } = this.mainScreen!;

    if (platform === SP.H5 || this.type === "canvas") {
      this.mainContext!.drawImage(
        this.secondaryScreen as CanvasImageSource,
        0,
        0
      );
    } else if (this.type === "ofscanvas") {
      const imageData = this.secondaryContext!.getImageData(
        0,
        0,
        width,
        height
      );
      this.mainContext!.putImageData(imageData, 0, 0);
    }
  }
}
