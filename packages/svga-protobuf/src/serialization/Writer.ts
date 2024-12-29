import pool from "@protobufjs/pool";
import float from "@protobufjs/float";
import base64 from "@protobufjs/base64";
import utf8 from "@protobufjs/utf8";
import {
  isString,
  noop,
  writeByte,
  writeBytes,
  // writeFixed32,
  writeVarint32,
  writeVarint64,
} from "../utils";
import State from "./State";
import Op from "./Op";
// import { LongBits } from "../dts";

export default class Writer {
  /**
   * Creates a new writer.
   * @function
   * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
   */
  static create() {
    return new Writer();
  }

  /**
   * Allocates a buffer of the specified size.
   * @param {number} size Buffer size
   * @returns {Uint8Array} Buffer
   */
  static alloc(size: number) {
    return pool(
      (size: number) => new Uint8Array(size),
      Uint8Array.prototype.subarray
    )(size);
  }

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
  constructor() {
    this.len = 0;
    this.head = new Op(noop, 0, null);
    this.tail = this.head;
    this.states = null;

    // When a value is written, the writer calculates its byte length and puts it into a linked
    // list of operations to perform when finish() is called. This both allows us to allocate
    // buffers of the exact required size and reduces the amount of work we have to do compared
    // to first calculating over objects and then encoding over objects. In our case, the encoding
    // part is just a linked list walk calling operations with already prepared values.
  }

  /**
   * Pushes a new operation to the queue.
   * @param {function(*, Uint8Array, number)} fn Function to call
   * @param {number} len Value byte length
   * @param {number} val Value to write
   * @returns {Writer} `this`
   * @private
   */
  private push(
    fn: (val: any, u8a: Uint8Array, pos: number) => void,
    len: number,
    val: any
  ): Writer {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;

    return this;
  }

  /**
   * Writes an unsigned 32 bit value as a varint.
   * @param {number} value Value to write
   * @returns {Writer} `this`
   */
  uint32(value: number): Writer {
    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    // uint32 is by far the most frequently used operation and benefits significantly from this.
    this.len += (this.tail = this.tail.next =
      new Op(
        writeVarint32,
        (value = value >>> 0) < 128
          ? 1
          : value < 16384
          ? 2
          : value < 2097152
          ? 3
          : value < 268435456
          ? 4
          : 5,
        value
      )).len;

    return this;
  }

  /**
   * Writes a signed 32 bit value as a varint.
   * @function
   * @param {number} value Value to write
   * @returns {Writer} `this`
   */
  int32(value: number): Writer {
    return value < 0
      ? this.push(writeVarint64, value < -2147483648 ? 10 : 5, value)
      : this.uint32(value);
  }

  /**
   * Writes a 32 bit value as a varint, zig-zag encoded.
   * @param {number} value Value to write
   * @returns {Writer} `this`
   */
  // sint32(value: number): Writer {
  //   return this.uint32(((value << 1) ^ (value >> 31)) >>> 0);
  // }

  /**
   * Writes an unsigned 64 bit value as a varint.
   * @param {Long|number|string} value Value to write
   * @returns {Writer} `this`
   * @throws {TypeError} If `value` is a string and no long library is present.
   */
  // uint64(value: number | string): Writer {
  //   const bits = LongBits.from(value);

  //   return this.push(writeVarint64, bits.length(), bits);
  // }

  /**
   * Writes a signed 64 bit value as a varint.
   * @function
   * @param {Long|number|string} value Value to write
   * @returns {Writer} `this`
   * @throws {TypeError} If `value` is a string and no long library is present.
   */
  // int64(value: number | string): Writer {
  //   return this.uint64(value);
  // }

  /**
   * Writes a signed 64 bit value as a varint, zig-zag encoded.
   * @param {Long|number|string} value Value to write
   * @returns {Writer} `this`
   * @throws {TypeError} If `value` is a string and no long library is present.
   */
  // sint64(value: number | string): Writer {
  //   const bits = LongBits.from(value).zzEncode();

  //   return this.push(writeVarint64, bits.length(), bits);
  // }

