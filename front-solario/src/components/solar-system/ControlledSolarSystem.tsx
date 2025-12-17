import { Canvas } from '@react-three/fiber'
import { ThirdPersonCamera } from './game-objects/ThirdPersonCamera.tsx'
import { PlayerShip } from './game-objects/PlayerShip.tsx'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
// import { Stars } from '@react-three/drei'
import { useSimulationState } from "../../hooks/useSimulationState";
import DebugLight from './game-objects/DebugLight.jsx'
import Sun from './game-objects/Sun.tsx'
import Planet from './game-objects/Planet.tsx'
import { LandingButton } from './LandingButton.tsx'
import planetsData from '../../data/planets.json'
import { useSearchParams } from 'react-router-dom'
// import { MainAsteroidBelt } from './game-objects/AsteroidBelt.tsx'

export const ControlledSolarSystem: React.FC = () => {
  // const { ws, connected } = useSimulationSocket("ws://localhost:5000/simulations/socket");
  const { state } = useSimulationState();
  const [searchParams, setSearchParams] = useSearchParams();

  // usePlayerInput(connected ? ws : null, state?.self?.playerId ?? "0");

  const shipRef = useRef<THREE.Group | null>(null);
  const [nearbyPlanet, setNearbyPlanet] = useState<string | null>(null);

  const LANDING_DISTANCE = 200; // odległość w jednostkach, przy której pojawia się przycisk

  const handleLandOnPlanet = (planetName: string) => {
    setSearchParams({ planet: planetName });
  };

  // Sprawdzaj odległość do planet
  useEffect(() => {
    if (!state || !state.self) return;

    const playerPos = new THREE.Vector3(state.self.x, state.self.y, state.self.z);
    let closestPlanet: string | null = null;
    let closestDistance = Infinity;

    for (const body of state.bodies) {
      const planetPos = new THREE.Vector3(body.x, body.y, body.z);
      const distanceToCenter = playerPos.distanceTo(planetPos);

      // Pobierz informacje o planecie z danych
      const planetInfo = planetsData.celestialBodies.find(p => p.name === body.name);
      const planetRadius = planetInfo ? (planetInfo.radiusKm * planetInfo.scale) : 0;

      // Oblicz odległość od powierzchni planety (odejmij promień)
      const distanceToSurface = distanceToCenter - planetRadius;

      if (distanceToSurface < LANDING_DISTANCE && distanceToSurface < closestDistance) {
        closestDistance = distanceToSurface;
        closestPlanet = body.name;
      }
    }

    setNearbyPlanet(closestPlanet);
  }, [state]);

  if (!state || !state.self) return null;

  return (
    <>
      <Canvas className="fullscreen-canvas bg-black">
        <ambientLight intensity={0.2} />
        <DebugLight />
        {/* <Stars radius={5000} depth={50} count={50000} factor={4} fade /> */}
        <Sun
          position={[0, 0, 0]}
          radius={370} color="yellow"
          intensity={500000}
          rotationSpeed={0.0005}
        />
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

        {/* Pas asteroid między Marsem a Jowiszem */}
        {/* <MainAsteroidBelt /> */}

        <PlayerShip ref={shipRef} player={state.self} color="orange" />

        {state.others.map((p) => (
          <PlayerShip key={p.playerId} player={p} color="lightblue" />
        ))}

        <ThirdPersonCamera playerRef={shipRef} />
      </Canvas>

      {/* Przycisk lądowania gdy jesteś blisko planety */}
      {nearbyPlanet && (
        <LandingButton
          planetName={nearbyPlanet}
          onLand={() => handleLandOnPlanet(nearbyPlanet)}
        />
      )}
    </>
  );
};