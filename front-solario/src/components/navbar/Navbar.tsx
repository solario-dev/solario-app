import { Link } from "react-router-dom";
import Saldo from "./Saldo";
import { useGameState } from "../../hooks/useGameState";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { state, quitTraining } = useGameState();
  const navigate = useNavigate();

  function handleQuit() {
    quitTraining();
    navigate("/dashboard");
  }

  return (
    <nav
      className="
        flex items-center justify-between px-10 py-4
        bg-black
        border-b border-[var(--color-primary)]/20
        backdrop-blur-md
        shadow-[0_0_20px_rgba(0,255,240,0.15)]
      "
    >
      {/* Logo / nazwa aplikacji */}
      <Link
        to="/dashboard"
        className="
          text-2xl font-orbit tracking-widest text-[var(--color-primary)]
          drop-shadow-[0_0_10px_var(--color-primary)]
          hover:text-white transition-all duration-300
          flex items-end gap-2
        "
      >
        SOLARIO
        <p className="text-sm">{state}</p>
      </Link>

      {/* Linki po prawej stronie */}
      <div className="flex items-center space-x-8 text-lg">
        <Saldo />

        {state === "training" && (
            <button
              onClick={handleQuit}
              className="
                text-[var(--color-primary)] font-geist
                hover:text-[#FF365D] hover:drop-shadow-[0_0_6px_#FF365D]
                transition-all duration-300
              "
            >
              QUIT
            </button>
        )}

        {state != "game" && state != "training" && (
          <div className="flex items-center space-x-8 text-lg">
            <Link
              to="/shop"
              className="
                text-[var(--color-primary)] font-geist
                hover:text-white hover:drop-shadow-[0_0_6px_var(--color-primary)]
                transition-all duration-300
              "
            >
              SHOP
            </Link>

            <Link
              to="/profile"
              className="
                text-[var(--color-primary)] font-geist
                hover:text-white hover:drop-shadow-[0_0_6px_var(--color-primary)]
                transition-all duration-300
              "
            >
              PROFILE
            </Link>

            <Link
              to="/"
              className="
                text-[var(--color-primary)] font-geist
                hover:text-[#FF365D] hover:drop-shadow-[0_0_6px_#FF365D]
                transition-all duration-300
              "
            >
              LOGOUT
            </Link>
          </div>
        )}

      </div>
    </nav>
  );
}
