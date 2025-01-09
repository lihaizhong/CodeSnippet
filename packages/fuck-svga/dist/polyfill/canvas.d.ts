import type { PlatformCanvas, PlatformOffscreenCanvas } from "../types";
/**
 * 创建离屏Canvas
 * @param options 离屏Canvas参数
 * @returns
 */
export declare function createOffscreenCanvas(options: WechatMiniprogram.CreateOffscreenCanvasOption): PlatformOffscreenCanvas;
export interface IGetCanvasResult {
    canvas: PlatformCanvas;
    ctx: CanvasRenderingContext2D;
}
/**
 * 获取当前显示设备的物理像素分辨率与CSS 像素分辨率之比
 * @returns {number}
 */
export declare function getDevicePixelRatio(): any;
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