  /**
   * Writes a boolish value as a varint.
   * @param {boolean} value Value to write
   * @returns {Writer} `this`
   */
  bool(value: boolean): Writer {
    return this.push(writeByte, 1, value ? 1 : 0);
  }

  /**
   * Writes an unsigned 32 bit value as fixed 32 bits.
   * @param {number} value Value to write
   * @returns {Writer} `this`
   */
  // fixed32(value: number): Writer {
  //   return this.push(writeFixed32, 4, value >>> 0);
  // }

  /**
   * Writes a signed 32 bit value as fixed 32 bits.
   * @function
   * @param {number} value Value to write
   * @returns {Writer} `this`
   */
  // sfixed32(value: number): Writer {
  //   return this.fixed32(value);
  // }

  /**
   * Writes an unsigned 64 bit value as fixed 64 bits.
   * @param {Long|number|string} value Value to write
   * @returns {Writer} `this`
   * @throws {TypeError} If `value` is a string and no long library is present.
   */
  // fixed64(value: number | string): Writer {
  //   const bits = LongBits.from(value);

  //   return this.push(writeFixed32, 4, bits.lo).push(writeFixed32, 4, bits.hi);
  // }

  /**
   * Writes a signed 64 bit value as fixed 64 bits.
   * @function
   * @param {Long|number|string} value Value to write
   * @returns {Writer} `this`
   * @throws {TypeError} If `value` is a string and no long library is present.
   */
  // sfixed64(value: number | string): Writer {
  //   return this.fixed64(value);
  // }

  /**
   * Writes a float (32 bit).
   * @function
   * @param {number} value Value to write
   * @returns {Writer} `this`
   */
  float(value: number): Writer {
    return this.push(float.writeFloatLE, 4, value);
  }

  /**
   * Writes a double (64 bit float).
   * @function
   * @param {number} value Value to write
   * @returns {Writer} `this`
   */
  double(value: number): Writer {
    return this.push(float.writeDoubleLE, 8, value);
  }

  /**
   * Writes a sequence of bytes.
   * @param {Uint8Array|string} value Buffer or base64 encoded string to write
   * @returns {Writer} `this`
   */
  bytes(value: Uint8Array | string): Writer {
    let len = value.length;

    if (!len) {
      return this.push(writeByte, 1, 0);
    }

    if (isString(value)) {
      var buf = Writer.alloc((len = base64.length(value)));
      base64.decode(value, buf, 0);
      value = buf;
    }

    return this.uint32(len).push(writeBytes, len, value);
  }

  /**
   * Writes a string.
   * @param {string} value Value to write
   * @returns {Writer} `this`
   */
  string(value: string): Writer {
    const len = utf8.length(value);

    return len
      ? this.uint32(len).push(utf8.write, len, value)
      : this.push(writeByte, 1, 0);
  }

  /**
   * Forks this writer's state by pushing it to a stack.
   * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
   * @returns {Writer} `this`
   */
  fork(): Writer {
    this.states = new State(this);
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;

    return this;
  }

  /**
   * Resets this instance to the last state.
   * @returns {Writer} `this`
   */
  reset() {
    if (this.states) {
      this.head = this.states.head as Op;
      this.tail = this.states.tail as Op;
      this.len = this.states.len;
      this.states = this.states.next;
    } else {
      this.head = this.tail = new Op(noop, 0, 0);
      this.len = 0;
    }

    return this;
  }

  /**
   * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
   * @returns {Writer} `this`
   */
  ldelim() {
    const head = this.head;
    const tail = this.tail;
    const len = this.len;

    this.reset().uint32(len);

    if (len) {
      this.tail.next = head.next; // skip noop
      this.tail = tail;
      this.len += len;
    }

    return this;
  }

  /**
   * Finishes the write operation.
   * @returns {Uint8Array} Finished buffer
   */
  // finish() {
  //   const buf = Writer.alloc(this.len);
  //   let head = this.head.next; // skip noop
  //   let pos = 0;

  //   while (head) {
  //     head.fn(head.val, buf, pos);
  //     pos += head.len;
  //     head = head.next;
  //   }

  //   return buf;
  // }
}
