import { useNavigate } from "react-router-dom"
import { useGameState } from "../../context/GameStateContext";

export default function JoinGame() {
    const navigate = useNavigate();
    const { startGame, startTraining } = useGameState();

    function handleJoinGame(event: React.FormEvent) {
        event.preventDefault();
        startGame();
        navigate("/training");
        // Dodatkowa logika do dołączenia do gry może być dodana tutaj
    }

    function handleStartTraining() {
        startTraining();
        navigate("/training");
    }

  return (
    <section
        className="
        absolute right-12 top-12
        bg-[var(--color-bg-panel)]/30
        border border-[var(--color-primary)]/30
        shadow-[0_0_20px_rgba(0,255,240,0.2)]
        p-6 w-72 backdrop-blur-md
        "
    >
        <h3
        className="
            text-md mb-4 
            text-[var(--color-primary)]
        "
        >
        Let's begin your space adventure!
        </h3>

        <form className="flex flex-col space-y-3" onSubmit={handleJoinGame}>
        <input
            type="text"
            placeholder="Enter game code"
            className="
            px-3 py-2 rounded-md
            bg-transparent
            border border-[var(--color-primary)]/40
            text-[var(--color-primary)]
            placeholder-[var(--color-primary)]/50
            focus:outline-none
            focus:border-[var(--color-primary)]
            focus:shadow-[0_0_10px_var(--color-primary)]
            transition
            "
        />
        <button
            type="submit"
            className="
            px-4 py-2 rounded-md
            border border-[var(--color-primary)]
            text-[var(--color-primary)]
            font-semibold tracking-wide
            hover:bg-[var(--color-primary)] hover:text-black
            hover:shadow-[0_0_15px_var(--color-primary)]
            transition-all duration-300
            "
        >
            Join Game
        </button>
        </form>

        <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-[var(--color-primary)]/20"></div>
        <span className="text-[var(--color-primary)]/60 text-sm mx-2">or</span>
        <div className="flex-grow h-px bg-[var(--color-primary)]/20"></div>
        </div>

        <button
        onClick={() => handleStartTraining()}
        className="
            w-full px-4 py-2 rounded-md
            bg-[var(--color-accent)]
            text-black font-semibold tracking-wide
            hover:bg-[var(--color-primary)]
            hover:shadow-[0_0_20px_var(--color-primary)]
            transition-all duration-300
        "
        >
        Start Training
        </button>
    </section>
  )};