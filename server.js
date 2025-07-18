"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
let running = true;
function newConn(socket) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("new connection", socket.remoteAddress, socket.remotePort);
        try {
            yield serveClient(socket);
        }
        catch (error) {
            console.error("exception: ", error);
        }
        finally {
            socket.destroy();
        }
    });
}
function serveClient(socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = soInit(socket);
        while (true) {
            const data = yield soRead(conn);
            if (data.length === 0) {
                console.log("end connection");
                break;
            }
            console.log("data: ", data);
            yield soWrite(conn, data);
        }
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
let server = net.createServer({
    pauseOnConnect: true,
});
server.on("error", (error) => {
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        while (running) {
            let socket = yield soAccept(server);
            newConn(socket);
        }
    });
}
main();
