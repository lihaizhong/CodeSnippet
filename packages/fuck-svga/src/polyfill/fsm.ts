import { br } from "./bridge";
import { app, SP } from "./app";
import benchmark from "../test/benchmark";

const { USER_DATA_PATH } =
  app === SP.H5
    ? {}
    : app === SP.DOUYIN
    ? // @ts-ignore
      tt.getEnvInfoSync().common
    : br.env;

export function genFilePath(filename: string, prefix?: string) {
  return `${USER_DATA_PATH}/${prefix ? `${prefix}.` : ""}${filename}`;
}

/**
 * 写入本地文件
 * @param data 文件内容
 * @param filePath 文件路径
 * @returns
 */
export function writeTmpFile(
  data: ArrayBuffer,
  filePath: string
): Promise<string> {
  const fs = br.getFileSystemManager();

  benchmark.log(`write file: ${filePath}`);
  return new Promise<string>((resolve, reject) => {
    fs.access({
      path: filePath,
      success() {
        resolve(filePath);
      },
      fail() {
        fs.writeFile({
          filePath,
          data,
          success() {
            resolve(filePath);
          },
          fail(err: any) {
            benchmark.log(`write fail: ${filePath}`, err);
            reject(err);
          },
        });
      },
    });
  });
}

/**
 * 移除本地文件
 * @param filePath 文件资源地址
 * @returns
 */
export function removeTmpFile(filePath: string): Promise<void> {
  const fs = br.getFileSystemManager();

  return new Promise((resolve) => {
    fs.access({
      path: filePath,
      success() {
        benchmark.log(`remove file: ${filePath}`);
        fs.unlink({
          filePath,
          success: resolve,
          fail(err: any) {
            benchmark.log(`remove fail: ${filePath}`, err);
            resolve();
          },
        });
      },
      fail(err: any) {
        benchmark.log(`access fail: ${filePath}`, err);
        resolve();
      },
    });
  });
}

/**
 * 读取本地文件
 * @param filePath 文件资源地址
 * @returns
 */
export function readFile(filePath: string): Promise<ArrayBuffer> {
  const fs = br.getFileSystemManager();

  return new Promise((resolve, reject) => {
    fs.access({
      path: filePath,
      success() {
        fs.readFile({
          filePath,
          success: (res: any) => resolve(res.data as ArrayBuffer),
          fail: reject,
        });
      },
      fail: reject,
    });
  });
}
