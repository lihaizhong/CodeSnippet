/**
 * Supported Platform
 * 目前已支持微信小程序、支付宝小程序、抖音小程序、H5
 */
export const SP = {
  WECHAT: 1,
  ALIPAY: 2,
  DOUYIN: 3,
  H5: 4
};

let platform: number

// FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
if (typeof tt !== "undefined") {
  platform = SP.DOUYIN;
} else if (typeof my !== "undefined") {
  platform = SP.ALIPAY;
} else if (typeof wx !== "undefined") {
  platform = SP.WECHAT;
} else if (typeof window !== "undefined") {
  platform = SP.H5;
} else {
  throw new Error("Unsupported platform");
}

export { platform };
