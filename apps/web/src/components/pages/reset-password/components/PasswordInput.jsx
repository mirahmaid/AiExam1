import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ error, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="w-full max-w-md flex flex-col gap-1">
      <div className="relative w-full">
        <input
          dir="rtl"
          type={showPassword ? "text" : "password"}
          {...props}
          className={`w-full rounded-full border bg-white px-6 py-3.5 pl-12 text-right text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-1 disabled:opacity-50 ${
            error
              ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500"
              : "border-slate-300 focus:border-[#002C5A] focus:ring-[#002C5A]"
          }`}
        />
        <button
          type="button"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
      {error && <span className="text-xs text-red-500 px-4 text-right">{error}</span>}
    </div>
  );
}
