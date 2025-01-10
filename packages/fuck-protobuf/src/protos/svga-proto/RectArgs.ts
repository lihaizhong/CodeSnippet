import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
// import ShapeEntity from "./ShapeEntity";
// import { toJSONOptions } from "../utils";

/**
 * Properties of a RectArgs.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IRectArgs
 * @property {number|null} [x] RectArgs x
 * @property {number|null} [y] RectArgs y
 * @property {number|null} [width] RectArgs width
 * @property {number|null} [height] RectArgs height
 * @property {number|null} [cornerRadius] RectArgs cornerRadius
 */
export interface RectArgsProps {
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  cornerRadius: number | null;
}

export class RectArgsWriter {
  /**
   * Encodes the specified RectArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.RectArgs.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.IRectArgs} message RectArgs message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: RectArgs, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (message.x != null && Object.hasOwn(message, "x")) {
  //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.x);
  //   }
  //   if (message.y != null && Object.hasOwn(message, "y")) {
  //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.y);
  //   }
  //   if (message.width != null && Object.hasOwn(message, "width")) {
  //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.width);
  //   }
  //   if (message.height != null && Object.hasOwn(message, "height")) {
  //     writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.height);
  //   }
  //   if (
  //     message.cornerRadius != null &&
  //     Object.hasOwn(message, "cornerRadius")
  //   ) {
  //     writer.uint32(/* id 5, wireType 5 =*/ 45).float(message.cornerRadius);
  //   }

  //   return writer;
  // }
  /**
   * Encodes the specified RectArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.RectArgs.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.IRectArgs} message RectArgs message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: RectArgs, writer: Writer): Writer {
  //   return RectArgs.encode(message, writer).ldelim();
  // }
}

export class RectArgsReader {
  /**
   * Decodes a RectArgs message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): RectArgs {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new RectArgs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.x = reader.float();
          break;
        }
        case 2: {
          message.y = reader.float();
          break;
        }
        case 3: {
          message.width = reader.float();
          break;
        }
        case 4: {
          message.height = reader.float();
          break;
        }
        case 5: {
          message.cornerRadius = reader.float();
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
   * Decodes a RectArgs message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): RectArgs {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class RectArgs {
  /**
   * Creates a new RectArgs instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.IRectArgs=} [properties] Properties to set
   * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs instance
   */
  static create(properties?: RectArgsProps): RectArgs {
    return new RectArgs(properties);
  }
  /**
   * Verifies a RectArgs message.
   * @function verify
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  // static verify(message: Record<string, any>): string | null {
  //   if (typeof message !== "object" || message === null) {
  //     return "object expected";
  //   }
  //   if (message.x != null && message.hasOwnProperty("x")) {
  //     if (typeof message.x !== "number") {
  //       return "x: number expected";
  //     }
  //   }
  //   if (message.y != null && message.hasOwnProperty("y")) {
  //     if (typeof message.y !== "number") {
  //       return "y: number expected";
  //     }
  //   }
  //   if (message.width != null && message.hasOwnProperty("width")) {
  //     if (typeof message.width !== "number") {
  //       return "width: number expected";
  //     }
  //   }
  //   if (message.height != null && message.hasOwnProperty("height")) {
  //     if (typeof message.height !== "number") {
  //       return "height: number expected";
  //     }
  //   }
  //   if (
  //     message.cornerRadius != null &&
  //     message.hasOwnProperty("cornerRadius")
  //   ) {
  //     if (typeof message.cornerRadius !== "number") {
  //       return "cornerRadius: number expected";
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates a RectArgs message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
   */
  // static fromObject(object: Record<string, any>): RectArgs {
  //   if (object instanceof ShapeEntity.RectArgs) {
  //     return object;
  //   }
  //   const message = new ShapeEntity.RectArgs();
  //   if (object.x != null) {
  //     message.x = +object.x;
  //   }
  //   if (object.y != null) {
  //     message.y = +object.y;
  //   }
  //   if (object.width != null) {
  //     message.width = +object.width;
  //   }
  //   if (object.height != null) {
  //     message.height = +object.height;
  //   }
  //   if (object.cornerRadius != null) {
  //     message.cornerRadius = +object.cornerRadius;
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from a RectArgs message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.RectArgs} message RectArgs
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: RectArgs,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }
  //   const object: Record<string, any> = {};
  //   if (options.defaults) {
  //     object.x = 0;
  //     object.y = 0;
  //     object.width = 0;
  //     object.height = 0;
  //     object.cornerRadius = 0;
  //   }
  //   if (message.x != null && message.hasOwnProperty("x")) {
  //     object.x =
  //       options.json && !isFinite(message.x) ? "" + message.x : message.x;
  //   }
  //   if (message.y != null && message.hasOwnProperty("y")) {
  //     object.y =
  //       options.json && !isFinite(message.y) ? "" + message.y : message.y;
  //   }
  //   if (message.width != null && message.hasOwnProperty("width")) {
  //     object.width =
  //       options.json && !isFinite(message.width)
  //         ? "" + message.width
  //         : message.width;
  //   }
  //   if (message.height != null && message.hasOwnProperty("height")) {
  //     object.height =
  //       options.json && !isFinite(message.height)
  //         ? "" + message.height
  //         : message.height;
  //   }
  //   if (
  //     message.cornerRadius != null &&
  //     message.hasOwnProperty("cornerRadius")
  //   ) {
  //     object.cornerRadius =
  //       options.json && !isFinite(message.cornerRadius)
  //         ? "" + message.cornerRadius
  //         : message.cornerRadius;
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for RectArgs
   * @function getTypeUrl
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.RectArgs";
  // }

  /**
   * RectArgs x.
   * @member {number} x
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   */
  x: number = 0;
  /**
   * RectArgs y.
   * @member {number} y
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   */
  y: number = 0;
  /**
   * RectArgs width.
   * @member {number} width
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   */
  width: number = 0;
  /**
   * RectArgs height.
   * @member {number} height
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   */
  height: number = 0;
  /**
   * RectArgs cornerRadius.
   * @member {number} cornerRadius
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   */
  cornerRadius: number = 0;

  /**
   * Constructs a new RectArgs.
   * @memberof com.opensource.svga.ShapeEntity
   * @classdesc Represents a RectArgs.
   * @implements IRectArgs
   * @constructor
   * @param {com.opensource.svga.ShapeEntity.IRectArgs=} [properties] Properties to set
   */
  constructor(properties?: RectArgsProps) {
    if (properties) {
      if (properties.x != null) {
        this.x = properties.x
      }

      if (properties.y != null) {
        this.y = properties.y
      }

      if (properties.width != null) {
        this.width = properties.width
      }

      if (properties.height != null) {
        this.height = properties.height
      }

      if (properties.cornerRadius != null) {
        this.cornerRadius = properties.cornerRadius
      }
    }
  }

  /**
   * Converts this RectArgs to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.ShapeEntity.RectArgs
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON(): Record<string, any> {
  //   return RectArgs.toObject(this, toJSONOptions);
  // }
}
