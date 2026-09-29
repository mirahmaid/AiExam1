// سجل محاولات الكويزات — محفوظ محلياً لكل مستخدم (لا يوجد endpoint للنتائج بالباك اند حالياً)
import { useCallback, useMemo } from "react";
import { useLocalStore, useUserKey } from "./storage";

const MAX_ATTEMPTS = 60;
const EMPTY = [];

export const DIFFICULTY_LABELS = {
  EASY: "سهل",
  MEDIUM: "متوسط",
  HARD: "صعب",
  MIXED: "متنوع",
};

export const DIFFICULTY_STYLES = {
  EASY: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-600/15",
  HARD: "bg-rose-50 text-rose-700 ring-rose-600/15",
  MIXED: "bg-sky-50 text-sky-700 ring-sky-600/15",
};

export function scorePercent(a) {
  return a.total ? Math.round((a.correct / a.total) * 100) : 0;
}

export function scoreTone(percent) {
  if (percent >= 85) return { label: "ممتاز", text: "text-emerald-600", bg: "bg-emerald-500", soft: "bg-emerald-50" };
  if (percent >= 70) return { label: "جيد جداً", text: "text-teal-600", bg: "bg-teal-500", soft: "bg-teal-50" };
  if (percent >= 50) return { label: "مقبول", text: "text-amber-600", bg: "bg-amber-500", soft: "bg-amber-50" };
  return { label: "يحتاج مراجعة", text: "text-rose-600", bg: "bg-rose-500", soft: "bg-rose-50" };
}

export function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(iso, withTime = false) {
  return new Date(iso).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export function useQuizHistory() {
  const key = useUserKey("quizAttempts");
  const [attempts, setAttempts] = useLocalStore(key, EMPTY);

  const sorted = useMemo(
    () => [...attempts].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)),
    [attempts],
  );

  const saveAttempt = useCallback(
    (attempt) => setAttempts((prev) => [attempt, ...prev].slice(0, MAX_ATTEMPTS)),
    [setAttempts],
  );

  const removeAttempt = useCallback(
    (id) => setAttempts((prev) => prev.filter((a) => a.id !== id)),
    [setAttempts],
  );

  const clearAll = useCallback(() => setAttempts([]), [setAttempts]);

  return { attempts: sorted, saveAttempt, removeAttempt, clearAll };
}

// تمرير أسئلة جاهزة بين الصفحات (من المحادثة أو إعادة محاولة) بدون استهلاك حصة التوليد
const HANDOFF_KEY = "quizHandoff";

export function setQuizHandoff(data) {
  try {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(data));
  } catch {
    // تجاهل
  }
}

export function takeQuizHandoff() {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(HANDOFF_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ================== الحصة اليومية للتوليد بالذكاء الاصطناعي ==================

const QUOTA_ENDPOINT = "/api/quiz/quota";

export async function getQuota() {
  const res = await fetch(QUOTA_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`فشل تحميل الحصة: ${res.status}`);
  }

  const data = await res.json();

  return {
    remaining: data.remaining,
    quotaLimit: data.quotaLimit ?? data.limit,
  };
}