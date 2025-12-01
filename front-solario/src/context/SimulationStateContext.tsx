import React, { createContext, useState } from "react";
import type { SimulationState } from "../types/simulationTypes";

type SimulationStateContextType = {
  state: SimulationState | null;
  setState: (s: SimulationState) => void;
};

export const SimulationStateContext = createContext<SimulationStateContextType | null>(null);

export const SimulationStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SimulationState | null>(null);

  return (
    <SimulationStateContext.Provider value={{ state, setState }}>
      {children}
    </SimulationStateContext.Provider>
  );
};


