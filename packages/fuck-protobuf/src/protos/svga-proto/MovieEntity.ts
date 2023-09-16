// import base64 from "@protobufjs/base64";
import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
import SpriteEntity, { SpriteEntityReader } from "./SpriteEntity";
import MovieParams, { MovieParamsReader } from "./MovieParams";
import { emptyObject } from "../../utils";

/**
 * Properties of a MovieEntity.
 * @memberof com.opensource.svga
 * @interface IMovieEntity
 * @property {string|null} [version] MovieEntity version
 * @property {com.opensource.svga.IMovieParams|null} [params] MovieEntity params
 * @property {Object.<string,Uint8Array>|null} [images] MovieEntity images
 * @property {Array.<com.opensource.svga.ISpriteEntity>|null} [sprites] MovieEntity sprites
 */
export interface MovieEntityProps {
  version: string | null;
  params: MovieParams | null;
  images: Record<string, Uint8Array> | null;
  sprites: SpriteEntity[] | null;
}

export class MovieEntityWriter {
  /**
   * Encodes the specified MovieEntity message. Does not implicitly {@link com.opensource.svga.MovieEntity.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {com.opensource.svga.IMovieEntity} message MovieEntity message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: MovieEntity, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (message.version != null && Object.hasOwn(message, "version")) {
  //     writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.version);
  //   }
  //   if (message.params != null && Object.hasOwn(message, "params")) {
  //     MovieParams.encode(
  //       message.params,
  //       writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
  //     ).ldelim();
  //   }
  //   if (message.images != null && Object.hasOwn(message, "images")) {
  //     const keys = Object.keys(message.images);
  //     for (let i = 0; i < keys.length; ++i) {
  //       writer
  //         .uint32(/* id 3, wireType 2 =*/ 26)
  //         .fork()
  //         .uint32(/* id 1, wireType 2 =*/ 10)
  //         .string(keys[i])
  //         .uint32(/* id 2, wireType 2 =*/ 18)
  //         .bytes(message.images[keys[i]])
  //         .ldelim();
  //     }
  //   }
  //   if (message.sprites != null && message.sprites.length) {
  //     for (let i = 0; i < message.sprites.length; ++i) {
  //       SpriteEntity.encode(
  //         message.sprites[i],
  //         writer.uint32(/* id 4, wireType 2 =*/ 34).fork()
  //       ).ldelim();
  //     }
  //   }

  //   return writer;
  // }
  /**
   * Encodes the specified MovieEntity message, length delimited. Does not implicitly {@link com.opensource.svga.MovieEntity.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {com.opensource.svga.IMovieEntity} message MovieEntity message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: MovieEntity, writer: Writer): Writer {
  //   return MovieEntity.encode(message, writer).ldelim();
  // }
}

export class MovieEntityReader {
  /**
   * Decodes a MovieEntity message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.MovieEntity} MovieEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): MovieEntity {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new MovieEntity();
    let key;
    let value;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.version = reader.string();
          break;
        }
        case 2: {
          message.params = MovieParamsReader.decode(reader, reader.uint32());
          break;
        }
        case 3: {
          if (message.images === emptyObject) {
            message.images = {};
          }
          const end2 = reader.uint32() + reader.pos;
          key = "";
          value = [];
          while (reader.pos < end2) {
            let tag2 = reader.uint32();
            switch (tag2 >>> 3) {
              case 1:
                key = reader.string();
                break;
              case 2:
                value = reader.bytes();
                break;
              default:
                reader.skipType(tag2 & 7);
                break;
            }
          }
          message.images[key] = value as Uint8Array;
          break;
        }
        case 4: {
          if (!(message.sprites && message.sprites.length)) {
            message.sprites = [];
          }
          message.sprites.push(SpriteEntityReader.decode(reader, reader.uint32()));
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
   * Decodes a MovieEntity message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.MovieEntity} MovieEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): MovieEntity {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class MovieEntity {
  /**
   * Creates a new MovieEntity instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {com.opensource.svga.IMovieEntity=} [properties] Properties to set
   * @returns {com.opensource.svga.MovieEntity} MovieEntity instance
   */
  static create(properties?: MovieEntityProps): MovieEntity {
    return new MovieEntity(properties);
  }
  /**
   * Verifies a MovieEntity message.
   * @function verify
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  // static verify(message: Record<string, any>): string | null {
  //   if (typeof message !== "object" || message === null) {
  //     return "object expected";
  //   }
  //   if (message.version != null && message.hasOwnProperty("version")) {
  //     if (!isString(message.version)) {
  //       return "version: string expected";
  //     }
  //   }
  //   if (message.params != null && message.hasOwnProperty("params")) {
  //     const error = MovieParams.verify(message.params);
  //     if (error) {
  //       return "params." + error;
  //     }
  //   }
  //   if (message.images != null && message.hasOwnProperty("images")) {
  //     if (!isObject(message.images)) {
  //       return "images: object expected";
  //     }
  //     const keys = Object.keys(message.images);
  //     for (let i = 0; i < keys.length; ++i) {
  //       const key = keys[i];
  //       if (
  //         !(
  //           (message.images[key] &&
  //             typeof message.images[key].length === "number") ||
  //           isString(message.images[key])
  //         )
  //       ) {
  //         return "images: buffer{k:string} expected";
  //       }
  //     }
  //   }
  //   if (message.sprites != null && message.hasOwnProperty("sprites")) {
  //     if (!Array.isArray(message.sprites)) {
  //       return "sprites: array expected";
  //     }
  //     for (let i = 0; i < message.sprites.length; ++i) {
  //       const error = SpriteEntity.verify(message.sprites[i]);
  //       if (error) {
  //         return "sprites." + error;
  //       }
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates a MovieEntity message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.MovieEntity} MovieEntity
   */
  // static fromObject(object: Record<string, any>): MovieEntity {
  //   if (object instanceof MovieEntity) {
  //     return object;
  //   }
  //   const message = new MovieEntity();
  //   if (object.version != null) {
  //     message.version = "" + object.version;
  //   }
  //   if (object.params != null) {
  //     if (typeof object.params !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.MovieEntity.params: object expected"
  //       );
  //     }
  //     message.params = MovieParams.fromObject(object.params);
  //   }
  //   if (object.images) {
  //     if (typeof object.images !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.MovieEntity.images: object expected"
  //       );
  //     }
  //     message.images = {};
  //     const keys = Object.keys(object.images);
  //     for (let i = 0; i < keys.length; ++i) {
  //       const key = keys[i];
  //       if (typeof object.images[key] === "string") {
  //         base64.decode(
  //           object.images[key],
  //           (message.images[key] = new Uint8Array(
  //             base64.length(object.images[key])
  //           )),
  //           0
  //         );
  //       } else if (object.images[key].length >= 0) {
  //         message.images[key] = object.images[key];
  //       }
  //     }
  //   }
  //   if (object.sprites) {
  //     if (!Array.isArray(object.sprites)) {
  //       throw TypeError(
  //         ".com.opensource.svga.MovieEntity.sprites: array expected"
  //       );
  //     }
  //     message.sprites = [];
  //     for (let i = 0; i < object.sprites.length; ++i) {
  //       if (typeof object.sprites[i] !== "object") {
  //         throw TypeError(
  //           ".com.opensource.svga.MovieEntity.sprites: object expected"
  //         );
  //       }
  //       message.sprites[i] = SpriteEntity.fromObject(object.sprites[i]);
  //     }
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from a MovieEntity message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {com.opensource.svga.MovieEntity} message MovieEntity
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: MovieEntity,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }
  //   const object: Record<string, any> = {};
  //   if (options.arrays || options.defaults) {
  //     object.sprites = [];
  //   }
  //   if (options.objects || options.defaults) {
  //     object.images = {};
  //   }
  //   if (options.defaults) {
  //     object.version = "";
  //     object.params = null;
  //   }
  //   if (message.version != null && message.hasOwnProperty("version")) {
  //     object.version = message.version;
  //   }
  //   if (message.params != null && message.hasOwnProperty("params")) {
  //     object.params = MovieParams.toObject(message.params, options);
  //   }
  //   let keys2;
  //   if (message.images && (keys2 = Object.keys(message.images)).length) {
  //     object.images = {};
  //     for (let j = 0; j < keys2.length; ++j) {
  //       const key = keys2[j];
  //       object.images[key] =
  //         options.bytes === String
  //           ? base64.encode(message.images[key], 0, message.images[key].length)
  //           : options.bytes === Array
  //           ? [...message.images[key]]
  //           : message.images[key];
  //     }
  //   }
  //   if (message.sprites && message.sprites.length) {
  //     object.sprites = [];
  //     for (let j = 0; j < message.sprites.length; ++j) {
  //       object.sprites[j] = SpriteEntity.toObject(message.sprites[j], options);
  //     }
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for MovieEntity
   * @function getTypeUrl
   * @memberof com.opensource.svga.MovieEntity
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string) {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.MovieEntity";
  // }

  /**
   * MovieEntity version.
   * @member {string} version
   * @memberof com.opensource.svga.MovieEntity
   * @instance
   */
  version: string = "";
  /**
   * MovieEntity params.
   * @member {com.opensource.svga.IMovieParams|null|undefined} params
   * @memberof com.opensource.svga.MovieEntity
   * @instance
   */
  params: MovieParams | null = null;
  /**
   * MovieEntity images.
   * @member {Object.<string,Uint8Array>} images
   * @memberof com.opensource.svga.MovieEntity
   * @instance
   */
  images: Record<string, Uint8Array> = emptyObject;
  /**
   * MovieEntity sprites.
   * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
   * @memberof com.opensource.svga.MovieEntity
   * @instance
   */
  sprites: SpriteEntity[] = [];

  /**
   * Constructs a new MovieEntity.
   * @memberof com.opensource.svga
   * @classdesc Represents a MovieEntity.
   * @implements IMovieEntity
   * @constructor
   * @param {com.opensource.svga.IMovieEntity=} [properties] Properties to set
   */
  constructor(properties?: MovieEntityProps) {
    if (properties) {
      if (properties.version != null) {
        this.version = properties.version;
      }

      if (properties.images != null) {
        this.images = properties.images;
      }

      if (properties.params != null) {
        this.params = properties.params;
      }

      if (properties.sprites != null) {
        this.sprites = properties.sprites;
      }
    }
  }

  /**
   * Converts this MovieEntity to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.MovieEntity
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON() {
  //   return MovieEntity.toObject(this, toJSONOptions);
  // }
}
