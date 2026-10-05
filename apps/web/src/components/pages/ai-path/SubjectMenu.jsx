// SubjectMenu.jsx — اختيار المادة: قائمة (سايدبار/composer) + بطاقات مباشرة (الخطوة ١ بالشاشة الترحيبية)
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, ChevronLeft } from "lucide-react";

// ألوان البطاقات: نفس ألوان الموقع
const COLORS = [
  { color: "#2DD4BF", deep: "#0F8B78" },
  { color: "#60A5FA", deep: "#2563EB" },
  { color: "#A78BFA", deep: "#6D4AFF" },
  { color: "#FBBF24", deep: "#B45309" },
  { color: "#FB7185", deep: "#E11D48" },
];

// أيقونة مادة مع fallback إذا الصورة مفقودة أو مكسورة (استعملها مع key={src})
export function SubjectIcon({ src, className = "h-full w-full object-contain", size = 18 }) {
  const [bad, setBad] = useState(!src);
  if (bad) return <BookOpen size={size} className="text-[#0F8B78]" aria-hidden="true" />;
  return <img src={src} alt="" className={className} onError={() => setBad(true)} />;
}

// بطاقات المواد المعروضة مباشرة (الخطوة ١)
export function SubjectChips({ subjects, loading, onPick, disabled }) {
  const reduce = useReducedMotion();

  if (loading) {
    return (
      <div dir="rtl" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[62px] animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />)}
      </div>
    );
  }

  return (
    <div dir="rtl" className="grid grid-cols-2 gap-2.5 font-[Cairo,Tajawal,system-ui,sans-serif] sm:grid-cols-3">
      {subjects.map((s, i) => {
        const c = COLORS[i % COLORS.length];
        return (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => onPick(s.id)}
            disabled={disabled}
            initial={reduce ? false : { opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.25 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileHover={reduce || disabled ? undefined : { y: -4 }}
            whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
            className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border-2 bg-white p-2 text-right transition-shadow duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: `${c.color}66` }}
          >
            {/* تظليل + إطار بلون المادة عند الـ hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: `${c.color}1A`, boxShadow: `inset 0 0 0 2px ${c.color}` }}
            />
            <span
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
              style={{ background: `${c.color}2A` }}
            >
              <SubjectIcon key={s.icon} src={s.icon} size={20} className="h-6 w-6 object-contain" />
            </span>
            <span className="relative line-clamp-2 min-w-0 flex-1 text-[14px] font-black leading-5 text-[#0F2A4A]">{s.title}</span>
            <ChevronLeft
              size={16}
              strokeWidth={2.5}
              aria-hidden="true"
              className="relative shrink-0 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              style={{ color: c.deep }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

// القائمة الصغيرة (popover المحادثة + السايدبار)
export default function SubjectMenu({ subjects, loading, activeSubjectId, onPick, disabled }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 p-2.5">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-11 animate-pulse rounded-2xl bg-[#F7FAFC]" />)}
      </div>
    );
  }
  return (
    <div dir="rtl" className="grid grid-cols-2 gap-2 p-2.5 font-[Cairo,Tajawal,system-ui,sans-serif]">
      {subjects.map((s) => {
        const on = activeSubjectId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s.id)}
            disabled={disabled}
            aria-pressed={on}
            className={`flex items-center gap-2 rounded-2xl border-2 px-2.5 py-2 text-right text-[13px] font-black transition hover:-translate-y-0.5 disabled:opacity-60 ${
              on ? "border-[#2DD4BF] bg-[#E8F7F3] text-[#0F8B78]" : "border-slate-100 bg-white text-[#0F2A4A] hover:border-[#2DD4BF]/60"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F7FAFC]">
              <SubjectIcon key={s.icon} src={s.icon} size={16} className="h-5 w-5 object-contain" />
            </span>
            <span className="truncate">{s.title}</span>
          </button>
        );
      })}
    </div>
  );
}