import { useEffect, useRef, useState } from "react";
import Arrow from "../Component/Arrow/Arrow";
import { Gauge, SimGauge } from "../Component/Gauge/gauge"

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
        path = {"M 5 10 H 500 V 450 H 500 L 100 100"}
        duration={5}
        reverse={1}
        arrow={1}
        width={300}
        height={200}
      ></Arrow>
      <Gauge 
        title="Nhiệt độ"
        value={60}
        min={0}
        max={100}
        unit="°C"
        color="#007bff" /* Màu xanh lá/dương chủ đạo */
        width={260}
        height={260}
      />
      <SimGauge 
        title="Nhiệt độ"
        value={60}
        min={0}
        max={100}
        unit="°C"
        color="yellow" /* Màu xanh lá/dương chủ đạo */
        width={260}
        height={200}
      />

    </div>
  );
}

export default Socket;
