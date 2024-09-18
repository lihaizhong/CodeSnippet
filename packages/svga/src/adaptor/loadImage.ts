import { getBridge } from "./birdge"
import { platform, SupportedPlatform, UNSUPPORTED_PLATFORM } from "./platform"

function arrayBufferToBase64(data: Uint8Array): string {
  if (platform === SupportedPlatform.H5) {
    const atob = (buffer: ArrayBuffer) => {
      let binary = '';
      const bytes = new Uint8Array( buffer );
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return window.btoa( binary );
    }

    return atob(data)
  }

  const bridge = getBridge()

  return bridge.arrayBufferToBase64(data)
}

export function loadImage(canvas: WechatMiniprogram.Canvas | HTMLCanvasElement, data: Uint8Array | string): Promise<WechatMiniprogram.Image | HTMLImageElement> {
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
        img.src = "data:image/png;base64," + arrayBufferToBase64(data);
      }
    }

    reject(new Error(UNSUPPORTED_PLATFORM))
  });
}