import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
// import { toJSONOptions } from "../utils";

/**
 * Properties of a Layout.
 * @memberof com.opensource.svga
 * @interface ILayout
 * @property {number|null} [x] Layout x
 * @property {number|null} [y] Layout y
 * @property {number|null} [width] Layout width
 * @property {number|null} [height] Layout height
 */
export interface LayoutProps {
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
}

export class LayoutWriter {
  /**
   * Encodes the specified Layout message. Does not implicitly {@link com.opensource.svga.Layout.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.Layout
   * @static
   * @param {com.opensource.svga.ILayout} message Layout message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: Layout, writer: Writer): Writer {
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

  //   return writer;
  // }
  /**
   * Encodes the specified Layout message, length delimited. Does not implicitly {@link com.opensource.svga.Layout.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.Layout
   * @static
   * @param {com.opensource.svga.ILayout} message Layout message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: Layout, writer: Writer): Writer {
  //   return Layout.encode(message, writer).ldelim();
  // }
}

export class LayoutReader {
  /**
   * Decodes a Layout message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.Layout
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.Layout} Layout
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): Layout {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new Layout();
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
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  }
  /**
   * Decodes a Layout message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.Layout
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.Layout} Layout
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): Layout {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class Layout {
  /**
   * Creates a new Layout instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.Layout
   * @static
   * @param {com.opensource.svga.ILayout=} [properties] Properties to set
   * @returns {com.opensource.svga.Layout} Layout instance
   */
  static create(properties?: LayoutProps): Layout {
    return new Layout(properties);
  }
  /**
   * Verifies a Layout message.
   * @function verify
   * @memberof com.opensource.svga.Layout
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

  //   return null;
  // }
  /**
   * Creates a Layout message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.Layout
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.Layout} Layout
   */
  // static fromObject(object: Record<string, any>): Layout {
  //   if (object instanceof Layout) {
  //     return object;
  //   }
  //   const message = new Layout();
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

  //   return message;
  // }
  /**
   * Creates a plain object from a Layout message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.Layout
   * @static
   * @param {com.opensource.svga.Layout} message Layout
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: Layout,
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

  //   return object;
  // }
  /**
   * Gets the default type url for Layout
   * @function getTypeUrl
   * @memberof com.opensource.svga.Layout
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.Layout";
  // }

  /**
   * Layout x.
   * @member {number} x
   * @memberof com.opensource.svga.Layout
   * @instance
   */
  x: number = 0;
  /**
   * Layout y.
   * @member {number} y
   * @memberof com.opensource.svga.Layout
   * @instance
   */
  y: number = 0;
  /**
   * Layout width.
   * @member {number} width
   * @memberof com.opensource.svga.Layout
   * @instance
   */
  width: number = 0;
  /**
   * Layout height.
   * @member {number} height
   * @memberof com.opensource.svga.Layout
   * @instance
   */
  height: number = 0;

  /**
   * Constructs a new Layout.
   * @memberof com.opensource.svga
   * @classdesc Represents a Layout.
   * @implements ILayout
   * @constructor
   * @param {com.opensource.svga.ILayout=} [properties] Properties to set
   */
  constructor(properties?: LayoutProps) {
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
    }
  }

  /**
   * Converts this Layout to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.Layout
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON() {
  //   return Layout.toObject(this, toJSONOptions);
  // }
}
