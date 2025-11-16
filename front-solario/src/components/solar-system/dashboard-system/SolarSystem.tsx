import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Planet } from './Planet.tsx'
import { Sun } from './Sun.tsx'
import planetsData from '../../../data/planets.json'

export const SolarSystem: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 50 }} className="fullscreen-canvas bg-black">
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} fade />

      {planetsData.celestialBodies.map((p) =>
        p.name === 'Sun' ? (
          <Sun
            key={p.name}
            scale={p.scale}
            color={p.color}
            texture={p.texture}
            emissiveIntensity={p.emissiveIntensity}
            lightIntensity={p.lightIntensity}
          />
        ) : (
          <Planet
            key={p.name}
            name={p.name}
            distance={p.distanceScale * 4}
            size={p.scale * 0.5 * 0.1}
            color={p.color}
            // texture={p.texture}
            speed={1 / (p.orbitalPeriodDays / 365)}
            hasRings={p.hasRings}
            ringTexture={p.ringTexture}
          />
        )
      )}
      <OrbitControls />
    </Canvas>
  )
}
