// زر السؤال المقترح (نقطة ملوّنة مثل محطات المسار)
export default function FAQCard({ item, isActive, onClick, accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={[
        "flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-right text-[13px] font-bold leading-5",
        "transition-all duration-300 hover:-translate-y-0.5",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0F8B78]/20",
        isActive
          ? "border-[#0F2A4A] bg-[#0F2A4A] text-white shadow-[0_10px_24px_-14px_rgba(15,42,74,0.7)]"
          : "border-[#DCE7F0] bg-white text-[#334E68] hover:border-[#0F8B78]/40",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: accent,
          boxShadow: isActive ? `0 0 10px ${accent}` : "none",
        }}
      />

      {item.question}
    </button>
  );
}