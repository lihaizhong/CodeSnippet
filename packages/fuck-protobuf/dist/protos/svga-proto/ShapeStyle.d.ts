import Reader from "../../serialization/Reader";
import LineCap from "./LineCap";
import LineJoin from "./LineJoin";
import RGBAColor from "./RGBAColor";
/**
 * Properties of a ShapeStyle.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IShapeStyle
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null} [fill] ShapeStyle fill
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null} [stroke] ShapeStyle stroke
 * @property {number|null} [strokeWidth] ShapeStyle strokeWidth
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap|null} [lineCap] ShapeStyle lineCap
 * @property {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin|null} [lineJoin] ShapeStyle lineJoin
 * @property {number|null} [miterLimit] ShapeStyle miterLimit
 * @property {number|null} [lineDashI] ShapeStyle lineDashI
 * @property {number|null} [lineDashII] ShapeStyle lineDashII
 * @property {number|null} [lineDashIII] ShapeStyle lineDashIII
 */
export interface ShapeStyleProps {
    fill: RGBAColor | null;
    stroke: RGBAColor | null;
    strokeWidth: number | null;
    lineCap: LineCap | null;
    lineJoin: LineJoin | null;
    miterLimit: number | null;
    lineDashI: number | null;
    lineDashII: number | null;
    lineDashIII: number | null;
}
export declare class ShapeStyleWriter {
}
export declare class ShapeStyleReader {
    /**
     * Decodes a ShapeStyle message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader | Uint8Array, length?: number): ShapeStyle;
    /**
     * Decodes a ShapeStyle message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: Reader | Uint8Array): ShapeStyle;
}
export default class ShapeStyle {
    /**
     * Creates a new ShapeStyle instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {com.opensource.svga.ShapeEntity.IShapeStyle=} [properties] Properties to set
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle instance
     */
    static create(properties: ShapeStyleProps): ShapeStyle;
    /**
     * Verifies a ShapeStyle message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    /**
     * Creates a ShapeStyle message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     */
    /**
     * Creates a plain object from a ShapeStyle message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle} message ShapeStyle
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    /**
     * Gets the default type url for ShapeStyle
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    /**
     * ShapeStyle fill.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    fill: RGBAColor | null;
    /**
     * ShapeStyle stroke.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    stroke: RGBAColor | null;
    /**
     * ShapeStyle strokeWidth.
     * @member {number} strokeWidth
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    strokeWidth: number;
    /**
     * ShapeStyle lineCap.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap} lineCap
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineCap: LineCap;
    /**
     * ShapeStyle lineJoin.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineJoin: LineJoin;
    /**
     * ShapeStyle miterLimit.
     * @member {number} miterLimit
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    miterLimit: number;
    /**
     * ShapeStyle lineDashI.
     * @member {number} lineDashI
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashI: number;
    /**
     * ShapeStyle lineDashII.
     * @member {number} lineDashII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashII: number;
    /**
     * ShapeStyle lineDashIII.
     * @member {number} lineDashIII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashIII: number;
    /**
     * Constructs a new ShapeStyle.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents a ShapeStyle.
     * @implements IShapeStyle
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IShapeStyle=} [properties] Properties to set
     */
    constructor(properties?: ShapeStyleProps);
}
