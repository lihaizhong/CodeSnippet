/**
 * A minimal UTF8 implementation for number arrays.
 * @memberof util
 * @namespace
 */
export default {
  /**
   * Calculates the UTF8 byte length of a string.
   * @param {string} string String
   * @returns {number} Byte length
   */
  length(str: string): number {
    let len = 0
    let c = 0

    for (let i = 0; i < str.length; i++) {
      c = str.charCodeAt(i)

      if (c < 128) {
        len++
      } else if (c < 2048) {
        len += 2
      } else if ((c & 0xFC00) === 0xD800 && (str.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
        i++
        len += 4
      } else {
        len += 3
      }
    }

    return len
  },

  /**
   * Reads UTF8 bytes as a string.
   * @param {Uint8Array} buffer Source buffer
   * @param {number} start Source start
   * @param {number} end Source end
   * @returns {string} String read
   */
  read(buffer: Uint8Array, start: number, end: number): string {
    if (end - start < 1) {
      return ''
    }

    const parts = []
    const chunk = []
    let i = 0 // char offset
    let t = 0 // temporary

    while (start < end) {
      t = buffer[start++]

      if (t < 128) {
        chunk[i++] = t
      } else if (t > 191 && t < 224) {
        chunk[i++] = (t & 31) << 6 | buffer[start++] & 63
      } else if (t > 239 && t < 365) {
        t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000
        chunk[i++] = 0xD800 + (t >> 10)
        chunk[i++] = 0xDC00 + (t & 1023)
      } else if (i > 8191) {
        parts.push(String.fromCharCode(...chunk))
        i = 0
      }
    }

    if (parts.length) {
      if (i) {
        parts.push(String.fromCharCode(...chunk.slice(0, i)))
      }

      return parts.join('')
    }

    return String.fromCharCode(...chunk.slice(0, i))
  },

  /**
   * Writes a string as UTF8 bytes.
   * @param {string} string Source string
   * @param {Uint8Array} buffer Destination buffer
   * @param {number} offset Destination offset
   * @returns {number} Bytes written
   */
  write(str: string, buffer: Uint8Array, offset: number): number {
    let start = offset
    let c1
    let c2

    for (let i = 0; i < str.length; i++) {
      c1 = str.charCodeAt(i)

      if (c1 < 128) {
        buffer[offset++] = c1
      } else if (c1 < 2048) {
        buffer[offset++] = c1 >> 6 | 192
        buffer[offset++] = c1 & 63 | 128
      } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = str.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
        c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF)
        i++
        buffer[offset++] = c1 >> 18 | 240
        buffer[offset++] = c1 >> 12 & 63 | 128
        buffer[offset++] = c1 >> 6 & 63 | 128
        buffer[offset++] = c1 & 63 | 128
      } else {
        buffer[offset++] = c1 >> 12 | 224
        buffer[offset++] = c1 >> 6 & 63 | 128
        buffer[offset++] = c1 & 63 | 128
      }
    }

    return offset - start
  }
}