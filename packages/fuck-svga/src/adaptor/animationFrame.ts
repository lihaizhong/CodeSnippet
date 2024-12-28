import { platform, SupportedPlatform, UNSUPPORTED_ERROR } from './platform'

export function startAnimationFrame(canvas: WechatMiniprogram.Canvas | HTMLCanvasElement, callback: () => void): number {
  if (platform === SupportedPlatform.H5) {
    return requestAnimationFrame(callback)
  }

  if (platform !== SupportedPlatform.UNKNOWN) {
    return (canvas as WechatMiniprogram.Canvas).requestAnimationFrame(callback)
  }

  throw UNSUPPORTED_ERROR
}