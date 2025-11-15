import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

export function ThirdPersonCamera({ playerRef }: { playerRef: React.RefObject<THREE.Object3D> }) {
  useFrame(({ camera }) => {
    if (!playerRef.current) return

    const ship = playerRef.current.position
    camera.position.lerp(
      ship.clone().add(new THREE.Vector3(0, 3, 10)), 
      0.1
    )
    camera.lookAt(ship)
  })

  return null
}
