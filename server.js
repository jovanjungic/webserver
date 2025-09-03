"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var fs = require("fs/promises");
// Global state and constants
var running = true;
var kMaxHeaderLen = 1024 * 8; // 8KB max header size
function countSheep() {
    return __asyncGenerator(this, arguments, function countSheep_1() {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, , 7, 8]);
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 100)) return [3 /*break*/, 6];
                    return [4 /*yield*/, __await(new Promise(function (resolve) { return setTimeout(resolve, 1000); }))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, __await(Buffer.from("".concat(i, "\n")))];
                case 3: return [4 /*yield*/, _a.sent()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6: return [3 /*break*/, 8];
                case 7:
                    console.log("cleanup!");
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function bufExpectMore(conn, buf, context) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, soRead(conn)];
                case 1:
                    data = _a.sent();
                    if (data.length === 0) {
                        throw new Error("Unexpected EOF while reading ".concat(context));
                    }
                    bufPush(buf, data);
                    return [2 /*return*/];
            }
        });
    });
}
function findCRLF(buffer, start, length) {
    var end = start + length;
    for (var i = start; i + 1 < end; i++) {
        if (buffer[i] === 13 && buffer[i + 1] === 10) {
            // 13 = '\r', 10 = '\n'
            return i - start;
        }
    }
    return -1;
}
function readChunks(conn, buf) {
    return __asyncGenerator(this, arguments, function readChunks_1() {
        var last, idx, sizeLine, remain, consume, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Starting chunked read");
                    last = false;
                    _a.label = 1;
                case 1:
                    if (!!last) return [3 /*break*/, 13];
                    console.log("Looking for chunk size, buffer length:", buf.length);
                    console.log("Raw buffer:", buf.data.subarray(0, buf.length).toString("hex"));
                    idx = findCRLF(buf.data, buf.start, buf.length);
                    console.log("Found CRLF at index:", idx);
                    if (!(idx < 0)) return [3 /*break*/, 3];
                    console.log("Need more data for chunk size");
                    return [4 /*yield*/, __await(bufExpectMore(conn, buf, "chunk size"))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 12];
                case 3:
                    sizeLine = buf.data
                        .subarray(buf.start, buf.start + idx)
                        .toString("latin1");
                    remain = parseInt(sizeLine, 16);
                    console.log("Chunk size line:", JSON.stringify(sizeLine), "->", remain);
                    // Consume the size line + \r\n
                    bufPop(buf, idx + 2);
                    console.log("After consuming size line, buffer:", buf.data.subarray(buf.start, buf.start + buf.length).toString());
                    // Check if this is the end chunk (size 0)
                    if (remain === 0) {
                        console.log("Found end chunk");
                        last = true;
                        return [3 /*break*/, 13];
                    }
                    console.log("Reading chunk data, remaining:", remain);
                    _a.label = 4;
                case 4:
                    if (!(remain > 0)) return [3 /*break*/, 9];
                    if (!(buf.length === 0)) return [3 /*break*/, 6];
                    console.log("Need more chunk data");
                    return [4 /*yield*/, __await(bufExpectMore(conn, buf, "chunk data"))];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    consume = Math.min(remain, buf.length);
                    data = Buffer.from(buf.data.subarray(buf.start, buf.start + consume));
                    bufPop(buf, consume);
                    remain -= consume;
                    console.log("Yielding chunk data:", JSON.stringify(data.toString()));
                    return [4 /*yield*/, __await(data)];
                case 7: return [4 /*yield*/, _a.sent()];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 9:
                    if (!(buf.length < 2)) return [3 /*break*/, 11];
                    console.log("Need more data for chunk terminator");
                    return [4 /*yield*/, __await(bufExpectMore(conn, buf, "chunk terminator"))];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    bufPop(buf, 2);
                    console.log("Consumed chunk terminator");
                    _a.label = 12;
                case 12: return [3 /*break*/, 1];
                case 13:
                    console.log("Finished chunked read");
                    return [2 /*return*/];
            }
        });
    });
}
// Custom HTTP error class
var HTTPError = /** @class */ (function (_super) {
    __extends(HTTPError, _super);
    function HTTPError(code, message) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.name = "HTTPError";
        return _this;
    }
    return HTTPError;
}(Error));
function open(path, flags) {
    return fs.open(path, flags);
}
// Parse buffer into lines
function splitLines(data) {
    var lines = [];
    var start = 0;
    for (var i = 0; i < data.length - 1; i++) {
        if (data[i] == 13 && data[i + 1] === 10) {
            // 13 is \r and 10 is \n
            lines.push(data.subarray(start, i));
            start = i + 2;
            i++;
        }
    }
    if (start < data.length) {
        lines.push(data.subarray(start));
    }
    return lines;
}
// Parse HTTP request line - "METHOD URI VERSION"
function parseRequestLine(line) {
    var str = line.toString("utf8");
    var parts = str.split(" ");
    if (parts.length !== 3) {
        throw new HTTPError(400, "Malformed request line");
    }
    var method = parts[0], uri = parts[1], version = parts[2];
    return [method, Buffer.from(uri), version];
}
// Validate HTTP header
function validateHeader(header) {
    if (header.length === 0)
        return false;
    var idx = header.indexOf(":");
    if (idx <= 0 || idx === header.length - 1)
        return false;
    return true;
}
// Parse complete HTTP request from buffer
function parseHTTPReq(data) {
    var lines = splitLines(data);
    var _a = parseRequestLine(lines[0]), method = _a[0], uri = _a[1], version = _a[2];
    var headers = [];
    for (var i = 1; i < lines.length - 1; i++) {
        var h = Buffer.from(lines[i]);
        if (!validateHeader(h)) {
            throw new HTTPError(400, "bad field");
        }
        headers.push(h);
    }
    console.assert(lines[lines.length - 1].length === 0);
    return {
        method: method,
        uri: uri,
        version: version,
        headers: headers,
    };
}
// Extract header value
function fieldGet(headers, name) {
    var prefix = Buffer.from(name + ": ");
    for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
        var header = headers_1[_i];
        if (header.subarray(0, prefix.length).equals(prefix)) {
            return header.subarray(prefix.length);
        }
    }
    return null;
}
// Body Reader for Content-Length
function readerFromConnLength(conn, buf, remain) {
    var _this = this;
    return {
        length: remain,
        read: function () { return __awaiter(_this, void 0, void 0, function () {
            var data_1, consume, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (remain === 0) {
                            return [2 /*return*/, Buffer.from("")]; // done
                        }
                        if (!(buf.length === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, soRead(conn)];
                    case 1:
                        data_1 = _a.sent();
                        bufPush(buf, data_1);
                        if (data_1.length === 0) {
                            throw new Error("Unexpected EOF from HTTP body.");
                        }
                        _a.label = 2;
                    case 2:
                        consume = Math.min(buf.length, remain);
                        remain -= consume;
                        data = Buffer.from(buf.data.subarray(buf.start, buf.start + consume));
                        bufPop(buf, consume);
                        return [2 /*return*/, data];
                }
            });
        }); },
    };
}
// Create appropriate body reader
function readerFromReq(conn, buf, req) {
    var _a;
    var bodyLen = -1;
    var contentLen = fieldGet(req.headers, "Content-Length");
    if (contentLen) {
        bodyLen = parseInt(contentLen.toString("latin1"), 10);
        if (isNaN(bodyLen)) {
            throw new HTTPError(400, "bad Content-Length");
        }
    }
    var bodyAllowed = !(req.method === "GET" || req.method === "HEAD");
    var chunked = ((_a = fieldGet(req.headers, "Transfer-Encoding")) === null || _a === void 0 ? void 0 : _a.equals(Buffer.from("chunked"))) || false;
    if (!bodyAllowed && (bodyLen > 0 || chunked)) {
        throw new HTTPError(400, "HTTP body not allowed.");
    }
    if (bodyLen >= 0) {
        //"Content-Length" is present
        return readerFromConnLength(conn, buf, bodyLen);
    }
    else if (chunked) {
        // Chunked
        return readerFromGenerator(readChunks(conn, buf));
    }
    else {
        // read the rest of the connection (mostly for legacy HTTP/1.0 clients)
        return readerFromConnEOF(conn, buf);
    }
}
// Create body reader from in-memory buffer
function readerFromMemory(data) {
    var _this = this;
    var done = false;
    return {
        length: data.length,
        read: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (done) {
                    return [2 /*return*/, Buffer.from("")]; // done
                }
                else {
                    done = true;
                    return [2 /*return*/, data];
                }
                return [2 /*return*/];
            });
        }); },
    };
}
function readerFromConnEOF(conn, buf) {
    var _this = this;
    var done = false;
    return {
        length: -1,
        read: function () { return __awaiter(_this, void 0, void 0, function () {
            var chunks, data, chunk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (done) {
                            return [2 /*return*/, Buffer.from("")];
                        }
                        chunks = [];
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 4];
                        if (!(buf.length === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, soRead(conn)];
                    case 2:
                        data = _a.sent();
                        if (data.length === 0) {
                            return [3 /*break*/, 4];
                        }
                        bufPush(buf, data);
                        _a.label = 3;
                    case 3:
                        chunk = Buffer.from(buf.data.subarray(buf.start, buf.start + buf.length));
                        bufPop(buf, buf.length);
                        chunks.push(chunk);
                        return [3 /*break*/, 1];
                    case 4:
                        done = true;
                        return [2 /*return*/, Buffer.concat(chunks)];
                }
            });
        }); },
    };
}
function readerFromGenerator(gen) {
    var _this = this;
    return {
        length: -1,
        read: function () { return __awaiter(_this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, gen.next()];
                    case 1:
                        r = _a.sent();
                        if (r.done) {
                            return [2 /*return*/, Buffer.from("")];
                        }
                        else {
                            console.assert(r.value && r.value.length > 0);
                            return [2 /*return*/, r.value];
                        }
                        return [2 /*return*/];
                }
            });
        }); },
        close: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, gen.return()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    };
}
// Convert HTTP status code to reason phrase
function getStatusText(code) {
    switch (code) {
        case 200:
            return "OK";
        case 400:
            return "Bad Request";
        case 413:
            return "Payload Too Large";
        case 501:
            return "Not Implemented";
        default:
            return "Unknown";
    }
}
// Encode HTTP response headers to buffer
function encodeHTTPResp(resp) {
    var statusLine = "HTTP/1.1 ".concat(resp.code, " ").concat(getStatusText(resp.code), "\r\n");
    var statusBuffer = Buffer.from(statusLine, "utf8");
    var parts = [statusBuffer];
    parts.push.apply(parts, resp.headers);
    for (var i = 1; i < parts.length; i++) {
        parts[i] = Buffer.concat([parts[i], Buffer.from("\r\n")]);
    }
    parts.push(Buffer.from("\r\n"));
    return Buffer.concat(parts);
}
// Write complete HTTP response
function writeHTTPResp(conn, resp) {
    return __awaiter(this, void 0, void 0, function () {
        var isChunked, crlf, last, data;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    isChunked = resp.body.length < 0;
                    if (isChunked) {
                        resp.headers.push(Buffer.from("Transfer-Encoding: chunked"));
                    }
                    else {
                        resp.headers.push(Buffer.from("Content-Length: ".concat(resp.body.length)));
                    }
                    return [4 /*yield*/, soWrite(conn, encodeHTTPResp(resp))];
                case 1:
                    _c.sent();
                    crlf = Buffer.from("\r\n");
                    last = false;
                    _c.label = 2;
                case 2:
                    if (!!last) return [3 /*break*/, 8];
                    return [4 /*yield*/, resp.body.read()];
                case 3:
                    data = _c.sent();
                    last = data.length === 0; // has it ended?
                    if (isChunked && !last) {
                        data = Buffer.concat([
                            Buffer.from(data.length.toString(16)),
                            crlf,
                            data,
                            crlf,
                        ]);
                    }
                    if (!data.length) return [3 /*break*/, 5];
                    return [4 /*yield*/, soWrite(conn, data)];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    if (!(isChunked && last)) return [3 /*break*/, 7];
                    // write terminating chunk
                    return [4 /*yield*/, soWrite(conn, Buffer.from("0\r\n\r\n"))];
                case 6:
                    // write terminating chunk
                    _c.sent();
                    _c.label = 7;
                case 7: return [3 /*break*/, 2];
                case 8: return [4 /*yield*/, ((_b = (_a = resp.body).close) === null || _b === void 0 ? void 0 : _b.call(_a))];
                case 9:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function resp404() {
    return {
        code: 404,
        headers: [Buffer.from("Server: my_first_http_server")],
        body: readerFromMemory(Buffer.from("404 Not Found\n")),
    };
}
function readerFromStaticFile(fp, size) {
    var _this = this;
    var buf = Buffer.allocUnsafe(65536);
    var got = 0;
    return {
        length: size,
        read: function () { return __awaiter(_this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fp.read({ buffer: buf })];
                    case 1:
                        r = _a.sent();
                        got += r.bytesRead;
                        if (got > size || (got < size && r.bytesRead === 0)) {
                            throw new Error("file size changed, abandon it.");
                        }
                        // Copy the data to ensure it's stable
                        return [2 /*return*/, Buffer.from(r.buffer.subarray(0, r.bytesRead))];
                }
            });
        }); },
        close: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fp.close()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); },
    };
}
function serveStaticFile(path) {
    return __awaiter(this, void 0, void 0, function () {
        var fp, stat, size, reader, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fp = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 9]);
                    return [4 /*yield*/, fs.open(path, "r")];
                case 2:
                    fp = _a.sent();
                    return [4 /*yield*/, fp.stat()];
                case 3:
                    stat = _a.sent();
                    if (!!stat.isFile()) return [3 /*break*/, 5];
                    return [4 /*yield*/, fp.close()];
                case 4:
                    _a.sent();
                    return [2 /*return*/, resp404()];
                case 5:
                    size = stat.size;
                    reader = readerFromStaticFile(fp, size);
                    // fp is now owned by the reader, don't close it here
                    return [2 /*return*/, { code: 200, headers: [], body: reader }];
                case 6:
                    error_1 = _a.sent();
                    console.info("error serving file: ", error_1);
                    if (!fp) return [3 /*break*/, 8];
                    return [4 /*yield*/, fp.close()];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [2 /*return*/, resp404()];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Handle HTTP request and response
function handleReq(req, body) {
    return __awaiter(this, void 0, void 0, function () {
        var resp, uri;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    uri = req.uri.toString("utf8");
                    if (!uri.startsWith("/files/")) return [3 /*break*/, 2];
                    return [4 /*yield*/, serveStaticFile(uri.substr("/files/".length))];
                case 1: 
                // serve files from the current working directory
                // FIXME: prevent escaping by `..`
                return [2 /*return*/, _a.sent()];
                case 2:
                    switch (req.uri.toString("latin1")) {
                        case "/echo":
                            resp = body;
                            break;
                        case "/sheep":
                            resp = readerFromGenerator(countSheep());
                            break;
                        default:
                            resp = readerFromMemory(Buffer.from("hello world.\n"));
                            break;
                    }
                    return [2 /*return*/, {
                            code: 200,
                            headers: [Buffer.from("Server: my_first_http_server")],
                            body: resp,
                        }];
            }
        });
    });
}
// Add data to dynamic buffer
function bufPush(buf, data) {
    var newLen = buf.length + data.length + buf.start;
    if (buf.length < newLen) {
        var cap = Math.max(buf.data.length, 32);
        while (cap < newLen) {
            cap *= 2;
        }
        var grown = Buffer.allocUnsafe(cap);
        buf.data.copy(grown, 0, buf.start, buf.start + buf.length);
        buf.data = grown;
        buf.start = 0;
    }
    data.copy(buf.data, buf.start + buf.length);
    buf.length += data.length;
}
// Extract complete HTTP message from buffer
function cutMessage(buf) {
    var view = buf.data.subarray(buf.start, buf.start + buf.length);
    var idx = buf.data.subarray(0, buf.length).indexOf("\r\n\r\n");
    if (idx < 0) {
        if (buf.length >= kMaxHeaderLen) {
            throw new HTTPError(413, "header is too large");
        }
        return null;
    }
    var msg = parseHTTPReq(buf.data.subarray(0, idx + 4));
    bufPop(buf, idx + 4);
    return msg;
}
// Remove consumed data from buffer
function bufPop(buf, len) {
    // buf.data.copyWithin(0, len, buf.length);
    // buf.length -= len;
    // past code to understand how i need to change this
    buf.start += len;
    buf.length -= len;
    if (buf.start > buf.data.length / 2) {
        buf.data.copyWithin(0, buf.start, buf.start + buf.length);
        buf.start = 0;
    }
}
// Handle new TCP connection
function newConn(socket) {
    return __awaiter(this, void 0, void 0, function () {
        var conn, exc_1, resp, exc_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    conn = soInit(socket);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 10, 11]);
                    return [4 /*yield*/, serveClient(conn)];
                case 2:
                    _c.sent();
                    return [3 /*break*/, 11];
                case 3:
                    exc_1 = _c.sent();
                    console.error("exception: ", exc_1);
                    if (!(exc_1 instanceof HTTPError)) return [3 /*break*/, 9];
                    resp = {
                        code: exc_1.code,
                        headers: [],
                        body: readerFromMemory(Buffer.from(exc_1.message + "\n")),
                    };
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, 7, 9]);
                    return [4 /*yield*/, writeHTTPResp(conn, resp)];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 9];
                case 6:
                    exc_2 = _c.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, ((_b = (_a = resp.body).close) === null || _b === void 0 ? void 0 : _b.call(_a))];
                case 8:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 9: return [3 /*break*/, 11];
                case 10:
                    socket.destroy();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Client serving loop
