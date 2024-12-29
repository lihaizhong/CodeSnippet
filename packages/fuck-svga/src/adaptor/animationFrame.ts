import { platform, SupportedPlatform, throwUnsupportedPlatform } from './platform'

export function startAnimationFrame(
  canvas: WechatMiniprogram.Canvas | HTMLCanvasElement | WechatMiniprogram.OffscreenCanvas | OffscreenCanvas,
  callback: () => void
): number {
  if (platform === SupportedPlatform.H5) {
    return requestAnimationFrame(callback)
  }

  if (platform !== SupportedPlatform.UNKNOWN) {
    return (canvas as WechatMiniprogram.Canvas).requestAnimationFrame(callback)
  }

  throw throwUnsupportedPlatform()
}