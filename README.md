# SimpleDBJS-Middleware
The SimpleDB Node.js middleware component serves as an intermediary between WebSocket clients and the SimpleDB C++ TCP server. This component enables seamless communication by translating WebSocket messages into TCP messages and vice versa.

## Features

- Establishes a WebSocket server to listen for client connections.
- Forwards WebSocket messages to a SimpleDB server over a TCP socket.
- Sends responses from the SimpleDB server back to the WebSocket client.

## Prerequisites

- Node.js (version 16 or higher)
- Docker (optional, for containerized deployment)

## Environment Variables

- `SIMPLEDB_PORT`: The port on which the SimpleDB server is running.
- `SIMPLEDB_HOST`: The host address of the SimpleDB server.
- `WEBSOCKET_PORT`: The port on which the WebSocket server will listen (default is `8081`).

## Setup and Installation

1. **Clone the Repository:**
   ```sh
   git clone https://github.com/cameronMcConnell/SimpleDBJS-Middleware.git
   cd SimpleDBJS-Middleware
   ```

2. **Install Dependencies**:
   ```sh
   npm install
   ```

3. **Run the Server**:
   ```sh
   node src/index.js
   ```

## Using Docker:

1. **Build the Docker image**:
   ```sh
   docker build -t simpledbjs-middleware .
   ```

2. **Run the Docker container**:
   ```sh
   docker run -p 9000:9000 -e SIMPLEDB_PORT=your_simpledb_port -e SIMPLEDB_HOST=your_simpledb_host -e WEBSOCKET_PORT=your_websocket_port simpledbjs-middleware
   ```

## Usage

### Starting the Middleware:
Ensure the SimpleDB server is running and accessible. Then start the WebSocket server:

```sh
node src/index.js
```

### WebSocket Client:
Connect your WebSocket client to the WebSocket server using the specified port.

## Sending and Receiving Messages:

The client sends messages via WebSocket.
The middleware forwards these messages to the SimpleDB server over a TCP socket.
Responses from the SimpleDB server are sent back to the client via WebSocket.

### Example
```javascript
const WebSocket = require("ws");
const net = require("net");

const SIMPLEDB_PORT = process.env.SIMPLEDB_PORT || 8080;
const SIMPLEDB_HOST = process.env.SIMPLEDB_HOST || "127.0.0.1";
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8081;

const wss = new WebSocket.Server({port: WEBSOCKET_PORT});

wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    const tcpClient = new net.Socket();
    tcpClient.connect(SIMPLEDB_PORT, SIMPLEDB_HOST, () => {
        console.log("TCP Client connected to SimpleDB server");
    });

    ws.on("message", (message) => {
        console.log("Received from WebSocket client: ", message);
        tcpClient.write(message);
    });

    tcpClient.on("data", (data) => {
        console.log("Received data from SimpleDB: ", data.toString());
        ws.send(data.toString());
    });

    tcpClient.on("error", (err) => {
        console.error("TCP connection error: ", err);
        ws.close();
    });

    tcpClient.on("close", () => {
        console.log("SimpleDB has disconnected");
        tcpClient.destroy();
    });

    ws.on("close", () => {
        console.log("WebSocket client has disconnected");
        ws.close();
    });
});

console.log(`WebSocket is running on ws://localhost:${WEBSOCKET_PORT}`);
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.
