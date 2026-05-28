import React from "react";
import { useSimStore } from "../../../shared/store/simStore";

const GameHud = () => {
  const { state } = useSimStore();

  if (!state || !state.self) {
    return <div>Loading...</div>;
  }

  return (
    <div className="m-5">
      <h3>Players:</h3>
      <h2 className="font-bold">
        me:({state.self.x}, {state.self.y}, {state.self.z})
      </h2>

      {state.others.length > 0 && <p>Others:</p>}

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
