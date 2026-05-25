import React from "react";
import { useSimulationState } from "../hooks/useSimulationState";

const GameHud = () => {
  const { state } = useSimulationState();

  if (!state || !state.self) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div>
      <h3>Players:</h3>
      <h2 className="font-bold">
        {state.self.playerId}:({state.self.x}, {state.self.y}, {state.self.z}){state.self.rot}
      </h2>
      
      <ul>
        {state.others?.map(p => (
          <li key={p.playerId}>
            {p.playerId}: ({p.x}, {p.y}, {p.z})
          </li>
        ))}
      </ul>

      {/* <h3>Bodies:</h3>
      <ul>
        {state.bodies?.map(b => (
          <li key={b.name}>
            {b.name}: ({b.x}, {b.y}, {b.z})
          </li>
        ))}
      </ul> */}
    </div>
  );
};


export default GameHud;
