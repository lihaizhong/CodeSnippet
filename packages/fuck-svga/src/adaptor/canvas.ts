import type { PlatformCanvas, PlatformOffscreenCanvas } from "../types";
import bridge from "./bridge";
import { platform, SP, throwUnsupportedPlatform } from "./platform";

export function createOffscreenCanvas(
  options: WechatMiniprogram.CreateOffscreenCanvasOption
): PlatformOffscreenCanvas {
  if (platform === SP.WECHAT) {
    return wx.createOffscreenCanvas({
      ...options,
      type: "2d",
    });
  }

  if (platform === SP.H5) {
    return new OffscreenCanvas(
      options.width as number,
      options.height as number
    );
  }

  if (platform === SP.ALIPAY) {
    return my.createOffscreenCanvas({
      width: options.width,
      height: options.height,
    });
  }

  if (platform === SP.DOUYIN) {
    const canvas = (tt as any).createOffscreenCanvas();
    canvas.width = options.width;
    canvas.height = options.height;

    return canvas;
  }

  throw throwUnsupportedPlatform();
}

export interface IGetOffscreenCanvasResult {
  canvas: PlatformOffscreenCanvas;
  ctx: OffscreenRenderingContext;
}

export interface IGetCanvasResult {
  canvas: PlatformCanvas;
  ctx: CanvasRenderingContext2D;
}

export function getDevicePixelRatio() {
  if (platform === SP.H5) {
    return window.devicePixelRatio;
  }

  if (platform !== SP.UNKNOWN) {
    if ("getWindowInfo" in bridge) {
      const { pixelRatio } = (bridge as any).getWindowInfo();

      return pixelRatio;
    }

    const { pixelRatio } = (bridge as WechatMiniprogram.Wx).getSystemInfoSync();

    return pixelRatio;
  }

  throw throwUnsupportedPlatform();
}

export function getCanvas(
  selector: string,
  component?: WechatMiniprogram.Component.TrivialInstance | null
): Promise<IGetCanvasResult> {
  return new Promise((resolve, reject) => {
    const initCanvas = (
      canvas?: PlatformCanvas,
      width: number = 0,
      height: number = 0
    ) => {
      if (!canvas) {
        reject("canvas not found.");
        return;
      }
      const ctx = canvas!.getContext("2d");
      if (!ctx) {
        reject("canvas context not found.");
        return;
      }
      const ratio = getDevicePixelRatio();
      canvas!.width = width * ratio;
      canvas!.height = height * ratio;
      resolve({ canvas, ctx });
    };

    if (platform === SP.H5) {
      const canvas = document.querySelector(selector) as HTMLCanvasElement;
      const { width, height } = canvas.style;
      initCanvas(canvas, parseFloat(width), parseFloat(height));
    } else if (platform !== SP.UNKNOWN) {
      let query = (bridge as WechatMiniprogram.Wx).createSelectorQuery();
      if (component) {
        query = query.in(component);
      }
      query
        .select(selector)
        .fields({ node: true, size: true }, (res) => {
          if (res?.node) {
            const { node, width, height } = res;
            initCanvas(node, width, height);
          } else {
            reject(new Error("canvas not found!"));
          }
        })
        .exec();
    } else {
      reject(throwUnsupportedPlatform());
    }
  });
}

export interface IGetSecondaryScreenOptions {
  width: number;
  height: number;
  component?: WechatMiniprogram.Component.TrivialInstance | null;
}

export function getSecondaryScreen(
  selector: string | null,
  options: IGetSecondaryScreenOptions
): Promise<IGetCanvasResult | IGetOffscreenCanvasResult> {
  if (typeof selector === "string" && selector !== "") {
    return getCanvas(selector, options.component);
  }

  const { width, height } = options;
  const ofsCanvas = createOffscreenCanvas({ width, height });
  const ofsContext = ofsCanvas.getContext("2d");

  return Promise.resolve({ canvas: ofsCanvas, ctx: ofsContext });
}
