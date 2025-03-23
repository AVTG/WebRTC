import {WebSocketServer , WebSocket} from "ws";
const wss = new WebSocketServer({ port: 8080 });

let senderSocket:null|WebSocket = null;
let recieverSocket:null|WebSocket = null;


wss.on("connection", function connection(ws){

    
    ws.on("error", (err) => {
        console.error(err);
    });


    ws.on("message", data => {
        const msg = JSON.parse(data.toString());
        
        if(msg.type === "identify-as-sender"){
            senderSocket = ws ;
            console.log("Sender set");
        }
        else if(msg.type === "identify-as-reciever"){
            recieverSocket = ws ;
            console.log("reciever set");
        }
        else if(msg.type === "create-offer"){
            recieverSocket?.send(JSON.stringify({type: "create-offer", sdp:msg.sdp}));
            console.log("Offer Set");
        }
        else if(msg.type === "create-answer"){
            senderSocket?.send(JSON.stringify({type: "create-answer", sdp:msg.sdp}));
            console.log("Answer Set");
        }
        else if(msg.type === "ice-candidate"){
            if(senderSocket === ws){
                recieverSocket?.send(JSON.stringify({type: "ice-candidate", candidate:msg.candidate}));
            }else{
                senderSocket?.send(JSON.stringify({type: "ice-candidate", candidate:msg.candidate}));
            }
        }

    });
    ws.send("Hello, I am a WebSocket server");
});