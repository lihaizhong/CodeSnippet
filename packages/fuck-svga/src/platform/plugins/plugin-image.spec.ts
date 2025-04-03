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
  
});

describe("pluginImage defined with alipay", () => {
  
});

describe("pluginImage defined with tt", () => {
  
});

describe("pluginImage defined with weapp", () => {
  
});
