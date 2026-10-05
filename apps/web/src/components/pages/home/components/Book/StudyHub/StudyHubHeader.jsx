import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

// كل كلمة بتنزلق من تحت قناع (نفس عنوان HomeHero)
const WORDS = ["حمّل", "كتابك،", "وخلّي", "AI", "يذاكر", "معك"];
const AI_INDEX = 3;

export default function StudyHubHeader({ tool }) {
  const reduce = useReducedMotion();
  const color = tool?.color ?? "#2DD4BF";
  const deep = tool?.deep ?? "#6D4AFF";

  return (
    <div dir="rtl" className="mb-6">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2DD4BF]/30 bg-white px-4 py-2 shadow-[0_8px_25px_-15px_rgba(15,42,74,0.25)]"
      >
        <Sparkles size={15} className="text-[#0F8B78]" aria-hidden="true" />
        <span className="text-[13px] font-bold text-[#0F8B78]">مساحة الدراسة</span>
      </motion.div>

      <h2 className="flex flex-wrap gap-x-3 text-[30px] font-black leading-[1.3] text-[#0F2A4A] sm:text-[36px] md:text-[42px]">
        {WORDS.map((w, i) => (
          <span key={w} className="block overflow-hidden pb-1.5">
            <motion.span
              initial={reduce ? false : { y: "115%", rotate: 6 }}
              whileInView={{ y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.1 + i * 0.1 }}
              className="block"
            >
              {i === AI_INDEX ? (
                <motion.span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${deep}, ${color}, ${deep})`,
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                  }}
                  animate={reduce ? undefined : { backgroundPositionX: ["0%", "200%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  مسار AI
                </motion.span>
              ) : (
                w
              )}
            </motion.span>
          </span>
        ))}
      </h2>

      <svg viewBox="0 0 180 14" className="-mt-1 h-3.5 w-[190px]" aria-hidden="true">
        <motion.path
          d="M2 8 Q20 0 38 8 T74 8 T110 8 T146 8 T178 8"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          animate={{ stroke: color }}
          transition={{ pathLength: { duration: 0.9, delay: 0.6 }, stroke: { duration: 0.5 } }}
        />
      </svg>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
        className="mt-3 max-w-[560px] text-[17px] font-medium leading-8 text-[#334155]"
      >
        اختر كتابك من اليمين، ثم أداة الذكاء الاصطناعي من اليسار، واضغط ابدأ.
      </motion.p>
    </div>
  );
}