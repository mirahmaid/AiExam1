export default function FormInput({ error, ...props }) {
  return (
    <div className="w-full max-w-md flex flex-col gap-1">
      <input
        dir="rtl"
        {...props}
        className={`w-full rounded-full border bg-white px-6 py-3.5 text-right text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-1 disabled:opacity-50 ${
          error
            ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-[#002C5A] focus:ring-[#002C5A]"
        }`}
      />
      {error && <span className="text-xs text-red-500 px-4 text-right">{error}</span>}
    </div>
  );
}
