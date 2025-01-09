import { BitmapsCache, PlatformCanvas, Video } from "../types";
export default class CanvasManager {
    /**
     * 主屏的 Canvas 元素
     */
    private mainScreen;
    /**
     * 主屏的 Context 对象
     */
    private mainContext;
    /**
     * 副屏的 Canvas 元素
     */
    private secondaryScreen;
    /**
     * 副屏的 Context 对象
     */
    private secondaryContext;
    /**
     * 副屏的 Canvas 类型
     */
    private type?;
    register(selector: string, ofsSelector?: string, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<void>;
    setConfig(options: {
        width: number;
        height: number;
    }): void;
    getMainScreen(): PlatformCanvas;
    clearMainScreen(): void;
    clearSecondaryScreen(): void;
    destroy(): void;
    draw(bitmapsCache: BitmapsCache, videoEntity: Video, currentFrame: number, start?: number, end?: number): void;
    stick(): void;
}
