// SubjectMenu.jsx — قائمة اختيار المادة (تُستخدم بالسايدبار وبالـcomposer)
export default function SubjectMenu({ subjects, loading, activeSubjectId, onPick, disabled }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {subjects.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onPick(s.id)}
          disabled={disabled}
          className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-right text-xs font-semibold transition-all disabled:opacity-60 ${
            activeSubjectId === s.id
              ? "border-[#12897A] bg-[#12897A]/[0.06] text-[#12897A]"
              : "border-slate-100 text-slate-600 hover:border-[#12897A]/40"
          }`}
        >
          <img src={s.icon} alt="" className="h-5 w-5 shrink-0 object-contain" />
          <span className="truncate">{s.title}</span>
        </button>
      ))}
    </div>
  );
}