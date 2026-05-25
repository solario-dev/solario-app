import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useUser } from "../../app/providers/UserContext";
import { Navigate } from "react-router-dom";
import { getShopItems } from "../shop/api/shop";
import { equipSkin } from "./api/profile";
import type { ShopItem } from "../../shared/types/ShopItem";

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
  const { user, login, token, isAuthenticated } = useUser();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await getShopItems();
        setShopItems(items);
      } catch (err) {
        console.error(err);
      }
    }
    fetchItems();
  }, []);

  const handleEquip = async (itemId: string) => {
    if (!user || !token) return;
    try {
      await equipSkin(user.id, itemId);
      login({ ...user, equippedSkin: itemId }, token);
    } catch (err) {
      console.error("Failed to equip", err);
    }
  };

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-black text-[var(--color-primary)] flex p-8 font-sans mt-16">
      <section className="flex-1 pr-10 border-r border-[var(--color-primary)]/30">
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
              Current Ship: <span className="text-white font-bold">{user.equippedSkin === 'default' ? 'Standard Cruiser' : user.equippedSkin}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-6 mb-8 flex-wrap">
          {[
            { label: "CREDITS", value: user.credits },
            { label: "WINS", value: user.wins },
            { label: "LEVEL", value: user.level },
          ].map((item) => {
            const valueStr = item.value.toLocaleString();
            const isLong = valueStr.length > 6;

            return (
              <div
                key={item.label}
                className="text-center border border-[var(--color-primary)]/40 rounded-lg p-3 min-w-[7rem] px-4 bg-[var(--color-primary)]/5 flex flex-col justify-center"
              >
                <div className={`${isLong ? "text-lg" : "text-2xl"} font-bold text-[var(--color-accent)] font-orbit whitespace-nowrap`}>
                  {valueStr}
                </div>
                <div className="text-xs tracking-wider font-geist text-[var(--color-primary)]/60">{item.label}</div>
              </div>
            );
          })}
        </div>

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

        <div>
          <h2 className="text-xl font-semibold mb-3 tracking-wide border-b border-[var(--color-primary)]/20 pb-2">
            QUIZZES RESULTS
          </h2>
          <div className="h-40 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleData}>
                <XAxis dataKey="day" stroke="var(--color-primary)" tick={{ fontSize: 12, fontFamily: 'Geist Mono' }} />
                <YAxis stroke="var(--color-primary)" tick={{ fontSize: 12, fontFamily: 'Geist Mono' }} />
                <Bar dataKey="score" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="w-1/3 pl-10">
        <h2 className="text-xl font-semibold mb-6 tracking-wide border-b border-[var(--color-primary)]/20 pb-2">INVENTORY</h2>

        {user.equippedSkin !== 'default' && (
          <button
            onClick={() => handleEquip('default')}
            className="w-full mb-4 py-2 border border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black transition-all uppercase text-xs font-bold"
          >
            Unequip Current Skin
          </button>
        )}

        <div className="grid grid-cols-2 gap-4">
          {user.inventory.length > 0 ? user.inventory.map((itemId, i) => {
            const item = shopItems.find(si => si.id === itemId);
            const isEquipped = user.equippedSkin === itemId;
            const isSkin = item?.type === 'skin';

            return (
              <div
                key={i}
                className={`bg-[var(--color-primary)]/5 border ${isEquipped ? 'border-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]' : 'border-[var(--color-primary)]/30'} rounded-lg p-3 flex flex-col items-center justify-center relative group hover:bg-[var(--color-primary)]/10 transition-colors`}
              >
                {item ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-black/50 mb-2 overflow-hidden border border-[var(--color-primary)]/20">
                      <img src={item.imageUrl || '/vite.svg'} alt={item.name} className="w-full h-full object-cover opacity-80" onError={(e) => e.currentTarget.src = '/vite.svg'} />
                    </div>
                    <span className="text-xs text-center font-orbit">{item.name}</span>
                    <span className="text-[10px] text-[var(--color-primary)]/50 mt-1 uppercase">{item.type}</span>

                    {isSkin && !isEquipped && (
                      <button
                        onClick={() => handleEquip(item.id)}
                        className="mt-2 text-[10px] bg-[var(--color-primary)] text-black px-2 py-1 rounded font-bold hover:scale-105 transition-transform"
                      >
                        EQUIP
                      </button>
                    )}
                    {isEquipped && <span className="mt-1 text-[10px] text-[var(--color-accent)] font-bold">EQUIPPED</span>}
                  </>
                ) : (
                  <span className="text-xs">Unknown Item ({itemId})</span>
                )}
              </div>
            )
          }) : (
            <p className="col-span-2 text-sm text-[var(--color-primary)]/50 font-geist text-center py-4">
              Inventory empty. Visit the Shop.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}