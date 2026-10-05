import { useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["#2DD4BF", "#FBBF24", "#A78BFA", "#FB7185", "#60A5FA", "#9FF6E9"];

// احتفال يسقط من أعلى الشاشة (يُعرض فقط عند إنهاء خطة اليوم)
export default function Confetti({ count = 60 }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => {
      const round = i % 3 === 0;
      const size = 6 + Math.random() * 7;
      return {
        id: i,
        left: Math.random() * 100,
        drift: (Math.random() - 0.5) * 180,
        delay: Math.random() * 0.5,
        duration: 2.2 + Math.random() * 1.6,
        rotate: Math.random() * 720 - 360,
        width: size,
        height: round ? size : size * 0.5,
        color: COLORS[i % COLORS.length],
        round,
      };
    }),
  );

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute top-0 ${p.round ? "rounded-full" : "rounded-[2px]"}`}
          style={{ left: `${p.left}%`, width: p.width, height: p.height, background: p.color }}
          initial={{ y: "-5vh", x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: "105vh", x: p.drift, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}