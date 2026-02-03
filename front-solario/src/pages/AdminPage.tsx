import { useState, useEffect } from "react";
import { createQuestion, updateQuestion, deleteQuestion, getQuestionsByPlanet, type QuestionDto } from "../api/quiz";
import { useUser } from "../context/UserContext";
import { Navigate } from "react-router-dom";
import planetsData from "../data/planets.json";

export default function AdminPage() {
  const { user, isAuthenticated } = useUser();
  
  const [selectedPlanet, setSelectedPlanet] = useState(planetsData.celestialBodies[0].name.toLowerCase());
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isAuthenticated && user?.role === "Admin") {
        fetchQuestions();
    }
  }, [selectedPlanet, isAuthenticated]);

  const fetchQuestions = async () => {
      setLoading(true);
      try {
          const data = await getQuestionsByPlanet(selectedPlanet, 100);
          setQuestions(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  if (!isAuthenticated || user?.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAnswerChange = (index: number, val: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = val;
    setAnswers(newAnswers);
  };

  const handleEditClick = (q: QuestionDto) => {
      setEditingId(q.id);
      setText(q.text);
      
      const formAnswers = ["", "", "", ""];
      let correctIdx = 0;
      
      q.answers.forEach((a, i) => {
          if (i < 4) formAnswers[i] = a.text;
          if (a.id === q.correctAnswerId) correctIdx = i;
      });
      
      setAnswers(formAnswers);
      setCorrectIndex(correctIdx);
      setStatus("Editing mode active.");
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setText("");
      setAnswers(["", "", "", ""]);
      setCorrectIndex(0);
      setStatus("");
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure you want to delete this question?")) return;
      
      try {
          await deleteQuestion(id);
          setQuestions(prev => prev.filter(q => q.id !== id));
          setStatus("Question deleted.");
      } catch (e) {
          setStatus("Error deleting question.");
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");
    
    const payload = {
        planetName: selectedPlanet,
        text,
        answers: answers.map(a => ({ text: a })),
        correctAnswerIndex: correctIndex
    };

    try {
        if (editingId) {
            await updateQuestion(editingId, payload);
            setStatus("Success! Question updated.");
        } else {
            await createQuestion(payload);
            setStatus("Success! Question added.");
        }
        
        setText("");
        setAnswers(["", "", "", ""]);
        setEditingId(null);
        fetchQuestions(); 
    } catch (err) {
        console.error(err);
        setStatus("Error saving question.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg-main)] pt-24 pb-10 px-8 font-geist text-[var(--color-primary)] flex gap-8">
      
      <div className="w-1/3 min-w-[400px]">
        <div className="panel p-8 sticky top-24">
            <h1 className="text-xl font-orbit mb-6 border-b border-[var(--color-primary)]/30 pb-4">
                {editingId ? "EDIT QUESTION" : "ADD NEW QUESTION"}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">Target Planet</label>
                    <select 
                        value={selectedPlanet} 
                        onChange={(e) => {
                            setSelectedPlanet(e.target.value);
                            handleCancelEdit(); 
                        }}
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
                    <label className="block text-xs uppercase tracking-widest mb-2 opacity-70">Answers (Check correct one)</label>
                    {answers.map((ans, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <input 
                                type="radio" 
                                name="correct" 
                                checked={correctIndex === idx} 
                                onChange={() => setCorrectIndex(idx)}
                                className="accent-[var(--color-primary)] cursor-pointer"
                            />
                            <input 
                                type="text" 
                                value={ans}
                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                placeholder={`Answer ${idx + 1}`}
                                required
                                className={`flex-1 bg-black/40 border rounded p-2 text-white focus:outline-none transition-colors ${correctIndex === idx ? 'border-green-500/50 bg-green-900/10' : 'border-[var(--color-primary)]/30 focus:border-[var(--color-primary)]'}`}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 gap-4">
                    <span className={`text-xs ${status.includes("Success") ? "text-green-400" : "text-red-400"}`}>{status}</span>
                    
                    <div className="flex gap-2">
                        {editingId && (
                            <button 
                                type="button" 
                                onClick={handleCancelEdit}
                                className="px-4 py-2 border border-red-500/50 text-red-300 rounded hover:bg-red-900/20 text-xs font-bold"
                            >
                                CANCEL
                            </button>
                        )}
                        <button type="submit" className="btn-primary text-xs">
                            {editingId ? "UPDATE" : "ADD"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-orbit mb-6 flex justify-between items-end border-b border-[var(--color-primary)]/30 pb-4">
            <span>DATABASE: {selectedPlanet.toUpperCase()}</span>
            <span className="text-sm font-geist opacity-50">{questions.length} ENTRIES</span>
        </h2>

        {loading ? (
            <div className="text-center py-20 opacity-50 animate-pulse">Scanning databanks...</div>
        ) : (
            <div className="space-y-4">
                {questions.length === 0 && <div className="text-center py-10 opacity-50">No data found.</div>}
                
                {questions.map(q => (
                    <div 
                        key={q.id} 
                        className={`panel p-5 transition-all ${editingId === q.id ? 'border-[var(--color-accent)] shadow-[0_0_15px_rgba(0,184,217,0.2)]' : 'hover:bg-[var(--color-primary)]/5'}`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-white">{q.text}</h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleEditClick(q)}
                                    className="text-xs bg-blue-900/30 text-blue-300 border border-blue-500/30 px-2 py-1 rounded hover:bg-blue-900/50"
                                >
                                    EDIT
                                </button>
                                <button 
                                    onClick={() => handleDelete(q.id)}
                                    className="text-xs bg-red-900/30 text-red-300 border border-red-500/30 px-2 py-1 rounded hover:bg-red-900/50"
                                >
                                    DEL
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {q.answers.map(a => (
                                <div 
                                    key={a.id} 
                                    className={`p-2 rounded border ${a.id === q.correctAnswerId ? 'border-green-500/50 bg-green-900/10 text-green-200' : 'border-[var(--color-primary)]/10 text-[var(--color-primary)]/60'}`}
                                >
                                    {a.text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </main>
  );
}