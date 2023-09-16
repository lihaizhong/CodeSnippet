import type { PlatformImage } from "../types";
/**
 * 加载图片
 * @param canvas 画布对象
 * @param data 图片数据
 * @returns
 */
export declare function loadImage(brush: {
    createImage: () => PlatformImage;
}, data: ImageBitmap | Uint8Array | string, filename: string, prefix?: string): Promise<PlatformImage | ImageBitmap>;
