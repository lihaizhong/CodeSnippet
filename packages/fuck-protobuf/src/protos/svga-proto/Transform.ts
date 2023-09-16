import Reader from "../../serialization/Reader";
// import Writer from "../serialization/Writer";
// import { toJSONOptions } from "../utils";

/**
 * Properties of a Transform.
 * @memberof com.opensource.svga
 * @interface ITransform
 * @property {number|null} [a] Transform a
 * @property {number|null} [b] Transform b
 * @property {number|null} [c] Transform c
 * @property {number|null} [d] Transform d
 * @property {number|null} [tx] Transform tx
 * @property {number|null} [ty] Transform ty
 */
export interface TransformProps {
  a: number | null;
  b: number | null;
  c: number | null;
  d: number | null;
  tx: number | null;
  ty: number | null;
}

export class TransformWriter {
  /**
   * Encodes the specified Transform message. Does not implicitly {@link com.opensource.svga.Transform.verify|verify} messages.
   * @function encode
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {com.opensource.svga.ITransform} message Transform message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encode(message: Transform, writer: Writer): Writer {
  //   if (!writer) {
  //     writer = Writer.create();
  //   }
  //   if (message.a != null && Object.hasOwn(message, "a")) {
  //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.a);
  //   }
  //   if (message.b != null && Object.hasOwn(message, "b")) {
  //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.b);
  //   }
  //   if (message.c != null && Object.hasOwn(message, "c")) {
  //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.c);
  //   }
  //   if (message.d != null && Object.hasOwn(message, "d")) {
  //     writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.d);
  //   }
  //   if (message.tx != null && Object.hasOwn(message, "tx")) {
  //     writer.uint32(/* id 5, wireType 5 =*/ 45).float(message.tx);
  //   }
  //   if (message.ty != null && Object.hasOwn(message, "ty")) {
  //     writer.uint32(/* id 6, wireType 5 =*/ 53).float(message.ty);
  //   }
  //   return writer;
  // }
  /**
   * Encodes the specified Transform message, length delimited. Does not implicitly {@link com.opensource.svga.Transform.verify|verify} messages.
   * @function encodeDelimited
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {com.opensource.svga.ITransform} message Transform message or plain object to encode
   * @param {$protobuf.Writer} [writer] Writer to encode to
   * @returns {$protobuf.Writer} Writer
   */
  // static encodeDelimited(message: Transform, writer: Writer): Writer {
  //   return Transform.encode(message, writer).ldelim();
  // }
}

export class TransformReader {
  /**
   * Decodes a Transform message from the specified reader or buffer.
   * @function decode
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @param {number} [length] Message length if known beforehand
   * @returns {com.opensource.svga.Transform} Transform
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decode(reader: Reader | Uint8Array, length?: number): Transform {
    if (!(reader instanceof Reader)) {
      reader = Reader.create(reader);
    }
    let end = length === undefined ? reader.len : reader.pos + length;
    let message = new Transform();
    while (reader.pos < end) {
      let tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          message.a = reader.float();
          break;
        }
        case 2: {
          message.b = reader.float();
          break;
        }
        case 3: {
          message.c = reader.float();
          break;
        }
        case 4: {
          message.d = reader.float();
          break;
        }
        case 5: {
          message.tx = reader.float();
          break;
        }
        case 6: {
          message.ty = reader.float();
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
   * Decodes a Transform message from the specified reader or buffer, length delimited.
   * @function decodeDelimited
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
   * @returns {com.opensource.svga.Transform} Transform
   * @throws {Error} If the payload is not a reader or valid buffer
   * @throws {$protobuf.util.ProtocolError} If required fields are missing
   */
  static decodeDelimited(reader: Reader | Uint8Array): Transform {
    if (!(reader instanceof Reader)) {
      reader = new Reader(reader);
    }

    return this.decode(reader, reader.uint32());
  }
}

export default class Transform {
  /**
   * Creates a new Transform instance using the specified properties.
   * @function create
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {com.opensource.svga.ITransform=} [properties] Properties to set
   * @returns {com.opensource.svga.Transform} Transform instance
   */
  static create(properties: TransformProps): Transform {
    return new Transform(properties);
  }
  /**
   * Verifies a Transform message.
   * @function verify
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {Object.<string,*>} message Plain object to verify
   * @returns {string|null} `null` if valid, otherwise the reason why it is not
   */
  // static verify(message: Record<string, any>) {
  //   if (typeof message !== "object" || message === null) {
  //     return "object expected";
  //   }
  //   if (message.a != null && message.hasOwnProperty("a")) {
  //     if (typeof message.a !== "number") {
  //       return "a: number expected";
  //     }
  //   }
  //   if (message.b != null && message.hasOwnProperty("b")) {
  //     if (typeof message.b !== "number") {
  //       return "b: number expected";
  //     }
  //   }
  //   if (message.c != null && message.hasOwnProperty("c")) {
  //     if (typeof message.c !== "number") {
  //       return "c: number expected";
  //     }
  //   }
  //   if (message.d != null && message.hasOwnProperty("d")) {
  //     if (typeof message.d !== "number") {
  //       return "d: number expected";
  //     }
  //   }
  //   if (message.tx != null && message.hasOwnProperty("tx")) {
  //     if (typeof message.tx !== "number") {
  //       return "tx: number expected";
  //     }
  //   }
  //   if (message.ty != null && message.hasOwnProperty("ty")) {
  //     if (typeof message.ty !== "number") {
  //       return "ty: number expected";
  //     }
  //   }

