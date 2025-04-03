declare namespace FuckSvga {
  export type SupportedPlatform = "weapp" | "alipay" | "tt" | "h5" | "unknown";

  export interface PlatformGlobal {
    env: SupportedPlatform;
    br: any;
    fsm: any;
    dpr: number;
    isPerf: boolean;
    sys: string;
  }

  export type PlatformProperties =
    | "now"
    | "path"
    | "remote"
    | "local"
    | "decode"
    | "image"
    | "intersectionObserver"
    | "rAF"
    | "getCanvas"
    | "getOfsCanvas";

  export interface PlatformPlugin<T> {
    name: T;
    install(this: IPlatform): IPlatform[T] | void;
  }

  export type PlatformCreateImageInstance = { createImage: () => PlatformImage };

  export interface Platform {
    global: PlatformGlobal;

    noop: () => any;

    now: () => number;

    remote: {
      is: (url: string) => boolean;
      read: (url: string) => Promise<ArrayBuffer>;
    };

    path: {
      USER_DATA_PATH: string;
      filename: (path: string) => string;
      resolve: (name: string, prefix?: string) => string;
    };

    local: {
      write: (data: ArrayBuffer, path: string) => Promise<string>;
      read: (path: string) => Promise<ArrayBuffer>;
      remove: (path: string) => Promise<string>;
    };

    decode: {
      toBitmap?: (data: Uint8Array) => Promise<ImageBitmap>;
      toDataURL: (data: Uint8Array) => string;
      toBuffer: (data: Uint8Array) => ArrayBuffer;
      utf8: (data: Uint8Array, start: number, end: number) => string;
    };

    image: {
      isImage: (data: unknown) => boolean;
      isImageBitmap: (data: unknown) => boolean;
      create: (brush: PlatformCreateImageInstance) => PlatformImage;
      load: (
        brush: PlatformCreateImageInstance,
        data: ImageBitmap | Uint8Array | string,
        filename: string,
        prefix?: string
      ) => Promise<ImageBitmap | PlatformImage>;
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
}
