export default function SubjectCard({ subject }) {
  const hasDescription = Boolean(subject.description?.trim());

  return (
    <div
      className="group relative flex w-full flex-col items-center justify-center overflow-hidden bg-white px-4 text-center shadow-[0_15px_40px_-10px_rgba(0,44,90,0.35)] ring-1 ring-black/[0.04] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-3 hover:shadow-[0_30px_55px_-12px_rgba(0,44,90,0.45)] hover:ring-[#12897A]/20"
      style={{
        width: "170px",
        height: "300px",
        borderTopLeftRadius: "85px",
        borderTopRightRadius: "0px",
        borderBottomRightRadius: "85px",
        borderBottomLeftRadius: "85px",
      }}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#12897A]/0 blur-3xl transition-all duration-700 group-hover:bg-[#12897A]/15" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-36 w-36 rounded-full bg-[#002C5A]/0 blur-3xl transition-all duration-700 group-hover:bg-[#002C5A]/10" />

      <div className="relative mb-3 flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E8F7F3] via-[#D8F0EA] to-[#C5E7DE] shadow-[0_8px_20px_-8px_rgba(18,137,122,0.35)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_14px_30px_-8px_rgba(18,137,122,0.45)]">
        <div className="absolute inset-0 rounded-full border border-white/70" />
        <div className="relative h-[72px] w-[72px] transition-transform duration-500 ease-out group-hover:scale-105">
          <img
            src={subject.icon}
            alt={subject.title}
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 w-full">
        <h3 className="text-lg font-bold text-[#002C5A] transition-all duration-400 group-hover:-translate-y-0.5 group-hover:text-[#12897A]">
          {subject.title}
        </h3>

        {hasDescription && (
          <p className="mt-2 line-clamp-10 leading-none text-lg text-[#002C5A] transition-all duration-500 group-hover:text-slate-600 pb-5">
            {subject.description}
          </p>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-[#12897A]/0 blur-md transition-all duration-500 group-hover:bg-[#12897A]/40" />
    </div>
  );
}