import * as THREE from "three"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { RemotePlayer } from "../../../types/RemotePlayer"
import { forwardRef, useImperativeHandle } from "react"

type PlayerShipProps = {
  player: RemotePlayer | null
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

      // Cel ruchu = pozycja gracza z backendu
      targetPos.current.set(player.x, player.y, player.z)

      // Płynne przejście (interpolacja)
      shipRef.current.position.lerp(targetPos.current, 0.2)

      // Rotacja statku
      shipRef.current.rotation.y = player.rot
    })

    return (
      <mesh ref={shipRef}>
        <boxGeometry args={[1, 1, 3]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    )
  }
)

// export function PlayerShip({ selfPlayer }: PlayerShipProps) {
//   const ref = useRef()
//   const target = useRef(new THREE.Vector3())

//   useFrame(() => {
//     if (!selfPlayer || !ref.current) return

//     target.current.set(selfPlayer.x, selfPlayer.y, selfPlayer.z)

//     ref.current.position.lerp(target.current, 0.2)
//     ref.current.rotation.y = selfPlayer.rot
//   })

//   return (
//     <mesh ref={ref}>
//       <boxGeometry args={[1, 1, 3]} />
//       <meshStandardMaterial color="orange" />
//     </mesh>
//   )
// }

// export const PlayerShip = React.forwardRef<THREE.Group | null, PlayerShipProps>(
//   ({ player, color = "orange" }, ref) => {
//     const groupRef = useRef<THREE.Group | null>(null)
//     const target = useRef(new THREE.Vector3())
//     const targetQuat = useRef(new THREE.Quaternion())

//     // expose the group ref to parent via forwardRef
//     useImperativeHandle(ref, () => groupRef.current, [])

//     useFrame(() => {
//       if (!groupRef.current || !player) return

//       // ustaw cel interpolacji
//       target.current.set(player.x, player.y, player.z)

//       // rotacja wokół Y (obrót)
//       const q = new THREE.Quaternion().setFromEuler(
//         new THREE.Euler(0, player.rot ?? 0, 0, "YXZ")
//       )
//       targetQuat.current.copy(q)

//       // interpoluj pozycję i rotację dla płynności
//       groupRef.current.position.lerp(target.current, 0.15)
//       groupRef.current.quaternion.slerp(targetQuat.current, 0.15)
//     })

//     return (
//       <group ref={groupRef}>
//         <mesh>
//           <boxGeometry args={[1, 1, 3]} />
//           <meshStandardMaterial color={color} />
//         </mesh>
//       </group>
//     )
//   }
// )

// PlayerShip.displayName = "PlayerShip"