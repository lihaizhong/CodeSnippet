import Reader from "../../serialization/Reader";
/**
 * Properties of a RGBAColor.
 * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
 * @interface IRGBAColor
 * @property {number|null} [r] RGBAColor r
 * @property {number|null} [g] RGBAColor g
 * @property {number|null} [b] RGBAColor b
 * @property {number|null} [a] RGBAColor a
 */
export interface RGBAColorProps {
    r: number | null;
    g: number | null;
    b: number | null;
    a: number | null;
}
export declare class RGBAColorWriter {
}
export declare class RGBAColorReader {
    /**
     * Decodes a RGBAColor message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader | Uint8Array, length?: number): RGBAColor;
    /**
     * Decodes a RGBAColor message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: Reader | Uint8Array): RGBAColor;
}
export default class RGBAColor {
    /**
     * Creates a new RGBAColor instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor instance
     */
    static create(properties: RGBAColorProps): RGBAColor;
    /**
     * Verifies a RGBAColor message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    /**
     * Creates a RGBAColor message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     */
    /**
     * Creates a plain object from a RGBAColor message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} message RGBAColor
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    /**
     * Gets the default type url for RGBAColor
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    /**
     * RGBAColor r.
     * @member {number} r
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    r: number;
    /**
     * RGBAColor g.
     * @member {number} g
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    g: number;
    /**
     * RGBAColor b.
     * @member {number} b
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    b: number;
    /**
     * RGBAColor a.
     * @member {number} a
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    a: number;
    /**
     * Constructs a new RGBAColor.
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @classdesc Represents a RGBAColor.
     * @implements IRGBAColor
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
     */
    constructor(properties?: RGBAColorProps);
}
