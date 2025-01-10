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
    if ((d[1] >> 5 & 1) == 1)
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
    return inflt(data.subarray(zls(data), -4), { i: 2 }, opts, opts);
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

function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var t,s;var i,n=e(function(){if(s)return t;function e(e){return "undefined"!=typeof Float32Array?function(){var t=new Float32Array([-0]),s=new Uint8Array(t.buffer),i=128===s[3];function n(e,i,n){t[0]=e,i[n]=s[0],i[n+1]=s[1],i[n+2]=s[2],i[n+3]=s[3];}function a(e,i,n){t[0]=e,i[n]=s[3],i[n+1]=s[2],i[n+2]=s[1],i[n+3]=s[0];}function r(e,i){return s[0]=e[i],s[1]=e[i+1],s[2]=e[i+2],s[3]=e[i+3],t[0]}function l(e,i){return s[3]=e[i],s[2]=e[i+1],s[1]=e[i+2],s[0]=e[i+3],t[0]}e.writeFloatLE=i?n:a,e.writeFloatBE=i?a:n,e.readFloatLE=i?r:l,e.readFloatBE=i?l:r;}():function(){function t(e,t,s,i){var n=t<0?1:0;if(n&&(t=-t),0===t)e(1/t>0?0:2147483648,s,i);else if(isNaN(t))e(2143289344,s,i);else if(t>34028234663852886e22)e((n<<31|2139095040)>>>0,s,i);else if(t<11754943508222875e-54)e((n<<31|Math.round(t/1401298464324817e-60))>>>0,s,i);else {var a=Math.floor(Math.log(t)/Math.LN2);e((n<<31|a+127<<23|8388607&Math.round(t*Math.pow(2,-a)*8388608))>>>0,s,i);}}function s(e,t,s){var i=e(t,s),n=2*(i>>31)+1,a=i>>>23&255,r=8388607&i;return 255===a?r?NaN:n*(1/0):0===a?1401298464324817e-60*n*r:n*Math.pow(2,a-150)*(r+8388608)}e.writeFloatLE=t.bind(null,i),e.writeFloatBE=t.bind(null,n),e.readFloatLE=s.bind(null,a),e.readFloatBE=s.bind(null,r);}(),"undefined"!=typeof Float64Array?function(){var t=new Float64Array([-0]),s=new Uint8Array(t.buffer),i=128===s[7];function n(e,i,n){t[0]=e,i[n]=s[0],i[n+1]=s[1],i[n+2]=s[2],i[n+3]=s[3],i[n+4]=s[4],i[n+5]=s[5],i[n+6]=s[6],i[n+7]=s[7];}function a(e,i,n){t[0]=e,i[n]=s[7],i[n+1]=s[6],i[n+2]=s[5],i[n+3]=s[4],i[n+4]=s[3],i[n+5]=s[2],i[n+6]=s[1],i[n+7]=s[0];}function r(e,i){return s[0]=e[i],s[1]=e[i+1],s[2]=e[i+2],s[3]=e[i+3],s[4]=e[i+4],s[5]=e[i+5],s[6]=e[i+6],s[7]=e[i+7],t[0]}function l(e,i){return s[7]=e[i],s[6]=e[i+1],s[5]=e[i+2],s[4]=e[i+3],s[3]=e[i+4],s[2]=e[i+5],s[1]=e[i+6],s[0]=e[i+7],t[0]}e.writeDoubleLE=i?n:a,e.writeDoubleBE=i?a:n,e.readDoubleLE=i?r:l,e.readDoubleBE=i?l:r;}():function(){function t(e,t,s,i,n,a){var r=i<0?1:0;if(r&&(i=-i),0===i)e(0,n,a+t),e(1/i>0?0:2147483648,n,a+s);else if(isNaN(i))e(0,n,a+t),e(2146959360,n,a+s);else if(i>17976931348623157e292)e(0,n,a+t),e((r<<31|2146435072)>>>0,n,a+s);else {var l;if(i<22250738585072014e-324)e((l=i/5e-324)>>>0,n,a+t),e((r<<31|l/4294967296)>>>0,n,a+s);else {var o=Math.floor(Math.log(i)/Math.LN2);1024===o&&(o=1023),e(4503599627370496*(l=i*Math.pow(2,-o))>>>0,n,a+t),e((r<<31|o+1023<<20|1048576*l&1048575)>>>0,n,a+s);}}}function s(e,t,s,i,n){var a=e(i,n+t),r=e(i,n+s),l=2*(r>>31)+1,o=r>>>20&2047,c=4294967296*(1048575&r)+a;return 2047===o?c?NaN:l*(1/0):0===o?5e-324*l*c:l*Math.pow(2,o-1075)*(c+4503599627370496)}e.writeDoubleLE=t.bind(null,i,0,4),e.writeDoubleBE=t.bind(null,n,4,0),e.readDoubleLE=s.bind(null,a,0,4),e.readDoubleBE=s.bind(null,r,4,0);}(),e}function i(e,t,s){t[s]=255&e,t[s+1]=e>>>8&255,t[s+2]=e>>>16&255,t[s+3]=e>>>24;}function n(e,t,s){t[s]=e>>>24,t[s+1]=e>>>16&255,t[s+2]=e>>>8&255,t[s+3]=255&e;}function a(e,t){return (e[t]|e[t+1]<<8|e[t+2]<<16|e[t+3]<<24)>>>0}function r(e,t){return (e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3])>>>0}return s=1,t=e(e)}()),a={};var r=(i||(i=1,function(){var e=a;e.length=function(e){for(var t=0,s=0,i=0;i<e.length;++i)(s=e.charCodeAt(i))<128?t+=1:s<2048?t+=2:55296==(64512&s)&&56320==(64512&e.charCodeAt(i+1))?(++i,t+=4):t+=3;return t},e.read=function(e,t,s){if(s-t<1)return "";for(var i,n=null,a=[],r=0;t<s;)(i=e[t++])<128?a[r++]=i:i>191&&i<224?a[r++]=(31&i)<<6|63&e[t++]:i>239&&i<365?(i=((7&i)<<18|(63&e[t++])<<12|(63&e[t++])<<6|63&e[t++])-65536,a[r++]=55296+(i>>10),a[r++]=56320+(1023&i)):a[r++]=(15&i)<<12|(63&e[t++])<<6|63&e[t++],r>8191&&((n||(n=[])).push(String.fromCharCode.apply(String,a)),r=0);return n?(r&&n.push(String.fromCharCode.apply(String,a.slice(0,r))),n.join("")):String.fromCharCode.apply(String,a.slice(0,r))},e.write=function(e,t,s){for(var i,n,a=s,r=0;r<e.length;++r)(i=e.charCodeAt(r))<128?t[s++]=i:i<2048?(t[s++]=i>>6|192,t[s++]=63&i|128):55296==(64512&i)&&56320==(64512&(n=e.charCodeAt(r+1)))?(i=65536+((1023&i)<<10)+(1023&n),++r,t[s++]=i>>18|240,t[s++]=i>>12&63|128,t[s++]=i>>6&63|128,t[s++]=63&i|128):(t[s++]=i>>12|224,t[s++]=i>>6&63|128,t[s++]=63&i|128);return s-a};}()),a),l=e(r);class o{static create(e){if(e instanceof Uint8Array)return new o(e);throw Error("illegal buffer")}buf;pos;len;constructor(e){this.buf=e,this.pos=0,this.len=e.length;}slice(e,t,s){return e.subarray(t,s)}indexOutOfRange(e,t){return RangeError("index out of range: "+e.pos+" + "+(t||1)+" > "+e.len)}uint32(){let e=4294967295;if(e=(127&this.buf[this.pos])>>>0,this.buf[this.pos++]<128)return e;if(e=(e|(127&this.buf[this.pos])<<7)>>>0,this.buf[this.pos++]<128)return e;if(e=(e|(127&this.buf[this.pos])<<14)>>>0,this.buf[this.pos++]<128)return e;if(e=(e|(127&this.buf[this.pos])<<21)>>>0,this.buf[this.pos++]<128)return e;if(e=(e|(15&this.buf[this.pos])<<28)>>>0,this.buf[this.pos++]<128)return e;if((this.pos+=5)>this.len)throw this.pos=this.len,this.indexOutOfRange(this,10);return e}int32(){return 0|this.uint32()}float(){if(this.pos+4>this.len)throw this.indexOutOfRange(this,4);const e=n.readFloatLE(this.buf,this.pos);return this.pos+=4,e}bytes(){const e=this.uint32(),t=this.pos,s=this.pos+e;if(s>this.len)throw this.indexOutOfRange(this,e);return this.pos+=e,t===s?new Uint8Array(0):this.slice(this.buf,t,s)}string(){const e=this.bytes();return l.read(e,0,e.length)}skip(e){if("number"==typeof e){if(this.pos+e>this.len)throw this.indexOutOfRange(this,e);this.pos+=e;}else do{if(this.pos>=this.len)throw this.indexOutOfRange(this)}while(128&this.buf[this.pos++]);return this}skipType(e){switch(e){case 0:this.skip();break;case 1:this.skip(8);break;case 2:this.skip(this.uint32());break;case 3:for(;4!=(e=7&this.uint32());)this.skipType(e);break;case 5:this.skip(4);break;default:throw Error("invalid wire type "+e+" at offset "+this.pos)}return this}}class c{static decode(e,t){e instanceof o||(e=o.create(e));const s=undefined===t?e.len:e.pos+t,i=new u;for(;e.pos<s;){const t=e.uint32();switch(t>>>3){case 1:i.x=e.float();break;case 2:i.y=e.float();break;case 3:i.width=e.float();break;case 4:i.height=e.float();break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class u{static create(e){return new u(e)}x=0;y=0;width=0;height=0;constructor(e){e&&(null!=e.x&&(this.x=e.x),null!=e.y&&(this.y=e.y),null!=e.width&&(this.width=e.width),null!=e.height&&(this.height=e.height));}}class h{static decode(e,t){e instanceof o||(e=o.create(e));let s=undefined===t?e.len:e.pos+t,i=new d;for(;e.pos<s;){let t=e.uint32();switch(t>>>3){case 1:i.a=e.float();break;case 2:i.b=e.float();break;case 3:i.c=e.float();break;case 4:i.d=e.float();break;case 5:i.tx=e.float();break;case 6:i.ty=e.float();break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class d{static create(e){return new d(e)}a=0;b=0;c=0;d=0;tx=0;ty=0;constructor(e){e&&(null!=e.a&&(this.a=e.a),null!=e.b&&(this.b=e.b),null!=e.c&&(this.c=e.c),null!=e.d&&(this.d=e.d),null!=e.tx&&(this.tx=e.tx),null!=e.ty&&(this.ty=e.ty));}}class f{static decode(e,t){e instanceof o||(e=o.create(e));const s=undefined===t?e.len:e.pos+t,i=new p;for(;e.pos<s;){const t=e.uint32();if(t>>>3==1)i.d=e.string();else e.skipType(7&t);}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class p{static create(e){return new p(e)}d="";constructor(e){e&&null!=e.d&&(this.d=e.d);}}class b{static decode(e,t){e instanceof o||(e=o.create(e));const s=undefined===t?e.len:e.pos+t,i=new w;for(;e.pos<s;){const t=e.uint32();switch(t>>>3){case 1:i.x=e.float();break;case 2:i.y=e.float();break;case 3:i.width=e.float();break;case 4:i.height=e.float();break;case 5:i.cornerRadius=e.float();break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class w{static create(e){return new w(e)}x=0;y=0;width=0;height=0;cornerRadius=0;constructor(e){e&&(null!=e.x&&(this.x=e.x),null!=e.y&&(this.y=e.y),null!=e.width&&(this.width=e.width),null!=e.height&&(this.height=e.height),null!=e.cornerRadius&&(this.cornerRadius=e.cornerRadius));}}class k{static decode(e,t){e instanceof o||(e=o.create(e));const s=undefined===t?e.len:e.pos+t,i=new y;for(;e.pos<s;){const t=e.uint32();switch(t>>>3){case 1:i.x=e.float();break;case 2:i.y=e.float();break;case 3:i.radiusX=e.float();break;case 4:i.radiusY=e.float();break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class y{static create(e){return new y(e)}x=0;y=0;radiusX=0;radiusY=0;constructor(e){e&&(null!=e.x&&(this.x=e.x),null!=e.y&&(this.y=e.y),null!=e.radiusX&&(this.radiusX=e.radiusX),null!=e.radiusY&&(this.radiusY=e.radiusY));}}class m{static decode(e,t){e instanceof o||(e=o.create(e));const s=undefined===t?e.len:e.pos+t,i=new g;for(;e.pos<s;){const t=e.uint32();switch(t>>>3){case 1:i.r=e.float();break;case 2:i.g=e.float();break;case 3:i.b=e.float();break;case 4:i.a=e.float();break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class g{static create(e){return new g(e)}r=0;g=0;b=0;a=0;constructor(e){e&&(null!=e.r&&(this.r=e.r),null!=e.g&&(this.g=e.g),null!=e.b&&(this.b=e.b),null!=e.a&&(this.a=e.a));}}class v{static decode(e,t){e instanceof o||(e=o.create(e));const s=undefined===t?e.len:e.pos+t,i=new x;for(;e.pos<s;){const t=e.uint32();switch(t>>>3){case 1:i.fill=m.decode(e,e.uint32());break;case 2:i.stroke=m.decode(e,e.uint32());break;case 3:i.strokeWidth=e.float();break;case 4:i.lineCap=e.int32();break;case 5:i.lineJoin=e.int32();break;case 6:i.miterLimit=e.float();break;case 7:i.lineDashI=e.float();break;case 8:i.lineDashII=e.float();break;case 9:i.lineDashIII=e.float();break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class x{static create(e){return new x(e)}fill=null;stroke=null;strokeWidth=0;lineCap=0;lineJoin=0;miterLimit=0;lineDashI=0;lineDashII=0;lineDashIII=0;constructor(e){e&&(null!=e.fill&&(this.fill=e.fill),null!=e.lineCap&&(this.lineCap=e.lineCap),null!=e.lineDashI&&(this.lineDashI=e.lineDashI),null!=e.lineDashII&&(this.lineDashII=e.lineDashII),null!=e.lineDashIII&&(this.lineDashIII=e.lineDashIII),null!=e.lineJoin&&(this.lineJoin=e.lineJoin),null!=e.miterLimit&&(this.miterLimit=e.miterLimit),null!=e.stroke&&(this.stroke=e.stroke),null!=e.strokeWidth&&(this.strokeWidth=e.strokeWidth));}}class D{static decode(e,t){e instanceof o||(e=o.create(e));const s=undefined===t?e.len:e.pos+t,i=new I;for(;e.pos<s;){let t=e.uint32();switch(t>>>3){case 1:i.type=e.int32();break;case 2:i.shape=f.decode(e,e.uint32());break;case 3:i.rect=b.decode(e,e.uint32());break;case 4:i.ellipse=k.decode(e,e.uint32());break;case 10:i.styles=v.decode(e,e.uint32());break;case 11:i.transform=h.decode(e,e.uint32());break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class I{static create(e){return new I(e)}type=0;shape=null;rect=null;ellipse=null;styles=null;transform=null;$oneOfFields=["shape","rect","ellipse"];$fieldMap={};get args(){const e=Object.keys(this);for(let t=e.length-1;t>-1;--t){const s=e[t],i=this[s];if(1===this.$fieldMap[s]&&null!=i)return s}return ""}set args(e){for(var t=0;t<this.$oneOfFields.length;++t){const s=this.$oneOfFields[t];s!==e&&delete this[s];}}constructor(e){e&&(null!=e.type&&(this.type=e.type),null!=e.ellipse&&(this.ellipse=e.ellipse),null!=e.rect&&(this.rect=e.rect),null!=e.shape&&(this.shape=e.shape),null!=e.styles&&(this.styles=e.styles),null!=e.transform&&(this.transform=e.transform));for(var t=0;t<this.$oneOfFields.length;++t)this.$fieldMap[this.$oneOfFields[t]]=1;}}class O{static decode(e,t){e instanceof o||(e=o.create(e));const s=undefined===t?e.len:e.pos+t,i=new E;for(;e.pos<s;){const t=e.uint32();switch(t>>>3){case 1:i.alpha=e.float();break;case 2:i.layout=c.decode(e,e.uint32());break;case 3:i.transform=h.decode(e,e.uint32());break;case 4:i.clipPath=e.string();break;case 5:i.shapes&&i.shapes.length||(i.shapes=[]),i.shapes.push(D.decode(e,e.uint32()));break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class E{static create(e){return new E(e)}shapes=[];alpha=0;layout=null;transform=null;clipPath="";constructor(e){e&&(null!=e.alpha&&(this.alpha=e.alpha),null!=e.clipPath&&(this.clipPath=e.clipPath),null!=e.layout&&(this.layout=e.layout),null!=e.shapes&&(this.shapes=e.shapes),null!=e.transform&&(this.transform=e.transform));}}class B{static decode(e,t){e instanceof o||(e=o.create(e));const s=undefined===t?e.len:e.pos+t,i=new F;for(;e.pos<s;){const t=e.uint32();switch(t>>>3){case 1:i.imageKey=e.string();break;case 2:i.frames&&i.frames.length||(i.frames=[]),i.frames.push(O.decode(e,e.uint32()));break;case 3:i.matteKey=e.string();break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class F{static create(e){return new F(e)}frames=[];imageKey="";matteKey="";constructor(e){e&&(null!=e.frames&&(this.frames=e.frames),null!=e.imageKey&&(this.imageKey=e.imageKey),null!=e.matteKey&&(this.matteKey=e.matteKey));}}class L{static decode(e,t){e instanceof o||(e=o.create(e));let s=undefined===t?e.len:e.pos+t,i=new M;for(;e.pos<s;){let t=e.uint32();switch(t>>>3){case 1:i.viewBoxWidth=e.float();break;case 2:i.viewBoxHeight=e.float();break;case 3:i.fps=e.int32();break;case 4:i.frames=e.int32();break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class M{static create(e){return new M(e)}viewBoxWidth=0;viewBoxHeight=0;fps=0;frames=0;constructor(e){e&&(null!=e.viewBoxWidth&&(this.viewBoxWidth=e.viewBoxWidth),null!=e.viewBoxHeight&&(this.viewBoxHeight=e.viewBoxHeight),null!=e.fps&&(this.fps=e.fps),null!=e.frames&&(this.frames=e.frames));}}const C=Object.freeze({});class T{static decode(e,t){e instanceof o||(e=o.create(e));const s=undefined===t?e.len:e.pos+t,i=new A;let n,a;for(;e.pos<s;){const t=e.uint32();switch(t>>>3){case 1:i.version=e.string();break;case 2:i.params=L.decode(e,e.uint32());break;case 3:{i.images===C&&(i.images={});const t=e.uint32()+e.pos;for(n="",a=[];e.pos<t;){let t=e.uint32();switch(t>>>3){case 1:n=e.string();break;case 2:a=e.bytes();break;default:e.skipType(7&t);}}i.images[n]=a;break}case 4:i.sprites&&i.sprites.length||(i.sprites=[]),i.sprites.push(B.decode(e,e.uint32()));break;default:e.skipType(7&t);}}return i}static decodeDelimited(e){return e instanceof o||(e=new o(e)),this.decode(e,e.uint32())}}class A{static create(e){return new A(e)}version="";params=null;images=C;sprites=[];constructor(e){e&&(null!=e.version&&(this.version=e.version),null!=e.images&&(this.images=e.images),null!=e.params&&(this.params=e.params),null!=e.sprites&&(this.sprites=e.sprites));}}

/**
 * Supported Platform
 * 目前已支持微信小程序、支付宝小程序、抖音小程序、H5
 */
const SP = {
    WECHAT: 1,
    ALIPAY: 2,
    DOUYIN: 3,
    H5: 4
};
let platform;
// FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
if (typeof tt !== "undefined") {
    platform = SP.DOUYIN;
}
else if (typeof my !== "undefined") {
    platform = SP.ALIPAY;
}
else if (typeof wx !== "undefined") {
    platform = SP.WECHAT;
}
else if (typeof window !== "undefined") {
    platform = SP.H5;
}
else {
    throw new Error("Unsupported platform");
}

let bridge = null;
if (platform === SP.WECHAT) {
    bridge = wx;
}
else if (platform === SP.H5) {
    bridge = window;
}
else if (platform === SP.ALIPAY) {
    bridge = my;
}
else if (platform === SP.DOUYIN) {
    bridge = tt;
}
var bridge$1 = bridge;

/**
 * 读取远程文件
 * @param url 文件资源地址
 * @returns
 */
function readRemoteFile(url) {
    // H5环境
    if (platform === SP.H5) {
        return fetch(url, {
            cache: "no-cache",
        }).then((response) => {
            if (response.ok) {
                return response.arrayBuffer();
            }
            else {
                throw new Error(`HTTP error, status=${response.status}, statusText=${response.statusText}`);
            }
        });
    }
    // 小程序环境
    return new Promise((resolve, reject) => {
        bridge$1.request({
            url,
            // @ts-ignore 支付宝小程序必须有该字段
            dataType: "arraybuffer",
            responseType: "arraybuffer",
            enableCache: true,
            success(res) {
                resolve(res.data);
            },
            fail: reject,
        });
    });
}
/**
 * 读取本地文件
 * @param url 文件资源地址
 * @returns
 */
function readLocalFile(url) {
    return new Promise((resolve, reject) => {
        bridge$1.getFileSystemManager().readFile({
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
    if (platform !== SP.H5) {
        return readLocalFile(url);
    }
    return Promise.resolve(null);
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
        movie.sprites?.forEach((mSprite) => {
            const vFrames = [];
            const vSprite = {
                imageKey: mSprite.imageKey,
                frames: vFrames,
            };
            let lastShapes;
            mSprite.frames.forEach((mFrame) => {
                const layout = {
                    x: mFrame.layout?.x ?? 0.0,
                    y: mFrame.layout?.y ?? 0.0,
                    width: mFrame.layout?.width ?? 0.0,
                    height: mFrame.layout?.height ?? 0.0,
                };
                const transform = {
                    a: mFrame.transform?.a ?? 1.0,
                    b: mFrame.transform?.b ?? 0.0,
                    c: mFrame.transform?.c ?? 0.0,
                    d: mFrame.transform?.d ?? 1.0,
                    tx: mFrame.transform?.tx ?? 0.0,
                    ty: mFrame.transform?.ty ?? 0.0,
                };
                const clipPath = mFrame.clipPath ?? "";
                let shapes = [];
                mFrame.shapes.forEach((mShape) => {
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
                        case 0:
                            lineCap = "butt";
                            break;
                        case 1:
                            lineCap = "round";
                            break;
                        case 2:
                            lineCap = "square";
                            break;
                    }
                    let lineJoin = null;
                    switch (mStyles.lineJoin) {
                        case 2:
                            lineJoin = "bevel";
                            break;
                        case 1:
                            lineJoin = "round";
                            break;
                        case 0:
                            lineJoin = "miter";
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
                        miterLimit,
                    };
                    const transform = {
                        a: mShape.transform?.a ?? 1.0,
                        b: mShape.transform?.b ?? 0.0,
                        c: mShape.transform?.c ?? 0.0,
                        d: mShape.transform?.d ?? 1.0,
                        tx: mShape.transform?.tx ?? 0.0,
                        ty: mShape.transform?.ty ?? 0.0,
                    };
                    if (mShape.type === 0 && mShape.shape !== null) {
                        shapes.push({
                            type: "shape" /* SHAPE_TYPE.SHAPE */,
                            path: mShape.shape,
                            styles,
                            transform,
                        });
                    }
                    else if (mShape.type === 1 && mShape.rect !== null) {
                        shapes.push({
                            type: "rect" /* SHAPE_TYPE.RECT */,
                            path: mShape.rect,
                            styles,
                            transform,
                        });
                    }
                    else if (mShape.type === 2 && mShape.ellipse !== null) {
                        shapes.push({
                            type: "ellipse" /* SHAPE_TYPE.ELLIPSE */,
                            path: mShape.ellipse,
                            styles,
                            transform,
                        });
                    }
                });
                if (mFrame.shapes[0] !== undefined &&
                    mFrame.shapes[0].type === 3 &&
                    lastShapes !== undefined) {
                    shapes = lastShapes;
                }
                else {
                    lastShapes = shapes;
                }
                const llx = transform.a * layout.x + transform.c * layout.y + transform.tx;
                const lrx = transform.a * (layout.x + layout.width) +
                    transform.c * layout.y +
                    transform.tx;
                const lbx = transform.a * layout.x +
                    transform.c * (layout.y + layout.height) +
                    transform.tx;
                const rbx = transform.a * (layout.x + layout.width) +
                    transform.c * (layout.y + layout.height) +
                    transform.tx;
                const lly = transform.b * layout.x + transform.d * layout.y + transform.ty;
                const lry = transform.b * (layout.x + layout.width) +
                    transform.d * layout.y +
                    transform.ty;
                const lby = transform.b * layout.x +
                    transform.d * (layout.y + layout.height) +
                    transform.ty;
                const rby = transform.b * (layout.x + layout.width) +
                    transform.d * (layout.y + layout.height) +
                    transform.ty;
                const nx = Math.min(Math.min(lbx, rbx), Math.min(llx, lrx));
                const ny = Math.min(Math.min(lby, rby), Math.min(lly, lry));
                const maskPath = clipPath.length > 0
                    ? {
                        d: clipPath,
                        transform: undefined,
                        styles: {
                            fill: "rgba(0, 0, 0, 0)",
                            stroke: null,
                            strokeWidth: null,
                            lineCap: null,
                            lineJoin: null,
                            miterLimit: null,
                            lineDash: null,
                        },
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
                    maskPath,
                });
            });
            this.sprites.push(vSprite);
        });
        this.images = images;
    }
}

// const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const stopwatch = {
    // a: {} as Record<string, number>,
    l: {},
    t: {},
    increment(label) {
        if (stopwatch.t[label] === undefined) {
            stopwatch.t[label] = 0;
        }
        stopwatch.t[label]++;
    },
    getCount(label) {
        return stopwatch.t[label] || 0;
    },
    time(label) {
        console.time(label);
    },
    timeEnd(label) {
        console.timeEnd(label);
    },
    clearTime(label) {
        delete stopwatch.t[label];
    },
    isLock(label) {
        return !!stopwatch.l[label];
    },
    lock(label) {
        stopwatch.l[label] = true;
    },
    unlock(label) {
        delete stopwatch.l[label];
    },
};
var benchmark = {
    count: 20,
    label(label) {
        console.log(label);
    },
    time(label, callback, beforeCallback, afterCallback) {
        stopwatch.increment(label);
        const count = stopwatch.getCount(label);
        if (stopwatch.isLock(label) || (this.count !== 0 && count > this.count)) {
            callback();
        }
        else {
            beforeCallback?.(count);
            stopwatch.time(label);
            callback();
            stopwatch.timeEnd(label);
            afterCallback?.(count);
        }
    },
    clearTime(label) {
        stopwatch.clearTime(label);
    },
    lockTime(label) {
        stopwatch.lock(label);
    },
    unlockTime(label) {
        stopwatch.unlock(label);
    },
    line(size = 40) {
        console.log("-".repeat(size));
    },
};

/**
 * SVGA 下载解析器
 */
class Parser {
    static parseVideoEntity(data) {
        const header = new Uint8Array(data, 0, 4);
        const u8a = new Uint8Array(data);
        if (header.toString() === "80,75,3,4") {
            throw new Error("this parser only support version@2 of SVGA.");
        }
        const inflateData = unzlibSync(u8a);
        const movieData = T.decode(inflateData);
        return new VideoEntity(movieData, movieData.images);
    }
    static parsePlacardEntity(data) {
    }
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    async load(url) {
        const data = await download(url);
        benchmark.line();
        benchmark.label(url);
        return Parser.parseVideoEntity(data);
    }
}

/**
 * 获取当前显示设备的物理像素分辨率与CSS 像素分辨率之比
 */
let dpr = 1;
if (platform === SP.H5) {
    dpr = window.devicePixelRatio;
}
if ("getWindowInfo" in bridge$1) {
    dpr = bridge$1.getWindowInfo().pixelRatio;
}
if ("getSystemInfoSync" in bridge$1) {
    dpr = bridge$1.getSystemInfoSync().pixelRatio;
}

/**
 * 创建离屏Canvas
 * @param options 离屏Canvas参数
 * @returns
 */
function createOffscreenCanvas(options) {
    if (platform === SP.H5) {
        return new OffscreenCanvas(options.width, options.height);
    }
    if (platform === SP.ALIPAY) {
        return my.createOffscreenCanvas({
            width: options.width,
            height: options.height,
        });
    }
    if (platform === SP.DOUYIN) {
        const canvas = tt.createOffscreenCanvas();
        canvas.width = options.width;
        canvas.height = options.height;
        return canvas;
    }
    return wx.createOffscreenCanvas({
        ...options,
        type: "2d",
    });
}
/**
 * 获取Canvas及其Context
 * @param selector
 * @param component
 * @returns
 */
function getCanvas(selector, component) {
    return new Promise((resolve, reject) => {
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
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            resolve({ canvas, ctx });
        };
        if (platform === SP.H5) {
            const canvas = document.querySelector(selector);
            const { width, height } = canvas.style;
            initCanvas(canvas, parseFloat(width), parseFloat(height));
        }
        else {
            let query = bridge$1.createSelectorQuery();
            if (component) {
                query = query.in(component);
            }
            query
                .select(selector)
                .fields({ node: true, size: true }, (res) => {
                if (res?.node) {
                    const { node, width, height } = res;
                    initCanvas(node, width, height);
                }
                else {
                    reject(new Error("canvas not found!"));
                }
            })
                .exec();
        }
    });
}
/**
 * 获取离屏Canvas及其Context
 * @param options
 * @returns
 */
function getOffscreenCanvas(options) {
    const canvas = createOffscreenCanvas(options);
    const ctx = canvas.getContext("2d");
    return { canvas, ctx };
}

/**
 * 将ArrayBuffer转为base64
 * @param data 二进制数据
 * @returns
 */
function toBase64(data) {
    const ab = createArrayBuffer(data);
    let b;
    if (platform === SP.H5) {
        b = btoa(String.fromCharCode(...new Uint8Array(ab)));
    }
    else {
        b = bridge$1.arrayBufferToBase64(ab);
    }
    return `data:image/png;base64,${b}`;
}
/**
 * 将Uint8Array转ArrayBuffer
 * @param data 二进制数据
 * @returns
 */
function toBitmap(data) {
    const ab = createArrayBuffer(data);
    return createImageBitmap(new Blob([ab]));
}
/**
 * 创建图片对象
 * @param canvas 画布对象
 * @returns
 */
function createImage(canvas) {
    if (platform === SP.H5) {
        return new Image();
    }
    return canvas.createImage();
}
/**
 * Uint8Array转换成ArrayBuffer
 * @param data
 * @returns
 */
function createArrayBuffer(data) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}
/**
 * 创建图片src元信息
 * @param data
 * @returns
 */
function genImageSource(data) {
    if (typeof data === "string") {
        return data;
    }
    return toBase64(data);
}
/**
 * 加载图片
 * @param canvas 画布对象
 * @param data 图片数据
 * @returns
 */
function loadImage(canvas, data) {
    if (platform === SP.H5 && "createImageBitmap" in window) {
        return toBitmap(data);
    }
    return new Promise((resolve, reject) => {
        const img = createImage(canvas);
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(new Error(`[SVGA LOADING FAILURE]: ${error.message}`));
        img.src = genImageSource(data);
    });
}

function startAnimationFrame(canvas, callback) {
    if (platform === SP.H5) {
        return requestAnimationFrame(callback);
    }
    return canvas.requestAnimationFrame(callback);
}

const noop = () => { };
class Animator {
    canvas;
    /**
     * 动画是否执行
     */
    isRunning = false;
    /**
     * 开始时间
     */
    startTime = 0;
    /**
     * 当前动画已播放完的帧
     */
    currentFrication = 0.0;
    /**
     * 开始帧
     */
    startValue = 0;
    /**
     * 结束帧
     */
    endValue = 0;
    /**
     * 持续时间
     */
    duration = 0;
    /**
     * 每帧持续时间
     */
    frameDuration = 0;
    /**
     * 循环播放开始帧
     */
    loopStart = 0;
    /**
     * 循环总时长
     */
    loopTotalTime = 0;
    /**
     * 循环次数
     * 可以设置为**Infinity**，默认是**1**
     */
    // private loop: number = 1;
    /**
     * 最后停留的目标模式，类似于**animation-fill-mode**
     */
    fillRule = 0;
    /* ---- 事件钩子 ---- */
    onStart = noop;
    onUpdate = noop;
    onEnd = noop;
    constructor(canvas) {
        this.canvas = canvas;
    }
    now() {
        // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
        if (typeof performance !== "undefined") {
            return performance.now();
        }
        return Date.now();
    }
    /**
     * 设置动画开始帧和结束帧
     * @param startValue
     * @param endValue
     */
    setRange(startValue, endValue) {
        this.startValue = startValue;
        this.endValue = endValue;
    }
    /**
     * 设置动画的必要参数
     * @param duration
     * @param frameDuration
     * @param loopStart
     * @param loop
     * @param fillRule
     */
    setConfig(duration, frameDuration, loopStart, loop, fillRule) {
        this.duration = duration;
        this.frameDuration = frameDuration;
        this.loopStart = loopStart;
        this.fillRule = fillRule;
        this.loopTotalTime = loopStart + (duration - loopStart) * loop;
    }
    start() {
        this.isRunning = true;
        this.startTime = this.now();
        this.currentFrication = 0.0;
        this.onStart();
        this.doFrame();
    }
    stop() {
        this.isRunning = false;
    }
    get animatedValue() {
        if (!this.currentFrication) {
            return Math.floor(this.startValue);
        }
        return Math.floor((this.endValue - this.startValue) * this.currentFrication +
            this.startValue);
    }
    doFrame() {
        if (this.isRunning) {
            this.doDeltaTime(this.now() - this.startTime);
            if (this.isRunning) {
                startAnimationFrame(this.canvas, this.doFrame.bind(this));
            }
        }
    }
    doDeltaTime(deltaTime) {
        // 运行时间 大于等于 总循环的时间
        if (deltaTime >= this.loopTotalTime) {
            // 循环已结束
            this.currentFrication = this.fillRule === 1 ? 0.0 : 1.0;
            this.isRunning = false;
        }
        else {
            this.currentFrication =
                deltaTime <= this.duration
                    ? deltaTime / this.duration
                    : (((deltaTime - this.loopStart) % (this.duration - this.loopStart)) +
                        this.loopStart) /
                        this.duration;
        }
        this.onUpdate(this.animatedValue, (deltaTime % this.frameDuration) / this.frameDuration);
        if (!this.isRunning) {
            this.onEnd();
        }
    }
}

const validMethods = "MLHVCSQRZmlhvcsqrz";
function render(context, bitmapsCache, videoEntity, currentFrame, head, tail) {
    if (context === null) {
        throw new Error("Render Context cannot be null");
    }
    if (head === tail) {
        return;
    }
    const { sprites, replaceElements, dynamicElements } = videoEntity;
    if (tail === undefined) {
        tail = sprites.length;
    }
    for (let i = head || 0; i < tail; i++) {
        const { imageKey } = sprites[i];
        const bitmap = bitmapsCache.get(imageKey);
        const replaceElement = replaceElements[imageKey];
        const dynamicElement = dynamicElements[imageKey];
        drawSprite(context, sprites[i], currentFrame, bitmap, replaceElement, dynamicElement);
    }
}
function drawSprite(context, sprite, currentFrame, bitmap, replaceElement, dynamicElement) {
    const frame = sprite.frames[currentFrame];
    if (frame.alpha < 0.05)
        return;
    context.save();
    context.globalAlpha = frame.alpha;
    context.transform(frame.transform?.a ?? 1, frame.transform?.b ?? 0, frame.transform?.c ?? 0, frame.transform?.d ?? 1, frame.transform?.tx ?? 0, frame.transform?.ty ?? 0);
    if (bitmap) {
        if (frame.maskPath) {
            drawBezier(context, frame.maskPath.d, frame.maskPath.transform, frame.maskPath.styles);
            context.clip();
        }
        let element;
        if (replaceElement) {
            element = replaceElement;
        }
        else {
            element = bitmap;
        }
        context.drawImage(element, 0, 0, frame.layout.width, frame.layout.height);
    }
    if (dynamicElement) {
        context.drawImage(dynamicElement, (frame.layout.width - dynamicElement.width) / 2, (frame.layout.height - dynamicElement.height) / 2);
    }
    for (let i = 0; i < frame.shapes.length; i++) {
        drawShape(context, frame.shapes[i]);
    }
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
    if (!styles) {
        return;
    }
    context.strokeStyle = styles.stroke || "transparent";
    if (styles.strokeWidth > 0) {
        context.lineWidth = styles.strokeWidth;
    }
    if (styles.miterLimit > 0) {
        context.miterLimit = styles.miterLimit;
    }
    if (styles.lineCap) {
        context.lineCap = styles.lineCap;
    }
    if (styles.lineJoin) {
        context.lineJoin = styles.lineJoin;
    }
    context.fillStyle = styles.fill || "transparent";
    if (styles.lineDash !== null) {
        context.setLineDash(styles.lineDash);
    }
}
function drawBezier(context, d, transform, styles) {
    context.save();
    resetShapeStyles(context, styles);
    if (transform) {
        context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
    }
    context.beginPath();
    if (d) {
        const currentPoint = { x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
        const arr = d.replace(/([a-zA-Z])/g, "|||$1 ").replace(/,/g, " ").split("|||");
        for (let i = 0; i < arr.length; i++) {
            const segment = arr[i];
            if (segment.length === 0) {
                return;
            }
            const firstLetter = segment.substring(0, 1);
            if (validMethods.includes(firstLetter)) {
                const args = segment.substring(1).trim().split(" ");
                drawBezierElement(context, currentPoint, firstLetter, args);
            }
        }
    }
    if (styles.fill) {
        context.fill();
    }
    if (styles.stroke) {
        context.stroke();
    }
    context.restore();
}
function drawBezierElement(context, currentPoint, method, args) {
    switch (method) {
        case "M":
            currentPoint.x = +args[0];
            currentPoint.y = +args[1];
            context.moveTo(currentPoint.x, currentPoint.y);
            break;
        case "m":
            currentPoint.x += +args[0];
            currentPoint.y += +args[1];
            context.moveTo(currentPoint.x, currentPoint.y);
            break;
        case "L":
            currentPoint.x = +args[0];
            currentPoint.y = +args[1];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "l":
            currentPoint.x += +args[0];
            currentPoint.y += +args[1];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "H":
            currentPoint.x = +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "h":
            currentPoint.x += +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "V":
            currentPoint.y = +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "v":
            currentPoint.y += +args[0];
            context.lineTo(currentPoint.x, currentPoint.y);
            break;
        case "C":
            currentPoint.x1 = +args[0];
            currentPoint.y1 = +args[1];
            currentPoint.x2 = +args[2];
            currentPoint.y2 = +args[3];
            currentPoint.x = +args[4];
            currentPoint.y = +args[5];
            context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
            break;
        case "c":
            currentPoint.x1 = currentPoint.x + +args[0];
            currentPoint.y1 = currentPoint.y + +args[1];
            currentPoint.x2 = currentPoint.x + +args[2];
            currentPoint.y2 = currentPoint.y + +args[3];
            currentPoint.x += +args[4];
            currentPoint.y += +args[5];
            context.bezierCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x2, currentPoint.y2, currentPoint.x, currentPoint.y);
            break;
        case "S":
            if (currentPoint.x1 !== undefined &&
                currentPoint.y1 !== undefined &&
                currentPoint.x2 !== undefined &&
                currentPoint.y2 !== undefined) {
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
        case "s":
            if (currentPoint.x1 !== undefined &&
                currentPoint.y1 !== undefined &&
                currentPoint.x2 !== undefined &&
                currentPoint.y2 !== undefined) {
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
        case "Q":
            currentPoint.x1 = +args[0];
            currentPoint.y1 = +args[1];
            currentPoint.x = +args[2];
            currentPoint.y = +args[3];
            context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
            break;
        case "q":
            currentPoint.x1 = currentPoint.x + +args[0];
            currentPoint.y1 = currentPoint.y + +args[1];
            currentPoint.x += +args[2];
            currentPoint.y += +args[3];
            context.quadraticCurveTo(currentPoint.x1, currentPoint.y1, currentPoint.x, currentPoint.y);
            break;
        case "A":
            break;
        case "a":
            break;
        case "Z":
        case "z":
            context.closePath();
            break;
    }
}
function drawEllipse(context, x, y, radiusX, radiusY, transform, styles) {
    context.save();
    resetShapeStyles(context, styles);
    if (transform) {
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
    if (styles.fill) {
        context.fill();
    }
    if (styles.stroke) {
        context.stroke();
    }
    context.restore();
}
function drawRect(context, x, y, width, height, cornerRadius, transform, styles) {
    context.save();
    resetShapeStyles(context, styles);
    if (transform) {
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
    if (styles.fill) {
        context.fill();
    }
    if (styles.stroke) {
        context.stroke();
    }
    context.restore();
}

class Brush {
    /**
     * 主屏的 Canvas 元素
     * Main Screen
     */
    ms = null;
    /**
     * 主屏的 Context 对象
     * Main Context
     */
    mc = null;
    /**
     * 副屏的 Canvas 元素
     * Secondary Screen
     */
    ss = null;
    /**
     * 副屏的 Context 对象
     * Secondary Context
     */
    sc = null;
    /**
     * 副屏的 Canvas 类型
     */
    type;
    cache = new Map();
    async register(selector, ofsSelector, component) {
        const { canvas, ctx } = await getCanvas(selector, component);
        const { width, height } = canvas;
        this.ms = canvas;
        this.mc = ctx;
        let ofsResult;
        if (typeof ofsSelector === "string" && ofsSelector !== "") {
            ofsResult = await getCanvas(ofsSelector, component);
            ofsResult.canvas.width = width;
            ofsResult.canvas.height = height;
            this.type = "canvas";
        }
        else {
            ofsResult = getOffscreenCanvas({ width, height });
            this.type = "ofscanvas";
        }
        this.ss = ofsResult.canvas;
        this.sc = ofsResult.ctx;
    }
    setConfig(options) {
        this.ms.width = options.width;
        this.ms.height = options.height;
        this.cache.clear();
    }
    getM() {
        return this.ms;
    }
    clearM() {
        const { width, height } = this.ms;
        this.ms.width = width;
        this.ms.height = height;
    }
    clearS() {
        const { width, height } = this.ms;
        if (this.type === "ofscanvas" &&
            platform === SP.H5 &&
            // OffscreenCanvas 在 Firefox 浏览器无法被清理历史内容
            navigator.userAgent.includes("Firefox")) {
            const ofsResult = getOffscreenCanvas({ width, height });
            this.ss = ofsResult.canvas;
            this.sc = ofsResult.ctx;
        }
        else {
            this.ss.width = width;
            this.ss.height = height;
        }
    }
    destroy() {
        this.clearM();
        this.clearS();
        this.ms = null;
        this.mc = null;
        this.ss = null;
        this.sc = null;
        this.type = undefined;
    }
    draw(bitmapsCache, videoEntity, currentFrame, start, end) {
        render(this.sc, bitmapsCache, videoEntity, currentFrame, start, end);
    }
    save(currentFrame) {
        if (platform === SP.DOUYIN) {
            const image = this.ss.toDataURL("2d", 1);
            loadImage(this.ms, image).then((img) => {
                console.log('set', currentFrame);
                this.cache.set(currentFrame, img);
            });
        }
    }
    stick(currentFrame) {
        const { width, height } = this.ms;
        if (platform === SP.H5 || this.type === "canvas") {
            if (platform === SP.DOUYIN) {
                console.log('get', currentFrame, this.cache.has(currentFrame));
                if (this.cache.has(currentFrame)) {
                    this.mc.drawImage(this.cache.get(currentFrame), 0, 0);
                }
            }
            else {
                this.mc.drawImage(this.ss, 0, 0);
            }
        }
        else if (this.type === "ofscanvas") {
            const imageData = this.sc.getImageData(0, 0, width, height);
            this.mc.putImageData(imageData, 0, 0);
        }
    }
}

/**
 * SVGA 播放器
 */
class Player {
    /**
     * 动画当前帧数
     */
    currFrame = 0;
    /**
     * 动画最后帧数
     */
    lastFrame = 0;
    /**
     * SVGA 数据源
     * Video Entity
     */
    entity = undefined;
    /**
     * 当前配置项
     */
    config = Object.create({
        loop: 0,
        fillMode: "forwards" /* PLAYER_FILL_MODE.FORWARDS */,
        playMode: "forwards" /* PLAYER_PLAY_MODE.FORWARDS */,
        startFrame: 0,
        endFrame: 0,
        loopStartFrame: 0,
        // isUseIntersectionObserver: false,
    });
    brush = new Brush();
    animator = null;
    // private isBeIntersection = true;
    // private intersectionObserver: IntersectionObserver | null = null
    cache = new Map();
    /**
     * 片段绘制开始位置
     */
    head = 0;
    /**
     * 片段绘制结束位置
     */
    tail = 0;
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
        const { startFrame, endFrame } = config;
        if (startFrame !== undefined && endFrame !== undefined) {
            if (startFrame > endFrame) {
                throw new Error("[SvgaError] StartFrame should > EndFrame");
            }
        }
        Object.assign(this.config, {
            loop: config.loop ?? 0,
            fillMode: config.fillMode ?? "forwards" /* PLAYER_FILL_MODE.FORWARDS */,
            playMode: config.playMode ?? "forwards" /* PLAYER_PLAY_MODE.FORWARDS */,
            startFrame: startFrame ?? 0,
            endFrame: endFrame ?? 0,
            loopStartFrame: config.loopStartFrame ?? 0,
        });
        await this.brush.register(config.container, config.secondary, component);
        // this.config.isUseIntersectionObserver =
        //   config.isUseIntersectionObserver ?? false;
        // 监听容器是否处于浏览器视窗内
        // this.setIntersectionObserver()
        const canvas = this.brush.getM();
        this.animator = new Animator(canvas);
        this.animator.onEnd = () => {
            this.onEnd?.();
        };
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
    async mount(videoEntity, options, component) {
        if (videoEntity === undefined) {
            throw new Error("videoEntity undefined");
        }
        if (options) {
            await this.setConfig(options, component);
        }
        this.currFrame = 0;
        this.lastFrame = videoEntity.frames - 1;
        this.entity = videoEntity;
        benchmark.clearTime("render");
        benchmark.clearTime("draw");
        benchmark.unlockTime("draw");
        if (videoEntity === undefined) {
            return;
        }
        const { images, size } = videoEntity;
        const canvas = this.brush.getM();
        this.brush.setConfig(size);
        this.brush.clearS();
        this.cache.clear();
        if (Object.keys(images).length === 0) {
            return;
        }
        let imageArr = [];
        for (let key in images) {
            const p = loadImage(canvas, images[key]).then((img) => {
                this.cache.set(key, img);
            });
            imageArr.push(p);
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
    /**
     * 开始播放
     */
    start() {
        this.brush.clearM();
        this.startAnimation();
        this.onStart?.();
    }
    /**
     * 重新播放
     */
    resume() {
        this.startAnimation();
        this.onResume?.();
    }
    /**
     * 暂停播放
     */
    pause() {
        this.animator.stop();
        this.onPause?.();
    }
    /**
     * 停止播放
     */
    stop() {
        this.animator.stop();
        this.currFrame = 0;
        this.brush.clearM();
        this.onStop?.();
    }
    /**
     * 清理容器画布
     */
    clear() {
        this.brush.clearM();
    }
    /**
     * 销毁实例
     */
    destroy() {
        this.animator.stop();
        this.brush.destroy();
        this.animator = null;
        this.entity = undefined;
    }
    startAnimation() {
        const { config, lastFrame, entity } = this;
        const { playMode, loopStartFrame, fillMode, loop } = config;
        let startFrame = Math.min(Math.abs(config.startFrame), 0);
        let endFrame = Math.max(config.endFrame, lastFrame);
        // 如果开始动画的当前帧是最后一帧，重置为第 0 帧
        if (this.currFrame === lastFrame) {
            this.currFrame = startFrame;
        }
        // 顺序播放/倒叙播放
        if (playMode === "forwards" /* PLAYER_PLAY_MODE.FORWARDS */) {
            this.animator.setRange(startFrame, endFrame);
        }
        else {
            this.animator.setRange(endFrame, startFrame);
        }
        let { frames, fps, sprites } = entity;
        const spriteCount = sprites.length;
        // 更新活动帧总数
        if (endFrame !== lastFrame) {
            frames = endFrame - startFrame;
        }
        else if (startFrame !== 0) {
            frames -= startFrame;
        }
        this.animator.setConfig(
        /**
         * 总帧数 / FPS，获取动画持续的时间
         * duration = frames * (1 / fps) * 1000
         */
        (frames * 1000) / fps, 
        /**
         * 每帧持续时间
         */
        1000 / fps, 
        /**
         * loopStart = (loopStartFrame - startFrame) * (1 / fps) * 100
         */
        loopStartFrame > startFrame
            ? ((loopStartFrame - startFrame) * 100) / fps
            : 0, 
        /**
         * 循环次数
         * loop
         */
        loop <= 0 ? Infinity : loop, 
        /**
         * 顺序播放/倒序播放
         * fillRule
         */
        +(fillMode === "backwards" /* PLAYER_FILL_MODE.BACKWARDS */));
        this.animator.onUpdate = (value, spendValue) => {
            // 是否还有剩余时间
            const hasRemained = this.currFrame === value;
            // 尾帧如果封顶，则无需继续绘制
            if (this.tail !== spriteCount) {
                // 1.2和3均为阔值，保证渲染尽快完成
                const tmp = hasRemained
                    ? Math.min(Math.ceil(spriteCount * spendValue * 1.2) + 3, spriteCount)
                    : spriteCount;
                if (tmp > this.tail) {
                    this.head = this.tail;
                    this.tail = tmp;
                    benchmark.time(`draw`, () => {
                        this.brush.draw(this.cache, this.entity, this.currFrame, this.head, this.tail);
                    });
                }
                if (this.tail === spriteCount) {
                    this.brush.save(this.currFrame);
                }
            }
            if (hasRemained) {
                return;
            }
            this.brush.clearM();
            benchmark.time("render", () => this.brush.stick(this.currFrame), null, (count) => {
                console.log("render count", count);
                benchmark.line(20);
                if (count < benchmark.count) {
                    benchmark.clearTime("draw");
                }
                else {
                    benchmark.lockTime("draw");
                }
            });
            this.brush.clearS();
            this.onProcess?.();
            this.currFrame = value;
            this.tail = 0;
        };
        this.animator.start();
    }
}

export { Parser, Player };
//# sourceMappingURL=index.js.map
