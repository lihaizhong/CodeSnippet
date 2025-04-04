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
  
});

describe("pluginDownload defined with weapp, alipay, tt", () => {
  
});
