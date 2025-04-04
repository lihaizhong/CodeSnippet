import pluginFsm from "./plugin-fsm";

describe("pluginFsm defined", () => {
  it("should be defined", () => {
    expect(pluginFsm).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginFsm).toBe("object");
    expect(typeof pluginFsm.name).toBe("string");
    expect(typeof pluginFsm.install).toBe("function");
    expect(pluginFsm.name).toBe("local");
  });
});

describe("pluginFsm defined with h5", () => {
  
});

describe("pluginFsm defined with weapp, alipay, tt", () => {
  
});
