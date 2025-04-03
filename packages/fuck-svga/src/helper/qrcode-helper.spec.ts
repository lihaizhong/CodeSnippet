import { createQRCodeToPNG } from "./qrcode-helper";

describe("qrcode-helper", () => {
  it("should be defined", () => {
    expect(createQRCodeToPNG).toBeDefined();
  });
});
