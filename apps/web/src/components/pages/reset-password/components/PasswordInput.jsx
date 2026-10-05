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
          className={`w-full rounded-2xl border bg-slate-50 px-5 py-3.5 pl-12 text-right text-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white disabled:opacity-50 ${
            error
              ? "border-red-400 text-red-900 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              : "border-slate-200 focus:border-[#0F8B78] focus:ring-2 focus:ring-[#0F8B78]/10"
          }`}
        />

        <button
          type="button"
          disabled={props.disabled}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F8B78] transition-colors disabled:opacity-50"
        >
          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {error && (
        <span className="text-xs text-red-500 px-4 text-right">
          {error}
        </span>
      )}
    </div>
  );
}