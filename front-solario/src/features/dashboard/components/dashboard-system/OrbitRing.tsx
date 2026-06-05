import React from 'react'

interface OrbitRingProps {
  distance: number
  color: string
}

export const OrbitRing: React.FC<OrbitRingProps> = ({ distance, color }) => {
  const points: number[] = []

  // Tworzymy punkty orbity
  for (let i = 0; i <= 1024; i++) {
    const angle = (i / 1024) * Math.PI * 2
    points.push(Math.cos(angle) * distance, 0, Math.sin(angle) * distance)
  }

  return (
    <lineLoop>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </lineLoop>
  )
}
