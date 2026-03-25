"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { 
  User, 
  Envelope, 
  Shield, 
  SignOut, 
  CaretLeft,
  CheckCircle,
  XCircle,
  Spinner
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "@/lib/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const data = await getProfile(token);
        setProfile(data);
        setFormData({
          username: data.username,
          email: data.email
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem("token");

    try {
      await updateProfile(token!, formData);
      setMessage({ type: 'success', text: "Profile updated successfully!" });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-12 relative overflow-hidden bg-[#0A0A0B]">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-8 md:mb-12">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group w-fit">
            <CaretLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Account Settings</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <aside className="flex md:flex-col gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <button className="whitespace-nowrap flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium shrink-0">
              <User size={20} className="md:w-6 md:h-6" weight="duotone" />
              <span className="text-sm md:text-base">Profile</span>
            </button>
            <button className="whitespace-nowrap flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 text-gray-400 border border-white/5 font-medium hover:bg-white/10 transition-colors shrink-0">
              <Shield size={20} className="md:w-6 md:h-6" weight="duotone" />
              <span className="text-sm md:text-base">Security</span>
            </button>
            <button 
              onClick={handleLogout}
              className="whitespace-nowrap flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-red-500/5 text-red-400 border border-red-500/10 font-medium hover:bg-red-500/10 transition-colors shrink-0"
            >
              <SignOut size={20} className="md:w-6 md:h-6" weight="duotone" />
              <span className="text-sm md:text-base">Sign Out</span>
            </button>
          </aside>

          <div className="md:col-span-2">
            <GlassCard className="p-6 md:p-8 border-white/10">
              <h2 className="text-xl font-bold mb-6 md:mb-8">Edit Profile</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 rounded-xl flex items-center gap-3 border",
                      message.type === 'success' 
                        ? "bg-green-500/10 border-green-500/20 text-green-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}
                  >
                    {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span className="text-sm font-medium">{message.text}</span>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <User size={18} /> Username
                  </label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Envelope size={18} /> Email Address
                  </label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Spinner size={20} className="animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
