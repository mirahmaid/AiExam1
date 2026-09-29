import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, description, actionHref, actionLabel, tone = "neutral" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <span
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
          tone === "error" ? "bg-rose-50 text-rose-500" : "bg-[#002C5A]/[0.06] text-[#002C5A]"
        }`}
      >
        <Icon size={28} />
      </span>
      <h3 className="text-lg font-bold text-[#002C5A]">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>}
      {actionHref && actionLabel && (
        <Link
          to={actionHref}
          className="mt-6 rounded-full bg-[#002C5A] px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#002C5A]/20 transition-all hover:-translate-y-0.5 hover:bg-[#0B3B6E]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}