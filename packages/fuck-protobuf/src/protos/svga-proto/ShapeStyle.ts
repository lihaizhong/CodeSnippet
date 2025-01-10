import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
import LineCap from "./LineCap";
import LineJoin from "./LineJoin";
import RGBAColor, { RGBAColorReader } from "./RGBAColor";
// import ShapeEntity from "./ShapeEntity";
// import { toJSONOptions } from "../utils";

/**
 * Properties of a ShapeStyle.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IShapeStyle
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null} [fill] ShapeStyle fill
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null} [stroke] ShapeStyle stroke
 * @property {number|null} [strokeWidth] ShapeStyle strokeWidth
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap|null} [lineCap] ShapeStyle lineCap
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin|null} [lineJoin] ShapeStyle lineJoin
 * @property {number|null} [miterLimit] ShapeStyle miterLimit
 * @property {number|null} [lineDashI] ShapeStyle lineDashI
 * @property {number|null} [lineDashII] ShapeStyle lineDashII
 * @property {number|null} [lineDashIII] ShapeStyle lineDashIII
 */
export interface ShapeStyleProps {
  fill: RGBAColor | null;
  stroke: RGBAColor | null;
  strokeWidth: number | null;
  lineCap: LineCap | null;
  lineJoin: LineJoin | null;
  miterLimit: number | null;
  lineDashI: number | null;
  lineDashII: number | null;
  lineDashIII: number | null;
}

