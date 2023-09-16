import { app, SP } from "./app";
import { br } from "./bridge";

/**
 * 获取当前显示设备的物理像素分辨率与CSS 像素分辨率之比
 */
let dpr: number = 1;

if (app === SP.H5) {
  dpr = window.devicePixelRatio;
} else if ("getWindowInfo" in br) {
  dpr = (br as any).getWindowInfo().pixelRatio;
} else if ("getSystemInfoSync" in br) {
  dpr = (br as WechatMiniprogram.Wx).getSystemInfoSync().pixelRatio;
}

export { dpr };
