import { a as __toCommonJS, i as __require, n as __esmMin, r as __exportAll, t as __commonJSMin } from "../_runtime.mjs";
import { t as require_redact } from "./pinojs__redact.mjs";
import { t as require_atomic_sleep } from "./atomic-sleep.mjs";
import { a as require_libbase64, i as require_libqp, n as require_flowed_decoder, o as require_src, r as require_libmime, s as require_lib, t as require_mailsplit } from "./@zone-eu/mailsplit+[...].mjs";
//#region node_modules/nodemailer/lib/punycode/index.js
var require_punycode = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/** Highest positive signed 32-bit float value */
	var maxInt = 2147483647;
	/** Bootstring parameters */
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128;
	var delimiter = "-";
	/** Regular expressions */
	var regexPunycode = /^xn--/;
	var regexNonASCII = /[^\0-\x7F]/;
	var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
	/** Error messages */
	var errors = {
		overflow: "Overflow: input needs wider integers to process",
		"not-basic": "Illegal input >= 0x80 (not a basic code point)",
		"invalid-input": "Invalid input"
	};
	/** Convenience shortcuts */
	var baseMinusTMin = base - tMin;
	var floor = Math.floor;
	var stringFromCharCode = String.fromCharCode;
	/**
	* A generic error utility function.
	* @private
	* @param {String} type The error type.
	* @returns {Error} Throws a `RangeError` with the applicable error message.
	*/
	function error(type) {
		throw new RangeError(errors[type]);
	}
	/**
	* A generic `Array#map` utility function.
	* @private
	* @param {Array} array The array to iterate over.
	* @param {Function} callback The function that gets called for every array
	* item.
	* @returns {Array} A new array of values returned by the callback function.
	*/
	function map(array, callback) {
		const result = [];
		let length = array.length;
		while (length--) result[length] = callback(array[length]);
		return result;
	}
	/**
	* A simple `Array#map`-like wrapper to work with domain name strings or email
	* addresses.
	* @private
	* @param {String} domain The domain name or email address.
	* @param {Function} callback The function that gets called for every
	* character.
	* @returns {String} A new string of characters returned by the callback
	* function.
	*/
	function mapDomain(domain, callback) {
		const parts = domain.split("@");
		let result = "";
		if (parts.length > 1) {
			result = parts[0] + "@";
			domain = parts[1];
		}
		domain = domain.replace(regexSeparators, ".");
		const encoded = map(domain.split("."), callback).join(".");
		return result + encoded;
	}
	/**
	* Creates an array containing the numeric code points of each Unicode
	* character in the string. While JavaScript uses UCS-2 internally,
	* this function will convert a pair of surrogate halves (each of which
	* UCS-2 exposes as separate characters) into a single code point,
	* matching UTF-16.
	* @see `punycode.ucs2.encode`
	* @see <https://mathiasbynens.be/notes/javascript-encoding>
	* @memberOf punycode.ucs2
	* @name decode
	* @param {String} string The Unicode input string (UCS-2).
	* @returns {Array} The new array of code points.
	*/
	function ucs2decode(string) {
		const output = [];
		let counter = 0;
		const length = string.length;
		while (counter < length) {
			const value = string.charCodeAt(counter++);
			if (value >= 55296 && value <= 56319 && counter < length) {
				const extra = string.charCodeAt(counter++);
				if ((extra & 64512) == 56320) output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
				else {
					output.push(value);
					counter--;
				}
			} else output.push(value);
		}
		return output;
	}
	/**
	* Creates a string based on an array of numeric code points.
	* @see `punycode.ucs2.decode`
	* @memberOf punycode.ucs2
	* @name encode
	* @param {Array} codePoints The array of numeric code points.
	* @returns {String} The new Unicode string (UCS-2).
	*/
	var ucs2encode = (codePoints) => String.fromCodePoint(...codePoints);
	/**
	* Converts a basic code point into a digit/integer.
	* @see `digitToBasic()`
	* @private
	* @param {Number} codePoint The basic numeric code point value.
	* @returns {Number} The numeric value of a basic code point (for use in
	* representing integers) in the range `0` to `base - 1`, or `base` if
	* the code point does not represent a value.
	*/
	var basicToDigit = function(codePoint) {
		if (codePoint >= 48 && codePoint < 58) return 26 + (codePoint - 48);
		if (codePoint >= 65 && codePoint < 91) return codePoint - 65;
		if (codePoint >= 97 && codePoint < 123) return codePoint - 97;
		return base;
	};
	/**
	* Converts a digit/integer into a basic code point.
	* @see `basicToDigit()`
	* @private
	* @param {Number} digit The numeric value of a basic code point.
	* @returns {Number} The basic code point whose value (when used for
	* representing integers) is `digit`, which needs to be in the range
	* `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	* used; else, the lowercase form is used. The behavior is undefined
	* if `flag` is non-zero and `digit` has no uppercase form.
	*/
	var digitToBasic = function(digit, flag) {
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	};
	/**
	* Bias adaptation function as per section 3.4 of RFC 3492.
	* https://tools.ietf.org/html/rfc3492#section-3.4
	* @private
	*/
	var adapt = function(delta, numPoints, firstTime) {
		let k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (; delta > 455; k += base) delta = floor(delta / baseMinusTMin);
		return floor(k + 36 * delta / (delta + skew));
	};
	/**
	* Converts a Punycode string of ASCII-only symbols to a string of Unicode
	* symbols.
	* @memberOf punycode
	* @param {String} input The Punycode string of ASCII-only symbols.
	* @returns {String} The resulting string of Unicode symbols.
	*/
	var decode = function(input) {
		const output = [];
		const inputLength = input.length;
		let i = 0;
		let n = initialN;
		let bias = initialBias;
		let basic = input.lastIndexOf(delimiter);
		if (basic < 0) basic = 0;
		for (let j = 0; j < basic; ++j) {
			if (input.charCodeAt(j) >= 128) error("not-basic");
			output.push(input.charCodeAt(j));
		}
		for (let index = basic > 0 ? basic + 1 : 0; index < inputLength;) {
			const oldi = i;
			for (let w = 1, k = base;; k += base) {
				if (index >= inputLength) error("invalid-input");
				const digit = basicToDigit(input.charCodeAt(index++));
				if (digit >= base) error("invalid-input");
				if (digit > floor((maxInt - i) / w)) error("overflow");
				i += digit * w;
				const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
				if (digit < t) break;
				const baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) error("overflow");
				w *= baseMinusT;
			}
			const out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);
			if (floor(i / out) > maxInt - n) error("overflow");
			n += floor(i / out);
			i %= out;
			output.splice(i++, 0, n);
		}
		return String.fromCodePoint(...output);
	};
	/**
	* Converts a string of Unicode symbols (e.g. a domain name label) to a
	* Punycode string of ASCII-only symbols.
	* @memberOf punycode
	* @param {String} input The string of Unicode symbols.
	* @returns {String} The resulting Punycode string of ASCII-only symbols.
	*/
	var encode = function(input) {
		const output = [];
		input = ucs2decode(input);
		const inputLength = input.length;
		let n = initialN;
		let delta = 0;
		let bias = initialBias;
		for (const currentValue of input) if (currentValue < 128) output.push(stringFromCharCode(currentValue));
		const basicLength = output.length;
		let handledCPCount = basicLength;
		if (basicLength) output.push(delimiter);
		while (handledCPCount < inputLength) {
			let m = maxInt;
			for (const currentValue of input) if (currentValue >= n && currentValue < m) m = currentValue;
			const handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) error("overflow");
			delta += (m - n) * handledCPCountPlusOne;
			n = m;
			for (const currentValue of input) {
				if (currentValue < n && ++delta > maxInt) error("overflow");
				if (currentValue === n) {
					let q = delta;
					for (let k = base;; k += base) {
						const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
						if (q < t) break;
						const qMinusT = q - t;
						const baseMinusT = base - t;
						output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
						q = floor(qMinusT / baseMinusT);
					}
					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
					delta = 0;
					++handledCPCount;
				}
			}
			++delta;
			++n;
		}
		return output.join("");
	};
	/**
	* Converts a Punycode string representing a domain name or an email address
	* to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	* it doesn't matter if you call it on a string that has already been
	* converted to Unicode.
	* @memberOf punycode
	* @param {String} input The Punycoded domain name or email address to
	* convert to Unicode.
	* @returns {String} The Unicode representation of the given Punycode
	* string.
	*/
	var toUnicode = function(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
		});
	};
	/**
	* Converts a Unicode string representing a domain name or an email address to
	* Punycode. Only the non-ASCII parts of the domain name will be converted,
	* i.e. it doesn't matter if you call it with a domain that's already in
	* ASCII.
	* @memberOf punycode
	* @param {String} input The domain name or email address to convert, as a
	* Unicode string.
	* @returns {String} The Punycode representation of the given domain name or
	* email address.
	*/
	var toASCII = function(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
		});
	};
	module.exports = {
		/**
		* A string representing the current Punycode.js version number.
		* @memberOf punycode
		* @type String
		*/
		version: "2.3.1",
		/**
		* An object of methods to convert from JavaScript's internal character
		* representation (UCS-2) to Unicode code points, and back.
		* @see <https://mathiasbynens.be/notes/javascript-encoding>
		* @memberOf punycode
		* @type Object
		*/
		ucs2: {
			decode: ucs2decode,
			encode: ucs2encode
		},
		decode,
		encode,
		toASCII,
		toUnicode
	};
}));
//#endregion
//#region node_modules/nodemailer/lib/shared/url.js
var require_url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var urllib = __require("url");
	var punycode = require_punycode();
	var URLImpl = typeof URL !== "undefined" && URL || urllib.URL;
	var SLASHLESS_AUTHORITY = /^([a-zA-Z][a-zA-Z0-9+.-]*:)(?!\/\/)(.+)$/;
	function safeDecode(str) {
		try {
			return decodeURIComponent(str);
		} catch (_err) {
			return str;
		}
	}
	function normalizeHostname(raw) {
		let hostname = raw || "";
		if (!hostname) return "";
		if (hostname.charAt(0) === "[" && hostname.charAt(hostname.length - 1) === "]") return hostname.slice(1, -1);
		return punycode.toASCII(safeDecode(hostname));
	}
	module.exports.parse = (input, parseQueryString) => {
		input = input || "";
		if (!URLImpl) return urllib.parse(input, parseQueryString);
		const slashless = SLASHLESS_AUTHORITY.exec(input);
		const normalized = slashless ? slashless[1] + "//" + slashless[2] : input;
		let u;
		try {
			u = new URLImpl(normalized);
		} catch (_err) {
			return urllib.parse(input, parseQueryString);
		}
		const hostname = normalizeHostname(u.hostname);
		const port = u.port || null;
		const pathname = u.pathname || null;
		const search = u.search || null;
		let auth = null;
		if (u.username || u.password) auth = safeDecode(u.username) + (u.password ? ":" + safeDecode(u.password) : "");
		let query;
		if (parseQueryString) {
			query = Object.create(null);
			u.searchParams.forEach((value, key) => {
				if (Object.prototype.hasOwnProperty.call(query, key)) if (Array.isArray(query[key])) query[key].push(value);
				else query[key] = [query[key], value];
				else query[key] = value;
			});
		} else query = search ? search.slice(1) : null;
		return {
			protocol: u.protocol || null,
			host: u.host || null,
			hostname,
			port,
			pathname,
			search,
			path: (pathname || "") + (search || "") || null,
			href: u.href,
			auth,
			query
		};
	};
	module.exports.resolve = (from, to) => {
		if (!URLImpl) return urllib.resolve(from, to);
		try {
			return new URLImpl(to, from).href;
		} catch (_err) {
			return urllib.resolve(from, to);
		}
	};
}));
//#endregion
//#region node_modules/nodemailer/lib/errors.js
var require_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Nodemailer Error Codes
	*
	* Centralized error code definitions for consistent error handling.
	*
	* Usage:
	*   const errors = require('./errors');
	*   let err = new Error('Connection closed');
	*   err.code = errors.ECONNECTION;
	*/
	/**
	* Error code descriptions for documentation and debugging
	*/
	var ERROR_CODES = {
		ECONNECTION: "Connection closed unexpectedly",
		ETIMEDOUT: "Connection or operation timed out",
		ESOCKET: "Socket-level error",
		EDNS: "DNS resolution failed",
		ETLS: "TLS handshake or STARTTLS failed",
		EREQUIRETLS: "REQUIRETLS not supported by server (RFC 8689)",
		EPROTOCOL: "Invalid SMTP server response",
		EENVELOPE: "Invalid mail envelope (sender or recipients)",
		EMESSAGE: "Message delivery error",
		ESTREAM: "Stream processing error",
		EAUTH: "Authentication failed",
		ENOAUTH: "Authentication credentials not provided",
		EOAUTH2: "OAuth2 token generation or refresh error",
		EMAXLIMIT: "Pool resource limit reached (max messages per connection)",
		ESENDMAIL: "Sendmail command error",
		ESES: "AWS SES transport error",
		ECONFIG: "Invalid configuration",
		EPROXY: "Proxy connection error",
		EFILEACCESS: "File access rejected (disableFileAccess is set)",
		EURLACCESS: "URL access rejected (disableUrlAccess is set)",
		EFETCH: "HTTP fetch error"
	};
	module.exports = { ERROR_CODES };
	for (const code of Object.keys(ERROR_CODES)) module.exports[code] = code;
}));
//#endregion
//#region node_modules/nodemailer/lib/smtp-connection/http-proxy-client.js
var require_http_proxy_client = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Minimal HTTP/S proxy client
	*/
	var net$4 = __require("net");
	var tls$1 = __require("tls");
	var urllib = require_url();
	var errors = require_errors();
	var MAX_RESPONSE_HEADER_BYTES = 64 * 1024;
	/**
	* Establishes proxied connection to destinationPort
	*
	* httpProxyClient("http://localhost:3128/", 80, "google.com", function(err, socket){
	*     socket.write("GET / HTTP/1.0\r\n\r\n");
	* });
	*
	* @param {String} proxyUrl proxy configuration, etg "http://proxy.host:3128/"
	* @param {Number} destinationPort Port to open in destination host
	* @param {String} destinationHost Destination hostname
	* @param {Object} [tlsOptions] Optional TLS options for an HTTPS proxy (e.g. { rejectUnauthorized: false })
	* @param {Function} callback Callback to run with the rocket object once connection is established
	*/
	function httpProxyClient(proxyUrl, destinationPort, destinationHost, tlsOptions, callback) {
		if (typeof tlsOptions === "function") {
			callback = tlsOptions;
			tlsOptions = {};
		}
		tlsOptions = tlsOptions || {};
		destinationPort = Number(destinationPort) || 0;
		if (!destinationPort || /[\r\n]/.test(destinationHost)) {
			const err = /* @__PURE__ */ new Error("Invalid proxy destination");
			err.code = errors.EPROXY;
			return setImmediate(() => callback(err));
		}
		const proxy = urllib.parse(proxyUrl);
		const connectOptions = {
			host: proxy.hostname,
			port: Number(proxy.port) ? Number(proxy.port) : proxy.protocol === "https:" ? 443 : 80
		};
		let connect;
		if (proxy.protocol === "https:") {
			connectOptions.rejectUnauthorized = tlsOptions.rejectUnauthorized !== false;
			connect = tls$1.connect.bind(tls$1);
		} else connect = net$4.connect.bind(net$4);
		let socket;
		let finished = false;
		const tempSocketErr = (err) => {
			if (finished) return;
			finished = true;
			try {
				socket.destroy();
			} catch (_E) {}
			callback(err);
		};
		const timeoutErr = () => {
			const err = /* @__PURE__ */ new Error("Proxy socket timed out");
			err.code = "ETIMEDOUT";
			tempSocketErr(err);
		};
		socket = connect(connectOptions, () => {
			if (finished) return;
			const reqHeaders = {
				Host: destinationHost + ":" + destinationPort,
				Connection: "close"
			};
			if (proxy.auth) reqHeaders["Proxy-Authorization"] = "Basic " + Buffer.from(proxy.auth).toString("base64");
			socket.write("CONNECT " + destinationHost + ":" + destinationPort + " HTTP/1.1\r\n" + Object.keys(reqHeaders).map((key) => key + ": " + reqHeaders[key]).join("\r\n") + "\r\n\r\n");
			let headers = "";
			const onSocketData = (chunk) => {
				let match;
				let remainder;
				if (finished) return;
				headers += chunk.toString("binary");
				if (match = headers.match(/\r\n\r\n/)) {
					socket.removeListener("data", onSocketData);
					remainder = headers.substr(match.index + match[0].length);
					headers = headers.substr(0, match.index);
					if (remainder) socket.unshift(Buffer.from(remainder, "binary"));
					finished = true;
					match = headers.match(/^HTTP\/\d+\.\d+ (\d+)/i);
					if (!match || (match[1] || "").charAt(0) !== "2") {
						try {
							socket.destroy();
						} catch (_E) {}
						const err = /* @__PURE__ */ new Error("Invalid response from proxy" + (match && ": " + match[1] || ""));
						err.code = errors.EPROXY;
						return callback(err);
					}
					socket.removeListener("error", tempSocketErr);
					socket.removeListener("timeout", timeoutErr);
					socket.setTimeout(0);
					return callback(null, socket);
				}
				if (headers.length > MAX_RESPONSE_HEADER_BYTES) {
					socket.removeListener("data", onSocketData);
					const err = /* @__PURE__ */ new Error("Proxy response headers too large");
					err.code = errors.EPROXY;
					return tempSocketErr(err);
				}
			};
			socket.on("data", onSocketData);
		});
		socket.setTimeout(httpProxyClient.timeout || 30 * 1e3);
		socket.on("timeout", timeoutErr);
		socket.once("error", tempSocketErr);
	}
	module.exports = httpProxyClient;
}));
//#endregion
//#region node_modules/pino-std-serializers/lib/err-helpers.js
var require_err_helpers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isErrorLike = (err) => {
		return err && typeof err.message === "string";
	};
	/**
	* @param {Error|{ cause?: unknown|(()=>err)}} err
	* @returns {Error|Object|undefined}
	*/
	var getErrorCause = (err) => {
		if (!err) return;
		/** @type {unknown} */
		const cause = err.cause;
		if (typeof cause === "function") {
			const causeResult = err.cause();
			return isErrorLike(causeResult) ? causeResult : void 0;
		} else return isErrorLike(cause) ? cause : void 0;
	};
	/**
	* Internal method that keeps a track of which error we have already added, to avoid circular recursion
	*
	* @private
	* @param {Error} err
	* @param {Set<Error>} seen
	* @returns {string}
	*/
	var _stackWithCauses = (err, seen) => {
		if (!isErrorLike(err)) return "";
		const stack = err.stack || "";
		if (seen.has(err)) return stack + "\ncauses have become circular...";
		const cause = getErrorCause(err);
		if (cause) {
			seen.add(err);
			return stack + "\ncaused by: " + _stackWithCauses(cause, seen);
		} else return stack;
	};
	/**
	* @param {Error} err
	* @returns {string}
	*/
	var stackWithCauses = (err) => _stackWithCauses(err, /* @__PURE__ */ new Set());
	/**
	* Internal method that keeps a track of which error we have already added, to avoid circular recursion
	*
	* @private
	* @param {Error} err
	* @param {Set<Error>} seen
	* @param {boolean} [skip]
	* @returns {string}
	*/
	var _messageWithCauses = (err, seen, skip) => {
		if (!isErrorLike(err)) return "";
		const message = skip ? "" : err.message || "";
		if (seen.has(err)) return message + ": ...";
		const cause = getErrorCause(err);
		if (cause) {
			seen.add(err);
			const skipIfVErrorStyleCause = typeof err.cause === "function";
			return message + (skipIfVErrorStyleCause ? "" : ": ") + _messageWithCauses(cause, seen, skipIfVErrorStyleCause);
		} else return message;
	};
	/**
	* @param {Error} err
	* @returns {string}
	*/
	var messageWithCauses = (err) => _messageWithCauses(err, /* @__PURE__ */ new Set());
	module.exports = {
		isErrorLike,
		getErrorCause,
		stackWithCauses,
		messageWithCauses
	};
}));
//#endregion
//#region node_modules/pino-std-serializers/lib/err-proto.js
var require_err_proto = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var seen = Symbol("circular-ref-tag");
	var rawSymbol = Symbol("pino-raw-err-ref");
	var pinoErrProto = Object.create({}, {
		type: {
			enumerable: true,
			writable: true,
			value: void 0
		},
		message: {
			enumerable: true,
			writable: true,
			value: void 0
		},
		stack: {
			enumerable: true,
			writable: true,
			value: void 0
		},
		aggregateErrors: {
			enumerable: true,
			writable: true,
			value: void 0
		},
		raw: {
			enumerable: false,
			get: function() {
				return this[rawSymbol];
			},
			set: function(val) {
				this[rawSymbol] = val;
			}
		}
	});
	Object.defineProperty(pinoErrProto, rawSymbol, {
		writable: true,
		value: {}
	});
	module.exports = {
		pinoErrProto,
		pinoErrorSymbols: {
			seen,
			rawSymbol
		}
	};
}));
//#endregion
//#region node_modules/pino-std-serializers/lib/err.js
var require_err = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = errSerializer;
	var { messageWithCauses, stackWithCauses, isErrorLike } = require_err_helpers();
	var { pinoErrProto, pinoErrorSymbols } = require_err_proto();
	var { seen } = pinoErrorSymbols;
	var { toString } = Object.prototype;
	function errSerializer(err) {
		if (!isErrorLike(err)) return err;
		err[seen] = void 0;
		const _err = Object.create(pinoErrProto);
		_err.type = toString.call(err.constructor) === "[object Function]" ? err.constructor.name : err.name;
		_err.message = messageWithCauses(err);
		_err.stack = stackWithCauses(err);
		if (Array.isArray(err.errors)) _err.aggregateErrors = err.errors.map((err) => errSerializer(err));
		for (const key in err) if (_err[key] === void 0) {
			const val = err[key];
			if (isErrorLike(val)) {
				if (key !== "cause" && !Object.prototype.hasOwnProperty.call(val, seen)) _err[key] = errSerializer(val);
			} else _err[key] = val;
		}
		delete err[seen];
		_err.raw = err;
		return _err;
	}
}));
//#endregion
//#region node_modules/pino-std-serializers/lib/err-with-cause.js
var require_err_with_cause = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = errWithCauseSerializer;
	var { isErrorLike } = require_err_helpers();
	var { pinoErrProto, pinoErrorSymbols } = require_err_proto();
	var { seen } = pinoErrorSymbols;
	var { toString } = Object.prototype;
	function errWithCauseSerializer(err) {
		if (!isErrorLike(err)) return err;
		err[seen] = void 0;
		const _err = Object.create(pinoErrProto);
		_err.type = toString.call(err.constructor) === "[object Function]" ? err.constructor.name : err.name;
		_err.message = err.message;
		_err.stack = err.stack;
		if (Array.isArray(err.errors)) _err.aggregateErrors = err.errors.map((err) => errWithCauseSerializer(err));
		if (isErrorLike(err.cause) && !Object.prototype.hasOwnProperty.call(err.cause, seen)) _err.cause = errWithCauseSerializer(err.cause);
		for (const key in err) if (_err[key] === void 0) {
			const val = err[key];
			if (isErrorLike(val)) {
				if (!Object.prototype.hasOwnProperty.call(val, seen)) _err[key] = errWithCauseSerializer(val);
			} else _err[key] = val;
		}
		delete err[seen];
		_err.raw = err;
		return _err;
	}
}));
//#endregion
//#region node_modules/pino-std-serializers/lib/req.js
var require_req = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		mapHttpRequest,
		reqSerializer
	};
	var rawSymbol = Symbol("pino-raw-req-ref");
	var pinoReqProto = Object.create({}, {
		id: {
			enumerable: true,
			writable: true,
			value: ""
		},
		method: {
			enumerable: true,
			writable: true,
			value: ""
		},
		url: {
			enumerable: true,
			writable: true,
			value: ""
		},
		query: {
			enumerable: true,
			writable: true,
			value: ""
		},
		params: {
			enumerable: true,
			writable: true,
			value: ""
		},
		headers: {
			enumerable: true,
			writable: true,
			value: {}
		},
		remoteAddress: {
			enumerable: true,
			writable: true,
			value: ""
		},
		remotePort: {
			enumerable: true,
			writable: true,
			value: ""
		},
		raw: {
			enumerable: false,
			get: function() {
				return this[rawSymbol];
			},
			set: function(val) {
				this[rawSymbol] = val;
			}
		}
	});
	Object.defineProperty(pinoReqProto, rawSymbol, {
		writable: true,
		value: {}
	});
	function reqSerializer(req) {
		const connection = req.info || req.socket;
		const _req = Object.create(pinoReqProto);
		_req.id = typeof req.id === "function" ? req.id() : req.id || (req.info ? req.info.id : void 0);
		_req.method = req.method;
		if (req.originalUrl) _req.url = req.originalUrl;
		else {
			const path = req.path;
			_req.url = typeof path === "string" ? path : req.url ? req.url.path || req.url : void 0;
		}
		if (req.query) _req.query = req.query;
		if (req.params) _req.params = req.params;
		_req.headers = req.headers;
		_req.remoteAddress = connection && connection.remoteAddress;
		_req.remotePort = connection && connection.remotePort;
		_req.raw = req.raw || req;
		return _req;
	}
	function mapHttpRequest(req) {
		return { req: reqSerializer(req) };
	}
}));
//#endregion
//#region node_modules/pino-std-serializers/lib/res.js
var require_res = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		mapHttpResponse,
		resSerializer
	};
	var rawSymbol = Symbol("pino-raw-res-ref");
	var pinoResProto = Object.create({}, {
		statusCode: {
			enumerable: true,
			writable: true,
			value: 0
		},
		headers: {
			enumerable: true,
			writable: true,
			value: ""
		},
		raw: {
			enumerable: false,
			get: function() {
				return this[rawSymbol];
			},
			set: function(val) {
				this[rawSymbol] = val;
			}
		}
	});
	Object.defineProperty(pinoResProto, rawSymbol, {
		writable: true,
		value: {}
	});
	function resSerializer(res) {
		const _res = Object.create(pinoResProto);
		_res.statusCode = res.headersSent ? res.statusCode : null;
		_res.headers = res.getHeaders ? res.getHeaders() : res._headers;
		_res.raw = res;
		return _res;
	}
	function mapHttpResponse(res) {
		return { res: resSerializer(res) };
	}
}));
//#endregion
//#region node_modules/pino-std-serializers/index.js
var require_pino_std_serializers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var errSerializer = require_err();
	var errWithCauseSerializer = require_err_with_cause();
	var reqSerializers = require_req();
	var resSerializers = require_res();
	module.exports = {
		err: errSerializer,
		errWithCause: errWithCauseSerializer,
		mapHttpRequest: reqSerializers.mapHttpRequest,
		mapHttpResponse: resSerializers.mapHttpResponse,
		req: reqSerializers.reqSerializer,
		res: resSerializers.resSerializer,
		wrapErrorSerializer: function wrapErrorSerializer(customSerializer) {
			if (customSerializer === errSerializer) return customSerializer;
			return function wrapErrSerializer(err) {
				return customSerializer(errSerializer(err));
			};
		},
		wrapRequestSerializer: function wrapRequestSerializer(customSerializer) {
			if (customSerializer === reqSerializers.reqSerializer) return customSerializer;
			return function wrappedReqSerializer(req) {
				return customSerializer(reqSerializers.reqSerializer(req));
			};
		},
		wrapResponseSerializer: function wrapResponseSerializer(customSerializer) {
			if (customSerializer === resSerializers.resSerializer) return customSerializer;
			return function wrappedResSerializer(res) {
				return customSerializer(resSerializers.resSerializer(res));
			};
		}
	};
}));
//#endregion
//#region node_modules/pino/lib/caller.js
var require_caller = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function noOpPrepareStackTrace(_, stack) {
		return stack;
	}
	module.exports = function getCallers() {
		const originalPrepare = Error.prepareStackTrace;
		Error.prepareStackTrace = noOpPrepareStackTrace;
		const stack = (/* @__PURE__ */ new Error()).stack;
		Error.prepareStackTrace = originalPrepare;
		if (!Array.isArray(stack)) return;
		const entries = stack.slice(2);
		const fileNames = [];
		for (const entry of entries) {
			if (!entry) continue;
			fileNames.push(entry.getFileName());
		}
		return fileNames;
	};
}));
//#endregion
//#region node_modules/pino/lib/symbols.js
var require_symbols = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var setLevelSym = Symbol("pino.setLevel");
	var getLevelSym = Symbol("pino.getLevel");
	var levelValSym = Symbol("pino.levelVal");
	var levelCompSym = Symbol("pino.levelComp");
	var useLevelLabelsSym = Symbol("pino.useLevelLabels");
	var useOnlyCustomLevelsSym = Symbol("pino.useOnlyCustomLevels");
	var mixinSym = Symbol("pino.mixin");
	var lsCacheSym = Symbol("pino.lsCache");
	var chindingsSym = Symbol("pino.chindings");
	var asJsonSym = Symbol("pino.asJson");
	var writeSym = Symbol("pino.write");
	var redactFmtSym = Symbol("pino.redactFmt");
	var timeSym = Symbol("pino.time");
	var timeSliceIndexSym = Symbol("pino.timeSliceIndex");
	var streamSym = Symbol("pino.stream");
	var stringifySym = Symbol("pino.stringify");
	var stringifySafeSym = Symbol("pino.stringifySafe");
	var stringifiersSym = Symbol("pino.stringifiers");
	var endSym = Symbol("pino.end");
	var formatOptsSym = Symbol("pino.formatOpts");
	var messageKeySym = Symbol("pino.messageKey");
	var errorKeySym = Symbol("pino.errorKey");
	var nestedKeySym = Symbol("pino.nestedKey");
	var nestedKeyStrSym = Symbol("pino.nestedKeyStr");
	var mixinMergeStrategySym = Symbol("pino.mixinMergeStrategy");
	var msgPrefixSym = Symbol("pino.msgPrefix");
	var wildcardFirstSym = Symbol("pino.wildcardFirst");
	var serializersSym = Symbol.for("pino.serializers");
	var formattersSym = Symbol.for("pino.formatters");
	var hooksSym = Symbol.for("pino.hooks");
	module.exports = {
		setLevelSym,
		getLevelSym,
		levelValSym,
		levelCompSym,
		useLevelLabelsSym,
		mixinSym,
		lsCacheSym,
		chindingsSym,
		asJsonSym,
		writeSym,
		serializersSym,
		redactFmtSym,
		timeSym,
		timeSliceIndexSym,
		streamSym,
		stringifySym,
		stringifySafeSym,
		stringifiersSym,
		endSym,
		formatOptsSym,
		messageKeySym,
		errorKeySym,
		nestedKeySym,
		wildcardFirstSym,
		needsMetadataGsym: Symbol.for("pino.metadata"),
		useOnlyCustomLevelsSym,
		formattersSym,
		hooksSym,
		nestedKeyStrSym,
		mixinMergeStrategySym,
		msgPrefixSym
	};
}));
//#endregion
//#region node_modules/pino/lib/redaction.js
var require_redaction = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Redact = require_redact();
	var { redactFmtSym, wildcardFirstSym } = require_symbols();
	var rx = /[^.[\]]+|\[([^[\]]*?)\]/g;
	var CENSOR = "[Redacted]";
	var strict = false;
	function redaction(opts, serialize) {
		const { paths, censor, remove } = handle(opts);
		const shape = paths.reduce((o, str) => {
			rx.lastIndex = 0;
			const first = rx.exec(str);
			const next = rx.exec(str);
			let ns = first[1] !== void 0 ? first[1].replace(/^(?:"|'|`)(.*)(?:"|'|`)$/, "$1") : first[0];
			if (ns === "*") ns = wildcardFirstSym;
			if (next === null) {
				o[ns] = null;
				return o;
			}
			if (o[ns] === null) return o;
			const { index } = next;
			const nextPath = `${str.substr(index, str.length - 1)}`;
			o[ns] = o[ns] || [];
			if (ns !== wildcardFirstSym && o[ns].length === 0) o[ns].push(...o[wildcardFirstSym] || []);
			if (ns === wildcardFirstSym) Object.keys(o).forEach(function(k) {
				if (o[k]) o[k].push(nextPath);
			});
			o[ns].push(nextPath);
			return o;
		}, {});
		const result = { [redactFmtSym]: Redact({
			paths,
			censor,
			serialize,
			strict,
			remove
		}) };
		const topCensor = (...args) => {
			return typeof censor === "function" ? serialize(censor(...args)) : serialize(censor);
		};
		return [...Object.keys(shape), ...Object.getOwnPropertySymbols(shape)].reduce((o, k) => {
			if (shape[k] === null) o[k] = (value) => topCensor(value, [k]);
			else {
				const wrappedCensor = typeof censor === "function" ? (value, path) => {
					return censor(value, [k, ...path]);
				} : censor;
				o[k] = Redact({
					paths: shape[k],
					censor: wrappedCensor,
					serialize,
					strict,
					remove
				});
			}
			return o;
		}, result);
	}
	function handle(opts) {
		if (Array.isArray(opts)) {
			opts = {
				paths: opts,
				censor: CENSOR
			};
			return opts;
		}
		let { paths, censor = CENSOR, remove } = opts;
		if (Array.isArray(paths) === false) throw Error("pino – redact must contain an array of strings");
		if (remove === true) censor = void 0;
		return {
			paths,
			censor,
			remove
		};
	}
	module.exports = redaction;
}));
//#endregion
//#region node_modules/pino/lib/time.js
var require_time = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var nullTime = () => "";
	var epochTime = () => `,"time":${Date.now()}`;
	var unixTime = () => `,"time":${Math.round(Date.now() / 1e3)}`;
	var isoTime = () => `,"time":"${new Date(Date.now()).toISOString()}"`;
	var NS_PER_MS = 1000000n;
	var NS_PER_SEC = 1000000000n;
	var startWallTimeNs = BigInt(Date.now()) * NS_PER_MS;
	var startHrTime = process.hrtime.bigint();
	var isoTimeNano = () => {
		const currentTimeNs = startWallTimeNs + (process.hrtime.bigint() - startHrTime);
		const secondsSinceEpoch = currentTimeNs / NS_PER_SEC;
		const nanosWithinSecond = currentTimeNs % NS_PER_SEC;
		const msSinceEpoch = Number(secondsSinceEpoch * 1000n + nanosWithinSecond / 1000000n);
		const date = new Date(msSinceEpoch);
		return `,"time":"${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}T${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}:${date.getUTCSeconds().toString().padStart(2, "0")}.${nanosWithinSecond.toString().padStart(9, "0")}Z"`;
	};
	module.exports = {
		nullTime,
		epochTime,
		unixTime,
		isoTime,
		isoTimeNano
	};
}));
//#endregion
//#region node_modules/quick-format-unescaped/index.js
var require_quick_format_unescaped = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function tryStringify(o) {
		try {
			return JSON.stringify(o);
		} catch (e) {
			return "\"[Circular]\"";
		}
	}
	module.exports = format;
	function format(f, args, opts) {
		var ss = opts && opts.stringify || tryStringify;
		var offset = 1;
		if (typeof f === "object" && f !== null) {
			var len = args.length + offset;
			if (len === 1) return f;
			var objects = new Array(len);
			objects[0] = ss(f);
			for (var index = 1; index < len; index++) objects[index] = ss(args[index]);
			return objects.join(" ");
		}
		if (typeof f !== "string") return f;
		var argLen = args.length;
		if (argLen === 0) return f;
		var str = "";
		var a = 1 - offset;
		var lastPos = -1;
		var flen = f && f.length || 0;
		for (var i = 0; i < flen;) {
			if (f.charCodeAt(i) === 37 && i + 1 < flen) {
				lastPos = lastPos > -1 ? lastPos : 0;
				switch (f.charCodeAt(i + 1)) {
					case 100:
					case 102:
						if (a >= argLen) break;
						if (args[a] == null) break;
						if (lastPos < i) str += f.slice(lastPos, i);
						str += Number(args[a]);
						lastPos = i + 2;
						i++;
						break;
					case 105:
						if (a >= argLen) break;
						if (args[a] == null) break;
						if (lastPos < i) str += f.slice(lastPos, i);
						str += Math.floor(Number(args[a]));
						lastPos = i + 2;
						i++;
						break;
					case 79:
					case 111:
					case 106:
						if (a >= argLen) break;
						if (args[a] === void 0) break;
						if (lastPos < i) str += f.slice(lastPos, i);
						var type = typeof args[a];
						if (type === "string") {
							str += "'" + args[a] + "'";
							lastPos = i + 2;
							i++;
							break;
						}
						if (type === "function") {
							str += args[a].name || "<anonymous>";
							lastPos = i + 2;
							i++;
							break;
						}
						str += ss(args[a]);
						lastPos = i + 2;
						i++;
						break;
					case 115:
						if (a >= argLen) break;
						if (lastPos < i) str += f.slice(lastPos, i);
						str += String(args[a]);
						lastPos = i + 2;
						i++;
						break;
					case 37:
						if (lastPos < i) str += f.slice(lastPos, i);
						str += "%";
						lastPos = i + 2;
						i++;
						a--;
						break;
				}
				++a;
			}
			++i;
		}
		if (lastPos === -1) return f;
		else if (lastPos < flen) str += f.slice(lastPos);
		return str;
	}
}));
//#endregion
//#region node_modules/sonic-boom/index.js
var require_sonic_boom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs = __require("fs");
	var EventEmitter$3 = __require("events");
	var inherits = __require("util").inherits;
	var path = __require("path");
	var sleep = require_atomic_sleep();
	var assert$1 = __require("assert");
	var BUSY_WRITE_TIMEOUT = 100;
	var kEmptyBuffer = Buffer.allocUnsafe(0);
	var MAX_WRITE = 16 * 1024;
	var kContentModeBuffer = "buffer";
	var kContentModeUtf8 = "utf8";
	var [major, minor] = (process.versions.node || "0.0").split(".").map(Number);
	var kCopyBuffer = major >= 22 && minor >= 7;
	function openFile(file, sonic) {
		sonic._opening = true;
		sonic._writing = true;
		sonic._asyncDrainScheduled = false;
		function fileOpened(err, fd) {
			if (err) {
				sonic._reopening = false;
				sonic._writing = false;
				sonic._opening = false;
				if (sonic.sync) process.nextTick(() => {
					if (sonic.listenerCount("error") > 0) sonic.emit("error", err);
				});
				else sonic.emit("error", err);
				return;
			}
			const reopening = sonic._reopening;
			sonic.fd = fd;
			sonic.file = file;
			sonic._reopening = false;
			sonic._opening = false;
			sonic._writing = false;
			if (sonic.sync) process.nextTick(() => sonic.emit("ready"));
			else sonic.emit("ready");
			if (sonic.destroyed) return;
			if (!sonic._writing && sonic._len > sonic.minLength || sonic._flushPending) sonic._actualWrite();
			else if (reopening) process.nextTick(() => sonic.emit("drain"));
		}
		const flags = sonic.append ? "a" : "w";
		const mode = sonic.mode;
		if (sonic.sync) try {
			if (sonic.mkdir) fs.mkdirSync(path.dirname(file), { recursive: true });
			fileOpened(null, fs.openSync(file, flags, mode));
		} catch (err) {
			fileOpened(err);
			throw err;
		}
		else if (sonic.mkdir) fs.mkdir(path.dirname(file), { recursive: true }, (err) => {
			if (err) return fileOpened(err);
			fs.open(file, flags, mode, fileOpened);
		});
		else fs.open(file, flags, mode, fileOpened);
	}
	function SonicBoom(opts) {
		if (!(this instanceof SonicBoom)) return new SonicBoom(opts);
		let { fd, dest, minLength, maxLength, maxWrite, periodicFlush, sync, append = true, mkdir, retryEAGAIN, fsync, contentMode, mode } = opts || {};
		fd = fd || dest;
		this._len = 0;
		this.fd = -1;
		this._bufs = [];
		this._lens = [];
		this._writing = false;
		this._ending = false;
		this._reopening = false;
		this._asyncDrainScheduled = false;
		this._flushPending = false;
		this._hwm = Math.max(minLength || 0, 16387);
		this.file = null;
		this.destroyed = false;
		this.minLength = minLength || 0;
		this.maxLength = maxLength || 0;
		this.maxWrite = maxWrite || MAX_WRITE;
		this._periodicFlush = periodicFlush || 0;
		this._periodicFlushTimer = void 0;
		this.sync = sync || false;
		this.writable = true;
		this._fsync = fsync || false;
		this.append = append || false;
		this.mode = mode;
		this.retryEAGAIN = retryEAGAIN || (() => true);
		this.mkdir = mkdir || false;
		let fsWriteSync;
		let fsWrite;
		if (contentMode === kContentModeBuffer) {
			this._writingBuf = kEmptyBuffer;
			this.write = writeBuffer;
			this.flush = flushBuffer;
			this.flushSync = flushBufferSync;
			this._actualWrite = actualWriteBuffer;
			fsWriteSync = () => fs.writeSync(this.fd, this._writingBuf);
			fsWrite = () => fs.write(this.fd, this._writingBuf, this.release);
		} else if (contentMode === void 0 || contentMode === kContentModeUtf8) {
			this._writingBuf = "";
			this.write = write;
			this.flush = flush;
			this.flushSync = flushSync;
			this._actualWrite = actualWrite;
			fsWriteSync = () => {
				if (Buffer.isBuffer(this._writingBuf)) return fs.writeSync(this.fd, this._writingBuf);
				return fs.writeSync(this.fd, this._writingBuf, "utf8");
			};
			fsWrite = () => {
				if (Buffer.isBuffer(this._writingBuf)) return fs.write(this.fd, this._writingBuf, this.release);
				return fs.write(this.fd, this._writingBuf, "utf8", this.release);
			};
		} else throw new Error(`SonicBoom supports "${kContentModeUtf8}" and "${kContentModeBuffer}", but passed ${contentMode}`);
		if (typeof fd === "number") {
			this.fd = fd;
			process.nextTick(() => this.emit("ready"));
		} else if (typeof fd === "string") openFile(fd, this);
		else throw new Error("SonicBoom supports only file descriptors and files");
		if (this.minLength >= this.maxWrite) throw new Error(`minLength should be smaller than maxWrite (${this.maxWrite})`);
		this.release = (err, n) => {
			if (err) {
				if ((err.code === "EAGAIN" || err.code === "EBUSY") && this.retryEAGAIN(err, this._writingBuf.length, this._len - this._writingBuf.length)) if (this.sync) try {
					sleep(BUSY_WRITE_TIMEOUT);
					this.release(void 0, 0);
				} catch (err) {
					this.release(err);
				}
				else setTimeout(fsWrite, BUSY_WRITE_TIMEOUT);
				else {
					this._writing = false;
					this.emit("error", err);
				}
				return;
			}
			this.emit("write", n);
			const releasedBufObj = releaseWritingBuf(this._writingBuf, this._len, n);
			this._len = releasedBufObj.len;
			this._writingBuf = releasedBufObj.writingBuf;
			if (this._writingBuf.length) {
				if (!this.sync) {
					fsWrite();
					return;
				}
				try {
					do {
						const n = fsWriteSync();
						const releasedBufObj = releaseWritingBuf(this._writingBuf, this._len, n);
						this._len = releasedBufObj.len;
						this._writingBuf = releasedBufObj.writingBuf;
					} while (this._writingBuf.length);
				} catch (err) {
					this.release(err);
					return;
				}
			}
			if (this._fsync) fs.fsyncSync(this.fd);
			const len = this._len;
			if (this._reopening) {
				this._writing = false;
				this._reopening = false;
				this.reopen();
			} else if (len > this.minLength) this._actualWrite();
			else if (this._ending) if (len > 0) this._actualWrite();
			else {
				this._writing = false;
				actualClose(this);
			}
			else {
				this._writing = false;
				if (this.sync) {
					if (!this._asyncDrainScheduled) {
						this._asyncDrainScheduled = true;
						process.nextTick(emitDrain, this);
					}
				} else this.emit("drain");
			}
		};
		this.on("newListener", function(name) {
			if (name === "drain") this._asyncDrainScheduled = false;
		});
		if (this._periodicFlush !== 0) {
			this._periodicFlushTimer = setInterval(() => this.flush(null), this._periodicFlush);
			this._periodicFlushTimer.unref();
		}
	}
	/**
	* Release the writingBuf after fs.write n bytes data
	* @param {string | Buffer} writingBuf - currently writing buffer, usually be instance._writingBuf.
	* @param {number} len - currently buffer length, usually be instance._len.
	* @param {number} n - number of bytes fs already written
	* @returns {{writingBuf: string | Buffer, len: number}} released writingBuf and length
	*/
	function releaseWritingBuf(writingBuf, len, n) {
		if (typeof writingBuf === "string") writingBuf = Buffer.from(writingBuf);
		len = Math.max(len - n, 0);
		writingBuf = writingBuf.subarray(n);
		return {
			writingBuf,
			len
		};
	}
	function emitDrain(sonic) {
		if (!(sonic.listenerCount("drain") > 0)) return;
		sonic._asyncDrainScheduled = false;
		sonic.emit("drain");
	}
	inherits(SonicBoom, EventEmitter$3);
	function mergeBuf(bufs, len) {
		if (bufs.length === 0) return kEmptyBuffer;
		if (bufs.length === 1) return bufs[0];
		return Buffer.concat(bufs, len);
	}
	function write(data) {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		data = "" + data;
		const dataLen = Buffer.byteLength(data);
		const len = this._len + dataLen;
		const bufs = this._bufs;
		if (this.maxLength && len > this.maxLength) {
			this.emit("drop", data);
			return this._len < this._hwm;
		}
		if (bufs.length === 0 || Buffer.byteLength(bufs[bufs.length - 1]) + dataLen > this.maxWrite) bufs.push(data);
		else bufs[bufs.length - 1] += data;
		this._len = len;
		if (!this._writing && this._len >= this.minLength) this._actualWrite();
		return this._len < this._hwm;
	}
	function writeBuffer(data) {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		const len = this._len + data.length;
		const bufs = this._bufs;
		const lens = this._lens;
		if (this.maxLength && len > this.maxLength) {
			this.emit("drop", data);
			return this._len < this._hwm;
		}
		if (bufs.length === 0 || lens[lens.length - 1] + data.length > this.maxWrite) {
			bufs.push([data]);
			lens.push(data.length);
		} else {
			bufs[bufs.length - 1].push(data);
			lens[lens.length - 1] += data.length;
		}
		this._len = len;
		if (!this._writing && this._len >= this.minLength) this._actualWrite();
		return this._len < this._hwm;
	}
	function callFlushCallbackOnDrain(cb) {
		this._flushPending = true;
		const onDrain = () => {
			if (!this._fsync) try {
				fs.fsync(this.fd, (err) => {
					this._flushPending = false;
					cb(err);
				});
			} catch (err) {
				cb(err);
			}
			else {
				this._flushPending = false;
				cb();
			}
			this.off("error", onError);
		};
		const onError = (err) => {
			this._flushPending = false;
			cb(err);
			this.off("drain", onDrain);
		};
		this.once("drain", onDrain);
		this.once("error", onError);
	}
	function flush(cb) {
		if (cb != null && typeof cb !== "function") throw new Error("flush cb must be a function");
		if (this.destroyed) {
			const error = /* @__PURE__ */ new Error("SonicBoom destroyed");
			if (cb) {
				cb(error);
				return;
			}
			throw error;
		}
		if (this.minLength <= 0) {
			cb?.();
			return;
		}
		if (cb) callFlushCallbackOnDrain.call(this, cb);
		if (this._writing) return;
		if (this._bufs.length === 0) this._bufs.push("");
		this._actualWrite();
	}
	function flushBuffer(cb) {
		if (cb != null && typeof cb !== "function") throw new Error("flush cb must be a function");
		if (this.destroyed) {
			const error = /* @__PURE__ */ new Error("SonicBoom destroyed");
			if (cb) {
				cb(error);
				return;
			}
			throw error;
		}
		if (this.minLength <= 0) {
			cb?.();
			return;
		}
		if (cb) callFlushCallbackOnDrain.call(this, cb);
		if (this._writing) return;
		if (this._bufs.length === 0) {
			this._bufs.push([]);
			this._lens.push(0);
		}
		this._actualWrite();
	}
	SonicBoom.prototype.reopen = function(file) {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		if (this._opening) {
			this.once("ready", () => {
				this.reopen(file);
			});
			return;
		}
		if (this._ending) return;
		if (!this.file) throw new Error("Unable to reopen a file descriptor, you must pass a file to SonicBoom");
		if (file) this.file = file;
		this._reopening = true;
		if (this._writing) return;
		const fd = this.fd;
		this.once("ready", () => {
			if (fd !== this.fd) fs.close(fd, (err) => {
				if (err) return this.emit("error", err);
			});
		});
		openFile(this.file, this);
	};
	SonicBoom.prototype.end = function() {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		if (this._opening) {
			this.once("ready", () => {
				this.end();
			});
			return;
		}
		if (this._ending) return;
		this._ending = true;
		if (this._writing) return;
		if (this._len > 0 && this.fd >= 0) this._actualWrite();
		else actualClose(this);
	};
	function flushSync() {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		if (this.fd < 0) throw new Error("sonic boom is not ready yet");
		if (!this._writing && this._writingBuf.length > 0) {
			this._bufs.unshift(this._writingBuf);
			this._writingBuf = "";
		}
		let buf = "";
		while (this._bufs.length || buf.length) {
			if (buf.length <= 0) buf = this._bufs[0];
			try {
				const n = Buffer.isBuffer(buf) ? fs.writeSync(this.fd, buf) : fs.writeSync(this.fd, buf, "utf8");
				const releasedBufObj = releaseWritingBuf(buf, this._len, n);
				buf = releasedBufObj.writingBuf;
				this._len = releasedBufObj.len;
				if (buf.length <= 0) this._bufs.shift();
			} catch (err) {
				if ((err.code === "EAGAIN" || err.code === "EBUSY") && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) throw err;
				sleep(BUSY_WRITE_TIMEOUT);
			}
		}
		try {
			fs.fsyncSync(this.fd);
		} catch {}
	}
	function flushBufferSync() {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		if (this.fd < 0) throw new Error("sonic boom is not ready yet");
		if (!this._writing && this._writingBuf.length > 0) {
			this._bufs.unshift([this._writingBuf]);
			this._writingBuf = kEmptyBuffer;
		}
		let buf = kEmptyBuffer;
		while (this._bufs.length || buf.length) {
			if (buf.length <= 0) buf = mergeBuf(this._bufs[0], this._lens[0]);
			try {
				const n = fs.writeSync(this.fd, buf);
				buf = buf.subarray(n);
				this._len = Math.max(this._len - n, 0);
				if (buf.length <= 0) {
					this._bufs.shift();
					this._lens.shift();
				}
			} catch (err) {
				if ((err.code === "EAGAIN" || err.code === "EBUSY") && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) throw err;
				sleep(BUSY_WRITE_TIMEOUT);
			}
		}
	}
	SonicBoom.prototype.destroy = function() {
		if (this.destroyed) return;
		actualClose(this);
	};
	function actualWrite() {
		const release = this.release;
		this._writing = true;
		this._writingBuf = this._writingBuf.length ? this._writingBuf : this._bufs.shift() || "";
		if (this.sync) try {
			release(null, Buffer.isBuffer(this._writingBuf) ? fs.writeSync(this.fd, this._writingBuf) : fs.writeSync(this.fd, this._writingBuf, "utf8"));
		} catch (err) {
			release(err);
		}
		else fs.write(this.fd, this._writingBuf, release);
	}
	function actualWriteBuffer() {
		const release = this.release;
		this._writing = true;
		this._writingBuf = this._writingBuf.length ? this._writingBuf : mergeBuf(this._bufs.shift(), this._lens.shift());
		if (this.sync) try {
			release(null, fs.writeSync(this.fd, this._writingBuf));
		} catch (err) {
			release(err);
		}
		else {
			if (kCopyBuffer) this._writingBuf = Buffer.from(this._writingBuf);
			fs.write(this.fd, this._writingBuf, release);
		}
	}
	function actualClose(sonic) {
		if (sonic.fd === -1) {
			sonic.once("ready", actualClose.bind(null, sonic));
			return;
		}
		if (sonic._periodicFlushTimer !== void 0) clearInterval(sonic._periodicFlushTimer);
		sonic.destroyed = true;
		sonic._bufs = [];
		sonic._lens = [];
		assert$1(typeof sonic.fd === "number", `sonic.fd must be a number, got ${typeof sonic.fd}`);
		try {
			fs.fsync(sonic.fd, closeWrapped);
		} catch {}
		function closeWrapped() {
			if (sonic.fd !== 1 && sonic.fd !== 2) fs.close(sonic.fd, done);
			else done();
		}
		function done(err) {
			if (err) {
				sonic.emit("error", err);
				return;
			}
			if (sonic._ending && !sonic._writing) sonic.emit("finish");
			sonic.emit("close");
		}
	}
	/**
	* These export configurations enable JS and TS developers
	* to consumer SonicBoom in whatever way best suits their needs.
	* Some examples of supported import syntax includes:
	* - `const SonicBoom = require('SonicBoom')`
	* - `const { SonicBoom } = require('SonicBoom')`
	* - `import * as SonicBoom from 'SonicBoom'`
	* - `import { SonicBoom } from 'SonicBoom'`
	* - `import SonicBoom from 'SonicBoom'`
	*/
	SonicBoom.SonicBoom = SonicBoom;
	SonicBoom.default = SonicBoom;
	module.exports = SonicBoom;
}));
//#endregion
//#region node_modules/on-exit-leak-free/index.js
var require_on_exit_leak_free = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var refs = {
		exit: [],
		beforeExit: []
	};
	var functions = {
		exit: onExit,
		beforeExit: onBeforeExit
	};
	var registry;
	function ensureRegistry() {
		if (registry === void 0) registry = new FinalizationRegistry(clear);
	}
	function install(event) {
		if (refs[event].length > 0) return;
		process.on(event, functions[event]);
	}
	function uninstall(event) {
		if (refs[event].length > 0) return;
		process.removeListener(event, functions[event]);
		if (refs.exit.length === 0 && refs.beforeExit.length === 0) registry = void 0;
	}
	function onExit() {
		callRefs("exit");
	}
	function onBeforeExit() {
		callRefs("beforeExit");
	}
	function callRefs(event) {
		for (const ref of refs[event]) {
			const obj = ref.deref();
			const fn = ref.fn;
			/* istanbul ignore else */
			if (obj !== void 0) fn(obj, event);
		}
		refs[event] = [];
	}
	function clear(ref) {
		for (const event of ["exit", "beforeExit"]) {
			const index = refs[event].indexOf(ref);
			refs[event].splice(index, index + 1);
			uninstall(event);
		}
	}
	function _register(event, obj, fn) {
		if (obj === void 0) throw new Error("the object can't be undefined");
		install(event);
		const ref = new WeakRef(obj);
		ref.fn = fn;
		ensureRegistry();
		registry.register(obj, ref);
		refs[event].push(ref);
	}
	function register(obj, fn) {
		_register("exit", obj, fn);
	}
	function registerBeforeExit(obj, fn) {
		_register("beforeExit", obj, fn);
	}
	function unregister(obj) {
		if (registry === void 0) return;
		registry.unregister(obj);
		for (const event of ["exit", "beforeExit"]) {
			refs[event] = refs[event].filter((ref) => {
				const _obj = ref.deref();
				return _obj && _obj !== obj;
			});
			uninstall(event);
		}
	}
	module.exports = {
		register,
		registerBeforeExit,
		unregister
	};
}));
//#endregion
//#region node_modules/thread-stream/package.json
var package_exports$1 = /* @__PURE__ */ __exportAll({
	author: () => author$1,
	bugs: () => bugs$1,
	default: () => package_default$1,
	dependencies: () => dependencies$1,
	description: () => description$1,
	devDependencies: () => devDependencies$1,
	engines: () => engines,
	homepage: () => homepage$1,
	keywords: () => keywords$1,
	license: () => "MIT",
	main: () => main$1,
	name: () => name$1,
	repository: () => repository$1,
	scripts: () => scripts$1,
	types: () => types$1,
	version: () => version$1
}), name$1, version$1, description$1, main$1, types$1, engines, dependencies$1, devDependencies$1, scripts$1, repository$1, keywords$1, author$1, bugs$1, homepage$1, package_default$1;
var init_package$1 = __esmMin((() => {
	name$1 = "thread-stream";
	version$1 = "4.2.0";
	description$1 = "A streaming way to send data to a Node.js Worker Thread";
	main$1 = "index.js";
	types$1 = "index.d.ts";
	engines = { "node": ">=20" };
	dependencies$1 = { "real-require": "^1.0.0" };
	devDependencies$1 = {
		"@types/node": "^25.0.2",
		"@yao-pkg/pkg": "^6.0.0",
		"borp": "^1.0.0",
		"desm": "^1.3.0",
		"eslint": "^9.39.1",
		"fastbench": "^1.0.1",
		"neostandard": "^0.13.0",
		"pino-elasticsearch": "^9.0.0",
		"sonic-boom": "^5.0.0",
		"ts-node": "^10.8.0",
		"typescript": "~5.7.3"
	};
	scripts$1 = {
		"build": "tsc --noEmit",
		"lint": "eslint",
		"test": "npm run lint && npm run build && npm run transpile && borp --pattern \"test/*.test.{js,mjs}\"",
		"test:ci": "npm run lint && npm run transpile && borp --pattern \"test/*.test.{js,mjs}\"",
		"test:yarn": "npm run transpile && borp --pattern \"test/*.test.js\"",
		"transpile": "sh ./test/ts/transpile.sh"
	};
	repository$1 = {
		"type": "git",
		"url": "git+https://github.com/mcollina/thread-stream.git"
	};
	keywords$1 = [
		"worker",
		"thread",
		"threads",
		"stream"
	];
	author$1 = "Matteo Collina <hello@matteocollina.com>";
	bugs$1 = { "url": "https://github.com/mcollina/thread-stream/issues" };
	homepage$1 = "https://github.com/mcollina/thread-stream#readme";
	package_default$1 = {
		name: name$1,
		version: version$1,
		description: description$1,
		main: main$1,
		types: types$1,
		engines,
		dependencies: dependencies$1,
		devDependencies: devDependencies$1,
		scripts: scripts$1,
		repository: repository$1,
		keywords: keywords$1,
		author: author$1,
		license: "MIT",
		bugs: bugs$1,
		homepage: homepage$1
	};
}));
//#endregion
//#region node_modules/thread-stream/lib/wait.js
var require_wait = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var WAIT_MS = 1e4;
	function wait(state, index, expected, timeout, done) {
		const max = timeout === Infinity ? Infinity : Date.now() + timeout;
		const check = () => {
			const current = Atomics.load(state, index);
			if (current === expected) {
				done(null, "ok");
				return;
			}
			if (max !== Infinity && Date.now() > max) {
				done(null, "timed-out");
				return;
			}
			const remaining = max === Infinity ? WAIT_MS : Math.min(WAIT_MS, Math.max(1, max - Date.now()));
			const result = Atomics.waitAsync(state, index, current, remaining);
			if (result.async) result.value.then(check);
			else setImmediate(check);
		};
		check();
	}
	function waitDiff(state, index, expected, timeout, done) {
		const max = timeout === Infinity ? Infinity : Date.now() + timeout;
		const check = () => {
			if (Atomics.load(state, index) !== expected) {
				done(null, "ok");
				return;
			}
			if (max !== Infinity && Date.now() > max) {
				done(null, "timed-out");
				return;
			}
			const remaining = max === Infinity ? WAIT_MS : Math.min(WAIT_MS, Math.max(1, max - Date.now()));
			const result = Atomics.waitAsync(state, index, expected, remaining);
			if (result.async) result.value.then((res) => {
				if (res === "ok") {
					done(null, "ok");
					return;
				}
				check();
			});
			else setImmediate(check);
		};
		check();
	}
	module.exports = {
		wait,
		waitDiff
	};
}));
//#endregion
//#region node_modules/thread-stream/lib/indexes.js
var require_indexes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		WRITE_INDEX: 4,
		READ_INDEX: 8,
		SEQ_INDEX: 2
	};
}));
//#endregion
//#region node_modules/thread-stream/index.js
var require_thread_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { version } = (init_package$1(), __toCommonJS(package_exports$1).default);
	var { EventEmitter: EventEmitter$2 } = __require("events");
	var { Worker } = __require("worker_threads");
	var { join: join$1 } = __require("path");
	var { pathToFileURL } = __require("url");
	var { wait } = require_wait();
	var { WRITE_INDEX, READ_INDEX, SEQ_INDEX } = require_indexes();
	var buffer = __require("buffer");
	var assert = __require("assert");
	var kImpl = Symbol("kImpl");
	var MAX_STRING = buffer.constants.MAX_STRING_LENGTH;
	function noop() {}
	function updateState(stream, fn) {
		Atomics.add(stream[kImpl].state, SEQ_INDEX, 1);
		fn();
		Atomics.add(stream[kImpl].state, SEQ_INDEX, 1);
		Atomics.notify(stream[kImpl].state, SEQ_INDEX);
	}
	function resetIndexes(stream) {
		updateState(stream, () => {
			Atomics.store(stream[kImpl].state, READ_INDEX, 0);
			Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
		});
	}
	var FakeWeakRef = class {
		constructor(value) {
			this._value = value;
		}
		deref() {
			return this._value;
		}
	};
	var FakeFinalizationRegistry = class {
		register() {}
		unregister() {}
	};
	var FinalizationRegistry = process.env.NODE_V8_COVERAGE ? FakeFinalizationRegistry : global.FinalizationRegistry || FakeFinalizationRegistry;
	var WeakRef = process.env.NODE_V8_COVERAGE ? FakeWeakRef : global.WeakRef || FakeWeakRef;
	var registry = new FinalizationRegistry((worker) => {
		if (worker.exited) return;
		worker.terminate();
	});
	function createWorker(stream, opts) {
		const { filename, workerData } = opts;
		const worker = new Worker(("__bundlerPathsOverrides" in globalThis ? globalThis.__bundlerPathsOverrides : {})["thread-stream-worker"] || join$1(__dirname, "lib", "worker.js"), {
			...opts.workerOpts,
			name: opts.workerOpts?.name || "thread-stream",
			trackUnmanagedFds: false,
			workerData: {
				filename: filename.indexOf("file://") === 0 ? filename : pathToFileURL(filename).href,
				dataBuf: stream[kImpl].dataBuf,
				stateBuf: stream[kImpl].stateBuf,
				workerData: {
					$context: { threadStreamVersion: version },
					...workerData
				}
			}
		});
		worker.stream = new FakeWeakRef(stream);
		worker.on("message", onWorkerMessage);
		worker.on("exit", onWorkerExit);
		registry.register(stream, worker);
		return worker;
	}
	function drain(stream) {
		assert(!stream[kImpl].sync);
		if (stream[kImpl].needDrain) {
			stream[kImpl].needDrain = false;
			stream.emit("drain");
		}
	}
	function nextFlush(stream) {
		while (true) {
			const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
			const leftover = stream[kImpl].data.length - writeIndex;
			if (leftover > 0) {
				if (stream[kImpl].bufLen === 0) {
					stream[kImpl].flushing = false;
					if (stream[kImpl].ending) end(stream);
					else if (stream[kImpl].needDrain) process.nextTick(drain, stream);
					return;
				}
				write(stream, leftover, noop);
				continue;
			}
			if (leftover === 0) {
				if (writeIndex === 0 && stream[kImpl].bufLen === 0) return;
				waitForRead(stream, () => {
					if (stream.destroyed) return;
					resetIndexes(stream);
					nextFlush(stream);
				});
				return;
			}
			destroy(stream, /* @__PURE__ */ new Error("overwritten"));
			return;
		}
	}
	function onWorkerMessage(msg) {
		const stream = this.stream.deref();
		if (stream === void 0) {
			this.exited = true;
			this.terminate();
			return;
		}
		if (msg?.code == null) return;
		switch (msg.code) {
			case "READY":
				this.stream = new WeakRef(stream);
				waitForRead(stream, () => {
					stream[kImpl].ready = true;
					stream.emit("ready");
				});
				break;
			case "ERROR":
				destroy(stream, msg.err);
				break;
			case "EVENT":
				if (Array.isArray(msg.args)) stream.emit(msg.name, ...msg.args);
				else stream.emit(msg.name, msg.args);
				break;
			case "FLUSHED": {
				if (msg.context !== "thread-stream") {
					destroy(stream, /* @__PURE__ */ new Error("this should not happen: " + msg.code));
					break;
				}
				const cb = stream[kImpl].flushCallbacks.get(msg.id);
				if (cb) {
					stream[kImpl].flushCallbacks.delete(msg.id);
					process.nextTick(cb);
				}
				break;
			}
			case "WARNING":
				process.emitWarning(msg.err);
				break;
			default: destroy(stream, /* @__PURE__ */ new Error("this should not happen: " + msg.code));
		}
	}
	function onWorkerExit(code) {
		const stream = this.stream.deref();
		if (stream === void 0) return;
		registry.unregister(stream);
		stream.worker.exited = true;
		stream.worker.off("exit", onWorkerExit);
		destroy(stream, code !== 0 ? /* @__PURE__ */ new Error("the worker thread exited") : null);
	}
	var ThreadStream = class extends EventEmitter$2 {
		constructor(opts = {}) {
			super();
			if (opts.bufferSize < 4) throw new Error("bufferSize must at least fit a 4-byte utf-8 char");
			this[kImpl] = {};
			this[kImpl].stateBuf = new SharedArrayBuffer(128);
			this[kImpl].state = new Int32Array(this[kImpl].stateBuf);
			this[kImpl].dataBuf = new SharedArrayBuffer(opts.bufferSize || 4 * 1024 * 1024);
			this[kImpl].data = Buffer.from(this[kImpl].dataBuf);
			this[kImpl].sync = opts.sync || false;
			this[kImpl].ending = false;
			this[kImpl].ended = false;
			this[kImpl].needDrain = false;
			this[kImpl].destroyed = false;
			this[kImpl].flushing = false;
			this[kImpl].ready = false;
			this[kImpl].finished = false;
			this[kImpl].errored = null;
			this[kImpl].closed = false;
			this[kImpl].buf = [];
			this[kImpl].bufHead = 0;
			this[kImpl].bufLen = 0;
			this[kImpl].flushCallbacks = /* @__PURE__ */ new Map();
			this[kImpl].nextFlushId = 0;
			this.worker = createWorker(this, opts);
			this.on("message", (message, transferList) => {
				this.worker.postMessage(message, transferList);
			});
		}
		write(data) {
			const dataBuf = Buffer.isBuffer(data) ? data : Buffer.from(data);
			if (this[kImpl].destroyed) {
				error(this, /* @__PURE__ */ new Error("the worker has exited"));
				return false;
			}
			if (this[kImpl].ending) {
				error(this, /* @__PURE__ */ new Error("the worker is ending"));
				return false;
			}
			if (this[kImpl].flushing && this[kImpl].bufLen + dataBuf.length >= MAX_STRING) try {
				writeSync(this);
				this[kImpl].flushing = true;
			} catch (err) {
				destroy(this, err);
				return false;
			}
			this[kImpl].buf.push(dataBuf);
			this[kImpl].bufLen += dataBuf.length;
			if (this[kImpl].sync) try {
				writeSync(this);
				return true;
			} catch (err) {
				destroy(this, err);
				return false;
			}
			if (!this[kImpl].flushing) {
				this[kImpl].flushing = true;
				setImmediate(nextFlush, this);
			}
			this[kImpl].needDrain = this[kImpl].data.length - this[kImpl].bufLen - Atomics.load(this[kImpl].state, WRITE_INDEX) <= 0;
			return !this[kImpl].needDrain;
		}
		end() {
			if (this[kImpl].destroyed) return;
			this[kImpl].ending = true;
			end(this);
		}
		flush(cb) {
			cb = typeof cb === "function" ? cb : noop;
			flushBuffer(this, (err) => {
				if (err) {
					process.nextTick(cb, err);
					return;
				}
				requestWorkerFlush(this, cb);
			});
		}
		flushSync() {
			if (this[kImpl].destroyed) return;
			writeSync(this);
			flushSync(this);
		}
		unref() {
			this.worker.unref();
		}
		ref() {
			this.worker.ref();
		}
		get ready() {
			return this[kImpl].ready;
		}
		get destroyed() {
			return this[kImpl].destroyed;
		}
		get closed() {
			return this[kImpl].closed;
		}
		get writable() {
			return !this[kImpl].destroyed && !this[kImpl].ending;
		}
		get writableEnded() {
			return this[kImpl].ending;
		}
		get writableFinished() {
			return this[kImpl].finished;
		}
		get writableNeedDrain() {
			return this[kImpl].needDrain;
		}
		get writableObjectMode() {
			return false;
		}
		get writableErrored() {
			return this[kImpl].errored;
		}
	};
	function flushBuffer(stream, cb) {
		if (stream[kImpl].destroyed) {
			process.nextTick(cb, /* @__PURE__ */ new Error("the worker has exited"));
			return;
		}
		if (!stream[kImpl].sync && (stream[kImpl].flushing || stream[kImpl].bufLen > 0)) {
			setImmediate(flushBuffer, stream, cb);
			return;
		}
		waitForRead(stream, cb);
	}
	function waitForRead(stream, cb) {
		const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
		wait(stream[kImpl].state, READ_INDEX, writeIndex, Infinity, (err, res) => {
			if (err) {
				destroy(stream, err);
				cb(err);
				return;
			}
			if (res !== "ok") {
				waitForRead(stream, cb);
				return;
			}
			cb();
		});
	}
	function requestWorkerFlush(stream, cb) {
		if (stream[kImpl].destroyed) {
			process.nextTick(cb, /* @__PURE__ */ new Error("the worker has exited"));
			return;
		}
		if (!stream[kImpl].ready) {
			const onReady = () => {
				cleanup();
				requestWorkerFlush(stream, cb);
			};
			const onClose = () => {
				cleanup();
				process.nextTick(cb, /* @__PURE__ */ new Error("the worker has exited"));
			};
			const cleanup = () => {
				stream.off("ready", onReady);
				stream.off("close", onClose);
			};
			stream.once("ready", onReady);
			stream.once("close", onClose);
			return;
		}
		const id = ++stream[kImpl].nextFlushId;
		stream[kImpl].flushCallbacks.set(id, cb);
		try {
			stream.worker.postMessage({
				code: "FLUSH",
				context: "thread-stream",
				id
			});
		} catch (err) {
			stream[kImpl].flushCallbacks.delete(id);
			destroy(stream, err);
			process.nextTick(cb, err);
		}
	}
	function failPendingFlushCallbacks(stream, err) {
		const callbacks = stream[kImpl].flushCallbacks;
		if (callbacks.size === 0) return;
		const flushErr = err || /* @__PURE__ */ new Error("the worker has exited");
		for (const cb of callbacks.values()) process.nextTick(cb, flushErr);
		callbacks.clear();
	}
	function error(stream, err) {
		setImmediate(() => {
			stream.emit("error", err);
		});
	}
	function destroy(stream, err) {
		if (stream[kImpl].destroyed) return;
		stream[kImpl].destroyed = true;
		failPendingFlushCallbacks(stream, err);
		if (err) {
			stream[kImpl].errored = err;
			error(stream, err);
		}
		if (!stream.worker.exited) stream.worker.terminate().catch(() => {}).then(() => {
			stream[kImpl].closed = true;
			stream.emit("close");
		});
		else setImmediate(() => {
			stream[kImpl].closed = true;
			stream.emit("close");
		});
	}
	function write(stream, maxBytes, cb) {
		let offset = Atomics.load(stream[kImpl].state, WRITE_INDEX);
		let remaining = maxBytes;
		while (remaining > 0 && stream[kImpl].bufLen !== 0) {
			const head = stream[kImpl].bufHead;
			const buf = stream[kImpl].buf[head];
			if (buf.length <= remaining) {
				buf.copy(stream[kImpl].data, offset);
				offset += buf.length;
				remaining -= buf.length;
				stream[kImpl].bufLen -= buf.length;
				stream[kImpl].bufHead = head + 1;
				if (stream[kImpl].bufHead === stream[kImpl].buf.length) {
					stream[kImpl].buf.length = 0;
					stream[kImpl].bufHead = 0;
				} else if (stream[kImpl].bufHead >= 1024 && stream[kImpl].bufHead * 2 >= stream[kImpl].buf.length) {
					stream[kImpl].buf.splice(0, stream[kImpl].bufHead);
					stream[kImpl].bufHead = 0;
				}
				continue;
			}
			buf.copy(stream[kImpl].data, offset, 0, remaining);
			stream[kImpl].buf[head] = buf.subarray(remaining);
			stream[kImpl].bufLen -= remaining;
			offset += remaining;
			remaining = 0;
		}
		updateState(stream, () => {
			Atomics.store(stream[kImpl].state, WRITE_INDEX, offset);
		});
		cb();
		return true;
	}
	function end(stream) {
		if (stream[kImpl].ended || !stream[kImpl].ending || stream[kImpl].flushing) return;
		stream[kImpl].ended = true;
		try {
			stream.flushSync();
			let readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
			updateState(stream, () => {
				Atomics.store(stream[kImpl].state, WRITE_INDEX, -1);
			});
			let spins = 0;
			while (readIndex !== -1) {
				Atomics.wait(stream[kImpl].state, READ_INDEX, readIndex, 1e3);
				readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
				if (readIndex === -2) {
					destroy(stream, /* @__PURE__ */ new Error("end() failed"));
					return;
				}
				if (++spins === 10) {
					destroy(stream, /* @__PURE__ */ new Error("end() took too long (10s)"));
					return;
				}
			}
			process.nextTick(() => {
				stream[kImpl].finished = true;
				stream.emit("finish");
			});
		} catch (err) {
			destroy(stream, err);
		}
	}
	function writeSync(stream) {
		const cb = () => {
			if (stream[kImpl].ending) end(stream);
			else if (stream[kImpl].needDrain) process.nextTick(drain, stream);
		};
		stream[kImpl].flushing = false;
		while (stream[kImpl].bufLen !== 0) {
			const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
			const leftover = stream[kImpl].data.length - writeIndex;
			if (leftover === 0) {
				flushSync(stream);
				resetIndexes(stream);
				continue;
			} else if (leftover < 0) throw new Error("overwritten");
			write(stream, leftover, cb);
		}
	}
	function flushSync(stream) {
		if (stream[kImpl].flushing) throw new Error("unable to flush while flushing");
		const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
		let spins = 0;
		while (true) {
			const readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
			if (readIndex === -2) throw Error("_flushSync failed");
			if (readIndex !== writeIndex) Atomics.wait(stream[kImpl].state, READ_INDEX, readIndex, 1e3);
			else break;
			if (++spins === 10) throw new Error("_flushSync took too long (10s)");
		}
	}
	module.exports = ThreadStream;
}));
//#endregion
//#region node_modules/pino/lib/transport.js
var require_transport = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { createRequire } = __require("module");
	var { existsSync } = __require("node:fs");
	var getCallers = require_caller();
	var { join, isAbsolute, sep } = __require("node:path");
	var { fileURLToPath } = __require("node:url");
	var sleep = require_atomic_sleep();
	var onExit = require_on_exit_leak_free();
	var ThreadStream = require_thread_stream();
	function setupOnExit(stream) {
		onExit.register(stream, autoEnd);
		onExit.registerBeforeExit(stream, flush);
		stream.on("close", function() {
			onExit.unregister(stream);
		});
	}
	function hasPreloadFlags() {
		const execArgv = process.execArgv;
		for (let i = 0; i < execArgv.length; i++) {
			const arg = execArgv[i];
			if (arg === "--import" || arg === "--require" || arg === "-r") return true;
			if (arg.startsWith("--import=") || arg.startsWith("--require=") || arg.startsWith("-r=")) return true;
		}
		return false;
	}
	function sanitizeNodeOptions(nodeOptions) {
		const tokens = nodeOptions.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
		if (!tokens) return nodeOptions;
		const sanitized = [];
		let changed = false;
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			if (token === "--require" || token === "-r" || token === "--import") {
				const next = tokens[i + 1];
				if (next && shouldDropPreload(next)) {
					changed = true;
					i++;
					continue;
				}
				sanitized.push(token);
				if (next) {
					sanitized.push(next);
					i++;
				}
				continue;
			}
			if (token.startsWith("--require=") || token.startsWith("-r=") || token.startsWith("--import=")) {
				if (shouldDropPreload(token.slice(token.indexOf("=") + 1))) {
					changed = true;
					continue;
				}
			}
			sanitized.push(token);
		}
		return changed ? sanitized.join(" ") : nodeOptions;
	}
	function shouldDropPreload(value) {
		const unquoted = stripQuotes(value);
		if (!unquoted) return false;
		let path = unquoted;
		if (path.startsWith("file://")) try {
			path = fileURLToPath(path);
		} catch {
			return false;
		}
		return isAbsolute(path) && !existsSync(path);
	}
	function stripQuotes(value) {
		const first = value[0];
		const last = value[value.length - 1];
		if (first === "\"" && last === "\"" || first === "'" && last === "'") return value.slice(1, -1);
		return value;
	}
	function buildStream(filename, workerData, workerOpts, sync, name) {
		if (!workerOpts.execArgv && hasPreloadFlags() && __require.main === void 0) workerOpts = {
			...workerOpts,
			execArgv: []
		};
		if (!workerOpts.env && process.env.NODE_OPTIONS) {
			const nodeOptions = sanitizeNodeOptions(process.env.NODE_OPTIONS);
			if (nodeOptions !== process.env.NODE_OPTIONS) workerOpts = {
				...workerOpts,
				env: {
					...process.env,
					NODE_OPTIONS: nodeOptions
				}
			};
		}
		workerOpts = {
			...workerOpts,
			name
		};
		const stream = new ThreadStream({
			filename,
			workerData,
			workerOpts,
			sync
		});
		stream.on("ready", onReady);
		stream.on("close", function() {
			process.removeListener("exit", onExit);
		});
		process.on("exit", onExit);
		function onReady() {
			process.removeListener("exit", onExit);
			stream.unref();
			if (workerOpts.autoEnd !== false) setupOnExit(stream);
		}
		function onExit() {
			/* istanbul ignore next */
			if (stream.closed) return;
			stream.flushSync();
			sleep(100);
			stream.end();
		}
		return stream;
	}
	function autoEnd(stream) {
		stream.ref();
		stream.flushSync();
		stream.end();
		stream.once("close", function() {
			stream.unref();
		});
	}
	function flush(stream) {
		stream.flushSync();
	}
	function transport(fullOptions) {
		const { pipeline, targets, levels, dedupe, worker = {}, caller = getCallers(), sync = false } = fullOptions;
		const options = { ...fullOptions.options };
		const callers = typeof caller === "string" ? [caller] : caller;
		const bundlerOverrides = typeof globalThis === "object" && Object.prototype.hasOwnProperty.call(globalThis, "__bundlerPathsOverrides") && globalThis.__bundlerPathsOverrides && typeof globalThis.__bundlerPathsOverrides === "object" ? globalThis.__bundlerPathsOverrides : Object.create(null);
		let target = fullOptions.target;
		if (target && targets) throw new Error("only one of target or targets can be specified");
		if (targets) {
			target = bundlerOverrides["pino-worker"] || join(__dirname, "worker.js");
			options.targets = targets.filter((dest) => dest.target).map((dest) => {
				return {
					...dest,
					target: fixTarget(dest.target)
				};
			});
			options.pipelines = targets.filter((dest) => dest.pipeline).map((dest) => {
				return dest.pipeline.map((t) => {
					return {
						...t,
						level: dest.level,
						target: fixTarget(t.target)
					};
				});
			});
		} else if (pipeline) {
			target = bundlerOverrides["pino-worker"] || join(__dirname, "worker.js");
			options.pipelines = [pipeline.map((dest) => {
				return {
					...dest,
					target: fixTarget(dest.target)
				};
			})];
		}
		if (levels) options.levels = levels;
		if (dedupe) options.dedupe = dedupe;
		options.pinoWillSendConfig = true;
		const name = targets || pipeline ? "pino.transport" : target;
		return buildStream(fixTarget(target), options, worker, sync, name);
		function fixTarget(origin) {
			origin = bundlerOverrides[origin] || origin;
			if (isAbsolute(origin) || origin.indexOf("file://") === 0) return origin;
			if (origin === "pino/file") return join(__dirname, "..", "file.js");
			let fixTarget;
			for (const filePath of callers) try {
				fixTarget = createRequire(filePath === "node:repl" ? process.cwd() + sep : filePath).resolve(origin);
				break;
			} catch (err) {
				continue;
			}
			if (!fixTarget) throw new Error(`unable to determine transport target for "${origin}"`);
			return fixTarget;
		}
	}
	module.exports = transport;
}));
//#endregion
//#region node_modules/pino/lib/tools.js
var require_tools$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var diagChan = __require("node:diagnostics_channel");
	var format = require_quick_format_unescaped();
	var { mapHttpRequest, mapHttpResponse } = require_pino_std_serializers();
	var SonicBoom = require_sonic_boom();
	var onExit = require_on_exit_leak_free();
	var { lsCacheSym, chindingsSym, writeSym, serializersSym, formatOptsSym, endSym, stringifiersSym, stringifySym, stringifySafeSym, wildcardFirstSym, nestedKeySym, formattersSym, messageKeySym, errorKeySym, nestedKeyStrSym, msgPrefixSym } = require_symbols();
	var { isMainThread } = __require("worker_threads");
	var transport = require_transport();
	var [nodeMajor] = process.versions.node.split(".").map((v) => Number(v));
	var asJsonChan = diagChan.tracingChannel("pino_asJson");
	var asString = nodeMajor >= 25 ? (str) => JSON.stringify(str) : _asString;
	function noop() {}
	function genLog(level, hook) {
		if (!hook) return LOG;
		return function hookWrappedLog(...args) {
			hook.call(this, args, LOG, level);
		};
		function LOG(o, ...n) {
			if (typeof o === "object") {
				let msg = o;
				if (o !== null) {
					if (o.method && o.headers && o.socket) o = mapHttpRequest(o);
					else if (typeof o.setHeader === "function") o = mapHttpResponse(o);
				}
				let formatParams;
				if (msg === null && n.length === 0) formatParams = [null];
				else {
					msg = n.shift();
					formatParams = n;
				}
				if (typeof this[msgPrefixSym] === "string" && msg !== void 0 && msg !== null) msg = this[msgPrefixSym] + msg;
				this[writeSym](o, format(msg, formatParams, this[formatOptsSym]), level);
			} else {
				let msg = o === void 0 ? n.shift() : o;
				if (typeof this[msgPrefixSym] === "string" && msg !== void 0 && msg !== null) msg = this[msgPrefixSym] + msg;
				this[writeSym](null, format(msg, n, this[formatOptsSym]), level);
			}
		}
	}
	function _asString(str) {
		let result = "";
		let last = 0;
		let found = false;
		let point = 255;
		const l = str.length;
		if (l > 100) return JSON.stringify(str);
		for (var i = 0; i < l && point >= 32; i++) {
			point = str.charCodeAt(i);
			if (point === 34 || point === 92) {
				result += str.slice(last, i) + "\\";
				last = i;
				found = true;
			}
		}
		if (!found) result = str;
		else result += str.slice(last);
		return point < 32 ? JSON.stringify(str) : "\"" + result + "\"";
	}
	/**
	* `asJson` wraps `_asJson` in order to facilitate generating diagnostics.
	*
	* @param {object} obj The merging object passed to the log method.
	* @param {string} msg The log message passed to the log method.
	* @param {number} num The log level number.
	* @param {number} time The log time in milliseconds.
	*
	* @returns {string}
	*/
	function asJson(obj, msg, num, time) {
		if (asJsonChan.hasSubscribers === false) return _asJson.call(this, obj, msg, num, time);
		const store = {
			instance: this,
			arguments
		};
		return asJsonChan.traceSync(_asJson, store, this, obj, msg, num, time);
	}
	/**
	* `_asJson` parses all collected data and generates the finalized newline
	* delimited JSON string.
	*
	* @param {object} obj The merging object passed to the log method.
	* @param {string} msg The log message passed to the log method.
	* @param {number} num The log level number.
	* @param {number} time The log time in milliseconds.
	*
	* @returns {string} The finalized log string terminated with a newline.
	* @private
	*/
	function _asJson(obj, msg, num, time) {
		const stringify = this[stringifySym];
		const stringifySafe = this[stringifySafeSym];
		const stringifiers = this[stringifiersSym];
		const end = this[endSym];
		const chindings = this[chindingsSym];
		const serializers = this[serializersSym];
		const formatters = this[formattersSym];
		const messageKey = this[messageKeySym];
		const errorKey = this[errorKeySym];
		let data = this[lsCacheSym][num] + time;
		data = data + chindings;
		let value;
		if (formatters.log) obj = formatters.log(obj);
		const wildcardStringifier = stringifiers[wildcardFirstSym];
		let propStr = "";
		for (const key in obj) {
			value = obj[key];
			if (Object.prototype.hasOwnProperty.call(obj, key) && value !== void 0) {
				if (serializers[key]) value = serializers[key](value);
				else if (key === errorKey && serializers.err) value = serializers.err(value);
				const stringifier = stringifiers[key] || wildcardStringifier;
				switch (typeof value) {
					case "undefined":
					case "function": continue;
					case "number": if (Number.isFinite(value) === false) value = null;
					case "boolean":
						if (stringifier) value = stringifier(value);
						break;
					case "string":
						value = (stringifier || asString)(value);
						break;
					default: value = (stringifier || stringify)(value, stringifySafe);
				}
				if (value === void 0) continue;
				const strKey = asString(key);
				propStr += "," + strKey + ":" + value;
			}
		}
		let msgStr = "";
		if (msg !== void 0) {
			value = serializers[messageKey] ? serializers[messageKey](msg) : msg;
			const stringifier = stringifiers[messageKey] || wildcardStringifier;
			switch (typeof value) {
				case "function": break;
				case "number": if (Number.isFinite(value) === false) value = null;
				case "boolean":
					if (stringifier) value = stringifier(value);
					msgStr = ",\"" + messageKey + "\":" + value;
					break;
				case "string":
					value = (stringifier || asString)(value);
					msgStr = ",\"" + messageKey + "\":" + value;
					break;
				default:
					value = (stringifier || stringify)(value, stringifySafe);
					msgStr = ",\"" + messageKey + "\":" + value;
			}
		}
		if (this[nestedKeySym] && propStr) return data + this[nestedKeyStrSym] + propStr.slice(1) + "}" + msgStr + end;
		else return data + propStr + msgStr + end;
	}
	function asChindings(instance, bindings) {
		let value;
		let data = instance[chindingsSym];
		const stringify = instance[stringifySym];
		const stringifySafe = instance[stringifySafeSym];
		const stringifiers = instance[stringifiersSym];
		const wildcardStringifier = stringifiers[wildcardFirstSym];
		const serializers = instance[serializersSym];
		const formatter = instance[formattersSym].bindings;
		bindings = formatter(bindings);
		for (const key in bindings) {
			value = bindings[key];
			if (((key.length < 5 || key !== "level" && key !== "serializers" && key !== "formatters" && key !== "customLevels") && bindings.hasOwnProperty(key) && value !== void 0) === true) {
				value = serializers[key] ? serializers[key](value) : value;
				value = (stringifiers[key] || wildcardStringifier || stringify)(value, stringifySafe);
				if (value === void 0) continue;
				data += ",\"" + key + "\":" + value;
			}
		}
		return data;
	}
	function hasBeenTampered(stream) {
		return stream.write !== stream.constructor.prototype.write;
	}
	function buildSafeSonicBoom(opts) {
		const stream = new SonicBoom(opts);
		stream.on("error", filterBrokenPipe);
		if (!opts.sync && isMainThread) {
			onExit.register(stream, autoEnd);
			stream.on("close", function() {
				onExit.unregister(stream);
			});
		}
		return stream;
		function filterBrokenPipe(err) {
			/* istanbul ignore next */
			if (err.code === "EPIPE") {
				stream.write = noop;
				stream.end = noop;
				stream.flushSync = noop;
				stream.destroy = noop;
				return;
			}
			stream.removeListener("error", filterBrokenPipe);
			stream.emit("error", err);
		}
	}
	function autoEnd(stream, eventName) {
		/* istanbul ignore next */
		if (stream.destroyed) return;
		if (eventName === "beforeExit") {
			stream.flush();
			stream.on("drain", function() {
				stream.end();
			});
		} else
 /* istanbul ignore next */
		stream.flushSync();
	}
	function createArgsNormalizer(defaultOptions) {
		return function normalizeArgs(instance, caller, opts = {}, stream) {
			if (typeof opts === "string") {
				stream = buildSafeSonicBoom({ dest: opts });
				opts = {};
			} else if (typeof stream === "string") {
				if (opts && opts.transport) throw Error("only one of option.transport or stream can be specified");
				stream = buildSafeSonicBoom({ dest: stream });
			} else if (opts instanceof SonicBoom || opts.writable || opts._writableState) {
				stream = opts;
				opts = {};
			} else if (opts.transport) {
				if (opts.transport instanceof SonicBoom || opts.transport.writable || opts.transport._writableState) throw Error("option.transport do not allow stream, please pass to option directly. e.g. pino(transport)");
				if (opts.transport.targets && opts.transport.targets.length && opts.formatters && typeof opts.formatters.level === "function") throw Error("option.transport.targets do not allow custom level formatters");
				let customLevels;
				if (opts.customLevels) customLevels = opts.useOnlyCustomLevels ? opts.customLevels : Object.assign({}, opts.levels, opts.customLevels);
				stream = transport({
					caller,
					...opts.transport,
					levels: customLevels
				});
			}
			opts = Object.assign({}, defaultOptions, opts);
			opts.serializers = Object.assign({}, defaultOptions.serializers, opts.serializers);
			opts.formatters = Object.assign({}, defaultOptions.formatters, opts.formatters);
			if (opts.prettyPrint) throw new Error("prettyPrint option is no longer supported, see the pino-pretty package (https://github.com/pinojs/pino-pretty)");
			const { enabled, onChild } = opts;
			if (enabled === false) opts.level = "silent";
			if (!onChild) opts.onChild = noop;
			if (!stream) if (!hasBeenTampered(process.stdout)) stream = buildSafeSonicBoom({ fd: process.stdout.fd || 1 });
			else stream = process.stdout;
			return {
				opts,
				stream
			};
		};
	}
	function stringify(obj, stringifySafeFn) {
		try {
			return JSON.stringify(obj);
		} catch (_) {
			try {
				return (stringifySafeFn || this[stringifySafeSym])(obj);
			} catch (_) {
				return "\"[unable to serialize, circular reference is too complex to analyze]\"";
			}
		}
	}
	function buildFormatters(level, bindings, log) {
		return {
			level,
			bindings,
			log
		};
	}
	/**
	* Convert a string integer file descriptor to a proper native integer
	* file descriptor.
	*
	* @param {string} destination The file descriptor string to attempt to convert.
	*
	* @returns {Number}
	*/
	function normalizeDestFileDescriptor(destination) {
		const fd = Number(destination);
		if (typeof destination === "string" && Number.isFinite(fd)) return fd;
		if (destination === void 0) return 1;
		return destination;
	}
	module.exports = {
		noop,
		buildSafeSonicBoom,
		asChindings,
		asJson,
		genLog,
		createArgsNormalizer,
		stringify,
		buildFormatters,
		normalizeDestFileDescriptor
	};
}));
//#endregion
//#region node_modules/pino/lib/constants.js
var require_constants$3 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		DEFAULT_LEVELS: {
			trace: 10,
			debug: 20,
			info: 30,
			warn: 40,
			error: 50,
			fatal: 60
		},
		SORTING_ORDER: {
			ASC: "ASC",
			DESC: "DESC"
		}
	};
}));
//#endregion
//#region node_modules/pino/lib/levels.js
var require_levels = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { lsCacheSym, levelValSym, useOnlyCustomLevelsSym, streamSym, formattersSym, hooksSym, levelCompSym } = require_symbols();
	var { noop, genLog } = require_tools$1();
	var { DEFAULT_LEVELS, SORTING_ORDER } = require_constants$3();
	var levelMethods = {
		fatal: (hook) => {
			const logFatal = genLog(DEFAULT_LEVELS.fatal, hook);
			return function(...args) {
				const stream = this[streamSym];
				logFatal.call(this, ...args);
				if (typeof stream.flushSync === "function") try {
					stream.flushSync();
				} catch (e) {}
			};
		},
		error: (hook) => genLog(DEFAULT_LEVELS.error, hook),
		warn: (hook) => genLog(DEFAULT_LEVELS.warn, hook),
		info: (hook) => genLog(DEFAULT_LEVELS.info, hook),
		debug: (hook) => genLog(DEFAULT_LEVELS.debug, hook),
		trace: (hook) => genLog(DEFAULT_LEVELS.trace, hook)
	};
	var nums = Object.keys(DEFAULT_LEVELS).reduce((o, k) => {
		o[DEFAULT_LEVELS[k]] = k;
		return o;
	}, {});
	var initialLsCache = Object.keys(nums).reduce((o, k) => {
		o[k] = "{\"level\":" + Number(k);
		return o;
	}, {});
	function genLsCache(instance) {
		const formatter = instance[formattersSym].level;
		const { labels } = instance.levels;
		const cache = {};
		for (const label in labels) {
			const level = formatter(labels[label], Number(label));
			cache[label] = JSON.stringify(level).slice(0, -1);
		}
		instance[lsCacheSym] = cache;
		return instance;
	}
	function isStandardLevel(level, useOnlyCustomLevels) {
		if (useOnlyCustomLevels) return false;
		switch (level) {
			case "fatal":
			case "error":
			case "warn":
			case "info":
			case "debug":
			case "trace": return true;
			default: return false;
		}
	}
	function setLevel(level) {
		const { labels, values } = this.levels;
		if (typeof level === "number") {
			if (labels[level] === void 0) throw Error("unknown level value" + level);
			level = labels[level];
		}
		if (values[level] === void 0) throw Error("unknown level " + level);
		const preLevelVal = this[levelValSym];
		const levelVal = this[levelValSym] = values[level];
		const useOnlyCustomLevelsVal = this[useOnlyCustomLevelsSym];
		const levelComparison = this[levelCompSym];
		const hook = this[hooksSym].logMethod;
		for (const key in values) {
			if (levelComparison(values[key], levelVal) === false) {
				this[key] = noop;
				continue;
			}
			this[key] = isStandardLevel(key, useOnlyCustomLevelsVal) ? levelMethods[key](hook) : genLog(values[key], hook);
		}
		this.emit("level-change", level, levelVal, labels[preLevelVal], preLevelVal, this);
	}
	function getLevel(level) {
		const { levels, levelVal } = this;
		return levels && levels.labels ? levels.labels[levelVal] : "";
	}
	function isLevelEnabled(logLevel) {
		const { values } = this.levels;
		const logLevelVal = values[logLevel];
		return logLevelVal !== void 0 && this[levelCompSym](logLevelVal, this[levelValSym]);
	}
	/**
	* Determine if the given `current` level is enabled by comparing it
	* against the current threshold (`expected`).
	*
	* @param {SORTING_ORDER} direction comparison direction "ASC" or "DESC"
	* @param {number} current current log level number representation
	* @param {number} expected threshold value to compare with
	* @returns {boolean}
	*/
	function compareLevel(direction, current, expected) {
		if (direction === SORTING_ORDER.DESC) return current <= expected;
		return current >= expected;
	}
	/**
	* Create a level comparison function based on `levelComparison`
	* it could a default function which compares levels either in "ascending" or "descending" order or custom comparison function
	*
	* @param {SORTING_ORDER | Function} levelComparison sort levels order direction or custom comparison function
	* @returns Function
	*/
	function genLevelComparison(levelComparison) {
		if (typeof levelComparison === "string") return compareLevel.bind(null, levelComparison);
		return levelComparison;
	}
	function mappings(customLevels = null, useOnlyCustomLevels = false) {
		const customNums = customLevels ? Object.keys(customLevels).reduce((o, k) => {
			o[customLevels[k]] = k;
			return o;
		}, {}) : null;
		return {
			labels: Object.assign(Object.create(Object.prototype, { Infinity: { value: "silent" } }), useOnlyCustomLevels ? null : nums, customNums),
			values: Object.assign(Object.create(Object.prototype, { silent: { value: Infinity } }), useOnlyCustomLevels ? null : DEFAULT_LEVELS, customLevels)
		};
	}
	function assertDefaultLevelFound(defaultLevel, customLevels, useOnlyCustomLevels) {
		if (typeof defaultLevel === "number") {
			if (![].concat(Object.keys(customLevels || {}).map((key) => customLevels[key]), useOnlyCustomLevels ? [] : Object.keys(nums).map((level) => +level), Infinity).includes(defaultLevel)) throw Error(`default level:${defaultLevel} must be included in custom levels`);
			return;
		}
		if (!(defaultLevel in Object.assign(Object.create(Object.prototype, { silent: { value: Infinity } }), useOnlyCustomLevels ? null : DEFAULT_LEVELS, customLevels))) throw Error(`default level:${defaultLevel} must be included in custom levels`);
	}
	function assertNoLevelCollisions(levels, customLevels) {
		const { labels, values } = levels;
		for (const k in customLevels) {
			if (k in values) throw Error("levels cannot be overridden");
			if (customLevels[k] in labels) throw Error("pre-existing level values cannot be used for new levels");
		}
	}
	/**
	* Validates whether `levelComparison` is correct
	*
	* @throws Error
	* @param {SORTING_ORDER | Function} levelComparison - value to validate
	* @returns
	*/
	function assertLevelComparison(levelComparison) {
		if (typeof levelComparison === "function") return;
		if (typeof levelComparison === "string" && Object.values(SORTING_ORDER).includes(levelComparison)) return;
		throw new Error("Levels comparison should be one of \"ASC\", \"DESC\" or \"function\" type");
	}
	module.exports = {
		initialLsCache,
		genLsCache,
		levelMethods,
		getLevel,
		setLevel,
		isLevelEnabled,
		mappings,
		assertNoLevelCollisions,
		assertDefaultLevelFound,
		genLevelComparison,
		assertLevelComparison
	};
}));
//#endregion
//#region node_modules/pino/lib/meta.js
var require_meta = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = { version: "10.3.1" };
}));
//#endregion
//#region node_modules/pino/lib/proto.js
var require_proto = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { EventEmitter: EventEmitter$1 } = __require("node:events");
	var { lsCacheSym, levelValSym, setLevelSym, getLevelSym, chindingsSym, mixinSym, asJsonSym, writeSym, mixinMergeStrategySym, timeSym, timeSliceIndexSym, streamSym, serializersSym, formattersSym, errorKeySym, messageKeySym, useOnlyCustomLevelsSym, needsMetadataGsym, redactFmtSym, stringifySym, formatOptsSym, stringifiersSym, msgPrefixSym, hooksSym } = require_symbols();
	var { getLevel, setLevel, isLevelEnabled, mappings, initialLsCache, genLsCache, assertNoLevelCollisions } = require_levels();
	var { asChindings, asJson, buildFormatters, stringify, noop } = require_tools$1();
	var { version } = require_meta();
	var redaction = require_redaction();
	var prototype = {
		constructor: class Pino {},
		child,
		bindings,
		setBindings,
		flush,
		isLevelEnabled,
		version,
		get level() {
			return this[getLevelSym]();
		},
		set level(lvl) {
			this[setLevelSym](lvl);
		},
		get levelVal() {
			return this[levelValSym];
		},
		set levelVal(n) {
			throw Error("levelVal is read-only");
		},
		get msgPrefix() {
			return this[msgPrefixSym];
		},
		get [Symbol.toStringTag]() {
			return "Pino";
		},
		[lsCacheSym]: initialLsCache,
		[writeSym]: write,
		[asJsonSym]: asJson,
		[getLevelSym]: getLevel,
		[setLevelSym]: setLevel
	};
	Object.setPrototypeOf(prototype, EventEmitter$1.prototype);
	module.exports = function() {
		return Object.create(prototype);
	};
	var resetChildingsFormatter = (bindings) => bindings;
	function child(bindings, options) {
		if (!bindings) throw Error("missing bindings for child Pino");
		const serializers = this[serializersSym];
		const formatters = this[formattersSym];
		const instance = Object.create(this);
		if (options == null) {
			if (instance[formattersSym].bindings !== resetChildingsFormatter) instance[formattersSym] = buildFormatters(formatters.level, resetChildingsFormatter, formatters.log);
			instance[chindingsSym] = asChindings(instance, bindings);
			if (this.onChild !== noop) this.onChild(instance);
			return instance;
		}
		if (options.hasOwnProperty("serializers") === true) {
			instance[serializersSym] = Object.create(null);
			for (const k in serializers) instance[serializersSym][k] = serializers[k];
			const parentSymbols = Object.getOwnPropertySymbols(serializers);
			for (var i = 0; i < parentSymbols.length; i++) {
				const ks = parentSymbols[i];
				instance[serializersSym][ks] = serializers[ks];
			}
			for (const bk in options.serializers) instance[serializersSym][bk] = options.serializers[bk];
			const bindingsSymbols = Object.getOwnPropertySymbols(options.serializers);
			for (var bi = 0; bi < bindingsSymbols.length; bi++) {
				const bks = bindingsSymbols[bi];
				instance[serializersSym][bks] = options.serializers[bks];
			}
		} else instance[serializersSym] = serializers;
		if (options.hasOwnProperty("formatters")) {
			const { level, bindings: chindings, log } = options.formatters;
			instance[formattersSym] = buildFormatters(level || formatters.level, chindings || resetChildingsFormatter, log || formatters.log);
		} else instance[formattersSym] = buildFormatters(formatters.level, resetChildingsFormatter, formatters.log);
		if (options.hasOwnProperty("customLevels") === true) {
			assertNoLevelCollisions(this.levels, options.customLevels);
			instance.levels = mappings(options.customLevels, instance[useOnlyCustomLevelsSym]);
			genLsCache(instance);
		}
		if (typeof options.redact === "object" && options.redact !== null || Array.isArray(options.redact)) {
			instance.redact = options.redact;
			const stringifiers = redaction(instance.redact, stringify);
			const formatOpts = { stringify: stringifiers[redactFmtSym] };
			instance[stringifySym] = stringify;
			instance[stringifiersSym] = stringifiers;
			instance[formatOptsSym] = formatOpts;
		}
		if (typeof options.msgPrefix === "string") instance[msgPrefixSym] = (this[msgPrefixSym] || "") + options.msgPrefix;
		instance[chindingsSym] = asChindings(instance, bindings);
		if (options.level !== void 0 && options.level !== this.level || options.hasOwnProperty("customLevels")) {
			const childLevel = options.level || this.level;
			instance[setLevelSym](childLevel);
		}
		this.onChild(instance);
		return instance;
	}
	function bindings() {
		const chindingsJson = `{${this[chindingsSym].substr(1)}}`;
		const bindingsFromJson = JSON.parse(chindingsJson);
		delete bindingsFromJson.pid;
		delete bindingsFromJson.hostname;
		return bindingsFromJson;
	}
	function setBindings(newBindings) {
		const chindings = asChindings(this, newBindings);
		this[chindingsSym] = chindings;
	}
	/**
	* Default strategy for creating `mergeObject` from arguments and the result from `mixin()`.
	* Fields from `mergeObject` have higher priority in this strategy.
	*
	* @param {Object} mergeObject The object a user has supplied to the logging function.
	* @param {Object} mixinObject The result of the `mixin` method.
	* @return {Object}
	*/
	function defaultMixinMergeStrategy(mergeObject, mixinObject) {
		return Object.assign(mixinObject, mergeObject);
	}
	function write(_obj, msg, num) {
		const t = this[timeSym]();
		const mixin = this[mixinSym];
		const errorKey = this[errorKeySym];
		const messageKey = this[messageKeySym];
		const mixinMergeStrategy = this[mixinMergeStrategySym] || defaultMixinMergeStrategy;
		let obj;
		const streamWriteHook = this[hooksSym].streamWrite;
		if (_obj === void 0 || _obj === null) obj = {};
		else if (_obj instanceof Error) {
			obj = { [errorKey]: _obj };
			if (msg === void 0) msg = _obj.message;
		} else {
			obj = _obj;
			if (msg === void 0 && _obj[messageKey] === void 0 && _obj[errorKey]) msg = _obj[errorKey].message;
		}
		if (mixin) obj = mixinMergeStrategy(obj, mixin(obj, num, this));
		const s = this[asJsonSym](obj, msg, num, t);
		const stream = this[streamSym];
		if (stream[needsMetadataGsym] === true) {
			stream.lastLevel = num;
			stream.lastObj = obj;
			stream.lastMsg = msg;
			stream.lastTime = t.slice(this[timeSliceIndexSym]);
			stream.lastLogger = this;
		}
		stream.write(streamWriteHook ? streamWriteHook(s) : s);
	}
	function flush(cb) {
		if (cb != null && typeof cb !== "function") throw Error("callback must be a function");
		const stream = this[streamSym];
		if (typeof stream.flush === "function") stream.flush(cb || noop);
		else if (cb) cb();
	}
}));
//#endregion
//#region node_modules/safe-stable-stringify/index.js
var require_safe_stable_stringify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { hasOwnProperty } = Object.prototype;
	var stringify = configure();
	stringify.configure = configure;
	stringify.stringify = stringify;
	stringify.default = stringify;
	exports.stringify = stringify;
	exports.configure = configure;
	module.exports = stringify;
	var strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;
	function strEscape(str) {
		if (str.length < 5e3 && !strEscapeSequencesRegExp.test(str)) return `"${str}"`;
		return JSON.stringify(str);
	}
	function sort(array, comparator) {
		if (array.length > 200 || comparator) return array.sort(comparator);
		for (let i = 1; i < array.length; i++) {
			const currentValue = array[i];
			let position = i;
			while (position !== 0 && array[position - 1] > currentValue) {
				array[position] = array[position - 1];
				position--;
			}
			array[position] = currentValue;
		}
		return array;
	}
	var typedArrayPrototypeGetSymbolToStringTag = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(/* @__PURE__ */ new Int8Array())), Symbol.toStringTag).get;
	function isTypedArrayWithEntries(value) {
		return typedArrayPrototypeGetSymbolToStringTag.call(value) !== void 0 && value.length !== 0;
	}
	function stringifyTypedArray(array, separator, maximumBreadth) {
		if (array.length < maximumBreadth) maximumBreadth = array.length;
		const whitespace = separator === "," ? "" : " ";
		let res = `"0":${whitespace}${array[0]}`;
		for (let i = 1; i < maximumBreadth; i++) res += `${separator}"${i}":${whitespace}${array[i]}`;
		return res;
	}
	function getCircularValueOption(options) {
		if (hasOwnProperty.call(options, "circularValue")) {
			const circularValue = options.circularValue;
			if (typeof circularValue === "string") return `"${circularValue}"`;
			if (circularValue == null) return circularValue;
			if (circularValue === Error || circularValue === TypeError) return { toString() {
				throw new TypeError("Converting circular structure to JSON");
			} };
			throw new TypeError("The \"circularValue\" argument must be of type string or the value null or undefined");
		}
		return "\"[Circular]\"";
	}
	function getDeterministicOption(options) {
		let value;
		if (hasOwnProperty.call(options, "deterministic")) {
			value = options.deterministic;
			if (typeof value !== "boolean" && typeof value !== "function") throw new TypeError("The \"deterministic\" argument must be of type boolean or comparator function");
		}
		return value === void 0 ? true : value;
	}
	function getBooleanOption(options, key) {
		let value;
		if (hasOwnProperty.call(options, key)) {
			value = options[key];
			if (typeof value !== "boolean") throw new TypeError(`The "${key}" argument must be of type boolean`);
		}
		return value === void 0 ? true : value;
	}
	function getPositiveIntegerOption(options, key) {
		let value;
		if (hasOwnProperty.call(options, key)) {
			value = options[key];
			if (typeof value !== "number") throw new TypeError(`The "${key}" argument must be of type number`);
			if (!Number.isInteger(value)) throw new TypeError(`The "${key}" argument must be an integer`);
			if (value < 1) throw new RangeError(`The "${key}" argument must be >= 1`);
		}
		return value === void 0 ? Infinity : value;
	}
	function getItemCount(number) {
		if (number === 1) return "1 item";
		return `${number} items`;
	}
	function getUniqueReplacerSet(replacerArray) {
		const replacerSet = /* @__PURE__ */ new Set();
		for (const value of replacerArray) if (typeof value === "string" || typeof value === "number") replacerSet.add(String(value));
		return replacerSet;
	}
	function getStrictOption(options) {
		if (hasOwnProperty.call(options, "strict")) {
			const value = options.strict;
			if (typeof value !== "boolean") throw new TypeError("The \"strict\" argument must be of type boolean");
			if (value) return (value) => {
				let message = `Object can not safely be stringified. Received type ${typeof value}`;
				if (typeof value !== "function") message += ` (${value.toString()})`;
				throw new Error(message);
			};
		}
	}
	function configure(options) {
		options = { ...options };
		const fail = getStrictOption(options);
		if (fail) {
			if (options.bigint === void 0) options.bigint = false;
			if (!("circularValue" in options)) options.circularValue = Error;
		}
		const circularValue = getCircularValueOption(options);
		const bigint = getBooleanOption(options, "bigint");
		const deterministic = getDeterministicOption(options);
		const comparator = typeof deterministic === "function" ? deterministic : void 0;
		const maximumDepth = getPositiveIntegerOption(options, "maximumDepth");
		const maximumBreadth = getPositiveIntegerOption(options, "maximumBreadth");
		function stringifyFnReplacer(key, parent, stack, replacer, spacer, indentation) {
			let value = parent[key];
			if (typeof value === "object" && value !== null && typeof value.toJSON === "function") value = value.toJSON(key);
			value = replacer.call(parent, key, value);
			switch (typeof value) {
				case "string": return strEscape(value);
				case "object": {
					if (value === null) return "null";
					if (stack.indexOf(value) !== -1) return circularValue;
					let res = "";
					let join = ",";
					const originalIndentation = indentation;
					if (Array.isArray(value)) {
						if (value.length === 0) return "[]";
						if (maximumDepth < stack.length + 1) return "\"[Array]\"";
						stack.push(value);
						if (spacer !== "") {
							indentation += spacer;
							res += `\n${indentation}`;
							join = `,\n${indentation}`;
						}
						const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
						let i = 0;
						for (; i < maximumValuesToStringify - 1; i++) {
							const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
							res += tmp !== void 0 ? tmp : "null";
							res += join;
						}
						const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
						res += tmp !== void 0 ? tmp : "null";
						if (value.length - 1 > maximumBreadth) {
							const removedKeys = value.length - maximumBreadth - 1;
							res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
						}
						if (spacer !== "") res += `\n${originalIndentation}`;
						stack.pop();
						return `[${res}]`;
					}
					let keys = Object.keys(value);
					const keyLength = keys.length;
					if (keyLength === 0) return "{}";
					if (maximumDepth < stack.length + 1) return "\"[Object]\"";
					let whitespace = "";
					let separator = "";
					if (spacer !== "") {
						indentation += spacer;
						join = `,\n${indentation}`;
						whitespace = " ";
					}
					const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
					if (deterministic && !isTypedArrayWithEntries(value)) keys = sort(keys, comparator);
					stack.push(value);
					for (let i = 0; i < maximumPropertiesToStringify; i++) {
						const key = keys[i];
						const tmp = stringifyFnReplacer(key, value, stack, replacer, spacer, indentation);
						if (tmp !== void 0) {
							res += `${separator}${strEscape(key)}:${whitespace}${tmp}`;
							separator = join;
						}
					}
					if (keyLength > maximumBreadth) {
						const removedKeys = keyLength - maximumBreadth;
						res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`;
						separator = join;
					}
					if (spacer !== "" && separator.length > 1) res = `\n${indentation}${res}\n${originalIndentation}`;
					stack.pop();
					return `{${res}}`;
				}
				case "number": return isFinite(value) ? String(value) : fail ? fail(value) : "null";
				case "boolean": return value === true ? "true" : "false";
				case "undefined": return;
				case "bigint": if (bigint) return String(value);
				default: return fail ? fail(value) : void 0;
			}
		}
		function stringifyArrayReplacer(key, value, stack, replacer, spacer, indentation) {
			if (typeof value === "object" && value !== null && typeof value.toJSON === "function") value = value.toJSON(key);
			switch (typeof value) {
				case "string": return strEscape(value);
				case "object": {
					if (value === null) return "null";
					if (stack.indexOf(value) !== -1) return circularValue;
					const originalIndentation = indentation;
					let res = "";
					let join = ",";
					if (Array.isArray(value)) {
						if (value.length === 0) return "[]";
						if (maximumDepth < stack.length + 1) return "\"[Array]\"";
						stack.push(value);
						if (spacer !== "") {
							indentation += spacer;
							res += `\n${indentation}`;
							join = `,\n${indentation}`;
						}
						const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
						let i = 0;
						for (; i < maximumValuesToStringify - 1; i++) {
							const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
							res += tmp !== void 0 ? tmp : "null";
							res += join;
						}
						const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
						res += tmp !== void 0 ? tmp : "null";
						if (value.length - 1 > maximumBreadth) {
							const removedKeys = value.length - maximumBreadth - 1;
							res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
						}
						if (spacer !== "") res += `\n${originalIndentation}`;
						stack.pop();
						return `[${res}]`;
					}
					stack.push(value);
					let whitespace = "";
					if (spacer !== "") {
						indentation += spacer;
						join = `,\n${indentation}`;
						whitespace = " ";
					}
					let separator = "";
					for (const key of replacer) {
						const tmp = stringifyArrayReplacer(key, value[key], stack, replacer, spacer, indentation);
						if (tmp !== void 0) {
							res += `${separator}${strEscape(key)}:${whitespace}${tmp}`;
							separator = join;
						}
					}
					if (spacer !== "" && separator.length > 1) res = `\n${indentation}${res}\n${originalIndentation}`;
					stack.pop();
					return `{${res}}`;
				}
				case "number": return isFinite(value) ? String(value) : fail ? fail(value) : "null";
				case "boolean": return value === true ? "true" : "false";
				case "undefined": return;
				case "bigint": if (bigint) return String(value);
				default: return fail ? fail(value) : void 0;
			}
		}
		function stringifyIndent(key, value, stack, spacer, indentation) {
			switch (typeof value) {
				case "string": return strEscape(value);
				case "object": {
					if (value === null) return "null";
					if (typeof value.toJSON === "function") {
						value = value.toJSON(key);
						if (typeof value !== "object") return stringifyIndent(key, value, stack, spacer, indentation);
						if (value === null) return "null";
					}
					if (stack.indexOf(value) !== -1) return circularValue;
					const originalIndentation = indentation;
					if (Array.isArray(value)) {
						if (value.length === 0) return "[]";
						if (maximumDepth < stack.length + 1) return "\"[Array]\"";
						stack.push(value);
						indentation += spacer;
						let res = `\n${indentation}`;
						const join = `,\n${indentation}`;
						const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
						let i = 0;
						for (; i < maximumValuesToStringify - 1; i++) {
							const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
							res += tmp !== void 0 ? tmp : "null";
							res += join;
						}
						const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
						res += tmp !== void 0 ? tmp : "null";
						if (value.length - 1 > maximumBreadth) {
							const removedKeys = value.length - maximumBreadth - 1;
							res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
						}
						res += `\n${originalIndentation}`;
						stack.pop();
						return `[${res}]`;
					}
					let keys = Object.keys(value);
					const keyLength = keys.length;
					if (keyLength === 0) return "{}";
					if (maximumDepth < stack.length + 1) return "\"[Object]\"";
					indentation += spacer;
					const join = `,\n${indentation}`;
					let res = "";
					let separator = "";
					let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
					if (isTypedArrayWithEntries(value)) {
						res += stringifyTypedArray(value, join, maximumBreadth);
						keys = keys.slice(value.length);
						maximumPropertiesToStringify -= value.length;
						separator = join;
					}
					if (deterministic) keys = sort(keys, comparator);
					stack.push(value);
					for (let i = 0; i < maximumPropertiesToStringify; i++) {
						const key = keys[i];
						const tmp = stringifyIndent(key, value[key], stack, spacer, indentation);
						if (tmp !== void 0) {
							res += `${separator}${strEscape(key)}: ${tmp}`;
							separator = join;
						}
					}
					if (keyLength > maximumBreadth) {
						const removedKeys = keyLength - maximumBreadth;
						res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`;
						separator = join;
					}
					if (separator !== "") res = `\n${indentation}${res}\n${originalIndentation}`;
					stack.pop();
					return `{${res}}`;
				}
				case "number": return isFinite(value) ? String(value) : fail ? fail(value) : "null";
				case "boolean": return value === true ? "true" : "false";
				case "undefined": return;
				case "bigint": if (bigint) return String(value);
				default: return fail ? fail(value) : void 0;
			}
		}
		function stringifySimple(key, value, stack) {
			switch (typeof value) {
				case "string": return strEscape(value);
				case "object": {
					if (value === null) return "null";
					if (typeof value.toJSON === "function") {
						value = value.toJSON(key);
						if (typeof value !== "object") return stringifySimple(key, value, stack);
						if (value === null) return "null";
					}
					if (stack.indexOf(value) !== -1) return circularValue;
					let res = "";
					const hasLength = value.length !== void 0;
					if (hasLength && Array.isArray(value)) {
						if (value.length === 0) return "[]";
						if (maximumDepth < stack.length + 1) return "\"[Array]\"";
						stack.push(value);
						const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
						let i = 0;
						for (; i < maximumValuesToStringify - 1; i++) {
							const tmp = stringifySimple(String(i), value[i], stack);
							res += tmp !== void 0 ? tmp : "null";
							res += ",";
						}
						const tmp = stringifySimple(String(i), value[i], stack);
						res += tmp !== void 0 ? tmp : "null";
						if (value.length - 1 > maximumBreadth) {
							const removedKeys = value.length - maximumBreadth - 1;
							res += `,"... ${getItemCount(removedKeys)} not stringified"`;
						}
						stack.pop();
						return `[${res}]`;
					}
					let keys = Object.keys(value);
					const keyLength = keys.length;
					if (keyLength === 0) return "{}";
					if (maximumDepth < stack.length + 1) return "\"[Object]\"";
					let separator = "";
					let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
					if (hasLength && isTypedArrayWithEntries(value)) {
						res += stringifyTypedArray(value, ",", maximumBreadth);
						keys = keys.slice(value.length);
						maximumPropertiesToStringify -= value.length;
						separator = ",";
					}
					if (deterministic) keys = sort(keys, comparator);
					stack.push(value);
					for (let i = 0; i < maximumPropertiesToStringify; i++) {
						const key = keys[i];
						const tmp = stringifySimple(key, value[key], stack);
						if (tmp !== void 0) {
							res += `${separator}${strEscape(key)}:${tmp}`;
							separator = ",";
						}
					}
					if (keyLength > maximumBreadth) {
						const removedKeys = keyLength - maximumBreadth;
						res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
					}
					stack.pop();
					return `{${res}}`;
				}
				case "number": return isFinite(value) ? String(value) : fail ? fail(value) : "null";
				case "boolean": return value === true ? "true" : "false";
				case "undefined": return;
				case "bigint": if (bigint) return String(value);
				default: return fail ? fail(value) : void 0;
			}
		}
		function stringify(value, replacer, space) {
			if (arguments.length > 1) {
				let spacer = "";
				if (typeof space === "number") spacer = " ".repeat(Math.min(space, 10));
				else if (typeof space === "string") spacer = space.slice(0, 10);
				if (replacer != null) {
					if (typeof replacer === "function") return stringifyFnReplacer("", { "": value }, [], replacer, spacer, "");
					if (Array.isArray(replacer)) return stringifyArrayReplacer("", value, [], getUniqueReplacerSet(replacer), spacer, "");
				}
				if (spacer.length !== 0) return stringifyIndent("", value, [], spacer, "");
			}
			return stringifySimple("", value, []);
		}
		return stringify;
	}
}));
//#endregion
//#region node_modules/pino/lib/multistream.js
var require_multistream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var metadata = Symbol.for("pino.metadata");
	var { DEFAULT_LEVELS } = require_constants$3();
	var DEFAULT_INFO_LEVEL = DEFAULT_LEVELS.info;
	function multistream(streamsArray, opts) {
		streamsArray = streamsArray || [];
		opts = opts || { dedupe: false };
		const streamLevels = Object.create(DEFAULT_LEVELS);
		streamLevels.silent = Infinity;
		if (opts.levels && typeof opts.levels === "object") Object.keys(opts.levels).forEach((i) => {
			streamLevels[i] = opts.levels[i];
		});
		const res = {
			write,
			add,
			remove,
			emit,
			flushSync,
			end,
			minLevel: 0,
			lastId: 0,
			streams: [],
			clone,
			[metadata]: true,
			streamLevels
		};
		if (Array.isArray(streamsArray)) streamsArray.forEach(add, res);
		else add.call(res, streamsArray);
		streamsArray = null;
		return res;
		function write(data) {
			let dest;
			const level = this.lastLevel;
			const { streams } = this;
			let recordedLevel = 0;
			let stream;
			for (let i = initLoopVar(streams.length, opts.dedupe); checkLoopVar(i, streams.length, opts.dedupe); i = adjustLoopVar(i, opts.dedupe)) {
				dest = streams[i];
				if (dest.level <= level) {
					if (recordedLevel !== 0 && recordedLevel !== dest.level) break;
					stream = dest.stream;
					if (stream[metadata]) {
						const { lastTime, lastMsg, lastObj, lastLogger } = this;
						stream.lastLevel = level;
						stream.lastTime = lastTime;
						stream.lastMsg = lastMsg;
						stream.lastObj = lastObj;
						stream.lastLogger = lastLogger;
					}
					stream.write(data);
					if (opts.dedupe) recordedLevel = dest.level;
				} else if (!opts.dedupe) break;
			}
		}
		function emit(...args) {
			for (const { stream } of this.streams) if (typeof stream.emit === "function") stream.emit(...args);
		}
		function flushSync() {
			for (const { stream } of this.streams) if (typeof stream.flushSync === "function") stream.flushSync();
		}
		function add(dest) {
			if (!dest) return res;
			const isStream = typeof dest.write === "function" || dest.stream;
			const stream_ = dest.write ? dest : dest.stream;
			if (!isStream) throw Error("stream object needs to implement either StreamEntry or DestinationStream interface");
			const { streams, streamLevels } = this;
			let level;
			if (typeof dest.levelVal === "number") level = dest.levelVal;
			else if (typeof dest.level === "string") level = streamLevels[dest.level];
			else if (typeof dest.level === "number") level = dest.level;
			else level = DEFAULT_INFO_LEVEL;
			const dest_ = {
				stream: stream_,
				level,
				levelVal: void 0,
				id: ++res.lastId
			};
			streams.unshift(dest_);
			streams.sort(compareByLevel);
			this.minLevel = streams[0].level;
			return res;
		}
		function remove(id) {
			const { streams } = this;
			const index = streams.findIndex((s) => s.id === id);
			if (index >= 0) {
				streams.splice(index, 1);
				streams.sort(compareByLevel);
				this.minLevel = streams.length > 0 ? streams[0].level : -1;
			}
			return res;
		}
		function end() {
			for (const { stream } of this.streams) {
				if (typeof stream.flushSync === "function") stream.flushSync();
				stream.end();
			}
		}
		function clone(level) {
			const streams = new Array(this.streams.length);
			for (let i = 0; i < streams.length; i++) streams[i] = {
				level,
				stream: this.streams[i].stream
			};
			return {
				write,
				add,
				remove,
				minLevel: level,
				streams,
				clone,
				emit,
				flushSync,
				[metadata]: true
			};
		}
	}
	function compareByLevel(a, b) {
		return a.level - b.level;
	}
	function initLoopVar(length, dedupe) {
		return dedupe ? length - 1 : 0;
	}
	function adjustLoopVar(i, dedupe) {
		return dedupe ? i - 1 : i + 1;
	}
	function checkLoopVar(i, length, dedupe) {
		return dedupe ? i >= 0 : i < length;
	}
	module.exports = multistream;
}));
//#endregion
//#region node_modules/pino/pino.js
var require_pino = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var os = __require("node:os");
	var stdSerializers = require_pino_std_serializers();
	var caller = require_caller();
	var redaction = require_redaction();
	var time = require_time();
	var proto = require_proto();
	var symbols = require_symbols();
	var { configure } = require_safe_stable_stringify();
	var { assertDefaultLevelFound, mappings, genLsCache, genLevelComparison, assertLevelComparison } = require_levels();
	var { DEFAULT_LEVELS, SORTING_ORDER } = require_constants$3();
	var { createArgsNormalizer, asChindings, buildSafeSonicBoom, buildFormatters, stringify, normalizeDestFileDescriptor, noop } = require_tools$1();
	var { version } = require_meta();
	var { chindingsSym, redactFmtSym, serializersSym, timeSym, timeSliceIndexSym, streamSym, stringifySym, stringifySafeSym, stringifiersSym, setLevelSym, endSym, formatOptsSym, messageKeySym, errorKeySym, nestedKeySym, mixinSym, levelCompSym, useOnlyCustomLevelsSym, formattersSym, hooksSym, nestedKeyStrSym, mixinMergeStrategySym, msgPrefixSym } = symbols;
	var { epochTime, nullTime } = time;
	var { pid } = process;
	var hostname = os.hostname();
	var defaultErrorSerializer = stdSerializers.err;
	var normalize = createArgsNormalizer({
		level: "info",
		levelComparison: SORTING_ORDER.ASC,
		levels: DEFAULT_LEVELS,
		messageKey: "msg",
		errorKey: "err",
		nestedKey: null,
		enabled: true,
		base: {
			pid,
			hostname
		},
		serializers: Object.assign(Object.create(null), { err: defaultErrorSerializer }),
		formatters: Object.assign(Object.create(null), {
			bindings(bindings) {
				return bindings;
			},
			level(label, number) {
				return { level: number };
			}
		}),
		hooks: {
			logMethod: void 0,
			streamWrite: void 0
		},
		timestamp: epochTime,
		name: void 0,
		redact: null,
		customLevels: null,
		useOnlyCustomLevels: false,
		depthLimit: 5,
		edgeLimit: 100
	});
	var serializers = Object.assign(Object.create(null), stdSerializers);
	function pino(...args) {
		const instance = {};
		const { opts, stream } = normalize(instance, caller(), ...args);
		if (opts.level && typeof opts.level === "string" && DEFAULT_LEVELS[opts.level.toLowerCase()] !== void 0) opts.level = opts.level.toLowerCase();
		const { redact, crlf, serializers, timestamp, messageKey, errorKey, nestedKey, base, name, level, customLevels, levelComparison, mixin, mixinMergeStrategy, useOnlyCustomLevels, formatters, hooks, depthLimit, edgeLimit, onChild, msgPrefix } = opts;
		const stringifySafe = configure({
			maximumDepth: depthLimit,
			maximumBreadth: edgeLimit
		});
		const allFormatters = buildFormatters(formatters.level, formatters.bindings, formatters.log);
		const stringifyFn = stringify.bind({ [stringifySafeSym]: stringifySafe });
		const stringifiers = redact ? redaction(redact, stringifyFn) : {};
		const formatOpts = redact ? { stringify: stringifiers[redactFmtSym] } : { stringify: stringifyFn };
		const end = "}" + (crlf ? "\r\n" : "\n");
		const coreChindings = asChindings.bind(null, {
			[chindingsSym]: "",
			[serializersSym]: serializers,
			[stringifiersSym]: stringifiers,
			[stringifySym]: stringify,
			[stringifySafeSym]: stringifySafe,
			[formattersSym]: allFormatters
		});
		let chindings = "";
		if (base !== null) if (name === void 0) chindings = coreChindings(base);
		else chindings = coreChindings(Object.assign({}, base, { name }));
		const time = timestamp instanceof Function ? timestamp : timestamp ? epochTime : nullTime;
		const timeSliceIndex = time().indexOf(":") + 1;
		if (useOnlyCustomLevels && !customLevels) throw Error("customLevels is required if useOnlyCustomLevels is set true");
		if (mixin && typeof mixin !== "function") throw Error(`Unknown mixin type "${typeof mixin}" - expected "function"`);
		if (msgPrefix && typeof msgPrefix !== "string") throw Error(`Unknown msgPrefix type "${typeof msgPrefix}" - expected "string"`);
		assertDefaultLevelFound(level, customLevels, useOnlyCustomLevels);
		const levels = mappings(customLevels, useOnlyCustomLevels);
		if (typeof stream.emit === "function") stream.emit("message", {
			code: "PINO_CONFIG",
			config: {
				levels,
				messageKey,
				errorKey
			}
		});
		assertLevelComparison(levelComparison);
		const levelCompFunc = genLevelComparison(levelComparison);
		Object.assign(instance, {
			levels,
			[levelCompSym]: levelCompFunc,
			[useOnlyCustomLevelsSym]: useOnlyCustomLevels,
			[streamSym]: stream,
			[timeSym]: time,
			[timeSliceIndexSym]: timeSliceIndex,
			[stringifySym]: stringify,
			[stringifySafeSym]: stringifySafe,
			[stringifiersSym]: stringifiers,
			[endSym]: end,
			[formatOptsSym]: formatOpts,
			[messageKeySym]: messageKey,
			[errorKeySym]: errorKey,
			[nestedKeySym]: nestedKey,
			[nestedKeyStrSym]: nestedKey ? `,${JSON.stringify(nestedKey)}:{` : "",
			[serializersSym]: serializers,
			[mixinSym]: mixin,
			[mixinMergeStrategySym]: mixinMergeStrategy,
			[chindingsSym]: chindings,
			[formattersSym]: allFormatters,
			[hooksSym]: hooks,
			silent: noop,
			onChild,
			[msgPrefixSym]: msgPrefix
		});
		Object.setPrototypeOf(instance, proto());
		genLsCache(instance);
		instance[setLevelSym](level);
		return instance;
	}
	module.exports = pino;
	module.exports.destination = (dest = process.stdout.fd) => {
		if (typeof dest === "object") {
			dest.dest = normalizeDestFileDescriptor(dest.dest || process.stdout.fd);
			return buildSafeSonicBoom(dest);
		} else return buildSafeSonicBoom({
			dest: normalizeDestFileDescriptor(dest),
			minLength: 0
		});
	};
	module.exports.transport = require_transport();
	module.exports.multistream = require_multistream();
	module.exports.levels = mappings();
	module.exports.stdSerializers = serializers;
	module.exports.stdTimeFunctions = Object.assign({}, time);
	module.exports.symbols = symbols;
	module.exports.version = version;
	module.exports.default = pino;
	module.exports.pino = pino;
}));
//#endregion
//#region node_modules/imapflow/lib/logger.js
var require_logger = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var logger = require_pino()();
	logger.level = "trace";
	module.exports = logger;
}));
//#endregion
//#region node_modules/imapflow/lib/limited-passthrough.js
var require_limited_passthrough = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Transform: Transform$2 } = __require("stream");
	var LimitedPassthrough = class extends Transform$2 {
		constructor(options) {
			super();
			this.options = options || {};
			this.maxBytes = this.options.maxBytes || Infinity;
			this.processed = 0;
			this.limited = false;
		}
		_transform(chunk, encoding, done) {
			if (this.limited) return done();
			const remainingBytes = this.maxBytes - this.processed;
			if (remainingBytes < 1) return done();
			if (chunk.length > remainingBytes) chunk = chunk.slice(0, remainingBytes);
			this.processed += chunk.length;
			if (this.processed >= this.maxBytes) this.limited = true;
			this.push(chunk);
			done();
		}
	};
	module.exports.LimitedPassthrough = LimitedPassthrough;
}));
//#endregion
//#region node_modules/imapflow/lib/handler/imap-stream.js
var require_imap_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Transform$1 = __require("stream").Transform;
	var logger = require_logger();
	var LINE = 1;
	var LITERAL = 2;
	var LF = 10;
	var CR = 13;
	var NUM_0 = 48;
	var NUM_9 = 57;
	var CURLY_OPEN = 123;
	var CURLY_CLOSE = 125;
	var MAX_LITERAL_SIZE = 1024 * 1024 * 1024;
	var MAX_LINE_SIZE = MAX_LITERAL_SIZE;
	/**
	* A Transform stream that parses raw IMAP protocol data from a socket into structured
	* command/response objects. Reads binary input, splits it into lines delimited by LF,
	* extracts literal data blocks based on IMAP literal size markers (e.g., "{123}\r\n"),
	* and emits each complete command as a readable object containing the payload Buffer
	* and any associated literal Buffers. Enforces a maximum literal size of 1GB.
	*
	* @extends Transform
	*/
	var ImapStream = class extends Transform$1 {
		/**
		* Creates a new ImapStream instance.
		*
		* @param {Object} [options] - Stream options.
		* @param {string} [options.cid] - Connection identifier used for logging.
		* @param {Object} [options.logger] - A pino-compatible logger instance. If not provided, a default child logger is created.
		* @param {boolean} [options.logRaw] - If true, logs raw socket data at trace level.
		* @param {boolean} [options.secureConnection] - Whether the connection uses TLS.
		* @param {number} [options.maxLineLength] - Maximum allowed length (in bytes) of a single
		*   line (a response without a literal). Defaults to MAX_LITERAL_SIZE (1GB). Guards against a
		*   malicious or broken server that never sends a line terminator, which would otherwise grow
		*   the internal line buffer without bound.
		* @param {number} [options.maxLiteralSize] - Maximum allowed size (in bytes) of a single
		*   literal block. Defaults to MAX_LITERAL_SIZE (1GB). Lower it to bound peak memory
		*   allocation against a malicious or broken server announcing an oversized literal.
		*/
		constructor(options) {
			super({
				readableObjectMode: true,
				writableObjectMode: false
			});
			this.options = options || {};
			this.cid = this.options.cid;
			this.log = this.options.logger && typeof this.options.logger === "object" ? this.options.logger : logger.child({
				component: "imap-connection",
				cid: this.cid
			});
			this.readBytesCounter = 0;
			this.maxLineLength = Number.isInteger(this.options.maxLineLength) && this.options.maxLineLength >= 0 ? this.options.maxLineLength : MAX_LINE_SIZE;
			this.maxLiteralSize = Number.isInteger(this.options.maxLiteralSize) && this.options.maxLiteralSize >= 0 ? this.options.maxLiteralSize : MAX_LITERAL_SIZE;
			this.state = LINE;
			this.literalWaiting = 0;
			this.inputBuffer = [];
			this.lineBuffer = [];
			this.lineBytes = 0;
			this.literalBuffer = [];
			this.literals = [];
			this.compress = false;
			this.secureConnection = this.options.secureConnection;
			this.processingInput = false;
			this.inputQueue = [];
		}
		/**
		* Checks whether the given line buffer ends with an IMAP literal size marker
		* (e.g., "{123}\r\n"). If a valid marker is found and the literal size is within
		* the allowed maximum, switches the stream state to LITERAL mode and records
		* the expected number of literal bytes.
		*
		* @param {Buffer} line - The line buffer to check for a trailing literal marker.
		* @returns {boolean} True if a valid literal marker was found and literal state was activated, false otherwise.
		*/
		checkLiteralMarker(line) {
			if (!line || !line.length) return false;
			let pos = line.length - 1;
			if (line[pos] !== LF) return false;
			pos--;
			if (pos >= 0 && line[pos] === CR) pos--;
			if (pos < 0 || !pos || line[pos] !== CURLY_CLOSE) return false;
			pos--;
			let numBytes = [];
			for (; pos >= 0; pos--) {
				let c = line[pos];
				if (c >= NUM_0 && c <= NUM_9) {
					numBytes.unshift(c);
					continue;
				}
				if (c === CURLY_OPEN && numBytes.length) {
					const literalSize = Number(Buffer.from(numBytes).toString());
					if (literalSize > this.maxLiteralSize) {
						const err = /* @__PURE__ */ new Error(`Literal size ${literalSize} exceeds maximum allowed size of ${this.maxLiteralSize} bytes`);
						err.code = "LiteralTooLarge";
						err.literalSize = literalSize;
						err.maxSize = this.maxLiteralSize;
						this.emit("error", err);
						return false;
					}
					this.state = LITERAL;
					this.literalWaiting = literalSize;
					return true;
				}
				return false;
			}
			return false;
		}
		/**
		* Processes a single input chunk of raw data. In LINE state, scans for LF-terminated
		* lines and checks for literal markers. In LITERAL state, collects the expected number
		* of literal bytes. When a complete command (with all its literals) is assembled, it is
		* pushed downstream as a readable object.
		*
		* @param {Buffer} chunk - The raw data chunk to process.
		* @param {number} [startPos=0] - The byte offset within the chunk to start processing from.
		* @returns {Promise<void>}
		*/
		async processInputChunk(chunk, startPos) {
			startPos = startPos || 0;
			if (startPos >= chunk.length) return;
			switch (this.state) {
				case LINE: {
					let lineStart = startPos;
					for (let i = startPos, len = chunk.length; i < len; i++) if (chunk[i] === LF) {
						this.lineBuffer.push(chunk.slice(lineStart, i + 1));
						lineStart = i + 1;
						let line = Buffer.concat(this.lineBuffer);
						this.inputBuffer.push(line);
						this.lineBuffer = [];
						this.lineBytes = 0;
						if (this.checkLiteralMarker(line)) return await this.processInputChunk(chunk, lineStart);
						let payload = this.inputBuffer.length === 1 ? this.inputBuffer[0] : Buffer.concat(this.inputBuffer);
						let literals = this.literals;
						this.inputBuffer = [];
						this.literals = [];
						if (payload.length) {
							if (payload[payload.length - 1] === LF) {
								let end = payload.length - 1;
								if (end > 0 && payload[end - 1] === CR) end--;
								payload = payload.slice(0, end);
							}
							if (payload.length) {
								let trailingAfterLine = lineStart < chunk.length || this.inputQueue.length > 0;
								await new Promise((resolve) => {
									this.push({
										payload,
										literals,
										next: resolve,
										trailingAfterLine
									});
								});
							}
						}
					}
					if (lineStart < chunk.length) {
						let tail = chunk.slice(lineStart);
						let lineLength = this.lineBytes + tail.length;
						if (lineLength > this.maxLineLength) {
							const err = /* @__PURE__ */ new Error(`Line length ${lineLength} exceeds maximum allowed size of ${this.maxLineLength} bytes`);
							err.code = "LineTooLarge";
							err.lineLength = lineLength;
							err.maxSize = this.maxLineLength;
							this.emit("error", err);
							return;
						}
						this.lineBytes = lineLength;
						this.lineBuffer.push(tail);
					}
					break;
				}
				case LITERAL: {
					const remainingInChunk = chunk.length - startPos;
					const bytesToRead = Math.min(remainingInChunk, this.literalWaiting);
					const partial = startPos === 0 && bytesToRead === chunk.length ? chunk : chunk.slice(startPos, startPos + bytesToRead);
					this.literalBuffer.push(partial);
					this.literalWaiting -= bytesToRead;
					if (this.literalWaiting === 0) {
						this.literals.push(Buffer.concat(this.literalBuffer));
						this.literalBuffer = [];
						this.state = LINE;
						if (remainingInChunk > bytesToRead) return await this.processInputChunk(chunk, startPos + bytesToRead);
					}
					break;
				}
			}
		}
		/**
		* Drains the input queue by processing each queued chunk sequentially.
		* Yields to the event loop every 10 chunks to prevent CPU blocking on
		* large bursts of incoming data.
		*
		* @returns {Promise<void>}
		*/
		async processInput() {
			let data;
			let processedCount = 0;
			while (data = this.inputQueue.shift()) {
				await this.processInputChunk(data.chunk);
				data.next();
				processedCount++;
				if (processedCount % 10 === 0) await new Promise((resolve) => setImmediate(resolve));
			}
		}
		/**
		* Transform stream implementation. Receives raw data chunks from the writable side,
		* converts strings to Buffers, tracks total bytes read, optionally logs raw data,
		* and queues the chunk for asynchronous processing.
		*
		* @param {Buffer|string} chunk - The incoming data chunk.
		* @param {string} encoding - The encoding if chunk is a string.
		* @param {Function} next - Callback to signal that this chunk has been consumed.
		*/
		_transform(chunk, encoding, next) {
			if (typeof chunk === "string") chunk = Buffer.from(chunk, encoding);
			if (!chunk || !chunk.length) return next();
			this.readBytesCounter += chunk.length;
			if (this.options.logRaw) this.log.trace({
				src: "s",
				msg: "read from socket",
				data: chunk.toString("base64"),
				compress: !!this.compress,
				secure: !!this.secureConnection,
				cid: this.cid
			});
			this.inputQueue.push({
				chunk,
				next
			});
			if (!this.processingInput) {
				this.processingInput = true;
				this.processInput().catch((err) => this.emit("error", err)).finally(() => this.processingInput = false);
			}
		}
		/**
		* Flush implementation called when the writable side ends. Signals completion immediately.
		*
		* @param {Function} next - Callback to signal flush completion.
		*/
		_flush(next) {
			next();
		}
		/**
		* Destroy implementation for cleanup. Clears all internal buffers, drains the input queue
		* by invoking pending callbacks, and forwards the error (if any) to the callback.
		*
		* @param {Error|null} err - The error that caused destruction, or null.
		* @param {Function} callback - Callback to signal destruction completion.
		*/
		_destroy(err, callback) {
			this.inputBuffer = [];
			this.lineBuffer = [];
			this.lineBytes = 0;
			this.literalBuffer = [];
			this.literals = [];
			while (this.inputQueue.length) {
				const item = this.inputQueue.shift();
				if (typeof item.next === "function") item.next();
			}
			callback(err);
		}
	};
	module.exports.ImapStream = ImapStream;
}));
//#endregion
//#region node_modules/imapflow/lib/handler/imap-formal-syntax.js
var require_imap_formal_syntax = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* @module imap-formal-syntax
	*
	* Defines the IMAP formal syntax character classes and validation rules as specified
	* in RFC 3501 Section 9 (http://tools.ietf.org/html/rfc3501#section-9).
	*
	* Each exported method returns a string of allowed characters for a given IMAP grammar
	* production rule (e.g., ATOM-CHAR, ASTRING-CHAR, TEXT-CHAR). Results are memoized after
	* the first call by replacing the method with a function that returns the cached value.
	*
	* Also exports a {@link module:imap-formal-syntax.verify|verify} function for validating
	* strings against a set of allowed characters.
	*/
	/**
	* Generates a string containing all characters in the given Unicode code point range (inclusive).
	*
	* @param {number} start - The starting character code point.
	* @param {number} end - The ending character code point.
	* @returns {string} A string containing all characters from start to end.
	*/
	function expandRange(start, end) {
		let chars = [];
		for (let i = start; i <= end; i++) chars.push(i);
		return String.fromCharCode(...chars);
	}
	/**
	* Returns a new string with all characters from the exclude string removed from the source string.
	*
	* @param {string} source - The source string to filter.
	* @param {string} exclude - A string of characters to exclude from the source.
	* @returns {string} The source string with excluded characters removed.
	*/
	function excludeChars(source, exclude) {
		return Array.prototype.filter.call(source, (ch) => exclude.indexOf(ch) < 0).join("");
	}
	module.exports = {
		/** @returns {string} All 7-bit US-ASCII characters excluding NUL (0x01-0x7F). */
		CHAR() {
			let value = expandRange(1, 127);
			this.CHAR = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} All 8-bit characters excluding NUL (0x01-0xFF). */
		CHAR8() {
			let value = expandRange(1, 255);
			this.CHAR8 = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} The space character (0x20). */
		SP() {
			return " ";
		},
		/** @returns {string} All control characters (0x00-0x1F and 0x7F). */
		CTL() {
			let value = expandRange(0, 31) + "";
			this.CTL = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} The double-quote character. */
		DQUOTE() {
			return "\"";
		},
		/** @returns {string} All uppercase and lowercase ASCII alphabetic characters (A-Z, a-z). */
		ALPHA() {
			let value = expandRange(65, 90) + expandRange(97, 122);
			this.ALPHA = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} All ASCII digit characters (0-9). */
		DIGIT() {
			let value = expandRange(48, 57);
			this.DIGIT = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} Characters allowed in an IMAP ATOM (CHAR minus atom-specials). */
		"ATOM-CHAR"() {
			let value = excludeChars(this.CHAR(), this["atom-specials"]());
			this["ATOM-CHAR"] = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} Characters allowed in an IMAP ASTRING (ATOM-CHAR plus resp-specials). */
		"ASTRING-CHAR"() {
			let value = this["ATOM-CHAR"]() + this["resp-specials"]();
			this["ASTRING-CHAR"] = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} Characters allowed in IMAP text (CHAR minus CR and LF). */
		"TEXT-CHAR"() {
			let value = excludeChars(this.CHAR(), "\r\n");
			this["TEXT-CHAR"] = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} Characters that are special in ATOMs and must be excluded: "(", ")", "{", SP, CTL, list-wildcards, quoted-specials, resp-specials. */
		"atom-specials"() {
			let value = "(){" + this.SP() + this.CTL() + this["list-wildcards"]() + this["quoted-specials"]() + this["resp-specials"]();
			this["atom-specials"] = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} The LIST wildcard characters ("%" and "*"). */
		"list-wildcards"() {
			return "%*";
		},
		/** @returns {string} Characters that are special inside quoted strings (DQUOTE and backslash). */
		"quoted-specials"() {
			let value = this.DQUOTE() + "\\";
			this["quoted-specials"] = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} The response-special character ("]"). */
		"resp-specials"() {
			return "]";
		},
		/** @returns {string} Characters allowed in an IMAP tag (ASTRING-CHAR minus "+"). */
		tag() {
			let value = excludeChars(this["ASTRING-CHAR"](), "+");
			this.tag = function() {
				return value;
			};
			return value;
		},
		/** @returns {string} Characters allowed in an IMAP command name (ALPHA, DIGIT, and hyphen). */
		command() {
			let value = this.ALPHA() + this.DIGIT() + "-";
			this.command = function() {
				return value;
			};
			return value;
		},
		/**
		* Verifies that every character in the given string is within the set of allowed characters.
		*
		* @param {string} str - The string to validate.
		* @param {string} allowedChars - A string containing all allowed characters.
		* @returns {number} The index of the first disallowed character, or -1 if all characters are valid.
		*/
		verify(str, allowedChars) {
			for (let i = 0, len = str.length; i < len; i++) if (allowedChars.indexOf(str.charAt(i)) < 0) return i;
			return -1;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/handler/token-parser.js
var require_token_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var imapFormalSyntax = require_imap_formal_syntax();
	var STATE_ATOM = 1;
	var STATE_LITERAL = 2;
	var STATE_NORMAL = 3;
	var STATE_PARTIAL = 4;
	var STATE_SEQUENCE = 5;
	var STATE_STRING = 6;
	var RE_DIGITS = /^\d+$/;
	var RE_SINGLE_DIGIT = /^\d$/;
	var MAX_NODE_DEPTH = 25;
	/**
	* Tokenizes an IMAP attribute string into a tree of typed nodes.
	* Handles all IMAP data types: atoms, quoted strings, literals (including literal8),
	* sequences, lists (parenthesized groups), sections (bracketed groups), and partial ranges.
	* Enforces a maximum nesting depth of {@link MAX_NODE_DEPTH} to prevent stack overflow
	* from malicious input.
	*/
	var TokenParser = class {
		/**
		* Creates a new TokenParser.
		*
		* @param {ParserInstance} parent - The parent ParserInstance that owns this token parser. Used to access the parsed command for context-sensitive parsing.
		* @param {number} startPos - The starting position offset in the original input, used for error reporting.
		* @param {string} str - The attribute string to tokenize.
		* @param {Object} [options] - Parser options.
		* @param {boolean} [options.literalPlus] - Whether the LITERAL+ extension is in use.
		* @param {Array<Buffer>} [options.literals] - Pre-parsed literal values from the input stream.
		*/
		constructor(parent, startPos, str, options) {
			this.str = (str || "").toString();
			this.options = options || {};
			this.parent = parent;
			this.tree = this.currentNode = this.createNode();
			this.pos = startPos || 0;
			this.currentNode.type = "TREE";
			this.state = STATE_NORMAL;
		}
		/**
		* Processes the input string and returns the parsed attributes as a flat array of typed objects.
		* Each attribute is an object with a `type` (e.g., "ATOM", "STRING", "LITERAL", "SEQUENCE")
		* and a `value` property. Lists are represented as nested arrays. Sections and partials are
		* attached as properties on the preceding attribute object.
		*
		* @returns {Promise<Array>} A promise that resolves to an array of parsed attribute objects and nested arrays.
		* @throws {Error} If the input contains syntax errors or unclosed nodes.
		*/
		async getAttributes() {
			await this.processString();
			const attributes = [];
			let branch = attributes;
			let walk = async (node) => {
				let curBranch = branch;
				let elm;
				let partial;
				if (!node.isClosed && node.type === "SEQUENCE" && node.value === "*") {
					node.isClosed = true;
					node.type = "ATOM";
				}
				if (!node.isClosed) {
					let error = /* @__PURE__ */ new Error(`Unexpected end of input at position ${this.pos + this.str.length - 1} [E9]`);
					error.code = "ParserError9";
					error.parserContext = {
						input: this.str,
						pos: this.pos + this.str.length - 1
					};
					throw error;
				}
				switch ((node.type || "").toString().toUpperCase()) {
					case "LITERAL":
					case "STRING":
					case "SEQUENCE":
						elm = {
							type: node.type.toUpperCase(),
							value: node.value
						};
						branch.push(elm);
						break;
					case "ATOM":
						if (node.value.toUpperCase() === "NIL") {
							branch.push(null);
							break;
						}
						elm = {
							type: node.type.toUpperCase(),
							value: node.value
						};
						branch.push(elm);
						break;
					case "SECTION":
						branch = branch[branch.length - 1].section = [];
						break;
					case "LIST":
						elm = [];
						branch.push(elm);
						branch = elm;
						break;
					case "PARTIAL":
						partial = node.value.split(".").map(Number);
						branch[branch.length - 1].partial = partial;
						break;
				}
				for (let childNode of node.childNodes) await walk(childNode);
				branch = curBranch;
			};
			await walk(this.tree);
			return attributes;
		}
		/**
		* Creates a new node in the parse tree. Each node represents a token or structural
		* element (e.g., atom, string, literal, list, section, partial). The node is automatically
		* appended to the parent's childNodes array if a parent is provided.
		*
		* @param {Object} [parentNode] - The parent node to attach this node to. If omitted, creates a root node.
		* @param {number} [startPos] - The starting position of this node in the original input string.
		* @returns {Object} The newly created node with childNodes, type, value, and isClosed properties.
		* @throws {Error} If the nesting depth exceeds MAX_NODE_DEPTH.
		*/
		createNode(parentNode, startPos) {
			let node = {
				childNodes: [],
				type: false,
				value: "",
				isClosed: true
			};
			if (parentNode) {
				node.parentNode = parentNode;
				node.depth = parentNode.depth + 1;
			} else node.depth = 0;
			if (node.depth > MAX_NODE_DEPTH) {
				let error = /* @__PURE__ */ new Error("Too much nesting in IMAP string");
				error.code = "MAX_IMAP_NESTING_REACHED";
				error._imapStr = this.str;
				throw error;
			}
			if (typeof startPos === "number") node.startPos = startPos;
			if (parentNode) parentNode.childNodes.push(node);
			return node;
		}
		/**
		* Processes the entire input string character by character using a state machine.
		* Transitions between states (NORMAL, ATOM, STRING, LITERAL, SEQUENCE, PARTIAL, TEXT)
		* based on the current character and builds the parse tree. This is the main parsing
		* loop that drives the tokenization.
		*
		* @returns {Promise<void>}
		* @throws {Error} If the input contains unexpected characters, unclosed structures, or other syntax errors.
		*/
		async processString() {
			let chr, i, len;
			const checkSP = () => {
				while (this.str.charAt(i + 1) === " ") i++;
			};
			for (i = 0, len = this.str.length; i < len; i++) {
				chr = this.str.charAt(i);
				switch (this.state) {
					case STATE_NORMAL:
						switch (chr) {
							case "\"":
								this.currentNode = this.createNode(this.currentNode, this.pos + i);
								this.currentNode.type = "string";
								this.state = STATE_STRING;
								this.currentNode.isClosed = false;
								break;
							case "(":
								this.currentNode = this.createNode(this.currentNode, this.pos + i);
								this.currentNode.type = "LIST";
								this.currentNode.isClosed = false;
								break;
							case ")":
								if (this.currentNode.type !== "LIST") {
									let error = /* @__PURE__ */ new Error(`Unexpected list terminator ) at position ${this.pos + i} [E10]`);
									error.code = "ParserError10";
									error.parserContext = {
										input: this.str,
										pos: this.pos + i,
										chr
									};
									throw error;
								}
								this.currentNode.isClosed = true;
								this.currentNode.endPos = this.pos + i;
								this.currentNode = this.currentNode.parentNode;
								checkSP();
								break;
							case "]":
								if (this.currentNode.type !== "SECTION") {
									let error = /* @__PURE__ */ new Error(`Unexpected section terminator ] at position ${this.pos + i} [E11]`);
									error.code = "ParserError11";
									error.parserContext = {
										input: this.str,
										pos: this.pos + i,
										chr
									};
									throw error;
								}
								this.currentNode.isClosed = true;
								this.currentNode.endPos = this.pos + i;
								this.currentNode = this.currentNode.parentNode;
								checkSP();
								break;
							case "<":
								if (this.str.charAt(i - 1) !== "]") {
									this.currentNode = this.createNode(this.currentNode, this.pos + i);
									this.currentNode.type = "ATOM";
									this.currentNode.value = chr;
									this.state = STATE_ATOM;
								} else {
									this.currentNode = this.createNode(this.currentNode, this.pos + i);
									this.currentNode.type = "PARTIAL";
									this.state = STATE_PARTIAL;
									this.currentNode.isClosed = false;
								}
								break;
							case "~": {
								let nextChr = this.str.charAt(i + 1);
								if (nextChr !== "{") {
									if (imapFormalSyntax["ATOM-CHAR"]().includes(nextChr)) {
										this.currentNode = this.createNode(this.currentNode, this.pos + i);
										this.currentNode.type = "ATOM";
										this.currentNode.value = chr;
										this.state = STATE_ATOM;
										break;
									}
									let error = /* @__PURE__ */ new Error(`Unexpected literal8 marker at position ${this.pos + i} [E12]`);
									error.code = "ParserError12";
									error.parserContext = {
										input: this.str,
										pos: this.pos + i,
										chr
									};
									throw error;
								}
								this.expectedLiteralType = "literal8";
								break;
							}
							case "{":
								this.currentNode = this.createNode(this.currentNode, this.pos + i);
								this.currentNode.type = "LITERAL";
								this.currentNode.literalType = this.expectedLiteralType || "literal";
								this.expectedLiteralType = false;
								this.state = STATE_LITERAL;
								this.currentNode.isClosed = false;
								break;
							case "*":
								this.currentNode = this.createNode(this.currentNode, this.pos + i);
								this.currentNode.type = "SEQUENCE";
								this.currentNode.value = chr;
								this.currentNode.isClosed = false;
								this.state = STATE_SEQUENCE;
								break;
							case " ": break;
							case "[": if ([
								"OK",
								"NO",
								"BAD",
								"BYE",
								"PREAUTH"
							].includes(this.parent.command.toUpperCase()) && this.currentNode === this.tree) {
								this.currentNode.endPos = this.pos + i;
								this.currentNode = this.createNode(this.currentNode, this.pos + i);
								this.currentNode.type = "ATOM";
								this.currentNode = this.createNode(this.currentNode, this.pos + i);
								this.currentNode.type = "SECTION";
								this.currentNode.isClosed = false;
								this.state = STATE_NORMAL;
								if (this.str.substr(i + 1, 9).toUpperCase() === "REFERRAL ") {
									this.currentNode = this.createNode(this.currentNode, this.pos + i + 1);
									this.currentNode.type = "ATOM";
									this.currentNode.endPos = this.pos + i + 8;
									this.currentNode.value = "REFERRAL";
									this.currentNode = this.currentNode.parentNode;
									this.currentNode = this.createNode(this.currentNode, this.pos + i + 10);
									this.currentNode.type = "ATOM";
									i = this.str.indexOf("]", i + 10);
									if (i < 0) i = this.str.length;
									this.currentNode.endPos = this.pos + i - 1;
									this.currentNode.value = this.str.substring(this.currentNode.startPos - this.pos, this.currentNode.endPos - this.pos + 1);
									this.currentNode = this.currentNode.parentNode;
									this.currentNode.isClosed = true;
									this.currentNode = this.currentNode.parentNode;
									checkSP();
								}
								break;
							}
							default:
								if (!imapFormalSyntax["ATOM-CHAR"]().includes(chr) && chr !== "\\" && chr !== "%" && chr.charCodeAt(0) < 128) {
									let error = /* @__PURE__ */ new Error(`Unexpected char at position ${this.pos + i} [E13: ${JSON.stringify(chr)}]`);
									error.code = "ParserError13";
									error.parserContext = {
										input: this.str,
										pos: this.pos + i,
										chr
									};
									throw error;
								}
								this.currentNode = this.createNode(this.currentNode, this.pos + i);
								this.currentNode.type = "ATOM";
								this.currentNode.value = chr;
								this.state = STATE_ATOM;
								break;
						}
						break;
					case STATE_ATOM:
						if (chr === " ") {
							this.currentNode.endPos = this.pos + i - 1;
							this.currentNode = this.currentNode.parentNode;
							this.state = STATE_NORMAL;
							break;
						}
						if (this.currentNode.parentNode && (chr === ")" && this.currentNode.parentNode.type === "LIST" || chr === "]" && this.currentNode.parentNode.type === "SECTION")) {
							this.currentNode.endPos = this.pos + i - 1;
							this.currentNode = this.currentNode.parentNode;
							this.currentNode.isClosed = true;
							this.currentNode.endPos = this.pos + i;
							this.currentNode = this.currentNode.parentNode;
							this.state = STATE_NORMAL;
							checkSP();
							break;
						}
						if ((chr === "," || chr === ":") && RE_DIGITS.test(this.currentNode.value)) {
							this.currentNode.type = "SEQUENCE";
							this.currentNode.isClosed = true;
							this.state = STATE_SEQUENCE;
						}
						if (chr === "[" && [
							"BODY",
							"BODY.PEEK",
							"BINARY",
							"BINARY.PEEK"
						].includes(this.currentNode.value.toUpperCase())) {
							this.currentNode.endPos = this.pos + i;
							this.currentNode = this.createNode(this.currentNode.parentNode, this.pos + i);
							this.currentNode.type = "SECTION";
							this.currentNode.isClosed = false;
							this.state = STATE_NORMAL;
							break;
						}
						if (!imapFormalSyntax["ATOM-CHAR"]().includes(chr) && chr.charCodeAt(0) < 128 && chr !== "]" && !(chr === "*" && this.currentNode.value === "\\") && (!this.parent || !this.parent.command || ![
							"NO",
							"BAD",
							"OK"
						].includes(this.parent.command))) {
							let error = /* @__PURE__ */ new Error(`Unexpected char at position ${this.pos + i} [E16: ${JSON.stringify(chr)}]`);
							error.code = "ParserError16";
							error.parserContext = {
								input: this.str,
								pos: this.pos + i,
								chr
							};
							throw error;
						} else if (this.currentNode.value === "\\*") {
							let error = /* @__PURE__ */ new Error(`Unexpected char at position ${this.pos + i} [E17: ${JSON.stringify(chr)}]`);
							error.code = "ParserError17";
							error.parserContext = {
								input: this.str,
								pos: this.pos + i,
								chr
							};
							throw error;
						}
						this.currentNode.value += chr;
						break;
					case STATE_STRING:
						if (chr === "\"") {
							this.currentNode.endPos = this.pos + i;
							this.currentNode.isClosed = true;
							this.currentNode = this.currentNode.parentNode;
							this.state = STATE_NORMAL;
							checkSP();
							break;
						}
						if (chr === "\\") {
							i++;
							if (i >= len) {
								let error = /* @__PURE__ */ new Error(`Unexpected end of input at position ${this.pos + i} [E18]`);
								error.code = "ParserError18";
								error.parserContext = {
									input: this.str,
									pos: this.pos + i
								};
								throw error;
							}
							chr = this.str.charAt(i);
						}
						this.currentNode.value += chr;
						break;
					case STATE_PARTIAL:
						if (chr === ">") {
							if (this.currentNode.value.at(-1) === ".") {
								let error = /* @__PURE__ */ new Error(`Unexpected end of partial at position ${this.pos + i} [E19]`);
								error.code = "ParserError19";
								error.parserContext = {
									input: this.str,
									pos: this.pos + i,
									chr
								};
								throw error;
							}
							this.currentNode.endPos = this.pos + i;
							this.currentNode.isClosed = true;
							this.currentNode = this.currentNode.parentNode;
							this.state = STATE_NORMAL;
							checkSP();
							break;
						}
						if (chr === "." && (this.currentNode.value === "" || this.currentNode.value.includes("."))) {
							let error = /* @__PURE__ */ new Error(`Unexpected partial separator . at position ${this.pos + i} [E20]`);
							error.code = "ParserError20";
							error.parserContext = {
								input: this.str,
								pos: this.pos + i,
								chr
							};
							throw error;
						}
						if (!imapFormalSyntax.DIGIT().includes(chr) && chr !== ".") {
							let error = /* @__PURE__ */ new Error(`Unexpected char at position ${this.pos + i} [E21: ${JSON.stringify(chr)}]`);
							error.code = "ParserError21";
							error.parserContext = {
								input: this.str,
								pos: this.pos + i,
								chr
							};
							throw error;
						}
						if ((this.currentNode.value === "0" || this.currentNode.value.endsWith(".0")) && chr !== ".") {
							let error = /* @__PURE__ */ new Error(`Invalid partial at position ${this.pos + i} [E22: ${JSON.stringify(chr)}]`);
							error.code = "ParserError22";
							error.parserContext = {
								input: this.str,
								pos: this.pos + i,
								chr
							};
							throw error;
						}
						this.currentNode.value += chr;
						break;
					case STATE_LITERAL:
						if (this.currentNode.started) {
							this.currentNode.chBuffer[this.currentNode.chPos++] = chr.charCodeAt(0);
							if (this.currentNode.chPos >= this.currentNode.literalLength) {
								this.currentNode.endPos = this.pos + i;
								this.currentNode.isClosed = true;
								this.currentNode.value = this.currentNode.chBuffer.toString("binary");
								this.currentNode.chBuffer = Buffer.alloc(0);
								this.currentNode = this.currentNode.parentNode;
								this.state = STATE_NORMAL;
								checkSP();
							}
							break;
						}
						if (chr === "+" && this.options.literalPlus) {
							this.currentNode.literalPlus = true;
							break;
						}
						if (chr === "}") {
							if (!("literalLength" in this.currentNode)) {
								let error = /* @__PURE__ */ new Error(`Unexpected literal prefix end char } at position ${this.pos + i} [E23]`);
								error.code = "ParserError23";
								error.parserContext = {
									input: this.str,
									pos: this.pos + i,
									chr
								};
								throw error;
							}
							if (this.str.charAt(i + 1) === "\n") i++;
							else if (this.str.charAt(i + 1) === "\r" && this.str.charAt(i + 2) === "\n") i += 2;
							else {
								let error = /* @__PURE__ */ new Error(`Unexpected char at position ${this.pos + i} [E24: ${JSON.stringify(chr)}]`);
								error.code = "ParserError24";
								error.parserContext = {
									input: this.str,
									pos: this.pos + i,
									chr
								};
								throw error;
							}
							this.currentNode.literalLength = Number(this.currentNode.literalLength);
							if (!this.currentNode.literalLength) {
								this.currentNode.endPos = this.pos + i;
								this.currentNode.isClosed = true;
								this.currentNode = this.currentNode.parentNode;
								this.state = STATE_NORMAL;
								checkSP();
							} else if (this.options.literals) {
								this.currentNode.value = this.options.literals.shift();
								this.currentNode.endPos = this.pos + i + this.currentNode.value.length;
								this.currentNode.started = false;
								this.currentNode.isClosed = true;
								this.currentNode = this.currentNode.parentNode;
								this.state = STATE_NORMAL;
								checkSP();
							} else {
								this.currentNode.started = true;
								this.currentNode.chBuffer = Buffer.alloc(this.currentNode.literalLength);
								this.currentNode.chPos = 0;
							}
							break;
						}
						if (!imapFormalSyntax.DIGIT().includes(chr)) {
							let error = /* @__PURE__ */ new Error(`Unexpected char at position ${this.pos + i} [E25: ${JSON.stringify(chr)}]`);
							error.code = "ParserError25";
							error.parserContext = {
								input: this.str,
								pos: this.pos + i,
								chr
							};
							throw error;
						}
						if (this.currentNode.literalLength === "0") {
							let error = /* @__PURE__ */ new Error(`Invalid literal at position ${this.pos + i} [E26]`);
							error.code = "ParserError26";
							error.parserContext = {
								input: this.str,
								pos: this.pos + i,
								chr
							};
							throw error;
						}
						this.currentNode.literalLength = (this.currentNode.literalLength || "") + chr;
						break;
					case STATE_SEQUENCE:
						if (chr === " ") {
							if (!RE_SINGLE_DIGIT.test(this.currentNode.value.at(-1)) && this.currentNode.value.at(-1) !== "*") {
								let error = /* @__PURE__ */ new Error(`Unexpected whitespace at position ${this.pos + i} [E27]`);
								error.code = "ParserError27";
								error.parserContext = {
									input: this.str,
									pos: this.pos + i,
									chr
								};
								throw error;
							}
							if (this.currentNode.value !== "*" && this.currentNode.value.at(-1) === "*" && this.currentNode.value.at(-2) !== ":") {
								let error = /* @__PURE__ */ new Error(`Unexpected whitespace at position ${this.pos + i} [E28]`);
								error.code = "ParserError28";
								error.parserContext = {
									input: this.str,
									pos: this.pos + i,
									chr
								};
								throw error;
							}
							this.currentNode.isClosed = true;
							this.currentNode.endPos = this.pos + i - 1;
							this.currentNode = this.currentNode.parentNode;
							this.state = STATE_NORMAL;
							break;
						} else if (this.currentNode.parentNode && chr === "]" && this.currentNode.parentNode.type === "SECTION") {
							this.currentNode.endPos = this.pos + i - 1;
							this.currentNode = this.currentNode.parentNode;
							this.currentNode.isClosed = true;
							this.currentNode.endPos = this.pos + i;
							this.currentNode = this.currentNode.parentNode;
							this.state = STATE_NORMAL;
							checkSP();
							break;
						}
						if (chr === ":") {
							if (!RE_SINGLE_DIGIT.test(this.currentNode.value.at(-1)) && this.currentNode.value.at(-1) !== "*") {
								let error = /* @__PURE__ */ new Error(`Unexpected range separator : at position ${this.pos + i} [E29]`);
								error.code = "ParserError29";
								error.parserContext = {
									input: this.str,
									pos: this.pos + i,
									chr
								};
								throw error;
							}
						} else if (chr === "*") {
							if (![",", ":"].includes(this.currentNode.value.at(-1))) {
								let error = /* @__PURE__ */ new Error(`Unexpected range wildcard at position ${this.pos + i} [E30]`);
								error.code = "ParserError30";
								error.parserContext = {
									input: this.str,
									pos: this.pos + i,
									chr
								};
								throw error;
							}
						} else if (chr === ",") {
							if (!RE_SINGLE_DIGIT.test(this.currentNode.value.at(-1)) && this.currentNode.value.at(-1) !== "*") {
								let error = /* @__PURE__ */ new Error(`Unexpected sequence separator , at position ${this.pos + i} [E31]`);
								error.code = "ParserError31";
								error.parserContext = {
									input: this.str,
									pos: this.pos + i,
									chr
								};
								throw error;
							}
							if (this.currentNode.value.at(-1) === "*" && this.currentNode.value.at(-2) !== ":") {
								let error = /* @__PURE__ */ new Error(`Unexpected sequence separator , at position ${this.pos + i} [E32]`);
								error.code = "ParserError32";
								error.parserContext = {
									input: this.str,
									pos: this.pos + i,
									chr
								};
								throw error;
							}
						} else if (!RE_SINGLE_DIGIT.test(chr)) {
							let error = /* @__PURE__ */ new Error(`Unexpected char at position ${this.pos + i} [E33: ${JSON.stringify(chr)}]`);
							error.code = "ParserError33";
							error.parserContext = {
								input: this.str,
								pos: this.pos + i,
								chr
							};
							throw error;
						}
						if (RE_SINGLE_DIGIT.test(chr) && this.currentNode.value.at(-1) === "*") {
							let error = /* @__PURE__ */ new Error(`Unexpected number at position ${this.pos + i} [E34: ${JSON.stringify(chr)}]`);
							error.code = "ParserError34";
							error.parserContext = {
								input: this.str,
								pos: this.pos + i,
								chr
							};
							throw error;
						}
						this.currentNode.value += chr;
						break;
				}
			}
		}
	};
	module.exports.TokenParser = TokenParser;
}));
//#endregion
//#region node_modules/imapflow/lib/handler/parser-instance.js
var require_parser_instance = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var imapFormalSyntax = require_imap_formal_syntax();
	var { TokenParser } = require_token_parser();
	/**
	* Parses a single IMAP response line into its structural components: tag, command,
	* and attributes. Handles status responses (OK, NO, BAD, PREAUTH, BYE) with their
	* human-readable text and response codes, as well as continuation responses ("+").
	*/
	var ParserInstance = class {
		/**
		* Creates a new ParserInstance for parsing an IMAP response line.
		*
		* @param {Buffer|string} input - The raw IMAP response line to parse.
		* @param {Object} [options] - Parser options passed through to the TokenParser for attribute parsing.
		* @param {boolean} [options.literalPlus] - Whether the LITERAL+ extension is in use.
		* @param {Array<Buffer>} [options.literals] - Pre-parsed literal values from the stream.
		*/
		constructor(input, options) {
			this.input = (input || "").toString();
			this.options = options || {};
			this.remainder = this.input;
			this.pos = 0;
		}
		/**
		* Extracts and returns the IMAP tag from the beginning of the response.
		* The tag is typically "*" for untagged responses, "+" for continuation requests,
		* or a client-assigned command tag like "A1".
		*
		* @returns {Promise<string>} The parsed tag string.
		* @throws {Error} If the tag contains invalid characters.
		*/
		async getTag() {
			if (!this.tag) this.tag = await this.getElement(imapFormalSyntax.tag() + "*+", true);
			return this.tag;
		}
		/**
		* Extracts and returns the IMAP command or response name from the input.
		* For continuation responses (tag "+"), returns an empty string and stores
		* the remainder as human-readable text. For status responses (OK, NO, BAD,
		* PREAUTH, BYE), separates the optional response code from the human-readable text.
		*
		* @returns {Promise<string>} The parsed command string.
		* @throws {Error} If the command contains invalid characters or input ends unexpectedly.
		*/
		async getCommand() {
			if (this.tag === "+") {
				this.humanReadable = this.remainder.trim();
				this.remainder = "";
				return "";
			}
			if (!this.command) this.command = await this.getElement(imapFormalSyntax.command());
			switch ((this.command || "").toString().toUpperCase()) {
				case "OK":
				case "NO":
				case "BAD":
				case "PREAUTH":
				case "BYE":
					{
						let match = this.remainder.match(/^\s+\[/);
						if (match) {
							let nesting = 1;
							for (let i = match[0].length; i <= this.remainder.length; i++) {
								let c = this.remainder[i];
								if (c === "[") nesting++;
								else if (c === "]") nesting--;
								if (!nesting) {
									this.humanReadable = this.remainder.substring(i + 1).trim();
									this.remainder = this.remainder.substring(0, i + 1);
									break;
								}
							}
						} else {
							this.humanReadable = this.remainder.trim();
							this.remainder = "";
						}
					}
					break;
			}
			return this.command;
		}
		/**
		* Extracts the next whitespace-delimited element from the input and validates it
		* against the given syntax character set. Advances the parser position past the element.
		*
		* @param {string} syntax - A string of allowed characters for the element (as returned by imap-formal-syntax methods).
		* @returns {Promise<string>} The extracted element string.
		* @throws {Error} If the element contains characters not in the syntax set, or if input ends unexpectedly.
		*/
		async getElement(syntax) {
			let match, element, errPos;
			if (/^\s/.test(this.remainder)) {
				let error = /* @__PURE__ */ new Error(`Unexpected whitespace at position ${this.pos} [E1]`);
				error.code = "ParserError1";
				error.parserContext = {
					input: this.input,
					pos: this.pos
				};
				throw error;
			}
			if (match = this.remainder.match(/^\s*[^\s]+(?=\s|$)/)) {
				element = match[0];
				if ((errPos = imapFormalSyntax.verify(element, syntax)) >= 0) {
					if (this.tag === "Server" && element === "Unavailable.") {
						let error = /* @__PURE__ */ new Error(`Server returned an error: ${this.input}`);
						error.code = "ParserErrorExchange";
						error.parserContext = {
							input: this.input,
							element,
							pos: this.pos,
							value: {
								tag: "*",
								command: "BAD",
								attributes: [{
									type: "TEXT",
									value: this.input
								}]
							}
						};
						throw error;
					}
					let error = /* @__PURE__ */ new Error(`Unexpected char at position ${this.pos + errPos} [E2: ${JSON.stringify(element.charAt(errPos))}]`);
					error.code = "ParserError2";
					error.parserContext = {
						input: this.input,
						element,
						pos: this.pos
					};
					throw error;
				}
			} else {
				let error = /* @__PURE__ */ new Error(`Unexpected end of input at position ${this.pos} [E3]`);
				error.code = "ParserError3";
				error.parserContext = {
					input: this.input,
					pos: this.pos
				};
				throw error;
			}
			this.pos += match[0].length;
			this.remainder = this.remainder.substr(match[0].length);
			return element;
		}
		/**
		* Consumes a single space character from the current position in the input.
		* Advances the parser position by one.
		*
		* @returns {Promise<void>}
		* @throws {Error} If the current character is not a space, or if input has ended unexpectedly.
		*/
		async getSpace() {
			if (!this.remainder.length) {
				if (this.tag === "+" && this.pos === 1) return;
				let error = /* @__PURE__ */ new Error(`Unexpected end of input at position ${this.pos} [E4]`);
				error.code = "ParserError4";
				error.parserContext = {
					input: this.input,
					pos: this.pos
				};
				throw error;
			}
			if (imapFormalSyntax.verify(this.remainder.charAt(0), imapFormalSyntax.SP()) >= 0) {
				let error = /* @__PURE__ */ new Error(`Unexpected char at position ${this.pos} [E5: ${JSON.stringify(this.remainder.charAt(0))}]`);
				error.code = "ParserError5";
				error.parserContext = {
					input: this.input,
					element: this.remainder,
					pos: this.pos
				};
				throw error;
			}
			this.pos++;
			this.remainder = this.remainder.substr(1);
		}
		/**
		* Parses the remaining input as IMAP attributes using the TokenParser.
		* This handles complex structures including nested lists, literals, strings,
		* atoms, sections, sequences, and partial ranges.
		*
		* @returns {Promise<Array>} A promise that resolves to an array of parsed attribute objects.
		* @throws {Error} If the input contains unexpected whitespace, invalid characters, or ends unexpectedly.
		*/
		async getAttributes() {
			if (!this.remainder.length) {
				let error = /* @__PURE__ */ new Error(`Unexpected end of input at position ${this.pos} [E6]`);
				error.code = "ParserError6";
				error.parserContext = {
					input: this.input,
					pos: this.pos
				};
				throw error;
			}
			if (/^\s/.test(this.remainder)) {
				let error = /* @__PURE__ */ new Error(`Unexpected whitespace at position ${this.pos} [E7]`);
				error.code = "ParserError7";
				error.parserContext = {
					input: this.input,
					element: this.remainder,
					pos: this.pos
				};
				throw error;
			}
			return await new TokenParser(this, this.pos, this.remainder, this.options).getAttributes();
		}
	};
	module.exports.ParserInstance = ParserInstance;
}));
//#endregion
//#region node_modules/imapflow/lib/handler/imap-parser.js
var require_imap_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var imapFormalSyntax = require_imap_formal_syntax();
	var { ParserInstance } = require_parser_instance();
	/**
	* Parses a raw IMAP command or response buffer into a structured object.
	* Handles edge cases such as null-byte-padded responses from buggy servers and
	* multi-word commands like UID and AUTHENTICATE.
	*
	* @param {Buffer|string} command - The raw IMAP command or response data to parse.
	* @param {Object} [options] - Parser options passed through to the underlying ParserInstance and TokenParser.
	* @param {boolean} [options.literalPlus] - Whether the LITERAL+ extension is in use.
	* @param {Array<Buffer>} [options.literals] - Pre-parsed literal values extracted from the input stream.
	* @returns {Promise<Object>} A promise that resolves to a parsed response object.
	* @returns {string} return.tag - The IMAP tag (e.g., "*", "+", or a command tag like "A1").
	* @returns {string} return.command - The IMAP command or response name (e.g., "OK", "FETCH").
	* @returns {Array} [return.attributes] - Parsed attributes of the response.
	* @returns {number} [return.nullBytesRemoved] - Number of leading null bytes removed, if any.
	*/
	module.exports = async (command, options) => {
		options = options || {};
		let nullBytesRemoved = 0;
		if (command[0] === 0) {
			let firstNonNull = -1;
			for (let i = 0; i < command.length; i++) if (command[i] !== 0) {
				firstNonNull = i;
				break;
			}
			if (firstNonNull === -1) return {
				tag: "*",
				command: "BAD",
				attributes: []
			};
			command = command.slice(firstNonNull);
			nullBytesRemoved = firstNonNull;
		}
		const parser = new ParserInstance(command, options);
		const response = {};
		try {
			response.tag = await parser.getTag();
			await parser.getSpace();
			response.command = await parser.getCommand();
			if (nullBytesRemoved) response.nullBytesRemoved = nullBytesRemoved;
			if (["UID", "AUTHENTICATE"].includes((response.command || "").toUpperCase())) {
				await parser.getSpace();
				response.command += " " + await parser.getElement(imapFormalSyntax.command());
			}
			if (parser.remainder.trim().length) {
				await parser.getSpace();
				response.attributes = await parser.getAttributes();
			}
			if (parser.humanReadable) response.attributes = (response.attributes || []).concat({
				type: "TEXT",
				value: parser.humanReadable
			});
		} catch (err) {
			if (err.code === "ParserErrorExchange" && err.parserContext && err.parserContext.value) return err.parserContext.value;
			throw err;
		}
		return response;
	};
}));
//#endregion
//#region node_modules/imapflow/lib/handler/imap-compiler.js
var require_imap_compiler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var imapFormalSyntax = require_imap_formal_syntax();
	/**
	* Formats a response entry into a Buffer.
	*
	* @param {string|number|Buffer} entry - The value to convert to a Buffer.
	* @param {boolean} [returnEmpty] - If true, returns null instead of an empty Buffer when the entry is not a recognized type.
	* @returns {Buffer|null} The entry as a Buffer, or null if returnEmpty is true and the entry is not a recognized type.
	*/
	var formatRespEntry = (entry, returnEmpty) => {
		if (typeof entry === "string") return Buffer.from(entry);
		if (typeof entry === "number") return Buffer.from(entry.toString());
		if (Buffer.isBuffer(entry)) return entry;
		if (returnEmpty) return null;
		return Buffer.alloc(0);
	};
	/**
	* Compiles an input object into a sequence of Buffers representing an IMAP protocol response string.
	* Handles various node types including literals, strings, atoms, sections, sequences, and nested lists.
	*
	* @param {Object} response - The response object to compile.
	* @param {string} [response.tag] - The IMAP command tag (e.g., "*" or a sequence number).
	* @param {string} [response.command] - The IMAP command name.
	* @param {Array|Object} [response.attributes] - The response attributes to compile into IMAP format.
	* @param {Object} [options] - Compilation options.
	* @param {boolean} [options.asArray] - If true, returns an array of Buffers (one per literal segment); otherwise returns a single concatenated Buffer.
	* @param {boolean} [options.isLogging] - If true, redacts sensitive values and truncates long strings/literals for logging purposes.
	* @param {boolean} [options.literalPlus] - If true, uses the LITERAL+ extension (appends "+" to literal length markers).
	* @param {boolean} [options.literalMinus] - If true, uses the LITERAL- extension for literals up to 4096 bytes.
	* @returns {Promise<Buffer[]|Buffer>} A promise that resolves to an array of Buffers (if asArray is true) or a single concatenated Buffer.
	*/
	module.exports = async (response, options) => {
		let { asArray, isLogging, literalPlus, literalMinus } = options || {};
		const respParts = [];
		let resp = [].concat(formatRespEntry(response.tag, true) || []).concat(response.command ? formatRespEntry(" " + response.command) : []);
		let val;
		let lastType;
		let walk = async (node, options) => {
			options = options || {};
			let lastRespEntry = resp.length && resp[resp.length - 1];
			let lastRespByte = lastRespEntry && lastRespEntry.length && lastRespEntry[lastRespEntry.length - 1] || "";
			if (typeof lastRespByte === "number") lastRespByte = String.fromCharCode(lastRespByte);
			if (lastType === "LITERAL" || ![
				"(",
				"<",
				"["
			].includes(lastRespByte) && resp.length) {
				if (!options.subArray) resp.push(formatRespEntry(" "));
			}
			if (node && node.buffer && !Buffer.isBuffer(node)) node = node.buffer;
			if (Array.isArray(node)) {
				lastType = "LIST";
				resp.push(formatRespEntry("("));
				let subArray = node.length > 1 && Array.isArray(node[0]);
				for (let child of node) {
					if (subArray && !Array.isArray(child)) subArray = false;
					await walk(child, { subArray });
				}
				resp.push(formatRespEntry(")"));
				return;
			}
			if (!node && typeof node !== "string" && typeof node !== "number" && !Buffer.isBuffer(node)) {
				resp.push(formatRespEntry("NIL"));
				return;
			}
			if (typeof node === "string" || Buffer.isBuffer(node)) {
				if (isLogging && node.length > 100) resp.push(formatRespEntry("\"(* " + node.length + "B string *)\""));
				else resp.push(formatRespEntry(JSON.stringify(node.toString())));
				return;
			}
			if (typeof node === "number") {
				resp.push(formatRespEntry(Math.round(node) || 0));
				return;
			}
			lastType = node.type;
			if (isLogging && node.sensitive) {
				resp.push(formatRespEntry("\"(* value hidden *)\""));
				return;
			}
			switch (node.type.toUpperCase()) {
				case "LITERAL":
					if (isLogging) resp.push(formatRespEntry("\"(* " + node.value.length + "B literal *)\""));
					else {
						let literalLength = !node.value ? 0 : Math.max(node.value.length, 0);
						let canAppend = !asArray || literalPlus || literalMinus && literalLength <= 4096;
						let usePlus = canAppend && (literalMinus || literalPlus);
						resp.push(formatRespEntry(`${node.isLiteral8 ? "~" : ""}{${literalLength}${usePlus ? "+" : ""}}\r\n`));
						if (canAppend) {
							if (node.value && node.value.length) resp.push(formatRespEntry(node.value));
						} else {
							respParts.push(resp);
							resp = [].concat(formatRespEntry(node.value, true) || []);
						}
					}
					break;
				case "STRING":
					if (isLogging && node.value.length > 100) resp.push(formatRespEntry("\"(* " + node.value.length + "B string *)\""));
					else resp.push(formatRespEntry(JSON.stringify((node.value || "").toString())));
					break;
				case "TEXT":
				case "SEQUENCE":
					if (node.value) resp.push(formatRespEntry(node.value));
					break;
				case "NUMBER":
					resp.push(formatRespEntry(node.value || 0));
					break;
				case "ATOM":
				case "SECTION":
					val = (node.value || "").toString();
					if (!node.section || val) {
						if (node.value === "" || imapFormalSyntax.verify(val.charAt(0) === "\\" ? val.substr(1) : val, imapFormalSyntax["ATOM-CHAR"]()) >= 0) val = JSON.stringify(val);
						resp.push(formatRespEntry(val));
					}
					if (node.section) {
						resp.push(formatRespEntry("["));
						for (let child of node.section) await walk(child);
						resp.push(formatRespEntry("]"));
					}
					if (node.partial) resp.push(formatRespEntry(`<${node.partial.join(".")}>`));
					break;
			}
		};
		if (response.attributes) {
			let attributes = Array.isArray(response.attributes) ? response.attributes : [].concat(response.attributes);
			for (let child of attributes) await walk(child);
		}
		if (resp.length) respParts.push(resp);
		for (let i = 0; i < respParts.length; i++) respParts[i] = Buffer.concat(respParts[i]);
		return asArray ? respParts : respParts.flatMap((entry) => entry);
	};
}));
//#endregion
//#region node_modules/imapflow/lib/handler/imap-handler.js
var require_imap_handler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Re-exports the IMAP protocol parser and compiler as a single module.
	*
	* @property {Function} parser - Parses raw IMAP command/response buffers into structured objects.
	*   See {@link module:imap-parser} for details.
	* @property {Function} compiler - Compiles structured response objects into IMAP protocol Buffers.
	*   See {@link module:imap-compiler} for details.
	*/
	module.exports = {
		parser: require_imap_parser(),
		compiler: require_imap_compiler()
	};
}));
//#endregion
//#region node_modules/imapflow/package.json
var package_exports = /* @__PURE__ */ __exportAll({
	author: () => author,
	bugs: () => bugs,
	default: () => package_default,
	dependencies: () => dependencies,
	description: () => description,
	devDependencies: () => devDependencies,
	homepage: () => homepage,
	keywords: () => keywords,
	license: () => "MIT",
	main: () => main,
	name: () => name,
	repository: () => repository,
	scripts: () => scripts,
	types: () => types,
	version: () => version
}), name, version, description, main, types, scripts, repository, keywords, author, bugs, homepage, devDependencies, dependencies, package_default;
var init_package = __esmMin((() => {
	name = "imapflow";
	version = "1.4.9";
	description = "IMAP Client for Node";
	main = "lib/imap-flow.js";
	types = "lib/imap-flow.d.ts";
	scripts = {
		"test": "grunt",
		"coverage": "c8 --reporter=text --reporter=html npx nodeunit test/*-test.js",
		"test:rev2": "bash test/integration/run-rev2-tests.sh",
		"update": "rm -rf node_modules package-lock.json && ncu -u && npm install",
		"format": "prettier --write \"**/*.{js,json,md,yml,yaml}\" --ignore-path .prettierignore",
		"lint": "eslint ."
	};
	repository = {
		"type": "git",
		"url": "git+https://github.com/postalsys/imapflow.git"
	};
	keywords = [
		"imap",
		"email",
		"mail"
	];
	author = "Postal Systems OÜ";
	bugs = { "url": "https://github.com/postalsys/imapflow/issues" };
	homepage = "https://imapflow.com/";
	devDependencies = {
		"@eslint/js": "10.0.1",
		"@types/node": "26.1.1",
		"c8": "12.0.0",
		"eslint": "10.7.0",
		"eslint-config-nodemailer": "1.2.0",
		"eslint-config-prettier": "10.1.8",
		"grunt": "1.6.2",
		"grunt-cli": "1.5.0",
		"grunt-contrib-nodeunit": "5.0.0",
		"grunt-eslint": "26.0.0",
		"prettier": "3.9.6",
		"proxyquire": "^2.1.3",
		"typescript": "7.0.2"
	};
	dependencies = {
		"@zone-eu/mailsplit": "5.4.14",
		"encoding-japanese": "2.2.0",
		"iconv-lite": "0.7.3",
		"libbase64": "1.3.0",
		"libmime": "5.4.1",
		"libqp": "2.1.1",
		"nodemailer": "9.0.3",
		"pino": "10.3.1",
		"socks": "2.8.9"
	};
	package_default = {
		name,
		version,
		description,
		main,
		types,
		scripts,
		repository,
		keywords,
		author,
		license: "MIT",
		bugs,
		homepage,
		devDependencies,
		dependencies
	};
}));
//#endregion
//#region node_modules/smart-buffer/build/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var buffer_1 = __require("buffer");
	/**
	* Error strings
	*/
	var ERRORS = {
		INVALID_ENCODING: "Invalid encoding provided. Please specify a valid encoding the internal Node.js Buffer supports.",
		INVALID_SMARTBUFFER_SIZE: "Invalid size provided. Size must be a valid integer greater than zero.",
		INVALID_SMARTBUFFER_BUFFER: "Invalid Buffer provided in SmartBufferOptions.",
		INVALID_SMARTBUFFER_OBJECT: "Invalid SmartBufferOptions object supplied to SmartBuffer constructor or factory methods.",
		INVALID_OFFSET: "An invalid offset value was provided.",
		INVALID_OFFSET_NON_NUMBER: "An invalid offset value was provided. A numeric value is required.",
		INVALID_LENGTH: "An invalid length value was provided.",
		INVALID_LENGTH_NON_NUMBER: "An invalid length value was provived. A numeric value is required.",
		INVALID_TARGET_OFFSET: "Target offset is beyond the bounds of the internal SmartBuffer data.",
		INVALID_TARGET_LENGTH: "Specified length value moves cursor beyong the bounds of the internal SmartBuffer data.",
		INVALID_READ_BEYOND_BOUNDS: "Attempted to read beyond the bounds of the managed data.",
		INVALID_WRITE_BEYOND_BOUNDS: "Attempted to write beyond the bounds of the managed data."
	};
	exports.ERRORS = ERRORS;
	/**
	* Checks if a given encoding is a valid Buffer encoding. (Throws an exception if check fails)
	*
	* @param { String } encoding The encoding string to check.
	*/
	function checkEncoding(encoding) {
		if (!buffer_1.Buffer.isEncoding(encoding)) throw new Error(ERRORS.INVALID_ENCODING);
	}
	exports.checkEncoding = checkEncoding;
	/**
	* Checks if a given number is a finite integer. (Throws an exception if check fails)
	*
	* @param { Number } value The number value to check.
	*/
	function isFiniteInteger(value) {
		return typeof value === "number" && isFinite(value) && isInteger(value);
	}
	exports.isFiniteInteger = isFiniteInteger;
	/**
	* Checks if an offset/length value is valid. (Throws an exception if check fails)
	*
	* @param value The value to check.
	* @param offset True if checking an offset, false if checking a length.
	*/
	function checkOffsetOrLengthValue(value, offset) {
		if (typeof value === "number") {
			if (!isFiniteInteger(value) || value < 0) throw new Error(offset ? ERRORS.INVALID_OFFSET : ERRORS.INVALID_LENGTH);
		} else throw new Error(offset ? ERRORS.INVALID_OFFSET_NON_NUMBER : ERRORS.INVALID_LENGTH_NON_NUMBER);
	}
	/**
	* Checks if a length value is valid. (Throws an exception if check fails)
	*
	* @param { Number } length The value to check.
	*/
	function checkLengthValue(length) {
		checkOffsetOrLengthValue(length, false);
	}
	exports.checkLengthValue = checkLengthValue;
	/**
	* Checks if a offset value is valid. (Throws an exception if check fails)
	*
	* @param { Number } offset The value to check.
	*/
	function checkOffsetValue(offset) {
		checkOffsetOrLengthValue(offset, true);
	}
	exports.checkOffsetValue = checkOffsetValue;
	/**
	* Checks if a target offset value is out of bounds. (Throws an exception if check fails)
	*
	* @param { Number } offset The offset value to check.
	* @param { SmartBuffer } buff The SmartBuffer instance to check against.
	*/
	function checkTargetOffset(offset, buff) {
		if (offset < 0 || offset > buff.length) throw new Error(ERRORS.INVALID_TARGET_OFFSET);
	}
	exports.checkTargetOffset = checkTargetOffset;
	/**
	* Determines whether a given number is a integer.
	* @param value The number to check.
	*/
	function isInteger(value) {
		return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
	}
	/**
	* Throws if Node.js version is too low to support bigint
	*/
	function bigIntAndBufferInt64Check(bufferMethod) {
		if (typeof BigInt === "undefined") throw new Error("Platform does not support JS BigInt type.");
		if (typeof buffer_1.Buffer.prototype[bufferMethod] === "undefined") throw new Error(`Platform does not support Buffer.prototype.${bufferMethod}.`);
	}
	exports.bigIntAndBufferInt64Check = bigIntAndBufferInt64Check;
}));
//#endregion
//#region node_modules/smart-buffer/build/smartbuffer.js
var require_smartbuffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var utils_1 = require_utils();
	var DEFAULT_SMARTBUFFER_SIZE = 4096;
	var DEFAULT_SMARTBUFFER_ENCODING = "utf8";
	exports.SmartBuffer = class SmartBuffer {
		/**
		* Creates a new SmartBuffer instance.
		*
		* @param options { SmartBufferOptions } The SmartBufferOptions to apply to this instance.
		*/
		constructor(options) {
			this.length = 0;
			this._encoding = DEFAULT_SMARTBUFFER_ENCODING;
			this._writeOffset = 0;
			this._readOffset = 0;
			if (SmartBuffer.isSmartBufferOptions(options)) {
				if (options.encoding) {
					utils_1.checkEncoding(options.encoding);
					this._encoding = options.encoding;
				}
				if (options.size) if (utils_1.isFiniteInteger(options.size) && options.size > 0) this._buff = Buffer.allocUnsafe(options.size);
				else throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_SIZE);
				else if (options.buff) if (Buffer.isBuffer(options.buff)) {
					this._buff = options.buff;
					this.length = options.buff.length;
				} else throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_BUFFER);
				else this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
			} else {
				if (typeof options !== "undefined") throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_OBJECT);
				this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
			}
		}
		/**
		* Creates a new SmartBuffer instance with the provided internal Buffer size and optional encoding.
		*
		* @param size { Number } The size of the internal Buffer.
		* @param encoding { String } The BufferEncoding to use for strings.
		*
		* @return { SmartBuffer }
		*/
		static fromSize(size, encoding) {
			return new this({
				size,
				encoding
			});
		}
		/**
		* Creates a new SmartBuffer instance with the provided Buffer and optional encoding.
		*
		* @param buffer { Buffer } The Buffer to use as the internal Buffer value.
		* @param encoding { String } The BufferEncoding to use for strings.
		*
		* @return { SmartBuffer }
		*/
		static fromBuffer(buff, encoding) {
			return new this({
				buff,
				encoding
			});
		}
		/**
		* Creates a new SmartBuffer instance with the provided SmartBufferOptions options.
		*
		* @param options { SmartBufferOptions } The options to use when creating the SmartBuffer instance.
		*/
		static fromOptions(options) {
			return new this(options);
		}
		/**
		* Type checking function that determines if an object is a SmartBufferOptions object.
		*/
		static isSmartBufferOptions(options) {
			const castOptions = options;
			return castOptions && (castOptions.encoding !== void 0 || castOptions.size !== void 0 || castOptions.buff !== void 0);
		}
		/**
		* Reads an Int8 value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readInt8(offset) {
			return this._readNumberValue(Buffer.prototype.readInt8, 1, offset);
		}
		/**
		* Reads an Int16BE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readInt16BE(offset) {
			return this._readNumberValue(Buffer.prototype.readInt16BE, 2, offset);
		}
		/**
		* Reads an Int16LE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readInt16LE(offset) {
			return this._readNumberValue(Buffer.prototype.readInt16LE, 2, offset);
		}
		/**
		* Reads an Int32BE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readInt32BE(offset) {
			return this._readNumberValue(Buffer.prototype.readInt32BE, 4, offset);
		}
		/**
		* Reads an Int32LE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readInt32LE(offset) {
			return this._readNumberValue(Buffer.prototype.readInt32LE, 4, offset);
		}
		/**
		* Reads a BigInt64BE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { BigInt }
		*/
		readBigInt64BE(offset) {
			utils_1.bigIntAndBufferInt64Check("readBigInt64BE");
			return this._readNumberValue(Buffer.prototype.readBigInt64BE, 8, offset);
		}
		/**
		* Reads a BigInt64LE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { BigInt }
		*/
		readBigInt64LE(offset) {
			utils_1.bigIntAndBufferInt64Check("readBigInt64LE");
			return this._readNumberValue(Buffer.prototype.readBigInt64LE, 8, offset);
		}
		/**
		* Writes an Int8 value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeInt8(value, offset) {
			this._writeNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
			return this;
		}
		/**
		* Inserts an Int8 value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertInt8(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
		}
		/**
		* Writes an Int16BE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeInt16BE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset);
		}
		/**
		* Inserts an Int16BE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertInt16BE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset);
		}
		/**
		* Writes an Int16LE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeInt16LE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset);
		}
		/**
		* Inserts an Int16LE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertInt16LE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset);
		}
		/**
		* Writes an Int32BE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeInt32BE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset);
		}
		/**
		* Inserts an Int32BE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertInt32BE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset);
		}
		/**
		* Writes an Int32LE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeInt32LE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset);
		}
		/**
		* Inserts an Int32LE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertInt32LE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset);
		}
		/**
		* Writes a BigInt64BE value to the current write position (or at optional offset).
		*
		* @param value { BigInt } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeBigInt64BE(value, offset) {
			utils_1.bigIntAndBufferInt64Check("writeBigInt64BE");
			return this._writeNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
		}
		/**
		* Inserts a BigInt64BE value at the given offset value.
		*
		* @param value { BigInt } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertBigInt64BE(value, offset) {
			utils_1.bigIntAndBufferInt64Check("writeBigInt64BE");
			return this._insertNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
		}
		/**
		* Writes a BigInt64LE value to the current write position (or at optional offset).
		*
		* @param value { BigInt } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeBigInt64LE(value, offset) {
			utils_1.bigIntAndBufferInt64Check("writeBigInt64LE");
			return this._writeNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
		}
		/**
		* Inserts a Int64LE value at the given offset value.
		*
		* @param value { BigInt } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertBigInt64LE(value, offset) {
			utils_1.bigIntAndBufferInt64Check("writeBigInt64LE");
			return this._insertNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
		}
		/**
		* Reads an UInt8 value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readUInt8(offset) {
			return this._readNumberValue(Buffer.prototype.readUInt8, 1, offset);
		}
		/**
		* Reads an UInt16BE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readUInt16BE(offset) {
			return this._readNumberValue(Buffer.prototype.readUInt16BE, 2, offset);
		}
		/**
		* Reads an UInt16LE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readUInt16LE(offset) {
			return this._readNumberValue(Buffer.prototype.readUInt16LE, 2, offset);
		}
		/**
		* Reads an UInt32BE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readUInt32BE(offset) {
			return this._readNumberValue(Buffer.prototype.readUInt32BE, 4, offset);
		}
		/**
		* Reads an UInt32LE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readUInt32LE(offset) {
			return this._readNumberValue(Buffer.prototype.readUInt32LE, 4, offset);
		}
		/**
		* Reads a BigUInt64BE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { BigInt }
		*/
		readBigUInt64BE(offset) {
			utils_1.bigIntAndBufferInt64Check("readBigUInt64BE");
			return this._readNumberValue(Buffer.prototype.readBigUInt64BE, 8, offset);
		}
		/**
		* Reads a BigUInt64LE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { BigInt }
		*/
		readBigUInt64LE(offset) {
			utils_1.bigIntAndBufferInt64Check("readBigUInt64LE");
			return this._readNumberValue(Buffer.prototype.readBigUInt64LE, 8, offset);
		}
		/**
		* Writes an UInt8 value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeUInt8(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeUInt8, 1, value, offset);
		}
		/**
		* Inserts an UInt8 value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertUInt8(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeUInt8, 1, value, offset);
		}
		/**
		* Writes an UInt16BE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeUInt16BE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset);
		}
		/**
		* Inserts an UInt16BE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertUInt16BE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset);
		}
		/**
		* Writes an UInt16LE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeUInt16LE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset);
		}
		/**
		* Inserts an UInt16LE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertUInt16LE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset);
		}
		/**
		* Writes an UInt32BE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeUInt32BE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset);
		}
		/**
		* Inserts an UInt32BE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertUInt32BE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset);
		}
		/**
		* Writes an UInt32LE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeUInt32LE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset);
		}
		/**
		* Inserts an UInt32LE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertUInt32LE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset);
		}
		/**
		* Writes a BigUInt64BE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeBigUInt64BE(value, offset) {
			utils_1.bigIntAndBufferInt64Check("writeBigUInt64BE");
			return this._writeNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
		}
		/**
		* Inserts a BigUInt64BE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertBigUInt64BE(value, offset) {
			utils_1.bigIntAndBufferInt64Check("writeBigUInt64BE");
			return this._insertNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
		}
		/**
		* Writes a BigUInt64LE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeBigUInt64LE(value, offset) {
			utils_1.bigIntAndBufferInt64Check("writeBigUInt64LE");
			return this._writeNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
		}
		/**
		* Inserts a BigUInt64LE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertBigUInt64LE(value, offset) {
			utils_1.bigIntAndBufferInt64Check("writeBigUInt64LE");
			return this._insertNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
		}
		/**
		* Reads an FloatBE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readFloatBE(offset) {
			return this._readNumberValue(Buffer.prototype.readFloatBE, 4, offset);
		}
		/**
		* Reads an FloatLE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readFloatLE(offset) {
			return this._readNumberValue(Buffer.prototype.readFloatLE, 4, offset);
		}
		/**
		* Writes a FloatBE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeFloatBE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset);
		}
		/**
		* Inserts a FloatBE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertFloatBE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset);
		}
		/**
		* Writes a FloatLE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeFloatLE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset);
		}
		/**
		* Inserts a FloatLE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertFloatLE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset);
		}
		/**
		* Reads an DoublEBE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readDoubleBE(offset) {
			return this._readNumberValue(Buffer.prototype.readDoubleBE, 8, offset);
		}
		/**
		* Reads an DoubleLE value from the current read position or an optionally provided offset.
		*
		* @param offset { Number } The offset to read data from (optional)
		* @return { Number }
		*/
		readDoubleLE(offset) {
			return this._readNumberValue(Buffer.prototype.readDoubleLE, 8, offset);
		}
		/**
		* Writes a DoubleBE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeDoubleBE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset);
		}
		/**
		* Inserts a DoubleBE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertDoubleBE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset);
		}
		/**
		* Writes a DoubleLE value to the current write position (or at optional offset).
		*
		* @param value { Number } The value to write.
		* @param offset { Number } The offset to write the value at.
		*
		* @return this
		*/
		writeDoubleLE(value, offset) {
			return this._writeNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset);
		}
		/**
		* Inserts a DoubleLE value at the given offset value.
		*
		* @param value { Number } The value to insert.
		* @param offset { Number } The offset to insert the value at.
		*
		* @return this
		*/
		insertDoubleLE(value, offset) {
			return this._insertNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset);
		}
		/**
		* Reads a String from the current read position.
		*
		* @param arg1 { Number | String } The number of bytes to read as a String, or the BufferEncoding to use for
		*             the string (Defaults to instance level encoding).
		* @param encoding { String } The BufferEncoding to use for the string (Defaults to instance level encoding).
		*
		* @return { String }
		*/
		readString(arg1, encoding) {
			let lengthVal;
			if (typeof arg1 === "number") {
				utils_1.checkLengthValue(arg1);
				lengthVal = Math.min(arg1, this.length - this._readOffset);
			} else {
				encoding = arg1;
				lengthVal = this.length - this._readOffset;
			}
			if (typeof encoding !== "undefined") utils_1.checkEncoding(encoding);
			const value = this._buff.slice(this._readOffset, this._readOffset + lengthVal).toString(encoding || this._encoding);
			this._readOffset += lengthVal;
			return value;
		}
		/**
		* Inserts a String
		*
		* @param value { String } The String value to insert.
		* @param offset { Number } The offset to insert the string at.
		* @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
		*
		* @return this
		*/
		insertString(value, offset, encoding) {
			utils_1.checkOffsetValue(offset);
			return this._handleString(value, true, offset, encoding);
		}
		/**
		* Writes a String
		*
		* @param value { String } The String value to write.
		* @param arg2 { Number | String } The offset to write the string at, or the BufferEncoding to use.
		* @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
		*
		* @return this
		*/
		writeString(value, arg2, encoding) {
			return this._handleString(value, false, arg2, encoding);
		}
		/**
		* Reads a null-terminated String from the current read position.
		*
		* @param encoding { String } The BufferEncoding to use for the string (Defaults to instance level encoding).
		*
		* @return { String }
		*/
		readStringNT(encoding) {
			if (typeof encoding !== "undefined") utils_1.checkEncoding(encoding);
			let nullPos = this.length;
			for (let i = this._readOffset; i < this.length; i++) if (this._buff[i] === 0) {
				nullPos = i;
				break;
			}
			const value = this._buff.slice(this._readOffset, nullPos);
			this._readOffset = nullPos + 1;
			return value.toString(encoding || this._encoding);
		}
		/**
		* Inserts a null-terminated String.
		*
		* @param value { String } The String value to write.
		* @param arg2 { Number | String } The offset to write the string to, or the BufferEncoding to use.
		* @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
		*
		* @return this
		*/
		insertStringNT(value, offset, encoding) {
			utils_1.checkOffsetValue(offset);
			this.insertString(value, offset, encoding);
			this.insertUInt8(0, offset + value.length);
			return this;
		}
		/**
		* Writes a null-terminated String.
		*
		* @param value { String } The String value to write.
		* @param arg2 { Number | String } The offset to write the string to, or the BufferEncoding to use.
		* @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
		*
		* @return this
		*/
		writeStringNT(value, arg2, encoding) {
			this.writeString(value, arg2, encoding);
			this.writeUInt8(0, typeof arg2 === "number" ? arg2 + value.length : this.writeOffset);
			return this;
		}
		/**
		* Reads a Buffer from the internal read position.
		*
		* @param length { Number } The length of data to read as a Buffer.
		*
		* @return { Buffer }
		*/
		readBuffer(length) {
			if (typeof length !== "undefined") utils_1.checkLengthValue(length);
			const lengthVal = typeof length === "number" ? length : this.length;
			const endPoint = Math.min(this.length, this._readOffset + lengthVal);
			const value = this._buff.slice(this._readOffset, endPoint);
			this._readOffset = endPoint;
			return value;
		}
		/**
		* Writes a Buffer to the current write position.
		*
		* @param value { Buffer } The Buffer to write.
		* @param offset { Number } The offset to write the Buffer to.
		*
		* @return this
		*/
		insertBuffer(value, offset) {
			utils_1.checkOffsetValue(offset);
			return this._handleBuffer(value, true, offset);
		}
		/**
		* Writes a Buffer to the current write position.
		*
		* @param value { Buffer } The Buffer to write.
		* @param offset { Number } The offset to write the Buffer to.
		*
		* @return this
		*/
		writeBuffer(value, offset) {
			return this._handleBuffer(value, false, offset);
		}
		/**
		* Reads a null-terminated Buffer from the current read poisiton.
		*
		* @return { Buffer }
		*/
		readBufferNT() {
			let nullPos = this.length;
			for (let i = this._readOffset; i < this.length; i++) if (this._buff[i] === 0) {
				nullPos = i;
				break;
			}
			const value = this._buff.slice(this._readOffset, nullPos);
			this._readOffset = nullPos + 1;
			return value;
		}
		/**
		* Inserts a null-terminated Buffer.
		*
		* @param value { Buffer } The Buffer to write.
		* @param offset { Number } The offset to write the Buffer to.
		*
		* @return this
		*/
		insertBufferNT(value, offset) {
			utils_1.checkOffsetValue(offset);
			this.insertBuffer(value, offset);
			this.insertUInt8(0, offset + value.length);
			return this;
		}
		/**
		* Writes a null-terminated Buffer.
		*
		* @param value { Buffer } The Buffer to write.
		* @param offset { Number } The offset to write the Buffer to.
		*
		* @return this
		*/
		writeBufferNT(value, offset) {
			if (typeof offset !== "undefined") utils_1.checkOffsetValue(offset);
			this.writeBuffer(value, offset);
			this.writeUInt8(0, typeof offset === "number" ? offset + value.length : this._writeOffset);
			return this;
		}
		/**
		* Clears the SmartBuffer instance to its original empty state.
		*/
		clear() {
			this._writeOffset = 0;
			this._readOffset = 0;
			this.length = 0;
			return this;
		}
		/**
		* Gets the remaining data left to be read from the SmartBuffer instance.
		*
		* @return { Number }
		*/
		remaining() {
			return this.length - this._readOffset;
		}
		/**
		* Gets the current read offset value of the SmartBuffer instance.
		*
		* @return { Number }
		*/
		get readOffset() {
			return this._readOffset;
		}
		/**
		* Sets the read offset value of the SmartBuffer instance.
		*
		* @param offset { Number } - The offset value to set.
		*/
		set readOffset(offset) {
			utils_1.checkOffsetValue(offset);
			utils_1.checkTargetOffset(offset, this);
			this._readOffset = offset;
		}
		/**
		* Gets the current write offset value of the SmartBuffer instance.
		*
		* @return { Number }
		*/
		get writeOffset() {
			return this._writeOffset;
		}
		/**
		* Sets the write offset value of the SmartBuffer instance.
		*
		* @param offset { Number } - The offset value to set.
		*/
		set writeOffset(offset) {
			utils_1.checkOffsetValue(offset);
			utils_1.checkTargetOffset(offset, this);
			this._writeOffset = offset;
		}
		/**
		* Gets the currently set string encoding of the SmartBuffer instance.
		*
		* @return { BufferEncoding } The string Buffer encoding currently set.
		*/
		get encoding() {
			return this._encoding;
		}
		/**
		* Sets the string encoding of the SmartBuffer instance.
		*
		* @param encoding { BufferEncoding } The string Buffer encoding to set.
		*/
		set encoding(encoding) {
			utils_1.checkEncoding(encoding);
			this._encoding = encoding;
		}
		/**
		* Gets the underlying internal Buffer. (This includes unmanaged data in the Buffer)
		*
		* @return { Buffer } The Buffer value.
		*/
		get internalBuffer() {
			return this._buff;
		}
		/**
		* Gets the value of the internal managed Buffer (Includes managed data only)
		*
		* @param { Buffer }
		*/
		toBuffer() {
			return this._buff.slice(0, this.length);
		}
		/**
		* Gets the String value of the internal managed Buffer
		*
		* @param encoding { String } The BufferEncoding to display the Buffer as (defaults to instance level encoding).
		*/
		toString(encoding) {
			const encodingVal = typeof encoding === "string" ? encoding : this._encoding;
			utils_1.checkEncoding(encodingVal);
			return this._buff.toString(encodingVal, 0, this.length);
		}
		/**
		* Destroys the SmartBuffer instance.
		*/
		destroy() {
			this.clear();
			return this;
		}
		/**
		* Handles inserting and writing strings.
		*
		* @param value { String } The String value to insert.
		* @param isInsert { Boolean } True if inserting a string, false if writing.
		* @param arg2 { Number | String } The offset to insert the string at, or the BufferEncoding to use.
		* @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
		*/
		_handleString(value, isInsert, arg3, encoding) {
			let offsetVal = this._writeOffset;
			let encodingVal = this._encoding;
			if (typeof arg3 === "number") offsetVal = arg3;
			else if (typeof arg3 === "string") {
				utils_1.checkEncoding(arg3);
				encodingVal = arg3;
			}
			if (typeof encoding === "string") {
				utils_1.checkEncoding(encoding);
				encodingVal = encoding;
			}
			const byteLength = Buffer.byteLength(value, encodingVal);
			if (isInsert) this.ensureInsertable(byteLength, offsetVal);
			else this._ensureWriteable(byteLength, offsetVal);
			this._buff.write(value, offsetVal, byteLength, encodingVal);
			if (isInsert) this._writeOffset += byteLength;
			else if (typeof arg3 === "number") this._writeOffset = Math.max(this._writeOffset, offsetVal + byteLength);
			else this._writeOffset += byteLength;
			return this;
		}
		/**
		* Handles writing or insert of a Buffer.
		*
		* @param value { Buffer } The Buffer to write.
		* @param offset { Number } The offset to write the Buffer to.
		*/
		_handleBuffer(value, isInsert, offset) {
			const offsetVal = typeof offset === "number" ? offset : this._writeOffset;
			if (isInsert) this.ensureInsertable(value.length, offsetVal);
			else this._ensureWriteable(value.length, offsetVal);
			value.copy(this._buff, offsetVal);
			if (isInsert) this._writeOffset += value.length;
			else if (typeof offset === "number") this._writeOffset = Math.max(this._writeOffset, offsetVal + value.length);
			else this._writeOffset += value.length;
			return this;
		}
		/**
		* Ensures that the internal Buffer is large enough to read data.
		*
		* @param length { Number } The length of the data that needs to be read.
		* @param offset { Number } The offset of the data that needs to be read.
		*/
		ensureReadable(length, offset) {
			let offsetVal = this._readOffset;
			if (typeof offset !== "undefined") {
				utils_1.checkOffsetValue(offset);
				offsetVal = offset;
			}
			if (offsetVal < 0 || offsetVal + length > this.length) throw new Error(utils_1.ERRORS.INVALID_READ_BEYOND_BOUNDS);
		}
		/**
		* Ensures that the internal Buffer is large enough to insert data.
		*
		* @param dataLength { Number } The length of the data that needs to be written.
		* @param offset { Number } The offset of the data to be written.
		*/
		ensureInsertable(dataLength, offset) {
			utils_1.checkOffsetValue(offset);
			this._ensureCapacity(this.length + dataLength);
			if (offset < this.length) this._buff.copy(this._buff, offset + dataLength, offset, this._buff.length);
			if (offset + dataLength > this.length) this.length = offset + dataLength;
			else this.length += dataLength;
		}
		/**
		* Ensures that the internal Buffer is large enough to write data.
		*
		* @param dataLength { Number } The length of the data that needs to be written.
		* @param offset { Number } The offset of the data to be written (defaults to writeOffset).
		*/
		_ensureWriteable(dataLength, offset) {
			const offsetVal = typeof offset === "number" ? offset : this._writeOffset;
			this._ensureCapacity(offsetVal + dataLength);
			if (offsetVal + dataLength > this.length) this.length = offsetVal + dataLength;
		}
		/**
		* Ensures that the internal Buffer is large enough to write at least the given amount of data.
		*
		* @param minLength { Number } The minimum length of the data needs to be written.
		*/
		_ensureCapacity(minLength) {
			const oldLength = this._buff.length;
			if (minLength > oldLength) {
				let data = this._buff;
				let newLength = oldLength * 3 / 2 + 1;
				if (newLength < minLength) newLength = minLength;
				this._buff = Buffer.allocUnsafe(newLength);
				data.copy(this._buff, 0, 0, oldLength);
			}
		}
		/**
		* Reads a numeric number value using the provided function.
		*
		* @typeparam T { number | bigint } The type of the value to be read
		*
		* @param func { Function(offset: number) => number } The function to read data on the internal Buffer with.
		* @param byteSize { Number } The number of bytes read.
		* @param offset { Number } The offset to read from (optional). When this is not provided, the managed readOffset is used instead.
		*
		* @returns { T } the number value
		*/
		_readNumberValue(func, byteSize, offset) {
			this.ensureReadable(byteSize, offset);
			const value = func.call(this._buff, typeof offset === "number" ? offset : this._readOffset);
			if (typeof offset === "undefined") this._readOffset += byteSize;
			return value;
		}
		/**
		* Inserts a numeric number value based on the given offset and value.
		*
		* @typeparam T { number | bigint } The type of the value to be written
		*
		* @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
		* @param byteSize { Number } The number of bytes written.
		* @param value { T } The number value to write.
		* @param offset { Number } the offset to write the number at (REQUIRED).
		*
		* @returns SmartBuffer this buffer
		*/
		_insertNumberValue(func, byteSize, value, offset) {
			utils_1.checkOffsetValue(offset);
			this.ensureInsertable(byteSize, offset);
			func.call(this._buff, value, offset);
			this._writeOffset += byteSize;
			return this;
		}
		/**
		* Writes a numeric number value based on the given offset and value.
		*
		* @typeparam T { number | bigint } The type of the value to be written
		*
		* @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
		* @param byteSize { Number } The number of bytes written.
		* @param value { T } The number value to write.
		* @param offset { Number } the offset to write the number at (REQUIRED).
		*
		* @returns SmartBuffer this buffer
		*/
		_writeNumberValue(func, byteSize, value, offset) {
			if (typeof offset === "number") {
				if (offset < 0) throw new Error(utils_1.ERRORS.INVALID_WRITE_BEYOND_BOUNDS);
				utils_1.checkOffsetValue(offset);
			}
			const offsetVal = typeof offset === "number" ? offset : this._writeOffset;
			this._ensureWriteable(byteSize, offsetVal);
			func.call(this._buff, value, offsetVal);
			if (typeof offset === "number") this._writeOffset = Math.max(this._writeOffset, offsetVal + byteSize);
			else this._writeOffset += byteSize;
			return this;
		}
	};
}));
//#endregion
//#region node_modules/socks/build/common/constants.js
var require_constants$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SOCKS5_NO_ACCEPTABLE_AUTH = exports.SOCKS5_CUSTOM_AUTH_END = exports.SOCKS5_CUSTOM_AUTH_START = exports.SOCKS_INCOMING_PACKET_SIZES = exports.SocksClientState = exports.Socks5Response = exports.Socks5HostType = exports.Socks5Auth = exports.Socks4Response = exports.SocksCommand = exports.ERRORS = exports.DEFAULT_TIMEOUT = void 0;
	exports.DEFAULT_TIMEOUT = 3e4;
	exports.ERRORS = {
		InvalidSocksCommand: "An invalid SOCKS command was provided. Valid options are connect, bind, and associate.",
		InvalidSocksCommandForOperation: "An invalid SOCKS command was provided. Only a subset of commands are supported for this operation.",
		InvalidSocksCommandChain: "An invalid SOCKS command was provided. Chaining currently only supports the connect command.",
		InvalidSocksClientOptionsDestination: "An invalid destination host was provided.",
		InvalidSocksClientOptionsExistingSocket: "An invalid existing socket was provided. This should be an instance of stream.Duplex.",
		InvalidSocksClientOptionsProxy: "Invalid SOCKS proxy details were provided.",
		InvalidSocksClientOptionsTimeout: "An invalid timeout value was provided. Please enter a value above 0 (in ms).",
		InvalidSocksClientOptionsProxiesLength: "At least two socks proxies must be provided for chaining.",
		InvalidSocksClientOptionsCustomAuthRange: "Custom auth must be a value between 0x80 and 0xFE.",
		InvalidSocksClientOptionsCustomAuthOptions: "When a custom_auth_method is provided, custom_auth_request_handler, custom_auth_response_size, and custom_auth_response_handler must also be provided and valid.",
		NegotiationError: "Negotiation error",
		SocketClosed: "Socket closed",
		ProxyConnectionTimedOut: "Proxy connection timed out",
		InternalError: "SocksClient internal error (this should not happen)",
		InvalidSocks4HandshakeResponse: "Received invalid Socks4 handshake response",
		Socks4ProxyRejectedConnection: "Socks4 Proxy rejected connection",
		InvalidSocks4IncomingConnectionResponse: "Socks4 invalid incoming connection response",
		Socks4ProxyRejectedIncomingBoundConnection: "Socks4 Proxy rejected incoming bound connection",
		InvalidSocks5InitialHandshakeResponse: "Received invalid Socks5 initial handshake response",
		InvalidSocks5IntiailHandshakeSocksVersion: "Received invalid Socks5 initial handshake (invalid socks version)",
		InvalidSocks5InitialHandshakeNoAcceptedAuthType: "Received invalid Socks5 initial handshake (no accepted authentication type)",
		InvalidSocks5InitialHandshakeUnknownAuthType: "Received invalid Socks5 initial handshake (unknown authentication type)",
		Socks5AuthenticationFailed: "Socks5 Authentication failed",
		InvalidSocks5FinalHandshake: "Received invalid Socks5 final handshake response",
		InvalidSocks5FinalHandshakeRejected: "Socks5 proxy rejected connection",
		InvalidSocks5IncomingConnectionResponse: "Received invalid Socks5 incoming connection response",
		Socks5ProxyRejectedIncomingBoundConnection: "Socks5 Proxy rejected incoming bound connection"
	};
	exports.SOCKS_INCOMING_PACKET_SIZES = {
		Socks5InitialHandshakeResponse: 2,
		Socks5UserPassAuthenticationResponse: 2,
		Socks5ResponseHeader: 5,
		Socks5ResponseIPv4: 10,
		Socks5ResponseIPv6: 22,
		Socks5ResponseHostname: (hostNameLength) => hostNameLength + 7,
		Socks4Response: 8
	};
	var SocksCommand;
	(function(SocksCommand) {
		SocksCommand[SocksCommand["connect"] = 1] = "connect";
		SocksCommand[SocksCommand["bind"] = 2] = "bind";
		SocksCommand[SocksCommand["associate"] = 3] = "associate";
	})(SocksCommand || (exports.SocksCommand = SocksCommand = {}));
	var Socks4Response;
	(function(Socks4Response) {
		Socks4Response[Socks4Response["Granted"] = 90] = "Granted";
		Socks4Response[Socks4Response["Failed"] = 91] = "Failed";
		Socks4Response[Socks4Response["Rejected"] = 92] = "Rejected";
		Socks4Response[Socks4Response["RejectedIdent"] = 93] = "RejectedIdent";
	})(Socks4Response || (exports.Socks4Response = Socks4Response = {}));
	var Socks5Auth;
	(function(Socks5Auth) {
		Socks5Auth[Socks5Auth["NoAuth"] = 0] = "NoAuth";
		Socks5Auth[Socks5Auth["GSSApi"] = 1] = "GSSApi";
		Socks5Auth[Socks5Auth["UserPass"] = 2] = "UserPass";
	})(Socks5Auth || (exports.Socks5Auth = Socks5Auth = {}));
	exports.SOCKS5_CUSTOM_AUTH_START = 128;
	exports.SOCKS5_CUSTOM_AUTH_END = 254;
	exports.SOCKS5_NO_ACCEPTABLE_AUTH = 255;
	var Socks5Response;
	(function(Socks5Response) {
		Socks5Response[Socks5Response["Granted"] = 0] = "Granted";
		Socks5Response[Socks5Response["Failure"] = 1] = "Failure";
		Socks5Response[Socks5Response["NotAllowed"] = 2] = "NotAllowed";
		Socks5Response[Socks5Response["NetworkUnreachable"] = 3] = "NetworkUnreachable";
		Socks5Response[Socks5Response["HostUnreachable"] = 4] = "HostUnreachable";
		Socks5Response[Socks5Response["ConnectionRefused"] = 5] = "ConnectionRefused";
		Socks5Response[Socks5Response["TTLExpired"] = 6] = "TTLExpired";
		Socks5Response[Socks5Response["CommandNotSupported"] = 7] = "CommandNotSupported";
		Socks5Response[Socks5Response["AddressNotSupported"] = 8] = "AddressNotSupported";
	})(Socks5Response || (exports.Socks5Response = Socks5Response = {}));
	var Socks5HostType;
	(function(Socks5HostType) {
		Socks5HostType[Socks5HostType["IPv4"] = 1] = "IPv4";
		Socks5HostType[Socks5HostType["Hostname"] = 3] = "Hostname";
		Socks5HostType[Socks5HostType["IPv6"] = 4] = "IPv6";
	})(Socks5HostType || (exports.Socks5HostType = Socks5HostType = {}));
	var SocksClientState;
	(function(SocksClientState) {
		SocksClientState[SocksClientState["Created"] = 0] = "Created";
		SocksClientState[SocksClientState["Connecting"] = 1] = "Connecting";
		SocksClientState[SocksClientState["Connected"] = 2] = "Connected";
		SocksClientState[SocksClientState["SentInitialHandshake"] = 3] = "SentInitialHandshake";
		SocksClientState[SocksClientState["ReceivedInitialHandshakeResponse"] = 4] = "ReceivedInitialHandshakeResponse";
		SocksClientState[SocksClientState["SentAuthentication"] = 5] = "SentAuthentication";
		SocksClientState[SocksClientState["ReceivedAuthenticationResponse"] = 6] = "ReceivedAuthenticationResponse";
		SocksClientState[SocksClientState["SentFinalHandshake"] = 7] = "SentFinalHandshake";
		SocksClientState[SocksClientState["ReceivedFinalResponse"] = 8] = "ReceivedFinalResponse";
		SocksClientState[SocksClientState["BoundWaitingForConnection"] = 9] = "BoundWaitingForConnection";
		SocksClientState[SocksClientState["Established"] = 10] = "Established";
		SocksClientState[SocksClientState["Disconnected"] = 11] = "Disconnected";
		SocksClientState[SocksClientState["Error"] = 99] = "Error";
	})(SocksClientState || (exports.SocksClientState = SocksClientState = {}));
}));
//#endregion
//#region node_modules/socks/build/common/util.js
var require_util = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.shuffleArray = exports.SocksClientError = void 0;
	/**
	* Error wrapper for SocksClient
	*/
	var SocksClientError = class extends Error {
		constructor(message, options) {
			super(message);
			this.options = options;
		}
	};
	exports.SocksClientError = SocksClientError;
	/**
	* Shuffles a given array.
	* @param array The array to shuffle.
	*/
	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}
	exports.shuffleArray = shuffleArray;
}));
//#endregion
//#region node_modules/ip-address/dist/address-error.js
var require_address_error = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AddressError = void 0;
	var AddressError = class extends Error {
		constructor(message, parseMessage) {
			super(message);
			this.name = "AddressError";
			this.parseMessage = parseMessage;
		}
	};
	exports.AddressError = AddressError;
}));
//#endregion
//#region node_modules/ip-address/dist/common.js
var require_common = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isInSubnet = isInSubnet;
	exports.isCorrect = isCorrect;
	exports.prefixLengthFromMask = prefixLengthFromMask;
	exports.numberToPaddedHex = numberToPaddedHex;
	exports.stringToPaddedHex = stringToPaddedHex;
	exports.testBit = testBit;
	var address_error_1 = require_address_error();
	function isInSubnet(address) {
		if (this.subnetMask < address.subnetMask) return false;
		if (this.mask(address.subnetMask) === address.mask()) return true;
		return false;
	}
	function isCorrect(defaultBits) {
		return function() {
			if (this.addressMinusSuffix !== this.correctForm()) return false;
			if (this.subnetMask === defaultBits && !this.parsedSubnet) return true;
			return this.parsedSubnet === String(this.subnetMask);
		};
	}
	/**
	* Returns the prefix length (number of leading 1 bits) of a contiguous
	* subnet mask. Throws `AddressError` if the mask is non-contiguous (e.g.
	* `255.0.255.0`).
	*/
	function prefixLengthFromMask(value, totalBits) {
		const binary = value.toString(2).padStart(totalBits, "0");
		if (binary.length > totalBits) throw new address_error_1.AddressError("Invalid subnet mask.");
		const firstZero = binary.indexOf("0");
		if (firstZero === -1) return totalBits;
		if (binary.slice(firstZero).includes("1")) throw new address_error_1.AddressError("Invalid subnet mask.");
		return firstZero;
	}
	function numberToPaddedHex(number) {
		return number.toString(16).padStart(2, "0");
	}
	function stringToPaddedHex(numberString) {
		return numberToPaddedHex(parseInt(numberString, 10));
	}
	/**
	* @param binaryValue Binary representation of a value (e.g. `10`)
	* @param position Byte position, where 0 is the least significant bit
	*/
	function testBit(binaryValue, position) {
		const { length } = binaryValue;
		if (position > length) return false;
		const positionInString = length - position;
		return binaryValue.substring(positionInString, positionInString + 1) === "1";
	}
}));
//#endregion
//#region node_modules/ip-address/dist/v4/constants.js
var require_constants$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RE_SUBNET_STRING = exports.RE_ADDRESS = exports.GROUPS = exports.BITS = void 0;
	exports.BITS = 32;
	exports.GROUPS = 4;
	exports.RE_ADDRESS = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g;
	exports.RE_SUBNET_STRING = /\/\d{1,2}$/;
}));
//#endregion
//#region node_modules/ip-address/dist/ipv4.js
var require_ipv4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Address4 = void 0;
	var common = __importStar(require_common());
	var constants = __importStar(require_constants$1());
	var address_error_1 = require_address_error();
	var isCorrect4 = common.isCorrect(constants.BITS);
	/**
	* Represents an IPv4 address
	* @param {string} address - An IPv4 address string
	*/
	var Address4 = class Address4 {
		constructor(address) {
			this.groups = constants.GROUPS;
			this.parsedAddress = [];
			this.parsedSubnet = "";
			this.subnet = "/32";
			this.subnetMask = 32;
			this.v4 = true;
			/**
			* Returns true if the address is correct, false otherwise
			* @returns {Boolean}
			*/
			this.isCorrect = isCorrect4;
			/**
			* Returns true if the given address is in the subnet of the current address
			* @returns {boolean}
			*/
			this.isInSubnet = common.isInSubnet;
			this.address = address;
			const subnet = constants.RE_SUBNET_STRING.exec(address);
			if (subnet) {
				this.parsedSubnet = subnet[0].replace("/", "");
				this.subnetMask = parseInt(this.parsedSubnet, 10);
				this.subnet = `/${this.subnetMask}`;
				if (this.subnetMask < 0 || this.subnetMask > constants.BITS) throw new address_error_1.AddressError("Invalid subnet mask.");
				address = address.replace(constants.RE_SUBNET_STRING, "");
			}
			this.addressMinusSuffix = address;
			this.parsedAddress = this.parse(address);
		}
		/**
		* Returns true if the given string is a valid IPv4 address (with optional
		* CIDR subnet), false otherwise. Host bits in the subnet portion are
		* allowed (e.g. `192.168.1.5/24` is valid); for strict network-address
		* validation compare `correctForm()` to `startAddress().correctForm()`,
		* or use `networkForm()`.
		*/
		static isValid(address) {
			try {
				new Address4(address);
				return true;
			} catch (e) {
				return false;
			}
		}
		/**
		* Parses an IPv4 address string into its four octet groups and stores the
		* result on `this.parsedAddress`. Called automatically by the constructor;
		* you typically don't need to call it directly. Throws `AddressError` if
		* the input is not a valid IPv4 address.
		*/
		parse(address) {
			const groups = address.split(".");
			if (!address.match(constants.RE_ADDRESS)) throw new address_error_1.AddressError("Invalid IPv4 address.");
			return groups;
		}
		/**
		* Returns the address in correct form: octets joined with `.` and any
		* leading zeros stripped (e.g. `192.168.1.1`). For IPv4 this matches the
		* canonical dotted-decimal representation.
		*/
		correctForm() {
			return this.parsedAddress.map((part) => parseInt(part, 10)).join(".");
		}
		/**
		* Construct an `Address4` from an address and a dotted-decimal subnet
		* mask given as separate strings (e.g. as returned by Node's
		* `os.networkInterfaces()`). Throws `AddressError` if the mask is
		* non-contiguous (e.g. `255.0.255.0`).
		* @example
		* var address = Address4.fromAddressAndMask('192.168.1.1', '255.255.255.0');
		* address.subnetMask; // 24
		*/
		static fromAddressAndMask(address, mask) {
			const bits = common.prefixLengthFromMask(new Address4(mask).bigInt(), constants.BITS);
			return new Address4(`${address}/${bits}`);
		}
		/**
		* Construct an `Address4` from an address and a Cisco-style wildcard mask
		* given as separate strings (e.g. `0.0.0.255` for a `/24`). The wildcard
		* mask is the bitwise inverse of the subnet mask. Throws `AddressError`
		* if the mask is non-contiguous (e.g. `0.255.0.255`).
		* @example
		* var address = Address4.fromAddressAndWildcardMask('10.0.0.1', '0.0.0.255');
		* address.subnetMask; // 24
		*/
		static fromAddressAndWildcardMask(address, wildcardMask) {
			const mask = new Address4(wildcardMask).bigInt() ^ (BigInt(1) << BigInt(constants.BITS)) - BigInt(1);
			const bits = common.prefixLengthFromMask(mask, constants.BITS);
			return new Address4(`${address}/${bits}`);
		}
		/**
		* Construct an `Address4` from a wildcard pattern with trailing `*`
		* octets. The number of trailing wildcards determines the prefix
		* length: each `*` represents 8 bits.
		*
		* Only trailing whole-octet wildcards are supported. Partial-octet
		* wildcards (e.g. `192.168.0.1*`) and interior wildcards (e.g.
		* `192.*.0.1`) throw `AddressError`.
		* @example
		* Address4.fromWildcard('192.168.0.*').subnet;   // '/24'
		* Address4.fromWildcard('192.168.*.*').subnet;   // '/16'
		* Address4.fromWildcard('*.*.*.*').subnet;       // '/0'
		*/
		static fromWildcard(input) {
			const groups = input.split(".");
			if (groups.length !== constants.GROUPS) throw new address_error_1.AddressError("Wildcard pattern must have 4 octets");
			let firstWildcard = -1;
			for (let i = 0; i < groups.length; i++) if (groups[i] === "*") {
				if (firstWildcard === -1) firstWildcard = i;
			} else if (firstWildcard !== -1) throw new address_error_1.AddressError("Wildcard `*` must only appear in trailing octets (e.g. `192.168.0.*`)");
			const trailing = firstWildcard === -1 ? 0 : groups.length - firstWildcard;
			const replaced = groups.map((g) => g === "*" ? "0" : g);
			const subnetBits = constants.BITS - trailing * 8;
			return new Address4(`${replaced.join(".")}/${subnetBits}`);
		}
		/**
		* Converts a hex string to an IPv4 address object. Accepts 8 hex digits
		* with optional `:` separators (e.g. `'7f000001'` or `'7f:00:00:01'`).
		* Throws `AddressError` for any other length or for non-hex characters.
		* @param {string} hex - a hex string to convert
		* @returns {Address4}
		*/
		static fromHex(hex) {
			const stripped = hex.replace(/:/g, "");
			if (!/^[0-9a-fA-F]{8}$/.test(stripped)) throw new address_error_1.AddressError("IPv4 hex must be exactly 8 hex digits");
			const groups = [];
			for (let i = 0; i < 8; i += 2) groups.push(parseInt(stripped.slice(i, i + 2), 16));
			return new Address4(groups.join("."));
		}
		/**
		* Converts an integer into a IPv4 address object. The integer must be a
		* non-negative safe integer in the range `[0, 2**32 - 1]`; otherwise
		* `AddressError` is thrown.
		* @param {integer} integer - a number to convert
		* @returns {Address4}
		*/
		static fromInteger(integer) {
			if (!Number.isInteger(integer) || integer < 0 || integer > 4294967295) throw new address_error_1.AddressError("IPv4 integer must be in the range 0 to 2**32 - 1");
			return Address4.fromHex(integer.toString(16).padStart(8, "0"));
		}
		/**
		* Return an address from in-addr.arpa form
		* @param {string} arpaFormAddress - an 'in-addr.arpa' form ipv4 address
		* @returns {Adress4}
		* @example
		* var address = Address4.fromArpa(42.2.0.192.in-addr.arpa.)
		* address.correctForm(); // '192.0.2.42'
		*/
		static fromArpa(arpaFormAddress) {
			const address = arpaFormAddress.replace(/(\.in-addr\.arpa)?\.$/, "").split(".").reverse().join(".");
			return new Address4(address);
		}
		/**
		* Converts an IPv4 address object to a hex string
		* @returns {String}
		*/
		toHex() {
			return this.parsedAddress.map((part) => common.stringToPaddedHex(part)).join(":");
		}
		/**
		* Converts an IPv4 address object to an array of bytes.
		*
		* To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toArray())`.
		* @returns {Array}
		*/
		toArray() {
			return this.parsedAddress.map((part) => parseInt(part, 10));
		}
		/**
		* Converts an IPv4 address object to an IPv6 address group
		* @returns {String}
		*/
		toGroup6() {
			const output = [];
			let i;
			for (i = 0; i < constants.GROUPS; i += 2) output.push(`${common.stringToPaddedHex(this.parsedAddress[i])}${common.stringToPaddedHex(this.parsedAddress[i + 1])}`);
			return output.join(":");
		}
		/**
		* Returns the address as a `bigint`
		* @returns {bigint}
		*/
		bigInt() {
			return BigInt(`0x${this.parsedAddress.map((n) => common.stringToPaddedHex(n)).join("")}`);
		}
		/**
		* Helper function getting start address.
		* @returns {bigint}
		*/
		_startAddress() {
			return BigInt(`0b${this.mask() + "0".repeat(constants.BITS - this.subnetMask)}`);
		}
		/**
		* The first address in the range given by this address' subnet.
		* Often referred to as the Network Address.
		* @returns {Address4}
		*/
		startAddress() {
			return Address4.fromBigInt(this._startAddress());
		}
		/**
		* The first host address in the range given by this address's subnet ie
		* the first address after the Network Address
		* @returns {Address4}
		*/
		startAddressExclusive() {
			const adjust = BigInt("1");
			return Address4.fromBigInt(this._startAddress() + adjust);
		}
		/**
		* Helper function getting end address.
		* @returns {bigint}
		*/
		_endAddress() {
			return BigInt(`0b${this.mask() + "1".repeat(constants.BITS - this.subnetMask)}`);
		}
		/**
		* The last address in the range given by this address' subnet
		* Often referred to as the Broadcast
		* @returns {Address4}
		*/
		endAddress() {
			return Address4.fromBigInt(this._endAddress());
		}
		/**
		* The last host address in the range given by this address's subnet ie
		* the last address prior to the Broadcast Address
		* @returns {Address4}
		*/
		endAddressExclusive() {
			const adjust = BigInt("1");
			return Address4.fromBigInt(this._endAddress() - adjust);
		}
		/**
		* The dotted-decimal form of the subnet mask, e.g. `255.255.240.0` for
		* a `/20`. Returns an `Address4`; call `.correctForm()` for the string.
		* @returns {Address4}
		*/
		subnetMaskAddress() {
			return Address4.fromBigInt(BigInt(`0b${"1".repeat(this.subnetMask)}${"0".repeat(constants.BITS - this.subnetMask)}`));
		}
		/**
		* The Cisco-style wildcard mask, e.g. `0.0.0.255` for a `/24`. This is
		* the bitwise inverse of `subnetMaskAddress()`. Returns an `Address4`;
		* call `.correctForm()` for the string.
		* @returns {Address4}
		*/
		wildcardMask() {
			return Address4.fromBigInt(BigInt(`0b${"0".repeat(this.subnetMask)}${"1".repeat(constants.BITS - this.subnetMask)}`));
		}
		/**
		* The network address in CIDR string form, e.g. `192.168.1.0/24` for
		* `192.168.1.5/24`. For an address with no explicit subnet the prefix is
		* `/32`, e.g. `networkForm()` on `192.168.1.5` returns `192.168.1.5/32`.
		* @returns {string}
		*/
		networkForm() {
			return `${this.startAddress().correctForm()}/${this.subnetMask}`;
		}
		/**
		* Converts a BigInt to a v4 address object. The value must be in the
		* range `[0, 2**32 - 1]`; otherwise `AddressError` is thrown.
		* @param {bigint} bigInt - a BigInt to convert
		* @returns {Address4}
		*/
		static fromBigInt(bigInt) {
			if (bigInt < 0n || bigInt > 4294967295n) throw new address_error_1.AddressError("IPv4 BigInt must be in the range 0 to 2**32 - 1");
			return Address4.fromHex(bigInt.toString(16).padStart(8, "0"));
		}
		/**
		* Convert a byte array to an Address4 object.
		*
		* To convert from a Node.js `Buffer`, spread it: `Address4.fromByteArray([...buf])`.
		* @param {Array<number>} bytes - an array of 4 bytes (0-255)
		* @returns {Address4}
		*/
		static fromByteArray(bytes) {
			if (bytes.length !== 4) throw new address_error_1.AddressError("IPv4 addresses require exactly 4 bytes");
			for (let i = 0; i < bytes.length; i++) if (!Number.isInteger(bytes[i]) || bytes[i] < 0 || bytes[i] > 255) throw new address_error_1.AddressError("All bytes must be integers between 0 and 255");
			return this.fromUnsignedByteArray(bytes);
		}
		/**
		* Convert an unsigned byte array to an Address4 object
		* @param {Array<number>} bytes - an array of 4 unsigned bytes (0-255)
		* @returns {Address4}
		*/
		static fromUnsignedByteArray(bytes) {
			if (bytes.length !== 4) throw new address_error_1.AddressError("IPv4 addresses require exactly 4 bytes");
			const address = bytes.join(".");
			return new Address4(address);
		}
		/**
		* Returns the first n bits of the address, defaulting to the
		* subnet mask
		* @returns {String}
		*/
		mask(mask) {
			if (mask === void 0) mask = this.subnetMask;
			return this.getBitsBase2(0, mask);
		}
		/**
		* Returns the bits in the given range as a base-2 string
		* @returns {string}
		*/
		getBitsBase2(start, end) {
			return this.binaryZeroPad().slice(start, end);
		}
		/**
		* Return the reversed ip6.arpa form of the address
		* @param {Object} options
		* @param {boolean} options.omitSuffix - omit the "in-addr.arpa" suffix
		* @returns {String}
		*/
		reverseForm(options) {
			if (!options) options = {};
			const reversed = this.correctForm().split(".").reverse().join(".");
			if (options.omitSuffix) return reversed;
			return `${reversed}.in-addr.arpa.`;
		}
		/**
		* Returns true if the given address is a multicast address
		* @returns {boolean}
		*/
		isMulticast() {
			return this.isInSubnet(MULTICAST_V4);
		}
		/**
		* Returns true if the address is in one of the [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) private address ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
		* @returns {boolean}
		*/
		isPrivate() {
			return PRIVATE_V4.some((subnet) => this.isInSubnet(subnet));
		}
		/**
		* Returns true if the address is in the loopback range `127.0.0.0/8` ([RFC 1122](https://datatracker.ietf.org/doc/html/rfc1122)).
		* @returns {boolean}
		*/
		isLoopback() {
			return this.isInSubnet(LOOPBACK_V4);
		}
		/**
		* Returns true if the address is in the link-local range `169.254.0.0/16` ([RFC 3927](https://datatracker.ietf.org/doc/html/rfc3927)).
		* @returns {boolean}
		*/
		isLinkLocal() {
			return this.isInSubnet(LINK_LOCAL_V4);
		}
		/**
		* Returns true if the address is the unspecified address `0.0.0.0`.
		* @returns {boolean}
		*/
		isUnspecified() {
			return this.isInSubnet(UNSPECIFIED_V4);
		}
		/**
		* Returns true if the address is the limited broadcast address `255.255.255.255` ([RFC 919](https://datatracker.ietf.org/doc/html/rfc919)).
		* @returns {boolean}
		*/
		isBroadcast() {
			return this.isInSubnet(BROADCAST_V4);
		}
		/**
		* Returns true if the address is in the carrier-grade NAT range `100.64.0.0/10` ([RFC 6598](https://datatracker.ietf.org/doc/html/rfc6598)).
		* @returns {boolean}
		*/
		isCGNAT() {
			return this.isInSubnet(CGNAT_V4);
		}
		/**
		* Returns a zero-padded base-2 string representation of the address
		* @returns {string}
		*/
		binaryZeroPad() {
			if (this._binaryZeroPad === void 0) this._binaryZeroPad = this.bigInt().toString(2).padStart(constants.BITS, "0");
			return this._binaryZeroPad;
		}
		/**
		* Groups an IPv4 address for inclusion at the end of an IPv6 address
		* @returns {String}
		*/
		groupForV6() {
			const segments = this.parsedAddress;
			return this.address.replace(constants.RE_ADDRESS, `<span class="hover-group group-v4 group-6">${segments.slice(0, 2).join(".")}</span>.<span class="hover-group group-v4 group-7">${segments.slice(2, 4).join(".")}</span>`);
		}
	};
	exports.Address4 = Address4;
	var MULTICAST_V4 = new Address4("224.0.0.0/4");
	var PRIVATE_V4 = [
		new Address4("10.0.0.0/8"),
		new Address4("172.16.0.0/12"),
		new Address4("192.168.0.0/16")
	];
	var LOOPBACK_V4 = new Address4("127.0.0.0/8");
	var LINK_LOCAL_V4 = new Address4("169.254.0.0/16");
	var UNSPECIFIED_V4 = new Address4("0.0.0.0/32");
	var BROADCAST_V4 = new Address4("255.255.255.255/32");
	var CGNAT_V4 = new Address4("100.64.0.0/10");
}));
//#endregion
//#region node_modules/ip-address/dist/v6/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RE_URL_WITH_PORT = exports.RE_URL = exports.RE_ZONE_STRING = exports.RE_SUBNET_STRING = exports.RE_BAD_ADDRESS = exports.RE_BAD_CHARACTERS = exports.TYPES = exports.SCOPES = exports.GROUPS = exports.BITS = void 0;
	exports.BITS = 128;
	exports.GROUPS = 8;
	/**
	* Represents IPv6 address scopes
	* @memberof Address6
	* @static
	*/
	exports.SCOPES = {
		0: "Reserved",
		1: "Interface local",
		2: "Link local",
		4: "Admin local",
		5: "Site local",
		8: "Organization local",
		14: "Global",
		15: "Reserved"
	};
	/**
	* Represents IPv6 address types
	* @memberof Address6
	* @static
	*/
	exports.TYPES = {
		"ff01::1/128": "Multicast (All nodes on this interface)",
		"ff01::2/128": "Multicast (All routers on this interface)",
		"ff02::1/128": "Multicast (All nodes on this link)",
		"ff02::2/128": "Multicast (All routers on this link)",
		"ff05::2/128": "Multicast (All routers in this site)",
		"ff02::5/128": "Multicast (OSPFv3 AllSPF routers)",
		"ff02::6/128": "Multicast (OSPFv3 AllDR routers)",
		"ff02::9/128": "Multicast (RIP routers)",
		"ff02::a/128": "Multicast (EIGRP routers)",
		"ff02::d/128": "Multicast (PIM routers)",
		"ff02::16/128": "Multicast (MLDv2 reports)",
		"ff01::fb/128": "Multicast (mDNSv6)",
		"ff02::fb/128": "Multicast (mDNSv6)",
		"ff05::fb/128": "Multicast (mDNSv6)",
		"ff02::1:2/128": "Multicast (All DHCP servers and relay agents on this link)",
		"ff05::1:2/128": "Multicast (All DHCP servers and relay agents in this site)",
		"ff02::1:3/128": "Multicast (All DHCP servers on this link)",
		"ff05::1:3/128": "Multicast (All DHCP servers in this site)",
		"::/128": "Unspecified",
		"::1/128": "Loopback",
		"ff00::/8": "Multicast",
		"fe80::/10": "Link-local unicast",
		"fc00::/7": "Unique local",
		"2002::/16": "6to4",
		"2001:db8::/32": "Documentation",
		"64:ff9b::/96": "NAT64 (well-known)",
		"64:ff9b:1::/48": "NAT64 (local-use)"
	};
	/**
	* A regular expression that matches bad characters in an IPv6 address
	* @memberof Address6
	* @static
	*/
	exports.RE_BAD_CHARACTERS = /([^0-9a-f:/%])/gi;
	/**
	* A regular expression that matches an incorrect IPv6 address
	* @memberof Address6
	* @static
	*/
	exports.RE_BAD_ADDRESS = /([0-9a-f]{5,}|:{3,}|[^:]:$|^:[^:]|\/$)/gi;
	/**
	* A regular expression that matches an IPv6 subnet
	* @memberof Address6
	* @static
	*/
	exports.RE_SUBNET_STRING = /\/\d{1,3}(?=%|$)/;
	/**
	* A regular expression that matches an IPv6 zone
	* @memberof Address6
	* @static
	*/
	exports.RE_ZONE_STRING = /%.*$/;
	exports.RE_URL = /^\[{0,1}([0-9a-f:]+)\]{0,1}/;
	exports.RE_URL_WITH_PORT = /\[([0-9a-f:]+)\]:([0-9]{1,5})/;
}));
//#endregion
//#region node_modules/ip-address/dist/v6/helpers.js
var require_helpers$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.escapeHtml = escapeHtml;
	exports.spanAllZeroes = spanAllZeroes;
	exports.spanAll = spanAll;
	exports.spanLeadingZeroes = spanLeadingZeroes;
	exports.simpleGroup = simpleGroup;
	function escapeHtml(s) {
		return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
	}
	/**
	* @returns {String} the string with all zeroes contained in a <span>
	*/
	function spanAllZeroes(s) {
		return escapeHtml(s).replace(/(0+)/g, "<span class=\"zero\">$1</span>");
	}
	/**
	* @returns {String} the string with each character contained in a <span>
	*/
	function spanAll(s, offset = 0) {
		return s.split("").map((n, i) => `<span class="digit value-${escapeHtml(n)} position-${i + offset}">${spanAllZeroes(n)}</span>`).join("");
	}
	function spanLeadingZeroesSimple(group) {
		return escapeHtml(group).replace(/^(0+)/, "<span class=\"zero\">$1</span>");
	}
	/**
	* @returns {String} the string with leading zeroes contained in a <span>
	*/
	function spanLeadingZeroes(address) {
		return address.split(":").map((g) => spanLeadingZeroesSimple(g)).join(":");
	}
	/**
	* Groups an address
	* @returns {String} a grouped address
	*/
	function simpleGroup(addressString, offset = 0) {
		return addressString.split(":").map((g, i) => {
			if (/group-v4/.test(g)) return g;
			return `<span class="hover-group group-${i + offset}">${spanLeadingZeroesSimple(g)}</span>`;
		});
	}
}));
//#endregion
//#region node_modules/ip-address/dist/v6/regular-expressions.js
var require_regular_expressions = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ADDRESS_BOUNDARY = void 0;
	exports.groupPossibilities = groupPossibilities;
	exports.padGroup = padGroup;
	exports.simpleRegularExpression = simpleRegularExpression;
	exports.possibleElisions = possibleElisions;
	var v6 = __importStar(require_constants());
	function groupPossibilities(possibilities) {
		return `(${possibilities.join("|")})`;
	}
	function padGroup(group) {
		if (group.length < 4) return `0{0,${4 - group.length}}${group}`;
		return group;
	}
	exports.ADDRESS_BOUNDARY = "[^A-Fa-f0-9:]";
	function simpleRegularExpression(groups) {
		const zeroIndexes = [];
		groups.forEach((group, i) => {
			if (parseInt(group, 16) === 0) zeroIndexes.push(i);
		});
		const possibilities = zeroIndexes.map((zeroIndex) => groups.map((group, i) => {
			if (i === zeroIndex) {
				const elision = i === 0 || i === v6.GROUPS - 1 ? ":" : "";
				return groupPossibilities([padGroup(group), elision]);
			}
			return padGroup(group);
		}).join(":"));
		possibilities.push(groups.map(padGroup).join(":"));
		return groupPossibilities(possibilities);
	}
	function possibleElisions(elidedGroups, moreLeft, moreRight) {
		const left = moreLeft ? "" : ":";
		const right = moreRight ? "" : ":";
		const possibilities = [];
		if (!moreLeft && !moreRight) possibilities.push("::");
		if (moreLeft && moreRight) possibilities.push("");
		if (moreRight && !moreLeft || !moreRight && moreLeft) possibilities.push(":");
		possibilities.push(`${left}(:0{1,4}){1,${elidedGroups - 1}}`);
		possibilities.push(`(0{1,4}:){1,${elidedGroups - 1}}${right}`);
		possibilities.push(`(0{1,4}:){${elidedGroups - 1}}0{1,4}`);
		for (let groups = 1; groups < elidedGroups - 1; groups++) for (let position = 1; position < elidedGroups - groups; position++) possibilities.push(`(0{1,4}:){${position}}:(0{1,4}:){${elidedGroups - position - groups - 1}}0{1,4}`);
		return groupPossibilities(possibilities);
	}
}));
//#endregion
//#region node_modules/ip-address/dist/ipv6.js
var require_ipv6 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Address6 = void 0;
	var common = __importStar(require_common());
	var constants4 = __importStar(require_constants$1());
	var constants6 = __importStar(require_constants());
	var helpers = __importStar(require_helpers$1());
	var ipv4_1 = require_ipv4();
	var regular_expressions_1 = require_regular_expressions();
	var address_error_1 = require_address_error();
	var common_1 = require_common();
	var isCorrect6 = common.isCorrect(constants6.BITS);
	function assert(condition) {
		if (!condition) throw new Error("Assertion failed.");
	}
	function addCommas(number) {
		const r = /(\d+)(\d{3})/;
		while (r.test(number)) number = number.replace(r, "$1,$2");
		return number;
	}
	function spanLeadingZeroes4(n) {
		n = n.replace(/^(0{1,})([1-9]+)$/, "<span class=\"parse-error\">$1</span>$2");
		n = n.replace(/^(0{1,})(0)$/, "<span class=\"parse-error\">$1</span>$2");
		return n;
	}
	function compact(address, slice) {
		const s1 = [];
		const s2 = [];
		let i;
		for (i = 0; i < address.length; i++) if (i < slice[0]) s1.push(address[i]);
		else if (i > slice[1]) s2.push(address[i]);
		return s1.concat(["compact"]).concat(s2);
	}
	function paddedHex(octet) {
		return parseInt(octet, 16).toString(16).padStart(4, "0");
	}
	function unsignByte(b) {
		return b & 255;
	}
	/**
	* Represents an IPv6 address
	* @param {string} address - An IPv6 address string
	* @param {number} [groups=8] - How many octets to parse
	* @example
	* var address = new Address6('2001::/32');
	*/
	var Address6 = class Address6 {
		constructor(address, optionalGroups) {
			this.addressMinusSuffix = "";
			this.parsedSubnet = "";
			this.subnet = "/128";
			this.subnetMask = 128;
			this.v4 = false;
			this.zone = "";
			/**
			* Returns true if the given address is in the subnet of the current address
			* @returns {boolean}
			*/
			this.isInSubnet = common.isInSubnet;
			/**
			* Returns true if the address is correct, false otherwise
			* @returns {boolean}
			*/
			this.isCorrect = isCorrect6;
			if (optionalGroups === void 0) this.groups = constants6.GROUPS;
			else this.groups = optionalGroups;
			this.address = address;
			const subnet = constants6.RE_SUBNET_STRING.exec(address);
			if (subnet) {
				this.parsedSubnet = subnet[0].replace("/", "");
				this.subnetMask = parseInt(this.parsedSubnet, 10);
				this.subnet = `/${this.subnetMask}`;
				if (Number.isNaN(this.subnetMask) || this.subnetMask < 0 || this.subnetMask > constants6.BITS) throw new address_error_1.AddressError("Invalid subnet mask.");
				address = address.replace(constants6.RE_SUBNET_STRING, "");
			} else if (/\//.test(address)) throw new address_error_1.AddressError("Invalid subnet mask.");
			const zone = constants6.RE_ZONE_STRING.exec(address);
			if (zone) {
				this.zone = zone[0];
				address = address.replace(constants6.RE_ZONE_STRING, "");
			}
			this.addressMinusSuffix = address;
			this.parsedAddress = this.parse(this.addressMinusSuffix);
		}
		/**
		* Returns true if the given string is a valid IPv6 address (with optional
		* CIDR subnet and zone identifier), false otherwise. Host bits in the
		* subnet portion are allowed (e.g. `2001:db8::1/32` is valid); for strict
		* network-address validation compare `correctForm()` to
		* `startAddress().correctForm()`, or use `networkForm()`.
		*/
		static isValid(address) {
			try {
				new Address6(address);
				return true;
			} catch (e) {
				return false;
			}
		}
		/**
		* Convert a BigInt to a v6 address object. The value must be in the
		* range `[0, 2**128 - 1]`; otherwise `AddressError` is thrown.
		* @param {bigint} bigInt - a BigInt to convert
		* @returns {Address6}
		* @example
		* var bigInt = BigInt('1000000000000');
		* var address = Address6.fromBigInt(bigInt);
		* address.correctForm(); // '::e8:d4a5:1000'
		*/
		static fromBigInt(bigInt) {
			if (bigInt < 0n || bigInt > (1n << BigInt(constants6.BITS)) - 1n) throw new address_error_1.AddressError("IPv6 BigInt must be in the range 0 to 2**128 - 1");
			const hex = bigInt.toString(16).padStart(32, "0");
			const groups = [];
			for (let i = 0; i < constants6.GROUPS; i++) groups.push(hex.slice(i * 4, (i + 1) * 4));
			return new Address6(groups.join(":"));
		}
		/**
		* Parse a URL (with optional bracketed host and port) into an address and
		* port. Returns either `{ address, port }` on success or
		* `{ error, address: null, port: null }` if the URL could not be parsed.
		* Ports are returned as numbers (or `null` if absent or out of range).
		* @example
		* var addressAndPort = Address6.fromURL('http://[ffff::]:8080/foo/');
		* addressAndPort.address.correctForm(); // 'ffff::'
		* addressAndPort.port; // 8080
		*/
		static fromURL(url) {
			let host;
			let port = null;
			let result;
			if (url.indexOf("[") !== -1 && url.indexOf("]:") !== -1) {
				result = constants6.RE_URL_WITH_PORT.exec(url);
				if (result === null) return {
					error: "failed to parse address with port",
					address: null,
					port: null
				};
				host = result[1];
				port = result[2];
			} else if (url.indexOf("/") !== -1) {
				url = url.replace(/^[a-z0-9]+:\/\//, "");
				result = constants6.RE_URL.exec(url);
				if (result === null) return {
					error: "failed to parse address from URL",
					address: null,
					port: null
				};
				host = result[1];
			} else host = url;
			if (port) {
				port = parseInt(port, 10);
				if (port < 0 || port > 65536) port = null;
			} else port = null;
			return {
				address: new Address6(host),
				port
			};
		}
		/**
		* Construct an `Address6` from an address and a hex subnet mask given as
		* separate strings (e.g. as returned by Node's `os.networkInterfaces()`).
		* Throws `AddressError` if the mask is non-contiguous (e.g.
		* `ffff::ffff`).
		* @example
		* var address = Address6.fromAddressAndMask('fe80::1', 'ffff:ffff:ffff:ffff::');
		* address.subnetMask; // 64
		*/
		static fromAddressAndMask(address, mask) {
			const bits = common.prefixLengthFromMask(new Address6(mask).bigInt(), constants6.BITS);
			return new Address6(`${address}/${bits}`);
		}
		/**
		* Construct an `Address6` from an address and a Cisco-style wildcard mask
		* given as separate strings (e.g. `::ffff:ffff:ffff:ffff` for a `/64`).
		* The wildcard mask is the bitwise inverse of the subnet mask. Throws
		* `AddressError` if the mask is non-contiguous.
		* @example
		* var address = Address6.fromAddressAndWildcardMask('fe80::1', '::ffff:ffff:ffff:ffff');
		* address.subnetMask; // 64
		*/
		static fromAddressAndWildcardMask(address, wildcardMask) {
			const mask = new Address6(wildcardMask).bigInt() ^ (BigInt(1) << BigInt(constants6.BITS)) - BigInt(1);
			const bits = common.prefixLengthFromMask(mask, constants6.BITS);
			return new Address6(`${address}/${bits}`);
		}
		/**
		* Construct an `Address6` from a wildcard pattern with trailing `*`
		* groups. The number of trailing wildcards determines the prefix
		* length: each `*` represents 16 bits. `::` is expanded to zero groups
		* (not wildcards) before evaluating trailing wildcards.
		*
		* Only trailing whole-group wildcards are supported. Partial-group
		* wildcards (e.g. `2001:db8::0*`) and interior wildcards (e.g.
		* `*::1`) throw `AddressError`.
		* @example
		* Address6.fromWildcard('2001:db8:*:*:*:*:*:*').subnet;  // '/32'
		* Address6.fromWildcard('2001:db8::*').subnet;           // '/112'
		* Address6.fromWildcard('*:*:*:*:*:*:*:*').subnet;       // '/0'
		*/
		static fromWildcard(input) {
			if (input.includes("%") || input.includes("/")) throw new address_error_1.AddressError("Wildcard pattern must not include a zone or CIDR suffix");
			const halves = input.split("::");
			if (halves.length > 2) throw new address_error_1.AddressError("Wildcard pattern cannot contain more than one '::'");
			let groups;
			if (halves.length === 2) {
				const left = halves[0] === "" ? [] : halves[0].split(":");
				const right = halves[1] === "" ? [] : halves[1].split(":");
				const remaining = constants6.GROUPS - left.length - right.length;
				if (remaining < 1) throw new address_error_1.AddressError("Wildcard pattern with '::' has too many groups");
				groups = [
					...left,
					...new Array(remaining).fill("0"),
					...right
				];
			} else groups = input.split(":");
			if (groups.length !== constants6.GROUPS) throw new address_error_1.AddressError("Wildcard pattern must have 8 groups");
			let firstWildcard = -1;
			for (let i = 0; i < groups.length; i++) if (groups[i] === "*") {
				if (firstWildcard === -1) firstWildcard = i;
			} else if (firstWildcard !== -1) throw new address_error_1.AddressError("Wildcard `*` must only appear in trailing groups (e.g. `2001:db8:*:*:*:*:*:*`)");
			const trailing = firstWildcard === -1 ? 0 : groups.length - firstWildcard;
			const replaced = groups.map((g) => g === "*" ? "0" : g);
			const subnetBits = constants6.BITS - trailing * 16;
			return new Address6(`${replaced.join(":")}/${subnetBits}`);
		}
		/**
		* Create an IPv6-mapped address given an IPv4 address
		* @param {string} address - An IPv4 address string
		* @returns {Address6}
		* @example
		* var address = Address6.fromAddress4('192.168.0.1');
		* address.correctForm(); // '::ffff:c0a8:1'
		* address.to4in6(); // '::ffff:192.168.0.1'
		*/
		static fromAddress4(address) {
			const address4 = new ipv4_1.Address4(address);
			const mask6 = constants6.BITS - (constants4.BITS - address4.subnetMask);
			return new Address6(`::ffff:${address4.correctForm()}/${mask6}`);
		}
		/**
		* Return an address from ip6.arpa form
		* @param {string} arpaFormAddress - an 'ip6.arpa' form address
		* @returns {Adress6}
		* @example
		* var address = Address6.fromArpa(e.f.f.f.3.c.2.6.f.f.f.e.6.6.8.e.1.0.6.7.9.4.e.c.0.0.0.0.1.0.0.2.ip6.arpa.)
		* address.correctForm(); // '2001:0:ce49:7601:e866:efff:62c3:fffe'
		*/
		static fromArpa(arpaFormAddress) {
			let address = arpaFormAddress.replace(/(\.ip6\.arpa)?\.$/, "");
			const semicolonAmount = 7;
			if (address.length !== 63) throw new address_error_1.AddressError("Invalid 'ip6.arpa' form.");
			const parts = address.split(".").reverse();
			for (let i = semicolonAmount; i > 0; i--) {
				const insertIndex = i * 4;
				parts.splice(insertIndex, 0, ":");
			}
			address = parts.join("");
			return new Address6(address);
		}
		/**
		* Return the Microsoft UNC transcription of the address
		* @returns {String} the Microsoft UNC transcription of the address
		*/
		microsoftTranscription() {
			return `${this.correctForm().replace(/:/g, "-")}.ipv6-literal.net`;
		}
		/**
		* Return the first n bits of the address, defaulting to the subnet mask
		* @param {number} [mask=subnet] - the number of bits to mask
		* @returns {String} the first n bits of the address as a string
		*/
		mask(mask = this.subnetMask) {
			return this.getBitsBase2(0, mask);
		}
		/**
		* Return the number of possible subnets of a given size in the address
		* @param {number} [subnetSize=128] - the subnet size
		* @returns {String}
		*/
		possibleSubnets(subnetSize = 128) {
			const subnetPowers = constants6.BITS - this.subnetMask - Math.abs(subnetSize - constants6.BITS);
			if (subnetPowers < 0) return "0";
			return addCommas((BigInt("2") ** BigInt(subnetPowers)).toString(10));
		}
		/**
		* Helper function getting start address.
		* @returns {bigint}
		*/
		_startAddress() {
			return BigInt(`0b${this.mask() + "0".repeat(constants6.BITS - this.subnetMask)}`);
		}
		/**
		* The first address in the range given by this address' subnet
		* Often referred to as the Network Address.
		* @returns {Address6}
		*/
		startAddress() {
			return Address6.fromBigInt(this._startAddress());
		}
		/**
		* The first host address in the range given by this address's subnet ie
		* the first address after the Network Address
		* @returns {Address6}
		*/
		startAddressExclusive() {
			const adjust = BigInt("1");
			return Address6.fromBigInt(this._startAddress() + adjust);
		}
		/**
		* Helper function getting end address.
		* @returns {bigint}
		*/
		_endAddress() {
			return BigInt(`0b${this.mask() + "1".repeat(constants6.BITS - this.subnetMask)}`);
		}
		/**
		* The last address in the range given by this address' subnet
		* Often referred to as the Broadcast
		* @returns {Address6}
		*/
		endAddress() {
			return Address6.fromBigInt(this._endAddress());
		}
		/**
		* The last host address in the range given by this address's subnet ie
		* the last address prior to the Broadcast Address
		* @returns {Address6}
		*/
		endAddressExclusive() {
			const adjust = BigInt("1");
			return Address6.fromBigInt(this._endAddress() - adjust);
		}
		/**
		* The hex form of the subnet mask, e.g. `ffff:ffff:ffff:ffff::` for a
		* `/64`. Returns an `Address6`; call `.correctForm()` for the string.
		* @returns {Address6}
		*/
		subnetMaskAddress() {
			return Address6.fromBigInt(BigInt(`0b${"1".repeat(this.subnetMask)}${"0".repeat(constants6.BITS - this.subnetMask)}`));
		}
		/**
		* The Cisco-style wildcard mask, e.g. `::ffff:ffff:ffff:ffff` for a
		* `/64`. This is the bitwise inverse of `subnetMaskAddress()`. Returns
		* an `Address6`; call `.correctForm()` for the string.
		* @returns {Address6}
		*/
		wildcardMask() {
			return Address6.fromBigInt(BigInt(`0b${"0".repeat(this.subnetMask)}${"1".repeat(constants6.BITS - this.subnetMask)}`));
		}
		/**
		* The network address in CIDR string form, e.g. `2001:db8::/32` for
		* `2001:db8::1/32`. For an address with no explicit subnet the prefix
		* is `/128`, e.g. `networkForm()` on `2001:db8::1` returns
		* `2001:db8::1/128`.
		* @returns {string}
		*/
		networkForm() {
			return `${this.startAddress().correctForm()}/${this.subnetMask}`;
		}
		/**
		* Return the scope of the address. The 4-bit scope field
		* ([RFC 4291 §2.7](https://datatracker.ietf.org/doc/html/rfc4291#section-2.7))
		* is only defined for multicast addresses; for unicast addresses the scope
		* is derived from the address type per
		* [RFC 4007 §6](https://datatracker.ietf.org/doc/html/rfc4007#section-6).
		* @returns {String}
		*/
		getScope() {
			const type = this.getType();
			if (type === "Multicast" || type.startsWith("Multicast ")) return constants6.SCOPES[parseInt(this.getBits(12, 16).toString(10), 10)] || "Unknown";
			if (type === "Link-local unicast" || type === "Loopback") return "Link local";
			if (type === "Unspecified") return "Unknown";
			return "Global";
		}
		/**
		* Return the type of the address
		* @returns {String}
		*/
		getType() {
			for (let i = 0; i < TYPE_SUBNETS.length; i++) {
				const entry = TYPE_SUBNETS[i];
				if (this.isInSubnet(entry[0])) return entry[1];
			}
			return "Global unicast";
		}
		/**
		* Return the bits in the given range as a BigInt
		* @returns {bigint}
		*/
		getBits(start, end) {
			return BigInt(`0b${this.getBitsBase2(start, end)}`);
		}
		/**
		* Return the bits in the given range as a base-2 string
		* @returns {String}
		*/
		getBitsBase2(start, end) {
			return this.binaryZeroPad().slice(start, end);
		}
		/**
		* Return the bits in the given range as a base-16 string
		* @returns {String}
		*/
		getBitsBase16(start, end) {
			const length = end - start;
			if (length % 4 !== 0) throw new Error("Length of bits to retrieve must be divisible by four");
			return this.getBits(start, end).toString(16).padStart(length / 4, "0");
		}
		/**
		* Return the bits that are set past the subnet mask length
		* @returns {String}
		*/
		getBitsPastSubnet() {
			return this.getBitsBase2(this.subnetMask, constants6.BITS);
		}
		/**
		* Return the reversed ip6.arpa form of the address
		* @param {Object} options
		* @param {boolean} options.omitSuffix - omit the "ip6.arpa" suffix
		* @returns {String}
		*/
		reverseForm(options) {
			if (!options) options = {};
			const characters = Math.floor(this.subnetMask / 4);
			const reversed = this.canonicalForm().replace(/:/g, "").split("").slice(0, characters).reverse().join(".");
			if (characters > 0) {
				if (options.omitSuffix) return reversed;
				return `${reversed}.ip6.arpa.`;
			}
			if (options.omitSuffix) return "";
			return "ip6.arpa.";
		}
		/**
		* Returns the address in correct form, per
		* [RFC 5952](https://datatracker.ietf.org/doc/html/rfc5952): leading zeros
		* stripped, the longest run of zero groups collapsed to `::`, and hex digits
		* lowercased (e.g. `2001:db8::1`). This is the recommended form for display.
		*/
		correctForm() {
			let i;
			let groups = [];
			let zeroCounter = 0;
			const zeroes = [];
			for (i = 0; i < this.parsedAddress.length; i++) {
				const value = parseInt(this.parsedAddress[i], 16);
				if (value === 0) zeroCounter++;
				if (value !== 0 && zeroCounter > 0) {
					if (zeroCounter > 1) zeroes.push([i - zeroCounter, i - 1]);
					zeroCounter = 0;
				}
			}
			if (zeroCounter > 1) zeroes.push([this.parsedAddress.length - zeroCounter, this.parsedAddress.length - 1]);
			const zeroLengths = zeroes.map((n) => n[1] - n[0] + 1);
			if (zeroes.length > 0) {
				const index = zeroLengths.indexOf(Math.max(...zeroLengths));
				groups = compact(this.parsedAddress, zeroes[index]);
			} else groups = this.parsedAddress;
			for (i = 0; i < groups.length; i++) if (groups[i] !== "compact") groups[i] = parseInt(groups[i], 16).toString(16);
			let correct = groups.join(":");
			correct = correct.replace(/^compact$/, "::");
			correct = correct.replace(/(^compact)|(compact$)/, ":");
			correct = correct.replace(/compact/, "");
			return correct;
		}
		/**
		* Return a zero-padded base-2 string representation of the address
		* @returns {String}
		* @example
		* var address = new Address6('2001:4860:4001:803::1011');
		* address.binaryZeroPad();
		* // '0010000000000001010010000110000001000000000000010000100000000011
		* //  0000000000000000000000000000000000000000000000000001000000010001'
		*/
		binaryZeroPad() {
			if (this._binaryZeroPad === void 0) this._binaryZeroPad = this.bigInt().toString(2).padStart(constants6.BITS, "0");
			return this._binaryZeroPad;
		}
		/**
		* Parses a v4-in-v6 string (e.g. `::ffff:192.168.0.1`) by extracting the
		* trailing IPv4 address into `this.address4` / `this.parsedAddress4` and
		* returning the address with the v4 portion converted to two v6 groups.
		* Used internally by `parse()`.
		*/
		parse4in6(address) {
			if (address.indexOf(".") === -1) return address;
			const groups = address.split(":");
			const address4 = groups.slice(-1)[0].match(constants4.RE_ADDRESS);
			if (address4) {
				this.parsedAddress4 = address4[0];
				this.address4 = new ipv4_1.Address4(this.parsedAddress4);
				for (let i = 0; i < this.address4.groups; i++) if (/^0[0-9]+/.test(this.address4.parsedAddress[i])) {
					const highlighted = this.address4.parsedAddress.map(spanLeadingZeroes4).join(".");
					const prefix = groups.slice(0, -1).map(helpers.escapeHtml).join(":");
					const separator = groups.length > 1 ? ":" : "";
					throw new address_error_1.AddressError("IPv4 addresses can't have leading zeroes.", `${prefix}${separator}${highlighted}`);
				}
				this.v4 = true;
				groups[groups.length - 1] = this.address4.toGroup6();
				address = groups.join(":");
			}
			return address;
		}
		/**
		* Parses an IPv6 address string into its 8 hexadecimal groups (expanding
		* any `::` elision and any trailing v4-in-v6 portion) and stores the result
		* on `this.parsedAddress`. Called automatically by the constructor; you
		* typically don't need to call it directly. Throws `AddressError` if the
		* input is malformed.
		*/
		parse(address) {
			address = this.parse4in6(address);
			const badCharacters = address.match(constants6.RE_BAD_CHARACTERS);
			if (badCharacters) throw new address_error_1.AddressError(`Bad character${badCharacters.length > 1 ? "s" : ""} detected in address: ${badCharacters.join("")}`, address.replace(constants6.RE_BAD_CHARACTERS, "<span class=\"parse-error\">$1</span>"));
			const badAddress = address.match(constants6.RE_BAD_ADDRESS);
			if (badAddress) throw new address_error_1.AddressError(`Address failed regex: ${badAddress.join("")}`, address.replace(constants6.RE_BAD_ADDRESS, "<span class=\"parse-error\">$1</span>"));
			let groups = [];
			const halves = address.split("::");
			if (halves.length === 2) {
				let first = halves[0].split(":");
				let last = halves[1].split(":");
				if (first.length === 1 && first[0] === "") first = [];
				if (last.length === 1 && last[0] === "") last = [];
				const remaining = this.groups - (first.length + last.length);
				if (!remaining) throw new address_error_1.AddressError("Error parsing groups");
				this.elidedGroups = remaining;
				this.elisionBegin = first.length;
				this.elisionEnd = first.length + this.elidedGroups;
				groups = groups.concat(first);
				for (let i = 0; i < remaining; i++) groups.push("0");
				groups = groups.concat(last);
			} else if (halves.length === 1) {
				groups = address.split(":");
				this.elidedGroups = 0;
			} else throw new address_error_1.AddressError("Too many :: groups found");
			groups = groups.map((group) => parseInt(group, 16).toString(16));
			if (groups.length !== this.groups) throw new address_error_1.AddressError("Incorrect number of groups found");
			return groups;
		}
		/**
		* Returns the canonical (fully expanded) form of the address: all 8 groups,
		* each padded to 4 hex digits, with no `::` collapsing
		* (e.g. `2001:0db8:0000:0000:0000:0000:0000:0001`). Useful for sorting and
		* byte-exact comparison.
		*/
		canonicalForm() {
			return this.parsedAddress.map(paddedHex).join(":");
		}
		/**
		* Return the decimal form of the address
		* @returns {String}
		*/
		decimal() {
			return this.parsedAddress.map((n) => parseInt(n, 16).toString(10).padStart(5, "0")).join(":");
		}
		/**
		* Return the address as a BigInt
		* @returns {bigint}
		*/
		bigInt() {
			return BigInt(`0x${this.parsedAddress.map(paddedHex).join("")}`);
		}
		/**
		* Return the last two groups of this address as an IPv4 address string
		* @returns {Address4}
		* @example
		* var address = new Address6('2001:4860:4001::1825:bf11');
		* address.to4().correctForm(); // '24.37.191.17'
		*/
		to4() {
			const binary = this.binaryZeroPad().split("");
			return ipv4_1.Address4.fromHex(BigInt(`0b${binary.slice(96, 128).join("")}`).toString(16).padStart(8, "0"));
		}
		/**
		* Return the v4-in-v6 form of the address
		* @returns {String}
		*/
		to4in6() {
			const address4 = this.to4();
			const correct = new Address6(this.parsedAddress.slice(0, 6).join(":"), 6).correctForm();
			let infix = "";
			if (!/:$/.test(correct)) infix = ":";
			return correct + infix + address4.address;
		}
		/**
		* Decodes the Teredo tunneling fields embedded in this address. Returns the
		* Teredo prefix, server IPv4, client IPv4, raw flag bits, cone-NAT flag,
		* UDP port, and Microsoft-format flag breakdown (reserved, universal/local,
		* group/individual, nonce). Only meaningful for addresses in `2001::/32`.
		*/
		inspectTeredo() {
			const prefix = this.getBitsBase16(0, 32);
			const udpPort = (this.getBits(80, 96) ^ BigInt("0xffff")).toString();
			const server4 = ipv4_1.Address4.fromHex(this.getBitsBase16(32, 64));
			const bitsForClient4 = this.getBits(96, 128);
			const client4 = ipv4_1.Address4.fromHex((bitsForClient4 ^ BigInt("0xffffffff")).toString(16).padStart(8, "0"));
			const flagsBase2 = this.getBitsBase2(64, 80);
			const coneNat = (0, common_1.testBit)(flagsBase2, 15);
			const reserved = (0, common_1.testBit)(flagsBase2, 14);
			const groupIndividual = (0, common_1.testBit)(flagsBase2, 8);
			const universalLocal = (0, common_1.testBit)(flagsBase2, 9);
			const nonce = BigInt(`0b${flagsBase2.slice(2, 6) + flagsBase2.slice(8, 16)}`).toString(10);
			return {
				prefix: `${prefix.slice(0, 4)}:${prefix.slice(4, 8)}`,
				server4: server4.address,
				client4: client4.address,
				flags: flagsBase2,
				coneNat,
				microsoft: {
					reserved,
					universalLocal,
					groupIndividual,
					nonce
				},
				udpPort
			};
		}
		/**
		* Decodes the 6to4 tunneling fields embedded in this address. Returns the
		* 6to4 prefix and the embedded IPv4 gateway address. Only meaningful for
		* addresses in `2002::/16`.
		*/
		inspect6to4() {
			const prefix = this.getBitsBase16(0, 16);
			const gateway = ipv4_1.Address4.fromHex(this.getBitsBase16(16, 48));
			return {
				prefix: prefix.slice(0, 4),
				gateway: gateway.address
			};
		}
		/**
		* Return a v6 6to4 address from a v6 v4inv6 address
		* @returns {Address6}
		*/
		to6to4() {
			if (!this.is4()) return null;
			const addr6to4 = [
				"2002",
				this.getBitsBase16(96, 112),
				this.getBitsBase16(112, 128),
				"",
				"/16"
			].join(":");
			return new Address6(addr6to4);
		}
		/**
		* Embed an IPv4 address into a NAT64 IPv6 address using the encoding
		* defined by [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052).
		* The default prefix is the well-known prefix `64:ff9b::/96`. The prefix
		* length must be one of 32, 40, 48, 56, 64, or 96; for prefixes shorter
		* than /64 the IPv4 octets are split around the reserved bits 64–71.
		* @example
		* Address6.fromAddress4Nat64('192.0.2.33').correctForm(); // '64:ff9b::c000:221'
		* Address6.fromAddress4Nat64('192.0.2.33', '2001:db8::/32').correctForm(); // '2001:db8:c000:221::'
		*/
		static fromAddress4Nat64(address, prefix = "64:ff9b::/96") {
			const v4 = new ipv4_1.Address4(address);
			const prefix6 = new Address6(prefix);
			const pl = prefix6.subnetMask;
			if (pl !== 32 && pl !== 40 && pl !== 48 && pl !== 56 && pl !== 64 && pl !== 96) throw new address_error_1.AddressError("NAT64 prefix length must be 32, 40, 48, 56, 64, or 96");
			const prefixBits = prefix6.binaryZeroPad();
			const v4Bits = v4.binaryZeroPad();
			let bits;
			if (pl === 96) bits = prefixBits.slice(0, 96) + v4Bits;
			else {
				const beforeU = 64 - pl;
				bits = prefixBits.slice(0, pl) + v4Bits.slice(0, beforeU) + "00000000" + v4Bits.slice(beforeU) + "0".repeat(56 - (32 - beforeU));
			}
			const hex = BigInt(`0b${bits}`).toString(16).padStart(32, "0");
			const groups = [];
			for (let i = 0; i < 8; i++) groups.push(hex.slice(i * 4, (i + 1) * 4));
			return new Address6(groups.join(":"));
		}
		/**
		* Extract the embedded IPv4 address from a NAT64 IPv6 address using the
		* encoding defined by [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052).
		* The default prefix is the well-known prefix `64:ff9b::/96`. Returns
		* `null` if this address is not contained within the given prefix.
		* @example
		* new Address6('64:ff9b::c000:221').toAddress4Nat64()!.correctForm(); // '192.0.2.33'
		*/
		toAddress4Nat64(prefix = "64:ff9b::/96") {
			const prefix6 = new Address6(prefix);
			const pl = prefix6.subnetMask;
			if (pl !== 32 && pl !== 40 && pl !== 48 && pl !== 56 && pl !== 64 && pl !== 96) throw new address_error_1.AddressError("NAT64 prefix length must be 32, 40, 48, 56, 64, or 96");
			if (!this.isInSubnet(prefix6)) return null;
			const bits = this.binaryZeroPad();
			let v4Bits;
			if (pl === 96) v4Bits = bits.slice(96, 128);
			else {
				const beforeU = 64 - pl;
				v4Bits = bits.slice(pl, pl + beforeU) + bits.slice(72, 72 + (32 - beforeU));
			}
			const octets = [];
			for (let i = 0; i < 4; i++) octets.push(parseInt(v4Bits.slice(i * 8, (i + 1) * 8), 2).toString());
			return new ipv4_1.Address4(octets.join("."));
		}
		/**
		* Return a byte array.
		*
		* To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toByteArray())`.
		* @returns {Array}
		*/
		toByteArray() {
			const valueWithoutPadding = this.bigInt().toString(16);
			const value = `${"0".repeat(valueWithoutPadding.length % 2)}${valueWithoutPadding}`;
			const bytes = [];
			for (let i = 0, length = value.length; i < length; i += 2) bytes.push(parseInt(value.substring(i, i + 2), 16));
			return bytes;
		}
		/**
		* Return an unsigned byte array.
		*
		* To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toUnsignedByteArray())`.
		* @returns {Array}
		*/
		toUnsignedByteArray() {
			return this.toByteArray().map(unsignByte);
		}
		/**
		* Convert a byte array to an Address6 object.
		*
		* To convert from a Node.js `Buffer`, spread it: `Address6.fromByteArray([...buf])`.
		* @returns {Address6}
		*/
		static fromByteArray(bytes) {
			return this.fromUnsignedByteArray(bytes.map(unsignByte));
		}
		/**
		* Convert an unsigned byte array to an Address6 object.
		*
		* To convert from a Node.js `Buffer`, spread it: `Address6.fromUnsignedByteArray([...buf])`.
		* @returns {Address6}
		*/
		static fromUnsignedByteArray(bytes) {
			const BYTE_MAX = BigInt("256");
			let result = BigInt("0");
			let multiplier = BigInt("1");
			for (let i = bytes.length - 1; i >= 0; i--) {
				result += multiplier * BigInt(bytes[i].toString(10));
				multiplier *= BYTE_MAX;
			}
			return Address6.fromBigInt(result);
		}
		/**
		* Returns true if the address is in the canonical form, false otherwise
		* @returns {boolean}
		*/
		isCanonical() {
			return this.addressMinusSuffix === this.canonicalForm();
		}
		/**
		* Returns true if the address is a link local address, false otherwise
		* @returns {boolean}
		*/
		isLinkLocal() {
			if (this.getBitsBase2(0, 64) === "1111111010000000000000000000000000000000000000000000000000000000") return true;
			return false;
		}
		/**
		* Returns true if the address is a multicast address, false otherwise
		* @returns {boolean}
		*/
		isMulticast() {
			const type = this.getType();
			return type === "Multicast" || type.startsWith("Multicast ");
		}
		/**
		* Returns true if the address was written in v4-in-v6 dotted-quad notation
		* (e.g. `::ffff:127.0.0.1`), false otherwise. This is a notation-level flag
		* and does not reflect whether the address bits lie in the IPv4-mapped
		* (`::ffff:0:0/96`) subnet — for that, see {@link isMapped4}.
		* @returns {boolean}
		*/
		is4() {
			return this.v4;
		}
		/**
		* Returns true if the address is an IPv4-mapped IPv6 address in
		* `::ffff:0:0/96` ([RFC 4291 §2.5.5.2](https://datatracker.ietf.org/doc/html/rfc4291#section-2.5.5.2)),
		* false otherwise. Unlike {@link is4}, this checks the underlying address
		* bits rather than the textual notation, so `::ffff:127.0.0.1` and
		* `::ffff:7f00:1` both return true.
		* @returns {boolean}
		*/
		isMapped4() {
			return this.isInSubnet(IPV4_MAPPED_SUBNET);
		}
		/**
		* Returns true if the address is a Teredo address, false otherwise
		* @returns {boolean}
		*/
		isTeredo() {
			return this.isInSubnet(TEREDO_SUBNET);
		}
		/**
		* Returns true if the address is a 6to4 address, false otherwise
		* @returns {boolean}
		*/
		is6to4() {
			return this.isInSubnet(SIX_TO_FOUR_SUBNET);
		}
		/**
		* Returns true if the address is a loopback address, false otherwise
		* @returns {boolean}
		*/
		isLoopback() {
			return this.getType() === "Loopback";
		}
		/**
		* Returns true if the address is a Unique Local Address in `fc00::/7` ([RFC 4193](https://datatracker.ietf.org/doc/html/rfc4193)). ULAs are the IPv6 equivalent of IPv4 [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) private addresses.
		* @returns {boolean}
		*/
		isULA() {
			return this.isInSubnet(ULA_SUBNET);
		}
		/**
		* Returns true if the address is the unspecified address `::`.
		* @returns {boolean}
		*/
		isUnspecified() {
			return this.getType() === "Unspecified";
		}
		/**
		* Returns true if the address is in the documentation prefix `2001:db8::/32` ([RFC 3849](https://datatracker.ietf.org/doc/html/rfc3849)).
		* @returns {boolean}
		*/
		isDocumentation() {
			return this.isInSubnet(DOCUMENTATION_SUBNET);
		}
		/**
		* Returns the address as an HTTP URL with the host bracketed, e.g.
		* `http://[2001:db8::1]/`. If `optionalPort` is provided it is appended,
		* e.g. `http://[2001:db8::1]:8080/`.
		*/
		href(optionalPort) {
			if (optionalPort === void 0) optionalPort = "";
			else optionalPort = `:${optionalPort}`;
			return `http://[${this.correctForm()}]${optionalPort}/`;
		}
		/**
		* Returns an HTML `<a>` element whose `href` encodes the address in a URL
		* hash fragment (default prefix `/#address=`). Useful for linking between
		* pages of an address-inspector UI.
		* @param options.className - CSS class for the rendered `<a>` element
		* @param options.prefix - hash prefix prepended to the address (default `/#address=`)
		* @param options.v4 - when true, render the address in v4-in-v6 form
		*/
		link(options) {
			if (!options) options = {};
			if (options.className === void 0) options.className = "";
			if (options.prefix === void 0) options.prefix = "/#address=";
			if (options.v4 === void 0) options.v4 = false;
			let formFunction = this.correctForm;
			if (options.v4) formFunction = this.to4in6;
			const form = formFunction.call(this);
			const safeHref = helpers.escapeHtml(`${options.prefix}${form}`);
			const safeForm = helpers.escapeHtml(form);
			if (options.className) return `<a href="${safeHref}" class="${helpers.escapeHtml(options.className)}">${safeForm}</a>`;
			return `<a href="${safeHref}">${safeForm}</a>`;
		}
		/**
		* Groups an address
		* @returns {String}
		*/
		group() {
			if (this.elidedGroups === 0) return helpers.simpleGroup(this.addressMinusSuffix).join(":");
			assert(typeof this.elidedGroups === "number");
			assert(typeof this.elisionBegin === "number");
			const output = [];
			const [left, right] = this.addressMinusSuffix.split("::");
			if (left.length) output.push(...helpers.simpleGroup(left));
			else output.push("");
			const classes = ["hover-group"];
			for (let i = this.elisionBegin; i < this.elisionBegin + this.elidedGroups; i++) classes.push(`group-${i}`);
			output.push(`<span class="${classes.join(" ")}"></span>`);
			if (right.length) output.push(...helpers.simpleGroup(right, this.elisionEnd));
			else output.push("");
			if (this.is4()) {
				assert(this.address4 instanceof ipv4_1.Address4);
				output.pop();
				output.push(this.address4.groupForV6());
			}
			return output.join(":");
		}
		/**
		* Generate a regular expression string that can be used to find or validate
		* all variations of this address
		* @param {boolean} substringSearch
		* @returns {string}
		*/
		regularExpressionString(substringSearch = false) {
			let output = [];
			const address6 = new Address6(this.correctForm());
			if (address6.elidedGroups === 0) output.push((0, regular_expressions_1.simpleRegularExpression)(address6.parsedAddress));
			else if (address6.elidedGroups === constants6.GROUPS) output.push((0, regular_expressions_1.possibleElisions)(constants6.GROUPS));
			else {
				const halves = address6.address.split("::");
				if (halves[0].length) output.push((0, regular_expressions_1.simpleRegularExpression)(halves[0].split(":")));
				assert(typeof address6.elidedGroups === "number");
				output.push((0, regular_expressions_1.possibleElisions)(address6.elidedGroups, halves[0].length !== 0, halves[1].length !== 0));
				if (halves[1].length) output.push((0, regular_expressions_1.simpleRegularExpression)(halves[1].split(":")));
				output = [output.join(":")];
			}
			if (!substringSearch) output = [
				"(?=^|",
				regular_expressions_1.ADDRESS_BOUNDARY,
				"|[^\\w\\:])(",
				...output,
				")(?=[^\\w\\:]|",
				regular_expressions_1.ADDRESS_BOUNDARY,
				"|$)"
			];
			return output.join("");
		}
		/**
		* Generate a regular expression that can be used to find or validate all
		* variations of this address.
		* @param {boolean} substringSearch
		* @returns {RegExp}
		*/
		regularExpression(substringSearch = false) {
			return new RegExp(this.regularExpressionString(substringSearch), "i");
		}
	};
	exports.Address6 = Address6;
	var TYPE_SUBNETS = Object.keys(constants6.TYPES).map((subnet) => [new Address6(subnet), constants6.TYPES[subnet]]);
	var TEREDO_SUBNET = new Address6("2001::/32");
	var SIX_TO_FOUR_SUBNET = new Address6("2002::/16");
	var ULA_SUBNET = new Address6("fc00::/7");
	var DOCUMENTATION_SUBNET = new Address6("2001:db8::/32");
	var IPV4_MAPPED_SUBNET = new Address6("::ffff:0:0/96");
}));
//#endregion
//#region node_modules/ip-address/dist/ip-address.js
var require_ip_address = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.v6 = exports.AddressError = exports.Address6 = exports.Address4 = void 0;
	var ipv4_1 = require_ipv4();
	Object.defineProperty(exports, "Address4", {
		enumerable: true,
		get: function() {
			return ipv4_1.Address4;
		}
	});
	var ipv6_1 = require_ipv6();
	Object.defineProperty(exports, "Address6", {
		enumerable: true,
		get: function() {
			return ipv6_1.Address6;
		}
	});
	var address_error_1 = require_address_error();
	Object.defineProperty(exports, "AddressError", {
		enumerable: true,
		get: function() {
			return address_error_1.AddressError;
		}
	});
	exports.v6 = { helpers: __importStar(require_helpers$1()) };
}));
//#endregion
//#region node_modules/socks/build/common/helpers.js
var require_helpers = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ipToBuffer = exports.int32ToIpv4 = exports.ipv4ToInt32 = exports.validateSocksClientChainOptions = exports.validateSocksClientOptions = void 0;
	var util_1 = require_util();
	var constants_1 = require_constants$2();
	var stream = __require("stream");
	var ip_address_1 = require_ip_address();
	var net$3 = __require("net");
	/**
	* Validates the provided SocksClientOptions
	* @param options { SocksClientOptions }
	* @param acceptedCommands { string[] } A list of accepted SocksProxy commands.
	*/
	function validateSocksClientOptions(options, acceptedCommands = [
		"connect",
		"bind",
		"associate"
	]) {
		if (!constants_1.SocksCommand[options.command]) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommand, options);
		if (acceptedCommands.indexOf(options.command) === -1) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommandForOperation, options);
		if (!isValidSocksRemoteHost(options.destination)) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsDestination, options);
		if (!isValidSocksProxy(options.proxy)) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxy, options);
		validateCustomProxyAuth(options.proxy, options);
		if (options.timeout && !isValidTimeoutValue(options.timeout)) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsTimeout, options);
		if (options.existing_socket && !(options.existing_socket instanceof stream.Duplex)) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsExistingSocket, options);
	}
	exports.validateSocksClientOptions = validateSocksClientOptions;
	/**
	* Validates the SocksClientChainOptions
	* @param options { SocksClientChainOptions }
	*/
	function validateSocksClientChainOptions(options) {
		if (options.command !== "connect") throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommandChain, options);
		if (!isValidSocksRemoteHost(options.destination)) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsDestination, options);
		if (!(options.proxies && Array.isArray(options.proxies) && options.proxies.length >= 2)) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxiesLength, options);
		options.proxies.forEach((proxy) => {
			if (!isValidSocksProxy(proxy)) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxy, options);
			validateCustomProxyAuth(proxy, options);
		});
		if (options.timeout && !isValidTimeoutValue(options.timeout)) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsTimeout, options);
	}
	exports.validateSocksClientChainOptions = validateSocksClientChainOptions;
	function validateCustomProxyAuth(proxy, options) {
		if (proxy.custom_auth_method !== void 0) {
			if (proxy.custom_auth_method < constants_1.SOCKS5_CUSTOM_AUTH_START || proxy.custom_auth_method > constants_1.SOCKS5_CUSTOM_AUTH_END) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthRange, options);
			if (proxy.custom_auth_request_handler === void 0 || typeof proxy.custom_auth_request_handler !== "function") throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
			if (proxy.custom_auth_response_size === void 0) throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
			if (proxy.custom_auth_response_handler === void 0 || typeof proxy.custom_auth_response_handler !== "function") throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
		}
	}
	/**
	* Validates a SocksRemoteHost
	* @param remoteHost { SocksRemoteHost }
	*/
	function isValidSocksRemoteHost(remoteHost) {
		return remoteHost && typeof remoteHost.host === "string" && Buffer.byteLength(remoteHost.host) < 256 && typeof remoteHost.port === "number" && remoteHost.port >= 0 && remoteHost.port <= 65535;
	}
	/**
	* Validates a SocksProxy
	* @param proxy { SocksProxy }
	*/
	function isValidSocksProxy(proxy) {
		return proxy && (typeof proxy.host === "string" || typeof proxy.ipaddress === "string") && typeof proxy.port === "number" && proxy.port >= 0 && proxy.port <= 65535 && (proxy.type === 4 || proxy.type === 5);
	}
	/**
	* Validates a timeout value.
	* @param value { Number }
	*/
	function isValidTimeoutValue(value) {
		return typeof value === "number" && value > 0;
	}
	function ipv4ToInt32(ip) {
		return new ip_address_1.Address4(ip).toArray().reduce((acc, part) => (acc << 8) + part, 0) >>> 0;
	}
	exports.ipv4ToInt32 = ipv4ToInt32;
	function int32ToIpv4(int32) {
		return [
			int32 >>> 24 & 255,
			int32 >>> 16 & 255,
			int32 >>> 8 & 255,
			int32 & 255
		].join(".");
	}
	exports.int32ToIpv4 = int32ToIpv4;
	function ipToBuffer(ip) {
		if (net$3.isIPv4(ip)) {
			const address = new ip_address_1.Address4(ip);
			return Buffer.from(address.toArray());
		} else if (net$3.isIPv6(ip)) {
			const address = new ip_address_1.Address6(ip);
			return Buffer.from(address.canonicalForm().split(":").map((segment) => segment.padStart(4, "0")).join(""), "hex");
		} else throw new Error("Invalid IP address format");
	}
	exports.ipToBuffer = ipToBuffer;
}));
//#endregion
//#region node_modules/socks/build/common/receivebuffer.js
var require_receivebuffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ReceiveBuffer = void 0;
	var ReceiveBuffer = class {
		constructor(size = 4096) {
			this.buffer = Buffer.allocUnsafe(size);
			this.offset = 0;
			this.originalSize = size;
		}
		get length() {
			return this.offset;
		}
		append(data) {
			if (!Buffer.isBuffer(data)) throw new Error("Attempted to append a non-buffer instance to ReceiveBuffer.");
			if (this.offset + data.length >= this.buffer.length) {
				const tmp = this.buffer;
				this.buffer = Buffer.allocUnsafe(Math.max(this.buffer.length + this.originalSize, this.buffer.length + data.length));
				tmp.copy(this.buffer);
			}
			data.copy(this.buffer, this.offset);
			return this.offset += data.length;
		}
		peek(length) {
			if (length > this.offset) throw new Error("Attempted to read beyond the bounds of the managed internal data.");
			return this.buffer.slice(0, length);
		}
		get(length) {
			if (length > this.offset) throw new Error("Attempted to read beyond the bounds of the managed internal data.");
			const value = Buffer.allocUnsafe(length);
			this.buffer.slice(0, length).copy(value);
			this.buffer.copyWithin(0, length, length + this.offset - length);
			this.offset -= length;
			return value;
		}
	};
	exports.ReceiveBuffer = ReceiveBuffer;
}));
//#endregion
//#region node_modules/socks/build/client/socksclient.js
var require_socksclient = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P ? value : new P(function(resolve) {
				resolve(value);
			});
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SocksClientError = exports.SocksClient = void 0;
	var events_1 = __require("events");
	var net$2 = __require("net");
	var smart_buffer_1 = require_smartbuffer();
	var constants_1 = require_constants$2();
	var helpers_1 = require_helpers();
	var receivebuffer_1 = require_receivebuffer();
	var util_1 = require_util();
	Object.defineProperty(exports, "SocksClientError", {
		enumerable: true,
		get: function() {
			return util_1.SocksClientError;
		}
	});
	var ip_address_1 = require_ip_address();
	exports.SocksClient = class SocksClient extends events_1.EventEmitter {
		constructor(options) {
			super();
			this.options = Object.assign({}, options);
			(0, helpers_1.validateSocksClientOptions)(options);
			this.setState(constants_1.SocksClientState.Created);
		}
		/**
		* Creates a new SOCKS connection.
		*
		* Note: Supports callbacks and promises. Only supports the connect command.
		* @param options { SocksClientOptions } Options.
		* @param callback { Function } An optional callback function.
		* @returns { Promise }
		*/
		static createConnection(options, callback) {
			return new Promise((resolve, reject) => {
				try {
					(0, helpers_1.validateSocksClientOptions)(options, ["connect"]);
				} catch (err) {
					if (typeof callback === "function") {
						callback(err);
						return resolve(err);
					} else return reject(err);
				}
				const client = new SocksClient(options);
				client.connect(options.existing_socket);
				client.once("established", (info) => {
					client.removeAllListeners();
					if (typeof callback === "function") {
						callback(null, info);
						resolve(info);
					} else resolve(info);
				});
				client.once("error", (err) => {
					client.removeAllListeners();
					if (typeof callback === "function") {
						callback(err);
						resolve(err);
					} else reject(err);
				});
			});
		}
		/**
		* Creates a new SOCKS connection chain to a destination host through 2 or more SOCKS proxies.
		*
		* Note: Supports callbacks and promises. Only supports the connect method.
		* Note: Implemented via createConnection() factory function.
		* @param options { SocksClientChainOptions } Options
		* @param callback { Function } An optional callback function.
		* @returns { Promise }
		*/
		static createConnectionChain(options, callback) {
			return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
				try {
					(0, helpers_1.validateSocksClientChainOptions)(options);
				} catch (err) {
					if (typeof callback === "function") {
						callback(err);
						return resolve(err);
					} else return reject(err);
				}
				if (options.randomizeChain) (0, util_1.shuffleArray)(options.proxies);
				try {
					let sock;
					for (let i = 0; i < options.proxies.length; i++) {
						const nextProxy = options.proxies[i];
						const nextDestination = i === options.proxies.length - 1 ? options.destination : {
							host: options.proxies[i + 1].host || options.proxies[i + 1].ipaddress,
							port: options.proxies[i + 1].port
						};
						const result = yield SocksClient.createConnection({
							command: "connect",
							proxy: nextProxy,
							destination: nextDestination,
							existing_socket: sock
						});
						sock = sock || result.socket;
					}
					if (typeof callback === "function") {
						callback(null, { socket: sock });
						resolve({ socket: sock });
					} else resolve({ socket: sock });
				} catch (err) {
					if (typeof callback === "function") {
						callback(err);
						resolve(err);
					} else reject(err);
				}
			}));
		}
		/**
		* Creates a SOCKS UDP Frame.
		* @param options
		*/
		static createUDPFrame(options) {
			const buff = new smart_buffer_1.SmartBuffer();
			buff.writeUInt16BE(0);
			buff.writeUInt8(options.frameNumber || 0);
			if (net$2.isIPv4(options.remoteHost.host)) {
				buff.writeUInt8(constants_1.Socks5HostType.IPv4);
				buff.writeUInt32BE((0, helpers_1.ipv4ToInt32)(options.remoteHost.host));
			} else if (net$2.isIPv6(options.remoteHost.host)) {
				buff.writeUInt8(constants_1.Socks5HostType.IPv6);
				buff.writeBuffer((0, helpers_1.ipToBuffer)(options.remoteHost.host));
			} else {
				buff.writeUInt8(constants_1.Socks5HostType.Hostname);
				buff.writeUInt8(Buffer.byteLength(options.remoteHost.host));
				buff.writeString(options.remoteHost.host);
			}
			buff.writeUInt16BE(options.remoteHost.port);
			buff.writeBuffer(options.data);
			return buff.toBuffer();
		}
		/**
		* Parses a SOCKS UDP frame.
		* @param data
		*/
		static parseUDPFrame(data) {
			const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
			buff.readOffset = 2;
			const frameNumber = buff.readUInt8();
			const hostType = buff.readUInt8();
			let remoteHost;
			if (hostType === constants_1.Socks5HostType.IPv4) remoteHost = (0, helpers_1.int32ToIpv4)(buff.readUInt32BE());
			else if (hostType === constants_1.Socks5HostType.IPv6) remoteHost = ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm();
			else remoteHost = buff.readString(buff.readUInt8());
			const remotePort = buff.readUInt16BE();
			return {
				frameNumber,
				remoteHost: {
					host: remoteHost,
					port: remotePort
				},
				data: buff.readBuffer()
			};
		}
		/**
		* Internal state setter. If the SocksClient is in an error state, it cannot be changed to a non error state.
		*/
		setState(newState) {
			if (this.state !== constants_1.SocksClientState.Error) this.state = newState;
		}
		/**
		* Starts the connection establishment to the proxy and destination.
		* @param existingSocket Connected socket to use instead of creating a new one (internal use).
		*/
		connect(existingSocket) {
			this.onDataReceived = (data) => this.onDataReceivedHandler(data);
			this.onClose = () => this.onCloseHandler();
			this.onError = (err) => this.onErrorHandler(err);
			this.onConnect = () => this.onConnectHandler();
			const timer = setTimeout(() => this.onEstablishedTimeout(), this.options.timeout || constants_1.DEFAULT_TIMEOUT);
			if (timer.unref && typeof timer.unref === "function") timer.unref();
			if (existingSocket) this.socket = existingSocket;
			else this.socket = new net$2.Socket();
			this.socket.once("close", this.onClose);
			this.socket.once("error", this.onError);
			this.socket.once("connect", this.onConnect);
			this.socket.on("data", this.onDataReceived);
			this.setState(constants_1.SocksClientState.Connecting);
			this.receiveBuffer = new receivebuffer_1.ReceiveBuffer();
			if (existingSocket) this.socket.emit("connect");
			else {
				this.socket.connect(this.getSocketOptions());
				if (this.options.set_tcp_nodelay !== void 0 && this.options.set_tcp_nodelay !== null) this.socket.setNoDelay(!!this.options.set_tcp_nodelay);
			}
			this.prependOnceListener("established", (info) => {
				setImmediate(() => {
					if (this.receiveBuffer.length > 0) {
						const excessData = this.receiveBuffer.get(this.receiveBuffer.length);
						info.socket.emit("data", excessData);
					}
					info.socket.resume();
				});
			});
		}
		getSocketOptions() {
			return Object.assign(Object.assign({}, this.options.socket_options), {
				host: this.options.proxy.host || this.options.proxy.ipaddress,
				port: this.options.proxy.port
			});
		}
		/**
		* Handles internal Socks timeout callback.
		* Note: If the Socks client is not BoundWaitingForConnection or Established, the connection will be closed.
		*/
		onEstablishedTimeout() {
			if (this.state !== constants_1.SocksClientState.Established && this.state !== constants_1.SocksClientState.BoundWaitingForConnection) this.closeSocket(constants_1.ERRORS.ProxyConnectionTimedOut);
		}
		/**
		* Handles Socket connect event.
		*/
		onConnectHandler() {
			this.setState(constants_1.SocksClientState.Connected);
			if (this.options.proxy.type === 4) this.sendSocks4InitialHandshake();
			else this.sendSocks5InitialHandshake();
			this.setState(constants_1.SocksClientState.SentInitialHandshake);
		}
		/**
		* Handles Socket data event.
		* @param data
		*/
		onDataReceivedHandler(data) {
			this.receiveBuffer.append(data);
			this.processData();
		}
		/**
		* Handles processing of the data we have received.
		*/
		processData() {
			while (this.state !== constants_1.SocksClientState.Established && this.state !== constants_1.SocksClientState.Error && this.receiveBuffer.length >= this.nextRequiredPacketBufferSize) if (this.state === constants_1.SocksClientState.SentInitialHandshake) if (this.options.proxy.type === 4) this.handleSocks4FinalHandshakeResponse();
			else this.handleInitialSocks5HandshakeResponse();
			else if (this.state === constants_1.SocksClientState.SentAuthentication) this.handleInitialSocks5AuthenticationHandshakeResponse();
			else if (this.state === constants_1.SocksClientState.SentFinalHandshake) this.handleSocks5FinalHandshakeResponse();
			else if (this.state === constants_1.SocksClientState.BoundWaitingForConnection) if (this.options.proxy.type === 4) this.handleSocks4IncomingConnectionResponse();
			else this.handleSocks5IncomingConnectionResponse();
			else {
				this.closeSocket(constants_1.ERRORS.InternalError);
				break;
			}
		}
		/**
		* Handles Socket close event.
		* @param had_error
		*/
		onCloseHandler() {
			this.closeSocket(constants_1.ERRORS.SocketClosed);
		}
		/**
		* Handles Socket error event.
		* @param err
		*/
		onErrorHandler(err) {
			this.closeSocket(err.message);
		}
		/**
		* Removes internal event listeners on the underlying Socket.
		*/
		removeInternalSocketHandlers() {
			this.socket.pause();
			this.socket.removeListener("data", this.onDataReceived);
			this.socket.removeListener("close", this.onClose);
			this.socket.removeListener("error", this.onError);
			this.socket.removeListener("connect", this.onConnect);
		}
		/**
		* Closes and destroys the underlying Socket. Emits an error event.
		* @param err { String } An error string to include in error event.
		*/
		closeSocket(err) {
			if (this.state !== constants_1.SocksClientState.Error) {
				this.setState(constants_1.SocksClientState.Error);
				this.socket.destroy();
				this.removeInternalSocketHandlers();
				this.emit("error", new util_1.SocksClientError(err, this.options));
			}
		}
		/**
		* Sends initial Socks v4 handshake request.
		*/
		sendSocks4InitialHandshake() {
			const userId = this.options.proxy.userId || "";
			const buff = new smart_buffer_1.SmartBuffer();
			buff.writeUInt8(4);
			buff.writeUInt8(constants_1.SocksCommand[this.options.command]);
			buff.writeUInt16BE(this.options.destination.port);
			if (net$2.isIPv4(this.options.destination.host)) {
				buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
				buff.writeStringNT(userId);
			} else {
				buff.writeUInt8(0);
				buff.writeUInt8(0);
				buff.writeUInt8(0);
				buff.writeUInt8(1);
				buff.writeStringNT(userId);
				buff.writeStringNT(this.options.destination.host);
			}
			this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks4Response;
			this.socket.write(buff.toBuffer());
		}
		/**
		* Handles Socks v4 handshake response.
		* @param data
		*/
		handleSocks4FinalHandshakeResponse() {
			const data = this.receiveBuffer.get(8);
			if (data[1] !== constants_1.Socks4Response.Granted) this.closeSocket(`${constants_1.ERRORS.Socks4ProxyRejectedConnection} - (${constants_1.Socks4Response[data[1]]})`);
			else if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.bind) {
				const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
				buff.readOffset = 2;
				const remoteHost = {
					port: buff.readUInt16BE(),
					host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE())
				};
				if (remoteHost.host === "0.0.0.0") remoteHost.host = this.options.proxy.ipaddress;
				this.setState(constants_1.SocksClientState.BoundWaitingForConnection);
				this.emit("bound", {
					remoteHost,
					socket: this.socket
				});
			} else {
				this.setState(constants_1.SocksClientState.Established);
				this.removeInternalSocketHandlers();
				this.emit("established", { socket: this.socket });
			}
		}
		/**
		* Handles Socks v4 incoming connection request (BIND)
		* @param data
		*/
		handleSocks4IncomingConnectionResponse() {
			const data = this.receiveBuffer.get(8);
			if (data[1] !== constants_1.Socks4Response.Granted) this.closeSocket(`${constants_1.ERRORS.Socks4ProxyRejectedIncomingBoundConnection} - (${constants_1.Socks4Response[data[1]]})`);
			else {
				const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
				buff.readOffset = 2;
				const remoteHost = {
					port: buff.readUInt16BE(),
					host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE())
				};
				this.setState(constants_1.SocksClientState.Established);
				this.removeInternalSocketHandlers();
				this.emit("established", {
					remoteHost,
					socket: this.socket
				});
			}
		}
		/**
		* Sends initial Socks v5 handshake request.
		*/
		sendSocks5InitialHandshake() {
			const buff = new smart_buffer_1.SmartBuffer();
			const supportedAuthMethods = [constants_1.Socks5Auth.NoAuth];
			if (this.options.proxy.userId || this.options.proxy.password) supportedAuthMethods.push(constants_1.Socks5Auth.UserPass);
			if (this.options.proxy.custom_auth_method !== void 0) supportedAuthMethods.push(this.options.proxy.custom_auth_method);
			buff.writeUInt8(5);
			buff.writeUInt8(supportedAuthMethods.length);
			for (const authMethod of supportedAuthMethods) buff.writeUInt8(authMethod);
			this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5InitialHandshakeResponse;
			this.socket.write(buff.toBuffer());
			this.setState(constants_1.SocksClientState.SentInitialHandshake);
		}
		/**
		* Handles initial Socks v5 handshake response.
		* @param data
		*/
		handleInitialSocks5HandshakeResponse() {
			const data = this.receiveBuffer.get(2);
			if (data[0] !== 5) this.closeSocket(constants_1.ERRORS.InvalidSocks5IntiailHandshakeSocksVersion);
			else if (data[1] === constants_1.SOCKS5_NO_ACCEPTABLE_AUTH) this.closeSocket(constants_1.ERRORS.InvalidSocks5InitialHandshakeNoAcceptedAuthType);
			else if (data[1] === constants_1.Socks5Auth.NoAuth) {
				this.socks5ChosenAuthType = constants_1.Socks5Auth.NoAuth;
				this.sendSocks5CommandRequest();
			} else if (data[1] === constants_1.Socks5Auth.UserPass) {
				this.socks5ChosenAuthType = constants_1.Socks5Auth.UserPass;
				this.sendSocks5UserPassAuthentication();
			} else if (data[1] === this.options.proxy.custom_auth_method) {
				this.socks5ChosenAuthType = this.options.proxy.custom_auth_method;
				this.sendSocks5CustomAuthentication();
			} else this.closeSocket(constants_1.ERRORS.InvalidSocks5InitialHandshakeUnknownAuthType);
		}
		/**
		* Sends Socks v5 user & password auth handshake.
		*
		* Note: No auth and user/pass are currently supported.
		*/
		sendSocks5UserPassAuthentication() {
			const userId = this.options.proxy.userId || "";
			const password = this.options.proxy.password || "";
			const buff = new smart_buffer_1.SmartBuffer();
			buff.writeUInt8(1);
			buff.writeUInt8(Buffer.byteLength(userId));
			buff.writeString(userId);
			buff.writeUInt8(Buffer.byteLength(password));
			buff.writeString(password);
			this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5UserPassAuthenticationResponse;
			this.socket.write(buff.toBuffer());
			this.setState(constants_1.SocksClientState.SentAuthentication);
		}
		sendSocks5CustomAuthentication() {
			return __awaiter(this, void 0, void 0, function* () {
				this.nextRequiredPacketBufferSize = this.options.proxy.custom_auth_response_size;
				this.socket.write(yield this.options.proxy.custom_auth_request_handler());
				this.setState(constants_1.SocksClientState.SentAuthentication);
			});
		}
		handleSocks5CustomAuthHandshakeResponse(data) {
			return __awaiter(this, void 0, void 0, function* () {
				return yield this.options.proxy.custom_auth_response_handler(data);
			});
		}
		handleSocks5AuthenticationNoAuthHandshakeResponse(data) {
			return __awaiter(this, void 0, void 0, function* () {
				return data[1] === 0;
			});
		}
		handleSocks5AuthenticationUserPassHandshakeResponse(data) {
			return __awaiter(this, void 0, void 0, function* () {
				return data[1] === 0;
			});
		}
		/**
		* Handles Socks v5 auth handshake response.
		* @param data
		*/
		handleInitialSocks5AuthenticationHandshakeResponse() {
			return __awaiter(this, void 0, void 0, function* () {
				this.setState(constants_1.SocksClientState.ReceivedAuthenticationResponse);
				let authResult = false;
				if (this.socks5ChosenAuthType === constants_1.Socks5Auth.NoAuth) authResult = yield this.handleSocks5AuthenticationNoAuthHandshakeResponse(this.receiveBuffer.get(2));
				else if (this.socks5ChosenAuthType === constants_1.Socks5Auth.UserPass) authResult = yield this.handleSocks5AuthenticationUserPassHandshakeResponse(this.receiveBuffer.get(2));
				else if (this.socks5ChosenAuthType === this.options.proxy.custom_auth_method) authResult = yield this.handleSocks5CustomAuthHandshakeResponse(this.receiveBuffer.get(this.options.proxy.custom_auth_response_size));
				if (!authResult) this.closeSocket(constants_1.ERRORS.Socks5AuthenticationFailed);
				else this.sendSocks5CommandRequest();
			});
		}
		/**
		* Sends Socks v5 final handshake request.
		*/
		sendSocks5CommandRequest() {
			const buff = new smart_buffer_1.SmartBuffer();
			buff.writeUInt8(5);
			buff.writeUInt8(constants_1.SocksCommand[this.options.command]);
			buff.writeUInt8(0);
			if (net$2.isIPv4(this.options.destination.host)) {
				buff.writeUInt8(constants_1.Socks5HostType.IPv4);
				buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
			} else if (net$2.isIPv6(this.options.destination.host)) {
				buff.writeUInt8(constants_1.Socks5HostType.IPv6);
				buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
			} else {
				buff.writeUInt8(constants_1.Socks5HostType.Hostname);
				buff.writeUInt8(this.options.destination.host.length);
				buff.writeString(this.options.destination.host);
			}
			buff.writeUInt16BE(this.options.destination.port);
			this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHeader;
			this.socket.write(buff.toBuffer());
			this.setState(constants_1.SocksClientState.SentFinalHandshake);
		}
		/**
		* Handles Socks v5 final handshake response.
		* @param data
		*/
		handleSocks5FinalHandshakeResponse() {
			const header = this.receiveBuffer.peek(5);
			if (header[0] !== 5 || header[1] !== constants_1.Socks5Response.Granted) this.closeSocket(`${constants_1.ERRORS.InvalidSocks5FinalHandshakeRejected} - ${constants_1.Socks5Response[header[1]]}`);
			else {
				const addressType = header[3];
				let remoteHost;
				let buff;
				if (addressType === constants_1.Socks5HostType.IPv4) {
					const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv4;
					if (this.receiveBuffer.length < dataNeeded) {
						this.nextRequiredPacketBufferSize = dataNeeded;
						return;
					}
					buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
					remoteHost = {
						host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE()),
						port: buff.readUInt16BE()
					};
					if (remoteHost.host === "0.0.0.0") remoteHost.host = this.options.proxy.ipaddress;
				} else if (addressType === constants_1.Socks5HostType.Hostname) {
					const hostLength = header[4];
					const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHostname(hostLength);
					if (this.receiveBuffer.length < dataNeeded) {
						this.nextRequiredPacketBufferSize = dataNeeded;
						return;
					}
					buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(5));
					remoteHost = {
						host: buff.readString(hostLength),
						port: buff.readUInt16BE()
					};
				} else if (addressType === constants_1.Socks5HostType.IPv6) {
					const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv6;
					if (this.receiveBuffer.length < dataNeeded) {
						this.nextRequiredPacketBufferSize = dataNeeded;
						return;
					}
					buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
					remoteHost = {
						host: ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm(),
						port: buff.readUInt16BE()
					};
				}
				this.setState(constants_1.SocksClientState.ReceivedFinalResponse);
				if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.connect) {
					this.setState(constants_1.SocksClientState.Established);
					this.removeInternalSocketHandlers();
					this.emit("established", {
						remoteHost,
						socket: this.socket
					});
				} else if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.bind) {
					this.setState(constants_1.SocksClientState.BoundWaitingForConnection);
					this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHeader;
					this.emit("bound", {
						remoteHost,
						socket: this.socket
					});
				} else if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.associate) {
					this.setState(constants_1.SocksClientState.Established);
					this.removeInternalSocketHandlers();
					this.emit("established", {
						remoteHost,
						socket: this.socket
					});
				}
			}
		}
		/**
		* Handles Socks v5 incoming connection request (BIND).
		*/
		handleSocks5IncomingConnectionResponse() {
			const header = this.receiveBuffer.peek(5);
			if (header[0] !== 5 || header[1] !== constants_1.Socks5Response.Granted) this.closeSocket(`${constants_1.ERRORS.Socks5ProxyRejectedIncomingBoundConnection} - ${constants_1.Socks5Response[header[1]]}`);
			else {
				const addressType = header[3];
				let remoteHost;
				let buff;
				if (addressType === constants_1.Socks5HostType.IPv4) {
					const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv4;
					if (this.receiveBuffer.length < dataNeeded) {
						this.nextRequiredPacketBufferSize = dataNeeded;
						return;
					}
					buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
					remoteHost = {
						host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE()),
						port: buff.readUInt16BE()
					};
					if (remoteHost.host === "0.0.0.0") remoteHost.host = this.options.proxy.ipaddress;
				} else if (addressType === constants_1.Socks5HostType.Hostname) {
					const hostLength = header[4];
					const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHostname(hostLength);
					if (this.receiveBuffer.length < dataNeeded) {
						this.nextRequiredPacketBufferSize = dataNeeded;
						return;
					}
					buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(5));
					remoteHost = {
						host: buff.readString(hostLength),
						port: buff.readUInt16BE()
					};
				} else if (addressType === constants_1.Socks5HostType.IPv6) {
					const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv6;
					if (this.receiveBuffer.length < dataNeeded) {
						this.nextRequiredPacketBufferSize = dataNeeded;
						return;
					}
					buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
					remoteHost = {
						host: ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm(),
						port: buff.readUInt16BE()
					};
				}
				this.setState(constants_1.SocksClientState.Established);
				this.removeInternalSocketHandlers();
				this.emit("established", {
					remoteHost,
					socket: this.socket
				});
			}
		}
		get socksClientOptions() {
			return Object.assign({}, this.options);
		}
	};
}));
//#endregion
//#region node_modules/socks/build/index.js
var require_build = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_socksclient(), exports);
}));
//#endregion
//#region node_modules/imapflow/lib/proxy-connection.js
var require_proxy_connection = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var httpProxyClient = require_http_proxy_client();
	var { SocksClient } = require_build();
	var httpProxyClientAsync = __require("util").promisify(httpProxyClient);
	var dns = __require("dns").promises;
	var net$1 = __require("net");
	var hidePassword = (proxyUrl) => {
		if (proxyUrl.password) proxyUrl.password = "(hidden)";
	};
	var attachEarlyErrorHandler = (logger, socket) => {
		if (!socket || typeof socket.on !== "function") return;
		socket._earlyErrorHandler = (err) => {
			logger.error({
				msg: "Proxy socket error before connection setup",
				err
			});
		};
		socket.on("error", socket._earlyErrorHandler);
	};
	var detachEarlyErrorHandler = (socket) => {
		if (socket && socket._earlyErrorHandler) {
			socket.removeListener("error", socket._earlyErrorHandler);
			socket._earlyErrorHandler = null;
		}
	};
	var proxyConnection = async (logger, connectionUrl, host, port) => {
		let proxyUrl = new URL(connectionUrl);
		let protocol = proxyUrl.protocol.replace(/:$/, "").toLowerCase();
		if (!net$1.isIP(host)) {
			let resolveResult = await dns.resolve(host);
			if (resolveResult && resolveResult.length) host = resolveResult[0];
		}
		switch (protocol) {
			case "http":
			case "https": try {
				let socket = await httpProxyClientAsync(proxyUrl.href, port, host);
				if (socket) {
					hidePassword(proxyUrl);
					logger.info({
						msg: "Established a socket via HTTP proxy",
						proxyUrl: proxyUrl.href,
						port,
						host
					});
					attachEarlyErrorHandler(logger, socket);
				}
				return socket;
			} catch (err) {
				hidePassword(proxyUrl);
				logger.error({
					msg: "Failed to establish a socket via HTTP proxy",
					proxyUrl: proxyUrl.href,
					port,
					host,
					err
				});
				throw err;
			}
			case "socks":
			case "socks5":
			case "socks4":
			case "socks4a": {
				let proxyType = Number(protocol.replace(/\D/g, "")) || 5;
				let targetHost = proxyUrl.hostname;
				if (!net$1.isIP(targetHost)) {
					let resolveResult = await dns.resolve(targetHost);
					if (resolveResult && resolveResult.length) targetHost = resolveResult[0];
				}
				let connectionOpts = {
					proxy: {
						host: targetHost,
						port: Number(proxyUrl.port) || 1080,
						type: proxyType
					},
					destination: {
						host,
						port
					},
					command: "connect",
					set_tcp_nodelay: true
				};
				if (proxyUrl.username || proxyUrl.password) {
					connectionOpts.proxy.userId = proxyUrl.username;
					connectionOpts.proxy.password = proxyUrl.password;
				}
				try {
					const info = await SocksClient.createConnection(connectionOpts);
					if (info && info.socket) {
						hidePassword(proxyUrl);
						logger.info({
							msg: "Established a socket via SOCKS proxy",
							proxyUrl: proxyUrl.href,
							port,
							host
						});
						attachEarlyErrorHandler(logger, info.socket);
					}
					return info.socket;
				} catch (err) {
					hidePassword(proxyUrl);
					logger.error({
						msg: "Failed to establish a socket via SOCKS proxy",
						proxyUrl: proxyUrl.href,
						port,
						host,
						err
					});
					throw err;
				}
			}
		}
	};
	module.exports = {
		proxyConnection,
		detachEarlyErrorHandler
	};
}));
//#endregion
//#region node_modules/imapflow/lib/charsets.js
var require_charsets = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var CHARACTER_SETS = [
		"US-ASCII",
		"ISO-8859-1",
		"ISO-8859-2",
		"ISO-8859-3",
		"ISO-8859-4",
		"ISO-8859-5",
		"ISO-8859-6",
		"ISO-8859-7",
		"ISO-8859-8",
		"ISO-8859-9",
		"ISO-8859-10",
		"ISO_6937-2-add",
		"JIS_X0201",
		"JIS_Encoding",
		"Shift_JIS",
		"EUC-JP",
		"Extended_UNIX_Code_Fixed_Width_for_Japanese",
		"BS_4730",
		"SEN_850200_C",
		"IT",
		"ES",
		"DIN_66003",
		"NS_4551-1",
		"NF_Z_62-010",
		"ISO-10646-UTF-1",
		"ISO_646.basic:1983",
		"INVARIANT",
		"ISO_646.irv:1983",
		"NATS-SEFI",
		"NATS-SEFI-ADD",
		"NATS-DANO",
		"NATS-DANO-ADD",
		"SEN_850200_B",
		"KS_C_5601-1987",
		"ISO-2022-KR",
		"EUC-KR",
		"ISO-2022-JP",
		"ISO-2022-JP-2",
		"JIS_C6220-1969-jp",
		"JIS_C6220-1969-ro",
		"PT",
		"greek7-old",
		"latin-greek",
		"NF_Z_62-010_(1973)",
		"Latin-greek-1",
		"ISO_5427",
		"JIS_C6226-1978",
		"BS_viewdata",
		"INIS",
		"INIS-8",
		"INIS-cyrillic",
		"ISO_5427:1981",
		"ISO_5428:1980",
		"GB_1988-80",
		"GB_2312-80",
		"NS_4551-2",
		"videotex-suppl",
		"PT2",
		"ES2",
		"MSZ_7795.3",
		"JIS_C6226-1983",
		"greek7",
		"ASMO_449",
		"iso-ir-90",
		"JIS_C6229-1984-a",
		"JIS_C6229-1984-b",
		"JIS_C6229-1984-b-add",
		"JIS_C6229-1984-hand",
		"JIS_C6229-1984-hand-add",
		"JIS_C6229-1984-kana",
		"ISO_2033-1983",
		"ANSI_X3.110-1983",
		"T.61-7bit",
		"T.61-8bit",
		"ECMA-cyrillic",
		"CSA_Z243.4-1985-1",
		"CSA_Z243.4-1985-2",
		"CSA_Z243.4-1985-gr",
		"ISO-8859-6-E",
		"ISO-8859-6-I",
		"T.101-G2",
		"ISO-8859-8-E",
		"ISO-8859-8-I",
		"CSN_369103",
		"JUS_I.B1.002",
		"IEC_P27-1",
		"JUS_I.B1.003-serb",
		"JUS_I.B1.003-mac",
		"greek-ccitt",
		"NC_NC00-10:81",
		"ISO_6937-2-25",
		"GOST_19768-74",
		"ISO_8859-supp",
		"ISO_10367-box",
		"latin-lap",
		"JIS_X0212-1990",
		"DS_2089",
		"us-dk",
		"dk-us",
		"KSC5636",
		"UNICODE-1-1-UTF-7",
		"ISO-2022-CN",
		"ISO-2022-CN-EXT",
		"UTF-8",
		"ISO-8859-13",
		"ISO-8859-14",
		"ISO-8859-15",
		"ISO-8859-16",
		"GBK",
		"GB18030",
		"OSD_EBCDIC_DF04_15",
		"OSD_EBCDIC_DF03_IRV",
		"OSD_EBCDIC_DF04_1",
		"ISO-11548-1",
		"KZ-1048",
		"ISO-10646-UCS-2",
		"ISO-10646-UCS-4",
		"ISO-10646-UCS-Basic",
		"ISO-10646-Unicode-Latin1",
		"ISO-10646-J-1",
		"ISO-Unicode-IBM-1261",
		"ISO-Unicode-IBM-1268",
		"ISO-Unicode-IBM-1276",
		"ISO-Unicode-IBM-1264",
		"ISO-Unicode-IBM-1265",
		"UNICODE-1-1",
		"SCSU",
		"UTF-7",
		"UTF-16BE",
		"UTF-16LE",
		"UTF-16",
		"CESU-8",
		"UTF-32",
		"UTF-32BE",
		"UTF-32LE",
		"BOCU-1",
		"ISO-8859-1-Windows-3.0-Latin-1",
		"ISO-8859-1-Windows-3.1-Latin-1",
		"ISO-8859-2-Windows-Latin-2",
		"ISO-8859-9-Windows-Latin-5",
		"hp-roman8",
		"Adobe-Standard-Encoding",
		"Ventura-US",
		"Ventura-International",
		"DEC-MCS",
		"IBM850",
		"PC8-Danish-Norwegian",
		"IBM862",
		"PC8-Turkish",
		"IBM-Symbols",
		"IBM-Thai",
		"HP-Legal",
		"HP-Pi-font",
		"HP-Math8",
		"Adobe-Symbol-Encoding",
		"HP-DeskTop",
		"Ventura-Math",
		"Microsoft-Publishing",
		"Windows-31J",
		"GB2312",
		"Big5",
		"macintosh",
		"IBM037",
		"IBM038",
		"IBM273",
		"IBM274",
		"IBM275",
		"IBM277",
		"IBM278",
		"IBM280",
		"IBM281",
		"IBM284",
		"IBM285",
		"IBM290",
		"IBM297",
		"IBM420",
		"IBM423",
		"IBM424",
		"IBM437",
		"IBM500",
		"IBM851",
		"IBM852",
		"IBM855",
		"IBM857",
		"IBM860",
		"IBM861",
		"IBM863",
		"IBM864",
		"IBM865",
		"IBM868",
		"IBM869",
		"IBM870",
		"IBM871",
		"IBM880",
		"IBM891",
		"IBM903",
		"IBM904",
		"IBM905",
		"IBM918",
		"IBM1026",
		"EBCDIC-AT-DE",
		"EBCDIC-AT-DE-A",
		"EBCDIC-CA-FR",
		"EBCDIC-DK-NO",
		"EBCDIC-DK-NO-A",
		"EBCDIC-FI-SE",
		"EBCDIC-FI-SE-A",
		"EBCDIC-FR",
		"EBCDIC-IT",
		"EBCDIC-PT",
		"EBCDIC-ES",
		"EBCDIC-ES-A",
		"EBCDIC-ES-S",
		"EBCDIC-UK",
		"EBCDIC-US",
		"UNKNOWN-8BIT",
		"MNEMONIC",
		"MNEM",
		"VISCII",
		"VIQR",
		"KOI8-R",
		"HZ-GB-2312",
		"IBM866",
		"IBM775",
		"KOI8-U",
		"IBM00858",
		"IBM00924",
		"IBM01140",
		"IBM01141",
		"IBM01142",
		"IBM01143",
		"IBM01144",
		"IBM01145",
		"IBM01146",
		"IBM01147",
		"IBM01148",
		"IBM01149",
		"Big5-HKSCS",
		"IBM1047",
		"PTCP154",
		"Amiga-1251",
		"KOI7-switched",
		"BRF",
		"TSCII",
		"CP51932",
		"windows-874",
		"windows-1250",
		"windows-1251",
		"windows-1252",
		"windows-1253",
		"windows-1254",
		"windows-1255",
		"windows-1256",
		"windows-1257",
		"windows-1258",
		"TIS-620",
		"CP50220"
	];
	var CHARSET_MAP = /* @__PURE__ */ new Map();
	CHARACTER_SETS.forEach((entry) => {
		let key = entry.replace(/[_-\s]/g, "").toLowerCase();
		let modifiedKey = key.replace(/^windows/, "win").replace(/^usascii/, "ascii").replace(/^iso8859/, "latin");
		CHARSET_MAP.set(key, entry);
		if (!CHARSET_MAP.has(modifiedKey)) CHARSET_MAP.set(modifiedKey, entry);
	});
	module.exports.resolveCharset = (charset) => {
		let key = charset.replace(/[_-\s]/g, "").toLowerCase();
		return CHARSET_MAP.get(key) ?? null;
	};
}));
//#endregion
//#region node_modules/imapflow/lib/jp-decoder.js
var require_jp_decoder = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Transform } = __require("stream");
	var encodingJapanese = require_src();
	var JPDecoder = class extends Transform {
		constructor(charset) {
			super();
			this.charset = charset;
			this.chunks = [];
			this.chunklen = 0;
		}
		_transform(chunk, encoding, done) {
			if (typeof chunk === "string") chunk = Buffer.from(chunk, encoding);
			this.chunks.push(chunk);
			this.chunklen += chunk.length;
			done();
		}
		_flush(done) {
			let input = Buffer.concat(this.chunks, this.chunklen);
			try {
				let output = encodingJapanese.convert(input, {
					to: "UNICODE",
					from: this.charset,
					type: "string"
				});
				if (typeof output === "string") output = Buffer.from(output);
				this.push(output);
			} catch {
				this.push(input);
			}
			done();
		}
		_destroy(err, callback) {
			this.chunks = [];
			this.chunklen = 0;
			callback(err);
		}
	};
	module.exports.JPDecoder = JPDecoder;
}));
//#endregion
//#region node_modules/imapflow/lib/tools.js
var require_tools = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var libmime = require_libmime();
	var { resolveCharset } = require_charsets();
	var { compiler } = require_imap_handler();
	var { createHash } = __require("crypto");
	var { JPDecoder } = require_jp_decoder();
	var iconv = require_lib();
	var FLAG_COLORS = [
		"red",
		"orange",
		"yellow",
		"green",
		"blue",
		"purple",
		"grey"
	];
	var EXPANDED_RANGE_LIMIT = 16777216;
	var IMAP4REV2_FOLDED_CAPABILITIES = /* @__PURE__ */ new Set([
		"ENABLE",
		"ESEARCH",
		"IDLE",
		"LIST-EXTENDED",
		"LIST-STATUS",
		"LITERAL-",
		"MOVE",
		"NAMESPACE",
		"SASL-IR",
		"SEARCHRES",
		"SPECIAL-USE",
		"STATUS=SIZE",
		"UIDPLUS",
		"UNSELECT"
	]);
	/**
	* Error subclass thrown when IMAP authentication fails.
	*/
	var AuthenticationFailure = class extends Error {
		authenticationFailed = true;
	};
	var tools = {
		/**
		* Checks whether IMAP4rev2 semantics are active for the connection: either the
		* client enabled IMAP4rev2 explicitly, or the server is rev2-only (advertises
		* IMAP4rev2 without IMAP4rev1), in which case rev2 is the base protocol without
		* any ENABLE (RFC 9051 Appendix A). UTF-8 mailbox names apply in both cases.
		*
		* @param {Object} connection - IMAP connection instance
		* @returns {Boolean} True if IMAP4rev2 semantics apply to this session
		*/
		isRev2Active(connection) {
			return connection.enabled.has("IMAP4REV2") || connection.capabilities.has("IMAP4rev2") && !connection.capabilities.has("IMAP4rev1");
		},
		/**
		* Checks a capability, accounting for extensions that RFC 9051 folds into base
		* IMAP4rev2. Falls back to the plain capability lookup on IMAP4rev1 sessions,
		* so behavior against rev1 servers is unchanged.
		*
		* @param {Object} connection - IMAP connection instance
		* @param {String} capability - Capability name, e.g. 'UIDPLUS'
		* @returns {Boolean} True if the capability (or its rev2-folded equivalent) is available
		*/
		hasCapability(connection, capability) {
			if (connection.capabilities.has(capability)) return true;
			return IMAP4REV2_FOLDED_CAPABILITIES.has(capability) && tools.isRev2Active(connection);
		},
		/**
		* Builds the attribute list for a STATUS request - the standalone STATUS command
		* or the LIST-STATUS return option - from a status query object. Items the current
		* session cannot request (RECENT under IMAP4rev2, HIGHESTMODSEQ without CONDSTORE)
		* are silently dropped.
		*
		* @param {Object} connection - IMAP connection instance
		* @param {Object} statusQuery - Status data items to request, e.g. {messages: true}
		* @returns {Object[]} Attribute token list for the command compiler
		*/
		buildStatusQueryAttributes(connection, statusQuery) {
			let attributes = [];
			Object.keys(statusQuery || {}).forEach((key) => {
				if (!statusQuery[key]) return;
				switch (key.toUpperCase()) {
					case "MESSAGES":
					case "UIDNEXT":
					case "UIDVALIDITY":
					case "UNSEEN":
						attributes.push({
							type: "ATOM",
							value: key.toUpperCase()
						});
						break;
					case "RECENT":
						if (!tools.isRev2Active(connection)) attributes.push({
							type: "ATOM",
							value: key.toUpperCase()
						});
						break;
					case "HIGHESTMODSEQ":
						if (connection.capabilities.has("CONDSTORE")) attributes.push({
							type: "ATOM",
							value: key.toUpperCase()
						});
						break;
				}
			});
			return attributes;
		},
		/**
		* Encodes a mailbox path to modified UTF-7 if the server does not support UTF8=ACCEPT.
		*
		* @param {Object} connection - IMAP connection instance
		* @param {String} path - Mailbox path to encode
		* @returns {String} Encoded mailbox path
		*/
		encodePath(connection, path) {
			path = (path || "").toString();
			if (!connection.enabled.has("UTF8=ACCEPT") && !tools.isRev2Active(connection) && /[&\x00-\x08\x0b-\x0c\x0e-\x1f\u0080-\uffff]/.test(path)) try {
				path = iconv.encode(path, "utf-7-imap").toString();
			} catch {}
			return path;
		},
		/**
		* Decodes a mailbox path from modified UTF-7 if the server does not support UTF8=ACCEPT.
		*
		* @param {Object} connection - IMAP connection instance
		* @param {String} path - Mailbox path to decode
		* @returns {String} Decoded mailbox path
		*/
		decodePath(connection, path) {
			path = (path || "").toString();
			if (!connection.enabled.has("UTF8=ACCEPT") && !tools.isRev2Active(connection) && /[&]/.test(path)) try {
				path = iconv.decode(Buffer.from(path), "utf-7-imap").toString();
			} catch {}
			return path;
		},
		/**
		* Normalizes a mailbox path by joining array segments with the namespace delimiter,
		* uppercasing INBOX, and prepending the namespace prefix if needed.
		*
		* @param {Object} connection - IMAP connection instance
		* @param {String|String[]} path - Mailbox path or array of path segments
		* @param {Boolean} [skipNamespace] - If true, skips prepending the namespace prefix
		* @returns {String} Normalized mailbox path
		*/
		normalizePath(connection, path, skipNamespace) {
			if (Array.isArray(path)) path = path.join(connection.namespace && connection.namespace.delimiter || "");
			if (path.toUpperCase() === "INBOX") return "INBOX";
			if (!skipNamespace && connection.namespace && connection.namespace.prefix && !path.startsWith(connection.namespace.prefix)) path = connection.namespace.prefix + path;
			return path;
		},
		/**
		* Compares two mailbox paths for equality after normalization.
		*
		* @param {Object} connection - IMAP connection instance
		* @param {String} a - First mailbox path
		* @param {String} b - Second mailbox path
		* @returns {Boolean} True if the paths are equal after normalization
		*/
		comparePaths(connection, a, b) {
			if (!a || !b) return false;
			return tools.normalizePath(connection, a) === tools.normalizePath(connection, b);
		},
		/**
		* Parses a capability response list into a Map of capability names to values.
		*
		* @param {Array} list - Array of capability objects from IMAP response
		* @returns {Map<string, boolean|number>} Map of capability names to `true` or numeric values
		*/
		updateCapabilities(list) {
			let map = /* @__PURE__ */ new Map();
			if (list && Array.isArray(list)) list.forEach((val) => {
				if (typeof val.value !== "string") return;
				let capability = val.value.toUpperCase().trim();
				if (capability === "IMAP4REV1") {
					map.set("IMAP4rev1", true);
					return;
				}
				if (capability === "IMAP4REV2") {
					map.set("IMAP4rev2", true);
					return;
				}
				if (capability.startsWith("APPENDLIMIT=")) {
					let splitPos = capability.indexOf("=");
					let appendLimit = Number(capability.substr(splitPos + 1)) || 0;
					map.set("APPENDLIMIT", appendLimit);
					return;
				}
				map.set(capability, true);
			});
			return map;
		},
		AuthenticationFailure,
		/**
		* Extracts the IMAP response status code (e.g. AUTHENTICATIONFAILED, NONEXISTENT)
		* from a parsed server response.
		*
		* @param {Object} response - Parsed IMAP server response
		* @returns {String|false} Uppercase status code string, or false if not found
		*/
		getStatusCode(response) {
			return response && response.attributes && response.attributes[0] && response.attributes[0].section && response.attributes[0].section[0] && typeof response.attributes[0].section[0].value === "string" ? response.attributes[0].section[0].value.toUpperCase().trim() : false;
		},
		/**
		* Compiles an IMAP response object back into a human-readable string.
		*
		* @param {Object} response - Parsed IMAP server response
		* @returns {Promise<String|false>} Compiled response text, or false if no response
		*/
		async getErrorText(response) {
			if (!response) return false;
			return (await compiler(response)).toString();
		},
		/**
		* Enhances an IMAP command error with the server response code and text.
		*
		* @param {Error} err - Error object with a `response` property
		* @returns {Promise<Error>} The enhanced error with `serverResponseCode` and string `response`
		*/
		async enhanceCommandError(err) {
			let errorCode = tools.getStatusCode(err.response);
			if (errorCode) err.serverResponseCode = errorCode;
			err.response = await tools.getErrorText(err.response);
			return err;
		},
		/**
		* Converts a flat list of mailbox folders into a tree structure.
		*
		* @param {Object[]} folders - Array of folder objects from LIST/LSUB response
		* @returns {Object} Tree structure with a `root` flag and nested `folders` arrays
		*/
		getFolderTree(folders) {
			let tree = {
				root: true,
				folders: []
			};
			let getTreeNode = (parents) => {
				let node = tree;
				if (!parents || !parents.length) return node;
				for (let parent of parents) {
					let cur = node.folders && node.folders.find((folder) => folder.name === parent);
					if (cur) node = cur;
				}
				return node;
			};
			for (let folder of folders) {
				let parent = getTreeNode(folder.parent);
				let existing = parent.folders && parent.folders.find((existing) => existing.name === folder.name);
				if (existing) {
					existing.name = folder.name;
					existing.flags = folder.flags;
					existing.path = folder.path;
					existing.subscribed = !!folder.subscribed;
					existing.listed = !!folder.listed;
					existing.status = folder.status;
					if (folder.specialUse) existing.specialUse = folder.specialUse;
					if (folder.flags.has("\\Noselect")) existing.disabled = true;
					if (folder.flags.has("\\HasChildren") && !existing.folders) existing.folders = [];
				} else {
					let data = {
						name: folder.name,
						flags: folder.flags,
						path: folder.path,
						subscribed: !!folder.subscribed,
						listed: !!folder.listed,
						status: folder.status
					};
					if (folder.delimiter) data.delimiter = folder.delimiter;
					if (folder.specialUse) data.specialUse = folder.specialUse;
					if (folder.flags.has("\\Noselect")) data.disabled = true;
					if (folder.flags.has("\\HasChildren")) data.folders = [];
					if (!parent.folders) parent.folders = [];
					parent.folders.push(data);
				}
			}
			return tree;
		},
		/**
		* Derives a flag color name from a message's flags Set using Apple Mail color flag rules.
		*
		* @param {Set<string>} flags - Message flags Set
		* @returns {String|null} Color name (e.g. 'red', 'orange') or null if not flagged
		*/
		getFlagColor(flags) {
			if (!flags.has("\\Flagged")) return null;
			const bit0 = flags.has("$MailFlagBit0") ? 1 : 0;
			const bit1 = flags.has("$MailFlagBit1") ? 2 : 0;
			const bit2 = flags.has("$MailFlagBit2") ? 4 : 0;
			return FLAG_COLORS[bit0 | bit1 | bit2] ?? "red";
		},
		/**
		* Converts a color name to the corresponding flag add/remove operations for Apple Mail color flags.
		*
		* @param {String} color - Color name (e.g. 'red', 'orange', 'yellow')
		* @returns {Object|null} Object with `add` and `remove` arrays of flag strings, or null if invalid color
		*/
		getColorFlags(color) {
			const colorCode = color ? FLAG_COLORS.indexOf(color.toString().toLowerCase().trim()) : null;
			if (colorCode === null || colorCode < 0) {
				if (colorCode === null) return {
					add: [],
					remove: [
						"\\Flagged",
						"$MailFlagBit0",
						"$MailFlagBit1",
						"$MailFlagBit2"
					]
				};
				return null;
			}
			let result = {
				add: ["\\Flagged"],
				remove: []
			};
			for (let i = 0; i < 3; i++) if (colorCode & 1 << i) result.add.push(`$MailFlagBit${i}`);
			else result.remove.push(`$MailFlagBit${i}`);
			return result;
		},
		/**
		* Formats a raw untagged FETCH response into a structured message object.
		*
		* @param {Object} untagged - Parsed untagged IMAP response
		* @param {Object} mailbox - Current mailbox state object
		* @returns {Promise<Object>} Formatted message object with properties like seq, uid, flags, envelope, etc.
		*/
		async formatMessageResponse(untagged, mailbox) {
			let map = {};
			map.seq = Number(untagged.command);
			let key;
			let attributes = untagged.attributes && untagged.attributes[1] || [];
			for (let i = 0, len = attributes.length; i < len; i++) {
				let attribute = attributes[i];
				if (i % 2 === 0) {
					key = (await compiler({ attributes: [attribute] })).toString().toLowerCase().replace(/<\d+(\.\d+)?>$/, "");
					continue;
				}
				/* c8 ignore start */ if (typeof key !== "string") continue;
				/* c8 ignore stop */
				let getString = (attribute) => {
					if (!attribute) return false;
					if (typeof attribute.value === "string") return attribute.value;
					if (Buffer.isBuffer(attribute.value)) return attribute.value.toString();
				};
				let getBuffer = (attribute) => {
					if (!attribute) return false;
					if (Buffer.isBuffer(attribute.value)) return attribute.value;
				};
				let getArray = (attribute) => {
					if (Array.isArray(attribute)) return attribute.map((entry) => entry && typeof entry.value === "string" ? entry.value : false).filter((entry) => entry);
					return [];
				};
				switch (key) {
					case "body[]":
					case "binary[]":
						map.source = getBuffer(attribute);
						break;
					case "uid":
						map.uid = Number(getString(attribute));
						if (map.uid && (!mailbox.uidNext || mailbox.uidNext <= map.uid)) mailbox.uidNext = map.uid + 1;
						break;
					case "modseq":
						map.modseq = BigInt(getArray(attribute)[0]);
						if (map.modseq && (!mailbox.highestModseq || mailbox.highestModseq < map.modseq)) mailbox.highestModseq = map.modseq;
						break;
					case "emailid":
						map.emailId = getArray(attribute)[0];
						break;
					case "x-gm-msgid":
						map.emailId = getString(attribute);
						break;
					case "threadid":
						map.threadId = getArray(attribute)[0];
						break;
					case "x-gm-thrid":
						map.threadId = getString(attribute);
						break;
					case "x-gm-labels":
						map.labels = new Set(getArray(attribute));
						break;
					case "rfc822.size":
						map.size = Number(getString(attribute)) || 0;
						break;
					case "flags":
						map.flags = new Set(getArray(attribute));
						break;
					case "envelope":
						map.envelope = tools.parseEnvelope(attribute);
						break;
					case "bodystructure":
						map.bodyStructure = tools.parseBodystructure(attribute);
						break;
					case "internaldate": {
						let value = getString(attribute);
						let date = new Date(value);
						if (date.toString() === "Invalid Date") map.internalDate = value;
						else map.internalDate = date;
						break;
					}
					default:
						if (key.match(/(body|binary)\[/i)) {
							let partKey = key.replace(/^(body|binary)\[|]$/gi, "");
							partKey = partKey.replace(/\.fields.*$/g, "");
							let value = getBuffer(attribute);
							if (partKey === "header") {
								map.headers = value;
								break;
							}
							if (!map.bodyParts) map.bodyParts = /* @__PURE__ */ new Map();
							map.bodyParts.set(partKey, value);
							break;
						}
						break;
				}
			}
			if (map.emailId || map.uid) {
				let path = mailbox.path;
				if (/[\u0080-\uffff]/.test(path)) try {
					path = iconv.encode(path, "utf-7-imap").toString();
				} catch {}
				map.id = map.emailId || createHash("md5").update([
					path,
					mailbox.uidValidity?.toString() || "",
					map.uid.toString()
				].join(":")).digest("hex");
			}
			if (map.flags) {
				let flagColor = tools.getFlagColor(map.flags);
				if (flagColor) map.flagColor = flagColor;
			}
			return map;
		},
		/**
		* Strips surrounding double quotes from a name string.
		*
		* @param {String} name - Raw name string potentially wrapped in quotes
		* @returns {String} Name with surrounding quotes removed
		*/
		processName(name) {
			name = (name || "").toString();
			if (name.length > 2 && name.at(0) === "\"" && name.at(-1) === "\"") name = name.slice(1, -1);
			return name;
		},
		/**
		* Parses a raw IMAP ENVELOPE response into a structured envelope object.
		*
		* @param {Array} entry - Raw envelope data array from IMAP response
		* @returns {Object} Parsed envelope with date, subject, from, to, cc, bcc, messageId, etc.
		*/
		parseEnvelope(entry) {
			let getStrValue = (obj) => {
				if (!obj) return false;
				if (typeof obj.value === "string") return obj.value;
				if (Buffer.isBuffer(obj.value)) return obj.value.toString();
				/* c8 ignore next */ return obj.value;
			};
			let processAddresses = function(list) {
				/* c8 ignore next 2 */ return [].concat(list || []).map((addr) => {
					let address = (getStrValue(addr[2]) || "") + "@" + (getStrValue(addr[3]) || "");
					if (address === "@") address = "";
					return {
						name: tools.processName(libmime.decodeWords(getStrValue(addr[0]))),
						address
					};
				}).filter((addr) => addr.name || addr.address);
			}, envelope = {};
			if (entry[0] && entry[0].value) {
				let date = new Date(getStrValue(entry[0]));
				if (date.toString() === "Invalid Date") envelope.date = getStrValue(entry[0]);
				else envelope.date = date;
			}
			if (entry[1] && entry[1].value) envelope.subject = libmime.decodeWords(getStrValue(entry[1]));
			if (entry[2] && entry[2].length) envelope.from = processAddresses(entry[2]);
			if (entry[3] && entry[3].length) envelope.sender = processAddresses(entry[3]);
			if (entry[4] && entry[4].length) envelope.replyTo = processAddresses(entry[4]);
			if (entry[5] && entry[5].length) envelope.to = processAddresses(entry[5]);
			if (entry[6] && entry[6].length) envelope.cc = processAddresses(entry[6]);
			if (entry[7] && entry[7].length) envelope.bcc = processAddresses(entry[7]);
			if (entry[8] && entry[8].value)
 /* c8 ignore next */ envelope.inReplyTo = (getStrValue(entry[8]) || "").toString().trim();
			if (entry[9] && entry[9].value)
 /* c8 ignore next */ envelope.messageId = (getStrValue(entry[9]) || "").toString().trim();
			return envelope;
		},
		/**
		* Parses structured MIME parameter arrays (including RFC 2231 continuations)
		* into a flat key-value object.
		*
		* @param {Array} arr - Raw parameter array from BODYSTRUCTURE response
		* @returns {Object} Key-value object of decoded parameters
		*/
		getStructuredParams(arr) {
			let key;
			let params = {};
			[].concat(arr || []).forEach((val, j) => {
				if (j % 2) params[key] = libmime.decodeWords((val && val.value || "").toString());
				else key = (val && val.value || "").toString().toLowerCase();
			});
			if (params.filename && !params["filename*"] && /^[a-z\-_0-9]+'[a-z]*'[^'\x00-\x08\x0b\x0c\x0e-\x1f\u0080-\uFFFF]+/.test(params.filename)) {
				let [encoding, , encodedValue] = params.filename.split("'");
				if (resolveCharset(encoding)) params["filename*"] = `${encoding}''${encodedValue}`;
			}
			Object.keys(params).forEach((key) => {
				let actualKey;
				let nr;
				let value;
				let match = key.match(/\*((\d+)\*?)?$/);
				if (!match) return;
				actualKey = key.substr(0, match.index).toLowerCase();
				nr = Number(match[2]) || 0;
				if (!params[actualKey] || typeof params[actualKey] !== "object") params[actualKey] = {
					charset: false,
					values: []
				};
				value = params[key];
				if (nr === 0 && match[0].at(-1) === "*" && (match = value.match(/^([^']*)'[^']*'(.*)$/))) {
					params[actualKey].charset = match[1] || "utf-8";
					value = match[2];
				}
				params[actualKey].values.push({
					nr,
					value
				});
				delete params[key];
			});
			Object.keys(params).forEach((key) => {
				let value;
				if (params[key] && Array.isArray(params[key].values)) {
					value = params[key].values.sort((a, b) => a.nr - b.nr).map((val) => val && val.value || "").join("");
					if (params[key].charset) params[key] = libmime.decodeWords("=?" + params[key].charset + "?Q?" + value.replace(/[=?_\s]/g, (s) => {
						if (s === " ") return "_";
						let c = s.charCodeAt(0).toString(16);
						return "%" + (c.length < 2 ? "0" : "") + c;
					}).replace(/%/g, "=") + "?=");
					else params[key] = libmime.decodeWords(value);
				}
			});
			return params;
		},
		/**
		* Parses a raw IMAP BODYSTRUCTURE response into a structured tree of body parts.
		*
		* @param {Array} entry - Raw BODYSTRUCTURE data array from IMAP response
		* @returns {Object} Parsed body structure tree with part numbers, types, parameters, and child nodes
		*/
		parseBodystructure(entry) {
			let walk = (node, path) => {
				path = path || [];
				let curNode = {}, i = 0, part = 0;
				if (path.length) curNode.part = path.join(".");
				if (Array.isArray(node[0])) {
					curNode.childNodes = [];
					while (Array.isArray(node[i])) {
						curNode.childNodes.push(walk(node[i], path.concat(++part)));
						i++;
					}
					curNode.type = "multipart/" + ((node[i++] || {}).value || "").toString().toLowerCase();
					if (i < node.length - 1) {
						if (node[i]) curNode.parameters = tools.getStructuredParams(node[i]);
						i++;
					}
				} else {
					curNode.type = [((node[i++] || {}).value || "").toString().toLowerCase(), ((node[i++] || {}).value || "").toString().toLowerCase()].join("/");
					if (node[i]) curNode.parameters = tools.getStructuredParams(node[i]);
					i++;
					if (node[i]) curNode.id = (node[i].value || "").toString();
					i++;
					if (node[i]) curNode.description = (node[i].value || "").toString();
					i++;
					if (node[i]) curNode.encoding = (node[i].value || "").toString().toLowerCase();
					i++;
					if (node[i]) curNode.size = Number(node[i].value || 0) || 0;
					i++;
					if (curNode.type === "message/rfc822") {
						if (node[i])
 /* c8 ignore next */ curNode.envelope = tools.parseEnvelope([].concat(node[i] || []));
						i++;
						if (node[i]) curNode.childNodes = [walk(node[i], path)];
						i++;
						if (node[i]) curNode.lineCount = Number(node[i].value || 0) || 0;
						i++;
					}
					if (/^text\//.test(curNode.type)) if (node.length === 11 && Array.isArray(node[i + 1]) && !Array.isArray(node[i + 2])) {} else {
						if (node[i]) curNode.lineCount = Number(node[i].value || 0) || 0;
						i++;
					}
					if (i < node.length - 1) {
						if (node[i]) curNode.md5 = (node[i].value || "").toString().toLowerCase();
						i++;
					}
				}
				if (i < node.length - 1) {
					if (Array.isArray(node[i]) && node[i].length) {
						curNode.disposition = (node[i][0] && node[i][0].value || "").toString().toLowerCase();
						if (Array.isArray(node[i][1])) curNode.dispositionParameters = tools.getStructuredParams(node[i][1]);
					}
					i++;
				}
				if (i < node.length - 1) {
					if (node[i])
 /* c8 ignore next */ curNode.language = [].concat(node[i] || []).map((val) => (val && val.value || "").toString().toLowerCase());
					i++;
				}
				if (i < node.length - 1) {
					if (node[i]) curNode.location = (node[i].value || "").toString();
				}
				return curNode;
			};
			return walk(entry);
		},
		/**
		* Checks if a value is a Date object.
		*
		* @param {*} obj - Value to check
		* @returns {Boolean} True if the value is a Date object
		*/
		isDate(obj) {
			return Object.prototype.toString.call(obj) === "[object Date]";
		},
		/**
		* Converts a value to a valid Date object, or returns null.
		*
		* @param {*} value - Date object or date string to convert
		* @returns {Date|null} Valid Date object, or null if conversion fails
		*/
		toValidDate(value) {
			if (!value) return null;
			if (typeof value === "string") value = new Date(value);
			if (!tools.isDate(value) || value.toString() === "Invalid Date") return null;
			return value;
		},
		/**
		* Formats a date value into IMAP date format (DD-Mon-YYYY).
		*
		* @param {Date|String} value - Date to format
		* @returns {String|undefined} Formatted date string, or undefined if invalid
		*/
		formatDate(value) {
			value = tools.toValidDate(value);
			if (!value) return;
			let dateParts = value.toISOString().substr(0, 10).split("-");
			dateParts.reverse();
			dateParts[1] = [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec"
			][Number(dateParts[1]) - 1];
			return dateParts.join("-");
		},
		/**
		* Formats a date value into IMAP date-time format (DD-Mon-YYYY HH:MM:SS +0000).
		*
		* @param {Date|String} value - Date to format
		* @returns {String|undefined} Formatted date-time string, or undefined if invalid
		*/
		formatDateTime(value) {
			value = tools.toValidDate(value);
			if (!value) return;
			return `${tools.formatDate(value).replace(/^0/, " ")} ${value.toISOString().substr(11, 8)} +0000`;
		},
		/**
		* Normalizes a flag string. Returns false for non-settable flags (e.g. \Recent),
		* and capitalizes system flags properly.
		*
		* @param {String} flag - Flag string to normalize
		* @returns {String|false} Normalized flag string, or false if the flag cannot be set
		*/
		formatFlag(flag) {
			switch (flag.toLowerCase()) {
				case "\\recent": return false;
				case "\\seen":
				case "\\answered":
				case "\\flagged":
				case "\\deleted":
				case "\\draft": return flag.toLowerCase().replace(/^\\./, (c) => c.toUpperCase());
			}
			return flag;
		},
		/**
		* Checks if a flag can be used in the given mailbox based on permanent flags.
		*
		* @param {Object} mailbox - Mailbox object with permanentFlags
		* @param {String} flag - Flag to check
		* @returns {Boolean} True if the flag is allowed
		*/
		canUseFlag(mailbox, flag) {
			return !mailbox || !mailbox.permanentFlags || mailbox.permanentFlags.has("\\*") || mailbox.permanentFlags.has(flag);
		},
		/**
		* Checks that a value is a valid IMAP sequence number or UID: a non-zero
		* 32-bit unsigned integer (nz-number in the RFC 9051 grammar). Guards range
		* expansion against untrusted server input such as 'Infinity' or '0:*'.
		*
		* @param {Number} value - Value to check
		* @returns {Boolean} True if the value is a valid sequence number/UID
		*/
		isValidSequenceValue(value) {
			return Number.isSafeInteger(value) && value > 0 && value <= 4294967295;
		},
		/**
		* Expands an IMAP sequence range string (e.g. "1:3,5,7:9") into an array of numbers.
		*
		* Entries with endpoints that are not valid nz-numbers are skipped - the input
		* may come from an untrusted server, and 'Infinity' or similar garbage would
		* otherwise loop without bound. A single range is expanded to at most
		* EXPANDED_RANGE_LIMIT entries: legitimate responses never reach the limit
		* (the mailbox would need that many messages), while a hostile range like
		* 1:4294967295 is cut off instead of exhausting memory.
		*
		* @param {String} range - IMAP sequence range string
		* @returns {Number[]} Array of expanded sequence numbers
		*/
		expandRange(range) {
			return range.split(",").flatMap((entry) => {
				entry = entry.trim();
				let colon = entry.indexOf(":");
				if (colon < 0) {
					let value = Number(entry);
					return tools.isValidSequenceValue(value) ? value : [];
				}
				let first = Number(entry.substr(0, colon));
				let second = Number(entry.substr(colon + 1));
				if (!tools.isValidSequenceValue(first) || !tools.isValidSequenceValue(second)) return [];
				if (first === second) return first;
				let list = [];
				if (first < second) {
					let last = Math.min(second, first + EXPANDED_RANGE_LIMIT - 1);
					for (let i = first; i <= last; i++) list.push(i);
				} else {
					let last = Math.max(second, first - EXPANDED_RANGE_LIMIT + 1);
					for (let i = first; i >= last; i--) list.push(i);
				}
				return list;
			});
		},
		/**
		* Returns a stream decoder for the given charset. Uses a special Japanese
		* charset decoder for JIS/ISO-2022-JP, otherwise delegates to iconv-lite.
		*
		* @param {String} [charset='ascii'] - Character set name
		* @returns {Object} A stream decoder (Transform stream) for the charset
		*/
		getDecoder(charset) {
			charset = (charset || "ascii").toString().trim().toLowerCase();
			if (/^jis|^iso-?2022-?jp|^euc-?jp/.test(charset)) return new JPDecoder(charset);
			return iconv.decodeStream(charset);
		},
		/**
		* Packs an array of message sequence numbers into a compact IMAP range string
		* (e.g. [1,2,3,5,7,8] becomes "1:3,5,7:8").
		*
		* @param {Number|Number[]} list - Sequence number or array of sequence numbers
		* @returns {String} Packed IMAP sequence range string
		*/
		packMessageRange(list) {
			if (!Array.isArray(list)) list = [].concat(list || []);
			if (!list.length) return "";
			list = Array.from(new Set(list)).sort((a, b) => a - b);
			let result = [[list[list.length - 1]]];
			for (let i = list.length - 2; i >= 0; i--) {
				if (list[i] === list[i + 1] - 1) {
					result[0].unshift(list[i]);
					continue;
				}
				result.unshift([list[i]]);
			}
			result = result.map((item) => {
				if (item.length === 1) return item[0];
				return item.shift() + ":" + item.pop();
			});
			return result.join(",");
		}
	};
	module.exports = tools;
}));
//#endregion
//#region node_modules/imapflow/lib/commands/id.js
var require_id = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { formatDateTime } = require_tools();
	/**
	* Sends ID info to the server and updates server info data based on the response.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {Object} clientInfo - Client identification key-value pairs to send to the server
	* @returns {Promise<Object|boolean|undefined>} Server information map, false on failure, or undefined if ID not supported
	*/
	module.exports = async (connection, clientInfo) => {
		if (!connection.capabilities.has("ID")) return;
		let response;
		try {
			let map = {};
			let formattedClientInfo = !clientInfo ? null : Object.keys(clientInfo).map((key) => [key, formatValue(key, clientInfo[key])]).filter((entry) => entry[1]).flatMap((entry) => entry);
			if (formattedClientInfo && !formattedClientInfo.length) formattedClientInfo = null;
			response = await connection.exec("ID", [formattedClientInfo], { untagged: { ID: async (untagged) => {
				let params = untagged.attributes && untagged.attributes[0];
				let key;
				(Array.isArray(params) ? params : [].concat(params || [])).forEach((val, i) => {
					if (i % 2 === 0) key = val.value;
					else if (typeof key === "string" && typeof val.value === "string") map[key.toLowerCase().trim()] = val.value;
				});
			} } });
			connection.serverInfo = map;
			response.next();
			return map;
		} catch (err) {
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
	/**
	* Formats a client info value for the ID command.
	*
	* @param {string} key - The info key name
	* @param {*} value - The value to format
	* @returns {string} Formatted value string
	*/
	function formatValue(key, value) {
		switch (key.toLowerCase()) {
			case "date": return formatDateTime(value);
			default: return (value || "").toString().replace(/\s+/g, " ");
		}
	}
}));
//#endregion
//#region node_modules/imapflow/lib/commands/capability.js
var require_capability = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Refreshes capabilities from server.
	*
	* @param {Object} connection - IMAP connection instance
	* @returns {Promise<Map|boolean>} Server capabilities map, or false on failure
	*/
	module.exports = async (connection) => {
		if (connection.capabilities.size && !connection.expectCapabilityUpdate) return connection.capabilities;
		let response;
		try {
			response = await connection.exec("CAPABILITY");
			response.next();
			return connection.capabilities;
		} catch (err) {
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/namespace.js
var require_namespace = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { hasCapability } = require_tools();
	/**
	* Requests NAMESPACE info from the server.
	*
	* @param {Object} connection - IMAP connection instance
	* @returns {Promise<{prefix: string, delimiter: string|null}|{error: boolean, status: string, text: string}>} The primary personal namespace, or an error object on failure
	*/
	module.exports = async (connection) => {
		if (![connection.states.AUTHENTICATED, connection.states.SELECTED].includes(connection.state)) return;
		if (!hasCapability(connection, "NAMESPACE")) {
			let { prefix, delimiter } = await getListPrefix(connection);
			if (delimiter && prefix && prefix.charAt(prefix.length - 1) !== delimiter) prefix += delimiter;
			connection.namespaces = {
				personal: [{
					prefix: prefix || "",
					delimiter
				}],
				other: false,
				shared: false
			};
			connection.namespace = connection.namespaces.personal[0];
			return connection.namespace;
		}
		let response;
		try {
			let map = {};
			response = await connection.exec("NAMESPACE", false, { untagged: { NAMESPACE: async (untagged) => {
				if (!untagged.attributes || !untagged.attributes.length) return;
				map.personal = getNamsepaceInfo(untagged.attributes[0]);
				map.other = getNamsepaceInfo(untagged.attributes[1]);
				map.shared = getNamsepaceInfo(untagged.attributes[2]);
			} } });
			connection.namespaces = map;
			if (!connection.namespaces.personal[0]) connection.namespaces.personal[0] = {
				prefix: "",
				delimiter: "."
			};
			connection.namespaces.personal[0].prefix = connection.namespaces.personal[0].prefix || "";
			response.next();
			connection.namespace = connection.namespaces.personal[0];
			return connection.namespace;
		} catch (err) {
			connection.log.warn({
				err,
				cid: connection.id
			});
			return {
				error: true,
				status: err.responseStatus,
				text: err.responseText
			};
		}
	};
	/**
	* Derives namespace prefix and delimiter from a LIST command when NAMESPACE is not supported.
	*
	* @param {Object} connection - IMAP connection instance
	* @returns {Promise<{prefix?: string, delimiter?: string, flags?: Set}>} Object with prefix, delimiter, and flags, or empty object on failure
	*/
	async function getListPrefix(connection) {
		let response;
		try {
			let map = {};
			response = await connection.exec("LIST", ["", ""], { untagged: { LIST: async (untagged) => {
				if (!untagged.attributes || !untagged.attributes.length) return;
				map.flags = new Set(untagged.attributes[0].map((entry) => entry.value));
				map.delimiter = untagged.attributes[1] && untagged.attributes[1].value;
				map.prefix = untagged.attributes[2] && untagged.attributes[2].value || "";
				if (map.delimiter && map.prefix.charAt(0) === map.delimiter) map.prefix = map.prefix.slice(1);
			} } });
			response.next();
			return map;
		} catch (err) {
			connection.log.warn({
				err,
				cid: connection.id
			});
			return {};
		}
	}
	/**
	* Parses namespace information from an IMAP NAMESPACE response attribute.
	*
	* @param {Array} attribute - Namespace attribute array from the server response
	* @returns {Array<{prefix: string, delimiter: string|null}>|boolean} Array of namespace entries, or false if empty
	*/
	function getNamsepaceInfo(attribute) {
		if (!attribute || !attribute.length) return false;
		return attribute.filter((entry) => entry.length >= 2 && entry[0] && typeof entry[0].value === "string" && (entry[1] === null || entry[1] && typeof entry[1].value === "string")).map((entry) => {
			let prefix = entry[0].value;
			let delimiter = entry[1] === null ? null : entry[1].value;
			if (delimiter && prefix && prefix.charAt(prefix.length - 1) !== delimiter) prefix += delimiter;
			return {
				prefix,
				delimiter
			};
		});
	}
}));
//#endregion
//#region node_modules/imapflow/lib/commands/login.js
var require_login = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { getStatusCode, getErrorText } = require_tools();
	/**
	* Authenticates user using the IMAP LOGIN command.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} username - The username to authenticate with
	* @param {string} password - The password to authenticate with
	* @returns {Promise<string|undefined>} The authenticated username, or undefined if already authenticated
	* @throws {Error} If authentication fails, with authenticationFailed and serverResponseCode properties set
	*/
	module.exports = async (connection, username, password) => {
		if (connection.state !== connection.states.NOT_AUTHENTICATED) return;
		try {
			(await connection.exec("LOGIN", [{
				type: "STRING",
				value: username
			}, {
				type: "STRING",
				value: password,
				sensitive: true
			}])).next();
			connection.authCapabilities.set("LOGIN", true);
			return username;
		} catch (err) {
			let errorCode = getStatusCode(err.response);
			if (errorCode) err.serverResponseCode = errorCode;
			err.authenticationFailed = true;
			err.response = await getErrorText(err.response);
			throw err;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/logout.js
var require_logout = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Logs out the user and closes the connection.
	*
	* @param {Object} connection - IMAP connection instance
	* @returns {Promise<boolean>} True if logout command succeeded, false otherwise
	*/
	module.exports = async (connection) => {
		if (connection.state === connection.states.LOGOUT) return false;
		if (connection.state === connection.states.NOT_AUTHENTICATED) {
			connection.state = connection.states.LOGOUT;
			connection.close();
			return false;
		}
		let response;
		try {
			response = await connection.exec("LOGOUT");
			return true;
		} catch (err) {
			if (err.code === "NoConnection") return true;
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		} finally {
			connection.state = connection.states.LOGOUT;
			if (response && typeof response.next === "function") response.next();
			connection.close();
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/starttls.js
var require_starttls = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Initiates STARTTLS connection upgrade.
	*
	* @param {Object} connection - IMAP connection instance
	* @returns {Promise<boolean>} True if STARTTLS was initiated, false if not supported or already secure
	*/
	module.exports = async (connection) => {
		if (!connection.capabilities.has("STARTTLS") || connection.secureConnection) return false;
		let response;
		try {
			response = await connection.exec("STARTTLS");
			connection._starttlsHadTrailingData = !!(response && response.hasTrailingData);
			response.next();
			return true;
		} catch (err) {
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/special-use.js
var require_special_use = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		flags: [
			"\\All",
			"\\Archive",
			"\\Drafts",
			"\\Flagged",
			"\\Junk",
			"\\Sent",
			"\\Trash"
		],
		names: {
			"\\Sent": [
				"aika",
				"bidaliak",
				"bidalita",
				"dihantar",
				"e rometsweng",
				"e tindami",
				"elküldött",
				"elküldöttek",
				"elementos enviados",
				"éléments envoyés",
				"enviadas",
				"enviadas",
				"enviados",
				"enviats",
				"envoyés",
				"ethunyelweyo",
				"expediate",
				"ezipuru",
				"gesendete",
				"gesendete elemente",
				"gestuur",
				"gönderilmiş öğeler",
				"göndərilənlər",
				"iberilen",
				"inviati",
				"išsiųstieji",
				"kuthunyelwe",
				"lasa",
				"lähetetyt",
				"messages envoyés",
				"naipadala",
				"nalefa",
				"napadala",
				"nosūtītās ziņas",
				"odeslané",
				"odeslaná pošta",
				"padala",
				"poslane",
				"poslano",
				"poslano",
				"poslané",
				"poslato",
				"saadetud",
				"saadetud kirjad",
				"saadetud üksused",
				"sendt",
				"sendt",
				"sent",
				"sent items",
				"sent messages",
				"sända poster",
				"sänt",
				"terkirim",
				"ti fi ranṣẹ",
				"të dërguara",
				"verzonden",
				"vilivyotumwa",
				"wysłane",
				"đã gửi",
				"σταλθέντα",
				"жиберилген",
				"жіберілгендер",
				"изпратени",
				"илгээсэн",
				"ирсол шуд",
				"испратено",
				"надіслані",
				"отправленные",
				"пасланыя",
				"юборилган",
				"ուղարկված",
				"נשלחו",
				"פריטים שנשלחו",
				"المرسلة",
				"بھیجے گئے",
				"سوزمژہ",
				"لېګل شوی",
				"موارد ارسال شده",
				"पाठविले",
				"पाठविलेले",
				"प्रेषित",
				"भेजा गया",
				"প্রেরিত",
				"প্রেরিত",
				"প্ৰেৰিত",
				"ਭੇਜੇ",
				"મોકલેલા",
				"ପଠାଗଲା",
				"அனுப்பியவை",
				"పంపించబడింది",
				"ಕಳುಹಿಸಲಾದ",
				"അയച്ചു",
				"යැවු පණිවුඩ",
				"ส่งแล้ว",
				"გაგზავნილი",
				"የተላኩ",
				"បាន​ផ្ញើ",
				"寄件備份",
				"寄件備份",
				"已发信息",
				"送信済みﾒｰﾙ",
				"발신 메시지",
				"보낸 편지함"
			],
			"\\Trash": [
				"articole șterse",
				"bin",
				"borttagna objekt",
				"deleted",
				"deleted items",
				"deleted messages",
				"elementi eliminati",
				"elementos borrados",
				"elementos eliminados",
				"gelöschte objekte",
				"gelöschte elemente",
				"item dipadam",
				"itens apagados",
				"itens excluídos",
				"kustutatud üksused",
				"mục đã xóa",
				"odstraněné položky",
				"odstraněná pošta",
				"pesan terhapus",
				"poistetut",
				"praht",
				"prügikast",
				"silinmiş öğeler",
				"slettede beskeder",
				"slettede elementer",
				"trash",
				"törölt elemek",
				"törölt",
				"usunięte wiadomości",
				"verwijderde items",
				"vymazané správy",
				"éléments supprimés",
				"видалені",
				"жойылғандар",
				"удаленные",
				"פריטים שנמחקו",
				"العناصر المحذوفة",
				"موارد حذف شده",
				"รายการที่ลบ",
				"已删除邮件",
				"已刪除項目",
				"已刪除項目"
			],
			"\\Junk": [
				"bulk mail",
				"correo no deseado",
				"courrier indésirable",
				"istenmeyen",
				"istenmeyen e-posta",
				"junk",
				"junk e-mail",
				"junk email",
				"junk-e-mail",
				"levélszemét",
				"nevyžiadaná pošta",
				"nevyžádaná pošta",
				"no deseado",
				"posta indesiderata",
				"pourriel",
				"roskaposti",
				"rämpspost",
				"skräppost",
				"spam",
				"spam",
				"spamowanie",
				"søppelpost",
				"thư rác",
				"wiadomości-śmieci",
				"спам",
				"דואר זבל",
				"الرسائل العشوائية",
				"هرزنامه",
				"สแปม",
				"垃圾郵件",
				"垃圾邮件",
				"垃圾電郵"
			],
			"\\Drafts": [
				"ba brouillon",
				"borrador",
				"borrador",
				"borradores",
				"bozze",
				"brouillons",
				"bản thảo",
				"ciorne",
				"concepten",
				"draf",
				"draft",
				"drafts",
				"drög",
				"entwürfe",
				"esborranys",
				"garalamalar",
				"ihe edeturu",
				"iidrafti",
				"izinhlaka",
				"juodraščiai",
				"kladd",
				"kladder",
				"koncepty",
				"koncepty",
				"konsep",
				"konsepte",
				"kopie robocze",
				"layihələr",
				"luonnokset",
				"melnraksti",
				"meralo",
				"mesazhe të padërguara",
				"mga draft",
				"mustandid",
				"nacrti",
				"nacrti",
				"osnutki",
				"piszkozatok",
				"rascunhos",
				"rasimu",
				"skice",
				"taslaklar",
				"tsararrun saƙonni",
				"utkast",
				"vakiraoka",
				"vázlatok",
				"zirriborroak",
				"àwọn àkọpamọ́",
				"πρόχειρα",
				"жобалар",
				"нацрти",
				"нооргууд",
				"сиёҳнавис",
				"хомаки хатлар",
				"чарнавікі",
				"чернетки",
				"чернови",
				"черновики",
				"черновиктер",
				"սևագրեր",
				"טיוטות",
				"مسودات",
				"مسودات",
				"موسودې",
				"پیش نویسها",
				"ڈرافٹ/",
				"ड्राफ़्ट",
				"प्रारूप",
				"খসড়া",
				"খসড়া",
				"ড্ৰাফ্ট",
				"ਡ੍ਰਾਫਟ",
				"ડ્રાફ્ટસ",
				"ଡ୍ରାଫ୍ଟ",
				"வரைவுகள்",
				"చిత్తు ప్రతులు",
				"ಕರಡುಗಳು",
				"കരടുകള്‍",
				"කෙටුම් පත්",
				"ฉบับร่าง",
				"მონახაზები",
				"ረቂቆች",
				"សារព្រាង",
				"下書き",
				"草稿",
				"草稿",
				"草稿",
				"임시 보관함"
			],
			"\\Archive": ["archive"]
		},
		specialUse(hasSpecialUseExtension, folder) {
			if (hasSpecialUseExtension) {
				const flag = module.exports.flags.find((flag) => folder.flags.has(flag));
				if (flag) return {
					flag,
					source: "extension"
				};
			}
			let name = folder.name.toLowerCase().replace(/\u200e/g, "").trim();
			const flag = Object.keys(module.exports.names).find((flag) => module.exports.names[flag].includes(name));
			if (flag) return {
				flag,
				source: "name"
			};
			return { flag: null };
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/list.js
var require_list = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { decodePath, encodePath, normalizePath, enhanceCommandError, hasCapability, isRev2Active, buildStatusQueryAttributes } = require_tools();
	var { specialUse } = require_special_use();
	/**
	* Lists mailboxes from the server, including subscription status and special-use flags.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} reference - Reference name (namespace prefix)
	* @param {string} mailbox - Mailbox name pattern with possible wildcards
	* @param {Object} [options] - List options
	* @param {boolean} [options.listOnly] - If true, return entries after LIST without LSUB or status queries
	* @param {Object} [options.statusQuery] - Status data items to query for each listed mailbox
	* @param {Object} [options.specialUseHints] - Hints mapping mailbox paths to special-use types (sent, junk, trash, drafts, archive)
	* @returns {Promise<Object[]>} Array of mailbox entries sorted by special-use flags and name
	* @throws {Error} If the LIST command fails
	*/
	module.exports = async (connection, reference, mailbox, options) => {
		options = options || {};
		const FLAG_SORT_ORDER = [
			"\\Inbox",
			"\\Flagged",
			"\\Sent",
			"\\Drafts",
			"\\All",
			"\\Archive",
			"\\Junk",
			"\\Trash"
		];
		const SOURCE_SORT_ORDER = [
			"user",
			"extension",
			"name"
		];
		let listCommand = connection.capabilities.has("XLIST") && !hasCapability(connection, "SPECIAL-USE") ? "XLIST" : "LIST";
		try {
			let entries;
			let statusMap;
			let specialUseMatches;
			let statusQueryAttributes = buildStatusQueryAttributes(connection, options.statusQuery);
			let supportsExtendedList = connection.capabilities.has("LIST-EXTENDED") || connection.capabilities.has("IMAP4rev2");
			let canRequestStatus = listCommand === "LIST" && !connection.skipListStatusArgs && hasCapability(connection, "LIST-STATUS") && !!statusQueryAttributes.length;
			let canRequestSubscribed = listCommand === "LIST" && !options.listOnly && !connection.skipListSubscribedArg && supportsExtendedList;
			let auxArgsAvailable = hasCapability(connection, "SPECIAL-USE") || connection.capabilities.has("CHILDREN") || supportsExtendedList;
			let stageHasAuxArgs = (stage) => (stage.status || stage.subscribed) && stage.aux !== false && !connection.skipListAuxArgs && auxArgsAvailable;
			let buildListArgs = (stage) => {
				let args = [];
				if (stage.status) args.push({
					type: "ATOM",
					value: "STATUS"
				}, statusQueryAttributes);
				if (stageHasAuxArgs(stage)) {
					if (hasCapability(connection, "SPECIAL-USE")) args.push({
						type: "ATOM",
						value: "SPECIAL-USE"
					});
					if (connection.capabilities.has("CHILDREN") || supportsExtendedList) args.push({
						type: "ATOM",
						value: "CHILDREN"
					});
				}
				if (stage.subscribed) args.push({
					type: "ATOM",
					value: "SUBSCRIBED"
				});
				return args;
			};
			let addSpecialUseMatch = (entry, type, source) => {
				if (!specialUseMatches[type]) specialUseMatches[type] = [];
				specialUseMatches[type].push({
					entry,
					source
				});
			};
			let normalizeFlags = (entry) => {
				if (entry.flags.has("\\NonExistent")) entry.flags.add("\\Noselect");
				if (entry.flags.has("\\Subscribed")) {
					entry.flags.delete("\\Subscribed");
					entry.subscribed = true;
				}
			};
			let specialUseHints = {};
			if (options.specialUseHints && typeof options.specialUseHints === "object") {
				for (let type of Object.keys(options.specialUseHints)) if ([
					"sent",
					"junk",
					"trash",
					"drafts",
					"archive"
				].includes(type) && options.specialUseHints[type] && typeof options.specialUseHints[type] === "string") specialUseHints[normalizePath(connection, options.specialUseHints[type])] = `\\${type.replace(/^./, (c) => c.toUpperCase())}`;
			}
			let runList = async (reference, mailbox, returnArgs) => {
				const cmdArgs = [encodePath(connection, reference), encodePath(connection, mailbox)];
				if (returnArgs.length) cmdArgs.push({
					type: "ATOM",
					value: "RETURN"
				}, returnArgs);
				(await connection.exec(listCommand, cmdArgs, { untagged: {
					[listCommand]: async (untagged) => {
						if (!untagged.attributes || !untagged.attributes.length) return;
						let entry = {
							path: normalizePath(connection, decodePath(connection, untagged.attributes[2] && untagged.attributes[2].value || "")),
							pathAsListed: untagged.attributes[2] && untagged.attributes[2].value || "",
							flags: new Set(untagged.attributes[0].map((entry) => entry.value)),
							delimiter: untagged.attributes[1] && untagged.attributes[1].value,
							listed: true
						};
						normalizeFlags(entry);
						if (specialUseHints[entry.path]) addSpecialUseMatch(entry, specialUseHints[entry.path], "user");
						if (listCommand === "XLIST" && entry.flags.has("\\Inbox")) {
							entry.flags.delete("\\Inbox");
							if (entry.path !== "INBOX") addSpecialUseMatch(entry, "\\Inbox", "extension");
						}
						if (entry.path.toUpperCase() === "INBOX" && !entry.flags.has("\\NonExistent")) addSpecialUseMatch(entry, "\\Inbox", "name");
						if (entry.delimiter && entry.path.charAt(0) === entry.delimiter) entry.path = entry.path.slice(1);
						entry.parentPath = entry.delimiter && entry.path ? entry.path.substr(0, entry.path.lastIndexOf(entry.delimiter)) : "";
						entry.parent = entry.delimiter ? entry.path.split(entry.delimiter) : [entry.path];
						entry.name = entry.parent.pop();
						let { flag: specialUseFlag, source: flagSource } = specialUse(connection.capabilities.has("XLIST") || hasCapability(connection, "SPECIAL-USE"), entry);
						if (specialUseFlag && (flagSource !== "name" || !entry.flags.has("\\NonExistent"))) addSpecialUseMatch(entry, specialUseFlag, flagSource);
						entries.push(entry);
					},
					STATUS: async (untagged) => {
						let statusPath = normalizePath(connection, decodePath(connection, untagged.attributes[0] && untagged.attributes[0].value || ""));
						let statusList = untagged.attributes && Array.isArray(untagged.attributes[1]) ? untagged.attributes[1] : false;
						if (!statusList || !statusPath) return;
						const STATUS_FIELD_MAP = {
							MESSAGES: {
								key: "messages",
								parser: Number
							},
							RECENT: {
								key: "recent",
								parser: Number
							},
							UIDNEXT: {
								key: "uidNext",
								parser: Number
							},
							UIDVALIDITY: {
								key: "uidValidity",
								parser: BigInt
							},
							UNSEEN: {
								key: "unseen",
								parser: Number
							},
							HIGHESTMODSEQ: {
								key: "highestModseq",
								parser: BigInt
							}
						};
						let key;
						let map = { path: statusPath };
						statusList.forEach((entry, i) => {
							if (i % 2 === 0) {
								key = entry && typeof entry.value === "string" ? entry.value : false;
								return;
							}
							if (!key || !entry || typeof entry.value !== "string") return;
							const fieldConfig = STATUS_FIELD_MAP[key.toUpperCase()];
							if (!fieldConfig) return;
							const value = !isNaN(entry.value) ? fieldConfig.parser(entry.value) : false;
							if (value === false) return;
							map[fieldConfig.key] = value;
						});
						statusMap.set(statusPath, map);
					}
				} })).next();
			};
			let normalizedReference = normalizePath(connection, reference || "");
			let normalizedMailbox = normalizePath(connection, mailbox || "", true);
			let stages = [];
			if (canRequestStatus && canRequestSubscribed) stages.push({
				status: true,
				subscribed: true
			});
			if (canRequestStatus) stages.push({
				status: true,
				subscribed: false
			});
			else if (canRequestSubscribed) stages.push({
				status: false,
				subscribed: true
			});
			stages.push({
				status: false,
				subscribed: false
			});
			let isRejectedCommand = (err) => err.responseStatus === "BAD" && err.code !== "ETHROTTLE";
			let successStage = null;
			let lastRejectedStage = null;
			let auxRetryInserted = false;
			for (let i = 0; i < stages.length; i++) {
				let stage = stages[i];
				let stageArgs = buildListArgs(stage);
				entries = [];
				statusMap = /* @__PURE__ */ new Map();
				specialUseMatches = {};
				try {
					await runList(normalizedReference, normalizedMailbox, stageArgs);
					if (lastRejectedStage) {
						if (lastRejectedStage.subscribed && !stage.subscribed) connection.skipListSubscribedArg = true;
						if (lastRejectedStage.status && !stage.status) connection.skipListStatusArgs = true;
						if (stageHasAuxArgs(lastRejectedStage) && stage.aux === false && lastRejectedStage.status === stage.status && lastRejectedStage.subscribed === stage.subscribed) connection.skipListAuxArgs = true;
					}
					successStage = stage;
					break;
				} catch (err) {
					if (i === stages.length - 1 || !isRejectedCommand(err)) throw err;
					lastRejectedStage = stage;
					if (!auxRetryInserted && stageHasAuxArgs(stage)) {
						stages.splice(i + 1, 0, {
							...stage,
							aux: false
						});
						auxRetryInserted = true;
					}
					connection.log.warn({
						msg: "LIST RETURN options rejected, retrying with reduced options",
						err,
						cid: connection.id
					});
				}
			}
			if (options.listOnly) return entries;
			if (normalizedReference && !specialUseMatches["\\Inbox"]) {
				let returnArgs = buildListArgs(successStage);
				let entryCountBefore = entries.length;
				let specialUseCountsBefore = {};
				for (let type of Object.keys(specialUseMatches)) specialUseCountsBefore[type] = specialUseMatches[type].length;
				try {
					await runList("", "INBOX", returnArgs);
				} catch (err) {
					if (!returnArgs.length || !isRejectedCommand(err)) throw err;
					entries.length = entryCountBefore;
					for (let type of Object.keys(specialUseMatches)) if (!(type in specialUseCountsBefore)) delete specialUseMatches[type];
					else specialUseMatches[type].length = specialUseCountsBefore[type];
					connection.log.warn({
						msg: "INBOX LIST with RETURN options failed, retrying plain",
						err,
						cid: connection.id
					});
					await runList("", "INBOX", []);
				}
			}
			if (options.statusQuery) {
				let syntheticRecent = options.statusQuery.recent && isRev2Active(connection);
				for (let entry of entries) if (!entry.flags.has("\\Noselect") && !entry.flags.has("\\NonExistent")) {
					if (statusMap.has(entry.path)) {
						entry.status = statusMap.get(entry.path);
						if (syntheticRecent) entry.status.recent = 0;
					} else if (!statusMap.size) try {
						entry.status = await connection.run("STATUS", entry.path, options.statusQuery);
					} catch (err) {
						entry.status = { error: err };
					}
				}
			}
			let runLsub = async () => {
				(await connection.exec("LSUB", [encodePath(connection, normalizedReference), encodePath(connection, normalizedMailbox)], { untagged: { LSUB: async (untagged) => {
					if (!untagged.attributes || !untagged.attributes.length) return;
					let entry = {
						path: normalizePath(connection, decodePath(connection, untagged.attributes[2] && untagged.attributes[2].value || "")),
						pathAsListed: untagged.attributes[2] && untagged.attributes[2].value || "",
						flags: new Set(untagged.attributes[0].map((entry) => entry.value)),
						delimiter: untagged.attributes[1] && untagged.attributes[1].value,
						subscribed: true
					};
					if (entry.path.toUpperCase() === "INBOX") addSpecialUseMatch(entry, "\\Inbox", "name");
					if (entry.delimiter && entry.path.charAt(0) === entry.delimiter) entry.path = entry.path.slice(1);
					entry.parentPath = entry.delimiter && entry.path ? entry.path.substr(0, entry.path.lastIndexOf(entry.delimiter)) : "";
					entry.parent = entry.delimiter ? entry.path.split(entry.delimiter) : [entry.path];
					entry.name = entry.parent.pop();
					let existing = entries.find((existing) => existing.path === entry.path);
					if (existing) {
						existing.subscribed = true;
						entry.flags.forEach((flag) => existing.flags.add(flag));
						normalizeFlags(existing);
					}
				} } })).next();
			};
			if ((!successStage.subscribed || !isRev2Active(connection) && !entries.some((entry) => entry.subscribed)) && !connection.skipLsub) try {
				await runLsub();
			} catch (err) {
				if (isRejectedCommand(err)) connection.skipLsub = true;
				else if (err.responseStatus !== "NO" || err.code === "ETHROTTLE") throw err;
				connection.log.warn({
					msg: "Failed to request subscription info",
					err,
					cid: connection.id
				});
			}
			for (let type of Object.keys(specialUseMatches)) {
				let sortedEntries = specialUseMatches[type].sort((a, b) => {
					let aSource = SOURCE_SORT_ORDER.indexOf(a.source);
					let bSource = SOURCE_SORT_ORDER.indexOf(b.source);
					if (aSource === bSource) return a.entry.path.localeCompare(b.entry.path);
					return aSource - bSource;
				});
				if (!sortedEntries[0].entry.specialUse) {
					sortedEntries[0].entry.specialUse = type;
					sortedEntries[0].entry.specialUseSource = sortedEntries[0].source;
				}
			}
			let inboxEntry = entries.find((entry) => entry.specialUse === "\\Inbox");
			if (inboxEntry && !inboxEntry.subscribed) inboxEntry.subscribed = true;
			return entries.sort((a, b) => {
				if (a.specialUse && !b.specialUse) return -1;
				if (!a.specialUse && b.specialUse) return 1;
				if (a.specialUse && b.specialUse) return FLAG_SORT_ORDER.indexOf(a.specialUse) - FLAG_SORT_ORDER.indexOf(b.specialUse);
				let aList = [].concat(a.parent).concat(a.name);
				let bList = [].concat(b.parent).concat(b.name);
				for (let i = 0; i < aList.length; i++) {
					let aPart = aList[i];
					let bPart = bList[i];
					if (aPart !== bPart) return aPart.localeCompare(bPart || "");
				}
				return a.path.localeCompare(b.path);
			});
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				msg: "Failed to list folders",
				err,
				cid: connection.id
			});
			throw err;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/enable.js
var require_enable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { hasCapability } = require_tools();
	/**
	* Enables IMAP extensions on the server.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string[]} extensionList - List of extension names to enable
	* @returns {Promise<Set|boolean|undefined>} Set of enabled extensions, false on failure, or undefined if not applicable
	*/
	module.exports = async (connection, extensionList) => {
		if (!hasCapability(connection, "ENABLE") || connection.state !== connection.states.AUTHENTICATED) return;
		let advertised = new Set([...connection.capabilities.keys()].map((capability) => capability.toUpperCase()));
		extensionList = extensionList.filter((extension) => advertised.has(extension.toUpperCase()));
		if (!extensionList.length) return;
		let response;
		try {
			let enabled = /* @__PURE__ */ new Set();
			response = await connection.exec("ENABLE", extensionList.map((extension) => ({
				type: "ATOM",
				value: extension.toUpperCase()
			})), { untagged: { ENABLED: async (untagged) => {
				if (!untagged.attributes || !untagged.attributes.length) return;
				untagged.attributes.forEach((attr) => {
					if (attr.value && typeof attr.value === "string") enabled.add(attr.value.toUpperCase().trim());
				});
			} } });
			connection.enabled = /* @__PURE__ */ new Set([...connection.enabled, ...enabled]);
			response.next();
			return connection.enabled;
		} catch (err) {
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/select.js
var require_select = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { encodePath, normalizePath, enhanceCommandError } = require_tools();
	/**
	* Selects or examines a mailbox, making it the current mailbox for subsequent operations.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} path - Mailbox path to select
	* @param {Object} [options] - Select options
	* @param {boolean} [options.readOnly] - If true, use EXAMINE instead of SELECT (read-only access)
	* @param {string} [options.changedSince] - QRESYNC modseq value to fetch changes since
	* @param {BigInt} [options.uidValidity] - QRESYNC UID validity value
	* @returns {Promise<Object|undefined>} Mailbox info object with path, flags, exists, uidNext, uidValidity, highestModseq, etc., or undefined if preconditions not met
	* @throws {Error} If the SELECT/EXAMINE command fails
	*/
	module.exports = async (connection, path, options) => {
		if (![connection.states.AUTHENTICATED, connection.states.SELECTED].includes(connection.state)) return;
		options = options || {};
		path = normalizePath(connection, path);
		if (!connection.folders.has(path)) {
			let folders = await connection.run("LIST", "", path);
			if (!folders) throw new Error("Failed to fetch folders");
			folders.forEach((folder) => {
				connection.folders.set(folder.path, folder);
			});
		}
		let folderListData = connection.folders.has(path) ? connection.folders.get(path) : false;
		let response;
		try {
			let map = { path };
			if (folderListData) [
				"delimiter",
				"specialUse",
				"subscribed",
				"listed"
			].forEach((key) => {
				if (folderListData[key]) map[key] = folderListData[key];
			});
			let extraArgs = [];
			if (connection.enabled.has("QRESYNC") && options.changedSince && options.uidValidity) {
				extraArgs.push([{
					type: "ATOM",
					value: "QRESYNC"
				}, [{
					type: "ATOM",
					value: options.uidValidity?.toString()
				}, {
					type: "ATOM",
					value: options.changedSince.toString()
				}]]);
				map.qresync = true;
			}
			let encodedPath = encodePath(connection, path);
			let selectCommand = {
				command: !options.readOnly ? "SELECT" : "EXAMINE",
				/* c8 ignore next */ arguments: [{
					type: encodedPath.indexOf("&") >= 0 ? "STRING" : "ATOM",
					value: encodedPath
				}].concat(extraArgs || [])
			};
			response = await connection.exec(selectCommand.command, selectCommand.arguments, { untagged: {
				OK: async (untagged) => {
					if (!untagged.attributes || !untagged.attributes.length) return;
					let section = !untagged.attributes[0].value && untagged.attributes[0].section;
					if (section && section.length > 1 && section[0].type === "ATOM" && typeof section[0].value === "string") {
						let key = section[0].value.toLowerCase();
						let value;
						if (typeof section[1].value === "string") value = section[1].value;
						else if (Array.isArray(section[1])) value = section[1].map((entry) => typeof entry.value === "string" ? entry.value : false).filter((entry) => entry);
						switch (key) {
							case "highestmodseq":
								key = "highestModseq";
								if (/^[0-9]+$/.test(value)) value = BigInt(value);
								break;
							case "mailboxid":
								key = "mailboxId";
								if (Array.isArray(value) && value.length) value = value[0];
								break;
							case "permanentflags":
								key = "permanentFlags";
								value = new Set(value);
								break;
							case "uidnext":
								key = "uidNext";
								value = Number(value);
								break;
							case "uidvalidity":
								key = "uidValidity";
								if (/^[0-9]+$/.test(value)) value = BigInt(value);
								break;
						}
						map[key] = value;
					}
					if (section && section.length === 1 && section[0].type === "ATOM" && typeof section[0].value === "string") {
						let key = section[0].value.toLowerCase();
						switch (key) {
							case "nomodseq":
								key = "noModseq";
								map[key] = true;
								break;
						}
					}
				},
				FLAGS: async (untagged) => {
					if (!untagged.attributes || !untagged.attributes.length || !Array.isArray(untagged.attributes[0])) return;
					let flags = untagged.attributes[0].map((flag) => typeof flag.value === "string" ? flag.value : false).filter((flag) => flag);
					map.flags = new Set(flags);
				},
				EXISTS: async (untagged) => {
					let num = Number(untagged.command);
					if (isNaN(num)) return false;
					map.exists = num;
				},
				VANISHED: async (untagged) => {
					await connection.untaggedVanished(untagged, {
						path,
						uidNext: false,
						uidValidity: false
					});
				},
				FETCH: async (untagged) => {
					await connection.untaggedFetch(untagged, {
						path,
						uidNext: false,
						uidValidity: false
					});
				}
			} });
			let section = !response.response.attributes[0].value && response.response.attributes[0].section;
			if (section && section.length && section[0].type === "ATOM" && typeof section[0].value === "string") map.readOnly = section[0].value.toUpperCase() === "READ-ONLY";
			if (map.qresync && (options.uidValidity !== map.uidValidity || !map.highestModseq || map.noModseq)) map.qresync = false;
			let currentMailbox = connection.mailbox;
			connection.mailbox = false;
			if (currentMailbox && currentMailbox.path !== path) connection.emit("mailboxClose", currentMailbox);
			connection.mailbox = map;
			connection.currentSelectCommand = selectCommand;
			connection.state = connection.states.SELECTED;
			if (!currentMailbox || currentMailbox.path !== path) connection.emit("mailboxOpen", connection.mailbox);
			response.next();
			return map;
		} catch (err) {
			await enhanceCommandError(err);
			if (connection.state === connection.states.SELECTED) {
				let currentMailbox = connection.mailbox;
				connection.mailbox = false;
				connection.currentSelectCommand = false;
				connection.state = connection.states.AUTHENTICATED;
				if (currentMailbox) connection.emit("mailboxClose", currentMailbox);
			}
			connection.log.warn({
				err,
				cid: connection.id
			});
			throw err;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/fetch.js
var require_fetch = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { formatMessageResponse } = require_tools();
	/**
	* Fetches emails from the server.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} range - Message sequence number or UID range
	* @param {Object} query - Fetch query specifying which data to retrieve (e.g., flags, envelope, bodyStructure, headers, source, bodyParts)
	* @param {Object} [options] - Fetch options
	* @param {boolean} [options.uid] - If true, use UID FETCH instead of FETCH
	* @param {boolean} [options.binary] - If true, use BINARY fetch when available
	* @param {string} [options.changedSince] - Only fetch messages changed since this modseq value
	* @param {Function} [options.onUntaggedFetch] - Callback for processing each fetched message individually
	* @returns {Promise<{count: number, list: Object[]}|undefined>} Object with message count and list, or undefined if not in SELECTED state
	*/
	module.exports = async (connection, range, query, options) => {
		if (connection.state !== connection.states.SELECTED || !range) return;
		options = options || {};
		let mailbox = connection.mailbox;
		const commandKey = connection.capabilities.has("BINARY") && options.binary && !connection.disableBinary ? "BINARY" : "BODY";
		let retryCount = 0;
		const maxRetries = 4;
		const baseDelay = 1e3;
		while (retryCount < maxRetries) {
			let messages = {
				count: 0,
				list: []
			};
			let response;
			try {
				/* c8 ignore next */ let attributes = [{
					type: "SEQUENCE",
					value: (range || "*").toString()
				}];
				let queryStructure = [];
				let setBodyPeek = (attributes, partial) => {
					let bodyPeek = {
						type: "ATOM",
						value: `${commandKey}.PEEK`,
						section: [],
						partial
					};
					if (Array.isArray(attributes)) attributes.forEach((attribute) => {
						bodyPeek.section.push(attribute);
					});
					else if (attributes) bodyPeek.section.push(attributes);
					queryStructure.push(bodyPeek);
				};
				[
					"all",
					"fast",
					"full",
					"uid",
					"flags",
					"bodyStructure",
					"envelope",
					"internalDate"
				].forEach((key) => {
					if (query[key]) queryStructure.push({
						type: "ATOM",
						value: key.toUpperCase()
					});
				});
				if (query.size) queryStructure.push({
					type: "ATOM",
					value: "RFC822.SIZE"
				});
				if (query.source) {
					let partial;
					if (typeof query.source === "object" && (query.source.start || query.source.maxLength)) {
						partial = [Number(query.source.start) || 0];
						if (query.source.maxLength && !isNaN(query.source.maxLength)) partial.push(Number(query.source.maxLength));
					}
					queryStructure.push({
						type: "ATOM",
						value: `${commandKey}.PEEK`,
						section: [],
						partial
					});
				}
				if (connection.capabilities.has("OBJECTID")) queryStructure.push({
					type: "ATOM",
					value: "EMAILID"
				});
				else if (connection.capabilities.has("X-GM-EXT-1")) queryStructure.push({
					type: "ATOM",
					value: "X-GM-MSGID"
				});
				if (query.threadId) {
					if (connection.capabilities.has("OBJECTID")) queryStructure.push({
						type: "ATOM",
						value: "THREADID"
					});
					else if (connection.capabilities.has("X-GM-EXT-1")) queryStructure.push({
						type: "ATOM",
						value: "X-GM-THRID"
					});
				}
				if (query.labels) {
					if (connection.capabilities.has("X-GM-EXT-1")) queryStructure.push({
						type: "ATOM",
						value: "X-GM-LABELS"
					});
				}
				if (connection.enabled.has("CONDSTORE") && !mailbox.noModseq) queryStructure.push({
					type: "ATOM",
					value: "MODSEQ"
				});
				if (!query.uid) queryStructure.push({
					type: "ATOM",
					value: "UID"
				});
				if (query.headers) if (Array.isArray(query.headers)) setBodyPeek([{
					type: "ATOM",
					value: "HEADER.FIELDS"
				}, query.headers.map((header) => ({
					type: "ATOM",
					value: header
				}))]);
				else setBodyPeek({
					type: "ATOM",
					value: "HEADER"
				});
				if (query.bodyParts && query.bodyParts.length) query.bodyParts.forEach((part) => {
					if (!part) return;
					let key;
					let partial;
					if (typeof part === "object") {
						if (!part.key || typeof part.key !== "string") return;
						key = part.key.toUpperCase();
						if (part.start || part.maxLength) {
							partial = [Number(part.start) || 0];
							if (part.maxLength && !isNaN(part.maxLength)) partial.push(Number(part.maxLength));
						}
					} else if (typeof part === "string") key = part.toUpperCase();
					else return;
					setBodyPeek({
						type: "ATOM",
						value: key
					}, partial);
				});
				if (queryStructure.length === 1) queryStructure = queryStructure.pop();
				attributes.push(queryStructure);
				if (options.changedSince && connection.enabled.has("CONDSTORE") && !mailbox.noModseq) {
					let changedSinceArgs = [{
						type: "ATOM",
						value: "CHANGEDSINCE"
					}, {
						type: "ATOM",
						value: options.changedSince.toString()
					}];
					if (options.uid && connection.enabled.has("QRESYNC")) changedSinceArgs.push({
						type: "ATOM",
						value: "VANISHED"
					});
					attributes.push(changedSinceArgs);
				}
				response = await connection.exec(options.uid ? "UID FETCH" : "FETCH", attributes, { untagged: { FETCH: async (untagged) => {
					messages.count++;
					let formatted = await formatMessageResponse(untagged, mailbox);
					if (typeof options.onUntaggedFetch === "function") await new Promise((resolve, reject) => {
						options.onUntaggedFetch(formatted, (err) => {
							if (err) reject(err);
							else resolve();
						});
					});
					else messages.list.push(formatted);
				} } });
				response.next();
				return messages;
			} catch (err) {
				if (err.code === "ETHROTTLE") {
					const backoffDelay = Math.min(baseDelay * Math.pow(2, retryCount), 3e4);
					const delay = err.throttleReset && err.throttleReset > backoffDelay ? err.throttleReset : backoffDelay;
					connection.log.warn({
						msg: "Retrying throttled request with exponential backoff",
						cid: connection.id,
						code: err.code,
						response: err.responseText,
						throttleReset: err.throttleReset,
						retryCount,
						delayMs: delay
					});
					await new Promise((resolve) => setTimeout(resolve, delay));
					retryCount++;
					continue;
				}
				connection.log.warn({
					err,
					cid: connection.id
				});
				throw err;
			}
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/create.js
var require_create = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { encodePath, normalizePath, getStatusCode, enhanceCommandError } = require_tools();
	/**
	* Creates a new mailbox and subscribes to it.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} path - Mailbox path to create
	* @returns {Promise<{path: string, created: boolean, mailboxId?: string}|undefined>} Object with path and creation status, or undefined if preconditions not met
	* @throws {Error} If the CREATE command fails (except when mailbox already exists)
	*/
	module.exports = async (connection, path) => {
		if (![connection.states.AUTHENTICATED, connection.states.SELECTED].includes(connection.state)) return;
		path = normalizePath(connection, path);
		let response;
		try {
			let map = { path };
			response = await connection.exec("CREATE", [{
				type: "ATOM",
				value: encodePath(connection, path)
			}]);
			let section = response.response.attributes && response.response.attributes[0] && response.response.attributes[0].section && response.response.attributes[0].section.length ? response.response.attributes[0].section : false;
			if (section) {
				let key;
				section.forEach((attribute, i) => {
					if (i % 2 === 0) {
						key = attribute && typeof attribute.value === "string" ? attribute.value : false;
						return;
					}
					if (!key) return;
					let value;
					switch (key.toLowerCase()) {
						case "mailboxid":
							key = "mailboxId";
							value = Array.isArray(attribute) && attribute[0] && typeof attribute[0].value === "string" ? attribute[0].value : false;
							break;
					}
					if (key && value) map[key] = value;
				});
			}
			map.created = true;
			response.next();
			await connection.run("SUBSCRIBE", path);
			return map;
		} catch (err) {
			if (getStatusCode(err.response) === "ALREADYEXISTS") return {
				path,
				created: false
			};
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			throw err;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/delete.js
var require_delete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { encodePath, normalizePath, enhanceCommandError } = require_tools();
	/**
	* Deletes an existing mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} path - Mailbox path to delete
	* @returns {Promise<{path: string}|undefined>} Object with the deleted path, or undefined if preconditions not met
	* @throws {Error} If the DELETE command fails
	*/
	module.exports = async (connection, path) => {
		if (![connection.states.AUTHENTICATED, connection.states.SELECTED].includes(connection.state)) return;
		path = normalizePath(connection, path);
		if (connection.state === connection.states.SELECTED && connection.mailbox.path === path) await connection.run("CLOSE");
		let response;
		try {
			let map = { path };
			response = await connection.exec("DELETE", [{
				type: "ATOM",
				value: encodePath(connection, path)
			}]);
			response.next();
			return map;
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			throw err;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/rename.js
var require_rename = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { encodePath, normalizePath, enhanceCommandError } = require_tools();
	/**
	* Renames an existing mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} path - Current mailbox path
	* @param {string} newPath - New mailbox path
	* @returns {Promise<{path: string, newPath: string}|undefined>} Object with old and new paths, or undefined if preconditions not met
	* @throws {Error} If the RENAME command fails
	*/
	module.exports = async (connection, path, newPath) => {
		if (![connection.states.AUTHENTICATED, connection.states.SELECTED].includes(connection.state)) return;
		path = normalizePath(connection, path);
		newPath = normalizePath(connection, newPath);
		if (connection.state === connection.states.SELECTED && connection.mailbox.path === path) await connection.run("CLOSE");
		let response;
		try {
			let map = {
				path,
				newPath
			};
			response = await connection.exec("RENAME", [{
				type: "ATOM",
				value: encodePath(connection, path)
			}, {
				type: "ATOM",
				value: encodePath(connection, newPath)
			}]);
			response.next();
			return map;
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			throw err;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/close.js
var require_close = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Closes the currently selected mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @returns {Promise<boolean|undefined>} True on success, false on failure, or undefined if not in SELECTED state
	*/
	module.exports = async (connection) => {
		if (connection.state !== connection.states.SELECTED) return;
		let response;
		try {
			response = await connection.exec("CLOSE");
			response.next();
			let currentMailbox = connection.mailbox;
			connection.mailbox = false;
			connection.currentSelectCommand = false;
			connection.state = connection.states.AUTHENTICATED;
			if (currentMailbox) connection.emit("mailboxClose", currentMailbox);
			return true;
		} catch (err) {
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/subscribe.js
var require_subscribe = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { encodePath, normalizePath, enhanceCommandError } = require_tools();
	/**
	* Subscribes to a mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} path - Mailbox path to subscribe to
	* @returns {Promise<boolean|undefined>} True on success, false on failure, or undefined if preconditions not met
	*/
	module.exports = async (connection, path) => {
		if (![connection.states.AUTHENTICATED, connection.states.SELECTED].includes(connection.state)) return;
		path = normalizePath(connection, path);
		let response;
		try {
			response = await connection.exec("SUBSCRIBE", [{
				type: "ATOM",
				value: encodePath(connection, path)
			}]);
			response.next();
			return true;
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/unsubscribe.js
var require_unsubscribe = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { encodePath, normalizePath, enhanceCommandError } = require_tools();
	/**
	* Unsubscribes from a mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} path - Mailbox path to unsubscribe from
	* @returns {Promise<boolean|undefined>} True on success, false on failure, or undefined if preconditions not met
	*/
	module.exports = async (connection, path) => {
		if (![connection.states.AUTHENTICATED, connection.states.SELECTED].includes(connection.state)) return;
		path = normalizePath(connection, path);
		let response;
		try {
			response = await connection.exec("UNSUBSCRIBE", [{
				type: "ATOM",
				value: encodePath(connection, path)
			}]);
			response.next();
			return true;
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/store.js
var require_store = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { formatFlag, canUseFlag, enhanceCommandError } = require_tools();
	/**
	* Updates flags or labels for messages in the selected mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} range - Message sequence number or UID range
	* @param {string|string[]} flags - Flag(s) to set, add, or remove
	* @param {Object} options - Store options
	* @param {boolean} [options.uid] - If true, use UID STORE instead of STORE
	* @param {boolean} [options.useLabels] - If true, operate on Gmail labels instead of flags
	* @param {boolean} [options.silent] - If true, use .SILENT variant to suppress server response
	* @param {string} [options.operation] - Operation type: 'set', 'add', or 'remove'
	* @param {string} [options.unchangedSince] - Only update messages not changed since this modseq value
	* @returns {Promise<boolean>} True on success, false on failure or if nothing to do
	*/
	module.exports = async (connection, range, flags, options) => {
		if (connection.state !== connection.states.SELECTED || !range || options.useLabels && !connection.capabilities.has("X-GM-EXT-1")) return false;
		/* c8 ignore next */ options = options || {};
		let operation = "FLAGS";
		if (options.useLabels) operation = "X-GM-LABELS";
		else if (options.silent) operation = `${operation}.SILENT`;
		switch ((options.operation || "").toLowerCase()) {
			case "set": break;
			case "remove":
				operation = `-${operation}`;
				break;
			default:
				operation = `+${operation}`;
				break;
		}
		flags = (Array.isArray(flags) ? flags : [].concat(flags || [])).map((flag) => {
			flag = formatFlag(flag);
			if (!canUseFlag(connection.mailbox, flag) && options.operation !== "remove") return false;
			return flag;
		}).filter((flag) => flag);
		if (!flags.length && options.operation !== "set") return false;
		let attributes = [
			{
				type: "SEQUENCE",
				value: range
			},
			{
				type: "ATOM",
				value: operation
			},
			flags.map((flag) => ({
				type: "ATOM",
				value: flag
			}))
		];
		if (options.unchangedSince && connection.enabled.has("CONDSTORE") && !connection.mailbox.noModseq) attributes.push([{
			type: "ATOM",
			value: "UNCHANGEDSINCE"
		}, {
			type: "ATOM",
			value: options.unchangedSince.toString()
		}]);
		let response;
		try {
			response = await connection.exec(options.uid ? "UID STORE" : "STORE", attributes);
			response.next();
			return true;
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/search-compiler.js
var require_search_compiler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { formatDate, formatFlag, canUseFlag, isDate, isRev2Active } = require_tools();
	/**
	* Sets a boolean flag in the IMAP search attributes.
	* Automatically handles UN- prefixing for falsy values.
	*
	* @param {Array} attributes - Array to append the attribute to
	* @param {string} term - The flag name (e.g., 'SEEN', 'DELETED')
	* @param {boolean} value - Whether to set or unset the flag
	* @example
	* setBoolOpt(attributes, 'SEEN', false) // Adds 'UNSEEN'
	* setBoolOpt(attributes, 'UNSEEN', false) // Adds 'SEEN' (removes UN prefix)
	*/
	var setBoolOpt = (attributes, term, value) => {
		if (!value) if (/^un/i.test(term)) term = term.slice(2);
		else term = "UN" + term;
		attributes.push({
			type: "ATOM",
			value: term.toUpperCase()
		});
	};
	/**
	* Adds a search option with its value(s) to the attributes array.
	* Handles NOT operations and array values.
	*
	* @param {Array} attributes - Array to append the attribute to
	* @param {string} term - The search term (e.g., 'FROM', 'SUBJECT')
	* @param {*} value - The value for the search term (string, array, or falsy for NOT)
	* @param {string} [type='ATOM'] - The attribute type
	*/
	var setOpt = (attributes, term, value, type) => {
		type = type || "ATOM";
		if (value === false || value === null) attributes.push({
			type,
			value: "NOT"
		});
		attributes.push({
			type,
			value: term.toUpperCase()
		});
		if (Array.isArray(value)) value.forEach((entry) => attributes.push({
			type,
			value: (entry || "").toString()
		}));
		else attributes.push({
			type,
			value: value.toString()
		});
	};
	/**
	* Processes date fields for IMAP search.
	* Converts JavaScript dates to IMAP date format.
	*
	* @param {Array} attributes - Array to append the attribute to
	* @param {string} term - The date search term (e.g., 'BEFORE', 'SINCE')
	* @param {*} value - Date value to format
	*/
	var processDateField = (attributes, term, value) => {
		if (["BEFORE", "SENTBEFORE"].includes(term.toUpperCase()) && isDate(value) && value.toISOString().substring(11) !== "00:00:00.000Z") value = new Date(value.getTime() + 24 * 3600 * 1e3);
		let date = formatDate(value);
		if (!date) return;
		setOpt(attributes, term, date);
	};
	var UNICODE_PATTERN = /[^\x00-\x7F]/;
	/**
	* Checks if a string contains Unicode characters.
	* Used to determine if CHARSET UTF-8 needs to be specified.
	*
	* @param {*} str - String to check
	* @returns {boolean} True if string contains non-ASCII characters
	*/
	var isUnicodeString = (str) => {
		if (!str || typeof str !== "string") return false;
		return UNICODE_PATTERN.test(str);
	};
	/**
	* Compiles a JavaScript object query into IMAP search command attributes.
	* Supports standard IMAP search criteria and extensions like OBJECTID and Gmail extensions.
	*
	* @param {Object} connection - IMAP connection object
	* @param {Map} connection.capabilities - Map of server capabilities
	* @param {Set} connection.enabled - Set of enabled extensions
	* @param {Object} connection.mailbox - Current mailbox information
	* @param {Set} connection.mailbox.flags - Available flags in the mailbox
	* @param {Object} query - Search query object
	* @returns {Array} Array of IMAP search attributes
	* @throws {Error} When required server extensions are not available
	*
	* @example
	* // Simple search for unseen messages from a sender
	* searchCompiler(connection, {
	*   unseen: true,
	*   from: 'sender@example.com'
	* });
	*
	* @example
	* // Complex OR search with date range
	* searchCompiler(connection, {
	*   or: [
	*     { from: 'alice@example.com' },
	*     { from: 'bob@example.com' }
	*   ],
	*   since: new Date('2024-01-01')
	* });
	*/
	module.exports.searchCompiler = (connection, query) => {
		const attributes = [];
		let hasUnicode = false;
		const mailbox = connection.mailbox;
		/**
		* Recursively walks through the query object and builds IMAP attributes.
		* @param {Object} params - Query parameters to process
		*/
		const walk = (params) => {
			let walkGrouped = (obj) => {
				let startIdx = attributes.length;
				walk(obj);
				let subAttrs = attributes.splice(startIdx);
				attributes.push(subAttrs);
			};
			Object.keys(params || {}).forEach((term) => {
				switch (term.toUpperCase()) {
					case "SEQ":
						{
							let value = params[term];
							if (typeof value === "number") value = value.toString();
							if (typeof value === "string" && /^\S+$/.test(value)) attributes.push({
								type: "SEQUENCE",
								value
							});
						}
						break;
					case "ANSWERED":
					case "DELETED":
					case "DRAFT":
					case "FLAGGED":
					case "SEEN":
					case "UNANSWERED":
					case "UNDELETED":
					case "UNDRAFT":
					case "UNFLAGGED":
					case "UNSEEN":
						setBoolOpt(attributes, term, !!params[term]);
						break;
					case "ALL":
						if (params[term]) setBoolOpt(attributes, term, true);
						break;
					case "NEW":
					case "OLD":
					case "RECENT":
						if (params[term]) {
							if (isRev2Active(connection)) {
								let error = /* @__PURE__ */ new Error(`The "${term.toLowerCase()}" search key does not exist in IMAP4rev2`);
								error.code = "MissingServerExtension";
								throw error;
							}
							setBoolOpt(attributes, term, true);
						}
						break;
					case "LARGER":
					case "SMALLER":
					case "MODSEQ":
						if (params[term]) setOpt(attributes, term, params[term]);
						break;
					case "BCC":
					case "BODY":
					case "CC":
					case "FROM":
					case "SUBJECT":
					case "TEXT":
					case "TO":
						if (isUnicodeString(params[term])) hasUnicode = true;
						if (params[term]) setOpt(attributes, term, params[term]);
						break;
					case "UID":
						if (params[term]) setOpt(attributes, term, params[term], "SEQUENCE");
						break;
					case "EMAILID":
						if (connection.capabilities.has("OBJECTID")) setOpt(attributes, "EMAILID", params[term]);
						else if (connection.capabilities.has("X-GM-EXT-1")) setOpt(attributes, "X-GM-MSGID", params[term]);
						break;
					case "THREADID":
						if (connection.capabilities.has("OBJECTID")) setOpt(attributes, "THREADID", params[term]);
						else if (connection.capabilities.has("X-GM-EXT-1")) setOpt(attributes, "X-GM-THRID", params[term]);
						break;
					case "GMRAW":
					case "GMAILRAW":
						if (connection.capabilities.has("X-GM-EXT-1")) {
							if (isUnicodeString(params[term])) hasUnicode = true;
							setOpt(attributes, "X-GM-RAW", params[term]);
						} else {
							let error = /* @__PURE__ */ new Error("Server does not support X-GM-EXT-1 extension required for X-GM-RAW");
							error.code = "MissingServerExtension";
							throw error;
						}
						break;
					case "LABELS": {
						let labelQuery = params[term];
						if (!labelQuery || typeof labelQuery !== "object") break;
						let formatLabel = (name) => {
							name = (name || "").toString().replace(/[\s"]+/g, " ").trim();
							return name.indexOf(" ") >= 0 ? `"${name}"` : name;
						};
						let rawParts = [];
						for (let name of [].concat(labelQuery.has || [])) if (name) rawParts.push(`label:${formatLabel(name)}`);
						for (let name of [].concat(labelQuery.not || [])) if (name) rawParts.push(`-label:${formatLabel(name)}`);
						if (!rawParts.length) break;
						if (!connection.capabilities.has("X-GM-EXT-1")) {
							let error = /* @__PURE__ */ new Error("Server does not support X-GM-EXT-1 extension required for label search");
							error.code = "MissingServerExtension";
							throw error;
						}
						let rawQuery = rawParts.join(" ");
						if (isUnicodeString(rawQuery)) hasUnicode = true;
						setOpt(attributes, "X-GM-RAW", rawQuery);
						break;
					}
					case "BEFORE":
					case "SINCE":
						if (connection.capabilities.has("WITHIN") && isDate(params[term])) {
							const withinSeconds = Math.round(Math.max(0, Date.now() - params[term].getTime()) / 1e3);
							const withinKeyword = term.toUpperCase() === "BEFORE" ? "OLDER" : "YOUNGER";
							setOpt(attributes, withinKeyword, withinSeconds.toString());
							break;
						}
						processDateField(attributes, term, params[term]);
						break;
					case "ON":
					case "SENTBEFORE":
					case "SENTON":
					case "SENTSINCE":
						processDateField(attributes, term, params[term]);
						break;
					case "KEYWORD":
					case "UNKEYWORD":
						{
							let flag = formatFlag(params[term]);
							if (canUseFlag(mailbox, flag) || mailbox.flags.has(flag)) setOpt(attributes, term, flag);
						}
						break;
					case "HEADER":
						if (params[term] && typeof params[term] === "object") Object.keys(params[term]).forEach((header) => {
							let value = params[term][header];
							if (value === true) value = "";
							if (typeof value !== "string") return;
							if (isUnicodeString(value)) hasUnicode = true;
							setOpt(attributes, term, [header.toUpperCase().trim(), value]);
						});
						break;
					case "NOT":
						if (params[term] && typeof params[term] === "object") {
							attributes.push({
								type: "ATOM",
								value: "NOT"
							});
							if (Object.keys(params[term]).length > 1) walkGrouped(params[term]);
							else walk(params[term]);
						}
						break;
					case "OR":
						{
							if (!params[term] || !Array.isArray(params[term]) || !params[term].length) break;
							if (params[term].length === 1) {
								if (typeof params[term][0] === "object" && params[term][0]) walk(params[term][0]);
								break;
							}
							/**
							* Generates a binary tree structure for OR operations.
							* IMAP OR takes exactly 2 operands, so we need to nest them.
							*
							* @param {Array} list - List of conditions to OR together
							* @returns {Array} Binary tree structure
							*/
							let genOrTree = (list) => {
								let group = false;
								let groups = [];
								list.forEach((entry, i) => {
									if (i % 2 === 0) group = [entry];
									else {
										group.push(entry);
										groups.push(group);
										group = false;
									}
								});
								if (group && group.length) {
									while (group.length === 1 && Array.isArray(group[0])) group = group[0];
									groups.push(group);
								}
								while (groups.length > 2) groups = genOrTree(groups);
								while (groups.length === 1 && Array.isArray(groups[0])) groups = groups[0];
								return groups;
							};
							/**
							* Walks the OR tree and generates IMAP commands.
							* @param {Array|Object} entry - Tree node to process
							*/
							let walkOrTree = (entry) => {
								if (Array.isArray(entry)) {
									if (entry.length > 1) attributes.push({
										type: "ATOM",
										value: "OR"
									});
									entry.forEach(walkOrTree);
									return;
								}
								if (entry && typeof entry === "object") if (Object.keys(entry).length > 1) walkGrouped(entry);
								else walk(entry);
							};
							walkOrTree(genOrTree(params[term]));
						}
						break;
				}
			});
		};
		walk(query);
		if (hasUnicode && !connection.enabled.has("UTF8=ACCEPT")) {
			attributes.unshift({
				type: "ATOM",
				value: "UTF-8"
			});
			attributes.unshift({
				type: "ATOM",
				value: "CHARSET"
			});
		}
		return attributes;
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/search.js
var require_search = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { enhanceCommandError, hasCapability, isValidSequenceValue } = require_tools();
	var { searchCompiler } = require_search_compiler();
	/**
	* Strips the leading (TAG "X") correlator list and the optional UID atom from an
	* ESEARCH untagged response, leaving only the result keyword/value pairs.
	* The IMAP parser represents parenthesized groups as plain Arrays, not objects
	* with type: 'LIST'.
	*
	* @param {Array} attrs - Raw attribute array from the IMAP parser
	* @returns {Array} Attribute array starting at the first result keyword
	*/
	var stripEsearchPrefix = (attrs) => {
		let start = 0;
		if (attrs[start] && Array.isArray(attrs[start])) start++;
		if (attrs[start] && typeof attrs[start].value === "string" && attrs[start].value.toUpperCase() === "UID") start++;
		return attrs.slice(start);
	};
	/**
	* Parses the key-value attributes from an ESEARCH untagged response.
	*
	* Receives the attribute list AFTER stripping the leading (TAG "X") list
	* and the UID atom — i.e. only the result keyword/value pairs remain.
	*
	* ALL and PARTIAL.messages are kept as compact sequence-set strings.
	* Use expandRange() from tools.js if you need to expand them.
	*
	* @param {Array} attrs - Attribute array from the IMAP parser
	* @returns {Object} ESearchResult object
	*/
	function parseEsearchResponse(attrs) {
		const result = {};
		let i = 0;
		while (i < attrs.length) {
			const token = attrs[i];
			if (!token || token.type !== "ATOM") {
				i++;
				continue;
			}
			const key = token.value.toUpperCase();
			if (i + 1 >= attrs.length) {
				i++;
				continue;
			}
			switch (key) {
				case "COUNT": {
					const n = Number(attrs[++i]?.value);
					if (!isNaN(n)) result.count = n;
					break;
				}
				case "MIN": {
					const n = Number(attrs[++i]?.value);
					if (!isNaN(n)) result.min = n;
					break;
				}
				case "MAX": {
					const n = Number(attrs[++i]?.value);
					if (!isNaN(n)) result.max = n;
					break;
				}
				case "ALL": {
					const allToken = attrs[++i];
					if (allToken && typeof allToken.value === "string") result.all = allToken.value;
					break;
				}
				case "PARTIAL": {
					const listToken = attrs[++i];
					const items = Array.isArray(listToken) ? listToken : null;
					if (!items || items.length < 2) break;
					result.partial = {
						range: items[0].value,
						messages: items[1].value
					};
					break;
				}
				default:
					i++;
					break;
			}
			i++;
		}
		return result;
	}
	/**
	* Searches for messages matching the specified criteria.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {Object|boolean} query - Search query object, or true/empty object to match all messages
	* @param {Object} [options] - Search options
	* @param {boolean} [options.uid] - If true, use UID SEARCH instead of SEARCH
	* @param {Array} [options.returnOptions] - ESEARCH RETURN options. When present AND the
	*   server advertises ESEARCH capability, triggers ESEARCH and returns an ESearchResult.
	*   Items are strings ('MIN','MAX','COUNT','ALL') or objects ({ partial: '1:100' }).
	*   When server lacks ESEARCH, falls back to plain SEARCH and returns number[].
	* @returns {Promise<number[]|Object|boolean>}
	*/
	module.exports = async (connection, query, options) => {
		if (connection.state !== connection.states.SELECTED) return false;
		options = options || {};
		let attributes;
		if (!query || query === true || typeof query === "object" && (!Object.keys(query).length || Object.keys(query).length === 1 && query.all)) attributes = [{
			type: "ATOM",
			value: "ALL"
		}];
		else if (query && typeof query === "object") attributes = searchCompiler(connection, query);
		else return false;
		if (options.returnOptions && options.returnOptions.length > 0 && hasCapability(connection, "ESEARCH")) {
			const returnItems = [];
			for (const opt of options.returnOptions) if (typeof opt === "string") returnItems.push({
				type: "ATOM",
				value: opt.toUpperCase()
			});
			else if (opt && typeof opt.partial === "string") {
				returnItems.push({
					type: "ATOM",
					value: "PARTIAL"
				});
				returnItems.push({
					type: "ATOM",
					value: opt.partial
				});
			}
			if (returnItems.length > 0) {
				const returnClause = [{
					type: "ATOM",
					value: "RETURN"
				}, returnItems];
				let esearchResult = {};
				let response;
				try {
					response = await connection.exec(options.uid ? "UID SEARCH" : "SEARCH", [...returnClause, ...attributes], { untagged: { ESEARCH: async (untagged) => {
						if (!untagged || !untagged.attributes) return;
						esearchResult = parseEsearchResponse(stripEsearchPrefix(untagged.attributes));
					} } });
					response.next();
					return esearchResult;
				} catch (err) {
					await enhanceCommandError(err);
					connection.log.warn({
						err,
						cid: connection.id
					});
					return false;
				}
			}
		}
		let results = /* @__PURE__ */ new Set();
		let response;
		try {
			response = await connection.exec(options.uid ? "UID SEARCH" : "SEARCH", attributes, { untagged: {
				SEARCH: async (untagged) => {
					if (untagged && untagged.attributes && untagged.attributes.length) untagged.attributes.forEach((attribute) => {
						if (attribute && attribute.value && typeof attribute.value === "string" && !isNaN(attribute.value)) results.add(Number(attribute.value));
					});
				},
				ESEARCH: async (untagged) => {
					if (!untagged || !untagged.attributes) return;
					let parsed = parseEsearchResponse(stripEsearchPrefix(untagged.attributes));
					if (parsed.all) {
						let existsCount = () => connection.mailbox && connection.mailbox.exists || 0;
						let overBudget = () => results.size >= existsCount();
						let resolveId = (part) => part === "*" ? options.uid ? 0 : existsCount() : Number(part);
						let truncated = false;
						let discarded = false;
						sequenceSetLoop: for (let part of parsed.all.split(",")) {
							part = part.trim();
							let colon = part.indexOf(":");
							if (colon < 0) {
								let value = resolveId(part);
								if (!isValidSequenceValue(value)) {
									discarded = true;
									continue;
								}
								if (overBudget()) {
									truncated = true;
									break;
								}
								results.add(value);
								continue;
							}
							let first = resolveId(part.substr(0, colon));
							let second = resolveId(part.substr(colon + 1));
							if (!isValidSequenceValue(first) || !isValidSequenceValue(second)) {
								discarded = true;
								continue;
							}
							for (let id = Math.min(first, second); id <= Math.max(first, second); id++) {
								if (overBudget()) {
									truncated = true;
									break sequenceSetLoop;
								}
								results.add(id);
							}
						}
						if (truncated || discarded) connection.log.warn({
							msg: "Invalid entries in the ESEARCH ALL result",
							truncated,
							discarded,
							cid: connection.id
						});
					}
				}
			} });
			response.next();
			return Array.from(results).sort((a, b) => a - b);
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
	module.exports.parseEsearchResponse = parseEsearchResponse;
}));
//#endregion
//#region node_modules/imapflow/lib/commands/noop.js
var require_noop = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Sends a NOOP command to the server.
	*
	* @param {Object} connection - IMAP connection instance
	* @returns {Promise<boolean>} True on success, false on failure
	*/
	module.exports = async (connection) => {
		try {
			(await connection.exec("NOOP", false, { comment: "Requested by command" })).next();
			return true;
		} catch (err) {
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/expunge.js
var require_expunge = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { enhanceCommandError, hasCapability } = require_tools();
	/**
	* Deletes specified messages by flagging them as Deleted and expunging.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} range - Message sequence number or UID range
	* @param {Object} [options] - Expunge options
	* @param {boolean} [options.uid] - If true, use UID EXPUNGE when UIDPLUS is available
	* @returns {Promise<boolean|undefined>} True on success, false on failure, or undefined if preconditions not met
	*/
	module.exports = async (connection, range, options) => {
		if (connection.state !== connection.states.SELECTED || !range) return;
		options = options || {};
		await connection.messageFlagsAdd(range, ["\\Deleted"], options);
		let byUid = options.uid && hasCapability(connection, "UIDPLUS");
		let command = byUid ? "UID EXPUNGE" : "EXPUNGE";
		let attributes = byUid ? [{
			type: "SEQUENCE",
			value: range
		}] : false;
		let response;
		try {
			response = await connection.exec(command, attributes);
			let section = response.response.attributes && response.response.attributes[0] && response.response.attributes[0].section;
			if ((section && section.length && section[0] && typeof section[0].value === "string" ? section[0].value : "").toUpperCase() === "HIGHESTMODSEQ") {
				let highestModseq = section[1] && typeof section[1].value === "string" && !isNaN(section[1].value) ? BigInt(section[1].value) : false;
				if (highestModseq && (!connection.mailbox.highestModseq || highestModseq > connection.mailbox.highestModseq)) connection.mailbox.highestModseq = highestModseq;
			}
			response.next();
			return true;
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/append.js
var require_append = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { formatFlag, canUseFlag, formatDateTime, normalizePath, encodePath, comparePaths, enhanceCommandError } = require_tools();
	/**
	* Appends a message to a mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} destination - Destination mailbox path
	* @param {Buffer|string} content - Message content (RFC 822 format)
	* @param {string|string[]} [flags] - Message flags to set on the appended message
	* @param {Date|string} [idate] - Internal date to set for the message
	* @returns {Promise<{destination: string, path?: string, uid?: number, uidValidity?: BigInt, seq?: number}|undefined>} Append result with UID info if available, or undefined if preconditions not met
	* @throws {Error} If the APPEND command fails or message exceeds APPENDLIMIT
	*/
	module.exports = async (connection, destination, content, flags, idate) => {
		if (![connection.states.AUTHENTICATED, connection.states.SELECTED].includes(connection.state) || !destination) return;
		if (typeof content === "string") content = Buffer.from(content);
		if (connection.capabilities.has("APPENDLIMIT")) {
			let appendLimit = connection.capabilities.get("APPENDLIMIT");
			if (typeof appendLimit === "number" && appendLimit < content.length) {
				let err = /* @__PURE__ */ new Error("Message content too big for APPENDLIMIT=" + appendLimit);
				err.serverResponseCode = "APPENDLIMIT";
				throw err;
			}
		}
		destination = normalizePath(connection, destination);
		let expectExists = comparePaths(connection, connection.mailbox.path, destination);
		flags = (Array.isArray(flags) ? flags : [].concat(flags || [])).map((flag) => flag && formatFlag(flag.toString())).filter((flag) => flag && canUseFlag(connection.mailbox, flag));
		let attributes = [{
			type: "ATOM",
			value: encodePath(connection, destination)
		}];
		idate = idate ? formatDateTime(idate) : false;
		if (flags.length || idate) attributes.push(flags.map((flag) => ({
			type: "ATOM",
			value: flag
		})));
		if (idate) attributes.push({
			type: "STRING",
			value: idate
		});
		let isLiteral8 = false;
		if (connection.capabilities.has("BINARY") && !connection.disableBinary) isLiteral8 = content.indexOf(Buffer.from([0])) >= 0;
		attributes.push({
			type: "LITERAL",
			value: content,
			isLiteral8
		});
		let map = { destination };
		if (connection.mailbox && connection.mailbox.path) map.path = connection.mailbox.path;
		const handleExistsUpdate = (untagged) => {
			map.seq = Number(untagged.command);
			if (expectExists) {
				let prevCount = connection.mailbox.exists;
				if (map.seq !== prevCount) {
					connection.mailbox.exists = map.seq;
					connection.emit("exists", {
						path: connection.mailbox.path,
						count: map.seq,
						prevCount
					});
				}
			}
		};
		let response;
		try {
			response = await connection.exec("APPEND", attributes, { untagged: expectExists ? { EXISTS: handleExistsUpdate } : false });
			let section = response.response.attributes && response.response.attributes[0] && response.response.attributes[0].section;
			if (section && section.length) {
				if ((section[0] && typeof section[0].value === "string" ? section[0].value : "").toUpperCase() === "APPENDUID") {
					let uidValidity = section[1] && typeof section[1].value === "string" && !isNaN(section[1].value) ? BigInt(section[1].value) : false;
					let uid = section[2] && typeof section[2].value === "string" && !isNaN(section[2].value) ? Number(section[2].value) : false;
					if (uidValidity !== false) map.uidValidity = uidValidity;
					if (uid) map.uid = uid;
				}
			}
			response.next();
			if (expectExists && !map.seq) try {
				response = await connection.exec("NOOP", false, {
					untagged: { EXISTS: handleExistsUpdate },
					comment: "Sequence not found from APPEND output"
				});
				response.next();
			} catch (err) {
				connection.log.warn({
					err,
					cid: connection.id
				});
			}
			if (map.seq && !map.uid) {
				let list = await connection.search({ seq: map.seq }, { uid: true });
				if (list && list.length) map.uid = list[0];
			}
			return map;
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			throw err;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/status.js
var require_status = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { encodePath, normalizePath, buildStatusQueryAttributes, isRev2Active } = require_tools();
	/**
	* Requests status information about a mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} path - Mailbox path to query
	* @param {Object} query - Status data items to request (e.g., {messages: true, uidNext: true, unseen: true})
	* @returns {Promise<{path: string, messages?: number, recent?: number, uidNext?: number, uidValidity?: BigInt, unseen?: number, highestModseq?: BigInt}|boolean>} Status information object, or false if preconditions not met or on failure
	* @throws {Error} If the mailbox does not exist
	*/
	module.exports = async (connection, path, query) => {
		if (![connection.states.AUTHENTICATED, connection.states.SELECTED].includes(connection.state) || !path) return false;
		path = normalizePath(connection, path);
		let encodedPath = encodePath(connection, path);
		let attributes = [{
			type: encodedPath.indexOf("&") >= 0 ? "STRING" : "ATOM",
			value: encodedPath
		}];
		let queryAttributes = buildStatusQueryAttributes(connection, query);
		let syntheticRecent = query && query.recent && isRev2Active(connection);
		if (!queryAttributes.length) return syntheticRecent ? {
			path,
			recent: 0
		} : false;
		attributes.push(queryAttributes);
		let response;
		try {
			let map = { path };
			response = await connection.exec("STATUS", attributes, { untagged: { STATUS: async (untagged) => {
				let updateCurrent = connection.state === connection.states.SELECTED && path === connection.mailbox.path;
				let list = untagged.attributes && Array.isArray(untagged.attributes[1]) ? untagged.attributes[1] : false;
				if (!list) return;
				const STATUS_FIELD_MAP = {
					MESSAGES: {
						key: "messages",
						parser: Number,
						updateMailbox: (val, conn) => {
							let prevCount = conn.mailbox.exists;
							if (prevCount !== val) {
								conn.mailbox.exists = val;
								conn.emit("exists", {
									path,
									count: val,
									prevCount
								});
							}
						}
					},
					RECENT: {
						key: "recent",
						parser: Number
					},
					UIDNEXT: {
						key: "uidNext",
						parser: Number,
						updateMailbox: (val, conn) => {
							conn.mailbox.uidNext = val;
						}
					},
					UIDVALIDITY: {
						key: "uidValidity",
						parser: BigInt
					},
					UNSEEN: {
						key: "unseen",
						parser: Number
					},
					HIGHESTMODSEQ: {
						key: "highestModseq",
						parser: BigInt,
						updateMailbox: (val, conn) => {
							conn.mailbox.highestModseq = val;
						}
					}
				};
				let key;
				list.forEach((entry, i) => {
					if (i % 2 === 0) {
						key = entry && typeof entry.value === "string" ? entry.value : false;
						return;
					}
					if (!key || !entry || typeof entry.value !== "string") return;
					const fieldConfig = STATUS_FIELD_MAP[key.toUpperCase()];
					if (!fieldConfig) return;
					const value = !isNaN(entry.value) ? fieldConfig.parser(entry.value) : false;
					if (value === false) return;
					map[fieldConfig.key] = value;
					if (updateCurrent && fieldConfig.updateMailbox) fieldConfig.updateMailbox(value, connection);
				});
			} } });
			response.next();
			if (syntheticRecent) map.recent = 0;
			return map;
		} catch (err) {
			if (err.responseStatus === "NO") {
				let folders = await connection.run("LIST", "", path, { listOnly: true });
				if (folders && !folders.length) {
					let error = /* @__PURE__ */ new Error(`Mailbox doesn't exist: ${path}`);
					error.code = "NotFound";
					error.response = err;
					throw error;
				}
			}
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/copyuid-parser.js
var require_copyuid_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { expandRange } = require_tools();
	/**
	* Parses COPYUID response code from an IMAP response (RFC 4315).
	* Used by both COPY and MOVE commands to extract the UID mapping
	* from source mailbox to destination mailbox.
	*
	* @param {Object} response - IMAP response object with attributes
	* @param {Object} map - Result map to populate with uidValidity and uidMap
	*/
	function parseCopyUid(response, map) {
		let section = response.attributes && response.attributes[0] && response.attributes[0].section;
		if ((section && section.length && section[0] && typeof section[0].value === "string" ? section[0].value : "") !== "COPYUID") return;
		let uidValidity = section[1] && typeof section[1].value === "string" && !isNaN(section[1].value) ? BigInt(section[1].value) : false;
		if (uidValidity !== false) map.uidValidity = uidValidity;
		let sourceUids = section[2] && typeof section[2].value === "string" ? expandRange(section[2].value) : false;
		let destinationUids = section[3] && typeof section[3].value === "string" ? expandRange(section[3].value) : false;
		if (sourceUids && destinationUids && sourceUids.length === destinationUids.length) map.uidMap = new Map(sourceUids.map((uid, i) => [uid, destinationUids[i]]));
	}
	module.exports = { parseCopyUid };
}));
//#endregion
//#region node_modules/imapflow/lib/commands/copy.js
var require_copy = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { normalizePath, encodePath, enhanceCommandError } = require_tools();
	var { parseCopyUid } = require_copyuid_parser();
	/**
	* Copies messages from the current mailbox to another mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} range - Message sequence number or UID range
	* @param {string} destination - Destination mailbox path
	* @param {Object} [options] - Copy options
	* @param {boolean} [options.uid] - If true, use UID COPY instead of COPY
	* @returns {Promise<{path: string, destination: string, uidValidity?: BigInt, uidMap?: Map}|boolean|undefined>} Copy result with UID mapping if available, false on failure, or undefined if preconditions not met
	*/
	module.exports = async (connection, range, destination, options) => {
		if (connection.state !== connection.states.SELECTED || !range || !destination) return;
		options = options || {};
		destination = normalizePath(connection, destination);
		let attributes = [{
			type: "SEQUENCE",
			value: range
		}, {
			type: "ATOM",
			value: encodePath(connection, destination)
		}];
		let response;
		try {
			response = await connection.exec(options.uid ? "UID COPY" : "COPY", attributes);
			response.next();
			let map = {
				path: connection.mailbox.path,
				destination
			};
			parseCopyUid(response.response, map);
			return map;
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/move.js
var require_move = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { normalizePath, encodePath, enhanceCommandError, hasCapability } = require_tools();
	var { parseCopyUid } = require_copyuid_parser();
	/**
	* Moves messages from the current mailbox to another mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} range - Message sequence number or UID range
	* @param {string} destination - Destination mailbox path
	* @param {Object} [options] - Move options
	* @param {boolean} [options.uid] - If true, use UID MOVE instead of MOVE
	* @returns {Promise<{path: string, destination: string, uidValidity?: BigInt, uidMap?: Map}|boolean|undefined>} Move result with UID mapping if available, false on failure, or undefined if preconditions not met
	*/
	module.exports = async (connection, range, destination, options) => {
		if (connection.state !== connection.states.SELECTED || !range || !destination) return;
		options = options || {};
		destination = normalizePath(connection, destination);
		let attributes = [{
			type: "SEQUENCE",
			value: range
		}, {
			type: "ATOM",
			value: encodePath(connection, destination)
		}];
		let map = {
			path: connection.mailbox.path,
			destination
		};
		if (!hasCapability(connection, "MOVE")) {
			let result = await connection.messageCopy(range, destination, options);
			await connection.messageDelete(range, Object.assign({ silent: true }, options));
			return result;
		}
		let response;
		try {
			response = await connection.exec(options.uid ? "UID MOVE" : "MOVE", attributes, { untagged: { OK: async (untagged) => {
				parseCopyUid(untagged, map);
			} } });
			response.next();
			parseCopyUid(response.response, map);
			return map;
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/compress.js
var require_compress = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Requests DEFLATE compression from the server.
	*
	* @param {Object} connection - IMAP connection instance
	* @returns {Promise<boolean>} True if compression was enabled, false otherwise
	*/
	module.exports = async (connection) => {
		if (!connection.capabilities.has("COMPRESS=DEFLATE") || connection._inflate) return false;
		let response;
		try {
			response = await connection.exec("COMPRESS", [{
				type: "ATOM",
				value: "DEFLATE"
			}]);
			response.next();
			return true;
		} catch (err) {
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/quota.js
var require_quota = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { encodePath, normalizePath, enhanceCommandError } = require_tools();
	/**
	* Requests quota information for a mailbox.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} path - Mailbox path to query quota for
	* @returns {Promise<{path: string, quotaRoot?: string, storage?: {usage: number, limit: number, status: string}, message?: {usage: number, limit: number, status: string}}|boolean|undefined>} Quota information object, false if QUOTA not supported or on failure, or undefined if preconditions not met
	*/
	module.exports = async (connection, path) => {
		if (![connection.states.AUTHENTICATED, connection.states.SELECTED].includes(connection.state) || !path) return;
		if (!connection.capabilities.has("QUOTA")) return false;
		path = normalizePath(connection, path);
		let map = { path };
		let processQuotaResponse = (untagged) => {
			let attributes = untagged.attributes && untagged.attributes[1];
			if (!attributes || !attributes.length) return false;
			let key = false;
			attributes.forEach((attribute, i) => {
				const position = i % 3;
				if (position === 0) {
					key = attribute && typeof attribute.value === "string" ? attribute.value.toLowerCase() : false;
					return;
				}
				if (!key) return;
				let value = attribute && typeof attribute.value === "string" && !isNaN(attribute.value) ? Number(attribute.value) : false;
				if (value === false) return;
				if (!map[key]) map[key] = {};
				const multiplier = key === "storage" ? 1024 : 1;
				if (position === 1) map[key].usage = value * multiplier;
				else if (position === 2) {
					map[key].limit = value * multiplier;
					if (map[key].limit) map[key].status = Math.round((map[key].usage || 0) / map[key].limit * 100) + "%";
				}
			});
		};
		let quotaFound = false;
		let response;
		try {
			response = await connection.exec("GETQUOTAROOT", [{
				type: "ATOM",
				value: encodePath(connection, path)
			}], { untagged: {
				QUOTAROOT: async (untagged) => {
					let quotaRoot = untagged.attributes && untagged.attributes[1] && typeof untagged.attributes[1].value === "string" ? untagged.attributes[1].value : false;
					if (quotaRoot) map.quotaRoot = quotaRoot;
				},
				QUOTA: async (untagged) => {
					quotaFound = true;
					processQuotaResponse(untagged);
				}
			} });
			response.next();
			if (map.quotaRoot && !quotaFound) response = await connection.exec("GETQUOTA", [{
				type: "ATOM",
				value: map.quotaRoot
			}], { untagged: { QUOTA: async (untagged) => {
				processQuotaResponse(untagged);
			} } });
			return map;
		} catch (err) {
			await enhanceCommandError(err);
			connection.log.warn({
				err,
				cid: connection.id
			});
			return false;
		}
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/idle.js
var require_idle = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { hasCapability } = require_tools();
	var NOOP_INTERVAL = 120 * 1e3;
	/**
	* Runs a single IDLE session on the connection.
	*
	* @param {Object} connection - IMAP connection instance
	* @returns {Promise<void|boolean>} Void on success, false on failure
	*/
	async function runIdle(connection) {
		let response;
		let preCheckWaitQueue = [];
		try {
			connection.idling = true;
			let doneRequested = false;
			let doneSent = false;
			let canEnd = false;
			let preCheck = async () => {
				doneRequested = true;
				if (canEnd && !doneSent) {
					connection.log.debug({
						src: "c",
						msg: `DONE`,
						comment: `breaking IDLE`,
						lockId: connection.currentLock?.lockId,
						path: connection.mailbox && connection.mailbox.path
					});
					connection.write("DONE");
					doneSent = true;
					connection.idling = false;
					connection.preCheck = false;
					while (preCheckWaitQueue.length) {
						let { resolve } = preCheckWaitQueue.shift();
						resolve();
					}
				}
			};
			let connectionPreCheck = () => {
				let handler = new Promise((resolve, reject) => {
					preCheckWaitQueue.push({
						resolve,
						reject
					});
				});
				connection.log.trace({
					msg: "Requesting IDLE break",
					lockId: connection.currentLock?.lockId,
					path: connection.mailbox && connection.mailbox.path,
					queued: preCheckWaitQueue.length,
					doneRequested,
					canEnd,
					doneSent
				});
				preCheck().catch((err) => connection.log.warn({
					err,
					cid: connection.id
				}));
				return handler;
			};
			connection.preCheck = connectionPreCheck;
			response = await connection.exec("IDLE", false, {
				onPlusTag: async () => {
					connection.log.debug({
						msg: `Initiated IDLE, waiting for server input`,
						lockId: connection.currentLock?.lockId,
						doneRequested
					});
					canEnd = true;
					if (doneRequested) try {
						await preCheck();
					} catch (err) {
						connection.log.warn({
							err,
							cid: connection.id
						});
					}
				},
				onSend: () => {}
			});
			if (typeof connection.preCheck === "function" && connection.preCheck === connectionPreCheck) {
				connection.log.trace({
					msg: "Clearing pre-check function",
					lockId: connection.currentLock?.lockId,
					path: connection.mailbox && connection.mailbox.path,
					queued: preCheckWaitQueue.length,
					doneRequested,
					canEnd,
					doneSent
				});
				connection.preCheck = false;
				while (preCheckWaitQueue.length) {
					let { resolve } = preCheckWaitQueue.shift();
					resolve();
				}
			}
			response.next();
			return;
		} catch (err) {
			connection.preCheck = false;
			connection.idling = false;
			connection.log.warn({
				err,
				cid: connection.id
			});
			while (preCheckWaitQueue.length) {
				let { reject } = preCheckWaitQueue.shift();
				reject(err);
			}
			return false;
		}
	}
	/**
	* Listens for changes in the selected mailbox using IDLE or NOOP polling fallback.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {number} [maxIdleTime] - Maximum time in milliseconds to stay in IDLE before restarting
	* @returns {Promise<void|boolean|undefined>} Void on success, false on failure, or undefined if not in SELECTED state
	*/
	module.exports = async (connection, maxIdleTime) => {
		if (connection.state !== connection.states.SELECTED) return;
		if (hasCapability(connection, "IDLE")) {
			let idleTimer;
			let stillIdling = false;
			let runIdleLoop = async () => {
				if (maxIdleTime) idleTimer = setTimeout(() => {
					if (connection.idling) {
						if (typeof connection.preCheck === "function") {
							stillIdling = true;
							connection.log.trace({
								msg: "Max allowed IDLE time reached",
								cid: connection.id
							});
							connection.preCheck().catch((err) => connection.log.warn({
								err,
								cid: connection.id
							}));
						}
					}
				}, maxIdleTime);
				let resp = await runIdle(connection);
				clearTimeout(idleTimer);
				if (stillIdling) {
					stillIdling = false;
					return runIdleLoop();
				}
				return resp;
			};
			return runIdleLoop();
		}
		let idleTimer;
		return new Promise((resolve) => {
			if (!connection.currentSelectCommand) return resolve();
			connection.preCheck = async () => {
				connection.preCheck = false;
				clearTimeout(idleTimer);
				connection.log.debug({
					src: "c",
					msg: `breaking NOOP loop`
				});
				connection.idling = false;
				resolve();
			};
			let selectCommand = connection.currentSelectCommand;
			let idleCheck = async () => {
				let response;
				switch (connection.missingIdleCommand) {
					case "SELECT":
						connection.log.debug({
							src: "c",
							msg: `Running SELECT to detect changes in folder`
						});
						response = await connection.exec(selectCommand.command, selectCommand.arguments);
						break;
					case "STATUS":
						{
							let statusArgs = [selectCommand.arguments[0], [
								"MESSAGES",
								"UIDNEXT",
								"UIDVALIDITY",
								"UNSEEN"
							].map((key) => ({
								type: "ATOM",
								value: key
							}))];
							connection.log.debug({
								src: "c",
								msg: `Running STATUS to detect changes in folder`
							});
							response = await connection.exec("STATUS", statusArgs);
						}
						break;
					default:
						response = await connection.exec("NOOP", false, { comment: "IDLE not supported" });
						break;
				}
				response.next();
			};
			let noopInterval = maxIdleTime ? Math.min(NOOP_INTERVAL, maxIdleTime) : NOOP_INTERVAL;
			let runLoop = () => {
				idleCheck().then(() => {
					clearTimeout(idleTimer);
					idleTimer = setTimeout(runLoop, noopInterval);
				}).catch((err) => {
					clearTimeout(idleTimer);
					connection.preCheck = false;
					connection.log.warn({
						err,
						cid: connection.id
					});
					resolve();
				});
			};
			connection.log.debug({
				src: "c",
				msg: `initiated NOOP loop`
			});
			connection.idling = true;
			runLoop();
		});
	};
}));
//#endregion
//#region node_modules/imapflow/lib/commands/authenticate.js
var require_authenticate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { getStatusCode, getErrorText } = require_tools();
	/**
	* Handles authentication errors by enriching the error object with server response details.
	*
	* @param {Error} err - The original authentication error
	* @param {Object} [errorResponse] - Optional OAuth error response from the server
	* @returns {Error} The enriched error; the caller is expected to throw it
	*/
	async function handleAuthError(err, errorResponse) {
		let errorCode = getStatusCode(err.response);
		if (errorCode) err.serverResponseCode = errorCode;
		err.authenticationFailed = true;
		err.response = await getErrorText(err.response);
		if (errorResponse) err.oauthError = errorResponse;
		return err;
	}
	/**
	* Authenticates using OAuth (OAUTHBEARER or XOAUTH2).
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} username - The username to authenticate with
	* @param {string} accessToken - The OAuth2 access token
	* @returns {Promise<string>} The authenticated username
	* @throws {Error} If authentication fails
	*/
	async function authOauth(connection, username, accessToken) {
		let oauthbearer;
		let command;
		let breaker;
		if (connection.capabilities.has("AUTH=OAUTHBEARER")) {
			oauthbearer = [
				`n,a=${username},`,
				`host=${connection.servername || connection.host}`,
				`port=${connection.port}`,
				`auth=Bearer ${accessToken}`,
				"",
				""
			].join("");
			command = "OAUTHBEARER";
			breaker = "AQ==";
		} else if (connection.capabilities.has("AUTH=XOAUTH") || connection.capabilities.has("AUTH=XOAUTH2")) {
			oauthbearer = [
				`user=${username}`,
				`auth=Bearer ${accessToken}`,
				"",
				""
			].join("");
			command = "XOAUTH2";
			breaker = "";
		}
		let errorResponse = false;
		try {
			(await connection.exec("AUTHENTICATE", [{
				type: "ATOM",
				value: command
			}, {
				type: "ATOM",
				value: Buffer.from(oauthbearer).toString("base64"),
				sensitive: true
			}], { onPlusTag: async (resp) => {
				if (resp.attributes && resp.attributes[0] && resp.attributes[0].type === "TEXT") try {
					errorResponse = JSON.parse(Buffer.from(resp.attributes[0].value, "base64").toString());
				} catch (err) {
					connection.log.debug({
						errorResponse: resp.attributes[0].value,
						err
					});
				}
				connection.log.debug({
					src: "c",
					msg: breaker,
					comment: `Error response for ${command}`
				});
				connection.write(breaker);
			} })).next();
			connection.authCapabilities.set(`AUTH=${command}`, true);
			return username;
		} catch (err) {
			throw await handleAuthError(err, errorResponse);
		}
	}
	/**
	* Authenticates using the SASL LOGIN mechanism.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} username - The username to authenticate with
	* @param {string} password - The password to authenticate with
	* @returns {Promise<string>} The authenticated username
	* @throws {Error} If authentication fails
	*/
	async function authLogin(connection, username, password) {
		let errorResponse = false;
		try {
			(await connection.exec("AUTHENTICATE", [{
				type: "ATOM",
				value: "LOGIN"
			}], { onPlusTag: async (resp) => {
				if (resp.attributes && resp.attributes[0] && resp.attributes[0].type === "TEXT") {
					let question = Buffer.from(resp.attributes[0].value, "base64").toString().toLowerCase().replace(/[:\x00]*$/, "");
					if (question === "username" || question === "user name") {
						let encodedUsername = Buffer.from(username).toString("base64");
						connection.log.debug({
							src: "c",
							msg: encodedUsername,
							comment: `Encoded username for AUTH=LOGIN`
						});
						connection.write(encodedUsername);
					} else if (question === "password") {
						connection.log.debug({
							src: "c",
							msg: "(* value hidden *)",
							comment: `Encoded password for AUTH=LOGIN`
						});
						connection.write(Buffer.from(password).toString("base64"));
					} else throw new Error(`Unknown LOGIN question "${question}"`);
				}
			} })).next();
			connection.authCapabilities.set(`AUTH=LOGIN`, true);
			return username;
		} catch (err) {
			throw await handleAuthError(err, errorResponse);
		}
	}
	/**
	* Authenticates using the SASL PLAIN mechanism.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} username - The authentication identity (authcid)
	* @param {string} password - The password to authenticate with
	* @param {string} [authzid] - Optional authorization identity to impersonate
	* @returns {Promise<string>} The authorized identity (authzid if provided, otherwise username)
	* @throws {Error} If authentication fails
	*/
	async function authPlain(connection, username, password, authzid) {
		let errorResponse = false;
		try {
			(await connection.exec("AUTHENTICATE", [{
				type: "ATOM",
				value: "PLAIN"
			}], { onPlusTag: async () => {
				let authzidValue = authzid || "";
				let encodedResponse = Buffer.from([
					authzidValue,
					username,
					password
				].join("\0")).toString("base64");
				let loggedResponse = Buffer.from([
					authzidValue,
					username,
					"(* value hidden *)"
				].join("\0")).toString("base64");
				connection.log.debug({
					src: "c",
					msg: loggedResponse,
					comment: `Encoded response for AUTH=PLAIN${authzid ? " with authzid" : ""}`
				});
				connection.write(encodedResponse);
			} })).next();
			connection.authCapabilities.set(`AUTH=PLAIN`, true);
			return authzid || username;
		} catch (err) {
			throw await handleAuthError(err, errorResponse);
		}
	}
	/**
	* Authenticates user using the best available method.
	*
	* @param {Object} connection - IMAP connection instance
	* @param {string} username - The username to authenticate with
	* @param {Object} credentials - Authentication credentials
	* @param {string} [credentials.accessToken] - OAuth2 access token for OAUTHBEARER/XOAUTH2 authentication
	* @param {string} [credentials.password] - Password for PLAIN or LOGIN authentication
	* @param {string} [credentials.loginMethod] - Force a specific login method (e.g., 'AUTH=PLAIN', 'AUTH=LOGIN')
	* @param {string} [credentials.authzid] - Authorization identity for PLAIN authentication
	* @returns {Promise<string|undefined>} The authenticated username, or undefined if already authenticated
	* @throws {Error} If no supported authentication mechanism is available or if authentication fails
	*/
	module.exports = async (connection, username, { accessToken, password, loginMethod, authzid }) => {
		if (connection.state !== connection.states.NOT_AUTHENTICATED) return;
		if (accessToken) {
			if (connection.capabilities.has("AUTH=OAUTHBEARER") || connection.capabilities.has("AUTH=XOAUTH") || connection.capabilities.has("AUTH=XOAUTH2")) return await authOauth(connection, username, accessToken);
		}
		if (password) {
			if (!loginMethod && connection.capabilities.has("AUTH=PLAIN") || loginMethod === "AUTH=PLAIN") return await authPlain(connection, username, password, authzid);
			if (!loginMethod && connection.capabilities.has("AUTH=LOGIN") || loginMethod === "AUTH=LOGIN") return await authLogin(connection, username, password);
		}
		throw new Error("Unsupported authentication mechanism");
	};
}));
//#endregion
//#region node_modules/imapflow/lib/imap-commands.js
var require_imap_commands = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* IMAP command registry. Maps IMAP command names (uppercase strings) to their
	* corresponding implementation modules from the `lib/commands/` directory.
	*
	* Each entry maps a command name (e.g., "FETCH", "SELECT", "IDLE") to a module
	* that exports functions for building the command request and processing the
	* server response. This Map is used by the main ImapFlow client to look up
	* and execute IMAP commands.
	*
	* @type {Map<string, Object>}
	*/
	module.exports = /* @__PURE__ */ new Map([
		["ID", require_id()],
		["CAPABILITY", require_capability()],
		["NAMESPACE", require_namespace()],
		["LOGIN", require_login()],
		["LOGOUT", require_logout()],
		["STARTTLS", require_starttls()],
		["LIST", require_list()],
		["ENABLE", require_enable()],
		["SELECT", require_select()],
		["FETCH", require_fetch()],
		["CREATE", require_create()],
		["DELETE", require_delete()],
		["RENAME", require_rename()],
		["CLOSE", require_close()],
		["SUBSCRIBE", require_subscribe()],
		["UNSUBSCRIBE", require_unsubscribe()],
		["STORE", require_store()],
		["SEARCH", require_search()],
		["NOOP", require_noop()],
		["EXPUNGE", require_expunge()],
		["APPEND", require_append()],
		["STATUS", require_status()],
		["COPY", require_copy()],
		["MOVE", require_move()],
		["COMPRESS", require_compress()],
		["QUOTA", require_quota()],
		["IDLE", require_idle()],
		["AUTHENTICATE", require_authenticate()]
	]);
}));
//#endregion
//#region node_modules/imapflow/lib/imap-flow.js
var require_imap_flow = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* @module imapflow
	*/
	var tls = __require("tls");
	var net = __require("net");
	var crypto = __require("crypto");
	var { EventEmitter } = __require("events");
	var logger = require_logger();
	var libmime = require_libmime();
	var zlib = __require("zlib");
	var { Headers } = require_mailsplit();
	var { LimitedPassthrough } = require_limited_passthrough();
	var { ImapStream } = require_imap_stream();
	var { parser, compiler } = require_imap_handler();
	var packageInfo = (init_package(), __toCommonJS(package_exports).default);
	var libqp = require_libqp();
	var libbase64 = require_libbase64();
	var FlowedDecoder = require_flowed_decoder();
	var { PassThrough } = __require("stream");
	var { proxyConnection, detachEarlyErrorHandler } = require_proxy_connection();
	var { comparePaths, updateCapabilities, getFolderTree, formatMessageResponse, getDecoder, packMessageRange, normalizePath, expandRange, AuthenticationFailure, getColorFlags, hasCapability } = require_tools();
	var imapCommands = require_imap_commands();
	var noop = () => {};
	var CONNECT_TIMEOUT = 90 * 1e3;
	var GREETING_TIMEOUT = 16 * 1e3;
	var UPGRADE_TIMEOUT = 10 * 1e3;
	var SOCKET_TIMEOUT = 300 * 1e3;
	var HELD_LOCK_WARN_MS = 1800 * 1e3;
	var states = {
		NOT_AUTHENTICATED: 1,
		AUTHENTICATED: 2,
		SELECTED: 3,
		LOGOUT: 4
	};
	/**
	* @typedef {Object} MailboxObject
	* @global
	* @property {String} path mailbox path
	* @property {String} delimiter mailbox path delimiter, usually "." or "/"
	* @property {Set<string>} flags list of flags for this mailbox
	* @property {String} [specialUse] one of special-use flags (if applicable): "\All", "\Archive", "\Drafts", "\Flagged", "\Junk", "\Sent", "\Trash". Additionally INBOX has non-standard "\Inbox" flag set
	* @property {Boolean} listed `true` if mailbox was found from the output of LIST command
	* @property {Boolean} subscribed `true` if the mailbox is subscribed - reported by LSUB or by LIST RETURN (SUBSCRIBED) on LIST-EXTENDED/IMAP4rev2 servers
	* @property {Set<string>} permanentFlags A Set of flags available to use in this mailbox. If it is not set or includes special flag "\\\*" then any flag can be used.
	* @property {String} [mailboxId] unique mailbox ID if server has `OBJECTID` extension enabled
	* @property {BigInt} [highestModseq] latest known modseq value if server has CONDSTORE or XYMHIGHESTMODSEQ enabled
	* @property {Boolean} [noModseq] if true then the server doesn't support the persistent storage of mod-sequences for the mailbox
	* @property {BigInt} uidValidity Mailbox `UIDVALIDITY` value
	* @property {Number} uidNext Next predicted UID
	* @property {Number} exists Messages in this folder
	*/
	/**
	* @typedef {Object} MailboxLockObject
	* @global
	* @property {String} path mailbox path
	* @property {Function} release Release current lock
	* @example
	* let lock = await client.getMailboxLock('INBOX');
	* try {
	*   // do something in the mailbox
	* } finally {
	*   // use finally{} to make sure lock is released even if exception occurs
	*   lock.release();
	* }
	*/
	/**
	* Client and server identification object, where key is one of RFC2971 defined [data fields](https://tools.ietf.org/html/rfc2971#section-3.3) (but not limited to).
	* @typedef {Object} IdInfoObject
	* @global
	* @property {String} [name] Name of the program
	* @property {String} [version] Version number of the program
	* @property {String} [os] Name of the operating system
	* @property {String} [vendor] Vendor of the client/server
	* @property {String} ['support-url'] URL to contact for support
	* @property {Date} [date] Date program was released
	*/
	/**
	* IMAP client class for accessing IMAP mailboxes
	*
	* @class
	* @extends EventEmitter
	*/
	var ImapFlow = class extends EventEmitter {
		/**
		* Current module version as a static class property
		* @property {String} version Module version
		* @static
		*/
		static version = packageInfo.version;
		/**
		* IMAP connection options
		*
		* @property {String} host
		*     Hostname of the IMAP server.
		*
		* @property {Number} port
		*     Port number for the IMAP server.
		*
		* @property {Boolean} [secure=false]
		*     If `true`, establishes the connection directly over TLS (commonly on port 993).
		*     If `false`, a plain (unencrypted) connection is used first and, if possible, the connection is upgraded to STARTTLS.
		*
		* @property {Boolean} [doSTARTTLS=undefined]
		*     Determines whether to upgrade the connection to TLS via STARTTLS:
		*       - **true**: Start unencrypted and upgrade to TLS using STARTTLS before authentication.
		*         The connection fails if the server does not support STARTTLS or the upgrade fails.
		*         Note that `secure=true` combined with `doSTARTTLS=true` is invalid.
		*       - **false**: Never use STARTTLS, even if the server advertises support.
		*         This is useful if the server has a broken TLS setup.
		*         Combined with `secure=false`, this results in a fully unencrypted connection.
		*         Make sure you warn users about the security risks.
		*       - **undefined** (default): If `secure=false` (default), attempt to upgrade to TLS via STARTTLS before authentication if the server supports it. If not supported, continue unencrypted. This may expose the connection to a downgrade attack.
		*
		* @property {String} [servername]
		*     Server name for SNI or when using an IP address as `host`.
		*
		* @property {Boolean} [disableCompression=false]
		*     If `true`, the client does not attempt to use the COMPRESS=DEFLATE extension.
		*
		* @property {Object} auth
		*     Authentication options. Authentication occurs automatically during {@link connect}.
		*
		* @property {String} auth.user
		*     Username for authentication.
		*
		* @property {String} [auth.pass]
		*     Password for regular authentication.
		*
		* @property {String} [auth.accessToken]
		*     OAuth2 access token, if using OAuth2 authentication.
		*
		* @property {String} [auth.loginMethod]
		*     Optional login method for password-based authentication (e.g., "LOGIN", "AUTH=LOGIN", or "AUTH=PLAIN").
		*     If not set, ImapFlow chooses based on available mechanisms.
		*
		* @property {String} [auth.authzid]
		*     Authorization identity for SASL PLAIN authentication (used for admin impersonation/delegation).
		*     When set, authenticates as `auth.user` but authorizes as `auth.authzid`.
		*     This is typically used in mail systems like Zimbra for admin users to access other users' mailboxes.
		*     Only works with AUTH=PLAIN mechanism.
		*
		* @property {IdInfoObject} [clientInfo]
		*     Client identification info sent to the server (via the ID command).
		*
		* @property {Boolean} [disableAutoIdle=false]
		*     If `true`, do not start IDLE automatically. Useful when only specific operations are needed.
		*
		* @property {Object} [tls]
		*     Additional TLS options. For details, see [Node.js TLS connect](https://nodejs.org/api/tls.html#tls_tls_connect_options_callback).
		*
		* @property {Boolean} [tls.rejectUnauthorized=true]
		*     If `false`, allows self-signed or expired certificates.
		*
		* @property {String} [tls.minVersion='TLSv1.2']
		*     Minimum accepted TLS version (e.g., `'TLSv1.2'`).
		*
		* @property {Number} [tls.minDHSize=1024]
		*     Minimum size (in bits) of the DH parameter for TLS connections.
		*
		* @property {Object|Boolean} [logger]
		*     Custom logger instance with `debug(obj)`, `info(obj)`, `warn(obj)`, and `error(obj)` methods.
		*     If `false`, logging is disabled. If not provided, ImapFlow logs to console in [pino format](https://getpino.io/).
		*
		* @property {Boolean} [logRaw=false]
		*     If `true`, logs all raw data (read and written) in base64 encoding. You can pipe such logs to [eerawlog](https://github.com/postalsys/eerawlog) command for readable output.
		*
		* @property {Boolean} [emitLogs=false]
		*     If `true`, emits `'log'` events with the same data passed to the logger.
		*
		* @property {Boolean} [verifyOnly=false]
		*     If `true`, disconnects after successful authentication without performing other actions.
		*
		* @property {String} [proxy]
		*     Proxy URL. Supports HTTP CONNECT (`http://`, `https://`) and SOCKS (`socks://`, `socks4://`, `socks5://`).
		*
		* @property {Boolean} [qresync=false]
		*     If `true`, enables QRESYNC support so that EXPUNGE notifications include `uid` instead of `seq`.
		*
		* @property {Number} [maxIdleTime]
		*     If set, breaks and restarts IDLE every `maxIdleTime` milliseconds.
		*
		* @property {String} [missingIdleCommand="NOOP"]
		*     Command to use if the server does not support IDLE.
		*
		* @property {Boolean} [disableBinary=false]
		*     If `true`, ignores the BINARY extension for FETCH and APPEND operations.
		*
		* @property {Boolean} [disableAutoEnable=false]
		*     If `true`, do not automatically enable supported IMAP extensions.
		*
		* @property {Boolean} [disableIMAP4rev2=false]
		*     If `true`, do not enable IMAP4rev2 mode even if the server supports it.
		*     Use as a targeted opt-out for servers with broken IMAP4rev2 implementations
		*     without losing the other auto-enabled extensions.
		*
		* @property {Number} [connectionTimeout=90000]
		*     Maximum time (in milliseconds) to wait for the connection to establish. Defaults to 90 seconds.
		*
		* @property {Number} [greetingTimeout=16000]
		*     Maximum time (in milliseconds) to wait for the server greeting after a connection is established. Defaults to 16 seconds.
		*
		* @property {Number} [socketTimeout=300000]
		*     Maximum period of inactivity (in milliseconds) before terminating the connection. Defaults to 5 minutes.
		*/
		constructor(options) {
			super({ captureRejections: true });
			this.options = options || {};
			/**
			* Instance ID for logs
			* @type {String}
			*/
			this.id = this.options.id || this.getRandomId();
			this.clientInfo = Object.assign({
				name: packageInfo.name,
				version: packageInfo.version,
				vendor: "Postal Systems",
				"support-url": "https://github.com/postalsys/imapflow/issues"
			}, this.options.clientInfo || {});
			for (let key of Object.keys(this.clientInfo)) if (typeof this.clientInfo[key] === "string") this.clientInfo[key] = this.clientInfo[key].normalize("NFD").replace(/\p{Diacritic}/gu, "");
			/**
			* Server identification info. Available after successful `connect()`.
			* If server does not provide identification info then this value is `null`.
			* @example
			* await client.connect();
			* console.log(client.serverInfo.vendor);
			* @type {IdInfoObject|null}
			*/
			this.serverInfo = null;
			this.log = this.getLogger();
			/**
			* Is the connection currently encrypted or not
			* @type {Boolean}
			*/
			this.secureConnection = !!this.options.secure;
			this.port = Number(this.options.port) || (this.secureConnection ? 993 : 143);
			this.host = this.options.host || "localhost";
			this.servername = this.options.servername ? this.options.servername : !net.isIP(this.host) ? this.host : false;
			if (typeof this.options.secure === "undefined" && this.port === 993) this.secureConnection = true;
			this.logRaw = this.options.logRaw;
			this.streamer = new ImapStream({
				logger: this.log,
				cid: this.id,
				logRaw: this.logRaw,
				secureConnection: this.secureConnection,
				maxLineLength: this.options.maxLineLength,
				maxLiteralSize: this.options.maxLiteralSize
			});
			this.reading = false;
			this.socket = false;
			this.writeSocket = false;
			this._throttleTimer = null;
			this._throttleAbort = null;
			this._upgradeReject = null;
			this.isClosed = false;
			this.states = states;
			this.state = this.states.NOT_AUTHENTICATED;
			this.lockCounter = 0;
			this.tagCounter = 0;
			this.requestTagMap = /* @__PURE__ */ new Map();
			this.requestQueue = [];
			this.currentRequest = false;
			this.writeBytesCounter = 0;
			this.commandParts = [];
			/**
			* Active IMAP capabilities. Value is either `true` for toggleable capabilities (eg. `UIDPLUS`)
			* or a number for capabilities with a value (eg. `APPENDLIMIT`)
			* @type {Map<string, boolean|number>}
			*/
			this.capabilities = /* @__PURE__ */ new Map();
			this.authCapabilities = /* @__PURE__ */ new Map();
			this.rawCapabilities = null;
			this.expectCapabilityUpdate = false;
			this._starttlsHadTrailingData = false;
			/**
			* Enabled capabilities. Usually `CONDSTORE` and `UTF8=ACCEPT` if server supports these.
			* @type {Set<string>}
			*/
			this.enabled = /* @__PURE__ */ new Set();
			/**
			* Is the connection currently usable or not
			* @type {Boolean}
			*/
			this.usable = false;
			/**
			* Currently authenticated user or `false` if mailbox is not open
			* or `true` if connection was authenticated by PREAUTH
			* @type {String|Boolean}
			*/
			this.authenticated = false;
			/**
			* Currently selected mailbox or `false` if mailbox is not open
			* @type {MailboxObject|Boolean}
			*/
			this.mailbox = false;
			this.currentSelectCommand = false;
			/**
			* Is current mailbox idling (`true`) or not (`false`)
			* @type {Boolean}
			*/
			this.idling = false;
			this.emitLogs = !!this.options.emitLogs;
			this.lo = 0;
			this.untaggedHandlers = {};
			this.sectionHandlers = {};
			this.commands = imapCommands;
			this.folders = /* @__PURE__ */ new Map();
			this.currentLock = false;
			this.locks = [];
			this.idRequested = false;
			this.maxIdleTime = this.options.maxIdleTime || false;
			this.missingIdleCommand = (this.options.missingIdleCommand || "").toString().toUpperCase().trim() || "NOOP";
			this.disableBinary = !!this.options.disableBinary;
			this.skipListSubscribedArg = false;
			this.skipListStatusArgs = false;
			this.skipListAuxArgs = false;
			this.skipLsub = false;
			this._streamerErrorHandler = (err) => {
				if ([
					"Z_BUF_ERROR",
					"ECONNRESET",
					"EPIPE",
					"ETIMEDOUT",
					"EHOSTUNREACH"
				].includes(err.code)) {
					this.closeAfter();
					return;
				}
				this.log.error({
					err,
					cid: this.id
				});
				this.emitError(err);
			};
			this.streamer.on("error", this._streamerErrorHandler);
			this._connectCalled = false;
		}
		emitError(err) {
			if (!err) return;
			err._connId = err._connId || this.id;
			if (this.upgrading) {
				this.upgrading = false;
				this.closeAfter();
				if (typeof this._upgradeReject === "function") {
					let reject = this._upgradeReject;
					this._upgradeReject = null;
					reject(err);
				}
				return;
			}
			if (typeof this.initialReject === "function") {
				let reject = this.initialReject;
				this.initialResolve = false;
				this.initialReject = false;
				this.closeAfter();
				reject(err);
				return;
			}
			this.closeAfter();
			this.emit("error", err);
		}
		getRandomId() {
			let rid = BigInt("0x" + crypto.randomBytes(13).toString("hex")).toString(36);
			if (rid.length < 20) rid = "0".repeat(20 - rid.length) + rid;
			if (rid.length > 20) rid = rid.substr(0, 20);
			return rid;
		}
		write(chunk) {
			if (!this.socket || this.socket.destroyed) {
				const error = /* @__PURE__ */ new Error("Socket is already closed");
				error.code = "NoConnection";
				throw error;
			}
			if (this.state === this.states.LOGOUT) {
				const error = /* @__PURE__ */ new Error("Can not send data after logged out");
				error.code = "StateLogout";
				throw error;
			}
			if (this.writeSocket.destroyed) {
				this.log.error({
					msg: "Write socket destroyed",
					cid: this.id
				});
				this.close();
				return;
			}
			let addLineBreak = !this.commandParts.length;
			if (typeof chunk === "string") {
				if (addLineBreak) chunk += "\r\n";
				chunk = Buffer.from(chunk, "binary");
			} else if (Buffer.isBuffer(chunk)) {
				if (addLineBreak) chunk = Buffer.concat([chunk, Buffer.from("\r\n")]);
			} else return false;
			if (this.logRaw) this.log.trace({
				src: "c",
				msg: "write to socket",
				data: chunk.toString("base64"),
				compress: !!this._deflate,
				secure: !!this.secureConnection,
				cid: this.id
			});
			this.writeBytesCounter += chunk.length;
			this.writeSocket.write(chunk);
		}
		/**
		* Returns byte counters for the current connection.
		*
		* @param {Boolean} [reset] If `true` then resets the byte counters after returning the current values
		* @returns {Object} Byte counters
		* @returns {Number} return.sent Bytes sent to server
		* @returns {Number} return.received Bytes received from server
		*/
		stats(reset) {
			let result = {
				sent: this.writeBytesCounter || 0,
				received: this.streamer && this.streamer.readBytesCounter || 0
			};
			if (reset) {
				this.writeBytesCounter = 0;
				if (this.streamer) this.streamer.readBytesCounter = 0;
			}
			return result;
		}
		async send(data) {
			if (this.state === this.states.LOGOUT) {
				if (data.tag) {
					let request = this.requestTagMap.get(data.tag);
					if (request) {
						this.requestTagMap.delete(request.tag);
						const error = /* @__PURE__ */ new Error("Connection not available");
						error.code = "NoConnection";
						request.reject(error);
					}
				}
				return;
			}
			let compiled = await compiler(data, {
				asArray: true,
				literalMinus: hasCapability(this, "LITERAL-") || this.capabilities.has("LITERAL+")
			});
			this.commandParts = compiled;
			let logCompiled = await compiler(data, { isLogging: true });
			/* c8 ignore next */ let options = data.options || {};
			this.log.debug({
				src: "c",
				msg: logCompiled.toString(),
				cid: this.id,
				comment: options.comment
			});
			this.write(this.commandParts.shift());
			if (typeof options.onSend === "function") options.onSend();
		}
		async trySend() {
			if (this.currentRequest || !this.requestQueue.length) return;
			this.currentRequest = this.requestQueue.shift();
			await this.send({
				tag: this.currentRequest.tag,
				command: this.currentRequest.command,
				attributes: this.currentRequest.attributes,
				options: this.currentRequest.options
			});
		}
		exec(command, attributes, options) {
			if (this.state === this.states.LOGOUT || this.isClosed) {
				const error = /* @__PURE__ */ new Error("Connection not available");
				error.code = "NoConnection";
				let p = Promise.reject(error);
				p.catch(noop);
				return p;
			}
			if (!this.socket || this.socket.destroyed) {
				let error = /* @__PURE__ */ new Error("Connection closed");
				error.code = "EConnectionClosed";
				let p = Promise.reject(error);
				p.catch(noop);
				return p;
			}
			let tag = (++this.tagCounter).toString(16).toUpperCase();
			options = options || {};
			let promise = new Promise((resolve, reject) => {
				this.requestTagMap.set(tag, {
					command,
					attributes,
					options,
					resolve,
					reject
				});
				this.requestQueue.push({
					tag,
					command,
					attributes,
					options
				});
				this.trySend().catch((err) => {
					this.requestTagMap.delete(tag);
					reject(err);
				});
			});
			promise.catch(noop);
			return promise;
		}
		getUntaggedHandler(command, attributes) {
			if (/^[0-9]+$/.test(command)) {
				let type = attributes && attributes.length && typeof attributes[0].value === "string" ? attributes[0].value.toUpperCase() : false;
				if (type) command = type;
			}
			command = command.toUpperCase().trim();
			if (this.currentRequest && this.currentRequest.options && this.currentRequest.options.untagged && this.currentRequest.options.untagged[command]) return this.currentRequest.options.untagged[command];
			if (this.untaggedHandlers[command]) return this.untaggedHandlers[command];
		}
		getSectionHandler(key) {
			if (this.sectionHandlers[key]) return this.sectionHandlers[key];
		}
		async reader() {
			let data;
			let processedCount = 0;
			while ((data = this.streamer.read()) !== null) {
				let parsed;
				try {
					parsed = await parser(data.payload, { literals: data.literals });
					if (parsed.tag && !["*", "+"].includes(parsed.tag) && parsed.command) {
						let payload = { response: parsed.command };
						if (parsed.attributes && parsed.attributes[0] && parsed.attributes[0].section && parsed.attributes[0].section[0] && parsed.attributes[0].section[0].type === "ATOM") payload.code = parsed.attributes[0].section[0].value;
						this.emit("response", payload);
					}
				} catch (err) {
					this.log.error({
						src: "s",
						msg: data.payload.toString(),
						err,
						cid: this.id
					});
					data.next();
					continue;
				}
				let logCompiled = await compiler(parsed, { isLogging: true });
				if (/^\d+$/.test(parsed.command) && parsed.attributes && parsed.attributes[0] && parsed.attributes[0].value === "FETCH") this.log.trace({
					src: "s",
					msg: logCompiled.toString(),
					cid: this.id,
					nullBytesRemoved: parsed.nullBytesRemoved
				});
				else this.log.debug({
					src: "s",
					msg: logCompiled.toString(),
					cid: this.id,
					nullBytesRemoved: parsed.nullBytesRemoved
				});
				if (parsed.tag === "+" && this.currentRequest && this.currentRequest.options && typeof this.currentRequest.options.onPlusTag === "function") {
					try {
						await this.currentRequest.options.onPlusTag(parsed);
					} catch (err) {
						this.log.warn({
							err,
							cid: this.id
						});
					}
					data.next();
					continue;
				}
				if (parsed.tag === "+" && this.commandParts.length) {
					let content = this.commandParts.shift();
					try {
						this.write(content);
						this.log.debug({
							src: "c",
							msg: `(* ${content.length}B continuation *)`,
							cid: this.id
						});
					} catch (err) {
						this.log.warn({
							err,
							cid: this.id
						});
					}
					data.next();
					continue;
				}
				let section = parsed.attributes && parsed.attributes.length && parsed.attributes[0] && !parsed.attributes[0].value && parsed.attributes[0].section;
				if (section && section.length && section[0].type === "ATOM" && typeof section[0].value === "string") {
					let sectionHandler = this.getSectionHandler(section[0].value.toUpperCase().trim());
					if (sectionHandler) try {
						await sectionHandler(section.slice(1));
					} catch (err) {
						this.log.warn({
							err,
							cid: this.id
						});
					}
				}
				if (parsed.tag === "*" && parsed.command) {
					let untaggedHandler = this.getUntaggedHandler(parsed.command, parsed.attributes);
					if (untaggedHandler) try {
						await untaggedHandler(parsed);
					} catch (err) {
						this.log.warn({
							err,
							cid: this.id
						});
						data.next();
						continue;
					}
				}
				if (this.requestTagMap.has(parsed.tag)) {
					let request = this.requestTagMap.get(parsed.tag);
					this.requestTagMap.delete(parsed.tag);
					if (this.currentRequest && this.currentRequest.tag === parsed.tag) {
						this.currentRequest = false;
						try {
							await this.trySend();
						} catch (err) {
							this.log.warn({
								err,
								cid: this.id
							});
						}
					}
					switch (parsed.command.toUpperCase()) {
						case "OK":
						case "BYE":
							await new Promise((resolve) => request.resolve({
								response: parsed,
								next: resolve,
								hasTrailingData: !!data.trailingAfterLine
							}));
							break;
						case "NO":
						case "BAD": {
							let txt = parsed.attributes && parsed.attributes.filter((val) => val.type === "TEXT").map((val) => val.value.trim()).join(" ");
							let err = /* @__PURE__ */ new Error("Command failed");
							err.response = parsed;
							err.responseStatus = parsed.command.toUpperCase();
							try {
								err.executedCommand = parsed.tag + (await compiler(request, { isLogging: true })).toString();
							} catch {}
							if (txt) {
								err.responseText = txt;
								if (err.responseStatus === "NO" && txt.includes("Some of the requested messages no longer exist")) {
									this.log.warn({
										msg: "Partial FETCH response",
										cid: this.id,
										err
									});
									await new Promise((resolve) => request.resolve({
										response: parsed,
										next: resolve
									}));
									break;
								}
								let throttleDelay = false;
								if (/Request is throttled/i.test(txt) && /Backoff Time/i.test(txt)) {
									let throttlingMatch = txt.match(/Backoff Time[:=\s]+(\d+)/i);
									if (throttlingMatch && throttlingMatch[1] && !isNaN(throttlingMatch[1])) throttleDelay = Number(throttlingMatch[1]);
								}
								if (throttleDelay) {
									err.code = "ETHROTTLE";
									err.throttleReset = throttleDelay;
									let delayResponse = throttleDelay;
									if (delayResponse > 300 * 1e3) delayResponse = 300 * 1e3;
									this.log.warn({
										msg: "Throttling detected",
										cid: this.id,
										throttleDelay,
										delayResponse,
										err
									});
									let aborted = await new Promise((resolve) => {
										this._throttleAbort = resolve;
										this._throttleTimer = setTimeout(() => resolve(false), delayResponse);
										if (typeof this._throttleTimer.unref === "function") this._throttleTimer.unref();
									});
									this._throttleTimer = null;
									this._throttleAbort = null;
									if (aborted) {
										request.reject(this.createNoConnectionError(this.byeReason));
										break;
									}
								}
							}
							request.reject(err);
							break;
						}
						default: {
							let err = /* @__PURE__ */ new Error("Invalid server response");
							err.code = "InvalidResponse";
							err.response = parsed;
							request.reject(err);
							break;
						}
					}
				}
				data.next();
				processedCount++;
				if (processedCount % 10 === 0) await new Promise((resolve) => setImmediate(resolve));
			}
		}
		setEventHandlers() {
			this.socketReadable = () => {
				if (!this.reading) {
					this.reading = true;
					this.reader().catch((err) => this.log.error({
						err,
						cid: this.id
					})).finally(() => {
						this.reading = false;
					});
				}
			};
			this.streamer.on("readable", this.socketReadable);
		}
		setSocketHandlers() {
			this.clearSocketHandlers();
			this._socketError = this._socketError || ((err) => {
				this.log.error({
					err,
					cid: this.id
				});
				this.emitError(err);
			});
			this._socketClose = this._socketClose || (() => this.close());
			this._socketEnd = this._socketEnd || (() => this.close());
			/**
			* Socket timeout event handler.
			*
			* When a socket timeout occurs during IDLE, the handler attempts to recover the connection
			* by sending a NOOP command and then returning to IDLE state.
			*
			* @fires ImapFlow#error Emits error event unless the current command is IDLE
			*/
			this._socketTimeout = this._socketTimeout || (() => {
				const err = /* @__PURE__ */ new Error("Socket timeout");
				err.code = "ETIMEOUT";
				if (this.idling) {
					if (!this.usable || !this.socket || this.socket.destroyed) {
						this.emitError(err);
						return;
					}
					this.run("NOOP").then(() => this.idle()).catch((err) => {
						this.log.warn({
							msg: "IDLE recovery failed after timeout",
							err,
							cid: this.id
						});
						if (!this.isClosed) this.close();
					});
				} else {
					this.log.debug({
						msg: "Socket timeout",
						cid: this.id
					});
					this.emitError(err);
				}
			});
			this.socket.once("error", this._socketError);
			this.socket.once("close", this._socketClose);
			this.socket.once("end", this._socketEnd);
			this.socket.on("tlsClientError", this._socketError);
			this.socket.on("timeout", this._socketTimeout);
			if (this.writeSocket && this.writeSocket !== this.socket) this.writeSocket.on("error", this._socketError);
		}
		clearSocketHandlers() {
			if (!this.socket) return;
			if (this._connectErrorHandler) {
				this.socket.removeListener("error", this._connectErrorHandler);
				this._connectErrorHandler = null;
			}
			if (this._socketError) {
				this.socket.removeListener("error", this._socketError);
				this.socket.removeListener("tlsClientError", this._socketError);
				if (this.writeSocket && this.writeSocket !== this.socket) this.writeSocket.removeListener("error", this._socketError);
			}
			if (this._socketTimeout) this.socket.removeListener("timeout", this._socketTimeout);
			if (this._socketClose) this.socket.removeListener("close", this._socketClose);
			if (this._socketEnd) this.socket.removeListener("end", this._socketEnd);
		}
		async startSession() {
			await this.run("CAPABILITY");
			if (this.capabilities.has("ID")) this.idRequested = await this.run("ID", this.clientInfo);
			await this.upgradeToSTARTTLS();
			await this.authenticate();
			if ((!this.idRequested || Object.keys(this.idRequested).length < 2) && this.capabilities.has("ID")) this.idRequested = await this.run("ID", this.clientInfo);
			let nsResponse = await this.run("NAMESPACE");
			if (nsResponse && nsResponse.error && nsResponse.status === "BAD" && /User is authenticated but not connected/i.test(nsResponse.text)) {
				this.authenticated = false;
				let err = new AuthenticationFailure("Authentication failed");
				err.response = nsResponse.text;
				throw err;
			}
			if (this.options.verifyOnly) {
				if (this.options.includeMailboxes) this._mailboxList = await this.list();
				return await this.logout();
			}
			if (!this.options.disableCompression) await this.compress();
			if (!this.options.disableAutoEnable) await this.autoEnable();
			this.usable = true;
		}
		async autoEnable() {
			let enableList = ["CONDSTORE", "UTF8=ACCEPT"].concat(this.options.qresync ? "QRESYNC" : []).concat(this.options.disableIMAP4rev2 ? [] : "IMAP4rev2");
			if (await this.run("ENABLE", enableList) === false && enableList.includes("IMAP4rev2")) await this.run("ENABLE", enableList.filter((extension) => extension !== "IMAP4rev2"));
		}
		async compress() {
			if (!await this.run("COMPRESS")) return;
			this._deflate = zlib.createDeflateRaw({
				windowBits: 15,
				level: zlib.constants.Z_DEFAULT_COMPRESSION,
				memLevel: 8,
				strategy: zlib.constants.Z_DEFAULT_STRATEGY,
				chunkSize: 16 * 1024
			});
			this._inflate = zlib.createInflateRaw({ chunkSize: 16 * 1024 });
			this.socket.unpipe(this.streamer);
			this.streamer.compress = true;
			this.socket.pipe(this._inflate).pipe(this.streamer);
			this._inflate.on("error", (err) => {
				if (!this.streamer.destroyed && this.streamer.listenerCount("error")) this.streamer.emit("error", err);
			});
			this.writeSocket = new PassThrough({ highWaterMark: 64 * 1024 });
			/* c8 ignore start */ this.writeSocket.destroySoon = () => {
				try {
					if (this.socket) this.socket.destroy();
					this.writeSocket.end();
				} catch (err) {
					this.log.error({
						err,
						info: "Failed to destroy PassThrough socket",
						cid: this.id
					});
					throw err;
				}
			};
			/* c8 ignore stop */
			Object.defineProperty(this.writeSocket, "destroyed", { get: () => !this.socket || this.socket.destroyed });
			let reading = false;
			let processedChunks = 0;
			let readNext = async () => {
				try {
					reading = true;
					processedChunks = 0;
					let chunk;
					while (this.writeSocket && (chunk = this.writeSocket.read()) !== null) {
						if (this._deflate && this._deflate.write(chunk) === false) return this._deflate.once("drain", readNext);
						processedChunks++;
						/* c8 ignore next 6 */ if (processedChunks % 100 === 0) {
							await new Promise((resolve) => setImmediate(resolve));
							if (!this.writeSocket) break;
						}
					}
					if (this._deflate) this._deflate.flush();
					reading = false;
				} catch (ex) {
					this.emitError(ex);
				}
			};
			this.writeSocket.on("readable", () => {
				if (!reading && this.writeSocket) readNext();
			});
			this.writeSocket.on("error", (err) => {
				if (this.socket) this.socket.emit("error", err);
			});
			this._deflate.pipe(this.socket);
			this._deflate.on("error", (err) => {
				if (this.socket) this.socket.emit("error", err);
			});
		}
		_failSTARTTLS() {
			if (this.options.doSTARTTLS === true) {
				let err = /* @__PURE__ */ new Error("Server does not support STARTTLS");
				err.tlsFailed = true;
				throw err;
			}
			return false;
		}
		/**
		* Tries to upgrade the connection to TLS using STARTTLS.
		* @throws if STARTTLS is required, but not possible.
		* @returns {boolean} true, if the connection is now protected by TLS, either direct TLS or STARTTLS.
		*/
		async upgradeToSTARTTLS() {
			if (this.options.doSTARTTLS === true && this.options.secure === true) throw new Error("Misconfiguration: Cannot set both secure=true for TLS and doSTARTTLS=true for STARTTLS.");
			if (this.secureConnection) return true;
			if (this.options.doSTARTTLS === false) return false;
			if (!this.capabilities.has("STARTTLS")) return this._failSTARTTLS();
			this.expectCapabilityUpdate = true;
			if (!await this.run("STARTTLS")) return this._failSTARTTLS();
			const failSTARTTLSInjection = () => {
				let err = /* @__PURE__ */ new Error("Server sent data after the STARTTLS response and before the TLS handshake; possible plaintext-injection attack");
				err.code = "STARTTLS_INJECTION";
				err.tlsFailed = true;
				this.closeAfter();
				return err;
			};
			if (this._starttlsHadTrailingData) throw failSTARTTLSInjection();
			this.socket.unpipe(this.streamer);
			let injectedTail = typeof this.socket.read === "function" ? this.socket.read() : null;
			/* c8 ignore next 3 */ if (injectedTail && injectedTail.length) throw failSTARTTLSInjection();
			let upgraded = await new Promise((resolve, reject) => {
				this._upgradeReject = reject;
				let socketPlain = this.socket;
				let opts = Object.assign({
					socket: this.socket,
					servername: this.servername,
					port: this.port
				}, this.options.tls || {});
				this.clearSocketHandlers();
				/* c8 ignore start */ const socketPlainErrorHandler = (err) => {
					clearTimeout(this.connectTimeout);
					clearTimeout(this.upgradeTimeout);
					if (!this.upgrading) return;
					this.closeAfter();
					this.upgrading = false;
					err.tlsFailed = true;
					reject(err);
				};
				/* c8 ignore stop */
				socketPlain.once("error", socketPlainErrorHandler);
				/* c8 ignore start */ this.upgradeTimeout = setTimeout(() => {
					if (!this.upgrading) return;
					this.closeAfter();
					let err = /* @__PURE__ */ new Error("Failed to upgrade connection in required time");
					err.tlsFailed = true;
					err.code = "UPGRADE_TIMEOUT";
					reject(err);
				}, UPGRADE_TIMEOUT);
				/* c8 ignore stop */
				const tlsSocketErrorHandler = (err) => {
					clearTimeout(this.connectTimeout);
					clearTimeout(this.upgradeTimeout);
					/* c8 ignore start */ if (!this.upgrading) return;
					/* c8 ignore stop */
					this.upgrading = false;
					err.tlsFailed = true;
					this.clearSocketHandlers();
					this.closeAfter();
					reject(err);
				};
				this.upgrading = true;
				this.socket = tls.connect(opts, () => {
					try {
						clearTimeout(this.upgradeTimeout);
						/* c8 ignore start */ if (this.isClosed) return this.close();
						/* c8 ignore stop */
						this.secureConnection = true;
						this.upgrading = false;
						this.streamer.secureConnection = true;
						this.socket.pipe(this.streamer);
						/* c8 ignore next */ this.tls = typeof this.socket.getCipher === "function" ? this.socket.getCipher() : false;
						if (this.tls) {
							this.tls.authorized = this.socket.authorized;
							this.log.info({
								src: "tls",
								msg: "Established TLS session",
								cid: this.id,
								authorized: this.tls.authorized,
								/* c8 ignore next */ algo: this.tls.standardName || this.tls.name,
								version: this.tls.version
							});
						}
						socketPlain.removeListener("error", socketPlainErrorHandler);
						this.socket.removeListener("error", tlsSocketErrorHandler);
						this.setSocketHandlers();
						this._upgradeReject = null;
						return resolve(true);
					} catch (ex) {
						this.emitError(ex);
					}
				});
				this.socket.once("error", tlsSocketErrorHandler);
				this.writeSocket = this.socket;
			});
			if (upgraded && this.expectCapabilityUpdate) {
				this.capabilities.clear();
				this.authCapabilities.clear();
				await this.run("CAPABILITY");
			}
			return upgraded;
		}
		async setAuthenticationState() {
			this.state = this.states.AUTHENTICATED;
			this.authenticated = true;
			if (this.expectCapabilityUpdate) await this.run("CAPABILITY");
		}
		async authenticate() {
			if (this.state === this.states.LOGOUT) throw new AuthenticationFailure("Already logged out");
			if (this.state !== this.states.NOT_AUTHENTICATED) return true;
			if (!this.options.auth) throw new AuthenticationFailure("Please configure the login");
			this.expectCapabilityUpdate = true;
			let loginMethod = (this.options.auth.loginMethod || "").toString().trim().toUpperCase();
			if (!loginMethod && /\\|\//.test(this.options.auth.user)) loginMethod = "LOGIN";
			if (this.options.auth.accessToken) this.authenticated = await this.run("AUTHENTICATE", this.options.auth.user, { accessToken: this.options.auth.accessToken });
			else if (this.options.auth.pass) if ((this.capabilities.has("AUTH=LOGIN") || this.capabilities.has("AUTH=PLAIN")) && loginMethod !== "LOGIN") this.authenticated = await this.run("AUTHENTICATE", this.options.auth.user, {
				password: this.options.auth.pass,
				loginMethod,
				authzid: this.options.auth.authzid
			});
			else {
				if (this.capabilities.has("LOGINDISABLED")) throw new AuthenticationFailure("Login is disabled");
				this.authenticated = await this.run("LOGIN", this.options.auth.user, this.options.auth.pass);
			}
			else throw new AuthenticationFailure("No password configured");
			if (this.authenticated) {
				this.log.info({
					src: "auth",
					msg: "User authenticated",
					cid: this.id,
					user: this.options.auth.user
				});
				await this.setAuthenticationState();
				return true;
			}
			throw new AuthenticationFailure("No matching authentication method");
		}
		beginSession(onUnhandledError) {
			clearTimeout(this.greetingTimeout);
			this.untaggedHandlers.OK = null;
			this.untaggedHandlers.PREAUTH = null;
			if (this.isClosed) return;
			this.startSession().then(() => {
				if (typeof this.initialResolve === "function") {
					let resolve = this.initialResolve;
					this.initialResolve = false;
					this.initialReject = false;
					return resolve();
				}
			}).catch((err) => {
				this.log.error({
					err,
					cid: this.id
				});
				if (typeof this.initialReject === "function") {
					clearTimeout(this.greetingTimeout);
					let reject = this.initialReject;
					this.initialResolve = false;
					this.initialReject = false;
					return reject(err);
				}
				onUnhandledError(err);
			});
		}
		async initialOK(message) {
			this.greeting = (message.attributes || []).filter((entry) => entry.type === "TEXT").map((entry) => entry.value).filter((entry) => entry).join("");
			this.beginSession((err) => this.emitError(err));
		}
		async initialPREAUTH() {
			if (this.isClosed) return;
			this.state = this.states.AUTHENTICATED;
			this.beginSession((err) => {
				this.log.error({
					err,
					cid: this.id
				});
				this.closeAfter();
			});
		}
		async serverBye(parsed) {
			let reason = parsed && parsed.attributes && parsed.attributes.filter((val) => val.type === "TEXT").map((val) => val.value.trim()).join(" ");
			this.byeReason = reason || "Server closed connection";
			this.untaggedHandlers.BYE = null;
			this.state = this.states.LOGOUT;
		}
		updateCapabilitiesFromRaw(rawCapabilities) {
			this.rawCapabilities = rawCapabilities;
			this.capabilities = updateCapabilities(rawCapabilities);
			if (this.capabilities) {
				for (let [capa] of this.capabilities) if (/^AUTH=/i.test(capa) && !this.authCapabilities.has(capa.toUpperCase())) this.authCapabilities.set(capa.toUpperCase(), false);
			}
			if (this.expectCapabilityUpdate) this.expectCapabilityUpdate = false;
		}
		async sectionCapability(section) {
			this.updateCapabilitiesFromRaw(section);
		}
		async untaggedCapability(untagged) {
			this.updateCapabilitiesFromRaw(untagged.attributes);
		}
		async untaggedExists(untagged) {
			if (!this.mailbox) return;
			if (!untagged || !untagged.command || isNaN(untagged.command)) return;
			let count = Number(untagged.command);
			if (count === this.mailbox.exists) return;
			let prevCount = this.mailbox.exists;
			this.mailbox.exists = count;
			this.emit("exists", {
				path: this.mailbox.path,
				count,
				prevCount
			});
		}
		async untaggedExpunge(untagged) {
			if (!this.mailbox) return;
			if (!untagged || !untagged.command || isNaN(untagged.command)) return;
			let seq = Number(untagged.command);
			if (seq && seq <= this.mailbox.exists) {
				this.mailbox.exists--;
				let payload = {
					path: this.mailbox.path,
					seq,
					vanished: false
				};
				if (typeof this.options.expungeHandler === "function") try {
					await this.options.expungeHandler(payload);
				} catch (err) {
					this.log.error({
						msg: "Failed to notify expunge event",
						payload,
						error: err,
						cid: this.id
					});
				}
				else this.emit("expunge", payload);
			}
		}
		async untaggedVanished(untagged, mailbox) {
			mailbox = mailbox || this.mailbox;
			if (!mailbox) return;
			let tags = [];
			let uids = false;
			if (untagged.attributes.length > 1 && Array.isArray(untagged.attributes[0])) {
				tags = untagged.attributes[0].map((entry) => typeof entry.value === "string" ? entry.value.toUpperCase() : false).filter((value) => value);
				untagged.attributes.shift();
			}
			if (untagged.attributes[0] && typeof untagged.attributes[0].value === "string") uids = untagged.attributes[0].value;
			let uidList = expandRange(uids);
			for (let uid of uidList) {
				let payload = {
					path: mailbox.path,
					uid,
					vanished: true,
					earlier: tags.includes("EARLIER")
				};
				if (typeof this.options.expungeHandler === "function") try {
					await this.options.expungeHandler(payload);
				} catch (err) {
					this.log.error({
						msg: "Failed to notify expunge event",
						payload,
						error: err,
						cid: this.id
					});
				}
				else this.emit("expunge", payload);
			}
		}
		async untaggedFetch(untagged, mailbox) {
			mailbox = mailbox || this.mailbox;
			if (!mailbox) return;
			let message = await formatMessageResponse(untagged, mailbox);
			if (message.flags) {
				let updateEvent = {
					path: mailbox.path,
					seq: message.seq
				};
				if (message.uid) updateEvent.uid = message.uid;
				if (message.modseq) updateEvent.modseq = message.modseq;
				updateEvent.flags = message.flags;
				if (message.flagColor) updateEvent.flagColor = message.flagColor;
				this.emit("flags", updateEvent);
			}
		}
		async ensureSelectedMailbox(path) {
			if (!path) return false;
			if (!this.mailbox || !comparePaths(this, this.mailbox.path, path)) return await this.mailboxOpen(path);
			return true;
		}
		async resolveRange(range, options) {
			if (typeof range === "number" || typeof range === "bigint") range = range.toString();
			if (range === "*") {
				if (!this.mailbox.exists) return false;
				range = this.mailbox.exists.toString();
				options.uid = false;
			}
			if (range && typeof range === "object" && !Array.isArray(range)) if (range.all && Object.keys(range).length === 1) range = "1:*";
			else if (range.uid && Object.keys(range).length === 1) {
				range = range.uid;
				options.uid = true;
			} else {
				options.uid = true;
				range = await this.run("SEARCH", range, options);
				if (range && range.length) range = packMessageRange(range);
			}
			if (Array.isArray(range)) range = range.join(",");
			if (!range) return false;
			return range;
		}
		autoidle() {
			clearTimeout(this.idleStartTimer);
			if (this.options.disableAutoIdle || this.state !== this.states.SELECTED) return;
			this.idleStartTimer = setTimeout(() => {
				this.idle().catch((err) => this.log.warn({
					err,
					cid: this.id
				}));
			}, 15 * 1e3);
		}
		/**
		* Initiates a connection against IMAP server. Throws if anything goes wrong. This is something you have to call before you can run any IMAP commands
		*
		* @returns {Promise<void>}
		* @throws Will throw an error if connection or authentication fails
		* @example
		* let client = new ImapFlow({...});
		* await client.connect();
		*/
		async connect() {
			if (this._connectCalled) throw new Error("Can not re-use ImapFlow instance");
			this._connectCalled = true;
			let connector = this.secureConnection ? tls : net;
			let opts = Object.assign({
				host: this.host,
				servername: this.servername,
				port: this.port
			}, this.options.tls || {});
			this.untaggedHandlers.OK = (...args) => this.initialOK(...args);
			this.untaggedHandlers.BYE = (...args) => this.serverBye(...args);
			this.untaggedHandlers.PREAUTH = (...args) => this.initialPREAUTH(...args);
			this.untaggedHandlers.CAPABILITY = (...args) => this.untaggedCapability(...args);
			this.sectionHandlers.CAPABILITY = (...args) => this.sectionCapability(...args);
			this.untaggedHandlers.EXISTS = (...args) => this.untaggedExists(...args);
			this.untaggedHandlers.EXPUNGE = (...args) => this.untaggedExpunge(...args);
			this.untaggedHandlers.FETCH = (untagged) => this.untaggedFetch(untagged);
			this.untaggedHandlers.VANISHED = (untagged) => this.untaggedVanished(untagged);
			let socket = false;
			if (this.options.proxy) try {
				socket = await proxyConnection(this.log, this.options.proxy, this.host, this.port);
				if (!socket) throw new Error("Failed to setup proxy connection");
			} catch (err) {
				let error = /* @__PURE__ */ new Error("Failed to setup proxy connection");
				error.code = err.code || "ProxyError";
				error._err = err;
				this.log.error({
					error,
					cid: this.id
				});
				throw error;
			}
			let connectPromise = new Promise((resolve, reject) => {
				this.connectTimeout = setTimeout(() => {
					let err = /* @__PURE__ */ new Error("Failed to establish connection in required time");
					err.code = "CONNECT_TIMEOUT";
					err.details = { 
					/* c8 ignore next */ connectionTimeout: this.options.connectionTimeout || CONNECT_TIMEOUT };
					this.log.error({
						err,
						cid: this.id
					});
					this.closeAfter();
					reject(err);
				}, this.options.connectionTimeout || CONNECT_TIMEOUT);
				let onConnect = () => {
					try {
						clearTimeout(this.connectTimeout);
						detachEarlyErrorHandler(socket);
						this.socket.setKeepAlive(true, 5 * 1e3);
						this.socket.setTimeout(this.options.socketTimeout || SOCKET_TIMEOUT);
						this.greetingTimeout = setTimeout(() => {
							let err = /* @__PURE__ */ new Error(
								/* c8 ignore next */
								`Failed to receive greeting from server in required time${!this.secureConnection ? ". Maybe should use TLS?" : ""}`
							);
							err.code = "GREETING_TIMEOUT";
							err.details = { 
							/* c8 ignore next */ greetingTimeout: this.options.greetingTimeout || GREETING_TIMEOUT };
							this.log.error({
								err,
								cid: this.id
							});
							this.closeAfter();
							reject(err);
						}, this.options.greetingTimeout || GREETING_TIMEOUT);
						this.tls = typeof this.socket.getCipher === "function" ? this.socket.getCipher() : false;
						let logInfo = {
							src: "connection",
							msg: `Established ${this.tls ? "secure " : ""}TCP connection`,
							cid: this.id,
							secure: !!this.tls,
							host: this.host,
							servername: this.servername,
							port: this.socket.remotePort,
							address: this.socket.remoteAddress,
							localAddress: this.socket.localAddress,
							localPort: this.socket.localPort
						};
						if (this.tls) {
							logInfo.authorized = this.tls.authorized = this.socket.authorized;
							/* c8 ignore next */ logInfo.algo = this.tls.standardName || this.tls.name;
							logInfo.version = this.tls.version;
						}
						this.log.info(logInfo);
						this.setSocketHandlers();
						this.setEventHandlers();
						this.socket.pipe(this.streamer);
						this.initialResolve = resolve;
						this.initialReject = reject;
					} catch (ex) {
						reject(ex);
					}
				};
				if (socket) if (this.secureConnection) {
					opts.socket = socket;
					this.socket = connector.connect(opts, onConnect);
				} else {
					this.socket = socket;
					setImmediate(onConnect);
				}
				else this.socket = connector.connect(opts, onConnect);
				this.writeSocket = this.socket;
				this._connectErrorHandler = (err) => {
					clearTimeout(this.connectTimeout);
					clearTimeout(this.greetingTimeout);
					this.closeAfter();
					this.log.error({
						err,
						cid: this.id
					});
					reject(err);
				};
				this.socket.on("error", this._connectErrorHandler);
			});
			connectPromise.catch(noop);
			await connectPromise;
		}
		/**
		* Graceful connection close by sending logout command to server. TCP connection is closed once command is finished.
		*
		* @return {Promise<void>}
		* @example
		* let client = new ImapFlow({...});
		* await client.connect();
		* ...
		* await client.logout();
		*/
		async logout() {
			return await this.run("LOGOUT");
		}
		/**
		* Close the TCP connection.
		* Unlike `close()`, return immediately from this function, allowing the
		* caller function to proceed, and run `close()` function afterwards.
		*/
		closeAfter() {
			setImmediate(() => this.close());
		}
		createNoConnectionError(byeReason) {
			const error = /* @__PURE__ */ new Error("Connection not available");
			error.code = "NoConnection";
			if (byeReason) error.reason = byeReason;
			return error;
		}
		/**
		* Closes TCP connection without notifying the server.
		*
		* @example
		* let client = new ImapFlow({...});
		* await client.connect();
		* ...
		* client.close();
		*/
		close() {
			try {
				clearTimeout(this.idleStartTimer);
				clearTimeout(this.upgradeTimeout);
				clearTimeout(this.connectTimeout);
				clearTimeout(this.greetingTimeout);
				clearTimeout(this._throttleTimer);
				this._throttleTimer = null;
				if (typeof this._throttleAbort === "function") {
					this._throttleAbort(true);
					this._throttleAbort = null;
				}
				this.usable = false;
				this.idling = false;
				if (typeof this.initialReject === "function" && !this.options.verifyOnly) {
					clearTimeout(this.greetingTimeout);
					let reject = this.initialReject;
					this.initialResolve = false;
					this.initialReject = false;
					let err = /* @__PURE__ */ new Error("Unexpected close");
					/* c8 ignore next */ err.code = `ClosedAfterConnect${this.secureConnection ? "TLS" : "Text"}`;
					if (this.byeReason) err.reason = this.byeReason;
					reject(err);
				}
				if (typeof this.preCheck === "function") this.preCheck().catch((err) => this.log.warn({
					err,
					cid: this.id
				}));
				let pendingRequests = [];
				if (this.currentRequest && this.requestTagMap.has(this.currentRequest.tag)) {
					let tag = this.currentRequest.tag;
					let request = this.requestTagMap.get(tag);
					if (request) {
						this.requestTagMap.delete(tag);
						pendingRequests.push(request);
					}
					this.currentRequest = false;
				}
				while (this.requestQueue.length) {
					let req = this.requestQueue.shift();
					if (req && this.requestTagMap.has(req.tag)) {
						let request = this.requestTagMap.get(req.tag);
						if (request) {
							this.requestTagMap.delete(req.tag);
							pendingRequests.push(request);
						}
					}
				}
				const createNoConnectionError = (byeReason) => this.createNoConnectionError(byeReason);
				let byeReason = this.byeReason;
				for (let request of pendingRequests) request.reject(createNoConnectionError(byeReason));
				if (this.currentLock && this.currentLock.heldWarnTimer) {
					clearTimeout(this.currentLock.heldWarnTimer);
					this.currentLock.heldWarnTimer = null;
				}
				this.currentLock = false;
				if (this.locks && this.locks.length) {
					let pendingLocks = this.locks.splice(0);
					for (let lock of pendingLocks) {
						if (lock.acquireTimer) {
							clearTimeout(lock.acquireTimer);
							lock.acquireTimer = null;
						}
						if (typeof lock.reject === "function") lock.reject(createNoConnectionError(byeReason));
					}
				}
				if (this._inflate) try {
					this._inflate.unpipe();
					this._inflate.destroy();
					this._inflate = null;
				} catch (err) {
					this.log.error({
						err,
						info: "Failed to destroy inflate stream",
						cid: this.id
					});
				}
				if (this._deflate) try {
					this._deflate.unpipe();
					this._deflate.destroy();
					this._deflate = null;
				} catch (err) {
					this.log.error({
						err,
						info: "Failed to destroy deflate stream",
						cid: this.id
					});
				}
				if (this.streamer) try {
					if (this.socketReadable) this.streamer.removeListener("readable", this.socketReadable);
					if (this._streamerErrorHandler) this.streamer.removeListener("error", this._streamerErrorHandler);
					if (!this.streamer.destroyed) this.streamer.destroy();
				} catch (err) {
					this.log.error({
						err,
						info: "Failed to cleanup streamer",
						cid: this.id
					});
				}
				this.clearSocketHandlers();
				this.folders.clear();
				this.requestTagMap.clear();
				this.state = this.states.LOGOUT;
				if (this.isClosed) return;
				if (this.socket && !this.socket.destroyed && this.writeSocket !== this.socket) try {
					this.socket.destroy();
				} catch (err) {
					this.log.error({
						err,
						cid: this.id
					});
				}
				this.isClosed = true;
				if (this.writeSocket && !this.writeSocket.destroyed) try {
					this.writeSocket.destroy();
				} catch (err) {
					this.log.error({
						err,
						cid: this.id
					});
				}
				if (this.socket && !this.socket.destroyed && this.writeSocket !== this.socket) try {
					this.socket.destroy();
				} catch (err) {
					this.log.error({
						err,
						cid: this.id
					});
				}
				this.socket = null;
				this.writeSocket = null;
				this._inflate = null;
				this._deflate = null;
				this._streamerErrorHandler = null;
				this._connectErrorHandler = null;
				this._socketError = null;
				this._socketClose = null;
				this._socketEnd = null;
				this._socketTimeout = null;
				this.log.trace({
					msg: "Connection closed",
					cid: this.id
				});
				this.emit("close");
			} catch (ex) {
				this.log.error(ex);
			}
		}
		/**
		* @typedef {Object} QuotaResponse
		* @global
		* @property {String} path=INBOX mailbox path this quota applies to
		* @property {Object} [storage] Storage quota if provided by server
		* @property {Number} [storage.used] used storage in bytes
		* @property {Number} [storage.limit] total storage available
		* @property {Object} [messages] Message count quota if provided by server
		* @property {Number} [messages.used] stored messages
		* @property {Number} [messages.limit] maximum messages allowed
		*/
		/**
		* Returns current quota
		*
		* @param {String} [path] Optional mailbox path if you want to check quota for specific folder
		* @returns {Promise<QuotaResponse|Boolean>} Quota information or `false` if QUOTA extension is not supported or requested path does not exist
		*
		* @example
		* let quota = await client.getQuota();
		* console.log(quota.storage.used, quota.storage.limit)
		*/
		async getQuota(path) {
			path = path || "INBOX";
			return await this.run("QUOTA", path);
		}
		/**
		* @typedef {Object} ListResponse
		* @global
		* @property {String} path mailbox path (unicode string)
		* @property {String} pathAsListed mailbox path as listed in the LIST/LSUB response
		* @property {String} name mailbox name (last part of path after delimiter)
		* @property {String} delimiter mailbox path delimiter, usually "." or "/"
		* @property {String[]} parent An array of parent folder names. All names are in unicode
		* @property {String} parentPath Same as `parent`, but as a complete string path (unicode string)
		* @property {Set<string>} flags a set of flags for this mailbox
		* @property {String} specialUse one of special-use flags (if applicable): "\All", "\Archive", "\Drafts", "\Flagged", "\Junk", "\Sent", "\Trash". Additionally INBOX has non-standard "\Inbox" flag set
		* @property {Boolean} listed `true` if mailbox was found from the output of LIST command
		* @property {Boolean} subscribed `true` if the mailbox is subscribed - reported by LSUB or by LIST RETURN (SUBSCRIBED) on LIST-EXTENDED/IMAP4rev2 servers
		* @property {StatusObject} [status] If `statusQuery` was used, then this value includes the status response
		*/
		/**
		* @typedef {Object} ListOptions
		* @global
		* @property {Object} [statusQuery] request status items for every listed entry
		* @property {Boolean} [statusQuery.messages] if `true` request count of messages
		* @property {Boolean} [statusQuery.recent] if `true` request count of messages with \\Recent tag
		* @property {Boolean} [statusQuery.uidNext] if `true` request predicted next UID
		* @property {Boolean} [statusQuery.uidValidity] if `true` request mailbox `UIDVALIDITY` value
		* @property {Boolean} [statusQuery.unseen] if `true` request count of unseen messages
		* @property {Boolean} [statusQuery.highestModseq] if `true` request last known modseq value
		* @property {Object} [specialUseHints] set specific paths as special use folders, this would override special use flags provided from the server
		* @property {String} [specialUseHints.sent] Path to "Sent Mail" folder
		* @property {String} [specialUseHints.trash] Path to "Trash" folder
		* @property {String} [specialUseHints.junk] Path to "Junk Mail" folder
		* @property {String} [specialUseHints.drafts] Path to "Drafts" folder
		*/
		/**
		* Lists available mailboxes as an Array
		*
		* @param {ListOptions} [options] defines additional listing options
		* @returns {Promise<ListResponse[]>} An array of ListResponse objects
		*
		* @example
		* let list = await client.list();
		* list.forEach(mailbox=>console.log(mailbox.path));
		*/
		async list(options) {
			options = options || {};
			let folders = await this.run("LIST", "", "*", options);
			this.folders = new Map(folders.map((folder) => [folder.path, folder]));
			return folders;
		}
		/**
		* @typedef {Object} ListTreeResponse
		* @global
		* @property {Boolean} root If `true` then this is root node without any additional properties besides *folders*
		* @property {String} path mailbox path
		* @property {String} name mailbox name (last part of path after delimiter)
		* @property {String} delimiter mailbox path delimiter, usually "." or "/"
		* @property {Set<string>} flags list of flags for this mailbox
		* @property {String} specialUse one of special-use flags (if applicable): "\All", "\Archive", "\Drafts", "\Flagged", "\Junk", "\Sent", "\Trash". Additionally INBOX has non-standard "\Inbox" flag set
		* @property {Boolean} listed `true` if mailbox was found from the output of LIST command
		* @property {Boolean} subscribed `true` if the mailbox is subscribed - reported by LSUB or by LIST RETURN (SUBSCRIBED) on LIST-EXTENDED/IMAP4rev2 servers
		* @property {Boolean} disabled If `true` then this mailbox can not be selected in the UI
		* @property {ListTreeResponse[]} folders An array of subfolders
		* @property {StatusObject} [status] If `statusQuery` was used, then this value includes the status response
		*/
		/**
		* Lists available mailboxes as a tree structured object
		*
		* @param {ListOptions} [options] defines additional listing options
		* @returns {Promise<ListTreeResponse>} Tree structured object
		*
		* @example
		* let tree = await client.listTree();
		* tree.folders.forEach(mailbox=>console.log(mailbox.path));
		*/
		async listTree(options) {
			options = options || {};
			let folders = await this.run("LIST", "", "*", options);
			this.folders = new Map(folders.map((folder) => [folder.path, folder]));
			return getFolderTree(folders);
		}
		/**
		* Performs a no-op call against server
		* @returns {Promise<void>}
		*/
		async noop() {
			await this.run("NOOP");
		}
		/**
		* @typedef {Object} MailboxCreateResponse
		* @global
		* @property {String} path full mailbox path
		* @property {String} [mailboxId] unique mailbox ID if server supports `OBJECTID` extension (currently Yahoo and some others)
		* @property {Boolean} created If `true` then mailbox was created otherwise it already existed
		*/
		/**
		* Creates a new mailbox folder and sets up subscription for the created mailbox. Throws on error.
		*
		* @param {string|array} path Full mailbox path. Unicode is allowed. If value is an array then it is joined using current delimiter symbols. Namespace prefix is added automatically if required.
		* @returns {Promise<MailboxCreateResponse>} Mailbox info
		* @throws Will throw an error if mailbox can not be created
		*
		* @example
		* let info = await client.mailboxCreate(['parent', 'child']);
		* console.log(info.path);
		* // "INBOX.parent.child" // assumes "INBOX." as namespace prefix and "." as delimiter
		*/
		async mailboxCreate(path) {
			return await this.run("CREATE", path);
		}
		/**
		* @typedef {Object} MailboxRenameResponse
		* @global
		* @property {String} path full mailbox path that was renamed
		* @property {String} newPath new full mailbox path
		*/
		/**
		* Renames a mailbox. Throws on error.
		*
		* @param {string|array} path  Path for the mailbox to rename. Unicode is allowed. If value is an array then it is joined using current delimiter symbols. Namespace prefix is added automatically if required.
		* @param {string|array} newPath New path for the mailbox
		* @returns {Promise<MailboxRenameResponse>} Mailbox info
		* @throws Will throw an error if mailbox does not exist or can not be renamed
		*
		* @example
		* let info = await client.mailboxRename('parent.child', 'Important stuff ❗️');
		* console.log(info.newPath);
		* // "INBOX.Important stuff ❗️" // assumes "INBOX." as namespace prefix
		*/
		async mailboxRename(path, newPath) {
			return await this.run("RENAME", path, newPath);
		}
		/**
		* @typedef {Object} MailboxDeleteResponse
		* @global
		* @property {String} path full mailbox path that was deleted
		*/
		/**
		* Deletes a mailbox. Throws on error.
		*
		* @param {string|array} path Path for the mailbox to delete. Unicode is allowed. If value is an array then it is joined using current delimiter symbols. Namespace prefix is added automatically if required.
		* @returns {Promise<MailboxDeleteResponse>} Mailbox info
		* @throws Will throw an error if mailbox does not exist or can not be deleted
		*
		* @example
		* let info = await client.mailboxDelete('Important stuff ❗️');
		* console.log(info.path);
		* // "INBOX.Important stuff ❗️" // assumes "INBOX." as namespace prefix
		*/
		async mailboxDelete(path) {
			return await this.run("DELETE", path);
		}
		/**
		* Subscribes to a mailbox
		*
		* @param {string|array} path Path for the mailbox to subscribe to. Unicode is allowed. If value is an array then it is joined using current delimiter symbols. Namespace prefix is added automatically if required.
		* @returns {Promise<Boolean>} `true` if subscription operation succeeded, `false` otherwise
		*
		* @example
		* await client.mailboxSubscribe('Important stuff ❗️');
		*/
		async mailboxSubscribe(path) {
			return await this.run("SUBSCRIBE", path);
		}
		/**
		* Unsubscribes from a mailbox
		*
		* @param {string|array} path **Path for the mailbox** to unsubscribe from. Unicode is allowed. If value is an array then it is joined using current delimiter symbols. Namespace prefix is added automatically if required.
		* @returns {Promise<Boolean>} `true` if unsubscription operation succeeded, `false` otherwise
		*
		* @example
		* await client.mailboxUnsubscribe('Important stuff ❗️');
		*/
		async mailboxUnsubscribe(path) {
			return await this.run("UNSUBSCRIBE", path);
		}
		/**
		* Opens a mailbox to access messages. You can perform message operations only against an opened mailbox.
		* Using {@link module:imapflow~ImapFlow#getMailboxLock|getMailboxLock()} instead of `mailboxOpen()` is preferred. Both do the same thing
		* but next `getMailboxLock()` call is not executed until previous one is released.
		*
		* @param {string|array} path **Path for the mailbox** to open
		* @param {Object} [options] optional options
		* @param {Boolean} [options.readOnly=false] If `true` then opens mailbox in read-only mode. You can still try to perform write operations but these would probably fail.
		* @returns {Promise<MailboxObject>} Mailbox info
		* @throws Will throw an error if mailbox does not exist or can not be opened
		*
		* @example
		* let mailbox = await client.mailboxOpen('Important stuff ❗️');
		* console.log(mailbox.exists);
		* // 125
		*/
		async mailboxOpen(path, options) {
			return await this.run("SELECT", path, options);
		}
		/**
		* Closes a previously opened mailbox
		*
		* @returns {Promise<Boolean>} Did the operation succeed or not
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* await client.mailboxClose();
		*/
		async mailboxClose() {
			return await this.run("CLOSE");
		}
		/**
		* @typedef {Object} StatusObject
		* @global
		* @property {String} path full mailbox path that was checked
		* @property {Number} [messages] Count of messages
		* @property {Number} [recent] Count of messages with \\Recent tag
		* @property {Number} [uidNext] Predicted next UID
		* @property {BigInt} [uidValidity] Mailbox `UIDVALIDITY` value
		* @property {Number} [unseen] Count of unseen messages
		* @property {BigInt} [highestModseq] Last known modseq value (if CONDSTORE extension is enabled)
		*/
		/**
		* Requests the status of the indicated mailbox. Only requested status values will be returned.
		*
		* @param {String} path mailbox path to check for (unicode string)
		* @param {Object} query defines requested status items
		* @param {Boolean} query.messages if `true` request count of messages
		* @param {Boolean} query.recent if `true` request count of messages with \\Recent tag
		* @param {Boolean} query.uidNext if `true` request predicted next UID
		* @param {Boolean} query.uidValidity if `true` request mailbox `UIDVALIDITY` value
		* @param {Boolean} query.unseen if `true` request count of unseen messages
		* @param {Boolean} query.highestModseq if `true` request last known modseq value
		* @returns {Promise<StatusObject>} status of the indicated mailbox
		*
		* @example
		* let status = await client.status('INBOX', {unseen: true});
		* console.log(status.unseen);
		* // 123
		*/
		async status(path, query) {
			return await this.run("STATUS", path, query);
		}
		/**
		* Starts listening for new or deleted messages from the currently opened mailbox. Only required if {@link ImapFlow#disableAutoIdle} is set to `true`
		* otherwise IDLE is started by default on connection inactivity. NB! If `idle()` is called manually then it does not
		* return until IDLE is finished which means you would have to call some other command out of scope.
		*
		* @returns {Promise<Boolean>} Did the operation succeed or not
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		*
		* await client.idle();
		*/
		async idle() {
			if (!this.idling) return await this.run("IDLE", this.maxIdleTime);
		}
		/**
		* Sequence range string. Separate different values with commas, number ranges with colons and use \\* as the placeholder for the newest message in mailbox
		* @typedef {String} SequenceString
		* @global
		* @example
		* "1:*" // for all messages
		* "1,2,3" // for messages 1, 2 and 3
		* "1,2,4:6" // for messages 1,2,4,5,6
		* "*" // for the newest message
		*/
		/**
		* IMAP search query options. By default all conditions must match. In case of `or` query term at least one condition must match.
		* @typedef {Object} SearchObject
		* @global
		* @property {SequenceString} [seq] message ordering sequence range
		* @property {Boolean} [answered] Messages with (value is `true`) or without (value is `false`) \\Answered flag
		* @property {Boolean} [deleted] Messages with (value is `true`) or without (value is `false`) \\Deleted flag
		* @property {Boolean} [draft] Messages with (value is `true`) or without (value is `false`) \\Draft flag
		* @property {Boolean} [flagged] Messages with (value is `true`) or without (value is `false`) \\Flagged flag
		* @property {Boolean} [seen] Messages with (value is `true`) or without (value is `false`) \\Seen flag
		* @property {Boolean} [all] If `true` matches all messages
		* @property {Boolean} [new] If `true` matches messages that have the \\Recent flag set but not the \\Seen flag
		* @property {Boolean} [old] If `true` matches messages that do not have the \\Recent flag set
		* @property {Boolean} [recent] If `true` matches messages that have the \\Recent flag set
		* @property {String} [from] Matches From: address field
		* @property {String} [to] Matches To: address field
		* @property {String} [cc] Matches Cc: address field
		* @property {String} [bcc] Matches Bcc: address field
		* @property {String} [body] Matches message body
		* @property {String} [subject] Matches message subject
		* @property {Number} [larger] Matches messages larger than value
		* @property {Number} [smaller] Matches messages smaller than value
		* @property {SequenceString} [uid] UID sequence range
		* @property {BigInt} [modseq] Matches messages with modseq higher than value
		* @property {String} [emailId] unique email ID. Only used if server supports `OBJECTID` or `X-GM-EXT-1` extensions
		* @property {String} [threadId] unique thread ID. Only used if server supports `OBJECTID` or `X-GM-EXT-1` extensions
		* @property {Date|string} [before] Matches messages received before date
		* @property {Date|string} [on] Matches messages received on date (ignores time)
		* @property {Date|string} [since] Matches messages received after date
		* @property {Date|string} [sentBefore] Matches messages sent before date
		* @property {Date|string} [sentOn] Matches messages sent on date (ignores time)
		* @property {Date|string} [sentSince] Matches messages sent after date
		* @property {String} [keyword] Matches messages that have the custom flag set
		* @property {String} [unKeyword] Matches messages that do not have the custom flag set
		* @property {Object.<string, Boolean|String>} [header] Matches messages with header key set if value is `true` (**NB!** not supported by all servers) or messages where header partially matches a string value
		* @property {SearchObject} [not] A {@link SearchObject} object. It must not match.
		* @property {SearchObject[]} [or] An array of 2 or more {@link SearchObject} objects. At least one of these must match
		*/
		/**
		* Sets flags for a message or message range
		*
		* @param {SequenceString | Number[] | SearchObject} range Range to filter the messages
		* @param {string[]} flags Array of flags to set. Only flags that are permitted to set are used, other flags are ignored
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID {@link SequenceString} instead of sequence numbers
		* @param {BigInt} [options.unchangedSince] If set then only messages with a lower or equal `modseq` value are updated. Ignored if server does not support `CONDSTORE` extension.
		* @param {Boolean} [options.useLabels=false] If true then update Gmail labels instead of message flags
		* @returns {Promise<Boolean>} Did the operation succeed or not
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // mark all unseen messages as seen (and remove other flags)
		* await client.messageFlagsSet({seen: false}, ['\Seen]);
		*/
		async messageFlagsSet(range, flags, options) {
			options = options || {};
			range = await this.resolveRange(range, options);
			if (!range) return false;
			let queryOpts = Object.assign({ operation: "set" }, options);
			return await this.run("STORE", range, flags, queryOpts);
		}
		/**
		* Adds flags for a message or message range
		*
		* @param {SequenceString | Number[] | SearchObject} range Range to filter the messages
		* @param {string[]} flags Array of flags to set. Only flags that are permitted to set are used, other flags are ignored
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID {@link SequenceString} instead of sequence numbers
		* @param {BigInt} [options.unchangedSince] If set then only messages with a lower or equal `modseq` value are updated. Ignored if server does not support `CONDSTORE` extension.
		* @param {Boolean} [options.useLabels=false] If true then update Gmail labels instead of message flags
		* @returns {Promise<Boolean>} Did the operation succeed or not
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // mark all unseen messages as seen (and keep other flags as is)
		* await client.messageFlagsAdd({seen: false}, ['\Seen]);
		*/
		async messageFlagsAdd(range, flags, options) {
			options = options || {};
			range = await this.resolveRange(range, options);
			if (!range) return false;
			let queryOpts = Object.assign({ operation: "add" }, options);
			return await this.run("STORE", range, flags, queryOpts);
		}
		/**
		* Remove specific flags from a message or message range
		*
		* @param {SequenceString | Number[] | SearchObject} range Range to filter the messages
		* @param {string[]} flags Array of flags to remove. Only flags that are permitted to set are used, other flags are ignored
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID {@link SequenceString} instead of sequence numbers
		* @param {BigInt} [options.unchangedSince] If set then only messages with a lower or equal `modseq` value are updated. Ignored if server does not support `CONDSTORE` extension.
		* @param {Boolean} [options.useLabels=false] If true then update Gmail labels instead of message flags
		* @returns {Promise<Boolean>} Did the operation succeed or not
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // mark all seen messages as unseen by removing \\Seen flag
		* await client.messageFlagsRemove({seen: true}, ['\Seen]);
		*/
		async messageFlagsRemove(range, flags, options) {
			options = options || {};
			range = await this.resolveRange(range, options);
			if (!range) return false;
			let queryOpts = Object.assign({ operation: "remove" }, options);
			return await this.run("STORE", range, flags, queryOpts);
		}
		/**
		* Sets a colored flag for an email. Only supported by mail clients like Apple Mail
		*
		* @param {SequenceString | Number[] | SearchObject} range Range to filter the messages
		* @param {string} color The color to set. One of 'red', 'orange', 'yellow', 'green', 'blue', 'purple', and 'grey'
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID {@link SequenceString} instead of sequence numbers
		* @param {BigInt} [options.unchangedSince] If set then only messages with a lower or equal `modseq` value are updated. Ignored if server does not support `CONDSTORE` extension.
		* @returns {Promise<Boolean>} Did the operation succeed or not
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // add a purple flag for all emails
		* await client.setFlagColor('1:*', 'Purple');
		*/
		async setFlagColor(range, color, options) {
			options = options || {};
			range = await this.resolveRange(range, options);
			if (!range) return false;
			let flagChanges = getColorFlags(color);
			if (!flagChanges) return false;
			let addResults;
			let removeResults;
			if (flagChanges.add && flagChanges.add.length) {
				let queryOpts = Object.assign({ operation: "add" }, options, {
					useLabels: false,
					silent: flagChanges.remove && flagChanges.remove.length
				});
				addResults = await this.run("STORE", range, flagChanges.add, queryOpts);
			}
			if (flagChanges.remove && flagChanges.remove.length) {
				let queryOpts = Object.assign({ operation: "remove" }, options, { useLabels: false });
				removeResults = await this.run("STORE", range, flagChanges.remove, queryOpts);
			}
			return addResults || removeResults || false;
		}
		/**
		* Delete messages from the currently opened mailbox. Method does not indicate info about deleted messages,
		* instead you should be using {@link ImapFlow#expunge} event for this
		*
		* @param {SequenceString | Number[] | SearchObject} range Range to filter the messages
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID {@link SequenceString} instead of sequence numbers
		* @returns {Promise<Boolean>} Did the operation succeed or not
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // delete all seen messages
		* await client.messageDelete({seen: true});
		*/
		async messageDelete(range, options) {
			options = options || {};
			range = await this.resolveRange(range, options);
			if (!range) return false;
			return await this.run("EXPUNGE", range, options);
		}
		/**
		* @typedef {Object} AppendResponseObject
		* @global
		* @property {String} destination full mailbox path where the message was uploaded to
		* @property {BigInt} [uidValidity] mailbox `UIDVALIDITY` if server has `UIDPLUS` extension enabled
		* @property {Number} [uid] UID of the uploaded message if server has `UIDPLUS` extension enabled
		* @property {Number} [seq] sequence number of the uploaded message if path is currently selected mailbox
		*/
		/**
		* Appends a new message to a mailbox
		*
		* @param {String} path Mailbox path to upload the message to (unicode string)
		* @param {string|Buffer} content RFC822 formatted email message
		* @param {string[]} [flags] an array of flags to be set for the uploaded message
		* @param {Date|string} [idate=now] internal date to be set for the message
		* @returns {Promise<AppendResponseObject>} info about uploaded message
		*
		* @example
		* await client.append('INBOX', rawMessageBuffer, ['\\Seen'], new Date(2000, 1, 1));
		*/
		async append(path, content, flags, idate) {
			return await this.run("APPEND", path, content, flags, idate) || false;
		}
		/**
		* @typedef {Object} CopyResponseObject
		* @global
		* @property {String} path path of source mailbox
		* @property {String} destination path of destination mailbox
		* @property {BigInt} [uidValidity] destination mailbox `UIDVALIDITY` if server has `UIDPLUS` extension enabled
		* @property {Map<number, number>} [uidMap] Map of UID values (if server has `UIDPLUS` extension enabled) where key is UID in source mailbox and value is the UID for the same message in destination mailbox
		*/
		/**
		* Copies messages from current mailbox to destination mailbox
		*
		* @param {SequenceString | Number[] | SearchObject} range Range of messages to copy
		* @param {String} destination Mailbox path to copy the messages to
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID {@link SequenceString} instead of sequence numbers
		* @returns {Promise<CopyResponseObject>} info about copies messages
		*
		* @example
		* await client.mailboxOpen('INBOX');
		* // copy all messages to a mailbox called "Backup" (must exist)
		* let result = await client.messageCopy('1:*', 'Backup');
		* console.log('Copied %s messages', result.uidMap.size);
		*/
		async messageCopy(range, destination, options) {
			options = options || {};
			range = await this.resolveRange(range, options);
			if (!range) return false;
			return await this.run("COPY", range, destination, options);
		}
		/**
		* Moves messages from current mailbox to destination mailbox
		*
		* @param {SequenceString | Number[] | SearchObject} range Range of messages to move
		* @param {String} destination Mailbox path to move the messages to
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID {@link SequenceString} instead of sequence numbers
		* @returns {Promise<CopyResponseObject>} info about moved messages
		*
		* @example
		* await client.mailboxOpen('INBOX');
		* // move all messages to a mailbox called "Trash" (must exist)
		* let result = await client.messageMove('1:*', 'Trash');
		* console.log('Moved %s messages', result.uidMap.size);
		*/
		async messageMove(range, destination, options) {
			options = options || {};
			range = await this.resolveRange(range, options);
			if (!range) return false;
			return await this.run("MOVE", range, destination, options);
		}
		/**
		* Search messages from the currently opened mailbox
		*
		* @param {SearchObject} query Query to filter the messages
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then returns UID numbers instead of sequence numbers
		* @returns {Promise<Number[]>} An array of sequence or UID numbers
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // find all unseen messages
		* let list = await client.search({seen: false});
		* // use OR modifier (array of 2 or more search queries)
		* let list = await client.search({
		*   seen: false,
		*   or: [
		*     {flagged: true},
		*     {from: 'andris'},
		*     {subject: 'test'}
		*   ]});
		*/
		async search(query, options) {
			if (!this.mailbox) return;
			const result = await this.run("SEARCH", query, options) || false;
			if (options && options.returnOptions && Array.isArray(result)) {
				const arr = result;
				const normalizedOptions = options.returnOptions.map((o) => typeof o === "string" ? o.toUpperCase() : o);
				const esearch = {};
				if (normalizedOptions.includes("COUNT")) esearch.count = arr.length;
				if (normalizedOptions.includes("MIN") && arr.length) esearch.min = arr[0];
				if (normalizedOptions.includes("MAX") && arr.length) esearch.max = arr[arr.length - 1];
				if (normalizedOptions.includes("ALL") && arr.length) esearch.all = packMessageRange(arr);
				if (Object.keys(esearch).length === 0) return result;
				return esearch;
			}
			return result;
		}
		/**
		* @typedef {Object} FetchQueryObject
		* @global
		* @property {Boolean} [uid] if `true` then include UID in the response
		* @property {Boolean} [flags] if `true` then include flags Set in the response. Also adds `flagColor` to the response if the message is flagged.
		* @property {Boolean} [bodyStructure] if `true` then include parsed BODYSTRUCTURE object in the response
		* @property {Boolean} [envelope] if `true` then include parsed ENVELOPE object in the response
		* @property {Boolean} [internalDate] if `true` then include internal date value in the response
		* @property {Boolean} [size] if `true` then include message size in the response
		* @property {boolean | Object} [source] if `true` then include full message in the response
		* @property {Number} [source.start] include full message in the response starting from *start* byte
		* @property {Number} [source.maxLength] include full message in the response, up to *maxLength* bytes
		* @property {Boolean} [threadId] if `true` then include thread ID in the response (only if server supports either `OBJECTID` or `X-GM-EXT-1` extensions)
		* @property {Boolean} [labels] if `true` then include GMail labels in the response (only if server supports `X-GM-EXT-1` extension)
		* @property {boolean | string[]} [headers] if `true` then includes full headers of the message in the response. If the value is an array of header keys then includes only headers listed in the array
		* @property {string[]} [bodyParts] An array of BODYPART identifiers to include in the response
		* @property {Boolean} [fast] IMAP macro equivalent to `flags`, `internalDate`, `size`
		* @property {Boolean} [all] IMAP macro equivalent to `flags`, `internalDate`, `size`, `envelope`
		* @property {Boolean} [full] IMAP macro equivalent to `flags`, `internalDate`, `size`, `envelope`, `bodyStructure`
		*/
		/**
		* Parsed email address entry
		*
		* @typedef {Object} MessageAddressObject
		* @global
		* @property {String} [name] name of the address object (unicode)
		* @property {String} [address] email address
		*/
		/**
		* Parsed IMAP ENVELOPE object
		*
		* @typedef {Object} MessageEnvelopeObject
		* @global
		* @property {Date} [date] header date
		* @property {String} [subject] message subject (unicode)
		* @property {String} [messageId] Message ID of the message
		* @property {String} [inReplyTo] Message ID from In-Reply-To header
		* @property {MessageAddressObject[]} [from] Array of addresses from the From: header
		* @property {MessageAddressObject[]} [sender] Array of addresses from the Sender: header
		* @property {MessageAddressObject[]} [replyTo] Array of addresses from the Reply-To: header
		* @property {MessageAddressObject[]} [to] Array of addresses from the To: header
		* @property {MessageAddressObject[]} [cc] Array of addresses from the Cc: header
		* @property {MessageAddressObject[]} [bcc] Array of addresses from the Bcc: header
		*/
		/**
		* Parsed IMAP BODYSTRUCTURE object
		*
		* @typedef {Object} MessageStructureObject
		* @global
		* @property {String} part Body part number. This value can be used to later fetch the contents of this part of the message
		* @property {String} type Content-Type of this node
		* @property {Object} [parameters] Additional parameters for Content-Type, eg "charset"
		* @property {String} [id] Content-ID
		* @property {String} [encoding] Transfer encoding
		* @property {Number} [size] Expected size of the node
		* @property {MessageEnvelopeObject} [envelope] message envelope of embedded RFC822 message
		* @property {String} [disposition] Content disposition
		* @property {Object} [dispositionParameters] Additional parameters for Content-Disposition
		* @property {MessageStructureObject[]} childNodes An array of child nodes if this is a multipart node. Not present for normal nodes
		*/
		/**
		* Fetched message data
		*
		* @typedef {Object} FetchMessageObject
		* @global
		* @property {Number} seq message sequence number. Always included in the response
		* @property {Number} uid message UID number. Always included in the response
		* @property {Buffer} [source] message source for the requested byte range
		* @property {BigInt} [modseq] message Modseq number. Always included if the server supports CONDSTORE extension
		* @property {String} [emailId] unique email ID. Always included if server supports `OBJECTID` or `X-GM-EXT-1` extensions
		* @property {String} [threadId] unique thread ID. Only present if server supports `OBJECTID` or `X-GM-EXT-1` extension
		* @property {Set<string>} [labels] a Set of labels. Only present if server supports `X-GM-EXT-1` extension
		* @property {Number} [size] message size
		* @property {Set<string>} [flags] a set of message flags
		* @property {String} [flagColor] flag color like "red", or "yellow". This value is derived from the `flags` Set and it uses the same color rules as Apple Mail
		* @property {MessageEnvelopeObject} [envelope] message envelope
		* @property {MessageStructureObject} [bodyStructure] message body structure
		* @property {Date} [internalDate] message internal date
		* @property {Map<string, Buffer>} [bodyParts] a Map of message body parts where key is requested part identifier and value is a Buffer
		* @property {Buffer} [headers] Requested header lines as Buffer
		*/
		/**
		* Fetch messages from the currently opened mailbox
		*
		* @param {SequenceString | Number[] | SearchObject} range Range of messages to fetch
		* @param {FetchQueryObject} query Fetch query
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID numbers instead of sequence numbers for `range`
		* @param {BigInt} [options.changedSince] If set then only messages with a higher modseq value are returned. Ignored if server does not support `CONDSTORE` extension.
		* @param {Boolean} [options.binary=false] If `true` then requests a binary response if the server supports this
		* @yields {Promise<FetchMessageObject>} Message data object
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // fetch UID for all messages in a mailbox
		* for await (let msg of client.fetch('1:*', {uid: true})){
		*     console.log(msg.uid);
		*     // NB! You can not run any IMAP commands in this loop
		*     // otherwise you will end up in a deadloop
		* }
		*/
		async *fetch(range, query, options) {
			options = options || {};
			if (!this.mailbox) return;
			range = await this.resolveRange(range, options);
			if (!range) return false;
			let finished = false;
			let aborted = false;
			let push = false;
			let rowQueue = [];
			let getNext = () => new Promise((resolve, reject) => {
				let check = () => {
					if (rowQueue.length) {
						let entry = rowQueue.shift();
						if (entry.err) return reject(entry.err);
						return resolve(entry.value);
					}
					if (finished) return resolve(null);
					push = () => {
						push = false;
						check();
					};
				};
				check();
			});
			this.run("FETCH", range, query, {
				uid: !!options.uid,
				binary: options.binary,
				changedSince: options.changedSince,
				onUntaggedFetch: (untagged, next) => {
					if (aborted) {
						next();
						return;
					}
					rowQueue.push({ value: {
						response: untagged,
						next
					} });
					if (typeof push === "function") push();
				}
			}).then(() => {
				finished = true;
				if (typeof push === "function") push();
			}).catch((err) => {
				rowQueue.push({ err });
				if (typeof push === "function") push();
			});
			let lastRes = null;
			try {
				let res;
				while (res = await getNext()) {
					lastRes = res;
					if (this.isClosed || !this.socket || this.socket.destroyed) {
						let error = /* @__PURE__ */ new Error("Connection closed");
						error.code = "EConnectionClosed";
						throw error;
					}
					yield res.response;
					res.next();
					lastRes = null;
				}
			} finally {
				aborted = true;
				if (lastRes && typeof lastRes.next === "function") lastRes.next();
				while (rowQueue.length) {
					let entry = rowQueue.shift();
					if (entry.value && typeof entry.value.next === "function") entry.value.next();
				}
			}
		}
		/**
		* Fetch messages from the currently opened mailbox.
		*
		* This method will fetch all messages before resolving the promise, unlike .fetch(), which
		* is an async generator. Do not use large ranges like 1:*, as this might exhaust all available
		* memory if the mailbox contains a large number of emails.
		* @param {SequenceString | Number[] | SearchObject} range Range of messages to fetch
		* @param {FetchQueryObject} query Fetch query
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID numbers instead of sequence numbers for `range`
		* @param {BigInt} [options.changedSince] If set then only messages with a higher modseq value are returned. Ignored if server does not support `CONDSTORE` extension.
		* @param {Boolean} [options.binary=false] If `true` then requests a binary response if the server supports this
		* @returns {Promise<FetchMessageObject[]>} Array of Message data object
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // fetch UID for all messages in a mailbox
		* const messages = await client.fetchAll('1:*', {uid: true});
		* for (let msg of messages){
		*     console.log(msg.uid);
		* }
		*/
		async fetchAll(range, query, options) {
			const results = [];
			const generator = this.fetch(range, query, options);
			for await (const message of generator) results.push(message);
			return results;
		}
		/**
		* Fetch a single message from the currently opened mailbox
		*
		* @param {SequenceString} seq Single UID or sequence number of the message to fetch for
		* @param {FetchQueryObject} query Fetch query
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID number instead of sequence number for `seq`
		* @param {Boolean} [options.binary=false] If `true` then requests a binary response if the server supports this
		* @returns {Promise<FetchMessageObject>} Message data object
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // fetch UID for the last email in the selected mailbox
		* let lastMsg = await client.fetchOne('*', {uid: true})
		* console.log(lastMsg.uid);
		*/
		async fetchOne(seq, query, options) {
			if (!this.mailbox) return;
			if (seq === "*") {
				if (!this.mailbox.exists) return false;
				seq = this.mailbox.exists.toString();
				options = Object.assign({}, options || {}, { uid: false });
			}
			let response = await this.run("FETCH", (seq || "").toString(), query, options);
			if (!response || !response.list || !response.list.length) return false;
			return response.list[0];
		}
		/**
		* @typedef {Object} DownloadObject
		* @global
		* @property {Object} meta content metadata
		* @property {number} meta.expectedSize The fetch response size
		* @property {String} meta.contentType Content-Type of the streamed file. If part was not set then this value is "message/rfc822"
		* @property {String} [meta.charset] Charset of the body part. Text parts are automatically converted to UTF-8, attachments are kept as is
		* @property {String} [meta.disposition] Content-Disposition of the streamed file
		* @property {String} [meta.filename] Filename of the streamed body part
		* @property {ReadableStream} content Streamed content
		*/
		/**
		* Download either full rfc822 formatted message or a specific bodystructure part as a Stream.
		* Bodystructure parts are decoded so the resulting stream is a binary file. Text content
		* is automatically converted to UTF-8 charset.
		*
		* @param {SequenceString} range UID or sequence number for the message to fetch
		* @param {String} [part] If not set then downloads entire rfc822 formatted message, otherwise downloads specific bodystructure part
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID number instead of sequence number for `range`
		* @param {number} [options.maxBytes] If set then limits download size to specified bytes
		* @param {number} [options.chunkSize=65536] How large content parts to ask from the server
		* @returns {Promise<DownloadObject>} Download data object
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // download body part nr '1.2' from latest message
		* let {meta, content} = await client.download('*', '1.2');
		* content.pipe(fs.createWriteStream(meta.filename));
		*/
		async download(range, part, options) {
			if (!this.mailbox) return {};
			options = Object.assign({
				chunkSize: 64 * 1024,
				maxBytes: Infinity
			}, options || {});
			let hasMore = true;
			let processed = 0;
			let chunkSize = Number(options.chunkSize) || 64 * 1024;
			let maxBytes = Number(options.maxBytes) || Infinity;
			let uid = false;
			if (part === "1") {
				let response = await this.fetchOne(range, {
					uid: true,
					bodyStructure: true
				}, options);
				if (!response) return {
					response: false,
					chunk: false
				};
				if (!uid && response.uid) {
					uid = response.uid;
					range = uid;
					options.uid = true;
				}
				if (!response.bodyStructure.childNodes) part = "TEXT";
			}
			let getNextPart = async (query) => {
				query = query || {};
				let mimeKey;
				if (!part) query.source = {
					start: processed,
					maxLength: chunkSize
				};
				else {
					part = part.toString().toLowerCase().trim();
					if (!query.bodyParts) query.bodyParts = [];
					if (query.size) {
						if (/^[\d.]+$/.test(part)) {
							mimeKey = part + ".mime";
							query.bodyParts.push(mimeKey);
						} else if (part === "text") {
							mimeKey = "header";
							query.bodyParts.push(mimeKey);
						}
					}
					query.bodyParts.push({
						key: part,
						start: processed,
						maxLength: chunkSize
					});
				}
				let response = await this.fetchOne(range, query, options);
				if (!response) return {
					response: false,
					chunk: false
				};
				if (!uid && response.uid) {
					uid = response.uid;
					range = uid;
					options.uid = true;
				}
				let chunk = !part ? response.source : response.bodyParts && response.bodyParts.get(part);
				if (!chunk) return {};
				processed += chunk.length;
				hasMore = chunk.length >= chunkSize;
				let result = { chunk };
				if (query.size) result.response = response;
				if (query.bodyParts) if (mimeKey === "header") result.mime = response.headers;
				else result.mime = response.bodyParts.get(mimeKey);
				return result;
			};
			let { response, chunk, mime } = await getNextPart({
				size: true,
				uid: true
			});
			if (!response || !chunk) return {};
			let meta = { expectedSize: response.size };
			if (!part) meta.contentType = "message/rfc822";
			else if (mime) {
				let headers = new Headers(mime);
				let contentType = libmime.parseHeaderValue(headers.getFirst("Content-Type"));
				let transferEncoding = libmime.parseHeaderValue(headers.getFirst("Content-Transfer-Encoding"));
				let disposition = libmime.parseHeaderValue(headers.getFirst("Content-Disposition"));
				if (contentType.value.toLowerCase().trim()) meta.contentType = contentType.value.toLowerCase().trim();
				if (contentType.params.charset) meta.charset = contentType.params.charset.toLowerCase().trim();
				if (transferEncoding.value) meta.encoding = transferEncoding.value.replace(/\(.*\)/g, "").toLowerCase().trim();
				if (disposition.value) {
					/* c8 ignore next */ meta.disposition = disposition.value.toLowerCase().trim() || false;
					try {
						meta.disposition = libmime.decodeWords(meta.disposition);
					} catch {}
				}
				if (contentType.params.format && contentType.params.format.toLowerCase().trim() === "flowed") {
					meta.flowed = true;
					if (contentType.params.delsp && contentType.params.delsp.toLowerCase().trim() === "yes") meta.delSp = true;
				}
				let filename = disposition.params.filename || contentType.params.name || false;
				if (filename) {
					try {
						filename = libmime.decodeWords(filename);
					} catch {}
					meta.filename = filename;
				}
			}
			let stream;
			let output;
			let fetchAborted = false;
			switch (meta.encoding) {
				case "base64":
					output = stream = new libbase64.Decoder();
					break;
				case "quoted-printable":
					output = stream = new libqp.Decoder();
					break;
				default: output = stream = new PassThrough();
			}
			let isTextNode = [
				"text/html",
				"text/plain",
				"text/x-amp-html"
			].includes(meta.contentType) || part === "1" && !meta.contentType;
			if ((!meta.disposition || meta.disposition === "inline") && isTextNode) {
				if (meta.flowed) {
					let flowDecoder = new FlowedDecoder({ delSp: meta.delSp });
					output.on("error", (err) => {
						flowDecoder.emit("error", err);
					});
					output = output.pipe(flowDecoder);
				}
				if (meta.charset && ![
					"ascii",
					"usascii",
					"utf8"
				].includes(meta.charset.toLowerCase().replace(/[^a-z0-9]+/g, ""))) try {
					let decoder = getDecoder(meta.charset);
					decoder.on("error", (err) => {
						this.log.warn({
							err,
							charset: meta.charset,
							cid: this.id
						});
					});
					output.on("error", (err) => {
						decoder.emit("error", err);
					});
					output = output.pipe(decoder);
					meta.charset = "utf-8";
				} catch {}
			}
			let limiter = new LimitedPassthrough({ maxBytes });
			output.on("error", (err) => {
				limiter.emit("error", err);
			});
			output = output.pipe(limiter);
			const cleanup = () => {
				fetchAborted = true;
				if (stream && !stream.destroyed) stream.destroy();
			};
			output.once("error", cleanup);
			output.once("close", cleanup);
			let writeChunk = (chunk) => {
				if (limiter.limited || fetchAborted || stream.destroyed) return true;
				return stream.write(chunk);
			};
			let fetchAllParts = async () => {
				while (hasMore && !limiter.limited && !fetchAborted) {
					let { chunk } = await getNextPart();
					if (!chunk || fetchAborted) break;
					if (writeChunk(chunk) === false) {
						try {
							await new Promise((resolve, reject) => {
								let resolved = false;
								const finish = (err) => {
									/* c8 ignore next */ if (resolved) return;
									resolved = true;
									stream.removeAllListeners("drain");
									stream.removeAllListeners("error");
									stream.removeAllListeners("close");
									/* c8 ignore next 2 */ if (err) reject(err);
									else resolve();
								};
								stream.once("drain", () => finish());
								stream.once("error", (err) => finish(err));
								stream.once("close", () => finish());
							});
						} catch (err) {
							if (!fetchAborted) throw err;
						}
						/* c8 ignore stop */
						if (fetchAborted) break;
					}
				}
			};
			let runFetchAllParts = () => {
				fetchAllParts().catch((err) => {
					if (!fetchAborted && stream && !stream.destroyed) stream.emit("error", err);
					else this.log.warn({
						msg: "Download error after stream closed",
						err,
						fetchAborted,
						streamDestroyed: stream?.destroyed,
						cid: this.id
					});
					/* c8 ignore stop */
				}).finally(() => {
					if (!fetchAborted && stream && !stream.destroyed) stream.end();
				});
			};
			setImmediate(() => {
				let writeResult;
				try {
					writeResult = writeChunk(chunk);
				} catch (err) {
					stream.emit("error", err);
					/* c8 ignore next 3 */ if (!fetchAborted && stream && !stream.destroyed) stream.end();
					return;
				}
				/* c8 ignore next 7 */ if (!writeResult) stream.once("drain", () => {
					if (!fetchAborted) runFetchAllParts();
				});
				else runFetchAllParts();
			});
			return {
				meta,
				content: output
			};
		}
		/**
		* Fetch multiple attachments as Buffer values
		*
		* @param {SequenceString} range UID or sequence number for the message to fetch
		* @param {String[]} parts A list of bodystructure parts
		* @param {Object} [options]
		* @param {Boolean} [options.uid] If `true` then uses UID number instead of sequence number for `range`
		* @returns {Promise<Object>} Download data object
		*
		* @example
		* let mailbox = await client.mailboxOpen('INBOX');
		* // download body parts '2', and '3' from all messages in the selected mailbox
		* let response = await client.downloadMany('*', ['2', '3']);
		* process.stdout.write(response[2].content)
		* process.stdout.write(response[3].content)
		*/
		async downloadMany(range, parts, options) {
			if (!this.mailbox) return {};
			options = Object.assign({
				chunkSize: 64 * 1024,
				maxBytes: Infinity
			}, options || {});
			let query = { bodyParts: [] };
			for (let part of parts) {
				query.bodyParts.push(part + ".mime");
				query.bodyParts.push(part);
			}
			let response = await this.fetchOne(range, query, options);
			if (!response || !response.bodyParts) return { response: false };
			let data = {};
			for (let [part, content] of response.bodyParts) {
				let keyParts = part.split(".mime");
				if (keyParts.length === 1) {
					let key = keyParts[0];
					if (!data[key]) data[key] = { content };
					else data[key].content = content;
				} else if (keyParts.length === 2) {
					let key = keyParts[0];
					if (!data[key]) data[key] = {};
					if (!data[key].meta) data[key].meta = {};
					let headers = new Headers(content);
					let contentType = libmime.parseHeaderValue(headers.getFirst("Content-Type"));
					let transferEncoding = libmime.parseHeaderValue(headers.getFirst("Content-Transfer-Encoding"));
					let disposition = libmime.parseHeaderValue(headers.getFirst("Content-Disposition"));
					if (contentType.value.toLowerCase().trim()) data[key].meta.contentType = contentType.value.toLowerCase().trim();
					if (contentType.params.charset) data[key].meta.charset = contentType.params.charset.toLowerCase().trim();
					if (transferEncoding.value) data[key].meta.encoding = transferEncoding.value.replace(/\(.*\)/g, "").toLowerCase().trim();
					if (disposition.value) {
						/* c8 ignore next */ data[key].meta.disposition = disposition.value.toLowerCase().trim() || false;
						try {
							data[key].meta.disposition = libmime.decodeWords(data[key].meta.disposition);
						} catch {}
					}
					if (contentType.params.format && contentType.params.format.toLowerCase().trim() === "flowed") {
						data[key].meta.flowed = true;
						if (contentType.params.delsp && contentType.params.delsp.toLowerCase().trim() === "yes") data[key].meta.delSp = true;
					}
					let filename = disposition.params.filename || contentType.params.name || false;
					if (filename) {
						try {
							filename = libmime.decodeWords(filename);
						} catch {}
						data[key].meta.filename = filename;
					}
				}
			}
			for (let part of Object.keys(data)) switch (data[part].meta.encoding) {
				case "base64":
					data[part].content = data[part].content ? libbase64.decode(data[part].content.toString()) : null;
					break;
				case "quoted-printable":
					data[part].content = data[part].content ? libqp.decode(data[part].content.toString()) : null;
					break;
				default:
			}
			return data;
		}
		async run(command, ...args) {
			command = command.toUpperCase();
			if (!this.commands.has(command)) return false;
			if (!this.socket || this.socket.destroyed) {
				const error = /* @__PURE__ */ new Error("Connection not available");
				error.code = "NoConnection";
				throw error;
			}
			clearTimeout(this.idleStartTimer);
			if (typeof this.preCheck === "function") await this.preCheck();
			let result = await this.commands.get(command)(this, ...args);
			if (command !== "IDLE") this.autoidle();
			return result;
		}
		async processLocks() {
			if (this.processingLock) {
				this.log.trace({
					msg: "Mailbox locking queued",
					path: this.mailbox && this.mailbox.path,
					pending: this.locks.length,
					idling: this.idling,
					activeLock: this.currentLock ? {
						lockId: this.currentLock.lockId,
						...this.currentLock.options?.description && { description: this.currentLock.options?.description }
					} : null
				});
				return;
			}
			this.processingLock = true;
			try {
				let processedCount = 0;
				while (this.locks.length > 0) {
					if (this.currentLock) break;
					processedCount++;
					if (processedCount % 5 === 0) await new Promise((resolve) => setImmediate(resolve));
					const lock = this.locks.shift();
					const { resolve, reject, path, options, lockId } = lock;
					if (lock.acquireTimer) {
						clearTimeout(lock.acquireTimer);
						lock.acquireTimer = null;
					}
					const armHeldTimer = () => {
						let threshold = Number(options.maxLockHoldTime ?? this.options.maxLockHoldTime ?? HELD_LOCK_WARN_MS);
						if (!threshold || threshold <= 0) return;
						lock.heldAt = Date.now();
						lock.heldWarnTimer = setTimeout(() => {
							lock.heldWarnTimer = null;
							this.log.warn({
								msg: "Mailbox lock held for a long time",
								lockId: lock.lockId,
								path,
								heldFor: Date.now() - lock.heldAt,
								/* c8 ignore next */ ...options.description && { description: options.description },
								cid: this.id
							});
						}, threshold);
					};
					const release = () => {
						if (this.currentLock === lock) {
							if (lock.heldWarnTimer) {
								clearTimeout(lock.heldWarnTimer);
								lock.heldWarnTimer = null;
							}
							this.log.trace({
								msg: "Mailbox lock released",
								lockId: lock.lockId,
								path: this.mailbox && this.mailbox.path,
								pending: this.locks.length,
								idling: this.idling
							});
							this.currentLock = false;
							setImmediate(() => {
								this.processLocks().catch((err) => this.log.error({
									err,
									cid: this.id
								}));
							});
						} else this.log.trace({
							msg: "Ignoring stale lock release",
							lockId: lock.lockId,
							cid: this.id
						});
					};
					if (!this.usable || !this.socket || this.socket.destroyed) {
						this.log.trace({
							msg: "Failed to acquire mailbox lock",
							path,
							lockId,
							idling: this.idling
						});
						let error = /* @__PURE__ */ new Error("Connection not available");
						error.code = "NoConnection";
						reject(error);
						continue;
					}
					if (this.mailbox && this.mailbox.path === path && !!this.mailbox.readOnly === !!options.readOnly) {
						this.log.trace({
							msg: "Mailbox lock acquired [existing]",
							path,
							lockId,
							idling: this.idling,
							...options.description && { description: options.description }
						});
						this.currentLock = lock;
						armHeldTimer();
						resolve({
							path,
							release
						});
						break;
					}
					try {
						await this.mailboxOpen(path, options);
						this.log.trace({
							msg: "Mailbox lock acquired [selected]",
							path,
							lockId,
							idling: this.idling,
							...options.description && { description: options.description }
						});
						this.currentLock = lock;
						armHeldTimer();
						resolve({
							path,
							release
						});
						break;
					} catch (err) {
						if (err.responseStatus === "NO") try {
							let folders = await this.run("LIST", "", path, { listOnly: true });
							if (!folders || !folders.length) err.mailboxMissing = true;
						} catch (E) {
							this.log.trace({
								msg: "Failed to verify failed mailbox",
								path,
								err: E
							});
						}
						this.log.trace({
							msg: "Failed to acquire mailbox lock",
							path,
							lockId,
							idling: this.idling,
							...options.description && { description: options.description },
							err
						});
						reject(err);
					}
				}
			} finally {
				this.processingLock = false;
				/* c8 ignore start */ if (this.locks.length && !this.currentLock) setImmediate(() => {
					this.processLocks().catch((err) => this.log.error({
						err,
						cid: this.id
					}));
				});
			}
		}
		/**
		* Opens a mailbox if not already open and returns a lock. Next call to `getMailboxLock()` is queued
		* until previous lock is released. This is suggested over {@link module:imapflow~ImapFlow#mailboxOpen|mailboxOpen()} as
		* `getMailboxLock()` gives you a weak transaction while `mailboxOpen()` has no guarantees whatsoever that another
		* mailbox is opened while you try to call multiple fetch or store commands.
		*
		* @param {string|array} path **Path for the mailbox** to open
		* @param {Object} [options] optional options
		* @param {Boolean} [options.readOnly=false] If `true` then opens mailbox in read-only mode. You can still try to perform write operations but these would probably fail.
		* @returns {Promise<MailboxLockObject>} Mailbox lock
		* @throws Will throw an error if mailbox does not exist or can not be opened
		*
		* @example
		* let lock = await client.getMailboxLock('INBOX');
		* try {
		*   // do something in the mailbox
		* } finally {
		*   // use finally{} to make sure lock is released even if exception occurs
		*   lock.release();
		* }
		*/
		getMailboxLock(path, options) {
			options = options || {};
			path = normalizePath(this, path);
			let lockId = ++this.lockCounter;
			this.log.trace({
				msg: "Requesting lock",
				path,
				lockId,
				...options.description && { description: options.description },
				activeLock: this.currentLock ? {
					lockId: this.currentLock.lockId,
					...this.currentLock.options?.description && { description: this.currentLock.options?.description }
				} : null
			});
			let lockPromise = new Promise((resolve, reject) => {
				let lockEntry = {
					resolve,
					reject,
					path,
					options,
					lockId
				};
				this.locks.push(lockEntry);
				if (Number(options.acquireTimeout) > 0) lockEntry.acquireTimer = setTimeout(() => {
					lockEntry.acquireTimer = null;
					const idx = this.locks.indexOf(lockEntry);
					if (idx !== -1) {
						this.locks.splice(idx, 1);
						let err = /* @__PURE__ */ new Error("Timed out waiting for mailbox lock");
						err.code = "LockTimeout";
						err.lockId = lockEntry.lockId;
						reject(err);
					}
				}, Number(options.acquireTimeout));
				this.processLocks().catch((err) => reject(err));
			});
			lockPromise.catch(noop);
			return lockPromise;
		}
		getLogger() {
			let mainLogger = this.options.logger && typeof this.options.logger === "object" ? this.options.logger : logger.child({
				component: "imap-connection",
				cid: this.id
			});
			let synteticLogger = {};
			for (let level of [
				"trace",
				"debug",
				"info",
				"warn",
				"error",
				"fatal"
			]) synteticLogger[level] = (...args) => {
				if (this.options.logger !== false) if (typeof mainLogger[level] !== "function") {
					if (level === "fatal" || level === "error") console.log(JSON.stringify(...args));
				} else mainLogger[level](...args);
				if (this.emitLogs && args && args[0] && typeof args[0] === "object") {
					let logEntry = Object.assign({
						level,
						t: Date.now(),
						cid: this.id,
						lo: ++this.lo
					}, args[0]);
					if (logEntry.err && typeof logEntry.err === "object") {
						let err = logEntry.err;
						logEntry.err = { stack: err.stack };
						Object.keys(err).forEach((key) => {
							logEntry.err[key] = err[key];
						});
					}
					this.emit("log", logEntry);
				}
			};
			return synteticLogger;
		}
		/**
		* Detaches sockets from the IMAP pipeline. Useful for upgrading the connection
		* (e.g., STARTTLS) or transferring socket ownership.
		*
		* @returns {Object} Socket objects
		* @returns {Object} return.readSocket The read socket (inflated socket if compression is enabled, raw socket otherwise)
		* @returns {Object} return.writeSocket The write socket
		* @returns {Object} return.socket The raw underlying socket (same as readSocket/writeSocket when compression is disabled)
		*/
		unbind() {
			this.socket.unpipe(this.streamer);
			if (this._inflate) this._inflate.unpipe(this.streamer);
			this.clearSocketHandlers();
			const readSocket = this._inflate || this.socket;
			const writeSocket = this.writeSocket || this.socket;
			if (this.socket !== readSocket && this.socket !== writeSocket) this.socket.on("error", (err) => {
				this.log.debug({
					msg: "Suppressed error on unbound socket",
					err,
					cid: this.id
				});
			});
			return {
				readSocket,
				writeSocket,
				socket: this.socket
			};
		}
	};
	/**
	* Connection close event. **NB!** ImapFlow does not handle reconnects automatically.
	* So whenever a 'close' event occurs you must create a new connection yourself.
	*
	* @event module:imapflow~ImapFlow#close
	*/
	/**
	* Error event. In most cases getting an error event also means that connection is closed
	* and pending operations should return with a failure.
	*
	* @event module:imapflow~ImapFlow#error
	* @type {Error}
	* @example
	* client.on('error', err=>{
	*     console.log(`Error occurred: ${err.message}`);
	* });
	*/
	/**
	* Message count in currently opened mailbox changed
	*
	* @event module:imapflow~ImapFlow#exists
	* @type {Object}
	* @property {String} path mailbox path this event applies to
	* @property {Number} count updated count of messages
	* @property {Number} prevCount message count before this update
	* @example
	* client.on('exists', data=>{
	*     console.log(`Message count in "${data.path}" is ${data.count}`);
	* });
	*/
	/**
	* Deleted message sequence number in currently opened mailbox. One event is fired for every deleted email.
	*
	* @event module:imapflow~ImapFlow#expunge
	* @type {Object}
	* @property {String} path mailbox path this event applies to
	* @property {Number} seq sequence number of deleted message
	* @property {Boolean} vanished `true` if message was expunged via VANISHED response
	* @property {Number} [uid] UID of expunged message (when `vanished` is `true`)
	* @property {Boolean} [earlier] `true` for VANISHED EARLIER responses
	* @example
	* client.on('expunge', data=>{
	*     console.log(`Message #${data.seq} was deleted from "${data.path}"`);
	* });
	*/
	/**
	* Flags were updated for a message. Not all servers fire this event.
	*
	* @event module:imapflow~ImapFlow#flags
	* @type {Object}
	* @property {String} path mailbox path this event applies to
	* @property {Number} seq sequence number of updated message
	* @property {Number} [uid] UID number of updated message (if server provided this value)
	* @property {BigInt} [modseq] Updated modseq number for the mailbox (if server provided this value)
	* @property {Set<string>} flags A set of all flags for the updated message
	* @property {String} [flagColor] flag color like "red", or "yellow". Derived from the `flags` Set using Apple Mail color rules
	* @example
	* client.on('flags', data=>{
	*     console.log(`Flag set for #${data.seq} is now "${Array.from(data.flags).join(', ')}"`);
	* });
	*/
	/**
	* Mailbox was opened
	*
	* @event module:imapflow~ImapFlow#mailboxOpen
	* @type {MailboxObject}
	* @example
	* client.on('mailboxOpen', mailbox => {
	*     console.log(`Mailbox ${mailbox.path} was opened`);
	* });
	*/
	/**
	* Mailbox was closed
	*
	* @event module:imapflow~ImapFlow#mailboxClose
	* @type {MailboxObject}
	* @example
	* client.on('mailboxClose', mailbox => {
	*     console.log(`Mailbox ${mailbox.path} was closed`);
	* });
	*/
	/**
	* Log event if `emitLogs=true`
	*
	* @event module:imapflow~ImapFlow#log
	* @type {Object}
	* @example
	* client.on('log', entry => {
	*     console.log(`${entry.cid} ${entry.msg}`);
	* });
	*/
	module.exports.ImapFlow = ImapFlow;
}));
//#endregion
export { require_punycode as a, require_url as i, require_http_proxy_client as n, require_errors as r, require_imap_flow as t };
