import { useEffect, useRef } from "react";

type KeysState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

export function usePlayerInput(ws: WebSocket | null, playerId: string) {
  const keys = useRef<KeysState>({ forward: false, backward: false, left: false, right: false });
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    if (!ws) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") keys.current.forward = true;
      if (e.key === "ArrowDown") keys.current.backward = true;
      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") keys.current.forward = false;
      if (e.key === "ArrowDown") keys.current.backward = false;
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
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
            Right: keys.current.right
          }
        };
        ws.send(JSON.stringify(input));
      }
    }, 50); // wysyłanie co 50ms

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [ws, playerId]);
}
