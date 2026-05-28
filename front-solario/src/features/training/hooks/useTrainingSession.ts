import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSimulationSocket } from "../../game/hooks/useSimulationSocket";
import { usePlayerInput } from "../../solar-system/hooks/usePlayerInput";

const WS_URL = "ws://localhost:5001/simulations/socket";

export function useTrainingSession(playerId: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isQuizActive, setIsQuizActive] = useState(false);

  const planetName = searchParams.get("planet");

  const { connected, ws } = useSimulationSocket(WS_URL);

  // Input is only active when not orbiting a planet
  usePlayerInput(connected ? ws : null, playerId, !planetName);

  const enterOrbit = (planet: string) => {
    setSearchParams({ planet });
  };

  const exitOrbit = () => {
    if (ws && ws.readyState === WebSocket.OPEN && isQuizActive) {
      ws.send(JSON.stringify({ Type: "leave_quiz", PlayerId: playerId }));
    }
    setSearchParams({});
    setIsQuizActive(false);
  };

  const startQuiz = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ Type: "enter_quiz", PlayerId: playerId, Planet: planetName }));
    }
    setIsQuizActive(true);
  };

  const closeQuiz = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ Type: "leave_quiz", PlayerId: playerId }));
    }
    setIsQuizActive(false);
  };

  return {
    connected,
    ws,
    planetName,
    isQuizActive,
    enterOrbit,
    exitOrbit,
    startQuiz,
    closeQuiz,
  };
}
