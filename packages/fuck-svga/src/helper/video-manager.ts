import { platform } from "../platform";
import { Parser } from "../parser";

export interface Bucket {
  // 远程地址
  origin: string;
  // 本地地址
  local: string;
  // 实例
  entity: Video | ArrayBuffer | null;
  // 下载实例中
  promise: Promise<Video | null> | null;
}

export interface NeedUpdatePoint {
  action: "remove" | "add";
  start: number;
  end: number;
}

export type LoadMode = "fast" | "whole";

export class VideoManager {
  /**
   * 视频池的当前指针位置
   */
  private point: number = 0;
  /**
   * 视频的最大留存数量，其他视频将放在磁盘上缓存
   */
  private maxRemain: number = 3;
  /**
   * 留存视频的开始指针位置
   */
  private remainStart: number = 0;
  /**
   * 留存视频的结束指针位置
   */
  private remainEnd: number = 0;
  /**
   * 视频加载模式
   * 快速加载模式：可保证当前视频加载完成后，尽快播放；其他请求将使用Promise的方式保存在bucket中，以供后续使用
   * 完整加载模式：可保证所有视频加载完成，确保播放切换的流畅性
   */
  private loadMode: LoadMode = "fast";
  /**
   * 视频池的所有数据
   */
  private buckets: Bucket[] = [];
  /**
   * SVGA解析器
   */
  private readonly parser = new Parser();

  /**
   * 获取视频池大小
   */
  get length(): number {
    return this.buckets.length;
  }

  /**
   * 更新留存指针位置
   */
  private updateRemainPoints() {
    if (this.point < Math.ceil(this.maxRemain / 2)) {
      this.remainStart = 0;
      this.remainEnd = this.maxRemain;
    } else if (this.length - this.point < Math.floor(this.maxRemain / 2)) {
      this.remainStart = this.remainEnd - this.maxRemain;
      this.remainEnd = this.length;
    } else {
      this.remainStart = Math.floor(this.point - this.maxRemain / 2);
      this.remainEnd = this.remainStart + this.maxRemain;
    }
  }

  /**
   * 更新留存指针位置
   * @param point 最新的指针位置
   * @returns
   */
  private updateBucketOperators(point: number): NeedUpdatePoint[] {
    const { remainStart, remainEnd } = this;

    this.point = point;
    this.updateRemainPoints();

    if (remainStart === remainEnd) {
      return [
        {
          action: "add",
          start: this.remainStart,
          end: this.remainEnd,
        },
      ];
    }

    if (this.remainStart > remainEnd || this.remainEnd < remainStart) {
      return [
        {
          action: "remove",
          start: remainStart,
          end: remainEnd,
        },
        {
          action: "add",
          start: this.remainStart,
          end: this.remainEnd,
        },
      ];
    }

    if (this.remainStart > remainStart && this.remainEnd > remainEnd) {
      return [
        {
          action: "remove",
          start: remainStart,
          end: this.remainStart,
        },
        {
          action: "add",
          start: remainEnd,
          end: this.remainEnd,
        },
      ];
    }

    if (this.remainStart < remainStart && this.remainEnd < remainEnd) {
      return [
        {
          action: "remove",
          start: this.remainEnd,
          end: remainEnd,
        },
        {
          action: "add",
          start: this.remainStart,
          end: remainStart,
        },
      ];
    }

    return [];
  }

  /**
   * 获取当前的视频信息
   * @param point 最新的指针位置
   * @returns
   */
  private async getBucket(point: number): Promise<Bucket> {
    if (point < 0 || point >= this.length) {
      return this.buckets[this.point];
    }

    const operators = this.updateBucketOperators(point);
    if (operators.length) {
      const waitings: Promise<Video | null>[] = [];

      operators.forEach(({ action, start, end }) => {
        for (let i = start; i < end; i++) {
          const bucket = this.buckets[i];

          if (action === "remove") {
            bucket.entity = null;
          } else if (action === "add") {
            bucket.promise = this.parser.load(bucket.local || bucket.origin);
            if (this.loadMode === "whole" || this.point === i) {
              waitings.push(bucket.promise);
            }
          }
        }
      });
      await Promise.all(waitings);
    }

    return this.get();
  }

  /**
   * 视频加载模式
   * @param loadMode
   */
  setLoadMode(loadMode: LoadMode): void {
    this.loadMode = loadMode;
  }

  /**
   * 预加载视频到本地磁盘中
   * @param urls 视频远程地址
   * @param point 当前指针位置
   * @param maxRemain 最大留存数量
   */
  async prepare(
    urls: string[],
    point?: number,
    maxRemain?: number
  ): Promise<void> {
    const { parser, loadMode } = this;
    const { global, path, local } = platform;
    const { env } = global;

    this.point =
      typeof point === "number" && point > 0 && point < urls.length ? point : 0;
    this.maxRemain =
      typeof maxRemain === "number" && maxRemain > 0 ? maxRemain : 3;
    this.updateRemainPoints();
    this.buckets = await Promise.all(
      urls.map(async (url: string, index: number) => {
        const bucket: Bucket = {
          origin: url,
          local: "",
          entity: null,
          promise: null,
        };

        if (env === "h5" || env === "tt") {
          bucket.local = url;
          if (this.remainStart <= index && index < this.remainEnd) {
            if (loadMode === "whole" || index === this.point) {
              bucket.entity = await parser.load(url);
            } else {
              bucket.promise = parser.load(url);
            }
          }

          return bucket;
        }

        const filePath = path.resolve(path.filename(url), "full");
        const downloadAwait = parser.download(bucket.origin);
        const parseVideoAwait = async (buff: ArrayBuffer | null) => {
          if (buff) {
            await local.write(buff, filePath);
            bucket.local = filePath;
            if (this.remainStart <= index && index < this.remainEnd) {
              return Parser.parseVideo(buff, url);
            }
          }

          return null;
        };

        if (loadMode === "whole" || index === this.point) {
          bucket.entity = await parseVideoAwait(await downloadAwait);
        } else {
          bucket.promise = downloadAwait.then(parseVideoAwait);
        }

        return bucket;
      })
    );
  }

  /**
   * 获取当前帧的bucket
   * @returns
   */
  async get(): Promise<Bucket> {
    const bucket = this.buckets[this.point];

    if (bucket.promise) {
      bucket.entity = await bucket.promise;
      bucket.promise = null;

      return bucket;
    }

    if (bucket.entity === null) {
      bucket.entity = await this.parser.load(bucket.local || bucket.origin);

      return bucket;
    }

    return bucket;
  }

  /**
   * 获取前一个bucket
   * @returns
   */
  prev(): Promise<Bucket> {
    return this.getBucket(this.point - 1);
  }

  /**
   * 获取后一个bucket
   * @returns
   */
  next(): Promise<Bucket> {
    return this.getBucket(this.point + 1);
  }

  /**
   * 获取指定位置的bucket
   * @param pos
   * @returns
   */
  go(pos: number): Promise<Bucket> {
    return this.getBucket(pos);
  }

  /**
   * 获取当前指针位置
   * @returns 
   */
  getPoint() {
    return this.point;
  }

  /**
   * 清理所有的bucket
   * @returns
   */
  clear(): Promise<string[]> {
    const { buckets } = this;

    this.buckets = [];
    this.point = this.remainStart = this.remainEnd = 0;
    this.maxRemain = 3;

    return Promise.all(
      buckets.map((bucket: Bucket) => platform.local.remove(bucket.local))
    );
  }
}
