// Sidebar.jsx — القائمة الجانبية (شمال، متل الفيجما): سهم الطي + محادثة جديدة + نافيجيشن + المحادثات الأخيرة
import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, ClipboardList, ListChecks, MessageSquarePlus, MessageSquare } from "lucide-react";
import SubjectMenu from "./SubjectMenu";

function formatSessionDate(s) {
  const iso = s.messages?.[0]?.createdAt;
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}

export default function Sidebar({
  subjects,
  subjectsLoading,
  activeSubjectId,
  onPickSubject,
  loadingSession,
  sessions,
  activeSessionId,
  onViewSession,
  collapsed = false,
  onToggleCollapse, // مرّرها فقط بالديسكتوب؛ الموبايل عندها زر إغلاق منفصل بالأب
}) {
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);

  function handlePick(id) {
    setSubjectMenuOpen(false);
    onPickSubject(id);
  }

  return (
    <div className="flex h-full flex-col">
      {onToggleCollapse && (
        <div className="flex justify-start p-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "إظهار القائمة الجانبية" : "إخفاء القائمة الجانبية"}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#12897A]"
          >
            {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      )}

      <div className="px-3">
        <button
          type="button"
          onClick={() => setSubjectMenuOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#12897A] px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#12897A]/20 transition-colors hover:bg-[#0f7566]"
        >
          <MessageSquarePlus size={17} />
          محادثة جديدة
        </button>

        {subjectMenuOpen && (
          <div className="mt-2 rounded-2xl border border-slate-100 bg-white shadow-sm">
            <SubjectMenu
              subjects={subjects}
              loading={subjectsLoading}
              activeSubjectId={activeSubjectId}
              onPick={handlePick}
              disabled={loadingSession}
            />
          </div>
        )}
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-3">
        <NavItem
          icon={<BookOpen size={17} />}
          label="المواد الدراسية"
          active={subjectMenuOpen}
          onClick={() => setSubjectMenuOpen((v) => !v)}
        />
        {/* ⚠️ ماكو حالياً endpoint للاختبارات السابقة/الكويزات — حطيتهم كـplaceholders حسب شكل الفيجما */}
        <NavItem icon={<ClipboardList size={17} />} label="الاختبارات السابقة" />
        <NavItem icon={<ListChecks size={17} />} label="الكويزات" />
      </nav>

      <div className="mt-5 flex-1 overflow-y-auto px-3 pb-3">
        <p className="mb-2 px-1 text-xs font-semibold text-slate-400">المحادثات الأخيرة</p>
        {sessions.length === 0 ? (
          <p className="px-1 text-xs text-slate-400">لا توجد محادثات بعد</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onViewSession(s.id)}
                  className={`flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-right transition-colors ${
                    activeSessionId === s.id ? "bg-[#12897A]/[0.08] text-[#12897A]" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare size={15} className="mt-0.5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold">{s.subject.name}</span>
                      {!s.isActive && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-400">مغلقة</span>
                      )}
                    </span>
                    {formatSessionDate(s) && <span className="block text-[10px] text-slate-400">{formatSessionDate(s)}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-right text-sm font-semibold transition-colors ${
        active ? "bg-[#12897A]/[0.08] text-[#12897A]" : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}