import { getCanvas, getOffscreenCanvas, platform, SP } from "../adaptor";
import {
  BitmapsCache,
  PlatformCanvas,
  PlatformOffscreenCanvas,
  Video,
} from "../types";
import render from "./render";

export default class CanvasManager {
  private mainScreen: PlatformCanvas | null = null;

  private mainContext: CanvasRenderingContext2D | null = null;

  private secondaryScreen: PlatformCanvas | PlatformOffscreenCanvas | null =
    null;

  private secondaryContext:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null = null;

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

  public setSize(width: number, height: number): void {
    this.mainScreen!.width = width;
    this.mainScreen!.height = height;
  }

  public getMainScreen(): PlatformCanvas {
    return this.mainScreen!;
  }

  public clearSecondaryScreen() {
    const { width, height } = this.mainScreen!;

    // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
    if (
      this.type === "ofscanvas" &&
      platform === SP.H5 &&
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

  public clearMainScreen() {
    const { width, height } = this.mainScreen!;
    this.setSize(width, height);
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

    switch (this.type) {
      case "canvas":
        this.mainContext!.drawImage(
          this.secondaryScreen as CanvasImageSource,
          0,
          0
        );
        break;
      case "ofscanvas":
        const imageData = this.secondaryContext!.getImageData(
          0,
          0,
          width,
          height
        );
        this.mainContext!.putImageData(imageData, 0, 0);
        break;
      default:
    }
  }
}
