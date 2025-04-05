import { initialPlatformGlobal } from "../../__test__/initial";
import pluginImage from "./plugin-image";

describe("pluginImage defined", () => {
  it("should be defined", () => {
    expect(pluginImage).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginImage).toBe("object");
    expect(typeof pluginImage.name).toBe("string");
    expect(typeof pluginImage.install).toBe("function");
    expect(pluginImage.name).toBe("image");
  });
});

describe("pluginImage defined with h5", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.h5 };
  });

  it("plugin install", () => {
    expect(typeof pluginImage.install.call(platform)).toBe("object");
  });
});

describe("pluginImage defined with weapp, alipay, tt", () => {
  let platform: Record<"global", FuckSvga.PlatformGlobal>;

  beforeEach(() => {
    platform = { global: initialPlatformGlobal.weapp };
  });

  it("plugin install", () => {
    expect(typeof pluginImage.install.call(platform)).toBe("object");
  });
});
