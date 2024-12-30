function _mergeNamespaces(n, m) {
	m.forEach(function (e) {
		e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
			if (k !== 'default' && !(k in n)) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	});
	return Object.freeze(n);
}

/**
 * Named roots.
 * This is where pbjs stores generated structures (the option `-r, --root` specifies a name).
 * Can also be used manually to make roots available across modules.
 * @name roots
 * @type {Object.<string,Root>}
 * @example
 * // pbjs -r myroot -o compiled.js ...
 *
 * // in another module:
 * require("./compiled.js");
 *
 * // in any subsequent module:
 * var root = protobuf.roots["myroot"];
 */
var root = {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var base64$1 = {};

var hasRequiredBase64;

function requireBase64 () {
	if (hasRequiredBase64) return base64$1;
	hasRequiredBase64 = 1;
	(function (exports) {

		/**
		 * A minimal base64 implementation for number arrays.
		 * @memberof util
		 * @namespace
		 */
		var base64 = exports;

		/**
		 * Calculates the byte length of a base64 encoded string.
		 * @param {string} string Base64 encoded string
		 * @returns {number} Byte length
		 */
		base64.length = function length(string) {
		    var p = string.length;
		    if (!p)
		        return 0;
		    var n = 0;
		    while (--p % 4 > 1 && string.charAt(p) === "=")
		        ++n;
		    return Math.ceil(string.length * 3) / 4 - n;
		};

		// Base64 encoding table
		var b64 = new Array(64);

		// Base64 decoding table
		var s64 = new Array(123);

		// 65..90, 97..122, 48..57, 43, 47
		for (var i = 0; i < 64;)
		    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;

		/**
		 * Encodes a buffer to a base64 encoded string.
		 * @param {Uint8Array} buffer Source buffer
		 * @param {number} start Source start
		 * @param {number} end Source end
		 * @returns {string} Base64 encoded string
		 */
		base64.encode = function encode(buffer, start, end) {
		    var parts = null,
		        chunk = [];
		    var i = 0, // output index
		        j = 0, // goto index
		        t;     // temporary
		    while (start < end) {
		        var b = buffer[start++];
		        switch (j) {
		            case 0:
		                chunk[i++] = b64[b >> 2];
		                t = (b & 3) << 4;
		                j = 1;
		                break;
		            case 1:
		                chunk[i++] = b64[t | b >> 4];
		                t = (b & 15) << 2;
		                j = 2;
		                break;
		            case 2:
		                chunk[i++] = b64[t | b >> 6];
		                chunk[i++] = b64[b & 63];
		                j = 0;
		                break;
		        }
		        if (i > 8191) {
		            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
		            i = 0;
		        }
		    }
		    if (j) {
		        chunk[i++] = b64[t];
		        chunk[i++] = 61;
		        if (j === 1)
		            chunk[i++] = 61;
		    }
		    if (parts) {
		        if (i)
		            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
		        return parts.join("");
		    }
		    return String.fromCharCode.apply(String, chunk.slice(0, i));
		};

		var invalidEncoding = "invalid encoding";

		/**
		 * Decodes a base64 encoded string to a buffer.
		 * @param {string} string Source string
		 * @param {Uint8Array} buffer Destination buffer
		 * @param {number} offset Destination offset
		 * @returns {number} Number of bytes written
		 * @throws {Error} If encoding is invalid
		 */
		base64.decode = function decode(string, buffer, offset) {
		    var start = offset;
		    var j = 0, // goto index
		        t;     // temporary
		    for (var i = 0; i < string.length;) {
		        var c = string.charCodeAt(i++);
		        if (c === 61 && j > 1)
		            break;
		        if ((c = s64[c]) === undefined)
		            throw Error(invalidEncoding);
		        switch (j) {
		            case 0:
		                t = c;
		                j = 1;
		                break;
		            case 1:
		                buffer[offset++] = t << 2 | (c & 48) >> 4;
		                t = c;
		                j = 2;
		                break;
		            case 2:
		                buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
		                t = c;
		                j = 3;
		                break;
		            case 3:
		                buffer[offset++] = (t & 3) << 6 | c;
		                j = 0;
		                break;
		        }
		    }
		    if (j === 1)
		        throw Error(invalidEncoding);
		    return offset - start;
		};

		/**
		 * Tests if the specified string appears to be base64 encoded.
		 * @param {string} string String to test
		 * @returns {boolean} `true` if probably base64 encoded, otherwise false
		 */
		base64.test = function test(string) {
		    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
		}; 
	} (base64$1));
	return base64$1;
}

var base64Exports = requireBase64();
var base64 = /*@__PURE__*/getDefaultExportFromCjs(base64Exports);

var index = /*#__PURE__*/_mergeNamespaces({
	__proto__: null,
	default: base64
}, [base64Exports]);

var float$1;
var hasRequiredFloat;

function requireFloat () {
	if (hasRequiredFloat) return float$1;
	hasRequiredFloat = 1;

	float$1 = factory(factory);

	/**
	 * Reads / writes floats / doubles from / to buffers.
	 * @name util.float
	 * @namespace
	 */

	/**
	 * Writes a 32 bit float to a buffer using little endian byte order.
	 * @name util.float.writeFloatLE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Writes a 32 bit float to a buffer using big endian byte order.
	 * @name util.float.writeFloatBE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Reads a 32 bit float from a buffer using little endian byte order.
	 * @name util.float.readFloatLE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Reads a 32 bit float from a buffer using big endian byte order.
	 * @name util.float.readFloatBE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Writes a 64 bit double to a buffer using little endian byte order.
	 * @name util.float.writeDoubleLE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Writes a 64 bit double to a buffer using big endian byte order.
	 * @name util.float.writeDoubleBE
	 * @function
	 * @param {number} val Value to write
	 * @param {Uint8Array} buf Target buffer
	 * @param {number} pos Target buffer offset
	 * @returns {undefined}
	 */

	/**
	 * Reads a 64 bit double from a buffer using little endian byte order.
	 * @name util.float.readDoubleLE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	/**
	 * Reads a 64 bit double from a buffer using big endian byte order.
	 * @name util.float.readDoubleBE
	 * @function
	 * @param {Uint8Array} buf Source buffer
	 * @param {number} pos Source buffer offset
	 * @returns {number} Value read
	 */

	// Factory function for the purpose of node-based testing in modified global environments
	function factory(exports) {

	    // float: typed array
	    if (typeof Float32Array !== "undefined") (function() {

	        var f32 = new Float32Array([ -0 ]),
	            f8b = new Uint8Array(f32.buffer),
	            le  = f8b[3] === 128;

	        function writeFloat_f32_cpy(val, buf, pos) {
	            f32[0] = val;
	            buf[pos    ] = f8b[0];
	            buf[pos + 1] = f8b[1];
	            buf[pos + 2] = f8b[2];
	            buf[pos + 3] = f8b[3];
	        }

	        function writeFloat_f32_rev(val, buf, pos) {
	            f32[0] = val;
	            buf[pos    ] = f8b[3];
	            buf[pos + 1] = f8b[2];
	            buf[pos + 2] = f8b[1];
	            buf[pos + 3] = f8b[0];
	        }

	        /* istanbul ignore next */
	        exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
	        /* istanbul ignore next */
	        exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;

	        function readFloat_f32_cpy(buf, pos) {
	            f8b[0] = buf[pos    ];
	            f8b[1] = buf[pos + 1];
	            f8b[2] = buf[pos + 2];
	            f8b[3] = buf[pos + 3];
	            return f32[0];
	        }

	        function readFloat_f32_rev(buf, pos) {
	            f8b[3] = buf[pos    ];
	            f8b[2] = buf[pos + 1];
	            f8b[1] = buf[pos + 2];
	            f8b[0] = buf[pos + 3];
	            return f32[0];
	        }

	        /* istanbul ignore next */
	        exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
	        /* istanbul ignore next */
	        exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;

	    // float: ieee754
	    })(); else (function() {

	        function writeFloat_ieee754(writeUint, val, buf, pos) {
	            var sign = val < 0 ? 1 : 0;
	            if (sign)
	                val = -val;
	            if (val === 0)
	                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
	            else if (isNaN(val))
	                writeUint(2143289344, buf, pos);
	            else if (val > 3.4028234663852886e+38) // +-Infinity
	                writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
	            else if (val < 1.1754943508222875e-38) // denormal
	                writeUint((sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0, buf, pos);
	            else {
	                var exponent = Math.floor(Math.log(val) / Math.LN2),
	                    mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
	                writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
	            }
	        }

	        exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
	        exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);

	        function readFloat_ieee754(readUint, buf, pos) {
	            var uint = readUint(buf, pos),
	                sign = (uint >> 31) * 2 + 1,
	                exponent = uint >>> 23 & 255,
	                mantissa = uint & 8388607;
	            return exponent === 255
	                ? mantissa
	                ? NaN
	                : sign * Infinity
	                : exponent === 0 // denormal
	                ? sign * 1.401298464324817e-45 * mantissa
	                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
	        }

	        exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
	        exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);

	    })();

	    // double: typed array
	    if (typeof Float64Array !== "undefined") (function() {

	        var f64 = new Float64Array([-0]),
	            f8b = new Uint8Array(f64.buffer),
	            le  = f8b[7] === 128;

	        function writeDouble_f64_cpy(val, buf, pos) {
	            f64[0] = val;
	            buf[pos    ] = f8b[0];
	            buf[pos + 1] = f8b[1];
	            buf[pos + 2] = f8b[2];
	            buf[pos + 3] = f8b[3];
	            buf[pos + 4] = f8b[4];
	            buf[pos + 5] = f8b[5];
	            buf[pos + 6] = f8b[6];
	            buf[pos + 7] = f8b[7];
	        }

	        function writeDouble_f64_rev(val, buf, pos) {
	            f64[0] = val;
	            buf[pos    ] = f8b[7];
	            buf[pos + 1] = f8b[6];
	            buf[pos + 2] = f8b[5];
	            buf[pos + 3] = f8b[4];
	            buf[pos + 4] = f8b[3];
	            buf[pos + 5] = f8b[2];
	            buf[pos + 6] = f8b[1];
	            buf[pos + 7] = f8b[0];
	        }

	        /* istanbul ignore next */
	        exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
	        /* istanbul ignore next */
	        exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;

	        function readDouble_f64_cpy(buf, pos) {
	            f8b[0] = buf[pos    ];
	            f8b[1] = buf[pos + 1];
	            f8b[2] = buf[pos + 2];
	            f8b[3] = buf[pos + 3];
	            f8b[4] = buf[pos + 4];
	            f8b[5] = buf[pos + 5];
	            f8b[6] = buf[pos + 6];
	            f8b[7] = buf[pos + 7];
	            return f64[0];
	        }

	        function readDouble_f64_rev(buf, pos) {
	            f8b[7] = buf[pos    ];
	            f8b[6] = buf[pos + 1];
	            f8b[5] = buf[pos + 2];
	            f8b[4] = buf[pos + 3];
	            f8b[3] = buf[pos + 4];
	            f8b[2] = buf[pos + 5];
	            f8b[1] = buf[pos + 6];
	            f8b[0] = buf[pos + 7];
	            return f64[0];
	        }

	        /* istanbul ignore next */
	        exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
	        /* istanbul ignore next */
	        exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;

	    // double: ieee754
	    })(); else (function() {

	        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
	            var sign = val < 0 ? 1 : 0;
	            if (sign)
	                val = -val;
	            if (val === 0) {
	                writeUint(0, buf, pos + off0);
	                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + off1);
	            } else if (isNaN(val)) {
	                writeUint(0, buf, pos + off0);
	                writeUint(2146959360, buf, pos + off1);
	            } else if (val > 1.7976931348623157e+308) { // +-Infinity
	                writeUint(0, buf, pos + off0);
	                writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
	            } else {
	                var mantissa;
	                if (val < 2.2250738585072014e-308) { // denormal
	                    mantissa = val / 5e-324;
	                    writeUint(mantissa >>> 0, buf, pos + off0);
	                    writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
	                } else {
	                    var exponent = Math.floor(Math.log(val) / Math.LN2);
	                    if (exponent === 1024)
	                        exponent = 1023;
	                    mantissa = val * Math.pow(2, -exponent);
	                    writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
	                    writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
	                }
	            }
	        }

	        exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
	        exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);

	        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
	            var lo = readUint(buf, pos + off0),
	                hi = readUint(buf, pos + off1);
	            var sign = (hi >> 31) * 2 + 1,
	                exponent = hi >>> 20 & 2047,
	                mantissa = 4294967296 * (hi & 1048575) + lo;
	            return exponent === 2047
	                ? mantissa
	                ? NaN
	                : sign * Infinity
	                : exponent === 0 // denormal
	                ? sign * 5e-324 * mantissa
	                : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
	        }

	        exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
	        exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);

	    })();

	    return exports;
	}

	// uint helpers

	function writeUintLE(val, buf, pos) {
	    buf[pos    ] =  val        & 255;
	    buf[pos + 1] =  val >>> 8  & 255;
	    buf[pos + 2] =  val >>> 16 & 255;
	    buf[pos + 3] =  val >>> 24;
	}

	function writeUintBE(val, buf, pos) {
	    buf[pos    ] =  val >>> 24;
	    buf[pos + 1] =  val >>> 16 & 255;
	    buf[pos + 2] =  val >>> 8  & 255;
	    buf[pos + 3] =  val        & 255;
	}

	function readUintLE(buf, pos) {
	    return (buf[pos    ]
	          | buf[pos + 1] << 8
	          | buf[pos + 2] << 16
	          | buf[pos + 3] << 24) >>> 0;
	}

	function readUintBE(buf, pos) {
	    return (buf[pos    ] << 24
	          | buf[pos + 1] << 16
	          | buf[pos + 2] << 8
	          | buf[pos + 3]) >>> 0;
	}
	return float$1;
}

