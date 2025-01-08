import { Video, BitmapsCache } from "../types";
declare function render(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, bitmapsCache: BitmapsCache, videoEntity: Video, currentFrame: number, start?: number, end?: number): void;
export default render;
