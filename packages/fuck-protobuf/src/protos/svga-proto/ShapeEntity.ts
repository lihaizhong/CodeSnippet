import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
import Transform, { TransformReader } from "./Transform";
import ShapeType from "./ShapeType";
import ShapeArgs, { ShapeArgsReader } from "./ShapeArgs";
import RectArgs, { RectArgsReader } from "./RectArgs";
import EllipseArgs, { EllipseArgsReader } from "./EllipseArgs";
import ShapeStyle, { ShapeStyleReader } from "./ShapeStyle";
// import { toJSONOptions } from "../utils";

/**
 * Properties of a ShapeEntity.
 * @memberof com.opensource.svga
 * @interface IShapeEntity
 * @property {com.opensource.svga.ShapeEntity.ShapeType|null} [type] ShapeEntity type
 * @property {com.opensource.svga.ShapeEntity.IShapeArgs|null} [shape] ShapeEntity shape
 * @property {com.opensource.svga.ShapeEntity.IRectArgs|null} [rect] ShapeEntity rect
 * @property {com.opensource.svga.ShapeEntity.IEllipseArgs|null} [ellipse] ShapeEntity ellipse
 * @property {com.opensource.svga.ShapeEntity.IShapeStyle|null} [styles] ShapeEntity styles
 * @property {com.opensource.svga.ITransform|null} [transform] ShapeEntity transform
 */
export interface ShapeEntityProps {
  type: ShapeType | null;
  shape: ShapeArgs | null;
  rect: RectArgs | null;
  ellipse: EllipseArgs | null;
  styles: ShapeStyle | null;
  transform: Transform | null;
}

