
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";

const AuthContext = createContext(undefined);

const API_URL = import.meta.env.VITE_API_URL;

function readSelectedBranchFromStorage() {
  const savedBranch = localStorage.getItem("selectedBranch");

  if (!savedBranch) return null;

  try {
    return JSON.parse(savedBranch);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // ما بنعرف إذا المستخدم مسجل دخول إلا بعد ما نسأل السيرفر
  // (لأنه التوكن بقلب httpOnly cookie، ما فينا نقراه من الجافاسكريبت)
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [selectedBranch, setSelectedBranch] = useState(
    readSelectedBranchFromStorage
  );

  // --------------------------------------------------
  // التحقق من جلسة المستخدم
  // --------------------------------------------------
  const loadSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

        setUser(data);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("تعذر التحقق من جلسة الدخول:", error);

      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // عند فتح التطبيق لأول مرة
  // --------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/me`, {
          credentials: "include",
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();

          setUser(data);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("تعذر التحقق من جلسة الدخول:", error);

        if (!cancelled) {
          setUser(null);
          setIsLoggedIn(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    checkSession();

    // --------------------------------------------------
    // إعادة التحقق من الجلسة عند حدوث auth-change
    // --------------------------------------------------
    const onAuthChange = () => {
      void loadSession();
    };

    window.addEventListener("auth-change", onAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener("auth-change", onAuthChange);
    };
  }, [loadSession]);

  // --------------------------------------------------
  // Login
  // --------------------------------------------------
  // الكوكيز أصلاً انحطت من الباك اند.
  // هون فقط بنحدث الـ state.
  const login = useCallback((userData) => {
    setUser(userData ?? null);
    setIsLoggedIn(true);
    setIsLoading(false);
  }, []);

  // --------------------------------------------------
  // Refresh session
  // --------------------------------------------------
  const refresh = useCallback(() => {
    void loadSession();
  }, [loadSession]);

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("تعذر تسجيل الخروج من السيرفر:", error);
    }

    // نحافظ على نفس السلوك الموجود عندك
    localStorage.removeItem("selectedBranch");
    localStorage.removeItem("selectedBranchId");

    setUser(null);
    setIsLoggedIn(false);
    setSelectedBranch(null);
  }, []);

  // --------------------------------------------------
  // Selected Branch
  // --------------------------------------------------
  const setSelectedBranchFn = useCallback((branch) => {
    if (branch) {
      localStorage.setItem("selectedBranch", JSON.stringify(branch));

      if (branch?.id) {
        localStorage.setItem("selectedBranchId", branch.id);
      }
    } else {
      localStorage.removeItem("selectedBranch");
      localStorage.removeItem("selectedBranchId");
    }

    setSelectedBranch(branch);
  }, []);

  // --------------------------------------------------
  // Context value
  // --------------------------------------------------
  // useMemo حتى ما نعمل object جديد مع كل render
  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      user,
      selectedBranch,
      login,
      logout,
      refresh,
      setSelectedBranch: setSelectedBranchFn,
    }),
    [
      isLoggedIn,
      isLoading,
      user,
      selectedBranch,
      login,
      logout,
      refresh,
      setSelectedBranchFn,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth لازم يستخدم جوا AuthProvider");
  }

  return ctx;
}

