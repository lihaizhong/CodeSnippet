import type { PlatformCanvas, PlatformOffscreenCanvas } from "../types";
import bridge from "./bridge";
import { platform, SP } from "./platform";
import { dpr } from "./ratio";

/**
 * 创建离屏Canvas
 * @param options 离屏Canvas参数
 * @returns
 */
export function createOffscreenCanvas(
  options: WechatMiniprogram.CreateOffscreenCanvasOption
): PlatformOffscreenCanvas {
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

  return wx.createOffscreenCanvas({
    ...options,
    type: "2d",
  });
}

export interface IGetCanvasResult {
  canvas: PlatformCanvas;
  ctx: CanvasRenderingContext2D;
}

/**
 * 获取Canvas及其Context
 * @param selector
 * @param component
 * @returns
 */
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
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx.scale(dpr, dpr);
      resolve({ canvas, ctx });
    };

    if (platform === SP.H5) {
      const canvas = document.querySelector(selector) as HTMLCanvasElement;
      const { width, height } = canvas.style;
      initCanvas(canvas, parseFloat(width), parseFloat(height));
    } else {
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
    }
  });
}

export interface IGetOffscreenCanvasResult {
  canvas: PlatformOffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
}

/**
 * 获取离屏Canvas及其Context
 * @param options
 * @returns
 */
export function getOffscreenCanvas(
  options: WechatMiniprogram.CreateOffscreenCanvasOption
): IGetOffscreenCanvasResult {
  const canvas = createOffscreenCanvas(options);
  const ctx = canvas.getContext("2d");

  return { canvas, ctx };
}
