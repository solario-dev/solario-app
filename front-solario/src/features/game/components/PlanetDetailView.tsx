import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'
import planetsData from '../../data/planets.json'
import { Stars } from '@react-three/drei'

interface PlanetDetailViewProps {
  planetName: string
  onClose: () => void
}

export const PlanetDetailView: React.FC<PlanetDetailViewProps> = ({ planetName, onClose }) => {
  const planetInfo = planetsData.celestialBodies.find(p => p.name === planetName)

  if (!planetInfo) return null

  const { radiusKm, color, scale } = planetInfo
  const displaySize = 5 // stały rozmiar do wyświetlenia

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000',
      zIndex: 100
    }}>
      {/* Przycisk zamknięcia */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          zIndex: 101,
          fontFamily: 'monospace'
        }}
      >
        Return to Space
      </button>

      {/* Panel informacji */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '320px',
        background: 'rgba(10, 10, 20, 0.9)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        padding: '20px',
        color: 'white',
        fontFamily: 'monospace',
        zIndex: 101
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '10px' }}>
          {planetName}
        </h2>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>RADIUS</div>
          <div style={{ fontSize: '16px' }}>{radiusKm.toLocaleString()} km</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>COLOR</div>
          <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: color,
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '3px'
            }}></div>
            {color}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>TYPE</div>
          <div style={{ fontSize: '16px' }}>Planet</div>
        </div>

        {planetInfo.hasRings && (
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>SPECIAL FEATURES</div>
            <div style={{ fontSize: '16px' }}>Ring System</div>
          </div>
        )}

        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#aaa'
        }}>
          Use mouse to rotate the planet
        </div>
      </div>

      {/* 3D widok planety */}
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
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
    </div>
  )
}
