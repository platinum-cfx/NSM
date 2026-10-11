var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// vendor/fengari/src/luaconf.js
var require_luaconf = __commonJS({
  "vendor/fengari/src/luaconf.js"(exports, module) {
    "use strict";
    var conf = process.env.FENGARICONF ? JSON.parse(process.env.FENGARICONF) : {};
    var {
      LUA_VERSION_MAJOR,
      LUA_VERSION_MINOR,
      to_luastring: to_luastring2
    } = require_defs();
    var LUA_PATH_SEP = ";";
    module.exports.LUA_PATH_SEP = LUA_PATH_SEP;
    var LUA_PATH_MARK = "?";
    module.exports.LUA_PATH_MARK = LUA_PATH_MARK;
    var LUA_EXEC_DIR = "!";
    module.exports.LUA_EXEC_DIR = LUA_EXEC_DIR;
    var LUA_VDIR = LUA_VERSION_MAJOR + "." + LUA_VERSION_MINOR;
    module.exports.LUA_VDIR = LUA_VDIR;
    if (typeof process === "undefined") {
      const LUA_DIRSEP = "/";
      module.exports.LUA_DIRSEP = LUA_DIRSEP;
      const LUA_LDIR = "./lua/" + LUA_VDIR + "/";
      module.exports.LUA_LDIR = LUA_LDIR;
      const LUA_JSDIR = LUA_LDIR;
      module.exports.LUA_JSDIR = LUA_JSDIR;
      const LUA_PATH_DEFAULT = to_luastring2(
        LUA_LDIR + "?.lua;" + LUA_LDIR + "?/init.lua;./?.lua;./?/init.lua"
      );
      module.exports.LUA_PATH_DEFAULT = LUA_PATH_DEFAULT;
      const LUA_JSPATH_DEFAULT = to_luastring2(
        LUA_JSDIR + "?.js;" + LUA_JSDIR + "loadall.js;./?.js"
      );
      module.exports.LUA_JSPATH_DEFAULT = LUA_JSPATH_DEFAULT;
    } else if (typeof process !== "undefined" && (() => {
      try {
        return __require("os").platform() === "win32";
      } catch (e) {
        return false;
      }
    })()) {
      const LUA_DIRSEP = "\\";
      module.exports.LUA_DIRSEP = LUA_DIRSEP;
      const LUA_LDIR = "!\\lua\\";
      module.exports.LUA_LDIR = LUA_LDIR;
      const LUA_JSDIR = "!\\";
      module.exports.LUA_JSDIR = LUA_JSDIR;
      const LUA_SHRDIR = "!\\..\\share\\lua\\" + LUA_VDIR + "\\";
      module.exports.LUA_SHRDIR = LUA_SHRDIR;
      const LUA_PATH_DEFAULT = to_luastring2(
        LUA_LDIR + "?.lua;" + LUA_LDIR + "?\\init.lua;" + LUA_JSDIR + "?.lua;" + LUA_JSDIR + "?\\init.lua;" + LUA_SHRDIR + "?.lua;" + LUA_SHRDIR + "?\\init.lua;.\\?.lua;.\\?\\init.lua"
      );
      module.exports.LUA_PATH_DEFAULT = LUA_PATH_DEFAULT;
      const LUA_JSPATH_DEFAULT = to_luastring2(
        LUA_JSDIR + "?.js;" + LUA_JSDIR + "..\\share\\lua\\" + LUA_VDIR + "\\?.js;" + LUA_JSDIR + "loadall.js;.\\?.js"
      );
      module.exports.LUA_JSPATH_DEFAULT = LUA_JSPATH_DEFAULT;
    } else {
      const LUA_DIRSEP = "/";
      module.exports.LUA_DIRSEP = LUA_DIRSEP;
      const LUA_ROOT = "/usr/local/";
      module.exports.LUA_ROOT = LUA_ROOT;
      const LUA_ROOT2 = "/usr/";
      const LUA_LDIR = LUA_ROOT + "share/lua/" + LUA_VDIR + "/";
      const LUA_LDIR2 = LUA_ROOT2 + "share/lua/" + LUA_VDIR + "/";
      module.exports.LUA_LDIR = LUA_LDIR;
      const LUA_JSDIR = LUA_LDIR;
      module.exports.LUA_JSDIR = LUA_JSDIR;
      const LUA_JSDIR2 = LUA_LDIR2;
      const LUA_PATH_DEFAULT = to_luastring2(
        LUA_LDIR + "?.lua;" + LUA_LDIR + "?/init.lua;" + LUA_LDIR2 + "?.lua;" + LUA_LDIR2 + "?/init.lua;./?.lua;./?/init.lua"
      );
      module.exports.LUA_PATH_DEFAULT = LUA_PATH_DEFAULT;
      const LUA_JSPATH_DEFAULT = to_luastring2(
        LUA_JSDIR + "?.js;" + LUA_JSDIR + "loadall.js;" + LUA_JSDIR2 + "?.js;" + LUA_JSDIR2 + "loadall.js;./?.js"
      );
      module.exports.LUA_JSPATH_DEFAULT = LUA_JSPATH_DEFAULT;
    }
    var LUA_COMPAT_FLOATSTRING = conf.LUA_COMPAT_FLOATSTRING || false;
    var LUA_MAXINTEGER = 2147483647;
    var LUA_MININTEGER = -2147483648;
    var LUAI_MAXSTACK = conf.LUAI_MAXSTACK || 1e6;
    var LUA_IDSIZE = conf.LUA_IDSIZE || 60 - 1;
    var lua_integer2str = function(n) {
      return String(n);
    };
    var lua_number2str = function(n) {
      return String(Number(n.toPrecision(14)));
    };
    var lua_numbertointeger = function(n) {
      return n >= LUA_MININTEGER && n < -LUA_MININTEGER ? n : false;
    };
    var LUA_INTEGER_FRMLEN = "";
    var LUA_NUMBER_FRMLEN = "";
    var LUA_INTEGER_FMT = `%${LUA_INTEGER_FRMLEN}d`;
    var LUA_NUMBER_FMT = "%.14g";
    var lua_getlocaledecpoint = function() {
      return 46;
    };
    var LUAL_BUFFERSIZE = conf.LUAL_BUFFERSIZE || 8192;
    var frexp = function(value) {
      if (value === 0) return [value, 0];
      var data = new DataView(new ArrayBuffer(8));
      data.setFloat64(0, value);
      var bits = data.getUint32(0) >>> 20 & 2047;
      if (bits === 0) {
        data.setFloat64(0, value * Math.pow(2, 64));
        bits = (data.getUint32(0) >>> 20 & 2047) - 64;
      }
      var exponent = bits - 1022;
      var mantissa = ldexp(value, -exponent);
      return [mantissa, exponent];
    };
    var ldexp = function(mantissa, exponent) {
      var steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
      var result = mantissa;
      for (var i = 0; i < steps; i++)
        result *= Math.pow(2, Math.floor((exponent + i) / steps));
      return result;
    };
    module.exports.LUAI_MAXSTACK = LUAI_MAXSTACK;
    module.exports.LUA_COMPAT_FLOATSTRING = LUA_COMPAT_FLOATSTRING;
    module.exports.LUA_IDSIZE = LUA_IDSIZE;
    module.exports.LUA_INTEGER_FMT = LUA_INTEGER_FMT;
    module.exports.LUA_INTEGER_FRMLEN = LUA_INTEGER_FRMLEN;
    module.exports.LUA_MAXINTEGER = LUA_MAXINTEGER;
    module.exports.LUA_MININTEGER = LUA_MININTEGER;
    module.exports.LUA_NUMBER_FMT = LUA_NUMBER_FMT;
    module.exports.LUA_NUMBER_FRMLEN = LUA_NUMBER_FRMLEN;
    module.exports.LUAL_BUFFERSIZE = LUAL_BUFFERSIZE;
    module.exports.frexp = frexp;
    module.exports.ldexp = ldexp;
    module.exports.lua_getlocaledecpoint = lua_getlocaledecpoint;
    module.exports.lua_integer2str = lua_integer2str;
    module.exports.lua_number2str = lua_number2str;
    module.exports.lua_numbertointeger = lua_numbertointeger;
  }
});

// vendor/fengari/src/defs.js
var require_defs = __commonJS({
  "vendor/fengari/src/defs.js"(exports, module) {
    "use strict";
    var luastring_from;
    if (typeof Uint8Array.from === "function") {
      luastring_from = Uint8Array.from.bind(Uint8Array);
    } else {
      luastring_from = function(a) {
        let i = 0;
        let len = a.length;
        let r = new Uint8Array(len);
        while (len > i) r[i] = a[i++];
        return r;
      };
    }
    var luastring_indexOf;
    if (typeof new Uint8Array().indexOf === "function") {
      luastring_indexOf = function(s, v, i) {
        return s.indexOf(v, i);
      };
    } else {
      let array_indexOf = [].indexOf;
      if (array_indexOf.call(new Uint8Array(1), 0) !== 0) throw Error("missing .indexOf");
      luastring_indexOf = function(s, v, i) {
        return array_indexOf.call(s, v, i);
      };
    }
    var luastring_of;
    if (typeof Uint8Array.of === "function") {
      luastring_of = Uint8Array.of.bind(Uint8Array);
    } else {
      luastring_of = function() {
        return luastring_from(arguments);
      };
    }
    var is_luastring = function(s) {
      return s instanceof Uint8Array;
    };
    var luastring_eq = function(a, b) {
      if (a !== b) {
        let len = a.length;
        if (len !== b.length) return false;
        for (let i = 0; i < len; i++)
          if (a[i] !== b[i]) return false;
      }
      return true;
    };
    var unicode_error_message = "cannot convert invalid utf8 to javascript string";
    var to_jsstring2 = function(value, from, to, replacement_char) {
      if (!is_luastring(value)) throw new TypeError("to_jsstring expects a Uint8Array");
      if (to === void 0) {
        to = value.length;
      } else {
        to = Math.min(value.length, to);
      }
      let str = "";
      for (let i = from !== void 0 ? from : 0; i < to; ) {
        let u0 = value[i++];
        if (u0 < 128) {
          str += String.fromCharCode(u0);
        } else if (u0 < 194 || u0 > 244) {
          if (!replacement_char) throw RangeError(unicode_error_message);
          str += "\uFFFD";
        } else if (u0 <= 223) {
          if (i >= to) {
            if (!replacement_char) throw RangeError(unicode_error_message);
            str += "\uFFFD";
            continue;
          }
          let u1 = value[i++];
          if ((u1 & 192) !== 128) {
            if (!replacement_char) throw RangeError(unicode_error_message);
            str += "\uFFFD";
            continue;
          }
          str += String.fromCharCode(((u0 & 31) << 6) + (u1 & 63));
        } else if (u0 <= 239) {
          if (i + 1 >= to) {
            if (!replacement_char) throw RangeError(unicode_error_message);
            str += "\uFFFD";
            continue;
          }
          let u1 = value[i++];
          if ((u1 & 192) !== 128) {
            if (!replacement_char) throw RangeError(unicode_error_message);
            str += "\uFFFD";
            continue;
          }
          let u2 = value[i++];
          if ((u2 & 192) !== 128) {
            if (!replacement_char) throw RangeError(unicode_error_message);
            str += "\uFFFD";
            continue;
          }
          let u = ((u0 & 15) << 12) + ((u1 & 63) << 6) + (u2 & 63);
          if (u <= 65535) {
            str += String.fromCharCode(u);
          } else {
            u -= 65536;
            let s1 = (u >> 10) + 55296;
            let s2 = u % 1024 + 56320;
            str += String.fromCharCode(s1, s2);
          }
        } else {
          if (i + 2 >= to) {
            if (!replacement_char) throw RangeError(unicode_error_message);
            str += "\uFFFD";
            continue;
          }
          let u1 = value[i++];
          if ((u1 & 192) !== 128) {
            if (!replacement_char) throw RangeError(unicode_error_message);
            str += "\uFFFD";
            continue;
          }
          let u2 = value[i++];
          if ((u2 & 192) !== 128) {
            if (!replacement_char) throw RangeError(unicode_error_message);
            str += "\uFFFD";
            continue;
          }
          let u3 = value[i++];
          if ((u3 & 192) !== 128) {
            if (!replacement_char) throw RangeError(unicode_error_message);
            str += "\uFFFD";
            continue;
          }
          let u = ((u0 & 7) << 18) + ((u1 & 63) << 12) + ((u2 & 63) << 6) + (u3 & 63);
          u -= 65536;
          let s1 = (u >> 10) + 55296;
          let s2 = u % 1024 + 56320;
          str += String.fromCharCode(s1, s2);
        }
      }
      return str;
    };
    var uri_allowed = ";,/?:@&=+$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,-_.!~*'()#".split("").reduce(function(uri_allowed2, c) {
      uri_allowed2[c.charCodeAt(0)] = true;
      return uri_allowed2;
    }, {});
    var to_uristring = function(a) {
      if (!is_luastring(a)) throw new TypeError("to_uristring expects a Uint8Array");
      let s = "";
      for (let i = 0; i < a.length; i++) {
        let v = a[i];
        if (uri_allowed[v]) {
          s += String.fromCharCode(v);
        } else {
          s += "%" + (v < 16 ? "0" : "") + v.toString(16);
        }
      }
      return s;
    };
    var to_luastring_cache = {};
    var to_luastring2 = function(str, cache) {
      if (typeof str !== "string") throw new TypeError("to_luastring expects a javascript string");
      if (cache) {
        let cached = to_luastring_cache[str];
        if (is_luastring(cached)) return cached;
      }
      let len = str.length;
      let outU8Array = Array(len);
      let outIdx = 0;
      for (let i = 0; i < len; ++i) {
        let u = str.charCodeAt(i);
        if (u <= 127) {
          outU8Array[outIdx++] = u;
        } else if (u <= 2047) {
          outU8Array[outIdx++] = 192 | u >> 6;
          outU8Array[outIdx++] = 128 | u & 63;
        } else {
          if (u >= 55296 && u <= 56319 && i + 1 < len) {
            let v = str.charCodeAt(i + 1);
            if (v >= 56320 && v <= 57343) {
              i++;
              u = (u - 55296) * 1024 + v + 9216;
            }
          }
          if (u <= 65535) {
            outU8Array[outIdx++] = 224 | u >> 12;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63;
          } else {
            outU8Array[outIdx++] = 240 | u >> 18;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63;
          }
        }
      }
      outU8Array = luastring_from(outU8Array);
      if (cache) to_luastring_cache[str] = outU8Array;
      return outU8Array;
    };
    var from_userstring = function(str) {
      if (!is_luastring(str)) {
        if (typeof str === "string") {
          str = to_luastring2(str);
        } else {
          throw new TypeError("expects an array of bytes or javascript string");
        }
      }
      return str;
    };
    module.exports.luastring_from = luastring_from;
    module.exports.luastring_indexOf = luastring_indexOf;
    module.exports.luastring_of = luastring_of;
    module.exports.is_luastring = is_luastring;
    module.exports.luastring_eq = luastring_eq;
    module.exports.to_jsstring = to_jsstring2;
    module.exports.to_uristring = to_uristring;
    module.exports.to_luastring = to_luastring2;
    module.exports.from_userstring = from_userstring;
    var LUA_SIGNATURE = to_luastring2("\x1BLua");
    var LUA_VERSION_MAJOR = "5";
    var LUA_VERSION_MINOR = "3";
    var LUA_VERSION_NUM = 503;
    var LUA_VERSION_RELEASE = "4";
    var LUA_VERSION = "Lua " + LUA_VERSION_MAJOR + "." + LUA_VERSION_MINOR;
    var LUA_RELEASE = LUA_VERSION + "." + LUA_VERSION_RELEASE;
    var LUA_COPYRIGHT = LUA_RELEASE + "  Copyright (C) 1994-2017 Lua.org, PUC-Rio";
    var LUA_AUTHORS = "R. Ierusalimschy, L. H. de Figueiredo, W. Celes";
    module.exports.LUA_SIGNATURE = LUA_SIGNATURE;
    module.exports.LUA_VERSION_MAJOR = LUA_VERSION_MAJOR;
    module.exports.LUA_VERSION_MINOR = LUA_VERSION_MINOR;
    module.exports.LUA_VERSION_NUM = LUA_VERSION_NUM;
    module.exports.LUA_VERSION_RELEASE = LUA_VERSION_RELEASE;
    module.exports.LUA_VERSION = LUA_VERSION;
    module.exports.LUA_RELEASE = LUA_RELEASE;
    module.exports.LUA_COPYRIGHT = LUA_COPYRIGHT;
    module.exports.LUA_AUTHORS = LUA_AUTHORS;
    var thread_status = {
      LUA_OK: 0,
      LUA_YIELD: 1,
      LUA_ERRRUN: 2,
      LUA_ERRSYNTAX: 3,
      LUA_ERRMEM: 4,
      LUA_ERRGCMM: 5,
      LUA_ERRERR: 6
    };
    var constant_types = {
      LUA_TNONE: -1,
      LUA_TNIL: 0,
      LUA_TBOOLEAN: 1,
      LUA_TLIGHTUSERDATA: 2,
      LUA_TNUMBER: 3,
      LUA_TSTRING: 4,
      LUA_TTABLE: 5,
      LUA_TFUNCTION: 6,
      LUA_TUSERDATA: 7,
      LUA_TTHREAD: 8,
      LUA_NUMTAGS: 9
    };
    constant_types.LUA_TSHRSTR = constant_types.LUA_TSTRING | 0 << 4;
    constant_types.LUA_TLNGSTR = constant_types.LUA_TSTRING | 1 << 4;
    constant_types.LUA_TNUMFLT = constant_types.LUA_TNUMBER | 0 << 4;
    constant_types.LUA_TNUMINT = constant_types.LUA_TNUMBER | 1 << 4;
    constant_types.LUA_TLCL = constant_types.LUA_TFUNCTION | 0 << 4;
    constant_types.LUA_TLCF = constant_types.LUA_TFUNCTION | 1 << 4;
    constant_types.LUA_TCCL = constant_types.LUA_TFUNCTION | 2 << 4;
    var LUA_OPADD = 0;
    var LUA_OPSUB = 1;
    var LUA_OPMUL = 2;
    var LUA_OPMOD = 3;
    var LUA_OPPOW = 4;
    var LUA_OPDIV = 5;
    var LUA_OPIDIV = 6;
    var LUA_OPBAND = 7;
    var LUA_OPBOR = 8;
    var LUA_OPBXOR = 9;
    var LUA_OPSHL = 10;
    var LUA_OPSHR = 11;
    var LUA_OPUNM = 12;
    var LUA_OPBNOT = 13;
    var LUA_OPEQ = 0;
    var LUA_OPLT = 1;
    var LUA_OPLE = 2;
    var LUA_MINSTACK = 20;
    var { LUAI_MAXSTACK } = require_luaconf();
    var LUA_REGISTRYINDEX = -LUAI_MAXSTACK - 1e3;
    var lua_upvalueindex = function(i) {
      return LUA_REGISTRYINDEX - i;
    };
    var LUA_RIDX_MAINTHREAD = 1;
    var LUA_RIDX_GLOBALS = 2;
    var LUA_RIDX_LAST = LUA_RIDX_GLOBALS;
    var lua_Debug = class {
      constructor() {
        this.event = NaN;
        this.name = null;
        this.namewhat = null;
        this.what = null;
        this.source = null;
        this.currentline = NaN;
        this.linedefined = NaN;
        this.lastlinedefined = NaN;
        this.nups = NaN;
        this.nparams = NaN;
        this.isvararg = NaN;
        this.istailcall = NaN;
        this.short_src = null;
        this.i_ci = null;
      }
    };
    var LUA_HOOKCALL = 0;
    var LUA_HOOKRET = 1;
    var LUA_HOOKLINE = 2;
    var LUA_HOOKCOUNT = 3;
    var LUA_HOOKTAILCALL = 4;
    var LUA_MASKCALL = 1 << LUA_HOOKCALL;
    var LUA_MASKRET = 1 << LUA_HOOKRET;
    var LUA_MASKLINE = 1 << LUA_HOOKLINE;
    var LUA_MASKCOUNT = 1 << LUA_HOOKCOUNT;
    module.exports.LUA_HOOKCALL = LUA_HOOKCALL;
    module.exports.LUA_HOOKCOUNT = LUA_HOOKCOUNT;
    module.exports.LUA_HOOKLINE = LUA_HOOKLINE;
    module.exports.LUA_HOOKRET = LUA_HOOKRET;
    module.exports.LUA_HOOKTAILCALL = LUA_HOOKTAILCALL;
    module.exports.LUA_MASKCALL = LUA_MASKCALL;
    module.exports.LUA_MASKCOUNT = LUA_MASKCOUNT;
    module.exports.LUA_MASKLINE = LUA_MASKLINE;
    module.exports.LUA_MASKRET = LUA_MASKRET;
    module.exports.LUA_MINSTACK = LUA_MINSTACK;
    module.exports.LUA_MULTRET = -1;
    module.exports.LUA_OPADD = LUA_OPADD;
    module.exports.LUA_OPBAND = LUA_OPBAND;
    module.exports.LUA_OPBNOT = LUA_OPBNOT;
    module.exports.LUA_OPBOR = LUA_OPBOR;
    module.exports.LUA_OPBXOR = LUA_OPBXOR;
    module.exports.LUA_OPDIV = LUA_OPDIV;
    module.exports.LUA_OPEQ = LUA_OPEQ;
    module.exports.LUA_OPIDIV = LUA_OPIDIV;
    module.exports.LUA_OPLE = LUA_OPLE;
    module.exports.LUA_OPLT = LUA_OPLT;
    module.exports.LUA_OPMOD = LUA_OPMOD;
    module.exports.LUA_OPMUL = LUA_OPMUL;
    module.exports.LUA_OPPOW = LUA_OPPOW;
    module.exports.LUA_OPSHL = LUA_OPSHL;
    module.exports.LUA_OPSHR = LUA_OPSHR;
    module.exports.LUA_OPSUB = LUA_OPSUB;
    module.exports.LUA_OPUNM = LUA_OPUNM;
    module.exports.LUA_REGISTRYINDEX = LUA_REGISTRYINDEX;
    module.exports.LUA_RIDX_GLOBALS = LUA_RIDX_GLOBALS;
    module.exports.LUA_RIDX_LAST = LUA_RIDX_LAST;
    module.exports.LUA_RIDX_MAINTHREAD = LUA_RIDX_MAINTHREAD;
    module.exports.constant_types = constant_types;
    module.exports.lua_Debug = lua_Debug;
    module.exports.lua_upvalueindex = lua_upvalueindex;
    module.exports.thread_status = thread_status;
  }
});

// vendor/fengari/src/fengaricore.js
var require_fengaricore = __commonJS({
  "vendor/fengari/src/fengaricore.js"(exports, module) {
    var defs = require_defs();
    var FENGARI_VERSION_MAJOR = "0";
    var FENGARI_VERSION_MINOR = "1";
    var FENGARI_VERSION_NUM = 1;
    var FENGARI_VERSION_RELEASE = "5";
    var FENGARI_VERSION = "Fengari " + FENGARI_VERSION_MAJOR + "." + FENGARI_VERSION_MINOR;
    var FENGARI_RELEASE = FENGARI_VERSION + "." + FENGARI_VERSION_RELEASE;
    var FENGARI_AUTHORS = "B. Giannangeli, Daurnimator";
    var FENGARI_COPYRIGHT = FENGARI_RELEASE + "  Copyright (C) 2017-2019 " + FENGARI_AUTHORS + "\nBased on: " + defs.LUA_COPYRIGHT;
    module.exports.FENGARI_AUTHORS = FENGARI_AUTHORS;
    module.exports.FENGARI_COPYRIGHT = FENGARI_COPYRIGHT;
    module.exports.FENGARI_RELEASE = FENGARI_RELEASE;
    module.exports.FENGARI_VERSION = FENGARI_VERSION;
    module.exports.FENGARI_VERSION_MAJOR = FENGARI_VERSION_MAJOR;
    module.exports.FENGARI_VERSION_MINOR = FENGARI_VERSION_MINOR;
    module.exports.FENGARI_VERSION_NUM = FENGARI_VERSION_NUM;
    module.exports.FENGARI_VERSION_RELEASE = FENGARI_VERSION_RELEASE;
    module.exports.is_luastring = defs.is_luastring;
    module.exports.luastring_eq = defs.luastring_eq;
    module.exports.luastring_from = defs.luastring_from;
    module.exports.luastring_indexOf = defs.luastring_indexOf;
    module.exports.luastring_of = defs.luastring_of;
    module.exports.to_jsstring = defs.to_jsstring;
    module.exports.to_luastring = defs.to_luastring;
    module.exports.to_uristring = defs.to_uristring;
    module.exports.from_userstring = defs.from_userstring;
  }
});

// vendor/fengari/src/llimits.js
var require_llimits = __commonJS({
  "vendor/fengari/src/llimits.js"(exports, module) {
    "use strict";
    var lua_assert = function(c) {
      if (!c) throw Error("assertion failed");
    };
    module.exports.lua_assert = lua_assert;
    var api_check = function(l, e, msg) {
      if (!e) throw Error(msg);
    };
    module.exports.api_check = api_check;
    var LUAI_MAXCCALLS = 200;
    module.exports.LUAI_MAXCCALLS = LUAI_MAXCCALLS;
    var LUA_MINBUFFER = 32;
    module.exports.LUA_MINBUFFER = LUA_MINBUFFER;
    var luai_nummod = function(L, a, b) {
      let m = a % b;
      if (m * b < 0)
        m += b;
      return m;
    };
    module.exports.luai_nummod = luai_nummod;
    var MAX_INT = 2147483647;
    module.exports.MAX_INT = MAX_INT;
    var MIN_INT = -2147483648;
    module.exports.MIN_INT = MIN_INT;
  }
});

// vendor/fengari/src/ljstype.js
var require_ljstype = __commonJS({
  "vendor/fengari/src/ljstype.js"(exports, module) {
    "use strict";
    var { luastring_of } = require_defs();
    var luai_ctype_ = luastring_of(
      0,
      /* EOZ */
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      /* 0. */
      0,
      8,
      8,
      8,
      8,
      8,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      /* 1. */
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      12,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      /* 2. */
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      22,
      /* 3. */
      22,
      22,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      21,
      21,
      21,
      21,
      21,
      21,
      5,
      /* 4. */
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      /* 5. */
      5,
      5,
      5,
      4,
      4,
      4,
      4,
      5,
      4,
      21,
      21,
      21,
      21,
      21,
      21,
      5,
      /* 6. */
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      /* 7. */
      5,
      5,
      5,
      4,
      4,
      4,
      4,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      /* 8. */
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      /* 9. */
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      /* a. */
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      /* b. */
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      /* c. */
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      /* d. */
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      /* e. */
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      /* f. */
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    );
    var ALPHABIT = 0;
    var DIGITBIT = 1;
    var PRINTBIT = 2;
    var SPACEBIT = 3;
    var XDIGITBIT = 4;
    var lisdigit = function(c) {
      return (luai_ctype_[c + 1] & 1 << DIGITBIT) !== 0;
    };
    var lisxdigit = function(c) {
      return (luai_ctype_[c + 1] & 1 << XDIGITBIT) !== 0;
    };
    var lisprint = function(c) {
      return (luai_ctype_[c + 1] & 1 << PRINTBIT) !== 0;
    };
    var lisspace = function(c) {
      return (luai_ctype_[c + 1] & 1 << SPACEBIT) !== 0;
    };
    var lislalpha = function(c) {
      return (luai_ctype_[c + 1] & 1 << ALPHABIT) !== 0;
    };
    var lislalnum = function(c) {
      return (luai_ctype_[c + 1] & (1 << ALPHABIT | 1 << DIGITBIT)) !== 0;
    };
    module.exports.lisdigit = lisdigit;
    module.exports.lislalnum = lislalnum;
    module.exports.lislalpha = lislalpha;
    module.exports.lisprint = lisprint;
    module.exports.lisspace = lisspace;
    module.exports.lisxdigit = lisxdigit;
  }
});

// vendor/fengari/src/lstring.js
var require_lstring = __commonJS({
  "vendor/fengari/src/lstring.js"(exports, module) {
    "use strict";
    var {
      is_luastring,
      luastring_eq,
      luastring_from,
      to_luastring: to_luastring2
    } = require_defs();
    var { lua_assert } = require_llimits();
    var TString = class {
      constructor(L, str) {
        this.hash = null;
        this.realstring = str;
      }
      getstr() {
        return this.realstring;
      }
      tsslen() {
        return this.realstring.length;
      }
    };
    var luaS_eqlngstr = function(a, b) {
      lua_assert(a instanceof TString);
      lua_assert(b instanceof TString);
      return a == b || luastring_eq(a.realstring, b.realstring);
    };
    var luaS_hash = function(str) {
      lua_assert(is_luastring(str));
      let len = str.length;
      let s = "|";
      for (let i = 0; i < len; i++)
        s += str[i].toString(16);
      return s;
    };
    var luaS_hashlongstr = function(ts) {
      lua_assert(ts instanceof TString);
      if (ts.hash === null) {
        ts.hash = luaS_hash(ts.getstr());
      }
      return ts.hash;
    };
    var luaS_bless = function(L, str) {
      lua_assert(str instanceof Uint8Array);
      return new TString(L, str);
    };
    var luaS_new = function(L, str) {
      return luaS_bless(L, luastring_from(str));
    };
    var luaS_newliteral = function(L, str) {
      return luaS_bless(L, to_luastring2(str));
    };
    module.exports.luaS_eqlngstr = luaS_eqlngstr;
    module.exports.luaS_hash = luaS_hash;
    module.exports.luaS_hashlongstr = luaS_hashlongstr;
    module.exports.luaS_bless = luaS_bless;
    module.exports.luaS_new = luaS_new;
    module.exports.luaS_newliteral = luaS_newliteral;
    module.exports.TString = TString;
  }
});

// vendor/fengari/src/ltable.js
var require_ltable = __commonJS({
  "vendor/fengari/src/ltable.js"(exports, module) {
    "use strict";
    var {
      constant_types: {
        LUA_TBOOLEAN,
        LUA_TCCL,
        LUA_TLCF,
        LUA_TLCL,
        LUA_TLIGHTUSERDATA,
        LUA_TLNGSTR,
        LUA_TNIL,
        LUA_TNUMFLT,
        LUA_TNUMINT,
        LUA_TSHRSTR,
        LUA_TTABLE,
        LUA_TTHREAD,
        LUA_TUSERDATA
      },
      to_luastring: to_luastring2
    } = require_defs();
    var {
      LUA_MAXINTEGER
    } = require_luaconf();
    var { lua_assert } = require_llimits();
    var ldebug = require_ldebug();
    var lobject = require_lobject();
    var {
      luaS_hashlongstr,
      TString
    } = require_lstring();
    var lstate = require_lstate();
    var lightuserdata_hashes = /* @__PURE__ */ new WeakMap();
    var get_lightuserdata_hash = function(v) {
      let hash = lightuserdata_hashes.get(v);
      if (!hash) {
        hash = {};
        lightuserdata_hashes.set(v, hash);
      }
      return hash;
    };
    var table_hash = function(L, key) {
      switch (key.type) {
        case LUA_TNIL:
          return ldebug.luaG_runerror(L, to_luastring2("table index is nil", true));
        case LUA_TNUMFLT:
          if (isNaN(key.value))
            return ldebug.luaG_runerror(L, to_luastring2("table index is NaN", true));
        /* fall through */
        case LUA_TNUMINT:
        /* takes advantage of floats and integers being same in JS */
        case LUA_TBOOLEAN:
        case LUA_TTABLE:
        case LUA_TLCL:
        case LUA_TLCF:
        case LUA_TCCL:
        case LUA_TUSERDATA:
        case LUA_TTHREAD:
          return key.value;
        case LUA_TSHRSTR:
        case LUA_TLNGSTR:
          return luaS_hashlongstr(key.tsvalue());
        case LUA_TLIGHTUSERDATA: {
          let v = key.value;
          switch (typeof v) {
            case "string":
              return "*" + v;
            case "number":
              return "#" + v;
            case "boolean":
              return v ? "?true" : "?false";
            case "function":
              return get_lightuserdata_hash(v);
            case "object":
              if (v instanceof lstate.lua_State && v.l_G === L.l_G || v instanceof Table || v instanceof lobject.Udata || v instanceof lobject.LClosure || v instanceof lobject.CClosure) {
                return get_lightuserdata_hash(v);
              }
            /* fall through */
            default:
              return v;
          }
        }
        default:
          throw new Error("unknown key type: " + key.type);
      }
    };
    var Table = class {
      constructor(L) {
        this.id = L.l_G.id_counter++;
        this.strong = /* @__PURE__ */ new Map();
        this.dead_strong = /* @__PURE__ */ new Map();
        this.dead_weak = void 0;
        this.f = void 0;
        this.l = void 0;
        this.metatable = null;
        this.flags = ~0;
      }
    };
    var invalidateTMcache = function(t) {
      t.flags = 0;
    };
    var add = function(t, hash, key, value) {
      t.dead_strong.clear();
      t.dead_weak = void 0;
      let prev = null;
      let entry = {
        key,
        value,
        p: prev = t.l,
        n: void 0
      };
      if (!t.f) t.f = entry;
      if (prev) prev.n = entry;
      t.strong.set(hash, entry);
      t.l = entry;
    };
    var is_valid_weakmap_key = function(k) {
      return typeof k === "object" ? k !== null : typeof k === "function";
    };
    var mark_dead = function(t, hash) {
      let e = t.strong.get(hash);
      if (e) {
        e.key.setdeadvalue();
        e.value = void 0;
        let next = e.n;
        let prev = e.p;
        e.p = void 0;
        if (prev) prev.n = next;
        if (next) next.p = prev;
        if (t.f === e) t.f = next;
        if (t.l === e) t.l = prev;
        t.strong.delete(hash);
        if (is_valid_weakmap_key(hash)) {
          if (!t.dead_weak) t.dead_weak = /* @__PURE__ */ new WeakMap();
          t.dead_weak.set(hash, e);
        } else {
          t.dead_strong.set(hash, e);
        }
      }
    };
    var luaH_new = function(L) {
      return new Table(L);
    };
    var getgeneric = function(t, hash) {
      let v = t.strong.get(hash);
      return v ? v.value : lobject.luaO_nilobject;
    };
    var luaH_getint = function(t, key) {
      lua_assert(typeof key == "number" && (key | 0) === key);
      return getgeneric(t, key);
    };
    var luaH_getstr = function(t, key) {
      lua_assert(key instanceof TString);
      return getgeneric(t, luaS_hashlongstr(key));
    };
    var luaH_get = function(L, t, key) {
      lua_assert(key instanceof lobject.TValue);
      if (key.ttisnil() || key.ttisfloat() && isNaN(key.value))
        return lobject.luaO_nilobject;
      return getgeneric(t, table_hash(L, key));
    };
    var luaH_setint = function(t, key, value) {
      lua_assert(typeof key == "number" && (key | 0) === key && value instanceof lobject.TValue);
      let hash = key;
      if (value.ttisnil()) {
        mark_dead(t, hash);
        return;
      }
      let e = t.strong.get(hash);
      if (e) {
        let tv = e.value;
        tv.setfrom(value);
      } else {
        let k = new lobject.TValue(LUA_TNUMINT, key);
        let v = new lobject.TValue(value.type, value.value);
        add(t, hash, k, v);
      }
    };
    var luaH_setfrom = function(L, t, key, value) {
      lua_assert(key instanceof lobject.TValue);
      let hash = table_hash(L, key);
      if (value.ttisnil()) {
        mark_dead(t, hash);
        return;
      }
      let e = t.strong.get(hash);
      if (e) {
        e.value.setfrom(value);
      } else {
        let k;
        let kv = key.value;
        if (key.ttisfloat() && (kv | 0) === kv) {
          k = new lobject.TValue(LUA_TNUMINT, kv);
        } else {
          k = new lobject.TValue(key.type, kv);
        }
        let v = new lobject.TValue(value.type, value.value);
        add(t, hash, k, v);
      }
    };
    var luaH_getn = function(t) {
      let i = 0;
      let j = t.strong.size + 1;
      while (!luaH_getint(t, j).ttisnil()) {
        i = j;
        if (j > LUA_MAXINTEGER / 2) {
          i = 1;
          while (!luaH_getint(t, i).ttisnil()) i++;
          return i - 1;
        }
        j *= 2;
      }
      while (j - i > 1) {
        let m = Math.floor((i + j) / 2);
        if (luaH_getint(t, m).ttisnil()) j = m;
        else i = m;
      }
      return i;
    };
    var luaH_next = function(L, table, keyI) {
      let keyO = L.stack[keyI];
      let entry;
      if (keyO.type === LUA_TNIL) {
        entry = table.f;
        if (!entry)
          return false;
      } else {
        let hash = table_hash(L, keyO);
        entry = table.strong.get(hash);
        if (entry) {
          entry = entry.n;
          if (!entry)
            return false;
        } else {
          entry = table.dead_weak && table.dead_weak.get(hash) || table.dead_strong.get(hash);
          if (!entry)
            return ldebug.luaG_runerror(L, to_luastring2("invalid key to 'next'"));
          do {
            entry = entry.n;
            if (!entry)
              return false;
          } while (entry.key.ttisdeadkey());
        }
      }
      lobject.setobj2s(L, keyI, entry.key);
      lobject.setobj2s(L, keyI + 1, entry.value);
      return true;
    };
    module.exports.invalidateTMcache = invalidateTMcache;
    module.exports.luaH_get = luaH_get;
    module.exports.luaH_getint = luaH_getint;
    module.exports.luaH_getn = luaH_getn;
    module.exports.luaH_getstr = luaH_getstr;
    module.exports.luaH_setfrom = luaH_setfrom;
    module.exports.luaH_setint = luaH_setint;
    module.exports.luaH_new = luaH_new;
    module.exports.luaH_next = luaH_next;
    module.exports.Table = Table;
  }
});

// vendor/fengari/src/lopcodes.js
var require_lopcodes = __commonJS({
  "vendor/fengari/src/lopcodes.js"(exports, module) {
    "use strict";
    var OpCodes = [
      "MOVE",
      "LOADK",
      "LOADKX",
      "LOADBOOL",
      "LOADNIL",
      "GETUPVAL",
      "GETTABUP",
      "GETTABLE",
      "SETTABUP",
      "SETUPVAL",
      "SETTABLE",
      "NEWTABLE",
      "SELF",
      "ADD",
      "SUB",
      "MUL",
      "MOD",
      "POW",
      "DIV",
      "IDIV",
      "BAND",
      "BOR",
      "BXOR",
      "SHL",
      "SHR",
      "UNM",
      "BNOT",
      "NOT",
      "LEN",
      "CONCAT",
      "JMP",
      "EQ",
      "LT",
      "LE",
      "TEST",
      "TESTSET",
      "CALL",
      "TAILCALL",
      "RETURN",
      "FORLOOP",
      "FORPREP",
      "TFORCALL",
      "TFORLOOP",
      "SETLIST",
      "CLOSURE",
      "VARARG",
      "EXTRAARG"
    ];
    var OpCodesI = {
      OP_MOVE: 0,
      OP_LOADK: 1,
      OP_LOADKX: 2,
      OP_LOADBOOL: 3,
      OP_LOADNIL: 4,
      OP_GETUPVAL: 5,
      OP_GETTABUP: 6,
      OP_GETTABLE: 7,
      OP_SETTABUP: 8,
      OP_SETUPVAL: 9,
      OP_SETTABLE: 10,
      OP_NEWTABLE: 11,
      OP_SELF: 12,
      OP_ADD: 13,
      OP_SUB: 14,
      OP_MUL: 15,
      OP_MOD: 16,
      OP_POW: 17,
      OP_DIV: 18,
      OP_IDIV: 19,
      OP_BAND: 20,
      OP_BOR: 21,
      OP_BXOR: 22,
      OP_SHL: 23,
      OP_SHR: 24,
      OP_UNM: 25,
      OP_BNOT: 26,
      OP_NOT: 27,
      OP_LEN: 28,
      OP_CONCAT: 29,
      OP_JMP: 30,
      OP_EQ: 31,
      OP_LT: 32,
      OP_LE: 33,
      OP_TEST: 34,
      OP_TESTSET: 35,
      OP_CALL: 36,
      OP_TAILCALL: 37,
      OP_RETURN: 38,
      OP_FORLOOP: 39,
      OP_FORPREP: 40,
      OP_TFORCALL: 41,
      OP_TFORLOOP: 42,
      OP_SETLIST: 43,
      OP_CLOSURE: 44,
      OP_VARARG: 45,
      OP_EXTRAARG: 46
    };
    var OpArgN = 0;
    var OpArgU = 1;
    var OpArgR = 2;
    var OpArgK = 3;
    var iABC = 0;
    var iABx = 1;
    var iAsBx = 2;
    var iAx = 3;
    var luaP_opmodes = [
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC,
      /* OP_MOVE */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgN << 2 | iABx,
      /* OP_LOADK */
      0 << 7 | 1 << 6 | OpArgN << 4 | OpArgN << 2 | iABx,
      /* OP_LOADKX */
      0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC,
      /* OP_LOADBOOL */
      0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABC,
      /* OP_LOADNIL */
      0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABC,
      /* OP_GETUPVAL */
      0 << 7 | 1 << 6 | OpArgU << 4 | OpArgK << 2 | iABC,
      /* OP_GETTABUP */
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgK << 2 | iABC,
      /* OP_GETTABLE */
      0 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_SETTABUP */
      0 << 7 | 0 << 6 | OpArgU << 4 | OpArgN << 2 | iABC,
      /* OP_SETUPVAL */
      0 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_SETTABLE */
      0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC,
      /* OP_NEWTABLE */
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgK << 2 | iABC,
      /* OP_SELF */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_ADD */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_SUB */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_MUL */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_MOD */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_POW */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_DIV */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_IDIV */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_BAND */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_BOR */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_BXOR */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_SHL */
      0 << 7 | 1 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_SHR */
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC,
      /* OP_UNM */
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC,
      /* OP_BNOT */
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC,
      /* OP_NOT */
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iABC,
      /* OP_LEN */
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgR << 2 | iABC,
      /* OP_CONCAT */
      0 << 7 | 0 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx,
      /* OP_JMP */
      1 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_EQ */
      1 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_LT */
      1 << 7 | 0 << 6 | OpArgK << 4 | OpArgK << 2 | iABC,
      /* OP_LE */
      1 << 7 | 0 << 6 | OpArgN << 4 | OpArgU << 2 | iABC,
      /* OP_TEST */
      1 << 7 | 1 << 6 | OpArgR << 4 | OpArgU << 2 | iABC,
      /* OP_TESTSET */
      0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC,
      /* OP_CALL */
      0 << 7 | 1 << 6 | OpArgU << 4 | OpArgU << 2 | iABC,
      /* OP_TAILCALL */
      0 << 7 | 0 << 6 | OpArgU << 4 | OpArgN << 2 | iABC,
      /* OP_RETURN */
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx,
      /* OP_FORLOOP */
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx,
      /* OP_FORPREP */
      0 << 7 | 0 << 6 | OpArgN << 4 | OpArgU << 2 | iABC,
      /* OP_TFORCALL */
      0 << 7 | 1 << 6 | OpArgR << 4 | OpArgN << 2 | iAsBx,
      /* OP_TFORLOOP */
      0 << 7 | 0 << 6 | OpArgU << 4 | OpArgU << 2 | iABC,
      /* OP_SETLIST */
      0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABx,
      /* OP_CLOSURE */
      0 << 7 | 1 << 6 | OpArgU << 4 | OpArgN << 2 | iABC,
      /* OP_VARARG */
      0 << 7 | 0 << 6 | OpArgU << 4 | OpArgU << 2 | iAx
      /* OP_EXTRAARG */
    ];
    var getOpMode = function(m) {
      return luaP_opmodes[m] & 3;
    };
    var getBMode = function(m) {
      return luaP_opmodes[m] >> 4 & 3;
    };
    var getCMode = function(m) {
      return luaP_opmodes[m] >> 2 & 3;
    };
    var testAMode = function(m) {
      return luaP_opmodes[m] & 1 << 6;
    };
    var testTMode = function(m) {
      return luaP_opmodes[m] & 1 << 7;
    };
    var SIZE_C = 9;
    var SIZE_B = 9;
    var SIZE_Bx = SIZE_C + SIZE_B;
    var SIZE_A = 8;
    var SIZE_Ax = SIZE_C + SIZE_B + SIZE_A;
    var SIZE_OP = 6;
    var POS_OP = 0;
    var POS_A = POS_OP + SIZE_OP;
    var POS_C = POS_A + SIZE_A;
    var POS_B = POS_C + SIZE_C;
    var POS_Bx = POS_C;
    var POS_Ax = POS_A;
    var MAXARG_Bx = (1 << SIZE_Bx) - 1;
    var MAXARG_sBx = MAXARG_Bx >> 1;
    var MAXARG_Ax = (1 << SIZE_Ax) - 1;
    var MAXARG_A = (1 << SIZE_A) - 1;
    var MAXARG_B = (1 << SIZE_B) - 1;
    var MAXARG_C = (1 << SIZE_C) - 1;
    var BITRK = 1 << SIZE_B - 1;
    var MAXINDEXRK = BITRK - 1;
    var NO_REG = MAXARG_A;
    var ISK = function(x) {
      return x & BITRK;
    };
    var INDEXK = function(r) {
      return r & ~BITRK;
    };
    var RKASK = function(x) {
      return x | BITRK;
    };
    var MASK1 = function(n, p) {
      return ~(~0 << n) << p;
    };
    var MASK0 = function(n, p) {
      return ~MASK1(n, p);
    };
    var GET_OPCODE = function(i) {
      return i.opcode;
    };
    var SET_OPCODE = function(i, o) {
      i.code = i.code & MASK0(SIZE_OP, POS_OP) | o << POS_OP & MASK1(SIZE_OP, POS_OP);
      return fullins(i);
    };
    var setarg = function(i, v, pos, size) {
      i.code = i.code & MASK0(size, pos) | v << pos & MASK1(size, pos);
      return fullins(i);
    };
    var GETARG_A = function(i) {
      return i.A;
    };
    var SETARG_A = function(i, v) {
      return setarg(i, v, POS_A, SIZE_A);
    };
    var GETARG_B = function(i) {
      return i.B;
    };
    var SETARG_B = function(i, v) {
      return setarg(i, v, POS_B, SIZE_B);
    };
    var GETARG_C = function(i) {
      return i.C;
    };
    var SETARG_C = function(i, v) {
      return setarg(i, v, POS_C, SIZE_C);
    };
    var GETARG_Bx = function(i) {
      return i.Bx;
    };
    var SETARG_Bx = function(i, v) {
      return setarg(i, v, POS_Bx, SIZE_Bx);
    };
    var GETARG_Ax = function(i) {
      return i.Ax;
    };
    var SETARG_Ax = function(i, v) {
      return setarg(i, v, POS_Ax, SIZE_Ax);
    };
    var GETARG_sBx = function(i) {
      return i.sBx;
    };
    var SETARG_sBx = function(i, b) {
      return SETARG_Bx(i, b + MAXARG_sBx);
    };
    var fullins = function(ins) {
      if (typeof ins === "number") {
        return {
          code: ins,
          opcode: ins >> POS_OP & MASK1(SIZE_OP, 0),
          A: ins >> POS_A & MASK1(SIZE_A, 0),
          B: ins >> POS_B & MASK1(SIZE_B, 0),
          C: ins >> POS_C & MASK1(SIZE_C, 0),
          Bx: ins >> POS_Bx & MASK1(SIZE_Bx, 0),
          Ax: ins >> POS_Ax & MASK1(SIZE_Ax, 0),
          sBx: (ins >> POS_Bx & MASK1(SIZE_Bx, 0)) - MAXARG_sBx
        };
      } else {
        let i = ins.code;
        ins.opcode = i >> POS_OP & MASK1(SIZE_OP, 0);
        ins.A = i >> POS_A & MASK1(SIZE_A, 0);
        ins.B = i >> POS_B & MASK1(SIZE_B, 0);
        ins.C = i >> POS_C & MASK1(SIZE_C, 0);
        ins.Bx = i >> POS_Bx & MASK1(SIZE_Bx, 0);
        ins.Ax = i >> POS_Ax & MASK1(SIZE_Ax, 0);
        ins.sBx = (i >> POS_Bx & MASK1(SIZE_Bx, 0)) - MAXARG_sBx;
        return ins;
      }
    };
    var CREATE_ABC = function(o, a, b, c) {
      return fullins(o << POS_OP | a << POS_A | b << POS_B | c << POS_C);
    };
    var CREATE_ABx = function(o, a, bc) {
      return fullins(o << POS_OP | a << POS_A | bc << POS_Bx);
    };
    var CREATE_Ax = function(o, a) {
      return fullins(o << POS_OP | a << POS_Ax);
    };
    var LFIELDS_PER_FLUSH = 50;
    module.exports.BITRK = BITRK;
    module.exports.CREATE_ABC = CREATE_ABC;
    module.exports.CREATE_ABx = CREATE_ABx;
    module.exports.CREATE_Ax = CREATE_Ax;
    module.exports.GET_OPCODE = GET_OPCODE;
    module.exports.GETARG_A = GETARG_A;
    module.exports.GETARG_B = GETARG_B;
    module.exports.GETARG_C = GETARG_C;
    module.exports.GETARG_Bx = GETARG_Bx;
    module.exports.GETARG_Ax = GETARG_Ax;
    module.exports.GETARG_sBx = GETARG_sBx;
    module.exports.INDEXK = INDEXK;
    module.exports.ISK = ISK;
    module.exports.LFIELDS_PER_FLUSH = LFIELDS_PER_FLUSH;
    module.exports.MAXARG_A = MAXARG_A;
    module.exports.MAXARG_Ax = MAXARG_Ax;
    module.exports.MAXARG_B = MAXARG_B;
    module.exports.MAXARG_Bx = MAXARG_Bx;
    module.exports.MAXARG_C = MAXARG_C;
    module.exports.MAXARG_sBx = MAXARG_sBx;
    module.exports.MAXINDEXRK = MAXINDEXRK;
    module.exports.NO_REG = NO_REG;
    module.exports.OpArgK = OpArgK;
    module.exports.OpArgN = OpArgN;
    module.exports.OpArgR = OpArgR;
    module.exports.OpArgU = OpArgU;
    module.exports.OpCodes = OpCodes;
    module.exports.OpCodesI = OpCodesI;
    module.exports.POS_A = POS_A;
    module.exports.POS_Ax = POS_Ax;
    module.exports.POS_B = POS_B;
    module.exports.POS_Bx = POS_Bx;
    module.exports.POS_C = POS_C;
    module.exports.POS_OP = POS_OP;
    module.exports.RKASK = RKASK;
    module.exports.SETARG_A = SETARG_A;
    module.exports.SETARG_Ax = SETARG_Ax;
    module.exports.SETARG_B = SETARG_B;
    module.exports.SETARG_Bx = SETARG_Bx;
    module.exports.SETARG_C = SETARG_C;
    module.exports.SETARG_sBx = SETARG_sBx;
    module.exports.SET_OPCODE = SET_OPCODE;
    module.exports.SIZE_A = SIZE_A;
    module.exports.SIZE_Ax = SIZE_Ax;
    module.exports.SIZE_B = SIZE_B;
    module.exports.SIZE_Bx = SIZE_Bx;
    module.exports.SIZE_C = SIZE_C;
    module.exports.SIZE_OP = SIZE_OP;
    module.exports.fullins = fullins;
    module.exports.getBMode = getBMode;
    module.exports.getCMode = getCMode;
    module.exports.getOpMode = getOpMode;
    module.exports.iABC = iABC;
    module.exports.iABx = iABx;
    module.exports.iAsBx = iAsBx;
    module.exports.iAx = iAx;
    module.exports.testAMode = testAMode;
    module.exports.testTMode = testTMode;
  }
});

// vendor/fengari/src/lvm.js
var require_lvm = __commonJS({
  "vendor/fengari/src/lvm.js"(exports, module) {
    "use strict";
    var {
      LUA_MASKLINE,
      LUA_MASKCOUNT,
      LUA_MULTRET,
      constant_types: {
        LUA_TBOOLEAN,
        LUA_TLCF,
        LUA_TLIGHTUSERDATA,
        LUA_TLNGSTR,
        LUA_TNIL,
        LUA_TNUMBER,
        LUA_TNUMFLT,
        LUA_TNUMINT,
        LUA_TSHRSTR,
        LUA_TTABLE,
        LUA_TUSERDATA
      },
      to_luastring: to_luastring2
    } = require_defs();
    var {
      INDEXK,
      ISK,
      LFIELDS_PER_FLUSH,
      OpCodesI: {
        OP_ADD,
        OP_BAND,
        OP_BNOT,
        OP_BOR,
        OP_BXOR,
        OP_CALL,
        OP_CLOSURE,
        OP_CONCAT,
        OP_DIV,
        OP_EQ,
        OP_EXTRAARG,
        OP_FORLOOP,
        OP_FORPREP,
        OP_GETTABLE,
        OP_GETTABUP,
        OP_GETUPVAL,
        OP_IDIV,
        OP_JMP,
        OP_LE,
        OP_LEN,
        OP_LOADBOOL,
        OP_LOADK,
        OP_LOADKX,
        OP_LOADNIL,
        OP_LT,
        OP_MOD,
        OP_MOVE,
        OP_MUL,
        OP_NEWTABLE,
        OP_NOT,
        OP_POW,
        OP_RETURN,
        OP_SELF,
        OP_SETLIST,
        OP_SETTABLE,
        OP_SETTABUP,
        OP_SETUPVAL,
        OP_SHL,
        OP_SHR,
        OP_SUB,
        OP_TAILCALL,
        OP_TEST,
        OP_TESTSET,
        OP_TFORCALL,
        OP_TFORLOOP,
        OP_UNM,
        OP_VARARG
      }
    } = require_lopcodes();
    var {
      LUA_MAXINTEGER,
      LUA_MININTEGER,
      lua_numbertointeger
    } = require_luaconf();
    var {
      lua_assert,
      luai_nummod
    } = require_llimits();
    var lobject = require_lobject();
    var lfunc = require_lfunc();
    var lstate = require_lstate();
    var {
      luaS_bless,
      luaS_eqlngstr,
      luaS_hashlongstr
    } = require_lstring();
    var ldo = require_ldo();
    var ltm = require_ltm();
    var ltable = require_ltable();
    var ldebug = require_ldebug();
    var luaV_finishOp = function(L) {
      let ci = L.ci;
      let base = ci.l_base;
      let inst = ci.l_code[ci.l_savedpc - 1];
      let op = inst.opcode;
      switch (op) {
        /* finish its execution */
        case OP_ADD:
        case OP_SUB:
        case OP_MUL:
        case OP_DIV:
        case OP_IDIV:
        case OP_BAND:
        case OP_BOR:
        case OP_BXOR:
        case OP_SHL:
        case OP_SHR:
        case OP_MOD:
        case OP_POW:
        case OP_UNM:
        case OP_BNOT:
        case OP_LEN:
        case OP_GETTABUP:
        case OP_GETTABLE:
        case OP_SELF: {
          lobject.setobjs2s(L, base + inst.A, L.top - 1);
          delete L.stack[--L.top];
          break;
        }
        case OP_LE:
        case OP_LT:
        case OP_EQ: {
          let res = !L.stack[L.top - 1].l_isfalse();
          delete L.stack[--L.top];
          if (ci.callstatus & lstate.CIST_LEQ) {
            lua_assert(op === OP_LE);
            ci.callstatus ^= lstate.CIST_LEQ;
            res = !res;
          }
          lua_assert(ci.l_code[ci.l_savedpc].opcode === OP_JMP);
          if (res !== (inst.A ? true : false))
            ci.l_savedpc++;
          break;
        }
        case OP_CONCAT: {
          let top = L.top - 1;
          let b = inst.B;
          let total = top - 1 - (base + b);
          lobject.setobjs2s(L, top - 2, top);
          if (total > 1) {
            L.top = top - 1;
            luaV_concat(L, total);
          }
          lobject.setobjs2s(L, ci.l_base + inst.A, L.top - 1);
          ldo.adjust_top(L, ci.top);
          break;
        }
        case OP_TFORCALL: {
          lua_assert(ci.l_code[ci.l_savedpc].opcode === OP_TFORLOOP);
          ldo.adjust_top(L, ci.top);
          break;
        }
        case OP_CALL: {
          if (inst.C - 1 >= 0)
            ldo.adjust_top(L, ci.top);
          break;
        }
      }
    };
    var RA = function(L, base, i) {
      return base + i.A;
    };
    var RB = function(L, base, i) {
      return base + i.B;
    };
    var RKB = function(L, base, k, i) {
      return ISK(i.B) ? k[INDEXK(i.B)] : L.stack[base + i.B];
    };
    var RKC = function(L, base, k, i) {
      return ISK(i.C) ? k[INDEXK(i.C)] : L.stack[base + i.C];
    };
    var luaV_execute = function(L) {
      let ci = L.ci;
      ci.callstatus |= lstate.CIST_FRESH;
      newframe:
        for (; ; ) {
          lua_assert(ci === L.ci);
          let cl = ci.func.value;
          let k = cl.p.k;
          let base = ci.l_base;
          let i = ci.l_code[ci.l_savedpc++];
          if (L.hookmask & (LUA_MASKLINE | LUA_MASKCOUNT)) {
            ldebug.luaG_traceexec(L);
          }
          let ra = RA(L, base, i);
          let opcode = i.opcode;
          switch (opcode) {
            case OP_MOVE: {
              lobject.setobjs2s(L, ra, RB(L, base, i));
              break;
            }
            case OP_LOADK: {
              let konst = k[i.Bx];
              lobject.setobj2s(L, ra, konst);
              break;
            }
            case OP_LOADKX: {
              lua_assert(ci.l_code[ci.l_savedpc].opcode === OP_EXTRAARG);
              let konst = k[ci.l_code[ci.l_savedpc++].Ax];
              lobject.setobj2s(L, ra, konst);
              break;
            }
            case OP_LOADBOOL: {
              L.stack[ra].setbvalue(i.B !== 0);
              if (i.C !== 0)
                ci.l_savedpc++;
              break;
            }
            case OP_LOADNIL: {
              for (let j = 0; j <= i.B; j++)
                L.stack[ra + j].setnilvalue();
              break;
            }
            case OP_GETUPVAL: {
              let b = i.B;
              lobject.setobj2s(L, ra, cl.upvals[b]);
              break;
            }
            case OP_GETTABUP: {
              let upval = cl.upvals[i.B];
              let rc = RKC(L, base, k, i);
              luaV_gettable(L, upval, rc, ra);
              break;
            }
            case OP_GETTABLE: {
              let rb = L.stack[RB(L, base, i)];
              let rc = RKC(L, base, k, i);
              luaV_gettable(L, rb, rc, ra);
              break;
            }
            case OP_SETTABUP: {
              let upval = cl.upvals[i.A];
              let rb = RKB(L, base, k, i);
              let rc = RKC(L, base, k, i);
              settable(L, upval, rb, rc);
              break;
            }
            case OP_SETUPVAL: {
              let uv = cl.upvals[i.B];
              uv.setfrom(L.stack[ra]);
              break;
            }
            case OP_SETTABLE: {
              let table = L.stack[ra];
              let key = RKB(L, base, k, i);
              let v = RKC(L, base, k, i);
              settable(L, table, key, v);
              break;
            }
            case OP_NEWTABLE: {
              L.stack[ra].sethvalue(ltable.luaH_new(L));
              break;
            }
            case OP_SELF: {
              let rb = RB(L, base, i);
              let rc = RKC(L, base, k, i);
              lobject.setobjs2s(L, ra + 1, rb);
              luaV_gettable(L, L.stack[rb], rc, ra);
              break;
            }
            case OP_ADD: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if (op1.ttisinteger() && op2.ttisinteger()) {
                L.stack[ra].setivalue(op1.value + op2.value | 0);
              } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                L.stack[ra].setfltvalue(numberop1 + numberop2);
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_ADD);
              }
              break;
            }
            case OP_SUB: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if (op1.ttisinteger() && op2.ttisinteger()) {
                L.stack[ra].setivalue(op1.value - op2.value | 0);
              } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                L.stack[ra].setfltvalue(numberop1 - numberop2);
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_SUB);
              }
              break;
            }
            case OP_MUL: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if (op1.ttisinteger() && op2.ttisinteger()) {
                L.stack[ra].setivalue(luaV_imul(op1.value, op2.value));
              } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                L.stack[ra].setfltvalue(numberop1 * numberop2);
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_MUL);
              }
              break;
            }
            case OP_MOD: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if (op1.ttisinteger() && op2.ttisinteger()) {
                L.stack[ra].setivalue(luaV_mod(L, op1.value, op2.value));
              } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                L.stack[ra].setfltvalue(luai_nummod(L, numberop1, numberop2));
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_MOD);
              }
              break;
            }
            case OP_POW: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                L.stack[ra].setfltvalue(Math.pow(numberop1, numberop2));
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_POW);
              }
              break;
            }
            case OP_DIV: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                L.stack[ra].setfltvalue(numberop1 / numberop2);
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_DIV);
              }
              break;
            }
            case OP_IDIV: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if (op1.ttisinteger() && op2.ttisinteger()) {
                L.stack[ra].setivalue(luaV_div(L, op1.value, op2.value));
              } else if ((numberop1 = tonumber(op1)) !== false && (numberop2 = tonumber(op2)) !== false) {
                L.stack[ra].setfltvalue(Math.floor(numberop1 / numberop2));
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_IDIV);
              }
              break;
            }
            case OP_BAND: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if ((numberop1 = tointeger(op1)) !== false && (numberop2 = tointeger(op2)) !== false) {
                L.stack[ra].setivalue(numberop1 & numberop2);
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_BAND);
              }
              break;
            }
            case OP_BOR: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if ((numberop1 = tointeger(op1)) !== false && (numberop2 = tointeger(op2)) !== false) {
                L.stack[ra].setivalue(numberop1 | numberop2);
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_BOR);
              }
              break;
            }
            case OP_BXOR: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if ((numberop1 = tointeger(op1)) !== false && (numberop2 = tointeger(op2)) !== false) {
                L.stack[ra].setivalue(numberop1 ^ numberop2);
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_BXOR);
              }
              break;
            }
            case OP_SHL: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if ((numberop1 = tointeger(op1)) !== false && (numberop2 = tointeger(op2)) !== false) {
                L.stack[ra].setivalue(luaV_shiftl(numberop1, numberop2));
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_SHL);
              }
              break;
            }
            case OP_SHR: {
              let op1 = RKB(L, base, k, i);
              let op2 = RKC(L, base, k, i);
              let numberop1, numberop2;
              if ((numberop1 = tointeger(op1)) !== false && (numberop2 = tointeger(op2)) !== false) {
                L.stack[ra].setivalue(luaV_shiftl(numberop1, -numberop2));
              } else {
                ltm.luaT_trybinTM(L, op1, op2, L.stack[ra], ltm.TMS.TM_SHR);
              }
              break;
            }
            case OP_UNM: {
              let op = L.stack[RB(L, base, i)];
              let numberop;
              if (op.ttisinteger()) {
                L.stack[ra].setivalue(-op.value | 0);
              } else if ((numberop = tonumber(op)) !== false) {
                L.stack[ra].setfltvalue(-numberop);
              } else {
                ltm.luaT_trybinTM(L, op, op, L.stack[ra], ltm.TMS.TM_UNM);
              }
              break;
            }
            case OP_BNOT: {
              let op = L.stack[RB(L, base, i)];
              if (op.ttisinteger()) {
                L.stack[ra].setivalue(~op.value);
              } else {
                ltm.luaT_trybinTM(L, op, op, L.stack[ra], ltm.TMS.TM_BNOT);
              }
              break;
            }
            case OP_NOT: {
              let op = L.stack[RB(L, base, i)];
              L.stack[ra].setbvalue(op.l_isfalse());
              break;
            }
            case OP_LEN: {
              luaV_objlen(L, L.stack[ra], L.stack[RB(L, base, i)]);
              break;
            }
            case OP_CONCAT: {
              let b = i.B;
              let c = i.C;
              L.top = base + c + 1;
              luaV_concat(L, c - b + 1);
              let rb = base + b;
              lobject.setobjs2s(L, ra, rb);
              ldo.adjust_top(L, ci.top);
              break;
            }
            case OP_JMP: {
              dojump(L, ci, i, 0);
              break;
            }
            case OP_EQ: {
              if (luaV_equalobj(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                ci.l_savedpc++;
              else
                donextjump(L, ci);
              break;
            }
            case OP_LT: {
              if (luaV_lessthan(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                ci.l_savedpc++;
              else
                donextjump(L, ci);
              break;
            }
            case OP_LE: {
              if (luaV_lessequal(L, RKB(L, base, k, i), RKC(L, base, k, i)) !== i.A)
                ci.l_savedpc++;
              else
                donextjump(L, ci);
              break;
            }
            case OP_TEST: {
              if (i.C ? L.stack[ra].l_isfalse() : !L.stack[ra].l_isfalse())
                ci.l_savedpc++;
              else
                donextjump(L, ci);
              break;
            }
            case OP_TESTSET: {
              let rbIdx = RB(L, base, i);
              let rb = L.stack[rbIdx];
              if (i.C ? rb.l_isfalse() : !rb.l_isfalse())
                ci.l_savedpc++;
              else {
                lobject.setobjs2s(L, ra, rbIdx);
                donextjump(L, ci);
              }
              break;
            }
            case OP_CALL: {
              let b = i.B;
              let nresults = i.C - 1;
              if (b !== 0) ldo.adjust_top(L, ra + b);
              if (ldo.luaD_precall(L, ra, nresults)) {
                if (nresults >= 0)
                  ldo.adjust_top(L, ci.top);
              } else {
                ci = L.ci;
                continue newframe;
              }
              break;
            }
            case OP_TAILCALL: {
              let b = i.B;
              if (b !== 0) ldo.adjust_top(L, ra + b);
              if (ldo.luaD_precall(L, ra, LUA_MULTRET)) {
              } else {
                let nci = L.ci;
                let oci = nci.previous;
                let nfunc = nci.func;
                let nfuncOff = nci.funcOff;
                let ofuncOff = oci.funcOff;
                let lim = nci.l_base + nfunc.value.p.numparams;
                if (cl.p.p.length > 0) lfunc.luaF_close(L, oci.l_base);
                for (let aux = 0; nfuncOff + aux < lim; aux++)
                  lobject.setobjs2s(L, ofuncOff + aux, nfuncOff + aux);
                oci.l_base = ofuncOff + (nci.l_base - nfuncOff);
                oci.top = ofuncOff + (L.top - nfuncOff);
                ldo.adjust_top(L, oci.top);
                oci.l_code = nci.l_code;
                oci.l_savedpc = nci.l_savedpc;
                oci.callstatus |= lstate.CIST_TAIL;
                oci.next = null;
                ci = L.ci = oci;
                lua_assert(L.top === oci.l_base + L.stack[ofuncOff].value.p.maxstacksize);
                continue newframe;
              }
              break;
            }
            case OP_RETURN: {
              if (cl.p.p.length > 0) lfunc.luaF_close(L, base);
              let b = ldo.luaD_poscall(L, ci, ra, i.B !== 0 ? i.B - 1 : L.top - ra);
              if (ci.callstatus & lstate.CIST_FRESH)
                return;
              ci = L.ci;
              if (b) ldo.adjust_top(L, ci.top);
              lua_assert(ci.callstatus & lstate.CIST_LUA);
              lua_assert(ci.l_code[ci.l_savedpc - 1].opcode === OP_CALL);
              continue newframe;
            }
            case OP_FORLOOP: {
              if (L.stack[ra].ttisinteger()) {
                let step = L.stack[ra + 2].value;
                let idx = L.stack[ra].value + step | 0;
                let limit = L.stack[ra + 1].value;
                if (0 < step ? idx <= limit : limit <= idx) {
                  ci.l_savedpc += i.sBx;
                  L.stack[ra].chgivalue(idx);
                  L.stack[ra + 3].setivalue(idx);
                }
              } else {
                let step = L.stack[ra + 2].value;
                let idx = L.stack[ra].value + step;
                let limit = L.stack[ra + 1].value;
                if (0 < step ? idx <= limit : limit <= idx) {
                  ci.l_savedpc += i.sBx;
                  L.stack[ra].chgfltvalue(idx);
                  L.stack[ra + 3].setfltvalue(idx);
                }
              }
              break;
            }
            case OP_FORPREP: {
              let init = L.stack[ra];
              let plimit = L.stack[ra + 1];
              let pstep = L.stack[ra + 2];
              let forlim;
              if (init.ttisinteger() && pstep.ttisinteger() && (forlim = forlimit(plimit, pstep.value))) {
                let initv = forlim.stopnow ? 0 : init.value;
                plimit.value = forlim.ilimit;
                init.value = initv - pstep.value | 0;
              } else {
                let nlimit, nstep, ninit;
                if ((nlimit = tonumber(plimit)) === false)
                  ldebug.luaG_runerror(L, to_luastring2("'for' limit must be a number", true));
                L.stack[ra + 1].setfltvalue(nlimit);
                if ((nstep = tonumber(pstep)) === false)
                  ldebug.luaG_runerror(L, to_luastring2("'for' step must be a number", true));
                L.stack[ra + 2].setfltvalue(nstep);
                if ((ninit = tonumber(init)) === false)
                  ldebug.luaG_runerror(L, to_luastring2("'for' initial value must be a number", true));
                L.stack[ra].setfltvalue(ninit - nstep);
              }
              ci.l_savedpc += i.sBx;
              break;
            }
            case OP_TFORCALL: {
              let cb = ra + 3;
              lobject.setobjs2s(L, cb + 2, ra + 2);
              lobject.setobjs2s(L, cb + 1, ra + 1);
              lobject.setobjs2s(L, cb, ra);
              ldo.adjust_top(L, cb + 3);
              ldo.luaD_call(L, cb, i.C);
              ldo.adjust_top(L, ci.top);
              i = ci.l_code[ci.l_savedpc++];
              ra = RA(L, base, i);
              lua_assert(i.opcode === OP_TFORLOOP);
            }
            /* fall through */
            case OP_TFORLOOP: {
              if (!L.stack[ra + 1].ttisnil()) {
                lobject.setobjs2s(L, ra, ra + 1);
                ci.l_savedpc += i.sBx;
              }
              break;
            }
            case OP_SETLIST: {
              let n = i.B;
              let c = i.C;
              if (n === 0) n = L.top - ra - 1;
              if (c === 0) {
                lua_assert(ci.l_code[ci.l_savedpc].opcode === OP_EXTRAARG);
                c = ci.l_code[ci.l_savedpc++].Ax;
              }
              let h = L.stack[ra].value;
              let last = (c - 1) * LFIELDS_PER_FLUSH + n;
              for (; n > 0; n--) {
                ltable.luaH_setint(h, last--, L.stack[ra + n]);
              }
              ldo.adjust_top(L, ci.top);
              break;
            }
            case OP_CLOSURE: {
              let p = cl.p.p[i.Bx];
              let ncl = getcached(p, cl.upvals, L.stack, base);
              if (ncl === null)
                pushclosure(L, p, cl.upvals, base, ra);
              else
                L.stack[ra].setclLvalue(ncl);
              break;
            }
            case OP_VARARG: {
              let b = i.B - 1;
              let n = base - ci.funcOff - cl.p.numparams - 1;
              let j;
              if (n < 0)
                n = 0;
              if (b < 0) {
                b = n;
                ldo.luaD_checkstack(L, n);
                ldo.adjust_top(L, ra + n);
              }
              for (j = 0; j < b && j < n; j++)
                lobject.setobjs2s(L, ra + j, base - n + j);
              for (; j < b; j++)
                L.stack[ra + j].setnilvalue();
              break;
            }
            case OP_EXTRAARG: {
              throw Error("invalid opcode");
            }
          }
        }
    };
    var dojump = function(L, ci, i, e) {
      let a = i.A;
      if (a !== 0) lfunc.luaF_close(L, ci.l_base + a - 1);
      ci.l_savedpc += i.sBx + e;
    };
    var donextjump = function(L, ci) {
      dojump(L, ci, ci.l_code[ci.l_savedpc], 1);
    };
    var luaV_lessthan = function(L, l, r) {
      if (l.ttisnumber() && r.ttisnumber())
        return LTnum(l, r) ? 1 : 0;
      else if (l.ttisstring() && r.ttisstring())
        return l_strcmp(l.tsvalue(), r.tsvalue()) < 0 ? 1 : 0;
      else {
        let res = ltm.luaT_callorderTM(L, l, r, ltm.TMS.TM_LT);
        if (res === null)
          ldebug.luaG_ordererror(L, l, r);
        return res ? 1 : 0;
      }
    };
    var luaV_lessequal = function(L, l, r) {
      let res;
      if (l.ttisnumber() && r.ttisnumber())
        return LEnum(l, r) ? 1 : 0;
      else if (l.ttisstring() && r.ttisstring())
        return l_strcmp(l.tsvalue(), r.tsvalue()) <= 0 ? 1 : 0;
      else {
        res = ltm.luaT_callorderTM(L, l, r, ltm.TMS.TM_LE);
        if (res !== null)
          return res ? 1 : 0;
      }
      L.ci.callstatus |= lstate.CIST_LEQ;
      res = ltm.luaT_callorderTM(L, r, l, ltm.TMS.TM_LT);
      L.ci.callstatus ^= lstate.CIST_LEQ;
      if (res === null)
        ldebug.luaG_ordererror(L, l, r);
      return res ? 0 : 1;
    };
    var luaV_equalobj = function(L, t1, t2) {
      if (t1.ttype() !== t2.ttype()) {
        if (t1.ttnov() !== t2.ttnov() || t1.ttnov() !== LUA_TNUMBER)
          return 0;
        else {
          return t1.value === t2.value ? 1 : 0;
        }
      }
      let tm;
      switch (t1.ttype()) {
        case LUA_TNIL:
          return 1;
        case LUA_TBOOLEAN:
          return t1.value == t2.value ? 1 : 0;
        // Might be 1 or true
        case LUA_TLIGHTUSERDATA:
        case LUA_TNUMINT:
        case LUA_TNUMFLT:
        case LUA_TLCF:
          return t1.value === t2.value ? 1 : 0;
        case LUA_TSHRSTR:
        case LUA_TLNGSTR: {
          return luaS_eqlngstr(t1.tsvalue(), t2.tsvalue()) ? 1 : 0;
        }
        case LUA_TUSERDATA:
        case LUA_TTABLE:
          if (t1.value === t2.value) return 1;
          else if (L === null) return 0;
          tm = ltm.fasttm(L, t1.value.metatable, ltm.TMS.TM_EQ);
          if (tm === null)
            tm = ltm.fasttm(L, t2.value.metatable, ltm.TMS.TM_EQ);
          break;
        default:
          return t1.value === t2.value ? 1 : 0;
      }
      if (tm === null)
        return 0;
      let tv = new lobject.TValue();
      ltm.luaT_callTM(L, tm, t1, t2, tv, 1);
      return tv.l_isfalse() ? 0 : 1;
    };
    var luaV_rawequalobj = function(t1, t2) {
      return luaV_equalobj(null, t1, t2);
    };
    var forlimit = function(obj, step) {
      let stopnow = false;
      let ilimit = luaV_tointeger(obj, step < 0 ? 2 : 1);
      if (ilimit === false) {
        let n = tonumber(obj);
        if (n === false)
          return false;
        if (0 < n) {
          ilimit = LUA_MAXINTEGER;
          if (step < 0) stopnow = true;
        } else {
          ilimit = LUA_MININTEGER;
          if (step >= 0) stopnow = true;
        }
      }
      return {
        stopnow,
        ilimit
      };
    };
    var luaV_tointeger = function(obj, mode) {
      if (obj.ttisfloat()) {
        let n = obj.value;
        let f = Math.floor(n);
        if (n !== f) {
          if (mode === 0)
            return false;
          else if (mode > 1)
            f += 1;
        }
        return lua_numbertointeger(f);
      } else if (obj.ttisinteger()) {
        return obj.value;
      } else if (cvt2num(obj)) {
        let v = new lobject.TValue();
        if (lobject.luaO_str2num(obj.svalue(), v) === obj.vslen() + 1)
          return luaV_tointeger(v, mode);
      }
      return false;
    };
    var tointeger = function(o) {
      return o.ttisinteger() ? o.value : luaV_tointeger(o, 0);
    };
    var tonumber = function(o) {
      if (o.ttnov() === LUA_TNUMBER)
        return o.value;
      if (cvt2num(o)) {
        let v = new lobject.TValue();
        if (lobject.luaO_str2num(o.svalue(), v) === o.vslen() + 1)
          return v.value;
      }
      return false;
    };
    var LTnum = function(l, r) {
      return l.value < r.value;
    };
    var LEnum = function(l, r) {
      return l.value <= r.value;
    };
    var l_strcmp = function(ls, rs) {
      let l = luaS_hashlongstr(ls);
      let r = luaS_hashlongstr(rs);
      if (l === r)
        return 0;
      else if (l < r)
        return -1;
      else
        return 1;
    };
    var luaV_objlen = function(L, ra, rb) {
      let tm;
      switch (rb.ttype()) {
        case LUA_TTABLE: {
          let h = rb.value;
          tm = ltm.fasttm(L, h.metatable, ltm.TMS.TM_LEN);
          if (tm !== null) break;
          ra.setivalue(ltable.luaH_getn(h));
          return;
        }
        case LUA_TSHRSTR:
        case LUA_TLNGSTR:
          ra.setivalue(rb.vslen());
          return;
        default: {
          tm = ltm.luaT_gettmbyobj(L, rb, ltm.TMS.TM_LEN);
          if (tm.ttisnil())
            ldebug.luaG_typeerror(L, rb, to_luastring2("get length of", true));
          break;
        }
      }
      ltm.luaT_callTM(L, tm, rb, rb, ra, 1);
    };
    var luaV_imul = Math.imul || function(a, b) {
      let aHi = a >>> 16 & 65535;
      let aLo = a & 65535;
      let bHi = b >>> 16 & 65535;
      let bLo = b & 65535;
      return aLo * bLo + (aHi * bLo + aLo * bHi << 16 >>> 0) | 0;
    };
    var luaV_div = function(L, m, n) {
      if (n === 0)
        ldebug.luaG_runerror(L, to_luastring2("attempt to divide by zero"));
      return Math.floor(m / n) | 0;
    };
    var luaV_mod = function(L, m, n) {
      if (n === 0)
        ldebug.luaG_runerror(L, to_luastring2("attempt to perform 'n%%0'"));
      return m - Math.floor(m / n) * n | 0;
    };
    var NBITS = 32;
    var luaV_shiftl = function(x, y) {
      if (y < 0) {
        if (y <= -NBITS) return 0;
        else return x >>> -y;
      } else {
        if (y >= NBITS) return 0;
        else return x << y;
      }
    };
    var getcached = function(p, encup, stack, base) {
      let c = p.cache;
      if (c !== null) {
        let uv = p.upvalues;
        let nup = uv.length;
        for (let i = 0; i < nup; i++) {
          let v = uv[i].instack ? stack[base + uv[i].idx] : encup[uv[i].idx];
          if (c.upvals[i] !== v)
            return null;
        }
      }
      return c;
    };
    var pushclosure = function(L, p, encup, base, ra) {
      let nup = p.upvalues.length;
      let uv = p.upvalues;
      let ncl = new lobject.LClosure(L, nup);
      ncl.p = p;
      L.stack[ra].setclLvalue(ncl);
      for (let i = 0; i < nup; i++) {
        if (uv[i].instack)
          ncl.upvals[i] = lfunc.luaF_findupval(L, base + uv[i].idx);
        else
          ncl.upvals[i] = encup[uv[i].idx];
      }
      p.cache = ncl;
    };
    var cvt2str = function(o) {
      return o.ttisnumber();
    };
    var cvt2num = function(o) {
      return o.ttisstring();
    };
    var tostring = function(L, i) {
      let o = L.stack[i];
      if (o.ttisstring()) return true;
      if (cvt2str(o)) {
        lobject.luaO_tostring(L, o);
        return true;
      }
      return false;
    };
    var isemptystr = function(o) {
      return o.ttisstring() && o.vslen() === 0;
    };
    var copy2buff = function(L, top, n, buff) {
      let tl = 0;
      do {
        let tv = L.stack[top - n];
        let l = tv.vslen();
        let s = tv.svalue();
        buff.set(s, tl);
        tl += l;
      } while (--n > 0);
    };
    var luaV_concat = function(L, total) {
      lua_assert(total >= 2);
      do {
        let top = L.top;
        let n = 2;
        if (!(L.stack[top - 2].ttisstring() || cvt2str(L.stack[top - 2])) || !tostring(L, top - 1)) {
          ltm.luaT_trybinTM(L, L.stack[top - 2], L.stack[top - 1], L.stack[top - 2], ltm.TMS.TM_CONCAT);
        } else if (isemptystr(L.stack[top - 1])) {
          tostring(L, top - 2);
        } else if (isemptystr(L.stack[top - 2])) {
          lobject.setobjs2s(L, top - 2, top - 1);
        } else {
          let tl = L.stack[top - 1].vslen();
          for (n = 1; n < total && tostring(L, top - n - 1); n++) {
            let l = L.stack[top - n - 1].vslen();
            tl += l;
          }
          let buff = new Uint8Array(tl);
          copy2buff(L, top, n, buff);
          let ts = luaS_bless(L, buff);
          lobject.setsvalue2s(L, top - n, ts);
        }
        total -= n - 1;
        for (; L.top > top - (n - 1); )
          delete L.stack[--L.top];
      } while (total > 1);
    };
    var MAXTAGLOOP = 2e3;
    var luaV_gettable = function(L, t, key, ra) {
      for (let loop = 0; loop < MAXTAGLOOP; loop++) {
        let tm;
        if (!t.ttistable()) {
          tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_INDEX);
          if (tm.ttisnil())
            ldebug.luaG_typeerror(L, t, to_luastring2("index", true));
        } else {
          let slot = ltable.luaH_get(L, t.value, key);
          if (!slot.ttisnil()) {
            lobject.setobj2s(L, ra, slot);
            return;
          } else {
            tm = ltm.fasttm(L, t.value.metatable, ltm.TMS.TM_INDEX);
            if (tm === null) {
              L.stack[ra].setnilvalue();
              return;
            }
          }
        }
        if (tm.ttisfunction()) {
          ltm.luaT_callTM(L, tm, t, key, L.stack[ra], 1);
          return;
        }
        t = tm;
      }
      ldebug.luaG_runerror(L, to_luastring2("'__index' chain too long; possible loop", true));
    };
    var settable = function(L, t, key, val) {
      for (let loop = 0; loop < MAXTAGLOOP; loop++) {
        let tm;
        if (t.ttistable()) {
          let h = t.value;
          let slot = ltable.luaH_get(L, h, key);
          if (!slot.ttisnil() || (tm = ltm.fasttm(L, h.metatable, ltm.TMS.TM_NEWINDEX)) === null) {
            ltable.luaH_setfrom(L, h, key, val);
            ltable.invalidateTMcache(h);
            return;
          }
        } else {
          if ((tm = ltm.luaT_gettmbyobj(L, t, ltm.TMS.TM_NEWINDEX)).ttisnil())
            ldebug.luaG_typeerror(L, t, to_luastring2("index", true));
        }
        if (tm.ttisfunction()) {
          ltm.luaT_callTM(L, tm, t, key, val, 0);
          return;
        }
        t = tm;
      }
      ldebug.luaG_runerror(L, to_luastring2("'__newindex' chain too long; possible loop", true));
    };
    module.exports.cvt2str = cvt2str;
    module.exports.cvt2num = cvt2num;
    module.exports.luaV_gettable = luaV_gettable;
    module.exports.luaV_concat = luaV_concat;
    module.exports.luaV_div = luaV_div;
    module.exports.luaV_equalobj = luaV_equalobj;
    module.exports.luaV_execute = luaV_execute;
    module.exports.luaV_finishOp = luaV_finishOp;
    module.exports.luaV_imul = luaV_imul;
    module.exports.luaV_lessequal = luaV_lessequal;
    module.exports.luaV_lessthan = luaV_lessthan;
    module.exports.luaV_mod = luaV_mod;
    module.exports.luaV_objlen = luaV_objlen;
    module.exports.luaV_rawequalobj = luaV_rawequalobj;
    module.exports.luaV_shiftl = luaV_shiftl;
    module.exports.luaV_tointeger = luaV_tointeger;
    module.exports.settable = settable;
    module.exports.tointeger = tointeger;
    module.exports.tonumber = tonumber;
  }
});

// vendor/fengari/src/ltm.js
var require_ltm = __commonJS({
  "vendor/fengari/src/ltm.js"(exports, module) {
    "use strict";
    var {
      constant_types: {
        LUA_TTABLE,
        LUA_TUSERDATA
      },
      to_luastring: to_luastring2
    } = require_defs();
    var { lua_assert } = require_llimits();
    var lobject = require_lobject();
    var ldo = require_ldo();
    var lstate = require_lstate();
    var {
      luaS_bless,
      luaS_new
    } = require_lstring();
    var ltable = require_ltable();
    var ldebug = require_ldebug();
    var lvm = require_lvm();
    var luaT_typenames_ = [
      "no value",
      "nil",
      "boolean",
      "userdata",
      "number",
      "string",
      "table",
      "function",
      "userdata",
      "thread",
      "proto"
      /* this last case is used for tests only */
    ].map((e) => to_luastring2(e));
    var ttypename = function(t) {
      return luaT_typenames_[t + 1];
    };
    var TMS = {
      TM_INDEX: 0,
      TM_NEWINDEX: 1,
      TM_GC: 2,
      TM_MODE: 3,
      TM_LEN: 4,
      TM_EQ: 5,
      /* last tag method with fast access */
      TM_ADD: 6,
      TM_SUB: 7,
      TM_MUL: 8,
      TM_MOD: 9,
      TM_POW: 10,
      TM_DIV: 11,
      TM_IDIV: 12,
      TM_BAND: 13,
      TM_BOR: 14,
      TM_BXOR: 15,
      TM_SHL: 16,
      TM_SHR: 17,
      TM_UNM: 18,
      TM_BNOT: 19,
      TM_LT: 20,
      TM_LE: 21,
      TM_CONCAT: 22,
      TM_CALL: 23,
      TM_N: 24
      /* number of elements in the enum */
    };
    var luaT_init = function(L) {
      L.l_G.tmname[TMS.TM_INDEX] = new luaS_new(L, to_luastring2("__index", true));
      L.l_G.tmname[TMS.TM_NEWINDEX] = new luaS_new(L, to_luastring2("__newindex", true));
      L.l_G.tmname[TMS.TM_GC] = new luaS_new(L, to_luastring2("__gc", true));
      L.l_G.tmname[TMS.TM_MODE] = new luaS_new(L, to_luastring2("__mode", true));
      L.l_G.tmname[TMS.TM_LEN] = new luaS_new(L, to_luastring2("__len", true));
      L.l_G.tmname[TMS.TM_EQ] = new luaS_new(L, to_luastring2("__eq", true));
      L.l_G.tmname[TMS.TM_ADD] = new luaS_new(L, to_luastring2("__add", true));
      L.l_G.tmname[TMS.TM_SUB] = new luaS_new(L, to_luastring2("__sub", true));
      L.l_G.tmname[TMS.TM_MUL] = new luaS_new(L, to_luastring2("__mul", true));
      L.l_G.tmname[TMS.TM_MOD] = new luaS_new(L, to_luastring2("__mod", true));
      L.l_G.tmname[TMS.TM_POW] = new luaS_new(L, to_luastring2("__pow", true));
      L.l_G.tmname[TMS.TM_DIV] = new luaS_new(L, to_luastring2("__div", true));
      L.l_G.tmname[TMS.TM_IDIV] = new luaS_new(L, to_luastring2("__idiv", true));
      L.l_G.tmname[TMS.TM_BAND] = new luaS_new(L, to_luastring2("__band", true));
      L.l_G.tmname[TMS.TM_BOR] = new luaS_new(L, to_luastring2("__bor", true));
      L.l_G.tmname[TMS.TM_BXOR] = new luaS_new(L, to_luastring2("__bxor", true));
      L.l_G.tmname[TMS.TM_SHL] = new luaS_new(L, to_luastring2("__shl", true));
      L.l_G.tmname[TMS.TM_SHR] = new luaS_new(L, to_luastring2("__shr", true));
      L.l_G.tmname[TMS.TM_UNM] = new luaS_new(L, to_luastring2("__unm", true));
      L.l_G.tmname[TMS.TM_BNOT] = new luaS_new(L, to_luastring2("__bnot", true));
      L.l_G.tmname[TMS.TM_LT] = new luaS_new(L, to_luastring2("__lt", true));
      L.l_G.tmname[TMS.TM_LE] = new luaS_new(L, to_luastring2("__le", true));
      L.l_G.tmname[TMS.TM_CONCAT] = new luaS_new(L, to_luastring2("__concat", true));
      L.l_G.tmname[TMS.TM_CALL] = new luaS_new(L, to_luastring2("__call", true));
    };
    var __name = to_luastring2("__name", true);
    var luaT_objtypename = function(L, o) {
      let mt;
      if (o.ttistable() && (mt = o.value.metatable) !== null || o.ttisfulluserdata() && (mt = o.value.metatable) !== null) {
        let name = ltable.luaH_getstr(mt, luaS_bless(L, __name));
        if (name.ttisstring())
          return name.svalue();
      }
      return ttypename(o.ttnov());
    };
    var luaT_callTM = function(L, f, p1, p2, p3, hasres) {
      let func = L.top;
      lobject.pushobj2s(L, f);
      lobject.pushobj2s(L, p1);
      lobject.pushobj2s(L, p2);
      if (!hasres)
        lobject.pushobj2s(L, p3);
      if (L.ci.callstatus & lstate.CIST_LUA)
        ldo.luaD_call(L, func, hasres);
      else
        ldo.luaD_callnoyield(L, func, hasres);
      if (hasres) {
        let tv = L.stack[L.top - 1];
        delete L.stack[--L.top];
        p3.setfrom(tv);
      }
    };
    var luaT_callbinTM = function(L, p1, p2, res, event) {
      let tm = luaT_gettmbyobj(L, p1, event);
      if (tm.ttisnil())
        tm = luaT_gettmbyobj(L, p2, event);
      if (tm.ttisnil()) return false;
      luaT_callTM(L, tm, p1, p2, res, 1);
      return true;
    };
    var luaT_trybinTM = function(L, p1, p2, res, event) {
      if (!luaT_callbinTM(L, p1, p2, res, event)) {
        switch (event) {
          case TMS.TM_CONCAT:
            return ldebug.luaG_concaterror(L, p1, p2);
          case TMS.TM_BAND:
          case TMS.TM_BOR:
          case TMS.TM_BXOR:
          case TMS.TM_SHL:
          case TMS.TM_SHR:
          case TMS.TM_BNOT: {
            let n1 = lvm.tonumber(p1);
            let n2 = lvm.tonumber(p2);
            if (n1 !== false && n2 !== false)
              return ldebug.luaG_tointerror(L, p1, p2);
            else
              return ldebug.luaG_opinterror(L, p1, p2, to_luastring2("perform bitwise operation on", true));
          }
          default:
            return ldebug.luaG_opinterror(L, p1, p2, to_luastring2("perform arithmetic on", true));
        }
      }
    };
    var luaT_callorderTM = function(L, p1, p2, event) {
      let res = new lobject.TValue();
      if (!luaT_callbinTM(L, p1, p2, res, event))
        return null;
      else
        return !res.l_isfalse();
    };
    var fasttm = function(l, et, e) {
      return et === null ? null : et.flags & 1 << e ? null : luaT_gettm(et, e, l.l_G.tmname[e]);
    };
    var luaT_gettm = function(events, event, ename) {
      const tm = ltable.luaH_getstr(events, ename);
      lua_assert(event <= TMS.TM_EQ);
      if (tm.ttisnil()) {
        events.flags |= 1 << event;
        return null;
      } else return tm;
    };
    var luaT_gettmbyobj = function(L, o, event) {
      let mt;
      switch (o.ttnov()) {
        case LUA_TTABLE:
        case LUA_TUSERDATA:
          mt = o.value.metatable;
          break;
        default:
          mt = L.l_G.mt[o.ttnov()];
      }
      return mt ? ltable.luaH_getstr(mt, L.l_G.tmname[event]) : lobject.luaO_nilobject;
    };
    module.exports.fasttm = fasttm;
    module.exports.TMS = TMS;
    module.exports.luaT_callTM = luaT_callTM;
    module.exports.luaT_callbinTM = luaT_callbinTM;
    module.exports.luaT_trybinTM = luaT_trybinTM;
    module.exports.luaT_callorderTM = luaT_callorderTM;
    module.exports.luaT_gettm = luaT_gettm;
    module.exports.luaT_gettmbyobj = luaT_gettmbyobj;
    module.exports.luaT_init = luaT_init;
    module.exports.luaT_objtypename = luaT_objtypename;
    module.exports.ttypename = ttypename;
  }
});

// vendor/fengari/src/lstate.js
var require_lstate = __commonJS({
  "vendor/fengari/src/lstate.js"(exports, module) {
    "use strict";
    var {
      LUA_MINSTACK,
      LUA_RIDX_GLOBALS,
      LUA_RIDX_MAINTHREAD,
      constant_types: {
        LUA_NUMTAGS,
        LUA_TNIL,
        LUA_TTABLE,
        LUA_TTHREAD
      },
      thread_status: {
        LUA_OK
      }
    } = require_defs();
    var lobject = require_lobject();
    var ldo = require_ldo();
    var lapi = require_lapi();
    var ltable = require_ltable();
    var ltm = require_ltm();
    var EXTRA_STACK = 5;
    var BASIC_STACK_SIZE = 2 * LUA_MINSTACK;
    var CallInfo = class {
      constructor() {
        this.func = null;
        this.funcOff = NaN;
        this.top = NaN;
        this.previous = null;
        this.next = null;
        this.l_base = NaN;
        this.l_code = null;
        this.l_savedpc = NaN;
        this.c_k = null;
        this.c_old_errfunc = null;
        this.c_ctx = null;
        this.nresults = NaN;
        this.callstatus = NaN;
      }
    };
    var lua_State = class {
      constructor(g) {
        this.id = g.id_counter++;
        this.base_ci = new CallInfo();
        this.top = NaN;
        this.stack_last = NaN;
        this.oldpc = NaN;
        this.l_G = g;
        this.stack = null;
        this.ci = null;
        this.errorJmp = null;
        this.nCcalls = 0;
        this.hook = null;
        this.hookmask = 0;
        this.basehookcount = 0;
        this.allowhook = 1;
        this.hookcount = this.basehookcount;
        this.nny = 1;
        this.status = LUA_OK;
        this.errfunc = 0;
      }
    };
    var global_State = class {
      constructor() {
        this.id_counter = 1;
        this.ids = /* @__PURE__ */ new WeakMap();
        this.mainthread = null;
        this.l_registry = new lobject.TValue(LUA_TNIL, null);
        this.panic = null;
        this.atnativeerror = null;
        this.version = null;
        this.tmname = new Array(ltm.TMS.TM_N);
        this.mt = new Array(LUA_NUMTAGS);
      }
    };
    var luaE_extendCI = function(L) {
      let ci = new CallInfo();
      L.ci.next = ci;
      ci.previous = L.ci;
      ci.next = null;
      L.ci = ci;
      return ci;
    };
    var luaE_freeCI = function(L) {
      let ci = L.ci;
      ci.next = null;
    };
    var stack_init = function(L1, L) {
      L1.stack = new Array(BASIC_STACK_SIZE);
      L1.top = 0;
      L1.stack_last = BASIC_STACK_SIZE - EXTRA_STACK;
      let ci = L1.base_ci;
      ci.next = ci.previous = null;
      ci.callstatus = 0;
      ci.funcOff = L1.top;
      ci.func = L1.stack[L1.top];
      L1.stack[L1.top++] = new lobject.TValue(LUA_TNIL, null);
      ci.top = L1.top + LUA_MINSTACK;
      L1.ci = ci;
    };
    var freestack = function(L) {
      L.ci = L.base_ci;
      luaE_freeCI(L);
      L.stack = null;
    };
    var init_registry = function(L, g) {
      let registry = ltable.luaH_new(L);
      g.l_registry.sethvalue(registry);
      ltable.luaH_setint(registry, LUA_RIDX_MAINTHREAD, new lobject.TValue(LUA_TTHREAD, L));
      ltable.luaH_setint(registry, LUA_RIDX_GLOBALS, new lobject.TValue(LUA_TTABLE, ltable.luaH_new(L)));
    };
    var f_luaopen = function(L) {
      let g = L.l_G;
      stack_init(L, L);
      init_registry(L, g);
      ltm.luaT_init(L);
      g.version = lapi.lua_version(null);
    };
    var lua_newthread = function(L) {
      let g = L.l_G;
      let L1 = new lua_State(g);
      L.stack[L.top] = new lobject.TValue(LUA_TTHREAD, L1);
      lapi.api_incr_top(L);
      L1.hookmask = L.hookmask;
      L1.basehookcount = L.basehookcount;
      L1.hook = L.hook;
      L1.hookcount = L1.basehookcount;
      stack_init(L1, L);
      return L1;
    };
    var luaE_freethread = function(L, L1) {
      freestack(L1);
    };
    var lua_newstate = function() {
      let g = new global_State();
      let L = new lua_State(g);
      g.mainthread = L;
      if (ldo.luaD_rawrunprotected(L, f_luaopen, null) !== LUA_OK) {
        L = null;
      }
      return L;
    };
    var close_state = function(L) {
      freestack(L);
    };
    var lua_close = function(L) {
      L = L.l_G.mainthread;
      close_state(L);
    };
    module.exports.lua_State = lua_State;
    module.exports.CallInfo = CallInfo;
    module.exports.CIST_OAH = 1 << 0;
    module.exports.CIST_LUA = 1 << 1;
    module.exports.CIST_HOOKED = 1 << 2;
    module.exports.CIST_FRESH = 1 << 3;
    module.exports.CIST_YPCALL = 1 << 4;
    module.exports.CIST_TAIL = 1 << 5;
    module.exports.CIST_HOOKYIELD = 1 << 6;
    module.exports.CIST_LEQ = 1 << 7;
    module.exports.CIST_FIN = 1 << 8;
    module.exports.EXTRA_STACK = EXTRA_STACK;
    module.exports.lua_close = lua_close;
    module.exports.lua_newstate = lua_newstate;
    module.exports.lua_newthread = lua_newthread;
    module.exports.luaE_extendCI = luaE_extendCI;
    module.exports.luaE_freeCI = luaE_freeCI;
    module.exports.luaE_freethread = luaE_freethread;
  }
});

// vendor/fengari/src/lobject.js
var require_lobject = __commonJS({
  "vendor/fengari/src/lobject.js"(exports, module) {
    "use strict";
    var {
      LUA_OPADD,
      LUA_OPBAND,
      LUA_OPBNOT,
      LUA_OPBOR,
      LUA_OPBXOR,
      LUA_OPDIV,
      LUA_OPIDIV,
      LUA_OPMOD,
      LUA_OPMUL,
      LUA_OPPOW,
      LUA_OPSHL,
      LUA_OPSHR,
      LUA_OPSUB,
      LUA_OPUNM,
      constant_types: {
        LUA_NUMTAGS,
        LUA_TBOOLEAN,
        LUA_TCCL,
        LUA_TFUNCTION,
        LUA_TLCF,
        LUA_TLCL,
        LUA_TLIGHTUSERDATA,
        LUA_TLNGSTR,
        LUA_TNIL,
        LUA_TNUMBER,
        LUA_TNUMFLT,
        LUA_TNUMINT,
        LUA_TSHRSTR,
        LUA_TSTRING,
        LUA_TTABLE,
        LUA_TTHREAD,
        LUA_TUSERDATA
      },
      from_userstring,
      luastring_indexOf,
      luastring_of,
      to_jsstring: to_jsstring2,
      to_luastring: to_luastring2
    } = require_defs();
    var {
      lisdigit,
      lisprint,
      lisspace,
      lisxdigit
    } = require_ljstype();
    var ldebug = require_ldebug();
    var ldo = require_ldo();
    var lstate = require_lstate();
    var {
      luaS_bless,
      luaS_new
    } = require_lstring();
    var ltable = require_ltable();
    var {
      LUA_COMPAT_FLOATSTRING,
      ldexp,
      lua_integer2str,
      lua_number2str
    } = require_luaconf();
    var lvm = require_lvm();
    var {
      MAX_INT,
      luai_nummod,
      lua_assert
    } = require_llimits();
    var ltm = require_ltm();
    var LUA_TPROTO = LUA_NUMTAGS;
    var LUA_TDEADKEY = LUA_NUMTAGS + 1;
    var TValue = class {
      constructor(type, value) {
        this.type = type;
        this.value = value;
      }
      /* type tag of a TValue (bits 0-3 for tags + variant bits 4-5) */
      ttype() {
        return this.type & 63;
      }
      /* type tag of a TValue with no variants (bits 0-3) */
      ttnov() {
        return this.type & 15;
      }
      checktag(t) {
        return this.type === t;
      }
      checktype(t) {
        return this.ttnov() === t;
      }
      ttisnumber() {
        return this.checktype(LUA_TNUMBER);
      }
      ttisfloat() {
        return this.checktag(LUA_TNUMFLT);
      }
      ttisinteger() {
        return this.checktag(LUA_TNUMINT);
      }
      ttisnil() {
        return this.checktag(LUA_TNIL);
      }
      ttisboolean() {
        return this.checktag(LUA_TBOOLEAN);
      }
      ttislightuserdata() {
        return this.checktag(LUA_TLIGHTUSERDATA);
      }
      ttisstring() {
        return this.checktype(LUA_TSTRING);
      }
      ttisshrstring() {
        return this.checktag(LUA_TSHRSTR);
      }
      ttislngstring() {
        return this.checktag(LUA_TLNGSTR);
      }
      ttistable() {
        return this.checktag(LUA_TTABLE);
      }
      ttisfunction() {
        return this.checktype(LUA_TFUNCTION);
      }
      ttisclosure() {
        return (this.type & 31) === LUA_TFUNCTION;
      }
      ttisCclosure() {
        return this.checktag(LUA_TCCL);
      }
      ttisLclosure() {
        return this.checktag(LUA_TLCL);
      }
      ttislcf() {
        return this.checktag(LUA_TLCF);
      }
      ttisfulluserdata() {
        return this.checktag(LUA_TUSERDATA);
      }
      ttisthread() {
        return this.checktag(LUA_TTHREAD);
      }
      ttisdeadkey() {
        return this.checktag(LUA_TDEADKEY);
      }
      l_isfalse() {
        return this.ttisnil() || this.ttisboolean() && this.value === false;
      }
      setfltvalue(x) {
        this.type = LUA_TNUMFLT;
        this.value = x;
      }
      chgfltvalue(x) {
        lua_assert(this.type == LUA_TNUMFLT);
        this.value = x;
      }
      setivalue(x) {
        this.type = LUA_TNUMINT;
        this.value = x;
      }
      chgivalue(x) {
        lua_assert(this.type == LUA_TNUMINT);
        this.value = x;
      }
      setnilvalue() {
        this.type = LUA_TNIL;
        this.value = null;
      }
      setfvalue(x) {
        this.type = LUA_TLCF;
        this.value = x;
      }
      setpvalue(x) {
        this.type = LUA_TLIGHTUSERDATA;
        this.value = x;
      }
      setbvalue(x) {
        this.type = LUA_TBOOLEAN;
        this.value = x;
      }
      setsvalue(x) {
        this.type = LUA_TLNGSTR;
        this.value = x;
      }
      setuvalue(x) {
        this.type = LUA_TUSERDATA;
        this.value = x;
      }
      setthvalue(x) {
        this.type = LUA_TTHREAD;
        this.value = x;
      }
      setclLvalue(x) {
        this.type = LUA_TLCL;
        this.value = x;
      }
      setclCvalue(x) {
        this.type = LUA_TCCL;
        this.value = x;
      }
      sethvalue(x) {
        this.type = LUA_TTABLE;
        this.value = x;
      }
      setdeadvalue() {
        this.type = LUA_TDEADKEY;
        this.value = null;
      }
      setfrom(tv) {
        this.type = tv.type;
        this.value = tv.value;
      }
      tsvalue() {
        lua_assert(this.ttisstring());
        return this.value;
      }
      svalue() {
        return this.tsvalue().getstr();
      }
      vslen() {
        return this.tsvalue().tsslen();
      }
      jsstring(from, to) {
        return to_jsstring2(this.svalue(), from, to, true);
      }
    };
    var pushobj2s = function(L, tv) {
      L.stack[L.top++] = new TValue(tv.type, tv.value);
    };
    var pushsvalue2s = function(L, ts) {
      L.stack[L.top++] = new TValue(LUA_TLNGSTR, ts);
    };
    var setobjs2s = function(L, newidx, oldidx) {
      L.stack[newidx].setfrom(L.stack[oldidx]);
    };
    var setobj2s = function(L, newidx, oldtv) {
      L.stack[newidx].setfrom(oldtv);
    };
    var setsvalue2s = function(L, newidx, ts) {
      L.stack[newidx].setsvalue(ts);
    };
    var luaO_nilobject = new TValue(LUA_TNIL, null);
    Object.freeze(luaO_nilobject);
    module.exports.luaO_nilobject = luaO_nilobject;
    var LClosure = class {
      constructor(L, n) {
        this.id = L.l_G.id_counter++;
        this.p = null;
        this.nupvalues = n;
        this.upvals = new Array(n);
      }
    };
    var CClosure = class {
      constructor(L, f, n) {
        this.id = L.l_G.id_counter++;
        this.f = f;
        this.nupvalues = n;
        this.upvalue = new Array(n);
        while (n--) {
          this.upvalue[n] = new TValue(LUA_TNIL, null);
        }
      }
    };
    var Udata = class {
      constructor(L, size) {
        this.id = L.l_G.id_counter++;
        this.metatable = null;
        this.uservalue = new TValue(LUA_TNIL, null);
        this.len = size;
        this.data = /* @__PURE__ */ Object.create(null);
      }
    };
    var LocVar = class {
      constructor() {
        this.varname = null;
        this.startpc = NaN;
        this.endpc = NaN;
      }
    };
    var RETS = to_luastring2("...");
    var PRE = to_luastring2('[string "');
    var POS = to_luastring2('"]');
    var luaO_chunkid = function(source, bufflen) {
      let l = source.length;
      let out;
      if (source[0] === 61) {
        if (l < bufflen) {
          out = new Uint8Array(l - 1);
          out.set(source.subarray(1));
        } else {
          out = new Uint8Array(bufflen);
          out.set(source.subarray(1, bufflen + 1));
        }
      } else if (source[0] === 64) {
        if (l <= bufflen) {
          out = new Uint8Array(l - 1);
          out.set(source.subarray(1));
        } else {
          out = new Uint8Array(bufflen);
          out.set(RETS);
          bufflen -= RETS.length;
          out.set(source.subarray(l - bufflen), RETS.length);
        }
      } else {
        out = new Uint8Array(bufflen);
        let nli = luastring_indexOf(
          source,
          10
          /* ('\n').charCodeAt(0) */
        );
        out.set(PRE);
        let out_i = PRE.length;
        bufflen -= PRE.length + RETS.length + POS.length;
        if (l < bufflen && nli === -1) {
          out.set(source, out_i);
          out_i += source.length;
        } else {
          if (nli !== -1) l = nli;
          if (l > bufflen) l = bufflen;
          out.set(source.subarray(0, l), out_i);
          out_i += l;
          out.set(RETS, out_i);
          out_i += RETS.length;
        }
        out.set(POS, out_i);
        out_i += POS.length;
        out = out.subarray(0, out_i);
      }
      return out;
    };
    var luaO_hexavalue = function(c) {
      if (lisdigit(c)) return c - 48;
      else return (c & 223) - 55;
    };
    var UTF8BUFFSZ = 8;
    var luaO_utf8esc = function(buff, x) {
      let n = 1;
      lua_assert(x <= 1114111);
      if (x < 128)
        buff[UTF8BUFFSZ - 1] = x;
      else {
        let mfb = 63;
        do {
          buff[UTF8BUFFSZ - n++] = 128 | x & 63;
          x >>= 6;
          mfb >>= 1;
        } while (x > mfb);
        buff[UTF8BUFFSZ - n] = ~mfb << 1 | x;
      }
      return n;
    };
    var MAXSIGDIG = 30;
    var lua_strx2number = function(s) {
      let i = 0;
      let r = 0;
      let sigdig = 0;
      let nosigdig = 0;
      let e = 0;
      let neg;
      let hasdot = false;
      while (lisspace(s[i])) i++;
      if (neg = s[i] === 45) i++;
      else if (s[i] === 43) i++;
      if (!(s[i] === 48 && (s[i + 1] === 120 || s[i + 1] === 88)))
        return null;
      for (i += 2; ; i++) {
        if (s[i] === 46) {
          if (hasdot) break;
          else hasdot = true;
        } else if (lisxdigit(s[i])) {
          if (sigdig === 0 && s[i] === 48)
            nosigdig++;
          else if (++sigdig <= MAXSIGDIG)
            r = r * 16 + luaO_hexavalue(s[i]);
          else e++;
          if (hasdot) e--;
        } else break;
      }
      if (nosigdig + sigdig === 0)
        return null;
      e *= 4;
      if (s[i] === 112 || s[i] === 80) {
        let exp1 = 0;
        let neg1;
        i++;
        if (neg1 = s[i] === 45) i++;
        else if (s[i] === 43) i++;
        if (!lisdigit(s[i]))
          return null;
        while (lisdigit(s[i]))
          exp1 = exp1 * 10 + s[i++] - 48;
        if (neg1) exp1 = -exp1;
        e += exp1;
      }
      if (neg) r = -r;
      return {
        n: ldexp(r, e),
        i
      };
    };
    var lua_str2number = function(s) {
      try {
        s = to_jsstring2(s);
      } catch (e) {
        return null;
      }
      let r = /^[\t\v\f \n\r]*[+-]?(?:[0-9]+\.?[0-9]*|\.[0-9]*)(?:[eE][+-]?[0-9]+)?/.exec(s);
      if (!r)
        return null;
      let flt = parseFloat(r[0]);
      return !isNaN(flt) ? { n: flt, i: r[0].length } : null;
    };
    var l_str2dloc = function(s, mode) {
      let result = mode === "x" ? lua_strx2number(s) : lua_str2number(s);
      if (result === null) return null;
      while (lisspace(s[result.i])) result.i++;
      return result.i === s.length || s[result.i] === 0 ? result : null;
    };
    var SIGILS = [
      46,
      120,
      88,
      110,
      78
      /* ("N").charCodeAt(0) */
    ];
    var modes = {
      [46]: ".",
      [120]: "x",
      [88]: "x",
      [110]: "n",
      [78]: "n"
    };
    var l_str2d = function(s) {
      let l = s.length;
      let pmode = 0;
      for (let i = 0; i < l; i++) {
        let v = s[i];
        if (SIGILS.indexOf(v) !== -1) {
          pmode = v;
          break;
        }
      }
      let mode = modes[pmode];
      if (mode === "n")
        return null;
      let end = l_str2dloc(s, mode);
      return end;
    };
    var MAXBY10 = Math.floor(MAX_INT / 10);
    var MAXLASTD = MAX_INT % 10;
    var l_str2int = function(s) {
      let i = 0;
      let a = 0;
      let empty = true;
      let neg;
      while (lisspace(s[i])) i++;
      if (neg = s[i] === 45) i++;
      else if (s[i] === 43) i++;
      if (s[i] === 48 && (s[i + 1] === 120 || s[i + 1] === 88)) {
        i += 2;
        for (; i < s.length && lisxdigit(s[i]); i++) {
          a = a * 16 + luaO_hexavalue(s[i]) | 0;
          empty = false;
        }
      } else {
        for (; i < s.length && lisdigit(s[i]); i++) {
          let d = s[i] - 48;
          if (a >= MAXBY10 && (a > MAXBY10 || d > MAXLASTD + neg))
            return null;
          a = a * 10 + d | 0;
          empty = false;
        }
      }
      while (i < s.length && lisspace(s[i])) i++;
      if (empty || i !== s.length && s[i] !== 0) return null;
      else {
        return {
          n: (neg ? -a : a) | 0,
          i
        };
      }
    };
    var luaO_str2num = function(s, o) {
      let s2i = l_str2int(s);
      if (s2i !== null) {
        o.setivalue(s2i.n);
        return s2i.i + 1;
      } else {
        s2i = l_str2d(s);
        if (s2i !== null) {
          o.setfltvalue(s2i.n);
          return s2i.i + 1;
        } else
          return 0;
      }
    };
    var luaO_tostring = function(L, obj) {
      let buff;
      if (obj.ttisinteger())
        buff = to_luastring2(lua_integer2str(obj.value));
      else {
        let str = lua_number2str(obj.value);
        if (!LUA_COMPAT_FLOATSTRING && /^[-0123456789]+$/.test(str)) {
          str += ".0";
        }
        buff = to_luastring2(str);
      }
      obj.setsvalue(luaS_bless(L, buff));
    };
    var pushstr = function(L, str) {
      ldo.luaD_inctop(L);
      setsvalue2s(L, L.top - 1, luaS_new(L, str));
    };
    var luaO_pushvfstring = function(L, fmt, argp) {
      let n = 0;
      let i = 0;
      let a = 0;
      let e;
      for (; ; ) {
        e = luastring_indexOf(fmt, 37, i);
        if (e == -1) break;
        pushstr(L, fmt.subarray(i, e));
        switch (fmt[e + 1]) {
          case 115: {
            let s = argp[a++];
            if (s === null) s = to_luastring2("(null)", true);
            else {
              s = from_userstring(s);
              let i2 = luastring_indexOf(s, 0);
              if (i2 !== -1)
                s = s.subarray(0, i2);
            }
            pushstr(L, s);
            break;
          }
          case 99: {
            let buff = argp[a++];
            if (lisprint(buff))
              pushstr(L, luastring_of(buff));
            else
              luaO_pushfstring(L, to_luastring2("<\\%d>", true), buff);
            break;
          }
          case 100:
          case 73:
            ldo.luaD_inctop(L);
            L.stack[L.top - 1].setivalue(argp[a++]);
            luaO_tostring(L, L.stack[L.top - 1]);
            break;
          case 102:
            ldo.luaD_inctop(L);
            L.stack[L.top - 1].setfltvalue(argp[a++]);
            luaO_tostring(L, L.stack[L.top - 1]);
            break;
          case 112: {
            let v = argp[a++];
            if (v instanceof lstate.lua_State || v instanceof ltable.Table || v instanceof Udata || v instanceof LClosure || v instanceof CClosure) {
              pushstr(L, to_luastring2("0x" + v.id.toString(16)));
            } else {
              switch (typeof v) {
                case "undefined":
                  pushstr(L, to_luastring2("undefined"));
                  break;
                case "number":
                  pushstr(L, to_luastring2("Number(" + v + ")"));
                  break;
                case "string":
                  pushstr(L, to_luastring2("String(" + JSON.stringify(v) + ")"));
                  break;
                case "boolean":
                  pushstr(L, to_luastring2(v ? "Boolean(true)" : "Boolean(false)"));
                  break;
                case "object":
                  if (v === null) {
                    pushstr(L, to_luastring2("null"));
                    break;
                  }
                /* fall through */
                case "function": {
                  let id = L.l_G.ids.get(v);
                  if (!id) {
                    id = L.l_G.id_counter++;
                    L.l_G.ids.set(v, id);
                  }
                  pushstr(L, to_luastring2("0x" + id.toString(16)));
                  break;
                }
                default:
                  pushstr(L, to_luastring2("<id NYI>"));
              }
            }
            break;
          }
          case 85: {
            let buff = new Uint8Array(UTF8BUFFSZ);
            let l = luaO_utf8esc(buff, argp[a++]);
            pushstr(L, buff.subarray(UTF8BUFFSZ - l));
            break;
          }
          case 37:
            pushstr(L, to_luastring2("%", true));
            break;
          default:
            ldebug.luaG_runerror(L, to_luastring2("invalid option '%%%c' to 'lua_pushfstring'"), fmt[e + 1]);
        }
        n += 2;
        i = e + 2;
      }
      ldo.luaD_checkstack(L, 1);
      pushstr(L, fmt.subarray(i));
      if (n > 0) lvm.luaV_concat(L, n + 1);
      return L.stack[L.top - 1].svalue();
    };
    var luaO_pushfstring = function(L, fmt, ...argp) {
      return luaO_pushvfstring(L, fmt, argp);
    };
    var luaO_int2fb = function(x) {
      let e = 0;
      if (x < 8) return x;
      while (x >= 8 << 4) {
        x = x + 15 >> 4;
        e += 4;
      }
      while (x >= 8 << 1) {
        x = x + 1 >> 1;
        e++;
      }
      return e + 1 << 3 | x - 8;
    };
    var intarith = function(L, op, v1, v2) {
      switch (op) {
        case LUA_OPADD:
          return v1 + v2 | 0;
        case LUA_OPSUB:
          return v1 - v2 | 0;
        case LUA_OPMUL:
          return lvm.luaV_imul(v1, v2);
        case LUA_OPMOD:
          return lvm.luaV_mod(L, v1, v2);
        case LUA_OPIDIV:
          return lvm.luaV_div(L, v1, v2);
        case LUA_OPBAND:
          return v1 & v2;
        case LUA_OPBOR:
          return v1 | v2;
        case LUA_OPBXOR:
          return v1 ^ v2;
        case LUA_OPSHL:
          return lvm.luaV_shiftl(v1, v2);
        case LUA_OPSHR:
          return lvm.luaV_shiftl(v1, -v2);
        case LUA_OPUNM:
          return 0 - v1 | 0;
        case LUA_OPBNOT:
          return ~0 ^ v1;
        default:
          lua_assert(0);
      }
    };
    var numarith = function(L, op, v1, v2) {
      switch (op) {
        case LUA_OPADD:
          return v1 + v2;
        case LUA_OPSUB:
          return v1 - v2;
        case LUA_OPMUL:
          return v1 * v2;
        case LUA_OPDIV:
          return v1 / v2;
        case LUA_OPPOW:
          return Math.pow(v1, v2);
        case LUA_OPIDIV:
          return Math.floor(v1 / v2);
        case LUA_OPUNM:
          return -v1;
        case LUA_OPMOD:
          return luai_nummod(L, v1, v2);
        default:
          lua_assert(0);
      }
    };
    var luaO_arith = function(L, op, p1, p2, p3) {
      let res = typeof p3 === "number" ? L.stack[p3] : p3;
      switch (op) {
        case LUA_OPBAND:
        case LUA_OPBOR:
        case LUA_OPBXOR:
        case LUA_OPSHL:
        case LUA_OPSHR:
        case LUA_OPBNOT: {
          let i1, i2;
          if ((i1 = lvm.tointeger(p1)) !== false && (i2 = lvm.tointeger(p2)) !== false) {
            res.setivalue(intarith(L, op, i1, i2));
            return;
          } else break;
        }
        case LUA_OPDIV:
        case LUA_OPPOW: {
          let n1, n2;
          if ((n1 = lvm.tonumber(p1)) !== false && (n2 = lvm.tonumber(p2)) !== false) {
            res.setfltvalue(numarith(L, op, n1, n2));
            return;
          } else break;
        }
        default: {
          let n1, n2;
          if (p1.ttisinteger() && p2.ttisinteger()) {
            res.setivalue(intarith(L, op, p1.value, p2.value));
            return;
          } else if ((n1 = lvm.tonumber(p1)) !== false && (n2 = lvm.tonumber(p2)) !== false) {
            res.setfltvalue(numarith(L, op, n1, n2));
            return;
          } else break;
        }
      }
      lua_assert(L !== null);
      ltm.luaT_trybinTM(L, p1, p2, p3, op - LUA_OPADD + ltm.TMS.TM_ADD);
    };
    module.exports.CClosure = CClosure;
    module.exports.LClosure = LClosure;
    module.exports.LUA_TDEADKEY = LUA_TDEADKEY;
    module.exports.LUA_TPROTO = LUA_TPROTO;
    module.exports.LocVar = LocVar;
    module.exports.TValue = TValue;
    module.exports.Udata = Udata;
    module.exports.UTF8BUFFSZ = UTF8BUFFSZ;
    module.exports.luaO_arith = luaO_arith;
    module.exports.luaO_chunkid = luaO_chunkid;
    module.exports.luaO_hexavalue = luaO_hexavalue;
    module.exports.luaO_int2fb = luaO_int2fb;
    module.exports.luaO_pushfstring = luaO_pushfstring;
    module.exports.luaO_pushvfstring = luaO_pushvfstring;
    module.exports.luaO_str2num = luaO_str2num;
    module.exports.luaO_tostring = luaO_tostring;
    module.exports.luaO_utf8esc = luaO_utf8esc;
    module.exports.numarith = numarith;
    module.exports.pushobj2s = pushobj2s;
    module.exports.pushsvalue2s = pushsvalue2s;
    module.exports.setobjs2s = setobjs2s;
    module.exports.setobj2s = setobj2s;
    module.exports.setsvalue2s = setsvalue2s;
  }
});

// vendor/fengari/src/lfunc.js
var require_lfunc = __commonJS({
  "vendor/fengari/src/lfunc.js"(exports, module) {
    "use strict";
    var { constant_types: { LUA_TNIL } } = require_defs();
    var lobject = require_lobject();
    var Proto = class {
      constructor(L) {
        this.id = L.l_G.id_counter++;
        this.k = [];
        this.p = [];
        this.code = [];
        this.cache = null;
        this.lineinfo = [];
        this.upvalues = [];
        this.numparams = 0;
        this.is_vararg = false;
        this.maxstacksize = 0;
        this.locvars = [];
        this.linedefined = 0;
        this.lastlinedefined = 0;
        this.source = null;
      }
    };
    var luaF_newLclosure = function(L, n) {
      return new lobject.LClosure(L, n);
    };
    var luaF_findupval = function(L, level) {
      return L.stack[level];
    };
    var luaF_close = function(L, level) {
      for (let i = level; i < L.top; i++) {
        let old = L.stack[i];
        L.stack[i] = new lobject.TValue(old.type, old.value);
      }
    };
    var luaF_initupvals = function(L, cl) {
      for (let i = 0; i < cl.nupvalues; i++)
        cl.upvals[i] = new lobject.TValue(LUA_TNIL, null);
    };
    var luaF_getlocalname = function(f, local_number, pc) {
      for (let i = 0; i < f.locvars.length && f.locvars[i].startpc <= pc; i++) {
        if (pc < f.locvars[i].endpc) {
          local_number--;
          if (local_number === 0)
            return f.locvars[i].varname.getstr();
        }
      }
      return null;
    };
    module.exports.MAXUPVAL = 255;
    module.exports.Proto = Proto;
    module.exports.luaF_findupval = luaF_findupval;
    module.exports.luaF_close = luaF_close;
    module.exports.luaF_getlocalname = luaF_getlocalname;
    module.exports.luaF_initupvals = luaF_initupvals;
    module.exports.luaF_newLclosure = luaF_newLclosure;
  }
});

// vendor/fengari/src/lzio.js
var require_lzio = __commonJS({
  "vendor/fengari/src/lzio.js"(exports, module) {
    "use strict";
    var { lua_assert } = require_llimits();
    var MBuffer = class {
      constructor() {
        this.buffer = null;
        this.n = 0;
      }
    };
    var luaZ_buffer = function(buff) {
      return buff.buffer.subarray(0, buff.n);
    };
    var luaZ_buffremove = function(buff, i) {
      buff.n -= i;
    };
    var luaZ_resetbuffer = function(buff) {
      buff.n = 0;
    };
    var luaZ_resizebuffer = function(L, buff, size) {
      let newbuff = new Uint8Array(size);
      if (buff.buffer)
        newbuff.set(buff.buffer);
      buff.buffer = newbuff;
    };
    var ZIO = class {
      constructor(L, reader, data) {
        this.L = L;
        lua_assert(typeof reader == "function", "ZIO requires a reader");
        this.reader = reader;
        this.data = data;
        this.n = 0;
        this.buffer = null;
        this.off = 0;
      }
      zgetc() {
        return this.n-- > 0 ? this.buffer[this.off++] : luaZ_fill(this);
      }
    };
    var EOZ = -1;
    var luaZ_fill = function(z) {
      let buff = z.reader(z.L, z.data);
      if (buff === null)
        return EOZ;
      lua_assert(buff instanceof Uint8Array, "Should only load binary of array of bytes");
      let size = buff.length;
      if (size === 0)
        return EOZ;
      z.buffer = buff;
      z.off = 0;
      z.n = size - 1;
      return z.buffer[z.off++];
    };
    var luaZ_read = function(z, b, b_offset, n) {
      while (n) {
        if (z.n === 0) {
          if (luaZ_fill(z) === EOZ)
            return n;
          else {
            z.n++;
            z.off--;
          }
        }
        let m = n <= z.n ? n : z.n;
        for (let i = 0; i < m; i++) {
          b[b_offset++] = z.buffer[z.off++];
        }
        z.n -= m;
        if (z.n === 0)
          z.buffer = null;
        n -= m;
      }
      return 0;
    };
    module.exports.EOZ = EOZ;
    module.exports.luaZ_buffer = luaZ_buffer;
    module.exports.luaZ_buffremove = luaZ_buffremove;
    module.exports.luaZ_fill = luaZ_fill;
    module.exports.luaZ_read = luaZ_read;
    module.exports.luaZ_resetbuffer = luaZ_resetbuffer;
    module.exports.luaZ_resizebuffer = luaZ_resizebuffer;
    module.exports.MBuffer = MBuffer;
    module.exports.ZIO = ZIO;
  }
});

// vendor/fengari/src/llex.js
var require_llex = __commonJS({
  "vendor/fengari/src/llex.js"(exports, module) {
    "use strict";
    var {
      constant_types: { LUA_TBOOLEAN, LUA_TLNGSTR },
      thread_status: { LUA_ERRSYNTAX },
      to_luastring: to_luastring2
    } = require_defs();
    var {
      LUA_MINBUFFER,
      MAX_INT,
      lua_assert
    } = require_llimits();
    var ldebug = require_ldebug();
    var ldo = require_ldo();
    var {
      lisdigit,
      lislalnum,
      lislalpha,
      lisspace,
      lisxdigit
    } = require_ljstype();
    var lobject = require_lobject();
    var {
      luaS_bless,
      luaS_hash,
      luaS_hashlongstr,
      luaS_new
    } = require_lstring();
    var ltable = require_ltable();
    var {
      EOZ,
      luaZ_buffer,
      luaZ_buffremove,
      luaZ_resetbuffer,
      luaZ_resizebuffer
    } = require_lzio();
    var FIRST_RESERVED = 257;
    var LUA_ENV = to_luastring2("_ENV", true);
    var TK_AND = FIRST_RESERVED;
    var TK_BREAK = FIRST_RESERVED + 1;
    var TK_DO = FIRST_RESERVED + 2;
    var TK_ELSE = FIRST_RESERVED + 3;
    var TK_ELSEIF = FIRST_RESERVED + 4;
    var TK_END = FIRST_RESERVED + 5;
    var TK_FALSE = FIRST_RESERVED + 6;
    var TK_FOR = FIRST_RESERVED + 7;
    var TK_FUNCTION = FIRST_RESERVED + 8;
    var TK_GOTO = FIRST_RESERVED + 9;
    var TK_IF = FIRST_RESERVED + 10;
    var TK_IN = FIRST_RESERVED + 11;
    var TK_LOCAL = FIRST_RESERVED + 12;
    var TK_NIL = FIRST_RESERVED + 13;
    var TK_NOT = FIRST_RESERVED + 14;
    var TK_OR = FIRST_RESERVED + 15;
    var TK_REPEAT = FIRST_RESERVED + 16;
    var TK_RETURN = FIRST_RESERVED + 17;
    var TK_THEN = FIRST_RESERVED + 18;
    var TK_TRUE = FIRST_RESERVED + 19;
    var TK_UNTIL = FIRST_RESERVED + 20;
    var TK_WHILE = FIRST_RESERVED + 21;
    var TK_IDIV = FIRST_RESERVED + 22;
    var TK_CONCAT = FIRST_RESERVED + 23;
    var TK_DOTS = FIRST_RESERVED + 24;
    var TK_EQ = FIRST_RESERVED + 25;
    var TK_GE = FIRST_RESERVED + 26;
    var TK_LE = FIRST_RESERVED + 27;
    var TK_NE = FIRST_RESERVED + 28;
    var TK_SHL = FIRST_RESERVED + 29;
    var TK_SHR = FIRST_RESERVED + 30;
    var TK_DBCOLON = FIRST_RESERVED + 31;
    var TK_EOS = FIRST_RESERVED + 32;
    var TK_FLT = FIRST_RESERVED + 33;
    var TK_INT = FIRST_RESERVED + 34;
    var TK_NAME = FIRST_RESERVED + 35;
    var TK_STRING = FIRST_RESERVED + 36;
    var RESERVED = {
      "TK_AND": TK_AND,
      "TK_BREAK": TK_BREAK,
      "TK_DO": TK_DO,
      "TK_ELSE": TK_ELSE,
      "TK_ELSEIF": TK_ELSEIF,
      "TK_END": TK_END,
      "TK_FALSE": TK_FALSE,
      "TK_FOR": TK_FOR,
      "TK_FUNCTION": TK_FUNCTION,
      "TK_GOTO": TK_GOTO,
      "TK_IF": TK_IF,
      "TK_IN": TK_IN,
      "TK_LOCAL": TK_LOCAL,
      "TK_NIL": TK_NIL,
      "TK_NOT": TK_NOT,
      "TK_OR": TK_OR,
      "TK_REPEAT": TK_REPEAT,
      "TK_RETURN": TK_RETURN,
      "TK_THEN": TK_THEN,
      "TK_TRUE": TK_TRUE,
      "TK_UNTIL": TK_UNTIL,
      "TK_WHILE": TK_WHILE,
      "TK_IDIV": TK_IDIV,
      "TK_CONCAT": TK_CONCAT,
      "TK_DOTS": TK_DOTS,
      "TK_EQ": TK_EQ,
      "TK_GE": TK_GE,
      "TK_LE": TK_LE,
      "TK_NE": TK_NE,
      "TK_SHL": TK_SHL,
      "TK_SHR": TK_SHR,
      "TK_DBCOLON": TK_DBCOLON,
      "TK_EOS": TK_EOS,
      "TK_FLT": TK_FLT,
      "TK_INT": TK_INT,
      "TK_NAME": TK_NAME,
      "TK_STRING": TK_STRING
    };
    var luaX_tokens = [
      "and",
      "break",
      "do",
      "else",
      "elseif",
      "end",
      "false",
      "for",
      "function",
      "goto",
      "if",
      "in",
      "local",
      "nil",
      "not",
      "or",
      "repeat",
      "return",
      "then",
      "true",
      "until",
      "while",
      "//",
      "..",
      "...",
      "==",
      ">=",
      "<=",
      "~=",
      "<<",
      ">>",
      "::",
      "<eof>",
      "<number>",
      "<integer>",
      "<name>",
      "<string>"
    ].map((e, i) => to_luastring2(e));
    var SemInfo = class {
      constructor() {
        this.r = NaN;
        this.i = NaN;
        this.ts = null;
      }
    };
    var Token = class {
      constructor() {
        this.token = NaN;
        this.seminfo = new SemInfo();
      }
    };
    var LexState = class {
      constructor() {
        this.current = NaN;
        this.linenumber = NaN;
        this.lastline = NaN;
        this.t = new Token();
        this.lookahead = new Token();
        this.fs = null;
        this.L = null;
        this.z = null;
        this.buff = null;
        this.h = null;
        this.dyd = null;
        this.source = null;
        this.envn = null;
      }
    };
    var save = function(ls, c) {
      let b = ls.buff;
      if (b.n + 1 > b.buffer.length) {
        if (b.buffer.length >= MAX_INT / 2)
          lexerror(ls, to_luastring2("lexical element too long", true), 0);
        let newsize = b.buffer.length * 2;
        luaZ_resizebuffer(ls.L, b, newsize);
      }
      b.buffer[b.n++] = c < 0 ? 255 + c + 1 : c;
    };
    var luaX_token2str = function(ls, token) {
      if (token < FIRST_RESERVED) {
        return lobject.luaO_pushfstring(ls.L, to_luastring2("'%c'", true), token);
      } else {
        let s = luaX_tokens[token - FIRST_RESERVED];
        if (token < TK_EOS)
          return lobject.luaO_pushfstring(ls.L, to_luastring2("'%s'", true), s);
        else
          return s;
      }
    };
    var currIsNewline = function(ls) {
      return ls.current === 10 || ls.current === 13;
    };
    var next = function(ls) {
      ls.current = ls.z.zgetc();
    };
    var save_and_next = function(ls) {
      save(ls, ls.current);
      next(ls);
    };
    var TVtrue = new lobject.TValue(LUA_TBOOLEAN, true);
    var luaX_newstring = function(ls, str) {
      let L = ls.L;
      let ts = luaS_new(L, str);
      let tpair = ls.h.strong.get(luaS_hashlongstr(ts));
      if (!tpair) {
        let key = new lobject.TValue(LUA_TLNGSTR, ts);
        ltable.luaH_setfrom(L, ls.h, key, TVtrue);
      } else {
        ts = tpair.key.tsvalue();
      }
      return ts;
    };
    var inclinenumber = function(ls) {
      let old = ls.current;
      lua_assert(currIsNewline(ls));
      next(ls);
      if (currIsNewline(ls) && ls.current !== old)
        next(ls);
      if (++ls.linenumber >= MAX_INT)
        lexerror(ls, to_luastring2("chunk has too many lines", true), 0);
    };
    var luaX_setinput = function(L, ls, z, source, firstchar) {
      ls.t = {
        token: 0,
        seminfo: new SemInfo()
      };
      ls.L = L;
      ls.current = firstchar;
      ls.lookahead = {
        token: TK_EOS,
        seminfo: new SemInfo()
      };
      ls.z = z;
      ls.fs = null;
      ls.linenumber = 1;
      ls.lastline = 1;
      ls.source = source;
      ls.envn = luaS_bless(L, LUA_ENV);
      luaZ_resizebuffer(L, ls.buff, LUA_MINBUFFER);
    };
    var check_next1 = function(ls, c) {
      if (ls.current === c) {
        next(ls);
        return true;
      }
      return false;
    };
    var check_next2 = function(ls, set) {
      if (ls.current === set[0].charCodeAt(0) || ls.current === set[1].charCodeAt(0)) {
        save_and_next(ls);
        return true;
      }
      return false;
    };
    var read_numeral = function(ls, seminfo) {
      let expo = "Ee";
      let first = ls.current;
      lua_assert(lisdigit(ls.current));
      save_and_next(ls);
      if (first === 48 && check_next2(ls, "xX"))
        expo = "Pp";
      for (; ; ) {
        if (check_next2(ls, expo))
          check_next2(ls, "-+");
        if (lisxdigit(ls.current))
          save_and_next(ls);
        else if (ls.current === 46)
          save_and_next(ls);
        else break;
      }
      let obj = new lobject.TValue();
      if (lobject.luaO_str2num(luaZ_buffer(ls.buff), obj) === 0)
        lexerror(ls, to_luastring2("malformed number", true), TK_FLT);
      if (obj.ttisinteger()) {
        seminfo.i = obj.value;
        return TK_INT;
      } else {
        lua_assert(obj.ttisfloat());
        seminfo.r = obj.value;
        return TK_FLT;
      }
    };
    var txtToken = function(ls, token) {
      switch (token) {
        case TK_NAME:
        case TK_STRING:
        case TK_FLT:
        case TK_INT:
          return lobject.luaO_pushfstring(ls.L, to_luastring2("'%s'", true), luaZ_buffer(ls.buff));
        default:
          return luaX_token2str(ls, token);
      }
    };
    var lexerror = function(ls, msg, token) {
      msg = ldebug.luaG_addinfo(ls.L, msg, ls.source, ls.linenumber);
      if (token)
        lobject.luaO_pushfstring(ls.L, to_luastring2("%s near %s"), msg, txtToken(ls, token));
      ldo.luaD_throw(ls.L, LUA_ERRSYNTAX);
    };
    var luaX_syntaxerror = function(ls, msg) {
      lexerror(ls, msg, ls.t.token);
    };
    var skip_sep = function(ls) {
      let count = 0;
      let s = ls.current;
      lua_assert(
        s === 91 || s === 93
        /* (']').charCodeAt(0) */
      );
      save_and_next(ls);
      while (ls.current === 61) {
        save_and_next(ls);
        count++;
      }
      return ls.current === s ? count : -count - 1;
    };
    var read_long_string = function(ls, seminfo, sep) {
      let line = ls.linenumber;
      save_and_next(ls);
      if (currIsNewline(ls))
        inclinenumber(ls);
      let skip = false;
      for (; !skip; ) {
        switch (ls.current) {
          case EOZ: {
            let what = seminfo ? "string" : "comment";
            let msg = `unfinished long ${what} (starting at line ${line})`;
            lexerror(ls, to_luastring2(msg), TK_EOS);
            break;
          }
          case 93: {
            if (skip_sep(ls) === sep) {
              save_and_next(ls);
              skip = true;
            }
            break;
          }
          case 10:
          case 13: {
            save(
              ls,
              10
              /* ('\n').charCodeAt(0) */
            );
            inclinenumber(ls);
            if (!seminfo) luaZ_resetbuffer(ls.buff);
            break;
          }
          default: {
            if (seminfo) save_and_next(ls);
            else next(ls);
          }
        }
      }
      if (seminfo)
        seminfo.ts = luaX_newstring(ls, ls.buff.buffer.subarray(2 + sep, ls.buff.n - (2 + sep)));
    };
    var esccheck = function(ls, c, msg) {
      if (!c) {
        if (ls.current !== EOZ)
          save_and_next(ls);
        lexerror(ls, msg, TK_STRING);
      }
    };
    var gethexa = function(ls) {
      save_and_next(ls);
      esccheck(ls, lisxdigit(ls.current), to_luastring2("hexadecimal digit expected", true));
      return lobject.luaO_hexavalue(ls.current);
    };
    var readhexaesc = function(ls) {
      let r = gethexa(ls);
      r = (r << 4) + gethexa(ls);
      luaZ_buffremove(ls.buff, 2);
      return r;
    };
    var readutf8desc = function(ls) {
      let i = 4;
      save_and_next(ls);
      esccheck(ls, ls.current === 123, to_luastring2("missing '{'", true));
      let r = gethexa(ls);
      save_and_next(ls);
      while (lisxdigit(ls.current)) {
        i++;
        r = (r << 4) + lobject.luaO_hexavalue(ls.current);
        esccheck(ls, r <= 1114111, to_luastring2("UTF-8 value too large", true));
        save_and_next(ls);
      }
      esccheck(ls, ls.current === 125, to_luastring2("missing '}'", true));
      next(ls);
      luaZ_buffremove(ls.buff, i);
      return r;
    };
    var utf8esc = function(ls) {
      let buff = new Uint8Array(lobject.UTF8BUFFSZ);
      let n = lobject.luaO_utf8esc(buff, readutf8desc(ls));
      for (; n > 0; n--)
        save(ls, buff[lobject.UTF8BUFFSZ - n]);
    };
    var readdecesc = function(ls) {
      let r = 0;
      let i;
      for (i = 0; i < 3 && lisdigit(ls.current); i++) {
        r = 10 * r + ls.current - 48;
        save_and_next(ls);
      }
      esccheck(ls, r <= 255, to_luastring2("decimal escape too large", true));
      luaZ_buffremove(ls.buff, i);
      return r;
    };
    var read_string = function(ls, del, seminfo) {
      save_and_next(ls);
      while (ls.current !== del) {
        switch (ls.current) {
          case EOZ:
            lexerror(ls, to_luastring2("unfinished string", true), TK_EOS);
            break;
          case 10:
          case 13:
            lexerror(ls, to_luastring2("unfinished string", true), TK_STRING);
            break;
          case 92: {
            save_and_next(ls);
            let will;
            let c;
            switch (ls.current) {
              case 97:
                c = 7;
                will = "read_save";
                break;
              case 98:
                c = 8;
                will = "read_save";
                break;
              case 102:
                c = 12;
                will = "read_save";
                break;
              case 110:
                c = 10;
                will = "read_save";
                break;
              case 114:
                c = 13;
                will = "read_save";
                break;
              case 116:
                c = 9;
                will = "read_save";
                break;
              case 118:
                c = 11;
                will = "read_save";
                break;
              case 120:
                c = readhexaesc(ls);
                will = "read_save";
                break;
              case 117:
                utf8esc(ls);
                will = "no_save";
                break;
              case 10:
              case 13:
                inclinenumber(ls);
                c = 10;
                will = "only_save";
                break;
              case 92:
              case 34:
              case 39:
                c = ls.current;
                will = "read_save";
                break;
              case EOZ:
                will = "no_save";
                break;
              /* will raise an error next loop */
              case 122: {
                luaZ_buffremove(ls.buff, 1);
                next(ls);
                while (lisspace(ls.current)) {
                  if (currIsNewline(ls)) inclinenumber(ls);
                  else next(ls);
                }
                will = "no_save";
                break;
              }
              default: {
                esccheck(ls, lisdigit(ls.current), to_luastring2("invalid escape sequence", true));
                c = readdecesc(ls);
                will = "only_save";
                break;
              }
            }
            if (will === "read_save")
              next(ls);
            if (will === "read_save" || will === "only_save") {
              luaZ_buffremove(ls.buff, 1);
              save(ls, c);
            }
            break;
          }
          default:
            save_and_next(ls);
        }
      }
      save_and_next(ls);
      seminfo.ts = luaX_newstring(ls, ls.buff.buffer.subarray(1, ls.buff.n - 1));
    };
    var token_to_index = /* @__PURE__ */ Object.create(null);
    luaX_tokens.forEach((e, i) => token_to_index[luaS_hash(e)] = i);
    var isreserved = function(w) {
      let kidx = token_to_index[luaS_hashlongstr(w)];
      return kidx !== void 0 && kidx <= 22;
    };
    var llex = function(ls, seminfo) {
      luaZ_resetbuffer(ls.buff);
      for (; ; ) {
        lua_assert(typeof ls.current == "number");
        switch (ls.current) {
          case 10:
          case 13: {
            inclinenumber(ls);
            break;
          }
          case 32:
          case 12:
          case 9:
          case 11: {
            next(ls);
            break;
          }
          case 45: {
            next(ls);
            if (ls.current !== 45) return 45;
            next(ls);
            if (ls.current === 91) {
              let sep = skip_sep(ls);
              luaZ_resetbuffer(ls.buff);
              if (sep >= 0) {
                read_long_string(ls, null, sep);
                luaZ_resetbuffer(ls.buff);
                break;
              }
            }
            while (!currIsNewline(ls) && ls.current !== EOZ)
              next(ls);
            break;
          }
          case 91: {
            let sep = skip_sep(ls);
            if (sep >= 0) {
              read_long_string(ls, seminfo, sep);
              return TK_STRING;
            } else if (sep !== -1)
              lexerror(ls, to_luastring2("invalid long string delimiter", true), TK_STRING);
            return 91;
          }
          case 61: {
            next(ls);
            if (check_next1(
              ls,
              61
              /* ('=').charCodeAt(0) */
            )) return TK_EQ;
            else return 61;
          }
          case 60: {
            next(ls);
            if (check_next1(
              ls,
              61
              /* ('=').charCodeAt(0) */
            )) return TK_LE;
            else if (check_next1(
              ls,
              60
              /* ('<').charCodeAt(0) */
            )) return TK_SHL;
            else return 60;
          }
          case 62: {
            next(ls);
            if (check_next1(
              ls,
              61
              /* ('=').charCodeAt(0) */
            )) return TK_GE;
            else if (check_next1(
              ls,
              62
              /* ('>').charCodeAt(0) */
            )) return TK_SHR;
            else return 62;
          }
          case 47: {
            next(ls);
            if (check_next1(
              ls,
              47
              /* ('/').charCodeAt(0) */
            )) return TK_IDIV;
            else return 47;
          }
          case 126: {
            next(ls);
            if (check_next1(
              ls,
              61
              /* ('=').charCodeAt(0) */
            )) return TK_NE;
            else return 126;
          }
          case 58: {
            next(ls);
            if (check_next1(
              ls,
              58
              /* (':').charCodeAt(0) */
            )) return TK_DBCOLON;
            else return 58;
          }
          case 34:
          case 39: {
            read_string(ls, ls.current, seminfo);
            return TK_STRING;
          }
          case 46: {
            save_and_next(ls);
            if (check_next1(
              ls,
              46
              /* ('.').charCodeAt(0) */
            )) {
              if (check_next1(
                ls,
                46
                /* ('.').charCodeAt(0) */
              ))
                return TK_DOTS;
              else return TK_CONCAT;
            } else if (!lisdigit(ls.current)) return 46;
            else return read_numeral(ls, seminfo);
          }
          case 48:
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57: {
            return read_numeral(ls, seminfo);
          }
          case EOZ: {
            return TK_EOS;
          }
          default: {
            if (lislalpha(ls.current)) {
              do {
                save_and_next(ls);
              } while (lislalnum(ls.current));
              let ts = luaX_newstring(ls, luaZ_buffer(ls.buff));
              seminfo.ts = ts;
              let kidx = token_to_index[luaS_hashlongstr(ts)];
              if (kidx !== void 0 && kidx <= 22)
                return kidx + FIRST_RESERVED;
              else
                return TK_NAME;
            } else {
              let c = ls.current;
              next(ls);
              return c;
            }
          }
        }
      }
    };
    var luaX_next = function(ls) {
      ls.lastline = ls.linenumber;
      if (ls.lookahead.token !== TK_EOS) {
        ls.t.token = ls.lookahead.token;
        ls.t.seminfo.i = ls.lookahead.seminfo.i;
        ls.t.seminfo.r = ls.lookahead.seminfo.r;
        ls.t.seminfo.ts = ls.lookahead.seminfo.ts;
        ls.lookahead.token = TK_EOS;
      } else
        ls.t.token = llex(ls, ls.t.seminfo);
    };
    var luaX_lookahead = function(ls) {
      lua_assert(ls.lookahead.token === TK_EOS);
      ls.lookahead.token = llex(ls, ls.lookahead.seminfo);
      return ls.lookahead.token;
    };
    module.exports.FIRST_RESERVED = FIRST_RESERVED;
    module.exports.LUA_ENV = LUA_ENV;
    module.exports.LexState = LexState;
    module.exports.RESERVED = RESERVED;
    module.exports.isreserved = isreserved;
    module.exports.luaX_lookahead = luaX_lookahead;
    module.exports.luaX_newstring = luaX_newstring;
    module.exports.luaX_next = luaX_next;
    module.exports.luaX_setinput = luaX_setinput;
    module.exports.luaX_syntaxerror = luaX_syntaxerror;
    module.exports.luaX_token2str = luaX_token2str;
    module.exports.luaX_tokens = luaX_tokens;
  }
});

// vendor/fengari/src/lcode.js
var require_lcode = __commonJS({
  "vendor/fengari/src/lcode.js"(exports, module) {
    "use strict";
    var {
      LUA_MULTRET,
      LUA_OPADD,
      LUA_OPBAND,
      LUA_OPBNOT,
      LUA_OPBOR,
      LUA_OPBXOR,
      LUA_OPDIV,
      LUA_OPIDIV,
      LUA_OPMOD,
      LUA_OPSHL,
      LUA_OPSHR,
      LUA_OPUNM,
      constant_types: {
        LUA_TBOOLEAN,
        LUA_TLIGHTUSERDATA,
        LUA_TLNGSTR,
        LUA_TNIL,
        LUA_TNUMFLT,
        LUA_TNUMINT,
        LUA_TTABLE
      },
      to_luastring: to_luastring2
    } = require_defs();
    var { lua_assert } = require_llimits();
    var llex = require_llex();
    var lobject = require_lobject();
    var lopcodes = require_lopcodes();
    var lparser = require_lparser();
    var ltable = require_ltable();
    var lvm = require_lvm();
    var OpCodesI = lopcodes.OpCodesI;
    var TValue = lobject.TValue;
    var MAXREGS = 255;
    var NO_JUMP = -1;
    var BinOpr = {
      OPR_ADD: 0,
      OPR_SUB: 1,
      OPR_MUL: 2,
      OPR_MOD: 3,
      OPR_POW: 4,
      OPR_DIV: 5,
      OPR_IDIV: 6,
      OPR_BAND: 7,
      OPR_BOR: 8,
      OPR_BXOR: 9,
      OPR_SHL: 10,
      OPR_SHR: 11,
      OPR_CONCAT: 12,
      OPR_EQ: 13,
      OPR_LT: 14,
      OPR_LE: 15,
      OPR_NE: 16,
      OPR_GT: 17,
      OPR_GE: 18,
      OPR_AND: 19,
      OPR_OR: 20,
      OPR_NOBINOPR: 21
    };
    var UnOpr = {
      OPR_MINUS: 0,
      OPR_BNOT: 1,
      OPR_NOT: 2,
      OPR_LEN: 3,
      OPR_NOUNOPR: 4
    };
    var hasjumps = function(e) {
      return e.t !== e.f;
    };
    var tonumeral = function(e, make_tvalue) {
      let ek = lparser.expkind;
      if (hasjumps(e))
        return false;
      switch (e.k) {
        case ek.VKINT:
          if (make_tvalue) {
            return new TValue(LUA_TNUMINT, e.u.ival);
          }
          return true;
        case ek.VKFLT:
          if (make_tvalue) {
            return new TValue(LUA_TNUMFLT, e.u.nval);
          }
          return true;
        default:
          return false;
      }
    };
    var luaK_nil = function(fs, from, n) {
      let previous;
      let l = from + n - 1;
      if (fs.pc > fs.lasttarget) {
        previous = fs.f.code[fs.pc - 1];
        if (previous.opcode === OpCodesI.OP_LOADNIL) {
          let pfrom = previous.A;
          let pl = pfrom + previous.B;
          if (pfrom <= from && from <= pl + 1 || from <= pfrom && pfrom <= l + 1) {
            if (pfrom < from) from = pfrom;
            if (pl > l) l = pl;
            lopcodes.SETARG_A(previous, from);
            lopcodes.SETARG_B(previous, l - from);
            return;
          }
        }
      }
      luaK_codeABC(fs, OpCodesI.OP_LOADNIL, from, n - 1, 0);
    };
    var getinstruction = function(fs, e) {
      return fs.f.code[e.u.info];
    };
    var getjump = function(fs, pc) {
      let offset = fs.f.code[pc].sBx;
      if (offset === NO_JUMP)
        return NO_JUMP;
      else
        return pc + 1 + offset;
    };
    var fixjump = function(fs, pc, dest) {
      let jmp = fs.f.code[pc];
      let offset = dest - (pc + 1);
      lua_assert(dest !== NO_JUMP);
      if (Math.abs(offset) > lopcodes.MAXARG_sBx)
        llex.luaX_syntaxerror(fs.ls, to_luastring2("control structure too long", true));
      lopcodes.SETARG_sBx(jmp, offset);
    };
    var luaK_concat = function(fs, l1, l2) {
      if (l2 === NO_JUMP) return l1;
      else if (l1 === NO_JUMP)
        l1 = l2;
      else {
        let list = l1;
        let next = getjump(fs, list);
        while (next !== NO_JUMP) {
          list = next;
          next = getjump(fs, list);
        }
        fixjump(fs, list, l2);
      }
      return l1;
    };
    var luaK_jump = function(fs) {
      let jpc = fs.jpc;
      fs.jpc = NO_JUMP;
      let j = luaK_codeAsBx(fs, OpCodesI.OP_JMP, 0, NO_JUMP);
      j = luaK_concat(fs, j, jpc);
      return j;
    };
    var luaK_jumpto = function(fs, t) {
      return luaK_patchlist(fs, luaK_jump(fs), t);
    };
    var luaK_ret = function(fs, first, nret) {
      luaK_codeABC(fs, OpCodesI.OP_RETURN, first, nret + 1, 0);
    };
    var condjump = function(fs, op, A, B, C) {
      luaK_codeABC(fs, op, A, B, C);
      return luaK_jump(fs);
    };
    var luaK_getlabel = function(fs) {
      fs.lasttarget = fs.pc;
      return fs.pc;
    };
    var getjumpcontroloffset = function(fs, pc) {
      if (pc >= 1 && lopcodes.testTMode(fs.f.code[pc - 1].opcode))
        return pc - 1;
      else
        return pc;
    };
    var getjumpcontrol = function(fs, pc) {
      return fs.f.code[getjumpcontroloffset(fs, pc)];
    };
    var patchtestreg = function(fs, node, reg) {
      let pc = getjumpcontroloffset(fs, node);
      let i = fs.f.code[pc];
      if (i.opcode !== OpCodesI.OP_TESTSET)
        return false;
      if (reg !== lopcodes.NO_REG && reg !== i.B)
        lopcodes.SETARG_A(i, reg);
      else {
        fs.f.code[pc] = lopcodes.CREATE_ABC(OpCodesI.OP_TEST, i.B, 0, i.C);
      }
      return true;
    };
    var removevalues = function(fs, list) {
      for (; list !== NO_JUMP; list = getjump(fs, list))
        patchtestreg(fs, list, lopcodes.NO_REG);
    };
    var patchlistaux = function(fs, list, vtarget, reg, dtarget) {
      while (list !== NO_JUMP) {
        let next = getjump(fs, list);
        if (patchtestreg(fs, list, reg))
          fixjump(fs, list, vtarget);
        else
          fixjump(fs, list, dtarget);
        list = next;
      }
    };
    var dischargejpc = function(fs) {
      patchlistaux(fs, fs.jpc, fs.pc, lopcodes.NO_REG, fs.pc);
      fs.jpc = NO_JUMP;
    };
    var luaK_patchtohere = function(fs, list) {
      luaK_getlabel(fs);
      fs.jpc = luaK_concat(fs, fs.jpc, list);
    };
    var luaK_patchlist = function(fs, list, target) {
      if (target === fs.pc)
        luaK_patchtohere(fs, list);
      else {
        lua_assert(target < fs.pc);
        patchlistaux(fs, list, target, lopcodes.NO_REG, target);
      }
    };
    var luaK_patchclose = function(fs, list, level) {
      level++;
      for (; list !== NO_JUMP; list = getjump(fs, list)) {
        let ins = fs.f.code[list];
        lua_assert(ins.opcode === OpCodesI.OP_JMP && (ins.A === 0 || ins.A >= level));
        lopcodes.SETARG_A(ins, level);
      }
    };
    var luaK_code = function(fs, i) {
      let f = fs.f;
      dischargejpc(fs);
      f.code[fs.pc] = i;
      f.lineinfo[fs.pc] = fs.ls.lastline;
      return fs.pc++;
    };
    var luaK_codeABC = function(fs, o, a, b, c) {
      lua_assert(lopcodes.getOpMode(o) === lopcodes.iABC);
      lua_assert(lopcodes.getBMode(o) !== lopcodes.OpArgN || b === 0);
      lua_assert(lopcodes.getCMode(o) !== lopcodes.OpArgN || c === 0);
      lua_assert(a <= lopcodes.MAXARG_A && b <= lopcodes.MAXARG_B && c <= lopcodes.MAXARG_C);
      return luaK_code(fs, lopcodes.CREATE_ABC(o, a, b, c));
    };
    var luaK_codeABx = function(fs, o, a, bc) {
      lua_assert(lopcodes.getOpMode(o) === lopcodes.iABx || lopcodes.getOpMode(o) === lopcodes.iAsBx);
      lua_assert(lopcodes.getCMode(o) === lopcodes.OpArgN);
      lua_assert(a <= lopcodes.MAXARG_A && bc <= lopcodes.MAXARG_Bx);
      return luaK_code(fs, lopcodes.CREATE_ABx(o, a, bc));
    };
    var luaK_codeAsBx = function(fs, o, A, sBx) {
      return luaK_codeABx(fs, o, A, sBx + lopcodes.MAXARG_sBx);
    };
    var codeextraarg = function(fs, a) {
      lua_assert(a <= lopcodes.MAXARG_Ax);
      return luaK_code(fs, lopcodes.CREATE_Ax(OpCodesI.OP_EXTRAARG, a));
    };
    var luaK_codek = function(fs, reg, k) {
      if (k <= lopcodes.MAXARG_Bx)
        return luaK_codeABx(fs, OpCodesI.OP_LOADK, reg, k);
      else {
        let p = luaK_codeABx(fs, OpCodesI.OP_LOADKX, reg, 0);
        codeextraarg(fs, k);
        return p;
      }
    };
    var luaK_checkstack = function(fs, n) {
      let newstack = fs.freereg + n;
      if (newstack > fs.f.maxstacksize) {
        if (newstack >= MAXREGS)
          llex.luaX_syntaxerror(fs.ls, to_luastring2("function or expression needs too many registers", true));
        fs.f.maxstacksize = newstack;
      }
    };
    var luaK_reserveregs = function(fs, n) {
      luaK_checkstack(fs, n);
      fs.freereg += n;
    };
    var freereg = function(fs, reg) {
      if (!lopcodes.ISK(reg) && reg >= fs.nactvar) {
        fs.freereg--;
        lua_assert(reg === fs.freereg);
      }
    };
    var freeexp = function(fs, e) {
      if (e.k === lparser.expkind.VNONRELOC)
        freereg(fs, e.u.info);
    };
    var freeexps = function(fs, e1, e2) {
      let r1 = e1.k === lparser.expkind.VNONRELOC ? e1.u.info : -1;
      let r2 = e2.k === lparser.expkind.VNONRELOC ? e2.u.info : -1;
      if (r1 > r2) {
        freereg(fs, r1);
        freereg(fs, r2);
      } else {
        freereg(fs, r2);
        freereg(fs, r1);
      }
    };
    var addk = function(fs, key, v) {
      let f = fs.f;
      let idx = ltable.luaH_get(fs.L, fs.ls.h, key);
      if (idx.ttisinteger()) {
        let k2 = idx.value;
        if (k2 < fs.nk && f.k[k2].ttype() === v.ttype() && f.k[k2].value === v.value)
          return k2;
      }
      let k = fs.nk;
      ltable.luaH_setfrom(fs.L, fs.ls.h, key, new lobject.TValue(LUA_TNUMINT, k));
      f.k[k] = v;
      fs.nk++;
      return k;
    };
    var luaK_stringK = function(fs, s) {
      let o = new TValue(LUA_TLNGSTR, s);
      return addk(fs, o, o);
    };
    var luaK_intK = function(fs, n) {
      let k = new TValue(LUA_TLIGHTUSERDATA, n);
      let o = new TValue(LUA_TNUMINT, n);
      return addk(fs, k, o);
    };
    var luaK_numberK = function(fs, r) {
      let o = new TValue(LUA_TNUMFLT, r);
      return addk(fs, o, o);
    };
    var boolK = function(fs, b) {
      let o = new TValue(LUA_TBOOLEAN, b);
      return addk(fs, o, o);
    };
    var nilK = function(fs) {
      let v = new TValue(LUA_TNIL, null);
      let k = new TValue(LUA_TTABLE, fs.ls.h);
      return addk(fs, k, v);
    };
    var luaK_setreturns = function(fs, e, nresults) {
      let ek = lparser.expkind;
      if (e.k === ek.VCALL) {
        lopcodes.SETARG_C(getinstruction(fs, e), nresults + 1);
      } else if (e.k === ek.VVARARG) {
        let pc = getinstruction(fs, e);
        lopcodes.SETARG_B(pc, nresults + 1);
        lopcodes.SETARG_A(pc, fs.freereg);
        luaK_reserveregs(fs, 1);
      } else lua_assert(nresults === LUA_MULTRET);
    };
    var luaK_setmultret = function(fs, e) {
      luaK_setreturns(fs, e, LUA_MULTRET);
    };
    var luaK_setoneret = function(fs, e) {
      let ek = lparser.expkind;
      if (e.k === ek.VCALL) {
        lua_assert(getinstruction(fs, e).C === 2);
        e.k = ek.VNONRELOC;
        e.u.info = getinstruction(fs, e).A;
      } else if (e.k === ek.VVARARG) {
        lopcodes.SETARG_B(getinstruction(fs, e), 2);
        e.k = ek.VRELOCABLE;
      }
    };
    var luaK_dischargevars = function(fs, e) {
      let ek = lparser.expkind;
      switch (e.k) {
        case ek.VLOCAL: {
          e.k = ek.VNONRELOC;
          break;
        }
        case ek.VUPVAL: {
          e.u.info = luaK_codeABC(fs, OpCodesI.OP_GETUPVAL, 0, e.u.info, 0);
          e.k = ek.VRELOCABLE;
          break;
        }
        case ek.VINDEXED: {
          let op;
          freereg(fs, e.u.ind.idx);
          if (e.u.ind.vt === ek.VLOCAL) {
            freereg(fs, e.u.ind.t);
            op = OpCodesI.OP_GETTABLE;
          } else {
            lua_assert(e.u.ind.vt === ek.VUPVAL);
            op = OpCodesI.OP_GETTABUP;
          }
          e.u.info = luaK_codeABC(fs, op, 0, e.u.ind.t, e.u.ind.idx);
          e.k = ek.VRELOCABLE;
          break;
        }
        case ek.VVARARG:
        case ek.VCALL: {
          luaK_setoneret(fs, e);
          break;
        }
        default:
          break;
      }
    };
    var code_loadbool = function(fs, A, b, jump) {
      luaK_getlabel(fs);
      return luaK_codeABC(fs, OpCodesI.OP_LOADBOOL, A, b, jump);
    };
    var discharge2reg = function(fs, e, reg) {
      let ek = lparser.expkind;
      luaK_dischargevars(fs, e);
      switch (e.k) {
        case ek.VNIL: {
          luaK_nil(fs, reg, 1);
          break;
        }
        case ek.VFALSE:
        case ek.VTRUE: {
          luaK_codeABC(fs, OpCodesI.OP_LOADBOOL, reg, e.k === ek.VTRUE, 0);
          break;
        }
        case ek.VK: {
          luaK_codek(fs, reg, e.u.info);
          break;
        }
        case ek.VKFLT: {
          luaK_codek(fs, reg, luaK_numberK(fs, e.u.nval));
          break;
        }
        case ek.VKINT: {
          luaK_codek(fs, reg, luaK_intK(fs, e.u.ival));
          break;
        }
        case ek.VRELOCABLE: {
          let pc = getinstruction(fs, e);
          lopcodes.SETARG_A(pc, reg);
          break;
        }
        case ek.VNONRELOC: {
          if (reg !== e.u.info)
            luaK_codeABC(fs, OpCodesI.OP_MOVE, reg, e.u.info, 0);
          break;
        }
        default: {
          lua_assert(e.k === ek.VJMP);
          return;
        }
      }
      e.u.info = reg;
      e.k = ek.VNONRELOC;
    };
    var discharge2anyreg = function(fs, e) {
      if (e.k !== lparser.expkind.VNONRELOC) {
        luaK_reserveregs(fs, 1);
        discharge2reg(fs, e, fs.freereg - 1);
      }
    };
    var need_value = function(fs, list) {
      for (; list !== NO_JUMP; list = getjump(fs, list)) {
        let i = getjumpcontrol(fs, list);
        if (i.opcode !== OpCodesI.OP_TESTSET) return true;
      }
      return false;
    };
    var exp2reg = function(fs, e, reg) {
      let ek = lparser.expkind;
      discharge2reg(fs, e, reg);
      if (e.k === ek.VJMP)
        e.t = luaK_concat(fs, e.t, e.u.info);
      if (hasjumps(e)) {
        let final;
        let p_f = NO_JUMP;
        let p_t = NO_JUMP;
        if (need_value(fs, e.t) || need_value(fs, e.f)) {
          let fj = e.k === ek.VJMP ? NO_JUMP : luaK_jump(fs);
          p_f = code_loadbool(fs, reg, 0, 1);
          p_t = code_loadbool(fs, reg, 1, 0);
          luaK_patchtohere(fs, fj);
        }
        final = luaK_getlabel(fs);
        patchlistaux(fs, e.f, final, reg, p_f);
        patchlistaux(fs, e.t, final, reg, p_t);
      }
      e.f = e.t = NO_JUMP;
      e.u.info = reg;
      e.k = ek.VNONRELOC;
    };
    var luaK_exp2nextreg = function(fs, e) {
      luaK_dischargevars(fs, e);
      freeexp(fs, e);
      luaK_reserveregs(fs, 1);
      exp2reg(fs, e, fs.freereg - 1);
    };
    var luaK_exp2anyreg = function(fs, e) {
      luaK_dischargevars(fs, e);
      if (e.k === lparser.expkind.VNONRELOC) {
        if (!hasjumps(e))
          return e.u.info;
        if (e.u.info >= fs.nactvar) {
          exp2reg(fs, e, e.u.info);
          return e.u.info;
        }
      }
      luaK_exp2nextreg(fs, e);
      return e.u.info;
    };
    var luaK_exp2anyregup = function(fs, e) {
      if (e.k !== lparser.expkind.VUPVAL || hasjumps(e))
        luaK_exp2anyreg(fs, e);
    };
    var luaK_exp2val = function(fs, e) {
      if (hasjumps(e))
        luaK_exp2anyreg(fs, e);
      else
        luaK_dischargevars(fs, e);
    };
    var luaK_exp2RK = function(fs, e) {
      let ek = lparser.expkind;
      let vk = false;
      luaK_exp2val(fs, e);
      switch (e.k) {
        /* move constants to 'k' */
        case ek.VTRUE:
          e.u.info = boolK(fs, true);
          vk = true;
          break;
        case ek.VFALSE:
          e.u.info = boolK(fs, false);
          vk = true;
          break;
        case ek.VNIL:
          e.u.info = nilK(fs);
          vk = true;
          break;
        case ek.VKINT:
          e.u.info = luaK_intK(fs, e.u.ival);
          vk = true;
          break;
        case ek.VKFLT:
          e.u.info = luaK_numberK(fs, e.u.nval);
          vk = true;
          break;
        case ek.VK:
          vk = true;
          break;
        default:
          break;
      }
      if (vk) {
        e.k = ek.VK;
        if (e.u.info <= lopcodes.MAXINDEXRK)
          return lopcodes.RKASK(e.u.info);
      }
      return luaK_exp2anyreg(fs, e);
    };
    var luaK_storevar = function(fs, vr, ex) {
      let ek = lparser.expkind;
      switch (vr.k) {
        case ek.VLOCAL: {
          freeexp(fs, ex);
          exp2reg(fs, ex, vr.u.info);
          return;
        }
        case ek.VUPVAL: {
          let e = luaK_exp2anyreg(fs, ex);
          luaK_codeABC(fs, OpCodesI.OP_SETUPVAL, e, vr.u.info, 0);
          break;
        }
        case ek.VINDEXED: {
          let op = vr.u.ind.vt === ek.VLOCAL ? OpCodesI.OP_SETTABLE : OpCodesI.OP_SETTABUP;
          let e = luaK_exp2RK(fs, ex);
          luaK_codeABC(fs, op, vr.u.ind.t, vr.u.ind.idx, e);
          break;
        }
      }
      freeexp(fs, ex);
    };
    var luaK_self = function(fs, e, key) {
      luaK_exp2anyreg(fs, e);
      let ereg = e.u.info;
      freeexp(fs, e);
      e.u.info = fs.freereg;
      e.k = lparser.expkind.VNONRELOC;
      luaK_reserveregs(fs, 2);
      luaK_codeABC(fs, OpCodesI.OP_SELF, e.u.info, ereg, luaK_exp2RK(fs, key));
      freeexp(fs, key);
    };
    var negatecondition = function(fs, e) {
      let pc = getjumpcontrol(fs, e.u.info);
      lua_assert(lopcodes.testTMode(pc.opcode) && pc.opcode !== OpCodesI.OP_TESTSET && pc.opcode !== OpCodesI.OP_TEST);
      lopcodes.SETARG_A(pc, !pc.A);
    };
    var jumponcond = function(fs, e, cond) {
      if (e.k === lparser.expkind.VRELOCABLE) {
        let ie = getinstruction(fs, e);
        if (ie.opcode === OpCodesI.OP_NOT) {
          fs.pc--;
          return condjump(fs, OpCodesI.OP_TEST, ie.B, 0, !cond);
        }
      }
      discharge2anyreg(fs, e);
      freeexp(fs, e);
      return condjump(fs, OpCodesI.OP_TESTSET, lopcodes.NO_REG, e.u.info, cond);
    };
    var luaK_goiftrue = function(fs, e) {
      let ek = lparser.expkind;
      let pc;
      luaK_dischargevars(fs, e);
      switch (e.k) {
        case ek.VJMP: {
          negatecondition(fs, e);
          pc = e.u.info;
          break;
        }
        case ek.VK:
        case ek.VKFLT:
        case ek.VKINT:
        case ek.VTRUE: {
          pc = NO_JUMP;
          break;
        }
        default: {
          pc = jumponcond(fs, e, 0);
          break;
        }
      }
      e.f = luaK_concat(fs, e.f, pc);
      luaK_patchtohere(fs, e.t);
      e.t = NO_JUMP;
    };
    var luaK_goiffalse = function(fs, e) {
      let ek = lparser.expkind;
      let pc;
      luaK_dischargevars(fs, e);
      switch (e.k) {
        case ek.VJMP: {
          pc = e.u.info;
          break;
        }
        case ek.VNIL:
        case ek.VFALSE: {
          pc = NO_JUMP;
          break;
        }
        default: {
          pc = jumponcond(fs, e, 1);
          break;
        }
      }
      e.t = luaK_concat(fs, e.t, pc);
      luaK_patchtohere(fs, e.f);
      e.f = NO_JUMP;
    };
    var codenot = function(fs, e) {
      let ek = lparser.expkind;
      luaK_dischargevars(fs, e);
      switch (e.k) {
        case ek.VNIL:
        case ek.VFALSE: {
          e.k = ek.VTRUE;
          break;
        }
        case ek.VK:
        case ek.VKFLT:
        case ek.VKINT:
        case ek.VTRUE: {
          e.k = ek.VFALSE;
          break;
        }
        case ek.VJMP: {
          negatecondition(fs, e);
          break;
        }
        case ek.VRELOCABLE:
        case ek.VNONRELOC: {
          discharge2anyreg(fs, e);
          freeexp(fs, e);
          e.u.info = luaK_codeABC(fs, OpCodesI.OP_NOT, 0, e.u.info, 0);
          e.k = ek.VRELOCABLE;
          break;
        }
      }
      {
        let temp = e.f;
        e.f = e.t;
        e.t = temp;
      }
      removevalues(fs, e.f);
      removevalues(fs, e.t);
    };
    var luaK_indexed = function(fs, t, k) {
      let ek = lparser.expkind;
      lua_assert(!hasjumps(t) && (lparser.vkisinreg(t.k) || t.k === ek.VUPVAL));
      t.u.ind.t = t.u.info;
      t.u.ind.idx = luaK_exp2RK(fs, k);
      t.u.ind.vt = t.k === ek.VUPVAL ? ek.VUPVAL : ek.VLOCAL;
      t.k = ek.VINDEXED;
    };
    var validop = function(op, v1, v2) {
      switch (op) {
        case LUA_OPBAND:
        case LUA_OPBOR:
        case LUA_OPBXOR:
        case LUA_OPSHL:
        case LUA_OPSHR:
        case LUA_OPBNOT: {
          return lvm.tointeger(v1) !== false && lvm.tointeger(v2) !== false;
        }
        case LUA_OPDIV:
        case LUA_OPIDIV:
        case LUA_OPMOD:
          return v2.value !== 0;
        default:
          return 1;
      }
    };
    var constfolding = function(op, e1, e2) {
      let ek = lparser.expkind;
      let v1, v2;
      if (!(v1 = tonumeral(e1, true)) || !(v2 = tonumeral(e2, true)) || !validop(op, v1, v2))
        return 0;
      let res = new TValue();
      lobject.luaO_arith(null, op, v1, v2, res);
      if (res.ttisinteger()) {
        e1.k = ek.VKINT;
        e1.u.ival = res.value;
      } else {
        let n = res.value;
        if (isNaN(n) || n === 0)
          return false;
        e1.k = ek.VKFLT;
        e1.u.nval = n;
      }
      return true;
    };
    var codeunexpval = function(fs, op, e, line) {
      let r = luaK_exp2anyreg(fs, e);
      freeexp(fs, e);
      e.u.info = luaK_codeABC(fs, op, 0, r, 0);
      e.k = lparser.expkind.VRELOCABLE;
      luaK_fixline(fs, line);
    };
    var codebinexpval = function(fs, op, e1, e2, line) {
      let rk2 = luaK_exp2RK(fs, e2);
      let rk1 = luaK_exp2RK(fs, e1);
      freeexps(fs, e1, e2);
      e1.u.info = luaK_codeABC(fs, op, 0, rk1, rk2);
      e1.k = lparser.expkind.VRELOCABLE;
      luaK_fixline(fs, line);
    };
    var codecomp = function(fs, opr, e1, e2) {
      let ek = lparser.expkind;
      let rk1;
      if (e1.k === ek.VK)
        rk1 = lopcodes.RKASK(e1.u.info);
      else {
        lua_assert(e1.k === ek.VNONRELOC);
        rk1 = e1.u.info;
      }
      let rk2 = luaK_exp2RK(fs, e2);
      freeexps(fs, e1, e2);
      switch (opr) {
        case BinOpr.OPR_NE: {
          e1.u.info = condjump(fs, OpCodesI.OP_EQ, 0, rk1, rk2);
          break;
        }
        case BinOpr.OPR_GT:
        case BinOpr.OPR_GE: {
          let op = opr - BinOpr.OPR_NE + OpCodesI.OP_EQ;
          e1.u.info = condjump(fs, op, 1, rk2, rk1);
          break;
        }
        default: {
          let op = opr - BinOpr.OPR_EQ + OpCodesI.OP_EQ;
          e1.u.info = condjump(fs, op, 1, rk1, rk2);
          break;
        }
      }
      e1.k = ek.VJMP;
    };
    var luaK_prefix = function(fs, op, e, line) {
      let ef = new lparser.expdesc();
      ef.k = lparser.expkind.VKINT;
      ef.u.ival = ef.u.nval = ef.u.info = 0;
      ef.t = NO_JUMP;
      ef.f = NO_JUMP;
      switch (op) {
        case UnOpr.OPR_MINUS:
        case UnOpr.OPR_BNOT:
          if (constfolding(op + LUA_OPUNM, e, ef))
            break;
        /* FALLTHROUGH */
        case UnOpr.OPR_LEN:
          codeunexpval(fs, op + OpCodesI.OP_UNM, e, line);
          break;
        case UnOpr.OPR_NOT:
          codenot(fs, e);
          break;
      }
    };
    var luaK_infix = function(fs, op, v) {
      switch (op) {
        case BinOpr.OPR_AND: {
          luaK_goiftrue(fs, v);
          break;
        }
        case BinOpr.OPR_OR: {
          luaK_goiffalse(fs, v);
          break;
        }
        case BinOpr.OPR_CONCAT: {
          luaK_exp2nextreg(fs, v);
          break;
        }
        case BinOpr.OPR_ADD:
        case BinOpr.OPR_SUB:
        case BinOpr.OPR_MUL:
        case BinOpr.OPR_DIV:
        case BinOpr.OPR_IDIV:
        case BinOpr.OPR_MOD:
        case BinOpr.OPR_POW:
        case BinOpr.OPR_BAND:
        case BinOpr.OPR_BOR:
        case BinOpr.OPR_BXOR:
        case BinOpr.OPR_SHL:
        case BinOpr.OPR_SHR: {
          if (!tonumeral(v, false))
            luaK_exp2RK(fs, v);
          break;
        }
        default: {
          luaK_exp2RK(fs, v);
          break;
        }
      }
    };
    var luaK_posfix = function(fs, op, e1, e2, line) {
      let ek = lparser.expkind;
      switch (op) {
        case BinOpr.OPR_AND: {
          lua_assert(e1.t === NO_JUMP);
          luaK_dischargevars(fs, e2);
          e2.f = luaK_concat(fs, e2.f, e1.f);
          e1.to(e2);
          break;
        }
        case BinOpr.OPR_OR: {
          lua_assert(e1.f === NO_JUMP);
          luaK_dischargevars(fs, e2);
          e2.t = luaK_concat(fs, e2.t, e1.t);
          e1.to(e2);
          break;
        }
        case BinOpr.OPR_CONCAT: {
          luaK_exp2val(fs, e2);
          let ins = getinstruction(fs, e2);
          if (e2.k === ek.VRELOCABLE && ins.opcode === OpCodesI.OP_CONCAT) {
            lua_assert(e1.u.info === ins.B - 1);
            freeexp(fs, e1);
            lopcodes.SETARG_B(ins, e1.u.info);
            e1.k = ek.VRELOCABLE;
            e1.u.info = e2.u.info;
          } else {
            luaK_exp2nextreg(fs, e2);
            codebinexpval(fs, OpCodesI.OP_CONCAT, e1, e2, line);
          }
          break;
        }
        case BinOpr.OPR_ADD:
        case BinOpr.OPR_SUB:
        case BinOpr.OPR_MUL:
        case BinOpr.OPR_DIV:
        case BinOpr.OPR_IDIV:
        case BinOpr.OPR_MOD:
        case BinOpr.OPR_POW:
        case BinOpr.OPR_BAND:
        case BinOpr.OPR_BOR:
        case BinOpr.OPR_BXOR:
        case BinOpr.OPR_SHL:
        case BinOpr.OPR_SHR: {
          if (!constfolding(op + LUA_OPADD, e1, e2))
            codebinexpval(fs, op + OpCodesI.OP_ADD, e1, e2, line);
          break;
        }
        case BinOpr.OPR_EQ:
        case BinOpr.OPR_LT:
        case BinOpr.OPR_LE:
        case BinOpr.OPR_NE:
        case BinOpr.OPR_GT:
        case BinOpr.OPR_GE: {
          codecomp(fs, op, e1, e2);
          break;
        }
      }
      return e1;
    };
    var luaK_fixline = function(fs, line) {
      fs.f.lineinfo[fs.pc - 1] = line;
    };
    var luaK_setlist = function(fs, base, nelems, tostore) {
      let c = (nelems - 1) / lopcodes.LFIELDS_PER_FLUSH + 1;
      let b = tostore === LUA_MULTRET ? 0 : tostore;
      lua_assert(tostore !== 0 && tostore <= lopcodes.LFIELDS_PER_FLUSH);
      if (c <= lopcodes.MAXARG_C)
        luaK_codeABC(fs, OpCodesI.OP_SETLIST, base, b, c);
      else if (c <= lopcodes.MAXARG_Ax) {
        luaK_codeABC(fs, OpCodesI.OP_SETLIST, base, b, 0);
        codeextraarg(fs, c);
      } else
        llex.luaX_syntaxerror(fs.ls, to_luastring2("constructor too long", true));
      fs.freereg = base + 1;
    };
    module.exports.BinOpr = BinOpr;
    module.exports.NO_JUMP = NO_JUMP;
    module.exports.UnOpr = UnOpr;
    module.exports.getinstruction = getinstruction;
    module.exports.luaK_checkstack = luaK_checkstack;
    module.exports.luaK_code = luaK_code;
    module.exports.luaK_codeABC = luaK_codeABC;
    module.exports.luaK_codeABx = luaK_codeABx;
    module.exports.luaK_codeAsBx = luaK_codeAsBx;
    module.exports.luaK_codek = luaK_codek;
    module.exports.luaK_concat = luaK_concat;
    module.exports.luaK_dischargevars = luaK_dischargevars;
    module.exports.luaK_exp2RK = luaK_exp2RK;
    module.exports.luaK_exp2anyreg = luaK_exp2anyreg;
    module.exports.luaK_exp2anyregup = luaK_exp2anyregup;
    module.exports.luaK_exp2nextreg = luaK_exp2nextreg;
    module.exports.luaK_exp2val = luaK_exp2val;
    module.exports.luaK_fixline = luaK_fixline;
    module.exports.luaK_getlabel = luaK_getlabel;
    module.exports.luaK_goiffalse = luaK_goiffalse;
    module.exports.luaK_goiftrue = luaK_goiftrue;
    module.exports.luaK_indexed = luaK_indexed;
    module.exports.luaK_infix = luaK_infix;
    module.exports.luaK_intK = luaK_intK;
    module.exports.luaK_jump = luaK_jump;
    module.exports.luaK_jumpto = luaK_jumpto;
    module.exports.luaK_nil = luaK_nil;
    module.exports.luaK_numberK = luaK_numberK;
    module.exports.luaK_patchclose = luaK_patchclose;
    module.exports.luaK_patchlist = luaK_patchlist;
    module.exports.luaK_patchtohere = luaK_patchtohere;
    module.exports.luaK_posfix = luaK_posfix;
    module.exports.luaK_prefix = luaK_prefix;
    module.exports.luaK_reserveregs = luaK_reserveregs;
    module.exports.luaK_ret = luaK_ret;
    module.exports.luaK_self = luaK_self;
    module.exports.luaK_setlist = luaK_setlist;
    module.exports.luaK_setmultret = luaK_setmultret;
    module.exports.luaK_setoneret = luaK_setoneret;
    module.exports.luaK_setreturns = luaK_setreturns;
    module.exports.luaK_storevar = luaK_storevar;
    module.exports.luaK_stringK = luaK_stringK;
  }
});

// vendor/fengari/src/lparser.js
var require_lparser = __commonJS({
  "vendor/fengari/src/lparser.js"(exports, module) {
    "use strict";
    var {
      LUA_MULTRET,
      to_luastring: to_luastring2
    } = require_defs();
    var {
      BinOpr: {
        OPR_ADD,
        OPR_AND,
        OPR_BAND,
        OPR_BOR,
        OPR_BXOR,
        OPR_CONCAT,
        OPR_DIV,
        OPR_EQ,
        OPR_GE,
        OPR_GT,
        OPR_IDIV,
        OPR_LE,
        OPR_LT,
        OPR_MOD,
        OPR_MUL,
        OPR_NE,
        OPR_NOBINOPR,
        OPR_OR,
        OPR_POW,
        OPR_SHL,
        OPR_SHR,
        OPR_SUB
      },
      UnOpr: {
        OPR_BNOT,
        OPR_LEN,
        OPR_MINUS,
        OPR_NOT,
        OPR_NOUNOPR
      },
      NO_JUMP,
      getinstruction,
      luaK_checkstack,
      luaK_codeABC,
      luaK_codeABx,
      luaK_codeAsBx,
      luaK_codek,
      luaK_concat,
      luaK_dischargevars,
      luaK_exp2RK,
      luaK_exp2anyreg,
      luaK_exp2anyregup,
      luaK_exp2nextreg,
      luaK_exp2val,
      luaK_fixline,
      luaK_getlabel,
      luaK_goiffalse,
      luaK_goiftrue,
      luaK_indexed,
      luaK_infix,
      luaK_intK,
      luaK_jump,
      luaK_jumpto,
      luaK_nil,
      luaK_patchclose,
      luaK_patchlist,
      luaK_patchtohere,
      luaK_posfix,
      luaK_prefix,
      luaK_reserveregs,
      luaK_ret,
      luaK_self,
      luaK_setlist,
      luaK_setmultret,
      luaK_setoneret,
      luaK_setreturns,
      luaK_storevar,
      luaK_stringK
    } = require_lcode();
    var ldo = require_ldo();
    var lfunc = require_lfunc();
    var llex = require_llex();
    var {
      LUAI_MAXCCALLS,
      MAX_INT,
      lua_assert
    } = require_llimits();
    var lobject = require_lobject();
    var {
      OpCodesI: {
        OP_CALL,
        OP_CLOSURE,
        OP_FORLOOP,
        OP_FORPREP,
        OP_GETUPVAL,
        OP_MOVE,
        OP_NEWTABLE,
        OP_SETTABLE,
        OP_TAILCALL,
        OP_TFORCALL,
        OP_TFORLOOP,
        OP_VARARG
      },
      LFIELDS_PER_FLUSH,
      SETARG_B,
      SETARG_C,
      SET_OPCODE
    } = require_lopcodes();
    var {
      luaS_eqlngstr,
      luaS_new,
      luaS_newliteral
    } = require_lstring();
    var ltable = require_ltable();
    var Proto = lfunc.Proto;
    var R = llex.RESERVED;
    var MAXVARS = 200;
    var hasmultret = function(k) {
      return k === expkind.VCALL || k === expkind.VVARARG;
    };
    var eqstr = function(a, b) {
      return luaS_eqlngstr(a, b);
    };
    var BlockCnt = class {
      constructor() {
        this.previous = null;
        this.firstlabel = NaN;
        this.firstgoto = NaN;
        this.nactvar = NaN;
        this.upval = NaN;
        this.isloop = NaN;
      }
    };
    var expkind = {
      VVOID: 0,
      /* when 'expdesc' describes the last expression a list,
         this kind means an empty list (so, no expression) */
      VNIL: 1,
      /* constant nil */
      VTRUE: 2,
      /* constant true */
      VFALSE: 3,
      /* constant false */
      VK: 4,
      /* constant in 'k'; info = index of constant in 'k' */
      VKFLT: 5,
      /* floating constant; nval = numerical float value */
      VKINT: 6,
      /* integer constant; nval = numerical integer value */
      VNONRELOC: 7,
      /* expression has its value in a fixed register;
         info = result register */
      VLOCAL: 8,
      /* local variable; info = local register */
      VUPVAL: 9,
      /* upvalue variable; info = index of upvalue in 'upvalues' */
      VINDEXED: 10,
      /* indexed variable;
         ind.vt = whether 't' is register or upvalue;
         ind.t = table register or upvalue;
         ind.idx = key's R/K index */
      VJMP: 11,
      /* expression is a test/comparison;
         info = pc of corresponding jump instruction */
      VRELOCABLE: 12,
      /* expression can put result in any register;
         info = instruction pc */
      VCALL: 13,
      /* expression is a function call; info = instruction pc */
      VVARARG: 14
      /* vararg expression; info = instruction pc */
    };
    var vkisvar = function(k) {
      return expkind.VLOCAL <= k && k <= expkind.VINDEXED;
    };
    var vkisinreg = function(k) {
      return k === expkind.VNONRELOC || k === expkind.VLOCAL;
    };
    var expdesc = class {
      constructor() {
        this.k = NaN;
        this.u = {
          ival: NaN,
          /* for VKINT */
          nval: NaN,
          /* for VKFLT */
          info: NaN,
          /* for generic use */
          ind: {
            /* for indexed variables (VINDEXED) */
            idx: NaN,
            /* index (R/K) */
            t: NaN,
            /* table (register or upvalue) */
            vt: NaN
            /* whether 't' is register (VLOCAL) or upvalue (VUPVAL) */
          }
        };
        this.t = NaN;
        this.f = NaN;
      }
      to(e) {
        this.k = e.k;
        this.u = e.u;
        this.t = e.t;
        this.f = e.f;
      }
    };
    var FuncState = class {
      constructor() {
        this.f = null;
        this.prev = null;
        this.ls = null;
        this.bl = null;
        this.pc = NaN;
        this.lasttarget = NaN;
        this.jpc = NaN;
        this.nk = NaN;
        this.np = NaN;
        this.firstlocal = NaN;
        this.nlocvars = NaN;
        this.nactvar = NaN;
        this.nups = NaN;
        this.freereg = NaN;
      }
    };
    var Vardesc = class {
      constructor() {
        this.idx = NaN;
      }
    };
    var Labeldesc = class {
      constructor() {
        this.name = null;
        this.pc = NaN;
        this.line = NaN;
        this.nactvar = NaN;
      }
    };
    var Labellist = class {
      constructor() {
        this.arr = [];
        this.n = NaN;
        this.size = NaN;
      }
    };
    var Dyndata = class {
      constructor() {
        this.actvar = {
          /* list of active local variables */
          arr: [],
          n: NaN,
          size: NaN
        };
        this.gt = new Labellist();
        this.label = new Labellist();
      }
    };
    var semerror = function(ls, msg) {
      ls.t.token = 0;
      llex.luaX_syntaxerror(ls, msg);
    };
    var error_expected = function(ls, token) {
      llex.luaX_syntaxerror(ls, lobject.luaO_pushfstring(ls.L, to_luastring2("%s expected", true), llex.luaX_token2str(ls, token)));
    };
    var errorlimit = function(fs, limit, what) {
      let L = fs.ls.L;
      let line = fs.f.linedefined;
      let where = line === 0 ? to_luastring2("main function", true) : lobject.luaO_pushfstring(L, to_luastring2("function at line %d", true), line);
      let msg = lobject.luaO_pushfstring(
        L,
        to_luastring2("too many %s (limit is %d) in %s", true),
        what,
        limit,
        where
      );
      llex.luaX_syntaxerror(fs.ls, msg);
    };
    var checklimit = function(fs, v, l, what) {
      if (v > l) errorlimit(fs, l, what);
    };
    var testnext = function(ls, c) {
      if (ls.t.token === c) {
        llex.luaX_next(ls);
        return true;
      }
      return false;
    };
    var check = function(ls, c) {
      if (ls.t.token !== c)
        error_expected(ls, c);
    };
    var checknext = function(ls, c) {
      check(ls, c);
      llex.luaX_next(ls);
    };
    var check_condition = function(ls, c, msg) {
      if (!c)
        llex.luaX_syntaxerror(ls, msg);
    };
    var check_match = function(ls, what, who, where) {
      if (!testnext(ls, what)) {
        if (where === ls.linenumber)
          error_expected(ls, what);
        else
          llex.luaX_syntaxerror(ls, lobject.luaO_pushfstring(
            ls.L,
            to_luastring2("%s expected (to close %s at line %d)"),
            llex.luaX_token2str(ls, what),
            llex.luaX_token2str(ls, who),
            where
          ));
      }
    };
    var str_checkname = function(ls) {
      check(ls, R.TK_NAME);
      let ts = ls.t.seminfo.ts;
      llex.luaX_next(ls);
      return ts;
    };
    var init_exp = function(e, k, i) {
      e.f = e.t = NO_JUMP;
      e.k = k;
      e.u.info = i;
    };
    var codestring = function(ls, e, s) {
      init_exp(e, expkind.VK, luaK_stringK(ls.fs, s));
    };
    var checkname = function(ls, e) {
      codestring(ls, e, str_checkname(ls));
    };
    var registerlocalvar = function(ls, varname) {
      let fs = ls.fs;
      let f = fs.f;
      f.locvars[fs.nlocvars] = new lobject.LocVar();
      f.locvars[fs.nlocvars].varname = varname;
      return fs.nlocvars++;
    };
    var new_localvar = function(ls, name) {
      let fs = ls.fs;
      let dyd = ls.dyd;
      let reg = registerlocalvar(ls, name);
      checklimit(fs, dyd.actvar.n + 1 - fs.firstlocal, MAXVARS, to_luastring2("local variables", true));
      dyd.actvar.arr[dyd.actvar.n] = new Vardesc();
      dyd.actvar.arr[dyd.actvar.n].idx = reg;
      dyd.actvar.n++;
    };
    var new_localvarliteral = function(ls, name) {
      new_localvar(ls, llex.luaX_newstring(ls, to_luastring2(name, true)));
    };
    var getlocvar = function(fs, i) {
      let idx = fs.ls.dyd.actvar.arr[fs.firstlocal + i].idx;
      lua_assert(idx < fs.nlocvars);
      return fs.f.locvars[idx];
    };
    var adjustlocalvars = function(ls, nvars) {
      let fs = ls.fs;
      fs.nactvar = fs.nactvar + nvars;
      for (; nvars; nvars--)
        getlocvar(fs, fs.nactvar - nvars).startpc = fs.pc;
    };
    var removevars = function(fs, tolevel) {
      fs.ls.dyd.actvar.n -= fs.nactvar - tolevel;
      while (fs.nactvar > tolevel)
        getlocvar(fs, --fs.nactvar).endpc = fs.pc;
    };
    var searchupvalue = function(fs, name) {
      let up = fs.f.upvalues;
      for (let i = 0; i < fs.nups; i++) {
        if (eqstr(up[i].name, name))
          return i;
      }
      return -1;
    };
    var newupvalue = function(fs, name, v) {
      let f = fs.f;
      checklimit(fs, fs.nups + 1, lfunc.MAXUPVAL, to_luastring2("upvalues", true));
      f.upvalues[fs.nups] = {
        instack: v.k === expkind.VLOCAL,
        idx: v.u.info,
        name
      };
      return fs.nups++;
    };
    var searchvar = function(fs, n) {
      for (let i = fs.nactvar - 1; i >= 0; i--) {
        if (eqstr(n, getlocvar(fs, i).varname))
          return i;
      }
      return -1;
    };
    var markupval = function(fs, level) {
      let bl = fs.bl;
      while (bl.nactvar > level)
        bl = bl.previous;
      bl.upval = 1;
    };
    var singlevaraux = function(fs, n, vr, base) {
      if (fs === null)
        init_exp(vr, expkind.VVOID, 0);
      else {
        let v = searchvar(fs, n);
        if (v >= 0) {
          init_exp(vr, expkind.VLOCAL, v);
          if (!base)
            markupval(fs, v);
        } else {
          let idx = searchupvalue(fs, n);
          if (idx < 0) {
            singlevaraux(fs.prev, n, vr, 0);
            if (vr.k === expkind.VVOID)
              return;
            idx = newupvalue(fs, n, vr);
          }
          init_exp(vr, expkind.VUPVAL, idx);
        }
      }
    };
    var singlevar = function(ls, vr) {
      let varname = str_checkname(ls);
      let fs = ls.fs;
      singlevaraux(fs, varname, vr, 1);
      if (vr.k === expkind.VVOID) {
        let key = new expdesc();
        singlevaraux(fs, ls.envn, vr, 1);
        lua_assert(vr.k !== expkind.VVOID);
        codestring(ls, key, varname);
        luaK_indexed(fs, vr, key);
      }
    };
    var adjust_assign = function(ls, nvars, nexps, e) {
      let fs = ls.fs;
      let extra = nvars - nexps;
      if (hasmultret(e.k)) {
        extra++;
        if (extra < 0) extra = 0;
        luaK_setreturns(fs, e, extra);
        if (extra > 1) luaK_reserveregs(fs, extra - 1);
      } else {
        if (e.k !== expkind.VVOID) luaK_exp2nextreg(fs, e);
        if (extra > 0) {
          let reg = fs.freereg;
          luaK_reserveregs(fs, extra);
          luaK_nil(fs, reg, extra);
        }
      }
      if (nexps > nvars)
        ls.fs.freereg -= nexps - nvars;
    };
    var enterlevel = function(ls) {
      let L = ls.L;
      ++L.nCcalls;
      checklimit(ls.fs, L.nCcalls, LUAI_MAXCCALLS, to_luastring2("JS levels", true));
    };
    var leavelevel = function(ls) {
      return ls.L.nCcalls--;
    };
    var closegoto = function(ls, g, label) {
      let fs = ls.fs;
      let gl = ls.dyd.gt;
      let gt = gl.arr[g];
      lua_assert(eqstr(gt.name, label.name));
      if (gt.nactvar < label.nactvar) {
        let vname = getlocvar(fs, gt.nactvar).varname;
        let msg = lobject.luaO_pushfstring(
          ls.L,
          to_luastring2("<goto %s> at line %d jumps into the scope of local '%s'"),
          gt.name.getstr(),
          gt.line,
          vname.getstr()
        );
        semerror(ls, msg);
      }
      luaK_patchlist(fs, gt.pc, label.pc);
      for (let i = g; i < gl.n - 1; i++)
        gl.arr[i] = gl.arr[i + 1];
      gl.n--;
    };
    var findlabel = function(ls, g) {
      let bl = ls.fs.bl;
      let dyd = ls.dyd;
      let gt = dyd.gt.arr[g];
      for (let i = bl.firstlabel; i < dyd.label.n; i++) {
        let lb = dyd.label.arr[i];
        if (eqstr(lb.name, gt.name)) {
          if (gt.nactvar > lb.nactvar && (bl.upval || dyd.label.n > bl.firstlabel))
            luaK_patchclose(ls.fs, gt.pc, lb.nactvar);
          closegoto(ls, g, lb);
          return true;
        }
      }
      return false;
    };
    var newlabelentry = function(ls, l, name, line, pc) {
      let n = l.n;
      l.arr[n] = new Labeldesc();
      l.arr[n].name = name;
      l.arr[n].line = line;
      l.arr[n].nactvar = ls.fs.nactvar;
      l.arr[n].pc = pc;
      l.n = n + 1;
      return n;
    };
    var findgotos = function(ls, lb) {
      let gl = ls.dyd.gt;
      let i = ls.fs.bl.firstgoto;
      while (i < gl.n) {
        if (eqstr(gl.arr[i].name, lb.name))
          closegoto(ls, i, lb);
        else
          i++;
      }
    };
    var movegotosout = function(fs, bl) {
      let i = bl.firstgoto;
      let gl = fs.ls.dyd.gt;
      while (i < gl.n) {
        let gt = gl.arr[i];
        if (gt.nactvar > bl.nactvar) {
          if (bl.upval)
            luaK_patchclose(fs, gt.pc, bl.nactvar);
          gt.nactvar = bl.nactvar;
        }
        if (!findlabel(fs.ls, i))
          i++;
      }
    };
    var enterblock = function(fs, bl, isloop) {
      bl.isloop = isloop;
      bl.nactvar = fs.nactvar;
      bl.firstlabel = fs.ls.dyd.label.n;
      bl.firstgoto = fs.ls.dyd.gt.n;
      bl.upval = 0;
      bl.previous = fs.bl;
      fs.bl = bl;
      lua_assert(fs.freereg === fs.nactvar);
    };
    var breaklabel = function(ls) {
      let n = luaS_newliteral(ls.L, "break");
      let l = newlabelentry(ls, ls.dyd.label, n, 0, ls.fs.pc);
      findgotos(ls, ls.dyd.label.arr[l]);
    };
    var undefgoto = function(ls, gt) {
      let msg = llex.isreserved(gt.name) ? "<%s> at line %d not inside a loop" : "no visible label '%s' for <goto> at line %d";
      msg = lobject.luaO_pushfstring(ls.L, to_luastring2(msg), gt.name.getstr(), gt.line);
      semerror(ls, msg);
    };
    var addprototype = function(ls) {
      let L = ls.L;
      let clp = new Proto(L);
      let fs = ls.fs;
      let f = fs.f;
      f.p[fs.np++] = clp;
      return clp;
    };
    var codeclosure = function(ls, v) {
      let fs = ls.fs.prev;
      init_exp(v, expkind.VRELOCABLE, luaK_codeABx(fs, OP_CLOSURE, 0, fs.np - 1));
      luaK_exp2nextreg(fs, v);
    };
    var open_func = function(ls, fs, bl) {
      fs.prev = ls.fs;
      fs.ls = ls;
      ls.fs = fs;
      fs.pc = 0;
      fs.lasttarget = 0;
      fs.jpc = NO_JUMP;
      fs.freereg = 0;
      fs.nk = 0;
      fs.np = 0;
      fs.nups = 0;
      fs.nlocvars = 0;
      fs.nactvar = 0;
      fs.firstlocal = ls.dyd.actvar.n;
      fs.bl = null;
      let f = fs.f;
      f.source = ls.source;
      f.maxstacksize = 2;
      enterblock(fs, bl, false);
    };
    var leaveblock = function(fs) {
      let bl = fs.bl;
      let ls = fs.ls;
      if (bl.previous && bl.upval) {
        let j = luaK_jump(fs);
        luaK_patchclose(fs, j, bl.nactvar);
        luaK_patchtohere(fs, j);
      }
      if (bl.isloop)
        breaklabel(ls);
      fs.bl = bl.previous;
      removevars(fs, bl.nactvar);
      lua_assert(bl.nactvar === fs.nactvar);
      fs.freereg = fs.nactvar;
      ls.dyd.label.n = bl.firstlabel;
      if (bl.previous)
        movegotosout(fs, bl);
      else if (bl.firstgoto < ls.dyd.gt.n)
        undefgoto(ls, ls.dyd.gt.arr[bl.firstgoto]);
    };
    var close_func = function(ls) {
      let fs = ls.fs;
      luaK_ret(fs, 0, 0);
      leaveblock(fs);
      lua_assert(fs.bl === null);
      ls.fs = fs.prev;
    };
    var block_follow = function(ls, withuntil) {
      switch (ls.t.token) {
        case R.TK_ELSE:
        case R.TK_ELSEIF:
        case R.TK_END:
        case R.TK_EOS:
          return true;
        case R.TK_UNTIL:
          return withuntil;
        default:
          return false;
      }
    };
    var statlist = function(ls) {
      while (!block_follow(ls, 1)) {
        if (ls.t.token === R.TK_RETURN) {
          statement(ls);
          return;
        }
        statement(ls);
      }
    };
    var fieldsel = function(ls, v) {
      let fs = ls.fs;
      let key = new expdesc();
      luaK_exp2anyregup(fs, v);
      llex.luaX_next(ls);
      checkname(ls, key);
      luaK_indexed(fs, v, key);
    };
    var yindex = function(ls, v) {
      llex.luaX_next(ls);
      expr(ls, v);
      luaK_exp2val(ls.fs, v);
      checknext(
        ls,
        93
        /* (']').charCodeAt(0) */
      );
    };
    var ConsControl = class {
      constructor() {
        this.v = new expdesc();
        this.t = new expdesc();
        this.nh = NaN;
        this.na = NaN;
        this.tostore = NaN;
      }
    };
    var recfield = function(ls, cc) {
      let fs = ls.fs;
      let reg = ls.fs.freereg;
      let key = new expdesc();
      let val = new expdesc();
      if (ls.t.token === R.TK_NAME) {
        checklimit(fs, cc.nh, MAX_INT, to_luastring2("items in a constructor", true));
        checkname(ls, key);
      } else
        yindex(ls, key);
      cc.nh++;
      checknext(
        ls,
        61
        /* ('=').charCodeAt(0) */
      );
      let rkkey = luaK_exp2RK(fs, key);
      expr(ls, val);
      luaK_codeABC(fs, OP_SETTABLE, cc.t.u.info, rkkey, luaK_exp2RK(fs, val));
      fs.freereg = reg;
    };
    var closelistfield = function(fs, cc) {
      if (cc.v.k === expkind.VVOID) return;
      luaK_exp2nextreg(fs, cc.v);
      cc.v.k = expkind.VVOID;
      if (cc.tostore === LFIELDS_PER_FLUSH) {
        luaK_setlist(fs, cc.t.u.info, cc.na, cc.tostore);
        cc.tostore = 0;
      }
    };
    var lastlistfield = function(fs, cc) {
      if (cc.tostore === 0) return;
      if (hasmultret(cc.v.k)) {
        luaK_setmultret(fs, cc.v);
        luaK_setlist(fs, cc.t.u.info, cc.na, LUA_MULTRET);
        cc.na--;
      } else {
        if (cc.v.k !== expkind.VVOID)
          luaK_exp2nextreg(fs, cc.v);
        luaK_setlist(fs, cc.t.u.info, cc.na, cc.tostore);
      }
    };
    var listfield = function(ls, cc) {
      expr(ls, cc.v);
      checklimit(ls.fs, cc.na, MAX_INT, to_luastring2("items in a constructor", true));
      cc.na++;
      cc.tostore++;
    };
    var field = function(ls, cc) {
      switch (ls.t.token) {
        case R.TK_NAME: {
          if (llex.luaX_lookahead(ls) !== 61)
            listfield(ls, cc);
          else
            recfield(ls, cc);
          break;
        }
        case 91: {
          recfield(ls, cc);
          break;
        }
        default: {
          listfield(ls, cc);
          break;
        }
      }
    };
    var constructor = function(ls, t) {
      let fs = ls.fs;
      let line = ls.linenumber;
      let pc = luaK_codeABC(fs, OP_NEWTABLE, 0, 0, 0);
      let cc = new ConsControl();
      cc.na = cc.nh = cc.tostore = 0;
      cc.t = t;
      init_exp(t, expkind.VRELOCABLE, pc);
      init_exp(cc.v, expkind.VVOID, 0);
      luaK_exp2nextreg(ls.fs, t);
      checknext(
        ls,
        123
        /* ('{').charCodeAt(0) */
      );
      do {
        lua_assert(cc.v.k === expkind.VVOID || cc.tostore > 0);
        if (ls.t.token === 125) break;
        closelistfield(fs, cc);
        field(ls, cc);
      } while (testnext(
        ls,
        44
        /* (',').charCodeAt(0) */
      ) || testnext(
        ls,
        59
        /* (';').charCodeAt(0) */
      ));
      check_match(ls, 125, 123, line);
      lastlistfield(fs, cc);
      SETARG_B(fs.f.code[pc], lobject.luaO_int2fb(cc.na));
      SETARG_C(fs.f.code[pc], lobject.luaO_int2fb(cc.nh));
    };
    var parlist = function(ls) {
      let fs = ls.fs;
      let f = fs.f;
      let nparams = 0;
      f.is_vararg = false;
      if (ls.t.token !== 41) {
        do {
          switch (ls.t.token) {
            case R.TK_NAME: {
              new_localvar(ls, str_checkname(ls));
              nparams++;
              break;
            }
            case R.TK_DOTS: {
              llex.luaX_next(ls);
              f.is_vararg = true;
              break;
            }
            default:
              llex.luaX_syntaxerror(ls, to_luastring2("<name> or '...' expected", true));
          }
        } while (!f.is_vararg && testnext(
          ls,
          44
          /* (',').charCodeAt(0) */
        ));
      }
      adjustlocalvars(ls, nparams);
      f.numparams = fs.nactvar;
      luaK_reserveregs(fs, fs.nactvar);
    };
    var body = function(ls, e, ismethod, line) {
      let new_fs = new FuncState();
      let bl = new BlockCnt();
      new_fs.f = addprototype(ls);
      new_fs.f.linedefined = line;
      open_func(ls, new_fs, bl);
      checknext(
        ls,
        40
        /* ('(').charCodeAt(0) */
      );
      if (ismethod) {
        new_localvarliteral(ls, "self");
        adjustlocalvars(ls, 1);
      }
      parlist(ls);
      checknext(
        ls,
        41
        /* (')').charCodeAt(0) */
      );
      statlist(ls);
      new_fs.f.lastlinedefined = ls.linenumber;
      check_match(ls, R.TK_END, R.TK_FUNCTION, line);
      codeclosure(ls, e);
      close_func(ls);
    };
    var explist = function(ls, v) {
      let n = 1;
      expr(ls, v);
      while (testnext(
        ls,
        44
        /* (',').charCodeAt(0) */
      )) {
        luaK_exp2nextreg(ls.fs, v);
        expr(ls, v);
        n++;
      }
      return n;
    };
    var funcargs = function(ls, f, line) {
      let fs = ls.fs;
      let args = new expdesc();
      switch (ls.t.token) {
        case 40: {
          llex.luaX_next(ls);
          if (ls.t.token === 41)
            args.k = expkind.VVOID;
          else {
            explist(ls, args);
            luaK_setmultret(fs, args);
          }
          check_match(ls, 41, 40, line);
          break;
        }
        case 123: {
          constructor(ls, args);
          break;
        }
        case R.TK_STRING: {
          codestring(ls, args, ls.t.seminfo.ts);
          llex.luaX_next(ls);
          break;
        }
        default: {
          llex.luaX_syntaxerror(ls, to_luastring2("function arguments expected", true));
        }
      }
      lua_assert(f.k === expkind.VNONRELOC);
      let nparams;
      let base = f.u.info;
      if (hasmultret(args.k))
        nparams = LUA_MULTRET;
      else {
        if (args.k !== expkind.VVOID)
          luaK_exp2nextreg(fs, args);
        nparams = fs.freereg - (base + 1);
      }
      init_exp(f, expkind.VCALL, luaK_codeABC(fs, OP_CALL, base, nparams + 1, 2));
      luaK_fixline(fs, line);
      fs.freereg = base + 1;
    };
    var primaryexp = function(ls, v) {
      switch (ls.t.token) {
        case 40: {
          let line = ls.linenumber;
          llex.luaX_next(ls);
          expr(ls, v);
          check_match(ls, 41, 40, line);
          luaK_dischargevars(ls.fs, v);
          return;
        }
        case R.TK_NAME: {
          singlevar(ls, v);
          return;
        }
        default: {
          llex.luaX_syntaxerror(ls, to_luastring2("unexpected symbol", true));
        }
      }
    };
    var suffixedexp = function(ls, v) {
      let fs = ls.fs;
      let line = ls.linenumber;
      primaryexp(ls, v);
      for (; ; ) {
        switch (ls.t.token) {
          case 46: {
            fieldsel(ls, v);
            break;
          }
          case 91: {
            let key = new expdesc();
            luaK_exp2anyregup(fs, v);
            yindex(ls, key);
            luaK_indexed(fs, v, key);
            break;
          }
          case 58: {
            let key = new expdesc();
            llex.luaX_next(ls);
            checkname(ls, key);
            luaK_self(fs, v, key);
            funcargs(ls, v, line);
            break;
          }
          case 40:
          case R.TK_STRING:
          case 123: {
            luaK_exp2nextreg(fs, v);
            funcargs(ls, v, line);
            break;
          }
          default:
            return;
        }
      }
    };
    var simpleexp = function(ls, v) {
      switch (ls.t.token) {
        case R.TK_FLT: {
          init_exp(v, expkind.VKFLT, 0);
          v.u.nval = ls.t.seminfo.r;
          break;
        }
        case R.TK_INT: {
          init_exp(v, expkind.VKINT, 0);
          v.u.ival = ls.t.seminfo.i;
          break;
        }
        case R.TK_STRING: {
          codestring(ls, v, ls.t.seminfo.ts);
          break;
        }
        case R.TK_NIL: {
          init_exp(v, expkind.VNIL, 0);
          break;
        }
        case R.TK_TRUE: {
          init_exp(v, expkind.VTRUE, 0);
          break;
        }
        case R.TK_FALSE: {
          init_exp(v, expkind.VFALSE, 0);
          break;
        }
        case R.TK_DOTS: {
          let fs = ls.fs;
          check_condition(ls, fs.f.is_vararg, to_luastring2("cannot use '...' outside a vararg function", true));
          init_exp(v, expkind.VVARARG, luaK_codeABC(fs, OP_VARARG, 0, 1, 0));
          break;
        }
        case 123: {
          constructor(ls, v);
          return;
        }
        case R.TK_FUNCTION: {
          llex.luaX_next(ls);
          body(ls, v, 0, ls.linenumber);
          return;
        }
        default: {
          suffixedexp(ls, v);
          return;
        }
      }
      llex.luaX_next(ls);
    };
    var getunopr = function(op) {
      switch (op) {
        case R.TK_NOT:
          return OPR_NOT;
        case 45:
          return OPR_MINUS;
        case 126:
          return OPR_BNOT;
        case 35:
          return OPR_LEN;
        default:
          return OPR_NOUNOPR;
      }
    };
    var getbinopr = function(op) {
      switch (op) {
        case 43:
          return OPR_ADD;
        case 45:
          return OPR_SUB;
        case 42:
          return OPR_MUL;
        case 37:
          return OPR_MOD;
        case 94:
          return OPR_POW;
        case 47:
          return OPR_DIV;
        case R.TK_IDIV:
          return OPR_IDIV;
        case 38:
          return OPR_BAND;
        case 124:
          return OPR_BOR;
        case 126:
          return OPR_BXOR;
        case R.TK_SHL:
          return OPR_SHL;
        case R.TK_SHR:
          return OPR_SHR;
        case R.TK_CONCAT:
          return OPR_CONCAT;
        case R.TK_NE:
          return OPR_NE;
        case R.TK_EQ:
          return OPR_EQ;
        case 60:
          return OPR_LT;
        case R.TK_LE:
          return OPR_LE;
        case 62:
          return OPR_GT;
        case R.TK_GE:
          return OPR_GE;
        case R.TK_AND:
          return OPR_AND;
        case R.TK_OR:
          return OPR_OR;
        default:
          return OPR_NOBINOPR;
      }
    };
    var priority = [
      /* ORDER OPR */
      { left: 10, right: 10 },
      { left: 10, right: 10 },
      /* '+' '-' */
      { left: 11, right: 11 },
      { left: 11, right: 11 },
      /* '*' '%' */
      { left: 14, right: 13 },
      /* '^' (right associative) */
      { left: 11, right: 11 },
      { left: 11, right: 11 },
      /* '/' '//' */
      { left: 6, right: 6 },
      { left: 4, right: 4 },
      { left: 5, right: 5 },
      /* '&' '|' '~' */
      { left: 7, right: 7 },
      { left: 7, right: 7 },
      /* '<<' '>>' */
      { left: 9, right: 8 },
      /* '..' (right associative) */
      { left: 3, right: 3 },
      { left: 3, right: 3 },
      { left: 3, right: 3 },
      /* ==, <, <= */
      { left: 3, right: 3 },
      { left: 3, right: 3 },
      { left: 3, right: 3 },
      /* ~=, >, >= */
      { left: 2, right: 2 },
      { left: 1, right: 1 }
      /* and, or */
    ];
    var UNARY_PRIORITY = 12;
    var subexpr = function(ls, v, limit) {
      enterlevel(ls);
      let uop = getunopr(ls.t.token);
      if (uop !== OPR_NOUNOPR) {
        let line = ls.linenumber;
        llex.luaX_next(ls);
        subexpr(ls, v, UNARY_PRIORITY);
        luaK_prefix(ls.fs, uop, v, line);
      } else
        simpleexp(ls, v);
      let op = getbinopr(ls.t.token);
      while (op !== OPR_NOBINOPR && priority[op].left > limit) {
        let v2 = new expdesc();
        let line = ls.linenumber;
        llex.luaX_next(ls);
        luaK_infix(ls.fs, op, v);
        let nextop = subexpr(ls, v2, priority[op].right);
        luaK_posfix(ls.fs, op, v, v2, line);
        op = nextop;
      }
      leavelevel(ls);
      return op;
    };
    var expr = function(ls, v) {
      subexpr(ls, v, 0);
    };
    var block = function(ls) {
      let fs = ls.fs;
      let bl = new BlockCnt();
      enterblock(fs, bl, 0);
      statlist(ls);
      leaveblock(fs);
    };
    var LHS_assign = class {
      constructor() {
        this.prev = null;
        this.v = new expdesc();
      }
    };
    var check_conflict = function(ls, lh, v) {
      let fs = ls.fs;
      let extra = fs.freereg;
      let conflict = false;
      for (; lh; lh = lh.prev) {
        if (lh.v.k === expkind.VINDEXED) {
          if (lh.v.u.ind.vt === v.k && lh.v.u.ind.t === v.u.info) {
            conflict = true;
            lh.v.u.ind.vt = expkind.VLOCAL;
            lh.v.u.ind.t = extra;
          }
          if (v.k === expkind.VLOCAL && lh.v.u.ind.idx === v.u.info) {
            conflict = true;
            lh.v.u.ind.idx = extra;
          }
        }
      }
      if (conflict) {
        let op = v.k === expkind.VLOCAL ? OP_MOVE : OP_GETUPVAL;
        luaK_codeABC(fs, op, extra, v.u.info, 0);
        luaK_reserveregs(fs, 1);
      }
    };
    var assignment = function(ls, lh, nvars) {
      let e = new expdesc();
      check_condition(ls, vkisvar(lh.v.k), to_luastring2("syntax error", true));
      if (testnext(
        ls,
        44
        /* (',').charCodeAt(0) */
      )) {
        let nv = new LHS_assign();
        nv.prev = lh;
        suffixedexp(ls, nv.v);
        if (nv.v.k !== expkind.VINDEXED)
          check_conflict(ls, lh, nv.v);
        checklimit(ls.fs, nvars + ls.L.nCcalls, LUAI_MAXCCALLS, to_luastring2("JS levels", true));
        assignment(ls, nv, nvars + 1);
      } else {
        checknext(
          ls,
          61
          /* ('=').charCodeAt(0) */
        );
        let nexps = explist(ls, e);
        if (nexps !== nvars)
          adjust_assign(ls, nvars, nexps, e);
        else {
          luaK_setoneret(ls.fs, e);
          luaK_storevar(ls.fs, lh.v, e);
          return;
        }
      }
      init_exp(e, expkind.VNONRELOC, ls.fs.freereg - 1);
      luaK_storevar(ls.fs, lh.v, e);
    };
    var cond = function(ls) {
      let v = new expdesc();
      expr(ls, v);
      if (v.k === expkind.VNIL) v.k = expkind.VFALSE;
      luaK_goiftrue(ls.fs, v);
      return v.f;
    };
    var gotostat = function(ls, pc) {
      let line = ls.linenumber;
      let label;
      if (testnext(ls, R.TK_GOTO))
        label = str_checkname(ls);
      else {
        llex.luaX_next(ls);
        label = luaS_newliteral(ls.L, "break");
      }
      let g = newlabelentry(ls, ls.dyd.gt, label, line, pc);
      findlabel(ls, g);
    };
    var checkrepeated = function(fs, ll, label) {
      for (let i = fs.bl.firstlabel; i < ll.n; i++) {
        if (eqstr(label, ll.arr[i].name)) {
          let msg = lobject.luaO_pushfstring(
            fs.ls.L,
            to_luastring2("label '%s' already defined on line %d", true),
            label.getstr(),
            ll.arr[i].line
          );
          semerror(fs.ls, msg);
        }
      }
    };
    var skipnoopstat = function(ls) {
      while (ls.t.token === 59 || ls.t.token === R.TK_DBCOLON)
        statement(ls);
    };
    var labelstat = function(ls, label, line) {
      let fs = ls.fs;
      let ll = ls.dyd.label;
      let l;
      checkrepeated(fs, ll, label);
      checknext(ls, R.TK_DBCOLON);
      l = newlabelentry(ls, ll, label, line, luaK_getlabel(fs));
      skipnoopstat(ls);
      if (block_follow(ls, 0)) {
        ll.arr[l].nactvar = fs.bl.nactvar;
      }
      findgotos(ls, ll.arr[l]);
    };
    var whilestat = function(ls, line) {
      let fs = ls.fs;
      let bl = new BlockCnt();
      llex.luaX_next(ls);
      let whileinit = luaK_getlabel(fs);
      let condexit = cond(ls);
      enterblock(fs, bl, 1);
      checknext(ls, R.TK_DO);
      block(ls);
      luaK_jumpto(fs, whileinit);
      check_match(ls, R.TK_END, R.TK_WHILE, line);
      leaveblock(fs);
      luaK_patchtohere(fs, condexit);
    };
    var repeatstat = function(ls, line) {
      let fs = ls.fs;
      let repeat_init = luaK_getlabel(fs);
      let bl1 = new BlockCnt();
      let bl2 = new BlockCnt();
      enterblock(fs, bl1, 1);
      enterblock(fs, bl2, 0);
      llex.luaX_next(ls);
      statlist(ls);
      check_match(ls, R.TK_UNTIL, R.TK_REPEAT, line);
      let condexit = cond(ls);
      if (bl2.upval)
        luaK_patchclose(fs, condexit, bl2.nactvar);
      leaveblock(fs);
      luaK_patchlist(fs, condexit, repeat_init);
      leaveblock(fs);
    };
    var exp1 = function(ls) {
      let e = new expdesc();
      expr(ls, e);
      luaK_exp2nextreg(ls.fs, e);
      lua_assert(e.k === expkind.VNONRELOC);
      let reg = e.u.info;
      return reg;
    };
    var forbody = function(ls, base, line, nvars, isnum) {
      let bl = new BlockCnt();
      let fs = ls.fs;
      let endfor;
      adjustlocalvars(ls, 3);
      checknext(ls, R.TK_DO);
      let prep = isnum ? luaK_codeAsBx(fs, OP_FORPREP, base, NO_JUMP) : luaK_jump(fs);
      enterblock(fs, bl, 0);
      adjustlocalvars(ls, nvars);
      luaK_reserveregs(fs, nvars);
      block(ls);
      leaveblock(fs);
      luaK_patchtohere(fs, prep);
      if (isnum)
        endfor = luaK_codeAsBx(fs, OP_FORLOOP, base, NO_JUMP);
      else {
        luaK_codeABC(fs, OP_TFORCALL, base, 0, nvars);
        luaK_fixline(fs, line);
        endfor = luaK_codeAsBx(fs, OP_TFORLOOP, base + 2, NO_JUMP);
      }
      luaK_patchlist(fs, endfor, prep + 1);
      luaK_fixline(fs, line);
    };
    var fornum = function(ls, varname, line) {
      let fs = ls.fs;
      let base = fs.freereg;
      new_localvarliteral(ls, "(for index)");
      new_localvarliteral(ls, "(for limit)");
      new_localvarliteral(ls, "(for step)");
      new_localvar(ls, varname);
      checknext(
        ls,
        61
        /* ('=').charCodeAt(0) */
      );
      exp1(ls);
      checknext(
        ls,
        44
        /* (',').charCodeAt(0) */
      );
      exp1(ls);
      if (testnext(
        ls,
        44
        /* (',').charCodeAt(0) */
      ))
        exp1(ls);
      else {
        luaK_codek(fs, fs.freereg, luaK_intK(fs, 1));
        luaK_reserveregs(fs, 1);
      }
      forbody(ls, base, line, 1, 1);
    };
    var forlist = function(ls, indexname) {
      let fs = ls.fs;
      let e = new expdesc();
      let nvars = 4;
      let base = fs.freereg;
      new_localvarliteral(ls, "(for generator)");
      new_localvarliteral(ls, "(for state)");
      new_localvarliteral(ls, "(for control)");
      new_localvar(ls, indexname);
      while (testnext(
        ls,
        44
        /* (',').charCodeAt(0) */
      )) {
        new_localvar(ls, str_checkname(ls));
        nvars++;
      }
      checknext(ls, R.TK_IN);
      let line = ls.linenumber;
      adjust_assign(ls, 3, explist(ls, e), e);
      luaK_checkstack(fs, 3);
      forbody(ls, base, line, nvars - 3, 0);
    };
    var forstat = function(ls, line) {
      let fs = ls.fs;
      let bl = new BlockCnt();
      enterblock(fs, bl, 1);
      llex.luaX_next(ls);
      let varname = str_checkname(ls);
      switch (ls.t.token) {
        case 61:
          fornum(ls, varname, line);
          break;
        case 44:
        case R.TK_IN:
          forlist(ls, varname);
          break;
        default:
          llex.luaX_syntaxerror(ls, to_luastring2("'=' or 'in' expected", true));
      }
      check_match(ls, R.TK_END, R.TK_FOR, line);
      leaveblock(fs);
    };
    var test_then_block = function(ls, escapelist) {
      let bl = new BlockCnt();
      let fs = ls.fs;
      let v = new expdesc();
      let jf;
      llex.luaX_next(ls);
      expr(ls, v);
      checknext(ls, R.TK_THEN);
      if (ls.t.token === R.TK_GOTO || ls.t.token === R.TK_BREAK) {
        luaK_goiffalse(ls.fs, v);
        enterblock(fs, bl, false);
        gotostat(ls, v.t);
        while (testnext(
          ls,
          59
          /* (';').charCodeAt(0) */
        )) ;
        if (block_follow(ls, 0)) {
          leaveblock(fs);
          return escapelist;
        } else
          jf = luaK_jump(fs);
      } else {
        luaK_goiftrue(ls.fs, v);
        enterblock(fs, bl, false);
        jf = v.f;
      }
      statlist(ls);
      leaveblock(fs);
      if (ls.t.token === R.TK_ELSE || ls.t.token === R.TK_ELSEIF)
        escapelist = luaK_concat(fs, escapelist, luaK_jump(fs));
      luaK_patchtohere(fs, jf);
      return escapelist;
    };
    var ifstat = function(ls, line) {
      let fs = ls.fs;
      let escapelist = NO_JUMP;
      escapelist = test_then_block(ls, escapelist);
      while (ls.t.token === R.TK_ELSEIF)
        escapelist = test_then_block(ls, escapelist);
      if (testnext(ls, R.TK_ELSE))
        block(ls);
      check_match(ls, R.TK_END, R.TK_IF, line);
      luaK_patchtohere(fs, escapelist);
    };
    var localfunc = function(ls) {
      let b = new expdesc();
      let fs = ls.fs;
      new_localvar(ls, str_checkname(ls));
      adjustlocalvars(ls, 1);
      body(ls, b, 0, ls.linenumber);
      getlocvar(fs, b.u.info).startpc = fs.pc;
    };
    var localstat = function(ls) {
      let nvars = 0;
      let nexps;
      let e = new expdesc();
      do {
        new_localvar(ls, str_checkname(ls));
        nvars++;
      } while (testnext(
        ls,
        44
        /* (',').charCodeAt(0) */
      ));
      if (testnext(
        ls,
        61
        /* ('=').charCodeAt(0) */
      ))
        nexps = explist(ls, e);
      else {
        e.k = expkind.VVOID;
        nexps = 0;
      }
      adjust_assign(ls, nvars, nexps, e);
      adjustlocalvars(ls, nvars);
    };
    var funcname = function(ls, v) {
      let ismethod = 0;
      singlevar(ls, v);
      while (ls.t.token === 46)
        fieldsel(ls, v);
      if (ls.t.token === 58) {
        ismethod = 1;
        fieldsel(ls, v);
      }
      return ismethod;
    };
    var funcstat = function(ls, line) {
      let v = new expdesc();
      let b = new expdesc();
      llex.luaX_next(ls);
      let ismethod = funcname(ls, v);
      body(ls, b, ismethod, line);
      luaK_storevar(ls.fs, v, b);
      luaK_fixline(ls.fs, line);
    };
    var exprstat = function(ls) {
      let fs = ls.fs;
      let v = new LHS_assign();
      suffixedexp(ls, v.v);
      if (ls.t.token === 61 || ls.t.token === 44) {
        v.prev = null;
        assignment(ls, v, 1);
      } else {
        check_condition(ls, v.v.k === expkind.VCALL, to_luastring2("syntax error", true));
        SETARG_C(getinstruction(fs, v.v), 1);
      }
    };
    var retstat = function(ls) {
      let fs = ls.fs;
      let e = new expdesc();
      let first, nret;
      if (block_follow(ls, 1) || ls.t.token === 59)
        first = nret = 0;
      else {
        nret = explist(ls, e);
        if (hasmultret(e.k)) {
          luaK_setmultret(fs, e);
          if (e.k === expkind.VCALL && nret === 1) {
            SET_OPCODE(getinstruction(fs, e), OP_TAILCALL);
            lua_assert(getinstruction(fs, e).A === fs.nactvar);
          }
          first = fs.nactvar;
          nret = LUA_MULTRET;
        } else {
          if (nret === 1)
            first = luaK_exp2anyreg(fs, e);
          else {
            luaK_exp2nextreg(fs, e);
            first = fs.nactvar;
            lua_assert(nret === fs.freereg - first);
          }
        }
      }
      luaK_ret(fs, first, nret);
      testnext(
        ls,
        59
        /* (';').charCodeAt(0) */
      );
    };
    var statement = function(ls) {
      let line = ls.linenumber;
      enterlevel(ls);
      switch (ls.t.token) {
        case 59: {
          llex.luaX_next(ls);
          break;
        }
        case R.TK_IF: {
          ifstat(ls, line);
          break;
        }
        case R.TK_WHILE: {
          whilestat(ls, line);
          break;
        }
        case R.TK_DO: {
          llex.luaX_next(ls);
          block(ls);
          check_match(ls, R.TK_END, R.TK_DO, line);
          break;
        }
        case R.TK_FOR: {
          forstat(ls, line);
          break;
        }
        case R.TK_REPEAT: {
          repeatstat(ls, line);
          break;
        }
        case R.TK_FUNCTION: {
          funcstat(ls, line);
          break;
        }
        case R.TK_LOCAL: {
          llex.luaX_next(ls);
          if (testnext(ls, R.TK_FUNCTION))
            localfunc(ls);
          else
            localstat(ls);
          break;
        }
        case R.TK_DBCOLON: {
          llex.luaX_next(ls);
          labelstat(ls, str_checkname(ls), line);
          break;
        }
        case R.TK_RETURN: {
          llex.luaX_next(ls);
          retstat(ls);
          break;
        }
        case R.TK_BREAK:
        /* stat -> breakstat */
        case R.TK_GOTO: {
          gotostat(ls, luaK_jump(ls.fs));
          break;
        }
        default: {
          exprstat(ls);
          break;
        }
      }
      lua_assert(ls.fs.f.maxstacksize >= ls.fs.freereg && ls.fs.freereg >= ls.fs.nactvar);
      ls.fs.freereg = ls.fs.nactvar;
      leavelevel(ls);
    };
    var mainfunc = function(ls, fs) {
      let bl = new BlockCnt();
      let v = new expdesc();
      open_func(ls, fs, bl);
      fs.f.is_vararg = true;
      init_exp(v, expkind.VLOCAL, 0);
      newupvalue(fs, ls.envn, v);
      llex.luaX_next(ls);
      statlist(ls);
      check(ls, R.TK_EOS);
      close_func(ls);
    };
    var luaY_parser = function(L, z, buff, dyd, name, firstchar) {
      let lexstate = new llex.LexState();
      let funcstate = new FuncState();
      let cl = lfunc.luaF_newLclosure(L, 1);
      ldo.luaD_inctop(L);
      L.stack[L.top - 1].setclLvalue(cl);
      lexstate.h = ltable.luaH_new(L);
      ldo.luaD_inctop(L);
      L.stack[L.top - 1].sethvalue(lexstate.h);
      funcstate.f = cl.p = new Proto(L);
      funcstate.f.source = luaS_new(L, name);
      lexstate.buff = buff;
      lexstate.dyd = dyd;
      dyd.actvar.n = dyd.gt.n = dyd.label.n = 0;
      llex.luaX_setinput(L, lexstate, z, funcstate.f.source, firstchar);
      mainfunc(lexstate, funcstate);
      lua_assert(!funcstate.prev && funcstate.nups === 1 && !lexstate.fs);
      lua_assert(dyd.actvar.n === 0 && dyd.gt.n === 0 && dyd.label.n === 0);
      delete L.stack[--L.top];
      return cl;
    };
    module.exports.Dyndata = Dyndata;
    module.exports.expkind = expkind;
    module.exports.expdesc = expdesc;
    module.exports.luaY_parser = luaY_parser;
    module.exports.vkisinreg = vkisinreg;
  }
});

// vendor/fengari/src/lundump.js
var require_lundump = __commonJS({
  "vendor/fengari/src/lundump.js"(exports, module) {
    "use strict";
    var {
      LUA_SIGNATURE,
      constant_types: {
        LUA_TBOOLEAN,
        LUA_TLNGSTR,
        LUA_TNIL,
        LUA_TNUMFLT,
        LUA_TNUMINT,
        LUA_TSHRSTR
      },
      thread_status: { LUA_ERRSYNTAX },
      is_luastring,
      luastring_eq,
      to_luastring: to_luastring2
    } = require_defs();
    var ldo = require_ldo();
    var lfunc = require_lfunc();
    var lobject = require_lobject();
    var {
      MAXARG_sBx,
      POS_A,
      POS_Ax,
      POS_B,
      POS_Bx,
      POS_C,
      POS_OP,
      SIZE_A,
      SIZE_Ax,
      SIZE_B,
      SIZE_Bx,
      SIZE_C,
      SIZE_OP
    } = require_lopcodes();
    var { lua_assert } = require_llimits();
    var { luaS_bless } = require_lstring();
    var {
      luaZ_read,
      ZIO
    } = require_lzio();
    var LUAC_DATA = [25, 147, 13, 10, 26, 10];
    var BytecodeParser = class _BytecodeParser {
      constructor(L, Z, name) {
        this.intSize = 4;
        this.size_tSize = 4;
        this.instructionSize = 4;
        this.integerSize = 4;
        this.numberSize = 8;
        lua_assert(Z instanceof ZIO, "BytecodeParser only operates on a ZIO");
        lua_assert(is_luastring(name));
        if (name[0] === 64 || name[0] === 61)
          this.name = name.subarray(1);
        else if (name[0] == LUA_SIGNATURE[0])
          this.name = to_luastring2("binary string", true);
        else
          this.name = name;
        this.L = L;
        this.Z = Z;
        this.arraybuffer = new ArrayBuffer(
          Math.max(this.intSize, this.size_tSize, this.instructionSize, this.integerSize, this.numberSize)
        );
        this.dv = new DataView(this.arraybuffer);
        this.u8 = new Uint8Array(this.arraybuffer);
      }
      read(size) {
        let u8 = new Uint8Array(size);
        if (luaZ_read(this.Z, u8, 0, size) !== 0)
          this.error("truncated");
        return u8;
      }
      LoadByte() {
        if (luaZ_read(this.Z, this.u8, 0, 1) !== 0)
          this.error("truncated");
        return this.u8[0];
      }
      LoadInt() {
        if (luaZ_read(this.Z, this.u8, 0, this.intSize) !== 0)
          this.error("truncated");
        return this.dv.getInt32(0, true);
      }
      LoadNumber() {
        if (luaZ_read(this.Z, this.u8, 0, this.numberSize) !== 0)
          this.error("truncated");
        return this.dv.getFloat64(0, true);
      }
      LoadInteger() {
        if (luaZ_read(this.Z, this.u8, 0, this.integerSize) !== 0)
          this.error("truncated");
        return this.dv.getInt32(0, true);
      }
      LoadSize_t() {
        return this.LoadInteger();
      }
      LoadString() {
        let size = this.LoadByte();
        if (size === 255)
          size = this.LoadSize_t();
        if (size === 0)
          return null;
        return luaS_bless(this.L, this.read(size - 1));
      }
      /* creates a mask with 'n' 1 bits at position 'p' */
      static MASK1(n, p) {
        return ~(~0 << n) << p;
      }
      LoadCode(f) {
        let n = this.LoadInt();
        let p = _BytecodeParser;
        for (let i = 0; i < n; i++) {
          if (luaZ_read(this.Z, this.u8, 0, this.instructionSize) !== 0)
            this.error("truncated");
          let ins = this.dv.getUint32(0, true);
          f.code[i] = {
            code: ins,
            opcode: ins >> POS_OP & p.MASK1(SIZE_OP, 0),
            A: ins >> POS_A & p.MASK1(SIZE_A, 0),
            B: ins >> POS_B & p.MASK1(SIZE_B, 0),
            C: ins >> POS_C & p.MASK1(SIZE_C, 0),
            Bx: ins >> POS_Bx & p.MASK1(SIZE_Bx, 0),
            Ax: ins >> POS_Ax & p.MASK1(SIZE_Ax, 0),
            sBx: (ins >> POS_Bx & p.MASK1(SIZE_Bx, 0)) - MAXARG_sBx
          };
        }
      }
      LoadConstants(f) {
        let n = this.LoadInt();
        for (let i = 0; i < n; i++) {
          let t = this.LoadByte();
          switch (t) {
            case LUA_TNIL:
              f.k.push(new lobject.TValue(LUA_TNIL, null));
              break;
            case LUA_TBOOLEAN:
              f.k.push(new lobject.TValue(LUA_TBOOLEAN, this.LoadByte() !== 0));
              break;
            case LUA_TNUMFLT:
              f.k.push(new lobject.TValue(LUA_TNUMFLT, this.LoadNumber()));
              break;
            case LUA_TNUMINT:
              f.k.push(new lobject.TValue(LUA_TNUMINT, this.LoadInteger()));
              break;
            case LUA_TSHRSTR:
            case LUA_TLNGSTR:
              f.k.push(new lobject.TValue(LUA_TLNGSTR, this.LoadString()));
              break;
            default:
              this.error(`unrecognized constant '${t}'`);
          }
        }
      }
      LoadProtos(f) {
        let n = this.LoadInt();
        for (let i = 0; i < n; i++) {
          f.p[i] = new lfunc.Proto(this.L);
          this.LoadFunction(f.p[i], f.source);
        }
      }
      LoadUpvalues(f) {
        let n = this.LoadInt();
        for (let i = 0; i < n; i++) {
          f.upvalues[i] = {
            name: null,
            instack: this.LoadByte(),
            idx: this.LoadByte()
          };
        }
      }
      LoadDebug(f) {
        let n = this.LoadInt();
        for (let i = 0; i < n; i++)
          f.lineinfo[i] = this.LoadInt();
        n = this.LoadInt();
        for (let i = 0; i < n; i++) {
          f.locvars[i] = {
            varname: this.LoadString(),
            startpc: this.LoadInt(),
            endpc: this.LoadInt()
          };
        }
        n = this.LoadInt();
        for (let i = 0; i < n; i++) {
          f.upvalues[i].name = this.LoadString();
        }
      }
      LoadFunction(f, psource) {
        f.source = this.LoadString();
        if (f.source === null)
          f.source = psource;
        f.linedefined = this.LoadInt();
        f.lastlinedefined = this.LoadInt();
        f.numparams = this.LoadByte();
        f.is_vararg = this.LoadByte() !== 0;
        f.maxstacksize = this.LoadByte();
        this.LoadCode(f);
        this.LoadConstants(f);
        this.LoadUpvalues(f);
        this.LoadProtos(f);
        this.LoadDebug(f);
      }
      checkliteral(s, msg) {
        let buff = this.read(s.length);
        if (!luastring_eq(buff, s))
          this.error(msg);
      }
      checkHeader() {
        this.checkliteral(LUA_SIGNATURE.subarray(1), "not a");
        if (this.LoadByte() !== 83)
          this.error("version mismatch in");
        if (this.LoadByte() !== 0)
          this.error("format mismatch in");
        this.checkliteral(LUAC_DATA, "corrupted");
        this.intSize = this.LoadByte();
        this.size_tSize = this.LoadByte();
        this.instructionSize = this.LoadByte();
        this.integerSize = this.LoadByte();
        this.numberSize = this.LoadByte();
        this.checksize(this.intSize, 4, "int");
        this.checksize(this.size_tSize, 4, "size_t");
        this.checksize(this.instructionSize, 4, "instruction");
        this.checksize(this.integerSize, 4, "integer");
        this.checksize(this.numberSize, 8, "number");
        if (this.LoadInteger() !== 22136)
          this.error("endianness mismatch in");
        if (this.LoadNumber() !== 370.5)
          this.error("float format mismatch in");
      }
      error(why) {
        lobject.luaO_pushfstring(this.L, to_luastring2("%s: %s precompiled chunk"), this.name, to_luastring2(why));
        ldo.luaD_throw(this.L, LUA_ERRSYNTAX);
      }
      checksize(byte, size, tname) {
        if (byte !== size)
          this.error(`${tname} size mismatch in`);
      }
    };
    var luaU_undump = function(L, Z, name) {
      let S = new BytecodeParser(L, Z, name);
      S.checkHeader();
      let cl = lfunc.luaF_newLclosure(L, S.LoadByte());
      ldo.luaD_inctop(L);
      L.stack[L.top - 1].setclLvalue(cl);
      cl.p = new lfunc.Proto(L);
      S.LoadFunction(cl.p, null);
      lua_assert(cl.nupvalues === cl.p.upvalues.length);
      return cl;
    };
    module.exports.luaU_undump = luaU_undump;
  }
});

// vendor/fengari/src/ldo.js
var require_ldo = __commonJS({
  "vendor/fengari/src/ldo.js"(exports, module) {
    "use strict";
    var {
      LUA_HOOKCALL,
      LUA_HOOKRET,
      LUA_HOOKTAILCALL,
      LUA_MASKCALL,
      LUA_MASKLINE,
      LUA_MASKRET,
      LUA_MINSTACK,
      LUA_MULTRET,
      LUA_SIGNATURE,
      constant_types: {
        LUA_TCCL,
        LUA_TLCF,
        LUA_TLCL,
        LUA_TNIL
      },
      thread_status: {
        LUA_ERRMEM,
        LUA_ERRERR,
        LUA_ERRRUN,
        LUA_ERRSYNTAX,
        LUA_OK,
        LUA_YIELD
      },
      lua_Debug,
      luastring_indexOf,
      to_luastring: to_luastring2
    } = require_defs();
    var lapi = require_lapi();
    var ldebug = require_ldebug();
    var lfunc = require_lfunc();
    var {
      api_check,
      lua_assert,
      LUAI_MAXCCALLS
    } = require_llimits();
    var lobject = require_lobject();
    var lopcodes = require_lopcodes();
    var lparser = require_lparser();
    var lstate = require_lstate();
    var { luaS_newliteral } = require_lstring();
    var ltm = require_ltm();
    var { LUAI_MAXSTACK } = require_luaconf();
    var lundump = require_lundump();
    var lvm = require_lvm();
    var { MBuffer } = require_lzio();
    var adjust_top = function(L, newtop) {
      if (L.top < newtop) {
        while (L.top < newtop)
          L.stack[L.top++] = new lobject.TValue(LUA_TNIL, null);
      } else {
        while (L.top > newtop)
          delete L.stack[--L.top];
      }
    };
    var seterrorobj = function(L, errcode, oldtop) {
      let current_top = L.top;
      while (L.top < oldtop + 1)
        L.stack[L.top++] = new lobject.TValue(LUA_TNIL, null);
      switch (errcode) {
        case LUA_ERRMEM: {
          lobject.setsvalue2s(L, oldtop, luaS_newliteral(L, "not enough memory"));
          break;
        }
        case LUA_ERRERR: {
          lobject.setsvalue2s(L, oldtop, luaS_newliteral(L, "error in error handling"));
          break;
        }
        default: {
          lobject.setobjs2s(L, oldtop, current_top - 1);
        }
      }
      while (L.top > oldtop + 1)
        delete L.stack[--L.top];
    };
    var ERRORSTACKSIZE = LUAI_MAXSTACK + 200;
    var luaD_reallocstack = function(L, newsize) {
      lua_assert(newsize <= LUAI_MAXSTACK || newsize == ERRORSTACKSIZE);
      lua_assert(L.stack_last == L.stack.length - lstate.EXTRA_STACK);
      L.stack.length = newsize;
      L.stack_last = newsize - lstate.EXTRA_STACK;
    };
    var luaD_growstack = function(L, n) {
      let size = L.stack.length;
      if (size > LUAI_MAXSTACK)
        luaD_throw(L, LUA_ERRERR);
      else {
        let needed = L.top + n + lstate.EXTRA_STACK;
        let newsize = 2 * size;
        if (newsize > LUAI_MAXSTACK) newsize = LUAI_MAXSTACK;
        if (newsize < needed) newsize = needed;
        if (newsize > LUAI_MAXSTACK) {
          luaD_reallocstack(L, ERRORSTACKSIZE);
          ldebug.luaG_runerror(L, to_luastring2("stack overflow", true));
        } else
          luaD_reallocstack(L, newsize);
      }
    };
    var luaD_checkstack = function(L, n) {
      if (L.stack_last - L.top <= n)
        luaD_growstack(L, n);
    };
    var stackinuse = function(L) {
      let lim = L.top;
      for (let ci = L.ci; ci !== null; ci = ci.previous) {
        if (lim < ci.top) lim = ci.top;
      }
      lua_assert(lim <= L.stack_last);
      return lim + 1;
    };
    var luaD_shrinkstack = function(L) {
      let inuse = stackinuse(L);
      let goodsize = inuse + Math.floor(inuse / 8) + 2 * lstate.EXTRA_STACK;
      if (goodsize > LUAI_MAXSTACK)
        goodsize = LUAI_MAXSTACK;
      if (L.stack.length > LUAI_MAXSTACK)
        lstate.luaE_freeCI(L);
      if (inuse <= LUAI_MAXSTACK - lstate.EXTRA_STACK && goodsize < L.stack.length)
        luaD_reallocstack(L, goodsize);
    };
    var luaD_inctop = function(L) {
      luaD_checkstack(L, 1);
      L.stack[L.top++] = new lobject.TValue(LUA_TNIL, null);
    };
    var luaD_precall = function(L, off, nresults) {
      let func = L.stack[off];
      switch (func.type) {
        case LUA_TCCL:
        case LUA_TLCF: {
          let f = func.type === LUA_TCCL ? func.value.f : func.value;
          luaD_checkstack(L, LUA_MINSTACK);
          let ci = lstate.luaE_extendCI(L);
          ci.funcOff = off;
          ci.nresults = nresults;
          ci.func = func;
          ci.top = L.top + LUA_MINSTACK;
          lua_assert(ci.top <= L.stack_last);
          ci.callstatus = 0;
          if (L.hookmask & LUA_MASKCALL)
            luaD_hook(L, LUA_HOOKCALL, -1);
          let n = f(L);
          if (typeof n !== "number" || n < 0 || (n | 0) !== n)
            throw Error("invalid return value from JS function (expected integer)");
          lapi.api_checknelems(L, n);
          luaD_poscall(L, ci, L.top - n, n);
          return true;
        }
        case LUA_TLCL: {
          let base;
          let p = func.value.p;
          let n = L.top - off - 1;
          let fsize = p.maxstacksize;
          luaD_checkstack(L, fsize);
          if (p.is_vararg) {
            base = adjust_varargs(L, p, n);
          } else {
            for (; n < p.numparams; n++)
              L.stack[L.top++] = new lobject.TValue(LUA_TNIL, null);
            base = off + 1;
          }
          let ci = lstate.luaE_extendCI(L);
          ci.funcOff = off;
          ci.nresults = nresults;
          ci.func = func;
          ci.l_base = base;
          ci.top = base + fsize;
          adjust_top(L, ci.top);
          ci.l_code = p.code;
          ci.l_savedpc = 0;
          ci.callstatus = lstate.CIST_LUA;
          if (L.hookmask & LUA_MASKCALL)
            callhook(L, ci);
          return false;
        }
        default:
          luaD_checkstack(L, 1);
          tryfuncTM(L, off, func);
          return luaD_precall(L, off, nresults);
      }
    };
    var luaD_poscall = function(L, ci, firstResult, nres) {
      let wanted = ci.nresults;
      if (L.hookmask & (LUA_MASKRET | LUA_MASKLINE)) {
        if (L.hookmask & LUA_MASKRET)
          luaD_hook(L, LUA_HOOKRET, -1);
        L.oldpc = ci.previous.l_savedpc;
      }
      let res = ci.funcOff;
      L.ci = ci.previous;
      L.ci.next = null;
      return moveresults(L, firstResult, res, nres, wanted);
    };
    var moveresults = function(L, firstResult, res, nres, wanted) {
      switch (wanted) {
        case 0:
          break;
        case 1: {
          if (nres === 0)
            L.stack[res].setnilvalue();
          else {
            lobject.setobjs2s(L, res, firstResult);
          }
          break;
        }
        case LUA_MULTRET: {
          for (let i = 0; i < nres; i++)
            lobject.setobjs2s(L, res + i, firstResult + i);
          for (let i = L.top; i >= res + nres; i--)
            delete L.stack[i];
          L.top = res + nres;
          return false;
        }
        default: {
          let i;
          if (wanted <= nres) {
            for (i = 0; i < wanted; i++)
              lobject.setobjs2s(L, res + i, firstResult + i);
          } else {
            for (i = 0; i < nres; i++)
              lobject.setobjs2s(L, res + i, firstResult + i);
            for (; i < wanted; i++) {
              if (res + i >= L.top)
                L.stack[res + i] = new lobject.TValue(LUA_TNIL, null);
              else
                L.stack[res + i].setnilvalue();
            }
          }
          break;
        }
      }
      let newtop = res + wanted;
      for (let i = L.top; i >= newtop; i--)
        delete L.stack[i];
      L.top = newtop;
      return true;
    };
    var luaD_hook = function(L, event, line) {
      let hook = L.hook;
      if (hook && L.allowhook) {
        let ci = L.ci;
        let top = L.top;
        let ci_top = ci.top;
        let ar = new lua_Debug();
        ar.event = event;
        ar.currentline = line;
        ar.i_ci = ci;
        luaD_checkstack(L, LUA_MINSTACK);
        ci.top = L.top + LUA_MINSTACK;
        lua_assert(ci.top <= L.stack_last);
        L.allowhook = 0;
        ci.callstatus |= lstate.CIST_HOOKED;
        hook(L, ar);
        lua_assert(!L.allowhook);
        L.allowhook = 1;
        ci.top = ci_top;
        adjust_top(L, top);
        ci.callstatus &= ~lstate.CIST_HOOKED;
      }
    };
    var callhook = function(L, ci) {
      let hook = LUA_HOOKCALL;
      ci.l_savedpc++;
      if (ci.previous.callstatus & lstate.CIST_LUA && ci.previous.l_code[ci.previous.l_savedpc - 1].opcode == lopcodes.OpCodesI.OP_TAILCALL) {
        ci.callstatus |= lstate.CIST_TAIL;
        hook = LUA_HOOKTAILCALL;
      }
      luaD_hook(L, hook, -1);
      ci.l_savedpc--;
    };
    var adjust_varargs = function(L, p, actual) {
      let nfixargs = p.numparams;
      let fixed = L.top - actual;
      let base = L.top;
      let i;
      for (i = 0; i < nfixargs && i < actual; i++) {
        lobject.pushobj2s(L, L.stack[fixed + i]);
        L.stack[fixed + i].setnilvalue();
      }
      for (; i < nfixargs; i++)
        L.stack[L.top++] = new lobject.TValue(LUA_TNIL, null);
      return base;
    };
    var tryfuncTM = function(L, off, func) {
      let tm = ltm.luaT_gettmbyobj(L, func, ltm.TMS.TM_CALL);
      if (!tm.ttisfunction(tm))
        ldebug.luaG_typeerror(L, func, to_luastring2("call", true));
      lobject.pushobj2s(L, L.stack[L.top - 1]);
      for (let p = L.top - 2; p > off; p--)
        lobject.setobjs2s(L, p, p - 1);
      lobject.setobj2s(L, off, tm);
    };
    var stackerror = function(L) {
      if (L.nCcalls === LUAI_MAXCCALLS)
        ldebug.luaG_runerror(L, to_luastring2("JS stack overflow", true));
      else if (L.nCcalls >= LUAI_MAXCCALLS + (LUAI_MAXCCALLS >> 3))
        luaD_throw(L, LUA_ERRERR);
    };
    var luaD_call = function(L, off, nResults) {
      if (++L.nCcalls >= LUAI_MAXCCALLS)
        stackerror(L);
      if (!luaD_precall(L, off, nResults))
        lvm.luaV_execute(L);
      L.nCcalls--;
    };
    var luaD_throw = function(L, errcode) {
      if (L.errorJmp) {
        L.errorJmp.status = errcode;
        throw L.errorJmp;
      } else {
        let g = L.l_G;
        L.status = errcode;
        if (g.mainthread.errorJmp) {
          g.mainthread.stack[g.mainthread.top++] = L.stack[L.top - 1];
          luaD_throw(g.mainthread, errcode);
        } else {
          let panic = g.panic;
          if (panic) {
            seterrorobj(L, errcode, L.top);
            if (L.ci.top < L.top)
              L.ci.top = L.top;
            panic(L);
          }
          throw new Error(`Aborted ${errcode}`);
        }
      }
    };
    var luaD_rawrunprotected = function(L, f, ud) {
      let oldnCcalls = L.nCcalls;
      let lj = {
        status: LUA_OK,
        previous: L.errorJmp
        /* chain new error handler */
      };
      L.errorJmp = lj;
      try {
        f(L, ud);
      } catch (e) {
        if (lj.status === LUA_OK) {
          let atnativeerror = L.l_G.atnativeerror;
          if (atnativeerror) {
            try {
              lj.status = LUA_OK;
              lapi.lua_pushcfunction(L, atnativeerror);
              lapi.lua_pushlightuserdata(L, e);
              luaD_callnoyield(L, L.top - 2, 1);
              if (L.errfunc !== 0) {
                let errfunc = L.errfunc;
                lobject.pushobj2s(L, L.stack[L.top - 1]);
                lobject.setobjs2s(L, L.top - 2, errfunc);
                luaD_callnoyield(L, L.top - 2, 1);
              }
              lj.status = LUA_ERRRUN;
            } catch (e2) {
              if (lj.status === LUA_OK) {
                lj.status = -1;
              }
            }
          } else {
            lj.status = -1;
          }
        }
      }
      L.errorJmp = lj.previous;
      L.nCcalls = oldnCcalls;
      return lj.status;
    };
    var finishCcall = function(L, status) {
      let ci = L.ci;
      lua_assert(ci.c_k !== null && L.nny === 0);
      lua_assert(ci.callstatus & lstate.CIST_YPCALL || status === LUA_YIELD);
      if (ci.callstatus & lstate.CIST_YPCALL) {
        ci.callstatus &= ~lstate.CIST_YPCALL;
        L.errfunc = ci.c_old_errfunc;
      }
      if (ci.nresults === LUA_MULTRET && L.ci.top < L.top) L.ci.top = L.top;
      let c_k = ci.c_k;
      let n = c_k(L, status, ci.c_ctx);
      lapi.api_checknelems(L, n);
      luaD_poscall(L, ci, L.top - n, n);
    };
    var unroll = function(L, ud) {
      if (ud !== null)
        finishCcall(L, ud);
      while (L.ci !== L.base_ci) {
        if (!(L.ci.callstatus & lstate.CIST_LUA))
          finishCcall(L, LUA_YIELD);
        else {
          lvm.luaV_finishOp(L);
          lvm.luaV_execute(L);
        }
      }
    };
    var findpcall = function(L) {
      for (let ci = L.ci; ci !== null; ci = ci.previous) {
        if (ci.callstatus & lstate.CIST_YPCALL)
          return ci;
      }
      return null;
    };
    var recover = function(L, status) {
      let ci = findpcall(L);
      if (ci === null) return 0;
      let oldtop = ci.extra;
      lfunc.luaF_close(L, oldtop);
      seterrorobj(L, status, oldtop);
      L.ci = ci;
      L.allowhook = ci.callstatus & lstate.CIST_OAH;
      L.nny = 0;
      luaD_shrinkstack(L);
      L.errfunc = ci.c_old_errfunc;
      return 1;
    };
    var resume_error = function(L, msg, narg) {
      let ts = luaS_newliteral(L, msg);
      if (narg === 0) {
        lobject.pushsvalue2s(L, ts);
        api_check(L, L.top <= L.ci.top, "stack overflow");
      } else {
        for (let i = 1; i < narg; i++)
          delete L.stack[--L.top];
        lobject.setsvalue2s(L, L.top - 1, ts);
      }
      return LUA_ERRRUN;
    };
    var resume = function(L, n) {
      let firstArg = L.top - n;
      let ci = L.ci;
      if (L.status === LUA_OK) {
        if (!luaD_precall(L, firstArg - 1, LUA_MULTRET))
          lvm.luaV_execute(L);
      } else {
        lua_assert(L.status === LUA_YIELD);
        L.status = LUA_OK;
        ci.funcOff = ci.extra;
        ci.func = L.stack[ci.funcOff];
        if (ci.callstatus & lstate.CIST_LUA)
          lvm.luaV_execute(L);
        else {
          if (ci.c_k !== null) {
            n = ci.c_k(L, LUA_YIELD, ci.c_ctx);
            lapi.api_checknelems(L, n);
            firstArg = L.top - n;
          }
          luaD_poscall(L, ci, firstArg, n);
        }
        unroll(L, null);
      }
    };
    var lua_resume = function(L, from, nargs) {
      let oldnny = L.nny;
      if (L.status === LUA_OK) {
        if (L.ci !== L.base_ci)
          return resume_error(L, "cannot resume non-suspended coroutine", nargs);
      } else if (L.status !== LUA_YIELD)
        return resume_error(L, "cannot resume dead coroutine", nargs);
      L.nCcalls = from ? from.nCcalls + 1 : 1;
      if (L.nCcalls >= LUAI_MAXCCALLS)
        return resume_error(L, "JS stack overflow", nargs);
      L.nny = 0;
      lapi.api_checknelems(L, L.status === LUA_OK ? nargs + 1 : nargs);
      let status = luaD_rawrunprotected(L, resume, nargs);
      if (status === -1)
        status = LUA_ERRRUN;
      else {
        while (status > LUA_YIELD && recover(L, status)) {
          status = luaD_rawrunprotected(L, unroll, status);
        }
        if (status > LUA_YIELD) {
          L.status = status;
          seterrorobj(L, status, L.top);
          L.ci.top = L.top;
        } else
          lua_assert(status === L.status);
      }
      L.nny = oldnny;
      L.nCcalls--;
      lua_assert(L.nCcalls === (from ? from.nCcalls : 0));
      return status;
    };
    var lua_isyieldable = function(L) {
      return L.nny === 0;
    };
    var lua_yieldk = function(L, nresults, ctx, k) {
      let ci = L.ci;
      lapi.api_checknelems(L, nresults);
      if (L.nny > 0) {
        if (L !== L.l_G.mainthread)
          ldebug.luaG_runerror(L, to_luastring2("attempt to yield across a JS-call boundary", true));
        else
          ldebug.luaG_runerror(L, to_luastring2("attempt to yield from outside a coroutine", true));
      }
      L.status = LUA_YIELD;
      ci.extra = ci.funcOff;
      if (ci.callstatus & lstate.CIST_LUA)
        api_check(L, k === null, "hooks cannot continue after yielding");
      else {
        ci.c_k = k;
        if (k !== null)
          ci.c_ctx = ctx;
        ci.funcOff = L.top - nresults - 1;
        ci.func = L.stack[ci.funcOff];
        luaD_throw(L, LUA_YIELD);
      }
      lua_assert(ci.callstatus & lstate.CIST_HOOKED);
      return 0;
    };
    var lua_yield = function(L, n) {
      lua_yieldk(L, n, 0, null);
    };
    var luaD_pcall = function(L, func, u, old_top, ef) {
      let old_ci = L.ci;
      let old_allowhooks = L.allowhook;
      let old_nny = L.nny;
      let old_errfunc = L.errfunc;
      L.errfunc = ef;
      let status = luaD_rawrunprotected(L, func, u);
      if (status !== LUA_OK) {
        lfunc.luaF_close(L, old_top);
        seterrorobj(L, status, old_top);
        L.ci = old_ci;
        L.allowhook = old_allowhooks;
        L.nny = old_nny;
        luaD_shrinkstack(L);
      }
      L.errfunc = old_errfunc;
      return status;
    };
    var luaD_callnoyield = function(L, off, nResults) {
      L.nny++;
      luaD_call(L, off, nResults);
      L.nny--;
    };
    var SParser = class {
      constructor(z, name, mode) {
        this.z = z;
        this.buff = new MBuffer();
        this.dyd = new lparser.Dyndata();
        this.mode = mode;
        this.name = name;
      }
    };
    var checkmode = function(L, mode, x) {
      if (mode && luastring_indexOf(mode, x[0]) === -1) {
        lobject.luaO_pushfstring(
          L,
          to_luastring2("attempt to load a %s chunk (mode is '%s')"),
          x,
          mode
        );
        luaD_throw(L, LUA_ERRSYNTAX);
      }
    };
    var f_parser = function(L, p) {
      let cl;
      let c = p.z.zgetc();
      if (c === LUA_SIGNATURE[0]) {
        checkmode(L, p.mode, to_luastring2("binary", true));
        cl = lundump.luaU_undump(L, p.z, p.name);
      } else {
        checkmode(L, p.mode, to_luastring2("text", true));
        cl = lparser.luaY_parser(L, p.z, p.buff, p.dyd, p.name, c);
      }
      lua_assert(cl.nupvalues === cl.p.upvalues.length);
      lfunc.luaF_initupvals(L, cl);
    };
    var luaD_protectedparser = function(L, z, name, mode) {
      let p = new SParser(z, name, mode);
      L.nny++;
      let status = luaD_pcall(L, f_parser, p, L.top, L.errfunc);
      L.nny--;
      return status;
    };
    module.exports.adjust_top = adjust_top;
    module.exports.luaD_call = luaD_call;
    module.exports.luaD_callnoyield = luaD_callnoyield;
    module.exports.luaD_checkstack = luaD_checkstack;
    module.exports.luaD_growstack = luaD_growstack;
    module.exports.luaD_hook = luaD_hook;
    module.exports.luaD_inctop = luaD_inctop;
    module.exports.luaD_pcall = luaD_pcall;
    module.exports.luaD_poscall = luaD_poscall;
    module.exports.luaD_precall = luaD_precall;
    module.exports.luaD_protectedparser = luaD_protectedparser;
    module.exports.luaD_rawrunprotected = luaD_rawrunprotected;
    module.exports.luaD_reallocstack = luaD_reallocstack;
    module.exports.luaD_throw = luaD_throw;
    module.exports.lua_isyieldable = lua_isyieldable;
    module.exports.lua_resume = lua_resume;
    module.exports.lua_yield = lua_yield;
    module.exports.lua_yieldk = lua_yieldk;
  }
});

// vendor/fengari/src/ldebug.js
var require_ldebug = __commonJS({
  "vendor/fengari/src/ldebug.js"(exports, module) {
    "use strict";
    var {
      LUA_HOOKCOUNT,
      LUA_HOOKLINE,
      LUA_MASKCOUNT,
      LUA_MASKLINE,
      constant_types: {
        LUA_TBOOLEAN,
        LUA_TNIL,
        LUA_TTABLE
      },
      thread_status: {
        LUA_ERRRUN,
        LUA_YIELD
      },
      from_userstring,
      luastring_eq,
      luastring_indexOf,
      to_luastring: to_luastring2
    } = require_defs();
    var {
      api_check,
      lua_assert
    } = require_llimits();
    var { LUA_IDSIZE } = require_luaconf();
    var lapi = require_lapi();
    var ldo = require_ldo();
    var lfunc = require_lfunc();
    var llex = require_llex();
    var lobject = require_lobject();
    var lopcodes = require_lopcodes();
    var lstate = require_lstate();
    var ltable = require_ltable();
    var ltm = require_ltm();
    var lvm = require_lvm();
    var currentpc = function(ci) {
      lua_assert(ci.callstatus & lstate.CIST_LUA);
      return ci.l_savedpc - 1;
    };
    var currentline = function(ci) {
      return ci.func.value.p.lineinfo.length !== 0 ? ci.func.value.p.lineinfo[currentpc(ci)] : -1;
    };
    var swapextra = function(L) {
      if (L.status === LUA_YIELD) {
        let ci = L.ci;
        let temp = ci.funcOff;
        ci.func = L.stack[ci.extra];
        ci.funcOff = ci.extra;
        ci.extra = temp;
      }
    };
    var lua_sethook = function(L, func, mask, count) {
      if (func === null || mask === 0) {
        mask = 0;
        func = null;
      }
      if (L.ci.callstatus & lstate.CIST_LUA)
        L.oldpc = L.ci.l_savedpc;
      L.hook = func;
      L.basehookcount = count;
      L.hookcount = L.basehookcount;
      L.hookmask = mask;
    };
    var lua_gethook = function(L) {
      return L.hook;
    };
    var lua_gethookmask = function(L) {
      return L.hookmask;
    };
    var lua_gethookcount = function(L) {
      return L.basehookcount;
    };
    var lua_getstack = function(L, level, ar) {
      let ci;
      let status;
      if (level < 0) return 0;
      for (ci = L.ci; level > 0 && ci !== L.base_ci; ci = ci.previous)
        level--;
      if (level === 0 && ci !== L.base_ci) {
        status = 1;
        ar.i_ci = ci;
      } else
        status = 0;
      return status;
    };
    var upvalname = function(p, uv) {
      lua_assert(uv < p.upvalues.length);
      let s = p.upvalues[uv].name;
      if (s === null) return to_luastring2("?", true);
      return s.getstr();
    };
    var findvararg = function(ci, n) {
      let nparams = ci.func.value.p.numparams;
      if (n >= ci.l_base - ci.funcOff - nparams)
        return null;
      else {
        return {
          pos: ci.funcOff + nparams + n,
          name: to_luastring2("(*vararg)", true)
          /* generic name for any vararg */
        };
      }
    };
    var findlocal = function(L, ci, n) {
      let base, name = null;
      if (ci.callstatus & lstate.CIST_LUA) {
        if (n < 0)
          return findvararg(ci, -n);
        else {
          base = ci.l_base;
          name = lfunc.luaF_getlocalname(ci.func.value.p, n, currentpc(ci));
        }
      } else
        base = ci.funcOff + 1;
      if (name === null) {
        let limit = ci === L.ci ? L.top : ci.next.funcOff;
        if (limit - base >= n && n > 0)
          name = to_luastring2("(*temporary)", true);
        else
          return null;
      }
      return {
        pos: base + (n - 1),
        name
      };
    };
    var lua_getlocal = function(L, ar, n) {
      let name;
      swapextra(L);
      if (ar === null) {
        if (!L.stack[L.top - 1].ttisLclosure())
          name = null;
        else
          name = lfunc.luaF_getlocalname(L.stack[L.top - 1].value.p, n, 0);
      } else {
        let local = findlocal(L, ar.i_ci, n);
        if (local) {
          name = local.name;
          lobject.pushobj2s(L, L.stack[local.pos]);
          api_check(L, L.top <= L.ci.top, "stack overflow");
        } else {
          name = null;
        }
      }
      swapextra(L);
      return name;
    };
    var lua_setlocal = function(L, ar, n) {
      let name;
      swapextra(L);
      let local = findlocal(L, ar.i_ci, n);
      if (local) {
        name = local.name;
        lobject.setobjs2s(L, local.pos, L.top - 1);
        delete L.stack[--L.top];
      } else {
        name = null;
      }
      swapextra(L);
      return name;
    };
    var funcinfo = function(ar, cl) {
      if (cl === null || cl instanceof lobject.CClosure) {
        ar.source = to_luastring2("=[JS]", true);
        ar.linedefined = -1;
        ar.lastlinedefined = -1;
        ar.what = to_luastring2("J", true);
      } else {
        let p = cl.p;
        ar.source = p.source ? p.source.getstr() : to_luastring2("=?", true);
        ar.linedefined = p.linedefined;
        ar.lastlinedefined = p.lastlinedefined;
        ar.what = ar.linedefined === 0 ? to_luastring2("main", true) : to_luastring2("Lua", true);
      }
      ar.short_src = lobject.luaO_chunkid(ar.source, LUA_IDSIZE);
    };
    var collectvalidlines = function(L, f) {
      if (f === null || f instanceof lobject.CClosure) {
        L.stack[L.top] = new lobject.TValue(LUA_TNIL, null);
        lapi.api_incr_top(L);
      } else {
        let lineinfo = f.p.lineinfo;
        let t = ltable.luaH_new(L);
        L.stack[L.top] = new lobject.TValue(LUA_TTABLE, t);
        lapi.api_incr_top(L);
        let v = new lobject.TValue(LUA_TBOOLEAN, true);
        for (let i = 0; i < lineinfo.length; i++)
          ltable.luaH_setint(t, lineinfo[i], v);
      }
    };
    var getfuncname = function(L, ci) {
      let r = {
        name: null,
        funcname: null
      };
      if (ci === null)
        return null;
      else if (ci.callstatus & lstate.CIST_FIN) {
        r.name = to_luastring2("__gc", true);
        r.funcname = to_luastring2("metamethod", true);
        return r;
      } else if (!(ci.callstatus & lstate.CIST_TAIL) && ci.previous.callstatus & lstate.CIST_LUA)
        return funcnamefromcode(L, ci.previous);
      else return null;
    };
    var auxgetinfo = function(L, what, ar, f, ci) {
      let status = 1;
      for (; what.length > 0; what = what.subarray(1)) {
        switch (what[0]) {
          case 83: {
            funcinfo(ar, f);
            break;
          }
          case 108: {
            ar.currentline = ci && ci.callstatus & lstate.CIST_LUA ? currentline(ci) : -1;
            break;
          }
          case 117: {
            ar.nups = f === null ? 0 : f.nupvalues;
            if (f === null || f instanceof lobject.CClosure) {
              ar.isvararg = true;
              ar.nparams = 0;
            } else {
              ar.isvararg = f.p.is_vararg;
              ar.nparams = f.p.numparams;
            }
            break;
          }
          case 116: {
            ar.istailcall = ci ? ci.callstatus & lstate.CIST_TAIL : 0;
            break;
          }
          case 110: {
            let r = getfuncname(L, ci);
            if (r === null) {
              ar.namewhat = to_luastring2("", true);
              ar.name = null;
            } else {
              ar.namewhat = r.funcname;
              ar.name = r.name;
            }
            break;
          }
          case 76:
          case 102:
            break;
          default:
            status = 0;
        }
      }
      return status;
    };
    var lua_getinfo = function(L, what, ar) {
      what = from_userstring(what);
      let status, cl, ci, func;
      swapextra(L);
      if (what[0] === 62) {
        ci = null;
        func = L.stack[L.top - 1];
        api_check(L, func.ttisfunction(), "function expected");
        what = what.subarray(1);
        L.top--;
      } else {
        ci = ar.i_ci;
        func = ci.func;
        lua_assert(ci.func.ttisfunction());
      }
      cl = func.ttisclosure() ? func.value : null;
      status = auxgetinfo(L, what, ar, cl, ci);
      if (luastring_indexOf(
        what,
        102
        /* ('f').charCodeAt(0) */
      ) >= 0) {
        lobject.pushobj2s(L, func);
        api_check(L, L.top <= L.ci.top, "stack overflow");
      }
      swapextra(L);
      if (luastring_indexOf(
        what,
        76
        /* ('L').charCodeAt(0) */
      ) >= 0)
        collectvalidlines(L, cl);
      return status;
    };
    var kname = function(p, pc, c) {
      let r = {
        name: null,
        funcname: null
      };
      if (lopcodes.ISK(c)) {
        let kvalue = p.k[lopcodes.INDEXK(c)];
        if (kvalue.ttisstring()) {
          r.name = kvalue.svalue();
          return r;
        }
      } else {
        let what = getobjname(p, pc, c);
        if (what && what.funcname[0] === 99) {
          return what;
        }
      }
      r.name = to_luastring2("?", true);
      return r;
    };
    var filterpc = function(pc, jmptarget) {
      if (pc < jmptarget)
        return -1;
      else return pc;
    };
    var findsetreg = function(p, lastpc, reg) {
      let setreg = -1;
      let jmptarget = 0;
      let OCi = lopcodes.OpCodesI;
      for (let pc = 0; pc < lastpc; pc++) {
        let i = p.code[pc];
        let a = i.A;
        switch (i.opcode) {
          case OCi.OP_LOADNIL: {
            let b = i.B;
            if (a <= reg && reg <= a + b)
              setreg = filterpc(pc, jmptarget);
            break;
          }
          case OCi.OP_TFORCALL: {
            if (reg >= a + 2)
              setreg = filterpc(pc, jmptarget);
            break;
          }
          case OCi.OP_CALL:
          case OCi.OP_TAILCALL: {
            if (reg >= a)
              setreg = filterpc(pc, jmptarget);
            break;
          }
          case OCi.OP_JMP: {
            let b = i.sBx;
            let dest = pc + 1 + b;
            if (pc < dest && dest <= lastpc) {
              if (dest > jmptarget)
                jmptarget = dest;
            }
            break;
          }
          default:
            if (lopcodes.testAMode(i.opcode) && reg === a)
              setreg = filterpc(pc, jmptarget);
            break;
        }
      }
      return setreg;
    };
    var getobjname = function(p, lastpc, reg) {
      let r = {
        name: lfunc.luaF_getlocalname(p, reg + 1, lastpc),
        funcname: null
      };
      if (r.name) {
        r.funcname = to_luastring2("local", true);
        return r;
      }
      let pc = findsetreg(p, lastpc, reg);
      let OCi = lopcodes.OpCodesI;
      if (pc !== -1) {
        let i = p.code[pc];
        switch (i.opcode) {
          case OCi.OP_MOVE: {
            let b = i.B;
            if (b < i.A)
              return getobjname(p, pc, b);
            break;
          }
          case OCi.OP_GETTABUP:
          case OCi.OP_GETTABLE: {
            let k = i.C;
            let t = i.B;
            let vn = i.opcode === OCi.OP_GETTABLE ? lfunc.luaF_getlocalname(p, t + 1, pc) : upvalname(p, t);
            r.name = kname(p, pc, k).name;
            r.funcname = vn && luastring_eq(vn, llex.LUA_ENV) ? to_luastring2("global", true) : to_luastring2("field", true);
            return r;
          }
          case OCi.OP_GETUPVAL: {
            r.name = upvalname(p, i.B);
            r.funcname = to_luastring2("upvalue", true);
            return r;
          }
          case OCi.OP_LOADK:
          case OCi.OP_LOADKX: {
            let b = i.opcode === OCi.OP_LOADK ? i.Bx : p.code[pc + 1].Ax;
            if (p.k[b].ttisstring()) {
              r.name = p.k[b].svalue();
              r.funcname = to_luastring2("constant", true);
              return r;
            }
            break;
          }
          case OCi.OP_SELF: {
            let k = i.C;
            r.name = kname(p, pc, k).name;
            r.funcname = to_luastring2("method", true);
            return r;
          }
          default:
            break;
        }
      }
      return null;
    };
    var funcnamefromcode = function(L, ci) {
      let r = {
        name: null,
        funcname: null
      };
      let tm = 0;
      let p = ci.func.value.p;
      let pc = currentpc(ci);
      let i = p.code[pc];
      let OCi = lopcodes.OpCodesI;
      if (ci.callstatus & lstate.CIST_HOOKED) {
        r.name = to_luastring2("?", true);
        r.funcname = to_luastring2("hook", true);
        return r;
      }
      switch (i.opcode) {
        case OCi.OP_CALL:
        case OCi.OP_TAILCALL:
          return getobjname(p, pc, i.A);
        /* get function name */
        case OCi.OP_TFORCALL:
          r.name = to_luastring2("for iterator", true);
          r.funcname = to_luastring2("for iterator", true);
          return r;
        /* other instructions can do calls through metamethods */
        case OCi.OP_SELF:
        case OCi.OP_GETTABUP:
        case OCi.OP_GETTABLE:
          tm = ltm.TMS.TM_INDEX;
          break;
        case OCi.OP_SETTABUP:
        case OCi.OP_SETTABLE:
          tm = ltm.TMS.TM_NEWINDEX;
          break;
        case OCi.OP_ADD:
          tm = ltm.TMS.TM_ADD;
          break;
        case OCi.OP_SUB:
          tm = ltm.TMS.TM_SUB;
          break;
        case OCi.OP_MUL:
          tm = ltm.TMS.TM_MUL;
          break;
        case OCi.OP_MOD:
          tm = ltm.TMS.TM_MOD;
          break;
        case OCi.OP_POW:
          tm = ltm.TMS.TM_POW;
          break;
        case OCi.OP_DIV:
          tm = ltm.TMS.TM_DIV;
          break;
        case OCi.OP_IDIV:
          tm = ltm.TMS.TM_IDIV;
          break;
        case OCi.OP_BAND:
          tm = ltm.TMS.TM_BAND;
          break;
        case OCi.OP_BOR:
          tm = ltm.TMS.TM_BOR;
          break;
        case OCi.OP_BXOR:
          tm = ltm.TMS.TM_BXOR;
          break;
        case OCi.OP_SHL:
          tm = ltm.TMS.TM_SHL;
          break;
        case OCi.OP_SHR:
          tm = ltm.TMS.TM_SHR;
          break;
        case OCi.OP_UNM:
          tm = ltm.TMS.TM_UNM;
          break;
        case OCi.OP_BNOT:
          tm = ltm.TMS.TM_BNOT;
          break;
        case OCi.OP_LEN:
          tm = ltm.TMS.TM_LEN;
          break;
        case OCi.OP_CONCAT:
          tm = ltm.TMS.TM_CONCAT;
          break;
        case OCi.OP_EQ:
          tm = ltm.TMS.TM_EQ;
          break;
        case OCi.OP_LT:
          tm = ltm.TMS.TM_LT;
          break;
        case OCi.OP_LE:
          tm = ltm.TMS.TM_LE;
          break;
        default:
          return null;
      }
      r.name = L.l_G.tmname[tm].getstr();
      r.funcname = to_luastring2("metamethod", true);
      return r;
    };
    var isinstack = function(L, ci, o) {
      for (let i = ci.l_base; i < ci.top; i++) {
        if (L.stack[i] === o)
          return i;
      }
      return false;
    };
    var getupvalname = function(L, ci, o) {
      let c = ci.func.value;
      for (let i = 0; i < c.nupvalues; i++) {
        if (c.upvals[i] === o) {
          return {
            name: upvalname(c.p, i),
            funcname: to_luastring2("upvalue", true)
          };
        }
      }
      return null;
    };
    var varinfo = function(L, o) {
      let ci = L.ci;
      let kind = null;
      if (ci.callstatus & lstate.CIST_LUA) {
        kind = getupvalname(L, ci, o);
        let stkid = isinstack(L, ci, o);
        if (!kind && stkid)
          kind = getobjname(ci.func.value.p, currentpc(ci), stkid - ci.l_base);
      }
      return kind ? lobject.luaO_pushfstring(L, to_luastring2(" (%s '%s')", true), kind.funcname, kind.name) : to_luastring2("", true);
    };
    var luaG_typeerror = function(L, o, op) {
      let t = ltm.luaT_objtypename(L, o);
      luaG_runerror(L, to_luastring2("attempt to %s a %s value%s", true), op, t, varinfo(L, o));
    };
    var luaG_concaterror = function(L, p1, p2) {
      if (p1.ttisstring() || lvm.cvt2str(p1)) p1 = p2;
      luaG_typeerror(L, p1, to_luastring2("concatenate", true));
    };
    var luaG_opinterror = function(L, p1, p2, msg) {
      if (lvm.tonumber(p1) === false)
        p2 = p1;
      luaG_typeerror(L, p2, msg);
    };
    var luaG_ordererror = function(L, p1, p2) {
      let t1 = ltm.luaT_objtypename(L, p1);
      let t2 = ltm.luaT_objtypename(L, p2);
      if (luastring_eq(t1, t2))
        luaG_runerror(L, to_luastring2("attempt to compare two %s values", true), t1);
      else
        luaG_runerror(L, to_luastring2("attempt to compare %s with %s", true), t1, t2);
    };
    var luaG_addinfo = function(L, msg, src, line) {
      let buff;
      if (src)
        buff = lobject.luaO_chunkid(src.getstr(), LUA_IDSIZE);
      else
        buff = to_luastring2("?", true);
      return lobject.luaO_pushfstring(L, to_luastring2("%s:%d: %s", true), buff, line, msg);
    };
    var luaG_runerror = function(L, fmt, ...argp) {
      let ci = L.ci;
      let msg = lobject.luaO_pushvfstring(L, fmt, argp);
      if (ci.callstatus & lstate.CIST_LUA)
        luaG_addinfo(L, msg, ci.func.value.p.source, currentline(ci));
      luaG_errormsg(L);
    };
    var luaG_errormsg = function(L) {
      if (L.errfunc !== 0) {
        let errfunc = L.errfunc;
        lobject.pushobj2s(L, L.stack[L.top - 1]);
        lobject.setobjs2s(L, L.top - 2, errfunc);
        ldo.luaD_callnoyield(L, L.top - 2, 1);
      }
      ldo.luaD_throw(L, LUA_ERRRUN);
    };
    var luaG_tointerror = function(L, p1, p2) {
      let temp = lvm.tointeger(p1);
      if (temp === false)
        p2 = p1;
      luaG_runerror(L, to_luastring2("number%s has no integer representation", true), varinfo(L, p2));
    };
    var luaG_traceexec = function(L) {
      let ci = L.ci;
      let mask = L.hookmask;
      let counthook = --L.hookcount === 0 && mask & LUA_MASKCOUNT;
      if (counthook)
        L.hookcount = L.basehookcount;
      else if (!(mask & LUA_MASKLINE))
        return;
      if (ci.callstatus & lstate.CIST_HOOKYIELD) {
        ci.callstatus &= ~lstate.CIST_HOOKYIELD;
        return;
      }
      if (counthook)
        ldo.luaD_hook(L, LUA_HOOKCOUNT, -1);
      if (mask & LUA_MASKLINE) {
        let p = ci.func.value.p;
        let npc = ci.l_savedpc - 1;
        let newline = p.lineinfo.length !== 0 ? p.lineinfo[npc] : -1;
        if (npc === 0 || /* call linehook when enter a new function, */
        ci.l_savedpc <= L.oldpc || /* when jump back (loop), or when */
        newline !== (p.lineinfo.length !== 0 ? p.lineinfo[L.oldpc - 1] : -1))
          ldo.luaD_hook(L, LUA_HOOKLINE, newline);
      }
      L.oldpc = ci.l_savedpc;
      if (L.status === LUA_YIELD) {
        if (counthook)
          L.hookcount = 1;
        ci.l_savedpc--;
        ci.callstatus |= lstate.CIST_HOOKYIELD;
        ci.funcOff = L.top - 1;
        ci.func = L.stack[ci.funcOff];
        ldo.luaD_throw(L, LUA_YIELD);
      }
    };
    module.exports.luaG_addinfo = luaG_addinfo;
    module.exports.luaG_concaterror = luaG_concaterror;
    module.exports.luaG_errormsg = luaG_errormsg;
    module.exports.luaG_opinterror = luaG_opinterror;
    module.exports.luaG_ordererror = luaG_ordererror;
    module.exports.luaG_runerror = luaG_runerror;
    module.exports.luaG_tointerror = luaG_tointerror;
    module.exports.luaG_traceexec = luaG_traceexec;
    module.exports.luaG_typeerror = luaG_typeerror;
    module.exports.lua_gethook = lua_gethook;
    module.exports.lua_gethookcount = lua_gethookcount;
    module.exports.lua_gethookmask = lua_gethookmask;
    module.exports.lua_getinfo = lua_getinfo;
    module.exports.lua_getlocal = lua_getlocal;
    module.exports.lua_getstack = lua_getstack;
    module.exports.lua_sethook = lua_sethook;
    module.exports.lua_setlocal = lua_setlocal;
  }
});

// vendor/fengari/src/ldump.js
var require_ldump = __commonJS({
  "vendor/fengari/src/ldump.js"(exports, module) {
    "use strict";
    var {
      LUA_SIGNATURE,
      LUA_VERSION_MAJOR,
      LUA_VERSION_MINOR,
      constant_types: {
        LUA_TBOOLEAN,
        LUA_TLNGSTR,
        LUA_TNIL,
        LUA_TNUMFLT,
        LUA_TNUMINT,
        LUA_TSHRSTR
      },
      luastring_of
    } = require_defs();
    var LUAC_DATA = luastring_of(25, 147, 13, 10, 26, 10);
    var LUAC_INT = 22136;
    var LUAC_NUM = 370.5;
    var LUAC_VERSION = Number(LUA_VERSION_MAJOR) * 16 + Number(LUA_VERSION_MINOR);
    var LUAC_FORMAT = 0;
    var DumpState = class {
      constructor() {
        this.L = null;
        this.writer = null;
        this.data = null;
        this.strip = NaN;
        this.status = NaN;
      }
    };
    var DumpBlock = function(b, size, D) {
      if (D.status === 0 && size > 0)
        D.status = D.writer(D.L, b, size, D.data);
    };
    var DumpByte = function(y, D) {
      DumpBlock(luastring_of(y), 1, D);
    };
    var DumpInt = function(x, D) {
      let ab = new ArrayBuffer(4);
      let dv = new DataView(ab);
      dv.setInt32(0, x, true);
      let t = new Uint8Array(ab);
      DumpBlock(t, 4, D);
    };
    var DumpInteger = function(x, D) {
      let ab = new ArrayBuffer(4);
      let dv = new DataView(ab);
      dv.setInt32(0, x, true);
      let t = new Uint8Array(ab);
      DumpBlock(t, 4, D);
    };
    var DumpNumber = function(x, D) {
      let ab = new ArrayBuffer(8);
      let dv = new DataView(ab);
      dv.setFloat64(0, x, true);
      let t = new Uint8Array(ab);
      DumpBlock(t, 8, D);
    };
    var DumpString = function(s, D) {
      if (s === null)
        DumpByte(0, D);
      else {
        let size = s.tsslen() + 1;
        let str = s.getstr();
        if (size < 255)
          DumpByte(size, D);
        else {
          DumpByte(255, D);
          DumpInteger(size, D);
        }
        DumpBlock(str, size - 1, D);
      }
    };
    var DumpCode = function(f, D) {
      let s = f.code.map((e) => e.code);
      DumpInt(s.length, D);
      for (let i = 0; i < s.length; i++)
        DumpInt(s[i], D);
    };
    var DumpConstants = function(f, D) {
      let n = f.k.length;
      DumpInt(n, D);
      for (let i = 0; i < n; i++) {
        let o = f.k[i];
        DumpByte(o.ttype(), D);
        switch (o.ttype()) {
          case LUA_TNIL:
            break;
          case LUA_TBOOLEAN:
            DumpByte(o.value ? 1 : 0, D);
            break;
          case LUA_TNUMFLT:
            DumpNumber(o.value, D);
            break;
          case LUA_TNUMINT:
            DumpInteger(o.value, D);
            break;
          case LUA_TSHRSTR:
          case LUA_TLNGSTR:
            DumpString(o.tsvalue(), D);
            break;
        }
      }
    };
    var DumpProtos = function(f, D) {
      let n = f.p.length;
      DumpInt(n, D);
      for (let i = 0; i < n; i++)
        DumpFunction(f.p[i], f.source, D);
    };
    var DumpUpvalues = function(f, D) {
      let n = f.upvalues.length;
      DumpInt(n, D);
      for (let i = 0; i < n; i++) {
        DumpByte(f.upvalues[i].instack ? 1 : 0, D);
        DumpByte(f.upvalues[i].idx, D);
      }
    };
    var DumpDebug = function(f, D) {
      let n = D.strip ? 0 : f.lineinfo.length;
      DumpInt(n, D);
      for (let i = 0; i < n; i++)
        DumpInt(f.lineinfo[i], D);
      n = D.strip ? 0 : f.locvars.length;
      DumpInt(n, D);
      for (let i = 0; i < n; i++) {
        DumpString(f.locvars[i].varname, D);
        DumpInt(f.locvars[i].startpc, D);
        DumpInt(f.locvars[i].endpc, D);
      }
      n = D.strip ? 0 : f.upvalues.length;
      DumpInt(n, D);
      for (let i = 0; i < n; i++)
        DumpString(f.upvalues[i].name, D);
    };
    var DumpFunction = function(f, psource, D) {
      if (D.strip || f.source === psource)
        DumpString(null, D);
      else
        DumpString(f.source, D);
      DumpInt(f.linedefined, D);
      DumpInt(f.lastlinedefined, D);
      DumpByte(f.numparams, D);
      DumpByte(f.is_vararg ? 1 : 0, D);
      DumpByte(f.maxstacksize, D);
      DumpCode(f, D);
      DumpConstants(f, D);
      DumpUpvalues(f, D);
      DumpProtos(f, D);
      DumpDebug(f, D);
    };
    var DumpHeader = function(D) {
      DumpBlock(LUA_SIGNATURE, LUA_SIGNATURE.length, D);
      DumpByte(LUAC_VERSION, D);
      DumpByte(LUAC_FORMAT, D);
      DumpBlock(LUAC_DATA, LUAC_DATA.length, D);
      DumpByte(4, D);
      DumpByte(4, D);
      DumpByte(4, D);
      DumpByte(4, D);
      DumpByte(8, D);
      DumpInteger(LUAC_INT, D);
      DumpNumber(LUAC_NUM, D);
    };
    var luaU_dump = function(L, f, w, data, strip) {
      let D = new DumpState();
      D.L = L;
      D.writer = w;
      D.data = data;
      D.strip = strip;
      D.status = 0;
      DumpHeader(D);
      DumpByte(f.upvalues.length, D);
      DumpFunction(f, null, D);
      return D.status;
    };
    module.exports.luaU_dump = luaU_dump;
  }
});

// vendor/fengari/src/lapi.js
var require_lapi = __commonJS({
  "vendor/fengari/src/lapi.js"(exports, module) {
    "use strict";
    var {
      LUA_MULTRET,
      LUA_OPBNOT,
      LUA_OPEQ,
      LUA_OPLE,
      LUA_OPLT,
      LUA_OPUNM,
      LUA_REGISTRYINDEX,
      LUA_RIDX_GLOBALS,
      LUA_VERSION_NUM,
      constant_types: {
        LUA_NUMTAGS,
        LUA_TBOOLEAN,
        LUA_TCCL,
        LUA_TFUNCTION,
        LUA_TLCF,
        LUA_TLCL,
        LUA_TLIGHTUSERDATA,
        LUA_TLNGSTR,
        LUA_TNIL,
        LUA_TNONE,
        LUA_TNUMFLT,
        LUA_TNUMINT,
        LUA_TSHRSTR,
        LUA_TTABLE,
        LUA_TTHREAD,
        LUA_TUSERDATA
      },
      thread_status: { LUA_OK },
      from_userstring,
      to_luastring: to_luastring2
    } = require_defs();
    var { api_check } = require_llimits();
    var ldebug = require_ldebug();
    var ldo = require_ldo();
    var { luaU_dump } = require_ldump();
    var lfunc = require_lfunc();
    var lobject = require_lobject();
    var lstate = require_lstate();
    var {
      luaS_bless,
      luaS_new,
      luaS_newliteral
    } = require_lstring();
    var ltm = require_ltm();
    var { LUAI_MAXSTACK } = require_luaconf();
    var lvm = require_lvm();
    var ltable = require_ltable();
    var { ZIO } = require_lzio();
    var TValue = lobject.TValue;
    var CClosure = lobject.CClosure;
    var api_incr_top = function(L) {
      L.top++;
      api_check(L, L.top <= L.ci.top, "stack overflow");
    };
    var api_checknelems = function(L, n) {
      api_check(L, n < L.top - L.ci.funcOff, "not enough elements in the stack");
    };
    var fengari_argcheck = function(c) {
      if (!c) throw TypeError("invalid argument");
    };
    var fengari_argcheckinteger = function(n) {
      fengari_argcheck(typeof n === "number" && (n | 0) === n);
    };
    var isvalid = function(o) {
      return o !== lobject.luaO_nilobject;
    };
    var lua_version = function(L) {
      if (L === null) return LUA_VERSION_NUM;
      else return L.l_G.version;
    };
    var lua_atpanic = function(L, panicf) {
      let old = L.l_G.panic;
      L.l_G.panic = panicf;
      return old;
    };
    var lua_atnativeerror = function(L, errorf) {
      let old = L.l_G.atnativeerror;
      L.l_G.atnativeerror = errorf;
      return old;
    };
    var index2addr = function(L, idx) {
      let ci = L.ci;
      if (idx > 0) {
        let o = ci.funcOff + idx;
        api_check(L, idx <= ci.top - (ci.funcOff + 1), "unacceptable index");
        if (o >= L.top) return lobject.luaO_nilobject;
        else return L.stack[o];
      } else if (idx > LUA_REGISTRYINDEX) {
        api_check(L, idx !== 0 && -idx <= L.top, "invalid index");
        return L.stack[L.top + idx];
      } else if (idx === LUA_REGISTRYINDEX) {
        return L.l_G.l_registry;
      } else {
        idx = LUA_REGISTRYINDEX - idx;
        api_check(L, idx <= lfunc.MAXUPVAL + 1, "upvalue index too large");
        if (ci.func.ttislcf())
          return lobject.luaO_nilobject;
        else {
          return idx <= ci.func.value.nupvalues ? ci.func.value.upvalue[idx - 1] : lobject.luaO_nilobject;
        }
      }
    };
    var index2addr_ = function(L, idx) {
      let ci = L.ci;
      if (idx > 0) {
        let o = ci.funcOff + idx;
        api_check(L, idx <= ci.top - (ci.funcOff + 1), "unacceptable index");
        if (o >= L.top) return null;
        else return o;
      } else if (idx > LUA_REGISTRYINDEX) {
        api_check(L, idx !== 0 && -idx <= L.top, "invalid index");
        return L.top + idx;
      } else {
        throw Error("attempt to use pseudo-index");
      }
    };
    var lua_checkstack = function(L, n) {
      let res;
      let ci = L.ci;
      api_check(L, n >= 0, "negative 'n'");
      if (L.stack_last - L.top > n)
        res = true;
      else {
        let inuse = L.top + lstate.EXTRA_STACK;
        if (inuse > LUAI_MAXSTACK - n)
          res = false;
        else {
          ldo.luaD_growstack(L, n);
          res = true;
        }
      }
      if (res && ci.top < L.top + n)
        ci.top = L.top + n;
      return res;
    };
    var lua_xmove = function(from, to, n) {
      if (from === to) return;
      api_checknelems(from, n);
      api_check(from, from.l_G === to.l_G, "moving among independent states");
      api_check(from, to.ci.top - to.top >= n, "stack overflow");
      from.top -= n;
      for (let i = 0; i < n; i++) {
        to.stack[to.top] = new lobject.TValue();
        lobject.setobj2s(to, to.top, from.stack[from.top + i]);
        delete from.stack[from.top + i];
        to.top++;
      }
    };
    var lua_absindex = function(L, idx) {
      return idx > 0 || idx <= LUA_REGISTRYINDEX ? idx : L.top - L.ci.funcOff + idx;
    };
    var lua_gettop = function(L) {
      return L.top - (L.ci.funcOff + 1);
    };
    var lua_pushvalue = function(L, idx) {
      lobject.pushobj2s(L, index2addr(L, idx));
      api_check(L, L.top <= L.ci.top, "stack overflow");
    };
    var lua_settop = function(L, idx) {
      let func = L.ci.funcOff;
      let newtop;
      if (idx >= 0) {
        api_check(L, idx <= L.stack_last - (func + 1), "new top too large");
        newtop = func + 1 + idx;
      } else {
        api_check(L, -(idx + 1) <= L.top - (func + 1), "invalid new top");
        newtop = L.top + idx + 1;
      }
      ldo.adjust_top(L, newtop);
    };
    var lua_pop = function(L, n) {
      lua_settop(L, -n - 1);
    };
    var reverse = function(L, from, to) {
      for (; from < to; from++, to--) {
        let fromtv = L.stack[from];
        let temp = new TValue(fromtv.type, fromtv.value);
        lobject.setobjs2s(L, from, to);
        lobject.setobj2s(L, to, temp);
      }
    };
    var lua_rotate = function(L, idx, n) {
      let t = L.top - 1;
      let pIdx = index2addr_(L, idx);
      let p = L.stack[pIdx];
      api_check(L, isvalid(p) && idx > LUA_REGISTRYINDEX, "index not in the stack");
      api_check(L, (n >= 0 ? n : -n) <= t - pIdx + 1, "invalid 'n'");
      let m = n >= 0 ? t - n : pIdx - n - 1;
      reverse(L, pIdx, m);
      reverse(L, m + 1, L.top - 1);
      reverse(L, pIdx, L.top - 1);
    };
    var lua_copy = function(L, fromidx, toidx) {
      let from = index2addr(L, fromidx);
      index2addr(L, toidx).setfrom(from);
    };
    var lua_remove = function(L, idx) {
      lua_rotate(L, idx, -1);
      lua_pop(L, 1);
    };
    var lua_insert = function(L, idx) {
      lua_rotate(L, idx, 1);
    };
    var lua_replace = function(L, idx) {
      lua_copy(L, -1, idx);
      lua_pop(L, 1);
    };
    var lua_pushnil = function(L) {
      L.stack[L.top] = new TValue(LUA_TNIL, null);
      api_incr_top(L);
    };
    var lua_pushnumber = function(L, n) {
      fengari_argcheck(typeof n === "number");
      L.stack[L.top] = new TValue(LUA_TNUMFLT, n);
      api_incr_top(L);
    };
    var lua_pushinteger = function(L, n) {
      fengari_argcheckinteger(n);
      L.stack[L.top] = new TValue(LUA_TNUMINT, n);
      api_incr_top(L);
    };
    var lua_pushlstring = function(L, s, len) {
      fengari_argcheckinteger(len);
      let ts;
      if (len === 0) {
        s = to_luastring2("", true);
        ts = luaS_bless(L, s);
      } else {
        s = from_userstring(s);
        api_check(L, s.length >= len, "invalid length to lua_pushlstring");
        ts = luaS_new(L, s.subarray(0, len));
      }
      lobject.pushsvalue2s(L, ts);
      api_check(L, L.top <= L.ci.top, "stack overflow");
      return ts.value;
    };
    var lua_pushstring = function(L, s) {
      if (s === void 0 || s === null) {
        L.stack[L.top] = new TValue(LUA_TNIL, null);
        L.top++;
      } else {
        let ts = luaS_new(L, from_userstring(s));
        lobject.pushsvalue2s(L, ts);
        s = ts.getstr();
      }
      api_check(L, L.top <= L.ci.top, "stack overflow");
      return s;
    };
    var lua_pushvfstring = function(L, fmt, argp) {
      fmt = from_userstring(fmt);
      return lobject.luaO_pushvfstring(L, fmt, argp);
    };
    var lua_pushfstring = function(L, fmt, ...argp) {
      fmt = from_userstring(fmt);
      return lobject.luaO_pushvfstring(L, fmt, argp);
    };
    var lua_pushliteral = function(L, s) {
      if (s === void 0 || s === null) {
        L.stack[L.top] = new TValue(LUA_TNIL, null);
        L.top++;
      } else {
        fengari_argcheck(typeof s === "string");
        let ts = luaS_newliteral(L, s);
        lobject.pushsvalue2s(L, ts);
        s = ts.getstr();
      }
      api_check(L, L.top <= L.ci.top, "stack overflow");
      return s;
    };
    var lua_pushcclosure = function(L, fn, n) {
      fengari_argcheck(typeof fn === "function");
      fengari_argcheckinteger(n);
      if (n === 0)
        L.stack[L.top] = new TValue(LUA_TLCF, fn);
      else {
        api_checknelems(L, n);
        api_check(L, n <= lfunc.MAXUPVAL, "upvalue index too large");
        let cl = new CClosure(L, fn, n);
        for (let i = 0; i < n; i++)
          cl.upvalue[i].setfrom(L.stack[L.top - n + i]);
        for (let i = 1; i < n; i++)
          delete L.stack[--L.top];
        if (n > 0)
          --L.top;
        L.stack[L.top].setclCvalue(cl);
      }
      api_incr_top(L);
    };
    var lua_pushjsclosure = lua_pushcclosure;
    var lua_pushcfunction = function(L, fn) {
      lua_pushcclosure(L, fn, 0);
    };
    var lua_pushjsfunction = lua_pushcfunction;
    var lua_pushboolean = function(L, b) {
      L.stack[L.top] = new TValue(LUA_TBOOLEAN, !!b);
      api_incr_top(L);
    };
    var lua_pushlightuserdata = function(L, p) {
      L.stack[L.top] = new TValue(LUA_TLIGHTUSERDATA, p);
      api_incr_top(L);
    };
    var lua_pushthread = function(L) {
      L.stack[L.top] = new TValue(LUA_TTHREAD, L);
      api_incr_top(L);
      return L.l_G.mainthread === L;
    };
    var lua_pushglobaltable = function(L) {
      lua_rawgeti(L, LUA_REGISTRYINDEX, LUA_RIDX_GLOBALS);
    };
    var auxsetstr = function(L, t, k) {
      let str = luaS_new(L, from_userstring(k));
      api_checknelems(L, 1);
      lobject.pushsvalue2s(L, str);
      api_check(L, L.top <= L.ci.top, "stack overflow");
      lvm.settable(L, t, L.stack[L.top - 1], L.stack[L.top - 2]);
      delete L.stack[--L.top];
      delete L.stack[--L.top];
    };
    var lua_setglobal = function(L, name) {
      auxsetstr(L, ltable.luaH_getint(L.l_G.l_registry.value, LUA_RIDX_GLOBALS), name);
    };
    var lua_setmetatable = function(L, objindex) {
      api_checknelems(L, 1);
      let mt;
      let obj = index2addr(L, objindex);
      if (L.stack[L.top - 1].ttisnil())
        mt = null;
      else {
        api_check(L, L.stack[L.top - 1].ttistable(), "table expected");
        mt = L.stack[L.top - 1].value;
      }
      switch (obj.ttnov()) {
        case LUA_TUSERDATA:
        case LUA_TTABLE: {
          obj.value.metatable = mt;
          break;
        }
        default: {
          L.l_G.mt[obj.ttnov()] = mt;
          break;
        }
      }
      delete L.stack[--L.top];
      return true;
    };
    var lua_settable = function(L, idx) {
      api_checknelems(L, 2);
      let t = index2addr(L, idx);
      lvm.settable(L, t, L.stack[L.top - 2], L.stack[L.top - 1]);
      delete L.stack[--L.top];
      delete L.stack[--L.top];
    };
    var lua_setfield = function(L, idx, k) {
      auxsetstr(L, index2addr(L, idx), k);
    };
    var lua_seti = function(L, idx, n) {
      fengari_argcheckinteger(n);
      api_checknelems(L, 1);
      let t = index2addr(L, idx);
      L.stack[L.top] = new TValue(LUA_TNUMINT, n);
      api_incr_top(L);
      lvm.settable(L, t, L.stack[L.top - 1], L.stack[L.top - 2]);
      delete L.stack[--L.top];
      delete L.stack[--L.top];
    };
    var lua_rawset = function(L, idx) {
      api_checknelems(L, 2);
      let o = index2addr(L, idx);
      api_check(L, o.ttistable(), "table expected");
      let k = L.stack[L.top - 2];
      let v = L.stack[L.top - 1];
      ltable.luaH_setfrom(L, o.value, k, v);
      ltable.invalidateTMcache(o.value);
      delete L.stack[--L.top];
      delete L.stack[--L.top];
    };
    var lua_rawseti = function(L, idx, n) {
      fengari_argcheckinteger(n);
      api_checknelems(L, 1);
      let o = index2addr(L, idx);
      api_check(L, o.ttistable(), "table expected");
      ltable.luaH_setint(o.value, n, L.stack[L.top - 1]);
      delete L.stack[--L.top];
    };
    var lua_rawsetp = function(L, idx, p) {
      api_checknelems(L, 1);
      let o = index2addr(L, idx);
      api_check(L, o.ttistable(), "table expected");
      let k = new TValue(LUA_TLIGHTUSERDATA, p);
      let v = L.stack[L.top - 1];
      ltable.luaH_setfrom(L, o.value, k, v);
      delete L.stack[--L.top];
    };
    var auxgetstr = function(L, t, k) {
      let str = luaS_new(L, from_userstring(k));
      lobject.pushsvalue2s(L, str);
      api_check(L, L.top <= L.ci.top, "stack overflow");
      lvm.luaV_gettable(L, t, L.stack[L.top - 1], L.top - 1);
      return L.stack[L.top - 1].ttnov();
    };
    var lua_rawgeti = function(L, idx, n) {
      let t = index2addr(L, idx);
      fengari_argcheckinteger(n);
      api_check(L, t.ttistable(), "table expected");
      lobject.pushobj2s(L, ltable.luaH_getint(t.value, n));
      api_check(L, L.top <= L.ci.top, "stack overflow");
      return L.stack[L.top - 1].ttnov();
    };
    var lua_rawgetp = function(L, idx, p) {
      let t = index2addr(L, idx);
      api_check(L, t.ttistable(), "table expected");
      let k = new TValue(LUA_TLIGHTUSERDATA, p);
      lobject.pushobj2s(L, ltable.luaH_get(L, t.value, k));
      api_check(L, L.top <= L.ci.top, "stack overflow");
      return L.stack[L.top - 1].ttnov();
    };
    var lua_rawget = function(L, idx) {
      let t = index2addr(L, idx);
      api_check(L, t.ttistable(t), "table expected");
      lobject.setobj2s(L, L.top - 1, ltable.luaH_get(L, t.value, L.stack[L.top - 1]));
      return L.stack[L.top - 1].ttnov();
    };
    var lua_createtable = function(L, narray, nrec) {
      let t = new lobject.TValue(LUA_TTABLE, ltable.luaH_new(L));
      L.stack[L.top] = t;
      api_incr_top(L);
    };
    var luaS_newudata = function(L, size) {
      return new lobject.Udata(L, size);
    };
    var lua_newuserdata = function(L, size) {
      let u = luaS_newudata(L, size);
      L.stack[L.top] = new lobject.TValue(LUA_TUSERDATA, u);
      api_incr_top(L);
      return u.data;
    };
    var aux_upvalue = function(L, fi, n) {
      fengari_argcheckinteger(n);
      switch (fi.ttype()) {
        case LUA_TCCL: {
          let f = fi.value;
          if (!(1 <= n && n <= f.nupvalues)) return null;
          return {
            name: to_luastring2("", true),
            val: f.upvalue[n - 1]
          };
        }
        case LUA_TLCL: {
          let f = fi.value;
          let p = f.p;
          if (!(1 <= n && n <= p.upvalues.length)) return null;
          let name = p.upvalues[n - 1].name;
          return {
            name: name ? name.getstr() : to_luastring2("(*no name)", true),
            val: f.upvals[n - 1]
          };
        }
        default:
          return null;
      }
    };
    var lua_getupvalue = function(L, funcindex, n) {
      let up = aux_upvalue(L, index2addr(L, funcindex), n);
      if (up) {
        let name = up.name;
        let val = up.val;
        lobject.pushobj2s(L, val);
        api_check(L, L.top <= L.ci.top, "stack overflow");
        return name;
      }
      return null;
    };
    var lua_setupvalue = function(L, funcindex, n) {
      let fi = index2addr(L, funcindex);
      api_checknelems(L, 1);
      let aux = aux_upvalue(L, fi, n);
      if (aux) {
        let name = aux.name;
        let val = aux.val;
        val.setfrom(L.stack[L.top - 1]);
        delete L.stack[--L.top];
        return name;
      }
      return null;
    };
    var lua_newtable = function(L) {
      lua_createtable(L, 0, 0);
    };
    var lua_register = function(L, n, f) {
      lua_pushcfunction(L, f);
      lua_setglobal(L, n);
    };
    var lua_getmetatable = function(L, objindex) {
      let obj = index2addr(L, objindex);
      let mt;
      let res = false;
      switch (obj.ttnov()) {
        case LUA_TTABLE:
        case LUA_TUSERDATA:
          mt = obj.value.metatable;
          break;
        default:
          mt = L.l_G.mt[obj.ttnov()];
          break;
      }
      if (mt !== null && mt !== void 0) {
        L.stack[L.top] = new TValue(LUA_TTABLE, mt);
        api_incr_top(L);
        res = true;
      }
      return res;
    };
    var lua_getuservalue = function(L, idx) {
      let o = index2addr(L, idx);
      api_check(L, o.ttisfulluserdata(), "full userdata expected");
      let uv = o.value.uservalue;
      L.stack[L.top] = new TValue(uv.type, uv.value);
      api_incr_top(L);
      return L.stack[L.top - 1].ttnov();
    };
    var lua_gettable = function(L, idx) {
      let t = index2addr(L, idx);
      lvm.luaV_gettable(L, t, L.stack[L.top - 1], L.top - 1);
      return L.stack[L.top - 1].ttnov();
    };
    var lua_getfield = function(L, idx, k) {
      return auxgetstr(L, index2addr(L, idx), k);
    };
    var lua_geti = function(L, idx, n) {
      let t = index2addr(L, idx);
      fengari_argcheckinteger(n);
      L.stack[L.top] = new TValue(LUA_TNUMINT, n);
      api_incr_top(L);
      lvm.luaV_gettable(L, t, L.stack[L.top - 1], L.top - 1);
      return L.stack[L.top - 1].ttnov();
    };
    var lua_getglobal = function(L, name) {
      return auxgetstr(L, ltable.luaH_getint(L.l_G.l_registry.value, LUA_RIDX_GLOBALS), name);
    };
    var lua_toboolean = function(L, idx) {
      let o = index2addr(L, idx);
      return !o.l_isfalse();
    };
    var lua_tolstring = function(L, idx) {
      let o = index2addr(L, idx);
      if (!o.ttisstring()) {
        if (!lvm.cvt2str(o)) {
          return null;
        }
        lobject.luaO_tostring(L, o);
      }
      return o.svalue();
    };
    var lua_tostring = lua_tolstring;
    var lua_tojsstring = function(L, idx) {
      let o = index2addr(L, idx);
      if (!o.ttisstring()) {
        if (!lvm.cvt2str(o)) {
          return null;
        }
        lobject.luaO_tostring(L, o);
      }
      return o.jsstring();
    };
    var lua_todataview = function(L, idx) {
      let u8 = lua_tolstring(L, idx);
      return new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    };
    var lua_rawlen = function(L, idx) {
      let o = index2addr(L, idx);
      switch (o.ttype()) {
        case LUA_TSHRSTR:
        case LUA_TLNGSTR:
          return o.vslen();
        case LUA_TUSERDATA:
          return o.value.len;
        case LUA_TTABLE:
          return ltable.luaH_getn(o.value);
        default:
          return 0;
      }
    };
    var lua_tocfunction = function(L, idx) {
      let o = index2addr(L, idx);
      if (o.ttislcf() || o.ttisCclosure()) return o.value;
      else return null;
    };
    var lua_tointeger = function(L, idx) {
      let n = lua_tointegerx(L, idx);
      return n === false ? 0 : n;
    };
    var lua_tointegerx = function(L, idx) {
      return lvm.tointeger(index2addr(L, idx));
    };
    var lua_tonumber = function(L, idx) {
      let n = lua_tonumberx(L, idx);
      return n === false ? 0 : n;
    };
    var lua_tonumberx = function(L, idx) {
      return lvm.tonumber(index2addr(L, idx));
    };
    var lua_touserdata = function(L, idx) {
      let o = index2addr(L, idx);
      switch (o.ttnov()) {
        case LUA_TUSERDATA:
          return o.value.data;
        case LUA_TLIGHTUSERDATA:
          return o.value;
        default:
          return null;
      }
    };
    var lua_tothread = function(L, idx) {
      let o = index2addr(L, idx);
      return o.ttisthread() ? o.value : null;
    };
    var lua_topointer = function(L, idx) {
      let o = index2addr(L, idx);
      switch (o.ttype()) {
        case LUA_TTABLE:
        case LUA_TLCL:
        case LUA_TCCL:
        case LUA_TLCF:
        case LUA_TTHREAD:
        case LUA_TUSERDATA:
        /* note: this differs in behaviour to reference lua implementation */
        case LUA_TLIGHTUSERDATA:
          return o.value;
        default:
          return null;
      }
    };
    var seen = /* @__PURE__ */ new WeakMap();
    var lua_isproxy = function(p, L) {
      let G = seen.get(p);
      if (!G)
        return false;
      return L === null || L.l_G === G;
    };
    var create_proxy = function(G, type, value) {
      let proxy = function(L) {
        api_check(L, L instanceof lstate.lua_State && G === L.l_G, "must be from same global state");
        L.stack[L.top] = new TValue(type, value);
        api_incr_top(L);
      };
      seen.set(proxy, G);
      return proxy;
    };
    var lua_toproxy = function(L, idx) {
      let tv = index2addr(L, idx);
      return create_proxy(L.l_G, tv.type, tv.value);
    };
    var lua_compare = function(L, index1, index2, op) {
      let o1 = index2addr(L, index1);
      let o2 = index2addr(L, index2);
      let i = 0;
      if (isvalid(o1) && isvalid(o2)) {
        switch (op) {
          case LUA_OPEQ:
            i = lvm.luaV_equalobj(L, o1, o2);
            break;
          case LUA_OPLT:
            i = lvm.luaV_lessthan(L, o1, o2);
            break;
          case LUA_OPLE:
            i = lvm.luaV_lessequal(L, o1, o2);
            break;
          default:
            api_check(L, false, "invalid option");
        }
      }
      return i;
    };
    var lua_stringtonumber = function(L, s) {
      let tv = new TValue();
      let sz = lobject.luaO_str2num(s, tv);
      if (sz !== 0) {
        L.stack[L.top] = tv;
        api_incr_top(L);
      }
      return sz;
    };
    var f_call = function(L, ud) {
      ldo.luaD_callnoyield(L, ud.funcOff, ud.nresults);
    };
    var lua_type = function(L, idx) {
      let o = index2addr(L, idx);
      return isvalid(o) ? o.ttnov() : LUA_TNONE;
    };
    var lua_typename = function(L, t) {
      api_check(L, LUA_TNONE <= t && t < LUA_NUMTAGS, "invalid tag");
      return ltm.ttypename(t);
    };
    var lua_iscfunction = function(L, idx) {
      let o = index2addr(L, idx);
      return o.ttislcf(o) || o.ttisCclosure();
    };
    var lua_isnil = function(L, n) {
      return lua_type(L, n) === LUA_TNIL;
    };
    var lua_isboolean = function(L, n) {
      return lua_type(L, n) === LUA_TBOOLEAN;
    };
    var lua_isnone = function(L, n) {
      return lua_type(L, n) === LUA_TNONE;
    };
    var lua_isnoneornil = function(L, n) {
      return lua_type(L, n) <= 0;
    };
    var lua_istable = function(L, idx) {
      return index2addr(L, idx).ttistable();
    };
    var lua_isinteger = function(L, idx) {
      return index2addr(L, idx).ttisinteger();
    };
    var lua_isnumber = function(L, idx) {
      return lvm.tonumber(index2addr(L, idx)) !== false;
    };
    var lua_isstring = function(L, idx) {
      let o = index2addr(L, idx);
      return o.ttisstring() || lvm.cvt2str(o);
    };
    var lua_isuserdata = function(L, idx) {
      let o = index2addr(L, idx);
      return o.ttisfulluserdata(o) || o.ttislightuserdata();
    };
    var lua_isthread = function(L, idx) {
      return lua_type(L, idx) === LUA_TTHREAD;
    };
    var lua_isfunction = function(L, idx) {
      return lua_type(L, idx) === LUA_TFUNCTION;
    };
    var lua_islightuserdata = function(L, idx) {
      return lua_type(L, idx) === LUA_TLIGHTUSERDATA;
    };
    var lua_rawequal = function(L, index1, index2) {
      let o1 = index2addr(L, index1);
      let o2 = index2addr(L, index2);
      return isvalid(o1) && isvalid(o2) ? lvm.luaV_equalobj(null, o1, o2) : 0;
    };
    var lua_arith = function(L, op) {
      if (op !== LUA_OPUNM && op !== LUA_OPBNOT)
        api_checknelems(L, 2);
      else {
        api_checknelems(L, 1);
        lobject.pushobj2s(L, L.stack[L.top - 1]);
        api_check(L, L.top <= L.ci.top, "stack overflow");
      }
      lobject.luaO_arith(L, op, L.stack[L.top - 2], L.stack[L.top - 1], L.stack[L.top - 2]);
      delete L.stack[--L.top];
    };
    var default_chunkname = to_luastring2("?");
    var lua_load = function(L, reader, data, chunkname, mode) {
      if (!chunkname) chunkname = default_chunkname;
      else chunkname = from_userstring(chunkname);
      if (mode !== null) mode = from_userstring(mode);
      let z = new ZIO(L, reader, data);
      let status = ldo.luaD_protectedparser(L, z, chunkname, mode);
      if (status === LUA_OK) {
        let f = L.stack[L.top - 1].value;
        if (f.nupvalues >= 1) {
          let gt = ltable.luaH_getint(L.l_G.l_registry.value, LUA_RIDX_GLOBALS);
          f.upvals[0].setfrom(gt);
        }
      }
      return status;
    };
    var lua_dump = function(L, writer, data, strip) {
      api_checknelems(L, 1);
      let o = L.stack[L.top - 1];
      if (o.ttisLclosure())
        return luaU_dump(L, o.value.p, writer, data, strip);
      return 1;
    };
    var lua_status = function(L) {
      return L.status;
    };
    var lua_setuservalue = function(L, idx) {
      api_checknelems(L, 1);
      let o = index2addr(L, idx);
      api_check(L, o.ttisfulluserdata(), "full userdata expected");
      o.value.uservalue.setfrom(L.stack[L.top - 1]);
      delete L.stack[--L.top];
    };
    var checkresults = function(L, na, nr) {
      api_check(
        L,
        nr === LUA_MULTRET || L.ci.top - L.top >= nr - na,
        "results from function overflow current stack size"
      );
    };
    var lua_callk = function(L, nargs, nresults, ctx, k) {
      api_check(L, k === null || !(L.ci.callstatus & lstate.CIST_LUA), "cannot use continuations inside hooks");
      api_checknelems(L, nargs + 1);
      api_check(L, L.status === LUA_OK, "cannot do calls on non-normal thread");
      checkresults(L, nargs, nresults);
      let func = L.top - (nargs + 1);
      if (k !== null && L.nny === 0) {
        L.ci.c_k = k;
        L.ci.c_ctx = ctx;
        ldo.luaD_call(L, func, nresults);
      } else {
        ldo.luaD_callnoyield(L, func, nresults);
      }
      if (nresults === LUA_MULTRET && L.ci.top < L.top)
        L.ci.top = L.top;
    };
    var lua_call = function(L, n, r) {
      lua_callk(L, n, r, 0, null);
    };
    var lua_pcallk = function(L, nargs, nresults, errfunc, ctx, k) {
      api_check(L, k === null || !(L.ci.callstatus & lstate.CIST_LUA), "cannot use continuations inside hooks");
      api_checknelems(L, nargs + 1);
      api_check(L, L.status === LUA_OK, "cannot do calls on non-normal thread");
      checkresults(L, nargs, nresults);
      let status;
      let func;
      if (errfunc === 0)
        func = 0;
      else {
        func = index2addr_(L, errfunc);
      }
      let funcOff = L.top - (nargs + 1);
      if (k === null || L.nny > 0) {
        let c = {
          funcOff,
          nresults
          /* do a 'conventional' protected call */
        };
        status = ldo.luaD_pcall(L, f_call, c, funcOff, func);
      } else {
        let ci = L.ci;
        ci.c_k = k;
        ci.c_ctx = ctx;
        ci.extra = funcOff;
        ci.c_old_errfunc = L.errfunc;
        L.errfunc = func;
        ci.callstatus &= ~lstate.CIST_OAH | L.allowhook;
        ci.callstatus |= lstate.CIST_YPCALL;
        ldo.luaD_call(L, funcOff, nresults);
        ci.callstatus &= ~lstate.CIST_YPCALL;
        L.errfunc = ci.c_old_errfunc;
        status = LUA_OK;
      }
      if (nresults === LUA_MULTRET && L.ci.top < L.top)
        L.ci.top = L.top;
      return status;
    };
    var lua_pcall = function(L, n, r, f) {
      return lua_pcallk(L, n, r, f, 0, null);
    };
    var lua_error = function(L) {
      api_checknelems(L, 1);
      ldebug.luaG_errormsg(L);
    };
    var lua_next = function(L, idx) {
      let t = index2addr(L, idx);
      api_check(L, t.ttistable(), "table expected");
      L.stack[L.top] = new TValue();
      let more = ltable.luaH_next(L, t.value, L.top - 1);
      if (more) {
        api_incr_top(L);
        return 1;
      } else {
        delete L.stack[L.top];
        delete L.stack[--L.top];
        return 0;
      }
    };
    var lua_concat = function(L, n) {
      api_checknelems(L, n);
      if (n >= 2)
        lvm.luaV_concat(L, n);
      else if (n === 0) {
        lobject.pushsvalue2s(L, luaS_bless(L, to_luastring2("", true)));
        api_check(L, L.top <= L.ci.top, "stack overflow");
      }
    };
    var lua_len = function(L, idx) {
      let t = index2addr(L, idx);
      let tv = new TValue();
      lvm.luaV_objlen(L, tv, t);
      L.stack[L.top] = tv;
      api_incr_top(L);
    };
    var getupvalref = function(L, fidx, n) {
      let fi = index2addr(L, fidx);
      api_check(L, fi.ttisLclosure(), "Lua function expected");
      let f = fi.value;
      fengari_argcheckinteger(n);
      api_check(L, 1 <= n && n <= f.p.upvalues.length, "invalid upvalue index");
      return {
        f,
        i: n - 1
      };
    };
    var lua_upvalueid = function(L, fidx, n) {
      let fi = index2addr(L, fidx);
      switch (fi.ttype()) {
        case LUA_TLCL: {
          let ref = getupvalref(L, fidx, n);
          return ref.f.upvals[ref.i];
        }
        case LUA_TCCL: {
          let f = fi.value;
          api_check(L, (n | 0) === n && n > 0 && n <= f.nupvalues, "invalid upvalue index");
          return f.upvalue[n - 1];
        }
        default: {
          api_check(L, false, "closure expected");
          return null;
        }
      }
    };
    var lua_upvaluejoin = function(L, fidx1, n1, fidx2, n2) {
      let ref1 = getupvalref(L, fidx1, n1);
      let ref2 = getupvalref(L, fidx2, n2);
      let up2 = ref2.f.upvals[ref2.i];
      ref1.f.upvals[ref1.i] = up2;
    };
    var lua_gc = function() {
    };
    var lua_getallocf = function() {
      console.warn("lua_getallocf is not available");
      return 0;
    };
    var lua_setallocf = function() {
      console.warn("lua_setallocf is not available");
      return 0;
    };
    var lua_getextraspace = function() {
      console.warn("lua_getextraspace is not available");
      return 0;
    };
    module.exports.api_incr_top = api_incr_top;
    module.exports.api_checknelems = api_checknelems;
    module.exports.lua_absindex = lua_absindex;
    module.exports.lua_arith = lua_arith;
    module.exports.lua_atpanic = lua_atpanic;
    module.exports.lua_atnativeerror = lua_atnativeerror;
    module.exports.lua_call = lua_call;
    module.exports.lua_callk = lua_callk;
    module.exports.lua_checkstack = lua_checkstack;
    module.exports.lua_compare = lua_compare;
    module.exports.lua_concat = lua_concat;
    module.exports.lua_copy = lua_copy;
    module.exports.lua_createtable = lua_createtable;
    module.exports.lua_dump = lua_dump;
    module.exports.lua_error = lua_error;
    module.exports.lua_gc = lua_gc;
    module.exports.lua_getallocf = lua_getallocf;
    module.exports.lua_getextraspace = lua_getextraspace;
    module.exports.lua_getfield = lua_getfield;
    module.exports.lua_getglobal = lua_getglobal;
    module.exports.lua_geti = lua_geti;
    module.exports.lua_getmetatable = lua_getmetatable;
    module.exports.lua_gettable = lua_gettable;
    module.exports.lua_gettop = lua_gettop;
    module.exports.lua_getupvalue = lua_getupvalue;
    module.exports.lua_getuservalue = lua_getuservalue;
    module.exports.lua_insert = lua_insert;
    module.exports.lua_isboolean = lua_isboolean;
    module.exports.lua_iscfunction = lua_iscfunction;
    module.exports.lua_isfunction = lua_isfunction;
    module.exports.lua_isinteger = lua_isinteger;
    module.exports.lua_islightuserdata = lua_islightuserdata;
    module.exports.lua_isnil = lua_isnil;
    module.exports.lua_isnone = lua_isnone;
    module.exports.lua_isnoneornil = lua_isnoneornil;
    module.exports.lua_isnumber = lua_isnumber;
    module.exports.lua_isproxy = lua_isproxy;
    module.exports.lua_isstring = lua_isstring;
    module.exports.lua_istable = lua_istable;
    module.exports.lua_isthread = lua_isthread;
    module.exports.lua_isuserdata = lua_isuserdata;
    module.exports.lua_len = lua_len;
    module.exports.lua_load = lua_load;
    module.exports.lua_newtable = lua_newtable;
    module.exports.lua_newuserdata = lua_newuserdata;
    module.exports.lua_next = lua_next;
    module.exports.lua_pcall = lua_pcall;
    module.exports.lua_pcallk = lua_pcallk;
    module.exports.lua_pop = lua_pop;
    module.exports.lua_pushboolean = lua_pushboolean;
    module.exports.lua_pushcclosure = lua_pushcclosure;
    module.exports.lua_pushcfunction = lua_pushcfunction;
    module.exports.lua_pushfstring = lua_pushfstring;
    module.exports.lua_pushglobaltable = lua_pushglobaltable;
    module.exports.lua_pushinteger = lua_pushinteger;
    module.exports.lua_pushjsclosure = lua_pushjsclosure;
    module.exports.lua_pushjsfunction = lua_pushjsfunction;
    module.exports.lua_pushlightuserdata = lua_pushlightuserdata;
    module.exports.lua_pushliteral = lua_pushliteral;
    module.exports.lua_pushlstring = lua_pushlstring;
    module.exports.lua_pushnil = lua_pushnil;
    module.exports.lua_pushnumber = lua_pushnumber;
    module.exports.lua_pushstring = lua_pushstring;
    module.exports.lua_pushthread = lua_pushthread;
    module.exports.lua_pushvalue = lua_pushvalue;
    module.exports.lua_pushvfstring = lua_pushvfstring;
    module.exports.lua_rawequal = lua_rawequal;
    module.exports.lua_rawget = lua_rawget;
    module.exports.lua_rawgeti = lua_rawgeti;
    module.exports.lua_rawgetp = lua_rawgetp;
    module.exports.lua_rawlen = lua_rawlen;
    module.exports.lua_rawset = lua_rawset;
    module.exports.lua_rawseti = lua_rawseti;
    module.exports.lua_rawsetp = lua_rawsetp;
    module.exports.lua_register = lua_register;
    module.exports.lua_remove = lua_remove;
    module.exports.lua_replace = lua_replace;
    module.exports.lua_rotate = lua_rotate;
    module.exports.lua_setallocf = lua_setallocf;
    module.exports.lua_setfield = lua_setfield;
    module.exports.lua_setglobal = lua_setglobal;
    module.exports.lua_seti = lua_seti;
    module.exports.lua_setmetatable = lua_setmetatable;
    module.exports.lua_settable = lua_settable;
    module.exports.lua_settop = lua_settop;
    module.exports.lua_setupvalue = lua_setupvalue;
    module.exports.lua_setuservalue = lua_setuservalue;
    module.exports.lua_status = lua_status;
    module.exports.lua_stringtonumber = lua_stringtonumber;
    module.exports.lua_toboolean = lua_toboolean;
    module.exports.lua_tocfunction = lua_tocfunction;
    module.exports.lua_todataview = lua_todataview;
    module.exports.lua_tointeger = lua_tointeger;
    module.exports.lua_tointegerx = lua_tointegerx;
    module.exports.lua_tojsstring = lua_tojsstring;
    module.exports.lua_tolstring = lua_tolstring;
    module.exports.lua_tonumber = lua_tonumber;
    module.exports.lua_tonumberx = lua_tonumberx;
    module.exports.lua_topointer = lua_topointer;
    module.exports.lua_toproxy = lua_toproxy;
    module.exports.lua_tostring = lua_tostring;
    module.exports.lua_tothread = lua_tothread;
    module.exports.lua_touserdata = lua_touserdata;
    module.exports.lua_type = lua_type;
    module.exports.lua_typename = lua_typename;
    module.exports.lua_upvalueid = lua_upvalueid;
    module.exports.lua_upvaluejoin = lua_upvaluejoin;
    module.exports.lua_version = lua_version;
    module.exports.lua_xmove = lua_xmove;
  }
});

// vendor/fengari/src/lua.js
var require_lua = __commonJS({
  "vendor/fengari/src/lua.js"(exports, module) {
    "use strict";
    var defs = require_defs();
    var lapi = require_lapi();
    var ldebug = require_ldebug();
    var ldo = require_ldo();
    var lstate = require_lstate();
    module.exports.LUA_AUTHORS = defs.LUA_AUTHORS;
    module.exports.LUA_COPYRIGHT = defs.LUA_COPYRIGHT;
    module.exports.LUA_ERRERR = defs.thread_status.LUA_ERRERR;
    module.exports.LUA_ERRGCMM = defs.thread_status.LUA_ERRGCMM;
    module.exports.LUA_ERRMEM = defs.thread_status.LUA_ERRMEM;
    module.exports.LUA_ERRRUN = defs.thread_status.LUA_ERRRUN;
    module.exports.LUA_ERRSYNTAX = defs.thread_status.LUA_ERRSYNTAX;
    module.exports.LUA_HOOKCALL = defs.LUA_HOOKCALL;
    module.exports.LUA_HOOKCOUNT = defs.LUA_HOOKCOUNT;
    module.exports.LUA_HOOKLINE = defs.LUA_HOOKLINE;
    module.exports.LUA_HOOKRET = defs.LUA_HOOKRET;
    module.exports.LUA_HOOKTAILCALL = defs.LUA_HOOKTAILCALL;
    module.exports.LUA_MASKCALL = defs.LUA_MASKCALL;
    module.exports.LUA_MASKCOUNT = defs.LUA_MASKCOUNT;
    module.exports.LUA_MASKLINE = defs.LUA_MASKLINE;
    module.exports.LUA_MASKRET = defs.LUA_MASKRET;
    module.exports.LUA_MINSTACK = defs.LUA_MINSTACK;
    module.exports.LUA_MULTRET = defs.LUA_MULTRET;
    module.exports.LUA_NUMTAGS = defs.constant_types.LUA_NUMTAGS;
    module.exports.LUA_OK = defs.thread_status.LUA_OK;
    module.exports.LUA_OPADD = defs.LUA_OPADD;
    module.exports.LUA_OPBAND = defs.LUA_OPBAND;
    module.exports.LUA_OPBNOT = defs.LUA_OPBNOT;
    module.exports.LUA_OPBOR = defs.LUA_OPBOR;
    module.exports.LUA_OPBXOR = defs.LUA_OPBXOR;
    module.exports.LUA_OPDIV = defs.LUA_OPDIV;
    module.exports.LUA_OPEQ = defs.LUA_OPEQ;
    module.exports.LUA_OPIDIV = defs.LUA_OPIDIV;
    module.exports.LUA_OPLE = defs.LUA_OPLE;
    module.exports.LUA_OPLT = defs.LUA_OPLT;
    module.exports.LUA_OPMOD = defs.LUA_OPMOD;
    module.exports.LUA_OPMUL = defs.LUA_OPMUL;
    module.exports.LUA_OPPOW = defs.LUA_OPPOW;
    module.exports.LUA_OPSHL = defs.LUA_OPSHL;
    module.exports.LUA_OPSHR = defs.LUA_OPSHR;
    module.exports.LUA_OPSUB = defs.LUA_OPSUB;
    module.exports.LUA_OPUNM = defs.LUA_OPUNM;
    module.exports.LUA_REGISTRYINDEX = defs.LUA_REGISTRYINDEX;
    module.exports.LUA_RELEASE = defs.LUA_RELEASE;
    module.exports.LUA_RIDX_GLOBALS = defs.LUA_RIDX_GLOBALS;
    module.exports.LUA_RIDX_LAST = defs.LUA_RIDX_LAST;
    module.exports.LUA_RIDX_MAINTHREAD = defs.LUA_RIDX_MAINTHREAD;
    module.exports.LUA_SIGNATURE = defs.LUA_SIGNATURE;
    module.exports.LUA_TNONE = defs.constant_types.LUA_TNONE;
    module.exports.LUA_TNIL = defs.constant_types.LUA_TNIL;
    module.exports.LUA_TBOOLEAN = defs.constant_types.LUA_TBOOLEAN;
    module.exports.LUA_TLIGHTUSERDATA = defs.constant_types.LUA_TLIGHTUSERDATA;
    module.exports.LUA_TNUMBER = defs.constant_types.LUA_TNUMBER;
    module.exports.LUA_TSTRING = defs.constant_types.LUA_TSTRING;
    module.exports.LUA_TTABLE = defs.constant_types.LUA_TTABLE;
    module.exports.LUA_TFUNCTION = defs.constant_types.LUA_TFUNCTION;
    module.exports.LUA_TUSERDATA = defs.constant_types.LUA_TUSERDATA;
    module.exports.LUA_TTHREAD = defs.constant_types.LUA_TTHREAD;
    module.exports.LUA_VERSION = defs.LUA_VERSION;
    module.exports.LUA_VERSION_MAJOR = defs.LUA_VERSION_MAJOR;
    module.exports.LUA_VERSION_MINOR = defs.LUA_VERSION_MINOR;
    module.exports.LUA_VERSION_NUM = defs.LUA_VERSION_NUM;
    module.exports.LUA_VERSION_RELEASE = defs.LUA_VERSION_RELEASE;
    module.exports.LUA_YIELD = defs.thread_status.LUA_YIELD;
    module.exports.lua_Debug = defs.lua_Debug;
    module.exports.lua_upvalueindex = defs.lua_upvalueindex;
    module.exports.lua_absindex = lapi.lua_absindex;
    module.exports.lua_arith = lapi.lua_arith;
    module.exports.lua_atpanic = lapi.lua_atpanic;
    module.exports.lua_atnativeerror = lapi.lua_atnativeerror;
    module.exports.lua_call = lapi.lua_call;
    module.exports.lua_callk = lapi.lua_callk;
    module.exports.lua_checkstack = lapi.lua_checkstack;
    module.exports.lua_close = lstate.lua_close;
    module.exports.lua_compare = lapi.lua_compare;
    module.exports.lua_concat = lapi.lua_concat;
    module.exports.lua_copy = lapi.lua_copy;
    module.exports.lua_createtable = lapi.lua_createtable;
    module.exports.lua_dump = lapi.lua_dump;
    module.exports.lua_error = lapi.lua_error;
    module.exports.lua_gc = lapi.lua_gc;
    module.exports.lua_getallocf = lapi.lua_getallocf;
    module.exports.lua_getextraspace = lapi.lua_getextraspace;
    module.exports.lua_getfield = lapi.lua_getfield;
    module.exports.lua_getglobal = lapi.lua_getglobal;
    module.exports.lua_gethook = ldebug.lua_gethook;
    module.exports.lua_gethookcount = ldebug.lua_gethookcount;
    module.exports.lua_gethookmask = ldebug.lua_gethookmask;
    module.exports.lua_geti = lapi.lua_geti;
    module.exports.lua_getinfo = ldebug.lua_getinfo;
    module.exports.lua_getlocal = ldebug.lua_getlocal;
    module.exports.lua_getmetatable = lapi.lua_getmetatable;
    module.exports.lua_getstack = ldebug.lua_getstack;
    module.exports.lua_gettable = lapi.lua_gettable;
    module.exports.lua_gettop = lapi.lua_gettop;
    module.exports.lua_getupvalue = lapi.lua_getupvalue;
    module.exports.lua_getuservalue = lapi.lua_getuservalue;
    module.exports.lua_insert = lapi.lua_insert;
    module.exports.lua_isboolean = lapi.lua_isboolean;
    module.exports.lua_iscfunction = lapi.lua_iscfunction;
    module.exports.lua_isfunction = lapi.lua_isfunction;
    module.exports.lua_isinteger = lapi.lua_isinteger;
    module.exports.lua_islightuserdata = lapi.lua_islightuserdata;
    module.exports.lua_isnil = lapi.lua_isnil;
    module.exports.lua_isnone = lapi.lua_isnone;
    module.exports.lua_isnoneornil = lapi.lua_isnoneornil;
    module.exports.lua_isnumber = lapi.lua_isnumber;
    module.exports.lua_isproxy = lapi.lua_isproxy;
    module.exports.lua_isstring = lapi.lua_isstring;
    module.exports.lua_istable = lapi.lua_istable;
    module.exports.lua_isthread = lapi.lua_isthread;
    module.exports.lua_isuserdata = lapi.lua_isuserdata;
    module.exports.lua_isyieldable = ldo.lua_isyieldable;
    module.exports.lua_len = lapi.lua_len;
    module.exports.lua_load = lapi.lua_load;
    module.exports.lua_newstate = lstate.lua_newstate;
    module.exports.lua_newtable = lapi.lua_newtable;
    module.exports.lua_newthread = lstate.lua_newthread;
    module.exports.lua_newuserdata = lapi.lua_newuserdata;
    module.exports.lua_next = lapi.lua_next;
    module.exports.lua_pcall = lapi.lua_pcall;
    module.exports.lua_pcallk = lapi.lua_pcallk;
    module.exports.lua_pop = lapi.lua_pop;
    module.exports.lua_pushboolean = lapi.lua_pushboolean;
    module.exports.lua_pushcclosure = lapi.lua_pushcclosure;
    module.exports.lua_pushcfunction = lapi.lua_pushcfunction;
    module.exports.lua_pushfstring = lapi.lua_pushfstring;
    module.exports.lua_pushglobaltable = lapi.lua_pushglobaltable;
    module.exports.lua_pushinteger = lapi.lua_pushinteger;
    module.exports.lua_pushjsclosure = lapi.lua_pushjsclosure;
    module.exports.lua_pushjsfunction = lapi.lua_pushjsfunction;
    module.exports.lua_pushlightuserdata = lapi.lua_pushlightuserdata;
    module.exports.lua_pushliteral = lapi.lua_pushliteral;
    module.exports.lua_pushlstring = lapi.lua_pushlstring;
    module.exports.lua_pushnil = lapi.lua_pushnil;
    module.exports.lua_pushnumber = lapi.lua_pushnumber;
    module.exports.lua_pushstring = lapi.lua_pushstring;
    module.exports.lua_pushthread = lapi.lua_pushthread;
    module.exports.lua_pushvalue = lapi.lua_pushvalue;
    module.exports.lua_pushvfstring = lapi.lua_pushvfstring;
    module.exports.lua_rawequal = lapi.lua_rawequal;
    module.exports.lua_rawget = lapi.lua_rawget;
    module.exports.lua_rawgeti = lapi.lua_rawgeti;
    module.exports.lua_rawgetp = lapi.lua_rawgetp;
    module.exports.lua_rawlen = lapi.lua_rawlen;
    module.exports.lua_rawset = lapi.lua_rawset;
    module.exports.lua_rawseti = lapi.lua_rawseti;
    module.exports.lua_rawsetp = lapi.lua_rawsetp;
    module.exports.lua_register = lapi.lua_register;
    module.exports.lua_remove = lapi.lua_remove;
    module.exports.lua_replace = lapi.lua_replace;
    module.exports.lua_resume = ldo.lua_resume;
    module.exports.lua_rotate = lapi.lua_rotate;
    module.exports.lua_setallocf = lapi.lua_setallocf;
    module.exports.lua_setfield = lapi.lua_setfield;
    module.exports.lua_setglobal = lapi.lua_setglobal;
    module.exports.lua_sethook = ldebug.lua_sethook;
    module.exports.lua_seti = lapi.lua_seti;
    module.exports.lua_setlocal = ldebug.lua_setlocal;
    module.exports.lua_setmetatable = lapi.lua_setmetatable;
    module.exports.lua_settable = lapi.lua_settable;
    module.exports.lua_settop = lapi.lua_settop;
    module.exports.lua_setupvalue = lapi.lua_setupvalue;
    module.exports.lua_setuservalue = lapi.lua_setuservalue;
    module.exports.lua_status = lapi.lua_status;
    module.exports.lua_stringtonumber = lapi.lua_stringtonumber;
    module.exports.lua_toboolean = lapi.lua_toboolean;
    module.exports.lua_todataview = lapi.lua_todataview;
    module.exports.lua_tointeger = lapi.lua_tointeger;
    module.exports.lua_tointegerx = lapi.lua_tointegerx;
    module.exports.lua_tojsstring = lapi.lua_tojsstring;
    module.exports.lua_tolstring = lapi.lua_tolstring;
    module.exports.lua_tonumber = lapi.lua_tonumber;
    module.exports.lua_tonumberx = lapi.lua_tonumberx;
    module.exports.lua_topointer = lapi.lua_topointer;
    module.exports.lua_toproxy = lapi.lua_toproxy;
    module.exports.lua_tostring = lapi.lua_tostring;
    module.exports.lua_tothread = lapi.lua_tothread;
    module.exports.lua_touserdata = lapi.lua_touserdata;
    module.exports.lua_type = lapi.lua_type;
    module.exports.lua_typename = lapi.lua_typename;
    module.exports.lua_upvalueid = lapi.lua_upvalueid;
    module.exports.lua_upvaluejoin = lapi.lua_upvaluejoin;
    module.exports.lua_version = lapi.lua_version;
    module.exports.lua_xmove = lapi.lua_xmove;
    module.exports.lua_yield = ldo.lua_yield;
    module.exports.lua_yieldk = ldo.lua_yieldk;
    module.exports.lua_tocfunction = lapi.lua_tocfunction;
  }
});

// vendor/fengari/src/lauxlib.js
var require_lauxlib = __commonJS({
  "vendor/fengari/src/lauxlib.js"(exports, module) {
    "use strict";
    var {
      LUAL_BUFFERSIZE
    } = require_luaconf();
    var {
      LUA_ERRERR,
      LUA_MULTRET,
      LUA_REGISTRYINDEX,
      LUA_SIGNATURE,
      LUA_TBOOLEAN,
      LUA_TLIGHTUSERDATA,
      LUA_TNIL,
      LUA_TNONE,
      LUA_TNUMBER,
      LUA_TSTRING,
      LUA_TTABLE,
      LUA_VERSION_NUM,
      lua_Debug,
      lua_absindex,
      lua_atpanic,
      lua_call,
      lua_checkstack,
      lua_concat,
      lua_copy,
      lua_createtable,
      lua_error,
      lua_getfield,
      lua_getinfo,
      lua_getmetatable,
      lua_getstack,
      lua_gettop,
      lua_insert,
      lua_isinteger,
      lua_isnil,
      lua_isnumber,
      lua_isstring,
      lua_istable,
      lua_len,
      lua_load,
      lua_newstate,
      lua_newtable,
      lua_next,
      lua_pcall,
      lua_pop,
      lua_pushboolean,
      lua_pushcclosure,
      lua_pushcfunction,
      lua_pushfstring,
      lua_pushinteger,
      lua_pushliteral,
      lua_pushlstring,
      lua_pushnil,
      lua_pushstring,
      lua_pushvalue,
      lua_pushvfstring,
      lua_rawequal,
      lua_rawget,
      lua_rawgeti,
      lua_rawlen,
      lua_rawseti,
      lua_remove,
      lua_setfield,
      lua_setglobal,
      lua_setmetatable,
      lua_settop,
      lua_toboolean,
      lua_tointeger,
      lua_tointegerx,
      lua_tojsstring,
      lua_tolstring,
      lua_tonumber,
      lua_tonumberx,
      lua_topointer,
      lua_tostring,
      lua_touserdata,
      lua_type,
      lua_typename,
      lua_version
    } = require_lua();
    var {
      from_userstring,
      luastring_eq,
      to_luastring: to_luastring2,
      to_uristring
    } = require_fengaricore();
    var LUA_ERRFILE = LUA_ERRERR + 1;
    var LUA_LOADED_TABLE = to_luastring2("_LOADED");
    var LUA_PRELOAD_TABLE = to_luastring2("_PRELOAD");
    var LUA_FILEHANDLE = to_luastring2("FILE*");
    var LUAL_NUMSIZES = 4 * 16 + 8;
    var __name = to_luastring2("__name");
    var __tostring = to_luastring2("__tostring");
    var empty = new Uint8Array(0);
    var luaL_Buffer = class {
      constructor() {
        this.L = null;
        this.b = empty;
        this.n = 0;
      }
    };
    var LEVELS1 = 10;
    var LEVELS2 = 11;
    var findfield = function(L, objidx, level) {
      if (level === 0 || !lua_istable(L, -1))
        return 0;
      lua_pushnil(L);
      while (lua_next(L, -2)) {
        if (lua_type(L, -2) === LUA_TSTRING) {
          if (lua_rawequal(L, objidx, -1)) {
            lua_pop(L, 1);
            return 1;
          } else if (findfield(L, objidx, level - 1)) {
            lua_remove(L, -2);
            lua_pushliteral(L, ".");
            lua_insert(L, -2);
            lua_concat(L, 3);
            return 1;
          }
        }
        lua_pop(L, 1);
      }
      return 0;
    };
    var pushglobalfuncname = function(L, ar) {
      let top = lua_gettop(L);
      lua_getinfo(L, to_luastring2("f"), ar);
      lua_getfield(L, LUA_REGISTRYINDEX, LUA_LOADED_TABLE);
      if (findfield(L, top + 1, 2)) {
        let name = lua_tostring(L, -1);
        if (name[0] === 95 && name[1] === 71 && name[2] === 46) {
          lua_pushstring(L, name.subarray(3));
          lua_remove(L, -2);
        }
        lua_copy(L, -1, top + 1);
        lua_pop(L, 2);
        return 1;
      } else {
        lua_settop(L, top);
        return 0;
      }
    };
    var pushfuncname = function(L, ar) {
      if (pushglobalfuncname(L, ar)) {
        lua_pushfstring(L, to_luastring2("function '%s'"), lua_tostring(L, -1));
        lua_remove(L, -2);
      } else if (ar.namewhat.length !== 0)
        lua_pushfstring(L, to_luastring2("%s '%s'"), ar.namewhat, ar.name);
      else if (ar.what && ar.what[0] === 109)
        lua_pushliteral(L, "main chunk");
      else if (ar.what && ar.what[0] === 76)
        lua_pushfstring(L, to_luastring2("function <%s:%d>"), ar.short_src, ar.linedefined);
      else
        lua_pushliteral(L, "?");
    };
    var lastlevel = function(L) {
      let ar = new lua_Debug();
      let li = 1;
      let le = 1;
      while (lua_getstack(L, le, ar)) {
        li = le;
        le *= 2;
      }
      while (li < le) {
        let m = Math.floor((li + le) / 2);
        if (lua_getstack(L, m, ar)) li = m + 1;
        else le = m;
      }
      return le - 1;
    };
    var luaL_traceback = function(L, L1, msg, level) {
      let ar = new lua_Debug();
      let top = lua_gettop(L);
      let last = lastlevel(L1);
      let n1 = last - level > LEVELS1 + LEVELS2 ? LEVELS1 : -1;
      if (msg)
        lua_pushfstring(L, to_luastring2("%s\n"), msg);
      luaL_checkstack(L, 10, null);
      lua_pushliteral(L, "stack traceback:");
      while (lua_getstack(L1, level++, ar)) {
        if (n1-- === 0) {
          lua_pushliteral(L, "\n	...");
          level = last - LEVELS2 + 1;
        } else {
          lua_getinfo(L1, to_luastring2("Slnt", true), ar);
          lua_pushfstring(L, to_luastring2("\n	%s:"), ar.short_src);
          if (ar.currentline > 0)
            lua_pushliteral(L, `${ar.currentline}:`);
          lua_pushliteral(L, " in ");
          pushfuncname(L, ar);
          if (ar.istailcall)
            lua_pushliteral(L, "\n	(...tail calls..)");
          lua_concat(L, lua_gettop(L) - top);
        }
      }
      lua_concat(L, lua_gettop(L) - top);
    };
    var panic = function(L) {
      let msg = "PANIC: unprotected error in call to Lua API (" + lua_tojsstring(L, -1) + ")";
      throw new Error(msg);
    };
    var luaL_argerror = function(L, arg, extramsg) {
      let ar = new lua_Debug();
      if (!lua_getstack(L, 0, ar))
        return luaL_error(L, to_luastring2("bad argument #%d (%s)"), arg, extramsg);
      lua_getinfo(L, to_luastring2("n"), ar);
      if (luastring_eq(ar.namewhat, to_luastring2("method"))) {
        arg--;
        if (arg === 0)
          return luaL_error(L, to_luastring2("calling '%s' on bad self (%s)"), ar.name, extramsg);
      }
      if (ar.name === null)
        ar.name = pushglobalfuncname(L, ar) ? lua_tostring(L, -1) : to_luastring2("?");
      return luaL_error(L, to_luastring2("bad argument #%d to '%s' (%s)"), arg, ar.name, extramsg);
    };
    var typeerror = function(L, arg, tname) {
      let typearg;
      if (luaL_getmetafield(L, arg, __name) === LUA_TSTRING)
        typearg = lua_tostring(L, -1);
      else if (lua_type(L, arg) === LUA_TLIGHTUSERDATA)
        typearg = to_luastring2("light userdata", true);
      else
        typearg = luaL_typename(L, arg);
      let msg = lua_pushfstring(L, to_luastring2("%s expected, got %s"), tname, typearg);
      return luaL_argerror(L, arg, msg);
    };
    var luaL_where = function(L, level) {
      let ar = new lua_Debug();
      if (lua_getstack(L, level, ar)) {
        lua_getinfo(L, to_luastring2("Sl", true), ar);
        if (ar.currentline > 0) {
          lua_pushfstring(L, to_luastring2("%s:%d: "), ar.short_src, ar.currentline);
          return;
        }
      }
      lua_pushstring(L, to_luastring2(""));
    };
    var luaL_error = function(L, fmt, ...argp) {
      luaL_where(L, 1);
      lua_pushvfstring(L, fmt, argp);
      lua_concat(L, 2);
      return lua_error(L);
    };
    var luaL_fileresult = function(L, stat, fname, e) {
      if (stat) {
        lua_pushboolean(L, 1);
        return 1;
      } else {
        lua_pushnil(L);
        let message, errno;
        if (e) {
          message = e.message;
          errno = -e.errno;
        } else {
          message = "Success";
          errno = 0;
        }
        if (fname)
          lua_pushfstring(L, to_luastring2("%s: %s"), fname, to_luastring2(message));
        else
          lua_pushstring(L, to_luastring2(message));
        lua_pushinteger(L, errno);
        return 3;
      }
    };
    var luaL_execresult = function(L, e) {
      let what, stat;
      if (e === null) {
        lua_pushboolean(L, 1);
        lua_pushliteral(L, "exit");
        lua_pushinteger(L, 0);
        return 3;
      } else if (e.status) {
        what = "exit";
        stat = e.status;
      } else if (e.signal) {
        what = "signal";
        stat = e.signal;
      } else {
        return luaL_fileresult(L, 0, null, e);
      }
      lua_pushnil(L);
      lua_pushliteral(L, what);
      lua_pushinteger(L, stat);
      return 3;
    };
    var luaL_getmetatable = function(L, n) {
      return lua_getfield(L, LUA_REGISTRYINDEX, n);
    };
    var luaL_newmetatable = function(L, tname) {
      if (luaL_getmetatable(L, tname) !== LUA_TNIL)
        return 0;
      lua_pop(L, 1);
      lua_createtable(L, 0, 2);
      lua_pushstring(L, tname);
      lua_setfield(L, -2, __name);
      lua_pushvalue(L, -1);
      lua_setfield(L, LUA_REGISTRYINDEX, tname);
      return 1;
    };
    var luaL_setmetatable = function(L, tname) {
      luaL_getmetatable(L, tname);
      lua_setmetatable(L, -2);
    };
    var luaL_testudata = function(L, ud, tname) {
      let p = lua_touserdata(L, ud);
      if (p !== null) {
        if (lua_getmetatable(L, ud)) {
          luaL_getmetatable(L, tname);
          if (!lua_rawequal(L, -1, -2))
            p = null;
          lua_pop(L, 2);
          return p;
        }
      }
      return null;
    };
    var luaL_checkudata = function(L, ud, tname) {
      let p = luaL_testudata(L, ud, tname);
      if (p === null) typeerror(L, ud, tname);
      return p;
    };
    var luaL_checkoption = function(L, arg, def, lst) {
      let name = def !== null ? luaL_optstring(L, arg, def) : luaL_checkstring(L, arg);
      for (let i = 0; lst[i]; i++)
        if (luastring_eq(lst[i], name))
          return i;
      return luaL_argerror(L, arg, lua_pushfstring(L, to_luastring2("invalid option '%s'"), name));
    };
    var tag_error = function(L, arg, tag) {
      typeerror(L, arg, lua_typename(L, tag));
    };
    var luaL_newstate = function() {
      let L = lua_newstate();
      if (L) lua_atpanic(L, panic);
      return L;
    };
    var luaL_typename = function(L, i) {
      return lua_typename(L, lua_type(L, i));
    };
    var luaL_argcheck = function(L, cond, arg, extramsg) {
      if (!cond) luaL_argerror(L, arg, extramsg);
    };
    var luaL_checkany = function(L, arg) {
      if (lua_type(L, arg) === LUA_TNONE)
        luaL_argerror(L, arg, to_luastring2("value expected", true));
    };
    var luaL_checktype = function(L, arg, t) {
      if (lua_type(L, arg) !== t)
        tag_error(L, arg, t);
    };
    var luaL_checklstring = function(L, arg) {
      let s = lua_tolstring(L, arg);
      if (s === null || s === void 0) tag_error(L, arg, LUA_TSTRING);
      return s;
    };
    var luaL_checkstring = luaL_checklstring;
    var luaL_optlstring = function(L, arg, def) {
      if (lua_type(L, arg) <= 0) {
        return def === null ? null : from_userstring(def);
      } else return luaL_checklstring(L, arg);
    };
    var luaL_optstring = luaL_optlstring;
    var interror = function(L, arg) {
      if (lua_isnumber(L, arg))
        luaL_argerror(L, arg, to_luastring2("number has no integer representation", true));
      else
        tag_error(L, arg, LUA_TNUMBER);
    };
    var luaL_checknumber = function(L, arg) {
      let d = lua_tonumberx(L, arg);
      if (d === false)
        tag_error(L, arg, LUA_TNUMBER);
      return d;
    };
    var luaL_optnumber = function(L, arg, def) {
      return luaL_opt(L, luaL_checknumber, arg, def);
    };
    var luaL_checkinteger = function(L, arg) {
      let d = lua_tointegerx(L, arg);
      if (d === false)
        interror(L, arg);
      return d;
    };
    var luaL_optinteger = function(L, arg, def) {
      return luaL_opt(L, luaL_checkinteger, arg, def);
    };
    var luaL_prepbuffsize = function(B, sz) {
      let newend = B.n + sz;
      if (B.b.length < newend) {
        let newsize = Math.max(B.b.length * 2, newend);
        let newbuff = new Uint8Array(newsize);
        newbuff.set(B.b);
        B.b = newbuff;
      }
      return B.b.subarray(B.n, newend);
    };
    var luaL_buffinit = function(L, B) {
      B.L = L;
      B.b = empty;
    };
    var luaL_buffinitsize = function(L, B, sz) {
      luaL_buffinit(L, B);
      return luaL_prepbuffsize(B, sz);
    };
    var luaL_prepbuffer = function(B) {
      return luaL_prepbuffsize(B, LUAL_BUFFERSIZE);
    };
    var luaL_addlstring = function(B, s, l) {
      if (l > 0) {
        s = from_userstring(s);
        let b = luaL_prepbuffsize(B, l);
        b.set(s.subarray(0, l));
        luaL_addsize(B, l);
      }
    };
    var luaL_addstring = function(B, s) {
      s = from_userstring(s);
      luaL_addlstring(B, s, s.length);
    };
    var luaL_pushresult = function(B) {
      lua_pushlstring(B.L, B.b, B.n);
      B.n = 0;
      B.b = empty;
    };
    var luaL_addchar = function(B, c) {
      luaL_prepbuffsize(B, 1);
      B.b[B.n++] = c;
    };
    var luaL_addsize = function(B, s) {
      B.n += s;
    };
    var luaL_pushresultsize = function(B, sz) {
      luaL_addsize(B, sz);
      luaL_pushresult(B);
    };
    var luaL_addvalue = function(B) {
      let L = B.L;
      let s = lua_tostring(L, -1);
      luaL_addlstring(B, s, s.length);
      lua_pop(L, 1);
    };
    var luaL_opt = function(L, f, n, d) {
      return lua_type(L, n) <= 0 ? d : f(L, n);
    };
    var getS = function(L, ud) {
      let s = ud.string;
      ud.string = null;
      return s;
    };
    var luaL_loadbufferx = function(L, buff, size, name, mode) {
      return lua_load(L, getS, { string: buff }, name, mode);
    };
    var luaL_loadbuffer = function(L, s, sz, n) {
      return luaL_loadbufferx(L, s, sz, n, null);
    };
    var luaL_loadstring = function(L, s) {
      return luaL_loadbuffer(L, s, s.length, s);
    };
    var luaL_dostring = function(L, s) {
      return luaL_loadstring(L, s) || lua_pcall(L, 0, LUA_MULTRET, 0);
    };
    var luaL_getmetafield = function(L, obj, event) {
      if (!lua_getmetatable(L, obj))
        return LUA_TNIL;
      else {
        lua_pushstring(L, event);
        let tt = lua_rawget(L, -2);
        if (tt === LUA_TNIL)
          lua_pop(L, 2);
        else
          lua_remove(L, -2);
        return tt;
      }
    };
    var luaL_callmeta = function(L, obj, event) {
      obj = lua_absindex(L, obj);
      if (luaL_getmetafield(L, obj, event) === LUA_TNIL)
        return false;
      lua_pushvalue(L, obj);
      lua_call(L, 1, 1);
      return true;
    };
    var luaL_len = function(L, idx) {
      lua_len(L, idx);
      let l = lua_tointegerx(L, -1);
      if (l === false)
        luaL_error(L, to_luastring2("object length is not an integer", true));
      lua_pop(L, 1);
      return l;
    };
    var p_I = to_luastring2("%I");
    var p_f = to_luastring2("%f");
    var luaL_tolstring = function(L, idx) {
      if (luaL_callmeta(L, idx, __tostring)) {
        if (!lua_isstring(L, -1))
          luaL_error(L, to_luastring2("'__tostring' must return a string"));
      } else {
        let t = lua_type(L, idx);
        switch (t) {
          case LUA_TNUMBER: {
            if (lua_isinteger(L, idx))
              lua_pushfstring(L, p_I, lua_tointeger(L, idx));
            else
              lua_pushfstring(L, p_f, lua_tonumber(L, idx));
            break;
          }
          case LUA_TSTRING:
            lua_pushvalue(L, idx);
            break;
          case LUA_TBOOLEAN:
            lua_pushliteral(L, lua_toboolean(L, idx) ? "true" : "false");
            break;
          case LUA_TNIL:
            lua_pushliteral(L, "nil");
            break;
          default: {
            let tt = luaL_getmetafield(L, idx, __name);
            let kind = tt === LUA_TSTRING ? lua_tostring(L, -1) : luaL_typename(L, idx);
            lua_pushfstring(L, to_luastring2("%s: %p"), kind, lua_topointer(L, idx));
            if (tt !== LUA_TNIL)
              lua_remove(L, -2);
            break;
          }
        }
      }
      return lua_tolstring(L, -1);
    };
    var luaL_requiref = function(L, modname, openf, glb) {
      luaL_getsubtable(L, LUA_REGISTRYINDEX, LUA_LOADED_TABLE);
      lua_getfield(L, -1, modname);
      if (!lua_toboolean(L, -1)) {
        lua_pop(L, 1);
        lua_pushcfunction(L, openf);
        lua_pushstring(L, modname);
        lua_call(L, 1, 1);
        lua_pushvalue(L, -1);
        lua_setfield(L, -3, modname);
      }
      lua_remove(L, -2);
      if (glb) {
        lua_pushvalue(L, -1);
        lua_setglobal(L, modname);
      }
    };
    var find_subarray = function(arr, subarr, from_index) {
      var i = from_index >>> 0, sl = subarr.length, l = arr.length + 1 - sl;
      loop: for (; i < l; i++) {
        for (let j = 0; j < sl; j++)
          if (arr[i + j] !== subarr[j])
            continue loop;
        return i;
      }
      return -1;
    };
    var luaL_gsub = function(L, s, p, r) {
      let wild;
      let b = new luaL_Buffer();
      luaL_buffinit(L, b);
      while ((wild = find_subarray(s, p)) >= 0) {
        luaL_addlstring(b, s, wild);
        luaL_addstring(b, r);
        s = s.subarray(wild + p.length);
      }
      luaL_addstring(b, s);
      luaL_pushresult(b);
      return lua_tostring(L, -1);
    };
    var luaL_getsubtable = function(L, idx, fname) {
      if (lua_getfield(L, idx, fname) === LUA_TTABLE)
        return true;
      else {
        lua_pop(L, 1);
        idx = lua_absindex(L, idx);
        lua_newtable(L);
        lua_pushvalue(L, -1);
        lua_setfield(L, idx, fname);
        return false;
      }
    };
    var luaL_setfuncs = function(L, l, nup) {
      luaL_checkstack(L, nup, to_luastring2("too many upvalues", true));
      for (let lib in l) {
        for (let i = 0; i < nup; i++)
          lua_pushvalue(L, -nup);
        lua_pushcclosure(L, l[lib], nup);
        lua_setfield(L, -(nup + 2), to_luastring2(lib));
      }
      lua_pop(L, nup);
    };
    var luaL_checkstack = function(L, space, msg) {
      if (!lua_checkstack(L, space)) {
        if (msg)
          luaL_error(L, to_luastring2("stack overflow (%s)"), msg);
        else
          luaL_error(L, to_luastring2("stack overflow", true));
      }
    };
    var luaL_newlibtable = function(L) {
      lua_createtable(L);
    };
    var luaL_newlib = function(L, l) {
      lua_createtable(L);
      luaL_setfuncs(L, l, 0);
    };
    var LUA_NOREF = -2;
    var LUA_REFNIL = -1;
    var luaL_ref = function(L, t) {
      let ref;
      if (lua_isnil(L, -1)) {
        lua_pop(L, 1);
        return LUA_REFNIL;
      }
      t = lua_absindex(L, t);
      lua_rawgeti(L, t, 0);
      ref = lua_tointeger(L, -1);
      lua_pop(L, 1);
      if (ref !== 0) {
        lua_rawgeti(L, t, ref);
        lua_rawseti(L, t, 0);
      } else
        ref = lua_rawlen(L, t) + 1;
      lua_rawseti(L, t, ref);
      return ref;
    };
    var luaL_unref = function(L, t, ref) {
      if (ref >= 0) {
        t = lua_absindex(L, t);
        lua_rawgeti(L, t, 0);
        lua_rawseti(L, t, ref);
        lua_pushinteger(L, ref);
        lua_rawseti(L, t, 0);
      }
    };
    var errfile = function(L, what, fnameindex, error) {
      let serr = error.message;
      let filename = lua_tostring(L, fnameindex).subarray(1);
      lua_pushfstring(L, to_luastring2("cannot %s %s: %s"), to_luastring2(what), filename, to_luastring2(serr));
      lua_remove(L, fnameindex);
      return LUA_ERRFILE;
    };
    var getc;
    var utf8_bom = [239, 187, 191];
    var skipBOM = function(lf) {
      lf.n = 0;
      let c;
      let p = 0;
      do {
        c = getc(lf);
        if (c === null || c !== utf8_bom[p]) return c;
        p++;
        lf.buff[lf.n++] = c;
      } while (p < utf8_bom.length);
      lf.n = 0;
      return getc(lf);
    };
    var skipcomment = function(lf) {
      let c = skipBOM(lf);
      if (c === 35) {
        do {
          c = getc(lf);
        } while (c && c !== 10);
        return {
          skipped: true,
          c: getc(lf)
          /* skip end-of-line, if present */
        };
      } else {
        return {
          skipped: false,
          c
        };
      }
    };
    var luaL_loadfilex;
    if (typeof process === "undefined") {
      class LoadF {
        constructor() {
          this.n = NaN;
          this.f = null;
          this.buff = new Uint8Array(1024);
          this.pos = 0;
          this.err = void 0;
        }
      }
      const getF = function(L, ud) {
        let lf = ud;
        if (lf.f !== null && lf.n > 0) {
          let bytes = lf.n;
          lf.n = 0;
          lf.f = lf.f.subarray(lf.pos);
          return lf.buff.subarray(0, bytes);
        }
        let f = lf.f;
        lf.f = null;
        return f;
      };
      getc = function(lf) {
        return lf.pos < lf.f.length ? lf.f[lf.pos++] : null;
      };
      luaL_loadfilex = function(L, filename, mode) {
        let lf = new LoadF();
        let fnameindex = lua_gettop(L) + 1;
        if (filename === null) {
          throw new Error("Can't read stdin in the browser");
        } else {
          lua_pushfstring(L, to_luastring2("@%s"), filename);
          let path = to_uristring(filename);
          let xhr = new XMLHttpRequest();
          xhr.open("GET", path, false);
          if (typeof window === "undefined") {
            xhr.responseType = "arraybuffer";
          }
          xhr.send();
          if (xhr.status >= 200 && xhr.status <= 299) {
            if (typeof xhr.response === "string") {
              lf.f = to_luastring2(xhr.response);
            } else {
              lf.f = new Uint8Array(xhr.response);
            }
          } else {
            lf.err = xhr.status;
            return errfile(L, "open", fnameindex, { message: `${xhr.status}: ${xhr.statusText}` });
          }
        }
        let com = skipcomment(lf);
        if (com.c === LUA_SIGNATURE[0] && filename) {
        } else if (com.skipped) {
          lf.buff[lf.n++] = 10;
        }
        if (com.c !== null)
          lf.buff[lf.n++] = com.c;
        let status = lua_load(L, getF, lf, lua_tostring(L, -1), mode);
        let readstatus = lf.err;
        if (readstatus) {
          lua_settop(L, fnameindex);
          return errfile(L, "read", fnameindex, readstatus);
        }
        lua_remove(L, fnameindex);
        return status;
      };
    } else {
      const __nsmRequire = (m) => {
        try {
          return __require(m);
        } catch (e) {
          return null;
        }
      };
      const fs = __nsmRequire("fs");
      class LoadF {
        constructor() {
          this.n = NaN;
          this.f = null;
          this.buff = Buffer.alloc(1024);
          this.pos = 0;
          this.err = void 0;
        }
      }
      const getF = function(L, ud) {
        let lf = ud;
        let bytes = 0;
        if (lf.n > 0) {
          bytes = lf.n;
          lf.n = 0;
        } else {
          try {
            bytes = fs.readSync(lf.f, lf.buff, 0, lf.buff.length, lf.pos);
          } catch (e) {
            lf.err = e;
            bytes = 0;
          }
          lf.pos += bytes;
        }
        if (bytes > 0)
          return lf.buff.subarray(0, bytes);
        else return null;
      };
      getc = function(lf) {
        let b = Buffer.alloc(1);
        let bytes;
        try {
          bytes = fs.readSync(lf.f, b, 0, 1, lf.pos);
        } catch (e) {
          lf.err = e;
          return null;
        }
        lf.pos += bytes;
        return bytes > 0 ? b.readUInt8() : null;
      };
      luaL_loadfilex = function(L, filename, mode) {
        let lf = new LoadF();
        let fnameindex = lua_gettop(L) + 1;
        if (filename === null) {
          lua_pushliteral(L, "=stdin");
          lf.f = process.stdin.fd;
        } else {
          lua_pushfstring(L, to_luastring2("@%s"), filename);
          try {
            lf.f = fs.openSync(filename, "r");
          } catch (e) {
            return errfile(L, "open", fnameindex, e);
          }
        }
        let com = skipcomment(lf);
        if (com.c === LUA_SIGNATURE[0] && filename) {
        } else if (com.skipped) {
          lf.buff[lf.n++] = 10;
        }
        if (com.c !== null)
          lf.buff[lf.n++] = com.c;
        let status = lua_load(L, getF, lf, lua_tostring(L, -1), mode);
        let readstatus = lf.err;
        if (filename) try {
          fs.closeSync(lf.f);
        } catch (e) {
        }
        if (readstatus) {
          lua_settop(L, fnameindex);
          return errfile(L, "read", fnameindex, readstatus);
        }
        lua_remove(L, fnameindex);
        return status;
      };
    }
    var luaL_loadfile = function(L, filename) {
      return luaL_loadfilex(L, filename, null);
    };
    var luaL_dofile = function(L, filename) {
      return luaL_loadfile(L, filename) || lua_pcall(L, 0, LUA_MULTRET, 0);
    };
    var lua_writestringerror = function() {
      for (let i = 0; i < arguments.length; i++) {
        let a = arguments[i];
        if (typeof process === "undefined") {
          do {
            let r = /([^\n]*)\n?([\d\D]*)/.exec(a);
            console.error(r[1]);
            a = r[2];
          } while (a !== "");
        } else {
          process.stderr.write(a);
        }
      }
    };
    var luaL_checkversion_ = function(L, ver, sz) {
      let v = lua_version(L);
      if (sz != LUAL_NUMSIZES)
        luaL_error(L, to_luastring2("core and library have incompatible numeric types"));
      if (v != lua_version(null))
        luaL_error(L, to_luastring2("multiple Lua VMs detected"));
      else if (v !== ver)
        luaL_error(L, to_luastring2("version mismatch: app. needs %f, Lua core provides %f"), ver, v);
    };
    var luaL_checkversion = function(L) {
      luaL_checkversion_(L, LUA_VERSION_NUM, LUAL_NUMSIZES);
    };
    module.exports.LUA_ERRFILE = LUA_ERRFILE;
    module.exports.LUA_FILEHANDLE = LUA_FILEHANDLE;
    module.exports.LUA_LOADED_TABLE = LUA_LOADED_TABLE;
    module.exports.LUA_NOREF = LUA_NOREF;
    module.exports.LUA_PRELOAD_TABLE = LUA_PRELOAD_TABLE;
    module.exports.LUA_REFNIL = LUA_REFNIL;
    module.exports.luaL_Buffer = luaL_Buffer;
    module.exports.luaL_addchar = luaL_addchar;
    module.exports.luaL_addlstring = luaL_addlstring;
    module.exports.luaL_addsize = luaL_addsize;
    module.exports.luaL_addstring = luaL_addstring;
    module.exports.luaL_addvalue = luaL_addvalue;
    module.exports.luaL_argcheck = luaL_argcheck;
    module.exports.luaL_argerror = luaL_argerror;
    module.exports.luaL_buffinit = luaL_buffinit;
    module.exports.luaL_buffinitsize = luaL_buffinitsize;
    module.exports.luaL_callmeta = luaL_callmeta;
    module.exports.luaL_checkany = luaL_checkany;
    module.exports.luaL_checkinteger = luaL_checkinteger;
    module.exports.luaL_checklstring = luaL_checklstring;
    module.exports.luaL_checknumber = luaL_checknumber;
    module.exports.luaL_checkoption = luaL_checkoption;
    module.exports.luaL_checkstack = luaL_checkstack;
    module.exports.luaL_checkstring = luaL_checkstring;
    module.exports.luaL_checktype = luaL_checktype;
    module.exports.luaL_checkudata = luaL_checkudata;
    module.exports.luaL_checkversion = luaL_checkversion;
    module.exports.luaL_checkversion_ = luaL_checkversion_;
    module.exports.luaL_dofile = luaL_dofile;
    module.exports.luaL_dostring = luaL_dostring;
    module.exports.luaL_error = luaL_error;
    module.exports.luaL_execresult = luaL_execresult;
    module.exports.luaL_fileresult = luaL_fileresult;
    module.exports.luaL_getmetafield = luaL_getmetafield;
    module.exports.luaL_getmetatable = luaL_getmetatable;
    module.exports.luaL_getsubtable = luaL_getsubtable;
    module.exports.luaL_gsub = luaL_gsub;
    module.exports.luaL_len = luaL_len;
    module.exports.luaL_loadbuffer = luaL_loadbuffer;
    module.exports.luaL_loadbufferx = luaL_loadbufferx;
    module.exports.luaL_loadfile = luaL_loadfile;
    module.exports.luaL_loadfilex = luaL_loadfilex;
    module.exports.luaL_loadstring = luaL_loadstring;
    module.exports.luaL_newlib = luaL_newlib;
    module.exports.luaL_newlibtable = luaL_newlibtable;
    module.exports.luaL_newmetatable = luaL_newmetatable;
    module.exports.luaL_newstate = luaL_newstate;
    module.exports.luaL_opt = luaL_opt;
    module.exports.luaL_optinteger = luaL_optinteger;
    module.exports.luaL_optlstring = luaL_optlstring;
    module.exports.luaL_optnumber = luaL_optnumber;
    module.exports.luaL_optstring = luaL_optstring;
    module.exports.luaL_prepbuffer = luaL_prepbuffer;
    module.exports.luaL_prepbuffsize = luaL_prepbuffsize;
    module.exports.luaL_pushresult = luaL_pushresult;
    module.exports.luaL_pushresultsize = luaL_pushresultsize;
    module.exports.luaL_ref = luaL_ref;
    module.exports.luaL_requiref = luaL_requiref;
    module.exports.luaL_setfuncs = luaL_setfuncs;
    module.exports.luaL_setmetatable = luaL_setmetatable;
    module.exports.luaL_testudata = luaL_testudata;
    module.exports.luaL_tolstring = luaL_tolstring;
    module.exports.luaL_traceback = luaL_traceback;
    module.exports.luaL_typename = luaL_typename;
    module.exports.luaL_unref = luaL_unref;
    module.exports.luaL_where = luaL_where;
    module.exports.lua_writestringerror = lua_writestringerror;
  }
});

// vendor/fengari/src/lbaselib.js
var require_lbaselib = __commonJS({
  "vendor/fengari/src/lbaselib.js"(exports, module) {
    "use strict";
    var {
      LUA_MULTRET,
      LUA_OK,
      LUA_TFUNCTION,
      LUA_TNIL,
      LUA_TNONE,
      LUA_TNUMBER,
      LUA_TSTRING,
      LUA_TTABLE,
      LUA_VERSION,
      LUA_YIELD,
      lua_call,
      lua_callk,
      lua_concat,
      lua_error,
      lua_getglobal,
      lua_geti,
      lua_getmetatable,
      lua_gettop,
      lua_insert,
      lua_isnil,
      lua_isnone,
      lua_isstring,
      lua_load,
      lua_next,
      lua_pcallk,
      lua_pop,
      lua_pushboolean,
      lua_pushcfunction,
      lua_pushglobaltable,
      lua_pushinteger,
      lua_pushliteral,
      lua_pushnil,
      lua_pushstring,
      lua_pushvalue,
      lua_rawequal,
      lua_rawget,
      lua_rawlen,
      lua_rawset,
      lua_remove,
      lua_replace,
      lua_rotate,
      lua_setfield,
      lua_setmetatable,
      lua_settop,
      lua_setupvalue,
      lua_stringtonumber,
      lua_toboolean,
      lua_tolstring,
      lua_tostring,
      lua_type,
      lua_typename
    } = require_lua();
    var {
      luaL_argcheck,
      luaL_checkany,
      luaL_checkinteger,
      luaL_checkoption,
      luaL_checkstack,
      luaL_checktype,
      luaL_error,
      luaL_getmetafield,
      luaL_loadbufferx,
      luaL_loadfile,
      luaL_loadfilex,
      luaL_optinteger,
      luaL_optstring,
      luaL_setfuncs,
      luaL_tolstring,
      luaL_where
    } = require_lauxlib();
    var {
      to_jsstring: to_jsstring2,
      to_luastring: to_luastring2
    } = require_fengaricore();
    var lua_writestring;
    var lua_writeline;
    if (typeof process === "undefined") {
      if (typeof TextDecoder === "function") {
        let buff = "";
        let decoder = new TextDecoder("utf-8");
        lua_writestring = function(s) {
          buff += decoder.decode(s, { stream: true });
        };
        let empty = new Uint8Array(0);
        lua_writeline = function() {
          buff += decoder.decode(empty);
          console.log(buff);
          buff = "";
        };
      } else {
        let buff = [];
        lua_writestring = function(s) {
          try {
            s = to_jsstring2(s);
          } catch (e) {
            let copy = new Uint8Array(s.length);
            copy.set(s);
            s = copy;
          }
          buff.push(s);
        };
        lua_writeline = function() {
          console.log.apply(console.log, buff);
          buff = [];
        };
      }
    } else {
      lua_writestring = function(s) {
        process.stdout.write(Buffer.from(s));
      };
      lua_writeline = function() {
        process.stdout.write("\n");
      };
    }
    var luaB_print = function(L) {
      let n = lua_gettop(L);
      lua_getglobal(L, to_luastring2("tostring", true));
      for (let i = 1; i <= n; i++) {
        lua_pushvalue(L, -1);
        lua_pushvalue(L, i);
        lua_call(L, 1, 1);
        let s = lua_tolstring(L, -1);
        if (s === null)
          return luaL_error(L, to_luastring2("'tostring' must return a string to 'print'"));
        if (i > 1) lua_writestring(to_luastring2("	"));
        lua_writestring(s);
        lua_pop(L, 1);
      }
      lua_writeline();
      return 0;
    };
    var luaB_tostring = function(L) {
      luaL_checkany(L, 1);
      luaL_tolstring(L, 1);
      return 1;
    };
    var luaB_getmetatable = function(L) {
      luaL_checkany(L, 1);
      if (!lua_getmetatable(L, 1)) {
        lua_pushnil(L);
        return 1;
      }
      luaL_getmetafield(L, 1, to_luastring2("__metatable", true));
      return 1;
    };
    var luaB_setmetatable = function(L) {
      let t = lua_type(L, 2);
      luaL_checktype(L, 1, LUA_TTABLE);
      luaL_argcheck(L, t === LUA_TNIL || t === LUA_TTABLE, 2, "nil or table expected");
      if (luaL_getmetafield(L, 1, to_luastring2("__metatable", true)) !== LUA_TNIL)
        return luaL_error(L, to_luastring2("cannot change a protected metatable"));
      lua_settop(L, 2);
      lua_setmetatable(L, 1);
      return 1;
    };
    var luaB_rawequal = function(L) {
      luaL_checkany(L, 1);
      luaL_checkany(L, 2);
      lua_pushboolean(L, lua_rawequal(L, 1, 2));
      return 1;
    };
    var luaB_rawlen = function(L) {
      let t = lua_type(L, 1);
      luaL_argcheck(L, t === LUA_TTABLE || t === LUA_TSTRING, 1, "table or string expected");
      lua_pushinteger(L, lua_rawlen(L, 1));
      return 1;
    };
    var luaB_rawget = function(L) {
      luaL_checktype(L, 1, LUA_TTABLE);
      luaL_checkany(L, 2);
      lua_settop(L, 2);
      lua_rawget(L, 1);
      return 1;
    };
    var luaB_rawset = function(L) {
      luaL_checktype(L, 1, LUA_TTABLE);
      luaL_checkany(L, 2);
      luaL_checkany(L, 3);
      lua_settop(L, 3);
      lua_rawset(L, 1);
      return 1;
    };
    var opts = [
      "stop",
      "restart",
      "collect",
      "count",
      "step",
      "setpause",
      "setstepmul",
      "isrunning"
    ].map((e) => to_luastring2(e));
    var luaB_collectgarbage = function(L) {
      luaL_checkoption(L, 1, "collect", opts);
      luaL_optinteger(L, 2, 0);
      luaL_error(L, to_luastring2("lua_gc not implemented"));
    };
    var luaB_type = function(L) {
      let t = lua_type(L, 1);
      luaL_argcheck(L, t !== LUA_TNONE, 1, "value expected");
      lua_pushstring(L, lua_typename(L, t));
      return 1;
    };
    var pairsmeta = function(L, method, iszero, iter) {
      luaL_checkany(L, 1);
      if (luaL_getmetafield(L, 1, method) === LUA_TNIL) {
        lua_pushcfunction(L, iter);
        lua_pushvalue(L, 1);
        if (iszero) lua_pushinteger(L, 0);
        else lua_pushnil(L);
      } else {
        lua_pushvalue(L, 1);
        lua_call(L, 1, 3);
      }
      return 3;
    };
    var luaB_next = function(L) {
      luaL_checktype(L, 1, LUA_TTABLE);
      lua_settop(L, 2);
      if (lua_next(L, 1))
        return 2;
      else {
        lua_pushnil(L);
        return 1;
      }
    };
    var luaB_pairs = function(L) {
      return pairsmeta(L, to_luastring2("__pairs", true), 0, luaB_next);
    };
    var ipairsaux = function(L) {
      let i = luaL_checkinteger(L, 2) + 1;
      lua_pushinteger(L, i);
      return lua_geti(L, 1, i) === LUA_TNIL ? 1 : 2;
    };
    var luaB_ipairs = function(L) {
      luaL_checkany(L, 1);
      lua_pushcfunction(L, ipairsaux);
      lua_pushvalue(L, 1);
      lua_pushinteger(L, 0);
      return 3;
    };
    var b_str2int = function(s, base) {
      try {
        s = to_jsstring2(s);
      } catch (e) {
        return null;
      }
      let r = /^[\t\v\f \n\r]*([+-]?)0*([0-9A-Za-z]+)[\t\v\f \n\r]*$/.exec(s);
      if (!r) return null;
      let v = parseInt(r[1] + r[2], base);
      if (isNaN(v)) return null;
      return v | 0;
    };
    var luaB_tonumber = function(L) {
      if (lua_type(L, 2) <= 0) {
        luaL_checkany(L, 1);
        if (lua_type(L, 1) === LUA_TNUMBER) {
          lua_settop(L, 1);
          return 1;
        } else {
          let s = lua_tostring(L, 1);
          if (s !== null && lua_stringtonumber(L, s) === s.length + 1)
            return 1;
        }
      } else {
        let base = luaL_checkinteger(L, 2);
        luaL_checktype(L, 1, LUA_TSTRING);
        let s = lua_tostring(L, 1);
        luaL_argcheck(L, 2 <= base && base <= 36, 2, "base out of range");
        let n = b_str2int(s, base);
        if (n !== null) {
          lua_pushinteger(L, n);
          return 1;
        }
      }
      lua_pushnil(L);
      return 1;
    };
    var luaB_error = function(L) {
      let level = luaL_optinteger(L, 2, 1);
      lua_settop(L, 1);
      if (lua_type(L, 1) === LUA_TSTRING && level > 0) {
        luaL_where(L, level);
        lua_pushvalue(L, 1);
        lua_concat(L, 2);
      }
      return lua_error(L);
    };
    var luaB_assert = function(L) {
      if (lua_toboolean(L, 1))
        return lua_gettop(L);
      else {
        luaL_checkany(L, 1);
        lua_remove(L, 1);
        lua_pushliteral(L, "assertion failed!");
        lua_settop(L, 1);
        return luaB_error(L);
      }
    };
    var luaB_select = function(L) {
      let n = lua_gettop(L);
      if (lua_type(L, 1) === LUA_TSTRING && lua_tostring(L, 1)[0] === 35) {
        lua_pushinteger(L, n - 1);
        return 1;
      } else {
        let i = luaL_checkinteger(L, 1);
        if (i < 0) i = n + i;
        else if (i > n) i = n;
        luaL_argcheck(L, 1 <= i, 1, "index out of range");
        return n - i;
      }
    };
    var finishpcall = function(L, status, extra) {
      if (status !== LUA_OK && status !== LUA_YIELD) {
        lua_pushboolean(L, 0);
        lua_pushvalue(L, -2);
        return 2;
      } else
        return lua_gettop(L) - extra;
    };
    var luaB_pcall = function(L) {
      luaL_checkany(L, 1);
      lua_pushboolean(L, 1);
      lua_insert(L, 1);
      let status = lua_pcallk(L, lua_gettop(L) - 2, LUA_MULTRET, 0, 0, finishpcall);
      return finishpcall(L, status, 0);
    };
    var luaB_xpcall = function(L) {
      let n = lua_gettop(L);
      luaL_checktype(L, 2, LUA_TFUNCTION);
      lua_pushboolean(L, 1);
      lua_pushvalue(L, 1);
      lua_rotate(L, 3, 2);
      let status = lua_pcallk(L, n - 2, LUA_MULTRET, 2, 2, finishpcall);
      return finishpcall(L, status, 2);
    };
    var load_aux = function(L, status, envidx) {
      if (status === LUA_OK) {
        if (envidx !== 0) {
          lua_pushvalue(L, envidx);
          if (!lua_setupvalue(L, -2, 1))
            lua_pop(L, 1);
        }
        return 1;
      } else {
        lua_pushnil(L);
        lua_insert(L, -2);
        return 2;
      }
    };
    var RESERVEDSLOT = 5;
    var generic_reader = function(L, ud) {
      luaL_checkstack(L, 2, "too many nested functions");
      lua_pushvalue(L, 1);
      lua_call(L, 0, 1);
      if (lua_isnil(L, -1)) {
        lua_pop(L, 1);
        return null;
      } else if (!lua_isstring(L, -1))
        luaL_error(L, to_luastring2("reader function must return a string"));
      lua_replace(L, RESERVEDSLOT);
      return lua_tostring(L, RESERVEDSLOT);
    };
    var luaB_load = function(L) {
      let s = lua_tostring(L, 1);
      let mode = luaL_optstring(L, 3, "bt");
      let env = !lua_isnone(L, 4) ? 4 : 0;
      let status;
      if (s !== null) {
        let chunkname = luaL_optstring(L, 2, s);
        status = luaL_loadbufferx(L, s, s.length, chunkname, mode);
      } else {
        let chunkname = luaL_optstring(L, 2, "=(load)");
        luaL_checktype(L, 1, LUA_TFUNCTION);
        lua_settop(L, RESERVEDSLOT);
        status = lua_load(L, generic_reader, null, chunkname, mode);
      }
      return load_aux(L, status, env);
    };
    var luaB_loadfile = function(L) {
      let fname = luaL_optstring(L, 1, null);
      let mode = luaL_optstring(L, 2, null);
      let env = !lua_isnone(L, 3) ? 3 : 0;
      let status = luaL_loadfilex(L, fname, mode);
      return load_aux(L, status, env);
    };
    var dofilecont = function(L, d1, d2) {
      return lua_gettop(L) - 1;
    };
    var luaB_dofile = function(L) {
      let fname = luaL_optstring(L, 1, null);
      lua_settop(L, 1);
      if (luaL_loadfile(L, fname) !== LUA_OK)
        return lua_error(L);
      lua_callk(L, 0, LUA_MULTRET, 0, dofilecont);
      return dofilecont(L, 0, 0);
    };
    var base_funcs = {
      "assert": luaB_assert,
      "collectgarbage": luaB_collectgarbage,
      "dofile": luaB_dofile,
      "error": luaB_error,
      "getmetatable": luaB_getmetatable,
      "ipairs": luaB_ipairs,
      "load": luaB_load,
      "loadfile": luaB_loadfile,
      "next": luaB_next,
      "pairs": luaB_pairs,
      "pcall": luaB_pcall,
      "print": luaB_print,
      "rawequal": luaB_rawequal,
      "rawget": luaB_rawget,
      "rawlen": luaB_rawlen,
      "rawset": luaB_rawset,
      "select": luaB_select,
      "setmetatable": luaB_setmetatable,
      "tonumber": luaB_tonumber,
      "tostring": luaB_tostring,
      "type": luaB_type,
      "xpcall": luaB_xpcall
    };
    var luaopen_base = function(L) {
      lua_pushglobaltable(L);
      luaL_setfuncs(L, base_funcs, 0);
      lua_pushvalue(L, -1);
      lua_setfield(L, -2, to_luastring2("_G"));
      lua_pushliteral(L, LUA_VERSION);
      lua_setfield(L, -2, to_luastring2("_VERSION"));
      return 1;
    };
    module.exports.luaopen_base = luaopen_base;
  }
});

// vendor/fengari/src/lcorolib.js
var require_lcorolib = __commonJS({
  "vendor/fengari/src/lcorolib.js"(exports, module) {
    "use strict";
    var {
      LUA_OK,
      LUA_TFUNCTION,
      LUA_TSTRING,
      LUA_YIELD,
      lua_Debug,
      lua_checkstack,
      lua_concat,
      lua_error,
      lua_getstack,
      lua_gettop,
      lua_insert,
      lua_isyieldable,
      lua_newthread,
      lua_pop,
      lua_pushboolean,
      lua_pushcclosure,
      lua_pushliteral,
      lua_pushthread,
      lua_pushvalue,
      lua_resume,
      lua_status,
      lua_tothread,
      lua_type,
      lua_upvalueindex,
      lua_xmove,
      lua_yield
    } = require_lua();
    var {
      luaL_argcheck,
      luaL_checktype,
      luaL_newlib,
      luaL_where
    } = require_lauxlib();
    var getco = function(L) {
      let co = lua_tothread(L, 1);
      luaL_argcheck(L, co, 1, "thread expected");
      return co;
    };
    var auxresume = function(L, co, narg) {
      if (!lua_checkstack(co, narg)) {
        lua_pushliteral(L, "too many arguments to resume");
        return -1;
      }
      if (lua_status(co) === LUA_OK && lua_gettop(co) === 0) {
        lua_pushliteral(L, "cannot resume dead coroutine");
        return -1;
      }
      lua_xmove(L, co, narg);
      let status = lua_resume(co, L, narg);
      if (status === LUA_OK || status === LUA_YIELD) {
        let nres = lua_gettop(co);
        if (!lua_checkstack(L, nres + 1)) {
          lua_pop(co, nres);
          lua_pushliteral(L, "too many results to resume");
          return -1;
        }
        lua_xmove(co, L, nres);
        return nres;
      } else {
        lua_xmove(co, L, 1);
        return -1;
      }
    };
    var luaB_coresume = function(L) {
      let co = getco(L);
      let r = auxresume(L, co, lua_gettop(L) - 1);
      if (r < 0) {
        lua_pushboolean(L, 0);
        lua_insert(L, -2);
        return 2;
      } else {
        lua_pushboolean(L, 1);
        lua_insert(L, -(r + 1));
        return r + 1;
      }
    };
    var luaB_auxwrap = function(L) {
      let co = lua_tothread(L, lua_upvalueindex(1));
      let r = auxresume(L, co, lua_gettop(L));
      if (r < 0) {
        if (lua_type(L, -1) === LUA_TSTRING) {
          luaL_where(L, 1);
          lua_insert(L, -2);
          lua_concat(L, 2);
        }
        return lua_error(L);
      }
      return r;
    };
    var luaB_cocreate = function(L) {
      luaL_checktype(L, 1, LUA_TFUNCTION);
      let NL = lua_newthread(L);
      lua_pushvalue(L, 1);
      lua_xmove(L, NL, 1);
      return 1;
    };
    var luaB_cowrap = function(L) {
      luaB_cocreate(L);
      lua_pushcclosure(L, luaB_auxwrap, 1);
      return 1;
    };
    var luaB_yield = function(L) {
      return lua_yield(L, lua_gettop(L));
    };
    var luaB_costatus = function(L) {
      let co = getco(L);
      if (L === co) lua_pushliteral(L, "running");
      else {
        switch (lua_status(co)) {
          case LUA_YIELD:
            lua_pushliteral(L, "suspended");
            break;
          case LUA_OK: {
            let ar = new lua_Debug();
            if (lua_getstack(co, 0, ar) > 0)
              lua_pushliteral(L, "normal");
            else if (lua_gettop(co) === 0)
              lua_pushliteral(L, "dead");
            else
              lua_pushliteral(L, "suspended");
            break;
          }
          default:
            lua_pushliteral(L, "dead");
            break;
        }
      }
      return 1;
    };
    var luaB_yieldable = function(L) {
      lua_pushboolean(L, lua_isyieldable(L));
      return 1;
    };
    var luaB_corunning = function(L) {
      lua_pushboolean(L, lua_pushthread(L));
      return 2;
    };
    var co_funcs = {
      "create": luaB_cocreate,
      "isyieldable": luaB_yieldable,
      "resume": luaB_coresume,
      "running": luaB_corunning,
      "status": luaB_costatus,
      "wrap": luaB_cowrap,
      "yield": luaB_yield
    };
    var luaopen_coroutine = function(L) {
      luaL_newlib(L, co_funcs);
      return 1;
    };
    module.exports.luaopen_coroutine = luaopen_coroutine;
  }
});

// vendor/fengari/src/ltablib.js
var require_ltablib = __commonJS({
  "vendor/fengari/src/ltablib.js"(exports, module) {
    "use strict";
    var { LUA_MAXINTEGER } = require_luaconf();
    var {
      LUA_OPEQ,
      LUA_OPLT,
      LUA_TFUNCTION,
      LUA_TNIL,
      LUA_TTABLE,
      lua_call,
      lua_checkstack,
      lua_compare,
      lua_createtable,
      lua_geti,
      lua_getmetatable,
      lua_gettop,
      lua_insert,
      lua_isnil,
      lua_isnoneornil,
      lua_isstring,
      lua_pop,
      lua_pushinteger,
      lua_pushnil,
      lua_pushstring,
      lua_pushvalue,
      lua_rawget,
      lua_setfield,
      lua_seti,
      lua_settop,
      lua_toboolean,
      lua_type
    } = require_lua();
    var {
      luaL_Buffer,
      luaL_addlstring,
      luaL_addvalue,
      luaL_argcheck,
      luaL_buffinit,
      luaL_checkinteger,
      luaL_checktype,
      luaL_error,
      luaL_len,
      luaL_newlib,
      luaL_opt,
      luaL_optinteger,
      luaL_optlstring,
      luaL_pushresult,
      luaL_typename
    } = require_lauxlib();
    var lualib2 = require_lualib();
    var { to_luastring: to_luastring2 } = require_fengaricore();
    var TAB_R = 1;
    var TAB_W = 2;
    var TAB_L = 4;
    var TAB_RW = TAB_R | TAB_W;
    var checkfield = function(L, key, n) {
      lua_pushstring(L, key);
      return lua_rawget(L, -n) !== LUA_TNIL;
    };
    var checktab = function(L, arg, what) {
      if (lua_type(L, arg) !== LUA_TTABLE) {
        let n = 1;
        if (lua_getmetatable(L, arg) && /* must have metatable */
        (!(what & TAB_R) || checkfield(L, to_luastring2("__index", true), ++n)) && (!(what & TAB_W) || checkfield(L, to_luastring2("__newindex", true), ++n)) && (!(what & TAB_L) || checkfield(L, to_luastring2("__len", true), ++n))) {
          lua_pop(L, n);
        } else
          luaL_checktype(L, arg, LUA_TTABLE);
      }
    };
    var aux_getn = function(L, n, w) {
      checktab(L, n, w | TAB_L);
      return luaL_len(L, n);
    };
    var addfield = function(L, b, i) {
      lua_geti(L, 1, i);
      if (!lua_isstring(L, -1))
        luaL_error(
          L,
          to_luastring2("invalid value (%s) at index %d in table for 'concat'"),
          luaL_typename(L, -1),
          i
        );
      luaL_addvalue(b);
    };
    var tinsert = function(L) {
      let e = aux_getn(L, 1, TAB_RW) + 1;
      let pos;
      switch (lua_gettop(L)) {
        case 2:
          pos = e;
          break;
        case 3: {
          pos = luaL_checkinteger(L, 2);
          luaL_argcheck(L, 1 <= pos && pos <= e, 2, "position out of bounds");
          for (let i = e; i > pos; i--) {
            lua_geti(L, 1, i - 1);
            lua_seti(L, 1, i);
          }
          break;
        }
        default: {
          return luaL_error(L, "wrong number of arguments to 'insert'");
        }
      }
      lua_seti(L, 1, pos);
      return 0;
    };
    var tremove = function(L) {
      let size = aux_getn(L, 1, TAB_RW);
      let pos = luaL_optinteger(L, 2, size);
      if (pos !== size)
        luaL_argcheck(L, 1 <= pos && pos <= size + 1, 1, "position out of bounds");
      lua_geti(L, 1, pos);
      for (; pos < size; pos++) {
        lua_geti(L, 1, pos + 1);
        lua_seti(L, 1, pos);
      }
      lua_pushnil(L);
      lua_seti(L, 1, pos);
      return 1;
    };
    var tmove = function(L) {
      let f = luaL_checkinteger(L, 2);
      let e = luaL_checkinteger(L, 3);
      let t = luaL_checkinteger(L, 4);
      let tt = !lua_isnoneornil(L, 5) ? 5 : 1;
      checktab(L, 1, TAB_R);
      checktab(L, tt, TAB_W);
      if (e >= f) {
        luaL_argcheck(L, f > 0 || e < LUA_MAXINTEGER + f, 3, "too many elements to move");
        let n = e - f + 1;
        luaL_argcheck(L, t <= LUA_MAXINTEGER - n + 1, 4, "destination wrap around");
        if (t > e || t <= f || tt !== 1 && lua_compare(L, 1, tt, LUA_OPEQ) !== 1) {
          for (let i = 0; i < n; i++) {
            lua_geti(L, 1, f + i);
            lua_seti(L, tt, t + i);
          }
        } else {
          for (let i = n - 1; i >= 0; i--) {
            lua_geti(L, 1, f + i);
            lua_seti(L, tt, t + i);
          }
        }
      }
      lua_pushvalue(L, tt);
      return 1;
    };
    var tconcat = function(L) {
      let last = aux_getn(L, 1, TAB_R);
      let sep = luaL_optlstring(L, 2, "");
      let lsep = sep.length;
      let i = luaL_optinteger(L, 3, 1);
      last = luaL_optinteger(L, 4, last);
      let b = new luaL_Buffer();
      luaL_buffinit(L, b);
      for (; i < last; i++) {
        addfield(L, b, i);
        luaL_addlstring(b, sep, lsep);
      }
      if (i === last)
        addfield(L, b, i);
      luaL_pushresult(b);
      return 1;
    };
    var pack = function(L) {
      let n = lua_gettop(L);
      lua_createtable(L, n, 1);
      lua_insert(L, 1);
      for (let i = n; i >= 1; i--)
        lua_seti(L, 1, i);
      lua_pushinteger(L, n);
      lua_setfield(L, 1, to_luastring2("n"));
      return 1;
    };
    var unpack = function(L) {
      let i = luaL_optinteger(L, 2, 1);
      let e = luaL_opt(L, luaL_checkinteger, 3, luaL_len(L, 1));
      if (i > e) return 0;
      let n = e - i;
      if (n >= Number.MAX_SAFE_INTEGER || !lua_checkstack(L, ++n))
        return luaL_error(L, to_luastring2("too many results to unpack"));
      for (; i < e; i++)
        lua_geti(L, 1, i);
      lua_geti(L, 1, e);
      return n;
    };
    var l_randomizePivot = function() {
      return Math.floor(Math.random() * 4294967296);
    };
    var RANLIMIT = 100;
    var set2 = function(L, i, j) {
      lua_seti(L, 1, i);
      lua_seti(L, 1, j);
    };
    var sort_comp = function(L, a, b) {
      if (lua_isnil(L, 2))
        return lua_compare(L, a, b, LUA_OPLT);
      else {
        lua_pushvalue(L, 2);
        lua_pushvalue(L, a - 1);
        lua_pushvalue(L, b - 2);
        lua_call(L, 2, 1);
        let res = lua_toboolean(L, -1);
        lua_pop(L, 1);
        return res;
      }
    };
    var partition = function(L, lo, up) {
      let i = lo;
      let j = up - 1;
      for (; ; ) {
        while (lua_geti(L, 1, ++i), sort_comp(L, -1, -2)) {
          if (i == up - 1)
            luaL_error(L, to_luastring2("invalid order function for sorting"));
          lua_pop(L, 1);
        }
        while (lua_geti(L, 1, --j), sort_comp(L, -3, -1)) {
          if (j < i)
            luaL_error(L, to_luastring2("invalid order function for sorting"));
          lua_pop(L, 1);
        }
        if (j < i) {
          lua_pop(L, 1);
          set2(L, up - 1, i);
          return i;
        }
        set2(L, i, j);
      }
    };
    var choosePivot = function(lo, up, rnd) {
      let r4 = Math.floor((up - lo) / 4);
      let p = rnd % (r4 * 2) + (lo + r4);
      lualib2.lua_assert(lo + r4 <= p && p <= up - r4);
      return p;
    };
    var auxsort = function(L, lo, up, rnd) {
      while (lo < up) {
        lua_geti(L, 1, lo);
        lua_geti(L, 1, up);
        if (sort_comp(L, -1, -2))
          set2(L, lo, up);
        else
          lua_pop(L, 2);
        if (up - lo == 1)
          return;
        let p;
        if (up - lo < RANLIMIT || rnd === 0)
          p = Math.floor((lo + up) / 2);
        else
          p = choosePivot(lo, up, rnd);
        lua_geti(L, 1, p);
        lua_geti(L, 1, lo);
        if (sort_comp(L, -2, -1))
          set2(L, p, lo);
        else {
          lua_pop(L, 1);
          lua_geti(L, 1, up);
          if (sort_comp(L, -1, -2))
            set2(L, p, up);
          else
            lua_pop(L, 2);
        }
        if (up - lo == 2)
          return;
        lua_geti(L, 1, p);
        lua_pushvalue(L, -1);
        lua_geti(L, 1, up - 1);
        set2(L, p, up - 1);
        p = partition(L, lo, up);
        let n;
        if (p - lo < up - p) {
          auxsort(L, lo, p - 1, rnd);
          n = p - lo;
          lo = p + 1;
        } else {
          auxsort(L, p + 1, up, rnd);
          n = up - p;
          up = p - 1;
        }
        if ((up - lo) / 128 > n)
          rnd = l_randomizePivot();
      }
    };
    var sort = function(L) {
      let n = aux_getn(L, 1, TAB_RW);
      if (n > 1) {
        luaL_argcheck(L, n < LUA_MAXINTEGER, 1, "array too big");
        if (!lua_isnoneornil(L, 2))
          luaL_checktype(L, 2, LUA_TFUNCTION);
        lua_settop(L, 2);
        auxsort(L, 1, n, 0);
      }
      return 0;
    };
    var tab_funcs = {
      "concat": tconcat,
      "insert": tinsert,
      "move": tmove,
      "pack": pack,
      "remove": tremove,
      "sort": sort,
      "unpack": unpack
    };
    var luaopen_table = function(L) {
      luaL_newlib(L, tab_funcs);
      return 1;
    };
    module.exports.luaopen_table = luaopen_table;
  }
});

// vendor/fengari/src/liolib.js
var require_liolib = __commonJS({
  "vendor/fengari/src/liolib.js"(exports, module) {
    "use strict";
    var __nsmRequire = (m) => {
      try {
        return __require(m);
      } catch (e) {
        return null;
      }
    };
    var fs = __nsmRequire("fs");
    var {
      LUA_REGISTRYINDEX,
      lua_getfield,
      lua_gettop,
      lua_isnone,
      lua_isnoneornil,
      lua_newuserdata,
      lua_pop,
      lua_pushliteral,
      lua_pushnil,
      lua_pushstring,
      lua_pushvalue,
      lua_setfield,
      lua_tostring,
      lua_touserdata
    } = require_lua();
    var {
      LUA_FILEHANDLE,
      luaL_checkany,
      luaL_checklstring,
      luaL_checkudata,
      luaL_error,
      luaL_fileresult,
      luaL_newlib,
      luaL_newmetatable,
      luaL_setfuncs,
      luaL_setmetatable,
      luaL_testudata
    } = require_lauxlib();
    var lualib2 = require_lualib();
    var { to_luastring: to_luastring2 } = require_fengaricore();
    var IO_PREFIX = "_IO_";
    var IOPREF_LEN = IO_PREFIX.length;
    var IO_INPUT = to_luastring2(IO_PREFIX + "input");
    var IO_OUTPUT = to_luastring2(IO_PREFIX + "output");
    var tolstream = function(L) {
      return luaL_checkudata(L, 1, LUA_FILEHANDLE);
    };
    var isclosed = function(p) {
      return p.closef === null;
    };
    var io_type = function(L) {
      luaL_checkany(L, 1);
      let p = luaL_testudata(L, 1, LUA_FILEHANDLE);
      if (p === null)
        lua_pushnil(L);
      else if (isclosed(p))
        lua_pushliteral(L, "closed file");
      else
        lua_pushliteral(L, "file");
      return 1;
    };
    var f_tostring = function(L) {
      let p = tolstream(L);
      if (isclosed(p))
        lua_pushliteral(L, "file (closed)");
      else
        lua_pushstring(L, to_luastring2(`file (${p.f.toString()})`));
      return 1;
    };
    var tofile = function(L) {
      let p = tolstream(L);
      if (isclosed(p))
        luaL_error(L, to_luastring2("attempt to use a closed file"));
      lualib2.lua_assert(p.f);
      return p.f;
    };
    var newprefile = function(L) {
      let p = lua_newuserdata(L);
      p.f = null;
      p.closef = null;
      luaL_setmetatable(L, LUA_FILEHANDLE);
      return p;
    };
    var aux_close = function(L) {
      let p = tolstream(L);
      let cf = p.closef;
      p.closef = null;
      return cf(L);
    };
    var io_close = function(L) {
      if (lua_isnone(L, 1))
        lua_getfield(L, LUA_REGISTRYINDEX, IO_OUTPUT);
      tofile(L);
      return aux_close(L);
    };
    var getiofile = function(L, findex) {
      lua_getfield(L, LUA_REGISTRYINDEX, findex);
      let p = lua_touserdata(L, -1);
      if (isclosed(p))
        luaL_error(L, to_luastring2("standard %s file is closed"), findex.subarray(IOPREF_LEN));
      return p.f;
    };
    var g_iofile = function(L, f, mode) {
      if (!lua_isnoneornil(L, 1)) {
        let filename = lua_tostring(L, 1);
        if (filename)
          luaL_error(L, to_luastring2("opening files not yet implemented"));
        else {
          tofile(L);
          lua_pushvalue(L, 1);
        }
        lua_setfield(L, LUA_REGISTRYINDEX, f);
      }
      lua_getfield(L, LUA_REGISTRYINDEX, f);
      return 1;
    };
    var io_input = function(L) {
      return g_iofile(L, IO_INPUT, "r");
    };
    var io_output = function(L) {
      return g_iofile(L, IO_OUTPUT, "w");
    };
    var prepare_string_for_write = process.versions.node > 6 ? (s) => s : (
      // identity function
      (s) => Buffer.from(s.buffer, s.byteOffset, s.byteLength)
    );
    var g_write = function(L, f, arg) {
      let nargs = lua_gettop(L) - arg;
      let status = true;
      let err;
      for (; nargs--; arg++) {
        let s = luaL_checklstring(L, arg);
        try {
          status = status && fs.writeSync(f.fd, prepare_string_for_write(s), 0, s.length) === s.length;
        } catch (e) {
          status = false;
          err = e;
        }
      }
      if (status) return 1;
      else return luaL_fileresult(L, status, null, err);
    };
    var io_write = function(L) {
      return g_write(L, getiofile(L, IO_OUTPUT), 1);
    };
    var f_write = function(L) {
      let f = tofile(L);
      lua_pushvalue(L, 1);
      return g_write(L, f, 2);
    };
    var io_flush = function(L) {
      getiofile(L, IO_OUTPUT);
      return luaL_fileresult(L, true, null, null);
    };
    var f_flush = function(L) {
      tofile(L);
      return luaL_fileresult(L, true, null, null);
    };
    var iolib = {
      "close": io_close,
      "flush": io_flush,
      "input": io_input,
      "output": io_output,
      "type": io_type,
      "write": io_write
    };
    var flib = {
      "close": io_close,
      "flush": f_flush,
      "write": f_write,
      "__tostring": f_tostring
    };
    var createmeta = function(L) {
      luaL_newmetatable(L, LUA_FILEHANDLE);
      lua_pushvalue(L, -1);
      lua_setfield(L, -2, to_luastring2("__index", true));
      luaL_setfuncs(L, flib, 0);
      lua_pop(L, 1);
    };
    var io_noclose = function(L) {
      let p = tolstream(L);
      p.closef = io_noclose;
      lua_pushnil(L);
      lua_pushliteral(L, "cannot close standard file");
      return 2;
    };
    var createstdfile = function(L, f, k, fname) {
      let p = newprefile(L);
      p.f = f;
      p.closef = io_noclose;
      if (k !== null) {
        lua_pushvalue(L, -1);
        lua_setfield(L, LUA_REGISTRYINDEX, k);
      }
      lua_setfield(L, -2, fname);
    };
    var luaopen_io = function(L) {
      luaL_newlib(L, iolib);
      createmeta(L);
      createstdfile(L, process.stdin, IO_INPUT, to_luastring2("stdin"));
      createstdfile(L, process.stdout, IO_OUTPUT, to_luastring2("stdout"));
      createstdfile(L, process.stderr, null, to_luastring2("stderr"));
      return 1;
    };
    module.exports.luaopen_io = luaopen_io;
  }
});

// vendor/fengari/src/loslib.js
var require_loslib = __commonJS({
  "vendor/fengari/src/loslib.js"(exports, module) {
    "use strict";
    var {
      LUA_TNIL,
      LUA_TTABLE,
      lua_close,
      lua_createtable,
      lua_getfield,
      lua_isboolean,
      lua_isnoneornil,
      lua_pop,
      lua_pushboolean,
      lua_pushfstring,
      lua_pushinteger,
      lua_pushliteral,
      lua_pushnil,
      lua_pushnumber,
      lua_pushstring,
      lua_setfield,
      lua_settop,
      lua_toboolean,
      lua_tointegerx
    } = require_lua();
    var {
      luaL_Buffer,
      luaL_addchar,
      luaL_addstring,
      // luaL_argcheck,
      luaL_argerror,
      luaL_buffinit,
      luaL_checkinteger,
      luaL_checkoption,
      luaL_checkstring,
      luaL_checktype,
      luaL_error,
      luaL_execresult,
      luaL_fileresult,
      luaL_newlib,
      luaL_optinteger,
      luaL_optlstring,
      luaL_optstring,
      luaL_pushresult
    } = require_lauxlib();
    var {
      luastring_eq,
      to_jsstring: to_jsstring2,
      to_luastring: to_luastring2
    } = require_fengaricore();
    var LUA_STRFTIMEOPTIONS = to_luastring2("aAbBcCdDeFhHIjklmMnpPrRStTuUwWxXyYzZ%");
    var setfield = function(L, key, value) {
      lua_pushinteger(L, value);
      lua_setfield(L, -2, to_luastring2(key, true));
    };
    var setallfields = function(L, time, utc) {
      setfield(L, "sec", utc ? time.getUTCSeconds() : time.getSeconds());
      setfield(L, "min", utc ? time.getUTCMinutes() : time.getMinutes());
      setfield(L, "hour", utc ? time.getUTCHours() : time.getHours());
      setfield(L, "day", utc ? time.getUTCDate() : time.getDate());
      setfield(L, "month", (utc ? time.getUTCMonth() : time.getMonth()) + 1);
      setfield(L, "year", utc ? time.getUTCFullYear() : time.getFullYear());
      setfield(L, "wday", (utc ? time.getUTCDay() : time.getDay()) + 1);
      setfield(L, "yday", Math.floor((time - new Date(
        time.getFullYear(),
        0,
        0
        /* shortcut to correct day by one */
      )) / 864e5));
    };
    var L_MAXDATEFIELD = Number.MAX_SAFE_INTEGER / 2;
    var getfield = function(L, key, d, delta) {
      let t = lua_getfield(L, -1, to_luastring2(key, true));
      let res = lua_tointegerx(L, -1);
      if (res === false) {
        if (t !== LUA_TNIL)
          return luaL_error(L, to_luastring2("field '%s' is not an integer"), key);
        else if (d < 0)
          return luaL_error(L, to_luastring2("field '%s' missing in date table"), key);
        res = d;
      } else {
        if (!(-L_MAXDATEFIELD <= res && res <= L_MAXDATEFIELD))
          return luaL_error(L, to_luastring2("field '%s' is out-of-bound"), key);
        res -= delta;
      }
      lua_pop(L, 1);
      return res;
    };
    var locale = {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((s) => to_luastring2(s)),
      shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((s) => to_luastring2(s)),
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((s) => to_luastring2(s)),
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((s) => to_luastring2(s)),
      AM: to_luastring2("AM"),
      PM: to_luastring2("PM"),
      am: to_luastring2("am"),
      pm: to_luastring2("pm"),
      formats: {
        c: to_luastring2("%a %b %e %H:%M:%S %Y"),
        D: to_luastring2("%m/%d/%y"),
        F: to_luastring2("%Y-%m-%d"),
        R: to_luastring2("%H:%M"),
        r: to_luastring2("%I:%M:%S %p"),
        T: to_luastring2("%H:%M:%S"),
        X: to_luastring2("%T"),
        x: to_luastring2("%D")
      }
    };
    var week_number = function(date, start_of_week) {
      let weekday = date.getDay();
      if (start_of_week === "monday") {
        if (weekday === 0)
          weekday = 6;
        else
          weekday--;
      }
      let yday = (date - new Date(date.getFullYear(), 0, 1)) / 864e5;
      return Math.floor((yday + 7 - weekday) / 7);
    };
    var push_pad_2 = function(b, n, pad) {
      if (n < 10)
        luaL_addchar(b, pad);
      luaL_addstring(b, to_luastring2(String(n)));
    };
    var strftime = function(L, b, s, date) {
      let i = 0;
      while (i < s.length) {
        if (s[i] !== 37) {
          luaL_addchar(b, s[i++]);
        } else {
          i++;
          let len = checkoption(L, s, i);
          switch (s[i]) {
            // '%'
            case 37:
              luaL_addchar(b, 37);
              break;
            // 'Thursday'
            case 65:
              luaL_addstring(b, locale.days[date.getDay()]);
              break;
            // 'January'
            case 66:
              luaL_addstring(b, locale.months[date.getMonth()]);
              break;
            // '19'
            case 67:
              push_pad_2(
                b,
                Math.floor(date.getFullYear() / 100),
                48
                /* 0 */
              );
              break;
            // '01/01/70'
            case 68:
              strftime(L, b, locale.formats.D, date);
              break;
            // '1970-01-01'
            case 70:
              strftime(L, b, locale.formats.F, date);
              break;
            // '00'
            case 72:
              push_pad_2(
                b,
                date.getHours(),
                48
                /* 0 */
              );
              break;
            // '12'
            case 73:
              push_pad_2(
                b,
                (date.getHours() + 11) % 12 + 1,
                48
                /* 0 */
              );
              break;
            // '00'
            case 77:
              push_pad_2(
                b,
                date.getMinutes(),
                48
                /* 0 */
              );
              break;
            // 'am'
            case 80:
              luaL_addstring(b, date.getHours() < 12 ? locale.am : locale.pm);
              break;
            // '00:00'
            case 82:
              strftime(L, b, locale.formats.R, date);
              break;
            // '00'
            case 83:
              push_pad_2(
                b,
                date.getSeconds(),
                48
                /* 0 */
              );
              break;
            // '00:00:00'
            case 84:
              strftime(L, b, locale.formats.T, date);
              break;
            // '00'
            case 85:
              push_pad_2(
                b,
                week_number(date, "sunday"),
                48
                /* 0 */
              );
              break;
            // '00'
            case 87:
              push_pad_2(
                b,
                week_number(date, "monday"),
                48
                /* 0 */
              );
              break;
            // '16:00:00'
            case 88:
              strftime(L, b, locale.formats.X, date);
              break;
            // '1970'
            case 89:
              luaL_addstring(b, to_luastring2(String(date.getFullYear())));
              break;
            // 'GMT'
            case 90: {
              let tzString = date.toString().match(/\(([\w\s]+)\)/);
              if (tzString)
                luaL_addstring(b, to_luastring2(tzString[1]));
              break;
            }
            // 'Thu'
            case 97:
              luaL_addstring(b, locale.shortDays[date.getDay()]);
              break;
            // 'Jan'
            case 98:
            case 104:
              luaL_addstring(b, locale.shortMonths[date.getMonth()]);
              break;
            // ''
            case 99:
              strftime(L, b, locale.formats.c, date);
              break;
            // '01'
            case 100:
              push_pad_2(
                b,
                date.getDate(),
                48
                /* 0 */
              );
              break;
            // ' 1'
            case 101:
              push_pad_2(
                b,
                date.getDate(),
                32
                /* space */
              );
              break;
            // '000'
            case 106: {
              let yday = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / 864e5);
              if (yday < 100) {
                if (yday < 10)
                  luaL_addchar(
                    b,
                    48
                    /* 0 */
                  );
                luaL_addchar(
                  b,
                  48
                  /* 0 */
                );
              }
              luaL_addstring(b, to_luastring2(String(yday)));
              break;
            }
            // ' 0'
            case 107:
              push_pad_2(
                b,
                date.getHours(),
                32
                /* space */
              );
              break;
            // '12'
            case 108:
              push_pad_2(
                b,
                (date.getHours() + 11) % 12 + 1,
                32
                /* space */
              );
              break;
            // '01'
            case 109:
              push_pad_2(
                b,
                date.getMonth() + 1,
                48
                /* 0 */
              );
              break;
            // '\n'
            case 110:
              luaL_addchar(b, 10);
              break;
            // 'AM'
            case 112:
              luaL_addstring(b, date.getHours() < 12 ? locale.AM : locale.PM);
              break;
            // '12:00:00 AM'
            case 114:
              strftime(L, b, locale.formats.r, date);
              break;
            // '0'
            case 115:
              luaL_addstring(b, to_luastring2(String(Math.floor(date / 1e3))));
              break;
            // '\t'
            case 116:
              luaL_addchar(b, 8);
              break;
            // '4'
            case 117: {
              let day = date.getDay();
              luaL_addstring(b, to_luastring2(String(day === 0 ? 7 : day)));
              break;
            }
            // '4'
            case 119:
              luaL_addstring(b, to_luastring2(String(date.getDay())));
              break;
            // '12/31/69'
            case 120:
              strftime(L, b, locale.formats.x, date);
              break;
            // '70'
            case 121:
              push_pad_2(
                b,
                date.getFullYear() % 100,
                48
                /* 0 */
              );
              break;
            // '+0000'
            case 122: {
              let off = date.getTimezoneOffset();
              if (off > 0) {
                luaL_addchar(
                  b,
                  45
                  /* - */
                );
              } else {
                off = -off;
                luaL_addchar(
                  b,
                  43
                  /* + */
                );
              }
              push_pad_2(
                b,
                Math.floor(off / 60),
                48
                /* 0 */
              );
              push_pad_2(
                b,
                off % 60,
                48
                /* 0 */
              );
              break;
            }
          }
          i += len;
        }
      }
    };
    var checkoption = function(L, conv, i) {
      let option = LUA_STRFTIMEOPTIONS;
      let o = 0;
      let oplen = 1;
      for (; o < option.length && oplen <= conv.length - i; o += oplen) {
        if (option[o] === "|".charCodeAt(0))
          oplen++;
        else if (luastring_eq(conv.subarray(i, i + oplen), option.subarray(o, o + oplen))) {
          return oplen;
        }
      }
      luaL_argerror(
        L,
        1,
        lua_pushfstring(L, to_luastring2("invalid conversion specifier '%%%s'"), conv)
      );
    };
    var os_date = function(L) {
      let s = luaL_optlstring(L, 1, "%c");
      let stm = lua_isnoneornil(L, 2) ? /* @__PURE__ */ new Date() : new Date(l_checktime(L, 2) * 1e3);
      let utc = false;
      let i = 0;
      if (s[i] === "!".charCodeAt(0)) {
        utc = true;
        i++;
      }
      if (s[i] === "*".charCodeAt(0) && s[i + 1] === "t".charCodeAt(0)) {
        lua_createtable(L, 0, 9);
        setallfields(L, stm, utc);
      } else {
        let cc = new Uint8Array(4);
        cc[0] = "%".charCodeAt(0);
        let b = new luaL_Buffer();
        luaL_buffinit(L, b);
        strftime(L, b, s, stm);
        luaL_pushresult(b);
      }
      return 1;
    };
    var os_time = function(L) {
      let t;
      if (lua_isnoneornil(L, 1))
        t = /* @__PURE__ */ new Date();
      else {
        luaL_checktype(L, 1, LUA_TTABLE);
        lua_settop(L, 1);
        t = new Date(
          getfield(L, "year", -1, 0),
          getfield(L, "month", -1, 1),
          getfield(L, "day", -1, 0),
          getfield(L, "hour", 12, 0),
          getfield(L, "min", 0, 0),
          getfield(L, "sec", 0, 0)
        );
        setallfields(L, t);
      }
      lua_pushinteger(L, Math.floor(t / 1e3));
      return 1;
    };
    var l_checktime = function(L, arg) {
      let t = luaL_checkinteger(L, arg);
      return t;
    };
    var os_difftime = function(L) {
      let t1 = l_checktime(L, 1);
      let t2 = l_checktime(L, 2);
      lua_pushnumber(L, t1 - t2);
      return 1;
    };
    var catnames = ["all", "collate", "ctype", "monetary", "numeric", "time"].map((lc) => to_luastring2(lc));
    var C = to_luastring2("C");
    var POSIX = to_luastring2("POSIX");
    var os_setlocale = function(L) {
      const l = luaL_optstring(L, 1, null);
      luaL_checkoption(L, 2, "all", catnames);
      lua_pushstring(L, l === null || l.length == 0 || luastring_eq(l, C) || luastring_eq(l, POSIX) ? C : null);
      return 1;
    };
    var syslib = {
      "date": os_date,
      "difftime": os_difftime,
      "setlocale": os_setlocale,
      "time": os_time
    };
    if (typeof process === "undefined") {
      syslib.clock = function(L) {
        const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        lua_pushnumber(L, now / 1e3);
        return 1;
      };
    } else {
      const __nsmRequire = (m) => {
        try {
          return __require(m);
        } catch (e) {
          return null;
        }
      };
      const fs = __nsmRequire("fs");
      const tmp = __nsmRequire("tmp");
      const child_process = __nsmRequire("child_process");
      syslib.exit = function(L) {
        let status;
        if (lua_isboolean(L, 1))
          status = lua_toboolean(L, 1) ? 0 : 1;
        else
          status = luaL_optinteger(L, 1, 0);
        if (lua_toboolean(L, 2))
          lua_close(L);
        if (L) process.exit(status);
        return 0;
      };
      syslib.getenv = function(L) {
        let key = luaL_checkstring(L, 1);
        key = to_jsstring2(key);
        if (Object.prototype.hasOwnProperty.call(process.env, key)) {
          lua_pushliteral(L, process.env[key]);
        } else {
          lua_pushnil(L);
        }
        return 1;
      };
      syslib.clock = function(L) {
        lua_pushnumber(L, process.uptime());
        return 1;
      };
      const lua_tmpname = function() {
        return tmp.tmpNameSync();
      };
      syslib.remove = function(L) {
        let filename = luaL_checkstring(L, 1);
        try {
          fs.unlinkSync(filename);
        } catch (e) {
          if (e.code === "EISDIR") {
            try {
              fs.rmdirSync(filename);
            } catch (e2) {
              return luaL_fileresult(L, false, filename, e2);
            }
          } else {
            return luaL_fileresult(L, false, filename, e);
          }
        }
        return luaL_fileresult(L, true);
      };
      syslib.rename = function(L) {
        let fromname = luaL_checkstring(L, 1);
        let toname = luaL_checkstring(L, 2);
        try {
          fs.renameSync(fromname, toname);
        } catch (e) {
          return luaL_fileresult(L, false, false, e);
        }
        return luaL_fileresult(L, true);
      };
      syslib.tmpname = function(L) {
        let name = lua_tmpname();
        if (!name)
          return luaL_error(L, to_luastring2("unable to generate a unique filename"));
        lua_pushstring(L, to_luastring2(name));
        return 1;
      };
      syslib.execute = function(L) {
        let cmd = luaL_optstring(L, 1, null);
        if (cmd !== null) {
          cmd = to_jsstring2(cmd);
          try {
            child_process.execSync(
              cmd,
              {
                stdio: [process.stdin, process.stdout, process.stderr]
              }
            );
          } catch (e) {
            return luaL_execresult(L, e);
          }
          return luaL_execresult(L, null);
        } else {
          lua_pushboolean(L, 1);
          return 1;
        }
      };
    }
    var luaopen_os = function(L) {
      luaL_newlib(L, syslib);
      return 1;
    };
    module.exports.luaopen_os = luaopen_os;
  }
});

// vendor/sprintf-js/src/sprintf.js
var require_sprintf = __commonJS({
  "vendor/sprintf-js/src/sprintf.js"(exports) {
    !(function() {
      "use strict";
      var re = {
        not_string: /[^s]/,
        not_bool: /[^t]/,
        not_type: /[^T]/,
        not_primitive: /[^v]/,
        number: /[diefg]/,
        numeric_arg: /[bcdiefguxX]/,
        json: /[j]/,
        not_json: /[^j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[+-]/
      };
      function sprintf(key) {
        return sprintf_format(sprintf_parse(key), arguments);
      }
      function vsprintf(fmt, argv) {
        return sprintf.apply(null, [fmt].concat(argv || []));
      }
      function sprintf_format(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, arg, output = "", i, k, ph, pad, pad_character, pad_length, is_positive, sign;
        for (i = 0; i < tree_length; i++) {
          if (typeof parse_tree[i] === "string") {
            output += parse_tree[i];
          } else if (typeof parse_tree[i] === "object") {
            ph = parse_tree[i];
            if (ph.keys) {
              arg = argv[cursor];
              for (k = 0; k < ph.keys.length; k++) {
                if (arg == void 0) {
                  throw new Error(sprintf('[sprintf] Cannot access property "%s" of undefined value "%s"', ph.keys[k], ph.keys[k - 1]));
                }
                arg = arg[ph.keys[k]];
              }
            } else if (ph.param_no) {
              arg = argv[ph.param_no];
            } else {
              arg = argv[cursor++];
            }
            if (re.not_type.test(ph.type) && re.not_primitive.test(ph.type) && arg instanceof Function) {
              arg = arg();
            }
            if (re.numeric_arg.test(ph.type) && (typeof arg !== "number" && isNaN(arg))) {
              throw new TypeError(sprintf("[sprintf] expecting number but found %T", arg));
            }
            if (re.number.test(ph.type)) {
              is_positive = arg >= 0;
            }
            switch (ph.type) {
              case "b":
                arg = parseInt(arg, 10).toString(2);
                break;
              case "c":
                arg = String.fromCharCode(parseInt(arg, 10));
                break;
              case "d":
              case "i":
                arg = parseInt(arg, 10);
                break;
              case "j":
                arg = JSON.stringify(arg, null, ph.width ? parseInt(ph.width) : 0);
                break;
              case "e":
                arg = ph.precision ? parseFloat(arg).toExponential(ph.precision) : parseFloat(arg).toExponential();
                break;
              case "f":
                arg = ph.precision ? parseFloat(arg).toFixed(ph.precision) : parseFloat(arg);
                break;
              case "g":
                arg = ph.precision ? String(Number(arg.toPrecision(ph.precision))) : parseFloat(arg);
                break;
              case "o":
                arg = (parseInt(arg, 10) >>> 0).toString(8);
                break;
              case "s":
                arg = String(arg);
                arg = ph.precision ? arg.substring(0, ph.precision) : arg;
                break;
              case "t":
                arg = String(!!arg);
                arg = ph.precision ? arg.substring(0, ph.precision) : arg;
                break;
              case "T":
                arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
                arg = ph.precision ? arg.substring(0, ph.precision) : arg;
                break;
              case "u":
                arg = parseInt(arg, 10) >>> 0;
                break;
              case "v":
                arg = arg.valueOf();
                arg = ph.precision ? arg.substring(0, ph.precision) : arg;
                break;
              case "x":
                arg = (parseInt(arg, 10) >>> 0).toString(16);
                break;
              case "X":
                arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase();
                break;
            }
            if (re.json.test(ph.type)) {
              output += arg;
            } else {
              if (re.number.test(ph.type) && (!is_positive || ph.sign)) {
                sign = is_positive ? "+" : "-";
                arg = arg.toString().replace(re.sign, "");
              } else {
                sign = "";
              }
              pad_character = ph.pad_char ? ph.pad_char === "0" ? "0" : ph.pad_char.charAt(1) : " ";
              pad_length = ph.width - (sign + arg).length;
              pad = ph.width ? pad_length > 0 ? pad_character.repeat(pad_length) : "" : "";
              output += ph.align ? sign + arg + pad : pad_character === "0" ? sign + pad + arg : pad + sign + arg;
            }
          }
        }
        return output;
      }
      var sprintf_cache = /* @__PURE__ */ Object.create(null);
      function sprintf_parse(fmt) {
        if (sprintf_cache[fmt]) {
          return sprintf_cache[fmt];
        }
        var _fmt = fmt, match, parse_tree = [], arg_names = 0;
        while (_fmt) {
          if ((match = re.text.exec(_fmt)) !== null) {
            parse_tree.push(match[0]);
          } else if ((match = re.modulo.exec(_fmt)) !== null) {
            parse_tree.push("%");
          } else if ((match = re.placeholder.exec(_fmt)) !== null) {
            if (match[2]) {
              arg_names |= 1;
              var field_list = [], replacement_field = match[2], field_match = [];
              if ((field_match = re.key.exec(replacement_field)) !== null) {
                field_list.push(field_match[1]);
                while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
                  if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                    field_list.push(field_match[1]);
                  } else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                    field_list.push(field_match[1]);
                  } else {
                    throw new SyntaxError("[sprintf] failed to parse named argument key");
                  }
                }
              } else {
                throw new SyntaxError("[sprintf] failed to parse named argument key");
              }
              match[2] = field_list;
            } else {
              arg_names |= 2;
            }
            if (arg_names === 3) {
              throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");
            }
            parse_tree.push(
              {
                placeholder: match[0],
                param_no: match[1],
                keys: match[2],
                sign: match[3],
                pad_char: match[4],
                align: match[5],
                width: match[6],
                precision: match[7],
                type: match[8]
              }
            );
          } else {
            throw new SyntaxError("[sprintf] unexpected placeholder");
          }
          _fmt = _fmt.substring(match[0].length);
        }
        return sprintf_cache[fmt] = parse_tree;
      }
      if (typeof exports !== "undefined") {
        exports["sprintf"] = sprintf;
        exports["vsprintf"] = vsprintf;
      }
      if (typeof window !== "undefined") {
        window["sprintf"] = sprintf;
        window["vsprintf"] = vsprintf;
        if (typeof define === "function" && define["amd"]) {
          define(function() {
            return {
              "sprintf": sprintf,
              "vsprintf": vsprintf
            };
          });
        }
      }
    })();
  }
});

// vendor/fengari/src/lstrlib.js
var require_lstrlib = __commonJS({
  "vendor/fengari/src/lstrlib.js"(exports, module) {
    "use strict";
    var { sprintf } = require_sprintf();
    var {
      LUA_INTEGER_FMT,
      LUA_INTEGER_FRMLEN,
      LUA_MININTEGER,
      LUA_NUMBER_FMT,
      LUA_NUMBER_FRMLEN,
      frexp,
      lua_getlocaledecpoint
    } = require_luaconf();
    var {
      LUA_TBOOLEAN,
      LUA_TFUNCTION,
      LUA_TNIL,
      LUA_TNUMBER,
      LUA_TSTRING,
      LUA_TTABLE,
      lua_call,
      lua_createtable,
      lua_dump,
      lua_gettable,
      lua_gettop,
      lua_isinteger,
      lua_isstring,
      lua_pop,
      lua_pushcclosure,
      lua_pushinteger,
      lua_pushlightuserdata,
      lua_pushliteral,
      lua_pushlstring,
      lua_pushnil,
      lua_pushnumber,
      lua_pushstring,
      lua_pushvalue,
      lua_remove,
      lua_setfield,
      lua_setmetatable,
      lua_settop,
      lua_toboolean,
      lua_tointeger,
      lua_tonumber,
      lua_tostring,
      lua_touserdata,
      lua_type,
      lua_upvalueindex
    } = require_lua();
    var {
      luaL_Buffer,
      luaL_addchar,
      luaL_addlstring,
      luaL_addsize,
      luaL_addstring,
      luaL_addvalue,
      luaL_argcheck,
      luaL_argerror,
      luaL_buffinit,
      luaL_buffinitsize,
      luaL_checkinteger,
      luaL_checknumber,
      luaL_checkstack,
      luaL_checkstring,
      luaL_checktype,
      luaL_error,
      luaL_newlib,
      luaL_optinteger,
      luaL_optstring,
      luaL_prepbuffsize,
      luaL_pushresult,
      luaL_pushresultsize,
      luaL_tolstring,
      luaL_typename
    } = require_lauxlib();
    var lualib2 = require_lualib();
    var {
      luastring_eq,
      luastring_indexOf,
      to_jsstring: to_jsstring2,
      to_luastring: to_luastring2
    } = require_fengaricore();
    var sL_ESC = "%";
    var L_ESC = sL_ESC.charCodeAt(0);
    var LUA_MAXCAPTURES = 32;
    var MAXSIZE = 2147483647;
    var strlen = function(s) {
      let len = luastring_indexOf(s, 0);
      return len > -1 ? len : s.length;
    };
    var posrelat = function(pos, len) {
      if (pos >= 0) return pos;
      else if (0 - pos > len) return 0;
      else return len + pos + 1;
    };
    var str_sub = function(L) {
      let s = luaL_checkstring(L, 1);
      let l = s.length;
      let start = posrelat(luaL_checkinteger(L, 2), l);
      let end = posrelat(luaL_optinteger(L, 3, -1), l);
      if (start < 1) start = 1;
      if (end > l) end = l;
      if (start <= end)
        lua_pushstring(L, s.subarray(start - 1, start - 1 + (end - start + 1)));
      else lua_pushliteral(L, "");
      return 1;
    };
    var str_len = function(L) {
      lua_pushinteger(L, luaL_checkstring(L, 1).length);
      return 1;
    };
    var str_char = function(L) {
      let n = lua_gettop(L);
      let b = new luaL_Buffer();
      let p = luaL_buffinitsize(L, b, n);
      for (let i = 1; i <= n; i++) {
        let c = luaL_checkinteger(L, i);
        luaL_argcheck(L, c >= 0 && c <= 255, "value out of range");
        p[i - 1] = c;
      }
      luaL_pushresultsize(b, n);
      return 1;
    };
    var writer = function(L, b, size, B) {
      luaL_addlstring(B, b, size);
      return 0;
    };
    var str_dump = function(L) {
      let b = new luaL_Buffer();
      let strip = lua_toboolean(L, 2);
      luaL_checktype(L, 1, LUA_TFUNCTION);
      lua_settop(L, 1);
      luaL_buffinit(L, b);
      if (lua_dump(L, writer, b, strip) !== 0)
        return luaL_error(L, to_luastring2("unable to dump given function"));
      luaL_pushresult(b);
      return 1;
    };
    var SIZELENMOD = LUA_NUMBER_FRMLEN.length + 1;
    var L_NBFD = 1;
    var num2straux = function(x) {
      if (Object.is(x, Infinity))
        return to_luastring2("inf");
      else if (Object.is(x, -Infinity))
        return to_luastring2("-inf");
      else if (Number.isNaN(x))
        return to_luastring2("nan");
      else if (x === 0) {
        let zero = sprintf(LUA_NUMBER_FMT + "x0p+0", x);
        if (Object.is(x, -0))
          zero = "-" + zero;
        return to_luastring2(zero);
      } else {
        let buff = "";
        let fe = frexp(x);
        let m = fe[0];
        let e = fe[1];
        if (m < 0) {
          buff += "-";
          m = -m;
        }
        buff += "0x";
        buff += (m * (1 << L_NBFD)).toString(16);
        e -= L_NBFD;
        buff += sprintf("p%+d", e);
        return to_luastring2(buff);
      }
    };
    var lua_number2strx = function(L, fmt, x) {
      let buff = num2straux(x);
      if (fmt[SIZELENMOD] === 65) {
        for (let i = 0; i < buff.length; i++) {
          let c = buff[i];
          if (c >= 97)
            buff[i] = c & 223;
        }
      } else if (fmt[SIZELENMOD] !== 97)
        luaL_error(L, to_luastring2("modifiers for format '%%a'/'%%A' not implemented"));
      return buff;
    };
    var FLAGS = to_luastring2("-+ #0");
    var isalpha = (e) => 97 <= e && e <= 122 || 65 <= e && e <= 90;
    var isdigit = (e) => 48 <= e && e <= 57;
    var iscntrl = (e) => 0 <= e && e <= 31 || e === 127;
    var isgraph = (e) => 33 <= e && e <= 126;
    var islower = (e) => 97 <= e && e <= 122;
    var isupper = (e) => 65 <= e && e <= 90;
    var isalnum = (e) => 97 <= e && e <= 122 || 65 <= e && e <= 90 || 48 <= e && e <= 57;
    var ispunct = (e) => isgraph(e) && !isalnum(e);
    var isspace = (e) => e === 32 || e >= 9 && e <= 13;
    var isxdigit = (e) => 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
    var addquoted = function(b, s, len) {
      luaL_addchar(
        b,
        34
        /* '"'.charCodeAt(0) */
      );
      let i = 0;
      while (len--) {
        if (s[i] === 34 || s[i] === 92 || s[i] === 10) {
          luaL_addchar(
            b,
            92
            /* '\\'.charCodeAt(0) */
          );
          luaL_addchar(b, s[i]);
        } else if (iscntrl(s[i])) {
          let buff = "" + s[i];
          if (isdigit(s[i + 1]))
            buff = ("000" + buff).slice(-3);
          luaL_addstring(b, to_luastring2("\\" + buff));
        } else
          luaL_addchar(b, s[i]);
        i++;
      }
      luaL_addchar(
        b,
        34
        /* '"'.charCodeAt(0) */
      );
    };
    var checkdp = function(buff) {
      if (luastring_indexOf(
        buff,
        46
        /* ('.').charCodeAt(0) */
      ) < 0) {
        let point = lua_getlocaledecpoint();
        let ppoint = luastring_indexOf(buff, point);
        if (ppoint) buff[ppoint] = 46;
      }
    };
    var addliteral = function(L, b, arg) {
      switch (lua_type(L, arg)) {
        case LUA_TSTRING: {
          let s = lua_tostring(L, arg);
          addquoted(b, s, s.length);
          break;
        }
        case LUA_TNUMBER: {
          let buff;
          if (!lua_isinteger(L, arg)) {
            let n = lua_tonumber(L, arg);
            buff = lua_number2strx(L, to_luastring2(`%${LUA_INTEGER_FRMLEN}a`), n);
            checkdp(buff);
          } else {
            let n = lua_tointeger(L, arg);
            let format = n === LUA_MININTEGER ? "0x%" + LUA_INTEGER_FRMLEN + "x" : LUA_INTEGER_FMT;
            buff = to_luastring2(sprintf(format, n));
          }
          luaL_addstring(b, buff);
          break;
        }
        case LUA_TNIL:
        case LUA_TBOOLEAN: {
          luaL_tolstring(L, arg);
          luaL_addvalue(b);
          break;
        }
        default: {
          luaL_argerror(L, arg, to_luastring2("value has no literal form"));
        }
      }
    };
    var scanformat = function(L, strfrmt, i, form) {
      let p = i;
      while (strfrmt[p] !== 0 && luastring_indexOf(FLAGS, strfrmt[p]) >= 0) p++;
      if (p - i >= FLAGS.length)
        luaL_error(L, to_luastring2("invalid format (repeated flags)"));
      if (isdigit(strfrmt[p])) p++;
      if (isdigit(strfrmt[p])) p++;
      if (strfrmt[p] === 46) {
        p++;
        if (isdigit(strfrmt[p])) p++;
        if (isdigit(strfrmt[p])) p++;
      }
      if (isdigit(strfrmt[p]))
        luaL_error(L, to_luastring2("invalid format (width or precision too long)"));
      form[0] = 37;
      for (let j = 0; j < p - i + 1; j++)
        form[j + 1] = strfrmt[i + j];
      return p;
    };
    var addlenmod = function(form, lenmod) {
      let l = form.length;
      let lm = lenmod.length;
      let spec = form[l - 1];
      for (let i = 0; i < lm; i++)
        form[i + l - 1] = lenmod[i];
      form[l + lm - 1] = spec;
    };
    var str_format = function(L) {
      let top = lua_gettop(L);
      let arg = 1;
      let strfrmt = luaL_checkstring(L, arg);
      let i = 0;
      let b = new luaL_Buffer();
      luaL_buffinit(L, b);
      while (i < strfrmt.length) {
        if (strfrmt[i] !== L_ESC) {
          luaL_addchar(b, strfrmt[i++]);
        } else if (strfrmt[++i] === L_ESC) {
          luaL_addchar(b, strfrmt[i++]);
        } else {
          let form = [];
          if (++arg > top)
            luaL_argerror(L, arg, to_luastring2("no value"));
          i = scanformat(L, strfrmt, i, form);
          switch (String.fromCharCode(strfrmt[i++])) {
            case "c": {
              luaL_addchar(b, luaL_checkinteger(L, arg));
              break;
            }
            case "d":
            case "i":
            case "o":
            case "u":
            case "x":
            case "X": {
              let n = luaL_checkinteger(L, arg);
              addlenmod(form, to_luastring2(LUA_INTEGER_FRMLEN, true));
              luaL_addstring(b, to_luastring2(sprintf(String.fromCharCode(...form), n)));
              break;
            }
            case "a":
            case "A": {
              addlenmod(form, to_luastring2(LUA_INTEGER_FRMLEN, true));
              luaL_addstring(b, lua_number2strx(L, form, luaL_checknumber(L, arg)));
              break;
            }
            case "e":
            case "E":
            case "f":
            case "g":
            case "G": {
              let n = luaL_checknumber(L, arg);
              addlenmod(form, to_luastring2(LUA_INTEGER_FRMLEN, true));
              luaL_addstring(b, to_luastring2(sprintf(String.fromCharCode(...form), n)));
              break;
            }
            case "q": {
              addliteral(L, b, arg);
              break;
            }
            case "s": {
              let s = luaL_tolstring(L, arg);
              if (form.length <= 2 || form[2] === 0) {
                luaL_addvalue(b);
              } else {
                luaL_argcheck(L, s.length === strlen(s), arg, "string contains zeros");
                if (luastring_indexOf(
                  form,
                  46
                  /* '.'.charCodeAt(0) */
                ) < 0 && s.length >= 100) {
                  luaL_addvalue(b);
                } else {
                  luaL_addstring(b, to_luastring2(sprintf(String.fromCharCode(...form), to_jsstring2(s))));
                  lua_pop(L, 1);
                }
              }
              break;
            }
            default: {
              return luaL_error(L, to_luastring2("invalid option '%%%c' to 'format'"), strfrmt[i - 1]);
            }
          }
        }
      }
      luaL_pushresult(b);
      return 1;
    };
    var LUAL_PACKPADBYTE = 0;
    var MAXINTSIZE = 16;
    var SZINT = 4;
    var NB = 8;
    var MC = (1 << NB) - 1;
    var MAXALIGN = 8;
    var Header = class {
      constructor(L) {
        this.L = L;
        this.islittle = true;
        this.maxalign = 1;
      }
    };
    var Kint = 0;
    var Kuint = 1;
    var Kfloat = 2;
    var Kchar = 3;
    var Kstring = 4;
    var Kzstr = 5;
    var Kpadding = 6;
    var Kpaddalign = 7;
    var Knop = 8;
    var digit = isdigit;
    var getnum = function(fmt, df) {
      if (fmt.off >= fmt.s.length || !digit(fmt.s[fmt.off]))
        return df;
      else {
        let a = 0;
        do {
          a = a * 10 + (fmt.s[fmt.off++] - 48);
        } while (fmt.off < fmt.s.length && digit(fmt.s[fmt.off]) && a <= (MAXSIZE - 9) / 10);
        return a;
      }
    };
    var getnumlimit = function(h, fmt, df) {
      let sz = getnum(fmt, df);
      if (sz > MAXINTSIZE || sz <= 0)
        luaL_error(h.L, to_luastring2("integral size (%d) out of limits [1,%d]"), sz, MAXINTSIZE);
      return sz;
    };
    var getoption = function(h, fmt) {
      let r = {
        opt: fmt.s[fmt.off++],
        size: 0
        /* default */
      };
      switch (r.opt) {
        case 98:
          r.size = 1;
          r.opt = Kint;
          return r;
        // sizeof(char): 1
        case 66:
          r.size = 1;
          r.opt = Kuint;
          return r;
        case 104:
          r.size = 2;
          r.opt = Kint;
          return r;
        // sizeof(short): 2
        case 72:
          r.size = 2;
          r.opt = Kuint;
          return r;
        case 108:
          r.size = 4;
          r.opt = Kint;
          return r;
        // sizeof(long): 4
        case 76:
          r.size = 4;
          r.opt = Kuint;
          return r;
        case 106:
          r.size = 4;
          r.opt = Kint;
          return r;
        // sizeof(lua_Integer): 4
        case 74:
          r.size = 4;
          r.opt = Kuint;
          return r;
        case 84:
          r.size = 4;
          r.opt = Kuint;
          return r;
        // sizeof(size_t): 4
        case 102:
          r.size = 4;
          r.opt = Kfloat;
          return r;
        // sizeof(float): 4
        case 100:
          r.size = 8;
          r.opt = Kfloat;
          return r;
        // sizeof(double): 8
        case 110:
          r.size = 8;
          r.opt = Kfloat;
          return r;
        // sizeof(lua_Number): 8
        case 105:
          r.size = getnumlimit(h, fmt, 4);
          r.opt = Kint;
          return r;
        // sizeof(int): 4
        case 73:
          r.size = getnumlimit(h, fmt, 4);
          r.opt = Kuint;
          return r;
        case 115:
          r.size = getnumlimit(h, fmt, 4);
          r.opt = Kstring;
          return r;
        case 99: {
          r.size = getnum(fmt, -1);
          if (r.size === -1)
            luaL_error(h.L, to_luastring2("missing size for format option 'c'"));
          r.opt = Kchar;
          return r;
        }
        case 122:
          r.opt = Kzstr;
          return r;
        case 120:
          r.size = 1;
          r.opt = Kpadding;
          return r;
        case 88:
          r.opt = Kpaddalign;
          return r;
        case 32:
          break;
        case 60:
          h.islittle = true;
          break;
        case 62:
          h.islittle = false;
          break;
        case 61:
          h.islittle = true;
          break;
        case 33:
          h.maxalign = getnumlimit(h, fmt, MAXALIGN);
          break;
        default:
          luaL_error(h.L, to_luastring2("invalid format option '%c'"), r.opt);
      }
      r.opt = Knop;
      return r;
    };
    var getdetails = function(h, totalsize, fmt) {
      let r = {
        opt: NaN,
        size: NaN,
        ntoalign: NaN
      };
      let opt = getoption(h, fmt);
      r.size = opt.size;
      r.opt = opt.opt;
      let align = r.size;
      if (r.opt === Kpaddalign) {
        if (fmt.off >= fmt.s.length || fmt.s[fmt.off] === 0)
          luaL_argerror(h.L, 1, to_luastring2("invalid next option for option 'X'"));
        else {
          let o = getoption(h, fmt);
          align = o.size;
          o = o.opt;
          if (o === Kchar || align === 0)
            luaL_argerror(h.L, 1, to_luastring2("invalid next option for option 'X'"));
        }
      }
      if (align <= 1 || r.opt === Kchar)
        r.ntoalign = 0;
      else {
        if (align > h.maxalign)
          align = h.maxalign;
        if ((align & align - 1) !== 0)
          luaL_argerror(h.L, 1, to_luastring2("format asks for alignment not power of 2"));
        r.ntoalign = align - (totalsize & align - 1) & align - 1;
      }
      return r;
    };
    var packint = function(b, n, islittle, size, neg) {
      let buff = luaL_prepbuffsize(b, size);
      buff[islittle ? 0 : size - 1] = n & MC;
      for (let i = 1; i < size; i++) {
        n >>= NB;
        buff[islittle ? i : size - 1 - i] = n & MC;
      }
      if (neg && size > SZINT) {
        for (let i = SZINT; i < size; i++)
          buff[islittle ? i : size - 1 - i] = MC;
      }
      luaL_addsize(b, size);
    };
    var str_pack = function(L) {
      let b = new luaL_Buffer();
      let h = new Header(L);
      let fmt = {
        s: luaL_checkstring(L, 1),
        /* format string */
        off: 0
      };
      let arg = 1;
      let totalsize = 0;
      lua_pushnil(L);
      luaL_buffinit(L, b);
      while (fmt.off < fmt.s.length) {
        let details = getdetails(h, totalsize, fmt);
        let opt = details.opt;
        let size = details.size;
        let ntoalign = details.ntoalign;
        totalsize += ntoalign + size;
        while (ntoalign-- > 0)
          luaL_addchar(b, LUAL_PACKPADBYTE);
        arg++;
        switch (opt) {
          case Kint: {
            let n = luaL_checkinteger(L, arg);
            if (size < SZINT) {
              let lim = 1 << size * 8 - 1;
              luaL_argcheck(L, -lim <= n && n < lim, arg, "integer overflow");
            }
            packint(b, n, h.islittle, size, n < 0);
            break;
          }
          case Kuint: {
            let n = luaL_checkinteger(L, arg);
            if (size < SZINT)
              luaL_argcheck(L, n >>> 0 < 1 << size * NB, arg, "unsigned overflow");
            packint(b, n >>> 0, h.islittle, size, false);
            break;
          }
          case Kfloat: {
            let buff = luaL_prepbuffsize(b, size);
            let n = luaL_checknumber(L, arg);
            let dv = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);
            if (size === 4) dv.setFloat32(0, n, h.islittle);
            else dv.setFloat64(0, n, h.islittle);
            luaL_addsize(b, size);
            break;
          }
          case Kchar: {
            let s = luaL_checkstring(L, arg);
            let len = s.length;
            luaL_argcheck(L, len <= size, arg, "string longer than given size");
            luaL_addlstring(b, s, len);
            while (len++ < size)
              luaL_addchar(b, LUAL_PACKPADBYTE);
            break;
          }
          case Kstring: {
            let s = luaL_checkstring(L, arg);
            let len = s.length;
            luaL_argcheck(
              L,
              size >= 4 || len < 1 << size * NB,
              arg,
              "string length does not fit in given size"
            );
            packint(b, len, h.islittle, size, 0);
            luaL_addlstring(b, s, len);
            totalsize += len;
            break;
          }
          case Kzstr: {
            let s = luaL_checkstring(L, arg);
            let len = s.length;
            luaL_argcheck(L, luastring_indexOf(s, 0) < 0, arg, "strings contains zeros");
            luaL_addlstring(b, s, len);
            luaL_addchar(b, 0);
            totalsize += len + 1;
            break;
          }
          case Kpadding:
            luaL_addchar(b, LUAL_PACKPADBYTE);
          /* fall through */
          case Kpaddalign:
          case Knop:
            arg--;
            break;
        }
      }
      luaL_pushresult(b);
      return 1;
    };
    var str_reverse = function(L) {
      let s = luaL_checkstring(L, 1);
      let l = s.length;
      let r = new Uint8Array(l);
      for (let i = 0; i < l; i++)
        r[i] = s[l - 1 - i];
      lua_pushstring(L, r);
      return 1;
    };
    var str_lower = function(L) {
      let s = luaL_checkstring(L, 1);
      let l = s.length;
      let r = new Uint8Array(l);
      for (let i = 0; i < l; i++) {
        let c = s[i];
        if (isupper(c))
          c = c | 32;
        r[i] = c;
      }
      lua_pushstring(L, r);
      return 1;
    };
    var str_upper = function(L) {
      let s = luaL_checkstring(L, 1);
      let l = s.length;
      let r = new Uint8Array(l);
      for (let i = 0; i < l; i++) {
        let c = s[i];
        if (islower(c))
          c = c & 223;
        r[i] = c;
      }
      lua_pushstring(L, r);
      return 1;
    };
    var str_rep = function(L) {
      let s = luaL_checkstring(L, 1);
      let l = s.length;
      let n = luaL_checkinteger(L, 2);
      let sep = luaL_optstring(L, 3, "");
      let lsep = sep.length;
      if (n <= 0) lua_pushliteral(L, "");
      else if (l + lsep < l || l + lsep > MAXSIZE / n)
        return luaL_error(L, to_luastring2("resulting string too large"));
      else {
        let totallen = n * l + (n - 1) * lsep;
        let b = new luaL_Buffer();
        let p = luaL_buffinitsize(L, b, totallen);
        let pi = 0;
        while (n-- > 1) {
          p.set(s, pi);
          pi += l;
          if (lsep > 0) {
            p.set(sep, pi);
            pi += lsep;
          }
        }
        p.set(s, pi);
        luaL_pushresultsize(b, totallen);
      }
      return 1;
    };
    var str_byte = function(L) {
      let s = luaL_checkstring(L, 1);
      let l = s.length;
      let posi = posrelat(luaL_optinteger(L, 2, 1), l);
      let pose = posrelat(luaL_optinteger(L, 3, posi), l);
      if (posi < 1) posi = 1;
      if (pose > l) pose = l;
      if (posi > pose) return 0;
      if (pose - posi >= Number.MAX_SAFE_INTEGER)
        return luaL_error(L, "string slice too long");
      let n = pose - posi + 1;
      luaL_checkstack(L, n, "string slice too long");
      for (let i = 0; i < n; i++)
        lua_pushinteger(L, s[posi + i - 1]);
      return n;
    };
    var str_packsize = function(L) {
      let h = new Header(L);
      let fmt = {
        s: luaL_checkstring(L, 1),
        off: 0
      };
      let totalsize = 0;
      while (fmt.off < fmt.s.length) {
        let details = getdetails(h, totalsize, fmt);
        let opt = details.opt;
        let size = details.size;
        let ntoalign = details.ntoalign;
        size += ntoalign;
        luaL_argcheck(L, totalsize <= MAXSIZE - size, 1, "format result too large");
        totalsize += size;
        switch (opt) {
          case Kstring:
          /* strings with length count */
          case Kzstr:
            luaL_argerror(L, 1, "variable-length format");
          /* call never return, but to avoid warnings: */
          /* fall through */
          default:
            break;
        }
      }
      lua_pushinteger(L, totalsize);
      return 1;
    };
    var unpackint = function(L, str, islittle, size, issigned) {
      let res = 0;
      let limit = size <= SZINT ? size : SZINT;
      for (let i = limit - 1; i >= 0; i--) {
        res <<= NB;
        res |= str[islittle ? i : size - 1 - i];
      }
      if (size < SZINT) {
        if (issigned) {
          let mask = 1 << size * NB - 1;
          res = (res ^ mask) - mask;
        }
      } else if (size > SZINT) {
        let mask = !issigned || res >= 0 ? 0 : MC;
        for (let i = limit; i < size; i++) {
          if (str[islittle ? i : size - 1 - i] !== mask)
            luaL_error(L, to_luastring2("%d-byte integer does not fit into Lua Integer"), size);
        }
      }
      return res;
    };
    var unpacknum = function(L, b, islittle, size) {
      lualib2.lua_assert(b.length >= size);
      let dv = new DataView(new ArrayBuffer(size));
      for (let i = 0; i < size; i++)
        dv.setUint8(i, b[i]);
      if (size == 4) return dv.getFloat32(0, islittle);
      else return dv.getFloat64(0, islittle);
    };
    var str_unpack = function(L) {
      let h = new Header(L);
      let fmt = {
        s: luaL_checkstring(L, 1),
        off: 0
      };
      let data = luaL_checkstring(L, 2);
      let ld = data.length;
      let pos = posrelat(luaL_optinteger(L, 3, 1), ld) - 1;
      let n = 0;
      luaL_argcheck(L, pos <= ld && pos >= 0, 3, "initial position out of string");
      while (fmt.off < fmt.s.length) {
        let details = getdetails(h, pos, fmt);
        let opt = details.opt;
        let size = details.size;
        let ntoalign = details.ntoalign;
        if (
          /*ntoalign + size > ~pos ||*/
          pos + ntoalign + size > ld
        )
          luaL_argerror(L, 2, to_luastring2("data string too short"));
        pos += ntoalign;
        luaL_checkstack(L, 2, "too many results");
        n++;
        switch (opt) {
          case Kint:
          case Kuint: {
            let res = unpackint(L, data.subarray(pos), h.islittle, size, opt === Kint);
            lua_pushinteger(L, res);
            break;
          }
          case Kfloat: {
            let res = unpacknum(L, data.subarray(pos), h.islittle, size);
            lua_pushnumber(L, res);
            break;
          }
          case Kchar: {
            lua_pushstring(L, data.subarray(pos, pos + size));
            break;
          }
          case Kstring: {
            let len = unpackint(L, data.subarray(pos), h.islittle, size, 0);
            luaL_argcheck(L, pos + len + size <= ld, 2, "data string too short");
            lua_pushstring(L, data.subarray(pos + size, pos + size + len));
            pos += len;
            break;
          }
          case Kzstr: {
            let e = luastring_indexOf(data, 0, pos);
            if (e === -1) e = data.length - pos;
            lua_pushstring(L, data.subarray(pos, e));
            pos = e + 1;
            break;
          }
          case Kpaddalign:
          case Kpadding:
          case Knop:
            n--;
            break;
        }
        pos += size;
      }
      lua_pushinteger(L, pos + 1);
      return n + 1;
    };
    var CAP_UNFINISHED = -1;
    var CAP_POSITION = -2;
    var MAXCCALLS = 200;
    var SPECIALS = to_luastring2("^$*+?.([%-");
    var MatchState = class {
      constructor(L) {
        this.src = null;
        this.src_init = null;
        this.src_end = null;
        this.p = null;
        this.p_end = null;
        this.L = L;
        this.matchdepth = NaN;
        this.level = NaN;
        this.capture = [];
      }
    };
    var check_capture = function(ms, l) {
      l = l - 49;
      if (l < 0 || l >= ms.level || ms.capture[l].len === CAP_UNFINISHED)
        return luaL_error(ms.L, to_luastring2("invalid capture index %%%d"), l + 1);
      return l;
    };
    var capture_to_close = function(ms) {
      let level = ms.level;
      for (level--; level >= 0; level--)
        if (ms.capture[level].len === CAP_UNFINISHED) return level;
      return luaL_error(ms.L, to_luastring2("invalid pattern capture"));
    };
    var classend = function(ms, p) {
      switch (ms.p[p++]) {
        case L_ESC: {
          if (p === ms.p_end)
            luaL_error(ms.L, to_luastring2("malformed pattern (ends with '%%')"));
          return p + 1;
        }
        case 91: {
          if (ms.p[p] === 94) p++;
          do {
            if (p === ms.p_end)
              luaL_error(ms.L, to_luastring2("malformed pattern (missing ']')"));
            if (ms.p[p++] === L_ESC && p < ms.p_end)
              p++;
          } while (ms.p[p] !== 93);
          return p + 1;
        }
        default: {
          return p;
        }
      }
    };
    var match_class = function(c, cl) {
      switch (cl) {
        case 97:
          return isalpha(c);
        case 65:
          return !isalpha(c);
        case 99:
          return iscntrl(c);
        case 67:
          return !iscntrl(c);
        case 100:
          return isdigit(c);
        case 68:
          return !isdigit(c);
        case 103:
          return isgraph(c);
        case 71:
          return !isgraph(c);
        case 108:
          return islower(c);
        case 76:
          return !islower(c);
        case 112:
          return ispunct(c);
        case 80:
          return !ispunct(c);
        case 115:
          return isspace(c);
        case 83:
          return !isspace(c);
        case 117:
          return isupper(c);
        case 85:
          return !isupper(c);
        case 119:
          return isalnum(c);
        case 87:
          return !isalnum(c);
        case 120:
          return isxdigit(c);
        case 88:
          return !isxdigit(c);
        case 122:
          return c === 0;
        /* deprecated option */
        case 90:
          return c !== 0;
        /* deprecated option */
        default:
          return cl === c;
      }
    };
    var matchbracketclass = function(ms, c, p, ec) {
      let sig = true;
      if (ms.p[p + 1] === 94) {
        sig = false;
        p++;
      }
      while (++p < ec) {
        if (ms.p[p] === L_ESC) {
          p++;
          if (match_class(c, ms.p[p]))
            return sig;
        } else if (ms.p[p + 1] === 45 && p + 2 < ec) {
          p += 2;
          if (ms.p[p - 2] <= c && c <= ms.p[p])
            return sig;
        } else if (ms.p[p] === c) return sig;
      }
      return !sig;
    };
    var singlematch = function(ms, s, p, ep) {
      if (s >= ms.src_end)
        return false;
      else {
        let c = ms.src[s];
        switch (ms.p[p]) {
          case 46:
            return true;
          /* matches any char */
          case L_ESC:
            return match_class(c, ms.p[p + 1]);
          case 91:
            return matchbracketclass(ms, c, p, ep - 1);
          default:
            return ms.p[p] === c;
        }
      }
    };
    var matchbalance = function(ms, s, p) {
      if (p >= ms.p_end - 1)
        luaL_error(ms.L, to_luastring2("malformed pattern (missing arguments to '%%b'"));
      if (ms.src[s] !== ms.p[p])
        return null;
      else {
        let b = ms.p[p];
        let e = ms.p[p + 1];
        let cont = 1;
        while (++s < ms.src_end) {
          if (ms.src[s] === e) {
            if (--cont === 0) return s + 1;
          } else if (ms.src[s] === b) cont++;
        }
      }
      return null;
    };
    var max_expand = function(ms, s, p, ep) {
      let i = 0;
      while (singlematch(ms, s + i, p, ep))
        i++;
      while (i >= 0) {
        let res = match(ms, s + i, ep + 1);
        if (res) return res;
        i--;
      }
      return null;
    };
    var min_expand = function(ms, s, p, ep) {
      for (; ; ) {
        let res = match(ms, s, ep + 1);
        if (res !== null)
          return res;
        else if (singlematch(ms, s, p, ep))
          s++;
        else return null;
      }
    };
    var start_capture = function(ms, s, p, what) {
      let level = ms.level;
      if (level >= LUA_MAXCAPTURES) luaL_error(ms.L, to_luastring2("too many captures"));
      ms.capture[level] = ms.capture[level] ? ms.capture[level] : {};
      ms.capture[level].init = s;
      ms.capture[level].len = what;
      ms.level = level + 1;
      let res;
      if ((res = match(ms, s, p)) === null)
        ms.level--;
      return res;
    };
    var end_capture = function(ms, s, p) {
      let l = capture_to_close(ms);
      ms.capture[l].len = s - ms.capture[l].init;
      let res;
      if ((res = match(ms, s, p)) === null)
        ms.capture[l].len = CAP_UNFINISHED;
      return res;
    };
    var array_cmp = function(a, ai, b, bi, len) {
      return luastring_eq(a.subarray(ai, ai + len), b.subarray(bi, bi + len));
    };
    var match_capture = function(ms, s, l) {
      l = check_capture(ms, l);
      let len = ms.capture[l].len;
      if (ms.src_end - s >= len && array_cmp(ms.src, ms.capture[l].init, ms.src, s, len))
        return s + len;
      else return null;
    };
    var match = function(ms, s, p) {
      let gotodefault = false;
      let gotoinit = true;
      if (ms.matchdepth-- === 0)
        luaL_error(ms.L, to_luastring2("pattern too complex"));
      while (gotoinit || gotodefault) {
        gotoinit = false;
        if (p !== ms.p_end) {
          switch (gotodefault ? void 0 : ms.p[p]) {
            case 40: {
              if (ms.p[p + 1] === 41)
                s = start_capture(ms, s, p + 2, CAP_POSITION);
              else
                s = start_capture(ms, s, p + 1, CAP_UNFINISHED);
              break;
            }
            case 41: {
              s = end_capture(ms, s, p + 1);
              break;
            }
            case 36: {
              if (p + 1 !== ms.p_end) {
                gotodefault = true;
                break;
              }
              s = ms.src.length - s === 0 ? s : null;
              break;
            }
            case L_ESC: {
              switch (ms.p[p + 1]) {
                case 98: {
                  s = matchbalance(ms, s, p + 2);
                  if (s !== null) {
                    p += 4;
                    gotoinit = true;
                  }
                  break;
                }
                case 102: {
                  p += 2;
                  if (ms.p[p] !== 91)
                    luaL_error(ms.L, to_luastring2("missing '[' after '%%f' in pattern"));
                  let ep = classend(ms, p);
                  let previous = s === ms.src_init ? 0 : ms.src[s - 1];
                  if (!matchbracketclass(ms, previous, p, ep - 1) && matchbracketclass(ms, s === ms.src_end ? 0 : ms.src[s], p, ep - 1)) {
                    p = ep;
                    gotoinit = true;
                    break;
                  }
                  s = null;
                  break;
                }
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57: {
                  s = match_capture(ms, s, ms.p[p + 1]);
                  if (s !== null) {
                    p += 2;
                    gotoinit = true;
                  }
                  break;
                }
                default:
                  gotodefault = true;
              }
              break;
            }
            default: {
              gotodefault = false;
              let ep = classend(ms, p);
              if (!singlematch(ms, s, p, ep)) {
                if (ms.p[ep] === 42 || ms.p[ep] === 63 || ms.p[ep] === 45) {
                  p = ep + 1;
                  gotoinit = true;
                  break;
                } else
                  s = null;
              } else {
                switch (ms.p[ep]) {
                  /* handle optional suffix */
                  case 63: {
                    let res;
                    if ((res = match(ms, s + 1, ep + 1)) !== null)
                      s = res;
                    else {
                      p = ep + 1;
                      gotoinit = true;
                    }
                    break;
                  }
                  case 43:
                    s++;
                  /* 1 match already done */
                  /* fall through */
                  case 42:
                    s = max_expand(ms, s, p, ep);
                    break;
                  case 45:
                    s = min_expand(ms, s, p, ep);
                    break;
                  default:
                    s++;
                    p = ep;
                    gotoinit = true;
                }
              }
              break;
            }
          }
        }
      }
      ms.matchdepth++;
      return s;
    };
    var push_onecapture = function(ms, i, s, e) {
      if (i >= ms.level) {
        if (i === 0)
          lua_pushlstring(ms.L, ms.src.subarray(s, e), e - s);
        else
          luaL_error(ms.L, to_luastring2("invalid capture index %%%d"), i + 1);
      } else {
        let l = ms.capture[i].len;
        if (l === CAP_UNFINISHED) luaL_error(ms.L, to_luastring2("unfinished capture"));
        if (l === CAP_POSITION)
          lua_pushinteger(ms.L, ms.capture[i].init - ms.src_init + 1);
        else
          lua_pushlstring(ms.L, ms.src.subarray(ms.capture[i].init), l);
      }
    };
    var push_captures = function(ms, s, e) {
      let nlevels = ms.level === 0 && s != null ? 1 : ms.level;
      luaL_checkstack(ms.L, nlevels, "too many captures");
      for (let i = 0; i < nlevels; i++)
        push_onecapture(ms, i, s, e);
      return nlevels;
    };
    var nospecials = function(p, l) {
      for (let i = 0; i < l; i++) {
        if (luastring_indexOf(SPECIALS, p[i]) !== -1)
          return false;
      }
      return true;
    };
    var prepstate = function(ms, L, s, ls, p, lp) {
      ms.L = L;
      ms.matchdepth = MAXCCALLS;
      ms.src = s;
      ms.src_init = 0;
      ms.src_end = ls;
      ms.p = p;
      ms.p_end = lp;
    };
    var reprepstate = function(ms) {
      ms.level = 0;
      lualib2.lua_assert(ms.matchdepth === MAXCCALLS);
    };
    var find_subarray = function(arr, subarr, from_index) {
      var i = from_index >>> 0, sl = subarr.length;
      if (sl === 0)
        return i;
      for (; (i = arr.indexOf(subarr[0], i)) !== -1; i++) {
        if (luastring_eq(arr.subarray(i, i + sl), subarr))
          return i;
      }
      return -1;
    };
    var str_find_aux = function(L, find) {
      let s = luaL_checkstring(L, 1);
      let p = luaL_checkstring(L, 2);
      let ls = s.length;
      let lp = p.length;
      let init = posrelat(luaL_optinteger(L, 3, 1), ls);
      if (init < 1) init = 1;
      else if (init > ls + 1) {
        lua_pushnil(L);
        return 1;
      }
      if (find && (lua_toboolean(L, 4) || nospecials(p, lp))) {
        let f = find_subarray(s.subarray(init - 1), p, 0);
        if (f > -1) {
          lua_pushinteger(L, init + f);
          lua_pushinteger(L, init + f + lp - 1);
          return 2;
        }
      } else {
        let ms = new MatchState(L);
        let s1 = init - 1;
        let anchor = p[0] === 94;
        if (anchor) {
          p = p.subarray(1);
          lp--;
        }
        prepstate(ms, L, s, ls, p, lp);
        do {
          let res;
          reprepstate(ms);
          if ((res = match(ms, s1, 0)) !== null) {
            if (find) {
              lua_pushinteger(L, s1 + 1);
              lua_pushinteger(L, res);
              return push_captures(ms, null, 0) + 2;
            } else
              return push_captures(ms, s1, res);
          }
        } while (s1++ < ms.src_end && !anchor);
      }
      lua_pushnil(L);
      return 1;
    };
    var str_find = function(L) {
      return str_find_aux(L, 1);
    };
    var str_match = function(L) {
      return str_find_aux(L, 0);
    };
    var GMatchState = class {
      constructor() {
        this.src = NaN;
        this.p = NaN;
        this.lastmatch = NaN;
        this.ms = new MatchState();
      }
    };
    var gmatch_aux = function(L) {
      let gm = lua_touserdata(L, lua_upvalueindex(3));
      gm.ms.L = L;
      for (let src = gm.src; src <= gm.ms.src_end; src++) {
        reprepstate(gm.ms);
        let e;
        if ((e = match(gm.ms, src, gm.p)) !== null && e !== gm.lastmatch) {
          gm.src = gm.lastmatch = e;
          return push_captures(gm.ms, src, e);
        }
      }
      return 0;
    };
    var str_gmatch = function(L) {
      let s = luaL_checkstring(L, 1);
      let p = luaL_checkstring(L, 2);
      let ls = s.length;
      let lp = p.length;
      lua_settop(L, 2);
      let gm = new GMatchState();
      lua_pushlightuserdata(L, gm);
      prepstate(gm.ms, L, s, ls, p, lp);
      gm.src = 0;
      gm.p = 0;
      gm.lastmatch = null;
      lua_pushcclosure(L, gmatch_aux, 3);
      return 1;
    };
    var add_s = function(ms, b, s, e) {
      let L = ms.L;
      let news = lua_tostring(L, 3);
      let l = news.length;
      for (let i = 0; i < l; i++) {
        if (news[i] !== L_ESC)
          luaL_addchar(b, news[i]);
        else {
          i++;
          if (!isdigit(news[i])) {
            if (news[i] !== L_ESC)
              luaL_error(L, to_luastring2("invalid use of '%c' in replacement string"), L_ESC);
            luaL_addchar(b, news[i]);
          } else if (news[i] === 48)
            luaL_addlstring(b, ms.src.subarray(s, e), e - s);
          else {
            push_onecapture(ms, news[i] - 49, s, e);
            luaL_tolstring(L, -1);
            lua_remove(L, -2);
            luaL_addvalue(b);
          }
        }
      }
    };
    var add_value = function(ms, b, s, e, tr) {
      let L = ms.L;
      switch (tr) {
        case LUA_TFUNCTION: {
          lua_pushvalue(L, 3);
          let n = push_captures(ms, s, e);
          lua_call(L, n, 1);
          break;
        }
        case LUA_TTABLE: {
          push_onecapture(ms, 0, s, e);
          lua_gettable(L, 3);
          break;
        }
        default: {
          add_s(ms, b, s, e);
          return;
        }
      }
      if (!lua_toboolean(L, -1)) {
        lua_pop(L, 1);
        lua_pushlstring(L, ms.src.subarray(s, e), e - s);
      } else if (!lua_isstring(L, -1))
        luaL_error(L, to_luastring2("invalid replacement value (a %s)"), luaL_typename(L, -1));
      luaL_addvalue(b);
    };
    var str_gsub = function(L) {
      let src = luaL_checkstring(L, 1);
      let srcl = src.length;
      let p = luaL_checkstring(L, 2);
      let lp = p.length;
      let lastmatch = null;
      let tr = lua_type(L, 3);
      let max_s = luaL_optinteger(L, 4, srcl + 1);
      let anchor = p[0] === 94;
      let n = 0;
      let ms = new MatchState(L);
      let b = new luaL_Buffer();
      luaL_argcheck(
        L,
        tr === LUA_TNUMBER || tr === LUA_TSTRING || tr === LUA_TFUNCTION || tr === LUA_TTABLE,
        3,
        "string/function/table expected"
      );
      luaL_buffinit(L, b);
      if (anchor) {
        p = p.subarray(1);
        lp--;
      }
      prepstate(ms, L, src, srcl, p, lp);
      src = 0;
      p = 0;
      while (n < max_s) {
        let e;
        reprepstate(ms);
        if ((e = match(ms, src, p)) !== null && e !== lastmatch) {
          n++;
          add_value(ms, b, src, e, tr);
          src = lastmatch = e;
        } else if (src < ms.src_end)
          luaL_addchar(b, ms.src[src++]);
        else break;
        if (anchor) break;
      }
      luaL_addlstring(b, ms.src.subarray(src, ms.src_end), ms.src_end - src);
      luaL_pushresult(b);
      lua_pushinteger(L, n);
      return 2;
    };
    var strlib = {
      "byte": str_byte,
      "char": str_char,
      "dump": str_dump,
      "find": str_find,
      "format": str_format,
      "gmatch": str_gmatch,
      "gsub": str_gsub,
      "len": str_len,
      "lower": str_lower,
      "match": str_match,
      "pack": str_pack,
      "packsize": str_packsize,
      "rep": str_rep,
      "reverse": str_reverse,
      "sub": str_sub,
      "unpack": str_unpack,
      "upper": str_upper
    };
    var createmetatable = function(L) {
      lua_createtable(L, 0, 1);
      lua_pushliteral(L, "");
      lua_pushvalue(L, -2);
      lua_setmetatable(L, -2);
      lua_pop(L, 1);
      lua_pushvalue(L, -2);
      lua_setfield(L, -2, to_luastring2("__index", true));
      lua_pop(L, 1);
    };
    var luaopen_string = function(L) {
      luaL_newlib(L, strlib);
      createmetatable(L);
      return 1;
    };
    module.exports.luaopen_string = luaopen_string;
  }
});

// vendor/fengari/src/lutf8lib.js
var require_lutf8lib = __commonJS({
  "vendor/fengari/src/lutf8lib.js"(exports, module) {
    "use strict";
    var {
      lua_gettop,
      lua_pushcfunction,
      lua_pushfstring,
      lua_pushinteger,
      lua_pushnil,
      lua_pushstring,
      lua_pushvalue,
      lua_setfield,
      lua_tointeger
    } = require_lua();
    var {
      luaL_Buffer,
      luaL_addvalue,
      luaL_argcheck,
      luaL_buffinit,
      luaL_checkinteger,
      luaL_checkstack,
      luaL_checkstring,
      luaL_error,
      luaL_newlib,
      luaL_optinteger,
      luaL_pushresult
    } = require_lauxlib();
    var {
      luastring_of,
      to_luastring: to_luastring2
    } = require_fengaricore();
    var MAXUNICODE = 1114111;
    var iscont = function(p) {
      let c = p & 192;
      return c === 128;
    };
    var u_posrelat = function(pos, len) {
      if (pos >= 0) return pos;
      else if (0 - pos > len) return 0;
      else return len + pos + 1;
    };
    var limits = [255, 127, 2047, 65535];
    var utf8_decode = function(s, pos) {
      let c = s[pos];
      let res = 0;
      if (c < 128)
        res = c;
      else {
        let count = 0;
        while (c & 64) {
          let cc = s[pos + ++count];
          if ((cc & 192) !== 128)
            return null;
          res = res << 6 | cc & 63;
          c <<= 1;
        }
        res |= (c & 127) << count * 5;
        if (count > 3 || res > MAXUNICODE || res <= limits[count])
          return null;
        pos += count;
      }
      return {
        code: res,
        pos: pos + 1
      };
    };
    var utflen = function(L) {
      let n = 0;
      let s = luaL_checkstring(L, 1);
      let len = s.length;
      let posi = u_posrelat(luaL_optinteger(L, 2, 1), len);
      let posj = u_posrelat(luaL_optinteger(L, 3, -1), len);
      luaL_argcheck(L, 1 <= posi && --posi <= len, 2, "initial position out of string");
      luaL_argcheck(L, --posj < len, 3, "final position out of string");
      while (posi <= posj) {
        let dec = utf8_decode(s, posi);
        if (dec === null) {
          lua_pushnil(L);
          lua_pushinteger(L, posi + 1);
          return 2;
        }
        posi = dec.pos;
        n++;
      }
      lua_pushinteger(L, n);
      return 1;
    };
    var p_U = to_luastring2("%U");
    var pushutfchar = function(L, arg) {
      let code = luaL_checkinteger(L, arg);
      luaL_argcheck(L, 0 <= code && code <= MAXUNICODE, arg, "value out of range");
      lua_pushfstring(L, p_U, code);
    };
    var utfchar = function(L) {
      let n = lua_gettop(L);
      if (n === 1)
        pushutfchar(L, 1);
      else {
        let b = new luaL_Buffer();
        luaL_buffinit(L, b);
        for (let i = 1; i <= n; i++) {
          pushutfchar(L, i);
          luaL_addvalue(b);
        }
        luaL_pushresult(b);
      }
      return 1;
    };
    var byteoffset = function(L) {
      let s = luaL_checkstring(L, 1);
      let n = luaL_checkinteger(L, 2);
      let posi = n >= 0 ? 1 : s.length + 1;
      posi = u_posrelat(luaL_optinteger(L, 3, posi), s.length);
      luaL_argcheck(L, 1 <= posi && --posi <= s.length, 3, "position out of range");
      if (n === 0) {
        while (posi > 0 && iscont(s[posi])) posi--;
      } else {
        if (iscont(s[posi]))
          luaL_error(L, "initial position is a continuation byte");
        if (n < 0) {
          while (n < 0 && posi > 0) {
            do {
              posi--;
            } while (posi > 0 && iscont(s[posi]));
            n++;
          }
        } else {
          n--;
          while (n > 0 && posi < s.length) {
            do {
              posi++;
            } while (iscont(s[posi]));
            n--;
          }
        }
      }
      if (n === 0)
        lua_pushinteger(L, posi + 1);
      else
        lua_pushnil(L);
      return 1;
    };
    var codepoint = function(L) {
      let s = luaL_checkstring(L, 1);
      let posi = u_posrelat(luaL_optinteger(L, 2, 1), s.length);
      let pose = u_posrelat(luaL_optinteger(L, 3, posi), s.length);
      luaL_argcheck(L, posi >= 1, 2, "out of range");
      luaL_argcheck(L, pose <= s.length, 3, "out of range");
      if (posi > pose) return 0;
      if (pose - posi >= Number.MAX_SAFE_INTEGER)
        return luaL_error(L, "string slice too long");
      let n = pose - posi + 1;
      luaL_checkstack(L, n, "string slice too long");
      n = 0;
      for (posi -= 1; posi < pose; ) {
        let dec = utf8_decode(s, posi);
        if (dec === null)
          return luaL_error(L, "invalid UTF-8 code");
        lua_pushinteger(L, dec.code);
        posi = dec.pos;
        n++;
      }
      return n;
    };
    var iter_aux = function(L) {
      let s = luaL_checkstring(L, 1);
      let len = s.length;
      let n = lua_tointeger(L, 2) - 1;
      if (n < 0)
        n = 0;
      else if (n < len) {
        n++;
        while (iscont(s[n])) n++;
      }
      if (n >= len)
        return 0;
      else {
        let dec = utf8_decode(s, n);
        if (dec === null || iscont(s[dec.pos]))
          return luaL_error(L, to_luastring2("invalid UTF-8 code"));
        lua_pushinteger(L, n + 1);
        lua_pushinteger(L, dec.code);
        return 2;
      }
    };
    var iter_codes = function(L) {
      luaL_checkstring(L, 1);
      lua_pushcfunction(L, iter_aux);
      lua_pushvalue(L, 1);
      lua_pushinteger(L, 0);
      return 3;
    };
    var funcs = {
      "char": utfchar,
      "codepoint": codepoint,
      "codes": iter_codes,
      "len": utflen,
      "offset": byteoffset
    };
    var UTF8PATT = luastring_of(91, 0, 45, 127, 194, 45, 244, 93, 91, 128, 45, 191, 93, 42);
    var luaopen_utf8 = function(L) {
      luaL_newlib(L, funcs);
      lua_pushstring(L, UTF8PATT);
      lua_setfield(L, -2, to_luastring2("charpattern", true));
      return 1;
    };
    module.exports.luaopen_utf8 = luaopen_utf8;
  }
});

// vendor/fengari/src/lmathlib.js
var require_lmathlib = __commonJS({
  "vendor/fengari/src/lmathlib.js"(exports, module) {
    "use strict";
    var {
      LUA_OPLT,
      LUA_TNUMBER,
      lua_compare,
      lua_gettop,
      lua_isinteger,
      lua_isnoneornil,
      lua_pushboolean,
      lua_pushinteger,
      lua_pushliteral,
      lua_pushnil,
      lua_pushnumber,
      lua_pushvalue,
      lua_setfield,
      lua_settop,
      lua_tointeger,
      lua_tointegerx,
      lua_type
    } = require_lua();
    var {
      luaL_argcheck,
      luaL_argerror,
      luaL_checkany,
      luaL_checkinteger,
      luaL_checknumber,
      luaL_error,
      luaL_newlib,
      luaL_optnumber
    } = require_lauxlib();
    var {
      LUA_MAXINTEGER,
      LUA_MININTEGER,
      lua_numbertointeger
    } = require_luaconf();
    var { to_luastring: to_luastring2 } = require_fengaricore();
    var rand_state;
    var l_rand = function() {
      rand_state = 1103515245 * rand_state + 12345 & 2147483647;
      return rand_state;
    };
    var l_srand = function(x) {
      rand_state = x | 0;
      if (rand_state === 0)
        rand_state = 1;
    };
    var math_random = function(L) {
      let low, up;
      let r = rand_state === void 0 ? Math.random() : l_rand() / 2147483648;
      switch (lua_gettop(L)) {
        /* check number of arguments */
        case 0:
          lua_pushnumber(L, r);
          return 1;
        case 1: {
          low = 1;
          up = luaL_checkinteger(L, 1);
          break;
        }
        case 2: {
          low = luaL_checkinteger(L, 1);
          up = luaL_checkinteger(L, 2);
          break;
        }
        default:
          return luaL_error(L, "wrong number of arguments");
      }
      luaL_argcheck(L, low <= up, 1, "interval is empty");
      luaL_argcheck(
        L,
        low >= 0 || up <= LUA_MAXINTEGER + low,
        1,
        "interval too large"
      );
      r *= up - low + 1;
      lua_pushinteger(L, Math.floor(r) + low);
      return 1;
    };
    var math_randomseed = function(L) {
      l_srand(luaL_checknumber(L, 1));
      l_rand();
      return 0;
    };
    var math_abs = function(L) {
      if (lua_isinteger(L, 1)) {
        let n = lua_tointeger(L, 1);
        if (n < 0) n = -n | 0;
        lua_pushinteger(L, n);
      } else
        lua_pushnumber(L, Math.abs(luaL_checknumber(L, 1)));
      return 1;
    };
    var math_sin = function(L) {
      lua_pushnumber(L, Math.sin(luaL_checknumber(L, 1)));
      return 1;
    };
    var math_cos = function(L) {
      lua_pushnumber(L, Math.cos(luaL_checknumber(L, 1)));
      return 1;
    };
    var math_tan = function(L) {
      lua_pushnumber(L, Math.tan(luaL_checknumber(L, 1)));
      return 1;
    };
    var math_asin = function(L) {
      lua_pushnumber(L, Math.asin(luaL_checknumber(L, 1)));
      return 1;
    };
    var math_acos = function(L) {
      lua_pushnumber(L, Math.acos(luaL_checknumber(L, 1)));
      return 1;
    };
    var math_atan = function(L) {
      let y = luaL_checknumber(L, 1);
      let x = luaL_optnumber(L, 2, 1);
      lua_pushnumber(L, Math.atan2(y, x));
      return 1;
    };
    var math_toint = function(L) {
      let n = lua_tointegerx(L, 1);
      if (n !== false)
        lua_pushinteger(L, n);
      else {
        luaL_checkany(L, 1);
        lua_pushnil(L);
      }
      return 1;
    };
    var pushnumint = function(L, d) {
      let n = lua_numbertointeger(d);
      if (n !== false)
        lua_pushinteger(L, n);
      else
        lua_pushnumber(L, d);
    };
    var math_floor = function(L) {
      if (lua_isinteger(L, 1))
        lua_settop(L, 1);
      else
        pushnumint(L, Math.floor(luaL_checknumber(L, 1)));
      return 1;
    };
    var math_ceil = function(L) {
      if (lua_isinteger(L, 1))
        lua_settop(L, 1);
      else
        pushnumint(L, Math.ceil(luaL_checknumber(L, 1)));
      return 1;
    };
    var math_sqrt = function(L) {
      lua_pushnumber(L, Math.sqrt(luaL_checknumber(L, 1)));
      return 1;
    };
    var math_ult = function(L) {
      let a = luaL_checkinteger(L, 1);
      let b = luaL_checkinteger(L, 2);
      lua_pushboolean(L, a >= 0 ? b < 0 || a < b : b < 0 && a < b);
      return 1;
    };
    var math_log = function(L) {
      let x = luaL_checknumber(L, 1);
      let res;
      if (lua_isnoneornil(L, 2))
        res = Math.log(x);
      else {
        let base = luaL_checknumber(L, 2);
        if (base === 2)
          res = Math.log2(x);
        else if (base === 10)
          res = Math.log10(x);
        else
          res = Math.log(x) / Math.log(base);
      }
      lua_pushnumber(L, res);
      return 1;
    };
    var math_exp = function(L) {
      lua_pushnumber(L, Math.exp(luaL_checknumber(L, 1)));
      return 1;
    };
    var math_deg = function(L) {
      lua_pushnumber(L, luaL_checknumber(L, 1) * (180 / Math.PI));
      return 1;
    };
    var math_rad = function(L) {
      lua_pushnumber(L, luaL_checknumber(L, 1) * (Math.PI / 180));
      return 1;
    };
    var math_min = function(L) {
      let n = lua_gettop(L);
      let imin = 1;
      luaL_argcheck(L, n >= 1, 1, "value expected");
      for (let i = 2; i <= n; i++) {
        if (lua_compare(L, i, imin, LUA_OPLT))
          imin = i;
      }
      lua_pushvalue(L, imin);
      return 1;
    };
    var math_max = function(L) {
      let n = lua_gettop(L);
      let imax = 1;
      luaL_argcheck(L, n >= 1, 1, "value expected");
      for (let i = 2; i <= n; i++) {
        if (lua_compare(L, imax, i, LUA_OPLT))
          imax = i;
      }
      lua_pushvalue(L, imax);
      return 1;
    };
    var math_type = function(L) {
      if (lua_type(L, 1) === LUA_TNUMBER) {
        if (lua_isinteger(L, 1))
          lua_pushliteral(L, "integer");
        else
          lua_pushliteral(L, "float");
      } else {
        luaL_checkany(L, 1);
        lua_pushnil(L);
      }
      return 1;
    };
    var math_fmod = function(L) {
      if (lua_isinteger(L, 1) && lua_isinteger(L, 2)) {
        let d = lua_tointeger(L, 2);
        if (d === 0) {
          luaL_argerror(L, 2, "zero");
        } else
          lua_pushinteger(L, lua_tointeger(L, 1) % d | 0);
      } else {
        let a = luaL_checknumber(L, 1);
        let b = luaL_checknumber(L, 2);
        lua_pushnumber(L, a % b);
      }
      return 1;
    };
    var math_modf = function(L) {
      if (lua_isinteger(L, 1)) {
        lua_settop(L, 1);
        lua_pushnumber(L, 0);
      } else {
        let n = luaL_checknumber(L, 1);
        let ip = n < 0 ? Math.ceil(n) : Math.floor(n);
        pushnumint(L, ip);
        lua_pushnumber(L, n === ip ? 0 : n - ip);
      }
      return 2;
    };
    var mathlib = {
      "abs": math_abs,
      "acos": math_acos,
      "asin": math_asin,
      "atan": math_atan,
      "ceil": math_ceil,
      "cos": math_cos,
      "deg": math_deg,
      "exp": math_exp,
      "floor": math_floor,
      "fmod": math_fmod,
      "log": math_log,
      "max": math_max,
      "min": math_min,
      "modf": math_modf,
      "rad": math_rad,
      "random": math_random,
      "randomseed": math_randomseed,
      "sin": math_sin,
      "sqrt": math_sqrt,
      "tan": math_tan,
      "tointeger": math_toint,
      "type": math_type,
      "ult": math_ult
    };
    var luaopen_math = function(L) {
      luaL_newlib(L, mathlib);
      lua_pushnumber(L, Math.PI);
      lua_setfield(L, -2, to_luastring2("pi", true));
      lua_pushnumber(L, Infinity);
      lua_setfield(L, -2, to_luastring2("huge", true));
      lua_pushinteger(L, LUA_MAXINTEGER);
      lua_setfield(L, -2, to_luastring2("maxinteger", true));
      lua_pushinteger(L, LUA_MININTEGER);
      lua_setfield(L, -2, to_luastring2("mininteger", true));
      return 1;
    };
    module.exports.luaopen_math = luaopen_math;
  }
});

// vendor/fengari/src/ldblib.js
var require_ldblib = __commonJS({
  "vendor/fengari/src/ldblib.js"(exports, module) {
    "use strict";
    var {
      LUA_MASKCALL,
      LUA_MASKCOUNT,
      LUA_MASKLINE,
      LUA_MASKRET,
      LUA_REGISTRYINDEX,
      LUA_TFUNCTION,
      LUA_TNIL,
      LUA_TTABLE,
      LUA_TUSERDATA,
      lua_Debug,
      lua_call,
      lua_checkstack,
      lua_gethook,
      lua_gethookcount,
      lua_gethookmask,
      lua_getinfo,
      lua_getlocal,
      lua_getmetatable,
      lua_getstack,
      lua_getupvalue,
      lua_getuservalue,
      lua_insert,
      lua_iscfunction,
      lua_isfunction,
      lua_isnoneornil,
      lua_isthread,
      lua_newtable,
      lua_pcall,
      lua_pop,
      lua_pushboolean,
      lua_pushfstring,
      lua_pushinteger,
      lua_pushlightuserdata,
      lua_pushliteral,
      lua_pushnil,
      lua_pushstring,
      lua_pushvalue,
      lua_rawgetp,
      lua_rawsetp,
      lua_rotate,
      lua_setfield,
      lua_sethook,
      lua_setlocal,
      lua_setmetatable,
      lua_settop,
      lua_setupvalue,
      lua_setuservalue,
      lua_tojsstring,
      lua_toproxy,
      lua_tostring,
      lua_tothread,
      lua_touserdata,
      lua_type,
      lua_upvalueid,
      lua_upvaluejoin,
      lua_xmove
    } = require_lua();
    var {
      luaL_argcheck,
      luaL_argerror,
      luaL_checkany,
      luaL_checkinteger,
      luaL_checkstring,
      luaL_checktype,
      luaL_error,
      luaL_loadbuffer,
      luaL_newlib,
      luaL_optinteger,
      luaL_optstring,
      luaL_traceback,
      lua_writestringerror
    } = require_lauxlib();
    var lualib2 = require_lualib();
    var {
      luastring_indexOf,
      to_luastring: to_luastring2
    } = require_fengaricore();
    var checkstack = function(L, L1, n) {
      if (L !== L1 && !lua_checkstack(L1, n))
        luaL_error(L, to_luastring2("stack overflow", true));
    };
    var db_getregistry = function(L) {
      lua_pushvalue(L, LUA_REGISTRYINDEX);
      return 1;
    };
    var db_getmetatable = function(L) {
      luaL_checkany(L, 1);
      if (!lua_getmetatable(L, 1)) {
        lua_pushnil(L);
      }
      return 1;
    };
    var db_setmetatable = function(L) {
      const t = lua_type(L, 2);
      luaL_argcheck(L, t == LUA_TNIL || t == LUA_TTABLE, 2, "nil or table expected");
      lua_settop(L, 2);
      lua_setmetatable(L, 1);
      return 1;
    };
    var db_getuservalue = function(L) {
      if (lua_type(L, 1) !== LUA_TUSERDATA)
        lua_pushnil(L);
      else
        lua_getuservalue(L, 1);
      return 1;
    };
    var db_setuservalue = function(L) {
      luaL_checktype(L, 1, LUA_TUSERDATA);
      luaL_checkany(L, 2);
      lua_settop(L, 2);
      lua_setuservalue(L, 1);
      return 1;
    };
    var getthread = function(L) {
      if (lua_isthread(L, 1)) {
        return {
          arg: 1,
          thread: lua_tothread(L, 1)
        };
      } else {
        return {
          arg: 0,
          thread: L
        };
      }
    };
    var settabss = function(L, k, v) {
      lua_pushstring(L, v);
      lua_setfield(L, -2, k);
    };
    var settabsi = function(L, k, v) {
      lua_pushinteger(L, v);
      lua_setfield(L, -2, k);
    };
    var settabsb = function(L, k, v) {
      lua_pushboolean(L, v);
      lua_setfield(L, -2, k);
    };
    var treatstackoption = function(L, L1, fname) {
      if (L == L1)
        lua_rotate(L, -2, 1);
      else
        lua_xmove(L1, L, 1);
      lua_setfield(L, -2, fname);
    };
    var db_getinfo = function(L) {
      let ar = new lua_Debug();
      let thread = getthread(L);
      let arg = thread.arg;
      let L1 = thread.thread;
      let options = luaL_optstring(L, arg + 2, "flnStu");
      checkstack(L, L1, 3);
      if (lua_isfunction(L, arg + 1)) {
        options = lua_pushfstring(L, to_luastring2(">%s"), options);
        lua_pushvalue(L, arg + 1);
        lua_xmove(L, L1, 1);
      } else {
        if (!lua_getstack(L1, luaL_checkinteger(L, arg + 1), ar)) {
          lua_pushnil(L);
          return 1;
        }
      }
      if (!lua_getinfo(L1, options, ar))
        luaL_argerror(L, arg + 2, "invalid option");
      lua_newtable(L);
      if (luastring_indexOf(
        options,
        83
        /* 'S'.charCodeAt(0) */
      ) > -1) {
        settabss(L, to_luastring2("source", true), ar.source);
        settabss(L, to_luastring2("short_src", true), ar.short_src);
        settabsi(L, to_luastring2("linedefined", true), ar.linedefined);
        settabsi(L, to_luastring2("lastlinedefined", true), ar.lastlinedefined);
        settabss(L, to_luastring2("what", true), ar.what);
      }
      if (luastring_indexOf(
        options,
        108
        /* 'l'.charCodeAt(0) */
      ) > -1)
        settabsi(L, to_luastring2("currentline", true), ar.currentline);
      if (luastring_indexOf(
        options,
        117
        /* 'u'.charCodeAt(0) */
      ) > -1) {
        settabsi(L, to_luastring2("nups", true), ar.nups);
        settabsi(L, to_luastring2("nparams", true), ar.nparams);
        settabsb(L, to_luastring2("isvararg", true), ar.isvararg);
      }
      if (luastring_indexOf(
        options,
        110
        /* 'n'.charCodeAt(0) */
      ) > -1) {
        settabss(L, to_luastring2("name", true), ar.name);
        settabss(L, to_luastring2("namewhat", true), ar.namewhat);
      }
      if (luastring_indexOf(
        options,
        116
        /* 't'.charCodeAt(0) */
      ) > -1)
        settabsb(L, to_luastring2("istailcall", true), ar.istailcall);
      if (luastring_indexOf(
        options,
        76
        /* 'L'.charCodeAt(0) */
      ) > -1)
        treatstackoption(L, L1, to_luastring2("activelines", true));
      if (luastring_indexOf(
        options,
        102
        /* 'f'.charCodeAt(0) */
      ) > -1)
        treatstackoption(L, L1, to_luastring2("func", true));
      return 1;
    };
    var db_getlocal = function(L) {
      let thread = getthread(L);
      let L1 = thread.thread;
      let arg = thread.arg;
      let ar = new lua_Debug();
      let nvar = luaL_checkinteger(L, arg + 2);
      if (lua_isfunction(L, arg + 1)) {
        lua_pushvalue(L, arg + 1);
        lua_pushstring(L, lua_getlocal(L, null, nvar));
        return 1;
      } else {
        let level = luaL_checkinteger(L, arg + 1);
        if (!lua_getstack(L1, level, ar))
          return luaL_argerror(L, arg + 1, "level out of range");
        checkstack(L, L1, 1);
        let name = lua_getlocal(L1, ar, nvar);
        if (name) {
          lua_xmove(L1, L, 1);
          lua_pushstring(L, name);
          lua_rotate(L, -2, 1);
          return 2;
        } else {
          lua_pushnil(L);
          return 1;
        }
      }
    };
    var db_setlocal = function(L) {
      let thread = getthread(L);
      let L1 = thread.thread;
      let arg = thread.arg;
      let ar = new lua_Debug();
      let level = luaL_checkinteger(L, arg + 1);
      let nvar = luaL_checkinteger(L, arg + 2);
      if (!lua_getstack(L1, level, ar))
        return luaL_argerror(L, arg + 1, "level out of range");
      luaL_checkany(L, arg + 3);
      lua_settop(L, arg + 3);
      checkstack(L, L1, 1);
      lua_xmove(L, L1, 1);
      let name = lua_setlocal(L1, ar, nvar);
      if (name === null)
        lua_pop(L1, 1);
      lua_pushstring(L, name);
      return 1;
    };
    var auxupvalue = function(L, get) {
      let n = luaL_checkinteger(L, 2);
      luaL_checktype(L, 1, LUA_TFUNCTION);
      let name = get ? lua_getupvalue(L, 1, n) : lua_setupvalue(L, 1, n);
      if (name === null) return 0;
      lua_pushstring(L, name);
      lua_insert(L, -(get + 1));
      return get + 1;
    };
    var db_getupvalue = function(L) {
      return auxupvalue(L, 1);
    };
    var db_setupvalue = function(L) {
      luaL_checkany(L, 3);
      return auxupvalue(L, 0);
    };
    var checkupval = function(L, argf, argnup) {
      let nup = luaL_checkinteger(L, argnup);
      luaL_checktype(L, argf, LUA_TFUNCTION);
      luaL_argcheck(L, lua_getupvalue(L, argf, nup) !== null, argnup, "invalid upvalue index");
      return nup;
    };
    var db_upvalueid = function(L) {
      let n = checkupval(L, 1, 2);
      lua_pushlightuserdata(L, lua_upvalueid(L, 1, n));
      return 1;
    };
    var db_upvaluejoin = function(L) {
      let n1 = checkupval(L, 1, 2);
      let n2 = checkupval(L, 3, 4);
      luaL_argcheck(L, !lua_iscfunction(L, 1), 1, "Lua function expected");
      luaL_argcheck(L, !lua_iscfunction(L, 3), 3, "Lua function expected");
      lua_upvaluejoin(L, 1, n1, 3, n2);
      return 0;
    };
    var HOOKKEY = to_luastring2("__hooks__", true);
    var hooknames = ["call", "return", "line", "count", "tail call"].map((e) => to_luastring2(e));
    var hookf = function(L, ar) {
      lua_rawgetp(L, LUA_REGISTRYINDEX, HOOKKEY);
      let hooktable = lua_touserdata(L, -1);
      let proxy = hooktable.get(L);
      if (proxy) {
        proxy(L);
        lua_pushstring(L, hooknames[ar.event]);
        if (ar.currentline >= 0)
          lua_pushinteger(L, ar.currentline);
        else lua_pushnil(L);
        lualib2.lua_assert(lua_getinfo(L, to_luastring2("lS"), ar));
        lua_call(L, 2, 0);
      }
    };
    var makemask = function(smask, count) {
      let mask = 0;
      if (luastring_indexOf(
        smask,
        99
        /* 'c'.charCodeAt(0) */
      ) > -1) mask |= LUA_MASKCALL;
      if (luastring_indexOf(
        smask,
        114
        /* 'r'.charCodeAt(0) */
      ) > -1) mask |= LUA_MASKRET;
      if (luastring_indexOf(
        smask,
        108
        /* 'l'.charCodeAt(0) */
      ) > -1) mask |= LUA_MASKLINE;
      if (count > 0) mask |= LUA_MASKCOUNT;
      return mask;
    };
    var unmakemask = function(mask, smask) {
      let i = 0;
      if (mask & LUA_MASKCALL) smask[i++] = 99;
      if (mask & LUA_MASKRET) smask[i++] = 114;
      if (mask & LUA_MASKLINE) smask[i++] = 108;
      return smask.subarray(0, i);
    };
    var db_sethook = function(L) {
      let mask, count, func;
      let thread = getthread(L);
      let L1 = thread.thread;
      let arg = thread.arg;
      if (lua_isnoneornil(L, arg + 1)) {
        lua_settop(L, arg + 1);
        func = null;
        mask = 0;
        count = 0;
      } else {
        const smask = luaL_checkstring(L, arg + 2);
        luaL_checktype(L, arg + 1, LUA_TFUNCTION);
        count = luaL_optinteger(L, arg + 3, 0);
        func = hookf;
        mask = makemask(smask, count);
      }
      let hooktable;
      if (lua_rawgetp(L, LUA_REGISTRYINDEX, HOOKKEY) === LUA_TNIL) {
        hooktable = /* @__PURE__ */ new WeakMap();
        lua_pushlightuserdata(L, hooktable);
        lua_rawsetp(L, LUA_REGISTRYINDEX, HOOKKEY);
      } else {
        hooktable = lua_touserdata(L, -1);
      }
      let proxy = lua_toproxy(L, arg + 1);
      hooktable.set(L1, proxy);
      lua_sethook(L1, func, mask, count);
      return 0;
    };
    var db_gethook = function(L) {
      let thread = getthread(L);
      let L1 = thread.thread;
      let buff = new Uint8Array(5);
      let mask = lua_gethookmask(L1);
      let hook = lua_gethook(L1);
      if (hook === null)
        lua_pushnil(L);
      else if (hook !== hookf)
        lua_pushliteral(L, "external hook");
      else {
        lua_rawgetp(L, LUA_REGISTRYINDEX, HOOKKEY);
        let hooktable = lua_touserdata(L, -1);
        let proxy = hooktable.get(L1);
        proxy(L);
      }
      lua_pushstring(L, unmakemask(mask, buff));
      lua_pushinteger(L, lua_gethookcount(L1));
      return 3;
    };
    var db_traceback = function(L) {
      let thread = getthread(L);
      let L1 = thread.thread;
      let arg = thread.arg;
      let msg = lua_tostring(L, arg + 1);
      if (msg === null && !lua_isnoneornil(L, arg + 1))
        lua_pushvalue(L, arg + 1);
      else {
        let level = luaL_optinteger(L, arg + 2, L === L1 ? 1 : 0);
        luaL_traceback(L, L1, msg, level);
      }
      return 1;
    };
    var dblib = {
      "gethook": db_gethook,
      "getinfo": db_getinfo,
      "getlocal": db_getlocal,
      "getmetatable": db_getmetatable,
      "getregistry": db_getregistry,
      "getupvalue": db_getupvalue,
      "getuservalue": db_getuservalue,
      "sethook": db_sethook,
      "setlocal": db_setlocal,
      "setmetatable": db_setmetatable,
      "setupvalue": db_setupvalue,
      "setuservalue": db_setuservalue,
      "traceback": db_traceback,
      "upvalueid": db_upvalueid,
      "upvaluejoin": db_upvaluejoin
    };
    var getinput;
    if (typeof process !== "undefined") {
      const readlineSync = (() => {
        try {
          return __require("readline-sync");
        } catch (e) {
          return null;
        }
      })();
      if (readlineSync) {
        readlineSync.setDefaultOptions({
          prompt: "lua_debug> "
        });
        getinput = function() {
          return readlineSync.prompt();
        };
      }
    } else if (typeof window !== "undefined") {
      getinput = function() {
        let input = prompt("lua_debug>", "");
        return input !== null ? input : "";
      };
    }
    if (getinput) {
      dblib.debug = function(L) {
        for (; ; ) {
          let input = getinput();
          if (input === "cont")
            return 0;
          if (input.length === 0)
            continue;
          let buffer = to_luastring2(input);
          if (luaL_loadbuffer(L, buffer, buffer.length, to_luastring2("=(debug command)", true)) || lua_pcall(L, 0, 0, 0)) {
            lua_writestringerror(lua_tojsstring(L, -1), "\n");
          }
          lua_settop(L, 0);
        }
      };
    }
    var luaopen_debug = function(L) {
      luaL_newlib(L, dblib);
      return 1;
    };
    module.exports.luaopen_debug = luaopen_debug;
  }
});

// vendor/fengari/src/loadlib.js
var require_loadlib = __commonJS({
  "vendor/fengari/src/loadlib.js"(exports, module) {
    "use strict";
    var {
      LUA_DIRSEP,
      LUA_EXEC_DIR,
      LUA_JSPATH_DEFAULT,
      LUA_PATH_DEFAULT,
      LUA_PATH_MARK,
      LUA_PATH_SEP
    } = require_luaconf();
    var {
      LUA_OK,
      LUA_REGISTRYINDEX,
      LUA_TNIL,
      LUA_TTABLE,
      lua_callk,
      lua_createtable,
      lua_getfield,
      lua_insert,
      lua_isfunction,
      lua_isnil,
      lua_isstring,
      lua_newtable,
      lua_pop,
      lua_pushboolean,
      lua_pushcclosure,
      lua_pushcfunction,
      lua_pushfstring,
      lua_pushglobaltable,
      lua_pushlightuserdata,
      lua_pushliteral,
      lua_pushlstring,
      lua_pushnil,
      lua_pushstring,
      lua_pushvalue,
      lua_rawgeti,
      lua_rawgetp,
      lua_rawseti,
      lua_rawsetp,
      lua_remove,
      lua_setfield,
      lua_setmetatable,
      lua_settop,
      lua_toboolean,
      lua_tostring,
      lua_touserdata,
      lua_upvalueindex
    } = require_lua();
    var {
      LUA_LOADED_TABLE,
      LUA_PRELOAD_TABLE,
      luaL_Buffer,
      luaL_addvalue,
      luaL_buffinit,
      luaL_checkstring,
      luaL_error,
      luaL_getsubtable,
      luaL_gsub,
      luaL_len,
      luaL_loadfile,
      luaL_newlib,
      luaL_optstring,
      luaL_pushresult,
      luaL_setfuncs
    } = require_lauxlib();
    var lualib2 = require_lualib();
    var {
      luastring_indexOf,
      to_jsstring: to_jsstring2,
      to_luastring: to_luastring2,
      to_uristring
    } = require_fengaricore();
    var fengari2 = require_fengari();
    var global_env = (function() {
      if (typeof process !== "undefined") {
        return global;
      } else if (typeof window !== "undefined") {
        return window;
      } else if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
        return self;
      } else {
        return (0, eval)("this");
      }
    })();
    var JSLIBS = to_luastring2("__JSLIBS__");
    var LUA_PATH_VAR = "LUA_PATH";
    var LUA_JSPATH_VAR = "LUA_JSPATH";
    var LUA_IGMARK = "-";
    var LUA_CSUBSEP = LUA_DIRSEP;
    var LUA_LSUBSEP = LUA_DIRSEP;
    var LUA_POF = to_luastring2("luaopen_");
    var LUA_OFSEP = to_luastring2("_");
    var LIB_FAIL = "open";
    var AUXMARK = to_luastring2("");
    var lsys_load;
    if (typeof process === "undefined") {
      lsys_load = function(L, path, seeglb) {
        path = to_uristring(path);
        let xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.send();
        if (xhr.status < 200 || xhr.status >= 300) {
          lua_pushstring(L, to_luastring2(`${xhr.status}: ${xhr.statusText}`));
          return null;
        }
        let code = xhr.response;
        if (!/\/\/[#@] sourceURL=/.test(code))
          code += " //# sourceURL=" + path;
        let func;
        try {
          func = Function("fengari", code);
        } catch (e) {
          lua_pushstring(L, to_luastring2(`${e.name}: ${e.message}`));
          return null;
        }
        let res = func(fengari2);
        if (typeof res === "function" || typeof res === "object" && res !== null) {
          return res;
        } else if (res === void 0) {
          return global_env;
        } else {
          lua_pushstring(L, to_luastring2(`library returned unexpected type (${typeof res})`));
          return null;
        }
      };
    } else {
      const pathlib = (() => {
        try {
          return __require("path");
        } catch (e) {
          return null;
        }
      })();
      lsys_load = function(L, path, seeglb) {
        path = to_jsstring2(path);
        path = pathlib.resolve(process.cwd(), path);
        try {
          return __require(path);
        } catch (e) {
          lua_pushstring(L, to_luastring2(e.message));
          return null;
        }
      };
    }
    var lsys_sym = function(L, lib, sym) {
      let f = lib[to_jsstring2(sym)];
      if (f && typeof f === "function")
        return f;
      else {
        lua_pushfstring(L, to_luastring2("undefined symbol: %s"), sym);
        return null;
      }
    };
    var noenv = function(L) {
      lua_getfield(L, LUA_REGISTRYINDEX, to_luastring2("LUA_NOENV"));
      let b = lua_toboolean(L, -1);
      lua_pop(L, 1);
      return b;
    };
    var readable;
    if (typeof process !== "undefined") {
      const fs = (() => {
        try {
          return __require("fs");
        } catch (e) {
          return null;
        }
      })();
      readable = function(filename) {
        try {
          let fd = fs.openSync(filename, "r");
          fs.closeSync(fd);
        } catch (e) {
          return false;
        }
        return true;
      };
    } else {
      readable = function(path) {
        path = to_uristring(path);
        let xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.send();
        return xhr.status >= 200 && xhr.status <= 299;
      };
    }
    var ERRLIB = 1;
    var ERRFUNC = 2;
    var lookforfunc = function(L, path, sym) {
      let reg = checkjslib(L, path);
      if (reg === null) {
        reg = lsys_load(L, path, sym[0] === "*".charCodeAt(0));
        if (reg === null) return ERRLIB;
        addtojslib(L, path, reg);
      }
      if (sym[0] === "*".charCodeAt(0)) {
        lua_pushboolean(L, 1);
        return 0;
      } else {
        let f = lsys_sym(L, reg, sym);
        if (f === null)
          return ERRFUNC;
        lua_pushcfunction(L, f);
        return 0;
      }
    };
    var ll_loadlib = function(L) {
      let path = luaL_checkstring(L, 1);
      let init = luaL_checkstring(L, 2);
      let stat = lookforfunc(L, path, init);
      if (stat === 0)
        return 1;
      else {
        lua_pushnil(L);
        lua_insert(L, -2);
        lua_pushliteral(L, stat === ERRLIB ? LIB_FAIL : "init");
        return 3;
      }
    };
    var env = (function() {
      if (typeof process !== "undefined") {
        return process.env;
      } else {
        return global_env;
      }
    })();
    var setpath = function(L, fieldname, envname, dft) {
      let nver = `${envname}${lualib2.LUA_VERSUFFIX}`;
      lua_pushstring(L, to_luastring2(nver));
      let path = env[nver];
      if (path === void 0)
        path = env[envname];
      if (path === void 0 || noenv(L))
        lua_pushstring(L, dft);
      else {
        path = luaL_gsub(
          L,
          to_luastring2(path),
          to_luastring2(LUA_PATH_SEP + LUA_PATH_SEP, true),
          to_luastring2(LUA_PATH_SEP + to_jsstring2(AUXMARK) + LUA_PATH_SEP, true)
        );
        luaL_gsub(L, path, AUXMARK, dft);
        lua_remove(L, -2);
      }
      lua_setfield(L, -3, fieldname);
      lua_pop(L, 1);
    };
    var checkjslib = function(L, path) {
      lua_rawgetp(L, LUA_REGISTRYINDEX, JSLIBS);
      lua_getfield(L, -1, path);
      let plib = lua_touserdata(L, -1);
      lua_pop(L, 2);
      return plib;
    };
    var addtojslib = function(L, path, plib) {
      lua_rawgetp(L, LUA_REGISTRYINDEX, JSLIBS);
      lua_pushlightuserdata(L, plib);
      lua_pushvalue(L, -1);
      lua_setfield(L, -3, path);
      lua_rawseti(L, -2, luaL_len(L, -2) + 1);
      lua_pop(L, 1);
    };
    var pushnexttemplate = function(L, path) {
      while (path[0] === LUA_PATH_SEP.charCodeAt(0)) path = path.subarray(1);
      if (path.length === 0) return null;
      let l = luastring_indexOf(path, LUA_PATH_SEP.charCodeAt(0));
      if (l < 0) l = path.length;
      lua_pushlstring(L, path, l);
      return path.subarray(l);
    };
    var searchpath = function(L, name, path, sep, dirsep) {
      let msg = new luaL_Buffer();
      luaL_buffinit(L, msg);
      if (sep[0] !== 0)
        name = luaL_gsub(L, name, sep, dirsep);
      while ((path = pushnexttemplate(L, path)) !== null) {
        let filename = luaL_gsub(L, lua_tostring(L, -1), to_luastring2(LUA_PATH_MARK, true), name);
        lua_remove(L, -2);
        if (readable(filename))
          return filename;
        lua_pushfstring(L, to_luastring2("\n	no file '%s'"), filename);
        lua_remove(L, -2);
        luaL_addvalue(msg);
      }
      luaL_pushresult(msg);
      return null;
    };
    var ll_searchpath = function(L) {
      let f = searchpath(
        L,
        luaL_checkstring(L, 1),
        luaL_checkstring(L, 2),
        luaL_optstring(L, 3, "."),
        luaL_optstring(L, 4, LUA_DIRSEP)
      );
      if (f !== null) return 1;
      else {
        lua_pushnil(L);
        lua_insert(L, -2);
        return 2;
      }
    };
    var findfile = function(L, name, pname, dirsep) {
      lua_getfield(L, lua_upvalueindex(1), pname);
      let path = lua_tostring(L, -1);
      if (path === null)
        luaL_error(L, to_luastring2("'package.%s' must be a string"), pname);
      return searchpath(L, name, path, to_luastring2("."), dirsep);
    };
    var checkload = function(L, stat, filename) {
      if (stat) {
        lua_pushstring(L, filename);
        return 2;
      } else
        return luaL_error(
          L,
          to_luastring2("error loading module '%s' from file '%s':\n	%s"),
          lua_tostring(L, 1),
          filename,
          lua_tostring(L, -1)
        );
    };
    var searcher_Lua = function(L) {
      let name = luaL_checkstring(L, 1);
      let filename = findfile(L, name, to_luastring2("path", true), to_luastring2(LUA_LSUBSEP, true));
      if (filename === null) return 1;
      return checkload(L, luaL_loadfile(L, filename) === LUA_OK, filename);
    };
    var loadfunc = function(L, filename, modname) {
      let openfunc;
      modname = luaL_gsub(L, modname, to_luastring2("."), LUA_OFSEP);
      let mark = luastring_indexOf(modname, LUA_IGMARK.charCodeAt(0));
      if (mark >= 0) {
        openfunc = lua_pushlstring(L, modname, mark);
        openfunc = lua_pushfstring(L, to_luastring2("%s%s"), LUA_POF, openfunc);
        let stat = lookforfunc(L, filename, openfunc);
        if (stat !== ERRFUNC) return stat;
        modname = mark + 1;
      }
      openfunc = lua_pushfstring(L, to_luastring2("%s%s"), LUA_POF, modname);
      return lookforfunc(L, filename, openfunc);
    };
    var searcher_C = function(L) {
      let name = luaL_checkstring(L, 1);
      let filename = findfile(L, name, to_luastring2("jspath", true), to_luastring2(LUA_CSUBSEP, true));
      if (filename === null) return 1;
      return checkload(L, loadfunc(L, filename, name) === 0, filename);
    };
    var searcher_Croot = function(L) {
      let name = luaL_checkstring(L, 1);
      let p = luastring_indexOf(name, ".".charCodeAt(0));
      let stat;
      if (p < 0) return 0;
      lua_pushlstring(L, name, p);
      let filename = findfile(L, lua_tostring(L, -1), to_luastring2("jspath", true), to_luastring2(LUA_CSUBSEP, true));
      if (filename === null) return 1;
      if ((stat = loadfunc(L, filename, name)) !== 0) {
        if (stat != ERRFUNC)
          return checkload(L, 0, filename);
        else {
          lua_pushfstring(L, to_luastring2("\n	no module '%s' in file '%s'"), name, filename);
          return 1;
        }
      }
      lua_pushstring(L, filename);
      return 2;
    };
    var searcher_preload = function(L) {
      let name = luaL_checkstring(L, 1);
      lua_getfield(L, LUA_REGISTRYINDEX, LUA_PRELOAD_TABLE);
      if (lua_getfield(L, -1, name) === LUA_TNIL)
        lua_pushfstring(L, to_luastring2("\n	no field package.preload['%s']"), name);
      return 1;
    };
    var findloader = function(L, name, ctx, k) {
      let msg = new luaL_Buffer();
      luaL_buffinit(L, msg);
      if (lua_getfield(L, lua_upvalueindex(1), to_luastring2("searchers", true)) !== LUA_TTABLE)
        luaL_error(L, to_luastring2("'package.searchers' must be a table"));
      let ctx2 = { name, i: 1, msg, ctx, k };
      return findloader_cont(L, LUA_OK, ctx2);
    };
    var findloader_cont = function(L, status, ctx) {
      for (; ; ctx.i++) {
        if (status === LUA_OK) {
          if (lua_rawgeti(L, 3, ctx.i) === LUA_TNIL) {
            lua_pop(L, 1);
            luaL_pushresult(ctx.msg);
            luaL_error(L, to_luastring2("module '%s' not found:%s"), ctx.name, lua_tostring(L, -1));
          }
          lua_pushstring(L, ctx.name);
          lua_callk(L, 1, 2, ctx, findloader_cont);
        } else {
          status = LUA_OK;
        }
        if (lua_isfunction(L, -2))
          break;
        else if (lua_isstring(L, -2)) {
          lua_pop(L, 1);
          luaL_addvalue(ctx.msg);
        } else
          lua_pop(L, 2);
      }
      return ctx.k(L, LUA_OK, ctx.ctx);
    };
    var ll_require = function(L) {
      let name = luaL_checkstring(L, 1);
      lua_settop(L, 1);
      lua_getfield(L, LUA_REGISTRYINDEX, LUA_LOADED_TABLE);
      lua_getfield(L, 2, name);
      if (lua_toboolean(L, -1))
        return 1;
      lua_pop(L, 1);
      let ctx = name;
      return findloader(L, name, ctx, ll_require_cont);
    };
    var ll_require_cont = function(L, status, ctx) {
      let name = ctx;
      lua_pushstring(L, name);
      lua_insert(L, -2);
      lua_callk(L, 2, 1, ctx, ll_require_cont2);
      return ll_require_cont2(L, LUA_OK, ctx);
    };
    var ll_require_cont2 = function(L, status, ctx) {
      let name = ctx;
      if (!lua_isnil(L, -1))
        lua_setfield(L, 2, name);
      if (lua_getfield(L, 2, name) == LUA_TNIL) {
        lua_pushboolean(L, 1);
        lua_pushvalue(L, -1);
        lua_setfield(L, 2, name);
      }
      return 1;
    };
    var pk_funcs = {
      "loadlib": ll_loadlib,
      "searchpath": ll_searchpath
    };
    var ll_funcs = {
      "require": ll_require
    };
    var createsearcherstable = function(L) {
      let searchers = [searcher_preload, searcher_Lua, searcher_C, searcher_Croot, null];
      lua_createtable(L);
      for (let i = 0; searchers[i]; i++) {
        lua_pushvalue(L, -2);
        lua_pushcclosure(L, searchers[i], 1);
        lua_rawseti(L, -2, i + 1);
      }
      lua_setfield(L, -2, to_luastring2("searchers", true));
    };
    var createjslibstable = function(L) {
      lua_newtable(L);
      lua_createtable(L, 0, 1);
      lua_setmetatable(L, -2);
      lua_rawsetp(L, LUA_REGISTRYINDEX, JSLIBS);
    };
    var luaopen_package = function(L) {
      createjslibstable(L);
      luaL_newlib(L, pk_funcs);
      createsearcherstable(L);
      setpath(L, to_luastring2("path", true), LUA_PATH_VAR, LUA_PATH_DEFAULT);
      setpath(L, to_luastring2("jspath", true), LUA_JSPATH_VAR, LUA_JSPATH_DEFAULT);
      lua_pushliteral(L, LUA_DIRSEP + "\n" + LUA_PATH_SEP + "\n" + LUA_PATH_MARK + "\n" + LUA_EXEC_DIR + "\n" + LUA_IGMARK + "\n");
      lua_setfield(L, -2, to_luastring2("config", true));
      luaL_getsubtable(L, LUA_REGISTRYINDEX, LUA_LOADED_TABLE);
      lua_setfield(L, -2, to_luastring2("loaded", true));
      luaL_getsubtable(L, LUA_REGISTRYINDEX, LUA_PRELOAD_TABLE);
      lua_setfield(L, -2, to_luastring2("preload", true));
      lua_pushglobaltable(L);
      lua_pushvalue(L, -2);
      luaL_setfuncs(L, ll_funcs, 1);
      lua_pop(L, 1);
      return 1;
    };
    module.exports.luaopen_package = luaopen_package;
  }
});

// vendor/fengari/src/fengarilib.js
var require_fengarilib = __commonJS({
  "vendor/fengari/src/fengarilib.js"(exports, module) {
    var {
      lua_pushinteger,
      lua_pushliteral,
      lua_setfield
    } = require_lua();
    var {
      luaL_newlib
    } = require_lauxlib();
    var {
      FENGARI_AUTHORS,
      FENGARI_COPYRIGHT,
      FENGARI_RELEASE,
      FENGARI_VERSION,
      FENGARI_VERSION_MAJOR,
      FENGARI_VERSION_MINOR,
      FENGARI_VERSION_NUM,
      FENGARI_VERSION_RELEASE,
      to_luastring: to_luastring2
    } = require_fengaricore();
    var luaopen_fengari = function(L) {
      luaL_newlib(L, {});
      lua_pushliteral(L, FENGARI_AUTHORS);
      lua_setfield(L, -2, to_luastring2("AUTHORS"));
      lua_pushliteral(L, FENGARI_COPYRIGHT);
      lua_setfield(L, -2, to_luastring2("COPYRIGHT"));
      lua_pushliteral(L, FENGARI_RELEASE);
      lua_setfield(L, -2, to_luastring2("RELEASE"));
      lua_pushliteral(L, FENGARI_VERSION);
      lua_setfield(L, -2, to_luastring2("VERSION"));
      lua_pushliteral(L, FENGARI_VERSION_MAJOR);
      lua_setfield(L, -2, to_luastring2("VERSION_MAJOR"));
      lua_pushliteral(L, FENGARI_VERSION_MINOR);
      lua_setfield(L, -2, to_luastring2("VERSION_MINOR"));
      lua_pushinteger(L, FENGARI_VERSION_NUM);
      lua_setfield(L, -2, to_luastring2("VERSION_NUM"));
      lua_pushliteral(L, FENGARI_VERSION_RELEASE);
      lua_setfield(L, -2, to_luastring2("VERSION_RELEASE"));
      return 1;
    };
    module.exports.luaopen_fengari = luaopen_fengari;
  }
});

// vendor/fengari/src/linit.js
var require_linit = __commonJS({
  "vendor/fengari/src/linit.js"(exports, module) {
    "use strict";
    var { lua_pop } = require_lua();
    var { luaL_requiref } = require_lauxlib();
    var { to_luastring: to_luastring2 } = require_fengaricore();
    var loadedlibs = {};
    var luaL_openlibs = function(L) {
      for (let lib in loadedlibs) {
        luaL_requiref(L, to_luastring2(lib), loadedlibs[lib], 1);
        lua_pop(L, 1);
      }
    };
    module.exports.luaL_openlibs = luaL_openlibs;
    var lualib2 = require_lualib();
    var { luaopen_base } = require_lbaselib();
    var { luaopen_coroutine } = require_lcorolib();
    var { luaopen_debug } = require_ldblib();
    var { luaopen_math } = require_lmathlib();
    var { luaopen_package } = require_loadlib();
    var { luaopen_os } = require_loslib();
    var { luaopen_string } = require_lstrlib();
    var { luaopen_table } = require_ltablib();
    var { luaopen_utf8 } = require_lutf8lib();
    loadedlibs["_G"] = luaopen_base, loadedlibs[lualib2.LUA_LOADLIBNAME] = luaopen_package;
    loadedlibs[lualib2.LUA_COLIBNAME] = luaopen_coroutine;
    loadedlibs[lualib2.LUA_TABLIBNAME] = luaopen_table;
    loadedlibs[lualib2.LUA_OSLIBNAME] = luaopen_os;
    loadedlibs[lualib2.LUA_STRLIBNAME] = luaopen_string;
    loadedlibs[lualib2.LUA_MATHLIBNAME] = luaopen_math;
    loadedlibs[lualib2.LUA_UTF8LIBNAME] = luaopen_utf8;
    loadedlibs[lualib2.LUA_DBLIBNAME] = luaopen_debug;
    if (typeof process !== "undefined")
      loadedlibs[lualib2.LUA_IOLIBNAME] = require_liolib().luaopen_io;
    var { luaopen_fengari } = require_fengarilib();
    loadedlibs[lualib2.LUA_FENGARILIBNAME] = luaopen_fengari;
  }
});

// vendor/fengari/src/lualib.js
var require_lualib = __commonJS({
  "vendor/fengari/src/lualib.js"(exports, module) {
    "use strict";
    var {
      LUA_VERSION_MAJOR,
      LUA_VERSION_MINOR
    } = require_lua();
    var LUA_VERSUFFIX = "_" + LUA_VERSION_MAJOR + "_" + LUA_VERSION_MINOR;
    module.exports.LUA_VERSUFFIX = LUA_VERSUFFIX;
    module.exports.lua_assert = function(c) {
    };
    module.exports.luaopen_base = require_lbaselib().luaopen_base;
    var LUA_COLIBNAME = "coroutine";
    module.exports.LUA_COLIBNAME = LUA_COLIBNAME;
    module.exports.luaopen_coroutine = require_lcorolib().luaopen_coroutine;
    var LUA_TABLIBNAME = "table";
    module.exports.LUA_TABLIBNAME = LUA_TABLIBNAME;
    module.exports.luaopen_table = require_ltablib().luaopen_table;
    if (typeof process !== "undefined") {
      const LUA_IOLIBNAME = "io";
      module.exports.LUA_IOLIBNAME = LUA_IOLIBNAME;
      module.exports.luaopen_io = require_liolib().luaopen_io;
    }
    var LUA_OSLIBNAME = "os";
    module.exports.LUA_OSLIBNAME = LUA_OSLIBNAME;
    module.exports.luaopen_os = require_loslib().luaopen_os;
    var LUA_STRLIBNAME = "string";
    module.exports.LUA_STRLIBNAME = LUA_STRLIBNAME;
    module.exports.luaopen_string = require_lstrlib().luaopen_string;
    var LUA_UTF8LIBNAME = "utf8";
    module.exports.LUA_UTF8LIBNAME = LUA_UTF8LIBNAME;
    module.exports.luaopen_utf8 = require_lutf8lib().luaopen_utf8;
    var LUA_BITLIBNAME = "bit32";
    module.exports.LUA_BITLIBNAME = LUA_BITLIBNAME;
    var LUA_MATHLIBNAME = "math";
    module.exports.LUA_MATHLIBNAME = LUA_MATHLIBNAME;
    module.exports.luaopen_math = require_lmathlib().luaopen_math;
    var LUA_DBLIBNAME = "debug";
    module.exports.LUA_DBLIBNAME = LUA_DBLIBNAME;
    module.exports.luaopen_debug = require_ldblib().luaopen_debug;
    var LUA_LOADLIBNAME = "package";
    module.exports.LUA_LOADLIBNAME = LUA_LOADLIBNAME;
    module.exports.luaopen_package = require_loadlib().luaopen_package;
    var LUA_FENGARILIBNAME = "fengari";
    module.exports.LUA_FENGARILIBNAME = LUA_FENGARILIBNAME;
    module.exports.luaopen_fengari = require_fengarilib().luaopen_fengari;
    var linit = require_linit();
    module.exports.luaL_openlibs = linit.luaL_openlibs;
  }
});

// vendor/fengari/src/fengari.js
var require_fengari = __commonJS({
  "vendor/fengari/src/fengari.js"(exports, module) {
    "use strict";
    var core = require_fengaricore();
    module.exports.FENGARI_AUTHORS = core.FENGARI_AUTHORS;
    module.exports.FENGARI_COPYRIGHT = core.FENGARI_COPYRIGHT;
    module.exports.FENGARI_RELEASE = core.FENGARI_RELEASE;
    module.exports.FENGARI_VERSION = core.FENGARI_VERSION;
    module.exports.FENGARI_VERSION_MAJOR = core.FENGARI_VERSION_MAJOR;
    module.exports.FENGARI_VERSION_MINOR = core.FENGARI_VERSION_MINOR;
    module.exports.FENGARI_VERSION_NUM = core.FENGARI_VERSION_NUM;
    module.exports.FENGARI_VERSION_RELEASE = core.FENGARI_VERSION_RELEASE;
    module.exports.luastring_eq = core.luastring_eq;
    module.exports.luastring_indexOf = core.luastring_indexOf;
    module.exports.luastring_of = core.luastring_of;
    module.exports.to_jsstring = core.to_jsstring;
    module.exports.to_luastring = core.to_luastring;
    module.exports.to_uristring = core.to_uristring;
    var luaconf = require_luaconf();
    var lua2 = require_lua();
    var lauxlib2 = require_lauxlib();
    var lualib2 = require_lualib();
    module.exports.luaconf = luaconf;
    module.exports.lua = lua2;
    module.exports.lauxlib = lauxlib2;
    module.exports.lualib = lualib2;
  }
});

// client/boot.entry.js
import * as alt from "alt-client";
import * as natives from "natives";

// cfx/lua-transform.js
function segmentLua(src) {
  const segs = [];
  let i = 0, n = src.length, buf = "";
  const pushCode = () => {
    if (buf) {
      segs.push({ text: buf, code: true });
      buf = "";
    }
  };
  while (i < n) {
    const c = src[i], c2 = src[i + 1];
    if (c === "-" && c2 === "-") {
      const m = /^--\[(=*)\[/.exec(src.slice(i));
      if (m) {
        const close = "]" + m[1] + "]";
        const end2 = src.indexOf(close, i + m[0].length);
        const stop2 = end2 === -1 ? n : end2 + close.length;
        pushCode();
        segs.push({ text: src.slice(i, stop2), code: false });
        i = stop2;
        continue;
      }
      const end = src.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      pushCode();
      segs.push({ text: src.slice(i, stop), code: false });
      i = stop;
      continue;
    }
    if (c === "[" && (c2 === "[" || c2 === "=")) {
      const m = /^\[(=*)\[/.exec(src.slice(i));
      if (m) {
        const close = "]" + m[1] + "]";
        const end = src.indexOf(close, i + m[0].length);
        const stop = end === -1 ? n : end + close.length;
        pushCode();
        segs.push({ text: src.slice(i, stop), code: false });
        i = stop;
        continue;
      }
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n) {
        if (src[j] === "\\") j += 2;
        else if (src[j] === c || src[j] === "\n") {
          j++;
          break;
        } else j++;
      }
      pushCode();
      segs.push({ text: src.slice(i, j), code: false });
      i = j;
      continue;
    }
    buf += c;
    i++;
  }
  pushCode();
  return segs;
}
function rewriteBackticks(code) {
  code = code.replace(/\[`([A-Za-z_][A-Za-z0-9_]*)`\]/g, "['$1']");
  code = code.replace(/`([A-Za-z_][A-Za-z0-9_]*)`/g, "_cfxbt_$1");
  return code;
}
function rewriteSafeNavFull(src) {
  let code = src;
  for (let pass = 0; pass < 100; pass++) {
    const segs = segmentLua(code);
    let q = -1;
    let off = 0;
    for (const s of segs) {
      if (s.code) {
        const k = s.text.indexOf("?.");
        if (k !== -1) {
          q = off + k;
          break;
        }
      }
      off += s.text.length;
    }
    if (q === -1) break;
    let i = q - 1, depth = 0;
    while (i >= 0) {
      const c = code[i];
      if (c === ")" || c === "]") {
        depth++;
        i--;
        continue;
      }
      if (c === "(" || c === "[") {
        if (depth === 0) break;
        depth--;
        i--;
        continue;
      }
      if (depth > 0) {
        i--;
        continue;
      }
      if (/[A-Za-z0-9_]/.test(c)) {
        i--;
        continue;
      }
      if (c === ".") {
        i--;
        continue;
      }
      break;
    }
    const lhsStart = i + 1;
    const m = /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*/.exec(code.slice(q + 2));
    if (!m || !m[0] || lhsStart >= q) {
      code = code.slice(0, q) + ". " + code.slice(q + 2);
      continue;
    }
    const tail = m[0];
    const lhs = code.slice(lhsStart, q);
    code = code.slice(0, lhsStart) + `(${lhs} and ${lhs}.${tail})` + code.slice(q + 2 + tail.length);
  }
  return code;
}
function rewriteCompoundLines(code) {
  const lines = code.split("\n");
  const fixed = lines.map((line) => {
    let res = line;
    for (const opRaw of ["..", "+", "-", "*", "/", "%", "//"]) {
      const opRx = new RegExp(`(^|[;\\{\\}]\\s*|[\\s\\)])([A-Za-z_][A-Za-z0-9_.\\[\\]'"() ]*?)\\s*` + opRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=\\s*(.+)$");
      const m = opRx.exec(res);
      if (!m) continue;
      const lead = m[1] || "";
      const lhs = m[2];
      const rhs = m[3];
      if (!lhs.trim()) continue;
      if (!/^[A-Za-z_][A-Za-z0-9_]*\s*([.:\[][\s\S]*)?$/.test(lhs.trim())) continue;
      const comment = (rhs.match(/\s+--.*$/) || [""])[0];
      const rhsBody = rhs.replace(/\s+--.*$/, "");
      res = `${lead}${lhs} = ${lhs} ${opRaw} (${rhsBody})${comment}`;
      break;
    }
    return res;
  });
  return fixed.join("\n");
}
function rewriteAttributes(src) {
  return src.replace(/(\blocal\s+[A-Za-z_][A-Za-z0-9_.\s,]*?[A-Za-z0-9_])\s*<\s*(const|close)\s*>/g, "$1");
}
function transformFiveMLua(src) {
  let code = rewriteAttributes(src);
  code = rewriteSafeNavFull(code);
  const segs = segmentLua(code);
  let out = "";
  for (const s of segs) {
    if (!s.code) {
      out += s.text;
      continue;
    }
    let c = rewriteBackticks(s.text);
    c = rewriteCompoundLines(c);
    out += c;
  }
  return out;
}

// client/core.mjs
function joaat(s) {
  s = String(s).toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h += s.charCodeAt(i);
    h += h << 10;
    h |= 0;
    h ^= h >>> 6;
  }
  h += h << 3;
  h |= 0;
  h ^= h >>> 11;
  h += h << 15;
  h |= 0;
  return h >>> 0;
}
var FIVEM_KEY_ALIASES = {
  "capslock": "CapsLock",
  "capital": "CapsLock",
  "lshift": "LShift",
  "rshift": "RShift",
  "shift": "LShift",
  "lctrl": "LControl",
  "lcontrol": "LControl",
  "rctrl": "RControl",
  "rcontrol": "RControl",
  "ctrl": "LControl",
  "lalt": "LAlt",
  "lmenu": "LAlt",
  "ralt": "RAlt",
  "rmenu": "RAlt",
  "alt": "LAlt",
  "grave": "Backquote",
  "tilde": "Backquote",
  "enter": "Enter",
  "return": "Enter",
  "backspace": "Backspace",
  "back": "Backspace",
  "space": "Space",
  "pageup": "PageUp",
  "prior": "PageUp",
  "pagedown": "PageDown",
  "next": "PageDown",
  "insert": "Insert",
  "delete": "Delete",
  "up": "Up",
  "down": "Down",
  "left": "Left",
  "right": "Right",
  "scrolllock": "ScrollLock",
  "numlock": "NumLock",
  "pause": "Pause"
};
function createFiveMClientRuntime({ vm: vm2, alt: alt2, natives: natives2, payload, preludeSrc, config = {}, log: log2 = console.log, logError: logError2 = console.error }) {
  const state = {
    booted: false,
    webviews: /* @__PURE__ */ new Map(),
    // resource -> webview
    nuiTokens: 0,
    keybinds: [],
    // { code, cmd }
    keydownWired: false,
    warnedNatives: /* @__PURE__ */ new Set(),
    nativeIndex: null,
    // lowercase name -> actual natives key
    kvp: /* @__PURE__ */ new Map(),
    uiMissingWarned: /* @__PURE__ */ new Set()
  };
  function lowerIndex() {
    if (state.nativeIndex) return state.nativeIndex;
    const idx = /* @__PURE__ */ new Map();
    for (const k of Object.keys(natives2 || {})) {
      const low = String(k).toLowerCase();
      if (!idx.has(low)) idx.set(low, k);
    }
    return state.nativeIndex = idx;
  }
  function resolveNativeName(name) {
    const n = String(name);
    if (typeof natives2[n] === "function") return n;
    const stripped = n.replace(/_/g, "").toLowerCase();
    const hit = lowerIndex().get(stripped);
    if (hit && typeof natives2[hit] === "function") return hit;
    return null;
  }
  function timerFn(fn) {
    return () => {
      try {
        fn();
      } catch (e) {
        logError2("[fivem-client] timer:", e && e.message || e);
      }
    };
  }
  function setTimeoutRes(resName, fn, ms) {
    const wrapped = timerFn(fn);
    if (Number(ms) <= 0) {
      if (typeof alt2.everyTick === "function") {
        const id = alt2.everyTick(() => {
          alt2.clearEveryTick(id);
          wrapped();
        });
        return id;
      }
      return (globalThis.setTimeout || alt2.setTimeout)(wrapped, 0);
    }
    const set = typeof alt2.setTimeout === "function" ? alt2.setTimeout : globalThis.setTimeout;
    return set(wrapped, Number(ms));
  }
  function getWebview(resName) {
    if (state.webviews.has(resName)) return state.webviews.get(resName);
    const res = (payload.resources || []).find((r) => r.name === resName);
    const uiPage = res && res.uiPage;
    let wv;
    if (!uiPage) {
      if (!state.uiMissingWarned.has(resName)) {
        state.uiMissingWarned.add(resName);
        logError2(`[fivem-client] ${resName}: NUI used but fxmanifest has no ui_page \u2014 messages dropped`);
      }
      wv = { emit() {
      }, focus() {
      }, unfocus() {
      }, on() {
      } };
    } else {
      const base = String(uiPage).replace(/\\/g, "/").split("/").pop();
      const url = `http://resource/ui/${resName}/${base}`;
      wv = new alt2.WebView(url, true);
      wv.on("fivem:nuiCb", (cbName, body, token) => {
        try {
          vm2.callGlobal("__nuiInvokeCb", resName, String(cbName), String(body || "{}"), String(token));
        } catch (e) {
          logError2(`[fivem-client] nui callback dispatch failed: ${e && e.message || e}`);
        }
      });
    }
    state.webviews.set(resName, wv);
    return wv;
  }
  function wireKeydown() {
    if (state.keydownWired) return;
    state.keydownWired = true;
    alt2.on("keydown", (code) => {
      for (const kb of state.keybinds) {
        if (kb.code === code) {
          try {
            vm2.callGlobal("__execCommand", kb.cmd, "[]");
          } catch (e) {
            logError2(`[fivem-client] keybind command failed: ${e && e.message || e}`);
          }
        }
      }
    });
  }
  function keyCodeFor(keyStr) {
    const raw = String(keyStr || "").trim();
    const up = raw.toUpperCase();
    const KC = alt2.KeyCode || {};
    const tryNames = [];
    if (/^F\d{1,2}$/.test(up) || /^[A-Z0-9]$/.test(up)) tryNames.push(up);
    const alias = FIVEM_KEY_ALIASES[raw.toLowerCase()];
    if (alias) tryNames.push(alias);
    for (const n of tryNames) {
      if (typeof KC[n] === "number") return KC[n];
    }
    return null;
  }
  function callNative(name, args) {
    const resolved = resolveNativeName(name);
    if (!resolved) {
      if (!state.warnedNatives.has(name)) {
        state.warnedNatives.add(name);
        logError2(`[fivem-client] native not found in alt natives module: ${name} (returns nil; further calls silent)`);
      }
      return null;
    }
    const flat = [];
    for (const a of args) {
      if (a && typeof a === "object" && !Array.isArray(a) && typeof a.x === "number" && typeof a.y === "number" && (a.z === void 0 || typeof a.z === "number") && (a.w === void 0 || typeof a.w === "number")) {
        flat.push(a.x, a.y, a.z || 0);
        if (typeof a.w === "number") flat.push(a.w);
      } else {
        flat.push(a);
      }
    }
    try {
      const r = natives2[resolved](...flat);
      if (Array.isArray(r)) return { __nsmMulti: true, values: r };
      return r === void 0 ? null : r;
    } catch (e) {
      logError2(`[fivem-client] native ${name} threw: ${e && e.message || e}`);
      return null;
    }
  }
  function installBridges() {
    vm2.setGlobalFn("__print", (...a) => log2(...a));
    vm2.setGlobalFn("__logError", (...a) => logError2(...a));
    vm2.setGlobalFn("__setTimeoutRes", (resName, fn, ms) => setTimeoutRes(resName, fn, ms));
    vm2.setGlobalFn("__native", (name, ...args) => callNative(name, args));
    vm2.setGlobalFn("__nativeLookup", (name) => resolveNativeName(name) ? true : false);
    vm2.setGlobalFn("__joaat", (s) => joaat(s));
    vm2.setGlobalFn("__netEmitServer", (evName, argsJson) => {
      alt2.emitServer("__fivem:net", String(evName), String(argsJson || "[]"));
    });
    vm2.setGlobalFn("__stateEmitServer", (key, valueJson) => {
      if (typeof alt2.emitServer === "function") {
        alt2.emitServer("__fivem:stateSet", String(key), String(valueJson));
      }
    });
    vm2.setGlobalFn("__nuiSend", (resName, json) => {
      getWebview(resName).emit("fivem:nui", String(json));
    });
    vm2.setGlobalFn("__nuiFocus", (resName, focus, cursor) => {
      const wv = getWebview(resName);
      try {
        if (focus) wv.focus();
        else wv.unfocus();
        if (typeof alt2.showCursor === "function") alt2.showCursor(!!cursor);
      } catch (e) {
        logError2(`[fivem-client] nui focus failed: ${e && e.message || e}`);
      }
    });
    vm2.setGlobalFn("__nuiKeepInput", (resName, keep) => {
      state.keepInput = !!keep;
    });
    vm2.setGlobalFn("__nuiRespond", (token, json) => {
      const resName = String(token).split(":")[0];
      const wv = state.webviews.get(resName);
      if (wv) wv.emit("fivem:nuiResp:" + token, String(json === void 0 || json === null ? "{}" : json));
    });
    vm2.setGlobalFn("__registerKeybind", (cmdName, desc, key) => {
      const code = keyCodeFor(key);
      if (code === null) {
        logError2(`[fivem-client] keybind for '${cmdName}': unmapped FiveM key '${key}'`);
        return;
      }
      if (alt2.Utils && typeof alt2.Utils.Keybind === "function") {
        try {
          new alt2.Utils.Keybind(code, () => {
            try {
              vm2.callGlobal("__execCommand", String(cmdName), "[]");
            } catch (e) {
              logError2(`[fivem-client] keybind command failed: ${e && e.message || e}`);
            }
          });
          return;
        } catch (e) {
        }
      }
      wireKeydown();
      state.keybinds.push({ code, cmd: String(cmdName) });
    });
    vm2.setGlobalFn("__executeCommand", (text) => {
      alt2.emitServer("__fivem:cmd", String(text));
    });
    vm2.setGlobalFn("__getConvar", (k) => {
      const v = (config.convars || {})[String(k)];
      return v === void 0 ? false : v;
    });
    vm2.setGlobalFn("__kvpGet", (k) => {
      const v = state.kvp.get(String(k));
      return v === void 0 ? null : v;
    });
    vm2.setGlobalFn("__kvpSet", (k, v) => {
      state.kvp.set(String(k), v === void 0 ? null : v);
    });
    vm2.setGlobalFn("__resourceState", (n) => {
      const known = (payload.resources || []).some((r) => r.name === String(n));
      return known ? "started" : "missing";
    });
    vm2.setGlobalFn("__readResourceFile", (resName, rel) => {
      const r = (payload.resources || []).find((x) => x.name === String(resName));
      const fc = r && r.fileContents;
      if (!fc) return null;
      const key = String(rel).replace(/\\/g, "/").replace(/^\/+/, "");
      return Object.prototype.hasOwnProperty.call(fc, key) ? fc[key] : null;
    });
    vm2.setGlobalFn("__transformLua", (src) => transformFiveMLua(String(src)));
  }
  async function boot() {
    if (state.booted) throw new Error("already booted");
    state.booted = true;
    await vm2.init();
    installBridges();
    await vm2.doString("client-prelude", preludeSrc);
    if (typeof alt2.onServer === "function") {
      alt2.onServer("__fivem:net", (evName, argsJson) => {
        try {
          vm2.callGlobal("__netDispatch", String(evName), String(argsJson || "[]"));
        } catch (e) {
          logError2(`[fivem-client] net dispatch failed: ${e && e.message || e}`);
        }
      });
      alt2.onServer("__fivem:state", (target, key, valueJson) => {
        try {
          vm2.callGlobal("__stateChange", String(target), String(key), String(valueJson));
        } catch (e) {
          logError2(`[fivem-client] state dispatch failed: ${e && e.message || e}`);
        }
      });
      alt2.onServer("__fivem:init", (serverId, globalStateJson) => {
        try {
          vm2.callGlobal("__setOwnServerId", Number(serverId));
          let gs = {};
          try {
            gs = JSON.parse(String(globalStateJson || "{}")) || {};
          } catch {
          }
          for (const [k, v] of Object.entries(gs)) {
            vm2.callGlobal("__stateChange", "global", String(k), JSON.stringify(v));
          }
          log2(`[fivem-client] handshake complete (server id ${serverId})`);
        } catch (e) {
          logError2(`[fivem-client] init failed: ${e && e.message || e}`);
        }
      });
    }
    const resources = payload.resources || [];
    log2(`[fivem-client] booting with ${resources.length} resource(s) on ${vm2.name} (Lua ${vm2.luaVersion})`);
    let okCount = 0;
    for (const res of resources) {
      for (const script of res.scripts || []) {
        const r = await vm2.callGlobal("__loadClientScript", res.name, `@${res.name}/${script.path}`, script.source);
        if (r === false) logError2(`[fivem-client] ${res.name}: script failed: ${script.path}`);
      }
      okCount++;
    }
    log2(`[fivem-client] boot complete: ${okCount}/${resources.length} resources running`);
    if (typeof alt2.emitServer === "function") {
      try {
        alt2.emitServer("__fivem:ready", true);
      } catch {
      }
    }
  }
  return {
    boot,
    state,
    callGlobal: (name, ...args) => vm2.callGlobal(name, ...args),
    getWebview,
    // test/harness helpers
    _resolveNativeName: resolveNativeName,
    _callNative: callNative,
    _nuiNextToken: (res) => `${res}:${++state.nuiTokens}`
  };
}

// client/vm-fengari.mjs
var import_fengari = __toESM(require_fengari(), 1);
var { lua, lauxlib, lualib } = import_fengari.default;
var { to_luastring, to_jsstring } = import_fengari.default;
function createFengariVM() {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  const nextFnId = { n: 1 };
  function luaToJs(Ls, idx, depth = 0) {
    const t = lua.lua_type(Ls, idx);
    if (t === lua.LUA_TNIL) return null;
    if (t === lua.LUA_TNUMBER) return lua.lua_tonumber(Ls, idx);
    if (t === lua.LUA_TBOOLEAN) return lua.lua_toboolean(Ls, idx);
    if (t === lua.LUA_TSTRING) return to_jsstring(lua.lua_tolstring(Ls, idx));
    if (t === lua.LUA_TFUNCTION) {
      lua.lua_pushvalue(Ls, idx);
      const ref = lauxlib.luaL_ref(Ls, lua.LUA_REGISTRYINDEX);
      nextFnId.n++;
      return (...args) => {
        lua.lua_rawgeti(L, lua.LUA_REGISTRYINDEX, ref);
        for (const a of args) jsToLua(L, a);
        if (lua.lua_pcall(L, args.length, 1, 0) !== lua.LUA_OK) {
          const err = to_jsstring(lua.lua_tolstring(L, -1)) || "lua error";
          lua.lua_pop(L, 1);
          throw new Error(err);
        }
        const r = luaToJs(L, -1);
        lua.lua_pop(L, 1);
        return r;
      };
    }
    if (t === lua.LUA_TTABLE) {
      if (depth > 6) return {};
      const abs = idx < 0 ? lua.lua_gettop(Ls) + 1 + idx : idx;
      const out = {};
      let n = 0;
      lua.lua_pushnil(Ls);
      while (lua.lua_next(Ls, abs) !== 0) {
        const key = luaToJs(Ls, -2, depth + 1);
        const val = luaToJs(Ls, -1, depth + 1);
        out[typeof key === "number" ? String(key) : key] = val;
        n++;
        lua.lua_pop(Ls, 1);
      }
      let isArray = n > 0;
      for (let i = 1; i <= n; i++) {
        if (out[String(i)] === void 0) {
          isArray = false;
          break;
        }
      }
      if (isArray) {
        const arr = [];
        for (let i = 1; i <= n; i++) arr.push(out[String(i)]);
        return arr;
      }
      return out;
    }
    return null;
  }
  function jsToLua(Ls, v, depth = 0) {
    if (v === null || v === void 0) {
      lua.lua_pushnil(Ls);
      return;
    }
    const t = typeof v;
    if (t === "number") {
      if (Number.isInteger(v) && Math.abs(v) <= 2147483647) lua.lua_pushinteger(Ls, v);
      else lua.lua_pushnumber(Ls, v);
      return;
    }
    if (t === "boolean") {
      lua.lua_pushboolean(Ls, v);
      return;
    }
    if (t === "string") {
      lua.lua_pushliteral(Ls, v);
      return;
    }
    if (t === "function") {
      lua.lua_pushcfunction(Ls, v);
      return;
    }
    if (Array.isArray(v)) {
      lua.lua_createtable(Ls, v.length, 0);
      v.forEach((item, i) => {
        jsToLua(Ls, item, depth + 1);
        lua.lua_rawseti(Ls, -2, i + 1);
      });
      return;
    }
    if (t === "object") {
      if (depth > 6) {
        lua.lua_pushnil(Ls);
        return;
      }
      const keys = Object.keys(v);
      lua.lua_createtable(Ls, 0, keys.length);
      for (const k of keys) {
        if (v[k] === void 0) continue;
        lua.lua_pushliteral(Ls, k);
        jsToLua(Ls, v[k], depth + 1);
        lua.lua_rawset(Ls, -3);
      }
      return;
    }
    lua.lua_pushnil(Ls);
  }
  function pushResult(Ls, r) {
    if (r === void 0 || r === null) return 0;
    if (r && r.__nsmMulti) {
      for (const v of r.values) jsToLua(Ls, v);
      return r.values.length;
    }
    jsToLua(Ls, r);
    return 1;
  }
  function wrapJsFunction(fn) {
    const wrapped = (Lstate) => {
      const n = lua.lua_gettop(Lstate);
      const args = [];
      for (let i = 1; i <= n; i++) args.push(luaToJs(Lstate, i));
      try {
        const r = fn(...args);
        return pushResult(Lstate, r);
      } catch (e) {
        lauxlib.luaL_error(Lstate, to_luastring(String(e && e.message || e)));
        return 0;
      }
    };
    return wrapped;
  }
  return {
    name: "fengari",
    luaVersion: "5.3",
    async init() {
    },
    doString(chunkName, source) {
      const status = lauxlib.luaL_loadbuffer(L, to_luastring(source), null, to_luastring(chunkName));
      if (status !== lua.LUA_OK) {
        const err = to_jsstring(lua.lua_tolstring(L, -1)) || `load failed: ${chunkName}`;
        lua.lua_pop(L, 1);
        throw new Error(err);
      }
      if (lua.lua_pcall(L, 0, 0, 0) !== lua.LUA_OK) {
        const err = to_jsstring(lua.lua_tolstring(L, -1)) || `runtime error: ${chunkName}`;
        lua.lua_pop(L, 1);
        throw new Error(err);
      }
    },
    setGlobalFn(name, fn) {
      lua.lua_pushcfunction(L, wrapJsFunction(fn));
      lua.lua_setglobal(L, to_luastring(name));
    },
    callGlobal(name, ...args) {
      lua.lua_getglobal(L, to_luastring(name));
      if (lua.lua_type(L, -1) !== lua.LUA_TFUNCTION) {
        lua.lua_pop(L, 1);
        throw new Error(`callGlobal: '${name}' is not a function`);
      }
      for (const a of args) jsToLua(L, a);
      if (lua.lua_pcall(L, args.length, 1, 0) !== lua.LUA_OK) {
        const err = to_jsstring(lua.lua_tolstring(L, -1)) || "lua error";
        lua.lua_pop(L, 1);
        throw new Error(`${name}: ${err}`);
      }
      const r = luaToJs(L, -1);
      lua.lua_pop(L, 1);
      return r;
    },
    // normalize a Lua-derived value that reached JS (already plain here)
    toPlain(v) {
      return v;
    },
    // eval helper for tests/debug
    eval(source) {
      return this.doString("eval", source);
    },
    // read a global variable's value (tests)
    getGlobalValue(name) {
      lua.lua_getglobal(L, to_luastring(name));
      const v = luaToJs(L, -1);
      lua.lua_pop(L, 1);
      return v;
    }
  };
}

// client/gen/payload.gen.js
var PAYLOAD = {
  "resources": [
    {
      "name": "esx_lib",
      "scripts": [
        {
          "path": "config.lua",
          "source": "Config = {}\n\n---@class MedalClipOptions\n---@field duration integer\n---@field captureDelayMs integer\n---@field alertType 'Default'|'Disabled'|'SoundOnly'|'OverlayOnly'\n\n---@class MedalConfig\n---@field enabled boolean\n---@field publicKey string\n---@field eventName string\n---@field clipOptions MedalClipOptions\n\n---@type MedalConfig\nConfig.Medal = {\n	enabled = true,\n	publicKey = 'pub_82qkpMKV77AkpqLSgWsxLlDyfzpPI7Vw',\n	eventName = 'Death',\n	clipOptions = {\n		duration = 30,\n		captureDelayMs = 0,\n		alertType = 'Default'\n	}\n}"
        },
        {
          "path": "resource/init.lua",
          "source": "---@diagnostic disable: lowercase-global\nxLib = setmetatable({\n    name = 'esx_lib',\n    side = IsDuplicityVersion() and 'server' or 'client'\n}, {\n    __newindex = function(self, key, fn)\n        rawset(self, key, fn)\n\n        if debug.getinfo(2, 'S').short_src:find('@esx_lib/resource') then\n            exports(key, fn)\n        end\n    end,\n\n    __index = function(self, key)\n        local dir = ('imports/%s'):format(key)\n        local chunk = LoadResourceFile(self.name, ('%s/%s.lua'):format(dir, self.side))\n\n        local shared = LoadResourceFile(self.name, ('%s/shared.lua'):format(dir))\n\n        if shared then\n            chunk = (chunk and ('%s\\n%s'):format(shared, chunk)) or shared\n        end\n\n        if chunk then\n            local fn, err = load(chunk, ('@@esx_lib/%s/%s.lua'):format(key, self.side))\n\n            if not fn or err then\n                return error(('\\n^1Error importing module (%s): %s^0'):format(dir, err), 3)\n            end\n\n            rawset(self, key, fn() or Noop)\n\n            return self[key]\n        end\n    end\n})\n\nrequire = xLib.require"
        },
        {
          "path": "resource/callback/shared.lua",
          "source": `--[[
    https://github.com/overextended/ox_lib

    This file is licensed under LGPL-3.0 or higher <https://www.gnu.org/licenses/lgpl-3.0.en.html>

    Copyright \xA9 2025 Linden <https://github.com/thelindat>
]]

local registeredCallbacks = {}
local resource_name = GetCurrentResourceName() --TODO: Add cache
local IS_DEBUG = GetConvar("xLib:debug", "false") == "true"
local VALIDATION_GRACE_MS = GetConvarInt("xLib:callbackValidationGrace", 15000)


AddEventHandler('onResourceStop', function(resourceName)
    if resource_name == resourceName then return end

    for callbackName, resource in pairs(registeredCallbacks) do
        if resource == resourceName then
            registeredCallbacks[callbackName] = nil
        end
    end
end)

---For internal use only.
---Sets a callback event as registered to a specific resource, preventing it from
---being overwritten. Any unknown callbacks will return an error to the caller.
---@param callbackName string
---@param isValid boolean
function xLib.setValidCallback(callbackName, isValid)
    local resourceName = GetInvokingResource() or resource_name
    local callbackResource = registeredCallbacks[callbackName]

    if not isValid then
        if callbackResource == resourceName then
            registeredCallbacks[callbackName] = nil
        end
        return
    end

    if callbackResource then
        if callbackResource == resourceName then return end

        if IS_DEBUG then
            local errMessage = ("^1resource '%s' attempted to overwrite callback '%s' owned by resource '%s'^0"):format(resourceName, callbackName, callbackResource)

            print(('^1SCRIPT ERROR: %s^0\\n%s'):format(errMessage,
                Citizen.InvokeNative(_cfxbt_FORMAT_STACK_TRACE & 0xFFFFFFFF, nil, 0, Citizen.ResultAsString()) or ''))
        end

        return
    end

    if IS_DEBUG then
        print(("set valid callback '%s' for resource '%s'"):format(callbackName, resourceName))
    end

    registeredCallbacks[callbackName] = resourceName
end

function xLib.isCallbackValid(callbackName)
    return registeredCallbacks[callbackName] ~= nil
end

local cbEvent = '__xLib_cb_%s'

RegisterNetEvent('xLib:validateCallback', function(callbackName, invokingResource, key)
    if registeredCallbacks[callbackName] then return end

    local source = source

    local function rejectInvalidCallback()
        if registeredCallbacks[callbackName] then return end

        local event = cbEvent:format(invokingResource)

        if GetGameName() == 'fxserver' then
            return TriggerClientEvent(event, source, key, 'cb_invalid')
        end

        TriggerServerEvent(event, key, 'cb_invalid')
    end

    if VALIDATION_GRACE_MS > 0 then
        SetTimeout(VALIDATION_GRACE_MS, rejectInvalidCallback)
        return
    end

    rejectInvalidCallback()
end)
`
        },
        {
          "path": "resource/medal/client.lua",
          "source": "xLib.getMedalConfig = function()\n    return Config.Medal\nend\n\nxLib.triggerMedalClip = function(publicKey, eventName, clipOptions)\n    if not publicKey or publicKey == '' then return end\n\n    SendNUIMessage({\n        action = 'medalClip',\n        publicKey = publicKey,\n        payload = {\n            eventId = ('esx-clip-%s-%s'):format(GetPlayerServerId(PlayerId()), GetGameTimer()),\n            eventName = eventName or 'Event',\n            triggerActions = { 'SaveClip' },\n            clipOptions = clipOptions or {\n                duration = 30,\n                captureDelayMs = 0,\n                alertType = 'Default'\n            }\n        }\n    })\nend"
        },
        {
          "path": "resource/test/client.lua",
          "source": ""
        }
      ],
      "uiPage": "html/medal.html",
      "files": [
        "imports.lua",
        "imports/**/client.lua",
        "imports/**/shared.lua",
        "html/medal.html",
        "html/medal.js"
      ],
      "fileContents": {
        "imports.lua": `--! DISCLAIMER
--[[
    https://github.com/overextended/ox_lib

    This file is licensed under LGPL-3.0 or higher <https://www.gnu.org/licenses/lgpl-3.0.en.html>

    Copyright \xA9 2025 Linden <https://github.com/thelindat>
]]

-- Const Variables
local CONTEXT<const> = IsDuplicityVersion() and 'server' or 'client'
local LIB_NAME <const> = 'esx_lib'
local IS_DEBUG <const> = GetConvar('xLib:debug', 'false') == 'true'


---@alias Module table | function
---@class xLib
---@field name string
---@field side 'server' | 'client'

-------------------------------------------------
--- Core functions for modules
-------------------------------------------------

--- Function that returns nothing
--- Used as a "shortcut"
function Noop() end

---Loads a module into memory
---@param self xLib
---@param name string -- module name
---@return Module | nil
local function loadModule(self, name)
    local directory = ('imports/%s'):format(name)
    local chunk = LoadResourceFile(LIB_NAME, ('%s/%s.lua'):format(directory, CONTEXT))
    local shared_chunk = LoadResourceFile(LIB_NAME, ('%s/shared.lua'):format(directory))

    if shared_chunk then
        chunk = chunk and ('%s\\n%s'):format(shared_chunk, chunk) or shared_chunk 
    end

    if not chunk then
        return
    end

    -- Second argument is a chunk name
    local fn, err = load(chunk, ('@@%s/imports/%s/%s.lua'):format(LIB_NAME, name, CONTEXT))

    if not fn or err then
        if shared_chunk then
            print(('[%s] Found an error while importing - %s! Try updating %s to the latest version!'):format(LIB_NAME,
                name, LIB_NAME))

            -- Tries to load only shared.lua
            fn, err = load(shared_chunk, ('@@%s/imports/%s/%s.lua'):format(LIB_NAME, name, 'shared'))
        end

        if not fn or err then
            return error(('Completly failed importing module - %s; error - %s'):format(name, err))
        end
    end

    local result = fn()
    self[name] = result or Noop

    return self[name]
end

---Function that is responsible for lazy loading
---@param self xLib
---@param index string -- name of the function/key that is called
---@param ... unknown -- function params
---@return Module
local function call(self, index, ...)
    local module = rawget(self, index) -- uses rawget not to trigger any metamethods

    -- Module Loading
    if not module then
        self[index] = Noop -- to prevent module from loading again if doesn't exists.

        module = loadModule(self, index)

        if not module then
            local function method(...)
               return exports[LIB_NAME][index](nil, ...)
            end
                
            if not ... then
                self[index] = method
            end

            return method
        end
    end

    return module
end


-------------------------------------------------
--- Environment Setup
-------------------------------------------------

-- Creation of xLib object
---@diagnostic disable-next-line: lowercase-global
local xLib = setmetatable({
    name = LIB_NAME,
    side = CONTEXT,
    debug = IS_DEBUG
}, {
    -- Lazy Loading - loads module only when accessed
    __index = call,
    __call = call,
})

-- Allows to xLib to be accessible in resource that imports a lib
_ENV.xLib = xLib
_ENV.require = xLib.require
`,
        "imports/addKeybind/client.lua": `--[[
    https://github.com/overextended/ox_lib

    This file is licensed under LGPL-3.0 or higher <https://www.gnu.org/licenses/lgpl-3.0.en.html>

    Copyright \xA9 2025 Linden <https://github.com/thelindat>
]]

---@class KeybindProps
---@field name string
---@field description string
---@field defaultMapper? string (see: https://docs.fivem.net/docs/game-references/input-mapper-parameter-ids/)
---@field defaultKey? string
---@field disabled? boolean
---@field disable? fun(self: CKeybind, toggle: boolean)
---@field onPressed? fun(self: CKeybind)
---@field onReleased? fun(self: CKeybind)
---@field remove? fun(self: CKeybind)
---@field [string] any

---@class CKeybind : KeybindProps
---@field currentKey string
---@field disabled boolean
---@field isPressed boolean
---@field hash number
---@field getCurrentKey fun(): string
---@field isControlPressed fun(): boolean

local keybinds = {}

local IsPauseMenuActive = IsPauseMenuActive
local GetControlInstructionalButton = GetControlInstructionalButton

local keybind_mt = {
    disabled = false,
    isPressed = false,
    defaultKey = '',
    defaultMapper = 'keyboard',
}

function keybind_mt:__index(index)
    return index == 'currentKey' and self:getCurrentKey() or keybind_mt[index]
end

function keybind_mt:getCurrentKey()
    return GetControlInstructionalButton(0, self.hash, true):sub(3)
end

function keybind_mt:isControlPressed()
    return self.isPressed
end

function keybind_mt:disable(toggle)
    self.disabled = toggle
end

function keybind_mt:remove()
    if not keybinds[self.name] then return end
    keybinds[self.name] = nil
end

---@param data KeybindProps
---@return CKeybind
function xLib.addKeybind(data)
    data.hash = joaat("+" .. data.name) | 0x80000000
    keybinds[data.name] = setmetatable(data, keybind_mt)

    RegisterCommand('+' .. data.name, function()
        if not keybinds[data.name] then return end
        if data.disabled or IsPauseMenuActive() then return end
        data.isPressed = true
        if data.onPressed then data:onPressed() end
    end)

    RegisterCommand('-' .. data.name, function()
        if not keybinds[data.name] then return end
        if data.disabled or IsPauseMenuActive() then return end
        data.isPressed = false
        if data.onReleased then data:onReleased() end
    end)

    RegisterKeyMapping('+' .. data.name, data.description, data.defaultMapper, data.defaultKey)

    SetTimeout(500, function()
        TriggerEvent('chat:removeSuggestion', ('/+%s'):format(data.name))
        TriggerEvent('chat:removeSuggestion', ('/-%s'):format(data.name))
    end)

    return data
end

return xLib.addKeybind`,
        "imports/cache/client.lua": '--[[\n    Generic client-side player state cache, modelled on ox_lib cache.\n    Framework agnostic: natives only, no ESX coupling.\n\n    Loaded per-resource VM through the lazy loader. PlayerPedId() and friends\n    return the same value in every client VM, so the cached values are correct\n    in each resource that requires it.\n\n    Exposes the live values as xLib.cache and emits `xLib:cache:<key>` (value, previous)\n    whenever a tracked value changes. `coords` is read on demand from the live ped\n    and never stored.\n]]\n\nlocal playerId = PlayerId()\n\nlocal cache = setmetatable({\n    playerId = playerId,\n    ped = PlayerPedId(),\n    vehicle = false,\n    seat = false,\n    weapon = false,\n}, {\n    __index = function(self, key)\n        if key == "coords" then\n            return GetEntityCoords(self.ped)\n        elseif key == "serverId" then\n            -- resolved lazily: GetPlayerServerId can return -1 before the network\n            -- session is ready, so only cache it once it is valid.\n            local id = GetPlayerServerId(playerId)\n            if id and id ~= -1 then\n                rawset(self, "serverId", id)\n            end\n            return id\n        end\n    end,\n})\n\nlocal function set(key, value)\n    if cache[key] == value then\n        return\n    end\n\n    local previous = cache[key]\n    rawset(cache, key, value)\n    TriggerEvent(("xLib:cache:%s"):format(key), value, previous)\nend\n\nlocal function getSeat(ped, vehicle)\n    for seat = -1, 16 do\n        if GetPedInVehicleSeat(vehicle, seat) == ped then\n            return seat\n        end\n    end\n    return false\nend\n\nCreateThread(function()\n    while true do\n        local ped = PlayerPedId()\n        if ped ~= cache.ped then\n            set("ped", ped)\n        end\n\n        ---@type integer|false\n        local vehicle = GetVehiclePedIsIn(ped, false)\n        vehicle = vehicle ~= 0 and vehicle or false\n\n        if vehicle ~= cache.vehicle then\n            set("vehicle", vehicle)\n            set("seat", vehicle and getSeat(ped, vehicle) or false)\n        elseif vehicle then\n            local seat = getSeat(ped, vehicle)\n            if seat ~= cache.seat then\n                set("seat", seat)\n            end\n        end\n\n        ---@type integer|false\n        local weapon = GetSelectedPedWeapon(ped)\n        weapon = weapon ~= `WEAPON_UNARMED` and weapon or false\n        if weapon ~= cache.weapon then\n            set("weapon", weapon)\n        end\n\n        Wait(100)\n    end\nend)\n\nreturn cache\n',
        "imports/callback/client.lua": `--[[
    https://github.com/overextended/ox_lib

    This file is licensed under LGPL-3.0 or higher <https://www.gnu.org/licenses/lgpl-3.0.en.html>

    Copyright \xA9 2025 Linden <https://github.com/thelindat>
]]

local pendingCallbacks = {}
local registeredCallbackNames = {}
local compatCallbacks = {}
local timers = {}
local cbEvent = '__xLib_cb_%s'
local callbackTimeout = GetConvarInt('xLib:callbackTimeout', 300000)
local resource_name = GetCurrentResourceName() --TODO: Add cache

local function publishValidCallback(name)
    local ok = pcall(function()
        xLib.setValidCallback(name, true)
    end)

    if not ok then
        SetTimeout(1000, function()
            if registeredCallbackNames[name] then
                publishValidCallback(name)
            end
        end)
    end
end

local function republishValidCallbacks()
    for name in pairs(registeredCallbackNames) do
        publishValidCallback(name)
    end
end

AddEventHandler('onClientResourceStart', function(resource)
    if resource == 'esx_lib' then
        SetTimeout(0, republishValidCallbacks)
    end
end)

-- Compat callbacks (via ESX.Register*) belong to another resource while their
-- handlers live here, so they must be removed manually when that resource stops.
AddEventHandler('onClientResourceStop', function(resource)
    for name, registration in pairs(compatCallbacks) do
        if registration.owner == resource then
            RemoveEventHandler(registration.handler)

            compatCallbacks[name] = nil
            registeredCallbackNames[name] = nil

            if GetResourceState('esx_lib') == 'started' then
                xLib.setValidCallback(name, false)
            end
        end
    end
end)

RegisterNetEvent(cbEvent:format(resource_name), function(key, ...)
    if source == '' then return end

    local cb = pendingCallbacks[key]

    if not cb then return end

    pendingCallbacks[key] = nil

    cb(...)
end)

---@param event string
---@param delay? number | false prevent the event from being called for the given time
local function eventTimer(event, delay)
    if xLib.verify(delay, 'number') then
        if delay > 0 then
            local time = GetGameTimer()

            if (timers[event] or 0) > time then
                return false
            end

            timers[event] = time + delay
        end
    end

    return true
end

---@param _ any
---@param event string
---@param delay number | false | nil
---@param cb function | false
---@param ... any
---@return ...
local function triggerServerCallback(_, event, delay, cb, ...)
    if not eventTimer(event, delay) then return end

    local key

    repeat
        key = ('%s:%s'):format(event, math.random(0, 100000))
    until not pendingCallbacks[key]

    ---@type promise | false
    local promise = not cb and promise.new()

    pendingCallbacks[key] = function(response, ...)
        if response == 'cb_invalid' then
            response = ("callback '%s' does not exist"):format(event)

            return promise and promise:reject(response) or error(response)
        end

        response = { response, ... }

        if promise then
            return promise:resolve(response)
        end

        if cb then
            cb(table.unpack(response))
        end
    end

    TriggerServerEvent('xLib:validateCallback', event, resource_name, key)
    TriggerServerEvent(cbEvent:format(event), resource_name, key, ...)

    if promise then
        SetTimeout(callbackTimeout, function() promise:reject(("callback event '%s' timed out"):format(key)) end)

        return table.unpack(Citizen.Await(promise))
    end
end

---@overload fun(event: string, delay: number | false, cb: function, ...)
xLib.callback = setmetatable({}, {
    __call = function(_, event, delay, cb, ...)
        if not cb then
            warn(("callback event '%s' does not have a function to callback to and will instead await\\nuse xLib.callback.await or a regular event to remove this warning")
                :format(event))
        else
            local cbType = type(cb)

            if cbType == 'table' and getmetatable(cb)?.__call then
                cbType = 'function'
            end

            xLib.verify(cb, 'function', true)
        end

        return triggerServerCallback(_, event, delay, cb, ...)
    end
})

---@param event string
---@param delay? number | false prevent the event from being called for the given time.
---Sends an event to the server and halts the current thread until a response is returned.
---@diagnostic disable-next-line: duplicate-set-field
function xLib.callback.await(event, delay, ...)
    return triggerServerCallback(nil, event, delay, false, ...)
end

local function callbackResponse(success, result, ...)
    if not success then
        if result then
            return print(('^1SCRIPT ERROR: %s^0\\n%s'):format(result,
                Citizen.InvokeNative(\`FORMAT_STACK_TRACE\` & 0xFFFFFFFF, nil, 0, Citizen.ResultAsString()) or ''))
        end

        return false
    end

    return result, ...
end

local pcall = pcall

---@param name string
---@param cb function
---Registers an event handler and callback function to respond to server requests.
---The handler is owned by the importing resource's runtime, so FiveM removes
---it automatically when that resource stops.
---@diagnostic disable-next-line: duplicate-set-field
function xLib.callback.register(name, cb)
    local event = cbEvent:format(name)

    registeredCallbackNames[name] = true
    publishValidCallback(name)

    RegisterNetEvent(event, function(resource, key, ...)
        TriggerServerEvent(cbEvent:format(resource), key, callbackResponse(pcall(cb, ...)))
    end)
end

---@param name string
---@param cb function
---@param owner? string Resource whose lifetime owns the callback.
---Registers a callback using the old ESX client callback signature: function(cb, ...).
---The handler is created here so it can be removed when the owner resource stops.
function xLib.callback.registerCompat(name, cb, owner)
    local event = cbEvent:format(name)

    local function compatCb(...)
        local response = promise.new()
        local responded = false

        local function reply(...)
            local values = { ... }

            if not responded then
                responded = true
                response:resolve(values)
            end

            return table.unpack(values)
        end

        cb(reply, ...)

        return table.unpack(Citizen.Await(response))
    end

    local previous = compatCallbacks[name]
    if previous then
        RemoveEventHandler(previous.handler)
    end

    RegisterNetEvent(event)
    local handler = AddEventHandler(event, function(resource, key, ...)
        TriggerServerEvent(cbEvent:format(resource), key, callbackResponse(pcall(compatCb, ...)))
    end)

    registeredCallbackNames[name] = true
    compatCallbacks[name] = {
        owner = owner or resource_name,
        handler = handler
    }
    publishValidCallback(name)
end

return xLib.callback
`,
        "imports/colors/client.lua": 'xLib.colors = {} \n    \nxLib.colors.brand = GetConvar("esx:brand-color", "#FB9B04")\nxLib.colors.darkest = GetConvar("esx:darkest-color", "#161616")\nxLib.colors.dark = GetConvar("esx:dark-color", "#252525")\nxLib.colors.mid = GetConvar("esx:mid-color", "#383838")\nxLib.colors.light = GetConvar("esx:light-color", "#969696")\nxLib.colors.lightest = GetConvar("esx:lightest-color", "#F2F2F2")\n\nreturn xLib.colors\n',
        "imports/dui/client.lua": '--[[\n    https://github.com/overextended/ox_lib\n\n    This file is licensed under LGPL-3.0 or higher <https://www.gnu.org/licenses/lgpl-3.0.en.html>\n\n    Copyright \xA9 2025 Linden <https://github.com/thelindat>\n]]\n\n---@class DuiProperties\n---@field url string\n---@field width number\n---@field height number\n---@field debug? boolean\n\n---@class Dui\n---@field private_id string\n---@field private_debug boolean\n---@field url string\n---@field duiObject number\n---@field duiHandle string\n---@field runtimeTxd number\n---@field txdObject number\n---@field dictName string\n---@field txtName string\nxLib.dui = xLib.class()\n\nlocal resource<const> = GetCurrentResourceName()\n\n---@type table<string, Dui>\nlocal Duis = {}\n\nlocal currentId = 0\n\n---@param data DuiProperties\nfunction xLib.dui:constructor(data)\n	local time = GetGameTimer()\n	local id = ("%s_%s_%s"):format(resource, time, currentId)\n	currentId = currentId + 1\n	local dictName = ("%s_dui_dict_%s"):format(resource, id)\n	local txtName = ("%s_lib_dui_txt_%s"):format(resource, id)\n	local duiObject = CreateDui(data.url, data.width, data.height)\n	local duiHandle = GetDuiHandle(duiObject)\n	local runtimeTxd = CreateRuntimeTxd(dictName)\n	local txdObject = CreateRuntimeTextureFromDuiHandle(runtimeTxd, txtName, duiHandle)\n	self.private_id = id\n	self.private_debug = data.debug or false\n	self.url = data.url\n	self.duiObject = duiObject\n	self.duiHandle = duiHandle\n	self.runtimeTxd = runtimeTxd\n	self.txdObject = txdObject\n	self.dictName = dictName\n	self.txtName = txtName\n	Duis[id] = self\n\n	if self.private_debug then\n		print(("Dui %s created"):format(id))\n	end\nend\n\nfunction xLib.dui:remove()\n	SetDuiUrl(self.duiObject, "about:blank")\n	DestroyDui(self.duiObject)\n	Duis[self.private_id] = nil\n\n	if self.private_debug then\n		print(("Dui %s removed"):format(self.private_id))\n	end\nend\n\n---@param url string\nfunction xLib.dui:setUrl(url)\n	self.url = url\n	SetDuiUrl(self.duiObject, url)\n\n	if self.private_debug then\n		print(("Dui %s url set to %s"):format(self.private_id, url))\n	end\nend\n\n---@param message table\nfunction xLib.dui:sendMessage(message)\n	SendDuiMessage(self.duiObject, json.encode(message))\n\n	if self.private_debug then\n		print(("Dui %s message sent with data :"):format(self.private_id), json.encode(message, { indent = true }))\n	end\nend\n\n---@param x number\n---@param y number\nfunction xLib.dui:sendMouseMove(x, y)\n	SendDuiMouseMove(self.duiObject, x, y)\nend\n\n---@param button "left" | "middle" | "right"\nfunction xLib.dui:sendMouseDown(button)\n	SendDuiMouseDown(self.duiObject, button)\nend\n\n---@param button "left" | "middle" | "right"\nfunction xLib.dui:sendMouseUp(button)\n	SendDuiMouseUp(self.duiObject, button)\nend\n\n---@param deltaX number\n---@param deltaY number\nfunction xLib.dui:sendMouseWheel(deltaX, deltaY)\n	SendDuiMouseWheel(self.duiObject, deltaY, deltaX)\nend\n\nAddEventHandler("onResourceStop", function(resourceName)\n	if resource ~= resourceName then return end\n\n	for id in next, Duis do\n        Duis[id]:remove()\n    end\nend)\n\nreturn xLib.dui',
        "imports/entity/client.lua": "xLib.entity = {}\n\n---@param entities table The entities to search through\n---@param isPlayerEntities boolean Whether the entities are players\n---@param coords? table | vector3 The coords to search from\n---@param modelFilter? table The model filter\n---@return integer, integer\nfunction xLib.entity.closest(entities, isPlayerEntities, coords, modelFilter)\n    local closestEntity, closestEntityDistance, filteredEntities = -1, -1, nil\n\n    if coords then\n        coords = vector3(coords.x, coords.y, coords.z)\n    else\n        local playerPed = PlayerPedId()\n        coords = GetEntityCoords(playerPed)\n    end\n\n    if modelFilter then\n        filteredEntities = {}\n\n        for currentEntityIndex = 1, #entities do\n            if modelFilter[GetEntityModel(entities[currentEntityIndex])] then\n                filteredEntities[#filteredEntities + 1] = entities[currentEntityIndex]\n            end\n        end\n    end\n\n    for k, entity in pairs(filteredEntities or entities) do\n        local distance = #(coords - GetEntityCoords(entity))\n\n        if closestEntityDistance == -1 or distance < closestEntityDistance then\n            closestEntity, closestEntityDistance = isPlayerEntities and k or entity, distance\n        end\n    end\n\n    return closestEntity, closestEntityDistance\nend\n\n---@param entities table The entities to search through\n---@param isPlayerEntities boolean Whether the entities are players\n---@param coords? table | vector3 The coords to search from\n---@param maxDistance number The maximum distance\n---@return table\nfunction xLib.entity.EnumerateWithinDistance(entities, isPlayerEntities, coords, maxDistance)\n    local nearbyEntities = {}\n\n    if coords then\n        coords = vector3(coords.x, coords.y, coords.z)\n    else\n        local playerPed = PlayerPedId()\n        coords = GetEntityCoords(playerPed)\n    end\n\n    for k, entity in pairs(entities) do\n        local distance = #(coords - GetEntityCoords(entity))\n\n        if distance <= maxDistance then\n            nearbyEntities[#nearbyEntities + 1] = isPlayerEntities and k or entity\n        end\n    end\n\n    return nearbyEntities\nend\n\n---@param entity integer The entity to get the coords of\n---@param coords table | vector3 | vector4 The coords to teleport the entity to\n---@param cb? function The callback function\nfunction xLib.entity.Teleport(entity, coords, cb)\n\n    if DoesEntityExist(entity) then\n        RequestCollisionAtCoord(coords.x, coords.y, coords.z)\n        while not HasCollisionLoadedAroundEntity(entity) do\n            Wait(0)\n        end\n\n        SetEntityCoords(entity, coords.x, coords.y, coords.z, false, false, false, false)\n        SetEntityHeading(entity, coords.w or coords.heading or 0.0)\n    end\n\n    if cb then\n        cb()\n    end\nend\n\nreturn xLib.entity",
        "imports/game/client.lua": '---@class gamelib\nxLib.game = {}\n\nlocal function isCallable(val)\n    local valType = type(val)\n    local mt = getmetatable(val)\n    return valType == "function" or (valType == "table" and mt ~= nil and type(mt.__call) == "function")\nend\n\n---@param ped integer The ped to get the mugshot of\n---@param transparent? boolean Whether the mugshot should be transparent\nfunction xLib.game.getPedMugshot(ped, transparent)\n    if not DoesEntityExist(ped) then\n        return\n    end\n\n    local mugshot = transparent and RegisterPedheadshotTransparent(ped) or RegisterPedheadshot(ped)\n\n    while not IsPedheadshotReady(mugshot) do\n        Wait(0)\n    end\n\n    return mugshot, GetPedheadshotTxdString(mugshot)\nend\n\n---@param object integer | string The object to spawn\n---@param coords table | vector3 The coords to spawn the object at\n---@param cb? function The callback function\n---@param networked? boolean Whether the object should be networked\n---@return integer | nil\nfunction xLib.game.spawnObject(object, coords, cb, networked)\n    local model = type(object) == "number" and object or joaat(object)\n\n    xLib.streaming.requestModel(model)\n\n    local obj = CreateObject(model, coords.x, coords.y, coords.z, networked == nil or networked, false, true)\n    return cb and cb(obj) or obj\nend\n\n---@param object integer | string The object to spawn\n---@param coords table | vector3 The coords to spawn the object at\n---@param cb? function The callback function\n---@return nil\nfunction xLib.game.spawnLocalObject(object, coords, cb)\n    xLib.game.spawnObject(object, coords, cb, false)\nend\n\n---@param vehicle integer The vehicle to delete\n---@return nil\nfunction xLib.game.deleteVehicle(vehicle)\n    SetEntityAsMissionEntity(vehicle, true, true)\n    DeleteVehicle(vehicle)\nend\n\n---@param object integer The object to delete\n---@return nil\nfunction xLib.game.deleteObject(object)\n    SetEntityAsMissionEntity(object, false, true)\n    DeleteObject(object)\nend\n\n---@param vehicleModel integer | string The vehicle to spawn\n---@param coords table | vector3 The coords to spawn the vehicle at\n---@param heading number The heading of the vehicle\n---@param cb? fun(vehicle: number) The callback function\n---@param networked? boolean Whether the vehicle should be networked\n---@return number? vehicle\nfunction xLib.game.spawnVehicle(vehicleModel, coords, heading, cb, networked)\n    if cb and not isCallable(cb) then\n        error("Invalid callback function")\n    end\n\n    local model = type(vehicleModel) == "number" and vehicleModel or joaat(vehicleModel)\n    local vector = type(coords) == "vector3" and coords or vec(coords.x, coords.y, coords.z)\n    local isNetworked = networked == nil or networked\n\n    local playerCoords = GetEntityCoords(PlayerPedId())\n    if not vector or not playerCoords then\n        return\n    end\n\n    local dist = #(playerCoords - vector)\n    if dist > 424 then -- Onesync infinity Range (https://docs.fivem.net/docs/scripting-reference/onesync/)\n        local executingResource = GetInvokingResource() or "Unknown"\n        return error(("Resource ^5%s^1 Tried to spawn vehicle on the client but the position is too far away (Out of onesync range)."):format(executingResource))\n    end\n\n    local promise = not cb and promise.new()\n    CreateThread(function()\n        local modelHash = xLib.streaming.requestModel(model)\n        if not modelHash then\n            if promise then\n                promise:reject(("Tried to spawn invalid vehicle - ^5%s^7!"):format(model))\n                return\n            end\n            error(("Tried to spawn invalid vehicle - ^5%s^7!"):format(model))\n        end\n\n        local vehicle = CreateVehicle(model, vector.x, vector.y, vector.z, heading, isNetworked, true)\n\n        if networked then\n            local id = NetworkGetNetworkIdFromEntity(vehicle)\n            SetNetworkIdCanMigrate(id, true)\n            SetEntityAsMissionEntity(vehicle, true, true)\n        end\n        SetVehicleHasBeenOwnedByPlayer(vehicle, true)\n        SetVehicleNeedsToBeHotwired(vehicle, false)\n        SetModelAsNoLongerNeeded(model)\n        SetVehRadioStation(vehicle, "OFF")\n\n        RequestCollisionAtCoord(vector.x, vector.y, vector.z)\n        while not HasCollisionLoadedAroundEntity(vehicle) do\n            Wait(0)\n        end\n\n        if promise then\n            promise:resolve(vehicle)\n        elseif cb then\n            cb(vehicle)\n        end\n    end)\n\n    if promise then\n        return Citizen.Await(promise)\n    end\nend\n\n---@param vehicle integer The vehicle to spawn\n---@param coords table | vector3 The coords to spawn the vehicle at\n---@param heading number The heading of the vehicle\n---@param cb? function The callback function\n---@return nil\nfunction xLib.game.spawnLocalVehicle(vehicle, coords, heading, cb)\n    xLib.game.spawnVehicle(vehicle, coords, heading, cb, false)\nend\n\n---@param vehicle integer The vehicle to check\n---@return boolean\nfunction xLib.game.isVehicleEmpty(vehicle)\n    return GetVehicleNumberOfPassengers(vehicle) == 0 and IsVehicleSeatFree(vehicle, -1)\nend\n\n---@return table\nfunction xLib.game.getObjects() -- Leave the function for compatibility\n    return GetGamePool("CObject")\nend\n\n---@param onlyOtherPeds? boolean Whether to exlude the player ped\n---@return table\nfunction xLib.game.getPeds(onlyOtherPeds)\n    local pool = GetGamePool("CPed")\n\n    if onlyOtherPeds then\n        local myPed = PlayerPedId()\n        for i = 1, #pool do\n            if pool[i] == myPed then\n                table.remove(pool, i)\n                break\n            end\n        end\n    end\n\n    return pool\nend\n\n---@return table\nfunction xLib.game.getVehicles() -- Leave the function for compatibility\n    return GetGamePool("CVehicle")\nend\n\n---@param onlyOtherPlayers? boolean Whether to exclude the player\n---@param returnKeyValue? boolean Whether to return the key value pair\n---@param returnPeds? boolean Whether to return the peds\n---@return table\nfunction xLib.game.getPlayers(onlyOtherPlayers, returnKeyValue, returnPeds)\n    local players = {}\n    local active = GetActivePlayers()\n\n    for i = 1, #active do\n        local currentPlayer = active[i]\n        local ped = GetPlayerPed(currentPlayer)\n\n        if DoesEntityExist(ped) and ((onlyOtherPlayers and currentPlayer ~= PlayerId()) or not onlyOtherPlayers) then\n            if returnKeyValue then\n                players[currentPlayer] = ped\n            else\n                players[#players + 1] = returnPeds and ped or currentPlayer\n            end\n        end\n    end\n\n    return players\nend\n\n---@param coords? table | vector3 The coords to get the closest object to\n---@param modelFilter? table The model filter\n---@return integer, integer\nfunction xLib.game.getClosestObject(coords, modelFilter)\n    return xLib.entity.closest(xLib.game.getObjects(), false, coords, modelFilter)\nend\n\n---@param coords? table | vector3 The coords to get the closest ped to\n---@param modelFilter? table The model filter\n---@return integer, integer\nfunction xLib.game.getClosestPed(coords, modelFilter)\n    return xLib.entity.closest(xLib.game.getPeds(true), false, coords, modelFilter)\nend\n\n---@param coords? table | vector3 The coords to get the closest player to\n---@return integer, integer\nfunction xLib.game.getClosestPlayer(coords)\n    return xLib.entity.closest(xLib.game.getPlayers(true, true), true, coords, nil)\nend\n\n---@param coords? table | vector3 The coords to get the closest vehicle to\n---@param modelFilter? table The model filter\n---@return integer, integer\nfunction xLib.game.getClosestVehicle(coords, modelFilter)\n    return xLib.entity.closest(xLib.game.getVehicles(), false, coords, modelFilter)\nend\n\n---@param coords table | vector3 The coords to search from\n---@param maxDistance number The max distance to search within\n---@return table\nfunction xLib.game.getPlayersInArea(coords, maxDistance)\n    return xLib.entity.EnumerateWithinDistance(xLib.game.getPlayers(true, true), true, coords, maxDistance)\nend\n\n---@param coords table | vector3 The coords to search from\n---@param maxDistance number The max distance to search within\n---@return table\nfunction xLib.game.getVehiclesInArea(coords, maxDistance)\n    return xLib.entity.EnumerateWithinDistance(xLib.game.getVehicles(), false, coords, maxDistance)\nend\n\n---@param coords table | vector3 The coords to search from\n---@param maxDistance number The max distance to search within\n---@return boolean\nfunction xLib.game.isSpawnPointClear(coords, maxDistance)\n    return #xLib.game.getVehiclesInArea(coords, maxDistance) == 0\nend\n\n---@return integer | nil, vector3 | nil\nfunction xLib.game.getVehicleInDirection()\n    local _, hit, coords, _, _, entity = xLib.Raycast.FromScreen(5, 10, PlayerPedId())\n    if hit and IsEntityAVehicle(entity) then\n        return entity, coords\n    end\nend\n\nlocal function round(value, numDecimalPlaces)\n    if numDecimalPlaces then\n        local power = 10 ^ numDecimalPlaces\n        return math.floor((value * power) + 0.5) / power\n    else\n        return math.floor(value + 0.5)\n    end\nend\n\nlocal function trim(value)\n    value = tostring(value)\n    return (string.gsub(value, "^%s*(.-)%s*$", "%1"))\nend\n\n---@param vehicle integer The vehicle to get the properties of\n---@return table | nil\nfunction xLib.game.getVehicleProperties(vehicle)\n    if not DoesEntityExist(vehicle) then\n        return\n    end\n\n    ---@type number | number[], number | number[]\n    local colorPrimary, colorSecondary = GetVehicleColours(vehicle)\n    local pearlescentColor, wheelColor = GetVehicleExtraColours(vehicle)\n    local dashboardColor = GetVehicleDashboardColor(vehicle)\n    local interiorColor = GetVehicleInteriorColour(vehicle)\n\n    if GetIsVehiclePrimaryColourCustom(vehicle) then\n        colorPrimary = { GetVehicleCustomPrimaryColour(vehicle) }\n    end\n\n    if GetIsVehicleSecondaryColourCustom(vehicle) then\n        colorSecondary = { GetVehicleCustomSecondaryColour(vehicle) }\n    end\n\n    local hasCustomXenonColor, customXenonColorR, customXenonColorG, customXenonColorB = GetVehicleXenonLightsCustomColor(vehicle)\n    local customXenonColor = nil\n    if hasCustomXenonColor then\n        customXenonColor = { customXenonColorR, customXenonColorG, customXenonColorB }\n    end\n\n    local extras = {}\n    for extraId = 0, 20 do\n        if DoesExtraExist(vehicle, extraId) then\n            extras[tostring(extraId)] = IsVehicleExtraTurnedOn(vehicle, extraId)\n        end\n    end\n\n    local doorsBroken, windowsBroken, tyreBurst = {}, {}, {}\n    local numWheels = tostring(GetVehicleNumberOfWheels(vehicle))\n\n    local TyresIndex = { -- Wheel index list according to the number of vehicle wheels.\n        ["2"] = { 0, 4 }, -- Bike and cycle.\n        ["3"] = { 0, 1, 4, 5 }, -- Vehicle with 3 wheels (get for wheels because some 3 wheels vehicles have 2 wheels on front and one rear or the reverse).\n        ["4"] = { 0, 1, 4, 5 }, -- Vehicle with 4 wheels.\n        ["6"] = { 0, 1, 2, 3, 4, 5 }, -- Vehicle with 6 wheels.\n    }\n\n    if TyresIndex[numWheels] then\n        for _, idx in pairs(TyresIndex[numWheels]) do\n            tyreBurst[tostring(idx)] = IsVehicleTyreBurst(vehicle, idx, false)\n        end\n    end\n\n    for windowId = 0, 7 do -- 13\n        RollUpWindow(vehicle, windowId) --fix when you put the car away with the window down\n        windowsBroken[tostring(windowId)] = not IsVehicleWindowIntact(vehicle, windowId)\n    end\n\n    local numDoors = GetNumberOfVehicleDoors(vehicle)\n    if numDoors and numDoors > 0 then\n        for doorsId = 0, numDoors do\n            doorsBroken[tostring(doorsId)] = IsVehicleDoorDamaged(vehicle, doorsId)\n        end\n    end\n\n    return {\n        model = GetEntityModel(vehicle),\n        doorsBroken = doorsBroken,\n        windowsBroken = windowsBroken,\n        tyreBurst = tyreBurst,\n        tyresCanBurst = GetVehicleTyresCanBurst(vehicle),\n        plate = trim(GetVehicleNumberPlateText(vehicle)),\n        plateIndex = GetVehicleNumberPlateTextIndex(vehicle),\n\n        bodyHealth = round(GetVehicleBodyHealth(vehicle), 1),\n        engineHealth = round(GetVehicleEngineHealth(vehicle), 1),\n        tankHealth = round(GetVehiclePetrolTankHealth(vehicle), 1),\n\n        fuelLevel = round(GetVehicleFuelLevel(vehicle), 1),\n        dirtLevel = round(GetVehicleDirtLevel(vehicle), 1),\n        color1 = colorPrimary,\n        color2 = colorSecondary,\n\n        pearlescentColor = pearlescentColor,\n        wheelColor = wheelColor,\n\n        dashboardColor = dashboardColor,\n        interiorColor = interiorColor,\n\n        wheels = GetVehicleWheelType(vehicle),\n        windowTint = GetVehicleWindowTint(vehicle),\n        xenonColor = GetVehicleXenonLightsColor(vehicle),\n        customXenonColor = customXenonColor,\n\n        neonEnabled = { IsVehicleNeonLightEnabled(vehicle, 0), IsVehicleNeonLightEnabled(vehicle, 1), IsVehicleNeonLightEnabled(vehicle, 2), IsVehicleNeonLightEnabled(vehicle, 3) },\n\n        neonColor = table.pack(GetVehicleNeonLightsColour(vehicle)),\n        extras = extras,\n        tyreSmokeColor = table.pack(GetVehicleTyreSmokeColor(vehicle)),\n\n        modSpoilers = GetVehicleMod(vehicle, 0),\n        modFrontBumper = GetVehicleMod(vehicle, 1),\n        modRearBumper = GetVehicleMod(vehicle, 2),\n        modSideSkirt = GetVehicleMod(vehicle, 3),\n        modExhaust = GetVehicleMod(vehicle, 4),\n        modFrame = GetVehicleMod(vehicle, 5),\n        modGrille = GetVehicleMod(vehicle, 6),\n        modHood = GetVehicleMod(vehicle, 7),\n        modFender = GetVehicleMod(vehicle, 8),\n        modRightFender = GetVehicleMod(vehicle, 9),\n        modRoof = GetVehicleMod(vehicle, 10),\n        modRoofLivery = GetVehicleRoofLivery(vehicle),\n\n        modEngine = GetVehicleMod(vehicle, 11),\n        modBrakes = GetVehicleMod(vehicle, 12),\n        modTransmission = GetVehicleMod(vehicle, 13),\n        modHorns = GetVehicleMod(vehicle, 14),\n        modSuspension = GetVehicleMod(vehicle, 15),\n        modArmor = GetVehicleMod(vehicle, 16),\n\n        modTurbo = IsToggleModOn(vehicle, 18),\n        modSmokeEnabled = IsToggleModOn(vehicle, 20),\n        modXenon = IsToggleModOn(vehicle, 22),\n\n        modFrontWheels = GetVehicleMod(vehicle, 23),\n        modCustomFrontWheels = GetVehicleModVariation(vehicle, 23),\n        modBackWheels = GetVehicleMod(vehicle, 24),\n        modCustomBackWheels = GetVehicleModVariation(vehicle, 24),\n\n        modPlateHolder = GetVehicleMod(vehicle, 25),\n        modVanityPlate = GetVehicleMod(vehicle, 26),\n        modTrimA = GetVehicleMod(vehicle, 27),\n        modOrnaments = GetVehicleMod(vehicle, 28),\n        modDashboard = GetVehicleMod(vehicle, 29),\n        modDial = GetVehicleMod(vehicle, 30),\n        modDoorSpeaker = GetVehicleMod(vehicle, 31),\n        modSeats = GetVehicleMod(vehicle, 32),\n        modSteeringWheel = GetVehicleMod(vehicle, 33),\n        modShifterLeavers = GetVehicleMod(vehicle, 34),\n        modAPlate = GetVehicleMod(vehicle, 35),\n        modSpeakers = GetVehicleMod(vehicle, 36),\n        modTrunk = GetVehicleMod(vehicle, 37),\n        modHydrolic = GetVehicleMod(vehicle, 38),\n        modEngineBlock = GetVehicleMod(vehicle, 39),\n        modAirFilter = GetVehicleMod(vehicle, 40),\n        modStruts = GetVehicleMod(vehicle, 41),\n        modArchCover = GetVehicleMod(vehicle, 42),\n        modAerials = GetVehicleMod(vehicle, 43),\n        modTrimB = GetVehicleMod(vehicle, 44),\n        modTank = GetVehicleMod(vehicle, 45),\n        modWindows = GetVehicleMod(vehicle, 46),\n        modLivery = GetVehicleMod(vehicle, 48) == -1 and GetVehicleLivery(vehicle) or GetVehicleMod(vehicle, 48),\n        modLightbar = GetVehicleMod(vehicle, 49),\n    }\nend\n\n---@param vehicle integer The vehicle to set the properties of\n---@param props table The properties to set\n---@return nil\nfunction xLib.game.setVehicleProperties(vehicle, props)\n    if not DoesEntityExist(vehicle) then\n        return\n    end\n    local colorPrimary, colorSecondary = GetVehicleColours(vehicle)\n    local pearlescentColor, wheelColor = GetVehicleExtraColours(vehicle)\n    SetVehicleModKit(vehicle, 0)\n\n    if props.tyresCanBurst ~= nil then\n        SetVehicleTyresCanBurst(vehicle, props.tyresCanBurst)\n    end\n\n    if props.plate ~= nil then\n        SetVehicleNumberPlateText(vehicle, props.plate)\n    end\n    if props.plateIndex ~= nil then\n        SetVehicleNumberPlateTextIndex(vehicle, props.plateIndex)\n    end\n    if props.bodyHealth ~= nil then\n        SetVehicleBodyHealth(vehicle, props.bodyHealth + 0.0)\n    end\n    if props.engineHealth ~= nil then\n        SetVehicleEngineHealth(vehicle, props.engineHealth + 0.0)\n    end\n    if props.tankHealth ~= nil then\n        SetVehiclePetrolTankHealth(vehicle, props.tankHealth + 0.0)\n    end\n    if props.fuelLevel ~= nil then\n        SetVehicleFuelLevel(vehicle, props.fuelLevel + 0.0)\n    end\n    if props.dirtLevel ~= nil then\n        SetVehicleDirtLevel(vehicle, props.dirtLevel + 0.0)\n    end\n    if props.color1 ~= nil then\n        if type(props.color1) == "table" then\n            SetVehicleCustomPrimaryColour(vehicle, props.color1[1], props.color1[2], props.color1[3])\n        else\n            SetVehicleColours(vehicle, props.color1, colorSecondary)\n        end\n    end\n    if props.color2 ~= nil then\n        if type(props.color2) == "table" then\n            SetVehicleCustomSecondaryColour(vehicle, props.color2[1], props.color2[2], props.color2[3])\n        else\n            SetVehicleColours(vehicle, type(props.color1) == "number" and props.color1 or colorPrimary, props.color2)\n        end\n    end\n    if props.pearlescentColor ~= nil then\n        SetVehicleExtraColours(vehicle, props.pearlescentColor, wheelColor)\n    end\n\n    if props.interiorColor ~= nil then\n        SetVehicleInteriorColor(vehicle, props.interiorColor)\n    end\n\n    if props.dashboardColor ~= nil then\n        SetVehicleDashboardColor(vehicle, props.dashboardColor)\n    end\n\n    if props.wheelColor ~= nil then\n        SetVehicleExtraColours(vehicle, props.pearlescentColor or pearlescentColor, props.wheelColor)\n    end\n    if props.wheels ~= nil then\n        SetVehicleWheelType(vehicle, props.wheels)\n    end\n    if props.windowTint ~= nil then\n        SetVehicleWindowTint(vehicle, props.windowTint)\n    end\n\n    if props.neonEnabled ~= nil then\n        SetVehicleNeonLightEnabled(vehicle, 0, props.neonEnabled[1])\n        SetVehicleNeonLightEnabled(vehicle, 1, props.neonEnabled[2])\n        SetVehicleNeonLightEnabled(vehicle, 2, props.neonEnabled[3])\n        SetVehicleNeonLightEnabled(vehicle, 3, props.neonEnabled[4])\n    end\n\n    if props.extras ~= nil then\n        for extraId, enabled in pairs(props.extras) do\n            extraId = tonumber(extraId)\n            if extraId then\n                SetVehicleExtra(vehicle, extraId, not enabled)\n            end\n        end\n    end\n\n    if props.neonColor ~= nil then\n        SetVehicleNeonLightsColour(vehicle, props.neonColor[1], props.neonColor[2], props.neonColor[3])\n    end\n    if props.xenonColor ~= nil then\n        SetVehicleXenonLightsColor(vehicle, props.xenonColor)\n    end\n    if props.customXenonColor ~= nil then\n        SetVehicleXenonLightsCustomColor(vehicle, props.customXenonColor[1], props.customXenonColor[2], props.customXenonColor[3])\n    end\n    if props.modSmokeEnabled ~= nil then\n        ToggleVehicleMod(vehicle, 20, true)\n    end\n    if props.tyreSmokeColor ~= nil then\n        SetVehicleTyreSmokeColor(vehicle, props.tyreSmokeColor[1], props.tyreSmokeColor[2], props.tyreSmokeColor[3])\n    end\n    if props.modSpoilers ~= nil then\n        SetVehicleMod(vehicle, 0, props.modSpoilers, false)\n    end\n    if props.modFrontBumper ~= nil then\n        SetVehicleMod(vehicle, 1, props.modFrontBumper, false)\n    end\n    if props.modRearBumper ~= nil then\n        SetVehicleMod(vehicle, 2, props.modRearBumper, false)\n    end\n    if props.modSideSkirt ~= nil then\n        SetVehicleMod(vehicle, 3, props.modSideSkirt, false)\n    end\n    if props.modExhaust ~= nil then\n        SetVehicleMod(vehicle, 4, props.modExhaust, false)\n    end\n    if props.modFrame ~= nil then\n        SetVehicleMod(vehicle, 5, props.modFrame, false)\n    end\n    if props.modGrille ~= nil then\n        SetVehicleMod(vehicle, 6, props.modGrille, false)\n    end\n    if props.modHood ~= nil then\n        SetVehicleMod(vehicle, 7, props.modHood, false)\n    end\n    if props.modFender ~= nil then\n        SetVehicleMod(vehicle, 8, props.modFender, false)\n    end\n    if props.modRightFender ~= nil then\n        SetVehicleMod(vehicle, 9, props.modRightFender, false)\n    end\n    if props.modRoof ~= nil then\n        SetVehicleMod(vehicle, 10, props.modRoof, false)\n    end\n\n    if props.modRoofLivery ~= nil then\n        SetVehicleRoofLivery(vehicle, props.modRoofLivery)\n    end\n\n    if props.modEngine ~= nil then\n        SetVehicleMod(vehicle, 11, props.modEngine, false)\n    end\n    if props.modBrakes ~= nil then\n        SetVehicleMod(vehicle, 12, props.modBrakes, false)\n    end\n    if props.modTransmission ~= nil then\n        SetVehicleMod(vehicle, 13, props.modTransmission, false)\n    end\n    if props.modHorns ~= nil then\n        SetVehicleMod(vehicle, 14, props.modHorns, false)\n    end\n    if props.modSuspension ~= nil then\n        SetVehicleMod(vehicle, 15, props.modSuspension, false)\n    end\n    if props.modArmor ~= nil then\n        SetVehicleMod(vehicle, 16, props.modArmor, false)\n    end\n    if props.modTurbo ~= nil then\n        ToggleVehicleMod(vehicle, 18, props.modTurbo)\n    end\n    if props.modXenon ~= nil then\n        ToggleVehicleMod(vehicle, 22, props.modXenon)\n    end\n    if props.modFrontWheels ~= nil then\n        SetVehicleMod(vehicle, 23, props.modFrontWheels, props.modCustomFrontWheels)\n    end\n    if props.modBackWheels ~= nil then\n        SetVehicleMod(vehicle, 24, props.modBackWheels, props.modCustomBackWheels)\n    end\n    if props.modPlateHolder ~= nil then\n        SetVehicleMod(vehicle, 25, props.modPlateHolder, false)\n    end\n    if props.modVanityPlate ~= nil then\n        SetVehicleMod(vehicle, 26, props.modVanityPlate, false)\n    end\n    if props.modTrimA ~= nil then\n        SetVehicleMod(vehicle, 27, props.modTrimA, false)\n    end\n    if props.modOrnaments ~= nil then\n        SetVehicleMod(vehicle, 28, props.modOrnaments, false)\n    end\n    if props.modDashboard ~= nil then\n        SetVehicleMod(vehicle, 29, props.modDashboard, false)\n    end\n    if props.modDial ~= nil then\n        SetVehicleMod(vehicle, 30, props.modDial, false)\n    end\n    if props.modDoorSpeaker ~= nil then\n        SetVehicleMod(vehicle, 31, props.modDoorSpeaker, false)\n    end\n    if props.modSeats ~= nil then\n        SetVehicleMod(vehicle, 32, props.modSeats, false)\n    end\n    if props.modSteeringWheel ~= nil then\n        SetVehicleMod(vehicle, 33, props.modSteeringWheel, false)\n    end\n    if props.modShifterLeavers ~= nil then\n        SetVehicleMod(vehicle, 34, props.modShifterLeavers, false)\n    end\n    if props.modAPlate ~= nil then\n        SetVehicleMod(vehicle, 35, props.modAPlate, false)\n    end\n    if props.modSpeakers ~= nil then\n        SetVehicleMod(vehicle, 36, props.modSpeakers, false)\n    end\n    if props.modTrunk ~= nil then\n        SetVehicleMod(vehicle, 37, props.modTrunk, false)\n    end\n    if props.modHydrolic ~= nil then\n        SetVehicleMod(vehicle, 38, props.modHydrolic, false)\n    end\n    if props.modEngineBlock ~= nil then\n        SetVehicleMod(vehicle, 39, props.modEngineBlock, false)\n    end\n    if props.modAirFilter ~= nil then\n        SetVehicleMod(vehicle, 40, props.modAirFilter, false)\n    end\n    if props.modStruts ~= nil then\n        SetVehicleMod(vehicle, 41, props.modStruts, false)\n    end\n    if props.modArchCover ~= nil then\n        SetVehicleMod(vehicle, 42, props.modArchCover, false)\n    end\n    if props.modAerials ~= nil then\n        SetVehicleMod(vehicle, 43, props.modAerials, false)\n    end\n    if props.modTrimB ~= nil then\n        SetVehicleMod(vehicle, 44, props.modTrimB, false)\n    end\n    if props.modTank ~= nil then\n        SetVehicleMod(vehicle, 45, props.modTank, false)\n    end\n    if props.modWindows ~= nil then\n        SetVehicleMod(vehicle, 46, props.modWindows, false)\n    end\n\n    if props.modLivery ~= nil then\n        SetVehicleMod(vehicle, 48, props.modLivery, false)\n        SetVehicleLivery(vehicle, props.modLivery)\n    end\n\n    if props.windowsBroken ~= nil then\n        for k, v in pairs(props.windowsBroken) do\n            if v then\n                k = tonumber(k)\n                if k then\n                    RemoveVehicleWindow(vehicle, k)\n                end\n            end\n        end\n    end\n\n    if props.doorsBroken ~= nil then\n        for k, v in pairs(props.doorsBroken) do\n            if v then\n                k = tonumber(k)\n                if k then\n                    SetVehicleDoorBroken(vehicle, k, true)\n                end\n            end\n        end\n    end\n\n    if props.tyreBurst ~= nil then\n        for k, v in pairs(props.tyreBurst) do\n            if v then\n                k = tonumber(k)\n                if k then\n                    SetVehicleTyreBurst(vehicle, k, true, 1000.0)\n                end\n            end\n        end\n    end\nend\n\nreturn xLib.game\n',
        "imports/interactions/client.lua": '---@class interactionslib\nxLib.interactions = {}\n\nlocal interactions = {}\n\n---@param name string\nfunction xLib.interactions.remove(name)\n    if not interactions[name] then return end\n    interactions[name] = nil\nend\n\n---@param name string\n---@param onPress function\n---@param condition? function\nfunction xLib.interactions.register(name, onPress, condition)\n    interactions[name] = {\n        condition = condition or function() return true end,\n        onPress = onPress,\n        creator = GetInvokingResource() or "es_extended"\n    }\nend\n\n---@return string\nfunction xLib.interactions.getInteractKey()\n    local hash = joaat("esx_interact") | 0x80000000\n    return GetControlInstructionalButton(0, hash, true):sub(3)\nend\n\nxLib.addKeybind({\n    name = "esx_interact",\n    description = "Interact",\n    defaultMapper = "keyboard",\n    defaultKey = "e",\n    onPressed = function()\n        for _, interaction in pairs(interactions) do\n            local success, result = pcall(interaction.condition)\n            if success and result then\n                interaction.onPress()\n            end\n        end\n    end\n})\n\nAddEventHandler("onResourceStop", function(resource)\n    for name, interaction in pairs(interactions) do\n        if interaction.creator == resource then\n            interactions[name] = nil\n        end\n    end\nend)\n\nreturn xLib.interactions\n',
        "imports/medal/client.lua": "local medal = {}\n\nfunction medal.getConfig()\n    return exports['esx_lib']:getMedalConfig()\nend\n\nfunction medal.triggerClip(publicKey, eventName, clipOptions)\n    local cfg = medal.getConfig()\n    if not cfg or not cfg.enabled then return end\n\n    exports['esx_lib']:triggerMedalClip(\n        publicKey or cfg.publicKey,\n        eventName or cfg.eventName,\n        clipOptions or cfg.clipOptions\n    )\nend\n\nreturn medal",
        "imports/point/client.lua": "---@class xPoint\n---@field coords vector3\n---@field hidden? boolean\n---@field enter? function\n---@field leave? function\n---@field inside? function\n---@field handle integer\nxLib.point = xLib.class()\n\n---@param properties table coords, distance, hidden, enter, leave, inside\nfunction xLib.point:constructor(properties)\n    self.coords = properties.coords\n    self.hidden = properties.hidden\n    self.enter = properties.enter\n    self.leave = properties.leave\n    self.inside = properties.inside\n\n    self.handle = xLib.points.create(\n        properties.coords,\n        properties.distance,\n        properties.hidden,\n        function()\n            if self.enter then\n                self:enter()\n            end\n        end,\n        function()\n            if self.leave then\n                self:leave()\n            end\n        end,\n        properties.inside and function(dist)\n            self:inside(dist)\n        end or nil\n    )\nend\n\nfunction xLib.point:delete()\n    xLib.points.remove(self.handle)\nend\n\n---@param hidden? boolean\nfunction xLib.point:toggle(hidden)\n    if hidden == nil then\n        hidden = not self.hidden\n    end\n\n    self.hidden = hidden\n    xLib.points.hide(self.handle, hidden)\nend\n\nreturn xLib.point\n",
        "imports/points/client.lua": '---@class pointslib\nxLib.points = {}\n\nlocal points = {}\nlocal insidePoints = {}\nlocal handleCount = 0\nlocal loopStarted = false\n\n---@param coords vector3\n---@param distance number\n---@param hidden? boolean\n---@param enter function\n---@param leave function\n---@param inside? function\n---@return integer handle\nfunction xLib.points.create(coords, distance, hidden, enter, leave, inside)\n    handleCount = handleCount + 1\n    local handle = handleCount\n\n    points[handle] = {\n        coords = coords,\n        distance = distance,\n        hidden = hidden,\n        enter = enter,\n        leave = leave,\n        inside = inside,\n        resource = GetInvokingResource()\n    }\n\n    return handle\nend\n\n---@param handle integer\nfunction xLib.points.remove(handle)\n    points[handle] = nil\n    insidePoints[handle] = nil\nend\n\n---@param handle integer\n---@param hidden boolean\nfunction xLib.points.hide(handle, hidden)\n    if points[handle] then\n        points[handle].hidden = hidden\n    end\nend\n\nfunction xLib.points.startLoop()\n    if loopStarted then\n        return\n    end\n\n    loopStarted = true\n\n    CreateThread(function()\n        local lastScan = 0\n\n        while true do\n            local coords = GetEntityCoords(PlayerPedId())\n\n            for handle, point in pairs(insidePoints) do\n                if not pcall(point.inside, #(coords - point.coords)) then\n                    insidePoints[handle] = nil\n                    print(("[^1ERROR^7] point ^5%s^7 from ^5%s^7 errored on inside"):format(handle, point.resource))\n                end\n            end\n\n            local now = GetGameTimer()\n            if now - lastScan >= 500 then\n                lastScan = now\n\n                for handle, point in pairs(points) do\n                    if not point.hidden and #(coords - point.coords) <= point.distance then\n                        if not point.nearby then\n                            point.nearby = true\n\n                            if point.enter and not pcall(point.enter) then\n                                print(("[^1ERROR^7] point ^5%s^7 from ^5%s^7 errored on enter"):format(handle, point.resource))\n                            end\n\n                            if point.inside then\n                                insidePoints[handle] = point\n                            end\n                        end\n                    elseif point.nearby then\n                        point.nearby = false\n\n                        if point.leave and not pcall(point.leave) then\n                            print(("[^1ERROR^7] point ^5%s^7 from ^5%s^7 errored on leave"):format(handle, point.resource))\n                        end\n\n                        insidePoints[handle] = nil\n                    end\n                end\n            end\n\n            Wait(next(insidePoints) and 0 or 500)\n        end\n    end)\nend\n\nAddEventHandler("onResourceStop", function(resource)\n    for handle, point in pairs(points) do\n        if point.resource == resource then\n            points[handle] = nil\n            insidePoints[handle] = nil\n        end\n    end\nend)\n\nreturn xLib.points\n',
        "imports/pubsub/client.lua": "-- Per-VM client listener for xLib pub/sub. Routes incoming topic data to the\n-- handlers registered with xLib.pubsub.on. on() only listens; the player must be\n-- subscribed server-side to actually receive anything.\n\nlocal PUBSUB_EVENT <const> = '__xLib_pubsub' -- must match resource/pubsub/server.lua\n\n-- topic -> array of handlers\nlocal handlers = {}\n\nlocal pubsub = {}\n\n---Register a handler for a topic. Multiple handlers per topic are allowed.\n---@param topic string\n---@param handler fun(data: any, topic: string)\nfunction pubsub.on(topic, handler)\n    if type(topic) ~= 'string' or type(handler) ~= 'function' then\n        return\n    end\n\n    local list = handlers[topic]\n    if not list then\n        list = {}\n        handlers[topic] = list\n    end\n    list[#list + 1] = handler\nend\n\n---Remove handlers for a topic. Without a handler argument, removes all of them.\n---@param topic string\n---@param handler? function\nfunction pubsub.off(topic, handler)\n    if not handler then\n        handlers[topic] = nil\n        return\n    end\n\n    local list = handlers[topic]\n    if not list then\n        return\n    end\n\n    for i = #list, 1, -1 do\n        if list[i] == handler then\n            table.remove(list, i)\n        end\n    end\n\n    if list[1] == nil then\n        handlers[topic] = nil\n    end\nend\n\nRegisterNetEvent(PUBSUB_EVENT, function(topic, data)\n    local list = handlers[topic]\n    if not list then\n        return\n    end\n\n    -- fast path: a topic almost always has a single handler, so skip the copy\n    local n = #list\n    if n == 1 then\n        list[1](data, topic)\n        return\n    end\n\n    -- snapshot so a handler that calls off() mid-dispatch cannot shift the list\n    -- and skip a sibling that has not run yet\n    local snapshot = {}\n    for i = 1, n do\n        snapshot[i] = list[i]\n    end\n\n    for i = 1, n do\n        snapshot[i](data, topic)\n    end\nend)\n\nxLib.pubsub = pubsub\nreturn pubsub\n",
        "imports/raycast/client.lua": "xLib.Raycast = {}\nxLib.Raycast.__index = xLib.Raycast\n\nlocal unpack = table.unpack\nlocal GetShapeTestResultIncludingMaterial = GetShapeTestResultIncludingMaterial\nlocal StartShapeTestLosProbe = StartShapeTestLosProbe\nlocal GetWorldCoordFromScreenCoord = GetWorldCoordFromScreenCoord\n\n---@param shape integer The shape test handle to wait for\n---@return boolean, table, table, integer, integer\nfunction xLib.Raycast.GetShapeTestResult(shape)\n    local handle, hit, coords, normal, material, entity\n\n    repeat\n        handle, hit, coords, normal, material, entity = GetShapeTestResultIncludingMaterial(shape)\n        Wait(0)\n    until handle ~= 1\n\n    return hit, coords, normal, material, entity\nend\n\n---@param depth number The raycast distance\n---@vararg any Additional arguments to pass to shape test\n---@return table, boolean, table, table, integer, integer\nfunction xLib.Raycast.FromScreen(depth, ...)\n    local worldCoords, normalVector = GetWorldCoordFromScreenCoord(0.5, 0.5)\n    local origin = worldCoords + normalVector\n    local target = worldCoords + normalVector * depth\n    return target, xLib.Raycast.GetShapeTestResult(StartShapeTestLosProbe(origin.x, origin.y, origin.z, target.x, target.y, target.z, ...))\nend\n\n-- Start continuous raycasting\n---@param depth number The raycast distance\n---@vararg any Additional arguments to pass to shape test\nfunction xLib.Raycast.Start(depth, ...)\n    local self = setmetatable({}, xLib.Raycast)\n\n    self.refreshRate = refreshRate\n    self.depth = depth\n    self.args = {...}\n\n    self.active = true\n\n    self._thread = CreateThread(function()\n        while self.active do\n            local target, hit, coords, normal, material, entity = xLib.Raycast.FromScreen(self.depth, unpack(self.args))\n            self.result = {\n                hit = hit,\n                coords = coords,\n                normal = normal,\n                material = material,\n                entity = entity,\n            }\n            Wait(1)\n        end\n    end)\n\n    return self\nend\n\n-- Stop raycasting\nfunction xLib.Raycast:Stop()\n    if not self and not self.active then return end\n    self.active = false\n    if self._thread then\n        self._thread = nil\n    end\nend\n\n-- Check if the raycating is active\n---@return boolean\nfunction xLib.Raycast:IsActive()\n    if not self and not self.active then return end\n    return self.active\nend\n\nreturn xLib.Raycast\n",
        "imports/scaleform/client.lua": '---@class scaleformlib\nxLib.scaleform = {}\nxLib.scaleform.utils = {}\n\n---@param title string\n---@param msg string\n---@param sec number\nfunction xLib.scaleform.showFreemodeMessage(title, msg, sec)\n    local scaleform = xLib.scaleform.utils.runMethod("MP_BIG_MESSAGE_FREEMODE", "SHOW_SHARD_WASTED_MP_MESSAGE", false, title, msg)\n\n    local endTime = GetGameTimer() + (sec * 1000)\n    while GetGameTimer() < endTime do\n        Wait(0)\n        DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0)\n    end\n\n    SetScaleformMovieAsNoLongerNeeded(scaleform)\nend\n\n---@param title string\n---@param msg string\n---@param bottom string\n---@param sec number\nfunction xLib.scaleform.showBreakingNews(title, msg, bottom, sec)\n    local scaleform = xLib.scaleform.utils.runMethod("BREAKING_NEWS", "SET_TEXT", false, msg, bottom)\n    xLib.scaleform.utils.runMethod(scaleform, "SET_SCROLL_TEXT", false, 0, 0, title)\n    xLib.scaleform.utils.runMethod(scaleform, "DISPLAY_SCROLL_TEXT", false, 0, 0)\n\n    local endTime = GetGameTimer() + (sec * 1000)\n    while GetGameTimer() < endTime do\n        Wait(0)\n        DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0)\n    end\n\n    SetScaleformMovieAsNoLongerNeeded(scaleform)\nend\n\n---@param title string\n---@param msg string\n---@param bottom string\n---@param sec number\nfunction xLib.scaleform.showPopupWarning(title, msg, bottom, sec)\n    local scaleform = xLib.scaleform.utils.runMethod("POPUP_WARNING", "SHOW_POPUP_WARNING", false, 500.0, title, msg, bottom, true)\n\n    local endTime = GetGameTimer() + (sec * 1000)\n    while GetGameTimer() < endTime do\n        Wait(0)\n        DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0)\n    end\n\n    SetScaleformMovieAsNoLongerNeeded(scaleform)\nend\n\n---@param sec number\nfunction xLib.scaleform.showTrafficMovie(sec)\n    local scaleform = xLib.scaleform.utils.runMethod("TRAFFIC_CAM", "PLAY_CAM_MOVIE", false)\n\n    local endTime = GetGameTimer() + (sec * 1000)\n    while GetGameTimer() < endTime do\n        Wait(0)\n        DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0)\n    end\n\n    SetScaleformMovieAsNoLongerNeeded(scaleform)\nend\n\n---@param movie string\n---@return number\nfunction xLib.scaleform.utils.requestScaleformMovie(movie)\n    local scaleform = RequestScaleformMovie(movie)\n\n    while not HasScaleformMovieLoaded(scaleform) do\n        Wait(0)\n    end\n\n    return scaleform\nend\n\n--- Executes a method on a scaleform movie with optional arguments and return value.\n--- The caller is responsible for disposing of the scaleform using `SetScaleformMovieAsNoLongerNeeded`.\n---@param scaleform number|string # Scaleform handle or name to request the scaleform movie\n---@param methodName string # The method name to call on the scaleform\n---@param returnValue? boolean # Whether to return the value from the method\n---@param ... number|string|boolean # Arguments to pass to the method\n---@return number, number? # The scaleform handle, and the return value if `returnValue` is true\nfunction xLib.scaleform.utils.runMethod(scaleform, methodName, returnValue, ...)\n    if type(scaleform) ~= "number" then\n        scaleform = xLib.scaleform.utils.requestScaleformMovie(scaleform)\n    end\n\n    BeginScaleformMovieMethod(scaleform, methodName)\n\n    local args = { ... }\n    for _, arg in ipairs(args) do\n        local typeArg = type(arg)\n\n        if typeArg == "number" then\n            if math.type(arg) == "float" then\n                ScaleformMovieMethodAddParamFloat(arg)\n            else\n                ScaleformMovieMethodAddParamInt(arg)\n            end\n        elseif typeArg == "string" then\n            ScaleformMovieMethodAddParamTextureNameString(arg)\n        elseif typeArg == "boolean" then\n            ScaleformMovieMethodAddParamBool(arg)\n        end\n    end\n\n    if returnValue then\n        return scaleform, EndScaleformMovieMethodReturnValue()\n    end\n\n    EndScaleformMovieMethod()\n\n    return scaleform\nend\n\nreturn xLib.scaleform\n',
        "imports/streaming/client.lua": '---@class streaminglib\nxLib.streaming = {}\n\n---@param modelHash number | string\n---@param cb? function\n---@return number | nil\nxLib.streaming.requestModel = function(modelHash, cb)\n    modelHash = type(modelHash) == "number" and modelHash or joaat(modelHash)\n\n    if not IsModelInCdimage(modelHash) then return end\n\n	RequestModel(modelHash)\n	while not HasModelLoaded(modelHash) do Wait(500) end\n\n	return cb and cb(modelHash) or modelHash\nend\n\n---@param textureDict string\n---@param cb? function\n---@return string | nil\nxLib.streaming.requestStreamedTextureDict = function(textureDict, cb)\n	RequestStreamedTextureDict(textureDict, false)\n\n	while not HasStreamedTextureDictLoaded(textureDict) do Wait(500) end\n\n	return cb and cb(textureDict) or textureDict\nend\n\n---@param assetName string\n---@param cb? function\n---@return string | nil\nxLib.streaming.requestNamedPtfxAsset = function(assetName, cb)\n	RequestNamedPtfxAsset(assetName)\n\n	while not HasNamedPtfxAssetLoaded(assetName) do Wait(500) end\n\n	return cb and cb(assetName) or assetName\nend\n\n---@param animSet string\n---@param cb? function\n---@return string | nil\nxLib.streaming.requestAnimSet = function(animSet, cb)\n	RequestAnimSet(animSet)\n\n	while not HasAnimSetLoaded(animSet) do Wait(500) end\n\n	return cb and cb(animSet) or animSet\nend\n\n---@param animDict string\n---@param cb? function\n---@return string | nil\nxLib.streaming.requestAnimDict = function(animDict, cb)\n	RequestAnimDict(animDict)\n\n	while not HasAnimDictLoaded(animDict) do Wait(500) end\n\n	return cb and cb(animDict) or animDict\nend\n\n---@param weaponHash number | string\n---@param cb? function\n---@return string | number | nil\nxLib.streaming.requestWeaponAsset = function(weaponHash, cb)\n	RequestWeaponAsset(weaponHash, 31, 0)\n\n	while not HasWeaponAssetLoaded(weaponHash) do Wait(500) end\n\n	return cb and cb(weaponHash) or weaponHash\nend\n\n---@param bankName string\n---@param cb? function\n---@return string | nil\nxLib.streaming.requestAudioBank = function(bankName, cb)\n    RequestAudioBank(bankName, false) \n\n    while not RequestScriptAudioBank(bankName, false) do Wait(500) end\n\n    return cb and cb(bankName) or bankName\nend\n\n\nreturn xLib.streaming\n',
        "imports/class/shared.lua": "---@class xClass \n---@field new function\n---@field constructor function?\n\n---Create or register a class\n---@param copy? table\n---@return table\nfunction xLib.class(copy)\n    xLib.verify(copy, { 'table', 'nil' }, true)\n\n    local class = copy and xLib.table.deepcopy(copy) or {}\n\n    class.__index = class\n    class._isClass = true\n\n    setmetatable(class, {\n        __newindex = function (_, k,v)\n            rawset(class, k, v)\n        end\n    })\n\n    function class:new(...)\n        local obj = setmetatable({}, class)\n\n        if xLib.verify(obj.constructor, 'function') then\n            obj:constructor(...)\n        end\n\n        return obj\n    end\n\n    return class\nend\n\nreturn xLib.class",
        "imports/isEnhanced/shared.lua": 'local ENHANCED_GAME_NAMES <const> = {\n    ["gta5enhanced"] = true,\n    ["gta5_enhanced"] = true\n}\n\nlocal isEnhanced\n\nif IsDuplicityVersion() then\n    isEnhanced = ENHANCED_GAME_NAMES[GetConvar("gamename", "gta5")] == true\nelse\n    isEnhanced = type(IsGameEnhancedVersion) == "function" and IsGameEnhancedVersion() == true\nend\n\n---@return boolean\nreturn function()\n    return isEnhanced\nend\n',
        "imports/math/shared.lua": `xLib.math = {}

local math_max = math.max
local math_min = math.min
local math_floor = math.floor
local math_ceil = math.ceil
local math_asin = math.asin
local math_atan = math.atan 
local math_pi = math.pi
local string_format = string.format
local SCALAR_PATTERN = "[-%d%.]+"

-- Utility function to validate and convert to number
local function toNumber(val, context)
    local num = tonumber(val)
    if not num then
        error(("Invalid numeric input: %s in %s"):format(tostring(val), context or "operation"), 2)
    end
    return num
end

--- Clamps a value between optional min and max bounds.
--- @param value number The value to clamp
--- @param min number|nil Minimum bound
--- @param max number|nil Maximum bound
--- @return number The clamped value
function xLib.math.clamp(value, min, max)
    value = toNumber(value, "clamp")
    if min and max then
        min, max = toNumber(min), toNumber(max)
        if min > max then min, max = max, min end
        return math_max(min, math_min(max, value))
    elseif min then
        return math_max(toNumber(min), value)
    elseif max then
        return math_min(toNumber(max), value)
    end
    return value
end

--- Converts input to number.
--- @param value any Input value
--- @param min number|nil Minimum bound
--- @param max number|nil Maximum bound
--- @param round boolean|nil Round to nearest integer
--- @return number
function xLib.math.toNumber(value, min, max, round)
    local num = toNumber(value, "toNumber")
    
    if round then
        num = num >= 0 and math_floor(num + 0.5) or math_ceil(num - 0.5)
    end
    
    return xLib.math.clamp(num, min, max)
end

--- Converts input string to multiple numbers.
--- @param input string|number Input string or number (e.g., "1,2,3" or 1)
--- @param min number|nil Minimum bound
--- @param max number|nil Maximum bound
--- @param round boolean|nil Round to nearest integer
--- @return number ... Unpacked numbers
function xLib.math.toScalars(input, min, max, round)
    local results = {}
    for val in tostring(input):gmatch(SCALAR_PATTERN) do
        results[#results + 1] = xLib.math.toNumber(val, min, max, round)
    end
    return table.unpack(results)
end

--- Converts input to a vector (table).
--- @param input string|number|table Input value
--- @param min number|nil Minimum bound
--- @param max number|nil Maximum bound
--- @param round boolean|nil Round to nearest integer
--- @return table Vector table
function xLib.math.toVector(input, min, max, round)
    xLib.verify(input, { 'table', 'string', 'number' }, true)

    local results = {}
    local inputType = type(input)

    if inputType == "table" then
        for _, val in ipairs(input) do
            results[#results + 1] = xLib.math.toNumber(val, min, max, round)
        end
    else
        for val in tostring(input):gmatch(SCALAR_PATTERN) do
            results[#results + 1] = xLib.math.toNumber(val, min, max, round)
        end
    end

    return results
end

--- Converts a surface normal to a rotation vector (pitch, yaw, roll).
--- @param normal table {x, y, z} Normal vector components
--- @return table {pitch, yaw, roll} Rotation in degrees
function xLib.math.normalToRotation(normal)
    xLib.verify(normal, 'table', true)
    local x, y, z = toNumber(normal.x, "normalToRotation"), toNumber(normal.y, "normalToRotation"), toNumber(normal.z, "normalToRotation")
    local pitch = math_asin(-z) * (180 / math_pi)
    local yaw = math_atan(y, x) * (180 / math_pi) 
    return { pitch = pitch, yaw = yaw, roll = 0 }
end

--- Converts input to RGBA values (0-255, rounded).
--- @param input string|number|table Input value
--- @return table|number RGBA table or single number
function xLib.math.toRGBA(input)
    return xLib.math.toVector(input, 0, 255, true)
end

--- Converts hex color string to normalized RGBA (0-1).
--- @param hex string Hex color (e.g., "#FF0000" or "#FF0000FF")
--- @return number r Red (0-1)
--- @return number g Green (0-1)
--- @return number b Blue (0-1)
--- @return number a Alpha (0-1)
function xLib.math.hexToRGBA(hex)
    hex = hex:gsub("#", "")
    local len = #hex
    if len ~= 6 and len ~= 8 then
        error(("Invalid hex color format: %s"):format(hex), 2)
    end

    local r = toNumber("0x" .. hex:sub(1, 2), "hexToRGBA") / 255
    local g = toNumber("0x" .. hex:sub(3, 4), "hexToRGBA") / 255
    local b = toNumber("0x" .. hex:sub(5, 6), "hexToRGBA") / 255
    local a = len == 8 and toNumber("0x" .. hex:sub(7, 8), "hexToRGBA") / 255 or 1
    return r, g, b, a
end

--- Converts RGBA (0-1) to hex color string.
--- @param r number Red (0-1)
--- @param g number Green (0-1)
--- @param b number Blue (0-1)
--- @param a number|nil Alpha (0-1)
--- @return string Hex color string
function xLib.math.toHex(r, g, b, a)
    r = xLib.math.clamp(math_floor(toNumber(r, "toHex") * 255), 0, 255)
    g = xLib.math.clamp(math_floor(toNumber(g, "toHex") * 255), 0, 255)
    b = xLib.math.clamp(math_floor(toNumber(b, "toHex") * 255), 0, 255)
    if a then
        a = xLib.math.clamp(math_floor(toNumber(a, "toHex") * 255), 0, 255)
        return string_format("#%02X%02X%02X%02X", r, g, b, a)
    end
    return string_format("#%02X%02X%02X", r, g, b)
end

--- Formats a number with grouped digits.
--- @param number number Number to format
--- @param separator string|nil Separator (default: ",")
--- @return string Formatted string
function xLib.math.groupDigits(number, separator)
    separator = separator or ","
    local formatted = tostring(toNumber(number, "groupDigits"))
    local k
    while true do
        formatted, k = formatted:gsub("^(-?%d+)(%d%d%d)", "%1" .. separator .. "%2")
        if k == 0 then break end
    end
    return formatted
end

--- Rounds a number to specified decimal places.
--- @param num number Number to round
--- @param decimalPlaces number|nil Decimal places (default: 0)
--- @return number Rounded number
function xLib.math.round(num, decimalPlaces)
    local num = toNumber(num, "round")
    local mult = 10^(decimalPlaces or 0)
    if num < 0 then
        return math_ceil(num * mult - 0.5) / mult
    end
    return math_floor(num * mult + 0.5) / mult
end

--- Linearly interpolates between two values.
--- @param start number Start value
--- @param goal number End value
--- @param percent number Interpolation factor (0-1)
--- @return number Interpolated value
function xLib.math.interpolate(start, goal, percent)
    start, goal, percent = toNumber(start, "interpolate"), toNumber(goal, "interpolate"), xLib.math.clamp(toNumber(percent, "interpolate"), 0, 1)
    return start + (goal - start) * percent
end


--- Performs linear interpolation between two values based on t (0-1).
--- @param a number Start value
--- @param b number End value
--- @param t number Interpolation factor (0-1)
--- @return number Interpolated value
function xLib.math.lerp(a, b, t)
    return a + (b - a) * xLib.math.clamp(t, 0, 1)
end

--- Calculates the inverse linear interpolation factor of a value between a and b.
--- @param a number Start value
--- @param b number End value
--- @param value number Value to evaluate
--- @return number Interpolation factor (0-1)
function xLib.math.inverseLerp(a, b, value)
    return (value - a) / (b - a)
end

--- Remaps a value from one range to another.
--- @param value number Value to remap
--- @param inMin number Input range minimum
--- @param inMax number Input range maximum
--- @param outMin number Output range minimum
--- @param outMax number Output range maximum
--- @return number Remapped value
function xLib.math.remap(value, inMin, inMax, outMin, outMax)
    local t = xLib.math.inverseLerp(inMin, inMax, value)
    return xLib.math.lerp(outMin, outMax, t)
end

-- Rounds a number to the nearest integer or specified decimal places.
---@param value number
---@param numDecimalPlaces? number
---@return number
function xLib.math.Round(value, numDecimalPlaces)
    xLib.verify(value, 'number', true)
    if numDecimalPlaces then
        xLib.verify(numDecimalPlaces, 'number', true)
        local power = 10 ^ numDecimalPlaces
        return math.floor((value * power) + 0.5) / power
    else
        return math.floor(value + 0.5)
    end
end

-- credit http://richard.warburton.it
---@param value number
---@return string
function xLib.math.GroupDigits(value)
    xLib.verify(value, { 'string', 'number' }, true)
    local left, num, right = string.match(tostring(value), "^([^%d]*%d)(%d*)(.-)$")

    return left .. (num:reverse():gsub("(%d%d%d)", "%1" .. TranslateCap("locale_digit_grouping_symbol")):reverse()) .. right
end

---@param value string | number
---@return string | nil
function xLib.math.Trim(value)
    value = tostring(value)
    return (string.gsub(value, "^%s*(.-)%s*$", "%1"))
end

---@param minRange number
---@param maxRange number
---@return number
function xLib.math.Random(minRange, maxRange)
    math.randomseed(GetGameTimer())
    return math.random(minRange or 1, maxRange or 10)
end

---@param origin vector
---@param target vector
---@return number
function xLib.math.GetHeadingFromCoords(origin, target)
    xLib.verify(origin, 'table', true)
    xLib.verify(target, 'table', true)
    local dx = origin.x - target.x
    local dy = origin.y - target.y

    local heading = math.deg(math.atan(dy, dx)) + 90

    return (heading + 360) % 360
end

return xLib.math`,
        "imports/overload/shared.lua": "local overloads <const> = {}\n\n---@param name string\n---@param ... unknown\nlocal function getOverloadFunction(name, ...) \n    local params = {...}\n    local params_count = #params\n    local is_valid, overload, correct_type\n\n\n    for i=1, #overloads[name] do\n        overload = overloads[name][i]\n\n        if not overload then\n            goto continue\n        end\n\n        is_valid = #overload.valid_types == params_count\n\n        if is_valid then\n            for j = 1, #overload.valid_types do\n                correct_type = overload.valid_types[j]\n                if not xLib.verify(params[j], correct_type) then\n                    is_valid = false\n                    break\n                end\n            end\n\n            if is_valid then\n                return overload.cb(...)\n            end\n        end\n\n        ::continue::\n    end\n\n    error('[xLib] Couldn\\'t find a correct method to overload')\nend\n\n---Overloads a function\n---@param name string\n---@param valid_types CustomType | CustomType[]\n---@param cb function\n---@param obj? table\nfunction xLib.overload(name, valid_types, cb, obj)\n    xLib.verify(name, {'string'}, true)\n\n    if not overloads[name] then\n        overloads[name] = {}\n    end\n    \n    overloads[name][#overloads[name] + 1] = {\n        valid_types = valid_types,\n        cb = cb\n    }\n\n    local env = obj and obj or _ENV\n\n    if not env[name] then\n        env[name] = function(...)\n            return getOverloadFunction(name, ...)\n        end\n    end\nend\n\nreturn xLib.overload",
        "imports/require/shared.lua": `--!DISCLAIMER
--[[
    https://github.com/overextended/ox_lib

    This file is licensed under LGPL-3.0 or higher <https://www.gnu.org/licenses/lgpl-3.0.en.html>

    Copyright \xA9 2025 Linden <https://github.com/thelindat>
]]

local LOADED <const> = {}
local TEMP_DATA <const> = {}

local _require = require --original lua function

package = {
    path = './?.lua;./?/init.lua',
    preload = {},
    loaded = setmetatable({}, {
        __index = LOADED,
        __newindex = Noop,
        __metatable = false,
    })
}

---Gets the resource name and the module's relative path
---@param name string -- module name
---@return string, string
local function getModuleInfo(name)
    local resource = name:match('^@(.-)/.+') -- if name is for example @esx_lib/imports/require/initl.lua it will capture ESX_LIB

    if resource then
        return resource, name:sub(#resource + 3) -- returns the path without script name
    end

    local idx = 4-- call stack depth (kept slightly lower than expected depth "just in case")
    --- When indexing source of 4 it returns @@esx_lib/imports/require
    --- When indexing source of 5 it returns for example @@esx_test/client.lua
    --- Used for identifing resource name.

    while true do
        local src = debug.getinfo(idx, 'S')?.source

        if not src then
            error(('Couldn\\'t find a source for "%s"'):format(name))
        end

        resource = src:match('^@@([^/]+)/.+') -- returns resource name

        if resource and not src:find('^@@esx_lib/imports/require') then
            return resource, name
        end

        idx += 1
    end
end

---Searcher for a accessable path
---@param name string
---@param path string
---@return string?, string? -- filename, error message
---@diagnostic disable-next-line: duplicate-set-field
function package.searchpath(name, path)
    local resource, module_name = getModuleInfo(name:gsub('%.', '/'))

    local tried <const> = {}

    for template in path:gmatch('[^;]+') do
        local file_name = template:gsub('^%./', ''):gsub('?', module_name:gsub('%.', '/') or module_name)

        local file = LoadResourceFile(resource, file_name)

        if file then
            TEMP_DATA[1] = file
            TEMP_DATA[2] = resource

            return file_name
        end

        tried[#tried+1] = ('no file "@%s/%s"'):format(resource, file_name)
    end

    return nil, table.concat(tried, '\\n\\t')
end

---Loads module
---@param name string
---@param env? unknown
---@return function?, string?
local function loadModule(name, env)
    local file_name, err = package.searchpath(name, package.path)
    
    if file_name then
        local file = TEMP_DATA[1]
        local resource = TEMP_DATA[2]

        table.wipe(TEMP_DATA)

        return assert(load(file, ('@@%s/%s'):format(resource, file_name), 't', env or _ENV))
    end

    return nil, err or 'unknown error'
end

---@diagnostic disable-next-line: duplicate-doc-alias
---@alias PackageSearcher
---| fun(name: string): function loader
---| fun(name: string): nil|false , string error message
---| fun(name: string): function?, string?

---@type PackageSearcher[]
package.searchers = {
    function (name)
        local ok, result = pcall(_require, name)

        if ok then
            return result
        end

        return ok, result
    end,
    function (name)
        if package.preload[name] ~= nil then
            return package.preload[name]
        end

        return nil, ('no field package.preload["%s"]'):format(name)
    end,
    function(name)
        return loadModule(name)
    end,
}

---Loads and runs a Lua file at the given path. Unlike require, the chunk is not cached for future use.
---@param file_path string
---@param env? unknown
function xLib.load(file_path, env)
    xLib.verify(file_path, 'string', true)

    local result, err = loadModule(file_path, env)

    if result then
        return result()
    end

    error(('file "%s" not found\\n\\t%s'):format(file_path, err))
end

---Loads and decodes a json file at the given path.
---@param file_path string
function xLib.loadJson(file_path)
    xLib.verify(file_path, 'string', true)

    local res_source, mod_path = getModuleInfo(file_path:gsub('%.', '/'))

    local res_file  = LoadResourceFile(res_source, ('%s.json'):format(mod_path))

    if res_file then
        return json.decode(res_file)
    end

    error(('json file "%s" not found\\n\\tno file "%s/%s.json"'):format(file_path, res_source, mod_path))
end

---Loads the given module, returns any value returned by the seacher (\`true\` when \`nil\`).\\
---Passing \`@resourceName.modName\` loads a module from a remote resource.
---@param name string
---@return unknown
function xLib.require(name)
    xLib.verify(name, 'string', true)

    local module = LOADED[name]

    if module == 'loading' then
        error(('^1circular-dependency occurred when loading module "%s"^0'):format(name))
    end

    if module ~= nil then return module end

    LOADED[name] = 'loading'

    local err = {}

    for i = 1, #package.searchers do
        local result, err_msg = package.searchers[i](name)

        if result then
            if type(result) == 'function' then result = result() end
            LOADED[name] = result or result == nil

            return LOADED[name]
        end


        err[#err + 1] = err_msg
    end

    error(('%s'):format(table.concat(err, '\\n\\t')))
end

return xLib.require
`,
        "imports/string/shared.lua": `---@class stringlib
xLib.string = string

--- Normalize (trim + lowercase)
---@param s string
---@return string
function xLib.string.normalize(s)
    xLib.verify(s, 'string', true)

    local res = s:match("^%s*(.-)%s*$"):lower()

    return res
end

---@param s string
---@return string
function xLib.string.capitalize(s)
    xLib.verify(s, 'string', true)

    local res = s:gsub("^%l", string.upper)

    return res
end

---@param s string
---@return string
function xLib.string.toSnake(s)
    xLib.verify(s, 'string', true)

    local res = s:gsub("%s+", "_"):gsub("([a-z%d])([A-Z])", "%1_%2"):lower()

    return res
end

---@param s string
---@return string
function xLib.string.toCamel(s)
    xLib.verify(s, 'string', true)

    local res = s:lower():gsub("_%a", function(w) return w:sub(2):upper() end)

    return res
end

---@param s string
---@return string
function xLib.string.toPascal(s)
    xLib.verify(s, 'string', true)

    local res = s:gsub("(%a)([%w]*)", function(first, rest)
        return first:upper() .. rest:lower()
    end):gsub("_", "")

    return res
end

---@param s string
---@return string
function xLib.string.escapePattern(s)
    xLib.verify(s, 'string', true)

    local res = s:gsub("([%%%^%$%(%)%.%[%]%*%+%-%?])", "%%%1")

    return res
end

---@param s string
---@param pattern string
---@return boolean
function xLib.string.matchSafe(s, pattern)
    local ok, result = pcall(string.match, s, pattern)
    return ok and result ~= nil
end

---@param s string
---@param pattern string
---@return string
function xLib.string.before(s, pattern)
    xLib.verify(s, 'string', true)
    local start = s:find(pattern, 1, true)

    if not start then return s end

    return s:sub(1, start - 1)
end

---@param s string
---@param pattern string
---@return string
function xLib.string.after(s, pattern)
    xLib.verify(s, 'string', true)

    local _, finish = s:find(pattern, 1, true)

    if not finish then return s end

    return s:sub(finish + 1)
end


---@param s string
---@param substr string
---@return boolean
function xLib.string.contains(s, substr)
    xLib.verify(s, 'string', true)

    return s:find(substr, 1, true) ~= nil
end

---@param s string
---@param old string
---@param new string
---@return string
function xLib.string.replace(s, old, new)
    xLib.verify(s, 'string', true)

    if type(new) == "string" then
        new = new:gsub("%%", "%%%%")
    end

    local result = s:gsub(xLib.string.escapePattern(old), new)

    return result
end


---@param length number
---@return string
function xLib.string.randomHex(length)
    local t = {}

    for _ = 1, length do
        t[#t + 1] = string.format("%x", math.random(0, 15))
    end

    return table.concat(t)
end

---@return string
function xLib.string.uuid()
    local template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"

    local uuid = template:gsub("[xy]", function(c)
        local v = (c == "x") and math.random(0, 15) or math.random(8, 11)
        return string.format("%x", v)
    end)

    return uuid
end

return xLib.string
`,
        "imports/table/shared.lua": `---@class xtable : tablelib
xLib.table = setmetatable({}, { __index = table })

---@param tbl table
---@return boolean
function xLib.table.isArray(tbl)
    xLib.verify(tbl, "table", true)

    local count, maxIndex = 0, 0

    for k, _ in pairs(tbl) do
        if type(k) ~= "number" or k < 1 or k % 1 ~= 0 then
            return false
        end

        count, maxIndex = count + 1, math.max(maxIndex, k)
    end

    return count == maxIndex
end

---@param tbl table
---@param item any
---@return any
function xLib.table.searchForKey(tbl, item)
    xLib.verify(tbl, "table", true)

    for k, v in pairs(tbl) do
        if v == item then
            return k
        end
    end

    return nil
end

---@param tbl table
---@param filter fun(value:any, key:any):boolean
---@return table
function xLib.table.filter(tbl, filter)
    xLib.verify(tbl, "table", true)
    xLib.verify(filter, "function", true)

    local result = {}

    for k, v in pairs(tbl) do
        if filter(v, k) then
            result[k] = v
        end
    end

    return result
end

---@param tbl table
---@param copies? table
---@return table
function xLib.table.deepcopy(tbl, copies)
    xLib.verify(tbl, "table", true)

    copies = copies or {}

    if copies[tbl] then
        return copies[tbl]
    end

    local copy = {}
    copies[tbl] = copy

    for k, v in pairs(tbl) do
        copy[k] = type(v) == "table" and xLib.table.deepcopy(v, copies) or v

        if type(v) == "table" and getmetatable(v) then
            setmetatable(copy[k], getmetatable(v))
        end
    end

    return copy
end

--- https://github.com/overextended/ox_lib/blob/master/imports/table/shared.lua
---@param t1 table
---@param t2 table
---@param addDuplicateNumbers boolean
---@return table
function xLib.table.merge(t1, t2, addDuplicateNumbers)
    xLib.verify(t1, "table", true)
    xLib.verify(t2, "table", true)
    xLib.verify(addDuplicateNumbers, "boolean", true)

    addDuplicateNumbers = addDuplicateNumbers == nil or addDuplicateNumbers
    for k, v2 in pairs(t2) do
        local v1 = t1[k]
        local type1 = type(v1)
        local type2 = type(v2)

        if type1 == 'table' and type2 == 'table' then
            xLib.table.merge(v1, v2, addDuplicateNumbers)
        elseif addDuplicateNumbers and (type1 == 'number' and type2 == 'number') then
            t1[k] = v1 + v2
        else
            t1[k] = v2
        end
    end

    return t1
end

function xLib.table.dump(tbl)
    if xLib.verify(tbl, 'table') then
        local s = '{ '
        for k,v in pairs(tbl) do
           if type(k) ~= 'number' then k = '"'..k..'"' end
           s = s .. '['..k..'] = ' .. xLib.table.dump(v) .. ','
        end
        return s .. '} '
     else
        return tostring(tbl)
     end
end

-- nil proof alternative to #table
---@param t table
---@return number
function xLib.table.sizeOf(t)
    local count = 0

    for _, _ in pairs(t) do
        count = count + 1
    end

    return count
end

---@param t table
---@return table
function xLib.table.set(t)
    local set = {}
    for _, v in ipairs(t) do
        set[v] = true
    end
    return set
end

---@param t table
---@param value any
---@return number
function xLib.table.indexOf(t, value)
    for i = 1, #t, 1 do
        if t[i] == value then
            return i
        end
    end

    return -1
end

---@param t table
---@param value any
---@return number
function xLib.table.lastIndexOf(t, value)
    for i = #t, 1, -1 do
        if t[i] == value then
            return i
        end
    end

    return -1
end

---@param t table
---@param cb function
---@return any
function xLib.table.find(t, cb)
    for i = 1, #t, 1 do
        if cb(t[i]) then
            return t[i]
        end
    end

    return nil
end

---@param t table
---@param cb function
---@return number
function xLib.table.findIndex(t, cb)
    for i = 1, #t, 1 do
        if cb(t[i]) then
            return i
        end
    end

    return -1
end

---@param t table
---@param cb function
---@return table
function xLib.table.map(t, cb)
    local newTable = {}

    for i = 1, #t, 1 do
        newTable[i] = cb(t[i], i)
    end

    return newTable
end

---@param t table
---@return table
function xLib.table.reverse(t)
    local newTable = {}

    for i = #t, 1, -1 do
        table.insert(newTable, t[i])
    end

    return newTable
end

---@param t table
---@return table
function xLib.table.clone(t)
    if type(t) ~= "table" then
        return t
    end

    local meta = getmetatable(t)
    local target = {}

    for k, v in pairs(t) do
        if type(v) == "table" then
            target[k] = xLib.table.clone(v)
        else
            target[k] = v
        end
    end

    setmetatable(target, meta)

    return target
end

---@param t1 table
---@param t2 table
---@return table
function xLib.table.concat(t1, t2)
    local t3 = xLib.table.clone(t1)

    for i = 1, #t2, 1 do
        table.insert(t3, t2[i])
    end

    return t3
end

---@param t table
---@param sep string
---@return string
function xLib.table.join(t, sep)
    local str = ""

    for i = 1, #t, 1 do
        if i > 1 then
            str = str .. (sep or ",")
        end

        str = str .. t[i]
    end

    return str
end

-- Credits: https://github.com/JonasDev99/qb-garages/blob/b0335d67cb72a6b9ac60f62a87fb3946f5c2f33d/server/main.lua#L5
---@param tab table
---@param val any
---@return boolean
function xLib.table.contains(tab, val)
    if type(val) == "table" then
        for _, value in pairs(tab) do
            if xLib.table.contains(val, value) then
                return true
            end
        end
        return false
    else
        for _, value in pairs(tab) do
            if value == val then
                return true
            end
        end
    end
    return false
end

-- Credit: https://stackoverflow.com/a/15706820
-- Description: sort function for pairs
---@param t table
---@param order function
---@return function
function xLib.table.sort(t, order)
    -- collect the keys
    local keys = {}

    for k, _ in pairs(t) do
        keys[#keys + 1] = k
    end

    -- if order function given, sort by it by passing the table and keys a, b,
    -- otherwise just sort the keys
    if order then
        table.sort(keys, function(a, b)
            return order(t, a, b)
        end)
    else
        table.sort(keys)
    end

    -- return the iterator function
    local i = 0

    return function()
        i = i + 1
        if keys[i] then
            return keys[i], t[keys[i]]
        end
    end
end

---@param t table
---@return Array
function xLib.table.toArray(t)
    local array = {}
    for _, v in pairs(t) do
        array[#array + 1] = v
    end
    return array
end

---@param t table
---@return table
function xLib.table.wipe(t)
    return table.wipe(t)
end


return xLib.table
`,
        "imports/timeout/shared.lua": 'xLib.timeout = {}\n\nlocal TimeoutCount = 0\nlocal CancelledTimeouts = {}\n\n---@param msec number\n---@param cb function\n---@return number\nxLib.timeout.setTimeout = function(msec, cb)\n    xLib.verify(cb, "function", true)\n    \n    local id <const> = TimeoutCount + 1\n\n    SetTimeout(msec, function()\n        if CancelledTimeouts[id] then\n            CancelledTimeouts[id] = nil\n            return\n        end\n        cb()\n    end)\n\n    TimeoutCount = id\n\n    return id\nend\n\n---@param id number\n---@return nil\nxLib.timeout.clearTimeout = function(id)\n    CancelledTimeouts[id] = true\nend\n\nreturn xLib.timeout\n',
        "imports/verify/shared.lua": `---@alias CustomType 'number' | 'boolean' | 'function' | 'table' | 'string' | 'nil' | 'array' | 'int' | 'uint' | 'float' |  'char' | 'vector3' | 'vector4' | 'ped' | 'playerId' | 'vehicle' | 'prop' | 'class' | 'model'

---Checks if value is an array
---@param value any
---@return boolean
local function isArray(value)
    if type(value) ~= 'table' then
        return false
    end

    local i = 0
    
    for _ in pairs(value) do
        i = i + 1
        if value[i] == nil then
            return false
        end
    end

    return true
end

---Checks if player id is correct.
---@param value any
---@return boolean
local function isPlayerId(value)
    if type(value) ~= 'number' then
        return false
    end

    if xLib.side == 'server' then
        return GetPlayerName(value) ~= nil
    else
        return NetworkIsPlayerActive(value)
    end
end

---Checks if function is callable.
---@param value any
---@return boolean
local function isCallable(value)
    local value_type = type(value)

    if value_type == 'function' then
        return true
    end
    
    if value_type == 'table' then
        local mt = getmetatable(value)

        if mt and mt.__call then
            return true
        end
    end
    
    return false
end

xLib.callback.register('xLib:validateModel', function(model)
    return IsModelValid(model)
end)

local function validateModel(model)
    local players = GetPlayers()
    local source = tonumber(players[math.random(1,#players)])

    return xLib.callback.await('xLib:validateModel', source, false, model)
end

---Make sure value is a valid type
---@param value any
---@param valid_type CustomType
---@return boolean
local function verifyType(value, valid_type)
    if valid_type == 'function' then
        return isCallable(value)
    elseif valid_type == 'array' then
        return isArray(value)
    elseif valid_type == 'int' then
        return math.type(value) == 'integer'
    elseif valid_type == 'float' then
        return math.type(value) == 'float'
    elseif valid_type == 'uint' then
        return math.type(value) == 'integer' and value >= 0
    elseif valid_type == 'char' then 
        return type(value) == 'string' and #value == 1
    elseif valid_type == 'ped' then 
        return GetEntityType(value) == 1
    elseif valid_type == 'vehicle' then 
        return GetEntityType(value) == 2
    elseif valid_type == 'prop' then 
        return GetEntityType(value) == 3
    elseif valid_type == 'playerId' then
        return isPlayerId(value)
    elseif valid_type == 'class' then
        if type(value) ~= 'table' then
            return false
        end

        return getmetatable(value)?._isClass == true
    elseif valid_type == 'model' then
        if xLib.side == "server" then 
            return validateModel(value)
        end

        return IsModelValid(value)
    end

    return type(value) == valid_type
end

---@class VerifyTable
---@field debug VerifyFunction

---@alias VerifyFunction fun(value: any, valid_types: CustomType[] | CustomType, throw_error?: boolean): boolean

---@type VerifyFunction | VerifyTable
xLib.verify = setmetatable({
    fn = function(value, valid_types, throw_error)
        local match = false

        if type(valid_types) == 'table' then
            for i = 1, #valid_types do
                if xLib.verify(value, valid_types[i]) then
                    match = true
                    break
                end
            end

            if throw_error and not match then
                error(('[xLib] Couldn\\'t match %s to types %s'):format(value, json.encode(valid_types)))
            else
                return match
            end
        end

        match = verifyType(value, valid_types)

        if throw_error and not match then
            error(('[xLib] Couldn\\'t match %s to type %s'):format(value, valid_types))
        else
            return match
        end
    end
}, {
    __index = function(self, k)
        if k == 'debug' and xLib.debug then
            return rawget(self, 'fn'
        )
        elseif k ~= 'debug' then
            return rawget(self, k)
        else 
            return Noop
        end
    end,
    __call = function(self, ...)
        return rawget(self, 'fn')(...)
    end
})

return xLib.verify
`,
        "imports/waitFor/shared.lua": "---Yields the current thread until the callback returns a non-nil value.\n---@generic T\n---@param cb fun(): T?\n---@param errMessage? string\n---@param timeout? number | false Error out after `~x` ms if the callback hasn't resolved. Defaults to 1000, unless set to `false`.\n---@param interval? integer Polling interval in ms. Defaults to 0. A value above `timeout` overshoots it by one cycle.\n---@return T\n---@async\nfunction xLib.waitFor(cb, errMessage, timeout, interval)\n    xLib.verify(cb, 'function', true)\n\n    if interval then\n        xLib.verify(interval, 'int', true)\n    end\n\n    local value = cb()\n\n    if value ~= nil then\n        return value\n    end\n\n    if timeout ~= false and type(timeout) ~= 'number' then\n        timeout = 5000\n    end\n\n    local start = timeout and GetGameTimer()\n\n    while value == nil do\n        Wait(interval or 0)\n\n        value = cb()\n\n        if value == nil and timeout then\n            local elapsed = GetGameTimer() - start\n\n            if elapsed > timeout then\n                return error(('%s (waited %.1fms)'):format(errMessage or 'failed to resolve callback', elapsed), 2)\n            end\n        end\n    end\n\n    return value\nend\n\nreturn xLib.waitFor\n",
        "html/medal.html": `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; connect-src http://localhost:12665 http://127.0.0.1:12665">
</head>
<body>
    <script src="medal.js"><\/script>
</body>
</html>
`,
        "html/medal.js": "window.addEventListener('message', function (event) {\n    var data = event.data;\n    if (!data || data.action !== 'medalClip') return;\n\n    fetch('http://localhost:12665/api/v1/event/invoke', {\n        method: 'POST',\n        headers: {\n            'publicKey': data.publicKey,\n            'Content-Type': 'application/json'\n        },\n        body: JSON.stringify(data.payload)\n    }).catch(function () {});\n});\n"
      }
    },
    {
      "name": "example-caller",
      "scripts": [],
      "uiPage": null,
      "files": [],
      "fileContents": {}
    },
    {
      "name": "example-hello",
      "scripts": [],
      "uiPage": null,
      "files": [],
      "fileContents": {}
    },
    {
      "name": "oxmysql",
      "scripts": [],
      "uiPage": null,
      "files": [
        "lib/MySQL.lua"
      ],
      "fileContents": {
        "lib/MySQL.lua": `local promise = promise
local Await = Citizen.Await
local resourceName = GetCurrentResourceName()
local GetResourceState = GetResourceState

local options = {
	return_callback_errors = false
}

for i = 1, GetNumResourceMetadata(resourceName, 'mysql_option') do
	local option = GetResourceMetadata(resourceName, 'mysql_option', i - 1)
	options[option] = true
end

local function await(fn, query, parameters)
	local p = promise.new()

	fn(nil, query, parameters, function(result, error)
		if error then
			return p:reject(error)
		end

		p:resolve(result)
	end, resourceName, true)

	return Await(p)
end

local type = type
local queryStore = {}

local function safeArgs(query, parameters, cb, transaction)
	local queryType = type(query)

	if queryType == 'number' then
		query = queryStore[query]
		assert(query, "First argument received invalid query store reference")
	elseif transaction then
		if queryType ~= 'table' then
			error(("First argument expected table, received '%s'"):format(query))
		end
	elseif queryType ~= 'string' then
		error(("First argument expected string, received '%s'"):format(query))
	end

	if parameters then
		local paramType = type(parameters)

		if paramType ~= 'table' and paramType ~= 'function' then
			error(("Second argument expected table or function, received '%s'"):format(parameters))
		end

		if paramType == 'function' or parameters.__cfx_functionReference then
			cb = parameters
			parameters = nil
		end
	end

	if cb and parameters then
		local cbType = type(cb)

		if cbType ~= 'function' and (cbType == 'table' and not cb.__cfx_functionReference) then
			error(("Third argument expected function, received '%s'"):format(cb))
		end
	end

	return query, parameters, cb
end

local oxmysql = exports.oxmysql

local mysql_method_mt = {
	__call = function(self, query, parameters, cb)
		query, parameters, cb = safeArgs(query, parameters, cb, self.method == 'transaction')
		return oxmysql[self.method](nil, query, parameters, cb, resourceName, options.return_callback_errors)
	end
}

local MySQL = setmetatable(MySQL or {}, {
	__index = function(_, index)
		return function(...)
			return oxmysql[index](nil, ...)
		end
	end
})

for _, method in pairs({
	'scalar', 'single', 'query', 'insert', 'update', 'prepare', 'transaction', 'rawExecute',
}) do
	MySQL[method] = setmetatable({
		method = method,
		await = function(query, parameters)
			query, parameters = safeArgs(query, parameters, nil, method == 'transaction')
			return await(oxmysql[method], query, parameters)
		end
	}, mysql_method_mt)
end

local alias = {
	fetchAll = 'query',
	fetchScalar = 'scalar',
	fetchSingle = 'single',
	insert = 'insert',
	execute = 'update',
	transaction = 'transaction',
	prepare = 'prepare'
}

local alias_mt = {
	__index = function(self, key)
		if alias[key] then
			local method = MySQL[alias[key]]
			MySQL.Async[key] = method
			MySQL.Sync[key] = method.await
			alias[key] = nil
			return self[key]
		end
	end
}

local function addStore(query, cb)
	assert(type(query) == 'string', 'The SQL Query must be a string')

	local storeN = #queryStore + 1
	queryStore[storeN] = query

	return cb and cb(storeN) or storeN
end

MySQL.Sync = setmetatable({ store = addStore }, alias_mt)
MySQL.Async = setmetatable({ store = addStore }, alias_mt)

local function onReady(cb)
	while GetResourceState('oxmysql') ~= 'started' do
		Wait(50)
	end

	oxmysql.awaitConnection()

	return cb and cb() or true
end

MySQL.ready = setmetatable({
	await = onReady
}, {
	__call = function(_, cb)
		Citizen.CreateThreadNow(function() onReady(cb) end)
	end,
})

function MySQL.startTransaction(cb)
	return oxmysql:startTransaction(cb, resourceName)
end

_ENV.MySQL = MySQL
`
      }
    },
    {
      "name": "skinchanger",
      "scripts": [
        {
          "path": "../es_extended/locale.lua",
          "source": 'Locales = {}\n\n--- English fallback for missing keys. locale.lua runs in every resource VM, so\n--- a resource may opt out through its own Config.LocaleFallback; otherwise the\n--- shared "esx:localeFallback" convar decides (enabled by default).\nlocal function localeFallbackEnabled()\n    if Config.LocaleFallback ~= nil then\n        return Config.LocaleFallback\n    end\n\n    return GetConvar("esx:localeFallback", "true") ~= "false"\nend\n\n--- Read and execute a locale file, returning its table or false if unreadable.\nlocal function readLocale(locale)\n    local success, result = pcall(function()\n        return assert(load(LoadResourceFile(GetCurrentResourceName(), ("locales/%s.lua"):format(locale))))()\n    end)\n\n    return success and result or false\nend\n\n--- Copy every key the target locale is missing from English into it once, warn\n--- about the gaps, then let the English table go. The locale ends up\n--- self-contained, so no per-call fallback and only one table stays in memory.\nlocal function backfillFromEnglish(locale, translations)\n    local english = readLocale("en")\n    if not english then\n        return\n    end\n\n    local missing = {}\n    for key, value in pairs(english) do\n        if translations[key] == nil then\n            translations[key] = value\n            missing[#missing + 1] = key\n        end\n    end\n\n    if #missing > 0 then\n        print(("[es_extended] locale [%s] is missing %d translation(s), falling back to English: %s")\n            :format(locale, #missing, table.concat(missing, ", ")))\n    end\nend\n\n--- Lazily load and cache a locale file, false if it cannot be read.\nlocal function loadLocale(locale)\n    if Locales[locale] == nil then\n        local translations = readLocale(locale)\n\n        if translations and locale ~= "en" and localeFallbackEnabled() then\n            backfillFromEnglish(locale, translations)\n        end\n\n        Locales[locale] = translations\n    end\n\n    return Locales[locale]\nend\n\nfunction Translate(str, ...) -- Translate string\n    if not str then\n        error(("Resource ^5%s^1 You did not specify a parameter for the Translate function or the value is nil!"):format(GetInvokingResource() or GetCurrentResourceName()))\n    end\n\n    local translations = loadLocale(Config.Locale)\n    if not translations then\n        if Config.Locale == "en" then\n            return "Locale [en] does not exist"\n        end\n\n        -- Fall back to English translation if the current locale is not found\n        Config.Locale = "en"\n        return Translate(str, ...)\n    end\n\n    if translations[str] then\n        return translations[str]:format(...)\n    end\n\n    return ("Translation [%s][%s] does not exist"):format(Config.Locale, str)\nend\n\nfunction TranslateCap(str, ...) -- Translate string first char uppercase\n    return (_(str, ...):gsub("^%l", string.upper))\nend\n\n_ = Translate\n-- luacheck: ignore _U\n_U = TranslateCap\n'
        },
        {
          "path": "locales/da.lua",
          "source": 'Locales["da"] = {\n    ["sex"] = "k\xF8n",\n    ["mom"] = "mors ansigt",\n    ["dad"] = "fars ansigt",\n    ["resemblance"] = "lighed",\n    ["skin_tone"] = "hudfarve",\n    ["nose_1"] = "n\xE6se bredde",\n    ["nose_2"] = "n\xE6sespidsh\xF8jde",\n    ["nose_3"] = "n\xE6sespidsl\xE6ngde",\n    ["nose_4"] = "n\xE6seknogleh\xF8jde",\n    ["nose_5"] = "n\xE6sespidss\xE6nkning",\n    ["nose_6"] = "nose bone twist",\n    ["cheeks_1"] = "kindbens h\xF8jde",\n    ["cheeks_2"] = "kindbens bredde",\n    ["cheeks_3"] = "kind bredde",\n    ["lip_fullness"] = "l\xE6be fylde",\n    ["jaw_bone_width"] = "k\xE6beknoglebredde",\n    ["jaw_bone_length"] = "k\xE6bebens l\xE6ngde",\n    ["chin_height"] = "hageh\xF8jde",\n    ["chin_length"] = "hagel\xE6ngde",\n    ["chin_width"] = "hagebredde",\n    ["chin_hole"] = "chin hole size",\n    ["neck_thickness"] = "nakke tykkelse",\n    ["wrinkles"] = "rynker",\n    ["wrinkle_thickness"] = "rynke tykkelse",\n    ["beard_type"] = "sk\xE6g type",\n    ["beard_size"] = "sk\xE6g st\xF8rrelse",\n    ["beard_color_1"] = "sk\xE6g farve 1",\n    ["beard_color_2"] = "sk\xE6g farve 2",\n    ["hair_1"] = "h\xE5r 1",\n    ["hair_2"] = "h\xE5r 2",\n    ["hair_color_1"] = "h\xE5rfarve  1",\n    ["hair_color_2"] = "h\xE5rfarve 2",\n    ["eye_color"] = "\xF8jenfarve",\n    ["eye_squint"] = "\xF8jet skele",\n    ["eyebrow_type"] = "\xF8jenbryns type",\n    ["eyebrow_size"] = "\xF8jenbryns st\xF8rrelse",\n    ["eyebrow_color_1"] = "\xF8jenbryn farve 1",\n    ["eyebrow_color_2"] = "\xF8jenbryn farve 2",\n    ["eyebrow_depth"] = "\xF8jenbryns dybde",\n    ["eyebrow_height"] = "\xF8jenbryns h\xF8jde",\n    ["makeup_type"] = "makeup type",\n    ["makeup_thickness"] = "makeup tykkelse",\n    ["makeup_color_1"] = "makeup farve 1",\n    ["makeup_color_2"] = "makeup farve 2",\n    ["lipstick_type"] = "l\xE6bestifts type",\n    ["lipstick_thickness"] = "l\xE6bestifts tykkelse",\n    ["lipstick_color_1"] = "l\xE6bestifts farve 1",\n    ["lipstick_color_2"] = "l\xE6bestifts farve 2",\n    ["ear_accessories"] = "\xF8retilbeh\xF8r",\n    ["ear_accessories_color"] = "\xF8retilbeh\xF8r farve",\n    ["tshirt_1"] = "t-shirt 1",\n    ["tshirt_2"] = "t-shirt 2",\n    ["torso_1"] = "overkrop 1",\n    ["torso_2"] = "overkrop 2",\n    ["decals_1"] = "m\xE6rkater 1",\n    ["decals_2"] = "m\xE6rkater 2",\n    ["arms"] = "arme",\n    ["arms_2"] = "arme 2",\n    ["pants_1"] = "bukser 1",\n    ["pants_2"] = "bukser 2",\n    ["shoes_1"] = "sko 1",\n    ["shoes_2"] = "sko 2",\n    ["mask_1"] = "maske 1",\n    ["mask_2"] = "maske 2",\n    ["bproof_1"] = "skudsikker vest 1",\n    ["bproof_2"] = "skudsikker vest 2",\n    ["chain_1"] = "k\xE6de 1",\n    ["chain_2"] = "k\xE6de 2",\n    ["helmet_1"] = "hjelm 1",\n    ["helmet_2"] = "hjelm 2",\n    ["watches_1"] = "ure 1",\n    ["watches_2"] = "ure 2",\n    ["bracelets_1"] = "armb\xE5nd 1",\n    ["bracelets_2"] = "armb\xE5nd 2",\n    ["glasses_1"] = "briller 1",\n    ["glasses_2"] = "briller 2",\n    ["bag"] = "taske",\n    ["bag_color"] = "taske farve",\n    ["blemishes"] = "bumser",\n    ["blemishes_size"] = "bumser tykkelse",\n    ["ageing"] = "aldring",\n    ["ageing_1"] = "aldring tykkelse",\n    ["blush"] = "r\xF8dme",\n    ["blush_1"] = "r\xF8dme tykkelse",\n    ["blush_color"] = "r\xF8dme farve",\n    ["complexion"] = "teint",\n    ["complexion_1"] = "teint tykkelse",\n    ["sun"] = "sol",\n    ["sun_1"] = "soltykkelse",\n    ["freckles"] = "fregner",\n    ["freckles_1"] = "fregnernes tykkelse",\n    ["chest_hair"] = "brysth\xE5r",\n    ["chest_hair_1"] = "brysth\xE5rtykkelse",\n    ["chest_color"] = "brysth\xE5rfarve",\n    ["bodyb"] = "krops pletter",\n    ["bodyb_size"] = "krops pletter tykkelse",\n    ["bodyb_extra"] = "pletter kropseffekt",\n    ["bodyb_extra_thickness"] = "pletter kropseffekt tykkelse",\n}\n'
        },
        {
          "path": "locales/de.lua",
          "source": 'Locales["de"] = {\n  ["sex"] = "Geschlecht",\n  ["mom"] = "Mutters Gesicht",\n  ["dad"] = "Vaters Gesicht",\n  ["resemblance"] = "\xC4hnlichkeit",\n  ["skin_tone"] = "Hautton",\n  ["nose_1"] = "Nasenbreite",\n  ["grandparents"] = "Gro\xDFeltern",\n  ["resemblance_g"] = "Gro\xDFeltern \xC4hnlichkeit",\n  ["nose_2"] = "H\xF6he der Nasenspitze",\n  ["nose_3"] = "L\xE4nge der Nasenspitze",\n  ["nose_4"] = "Nasenbeinh\xF6he",\n  ["nose_5"] = "Nasenspitzenabsenkung",\n  ["nose_6"] = "Nasenbeinverdrehung",\n  ["cheeks_1"] = "Wangenknochenh\xF6he",\n  ["cheeks_2"] = "Wangenknochenbreite",\n  ["cheeks_3"] = "Wangenbreite",\n  ["lip_fullness"] = "Lippendicke",\n  ["jaw_bone_width"] = "Kieferknochenbreite",\n  ["jaw_bone_length"] = "Kieferknochenl\xE4nge",\n  ["chin_height"] = "Kinnh\xF6he",\n  ["chin_length"] = "Kinnl\xE4nge",\n  ["chin_width"] = "Kinnbreite",\n  ["chin_hole"] = "Kinnlochgr\xF6\xDFe",\n  ["neck_thickness"] = "Halsdicke",\n  ["wrinkles"] = "Falten",\n  ["wrinkle_thickness"] = "Faltenst\xE4rke",\n  ["beard_type"] = "Barttyp",\n  ["beard_size"] = "Bartgr\xF6\xDFe",\n  ["beard_color_1"] = "Bartfarbe 1",\n  ["beard_color_2"] = "Bartfarbe 2",\n  ["hair_1"] = "Haare 1",\n  ["hair_2"] = "Haare 2",\n  ["hair_color_1"] = "Haarfarbe 1",\n  ["hair_color_2"] = "Haarfarbe 2",\n  ["eye_color"] = "Augenfarbe",\n  ["eye_squint"] = "Augenblinzeln",\n  ["eyebrow_type"] = "Augenbrauentyp",\n  ["eyebrow_size"] = "Augenbrauengr\xF6\xDFe",\n  ["eyebrow_color_1"] = "Augenbrauenfarbe 1",\n  ["eyebrow_color_2"] = "Augenbrauenfarbe 2",\n  ["eyebrow_depth"] = "Augenbrauentiefe",\n  ["eyebrow_height"] = "Augenbrauenh\xF6he",\n  ["makeup_type"] = "Makeup-Typ",\n  ["makeup_thickness"] = "Makeupst\xE4rke",\n  ["makeup_color_1"] = "Schminkfarbe 1",\n  ["makeup_color_2"] = "Schminkfarbe 2",\n  ["lipstick_type"] = "Lippenstifttyp",\n  ["lipstick_thickness"] = "Lippenstiftdicke",\n  ["lipstick_color_1"] = "Lippenstiftfarbe 1",\n  ["lipstick_color_2"] = "Lippenstiftfarbe 2",\n  ["ear_accessories"] = "Ohrenzubeh\xF6r",\n  ["ear_accessories_color"] = "Ohrenzubeh\xF6r Farbe",\n  ["tshirt_1"] = "T-Shirt 1",\n  ["tshirt_2"] = "T-Shirt 2",\n  ["torso_1"] = "Oberk\xF6rper 1",\n  ["torso_2"] = "Oberk\xF6rper 2",\n  ["decals_1"] = "Abziehbilder 1",\n  ["decals_2"] = "Abziehbilder 2",\n  ["arms"] = "Arme 1",\n  ["arms_2"] = "Arme 2",\n  ["pants_1"] = "Hose 1",\n  ["pants_2"] = "Hose 2",\n  ["shoes_1"] = "Schuhe 1",\n  ["shoes_2"] = "Schuhe 2",\n  ["mask_1"] = "Maske 1",\n  ["mask_2"] = "Maske 2",\n  ["bproof_1"] = "Kugelsichere Weste 1",\n  ["bproof_2"] = "Kugelsichere Weste 2",\n  ["chain_1"] = "Kette 1",\n  ["chain_2"] = "Kette 2",\n  ["helmet_1"] = "Helm 1",\n  ["helmet_2"] = "Helm 2",\n  ["watches_1"] = "Uhren 1",\n  ["watches_2"] = "Uhren 2",\n  ["bracelets_1"] = "Armb\xE4nder 1",\n  ["bracelets_2"] = "Armb\xE4nder 2",\n  ["glasses_1"] = "Brille 1",\n  ["glasses_2"] = "Brille 2",\n  ["bag"] = "Tasche",\n  ["bag_color"] = "Taschenfarbe",\n  ["blemishes"] = "Sch\xF6nheitsfehler",\n  ["blemishes_size"] = "Fleckenst\xE4rke",\n  ["ageing"] = "Alterung",\n  ["ageing_1"] = "Alterungsst\xE4rke",\n  ["blush"] = "Err\xF6ten",\n  ["blush_1"] = "Err\xF6tungsst\xE4rke",\n  ["blush_color"] = "Err\xF6tungsfarbe",\n  ["complexion"] = "Teint",\n  ["complexion_1"] = "Teintst\xE4rke",\n  ["sun"] = "Sonne",\n  ["sun_1"] = "Sonnenst\xE4rke",\n  ["freckles"] = "Sommersprossen",\n  ["freckles_1"] = "Sommersprossenst\xE4rke",\n  ["chest_hair"] = "Brusthaar",\n  ["chest_hair_1"] = "Brusthaarst\xE4rke",\n  ["chest_color"] = "Brusthaarfarbe",\n  ["bodyb"] = "K\xF6rpermakel",\n  ["bodyb_size"] = "K\xF6rpermakelst\xE4rke",\n  ["bodyb_extra"] = "K\xF6rperfleckeneffekt",\n  ["bodyb_extra_thickness"] = "K\xF6rperfleckeneffektst\xE4rke",\n}\n'
        },
        {
          "path": "locales/en.lua",
          "source": 'Locales["en"] = {\n    ["sex"] = "sex",\n    ["mom"] = "Face 1",\n    ["dad"] = "Face 2",\n    ["grandparents"] = "Face 3",\n    ["resemblance"] = "Face 1/2 Mix",\n    ["resemblance_g"] = "Face 3 Mix",\n    ["skin_tone"] = "skin tone",\n    ["nose_1"] = "nose width",\n    ["nose_2"] = "nose peak height",\n    ["nose_3"] = "nose peak length",\n    ["nose_4"] = "nose bone height",\n    ["nose_5"] = "nose peak lowering",\n    ["nose_6"] = "nose bone twist",\n    ["cheeks_1"] = "cheekbones height",\n    ["cheeks_2"] = "cheekbones width",\n    ["cheeks_3"] = "cheeks width",\n    ["lip_fullness"] = "lip fullness",\n    ["jaw_bone_width"] = "jaw bone width",\n    ["jaw_bone_length"] = "jaw bone length",\n    ["chin_height"] = "chin height",\n    ["chin_length"] = "chin length",\n    ["chin_width"] = "chin width",\n    ["chin_hole"] = "chin hole size",\n    ["neck_thickness"] = "neck thickness",\n    ["wrinkles"] = "wrinkles",\n    ["wrinkle_thickness"] = "wrinkle thickness",\n    ["beard_type"] = "beard type",\n    ["beard_size"] = "beard size",\n    ["beard_color_1"] = "beard color 1",\n    ["beard_color_2"] = "beard color 2",\n    ["hair_1"] = "hair 1",\n    ["hair_2"] = "hair 2",\n    ["hair_color_1"] = "hair color 1",\n    ["hair_color_2"] = "hair color 2",\n    ["eye_color"] = "eye color",\n    ["eye_squint"] = "eye squint",\n    ["eyebrow_type"] = "eyebrow type",\n    ["eyebrow_size"] = "eyebrow size",\n    ["eyebrow_color_1"] = "eyebrow color 1",\n    ["eyebrow_color_2"] = "eyebrow color 2",\n    ["eyebrow_depth"] = "eyebrow depth",\n    ["eyebrow_height"] = "eyebrow height",\n    ["makeup_type"] = "makeup type",\n    ["makeup_thickness"] = "makeup thickness",\n    ["makeup_color_1"] = "makeup color 1",\n    ["makeup_color_2"] = "makeup color 2",\n    ["lipstick_type"] = "lipstick type",\n    ["lipstick_thickness"] = "lipstick thickness",\n    ["lipstick_color_1"] = "lipstick color 1",\n    ["lipstick_color_2"] = "lipstick color 2",\n    ["ear_accessories"] = "ear accessories",\n    ["ear_accessories_color"] = "ear accessories color",\n    ["tshirt_1"] = "t-Shirt 1",\n    ["tshirt_2"] = "t-Shirt 2",\n    ["torso_1"] = "torso 1",\n    ["torso_2"] = "torso 2",\n    ["decals_1"] = "decals 1",\n    ["decals_2"] = "decals 2",\n    ["arms"] = "arms",\n    ["arms_2"] = "arms 2",\n    ["pants_1"] = "pants 1",\n    ["pants_2"] = "pants 2",\n    ["shoes_1"] = "shoes 1",\n    ["shoes_2"] = "shoes 2",\n    ["mask_1"] = "mask 1",\n    ["mask_2"] = "mask 2",\n    ["bproof_1"] = "bulletproof vest 1",\n    ["bproof_2"] = "bulletproof vest 2",\n    ["chain_1"] = "chain 1",\n    ["chain_2"] = "chain 2",\n    ["helmet_1"] = "helmet 1",\n    ["helmet_2"] = "helmet 2",\n    ["watches_1"] = "watches 1",\n    ["watches_2"] = "watches 2",\n    ["bracelets_1"] = "bracelets 1",\n    ["bracelets_2"] = "bracelets 2",\n    ["glasses_1"] = "glasses 1",\n    ["glasses_2"] = "glasses 2",\n    ["bag"] = "bag",\n    ["bag_color"] = "bag color",\n    ["blemishes"] = "blemishes",\n    ["blemishes_size"] = "blemishes thickness",\n    ["ageing"] = "ageing",\n    ["ageing_1"] = "ageing thickness",\n    ["blush"] = "blush",\n    ["blush_1"] = "blush thickness",\n    ["blush_color"] = "blush color",\n    ["complexion"] = "complexion",\n    ["complexion_1"] = "complexion thickness",\n    ["sun"] = "sun",\n    ["sun_1"] = "sun thickness",\n    ["freckles"] = "freckles",\n    ["freckles_1"] = "freckles thickness",\n    ["chest_hair"] = "chest hair",\n    ["chest_hair_1"] = "chest hair thickness",\n    ["chest_color"] = "chest hair color",\n    ["bodyb"] = "body blemishes",\n    ["bodyb_size"] = "body blemishes thickness",\n    ["bodyb_extra"] = "blemishes body effect",\n    ["bodyb_extra_thickness"] = "blemishes body effect thickness",\n}\n'
        },
        {
          "path": "locales/es.lua",
          "source": 'Locales["es"] = {\n    ["sex"] = "Sexo",\n    ["mom"] = "Herencia de la Madre",\n    ["dad"] = "Herencia del Padre",\n    ["resemblance"] = "Parecido",\n    ["skin_tone"] = "Tono de piel",\n    ["nose_1"] = "Ancho de la Nariz",\n    ["nose_2"] = "Altura del pico de la Nariz",\n    ["nose_3"] = "Longitud del pico de la Nariz",\n    ["nose_4"] = "Altura del hueso de la Nariz",\n    ["nose_5"] = "Bajada del pico de la Nariz",\n    ["nose_6"] = "Torsi\xF3n del hueso de la Nariz",\n    ["cheeks_1"] = "Altura de los p\xF3mulos",\n    ["cheeks_2"] = "Anchura de los p\xF3mulos",\n    ["cheeks_3"] = "Ancho de las mejillas",\n    ["lip_fullness"] = "Relleno de los labios",\n    ["jaw_bone_width"] = "Anchura del hueso de la mand\xEDbula",\n    ["jaw_bone_length"] = "Longitud del hueso de la mand\xEDbula",\n    ["chin_height"] = "Altura de la barbilla",\n    ["chin_length"] = "Longitud de la barbilla",\n    ["chin_width"] = "Ancho de la barbilla",\n    ["chin_hole"] = "Tama\xF1o del agujero de la barbilla",\n    ["neck_thickness"] = "Grosor del cuello",\n    ["wrinkles"] = "Arrugas",\n    ["wrinkle_thickness"] = "Cantidad de arrugas",\n    ["beard_type"] = "Tipo de barba",\n    ["beard_size"] = "Tama\xF1o de la barba",\n    ["beard_color_1"] = "Color de la barba 1",\n    ["beard_color_2"] = "Color de la barba 2",\n    ["hair_1"] = "Pelo 1",\n    ["hair_2"] = "Pelo 2",\n    ["hair_color_1"] = "Color de pelo 1",\n    ["hair_color_2"] = "Color de pelo 2",\n    ["eye_color"] = "Color de ojos",\n    ["eye_squint"] = "Apertura de ojos",\n    ["eyebrow_type"] = "Tipo de ceja",\n    ["eyebrow_size"] = "Tipo de ceja",\n    ["eyebrow_color_1"] = "Color de ceja 1",\n    ["eyebrow_color_2"] = "Color de ceja 2",\n    ["eyebrow_depth"] = "Profundidad de las cejas",\n    ["eyebrow_height"] = "Altura de las cejas",\n    ["makeup_type"] = "Tipo de maquillaje",\n    ["makeup_thickness"] = "Cantidad de maquillaje",\n    ["makeup_color_1"] = "Color de maquillaje 1",\n    ["makeup_color_2"] = "Color de maquillaje 2",\n    ["lipstick_type"] = "Tipo de pintalabios",\n    ["lipstick_thickness"] = "Cantidad de pintalabios",\n    ["lipstick_color_1"] = "Color de pintalabios 1",\n    ["lipstick_color_2"] = "Color de pintalabios 2",\n    ["ear_accessories"] = "Accesorios de oreja",\n    ["ear_accessories_color"] = "Color de accesorios",\n    ["tshirt_1"] = "Camiseta 1",\n    ["tshirt_2"] = "Camiseta 2",\n    ["torso_1"] = "Torso 1",\n    ["torso_2"] = "Torso 2",\n    ["decals_1"] = "Tatuajes 1",\n    ["decals_2"] = "Tatuajes 2",\n    ["arms"] = "Brazos",\n    ["arms_2"] = "Brazos 2",\n    ["pants_1"] = "Pantalones 1",\n    ["pants_2"] = "Pantalones 2",\n    ["shoes_1"] = "Calzado 1",\n    ["shoes_2"] = "Calzado 2",\n    ["mask_1"] = "Mascara 1",\n    ["mask_2"] = "Mascara 2",\n    ["bproof_1"] = "Chaleco antibalas 1",\n    ["bproof_2"] = "Chaleco antibalas 2",\n    ["chain_1"] = "Cadena 1",\n    ["chain_2"] = "Cadena 2",\n    ["helmet_1"] = "Casco 1",\n    ["helmet_2"] = "Casco 2",\n    ["watches_1"] = "Reloj 1",\n    ["watches_2"] = "Reloj 2",\n    ["bracelets_1"] = "Pulseras 1",\n    ["bracelets_2"] = "Pulseras 2",\n    ["glasses_1"] = "Gafas 1",\n    ["glasses_2"] = "Gafas 2",\n    ["bag"] = "Mochila",\n    ["bag_color"] = "Color mochila",\n    ["blemishes"] = "Manchas",\n    ["blemishes_size"] = "Cantidad de manchas",\n    ["ageing"] = "Envejecimiento",\n    ["ageing_1"] = "Cantidad de envejecimiento",\n    ["blush"] = "Colorete",\n    ["blush_1"] = "Cantidad de colorete",\n    ["blush_color"] = "Color de colorete",\n    ["complexion"] = "Complexi\xF3n",\n    ["complexion_1"] = "Cantidad de complexi\xF3n",\n    ["sun"] = "Bronceado",\n    ["sun_1"] = "Cantidad de bronceado",\n    ["freckles"] = "Pecas",\n    ["freckles_1"] = "Cantidad de pecas",\n    ["chest_hair"] = "Vello corporal",\n    ["chest_hair_1"] = "Cantidad de vello corporal",\n    ["chest_color"] = "Color de vello corporal",\n    ["bodyb"] = "Manchas en el cuerpo",\n    ["bodyb_size"] = "Tipo de manchas en el cuerpo",\n    ["bodyb_extra"] = "Efecto de manchas en el cuerpo",\n    ["bodyb_extra_thickness"] = "Espesor de manchas efecto cuerpo",\n}\n'
        },
        {
          "path": "locales/fi.lua",
          "source": 'Locales["fi"] = {\n    ["sex"] = "Sukupuoli",\n    ["face"] = "Kasvot",\n    ["skin"] = "Iho",\n    ["wrinkles"] = "Rypyt",\n    ["wrinkle_thickness"] = "Ryppyjen vahvuus",\n    ["beard_type"] = "Parta tyyli",\n    ["beard_size"] = "Parran koko",\n    ["beard_color_1"] = "Parran v\xE4ri 1",\n    ["beard_color_2"] = "Parran v\xE4ri 2",\n    ["hair_1"] = "Hiukset 1",\n    ["hair_2"] = "Hiukset 2",\n    ["hair_color_1"] = "Hiuksien v\xE4ri 1",\n    ["hair_color_2"] = "Hiuksien v\xE4ri 2",\n    ["eye_color"] = "Silmien v\xE4ri",\n    ["eyebrow_type"] = "Kulmakarva tyyli",\n    ["eyebrow_size"] = "Kulmakarvojen tiheys",\n    ["eyebrow_color_1"] = "Kulmakarvojen v\xE4ri 1",\n    ["eyebrow_color_2"] = "Kulmakarvojen v\xE4ri 2",\n    ["makeup_type"] = "Meikki tyyli",\n    ["makeup_thickness"] = "Meikin vahvuus",\n    ["makeup_color_1"] = "Meikin v\xE4ri 1",\n    ["makeup_color_2"] = "Meikin v\xE4ri 2",\n    ["lipstick_type"] = "Huulipuna tyyli",\n    ["lipstick_thickness"] = "Huulipunan vahvuus",\n    ["lipstick_color_1"] = "Huulipunan v\xE4ri 1",\n    ["lipstick_color_2"] = "Huulipunan v\xE4ri 2",\n    ["ear_accessories"] = "Korvakorut",\n    ["ear_accessories_color"] = "Korvakorujen v\xE4ri",\n    ["tshirt_1"] = "T-paita 1",\n    ["tshirt_2"] = "T-paita 2",\n    ["torso_1"] = "Paita 1",\n    ["torso_2"] = "Paita 2",\n    ["decals_1"] = "Kerros 1",\n    ["decals_2"] = "Kerros 2",\n    ["arms"] = "K\xE4det",\n    ["arms_2"] = "K\xE4det 2",\n    ["pants_1"] = "Housut 1",\n    ["pants_2"] = "Housut 2",\n    ["shoes_1"] = "Keng\xE4t 1",\n    ["shoes_2"] = "Keng\xE4t 2",\n    ["mask_1"] = "Maski 1",\n    ["mask_2"] = "Maski 2",\n    ["bproof_1"] = "Luotiliivi 1",\n    ["bproof_2"] = "Luotiliivi 2",\n    ["chain_1"] = "Korut 1",\n    ["chain_2"] = "Korut 2",\n    ["helmet_1"] = "Kyp\xE4r\xE4t 1",\n    ["helmet_2"] = "Kyp\xE4r\xE4t 2",\n    ["watches_1"] = "Kellot 1",\n    ["watches_2"] = "Kellot 2",\n    ["bracelets_1"] = "Rannekkeet 1",\n    ["bracelets_2"] = "Rannekkeet 2",\n    ["glasses_1"] = "Lasit 1",\n    ["glasses_2"] = "Lasit 2",\n    ["bag"] = "Reput",\n    ["bag_color"] = "Repun v\xE4ri",\n    ["blemishes"] = "Pisamat",\n    ["blemishes_size"] = "Pisamien vahvuus",\n    ["ageing"] = "Ik\xE4\xE4ntyminen",\n    ["ageing_1"] = "Ik\xE4\xE4ntyminen vahvuus",\n    ["blush"] = "Punastuminen",\n    ["blush_1"] = "Punastumisen vahvuus",\n    ["blush_color"] = "Punastumisen v\xE4ri",\n    ["complexion"] = "Pigmentti",\n    ["complexion_1"] = "Pigmentin vahvuus",\n    ["sun"] = "Rusketus",\n    ["sun_1"] = "Rusketus vahvuus",\n    ["freckles"] = "Pilkut",\n    ["freckles_1"] = "Pilkkujen vahvuus",\n    ["chest_hair"] = "Rintakarvat",\n    ["chest_hair_1"] = "Rintakarvojen tiheys",\n    ["chest_color"] = "Rintakarvojen v\xE4ri",\n    ["bodyb"] = "Pisamat kehossa",\n    ["bodyb_size"] = "Kehopisamien vahvuus",\n}\n'
        },
        {
          "path": "locales/fr.lua",
          "source": `Locales["fr"] = {
    ["sex"] = "sexe",
    ["mom"] = "visage de la m\xE8re",
    ["dad"] = "visage du p\xE8re",
    ["resemblance"] = "ressemblance",
    ["skin_tone"] = "teint",
    ["nose_1"] = "largeur du nez",
    ["nose_2"] = "hauteur du pic du nez",
    ["nose_3"] = "longueur du pic du nez",
    ["nose_4"] = "hauteur de l'os du nez",
    ["nose_5"] = "abaissement du pic du nez",
    ["nose_6"] = "torsion de l'os du nez",
    ["cheeks_1"] = "hauteur des pommettes",
    ["cheeks_2"] = "largeur des pommettes",
    ["cheeks_3"] = "largeur des joues",
    ["lip_fullness"] = "pl\xE9nitude des l\xE8vres",
    ["jaw_bone_width"] = "largeur de l'os de la m\xE2choire",
    ["jaw_bone_length"] = "longueur de l'os de la m\xE2choire",
    ["chin_height"] = "hauteur du menton",
    ["chin_length"] = "longueur du menton",
    ["chin_width"] = "largeur du menton",
    ["chin_hole"] = "taille du trou du menton",
    ["neck_thickness"] = "\xE9paisseur du cou",
    ["wrinkles"] = "les rides",
    ["wrinkle_thickness"] = "\xE9paisseur des rides",
    ["beard_type"] = "type de barbe",
    ["beard_size"] = "taille de barbe",
    ["beard_color_1"] = "couleur de barbe 1",
    ["beard_color_2"] = "couleur de barbe 2",
    ["hair_1"] = "cheveux 1",
    ["hair_2"] = "cheveux 2",
    ["hair_color_1"] = "couleur de cheveux 1",
    ["hair_color_2"] = "couleur de cheveux 2",
    ["eye_color"] = "couleur des yeux",
    ["eye_squint"] = "Louchement des yeux",
    ["eyebrow_type"] = "type de sourcil",
    ["eyebrow_size"] = "taille des sourcils",
    ["eyebrow_color_1"] = "couleur des sourcils 1",
    ["eyebrow_color_2"] = "couleur des sourcils 2",
    ["eyebrow_depth"] = "profondeur des sourcils",
    ["eyebrow_height"] = "hauteur des sourcils",
    ["makeup_type"] = "type de maquillage",
    ["makeup_thickness"] = "\xE9paisseur de maquillage",
    ["makeup_color_1"] = "couleur de maquillage 1",
    ["makeup_color_2"] = "couleur de maquillage 2",
    ["lipstick_type"] = "type de rouge \xE0 l\xE8vres",
    ["lipstick_thickness"] = "\xE9paisseur du rouge \xE0 l\xE8vres",
    ["lipstick_color_1"] = "couleur de rouge \xE0 l\xE8vres 1",
    ["lipstick_color_2"] = "couleur de rouge \xE0 l\xE8vres 2",
    ["ear_accessories"] = "accessoires d'oreille",
    ["ear_accessories_color"] = "couleur des accessoires d'oreille",
    ["tshirt_1"] = "t-Shirt 1",
    ["tshirt_2"] = "t-Shirt 2",
    ["torso_1"] = "torse 1",
    ["torso_2"] = "torse 2",
    ["decals_1"] = "d\xE9calcomanies 1",
    ["decals_2"] = "d\xE9calcomanies 2",
    ["arms"] = "bras",
    ["arms_2"] = "bras 2",
    ["pants_1"] = "pantalon 1",
    ["pants_2"] = "pantalon 2",
    ["shoes_1"] = "chaussures 1",
    ["shoes_2"] = "chaussures 2",
    ["mask_1"] = "masque 1",
    ["mask_2"] = "masque 2",
    ["bproof_1"] = "gilet pare-balles 1",
    ["bproof_2"] = "gilet pare-balles 2",
    ["chain_1"] = "cha\xEEne 1",
    ["chain_2"] = "cha\xEEne 2",
    ["helmet_1"] = "casque 1",
    ["helmet_2"] = "casque 2",
    ["watches_1"] = "montres 1",
    ["watches_2"] = "montres 2",
    ["bracelets_1"] = "bracelets 1",
    ["bracelets_2"] = "bracelets 2",
    ["glasses_1"] = "lunettes 1",
    ["glasses_2"] = "lunettes 2",
    ["bag"] = "sac",
    ["bag_color"] = "couleur du sac",
    ["blemishes"] = "imperfections",
    ["blemishes_size"] = "\xE9paisseur des imperfections",
    ["ageing"] = "vieillissement",
    ["ageing_1"] = "\xE9paisseur de vieillissement",
    ["blush"] = "rougir",
    ["blush_1"] = "\xE9paisseur du fard \xE0 joues",
    ["blush_color"] = "couleur fard \xE0 joues",
    ["complexion"] = "complexion",
    ["complexion_1"] = "\xE9paisseur du teint",
    ["sun"] = "soleil",
    ["sun_1"] = "\xE9paisseur du soleil",
    ["freckles"] = "taches de rousseur",
    ["freckles_1"] = "\xE9paisseur des taches de rousseur",
    ["chest_hair"] = "les poils du torse",
    ["chest_hair_1"] = "\xE9paisseur des poils de la poitrine",
    ["chest_color"] = "couleur des cheveux de la poitrine",
    ["bodyb"] = "imperfections du corps",
    ["bodyb_size"] = "\xE9paisseur des imperfections corporelles",
    ["bodyb_extra"] = "effet corps",
    ["bodyb_extra_thickness"] = "imperfections effet corps \xE9paisseur",
}
`
        },
        {
          "path": "locales/he.lua",
          "source": 'Locales["he"] = {\n    ["sex"] = "\u05DE\u05D9\u05DF",\n    ["mom"] = "\u05E4\u05E0\u05D9\u05DD \u05E9\u05DC \u05D0\u05DE\u05D0",\n    ["dad"] = "\u05E4\u05E0\u05D9\u05DD \u05E9\u05DC \u05D0\u05D1\u05D0",\n    ["resemblance"] = "\u05D3\u05DE\u05D9\u05D5\u05DF",\n    ["skin_tone"] = "\u05D2\u05D5\u05D5\u05DF \u05D4\u05E2\u05D5\u05E8",\n    ["nose_1"] = "\u05E8\u05D5\u05D7\u05D1 \u05D4\u05D0\u05E3",\n    ["nose_2"] = "\u05D2\u05D5\u05D1\u05D4 \u05E9\u05D9\u05D0 \u05D4\u05D0\u05E3",\n    ["nose_3"] = "\u05D0\u05D5\u05E8\u05DA \u05E9\u05D9\u05D0 \u05D4\u05D0\u05E3",\n    ["nose_4"] = "\u05D2\u05D5\u05D1\u05D4 \u05E2\u05E6\u05DD \u05D4\u05D0\u05E3",\n    ["nose_5"] = "\u05D4\u05D5\u05E8\u05D3\u05EA \u05E9\u05D9\u05D0 \u05D4\u05D0\u05E3",\n    ["nose_6"] = "\u05E1\u05D9\u05D1\u05D5\u05D1 \u05E2\u05E6\u05DD \u05D4\u05D0\u05E3",\n    ["cheeks_1"] = "\u05D2\u05D5\u05D1\u05D4 \u05D4\u05DC\u05D7\u05D9\u05D9\u05DD",\n    ["cheeks_2"] = "\u05E8\u05D5\u05D7\u05D1 \u05D4\u05DC\u05D7\u05D9\u05D9\u05DD",\n    ["cheeks_3"] = "\u05E8\u05D5\u05D7\u05D1 \u05D4\u05DC\u05D7\u05D9\u05D9\u05DD",\n    ["lip_fullness"] = "\u05DE\u05DC\u05D0\u05D5\u05EA \u05D4\u05E9\u05E4\u05EA\u05D9\u05D9\u05DD",\n    ["jaw_bone_width"] = "\u05E8\u05D5\u05D7\u05D1 \u05E2\u05E6\u05DD \u05D4\u05DC\u05E1\u05EA",\n    ["jaw_bone_length"] = "\u05D0\u05D5\u05E8\u05DA \u05E2\u05E6\u05DD \u05D4\u05DC\u05E1\u05EA",\n    ["chin_height"] = "\u05D2\u05D5\u05D1\u05D4 \u05D4\u05E1\u05E0\u05D8\u05E8",\n    ["chin_length"] = "\u05D0\u05D5\u05E8\u05DA \u05D4\u05E1\u05E0\u05D8\u05E8",\n    ["chin_width"] = "\u05E8\u05D5\u05D7\u05D1 \u05D4\u05E1\u05E0\u05D8\u05E8",\n    ["chin_hole"] = "\u05D2\u05D5\u05D3\u05DC \u05D7\u05D5\u05E8 \u05D4\u05E1\u05E0\u05D8\u05E8",\n    ["neck_thickness"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05E6\u05D5\u05D5\u05D0\u05E8",\n    ["wrinkles"] = "\u05E7\u05DE\u05D8\u05D9\u05DD",\n    ["wrinkle_thickness"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05E7\u05DE\u05D8\u05D9\u05DD",\n    ["beard_type"] = "\u05E1\u05D5\u05D2 \u05D4\u05D6\u05E7\u05DF",\n    ["beard_size"] = "\u05D2\u05D5\u05D3\u05DC \u05D4\u05D6\u05E7\u05DF",\n    ["beard_color_1"] = "\u05E6\u05D1\u05E2 \u05D4\u05D6\u05E7\u05DF 1",\n    ["beard_color_2"] = "\u05E6\u05D1\u05E2 \u05D4\u05D6\u05E7\u05DF 2",\n    ["hair_1"] = "\u05E9\u05D9\u05E2\u05E8 1",\n    ["hair_2"] = "\u05E9\u05D9\u05E2\u05E8 2",\n    ["hair_color_1"] = "\u05E6\u05D1\u05E2 \u05D4\u05E9\u05D9\u05E2\u05E8 1",\n    ["hair_color_2"] = "\u05E6\u05D1\u05E2 \u05D4\u05E9\u05D9\u05E2\u05E8 2",\n    ["eye_color"] = "\u05E6\u05D1\u05E2 \u05D4\u05E2\u05D9\u05E0\u05D9\u05D9\u05DD",\n    ["eye_squint"] = "\u05E7\u05D9\u05DE\u05D5\u05D8 \u05D4\u05E2\u05D9\u05DF",\n    ["eyebrow_type"] = "\u05E1\u05D5\u05D2 \u05D4\u05D2\u05D1\u05D5\u05EA",\n    ["eyebrow_size"] = "\u05D2\u05D5\u05D3\u05DC \u05D4\u05D2\u05D1\u05D5\u05EA",\n    ["eyebrow_color_1"] = "\u05E6\u05D1\u05E2 \u05D4\u05D2\u05D1\u05D5\u05EA 1",\n    ["eyebrow_color_2"] = "\u05E6\u05D1\u05E2 \u05D4\u05D2\u05D1\u05D5\u05EA 2",\n    ["eyebrow_depth"] = "\u05E2\u05D5\u05DE\u05E7 \u05D4\u05D2\u05D1\u05D5\u05EA",\n    ["eyebrow_height"] = "\u05D2\u05D5\u05D1\u05D4 \u05D4\u05D2\u05D1\u05D5\u05EA",\n    ["makeup_type"] = "\u05E1\u05D5\u05D2 \u05D4\u05D0\u05D9\u05E4\u05D5\u05E8",\n    ["makeup_thickness"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05D0\u05D9\u05E4\u05D5\u05E8",\n    ["makeup_color_1"] = "\u05E6\u05D1\u05E2 \u05D4\u05D0\u05D9\u05E4\u05D5\u05E8 1",\n    ["makeup_color_2"] = "\u05E6\u05D1\u05E2 \u05D4\u05D0\u05D9\u05E4\u05D5\u05E8 2",\n    ["lipstick_type"] = "\u05E1\u05D5\u05D2 \u05D4\u05E9\u05E4\u05EA\u05D5\u05DF",\n    ["lipstick_thickness"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05E9\u05E4\u05EA\u05D5\u05DF",\n    ["lipstick_color_1"] = "\u05E6\u05D1\u05E2 \u05D4\u05E9\u05E4\u05EA\u05D5\u05DF 1",\n    ["lipstick_color_2"] = "\u05E6\u05D1\u05E2 \u05D4\u05E9\u05E4\u05EA\u05D5\u05DF 2",\n    ["ear_accessories"] = "\u05EA\u05DB\u05E9\u05D9\u05D8\u05D9\u05DD \u05DC\u05D0\u05D5\u05D6\u05E0\u05D9\u05D9\u05DD",\n    ["ear_accessories_color"] = "\u05E6\u05D1\u05E2 \u05D4\u05EA\u05DB\u05E9\u05D9\u05D8\u05D9\u05DD \u05DC\u05D0\u05D5\u05D6\u05E0\u05D9\u05D9\u05DD",\n    ["tshirt_1"] = "\u05D7\u05D5\u05DC\u05E6\u05EA \u05D8\u05D9 1",\n    ["tshirt_2"] = "\u05D7\u05D5\u05DC\u05E6\u05EA \u05D8\u05D9 2",\n    ["torso_1"] = "\u05D2\u05D5\u05E3 \u05E2\u05DC\u05D9\u05D5\u05DF 1",\n    ["torso_2"] = "\u05D2\u05D5\u05E3 \u05E2\u05DC\u05D9\u05D5\u05DF 2",\n    ["decals_1"] = "\u05DE\u05D3\u05D1\u05E7\u05D5\u05EA 1",\n    ["decals_2"] = "\u05DE\u05D3\u05D1\u05E7\u05D5\u05EA 2",\n    ["arms"] = "\u05D9\u05D3\u05D9\u05D9\u05DD",\n    ["arms_2"] = "\u05D9\u05D3\u05D9\u05D9\u05DD 2",\n    ["pants_1"] = "\u05DE\u05DB\u05E0\u05E1\u05D9\u05D9\u05DD 1",\n    ["pants_2"] = "\u05DE\u05DB\u05E0\u05E1\u05D9\u05D9\u05DD 2",\n    ["shoes_1"] = "\u05E0\u05E2\u05DC\u05D9\u05D9\u05DD 1",\n    ["shoes_2"] = "\u05E0\u05E2\u05DC\u05D9\u05D9\u05DD 2",\n    ["mask_1"] = "\u05DE\u05E1\u05D9\u05DB\u05D4 1",\n    ["mask_2"] = "\u05DE\u05E1\u05D9\u05DB\u05D4 2",\n    ["bproof_1"] = "\u05E9\u05E8\u05D9\u05D5\u05DF \u05E0\u05D2\u05D3 \u05E7\u05DC\u05D9\u05E2\u05D9\u05DD 1",\n    ["bproof_2"] = "\u05E9\u05E8\u05D9\u05D5\u05DF \u05E0\u05D2\u05D3 \u05E7\u05DC\u05D9\u05E2\u05D9\u05DD 2",\n    ["chain_1"] = "\u05E9\u05E8\u05E9\u05E8\u05EA 1",\n    ["chain_2"] = "\u05E9\u05E8\u05E9\u05E8\u05EA 2",\n    ["helmet_1"] = "\u05E7\u05E1\u05D3\u05D4 1",\n    ["helmet_2"] = "\u05E7\u05E1\u05D3\u05D4 2",\n    ["watches_1"] = "\u05E9\u05E2\u05D5\u05E0\u05D9\u05DD 1",\n    ["watches_2"] = "\u05E9\u05E2\u05D5\u05E0\u05D9\u05DD 2",\n    ["bracelets_1"] = "\u05E6\u05DE\u05D9\u05D3\u05D9\u05DD 1",\n    ["bracelets_2"] = "\u05E6\u05DE\u05D9\u05D3\u05D9\u05DD 2",\n    ["glasses_1"] = "\u05DE\u05E9\u05E7\u05E4\u05D9\u05D9\u05DD 1",\n    ["glasses_2"] = "\u05DE\u05E9\u05E7\u05E4\u05D9\u05D9\u05DD 2",\n    ["bag"] = "\u05EA\u05D9\u05E7",\n    ["bag_color"] = "\u05E6\u05D1\u05E2 \u05D4\u05EA\u05D9\u05E7",\n    ["blemishes"] = "\u05DB\u05EA\u05DE\u05D9\u05DD",\n    ["blemishes_size"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05DB\u05EA\u05DE\u05D9\u05DD",\n    ["ageing"] = "\u05D4\u05D6\u05D3\u05E7\u05E0\u05D5\u05EA",\n    ["ageing_1"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05D4\u05D6\u05D3\u05E7\u05E0\u05D5\u05EA",\n    ["blush"] = "\u05E8\u05D5\u05D2\u05D6",\n    ["blush_1"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05E8\u05D5\u05D2\u05D6",\n    ["blush_color"] = "\u05E6\u05D1\u05E2 \u05D4\u05E8\u05D5\u05D2\u05D6",\n    ["complexion"] = "\u05DE\u05E8\u05E7\u05DD \u05D4\u05E2\u05D5\u05E8",\n    ["complexion_1"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05DE\u05E8\u05E7\u05DD",\n    ["sun"] = "\u05E9\u05DE\u05E9",\n    ["sun_1"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05E9\u05DE\u05E9",\n    ["freckles"] = "\u05E0\u05DE\u05E9\u05D9\u05DD",\n    ["freckles_1"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05E0\u05DE\u05E9\u05D9\u05DD",\n    ["chest_hair"] = "\u05E9\u05D9\u05E2\u05E8 \u05D7\u05D6\u05D4",\n    ["chest_hair_1"] = "\u05E2\u05D5\u05D1\u05D9 \u05E9\u05D9\u05E2\u05E8 \u05D4\u05D7\u05D6\u05D4",\n    ["chest_color"] = "\u05E6\u05D1\u05E2 \u05E9\u05D9\u05E2\u05E8 \u05D4\u05D7\u05D6\u05D4",\n    ["bodyb"] = "\u05DB\u05EA\u05DE\u05D9\u05DD \u05D1\u05D2\u05D5\u05E3",\n    ["bodyb_size"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05DB\u05EA\u05DE\u05D9\u05DD \u05D1\u05D2\u05D5\u05E3",\n    ["bodyb_extra"] = "\u05D4\u05E9\u05E4\u05E2\u05EA \u05DB\u05EA\u05DE\u05D9\u05DD \u05D1\u05D2\u05D5\u05E3",\n    ["bodyb_extra_thickness"] = "\u05E2\u05D5\u05D1\u05D9 \u05D4\u05E9\u05E4\u05E2\u05EA \u05D4\u05DB\u05EA\u05DE\u05D9\u05DD \u05D1\u05D2\u05D5\u05E3",\n}\n'
        },
        {
          "path": "locales/hu.lua",
          "source": 'Locales["hu"] = {\n    ["sex"] = "Nem",\n    ["mom"] = "Anyja arca",\n    ["dad"] = "Apja arca",\n    ["resemblance"] = "Hasonl\xF3s\xE1g",\n    ["skin_tone"] = "B\u0151rsz\xEDn",\n    ["nose_1"] = "Orr sz\xE9less\xE9ge",\n    ["nose_2"] = "Orr magass\xE1ga",\n    ["nose_3"] = "Orrcs\xFAcs hossza",\n    ["nose_4"] = "Orrcsont magass\xE1ga",\n    ["nose_5"] = "Orrcs\xFAcs leenged\xE9se",\n    ["nose_6"] = "Orrcsong csavar",\n    ["cheeks_1"] = "Arccsont magass\xE1ga",\n    ["cheeks_2"] = "Arccsont sz\xE9less\xE9ge",\n    ["cheeks_3"] = "Arccsont sz\xE9less\xE9ge 2",\n    ["lip_fullness"] = "Ajak telts\xE9ge",\n    ["jaw_bone_width"] = "Allcsont sz\xE9less\xE9ge",\n    ["jaw_bone_length"] = "\xC1llcsong hossza",\n    ["chin_height"] = "\xC1ll magass\xE1ga",\n    ["chin_length"] = "\xC1ll hossza",\n    ["chin_width"] = "\xC1ll sz\xE9less\xE9ge",\n    ["chin_hole"] = "\xC1lllyuk m\xE9rete",\n    ["neck_thickness"] = "Nyak vastags\xE1ga",\n    ["wrinkles"] = "R\xE1ncok",\n    ["wrinkle_thickness"] = "R\xE1ncok er\u0151ss\xE9ge",\n    ["beard_type"] = "Szak\xE1ll t\xEDpusa",\n    ["beard_size"] = "Szak\xE1ll nagys\xE1ga",\n    ["beard_color_1"] = "Szak\xE1ll sz\xEDne 1",\n    ["beard_color_2"] = "Szak\xE1ll sz\xEDne 2",\n    ["hair_1"] = "Haj 1",\n    ["hair_2"] = "Haj 2",\n    ["hair_color_1"] = "Haj sz\xEDne 1",\n    ["hair_color_2"] = "Haj sz\xEDne 2",\n    ["eye_color"] = "Szem szine",\n    ["eye_squint"] = "Szem hunyorg\xE1s",\n    ["eyebrow_type"] = "Szem t\xEDpusa",\n    ["eyebrow_size"] = "Szem nagys\xE1ga",\n    ["eyebrow_color_1"] = "Szem sz\xEDne 1",\n    ["eyebrow_color_2"] = "Szem sz\xEDne 2",\n    ["eyebrow_depth"] = "Szem\xF6ld\xF6km\xE9lys\xE9ge",\n    ["eyebrow_height"] = "Szem\xF6ld\xF6kmagass\xE1ga",\n    ["makeup_type"] = "Smink tipusa",\n    ["makeup_thickness"] = "Smink er\xF6ss\xE9ge",\n    ["makeup_color_1"] = "Smink sz\xEDne 1",\n    ["makeup_color_2"] = "Smink sz\xEDne 2",\n    ["lipstick_type"] = "R\xFAzs t\xEDpusa",\n    ["lipstick_thickness"] = "R\xFAzs er\u0151ss\xE9ge",\n    ["lipstick_color_1"] = "R\xFAzs sz\xEDne 1",\n    ["lipstick_color_2"] = "R\xFAzs sz\xEDne 2",\n    ["ear_accessories"] = "F\xFClbeval\xF3",\n    ["ear_accessories_color"] = "F\xFClbeval\xF3 sz\xEDne",\n    ["tshirt_1"] = "P\xF3l\xF3 1",\n    ["tshirt_2"] = "P\xF3l\xF3 2",\n    ["torso_1"] = "Fels\xF6 1",\n    ["torso_2"] = "Fels\xF6 2",\n    ["decals_1"] = "Matrica 1",\n    ["decals_2"] = "Matrica 2",\n    ["arms"] = "Kezek",\n    ["arms_2"] = "Kezek 2",\n    ["pants_1"] = "Nadr\xE1g 1",\n    ["pants_2"] = "Nadr\xE1g 2",\n    ["shoes_1"] = "Cip\xF6 1",\n    ["shoes_2"] = "Cip\xF6 2",\n    ["mask_1"] = "Maszk 1",\n    ["mask_2"] = "Maszk 2",\n    ["bproof_1"] = "Goly\xF3\xE1ll\xF3mell\xE9ny 1",\n    ["bproof_2"] = "Goly\xF3\xE1ll\xF3mell\xE9ny 2",\n    ["chain_1"] = "L\xE1nc 1",\n    ["chain_2"] = "L\xE1nc 2",\n    ["helmet_1"] = "Sisak 1",\n    ["helmet_2"] = "Sisak 2",\n    ["watches_1"] = "\xD3ra 1",\n    ["watches_2"] = "\xD3ra 2",\n    ["bracelets_1"] = "Kark\xF6t\xF6 1",\n    ["bracelets_2"] = "Kark\xF6t\xF6 2",\n    ["glasses_1"] = "Szem\xFCveg 1",\n    ["glasses_2"] = "Szem\xFCveg 2",\n    ["bag"] = "T\xE1ska",\n    ["bag_color"] = "T\xE1ska szine",\n    ["blemishes"] = "Foltok",\n    ["blemishes_size"] = "Foltok er\u0151ss\xE9ge",\n    ["ageing"] = "\xD6reged\xE9s",\n    ["ageing_1"] = "\xD6reged\xE9s er\u0151ss\xE9ge",\n    ["blush"] = "B\u0151rp\xEDr",\n    ["blush_1"] = "B\u0151rp\xEDr er\u0151ss\xE9ge",\n    ["blush_color"] = "B\u0151rp\xEDr sz\xEDne",\n    ["complexion"] = "Arcsz\xEDn",\n    ["complexion_1"] = "Arcsz\xEDn er\u0151ss\xE9ge",\n    ["sun"] = "Nap",\n    ["sun_1"] = "Nap er\u0151ss\xE9ge",\n    ["freckles"] = "Szepl\u0151k",\n    ["freckles_1"] = "Szepl\u0151k er\u0151ss\xE9ge",\n    ["chest_hair"] = "Mellsz\u0151r",\n    ["chest_hair_1"] = "Mellsz\u0151r er\u0151ss\xE9ge",\n    ["chest_color"] = "Mellsz\u0151r sz\xEDne",\n    ["bodyb"] = "B\u0151rhib\xE1k",\n    ["bodyb_size"] = "B\u0151rhib\xE1k er\u0151ss\xE9ge",\n    ["bodyb_extra"] = "Foltos testhat\xE1s",\n    ["bodyb_extra_thickness"] = "Foltos testhat\xE1s vastags\xE1ga",\n}\n'
        },
        {
          "path": "locales/it.lua",
          "source": `Locales["it"] = {
    ["sex"] = "sesso",
    ["mom"] = "viso donna",
    ["dad"] = "viso uomo",
    ["resemblance"] = "somiglianze",
    ["skin_tone"] = "tono della pelle",
    ["nose_1"] = "larghezza del naso",
    ["nose_2"] = "altezza della punta del naso",
    ["nose_3"] = "lunghezza della punta del naso",
    ["nose_4"] = "altezza dell'osso del naso",
    ["nose_5"] = "abbassamento della punta del naso",
    ["nose_6"] = "torsione dell'osso del naso",
    ["cheeks_1"] = "altezza degli zigomi",
    ["cheeks_2"] = "larghezza degli zigomi",
    ["cheeks_3"] = "larghezza delle guance",
    ["lip_fullness"] = "spessore delle labbra",
    ["jaw_bone_width"] = "larghezza dell'osso mascellare",
    ["jaw_bone_length"] = "lunghezza dell'osso mascellare",
    ["chin_height"] = "altezza del mento",
    ["chin_length"] = "lunghezza del mento",
    ["chin_width"] = "larghezza del mento",
    ["chin_hole"] = "dimensione del foro del mento",
    ["neck_thickness"] = "spessore del collo",
    ["wrinkles"] = "rughe",
    ["wrinkle_thickness"] = "spessore delle rughe",
    ["beard_type"] = "tipo di barba",
    ["beard_size"] = "dimensione della barba",
    ["beard_color_1"] = "colore della barba 1",
    ["beard_color_2"] = "colore della barba 2",
    ["hair_1"] = "capelli 1",
    ["hair_2"] = "capelli 2",
    ["hair_color_1"] = "colore capelli 1",
    ["hair_color_2"] = "colore capelli 2",
    ["eye_color"] = "colore degli occhi",
    ["eye_squint"] = "strabismo degli occhi",
    ["eyebrow_type"] = "tipo di sopracciglio",
    ["eyebrow_size"] = "dimensione delle sopracciglia",
    ["eyebrow_color_1"] = "colore delle sopracciglia 1",
    ["eyebrow_color_2"] = "colore delle sopracciglia 2",
    ["eyebrow_depth"] = "profondit\xE0 delle sopracciglia",
    ["eyebrow_height"] = "altezza del sopracciglio",
    ["makeup_type"] = "tipo di trucco",
    ["makeup_thickness"] = "spessore del trucco",
    ["makeup_color_1"] = "colore del trucco 1",
    ["makeup_color_2"] = "colore del trucco 2",
    ["lipstick_type"] = "tipo di rossetto",
    ["lipstick_thickness"] = "spessore del rossetto",
    ["lipstick_color_1"] = "colore del rossetto 1",
    ["lipstick_color_2"] = "colore del rossetto 2",
    ["ear_accessories"] = "accessori per le orecchie",
    ["ear_accessories_color"] = "colore accessori orecchie",
    ["tshirt_1"] = "t-Shirt 1",
    ["tshirt_2"] = "t-Shirt 2",
    ["torso_1"] = "torso 1",
    ["torso_2"] = "torso 2",
    ["decals_1"] = "decals 1",
    ["decals_2"] = "decals 2",
    ["arms"] = "braccia",
    ["arms_2"] = "braccia 2",
    ["pants_1"] = "pantaloni",
    ["pants_2"] = "colore pantaloni",
    ["shoes_1"] = "scarpe",
    ["shoes_2"] = "colore scarpe",
    ["mask_1"] = "maschera 1",
    ["mask_2"] = "maschera 2",
    ["bproof_1"] = "giubbotto antiproiettile 1",
    ["bproof_2"] = "giubbotto antiproiettile2",
    ["chain_1"] = "collana 1",
    ["chain_2"] = "collana 2",
    ["helmet_1"] = "casco 1",
    ["helmet_2"] = "casco 2",
    ["watches_1"] = "orologi 1",
    ["watches_2"] = "orologi 2",
    ["bracelets_1"] = "bracciali 1",
    ["bracelets_2"] = "bracciali 2",
    ["glasses_1"] = "occhiali 1",
    ["glasses_2"] = "occhiali 2",
    ["bag"] = "zaino",
    ["bag_color"] = "colore zaino",
    ["blemishes"] = "imperfezioni",
    ["blemishes_size"] = "pessore delle imperfezioni",
    ["ageing"] = "invecchiamento pelle",
    ["ageing_1"] = "spessore invecchiamento",
    ["blush"] = "arrossimento",
    ["blush_1"] = "spessore del rossore",
    ["blush_color"] = "colore rossore",
    ["complexion"] = "carnagione",
    ["complexion_1"] = "spessore della carnagione",
    ["sun"] = "lentiggini",
    ["sun_1"] = "spessore lentiggini",
    ["freckles"] = "lentiggini",
    ["freckles_1"] = "spessore delle lentiggini",
    ["chest_hair"] = "peli del petto",
    ["chest_hair_1"] = "spessore dei peli del torace",
    ["chest_color"] = "colore dei peli del petto",
    ["bodyb"] = "inestetismi del corpo",
    ["bodyb_size"] = "spessore delle imperfezioni",
    ["bodyb_extra"] = "inestetismi del corpo extra",
    ["bodyb_extra_thickness"] = "inestetismi del corpo spessore",
}
`
        },
        {
          "path": "locales/nl.lua",
          "source": 'Locales["nl"] = {\n    ["sex"] = "geslacht",\n    ["mom"] = "gezicht moeder",\n    ["dad"] = "gezicht vader",\n    ["resemblance"] = "gelijkenis",\n    ["skin_tone"] = "huidskleur",\n    ["nose_1"] = "neusbreedte",\n    ["nose_2"] = "neuspiek hoogte",\n    ["nose_3"] = "neuspiek lengte",\n    ["nose_4"] = "neusbeen hoogte",\n    ["nose_5"] = "neusbeen verlaging",\n    ["nose_6"] = "neusbeen verdraaiing",\n    ["cheeks_1"] = "jukbeenderen hoogte",\n    ["cheeks_2"] = "jukbeenderen breedte",\n    ["cheeks_3"] = "wangen breedte",\n    ["lip_fullness"] = "lipvolheid",\n    ["jaw_bone_width"] = "kaakbeen breedte",\n    ["jaw_bone_length"] = "kaakbeen lengte",\n    ["chin_height"] = "kin hoogte",\n    ["chin_length"] = "kin lengte",\n    ["chin_width"] = "kin breedte",\n    ["chin_hole"] = "grootte van het kin-gat",\n    ["neck_thickness"] = "nek dikte",\n    ["wrinkles"] = "rimpels",\n    ["wrinkle_thickness"] = "rimpels dikte",\n    ["beard_type"] = "baard type",\n    ["beard_size"] = "baard grootte",\n    ["beard_color_1"] = "baard kleur 1",\n    ["beard_color_2"] = "baard kleur 2",\n    ["hair_1"] = "haar 1",\n    ["hair_2"] = "haar 2",\n    ["hair_color_1"] = "haar kleur 1",\n    ["hair_color_2"] = "haar kleur 2",\n    ["eye_color"] = "oogkleur",\n    ["eye_squint"] = "oog scheelte",\n    ["eyebrow_type"] = "wenkbrauw type",\n    ["eyebrow_size"] = "wenkbrauw formaat",\n    ["eyebrow_color_1"] = "wenkbrauw kleur 1",\n    ["eyebrow_color_2"] = "wenkbrauw kleur 2",\n    ["eyebrow_depth"] = "wenkbrauw diepte",\n    ["eyebrow_height"] = "wenkbrauw hoogte",\n    ["makeup_type"] = "makeup type",\n    ["makeup_thickness"] = "makeup dikte",\n    ["makeup_color_1"] = "makeup kleur 1",\n    ["makeup_color_2"] = "makeup kleur 2",\n    ["lipstick_type"] = "lippenstift type",\n    ["lipstick_thickness"] = "lippenstift dikte",\n    ["lipstick_color_1"] = "lippenstift kleur 1",\n    ["lipstick_color_2"] = "lippenstift kleur 2",\n    ["ear_accessories"] = "ooraccessoires",\n    ["ear_accessories_color"] = "ooraccessoires kleur",\n    ["tshirt_1"] = "t-shirt 1",\n    ["tshirt_2"] = "t-shirt 2",\n    ["torso_1"] = "vest 1",\n    ["torso_2"] = "vest 2",\n    ["decals_1"] = "stickers 1",\n    ["decals_2"] = "stickers 2",\n    ["arms"] = "armen",\n    ["arms_2"] = "armen 2",\n    ["pants_1"] = "broek 1",\n    ["pants_2"] = "broek 2",\n    ["shoes_1"] = "shoenen 1",\n    ["shoes_2"] = "shoenen 2",\n    ["mask_1"] = "masker 1",\n    ["mask_2"] = "masker 2",\n    ["bproof_1"] = "kogelvrij vest 1",\n    ["bproof_2"] = "kogelvrij vest 2",\n    ["chain_1"] = "ketting 1",\n    ["chain_2"] = "ketting 2",\n    ["helmet_1"] = "helm 1",\n    ["helmet_2"] = "helm 2",\n    ["watches_1"] = "horloge 1",\n    ["watches_2"] = "horloge 2",\n    ["bracelets_1"] = "armband(en) 1",\n    ["bracelets_2"] = "armband(en) 2",\n    ["glasses_1"] = "bril 1",\n    ["glasses_2"] = "bril 2",\n    ["bag"] = "rugzak",\n    ["bag_color"] = "rugzak kleur",\n    ["blemishes"] = "vlekken",\n    ["blemishes_size"] = "vlekken dikte",\n    ["ageing"] = "veroudering",\n    ["ageing_1"] = "veroudering zichtbaarheid",\n    ["blush"] = "blozen",\n    ["blush_1"] = "blozen zichtbaarheid",\n    ["blush_color"] = "blozen kleur",\n    ["complexion"] = "gelaatskleur",\n    ["complexion_1"] = "gelaatskleur 1",\n    ["sun"] = "zon",\n    ["sun_1"] = "zon dikte",\n    ["freckles"] = "sproeten",\n    ["freckles_1"] = "sproeten dikte",\n    ["chest_hair"] = "borsthaar",\n    ["chest_hair_1"] = "borsthaar dikte",\n    ["chest_color"] = "borsthaar kleur",\n    ["bodyb"] = "lichaamsvlekken",\n    ["bodyb_size"] = "lichaamsvlekken zichtbaarheid",\n    ["bodyb_extra"] = "lichaamsvlekken effect",\n    ["bodyb_extra_thickness"] = "lichaamsvlekken effect zichtbaarheid",\n}\n'
        },
        {
          "path": "locales/pl.lua",
          "source": 'Locales["pl"] = {\n    ["sex"] = "p\u0142e\u0107",\n    ["mom"] = "twarz matki",\n    ["dad"] = "twarz ojca",\n    ["resemblance"] = "podobie\u0144stwo",\n    ["skin_tone"] = "kolor sk\xF3ry",\n    ["nose_1"] = "szeroko\u015B\u0107 nosa",\n    ["nose_2"] = "nose peak height",\n    ["nose_3"] = "wysoko\u015B\u0107 szczytu nosa",\n    ["nose_4"] = "wysoko\u015B\u0107 ko\u015Bci nosa",\n    ["nose_5"] = "obni\u017Cenie szczytu nosa",\n    ["nose_6"] = "skr\u0119cenie ko\u015Bci nosa",\n    ["cheeks_1"] = "wysoko\u015B\u0107 ko\u015Bci policzkowych",\n    ["cheeks_2"] = "szeroko\u015B\u0107 ko\u015Bci policzkowych",\n    ["cheeks_3"] = "szeroko\u015B\u0107 policzk\xF3w",\n    ["lip_fullness"] = "pe\u0142ne usta",\n    ["jaw_bone_width"] = "szeroko\u015B\u0107 ko\u015Bci szcz\u0119ki",\n    ["jaw_bone_length"] = "d\u0142ugo\u015B\u0107 ko\u015Bci szcz\u0119ki",\n    ["chin_height"] = "wysoko\u015B\u0107 podbr\xF3dka",\n    ["chin_length"] = "d\u0142ugo\u015B\u0107 podbr\xF3dka",\n    ["chin_width"] = "szeroko\u015B\u0107 podbr\xF3dka",\n    ["chin_hole"] = "rozmiar dziury w podbr\xF3dku",\n    ["neck_thickness"] = "grubo\u015B\u0107 szyi",\n    ["face"] = "twarz",\n    ["skin"] = "sk\xF3ra",\n    ["wrinkles"] = "zmarszczki",\n    ["wrinkle_thickness"] = "wielko\u015B\u0107 zmarszczek",\n    ["beard_type"] = "styl brody",\n    ["beard_size"] = "wielko\u015B\u0107 brody",\n    ["beard_color_1"] = "kolor brody 1",\n    ["beard_color_2"] = "kolor brody 2",\n    ["hair_1"] = "w\u0142osy 1",\n    ["hair_2"] = "w\u0142osy 2",\n    ["hair_color_1"] = "kolor w\u0142os\xF3w 1",\n    ["hair_color_2"] = "kolor w\u0142os\xF3w 2",\n    ["eye_color"] = "kolor oczu",\n    ["eye_squint"] = "zmru\u017Cenie oczu",\n    ["eyebrow_type"] = "styl brwi",\n    ["eyebrow_size"] = "wielko\u015B\u0107 brwi",\n    ["eyebrow_color_1"] = "kolor brwi 1",\n    ["eyebrow_color_2"] = "kolor brwi 2",\n    ["eyebrow_depth"] = "g\u0142\u0119boko\u015B\u0107 brwi",\n    ["eyebrow_height"] = "wysoko\u015B\u0107 brwi",\n    ["makeup_type"] = "styl makija\u017Cu",\n    ["makeup_thickness"] = "grubo\u015B\u0107 makija\u017Cu",\n    ["makeup_color_1"] = "kolor makija\u017Cu 1",\n    ["makeup_color_2"] = "kolor makija\u017Cu 2",\n    ["lipstick_type"] = "styl szminki",\n    ["lipstick_thickness"] = "grubo\u015B\u0107 szminki",\n    ["lipstick_color_1"] = "kolor szminki 1",\n    ["lipstick_color_2"] = "kolor szminki 2",\n    ["ear_accessories"] = "akcesoria do uszu",\n    ["ear_accessories_color"] = "kolor akcesorii do uszu",\n    ["tshirt_1"] = "koszulka 1",\n    ["tshirt_2"] = "koszulka 2",\n    ["torso_1"] = "tu\u0142\xF3w 1",\n    ["torso_2"] = "tu\u0142\xF3w 2",\n    ["decals_1"] = "detale 1",\n    ["decals_2"] = "detale 2",\n    ["arms"] = "ramiona",\n    ["arms_2"] = "ramiona 2",\n    ["pants_1"] = "spodnie 1",\n    ["pants_2"] = "spodnie 2",\n    ["shoes_1"] = "buty 1",\n    ["shoes_2"] = "buty 2",\n    ["mask_1"] = "maska 1",\n    ["mask_2"] = "maska 2",\n    ["bproof_1"] = "kamizelka kuloodporna 1",\n    ["bproof_2"] = "kamizelka kuloodporna 2",\n    ["chain_1"] = "\u0142a\u0144cuch 1",\n    ["chain_2"] = "\u0142a\u0144cuch 2",\n    ["helmet_1"] = "he\u0142m 1",\n    ["helmet_2"] = "he\u0142m 2",\n    ["watches_1"] = "zegarek 1",\n    ["watches_2"] = "zegarek 2",\n    ["bracelets_1"] = "bransoletka 1",\n    ["bracelets_2"] = "bransoletka 2",\n    ["glasses_1"] = "okulary 1",\n    ["glasses_2"] = "okulary 2",\n    ["bag"] = "torba",\n    ["bag_color"] = "kolor torby",\n    ["blemishes"] = "skazy",\n    ["blemishes_size"] = "wielko\u015B\u0107 skaz",\n    ["ageing"] = "starzenie",\n    ["ageing_1"] = "wielko\u015B\u0107 starzenia",\n    ["blush"] = "rumie\u0144ce",\n    ["blush_1"] = "grubo\u015B\u0107 rumieni",\n    ["blush_color"] = "kolor rumieni",\n    ["complexion"] = "cera",\n    ["complexion_1"] = "rodzaj cery",\n    ["sun"] = "opalenie",\n    ["sun_1"] = "wielko\u015B\u0107 opalenia",\n    ["freckles"] = "piegi",\n    ["freckles_1"] = "rodzaj pieg\xF3w",\n    ["chest_hair"] = "w\u0142osy na klacie",\n    ["chest_hair_1"] = "ilo\u015B\u0107 w\u0142os\xF3w na klacie",\n    ["chest_color"] = "kolor w\u0142os\xF3w na klacie",\n    ["bodyb"] = "skazy cia\u0142a",\n    ["bodyb_size"] = "rodzaj skaz cia\u0142a",\n    ["bodyb_extra"] = "efekt skaz cia\u0142a",\n    ["bodyb_extra_thickness"] = "wielko\u015B\u0107 skaz cia\u0142a",\n}\n'
        },
        {
          "path": "locales/pt.lua",
          "source": 'Locales["pt"] = {\n    ["sex"] = "sexo",\n    ["mom"] = "cara da m\xE3e",\n    ["dad"] = "cara do pai",\n    ["resemblance"] = "semelhan\xE7as",\n    ["skin_tone"] = "tom de pele",\n    ["nose_1"] = "largura do nariz",\n    ["nose_2"] = "altura da ponta do nariz",\n    ["nose_3"] = "tamanho da ponta do nariz",\n    ["nose_4"] = "altura do nariz",\n    ["nose_5"] = "reduzir ponta do nariz",\n    ["nose_6"] = "torcer o nariz",\n    ["cheeks_1"] = "altura das ma\xE7\xE3s do rosto",\n    ["cheeks_2"] = "largura das ma\xE7\xE3s do rosto",\n    ["cheeks_3"] = "largura das bochechas",\n    ["lip_fullness"] = "preenchimento labial",\n    ["jaw_bone_width"] = "largura do maxilar",\n    ["jaw_bone_length"] = "comprimento do maxilar",\n    ["chin_height"] = "altura do queixo",\n    ["chin_length"] = "comprimento do queixo",\n    ["chin_width"] = "largura do queixo",\n    ["chin_hole"] = "tamanho do buraco do queixo",\n    ["neck_thickness"] = "espessura do pesco\xE7o",\n    ["wrinkles"] = "rugas",\n    ["wrinkle_thickness"] = "espessura das rugas",\n    ["beard_type"] = "tipo de barba",\n    ["beard_size"] = "tamanho da barba",\n    ["beard_color_1"] = "cor da barba 1",\n    ["beard_color_2"] = "cor da barba 2",\n    ["hair_1"] = "cabelo 1",\n    ["hair_2"] = "cabelo 2",\n    ["hair_color_1"] = "cor do cabelo 1",\n    ["hair_color_2"] = "cor do cabelo 2",\n    ["eye_color"] = "cor dos olhos",\n    ["eye_squint"] = "estrabismo",\n    ["eyebrow_type"] = "tipo de sobrancelha",\n    ["eyebrow_size"] = "tamanho da sobrancelha",\n    ["eyebrow_color_1"] = "cor da sobrancelha 1",\n    ["eyebrow_color_2"] = "cor da sobrancelha 2",\n    ["eyebrow_depth"] = "profundidade da sobrancelha",\n    ["eyebrow_height"] = "altura da sobrancelha",\n    ["makeup_type"] = "tipo de maquiagem",\n    ["makeup_thickness"] = "espessura da maquiagem",\n    ["makeup_color_1"] = "cor da maquiagem 1",\n    ["makeup_color_2"] = "cor da maquiagem 2",\n    ["lipstick_type"] = "tipo de batom",\n    ["lipstick_thickness"] = "espessura do batom",\n    ["lipstick_color_1"] = "cor do batom 1",\n    ["lipstick_color_2"] = "cor do batom 2",\n    ["ear_accessories"] = "acess\xF3rios de ouvido",\n    ["ear_accessories_color"] = "cor dos acess\xF3rios de ouvido",\n    ["tshirt_1"] = "t-Shirt 1",\n    ["tshirt_2"] = "t-Shirt 2",\n    ["torso_1"] = "casaco 1",\n    ["torso_2"] = "casaco 2",\n    ["decals_1"] = "autocolantes 1",\n    ["decals_2"] = "autocolantes 2",\n    ["arms"] = "bra\xE7os",\n    ["arms_2"] = "bra\xE7os 2",\n    ["pants_1"] = "cal\xE7as 1",\n    ["pants_2"] = "cal\xE7as 2",\n    ["shoes_1"] = "sapatos 1",\n    ["shoes_2"] = "sapatos 2",\n    ["mask_1"] = "m\xE1scara 1",\n    ["mask_2"] = "m\xE1scara 2",\n    ["bproof_1"] = "colete 1",\n    ["bproof_2"] = "colete 2",\n    ["chain_1"] = "colar 1",\n    ["chain_2"] = "colar 2",\n    ["helmet_1"] = "capacete 1",\n    ["helmet_2"] = "capacete 2",\n    ["watches_1"] = "rel\xF3gio 1",\n    ["watches_2"] = "rel\xF3gio 2",\n    ["bracelets_1"] = "pulseiras 1",\n    ["bracelets_2"] = "pulseiras 2",\n    ["glasses_1"] = "\xF3culos 1",\n    ["glasses_2"] = "\xF3culos 2",\n    ["bag"] = "mochila",\n    ["bag_color"] = "cor da mochila",\n    ["blemishes"] = "manchas",\n    ["blemishes_size"] = "espessura de manchas",\n    ["ageing"] = "envelhecimento",\n    ["ageing_1"] = "espessura de envelhecimento",\n    ["blush"] = "corar",\n    ["blush_1"] = "espessura do blush",\n    ["blush_color"] = "cor de blush",\n    ["complexion"] = "apar\xEAncia",\n    ["complexion_1"] = "apar\xEAncia 2",\n    ["sun"] = "sol",\n    ["sun_1"] = "espessura do sol",\n    ["freckles"] = "sardas",\n    ["freckles_1"] = "espessura das sardas",\n    ["chest_hair"] = "pelos no peito",\n    ["chest_hair_1"] = "espessura dos pelos do peito",\n    ["chest_color"] = "cor dos pelos dos peitos",\n    ["bodyb"] = "manchas no corpo",\n    ["bodyb_size"] = "espessura das manchas no corpo",\n    ["bodyb_extra"] = "extra das manchas no corpo",\n    ["bodyb_extra_thickness"] = "cor do extra das manchas no corpo",\n}\n'
        },
        {
          "path": "locales/sl.lua",
          "source": `Locales["sl"] = {
    ["sex"] = "Spol",
    ["mom"] = "mom's face",
    ["dad"] = "dad's face",
    ["resemblance"] = "resemblance",
    ["skin_tone"] = "skin tone",
    ["nose_1"] = "nose width",
    ["nose_2"] = "nose peak height",
    ["nose_3"] = "nose peak length",
    ["nose_4"] = "nose bone height",
    ["nose_5"] = "nose peak lowering",
    ["nose_6"] = "nose bone twist",
    ["cheeks_1"] = "cheekbones height",
    ["cheeks_2"] = "cheekbones width",
    ["cheeks_3"] = "cheeks width",
    ["lip_fullness"] = "lip fullness",
    ["jaw_bone_width"] = "jaw bone width",
    ["jaw_bone_length"] = "jaw bone length",
    ["chin_height"] = "chin height",
    ["chin_length"] = "chin length",
    ["chin_width"] = "chin width",
    ["chin_hole"] = "chin hole size",
    ["neck_thickness"] = "neck thickness",
    ["wrinkles"] = "wrinkles",
    ["wrinkle_thickness"] = "wrinkle thickness",
    ["beard_type"] = "beard type",
    ["beard_size"] = "beard size",
    ["beard_color_1"] = "beard color 1",
    ["beard_color_2"] = "beard color 2",
    ["hair_1"] = "hair 1",
    ["hair_2"] = "hair 2",
    ["hair_color_1"] = "hair color 1",
    ["hair_color_2"] = "hair color 2",
    ["eye_color"] = "eye color",
    ["eye_squint"] = "eye squint",
    ["eyebrow_type"] = "eyebrow type",
    ["eyebrow_size"] = "eyebrow size",
    ["eyebrow_color_1"] = "eyebrow color 1",
    ["eyebrow_color_2"] = "eyebrow color 2",
    ["eyebrow_depth"] = "eyebrow depth",
    ["eyebrow_height"] = "eyebrow height",
    ["makeup_type"] = "makeup type",
    ["makeup_thickness"] = "makeup thickness",
    ["makeup_color_1"] = "makeup color 1",
    ["makeup_color_2"] = "makeup color 2",
    ["lipstick_type"] = "lipstick type",
    ["lipstick_thickness"] = "lipstick thickness",
    ["lipstick_color_1"] = "lipstick color 1",
    ["lipstick_color_2"] = "lipstick color 2",
    ["ear_accessories"] = "ear accessories",
    ["ear_accessories_color"] = "ear accessories color",
    ["tshirt_1"] = "t-Shirt 1",
    ["tshirt_2"] = "t-Shirt 2",
    ["torso_1"] = "torso 1",
    ["torso_2"] = "torso 2",
    ["decals_1"] = "decals 1",
    ["decals_2"] = "decals 2",
    ["arms"] = "arms",
    ["arms_2"] = "arms 2",
    ["pants_1"] = "pants 1",
    ["pants_2"] = "pants 2",
    ["shoes_1"] = "shoes 1",
    ["shoes_2"] = "shoes 2",
    ["mask_1"] = "mask 1",
    ["mask_2"] = "mask 2",
    ["bproof_1"] = "bulletproof vest 1",
    ["bproof_2"] = "bulletproof vest 2",
    ["chain_1"] = "chain 1",
    ["chain_2"] = "chain 2",
    ["helmet_1"] = "helmet 1",
    ["helmet_2"] = "helmet 2",
    ["watches_1"] = "watches 1",
    ["watches_2"] = "watches 2",
    ["bracelets_1"] = "bracelets 1",
    ["bracelets_2"] = "bracelets 2",
    ["glasses_1"] = "glasses 1",
    ["glasses_2"] = "glasses 2",
    ["bag"] = "bag",
    ["bag_color"] = "bag color",
    ["blemishes"] = "blemishes",
    ["blemishes_size"] = "blemishes thickness",
    ["ageing"] = "ageing",
    ["ageing_1"] = "ageing thickness",
    ["blush"] = "blush",
    ["blush_1"] = "blush thickness",
    ["blush_color"] = "blush color",
    ["complexion"] = "complexion",
    ["complexion_1"] = "complexion thickness",
    ["sun"] = "sun",
    ["sun_1"] = "sun thickness",
    ["freckles"] = "freckles",
    ["freckles_1"] = "freckles thickness",
    ["chest_hair"] = "chest hair",
    ["chest_hair_1"] = "chest hair thickness",
    ["chest_color"] = "chest hair color",
    ["bodyb"] = "body blemishes",
    ["bodyb_size"] = "body blemishes thickness",
    ["bodyb_extra"] = "blemishes body effect",
    ["bodyb_extra_thickness"] = "blemishes body effect thickness",
}
`
        },
        {
          "path": "locales/sr.lua",
          "source": 'Locales["sr"] = {\n    ["sex"] = "pol",\n    ["mom"] = "mamina faca",\n    ["dad"] = "tatina faca",\n    ["resemblance"] = "sli\u010Dnost",\n    ["skin_tone"] = "ten",\n    ["nose_1"] = "\u0161irina nosa",\n    ["nose_2"] = "visina vrha nosa",\n    ["nose_3"] = "du\u017Eina vrha nosa",\n    ["nose_4"] = "visina nosne kosti",\n    ["nose_5"] = "spu\u0161tanje vrha nosa",\n    ["nose_6"] = "uvrtanje nosne kosti",\n    ["cheeks_1"] = "visina jagodica",\n    ["cheeks_2"] = "\u0161irina jagodica",\n    ["cheeks_3"] = "\u0161irina obraza",\n    ["lip_fullness"] = "puno\u0107a usana",\n    ["jaw_bone_width"] = "\u0161irina kostiju vilice",\n    ["jaw_bone_length"] = "du\u017Eina kostiju vilice",\n    ["chin_height"] = "visina brade",\n    ["chin_length"] = "du\u017Eina brade",\n    ["chin_width"] = "\u0161irina brade",\n    ["chin_hole"] = "veli\u010Dina rupe za bradu",\n    ["neck_thickness"] = "debljina vrata",\n    ["wrinkles"] = "bore",\n    ["wrinkle_thickness"] = "debljina bora",\n    ["beard_type"] = "tip brade",\n    ["beard_size"] = "veli\u010Dina brade",\n    ["beard_color_1"] = "boja brade 1",\n    ["beard_color_2"] = "boja brade 2",\n    ["hair_1"] = "kosa 1",\n    ["hair_2"] = "kosa 2",\n    ["hair_color_1"] = "boja kose 1",\n    ["hair_color_2"] = "boja kose 2",\n    ["eye_color"] = "boja o\u010Diju",\n    ["eye_squint"] = "ra\u0161irenost oka",\n    ["eyebrow_type"] = "tip obrva",\n    ["eyebrow_size"] = "veli\u010Dina obrva",\n    ["eyebrow_color_1"] = "boja obrva 1",\n    ["eyebrow_color_2"] = "boja obrva 2",\n    ["eyebrow_depth"] = "dubina obrva",\n    ["eyebrow_height"] = "visina obrva",\n    ["makeup_type"] = "\u0161minka",\n    ["makeup_thickness"] = "debljina \u0161minke",\n    ["makeup_color_1"] = "boja \u0161minke 1",\n    ["makeup_color_2"] = "boja \u0161minke 2",\n    ["lipstick_type"] = "tip karmina",\n    ["lipstick_thickness"] = "debljina karmina",\n    ["lipstick_color_1"] = "boja karmina 1",\n    ["lipstick_color_2"] = "boja karmina 2",\n    ["ear_accessories"] = "nau\u0161nice",\n    ["ear_accessories_color"] = "boja nau\u0161nica",\n    ["tshirt_1"] = "majica ",\n    ["tshirt_2"] = "boja majice",\n    ["torso_1"] = "gornjak",\n    ["torso_2"] = "boja gornjaka",\n    ["decals_1"] = "detalji",\n    ["decals_2"] = "boja detalja",\n    ["arms"] = "ruke",\n    ["arms_2"] = "boja rukavica",\n    ["pants_1"] = "pantalone",\n    ["pants_2"] = "boja pantalona",\n    ["shoes_1"] = "patike",\n    ["shoes_2"] = "boja patika",\n    ["mask_1"] = "maska",\n    ["mask_2"] = "boja maske",\n    ["bproof_1"] = "pancir",\n    ["bproof_2"] = "boja pancira",\n    ["chain_1"] = "lanac",\n    ["chain_2"] = "boja lanca",\n    ["helmet_1"] = "kaciga",\n    ["helmet_2"] = "boja kacige",\n    ["watches_1"] = "sat",\n    ["watches_2"] = "boja sata",\n    ["bracelets_1"] = "narukvice",\n    ["bracelets_2"] = "boja narukvice",\n    ["glasses_1"] = "nao\u010Dare",\n    ["glasses_2"] = "boja nao\u010Dara",\n    ["bag"] = "torba",\n    ["bag_color"] = "boja torbe",\n    ["blemishes"] = "mrlje",\n    ["blemishes_size"] = "debljina mrlja",\n    ["ageing"] = "starenje",\n    ["ageing_1"] = "debljina starenja",\n    ["blush"] = "rumenilo",\n    ["blush_1"] = "debljina rumenila",\n    ["blush_color"] = "boja rumenila",\n    ["complexion"] = "ten",\n    ["complexion_1"] = "debljina tena",\n    ["sun"] = "sunce",\n    ["sun_1"] = "debljina sunca",\n    ["freckles"] = "pege",\n    ["freckles_1"] = "debljina pega",\n    ["chest_hair"] = "dlake na grudima",\n    ["chest_hair_1"] = "debljina dlaka na grudima",\n    ["chest_color"] = "boja dlaka na grudima",\n    ["bodyb"] = "mrlje na telu",\n    ["bodyb_size"] = "debljina mrlja na telu",\n    ["bodyb_extra"] = "efekat mrlja na telu",\n    ["bodyb_extra_thickness"] = "mrlje telo efekat debljine",\n}\n'
        },
        {
          "path": "locales/sv.lua",
          "source": 'Locales["sv"] = {\n    ["sex"] = "K\xF6n",\n    ["mom"] = "Mammas ansikte",\n    ["dad"] = "Pappas ansikte",\n    ["resemblance"] = "Likhet",\n    ["skin_tone"] = "Hudton",\n    ["nose_1"] = "N\xE4sbredd",\n    ["nose_2"] = "N\xE4stoppsh\xF6jd",\n    ["nose_3"] = "N\xE4stoppsl\xE4ngd",\n    ["nose_4"] = "N\xE4sbensh\xF6jd",\n    ["nose_5"] = "N\xE4stoppss\xE4nkning",\n    ["nose_6"] = "N\xE4sbensvridning",\n    ["cheeks_1"] = "Kindbens h\xF6jd",\n    ["cheeks_2"] = "Kindbens bredd",\n    ["cheeks_3"] = "Kinder bredd",\n    ["lip_fullness"] = "L\xE4ppfullhet",\n    ["jaw_bone_width"] = "K\xE4kbensbredd",\n    ["jaw_bone_length"] = "K\xE4kbensl\xE4ngd",\n    ["chin_height"] = "Hakh\xF6jd",\n    ["chin_length"] = "Hakl\xE4ngd",\n    ["chin_width"] = "Hakbredd",\n    ["chin_hole"] = "Hakh\xE5lsstorlek",\n    ["neck_thickness"] = "Halstjocklek",\n    ["wrinkles"] = "Rynkor",\n    ["wrinkle_thickness"] = "Rynktjocklek",\n    ["beard_type"] = "Sk\xE4gg typ",\n    ["beard_size"] = "Sk\xE4ggstorlek",\n    ["beard_color_1"] = "Sk\xE4ggf\xE4rg 1",\n    ["beard_color_2"] = "Sk\xE4ggf\xE4rg 2",\n    ["hair_1"] = "H\xE5r 1",\n    ["hair_2"] = "H\xE5r 2",\n    ["hair_color_1"] = "H\xE5rf\xE4rg 1",\n    ["hair_color_2"] = "H\xE5rf\xE4rg 2",\n    ["eye_color"] = "\xD6gonf\xE4rg",\n    ["eye_squint"] = "Kisning",\n    ["eyebrow_type"] = "\xD6gonbryn",\n    ["eyebrow_size"] = "\xD6gonbryns Storlek",\n    ["eyebrow_color_1"] = "\xD6gonbrynsf\xE4rg 1",\n    ["eyebrow_color_2"] = "\xD6gonbrynsf\xE4rg 2",\n    ["eyebrow_depth"] = "\xD6gonbryns djup",\n    ["eyebrow_height"] = "\xD6gonbrynsh\xF6jd",\n    ["makeup_type"] = "Smink",\n    ["makeup_thickness"] = "Sminktjocklek",\n    ["makeup_color_1"] = "Sminkf\xE4rg 1",\n    ["makeup_color_2"] = "Sminkf\xE4rg 2",\n    ["lipstick_type"] = "L\xE4ppstift",\n    ["lipstick_thickness"] = "L\xE4ppstift tjocklek",\n    ["lipstick_color_1"] = "L\xE4ppstift f\xE4rg 1",\n    ["lipstick_color_2"] = "L\xE4ppstift f\xE4rg 2",\n    ["ear_accessories"] = "\xD6rontillbeh\xF6r",\n    ["ear_accessories_color"] = "\xD6rontillbeh\xF6r color",\n    ["tshirt_1"] = "T-Shirt 1",\n    ["tshirt_2"] = "T-Shirt 2",\n    ["torso_1"] = "Jacka 1",\n    ["torso_2"] = "Jacka 2",\n    ["decals_1"] = "Dekaler 1",\n    ["decals_2"] = "Dekaler 2",\n    ["arms"] = "Armar",\n    ["arms_2"] = "Armar 2",\n    ["pants_1"] = "Byxor 1",\n    ["pants_2"] = "Byxor 2",\n    ["shoes_1"] = "Skor 1",\n    ["shoes_2"] = "Skor 2",\n    ["mask_1"] = "Mask 1",\n    ["mask_2"] = "Mask 2",\n    ["bproof_1"] = "Skotts\xE4ker v\xE4st 1",\n    ["bproof_2"] = "Skotts\xE4ker v\xE4st 2",\n    ["chain_1"] = "Kedja 1",\n    ["chain_2"] = "Kedja 2",\n    ["helmet_1"] = "Hj\xE4lm 1",\n    ["helmet_2"] = "Hj\xE4lm 2",\n    ["watches_1"] = "Klockor 1",\n    ["watches_2"] = "Klockor 2",\n    ["bracelets_1"] = "Armband 1",\n    ["bracelets_2"] = "Armband 2",\n    ["glasses_1"] = "Glas\xF6gon 1",\n    ["glasses_2"] = "Glas\xF6gon 2",\n    ["bag"] = "V\xE4ska",\n    ["bag_color"] = "V\xE4skf\xE4rg",\n    ["blemishes"] = "Fl\xE4ckar",\n    ["blemishes_size"] = "Fl\xE4ckar tjocklek",\n    ["ageing"] = "\xC5ldring",\n    ["ageing_1"] = "\xC5ldring tjocklek",\n    ["blush"] = "Rouge",\n    ["blush_1"] = "Rodning tjocklek",\n    ["blush_color"] = "Rouge f\xE4rg",\n    ["complexion"] = "Hy",\n    ["complexion_1"] = "Hy tjocklek",\n    ["sun"] = "Sol",\n    ["sun_1"] = "Soltjocklek",\n    ["freckles"] = "Fr\xE4knar",\n    ["freckles_1"] = "Fr\xE4knar tjocklek",\n    ["chest_hair"] = "Br\xF6sth\xE5r",\n    ["chest_hair_1"] = "Br\xF6sth\xE5r tjocklek",\n    ["chest_color"] = "Br\xF6sth\xE5r f\xE4rg",\n    ["bodyb"] = "Kroppsfl\xE4ckar",\n    ["bodyb_size"] = "Kroppsfl\xE4ckar tjocklek",\n    ["bodyb_extra"] = "Fl\xE4ckar kroppseffekt",\n    ["bodyb_extra_thickness"] = "Fl\xE4ckar kroppseffekt tjocklek",\n}\n'
        },
        {
          "path": "config.lua",
          "source": 'Config = {}\n\nConfig.Locale = GetConvar("esx:locale", "en")\n\nConfig.Components = {\n    {\n        label = TranslateCap("sex"),\n        name = "sex",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 1,\n    },\n    {\n        label = TranslateCap("mom"),\n        name = "mom",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 45,\n    },\n    {\n        label = TranslateCap("dad"),\n        name = "dad",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 44,\n    },\n    {\n        label = TranslateCap("grandparents"),\n        name = "grandparents",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 45,\n    },\n    {\n        label = TranslateCap("resemblance"),\n        name = "face_md_weight",\n        value = 50,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 100,\n    },\n    {\n        label = TranslateCap("resemblance_g"),\n        name = "face_g_weight",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 100,\n    },\n    {\n        label = TranslateCap("skin_tone"),\n        name = "skin_md_weight",\n        value = 50,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 100,\n    },\n    {\n        label = TranslateCap("nose_1"),\n        name = "nose_1",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("nose_2"),\n        name = "nose_2",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("nose_3"),\n        name = "nose_3",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("nose_4"),\n        name = "nose_4",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("nose_5"),\n        name = "nose_5",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("nose_6"),\n        name = "nose_6",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("cheeks_1"),\n        name = "cheeks_1",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("cheeks_2"),\n        name = "cheeks_2",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("cheeks_3"),\n        name = "cheeks_3",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("lip_fullness"),\n        name = "lip_thickness",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("jaw_bone_width"),\n        name = "jaw_1",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("jaw_bone_length"),\n        name = "jaw_2",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("chin_height"),\n        name = "chin_1",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("chin_length"),\n        name = "chin_2",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("chin_width"),\n        name = "chin_3",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("chin_hole"),\n        name = "chin_4",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("neck_thickness"),\n        name = "neck_thickness",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("hair_1"),\n        name = "hair_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 2) - 1\n        end\n    },\n    {\n        label = TranslateCap("hair_2"),\n        name = "hair_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        textureof = "hair_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedTextureVariations(playerPed, 2, Character["hair_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("hair_color_1"),\n        name = "hair_color_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("hair_color_2"),\n        name = "hair_color_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("tshirt_1"),\n        name = "tshirt_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        componentId = 8,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 8) - 1\n        end\n    },\n    {\n        label = TranslateCap("tshirt_2"),\n        name = "tshirt_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        textureof = "tshirt_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedTextureVariations(playerPed, 8, Character["tshirt_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("torso_1"),\n        name = "torso_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        componentId = 11,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 11) - 1\n        end\n    },\n    {\n        label = TranslateCap("torso_2"),\n        name = "torso_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        textureof = "torso_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedTextureVariations(playerPed, 11, Character["torso_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("decals_1"),\n        name = "decals_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        componentId = 10,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 10) - 1\n        end\n    },\n    {\n        label = TranslateCap("decals_2"),\n        name = "decals_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        textureof = "decals_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedTextureVariations(playerPed, 10, Character["decals_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("arms"),\n        name = "arms",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 3) - 1\n        end\n    },\n    {\n        label = TranslateCap("arms_2"),\n        name = "arms_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        max = 10,\n    },\n    {\n        label = TranslateCap("pants_1"),\n        name = "pants_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.8,\n        camOffset = -0.5,\n        componentId = 4,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 4) - 1\n        end\n    },\n    {\n        label = TranslateCap("pants_2"),\n        name = "pants_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.8,\n        camOffset = -0.5,\n        textureof = "pants_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedTextureVariations(playerPed, 4, Character["pants_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("shoes_1"),\n        name = "shoes_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.8,\n        camOffset = -0.8,\n        componentId = 6,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 6) - 1\n        end\n    },\n    {\n        label = TranslateCap("shoes_2"),\n        name = "shoes_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.8,\n        camOffset = -0.8,\n        textureof = "shoes_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedTextureVariations(playerPed, 6, Character["shoes_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("mask_1"),\n        name = "mask_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        componentId = 1,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 1) - 1\n        end\n    },\n    {\n        label = TranslateCap("mask_2"),\n        name = "mask_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        textureof = "mask_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedTextureVariations(playerPed, 1, Character["mask_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("bproof_1"),\n        name = "bproof_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        componentId = 9,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 9) - 1\n        end\n    },\n    {\n        label = TranslateCap("bproof_2"),\n        name = "bproof_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        textureof = "bproof_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedTextureVariations(playerPed, 9, Character["bproof_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("chain_1"),\n        name = "chain_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        componentId = 7,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 7) - 1\n        end\n    },\n    {\n        label = TranslateCap("chain_2"),\n        name = "chain_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        textureof = "chain_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedTextureVariations(playerPed, 7, Character["chain_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("helmet_1"),\n        name = "helmet_1",\n        value = -1,\n        min = -1,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        componentId = 0,\n        max = function(playerPed)\n            return GetNumberOfPedPropDrawableVariations(playerPed, 0) - 1\n        end\n    },\n    {\n        label = TranslateCap("helmet_2"),\n        name = "helmet_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        textureof = "helmet_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedPropTextureVariations(playerPed, 0, Character["helmet_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("glasses_1"),\n        name = "glasses_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        componentId = 1,\n        max = function(playerPed)\n            return GetNumberOfPedPropDrawableVariations(playerPed, 1) - 1\n        end\n    },\n    {\n        label = TranslateCap("glasses_2"),\n        name = "glasses_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.6,\n        camOffset = 0.65,\n        textureof = "glasses_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedPropTextureVariations(playerPed, 1, Character["glasses_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("watches_1"),\n        name = "watches_1",\n        value = -1,\n        min = -1,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        componentId = 6,\n        max = function(playerPed)\n            return GetNumberOfPedPropDrawableVariations(playerPed, 6) - 1\n        end\n    },\n    {\n        label = TranslateCap("watches_2"),\n        name = "watches_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        textureof = "watches_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedPropTextureVariations(playerPed, 6, Character["watches_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("bracelets_1"),\n        name = "bracelets_1",\n        value = -1,\n        min = -1,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        componentId = 7,\n        max = function(playerPed)\n            return GetNumberOfPedPropDrawableVariations(playerPed, 7) - 1\n        end\n    },\n    {\n        label = TranslateCap("bracelets_2"),\n        name = "bracelets_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        textureof = "bracelets_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedPropTextureVariations(playerPed, 7, Character["bracelets_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("bag"),\n        name = "bags_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        componentId = 5,\n        max = function(playerPed)\n            return GetNumberOfPedDrawableVariations(playerPed, 5) - 1\n        end\n    },\n    {\n        label = TranslateCap("bag_color"),\n        name = "bags_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        textureof = "bags_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedTextureVariations(playerPed, 5, Character["bags_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("eye_color"),\n        name = "eye_color",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 31,\n    },\n    {\n        label = TranslateCap("eye_squint"),\n        name = "eye_squint",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("eyebrow_size"),\n        name = "eyebrows_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("eyebrow_type"),\n        name = "eyebrows_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetPedHeadOverlayNum(2) - 1\n        end\n    },\n    {\n        label = TranslateCap("eyebrow_color_1"),\n        name = "eyebrows_3",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("eyebrow_color_2"),\n        name = "eyebrows_4",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("eyebrow_height"),\n        name = "eyebrows_5",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("eyebrow_depth"),\n        name = "eyebrows_6",\n        value = 0,\n        min = -10,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("makeup_type"),\n        name = "makeup_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetPedHeadOverlayNum(4) - 1\n        end\n    },\n    {\n        label = TranslateCap("makeup_thickness"),\n        name = "makeup_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("makeup_color_1"),\n        name = "makeup_3",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("makeup_color_2"),\n        name = "makeup_4",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("lipstick_type"),\n        name = "lipstick_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetPedHeadOverlayNum(8) - 1\n        end\n    },\n    {\n        label = TranslateCap("lipstick_thickness"),\n        name = "lipstick_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("lipstick_color_1"),\n        name = "lipstick_3",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("lipstick_color_2"),\n        name = "lipstick_4",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("ear_accessories"),\n        name = "ears_1",\n        value = -1,\n        min = -1,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        componentId = 2,\n        max = function(playerPed)\n            return GetNumberOfPedPropDrawableVariations(playerPed, 2) - 1\n        end\n    },\n    {\n        label = TranslateCap("ear_accessories_color"),\n        name = "ears_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        textureof = "ears_1",\n        max = function(playerPed, Character)\n            return GetNumberOfPedPropTextureVariations(playerPed, 2, Character["ears_1"]) - 1\n        end\n    },\n    {\n        label = TranslateCap("chest_hair"),\n        name = "chest_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        max = function()\n            return GetPedHeadOverlayNum(10) - 1\n        end\n    },\n    {\n        label = TranslateCap("chest_hair_1"),\n        name = "chest_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        max = 10,\n    },\n    {\n        label = TranslateCap("chest_color"),\n        name = "chest_3",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("bodyb"),\n        name = "bodyb_1",\n        value = -1,\n        min = -1,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        max = function()\n            return GetPedHeadOverlayNum(11) - 1\n        end\n    },\n    {\n        label = TranslateCap("bodyb_size"),\n        name = "bodyb_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.75,\n        camOffset = 0.15,\n        max = 10,\n    },\n    {\n        label = TranslateCap("bodyb_extra"),\n        name = "bodyb_3",\n        value = -1,\n        min = -1,\n        zoomOffset = 0.4,\n        camOffset = 0.15,\n        max = function()\n            return GetPedHeadOverlayNum(12) - 1\n        end\n    },\n    {\n        label = TranslateCap("bodyb_extra_thickness"),\n        name = "bodyb_4",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.15,\n        max = 10,\n    },\n    {\n        label = TranslateCap("wrinkles"),\n        name = "age_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetPedHeadOverlayNum(3) - 1\n        end\n    },\n    {\n        label = TranslateCap("wrinkle_thickness"),\n        name = "age_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("blemishes"),\n        name = "blemishes_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetPedHeadOverlayNum(0) - 1\n        end\n    },\n    {\n        label = TranslateCap("blemishes_size"),\n        name = "blemishes_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("blush"),\n        name = "blush_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetPedHeadOverlayNum(5) - 1\n        end\n    },\n    {\n        label = TranslateCap("blush_1"),\n        name = "blush_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("blush_color"),\n        name = "blush_3",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("complexion"),\n        name = "complexion_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetPedHeadOverlayNum(6) - 1\n        end\n    },\n    {\n        label = TranslateCap("complexion_1"),\n        name = "complexion_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("sun"),\n        name = "sun_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetPedHeadOverlayNum(7) - 1\n        end\n    },\n    {\n        label = TranslateCap("sun_1"),\n        name = "sun_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("freckles"),\n        name = "moles_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetPedHeadOverlayNum(9) - 1\n        end\n    },\n    {\n        label = TranslateCap("freckles_1"),\n        name = "moles_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("beard_type"),\n        name = "beard_1",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetPedHeadOverlayNum(1) - 1\n        end\n    },\n    {\n        label = TranslateCap("beard_size"),\n        name = "beard_2",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = 10,\n    },\n    {\n        label = TranslateCap("beard_color_1"),\n        name = "beard_3",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n    {\n        label = TranslateCap("beard_color_2"),\n        name = "beard_4",\n        value = 0,\n        min = 0,\n        zoomOffset = 0.4,\n        camOffset = 0.65,\n        max = function()\n            return GetNumHairColors() - 1\n        end\n    },\n}\n'
        },
        {
          "path": "client/main.lua",
          "source": `
SkinChanger = {}
SkinChanger._index = SkinChanger

SkinChanger.lastSex = -1
SkinChanger.character = {}
SkinChanger.components = Config.Components

function SkinChanger:RequestModel(model)
    if type(model) == "string" then
        model = joaat(model)
    end

    RequestModel(model)

    while not HasModelLoaded(model) do
        Wait(200)
    end

    return model
end

function SkinChanger:ModelLoaded()
    ClearPedProp(PlayerPedId(), 0)

    if self.loadSkin ~= nil then
        self:ApplySkin(self.loadSkin)
        self.loadSkin = nil
    end

    if self.loadClothes ~= nil then
        self:ApplySkin(self.loadClothes.playerSkin, self.loadClothes.clothesSkin)
        self.loadClothes = nil
    end
end

function SkinChanger:DefaultModel(male, cb)
    local characterModel = male and _cfxbt_mp_m_freemode_01 or _cfxbt_mp_f_freemode_01

    if not IsModelInCdimage(characterModel) or not IsModelValid(characterModel) then
        return
    end
    local model = self:RequestModel(characterModel)

    SetPlayerModel(PlayerId(), model)
    SetPedDefaultComponentVariation(PlayerPedId())

    SetModelAsNoLongerNeeded(model)

    if cb then
        cb()
    end

    self:ModelLoaded()
end

function SkinChanger:MaxValues()
    local playerPed = PlayerPedId()
    local data = {}

    for i = 1, #self.components, 1 do
        local component = self.components[i]
        local max = type(component.max) == "function" and component.max(playerPed, self.character) or component.max
        data[component.name] = max
    end

    return data
end

function SkinChanger:DefaultFromSex(sex, cb)
    if sex == 0 then
        self:DefaultModel(true, cb)
    else
        self:DefaultModel(false, cb)
    end
end

function SkinChanger:LoadSkin(skin, cb)
    local sex = skin["sex"]
    if sex ~= self.lastSex then
        self.loadSkin = skin
        self:DefaultFromSex(sex, cb)

        self.lastSex = sex
    else
        self:ApplySkin(skin)

        if cb ~= nil then
            cb()
        else
            return
        end
    end
end

function SkinChanger:ValidClothes(key)
    local keys = {["sex"] = true, ["mom"] = true, ["dad"] = true, ["face_md_weight"] = true, ["skin_md_weight"] = true, ["nose_1"] = true, ["nose_2"] = true,
    ["nose_3"] = true, ["nose_4"] = true, ["nose_5"] = true, ["nose_6"] = true, ["cheeks_1"] = true, ["cheeks_2"] = true, ["cheeks_3"] = true,
    ["lip_thickness"] = true, ["jaw_1"] = true, ["jaw_2"] = true, ["chin_1"] = true, ["chin_2"] = true, ["chin_3"] = true, ["chin_4"] = true,
    ["neck_thickness"] = true, ["age_1"] = true, ["age_2"] = true, ["eye_color"] = true, ["eye_squint"] = true, ["beard_1"] = true, ["beard_2"] = true,
    ["beard_3"] = true, ["beard_4"] = true, ["hair_1"] = true, ["hair_2"] = true, ["hair_color_1"] = true, ["hair_color_2"] = true, ["eyebrows_1"] = true,
    ["eyebrows_2"] = true, ["eyebrows_3"] = true, ["eyebrows_4"] = true, ["eyebrows_5"] = true, ["eyebrows_6"] = true, ["makeup_1"] = true, ["makeup_2"] = true,
    ["makeup_3"] = true, ["makeup_4"] = true, ["lipstick_1"] = true, ["lipstick_2"] = true, ["lipstick_3"] = true, ["lipstick_4"] = true, ["blemishes_1"] = true,
    ["blemishes_2"] = true, ["blemishes_3"] = true, ["blush_1"] = true, ["blush_2"] = true, ["blush_3"] = true, ["complexion_1"] = true, ["complexion_2"] = true,
    ["sun_1"] = true, ["sun_2"] = true, ["moles_1"] = true, ["moles_2"] = true, ["chest_1"] = true, ["chest_2"] = true, ["chest_3"] = true, ["bodyb_1"] = true,
    ["bodyb_2"] = true, ["bodyb_3"] = true, ["bodyb_4"] = true}
    return keys[key] == nil
end

local function Normalise(weight, divison)
    return (weight / divison) + 0.0
end

function SkinChanger:SetHead()
    local face_weight = Normalise(self.character["face_md_weight"], 100)
    local skin_weight = Normalise(self.character["skin_md_weight"], 100)

    if not self.character["face_g_weight"] then
        self.character["face_g_weight"] = 0
    end

    local third_weight = Normalise(self.character["face_g_weight"], 100)

    if not self.character["grandparents"] then
        self.character["grandparents"] = 0
    end

    SetPedHeadBlendData(self.playerPed,
    self.character["mom"], self.character["dad"], self.character["grandparents"] , self.character["mom"],
    self.character["dad"], self.character["grandparents"], face_weight, skin_weight, third_weight, false)
end

function SkinChanger:SetFace()
    local features = {"nose_1", "nose_2", "nose_3", "nose_4", "nose_5", "nose_6", "eyebrows_5", "eyebrows_6", "cheeks_1", "cheeks_2", "cheeks_3", "eye_squint", "lip_thickness", "jaw_1", "jaw_2", "chin_1", "chin_2", "chin_3", "chin_4", "neck_thickness"}
    for i = 1, #features, 1 do
        local feature = features[i]
        SetPedFaceFeature(self.playerPed, i - 1, Normalise(self.character[feature], 10))
    end
    SetPedEyeColor(self.playerPed, self.character["eye_color"]) -- Eyes color
end

function SkinChanger:SetHeadOverlay()
    local features = {{"blemishes_1", "blemishes_2"}, {"beard_1", "beard_2"}, {"eyebrows_1", "eyebrows_2"}, {"age_1", "age_2"}, {"makeup_1", "makeup_2"}, {"blush_1", "blush_2"}, {"complexion_1", "complexion_2"}, {"sun_1", "sun_2"}, {"lipstick_1", "lipstick_2"}, {"moles_1", "moles_2"}, {"chest_1", "chest_2"}}
    for i = 1, #features, 1 do
        local feature = features[i]
        SetPedHeadOverlay(self.playerPed, i - 1, self.character[feature[1]], Normalise(self.character[feature[2]], 10))
    end
end

function SkinChanger:SetHeadOverlayColour()
    local features = {[1] = {"beard_3", "beard_4"}, [2] = {"eyebrows_3", "eyebrows_4"}, [4] = {"makeup_3", "makeup_4"}, [5] = {"blush_3", 0}, [8] = {"lipstick_3", "lipstick_4"}, [10] = {"chest_3", 0}}
    for i, feature in pairs(features) do
        SetPedHeadOverlayColor(self.playerPed, i, 1, self.character[feature[1]], self.character[feature[2]])
    end
    if self.character["bodyb_1"] == -1 then
        SetPedHeadOverlay(self.playerPed, 11, 255, (self.character["bodyb_2"] / 10) + 0.0) -- Body Blemishes + opacity
    else
        SetPedHeadOverlay(self.playerPed, 11, self.character["bodyb_1"], (self.character["bodyb_2"] / 10) + 0.0)
    end

    if self.character["bodyb_3"] == -1 then
        SetPedHeadOverlay(self.playerPed, 12, 255, (self.character["bodyb_4"] / 10) + 0.0)
    else
        SetPedHeadOverlay(self.playerPed, 12, self.character["bodyb_3"], (self.character["bodyb_4"] / 10) + 0.0) -- Blemishes 'added body effect' + opacity
    end
end

function SkinChanger:SetHair()
    SetPedComponentVariation(self.playerPed, 2, self.character["hair_1"], self.character["hair_2"], 2) -- Hair
    SetPedHairColor(self.playerPed, self.character["hair_color_1"], self.character["hair_color_2"]) -- Hair Color
end

function SkinChanger:SetComponents()
    local components = {{"tshirt_1", "tshirt_2", 8}, {"torso_1", "torso_2", 11}, {"decals_1", "decals_2", 10}, {"arms", "arms_2", 3}, {"pants_1", "pants_2", 4}, {"shoes_1", "shoes_2", 6}, {"mask_1", "mask_2", 1}, {"bproof_1", "bproof_2", 9}, {"chain_1", "chain_2", 7}, {"bags_1", "bags_2", 5}}
    for i = 1, #components, 1 do
        local component = components[i]
        SetPedComponentVariation(self.playerPed, component[3], self.character[component[1]], self.character[component[2]], 2)
    end
end

function SkinChanger:SetProps()
    local props = {{"helmet_1", "helmet_2", 0}, {"glasses_1", "glasses_2", 1}, {"ears_1", "ears_2", 2}, {"watches_1", "watches_2", 6}, {"bracelets_1", "bracelets_2", 7}}
    for i = 1, #props, 1 do
        local prop = props[i]
        local propVal = self.character[prop[1]]
        if propVal == -1 then
            ClearPedProp(self.playerPed, prop[3])
        else
            SetPedPropIndex(self.playerPed, prop[3], propVal, self.character[prop[2]], true)
        end
    end
end

function SkinChanger:ApplySkin(skin, clothes)
    self.playerPed = PlayerPedId()

    for k, v in pairs(skin) do
        self.character[k] = v
    end

    if clothes ~= nil then
        for k, v in pairs(clothes) do
            if self:ValidClothes(k) then
                self.character[k] = v
            end
        end
    end

    self:SetHead()
    self:SetHair()
    self:SetFace()
    self:SetHeadOverlay()
    self:SetHeadOverlayColour()
    self:SetComponents()
    self:SetProps()
    return true
end

function SkinChanger:LoadClothes(playerSkin, clothesSkin)
    local sex = playerSkin["sex"]
    if sex ~= self.lastSex then
        self.loadClothes = {
            playerSkin = playerSkin,
            clothesSkin = clothesSkin,
        }

        self:DefaultFromSex(sex)

        self.lastSex = sex
        return true
    else
        return self:ApplySkin(playerSkin, clothesSkin)
    end
end

function SkinChanger:Change(key, val)
    self.character[key] = val

    if key == "sex" then
        self:LoadSkin(self.character)
    else
        self:ApplySkin(self.character)
    end
end

function SkinChanger:Init()
    for i = 1, #self.components, 1 do
        local component = self.components[i]
        self.character[component.name] = component.value
    end
end

function SkinChanger:GetData(noMax)
    local components = SkinChanger.components
    for k, v in pairs(SkinChanger.character) do
        for i = 1, #components, 1 do
            if k == components[i].name then
                components[i].value = v
            end
        end
    end

    return components, noMax and nil or self:MaxValues()
end

--- exports

exports("GetSkin", function()
    return SkinChanger.character
end)

exports("GetMaxVals", function()
    return SkinChanger:MaxValues()
end)

exports("LoadSkin", function(skin)
    return SkinChanger:LoadSkin(skin)
end)

exports("GetData", function(noMax)
    return SkinChanger:GetData(noMax)
end)

exports("LoadClothes", function(playerSkin, clothesSkin)
    return SkinChanger:LoadClothes(playerSkin, clothesSkin)
end)

exports("Change", function(key, val)
    return SkinChanger:Change(key, val)
end)

--- Events

RegisterNetEvent("skinchanger:loadSkin", function(skin, cb)
    SkinChanger:LoadSkin(skin, cb)
end)

RegisterNetEvent("skinchanger:loadClothes", function(playerSkin, clothesSkin)
    SkinChanger:LoadClothes(playerSkin, clothesSkin)
end)

AddEventHandler("skinchanger:getSkin", function(cb)
    cb(SkinChanger.character)
end)

AddEventHandler("skinchanger:loadDefaultModel", function(loadMale, cb)
    SkinChanger:DefaultModel(loadMale, cb)
end)

AddEventHandler("skinchanger:change", function(key, val)
    SkinChanger:Change(key, val)
end)

AddEventHandler("skinchanger:modelLoaded", function()
    SkinChanger:ModelLoaded()
end)

AddEventHandler("skinchanger:getData", function(cb)
    cb(SkinChanger:GetData())
end)

SkinChanger:Init()
`
        }
      ],
      "uiPage": null,
      "files": [],
      "fileContents": {}
    }
  ]
};

// client/gen/prelude.gen.js
var PRELUDE_SRC = `-- ============ NSM FiveM CLIENT compatibility prelude ============
-- Runs once per Lua VM on the alt:V client (inside the fivem-client
-- resource's JS runtime). Provides the FiveM client-side Lua API surface
-- over a thin JS bridge layer installed by client/core.mjs:
--   __print/__logError, __setTimeoutRes, __native(name, ...),
--   __nativeLookup(name), __netEmitServer(name, json), __netDispatch,
--   __stateChange, __nuiSend/__nuiFocus/__nuiInvokeCb/__nuiRespond,
--   __registerKeybind, __executeCommand, __getConvar, __kvpGet/__kvpSet,
--   __joaat
-- Lua 5.3 compatible (runs on fengari; no FiveM-fork syntax in THIS file:
-- resource scripts are transformed to plain Lua before they get here).

-- ---------- minimal JSON (encode/decode) ----------
local __BS = string.char(92)
local function jstr(s)
  local out = {}
  for i = 1, #s do
    local c = s:sub(i, i)
    local b = string.byte(c)
    if c == '"' then out[#out+1] = __BS .. '"'
    elseif c == __BS then out[#out+1] = __BS .. __BS
    elseif b == 10 then out[#out+1] = __BS .. 'n'
    elseif b == 13 then out[#out+1] = __BS .. 'r'
    elseif b == 9 then out[#out+1] = __BS .. 't'
    elseif b < 32 then out[#out+1] = string.format(__BS .. 'u%04x', b)
    else out[#out+1] = c end
  end
  return '"' .. table.concat(out) .. '"'
end

local function jisArray(t)
  local count, maxk = 0, 0
  for k in pairs(t) do
    if type(k) ~= 'number' or k < 1 or k % 1 ~= 0 then return false end
    count = count + 1
    if k > maxk then maxk = k end
  end
  -- empty tables encode as [] (FiveM json.encode behavior)
  return count == maxk
end

local function jenc(v)
  if v == nil then return 'null' end
  local t = type(v)
  if t == 'boolean' then return tostring(v) end
  if t == 'number' then
    if v % 1 == 0 and math.abs(v) < 2 ^ 53 then return string.format('%d', v) end
    return string.format('%.14g', v)
  end
  if t == 'string' then return jstr(v) end
  if t == 'table' then
    if jisArray(v) then
      local parts = {}
      for i = 1, #v do parts[i] = jenc(v[i]) end
      return '[' .. table.concat(parts, ',') .. ']'
    end
    local parts = {}
    for k, val in pairs(v) do parts[#parts+1] = jstr(tostring(k)) .. ':' .. jenc(val) end
    return '{' .. table.concat(parts, ',') .. '}'
  end
  return 'null'
end

__jsonEncode = function(v) return jenc(v) end

local function skipws(s, i)
  while i <= #s do
    local c = s:sub(i, i)
    if c == ' ' or c == '\\t' or c == '\\n' or c == '\\r' then i = i + 1 else break end
  end
  return i
end

local parseValue

local function parseString(s, i)
  i = i + 1
  local out = {}
  while i <= #s do
    local c = s:sub(i, i)
    if c == '"' then return table.concat(out), i + 1 end
    if c == __BS then
      local e = s:sub(i+1, i+1)
      if e == 'n' then out[#out+1] = '\\n'; i = i + 2
      elseif e == 't' then out[#out+1] = '\\t'; i = i + 2
      elseif e == 'r' then out[#out+1] = '\\r'; i = i + 2
      elseif e == 'u' then
        local hex = s:sub(i+2, i+5)
        local code = tonumber(hex, 16)
        if code and code < 128 then out[#out+1] = string.char(code)
        elseif code then
          -- utf-8 encode (basic plane)
          if code < 2048 then
            out[#out+1] = string.char(192 + math.floor(code / 64), 128 + code % 64)
          else
            out[#out+1] = string.char(224 + math.floor(code / 4096), 128 + math.floor(code / 64) % 64, 128 + code % 64)
          end
        else out[#out+1] = '?' end
        i = i + 6
      else out[#out+1] = e; i = i + 2 end
    else
      out[#out+1] = c; i = i + 1
    end
  end
  return nil, i
end

local function parseNumber(s, i)
  local j = i
  while j <= #s do
    local c = s:sub(j, j)
    if c:match('[%-%+%.eE0-9]') then j = j + 1 else break end
  end
  return tonumber(s:sub(i, j - 1)) or 0, j
end

__JSONNULL = {}  -- sentinel: JSON null inside arrays (Lua can't store nil)

parseValue = function(s, i)
  i = skipws(s, i)
  local c = s:sub(i, i)
  if c == '[' then
    i = skipws(s, i + 1)
    local t = {}
    if s:sub(i, i) == ']' then return t, i + 1 end
    while i <= #s do
      local val, nj = parseValue(s, i)
      if val == nil then val = __JSONNULL end
      t[#t+1] = val
      i = skipws(s, nj)
      local d = s:sub(i, i)
      if d == ',' then i = skipws(s, i + 1)
      elseif d == ']' then return t, i + 1
      else break end
    end
    return t, i
  elseif c == '{' then
    i = skipws(s, i + 1)
    local t = {}
    if s:sub(i, i) == '}' then return t, i + 1 end
    while i <= #s do
      i = skipws(s, i)
      if s:sub(i, i) == '"' then
        local key, ni = parseString(s, i)
        i = skipws(s, ni + 1) -- skip colon
        local val, nj = parseValue(s, i)
        t[key] = val
        i = skipws(s, nj)
      else
        local val, nj = parseValue(s, i)
        t[#t+1] = val
        i = skipws(s, nj)
      end
      local d = s:sub(i, i)
      if d == ',' then i = skipws(s, i + 1)
      elseif d == '}' then return t, i + 1
      else break end
    end
    return t, i
  elseif c == '"' then return parseString(s, i)
  elseif c == 't' then return true, i + 4
  elseif c == 'f' then return false, i + 5
  elseif c == 'n' then return nil, i + 4
  else return parseNumber(s, i) end
end

__jsonDecode = function(s)
  if type(s) ~= 'string' or #s == 0 then return nil end
  local v = parseValue(s, 1)
  return v
end

-- ---------- thread scheduler (same proven pattern as the server) ----------
__coResources = {}

local __schedule
local function __handleYield(co, yielded)
  if coroutine.status(co) ~= 'suspended' then return end
  if yielded == '__cfx_await__' then return end
  if type(yielded) == 'table' and rawget(yielded, '__nsmPromise') ~= nil then
    yielded.__wait(function(...)
      if __coResources[co] == false then return end
      local ok2, y2 = coroutine.resume(co, ...)
      if not ok2 then __logError('[thread] ' .. tostring(y2)) return end
      __handleYield(co, y2)
    end)
    return
  end
  __schedule(co, tonumber(yielded) or 0)
end

__schedule = function(co, delay)
  __setTimeoutRes(__coResources[co], function()
    if __coResources[co] == false then return end
    local ok, yielded = coroutine.resume(co)
    if not ok then
      __logError('[thread] ' .. tostring(yielded))
    else
      __handleYield(co, yielded)
    end
  end, delay or 0)
end

function CreateThread(fn)
  if type(fn) ~= 'function' then return end
  local co = coroutine.create(fn)
  __coResources[co] = __currentResource or nil
  __schedule(co, 0)
end

function CitizenWait(ms) return coroutine.yield(ms or 0) end
Wait = CitizenWait
Citizen = { Wait = CitizenWait, CreateThread = CreateThread }

-- ---------- json / msgpack engine globals (FiveM Lua has these built in) ----------
json = {}
json.encode = __jsonEncode
json.decode = function(s) return __jsonDecode(s) end
json.stringify = json.encode
json.parse = json.decode
msgpack = {}
msgpack.pack = __jsonEncode
msgpack.unpack = function(s) return __jsonDecode(s) end

-- ---------- promises + Citizen.Await (qb-core client TriggerCallback etc.) ----------
-- Same contract as the server prelude: a yielded promise suspends the thread
-- and resolves it from the waiter; matches FiveM's citizen promise library.
promise = {}
function promise.new()
  local p = { state = 'pending', waiters = {} }
  rawset(p, '__nsmPromise', true)
  -- self-aware: callable as p:resolve(v) (qb-core/FiveM method syntax, self
  -- arrives as arg 1) AND as p.resolve(v) / resolve(v) (dot/callback style)
  p.resolve = function(a, ...)
    if p.state ~= 'pending' then return end
    p.state = 'resolved'
    local vals = (a == p) and table.pack(...) or table.pack(a, ...)
    p.values = vals
    p.value = vals.n >= 1 and vals[1] or nil   -- FiveM promise: .value = first
    local ws = p.waiters
    p.waiters = {}
    for i = 1, #ws do ws[i](table.unpack(vals, 1, vals.n)) end
  end
  p.reject = function(a, ...)
    if p.state ~= 'pending' then return end
    p.state = 'rejected'
    local err = (a == p) and select(1, ...) or a
    p.err = err
    local ws = p.waiters
    p.waiters = {}
    for i = 1, #ws do ws[i]() end
  end
  p.__wait = function(fn) table.insert(p.waiters, fn) end
  return p
end

function Citizen.Await(p)
  if type(p) ~= 'table' or rawget(p, '__nsmPromise') == nil then
    error('Citizen.Await: expected a promise (promise.new())', 2)
  end
  if p.state == 'pending' then
    coroutine.yield(p)
  end
  if p.state == 'rejected' then
    error(tostring(p.err), 2)
  end
  local vals = p.values
  if vals == nil then return end
  return table.unpack(vals, 1, vals.n)
end

function SetTimeout(ms, fn)
  local co = coroutine.create(fn)
  __coResources[co] = __currentResource or nil
  __schedule(co, tonumber(ms) or 0)
  return 0
end
function ClearTimeout() end

-- ---------- vectors (FiveM vector3 semantics, table-based) ----------
local vmt
vmt = {
  __add = function(a, b) return vector3(a.x + b.x, a.y + b.y, a.z + b.z) end,
  __sub = function(a, b) return vector3(a.x - b.x, a.y - b.y, a.z - b.z) end,
  __mul = function(a, b)
    if type(a) == 'number' then return vector3(a * b.x, a * b.y, a * b.z) end
    if type(b) == 'number' then return vector3(a.x * b, a.y * b, a.z * b) end
    return vector3(a.x * b.x, a.y * b.y, a.z * b.z)
  end,
  __div = function(a, b)
    if type(b) == 'number' then return vector3(a.x / b, a.y / b, a.z / b) end
    return vector3(a.x / b.x, a.y / b.y, a.z / b.z)
  end,
  __unm = function(a) return vector3(-a.x, -a.y, -a.z) end,
  __eq = function(a, b) return a.x == b.x and a.y == b.y and a.z == b.z end,
  __len = function(a) return math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) end,
  __tostring = function(a) return 'vector3(' .. tostring(a.x) .. ', ' .. tostring(a.y) .. ', ' .. tostring(a.z) .. ')' end,
  __index = function(v, k)
    if k == 1 then return v.x end
    if k == 2 then return v.y end
    if k == 3 then return v.z end
  end,
}
function vector3(x, y, z) return setmetatable({ x = x or 0, y = y or 0, z = z or 0 }, vmt) end
function vector2(x, y) return setmetatable({ x = x or 0, y = y or 0 }, vmt) end
function vector4(x, y, z, w) return setmetatable({ x = x or 0, y = y or 0, z = z or 0, w = w or 0 }, vmt) end

-- ---------- natives: lazy proxy over the JS natives module ----------
-- alt:V exposes GTA natives in JS as lowerCamelCase; FiveM Lua uses
-- PascalCase. Resolution + caching happens here; invocation goes through
-- __native which marshals args/results (arrays become multiple returns).
local __nativeCache = {}
-- natives whose multi-return must be spread even though it is 3 numbers
-- (heuristic treats 3-number results as a vector3, FiveM-style)
__nativeSpread = {
  GetHudColour = true, GetHudColourName = true, GetRGBFromInt = true,
}

local function nativeCall(name, ...)
  local res = table.pack(__native(name, ...))
  local n = res.n
  if n == 0 then return end
  if n == 3 and type(res[1]) == 'number' and type(res[2]) == 'number'
      and type(res[3]) == 'number' and not __nativeSpread[name] then
    return vector3(res[1], res[2], res[3])
  end
  return table.unpack(res, 1, n)
end

setmetatable(_G, {
  __index = function(_, k)
    if type(k) ~= 'string' then return nil end
    local hit = __nativeCache[k]
    if hit ~= nil then return hit end
    if __nativeLookup(k) then
      local function fn(...) return nativeCall(k, ...) end
      __nativeCache[k] = fn
      rawset(_G, k, fn)
      return fn
    end
    return nil
  end,
})

-- ---------- misc FiveM globals ----------
function IsDuplicityVersion() return false end
function GetGameName() return 'fivem' end
-- FiveM Lua-visible hashes are SIGNED int32 (they print negative there);
-- also required for fengari: bitwise ops on unsigned >0x7fffffff floats fail
local function __joaatSigned(s)
  local h = __joaat(s)
  if h > 0x7fffffff then h = h - 0x100000000 end
  return h
end
function GetHashKey(s) return __joaatSigned(s) end
function joaat(s) return __joaatSigned(s) end
function GetResourceState(res) return __resourceState and __resourceState(res) or 'started' end
function GetInvokingResource() return __currentResource end
function LoadResourceFile(res, file) return __readResourceFile and __readResourceFile(res, file) or nil end
function HasStreamLoaded() return true end

-- ---------- events ----------
-- Lua-side registry: eventName -> { {res=..., fn=...}, ... }
__eventHandlers = {}

function AddEventHandler(evName, fn)
  if type(fn) ~= 'function' then return end
  __eventHandlers[evName] = __eventHandlers[evName] or {}
  __eventHandlers[evName][#__eventHandlers[evName] + 1] = { res = __currentResource, fn = fn }
end

function RegisterNetEvent(evName, fn)
  if fn ~= nil then AddEventHandler(evName, fn) end
end
RegisterServerEvent = RegisterNetEvent

function RemoveEventHandler() end

function TriggerEvent(evName, ...)
  local list = __eventHandlers[evName]
  if not list then return end
  for i = 1, #list do
    local ok, err = pcall(list[i].fn, ...)
    if not ok then __logError('[event] ' .. tostring(evName) .. ': ' .. tostring(err)) end
  end
end

function TriggerServerEvent(evName, ...)
  __netEmitServer(evName, jenc({ ... }))
end
TriggerLatentServerEvent = TriggerServerEvent

function CancelEvent() end
function WasEventCanceled() return false end

-- net dispatch: called by JS when the server sends us a FiveM event.
-- argsJson is a JSON array of arguments.
local function __argsToVarargs(t)
  local n = #t
  for i = 1, n do
    if t[i] == __JSONNULL then t[i] = nil end
  end
  return table.unpack(t, 1, n)
end

function __netDispatch(evName, argsJson)
  local args = __jsonDecode(argsJson) or {}
  local list = __eventHandlers[evName]
  if not list then return end
  for i = 1, #list do
    local ok, err = pcall(list[i].fn, __argsToVarargs(args))
    if not ok then __logError('[net] ' .. tostring(evName) .. ': ' .. tostring(err)) end
  end
end

-- ---------- statebags (client-side read + change handlers) ----------
-- The server pushes __stateChange(target, key, json); the cache is local.
__stateCache = {}          -- target -> table
__stateHandlers = {}       -- { {keyFilter, filter, fn} }

local function stateTable(target)
  __stateCache[target] = __stateCache[target] or {}
  return __stateCache[target]
end

local function stateProxy(target)
  local proxy
  proxy = setmetatable({}, {
    __index = function(_, k)
      -- FiveM statebag method API: bag:set(key, value, replicated)
      -- (qb-core client: LocalPlayer.state:set('isLoggedIn', true, false))
      if k == 'set' then
        -- method call: bag:set(key, value, replicated) passes the bag as self
        return function(_, key, value, replicated)
          stateTable(target)[key] = value
          if replicated and target == 'local' and __stateEmitServer then
            __stateEmitServer(key, jenc(value))
          end
        end
      end
      if k == 'get' then
        return function(_, key) return stateTable(target)[key] end
      end
      return stateTable(target)[k]
    end,
    __newindex = function(_, k, v)
      if k == '__set' then rawset(proxy, '__set', v) return end
      stateTable(target)[k] = v
      -- FiveM: the owner client writing its own player statebag replicates
      -- to the server and every client. Propagate up; the server is the
      -- authority and broadcasts it (including back to us).
      if target == 'local' and __stateEmitServer then
        __stateEmitServer(k, jenc(v))
      end
    end,
  })
  return proxy
end

function Entity(handleOrNetId) return { state = stateProxy('entity:' .. tostring(handleOrNetId)) } end
function Player(serverId) return { state = stateProxy('player:' .. tostring(serverId)) } end
LocalPlayer = { state = stateProxy('local') }

-- server-set identity (pushed at handshake as __fivem:init)
__ownServerId = false
function __setOwnServerId(id) __ownServerId = id end

function PlayerId() return 0 end
function GetPlayerServerId(pid) return __ownServerId or -1 end
function GetPlayerFromServerId(serverId)
  if __ownServerId ~= false and tonumber(serverId) == __ownServerId then return 0 end
  return -1 -- remote-player ped indices are not tracked (documented gap)
end

-- client GlobalState: readable, server-replicated (server-authoritative writes)
GlobalState = setmetatable({}, {
  __index = function(_, k) return stateTable('global')[k] end,
  __newindex = function() error('GlobalState is read-only on the client', 2) end,
})

function AddStateBagChangeHandler(keyFilter, filter, fn)
  if type(fn) ~= 'function' then
    fn = filter; filter = nil
  end
  __stateHandlers[#__stateHandlers + 1] = { keyFilter = keyFilter, filter = filter, fn = fn }
end

function __stateChange(target, key, valueJson)
  local v = __jsonDecode(valueJson)
  stateTable(target)[key] = v
  -- our own player bag IS LocalPlayer.state in FiveM
  if __ownServerId ~= false and target == 'player:' .. tostring(__ownServerId) then
    stateTable('local')[key] = v
  end
  local bagName = target:match('^entity:(.+)$') or target:match('^player:(.+)$') or target
  for i = 1, #__stateHandlers do
    local h = __stateHandlers[i]
    if h.keyFilter == nil or h.keyFilter == '*' or h.keyFilter == key then
      if h.filter == nil or h.filter == bagName then
        local ok, err = pcall(h.fn, bagName, key, v, false)
        if not ok then __logError('[statebag] ' .. tostring(err)) end
      end
    end
  end
end

-- ---------- convars + kvp ----------
function GetConvar(k, default)
  local v = __getConvar(k)
  if v == false or v == nil then return default end
  return v
end
GetConvarReplicated = GetConvar

function GetConvarInt(k, default)
  local v = tonumber(GetConvar(k, nil))
  if v == nil then return tonumber(default) or 0 end
  return v
end
function GetConvarBool(k, default)
  local v = GetConvar(k, nil)
  if v == nil then return default and true or false end
  return v == true or v == 'true' or v == '1'
end
function GetResourceKvp(k) return __kvpGet(k) end
function SetResourceKvp(k, v) __kvpSet(k, v) end
function SetResourceKvpNoSync(k, v) __kvpSet(k, v) end

-- ---------- commands + key mapping ----------
-- client commands are LOCAL (invoked via keybinds / ExecuteCommand)
__commands = {}

function RegisterCommand(cmdName, fn, restricted)
  if type(fn) ~= 'function' then return end
  __commands[tostring(cmdName):lower()] = { res = __currentResource, fn = fn }
end

function RegisterKeyMapping(commandName, description, defaultMapper, defaultParameter)
  __registerKeybind(tostring(commandName), tostring(description or ''),
    tostring(defaultParameter or defaultMapper or ''))
end

function ExecuteCommand(cmd)
  -- FiveM semantics: client-side ExecuteCommand runs LOCAL commands first;
  -- unknown commands go through the chat/server path.
  local text = tostring(cmd):gsub('^%s+', '')
  local parts = {}
  for w in text:gmatch('%S+') do parts[#parts + 1] = w end
  if #parts == 0 then return end
  local args = {}
  if #parts > 1 then for i = 2, #parts do args[#args + 1] = parts[i] end end
  if not __execCommand(parts[1]:lower(), __jsonEncode(args)) then
    __executeCommand(text)
  end
end

function __execCommand(cmdName, argsJson)
  local entry = __commands[tostring(cmdName):lower()]
  if not entry then return false end
  local args = __jsonDecode(argsJson or '[]') or {}
  local prev = __currentResource
  __currentResource = entry.res
  local ok, err = pcall(entry.fn, 0, args, '')
  __currentResource = prev
  if not ok then __logError('[command] ' .. tostring(cmdName) .. ': ' .. tostring(err)) end
  return true
end

-- ---------- NUI callback registry ----------
-- resource/cbName -> Lua function (registered per-env via RegisterNUICallback)
__nuiRegister = {}

-- ---------- per-resource environment factory ----------
__envs = {}
__exportsRegistry = {}
__currentResource = nil

-- raw Lua load, kept before any env overrides it (env.load below wraps it)
__rawload = load

function __makeEnv(name)
  local env = {}
  setmetatable(env, { __index = _G })

  env.__resourceName = name
  env.source = 0

  env.GetCurrentResourceName = function() return name end
  env.GetInvokingResource = function() return name end
  env.GetParentResourceName = function() return name end

  env.print = function(...) __print('[' .. name .. ']', ...) end
  env.warn = function(...) __print('[' .. name .. '] [warn]', ...) end

  -- FiveM-style load(): transforms cfx Lua extensions, inherits this env when
  -- the caller passes none (esx_lib's imports.lua loads sibling files with it)
  env.load = function(src, chunkname, mode, e)
    local transformed = src
    if type(src) == 'string' and __transformLua then
      local ok, t = pcall(__transformLua, src)
      if ok then transformed = t else __logError('[' .. name .. '] lua transform failed: ' .. tostring(t)) end
    end
    return __rawload(transformed, chunkname, mode, e or env)
  end

  -- NUI (per resource: the webview belongs to the owning resource)
  env.SendNUIMessage = function(data) __nuiSend(name, jenc(data)) end
  env.SetNuiFocus = function(hasFocus, hasCursor) __nuiFocus(name, hasFocus == true, hasCursor == true) end
  env.SetNuiFocusKeepInput = function(keep) __nuiKeepInput(name, keep == true) end
  env.SetNuiFocusShapeEnterEnabled = function() end
  env.RegisterNUICallback = function(cbName, fn)
    __nuiRegister[name .. '/' .. tostring(cbName)] = fn
  end
  env.RegisterRawNuiCallback = env.RegisterNUICallback

  -- attributed threads
  env.CreateThread = function(fn)
    if type(fn) ~= 'function' then return end
    local co = coroutine.create(fn)
    __coResources[co] = name
    __schedule(co, 0)
  end
  env.SetTimeout = function(ms, fn)
    if type(fn) ~= 'function' then return 0 end
    local co = coroutine.create(fn)
    __coResources[co] = name
    __schedule(co, tonumber(ms) or 0)
    return 0
  end

  -- exports (live, in-VM; same semantics as the server runtime)
  __exportsRegistry[name] = {}
  env.exports = setmetatable({}, {
    __index = function(t, resName)
      local proxy
      proxy = setmetatable({}, {
        __index = function(_, expName)
          return function(...)
            local a = { ... }
            if #a > 0 and a[1] == proxy then table.remove(a, 1) end
            local tenv = __envs[resName]
            if tenv == nil then
              error("exports: resource '" .. tostring(resName) .. "' is not loaded", 2)
            end
            local fn = __exportsRegistry[resName][expName]
            if fn == nil then
              error("exports: '" .. tostring(resName) .. "' has no export '" .. tostring(expName) .. "'", 2)
            end
            local results = table.pack(pcall(fn, table.unpack(a, 1, #a)))
            if not results[1] then
              error("export '" .. tostring(resName) .. '.' .. tostring(expName) .. "' failed: " .. tostring(results[2]), 2)
            end
            return table.unpack(results, 2, results.n)
          end
        end,
      })
      rawset(t, resName, proxy)
      return proxy
    end,
    __call = function(_, expName, fn)
      if type(expName) ~= 'string' or type(fn) ~= 'function' then
        error("usage: exports('exportName', function(...) end)", 2)
      end
      __exportsRegistry[name][expName] = fn
    end,
  })

  __envs[name] = env
  return env
end

-- load + run one already-transformed client script inside its resource env
function __loadClientScript(resName, chunkName, src)
  local env = __envs[resName] or __makeEnv(resName)
  local prev = __currentResource
  __currentResource = resName
  local chunk, err = load(src, chunkName, 't', env)
  if not chunk then
    __currentResource = prev
    __logError('[' .. resName .. '] failed to compile ' .. tostring(chunkName) .. ': ' .. tostring(err))
    return false
  end
  local ok, rerr = pcall(chunk)
  __currentResource = prev
  if not ok then
    __logError('[' .. resName .. '] error in ' .. tostring(chunkName) .. ': ' .. tostring(rerr))
    return false
  end
  -- FiveM fires onResourceStart on the client once the resource's scripts ran
  TriggerEvent('onResourceStart', resName)
  return true
end

-- test/interop helper: call a resource export from JS
function __callExport(resName, expName, argsJson)
  local args = __jsonDecode(argsJson or '[]') or {}
  local reg = __exportsRegistry[resName]
  local fn = reg and reg[expName]
  if not fn then return nil end
  local results = table.pack(pcall(fn, __argsToVarargs(args)))
  if not results[1] then
    error('__callExport: ' .. tostring(results[2]), 2)
  end
  if results.n < 2 then return nil end
  return results[2]
end

-- NUI callback dispatch (JS calls this when the page posts a callback)
function __nuiInvokeCb(resName, cbName, bodyJson, token)
  local fn = __nuiRegister[resName .. '/' .. tostring(cbName)]
  if fn == nil then
    __nuiRespond(token, '{"__missing":true}')
    return
  end
  local body = __jsonDecode(bodyJson)
  local prev = __currentResource
  __currentResource = resName
  local ok, err = pcall(fn, body, function(resp)
    __nuiRespond(token, jenc(resp))
  end)
  __currentResource = prev
  if not ok then
    __logError('[nui] callback ' .. tostring(resName) .. '/' .. tostring(cbName) .. ': ' .. tostring(err))
    __nuiRespond(token, '{"__error":true}')
  end
end
`;

// client/boot.entry.js
var vm = createFengariVM();
var rt = createFiveMClientRuntime({
  vm,
  alt,
  natives,
  payload: PAYLOAD,
  preludeSrc: PRELUDE_SRC,
  config: { convars: PAYLOAD.convars || {} },
  log: (...a) => alt.log(...a),
  logError: (...a) => alt.logError(...a)
});
rt.boot().catch((e) => {
  alt.logError("[fivem-client] boot failed:", e && e.message || e);
});
/**
@license MIT

Copyright © 2017-2019 Benoit Giannangeli
Copyright © 2017-2019 Daurnimator
Copyright © 1994–2017 Lua.org, PUC-Rio.
*/
