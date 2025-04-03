import { mbtoa, matob } from ".";

describe("decode defined", () => {
  it("should be defined", () => {
    expect(mbtoa).toBeDefined();
    expect(matob).toBeDefined();
  });
});
