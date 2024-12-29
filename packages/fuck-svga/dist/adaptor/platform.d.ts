export declare const SupportedPlatform: {
    ALIPAY: string;
    WECHAT: string;
    DOUYIN: string;
    H5: string;
    UNKNOWN: string;
};
export declare const throwUnsupportedPlatform: () => Error;
/**
 * 获取平台信息
 * @returns
 */
export declare function getPlatform(): string;
export declare const platform: string;
