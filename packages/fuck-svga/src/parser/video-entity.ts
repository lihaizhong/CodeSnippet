import type { MovieEntity } from "fuck-protobuf";
import {
  Video,
  RawImages,
  ReplaceElements,
  DynamicElements,
  VideoSprite,
  SHAPE_TYPE,
  VideoFrameShapes,
  RGBA,
} from "../types";

export class VideoEntity implements Video {
  public version: string;
  public filename: string;
  public size = { width: 0, height: 0 };
  public fps: number = 20;
  public frames: number = 0;
  public images: RawImages = {};
  public replaceElements: ReplaceElements = {};
  public dynamicElements: DynamicElements = {};
  public sprites: VideoSprite[] = [];

  constructor(movie: MovieEntity, images: RawImages = {}, filename: string) {
    this.version = movie.version;
    this.filename = filename;

    const { viewBoxWidth, viewBoxHeight, fps, frames } = movie.params!;
    this.size.width = viewBoxWidth;
    this.size.height = viewBoxHeight;
    this.fps = fps;
    this.frames = frames;

    this.sprites = [];
    movie.sprites?.forEach((mSprite) => {
      const vSprite: VideoSprite = {
        imageKey: mSprite.imageKey,
        frames: [],
      };

      let lastShapes: VideoFrameShapes | undefined;

      mSprite.frames.forEach((mFrame) => {
        const { layout: MFL, transform: MFT, alpha: MFA } = mFrame;
        const L = {
          x: MFL?.x ?? 0.0,
          y: MFL?.y ?? 0.0,
          width: MFL?.width ?? 0.0,
          height: MFL?.height ?? 0.0,
        };

        const T = {
          a: MFT?.a ?? 1.0,
          b: MFT?.b ?? 0.0,
          c: MFT?.c ?? 0.0,
          d: MFT?.d ?? 1.0,
          tx: MFT?.tx ?? 0.0,
          ty: MFT?.ty ?? 0.0,
        };

        const MFCP = mFrame.clipPath ?? "";

        let shapes: VideoFrameShapes = [];

        mFrame.shapes.forEach((mShape) => {
          const mStyles = mShape.styles;
          if (mStyles === null) return;

          const lineDash: number[] = [];
          const { lineDashI, lineDashII, lineDashIII } = mStyles;
          if (lineDashI > 0) {
            lineDash.push(lineDashI);
          }
          if (lineDashII > 0) {
            if (lineDash.length < 1) {
              lineDash.push(0);
            }
            lineDash.push(lineDashII);
          }
          if (lineDashIII > 0) {
            if (lineDash.length < 2) {
              lineDash.push(0);
              lineDash.push(0);
            }
            lineDash[2] = lineDashIII;
          }

          let lineCap: CanvasLineCap | null = null;
          switch (mStyles.lineCap) {
            case 0:
              lineCap = "butt";
              break;
            case 1:
              lineCap = "round";
              break;
            case 2:
              lineCap = "square";
              break;
          }

          let lineJoin: CanvasLineJoin | null = null;
          switch (mStyles.lineJoin) {
            case 2:
              lineJoin = "bevel";
              break;
            case 1:
              lineJoin = "round";
              break;
            case 0:
              lineJoin = "miter";
              break;
          }

          const { fill: MStF, stroke: MStS } = mStyles;
          let fill: RGBA<number, number, number, number> | null = null;
          if (MStF) {
            fill = `rgba(${parseInt((MStF.r * 255).toString())}, ${parseInt(
              (MStF.g * 255).toString()
            )}, ${parseInt((MStF.b * 255).toString())}, ${parseInt(
              (MStF.a * 1).toString()
            )})`;
          }

          let stroke: RGBA<number, number, number, number> | null = null;
          if (MStS) {
            stroke = `rgba(${parseInt((MStS.r * 255).toString())}, ${parseInt(
              (MStS.g * 255).toString()
            )}, ${parseInt((MStS.b * 255).toString())}, ${parseInt(
              (MStS.a * 1).toString()
            )})`;
          }

          const SS = {
            lineDash,
            fill,
            stroke,
            lineCap,
            lineJoin,
            strokeWidth: mStyles.strokeWidth,
            miterLimit: mStyles.miterLimit,
          };
          const { transform: MShF, shape, rect, ellipse } = mShape;
          const ST = {
            a: MShF?.a ?? 1.0,
            b: MShF?.b ?? 0.0,
            c: MShF?.c ?? 0.0,
            d: MShF?.d ?? 1.0,
            tx: MShF?.tx ?? 0.0,
            ty: MShF?.ty ?? 0.0,
          };

          if (mShape.type === 0 && shape) {
            shapes.push({
              type: SHAPE_TYPE.SHAPE,
              path: shape,
              styles: SS,
              transform: ST,
            });
          } else if (mShape.type === 1 && rect) {
            shapes.push({
              type: SHAPE_TYPE.RECT,
              path: rect,
              styles: SS,
              transform: ST,
            });
          } else if (mShape.type === 2 && ellipse) {
            shapes.push({
              type: SHAPE_TYPE.ELLIPSE,
              path: ellipse,
              styles: SS,
              transform: ST,
            });
          }
        });

        if (mFrame.shapes[0]?.type === 3 && lastShapes) {
          shapes = lastShapes;
        } else {
          lastShapes = shapes;
        }

        const llx = T.a * L.x + T.c * L.y + T.tx;
        const lrx = T.a * (L.x + L.width) + T.c * L.y + T.tx;
        const lbx = T.a * L.x + T.c * (L.y + L.height) + T.tx;
        const rbx = T.a * (L.x + L.width) + T.c * (L.y + L.height) + T.tx;
        const lly = T.b * L.x + T.d * L.y + T.ty;
        const lry = T.b * (L.x + L.width) + T.d * L.y + T.ty;
        const lby = T.b * L.x + T.d * (L.y + L.height) + T.ty;
        const rby = T.b * (L.x + L.width) + T.d * (L.y + L.height) + T.ty;
        const nx = Math.min(Math.min(lbx, rbx), Math.min(llx, lrx));
        const ny = Math.min(Math.min(lby, rby), Math.min(lly, lry));

        const maskPath =
          MFCP.length > 0
            ? {
                d: MFCP,
                transform: undefined,
                styles: {
                  fill: "rgba(0, 0, 0, 0)" as RGBA<0, 0, 0, 0>,
                  stroke: null,
                  strokeWidth: null,
                  lineCap: null,
                  lineJoin: null,
                  miterLimit: null,
                  lineDash: null,
                },
              }
            : null;

        vSprite.frames.push({
          alpha: MFA ?? 0,
          layout: L,
          transform: T,
          clipPath: MFCP,
          shapes,
          nx,
          ny,
          maskPath,
        });
      });
      this.sprites.push(vSprite);
    });

    this.images = images;
  }
}
