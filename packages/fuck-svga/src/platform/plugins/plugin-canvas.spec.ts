import { initialPlatformGlobal } from "../../__test__/initial";
import pluginCanvas from "./plugin-canvas";

describe("pluginCanvas defined", () => {
  it("should be defined", () => {
    expect(pluginCanvas).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginCanvas).toBe("object");
    expect(typeof pluginCanvas.name).toBe("string");
    expect(typeof pluginCanvas.install).toBe("function");
    expect(pluginCanvas.name).toBe("getCanvas");
  });
});

describe("pluginCanvas defined with h5", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeAll(() => {
    platform = { global: initialPlatformGlobal.h5 };
  });

  it("plugin install", () => {
    expect(typeof pluginCanvas.install.call(platform)).toBe("function");
    expect(pluginCanvas.install.call(platform).toString()).not.toEqual(
      pluginCanvas.install.call({ global: initialPlatformGlobal.weapp }).toString()
    );
  });
});

describe("pluginCanvas defined with weapp, alipay, tt", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeAll(() => {
    platform = { global: initialPlatformGlobal.weapp };
  });

  it("plugin install", () => {
    expect(typeof pluginCanvas.install.call(platform)).toBe("function");
    expect(pluginCanvas.install.call(platform).toString()).toEqual(
      pluginCanvas.install.call({ global: initialPlatformGlobal.alipay }).toString()
    );
    expect(pluginCanvas.install.call(platform).toString()).toEqual(
      pluginCanvas.install.call({ global: initialPlatformGlobal.tt }).toString()
    );
  });
});
