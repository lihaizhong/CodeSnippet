import { BitmapsCache, PlatformCanvas, Video } from "../types";
export default class CanvasManager {
    private mainScreen;
    private mainContext;
    private secondaryScreen;
    private secondaryContext;
    private type?;
    register(selector: string, ofsSelector?: string, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<void>;
    setSize(width: number, height: number): void;
    getMainScreen(): PlatformCanvas;
    clearSecondaryScreen(): void;
    clearMainScreen(): void;
    destroy(): void;
    draw(bitmapsCache: BitmapsCache, videoEntity: Video, currentFrame: number, start?: number, end?: number): void;
    stick(): void;
}
