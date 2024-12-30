import { DynamicElements, Video, BitmapsCache, ReplaceElements, PlatformOffscreenCanvas } from "../types";
declare function render(canvas: PlatformOffscreenCanvas, bitmapsCache: BitmapsCache, dynamicElements: DynamicElements, replaceElements: ReplaceElements, videoEntity: Video, currentFrame: number): ImageData;
export default render;
