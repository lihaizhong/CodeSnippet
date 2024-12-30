export default class Op {
    /**
     * Function to call.
     * @type {function(*, Uint8Array, number)}
     */
    fn: (val: any, buf: Uint8Array, pos: number) => void;
    /**
     * Value byte length.
     * @type {number}
     */
    len: number;
    /**
     * Next operation.
     * @type {Writer.Op|undefined}
     */
    next: Op | null;
    /**
     * Value to write.
     * @type {*}
     */
    val: any;
    /**
     * Constructs a new writer operation instance.
     * @classdesc Scheduled writer operation.
     * @constructor
     * @param {function(*, Uint8Array, number)} fn Function to call
     * @param {number} len Value byte length
     * @param {*} val Value to write
     * @ignore
     */
    constructor(fn: (val: any, buf: Uint8Array, pos: number) => void, len: number, val: any);
}
