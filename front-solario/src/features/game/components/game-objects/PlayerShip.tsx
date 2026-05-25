import * as THREE from "three"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { forwardRef, useImperativeHandle } from "react"
import type { PlayerState } from "../../types/simulationTypes"

type PlayerShipProps = {
  player: PlayerState | null
  color?: string
}

export const PlayerShip = forwardRef<THREE.Object3D, PlayerShipProps>(
  ({ player, color = "#00FFF0" }, ref) => {
    const shipRef = useRef<THREE.Group>(null!)

    useImperativeHandle(ref, () => shipRef.current)

    useFrame((_, delta) => {
      if (!player || !shipRef.current) return

      const lerpFactor = Math.min(delta * 10, 1)

      const targetPosition = new THREE.Vector3(player.x, player.y, player.z)
      shipRef.current.position.lerp(targetPosition, lerpFactor)

      const currentRotation = shipRef.current.rotation.y
      const targetRotation = THREE.MathUtils.degToRad(player.rot)

      // FIX: Poprawiona normalizacja kąta obrotu
      // Math.atan2(sin, cos) zawsze zwraca najkrótszą drogę w radianach (-PI do PI)
      // Zapobiega to "piruetom" przy przejściu z 360 na 0 stopni
      let delta_angle = targetRotation - currentRotation
      delta_angle = Math.atan2(Math.sin(delta_angle), Math.cos(delta_angle));

      shipRef.current.rotation.y = currentRotation + delta_angle * lerpFactor
    })

    const skin = player?.skin || 'default';

    if (skin === 'falcon') {
      return (
        <group ref={shipRef}>
          {/* Główny spodek */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.4, 32]} />
            <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
          </mesh>

          {/* Kokpit (z boku) */}
          <mesh position={[1.2, 0.2, 0.5]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.4, 1, 16]} />
            <meshStandardMaterial color="#666" />
          </mesh>
          <mesh position={[1.7, 0.2, 0.5]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color="#222" roughness={0.2} />
          </mesh>

          {/* Rura łącząca kokpit */}
          <mesh position={[0.8, 0, 0.5]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 1.0, 8]} />
            <meshStandardMaterial color="#555" />
          </mesh>

          {/* Przednie "szczęki" */}
          <mesh position={[-0.4, 0, 1.5]}>
            <boxGeometry args={[0.5, 0.3, 1.8]} />
            <meshStandardMaterial color="#888" />
          </mesh>
          <mesh position={[0.4, 0, 1.5]}>
            <boxGeometry args={[0.5, 0.3, 1.8]} />
            <meshStandardMaterial color="#888" />
          </mesh>

          {/* Silnik (tył) - Poziome półkole wystające poza kadłub */}
          <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[1.6, 1.6, 0.3, 32, 1, true, 0, Math.PI]} />
            <meshBasicMaterial color="cyan" side={THREE.DoubleSide} />
          </mesh>

          {/* Górne detale */}
          <mesh position={[0, 0.2, -0.2]}>
            <cylinderGeometry args={[0.4, 0.5, 0.2, 16]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        </group>
      )
    }

    // === DOMYŚLNY STATEK ===
    return (
      <group ref={shipRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.6, 2, 8]} />
          <meshStandardMaterial color="white" roughness={0.3} metalness={0.8} />
        </mesh>

        <mesh position={[0, 0, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.4, 1, 8]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} emissive={color} emissiveIntensity={0.5} />
        </mesh>

        <mesh position={[0, 0.35, 0.2]}>
          <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="black" roughness={0.1} metalness={1} />
        </mesh>

        <mesh position={[0, 0, -1.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.3, 0.5, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        <mesh position={[0, 0, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.25, 0.8, 8]} />
          <meshBasicMaterial color="#00FFFF" transparent opacity={0.6} />
        </mesh>

        <mesh position={[0, -0.1, -0.5]}>
          <boxGeometry args={[2.5, 0.1, 1]} />
          <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.2} />
        </mesh>

        <mesh position={[0, 0.6, -0.8]}>
          <boxGeometry args={[0.1, 0.8, 0.8]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    )
  }
)