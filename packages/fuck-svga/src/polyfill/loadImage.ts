import type { PlatformImage } from "../types";
import { br } from "./bridge";
import { genFilePath, removeTmpFile, writeTmpFile } from "./fs";
import { app, SP } from "./app";
import Brush from "player/brush";

/**
 * 将ArrayBuffer转为base64
 * @param data 二进制数据
 * @returns
 */
function toBase64(data: Uint8Array): string {
  const ab = createArrayBuffer(data);
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
function toBitmap(data: Uint8Array): Promise<ImageBitmap> {
  return createImageBitmap(new Blob([createArrayBuffer(data)]));
}

/**
 * Uint8Array转换成ArrayBuffer
 * @param data
 * @returns
 */
function createArrayBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  ) as ArrayBuffer;
}

/**
 * 创建图片src元信息
 * @param data
 * @returns
 */
async function genImageSource(
  data: Uint8Array | string,
  filename: string,
  prefix?: string
): Promise<string> {
  if (typeof data === "string") {
    return data;
  }

  if (app === SP.H5 || (app === SP.ALIPAY && br.isIDE)) {
    return toBase64(data);
  }

  try {
    return await writeTmpFile(
      createArrayBuffer(data),
      genFilePath(filename, prefix)
    );
  } catch (ex) {
    console.error(ex);
    return toBase64(data);
  }
}

/**
 * 加载图片
 * @param canvas 画布对象
 * @param data 图片数据
 * @returns
 */
export function loadImage(
  brush: { createImage: () => PlatformImage },
  data: ImageBitmap | Uint8Array | string,
  filename: string,
  prefix?: string
): Promise<PlatformImage | ImageBitmap> {
  if (app === SP.H5) {
    if (data instanceof Uint8Array && "createImageBitmap" in window) {
      return toBitmap(data);
    }

    if (data instanceof ImageBitmap) {
      return Promise.resolve(data);
    }
  }

  return new Promise((resolve, reject) => {
    const img = brush.createImage();

    img.onload = () => {
      // 如果 data 是 URL/base64 或者 img.src 是 base64
      if (img.src.startsWith("data:") || typeof data === "string") {
        resolve(img);
      } else {
        removeTmpFile(img.src).then(() => resolve(img));
      }
    };
    img.onerror = () => reject(new Error(`SVGA LOADING FAILURE: ${img.src}`));

    genImageSource(data as Uint8Array | string, filename, prefix).then(
      (src) => (img.src = src)
    );
  });
}