import { Video, Bitmap } from "../types";
declare function render(context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, materials: Map<string, Bitmap>, videoEntity: Video, currentFrame: number, head: number, tail: number): void;
export default render;
