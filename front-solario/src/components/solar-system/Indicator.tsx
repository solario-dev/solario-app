import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

interface IndicatorProps {
  position: [number, number, number]
  label: string
  color?: string
  size?: number
  distance?: number
}

export const Indicator: React.FC<IndicatorProps> = ({
  position,
  label,
  color = 'white',
  size = 0.3,
  distance = 5,
}) => {
  const groupRef = useRef<THREE.Group>(null!)
  const { camera } = useThree()

  useFrame(() => {
    if (!groupRef.current) return

    // billboard - zawsze przodem do kamery
    groupRef.current.lookAt(camera.position)

    // obliczanie odległości od kamery
    const distance = camera.position.distanceTo(groupRef.current.position)

    // Skalowanie odwrotnie do odległości (im dalej kamera, tym większy obiekt)
    const baseDistance = 10 // można dobrać doświadczalnie
    let scale = distance / baseDistance

    const minScale = 1  // nigdy mniejszy niż 50% normalnego rozmiaru
    const maxScale = 2.0  // nigdy większy niż 300%

    scale = Math.min(Math.max(scale, minScale), maxScale)

    groupRef.current.scale.set(scale, scale, scale)

  })

  return (
    <group ref={groupRef} position={position}>
      {/* Małe kółko */}
      <mesh>
        <ringGeometry args={[size * 2, size * 2 + 0.05, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Tekst obok */}
      <Text
        position={[size * 2.5, 0, 0]}
        color="#75B7ED"
        fontSize={0.3}
        anchorX="left"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}
