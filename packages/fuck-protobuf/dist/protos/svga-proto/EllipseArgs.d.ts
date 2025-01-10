import Reader from "../../serialization/Reader";
/**
 * Properties of an EllipseArgs.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IEllipseArgs
 * @property {number|null} [x] EllipseArgs x
 * @property {number|null} [y] EllipseArgs y
 * @property {number|null} [radiusX] EllipseArgs radiusX
 * @property {number|null} [radiusY] EllipseArgs radiusY
 */
export interface EllipseArgsProps {
    x: number | null;
    y: number | null;
    radiusX: number | null;
    radiusY: number | null;
}
export declare class EllipseArgsWriter {
}
export declare class EllipseArgsReader {
    /**
     * Decodes an EllipseArgs message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader | Uint8Array, length?: number): EllipseArgs;
    /**
     * Decodes an EllipseArgs message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: Reader | Uint8Array): EllipseArgs;
}
export default class EllipseArgs {
    /**
     * Creates a new EllipseArgs instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs instance
     */
    static create(properties?: EllipseArgsProps): EllipseArgs;
    /**
     * Verifies an EllipseArgs message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    /**
     * Creates an EllipseArgs message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     */
    /**
     * Creates a plain object from an EllipseArgs message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.EllipseArgs} message EllipseArgs
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    /**
     * Gets the default type url for EllipseArgs
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    /**
     * EllipseArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    x: number;
    /**
     * EllipseArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    y: number;
    /**
     * EllipseArgs radiusX.
     * @member {number} radiusX
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusX: number;
    /**
     * EllipseArgs radiusY.
     * @member {number} radiusY
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusY: number;
    /**
     * Constructs a new EllipseArgs.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents an EllipseArgs.
     * @implements IEllipseArgs
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
     */
    constructor(properties?: EllipseArgsProps);
}
