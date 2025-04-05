import { initialPlatformGlobal } from "../../__test__/initial";
import pluginNow from "./plugin-now";

jest.useFakeTimers();

describe("pluginNow defined", () => {
  it("should be defined", () => {
    expect(pluginNow).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginNow).toBe("object");
    expect(typeof pluginNow.name).toBe("string");
    expect(typeof pluginNow.install).toBe("function");
    expect(pluginNow.name).toBe("now");
  });
});

describe("pluginNow defined with h5", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.h5 };
  });

  it("plugin install", () => {
    expect(typeof pluginNow.install.call(platform)).toBe("function");
  });
});

describe("pluginNow defined with weapp, alipay", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.weapp };
  });

  it("plugin install", () => {
    expect(typeof pluginNow.install.call(platform)).toBe("function");
  });
});

describe("pluginNow defined with tt", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.tt };
  });

  it("plugin install", () => {
    expect(typeof pluginNow.install.call(platform)).toBe("function");
  });
});