export class ShapeStyleWriter {
  /**
   * Encodes the specified ShapeStyle message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {com.opensource.svga.ShapeEntity.IShapeStyle} message ShapeStyle message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: ShapeStyle, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (message.fill != null && Object.hasOwn(message, "fill")) {
  //     RGBAColor.encode(
  //       message.fill,
  //       writer.uint32(/* id 1, wireType 2 =*/ 10).fork()
  //     ).ldelim();
  //   }
  //   if (message.stroke != null && Object.hasOwn(message, "stroke")) {
  //     RGBAColor.encode(
  //       message.stroke,
  //       writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
  //     ).ldelim();
  //   }
  //   if (message.strokeWidth != null && Object.hasOwn(message, "strokeWidth")) {
  //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.strokeWidth);
  //   }
  //   if (message.lineCap != null && Object.hasOwn(message, "lineCap")) {
  //     writer.uint32(/* id 4, wireType 0 =*/ 32).int32(message.lineCap);
  //   }
  //   if (message.lineJoin != null && Object.hasOwn(message, "lineJoin")) {
  //     writer.uint32(/* id 5, wireType 0 =*/ 40).int32(message.lineJoin);
  //   }
  //   if (message.miterLimit != null && Object.hasOwn(message, "miterLimit")) {
  //     writer.uint32(/* id 6, wireType 5 =*/ 53).float(message.miterLimit);
  //   }
  //   if (message.lineDashI != null && Object.hasOwn(message, "lineDashI")) {
  //     writer.uint32(/* id 7, wireType 5 =*/ 61).float(message.lineDashI);
  //   }
  //   if (message.lineDashII != null && Object.hasOwn(message, "lineDashII")) {
  //     writer.uint32(/* id 8, wireType 5 =*/ 69).float(message.lineDashII);
  //   }
  //   if (message.lineDashIII != null && Object.hasOwn(message, "lineDashIII")) {
  //     writer.uint32(/* id 9, wireType 5 =*/ 77).float(message.lineDashIII);
  //   }

  //   return writer;
  // }
  /**
   * Encodes the specified ShapeStyle message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {com.opensource.svga.ShapeEntity.IShapeStyle} message ShapeStyle message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: ShapeStyle, writer: Writer): Writer {
  //   return ShapeStyle.encode(message, writer).ldelim();
  // }
}

export class ShapeStyleReader {
  /**
   * Decodes a ShapeStyle message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): ShapeStyle {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new ShapeStyle();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.fill = RGBAColorReader.decode(
            reader,
            reader.uint32()
          );
          break;
        }
        case 2: {
          message.stroke = RGBAColorReader.decode(
            reader,
            reader.uint32()
          );
          break;
        }
        case 3: {
          message.strokeWidth = reader.float();
          break;
        }
        case 4: {
          message.lineCap = reader.int32();
          break;
        }
        case 5: {
          message.lineJoin = reader.int32();
          break;
        }
        case 6: {
          message.miterLimit = reader.float();
          break;
        }
        case 7: {
          message.lineDashI = reader.float();
          break;
        }
        case 8: {
          message.lineDashII = reader.float();
          break;
        }
        case 9: {
          message.lineDashIII = reader.float();
          break;
        }
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  }
  /**
   * Decodes a ShapeStyle message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): ShapeStyle {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class ShapeStyle {
  /**
   * Creates a new ShapeStyle instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {com.opensource.svga.ShapeEntity.IShapeStyle=} [properties] Properties to set
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle instance
   */
  static create(properties: ShapeStyleProps) {
    return new ShapeStyle(properties);
  }
  /**
   * Verifies a ShapeStyle message.
   * @function verify
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  // static verify(message: Record<string, any>): string | null {
  //   if (typeof message !== "object" || message === null) {
  //     return "object expected";
  //   }
  //   if (message.fill != null && message.hasOwnProperty("fill")) {
  //     const error = RGBAColor.verify(message.fill);
  //     if (error) {
  //       return "fill." + error;
  //     }
  //   }
  //   if (message.stroke != null && message.hasOwnProperty("stroke")) {
  //     const error = RGBAColor.verify(message.stroke);
  //     if (error) {
  //       return "stroke." + error;
  //     }
  //   }
  //   if (message.strokeWidth != null && message.hasOwnProperty("strokeWidth")) {
  //     if (typeof message.strokeWidth !== "number") {
  //       return "strokeWidth: number expected";
  //     }
  //   }
  //   if (message.lineCap != null && message.hasOwnProperty("lineCap"))
  //     switch (message.lineCap) {
  //       default:
  //         return "lineCap: enum value expected";
  //       case 0:
  //       case 1:
  //       case 2:
  //         break;
  //     }
  //   if (message.lineJoin != null && message.hasOwnProperty("lineJoin"))
  //     switch (message.lineJoin) {
  //       default:
  //         return "lineJoin: enum value expected";
  //       case 0:
  //       case 1:
  //       case 2:
  //         break;
  //     }
  //   if (message.miterLimit != null && message.hasOwnProperty("miterLimit")) {
  //     if (typeof message.miterLimit !== "number") {
  //       return "miterLimit: number expected";
  //     }
  //   }
  //   if (message.lineDashI != null && message.hasOwnProperty("lineDashI")) {
  //     if (typeof message.lineDashI !== "number") {
  //       return "lineDashI: number expected";
  //     }
  //   }
  //   if (message.lineDashII != null && message.hasOwnProperty("lineDashII")) {
  //     if (typeof message.lineDashII !== "number") {
  //       return "lineDashII: number expected";
  //     }
  //   }
  //   if (message.lineDashIII != null && message.hasOwnProperty("lineDashIII")) {
  //     if (typeof message.lineDashIII !== "number") {
  //       return "lineDashIII: number expected";
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates a ShapeStyle message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
   */
  // static fromObject(object: Record<string, any>): ShapeStyle {
  //   if (object instanceof ShapeEntity.ShapeStyle) {
  //     return object;
  //   }
  //   const message = new ShapeEntity.ShapeStyle();
  //   if (object.fill != null) {
  //     if (typeof object.fill !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.ShapeEntity.ShapeStyle.fill: object expected"
  //       );
  //     }
  //     message.fill = RGBAColor.fromObject(object.fill);
  //   }
  //   if (object.stroke != null) {
  //     if (typeof object.stroke !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.ShapeEntity.ShapeStyle.stroke: object expected"
  //       );
  //     }
  //     message.stroke = RGBAColor.fromObject(
  //       object.stroke
  //     );
  //   }
  //   if (object.strokeWidth != null) {
  //     message.strokeWidth = Number(object.strokeWidth);
  //   }
  //   switch (object.lineCap) {
  //     default:
  //       if (typeof object.lineCap === "number") {
  //         message.lineCap = object.lineCap;
  //         break;
  //       }
  //       break;
  //     case "LineCap_BUTT":
  //     case 0:
  //       message.lineCap = 0;
  //       break;
  //     case "LineCap_ROUND":
  //     case 1:
  //       message.lineCap = 1;
  //       break;
  //     case "LineCap_SQUARE":
  //     case 2:
  //       message.lineCap = 2;
  //       break;
  //   }
  //   switch (object.lineJoin) {
  //     default:
  //       if (typeof object.lineJoin === "number") {
  //         message.lineJoin = object.lineJoin;
  //         break;
  //       }
  //       break;
  //     case "LineJoin_MITER":
  //     case 0:
  //       message.lineJoin = 0;
  //       break;
  //     case "LineJoin_ROUND":
  //     case 1:
  //       message.lineJoin = 1;
  //       break;
  //     case "LineJoin_BEVEL":
  //     case 2:
  //       message.lineJoin = 2;
  //       break;
  //   }
  //   if (object.miterLimit != null) {
  //     message.miterLimit = +object.miterLimit;
  //   }
  //   if (object.lineDashI != null) {
  //     message.lineDashI = +object.lineDashI;
  //   }
  //   if (object.lineDashII != null) {
  //     message.lineDashII = +object.lineDashII;
  //   }
  //   if (object.lineDashIII != null) {
  //     message.lineDashIII = +object.lineDashIII;
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from a ShapeStyle message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {com.opensource.svga.ShapeEntity.ShapeStyle} message ShapeStyle
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: ShapeStyle,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }
  //   const object: Record<string, any> = {};
  //   if (options.defaults) {
  //     object.fill = null;
  //     object.stroke = null;
  //     object.strokeWidth = 0;
  //     object.lineCap = options.enums === String ? "LineCap_BUTT" : 0;
  //     object.lineJoin = options.enums === String ? "LineJoin_MITER" : 0;
  //     object.miterLimit = 0;
  //     object.lineDashI = 0;
  //     object.lineDashII = 0;
  //     object.lineDashIII = 0;
  //   }
  //   if (message.fill != null && message.hasOwnProperty("fill")) {
  //     object.fill = RGBAColor.toObject(
  //       message.fill,
  //       options
  //     );
  //   }
  //   if (message.stroke != null && message.hasOwnProperty("stroke")) {
  //     object.stroke = RGBAColor.toObject(
  //       message.stroke,
  //       options
  //     );
  //   }
  //   if (message.strokeWidth != null && message.hasOwnProperty("strokeWidth")) {
  //     object.strokeWidth =
  //       options.json && !isFinite(message.strokeWidth)
  //         ? "" + message.strokeWidth
  //         : message.strokeWidth;
  //   }
  //   if (message.lineCap != null && message.hasOwnProperty("lineCap")) {
  //     object.lineCap =
  //       options.enums === String
  //         ? LineCap[message.lineCap] === undefined
  //           ? message.lineCap
  //           : LineCap[message.lineCap]
  //         : message.lineCap;
  //   }
  //   if (message.lineJoin != null && message.hasOwnProperty("lineJoin")) {
  //     object.lineJoin =
  //       options.enums === String
  //         ? LineJoin[message.lineJoin] === undefined
  //           ? message.lineJoin
  //           : LineJoin[message.lineJoin]
  //         : message.lineJoin;
  //   }
  //   if (message.miterLimit != null && message.hasOwnProperty("miterLimit")) {
  //     object.miterLimit =
  //       options.json && !isFinite(message.miterLimit)
  //         ? "" + message.miterLimit
  //         : message.miterLimit;
  //   }
  //   if (message.lineDashI != null && message.hasOwnProperty("lineDashI")) {
  //     object.lineDashI =
  //       options.json && !isFinite(message.lineDashI)
  //         ? "" + message.lineDashI
  //         : message.lineDashI;
  //   }
  //   if (message.lineDashII != null && message.hasOwnProperty("lineDashII")) {
  //     object.lineDashII =
  //       options.json && !isFinite(message.lineDashII)
  //         ? "" + message.lineDashII
  //         : message.lineDashII;
  //   }
  //   if (message.lineDashIII != null && message.hasOwnProperty("lineDashIII")) {
  //     object.lineDashIII =
  //       options.json && !isFinite(message.lineDashIII)
  //         ? "" + message.lineDashIII
  //         : message.lineDashIII;
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for ShapeStyle
   * @function getTypeUrl
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeStyle";
  // }

  /**
   * ShapeStyle fill.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  fill: RGBAColor | null = null;
  /**
   * ShapeStyle stroke.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  stroke: RGBAColor | null = null;
  /**
   * ShapeStyle strokeWidth.
   * @member {number} strokeWidth
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  strokeWidth: number = 0;
  /**
   * ShapeStyle lineCap.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap} lineCap
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineCap: LineCap = 0;
  /**
   * ShapeStyle lineJoin.
   * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineJoin: LineJoin = 0;
  /**
   * ShapeStyle miterLimit.
   * @member {number} miterLimit
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  miterLimit: number = 0;
  /**
   * ShapeStyle lineDashI.
   * @member {number} lineDashI
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineDashI: number = 0;
  /**
   * ShapeStyle lineDashII.
   * @member {number} lineDashII
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineDashII: number = 0;
  /**
   * ShapeStyle lineDashIII.
   * @member {number} lineDashIII
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   */
  lineDashIII: number = 0;

  /**
   * Constructs a new ShapeStyle.
   * @memberof com.opensource.svga.ShapeEntity
   * @classdesc Represents a ShapeStyle.
   * @implements IShapeStyle
   * @constructor
   * @param {com.opensource.svga.ShapeEntity.IShapeStyle=} [properties] Properties to set
   */
  constructor(properties?: ShapeStyleProps) {
    if (properties) {
      if (properties.fill != null) {
        this.fill = properties.fill
      }

      if (properties.lineCap != null) {
        this.lineCap = properties.lineCap
      }

      if (properties.lineDashI != null) {
        this.lineDashI = properties.lineDashI
      }

      if (properties.lineDashII != null) {
        this.lineDashII = properties.lineDashII
      }

      if (properties.lineDashIII != null) {
        this.lineDashIII = properties.lineDashIII
      }

      if (properties.lineJoin != null) {
        this.lineJoin = properties.lineJoin
      }

      if (properties.miterLimit != null) {
        this.miterLimit = properties.miterLimit
      }

      if (properties.stroke != null) {
        this.stroke = properties.stroke
      }

      if (properties.strokeWidth != null) {
        this.strokeWidth = properties.strokeWidth
      }
    }
  }

  /**
   * Converts this ShapeStyle to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON() {
  //   return ShapeStyle.toObject(this, toJSONOptions);
  // }
}
