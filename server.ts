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
    length: number;
}

function bufPush(buf: DynBuff, data: Buffer): void {
    const newLen = buf.length + data.length;
    if (buf.length < newLen) {
        let cap = Math.max(buf.data.length, 32);
        while (cap < newLen) {
            cap *= 2;
        }
        const grown = Buffer.alloc(cap);
        buf.data.copy(grown, 0);
        buf.data = grown;
    }
    data.copy(buf.data, buf.length);
    buf.length = newLen;
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

function bufPop(buf: DynBuff, len: number): void{
    buf.data.copyWithin(0, len, buf.length);
    buf.length -= len;
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
    const buf: DynBuff = { data: Buffer.alloc(0), length: 0 };
    while (true) {
        const msg: null|Buffer = cutMessage(buf);
        const data: Buffer = await soRead(conn);
        if (data.length === 0) {
            console.log("end connection");
            break;
        }
        console.log("data: ", data);
        await soWrite(conn, data);
    }
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
