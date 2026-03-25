"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { CheckCircle, XCircle, Spinner, GraduationCap } from "@phosphor-icons/react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verify = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/api/auth/verify-email/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setStatus('error');
          setMessage('Verification failed. The link may be expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <GlassCard className="p-12 text-center max-w-md border-white/10" hoverEffect={false}>
      <div className="flex justify-center mb-6">
        {status === 'loading' && <Spinner size={48} className="animate-spin text-blue-400" />}
        {status === 'success' && <CheckCircle size={48} weight="fill" className="text-green-500" />}
        {status === 'error' && <XCircle size={48} weight="fill" className="text-red-500" />}
      </div>
      <h2 className="text-2xl font-bold mb-4">{status === 'success' ? 'Verified!' : status === 'error' ? 'Error' : 'Verifying...'}</h2>
      <p className="text-gray-400">{message}</p>
      {status === 'success' && (
        <p className="text-sm text-blue-400 mt-4">Redirecting to login...</p>
      )}
    </GlassCard>
  );
}

export default function VerifyEmailPage() {
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
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
