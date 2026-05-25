import { create } from "zustand";
import type { SimulationState } from "../../features/game/types/simulationTypes";

interface SimState {
  state: SimulationState | null;
  setState: (state: SimulationState) => void;
}

export const useSimStore = create<SimState>((set) => ({
  state: null,
  setState: (state) => set({ state }),
}));
