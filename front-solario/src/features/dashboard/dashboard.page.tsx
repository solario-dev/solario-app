import JoinGame from "./components/JoinGame.tsx";
import { SolarSystem } from "./components/dashboard-system/SolarSystem.tsx"
import { useAuthStore } from "../../shared/store/authStore.ts";
import { Navigate } from "react-router-dom";

export default function Dashboard() {

  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main
      className="
        min-h-screen relative
        bg-[var(--color-bg-main)] text-[var(--color-primary)]
        font-geist
      "
    >
      <section className="h-screen">
        <div className="w-full h-full overflow-hidden">
          <SolarSystem />
        </div>
        <JoinGame />
      </section>
    </main>
  );
}
