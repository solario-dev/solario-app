import { useContext } from "react";
import { GameStateContext } from "../context/GameStateContext";

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context)
    throw new Error("useGame must be used within a GameProvider");
  return context;
};