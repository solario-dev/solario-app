import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

// Zoptymalizowane zmienne pomocnicze wielokrotnego użytku (brak alokacji pamięci w useFrame)
const _offset = new THREE.Vector3(0, 2, -5)
const _lookAhead = new THREE.Vector3(0, 2, 5)
const _rotatedOffset = new THREE.Vector3()
const _rotatedLookAhead = new THREE.Vector3()
const _desiredPosition = new THREE.Vector3()
const _targetPosition = new THREE.Vector3()

export function ThirdPersonCamera({ playerRef }: { playerRef: React.RefObject<THREE.Object3D | null> }) {
  useFrame(({ camera }) => {
    // ✅ Zasięg renderowania ustawiamy tylko raz, gdy się różni od docelowego
    if (camera instanceof THREE.PerspectiveCamera && camera.far !== 10000) {
      camera.far = 10000;
      camera.updateProjectionMatrix();
    }

    const pr = playerRef?.current
    if (!pr) return

    // ✅ Brak metod .clone() -- używamy zmiennych pomocniczych i modyfikacji w miejscu
    _rotatedOffset.copy(_offset).applyQuaternion(pr.quaternion)
    _rotatedLookAhead.copy(_lookAhead).applyQuaternion(pr.quaternion)

    // Pozycja kamery
    _desiredPosition.copy(pr.position).add(_rotatedOffset)
    camera.position.lerp(_desiredPosition, 0.12)

    // Patrzymy przed statek
    _targetPosition.copy(pr.position).add(_rotatedLookAhead)
    camera.lookAt(_targetPosition)
  })

  return null
}
