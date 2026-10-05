import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

/* =====================================================
   بطاقة أداة: نفس لغة بطاقات المواد في HomeHero
   (أبيض + أيقونة ملونة + علامة صح عند الاختيار)
===================================================== */

export default function AiToolButton({ tool, active, onSelect, reduce }) {
  const Icon = tool.icon;

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      whileHover={reduce ? undefined : { y: -3 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      className="relative flex flex-col items-center gap-2 rounded-[20px] border-2 px-2 py-4 text-center transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-4"
      style={{
        borderColor: active ? tool.color : "rgba(15,42,74,0.10)",
        background: active ? `${tool.color}1F` : "#fff",
        boxShadow: active ? `0 16px 28px -16px ${tool.color}` : "0 10px 24px -20px rgba(15,42,74,0.5)",
        "--tw-ring-color": `${tool.color}66`,
      }}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300"
        style={{
          background: active ? tool.color : `${tool.color}26`,
          color: active ? "#0B1F3A" : tool.deep,
        }}
      >
        <Icon size={23} strokeWidth={2.3} aria-hidden="true" />
      </span>

      <span className="text-[14px] font-black text-[#0F2A4A]">{tool.chip}</span>

      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 16 }}
            className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-white"
            style={{ background: tool.deep }}
          >
            <Check size={12} strokeWidth={3.5} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}