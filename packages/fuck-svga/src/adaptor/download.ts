import { getBridge } from "./bridge";
import {
  platform,
  SP,
  throwUnsupportedPlatform,
} from "./platform";

/**
 * 读取远程文件
 * @param url 文件资源地址
 * @returns
 */
function readRemoteFile(url: string): Promise<ArrayBuffer> {
  // H5环境
  if (platform === SP.H5) {
    return fetch(url, {
      cache: "no-cache",
    }).then((response) => {
      if (response.ok) {
        return response.arrayBuffer();
      } else {
        throw new Error(
          `HTTP error, status=${response.status}, statusText=${response.statusText}`
        );
      }
    });
  }

  // 小程序环境
  if (platform !== SP.UNKNOWN) {
    const bridge = getBridge() as WechatMiniprogram.Wx;

    return new Promise((resolve, reject) => {
      bridge.request({
        url,
        responseType: "arraybuffer",
        enableCache: true,
        success(res) {
          resolve(res.data as ArrayBuffer);
        },
        fail: reject,
      });
    });
  }

  return Promise.reject(throwUnsupportedPlatform());
}

/**
 * 读取本地文件
 * @param url 文件资源地址
 * @returns
 */
function readLocalFile(url: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const bridge = getBridge() as WechatMiniprogram.Wx;

    bridge.getFileSystemManager().readFile({
      filePath: url,
      success: (res) => resolve(res.data as ArrayBuffer),
      fail: reject,
    });
  });
}

/**
 * 读取文件资源
 * @param url 文件资源地址
 * @returns
 */
export default function download(url: string): Promise<ArrayBuffer> {
  // 读取远程文件
  if (/^http(s):\/\//.test(url)) {
    return readRemoteFile(url);
  }

  // 读取本地文件
  if (platform !== SP.H5) {
    return readLocalFile(url);
  }

  return Promise.reject(throwUnsupportedPlatform());
}
