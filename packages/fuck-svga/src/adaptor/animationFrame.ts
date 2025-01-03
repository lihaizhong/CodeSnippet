import { PlatformCanvas, PlatformOffscreenCanvas } from "../types";
import {
  platform,
  SP,
  throwUnsupportedPlatform,
} from "./platform";

export function startAnimationFrame(
  canvas: PlatformCanvas,
  callback: () => void
): number {
  if (platform === SP.H5) {
    return requestAnimationFrame(callback);
  }

  if (platform !== SP.UNKNOWN) {
    return (canvas as WechatMiniprogram.Canvas).requestAnimationFrame(callback);
  }

  throw throwUnsupportedPlatform();
}
