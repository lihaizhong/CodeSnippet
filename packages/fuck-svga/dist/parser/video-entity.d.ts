import type { MovieEntity } from "fuck-protobuf";
import { Video, RawImages, ReplaceElements, DynamicElements, VideoSprite } from "../types";
export declare class VideoEntity implements Video {
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
    constructor(movie: MovieEntity, images: RawImages | undefined, filename: string);
}
