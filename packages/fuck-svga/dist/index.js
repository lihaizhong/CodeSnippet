// DEFLATE is a complex format; to read this code, you should probably check the RFC first:
// https://tools.ietf.org/html/rfc1951
// You may also wish to take a look at the guide I made about this program:
// https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad
// Some of the following code is similar to that of UZIP.js:
// https://github.com/photopea/UZIP.js
// However, the vast majority of the codebase has diverged from UZIP.js to increase performance and reduce bundle size.
// Sometimes 0 will appear where -1 would be more appropriate. This is because using a uint
// is better for memory in most engines (I *think*).

// aliases for shorter compressed code (most minifers don't do this)
var u8 = Uint8Array, u16 = Uint16Array, i32 = Int32Array;
// fixed length extra bits
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
// fixed distance extra bits
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
// code length index map
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
// get base, reverse index map from extra bits
var freb = function (eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) {
        b[i] = start += 1 << eb[i - 1];
    }
    // numbers here are at max 18 bits
    var r = new i32(b[30]);
    for (var i = 1; i < 30; ++i) {
        for (var j = b[i]; j < b[i + 1]; ++j) {
            r[j] = ((j - b[i]) << 5) | i;
        }
    }
    return { b: b, r: r };
};
var _a = freb(fleb, 2), fl = _a.b, revfl = _a.r;
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0), fd = _b.b;
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
for (var i = 0; i < 32768; ++i) {
    // reverse table algorithm from SO
    var x = ((i & 0xAAAA) >> 1) | ((i & 0x5555) << 1);
    x = ((x & 0xCCCC) >> 2) | ((x & 0x3333) << 2);
    x = ((x & 0xF0F0) >> 4) | ((x & 0x0F0F) << 4);
    rev[i] = (((x & 0xFF00) >> 8) | ((x & 0x00FF) << 8)) >> 1;
}
// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
var hMap = (function (cd, mb, r) {
    var s = cd.length;
    // index
    var i = 0;
    // u16 "map": index -> # of codes with bit length = index
    var l = new u16(mb);
    // length of cd must be 288 (total # of codes)
    for (; i < s; ++i) {
        if (cd[i])
            ++l[cd[i] - 1];
    }
    // u16 "map": index -> minimum code for bit length = index
    var le = new u16(mb);
    for (i = 1; i < mb; ++i) {
        le[i] = (le[i - 1] + l[i - 1]) << 1;
    }
    var co;
    if (r) {
        // u16 "map": index -> number of actual bits, symbol for code
        co = new u16(1 << mb);
        // bits to remove for reverser
        var rvb = 15 - mb;
        for (i = 0; i < s; ++i) {
            // ignore 0 lengths
            if (cd[i]) {
                // num encoding both symbol and bits read
                var sv = (i << 4) | cd[i];
                // free bits
                var r_1 = mb - cd[i];
                // start value
                var v = le[cd[i] - 1]++ << r_1;
                // m is end value
                for (var m = v | ((1 << r_1) - 1); v <= m; ++v) {
                    // every 16 bit value starting with the code yields the same result
                    co[rev[v] >> rvb] = sv;
                }
            }
        }
    }
    else {
        co = new u16(s);
        for (i = 0; i < s; ++i) {
            if (cd[i]) {
                co[i] = rev[le[cd[i] - 1]++] >> (15 - cd[i]);
            }
        }
    }
    return co;
});
// fixed length tree
var flt = new u8(288);
for (var i = 0; i < 144; ++i)
    flt[i] = 8;
for (var i = 144; i < 256; ++i)
    flt[i] = 9;
for (var i = 256; i < 280; ++i)
    flt[i] = 7;
for (var i = 280; i < 288; ++i)
    flt[i] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var i = 0; i < 32; ++i)
    fdt[i] = 5;