var floatExports = requireFloat();
var float = /*@__PURE__*/getDefaultExportFromCjs(floatExports);

var utf8$1 = {};

var hasRequiredUtf8;

function requireUtf8 () {
	if (hasRequiredUtf8) return utf8$1;
	hasRequiredUtf8 = 1;
	(function (exports) {

		/**
		 * A minimal UTF8 implementation for number arrays.
		 * @memberof util
		 * @namespace
		 */
		var utf8 = exports;

		/**
		 * Calculates the UTF8 byte length of a string.
		 * @param {string} string String
		 * @returns {number} Byte length
		 */
		utf8.length = function utf8_length(string) {
		    var len = 0,
		        c = 0;
		    for (var i = 0; i < string.length; ++i) {
		        c = string.charCodeAt(i);
		        if (c < 128)
		            len += 1;
		        else if (c < 2048)
		            len += 2;
		        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
		            ++i;
		            len += 4;
		        } else
		            len += 3;
		    }
		    return len;
		};

		/**
		 * Reads UTF8 bytes as a string.
		 * @param {Uint8Array} buffer Source buffer
		 * @param {number} start Source start
		 * @param {number} end Source end
		 * @returns {string} String read
		 */
		utf8.read = function utf8_read(buffer, start, end) {
		    var len = end - start;
		    if (len < 1)
		        return "";
		    var parts = null,
		        chunk = [],
		        i = 0, // char offset
		        t;     // temporary
		    while (start < end) {
		        t = buffer[start++];
		        if (t < 128)
		            chunk[i++] = t;
		        else if (t > 191 && t < 224)
		            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
		        else if (t > 239 && t < 365) {
		            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
		            chunk[i++] = 0xD800 + (t >> 10);
		            chunk[i++] = 0xDC00 + (t & 1023);
		        } else
		            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
		        if (i > 8191) {
		            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
		            i = 0;
		        }
		    }
		    if (parts) {
		        if (i)
		            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
		        return parts.join("");
		    }
		    return String.fromCharCode.apply(String, chunk.slice(0, i));
		};

		/**
		 * Writes a string as UTF8 bytes.
		 * @param {string} string Source string
		 * @param {Uint8Array} buffer Destination buffer
		 * @param {number} offset Destination offset
		 * @returns {number} Bytes written
		 */
		utf8.write = function utf8_write(string, buffer, offset) {
		    var start = offset,
		        c1, // character 1
		        c2; // character 2
		    for (var i = 0; i < string.length; ++i) {
		        c1 = string.charCodeAt(i);
		        if (c1 < 128) {
		            buffer[offset++] = c1;
		        } else if (c1 < 2048) {
		            buffer[offset++] = c1 >> 6       | 192;
		            buffer[offset++] = c1       & 63 | 128;
		        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
		            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
		            ++i;
		            buffer[offset++] = c1 >> 18      | 240;
		            buffer[offset++] = c1 >> 12 & 63 | 128;
		            buffer[offset++] = c1 >> 6  & 63 | 128;
		            buffer[offset++] = c1       & 63 | 128;
		        } else {
		            buffer[offset++] = c1 >> 12      | 224;
		            buffer[offset++] = c1 >> 6  & 63 | 128;
		            buffer[offset++] = c1       & 63 | 128;
		        }
		    }
		    return offset - start;
		}; 
	} (utf8$1));
	return utf8$1;
}

var utf8Exports = requireUtf8();
var utf8 = /*@__PURE__*/getDefaultExportFromCjs(utf8Exports);

// import { LongBits } from "../dts";
function indexOutOfRange(reader, writeLength) {
    return RangeError("index out of range: " +
        reader.pos +
        " + " +
        (writeLength || 1) +
        " > " +
        reader.len);
}
class Reader {
    /**
     * Creates a new reader using the specified buffer.
     * @function
     * @param {Uint8Array|Buffer} buffer Buffer to read from
     * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
     * @throws {Error} If `buffer` is not a valid buffer
     */
    static create(buffer) {
        if (buffer instanceof Uint8Array) {
            return new Reader(buffer);
        }
        throw Error("illegal buffer");
    }
    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    buf;
    /**
     * Read buffer position.
     * @type {number}
     */
    pos;
    /**
     * Read buffer length.
     * @type {number}
     */
    len;
    /**
     * Constructs a new reader instance using the specified buffer.
     * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
     * @constructor
     * @param {Uint8Array} buffer Buffer to read from
     */
    constructor(buffer) {
        this.buf = buffer;
        this.pos = 0;
        this.len = buffer.length;
    }
    slice(buf, begin, end) {
        return buf.subarray(begin, end);
    }
    // private readLongVarint() {
    //   // tends to deopt with local vars for octet etc.
    //   const bits = new LongBits(0, 0);
    //   let i = 0;
    //   if (this.len - this.pos > 4) {
    //     // fast route (lo)
    //     for (let i = 0; i < 4; ++i) {
    //       // 1st..4th
    //       bits.lo = (bits.lo | ((this.buf[this.pos] & 127) << (i * 7))) >>> 0;
    //       if (this.buf[this.pos++] < 128) {
    //         return bits;
    //       }
    //     }
    //     // 5th
    //     bits.lo = (bits.lo | ((this.buf[this.pos] & 127) << 28)) >>> 0;
    //     bits.hi = (bits.hi | ((this.buf[this.pos] & 127) >> 4)) >>> 0;
    //     if (this.buf[this.pos++] < 128) {
    //       return bits;
    //     }
    //     i = 0;
    //   } else {
    //     for (; i < 3; ++i) {
    //       /* istanbul ignore if */
    //       if (this.pos >= this.len) {
    //         throw indexOutOfRange(this);
    //       }
    //       // 1st..3th
    //       bits.lo = (bits.lo | ((this.buf[this.pos] & 127) << (i * 7))) >>> 0;
    //       if (this.buf[this.pos++] < 128) {
    //         return bits;
    //       }
    //     }
    //     // 4th
    //     bits.lo = (bits.lo | ((this.buf[this.pos++] & 127) << (i * 7))) >>> 0;
    //     return bits;
    //   }
    //   if (this.len - this.pos > 4) {
    //     // fast route (hi)
    //     for (; i < 5; ++i) {
    //       // 6th..10th
    //       bits.hi = (bits.hi | ((this.buf[this.pos] & 127) << (i * 7 + 3))) >>> 0;
    //       if (this.buf[this.pos++] < 128) {
    //         return bits;
    //       }
    //     }
    //   } else {
    //     for (; i < 5; ++i) {
    //       /* istanbul ignore if */
    //       if (this.pos >= this.len) {
    //         throw indexOutOfRange(this);
    //       }
    //       // 6th..10th
    //       bits.hi = (bits.hi | ((this.buf[this.pos] & 127) << (i * 7 + 3))) >>> 0;
    //       if (this.buf[this.pos++] < 128) {
    //         return bits;
    //       }
    //     }
    //   }
    //   /* istanbul ignore next */
    //   throw Error("invalid varint encoding");
    // }
    // private readFixed32_end(buf: Uint8Array, end: number) {
    //   // note that this uses `end`, not `pos`
    //   return (
    //     (buf[end - 4] |
    //       (buf[end - 3] << 8) |
    //       (buf[end - 2] << 16) |
    //       (buf[end - 1] << 24)) >>>
    //     0
    //   );
    // }
    // private readFixed64(/* this: Reader */) {
    //   /* istanbul ignore if */
    //   if (this.pos + 8 > this.len) throw indexOutOfRange(this, 8);
    //   return new LongBits(
    //     this.readFixed32_end(this.buf, (this.pos += 4)),
    //     this.readFixed32_end(this.buf, (this.pos += 4))
    //   );
    // }
    /**
     * Reads a varint as an unsigned 32 bit value.
     * @function
     * @returns {number} Value read
     */
    uint32() {
        let value = 4294967295;
        value = (this.buf[this.pos] & 127) >>> 0;
        if (this.buf[this.pos++] < 128) {
            return value;
        }
        value = (value | ((this.buf[this.pos] & 127) << 7)) >>> 0;
        if (this.buf[this.pos++] < 128) {
            return value;
        }
        value = (value | ((this.buf[this.pos] & 127) << 14)) >>> 0;
        if (this.buf[this.pos++] < 128) {
            return value;
        }
        value = (value | ((this.buf[this.pos] & 127) << 21)) >>> 0;
        if (this.buf[this.pos++] < 128) {
            return value;
        }
        value = (value | ((this.buf[this.pos] & 15) << 28)) >>> 0;
        if (this.buf[this.pos++] < 128) {
            return value;
        }
        if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
        }
        return value;
    }
    /**
     * Reads a varint as a signed 32 bit value.
     * @returns {number} Value read
     */
    int32() {
        return this.uint32() | 0;
    }
    /**
     * Reads a zig-zag encoded varint as a signed 32 bit value.
     * @returns {number} Value read
     */
    // sint32() {
    //   const value = this.uint32();
    //   return ((value >>> 1) ^ -(value & 1)) | 0;
    // }
    /**
     * Reads a varint as an unsigned 64 bit value.
     * @name Reader#uint64
     * @function
     * @returns {Long} Value read
     */
    // uint64() {
    //   return this.readLongVarint().toNumber(true);
    // }
    /**
     * Reads a varint as a signed 64 bit value.
     * @name Reader#int64
     * @function
     * @returns {Long} Value read
     */
    // int64() {
    //   return this.readLongVarint().toNumber(false);
    // }
    /**
     * Reads a zig-zag encoded varint as a signed 64 bit value.
     * @name Reader#sint64
     * @function
     * @returns {Long} Value read
     */
    // sint64() {
    //   return this.readLongVarint().zzDecode().toNumber(false);
    // }
    /**
     * Reads a varint as a boolean.
     * @returns {boolean} Value read
     */
    // bool() {
    //   return this.uint32() !== 0;
    // }
    /**
     * Reads fixed 32 bits as an unsigned 32 bit integer.
     * @returns {number} Value read
     */
    // fixed32() {
    //   if (this.pos + 4 > this.len) {
    //     throw indexOutOfRange(this, 4);
    //   }
    //   return this.readFixed32_end(this.buf, (this.pos += 4));
    // }
    /**
     * Reads fixed 32 bits as a signed 32 bit integer.
     * @returns {number} Value read
     */
    // sfixed32() {
    //   if (this.pos + 4 > this.len) {
    //     throw indexOutOfRange(this, 4);
    //   }
    //   return this.readFixed32_end(this.buf, (this.pos += 4)) | 0;
    // }
    /**
     * Reads fixed 64 bits.
     * @name Reader#fixed64
     * @function
     * @returns {Long} Value read
     */
    // fixed64() {
    //   return this.readFixed64().toNumber(true);
    // }
    /**
     * Reads zig-zag encoded fixed 64 bits.
     * @name Reader#sfixed64
     * @function
     * @returns {Long} Value read
     */
    // sfixed64() {
    //   return this.readFixed64().zzDecode().toNumber(false);
    // }
    /**
     * Reads a float (32 bit) as a number.
     * @function
     * @returns {number} Value read
     */
    float() {
        if (this.pos + 4 > this.len) {
            throw indexOutOfRange(this, 4);
        }
        const value = float.readFloatLE(this.buf, this.pos);
        this.pos += 4;
        return value;
    }
    /**
     * Reads a double (64 bit float) as a number.
     * @function
     * @returns {number} Value read
     */
    // double() {
    //   if (this.pos + 8 > this.len) {
    //     throw indexOutOfRange(this, 4);
    //   }
    //   const value = float.readDoubleLE(this.buf, this.pos);
    //   this.pos += 8;
    //   return value;
    // }
    /**
     * Reads a sequence of bytes preceeded by its length as a varint.
     * @returns {Uint8Array} Value read
     */
    bytes() {
        const length = this.uint32();
        const start = this.pos;
        const end = this.pos + length;
        if (end > this.len) {
            throw indexOutOfRange(this, length);
        }
        this.pos += length;
        if (start === end) {
            return new Uint8Array(0);
        }
        return this.slice(this.buf, start, end);
    }
    /**
     * Reads a string preceeded by its byte length as a varint.
     * @returns {string} Value read
     */
    string() {
        const bytes = this.bytes();
        return utf8.read(bytes, 0, bytes.length);
    }
    /**
     * Skips the specified number of bytes if specified, otherwise skips a varint.
     * @param {number} [length] Length if known, otherwise a varint is assumed
     * @returns {Reader} `this`
     */
    skip(length) {
        if (typeof length === "number") {
            /* istanbul ignore if */
            if (this.pos + length > this.len) {
                throw indexOutOfRange(this, length);
            }
            this.pos += length;
        }
        else {
            do {
                /* istanbul ignore if */
                if (this.pos >= this.len) {
                    throw indexOutOfRange(this);
                }
            } while (this.buf[this.pos++] & 128);
        }
        return this;
    }
    /**
     * Skips the next element of the specified wire type.
     * @param {number} wireType Wire type received
     * @returns {Reader} `this`
     */
    skipType(wireType) {
        switch (wireType) {
            case 0:
                this.skip();
                break;
            case 1:
                this.skip(8);
                break;
            case 2:
                this.skip(this.uint32());
                break;
            case 3:
                while ((wireType = this.uint32() & 7) !== 4) {
                    this.skipType(wireType);
                }
                break;
            case 5:
                this.skip(4);
                break;
            /* istanbul ignore next */
            default:
                throw Error("invalid wire type " + wireType + " at offset " + this.pos);
        }
        return this;
    }
}

