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
for (var i$1 = 0; i$1 < 32768; ++i$1) {
    // reverse table algorithm from SO
    var x$1 = ((i$1 & 0xAAAA) >> 1) | ((i$1 & 0x5555) << 1);
    x$1 = ((x$1 & 0xCCCC) >> 2) | ((x$1 & 0x3333) << 2);
    x$1 = ((x$1 & 0xF0F0) >> 4) | ((x$1 & 0x0F0F) << 4);
    rev[i$1] = (((x$1 & 0xFF00) >> 8) | ((x$1 & 0x00FF) << 8)) >> 1;
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
for (var i$1 = 0; i$1 < 144; ++i$1)
    flt[i$1] = 8;
for (var i$1 = 144; i$1 < 256; ++i$1)
    flt[i$1] = 9;
for (var i$1 = 256; i$1 < 280; ++i$1)
    flt[i$1] = 7;
for (var i$1 = 280; i$1 < 288; ++i$1)
    flt[i$1] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var i$1 = 0; i$1 < 32; ++i$1)
    fdt[i$1] = 5;
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

function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var t,n={};var r,i,o=(t||(t=1,function(){var e=n;e.length=function(e){var t=e.length;if(!t)return 0;for(var n=0;--t%4>1&&"="===e.charAt(t);)++n;return Math.ceil(3*e.length)/4-n};for(var t=new Array(64),r=new Array(123),i=0;i<64;)r[t[i]=i<26?i+65:i<52?i+71:i<62?i-4:i-59|43]=i++;e.encode=function(e,n,r){for(var i,o=null,s=[],a=0,l=0;n<r;){var u=e[n++];switch(l){case 0:s[a++]=t[u>>2],i=(3&u)<<4,l=1;break;case 1:s[a++]=t[i|u>>4],i=(15&u)<<2,l=2;break;case 2:s[a++]=t[i|u>>6],s[a++]=t[63&u],l=0;}a>8191&&((o||(o=[])).push(String.fromCharCode.apply(String,s)),a=0);}return l&&(s[a++]=t[i],s[a++]=61,1===l&&(s[a++]=61)),o?(a&&o.push(String.fromCharCode.apply(String,s.slice(0,a))),o.join("")):String.fromCharCode.apply(String,s.slice(0,a))};var o="invalid encoding";e.decode=function(e,t,n){for(var i,s=n,a=0,l=0;l<e.length;){var u=e.charCodeAt(l++);if(61===u&&a>1)break;if(void 0===(u=r[u]))throw Error(o);switch(a){case 0:i=u,a=1;break;case 1:t[n++]=i<<2|(48&u)>>4,i=u,a=2;break;case 2:t[n++]=(15&i)<<4|(60&u)>>2,i=u,a=3;break;case 3:t[n++]=(3&i)<<6|u,a=0;}}if(1===a)throw Error(o);return n-s},e.test=function(e){return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(e)};}()),n),s=e(o),a={};var l,u,c=e(i?r:(i=1,r=function(e,t,n){var r=n||8192,i=r>>>1,o=null,s=r;return function(n){if(n<1||n>i)return e(n);s+n>r&&(o=e(r),s=0);var a=t.call(o,s,s+=n);return 7&s&&(s=1+(7|s)),a}}));var p,h=e(function(){if(u)return l;function e(e){return "undefined"!=typeof Float32Array?function(){var t=new Float32Array([-0]),n=new Uint8Array(t.buffer),r=128===n[3];function i(e,r,i){t[0]=e,r[i]=n[0],r[i+1]=n[1],r[i+2]=n[2],r[i+3]=n[3];}function o(e,r,i){t[0]=e,r[i]=n[3],r[i+1]=n[2],r[i+2]=n[1],r[i+3]=n[0];}function s(e,r){return n[0]=e[r],n[1]=e[r+1],n[2]=e[r+2],n[3]=e[r+3],t[0]}function a(e,r){return n[3]=e[r],n[2]=e[r+1],n[1]=e[r+2],n[0]=e[r+3],t[0]}e.writeFloatLE=r?i:o,e.writeFloatBE=r?o:i,e.readFloatLE=r?s:a,e.readFloatBE=r?a:s;}():function(){function o(e,t,n,r){var i=t<0?1:0;if(i&&(t=-t),0===t)e(1/t>0?0:2147483648,n,r);else if(isNaN(t))e(2143289344,n,r);else if(t>34028234663852886e22)e((i<<31|2139095040)>>>0,n,r);else if(t<11754943508222875e-54)e((i<<31|Math.round(t/1401298464324817e-60))>>>0,n,r);else {var o=Math.floor(Math.log(t)/Math.LN2);e((i<<31|o+127<<23|8388607&Math.round(t*Math.pow(2,-o)*8388608))>>>0,n,r);}}function s(e,t,n){var r=e(t,n),i=2*(r>>31)+1,o=r>>>23&255,s=8388607&r;return 255===o?s?NaN:i*(1/0):0===o?1401298464324817e-60*i*s:i*Math.pow(2,o-150)*(s+8388608)}e.writeFloatLE=o.bind(null,t),e.writeFloatBE=o.bind(null,n),e.readFloatLE=s.bind(null,r),e.readFloatBE=s.bind(null,i);}(),"undefined"!=typeof Float64Array?function(){var t=new Float64Array([-0]),n=new Uint8Array(t.buffer),r=128===n[7];function i(e,r,i){t[0]=e,r[i]=n[0],r[i+1]=n[1],r[i+2]=n[2],r[i+3]=n[3],r[i+4]=n[4],r[i+5]=n[5],r[i+6]=n[6],r[i+7]=n[7];}function o(e,r,i){t[0]=e,r[i]=n[7],r[i+1]=n[6],r[i+2]=n[5],r[i+3]=n[4],r[i+4]=n[3],r[i+5]=n[2],r[i+6]=n[1],r[i+7]=n[0];}function s(e,r){return n[0]=e[r],n[1]=e[r+1],n[2]=e[r+2],n[3]=e[r+3],n[4]=e[r+4],n[5]=e[r+5],n[6]=e[r+6],n[7]=e[r+7],t[0]}function a(e,r){return n[7]=e[r],n[6]=e[r+1],n[5]=e[r+2],n[4]=e[r+3],n[3]=e[r+4],n[2]=e[r+5],n[1]=e[r+6],n[0]=e[r+7],t[0]}e.writeDoubleLE=r?i:o,e.writeDoubleBE=r?o:i,e.readDoubleLE=r?s:a,e.readDoubleBE=r?a:s;}():function(){function o(e,t,n,r,i,o){var s=r<0?1:0;if(s&&(r=-r),0===r)e(0,i,o+t),e(1/r>0?0:2147483648,i,o+n);else if(isNaN(r))e(0,i,o+t),e(2146959360,i,o+n);else if(r>17976931348623157e292)e(0,i,o+t),e((s<<31|2146435072)>>>0,i,o+n);else {var a;if(r<22250738585072014e-324)e((a=r/5e-324)>>>0,i,o+t),e((s<<31|a/4294967296)>>>0,i,o+n);else {var l=Math.floor(Math.log(r)/Math.LN2);1024===l&&(l=1023),e(4503599627370496*(a=r*Math.pow(2,-l))>>>0,i,o+t),e((s<<31|l+1023<<20|1048576*a&1048575)>>>0,i,o+n);}}}function s(e,t,n,r,i){var o=e(r,i+t),s=e(r,i+n),a=2*(s>>31)+1,l=s>>>20&2047,u=4294967296*(1048575&s)+o;return 2047===l?u?NaN:a*(1/0):0===l?5e-324*a*u:a*Math.pow(2,l-1075)*(u+4503599627370496)}e.writeDoubleLE=o.bind(null,t,0,4),e.writeDoubleBE=o.bind(null,n,4,0),e.readDoubleLE=s.bind(null,r,0,4),e.readDoubleBE=s.bind(null,i,4,0);}(),e}function t(e,t,n){t[n]=255&e,t[n+1]=e>>>8&255,t[n+2]=e>>>16&255,t[n+3]=e>>>24;}function n(e,t,n){t[n]=e>>>24,t[n+1]=e>>>16&255,t[n+2]=e>>>8&255,t[n+3]=255&e;}function r(e,t){return (e[t]|e[t+1]<<8|e[t+2]<<16|e[t+3]<<24)>>>0}function i(e,t){return (e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3])>>>0}return u=1,l=e(e)}()),f={};var y=(p||(p=1,function(){var e=f;e.length=function(e){for(var t=0,n=0,r=0;r<e.length;++r)(n=e.charCodeAt(r))<128?t+=1:n<2048?t+=2:55296==(64512&n)&&56320==(64512&e.charCodeAt(r+1))?(++r,t+=4):t+=3;return t},e.read=function(e,t,n){if(n-t<1)return "";for(var r,i=null,o=[],s=0;t<n;)(r=e[t++])<128?o[s++]=r:r>191&&r<224?o[s++]=(31&r)<<6|63&e[t++]:r>239&&r<365?(r=((7&r)<<18|(63&e[t++])<<12|(63&e[t++])<<6|63&e[t++])-65536,o[s++]=55296+(r>>10),o[s++]=56320+(1023&r)):o[s++]=(15&r)<<12|(63&e[t++])<<6|63&e[t++],s>8191&&((i||(i=[])).push(String.fromCharCode.apply(String,o)),s=0);return i?(s&&i.push(String.fromCharCode.apply(String,o.slice(0,s))),i.join("")):String.fromCharCode.apply(String,o.slice(0,s))},e.write=function(e,t,n){for(var r,i,o=n,s=0;s<e.length;++s)(r=e.charCodeAt(s))<128?t[n++]=r:r<2048?(t[n++]=r>>6|192,t[n++]=63&r|128):55296==(64512&r)&&56320==(64512&(i=e.charCodeAt(s+1)))?(r=65536+((1023&r)<<10)+(1023&i),++s,t[n++]=r>>18|240,t[n++]=r>>12&63|128,t[n++]=r>>6&63|128,t[n++]=63&r|128):(t[n++]=r>>12|224,t[n++]=r>>6&63|128,t[n++]=63&r|128);return n-o};}()),f),d=e(y);function m(){}function g(e,t,n){t[n]=255&e;}function b(e,t,n){t.set(e,n);}function w(e,t,n){for(;e>127;)t[n++]=127&e|128,e>>>=7;t[n]=e;}function O(e,t,n){for(;e.hi;)t[n++]=127&e.lo|128,e.lo=(e.lo>>>7|e.hi<<25)>>>0,e.hi>>>=7;for(;e.lo>127;)t[n++]=127&e.lo|128,e.lo=e.lo>>>7;t[n++]=e.lo;}function v(e,t,n){t[n]=255&e,t[n+1]=e>>>8&255,t[n+2]=e>>>16&255,t[n+3]=e>>>24;}function S(e){return "string"==typeof e||e instanceof String}function j(e){return "number"==typeof e&&isFinite(e)&&Math.floor(e)===e}const x=Object.freeze([]),E=Object.freeze({});function k(e){for(var t={},n=0;n<e.length;++n)t[e[n]]=1;return function(){for(var e=Object.keys(this),n=e.length-1;n>-1;--n)if(1===t[e[n]]&&void 0!==this[e[n]]&&null!==this[e[n]])return e[n]}}class P{head=null;tail=null;len;next=null;constructor(e){this.head=e.head,this.tail=e.tail,this.len=e.len,this.next=e.states;}}class I{fn;len;next=null;val;constructor(e,t,n){this.fn=e,this.len=t,this.val=n;}}class D{static fromNumber(e){if(0===e)return new A;const t=e<0;t&&(e=-e);let n=e>>>0,r=(e-n)/4294967296>>>0;return t&&(r=~r>>>0,n=~n>>>0,++n>4294967295&&(n=0,++r>4294967295&&(r=0))),new D(n,r)}static from(e){return "number"==typeof e?D.fromNumber(e):S(e)?D.fromNumber(parseInt(e,10)):e.low||e.high?new D(e.low>>>0,e.high>>>0):new A}static fromHash(e){if(e===A.zeroHash)return new A;const t=String.prototype.charCodeAt;return new D((t.call(e,0)|t.call(e,1)<<8|t.call(e,2)<<16|t.call(e,3)<<24)>>>0,(t.call(e,4)|t.call(e,5)<<8|t.call(e,6)<<16|t.call(e,7)<<24)>>>0)}lo;hi;constructor(e,t){this.lo=e>>>0,this.hi=t>>>0;}toNumber(e){if(!e&&this.hi>>>31){const e=1+~this.lo>>>0;let t=~this.hi>>>0;return e||(t=t+1>>>0),-(e+4294967296*t)}return this.lo+4294967296*this.hi}toHash(){return String.fromCharCode(255&this.lo,this.lo>>>8&255,this.lo>>>16&255,this.lo>>>24,255&this.hi,this.hi>>>8&255,this.hi>>>16&255,this.hi>>>24)}zzEncode(){const e=this.hi>>31;return this.hi=((this.hi<<1|this.lo>>>31)^e)>>>0,this.lo=(this.lo<<1^e)>>>0,this}zzDecode(){const e=-(1&this.lo);return this.lo=((this.lo>>>1|this.hi<<31)^e)>>>0,this.hi=(this.hi>>>1^e)>>>0,this}length(){const e=this.lo,t=(this.lo>>>28|this.hi<<4)>>>0,n=this.hi>>>24;return 0===n?0===t?e<16384?e<128?1:2:e<2097152?3:4:t<16384?t<128?5:6:t<2097152?7:8:n<128?9:10}}class A extends D{static zeroHash="\0\0\0\0\0\0\0\0";constructor(){super(0,0);}toNumber(){return 0}zzDecode(){return this}length(){return 1}}class N{static create(){return new N}static alloc(e){return c((e=>new Uint8Array(e)),Uint8Array.prototype.subarray)(e)}len;head;tail;states;constructor(){this.len=0,this.head=new I(m,0,null),this.tail=this.head,this.states=null;}push(e,t,n){return this.tail=this.tail.next=new I(e,t,n),this.len+=t,this}uint32(e){return this.len+=(this.tail=this.tail.next=new I(w,(e>>>=0)<128?1:e<16384?2:e<2097152?3:e<268435456?4:5,e)).len,this}int32(e){return e<0?this.push(O,e<-2147483648?10:5,e):this.uint32(e)}sint32(e){return this.uint32((e<<1^e>>31)>>>0)}uint64(e){const t=D.from(e);return this.push(O,t.length(),t)}int64(e){return this.uint64(e)}sint64(e){const t=D.from(e).zzEncode();return this.push(O,t.length(),t)}bool(e){return this.push(g,1,e?1:0)}fixed32(e){return this.push(v,4,e>>>0)}sfixed32(e){return this.fixed32(e)}fixed64(e){const t=D.from(e);return this.push(v,4,t.lo).push(v,4,t.hi)}sfixed64(e){return this.fixed64(e)}float(e){return this.push(h.writeFloatLE,4,e)}double(e){return this.push(h.writeDoubleLE,8,e)}bytes(e){let t=e.length;if(!t)return this.push(g,1,0);if(S(e)){var n=N.alloc(t=s.length(e));s.decode(e,n,0),e=n;}return this.uint32(t).push(b,t,e)}string(e){const t=d.length(e);return t?this.uint32(t).push(d.write,t,e):this.push(g,1,0)}fork(){return this.states=new P(this),this.head=this.tail=new I(m,0,0),this.len=0,this}reset(){return this.states?(this.head=this.states.head,this.tail=this.states.tail,this.len=this.states.len,this.states=this.states.next):(this.head=this.tail=new I(m,0,0),this.len=0),this}ldelim(){const e=this.head,t=this.tail,n=this.len;return this.reset().uint32(n),n&&(this.tail.next=e.next,this.tail=t,this.len+=n),this}finish(){const e=N.alloc(this.len);let t=this.head.next,n=0;for(;t;)t.fn(t.val,e,n),n+=t.len,t=t.next;return e}}function L(e,t){return RangeError("index out of range: "+e.pos+" + "+(t||1)+" > "+e.len)}class T{static create(e){if(e instanceof Uint8Array)return new T(e);throw Error("illegal buffer")}buf;pos;len;constructor(e){this.buf=e,this.pos=0,this.len=e.length;}slice(e,t,n){return e.subarray(t,n)}readLongVarint(){const e=new D(0,0);let t=0;if(!(this.len-this.pos>4)){for(;t<3;++t){if(this.pos>=this.len)throw L(this);if(e.lo=(e.lo|(127&this.buf[this.pos])<<7*t)>>>0,this.buf[this.pos++]<128)return e}return e.lo=(e.lo|(127&this.buf[this.pos++])<<7*t)>>>0,e}for(let t=0;t<4;++t)if(e.lo=(e.lo|(127&this.buf[this.pos])<<7*t)>>>0,this.buf[this.pos++]<128)return e;if(e.lo=(e.lo|(127&this.buf[this.pos])<<28)>>>0,e.hi=(e.hi|(127&this.buf[this.pos])>>4)>>>0,this.buf[this.pos++]<128)return e;if(t=0,this.len-this.pos>4){for(;t<5;++t)if(e.hi=(e.hi|(127&this.buf[this.pos])<<7*t+3)>>>0,this.buf[this.pos++]<128)return e}else for(;t<5;++t){if(this.pos>=this.len)throw L(this);if(e.hi=(e.hi|(127&this.buf[this.pos])<<7*t+3)>>>0,this.buf[this.pos++]<128)return e}throw Error("invalid varint encoding")}readFixed32_end(e,t){return (e[t-4]|e[t-3]<<8|e[t-2]<<16|e[t-1]<<24)>>>0}readFixed64(){if(this.pos+8>this.len)throw L(this,8);return new D(this.readFixed32_end(this.buf,this.pos+=4),this.readFixed32_end(this.buf,this.pos+=4))}uint32(){let e=4294967295;if(e=(127&this.buf[this.pos])>>>0,this.buf[this.pos++]<128)return e;if(e=(e|(127&this.buf[this.pos])<<7)>>>0,this.buf[this.pos++]<128)return e;if(e=(e|(127&this.buf[this.pos])<<14)>>>0,this.buf[this.pos++]<128)return e;if(e=(e|(127&this.buf[this.pos])<<21)>>>0,this.buf[this.pos++]<128)return e;if(e=(e|(15&this.buf[this.pos])<<28)>>>0,this.buf[this.pos++]<128)return e;if((this.pos+=5)>this.len)throw this.pos=this.len,L(this,10);return e}int32(){return 0|this.uint32()}sint32(){const e=this.uint32();return e>>>1^-(1&e)}uint64(){return this.readLongVarint().toNumber(!0)}int64(){return this.readLongVarint().toNumber(!1)}sint64(){return this.readLongVarint().zzDecode().toNumber(!1)}bool(){return 0!==this.uint32()}fixed32(){if(this.pos+4>this.len)throw L(this,4);return this.readFixed32_end(this.buf,this.pos+=4)}sfixed32(){if(this.pos+4>this.len)throw L(this,4);return 0|this.readFixed32_end(this.buf,this.pos+=4)}fixed64(){return this.readFixed64().toNumber(!0)}sfixed64(){return this.readFixed64().zzDecode().toNumber(!1)}float(){if(this.pos+4>this.len)throw L(this,4);const e=h.readFloatLE(this.buf,this.pos);return this.pos+=4,e}double(){if(this.pos+8>this.len)throw L(this,4);const e=h.readDoubleLE(this.buf,this.pos);return this.pos+=8,e}bytes(){const e=this.uint32(),t=this.pos,n=this.pos+e;if(n>this.len)throw L(this,e);return this.pos+=e,t===n?new Uint8Array(0):this.slice(this.buf,t,n)}string(){const e=this.bytes();return d.read(e,0,e.length)}skip(e){if("number"==typeof e){if(this.pos+e>this.len)throw L(this,e);this.pos+=e;}else do{if(this.pos>=this.len)throw L(this)}while(128&this.buf[this.pos++]);return this}skipType(e){switch(e){case 0:this.skip();break;case 1:this.skip(8);break;case 2:this.skip(this.uint32());break;case 3:for(;4!=(e=7&this.uint32());)this.skipType(e);break;case 5:this.skip(4);break;default:throw Error("invalid wire type "+e+" at offset "+this.pos)}return this}}const C=a.com=(()=>{const e={};return e.opensource=function(){const e={};return e.svga=function(){const e={};return e.MovieParams=function(){function e(e){if(e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.viewBoxWidth=0,e.prototype.viewBoxHeight=0,e.prototype.fps=0,e.prototype.frames=0,e.create=function(t){return new e(t)},e.encode=function(e,t){return t||(t=N.create()),null!=e.viewBoxWidth&&Object.hasOwn(e,"viewBoxWidth")&&t.uint32(13).float(e.viewBoxWidth),null!=e.viewBoxHeight&&Object.hasOwn(e,"viewBoxHeight")&&t.uint32(21).float(e.viewBoxHeight),null!=e.fps&&Object.hasOwn(e,"fps")&&t.uint32(24).int32(e.fps),null!=e.frames&&Object.hasOwn(e,"frames")&&t.uint32(32).int32(e.frames),t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.MovieParams;for(;e.pos<n;){let t=e.uint32();switch(t>>>3){case 1:r.viewBoxWidth=e.float();break;case 2:r.viewBoxHeight=e.float();break;case 3:r.fps=e.int32();break;case 4:r.frames=e.int32();break;default:e.skipType(7&t);}}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){return "object"!=typeof e||null===e?"object expected":null!=e.viewBoxWidth&&e.hasOwnProperty("viewBoxWidth")&&"number"!=typeof e.viewBoxWidth?"viewBoxWidth: number expected":null!=e.viewBoxHeight&&e.hasOwnProperty("viewBoxHeight")&&"number"!=typeof e.viewBoxHeight?"viewBoxHeight: number expected":null!=e.fps&&e.hasOwnProperty("fps")&&!j(e.fps)?"fps: integer expected":null!=e.frames&&e.hasOwnProperty("frames")&&!j(e.frames)?"frames: integer expected":null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.MovieParams)return e;let t=new a.com.opensource.svga.MovieParams;return null!=e.viewBoxWidth&&(t.viewBoxWidth=Number(e.viewBoxWidth)),null!=e.viewBoxHeight&&(t.viewBoxHeight=Number(e.viewBoxHeight)),null!=e.fps&&(t.fps=0|e.fps),null!=e.frames&&(t.frames=0|e.frames),t},e.toObject=function(e,t){t||(t={});let n={};return t.defaults&&(n.viewBoxWidth=0,n.viewBoxHeight=0,n.fps=0,n.frames=0),null!=e.viewBoxWidth&&e.hasOwnProperty("viewBoxWidth")&&(n.viewBoxWidth=t.json&&!isFinite(e.viewBoxWidth)?String(e.viewBoxWidth):e.viewBoxWidth),null!=e.viewBoxHeight&&e.hasOwnProperty("viewBoxHeight")&&(n.viewBoxHeight=t.json&&!isFinite(e.viewBoxHeight)?String(e.viewBoxHeight):e.viewBoxHeight),null!=e.fps&&e.hasOwnProperty("fps")&&(n.fps=e.fps),null!=e.frames&&e.hasOwnProperty("frames")&&(n.frames=e.frames),n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.MovieParams"},e}(),e.SpriteEntity=function(){function e(e){if(this.frames=[],e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.imageKey="",e.prototype.frames=x,e.prototype.matteKey="",e.create=function(t){return new e(t)},e.encode=function(e,t){if(t||(t=N.create()),null!=e.imageKey&&Object.hasOwn(e,"imageKey")&&t.uint32(10).string(e.imageKey),null!=e.frames&&e.frames.length)for(let n=0;n<e.frames.length;++n)a.com.opensource.svga.FrameEntity.encode(e.frames[n],t.uint32(18).fork()).ldelim();return null!=e.matteKey&&Object.hasOwn(e,"matteKey")&&t.uint32(26).string(e.matteKey),t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.SpriteEntity;for(;e.pos<n;){let t=e.uint32();switch(t>>>3){case 1:r.imageKey=e.string();break;case 2:r.frames&&r.frames.length||(r.frames=[]),r.frames.push(a.com.opensource.svga.FrameEntity.decode(e,e.uint32()));break;case 3:r.matteKey=e.string();break;default:e.skipType(7&t);}}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){if("object"!=typeof e||null===e)return "object expected";if(null!=e.imageKey&&e.hasOwnProperty("imageKey")&&!S(e.imageKey))return "imageKey: string expected";if(null!=e.frames&&e.hasOwnProperty("frames")){if(!Array.isArray(e.frames))return "frames: array expected";for(let t=0;t<e.frames.length;++t){let n=a.com.opensource.svga.FrameEntity.verify(e.frames[t]);if(n)return "frames."+n}}return null!=e.matteKey&&e.hasOwnProperty("matteKey")&&!S(e.matteKey)?"matteKey: string expected":null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.SpriteEntity)return e;let t=new a.com.opensource.svga.SpriteEntity;if(null!=e.imageKey&&(t.imageKey=String(e.imageKey)),e.frames){if(!Array.isArray(e.frames))throw TypeError(".com.opensource.svga.SpriteEntity.frames: array expected");t.frames=[];for(let n=0;n<e.frames.length;++n){if("object"!=typeof e.frames[n])throw TypeError(".com.opensource.svga.SpriteEntity.frames: object expected");t.frames[n]=a.com.opensource.svga.FrameEntity.fromObject(e.frames[n]);}}return null!=e.matteKey&&(t.matteKey=String(e.matteKey)),t},e.toObject=function(e,t){t||(t={});let n={};if((t.arrays||t.defaults)&&(n.frames=[]),t.defaults&&(n.imageKey="",n.matteKey=""),null!=e.imageKey&&e.hasOwnProperty("imageKey")&&(n.imageKey=e.imageKey),e.frames&&e.frames.length){n.frames=[];for(let r=0;r<e.frames.length;++r)n.frames[r]=a.com.opensource.svga.FrameEntity.toObject(e.frames[r],t);}return null!=e.matteKey&&e.hasOwnProperty("matteKey")&&(n.matteKey=e.matteKey),n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.SpriteEntity"},e}(),e.Layout=function(){function e(e){if(e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.x=0,e.prototype.y=0,e.prototype.width=0,e.prototype.height=0,e.create=function(t){return new e(t)},e.encode=function(e,t){return t||(t=N.create()),null!=e.x&&Object.hasOwn(e,"x")&&t.uint32(13).float(e.x),null!=e.y&&Object.hasOwn(e,"y")&&t.uint32(21).float(e.y),null!=e.width&&Object.hasOwn(e,"width")&&t.uint32(29).float(e.width),null!=e.height&&Object.hasOwn(e,"height")&&t.uint32(37).float(e.height),t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.Layout;for(;e.pos<n;){let t=e.uint32();switch(t>>>3){case 1:r.x=e.float();break;case 2:r.y=e.float();break;case 3:r.width=e.float();break;case 4:r.height=e.float();break;default:e.skipType(7&t);}}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){return "object"!=typeof e||null===e?"object expected":null!=e.x&&e.hasOwnProperty("x")&&"number"!=typeof e.x?"x: number expected":null!=e.y&&e.hasOwnProperty("y")&&"number"!=typeof e.y?"y: number expected":null!=e.width&&e.hasOwnProperty("width")&&"number"!=typeof e.width?"width: number expected":null!=e.height&&e.hasOwnProperty("height")&&"number"!=typeof e.height?"height: number expected":null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.Layout)return e;let t=new a.com.opensource.svga.Layout;return null!=e.x&&(t.x=Number(e.x)),null!=e.y&&(t.y=Number(e.y)),null!=e.width&&(t.width=Number(e.width)),null!=e.height&&(t.height=Number(e.height)),t},e.toObject=function(e,t){t||(t={});let n={};return t.defaults&&(n.x=0,n.y=0,n.width=0,n.height=0),null!=e.x&&e.hasOwnProperty("x")&&(n.x=t.json&&!isFinite(e.x)?String(e.x):e.x),null!=e.y&&e.hasOwnProperty("y")&&(n.y=t.json&&!isFinite(e.y)?String(e.y):e.y),null!=e.width&&e.hasOwnProperty("width")&&(n.width=t.json&&!isFinite(e.width)?String(e.width):e.width),null!=e.height&&e.hasOwnProperty("height")&&(n.height=t.json&&!isFinite(e.height)?String(e.height):e.height),n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.Layout"},e}(),e.Transform=function(){function e(e){if(e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.a=0,e.prototype.b=0,e.prototype.c=0,e.prototype.d=0,e.prototype.tx=0,e.prototype.ty=0,e.create=function(t){return new e(t)},e.encode=function(e,t){return t||(t=N.create()),null!=e.a&&Object.hasOwn(e,"a")&&t.uint32(13).float(e.a),null!=e.b&&Object.hasOwn(e,"b")&&t.uint32(21).float(e.b),null!=e.c&&Object.hasOwn(e,"c")&&t.uint32(29).float(e.c),null!=e.d&&Object.hasOwn(e,"d")&&t.uint32(37).float(e.d),null!=e.tx&&Object.hasOwn(e,"tx")&&t.uint32(45).float(e.tx),null!=e.ty&&Object.hasOwn(e,"ty")&&t.uint32(53).float(e.ty),t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.Transform;for(;e.pos<n;){let t=e.uint32();switch(t>>>3){case 1:r.a=e.float();break;case 2:r.b=e.float();break;case 3:r.c=e.float();break;case 4:r.d=e.float();break;case 5:r.tx=e.float();break;case 6:r.ty=e.float();break;default:e.skipType(7&t);}}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){return "object"!=typeof e||null===e?"object expected":null!=e.a&&e.hasOwnProperty("a")&&"number"!=typeof e.a?"a: number expected":null!=e.b&&e.hasOwnProperty("b")&&"number"!=typeof e.b?"b: number expected":null!=e.c&&e.hasOwnProperty("c")&&"number"!=typeof e.c?"c: number expected":null!=e.d&&e.hasOwnProperty("d")&&"number"!=typeof e.d?"d: number expected":null!=e.tx&&e.hasOwnProperty("tx")&&"number"!=typeof e.tx?"tx: number expected":null!=e.ty&&e.hasOwnProperty("ty")&&"number"!=typeof e.ty?"ty: number expected":null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.Transform)return e;let t=new a.com.opensource.svga.Transform;return null!=e.a&&(t.a=Number(e.a)),null!=e.b&&(t.b=Number(e.b)),null!=e.c&&(t.c=Number(e.c)),null!=e.d&&(t.d=Number(e.d)),null!=e.tx&&(t.tx=Number(e.tx)),null!=e.ty&&(t.ty=Number(e.ty)),t},e.toObject=function(e,t){t||(t={});let n={};return t.defaults&&(n.a=0,n.b=0,n.c=0,n.d=0,n.tx=0,n.ty=0),null!=e.a&&e.hasOwnProperty("a")&&(n.a=t.json&&!isFinite(e.a)?String(e.a):e.a),null!=e.b&&e.hasOwnProperty("b")&&(n.b=t.json&&!isFinite(e.b)?String(e.b):e.b),null!=e.c&&e.hasOwnProperty("c")&&(n.c=t.json&&!isFinite(e.c)?String(e.c):e.c),null!=e.d&&e.hasOwnProperty("d")&&(n.d=t.json&&!isFinite(e.d)?String(e.d):e.d),null!=e.tx&&e.hasOwnProperty("tx")&&(n.tx=t.json&&!isFinite(e.tx)?String(e.tx):e.tx),null!=e.ty&&e.hasOwnProperty("ty")&&(n.ty=t.json&&!isFinite(e.ty)?String(e.ty):e.ty),n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.Transform"},e}(),e.ShapeEntity=function(){function e(e){if(e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}let t;var n;return e.prototype.type=0,e.prototype.shape=null,e.prototype.rect=null,e.prototype.ellipse=null,e.prototype.styles=null,e.prototype.transform=null,Object.defineProperty(e.prototype,"args",{get:k(t=["shape","rect","ellipse"]),set:(n=t,function(e){for(var t=0;t<n.length;++t)n[t]!==e&&delete this[n[t]];})}),e.create=function(t){return new e(t)},e.encode=function(e,t){return t||(t=N.create()),null!=e.type&&Object.hasOwn(e,"type")&&t.uint32(8).int32(e.type),null!=e.shape&&Object.hasOwn(e,"shape")&&a.com.opensource.svga.ShapeEntity.ShapeArgs.encode(e.shape,t.uint32(18).fork()).ldelim(),null!=e.rect&&Object.hasOwn(e,"rect")&&a.com.opensource.svga.ShapeEntity.RectArgs.encode(e.rect,t.uint32(26).fork()).ldelim(),null!=e.ellipse&&Object.hasOwn(e,"ellipse")&&a.com.opensource.svga.ShapeEntity.EllipseArgs.encode(e.ellipse,t.uint32(34).fork()).ldelim(),null!=e.styles&&Object.hasOwn(e,"styles")&&a.com.opensource.svga.ShapeEntity.ShapeStyle.encode(e.styles,t.uint32(82).fork()).ldelim(),null!=e.transform&&Object.hasOwn(e,"transform")&&a.com.opensource.svga.Transform.encode(e.transform,t.uint32(90).fork()).ldelim(),t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.ShapeEntity;for(;e.pos<n;){let t=e.uint32();switch(t>>>3){case 1:r.type=e.int32();break;case 2:r.shape=a.com.opensource.svga.ShapeEntity.ShapeArgs.decode(e,e.uint32());break;case 3:r.rect=a.com.opensource.svga.ShapeEntity.RectArgs.decode(e,e.uint32());break;case 4:r.ellipse=a.com.opensource.svga.ShapeEntity.EllipseArgs.decode(e,e.uint32());break;case 10:r.styles=a.com.opensource.svga.ShapeEntity.ShapeStyle.decode(e,e.uint32());break;case 11:r.transform=a.com.opensource.svga.Transform.decode(e,e.uint32());break;default:e.skipType(7&t);}}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){if("object"!=typeof e||null===e)return "object expected";let t={};if(null!=e.type&&e.hasOwnProperty("type"))switch(e.type){default:return "type: enum value expected";case 0:case 1:case 2:case 3:}if(null!=e.shape&&e.hasOwnProperty("shape")){t.args=1;{let t=a.com.opensource.svga.ShapeEntity.ShapeArgs.verify(e.shape);if(t)return "shape."+t}}if(null!=e.rect&&e.hasOwnProperty("rect")){if(1===t.args)return "args: multiple values";t.args=1;{let t=a.com.opensource.svga.ShapeEntity.RectArgs.verify(e.rect);if(t)return "rect."+t}}if(null!=e.ellipse&&e.hasOwnProperty("ellipse")){if(1===t.args)return "args: multiple values";t.args=1;{let t=a.com.opensource.svga.ShapeEntity.EllipseArgs.verify(e.ellipse);if(t)return "ellipse."+t}}if(null!=e.styles&&e.hasOwnProperty("styles")){let t=a.com.opensource.svga.ShapeEntity.ShapeStyle.verify(e.styles);if(t)return "styles."+t}if(null!=e.transform&&e.hasOwnProperty("transform")){let t=a.com.opensource.svga.Transform.verify(e.transform);if(t)return "transform."+t}return null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.ShapeEntity)return e;let t=new a.com.opensource.svga.ShapeEntity;switch(e.type){default:if("number"==typeof e.type){t.type=e.type;break}break;case"SHAPE":case 0:t.type=0;break;case"RECT":case 1:t.type=1;break;case"ELLIPSE":case 2:t.type=2;break;case"KEEP":case 3:t.type=3;}if(null!=e.shape){if("object"!=typeof e.shape)throw TypeError(".com.opensource.svga.ShapeEntity.shape: object expected");t.shape=a.com.opensource.svga.ShapeEntity.ShapeArgs.fromObject(e.shape);}if(null!=e.rect){if("object"!=typeof e.rect)throw TypeError(".com.opensource.svga.ShapeEntity.rect: object expected");t.rect=a.com.opensource.svga.ShapeEntity.RectArgs.fromObject(e.rect);}if(null!=e.ellipse){if("object"!=typeof e.ellipse)throw TypeError(".com.opensource.svga.ShapeEntity.ellipse: object expected");t.ellipse=a.com.opensource.svga.ShapeEntity.EllipseArgs.fromObject(e.ellipse);}if(null!=e.styles){if("object"!=typeof e.styles)throw TypeError(".com.opensource.svga.ShapeEntity.styles: object expected");t.styles=a.com.opensource.svga.ShapeEntity.ShapeStyle.fromObject(e.styles);}if(null!=e.transform){if("object"!=typeof e.transform)throw TypeError(".com.opensource.svga.ShapeEntity.transform: object expected");t.transform=a.com.opensource.svga.Transform.fromObject(e.transform);}return t},e.toObject=function(e,t){t||(t={});let n={};return t.defaults&&(n.type=t.enums===String?"SHAPE":0,n.styles=null,n.transform=null),null!=e.type&&e.hasOwnProperty("type")&&(n.type=t.enums===String?void 0===a.com.opensource.svga.ShapeEntity.ShapeType[e.type]?e.type:a.com.opensource.svga.ShapeEntity.ShapeType[e.type]:e.type),null!=e.shape&&e.hasOwnProperty("shape")&&(n.shape=a.com.opensource.svga.ShapeEntity.ShapeArgs.toObject(e.shape,t),t.oneofs&&(n.args="shape")),null!=e.rect&&e.hasOwnProperty("rect")&&(n.rect=a.com.opensource.svga.ShapeEntity.RectArgs.toObject(e.rect,t),t.oneofs&&(n.args="rect")),null!=e.ellipse&&e.hasOwnProperty("ellipse")&&(n.ellipse=a.com.opensource.svga.ShapeEntity.EllipseArgs.toObject(e.ellipse,t),t.oneofs&&(n.args="ellipse")),null!=e.styles&&e.hasOwnProperty("styles")&&(n.styles=a.com.opensource.svga.ShapeEntity.ShapeStyle.toObject(e.styles,t)),null!=e.transform&&e.hasOwnProperty("transform")&&(n.transform=a.com.opensource.svga.Transform.toObject(e.transform,t)),n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.ShapeEntity"},e.ShapeType=function(){const e={},t=Object.create(e);return t[e[0]="SHAPE"]=0,t[e[1]="RECT"]=1,t[e[2]="ELLIPSE"]=2,t[e[3]="KEEP"]=3,t}(),e.ShapeArgs=function(){function e(e){if(e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.d="",e.create=function(t){return new e(t)},e.encode=function(e,t){return t||(t=N.create()),null!=e.d&&Object.hasOwn(e,"d")&&t.uint32(10).string(e.d),t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.ShapeEntity.ShapeArgs;for(;e.pos<n;){let t=e.uint32();if(t>>>3==1)r.d=e.string();else e.skipType(7&t);}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){return "object"!=typeof e||null===e?"object expected":null!=e.d&&e.hasOwnProperty("d")&&!S(e.d)?"d: string expected":null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.ShapeEntity.ShapeArgs)return e;let t=new a.com.opensource.svga.ShapeEntity.ShapeArgs;return null!=e.d&&(t.d=String(e.d)),t},e.toObject=function(e,t){t||(t={});let n={};return t.defaults&&(n.d=""),null!=e.d&&e.hasOwnProperty("d")&&(n.d=e.d),n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.ShapeEntity.ShapeArgs"},e}(),e.RectArgs=function(){function e(e){if(e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.x=0,e.prototype.y=0,e.prototype.width=0,e.prototype.height=0,e.prototype.cornerRadius=0,e.create=function(t){return new e(t)},e.encode=function(e,t){return t||(t=N.create()),null!=e.x&&Object.hasOwn(e,"x")&&t.uint32(13).float(e.x),null!=e.y&&Object.hasOwn(e,"y")&&t.uint32(21).float(e.y),null!=e.width&&Object.hasOwn(e,"width")&&t.uint32(29).float(e.width),null!=e.height&&Object.hasOwn(e,"height")&&t.uint32(37).float(e.height),null!=e.cornerRadius&&Object.hasOwn(e,"cornerRadius")&&t.uint32(45).float(e.cornerRadius),t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.ShapeEntity.RectArgs;for(;e.pos<n;){let t=e.uint32();switch(t>>>3){case 1:r.x=e.float();break;case 2:r.y=e.float();break;case 3:r.width=e.float();break;case 4:r.height=e.float();break;case 5:r.cornerRadius=e.float();break;default:e.skipType(7&t);}}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){return "object"!=typeof e||null===e?"object expected":null!=e.x&&e.hasOwnProperty("x")&&"number"!=typeof e.x?"x: number expected":null!=e.y&&e.hasOwnProperty("y")&&"number"!=typeof e.y?"y: number expected":null!=e.width&&e.hasOwnProperty("width")&&"number"!=typeof e.width?"width: number expected":null!=e.height&&e.hasOwnProperty("height")&&"number"!=typeof e.height?"height: number expected":null!=e.cornerRadius&&e.hasOwnProperty("cornerRadius")&&"number"!=typeof e.cornerRadius?"cornerRadius: number expected":null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.ShapeEntity.RectArgs)return e;let t=new a.com.opensource.svga.ShapeEntity.RectArgs;return null!=e.x&&(t.x=Number(e.x)),null!=e.y&&(t.y=Number(e.y)),null!=e.width&&(t.width=Number(e.width)),null!=e.height&&(t.height=Number(e.height)),null!=e.cornerRadius&&(t.cornerRadius=Number(e.cornerRadius)),t},e.toObject=function(e,t){t||(t={});let n={};return t.defaults&&(n.x=0,n.y=0,n.width=0,n.height=0,n.cornerRadius=0),null!=e.x&&e.hasOwnProperty("x")&&(n.x=t.json&&!isFinite(e.x)?String(e.x):e.x),null!=e.y&&e.hasOwnProperty("y")&&(n.y=t.json&&!isFinite(e.y)?String(e.y):e.y),null!=e.width&&e.hasOwnProperty("width")&&(n.width=t.json&&!isFinite(e.width)?String(e.width):e.width),null!=e.height&&e.hasOwnProperty("height")&&(n.height=t.json&&!isFinite(e.height)?String(e.height):e.height),null!=e.cornerRadius&&e.hasOwnProperty("cornerRadius")&&(n.cornerRadius=t.json&&!isFinite(e.cornerRadius)?String(e.cornerRadius):e.cornerRadius),n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.ShapeEntity.RectArgs"},e}(),e.EllipseArgs=function(){function e(e){if(e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.x=0,e.prototype.y=0,e.prototype.radiusX=0,e.prototype.radiusY=0,e.create=function(t){return new e(t)},e.encode=function(e,t){return t||(t=N.create()),null!=e.x&&Object.hasOwn(e,"x")&&t.uint32(13).float(e.x),null!=e.y&&Object.hasOwn(e,"y")&&t.uint32(21).float(e.y),null!=e.radiusX&&Object.hasOwn(e,"radiusX")&&t.uint32(29).float(e.radiusX),null!=e.radiusY&&Object.hasOwn(e,"radiusY")&&t.uint32(37).float(e.radiusY),t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.ShapeEntity.EllipseArgs;for(;e.pos<n;){let t=e.uint32();switch(t>>>3){case 1:r.x=e.float();break;case 2:r.y=e.float();break;case 3:r.radiusX=e.float();break;case 4:r.radiusY=e.float();break;default:e.skipType(7&t);}}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){return "object"!=typeof e||null===e?"object expected":null!=e.x&&e.hasOwnProperty("x")&&"number"!=typeof e.x?"x: number expected":null!=e.y&&e.hasOwnProperty("y")&&"number"!=typeof e.y?"y: number expected":null!=e.radiusX&&e.hasOwnProperty("radiusX")&&"number"!=typeof e.radiusX?"radiusX: number expected":null!=e.radiusY&&e.hasOwnProperty("radiusY")&&"number"!=typeof e.radiusY?"radiusY: number expected":null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.ShapeEntity.EllipseArgs)return e;let t=new a.com.opensource.svga.ShapeEntity.EllipseArgs;return null!=e.x&&(t.x=Number(e.x)),null!=e.y&&(t.y=Number(e.y)),null!=e.radiusX&&(t.radiusX=Number(e.radiusX)),null!=e.radiusY&&(t.radiusY=Number(e.radiusY)),t},e.toObject=function(e,t){t||(t={});let n={};return t.defaults&&(n.x=0,n.y=0,n.radiusX=0,n.radiusY=0),null!=e.x&&e.hasOwnProperty("x")&&(n.x=t.json&&!isFinite(e.x)?String(e.x):e.x),null!=e.y&&e.hasOwnProperty("y")&&(n.y=t.json&&!isFinite(e.y)?String(e.y):e.y),null!=e.radiusX&&e.hasOwnProperty("radiusX")&&(n.radiusX=t.json&&!isFinite(e.radiusX)?String(e.radiusX):e.radiusX),null!=e.radiusY&&e.hasOwnProperty("radiusY")&&(n.radiusY=t.json&&!isFinite(e.radiusY)?String(e.radiusY):e.radiusY),n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.ShapeEntity.EllipseArgs"},e}(),e.ShapeStyle=function(){function e(e){if(e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.fill=null,e.prototype.stroke=null,e.prototype.strokeWidth=0,e.prototype.lineCap=0,e.prototype.lineJoin=0,e.prototype.miterLimit=0,e.prototype.lineDashI=0,e.prototype.lineDashII=0,e.prototype.lineDashIII=0,e.create=function(t){return new e(t)},e.encode=function(e,t){return t||(t=N.create()),null!=e.fill&&Object.hasOwn(e,"fill")&&a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.encode(e.fill,t.uint32(10).fork()).ldelim(),null!=e.stroke&&Object.hasOwn(e,"stroke")&&a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.encode(e.stroke,t.uint32(18).fork()).ldelim(),null!=e.strokeWidth&&Object.hasOwn(e,"strokeWidth")&&t.uint32(29).float(e.strokeWidth),null!=e.lineCap&&Object.hasOwn(e,"lineCap")&&t.uint32(32).int32(e.lineCap),null!=e.lineJoin&&Object.hasOwn(e,"lineJoin")&&t.uint32(40).int32(e.lineJoin),null!=e.miterLimit&&Object.hasOwn(e,"miterLimit")&&t.uint32(53).float(e.miterLimit),null!=e.lineDashI&&Object.hasOwn(e,"lineDashI")&&t.uint32(61).float(e.lineDashI),null!=e.lineDashII&&Object.hasOwn(e,"lineDashII")&&t.uint32(69).float(e.lineDashII),null!=e.lineDashIII&&Object.hasOwn(e,"lineDashIII")&&t.uint32(77).float(e.lineDashIII),t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.ShapeEntity.ShapeStyle;for(;e.pos<n;){let t=e.uint32();switch(t>>>3){case 1:r.fill=a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.decode(e,e.uint32());break;case 2:r.stroke=a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.decode(e,e.uint32());break;case 3:r.strokeWidth=e.float();break;case 4:r.lineCap=e.int32();break;case 5:r.lineJoin=e.int32();break;case 6:r.miterLimit=e.float();break;case 7:r.lineDashI=e.float();break;case 8:r.lineDashII=e.float();break;case 9:r.lineDashIII=e.float();break;default:e.skipType(7&t);}}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){if("object"!=typeof e||null===e)return "object expected";if(null!=e.fill&&e.hasOwnProperty("fill")){let t=a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify(e.fill);if(t)return "fill."+t}if(null!=e.stroke&&e.hasOwnProperty("stroke")){let t=a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.verify(e.stroke);if(t)return "stroke."+t}if(null!=e.strokeWidth&&e.hasOwnProperty("strokeWidth")&&"number"!=typeof e.strokeWidth)return "strokeWidth: number expected";if(null!=e.lineCap&&e.hasOwnProperty("lineCap"))switch(e.lineCap){default:return "lineCap: enum value expected";case 0:case 1:case 2:}if(null!=e.lineJoin&&e.hasOwnProperty("lineJoin"))switch(e.lineJoin){default:return "lineJoin: enum value expected";case 0:case 1:case 2:}return null!=e.miterLimit&&e.hasOwnProperty("miterLimit")&&"number"!=typeof e.miterLimit?"miterLimit: number expected":null!=e.lineDashI&&e.hasOwnProperty("lineDashI")&&"number"!=typeof e.lineDashI?"lineDashI: number expected":null!=e.lineDashII&&e.hasOwnProperty("lineDashII")&&"number"!=typeof e.lineDashII?"lineDashII: number expected":null!=e.lineDashIII&&e.hasOwnProperty("lineDashIII")&&"number"!=typeof e.lineDashIII?"lineDashIII: number expected":null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.ShapeEntity.ShapeStyle)return e;let t=new a.com.opensource.svga.ShapeEntity.ShapeStyle;if(null!=e.fill){if("object"!=typeof e.fill)throw TypeError(".com.opensource.svga.ShapeEntity.ShapeStyle.fill: object expected");t.fill=a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.fromObject(e.fill);}if(null!=e.stroke){if("object"!=typeof e.stroke)throw TypeError(".com.opensource.svga.ShapeEntity.ShapeStyle.stroke: object expected");t.stroke=a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.fromObject(e.stroke);}switch(null!=e.strokeWidth&&(t.strokeWidth=Number(e.strokeWidth)),e.lineCap){default:if("number"==typeof e.lineCap){t.lineCap=e.lineCap;break}break;case"LineCap_BUTT":case 0:t.lineCap=0;break;case"LineCap_ROUND":case 1:t.lineCap=1;break;case"LineCap_SQUARE":case 2:t.lineCap=2;}switch(e.lineJoin){default:if("number"==typeof e.lineJoin){t.lineJoin=e.lineJoin;break}break;case"LineJoin_MITER":case 0:t.lineJoin=0;break;case"LineJoin_ROUND":case 1:t.lineJoin=1;break;case"LineJoin_BEVEL":case 2:t.lineJoin=2;}return null!=e.miterLimit&&(t.miterLimit=Number(e.miterLimit)),null!=e.lineDashI&&(t.lineDashI=Number(e.lineDashI)),null!=e.lineDashII&&(t.lineDashII=Number(e.lineDashII)),null!=e.lineDashIII&&(t.lineDashIII=Number(e.lineDashIII)),t},e.toObject=function(e,t){t||(t={});let n={};return t.defaults&&(n.fill=null,n.stroke=null,n.strokeWidth=0,n.lineCap=t.enums===String?"LineCap_BUTT":0,n.lineJoin=t.enums===String?"LineJoin_MITER":0,n.miterLimit=0,n.lineDashI=0,n.lineDashII=0,n.lineDashIII=0),null!=e.fill&&e.hasOwnProperty("fill")&&(n.fill=a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.toObject(e.fill,t)),null!=e.stroke&&e.hasOwnProperty("stroke")&&(n.stroke=a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor.toObject(e.stroke,t)),null!=e.strokeWidth&&e.hasOwnProperty("strokeWidth")&&(n.strokeWidth=t.json&&!isFinite(e.strokeWidth)?String(e.strokeWidth):e.strokeWidth),null!=e.lineCap&&e.hasOwnProperty("lineCap")&&(n.lineCap=t.enums===String?void 0===a.com.opensource.svga.ShapeEntity.ShapeStyle.LineCap[e.lineCap]?e.lineCap:a.com.opensource.svga.ShapeEntity.ShapeStyle.LineCap[e.lineCap]:e.lineCap),null!=e.lineJoin&&e.hasOwnProperty("lineJoin")&&(n.lineJoin=t.enums===String?void 0===a.com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin[e.lineJoin]?e.lineJoin:a.com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin[e.lineJoin]:e.lineJoin),null!=e.miterLimit&&e.hasOwnProperty("miterLimit")&&(n.miterLimit=t.json&&!isFinite(e.miterLimit)?String(e.miterLimit):e.miterLimit),null!=e.lineDashI&&e.hasOwnProperty("lineDashI")&&(n.lineDashI=t.json&&!isFinite(e.lineDashI)?String(e.lineDashI):e.lineDashI),null!=e.lineDashII&&e.hasOwnProperty("lineDashII")&&(n.lineDashII=t.json&&!isFinite(e.lineDashII)?String(e.lineDashII):e.lineDashII),null!=e.lineDashIII&&e.hasOwnProperty("lineDashIII")&&(n.lineDashIII=t.json&&!isFinite(e.lineDashIII)?String(e.lineDashIII):e.lineDashIII),n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.ShapeEntity.ShapeStyle"},e.RGBAColor=function(){function e(e){if(e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.r=0,e.prototype.g=0,e.prototype.b=0,e.prototype.a=0,e.create=function(t){return new e(t)},e.encode=function(e,t){return t||(t=N.create()),null!=e.r&&Object.hasOwn(e,"r")&&t.uint32(13).float(e.r),null!=e.g&&Object.hasOwn(e,"g")&&t.uint32(21).float(e.g),null!=e.b&&Object.hasOwn(e,"b")&&t.uint32(29).float(e.b),null!=e.a&&Object.hasOwn(e,"a")&&t.uint32(37).float(e.a),t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor;for(;e.pos<n;){let t=e.uint32();switch(t>>>3){case 1:r.r=e.float();break;case 2:r.g=e.float();break;case 3:r.b=e.float();break;case 4:r.a=e.float();break;default:e.skipType(7&t);}}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){return "object"!=typeof e||null===e?"object expected":null!=e.r&&e.hasOwnProperty("r")&&"number"!=typeof e.r?"r: number expected":null!=e.g&&e.hasOwnProperty("g")&&"number"!=typeof e.g?"g: number expected":null!=e.b&&e.hasOwnProperty("b")&&"number"!=typeof e.b?"b: number expected":null!=e.a&&e.hasOwnProperty("a")&&"number"!=typeof e.a?"a: number expected":null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor)return e;let t=new a.com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor;return null!=e.r&&(t.r=Number(e.r)),null!=e.g&&(t.g=Number(e.g)),null!=e.b&&(t.b=Number(e.b)),null!=e.a&&(t.a=Number(e.a)),t},e.toObject=function(e,t){t||(t={});let n={};return t.defaults&&(n.r=0,n.g=0,n.b=0,n.a=0),null!=e.r&&e.hasOwnProperty("r")&&(n.r=t.json&&!isFinite(e.r)?String(e.r):e.r),null!=e.g&&e.hasOwnProperty("g")&&(n.g=t.json&&!isFinite(e.g)?String(e.g):e.g),null!=e.b&&e.hasOwnProperty("b")&&(n.b=t.json&&!isFinite(e.b)?String(e.b):e.b),null!=e.a&&e.hasOwnProperty("a")&&(n.a=t.json&&!isFinite(e.a)?String(e.a):e.a),n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor"},e}(),e.LineCap=function(){const e={},t=Object.create(e);return t[e[0]="LineCap_BUTT"]=0,t[e[1]="LineCap_ROUND"]=1,t[e[2]="LineCap_SQUARE"]=2,t}(),e.LineJoin=function(){const e={},t=Object.create(e);return t[e[0]="LineJoin_MITER"]=0,t[e[1]="LineJoin_ROUND"]=1,t[e[2]="LineJoin_BEVEL"]=2,t}(),e}(),e}(),e.FrameEntity=function(){function e(e){if(this.shapes=[],e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.alpha=0,e.prototype.layout=null,e.prototype.transform=null,e.prototype.clipPath="",e.prototype.shapes=x,e.create=function(t){return new e(t)},e.encode=function(e,t){if(t||(t=N.create()),null!=e.alpha&&Object.hasOwn(e,"alpha")&&t.uint32(13).float(e.alpha),null!=e.layout&&Object.hasOwn(e,"layout")&&a.com.opensource.svga.Layout.encode(e.layout,t.uint32(18).fork()).ldelim(),null!=e.transform&&Object.hasOwn(e,"transform")&&a.com.opensource.svga.Transform.encode(e.transform,t.uint32(26).fork()).ldelim(),null!=e.clipPath&&Object.hasOwn(e,"clipPath")&&t.uint32(34).string(e.clipPath),null!=e.shapes&&e.shapes.length)for(let n=0;n<e.shapes.length;++n)a.com.opensource.svga.ShapeEntity.encode(e.shapes[n],t.uint32(42).fork()).ldelim();return t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n=void 0===t?e.len:e.pos+t,r=new a.com.opensource.svga.FrameEntity;for(;e.pos<n;){let t=e.uint32();switch(t>>>3){case 1:r.alpha=e.float();break;case 2:r.layout=a.com.opensource.svga.Layout.decode(e,e.uint32());break;case 3:r.transform=a.com.opensource.svga.Transform.decode(e,e.uint32());break;case 4:r.clipPath=e.string();break;case 5:r.shapes&&r.shapes.length||(r.shapes=[]),r.shapes.push(a.com.opensource.svga.ShapeEntity.decode(e,e.uint32()));break;default:e.skipType(7&t);}}return r},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){if("object"!=typeof e||null===e)return "object expected";if(null!=e.alpha&&e.hasOwnProperty("alpha")&&"number"!=typeof e.alpha)return "alpha: number expected";if(null!=e.layout&&e.hasOwnProperty("layout")){let t=a.com.opensource.svga.Layout.verify(e.layout);if(t)return "layout."+t}if(null!=e.transform&&e.hasOwnProperty("transform")){let t=a.com.opensource.svga.Transform.verify(e.transform);if(t)return "transform."+t}if(null!=e.clipPath&&e.hasOwnProperty("clipPath")&&!S(e.clipPath))return "clipPath: string expected";if(null!=e.shapes&&e.hasOwnProperty("shapes")){if(!Array.isArray(e.shapes))return "shapes: array expected";for(let t=0;t<e.shapes.length;++t){let n=a.com.opensource.svga.ShapeEntity.verify(e.shapes[t]);if(n)return "shapes."+n}}return null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.FrameEntity)return e;let t=new a.com.opensource.svga.FrameEntity;if(null!=e.alpha&&(t.alpha=Number(e.alpha)),null!=e.layout){if("object"!=typeof e.layout)throw TypeError(".com.opensource.svga.FrameEntity.layout: object expected");t.layout=a.com.opensource.svga.Layout.fromObject(e.layout);}if(null!=e.transform){if("object"!=typeof e.transform)throw TypeError(".com.opensource.svga.FrameEntity.transform: object expected");t.transform=a.com.opensource.svga.Transform.fromObject(e.transform);}if(null!=e.clipPath&&(t.clipPath=String(e.clipPath)),e.shapes){if(!Array.isArray(e.shapes))throw TypeError(".com.opensource.svga.FrameEntity.shapes: array expected");t.shapes=[];for(let n=0;n<e.shapes.length;++n){if("object"!=typeof e.shapes[n])throw TypeError(".com.opensource.svga.FrameEntity.shapes: object expected");t.shapes[n]=a.com.opensource.svga.ShapeEntity.fromObject(e.shapes[n]);}}return t},e.toObject=function(e,t){t||(t={});let n={};if((t.arrays||t.defaults)&&(n.shapes=[]),t.defaults&&(n.alpha=0,n.layout=null,n.transform=null,n.clipPath=""),null!=e.alpha&&e.hasOwnProperty("alpha")&&(n.alpha=t.json&&!isFinite(e.alpha)?String(e.alpha):e.alpha),null!=e.layout&&e.hasOwnProperty("layout")&&(n.layout=a.com.opensource.svga.Layout.toObject(e.layout,t)),null!=e.transform&&e.hasOwnProperty("transform")&&(n.transform=a.com.opensource.svga.Transform.toObject(e.transform,t)),null!=e.clipPath&&e.hasOwnProperty("clipPath")&&(n.clipPath=e.clipPath),e.shapes&&e.shapes.length){n.shapes=[];for(let r=0;r<e.shapes.length;++r)n.shapes[r]=a.com.opensource.svga.ShapeEntity.toObject(e.shapes[r],t);}return n},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.FrameEntity"},e}(),e.MovieEntity=function(){function e(e){if(this.images={},this.sprites=[],e)for(let t=Object.keys(e),n=0;n<t.length;++n)null!=e[t[n]]&&(this[t[n]]=e[t[n]]);}return e.prototype.version="",e.prototype.params=null,e.prototype.images=E,e.prototype.sprites=x,e.create=function(t){return new e(t)},e.encode=function(e,t){if(t||(t=N.create()),null!=e.version&&Object.hasOwn(e,"version")&&t.uint32(10).string(e.version),null!=e.params&&Object.hasOwn(e,"params")&&a.com.opensource.svga.MovieParams.encode(e.params,t.uint32(18).fork()).ldelim(),null!=e.images&&Object.hasOwn(e,"images"))for(let n=Object.keys(e.images),r=0;r<n.length;++r)t.uint32(26).fork().uint32(10).string(n[r]).uint32(18).bytes(e.images[n[r]]).ldelim();if(null!=e.sprites&&e.sprites.length)for(let n=0;n<e.sprites.length;++n)a.com.opensource.svga.SpriteEntity.encode(e.sprites[n],t.uint32(34).fork()).ldelim();return t},e.encodeDelimited=function(e,t){return this.encode(e,t).ldelim()},e.decode=function(e,t){e instanceof T||(e=T.create(e));let n,r,i=void 0===t?e.len:e.pos+t,o=new a.com.opensource.svga.MovieEntity;for(;e.pos<i;){let t=e.uint32();switch(t>>>3){case 1:o.version=e.string();break;case 2:o.params=a.com.opensource.svga.MovieParams.decode(e,e.uint32());break;case 3:{o.images===E&&(o.images={});let t=e.uint32()+e.pos;for(n="",r=[];e.pos<t;){let t=e.uint32();switch(t>>>3){case 1:n=e.string();break;case 2:r=e.bytes();break;default:e.skipType(7&t);}}o.images[n]=r;break}case 4:o.sprites&&o.sprites.length||(o.sprites=[]),o.sprites.push(a.com.opensource.svga.SpriteEntity.decode(e,e.uint32()));break;default:e.skipType(7&t);}}return o},e.decodeDelimited=function(e){return e instanceof T||(e=new T(e)),this.decode(e,e.uint32())},e.verify=function(e){if("object"!=typeof e||null===e)return "object expected";if(null!=e.version&&e.hasOwnProperty("version")&&!S(e.version))return "version: string expected";if(null!=e.params&&e.hasOwnProperty("params")){let t=a.com.opensource.svga.MovieParams.verify(e.params);if(t)return "params."+t}if(null!=e.images&&e.hasOwnProperty("images")){if(!isObject(e.images))return "images: object expected";let t=Object.keys(e.images);for(let n=0;n<t.length;++n)if(!(e.images[t[n]]&&"number"==typeof e.images[t[n]].length||S(e.images[t[n]])))return "images: buffer{k:string} expected"}if(null!=e.sprites&&e.hasOwnProperty("sprites")){if(!Array.isArray(e.sprites))return "sprites: array expected";for(let t=0;t<e.sprites.length;++t){let n=a.com.opensource.svga.SpriteEntity.verify(e.sprites[t]);if(n)return "sprites."+n}}return null},e.fromObject=function(e){if(e instanceof a.com.opensource.svga.MovieEntity)return e;let t=new a.com.opensource.svga.MovieEntity;if(null!=e.version&&(t.version=String(e.version)),null!=e.params){if("object"!=typeof e.params)throw TypeError(".com.opensource.svga.MovieEntity.params: object expected");t.params=a.com.opensource.svga.MovieParams.fromObject(e.params);}if(e.images){if("object"!=typeof e.images)throw TypeError(".com.opensource.svga.MovieEntity.images: object expected");t.images={};for(let n=Object.keys(e.images),r=0;r<n.length;++r)"string"==typeof e.images[n[r]]?s.decode(e.images[n[r]],t.images[n[r]]=newBuffer(s.length(e.images[n[r]])),0):e.images[n[r]].length>=0&&(t.images[n[r]]=e.images[n[r]]);}if(e.sprites){if(!Array.isArray(e.sprites))throw TypeError(".com.opensource.svga.MovieEntity.sprites: array expected");t.sprites=[];for(let n=0;n<e.sprites.length;++n){if("object"!=typeof e.sprites[n])throw TypeError(".com.opensource.svga.MovieEntity.sprites: object expected");t.sprites[n]=a.com.opensource.svga.SpriteEntity.fromObject(e.sprites[n]);}}return t},e.toObject=function(e,t){t||(t={});let n,r={};if((t.arrays||t.defaults)&&(r.sprites=[]),(t.objects||t.defaults)&&(r.images={}),t.defaults&&(r.version="",r.params=null),null!=e.version&&e.hasOwnProperty("version")&&(r.version=e.version),null!=e.params&&e.hasOwnProperty("params")&&(r.params=a.com.opensource.svga.MovieParams.toObject(e.params,t)),e.images&&(n=Object.keys(e.images)).length){r.images={};for(let i=0;i<n.length;++i)r.images[n[i]]=t.bytes===String?s.encode(e.images[n[i]],0,e.images[n[i]].length):t.bytes===Array?Array.prototype.slice.call(e.images[n[i]]):e.images[n[i]];}if(e.sprites&&e.sprites.length){r.sprites=[];for(let n=0;n<e.sprites.length;++n)r.sprites[n]=a.com.opensource.svga.SpriteEntity.toObject(e.sprites[n],t);}return r},e.prototype.toJSON=function(){return this.constructor.toObject(this,$protobuf.util.toJSONOptions)},e.getTypeUrl=function(e){return void 0===e&&(e="type.googleapis.com"),e+"/com.opensource.svga.MovieEntity"},e}(),e}(),e}(),e})(),F=C.opensource.svga.MovieEntity;

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
        const movieData = F.decode(inflateData);
        return new VideoEntity(movieData);
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
    debugger
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
        console.log('drawFrame', width, height, imageData);
        context.putImageData(imageData, 0, 0, 0, 0, ofsCanvas.width, ofsCanvas.height);
    }
}

export { Parser, Player };
//# sourceMappingURL=index.js.map
