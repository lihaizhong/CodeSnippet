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
  
});

describe("pluginOfsCanvas defined with alipay", () => {
  
});

describe("pluginOfsCanvas defined with tt", () => {
  
});

describe("pluginOfsCanvas defined with weapp", () => {
  
});
