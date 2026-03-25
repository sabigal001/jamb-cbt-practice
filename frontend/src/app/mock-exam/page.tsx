"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CaretLeft, 
  CaretRight, 
  Calculator, 
  Question, 
  CheckCircle,
  Timer
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { fetchQuestions, saveResult } from "@/lib/api";
import { GlassCard } from "@/components/GlassCard";

import { useRouter } from "next/navigation";

const subjects = ["English", "Biology", "Chemistry", "Physics"];

export default function MockExamPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours
  const [activeSubject, setActiveSubject] = useState("Biology");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const router = useRouter();

  const handleFinish = async () => {
    if (examFinished || submitting) return;
    
    setSubmitting(true);
    const token = localStorage.getItem("token");
    
    // Calculate final score
    const correctCount = questions.reduce((acc, q, idx) => {
      const selected = selectedAnswers[idx];
      return acc + (selected === q.answer ? 1 : 0);
    }, 0);

    if (token) {
      try {
        await saveResult(token, {
          score: correctCount,
          total: questions.length,
          subject: activeSubject,
          mode: 'mock'
        });
      } catch (err) {
        console.error("Failed to save mock result:", err);
      }
    }

    setExamFinished(true);
    setSubmitting(false);
  };

  const loadQuestions = useCallback(async (subject: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuestions('mock', subject.toLowerCase());
      if (!data || data.length === 0) {
        setError(`No questions available for ${subject} at the moment.`);
        setQuestions([]);
      } else {
        setQuestions(data);
        setCurrentQuestion(0);
      }
    } catch (error) {
      console.error("Failed to load mock questions:", error);
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
    loadQuestions(activeSubject);
  }, [activeSubject, loadQuestions, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (examFinished) {
    const correctCount = questions.reduce((acc, q, idx) => {
      const selected = selectedAnswers[idx];
      return acc + (selected === q.answer ? 1 : 0);
    }, 0);

    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6">
        <GlassCard className="max-w-2xl w-full p-12 text-center space-y-8 bg-white border-slate-200">
          <div className="p-6 rounded-full bg-blue-50 text-[#004282] border border-blue-100 mx-auto w-fit">
            <CheckCircle size={80} weight="duotone" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-800">Exam Submitted</h1>
            <p className="text-slate-500">Your results have been saved to your profile.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-slate-500 text-sm uppercase font-bold mb-1">Score</p>
              <p className="text-3xl font-bold text-[#004282]">{correctCount} / {questions.length}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-slate-500 text-sm uppercase font-bold mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-[#004282]">{Math.round((correctCount / questions.length) * 100)}%</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#004282] text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg"
          >
            Return to Dashboard
          </button>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold uppercase tracking-widest">Loading CBT Mock...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col font-sans">
      {/* Top Bar - JAMB Style */}
      <header className="bg-[#004282] text-white p-3 md:p-4 flex flex-col md:flex-row justify-between items-center shadow-md gap-4">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl border border-white/20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 shrink-0">
              <span className="text-xl md:text-2xl font-bold text-white">λ</span>
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-bold uppercase tracking-tight line-clamp-1">UTME MOCK 2026</h1>
              <p className="text-[10px] md:text-xs text-blue-200">Candidate: {localStorage.getItem('username') || 'Scholar'}</p>
            </div>
          </div>
          
          {/* Mobile Timer */}
          <div className="md:hidden flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
            <Timer size={18} weight="bold" />
            <span className="text-lg font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8">
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20">
            <Timer size={24} weight="bold" />
            <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={handleFinish}
            disabled={submitting}
            className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50 text-sm md:text-base"
          >
            {submitting ? "..." : "Submit"}
          </button>
        </div>
      </header>

      {/* Subject Navigation */}
      <nav className="bg-[#E1E5EB] border-b border-slate-300 p-1 md:p-2 flex gap-1 overflow-x-auto no-scrollbar">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubject(sub)}
            className={cn(
              "px-4 md:px-6 py-2 rounded font-bold transition-all text-sm md:text-base whitespace-nowrap",
              activeSubject === sub 
                ? "bg-[#004282] text-white shadow-inner" 
                : "bg-white text-[#004282] hover:bg-slate-100"
            )}
          >
            {sub}
          </button>
        ))}
      </nav>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Question Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto">
            {error ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="p-6 rounded-full bg-red-50 text-red-500">
                  <Question size={64} weight="duotone" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-800">No Questions Found</h3>
                  <p className="text-sm md:text-base text-slate-500 max-w-md">{error}</p>
                </div>
                <button 
                  onClick={() => loadQuestions(activeSubject)}
                  className="bg-[#004282] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg"
                >
                  Retry Loading
                </button>
              </div>
            ) : questions.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-slate-100 pb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-[#004282]">
                    Question {currentQuestion + 1}
                  </h2>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-sm md:text-base">
                    <Calculator size={20} /> <span className="hidden md:inline">Calculator</span>
                  </button>
                </div>

                <p className="text-lg md:text-xl leading-relaxed mb-8 md:mb-12 text-slate-700 font-medium">
                  {currentQ?.question}
                </p>

                <div className="space-y-3 md:space-y-4">
                  {currentQ?.option && Object.entries(currentQ.option).map(([key, value], idx) => {
                    const optionLetter = key.toUpperCase();
                    const isSelected = selectedAnswers[currentQuestion] === optionLetter;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: optionLetter })}
                        className={cn(
                          "w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all flex items-center gap-3 md:gap-4 group",
                          isSelected 
                            ? "border-[#004282] bg-blue-50 shadow-md ring-2 ring-blue-500/10" 
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-base md:text-lg shrink-0",
                          isSelected 
                            ? "bg-[#004282] text-white" 
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                        )}>
                          {optionLetter}
                        </div>
                        <span className="text-base md:text-lg">{String(value)}</span>
                        {isSelected && (
                          <CheckCircle size={24} weight="fill" className="ml-auto text-[#004282]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic py-20">
                Initializing questions...
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Question Grid Navigation */}
        <aside className="w-full md:w-80 bg-[#F8FAFC] border-t md:border-t-0 md:border-l border-slate-200 p-4 md:p-6 flex flex-col gap-6">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-500 uppercase text-[10px] md:text-xs tracking-widest">Navigation Grid</h3>
            <div className="grid grid-cols-6 md:grid-cols-5 gap-1.5 md:gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={cn(
                    "h-9 md:h-10 rounded font-bold transition-all border text-sm md:text-base",
                    currentQuestion === idx 
                      ? "bg-[#004282] text-white border-[#004282] scale-105 md:scale-110 shadow-lg z-10" 
                      : selectedAnswers[idx] 
                        ? "bg-green-100 text-green-700 border-green-200" 
                        : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between text-xs md:text-sm mb-1 font-bold">
                <span className="text-slate-500">Progress</span>
                <span className="text-[#004282]">{Object.keys(selectedAnswers).length} / {questions.length}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 md:h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#004282] h-full transition-all duration-500" 
                  style={{ width: `${(Object.keys(selectedAnswers).length / (questions.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 p-2.5 md:p-3 rounded-xl font-bold transition-colors text-sm md:text-base"
              >
                <CaretLeft size={18} weight="bold" /> Prev
              </button>
              <button 
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center justify-center gap-2 bg-[#004282] hover:bg-[#005bb8] text-white p-2.5 md:p-3 rounded-xl font-bold transition-colors text-sm md:text-base"
              >
                Next <CaretRight size={18} weight="bold" />
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Keyboard Shortcuts Bar */}
      <footer className="hidden md:flex bg-slate-800 text-white/50 px-6 py-2 text-xs gap-6">
        <span>[N] Next</span>
        <span>[P] Previous</span>
        <span>[A-D] Select Option</span>
        <span>[S] Submit</span>
      </footer>
    </div>
  );
}
