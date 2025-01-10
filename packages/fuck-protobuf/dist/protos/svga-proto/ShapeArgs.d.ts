import Reader from "../../serialization/Reader";
/**
 * Properties of a ShapeArgs.
 * @memberof com.opensource.svga.ShapeEntity
 * @interface IShapeArgs
 * @property {string|null} [d] ShapeArgs d
 */
export interface ShapeArgsProps {
    d: string | null;
}
export declare class ShapeArgsWriter {
}
export declare class ShapeArgsReader {
    /**
     * Decodes a ShapeArgs message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader | Uint8Array, length?: number): ShapeArgs;
    /**
     * Decodes a ShapeArgs message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: Reader | Uint8Array): ShapeArgs;
}
export default class ShapeArgs {
    /**
     * Creates a new ShapeArgs instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IShapeArgs=} [properties] Properties to set
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs instance
     */
    static create(properties: ShapeArgsProps): ShapeArgs;
    /**
     * Verifies a ShapeArgs message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    /**
     * Creates a ShapeArgs message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     */
    /**
     * Creates a plain object from a ShapeArgs message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeArgs} message ShapeArgs
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    /**
     * Gets the default type url for ShapeArgs
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    d: string;
    /**
     * Constructs a new ShapeArgs.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents a ShapeArgs.
     * @implements IShapeArgs
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IShapeArgs=} [properties] Properties to set
     */
    constructor(properties?: ShapeArgsProps);
}
