import { ControlledSolarSystem } from "../components/solar-system/ControlledSolarSystem";

export default function Training() {

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
          <ControlledSolarSystem />
        </div>
      </section>
    </main>
  );
}
