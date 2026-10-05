import { useId } from "react";

const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

// ترويسة موحّدة لصفحات المنصة الداخلية
export default function PageHeader({ eyebrow, title, description, icon: Icon, actions }) {
  const patternId = useId();

  return (
    <section
      dir="rtl"
      style={{ fontFamily: FONT }}
      className="relative overflow-hidden rounded-[34px] bg-gradient-to-l from-[#0F2A4A] via-[#103B63] to-[#0F8B78] px-6 py-8 text-white shadow-[0_30px_65px_-35px_rgba(15,42,74,0.85)] sm:px-10 sm:py-10"
    >
      {/* زخارف ناعمة */}
      <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-[#2DD4BF]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-[#9FF6E9]/15 blur-3xl" />
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]">
        <defs>
          <pattern id={patternId} width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#9FF6E9] ring-1 ring-white/20 backdrop-blur transition-transform duration-500 hover:rotate-6 sm:flex">
              <Icon size={26} aria-hidden="true" />
            </span>
          )}

          <div>
            {eyebrow && (
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-black text-[#9FF6E9] ring-1 ring-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" aria-hidden="true" />
                {eyebrow}
              </span>
            )}
            <h1 className="text-[28px] font-black leading-tight sm:text-[34px]">{title}</h1>
            {description && (
              <p className="mt-2.5 max-w-2xl text-[14px] font-medium leading-7 text-white/75 sm:text-[15px]">{description}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}