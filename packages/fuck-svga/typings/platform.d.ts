enum SupportedPlatform {
  WECHAT = "weapp",
  ALIPAY = "alipay",
  DOUYIN = "tt",
  H5 = "h5",
  UNKNOWN = "unknown",
}

interface PlatformGlobal {
  env: SupportedPlatform;
  br: any;
  fsm: any;
  dpr: number;
  sys: string;
}

interface IPlatform {
  global: PlatformGlobal;

  noop: () => any;

  now: () => number;

  remote: {
    is: () => boolean;
    read: () => Promise<ArrayBuffer>;
  };

  local: {
    write: () => Promise<void>;
    read: () => Promise<ArrayBuffer>;
    remove: () => Promise<void>;
  };

  decode: {
    toBitmap: () => Promise<ImageBitmap>;
    toBase64: () => Promise<string>;
  };

  image: {
    create: () => Promise<PlatformImage>;
    load: () => Promise<void>;
    isImage: () => boolean;
    isImageBitmap: () => boolean;
  };

  rAF: (canvas: WechatMiniprogram.Canvas, callback: () => void) => void;

  getCanvas: (
    selector: string,
    component?: WechatMiniprogram.Component.TrivialInstance | null
  ) => Promise<IGetCanvasResult>;

  getOfsCanvas: (
    options: WechatMiniprogram.CreateOffscreenCanvasOption
  ) => IGetOffscreenCanvasResult;

  switch: (env: SupportedPlatform) => void;
}
