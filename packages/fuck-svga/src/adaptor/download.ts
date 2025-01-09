import bridge from "./bridge";
import { platform, SP } from "./platform";

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
  return new Promise((resolve, reject) => {
    bridge.request({
      url,
      // @ts-ignore 支付宝小程序必须有该字段
      dataType: "arraybuffer",
      responseType: "arraybuffer",
      enableCache: true,
      success(res: any) {
        resolve(res.data as ArrayBuffer);
      },
      fail: reject,
    });
  });
}

/**
 * 读取本地文件
 * @param url 文件资源地址
 * @returns
 */
function readLocalFile(url: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    bridge.getFileSystemManager().readFile({
      filePath: url,
      success: (res: any) => resolve(res.data as ArrayBuffer),
      fail: reject,
    });
  });
}

/**
 * 读取文件资源
 * @param url 文件资源地址
 * @returns
 */
export default function download(url: string): Promise<ArrayBuffer | null> {
  // 读取远程文件
  if (/^http(s):\/\//.test(url)) {
    return readRemoteFile(url);
  }

  // 读取本地文件
  if (platform !== SP.H5) {
    return readLocalFile(url);
  }

  return Promise.resolve(null);
}
