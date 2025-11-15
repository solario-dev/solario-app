import api from "./client";
import type { Game } from "./types/Game";

// GET /api/games
export const getGames = async (): Promise<Game[]> => {
  const res = await api.get<Game[]>("/games");
  return res.data;
};

// POST /api/games
export const createGame = async (name: string): Promise<Game> => {
  const res = await api.post<Game>("/games", { name });
  return res.data;
};
