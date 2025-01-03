/**
 * btoa
 * 将一个二进制字符串（例如，将字符串中的每一个字节都视为一个二进制数据字节）编码为 Base64 编码的 ASCII 字符串
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/btoa
 * @param string 二进制字符串
 * @returns
 */
export declare function miniBtoa(string: string): string;
/**
 * atob
 * 对经过 Base64 编码的字符串进行解码
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/atob
 * @param base64 base64字符串
 * @returns
 */
export declare function miniAtob(base64: string): string;
