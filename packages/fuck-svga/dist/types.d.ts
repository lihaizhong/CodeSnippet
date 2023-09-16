export type PlatformCanvas = HTMLCanvasElement | WechatMiniprogram.Canvas;
export type PlatformOffscreenCanvas = WechatMiniprogram.OffscreenCanvas | OffscreenCanvas;
export type PlatformImage = HTMLImageElement | WechatMiniprogram.Image;
export interface RawImages {
    [key: string]: string | Uint8Array;
}
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface Transform {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
}
export declare const enum LINE_CAP_CODE {
    BUTT = 0,
    ROUND = 1,
    SQUARE = 2
}
export declare const enum LINE_JOIN_CODE {
    MITER = 0,
    ROUND = 1,
    BEVEL = 2
}
export interface RGBA_CODE {
    r: number;
    g: number;
    b: number;
    a: number;
}
export type RGBA<R extends number, G extends number, B extends number, A extends number> = `rgba(${R}, ${G}, ${B}, ${A})`;
export declare const enum SHAPE_TYPE_CODE {
    SHAPE = 0,
    RECT = 1,
    ELLIPSE = 2,
    KEEP = 3
}
export declare const enum SHAPE_TYPE {
    SHAPE = "shape",
    RECT = "rect",
    ELLIPSE = "ellipse"
}
export interface MovieStyles {
    fill: RGBA_CODE | null;
    stroke: RGBA_CODE | null;
    strokeWidth: number | null;
    lineCap: LINE_CAP_CODE | null;
    lineJoin: LINE_JOIN_CODE | null;
    miterLimit: number | null;
    lineDashI: number | null;
    lineDashII: number | null;
    lineDashIII: number | null;
}
export interface VideoStyles {
    fill: RGBA<number, number, number, number> | null;
    stroke: RGBA<number, number, number, number> | null;
    strokeWidth: number | null;
    lineCap: CanvasLineCap | null;
    lineJoin: CanvasLineJoin | null;
    miterLimit: number | null;
    lineDash: number[] | null;
}
export interface ShapePath {
    d: string;
}
export interface RectPath {
    x: number;
    y: number;
    width: number;
    height: number;
    cornerRadius: number;
}
export interface EllipsePath {
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
}
export interface MovieShape {
    type: SHAPE_TYPE_CODE | null;
    shape: ShapePath | null;
    rect: RectPath | null;
    ellipse: EllipsePath | null;
    styles: MovieStyles | null;
    transform: Transform | null;
}
export interface VideoShapeShape {
    type: SHAPE_TYPE.SHAPE;
    path: ShapePath;
    styles: VideoStyles;
    transform: Transform;
}
export interface VideoShapeRect {
    type: SHAPE_TYPE.RECT;
    path: RectPath;
    styles: VideoStyles;
    transform: Transform;
}
export interface VideoShapeEllipse {
    type: SHAPE_TYPE.ELLIPSE;
    path: EllipsePath;
    styles: VideoStyles;
    transform: Transform;
}
export interface MaskPath {
    d: string;
    transform: Transform | undefined;
    styles: VideoStyles;
}
export interface MovieFrame {
    alpha: number;
    transform: Transform | null;
    nx: number;
    ny: number;
    layout: Rect;
    clipPath: string;
    maskPath: MaskPath | null;
    shapes: MovieShape[];
}
export type VideoFrameShape = VideoShapeShape | VideoShapeRect | VideoShapeEllipse;
export type VideoFrameShapes = VideoFrameShape[];
export interface VideoFrame {
    alpha: number;
    transform: Transform | null;
    nx: number;
    ny: number;
    layout: Rect;
    clipPath: string;
    maskPath: MaskPath | null;
    shapes: VideoFrameShapes;
}
export interface MovieSprite {
    imageKey: string;
    frames: MovieFrame[];
}
export interface VideoSprite {
    imageKey: string;
    frames: VideoFrame[];
}
export type Bitmap = PlatformImage | PlatformOffscreenCanvas | ImageBitmap;
export type ReplaceElement = PlatformImage | ImageBitmap | PlatformCanvas | PlatformOffscreenCanvas;
export interface ReplaceElements {
    [key: string]: ReplaceElement;
}
export type DynamicElement = ReplaceElement;
export interface DynamicElements {
    [key: string]: DynamicElement;
}
export interface Movie {
    version: string;
    images: {
        [key: string]: Uint8Array;
    };
    params: {
        fps: number;
        frames: number;
        viewBoxHeight: number;
        viewBoxWidth: number;
    };
    sprites: MovieSprite[];
}
export interface Video {
    version: string;
    filename: string;
    size: {
        width: number;
        height: number;
    };
    fps: number;
    frames: number;
    images: RawImages;
    replaceElements: ReplaceElements;
    dynamicElements: DynamicElements;
    sprites: VideoSprite[];
}
export declare const enum PLAYER_FILL_MODE {
    /**
     * 播放完成后停在首帧
     */
    FORWARDS = "forwards",
    /**
     * 播放完成后停在尾帧
     */
    BACKWARDS = "backwards"
}
export declare const enum PLAYER_PLAY_MODE {
    /**
     * 顺序播放
     */
    FORWARDS = "forwards",
    /**
     * 倒序播放
     */
    FALLBACKS = "fallbacks"
}
export interface PlayerConfig {
    /**
     * 循环次数，默认值 0（无限循环）
     */
    loop: number;
    /**
     * 最后停留的目标模式，类似于 animation-fill-mode，默认值 forwards。
     */
    fillMode: PLAYER_FILL_MODE;
    /**
     * 播放模式，默认值 forwards
     */
    playMode: PLAYER_PLAY_MODE;
    /**
     * 开始播放的帧数，默认值 0
     */
    startFrame: number;
    /**
     * 结束播放的帧数，默认值 0
     */
    endFrame: number;
    /**
     * 循环播放的开始帧，默认值 0
     */
    loopStartFrame: number;
}
export type PlayerConfigOptions = Partial<PlayerConfig> & {
    /**
     * 主屏，播放动画的 Canvas 元素
     */
    container: string;
    /**
     * 副屏，播放动画的 Canvas 元素
     */
    secondary?: string;
};
