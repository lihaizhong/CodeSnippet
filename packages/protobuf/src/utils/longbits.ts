export class LongBits {
  /**
   * Zero hash
   * @memberof util.LongBits
   * @type {string}
   */
  static zeroHash: string = '\0\0\0\0\0\0\0\0'
  /**
   * Constructs new long bits from the specified number.
   * @param {number} value Value
   * @returns {util.LongBits} Instance
   */
  static fromNumber(value: number) {
    if (value === 0) {
      return zeroBits
    }

    const sign = value < 0

    if (sign) {
      value = -value
    }

    let lo = value >>> 0
    let hi = (value - lo) / 4294967296 >>> 0

    if (sign) {
      hi = ~hi >>> 0
      lo = ~lo >>> 0

      if (++lo > 4294967295) {
        lo = 0

        if (++hi > 4294967295) {
          hi = 0
        }
      }
    }

    return new LongBits(lo, hi)
  }
  static from(value: number | string) {
    if (typeof value === 'number') {
      return LongBits.fromNumber(value)
    }

    if (typeof value === 'string') {

    }
  }
  /**
   * Low bits
   * @type {number}
   */
  readonly lo: number
  /**
   * High bits
   * @type {number}
   */
  readonly hi: number

  constructor(lo: number, hi: number) {
    this.lo = lo >>> 0
    this.hi = hi >>> 0
  }
}

class ZeroBits extends LongBits {
  toNumber(): number {
    return 0
  }

  zzEncode(): ZeroBits {
    return this
  }

  zzDecode(): ZeroBits {
    return this
  }

  length(): number {
    return 1
  }
}

/**
 * Zero bits.
 * @memberof util.LongBits
 * @type {util.LongBits}
 */
export const zeroBits = new ZeroBits(0, 0)
