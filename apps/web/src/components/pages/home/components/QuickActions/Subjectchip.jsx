import { motion } from "framer-motion";
import { ArrowUpLeft } from "lucide-react";

const THEMES = [
  { c: "#2DD4BF", d: "#0F8B78", s: "#E6F8F2" },
  { c: "#60A5FA", d: "#2F6FDB", s: "#E7F1FF" },
  { c: "#A78BFA", d: "#6D4AFF", s: "#F0EBFF" },
  { c: "#FBBF24", d: "#B77900", s: "#FFF3D1" },
  { c: "#FB7185", d: "#BE3B55", s: "#FFF0F3" },
];

export default function SubjectChip({ subject, index, onClick, reduce }) {
  const t = THEMES[index % THEMES.length];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduce ? false : { opacity: 0, x: 18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-[#0F2A4A]/8 bg-[#F7FAFC] p-2.5 text-right transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--s)] hover:shadow-[0_14px_26px_-18px_var(--c)] focus-visible:outline-none focus-visible:ring-4"
      style={{ "--c": t.c, "--d": t.d, "--s": t.s, "--tw-ring-color": `${t.c}66` }}
    >
      {/* شريط ملوّن ينمو من الحافة */}
      <span
        aria-hidden="true"
        className="absolute bottom-2 right-0 top-2 w-1 origin-center scale-y-0 rounded-full bg-[var(--c)] transition-transform duration-300 group-hover:scale-y-100"
      />

      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-colors duration-300">
        <img
          src={subject.icon}
          alt=""
          className="h-8 w-8 object-contain transition-transform duration-500 ease-[cubic-bezier(.3,1.8,.5,1)] group-hover:-rotate-12 group-hover:scale-125"
        />
      </span>

      <span className="min-w-0 flex-1 truncate text-[14px] font-extrabold text-[#0F2A4A]">
        {subject.title}
      </span>

      <ArrowUpLeft
        size={15}
        aria-hidden="true"
        className="shrink-0 text-[#CBD5E1] transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-[var(--d)]"
      />
    </motion.button>
  );
}