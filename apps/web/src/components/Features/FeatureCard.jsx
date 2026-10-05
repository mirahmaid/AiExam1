import { motion } from "framer-motion";

/* =====================================================
   SHARED
===================================================== */

const AUTOPLAY_MS = 6500;

/* =====================================================
   TAB / FEATURE CARD
===================================================== */

function FeatureCard({ item, isActive, playing, onSelect }) {
  const Icon = item.icon;

  return (
    <li className="shrink-0 lg:shrink">
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive}
        className={`group relative flex w-full items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2.5 text-right transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F2A4A]/20 lg:items-start lg:gap-5 lg:whitespace-normal lg:rounded-3xl lg:border-transparent lg:px-6 lg:py-5 ${
          isActive
            ? "border-[#0F2A4A]/15 bg-white shadow-[0_20px_50px_-30px_rgba(15,42,74,.35)]"
            : "border-[#0F2A4A]/10 hover:bg-white/60"
        }`}
      >
        {/* شريط التقدّم (الكبير فقط) */}
        {isActive && (
          <motion.span
            key={String(playing)}
            aria-hidden="true"
            initial={{ scaleY: playing ? 0 : 1 }}
            animate={{ scaleY: 1 }}
            transition={{
              duration: playing ? AUTOPLAY_MS / 1000 : 0.3,
              ease: "linear",
            }}
            style={{ backgroundColor: item.deep }}
            className="absolute bottom-5 right-0 top-5 hidden w-[4px] origin-top rounded-full lg:block"
          />
        )}

        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 lg:h-12 lg:w-12 lg:rounded-2xl"
          style={
            isActive
              ? {
                  backgroundColor: item.color,
                  color: "#0B1F3A",
                  boxShadow: `0 0 28px ${item.color}88`,
                }
              : { backgroundColor: "#fff", color: "#94A3B8" }
          }
        >
          <Icon size={20} aria-hidden="true" />
        </span>

        <span className="block min-w-0">
          <span
            className={`block text-sm font-black transition-colors sm:text-base lg:text-[22px] lg:leading-[1.4] ${
              isActive
                ? "text-[#0F2A4A]"
                : "text-[#64748B] group-hover:text-[#0F2A4A]"
            }`}
          >
            {item.label}
          </span>

          {/* الوصف: للشاشات الكبيرة فقط */}
          <motion.span
            initial={false}
            animate={{
              height: isActive ? "auto" : 0,
              opacity: isActive ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="hidden overflow-hidden lg:block"
          >
            <span className="block pt-2 text-base leading-7 text-[#64748B]">
              {item.text}
            </span>
          </motion.span>
        </span>
      </button>
    </li>
  );
}

export default FeatureCard;