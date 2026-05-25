import { useEffect, useRef, useState, useMemo } from "react";
import { useSimulationState } from "../hooks/useSimulationState";
import data from "../../../assets/planets.json";

export const Minimap = () => {
  const { state } = useSimulationState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(0.01); // domyślna skala

  // wielkość minimapy
  const SIZE = 300;

  // Generujemy stałe pozycje asteroid (tylko raz)
  const asteroidPositions = useMemo(() => {
    const marsObject = data.celestialBodies.find(p => p.name === "Mars");
    const jupiterObject = data.celestialBodies.find(p => p.name === "Jupiter");

    if (!marsObject || !jupiterObject) return [];

    const marsOrbitDiameter = marsObject.orbitDiameter ?? 2858;
    const jupiterOrbitDiameter = jupiterObject.orbitDiameter ?? 8365;
    const asteroidBeltInner = marsOrbitDiameter / 2 + 1000;
    const asteroidBeltOuter = jupiterOrbitDiameter / 2 - 1000;

    const positions: Array<{ angle: number, distance: number }> = [];
    const asteroidDots = 120;

    for (let i = 0; i < asteroidDots; i++) {
      const angle = (i / asteroidDots) * Math.PI * 2;
      const distance = asteroidBeltInner + Math.random() * (asteroidBeltOuter - asteroidBeltInner);
      positions.push({ angle, distance });
    }

    return positions;
  }, []);

  useEffect(() => {
    if (!state || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // Funkcja mapowania współrzędnych
    const mapX = (x: number) => SIZE / 2 + x * scale;
    const mapZ = (z: number) => SIZE / 2 + z * scale;

    // --- Słońce z glow effect ---
    const sunGradient = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, 12);
    sunGradient.addColorStop(0, "#FDB813");
    sunGradient.addColorStop(1, "rgba(253, 184, 19, 0)");
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, 12, 0, Math.PI * 2);
    ctx.fill();

    // Core słońca
    ctx.fillStyle = "#FFF5E1";
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // --- Orbity planet (cyjan) ---
    ctx.strokeStyle = "rgba(0, 255, 240, 0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (const b of state.bodies) {
      const orbitRadius = Math.sqrt(b.x * b.x + b.z * b.z) * scale;
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // --- Pas asteroid ---
    ctx.fillStyle = "rgba(0, 255, 240, 0.5)";
    for (const pos of asteroidPositions) {
      const x = SIZE / 2 + Math.cos(pos.angle) * pos.distance * scale;
      const z = SIZE / 2 + Math.sin(pos.angle) * pos.distance * scale;
      ctx.beginPath();
      ctx.arc(x, z, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Planety z glow ---
    for (const b of state.bodies) {
      const px = mapX(b.x);
      const pz = mapZ(b.z);

      // Glow
      const planetGlow = ctx.createRadialGradient(px, pz, 0, px, pz, 6);
      planetGlow.addColorStop(0, "rgba(0, 255, 240, 0.6)");
      planetGlow.addColorStop(1, "rgba(0, 255, 240, 0)");
      ctx.fillStyle = planetGlow;
      ctx.beginPath();
      ctx.arc(px, pz, 6, 0, Math.PI * 2);
      ctx.fill();

      // Core planety
      ctx.fillStyle = "#00FFF0";
      ctx.beginPath();
      ctx.arc(px, pz, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Inni gracze ---
    for (const p of state.others) {
      const px = mapX(p.x);
      const pz = mapZ(p.z);

      // Glow effect
      // const playerGlow = ctx.createRadialGradient(px, pz, 0, px, pz, 8);
      // playerGlow.addColorStop(0, "rgba(0, 255, 240, 0.8)");
      // playerGlow.addColorStop(1, "rgba(0, 255, 240, 0)");
      // ctx.fillStyle = playerGlow;
      // ctx.beginPath();
      // ctx.arc(px, pz, 8, 0, Math.PI * 2);
      // ctx.fill();

      // Gracz
      ctx.fillStyle = "#00FFF0";
      ctx.beginPath();
      ctx.arc(px, pz, 3, 0, Math.PI * 2);
      ctx.fill();

      // Kierunek
      const angle = (p.rot * Math.PI) / 180;
      const dirLength = 10;
      ctx.strokeStyle = "#00FFF0";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#00FFF0";
      ctx.beginPath();
      ctx.moveTo(px, pz);
      ctx.lineTo(px + Math.sin(angle) * dirLength, pz + Math.cos(angle) * dirLength);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // --- Ty (pomarańczowy) ---
    if (state.self) {
      const px = mapX(state.self.x);
      const pz = mapZ(state.self.z);

      // Outer glow
      // const playerGlow = ctx.createRadialGradient(px, pz, 0, px, pz, 12);
      // playerGlow.addColorStop(0, "rgba(255, 140, 0, 0.8)");
      // playerGlow.addColorStop(1, "rgba(255, 140, 0, 0)");
      // ctx.fillStyle = playerGlow;
      // ctx.beginPath();
      // ctx.arc(px, pz, 12, 0, Math.PI * 2);
      // ctx.fill();

      // Gracz
      ctx.fillStyle = "#FF8C00";
      ctx.beginPath();
      ctx.arc(px, pz, 4, 0, Math.PI * 2);
      ctx.fill();

      // Kierunek
      const angle = (state.self.rot * Math.PI) / 180;
      const dirLength = 14;
      ctx.strokeStyle = "#FF8C00";
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#FF8C00";
      ctx.beginPath();
      ctx.moveTo(px, pz);
      ctx.lineTo(px + Math.sin(angle) * dirLength, pz + Math.cos(angle) * dirLength);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

  }, [state, scale, asteroidPositions]);

  return (
    <div className="minimap-container">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="minimap-canvas"
      />
      <div className="minimap-controls">
        <span className="minimap-label">Zoom</span>
        <input
          type="range"
          min="0.006"
          max="0.09"
          step="0.001"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="minimap-slider"
        />
        <span className="minimap-value">
          {(scale * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
