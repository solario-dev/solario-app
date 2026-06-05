import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";

type SunProps = {
  position?: [number, number, number];
  radius?: number;
  color?: string;
  intensity?: number;
  rotationSpeed?: number; // rad/s
};

const Sun: React.FC<SunProps> = ({
  position = [0, 0, 0],
  radius = 5,
  color = "white",
  intensity = 5000,
  rotationSpeed = 0.001,
}) => {
  const sunRef = useRef<THREE.Mesh>(null);
  const sunTexture = useLoader(THREE.TextureLoader, "/textures/sun.jpg");

  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <>
      {/* Samo słońce jako mesh */}
      <mesh ref={sunRef} position={position}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          map={sunTexture}
          emissiveMap={sunTexture}
          emissive={color}
          emissiveIntensity={1.5}
          color={"white"}
        />
      </mesh>

      {/* Punktowe światło, żeby świeciło na planety */}
      <pointLight
        position={position}
        intensity={intensity}
        color={color}
        distance={0} // 0 = nieskończona odległość
        decay={2} // fizyczne tłumienie światła
      />
    </>
  );
};

export default Sun;
