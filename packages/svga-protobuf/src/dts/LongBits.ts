import { isString } from "../utils";

export default class LongBits {
  /**
   * Constructs new long bits from the specified number.
   * @param {number} value Value
   * @returns {util.LongBits} Instance
   */
  static fromNumber(value: number) {
    if (value === 0) {
      return new ZeroBits();
    }

    const sign = value < 0;
    if (sign) {
      value = -value;
    }

    let lo = value >>> 0;
    let hi = ((value - lo) / 4294967296) >>> 0;
    if (sign) {
      hi = ~hi >>> 0;
      lo = ~lo >>> 0;

      if (++lo > 4294967295) {
        lo = 0;
        if (++hi > 4294967295) {
          hi = 0;
        }
      }
    }

    return new LongBits(lo, hi);
  }

  /**
   * Constructs new long bits from a number, long or string.
   * @param {Long|number|string} value Value
   * @returns {util.LongBits} Instance
   */
  static from(value: any) {
    if (typeof value === "number") {
      return LongBits.fromNumber(value);
    }

    if (isString(value)) {
      return LongBits.fromNumber(parseInt(value as string, 10));
    }

    return value.low || value.high
      ? new LongBits(value.low >>> 0, value.high >>> 0)
      : new ZeroBits();
  }

  /**
   * Constructs new long bits from the specified 8 characters long hash.
   * @param {string} hash Hash
   * @returns {util.LongBits} Bits
   */
  static fromHash(hash: string) {
    if (hash === ZeroBits.zeroHash) {
      return new ZeroBits();
    }

    const charCodeAt = String.prototype.charCodeAt;

    return new LongBits(
      (charCodeAt.call(hash, 0) |
        (charCodeAt.call(hash, 1) << 8) |
        (charCodeAt.call(hash, 2) << 16) |
        (charCodeAt.call(hash, 3) << 24)) >>>
        0,
      (charCodeAt.call(hash, 4) |
        (charCodeAt.call(hash, 5) << 8) |
        (charCodeAt.call(hash, 6) << 16) |
        (charCodeAt.call(hash, 7) << 24)) >>>
        0
    );
  }

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
  constructor(lo: number, hi: number) {
    // note that the casts below are theoretically unnecessary as of today, but older statically
    // generated converter code might still call the ctor with signed 32bits. kept for compat.

    this.lo = lo >>> 0;
    this.hi = hi >>> 0;
  }

  /**
   * Converts this long bits to a possibly unsafe JavaScript number.
   * @param {boolean} [unsigned=false] Whether unsigned or not
   * @returns {number} Possibly unsafe number
   */
  toNumber(unsigned: boolean): number {
    if (!unsigned && this.hi >>> 31) {
      const lo = (~this.lo + 1) >>> 0;
      let hi = ~this.hi >>> 0;

      if (!lo) {
        hi = (hi + 1) >>> 0;
      }

      return -(lo + hi * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  }

  /**
   * Converts this long bits to a long.
   * @param {boolean} [unsigned=false] Whether unsigned or not
   * @returns {Long} Long
   */
  // toLong(unsigned: boolean) {
  //   return {
  //     low: this.lo | 0,
  //     high: this.hi | 0,
  //     unsigned: Boolean(unsigned),
  //   };
  // }

  /**
   * Converts this long bits to a 8 characters long hash.
   * @returns {string} Hash
   */
  toHash() {
    return String.fromCharCode(
      this.lo & 255,
      (this.lo >>> 8) & 255,
      (this.lo >>> 16) & 255,
      this.lo >>> 24,
      this.hi & 255,
      (this.hi >>> 8) & 255,
      (this.hi >>> 16) & 255,
      this.hi >>> 24
    );
  }

  /**
   * Zig-zag encodes this long bits.
   * @returns {util.LongBits} `this`
   */
  zzEncode() {
    const mask = this.hi >> 31;

    this.hi = (((this.hi << 1) | (this.lo >>> 31)) ^ mask) >>> 0;
    this.lo = ((this.lo << 1) ^ mask) >>> 0;

    return this;
  }

  /**
   * Zig-zag decodes this long bits.
   * @returns {util.LongBits} `this`
   */
  zzDecode() {
    const mask = -(this.lo & 1);

    this.lo = (((this.lo >>> 1) | (this.hi << 31)) ^ mask) >>> 0;
    this.hi = ((this.hi >>> 1) ^ mask) >>> 0;

    return this;
  }

  /**
   * Calculates the length of this longbits when encoded as a varint.
   * @returns {number} Length
   */
  length(): number {
    const part0 = this.lo;
    const part1 = ((this.lo >>> 28) | (this.hi << 4)) >>> 0;
    const part2 = this.hi >>> 24;

    return part2 === 0
      ? part1 === 0
        ? part0 < 16384
          ? part0 < 128
            ? 1
            : 2
          : part0 < 2097152
          ? 3
          : 4
        : part1 < 16384
        ? part1 < 128
          ? 5
          : 6
        : part1 < 2097152
        ? 7
        : 8
      : part2 < 128
      ? 9
      : 10;
  }
}

export class ZeroBits extends LongBits {
  /**
   * Zero hash.
   * @memberof util.LongBits
   * @type {string}
   */
  static zeroHash: string = "\0\0\0\0\0\0\0\0";

  /**
   * Zero bits.
   * @memberof util.LongBits
   * @type {util.LongBits}
   */
  constructor() {
    super(0, 0);
  }

  /**
   * Zig-zag encodes this long bits.
   * @returns {util.LongBits} `this`
   */
  toNumber() {
    return 0;
  }

  /**
   * Zig-zag decodes this long bits.
   * @returns {util.LongBits} `this`
   */
  zzDecode() {
    return this;
  }

  length() {
    return 1;
  }
}
