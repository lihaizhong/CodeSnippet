import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
// import ShapeEntity from "./ShapeEntity";
// import { toJSONOptions } from "../utils";

/**
 * Properties of a RGBAColor.
 * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
 * @interface IRGBAColor
 * @property {number|null} [r] RGBAColor r
 * @property {number|null} [g] RGBAColor g
 * @property {number|null} [b] RGBAColor b
 * @property {number|null} [a] RGBAColor a
 */
export interface RGBAColorProps {
  r: number | null;
  g: number | null;
  b: number | null;
  a: number | null;
}

export class RGBAColorWriter {
  /**
   * Encodes the specified RGBAColor message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor} message RGBAColor message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: RGBAColor, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (message.r != null && Object.hasOwn(message, "r")) {
  //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.r);
  //   }
  //   if (message.g != null && Object.hasOwn(message, "g")) {
  //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.g);
  //   }
  //   if (message.b != null && Object.hasOwn(message, "b")) {
  //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.b);
  //   }
  //   if (message.a != null && Object.hasOwn(message, "a")) {
  //     writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.a);
  //   }

  //   return writer;
  // }
  /**
   * Encodes the specified RGBAColor message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor} message RGBAColor message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: RGBAColor, writer: Writer): Writer {
  //   return RGBAColor.encode(message, writer).ldelim();
  // }
}

export class RGBAColorReader {
  /**
   * Decodes a RGBAColor message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): RGBAColor {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new RGBAColor();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.r = reader.float();
          break;
        }
        case 2: {
          message.g = reader.float();
          break;
        }
        case 3: {
          message.b = reader.float();
          break;
        }
        case 4: {
          message.a = reader.float();
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
   * Decodes a RGBAColor message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): RGBAColor {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class RGBAColor {
  /**
   * Creates a new RGBAColor instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor instance
   */
  static create(properties: RGBAColorProps) {
    return new RGBAColor(properties);
  }
  /**
   * Verifies a RGBAColor message.
   * @function verify
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  // static verify(message: Record<string, any>): string | null {
  //   if (typeof message !== "object" || message === null) {
  //     return "object expected";
  //   }
  //   if (message.r != null && message.hasOwnProperty("r")) {
  //     if (typeof message.r !== "number") {
  //       return "r: number expected";
  //     }
  //   }
  //   if (message.g != null && message.hasOwnProperty("g")) {
  //     if (typeof message.g !== "number") {
  //       return "g: number expected";
  //     }
  //   }
  //   if (message.b != null && message.hasOwnProperty("b")) {
  //     if (typeof message.b !== "number") {
  //       return "b: number expected";
  //     }
  //   }
  //   if (message.a != null && message.hasOwnProperty("a")) {
  //     if (typeof message.a !== "number") {
  //       return "a: number expected";
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates a RGBAColor message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
   */
  // static fromObject(object: Record<string, any>): RGBAColor {
  //   if (object instanceof RGBAColor) {
  //     return object;
  //   }
  //   const message = new RGBAColor();
  //   if (object.r != null) {
  //     message.r = +object.r;
  //   }
  //   if (object.g != null) {
  //     message.g = +object.g;
  //   }
  //   if (object.b != null) {
  //     message.b = +object.b;
  //   }
  //   if (object.a != null) {
  //     message.a = +object.a;
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from a RGBAColor message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} message RGBAColor
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: RGBAColor,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }
  //   const object: Record<string, any> = {};
  //   if (options.defaults) {
  //     object.r = 0;
  //     object.g = 0;
  //     object.b = 0;
  //     object.a = 0;
  //   }
  //   if (message.r != null && message.hasOwnProperty("r")) {
  //     object.r =
  //       options.json && !isFinite(message.r) ? "" + message.r : message.r;
  //   }
  //   if (message.g != null && message.hasOwnProperty("g")) {
  //     object.g =
  //       options.json && !isFinite(message.g) ? "" + message.g : message.g;
  //   }
  //   if (message.b != null && message.hasOwnProperty("b")) {
  //     object.b =
  //       options.json && !isFinite(message.b) ? "" + message.b : message.b;
  //   }
  //   if (message.a != null && message.hasOwnProperty("a")) {
  //     object.a =
  //       options.json && !isFinite(message.a) ? "" + message.a : message.a;
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for RGBAColor
   * @function getTypeUrl
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return (
  //     typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor"
  //   );
  // }

  /**
   * RGBAColor r.
   * @member {number} r
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @instance
   */
  r: number = 0;
  /**
   * RGBAColor g.
   * @member {number} g
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @instance
   */
  g: number = 0;
  /**
   * RGBAColor b.
   * @member {number} b
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @instance
   */
  b: number = 0;
  /**
   * RGBAColor a.
   * @member {number} a
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @instance
   */
  a: number = 0;

  /**
   * Constructs a new RGBAColor.
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
   * @classdesc Represents a RGBAColor.
   * @implements IRGBAColor
   * @constructor
   * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
   */
  constructor(properties?: RGBAColorProps) {
    if (properties) {
      if (properties.r != null) {
        this.r = properties.r
      }

      if (properties.g != null) {
        this.g = properties.g
      }

      if (properties.b != null) {
        this.b = properties.b
      }

      if (properties.a != null) {
        this.a = properties.a
      }
    }
  }

  /**
   * Converts this RGBAColor to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON() {
  //   return RGBAColor.toObject(this, toJSONOptions);
  // }
}
