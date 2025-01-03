import {
  platform,
  SP,
  throwUnsupportedPlatform,
} from "./platform";

let bridge: any = null;

export function getBridge(): WechatMiniprogram.Wx | Window {
  if (bridge) {
    return bridge;
  }

  if (platform === SP.WECHAT) {
    bridge = wx;
    return wx;
  }

  if (platform === SP.H5) {
    bridge = window;
    return window;
  }

  if (platform === SP.ALIPAY) {
    bridge = my;
    return my;
  }

  if (platform === SP.DOUYIN) {
    bridge = tt;
    return tt;
  }

  throw throwUnsupportedPlatform();
}
