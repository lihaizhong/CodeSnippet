import { unzlibSync } from "fflate";
import { MovieEntityReader } from "svga-protobuf";
import download from "../adaptor/download";
import { VideoEntity } from "./video-entity";
import type { Video } from "../types";

/**
 * SVGA 下载解析器
 */
export class Parser {
  static parseVideoEntity(data: ArrayBuffer): Video {
    const header = new Uint8Array(data, 0, 4);
    const u8a = new Uint8Array(data);

    if (header.toString() === "80,75,3,4") {
      throw new Error("this parser only support version@2 of SVGA.");
    }

    const inflateData = unzlibSync(u8a);
    const movieData = MovieEntityReader.decode(inflateData);

    return new VideoEntity(movieData, movieData.images);
  }

  /**
   * 通过 url 下载并解析 SVGA 文件
   * @param url SVGA 文件的下载链接
   * @returns Promise<SVGA 数据源
   */
  async load(url: string): Promise<Video> {
    const data = await download(url);

    return Parser.parseVideoEntity(data);
  }
}
