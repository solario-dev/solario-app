import { create } from "zustand";

export type GameStateVal =
  | "idle"
  | "training"
  | "game"
  | "paused"
  | "loading"
  | "results"
  | "connecting";

interface GameState {
  state: GameStateVal;
  setState: (newState: GameStateVal) => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  startTraining: () => void;
  startGame: () => void;
  pauseGame: () => void;
  endGame: () => void;
  quitTraining: () => void;
  quitGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  state: "idle",
  showResults: false,
  setState: (state) => set({ state }),
  setShowResults: (showResults) => set({ showResults }),
  startTraining: () => set({ state: "training" }),
  startGame: () => set({ state: "game" }),
  pauseGame: () => set({ state: "paused" }),
  endGame: () => set({ state: "results" }),
  quitTraining: () => set({ state: "idle" }),
  quitGame: () => set({ state: "idle" }),
}));
