import { Bitmap, PlatformImage, RawImages, Video } from "../types";
export default class Brush {
    /**
     * 主屏的 Canvas 元素
     * Main Screen
     */
    private X;
    /**
     * 主屏的 Context 对象
     * Main Context
     */
    private XC;
    /**
     * 副屏的 Canvas 元素
     * Secondary Screen
     */
    private Y;
    /**
     * 副屏的 Context 对象
     * Secondary Context
     */
    private YC;
    /**
     * canvas宽度
     */
    private W;
    /**
     * canvas高度
     */
    private H;
    /**
     * 粉刷模式
     */
    private mode;
    /**
     * 素材
     */
    materials: Map<string, Bitmap>;
    private setMode;
    /**
     * 注册画笔，根据环境判断生成最优的绘制方式
     * @param selector
     * @param ofsSelector
     * @param component
     */
    register(selector: string, ofsSelector?: string, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<void>;
    /**
     * 设置宽高
     * @param width 宽度
     * @param height 高度
     */
    setRect(width: number, height: number): void;
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadImage(images: RawImages, filename: string): Promise<void[]>;
    /**
     * 创建图片标签
     * @returns
     */
    createImage(): PlatformImage;
    /**
     * 注册刷新屏幕的回调函数
     * @param cb
     */
    flush(cb: () => void): void;
    clearFront: () => void;
    clearBack: () => void;
    /**
     * 绘制图片片段
     * @param videoEntity
     * @param currentFrame
     * @param start
     * @param end
     */
    draw(videoEntity: Video, currentFrame: number, start: number, end: number): void;
    stick: () => void;
    /**
     * 销毁画笔
     */
    destroy(): void;
}
