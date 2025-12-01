import { useEffect, useRef } from "react";
import { useSimulationState } from "../../hooks/useSimulationState";

export const Minimap = () => {
  const { state } = useSimulationState();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // wielkość minimapy
  const SIZE = 200; 
  const SCALE = 0.05; // im mniejsza wartość, tym większy świat pomieści się na mapie

  useEffect(() => {
    if (!state || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // Tło minimapy
    ctx.fillStyle = "rgba(10, 10, 20, 0.8)";
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeRect(0, 0, SIZE, SIZE);

    // Funkcja mapowania współrzędnych
    const mapX = (x: number) => SIZE / 2 + x * SCALE;
    const mapZ = (z: number) => SIZE / 2 - z * SCALE; // używamy X-Z płaszczyzny

    // --- Ciała niebieskie ---
    ctx.fillStyle = "yellow";
    for (const b of state.bodies) {
      ctx.beginPath();
      ctx.arc(mapX(b.x), mapZ(b.z), 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Inni gracze ---
    ctx.fillStyle = "cyan";
    for (const p of state.others) {
      ctx.beginPath();
      ctx.arc(mapX(p.x), mapZ(p.z), 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Ty ---
    if (state.self) {
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.arc(mapX(state.self.x), mapZ(state.self.z), 5, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{
        position: "absolute",
        bottom: 100,
        right: 20,
        border: "2px solid rgba(255,255,255,0.3)",
        borderRadius: "8px",
        background: "rgba(0,0,0,0.4)",
        zIndex: 50
      }}
    />
  );
};
