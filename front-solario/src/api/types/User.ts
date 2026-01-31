export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  level: number;
  credits: number;
  quizzesCompleted: number;
  wins: number;
  conqueredPlanets: string[];
  inventory: string[];
  equippedSkin: string;
}