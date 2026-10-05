import { BookOpen, Check, Lock } from "lucide-react";

// لون واحد لكل الكتب (نفس تيل وكحلي الموقع) عشان يكون فيه تناسق
export const BOOK_THEME = { color: "#2DD4BF", deep: "#0F8B78" };

/* =====================================================
   صف كتاب في قائمة "كل الكتب": كعب صغير + الاسم
===================================================== */

export default function BookSpine({ book, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="flex items-center gap-2.5 rounded-2xl border-2 px-2.5 py-2 text-right transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2DD4BF]/40"
      style={{
        borderColor: active ? BOOK_THEME.color : "rgba(15,42,74,0.10)",
        background: active ? "#E6F8F2" : "#fff",
      }}
    >
      <span className="relative flex h-11 w-8 shrink-0 items-center justify-center rounded-l-[3px] rounded-r-[5px] bg-gradient-to-br from-[#0F2A4A] to-[#1B4570] text-[#2DD4BF]">
        <span aria-hidden="true" className="absolute inset-y-0 right-0 w-1.5 rounded-r-[5px] bg-[#2DD4BF]" />
        {book.hasBook ? <BookOpen size={13} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
      </span>

      <span className="min-w-0 flex-1 truncate text-[14px] font-black text-[#0F2A4A]">{book.title}</span>

      {active && <Check size={16} strokeWidth={3} aria-hidden="true" className="shrink-0 text-[#0F8B78]" />}
    </button>
  );
}