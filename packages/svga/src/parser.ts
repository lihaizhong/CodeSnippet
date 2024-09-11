import { inflate } from "pako";
import { fetchFile } from "./adaptor";
import { VideoEntity } from "./entity/video_entity";
import { ProtoMovieEntity } from "./proto";

export class Parser {
  private createVideoEntity(data: any): VideoEntity {
    const inflatedData = inflate(data as any);
    const movieData = ProtoMovieEntity.decode(inflatedData);
    
    return new VideoEntity(movieData);
  }

  load(url: string): Promise<VideoEntity> {
    return fetchFile(url)
  }
}
