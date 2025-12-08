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

    // Re-export lokalnego ref na zewnątrz
    useImperativeHandle(ref, () => shipRef.current)

    useFrame((_, delta) => {
      if (!player || !shipRef.current) return

      // Współczynnik interpolacji - wyższy = bardziej responsywny, niższy = bardziej płynny
      const lerpFactor = Math.min(delta * 10, 1)

      // Płynna interpolacja pozycji
      const targetPosition = new THREE.Vector3(player.x, player.y, player.z)
      shipRef.current.position.lerp(targetPosition, lerpFactor)

      // Płynna interpolacja rotacji z obsługą przejścia przez 0/360
      const currentRotation = shipRef.current.rotation.y
      const targetRotation = THREE.MathUtils.degToRad(player.rot)

      // Oblicz różnicę i normalizuj do zakresu [-PI, PI] (najkrótsza droga)
      let delta_angle = targetRotation - currentRotation
      delta_angle = ((delta_angle + Math.PI) % (Math.PI * 2)) - Math.PI

      shipRef.current.rotation.y = currentRotation + delta_angle * lerpFactor
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