import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { CelestialBodyType } from '../../../types/CelestialBodyType'


export const CelestialBody: React.FC<CelestialBodyType> = ({
  name,
  x,
  y,
  z,
  size,
  color,
  hasRings = false,
  ringTexture
}) => {
  const groupRef = useRef<THREE.Group>(null!)
  const targetPos = useRef(new THREE.Vector3(x, y, z))

  // Kiedy nadchodzi nowa pozycja z backendu:
  useEffect(() => {
    targetPos.current.set(x, y, z)
  }, [x, y, z])

  // Interpolacja (płynne poruszanie)
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.lerp(targetPos.current, 0.1)
  })

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {hasRings && size && (
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
