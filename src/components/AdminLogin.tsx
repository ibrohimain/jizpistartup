import React, { useState } from "react";
import { LogIn, Lock, Mail, ShieldAlert } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate database lookup of single credentials specified by user:
    // Email: umarabdullayev338@gmail.com
    // Password: 28032025
    setTimeout(() => {
      if (email.trim().toLowerCase() === "umarabdullayev338@gmail.com" && password === "28032025") {
        onLoginSuccess();
      } else {
        setError("Email yoki parol noto'g'ri kiritildi.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto my-12" id="login-container">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-blue-900 text-white p-8 text-center relative">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-3 shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black font-sans tracking-tight">Admin Tizimiga Kirish</h2>
          <p className="text-blue-200 text-xs mt-1">Faqat JizPi StartUp Ligasi adminlari uchun</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6" id="admin-login-form">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="admin-email">
              Admin Email manzili
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email kriting...."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all text-slate-900"
              />
            </div>
            
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="admin-password">
              Tizim paroli
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all"
            id="btn-admin-login-submit"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Tizimga kirish
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
