import { BitmapsCache, PlatformCanvas, Video } from "../types";
export default class CanvasManager {
    /**
     * 主屏的 Canvas 元素
     * Main Screen
     */
    private ms;
    /**
     * 主屏的 Context 对象
     * Main Context
     */
    private mc;
    /**
     * 副屏的 Canvas 元素
     * Secondary Screen
     */
    private ss;
    /**
     * 副屏的 Context 对象
     * Secondary Context
     */
    private sc;
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
