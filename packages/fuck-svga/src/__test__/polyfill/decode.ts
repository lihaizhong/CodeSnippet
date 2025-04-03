// miniprogram btoa/atob polyfill
const b64c =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const b64re =
  /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

/**
 * btoa implementation
 * 将一个二进制字符串（例如，将字符串中的每一个字节都视为一个二进制数据字节）编码为 Base64 编码的 ASCII 字符串
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/btoa
 * @param data 二进制字符串
 * @returns
 */
export function mbtoa(data: string): string {
  let bitmap,
    a,
    b,
    c,
    result = "",
    rest = data.length % 3;

  for (let i = 0; i < data.length; ) {
    if (
      (a = data.charCodeAt(i++)) > 255 ||
      (b = data.charCodeAt(i++)) > 255 ||
      (c = data.charCodeAt(i++)) > 255
    ) {
      throw new TypeError(
        'Failed to execute "btoa" on "Window": The string to be encoded contains characters outside of the Latin1 range.'
      );
    }

    bitmap = (a << 16) | (b << 8) | c;
    result +=
      b64c.charAt((bitmap >> 18) & 63) +
      b64c.charAt((bitmap >> 12) & 63) +
      b64c.charAt((bitmap >> 6) & 63) +
      b64c.charAt(bitmap & 63);
  }

  return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
}

/**
 * atob implementation
 * 对经过 Base64 编码的字符串进行解码
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Window/atob
 * @param data base64字符串
 * @returns
 */
export function matob(data: string): string {
  let string = String(data).replace(/[\t\n\f\r ]+/g, "");
  if (!b64re.test(string)) {
    throw new TypeError(
      'Failed to execute "atob" on "Window": The string to be decoded is not correctly encoded.'
    );
  }
  string += "==".slice(2 - (string.length & 3));
  let bitmap,
    result = "",
    r1,
    r2;
  for (let i = 0; i < string.length; ) {
    bitmap =
      (b64c.indexOf(string.charAt(i++)) << 18) |
      (b64c.indexOf(string.charAt(i++)) << 12) |
      ((r1 = b64c.indexOf(string.charAt(i++))) << 6) |
      (r2 = b64c.indexOf(string.charAt(i++)));

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
