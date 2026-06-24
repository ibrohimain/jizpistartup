import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { TeamMember, StartupApplication } from "../types";
import { Plus, Trash2, Send, CheckCircle, MapPin, Briefcase, GraduationCap, Users, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { handleFirestoreError, OperationType } from "../utils/firestoreError";

const UZ_REGIONS = [
  "Jizzax viloyati",
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Sirdaryo viloyati",
  "Andijon viloyati",
  "Farg'ona viloyati",
  "Namangan viloyati",
  "Buxoro viloyati",
  "Navoiy viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Xorazm viloyati",
  "Qoraqalpog'iston Respublikasi"
];

export default function ApplicationForm() {
  const [applicantName, setApplicantName] = useState("");
  const [residenceRegion, setResidenceRegion] = useState("Jizzax viloyati");
  const [residenceCityDistrict, setResidenceCityDistrict] = useState("");
  const [applicantOccupation, setApplicantOccupation] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [members, setMembers] = useState<TeamMember[]>([
    { fullName: "", phone: "", occupation: "" }
  ]);
  const [projectSummary, setProjectSummary] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Handle member size change
  const handleTeamSizeChange = (size: number) => {
    const validSize = Math.max(1, Math.min(20, size));
    setTeamSize(validSize);
    
    setMembers(prev => {
      const updated = [...prev];
      if (validSize > updated.length) {
        // Add elements
        for (let i = updated.length; i < validSize; i++) {
          updated.push({ fullName: "", phone: "", occupation: "" });
        }
      } else if (validSize < updated.length) {
        // Truncate elements
        return updated.slice(0, validSize);
      }
      return updated;
    });
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    setMembers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddMember = () => {
    if (teamSize >= 20) return;
    const newSize = teamSize + 1;
    setTeamSize(newSize);
    setMembers(prev => [...prev, { fullName: "", phone: "", occupation: "" }]);
  };

  const handleRemoveMember = (index: number) => {
    if (teamSize <= 1) return;
    setTeamSize(prev => prev - 1);
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!applicantName.trim()) {
      setError("Iltimos, ism va familiyangizni kiriting.");
      return;
    }
    if (!residenceCityDistrict.trim()) {
      setError("Iltimos, yashaydigan shahar yoki tumaningizni yozing.");
      return;
    }
    if (!applicantOccupation.trim()) {
      setError("Iltimos, ish joyingiz yoki o'qish manzilingizni kiriting (ishsiz bo'lsangiz 'Ishsiz' deb yozing).");
      return;
    }
    if (!teamName.trim()) {
      setError("Iltimos, StartUp jamoangiz nomini kiriting.");
      return;
    }
    if (!projectSummary.trim()) {
      setError("Iltimos, StartUp loyihangizning qisqacha mazmunini yozing.");
      return;
    }

    // Check members
    for (let i = 0; i < members.length; i++) {
      if (!members[i].fullName.trim()) {
        setError(`Iltimos, ${i + 1}-a'zoning ism va familiyasini kiriting.`);
        return;
      }
      if (!members[i].phone.trim()) {
        setError(`Iltimos, ${i + 1}-a'zoning telefon raqamini kiriting.`);
        return;
      }
      if (!members[i].occupation.trim()) {
        setError(`Iltimos, ${i + 1}-a'zoning ish yoki o'qish manzili (yoki ishsiz) deb yozing.`);
        return;
      }
    }

    setLoading(true);

    try {
      const applicationData: Omit<StartupApplication, "id"> = {
        applicantName,
        residenceRegion,
        residenceCityDistrict,
        applicantOccupation,
        teamName,
        teamSize,
        members,
        projectSummary,
        status: "pending",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "startup_applications"), applicationData);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error sending application: ", err);
      if (err.code === "permission-denied" || (err.message && err.message.toLowerCase().includes("permission"))) {
        setError("firebase-permissions-error");
      } else {
        setError("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring yoki internetingizni tekshiring.");
      }
      handleFirestoreError(err, OperationType.WRITE, "startup_applications");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setApplicantName("");
    setResidenceRegion("Jizzax viloyati");
    setResidenceCityDistrict("");
    setApplicantOccupation("");
    setTeamName("");
    setTeamSize(1);
    setMembers([{ fullName: "", phone: "", occupation: "" }]);
    setProjectSummary("");
    setSuccess(false);
    setError("");
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto my-8 bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 text-center"
        id="success-panel"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-emerald-50 rounded-full text-emerald-500">
            <CheckCircle className="w-16 h-16 animate-bounce" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4 font-sans tracking-tight">
          Ariza muvaffaqiyatli yuborildi!
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sizning JizPi StartUp Ligasida ishtirok etish uchun yuborgan arizangiz qabul qilindi. 
          Tez orada adminlarimiz arizangizni ko'rib chiqib, siz bilan bog'lanishadi.
        </p>
        
        <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Yuborilgan ma'lumotlar:</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div><span className="font-semibold">Jamoa nomi:</span> {teamName}</div>
            <div><span className="font-semibold">Sardor:</span> {applicantName}</div>
            <div><span className="font-semibold">A'zolar soni:</span> {teamSize} nafar</div>
            <div className="line-clamp-2"><span className="font-semibold">Loyiha mazmuni:</span> {projectSummary}</div>
          </div>
        </div>

        <button
          onClick={handleResetForm}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md transition duration-200"
          id="btn-register-another"
        >
          Yangi ariza yuborish
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-4" id="form-container">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Sleek Theme Form Title Section */}
        <div className="bg-blue-900 text-white p-8 relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Users className="w-48 h-48" />
          </div>
          <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-wider">
            RO'YXATDAN O'TISH
          </span>
          <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
            <h1 className="text-3xl font-black font-sans tracking-tight">
              StartUp Ligasi Arizasi
            </h1>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                localStorage.getItem("use_sandbox_db") !== "false"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                {localStorage.getItem("use_sandbox_db") !== "false" ? "Sandbox Baza (Sinov)" : "Shaxsiy Firebase (jizpistartup)"}
              </span>
              {localStorage.getItem("use_sandbox_db") !== "false" ? (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("use_sandbox_db", "false");
                    window.location.reload();
                  }}
                  className="text-[10px] text-blue-200 hover:text-white underline font-bold"
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
                  className="text-[10px] text-blue-200 hover:text-white underline font-bold"
                >
                  Sandboxga o'tish
                </button>
              )}
            </div>
          </div>
          <p className="text-blue-200 mt-2 text-sm max-w-xl">
            JizPi StartUp ligasida ishtirok etish uchun jamoangiz va loyihangiz haqidagi ma'lumotlarni to'ldiring. 
            Ma'lumotlar to'g'ri to'ldirilganligini qayta tekshiring.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8" id="startup-registration-form">
          {error === "firebase-permissions-error" ? (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-slate-800 space-y-4" id="permissions-error-card">
              <div className="flex items-start gap-3">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-950 font-sans text-sm">Firebase Ruxsatnomasi Xatoligi (Permission Denied)</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Siz o'rnatgan shaxsiy <code className="bg-amber-100/60 px-1 py-0.5 rounded text-amber-800 font-mono">jizpistartup</code> Firebase loyihasi xavfsizlik qoidalari (Security Rules) ma'lumot yozishga ruxsat bermayapti.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-amber-100 rounded-xl p-4 space-y-3 text-xs leading-relaxed">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">MUAMMONI TO'G'RILASH QADAMLARI:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
                  <li>
                    <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-bold">
                      Firebase Console
                    </a> sahifasiga kiring va <span className="font-bold text-slate-900">jizpistartup</span> loyihasini tanlang.
                  </li>
                  <li>
                    Chap tomondagi menudan <span className="font-bold text-slate-900">Firestore Database</span> bo'limiga o'ting va yuqoridagi <span className="font-bold text-slate-900">Rules</span> tabini bosing.
                  </li>
                  <li>
                    Mavjud qoidalarni quyidagi qoidalarga almashtiring va <span className="font-bold text-slate-900">Publish</span> tugmasini bosing:
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
                  className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-200 text-center"
                >
                  Tizimning Sandbox bazasidan foydalanish (Tavsiya etiladi)
                </button>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all text-center"
                >
                  Qayta urinish
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              {error}
            </div>
          ) : null}

          {/* Section 1: Sardor Ma'lumotlari */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
              <h2 className="text-sm font-bold text-blue-800 uppercase tracking-wider">1. Jamoa Sardori (Ariza topshiruvchi)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5" htmlFor="applicant-name">
                  Ism va Familiyangiz <span className="text-rose-500">*</span>
                </label>
                <input
                  id="applicant-name"
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Sardor Alimov"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5" htmlFor="applicant-occupation">
                  Ish joyingiz yoki o'qish manzilingiz <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="applicant-occupation"
                    type="text"
                    value={applicantOccupation}
                    onChange={(e) => setApplicantOccupation(e.target.value)}
                    placeholder="JizPi talabasi / Ishsiz"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all text-slate-900 pr-24"
                  />
                  <div className="absolute right-2 top-2.5 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setApplicantOccupation("Ishsiz")}
                      className="text-[10px] px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold transition"
                    >
                      Ishsiz
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplicantOccupation("JizPi Talabasi")}
                      className="text-[10px] px-1.5 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-bold transition"
                    >
                      JizPi
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5" htmlFor="residence-region">
                  Yashaydigan viloyatingiz <span className="text-rose-500">*</span>
                </label>
                <select
                  id="residence-region"
                  value={residenceRegion}
                  onChange={(e) => setResidenceRegion(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all text-slate-900"
                >
                  {UZ_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5" htmlFor="residence-city">
                  Shahar, tuman va mahalla nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  id="residence-city"
                  type="text"
                  value={residenceCityDistrict}
                  onChange={(e) => setResidenceCityDistrict(e.target.value)}
                  placeholder="Jizzax shahri, Ittifoq mfy"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Jamoa va Loyiha ma'lumotlari */}
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
              <h2 className="text-sm font-bold text-blue-800 uppercase tracking-wider">2. StartUp Jamoasi va Loyihasi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5" htmlFor="team-name">
                  StartUp jamoasining nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  id="team-name"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="RoboTech Jamoasi"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5" htmlFor="team-size">
                  StartUp jamoasidagi a'zolar soni <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleTeamSizeChange(teamSize - 1)}
                    disabled={teamSize <= 1}
                    className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-bold"
                  >
                    -
                  </button>
                  <input
                    id="team-size"
                    type="number"
                    min="1"
                    max="20"
                    value={teamSize}
                    onChange={(e) => handleTeamSizeChange(parseInt(e.target.value) || 1)}
                    className="w-16 h-10 text-center rounded-lg border border-slate-200 font-bold bg-slate-50 text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleTeamSizeChange(teamSize + 1)}
                    disabled={teamSize >= 20}
                    className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-bold"
                  >
                    +
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">A'zolar shakli avtomatik moslashadi</span>
                </div>
              </div>
            </div>

            {/* Dynamic Members Section */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Jamoa a'zolari haqida ma'lumot ({members.length} ta)
                </h3>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="flex items-center gap-1 text-[11px] px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" /> A'zo qo'shish
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {members.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group"
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {index + 1}-A'zo
                        </span>
                        {members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(index)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition"
                            title="A'zoni o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Ism va Familiyasi <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.fullName}
                            onChange={(e) => handleMemberChange(index, "fullName", e.target.value)}
                            placeholder="Dilshod Rahimov"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Telefon raqami <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.phone}
                            onChange={(e) => handleMemberChange(index, "phone", e.target.value)}
                            placeholder="+998 (90) 123-45-67"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Ish yoki o'qish manzili <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.occupation}
                            onChange={(e) => handleMemberChange(index, "occupation", e.target.value)}
                            placeholder="JizPi talabasi / yoki Ishsiz"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 text-slate-900"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5" htmlFor="project-summary">
                StartUp loyihasining qisqacha mazmuni <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="project-summary"
                rows={4}
                value={projectSummary}
                onChange={(e) => setProjectSummary(e.target.value)}
                placeholder="Loyihangiz nima haqida, qanday muammoni hal qiladi va uning asosiy afzalliklari nimada? Batafsil bayon eting..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all text-slate-900"
              ></textarea>
            </div>
          </div>

          {/* Form Submit Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
              id="btn-submit-application"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Yuborilmoqda...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Arizani yuborish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
