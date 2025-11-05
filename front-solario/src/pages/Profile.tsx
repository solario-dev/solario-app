import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const sampleData = [
  { day: "Mon", score: 8 },
  { day: "Tue", score: 10 },
  { day: "Wed", score: 7 },
  { day: "Thu", score: 9 },
  { day: "Fri", score: 6 },
  { day: "Sat", score: 10 },
  { day: "Sun", score: 8 },
];

const conqueredPlanets = [
  { name: "Mercury", color: "bg-blue-400" },
  { name: "Venus", color: "bg-blue-300" },
  { name: "Earth", color: "bg-transparent border border-blue-400" },
  { name: "Mars", color: "bg-transparent border border-blue-400" },
  { name: "Jupiter", color: "bg-blue-600" },
  { name: "Saturn", color: "bg-blue-500" },
  { name: "Uranus", color: "bg-transparent border border-blue-400" },
  { name: "Neptune", color: "bg-transparent border border-blue-400" },
];

export default function Profile() {
  return (
    <main className="min-h-screen bg-black text-[var(--color-primary)] flex p-8 font-sans">
      {/* ===== LEWA KOLUMNA ===== */}
      <section className="flex-1 pr-10 border-r border-[var(--color-primary)]/30">
        {/* Avatar i dane gracza */}
        <div className="flex items-center gap-8 mb-10">
          <div className="w-32 h-32 rounded-full border border-[var(--color-primary)] flex items-center justify-center">
            🚀
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-wide">JOHN SMITH</h1>
            <p className="mt-2 text-[var(--color-primary)]/70 max-w-md">
              YOUR MISSION IS TO CAPTURE AS MANY PLANETS AS POSSIBLE BEFORE THE
              OPPOSING TEAM DOES.
            </p>
          </div>
        </div>

        {/* Statystyki */}
        <div className="flex space-x-8 mb-8">
          {[
            { label: "QUIZZES", value: 14 },
            { label: "WINS", value: 6 },
            { label: "LEVEL", value: 3 },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center border border-[var(--color-primary)]/40 rounded-lg p-3 w-24"
            >
              <div className="text-2xl font-bold text-[var(--color-accent)]">
                {item.value}
              </div>
              <div className="text-xs tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Conquered Planets */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 tracking-wide">
            CONQUERED PLANETS
          </h2>
          <div className="flex gap-4 items-center flex-wrap">
            {conqueredPlanets.map((planet) => (
              <div key={planet.name} className="flex flex-col items-center">
                <div
                  className={`w-5 h-5 rounded-full ${planet.color}`}
                  title={planet.name}
                />
                <span className="text-xs mt-1 opacity-70">{planet.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team members */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 tracking-wide">
            TEAM MEMBERS
          </h2>
          <ul className="space-y-2">
            {["Joasia Guzik", "Luke Orion", "Mara Jade", "Cass Solaris"].map(
              (member, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-sm tracking-wider"
                >
                  <div className="w-6 h-6 border border-[var(--color-primary)] rounded-md flex items-center justify-center">
                    ⬡
                  </div>
                  {member.toUpperCase()}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Quizzes Results */}
        <div>
          <h2 className="text-xl font-semibold mb-3 tracking-wide">
            QUIZZES RESULTS
          </h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleData}>
                <XAxis dataKey="day" stroke="var(--color-primary)" />
                <YAxis stroke="var(--color-primary)" />
                <Bar dataKey="score" fill="var(--color-accent)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ===== PRAWA KOLUMNA ===== */}
      <section className="w-1/3 pl-10">
        <h2 className="text-xl font-semibold mb-6 tracking-wide">BADGES</h2>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-900 border border-[var(--color-primary)]/30 rounded-lg flex items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-accent)]/40 to-purple-700/40" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
