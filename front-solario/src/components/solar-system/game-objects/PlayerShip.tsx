import * as THREE from "three"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"

import type { PlayerShipProps } from "../../../types/PlayerShipProps.ts"

export function PlayerShip({ selfPlayer }: PlayerShipProps) {
  const ref = useRef()
  const target = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!selfPlayer || !ref.current) return

    target.current.set(selfPlayer.x, selfPlayer.y, selfPlayer.z)

    ref.current.position.lerp(target.current, 0.2)
    ref.current.rotation.y = selfPlayer.rot
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 3]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}
