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
  
});

describe("pluginCanvas defined with alipay", () => {
  
});

describe("pluginCanvas defined with tt", () => {
  
});

describe("pluginCanvas defined with weapp", () => {
  
});
