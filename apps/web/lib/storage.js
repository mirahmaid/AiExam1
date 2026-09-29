// تخزين محلي تفاعلي ومفصول لكل مستخدم (سجل الكويزات، خطة اليوم...)
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/context/AuthContext";

const CHANGE_EVENT = "local-store-change";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function safeRead(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // المساحة ممتلئة أو التخزين محظور — نتجاهل بهدوء
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function readStore(key, fallback) {
  const raw = safeRead(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** مفتاح تخزين خاص بالمستخدم الحالي حتى لا تختلط بيانات حسابين على نفس المتصفح */
export function useUserKey(base) {
  const { user } = useAuth();
  return `${base}:${user?.id ?? user?.email ?? "me"}`;
}

/** قيمة من localStorage تتحدث تلقائياً عند أي تغيير (بنفس التبويب أو تبويب آخر) */
export function useLocalStore(key, fallback) {
  const raw = useSyncExternalStore(
    subscribe,
    () => safeRead(key),
    () => null,
  );

  const value = useMemo(() => {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
    // fallback مقصود خارج الاعتماديات حتى لا يعاد الحساب مع كل render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const setValue = useCallback(
    (next) => {
      const prev = readStore(key, fallback);
      const resolved = typeof next === "function" ? next(prev) : next;
      writeStore(key, resolved);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue];
}