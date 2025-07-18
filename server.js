var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as net from "net";
let running = true;
function bufPush(buf, data) {
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
function cutMessage(buf) {
    const idx = buf.data.subarray(0, buf.length).indexOf("\n");
    if (idx < 0) {
        return null;
    }
    const msg = Buffer.from(buf.data.subarray(0, idx + 1));
    bufPop(buf, idx + 1);
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
    return __awaiter(this, void 0, void 0, function* () {
        console.log("new connection", socket.remoteAddress, socket.remotePort);
        try {
            yield serveClient(socket);
        }
        catch (error) {
            console.error("error: ", error);
        }
        finally {
            socket.destroy();
        }
    });
}
function serveClient(socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = soInit(socket);
        const buf = { data: Buffer.alloc(0), start: 0, length: 0 };
        while (true) {
            const msg = cutMessage(buf);
            if (!msg) {
                const data = yield soRead(conn);
                bufPush(buf, data);
                if (data.length === 0) {
                    break;
                }
                continue;
            }
            if (msg.equals(Buffer.from("quit\n")) ||
                msg.equals(Buffer.from("quit\r\n"))) {
                yield soWrite(conn, Buffer.from("bye\n"));
                break;
            }
            else {
                const reply = Buffer.concat([Buffer.from("Echo: "), msg]);
                yield soWrite(conn, reply);
            }
        }
        console.log("end connection");
        conn.socket.end();
    });
}
function soInit(socket) {
    const conn = {
        socket: socket,
        err: null,
        ended: false,
        reader: null,
    };
    socket.on("data", (data) => {
        console.assert(conn.reader);
        conn.socket.pause();
        conn.reader.resolve(data);
        conn.reader = null;
    });
    socket.on("end", () => {
        conn.ended = true;
        if (conn.reader) {
            conn.reader.resolve(Buffer.from(""));
            conn.reader = null;
        }
    });
    socket.on("error", (err) => {
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
    return new Promise((resolve, reject) => {
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
function soWrite(conn, data) {
    console.assert(data.length > 0);
    return new Promise((resolve, reject) => {
        if (conn.err) {
            reject(conn.err);
            return;
        }
        conn.socket.write(data, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
function soAccept(server) {
    return new Promise((resolve) => {
        server.once("connection", (socket) => {
            resolve(socket);
        });
    });
}
function soListen(server, options) {
    console.log("server running now.");
    return new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
        server.listen(options);
    });
}
let server = net.createServer({
    pauseOnConnect: true,
    allowHalfOpen: true,
});
server.on("error", (error) => {
    throw error;
});
process.on("SIGINT", () => {
    running = false;
    console.log("Shutting down...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield soListen(server, { host: "127.0.0.1", port: 1234 });
        while (running) {
            let socket = yield soAccept(server);
            newConn(socket);
        }
    });
}
main();