export class ShapeEntityWriter {
  /**
   * Encodes the specified ShapeEntity message. Does not implicitly {@link com.opensource.svga.ShapeEntity.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {com.opensource.svga.IShapeEntity} message ShapeEntity message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: ShapeEntity, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (message.type != null && Object.hasOwn(message, "type")) {
  //     writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.type);
  //   }
  //   if (message.shape != null && Object.hasOwn(message, "shape")) {
  //     ShapeArgs.encode(
  //       message.shape,
  //       writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
  //     ).ldelim();
  //   }
  //   if (message.rect != null && Object.hasOwn(message, "rect")) {
  //     RectArgs.encode(
  //       message.rect,
  //       writer.uint32(/* id 3, wireType 2 =*/ 26).fork()
  //     ).ldelim();
  //   }
  //   if (message.ellipse != null && Object.hasOwn(message, "ellipse")) {
  //     EllipseArgs.encode(
  //       message.ellipse,
  //       writer.uint32(/* id 4, wireType 2 =*/ 34).fork()
  //     ).ldelim();
  //   }
  //   if (message.styles != null && Object.hasOwn(message, "styles")) {
  //     ShapeStyle.encode(
  //       message.styles,
  //       writer.uint32(/* id 10, wireType 2 =*/ 82).fork()
  //     ).ldelim();
  //   }
  //   if (message.transform != null && Object.hasOwn(message, "transform")) {
  //     Transform.encode(
  //       message.transform,
  //       writer.uint32(/* id 11, wireType 2 =*/ 90).fork()
  //     ).ldelim();
  //   }

  //   return writer;
  // }
  /**
   * Encodes the specified ShapeEntity message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {com.opensource.svga.IShapeEntity} message ShapeEntity message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: ShapeEntity, writer: Writer): Writer {
  //   return ShapeEntity.encode(message, writer).ldelim();
  // }
}

export class ShapeEntityReader {
  /**
   * Decodes a ShapeEntity message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): ShapeEntity {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new ShapeEntity();
    while (reader.pos < end) {
      let tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.type = reader.int32();
          break;
        }
        case 2: {
          message.shape = ShapeArgsReader.decode(reader, reader.uint32());
          break;
        }
        case 3: {
          message.rect = RectArgsReader.decode(reader, reader.uint32());
          break;
        }
        case 4: {
          message.ellipse = EllipseArgsReader.decode(
            reader,
            reader.uint32()
          );
          break;
        }
        case 10: {
          message.styles = ShapeStyleReader.decode(
            reader,
            reader.uint32()
          );
          break;
        }
        case 11: {
          message.transform = TransformReader.decode(reader, reader.uint32());
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
   * Decodes a ShapeEntity message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): ShapeEntity {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class ShapeEntity {
  /**
   * Creates a new ShapeEntity instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {com.opensource.svga.IShapeEntity=} [properties] Properties to set
   * @returns {com.opensource.svga.ShapeEntity} ShapeEntity instance
   */
  static create(properties: ShapeEntityProps): ShapeEntity {
    return new ShapeEntity(properties);
  }
  /**
   * Verifies a ShapeEntity message.
   * @function verify
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  // static verify(message: Record<string, any>): string | null {
  //   if (typeof message !== "object" || message === null) {
  //     return "object expected";
  //   }
  //   const properties: Record<string, any> = {};
  //   if (message.type != null && message.hasOwnProperty("type"))
  //     switch (message.type) {
  //       default:
  //         return "type: enum value expected";
  //       case 0:
  //       case 1:
  //       case 2:
  //       case 3:
  //         break;
  //     }
  //   if (message.shape != null && message.hasOwnProperty("shape")) {
  //     properties.args = 1;
  //     {
  //       let error = ShapeEntity.ShapeArgs.verify(message.shape);
  //       if (error) {
  //         return "shape." + error;
  //       }
  //     }
  //   }
  //   if (message.rect != null && message.hasOwnProperty("rect")) {
  //     if (properties.args === 1) {
  //       return "args: multiple values";
  //     }
  //     properties.args = 1;
  //     {
  //       const error = ShapeEntity.RectArgs.verify(message.rect);
  //       if (error) {
  //         return "rect." + error;
  //       }
  //     }
  //   }
  //   if (message.ellipse != null && message.hasOwnProperty("ellipse")) {
  //     if (properties.args === 1) {
  //       return "args: multiple values";
  //     }
  //     properties.args = 1;
  //     const error = ShapeEntity.EllipseArgs.verify(message.ellipse);
  //     if (error) {
  //       return "ellipse." + error;
  //     }
  //   }
  //   if (message.styles != null && message.hasOwnProperty("styles")) {
  //     const error = ShapeEntity.ShapeStyle.verify(message.styles);
  //     if (error) {
  //       return "styles." + error;
  //     }
  //   }
  //   if (message.transform != null && message.hasOwnProperty("transform")) {
  //     const error = Transform.verify(message.transform);
  //     if (error) {
  //       return "transform." + error;
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates a ShapeEntity message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
   */
  // static fromObject(object: Record<string, any>): ShapeEntity {
  //   if (object instanceof ShapeEntity) {
  //     return object;
  //   }
  //   const message = new ShapeEntity();
  //   switch (object.type) {
  //     default:
  //       if (typeof object.type === "number") {
  //         message.type = object.type;
  //         break;
  //       }
  //       break;
  //     case "SHAPE":
  //     case 0:
  //       message.type = 0;
  //       break;
  //     case "RECT":
  //     case 1:
  //       message.type = 1;
  //       break;
  //     case "ELLIPSE":
  //     case 2:
  //       message.type = 2;
  //       break;
  //     case "KEEP":
  //     case 3:
  //       message.type = 3;
  //       break;
  //   }
  //   if (object.shape != null) {
  //     if (typeof object.shape !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.ShapeEntity.shape: object expected"
  //       );
  //     }
  //     message.shape = ShapeArgs.fromObject(object.shape);
  //   }
  //   if (object.rect != null) {
  //     if (typeof object.rect !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.ShapeEntity.rect: object expected"
  //       );
  //     }
  //     message.rect = RectArgs.fromObject(object.rect);
  //   }
  //   if (object.ellipse != null) {
  //     if (typeof object.ellipse !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.ShapeEntity.ellipse: object expected"
  //       );
  //     }
  //     message.ellipse = EllipseArgs.fromObject(object.ellipse);
  //   }
  //   if (object.styles != null) {
  //     if (typeof object.styles !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.ShapeEntity.styles: object expected"
  //       );
  //     }
  //     message.styles = ShapeStyle.fromObject(object.styles);
  //   }
  //   if (object.transform != null) {
  //     if (typeof object.transform !== "object") {
  //       throw TypeError(
  //         ".com.opensource.svga.ShapeEntity.transform: object expected"
  //       );
  //     }
  //     message.transform = Transform.fromObject(object.transform);
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from a ShapeEntity message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {com.opensource.svga.ShapeEntity} message ShapeEntity
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: ShapeEntity,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }
  //   const object: Record<string, any> = {};
  //   if (options.defaults) {
  //     object.type = options.enums === String ? "SHAPE" : 0;
  //     object.styles = null;
  //     object.transform = null;
  //   }
  //   if (message.type != null && message.hasOwnProperty("type")) {
  //     object.type =
  //       options.enums === String
  //         ? ShapeType[message.type] === undefined
  //           ? message.type
  //           : ShapeType[message.type]
  //         : message.type;
  //   }
  //   if (message.shape != null && message.hasOwnProperty("shape")) {
  //     object.shape = ShapeEntity.ShapeArgs.toObject(message.shape, options);
  //     if (options.oneofs) {
  //       object.args = "shape";
  //     }
  //   }
  //   if (message.rect != null && message.hasOwnProperty("rect")) {
  //     object.rect = ShapeEntity.RectArgs.toObject(message.rect, options);
  //     if (options.oneofs) {
  //       object.args = "rect";
  //     }
  //   }
  //   if (message.ellipse != null && message.hasOwnProperty("ellipse")) {
  //     object.ellipse = ShapeEntity.EllipseArgs.toObject(
  //       message.ellipse,
  //       options
  //     );
  //     if (options.oneofs) {
  //       object.args = "ellipse";
  //     }
  //   }
  //   if (message.styles != null && message.hasOwnProperty("styles")) {
  //     object.styles = ShapeEntity.ShapeStyle.toObject(message.styles, options);
  //   }
  //   if (message.transform != null && message.hasOwnProperty("transform")) {
  //     object.transform = Transform.toObject(message.transform, options);
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for ShapeEntity
   * @function getTypeUrl
   * @memberof com.opensource.svga.ShapeEntity
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.ShapeEntity";
  // }

  /**
   * ShapeEntity type.
   * @member {com.opensource.svga.ShapeEntity.ShapeType} type
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  type: ShapeType = 0;
  /**
   * ShapeEntity shape.
   * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  shape: ShapeArgs | null = null;
  /**
   * ShapeEntity rect.
   * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  rect: RectArgs | null = null;
  /**
   * ShapeEntity ellipse.
   * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  ellipse: EllipseArgs | null = null;
  /**
   * ShapeEntity styles.
   * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  styles: ShapeStyle | null = null;
  /**
   * ShapeEntity transform.
   * @member {com.opensource.svga.ITransform|null|undefined} transform
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   */
  transform: Transform | null = null;

  private $oneOfFields: ["shape", "rect", "ellipse"] = [
    "shape",
    "rect",
    "ellipse",
  ];

  private $fieldMap: Record<string, number> = {};

  get args() {
    const keys = Object.keys(this) as ["shape", "rect", "ellipse"];
    for (let i = keys.length - 1; i > -1; --i) {
      const key = keys[i];
      const value = this[key];
      if (this.$fieldMap[key] === 1 && value != null) {
        return key;
      }
    }

    return "" as "shape" | "rect" | "ellipse";
  }

  set args(name: "shape" | "rect" | "ellipse") {
    for (var i = 0; i < this.$oneOfFields.length; ++i) {
      const key = this.$oneOfFields[i];
      if (key !== name) {
        delete this[key];
      }
    }
  }

  /**
   * Constructs a new ShapeEntity.
   * @memberof com.opensource.svga
   * @classdesc Represents a ShapeEntity.
   * @implements IShapeEntity
   * @constructor
   * @param {com.opensource.svga.IShapeEntity=} [properties] Properties to set
   */
  constructor(properties?: ShapeEntityProps) {
    if (properties) {
      if (properties.type != null) {
        this.type = properties.type;
      }

      if (properties.ellipse != null) {
        this.ellipse = properties.ellipse;
      }

      if (properties.rect != null) {
        this.rect = properties.rect;
      }

      if (properties.shape != null) {
        this.shape = properties.shape;
      }

      if (properties.styles != null) {
        this.styles = properties.styles;
      }

      if (properties.transform != null) {
        this.transform = properties.transform;
      }
    }

    for (var i = 0; i < this.$oneOfFields.length; ++i) {
      this.$fieldMap[this.$oneOfFields[i]] = 1;
    }
  }

  /**
   * Converts this ShapeEntity to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.ShapeEntity
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON() {
  //   return ShapeEntity.toObject(this, toJSONOptions);
  // }
}
