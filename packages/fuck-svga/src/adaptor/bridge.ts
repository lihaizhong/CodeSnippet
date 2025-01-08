import {
  platform,
  SP,
  throwUnsupportedPlatform,
} from "./platform";

let bridge: any = null;

if (platform === SP.WECHAT) {
  bridge = wx;
}

if (platform === SP.H5) {
  bridge = window;
}

if (platform === SP.ALIPAY) {
  bridge = my;
}

if (platform === SP.DOUYIN) {
  bridge = tt;
}

throw throwUnsupportedPlatform();

export default bridge
