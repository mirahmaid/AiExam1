import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AiToolButton from "./AiToolButton";
import { AI_TOOLS } from "./aiTools";

export { AI_TOOLS };

/* =====================================================
   الخطوة ٢ (يسار): مسار AI
   ست أدوات واضحة، تحتها شرح الأداة المختارة ومثال، وزر ابدأ
===================================================== */

export default function AiStudyLab({ book, onToolChange }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [activeId, setActiveId] = useState(AI_TOOLS[0].id);
  const active = AI_TOOLS.find((tool) => tool.id === activeId) ?? AI_TOOLS[0];
  const Icon = active.icon;
  const bookName = book ? `كتاب ${book.title}` : "كتابك";

  useEffect(() => {
    onToolChange?.(active);
  }, [active, onToolChange]);

  const goAi = () => {
    if (!book) return;
    navigate("/ai-path", {
      state: { tool: activeId, subjectId: book.id, subjectTitle: book.title },
    });
  };

  return (
    <div id="ai-study-panel" dir="rtl" className="relative flex h-full flex-col p-5 sm:p-6">
      {/* خط علوي + توهج خفيف بلون الأداة */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: "linear-gradient(90deg,#A78BFA,#60A5FA,#2DD4BF)" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.span
          className="absolute -left-20 -top-24 h-64 w-64 rounded-full blur-3xl"
          initial={false}
          animate={{ backgroundColor: active.color, opacity: 0.18 }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* ============ العنوان ============ */}
      <div className="relative flex items-center gap-3.5">
        <motion.span
          initial={false}
          animate={{ backgroundColor: active.color }}
          transition={{ duration: 0.5 }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[19px] font-black text-[#0B1F3A]"
        >
          ٢
        </motion.span>
        <div className="min-w-0">
          <h2 className="text-[22px] font-black text-[#0F2A4A] sm:text-[24px]">اختر أداة مسار AI</h2>
          <p className="truncate text-[14px] font-bold text-[#475569]">
            {book ? `بتشتغل على ${bookName}` : "اختر كتابك أولاً من القائمة"}
          </p>
        </div>
      </div>

      {/* ============ الأدوات ============ */}
      <div role="group" aria-label="أدوات الذكاء الاصطناعي" className="relative mt-5 grid grid-cols-3 gap-2.5">
        {AI_TOOLS.map((tool) => (
          <AiToolButton
            key={tool.id}
            tool={tool}
            active={tool.id === activeId}
            reduce={reduce}
            onSelect={() => setActiveId(tool.id)}
          />
        ))}
      </div>

      {/* ============ شرح الأداة المختارة ============ */}
      <div
        className="relative mt-4 rounded-2xl border p-4 transition-colors duration-500"
        style={{ background: `${active.color}14`, borderColor: `${active.color}50` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            aria-live="polite"
          >
            <p className="flex items-center gap-2 text-[16px] font-black" style={{ color: active.deep }}>
              <Icon size={18} aria-hidden="true" />
              {active.title}
            </p>
            <p className="mt-1 text-[14px] font-medium leading-7 text-[#334155]">{active.description}</p>
            <p className="mt-2 text-[13px] font-bold text-[#475569]">مثال: «{active.demo(bookName).you}»</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ============ ابدأ ============ */}
      <motion.button
        type="button"
        onClick={goAi}
        disabled={!book}
        whileHover={reduce || !book ? undefined : { scale: 1.02 }}
        whileTap={reduce || !book ? undefined : { scale: 0.97 }}
        className="group relative mt-auto flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[16px] font-black text-[#0B1F3A] transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#64748B]"
        style={
          book
            ? { background: active.color, boxShadow: `0 16px 30px -14px ${active.color}`, "--tw-ring-color": `${active.color}66` }
            : undefined
        }
      >
        {book ? `ابدأ ${active.title} على ${bookName}` : "اختر كتابك أولاً"}
        <ArrowLeft size={18} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1" />
      </motion.button>
    </div>
  );
}