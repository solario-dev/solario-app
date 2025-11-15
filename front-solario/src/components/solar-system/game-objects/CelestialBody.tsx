import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { CelestialBodyProps } from '../../../types/CelestialBody'


export const CelestialBody: React.FC<CelestialBodyProps> = ({
  name,
  position,
  size,
  color,
  hasRings = false,
  ringTexture
}) => {
  const groupRef = useRef<THREE.Group>(null!)
  const targetPos = useRef(new THREE.Vector3(...position))

  // Kiedy nadchodzi nowa pozycja z backendu:
  useEffect(() => {
    targetPos.current.set(position[0], position[1], position[2])
  }, [position])

  // Interpolacja (płynne poruszanie)
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.lerp(targetPos.current, 0.1)
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {hasRings && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.2, size * 2.5, 64]} />
          <meshBasicMaterial
            map={ringTexture ? new THREE.TextureLoader().load(ringTexture) : undefined}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}
