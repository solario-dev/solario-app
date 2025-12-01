import { useEffect, useRef, useState, useCallback } from "react";
import { useSimulationState } from "./useSimulationState";

export function useSimulationSocket(url = "ws://localhost:5000/simulations/socket") {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const {setState} = useSimulationState();

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
        console.log("State from server:", data);
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
