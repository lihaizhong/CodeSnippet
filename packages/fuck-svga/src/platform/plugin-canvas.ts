/**
 * 获取并重置Canvas
 * @param canvas 
 * @param width 
 * @param height 
 * @param dpr 
 * @returns 
 */
function initCanvas(
  canvas: PlatformCanvas | null,
  width: number,
  height: number,
  dpr: number
) {
  if (!canvas) {
    throw new Error("canvas not found.");
  }

  const ctx = canvas!.getContext("2d");
  canvas!.width = width * dpr;
  canvas!.height = height * dpr;
  ctx.scale(dpr, dpr);

  return { canvas, ctx };
}

export function getCanvas(this: IPlatform) {
  const { env, br, dpr } = this.global;

  if (env === SupportedPlatform.H5) {
    this.getCanvas = (selector: string, component?: WechatMiniprogram.Component.TrivialInstance | null) => {
      return new Promise((resolve) => {
        const canvas = document.querySelector(selector) as HTMLCanvasElement;
        const { clientWidth, clientHeight } = canvas;

        resolve(initCanvas(canvas, clientWidth, clientHeight, dpr));
      });
    }
  } else {
    this.getCanvas = (selector: string, component?: WechatMiniprogram.Component.TrivialInstance | null) => {
      return new Promise((resolve) => {
        let query = (br as WechatMiniprogram.Wx).createSelectorQuery();

        if (component) {
          query = query.in(component);
        }
  
        query
          .select(selector)
          .fields({ node: true, size: true }, (res) => {
            const { node, width, height } = res || {};
  
            resolve(initCanvas(node, width, height, dpr));
          })
          .exec();
      })
    }
  }
}
