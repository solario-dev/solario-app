import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRef, useState } from 'react';

interface PerfMonitorProps {
  label?: string;
}

/**
 * PerfMonitor — komponent diagnostyczny do pomiarów do pracy licencjackiej.
 * Wyświetla na ekranie: FPS, draw calls, liczbę trójkątów i geometrii w czasie rzeczywistym.
 * Dane loguje do konsoli co 60 klatek, gotowe do skopiowania do tabeli wynikowej.
 */
export function PerfMonitor({ label = 'PERF' }: PerfMonitorProps) {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const [stats, setStats] = useState({
    fps: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
  });

  useFrame(() => {
    frameCount.current += 1;
    const now = performance.now();
    const elapsed = now - lastTime.current;

    // Odśwież co ~60 klatek (~1 sekunda)
    if (frameCount.current % 60 === 0) {
      const fps = Math.round((60 / elapsed) * 1000);
      const { calls, triangles } = gl.info.render;
      const { geometries, textures } = gl.info.memory;

      const snapshot = { fps, drawCalls: calls, triangles, geometries, textures };
      setStats(snapshot);

      // Loguj do konsoli dla tabeli wynikowej
      console.log(`[${label}]`, JSON.stringify(snapshot));

      lastTime.current = now;
    }
  });

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div className="fixed top-36 left-5 z-[9998] bg-black/85 border border-yellow-500/40 rounded px-3 py-2 font-mono text-xs shadow-[0_0_12px_rgba(255,200,0,0.15)]">
        <div className="text-yellow-400/80 font-bold mb-1">[{label}] PERF MONITOR</div>
        <table className="text-white/80 border-separate border-spacing-x-3">
          <tbody>
            <tr>
              <td className="text-white/40">FPS:</td>
              <td className={`font-bold ${stats.fps >= 55 ? 'text-green-400' : stats.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                {stats.fps}
              </td>
            </tr>
            <tr>
              <td className="text-white/40">Draw calls:</td>
              <td className="text-orange-300 font-bold">{stats.drawCalls}</td>
            </tr>
            <tr>
              <td className="text-white/40">Triangles:</td>
              <td className="text-orange-200">{stats.triangles.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="text-white/40">Geometries:</td>
              <td className="text-white/60">{stats.geometries}</td>
            </tr>
            <tr>
              <td className="text-white/40">Textures:</td>
              <td className="text-white/60">{stats.textures}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Html>
  );
}
