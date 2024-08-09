import { VideoEntity } from "./video_entity";
import { bridge } from "./adaptor";
import { ProtoMovieEntity } from "./proto";
const { inflate } = require("./pako");

export class Parser {
  private createVideoEntity(data: any): VideoEntity {
    const inflatedData = inflate(data as any);
    const movieData = ProtoMovieEntity.decode(inflatedData);
    
    return new VideoEntity(movieData);
  }

  load(url: string): Promise<VideoEntity> {
    return new Promise((resolver, rejector) => {
      if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
        bridge.request({
          url: url,
          // @ts-ignore
          dataType: "arraybuffer",
          responseType: "arraybuffer",
          success: (res) => {
            try {
              const videoItem = this.createVideoEntity(res.data);

              resolver(videoItem);
            } catch (error) {
              rejector(error);
            }
          },
          fail: (error) => {
            rejector(error);
          },
        });
      } else {
        bridge.getFileSystemManager().readFile({
          filePath: url,
          success: (res) => {
            try {
              const videoItem = this.createVideoEntity(res.data);

              resolver(videoItem);
            } catch (error) {
              rejector(error);
            }
          },
          fail: (error) => {
            rejector(error);
          },
        });
      }
    });
  }
}
