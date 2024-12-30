import type { PlatformCanvas, PlatformImage, PlatformOffscreenCanvas } from '../types'
import { getBridge } from './bridge'
import { platform, SupportedPlatform, throwUnsupportedPlatform } from './platform'

/**
 * 将ArrayBuffer转为base64
 * @param data 二进制数据
 * @returns 
 */
function toBase64(data: Uint8Array): string {
  const ab = createArrayBuffer(data)
  let b: string

  if (platform === SupportedPlatform.H5) {
    b = btoa(String.fromCharCode(...new Uint8Array(ab)))
  } else {
    b = (getBridge() as WechatMiniprogram.Wx).arrayBufferToBase64(ab)
  }

  return `data:image/png;base64,${b}`
}

/**
 * 将Uint8Array转ArrayBuffer
 * @param data 二进制数据
 * @returns 
 */
function toBitmap(data: Uint8Array): Promise<ImageBitmap> {
  const ab = createArrayBuffer(data)

  return createImageBitmap(new Blob([ab]))
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
 * Uint8Array转换成ArrayBuffer
 * @param data 
 * @returns
 */
function createArrayBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
}

/**
 * 创建图片src元信息
 * @param data 
 * @returns 
 */
function genImageSource(data: Uint8Array | string): string {
  if (typeof data === "string") {
    return data
  }

  return toBase64(data)
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
): Promise<PlatformImage | ImageBitmap> {
  if (platform === SupportedPlatform.H5) {
    return toBitmap(data as Uint8Array)
  }

  return new Promise((resolve, reject) => {
    const img = createImage(canvas)

    if (img) {
      img.onload = () => resolve(img)
      img.onerror = (error: Error) => reject(new Error(`[SVGA LOADING FAILURE]: ${error.message}`))
      img.src = genImageSource(data as Uint8Array | string)
    } else {
      reject(throwUnsupportedPlatform())
    }
  });
}