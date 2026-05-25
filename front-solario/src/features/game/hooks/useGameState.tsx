import { useGameStore } from "../../../shared/store";

export const useGameState = () => {
  return useGameStore();
};