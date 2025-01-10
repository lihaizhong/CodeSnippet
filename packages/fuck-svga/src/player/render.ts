import {
  DynamicElements,
  DynamicElement,
  Video,
  Transform,
  SHAPE_TYPE,
  VideoStyles,
  VideoFrameShape,
  VideoSprite,
  Bitmap,
  ReplaceElement,
} from "../types";

interface CurrentPoint {
  x: number;
  y: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const validMethods = "MLHVCSQRZmlhvcsqrz";

function render(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  bitmapsCache: Map<string, Bitmap>,
  videoEntity: Video,
  currentFrame: number,
  head?: number,
  tail?: number
): void {
  if (context === null) {
    throw new Error("Render Context cannot be null");
  }

  if (head === tail) {
    return
  }

  const { replaceElements, dynamicElements } = videoEntity
  const sprites = videoEntity.sprites.slice(head, tail);

  sprites.forEach((sprite) => {
    const { imageKey } = sprite
    const bitmap = bitmapsCache.get(imageKey);
    const replaceElement = replaceElements[imageKey];
    const dynamicElement = dynamicElements[imageKey];

    drawSprite(
      context,
      sprite,
      currentFrame,
      bitmap,
      replaceElement,
      dynamicElement
    );
  });
}

function drawSprite(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  sprite: VideoSprite,
  currentFrame: number,
  bitmap: Bitmap | undefined,
  replaceElement: ReplaceElement | undefined,
  dynamicElement: DynamicElement | undefined
): void {
  const frame = sprite.frames[currentFrame];

  if (frame.alpha < 0.05) return;

  context.save();
  context.globalAlpha = frame.alpha;

  context.transform(
    frame.transform?.a ?? 1,
    frame.transform?.b ?? 0,
    frame.transform?.c ?? 0,
    frame.transform?.d ?? 1,
    frame.transform?.tx ?? 0,
    frame.transform?.ty ?? 0
  );

  if (bitmap !== undefined) {
    if (frame.maskPath !== null) {
      drawBezier(
        context,
        frame.maskPath.d,
        frame.maskPath.transform,
        frame.maskPath.styles
      );
      context.clip();
    }
    if (replaceElement !== undefined) {
      context.drawImage(
        replaceElement as unknown as CanvasImageSource,
        0,
        0,
        frame.layout.width,
        frame.layout.height
      );
    } else {
      context.drawImage(
        bitmap as unknown as CanvasImageSource,
        0,
        0,
        frame.layout.width,
        frame.layout.height
      );
    }
  }

  if (dynamicElement !== undefined) {
    context.drawImage(
      dynamicElement as unknown as CanvasImageSource,
      (frame.layout.width - dynamicElement.width) / 2,
      (frame.layout.height - dynamicElement.height) / 2
    );
  }

  frame.shapes.forEach((shape) => drawShape(context, shape));

  context.restore();
}

function drawShape(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  shape: VideoFrameShape
): void {
  switch (shape.type) {
    case SHAPE_TYPE.SHAPE:
      drawBezier(context, shape.path.d, shape.transform, shape.styles);
      break;
    case SHAPE_TYPE.ELLIPSE:
      drawEllipse(
        context,
        shape.path.x ?? 0.0,
        shape.path.y ?? 0.0,
        shape.path.radiusX ?? 0.0,
        shape.path.radiusY ?? 0.0,
        shape.transform,
        shape.styles
      );
      break;
    case SHAPE_TYPE.RECT:
      drawRect(
        context,
        shape.path.x ?? 0.0,
        shape.path.y ?? 0.0,
        shape.path.width ?? 0.0,
        shape.path.height ?? 0.0,
        shape.path.cornerRadius ?? 0.0,
        shape.transform,
        shape.styles
      );
      break;
  }
}

function resetShapeStyles(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  styles: VideoStyles | undefined
): void {
  if (styles === undefined) return;

  if (styles.stroke !== null) {
    context.strokeStyle = styles.stroke;
  } else {
    context.strokeStyle = "transparent";
  }

  if (styles.strokeWidth !== null && styles.strokeWidth > 0)
    context.lineWidth = styles.strokeWidth;
  if (styles.miterLimit !== null && styles.miterLimit > 0)
    context.miterLimit = styles.miterLimit;
  if (styles.lineCap !== null) context.lineCap = styles.lineCap;
  if (styles.lineJoin !== null) context.lineJoin = styles.lineJoin;

  if (styles.fill !== null) {
    context.fillStyle = styles.fill;
  } else {
    context.fillStyle = "transparent";
  }

  if (styles.lineDash !== null) context.setLineDash(styles.lineDash);
}

function drawBezier(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  d: string | undefined,
  transform: Transform | undefined,
  styles: VideoStyles
): void {
  context.save();
  resetShapeStyles(context, styles);
  if (transform !== undefined) {
    context.transform(
      transform.a,
      transform.b,
      transform.c,
      transform.d,
      transform.tx,
      transform.ty
    );
  }
  const currentPoint: CurrentPoint = { x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
  context.beginPath();
  if (d !== undefined) {
    d = d.replace(/([a-zA-Z])/g, "|||$1 ").replace(/,/g, " ");
    d.split("|||").forEach((segment) => {
      if (segment.length === 0) return;
      const firstLetter = segment.substring(0, 1);
      if (validMethods.includes(firstLetter)) {
        const args = segment.substr(1).trim().split(" ");
        drawBezierElement(context, currentPoint, firstLetter, args);
      }
    });
  }
  if (styles.fill !== null) {
    context.fill();
  }
  if (styles.stroke !== null) {
    context.stroke();
  }
  context.restore();
}

function drawBezierElement(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  currentPoint: CurrentPoint,
  method: string,
  args: string[]
): void {
  switch (method) {
    case "M":
      currentPoint.x = +args[0];
      currentPoint.y = +args[1];
      context.moveTo(currentPoint.x, currentPoint.y);
      break;
    case "m":
      currentPoint.x += +args[0];
      currentPoint.y += +args[1];
      context.moveTo(currentPoint.x, currentPoint.y);
      break;
    case "L":
      currentPoint.x = +args[0];
      currentPoint.y = +args[1];
      context.lineTo(currentPoint.x, currentPoint.y);
      break;
    case "l":
      currentPoint.x += +args[0];
      currentPoint.y += +args[1];
      context.lineTo(currentPoint.x, currentPoint.y);
      break;
    case "H":
      currentPoint.x = +args[0];
      context.lineTo(currentPoint.x, currentPoint.y);
      break;
    case "h":
      currentPoint.x += +args[0];
      context.lineTo(currentPoint.x, currentPoint.y);
      break;
    case "V":
      currentPoint.y = +args[0];
      context.lineTo(currentPoint.x, currentPoint.y);
      break;
    case "v":
      currentPoint.y += +args[0];
      context.lineTo(currentPoint.x, currentPoint.y);
      break;
    case "C":
      currentPoint.x1 = +args[0];
      currentPoint.y1 = +args[1];
      currentPoint.x2 = +args[2];
      currentPoint.y2 = +args[3];
      currentPoint.x = +args[4];
      currentPoint.y = +args[5];
      context.bezierCurveTo(
        currentPoint.x1,
        currentPoint.y1,
        currentPoint.x2,
        currentPoint.y2,
        currentPoint.x,
        currentPoint.y
      );
      break;
    case "c":
      currentPoint.x1 = currentPoint.x + +args[0];
      currentPoint.y1 = currentPoint.y + +args[1];
      currentPoint.x2 = currentPoint.x + +args[2];
      currentPoint.y2 = currentPoint.y + +args[3];
      currentPoint.x += +args[4];
      currentPoint.y += +args[5];
      context.bezierCurveTo(
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
        currentPoint.x1 !== undefined &&
        currentPoint.y1 !== undefined &&
        currentPoint.x2 !== undefined &&
        currentPoint.y2 !== undefined
      ) {
        currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
        currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
        currentPoint.x2 = +args[0];
        currentPoint.y2 = +args[1];
        currentPoint.x = +args[2];
        currentPoint.y = +args[3];
        context.bezierCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x2,
          currentPoint.y2,
          currentPoint.x,
          currentPoint.y
        );
      } else {
        currentPoint.x1 = +args[0];
        currentPoint.y1 = +args[1];
        currentPoint.x = +args[2];
        currentPoint.y = +args[3];
        context.quadraticCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x,
          currentPoint.y
        );
      }
      break;
    case "s":
      if (
        currentPoint.x1 !== undefined &&
        currentPoint.y1 !== undefined &&
        currentPoint.x2 !== undefined &&
        currentPoint.y2 !== undefined
      ) {
        currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
        currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
        currentPoint.x2 = currentPoint.x + +args[0];
        currentPoint.y2 = currentPoint.y + +args[1];
        currentPoint.x += +args[2];
        currentPoint.y += +args[3];
        context.bezierCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x2,
          currentPoint.y2,
          currentPoint.x,
          currentPoint.y
        );
      } else {
        currentPoint.x1 = currentPoint.x + +args[0];
        currentPoint.y1 = currentPoint.y + +args[1];
        currentPoint.x += +args[2];
        currentPoint.y += +args[3];
        context.quadraticCurveTo(
          currentPoint.x1,
          currentPoint.y1,
          currentPoint.x,
          currentPoint.y
        );
      }
      break;
    case "Q":
      currentPoint.x1 = +args[0];
      currentPoint.y1 = +args[1];
      currentPoint.x = +args[2];
      currentPoint.y = +args[3];
      context.quadraticCurveTo(
        currentPoint.x1,
        currentPoint.y1,
        currentPoint.x,
        currentPoint.y
      );
      break;
    case "q":
      currentPoint.x1 = currentPoint.x + +args[0];
      currentPoint.y1 = currentPoint.y + +args[1];
      currentPoint.x += +args[2];
      currentPoint.y += +args[3];
      context.quadraticCurveTo(
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
      context.closePath();
      break;
    default:
      break;
  }
}

