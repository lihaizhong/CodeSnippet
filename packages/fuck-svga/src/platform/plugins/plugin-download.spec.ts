import { initialPlatformGlobal } from "../../__test__/initial";
import pluginDownload from "./plugin-download";

describe("pluginDownload defined", () => {
  it("should be defined", () => {
    expect(pluginDownload).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginDownload).toBe("object");
    expect(typeof pluginDownload.name).toBe("string");
    expect(typeof pluginDownload.install).toBe("function");
    expect(pluginDownload.name).toBe("remote");
  });
});

describe("pluginDownload defined with h5", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.h5 };
  });

  it("plugin install", () => {
    expect(typeof pluginDownload.install.call(platform)).toBe("object");
  });
});

describe("pluginDownload defined with weapp, alipay, tt", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.weapp };
  });

  it("plugin install", () => {
    expect(typeof pluginDownload.install.call(platform)).toBe("object");
  });
});
