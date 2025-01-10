import { platform, SP } from "./platform";
import bridge from "./bridge";

/**
 * 获取当前显示设备的物理像素分辨率与CSS 像素分辨率之比
 */
let dpr: number = 1;

if (platform === SP.H5) {
  dpr = window.devicePixelRatio;
}

if ("getWindowInfo" in bridge) {
  dpr = (bridge as any).getWindowInfo().pixelRatio;
}

if ("getSystemInfoSync" in bridge) {
  dpr = (bridge as WechatMiniprogram.Wx).getSystemInfoSync().pixelRatio;
}

export { dpr };
