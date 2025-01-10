import Reader from "../../serialization/Reader";
import FrameEntity from "./FrameEntity";
/**
 * Properties of a SpriteEntity.
 * @memberof com.opensource.svga
 * @interface ISpriteEntity
 * @property {string|null} [imageKey] SpriteEntity imageKey
 * @property {Array.<com.opensource.svga.IFrameEntity>|null} [frames] SpriteEntity frames
 * @property {string|null} [matteKey] SpriteEntity matteKey
 */
export interface SpriteEntityProps {
    imageKey: string | null;
    frames: FrameEntity[] | null;
    matteKey: string | null;
}
export declare class SpriteEntityWriter {
}
export declare class SpriteEntityReader {
    /**
     * Decodes a SpriteEntity message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader | Uint8Array, length?: number): SpriteEntity;
    /**
     * Decodes a SpriteEntity message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: Reader | Uint8Array): SpriteEntity;
}
export default class SpriteEntity {
    /**
     * Creates a new SpriteEntity instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {com.opensource.svga.ISpriteEntity=} [properties] Properties to set
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity instance
     */
    static create(properties: SpriteEntityProps): SpriteEntity;
    /**
     * Verifies a SpriteEntity message.
     * @function verify
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    /**
     * Creates a SpriteEntity message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     */
    /**
     * Creates a plain object from a SpriteEntity message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {com.opensource.svga.SpriteEntity} message SpriteEntity
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    /**
     * Gets the default type url for SpriteEntity
     * @function getTypeUrl
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    /**
     * SpriteEntity frames.
     * @member {Array.<com.opensource.svga.IFrameEntity>} frames
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    frames: FrameEntity[];
    /**
     * SpriteEntity imageKey.
     * @member {string} imageKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    imageKey: string;
    /**
     * SpriteEntity matteKey.
     * @member {string} matteKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    matteKey: string;
    /**
     * Constructs a new SpriteEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a SpriteEntity.
     * @implements ISpriteEntity
     * @constructor
     * @param {com.opensource.svga.ISpriteEntity=} [properties] Properties to set
     */
    constructor(properties?: SpriteEntityProps);
}
