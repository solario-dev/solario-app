import { useMemo } from 'react'
import * as THREE from 'three'
import planetsData from '../../../data/planets.json'

interface AsteroidBeltProps {
  innerRadius: number  // wewnętrzny promień pasa
  outerRadius: number  // zewnętrzny promień pasa
  count: number        // liczba asteroid
  color?: string
  size?: number        // średni rozmiar asteroidy
}

export const AsteroidBelt: React.FC<AsteroidBeltProps> = ({
  innerRadius,
  outerRadius,
  count,
  color = '#888888',
  size = 0.5
}) => {
  // Generujemy pozycje asteroid tylko raz
  const asteroidPositions = useMemo(() => {
    const positions: THREE.Vector3[] = []

    for (let i = 0; i < count; i++) {
      // Losowy kąt wokół słońca
      const angle = Math.random() * Math.PI * 2

      // Losowa odległość między innerRadius a outerRadius
      const distance = innerRadius + Math.random() * (outerRadius - innerRadius)

      // Pozycja na płaszczyźnie X-Z
      const x = Math.cos(angle) * distance
      const z = Math.sin(angle) * distance

      // Niewielka losowa wysokość dla realizmu
      const y = (Math.random() - 0.5) * 5

      positions.push(new THREE.Vector3(x, y, z))
    }

    return positions
  }, [innerRadius, outerRadius, count])

  // Generujemy losowe rozmiary dla asteroid
  const asteroidSizes = useMemo(() => {
    return Array.from({ length: count }, () => size * (0.5 + Math.random()))
  }, [count, size])

  return (
    <group>
      {asteroidPositions.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[asteroidSizes[index], 6, 6]} />
          <meshStandardMaterial
            color={color}
            roughness={0.9}
            metalness={0.1}
            emissive={"red"}
            emissiveIntensity={3}
          />
        </mesh>
      ))}
    </group>
  )
}

// Komponent dla głównego pasa asteroid (między Marsem a Jowiszem)
export const MainAsteroidBelt: React.FC = () => {
  const marsObject = planetsData.celestialBodies.find(p => p.name === "Mars");
  const jupiterObject = planetsData.celestialBodies.find(p => p.name === "Jupiter");

  const innerRadius = marsObject?.orbitDiameter ?? 2858;
  const outerRadius = jupiterObject?.orbitDiameter ?? 8365;

  return (
    <AsteroidBelt
      innerRadius={innerRadius / 2 + 1000}
      outerRadius={outerRadius / 2 - 1000}
      count={80}
      color="#888888"
      size={50}
    />
  )
}

// Komponent dla asteroid trojańskich Jowisza
export const JupiterTrojans: React.FC<{ jupiterDistance: number }> = ({ jupiterDistance }) => {
  return (
    <>
      {/* Grupa L4 - prowadząca przed Jowiszem (60° przed) */}
      <AsteroidBelt
        innerRadius={jupiterDistance * 0.95}
        outerRadius={jupiterDistance * 1.05}
        count={150}
        color="#777777"
        size={1.0}
      />

      {/* Grupa L5 - podążająca za Jowiszem (60° za) */}
      <AsteroidBelt
        innerRadius={jupiterDistance * 0.95}
        outerRadius={jupiterDistance * 1.05}
        count={150}
        color="#777777"
        size={1.0}
      />
    </>
  )
}
