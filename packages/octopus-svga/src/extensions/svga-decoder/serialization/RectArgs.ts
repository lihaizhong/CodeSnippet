import Reader from "../io/Reader";

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

export default class RectArgs {
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
    reader = Reader.create(reader);
    const end = length === void 0 ? reader.len : reader.pos + length;
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
      if (properties.x !== null) {
        this.x = properties.x
      }

      if (properties.y !== null) {
        this.y = properties.y
      }

      if (properties.width !== null) {
        this.width = properties.width
      }

      if (properties.height !== null) {
        this.height = properties.height
      }

      if (properties.cornerRadius !== null) {
        this.cornerRadius = properties.cornerRadius
      }
    }
  }
}
