import { Link } from "react-router-dom";

function AuthButtons() {
  return (
    <div className="hidden md:flex items-center gap-3">
      <Link
        to="/register"
        className="rounded-full bg-[#002C5A] px-10 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
      >
        سجل الآن
      </Link>
      <Link
        to="/login"
        className="rounded-full border border-slate-500 px-13 py-2 text-sm font-semibold text-[#002C5A] bg-[#D9D9D959] hover:bg-slate-50 transition-colors cursor-pointer"
      >
        دخول
      </Link>
    </div>
  );
}

export default AuthButtons;