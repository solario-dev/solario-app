import { ControlledSolarSystem } from "../components/solar-system/ControlledSolarSystem";
import { usePlayerInput } from "../hooks/usePlayerInput";
import { useSimulationSocket } from "../hooks/useSimulationSocket";
import GameHud from "../components/GameHud";

export default function Training() {

  const { ws, connected, stop } = useSimulationSocket("ws://localhost:5000/simulations/socket");

  // PlayerInput tylko gdy WebSocket jest gotowy
  usePlayerInput(connected ? ws : null, "0");


  return (
    <main
      className="
        min-h-screen relative
        bg-[var(--color-bg-main)] text-[var(--color-primary)]
        font-geist
      "
    >
      
      {/* Główna sekcja z układem słonecznym */}
      <section className="h-screen">
        <div className="absolute top-4 left-4 z-10 flex flex-col space-y-4 bg-black/30 p-4 rounded-md backdrop-blur-md border border-[var(--color-primary)]/20 shadow-[0_0_20px_rgba(0,255,240,0.15)]">
          <div>{connected ? "Connected" : "Disconnected"}</div>
          <div className="space-x-2">
            <button onClick={stop}>Disconnect</button>
            <button onClick={() => window.location.reload()}>Reconnect</button>
          </div>
          <GameHud/>
        </div>
        <div className="w-full h-full overflow-hidden">
          <ControlledSolarSystem />
        </div>
      </section>
    </main>
  );
}
