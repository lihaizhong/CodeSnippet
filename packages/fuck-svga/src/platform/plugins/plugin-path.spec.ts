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

describe("pluginPath defined with h5", () => {});

describe("pluginPath defined with weapp, alipay, tt", () => {});
