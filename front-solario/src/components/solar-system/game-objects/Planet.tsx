import { useRef } from 'react'
import * as THREE from 'three'
import { OrbitRing } from '../dashboard-system/OrbitRing.tsx'
// import { TextureLoader } from 'three'
// import { useLoader } from '@react-three/fiber'
// import { Indicator } from './Indicator.tsx'
import React from 'react'
import celestialBodiesData from '../../../data/planets.json'

interface PlanetProps {
  key: string
  positon: [number, number, number]
  name: string
}

type PlanetAppearanceData = {
    name: string,
    type: string,
    radiusKm: number,
    color: string,
    texture: string,
    scale: number,
    hasMoon?: boolean,
    moonTexture?: string,
    hasRings?: boolean,
    ringTexture?: string
}

const Planet: React.FC<PlanetProps> = ({position, name}) => {
    const groupRef = useRef<THREE.Group>(null!)
    // const moonRef = useRef<THREE.Mesh>(null!)
    // const planetTexture = useLoader(TextureLoader, texture)
    // const moonTex = moonTexture ? useLoader(TextureLoader, moonTexture) : null


    const planetData: PlanetAppearanceData[] = celestialBodiesData.celestialBodies.filter(
        (b: PlanetAppearanceData) => b.type === 'planet'
    )
    const planetInfo = planetData.find(p => p.name === name)
    if (!planetInfo) return null

    const { radiusKm, color, scale } = planetInfo
    const size = (radiusKm / 6371) * scale * 0.5 // skala względem Ziemi
    const distance = new THREE.Vector3(...position).length()

    return (
        <>
        <group ref={groupRef}>
            {/* Planeta */}
            <mesh key={name} position={position}>
                <sphereGeometry args={[size ?? 1, 32, 32]} />
                <meshStandardMaterial color={color ?? "gray"} />
            </mesh>

            {/* Wskaźnik */}
            {/* <Indicator
            position={[0, 0, 0]}
            label={name}
            color={color}
            size={2*size}
            distance={distance}
            /> */}

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

export default Planet;