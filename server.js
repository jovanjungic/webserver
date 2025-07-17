import * as net from "net";
let running = true;

async function newConn(socket) {
    console.log("new connection", socket.remoteAddress, socket.remotePort);
    try {
        await serveClient(socket);
    } catch (error) {
        console.error("exception: ", error);
    } finally {
        socket.destroy();
    }
}

async function serveClient(socket) {
    const conn = soInit(socket);
    while (true) {
        const data = await soRead(conn);
        if (data.length === 0) {
            console.log("end connection");
            break;
        }

        console.log("data: ", data);
        await soWrite(conn, data);
    }
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
            conn.reader.resolve(Buffer.from("")); // this makes EOF
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
        }
        conn.reader = { resolve: resolve, reject: reject };
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
            if (err) reject(err);
            else resolve();
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

let server = net.createServer({
    pauseOnConnect: true,
});

server.on("error", (error) => {
    throw error;
});
server.listen({ host: "127.0.0.1", port: 1234 });

process.on('SIGINT', () => {
    running = false;
    console.log('Shutting down...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

async function main() {
    while (running) {
        let socket = await soAccept(server);
        newConn(socket);
    }
}
main();