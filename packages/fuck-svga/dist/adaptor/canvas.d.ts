import type { PlatformCanvas, PlatformOffscreenCanvas } from "../types";
export declare function createOffscreenCanvas(options: WechatMiniprogram.CreateOffscreenCanvasOption): PlatformOffscreenCanvas;
export interface IGetOffscreenCanvasResult {
    canvas: PlatformOffscreenCanvas;
    ctx: OffscreenCanvasRenderingContext2D;
}
export interface IGetCanvasResult {
    canvas: PlatformCanvas;
    ctx: CanvasRenderingContext2D;
}
export declare function getDevicePixelRatio(): any;
export declare function getCanvas(selector: string, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<IGetCanvasResult>;
export interface IGetOffscreenCanvasResult {
    canvas: PlatformOffscreenCanvas;
    ctx: OffscreenCanvasRenderingContext2D;
}
export declare function getOffscreenCanvas(options: WechatMiniprogram.CreateOffscreenCanvasOption): IGetOffscreenCanvasResult;
