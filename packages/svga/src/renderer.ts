import { createOffscreenCanvas } from "./adaptor";
import { BezierPath } from "./draw/bezier_path";
import { EllipsePath } from "./draw/ellipse_path";
import { RectPath } from "./draw/rect_path";
import { SpriteEntity } from "./entity/sprite_entity";
import { VideoEntity } from "./entity/video_entity";

interface Point {
  x: number;
  y: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface DynamicText {
  text: string;
  size: number;
  family: string;
  color: string;
  offset: { x: number; y: number };
}

const validMethods = "MLHVCSQRZmlhvcsqrz";
const floor = (n: number | string) => ~~n

export class Renderer {
  private readonly videoItem: VideoEntity;
  private readonly canvas: WechatMiniprogram.OffscreenCanvas | OffscreenCanvas;
  private readonly ctx: CanvasRenderingContext2D;
  private contentMode: string = 'AspectFit'

  private globalTransform?: {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
  };

  private dynamicImage: { [key: string]: any } = {};
  private dynamicText: { [key: string]: DynamicText } = {};

  private isMatting: boolean = false;
  private matteSprites: Record<string, any> = {};

  constructor(videoItem: VideoEntity, width: number, height: number) {
    this.videoItem = videoItem;
    this.canvas = createOffscreenCanvas({
      type: '2d',
      width,
      height
    })
    this.ctx = this.canvas.getContext('2d')
  }

  resize() {
    const { ctx, videoItem } = this;
    if (!ctx) return;
    if (!videoItem) return;
    let scaleX = 1.0;
    let scaleY = 1.0;
    let translateX = 0.0;
    let translateY = 0.0;
    let targetSize = {
      width: this.canvas!.width,
      height: this.canvas!.height,
    };
    let imageSize = videoItem.videoSize;
    if (this.contentMode === "Fill") {
      scaleX = targetSize.width / imageSize.width;
      scaleY = targetSize.height / imageSize.height;
    } else if (
      this.contentMode === "AspectFit" ||
      this.contentMode === "AspectFill"
    ) {
      const imageRatio = imageSize.width / imageSize.height;
      const viewRatio = targetSize.width / targetSize.height;
      if (
        (imageRatio >= viewRatio && this.contentMode === "AspectFit") ||
        (imageRatio <= viewRatio && this.contentMode === "AspectFill")
      ) {
        scaleX = scaleY = targetSize.width / imageSize.width;
        translateY = (targetSize.height - imageSize.height * scaleY) / 2.0;
      } else if (
        (imageRatio < viewRatio && this.contentMode === "AspectFit") ||
        (imageRatio > viewRatio && this.contentMode === "AspectFill")
      ) {
        scaleX = scaleY = targetSize.height / imageSize.height;
        translateX = (targetSize.width - imageSize.width * scaleX) / 2.0;
      }
    }
    this.globalTransform = {
      a: scaleX,
      b: 0.0,
      c: 0.0,
      d: scaleY,
      tx: translateX,
      ty: translateY,
    };
  }

  clear() {
    const { ctx } = this;
    const areaFrame = {
      x: 0.0,
      y: 0.0,
      width: this.canvas.width,
      height: this.canvas.height,
    };
    this.matteSprites = {};
    this.isMatting = false;
    ctx.clearRect(areaFrame.x, areaFrame.y, areaFrame.width, areaFrame.height);
  }

  draw(frame: number, range: [number, number] = [0, 1]) {
    this.clear()

    const { ctx, isMatting, matteSprites } = this
    const { sprites } = this.videoItem;
    const { length } = sprites;
    const start = floor(length * range[0]);
    const end = floor(length * range[1]);

    for (let i = start; i < end; i++) {
      const sprite = sprites[i]
      let matteSprite
      if (sprites[0].imageKey?.indexOf(".matte") == -1) {
        this.drawSprite(sprite, frame);
        continue;
      }
      if (sprite.imageKey?.indexOf(".matte") != -1) {
        matteSprite[sprite.imageKey!] = sprite;
        continue;
      }
      const lastSprite = sprites[i - 1];
      if (
        isMatting &&
        (!sprite.matteKey ||
          sprite.matteKey.length == 0 ||
          sprite.matteKey != lastSprite.matteKey)
      ) {
        this.isMatting = false;

        matteSprite = matteSprites[sprite.matteKey!];
        ctx.globalCompositeOperation = "destination-in";
        this.drawSprite(matteSprite, frame);
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
      }
      if (
        sprite.matteKey != null &&
        (lastSprite.matteKey == null ||
          lastSprite.matteKey.length == 0 ||
          lastSprite.matteKey != sprite.matteKey)
      ) {
        this.isMatting = true;
        ctx.save();
      }
      this.drawSprite(sprite, frame);

      if (isMatting && i == sprites.length - 1) {
        const matteSprite = matteSprites.get(sprite.matteKey);
        ctx.globalCompositeOperation = "destination-in";
        this.drawSprite(matteSprite, frame);
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
      }
    }
  }

