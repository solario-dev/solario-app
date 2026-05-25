import { useContext } from "react";
import { SimulationStateContext } from "../../../app/providers/SimulationStateContext";

export const useSimulationState = () => {
  const ctx = useContext(SimulationStateContext);
  if (!ctx) throw new Error("useSimulationState must be used inside SimulationStateProvider");
  return ctx;
};