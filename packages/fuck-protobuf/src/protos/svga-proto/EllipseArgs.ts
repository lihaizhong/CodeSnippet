import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
// import ShapeEntity from "./ShapeEntity";
// import { toJSONOptions } from "../utils";

/**
 * Properties of an EllipseArgs.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IEllipseArgs
 * @property {number|null} [x] EllipseArgs x
 * @property {number|null} [y] EllipseArgs y
 * @property {number|null} [radiusX] EllipseArgs radiusX
 * @property {number|null} [radiusY] EllipseArgs radiusY
 */
export interface EllipseArgsProps {
  x: number | null;
  y: number | null;
  radiusX: number | null;
  radiusY: number | null;
}

export class EllipseArgsWriter {
  /**
   * Encodes the specified EllipseArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.EllipseArgs.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.IEllipseArgs} message EllipseArgs message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: EllipseArgs, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (message.x != null && Object.hasOwn(message, "x")) {
  //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.x);
  //   }
  //   if (message.y != null && Object.hasOwn(message, "y")) {
  //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.y);
  //   }
  //   if (message.radiusX != null && Object.hasOwn(message, "radiusX")) {
  //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.radiusX);
  //   }
  //   if (message.radiusY != null && Object.hasOwn(message, "radiusY")) {
  //     writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.radiusY);
  //   }
  //   return writer;
  // }
  /**
   * Encodes the specified EllipseArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.EllipseArgs.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.IEllipseArgs} message EllipseArgs message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: EllipseArgs, writer: Writer): Writer {
  //   return EllipseArgs.encode(message, writer).ldelim();
  // }
}

export class EllipseArgsReader {
  /**
   * Decodes an EllipseArgs message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): EllipseArgs {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new EllipseArgs();
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
          message.radiusX = reader.float();
          break;
        }
        case 4: {
          message.radiusY = reader.float();
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
   * Decodes an EllipseArgs message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): EllipseArgs {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class EllipseArgs {
  /**
   * Creates a new EllipseArgs instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
   * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs instance
   */
  static create(properties?: EllipseArgsProps) {
    return new EllipseArgs(properties);
  }
  /**
   * Verifies an EllipseArgs message.
   * @function verify
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
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
  //   if (message.radiusX != null && message.hasOwnProperty("radiusX")) {
  //     if (typeof message.radiusX !== "number") {
  //       return "radiusX: number expected";
  //     }
  //   }
  //   if (message.radiusY != null && message.hasOwnProperty("radiusY")) {
  //     if (typeof message.radiusY !== "number") {
  //       return "radiusY: number expected";
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates an EllipseArgs message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
   */
  // static fromObject(object: Record<string, any>): EllipseArgs {
  //   if (object instanceof ShapeEntity.EllipseArgs) {
  //     return object;
  //   }
  //   const message = new ShapeEntity.EllipseArgs();
  //   if (object.x != null) {
  //     message.x = +object.x;
  //   }
  //   if (object.y != null) {
  //     message.y = +object.y;
  //   }
  //   if (object.radiusX != null) {
  //     message.radiusX = +object.radiusX;
  //   }
  //   if (object.radiusY != null) {
  //     message.radiusY = +object.radiusY;
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from an EllipseArgs message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.EllipseArgs} message EllipseArgs
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: EllipseArgs,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }
  //   const object: Record<string, any> = {};
  //   if (options.defaults) {
  //     object.x = 0;
  //     object.y = 0;
  //     object.radiusX = 0;
  //     object.radiusY = 0;
  //   }
  //   if (message.x != null && message.hasOwnProperty("x")) {
  //     object.x =
  //       options.json && !isFinite(message.x) ? "" + message.x : message.x;
  //   }
  //   if (message.y != null && message.hasOwnProperty("y")) {
  //     object.y =
  //       options.json && !isFinite(message.y) ? "" + message.y : message.y;
  //   }
  //   if (message.radiusX != null && message.hasOwnProperty("radiusX")) {
  //     object.radiusX =
  //       options.json && !isFinite(message.radiusX)
  //         ? "" + message.radiusX
  //         : message.radiusX;
  //   }
  //   if (message.radiusY != null && message.hasOwnProperty("radiusY")) {
  //     object.radiusY =
  //       options.json && !isFinite(message.radiusY)
  //         ? "" + message.radiusY
  //         : message.radiusY;
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for EllipseArgs
   * @function getTypeUrl
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.EllipseArgs";
  // }

  /**
   * EllipseArgs x.
   * @member {number} x
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @instance
   */
  x: number = 0;
  /**
   * EllipseArgs y.
   * @member {number} y
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @instance
   */
  y: number = 0;
  /**
   * EllipseArgs radiusX.
   * @member {number} radiusX
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @instance
   */
  radiusX: number = 0;
  /**
   * EllipseArgs radiusY.
   * @member {number} radiusY
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @instance
   */
  radiusY: number = 0;

  /**
   * Constructs a new EllipseArgs.
   * @memberof com.opensource.svga.ShapeEntity
   * @classdesc Represents an EllipseArgs.
   * @implements IEllipseArgs
   * @constructor
   * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
   */
  constructor(properties?: EllipseArgsProps) {
    if (properties) {
      if (properties.x != null) {
        this.x = properties.x;
      }

      if (properties.y != null) {
        this.y = properties.y;
      }

      if (properties.radiusX != null) {
        this.radiusX = properties.radiusX;
      }

      if (properties.radiusY != null) {
        this.radiusY = properties.radiusY;
      }
    }
  }

  /**
   * Converts this EllipseArgs to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON() {
  //   return EllipseArgs.toObject(this, toJSONOptions);
  // }
}
