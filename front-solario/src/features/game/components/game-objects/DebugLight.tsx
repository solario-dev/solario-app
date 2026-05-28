import { useRef } from 'react'
import { useHelper } from '@react-three/drei'
import * as THREE from 'three'
import { PointLightHelper } from 'three'

const DebugLight: React.FC = () => {
  const lightRef = useRef<THREE.PointLight>(null)
  useHelper(lightRef, PointLightHelper, 1, 'hotpink')

  return <pointLight ref={lightRef} position={[0, 0, 0]} intensity={5000} />
}
export default DebugLight