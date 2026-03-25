"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Lock, ArrowRight, CheckCircle, XCircle, GraduationCap } from "@phosphor-icons/react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    const uid = searchParams.get('uid');
    const token = searchParams.get('token');

    if (!uid || !token) {
      setStatus('error');
      setMessage('Invalid reset link.');
      return;
    }

    setStatus('loading');
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      const response = await fetch(`${baseUrl}/api/auth/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, password })
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setStatus('error');
        setMessage('Reset failed. The link may be expired or invalid.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during password reset.');
    }
  };

  return (
    <GlassCard className="p-12 w-full max-w-md border-white/10" hoverEffect={false}>
      {status === 'success' ? (
        <div className="text-center">
          <CheckCircle size={48} weight="fill" className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          <p className="text-gray-400">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
            <p className="text-gray-400">Enter your new password below</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Lock size={18} /> New Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Lock size={18} /> Confirm New Password
            </label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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
            {status === 'loading' ? 'Updating...' : 'Update Password'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      )}
    </GlassCard>
  );
}

export default function ResetPasswordPage() {
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
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
