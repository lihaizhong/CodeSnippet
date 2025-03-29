const useNow = () => {
  // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
  if (typeof performance !== "undefined") {
    return () => performance.now();
  }

  return () => Date.now();
};

export const noop: () => any = () => {};

export class Platform implements SVGAPlatform {
  private plugins: (() => void)[] = [];

  public global: SVGAPlatformGlobal = {
    env: SupportedEnv.UNKNOWN,
    br: null,
    fsm: null,
    dpr: 1,
    sys: "UNKNOWN",
  };

  public noop = noop;

  public now = useNow();

  public local = {} as SVGAPlatform["local"];

  public remote = {} as SVGAPlatform["remote"];

  public decode = {} as SVGAPlatform["decode"];

  public image = {} as SVGAPlatform["image"];

  public rAF = noop as SVGAPlatform["rAF"];

  public getCanvas = noop as SVGAPlatform["getCanvas"];

  public getOfsCanvas = noop as SVGAPlatform["getOfsCanvas"];

  constructor() {
    this.global.env = this.autoEnv();
    this.init();
  }

  private init() {
    this.global.br = this.useBridge();
    this.global.dpr = this.usePixelRatio();
    this.global.fsm = this.useFileSystemManager();
    this.global.sys = this.useSystem().toLocaleLowerCase();
    this.usePlugins();
  }

  private autoEnv() {
    // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
    if (typeof window !== "undefined") {
      return SupportedEnv.H5;
    }

    if (typeof tt !== "undefined") {
      return SupportedEnv.DOUYIN;
    }

    if (typeof my !== "undefined") {
      return SupportedEnv.ALIPAY;
    }

    if (typeof wx !== "undefined") {
      return SupportedEnv.WECHAT;
    }

    throw new Error("Unsupported app");
  }

  private useBridge() {
    switch (this.global.env) {
      case SupportedEnv.H5:
        return globalThis;
      case SupportedEnv.ALIPAY:
        return my;
      case SupportedEnv.DOUYIN:
        return tt;
      case SupportedEnv.WECHAT:
        return wx;
      default:
    }

    return {};
  }

  private usePixelRatio() {
    const { env, br } = this.global;

    if (env === SupportedEnv.H5) {
      return globalThis.devicePixelRatio;
    }

    if ("getWindowInfo" in br) {
      return (br as any).getWindowInfo().pixelRatio;
    }

    if ("getSystemInfoSync" in br) {
      return (br as WechatMiniprogram.Wx).getSystemInfoSync().pixelRatio;
    }

    return 1;
  }

  private useFileSystemManager() {
    const { br } = this.global;

    if ("getFileSystemManager" in br) {
      return (br as WechatMiniprogram.Wx).getFileSystemManager();
    }

    return null;
  }

  private useSystem() {
    const { env, br } = this.global;

    if (env === SupportedEnv.H5) {
      const UA = navigator.userAgent;

      if (/(Android)/i.test(UA)) {
        return "Android";
      }

      if (/(iPhone|iPad|iPod|iOS)/i.test(UA)) {
        return "iOS";
      }

      if (/(OpenHarmony|ArkWeb)/i.test(UA)) {
        return "OpenHarmony";
      }
    } else {
      if (env === SupportedEnv.ALIPAY) {
        return (br as any).getDeviceBaseInfo().platform as string;
      }

      if (env === SupportedEnv.DOUYIN) {
        return (br as any).getDeviceInfoSync().platform as string;
      }

      if (env === SupportedEnv.WECHAT) {
        return (br as any).getDeviceInfo().platform as string;
      }
    }

    return "UNKNOWN";
  }

  private usePlugins() {
    this.plugins.forEach((plugin) => {
      plugin.call(this);
    });
  }

  public switch(env: SupportedEnv) {
    this.global.env = env;
    this.init();
  }
}
