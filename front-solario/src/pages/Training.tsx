import { SolarSystem } from "../components/solar-system/SolarSystem.tsx";
import planetsData from "../data/planets.json";

export default function Training() {

  const menuItems: string[] = planetsData.celestialBodies
    .filter((p) => p.type === "planet" || p.type === "star")
    .map((p) => p.name);

  return (
    <main
      className="
        min-h-screen relative
        bg-[var(--color-bg-main)] text-[var(--color-primary)]
        font-geist
      "
    >
      
      {/* Główna sekcja z układem słonecznym */}
      <section className="h-screen">
        <div className="w-full h-full overflow-hidden">
          <SolarSystem />
        </div>
      </section>
    </main>
  );
}
