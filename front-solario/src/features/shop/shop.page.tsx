import { useState } from "react";
import { useAuthStore } from "../../shared/store/authStore";
import { getShopItems, purchaseItem } from "./api/shop";
import type { ShopItem } from "../../shared/types/ShopItem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Shop() {
  const { user, login, token } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'passport' | 'skin'>('passport');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { data: items = [], isLoading } = useQuery<ShopItem[]>({
    queryKey: ["shopItems"],
    queryFn: getShopItems,
  });

  const buyMutation = useMutation({
    mutationFn: (item: ShopItem) => {
      if (!user) throw new Error("No user logged in");
      return purchaseItem(user.id, item.id);
    },
    onSuccess: (data, item) => {
      if (!user || !token) return;
      const updatedUser = {
        ...user,
        credits: user.credits - item.price,
        inventory: [...user.inventory, item.id]
      };
      login(updatedUser, token);
      setMessage({ text: `Successfully purchased ${item.name}!`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      queryClient.invalidateQueries({ queryKey: ["shopItems"] });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Purchase failed";
      setMessage({ text: errorMsg, type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const handleBuy = (item: ShopItem) => {
    buyMutation.mutate(item);
  };

  const filteredItems = items.filter(item => item.type === activeTab);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center pt-20">
        <div className="text-[var(--color-primary)] font-orbit text-xl animate-pulse">
          LOADING STORE DATA...
        </div>
      </main>
    );
  }

  return (
    <main className="pt-16 px-8 pb-10">
      <div className="max-w-7xl mx-auto">

        <header className="flex justify-between items-end mb-8 border-b border-[var(--color-primary)]/30 pb-6">
          <div>
            <h1 className="text-4xl font-orbit text-glow mb-2">GALACTIC SUPPLY</h1>
            <p className="text-[var(--color-primary)]/60 text-sm tracking-widest">
              UPGRADE YOUR FLEET AND APPEARANCE
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-[var(--color-primary)]/60 mb-1">CURRENT BALANCE</div>
            <div className="text-3xl font-bold text-[var(--color-warning)] font-orbit flex items-center justify-end gap-2">
              {user?.credits.toLocaleString()} <span className="text-sm">CR</span>
            </div>
          </div>
        </header>

        {/* --- TABS --- */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-6 py-2 uppercase tracking-widest text-sm font-bold border-b-2 transition-all ${activeTab === 'passport' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-primary)]/40 hover:text-[var(--color-primary)]/70'}`}
          >
            Passports
          </button>
          <button
            onClick={() => setActiveTab('skin')}
            className={`px-6 py-2 uppercase tracking-widest text-sm font-bold border-b-2 transition-all ${activeTab === 'skin' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-primary)]/40 hover:text-[var(--color-primary)]/70'}`}
          >
            Ships & Skins
          </button>
        </div>

        {message && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded border backdrop-blur-md z-50 transition-all ${message.type === 'success'
            ? 'bg-green-900/40 border-green-500 text-green-400'
            : 'bg-red-900/40 border-red-500 text-red-400'
            }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredItems.map((item) => {
            const isOwned = user?.inventory.includes(item.id);
            const canAfford = (user?.credits || 0) >= item.price;

            return (
              <div
                key={item.id}
                className={`
                  panel p-6 flex flex-col relative overflow-hidden group transition-all duration-300
                  ${isOwned ? 'opacity-70 border-[var(--color-primary)]/10' : 'hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,240,0.15)]'}
                `}
              >
                <div className="absolute top-0 right-0 p-2 bg-[var(--color-primary)]/10 rounded-bl-lg text-[10px] uppercase tracking-widest border-b border-l border-[var(--color-primary)]/20">
                  {item.type}
                </div>

                <div className="h-40 bg-black/40 rounded border border-[var(--color-primary)]/20 mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <span className="text-4xl">🚀</span>
                </div>

                <h3 className="text-xl font-bold font-orbit mb-2 truncate" title={item.name}>{item.name}</h3>
                <p className="text-sm text-[var(--color-primary)]/60 mb-6 flex-grow min-h-[40px]">
                  {item.description}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-[var(--color-primary)]/50">COST</span>
                    <span className={`text-xl font-bold font-orbit ${canAfford || isOwned ? 'text-[var(--color-primary)]' : 'text-red-400'}`}>
                      {item.price.toLocaleString()} CR
                    </span>
                  </div>

                  <button
                    onClick={() => handleBuy(item)}
                    disabled={isOwned || !canAfford}
                    className={`
                      w-full py-3 px-4 rounded text-sm font-bold tracking-widest uppercase transition-all
                      ${isOwned
                        ? 'bg-transparent border border-[var(--color-primary)]/20 text-[var(--color-primary)]/40 cursor-not-allowed'
                        : canAfford
                          ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black hover:shadow-[0_0_20px_var(--color-primary)]'
                          : 'bg-red-900/10 border border-red-500/30 text-red-500/50 cursor-not-allowed'
                      }
                    `}
                  >
                    {isOwned ? "OWNED" : canAfford ? "PURCHASE" : "INSUFFICIENT FUNDS"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 text-[var(--color-primary)]/40">
            NO SHIPMENTS DETECTED IN THIS SECTOR.
          </div>
        )}
      </div>
    </main>
  );
}