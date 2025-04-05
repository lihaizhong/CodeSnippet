import { FileSystemManager, SelectorQuery, mbtoa } from "../polyfill";

const bridge = {
  createSelectorQuery: () => new SelectorQuery(),
  arrayBufferToBase64: (buff: ArrayBuffer) =>
    mbtoa(String.fromCharCode(...new Uint8Array(buff))),
  request: (options: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          data: new ArrayBuffer(1024),
        });
      }, 1000);
    });
  },
  getFileSystemManager: () => new FileSystemManager(),
  getPerformance: () => performance,
};
const fsm = new FileSystemManager();
const getWindowInfo = () => ({
  pixelRatio: 2,
});
const getDeviceInfo = () => ({ platform: "ios" });

export const initialPlatformGlobal: Record<
  FuckSvga.SupportedPlatform,
  FuckSvga.Platform["global"]
> = {
  weapp: {
    env: "weapp",
    br: {
      ...bridge,
      env: {
        USER_DATA_PATH: "/data/user/0",
      },
      getWindowInfo,
      getDeviceInfo,
    },
    fsm,
    dpr: 2,
    isPerf: true,
    sys: "ios",
  },
  alipay: {
    env: "alipay",
    br: {
      ...bridge,
      isIDE: false,
      env: {
        USER_DATA_PATH: "/data/user/0",
      },
      getWindowInfo,
      getDeviceBaseInfo: getDeviceInfo,
    },
    fsm,
    dpr: 2,
    isPerf: true,
    sys: "ios",
  },
  tt: {
    env: "tt",
    br: {
      ...bridge,
      getSystemInfoSync: getWindowInfo,
      getDeviceInfoSync: getDeviceInfo,
      getEnvInfoSync: () => ({
        common: {
          USER_DATA_PATH: "/data/user/0",
        },
      }),
      getPerformance: () =>
        new Proxy(performance, {
          get(target, prop, receiver) {
            if (prop === "now") {
              return undefined;
            }

            return Reflect.get(target, prop, receiver);
          },
        }),
    },
    fsm,
    dpr: 2,
    isPerf: false,
    sys: "ios",
  },
  h5: {
    env: "h5",
    br: globalThis,
    fsm: null,
    dpr: 2,
    isPerf: true,
    sys: "ios",
  },
  unknown: {
    env: "unknown",
    br: null,
    fsm: null,
    dpr: 1,
    isPerf: false,
    sys: "ios",
  },
};
