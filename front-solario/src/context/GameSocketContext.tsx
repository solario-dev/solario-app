import React, { createContext, useContext, useEffect, useMemo } from "react";
import { createGameHub, type PlanetPositionDto } from "../services/signalR";

type SocketContextType = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  onReceivePlanets: (cb: (list: PlanetPositionDto[]) => void) => void;
  onPlanetUpdated: (cb: (p: PlanetPositionDto) => void) => void;
  updatePlanet: (p: PlanetPositionDto) => Promise<void>;
};

const SocketContext = createContext<SocketContextType | null>(null);

export const GameSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hub = useMemo(() => createGameHub("/gamehub"), []);
  useEffect(() => { hub.start().catch(console.error); return () => { hub.stop().catch(()=>{}); }; }, [hub]);

  const onReceivePlanets = (cb: (list: PlanetPositionDto[]) => void) => hub.on("ReceivePlanets", cb);
  const onPlanetUpdated = (cb: (p: PlanetPositionDto) => void) => hub.on("PlanetUpdated", cb);
  const updatePlanet = async (p: PlanetPositionDto) => hub.invoke("UpdatePlanetPosition", p);

  return (
    <SocketContext.Provider value={{ start: hub.start, stop: hub.stop, onReceivePlanets, onPlanetUpdated, updatePlanet }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useGameSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useGameSocket must be used inside GameSocketProvider");
  return ctx;
};