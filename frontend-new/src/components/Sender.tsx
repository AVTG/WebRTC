import { useEffect, useRef, useState } from "react";

export function Sender() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "identify-as-sender" }));
      setSocket(socket);
    };
    socket.onclose = () => {
      console.log("WebSocket closed.");
      setSocket(null);
    };
    return () => {
      socket.close(); // Cleanup on unmount
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const pc = pcRef.current;
      if (!pc) return;

      if (data.type === "create-answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if (data.type === "ice-candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    return () => {
      socket.onmessage = null; // Cleanup
    };
  }, [socket]);

  async function startSendingVideo() {
    if (!socket) return;

    if (pcRef.current) {
      console.warn("PeerConnection was closed. Recreating...");
      pcRef.current.close();
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      console.log("Sending ICE candidate");
      if (event.candidate) {
        socket.send(
          JSON.stringify({ type: "ice-candidate", candidate: event.candidate })
        );
      }
    };

    const st = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    setStream(st);
    st?.getTracks().forEach((track) => pc.addTrack(track, st));

    if (videoRef.current) {
      console.log("Setting video stream");
      videoRef.current.srcObject = st;
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.send(JSON.stringify({ type: "create-offer", sdp: offer }));
  }

  function stopStream(manualStop = false) {
    console.log("Stopping stream...");
    const pc = pcRef.current;
    if (pc) {
      pc.close();
      pcRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null; // ✅ Properly clear the video element
    }
    if (socket && manualStop) {
      socket.close();
      console.log("WebSocket closed.");
      setSocket(null);
    }


    console.log("Stream stopped.");
  }
  useEffect(() => {
    return () => {
      stopStream(false);
    };
  }, []);

  return (
    <div className="flex-col items-center justify-center">
      <video ref={videoRef} autoPlay playsInline />
      <div className="flex justify-evenly">
        <button onClick={startSendingVideo}>Send Video</button>
        <button onClick={()=>stopStream(true)}>Stop Stream</button>
      </div>
    </div>
  );
}
