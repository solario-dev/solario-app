export type PlayerState = {
  playerId: string;
  x: number;
  y: number;
  z: number;
  rot: number;
};

export type BodyState = {
  name: string;
  x: number;
  y: number;
  z: number;
};

export type SimulationState = {
  type: "state";
  self: PlayerState;
  others: PlayerState[];
  bodies: BodyState[];
};
