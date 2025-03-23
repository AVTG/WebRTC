import { useEffect, useRef } from "react";

export function Reciever() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "identify-as-reciever" }));
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      let pc = pcRef.current;

      if (data.type === "create-offer") {
        if (!pc) {
          console.log("Receiver set");
          pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });
          pcRef.current = pc;

          pc.onicecandidate = (event) => {
            console.log("Sending ICE candidate");
            if (event.candidate) {
              socket.send(
                JSON.stringify({
                  type: "ice-candidate",
                  candidate: event.candidate,
                })
              );
            }
          };

          pc.ontrack = (event) => {
            console.log("Got remote stream");
            if (videoRef.current) {
              videoRef.current.srcObject = event.streams[0];
            }
          };
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(JSON.stringify({ type: "create-answer", sdp: answer }));
      } else if (data.type === "ice-candidate" && pc) {
        console.log("Adding ICE candidate");
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    return () => {
      console.log("Cleaning up...");
      if (socketRef.current) {
        socketRef.current.onmessage = null;
        socketRef.current.close();
        socketRef.current = null;
      }

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      Receiver
      <video ref={videoRef} autoPlay playsInline controls />
    </div>
  );
}
