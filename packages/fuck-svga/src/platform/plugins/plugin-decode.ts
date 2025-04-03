import { definePlugin } from "../definePlugin";

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
function utf8(buffer: Uint8Array, start: number, end: number): string {
  if (end > buffer.length) throw new RangeError("End exceeds buffer length");

  if (end - start < 1) return "";

  const codes: number[] = []; // 预分配内存空间
  let chunk = ""; // ASCII 字符块缓存
  const fromCharCode = String.fromCharCode;
  for (let i = start; i < end; ) {
    const t = buffer[i++];

    if (t <= 0x7f) {
      // ASCII 快速路径
      chunk += fromCharCode(t);
      // 每 1024 个字符或遇到变长编码时提交块
      if (chunk.length >= 1024 || (i < end && buffer[i] > 0x7f)) {
        codes.push(...chunk.split("").map((c) => c.charCodeAt(0)));
        chunk = "";
      }
    } else {
      if (chunk.length > 0) {
        codes.push(...chunk.split("").map((c) => c.charCodeAt(0)));
        chunk = "";
      }

      // 变长编码处理
      let codePoint: number;
      if (t >= 0xc0 && t < 0xe0) {
        // 2-byte
        codePoint = ((t & 0x1f) << 6) | (buffer[i++] & 0x3f);
      } else if (t >= 0xe0 && t < 0xf0) {
        // 3-byte
        codePoint =
          ((t & 0xf) << 12) |
          ((buffer[i++] & 0x3f) << 6) |
          (buffer[i++] & 0x3f);
      } else {
        // 4-byte
        codePoint =
          (((t & 7) << 18) |
            ((buffer[i++] & 0x3f) << 12) |
            ((buffer[i++] & 0x3f) << 6) |
            (buffer[i++] & 0x3f)) -
          0x10000;
        codes.push(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff));
        continue;
      }
      codes.push(codePoint);
    }
  }

  if (chunk.length > 0) {
    // 提交最后的 ASCII 块
    codes.push(...chunk.split("").map((c) => c.charCodeAt(0)));
  }

  return String.fromCharCode(...codes); // 单次内存分配
}

/**
 * 用于处理数据解码
 * @returns
 */
export default definePlugin<"decode">({
  name: "decode",
  install() {
    const { env, br } = this.global;
    const b64Wrap = (b64: string) => `data:image/png;base64,${b64}`;
    const decode = {
      toBuffer(data: Uint8Array): ArrayBuffer {
        const { buffer, byteOffset, byteLength } = data;

        return buffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer;
      },
    } as FuckSvga.Platform["decode"];

    if (env === "h5") {
      const textDecoder = new TextDecoder();

      decode.toBitmap = (data: Uint8Array) =>
        globalThis.createImageBitmap(new Blob([decode.toBuffer(data)]));
      decode.toDataURL = (data: Uint8Array) =>
        b64Wrap(globalThis.btoa(String.fromCharCode(...data)));
      decode.utf8 = (data: Uint8Array, start: number, end: number) =>
        textDecoder.decode(data.subarray(start, end));
    } else {
      decode.toDataURL = (data: Uint8Array) =>
        b64Wrap((br as any).arrayBufferToBase64(decode.toBuffer(data)));
      decode.utf8 = utf8;
    }

    return decode;
  },
});
