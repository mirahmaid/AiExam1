import { motion, useReducedMotion } from "framer-motion";
import { Check, Flame } from "lucide-react";

export default function WeekStrip({ week, streak }) {
  const reduce = useReducedMotion();

  return (
    <section className="rounded-[30px] bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-[16px] font-black text-[#0F2A4A]">أسبوعك</h2>

        {streak > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-black text-amber-600">
            <motion.span
              aria-hidden="true"
              animate={reduce ? undefined : { rotate: [0, -12, 10, -6, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4 }}
              className="inline-flex origin-bottom"
            >
              <Flame size={14} />
            </motion.span>
            {streak} {streak === 1 ? "يوم" : "أيام"} متتالية
          </span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {week.map((d, i) => (
          <motion.div
            key={d.key}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 220, damping: 18 }}
            whileHover={reduce ? undefined : { y: -5 }}
            className={`relative flex cursor-default flex-col items-center gap-1 rounded-2xl py-3 text-center transition-colors ${
              d.isToday
                ? "bg-[#0F2A4A] text-white shadow-[0_18px_35px_-20px_rgba(15,42,74,.9)]"
                : d.active
                  ? "bg-[#E8F7F3] text-[#0F8B78]"
                  : "bg-[#F7FAFC] text-slate-400 hover:bg-white"
            }`}
          >
            {d.isToday && !reduce && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-[#2DD4BF]"
                animate={{ opacity: [0.7, 0, 0.7], scale: [1, 1.14, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            <span className="text-[11px] font-bold">{d.label}</span>
            <span className="text-[17px] font-black">{d.num}</span>

            {d.active ? (
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  d.isToday ? "bg-[#2DD4BF] text-[#0F2A4A]" : "bg-[#0F8B78] text-white"
                }`}
              >
                <Check size={10} strokeWidth={4} aria-hidden="true" />
              </span>
            ) : (
              <span className={`h-1.5 w-1.5 rounded-full ${d.isToday ? "bg-white/30" : "bg-slate-200"}`} />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}