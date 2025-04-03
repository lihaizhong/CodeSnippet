import pluginRaf from "./plugin-raf";

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

});

describe("pluginRaf defined with alipay", () => {
  
});

describe("pluginRaf defined with tt", () => {
  
});

describe("pluginRaf defined with weapp", () => {
  
});
