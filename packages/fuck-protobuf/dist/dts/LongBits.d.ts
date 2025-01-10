export default class LongBits {
    /**
     * Constructs new long bits from the specified number.
     * @param {number} value Value
     * @returns {util.LongBits} Instance
     */
    static fromNumber(value: number): LongBits;
    /**
     * Constructs new long bits from a number, long or string.
     * @param {Long|number|string} value Value
     * @returns {util.LongBits} Instance
     */
    static from(value: any): LongBits;
    /**
     * Constructs new long bits from the specified 8 characters long hash.
     * @param {string} hash Hash
     * @returns {util.LongBits} Bits
     */
    static fromHash(hash: string): LongBits;
    /**
     * Low bits.
     * @type {number}
     */
    lo: number;
    /**
     * High bits.
     * @type {number}
     */
    hi: number;
    /**
     * Constructs new long bits.
     * @classdesc Helper class for working with the low and high bits of a 64 bit value.
     * @memberof util
     * @constructor
     * @param {number} lo Low 32 bits, unsigned
     * @param {number} hi High 32 bits, unsigned
     */
    constructor(lo: number, hi: number);
    /**
     * Converts this long bits to a possibly unsafe JavaScript number.
     * @param {boolean} [unsigned=false] Whether unsigned or not
     * @returns {number} Possibly unsafe number
     */
    toNumber(unsigned: boolean): number;
    /**
     * Converts this long bits to a long.
     * @param {boolean} [unsigned=false] Whether unsigned or not
     * @returns {Long} Long
     */
    /**
     * Converts this long bits to a 8 characters long hash.
     * @returns {string} Hash
     */
    toHash(): string;
    /**
     * Zig-zag encodes this long bits.
     * @returns {util.LongBits} `this`
     */
    zzEncode(): this;
    /**
     * Zig-zag decodes this long bits.
     * @returns {util.LongBits} `this`
     */
    zzDecode(): this;
    /**
     * Calculates the length of this longbits when encoded as a varint.
     * @returns {number} Length
     */
    length(): number;
}
export declare class ZeroBits extends LongBits {
    /**
     * Zero hash.
     * @memberof util.LongBits
     * @type {string}
     */
    static zeroHash: string;
    /**
     * Zero bits.
     * @memberof util.LongBits
     * @type {util.LongBits}
     */
    constructor();
    /**
     * Zig-zag encodes this long bits.
     * @returns {util.LongBits} `this`
     */
    toNumber(): number;
    /**
     * Zig-zag decodes this long bits.
     * @returns {util.LongBits} `this`
     */
    zzDecode(): this;
    length(): number;
}
