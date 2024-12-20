import { platform, SupportedPlatform, UNSUPPORTED_PLATFORM } from './platform'

export function startAnimationFrame(canvas: WechatMiniprogram.Canvas | HTMLCanvasElement, callback: () => void): number {
  if (platform === SupportedPlatform.H5) {
    return requestAnimationFrame(callback)
  }

  if (platform !== SupportedPlatform.UNKNOWN) {
    return (canvas as WechatMiniprogram.Canvas).requestAnimationFrame(callback)
  }

  throw new Error(UNSUPPORTED_PLATFORM)
}