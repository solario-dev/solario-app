import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

export function ThirdPersonCamera({ playerRef }: { playerRef: React.RefObject<THREE.Object3D | null> }) {
  useFrame(({ camera }) => {
    const pr = playerRef?.current
    if (!pr) return

    const desired = pr.position.clone().add(new THREE.Vector3(0, 3, 10))
    camera.position.lerp(desired, 0.12)
    camera.lookAt(pr.position)
  })

  return null
}
