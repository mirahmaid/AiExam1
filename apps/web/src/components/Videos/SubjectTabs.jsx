import { motion } from "framer-motion";

import { TONES } from "./Data";

/* =====================================================
   تبويبات المواد: الخلفية الملونة بتنزلق للمادة المختارة
   (flex-wrap: بدون سكرول أفقي)
===================================================== */

export default function SubjectTabs({ subjects, activeId, onSelect, reduce }) {
  return (
    <div role="tablist" aria-label="مواد الفرع" className="flex flex-wrap gap-2.5">
      {subjects.map((s, i) => {
        const tone = TONES[i % TONES.length];
        const active = String(s.id) === String(activeId);

        return (
          <motion.button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(s)}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 + i * 0.06 }}
            whileHover={reduce ? undefined : { y: -3 }}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            className={`group relative flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-[15px] font-black transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 ${
              active ? "" : "border-[#0F2A4A]/10 bg-white hover:border-[#0F2A4A]/30"
            }`}
            style={{
              borderColor: active ? tone.color : undefined,
              color: active ? "#0B1F3A" : "#475569",
              "--tw-ring-color": `${tone.color}66`,
            }}
          >
            {active && (
              <motion.span
                layoutId="subject-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{ background: tone.color, boxShadow: `0 14px 26px -12px ${tone.color}` }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {/* نقطة بلون المادة: بتكبر لما تمرري عليها */}
            <span
              aria-hidden="true"
              className="relative h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-150"
              style={{ background: active ? "#0B1F3A" : tone.color }}
            />
            <span className="relative">{s.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}