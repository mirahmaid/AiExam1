import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
// ⚠️ إذا ظهر خط أحمر تحت المسارين، امسحي المسار وأعيدي كتابة الاسم واضغطي Ctrl + .
import { fetchSubjectsByBranch } from "../pages/home/components/Book/Api/books";

const quizzesItems = [
  {
    href: "/quizzes",
    label: "كل الكويزات",
  },
  {
    href: "/quizzes/by-subject",
    label: "حسب المادة",
  },
];

const previousExamsItems = [
  {
    href: "/exams/archive",
    label: "أرشيف الاختبارات",
  },
  {
    href: "/exams/results",
    label: "نتائجي",
  },
];

function NavDropdown({ label, items, active = false, emptyText = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // سكّري القائمة لما تضغطي برا أو على Escape
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`group flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
          open || active
            ? "text-[#0F2A4A]"
            : "text-[#64748B] hover:text-[#0F2A4A]"
        }`}
      >
        <span>{label}</span>

        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${
            open ? "rotate-180 text-[#12897A]" : "text-[#94A3B8]"
          }`}
        />
      </button>

      {/* الـ wrapper لا يستقبل أي أحداث ماوس وهو مسكّر */}
      <div
        className={`absolute right-0 top-full z-50 pt-3 ${
          open ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`w-[220px] origin-top-right rounded-[20px] border border-[#E4EDF2] bg-white p-2 shadow-[0_22px_50px_-22px_rgba(15,42,74,0.28)] transition-all duration-200 ${
            open
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible -translate-y-2 scale-95 opacity-0"
          }`}
        >
          <div className="mb-1 px-3 py-2 text-[10px] font-bold tracking-wide text-slate-400">
            {label}
          </div>

          {items.length === 0 && (
            <p className="px-3 py-2.5 text-[13px] font-medium text-[#94A3B8]">
              {emptyText}
            </p>
          )}

          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#64748B] transition-all duration-200 hover:bg-[#F2F8F7] hover:text-[#0F8B78]"
            >
              <span>{item.label}</span>

              <span className="h-1.5 w-1.5 rounded-full bg-transparent transition-all duration-200 group-hover:bg-[#12897A]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavLinksLoggedIn() {
  const { selectedBranch } = useAuth();
  const { pathname } = useLocation();
  const [subjects, setSubjects] = useState([]);

  // مواد الفرع: بنستخدمها لقائمة الفيديوهات (كل مادة بتفتح أول درس فيها)
  useEffect(() => {
    if (!selectedBranch) return;
    let cancelled = false;

    fetchSubjectsByBranch(selectedBranch.id)
      .then((result) => {
        if (!cancelled) setSubjects(result);
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, [selectedBranch]);

  const videosItems = subjects.map((subject) => ({
    href: `/videos/${subject.id}`,
    label: subject.name,
  }));

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {/* الرئيسية */}
      <Link
        to="/home"
        className="group relative px-4 py-2.5 text-[13px] font-bold text-[#0F8B78] transition-colors duration-300"
      >
        الرئيسية

        <span className="absolute -bottom-1 right-1/2 h-1 w-1 translate-x-1/2 rounded-full bg-[#12897A]" />
      </Link>

      {/* الفيديوهات */}
      <NavDropdown
        label="الفيديوهات"
        items={videosItems}
        active={pathname.startsWith("/videos")}
        emptyText="جاري تحميل المواد..."
      />

      {/* الاختبارات السابقة */}
      <NavDropdown
        label="الاختبارات السابقة"
        items={previousExamsItems}
      />

      {/* الكويزات */}
      <NavDropdown
        label="الكويزات"
        items={quizzesItems}
      />

      {/* خطة اليوم */}
      <Link
        to="/daily-plan"
        className="px-4 py-2.5 text-[13px] font-semibold text-[#64748B] transition-colors duration-300 hover:text-[#0F2A4A]"
      >
        خطة اليوم
      </Link>

      {/* مسار التميز AI */}
      <Link
        to="/ai-path"
        className="group relative ml-2 flex items-center gap-2 overflow-hidden rounded-2xl border border-[#BFE8DD] bg-white px-4 py-2.5 text-[13px] font-bold text-[#0F8B78] shadow-[0_8px_24px_-16px_rgba(18,137,122,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8ED8C6] hover:shadow-[0_14px_30px_-16px_rgba(18,137,122,0.55)]"
      >
        {/* لمعان */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />

        {/* Glow بنفسجي خفيف */}
        <span
          aria-hidden="true"
          className="absolute -right-5 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-[#A78BFA]/10 blur-xl"
        />

        <Sparkles
          size={16}
          className="relative shrink-0 text-[#7656D8] transition-transform duration-300 group-hover:rotate-12"
        />

        <span className="relative whitespace-nowrap">
          مسار التميز AI
        </span>

        <ArrowLeft
          size={14}
          className="relative text-[#12897A] transition-transform duration-300 group-hover:-translate-x-1"
        />
      </Link>
    </nav>
  );
}

export default NavLinksLoggedIn;