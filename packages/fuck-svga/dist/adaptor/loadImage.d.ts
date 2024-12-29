import type { PlatformCanvas, PlatformOffscreenCanvas } from '../types';
/**
 * 加载图片
 * @param canvas 画布对象
 * @param data 图片数据
 * @returns
 */
export declare function loadImage(canvas: PlatformCanvas | PlatformOffscreenCanvas, data: Uint8Array | string): Promise<WechatMiniprogram.Image | HTMLImageElement>;
