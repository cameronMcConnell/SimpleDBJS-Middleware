const WebSocket = require("ws");
const net = require("net");
const csvtojson = require("csvtojson");

const SIMPLEDB_PORT = process.env.SIMPLEDB_PORT | 8080;
const SIMPLEDB_HOST = process.env.SIMPLEDB_HOST | "127.0.0.1";
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT | 8081;

const wss = new WebSocket.Server({port: WEBSOCKET_PORT});

function isValidCSV(data) {
    const csvRegex = /^((?:"[^"]*(?:""[^"]*)*"|[^",\r\n]*)(?:,(?:"[^"]*(?:""[^"]*)*"|[^",\r\n]*))*)$/gm;

    const lines = data.split(/\r?\n/);

    for (let line of lines) {
        if (!csvRegex.test(line.trim())) {
            return false;
        }
    }

    return true;
}

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
        data = data.toString();
        console.log("Received data from SimpleDB: ", data);

        if (isValidCSV(data)) {
            try {
                const message = JSON.stringify({output: await csvtojson().fromString(data)});
                ws.send(message);
            } catch (err) {
                console.error("Error trying to parse csv text: ", err);
            }
        } else {
            const message = JSON.stringify({output: data});
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