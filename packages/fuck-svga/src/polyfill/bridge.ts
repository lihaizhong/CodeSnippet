import { platform, SP } from "./platform";

let bridge: any = null;

if (platform === SP.WECHAT) {
  bridge = wx;
} else if (platform === SP.H5) {
  bridge = window;
} else if (platform === SP.ALIPAY) {
  bridge = my;
} else if (platform === SP.DOUYIN) {
  bridge = tt;
}

export default bridge;
