# HTTP Server Implementation (TypeScript)

This project is a personal learning journey: building an HTTP server from scratch in TypeScript. I'm following a book to understand the concepts around HTTP servers and how they work at a lower level. This is my own implementation with some personal quirks and modifications.

## Progress
- **Current Status**: ~60% through the book
- **Implementation**: HTTP server with request parsing, response handling, chunked encoding, and streaming responses
- **Code Quality**: Currently in one large `server.ts` file (will be refactored into util folders for clean code later)

## What is this?
- **Currently:** A functional HTTP server that can parse HTTP requests, handle different routes, echo back request bodies, and stream responses
- **Features:** HTTP/1.1 compliant request parsing, Content-Length body reading, chunked transfer encoding, streaming responses, proper response writing
- **Goal:** Continue learning HTTP protocol details, implement more HTTP features, and improve code organization

## Why?
- To deeply understand how HTTP servers work under the hood
- To learn about HTTP protocol parsing and implementation
- To practice TypeScript and low-level networking concepts
- To build a strong foundation for understanding web technologies

## Current Features
- ✅ HTTP request parsing (method, URI, version, headers)
- ✅ HTTP response writing with proper headers
- ✅ Content-Length body reading and streaming
- ✅ Chunked transfer encoding support (in progress)
- ✅ HTTP/1.0 EOF body reading
- ✅ `/echo` endpoint that returns request body
- ✅ `/sheep` endpoint with streaming response (counts 0-99, one per second)
- ✅ Default route serving "hello world"
- ✅ Proper HTTP/1.1 keep-alive handling
- ✅ Error handling with appropriate HTTP status codes
- ✅ Graceful shutdown on Ctrl+C (SIGINT)
- ✅ Buffer management for efficient data handling
- ✅ Async generators for streaming responses

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the server
```bash
npm start
```

The server listens on `127.0.0.1:1234` by default.

## Testing

### Basic test
```bash
curl http://127.0.0.1:1234/
# Returns: "hello world."
```

### Echo endpoint
```bash
curl -s --data-binary 'hello' http://127.0.0.1:1234/echo
# Returns: "hello"
```

### Streaming sheep endpoint
```bash
curl http://127.0.0.1:1234/sheep
# Returns: counts 0-99, one number per second
```

### Chunked encoding test
```bash
curl -T- http://127.0.0.1:1234/echo
# Type your message and press Ctrl+D
```

### File echo test
```bash
echo "test content" > test.txt
curl -s --data-binary @test.txt http://127.0.0.1:1234/echo | sha1sum
sha1sum test.txt
# Both should produce the same hash
```

## Project Structure
- `server.ts` — Main HTTP server implementation (TypeScript)
- `server.js` — Compiled JavaScript output (ignored by git)
- `package.json` — Dependencies and scripts
- `tsconfig.json` — TypeScript configuration

## Implementation Details
- **HTTP Parsing**: Custom implementation of HTTP request line and header parsing
- **Body Reading**: Streaming body reader with Content-Length, chunked encoding, and EOF support
- **Buffer Management**: Efficient dynamic buffer with compaction
- **Connection Handling**: Promise-based async/await pattern
- **Error Handling**: HTTP-compliant error responses
- **Streaming**: Async generators for producing streaming responses

## TODO (from book, for now)
- [x] Chunked encoding support (in progress - debugging)
- [x] Connection-close body reading (EOF)
- [ ] More HTTP methods and status codes
- [ ] Code refactoring into modules
- [ ] Additional HTTP features

## Notes
- This is a learning project following a book's guidance
- Code is functional but not production-ready
- Will be refactored for better organization as the project grows
- Focus is on understanding concepts rather than perfect implementation
- This was written by AI, I find that it will create this README file much better than I would currently, especially with all of this in my mind currently. The project does make use of AI, but mainly to assist me in understanding key concepts from the book I am following
- The book is ' Build Your Own Web Server from Scratch in Node.JS '

---

This is a personal learning project. Feel free to explore the code and learn alongside me!