  private drawSprite(sprite: SpriteEntity, frameIndex: number) {
    let frameItem = sprite.frames[frameIndex];
    if (frameItem.alpha < 0.05) {
      return;
    }
    const { ctx } = this;
    ctx.save();
    if (this.globalTransform) {
      ctx.transform(
        this.globalTransform.a,
        this.globalTransform.b,
        this.globalTransform.c,
        this.globalTransform.d,
        this.globalTransform.tx,
        this.globalTransform.ty
      );
    }
    ctx.globalAlpha = frameItem.alpha;
    ctx.transform(
      frameItem.transform.a,
      frameItem.transform.b,
      frameItem.transform.c,
      frameItem.transform.d,
      frameItem.transform.tx,
      frameItem.transform.ty
    );
    let bitmapKey = sprite.imageKey?.replace(".matte", "");
    if (!bitmapKey) return;
    let img =
      this.dynamicImage[bitmapKey] ?? this.videoItem.decodedImages[bitmapKey];
    if (frameItem.maskPath !== undefined && frameItem.maskPath !== null) {
      frameItem.maskPath._styles = undefined;
      this.drawBezier(frameItem.maskPath);
      ctx.clip();
    }
    if (img) {
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        frameItem.layout.width,
        frameItem.layout.height
      );
    }

    frameItem.shapes &&
      frameItem.shapes.forEach((shape: any) => {
        if (shape.type === "shape" && shape.pathArgs && shape.pathArgs.d) {
          this.drawBezier(
            new BezierPath(shape.pathArgs.d, shape.transform, shape.styles)
          );
        }
        if (shape.type === "ellipse" && shape.pathArgs) {
          this.drawEllipse(
            new EllipsePath(
              parseFloat(shape.pathArgs.x) || 0.0,
              parseFloat(shape.pathArgs.y) || 0.0,
              parseFloat(shape.pathArgs.radiusX) || 0.0,
              parseFloat(shape.pathArgs.radiusY) || 0.0,
              shape.transform,
              shape.styles
            )
          );
        }
        if (shape.type === "rect" && shape.pathArgs) {
          this.drawRect(
            new RectPath(
              parseFloat(shape.pathArgs.x) || 0.0,
              parseFloat(shape.pathArgs.y) || 0.0,
              parseFloat(shape.pathArgs.width) || 0.0,
              parseFloat(shape.pathArgs.height) || 0.0,
              parseFloat(shape.pathArgs.cornerRadius) || 0.0,
              shape.transform,
              shape.styles
            )
          );
        }
      });
    let dynamicText = this.dynamicText[bitmapKey];
    if (dynamicText !== undefined) {
      ctx.font = `${dynamicText.size}px ${dynamicText.family ?? "Arial"}`;
      let textWidth = ctx.measureText(dynamicText.text).width;
      ctx.fillStyle = dynamicText.color;
      let offsetX =
        dynamicText.offset !== undefined && dynamicText.offset.x !== undefined
          ? isNaN(dynamicText.offset.x)
            ? 0
            : dynamicText.offset.x
          : 0;
      let offsetY =
        dynamicText.offset !== undefined && dynamicText.offset.y !== undefined
          ? isNaN(dynamicText.offset.y)
            ? 0
            : dynamicText.offset.y
          : 0;
      ctx.fillText(
        dynamicText.text,
        (frameItem.layout.width - textWidth) / 2 + offsetX,
        frameItem.layout.height / 2 + offsetY
      );
    }
    ctx.restore();
  }

