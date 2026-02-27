import { useState, useEffect } from "react";
import { getQuestionsByPlanet, submitAnswer, type QuestionDto } from "../../api/quiz";
import { useUser } from "../../context/UserContext";

interface QuizWindowProps {
  planetName: string;
  onClose: () => void;
  onExitOrbit: () => void;
}

export default function QuizWindow({ planetName, onClose, onExitOrbit }: QuizWindowProps) {
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const { user } = useUser();
  const playerId = user?.id || "0";

  const TIME_PER_QUESTION = 10000;
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestionsByPlanet(planetName, 5, playerId);
        setQuestions(data);
        setLoading(false);
        setTimerActive(true);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [planetName, playerId]);

  useEffect(() => {
    if (!timerActive || isFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          handleTimeOut();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timerActive, isFinished]);

  const handleTimeOut = () => {
    setTimerActive(false);
    setResultMessage("TIME'S UP!");
    setTimeout(nextQuestion, 2000);
  };

  const handleAnswer = async (answerId: string) => {
    if (selectedAnswer || !timerActive) return;
    setTimerActive(false);
    setSelectedAnswer(answerId);

    const ratio = Math.max(0, timeLeft / TIME_PER_QUESTION);
    try {
        const result = await submitAnswer(questions[currentIndex].id, playerId, ratio, answerId);
        
        if (result.correct) {
            setScore((prev) => prev + 100 + Math.round(ratio * 100));
            setResultMessage("CORRECT!");
        } else {
            setResultMessage("WRONG!");
        }
    } catch (e) {
        console.error(e);
        setResultMessage("ERROR");
    }

    setTimeout(nextQuestion, 1500);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setResultMessage(null);
      setTimeLeft(TIME_PER_QUESTION);
      setTimerActive(true);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) return <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-[var(--color-primary)] font-orbit z-[9999]">SCANNING DATABANKS...</div>;

  if (isFinished || questions.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-[9999]">
        <div className="panel p-8 text-center max-w-md">
          <h2 className="text-3xl font-orbit mb-4 text-[var(--color-primary)]">SESSION COMPLETE</h2>
          <p className="font-geist text-xl mb-6">FINAL SCORE: <span className="text-[var(--color-warning)]">{score}</span></p>
          {questions.length === 0 && <p className="mb-4 text-red-400">No questions found for {planetName}.</p>}
          
          <div className="space-y-4">
            <button onClick={onClose} className="btn-primary w-full block">STAY ON PLANET</button>
            <button onClick={onExitOrbit} className="btn-primary w-full block border-red-500 text-red-300 hover:bg-red-900/20">RETURN TO SPACE</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = (timeLeft / TIME_PER_QUESTION) * 100;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[9999] backdrop-blur-sm">
      <div className="panel w-full max-w-2xl p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-primary)]/50 hover:text-white">EXIT</button>
        
        <div className="flex justify-between items-end mb-2 font-orbit text-[var(--color-primary)]">
            <span>QUESTION {currentIndex + 1}/{questions.length}</span>
            <span>SCORE: {score}</span>
        </div>

        <div className="w-full h-2 bg-[var(--color-primary)]/20 rounded-full mb-8 overflow-hidden">
            <div 
                className={`h-full transition-all duration-100 ease-linear ${progress < 30 ? 'bg-red-500' : 'bg-[var(--color-primary)]'}`} 
                style={{ width: `${progress}%` }}
            />
        </div>

        <h3 className="text-xl font-geist text-white mb-8 text-center min-h-[60px]">{currentQ.text}</h3>

        <div className="grid grid-cols-1 gap-4">
          {currentQ.answers.map((ans) => {
            let btnClass = "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)]";
            if (selectedAnswer === ans.id) {
                if (resultMessage === "CORRECT!") {
                    btnClass = "bg-green-500/20 border-green-500 text-green-300";
                } else if (resultMessage === "WRONG!") {
                    btnClass = "bg-red-500/20 border-red-500 text-red-300";
                } else {
                    btnClass = "bg-yellow-500/20 border-yellow-500 text-yellow-300";
                }
            }

            return (
                <button
                key={ans.id}
                onClick={() => handleAnswer(ans.id)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded text-left font-geist transition-all duration-200 ${btnClass}`}
                >
                {ans.text}
                </button>
            )
          })}
        </div>

        {resultMessage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 p-4 rounded border border-[var(--color-primary)] text-2xl font-orbit text-glow">
                    {resultMessage}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}