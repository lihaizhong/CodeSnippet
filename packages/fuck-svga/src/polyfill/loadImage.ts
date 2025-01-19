import type { PlatformImage } from "../types";
import { br } from "./bridge";
import { genFilePath, removeTmpFile, writeTmpFile } from "./fsm";
import { app, SP } from "./app";
import { toBase64, toBitmap, toBuffer } from "./decode";

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

  // FIXME: 支付宝小程序IDE保存临时文件会失败
  if (app === SP.H5 || (app === SP.ALIPAY && br.isIDE)) {
    return toBase64(data);
  }

  try {
    // FIXME: IOS设备Uint8Array转base64时间较长，使用图片缓存形式速度会更快
    return await writeTmpFile(toBuffer(data), genFilePath(filename, prefix));
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
    // 由于ImageBitmap在图片渲染上有优势，故优先使用
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
