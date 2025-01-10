import Writer from "./Writer";
import Op from "./Op";

export default class State {
  /**
   * Current head.
   * @type {Writer.Op}
   */
  head: Op | null = null;
  /**
   * Current tail.
   * @type {Writer.Op}
   */
  tail: Op | null = null;
  /**
   * Current buffer length.
   * @type {number}
   */
  len: number;
  /**
   * Next state.
   * @type {State|null}
   */
  next: State | null = null;

  /**
   * Constructs a new writer state instance.
   * @classdesc Copied writer state.
   * @memberof Writer
   * @constructor
   * @param {Writer} writer Writer to copy state from
   * @ignore
   */
  constructor(writer: Writer) {
    this.head = writer.head;
    this.tail = writer.tail;
    this.len = writer.len;
    this.next = writer.states;
  }
}
