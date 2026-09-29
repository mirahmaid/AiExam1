import { useState, useRef, useEffect } from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // سكر القائمة لما تدوس بره منها
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="hidden items-center gap-4 lg:flex">
      <button aria-label="بحث" className="text-slate-500 transition-colors hover:text-[#002C5A]">
        <Search size={20} />
      </button>
      <button aria-label="الإشعارات" className="text-slate-500 transition-colors hover:text-[#002C5A]">
        <Bell size={20} />
      </button>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="h-9 w-9 overflow-hidden rounded-full border border-slate-200"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name ?? "المستخدم"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#002C5A]/10 text-xs font-bold text-[#002C5A]">
              {user?.name?.charAt(0) ?? "؟"}
            </div>
          )}
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {user?.name && (
              <div className="border-b border-slate-100 px-4 py-2 text-right text-sm font-medium text-[#002C5A]">
                {user.name}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-end gap-2 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <span>تسجيل خروج</span>
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserMenu;