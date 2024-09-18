import { getBridge } from "./birdge"
import { platform, SupportedPlatform, UNSUPPORTED_PLATFORM } from "./platform"

export interface IGetCanvasResult {
  canvas: WechatMiniprogram.Canvas | HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}

export function getCanvas(selector: string, component?: WechatMiniprogram.Component.TrivialInstance): Promise<IGetCanvasResult> {
  return new Promise((resolve, reject) => {
    const bridge = getBridge()
    const initCanvas = (canvas?: WechatMiniprogram.Canvas | HTMLCanvasElement, width: number = 0, height: number = 0) => {
      if (!canvas) {
        reject("canvas not found.");
        return;
      }
      const ctx = canvas!.getContext("2d");
      if (!ctx) {
        reject("canvas context not found.");
        return;
      }
      const dpr = (bridge as WechatMiniprogram.Wx).getSystemInfoSync().pixelRatio;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      resolve({ canvas, ctx });
    }

    if (platform === SupportedPlatform.H5) {
      const canvas = document.querySelector(selector) as HTMLCanvasElement
      initCanvas(canvas, parseFloat(canvas.style.width), parseFloat(canvas.style.height))
    } else if (platform !== SupportedPlatform.UNKNOWN) {
        let query = (bridge as WechatMiniprogram.Wx).createSelectorQuery();
        if (component) {
          query = query.in(component);
        }
        query
          .select(selector)
          .fields({ node: true, size: true })
          .exec((res) => {            
            initCanvas(res?.[0]?.node, res?.[0].width, res?.[0].height)
          });
    }

    throw new Error(UNSUPPORTED_PLATFORM)
  })
}