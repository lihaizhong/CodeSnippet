import pluginIntersectionObserver from "./plugin-intersection-observer";

describe("pluginIntersectionObserver defined", () => {
  it("should be defined", () => {
    expect(pluginIntersectionObserver).toBeDefined();
  });

  it("should be a object", () => {
    expect(typeof pluginIntersectionObserver).toBe("object");
    expect(typeof pluginIntersectionObserver.name).toBe("string");
    expect(typeof pluginIntersectionObserver.install).toBe("function");
    expect(pluginIntersectionObserver.name).toBe("intersectionObserver");
  });
});