/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
const emptyObject = Object.freeze({});
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
const toJSONOptions = {
    longs: String,
    enums: String,
    bytes: String,
    json: true
};

class Layout {
    /**
     * Creates a new Layout instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {com.opensource.svga.ILayout=} [properties] Properties to set
     * @returns {com.opensource.svga.Layout} Layout instance
     */
    static create(properties) {
        return new Layout(properties);
    }
    /**
     * Encodes the specified Layout message. Does not implicitly {@link com.opensource.svga.Layout.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {com.opensource.svga.ILayout} message Layout message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: Layout, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.x != null && Object.hasOwn(message, "x")) {
    //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.x);
    //   }
    //   if (message.y != null && Object.hasOwn(message, "y")) {
    //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.y);
    //   }
    //   if (message.width != null && Object.hasOwn(message, "width")) {
    //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.width);
    //   }
    //   if (message.height != null && Object.hasOwn(message, "height")) {
    //     writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.height);
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified Layout message, length delimited. Does not implicitly {@link com.opensource.svga.Layout.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {com.opensource.svga.ILayout} message Layout message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: Layout, writer: Writer): Writer {
    //   return Layout.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a Layout message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Layout} Layout
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        const end = length === undefined ? reader.len : reader.pos + length;
        const message = new Layout();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.x = reader.float();
                    break;
                }
                case 2: {
                    message.y = reader.float();
                    break;
                }
                case 3: {
                    message.width = reader.float();
                    break;
                }
                case 4: {
                    message.height = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a Layout message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.Layout} Layout
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return Layout.decode(reader, reader.uint32());
    }
    /**
     * Verifies a Layout message.
     * @function verify
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (message.x != null && message.hasOwnProperty("x")) {
    //     if (typeof message.x !== "number") {
    //       return "x: number expected";
    //     }
    //   }
    //   if (message.y != null && message.hasOwnProperty("y")) {
    //     if (typeof message.y !== "number") {
    //       return "y: number expected";
    //     }
    //   }
    //   if (message.width != null && message.hasOwnProperty("width")) {
    //     if (typeof message.width !== "number") {
    //       return "width: number expected";
    //     }
    //   }
    //   if (message.height != null && message.hasOwnProperty("height")) {
    //     if (typeof message.height !== "number") {
    //       return "height: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a Layout message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.Layout} Layout
     */
    // static fromObject(object: Record<string, any>): Layout {
    //   if (object instanceof Layout) {
    //     return object;
    //   }
    //   const message = new Layout();
    //   if (object.x != null) {
    //     message.x = +object.x;
    //   }
    //   if (object.y != null) {
    //     message.y = +object.y;
    //   }
    //   if (object.width != null) {
    //     message.width = +object.width;
    //   }
    //   if (object.height != null) {
    //     message.height = +object.height;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a Layout message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {com.opensource.svga.Layout} message Layout
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.defaults) {
            object.x = 0;
            object.y = 0;
            object.width = 0;
            object.height = 0;
        }
        if (message.x != null && message.hasOwnProperty("x")) {
            object.x =
                options.json && !isFinite(message.x) ? "" + message.x : message.x;
        }
        if (message.y != null && message.hasOwnProperty("y")) {
            object.y =
                options.json && !isFinite(message.y) ? "" + message.y : message.y;
        }
        if (message.width != null && message.hasOwnProperty("width")) {
            object.width =
                options.json && !isFinite(message.width)
                    ? "" + message.width
                    : message.width;
        }
        if (message.height != null && message.hasOwnProperty("height")) {
            object.height =
                options.json && !isFinite(message.height)
                    ? "" + message.height
                    : message.height;
        }
        return object;
    }
    /**
     * Gets the default type url for Layout
     * @function getTypeUrl
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.Layout";
    }
    /**
     * Layout x.
     * @member {number} x
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    x = 0;
    /**
     * Layout y.
     * @member {number} y
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    y = 0;
    /**
     * Layout width.
     * @member {number} width
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    width = 0;
    /**
     * Layout height.
     * @member {number} height
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    height = 0;
    /**
     * Constructs a new Layout.
     * @memberof com.opensource.svga
     * @classdesc Represents a Layout.
     * @implements ILayout
     * @constructor
     * @param {com.opensource.svga.ILayout=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.x != null) {
                this.x = properties.x;
            }
            if (properties.y != null) {
                this.y = properties.y;
            }
            if (properties.width != null) {
                this.width = properties.width;
            }
            if (properties.height != null) {
                this.height = properties.height;
            }
        }
    }
    /**
     * Converts this Layout to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.Layout
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return Layout.toObject(this, toJSONOptions);
    }
}

class Transform {
    /**
     * Creates a new Transform instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {com.opensource.svga.ITransform=} [properties] Properties to set
     * @returns {com.opensource.svga.Transform} Transform instance
     */
    static create(properties) {
        return new Transform(properties);
    }
    /**
     * Encodes the specified Transform message. Does not implicitly {@link com.opensource.svga.Transform.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {com.opensource.svga.ITransform} message Transform message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: Transform, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.a != null && Object.hasOwn(message, "a")) {
    //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.a);
    //   }
    //   if (message.b != null && Object.hasOwn(message, "b")) {
    //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.b);
    //   }
    //   if (message.c != null && Object.hasOwn(message, "c")) {
    //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.c);
    //   }
    //   if (message.d != null && Object.hasOwn(message, "d")) {
    //     writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.d);
    //   }
    //   if (message.tx != null && Object.hasOwn(message, "tx")) {
    //     writer.uint32(/* id 5, wireType 5 =*/ 45).float(message.tx);
    //   }
    //   if (message.ty != null && Object.hasOwn(message, "ty")) {
    //     writer.uint32(/* id 6, wireType 5 =*/ 53).float(message.ty);
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified Transform message, length delimited. Does not implicitly {@link com.opensource.svga.Transform.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {com.opensource.svga.ITransform} message Transform message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: Transform, writer: Writer): Writer {
    //   return Transform.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a Transform message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Transform} Transform
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        let end = length === undefined ? reader.len : reader.pos + length;
        let message = new Transform();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.a = reader.float();
                    break;
                }
                case 2: {
                    message.b = reader.float();
                    break;
                }
                case 3: {
                    message.c = reader.float();
                    break;
                }
                case 4: {
                    message.d = reader.float();
                    break;
                }
                case 5: {
                    message.tx = reader.float();
                    break;
                }
                case 6: {
                    message.ty = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a Transform message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.Transform} Transform
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return this.decode(reader, reader.uint32());
    }
    /**
     * Verifies a Transform message.
     * @function verify
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>) {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (message.a != null && message.hasOwnProperty("a")) {
    //     if (typeof message.a !== "number") {
    //       return "a: number expected";
    //     }
    //   }
    //   if (message.b != null && message.hasOwnProperty("b")) {
    //     if (typeof message.b !== "number") {
    //       return "b: number expected";
    //     }
    //   }
    //   if (message.c != null && message.hasOwnProperty("c")) {
    //     if (typeof message.c !== "number") {
    //       return "c: number expected";
    //     }
    //   }
    //   if (message.d != null && message.hasOwnProperty("d")) {
    //     if (typeof message.d !== "number") {
    //       return "d: number expected";
    //     }
    //   }
    //   if (message.tx != null && message.hasOwnProperty("tx")) {
    //     if (typeof message.tx !== "number") {
    //       return "tx: number expected";
    //     }
    //   }
    //   if (message.ty != null && message.hasOwnProperty("ty")) {
    //     if (typeof message.ty !== "number") {
    //       return "ty: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a Transform message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.Transform} Transform
     */
    // static fromObject(object: Record<string, any>): Transform {
    //   if (object instanceof Transform) {
    //     return object;
    //   }
    //   let message = new Transform();
    //   if (object.a != null) {
    //     message.a = +object.a;
    //   }
    //   if (object.b != null) {
    //     message.b = +object.b;
    //   }
    //   if (object.c != null) {
    //     message.c = +object.c;
    //   }
    //   if (object.d != null) {
    //     message.d = +object.d;
    //   }
    //   if (object.tx != null) {
    //     message.tx = +object.tx;
    //   }
    //   if (object.ty != null) {
    //     message.ty = +object.ty;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a Transform message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {com.opensource.svga.Transform} message Transform
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        let object = {};
        if (options.defaults) {
            object.a = 0;
            object.b = 0;
            object.c = 0;
            object.d = 0;
            object.tx = 0;
            object.ty = 0;
        }
        if (message.a != null && message.hasOwnProperty("a")) {
            object.a =
                options.json && !isFinite(message.a) ? "" + message.a : message.a;
        }
        if (message.b != null && message.hasOwnProperty("b")) {
            object.b =
                options.json && !isFinite(message.b) ? "" + message.b : message.b;
        }
        if (message.c != null && message.hasOwnProperty("c")) {
            object.c =
                options.json && !isFinite(message.c) ? "" + message.c : message.c;
        }
        if (message.d != null && message.hasOwnProperty("d")) {
            object.d =
                options.json && !isFinite(message.d) ? "" + message.d : message.d;
        }
        if (message.tx != null && message.hasOwnProperty("tx")) {
            object.tx =
                options.json && !isFinite(message.tx) ? "" + message.tx : message.tx;
        }
        if (message.ty != null && message.hasOwnProperty("ty")) {
            object.ty =
                options.json && !isFinite(message.ty) ? "" + message.ty : message.ty;
        }
        return object;
    }
    /**
     * Gets the default type url for Transform
     * @function getTypeUrl
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.Transform";
    }
    /**
     * Transform a.
     * @member {number} a
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    a = 0;
    /**
     * Transform b.
     * @member {number} b
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    b = 0;
    /**
     * Transform c.
     * @member {number} c
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    c = 0;
    /**
     * Transform d.
     * @member {number} d
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    d = 0;
    /**
     * Transform tx.
     * @member {number} tx
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    tx = 0;
    /**
     * Transform ty.
     * @member {number} ty
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    ty = 0;
    /**
     * Constructs a new Transform.
     * @memberof com.opensource.svga
     * @classdesc Represents a Transform.
     * @implements ITransform
     * @constructor
     * @param {com.opensource.svga.ITransform=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.a != null) {
                this.a = properties.a;
            }
            if (properties.b != null) {
                this.b = properties.b;
            }
            if (properties.c != null) {
                this.c = properties.c;
            }
            if (properties.d != null) {
                this.d = properties.d;
            }
            if (properties.tx != null) {
                this.tx = properties.tx;
            }
            if (properties.ty != null) {
                this.ty = properties.ty;
            }
        }
    }
    /**
     * Converts this Transform to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.Transform
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return Transform.toObject(this, toJSONOptions);
    }
}

/**
 * ShapeType enum.
 * @name com.opensource.svga.ShapeEntity.ShapeType
 * @enum {number}
 * @property {number} SHAPE=0 SHAPE value
 * @property {number} RECT=1 RECT value
 * @property {number} ELLIPSE=2 ELLIPSE value
 * @property {number} KEEP=3 KEEP value
 */
var ShapeType;
(function (ShapeType) {
    ShapeType[ShapeType["SHAPE"] = 0] = "SHAPE";
    ShapeType[ShapeType["RECT"] = 1] = "RECT";
    ShapeType[ShapeType["ELLIPSE"] = 2] = "ELLIPSE";
    ShapeType[ShapeType["KEEP"] = 3] = "KEEP";
})(ShapeType || (ShapeType = {}));
var ShapeType$1 = ShapeType;

