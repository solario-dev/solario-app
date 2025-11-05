import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { OrbitRing } from './OrbitRing.tsx'
// import { TextureLoader } from 'three'
// import { useLoader } from '@react-three/fiber'
import { Indicator } from './Indicator.tsx'

interface PlanetProps {
  name: string
  distance: number
  size: number
  // texture: string
  color: string
  speed: number
  hasMoon?: boolean
  moonTexture?: string
  hasRings?: boolean
  ringTexture?: string
}

export const Planet: React.FC<PlanetProps> = ({name, distance, size, color, speed, hasMoon = false, moonTexture }) => {
  const groupRef = useRef<THREE.Group>(null!)
  const planetMeshRef = useRef<THREE.Mesh>(null!)
  // const moonRef = useRef<THREE.Mesh>(null!)
  // const planetTexture = useLoader(TextureLoader, texture)
  // const moonTex = moonTexture ? useLoader(TextureLoader, moonTexture) : null

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed * 0.05
    const x = Math.sin(t) * distance
    const z = Math.cos(t) * distance

    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z)
    }
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += 0.01
    }

    // if (hasMoon && moonRef.current) {
    //   const moonOrbit = t * 2
    //   moonRef.current.position.x = planetRef.current.position.x + Math.sin(moonOrbit) * 1
    //   moonRef.current.position.z = planetRef.current.position.z + Math.cos(moonOrbit) * 1
    // }
  })

  return (
    <>
      <group ref={groupRef}>
        {/* Planeta */}
        <mesh ref={planetMeshRef}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Wskaźnik */}
        <Indicator
          position={[0, 0, 0]}
          label={name}
          color={color}
          size={2*size}
          distance={distance}
        />

      </group>

      {/* Orbita */}
      <OrbitRing distance={distance} color={color} />

      {/* Księżyc */}
      {/* {hasMoon && (
        <mesh ref={moonRef}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial map={moonTex} />
        </mesh>
      )} */}
    </>
  )
}
// map={planetTexture}