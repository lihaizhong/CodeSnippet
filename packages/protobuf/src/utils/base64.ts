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
  encode(buffer: Uint8Array, start: number, end: number) {}

  /**
   * Decodes a base64 encoded string to a buffer.
   * @param {string} str Source string
   * @param {Uint8Array} buffer Destination buffer
   * @param {number} offset Destination offset
   * @returns {number} Number of bytes written
   * @throws {Error} If encoding is invalid
   */
  decode(str: string, buffer: Uint8Array, offset: number) {}

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