function serveClient(conn) {
    return __awaiter(this, void 0, void 0, function () {
        var buf, msg, data, reqBody, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    buf = { data: Buffer.alloc(0), length: 0, start: 0 };
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 9];
                    msg = cutMessage(buf);
                    if (!!msg) return [3 /*break*/, 3];
                    return [4 /*yield*/, soRead(conn)];
                case 2:
                    data = _a.sent();
                    bufPush(buf, data);
                    if (data.length === 0 && buf.length === 0) {
                        return [2 /*return*/];
                    }
                    if (data.length === 0) {
                        throw new HTTPError(400, "Unexpected EOF.");
                    }
                    return [3 /*break*/, 1];
                case 3:
                    reqBody = readerFromReq(conn, buf, msg);
                    return [4 /*yield*/, handleReq(msg, reqBody)];
                case 4:
                    res = _a.sent();
                    return [4 /*yield*/, writeHTTPResp(conn, res)];
                case 5:
                    _a.sent();
                    if (msg.version === "1.0") {
                        return [2 /*return*/];
                    }
                    _a.label = 6;
                case 6: return [4 /*yield*/, reqBody.read()];
                case 7:
                    if (!((_a.sent()).length > 0)) return [3 /*break*/, 8];
                    return [3 /*break*/, 6];
                case 8: return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Initialize TCP connection
function soInit(socket) {
    var conn = {
        socket: socket,
        err: null,
        ended: false,
        reader: null,
    };
    socket.on("data", function (data) {
        console.assert(conn.reader);
        conn.socket.pause();
        conn.reader.resolve(data);
        conn.reader = null;
    });
    socket.on("end", function () {
        conn.ended = true;
        if (conn.reader) {
            conn.reader.resolve(Buffer.from(""));
            conn.reader = null;
        }
    });
    socket.on("error", function (err) {
        conn.err = err;
        if (conn.reader) {
            conn.reader.reject(err);
            conn.reader = null;
        }
    });
    return conn;
}
// Async read from TCP connection
function soRead(conn) {
    console.assert(!conn.reader);
    return new Promise(function (resolve, reject) {
        if (conn.err) {
            reject(conn.err);
            return;
        }
        if (conn.ended) {
            resolve(Buffer.from(""));
            return;
        }
        conn.reader = { resolve: resolve, reject: reject };
        conn.socket.resume();
    });
}
// Async write to TCP connection
function soWrite(conn, data) {
    console.assert(data.length > 0);
    return new Promise(function (resolve, reject) {
        if (conn.err) {
            reject(conn.err);
            return;
        }
        conn.socket.write(data, function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
// Async accept new TCP connection
function soAccept(server) {
    return new Promise(function (resolve) {
        server.once("connection", function (socket) {
            resolve(socket);
        });
    });
}
// Async server listen
function soListen(server, options) {
    console.log("server running now.");
    return new Promise(function (resolve, reject) {
        server.once("listening", resolve);
        server.once("error", reject);
        server.listen(options);
    });
}
// Creating server
var server = net.createServer({
    pauseOnConnect: true,
    allowHalfOpen: true,
});
server.on("error", function (error) {
    throw error;
});
// Safe SHUTDOWN on SIGINT
process.on("SIGINT", function () {
    running = false;
    console.log("Shutting down...");
    server.close(function () {
        console.log("Server closed.");
        process.exit(0);
    });
});
// Main server loop
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var socket;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, soListen(server, { host: "127.0.0.1", port: 1234 })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!running) return [3 /*break*/, 4];
                    return [4 /*yield*/, soAccept(server)];
                case 3:
                    socket = _a.sent();
                    newConn(socket);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
