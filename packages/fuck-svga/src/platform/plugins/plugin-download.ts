import { definePlugin } from "../definePlugin";

/**
 * 用于处理远程文件读取
 * @returns
 */
export default definePlugin<"remote">({
  name: "remote",
  install() {
    const { env, br } = this.global;
    const isRemote = (url: string) => /^http(s)?:\/\//.test(url);

    if (env === "h5") {
      return {
        is: isRemote,
        read: (url: string) =>
          fetch(url).then((response) => {
            if (response.ok) {
              return response.arrayBuffer();
            }

            throw new Error(
              `HTTP error, status=${response.status}, statusText=${response.statusText}`
            );
          }),
      };
    }

    return {
      is: isRemote,
      read: (url: string) =>
        new Promise((resolve, reject) => {
          (br as WechatMiniprogram.Wx).request({
            url,
            // @ts-ignore 支付宝小程序必须有该字段
            dataType: "arraybuffer",
            responseType: "arraybuffer",
            enableCache: true,
            success: (res: any) => resolve(res.data as ArrayBuffer),
            fail: reject,
          });
        }),
    };
  },
});
