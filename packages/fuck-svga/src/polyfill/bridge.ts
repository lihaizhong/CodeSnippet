import { app, SP } from "./app";

let br: any = null;

if (app === SP.H5) {
  br = window;
} else if (app === SP.ALIPAY) {
  br = my;
} else if (app === SP.DOUYIN) {
  br = tt;
} else if (app === SP.WECHAT) {
  br = wx;
}

export { br };
