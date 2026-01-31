import { ControlledSolarSystem } from "../components/solar-system/ControlledSolarSystem";
import { usePlayerInput } from "../hooks/usePlayerInput";
import { useSimulationSocket } from "../hooks/useSimulationSocket";
import GameHud from "../components/GameHud";
import { Minimap } from "../components/solar-system/Minimap";
import { Planet3DView } from "../components/solar-system/Planet3DView";
import { PlanetInfoPanel } from "../components/solar-system/PlanetInfoPanel";
import { useSearchParams } from "react-router-dom";

export default function Training() {
  const [searchParams, setSearchParams] = useSearchParams();
  const planetName = searchParams.get('planet');

  const { connected, stop, ws } = useSimulationSocket("ws://localhost:5001/simulations/socket");

  // PlayerInput tylko gdy WebSocket jest gotowy
  usePlayerInput(connected ? ws : null, "0");

  const handleReturnToSpace = () => {
    setSearchParams({});
  };

  if (planetName) {
    return (
      <main className="min-h-screen relative bg-black text-white font-geist">
        <button
          onClick={handleReturnToSpace}
          className="btn-primary absolute top-5 right-5 z-[101]"
        >
          Return to Space
        </button>

        <div className="absolute top-5 left-5 z-[101]">
          <PlanetInfoPanel planetName={planetName} />
        </div>

        <Minimap/>

        <div className="w-full h-screen">
          <Planet3DView planetName={planetName} />
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
            <button onClick={stop} className="border-1 rounded-sm p-2  text-red-600">Disconnect</button>
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
