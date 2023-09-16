import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
import FrameEntity, { FrameEntityReader } from "./FrameEntity";
// import { isString, toJSONOptions } from "../utils";

/**
 * Properties of a SpriteEntity.
 * @memberof com.opensource.svga
 * @interface ISpriteEntity
 * @property {string|null} [imageKey] SpriteEntity imageKey
 * @property {Array.<com.opensource.svga.IFrameEntity>|null} [frames] SpriteEntity frames
 * @property {string|null} [matteKey] SpriteEntity matteKey
 */
export interface SpriteEntityProps {
  imageKey: string | null;
  frames: FrameEntity[] | null;
  matteKey: string | null;
}

export class SpriteEntityWriter {
  /**
   * Encodes the specified SpriteEntity message. Does not implicitly {@link com.opensource.svga.SpriteEntity.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.SpriteEntity
   * @static
   * @param {com.opensource.svga.ISpriteEntity} message SpriteEntity message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: SpriteEntity, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (message.imageKey != null && Object.hasOwn(message, "imageKey")) {
  //     writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.imageKey);
  //   }
  //   if (message.frames != null && message.frames.length) {
  //     for (let i = 0; i < message.frames.length; ++i) {
  //       FrameEntity.encode(
  //         message.frames[i],
  //         writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
  //       ).ldelim();
  //     }
  //   }
  //   if (message.matteKey != null && Object.hasOwn(message, "matteKey")) {
  //     writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.matteKey);
  //   }

  //   return writer;
  // }

  /**
   * Encodes the specified SpriteEntity message, length delimited. Does not implicitly {@link com.opensource.svga.SpriteEntity.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.SpriteEntity
   * @static
   * @param {com.opensource.svga.ISpriteEntity} message SpriteEntity message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: SpriteEntity, writer: Writer): Writer {
  //   return SpriteEntity.encode(message, writer).ldelim();
  // }
}

export class SpriteEntityReader {
  /**
   * Decodes a SpriteEntity message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.SpriteEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): SpriteEntity {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new SpriteEntity();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.imageKey = reader.string();
          break;
        }
        case 2: {
          if (!(message.frames && message.frames.length)) {
            message.frames = [];
          }
          message.frames.push(FrameEntityReader.decode(reader, reader.uint32()));
          break;
        }
        case 3: {
          message.matteKey = reader.string();
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
   * Decodes a SpriteEntity message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.SpriteEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): SpriteEntity {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class SpriteEntity {
  /**
   * Creates a new SpriteEntity instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.SpriteEntity
   * @static
   * @param {com.opensource.svga.ISpriteEntity=} [properties] Properties to set
   * @returns {com.opensource.svga.SpriteEntity} SpriteEntity instance
   */
  static create(properties: SpriteEntityProps): SpriteEntity {
    return new SpriteEntity(properties);
  }
  /**
   * Verifies a SpriteEntity message.
   * @function verify
   * @memberof com.opensource.svga.SpriteEntity
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  // static verify(message: Record<string, any>): string | null {
  //   if (typeof message !== "object" || message === null) {
  //     return "object expected";
  //   }
  //   if (message.imageKey != null && message.hasOwnProperty("imageKey")) {
  //     if (!isString(message.imageKey)) {
  //       return "imageKey: string expected";
  //     }
  //   }
  //   if (message.frames != null && message.hasOwnProperty("frames")) {
  //     if (!Array.isArray(message.frames)) {
  //       return "frames: array expected";
  //     }
  //     for (let i = 0; i < message.frames.length; ++i) {
  //       const error = FrameEntity.verify(message.frames[i]);
  //       if (error) {
  //         return "frames." + error;
  //       }
  //     }
  //   }
  //   if (message.matteKey != null && message.hasOwnProperty("matteKey")) {
  //     if (!isString(message.matteKey)) {
  //       return "matteKey: string expected";
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates a SpriteEntity message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.SpriteEntity
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
   */
  // static fromObject(object: Record<string, any>): SpriteEntity {
  //   if (object instanceof SpriteEntity) {
  //     return object;
  //   }

  //   const message = new SpriteEntity();
  //   if (object.imageKey != null) {
  //     message.imageKey = "" + object.imageKey;
  //   }
  //   if (object.frames) {
  //     if (!Array.isArray(object.frames)) {
  //       throw TypeError(
  //         ".com.opensource.svga.SpriteEntity.frames: array expected"
  //       );
  //     }
  //     message.frames = [];
  //     for (let i = 0; i < object.frames.length; ++i) {
  //       if (typeof object.frames[i] !== "object") {
  //         throw TypeError(
  //           ".com.opensource.svga.SpriteEntity.frames: object expected"
  //         );
  //       }
  //       message.frames[i] = FrameEntity.fromObject(object.frames[i]);
  //     }
  //   }
  //   if (object.matteKey != null) {
  //     message.matteKey = "" + object.matteKey;
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from a SpriteEntity message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.SpriteEntity
   * @static
   * @param {com.opensource.svga.SpriteEntity} message SpriteEntity
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: SpriteEntity,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }

  //   const object: Record<string, any> = {};
  //   if (options.arrays || options.defaults) {
  //     object.frames = [];
  //   }
  //   if (options.defaults) {
  //     object.imageKey = "";
  //     object.matteKey = "";
  //   }
  //   if (message.imageKey != null && message.hasOwnProperty("imageKey")) {
  //     object.imageKey = message.imageKey;
  //   }
  //   if (message.frames && message.frames.length) {
  //     object.frames = [];
  //     for (let j = 0; j < message.frames.length; ++j) {
  //       object.frames[j] = FrameEntity.toObject(message.frames[j], options);
  //     }
  //   }
  //   if (message.matteKey != null && message.hasOwnProperty("matteKey")) {
  //     object.matteKey = message.matteKey;
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for SpriteEntity
   * @function getTypeUrl
   * @memberof com.opensource.svga.SpriteEntity
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.SpriteEntity";
  // }

  /**
   * SpriteEntity frames.
   * @member {Array.<com.opensource.svga.IFrameEntity>} frames
   * @memberof com.opensource.svga.SpriteEntity
   * @instance
   */
  frames: FrameEntity[] = [];
  /**
   * SpriteEntity imageKey.
   * @member {string} imageKey
   * @memberof com.opensource.svga.SpriteEntity
   * @instance
   */
  imageKey: string = "";
  /**
   * SpriteEntity matteKey.
   * @member {string} matteKey
   * @memberof com.opensource.svga.SpriteEntity
   * @instance
   */
  matteKey: string = "";

  /**
   * Constructs a new SpriteEntity.
   * @memberof com.opensource.svga
   * @classdesc Represents a SpriteEntity.
   * @implements ISpriteEntity
   * @constructor
   * @param {com.opensource.svga.ISpriteEntity=} [properties] Properties to set
   */
  constructor(properties?: SpriteEntityProps) {
    if (properties) {
      if (properties.frames != null) {
        this.frames = properties.frames
      }

      if (properties.imageKey != null) {
        this.imageKey = properties.imageKey
      }

      if (properties.matteKey != null) {
        this.matteKey = properties.matteKey
      }
    }
  }

  /**
   * Converts this SpriteEntity to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.SpriteEntity
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON(): Record<string, any> {
  //   return SpriteEntity.toObject(this, toJSONOptions);
  // }
}
