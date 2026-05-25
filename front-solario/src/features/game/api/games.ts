import api from "../../../shared/lib/client";
import type { Game } from "../../../shared/types/Game";

//zwraca tablice planet, do testów tylko
// GET /simulations/state
export const getGames = async (): Promise<Game[]> => {
  const res = await api.get<Game[]>("/simulations/state");
  console.log("Response status:", res.status);
  console.log("Headers:", res.headers);
  console.log("Data:", res.data);
  return res.data;
};

// POST /api/games
// export const createGame = async (name: string): Promise<Game> => {
//   const res = await api.post<Game>("/games", { name });
//   return res.data;
// };
