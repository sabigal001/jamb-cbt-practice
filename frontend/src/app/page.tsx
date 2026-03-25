"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Books, Exam, GraduationCap, ShieldCheck } from "@phosphor-icons/react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 relative z-10 w-full px-4"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 backdrop-blur-md flex items-center justify-center w-16 h-16 md:w-20 md:h-20">
            <span className="text-3xl md:text-4xl font-bold text-blue-400">λ</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Lambda
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
          The ultimate CBT practice portal designed for JAMB aspirants. 
          Master your subjects and ace your exams with confidence.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl relative z-10 px-4">
        <Link href="/signup" className="block">
          <GlassCard className="h-full border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Exam size={32} color="#60A5FA" weight="duotone" />
              </div>
              <h2 className="text-2xl font-bold">JAMB Mock Exam</h2>
            </div>
            <p className="text-gray-400">
              A full, timed exam mimicking the official CBT interface. 
              No distractions, pure focus on your success.
            </p>
            <div className="mt-6 flex items-center gap-2 text-blue-400 font-medium">
              Get Started <span className="text-lg">→</span>
            </div>
          </GlassCard>
        </Link>

        <Link href="/signup" className="block">
          <GlassCard className="h-full border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Books size={32} color="#C084FC" weight="duotone" />
              </div>
              <h2 className="text-2xl font-bold">Topic Drills</h2>
            </div>
            <p className="text-gray-400">
              Interactive, gamified drills on specific topics. 
              Immediate feedback and explanations for better mastery.
            </p>
            <div className="mt-6 flex items-center gap-2 text-purple-400 font-medium">
              Start Drills <span className="text-lg">→</span>
            </div>
          </GlassCard>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-16 flex items-center gap-8 text-gray-500 text-sm"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} />
          <span>ALOC API Integrated</span>
        </div>
        <div className="w-px h-4 bg-gray-800" />
        <span>For All JAMB Aspirants</span>
      </motion.div>
    </main>
  );
}
