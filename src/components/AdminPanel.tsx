import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { StartupApplication } from "../types";
import { 
  downloadGeneralApprovedPDF, 
  downloadIndividualTeamPDF 
} from "../utils/pdfGenerator";
import { 
  Users, CheckCircle2, XCircle, AlertCircle, FileDown, 
  Search, Filter, Calendar, MapPin, Briefcase, Eye, Trash2, LogOut, RefreshCw 
} from "lucide-react";
import { handleFirestoreError, OperationType } from "../utils/firestoreError";

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [applications, setApplications] = useState<StartupApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<StartupApplication | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Real-time listener for Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "startup_applications"),
      (snapshot) => {
        const appsList: StartupApplication[] = [];
        snapshot.forEach((doc) => {
          appsList.push({ id: doc.id, ...doc.data() } as StartupApplication);
        });
        
        // Sort by date descending
        appsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setApplications(appsList);
        setLoading(false);
        setQueryError(null);
      },
      (error) => {
        console.error("Firestore error: ", error);
        setLoading(false);
        if (error.code === "permission-denied" || (error.message && error.message.toLowerCase().includes("permission"))) {
          setQueryError("firebase-permissions-error");
        } else {
          setQueryError(error.message || String(error));
        }
        handleFirestoreError(error, OperationType.GET, "startup_applications");
      }
    );

    return () => unsub();
  }, []);

  // Update Status
  const handleStatusUpdate = async (id: string, newStatus: "approved" | "rejected" | "pending") => {
    try {
      const appRef = doc(db, "startup_applications", id);
      await updateDoc(appRef, { status: newStatus });
      
      // Update selected app state as well
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Statusni o'zgartirishda xatolik yuz berdi.");
      handleFirestoreError(error, OperationType.UPDATE, `startup_applications/${id}`);
    }
  };

  // Delete Application
  const handleDelete = async (id: string) => {
    if (!window.confirm("Haqiqatan ham ushbu arizani o'chirmoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, "startup_applications", id));
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(null);
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Arizani o'chirishda xatolik yuz berdi.");
      handleFirestoreError(error, OperationType.DELETE, `startup_applications/${id}`);
    }
  };

  // Stats calculation
  const totalCount = applications.length;
  const approvedCount = applications.filter(a => a.status === "approved").length;
  const pendingCount = applications.filter(a => a.status === "pending").length;
  const rejectedCount = applications.filter(a => a.status === "rejected").length;

  // Filtered applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.residenceCityDistrict.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return app.status === statusFilter && matchesSearch;
  });

  const handleDownloadGeneralPDF = () => {
    const approvedApps = applications.filter(app => app.status === "approved");
    if (approvedApps.length === 0) {
      alert("Hozirda hech qaysi jamoa tasdiqlanmagan. Umumiy jadvalni yuklash uchun kamida 1 ta jamoani tasdiqlang.");
      return;
    }
    downloadGeneralApprovedPDF(approvedApps);
  };

  return (
    <div className="space-y-8" id="admin-panel-root">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-900 text-white p-6 rounded-2xl shadow-lg border border-blue-950">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              ADMINISTRATOR PANELI
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
              localStorage.getItem("use_sandbox_db") !== "false"
                ? "bg-amber-500/30 text-amber-200 border border-amber-500/40"
                : "bg-emerald-500/30 text-emerald-200 border border-emerald-500/40"
            }`}>
              {localStorage.getItem("use_sandbox_db") !== "false" ? "Sandbox Baza (Sinov)" : "Shaxsiy (jizpistartup)"}
            </span>
            {localStorage.getItem("use_sandbox_db") !== "false" ? (
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("use_sandbox_db", "false");
                  window.location.reload();
                }}
                className="text-[9px] text-blue-200 hover:text-white underline font-bold"
              >
                Shaxsiyga o'tish
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("use_sandbox_db");
                  window.location.reload();
                }}
                className="text-[9px] text-blue-200 hover:text-white underline font-bold"
              >
                Sandboxga o'tish
              </button>
            )}
          </div>
          <h1 className="text-2xl font-black mt-1 font-sans">Boshqaruv va Monitoring</h1>
          <p className="text-blue-200 text-xs mt-1">
            Murojaatchi: <span className="text-white font-mono">umarabdullayev338@gmail.com</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadGeneralPDF}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-md transition-all"
            id="btn-download-all-pdf"
          >
            <FileDown className="w-4 h-4" />
            Umumiy PDF yuklash
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all"
            id="btn-admin-logout"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </button>
        </div>
      </div>

      {queryError === "firebase-permissions-error" ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-slate-800 space-y-4 shadow-sm" id="admin-permissions-error-card">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h3 className="font-bold text-slate-950 text-base font-sans">Firebase Ruxsatnomasi Cheklangan (Permission Denied)</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Sizning shaxsiy <code className="bg-amber-100/60 px-1 py-0.5 rounded text-amber-800 font-mono">jizpistartup</code> Firebase loyihangiz xavfsizlik qoidalari (Security Rules) ma'lumotlarni o'qishga ruxsat bermayapti. Shu sababli arizalar ro'yxatini yuklab bo'lmadi.
              </p>
            </div>
          </div>

          <div className="bg-white border border-amber-100 rounded-xl p-5 space-y-3 text-xs leading-relaxed max-w-2xl">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">MUAMMONI TO'G'RILASH QADAMLARI:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
              <li>
                <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-bold">
                  Firebase Console
                </a> sahifasiga kiring va <span className="font-bold text-slate-900">jizpistartup</span> loyihangizni oching.
              </li>
              <li>
                Chap tomondagi menudan <span className="font-bold text-slate-900">Firestore Database</span> bo'limiga o'ting va yuqoridagi <span className="font-bold text-slate-900">Rules</span> tabini bosing.
              </li>
              <li>
                Qoidalarni quyidagi holatga o'zgartiring va <span className="font-bold text-slate-900">Publish</span> qiling:
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg mt-1.5 overflow-x-auto font-mono text-[11px] leading-normal text-left">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /startup_applications/{document} {
      allow read, write: if true;
    }
  }
}`}
                </pre>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("use_sandbox_db", "true");
                window.location.reload();
              }}
              className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-200 text-center"
            >
              Tizimning Sandbox bazasidan foydalanish (Tavsiya etiladi)
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all text-center"
            >
              Sahifani qayta yuklash
            </button>
          </div>
        </div>
      ) : queryError ? (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 text-sm font-semibold">
          Xatolik yuz berdi: {queryError}
        </div>
      ) : null}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-summary-grid">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JAMI ARIZALAR</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCount} ta</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TASDIQLANGAN</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{approvedCount} ta</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KUTILAYOTGAN</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{pendingCount} ta</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-700">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RAD ETILGAN</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{rejectedCount} ta</div>
          </div>
        </div>
      </div>

      {/* Main Grid: List and Detail Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Filter and List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-3.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Jamoa nomi, sardor yoki hudud bo'yicha qidiruv..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all text-slate-900"
                />
              </div>

              {/* Status Filter buttons */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${statusFilter === "pending" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Kutilayotgan
                </button>
                <button
                  onClick={() => setStatusFilter("approved")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${statusFilter === "approved" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Tasdiqlangan
                </button>
                <button
                  onClick={() => setStatusFilter("rejected")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${statusFilter === "rejected" ? "bg-rose-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Rad etilgan
                </button>
              </div>
            </div>
          </div>

          {/* List items */}
          <div className="space-y-3" id="applications-list">
            {loading ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <span className="text-slate-500 text-sm font-semibold">Ma'lumotlar yuklanmoqda...</span>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <span className="text-slate-500 text-sm font-semibold">Hech qanday ariza topilmadi</span>
              </div>
            ) : (
              filteredApps.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`bg-white p-5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                      isSelected ? "border-blue-500 ring-2 ring-blue-500/10 shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors font-sans">
                          {app.teamName}
                        </h3>
                        {app.status === "approved" && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase rounded">
                            Tasdiqlandi
                          </span>
                        )}
                        {app.status === "rejected" && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold uppercase rounded">
                            Rad etildi
                          </span>
                        )}
                        {app.status === "pending" && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold uppercase rounded animate-pulse">
                            Kutilmoqda
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Sardor: {app.applicantName} ({app.teamSize} kishi)
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {app.residenceRegion}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(app.createdAt).toLocaleDateString("uz-UZ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
                        title="Batafsil ko'rish"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadIndividualTeamPDF(app);
                        }}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        title="PDF yuklab olish"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (app.id) handleDelete(app.id);
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Viewer */}
        <div className="lg:col-span-5">
          {selectedApp ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-4" id="detailed-viewer">
              {/* Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TANLANGAN JAMOA</span>
                  <h2 className="text-lg font-black text-slate-900 mt-0.5">{selectedApp.teamName}</h2>
                  <p className="text-xs text-slate-500 mt-1">Sana: {new Date(selectedApp.createdAt).toLocaleString("uz-UZ")}</p>
                </div>
                <button
                  onClick={() => downloadIndividualTeamPDF(selectedApp)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shrink-0 shadow-md"
                >
                  <FileDown className="w-3.5 h-3.5" /> PDF
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                {/* General Information */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">SARDOR MA'LUMOTLARI</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">To'liq ism-sharif</div>
                        <div className="text-sm font-semibold text-slate-900">{selectedApp.applicantName}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Yashash manzili</div>
                        <div className="text-sm font-semibold text-slate-900">
                          {selectedApp.residenceRegion}, {selectedApp.residenceCityDistrict}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Bandligi / O'qish joyi</div>
                        <div className="text-sm font-semibold text-slate-900">{selectedApp.applicantOccupation}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Summary */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">LOYIHA MAZMUNI</h3>
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-800 whitespace-pre-line border border-slate-200/60 leading-relaxed font-medium">
                    {selectedApp.projectSummary}
                  </div>
                </div>

                {/* Team Members List */}
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    JAMOA A'ZOLARI ({selectedApp.members.length} KISHI)
                  </h3>
                  <div className="space-y-2">
                    {selectedApp.members.map((member, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{member.fullName}</span>
                          <span className="text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold uppercase">A'zo {i + 1}</span>
                        </div>
                        <div className="text-xs text-slate-500">Tel: <span className="text-slate-800 font-semibold">{member.phone}</span></div>
                        <div className="text-xs text-slate-500">Ish/O'qish: <span className="text-slate-800 font-medium">{member.occupation}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  ARIZA STATUSINI O'ZGARTIRISH
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id!, "approved")}
                    disabled={selectedApp.status === "approved"}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-md transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tasdiqlash
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id!, "rejected")}
                    disabled={selectedApp.status === "rejected"}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-md transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Rad etish
                  </button>
                </div>
                {selectedApp.status !== "pending" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id!, "pending")}
                    className="w-full text-center text-xs text-blue-700 hover:text-blue-900 font-bold transition-all"
                  >
                    Ko'rib chiqilmoqda holatiga qaytarish
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-12 border border-dashed border-slate-200 text-center sticky top-4 flex flex-col items-center justify-center min-h-[300px]">
              <Eye className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">BATAFSIL MA'LUMOT</p>
              <p className="text-slate-400 text-xs mt-1 leading-normal max-w-xs mx-auto">
                Batafsil ma'lumotlarni ko'rish va boshqarish uchun chap tomondagi ro'yxatdan biror jamoani tanlang.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
