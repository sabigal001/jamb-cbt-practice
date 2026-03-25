"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Envelope, ArrowRight, CheckCircle, XCircle, GraduationCap, CaretLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      const response = await fetch(`${baseUrl}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Reset link sent to your email! Please check your inbox.');
      } else {
        const errorData = await response.json();
        setStatus('error');
        setMessage(errorData.error || 'Failed to send reset link.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 square-grid opacity-20" />
      
      <div className="text-center mb-8 absolute top-20">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 backdrop-blur-md flex items-center justify-center w-16 h-16">
            <span className="text-3xl font-bold text-blue-400">λ</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Lambda
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8 border-white/10" hoverEffect={false}>
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle size={48} weight="fill" className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-gray-400">{message}</p>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-blue-400 hover:underline mt-8 font-medium"
              >
                <CaretLeft size={20} /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
                <p className="text-gray-400">No worries! Enter your email and we&apos;ll send you a reset link.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Envelope size={18} /> Email Address
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <XCircle size={18} /> {message}
                </div>
              )}

              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 transition-colors"
                >
                  <CaretLeft size={16} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </GlassCard>
      </motion.div>
    </main>
  );
}
