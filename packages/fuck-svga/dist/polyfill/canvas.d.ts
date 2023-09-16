import type { PlatformCanvas, PlatformOffscreenCanvas } from "../types";
export interface IGetCanvasResult {
    canvas: PlatformCanvas;
    ctx: CanvasRenderingContext2D;
}
/**
 * 获取Canvas及其Context
 * @param selector
 * @param component
 * @returns
 */
export declare function getCanvas(selector: string, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<IGetCanvasResult>;
export interface IGetOffscreenCanvasResult {
    canvas: PlatformOffscreenCanvas;
    ctx: OffscreenCanvasRenderingContext2D;
}
/**
 * 获取离屏Canvas及其Context
 * @param options
 * @returns
 */
export declare function getOffscreenCanvas(options: WechatMiniprogram.CreateOffscreenCanvasOption): IGetOffscreenCanvasResult;
