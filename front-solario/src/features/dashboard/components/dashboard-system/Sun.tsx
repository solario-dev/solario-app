import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

interface SunProps {
  scale: number
  color: string
  texture: string
  emissiveIntensity?: number
  lightIntensity?: number
}

export const Sun: React.FC<SunProps> = ({scale, color, texture, emissiveIntensity, lightIntensity}) => {
  return (
    <mesh key="Sun">
      <sphereGeometry args={[0.5 * scale * 0.01, 64, 64]} />
      <meshStandardMaterial
        emissive={color}
        emissiveIntensity={emissiveIntensity || 2.5}
        map={useLoader(TextureLoader, texture)}
      />
      <pointLight intensity={lightIntensity || 3.0} />
    </mesh>
  )
}

