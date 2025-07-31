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
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var running = true;
var kMaxHeaderLen = 1024 * 8;
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
function parseRequestLine(line) {
    var str = line.toString("utf8");
    var parts = str.split(" ");
    if (parts.length !== 3) {
        throw new HTTPError(400, "Malformed request line");
    }
    var method = parts[0], uri = parts[1], version = parts[2];
    return [method, Buffer.from(uri), version];
}
function validateHeader(header) {
    if (header.length === 0)
        return false;
    var idx = header.indexOf(":");
    if (idx <= 0 || idx === header.length - 1)
        return false;
    return true;
}
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
        //chunked encoding
        throw new HTTPError(501, "TODO");
    }
    else {
        //read the rest of the connection
        throw new HTTPError(501, "TODO");
    }
}
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
function writeHTTPResp(conn, resp) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (resp.body.length < 0) {
                        throw new Error("TODO: chunked encoding");
                    }
                    console.assert(!fieldGet(resp.headers, "Content-Length"));
                    resp.headers.push(Buffer.from("Content-Length: ".concat(resp.body.length)));
                    // write the header
                    return [4 /*yield*/, soWrite(conn, encodeHTTPResp(resp))];
                case 1:
                    // write the header
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 5];
                    return [4 /*yield*/, resp.body.read()];
                case 3:
                    data = _a.sent();
                    if (data.length === 0) {
                        return [3 /*break*/, 5];
                    }
                    return [4 /*yield*/, soWrite(conn, data)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function handleReq(req, body) {
    return __awaiter(this, void 0, void 0, function () {
        var resp;
        return __generator(this, function (_a) {
            switch (req.uri.toString("latin1")) {
                case "/echo":
                    resp = body;
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
        });
    });
}
function bufPush(buf, data) {
    var newLen = buf.length + data.length + buf.start;
    if (buf.length < newLen) {
        var cap = Math.max(buf.data.length, 32);
        while (cap < newLen) {
            cap *= 2;
        }
        var grown = Buffer.alloc(cap);
        buf.data.copy(grown, 0, buf.start, buf.start + buf.length);
        buf.data = grown;
        buf.start = 0;
    }
    data.copy(buf.data, buf.start + buf.length);
    buf.length += data.length;
}
function cutMessage(buf) {
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
function newConn(socket) {
    return __awaiter(this, void 0, void 0, function () {
        var conn, exc_1, resp, exc_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conn = soInit(socket);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 8, 9]);
                    return [4 /*yield*/, serveClient(conn)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 3:
                    exc_1 = _a.sent();
                    console.error("exception: ", exc_1);
                    if (!(exc_1 instanceof HTTPError)) return [3 /*break*/, 7];
                    resp = {
                        code: exc_1.code,
                        headers: [],
                        body: readerFromMemory(Buffer.from(exc_1.message + "\n")),
                    };
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, writeHTTPResp(conn, resp)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    exc_2 = _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 9];
                case 8:
                    socket.destroy();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
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
function soAccept(server) {
    return new Promise(function (resolve) {
        server.once("connection", function (socket) {
            resolve(socket);
        });
    });
}
function soListen(server, options) {
    console.log("server running now.");
    return new Promise(function (resolve, reject) {
        server.once("listening", resolve);
        server.once("error", reject);
        server.listen(options);
    });
}
var server = net.createServer({
    pauseOnConnect: true,
    allowHalfOpen: true,
});
server.on("error", function (error) {
    throw error;
});
process.on("SIGINT", function () {
    running = false;
    console.log("Shutting down...");
    server.close(function () {
        console.log("Server closed.");
        process.exit(0);
    });
});
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
