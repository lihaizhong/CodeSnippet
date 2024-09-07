declare const my: WechatMiniprogram.Wx;
declare const tt: WechatMiniprogram.Wx;

export const SupportedPlatform = {
  ALIPAY: 'alipay',
  WECHAT: 'wechat',
  DOUYIN: 'douyin',
  H5: 'h5',
  UNKNOWN: 'unknown'
}

export function getPlatform() {
  // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
  if (typeof tt !== 'undefined') {
    return SupportedPlatform.DOUYIN
  }

  if (typeof my !== 'undefined') {
    return SupportedPlatform.ALIPAY
  }

  if (typeof wx !== 'undefined') {
    return SupportedPlatform.WECHAT
  }

  if (typeof window !== 'undefined') {
    return SupportedPlatform.H5
  }

  return SupportedPlatform.UNKNOWN
}

export const platform = getPlatform()

export function getBridge(): WechatMiniprogram.Wx | Window {
  if (platform === SupportedPlatform.WECHAT) {
    return wx
  }

  if (platform === SupportedPlatform.H5) {
    return window
  }

  if (platform === SupportedPlatform.ALIPAY) {
    return my
  }

  if (platform === SupportedPlatform.DOUYIN) {
    return tt
  }

  throw new Error('不支持当前平台')
}

export const bridge = getBridge()

export function createOffscreenCanvas(options: WechatMiniprogram.CreateOffscreenCanvasOption): WechatMiniprogram.OffscreenCanvas | OffscreenCanvas {
  if (platform === SupportedPlatform.WECHAT) {
    return wx.createOffscreenCanvas(options)
  }

  if (platform === SupportedPlatform.H5 && 'OffscreenCanvas' in window) {
    return new OffscreenCanvas(options.width as number, options.height as number)
  }

  if (platform === SupportedPlatform.ALIPAY) {
    return my.createOffscreenCanvas({
      width: options.width,
      height: options.height,
    })
  }

  if (platform === SupportedPlatform.DOUYIN) {
    const canvas = (tt as any).createOffscreenCanvas()
    canvas.width = options.width
    canvas.height = options.height

    return canvas
  }

  throw new Error('暂不支持当前平台')
}

export interface IGetCanvasResult {
  canvas: WechatMiniprogram.Canvas | HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}

export function getCanvas(selector: string, component?: WechatMiniprogram.Component.TrivialInstance): Promise<IGetCanvasResult> {
  return new Promise((resolve, reject) => {
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

    throw new Error('暂不支持当前平台')
  })
}

export function loadImage(canvas: WechatMiniprogram.Canvas | HTMLCanvasElement, data: Uint8Array | string) {
  return new Promise((resolve, reject) => {
    let img: WechatMiniprogram.Image | HTMLImageElement | null = null

    if (platform === SupportedPlatform.H5) {
      img = new Image()
    } else if (platform !== SupportedPlatform.UNKNOWN) {
      img = (canvas as WechatMiniprogram.Canvas).createImage()
    }

    if (img) {
      img.onload = () => {
        resolve(img);
      };
      img.onerror = (error: Error) => {
        console.log('SVGA图片加载失败！', error);
        reject("image decoded fail.");
      };
      if (typeof data === "string") {
        img.src = data;
      } else {
        img.src = "data:image/png;base64," + (bridge as any).arrayBufferToBase64(data);
      }
    }

    reject(new Error('暂不支持当前平台'))
  });
}

export function startAnimationFrame(canvas: WechatMiniprogram.Canvas | HTMLCanvasElement, callback: () => void): number {
  if (platform === SupportedPlatform.H5) {
    return requestAnimationFrame(callback)
  }

  if (platform !== SupportedPlatform.UNKNOWN) {
    return (canvas as WechatMiniprogram.Canvas).requestAnimationFrame(callback)
  }

  throw new Error('暂不支持当前平台')
}

function polyfill() {
  if (platform === SupportedPlatform.H5) {
    if (!('arrayBufferToBase64' in window)) {
      (window as any).arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array( buffer );
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
      }
    }
  }
}

polyfill()
