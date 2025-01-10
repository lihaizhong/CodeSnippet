import Reader from "../../serialization/Reader";
/**
 * Properties of a MovieParams.
 * @memberof com.opensource.svga
 * @interface IMovieParams
 * @property {number|null} [viewBoxWidth] MovieParams viewBoxWidth
 * @property {number|null} [viewBoxHeight] MovieParams viewBoxHeight
 * @property {number|null} [fps] MovieParams fps
 * @property {number|null} [frames] MovieParams frames
 */
export interface MovieParamsProps {
    viewBoxWidth: number | null;
    viewBoxHeight: number | null;
    fps: number | null;
    frames: number | null;
}
export declare class MovieParamsWriter {
}
export declare class MovieParamsReader {
    /**
     * Decodes a MovieParams message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.MovieParams} MovieParams
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader | Uint8Array, length?: number): MovieParams;
    /**
     * Decodes a MovieParams message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.MovieParams} MovieParams
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader: Reader | Uint8Array): MovieParams;
}
export default class MovieParams {
    /**
     * Creates a new MovieParams instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {com.opensource.svga.IMovieParams=} [properties] Properties to set
     * @returns {com.opensource.svga.MovieParams} MovieParams instance
     */
    static create(properties?: MovieParamsProps): MovieParams;
    /**
     * Verifies a MovieParams message.
     * @function verify
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    /**
     * Creates a MovieParams message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.MovieParams} MovieParams
     */
    /**
     * Creates a plain object from a MovieParams message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {com.opensource.svga.MovieParams} message MovieParams
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    /**
     * Gets the default type url for MovieParams
     * @function getTypeUrl
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    /**
     * MovieParams viewBoxWidth.
     * @member {number} viewBoxWidth
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxWidth: number;
    /**
     * MovieParams viewBoxHeight.
     * @member {number} viewBoxHeight
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxHeight: number;
    /**
     * MovieParams fps.
     * @member {number} fps
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    fps: number;
    /**
     * MovieParams frames.
     * @member {number} frames
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    frames: number;
    /**
     * Constructs a new MovieParams.
     * @memberof com.opensource.svga
     * @classdesc Represents a MovieParams.
     * @implements IMovieParams
     * @constructor
     * @param {com.opensource.svga.IMovieParams=} [properties] Properties to set
     */
    constructor(properties?: MovieParamsProps);
}
