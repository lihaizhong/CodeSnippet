import { platform, SP } from "./platform";
import bridge from "./bridge";

/**
 * 获取当前显示设备的物理像素分辨率与CSS 像素分辨率之比
 */
let pixelRatio: number = 1;

if (platform === SP.H5) {
  pixelRatio = window.devicePixelRatio;
}

if ("getWindowInfo" in bridge) {
  pixelRatio = (bridge as any).getWindowInfo().pixelRatio;
}

if ("getSystemInfoSync" in bridge) {
  pixelRatio = (bridge as WechatMiniprogram.Wx).getSystemInfoSync().pixelRatio;
}

export { pixelRatio };
