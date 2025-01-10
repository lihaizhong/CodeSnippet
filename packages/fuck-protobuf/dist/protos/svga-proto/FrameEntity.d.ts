import Reader from "../../serialization/Reader";
import Layout from "./Layout";
import Transform from "./Transform";
import ShapeEntity from "./ShapeEntity";
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
export declare class FrameEntityWriter {
}
export declare class FrameEntityReader {
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
    static decode(reader: Reader | Uint8Array, length?: number): FrameEntity;
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
    static decodeDelimited(reader: Reader | Uint8Array): FrameEntity;
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
    static create(properties?: FrameEntityProps): FrameEntity;
    /**
     * Verifies a FrameEntity message.
     * @function verify
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    /**
     * Creates a FrameEntity message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.FrameEntity} FrameEntity
     */
    /**
     * Creates a plain object from a FrameEntity message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {com.opensource.svga.FrameEntity} message FrameEntity
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    /**
     * Gets the default type url for FrameEntity
     * @function getTypeUrl
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    /**
     * FrameEntity shapes.
     * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    shapes: ShapeEntity[];
    /**
     * FrameEntity alpha.
     * @member {number} alpha
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    alpha: number;
    /**
     * FrameEntity layout.
     * @member {com.opensource.svga.ILayout|null|undefined} layout
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    layout: Layout | null;
    /**
     * FrameEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    transform: Transform | null;
    /**
     * FrameEntity clipPath.
     * @member {string} clipPath
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    clipPath: string;
    /**
     * Constructs a new FrameEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a FrameEntity.
     * @implements IFrameEntity
     * @constructor
     * @param {com.opensource.svga.IFrameEntity=} [properties] Properties to set
     */
    constructor(properties?: FrameEntityProps);
}
