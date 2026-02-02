import { useState } from "react";
import { ControlledSolarSystem } from "../components/solar-system/ControlledSolarSystem";
import { usePlayerInput } from "../hooks/usePlayerInput";
import { useSimulationSocket } from "../hooks/useSimulationSocket";
import GameHud from "../components/GameHud";
import { Minimap } from "../components/solar-system/Minimap";
import { Planet3DView } from "../components/solar-system/Planet3DView";
import { PlanetInfoPanel } from "../components/solar-system/PlanetInfoPanel";
import { useSearchParams } from "react-router-dom";
import QuizWindow from "../components/quiz/QuizWindow";
import { useUser } from "../context/UserContext";

export default function Training() {
  const [searchParams, setSearchParams] = useSearchParams();
  const planetName = searchParams.get('planet');
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  const { user } = useUser();
  const playerId = user?.id || "0";

  const { connected, stop, ws } = useSimulationSocket("ws://localhost:5000/simulations/socket");

  usePlayerInput(connected ? ws : null, playerId, !planetName);

  const handleReturnToSpace = () => {
    if (ws && ws.readyState === WebSocket.OPEN && isQuizActive) {
       ws.send(JSON.stringify({ Type: "leave_quiz", PlayerId: playerId }));
    }
    setSearchParams({});
    setIsQuizActive(false);
  };

  const handleStartQuiz = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ Type: "enter_quiz", PlayerId: playerId, Planet: planetName }));
    }
    setIsQuizActive(true);
  };

  const handleCloseQuiz = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ Type: "leave_quiz", PlayerId: playerId }));
    }
    setIsQuizActive(false);
  };

  if (planetName) {
    return (
      <main className="min-h-screen relative bg-black text-white font-geist">
        <div className="w-full h-screen absolute top-0 left-0 z-0">
          <Planet3DView planetName={planetName} />
        </div>

        <button
          onClick={handleReturnToSpace}
          className="btn-primary fixed bottom-5 right-5 z-[9999]"
        >
          Return to Space
        </button>

        {isQuizActive && (
            <QuizWindow 
                planetName={planetName} 
                onClose={handleCloseQuiz} 
                onExitOrbit={handleReturnToSpace} 
            />
        )}

        <div className="fixed top-5 left-5 z-[50]">
          <PlanetInfoPanel 
            planetName={planetName} 
            onStartQuiz={handleStartQuiz} 
          />
        </div>
      </main>
    );
  }

  return (
    <main
      className="
        min-h-screen relative
        bg-[var(--color-bg-main)] text-[var(--color-primary)]
        font-geist
      "
    >
      <section className="h-screen">
        <div className="absolute top-4 left-4 z-10 flex flex-col space-y-4 bg-black/30 p-4 rounded-md backdrop-blur-md border border-[var(--color-primary)]/20 shadow-[0_0_20px_rgba(0,255,240,0.15)]">
          <div>{connected ? "Connected" : "Disconnected"}</div>
          <div className="space-x-2">
            <button onClick={stop} className="border-1 rounded-sm p-2 text-red-600">Disconnect</button>
            <button onClick={() => window.location.reload()} className="border-1 rounded-sm p-2">Reconnect</button>
          </div>
          <GameHud/>
        </div>

        <Minimap/>

        <div className="w-full h-full overflow-hidden">
          <ControlledSolarSystem />
        </div>
      </section>
    </main>
  );
}