import { initialPlatformGlobal } from "../../__test__/initial";
import pluginPath from "./plugin-path";

describe("pluginPath defined", () => {
  it("should be defined", () => {
    expect(pluginPath).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginPath).toBe("object");
    expect(typeof pluginPath.name).toBe("string");
    expect(typeof pluginPath.install).toBe("function");
    expect(pluginPath.name).toBe("path");
  });
});

describe("pluginPath defined with h5", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.h5 };
  })

  it("plugin install", () => {
    expect(typeof pluginPath.install.call(platform)).toBe("object");
  })
});

describe("pluginPath defined with weapp, alipay, tt", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.weapp };
  });

  it("plugin install", () => {
    expect(typeof pluginPath.install.call(platform)).toBe("object");
  });
});

describe("pluginPath defined with tt", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.tt };
  });

  it("plugin install", () => {
    expect(typeof pluginPath.install.call(platform)).toBe("object");
  });
});
