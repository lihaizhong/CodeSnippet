import { Renderer } from "./renderer";
import { ValueAnimator } from "./value_animator";
import { VideoEntity } from "./entity/video_entity";
import { getCanvas, loadImage } from "./adaptor";

interface Range {
  location: number;
  length: number;
}

interface DynamicText {
  text: string;
  size: number;
  family: string;
  color: string;
  offset: { x: number; y: number };
}

export const AnimateFillMode = {
  FORWARD: 'Forward',
  BACKWARD: 'Backward'
}

export const AnimateContentMode = {
  ASPECT_FIT: 'AspectFit',
  ASPECT_FILL: 'AspectFill',
  FILL: 'Fill'
}

export class Player {
  private canvas?: WechatMiniprogram.Canvas | HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;

  async setCanvas(
    selector: string,
    component?: WechatMiniprogram.Component.TrivialInstance
  ): Promise<any> {
    const { canvas, ctx } = await getCanvas(selector, component)
    this.canvas = canvas
    this.ctx = ctx
  }

  loops = 0;

  clearsAfterStop = true;

  fillMode = AnimateFillMode.FORWARD;

  private videoItem?: VideoEntity;
  private renderer?: Renderer;
  private animator?: ValueAnimator;
  private currentFrame = 0;

  _onFinished?: () => void;
  _onFrame?: (frame: number) => void;
  _onPercentage?: (percentage: number) => void;

  async setVideoItem(videoItem?: VideoEntity): Promise<any> {
    this.currentFrame = 0;
    this.videoItem = videoItem;
    if (videoItem) {
      const keyedImages = await Promise.all(
        Object.keys(videoItem.spec.images).map(async (it) => {
          try {
            const data = await this.loadImage(videoItem.spec.images[it]);
            return { key: it, value: data };
          } catch (error) {
            return { key: it, value: undefined };
          }
        })
      );
      let decodedImages: { [key: string]: any } = {};
      keyedImages.forEach((it) => {
        decodedImages[it.key] = it.value;
      });
      videoItem.decodedImages = decodedImages;
      const { width, height } = this.canvas!
      this.renderer = new Renderer(this.videoItem!, width, height);
    } else {
      this.renderer = undefined;
    }
    this.clear();
    this.update();
  }

  loadImage(data: Uint8Array | string): Promise<any> {
    if (!this.canvas) throw "no canvas";

    return loadImage(this.canvas, data)
  }

  _contentMode = AnimateContentMode.ASPECT_FIT;

  setContentMode(contentMode: string) {
    this._contentMode = contentMode;
    this.update();
  }

  startAnimation(reverse: boolean = false) {
    this.stopAnimation(false);
    this.doStart(undefined, reverse, undefined);
  }

  startAnimationWithRange(range: Range, reverse: boolean = false) {
    this.stopAnimation(false);
    this.doStart(range, reverse, undefined);
  }

  pauseAnimation() {
    this.stopAnimation(false);
  }

  stopAnimation(clear?: boolean) {
    if (this.animator !== undefined) {
      this.animator.stop();
    }
    if (clear === undefined) {
      clear = this.clearsAfterStop;
    }
    if (clear) {
      this.clear();
    }
  }

  clear() {
    this.renderer?.clear();
  }

  stepToFrame(frame: number, andPlay: boolean = false) {
    const videoItem = this.videoItem;
    if (!videoItem) return;
    if (frame >= videoItem.frames || frame < 0) {
      return;
    }
    this.pauseAnimation();
    this.currentFrame = frame;
    this.update();
    if (andPlay) {
      this.doStart(undefined, false, this.currentFrame);
    }
  }

  stepToPercentage(percentage: number, andPlay: boolean = false) {
    const videoItem = this.videoItem;
    if (!videoItem) return;
    let frame = percentage * videoItem.frames;
    if (frame >= videoItem.frames && frame > 0) {
      frame = videoItem.frames - 1;
    }
    this.stepToFrame(frame, andPlay);
  }

  async setImage(src: Uint8Array | string, forKey: string): Promise<any> {
    if (this.renderer) {
      const img = await this.loadImage(src);
      this.renderer.setDynamicImage(forKey, img);
    }
  }

  setText(dynamicText: DynamicText, forKey: string) {
    if (this.renderer) {
      this.renderer.setDynamicText(forKey, dynamicText)
    }
  }

  onFinished(callback: () => void) {
    this._onFinished = callback;
  }

  onFrame(callback: (frame: number) => void) {
    this._onFrame = callback;
  }

  onPercentage(callback: (percentage: number) => void) {
    this._onPercentage = callback;
  }

  private doStart(range?: Range, reverse: boolean = false, fromFrame: number = 0) {
    const videoItem = this.videoItem;
    if (!videoItem) return;
    this.animator = new ValueAnimator();
    this.animator.canvas = this.canvas;
    if (range !== undefined) {
      this.animator.startValue = Math.max(0, range.location);
      this.animator.endValue = Math.min(
        videoItem.frames - 1,
        range.location + range.length
      );
      this.animator.duration =
        (this.animator.endValue - this.animator.startValue + 1) *
        (1.0 / videoItem.FPS) *
        1000;
    } else {
      this.animator.startValue = 0;
      this.animator.endValue = videoItem.frames - 1;
      this.animator.duration = videoItem.frames * (1.0 / videoItem.FPS) * 1000;
    }
    this.animator.loops = this.loops <= 0 ? Infinity : this.loops;
    this.animator.fillRule = this.fillMode === AnimateFillMode.BACKWARD ? 1 : 0;
    this.animator.onUpdate = (value) => {
      if (this.currentFrame === Math.floor(value)) {
        return;
      }
      this.currentFrame = Math.floor(value);
      this.update();
      if (typeof this._onFrame === "function") {
        this._onFrame(this.currentFrame);
      }
      if (typeof this._onPercentage === "function") {
        this._onPercentage((this.currentFrame + 1) / videoItem.frames);
      }
    };
    this.animator.onEnd = () => {
      if (this.clearsAfterStop === true) {
        this.clear();
      }
      if (typeof this._onFinished === "function") {
        this._onFinished();
      }
    };
    if (reverse === true) {
      this.animator.reverse(fromFrame);
    } else {
      this.animator.start(fromFrame);
    }
    this.currentFrame = this.animator.startValue;
    this.update();
  }

  private updateChunk() {}

  private update() {
    if (this.renderer) {
      this.renderer.resize();
      this.renderer.draw(this.currentFrame);
    }
  }
}
