import { useUser } from "../../context/UserContext";

export default function Saldo() {
  const { user } = useUser();

  return (
    <div className="flex gap-2 justify-center items-center font-geist bg-[var(--color-primary)]/10 px-3 py-1 rounded border border-[var(--color-primary)]/30">
        <div className="bg-yellow-500 w-3 h-3 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
        <p className="text-[var(--color-primary)] font-bold">{user?.credits.toLocaleString() ?? 0} CR</p>
    </div>
  );
}