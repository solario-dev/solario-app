import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useUser } from "../context/UserContext";
import { Navigate } from "react-router-dom";

const sampleData = [
  { day: "Mon", score: 8 },
  { day: "Tue", score: 10 },
  { day: "Wed", score: 7 },
  { day: "Thu", score: 9 },
  { day: "Fri", score: 6 },
  { day: "Sat", score: 10 },
  { day: "Sun", score: 8 },
];

const allPlanets = [
    { name: "Mercury", colorBase: "bg-blue-400" },
    { name: "Venus", colorBase: "bg-blue-300" },
    { name: "Earth", colorBase: "bg-blue-500" },
    { name: "Mars", colorBase: "bg-red-500" },
    { name: "Jupiter", colorBase: "bg-orange-400" },
    { name: "Saturn", colorBase: "bg-yellow-400" },
    { name: "Uranus", colorBase: "bg-cyan-300" },
    { name: "Neptune", colorBase: "bg-blue-600" },
];

export default function Profile() {
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-black text-[var(--color-primary)] flex p-8 font-sans mt-16">
      {/* ===== LEWA KOLUMNA ===== */}
      <section className="flex-1 pr-10 border-r border-[var(--color-primary)]/30">
        {/* Avatar i dane gracza */}
        <div className="flex items-center gap-8 mb-10">
          <div className="w-32 h-32 rounded-full border border-[var(--color-primary)] flex items-center justify-center text-4xl bg-[var(--color-primary)]/10 shadow-[0_0_20px_rgba(0,255,240,0.3)]">
            🚀
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-wide uppercase">{user.username}</h1>
            <div className="mt-2 text-[var(--color-primary)]/70 flex gap-4 text-sm font-geist">
                <span>ID: {user.id.substring(0, 8)}...</span>
                <span className="text-[var(--color-accent)] border border-[var(--color-accent)] px-2 rounded text-xs py-0.5">{user.role.toUpperCase()}</span>
            </div>
            <p className="mt-4 text-[var(--color-primary)]/70 max-w-md text-sm">
              YOUR MISSION IS TO CAPTURE AS MANY PLANETS AS POSSIBLE BEFORE THE
              OPPOSING TEAM DOES.
            </p>
          </div>
        </div>

        {/* Statystyki */}
        <div className="flex space-x-8 mb-8">
          {[
            { label: "QUIZZES", value: user.quizzesCompleted },
            { label: "WINS", value: user.wins },
            { label: "LEVEL", value: user.level },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center border border-[var(--color-primary)]/40 rounded-lg p-3 w-28 bg-[var(--color-primary)]/5"
            >
              <div className="text-2xl font-bold text-[var(--color-accent)] font-orbit">
                {item.value}
              </div>
              <div className="text-xs tracking-wider font-geist text-[var(--color-primary)]/60">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Conquered Planets */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 tracking-wide border-b border-[var(--color-primary)]/20 pb-2">
            CONQUERED PLANETS
          </h2>
          <div className="flex gap-4 items-center flex-wrap mt-4">
            {allPlanets.map((planet) => {
                const isConquered = user.conqueredPlanets.includes(planet.name);
                return (
                    <div key={planet.name} className="flex flex-col items-center opacity-90 hover:opacity-100 transition-opacity">
                        <div
                        className={`w-6 h-6 rounded-full ${isConquered ? planet.colorBase : 'bg-transparent border border-[var(--color-primary)]/30'} ${isConquered ? 'shadow-[0_0_10px_currentColor]' : ''}`}
                        title={planet.name}
                        />
                        <span className={`text-[10px] mt-2 font-geist uppercase ${isConquered ? 'text-white' : 'text-[var(--color-primary)]/40'}`}>
                            {planet.name}
                        </span>
                    </div>
                )
            })}
          </div>
        </div>

        {/* Quizzes Results */}
        <div>
          <h2 className="text-xl font-semibold mb-3 tracking-wide border-b border-[var(--color-primary)]/20 pb-2">
            QUIZZES RESULTS
          </h2>
          <div className="h-40 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleData}>
                <XAxis dataKey="day" stroke="var(--color-primary)" tick={{fontSize: 12, fontFamily: 'Geist Mono'}} />
                <YAxis stroke="var(--color-primary)" tick={{fontSize: 12, fontFamily: 'Geist Mono'}} />
                <Bar dataKey="score" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ===== PRAWA KOLUMNA ===== */}
      <section className="w-1/3 pl-10">
        <h2 className="text-xl font-semibold mb-6 tracking-wide border-b border-[var(--color-primary)]/20 pb-2">INVENTORY</h2>
        <div className="grid grid-cols-3 gap-4">
            {user.inventory.length > 0 ? user.inventory.map((item, i) => (
                 <div
                 key={i}
                 className="aspect-square bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/50 rounded-lg flex items-center justify-center relative group"
               >
                   <span className="text-xs">{item}</span>
               </div>
            )) : (
                <p className="col-span-3 text-sm text-[var(--color-primary)]/50 font-geist">Inventory empty. Visit the shop.</p>
            )}
        </div>
      </section>
    </main>
  );
}