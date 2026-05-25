import JoinGame from "./components/JoinGame.tsx";
import { SolarSystem } from "./components/dashboard-system/SolarSystem.tsx"
import planetsData from "../../assets/planets.json";

export default function Dashboard() {

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
      {/* Lewy panel — menu planet */}
      <aside
        className="
          w-64 absolute top-0 left-0 z-10 h-full
          flex flex-col p-6
          bg-[var(--color-bg-panel)]/30
          border-r border-[var(--color-primary)]/20
          backdrop-blur-md
        "
      >
        <ul className="space-y-2">
          {menuItems.map((planet, idx) => (
            <li key={idx}>
              <button
                className="
                  w-full text-left px-3 py-2 rounded-md
                  text-[var(--color-primary)]
                  uppercase
                  hover:bg-[var(--color-primary)]/10
                  transition-all duration-200
                "
              >
                {planet}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Główna sekcja z układem słonecznym */}
      <section className="h-screen">
        <div className="w-full h-full overflow-hidden">
          <SolarSystem />
        </div>
        <JoinGame />
      </section>
    </main>
  );
}