class ShapeArgs {
    /**
     * Creates a new ShapeArgs instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IShapeArgs=} [properties] Properties to set
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs instance
     */
    static create(properties) {
        return new ShapeArgs(properties);
    }
    /**
     * Encodes the specified ShapeArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeArgs.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IShapeArgs} message ShapeArgs message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: ShapeArgs, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.d != null && Object.hasOwn(message, "d")) {
    //     writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.d);
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified ShapeArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeArgs.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IShapeArgs} message ShapeArgs message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: ShapeArgs, writer: Writer): Writer {
    //   return ShapeArgs.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a ShapeArgs message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        const end = length === undefined ? reader.len : reader.pos + length;
        const message = new ShapeEntity.ShapeArgs();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.d = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a ShapeArgs message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return ShapeArgs.decode(reader, reader.uint32());
    }
    /**
     * Verifies a ShapeArgs message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (message.d != null && message.hasOwnProperty("d")) {
    //     if (!isString(message.d)) {
    //       return "d: string expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a ShapeArgs message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     */
    // static fromObject(object: Record<string, any>): ShapeArgs {
    //   if (object instanceof ShapeEntity.ShapeArgs) {
    //     return object;
    //   }
    //   const message = new ShapeEntity.ShapeArgs();
    //   if (object.d != null) {
    //     message.d = "" + object.d;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a ShapeArgs message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeArgs} message ShapeArgs
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.defaults) {
            object.d = "";
        }
        if (message.d != null && message.hasOwnProperty("d")) {
            object.d = message.d;
        }
        return object;
    }
    /**
     * Gets the default type url for ShapeArgs
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeArgs";
    }
    d = "";
    /**
     * Constructs a new ShapeArgs.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents a ShapeArgs.
     * @implements IShapeArgs
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IShapeArgs=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.d != null) {
                this.d = properties.d;
            }
        }
    }
    /**
     * Converts this ShapeArgs to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return ShapeArgs.toObject(this, toJSONOptions);
    }
}

class RectArgs {
    /**
     * Creates a new RectArgs instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IRectArgs=} [properties] Properties to set
     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs instance
     */
    static create(properties) {
        return new RectArgs(properties);
    }
    /**
     * Encodes the specified RectArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.RectArgs.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IRectArgs} message RectArgs message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: RectArgs, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.x != null && Object.hasOwn(message, "x")) {
    //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.x);
    //   }
    //   if (message.y != null && Object.hasOwn(message, "y")) {
    //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.y);
    //   }
    //   if (message.width != null && Object.hasOwn(message, "width")) {
    //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.width);
    //   }
    //   if (message.height != null && Object.hasOwn(message, "height")) {
    //     writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.height);
    //   }
    //   if (
    //     message.cornerRadius != null &&
    //     Object.hasOwn(message, "cornerRadius")
    //   ) {
    //     writer.uint32(/* id 5, wireType 5 =*/ 45).float(message.cornerRadius);
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified RectArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.RectArgs.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IRectArgs} message RectArgs message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: RectArgs, writer: Writer): Writer {
    //   return RectArgs.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a RectArgs message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        const end = length === undefined ? reader.len : reader.pos + length;
        const message = new ShapeEntity.RectArgs();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.x = reader.float();
                    break;
                }
                case 2: {
                    message.y = reader.float();
                    break;
                }
                case 3: {
                    message.width = reader.float();
                    break;
                }
                case 4: {
                    message.height = reader.float();
                    break;
                }
                case 5: {
                    message.cornerRadius = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a RectArgs message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return RectArgs.decode(reader, reader.uint32());
    }
    /**
     * Verifies a RectArgs message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (message.x != null && message.hasOwnProperty("x")) {
    //     if (typeof message.x !== "number") {
    //       return "x: number expected";
    //     }
    //   }
    //   if (message.y != null && message.hasOwnProperty("y")) {
    //     if (typeof message.y !== "number") {
    //       return "y: number expected";
    //     }
    //   }
    //   if (message.width != null && message.hasOwnProperty("width")) {
    //     if (typeof message.width !== "number") {
    //       return "width: number expected";
    //     }
    //   }
    //   if (message.height != null && message.hasOwnProperty("height")) {
    //     if (typeof message.height !== "number") {
    //       return "height: number expected";
    //     }
    //   }
    //   if (
    //     message.cornerRadius != null &&
    //     message.hasOwnProperty("cornerRadius")
    //   ) {
    //     if (typeof message.cornerRadius !== "number") {
    //       return "cornerRadius: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a RectArgs message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
     */
    // static fromObject(object: Record<string, any>): RectArgs {
    //   if (object instanceof ShapeEntity.RectArgs) {
    //     return object;
    //   }
    //   const message = new ShapeEntity.RectArgs();
    //   if (object.x != null) {
    //     message.x = +object.x;
    //   }
    //   if (object.y != null) {
    //     message.y = +object.y;
    //   }
    //   if (object.width != null) {
    //     message.width = +object.width;
    //   }
    //   if (object.height != null) {
    //     message.height = +object.height;
    //   }
    //   if (object.cornerRadius != null) {
    //     message.cornerRadius = +object.cornerRadius;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a RectArgs message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.RectArgs} message RectArgs
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.defaults) {
            object.x = 0;
            object.y = 0;
            object.width = 0;
            object.height = 0;
            object.cornerRadius = 0;
        }
        if (message.x != null && message.hasOwnProperty("x")) {
            object.x =
                options.json && !isFinite(message.x) ? "" + message.x : message.x;
        }
        if (message.y != null && message.hasOwnProperty("y")) {
            object.y =
                options.json && !isFinite(message.y) ? "" + message.y : message.y;
        }
        if (message.width != null && message.hasOwnProperty("width")) {
            object.width =
                options.json && !isFinite(message.width)
                    ? "" + message.width
                    : message.width;
        }
        if (message.height != null && message.hasOwnProperty("height")) {
            object.height =
                options.json && !isFinite(message.height)
                    ? "" + message.height
                    : message.height;
        }
        if (message.cornerRadius != null &&
            message.hasOwnProperty("cornerRadius")) {
            object.cornerRadius =
                options.json && !isFinite(message.cornerRadius)
                    ? "" + message.cornerRadius
                    : message.cornerRadius;
        }
        return object;
    }
    /**
     * Gets the default type url for RectArgs
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.RectArgs";
    }
    /**
     * RectArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    x = 0;
    /**
     * RectArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    y = 0;
    /**
     * RectArgs width.
     * @member {number} width
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    width = 0;
    /**
     * RectArgs height.
     * @member {number} height
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    height = 0;
    /**
     * RectArgs cornerRadius.
     * @member {number} cornerRadius
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    cornerRadius = 0;
    /**
     * Constructs a new RectArgs.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents a RectArgs.
     * @implements IRectArgs
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IRectArgs=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.x != null) {
                this.x = properties.x;
            }
            if (properties.y != null) {
                this.y = properties.y;
            }
            if (properties.width != null) {
                this.width = properties.width;
            }
            if (properties.height != null) {
                this.height = properties.height;
            }
            if (properties.cornerRadius != null) {
                this.cornerRadius = properties.cornerRadius;
            }
        }
    }
    /**
     * Converts this RectArgs to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return RectArgs.toObject(this, toJSONOptions);
    }
}

class EllipseArgs {
    /**
     * Creates a new EllipseArgs instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs instance
     */
    static create(properties) {
        return new EllipseArgs(properties);
    }
    /**
     * Encodes the specified EllipseArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.EllipseArgs.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs} message EllipseArgs message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: EllipseArgs, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.x != null && Object.hasOwn(message, "x")) {
    //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.x);
    //   }
    //   if (message.y != null && Object.hasOwn(message, "y")) {
    //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.y);
    //   }
    //   if (message.radiusX != null && Object.hasOwn(message, "radiusX")) {
    //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.radiusX);
    //   }
    //   if (message.radiusY != null && Object.hasOwn(message, "radiusY")) {
    //     writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.radiusY);
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified EllipseArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.EllipseArgs.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs} message EllipseArgs message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: EllipseArgs, writer: Writer): Writer {
    //   return EllipseArgs.encode(message, writer).ldelim();
    // }
    /**
     * Decodes an EllipseArgs message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        const end = length === undefined ? reader.len : reader.pos + length;
        const message = new ShapeEntity.EllipseArgs();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.x = reader.float();
                    break;
                }
                case 2: {
                    message.y = reader.float();
                    break;
                }
                case 3: {
                    message.radiusX = reader.float();
                    break;
                }
                case 4: {
                    message.radiusY = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes an EllipseArgs message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return EllipseArgs.decode(reader, reader.uint32());
    }
    /**
     * Verifies an EllipseArgs message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (message.x != null && message.hasOwnProperty("x")) {
    //     if (typeof message.x !== "number") {
    //       return "x: number expected";
    //     }
    //   }
    //   if (message.y != null && message.hasOwnProperty("y")) {
    //     if (typeof message.y !== "number") {
    //       return "y: number expected";
    //     }
    //   }
    //   if (message.radiusX != null && message.hasOwnProperty("radiusX")) {
    //     if (typeof message.radiusX !== "number") {
    //       return "radiusX: number expected";
    //     }
    //   }
    //   if (message.radiusY != null && message.hasOwnProperty("radiusY")) {
    //     if (typeof message.radiusY !== "number") {
    //       return "radiusY: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates an EllipseArgs message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     */
    // static fromObject(object: Record<string, any>): EllipseArgs {
    //   if (object instanceof ShapeEntity.EllipseArgs) {
    //     return object;
    //   }
    //   const message = new ShapeEntity.EllipseArgs();
    //   if (object.x != null) {
    //     message.x = +object.x;
    //   }
    //   if (object.y != null) {
    //     message.y = +object.y;
    //   }
    //   if (object.radiusX != null) {
    //     message.radiusX = +object.radiusX;
    //   }
    //   if (object.radiusY != null) {
    //     message.radiusY = +object.radiusY;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from an EllipseArgs message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {com.opensource.svga.ShapeEntity.EllipseArgs} message EllipseArgs
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.defaults) {
            object.x = 0;
            object.y = 0;
            object.radiusX = 0;
            object.radiusY = 0;
        }
        if (message.x != null && message.hasOwnProperty("x")) {
            object.x =
                options.json && !isFinite(message.x) ? "" + message.x : message.x;
        }
        if (message.y != null && message.hasOwnProperty("y")) {
            object.y =
                options.json && !isFinite(message.y) ? "" + message.y : message.y;
        }
        if (message.radiusX != null && message.hasOwnProperty("radiusX")) {
            object.radiusX =
                options.json && !isFinite(message.radiusX)
                    ? "" + message.radiusX
                    : message.radiusX;
        }
        if (message.radiusY != null && message.hasOwnProperty("radiusY")) {
            object.radiusY =
                options.json && !isFinite(message.radiusY)
                    ? "" + message.radiusY
                    : message.radiusY;
        }
        return object;
    }
    /**
     * Gets the default type url for EllipseArgs
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.EllipseArgs";
    }
    /**
     * EllipseArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    x = 0;
    /**
     * EllipseArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    y = 0;
    /**
     * EllipseArgs radiusX.
     * @member {number} radiusX
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusX = 0;
    /**
     * EllipseArgs radiusY.
     * @member {number} radiusY
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusY = 0;
    /**
     * Constructs a new EllipseArgs.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents an EllipseArgs.
     * @implements IEllipseArgs
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.x != null) {
                this.x = properties.x;
            }
            if (properties.y != null) {
                this.y = properties.y;
            }
            if (properties.radiusX != null) {
                this.radiusX = properties.radiusX;
            }
            if (properties.radiusY != null) {
                this.radiusY = properties.radiusY;
            }
        }
    }
    /**
     * Converts this EllipseArgs to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return EllipseArgs.toObject(this, toJSONOptions);
    }
}

/**
 * LineCap enum.
 * @name com.opensource.svga.ShapeEntity.ShapeStyle.LineCap
 * @enum {number}
 * @property {number} LineCap_BUTT=0 LineCap_BUTT value
 * @property {number} LineCap_ROUND=1 LineCap_ROUND value
 * @property {number} LineCap_SQUARE=2 LineCap_SQUARE value
 */
var LineCap;
(function (LineCap) {
    LineCap[LineCap["LineCap_BUTT"] = 0] = "LineCap_BUTT";
    LineCap[LineCap["LineCap_ROUND"] = 1] = "LineCap_ROUND";
    LineCap[LineCap["LineCap_SQUARE"] = 2] = "LineCap_SQUARE";
})(LineCap || (LineCap = {}));
var LineCap$1 = LineCap;

/**
 * LineJoin enum.
 * @name com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin
 * @enum {number}
 * @property {number} LineJoin_MITER=0 LineJoin_MITER value
 * @property {number} LineJoin_ROUND=1 LineJoin_ROUND value
 * @property {number} LineJoin_BEVEL=2 LineJoin_BEVEL value
 */
var LineJoin;
(function (LineJoin) {
    LineJoin[LineJoin["LineJoin_MITER"] = 0] = "LineJoin_MITER";
    LineJoin[LineJoin["LineJoin_ROUND"] = 1] = "LineJoin_ROUND";
    LineJoin[LineJoin["LineJoin_BEVEL"] = 2] = "LineJoin_BEVEL";
})(LineJoin || (LineJoin = {}));
var LineJoin$1 = LineJoin;

