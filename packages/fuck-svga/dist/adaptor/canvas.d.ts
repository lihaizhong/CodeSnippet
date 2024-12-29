import type { PlatformOffscreenCanvas } from "../types";
export declare function createOffscreenCanvas(options: WechatMiniprogram.CreateOffscreenCanvasOption): PlatformOffscreenCanvas;
export interface IGetCanvasResult {
    canvas: WechatMiniprogram.Canvas | HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
}
export declare function getCanvas(selector: string, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<IGetCanvasResult>;
