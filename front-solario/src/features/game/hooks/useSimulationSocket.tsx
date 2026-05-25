import { useEffect, useRef, useState, useCallback } from "react";
import { useSimStore } from "../../../shared/store";

export function useSimulationSocket(url = "ws://localhost:5000/simulations/socket") {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const { setState } = useSimStore();

  // Funkcja do otwierania połączenia
  const start = useCallback(() => {
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      return; // już otwarte lub w trakcie łączenia
    }

    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      console.log("WebSocket opened");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Log rotation changes
        if (data.self && Math.random() < 0.033) { // Log ~1 per second at 30 FPS
          console.log(`Frontend received: rot=${data.self.rot.toFixed(2)}°, pos=(${data.self.x.toFixed(1)}, ${data.self.z.toFixed(1)})`);
        }

        setState(data);
      } catch (e) {
        console.error("Invalid JSON from server", e);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
      setConnected(false);
    };

    socket.onerror = (e) => console.error("WebSocket error", e);
  }, [url]);

  // Funkcja do zamykania połączenia
  const stop = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.close(1000, "Client closing");
    }
  }, []);

  // Automatyczne startowanie po zamontowaniu
  useEffect(() => {
    start();

    // cleanup przy odmontowaniu
    return () => {
      stop();
    };
  }, [start, stop]);

  return { ws: ws.current, connected, start, stop };
}
