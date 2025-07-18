import * as net from "net";

let running: boolean = true;

// TCPConn type definition
interface TCPConn {
    socket: net.Socket;
    err: Error | null;
    ended: boolean;
    reader: null | {
        resolve: (value: Buffer) => void;
        reject: (reason: Error) => void;
    };
}

async function newConn(socket: net.Socket): Promise<void> {
    console.log("new connection", socket.remoteAddress, socket.remotePort);
    try {
        await serveClient(socket);
    } catch (error) {
        console.error("exception: ", error);
    } finally {
        socket.destroy();
    }
}

async function serveClient(socket: net.Socket): Promise<void> {
    const conn: TCPConn = soInit(socket);
    while (true) {
        const data: Buffer = await soRead(conn);
        if (data.length === 0) {
            console.log("end connection");
            break;
        }
        console.log("data: ", data);
        await soWrite(conn, data);
    }
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

let server: net.Server = net.createServer({
    pauseOnConnect: true,
});

server.on("error", (error: Error) => {
    throw error;
});
server.listen({ host: "127.0.0.1", port: 1234 });

process.on("SIGINT", () => {
    running = false;
    console.log("Shutting down...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});

async function main(): Promise<void> {
    while (running) {
        let socket: net.Socket = await soAccept(server);
        newConn(socket);
    }
}
main();
