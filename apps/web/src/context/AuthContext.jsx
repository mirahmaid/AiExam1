import { createContext, useContext, useCallback, useEffect, useState, useMemo } from "react";

const AuthContext = createContext(undefined);

const API_URL = import.meta.env.VITE_API_URL;

function readSelectedBranchFromStorage() {
  try {
    const saved = localStorage.getItem("selectedBranch");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // التوكن بكوكي httpOnly، فما بنعرف إذا المستخدم مسجل إلا بعد ما نسأل السيرفر
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(readSelectedBranchFromStorage);

  const loadSession = useCallback(async (signal) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/me`, { credentials: "include", signal });

      if (signal?.aborted) return;

      if (res.ok) {
        setUser(await res.json());
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("تعذر التحقق من جلسة الدخول:", error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadSession(controller.signal);

    const onAuthChange = () => void loadSession();
    window.addEventListener("auth-change", onAuthChange);

    return () => {
      controller.abort();
      window.removeEventListener("auth-change", onAuthChange);
    };
  }, [loadSession]);

  // الكوكيز انحطت من الباك اند، هون بس بنحدّث الـ state
  const login = useCallback((userData) => {
    setUser(userData ?? null);
    setIsLoggedIn(true);
    setIsLoading(false);
  }, []);

  const refresh = useCallback(() => void loadSession(), [loadSession]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("تعذر تسجيل الخروج من السيرفر:", error);
    }

    localStorage.removeItem("selectedBranch");
    localStorage.removeItem("selectedBranchId");

    setUser(null);
    setIsLoggedIn(false);
    setSelectedBranch(null);
  }, []);

  const setSelectedBranchFn = useCallback((branch) => {
    if (branch) {
      localStorage.setItem("selectedBranch", JSON.stringify(branch));
      if (branch.id) localStorage.setItem("selectedBranchId", branch.id);
    } else {
      localStorage.removeItem("selectedBranch");
      localStorage.removeItem("selectedBranchId");
    }
    setSelectedBranch(branch);
  }, []);

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
    [isLoggedIn, isLoading, user, selectedBranch, login, logout, refresh, setSelectedBranchFn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth لازم يستخدم جوا AuthProvider");
  return ctx;
}