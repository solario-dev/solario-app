import { Canvas } from '@react-three/fiber'
import { ThirdPersonCamera } from './game-objects/ThirdPersonCamera.tsx'
import { PlayerShip } from './game-objects/PlayerShip.tsx'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useSimulationState } from "../hooks/useSimulationState.tsx";
import Sun from './game-objects/Sun.tsx'
import Planet from './game-objects/Planet.tsx'
import { LandingButton } from './LandingButton.tsx'
import planetsData from '../../../assets/planets.json'
import { useSearchParams } from 'react-router-dom'

export const ControlledSolarSystem: React.FC = () => {
  const { state } = useSimulationState();
  const [searchParams, setSearchParams] = useSearchParams();

  const shipRef = useRef<THREE.Group | null>(null);
  const [nearbyPlanet, setNearbyPlanet] = useState<string | null>(null);

  const LANDING_DISTANCE = 200;

  const handleLandOnPlanet = (planetName: string) => {
    setSearchParams({ planet: planetName });
  };

  useEffect(() => {
    if (!state || !state.self) return;

    const playerPos = new THREE.Vector3(state.self.x, state.self.y, state.self.z);
    let closestPlanet: string | null = null;
    let closestDistance = Infinity;

    for (const body of state.bodies) {
      const planetPos = new THREE.Vector3(body.x, body.y, body.z);
      const distanceToCenter = playerPos.distanceTo(planetPos);

      const planetInfo = planetsData.celestialBodies.find(p => p.name === body.name);
      const planetRadius = planetInfo ? (planetInfo.radiusKm * planetInfo.scale) : 0;

      const distanceToSurface = distanceToCenter - planetRadius;

      if (distanceToSurface < LANDING_DISTANCE && distanceToSurface < closestDistance) {
        closestDistance = distanceToSurface;
        closestPlanet = body.name;
      }
    }

    setNearbyPlanet(closestPlanet);
  }, [state]);


  useEffect(() => {
    if (state) {
      console.log("Simulation state:", {
        hasSelf: !!state.self,
        bodiesCount: state.bodies?.length || 0,
        bodies: state.bodies
      });
    }
  }, [state]);

  if (!state) {
    console.warn("No simulation state yet");
    return null;
  }

  return (
    <>
      <Canvas className="fullscreen-canvas bg-black">
        <ambientLight intensity={1.5} />
        <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={1.0} />

        <Sun
          position={[0, 0, 0]}
          radius={370} color="yellow"
          intensity={500000}
          rotationSpeed={0.0005}
        />

        {state.bodies?.map((b) => (
          <Planet key={b.name} position={[b.x, b.y ?? 0, b.z]} name={b.name} />
        ))}

        {state.self && (
          <>
            <PlayerShip ref={shipRef} player={state.self} color="#00FFF0" />
            <ThirdPersonCamera playerRef={shipRef} />
          </>
        )}

        {state.others?.map((p) => (
          <PlayerShip key={p.playerId} player={p} color="#FF365D" />
        ))}
      </Canvas>

      {nearbyPlanet && (
        <LandingButton
          planetName={nearbyPlanet}
          onLand={() => handleLandOnPlanet(nearbyPlanet)}
        />
      )}
    </>
  );
};