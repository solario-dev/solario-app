import { useState } from "react";
import { createQuestion } from "../api/quiz";
import { useUser } from "../context/UserContext";
import { Navigate } from "react-router-dom";
import planetsData from "../data/planets.json";

export default function AdminPage() {
  const { user, isAuthenticated } = useUser();
  const [planet, setPlanet] = useState(planetsData.celestialBodies[0].name.toLowerCase());
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [status, setStatus] = useState("");

  if (!isAuthenticated || user?.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAnswerChange = (index: number, val: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = val;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");
    try {
        await createQuestion({
            planetName: planet,
            text,
            answers: answers.map(a => ({ text: a })),
            correctAnswerIndex: correctIndex
        });
        setStatus("Success! Question added.");
        setText("");
        setAnswers(["", "", "", ""]);
    } catch (err) {
        console.error(err);
        setStatus("Error adding question.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center pt-24 font-geist text-[var(--color-primary)]">
      <div className="panel w-full max-w-2xl p-8">
        <h1 className="text-2xl font-orbit mb-6 border-b border-[var(--color-primary)]/30 pb-4">ADMIN: ADD QUESTION</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">Target Planet</label>
                <select 
                    value={planet} 
                    onChange={(e) => setPlanet(e.target.value)}
                    className="w-full bg-black/40 border border-[var(--color-primary)]/30 rounded p-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                >
                    {planetsData.celestialBodies
                        .filter(p => p.type === 'planet')
                        .map(p => (
                        <option key={p.name} value={p.name.toLowerCase()}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">Question Text</label>
                <textarea 
                    value={text} 
                    onChange={e => setText(e.target.value)}
                    required
                    rows={3}
                    className="w-full bg-black/40 border border-[var(--color-primary)]/30 rounded p-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                />
            </div>

            <div className="space-y-3">
                <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">Answers (Select the correct radio button)</label>
                {answers.map((ans, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <input 
                            type="radio" 
                            name="correct" 
                            checked={correctIndex === idx} 
                            onChange={() => setCorrectIndex(idx)}
                            className="accent-[var(--color-primary)]"
                        />
                        <input 
                            type="text" 
                            value={ans}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            placeholder={`Answer ${idx + 1}`}
                            required
                            className="flex-1 bg-black/40 border border-[var(--color-primary)]/30 rounded p-2 text-white focus:outline-none focus:border-[var(--color-primary)]"
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4">
                <span className={status.includes("Success") ? "text-green-400" : "text-red-400"}>{status}</span>
                <button type="submit" className="btn-primary">ADD TO DATABASE</button>
            </div>
        </form>
      </div>
    </main>
  );
}