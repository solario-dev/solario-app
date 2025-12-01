import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

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
  color = "yellow",
  intensity = 2,
  rotationSpeed = 0.001,
}) => {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += rotationSpeed; // obrót dla efektu
    }
  });

  return (
    <>
      {/* Samo słońce jako mesh */}
      <mesh ref={sunRef} position={position}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          emissive={new THREE.Color(color)}
          emissiveIntensity={1.5}
          color={"black"}
        />
      </mesh>

      {/* Punktowe światło, żeby świeciło na planety */}
      <pointLight
        position={position}
        intensity={intensity}
        color={color}
        distance={1000}
      />
    </>
  );
};

export default Sun;
