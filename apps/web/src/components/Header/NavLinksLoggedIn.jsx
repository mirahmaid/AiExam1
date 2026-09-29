import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const quizzesItems = [
  { href: "/quizzes", label: "كل الكويزات" },
  { href: "/quizzes/by-subject", label: "حسب المادة" },
];

const previousExamsItems = [
  { href: "/exams/archive", label: "أرشيف الاختبارات" },
  { href: "/exams/results", label: "نتائجي" },
];

function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 py-1 text-slate-600 transition-colors hover:text-slate-900">
        {label}
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`absolute right-0 top-full min-w-[180px] rounded-xl border border-slate-100 bg-white p-2 shadow-lg transition-all duration-200 ${
          open ? "opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#002C5A]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NavLinksLoggedIn() {
  return (
    <nav className="hidden items-center gap-10 text-sm font-medium text-slate-600 lg:flex">
      <Link to="/home" className="relative py-1 font-bold text-[#002C5A]">
        الرئيسية
        <span className="absolute -bottom-0 right-0 left-0 h-0.5 rounded-full bg-[#002C5A]" />
      </Link>
      <NavDropdown label="الاختبارات السابقة" items={previousExamsItems} />
      <NavDropdown label="الكويزات" items={quizzesItems} />
      <Link to="/daily-plan" className="py-1 transition-colors hover:text-slate-900">
        خطة اليوم
      </Link>
      <Link to="/ai-path" className="py-1 transition-colors hover:text-slate-900">
        مسار التميز AI
      </Link>
    </nav>
  );
}

export default NavLinksLoggedIn;