  //   return null;
  // }
  /**
   * Creates a Transform message from a plain object. Also converts values to their respective internal types.
   * @function fromObject
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {Object.<string,*>} object Plain object
   * @returns {com.opensource.svga.Transform} Transform
   */
  // static fromObject(object: Record<string, any>): Transform {
  //   if (object instanceof Transform) {
  //     return object;
  //   }
  //   let message = new Transform();
  //   if (object.a != null) {
  //     message.a = +object.a;
  //   }
  //   if (object.b != null) {
  //     message.b = +object.b;
  //   }
  //   if (object.c != null) {
  //     message.c = +object.c;
  //   }
  //   if (object.d != null) {
  //     message.d = +object.d;
  //   }
  //   if (object.tx != null) {
  //     message.tx = +object.tx;
  //   }
  //   if (object.ty != null) {
  //     message.ty = +object.ty;
  //   }

  //   return message;
  // }
  /**
   * Creates a plain object from a Transform message. Also converts values to other types if specified.
   * @function toObject
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {com.opensource.svga.Transform} message Transform
   * @param {$protobuf.IConversionOptions} [options] Conversion options
   * @returns {Object.<string,*>} Plain object
   */
  // static toObject(
  //   message: Transform,
  //   options: Record<string, any>
  // ): Record<string, any> {
  //   if (!options) {
  //     options = {};
  //   }
  //   let object: Record<string, any> = {};
  //   if (options.defaults) {
  //     object.a = 0;
  //     object.b = 0;
  //     object.c = 0;
  //     object.d = 0;
  //     object.tx = 0;
  //     object.ty = 0;
  //   }
  //   if (message.a != null && message.hasOwnProperty("a")) {
  //     object.a =
  //       options.json && !isFinite(message.a) ? "" + message.a : message.a;
  //   }
  //   if (message.b != null && message.hasOwnProperty("b")) {
  //     object.b =
  //       options.json && !isFinite(message.b) ? "" + message.b : message.b;
  //   }
  //   if (message.c != null && message.hasOwnProperty("c")) {
  //     object.c =
  //       options.json && !isFinite(message.c) ? "" + message.c : message.c;
  //   }
  //   if (message.d != null && message.hasOwnProperty("d")) {
  //     object.d =
  //       options.json && !isFinite(message.d) ? "" + message.d : message.d;
  //   }
  //   if (message.tx != null && message.hasOwnProperty("tx")) {
  //     object.tx =
  //       options.json && !isFinite(message.tx) ? "" + message.tx : message.tx;
  //   }
  //   if (message.ty != null && message.hasOwnProperty("ty")) {
  //     object.ty =
  //       options.json && !isFinite(message.ty) ? "" + message.ty : message.ty;
  //   }

  //   return object;
  // }
  /**
   * Gets the default type url for Transform
   * @function getTypeUrl
   * @memberof com.opensource.svga.Transform
   * @static
   * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
   * @returns {string} The default type url
   */
  // static getTypeUrl(typeUrlPrefix?: string): string {
  //   if (typeUrlPrefix === undefined) {
  //     typeUrlPrefix = "type.googleapis.com";
  //   }

  //   return typeUrlPrefix + "/com.opensource.svga.Transform";
  // }

  /**
   * Transform a.
   * @member {number} a
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  a: number = 0;
  /**
   * Transform b.
   * @member {number} b
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  b: number = 0;
  /**
   * Transform c.
   * @member {number} c
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  c: number = 0;
  /**
   * Transform d.
   * @member {number} d
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  d: number = 0;
  /**
   * Transform tx.
   * @member {number} tx
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  tx: number = 0;
  /**
   * Transform ty.
   * @member {number} ty
   * @memberof com.opensource.svga.Transform
   * @instance
   */
  ty: number = 0;

  /**
   * Constructs a new Transform.
   * @memberof com.opensource.svga
   * @classdesc Represents a Transform.
   * @implements ITransform
   * @constructor
   * @param {com.opensource.svga.ITransform=} [properties] Properties to set
   */
  constructor(properties?: TransformProps) {
    if (properties) {
      if (properties.a != null) {
        this.a = properties.a;
      }

      if (properties.b != null) {
        this.b = properties.b;
      }

      if (properties.c != null) {
        this.c = properties.c;
      }

      if (properties.d != null) {
        this.d = properties.d;
      }

      if (properties.tx != null) {
        this.tx = properties.tx;
      }

      if (properties.ty != null) {
        this.ty = properties.ty;
      }
    }
  }

  /**
   * Converts this Transform to JSON.
   * @function toJSON
   * @memberof com.opensource.svga.Transform
   * @instance
   * @returns {Object.<string,*>} JSON object
   */
  // toJSON() {
  //   return Transform.toObject(this, toJSONOptions);
  // }
}
