const API_URL = import.meta.env.VITE_API_URL;

let refreshPromise = null;

function clearAuthAndNotify() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("selectedBranch");

  window.dispatchEvent(new Event("auth-change"));
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) return null;

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!res.ok) {
        clearAuthAndNotify();
        return null;
      }

      const data = await res.json();

      if (!data.accessToken) {
        clearAuthAndNotify();
        return null;
      }

      localStorage.setItem("accessToken", data.accessToken);

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      window.dispatchEvent(new Event("auth-change"));

      return data.accessToken;
    } catch (error) {
      console.error("تعذر تجديد التوكن:", error);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchWithAuth(input, init = {}) {
  const buildHeaders = (token) => ({
    ...(init.headers || {}),
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  });

  const currentToken = localStorage.getItem("accessToken");

  let res = await fetch(input, {
    ...init,
    headers: buildHeaders(currentToken),
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      res = await fetch(input, {
        ...init,
        headers: buildHeaders(newToken),
      });
    }
  }

  return res;
}