  private resetShapeStyles(obj: any) {
    const { ctx } = this;
    const styles = obj._styles;
    if (!styles) {
      return;
    }
    if (styles && styles.stroke) {
      ctx.strokeStyle = `rgba(${(styles.stroke[0] * 255).toFixed(0)}, ${(
        styles.stroke[1] * 255
      ).toFixed(0)}, ${(styles.stroke[2] * 255).toFixed(0)}, ${
        styles.stroke[3]
      })`;
    } else {
      ctx.strokeStyle = "transparent";
    }
    if (styles) {
      ctx.lineWidth = styles.strokeWidth || undefined;
      ctx.lineCap = styles.lineCap || undefined;
      ctx.lineJoin = styles.lineJoin || undefined;
      ctx.miterLimit = styles.miterLimit || undefined;
    }
    if (styles && styles.fill) {
      ctx.fillStyle = `rgba(${(styles.fill[0] * 255).toFixed(0)}, ${(
        styles.fill[1] * 255
      ).toFixed(0)}, ${(styles.fill[2] * 255).toFixed(0)}, ${styles.fill[3]})`;
    } else {
      ctx.fillStyle = "transparent";
    }
    if (styles && styles.lineDash) {
      ctx.lineDashOffset = styles.lineDash[2]
      ctx.setLineDash([styles.lineDash[0], styles.lineDash[1]])
    }
  }

