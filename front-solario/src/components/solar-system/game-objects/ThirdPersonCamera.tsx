import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

export function ThirdPersonCamera({ playerRef }: { playerRef: React.RefObject<THREE.Object3D | null> }) {
  const offset = new THREE.Vector3(0, 2, -5);       // pozycja kamery względem statku
  const lookAhead = new THREE.Vector3(0, 2, 5);      // punkt patrzenia przed statkiem

  useFrame(({ camera }) => {
    const pr = playerRef?.current
    if (!pr) return

    // obracamy offset zgodnie z rotacją statku
    const rotatedOffset = offset.clone().applyQuaternion(pr.quaternion)
    const rotatedLookAhead = lookAhead.clone().applyQuaternion(pr.quaternion)

    // pozycja kamery
    const desiredPosition = pr.position.clone().add(rotatedOffset)
    camera.position.lerp(desiredPosition, 0.12)

    // patrzymy trochę przed statkiem
    const targetPosition = pr.position.clone().add(rotatedLookAhead)
    camera.lookAt(targetPosition)
  })

  return null
}
