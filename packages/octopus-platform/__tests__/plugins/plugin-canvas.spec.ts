import { initialPlatformGlobal } from "../../__mocks__";
import pluginCanvas from "../../src/plugins/plugin-canvas";

describe("pluginCanvas 定义", () => {
  it("canvas 是否被定义", () => {
    expect(pluginCanvas).toBeDefined();
  });

  it("canvas 定义是否正确", () => {
    expect(typeof pluginCanvas).toBe("object");
    expect(typeof pluginCanvas.name).toBe("string");
    expect(typeof pluginCanvas.install).toBe("function");
    expect(pluginCanvas.name).toBe("getCanvas");
  });
});

describe("pluginCanvas 插件", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("H5 环境", () => {
    const mockCanvas = {
      getContext: jest.fn((_: "2d") => ({})),
      width: 0,
      height: 0,
      clientWidth: 300,
      clientHeight: 300,
    };
    const mockExceedCanvas = {
      getContext: jest.fn((_: "2d") => ({})),
      width: 0,
      height: 0,
      clientWidth: 1500,
      clientHeight: 1000,
    };

    beforeAll(() => {
      (global as any).document.querySelector = jest.fn();
    });

    it("检查插件是否正常安装", () => {
      const platform = {
        globals: initialPlatformGlobal("h5"),
        retry: (callback: () => void) => Promise.resolve(callback()),
      } as OctopusPlatform.Platform;
      const getCanvas = pluginCanvas.install.call(platform);
      const getCanvasForWeapp = pluginCanvas.install.call({
        globals: initialPlatformGlobal("weapp"),
      } as OctopusPlatform.Platform);

      expect(typeof getCanvas).toBe("function");
      expect(getCanvas.toString()).not.toEqual(getCanvasForWeapp.toString());
    });

    it("getCanvas 调用成功", () => {
      const platform = {
        globals: initialPlatformGlobal("h5"),
        retry: (callback: () => void) => Promise.resolve(callback()),
      } as OctopusPlatform.Platform;
      const getCanvas = pluginCanvas.install.call(platform);

      // @ts-ignore
      document.querySelector.mockReturnValue(mockCanvas);
      expect(getCanvas("#container")).resolves.toEqual({
        canvas: mockCanvas,
        context: mockCanvas.getContext("2d"),
      });
    });

    it("getCanvas 调用失败", async () => {
      const platform = {
        globals: initialPlatformGlobal("h5"),
        retry: (callback: () => void) => Promise.reject(callback()),
      } as OctopusPlatform.Platform;
      const getCanvas = pluginCanvas.install.call(platform);

      // @ts-ignore
      document.querySelector.mockReturnValue(null);

      try {
        await getCanvas("#noContainer");
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe("canvas not found.");
      }
    });

    it("canvas 尺寸", async () => {
      const platform = {
        globals: initialPlatformGlobal("h5"),
        retry: (callback: () => void) => Promise.resolve(callback()),
      } as OctopusPlatform.Platform;
      const getCanvas = pluginCanvas.install.call(platform);

      // @ts-ignore
      document.querySelector.mockReturnValue(mockCanvas);

      const { canvas } = await getCanvas("#container");

      expect(canvas.width).toBe(platform.globals.dpr * mockCanvas.clientWidth);
      expect(canvas.height).toBe(platform.globals.dpr * mockCanvas.clientHeight);
    });

    it("canvas 尺寸超出限制：常规", async () => {
      const platform = {
        globals: initialPlatformGlobal("h5"),
        retry: (callback: () => void) => Promise.resolve(callback()),
      } as OctopusPlatform.Platform;
      const getCanvas = pluginCanvas.install.call(platform);

      // @ts-ignore
      document.querySelector.mockReturnValue(mockExceedCanvas);

      const { canvas } = await getCanvas("#container");

      expect(canvas.width).toBe(platform.globals.dpr * mockExceedCanvas.clientWidth);
      expect(canvas.height).toBe(platform.globals.dpr * mockExceedCanvas.clientHeight);
    })
  });

  describe("小程序(weapp, alipay, tt) 环境", () => {
    const mockNode = {
      getContext: jest.fn((_: "2d") => ({})),
      width: 0,
      height: 0,
    };
    const mockResult = {
      node: mockNode,
      width: 300,
      height: 300,
    };
    const mockExceedResult = {
      node: mockNode,
      width: 1500,
      height: 1000,
    };
    const mockExceedResult2 = {
      node: mockNode,
      width: 1000,
      height: 1500,
    }

    it("检查插件安装是否正常安装", () => {
      const platform = {
        globals: initialPlatformGlobal("weapp"),
        retry: (callback: () => void) => Promise.resolve(callback()),
      } as OctopusPlatform.Platform;
      const getCanvas = pluginCanvas.install.call(platform);
      const getCanvasForH5 = pluginCanvas.install.call({
        globals: initialPlatformGlobal("h5"),
      } as OctopusPlatform.Platform);
      const getCanvasForAlipay = pluginCanvas.install.call({
        globals: initialPlatformGlobal("alipay"),
      } as OctopusPlatform.Platform);
      const getCanvasForTT = pluginCanvas.install.call({
        globals: initialPlatformGlobal("tt"),
      } as OctopusPlatform.Platform);

      expect(typeof getCanvas).toBe("function");
      expect(getCanvas.toString()).not.toEqual(getCanvasForH5.toString());
      expect(getCanvas.toString()).toEqual(getCanvasForAlipay.toString());
      expect(getCanvas.toString()).toEqual(getCanvasForTT.toString());
    });

    it("getCanvas 调用成功", () => {
      const platform = {
        globals: initialPlatformGlobal("weapp"),
        retry: (callback: () => void) => Promise.resolve(callback()),
      } as OctopusPlatform.Platform;
      const getCanvas = pluginCanvas.install.call(platform);

      // @ts-ignore
      platform.globals.br.createSelectorQuery.mockImplementation(() => ({
        in: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        fields: jest.fn((_, callback) => {
          callback(mockResult);

          return { exec: jest.fn() };
        }),
        exec: jest.fn(),
      }));
      expect(getCanvas("#container")).resolves.toEqual({
        canvas: mockNode,
        context: mockNode.getContext("2d"),
      });
    });

    it("getCanvas 调用失败", () => {
      const platform = {
        globals: initialPlatformGlobal("weapp"),
        retry: (callback: () => void) => Promise.resolve(callback()),
      } as OctopusPlatform.Platform;
      const getCanvas = pluginCanvas.install.call(platform);

      // @ts-ignore
      platform.globals.br.createSelectorQuery.mockImplementation(() => ({
        in: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        fields: jest.fn((_, callback) => {
          callback(null);

          return { exec: jest.fn() };
        }),
        exec: jest.fn(),
      }));
      expect(getCanvas("#noContainer")).rejects.toThrow("canvas not found.");
    });

    it("canvas 尺寸", async () => {
      const platform = {
        globals: initialPlatformGlobal("weapp"),
        retry: (callback: () => void) => Promise.resolve(callback()),
      } as OctopusPlatform.Platform;
      const getCanvas = pluginCanvas.install.call(platform);

      // @ts-ignore
      platform.globals.br.createSelectorQuery.mockImplementation(() => ({
        in: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        fields: jest.fn((_, callback) => {
          callback(mockResult);

          return { exec: jest.fn() };
        }),
        exec: jest.fn(),
      }));

      const { canvas } = await getCanvas("#container");

      expect(canvas.width).toBe(600);
      expect(canvas.height).toBe(600);
    });

    describe("小程序 canvas 尺寸超出: 微信下程序最大不能超过 1365 * 1365", () => {
      it("微信小程序 canvas 尺寸超出: 宽度 > 高度", async () => {
        const platform = {
          globals: initialPlatformGlobal("weapp"),
          retry: (callback: () => void) => Promise.resolve(callback()),
        } as OctopusPlatform.Platform;
        const getCanvas = pluginCanvas.install.call(platform);
        const MAX_SIZE = 1365;
  
        // @ts-ignore
        platform.globals.br.createSelectorQuery.mockImplementation(() => ({
          in: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          fields: jest.fn((_, callback) => {
            callback(mockExceedResult);
  
            return { exec: jest.fn() };
          }),
          exec: jest.fn(),
        }));
  
        const { canvas } = await getCanvas("#container");
  
        expect(canvas.width).toBe(MAX_SIZE);
        expect(canvas.height).toBe((mockExceedResult.height / mockExceedResult.width) * MAX_SIZE);
      });

      it("微信小程序 canvas 尺寸超出: 高度 > 宽度", async () => {
        const platform = {
          globals: initialPlatformGlobal("weapp"),
          retry: (callback: () => void) => Promise.resolve(callback()),
        } as OctopusPlatform.Platform;
        const getCanvas = pluginCanvas.install.call(platform);
        const MAX_SIZE = 1365;
  
        // @ts-ignore
        platform.globals.br.createSelectorQuery.mockImplementation(() => ({
          in: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          fields: jest.fn((_, callback) => {
            callback(mockExceedResult2);
  
            return { exec: jest.fn() };
          }),
          exec: jest.fn(),
        }));
  
        const { canvas } = await getCanvas("#container");
  
        expect(canvas.width).toBe((mockExceedResult2.width / mockExceedResult2.height) * MAX_SIZE);
        expect(canvas.height).toBe(MAX_SIZE);
      });
  
      it("支付宝小程序 canvas 尺寸超出：常规", async () => {
        const platform = {
          globals: initialPlatformGlobal("alipay"),
          retry: (callback: () => void) => Promise.resolve(callback()),
        } as OctopusPlatform.Platform;
        const getCanvas = pluginCanvas.install.call(platform);
  
        // @ts-ignore
        platform.globals.br.createSelectorQuery.mockImplementation(() => ({
          in: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          fields: jest.fn((_, callback) => {
            callback(mockExceedResult);
  
            return { exec: jest.fn() };
          }),
          exec: jest.fn(),
        }));
  
        const { canvas } = await getCanvas("#container");
  
        expect(canvas.width).toBe(platform.globals.dpr * mockExceedResult.width);
        expect(canvas.height).toBe(platform.globals.dpr * mockExceedResult.height);
      });
  
      it("抖音小程序 canvas 尺寸超出：常规", async () => {
        const platform = {
          globals: initialPlatformGlobal("tt"),
          retry: (callback: () => void) => Promise.resolve(callback()),
        } as OctopusPlatform.Platform;
        const getCanvas = pluginCanvas.install.call(platform);
  
        // @ts-ignore
        platform.globals.br.createSelectorQuery.mockImplementation(() => ({
          in: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          fields: jest.fn((_, callback) => {
            callback(mockExceedResult);
  
            return { exec: jest.fn() };
          }),
          exec: jest.fn(),
        }));
  
        const { canvas } = await getCanvas("#container");
  
        expect(canvas.width).toBe(platform.globals.dpr * mockExceedResult.width);
        expect(canvas.height).toBe(platform.globals.dpr * mockExceedResult.height);
      });
    });
  });
});
