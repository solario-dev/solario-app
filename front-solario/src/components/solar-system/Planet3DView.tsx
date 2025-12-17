import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import planetsData from '../../data/planets.json'

interface Planet3DViewProps {
  planetName: string
}

export const Planet3DView: React.FC<Planet3DViewProps> = ({ planetName }) => {
  const planetInfo = planetsData.celestialBodies.find(p => p.name === planetName)

  if (!planetInfo) return null

  const { color } = planetInfo
  const displaySize = 5 // stały rozmiar do wyświetlenia

  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 45 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={100} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <Stars radius={80} depth={50} count={500} factor={4} fade />

      {/* Planeta */}
      <mesh>
        <sphereGeometry args={[displaySize, 64, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Pierścienie dla Saturna */}
      {planetInfo.hasRings && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[displaySize * 1.5, displaySize * 2.5, 64]} />
          <meshStandardMaterial
            color="#C4B49A"
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
            roughness={0.9}
          />
        </mesh>
      )}

      {/* Kontrolki orbity - pozwalają obracać planetę */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={8}
        maxDistance={25}
      />
    </Canvas>
  )
}
