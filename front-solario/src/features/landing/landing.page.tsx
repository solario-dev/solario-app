import { Link } from "react-router-dom";
import { useAuthStore } from "../../shared/store/authStore";

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[var(--color-bg-main)] text-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-geist">
      {/* Background Star Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,240,0.05),transparent_60%)] pointer-events-none" />

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">

        {/* Left Column: Heading, Text, Call to Action */}
        <div className="flex flex-col space-y-8 text-left">
          <h1 className="text-4xl md:text-5xl font-orbit font-bold tracking-wider text-[var(--color-primary)] leading-tight">
            EXPLORE THE <span className="text-[var(--color-warning)]">SOLAR SYSTEM</span>
          </h1>

          <p className="text-lg text-[var(--color-primary)]/80 leading-relaxed font-geist max-w-lg">
            Embark on a journey across the stars. Pilot your ship, scan unknown planets, answer deep-space anomalies, and compete with other explorers in real-time space simulation.
          </p>

          <div className="pt-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-block px-8 py-4 text-lg font-orbit tracking-widest btn-primary text-glow transition-all duration-300"
            >
              {isAuthenticated ? "ENTER COCKPIT" : "LAUNCH MISSION"}
            </Link>
          </div>
        </div>

        {/* Right Column: Beautiful Graphic */}
        <div className="flex justify-center items-center relative">
          {/* Glowing frame around the image */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-warning)] rounded-lg blur opacity-30 animate-pulse" />

          <div className="relative rounded-lg overflow-hidden border border-[var(--color-primary)]/30 shadow-[0_0_30px_rgba(0,255,240,0.2)] bg-black/50 aspect-video w-full max-w-lg">
            <img
              src="/landing_hero.png"
              alt="Futuristic spaceship approaching a glowing gas giant in Solario"
              className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700"
            />
          </div>
        </div>

      </div>
    </div>
  );
}