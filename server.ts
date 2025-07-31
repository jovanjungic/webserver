import * as net from "net";

// Global state and constants
let running: boolean = true;
const kMaxHeaderLen = 1024 * 8; // 8KB max header size

// Custom HTTP error class
class HTTPError extends Error {
    code: number;
    constructor(code: number, message: string) {
        super(message);
        this.code = code;
        this.name = "HTTPError";
    }
}

// HTTP request structure
interface HTTPReq {
    method: string;
    uri: Buffer;
    version: string;
    headers: Buffer[];
}

// HTTP response structure
interface HTTPRes {
    code: number;
    headers: Buffer[];
    body: BodyReader;
}

// Streaming body reader interface
interface BodyReader {
    length: number;
    read: () => Promise<Buffer>;
}

// TCP connection wrapper with async read support
interface TCPConn {
    socket: net.Socket;
    err: null | Error;
    ended: boolean;
    reader: null | {
        resolve: (value: Buffer) => void;
        reject: (reason: Error) => void;
    };
}

// Dynamic buffer 
interface DynBuff {
    data: Buffer;
    start: number;
    length: number;
}

// Parse buffer into lines
function splitLines(data: Buffer): Buffer[] {
    const lines: Buffer[] = [];
    let start = 0;
    for (let i = 0; i < data.length - 1; i++) {
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
function parseRequestLine(line: Buffer): [string, Buffer, string] {
    const str = line.toString("utf8");
    const parts = str.split(" ");
    if (parts.length !== 3) {
        throw new HTTPError(400, "Malformed request line");
    }
    const [method, uri, version] = parts;
    return [method, Buffer.from(uri), version];
}

// Validate HTTP header 
function validateHeader(header: Buffer): boolean {
    if (header.length === 0) return false;
    const idx = header.indexOf(":");
    if (idx <= 0 || idx === header.length - 1) return false;
    return true;
}

// Parse complete HTTP request from buffer
function parseHTTPReq(data: Buffer): HTTPReq {
    const lines: Buffer[] = splitLines(data);
    const [method, uri, version] = parseRequestLine(lines[0]);
    const headers: Buffer[] = [];
    for (let i = 1; i < lines.length - 1; i++) {
        const h = Buffer.from(lines[i]);
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
function fieldGet(headers: Buffer[], name: string): Buffer | null {
    const prefix = Buffer.from(name + ": ");
    for (const header of headers) {
        if (header.subarray(0, prefix.length).equals(prefix)) {
            return header.subarray(prefix.length);
        }
    }
    return null;
}

// Body Reader for Content-Length
function readerFromConnLength(
    conn: TCPConn,
    buf: DynBuff,
    remain: number
): BodyReader {
    return {
        length: remain,
        read: async (): Promise<Buffer> => {
            if (remain === 0) {
                return Buffer.from(""); // done
            }
            if (buf.length === 0) {
                const data = await soRead(conn);
                bufPush(buf, data);
                if (data.length === 0) {
                    throw new Error("Unexpected EOF from HTTP body.");
                }
            }
            const consume = Math.min(buf.length, remain);
            remain -= consume;
            const data = Buffer.from(
                buf.data.subarray(buf.start, buf.start + consume)
            );
            bufPop(buf, consume);
            return data;
        },
    };
}

// Create appropriate body reader
function readerFromReq(conn: TCPConn, buf: DynBuff, req: HTTPReq): BodyReader {
    let bodyLen = -1;
    const contentLen = fieldGet(req.headers, "Content-Length");
    if (contentLen) {
        bodyLen = parseInt(contentLen.toString("latin1"), 10);
        if (isNaN(bodyLen)) {
            throw new HTTPError(400, "bad Content-Length");
        }
    }
    const bodyAllowed = !(req.method === "GET" || req.method === "HEAD");
    const chunked =
        fieldGet(req.headers, "Transfer-Encoding")?.equals(
            Buffer.from("chunked")
        ) || false;
    if (!bodyAllowed && (bodyLen > 0 || chunked)) {
        throw new HTTPError(400, "HTTP body not allowed.");
    }
    if (bodyLen >= 0) {
        //"Content-Length" is present
        return readerFromConnLength(conn, buf, bodyLen);
    } else if (chunked) {
        //chunked encoding
        throw new HTTPError(501, "TODO");
    } else {
        //read the rest of the connection
        throw new HTTPError(501, "TODO");
    }
}

// Create body reader from in-memory buffer
function readerFromMemory(data: Buffer): BodyReader {
    let done = false;
    return {
        length: data.length,
        read: async (): Promise<Buffer> => {
            if (done) {
                return Buffer.from(""); // done
            } else {
                done = true;
                return data;
            }
        },
    };
}

// Convert HTTP status code to reason phrase
function getStatusText(code: number): string {
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
function encodeHTTPResp(resp: HTTPRes): Buffer {
    const statusLine = `HTTP/1.1 ${resp.code} ${getStatusText(resp.code)}\r\n`;
    const statusBuffer = Buffer.from(statusLine, "utf8");

    const parts: Buffer[] = [statusBuffer];
    parts.push(...resp.headers);

    for (let i = 1; i < parts.length; i++) {
        parts[i] = Buffer.concat([parts[i], Buffer.from("\r\n")]);
    }
    parts.push(Buffer.from("\r\n"));

    return Buffer.concat(parts);
}

// Write complete HTTP response
async function writeHTTPResp(conn: TCPConn, resp: HTTPRes): Promise<void> {
    if (resp.body.length < 0) {
        throw new Error("TODO: chunked encoding");
    }
    console.assert(!fieldGet(resp.headers, "Content-Length"));
    resp.headers.push(Buffer.from(`Content-Length: ${resp.body.length}`));
    // write the header
    await soWrite(conn, encodeHTTPResp(resp));
    // write the body
    while (true) {
        const data = await resp.body.read();
        if (data.length === 0) {
            break;
        }
        await soWrite(conn, data);
    }
}

// Handle HTTP request and response
async function handleReq(req: HTTPReq, body: BodyReader): Promise<HTTPRes> {
    let resp: BodyReader;
    switch (req.uri.toString("latin1")) {
        case "/echo":
            resp = body;
            break;
        default:
            resp = readerFromMemory(Buffer.from("hello world.\n"));
            break;
    }

    return {
        code: 200,
        headers: [Buffer.from("Server: my_first_http_server")],
        body: resp,
    };
}

// Add data to dynamic buffer
function bufPush(buf: DynBuff, data: Buffer): void {
    const newLen = buf.length + data.length + buf.start;
    if (buf.length < newLen) {
        let cap = Math.max(buf.data.length, 32);
        while (cap < newLen) {
            cap *= 2;
        }
        const grown = Buffer.alloc(cap);
        buf.data.copy(grown, 0, buf.start, buf.start + buf.length);
        buf.data = grown;
        buf.start = 0;
    }
    data.copy(buf.data, buf.start + buf.length);
    buf.length += data.length;
}

// Extract complete HTTP message from buffer
function cutMessage(buf: DynBuff): null | HTTPReq {
    const idx = buf.data.subarray(0, buf.length).indexOf("\r\n\r\n");
    if (idx < 0) {
        if (buf.length >= kMaxHeaderLen) {
            throw new HTTPError(413, "header is too large");
        }
        return null;
    }
    const msg = parseHTTPReq(buf.data.subarray(0, idx + 4));
    bufPop(buf, idx + 4);
    return msg;
}

// Remove consumed data from buffer
function bufPop(buf: DynBuff, len: number): void {
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
async function newConn(socket: net.Socket): Promise<void> {
    const conn: TCPConn = soInit(socket);
    try {
        await serveClient(conn);
    } catch (exc) {
        console.error("exception: ", exc);
        if (exc instanceof HTTPError) {
            const resp: HTTPRes = {
                code: exc.code,
                headers: [],
                body: readerFromMemory(Buffer.from(exc.message + "\n")),
            };
            try {
                await writeHTTPResp(conn, resp);
            } catch (exc) {
                // ignore
            }
        }
    } finally {
        socket.destroy();
    }
}

// Client serving loop
async function serveClient(conn: TCPConn): Promise<void> {
    const buf: DynBuff = { data: Buffer.alloc(0), length: 0, start: 0 };
    while (true) {
        const msg: null | HTTPReq = cutMessage(buf);
        if (!msg) {
            const data = await soRead(conn);
            bufPush(buf, data);
            if (data.length === 0 && buf.length === 0) {
                return;
            }
            if (data.length === 0) {
                throw new HTTPError(400, "Unexpected EOF.");
            }
            continue;
        }

        const reqBody: BodyReader = readerFromReq(conn, buf, msg);
        const res: HTTPRes = await handleReq(msg, reqBody);
        await writeHTTPResp(conn, res);

        if (msg.version === "1.0") {
            return;
        }

        while ((await reqBody.read()).length > 0) {}
    }
}

// Initialize TCP connection
function soInit(socket: net.Socket): TCPConn {
    const conn: TCPConn = {
        socket: socket,
        err: null,
        ended: false,
        reader: null,
    };

    socket.on("data", (data: Buffer) => {
        console.assert(conn.reader);
        conn.socket.pause();
        conn.reader!.resolve(data);
        conn.reader = null;
    });

    socket.on("end", () => {
        conn.ended = true;
        if (conn.reader) {
            conn.reader.resolve(Buffer.from(""));
            conn.reader = null;
        }
    });

    socket.on("error", (err: Error) => {
        conn.err = err;
        if (conn.reader) {
            conn.reader.reject(err);
            conn.reader = null;
        }
    });

    return conn;
}

// Async read from TCP connection
function soRead(conn: TCPConn): Promise<Buffer> {
    console.assert(!conn.reader);
    return new Promise<Buffer>((resolve, reject) => {
        if (conn.err) {
            reject(conn.err);
            return;
        }
        if (conn.ended) {
            resolve(Buffer.from(""));
            return;
        }
        conn.reader = { resolve, reject };
        conn.socket.resume();
    });
}

// Async write to TCP connection
function soWrite(conn: TCPConn, data: Buffer): Promise<void> {
    console.assert(data.length > 0);
    return new Promise<void>((resolve, reject) => {
        if (conn.err) {
            reject(conn.err);
            return;
        }
        conn.socket.write(data, (err?: Error | null) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Async accept new TCP connection
function soAccept(server: net.Server): Promise<net.Socket> {
    return new Promise<net.Socket>((resolve) => {
        server.once("connection", (socket: net.Socket) => {
            resolve(socket);
        });
    });
}

// Async server listen
function soListen(
    server: net.Server,
    options: net.ListenOptions
): Promise<void> {
    console.log("server running now.");
    return new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
        server.listen(options);
    });
}

// Creating server
let server: net.Server = net.createServer({
    pauseOnConnect: true,
    allowHalfOpen: true,
});

server.on("error", (error: Error) => {
    throw error;
});

// Safe SHUTDOWN on SIGINT
process.on("SIGINT", () => {
    running = false;
    console.log("Shutting down...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});

// Main server loop
async function main(): Promise<void> {
    await soListen(server, { host: "127.0.0.1", port: 1234 });
    while (running) {
        let socket: net.Socket = await soAccept(server);
        newConn(socket);
    }
}
main();
