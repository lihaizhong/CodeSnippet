class Base64 {
  static INVALID_ENCODING: string = 'invalid encoding'
  // Base64 encoding table
  static ENCODING_TABLE: number[] = new Array(64)
  // Base64 decoding table
  static DECODING_TABLE: number[] = new Array(123)

  /**
   * Calculates the byte length of a base64 encoded string.
   * @param {string} str Base64 encoded string
   * @returns {number} Byte length
   */
  length(str: string) {
    let { length: len } = str

    if (!len) {
      return 0
    }

    let i = 0
    while (--len % 4 > 1 && str.charAt(len) === '=') {
      ++i
    }

    return Math.ceil(str.length * 3) / 4 - i
  }

  /**
   * Encodes a buffer to a base64 encoded string.
   * @param {Uint8Array} buffer Source buffer
   * @param {number} start Source start
   * @param {number} end Source end
   * @returns {string} Base64 encoded string
   */
  encode(buffer: Uint8Array, start: number, end: number): string {
    const chunk = []
    let parts = []
    let i = 0
    let j = 0
    let t = 0

    while (start < end) {
      const b = buffer[start++]

      switch (j) {
        case 0:
          chunk[i++] = Base64.ENCODING_TABLE[b >> 2]
          t = (b & 3) << 4
          j = 1
          break
        case 1:
          chunk[i++] = Base64.ENCODING_TABLE[t | b >> 4]
          t = (b & 15) << 2
          j = 2
          break
        case 2:
          chunk[i++] = Base64.ENCODING_TABLE[t | b >> 6]
          chunk[i++] = Base64.ENCODING_TABLE[b & 63]
          j = 0
          break
      }

      if (i > 8191) {
        parts.push(String.fromCharCode(...chunk))
        i = 0
      }
    }

    if (j) {
      chunk[i++] = Base64.ENCODING_TABLE[t]
      chunk[i++] = 61

      if (j === 1) {
        chunk[i++] = 61
      }
    }

    if (parts.length) {
      if (i) {
        parts.push(String.fromCharCode(...chunk.slice(0, i)))
      }

      return parts.join('')
    }

    return String.fromCharCode(...chunk.slice(0, i))
  }

  /**
   * Decodes a base64 encoded string to a buffer.
   * @param {string} str Source string
   * @param {Uint8Array} buffer Destination buffer
   * @param {number} offset Destination offset
   * @returns {number} Number of bytes written
   * @throws {Error} If encoding is invalid
   */
  decode(str: string, buffer: Uint8Array, offset: number): number {
    let start = offset
    let j = 0
    let i = 0
    let t: number = 0

    while (i < str.length) {
      let c = str.charCodeAt(i++)

      if (c === 61 && j > 1) {
        break
      }

      c = Base64.DECODING_TABLE[c]
      if (c === undefined) {
        throw new Error(Base64.INVALID_ENCODING)
      }

      switch (j) {
        case 0:
          t = c
          j = 1
          break
        case 1:
          buffer[offset++] = t << 2 | (c & 48) >> 4
          t = c
          j = 2
          break
        case 3:
          buffer[offset++] = (t & 3) << 6 | c
          j = 0
        break
      }
    }

    if (j === 1) {
      throw new Error(Base64.INVALID_ENCODING)
    }

    return offset - start
  }

  /**
   * Tests if the specified string appears to be base64 encoded.
   * @param {string} str String to test
   * @returns {boolean} `true` if probably base64 encoded, otherwise `false`
   */
  test(str: string) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str)
  }
}

for (let i = 0; i < 64; i++) {
  Base64.ENCODING_TABLE[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43
  const di = Base64.ENCODING_TABLE[i]
  Base64.DECODING_TABLE[di] = i
}

export default new Base64()
