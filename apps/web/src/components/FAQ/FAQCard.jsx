import { motion } from "framer-motion";

export default function FAQCard({ item, isOpen, onToggle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 1.2,
        delay: index * 0.25,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={[
        "rounded-tr-[320px] rounded-br-[320px] rounded-bl-[640px] rounded-tl-[40px]",
        "transition-colors duration-300 w-full overflow-hidden",
        "shadow-[0_10px_30px_rgba(0,0,0,0.04)]",
        isOpen
          ? "bg-[#eaf4fb]"
          : "bg-[#f8fbff] hover:bg-[#f0f6fc]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:px-8 md:py-6 text-right focus:outline-none"
      >
        <span className="text-[#16233f] font-extrabold text-base md:text-lg">
          {item.question}
        </span>

        <div
          className={[
            "w-8 h-8 flex items-center justify-center rounded-full transition-transform duration-300",
            isOpen
              ? "rotate-180 text-[#16233f]"
              : "text-[#4b5975]",
          ].join(" ")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen
            ? "grid-rows-[1fr] opacity-100 pb-6 px-6 md:px-8"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed border-t border-gray-200/60 pt-4">
            {item.answer}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
