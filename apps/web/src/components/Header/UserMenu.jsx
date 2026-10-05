import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  LogOut,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();

    navigate("/", {
      replace: true,
    });
  }

  return (
    <div className="hidden items-center gap-2 lg:flex">
      {/* Search */}
      <button
        type="button"
        aria-label="بحث"
        className="group flex h-11 w-11 items-center justify-center rounded-full text-[#64748B] transition-all duration-300 hover:bg-[#F1F7F8] hover:text-[#12897A]"
      >
        <Search
          size={20}
          strokeWidth={2}
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </button>

      {/* Notifications */}
      <button
        type="button"
        aria-label="الإشعارات"
        className="group relative flex h-11 w-11 items-center justify-center rounded-full text-[#64748B] transition-all duration-300 hover:bg-[#F1F7F8] hover:text-[#12897A]"
      >
        <Bell
          size={20}
          strokeWidth={2}
          className="transition-transform duration-300 group-hover:scale-110"
        />

        <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-[#7C5CFC] shadow-[0_0_8px_rgba(124,92,252,0.45)]" />
      </button>

      {/* User */}
      <div
        className="relative mr-1"
        ref={menuRef}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`group flex items-center gap-2.5 rounded-full border bg-white py-1.5 pl-2 pr-1.5 transition-all duration-300 ${
            menuOpen
              ? "border-[#BFE8DD] shadow-[0_10px_28px_-16px_rgba(18,137,122,0.38)]"
              : "border-[#E4EDF2] hover:border-[#BFE8DD] hover:shadow-[0_8px_22px_-18px_rgba(15,42,74,0.3)]"
          }`}
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full">
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

          <ChevronDown
            size={15}
            className={`text-slate-400 transition-transform duration-300 ${
              menuOpen
                ? "rotate-180 text-[#12897A]"
                : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        <div
          className={`absolute left-0 top-[calc(100%+12px)] w-[240px] origin-top-left overflow-hidden rounded-[22px] border border-[#E3EBF0] bg-white shadow-[0_25px_55px_-22px_rgba(15,42,74,0.3)] transition-all duration-200 ${
            menuOpen
              ? "visible translate-y-0 scale-100 opacity-100"
              : "pointer-events-none invisible -translate-y-2 scale-95 opacity-0"
          }`}
        >
          {/* User Info */}
          <div className="bg-gradient-to-l from-[#F1FBF8] to-[#F7FAFC] p-4">
            <div className="flex items-center gap-3">
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
              </div>

              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-bold text-[#0F2A4A]">
                  {user?.name ?? "المستخدم"}
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-[#12897A]">
                  طالب مسار التميز
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm font-medium text-slate-600 transition-colors hover:bg-[#F4F8FA] hover:text-[#0F2A4A]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5F8]">
                <UserRound size={16} />
              </span>

              حسابي
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm font-medium text-slate-600 transition-colors hover:bg-[#F4F8FA] hover:text-[#0F2A4A]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5F8]">
                <Bell size={16} />
              </span>

              الإشعارات
            </button>

            <div className="my-1.5 h-px bg-slate-100" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                <LogOut size={16} />
              </span>

              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserMenu;