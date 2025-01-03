/**
 * Supported Platform
 * 目前已支持微信小程序、支付宝小程序、抖音小程序、H5
 */
export const SP = {
  WECHAT: 1,
  ALIPAY: 2,
  DOUYIN: 3,
  H5: 4,
  UNKNOWN: 0,
};

export const throwUnsupportedPlatform = () => new Error("Unsupported platform");

/**
 * 获取平台信息
 * @returns
 */
export function getPlatform() {
  // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
  if (typeof tt !== "undefined") {
    return SP.DOUYIN;
  }

  if (typeof my !== "undefined") {
    return SP.ALIPAY;
  }

  if (typeof wx !== "undefined") {
    return SP.WECHAT;
  }

  if (typeof window !== "undefined") {
    return SP.H5;
  }

  return SP.UNKNOWN;
}

export const platform = getPlatform();
