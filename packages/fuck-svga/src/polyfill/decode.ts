import { app, SP } from "./app";
import { br } from "./bridge";

// miniprogram btoa/atob polyfill
const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const b64re =
  /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

/**
 * btoa
 * 将一个二进制字符串（例如，将字符串中的每一个字节都视为一个二进制数据字节）编码为 Base64 编码的 ASCII 字符串
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/btoa
 * @param string 二进制字符串
 * @returns
 */
export function miniBtoa(string: string): string {
  let bitmap,
    a,
    b,
    c,
    result = "",
    rest = string.length % 3;

  for (let i = 0; i < string.length; ) {
    if (
      (a = string.charCodeAt(i++)) > 255 ||
      (b = string.charCodeAt(i++)) > 255 ||
      (c = string.charCodeAt(i++)) > 255
    )
      throw new TypeError(
        'Failed to execute "btoa" on "Window": The string to be encoded contains characters outside of the Latin1 range.'
      );

    bitmap = (a << 16) | (b << 8) | c;
    result +=
      b64.charAt((bitmap >> 18) & 63) +
      b64.charAt((bitmap >> 12) & 63) +
      b64.charAt((bitmap >> 6) & 63) +
      b64.charAt(bitmap & 63);
  }

  return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
}

/**
 * atob
 * 对经过 Base64 编码的字符串进行解码
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/atob
 * @param base64 base64字符串
 * @returns
 */
export function miniAtob(base64: string): string {
  let string = String(base64).replace(/[\t\n\f\r ]+/g, "");
  if (!b64re.test(string))
    throw new TypeError(
      'Failed to execute "atob" on "Window": The string to be decoded is not correctly encoded.'
    );
  string += "==".slice(2 - (string.length & 3));
  let bitmap,
    result = "",
    r1,
    r2;
  for (let i = 0; i < string.length; ) {
    bitmap =
      (b64.indexOf(string.charAt(i++)) << 18) |
      (b64.indexOf(string.charAt(i++)) << 12) |
      ((r1 = b64.indexOf(string.charAt(i++))) << 6) |
      (r2 = b64.indexOf(string.charAt(i++)));

    result +=
      r1 === 64
        ? String.fromCharCode((bitmap >> 16) & 255)
        : r2 === 64
        ? String.fromCharCode((bitmap >> 16) & 255, (bitmap >> 8) & 255)
        : String.fromCharCode(
            (bitmap >> 16) & 255,
            (bitmap >> 8) & 255,
            bitmap & 255
          );
  }

  return result;
}

/**
 * 将ArrayBuffer转为base64
 * @param data 二进制数据
 * @returns
 */
export function toBase64(data: Uint8Array): string {
  const ab = toBuffer(data);
  let b: string;

  if (app === SP.H5) {
    b = btoa(String.fromCharCode(...new Uint8Array(ab)));
  } else {
    b = br.arrayBufferToBase64(ab);
  }

  return `data:image/png;base64,${b}`;
}

/**
 * 将Uint8Array转ArrayBuffer
 * @param data 二进制数据
 * @returns
 */
export function toBitmap(data: Uint8Array): Promise<ImageBitmap> {
  return createImageBitmap(new Blob([toBuffer(data)]));
}

/**
 * Uint8Array转换成ArrayBuffer
 * @param data
 * @returns
 */
export function toBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  ) as ArrayBuffer;
}
