import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  Bell,
  Search,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const guestLinks = [
  {
    href: "#hero",
    label: "الرئيسية",
  },
  {
    href: "#features",
    label: "لماذا منصتنا",
  },
  {
    href: "#contact",
    label: "تواصل معنا",
  },
  {
    href: "#success-stories",
    label: "قصص النجاح",
  },
  {
    href: "#asked-questions",
    label: "الأسئلة الشائعة",
  },
];

const authedLinks = [
  {
    to: "/home",
    label: "الرئيسية",
  },
];

const previousExamsItems = [
  {
    to: "/exams/archive",
    label: "أرشيف الاختبارات",
  },
  {
    to: "/exams/results",
    label: "نتائجي",
  },
];

const quizzesItems = [
  {
    to: "/quizzes",
    label: "كل الكويزات",
  },
  {
    to: "/quizzes/by-subject",
    label: "حسب المادة",
  },
];

const authedTrailingLinks = [
  {
    to: "/daily-plan",
    label: "خطة اليوم",
  },
  {
    to: "/ai-path",
    label: "مسار التميز AI",
    ai: true,
  },
];

function AccordionGroup({
  label,
  items,
  pathname,
  isOpen,
  onToggle,
  index,
  menuOpen,
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        style={{
          transitionDelay: menuOpen
            ? `${index * 40}ms`
            : "0ms",
        }}
        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium text-slate-700 transition-all duration-300 ${
          menuOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-4 opacity-0"
        }`}
      >
        <span>{label}</span>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? "bg-[#E8F7F3] text-[#12897A]"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          <ChevronDown
            size={15}
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-300 ${
          isOpen
            ? "grid-rows-[1fr]"
            : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <div className="mr-4 mt-1 flex flex-col gap-0.5 border-r-2 border-[#E8F1F4] pr-4">
            {items.map((item) => {
              const isActive = pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-xl px-4 py-2.5 text-sm transition-all ${
                    isActive
                      ? "bg-[#E8F7F3] font-bold text-[#12897A]"
                      : "text-slate-500 active:bg-slate-50"
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
  const [activeLink, setActiveLink] = useState(
    guestLinks[0].href
  );

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
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      {/* Menu Button */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
        aria-expanded={open}
        className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#E3EBF0] bg-white text-[#0F2A4A] shadow-[0_8px_20px_-15px_rgba(15,42,74,0.35)] transition-all duration-300 active:scale-95"
      >
        <Menu
          size={22}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </button>

      {/* Overlay */}

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-[#071B2D]/55 backdrop-blur-md transition-opacity duration-300 ${
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}

      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-[88%] max-w-sm flex-col overflow-hidden bg-[#F8FAFC] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:w-[390px] ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* Decorative glow */}

        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#38B793]/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#7C5CFC]/8 blur-3xl" />

        {/* Header */}

        <div className="relative flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/85 px-5 py-4 backdrop-blur-xl">
          <img
            src="/logo.png"
            alt="مسار التميز"
            className="h-9 w-auto"
          />

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-all duration-300 active:scale-95"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}

        <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
          {isLoading ? (
            <div className="flex flex-col gap-4 px-4">
              <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : isLoggedIn ? (
            <>
              {/* Home */}

              {authedLinks.map((link, i) => {
                const isActive =
                  pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    style={{
                      transitionDelay: open
                        ? `${i * 40}ms`
                        : "0ms",
                    }}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300 ${
                      open
                        ? "translate-x-0 opacity-100"
                        : "translate-x-4 opacity-0"
                    } ${
                      isActive
                        ? "bg-[#E8F7F3] font-bold text-[#12897A]"
                        : "text-slate-700 active:bg-slate-50"
                    }`}
                  >
                    {link.label}

                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-[#12897A] shadow-[0_0_10px_rgba(18,137,122,0.5)]" />
                    )}
                  </Link>
                );
              })}

              {/* Previous exams */}

              <AccordionGroup
                label="الاختبارات السابقة"
                items={previousExamsItems}
                pathname={pathname}
                isOpen={accordion === "exams"}
                onToggle={() =>
                  setAccordion(
                    accordion === "exams"
                      ? null
                      : "exams"
                  )
                }
                index={1}
                menuOpen={open}
              />

              {/* Quizzes */}

              <AccordionGroup
                label="الكويزات"
                items={quizzesItems}
                pathname={pathname}
                isOpen={accordion === "quizzes"}
                onToggle={() =>
                  setAccordion(
                    accordion === "quizzes"
                      ? null
                      : "quizzes"
                  )
                }
                index={2}
                menuOpen={open}
              />

              {/* Other links */}

              {authedTrailingLinks.map((link, i) => {
                const isActive =
                  pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    style={{
                      transitionDelay: open
                        ? `${(i + 3) * 40}ms`
                        : "0ms",
                    }}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300 ${
                      open
                        ? "translate-x-0 opacity-100"
                        : "translate-x-4 opacity-0"
                    } ${
                      link.ai
                        ? "border border-[#BFE8DD] bg-gradient-to-l from-[#E8F7F3] to-[#F4FBFF] font-bold text-[#12897A]"
                        : isActive
                          ? "bg-[#E8F7F3] font-bold text-[#12897A]"
                          : "text-slate-700 active:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {link.ai && (
                        <Sparkles
                          size={15}
                          className="text-[#7656D8]"
                        />
                      )}

                      {link.label}
                    </span>

                    {link.ai && (
                      <ArrowLeft
                        size={15}
                        className="text-[#12897A]"
                      />
                    )}

                    {!link.ai && isActive && (
                      <span className="h-2 w-2 rounded-full bg-[#12897A]" />
                    )}
                  </Link>
                );
              })}
            </>
          ) : (
            <>
              {guestLinks.map((link, i) => {
                const isActive =
                  activeLink === link.href;

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => {
                      setActiveLink(link.href);
                      setOpen(false);
                    }}
                    style={{
                      transitionDelay: open
                        ? `${i * 40}ms`
                        : "0ms",
                    }}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300 ${
                      open
                        ? "translate-x-0 opacity-100"
                        : "translate-x-4 opacity-0"
                    } ${
                      isActive
                        ? "bg-[#E8F7F3] font-bold text-[#12897A]"
                        : "text-slate-700 active:bg-slate-50"
                    }`}
                  >
                    {link.label}

                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-[#12897A]" />
                    )}
                  </a>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer */}

        <div
          className="relative mt-auto flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-white/85 px-5 py-5 backdrop-blur-xl"
          style={{
            paddingBottom:
              "max(1.25rem, env(safe-area-inset-bottom))",
          }}
        >
          {isLoading ? null : isLoggedIn ? (
            <>
              {/* User Card */}

              <div className="flex items-center gap-3 rounded-[20px] border border-[#E5EDF1] bg-[#F8FAFC] px-3.5 py-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name ?? "المستخدم"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0F2A4A] to-[#12897A] text-sm font-bold text-white">
                      {user?.name?.charAt(0) ?? "؟"}
                    </div>
                  )}

                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#38B793]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#0F2A4A]">
                    {user?.name ?? "المستخدم"}
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#12897A]">
                    طالب مسار التميز
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="الإشعارات"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
                >
                  <Bell size={17} />

                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#7C5CFC]" />
                </button>

                <button
                  type="button"
                  aria-label="بحث"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
                >
                  <Search size={17} />
                </button>
              </div>

              {/* Logout */}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50/50 py-3.5 text-sm font-semibold text-red-600 transition-all active:scale-[0.98]"
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
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-[#0F2A4A] to-[#12897A] py-3.5 text-sm font-bold text-white shadow-[0_12px_25px_-15px_rgba(18,137,122,0.6)]"
              >
                <Sparkles size={15} />

                ابدأ الآن

                <ArrowLeft
                  size={15}
                  className="transition-transform group-active:-translate-x-1"
                />
              </Link>

              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="w-full rounded-full border border-slate-200 bg-white py-3.5 text-center text-sm font-semibold text-[#0F2A4A] transition-colors active:bg-slate-50"
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