import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../shared/store/authStore";
import { useTrainingSession } from "./hooks/useTrainingSession";
import { ControlledSolarSystem } from "../game/components/ControlledSolarSystem";
import GameHud from "../game/components/GameHud";
import { Minimap } from "../game/components/Minimap";
import { Planet3DView } from "../game/components/Planet3DView";
import { PlanetInfoPanel } from "../game/components/PlanetInfoPanel";
import QuizWindow from "../quiz/quiz.page";

export default function Training() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <TrainingSession playerId={user.id} />;
}

interface TrainingSessionProps {
  playerId: string;
}

function TrainingSession({ playerId }: TrainingSessionProps) {
  const { planetName, isQuizActive, exitOrbit, startQuiz, closeQuiz } =
    useTrainingSession(playerId);

  if (planetName) {
    return <PlanetOrbitView
      planetName={planetName}
      isQuizActive={isQuizActive}
      playerId={playerId}
      onExitOrbit={exitOrbit}
      onStartQuiz={startQuiz}
      onCloseQuiz={closeQuiz}
    />;
  }

  return <SpaceExplorationView />;
}

// --- Sub-views ---

interface PlanetOrbitViewProps {
  planetName: string;
  isQuizActive: boolean;
  playerId: string;
  onExitOrbit: () => void;
  onStartQuiz: () => void;
  onCloseQuiz: () => void;
}

function PlanetOrbitView({ planetName, isQuizActive, onExitOrbit, onStartQuiz, onCloseQuiz }: PlanetOrbitViewProps) {
  return (
    <main className="min-h-screen relative bg-black text-white font-geist">
      <div className="w-full h-screen absolute top-0 left-0 z-0">
        <Planet3DView planetName={planetName} />
      </div>

      <button onClick={onExitOrbit} className="btn-primary fixed bottom-10 right-10 z-[9999]">
        Return to Space
      </button>

      {isQuizActive && (
        <QuizWindow
          planetName={planetName}
          onClose={onCloseQuiz}
          onExitOrbit={onExitOrbit}
        />
      )}

      <div className="m-10 z-[50]">
        <PlanetInfoPanel planetName={planetName} onStartQuiz={onStartQuiz} />
      </div>
    </main>
  );
}

function SpaceExplorationView() {
  return (
    <main className="min-h-screen relative bg-[var(--color-bg-main)] text-[var(--color-primary)] font-geist">
      <section className="h-screen">
        <div className="absolute top-4 left-4 z-10">
          <GameHud />
        </div>

        <Minimap />

        <div className="w-full h-full overflow-hidden">
          <ControlledSolarSystem />
        </div>
      </section>
    </main>
  );
}