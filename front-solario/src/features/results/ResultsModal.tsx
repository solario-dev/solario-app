import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../../shared/store/authStore";
import { useGameStore } from "../../shared/store/gameStore";

export default function ResultsModal() {
  const { showResults, setShowResults } = useGameStore();
  const { user, updateUser } = useAuthStore();
  const grantedRef = useRef(false);

  useEffect(() => {
    if (showResults && user && !grantedRef.current) {
      grantedRef.current = true;
      const updatedUser = {
        ...user,
        wins: (user.wins || 0) + 1,
        level: (user.level || 0) + 1,
        credits: (user.credits || 0) + 100,
      };
      updateUser(updatedUser);
    }
    if (!showResults) {
      grantedRef.current = false;
    }
  }, [showResults, user, updateUser]);

  if (!showResults || !user) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="relative max-w-sm w-full p-8 panel text-center border-glow flex flex-col items-center">
        {/* Animated Neon Trophy / Star Icon */}
        <div className="w-20 h-20 rounded-full border-2 border-[var(--color-warning)] flex items-center justify-center mb-6 bg-[var(--color-warning)]/10 shadow-[0_0_20px_rgba(253,216,53,0.4)] animate-bounce">
          <svg
            className="w-10 h-10 text-[var(--color-warning)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            ></path>
          </svg>
        </div>

        <h2 className="text-3xl font-orbit font-bold text-[var(--color-warning)] tracking-wider mb-2 drop-shadow-[0_0_10px_rgba(253,216,53,0.5)]">
          VICTORY!
        </h2>
        <p className="text-[var(--color-primary)]/80 font-geist text-sm mb-6 uppercase tracking-widest">
          Mission accomplished successfully
        </p>

        {/* Reward Details */}
        <div className="w-full bg-black/40 border border-[var(--color-primary)]/20 rounded-lg p-4 mb-6 space-y-3 font-geist">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--color-primary)]/60">CREDITS REWARD</span>
            <span className="text-[var(--color-warning)] font-bold font-orbit">+100 CR</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-[var(--color-primary)]/10 pt-2">
            <span className="text-[var(--color-primary)]/60">LEVEL ADVANCEMENT</span>
            <span className="text-[var(--color-primary)] font-bold">LVL {user.level}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-[var(--color-primary)]/10 pt-2">
            <span className="text-[var(--color-primary)]/60">WINS RECORDED</span>
            <span className="text-[var(--color-primary)] font-bold">{user.wins} WINS</span>
          </div>
        </div>

        <button
          onClick={() => setShowResults(false)}
          className="w-full btn-primary font-orbit py-3 tracking-widest text-glow"
        >
          CLAIM REWARDS
        </button>
      </div>
    </div>
  );
}
