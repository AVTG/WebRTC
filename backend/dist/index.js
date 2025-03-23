"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let recieverSocket = null;
wss.on("connection", function connection(ws) {
    ws.on("error", (err) => {
        console.error(err);
    });
    ws.on("message", data => {
        const msg = JSON.parse(data.toString());
        if (msg.type === "identify-as-sender") {
            senderSocket = ws;
            console.log("Sender set");
        }
        else if (msg.type === "identify-as-reciever") {
            recieverSocket = ws;
            console.log("reciever set");
        }
        else if (msg.type === "create-offer") {
            recieverSocket === null || recieverSocket === void 0 ? void 0 : recieverSocket.send(JSON.stringify({ type: "create-offer", sdp: msg.sdp }));
            console.log("Offer Set");
        }
        else if (msg.type === "create-answer") {
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: "create-answer", sdp: msg.sdp }));
            console.log("Answer Set");
        }
        else if (msg.type === "ice-candidate") {
            if (senderSocket === ws) {
                recieverSocket === null || recieverSocket === void 0 ? void 0 : recieverSocket.send(JSON.stringify({ type: "ice-candidate", candidate: msg.candidate }));
            }
            else {
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: "ice-candidate", candidate: msg.candidate }));
            }
        }
    });
    ws.send("Hello, I am a WebSocket server");
});
