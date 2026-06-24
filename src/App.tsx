import React, { useState, useEffect } from "react";
import ApplicationForm from "./components/ApplicationForm";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import { GraduationCap, Users, Calendar, Award, Sparkles, MapPin, ShieldCheck, FileSpreadsheet, Lock, Mail, Signal } from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem("jizpi_admin_logged_in") === "true";
  });

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem("jizpi_admin_logged_in", "true");
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("jizpi_admin_logged_in");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans antialiased text-slate-900" id="app-root">
      {/* 1. Left Sidebar - From "Sleek Interface" Theme */}
      <aside className="w-full md:w-72 bg-blue-900 text-white flex flex-col shrink-0 border-r border-blue-950 shadow-xl" id="sidebar-menu">
        <div className="p-6 md:p-8">
          {/* Logo & Brand */}
          <div 
            onClick={() => setIsAdminMode(false)}
            className="flex items-center gap-3 mb-8 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center font-black text-xl transition-transform group-hover:scale-105 shadow-md">
              J
            </div>
            <div>
              <h1 className="text-lg font-black leading-tight tracking-tight">
                JizPi StartUp
              </h1>
              <span className="text-xs text-blue-300 font-bold tracking-wider block">
                Liga Platformasi
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-3" id="sidebar-nav">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`w-full text-left p-3.5 rounded-xl cursor-pointer border transition-all flex items-center gap-3 ${
                !isAdminMode 
                  ? "bg-white/10 border-white/25 text-white shadow-md font-bold" 
                  : "bg-transparent border-transparent hover:bg-white/5 text-blue-200 hover:text-white"
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 shrink-0 text-blue-300" />
              <div>
                <p className="text-sm font-semibold">Ariza Yuborish</p>
                <p className="text-[10px] opacity-70 font-medium">Ro'yxatdan o'tish formasi</p>
              </div>
            </button>

            <button
              onClick={() => setIsAdminMode(true)}
              className={`w-full text-left p-3.5 rounded-xl cursor-pointer border transition-all flex items-center gap-3 ${
                isAdminMode 
                  ? "bg-white/10 border-white/25 text-white shadow-md font-bold" 
                  : "bg-transparent border-transparent hover:bg-white/5 text-blue-200 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-5 h-5 shrink-0 text-blue-300" />
              <div>
                <p className="text-sm font-semibold">Admin Panel</p>
                <p className="text-[10px] opacity-70 font-medium">Boshqaruv va PDF</p>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with platform Admin specified by user */}
        <div className="mt-auto p-6 md:p-8 bg-blue-950 border-t border-blue-900/40">
          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-1">Platforma Admini:</p>
          <p className="text-xs font-mono break-all text-white font-medium">umarabdullayev338@gmail.com</p>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0" id="main-content-wrapper">
        {/* Sleek Top Header Banner */}
        <header className="bg-white border-b border-slate-200 py-6 px-6 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {!isAdminMode 
                ? "Yangi StartUp Loyihasini Ro'yxatdan O'tkazish" 
                : isAdminLoggedIn 
                  ? "Tizim Boshqaruv Dashboardi" 
                  : "Admin Avtorizatsiya"
              }
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {!isAdminMode 
                ? "JizPi StartUp Ligasida ishtirok etish uchun barcha ma'lumotlarni to'liq to'ldiring" 
                : "Barcha kelib tushgan arizalarni tekshirish, holatini tasdiqlash va PDF jadvallarni yuklash"
              }
            </p>
          </div>
          <div className="flex gap-3 shrink-0 self-start sm:self-center">
            <span className="px-3.5 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-xs font-bold tracking-wider uppercase">
              Bosqich: 1/1
            </span>
          </div>
        </header>

        {/* Main nested wrapper */}
        <div className="flex-1 p-6 md:p-8">
          {!isAdminMode ? (
            <div className="space-y-8">
              {/* Quick Info Badges inside Sleek Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="hero-badge-grid">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">MUDDATI</div>
                    <div className="text-xs font-bold text-slate-800">Doimiy ochiq</div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">LOYIHA TURI</div>
                    <div className="text-xs font-bold text-slate-800">StartUp Loyihalar</div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">MANZIL / INST</div>
                    <div className="text-xs font-bold text-slate-800">Jizzax, JizPi</div>
                  </div>
                </div>
              </div>

              {/* Application Form component with sleek theme */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ApplicationForm />
              </motion.div>
            </div>
          ) : (
            /* Admin view, either panel or login gate */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isAdminLoggedIn ? (
                <AdminPanel onLogout={handleLogout} />
              ) : (
                <AdminLogin onLoginSuccess={handleLoginSuccess} />
              )}
            </motion.div>
          )}
        </div>

        {/* Footer info from Sleek Interface Theme */}
        <footer className="px-6 md:px-8 py-5 bg-slate-100 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
          <div>© {new Date().getFullYear()} JIZPI STARTUP LIGASI — BARCHA HUQUQLAR HIMOYA QILINGAN</div>
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            <span>BOG'LANISH: +998 (90) 123-45-67</span>
            <span className="text-blue-600">TEXNIK YORDAM</span>
          </div>
        </footer>
      </main>

      {/* Floating Status Indicator Badge from Sleek Interface Theme */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" id="floating-status-badge">
        <div className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-600">Baza: Aloqada</span>
        </div>
      </div>
    </div>
  );
}

