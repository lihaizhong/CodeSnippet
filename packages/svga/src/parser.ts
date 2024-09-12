import { inflate } from "pako";
import { fetchFile } from "./adaptor";
import { VideoEntity } from "./entity/video_entity";
import { ProtoMovieEntity } from "./proto";

export class Parser {
  load(url: string): Promise<VideoEntity> {
    return fetchFile(url)
      .then((data: ArrayBuffer) => {
        const inflatedData = inflate(data as any);
        const movieData = ProtoMovieEntity.decode(inflatedData);
        
        return new VideoEntity(movieData);
      })
  }
}
