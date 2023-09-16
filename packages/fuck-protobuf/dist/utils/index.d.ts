import { LongBits } from "../dts";
export declare function noop(): void;
export declare function writeByte(val: number, buf: Uint8Array, pos: number): void;
export declare function writeBytes(val: number[], buf: Uint8Array, pos: number): void;
export declare function writeVarint32(val: number, buf: Uint8Array, pos: number): void;
export declare function writeVarint64(val: LongBits, buf: Uint8Array, pos: number): void;
export declare function writeFixed32(val: number, buf: Uint8Array, pos: number): void;
/**
 * Tests if the specified value is an string.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an string
 */
export declare function isString(val: any): val is string | String;
/**
 * Tests if the specified value is an object.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an object
 */
export declare function isObject(val: any): any;
/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
export declare function isInteger(value: any): boolean;
/**
 * Sets the value of a property by property path. If a value already exists, it is turned to an array
 * @param {Object.<string,*>} dst Destination object
 * @param {string} path dot '.' delimited path of the property to set
 * @param {Object} value the value to set
 * @returns {Object.<string,*>} Destination object
 */
export declare function setProperty(dst: Record<string, any>, path: string, value: any): Record<string, any>;
/**
 * Converts an array of keys immediately followed by their respective value to an object, omitting undefined values.
 * @param {Array.<*>} array Array to convert
 * @returns {Object.<string,*>} Converted object
 */
export declare function toObject(array: any[]): Record<string, any>;
/**
 * An immuable empty array.
 * @memberof util
 * @type {Array.<*>}
 * @const
 */
export declare const emptyArray: readonly never[];
/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
export declare const emptyObject: Readonly<{}>;
/**
 * Default conversion options used for {@link Message#toJSON} implementations.
 *
 * These options are close to proto3's JSON mapping with the exception that internal types like Any are handled just like messages. More precisely:
 *
 * - Longs become strings
 * - Enums become string keys
 * - Bytes become base64 encoded strings
 * - (Sub-)Messages become plain objects
 * - Maps become plain objects with all string keys
 * - Repeated fields become arrays
 * - NaN and Infinity for float and double fields become strings
 *
 * @type {IConversionOptions}
 * @see https://developers.google.com/protocol-buffers/docs/proto3?hl=en#json
 */
export declare const toJSONOptions: {
    longs: StringConstructor;
    enums: StringConstructor;
    bytes: StringConstructor;
    json: boolean;
};
/**
 * Builds a getter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfGetter} Unbound getter
 */
export declare function getOneOf(fieldNames: string[]): () => string | undefined;
/**
 * Builds a setter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfSetter} Unbound setter
 */
export declare function setOneOf(fieldNames: string[]): (name: string) => void;
