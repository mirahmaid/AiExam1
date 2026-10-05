import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";

const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

const TONES = {
  neutral: {
    wrap: "bg-gradient-to-br from-[#E8F7F3] to-[#C5E7DE] text-[#0F8B78]",
    halo: "bg-[#2DD4BF]/20",
  },
  error: {
    wrap: "bg-gradient-to-br from-rose-50 to-rose-100 text-rose-500",
    halo: "bg-rose-300/25",
  },
};

export default function EmptyState({ icon: Icon = Inbox, title, description, actionHref, actionLabel, tone = "neutral" }) {
  const t = TONES[tone] ?? TONES.neutral;

  return (
    <div
      dir="rtl"
      style={{ fontFamily: FONT }}
      className="relative flex animate-toast-in flex-col items-center justify-center overflow-hidden rounded-[30px] border-2 border-dashed border-[#BFE8DD] bg-white px-6 py-14 text-center"
    >
      <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[#2DD4BF]/10 blur-3xl" />

      <span className="relative mb-5 flex h-20 w-20 items-center justify-center">
        <span className={`absolute inset-0 animate-pulse rounded-full ${t.halo}`} />
        <span className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${t.wrap}`}>
          <Icon size={28} aria-hidden="true" />
        </span>
      </span>

      <h3 className="relative text-[20px] font-black text-[#0F2A4A]">{title}</h3>
      {description && (
        <p className="relative mt-2 max-w-md text-[14px] font-bold leading-7 text-slate-500">{description}</p>
      )}

      {actionHref && actionLabel && (
        <Link
          to={actionHref}
          className="relative mt-7 inline-flex items-center rounded-full bg-[#0F2A4A] px-8 py-3 text-[14px] font-black text-white shadow-md shadow-[#0F2A4A]/20 transition-all hover:-translate-y-0.5 hover:bg-[#0F8B78]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}