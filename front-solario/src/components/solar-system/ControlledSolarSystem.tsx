import { Canvas } from '@react-three/fiber'
import { ThirdPersonCamera } from './game-objects/ThirdPersonCamera.tsx'
import { PlayerShip } from './game-objects/PlayerShip.tsx'
import { useRef } from 'react'
import * as THREE from 'three'
import { Stars } from '@react-three/drei'
import { useSimulationState } from "../../hooks/useSimulationState";
import DebugLight from './game-objects/DebugLight.jsx'
import Sun from './game-objects/Sun.tsx'
import Planet from './game-objects/Planet.tsx'

export const ControlledSolarSystem: React.FC = () => {
  // const { ws, connected } = useSimulationSocket("ws://localhost:5000/simulations/socket"); 
  const { state } = useSimulationState();

  // usePlayerInput(connected ? ws : null, state?.self?.playerId ?? "0");

  const shipRef = useRef<THREE.Group | null>(null);

  if (!state || !state.self) return null;

  return (
    <Canvas className="fullscreen-canvas bg-black">
      <ambientLight intensity={0.2} />
      <DebugLight />
      <Stars radius={100} depth={50} count={5000} factor={4} fade />
      <Sun position={[0, 0, 0]} radius={10} color="yellow" intensity={3} rotationSpeed={0.0005} />
      <axesHelper args={[5]} />  
      {/* <gridHelper args={[20, 20]} /> */}

      {state.bodies.map((b) => (
        <Planet key={b.name} position={[b.x, b.y, b.z]} name={b.name}/>
      ))}
        {/* <mesh key={b.name} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[b.size ?? 1, 32, 32]} />
          <meshStandardMaterial color={b.color ?? "gray"} />
        </mesh>
      ))} */}

      <PlayerShip ref={shipRef} player={state.self} color="orange" />

      {state.others.map((p) => (
        <PlayerShip key={p.playerId} player={p} color="lightblue" />
      ))}

      <ThirdPersonCamera playerRef={shipRef} />
    </Canvas>
  );
};