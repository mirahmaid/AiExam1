export default function FormInput({ error, ...props }) {
  return (
    <div className="w-full max-w-md flex flex-col gap-1">
      <input
        dir="rtl"
        {...props}
        className={`w-full rounded-2xl border bg-slate-50 px-5 py-3.5 text-right text-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white disabled:opacity-50 ${
          error
            ? "border-red-400 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-red-100"
            : "border-slate-200 focus:border-[#0F8B78] focus:ring-2 focus:ring-[#0F8B78]/10"
        }`}
      />

      {error && (
        <span className="text-xs text-red-500 px-4 text-right">
          {error}
        </span>
      )}
    </div>
  );

}