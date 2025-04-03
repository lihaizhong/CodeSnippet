/**
 * btoa implementation
 * 将一个二进制字符串（例如，将字符串中的每一个字节都视为一个二进制数据字节）编码为 Base64 编码的 ASCII 字符串
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/btoa
 * @param data 二进制字符串
 * @returns
 */
export declare function mbtoa(data: string): string;
/**
 * atob implementation
 * 对经过 Base64 编码的字符串进行解码
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/atob
 * @param data base64字符串
 * @returns
 */
export declare function matob(data: string): string;
