// ---------------------------------------------------------------------
// base64DecodeInputStream
// ---------------------------------------------------------------------

export class Base64DecodeInputStream {
  private pos = 0;

  private buffer = 0;

  private buflen = 0;

  constructor(private readonly data: string) {}

  private decode(c: number): number {
    if (c >= 0x41 && c <= 0x5a) {
      return c - 0x41
    }
    
    if (c >= 0x61 && c <= 0x7a) {
      return c - 0x61 + 26
    }
    
    if (c >= 0x30 && c <= 0x39) {
      return c - 0x30 + 52
    }
    
    if (c == 0x2b) {
      return 62
    }
    
    if (c == 0x2f) {
      return 63
    }

    throw new Error(`c: ${c}`);
  }

  public read(): number {
    while (this.buflen < 8) {
      if (this.pos >= this.data.length) {
        if (this.buflen == 0) {
          return -1;
        }

        throw new Error(`unexpected end of file./${this.buflen}`);
      }

      const c = this.data.charAt(this.pos);
      this.pos++;
      if (c == '=') {
        this.buflen = 0;

        return -1;
      } else if (c.match(/^\s$/)) {
        // ignore if whitespace.
        continue;
      }

      this.buffer = (this.buffer << 6) | this.decode(c.charCodeAt(0));
      this.buflen += 6;
    }

    this.buflen -= 8;
    const n = (this.buffer >>> this.buflen) & 0xff;

    return n;
  }
}