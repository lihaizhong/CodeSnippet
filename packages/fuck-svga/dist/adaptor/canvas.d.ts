import type { PlatformCanvas, PlatformOffscreenCanvas } from "../types";
export declare function createOffscreenCanvas(options: WechatMiniprogram.CreateOffscreenCanvasOption): PlatformOffscreenCanvas;
export interface IGetCanvasResult {
    canvas: PlatformCanvas;
    ctx: CanvasRenderingContext2D;
}
export declare function getCanvas(selector: string, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<IGetCanvasResult>;
