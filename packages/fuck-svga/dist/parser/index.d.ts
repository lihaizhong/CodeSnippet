import type { Video } from '../types';
/**
 * SVGA 下载解析器
 */
export declare class Parser {
    static parseVideoEntity(data: ArrayBuffer): Video;
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    load(url: string): Promise<Video>;
}
