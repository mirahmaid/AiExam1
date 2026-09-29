// دوال التواصل مع الباك اند الخاصة بالكويزات: توليد أسئلة، رصيد التوليد اليومي.
// المسارات تحت هي أفضل تخمين — عدّليها إذا اختلفت عن الباك اند الحقيقي.
import { fetchWithAuth } from "./http";

const GENERATE_QUESTIONS_PATH = "/questions/generate";
const QUOTA_PATH = "/questions/quota";

/**
 * يولّد أسئلة كويز جديدة بالذكاء الاصطناعي.
 * @param {{ subjectId: string, difficulty: "EASY"|"MEDIUM"|"HARD", count: number }} params
 * @returns {Promise<{ questions: Array }>}
 */
export async function generateQuestions({ subjectId, difficulty, count }) {
  const res = await fetchWithAuth(GENERATE_QUESTIONS_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subjectId, difficulty, count }),
  });

  if (!res.ok) {
    const err = new Error(`generateQuestions failed: ${res.status}`);
    err.status = res.status;
    try {
      err.body = await res.json();
    } catch {
      // تجاهل — ما في body صالح
    }
    throw err;
  }

  return res.json();
}

/**
 * يجلب رصيد توليد الأسئلة اليومي المتبقي للمستخدم الحالي.
 * @returns {Promise<{ remaining: number, quotaLimit: number }>}
 */
export async function getQuota() {
  const res = await fetchWithAuth(QUOTA_PATH);

  if (!res.ok) {
    const err = new Error(`getQuota failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

/** يحوّل أي خطأ لرسالة عربية مفهومة تُعرض للمستخدم مباشرة. */
export function describeError(err) {
  if (err?.status === 429) return "استهلكت رصيد التوليد اليومي، حاول غداً";
  if (err?.status === 401) return "انتهت جلستك، سجّل الدخول من جديد";
  if (err?.status >= 500) return "حدث خطأ بالخادم، حاول لاحقاً";
  if (err instanceof TypeError) return "تحقق من اتصالك بالإنترنت وحاول مرة أخرى";
  return "حدث خطأ غير متوقع، حاول مرة أخرى";
}