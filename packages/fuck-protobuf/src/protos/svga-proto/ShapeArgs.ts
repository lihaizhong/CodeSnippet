import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
// import ShapeEntity from "./ShapeEntity";
// import { isString, toJSONOptions } from "../utils";

/**
 * Properties of a ShapeArgs.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IShapeArgs
 * @property {string|null} [d] ShapeArgs d
 */
export interface ShapeArgsProps {
  d: string | null;
}

export class ShapeArgsWriter {
  /**
   * Encodes the specified ShapeArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeArgs.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.IShapeArgs} message ShapeArgs message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: ShapeArgs, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (message.d != null && Object.hasOwn(message, "d")) {
  //     writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.d);
  //   }

  //   return writer;
  // }
  /**
   * Encodes the specified ShapeArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeArgs.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.IShapeArgs} message ShapeArgs message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: ShapeArgs, writer: Writer): Writer {
  //   return ShapeArgs.encode(message, writer).ldelim();
  // }
}

export class ShapeArgsReader {
  /**
   * Decodes a ShapeArgs message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): ShapeArgs {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new ShapeArgs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.d = reader.string();
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
   * Decodes a ShapeArgs message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): ShapeArgs {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class ShapeArgs {
  /**
   * Creates a new ShapeArgs instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.IShapeArgs=} [properties] Properties to set
   * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs instance
   */
  static create(properties: ShapeArgsProps): ShapeArgs {
    return new ShapeArgs(properties);
  }
  /**
   * Verifies a ShapeArgs message.
   * @function verify
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  // static verify(message: Record<string, any>): string | null {
  //   if (typeof message !== "object" || message === null) {
  //     return "object expected";
  //   }
  //   if (message.d != null && message.hasOwnProperty("d")) {
  //     if (!isString(message.d)) {
  //       return "d: string expected";
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates a ShapeArgs message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
   */
  // static fromObject(object: Record<string, any>): ShapeArgs {
  //   if (object instanceof ShapeEntity.ShapeArgs) {
  //     return object;
  //   }
  //   const message = new ShapeEntity.ShapeArgs();
  //   if (object.d != null) {
  //     message.d = "" + object.d;
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from a ShapeArgs message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @static
   * @param {com.opensource.svga.ShapeEntity.ShapeArgs} message ShapeArgs
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: ShapeArgs,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }
  //   const object: Record<string, any> = {};
  //   if (options.defaults) {
  //     object.d = "";
  //   }
  //   if (message.d != null && message.hasOwnProperty("d")) {
  //     object.d = message.d;
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for ShapeArgs
   * @function getTypeUrl
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeArgs";
  // }

  d: string = "";

  /**
   * Constructs a new ShapeArgs.
   * @memberof com.opensource.svga.ShapeEntity
   * @classdesc Represents a ShapeArgs.
   * @implements IShapeArgs
   * @constructor
   * @param {com.opensource.svga.ShapeEntity.IShapeArgs=} [properties] Properties to set
   */
  constructor(properties?: ShapeArgsProps) {
    if (properties) {
      if (properties.d != null) {
        this.d = properties.d
      }
    }
  }

  /**
   * Converts this ShapeArgs to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON(): Record<string, any> {
  //   return ShapeArgs.toObject(this, toJSONOptions);
  // }
}
