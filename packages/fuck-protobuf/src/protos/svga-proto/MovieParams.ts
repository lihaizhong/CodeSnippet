import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
// import { isInteger, toJSONOptions } from "../utils";

/**
 * Properties of a MovieParams.
 * @memberof com.opensource.svga
 * @interface IMovieParams
 * @property {number|null} [viewBoxWidth] MovieParams viewBoxWidth
 * @property {number|null} [viewBoxHeight] MovieParams viewBoxHeight
 * @property {number|null} [fps] MovieParams fps
 * @property {number|null} [frames] MovieParams frames
 */
export interface MovieParamsProps {
  viewBoxWidth: number | null;
  viewBoxHeight: number | null;
  fps: number | null;
  frames: number | null;
}

export class MovieParamsWriter {
  /**
   * Encodes the specified MovieParams message. Does not implicitly {@link com.opensource.svga.MovieParams.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {com.opensource.svga.IMovieParams} message MovieParams message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: MovieParams, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (
  //     message.viewBoxWidth != null &&
  //     Object.hasOwn(message, "viewBoxWidth")
  //   ) {
  //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.viewBoxWidth);
  //   }
  //   if (
  //     message.viewBoxHeight != null &&
  //     Object.hasOwn(message, "viewBoxHeight")
  //   ) {
  //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.viewBoxHeight);
  //   }
  //   if (message.fps != null && Object.hasOwn(message, "fps")) {
  //     writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.fps);
  //   }
  //   if (message.frames != null && Object.hasOwn(message, "frames")) {
  //     writer.uint32(/* id 4, wireType 0 =*/ 32).int32(message.frames);
  //   }
  //   return writer;
  // }
  /**
   * Encodes the specified MovieParams message, length delimited. Does not implicitly {@link com.opensource.svga.MovieParams.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {com.opensource.svga.IMovieParams} message MovieParams message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: MovieParams, writer: Writer): Writer {
  //   return MovieParams.encode(message, writer).ldelim();
  // }
}

export class MovieParamsReader {
  /**
   * Decodes a MovieParams message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.MovieParams} MovieParams
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): MovieParams {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }

    let end = length === undefined ? reader.len : reader.pos + length;
    let message = new MovieParams();
    while (reader.pos < end) {
      let tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.viewBoxWidth = reader.float();
          break;
        }
        case 2: {
          message.viewBoxHeight = reader.float();
          break;
        }
        case 3: {
          message.fps = reader.int32();
          break;
        }
        case 4: {
          message.frames = reader.int32();
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
   * Decodes a MovieParams message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.MovieParams} MovieParams
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): MovieParams {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class MovieParams {
  /**
   * Creates a new MovieParams instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {com.opensource.svga.IMovieParams=} [properties] Properties to set
   * @returns {com.opensource.svga.MovieParams} MovieParams instance
   */
  static create(properties?: MovieParamsProps): MovieParams {
    return new MovieParams(properties);
  }
  /**
   * Verifies a MovieParams message.
   * @function verify
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  // static verify(message: Record<string, any>): string | null {
  //   if (typeof message !== "object" || message === null) {
  //     return "object expected";
  //   }
  //   if (
  //     message.viewBoxWidth != null &&
  //     message.hasOwnProperty("viewBoxWidth")
  //   ) {
  //     if (typeof message.viewBoxWidth !== "number") {
  //       return "viewBoxWidth: number expected";
  //     }
  //   }
  //   if (
  //     message.viewBoxHeight != null &&
  //     message.hasOwnProperty("viewBoxHeight")
  //   ) {
  //     if (typeof message.viewBoxHeight !== "number") {
  //       return "viewBoxHeight: number expected";
  //     }
  //   }
  //   if (message.fps != null && message.hasOwnProperty("fps")) {
  //     if (!isInteger(message.fps)) {
  //       return "fps: integer expected";
  //     }
  //   }
  //   if (message.frames != null && message.hasOwnProperty("frames")) {
  //     if (!isInteger(message.frames)) {
  //       return "frames: integer expected";
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates a MovieParams message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.MovieParams} MovieParams
   */
  // static fromObject(object: Record<string, any>): MovieParams {
  //   if (object instanceof MovieParams) {
  //     return object;
  //   }

  //   const message = new MovieParams();
  //   if (object.viewBoxWidth != null) {
  //     message.viewBoxWidth = +object.viewBoxWidth;
  //   }
  //   if (object.viewBoxHeight != null) {
  //     message.viewBoxHeight = +object.viewBoxHeight;
  //   }
  //   if (object.fps != null) {
  //     message.fps = object.fps | 0;
  //   }
  //   if (object.frames != null) {
  //     message.frames = object.frames | 0;
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from a MovieParams message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {com.opensource.svga.MovieParams} message MovieParams
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: MovieParams,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }

  //   const object: Record<string, any> = {};
  //   if (options.defaults) {
  //     object.viewBoxWidth = 0;
  //     object.viewBoxHeight = 0;
  //     object.fps = 0;
  //     object.frames = 0;
  //   }
  //   if (
  //     message.viewBoxWidth != null &&
  //     message.hasOwnProperty("viewBoxWidth")
  //   ) {
  //     object.viewBoxWidth =
  //       options.json && !isFinite(message.viewBoxWidth)
  //         ? "" + message.viewBoxWidth
  //         : message.viewBoxWidth;
  //   }
  //   if (
  //     message.viewBoxHeight != null &&
  //     message.hasOwnProperty("viewBoxHeight")
  //   ) {
  //     object.viewBoxHeight =
  //       options.json && !isFinite(message.viewBoxHeight)
  //         ? "" + message.viewBoxHeight
  //         : message.viewBoxHeight;
  //   }
  //   if (message.fps != null && message.hasOwnProperty("fps")) {
  //     object.fps = message.fps;
  //   }
  //   if (message.frames != null && message.hasOwnProperty("frames")) {
  //     object.frames = message.frames;
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for MovieParams
   * @function getTypeUrl
   * @memberof com.opensource.svga.MovieParams
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.MovieParams";
  // }

  /**
   * MovieParams viewBoxWidth.
   * @member {number} viewBoxWidth
   * @memberof com.opensource.svga.MovieParams
   * @instance
   */
  viewBoxWidth: number = 0;
  /**
   * MovieParams viewBoxHeight.
   * @member {number} viewBoxHeight
   * @memberof com.opensource.svga.MovieParams
   * @instance
   */
  viewBoxHeight: number = 0;
  /**
   * MovieParams fps.
   * @member {number} fps
   * @memberof com.opensource.svga.MovieParams
   * @instance
   */
  fps: number = 0;
  /**
   * MovieParams frames.
   * @member {number} frames
   * @memberof com.opensource.svga.MovieParams
   * @instance
   */
  frames: number = 0;
  /**
   * Constructs a new MovieParams.
   * @memberof com.opensource.svga
   * @classdesc Represents a MovieParams.
   * @implements IMovieParams
   * @constructor
   * @param {com.opensource.svga.IMovieParams=} [properties] Properties to set
   */
  constructor(properties?: MovieParamsProps) {
    if (properties) {
      if (properties.viewBoxWidth != null) {
        this.viewBoxWidth = properties.viewBoxWidth;
      }

      if (properties.viewBoxHeight != null) {
        this.viewBoxHeight = properties.viewBoxHeight;
      }

      if (properties.fps != null) {
        this.fps = properties.fps;
      }

      if (properties.frames != null) {
        this.frames = properties.frames;
      }
    }
  }

  /**
   * Converts this MovieParams to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.MovieParams
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON() {
  //   return MovieParams.toObject(this, toJSONOptions);
  // }
}
