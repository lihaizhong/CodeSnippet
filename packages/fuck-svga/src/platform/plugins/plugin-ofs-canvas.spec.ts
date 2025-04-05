import { initialPlatformGlobal } from "../../__test__/initial";
import pluginOfsCanvas from "./plugin-ofs-canvas";

describe("pluginOfsCanvas defined", () => {
  it("should be defined", () => {
    expect(pluginOfsCanvas).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginOfsCanvas).toBe("object");
    expect(typeof pluginOfsCanvas.name).toBe("string");
    expect(typeof pluginOfsCanvas.install).toBe("function");
    expect(pluginOfsCanvas.name).toBe("getOfsCanvas");
  });
});

describe("pluginOfsCanvas defined with h5", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.h5 };
  });

  it("plugin install", () => {
    expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
  });
});

describe("pluginOfsCanvas defined with weapp", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.weapp };
  });

  it("plugin install", () => {
    expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
  });
});

describe("pluginOfsCanvas defined with alipay", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.alipay };
  });

  it("plugin install", () => {
    expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
  });
});

describe("pluginOfsCanvas defined with tt", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.tt };
  });

  it("plugin install", () => {
    expect(typeof pluginOfsCanvas.install.call(platform)).toBe("function");
  });
});
