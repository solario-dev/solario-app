import { createContext, useState } from "react";
import type { ReactNode } from "react";

// 🎮 Typy stanów gry
export type GameState =
  | "idle"
  | "training"
  | "game"
  | "paused"
  | "loading"
  | "results"
  | "connecting";

interface GameStateContextType {
  state: GameState;
  setState: (newState: GameState) => void;
  startTraining: () => void;
  startGame: () => void;
  pauseGame: () => void;
  endGame: () => void;
  quitTraining: () => void;
}

export const GameStateContext = createContext<GameStateContextType | null>(null);

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GameState>("idle");

  const startTraining = () => setState("training");
  const quitTraining = () => setState("idle");
  const startGame = () => setState("game");
  const pauseGame = () => setState("paused");
  const endGame = () => setState("results");

  return (
    <GameStateContext.Provider
      value={{ state, setState, startTraining, startGame, pauseGame, endGame, quitTraining}}
    >
      {children}
    </GameStateContext.Provider>
  );
};


