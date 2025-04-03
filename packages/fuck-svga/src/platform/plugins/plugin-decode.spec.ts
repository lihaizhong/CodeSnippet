import pluginDecode from "./plugin-decode";

describe("pluginDecode defined", () => {
  it("should be defined", () => {
    expect(pluginDecode).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginDecode).toBe("object");
    expect(typeof pluginDecode.name).toBe("string");
    expect(typeof pluginDecode.install).toBe("function");
    expect(pluginDecode.name).toBe("decode");
  });
});

describe("pluginDecode defined with h5", () => {
  
});

describe("pluginDecode defined with alipay", () => {
  
});

describe("pluginDecode defined with tt", () => {
  
});

describe("pluginDecode defined with weapp", () => {
  
});
