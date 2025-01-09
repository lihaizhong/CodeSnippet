import { PlatformCanvas } from "../types";
import { platform, SP } from "./platform";

export function startAnimationFrame(
  canvas: PlatformCanvas,
  callback: () => void
): number {
  if (platform === SP.H5) {
    return requestAnimationFrame(callback);
  }

  return (canvas as WechatMiniprogram.Canvas).requestAnimationFrame(callback);
}
