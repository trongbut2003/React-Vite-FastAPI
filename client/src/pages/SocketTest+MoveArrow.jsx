import { useEffect, useRef, useState } from "react";
import Arrow from "../Component/Arrow/Arrow";

function Socket() {
  const ws = useRef(null);
  const [received, setReceived] = useState("");

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080/ws");

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      console.log("Server:", event.data);
      setReceived(event.data);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.current?.close();
    };
  }, []);


  return (
    <div>
      <h1>FastAPI + React WebSocket</h1>
      <p>Server: {received}</p>
      <Arrow
        id = {"line1"}
        path = {"M 5 10 H 150 V 150 H 200"}
        duration={5}
        reverse={1}
      ></Arrow>
    </div>
  );
}

export default Socket;
