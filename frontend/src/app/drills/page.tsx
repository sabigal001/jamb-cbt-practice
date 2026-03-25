"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Lightbulb, 
  X,
  TrendUp,
  BookOpen,
  CaretLeft,
  Trophy,
  CaretDown
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { fetchQuestions, saveResult } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";

import { useRouter } from "next/navigation";

const ALL_SUBJECTS = [
  "English", "Biology", "Chemistry", "Physics", 
  "Mathematics", "Economics", "Government", 
  "CRS", "IRS", "Commerce", "Accounting", "Literature"
];

export default function DrillModePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjectSelected, setSubjectSelected] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleFinish = useCallback(async () => {
    setSavingResult(true);
    const token = localStorage.getItem("token");
    if (token && subjectSelected) {
      try {
        await saveResult(token, {
          score: score / 100, // Number of correct answers
          total: questions.length,
          subject: subjectSelected,
          mode: 'drill'
        });
      } catch (err) {
        console.error("Failed to save result:", err);
      }
    }
    setCompleted(true);
    setSavingResult(false);
  }, [score, questions.length, subjectSelected]);

  const loadQuestions = useCallback(async (subject: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuestions('drill', subject.toLowerCase());
      if (!data || data.length === 0) {
        setError("No drill questions available for this subject at the moment.");
        setQuestions([]);
      } else {
        setQuestions(data);
        setSubjectSelected(subject);
        setCurrentIdx(0);
        setScore(0);
        setSelected(null);
        setIsCorrect(null);
        setShowFeedback(false);
        setCompleted(false);
      }
    } catch (error) {
      console.error("Failed to load drill questions:", error);
      setError("Failed to connect to the question server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]);

  const handleAnswer = (idx: number, optionKey: string) => {
    if (selected !== null) return;
    
    setSelected(idx);
    const correct = optionKey.toLowerCase() === questions[currentIdx].answer.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) setScore(prev => prev + 100);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
      setIsCorrect(null);
      setShowFeedback(false);
    } else {
      handleFinish();
    }
  };

  if (!subjectSelected && !error) {
    return (
      <main className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl w-full relative z-10 text-center space-y-12">
          <header className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-400"
            >
              Topic Drills
            </motion.h1>
            <p className="text-gray-400 text-lg">Select a subject to start your 10-question practice session.</p>
          </header>

          <div className="max-w-md mx-auto relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all text-xl font-bold group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <BookOpen size={24} weight="duotone" />
                </div>
                Choose a Subject
              </div>
              <CaretDown 
                size={24} 
                className={cn("transition-transform duration-300", isDropdownOpen ? "rotate-180" : "")} 
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 5, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 w-full mt-2 bg-[#1A1A1E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 grid grid-cols-2 gap-1 p-2"
                >
                  {ALL_SUBJECTS.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => {
                        loadQuestions(subject);
                        setIsDropdownOpen(false);
                      }}
                      className="p-4 text-left hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl transition-all font-medium flex items-center justify-between group"
                    >
                      {subject}
                      <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-8 border-t border-white/5">
            {["Biology", "Chemistry", "Physics", "English"].map((sub) => (
              <button
                key={sub}
                onClick={() => loadQuestions(sub)}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-sm font-bold text-gray-400 hover:text-emerald-400"
              >
                Quick {sub}
              </button>
            ))}
          </div>
          
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
            <CaretLeft size={20} /> Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (completed) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-12">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.3)]"
        >
          <Trophy size={80} weight="duotone" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-400">
            Session Complete!
          </h1>
          <p className="text-gray-400 text-xl">You earned <span className="text-emerald-400 font-bold">{score} XP</span> today.</p>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          <div className="glass p-6 rounded-2xl border-white/10">
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-1">Score</p>
            <p className="text-3xl font-bold">{score / 100} / {questions.length}</p>
          </div>
          <div className="glass p-6 rounded-2xl border-white/10">
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-1">Accuracy</p>
            <p className="text-3xl font-bold">{Math.round((score / (questions.length * 100)) * 100)}%</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setSubjectSelected(null)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            Practice More
          </button>
          <Link 
            href="/dashboard"
            className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-xl font-bold transition-all border border-white/10"
          >
            Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  
  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 space-y-8">
        <div className="p-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
          <Lightbulb size={64} weight="duotone" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Failed to load drills</h2>
          <p className="text-gray-400 max-w-md">{error}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setSubjectSelected(null)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            Try Another Subject
          </button>
          <Link 
            href="/dashboard"
            className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold transition-all border border-white/10"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!currentQ && !loading) return null;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full p-6 flex items-center gap-6 z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} weight="bold" className="text-gray-400" />
        </Link>
        <div className="flex-1 bg-white/10 h-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold">
          <TrendUp size={18} /> {score} XP
        </div>
      </div>

      <div className="max-w-2xl w-full relative z-10 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-12"
          >
            <h2 className="text-3xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
              {currentQ.question}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {currentQ.option && Object.entries(currentQ.option).map(([key, value], idx) => {
                const isSelected = selected === idx;
                const isCorrectOption = key.toLowerCase() === currentQ.answer.toLowerCase();
                
                let borderColor = "border-white/10";
                let bgColor = "bg-white/5";
                let textColor = "text-white";

                if (selected !== null) {
                  if (isCorrectOption) {
                    borderColor = "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]";
                    bgColor = "bg-green-500/10";
                    textColor = "text-green-400";
                  } else if (isSelected && !isCorrectOption) {
                    borderColor = "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]";
                    bgColor = "bg-red-500/10";
                    textColor = "text-red-400";
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    whileHover={selected === null ? { scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" } : {}}
                    whileTap={selected === null ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(idx, key)}
                    disabled={selected !== null}
                    className={cn(
                      "w-full p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group",
                      borderColor, bgColor, textColor
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors",
                        isSelected || (isCorrectOption && selected !== null)
                          ? "bg-white/10" 
                          : "bg-white/5 group-hover:bg-white/10"
                      )}>
                        {key.toUpperCase()}
                      </div>
                      <span className="text-xl font-medium">{String(value)}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Feedback Bar */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className={cn(
              "fixed bottom-0 left-0 w-full p-8 md:p-12 border-t backdrop-blur-2xl z-50",
              isCorrect 
                ? "bg-green-500/20 border-green-500/30" 
                : "bg-red-500/20 border-red-500/30"
            )}
          >
            <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className={cn(
                  "p-4 rounded-2xl",
                  isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                )}>
                  {isCorrect ? <CheckCircle size={32} weight="fill" /> : <XCircle size={32} weight="fill" />}
                </div>
                <div>
                  <h3 className={cn(
                    "text-2xl font-bold mb-2",
                    isCorrect ? "text-green-400" : "text-red-400"
                  )}>
                    {isCorrect ? "Brilliant Work!" : "Not quite right..."}
                  </h3>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Lightbulb size={18} className="text-yellow-400" />
                    <p>{currentQ.explanation || "No explanation available for this question."}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={nextQuestion}
                className={cn(
                  "px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-2xl",
                  isCorrect 
                    ? "bg-green-500 hover:bg-green-400 text-white shadow-green-500/20" 
                    : "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20"
                )}
              >
                Continue <ArrowRight size={24} weight="bold" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
