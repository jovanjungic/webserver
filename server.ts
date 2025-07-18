import * as net from "net";

let running: boolean = true;

// TCPConn type definition
interface TCPConn {
    socket: net.Socket;
    err: null | Error;
    ended: boolean;
    reader: null | {
        resolve: (value: Buffer) => void;
        reject: (reason: Error) => void;
    };
}

// Dynamic buffer definition
interface DynBuff {
    data: Buffer;
    start: number;
    length: number;
}

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

function cutMessage(buf: DynBuff): null | Buffer {
    const idx = buf.data.subarray(0, buf.length).indexOf("\n");
    if (idx < 0) {
        return null;
    }
    const msg = Buffer.from(buf.data.subarray(0, idx + 1));
    bufPop(buf, idx + 1);
    return msg;
}

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

async function newConn(socket: net.Socket): Promise<void> {
    console.log("new connection", socket.remoteAddress, socket.remotePort);
    try {
        await serveClient(socket);
    } catch (error) {
        console.error("error: ", error);
    } finally {
        socket.destroy();
    }
}

async function serveClient(socket: net.Socket): Promise<void> {
    const conn: TCPConn = soInit(socket);
    const buf: DynBuff = { data: Buffer.alloc(0), start: 0, length: 0 };
    while (true) {
        const msg: null | Buffer = cutMessage(buf);
        if (!msg) {
            const data: Buffer = await soRead(conn);
            bufPush(buf, data);
            if (data.length === 0) {
                break;
            }
            continue;
        }
        if (
            msg.equals(Buffer.from("quit\n")) ||
            msg.equals(Buffer.from("quit\r\n"))
        ) {
            await soWrite(conn, Buffer.from("bye\n"));
            break;
        } else {
            const reply = Buffer.concat([Buffer.from("Echo: "), msg]);
            await soWrite(conn, reply);
        }
    }
    console.log("end connection");
    conn.socket.end();
}

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

function soAccept(server: net.Server): Promise<net.Socket> {
    return new Promise<net.Socket>((resolve) => {
        server.once("connection", (socket: net.Socket) => {
            resolve(socket);
        });
    });
}

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

let server: net.Server = net.createServer({
    pauseOnConnect: true,
    allowHalfOpen: true,
});

server.on("error", (error: Error) => {
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

async function main(): Promise<void> {
    await soListen(server, { host: "127.0.0.1", port: 1234 });
    while (running) {
        let socket: net.Socket = await soAccept(server);
        newConn(socket);
    }
}
main();
