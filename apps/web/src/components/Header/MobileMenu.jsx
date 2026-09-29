import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, Bell, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const guestLinks = [
  { href: "#hero", label: "الرئيسية" },
  { href: "#features", label: "لماذا منصتنا" },
  { href: "#contact", label: "تواصل معنا" },
  { href: "#success-stories", label: "قصص النجاح" },
  { href: "#asked-questions", label: "الاسئلة الشائعة" },
];

const authedLinks = [{ to: "/home", label: "الرئيسية" }];

const previousExamsItems = [
  { to: "/exams/archive", label: "أرشيف الاختبارات" },
  { to: "/exams/results", label: "نتائجي" },
];
const quizzesItems = [
  { to: "/quizzes", label: "كل الكويزات" },
  { to: "/quizzes/by-subject", label: "حسب المادة" },
];

const authedTrailingLinks = [
  { to: "/daily-plan", label: "خطة اليوم" },
  { to: "/ai-path", label: "مسار التميز AI" },
];

function AccordionGroup({ label, items, pathname, isOpen, onToggle, index, menuOpen }) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{ transitionDelay: menuOpen ? `${index * 40}ms` : "0ms" }}
        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium text-slate-700 transition-all duration-300 active:bg-slate-50 ${
          menuOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
        }`}
      >
        {label}
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 transition-transform duration-300 ${
            isOpen ? "rotate-180 bg-[#002C5A]/5" : ""
          }`}
        >
          <ChevronDown size={15} className={isOpen ? "text-[#002C5A]" : "text-slate-400"} />
        </span>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <div className="mr-4 mt-1 flex flex-col gap-0.5 border-r-2 border-slate-100 pr-4">
            {items.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${
                    isActive ? "font-bold text-[#002C5A]" : "text-slate-500 active:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [accordion, setAccordion] = useState(null);
  const [activeLink, setActiveLink] = useState(guestLinks[0].href);
  const { pathname } = useLocation();
  const { isLoggedIn, isLoading, user, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition-colors active:bg-slate-100"
      >
        <Menu size={24} />
      </button>

      {/* الخلفية المعتمة */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* الدرج */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-[86%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:w-[380px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* الهيدر */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <img src="/logo.png" alt="مسار التميز" className="h-8 w-auto" />
          <button
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-colors active:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        {/* روابط التنقل */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
          {isLoading ? (
            <div className="flex flex-col gap-3 px-4">
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-slate-100" />
            </div>
          ) : isLoggedIn ? (
            <>
              {authedLinks.map((link, i) => {
                const isActive = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300 ${
                      open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                    } ${
                      isActive
                        ? "bg-[#002C5A]/[0.06] font-bold text-[#002C5A]"
                        : "text-slate-700 active:bg-slate-50"
                    }`}
                  >
                    {link.label}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#002C5A]" />}
                  </Link>
                );
              })}

              <AccordionGroup
                label="الاختبارات السابقة"
                items={previousExamsItems}
                pathname={pathname}
                isOpen={accordion === "exams"}
                onToggle={() => setAccordion(accordion === "exams" ? null : "exams")}
                index={1}
                menuOpen={open}
              />
              <AccordionGroup
                label="الكويزات"
                items={quizzesItems}
                pathname={pathname}
                isOpen={accordion === "quizzes"}
                onToggle={() => setAccordion(accordion === "quizzes" ? null : "quizzes")}
                index={2}
                menuOpen={open}
              />

              {authedTrailingLinks.map((link, i) => {
                const isActive = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    style={{ transitionDelay: open ? `${(i + 3) * 40}ms` : "0ms" }}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300 ${
                      open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                    } ${
                      isActive
                        ? "bg-[#002C5A]/[0.06] font-bold text-[#002C5A]"
                        : "text-slate-700 active:bg-slate-50"
                    }`}
                  >
                    {link.label}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#002C5A]" />}
                  </Link>
                );
              })}
            </>
          ) : (
            guestLinks.map((link, i) => {
              const isActive = activeLink === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setActiveLink(link.href);
                    setOpen(false);
                  }}
                  style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300 ${
                    open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                  } ${
                    isActive
                      ? "bg-[#002C5A]/[0.06] font-bold text-[#002C5A]"
                      : "text-slate-700 active:bg-slate-50"
                  }`}
                >
                  {link.label}
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#002C5A]" />}
                </a>
              );
            })
          )}
        </nav>

        {/* الفوتر — بطاقة المستخدم / أزرار الدخول */}
        <div
          className="mt-auto flex shrink-0 flex-col gap-3 border-t border-slate-100 px-5 py-5"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          {isLoading ? null : isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-3.5 py-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white ring-offset-2 ring-offset-slate-50 [box-shadow:0_0_0_1.5px_#002C5A22]">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name ?? "المستخدم"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#002C5A] to-[#0F2A4A] text-sm font-bold text-white">
                      {user?.name?.charAt(0) ?? "؟"}
                    </div>
                  )}
                </div>
                <span className="flex-1 truncate text-sm font-semibold text-slate-800">
                  {user?.name ?? "المستخدم"}
                </span>
                <button
                  aria-label="الإشعارات"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100"
                >
                  <Bell size={17} />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
                </button>
                <button
                  aria-label="بحث"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100"
                >
                  <Search size={17} />
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50/40 py-3.5 text-sm font-semibold text-red-600 transition-colors active:bg-red-50"
              >
                <LogOut size={16} />
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-gradient-to-l from-[#002C5A] to-[#0F2A4A] py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-[#002C5A]/20 transition-transform active:scale-[0.98]"
              >
                سجل الآن
              </Link>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="w-full rounded-full border border-slate-200 py-3.5 text-center text-sm font-semibold text-slate-700 transition-colors active:bg-slate-50"
              >
                دخول
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
