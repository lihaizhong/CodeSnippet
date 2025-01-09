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
   * Main Screen
   */
  private ms: PlatformCanvas | null = null;
  /**
   * 主屏的 Context 对象
   * Main Context
   */
  private mc: CanvasRenderingContext2D | null = null;
  /**
   * 副屏的 Canvas 元素
   * Secondary Screen
   */
  private ss: PlatformCanvas | PlatformOffscreenCanvas | null =
    null;
  /**
   * 副屏的 Context 对象
   * Secondary Context
   */
  private sc:
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

    this.ms = canvas;
    this.mc = ctx;

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

    this.ss = ofsResult.canvas;
    this.sc = ofsResult.ctx;
  }

  public setConfig(options: { width: number; height: number }): void {
    this.ms!.width = options.width;
    this.ms!.height = options.height;
  }

  public getMainScreen(): PlatformCanvas {
    return this.ms!;
  }

  public clearMainScreen() {
    const { width, height } = this.ms!;

    this.ms!.width = width;
    this.ms!.height = height;
  }

  public clearSecondaryScreen() {
    const { width, height } = this.ms!;

    if (
      this.type === "ofscanvas" &&
      platform === SP.H5 &&
      // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
      navigator.userAgent.includes("Firefox")
    ) {
      const ofsResult = getOffscreenCanvas({ width, height });
      this.ss = ofsResult.canvas;
      this.sc = ofsResult.ctx;
    } else {
      this.ss!.width = width;
      this.ss!.height = height;
    }
  }

  public destroy() {
    this.clearMainScreen();
    this.clearSecondaryScreen();
    this.ms = null;
    this.mc = null;
    this.ss = null;
    this.sc = null;
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
      this.sc!,
      bitmapsCache,
      videoEntity,
      currentFrame,
      start,
      end
    );
  }

  public stick() {
    const { width, height } = this.ms!;

    if (platform === SP.H5 || this.type === "canvas") {
      this.mc!.drawImage(
        this.ss as CanvasImageSource,
        0,
        0
      );
    } else if (this.type === "ofscanvas") {
      const imageData = this.sc!.getImageData(
        0,
        0,
        width,
        height
      );
      this.mc!.putImageData(imageData, 0, 0);
    }
  }
}
