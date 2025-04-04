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

describe("pluginNow defined with h5", () => {});

describe("pluginNow defined with weapp, alipay", () => {});

describe("pluginNow defined with tt", () => {});
