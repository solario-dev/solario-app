import React, { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export default function DebugLight() {
  const [enabled, setEnabled] = useState(false);
  const { camera } = useThree();
  const [lightPos, setLightPos] = useState<[number, number, number]>([0, 10, 0]);

  // Update light position to follow camera if enabled
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (camera) {
        setLightPos([camera.position.x, camera.position.y, camera.position.z]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [enabled, camera]);

  // Bind 'L' key to toggle debug light
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "l") {
        setEnabled((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {enabled && (
        <>
          {/* Strong ambient light to illuminate all dark sides of planets */}
          <ambientLight intensity={3.0} />

          {/* Headlight from the camera position */}
          <directionalLight
            position={lightPos}
            intensity={4.0}
            color="#ffffff"
          />
        </>
      )}

      {/* HTML overlay UI button to toggle the light */}
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div
          className="fixed top-24 left-5 z-[9999] pointer-events-auto flex items-center gap-3 bg-black/80 border border-[var(--color-primary)]/30 rounded px-3 py-2 font-geist text-xs shadow-[0_0_15px_rgba(0,255,240,0.1)]"
        >
          <span className="text-[var(--color-primary)]/60">DEBUG LIGHT:</span>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`px-2 py-0.5 rounded font-bold uppercase transition-all duration-300 ${enabled
                ? "bg-[var(--color-primary)] text-black shadow-[0_0_8px_var(--color-primary)]"
                : "bg-white/10 text-white/50 hover:bg-white/20"
              }`}
          >
            {enabled ? "ON" : "OFF"}
          </button>
          <span className="text-[var(--color-primary)]/40 text-[10px] ml-1">([L] Key)</span>
        </div>
      </Html>
    </>
  );
}
