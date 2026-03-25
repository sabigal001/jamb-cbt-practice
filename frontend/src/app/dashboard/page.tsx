"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { 
  User, 
  TrendUp, 
  Calendar, 
  BookOpen, 
  Lightning, 
  ArrowRight,
  ChartBar,
  Trophy,
  Gear
} from "@phosphor-icons/react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from "recharts";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProfile, getHistory } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [profileData, historyData] = await Promise.all([
          getProfile(token),
          getHistory(token)
        ]);
        setProfile(profileData);
        setHistory(historyData);
        localStorage.setItem("username", profileData.username);
      } catch (error) {
        console.error("Dashboard error:", error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const subjectData = profile ? [
    { subject: "Biology", score: profile.scores.biology, color: "#60A5FA" },
    { subject: "Chemistry", score: profile.scores.chemistry, color: "#C084FC" },
    { subject: "Physics", score: profile.scores.physics, color: "#F87171" },
    { subject: "English", score: profile.scores.english, color: "#34D399" },
    { subject: "Maths", score: profile.scores.mathematics || 0, color: "#FBBF24" },
  ] : [];

  const userName = profile?.username || "Scholar";

  return (
    <main className="min-h-screen p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, <span className="text-blue-400">{userName}</span>!
            </h1>
            <p className="text-gray-400 flex items-center gap-2 text-sm md:text-base">
              <Calendar size={20} />
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex-1 md:flex-none"
            >
              <div className="p-2 md:p-3 rounded-xl bg-blue-500/20">
                <Trophy size={24} className="md:w-7 md:h-7 text-blue-400" weight="duotone" />
              </div>
              <div>
                <p className="text-[10px] md:text-sm text-gray-400 uppercase tracking-widest">Points</p>
                <p className="text-lg md:text-xl font-bold">{profile?.total_xp?.toLocaleString() || 0}</p>
              </div>
            </motion.div>

            <Link href="/settings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <Gear size={24} className="md:w-7 md:h-7" weight="duotone" />
              </motion.button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Study Modes */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Lightning size={28} weight="duotone" className="text-yellow-400" />
              Start Learning
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/mock-exam" className="block h-full">
                <GlassCard className="h-full border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-400">
                      <BookOpen size={32} weight="duotone" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Full CBT
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">JAMB Mock Exam</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    4 subjects • 180 questions • 2 hours. 
                    Official JAMB CBT interface for maximum focus.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                      Enter Mock Room <ArrowRight size={20} />
                    </span>
                  </div>
                </GlassCard>
              </Link>

              <Link href="/drills" className="block h-full">
                <GlassCard className="h-full border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-2xl bg-purple-500/20 text-purple-400">
                      <Lightning size={32} weight="duotone" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Drills
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Topic Drills</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Quick 10-question drills on specific topics. 
                    Gamified feedback and explanations.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                      Start Drill Session <ArrowRight size={20} />
                    </span>
                  </div>
                </GlassCard>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="glass p-4 rounded-2xl border-white/10 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
                  <TrendUp size={24} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Accuracy</p>
                  <p className="text-lg font-bold">
                    {history && history.length > 0 
                      ? Math.round((history.reduce((acc, h) => acc + (h.score / h.total), 0) / history.length) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
              <div className="glass p-4 rounded-2xl border-white/10 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400">
                  <User size={24} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Tests Taken</p>
                  <p className="text-lg font-bold">{history?.length || 0}</p>
                </div>
              </div>
              <div className="glass p-4 rounded-2xl border-white/10 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
                  <Lightning size={24} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Streak</p>
                  <p className="text-lg font-bold">{profile?.streak || 0} Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Tracking */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ChartBar size={28} weight="duotone" className="text-blue-400" />
              Performance
            </h2>
            
            <GlassCard className="h-[400px] flex flex-col justify-between">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1">Subject Mastery</h3>
                <p className="text-sm text-gray-400">Your current accuracy per subject</p>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical" margin={{ left: -20, right: 20 }}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      dataKey="subject" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass p-3 rounded-xl border-white/10 text-xs shadow-2xl">
                              <p className="font-bold text-white mb-1">{payload[0].payload.subject}</p>
                              <p className="text-blue-400">{payload[0].value}% Accuracy</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Focus Required</p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-sm text-red-400">Physics: Electromagnetic Induction</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
