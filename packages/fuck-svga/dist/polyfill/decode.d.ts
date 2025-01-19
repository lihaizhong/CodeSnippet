/**
 * btoa implementation
 * 将一个二进制字符串（例如，将字符串中的每一个字节都视为一个二进制数据字节）编码为 Base64 编码的 ASCII 字符串
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/btoa
 * @param string 二进制字符串
 * @returns
 */
export declare function mbtoa(string: string): string;
/**
 * atob implementation
 * 对经过 Base64 编码的字符串进行解码
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/atob
 * @param base64 base64字符串
 * @returns
 */
export declare function matob(base64: string): string;
/**
 * 将ArrayBuffer转为base64
 * @param data 二进制数据
 * @returns
 */
export declare function toBase64(data: Uint8Array): string;
/**
 * 生成ImageBitmap数据
 * 目前仅H5支持
 * @param data 二进制数据
 * @returns
 */
export declare function toBitmap(data: Uint8Array): Promise<ImageBitmap>;
/**
 * Uint8Array转换成ArrayBuffer
 * @param data
 * @returns
 */
export declare function toBuffer(data: Uint8Array): ArrayBuffer;