// fixed length map
var flrm = /*#__PURE__*/ hMap(flt, 9, 1);
// fixed distance map
var fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
// find max of array
var max = function (a) {
    var m = a[0];
    for (var i = 1; i < a.length; ++i) {
        if (a[i] > m)
            m = a[i];
    }
    return m;
};
// read d, starting at bit p and mask with m
var bits = function (d, p, m) {
    var o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8)) >> (p & 7)) & m;
};
// read d, starting at bit p continuing for at least 16 bits
var bits16 = function (d, p) {
    var o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >> (p & 7));
};
// get end of byte
var shft = function (p) { return ((p + 7) / 8) | 0; };
// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
var slc = function (v, s, e) {
    if (e == null || e > v.length)
        e = v.length;
    // can't use .constructor in case user-supplied
    return new u8(v.subarray(s, e));
};
// error codes
var ec = [
    'unexpected EOF',
    'invalid block type',
    'invalid length/literal',
    'invalid distance',
    'stream finished',
    'no stream handler',
    ,
    'no callback',
    'invalid UTF-8 data',
    'extra field too long',
    'date not in range 1980-2099',
    'filename too long',
    'stream finishing',
    'invalid zip data'
    // determined by unknown compression method
];
var err = function (ind, msg, nt) {
    var e = new Error(msg || ec[ind]);
    e.code = ind;
    if (Error.captureStackTrace)
        Error.captureStackTrace(e, err);
    if (!nt)
        throw e;
    return e;
};
// expands raw DEFLATE data
var inflt = function (dat, st, buf, dict) {
    // source length       dict length
    var sl = dat.length, dl = 0;
    if (!sl || st.f && !st.l)
        return buf || new u8(0);
    var noBuf = !buf;
    // have to estimate size
    var resize = noBuf || st.i != 2;
    // no state
    var noSt = st.i;
    // Assumes roughly 33% compression ratio average
    if (noBuf)
        buf = new u8(sl * 3);
    // ensure buffer can fit at least l elements
    var cbuf = function (l) {
        var bl = buf.length;
        // need to increase size to fit
        if (l > bl) {
            // Double or set to necessary, whichever is greater
            var nbuf = new u8(Math.max(bl * 2, l));
            nbuf.set(buf);
            buf = nbuf;
        }
    };
    //  last chunk         bitpos           bytes
    var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    // total bits
    var tbts = sl * 8;
    do {
        if (!lm) {
            // BFINAL - this is only 1 when last chunk is next
            final = bits(dat, pos, 1);
            // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
            var type = bits(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
                // go to end of byte boundary
                var s = shft(pos) + 4, l = dat[s - 4] | (dat[s - 3] << 8), t = s + l;
                if (t > sl) {
                    if (noSt)
                        err(0);
                    break;
                }
                // ensure size
                if (resize)
                    cbuf(bt + l);
                // Copy over uncompressed data
                buf.set(dat.subarray(s, t), bt);
                // Get new bitpos, update byte count
                st.b = bt += l, st.p = pos = t * 8, st.f = final;
                continue;
            }
            else if (type == 1)
                lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (type == 2) {
                //  literal                            lengths
                var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                var tl = hLit + bits(dat, pos + 5, 31) + 1;
                pos += 14;
                // length+distance tree
                var ldt = new u8(tl);
                // code length tree
                var clt = new u8(19);
                for (var i = 0; i < hcLen; ++i) {
                    // use index map to get real code
                    clt[clim[i]] = bits(dat, pos + i * 3, 7);
                }
                pos += hcLen * 3;
                // code lengths bits
                var clb = max(clt), clbmsk = (1 << clb) - 1;
                // code lengths map
                var clm = hMap(clt, clb, 1);
                for (var i = 0; i < tl;) {
                    var r = clm[bits(dat, pos, clbmsk)];
                    // bits read
                    pos += r & 15;
                    // symbol
                    var s = r >> 4;
                    // code length to copy
                    if (s < 16) {
                        ldt[i++] = s;
                    }
                    else {
                        //  copy   count
                        var c = 0, n = 0;
                        if (s == 16)
                            n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
                        else if (s == 17)
                            n = 3 + bits(dat, pos, 7), pos += 3;
                        else if (s == 18)
                            n = 11 + bits(dat, pos, 127), pos += 7;
                        while (n--)
                            ldt[i++] = c;
                    }
                }
                //    length tree                 distance tree
                var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                // max length bits
                lbt = max(lt);
                // max dist bits
                dbt = max(dt);
                lm = hMap(lt, lbt, 1);
                dm = hMap(dt, dbt, 1);
            }
            else
                err(1);
            if (pos > tbts) {
                if (noSt)
                    err(0);
                break;
            }
        }
        // Make sure the buffer can hold this + the largest possible addition
        // Maximum chunk size (practically, theoretically infinite) is 2^17
        if (resize)
            cbuf(bt + 131072);
        var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
        var lpos = pos;
        for (;; lpos = pos) {
            // bits read, code
            var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
            pos += c & 15;
            if (pos > tbts) {
                if (noSt)
                    err(0);
                break;
            }
            if (!c)
                err(2);
            if (sym < 256)
                buf[bt++] = sym;
            else if (sym == 256) {
                lpos = pos, lm = null;
                break;
            }
            else {
                var add = sym - 254;
                // no extra bits needed if less
                if (sym > 264) {
                    // index
                    var i = sym - 257, b = fleb[i];
                    add = bits(dat, pos, (1 << b) - 1) + fl[i];
                    pos += b;
                }
                // dist
                var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
                if (!d)
                    err(3);
                pos += d & 15;
                var dt = fd[dsym];
                if (dsym > 3) {
                    var b = fdeb[dsym];
                    dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
                }
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
                if (resize)
                    cbuf(bt + 131072);
                var end = bt + add;
                if (bt < dt) {
                    var shift = dl - dt, dend = Math.min(dt, end);
                    if (shift + bt < 0)
                        err(3);
                    for (; bt < dend; ++bt)
                        buf[bt] = dict[shift + bt];
                }
                for (; bt < end; ++bt)
                    buf[bt] = buf[bt - dt];
            }
        }
        st.l = lm, st.p = lpos, st.b = bt, st.f = final;
        if (lm)
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    // don't reallocate for streams or user buffers
    return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
// empty
var et = /*#__PURE__*/ new u8(0);
// zlib start
var zls = function (d, dict) {
    if ((d[0] & 15) != 8 || (d[0] >> 4) > 7 || ((d[0] << 8 | d[1]) % 31))
        err(6, 'invalid zlib data');
    if ((d[1] >> 5 & 1) == +!dict)
        err(6, 'invalid zlib data: ' + (d[1] & 32 ? 'need' : 'unexpected') + ' dictionary');
    return (d[1] >> 3 & 4) + 2;
};
/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
function unzlibSync(data, opts) {
    return inflt(data.subarray(zls(data, opts), -4), { i: 2 }, opts, opts);
}
// text decoder
var td = typeof TextDecoder != 'undefined' && /*#__PURE__*/ new TextDecoder();
// text decoder stream
var tds = 0;
try {
    td.decode(et, { stream: true });
    tds = 1;
}
catch (e) { }

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
var $root = {};

var pool_1;
var hasRequiredPool;

function requirePool () {
	if (hasRequiredPool) return pool_1;
	hasRequiredPool = 1;
	pool_1 = pool;

	/**
	 * An allocator as used by {@link util.pool}.
	 * @typedef PoolAllocator
	 * @type {function}
	 * @param {number} size Buffer size
	 * @returns {Uint8Array} Buffer
	 */

	/**
	 * A slicer as used by {@link util.pool}.
	 * @typedef PoolSlicer
	 * @type {function}
	 * @param {number} start Start offset
	 * @param {number} end End offset
	 * @returns {Uint8Array} Buffer slice
	 * @this {Uint8Array}
	 */

	/**
	 * A general purpose buffer pool.
	 * @memberof util
	 * @function
	 * @param {PoolAllocator} alloc Allocator
	 * @param {PoolSlicer} slice Slicer
	 * @param {number} [size=8192] Slab size
	 * @returns {PoolAllocator} Pooled allocator
	 */
	function pool(alloc, slice, size) {
	    var SIZE   = size || 8192;
	    var MAX    = SIZE >>> 1;
	    var slab   = null;
	    var offset = SIZE;
	    return function pool_alloc(size) {
	        if (size < 1 || size > MAX)
	            return alloc(size);
	        if (offset + size > SIZE) {
	            slab = alloc(SIZE);
	            offset = 0;
	        }
	        var buf = slice.call(slab, offset, offset += size);
	        if (offset & 7) // align to 32 bit
	            offset = (offset | 7) + 1;
	        return buf;
	    };
	}
	return pool_1;
}

var poolExports = requirePool();
var pool = /*@__PURE__*/getDefaultExportFromCjs(poolExports);

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

function noop() { }
function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
}
function writeBytes(val, buf, pos) {
    // also works for plain array values
    buf.set(val, pos);
}
function writeVarint32(val, buf, pos) {
    while (val > 127) {
        buf[pos++] = (val & 127) | 128;
        val >>>= 7;
    }
    buf[pos] = val;
}
function writeVarint64(val, buf, pos) {
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
/**
 * Tests if the specified value is an string.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an string
 */
function isString(val) {
    return typeof val === "string" || val instanceof String;
}
/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
function isInteger(value) {
    return (typeof value === "number" && isFinite(value) && Math.floor(value) === value);
}
/**
 * An immuable empty array.
 * @memberof util
 * @type {Array.<*>}
 * @const
 */
const emptyArray = Object.freeze([]);
/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
const emptyObject = Object.freeze({});
/**
 * Builds a getter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfGetter} Unbound getter
 */
function getOneOf(fieldNames) {
    var fieldMap = {};
    for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;
    /**
     * @returns {string|undefined} Set field name, if any
     * @this Object
     * @ignore
     */
    return function oneOfGetter() {
        // eslint-disable-line consistent-return
        // @ts-ignore
        for (var keys = Object.keys(this), i = keys.length - 1; i > -1; --i) {
            if (fieldMap[keys[i]] === 1 &&
                // @ts-ignore
                this[keys[i]] !== undefined &&
                // @ts-ignore
                this[keys[i]] !== null) {
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
function setOneOf(fieldNames) {
    /**
     * @param {string} name Field name
     * @returns {undefined}
     * @this Object
     * @ignore
     */
    return function oneOfSetter(name) {
        for (var i = 0; i < fieldNames.length; ++i) {
            if (fieldNames[i] !== name) {
                // @ts-ignore
                delete this[fieldNames[i]];
            }
        }
    };
}

class State {
    /**
     * Current head.
     * @type {Writer.Op}
     */
    head = null;
    /**
     * Current tail.
     * @type {Writer.Op}
     */
    tail = null;
    /**
     * Current buffer length.
     * @type {number}
     */
    len;
    /**
     * Next state.
     * @type {State|null}
     */
    next = null;
    /**
     * Constructs a new writer state instance.
     * @classdesc Copied writer state.
     * @memberof Writer
     * @constructor
     * @param {Writer} writer Writer to copy state from
     * @ignore
     */
    constructor(writer) {
        this.head = writer.head;
        this.tail = writer.tail;
        this.len = writer.len;
        this.next = writer.states;
    }
}

class Op {
    /**
     * Function to call.
     * @type {function(*, Uint8Array, number)}
     */
    fn;
    /**
     * Value byte length.
     * @type {number}
     */
    len;
    /**
     * Next operation.
     * @type {Writer.Op|undefined}
     */
    next = null;
    /**
     * Value to write.
     * @type {*}
     */
    val;
    /**
     * Constructs a new writer operation instance.
     * @classdesc Scheduled writer operation.
     * @constructor
     * @param {function(*, Uint8Array, number)} fn Function to call
     * @param {number} len Value byte length
     * @param {*} val Value to write
     * @ignore
     */
    constructor(fn, len, val) {
        this.fn = fn;
        this.len = len;
        this.val = val; // type varies
    }
}

// import { LongBits } from "../dts";
class Writer {
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
    static alloc(size) {
        return pool((size) => new Uint8Array(size), Uint8Array.prototype.subarray)(size);
    }
    /**
     * Current length.
     * @type {number}
     */
    len;
    /**
     * Operations head.
     * @type {Object}
     */
    head;
    /**
     * Operations tail
     * @type {Object}
     */
    tail;
    /**
     * Linked forked states.
     * @type {Object|null}
     */
    states;
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
    push(fn, len, val) {
        this.tail = this.tail.next = new Op(fn, len, val);
        this.len += len;
        return this;
    }
    /**
     * Writes an unsigned 32 bit value as a varint.
     * @param {number} value Value to write
     * @returns {Writer} `this`
     */
    uint32(value) {
        // here, the call to this.push has been inlined and a varint specific Op subclass is used.
        // uint32 is by far the most frequently used operation and benefits significantly from this.
        this.len += (this.tail = this.tail.next =
            new Op(writeVarint32, (value = value >>> 0) < 128
                ? 1
                : value < 16384
                    ? 2
                    : value < 2097152
                        ? 3
                        : value < 268435456
                            ? 4
                            : 5, value)).len;
        return this;
    }
    /**
     * Writes a signed 32 bit value as a varint.
     * @function
     * @param {number} value Value to write
     * @returns {Writer} `this`
     */
    int32(value) {
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
    bool(value) {
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
    float(value) {
        return this.push(float.writeFloatLE, 4, value);
    }
    /**
     * Writes a double (64 bit float).
     * @function
     * @param {number} value Value to write
     * @returns {Writer} `this`
     */
    double(value) {
        return this.push(float.writeDoubleLE, 8, value);
    }
    /**
     * Writes a sequence of bytes.
     * @param {Uint8Array|string} value Buffer or base64 encoded string to write
     * @returns {Writer} `this`
     */
    bytes(value) {
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
    string(value) {
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
    fork() {
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
            this.head = this.states.head;
            this.tail = this.states.tail;
            this.len = this.states.len;
            this.states = this.states.next;
        }
        else {
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
}

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

/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/

const com = $root.com = (() => {

    /**
     * Namespace com.
     * @exports com
     * @namespace
     */
    const com = {};

    com.opensource = (function() {

        /**
         * Namespace opensource.
         * @memberof com
         * @namespace
         */
        const opensource = {};

        opensource.svga = (function() {

            /**
             * Namespace svga.
             * @memberof com.opensource
             * @namespace
             */
            const svga = {};

            svga.MovieParams = (function() {

                /**
                 * Properties of a MovieParams.
                 * @memberof com.opensource.svga
                 * @interface IMovieParams
                 * @property {number|null} [viewBoxWidth] MovieParams viewBoxWidth
                 * @property {number|null} [viewBoxHeight] MovieParams viewBoxHeight
                 * @property {number|null} [fps] MovieParams fps
                 * @property {number|null} [frames] MovieParams frames
                 */

                /**
                 * Constructs a new MovieParams.
                 * @memberof com.opensource.svga
                 * @classdesc Represents a MovieParams.
                 * @implements IMovieParams
                 * @constructor
                 * @param {com.opensource.svga.IMovieParams=} [properties] Properties to set
                 */
                function MovieParams(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * MovieParams viewBoxWidth.
                 * @member {number} viewBoxWidth
                 * @memberof com.opensource.svga.MovieParams
                 * @instance
                 */
                MovieParams.prototype.viewBoxWidth = 0;

                /**
                 * MovieParams viewBoxHeight.
                 * @member {number} viewBoxHeight
                 * @memberof com.opensource.svga.MovieParams
                 * @instance
                 */
                MovieParams.prototype.viewBoxHeight = 0;

                /**
                 * MovieParams fps.
                 * @member {number} fps
                 * @memberof com.opensource.svga.MovieParams
                 * @instance
                 */
                MovieParams.prototype.fps = 0;

                /**
                 * MovieParams frames.
                 * @member {number} frames
                 * @memberof com.opensource.svga.MovieParams
                 * @instance
                 */
                MovieParams.prototype.frames = 0;

                /**
                 * Creates a new MovieParams instance using the specified properties.
                 * @function create
                 * @memberof com.opensource.svga.MovieParams
                 * @static
                 * @param {com.opensource.svga.IMovieParams=} [properties] Properties to set
                 * @returns {com.opensource.svga.MovieParams} MovieParams instance
                 */
                MovieParams.create = function create(properties) {
                    return new MovieParams(properties);
                };

                /**
                 * Encodes the specified MovieParams message. Does not implicitly {@link com.opensource.svga.MovieParams.verify|verify} messages.
                 * @function encode
                 * @memberof com.opensource.svga.MovieParams
                 * @static
                 * @param {com.opensource.svga.IMovieParams} message MovieParams message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MovieParams.encode = function encode(message, writer) {
                    if (!writer)
                        writer = Writer.create();
                    if (message.viewBoxWidth != null && Object.hasOwn(message, "viewBoxWidth"))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.viewBoxWidth);
                    if (message.viewBoxHeight != null && Object.hasOwn(message, "viewBoxHeight"))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.viewBoxHeight);
                    if (message.fps != null && Object.hasOwn(message, "fps"))
                        writer.uint32(/* id 3, wireType 0 =*/24).int32(message.fps);
                    if (message.frames != null && Object.hasOwn(message, "frames"))
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.frames);
                    return writer;
                };

                /**
                 * Encodes the specified MovieParams message, length delimited. Does not implicitly {@link com.opensource.svga.MovieParams.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof com.opensource.svga.MovieParams
                 * @static
                 * @param {com.opensource.svga.IMovieParams} message MovieParams message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MovieParams.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

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
                MovieParams.decode = function decode(reader, length) {
                    if (!(reader instanceof Reader))
                        reader = Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.MovieParams();
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
                };

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
                MovieParams.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof Reader))
                        reader = new Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a MovieParams message.
                 * @function verify
                 * @memberof com.opensource.svga.MovieParams
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                MovieParams.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.viewBoxWidth != null && message.hasOwnProperty("viewBoxWidth"))
                        if (typeof message.viewBoxWidth !== "number")
                            return "viewBoxWidth: number expected";
                    if (message.viewBoxHeight != null && message.hasOwnProperty("viewBoxHeight"))
                        if (typeof message.viewBoxHeight !== "number")
                            return "viewBoxHeight: number expected";
                    if (message.fps != null && message.hasOwnProperty("fps"))
                        if (!isInteger(message.fps))
                            return "fps: integer expected";
                    if (message.frames != null && message.hasOwnProperty("frames"))
                        if (!isInteger(message.frames))
                            return "frames: integer expected";
                    return null;
                };

                /**
                 * Creates a MovieParams message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof com.opensource.svga.MovieParams
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {com.opensource.svga.MovieParams} MovieParams
                 */
                MovieParams.fromObject = function fromObject(object) {
                    if (object instanceof $root.com.opensource.svga.MovieParams)
                        return object;
                    let message = new $root.com.opensource.svga.MovieParams();
                    if (object.viewBoxWidth != null)
                        message.viewBoxWidth = Number(object.viewBoxWidth);
                    if (object.viewBoxHeight != null)
                        message.viewBoxHeight = Number(object.viewBoxHeight);
                    if (object.fps != null)
                        message.fps = object.fps | 0;
                    if (object.frames != null)
                        message.frames = object.frames | 0;
                    return message;
                };

                /**
                 * Creates a plain object from a MovieParams message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof com.opensource.svga.MovieParams
                 * @static
                 * @param {com.opensource.svga.MovieParams} message MovieParams
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MovieParams.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.viewBoxWidth = 0;
                        object.viewBoxHeight = 0;
                        object.fps = 0;
                        object.frames = 0;
                    }
                    if (message.viewBoxWidth != null && message.hasOwnProperty("viewBoxWidth"))
                        object.viewBoxWidth = options.json && !isFinite(message.viewBoxWidth) ? String(message.viewBoxWidth) : message.viewBoxWidth;
                    if (message.viewBoxHeight != null && message.hasOwnProperty("viewBoxHeight"))
                        object.viewBoxHeight = options.json && !isFinite(message.viewBoxHeight) ? String(message.viewBoxHeight) : message.viewBoxHeight;
                    if (message.fps != null && message.hasOwnProperty("fps"))
                        object.fps = message.fps;
                    if (message.frames != null && message.hasOwnProperty("frames"))
                        object.frames = message.frames;
                    return object;
                };

                /**
                 * Converts this MovieParams to JSON.
                 * @function toJSON
                 * @memberof com.opensource.svga.MovieParams
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MovieParams.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for MovieParams
                 * @function getTypeUrl
                 * @memberof com.opensource.svga.MovieParams
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                MovieParams.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/com.opensource.svga.MovieParams";
                };

                return MovieParams;
            })();

            svga.SpriteEntity = (function() {

                /**
                 * Properties of a SpriteEntity.
                 * @memberof com.opensource.svga
                 * @interface ISpriteEntity
                 * @property {string|null} [imageKey] SpriteEntity imageKey
                 * @property {Array.<com.opensource.svga.IFrameEntity>|null} [frames] SpriteEntity frames
                 * @property {string|null} [matteKey] SpriteEntity matteKey
                 */

                /**
                 * Constructs a new SpriteEntity.
                 * @memberof com.opensource.svga
                 * @classdesc Represents a SpriteEntity.
                 * @implements ISpriteEntity
                 * @constructor
                 * @param {com.opensource.svga.ISpriteEntity=} [properties] Properties to set
                 */
                function SpriteEntity(properties) {
                    this.frames = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * SpriteEntity imageKey.
                 * @member {string} imageKey
                 * @memberof com.opensource.svga.SpriteEntity
                 * @instance
                 */
                SpriteEntity.prototype.imageKey = "";

                /**
                 * SpriteEntity frames.
                 * @member {Array.<com.opensource.svga.IFrameEntity>} frames
                 * @memberof com.opensource.svga.SpriteEntity
                 * @instance
                 */
                SpriteEntity.prototype.frames = emptyArray;

                /**
                 * SpriteEntity matteKey.
                 * @member {string} matteKey
                 * @memberof com.opensource.svga.SpriteEntity
                 * @instance
                 */
                SpriteEntity.prototype.matteKey = "";

                /**
                 * Creates a new SpriteEntity instance using the specified properties.
                 * @function create
                 * @memberof com.opensource.svga.SpriteEntity
                 * @static
                 * @param {com.opensource.svga.ISpriteEntity=} [properties] Properties to set
                 * @returns {com.opensource.svga.SpriteEntity} SpriteEntity instance
                 */
                SpriteEntity.create = function create(properties) {
                    return new SpriteEntity(properties);
                };

                /**
                 * Encodes the specified SpriteEntity message. Does not implicitly {@link com.opensource.svga.SpriteEntity.verify|verify} messages.
                 * @function encode
                 * @memberof com.opensource.svga.SpriteEntity
                 * @static
                 * @param {com.opensource.svga.ISpriteEntity} message SpriteEntity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SpriteEntity.encode = function encode(message, writer) {
                    if (!writer)
                        writer = Writer.create();
                    if (message.imageKey != null && Object.hasOwn(message, "imageKey"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.imageKey);
                    if (message.frames != null && message.frames.length)
                        for (let i = 0; i < message.frames.length; ++i)
                            $root.com.opensource.svga.FrameEntity.encode(message.frames[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.matteKey != null && Object.hasOwn(message, "matteKey"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.matteKey);
                    return writer;
                };

                /**
                 * Encodes the specified SpriteEntity message, length delimited. Does not implicitly {@link com.opensource.svga.SpriteEntity.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof com.opensource.svga.SpriteEntity
                 * @static
                 * @param {com.opensource.svga.ISpriteEntity} message SpriteEntity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SpriteEntity.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

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
                SpriteEntity.decode = function decode(reader, length) {
                    if (!(reader instanceof Reader))
                        reader = Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.SpriteEntity();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.imageKey = reader.string();
                                break;
                            }
                        case 2: {
                                if (!(message.frames && message.frames.length))
                                    message.frames = [];
                                message.frames.push($root.com.opensource.svga.FrameEntity.decode(reader, reader.uint32()));
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
                };

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
                SpriteEntity.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof Reader))
                        reader = new Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a SpriteEntity message.
                 * @function verify
                 * @memberof com.opensource.svga.SpriteEntity
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                SpriteEntity.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.imageKey != null && message.hasOwnProperty("imageKey"))
                        if (!isString(message.imageKey))
                            return "imageKey: string expected";
                    if (message.frames != null && message.hasOwnProperty("frames")) {
                        if (!Array.isArray(message.frames))
                            return "frames: array expected";
                        for (let i = 0; i < message.frames.length; ++i) {
                            let error = $root.com.opensource.svga.FrameEntity.verify(message.frames[i]);
                            if (error)
                                return "frames." + error;
                        }
                    }
                    if (message.matteKey != null && message.hasOwnProperty("matteKey"))
                        if (!isString(message.matteKey))
                            return "matteKey: string expected";
                    return null;
                };

                /**
                 * Creates a SpriteEntity message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof com.opensource.svga.SpriteEntity
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
                 */
                SpriteEntity.fromObject = function fromObject(object) {
                    if (object instanceof $root.com.opensource.svga.SpriteEntity)
                        return object;
                    let message = new $root.com.opensource.svga.SpriteEntity();
                    if (object.imageKey != null)
                        message.imageKey = String(object.imageKey);
                    if (object.frames) {
                        if (!Array.isArray(object.frames))
                            throw TypeError(".com.opensource.svga.SpriteEntity.frames: array expected");
                        message.frames = [];
                        for (let i = 0; i < object.frames.length; ++i) {
                            if (typeof object.frames[i] !== "object")
                                throw TypeError(".com.opensource.svga.SpriteEntity.frames: object expected");
                            message.frames[i] = $root.com.opensource.svga.FrameEntity.fromObject(object.frames[i]);
                        }
                    }
                    if (object.matteKey != null)
                        message.matteKey = String(object.matteKey);
                    return message;
                };

                /**
                 * Creates a plain object from a SpriteEntity message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof com.opensource.svga.SpriteEntity
                 * @static
                 * @param {com.opensource.svga.SpriteEntity} message SpriteEntity
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                SpriteEntity.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.frames = [];
                    if (options.defaults) {
                        object.imageKey = "";
                        object.matteKey = "";
                    }
                    if (message.imageKey != null && message.hasOwnProperty("imageKey"))
                        object.imageKey = message.imageKey;
                    if (message.frames && message.frames.length) {
                        object.frames = [];
                        for (let j = 0; j < message.frames.length; ++j)
                            object.frames[j] = $root.com.opensource.svga.FrameEntity.toObject(message.frames[j], options);
                    }
                    if (message.matteKey != null && message.hasOwnProperty("matteKey"))
                        object.matteKey = message.matteKey;
                    return object;
                };

                /**
                 * Converts this SpriteEntity to JSON.
                 * @function toJSON
                 * @memberof com.opensource.svga.SpriteEntity
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                SpriteEntity.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for SpriteEntity
                 * @function getTypeUrl
                 * @memberof com.opensource.svga.SpriteEntity
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                SpriteEntity.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/com.opensource.svga.SpriteEntity";
                };

                return SpriteEntity;
            })();

            svga.Layout = (function() {

                /**
                 * Properties of a Layout.
                 * @memberof com.opensource.svga
                 * @interface ILayout
                 * @property {number|null} [x] Layout x
                 * @property {number|null} [y] Layout y
                 * @property {number|null} [width] Layout width
                 * @property {number|null} [height] Layout height
                 */

                /**
                 * Constructs a new Layout.
                 * @memberof com.opensource.svga
                 * @classdesc Represents a Layout.
                 * @implements ILayout
                 * @constructor
                 * @param {com.opensource.svga.ILayout=} [properties] Properties to set
                 */
                function Layout(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Layout x.
                 * @member {number} x
                 * @memberof com.opensource.svga.Layout
                 * @instance
                 */
                Layout.prototype.x = 0;

                /**
                 * Layout y.
                 * @member {number} y
                 * @memberof com.opensource.svga.Layout
                 * @instance
                 */
                Layout.prototype.y = 0;

                /**
                 * Layout width.
                 * @member {number} width
                 * @memberof com.opensource.svga.Layout
                 * @instance
                 */
                Layout.prototype.width = 0;

                /**
                 * Layout height.
                 * @member {number} height
                 * @memberof com.opensource.svga.Layout
                 * @instance
                 */
                Layout.prototype.height = 0;

                /**
                 * Creates a new Layout instance using the specified properties.
                 * @function create
                 * @memberof com.opensource.svga.Layout
                 * @static
                 * @param {com.opensource.svga.ILayout=} [properties] Properties to set
                 * @returns {com.opensource.svga.Layout} Layout instance
                 */
                Layout.create = function create(properties) {
                    return new Layout(properties);
                };

                /**
                 * Encodes the specified Layout message. Does not implicitly {@link com.opensource.svga.Layout.verify|verify} messages.
                 * @function encode
                 * @memberof com.opensource.svga.Layout
                 * @static
                 * @param {com.opensource.svga.ILayout} message Layout message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Layout.encode = function encode(message, writer) {
                    if (!writer)
                        writer = Writer.create();
                    if (message.x != null && Object.hasOwn(message, "x"))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
                    if (message.y != null && Object.hasOwn(message, "y"))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
                    if (message.width != null && Object.hasOwn(message, "width"))
                        writer.uint32(/* id 3, wireType 5 =*/29).float(message.width);
                    if (message.height != null && Object.hasOwn(message, "height"))
                        writer.uint32(/* id 4, wireType 5 =*/37).float(message.height);
                    return writer;
                };

                /**
                 * Encodes the specified Layout message, length delimited. Does not implicitly {@link com.opensource.svga.Layout.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof com.opensource.svga.Layout
                 * @static
                 * @param {com.opensource.svga.ILayout} message Layout message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Layout.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

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
                Layout.decode = function decode(reader, length) {
                    if (!(reader instanceof Reader))
                        reader = Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.Layout();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
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
                };

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
                Layout.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof Reader))
                        reader = new Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Layout message.
                 * @function verify
                 * @memberof com.opensource.svga.Layout
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Layout.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.x != null && message.hasOwnProperty("x"))
                        if (typeof message.x !== "number")
                            return "x: number expected";
                    if (message.y != null && message.hasOwnProperty("y"))
                        if (typeof message.y !== "number")
                            return "y: number expected";
                    if (message.width != null && message.hasOwnProperty("width"))
                        if (typeof message.width !== "number")
                            return "width: number expected";
                    if (message.height != null && message.hasOwnProperty("height"))
                        if (typeof message.height !== "number")
                            return "height: number expected";
                    return null;
                };

                /**
                 * Creates a Layout message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof com.opensource.svga.Layout
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {com.opensource.svga.Layout} Layout
                 */
                Layout.fromObject = function fromObject(object) {
                    if (object instanceof $root.com.opensource.svga.Layout)
                        return object;
                    let message = new $root.com.opensource.svga.Layout();
                    if (object.x != null)
                        message.x = Number(object.x);
                    if (object.y != null)
                        message.y = Number(object.y);
                    if (object.width != null)
                        message.width = Number(object.width);
                    if (object.height != null)
                        message.height = Number(object.height);
                    return message;
                };

                /**
                 * Creates a plain object from a Layout message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof com.opensource.svga.Layout
                 * @static
                 * @param {com.opensource.svga.Layout} message Layout
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Layout.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.x = 0;
                        object.y = 0;
                        object.width = 0;
                        object.height = 0;
                    }
                    if (message.x != null && message.hasOwnProperty("x"))
                        object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
                    if (message.y != null && message.hasOwnProperty("y"))
                        object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
                    if (message.width != null && message.hasOwnProperty("width"))
                        object.width = options.json && !isFinite(message.width) ? String(message.width) : message.width;
                    if (message.height != null && message.hasOwnProperty("height"))
                        object.height = options.json && !isFinite(message.height) ? String(message.height) : message.height;
                    return object;
                };

                /**
                 * Converts this Layout to JSON.
                 * @function toJSON
                 * @memberof com.opensource.svga.Layout
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Layout.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Layout
                 * @function getTypeUrl
                 * @memberof com.opensource.svga.Layout
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Layout.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/com.opensource.svga.Layout";
                };

                return Layout;
            })();

            svga.Transform = (function() {

                /**
                 * Properties of a Transform.
                 * @memberof com.opensource.svga
                 * @interface ITransform
                 * @property {number|null} [a] Transform a
                 * @property {number|null} [b] Transform b
                 * @property {number|null} [c] Transform c
                 * @property {number|null} [d] Transform d
                 * @property {number|null} [tx] Transform tx
                 * @property {number|null} [ty] Transform ty
                 */

                /**
                 * Constructs a new Transform.
                 * @memberof com.opensource.svga
                 * @classdesc Represents a Transform.
                 * @implements ITransform
                 * @constructor
                 * @param {com.opensource.svga.ITransform=} [properties] Properties to set
                 */
                function Transform(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Transform a.
                 * @member {number} a
                 * @memberof com.opensource.svga.Transform
                 * @instance
                 */
                Transform.prototype.a = 0;

                /**
                 * Transform b.
                 * @member {number} b
                 * @memberof com.opensource.svga.Transform
                 * @instance
                 */
                Transform.prototype.b = 0;

                /**
                 * Transform c.
                 * @member {number} c
                 * @memberof com.opensource.svga.Transform
                 * @instance
                 */
                Transform.prototype.c = 0;

                /**
                 * Transform d.
                 * @member {number} d
                 * @memberof com.opensource.svga.Transform
                 * @instance
                 */
                Transform.prototype.d = 0;

                /**
                 * Transform tx.
                 * @member {number} tx
                 * @memberof com.opensource.svga.Transform
                 * @instance
                 */
                Transform.prototype.tx = 0;

                /**
                 * Transform ty.
                 * @member {number} ty
                 * @memberof com.opensource.svga.Transform
                 * @instance
                 */
                Transform.prototype.ty = 0;

                /**
                 * Creates a new Transform instance using the specified properties.
                 * @function create
                 * @memberof com.opensource.svga.Transform
                 * @static
                 * @param {com.opensource.svga.ITransform=} [properties] Properties to set
                 * @returns {com.opensource.svga.Transform} Transform instance
                 */
                Transform.create = function create(properties) {
                    return new Transform(properties);
                };

                /**
                 * Encodes the specified Transform message. Does not implicitly {@link com.opensource.svga.Transform.verify|verify} messages.
                 * @function encode
                 * @memberof com.opensource.svga.Transform
                 * @static
                 * @param {com.opensource.svga.ITransform} message Transform message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Transform.encode = function encode(message, writer) {
                    if (!writer)
                        writer = Writer.create();
                    if (message.a != null && Object.hasOwn(message, "a"))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.a);
                    if (message.b != null && Object.hasOwn(message, "b"))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.b);
                    if (message.c != null && Object.hasOwn(message, "c"))
                        writer.uint32(/* id 3, wireType 5 =*/29).float(message.c);
                    if (message.d != null && Object.hasOwn(message, "d"))
                        writer.uint32(/* id 4, wireType 5 =*/37).float(message.d);
                    if (message.tx != null && Object.hasOwn(message, "tx"))
                        writer.uint32(/* id 5, wireType 5 =*/45).float(message.tx);
                    if (message.ty != null && Object.hasOwn(message, "ty"))
                        writer.uint32(/* id 6, wireType 5 =*/53).float(message.ty);
                    return writer;
                };

                /**
                 * Encodes the specified Transform message, length delimited. Does not implicitly {@link com.opensource.svga.Transform.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof com.opensource.svga.Transform
                 * @static
                 * @param {com.opensource.svga.ITransform} message Transform message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Transform.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

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
                Transform.decode = function decode(reader, length) {
                    if (!(reader instanceof Reader))
                        reader = Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.Transform();
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
                };

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
                Transform.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof Reader))
                        reader = new Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Transform message.
                 * @function verify
                 * @memberof com.opensource.svga.Transform
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Transform.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.a != null && message.hasOwnProperty("a"))
                        if (typeof message.a !== "number")
                            return "a: number expected";
                    if (message.b != null && message.hasOwnProperty("b"))
                        if (typeof message.b !== "number")
                            return "b: number expected";
                    if (message.c != null && message.hasOwnProperty("c"))
                        if (typeof message.c !== "number")
                            return "c: number expected";
                    if (message.d != null && message.hasOwnProperty("d"))
                        if (typeof message.d !== "number")
                            return "d: number expected";
                    if (message.tx != null && message.hasOwnProperty("tx"))
                        if (typeof message.tx !== "number")
                            return "tx: number expected";
                    if (message.ty != null && message.hasOwnProperty("ty"))
                        if (typeof message.ty !== "number")
                            return "ty: number expected";
                    return null;
                };

                /**
                 * Creates a Transform message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof com.opensource.svga.Transform
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {com.opensource.svga.Transform} Transform
                 */
                Transform.fromObject = function fromObject(object) {
                    if (object instanceof $root.com.opensource.svga.Transform)
                        return object;
                    let message = new $root.com.opensource.svga.Transform();
                    if (object.a != null)
                        message.a = Number(object.a);
                    if (object.b != null)
                        message.b = Number(object.b);
                    if (object.c != null)
                        message.c = Number(object.c);
                    if (object.d != null)
                        message.d = Number(object.d);
                    if (object.tx != null)
                        message.tx = Number(object.tx);
                    if (object.ty != null)
                        message.ty = Number(object.ty);
                    return message;
                };

                /**
                 * Creates a plain object from a Transform message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof com.opensource.svga.Transform
                 * @static
                 * @param {com.opensource.svga.Transform} message Transform
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Transform.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.a = 0;
                        object.b = 0;
                        object.c = 0;
                        object.d = 0;
                        object.tx = 0;
                        object.ty = 0;
                    }
                    if (message.a != null && message.hasOwnProperty("a"))
                        object.a = options.json && !isFinite(message.a) ? String(message.a) : message.a;
                    if (message.b != null && message.hasOwnProperty("b"))
                        object.b = options.json && !isFinite(message.b) ? String(message.b) : message.b;
                    if (message.c != null && message.hasOwnProperty("c"))
                        object.c = options.json && !isFinite(message.c) ? String(message.c) : message.c;
                    if (message.d != null && message.hasOwnProperty("d"))
                        object.d = options.json && !isFinite(message.d) ? String(message.d) : message.d;
                    if (message.tx != null && message.hasOwnProperty("tx"))
                        object.tx = options.json && !isFinite(message.tx) ? String(message.tx) : message.tx;
                    if (message.ty != null && message.hasOwnProperty("ty"))
                        object.ty = options.json && !isFinite(message.ty) ? String(message.ty) : message.ty;
                    return object;
                };

                /**
                 * Converts this Transform to JSON.
                 * @function toJSON
                 * @memberof com.opensource.svga.Transform
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Transform.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Transform
                 * @function getTypeUrl
                 * @memberof com.opensource.svga.Transform
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Transform.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/com.opensource.svga.Transform";
                };

                return Transform;
            })();

            svga.ShapeEntity = (function() {

                /**
                 * Properties of a ShapeEntity.
                 * @memberof com.opensource.svga
                 * @interface IShapeEntity
                 * @property {com.opensource.svga.ShapeEntity.ShapeType|null} [type] ShapeEntity type
                 * @property {com.opensource.svga.ShapeEntity.IShapeArgs|null} [shape] ShapeEntity shape
                 * @property {com.opensource.svga.ShapeEntity.IRectArgs|null} [rect] ShapeEntity rect
                 * @property {com.opensource.svga.ShapeEntity.IEllipseArgs|null} [ellipse] ShapeEntity ellipse
                 * @property {com.opensource.svga.ShapeEntity.IShapeStyle|null} [styles] ShapeEntity styles
                 * @property {com.opensource.svga.ITransform|null} [transform] ShapeEntity transform
                 */

                /**
                 * Constructs a new ShapeEntity.
                 * @memberof com.opensource.svga
                 * @classdesc Represents a ShapeEntity.
                 * @implements IShapeEntity
                 * @constructor
                 * @param {com.opensource.svga.IShapeEntity=} [properties] Properties to set
                 */
                function ShapeEntity(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ShapeEntity type.
                 * @member {com.opensource.svga.ShapeEntity.ShapeType} type
                 * @memberof com.opensource.svga.ShapeEntity
                 * @instance
                 */
                ShapeEntity.prototype.type = 0;

                /**
                 * ShapeEntity shape.
                 * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
                 * @memberof com.opensource.svga.ShapeEntity
                 * @instance
                 */
                ShapeEntity.prototype.shape = null;

                /**
                 * ShapeEntity rect.
                 * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
                 * @memberof com.opensource.svga.ShapeEntity
                 * @instance
                 */
                ShapeEntity.prototype.rect = null;

                /**
                 * ShapeEntity ellipse.
                 * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
                 * @memberof com.opensource.svga.ShapeEntity
                 * @instance
                 */
                ShapeEntity.prototype.ellipse = null;

                /**
                 * ShapeEntity styles.
                 * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
                 * @memberof com.opensource.svga.ShapeEntity
                 * @instance
                 */
                ShapeEntity.prototype.styles = null;

                /**
                 * ShapeEntity transform.
                 * @member {com.opensource.svga.ITransform|null|undefined} transform
                 * @memberof com.opensource.svga.ShapeEntity
                 * @instance
                 */
                ShapeEntity.prototype.transform = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * ShapeEntity args.
                 * @member {"shape"|"rect"|"ellipse"|undefined} args
                 * @memberof com.opensource.svga.ShapeEntity
                 * @instance
                 */
                Object.defineProperty(ShapeEntity.prototype, "args", {
                    get: getOneOf($oneOfFields = ["shape", "rect", "ellipse"]),
                    set: setOneOf($oneOfFields)
                });

                /**
                 * Creates a new ShapeEntity instance using the specified properties.
                 * @function create
                 * @memberof com.opensource.svga.ShapeEntity
                 * @static
                 * @param {com.opensource.svga.IShapeEntity=} [properties] Properties to set
                 * @returns {com.opensource.svga.ShapeEntity} ShapeEntity instance
                 */
                ShapeEntity.create = function create(properties) {
                    return new ShapeEntity(properties);
                };

                /**
                 * Encodes the specified ShapeEntity message. Does not implicitly {@link com.opensource.svga.ShapeEntity.verify|verify} messages.
                 * @function encode
                 * @memberof com.opensource.svga.ShapeEntity
                 * @static
                 * @param {com.opensource.svga.IShapeEntity} message ShapeEntity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ShapeEntity.encode = function encode(message, writer) {
                    if (!writer)
                        writer = Writer.create();
                    if (message.type != null && Object.hasOwn(message, "type"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                    if (message.shape != null && Object.hasOwn(message, "shape"))
                        $root.com.opensource.svga.ShapeEntity.ShapeArgs.encode(message.shape, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.rect != null && Object.hasOwn(message, "rect"))
                        $root.com.opensource.svga.ShapeEntity.RectArgs.encode(message.rect, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.ellipse != null && Object.hasOwn(message, "ellipse"))
                        $root.com.opensource.svga.ShapeEntity.EllipseArgs.encode(message.ellipse, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    if (message.styles != null && Object.hasOwn(message, "styles"))
                        $root.com.opensource.svga.ShapeEntity.ShapeStyle.encode(message.styles, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                    if (message.transform != null && Object.hasOwn(message, "transform"))
                        $root.com.opensource.svga.Transform.encode(message.transform, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ShapeEntity message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof com.opensource.svga.ShapeEntity
                 * @static
                 * @param {com.opensource.svga.IShapeEntity} message ShapeEntity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ShapeEntity.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

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
                ShapeEntity.decode = function decode(reader, length) {
                    if (!(reader instanceof Reader))
                        reader = Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.ShapeEntity();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.type = reader.int32();
                                break;
                            }
                        case 2: {
                                message.shape = $root.com.opensource.svga.ShapeEntity.ShapeArgs.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.rect = $root.com.opensource.svga.ShapeEntity.RectArgs.decode(reader, reader.uint32());
                                break;
                            }
                        case 4: {
                                message.ellipse = $root.com.opensource.svga.ShapeEntity.EllipseArgs.decode(reader, reader.uint32());
                                break;
                            }
                        case 10: {
                                message.styles = $root.com.opensource.svga.ShapeEntity.ShapeStyle.decode(reader, reader.uint32());
                                break;
                            }
                        case 11: {
                                message.transform = $root.com.opensource.svga.Transform.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

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
                ShapeEntity.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof Reader))
                        reader = new Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ShapeEntity message.
                 * @function verify
                 * @memberof com.opensource.svga.ShapeEntity
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ShapeEntity.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.type != null && message.hasOwnProperty("type"))
                        switch (message.type) {
                        default:
                            return "type: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                            break;
                        }
                    if (message.shape != null && message.hasOwnProperty("shape")) {
                        properties.args = 1;
                        {
                            let error = $root.com.opensource.svga.ShapeEntity.ShapeArgs.verify(message.shape);
                            if (error)
                                return "shape." + error;
                        }
                    }
                    if (message.rect != null && message.hasOwnProperty("rect")) {
                        if (properties.args === 1)
                            return "args: multiple values";
                        properties.args = 1;
                        {
                            let error = $root.com.opensource.svga.ShapeEntity.RectArgs.verify(message.rect);
                            if (error)
                                return "rect." + error;
                        }
                    }
                    if (message.ellipse != null && message.hasOwnProperty("ellipse")) {
                        if (properties.args === 1)
                            return "args: multiple values";
                        properties.args = 1;
                        {
                            let error = $root.com.opensource.svga.ShapeEntity.EllipseArgs.verify(message.ellipse);
                            if (error)
                                return "ellipse." + error;
                        }
                    }
                    if (message.styles != null && message.hasOwnProperty("styles")) {
                        let error = $root.com.opensource.svga.ShapeEntity.ShapeStyle.verify(message.styles);
                        if (error)
                            return "styles." + error;
                    }
                    if (message.transform != null && message.hasOwnProperty("transform")) {
                        let error = $root.com.opensource.svga.Transform.verify(message.transform);
                        if (error)
                            return "transform." + error;
                    }
                    return null;
                };

                /**
                 * Creates a ShapeEntity message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof com.opensource.svga.ShapeEntity
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
                 */
                ShapeEntity.fromObject = function fromObject(object) {
                    if (object instanceof $root.com.opensource.svga.ShapeEntity)
                        return object;
                    let message = new $root.com.opensource.svga.ShapeEntity();
                    switch (object.type) {
                    default:
                        if (typeof object.type === "number") {
                            message.type = object.type;
                            break;
                        }
                        break;
                    case "SHAPE":
                    case 0:
                        message.type = 0;
                        break;
                    case "RECT":
                    case 1:
                        message.type = 1;
                        break;
                    case "ELLIPSE":
                    case 2:
                        message.type = 2;
                        break;
                    case "KEEP":
                    case 3:
                        message.type = 3;
                        break;
                    }
                    if (object.shape != null) {
                        if (typeof object.shape !== "object")
                            throw TypeError(".com.opensource.svga.ShapeEntity.shape: object expected");
                        message.shape = $root.com.opensource.svga.ShapeEntity.ShapeArgs.fromObject(object.shape);
                    }
                    if (object.rect != null) {
                        if (typeof object.rect !== "object")
                            throw TypeError(".com.opensource.svga.ShapeEntity.rect: object expected");
                        message.rect = $root.com.opensource.svga.ShapeEntity.RectArgs.fromObject(object.rect);
                    }
                    if (object.ellipse != null) {
                        if (typeof object.ellipse !== "object")
                            throw TypeError(".com.opensource.svga.ShapeEntity.ellipse: object expected");
                        message.ellipse = $root.com.opensource.svga.ShapeEntity.EllipseArgs.fromObject(object.ellipse);
                    }
                    if (object.styles != null) {
                        if (typeof object.styles !== "object")
                            throw TypeError(".com.opensource.svga.ShapeEntity.styles: object expected");
                        message.styles = $root.com.opensource.svga.ShapeEntity.ShapeStyle.fromObject(object.styles);
                    }
                    if (object.transform != null) {
                        if (typeof object.transform !== "object")
                            throw TypeError(".com.opensource.svga.ShapeEntity.transform: object expected");
                        message.transform = $root.com.opensource.svga.Transform.fromObject(object.transform);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ShapeEntity message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof com.opensource.svga.ShapeEntity
                 * @static
                 * @param {com.opensource.svga.ShapeEntity} message ShapeEntity
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ShapeEntity.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.type = options.enums === String ? "SHAPE" : 0;
                        object.styles = null;
                        object.transform = null;
                    }
                    if (message.type != null && message.hasOwnProperty("type"))
                        object.type = options.enums === String ? $root.com.opensource.svga.ShapeEntity.ShapeType[message.type] === undefined ? message.type : $root.com.opensource.svga.ShapeEntity.ShapeType[message.type] : message.type;
                    if (message.shape != null && message.hasOwnProperty("shape")) {
                        object.shape = $root.com.opensource.svga.ShapeEntity.ShapeArgs.toObject(message.shape, options);
                        if (options.oneofs)
                            object.args = "shape";
                    }
                    if (message.rect != null && message.hasOwnProperty("rect")) {
                        object.rect = $root.com.opensource.svga.ShapeEntity.RectArgs.toObject(message.rect, options);
                        if (options.oneofs)
                            object.args = "rect";
                    }
                    if (message.ellipse != null && message.hasOwnProperty("ellipse")) {
                        object.ellipse = $root.com.opensource.svga.ShapeEntity.EllipseArgs.toObject(message.ellipse, options);
                        if (options.oneofs)
                            object.args = "ellipse";
                    }
                    if (message.styles != null && message.hasOwnProperty("styles"))
                        object.styles = $root.com.opensource.svga.ShapeEntity.ShapeStyle.toObject(message.styles, options);
                    if (message.transform != null && message.hasOwnProperty("transform"))
                        object.transform = $root.com.opensource.svga.Transform.toObject(message.transform, options);
                    return object;
                };

                /**
                 * Converts this ShapeEntity to JSON.
                 * @function toJSON
                 * @memberof com.opensource.svga.ShapeEntity
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ShapeEntity.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ShapeEntity
                 * @function getTypeUrl
                 * @memberof com.opensource.svga.ShapeEntity
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ShapeEntity.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/com.opensource.svga.ShapeEntity";
                };

                /**
                 * ShapeType enum.
                 * @name com.opensource.svga.ShapeEntity.ShapeType
                 * @enum {number}
                 * @property {number} SHAPE=0 SHAPE value
                 * @property {number} RECT=1 RECT value
                 * @property {number} ELLIPSE=2 ELLIPSE value
                 * @property {number} KEEP=3 KEEP value
                 */
                ShapeEntity.ShapeType = (function() {
                    const valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "SHAPE"] = 0;
                    values[valuesById[1] = "RECT"] = 1;
                    values[valuesById[2] = "ELLIPSE"] = 2;
                    values[valuesById[3] = "KEEP"] = 3;
                    return values;
                })();

                ShapeEntity.ShapeArgs = (function() {

                    /**
                     * Properties of a ShapeArgs.
                     * @memberof com.opensource.svga.ShapeEntity
                     * @interface IShapeArgs
                     * @property {string|null} [d] ShapeArgs d
                     */

                    /**
                     * Constructs a new ShapeArgs.
                     * @memberof com.opensource.svga.ShapeEntity
                     * @classdesc Represents a ShapeArgs.
                     * @implements IShapeArgs
                     * @constructor
                     * @param {com.opensource.svga.ShapeEntity.IShapeArgs=} [properties] Properties to set
                     */
                    function ShapeArgs(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * ShapeArgs d.
                     * @member {string} d
                     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
                     * @instance
                     */
                    ShapeArgs.prototype.d = "";

                    /**
                     * Creates a new ShapeArgs instance using the specified properties.
                     * @function create
                     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IShapeArgs=} [properties] Properties to set
                     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs instance
                     */
                    ShapeArgs.create = function create(properties) {
                        return new ShapeArgs(properties);
                    };

                    /**
                     * Encodes the specified ShapeArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeArgs.verify|verify} messages.
                     * @function encode
                     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IShapeArgs} message ShapeArgs message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ShapeArgs.encode = function encode(message, writer) {
                        if (!writer)
                            writer = Writer.create();
                        if (message.d != null && Object.hasOwn(message, "d"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.d);
                        return writer;
                    };

                    /**
                     * Encodes the specified ShapeArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeArgs.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IShapeArgs} message ShapeArgs message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ShapeArgs.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

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
                    ShapeArgs.decode = function decode(reader, length) {
                        if (!(reader instanceof Reader))
                            reader = Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.ShapeEntity.ShapeArgs();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
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
                    };

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
                    ShapeArgs.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof Reader))
                            reader = new Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ShapeArgs message.
                     * @function verify
                     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ShapeArgs.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.d != null && message.hasOwnProperty("d"))
                            if (!isString(message.d))
                                return "d: string expected";
                        return null;
                    };

                    /**
                     * Creates a ShapeArgs message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
                     */
                    ShapeArgs.fromObject = function fromObject(object) {
                        if (object instanceof $root.com.opensource.svga.ShapeEntity.ShapeArgs)
                            return object;
                        let message = new $root.com.opensource.svga.ShapeEntity.ShapeArgs();
                        if (object.d != null)
                            message.d = String(object.d);
                        return message;
                    };

                    /**
                     * Creates a plain object from a ShapeArgs message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.ShapeArgs} message ShapeArgs
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ShapeArgs.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults)
                            object.d = "";
                        if (message.d != null && message.hasOwnProperty("d"))
                            object.d = message.d;
                        return object;
                    };

                    /**
                     * Converts this ShapeArgs to JSON.
                     * @function toJSON
                     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ShapeArgs.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for ShapeArgs
                     * @function getTypeUrl
                     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    ShapeArgs.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeArgs";
                    };

                    return ShapeArgs;
                })();

                ShapeEntity.RectArgs = (function() {

                    /**
                     * Properties of a RectArgs.
                     * @memberof com.opensource.svga.ShapeEntity
                     * @interface IRectArgs
                     * @property {number|null} [x] RectArgs x
                     * @property {number|null} [y] RectArgs y
                     * @property {number|null} [width] RectArgs width
                     * @property {number|null} [height] RectArgs height
                     * @property {number|null} [cornerRadius] RectArgs cornerRadius
                     */

                    /**
                     * Constructs a new RectArgs.
                     * @memberof com.opensource.svga.ShapeEntity
                     * @classdesc Represents a RectArgs.
                     * @implements IRectArgs
                     * @constructor
                     * @param {com.opensource.svga.ShapeEntity.IRectArgs=} [properties] Properties to set
                     */
                    function RectArgs(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * RectArgs x.
                     * @member {number} x
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @instance
                     */
                    RectArgs.prototype.x = 0;

                    /**
                     * RectArgs y.
                     * @member {number} y
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @instance
                     */
                    RectArgs.prototype.y = 0;

                    /**
                     * RectArgs width.
                     * @member {number} width
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @instance
                     */
                    RectArgs.prototype.width = 0;

                    /**
                     * RectArgs height.
                     * @member {number} height
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @instance
                     */
                    RectArgs.prototype.height = 0;

                    /**
                     * RectArgs cornerRadius.
                     * @member {number} cornerRadius
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @instance
                     */
                    RectArgs.prototype.cornerRadius = 0;

                    /**
                     * Creates a new RectArgs instance using the specified properties.
                     * @function create
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IRectArgs=} [properties] Properties to set
                     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs instance
                     */
                    RectArgs.create = function create(properties) {
                        return new RectArgs(properties);
                    };

                    /**
                     * Encodes the specified RectArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.RectArgs.verify|verify} messages.
                     * @function encode
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IRectArgs} message RectArgs message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RectArgs.encode = function encode(message, writer) {
                        if (!writer)
                            writer = Writer.create();
                        if (message.x != null && Object.hasOwn(message, "x"))
                            writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
                        if (message.y != null && Object.hasOwn(message, "y"))
                            writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
                        if (message.width != null && Object.hasOwn(message, "width"))
                            writer.uint32(/* id 3, wireType 5 =*/29).float(message.width);
                        if (message.height != null && Object.hasOwn(message, "height"))
                            writer.uint32(/* id 4, wireType 5 =*/37).float(message.height);
                        if (message.cornerRadius != null && Object.hasOwn(message, "cornerRadius"))
                            writer.uint32(/* id 5, wireType 5 =*/45).float(message.cornerRadius);
                        return writer;
                    };

                    /**
                     * Encodes the specified RectArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.RectArgs.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IRectArgs} message RectArgs message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    RectArgs.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

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
                    RectArgs.decode = function decode(reader, length) {
                        if (!(reader instanceof Reader))
                            reader = Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.ShapeEntity.RectArgs();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
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
                    };

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
                    RectArgs.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof Reader))
                            reader = new Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a RectArgs message.
                     * @function verify
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    RectArgs.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.x != null && message.hasOwnProperty("x"))
                            if (typeof message.x !== "number")
                                return "x: number expected";
                        if (message.y != null && message.hasOwnProperty("y"))
                            if (typeof message.y !== "number")
                                return "y: number expected";
                        if (message.width != null && message.hasOwnProperty("width"))
                            if (typeof message.width !== "number")
                                return "width: number expected";
                        if (message.height != null && message.hasOwnProperty("height"))
                            if (typeof message.height !== "number")
                                return "height: number expected";
                        if (message.cornerRadius != null && message.hasOwnProperty("cornerRadius"))
                            if (typeof message.cornerRadius !== "number")
                                return "cornerRadius: number expected";
                        return null;
                    };

                    /**
                     * Creates a RectArgs message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
                     */
                    RectArgs.fromObject = function fromObject(object) {
                        if (object instanceof $root.com.opensource.svga.ShapeEntity.RectArgs)
                            return object;
                        let message = new $root.com.opensource.svga.ShapeEntity.RectArgs();
                        if (object.x != null)
                            message.x = Number(object.x);
                        if (object.y != null)
                            message.y = Number(object.y);
                        if (object.width != null)
                            message.width = Number(object.width);
                        if (object.height != null)
                            message.height = Number(object.height);
                        if (object.cornerRadius != null)
                            message.cornerRadius = Number(object.cornerRadius);
                        return message;
                    };

                    /**
                     * Creates a plain object from a RectArgs message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.RectArgs} message RectArgs
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    RectArgs.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.x = 0;
                            object.y = 0;
                            object.width = 0;
                            object.height = 0;
                            object.cornerRadius = 0;
                        }
                        if (message.x != null && message.hasOwnProperty("x"))
                            object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
                        if (message.y != null && message.hasOwnProperty("y"))
                            object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
                        if (message.width != null && message.hasOwnProperty("width"))
                            object.width = options.json && !isFinite(message.width) ? String(message.width) : message.width;
                        if (message.height != null && message.hasOwnProperty("height"))
                            object.height = options.json && !isFinite(message.height) ? String(message.height) : message.height;
                        if (message.cornerRadius != null && message.hasOwnProperty("cornerRadius"))
                            object.cornerRadius = options.json && !isFinite(message.cornerRadius) ? String(message.cornerRadius) : message.cornerRadius;
                        return object;
                    };

                    /**
                     * Converts this RectArgs to JSON.
                     * @function toJSON
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    RectArgs.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for RectArgs
                     * @function getTypeUrl
                     * @memberof com.opensource.svga.ShapeEntity.RectArgs
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    RectArgs.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.RectArgs";
                    };

                    return RectArgs;
                })();

                ShapeEntity.EllipseArgs = (function() {

                    /**
                     * Properties of an EllipseArgs.
                     * @memberof com.opensource.svga.ShapeEntity
                     * @interface IEllipseArgs
                     * @property {number|null} [x] EllipseArgs x
                     * @property {number|null} [y] EllipseArgs y
                     * @property {number|null} [radiusX] EllipseArgs radiusX
                     * @property {number|null} [radiusY] EllipseArgs radiusY
                     */

                    /**
                     * Constructs a new EllipseArgs.
                     * @memberof com.opensource.svga.ShapeEntity
                     * @classdesc Represents an EllipseArgs.
                     * @implements IEllipseArgs
                     * @constructor
                     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
                     */
                    function EllipseArgs(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * EllipseArgs x.
                     * @member {number} x
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @instance
                     */
                    EllipseArgs.prototype.x = 0;

                    /**
                     * EllipseArgs y.
                     * @member {number} y
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @instance
                     */
                    EllipseArgs.prototype.y = 0;

                    /**
                     * EllipseArgs radiusX.
                     * @member {number} radiusX
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @instance
                     */
                    EllipseArgs.prototype.radiusX = 0;

                    /**
                     * EllipseArgs radiusY.
                     * @member {number} radiusY
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @instance
                     */
                    EllipseArgs.prototype.radiusY = 0;

                    /**
                     * Creates a new EllipseArgs instance using the specified properties.
                     * @function create
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs=} [properties] Properties to set
                     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs instance
                     */
                    EllipseArgs.create = function create(properties) {
                        return new EllipseArgs(properties);
                    };

                    /**
                     * Encodes the specified EllipseArgs message. Does not implicitly {@link com.opensource.svga.ShapeEntity.EllipseArgs.verify|verify} messages.
                     * @function encode
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs} message EllipseArgs message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    EllipseArgs.encode = function encode(message, writer) {
                        if (!writer)
                            writer = Writer.create();
                        if (message.x != null && Object.hasOwn(message, "x"))
                            writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
                        if (message.y != null && Object.hasOwn(message, "y"))
                            writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
                        if (message.radiusX != null && Object.hasOwn(message, "radiusX"))
                            writer.uint32(/* id 3, wireType 5 =*/29).float(message.radiusX);
                        if (message.radiusY != null && Object.hasOwn(message, "radiusY"))
                            writer.uint32(/* id 4, wireType 5 =*/37).float(message.radiusY);
                        return writer;
                    };

                    /**
                     * Encodes the specified EllipseArgs message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.EllipseArgs.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IEllipseArgs} message EllipseArgs message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    EllipseArgs.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

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
                    EllipseArgs.decode = function decode(reader, length) {
                        if (!(reader instanceof Reader))
                            reader = Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.ShapeEntity.EllipseArgs();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
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
                    };

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
                    EllipseArgs.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof Reader))
                            reader = new Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an EllipseArgs message.
                     * @function verify
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    EllipseArgs.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.x != null && message.hasOwnProperty("x"))
                            if (typeof message.x !== "number")
                                return "x: number expected";
                        if (message.y != null && message.hasOwnProperty("y"))
                            if (typeof message.y !== "number")
                                return "y: number expected";
                        if (message.radiusX != null && message.hasOwnProperty("radiusX"))
                            if (typeof message.radiusX !== "number")
                                return "radiusX: number expected";
                        if (message.radiusY != null && message.hasOwnProperty("radiusY"))
                            if (typeof message.radiusY !== "number")
                                return "radiusY: number expected";
                        return null;
                    };

                    /**
                     * Creates an EllipseArgs message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
                     */
                    EllipseArgs.fromObject = function fromObject(object) {
                        if (object instanceof $root.com.opensource.svga.ShapeEntity.EllipseArgs)
                            return object;
                        let message = new $root.com.opensource.svga.ShapeEntity.EllipseArgs();
                        if (object.x != null)
                            message.x = Number(object.x);
                        if (object.y != null)
                            message.y = Number(object.y);
                        if (object.radiusX != null)
                            message.radiusX = Number(object.radiusX);
                        if (object.radiusY != null)
                            message.radiusY = Number(object.radiusY);
                        return message;
                    };

                    /**
                     * Creates a plain object from an EllipseArgs message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.EllipseArgs} message EllipseArgs
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    EllipseArgs.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            object.x = 0;
                            object.y = 0;
                            object.radiusX = 0;
                            object.radiusY = 0;
                        }
                        if (message.x != null && message.hasOwnProperty("x"))
                            object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
                        if (message.y != null && message.hasOwnProperty("y"))
                            object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
                        if (message.radiusX != null && message.hasOwnProperty("radiusX"))
                            object.radiusX = options.json && !isFinite(message.radiusX) ? String(message.radiusX) : message.radiusX;
                        if (message.radiusY != null && message.hasOwnProperty("radiusY"))
                            object.radiusY = options.json && !isFinite(message.radiusY) ? String(message.radiusY) : message.radiusY;
                        return object;
                    };

                    /**
                     * Converts this EllipseArgs to JSON.
                     * @function toJSON
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    EllipseArgs.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for EllipseArgs
                     * @function getTypeUrl
                     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    EllipseArgs.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.EllipseArgs";
                    };

                    return EllipseArgs;
                })();

                ShapeEntity.ShapeStyle = (function() {

                    /**
                     * Properties of a ShapeStyle.
                     * @memberof com.opensource.svga.ShapeEntity
                     * @interface IShapeStyle
                     * @property {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null} [fill] ShapeStyle fill
                     * @property {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null} [stroke] ShapeStyle stroke
                     * @property {number|null} [strokeWidth] ShapeStyle strokeWidth
                     * @property {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap|null} [lineCap] ShapeStyle lineCap
                     * @property {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin|null} [lineJoin] ShapeStyle lineJoin
                     * @property {number|null} [miterLimit] ShapeStyle miterLimit
                     * @property {number|null} [lineDashI] ShapeStyle lineDashI
                     * @property {number|null} [lineDashII] ShapeStyle lineDashII
                     * @property {number|null} [lineDashIII] ShapeStyle lineDashIII
                     */

                    /**
                     * Constructs a new ShapeStyle.
                     * @memberof com.opensource.svga.ShapeEntity
                     * @classdesc Represents a ShapeStyle.
                     * @implements IShapeStyle
                     * @constructor
                     * @param {com.opensource.svga.ShapeEntity.IShapeStyle=} [properties] Properties to set
                     */
                    function ShapeStyle(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * ShapeStyle fill.
                     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @instance
                     */
                    ShapeStyle.prototype.fill = null;

                    /**
                     * ShapeStyle stroke.
                     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @instance
                     */
                    ShapeStyle.prototype.stroke = null;

                    /**
                     * ShapeStyle strokeWidth.
                     * @member {number} strokeWidth
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @instance
                     */
                    ShapeStyle.prototype.strokeWidth = 0;

                    /**
                     * ShapeStyle lineCap.
                     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap} lineCap
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @instance
                     */
                    ShapeStyle.prototype.lineCap = 0;

                    /**
                     * ShapeStyle lineJoin.
                     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @instance
                     */
                    ShapeStyle.prototype.lineJoin = 0;

                    /**
                     * ShapeStyle miterLimit.
                     * @member {number} miterLimit
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @instance
                     */
                    ShapeStyle.prototype.miterLimit = 0;

                    /**
                     * ShapeStyle lineDashI.
                     * @member {number} lineDashI
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @instance
                     */
                    ShapeStyle.prototype.lineDashI = 0;

                    /**
                     * ShapeStyle lineDashII.
                     * @member {number} lineDashII
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @instance
                     */
                    ShapeStyle.prototype.lineDashII = 0;

                    /**
                     * ShapeStyle lineDashIII.
                     * @member {number} lineDashIII
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @instance
                     */
                    ShapeStyle.prototype.lineDashIII = 0;

                    /**
                     * Creates a new ShapeStyle instance using the specified properties.
                     * @function create
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IShapeStyle=} [properties] Properties to set
                     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle instance
                     */
                    ShapeStyle.create = function create(properties) {
                        return new ShapeStyle(properties);
                    };

                    /**
                     * Encodes the specified ShapeStyle message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.verify|verify} messages.
                     * @function encode
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IShapeStyle} message ShapeStyle message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ShapeStyle.encode = function encode(message, writer) {
                        if (!writer)
                            writer = Writer.create();
                        if (message.fill != null && Object.hasOwn(message, "fill"))
                            $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.encode(message.fill, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        if (message.stroke != null && Object.hasOwn(message, "stroke"))
                            $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.encode(message.stroke, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        if (message.strokeWidth != null && Object.hasOwn(message, "strokeWidth"))
                            writer.uint32(/* id 3, wireType 5 =*/29).float(message.strokeWidth);
                        if (message.lineCap != null && Object.hasOwn(message, "lineCap"))
                            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.lineCap);
                        if (message.lineJoin != null && Object.hasOwn(message, "lineJoin"))
                            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.lineJoin);
                        if (message.miterLimit != null && Object.hasOwn(message, "miterLimit"))
                            writer.uint32(/* id 6, wireType 5 =*/53).float(message.miterLimit);
                        if (message.lineDashI != null && Object.hasOwn(message, "lineDashI"))
                            writer.uint32(/* id 7, wireType 5 =*/61).float(message.lineDashI);
                        if (message.lineDashII != null && Object.hasOwn(message, "lineDashII"))
                            writer.uint32(/* id 8, wireType 5 =*/69).float(message.lineDashII);
                        if (message.lineDashIII != null && Object.hasOwn(message, "lineDashIII"))
                            writer.uint32(/* id 9, wireType 5 =*/77).float(message.lineDashIII);
                        return writer;
                    };

                    /**
                     * Encodes the specified ShapeStyle message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.IShapeStyle} message ShapeStyle message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    ShapeStyle.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

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
                    ShapeStyle.decode = function decode(reader, length) {
                        if (!(reader instanceof Reader))
                            reader = Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.ShapeEntity.ShapeStyle();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.fill = $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.decode(reader, reader.uint32());
                                    break;
                                }
                            case 2: {
                                    message.stroke = $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.decode(reader, reader.uint32());
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
                    };

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
                    ShapeStyle.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof Reader))
                            reader = new Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a ShapeStyle message.
                     * @function verify
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    ShapeStyle.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.fill != null && message.hasOwnProperty("fill")) {
                            let error = $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify(message.fill);
                            if (error)
                                return "fill." + error;
                        }
                        if (message.stroke != null && message.hasOwnProperty("stroke")) {
                            let error = $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify(message.stroke);
                            if (error)
                                return "stroke." + error;
                        }
                        if (message.strokeWidth != null && message.hasOwnProperty("strokeWidth"))
                            if (typeof message.strokeWidth !== "number")
                                return "strokeWidth: number expected";
                        if (message.lineCap != null && message.hasOwnProperty("lineCap"))
                            switch (message.lineCap) {
                            default:
                                return "lineCap: enum value expected";
                            case 0:
                            case 1:
                            case 2:
                                break;
                            }
                        if (message.lineJoin != null && message.hasOwnProperty("lineJoin"))
                            switch (message.lineJoin) {
                            default:
                                return "lineJoin: enum value expected";
                            case 0:
                            case 1:
                            case 2:
                                break;
                            }
                        if (message.miterLimit != null && message.hasOwnProperty("miterLimit"))
                            if (typeof message.miterLimit !== "number")
                                return "miterLimit: number expected";
                        if (message.lineDashI != null && message.hasOwnProperty("lineDashI"))
                            if (typeof message.lineDashI !== "number")
                                return "lineDashI: number expected";
                        if (message.lineDashII != null && message.hasOwnProperty("lineDashII"))
                            if (typeof message.lineDashII !== "number")
                                return "lineDashII: number expected";
                        if (message.lineDashIII != null && message.hasOwnProperty("lineDashIII"))
                            if (typeof message.lineDashIII !== "number")
                                return "lineDashIII: number expected";
                        return null;
                    };

                    /**
                     * Creates a ShapeStyle message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
                     */
                    ShapeStyle.fromObject = function fromObject(object) {
                        if (object instanceof $root.com.opensource.svga.ShapeEntity.ShapeStyle)
                            return object;
                        let message = new $root.com.opensource.svga.ShapeEntity.ShapeStyle();
                        if (object.fill != null) {
                            if (typeof object.fill !== "object")
                                throw TypeError(".com.opensource.svga.ShapeEntity.ShapeStyle.fill: object expected");
                            message.fill = $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.fromObject(object.fill);
                        }
                        if (object.stroke != null) {
                            if (typeof object.stroke !== "object")
                                throw TypeError(".com.opensource.svga.ShapeEntity.ShapeStyle.stroke: object expected");
                            message.stroke = $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.fromObject(object.stroke);
                        }
                        if (object.strokeWidth != null)
                            message.strokeWidth = Number(object.strokeWidth);
                        switch (object.lineCap) {
                        default:
                            if (typeof object.lineCap === "number") {
                                message.lineCap = object.lineCap;
                                break;
                            }
                            break;
                        case "LineCap_BUTT":
                        case 0:
                            message.lineCap = 0;
                            break;
                        case "LineCap_ROUND":
                        case 1:
                            message.lineCap = 1;
                            break;
                        case "LineCap_SQUARE":
                        case 2:
                            message.lineCap = 2;
                            break;
                        }
                        switch (object.lineJoin) {
                        default:
                            if (typeof object.lineJoin === "number") {
                                message.lineJoin = object.lineJoin;
                                break;
                            }
                            break;
                        case "LineJoin_MITER":
                        case 0:
                            message.lineJoin = 0;
                            break;
                        case "LineJoin_ROUND":
                        case 1:
                            message.lineJoin = 1;
                            break;
                        case "LineJoin_BEVEL":
                        case 2:
                            message.lineJoin = 2;
                            break;
                        }
                        if (object.miterLimit != null)
                            message.miterLimit = Number(object.miterLimit);
                        if (object.lineDashI != null)
                            message.lineDashI = Number(object.lineDashI);
                        if (object.lineDashII != null)
                            message.lineDashII = Number(object.lineDashII);
                        if (object.lineDashIII != null)
                            message.lineDashIII = Number(object.lineDashIII);
                        return message;
                    };

                    /**
                     * Creates a plain object from a ShapeStyle message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @static
                     * @param {com.opensource.svga.ShapeEntity.ShapeStyle} message ShapeStyle
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    ShapeStyle.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
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
                        if (message.fill != null && message.hasOwnProperty("fill"))
                            object.fill = $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.toObject(message.fill, options);
                        if (message.stroke != null && message.hasOwnProperty("stroke"))
                            object.stroke = $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.toObject(message.stroke, options);
                        if (message.strokeWidth != null && message.hasOwnProperty("strokeWidth"))
                            object.strokeWidth = options.json && !isFinite(message.strokeWidth) ? String(message.strokeWidth) : message.strokeWidth;
                        if (message.lineCap != null && message.hasOwnProperty("lineCap"))
                            object.lineCap = options.enums === String ? $root.com.opensource.svga.ShapeEntity.ShapeStyle.LineCap[message.lineCap] === undefined ? message.lineCap : $root.com.opensource.svga.ShapeEntity.ShapeStyle.LineCap[message.lineCap] : message.lineCap;
                        if (message.lineJoin != null && message.hasOwnProperty("lineJoin"))
                            object.lineJoin = options.enums === String ? $root.com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin[message.lineJoin] === undefined ? message.lineJoin : $root.com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin[message.lineJoin] : message.lineJoin;
                        if (message.miterLimit != null && message.hasOwnProperty("miterLimit"))
                            object.miterLimit = options.json && !isFinite(message.miterLimit) ? String(message.miterLimit) : message.miterLimit;
                        if (message.lineDashI != null && message.hasOwnProperty("lineDashI"))
                            object.lineDashI = options.json && !isFinite(message.lineDashI) ? String(message.lineDashI) : message.lineDashI;
                        if (message.lineDashII != null && message.hasOwnProperty("lineDashII"))
                            object.lineDashII = options.json && !isFinite(message.lineDashII) ? String(message.lineDashII) : message.lineDashII;
                        if (message.lineDashIII != null && message.hasOwnProperty("lineDashIII"))
                            object.lineDashIII = options.json && !isFinite(message.lineDashIII) ? String(message.lineDashIII) : message.lineDashIII;
                        return object;
                    };

                    /**
                     * Converts this ShapeStyle to JSON.
                     * @function toJSON
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    ShapeStyle.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for ShapeStyle
                     * @function getTypeUrl
                     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    ShapeStyle.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeStyle";
                    };

                    ShapeStyle.RGBAColor = (function() {

                        /**
                         * Properties of a RGBAColor.
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                         * @interface IRGBAColor
                         * @property {number|null} [r] RGBAColor r
                         * @property {number|null} [g] RGBAColor g
                         * @property {number|null} [b] RGBAColor b
                         * @property {number|null} [a] RGBAColor a
                         */

                        /**
                         * Constructs a new RGBAColor.
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
                         * @classdesc Represents a RGBAColor.
                         * @implements IRGBAColor
                         * @constructor
                         * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
                         */
                        function RGBAColor(properties) {
                            if (properties)
                                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null)
                                        this[keys[i]] = properties[keys[i]];
                        }

                        /**
                         * RGBAColor r.
                         * @member {number} r
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @instance
                         */
                        RGBAColor.prototype.r = 0;

                        /**
                         * RGBAColor g.
                         * @member {number} g
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @instance
                         */
                        RGBAColor.prototype.g = 0;

                        /**
                         * RGBAColor b.
                         * @member {number} b
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @instance
                         */
                        RGBAColor.prototype.b = 0;

                        /**
                         * RGBAColor a.
                         * @member {number} a
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @instance
                         */
                        RGBAColor.prototype.a = 0;

                        /**
                         * Creates a new RGBAColor instance using the specified properties.
                         * @function create
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @static
                         * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor=} [properties] Properties to set
                         * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor instance
                         */
                        RGBAColor.create = function create(properties) {
                            return new RGBAColor(properties);
                        };

                        /**
                         * Encodes the specified RGBAColor message. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify|verify} messages.
                         * @function encode
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @static
                         * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor} message RGBAColor message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        RGBAColor.encode = function encode(message, writer) {
                            if (!writer)
                                writer = Writer.create();
                            if (message.r != null && Object.hasOwn(message, "r"))
                                writer.uint32(/* id 1, wireType 5 =*/13).float(message.r);
                            if (message.g != null && Object.hasOwn(message, "g"))
                                writer.uint32(/* id 2, wireType 5 =*/21).float(message.g);
                            if (message.b != null && Object.hasOwn(message, "b"))
                                writer.uint32(/* id 3, wireType 5 =*/29).float(message.b);
                            if (message.a != null && Object.hasOwn(message, "a"))
                                writer.uint32(/* id 4, wireType 5 =*/37).float(message.a);
                            return writer;
                        };

                        /**
                         * Encodes the specified RGBAColor message, length delimited. Does not implicitly {@link com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @static
                         * @param {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor} message RGBAColor message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        RGBAColor.encodeDelimited = function encodeDelimited(message, writer) {
                            return this.encode(message, writer).ldelim();
                        };

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
                        RGBAColor.decode = function decode(reader, length) {
                            if (!(reader instanceof Reader))
                                reader = Reader.create(reader);
                            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor();
                            while (reader.pos < end) {
                                let tag = reader.uint32();
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
                        };

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
                        RGBAColor.decodeDelimited = function decodeDelimited(reader) {
                            if (!(reader instanceof Reader))
                                reader = new Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies a RGBAColor message.
                         * @function verify
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        RGBAColor.verify = function verify(message) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            if (message.r != null && message.hasOwnProperty("r"))
                                if (typeof message.r !== "number")
                                    return "r: number expected";
                            if (message.g != null && message.hasOwnProperty("g"))
                                if (typeof message.g !== "number")
                                    return "g: number expected";
                            if (message.b != null && message.hasOwnProperty("b"))
                                if (typeof message.b !== "number")
                                    return "b: number expected";
                            if (message.a != null && message.hasOwnProperty("a"))
                                if (typeof message.a !== "number")
                                    return "a: number expected";
                            return null;
                        };

                        /**
                         * Creates a RGBAColor message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
                         */
                        RGBAColor.fromObject = function fromObject(object) {
                            if (object instanceof $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor)
                                return object;
                            let message = new $root.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor();
                            if (object.r != null)
                                message.r = Number(object.r);
                            if (object.g != null)
                                message.g = Number(object.g);
                            if (object.b != null)
                                message.b = Number(object.b);
                            if (object.a != null)
                                message.a = Number(object.a);
                            return message;
                        };

                        /**
                         * Creates a plain object from a RGBAColor message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @static
                         * @param {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} message RGBAColor
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        RGBAColor.toObject = function toObject(message, options) {
                            if (!options)
                                options = {};
                            let object = {};
                            if (options.defaults) {
                                object.r = 0;
                                object.g = 0;
                                object.b = 0;
                                object.a = 0;
                            }
                            if (message.r != null && message.hasOwnProperty("r"))
                                object.r = options.json && !isFinite(message.r) ? String(message.r) : message.r;
                            if (message.g != null && message.hasOwnProperty("g"))
                                object.g = options.json && !isFinite(message.g) ? String(message.g) : message.g;
                            if (message.b != null && message.hasOwnProperty("b"))
                                object.b = options.json && !isFinite(message.b) ? String(message.b) : message.b;
                            if (message.a != null && message.hasOwnProperty("a"))
                                object.a = options.json && !isFinite(message.a) ? String(message.a) : message.a;
                            return object;
                        };

                        /**
                         * Converts this RGBAColor to JSON.
                         * @function toJSON
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        RGBAColor.prototype.toJSON = function toJSON() {
                            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        /**
                         * Gets the default type url for RGBAColor
                         * @function getTypeUrl
                         * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
                         * @static
                         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns {string} The default type url
                         */
                        RGBAColor.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                            if (typeUrlPrefix === undefined) {
                                typeUrlPrefix = "type.googleapis.com";
                            }
                            return typeUrlPrefix + "/com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor";
                        };

                        return RGBAColor;
                    })();

                    /**
                     * LineCap enum.
                     * @name com.opensource.svga.ShapeEntity.ShapeStyle.LineCap
                     * @enum {number}
                     * @property {number} LineCap_BUTT=0 LineCap_BUTT value
                     * @property {number} LineCap_ROUND=1 LineCap_ROUND value
                     * @property {number} LineCap_SQUARE=2 LineCap_SQUARE value
                     */
                    ShapeStyle.LineCap = (function() {
                        const valuesById = {}, values = Object.create(valuesById);
                        values[valuesById[0] = "LineCap_BUTT"] = 0;
                        values[valuesById[1] = "LineCap_ROUND"] = 1;
                        values[valuesById[2] = "LineCap_SQUARE"] = 2;
                        return values;
                    })();

                    /**
                     * LineJoin enum.
                     * @name com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin
                     * @enum {number}
                     * @property {number} LineJoin_MITER=0 LineJoin_MITER value
                     * @property {number} LineJoin_ROUND=1 LineJoin_ROUND value
                     * @property {number} LineJoin_BEVEL=2 LineJoin_BEVEL value
                     */
                    ShapeStyle.LineJoin = (function() {
                        const valuesById = {}, values = Object.create(valuesById);
                        values[valuesById[0] = "LineJoin_MITER"] = 0;
                        values[valuesById[1] = "LineJoin_ROUND"] = 1;
                        values[valuesById[2] = "LineJoin_BEVEL"] = 2;
                        return values;
                    })();

                    return ShapeStyle;
                })();

                return ShapeEntity;
            })();

            svga.FrameEntity = (function() {

                /**
                 * Properties of a FrameEntity.
                 * @memberof com.opensource.svga
                 * @interface IFrameEntity
                 * @property {number|null} [alpha] FrameEntity alpha
                 * @property {com.opensource.svga.ILayout|null} [layout] FrameEntity layout
                 * @property {com.opensource.svga.ITransform|null} [transform] FrameEntity transform
                 * @property {string|null} [clipPath] FrameEntity clipPath
                 * @property {Array.<com.opensource.svga.IShapeEntity>|null} [shapes] FrameEntity shapes
                 */

                /**
                 * Constructs a new FrameEntity.
                 * @memberof com.opensource.svga
                 * @classdesc Represents a FrameEntity.
                 * @implements IFrameEntity
                 * @constructor
                 * @param {com.opensource.svga.IFrameEntity=} [properties] Properties to set
                 */
                function FrameEntity(properties) {
                    this.shapes = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FrameEntity alpha.
                 * @member {number} alpha
                 * @memberof com.opensource.svga.FrameEntity
                 * @instance
                 */
                FrameEntity.prototype.alpha = 0;

                /**
                 * FrameEntity layout.
                 * @member {com.opensource.svga.ILayout|null|undefined} layout
                 * @memberof com.opensource.svga.FrameEntity
                 * @instance
                 */
                FrameEntity.prototype.layout = null;

                /**
                 * FrameEntity transform.
                 * @member {com.opensource.svga.ITransform|null|undefined} transform
                 * @memberof com.opensource.svga.FrameEntity
                 * @instance
                 */
                FrameEntity.prototype.transform = null;

                /**
                 * FrameEntity clipPath.
                 * @member {string} clipPath
                 * @memberof com.opensource.svga.FrameEntity
                 * @instance
                 */
                FrameEntity.prototype.clipPath = "";

                /**
                 * FrameEntity shapes.
                 * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
                 * @memberof com.opensource.svga.FrameEntity
                 * @instance
                 */
                FrameEntity.prototype.shapes = emptyArray;

                /**
                 * Creates a new FrameEntity instance using the specified properties.
                 * @function create
                 * @memberof com.opensource.svga.FrameEntity
                 * @static
                 * @param {com.opensource.svga.IFrameEntity=} [properties] Properties to set
                 * @returns {com.opensource.svga.FrameEntity} FrameEntity instance
                 */
                FrameEntity.create = function create(properties) {
                    return new FrameEntity(properties);
                };

                /**
                 * Encodes the specified FrameEntity message. Does not implicitly {@link com.opensource.svga.FrameEntity.verify|verify} messages.
                 * @function encode
                 * @memberof com.opensource.svga.FrameEntity
                 * @static
                 * @param {com.opensource.svga.IFrameEntity} message FrameEntity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FrameEntity.encode = function encode(message, writer) {
                    if (!writer)
                        writer = Writer.create();
                    if (message.alpha != null && Object.hasOwn(message, "alpha"))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.alpha);
                    if (message.layout != null && Object.hasOwn(message, "layout"))
                        $root.com.opensource.svga.Layout.encode(message.layout, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.transform != null && Object.hasOwn(message, "transform"))
                        $root.com.opensource.svga.Transform.encode(message.transform, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.clipPath != null && Object.hasOwn(message, "clipPath"))
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.clipPath);
                    if (message.shapes != null && message.shapes.length)
                        for (let i = 0; i < message.shapes.length; ++i)
                            $root.com.opensource.svga.ShapeEntity.encode(message.shapes[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified FrameEntity message, length delimited. Does not implicitly {@link com.opensource.svga.FrameEntity.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof com.opensource.svga.FrameEntity
                 * @static
                 * @param {com.opensource.svga.IFrameEntity} message FrameEntity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FrameEntity.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

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
                FrameEntity.decode = function decode(reader, length) {
                    if (!(reader instanceof Reader))
                        reader = Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.FrameEntity();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.alpha = reader.float();
                                break;
                            }
                        case 2: {
                                message.layout = $root.com.opensource.svga.Layout.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.transform = $root.com.opensource.svga.Transform.decode(reader, reader.uint32());
                                break;
                            }
                        case 4: {
                                message.clipPath = reader.string();
                                break;
                            }
                        case 5: {
                                if (!(message.shapes && message.shapes.length))
                                    message.shapes = [];
                                message.shapes.push($root.com.opensource.svga.ShapeEntity.decode(reader, reader.uint32()));
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

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
                FrameEntity.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof Reader))
                        reader = new Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FrameEntity message.
                 * @function verify
                 * @memberof com.opensource.svga.FrameEntity
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FrameEntity.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.alpha != null && message.hasOwnProperty("alpha"))
                        if (typeof message.alpha !== "number")
                            return "alpha: number expected";
                    if (message.layout != null && message.hasOwnProperty("layout")) {
                        let error = $root.com.opensource.svga.Layout.verify(message.layout);
                        if (error)
                            return "layout." + error;
                    }
                    if (message.transform != null && message.hasOwnProperty("transform")) {
                        let error = $root.com.opensource.svga.Transform.verify(message.transform);
                        if (error)
                            return "transform." + error;
                    }
                    if (message.clipPath != null && message.hasOwnProperty("clipPath"))
                        if (!isString(message.clipPath))
                            return "clipPath: string expected";
                    if (message.shapes != null && message.hasOwnProperty("shapes")) {
                        if (!Array.isArray(message.shapes))
                            return "shapes: array expected";
                        for (let i = 0; i < message.shapes.length; ++i) {
                            let error = $root.com.opensource.svga.ShapeEntity.verify(message.shapes[i]);
                            if (error)
                                return "shapes." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a FrameEntity message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof com.opensource.svga.FrameEntity
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {com.opensource.svga.FrameEntity} FrameEntity
                 */
                FrameEntity.fromObject = function fromObject(object) {
                    if (object instanceof $root.com.opensource.svga.FrameEntity)
                        return object;
                    let message = new $root.com.opensource.svga.FrameEntity();
                    if (object.alpha != null)
                        message.alpha = Number(object.alpha);
                    if (object.layout != null) {
                        if (typeof object.layout !== "object")
                            throw TypeError(".com.opensource.svga.FrameEntity.layout: object expected");
                        message.layout = $root.com.opensource.svga.Layout.fromObject(object.layout);
                    }
                    if (object.transform != null) {
                        if (typeof object.transform !== "object")
                            throw TypeError(".com.opensource.svga.FrameEntity.transform: object expected");
                        message.transform = $root.com.opensource.svga.Transform.fromObject(object.transform);
                    }
                    if (object.clipPath != null)
                        message.clipPath = String(object.clipPath);
                    if (object.shapes) {
                        if (!Array.isArray(object.shapes))
                            throw TypeError(".com.opensource.svga.FrameEntity.shapes: array expected");
                        message.shapes = [];
                        for (let i = 0; i < object.shapes.length; ++i) {
                            if (typeof object.shapes[i] !== "object")
                                throw TypeError(".com.opensource.svga.FrameEntity.shapes: object expected");
                            message.shapes[i] = $root.com.opensource.svga.ShapeEntity.fromObject(object.shapes[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a FrameEntity message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof com.opensource.svga.FrameEntity
                 * @static
                 * @param {com.opensource.svga.FrameEntity} message FrameEntity
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FrameEntity.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.shapes = [];
                    if (options.defaults) {
                        object.alpha = 0;
                        object.layout = null;
                        object.transform = null;
                        object.clipPath = "";
                    }
                    if (message.alpha != null && message.hasOwnProperty("alpha"))
                        object.alpha = options.json && !isFinite(message.alpha) ? String(message.alpha) : message.alpha;
                    if (message.layout != null && message.hasOwnProperty("layout"))
                        object.layout = $root.com.opensource.svga.Layout.toObject(message.layout, options);
                    if (message.transform != null && message.hasOwnProperty("transform"))
                        object.transform = $root.com.opensource.svga.Transform.toObject(message.transform, options);
                    if (message.clipPath != null && message.hasOwnProperty("clipPath"))
                        object.clipPath = message.clipPath;
                    if (message.shapes && message.shapes.length) {
                        object.shapes = [];
                        for (let j = 0; j < message.shapes.length; ++j)
                            object.shapes[j] = $root.com.opensource.svga.ShapeEntity.toObject(message.shapes[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this FrameEntity to JSON.
                 * @function toJSON
                 * @memberof com.opensource.svga.FrameEntity
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FrameEntity.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FrameEntity
                 * @function getTypeUrl
                 * @memberof com.opensource.svga.FrameEntity
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FrameEntity.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/com.opensource.svga.FrameEntity";
                };

                return FrameEntity;
            })();

            svga.MovieEntity = (function() {

                /**
                 * Properties of a MovieEntity.
                 * @memberof com.opensource.svga
                 * @interface IMovieEntity
                 * @property {string|null} [version] MovieEntity version
                 * @property {com.opensource.svga.IMovieParams|null} [params] MovieEntity params
                 * @property {Object.<string,Uint8Array>|null} [images] MovieEntity images
                 * @property {Array.<com.opensource.svga.ISpriteEntity>|null} [sprites] MovieEntity sprites
                 */

                /**
                 * Constructs a new MovieEntity.
                 * @memberof com.opensource.svga
                 * @classdesc Represents a MovieEntity.
                 * @implements IMovieEntity
                 * @constructor
                 * @param {com.opensource.svga.IMovieEntity=} [properties] Properties to set
                 */
                function MovieEntity(properties) {
                    this.images = {};
                    this.sprites = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * MovieEntity version.
                 * @member {string} version
                 * @memberof com.opensource.svga.MovieEntity
                 * @instance
                 */
                MovieEntity.prototype.version = "";

                /**
                 * MovieEntity params.
                 * @member {com.opensource.svga.IMovieParams|null|undefined} params
                 * @memberof com.opensource.svga.MovieEntity
                 * @instance
                 */
                MovieEntity.prototype.params = null;

                /**
                 * MovieEntity images.
                 * @member {Object.<string,Uint8Array>} images
                 * @memberof com.opensource.svga.MovieEntity
                 * @instance
                 */
                MovieEntity.prototype.images = emptyObject;

                /**
                 * MovieEntity sprites.
                 * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
                 * @memberof com.opensource.svga.MovieEntity
                 * @instance
                 */
                MovieEntity.prototype.sprites = emptyArray;

                /**
                 * Creates a new MovieEntity instance using the specified properties.
                 * @function create
                 * @memberof com.opensource.svga.MovieEntity
                 * @static
                 * @param {com.opensource.svga.IMovieEntity=} [properties] Properties to set
                 * @returns {com.opensource.svga.MovieEntity} MovieEntity instance
                 */
                MovieEntity.create = function create(properties) {
                    return new MovieEntity(properties);
                };

                /**
                 * Encodes the specified MovieEntity message. Does not implicitly {@link com.opensource.svga.MovieEntity.verify|verify} messages.
                 * @function encode
                 * @memberof com.opensource.svga.MovieEntity
                 * @static
                 * @param {com.opensource.svga.IMovieEntity} message MovieEntity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MovieEntity.encode = function encode(message, writer) {
                    if (!writer)
                        writer = Writer.create();
                    if (message.version != null && Object.hasOwn(message, "version"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.version);
                    if (message.params != null && Object.hasOwn(message, "params"))
                        $root.com.opensource.svga.MovieParams.encode(message.params, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.images != null && Object.hasOwn(message, "images"))
                        for (let keys = Object.keys(message.images), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).bytes(message.images[keys[i]]).ldelim();
                    if (message.sprites != null && message.sprites.length)
                        for (let i = 0; i < message.sprites.length; ++i)
                            $root.com.opensource.svga.SpriteEntity.encode(message.sprites[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified MovieEntity message, length delimited. Does not implicitly {@link com.opensource.svga.MovieEntity.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof com.opensource.svga.MovieEntity
                 * @static
                 * @param {com.opensource.svga.IMovieEntity} message MovieEntity message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MovieEntity.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

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
                MovieEntity.decode = function decode(reader, length) {
                    if (!(reader instanceof Reader))
                        reader = Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.com.opensource.svga.MovieEntity(), key, value;
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1: {
                                message.version = reader.string();
                                break;
                            }
                        case 2: {
                                message.params = $root.com.opensource.svga.MovieParams.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                if (message.images === emptyObject)
                                    message.images = {};
                                let end2 = reader.uint32() + reader.pos;
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
                                if (!(message.sprites && message.sprites.length))
                                    message.sprites = [];
                                message.sprites.push($root.com.opensource.svga.SpriteEntity.decode(reader, reader.uint32()));
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

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
                MovieEntity.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof Reader))
                        reader = new Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a MovieEntity message.
                 * @function verify
                 * @memberof com.opensource.svga.MovieEntity
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                MovieEntity.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.version != null && message.hasOwnProperty("version"))
                        if (!isString(message.version))
                            return "version: string expected";
                    if (message.params != null && message.hasOwnProperty("params")) {
                        let error = $root.com.opensource.svga.MovieParams.verify(message.params);
                        if (error)
                            return "params." + error;
                    }
                    if (message.images != null && message.hasOwnProperty("images")) {
                        if (!isObject(message.images))
                            return "images: object expected";
                        let key = Object.keys(message.images);
                        for (let i = 0; i < key.length; ++i)
                            if (!(message.images[key[i]] && typeof message.images[key[i]].length === "number" || isString(message.images[key[i]])))
                                return "images: buffer{k:string} expected";
                    }
                    if (message.sprites != null && message.hasOwnProperty("sprites")) {
                        if (!Array.isArray(message.sprites))
                            return "sprites: array expected";
                        for (let i = 0; i < message.sprites.length; ++i) {
                            let error = $root.com.opensource.svga.SpriteEntity.verify(message.sprites[i]);
                            if (error)
                                return "sprites." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a MovieEntity message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof com.opensource.svga.MovieEntity
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {com.opensource.svga.MovieEntity} MovieEntity
                 */
                MovieEntity.fromObject = function fromObject(object) {
                    if (object instanceof $root.com.opensource.svga.MovieEntity)
                        return object;
                    let message = new $root.com.opensource.svga.MovieEntity();
                    if (object.version != null)
                        message.version = String(object.version);
                    if (object.params != null) {
                        if (typeof object.params !== "object")
                            throw TypeError(".com.opensource.svga.MovieEntity.params: object expected");
                        message.params = $root.com.opensource.svga.MovieParams.fromObject(object.params);
                    }
                    if (object.images) {
                        if (typeof object.images !== "object")
                            throw TypeError(".com.opensource.svga.MovieEntity.images: object expected");
                        message.images = {};
                        for (let keys = Object.keys(object.images), i = 0; i < keys.length; ++i)
                            if (typeof object.images[keys[i]] === "string")
                                base64.decode(object.images[keys[i]], message.images[keys[i]] = newBuffer(base64.length(object.images[keys[i]])), 0);
                            else if (object.images[keys[i]].length >= 0)
                                message.images[keys[i]] = object.images[keys[i]];
                    }
                    if (object.sprites) {
                        if (!Array.isArray(object.sprites))
                            throw TypeError(".com.opensource.svga.MovieEntity.sprites: array expected");
                        message.sprites = [];
                        for (let i = 0; i < object.sprites.length; ++i) {
                            if (typeof object.sprites[i] !== "object")
                                throw TypeError(".com.opensource.svga.MovieEntity.sprites: object expected");
                            message.sprites[i] = $root.com.opensource.svga.SpriteEntity.fromObject(object.sprites[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a MovieEntity message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof com.opensource.svga.MovieEntity
                 * @static
                 * @param {com.opensource.svga.MovieEntity} message MovieEntity
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MovieEntity.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.sprites = [];
                    if (options.objects || options.defaults)
                        object.images = {};
                    if (options.defaults) {
                        object.version = "";
                        object.params = null;
                    }
                    if (message.version != null && message.hasOwnProperty("version"))
                        object.version = message.version;
                    if (message.params != null && message.hasOwnProperty("params"))
                        object.params = $root.com.opensource.svga.MovieParams.toObject(message.params, options);
                    let keys2;
                    if (message.images && (keys2 = Object.keys(message.images)).length) {
                        object.images = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.images[keys2[j]] = options.bytes === String ? base64.encode(message.images[keys2[j]], 0, message.images[keys2[j]].length) : options.bytes === Array ? Array.prototype.slice.call(message.images[keys2[j]]) : message.images[keys2[j]];
                    }
                    if (message.sprites && message.sprites.length) {
                        object.sprites = [];
                        for (let j = 0; j < message.sprites.length; ++j)
                            object.sprites[j] = $root.com.opensource.svga.SpriteEntity.toObject(message.sprites[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this MovieEntity to JSON.
                 * @function toJSON
                 * @memberof com.opensource.svga.MovieEntity
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MovieEntity.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for MovieEntity
                 * @function getTypeUrl
                 * @memberof com.opensource.svga.MovieEntity
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                MovieEntity.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/com.opensource.svga.MovieEntity";
                };

                return MovieEntity;
            })();

            return svga;
        })();

        return opensource;
    })();

    return com;
})();

const MovieEntity = com.opensource.svga.MovieEntity;

const SupportedPlatform = {
    ALIPAY: 'alipay',
    WECHAT: 'wechat',
    DOUYIN: 'douyin',
    H5: 'h5',
    UNKNOWN: 'unknown'
};
const throwUnsupportedPlatform = () => new Error('Unsupported platform');
/**
 * 获取平台信息
 * @returns
 */
function getPlatform() {
    // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
    if (typeof tt !== 'undefined') {
        return SupportedPlatform.DOUYIN;
    }
    if (typeof my !== 'undefined') {
        return SupportedPlatform.ALIPAY;
    }
    if (typeof wx !== 'undefined') {
        return SupportedPlatform.WECHAT;
    }
    if (typeof window !== 'undefined') {
        return SupportedPlatform.H5;
    }
    return SupportedPlatform.UNKNOWN;
}
const platform = getPlatform();

let bridge = null;
function getBridge() {
    if (bridge) {
        return bridge;
    }
    if (platform === SupportedPlatform.WECHAT) {
        bridge = wx;
        return wx;
    }
    if (platform === SupportedPlatform.H5) {
        bridge = window;
        return window;
    }
    if (platform === SupportedPlatform.ALIPAY) {
        bridge = my;
        return my;
    }
    if (platform === SupportedPlatform.DOUYIN) {
        bridge = tt;
        return tt;
    }
    throw throwUnsupportedPlatform();
}

/**
 * 读取远程文件
 * @param url 文件资源地址
 * @returns
 */
function readRemoteFile(url) {
    // H5环境
    if (platform === SupportedPlatform.H5) {
        return fetch(url, {
            cache: 'no-cache'
        })
            .then((response) => {
            if (response.ok) {
                return response.arrayBuffer();
            }
            else {
                throw new Error(`HTTP error, status=${response.status}, statusText=${response.statusText}`);
            }
        });
    }
    // 小程序环境
    if (platform !== SupportedPlatform.UNKNOWN) {
        const bridge = getBridge();
        return new Promise((resolve, reject) => {
            bridge.request({
                url,
                responseType: 'arraybuffer',
                enableCache: true,
                success(res) {
                    resolve(res.data);
                },
                fail: reject
            });
        });
    }
    return Promise.reject(throwUnsupportedPlatform());
}
/**
 * 读取本地文件
 * @param url 文件资源地址
 * @returns
 */
function readLocalFile(url) {
    return new Promise((resolve, reject) => {
        const bridge = getBridge();
        bridge.getFileSystemManager().readFile({
            filePath: url,
            success: (res) => resolve(res.data),
            fail: reject,
        });
    });
}
/**
 * 读取文件资源
 * @param url 文件资源地址
 * @returns
 */
function download(url) {
    // 读取远程文件
    if (/^http(s):\/\//.test(url)) {
        return readRemoteFile(url);
    }
    // 读取本地文件
    if (platform !== SupportedPlatform.H5) {
        return readLocalFile(url);
    }
    return Promise.reject(throwUnsupportedPlatform());
}

class VideoEntity {
    version;
    size = { width: 0, height: 0 };
    fps = 20;
    frames = 0;
    images = {};
    replaceElements = {};
    dynamicElements = {};
    sprites = [];
    constructor(movie, images = {}) {
        this.version = movie.version;
        const { viewBoxWidth, viewBoxHeight, fps, frames } = movie.params;
        this.size.width = viewBoxWidth;
        this.size.height = viewBoxHeight;
        this.fps = fps;
        this.frames = frames;
        this.sprites = [];
        movie.sprites.forEach(mSprite => {
            const vFrames = [];
            const vSprite = {
                imageKey: mSprite.imageKey,
                frames: vFrames
            };
            let lastShapes;
            mSprite.frames.forEach(mFrame => {
                const layout = {
                    x: mFrame.layout?.x ?? 0.0,
                    y: mFrame.layout?.y ?? 0.0,
                    width: mFrame.layout?.width ?? 0.0,
                    height: mFrame.layout?.height ?? 0.0
                };
                const transform = {
                    a: mFrame.transform?.a ?? 1.0,
                    b: mFrame.transform?.b ?? 0.0,
                    c: mFrame.transform?.c ?? 0.0,
                    d: mFrame.transform?.d ?? 1.0,
                    tx: mFrame.transform?.tx ?? 0.0,
                    ty: mFrame.transform?.ty ?? 0.0
                };
                const clipPath = mFrame.clipPath ?? '';
                let shapes = [];
                mFrame.shapes.forEach(mShape => {
                    const mStyles = mShape.styles;
                    if (mStyles === null)
                        return;
                    const lineDash = [];
                    if (mStyles.lineDashI !== null && mStyles.lineDashI > 0) {
                        lineDash.push(mStyles.lineDashI);
                    }
                    if (mStyles.lineDashII !== null && mStyles.lineDashII > 0) {
                        if (lineDash.length < 1) {
                            lineDash.push(0);
                        }
                        lineDash.push(mStyles.lineDashII);
                    }
                    if (mStyles.lineDashIII !== null && mStyles.lineDashIII > 0) {
                        if (lineDash.length < 2) {
                            lineDash.push(0);
                            lineDash.push(0);
                        }
                        lineDash[2] = mStyles.lineDashIII;
                    }
                    let lineCap = null;
                    switch (mStyles.lineCap) {
                        case 0 /* LINE_CAP_CODE.BUTT */:
                            lineCap = 'butt';
                            break;
                        case 1 /* LINE_CAP_CODE.ROUND */:
                            lineCap = 'round';
                            break;
                        case 2 /* LINE_CAP_CODE.SQUARE */:
                            lineCap = 'square';
                            break;
                    }
                    let lineJoin = null;
                    switch (mStyles.lineJoin) {
                        case 2 /* LINE_JOIN_CODE.BEVEL */:
                            lineJoin = 'bevel';
                            break;
                        case 1 /* LINE_JOIN_CODE.ROUND */:
                            lineJoin = 'round';
                            break;
                        case 0 /* LINE_JOIN_CODE.MITER */:
                            lineJoin = 'miter';
                            break;
                    }
                    let fill = null;
                    if (mStyles.fill !== null) {
                        fill = `rgba(${parseInt((mStyles.fill.r * 255).toString())}, ${parseInt((mStyles.fill.g * 255).toString())}, ${parseInt((mStyles.fill.b * 255).toString())}, ${parseInt((mStyles.fill.a * 1).toString())})`;
                    }
                    let stroke = null;
                    if (mStyles.stroke !== null) {
                        stroke = `rgba(${parseInt((mStyles.stroke.r * 255).toString())}, ${parseInt((mStyles.stroke.g * 255).toString())}, ${parseInt((mStyles.stroke.b * 255).toString())}, ${parseInt((mStyles.stroke.a * 1).toString())})`;
                    }
                    const { strokeWidth, miterLimit } = mStyles;
                    const styles = {
                        lineDash,
                        fill,
                        stroke,
                        lineCap,
                        lineJoin,
                        strokeWidth,
                        miterLimit
                    };
                    const transform = {
                        a: mShape.transform?.a ?? 1.0,
                        b: mShape.transform?.b ?? 0.0,
                        c: mShape.transform?.c ?? 0.0,
                        d: mShape.transform?.d ?? 1.0,
                        tx: mShape.transform?.tx ?? 0.0,
                        ty: mShape.transform?.ty ?? 0.0
                    };
                    if (mShape.type === 0 /* SHAPE_TYPE_CODE.SHAPE */ && mShape.shape !== null) {
                        shapes.push({
                            type: "shape" /* SHAPE_TYPE.SHAPE */,
                            path: mShape.shape,
                            styles,
                            transform
                        });
                    }
                    else if (mShape.type === 1 /* SHAPE_TYPE_CODE.RECT */ && mShape.rect !== null) {
                        shapes.push({
                            type: "rect" /* SHAPE_TYPE.RECT */,
                            path: mShape.rect,
                            styles,
                            transform
                        });
                    }
                    else if (mShape.type === 2 /* SHAPE_TYPE_CODE.ELLIPSE */ && mShape.ellipse !== null) {
                        shapes.push({
                            type: "ellipse" /* SHAPE_TYPE.ELLIPSE */,
                            path: mShape.ellipse,
                            styles,
                            transform
                        });
                    }
                });
                if (mFrame.shapes[0] !== undefined && mFrame.shapes[0].type === 3 /* SHAPE_TYPE_CODE.KEEP */ && lastShapes !== undefined) {
                    shapes = lastShapes;
                }
                else {
                    lastShapes = shapes;
                }
                const llx = transform.a * layout.x + transform.c * layout.y + transform.tx;
                const lrx = transform.a * (layout.x + layout.width) + transform.c * layout.y + transform.tx;
                const lbx = transform.a * layout.x + transform.c * (layout.y + layout.height) + transform.tx;
                const rbx = transform.a * (layout.x + layout.width) + transform.c * (layout.y + layout.height) + transform.tx;
                const lly = transform.b * layout.x + transform.d * layout.y + transform.ty;
                const lry = transform.b * (layout.x + layout.width) + transform.d * layout.y + transform.ty;
                const lby = transform.b * layout.x + transform.d * (layout.y + layout.height) + transform.ty;
                const rby = transform.b * (layout.x + layout.width) + transform.d * (layout.y + layout.height) + transform.ty;
                const nx = Math.min(Math.min(lbx, rbx), Math.min(llx, lrx));
                const ny = Math.min(Math.min(lby, rby), Math.min(lly, lry));
                const maskPath = clipPath.length > 0
                    ? {
                        d: clipPath,
                        transform: undefined,
                        styles: {
                            fill: 'rgba(0, 0, 0, 0)',
                            stroke: null,
                            strokeWidth: null,
                            lineCap: null,
                            lineJoin: null,
                            miterLimit: null,
                            lineDash: null
                        }
                    }
                    : null;
                vSprite.frames.push({
                    alpha: mFrame.alpha ?? 0,
                    layout,
                    transform,
                    clipPath,
                    shapes,
                    nx,
                    ny,
                    maskPath
                });
            });
            this.sprites.push(vSprite);
        });
        this.images = images;
    }
}

/**
 * SVGA 下载解析器
 */
class Parser {
    static parseVideoEntity(data) {
        const header = new Uint8Array(data, 0, 4);
        const u8a = new Uint8Array(data);
        if (header.toString() === '80,75,3,4') {
            throw new Error('this parser only support version@2 of SVGA.');
        }
        const inflateData = unzlibSync(u8a);
        const movieData = MovieEntity.decode(inflateData);
        return new VideoEntity(movieData, movieData.images);
    }
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    async load(url) {
        const data = await download(url);
        return Parser.parseVideoEntity(data);
    }
}

function createOffscreenCanvas(options) {
    if (platform === SupportedPlatform.WECHAT) {
        return wx.createOffscreenCanvas({
            ...options,
            type: '2d'
        });
    }
    if (platform === SupportedPlatform.H5) {
        return new OffscreenCanvas(options.width, options.height);
    }
    if (platform === SupportedPlatform.ALIPAY) {
        return my.createOffscreenCanvas({
            width: options.width,
            height: options.height,
        });
    }
    if (platform === SupportedPlatform.DOUYIN) {
        const canvas = tt.createOffscreenCanvas();
        canvas.width = options.width;
        canvas.height = options.height;
        return canvas;
    }
    throw throwUnsupportedPlatform();
}
function getCanvas(selector, component) {
    return new Promise((resolve, reject) => {
        const bridge = getBridge();
        const initCanvas = (canvas, width = 0, height = 0) => {
            if (!canvas) {
                reject("canvas not found.");
                return;
            }
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject("canvas context not found.");
                return;
            }
            const dpr = bridge.getSystemInfoSync().pixelRatio;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            resolve({ canvas, ctx });
        };
        if (platform === SupportedPlatform.H5) {
            const canvas = document.querySelector(selector);
            initCanvas(canvas, parseFloat(canvas.style.width), parseFloat(canvas.style.height));
        }
        else if (platform !== SupportedPlatform.UNKNOWN) {
            let query = bridge.createSelectorQuery();
            if (component) {
                query = query.in(component);
            }
            query
                .select(selector)
                .fields({ node: true, size: true })
                .exec((res) => {
                const { node, width, height } = res?.[0] || {};
                initCanvas(node, width, height);
            });
        }
        else {
            reject(throwUnsupportedPlatform());
        }
    });
}

function uint8ArrayToString(u8a) {
    let dataString = '';
    for (let i = 0; i < u8a.length; i++) {
        dataString += String.fromCharCode(u8a[i]);
    }
    return dataString;
}

/**
 * 将ArrayBuffer转为base64
 * @param data 二进制数据
 * @returns
 */
function toBase64(data) {
    // H5环境
    if (platform === SupportedPlatform.H5) {
        const str = uint8ArrayToString(data);
        return btoa(str);
    }
    return getBridge().arrayBufferToBase64(data.buffer);
}
/**
 * 创建图片对象
 * @param canvas 画布对象
 * @returns
 */
function createImage(canvas) {
    if (platform === SupportedPlatform.H5) {
        return new Image();
    }
    if (platform !== SupportedPlatform.UNKNOWN) {
        return canvas.createImage();
    }
    return null;
}
/**
 * 创建图片src元信息
 * @param data
 * @returns
 */
function createImageSource(data) {
    if (typeof data === "string") {
        return data;
    }
    return "data:image/png;base64," + toBase64(data);
}
/**
 * 加载图片
 * @param canvas 画布对象
 * @param data 图片数据
 * @returns
 */
function loadImage(canvas, data) {
    return new Promise((resolve, reject) => {
        let img = createImage(canvas);
        if (img) {
            img.onload = () => resolve(img);
            img.onerror = (error) => reject(new Error(`[SVGA LOADING FAILURE]: ${error.message}`));
            img.src = createImageSource(data);
        }
        reject(throwUnsupportedPlatform());
    });
}

function startAnimationFrame(canvas, callback) {
    if (platform === SupportedPlatform.H5) {
        return requestAnimationFrame(callback);
    }
    if (platform !== SupportedPlatform.UNKNOWN) {
        return canvas.requestAnimationFrame(callback);
    }
    throw throwUnsupportedPlatform();
}

class Animator {
    canvas;
    isRunning = false;
    startTime = 0;
    currentFrication = 0.0;
    startValue = 0;
    endValue = 0;
    duration = 0;
    loopStart = 0;
    loop = 1;
    fillRule = 0;
    onStart = () => { };
    onUpdate = () => { };
    onEnd = () => { };
    constructor(canvas) {
        this.canvas = canvas;
    }
    currentTimeMillSecond() {
        if (platform === SupportedPlatform.H5 && performance) {
            return performance.now();
        }
        return Date.now();
    }
    start() {
        this.isRunning = true;
        this.startTime = this.currentTimeMillSecond();
        this.currentFrication = 0.0;
        this.onStart();
        this.doFrame();
    }
    stop() {
        this.isRunning = false;
    }
    get animatedValue() {
        return Math.floor(((this.endValue - this.startValue) * this.currentFrication) + this.startValue);
    }
    doFrame() {
        if (this.isRunning) {
            this.doDeltaTime(this.currentTimeMillSecond() - this.startTime);
            if (this.isRunning) {
                startAnimationFrame(this.canvas, this.doFrame.bind(this));
            }
        }
    }
    doDeltaTime(deltaTime) {
        if (deltaTime >= this.loopStart + (this.duration - this.loopStart) * this.loop) {
            this.currentFrication = this.fillRule === 1 ? 0.0 : 1.0;
            this.isRunning = false;
        }
        else {
            this.currentFrication = deltaTime <= this.duration
                ? deltaTime / this.duration
                : ((deltaTime - this.loopStart) % (this.duration - this.loopStart) + this.loopStart) / this.duration;
        }
        this.onUpdate(this.animatedValue);
        if (!this.isRunning) {
            this.onEnd();
        }
    }
}

const validMethods = 'MLHVCSQRZmlhvcsqrz';
function render(canvas, bitmapsCache, dynamicElements, replaceElements, videoEntity, currentFrame) {
    const context = canvas.getContext('2d');
    if (context === null) {
        throw new Error('Render Context cannot be null');
    }
    videoEntity.sprites.forEach(sprite => {
        const bitmap = bitmapsCache[sprite.imageKey];
        const replaceElement = replaceElements[sprite.imageKey];
        const dynamicElement = dynamicElements[sprite.imageKey];
        drawSprite(context, sprite, currentFrame, bitmap, replaceElement, dynamicElement);
    });
    return context.getImageData(0, 0, canvas.width, canvas.height);
}
function drawSprite(context, sprite, currentFrame, bitmap, replaceElement, dynamicElement) {
    const frame = sprite.frames[currentFrame];
    if (frame.alpha < 0.05)
        return;
    context.save();
    context.globalAlpha = frame.alpha;
    context.transform(frame.transform?.a ?? 1, frame.transform?.b ?? 0, frame.transform?.c ?? 0, frame.transform?.d ?? 1, frame.transform?.tx ?? 0, frame.transform?.ty ?? 0);
    if (bitmap !== undefined) {
        if (frame.maskPath !== null) {
            drawBezier(context, frame.maskPath.d, frame.maskPath.transform, frame.maskPath.styles);
            context.clip();
        }
        if (replaceElement !== undefined) {
            context.drawImage(replaceElement, 0, 0, frame.layout.width, frame.layout.height);
        }
        else {
            context.drawImage(bitmap, 0, 0, frame.layout.width, frame.layout.height);
        }
    }
    if (dynamicElement !== undefined) {
        context.drawImage(dynamicElement, (frame.layout.width - dynamicElement.width) / 2, (frame.layout.height - dynamicElement.height) / 2);
    }
    frame.shapes.forEach(shape => drawShape(context, shape));
    context.restore();
}
function drawShape(context, shape) {
    switch (shape.type) {
        case "shape" /* SHAPE_TYPE.SHAPE */:
            drawBezier(context, shape.path.d, shape.transform, shape.styles);
            break;
        case "ellipse" /* SHAPE_TYPE.ELLIPSE */:
            drawEllipse(context, shape.path.x ?? 0.0, shape.path.y ?? 0.0, shape.path.radiusX ?? 0.0, shape.path.radiusY ?? 0.0, shape.transform, shape.styles);
            break;
        case "rect" /* SHAPE_TYPE.RECT */:
            drawRect(context, shape.path.x ?? 0.0, shape.path.y ?? 0.0, shape.path.width ?? 0.0, shape.path.height ?? 0.0, shape.path.cornerRadius ?? 0.0, shape.transform, shape.styles);
            break;
    }
}
function resetShapeStyles(context, styles) {
    if (styles === undefined)
        return;
    if (styles.stroke !== null) {
        context.strokeStyle = styles.stroke;
    }
    else {
        context.strokeStyle = 'transparent';
    }
    if (styles.strokeWidth !== null && styles.strokeWidth > 0)
        context.lineWidth = styles.strokeWidth;
    if (styles.miterLimit !== null && styles.miterLimit > 0)
        context.miterLimit = styles.miterLimit;
    if (styles.lineCap !== null)
        context.lineCap = styles.lineCap;
    if (styles.lineJoin !== null)
        context.lineJoin = styles.lineJoin;
    if (styles.fill !== null) {
        context.fillStyle = styles.fill;
    }
    else {
        context.fillStyle = 'transparent';
    }
    if (styles.lineDash !== null)
        context.setLineDash(styles.lineDash);
}
function drawBezier(context, d, transform, styles) {
    context.save();
    resetShapeStyles(context, styles);
    if (transform !== undefined) {
        context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
    }
    const currentPoint = { x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
    context.beginPath();
    if (d !== undefined) {
        d = d.replace(/([a-zA-Z])/g, '|||$1 ').replace(/,/g, ' ');
        d.split('|||').forEach(segment => {
            if (segment.length === 0)
                return;
            const firstLetter = segment.substring(0, 1);
            if (validMethods.includes(firstLetter)) {
                const args = segment.substr(1).trim().split(' ');
                drawBezierElement(context, currentPoint, firstLetter, args);
            }
        });
    }
    if (styles.fill !== null) {
        context.fill();
    }
    if (styles.stroke !== null) {
        context.stroke();
    }
    context.restore();
}
function drawBezierElement(context, currentPoint, method, args) {
    switch (method) {
        case 'M':
            currentPoint.x = +args[0];
            currentPoint.y = +args[1];
            context.moveTo(currentPoint.x, currentPoint.y);
            break;
        case 'm':
            currentPoint.x += +args[0];
            currentPoint.y += +args[1];
            context.moveTo(currentPoint.x, currentPoint.y);
            break;
        case 'L':
            currentPoint.x = +args[0];
            currentPoint.y = +args[1];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case 'l':
            currentPoint.x += +args[0];
            currentPoint.y += +args[1];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case 'H':
            currentPoint.x = +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case 'h':
            currentPoint.x += +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case 'V':
            currentPoint.y = +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case 'v':
            currentPoint.y += +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case 'C':
            currentPoint.x1 = +args[0];
            currentPoint.y1 = +args[1];
            currentPoint.x2 = +args[2];
            currentPoint.y2 = +args[3];
            currentPoint.x = +args[4];
            currentPoint.y = +args[5];
            context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
            break;
        case 'c':
            currentPoint.x1 = currentPoint.x + +args[0];
            currentPoint.y1 = currentPoint.y + +args[1];
            currentPoint.x2 = currentPoint.x + +args[2];
            currentPoint.y2 = currentPoint.y + +args[3];
            currentPoint.x += +args[4];
            currentPoint.y += +args[5];
            context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
            break;
        case 'S':
            if (currentPoint.x1 !== undefined && currentPoint.y1 !== undefined && currentPoint.x2 !== undefined && currentPoint.y2 !== undefined) {
                currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
                currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
                currentPoint.x2 = +args[0];
                currentPoint.y2 = +args[1];
                currentPoint.x = +args[2];
                currentPoint.y = +args[3];
                context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
            }
            else {
                currentPoint.x1 = +args[0];
                currentPoint.y1 = +args[1];
                currentPoint.x = +args[2];
                currentPoint.y = +args[3];
                context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
            }
            break;
        case 's':
            if (currentPoint.x1 !== undefined && currentPoint.y1 !== undefined && currentPoint.x2 !== undefined && currentPoint.y2 !== undefined) {
                currentPoint.x1 = currentPoint.x - currentPoint.x2 + currentPoint.x;
                currentPoint.y1 = currentPoint.y - currentPoint.y2 + currentPoint.y;
                currentPoint.x2 = currentPoint.x + +args[0];
                currentPoint.y2 = currentPoint.y + +args[1];
                currentPoint.x += +args[2];
                currentPoint.y += +args[3];
                context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
            }
            else {
                currentPoint.x1 = currentPoint.x + +args[0];
                currentPoint.y1 = currentPoint.y + +args[1];
                currentPoint.x += +args[2];
                currentPoint.y += +args[3];
                context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
            }
            break;
        case 'Q':
            currentPoint.x1 = +args[0];
            currentPoint.y1 = +args[1];
            currentPoint.x = +args[2];
            currentPoint.y = +args[3];
            context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
            break;
        case 'q':
            currentPoint.x1 = currentPoint.x + +args[0];
            currentPoint.y1 = currentPoint.y + +args[1];
            currentPoint.x += +args[2];
            currentPoint.y += +args[3];
            context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
            break;
        case 'A':
            break;
        case 'a':
            break;
        case 'Z':
        case 'z':
            context.closePath();
            break;
    }
}
function drawEllipse(context, x, y, radiusX, radiusY, transform, styles) {
    context.save();
    resetShapeStyles(context, styles);
    if (transform !== undefined) {
        context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
    }
    x = x - radiusX;
    y = y - radiusY;
    const w = radiusX * 2;
    const h = radiusY * 2;
    const kappa = 0.5522848;
    const ox = (w / 2) * kappa;
    const oy = (h / 2) * kappa;
    const xe = x + w;
    const ye = y + h;
    const xm = x + w / 2;
    const ym = y + h / 2;
    context.beginPath();
    context.moveTo(x, ym);
    context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    if (styles.fill !== null) {
        context.fill();
    }
    if (styles.stroke !== null) {
        context.stroke();
    }
    context.restore();
}
function drawRect(context, x, y, width, height, cornerRadius, transform, styles) {
    context.save();
    resetShapeStyles(context, styles);
    if (transform !== undefined) {
        context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
    }
    let radius = cornerRadius;
    if (width < 2 * radius) {
        radius = width / 2;
    }
    if (height < 2 * radius) {
        radius = height / 2;
    }
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
    if (styles.fill !== null) {
        context.fill();
    }
    if (styles.stroke !== null) {
        context.stroke();
    }
    context.restore();
}

/**
 * SVGA 播放器
 */
class Player {
    /**
     * 动画当前帧数
     */
    currentFrame = 0;
    /**
     * 动画总帧数
     */
    totalFrames = 0;
    /**
     * SVGA 数据源
     */
    videoEntity = undefined;
    /**
     * 当前配置项
     */
    config = {
        container: null,
        context: null,
        loop: 0,
        fillMode: "forwards" /* PLAYER_FILL_MODE.FORWARDS */,
        playMode: "forwards" /* PLAYER_PLAY_MODE.FORWARDS */,
        startFrame: 0,
        endFrame: 0,
        loopStartFrame: 0,
        isUseIntersectionObserver: false,
    };
    selector = "#svga-board";
    animator;
    ofsCanvas;
    // private isBeIntersection = true;
    // private intersectionObserver: IntersectionObserver | null = null
    bitmapsCache = {};
    constructor() {
        this.ofsCanvas = createOffscreenCanvas({});
        this.animator = new Animator(this.ofsCanvas);
        this.animator.onEnd = () => {
            if (this.onEnd !== undefined) {
                this.onEnd();
            }
        };
    }
    /**
     * 设置配置项
     * @param options 可配置项
     */
    async setConfig(options, component) {
        let config;
        if (typeof options === "string") {
            config = { container: options };
        }
        else {
            config = options;
        }
        if (config.startFrame !== undefined && config.endFrame !== undefined) {
            if (config.startFrame > config.endFrame) {
                throw new Error("StartFrame should > EndFrame");
            }
        }
        const result = await getCanvas(config.container || this.selector, component);
        this.config.container = result.canvas;
        this.config.context = result.ctx;
        this.config.loop = config.loop ?? 0;
        this.config.fillMode = config.fillMode ?? "forwards" /* PLAYER_FILL_MODE.FORWARDS */;
        this.config.playMode = config.playMode ?? "forwards" /* PLAYER_PLAY_MODE.FORWARDS */;
        this.config.startFrame = config.startFrame ?? 0;
        this.config.endFrame = config.endFrame ?? 0;
        this.config.loopStartFrame = config.loopStartFrame ?? 0;
        this.config.isUseIntersectionObserver =
            config.isUseIntersectionObserver ?? false;
        // 监听容器是否处于浏览器视窗内
        // this.setIntersectionObserver()
    }
    // private setIntersectionObserver (): void {
    //   if (hasIntersectionObserver && this.config.isUseIntersectionObserver) {
    //     this.intersectionObserver = new IntersectionObserver(entries => {
    //       this.isBeIntersection = !(entries[0].intersectionRatio <= 0)
    //     }, {
    //       rootMargin: '0px',
    //       threshold: [0, 0.5, 1]
    //     })
    //     this.intersectionObserver.observe(this.config.container)
    //   } else {
    //     if (this.intersectionObserver !== null) this.intersectionObserver.disconnect()
    //     this.config.isUseIntersectionObserver = false
    //     this.isBeIntersection = true
    //   }
    // }
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @returns Promise<void>
     */
    mount(videoEntity) {
        this.currentFrame = 0;
        this.totalFrames = videoEntity.frames - 1;
        this.videoEntity = videoEntity;
        this.clearContainer();
        this.setSize();
        if (this.videoEntity === undefined) {
            return Promise.resolve();
        }
        const { images } = this.videoEntity;
        if (Object.keys(images).length === 0) {
            return Promise.resolve();
        }
        let imageArr = [];
        for (let key in images) {
            const image = images[key];
            if (typeof image === "string") {
                const p = loadImage(this.ofsCanvas, image);
                imageArr.push(p);
            }
        }
        return Promise.all(imageArr);
    }
    /**
     * 开始播放事件回调
     */
    onStart;
    /**
     * 重新播放事件回调
     */
    onResume;
    /**
     * 暂停播放事件回调
     */
    onPause;
    /**
     * 停止播放事件回调
     */
    onStop;
    /**
     * 播放中事件回调
     */
    onProcess;
    /**
     * 播放结束事件回调
     */
    onEnd;
    clearContainer() {
        const { container } = this.config;
        if (container !== null) {
            const { width } = container;
            container.width = width;
        }
    }
    /**
     * 开始播放
     */
    start() {
        if (this.videoEntity === undefined) {
            throw new Error("videoEntity undefined");
        }
        this.clearContainer();
        this.startAnimation();
        if (this.onStart !== undefined) {
            this.onStart();
        }
    }
    /**
     * 重新播放
     */
    resume() {
        this.startAnimation();
        if (this.onResume !== undefined) {
            this.onResume();
        }
    }
    /**
     * 暂停播放
     */
    pause() {
        this.animator.stop();
        if (this.onPause !== undefined) {
            this.onPause();
        }
    }
    /**
     * 停止播放
     */
    stop() {
        this.animator.stop();
        this.currentFrame = 0;
        this.clearContainer();
        if (this.onStop !== undefined) {
            this.onStop();
        }
    }
    /**
     * 清理容器画布
     */
    clear() {
        this.clearContainer();
    }
    /**
     * 销毁实例
     */
    destroy() {
        this.animator.stop();
        this.clearContainer();
        this.animator = null;
        this.videoEntity = null;
    }
    startAnimation() {
        if (this.videoEntity === undefined)
            throw new Error("videoEntity undefined");
        const { config, totalFrames, videoEntity } = this;
        const { playMode, startFrame, endFrame, loopStartFrame, fillMode, loop } = config;
        // 如果开始动画的当前帧是最后一帧，重置为第 0 帧
        if (this.currentFrame === totalFrames) {
            this.currentFrame = startFrame > 0 ? startFrame : 0;
        }
        if (playMode === "forwards" /* PLAYER_PLAY_MODE.FORWARDS */) {
            this.animator.startValue = startFrame > 0 ? startFrame : 0;
            this.animator.endValue =
                endFrame > 0 ? endFrame : totalFrames;
        }
        else {
            // 倒播
            this.animator.startValue =
                endFrame > 0 ? endFrame : totalFrames;
            this.animator.endValue = startFrame > 0 ? startFrame : 0;
        }
        let frames = videoEntity.frames;
        if (endFrame > 0 && endFrame > startFrame) {
            frames = endFrame - startFrame;
        }
        else if (endFrame <= 0 && startFrame > 0) {
            frames = videoEntity.frames - startFrame;
        }
        this.animator.duration =
            frames * (1.0 / videoEntity.fps) * 1000;
        this.animator.loopStart =
            loopStartFrame > startFrame
                ? (loopStartFrame - startFrame) * (1.0 / videoEntity.fps) * 1000
                : 0;
        this.animator.loop =
            loop === true || loop <= 0
                ? Infinity
                : loop === false
                    ? 1
                    : loop;
        this.animator.fillRule = fillMode === "backwards" ? 1 : 0;
        this.animator.onUpdate = (value) => {
            if (this.currentFrame === value) {
                return;
            }
            this.currentFrame = value;
            this.drawFrame();
            if (this.onProcess !== undefined) {
                this.onProcess();
            }
        };
        this.animator.start();
    }
    setSize() {
        if (this.videoEntity === undefined) {
            throw new Error("videoEntity undefined");
        }
        const { container } = this.config;
        const { width, height } = this.videoEntity.size;
        container.width = width;
        container.height = height;
    }
    /// ----------- 描绘一帧 -----------
    drawFrame() {
        if (this.videoEntity === undefined) {
            throw new Error("Player VideoEntity undefined");
        }
        // if (this.config.isUseIntersectionObserver && !this.isBeIntersection) return;
        this.clearContainer();
        const { context, container } = this.config;
        if (context === null) {
            throw new Error("Canvas Context cannot be null");
        }
        const { width = 0, height = 0 } = container;
        let { ofsCanvas } = this;
        // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
        if (platform === SupportedPlatform.H5 &&
            navigator.userAgent.includes("Firefox")) {
            ofsCanvas = createOffscreenCanvas({ width, height });
        }
        else {
            ofsCanvas.width = width;
            ofsCanvas.height = height;
        }
        const imageData = render(ofsCanvas, this.bitmapsCache, this.videoEntity.dynamicElements, this.videoEntity.replaceElements, this.videoEntity, this.currentFrame);
        context.putImageData(imageData, 0, 0, 0, 0, ofsCanvas.width, ofsCanvas.height);
    }
}

export { Parser, Player };
//# sourceMappingURL=index.js.map
