import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "./api/auth";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser({ username, email, passwordHash: password });
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Email might be taken.");
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg-main)]">
      <div className="w-full max-w-md p-8 panel backdrop-blur-md">
        <h1 className="text-3xl font-orbit text-center mb-8 text-[var(--color-primary)] text-glow">
          NEW RECRUIT
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm text-center font-geist">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 font-geist">
          <div>
            <label className="block text-sm text-[var(--color-primary)]/70 mb-2">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-[var(--color-primary)]/30 rounded p-3 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_var(--color-primary)] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--color-primary)]/70 mb-2">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-[var(--color-primary)]/30 rounded p-3 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_var(--color-primary)] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--color-primary)]/70 mb-2">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-[var(--color-primary)]/30 rounded p-3 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_var(--color-primary)] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary mt-4"
          >
            REGISTER
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-geist text-[var(--color-primary)]/60">
          ALREADY ENLISTED?{" "}
          <Link to="/login" className="text-[var(--color-accent)] hover:underline">
            LOGIN HERE
          </Link>
        </div>
      </div>
    </main>
  );
}