import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

function AuthButtons() {
  return (
    <div className="hidden items-center gap-3 md:flex">
      <Link
        to="/login"
        className="group px-4 py-2.5 text-[13px] font-semibold text-[#0F2A4A] transition-colors duration-300 hover:text-[#12897A]"
      >
        دخول
      </Link>

      <Link
        to="/register"
        className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-l from-[#0F2A4A] to-[#12897A] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_12px_25px_-14px_rgba(18,137,122,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-14px_rgba(18,137,122,0.7)]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />

        <Sparkles
          size={15}
          className="relative text-[#9EEFE0]"
        />

        <span className="relative">ابدأ الآن</span>

        <ArrowLeft
          size={15}
          className="relative transition-transform duration-300 group-hover:-translate-x-0.5"
        />
      </Link>
    </div>
  );
}

export default AuthButtons;