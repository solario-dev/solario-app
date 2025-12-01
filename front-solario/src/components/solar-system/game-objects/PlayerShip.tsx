import * as THREE from "three"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { forwardRef, useImperativeHandle } from "react"
import type { PlayerState } from "../../../types/simulationTypes"
import { useEffect } from "react"

type PlayerShipProps = {
  player: PlayerState | null
  // opcjonalnie kolory/mesh props
  color?: string
}

// ForwardRef umożliwia ThirdPersonCamera śledzenie statku
export const PlayerShip = forwardRef<THREE.Object3D, PlayerShipProps>(
  ({ player }, ref) => {
    const shipRef = useRef<THREE.Mesh>(null!)
    const targetPos = useRef(new THREE.Vector3())

    // Re-export lokalnego ref na zewnątrz
    useImperativeHandle(ref, () => shipRef.current)

    useFrame(() => {
      if (!player || !shipRef.current) return

      // cel pozycji
      targetPos.current.set(player.x, player.y, player.z)
      shipRef.current.position.lerp(targetPos.current, 0.2)

      // rotacja wokół Y
      const q = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, THREE.MathUtils.degToRad(player.rot), 0)
      )

      shipRef.current.quaternion.slerp(q, 0.5)
    })

    useEffect(() => {
      if (!shipRef.current) return

      const dir = new THREE.Vector3(0, 0, 1)
      const origin = new THREE.Vector3(0, 0, 1.5)
      const length = 1
      const hex = 0xff0000
      const arrow = new THREE.ArrowHelper(dir, origin, length, hex)
      shipRef.current.add(arrow)

    }, [])

    return (
      <mesh ref={shipRef}>
        <boxGeometry args={[1, 1, 3]} />
        <meshStandardMaterial color={player.color} />
      </mesh>
    )
  }
)