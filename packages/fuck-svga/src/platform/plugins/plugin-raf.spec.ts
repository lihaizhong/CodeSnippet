import { initialPlatformGlobal } from "../../__test__/initial";
import pluginRaf from "./plugin-raf";

jest.useFakeTimers();

describe("pluginRaf defined", () => {
  it("should be defined", () => {
    expect(pluginRaf).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginRaf).toBe("object");
    expect(typeof pluginRaf.name).toBe("string");
    expect(typeof pluginRaf.install).toBe("function");
    expect(pluginRaf.name).toBe("rAF");
  });
});

describe("pluginRaf defined with h5", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.h5 };
  });

  it("plugin install", () => {
    expect(typeof pluginRaf.install.call(platform)).toBe("function");
  });
});

describe("pluginRaf defined with weapp, alipay, tt", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.weapp };
  });

  it("plugin install", () => {
    expect(typeof pluginRaf.install.call(platform)).toBe("function");
  });
});
