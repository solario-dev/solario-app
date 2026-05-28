import { useEffect, useRef } from "react";

type KeysState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  turbo: boolean;
};

// Dodano parametr enabled (domyślnie true)
export function usePlayerInput(ws: WebSocket | null, playerId: string, enabled: boolean = true) {
  const keys = useRef<KeysState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    turbo: false,
  });
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Jeśli wyłączone lub brak WS, nie rób nic
    if (!ws || !enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          keys.current.forward = true;
          break;
        case "arrowdown":
        case "s":
          keys.current.backward = true;
          break;
        case "arrowleft":
        case "a":
          keys.current.left = true;
          break;
        case "arrowright":
        case "d":
          keys.current.right = true;
          break;
        case "shift":
          keys.current.turbo = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          keys.current.forward = false;
          break;
        case "arrowdown":
        case "s":
          keys.current.backward = false;
          break;
        case "arrowleft":
        case "a":
          keys.current.left = false;
          break;
        case "arrowright":
        case "d":
          keys.current.right = false;
          break;
        case "shift":
          keys.current.turbo = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    intervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const input = {
          PlayerId: playerId,
          Type: "input",
          Keys: {
            Forward: keys.current.forward,
            Backward: keys.current.backward,
            Left: keys.current.left,
            Right: keys.current.right,
            Turbo: keys.current.turbo,
          },
        };
        ws.send(JSON.stringify(input));
      }
    }, 33);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ws, playerId, enabled]); // Dodano enabled do zależności
}