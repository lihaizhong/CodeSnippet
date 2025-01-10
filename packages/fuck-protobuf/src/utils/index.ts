import { LongBits } from "../dts";

export function noop() {}

export function writeByte(val: number, buf: Uint8Array, pos: number) {
  buf[pos] = val & 255;
}

export function writeBytes(val: number[], buf: Uint8Array, pos: number) {
  // also works for plain array values
  buf.set(val, pos);
}

export function writeVarint32(val: number, buf: Uint8Array, pos: number) {
  while (val > 127) {
    buf[pos++] = (val & 127) | 128;
    val >>>= 7;
  }
  buf[pos] = val;
}

export function writeVarint64(val: LongBits, buf: Uint8Array, pos: number) {
  while (val.hi) {
    buf[pos++] = (val.lo & 127) | 128;
    val.lo = ((val.lo >>> 7) | (val.hi << 25)) >>> 0;
    val.hi >>>= 7;
  }

  while (val.lo > 127) {
    buf[pos++] = (val.lo & 127) | 128;
    val.lo = val.lo >>> 7;
  }

  buf[pos++] = val.lo;
}

export function writeFixed32(val: number, buf: Uint8Array, pos: number) {
  buf[pos] = val & 255;
  buf[pos + 1] = (val >>> 8) & 255;
  buf[pos + 2] = (val >>> 16) & 255;
  buf[pos + 3] = val >>> 24;
}

/**
 * Tests if the specified value is an string.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an string
 */
export function isString(val: any) {
  return typeof val === "string" || val instanceof String;
}

/**
 * Tests if the specified value is an object.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an object
 */
export function isObject(val: any) {
  return val && typeof val === "object";
}

/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
export function isInteger(value: any) {
  return (
    typeof value === "number" && isFinite(value) && Math.floor(value) === value
  );
}

/**
 * Sets the value of a property by property path. If a value already exists, it is turned to an array
 * @param {Object.<string,*>} dst Destination object
 * @param {string} path dot '.' delimited path of the property to set
 * @param {Object} value the value to set
 * @returns {Object.<string,*>} Destination object
 */
export function setProperty(
  dst: Record<string, any>,
  path: string,
  value: any
) {
  function setProp(dst: Record<string, any>, path: string[], value: any) {
    var part = path.shift() as string;
    if (part === "__proto__" || part === "prototype") {
      return dst;
    }
    if (path.length > 0) {
      dst[part] = setProp(dst[part] || {}, path, value);
    } else {
      var prevValue = dst[part];
      if (prevValue) value = [].concat(prevValue).concat(value);
      dst[part] = value;
    }
    return dst;
  }

  if (typeof dst !== "object") throw TypeError("dst must be an object");
  if (!path) throw TypeError("path must be specified");

  return setProp(dst, path.split("."), value);
}

/**
 * Converts an array of keys immediately followed by their respective value to an object, omitting undefined values.
 * @param {Array.<*>} array Array to convert
 * @returns {Object.<string,*>} Converted object
 */
export function toObject(array: any[]) {
  const object: Record<string, any> = {};
  let index = 0;

  while (index < array.length) {
    const key = array[index++];
    const val = array[index++];
    if (val !== undefined) {
      object[key] = val;
    }
  }

  return object;
}

/**
 * An immuable empty array.
 * @memberof util
 * @type {Array.<*>}
 * @const
 */
export const emptyArray = Object.freeze([]);

/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
export const emptyObject = Object.freeze({});

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
export const toJSONOptions = {
  longs: String,
  enums: String,
  bytes: String,
  json: true
}

/**
 * Builds a getter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfGetter} Unbound getter
 */
export function getOneOf(fieldNames: string[]) {
  const fieldMap: Record<string, number> = {};
  for (let i = 0; i < fieldNames.length; ++i) {
    fieldMap[fieldNames[i]] = 1;
  }

  /**
   * @returns {string|undefined} Set field name, if any
   * @this Object
   * @ignore
   */
  return function oneOfGetter() {
    // eslint-disable-line consistent-return
    // @ts-ignore
    const keys = Object.keys(this);
    for (let i = keys.length - 1; i > -1; --i) {
      if (
        fieldMap[keys[i]] === 1 &&
        // @ts-ignore
        this[keys[i]] !== undefined &&
        // @ts-ignore
        this[keys[i]] !== null
      ) {
        return keys[i];
      }
    }
  };
}

/**
 * Builds a setter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfSetter} Unbound setter
 */
export function setOneOf(fieldNames: string[]) {
  /**
   * @param {string} name Field name
   * @returns {undefined}
   * @this Object
   * @ignore
   */
  return function oneOfSetter(name: string) {
    for (let i = 0; i < fieldNames.length; ++i) {
      if (fieldNames[i] !== name) {
        // @ts-ignore
        delete this[fieldNames[i]];
      }
    }
  };
}
