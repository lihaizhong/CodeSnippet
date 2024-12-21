import { inflateSync } from 'fflate'
import { fetchFile } from './adaptor'
import { VideoEntity } from './entity/video_entity'

export class Parser {
  async load(url: string): Promise<VideoEntity> {
    const data: ArrayBuffer = await fetchFile(url)
    const u8a: Uint8Array<ArrayBuffer> = new Uint8Array(data)
    const inflatedData = inflateSync(u8a)
    const movieData = ProtoMovieEntity.decode(inflatedData)
    
    return new VideoEntity(movieData)
  }
}
