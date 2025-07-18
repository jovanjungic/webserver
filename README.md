# Learning Web Server (TypeScript)

This project is a personal learning journey: building a web server from scratch in TypeScript. The goal is to deepen my understanding of networking, TCP, and how web servers work under the hood, while also getting hands-on experience with TypeScript for type safety and modern JavaScript development.

## What is this?
- **Currently:** A simple TCP echo server that accepts connections and echoes back any data sent by the client.
- **Goal:** Evolve this into a more complete web server, learning about HTTP, protocols, and networking as I go.

## Why?
- To learn about low-level networking and how real web servers operate.
- To practice TypeScript and modern Node.js development.
- To build a strong foundation for future projects and job opportunities in backend/web development.

## Features (so far)
- Accepts TCP connections and echoes data
- Graceful shutdown on Ctrl+C (SIGINT)
- Promise-based, modular connection handling
- TypeScript for type safety and clarity

## Getting Started

### 1. Install dependencies
```
npm install
```

### 2. Compile TypeScript
```
npx tsc
```

### 3. Run the server
```
node server.js
```

The server listens on `127.0.0.1:1234` by default.

## Project Structure
- `server.ts` — Main server code (TypeScript)
- `server.js` — Compiled JavaScript output
- `.gitignore` — Ignores node_modules, build output, etc.
- `tsconfig.json` — TypeScript configuration

## Notes
- The code uses a custom `TCPConn` type for managing connection state.
- All connection logic is promise-based for readability and maintainability.
- This project will grow and change as I learn more about networking and web servers.

---

Feel free to follow along, use, or modify this project for your own learning!