import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeft } from "lucide-react";

/* =====================================================
   دائرة سهم على الخط الفاصل بين الكتاب والأداة (يمين ← يسار)
   بتتلوّن بلون الأداة المختارة. بتتحط جوّا العمود الأيسر (relative)
===================================================== */

export default function StudyHubBridge({ tool }) {
  const reduce = useReducedMotion();
  const color = tool?.color ?? "#2DD4BF";

  return (
    <span
      aria-hidden="true"
      className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 lg:left-auto lg:right-0 lg:top-1/2 lg:translate-x-1/2"
    >
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 bg-white transition-colors duration-500"
        style={{ borderColor: color, color }}
      >
        <ArrowDown size={19} strokeWidth={2.6} className="lg:hidden" />
        <ArrowLeft size={19} strokeWidth={2.6} className="hidden lg:block" />
      </span>
    </span>
  );
}