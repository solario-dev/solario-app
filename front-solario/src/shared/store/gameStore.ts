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
  startTraining: () => void;
  startGame: () => void;
  pauseGame: () => void;
  endGame: () => void;
  quitTraining: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  state: "idle",
  setState: (state) => set({ state }),
  startTraining: () => set({ state: "training" }),
  startGame: () => set({ state: "game" }),
  pauseGame: () => set({ state: "paused" }),
  endGame: () => set({ state: "results" }),
  quitTraining: () => set({ state: "idle" }),
}));
