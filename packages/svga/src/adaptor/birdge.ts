import { platform, SupportedPlatform, UNSUPPORTED_PLATFORM } from "./platform"

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

  throw new Error(UNSUPPORTED_PLATFORM)
}