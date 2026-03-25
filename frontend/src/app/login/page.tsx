"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { GraduationCap, Envelope, Lock, ArrowRight, Spinner } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(formData);
      localStorage.setItem("token", data.access);
      localStorage.setItem("refresh", data.refresh);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 backdrop-blur-md flex items-center justify-center w-16 h-16">
              <span className="text-3xl font-bold text-blue-400">λ</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Welcome Back
          </h1>
          <p className="text-gray-400 mt-2">Sign in to your Lambda portal</p>
        </div>

        <GlassCard className="p-8 border-white/10" hoverEffect={false}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Envelope size={18} /> Username / Email
              </label>
              <input 
                type="text" 
                placeholder="jamb_warrior or you@example.com"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Lock size={18} /> Password
                </label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:underline">Forgot Password?</Link>
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? <Spinner className="animate-spin" size={20} /> : "Sign In"} 
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account? 
              <Link href="/signup" className="text-blue-400 hover:underline ml-1">Create one</Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </main>
  );
}
