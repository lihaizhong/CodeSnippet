import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
import Layout, { LayoutReader } from "./Layout";
import Transform, { TransformReader } from "./Transform";
import ShapeEntity, { ShapeEntityReader } from "./ShapeEntity";
// import { isString, toJSONOptions } from "../utils";

/**
 * Properties of a FrameEntity.
 * @memberof com.opensource.svga
 * @interface IFrameEntity
 * @property {number|null} [alpha] FrameEntity alpha
 * @property {com.opensource.svga.ILayout|null} [layout] FrameEntity layout
 * @property {com.opensource.svga.ITransform|null} [transform] FrameEntity transform
 * @property {string|null} [clipPath] FrameEntity clipPath
 * @property {Array.<com.opensource.svga.IShapeEntity>|null} [shapes] FrameEntity shapes
 */
export interface FrameEntityProps {
  alpha: number | null;
  layout: Layout | null;
  transform: Transform | null;
  clipPath: string | null;
  shapes: ShapeEntity[] | null;
}

export class FrameEntityWriter {
  /**
   * Encodes the specified FrameEntity message. Does not implicitly {@link com.opensource.svga.FrameEntity.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {com.opensource.svga.IFrameEntity} message FrameEntity message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: FrameEntity, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (message.alpha != null && Object.hasOwn(message, "alpha")) {
  //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.alpha);
  //   }
  //   if (message.layout != null && Object.hasOwn(message, "layout")) {
  //     Layout.encode(
  //       message.layout,
  //       writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
  //     ).ldelim();
  //   }
  //   if (message.transform != null && Object.hasOwn(message, "transform")) {
  //     Transform.encode(
  //       message.transform,
  //       writer.uint32(/* id 3, wireType 2 =*/ 26).fork()
  //     ).ldelim();
  //   }
  //   if (message.clipPath != null && Object.hasOwn(message, "clipPath")) {
  //     writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.clipPath);
  //   }
  //   if (message.shapes != null && message.shapes.length) {
  //     for (let i = 0; i < message.shapes.length; ++i) {
  //       ShapeEntity.encode(
  //         message.shapes[i],
  //         writer.uint32(/* id 5, wireType 2 =*/ 42).fork()
  //       ).ldelim();
  //     }
  //   }
  //   return writer;
  // }
  /**
   * Encodes the specified FrameEntity message, length delimited. Does not implicitly {@link com.opensource.svga.FrameEntity.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {com.opensource.svga.IFrameEntity} message FrameEntity message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: FrameEntity, writer: Writer): Writer {
  //   return FrameEntity.encode(message, writer).ldelim();
  // }
}

export class FrameEntityReader {
  /**
   * Decodes a FrameEntity message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.FrameEntity} FrameEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): FrameEntity {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new FrameEntity();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.alpha = reader.float();
          break;
        }
        case 2: {
          message.layout = LayoutReader.decode(reader, reader.uint32());
          break;
        }
        case 3: {
          message.transform = TransformReader.decode(reader, reader.uint32());
          break;
        }
        case 4: {
          message.clipPath = reader.string();
          break;
        }
        case 5: {
          if (!(message.shapes && message.shapes.length)) {
            message.shapes = [];
          }
          message.shapes.push(ShapeEntityReader.decode(reader, reader.uint32()));
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
   * Decodes a FrameEntity message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.FrameEntity} FrameEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): FrameEntity {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class FrameEntity {
  /**
   * Creates a new FrameEntity instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {com.opensource.svga.IFrameEntity=} [properties] Properties to set
   * @returns {com.opensource.svga.FrameEntity} FrameEntity instance
   */
  static create(properties?: FrameEntityProps): FrameEntity {
    return new FrameEntity(properties);
  }
  /**
   * Verifies a FrameEntity message.
   * @function verify
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  // static verify(message: Record<string, any>): string | null {
  //   if (typeof message !== "object" || message === null) {
  //     return "object expected";
  //   }
  //   if (message.alpha != null && message.hasOwnProperty("alpha")) {
  //     if (typeof message.alpha !== "number") {
  //       return "alpha: number expected";
  //     }
  //   }
  //   if (message.layout != null && message.hasOwnProperty("layout")) {
  //     const error = Layout.verify(message.layout);
  //     if (error) {
  //       return "layout." + error;
  //     }
  //   }
  //   if (message.transform != null && message.hasOwnProperty("transform")) {
  //     const error = Transform.verify(message.transform);
  //     if (error) {
  //       return "transform." + error;
  //     }
  //   }
  //   if (message.clipPath != null && message.hasOwnProperty("clipPath")) {
  //     if (!isString(message.clipPath)) {
  //       return "clipPath: string expected";
  //     }
  //   }
  //   if (message.shapes != null && message.hasOwnProperty("shapes")) {
  //     if (!Array.isArray(message.shapes)) {
  //       return "shapes: array expected";
  //     }
  //     for (let i = 0; i < message.shapes.length; ++i) {
  //       const error = ShapeEntity.verify(message.shapes[i]);
  //       if (error) {
  //         return "shapes." + error;
  //       }
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates a FrameEntity message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.FrameEntity} FrameEntity
   */
  // static fromObject(object: Record<string, any>): FrameEntity {
  //   if (object instanceof FrameEntity) {
  //     return object;
  //   }
  //   const message = new FrameEntity();
  //   if (object.alpha != null) {
  //     message.alpha = +object.alpha;
  //   }
  //   if (object.layout != null) {
  //     if (typeof object.layout !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.FrameEntity.layout: object expected"
  //       );
  //     }
  //     message.layout = Layout.fromObject(object.layout);
  //   }
  //   if (object.transform != null) {
  //     if (typeof object.transform !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.FrameEntity.transform: object expected"
  //       );
  //     }
  //     message.transform = Transform.fromObject(object.transform);
  //   }
  //   if (object.clipPath != null) {
  //     message.clipPath = String(object.clipPath);
  //   }
  //   if (object.shapes) {
  //     if (!Array.isArray(object.shapes)) {
  //       throw TypeError(
  //         ".com.opensource.svga.FrameEntity.shapes: array expected"
  //       );
  //     }
  //     message.shapes = [];
  //     for (let i = 0; i < object.shapes.length; ++i) {
  //       if (typeof object.shapes[i] !== "object") {
  //         throw TypeError(
  //           ".com.opensource.svga.FrameEntity.shapes: object expected"
  //         );
  //       }
  //       message.shapes[i] = ShapeEntity.fromObject(object.shapes[i]);
  //     }
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from a FrameEntity message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {com.opensource.svga.FrameEntity} message FrameEntity
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: FrameEntity,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }
  //   const object: Record<string, any> = {};
  //   if (options.arrays || options.defaults) {
  //     object.shapes = [];
  //   }
  //   if (options.defaults) {
  //     object.alpha = 0;
  //     object.layout = null;
  //     object.transform = null;
  //     object.clipPath = "";
  //   }
  //   if (message.alpha != null && message.hasOwnProperty("alpha")) {
  //     object.alpha =
  //       options.json && !isFinite(message.alpha)
  //         ? "" + message.alpha
  //         : message.alpha;
  //   }
  //   if (message.layout != null && message.hasOwnProperty("layout")) {
  //     object.layout = Layout.toObject(message.layout, options);
  //   }
  //   if (message.transform != null && message.hasOwnProperty("transform")) {
  //     object.transform = Transform.toObject(message.transform, options);
  //   }
  //   if (message.clipPath != null && message.hasOwnProperty("clipPath")) {
  //     object.clipPath = message.clipPath;
  //   }
  //   if (message.shapes && message.shapes.length) {
  //     object.shapes = [];
  //     for (let j = 0; j < message.shapes.length; ++j) {
  //       object.shapes[j] = ShapeEntity.toObject(message.shapes[j], options);
  //     }
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for FrameEntity
   * @function getTypeUrl
   * @memberof com.opensource.svga.FrameEntity
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.FrameEntity";
  // }

  /**
   * FrameEntity shapes.
   * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  shapes: ShapeEntity[] = [];
  /**
   * FrameEntity alpha.
   * @member {number} alpha
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  alpha: number = 0;
  /**
   * FrameEntity layout.
   * @member {com.opensource.svga.ILayout|null|undefined} layout
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  layout: Layout | null = null;
  /**
   * FrameEntity transform.
   * @member {com.opensource.svga.ITransform|null|undefined} transform
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  transform: Transform | null = null;
  /**
   * FrameEntity clipPath.
   * @member {string} clipPath
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   */
  clipPath: string = "";

  /**
   * Constructs a new FrameEntity.
   * @memberof com.opensource.svga
   * @classdesc Represents a FrameEntity.
   * @implements IFrameEntity
   * @constructor
   * @param {com.opensource.svga.IFrameEntity=} [properties] Properties to set
   */
  constructor(properties?: FrameEntityProps) {
    if (properties) {
      if (properties.alpha != null) {
        this.alpha = properties.alpha;
      }

      if (properties.clipPath != null) {
        this.clipPath = properties.clipPath;
      }

      if (properties.layout != null) {
        this.layout = properties.layout;
      }

      if (properties.shapes != null) {
        this.shapes = properties.shapes;
      }

      if (properties.transform != null) {
        this.transform = properties.transform;
      }
    }
  }

  /**
   * Converts this FrameEntity to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.FrameEntity
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON() {
  //   return FrameEntity.toObject(this, toJSONOptions);
  // }
}
