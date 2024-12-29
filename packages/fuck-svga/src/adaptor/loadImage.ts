import type { PlatformCanvas, PlatformOffscreenCanvas } from '../types'
import { uint8ArrayToString } from '../utils'
import { getBridge } from './bridge'
import { platform, SupportedPlatform, throwUnsupportedPlatform } from './platform'

/**
 * 将ArrayBuffer转为base64
 * @param data 二进制数据
 * @returns 
 */
function toBase64(data: Uint8Array): string {
  // H5环境
  if (platform === SupportedPlatform.H5) {
    const str = uint8ArrayToString(data)

    return btoa(str)
  }

  return (getBridge() as WechatMiniprogram.Wx).arrayBufferToBase64(data.buffer as ArrayBuffer)
}

/**
 * 创建图片对象
 * @param canvas 画布对象
 * @returns 
 */
function createImage(
  canvas: PlatformCanvas | PlatformOffscreenCanvas
): WechatMiniprogram.Image | HTMLImageElement | null {
  if (platform === SupportedPlatform.H5) {
    return new Image()
  }
  
  if (platform !== SupportedPlatform.UNKNOWN) {
    return (canvas as WechatMiniprogram.Canvas | WechatMiniprogram.OffscreenCanvas).createImage()
  }

  return null
}

/**
 * 创建图片src元信息
 * @param data 
 * @returns 
 */
function createImageSource(data: Uint8Array | string): string {
  if (typeof data === "string") {
    return data
  }

  return "data:image/png;base64," + toBase64(data)
}

/**
 * 加载图片
 * @param canvas 画布对象
 * @param data 图片数据
 * @returns 
 */
export function loadImage(
  canvas: PlatformCanvas | PlatformOffscreenCanvas,
  data: Uint8Array | string
): Promise<WechatMiniprogram.Image | HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let img = createImage(canvas)

    if (img) {
      img.onload = () => resolve(img)
      img.onerror = (error: Error) => reject(new Error(`[SVGA LOADING FAILURE]: ${error.message}`))
      img.src = createImageSource(data)
    }

    reject(throwUnsupportedPlatform())
  });
}