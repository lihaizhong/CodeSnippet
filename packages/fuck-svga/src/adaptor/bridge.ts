import {
  platform,
  SupportedPlatform,
  throwUnsupportedPlatform,
} from "./platform";

let bridge: any = null;

export function getBridge(): WechatMiniprogram.Wx | Window {
  if (bridge) {
    return bridge;
  }

  if (platform === SupportedPlatform.WECHAT) {
    bridge = wx;
    return wx;
  }

  if (platform === SupportedPlatform.H5) {
    bridge = window;
    return window;
  }

  if (platform === SupportedPlatform.ALIPAY) {
    bridge = my;
    return my;
  }

  if (platform === SupportedPlatform.DOUYIN) {
    bridge = tt;
    return tt;
  }

  throw throwUnsupportedPlatform();
}
