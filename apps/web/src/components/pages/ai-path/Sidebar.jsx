// Sidebar.jsx — لوحة كحلية: محادثة جديدة + نافيجيشن + خط زمني للمحادثات
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen, ClipboardList, ListChecks, MessageSquarePlus } from "lucide-react";
import SubjectMenu from "./SubjectMenu";

const sessionDate = (s) => {
  const iso = s.messages?.[0]?.createdAt;
  return iso ? new Date(iso).toLocaleDateString("ar-EG", { day: "numeric", month: "short" }) : "";
};

// tint: لون الأيقونة — to: رابط (وإلا زر عادي)
function NavItem({ icon, label, tint, active, onClick, to }) {
  const className = `group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-right text-[15px] font-black transition ${
    active ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5 hover:text-white"
  }`;
  const content = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" style={{ background: `${tint}26`, color: tint }}>
        {icon}
      </span>
      {label}
    </>
  );
  return to ? <Link to={to} className={className}>{content}</Link> : <button type="button" onClick={onClick} className={className}>{content}</button>;
}

export default function Sidebar({
  subjects, subjectsLoading, activeSubjectId, onPickSubject, loadingSession,
  sessions, activeSessionId, onViewSession, collapsed = false,
  onToggleCollapse, // مرّرها فقط بالديسكتوب؛ الموبايل عندها زر إغلاق منفصل بالأب
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((v) => !v);

  return (
    <div dir="rtl" className="relative flex h-full flex-col overflow-hidden bg-[#0F2A4A] font-[Cairo,Tajawal,system-ui,sans-serif] text-white">
      <span aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#2DD4BF]/15 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-[#A78BFA]/20 blur-3xl" />

      {onToggleCollapse && (
        <div className="relative flex justify-start p-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "إظهار القائمة الجانبية" : "إخفاء القائمة الجانبية"}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-[#9FF6E9]"
          >
            {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      )}

      <div className={`relative px-3 ${onToggleCollapse ? "" : "pt-14"}`}>
        <button
          type="button"
          onClick={toggleMenu}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#2DD4BF] px-4 py-3 text-[15px] font-black text-[#0F2A4A] shadow-[0_16px_30px_-14px_#2DD4BF] transition hover:-translate-y-0.5"
        >
          {/* لمعة بتمرق عالزر (نفس زر مسار التميز بالهيدر) */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <MessageSquarePlus size={18} className="relative transition-transform duration-300 group-hover:rotate-12" />
          <span className="relative">محادثة جديدة</span>
        </button>

        {menuOpen && (
          <div className="mt-2 rounded-2xl bg-white text-slate-700 shadow-xl">
            <SubjectMenu
              subjects={subjects}
              loading={subjectsLoading}
              activeSubjectId={activeSubjectId}
              onPick={(id) => { setMenuOpen(false); onPickSubject(id); }}
              disabled={loadingSession}
            />
          </div>
        )}
      </div>

      <nav className="relative mt-4 flex flex-col gap-1 px-3">
        <NavItem icon={<BookOpen size={17} />} tint="#2DD4BF" label="المواد الدراسية" active={menuOpen} onClick={toggleMenu} />
        <NavItem icon={<ClipboardList size={17} />} tint="#60A5FA" label="الاختبارات السابقة" to="/exams/archive" />
        <NavItem icon={<ListChecks size={17} />} tint="#A78BFA" label="الكويزات" to="/quizzes" />
      </nav>

      <div className="relative mt-5 flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:thin]">
        <p className="mb-3 flex items-center gap-2 px-1 text-[14px] font-black text-[#9FF6E9]">
          المحادثات الأخيرة
          {sessions.length > 0 && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/70">{sessions.length}</span>}
        </p>
        {sessions.length === 0 ? (
          <p className="px-1 text-[13px] font-semibold leading-6 text-white/70">اختر مادة وابدأ أول محادثة</p>
        ) : (
          <ul className="relative flex flex-col gap-1 pr-3">
            <span aria-hidden="true" className="absolute bottom-2 right-[5px] top-2 w-px bg-white/10" />
            {sessions.map((s) => {
              const on = activeSessionId === s.id;
              const date = sessionDate(s);
              return (
                <li key={s.id} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -right-3 top-4 h-[11px] w-[11px] rounded-full border-2 border-[#0F2A4A] transition ${on ? "scale-125 bg-[#2DD4BF] shadow-[0_0_12px_#2DD4BF]" : s.isActive ? "bg-[#60A5FA]" : "bg-white/25"}`}
                  />
                  <button
                    type="button"
                    onClick={() => onViewSession(s.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-right transition hover:-translate-x-0.5 ${on ? "bg-white/10" : "hover:bg-white/5"}`}
                  >
                    <span className="min-w-0">
                      <span className={`block truncate text-[14px] font-black ${on ? "text-[#9FF6E9]" : "text-white/90"}`}>{s.subject.name}</span>
                      {date && <span className="block text-[12px] font-medium text-white/60">{date}</span>}
                    </span>
                    {!s.isActive && <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/60">مغلقة</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}