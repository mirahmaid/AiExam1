// ترويسة موحّدة لصفحات المنصة الداخلية
export default function PageHeader({ eyebrow, title, description, icon: Icon, actions }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-l from-[#002C5A] via-[#0B3B6E] to-[#12897A] px-6 py-8 text-white shadow-[0_25px_60px_-30px_rgba(0,44,90,0.7)] sm:px-10 sm:py-10">
      {/* زخارف ناعمة */}
      <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-[#38B793]/30 blur-3xl" />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
      >
        <defs>
          <pattern id="page-header-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#page-header-dots)" />
      </svg>

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur sm:flex">
              <Icon size={26} />
            </span>
          )}
          <div>
            {eyebrow && (
              <span className="mb-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
                {eyebrow}
              </span>
            )}
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}