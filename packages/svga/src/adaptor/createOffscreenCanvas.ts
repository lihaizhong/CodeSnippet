import { platform, SupportedPlatform } from "./platform"

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
