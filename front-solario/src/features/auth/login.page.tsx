import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "./api/auth";
import { useAuthStore } from "../../shared/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ email, password });
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg-main)]">
      <div className="w-full max-w-md p-8 panel backdrop-blur-md">
        <h1 className="text-3xl font-orbit text-center mb-8 text-[var(--color-primary)] text-glow">
          ACCESS TERMINAL
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm text-center font-geist">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 font-geist">
          <div>
            <label className="block text-sm text-[var(--color-primary)]/70 mb-2">EMAIL FREQUENCY</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-[var(--color-primary)]/30 rounded p-3 text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_var(--color-primary)] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--color-primary)]/70 mb-2">SECURITY KEY</label>
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
            INITIALIZE LINK
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-geist text-[var(--color-primary)]/60">
          NO CREDENTIALS?{" "}
          <Link to="/register" className="text-[var(--color-accent)] hover:underline">
            REGISTER NEW ACCOUNT
          </Link>
        </div>
      </div>
    </main>
  );
}