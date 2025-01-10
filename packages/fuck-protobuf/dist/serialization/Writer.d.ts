import State from "./State";
import Op from "./Op";
export default class Writer {
    /**
     * Creates a new writer.
     * @function
     * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
     */
    static create(): Writer;
    /**
     * Allocates a buffer of the specified size.
     * @param {number} size Buffer size
     * @returns {Uint8Array} Buffer
     */
    static alloc(size: number): Uint8Array<ArrayBufferLike>;
    /**
     * Current length.
     * @type {number}
     */
    len: number;
    /**
     * Operations head.
     * @type {Object}
     */
    head: Op;
    /**
     * Operations tail
     * @type {Object}
     */
    tail: Op;
    /**
     * Linked forked states.
     * @type {Object|null}
     */
    states: State | null;
    /**
     * Constructs a new writer instance.
     * @classdesc Wire format writer using `Uint8Array` if available, otherwise `Array`.
     * @constructor
     */
    constructor();
    /**
     * Pushes a new operation to the queue.
     * @param {function(*, Uint8Array, number)} fn Function to call
     * @param {number} len Value byte length
     * @param {number} val Value to write
     * @returns {Writer} `this`
     * @private
     */
    private push;
    /**
     * Writes an unsigned 32 bit value as a varint.
     * @param {number} value Value to write
     * @returns {Writer} `this`
     */
    uint32(value: number): Writer;
    /**
     * Writes a signed 32 bit value as a varint.
     * @function
     * @param {number} value Value to write
     * @returns {Writer} `this`
     */
    int32(value: number): Writer;
    /**
     * Writes a 32 bit value as a varint, zig-zag encoded.
     * @param {number} value Value to write
     * @returns {Writer} `this`
     */
    /**
     * Writes an unsigned 64 bit value as a varint.
     * @param {Long|number|string} value Value to write
     * @returns {Writer} `this`
     * @throws {TypeError} If `value` is a string and no long library is present.
     */
    /**
     * Writes a signed 64 bit value as a varint.
     * @function
     * @param {Long|number|string} value Value to write
     * @returns {Writer} `this`
     * @throws {TypeError} If `value` is a string and no long library is present.
     */
    /**
     * Writes a signed 64 bit value as a varint, zig-zag encoded.
     * @param {Long|number|string} value Value to write
     * @returns {Writer} `this`
     * @throws {TypeError} If `value` is a string and no long library is present.
     */
    /**
     * Writes a boolish value as a varint.
     * @param {boolean} value Value to write
     * @returns {Writer} `this`
     */
    bool(value: boolean): Writer;
    /**
     * Writes an unsigned 32 bit value as fixed 32 bits.
     * @param {number} value Value to write
     * @returns {Writer} `this`
     */
    /**
     * Writes a signed 32 bit value as fixed 32 bits.
     * @function
     * @param {number} value Value to write
     * @returns {Writer} `this`
     */
    /**
     * Writes an unsigned 64 bit value as fixed 64 bits.
     * @param {Long|number|string} value Value to write
     * @returns {Writer} `this`
     * @throws {TypeError} If `value` is a string and no long library is present.
     */
    /**
     * Writes a signed 64 bit value as fixed 64 bits.
     * @function
     * @param {Long|number|string} value Value to write
     * @returns {Writer} `this`
     * @throws {TypeError} If `value` is a string and no long library is present.
     */
    /**
     * Writes a float (32 bit).
     * @function
     * @param {number} value Value to write
     * @returns {Writer} `this`
     */
    float(value: number): Writer;
    /**
     * Writes a double (64 bit float).
     * @function
     * @param {number} value Value to write
     * @returns {Writer} `this`
     */
    double(value: number): Writer;
    /**
     * Writes a sequence of bytes.
     * @param {Uint8Array|string} value Buffer or base64 encoded string to write
     * @returns {Writer} `this`
     */
    bytes(value: Uint8Array | string): Writer;
    /**
     * Writes a string.
     * @param {string} value Value to write
     * @returns {Writer} `this`
     */
    string(value: string): Writer;
    /**
     * Forks this writer's state by pushing it to a stack.
     * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
     * @returns {Writer} `this`
     */
    fork(): Writer;
    /**
     * Resets this instance to the last state.
     * @returns {Writer} `this`
     */
    reset(): this;
    /**
     * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
     * @returns {Writer} `this`
     */
    ldelim(): this;
}
