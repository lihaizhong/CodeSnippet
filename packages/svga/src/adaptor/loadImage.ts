import { getBridge } from './bridge'
import { platform, SupportedPlatform, UNSUPPORTED_PLATFORM } from './platform'

/**
 * 将ArrayBuffer转为base64
 * @param data 二进制数据
 * @returns 
 */
function a2b(data: Uint8Array): string {
  // H5环境
  if (platform === SupportedPlatform.H5) {
    const _atob = (buffer: ArrayBuffer) => {
      const bytes = new Uint8Array( buffer )
      const len = bytes.byteLength
      let binary = ''

      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] )
      }

      return window.btoa(binary)
    }

    return _atob(data.buffer as ArrayBuffer)
  }

  return (getBridge() as WechatMiniprogram.Wx).arrayBufferToBase64(data.buffer as ArrayBuffer)
}

function createImage(
  canvas: WechatMiniprogram.Canvas | HTMLCanvasElement
): WechatMiniprogram.Image | HTMLImageElement | null {
  if (platform === SupportedPlatform.H5) {
    return new Image()
  }
  
  if (platform !== SupportedPlatform.UNKNOWN) {
    return (canvas as WechatMiniprogram.Canvas).createImage()
  }

  return null
}

function createImageSource(data: Uint8Array | string): string {
  if (typeof data === "string") {
    return data
  }

  return "data:image/png;base64," + a2b(data)
}

/**
 * 加载图片
 * @param canvas 画布对象
 * @param data 图片数据
 * @returns 
 */
export function loadImage(
  canvas: WechatMiniprogram.Canvas | HTMLCanvasElement,
  data: Uint8Array | string
): Promise<WechatMiniprogram.Image | HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let img = createImage(canvas)

    if (img) {
      img.onload = () => resolve(img)
      img.onerror = (error: Error) => reject(new Error(`[SVGA LOADING FAILURE]: ${error.message}`))
      img.src = createImageSource(data)
    }

    reject(new Error(UNSUPPORTED_PLATFORM))
  });
}