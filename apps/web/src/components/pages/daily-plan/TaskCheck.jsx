import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

const COLORS = ["#2DD4BF", "#FBBF24", "#A78BFA", "#FB7185"];
const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  x: Math.cos((i / 8) * Math.PI * 2) * 28,
  y: Math.sin((i / 8) * Math.PI * 2) * 28,
  color: COLORS[i % COLORS.length],
}));

// زر إكمال: علامة صح بنبضة + انفجار جزيئات صغيرة
export default function TaskCheck({ done, onToggle, label }) {
  const [burst, setBurst] = useState(0);

  function click() {
    if (!done) setBurst((b) => b + 1);
    onToggle();
  }

  return (
    <motion.button
      type="button"
      onClick={click}
      aria-pressed={done}
      aria-label={label}
      whileTap={{ scale: 0.8 }}
      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        done ? "border-[#0F8B78] bg-[#0F8B78] text-white" : "border-slate-300 bg-white hover:border-[#0F8B78]"
      }`}
    >
      <AnimatePresence initial={false}>
        {done && (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 16 }}
            className="flex"
          >
            <Check size={16} strokeWidth={3.5} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>

      {burst > 0 &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={`${burst}-${i}`}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full"
            style={{ background: p.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
    </motion.button>
  );
}