class RGBAColor {
    /**
     * Creates a new RGBAColor instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor instance
     */
    static create(properties) {
        return new RGBAColor(properties);
    }
    /**
     * Encodes the specified RGBAColor message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor} message RGBAColor message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: RGBAColor, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.r != null && Object.hasOwn(message, "r")) {
    //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.r);
    //   }
    //   if (message.g != null && Object.hasOwn(message, "g")) {
    //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.g);
    //   }
    //   if (message.b != null && Object.hasOwn(message, "b")) {
    //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.b);
    //   }
    //   if (message.a != null && Object.hasOwn(message, "a")) {
    //     writer.uint32(/* id 4, wireType 5 =*/ 37).float(message.a);
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified RGBAColor message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor} message RGBAColor message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: RGBAColor, writer: Writer): Writer {
    //   return RGBAColor.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a RGBAColor message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        const end = length === undefined ? reader.len : reader.pos + length;
        const message = new ShapeEntity.ShapeStyle.RGBAColor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.r = reader.float();
                    break;
                }
                case 2: {
                    message.g = reader.float();
                    break;
                }
                case 3: {
                    message.b = reader.float();
                    break;
                }
                case 4: {
                    message.a = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a RGBAColor message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return RGBAColor.decode(reader, reader.uint32());
    }
    /**
     * Verifies a RGBAColor message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (message.r != null && message.hasOwnProperty("r")) {
    //     if (typeof message.r !== "number") {
    //       return "r: number expected";
    //     }
    //   }
    //   if (message.g != null && message.hasOwnProperty("g")) {
    //     if (typeof message.g !== "number") {
    //       return "g: number expected";
    //     }
    //   }
    //   if (message.b != null && message.hasOwnProperty("b")) {
    //     if (typeof message.b !== "number") {
    //       return "b: number expected";
    //     }
    //   }
    //   if (message.a != null && message.hasOwnProperty("a")) {
    //     if (typeof message.a !== "number") {
    //       return "a: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a RGBAColor message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     */
    // static fromObject(object: Record<string, any>): RGBAColor {
    //   if (object instanceof RGBAColor) {
    //     return object;
    //   }
    //   const message = new RGBAColor();
    //   if (object.r != null) {
    //     message.r = +object.r;
    //   }
    //   if (object.g != null) {
    //     message.g = +object.g;
    //   }
    //   if (object.b != null) {
    //     message.b = +object.b;
    //   }
    //   if (object.a != null) {
    //     message.a = +object.a;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a RGBAColor message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} message RGBAColor
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.defaults) {
            object.r = 0;
            object.g = 0;
            object.b = 0;
            object.a = 0;
        }
        if (message.r != null && message.hasOwnProperty("r")) {
            object.r =
                options.json && !isFinite(message.r) ? "" + message.r : message.r;
        }
        if (message.g != null && message.hasOwnProperty("g")) {
            object.g =
                options.json && !isFinite(message.g) ? "" + message.g : message.g;
        }
        if (message.b != null && message.hasOwnProperty("b")) {
            object.b =
                options.json && !isFinite(message.b) ? "" + message.b : message.b;
        }
        if (message.a != null && message.hasOwnProperty("a")) {
            object.a =
                options.json && !isFinite(message.a) ? "" + message.a : message.a;
        }
        return object;
    }
    /**
     * Gets the default type url for RGBAColor
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return (typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor");
    }
    /**
     * RGBAColor r.
     * @member {number} r
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    r = 0;
    /**
     * RGBAColor g.
     * @member {number} g
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    g = 0;
    /**
     * RGBAColor b.
     * @member {number} b
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    b = 0;
    /**
     * RGBAColor a.
     * @member {number} a
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    a = 0;
    /**
     * Constructs a new RGBAColor.
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @classdesc Represents a RGBAColor.
     * @implements IRGBAColor
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.r != null) {
                this.r = properties.r;
            }
            if (properties.g != null) {
                this.g = properties.g;
            }
            if (properties.b != null) {
                this.b = properties.b;
            }
            if (properties.a != null) {
                this.a = properties.a;
            }
        }
    }
    /**
     * Converts this RGBAColor to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return RGBAColor.toObject(this, toJSONOptions);
    }
}

class ShapeStyle {
    static RGBAColor = RGBAColor;
    static LineCap = LineCap$1;
    static LineJoin = LineJoin$1;
    /**
     * Creates a new ShapeStyle instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {com.opensource.svga.ShapeEntity.IShapeStyle=} [properties] Properties to set
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle instance
     */
    static create(properties) {
        return new ShapeStyle(properties);
    }
    /**
     * Encodes the specified ShapeStyle message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {com.opensource.svga.ShapeEntity.IShapeStyle} message ShapeStyle message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: ShapeStyle, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.fill != null && Object.hasOwn(message, "fill")) {
    //     RGBAColor.encode(
    //       message.fill,
    //       writer.uint32(/* id 1, wireType 2 =*/ 10).fork()
    //     ).ldelim();
    //   }
    //   if (message.stroke != null && Object.hasOwn(message, "stroke")) {
    //     RGBAColor.encode(
    //       message.stroke,
    //       writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
    //     ).ldelim();
    //   }
    //   if (message.strokeWidth != null && Object.hasOwn(message, "strokeWidth")) {
    //     writer.uint32(/* id 3, wireType 5 =*/ 29).float(message.strokeWidth);
    //   }
    //   if (message.lineCap != null && Object.hasOwn(message, "lineCap")) {
    //     writer.uint32(/* id 4, wireType 0 =*/ 32).int32(message.lineCap);
    //   }
    //   if (message.lineJoin != null && Object.hasOwn(message, "lineJoin")) {
    //     writer.uint32(/* id 5, wireType 0 =*/ 40).int32(message.lineJoin);
    //   }
    //   if (message.miterLimit != null && Object.hasOwn(message, "miterLimit")) {
    //     writer.uint32(/* id 6, wireType 5 =*/ 53).float(message.miterLimit);
    //   }
    //   if (message.lineDashI != null && Object.hasOwn(message, "lineDashI")) {
    //     writer.uint32(/* id 7, wireType 5 =*/ 61).float(message.lineDashI);
    //   }
    //   if (message.lineDashII != null && Object.hasOwn(message, "lineDashII")) {
    //     writer.uint32(/* id 8, wireType 5 =*/ 69).float(message.lineDashII);
    //   }
    //   if (message.lineDashIII != null && Object.hasOwn(message, "lineDashIII")) {
    //     writer.uint32(/* id 9, wireType 5 =*/ 77).float(message.lineDashIII);
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified ShapeStyle message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {com.opensource.svga.ShapeEntity.IShapeStyle} message ShapeStyle message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: ShapeStyle, writer: Writer): Writer {
    //   return ShapeStyle.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a ShapeStyle message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        const end = length === undefined ? reader.len : reader.pos + length;
        const message = new ShapeStyle();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.fill = RGBAColor.decode(reader, reader.uint32());
                    break;
                }
                case 2: {
                    message.stroke = RGBAColor.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    message.strokeWidth = reader.float();
                    break;
                }
                case 4: {
                    message.lineCap = reader.int32();
                    break;
                }
                case 5: {
                    message.lineJoin = reader.int32();
                    break;
                }
                case 6: {
                    message.miterLimit = reader.float();
                    break;
                }
                case 7: {
                    message.lineDashI = reader.float();
                    break;
                }
                case 8: {
                    message.lineDashII = reader.float();
                    break;
                }
                case 9: {
                    message.lineDashIII = reader.float();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a ShapeStyle message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return ShapeStyle.decode(reader, reader.uint32());
    }
    /**
     * Verifies a ShapeStyle message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (message.fill != null && message.hasOwnProperty("fill")) {
    //     const error = RGBAColor.verify(message.fill);
    //     if (error) {
    //       return "fill." + error;
    //     }
    //   }
    //   if (message.stroke != null && message.hasOwnProperty("stroke")) {
    //     const error = RGBAColor.verify(message.stroke);
    //     if (error) {
    //       return "stroke." + error;
    //     }
    //   }
    //   if (message.strokeWidth != null && message.hasOwnProperty("strokeWidth")) {
    //     if (typeof message.strokeWidth !== "number") {
    //       return "strokeWidth: number expected";
    //     }
    //   }
    //   if (message.lineCap != null && message.hasOwnProperty("lineCap"))
    //     switch (message.lineCap) {
    //       default:
    //         return "lineCap: enum value expected";
    //       case 0:
    //       case 1:
    //       case 2:
    //         break;
    //     }
    //   if (message.lineJoin != null && message.hasOwnProperty("lineJoin"))
    //     switch (message.lineJoin) {
    //       default:
    //         return "lineJoin: enum value expected";
    //       case 0:
    //       case 1:
    //       case 2:
    //         break;
    //     }
    //   if (message.miterLimit != null && message.hasOwnProperty("miterLimit")) {
    //     if (typeof message.miterLimit !== "number") {
    //       return "miterLimit: number expected";
    //     }
    //   }
    //   if (message.lineDashI != null && message.hasOwnProperty("lineDashI")) {
    //     if (typeof message.lineDashI !== "number") {
    //       return "lineDashI: number expected";
    //     }
    //   }
    //   if (message.lineDashII != null && message.hasOwnProperty("lineDashII")) {
    //     if (typeof message.lineDashII !== "number") {
    //       return "lineDashII: number expected";
    //     }
    //   }
    //   if (message.lineDashIII != null && message.hasOwnProperty("lineDashIII")) {
    //     if (typeof message.lineDashIII !== "number") {
    //       return "lineDashIII: number expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a ShapeStyle message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     */
    // static fromObject(object: Record<string, any>): ShapeStyle {
    //   if (object instanceof ShapeEntity.ShapeStyle) {
    //     return object;
    //   }
    //   const message = new ShapeEntity.ShapeStyle();
    //   if (object.fill != null) {
    //     if (typeof object.fill !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.ShapeStyle.fill: object expected"
    //       );
    //     }
    //     message.fill = RGBAColor.fromObject(object.fill);
    //   }
    //   if (object.stroke != null) {
    //     if (typeof object.stroke !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.ShapeStyle.stroke: object expected"
    //       );
    //     }
    //     message.stroke = RGBAColor.fromObject(
    //       object.stroke
    //     );
    //   }
    //   if (object.strokeWidth != null) {
    //     message.strokeWidth = Number(object.strokeWidth);
    //   }
    //   switch (object.lineCap) {
    //     default:
    //       if (typeof object.lineCap === "number") {
    //         message.lineCap = object.lineCap;
    //         break;
    //       }
    //       break;
    //     case "LineCap_BUTT":
    //     case 0:
    //       message.lineCap = 0;
    //       break;
    //     case "LineCap_ROUND":
    //     case 1:
    //       message.lineCap = 1;
    //       break;
    //     case "LineCap_SQUARE":
    //     case 2:
    //       message.lineCap = 2;
    //       break;
    //   }
    //   switch (object.lineJoin) {
    //     default:
    //       if (typeof object.lineJoin === "number") {
    //         message.lineJoin = object.lineJoin;
    //         break;
    //       }
    //       break;
    //     case "LineJoin_MITER":
    //     case 0:
    //       message.lineJoin = 0;
    //       break;
    //     case "LineJoin_ROUND":
    //     case 1:
    //       message.lineJoin = 1;
    //       break;
    //     case "LineJoin_BEVEL":
    //     case 2:
    //       message.lineJoin = 2;
    //       break;
    //   }
    //   if (object.miterLimit != null) {
    //     message.miterLimit = +object.miterLimit;
    //   }
    //   if (object.lineDashI != null) {
    //     message.lineDashI = +object.lineDashI;
    //   }
    //   if (object.lineDashII != null) {
    //     message.lineDashII = +object.lineDashII;
    //   }
    //   if (object.lineDashIII != null) {
    //     message.lineDashIII = +object.lineDashIII;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a ShapeStyle message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {com.opensource.svga.ShapeEntity.ShapeStyle} message ShapeStyle
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.defaults) {
            object.fill = null;
            object.stroke = null;
            object.strokeWidth = 0;
            object.lineCap = options.enums === String ? "LineCap_BUTT" : 0;
            object.lineJoin = options.enums === String ? "LineJoin_MITER" : 0;
            object.miterLimit = 0;
            object.lineDashI = 0;
            object.lineDashII = 0;
            object.lineDashIII = 0;
        }
        if (message.fill != null && message.hasOwnProperty("fill")) {
            object.fill = ShapeEntity.ShapeStyle.RGBAColor.toObject(message.fill, options);
        }
        if (message.stroke != null && message.hasOwnProperty("stroke")) {
            object.stroke = ShapeEntity.ShapeStyle.RGBAColor.toObject(message.stroke, options);
        }
        if (message.strokeWidth != null && message.hasOwnProperty("strokeWidth")) {
            object.strokeWidth =
                options.json && !isFinite(message.strokeWidth)
                    ? "" + message.strokeWidth
                    : message.strokeWidth;
        }
        if (message.lineCap != null && message.hasOwnProperty("lineCap")) {
            object.lineCap =
                options.enums === String
                    ? ShapeEntity.ShapeStyle.LineCap[message.lineCap] === undefined
                        ? message.lineCap
                        : ShapeEntity.ShapeStyle.LineCap[message.lineCap]
                    : message.lineCap;
        }
        if (message.lineJoin != null && message.hasOwnProperty("lineJoin")) {
            object.lineJoin =
                options.enums === String
                    ? ShapeEntity.ShapeStyle.LineJoin[message.lineJoin] === undefined
                        ? message.lineJoin
                        : ShapeEntity.ShapeStyle.LineJoin[message.lineJoin]
                    : message.lineJoin;
        }
        if (message.miterLimit != null && message.hasOwnProperty("miterLimit")) {
            object.miterLimit =
                options.json && !isFinite(message.miterLimit)
                    ? "" + message.miterLimit
                    : message.miterLimit;
        }
        if (message.lineDashI != null && message.hasOwnProperty("lineDashI")) {
            object.lineDashI =
                options.json && !isFinite(message.lineDashI)
                    ? "" + message.lineDashI
                    : message.lineDashI;
        }
        if (message.lineDashII != null && message.hasOwnProperty("lineDashII")) {
            object.lineDashII =
                options.json && !isFinite(message.lineDashII)
                    ? "" + message.lineDashII
                    : message.lineDashII;
        }
        if (message.lineDashIII != null && message.hasOwnProperty("lineDashIII")) {
            object.lineDashIII =
                options.json && !isFinite(message.lineDashIII)
                    ? "" + message.lineDashIII
                    : message.lineDashIII;
        }
        return object;
    }
    /**
     * Gets the default type url for ShapeStyle
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeStyle";
    }
    /**
     * ShapeStyle fill.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    fill = null;
    /**
     * ShapeStyle stroke.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    stroke = null;
    /**
     * ShapeStyle strokeWidth.
     * @member {number} strokeWidth
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    strokeWidth = 0;
    /**
     * ShapeStyle lineCap.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap} lineCap
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineCap = 0;
    /**
     * ShapeStyle lineJoin.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineJoin = 0;
    /**
     * ShapeStyle miterLimit.
     * @member {number} miterLimit
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    miterLimit = 0;
    /**
     * ShapeStyle lineDashI.
     * @member {number} lineDashI
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashI = 0;
    /**
     * ShapeStyle lineDashII.
     * @member {number} lineDashII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashII = 0;
    /**
     * ShapeStyle lineDashIII.
     * @member {number} lineDashIII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashIII = 0;
    /**
     * Constructs a new ShapeStyle.
     * @memberof com.opensource.svga.ShapeEntity
     * @classdesc Represents a ShapeStyle.
     * @implements IShapeStyle
     * @constructor
     * @param {com.opensource.svga.ShapeEntity.IShapeStyle=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.fill != null) {
                this.fill = properties.fill;
            }
            if (properties.lineCap != null) {
                this.lineCap = properties.lineCap;
            }
            if (properties.lineDashI != null) {
                this.lineDashI = properties.lineDashI;
            }
            if (properties.lineDashII != null) {
                this.lineDashII = properties.lineDashII;
            }
            if (properties.lineDashIII != null) {
                this.lineDashIII = properties.lineDashIII;
            }
            if (properties.lineJoin != null) {
                this.lineJoin = properties.lineJoin;
            }
            if (properties.miterLimit != null) {
                this.miterLimit = properties.miterLimit;
            }
            if (properties.stroke != null) {
                this.stroke = properties.stroke;
            }
            if (properties.strokeWidth != null) {
                this.strokeWidth = properties.strokeWidth;
            }
        }
    }
    /**
     * Converts this ShapeStyle to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return ShapeStyle.toObject(this, toJSONOptions);
    }
}

class ShapeEntity {
    static ShapeType = ShapeType$1;
    static ShapeArgs = ShapeArgs;
    static RectArgs = RectArgs;
    static EllipseArgs = EllipseArgs;
    static ShapeStyle = ShapeStyle;
    /**
     * Creates a new ShapeEntity instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {com.opensource.svga.IShapeEntity=} [properties] Properties to set
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity instance
     */
    static create(properties) {
        return new ShapeEntity(properties);
    }
    /**
     * Encodes the specified ShapeEntity message. Does not implicitly {@link com.opensource.svga.ShapeEntity.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {com.opensource.svga.IShapeEntity} message ShapeEntity message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: ShapeEntity, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.type != null && Object.hasOwn(message, "type")) {
    //     writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.type);
    //   }
    //   if (message.shape != null && Object.hasOwn(message, "shape")) {
    //     ShapeArgs.encode(
    //       message.shape,
    //       writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
    //     ).ldelim();
    //   }
    //   if (message.rect != null && Object.hasOwn(message, "rect")) {
    //     RectArgs.encode(
    //       message.rect,
    //       writer.uint32(/* id 3, wireType 2 =*/ 26).fork()
    //     ).ldelim();
    //   }
    //   if (message.ellipse != null && Object.hasOwn(message, "ellipse")) {
    //     EllipseArgs.encode(
    //       message.ellipse,
    //       writer.uint32(/* id 4, wireType 2 =*/ 34).fork()
    //     ).ldelim();
    //   }
    //   if (message.styles != null && Object.hasOwn(message, "styles")) {
    //     ShapeStyle.encode(
    //       message.styles,
    //       writer.uint32(/* id 10, wireType 2 =*/ 82).fork()
    //     ).ldelim();
    //   }
    //   if (message.transform != null && Object.hasOwn(message, "transform")) {
    //     Transform.encode(
    //       message.transform,
    //       writer.uint32(/* id 11, wireType 2 =*/ 90).fork()
    //     ).ldelim();
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified ShapeEntity message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {com.opensource.svga.IShapeEntity} message ShapeEntity message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: ShapeEntity, writer: Writer): Writer {
    //   return ShapeEntity.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a ShapeEntity message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        const end = length === undefined ? reader.len : reader.pos + length;
        const message = new ShapeEntity();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.type = reader.int32();
                    break;
                }
                case 2: {
                    message.shape = ShapeEntity.ShapeArgs.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    message.rect = ShapeEntity.RectArgs.decode(reader, reader.uint32());
                    break;
                }
                case 4: {
                    message.ellipse = ShapeEntity.EllipseArgs.decode(reader, reader.uint32());
                    break;
                }
                case 10: {
                    message.styles = ShapeEntity.ShapeStyle.decode(reader, reader.uint32());
                    break;
                }
                case 11: {
                    message.transform = Transform.decode(reader, reader.uint32());
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a ShapeEntity message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return ShapeEntity.decode(reader, reader.uint32());
    }
    /**
     * Verifies a ShapeEntity message.
     * @function verify
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   const properties: Record<string, any> = {};
    //   if (message.type != null && message.hasOwnProperty("type"))
    //     switch (message.type) {
    //       default:
    //         return "type: enum value expected";
    //       case 0:
    //       case 1:
    //       case 2:
    //       case 3:
    //         break;
    //     }
    //   if (message.shape != null && message.hasOwnProperty("shape")) {
    //     properties.args = 1;
    //     {
    //       let error = ShapeEntity.ShapeArgs.verify(message.shape);
    //       if (error) {
    //         return "shape." + error;
    //       }
    //     }
    //   }
    //   if (message.rect != null && message.hasOwnProperty("rect")) {
    //     if (properties.args === 1) {
    //       return "args: multiple values";
    //     }
    //     properties.args = 1;
    //     {
    //       const error = ShapeEntity.RectArgs.verify(message.rect);
    //       if (error) {
    //         return "rect." + error;
    //       }
    //     }
    //   }
    //   if (message.ellipse != null && message.hasOwnProperty("ellipse")) {
    //     if (properties.args === 1) {
    //       return "args: multiple values";
    //     }
    //     properties.args = 1;
    //     const error = ShapeEntity.EllipseArgs.verify(message.ellipse);
    //     if (error) {
    //       return "ellipse." + error;
    //     }
    //   }
    //   if (message.styles != null && message.hasOwnProperty("styles")) {
    //     const error = ShapeEntity.ShapeStyle.verify(message.styles);
    //     if (error) {
    //       return "styles." + error;
    //     }
    //   }
    //   if (message.transform != null && message.hasOwnProperty("transform")) {
    //     const error = Transform.verify(message.transform);
    //     if (error) {
    //       return "transform." + error;
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a ShapeEntity message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
     */
    // static fromObject(object: Record<string, any>): ShapeEntity {
    //   if (object instanceof ShapeEntity) {
    //     return object;
    //   }
    //   const message = new ShapeEntity();
    //   switch (object.type) {
    //     default:
    //       if (typeof object.type === "number") {
    //         message.type = object.type;
    //         break;
    //       }
    //       break;
    //     case "SHAPE":
    //     case 0:
    //       message.type = 0;
    //       break;
    //     case "RECT":
    //     case 1:
    //       message.type = 1;
    //       break;
    //     case "ELLIPSE":
    //     case 2:
    //       message.type = 2;
    //       break;
    //     case "KEEP":
    //     case 3:
    //       message.type = 3;
    //       break;
    //   }
    //   if (object.shape != null) {
    //     if (typeof object.shape !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.shape: object expected"
    //       );
    //     }
    //     message.shape = ShapeArgs.fromObject(object.shape);
    //   }
    //   if (object.rect != null) {
    //     if (typeof object.rect !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.rect: object expected"
    //       );
    //     }
    //     message.rect = RectArgs.fromObject(object.rect);
    //   }
    //   if (object.ellipse != null) {
    //     if (typeof object.ellipse !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.ellipse: object expected"
    //       );
    //     }
    //     message.ellipse = EllipseArgs.fromObject(object.ellipse);
    //   }
    //   if (object.styles != null) {
    //     if (typeof object.styles !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.styles: object expected"
    //       );
    //     }
    //     message.styles = ShapeStyle.fromObject(object.styles);
    //   }
    //   if (object.transform != null) {
    //     if (typeof object.transform !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.ShapeEntity.transform: object expected"
    //       );
    //     }
    //     message.transform = Transform.fromObject(object.transform);
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a ShapeEntity message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {com.opensource.svga.ShapeEntity} message ShapeEntity
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.defaults) {
            object.type = options.enums === String ? "SHAPE" : 0;
            object.styles = null;
            object.transform = null;
        }
        if (message.type != null && message.hasOwnProperty("type")) {
            object.type =
                options.enums === String
                    ? ShapeType$1[message.type] === undefined
                        ? message.type
                        : ShapeType$1[message.type]
                    : message.type;
        }
        if (message.shape != null && message.hasOwnProperty("shape")) {
            object.shape = ShapeEntity.ShapeArgs.toObject(message.shape, options);
            if (options.oneofs) {
                object.args = "shape";
            }
        }
        if (message.rect != null && message.hasOwnProperty("rect")) {
            object.rect = ShapeEntity.RectArgs.toObject(message.rect, options);
            if (options.oneofs) {
                object.args = "rect";
            }
        }
        if (message.ellipse != null && message.hasOwnProperty("ellipse")) {
            object.ellipse = ShapeEntity.EllipseArgs.toObject(message.ellipse, options);
            if (options.oneofs) {
                object.args = "ellipse";
            }
        }
        if (message.styles != null && message.hasOwnProperty("styles")) {
            object.styles = ShapeEntity.ShapeStyle.toObject(message.styles, options);
        }
        if (message.transform != null && message.hasOwnProperty("transform")) {
            object.transform = Transform.toObject(message.transform, options);
        }
        return object;
    }
    /**
     * Gets the default type url for ShapeEntity
     * @function getTypeUrl
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.ShapeEntity";
    }
    /**
     * ShapeEntity type.
     * @member {com.opensource.svga.ShapeEntity.ShapeType} type
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    type = 0;
    /**
     * ShapeEntity shape.
     * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    shape = null;
    /**
     * ShapeEntity rect.
     * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    rect = null;
    /**
     * ShapeEntity ellipse.
     * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    ellipse = null;
    /**
     * ShapeEntity styles.
     * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    styles = null;
    /**
     * ShapeEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    transform = null;
    $oneOfFields = [
        "shape",
        "rect",
        "ellipse",
    ];
    $fieldMap = {};
    get args() {
        const keys = Object.keys(this);
        for (let i = keys.length - 1; i > -1; --i) {
            const key = keys[i];
            const value = this[key];
            if (this.$fieldMap[key] === 1 && value != null) {
                return key;
            }
        }
        return "";
    }
    set args(name) {
        for (var i = 0; i < this.$oneOfFields.length; ++i) {
            const key = this.$oneOfFields[i];
            if (key !== name) {
                delete this[key];
            }
        }
    }
    /**
     * Constructs a new ShapeEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a ShapeEntity.
     * @implements IShapeEntity
     * @constructor
     * @param {com.opensource.svga.IShapeEntity=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.type != null) {
                this.type = properties.type;
            }
            if (properties.ellipse != null) {
                this.ellipse = properties.ellipse;
            }
            if (properties.rect != null) {
                this.rect = properties.rect;
            }
            if (properties.shape != null) {
                this.shape = properties.shape;
            }
            if (properties.styles != null) {
                this.styles = properties.styles;
            }
            if (properties.transform != null) {
                this.transform = properties.transform;
            }
        }
        for (var i = 0; i < this.$oneOfFields.length; ++i) {
            this.$fieldMap[this.$oneOfFields[i]] = 1;
        }
    }
    /**
     * Converts this ShapeEntity to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return ShapeEntity.toObject(this, toJSONOptions);
    }
}

class FrameEntity {
    /**
     * Creates a new FrameEntity instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {com.opensource.svga.IFrameEntity=} [properties] Properties to set
     * @returns {com.opensource.svga.FrameEntity} FrameEntity instance
     */
    static create(properties) {
        return new FrameEntity(properties);
    }
    /**
     * Encodes the specified FrameEntity message. Does not implicitly {@link com.opensource.svga.FrameEntity.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {com.opensource.svga.IFrameEntity} message FrameEntity message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: FrameEntity, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.alpha != null && Object.hasOwn(message, "alpha")) {
    //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.alpha);
    //   }
    //   if (message.layout != null && Object.hasOwn(message, "layout")) {
    //     Layout.encode(
    //       message.layout,
    //       writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
    //     ).ldelim();
    //   }
    //   if (message.transform != null && Object.hasOwn(message, "transform")) {
    //     Transform.encode(
    //       message.transform,
    //       writer.uint32(/* id 3, wireType 2 =*/ 26).fork()
    //     ).ldelim();
    //   }
    //   if (message.clipPath != null && Object.hasOwn(message, "clipPath")) {
    //     writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.clipPath);
    //   }
    //   if (message.shapes != null && message.shapes.length) {
    //     for (let i = 0; i < message.shapes.length; ++i) {
    //       ShapeEntity.encode(
    //         message.shapes[i],
    //         writer.uint32(/* id 5, wireType 2 =*/ 42).fork()
    //       ).ldelim();
    //     }
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified FrameEntity message, length delimited. Does not implicitly {@link com.opensource.svga.FrameEntity.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {com.opensource.svga.IFrameEntity} message FrameEntity message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: FrameEntity, writer: Writer): Writer {
    //   return FrameEntity.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a FrameEntity message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.FrameEntity} FrameEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        const end = length === undefined ? reader.len : reader.pos + length;
        const message = new FrameEntity();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.alpha = reader.float();
                    break;
                }
                case 2: {
                    message.layout = Layout.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    message.transform = Transform.decode(reader, reader.uint32());
                    break;
                }
                case 4: {
                    message.clipPath = reader.string();
                    break;
                }
                case 5: {
                    if (!(message.shapes && message.shapes.length)) {
                        message.shapes = [];
                    }
                    message.shapes.push(ShapeEntity.decode(reader, reader.uint32()));
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a FrameEntity message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.FrameEntity} FrameEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return this.decode(reader, reader.uint32());
    }
    /**
     * Verifies a FrameEntity message.
     * @function verify
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (message.alpha != null && message.hasOwnProperty("alpha")) {
    //     if (typeof message.alpha !== "number") {
    //       return "alpha: number expected";
    //     }
    //   }
    //   if (message.layout != null && message.hasOwnProperty("layout")) {
    //     const error = Layout.verify(message.layout);
    //     if (error) {
    //       return "layout." + error;
    //     }
    //   }
    //   if (message.transform != null && message.hasOwnProperty("transform")) {
    //     const error = Transform.verify(message.transform);
    //     if (error) {
    //       return "transform." + error;
    //     }
    //   }
    //   if (message.clipPath != null && message.hasOwnProperty("clipPath")) {
    //     if (!isString(message.clipPath)) {
    //       return "clipPath: string expected";
    //     }
    //   }
    //   if (message.shapes != null && message.hasOwnProperty("shapes")) {
    //     if (!Array.isArray(message.shapes)) {
    //       return "shapes: array expected";
    //     }
    //     for (let i = 0; i < message.shapes.length; ++i) {
    //       const error = ShapeEntity.verify(message.shapes[i]);
    //       if (error) {
    //         return "shapes." + error;
    //       }
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a FrameEntity message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.FrameEntity} FrameEntity
     */
    // static fromObject(object: Record<string, any>): FrameEntity {
    //   if (object instanceof FrameEntity) {
    //     return object;
    //   }
    //   const message = new FrameEntity();
    //   if (object.alpha != null) {
    //     message.alpha = +object.alpha;
    //   }
    //   if (object.layout != null) {
    //     if (typeof object.layout !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.FrameEntity.layout: object expected"
    //       );
    //     }
    //     message.layout = Layout.fromObject(object.layout);
    //   }
    //   if (object.transform != null) {
    //     if (typeof object.transform !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.FrameEntity.transform: object expected"
    //       );
    //     }
    //     message.transform = Transform.fromObject(object.transform);
    //   }
    //   if (object.clipPath != null) {
    //     message.clipPath = String(object.clipPath);
    //   }
    //   if (object.shapes) {
    //     if (!Array.isArray(object.shapes)) {
    //       throw TypeError(
    //         ".com.opensource.svga.FrameEntity.shapes: array expected"
    //       );
    //     }
    //     message.shapes = [];
    //     for (let i = 0; i < object.shapes.length; ++i) {
    //       if (typeof object.shapes[i] !== "object") {
    //         throw TypeError(
    //           ".com.opensource.svga.FrameEntity.shapes: object expected"
    //         );
    //       }
    //       message.shapes[i] = ShapeEntity.fromObject(object.shapes[i]);
    //     }
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a FrameEntity message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {com.opensource.svga.FrameEntity} message FrameEntity
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.arrays || options.defaults) {
            object.shapes = [];
        }
        if (options.defaults) {
            object.alpha = 0;
            object.layout = null;
            object.transform = null;
            object.clipPath = "";
        }
        if (message.alpha != null && message.hasOwnProperty("alpha")) {
            object.alpha =
                options.json && !isFinite(message.alpha)
                    ? "" + message.alpha
                    : message.alpha;
        }
        if (message.layout != null && message.hasOwnProperty("layout")) {
            object.layout = Layout.toObject(message.layout, options);
        }
        if (message.transform != null && message.hasOwnProperty("transform")) {
            object.transform = Transform.toObject(message.transform, options);
        }
        if (message.clipPath != null && message.hasOwnProperty("clipPath")) {
            object.clipPath = message.clipPath;
        }
        if (message.shapes && message.shapes.length) {
            object.shapes = [];
            for (let j = 0; j < message.shapes.length; ++j) {
                object.shapes[j] = ShapeEntity.toObject(message.shapes[j], options);
            }
        }
        return object;
    }
    /**
     * Gets the default type url for FrameEntity
     * @function getTypeUrl
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.FrameEntity";
    }
    /**
     * FrameEntity shapes.
     * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    shapes = [];
    /**
     * FrameEntity alpha.
     * @member {number} alpha
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    alpha = 0;
    /**
     * FrameEntity layout.
     * @member {com.opensource.svga.ILayout|null|undefined} layout
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    layout = null;
    /**
     * FrameEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    transform = null;
    /**
     * FrameEntity clipPath.
     * @member {string} clipPath
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    clipPath = "";
    /**
     * Constructs a new FrameEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a FrameEntity.
     * @implements IFrameEntity
     * @constructor
     * @param {com.opensource.svga.IFrameEntity=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.alpha != null) {
                this.alpha = properties.alpha;
            }
            if (properties.clipPath != null) {
                this.clipPath = properties.clipPath;
            }
            if (properties.layout != null) {
                this.layout = properties.layout;
            }
            if (properties.shapes != null) {
                this.shapes = properties.shapes;
            }
            if (properties.transform != null) {
                this.transform = properties.transform;
            }
        }
    }
    /**
     * Converts this FrameEntity to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return FrameEntity.toObject(this, toJSONOptions);
    }
}

class SpriteEntity {
    /**
     * Creates a new SpriteEntity instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {com.opensource.svga.ISpriteEntity=} [properties] Properties to set
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity instance
     */
    static create(properties) {
        return new SpriteEntity(properties);
    }
    /**
     * Encodes the specified SpriteEntity message. Does not implicitly {@link com.opensource.svga.SpriteEntity.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {com.opensource.svga.ISpriteEntity} message SpriteEntity message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: SpriteEntity, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.imageKey != null && Object.hasOwn(message, "imageKey")) {
    //     writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.imageKey);
    //   }
    //   if (message.frames != null && message.frames.length) {
    //     for (let i = 0; i < message.frames.length; ++i) {
    //       FrameEntity.encode(
    //         message.frames[i],
    //         writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
    //       ).ldelim();
    //     }
    //   }
    //   if (message.matteKey != null && Object.hasOwn(message, "matteKey")) {
    //     writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.matteKey);
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified SpriteEntity message, length delimited. Does not implicitly {@link com.opensource.svga.SpriteEntity.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {com.opensource.svga.ISpriteEntity} message SpriteEntity message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: SpriteEntity, writer: Writer): Writer {
    //   return SpriteEntity.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a SpriteEntity message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        const end = length === undefined ? reader.len : reader.pos + length;
        const message = new SpriteEntity();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.imageKey = reader.string();
                    break;
                }
                case 2: {
                    if (!(message.frames && message.frames.length)) {
                        message.frames = [];
                    }
                    message.frames.push(FrameEntity.decode(reader, reader.uint32()));
                    break;
                }
                case 3: {
                    message.matteKey = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a SpriteEntity message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return SpriteEntity.decode(reader, reader.uint32());
    }
    /**
     * Verifies a SpriteEntity message.
     * @function verify
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (message.imageKey != null && message.hasOwnProperty("imageKey")) {
    //     if (!isString(message.imageKey)) {
    //       return "imageKey: string expected";
    //     }
    //   }
    //   if (message.frames != null && message.hasOwnProperty("frames")) {
    //     if (!Array.isArray(message.frames)) {
    //       return "frames: array expected";
    //     }
    //     for (let i = 0; i < message.frames.length; ++i) {
    //       const error = FrameEntity.verify(message.frames[i]);
    //       if (error) {
    //         return "frames." + error;
    //       }
    //     }
    //   }
    //   if (message.matteKey != null && message.hasOwnProperty("matteKey")) {
    //     if (!isString(message.matteKey)) {
    //       return "matteKey: string expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a SpriteEntity message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     */
    // static fromObject(object: Record<string, any>): SpriteEntity {
    //   if (object instanceof SpriteEntity) {
    //     return object;
    //   }
    //   const message = new SpriteEntity();
    //   if (object.imageKey != null) {
    //     message.imageKey = "" + object.imageKey;
    //   }
    //   if (object.frames) {
    //     if (!Array.isArray(object.frames)) {
    //       throw TypeError(
    //         ".com.opensource.svga.SpriteEntity.frames: array expected"
    //       );
    //     }
    //     message.frames = [];
    //     for (let i = 0; i < object.frames.length; ++i) {
    //       if (typeof object.frames[i] !== "object") {
    //         throw TypeError(
    //           ".com.opensource.svga.SpriteEntity.frames: object expected"
    //         );
    //       }
    //       message.frames[i] = FrameEntity.fromObject(object.frames[i]);
    //     }
    //   }
    //   if (object.matteKey != null) {
    //     message.matteKey = "" + object.matteKey;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a SpriteEntity message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {com.opensource.svga.SpriteEntity} message SpriteEntity
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.arrays || options.defaults) {
            object.frames = [];
        }
        if (options.defaults) {
            object.imageKey = "";
            object.matteKey = "";
        }
        if (message.imageKey != null && message.hasOwnProperty("imageKey")) {
            object.imageKey = message.imageKey;
        }
        if (message.frames && message.frames.length) {
            object.frames = [];
            for (let j = 0; j < message.frames.length; ++j) {
                object.frames[j] = FrameEntity.toObject(message.frames[j], options);
            }
        }
        if (message.matteKey != null && message.hasOwnProperty("matteKey")) {
            object.matteKey = message.matteKey;
        }
        return object;
    }
    /**
     * Gets the default type url for SpriteEntity
     * @function getTypeUrl
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.SpriteEntity";
    }
    /**
     * SpriteEntity frames.
     * @member {Array.<com.opensource.svga.IFrameEntity>} frames
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    frames = [];
    /**
     * SpriteEntity imageKey.
     * @member {string} imageKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    imageKey = "";
    /**
     * SpriteEntity matteKey.
     * @member {string} matteKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    matteKey = "";
    /**
     * Constructs a new SpriteEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a SpriteEntity.
     * @implements ISpriteEntity
     * @constructor
     * @param {com.opensource.svga.ISpriteEntity=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.frames != null) {
                this.frames = properties.frames;
            }
            if (properties.imageKey != null) {
                this.imageKey = properties.imageKey;
            }
            if (properties.matteKey != null) {
                this.matteKey = properties.matteKey;
            }
        }
    }
    /**
     * Converts this SpriteEntity to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return SpriteEntity.toObject(this, toJSONOptions);
    }
}

class MovieParams {
    /**
     * Creates a new MovieParams instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {com.opensource.svga.IMovieParams=} [properties] Properties to set
     * @returns {com.opensource.svga.MovieParams} MovieParams instance
     */
    static create(properties) {
        return new MovieParams(properties);
    }
    /**
     * Encodes the specified MovieParams message. Does not implicitly {@link com.opensource.svga.MovieParams.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {com.opensource.svga.IMovieParams} message MovieParams message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: MovieParams, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (
    //     message.viewBoxWidth != null &&
    //     Object.hasOwn(message, "viewBoxWidth")
    //   ) {
    //     writer.uint32(/* id 1, wireType 5 =*/ 13).float(message.viewBoxWidth);
    //   }
    //   if (
    //     message.viewBoxHeight != null &&
    //     Object.hasOwn(message, "viewBoxHeight")
    //   ) {
    //     writer.uint32(/* id 2, wireType 5 =*/ 21).float(message.viewBoxHeight);
    //   }
    //   if (message.fps != null && Object.hasOwn(message, "fps")) {
    //     writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.fps);
    //   }
    //   if (message.frames != null && Object.hasOwn(message, "frames")) {
    //     writer.uint32(/* id 4, wireType 0 =*/ 32).int32(message.frames);
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified MovieParams message, length delimited. Does not implicitly {@link com.opensource.svga.MovieParams.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {com.opensource.svga.IMovieParams} message MovieParams message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: MovieParams, writer: Writer): Writer {
    //   return MovieParams.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a MovieParams message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.MovieParams} MovieParams
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        let end = length === undefined ? reader.len : reader.pos + length;
        let message = new MovieParams();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.viewBoxWidth = reader.float();
                    break;
                }
                case 2: {
                    message.viewBoxHeight = reader.float();
                    break;
                }
                case 3: {
                    message.fps = reader.int32();
                    break;
                }
                case 4: {
                    message.frames = reader.int32();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a MovieParams message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.MovieParams} MovieParams
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return MovieParams.decode(reader, reader.uint32());
    }
    /**
     * Verifies a MovieParams message.
     * @function verify
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (
    //     message.viewBoxWidth != null &&
    //     message.hasOwnProperty("viewBoxWidth")
    //   ) {
    //     if (typeof message.viewBoxWidth !== "number") {
    //       return "viewBoxWidth: number expected";
    //     }
    //   }
    //   if (
    //     message.viewBoxHeight != null &&
    //     message.hasOwnProperty("viewBoxHeight")
    //   ) {
    //     if (typeof message.viewBoxHeight !== "number") {
    //       return "viewBoxHeight: number expected";
    //     }
    //   }
    //   if (message.fps != null && message.hasOwnProperty("fps")) {
    //     if (!isInteger(message.fps)) {
    //       return "fps: integer expected";
    //     }
    //   }
    //   if (message.frames != null && message.hasOwnProperty("frames")) {
    //     if (!isInteger(message.frames)) {
    //       return "frames: integer expected";
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a MovieParams message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.MovieParams} MovieParams
     */
    // static fromObject(object: Record<string, any>): MovieParams {
    //   if (object instanceof MovieParams) {
    //     return object;
    //   }
    //   const message = new MovieParams();
    //   if (object.viewBoxWidth != null) {
    //     message.viewBoxWidth = +object.viewBoxWidth;
    //   }
    //   if (object.viewBoxHeight != null) {
    //     message.viewBoxHeight = +object.viewBoxHeight;
    //   }
    //   if (object.fps != null) {
    //     message.fps = object.fps | 0;
    //   }
    //   if (object.frames != null) {
    //     message.frames = object.frames | 0;
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a MovieParams message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {com.opensource.svga.MovieParams} message MovieParams
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.defaults) {
            object.viewBoxWidth = 0;
            object.viewBoxHeight = 0;
            object.fps = 0;
            object.frames = 0;
        }
        if (message.viewBoxWidth != null &&
            message.hasOwnProperty("viewBoxWidth")) {
            object.viewBoxWidth =
                options.json && !isFinite(message.viewBoxWidth)
                    ? "" + message.viewBoxWidth
                    : message.viewBoxWidth;
        }
        if (message.viewBoxHeight != null &&
            message.hasOwnProperty("viewBoxHeight")) {
            object.viewBoxHeight =
                options.json && !isFinite(message.viewBoxHeight)
                    ? "" + message.viewBoxHeight
                    : message.viewBoxHeight;
        }
        if (message.fps != null && message.hasOwnProperty("fps")) {
            object.fps = message.fps;
        }
        if (message.frames != null && message.hasOwnProperty("frames")) {
            object.frames = message.frames;
        }
        return object;
    }
    /**
     * Gets the default type url for MovieParams
     * @function getTypeUrl
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.MovieParams";
    }
    /**
     * MovieParams viewBoxWidth.
     * @member {number} viewBoxWidth
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxWidth = 0;
    /**
     * MovieParams viewBoxHeight.
     * @member {number} viewBoxHeight
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxHeight = 0;
    /**
     * MovieParams fps.
     * @member {number} fps
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    fps = 0;
    /**
     * MovieParams frames.
     * @member {number} frames
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    frames = 0;
    /**
     * Constructs a new MovieParams.
     * @memberof com.opensource.svga
     * @classdesc Represents a MovieParams.
     * @implements IMovieParams
     * @constructor
     * @param {com.opensource.svga.IMovieParams=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.viewBoxWidth != null) {
                this.viewBoxWidth = properties.viewBoxWidth;
            }
            if (properties.viewBoxHeight != null) {
                this.viewBoxHeight = properties.viewBoxHeight;
            }
            if (properties.fps != null) {
                this.fps = properties.fps;
            }
            if (properties.frames != null) {
                this.frames = properties.frames;
            }
        }
    }
    toJSON() {
        return MovieParams.toObject(this, toJSONOptions);
    }
}

let MovieEntity$1 = class MovieEntity {
    /**
     * Creates a new MovieEntity instance using the specified properties.
     * @function create
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {com.opensource.svga.IMovieEntity=} [properties] Properties to set
     * @returns {com.opensource.svga.MovieEntity} MovieEntity instance
     */
    static create(properties) {
        return new MovieEntity(properties);
    }
    /**
     * Encodes the specified MovieEntity message. Does not implicitly {@link com.opensource.svga.MovieEntity.verify|verify} messages.
     * @function encode
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {com.opensource.svga.IMovieEntity} message MovieEntity message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encode(message: MovieEntity, writer: Writer): Writer {
    //   if (!writer) {
    //     writer = Writer.create();
    //   }
    //   if (message.version != null && Object.hasOwn(message, "version")) {
    //     writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.version);
    //   }
    //   if (message.params != null && Object.hasOwn(message, "params")) {
    //     MovieParams.encode(
    //       message.params,
    //       writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
    //     ).ldelim();
    //   }
    //   if (message.images != null && Object.hasOwn(message, "images")) {
    //     const keys = Object.keys(message.images);
    //     for (let i = 0; i < keys.length; ++i) {
    //       writer
    //         .uint32(/* id 3, wireType 2 =*/ 26)
    //         .fork()
    //         .uint32(/* id 1, wireType 2 =*/ 10)
    //         .string(keys[i])
    //         .uint32(/* id 2, wireType 2 =*/ 18)
    //         .bytes(message.images[keys[i]])
    //         .ldelim();
    //     }
    //   }
    //   if (message.sprites != null && message.sprites.length) {
    //     for (let i = 0; i < message.sprites.length; ++i) {
    //       SpriteEntity.encode(
    //         message.sprites[i],
    //         writer.uint32(/* id 4, wireType 2 =*/ 34).fork()
    //       ).ldelim();
    //     }
    //   }
    //   return writer;
    // }
    /**
     * Encodes the specified MovieEntity message, length delimited. Does not implicitly {@link com.opensource.svga.MovieEntity.verify|verify} messages.
     * @function encodeDelimited
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {com.opensource.svga.IMovieEntity} message MovieEntity message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    // static encodeDelimited(message: MovieEntity, writer: Writer): Writer {
    //   return MovieEntity.encode(message, writer).ldelim();
    // }
    /**
     * Decodes a MovieEntity message from the specified reader or buffer.
     * @function decode
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.MovieEntity} MovieEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader, length) {
        if (!(reader instanceof Reader)) {
            reader = Reader.create(reader);
        }
        const end = length === undefined ? reader.len : reader.pos + length;
        const message = new MovieEntity();
        let key;
        let value;
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.version = reader.string();
                    break;
                }
                case 2: {
                    message.params = MovieParams.decode(reader, reader.uint32());
                    break;
                }
                case 3: {
                    if (message.images === emptyObject) {
                        message.images = {};
                    }
                    const end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = [];
                    while (reader.pos < end2) {
                        let tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.bytes();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                        }
                    }
                    message.images[key] = value;
                    break;
                }
                case 4: {
                    if (!(message.sprites && message.sprites.length)) {
                        message.sprites = [];
                    }
                    message.sprites.push(SpriteEntity.decode(reader, reader.uint32()));
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    }
    /**
     * Decodes a MovieEntity message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {com.opensource.svga.MovieEntity} MovieEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(reader) {
        if (!(reader instanceof Reader)) {
            reader = new Reader(reader);
        }
        return MovieEntity.decode(reader, reader.uint32());
    }
    /**
     * Verifies a MovieEntity message.
     * @function verify
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    // static verify(message: Record<string, any>): string | null {
    //   if (typeof message !== "object" || message === null) {
    //     return "object expected";
    //   }
    //   if (message.version != null && message.hasOwnProperty("version")) {
    //     if (!isString(message.version)) {
    //       return "version: string expected";
    //     }
    //   }
    //   if (message.params != null && message.hasOwnProperty("params")) {
    //     const error = MovieParams.verify(message.params);
    //     if (error) {
    //       return "params." + error;
    //     }
    //   }
    //   if (message.images != null && message.hasOwnProperty("images")) {
    //     if (!isObject(message.images)) {
    //       return "images: object expected";
    //     }
    //     const keys = Object.keys(message.images);
    //     for (let i = 0; i < keys.length; ++i) {
    //       const key = keys[i];
    //       if (
    //         !(
    //           (message.images[key] &&
    //             typeof message.images[key].length === "number") ||
    //           isString(message.images[key])
    //         )
    //       ) {
    //         return "images: buffer{k:string} expected";
    //       }
    //     }
    //   }
    //   if (message.sprites != null && message.hasOwnProperty("sprites")) {
    //     if (!Array.isArray(message.sprites)) {
    //       return "sprites: array expected";
    //     }
    //     for (let i = 0; i < message.sprites.length; ++i) {
    //       const error = SpriteEntity.verify(message.sprites[i]);
    //       if (error) {
    //         return "sprites." + error;
    //       }
    //     }
    //   }
    //   return null;
    // }
    /**
     * Creates a MovieEntity message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {com.opensource.svga.MovieEntity} MovieEntity
     */
    // static fromObject(object: Record<string, any>): MovieEntity {
    //   if (object instanceof MovieEntity) {
    //     return object;
    //   }
    //   const message = new MovieEntity();
    //   if (object.version != null) {
    //     message.version = "" + object.version;
    //   }
    //   if (object.params != null) {
    //     if (typeof object.params !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.MovieEntity.params: object expected"
    //       );
    //     }
    //     message.params = MovieParams.fromObject(object.params);
    //   }
    //   if (object.images) {
    //     if (typeof object.images !== "object") {
    //       throw TypeError(
    //         ".com.opensource.svga.MovieEntity.images: object expected"
    //       );
    //     }
    //     message.images = {};
    //     const keys = Object.keys(object.images);
    //     for (let i = 0; i < keys.length; ++i) {
    //       const key = keys[i];
    //       if (typeof object.images[key] === "string") {
    //         base64.decode(
    //           object.images[key],
    //           (message.images[key] = new Uint8Array(
    //             base64.length(object.images[key])
    //           )),
    //           0
    //         );
    //       } else if (object.images[key].length >= 0) {
    //         message.images[key] = object.images[key];
    //       }
    //     }
    //   }
    //   if (object.sprites) {
    //     if (!Array.isArray(object.sprites)) {
    //       throw TypeError(
    //         ".com.opensource.svga.MovieEntity.sprites: array expected"
    //       );
    //     }
    //     message.sprites = [];
    //     for (let i = 0; i < object.sprites.length; ++i) {
    //       if (typeof object.sprites[i] !== "object") {
    //         throw TypeError(
    //           ".com.opensource.svga.MovieEntity.sprites: object expected"
    //         );
    //       }
    //       message.sprites[i] = SpriteEntity.fromObject(object.sprites[i]);
    //     }
    //   }
    //   return message;
    // }
    /**
     * Creates a plain object from a MovieEntity message. Also converts values to other types if specified.
     * @function toObject
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {com.opensource.svga.MovieEntity} message MovieEntity
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    static toObject(message, options) {
        if (!options) {
            options = {};
        }
        const object = {};
        if (options.arrays || options.defaults) {
            object.sprites = [];
        }
        if (options.objects || options.defaults) {
            object.images = {};
        }
        if (options.defaults) {
            object.version = "";
            object.params = null;
        }
        if (message.version != null && message.hasOwnProperty("version")) {
            object.version = message.version;
        }
        if (message.params != null && message.hasOwnProperty("params")) {
            object.params = MovieParams.toObject(message.params, options);
        }
        let keys2;
        if (message.images && (keys2 = Object.keys(message.images)).length) {
            object.images = {};
            for (let j = 0; j < keys2.length; ++j) {
                const key = keys2[j];
                object.images[key] =
                    options.bytes === String
                        ? base64.encode(message.images[key], 0, message.images[key].length)
                        : options.bytes === Array
                            ? [...message.images[key]]
                            : message.images[key];
            }
        }
        if (message.sprites && message.sprites.length) {
            object.sprites = [];
            for (let j = 0; j < message.sprites.length; ++j) {
                object.sprites[j] = SpriteEntity.toObject(message.sprites[j], options);
            }
        }
        return object;
    }
    /**
     * Gets the default type url for MovieEntity
     * @function getTypeUrl
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    static getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/com.opensource.svga.MovieEntity";
    }
    /**
     * MovieEntity version.
     * @member {string} version
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    version = "";
    /**
     * MovieEntity params.
     * @member {com.opensource.svga.IMovieParams|null|undefined} params
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    params = null;
    /**
     * MovieEntity images.
     * @member {Object.<string,Uint8Array>} images
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    images = {};
    /**
     * MovieEntity sprites.
     * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    sprites = [];
    /**
     * Constructs a new MovieEntity.
     * @memberof com.opensource.svga
     * @classdesc Represents a MovieEntity.
     * @implements IMovieEntity
     * @constructor
     * @param {com.opensource.svga.IMovieEntity=} [properties] Properties to set
     */
    constructor(properties) {
        if (properties) {
            if (properties.version != null) {
                this.version = properties.version;
            }
            if (properties.images != null) {
                this.images = properties.images;
            }
            if (properties.params != null) {
                this.params = properties.params;
            }
            if (properties.sprites != null) {
                this.sprites = properties.sprites;
            }
        }
    }
    /**
     * Converts this MovieEntity to JSON.
     * @function toJSON
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    toJSON() {
        return MovieEntity.toObject(this, toJSONOptions);
    }
};

root.com = {
    opensource: {
        svga: {
            MovieParams,
            Layout,
            Transform,
            ShapeEntity,
            FrameEntity,
            SpriteEntity,
            MovieEntity: MovieEntity$1,
        },
    },
};

const { MovieEntity } = root.com.opensource.svga;

export { MovieEntity, index as base64 };
//# sourceMappingURL=index.js.map