  private drawBezier(obj: any) {
    if (!obj._styles || !(obj._styles.fill || obj._styles.stroke)) {
      return
    }

    const { ctx } = this;
    ctx.save();
    this.resetShapeStyles(obj);
    if (obj._transform !== undefined && obj._transform !== null) {
      ctx.transform(
        obj._transform.a,
        obj._transform.b,
        obj._transform.c,
        obj._transform.d,
        obj._transform.tx,
        obj._transform.ty
      );
    }
    let currentPoint: Point = { x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
    ctx.beginPath();
    const d = obj._d.replace(/([a-zA-Z])/g, "|||$1 ").replace(/,/g, " ");
    d.split("|||").forEach((segment: string) => {
      if (segment.length == 0) {
        return;
      }
      const firstLetter = segment.substring(0, 1);
      if (validMethods.indexOf(firstLetter) >= 0) {
        const args = segment.substring(1).trim().split(" ");
        this.drawBezierElement(currentPoint, firstLetter, args);
      }
    });
    if (obj._styles.fill) {
      ctx.fill();
    }
    if (obj._styles.stroke) {
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawBezierElement(currentPoint: Point, method: string, args: any) {
    const { ctx } = this;
    switch (method) {
      case "M":
        currentPoint.x = floor(args[0]);
        currentPoint.y = floor(args[1]);
        ctx.moveTo(currentPoint.x, currentPoint.y);
        break;
      case "m":
        currentPoint.x += floor(args[0]);
        currentPoint.y += floor(args[1]);
        ctx.moveTo(currentPoint.x, currentPoint.y);
        break;
      case "L":
        currentPoint.x = floor(args[0]);
        currentPoint.y = floor(args[1]);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "l":
        currentPoint.x += floor(args[0]);
        currentPoint.y += floor(args[1]);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "H":
        currentPoint.x = floor(args[0]);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "h":
        currentPoint.x += floor(args[0]);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "V":
        currentPoint.y = floor(args[0]);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "v":
        currentPoint.y += floor(args[0]);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        break;
      case "C":
        currentPoint.x1 = floor(args[0]);
        currentPoint.y1 = floor(args[1]);
        currentPoint.x2 = floor(args[2]);
        currentPoint.y2 = floor(args[3]);
        currentPoint.x = floor(args[4]);
        currentPoint.y = floor(args[5]);
        ctx.bezierCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x2,
          currentPoint.y2,
          currentPoint.x,
          currentPoint.y
        );
        break;
      case "c":
        currentPoint.x1 = currentPoint.x + floor(args[0]);
        currentPoint.y1 = currentPoint.y + floor(args[1]);
        currentPoint.x2 = currentPoint.x + floor(args[2]);
        currentPoint.y2 = currentPoint.y + floor(args[3]);
        currentPoint.x += floor(args[4]);
        currentPoint.y += floor(args[5]);
        ctx.bezierCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x2,
          currentPoint.y2,
          currentPoint.x,
          currentPoint.y
        );
        break;
      case "S":
        if (
          currentPoint.x1 &&
          currentPoint.y1 &&
          currentPoint.x2 &&
          currentPoint.y2
        ) {
          currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
          currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
          currentPoint.x2 = floor(args[0]);
          currentPoint.y2 = floor(args[1]);
          currentPoint.x = floor(args[2]);
          currentPoint.y = floor(args[3]);
          ctx.bezierCurveTo(
            currentPoint.x1,
            currentPoint.y1,
            currentPoint.x2,
            currentPoint.y2,
            currentPoint.x,
            currentPoint.y
          );
        } else {
          currentPoint.x1 = floor(args[0]);
          currentPoint.y1 = floor(args[1]);
          currentPoint.x = floor(args[2]);
          currentPoint.y = floor(args[3]);
          ctx.quadraticCurveTo(
            currentPoint.x1,
            currentPoint.y1,
            currentPoint.x,
            currentPoint.y
          );
        }
        break;
      case "s":
        if (
          currentPoint.x1 &&
          currentPoint.y1 &&
          currentPoint.x2 &&
          currentPoint.y2
        ) {
          currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
          currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
          currentPoint.x2 = currentPoint.x + floor(args[0]);
          currentPoint.y2 = currentPoint.y + floor(args[1]);
          currentPoint.x += floor(args[2]);
          currentPoint.y += floor(args[3]);
          ctx.bezierCurveTo(
            currentPoint.x1,
            currentPoint.y1,
            currentPoint.x2,
            currentPoint.y2,
            currentPoint.x,
            currentPoint.y
          );
        } else {
          currentPoint.x1 = currentPoint.x + floor(args[0]);
          currentPoint.y1 = currentPoint.y + floor(args[1]);
          currentPoint.x += floor(args[2]);
          currentPoint.y += floor(args[3]);
          ctx.quadraticCurveTo(
            currentPoint.x1,
            currentPoint.y1,
            currentPoint.x,
            currentPoint.y
          );
        }
        break;
      case "Q":
        currentPoint.x1 = floor(args[0]);
        currentPoint.y1 = floor(args[1]);
        currentPoint.x = floor(args[2]);
        currentPoint.y = floor(args[3]);
        ctx.quadraticCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x,
          currentPoint.y
        );
        break;
      case "q":
        currentPoint.x1 = currentPoint.x + floor(args[0]);
        currentPoint.y1 = currentPoint.y + floor(args[1]);
        currentPoint.x += floor(args[2]);
        currentPoint.y += floor(args[3]);
        ctx.quadraticCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x,
          currentPoint.y
        );
        break;
      case "A":
        break;
      case "a":
        break;
      case "Z":
      case "z":
        ctx.closePath();
        break;
      default:
        break;
    }
  }

  private drawEllipse(obj: any) {
    if (!obj._styles || !(obj._styles.fill || obj._styles.stroke)) {
      return
    }

    const { ctx } = this;
    ctx.save();
    this.resetShapeStyles(obj);
    if (obj._transform !== undefined && obj._transform !== null) {
      ctx.transform(
        obj._transform.a,
        obj._transform.b,
        obj._transform.c,
        obj._transform.d,
        obj._transform.tx,
        obj._transform.ty
      );
    }
    let x = obj._x - obj._radiusX;
    let y = obj._y - obj._radiusY;
    let w = obj._radiusX * 2;
    let h = obj._radiusY * 2;
    const kappa = 0.5522848,
      ox = (w / 2) * kappa,
      oy = (h / 2) * kappa,
      xe = x + w,
      ye = y + h,
      xm = x + w / 2,
      ym = y + h / 2;

    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    if (obj._styles.fill) {
      ctx.fill();
    }
    if (obj._styles.stroke) {
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawRect(obj: any): void {
    if (!obj._styles || !(obj._styles.fill || obj._styles.stroke)) {
      return
    }

    const { ctx } = this;
    ctx.save();
    this.resetShapeStyles(obj);
    if (obj._transform !== undefined && obj._transform !== null) {
      ctx.transform(
        obj._transform.a,
        obj._transform.b,
        obj._transform.c,
        obj._transform.d,
        obj._transform.tx,
        obj._transform.ty
      );
    }

    let x = obj._x;
    let y = obj._y;
    let width = obj._width;
    let height = obj._height;
    let radius = obj._cornerRadius;

    if (width < 2 * radius) {
      radius = width / 2;
    }
    if (height < 2 * radius) {
      radius = height / 2;
    }

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();

    if (obj._styles.fill) {
      ctx.fill();
    }
    if (obj._styles.stroke) {
      ctx.stroke();
    }
    ctx.restore();
  }

  setDynamicImage(key: string, value: any): void {
    this.dynamicImage[key] = value
  }

  setDynamicText(key: string, value: DynamicText): void {
    this.dynamicText[key] = value
  }

  getImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
  }
}
