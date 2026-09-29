// نقطة واحدة لكل طلب بيروح على الباك اند.
// الكوكيز هي مصدر الحقيقة الوحيد — ما في توكن بالـ JS، والباك اند بيسيت كوكيز httpOnly.

const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1`;

/** يبني عنوان نقطة نهاية من مسار مثل "/auth/login". */
export function apiUrl(path) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/** بينبّه الـ AuthContext إنو حالة الجلسة تغيّرت. */
export function notifyAuthChange() {
  window.dispatchEvent(new Event("auth-change"));
}

// لو صار أكتر من 401 بنفس الوقت، منعمل تجديد واحد بس ومنخلي الباقي ينتظره.
let refreshPromise = null;

async function refreshSession() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        // الـ refresh token جاي من كوكي httpOnly، مش من الـ body
        body: "{}",
      });
      return res.ok;
    } catch (error) {
      console.error("تعذر تجديد الجلسة:", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * استخدمها لأي طلب محمي. بترفق الكوكيز تلقائياً، وإذا رجع 401 بتجدّد
 * الجلسة مرة وحدة وبتعيد الطلب.
 */
export async function fetchWithAuth(path, init = {}) {
  const url = path.startsWith("http") ? path : apiUrl(path);
  const request = () => fetch(url, { ...init, credentials: "include" });

  let res = await request();

  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await request();
    } else {
      // الجلسة خلصت فعلاً — منخلي الواجهة تعرف
      notifyAuthChange();
    }
  }

  return res;
}

/** طلب عام بدون مصادقة (تسجيل دخول، تسجيل، إلخ). */
export function fetchPublic(path, init = {}) {
  return fetch(apiUrl(path), { ...init, credentials: "include" });
}

export async function logout() {
  try {
    await fetchWithAuth("/auth/logout", { method: "POST" });
  } catch (error) {
    // حتى لو فشل الطلب، منكمّل — الكوكيز بتنمسح من السيرفر أو بتنتهي لحالها
    console.error("تعذر إنهاء الجلسة على السيرفر:", error);
  } finally {
    notifyAuthChange();
  }
}