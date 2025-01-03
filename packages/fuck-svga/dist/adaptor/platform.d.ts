/**
 * Supported Platform
 * 目前已支持微信小程序、支付宝小程序、抖音小程序、H5
 */
export declare const SP: {
    WECHAT: number;
    ALIPAY: number;
    DOUYIN: number;
    H5: number;
    UNKNOWN: number;
};
export declare const throwUnsupportedPlatform: () => Error;
/**
 * 获取平台信息
 * @returns
 */
export declare function getPlatform(): number;
export declare const platform: number;