function drawEllipse(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  transform: Transform | undefined,
  styles: VideoStyles
): void {
  context.save();
  resetShapeStyles(context, styles);
  if (transform !== undefined) {
    context.transform(
      transform.a,
      transform.b,
      transform.c,
      transform.d,
      transform.tx,
      transform.ty
    );
  }
  x = x - radiusX;
  y = y - radiusY;
  const w = radiusX * 2;
  const h = radiusY * 2;
  const kappa = 0.5522848;
  const ox = (w / 2) * kappa;
  const oy = (h / 2) * kappa;
  const xe = x + w;
  const ye = y + h;
  const xm = x + w / 2;
  const ym = y + h / 2;
  context.beginPath();
  context.moveTo(x, ym);
  context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  if (styles.fill !== null) {
    context.fill();
  }
  if (styles.stroke !== null) {
    context.stroke();
  }
  context.restore();
}

function drawRect(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  cornerRadius: number,
  transform: Transform | undefined,
  styles: VideoStyles
): void {
  context.save();
  resetShapeStyles(context, styles);
  if (transform !== undefined) {
    context.transform(
      transform.a,
      transform.b,
      transform.c,
      transform.d,
      transform.tx,
      transform.ty
    );
  }
  let radius = cornerRadius;
  if (width < 2 * radius) {
    radius = width / 2;
  }
  if (height < 2 * radius) {
    radius = height / 2;
  }
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
  if (styles.fill !== null) {
    context.fill();
  }
  if (styles.stroke !== null) {
    context.stroke();
  }
  context.restore();
}

export default render;
