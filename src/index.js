const WebSocket = require("ws");
const net = require("net");
const csvtojson = require("csvtojson");

const SIMPLEDB_PORT = process.env.SIMPLEDB_PORT | 8080;
const SIMPLEDB_HOST = process.env.SIMPLEDB_HOST | "127.0.0.1";
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT | 8081;

const wss = new WebSocket.Server({port: WEBSOCKET_PORT});

wss.on("connection", (ws) => {
    console.log("Websocket client connected");

    const tcpClient = new net.Socket();
    tcpClient.connect(SIMPLEDB_PORT, SIMPLEDB_HOST, () => {
        console.log("TCP Client connected to SimpleDB server")
    });

    ws.on("message", (message) => {
        console.log("Received from WebSocket client: ", message);
        tcpClient.write(message);
    })

    tcpClient.on("data", async (data) => {
        data = data.toString("utf-8");
        console.log("Received data from SimpleDB: ", data);

        try {
            const jsonCSV = await csvtojson().fromString(data);
            if (jsonCSV.length === 0) {
                const message = JSON.stringify({output: data});
                ws.send(message);
            } else {
                const message = JSON.stringify({output: JSON.stringify(jsonCSV)});
                ws.send(message);
            }
        } catch (err) {
            console.error("Error trying to parse csv text: ", err);
            const message = JSON.stringify({output: err});
            ws.send(message);
        }
    })

    tcpClient.on("error", (err) => {
        console.error("TCP connection error: ", err);
        ws.close();
    })

    tcpClient.on("close", () => {
        console.log("SimpleDB has disconnnected");
        tcpClient.destroy();
    })

    ws.on("close", () => {
        console.log("Websocket client has disconnected");
        ws.close();
    })
});

console.log(`Websocket is running on ws://localhost:${WEBSOCKET_PORT}`);