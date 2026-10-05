import { useMemo } from "react";
import { useBranchSubjects } from "../../../../lib/subjects";
import { scorePercent, useQuizHistory } from "../../../../lib/quiz";
import { useLocalStore, useUserKey } from "../../../../lib/storage";

const EMPTY_PLAN = {};
const EMPTY_DAY = { done: [], custom: [] };

export const todayKey = (d = new Date()) => d.toLocaleDateString("en-CA");
const dayOfYear = (d = new Date()) => Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);

export function useDailyPlan() {
  const { subjects, isLoading } = useBranchSubjects();
  const { attempts } = useQuizHistory();
  const storeKey = useUserKey("dailyPlan");
  const [plan, setPlan] = useLocalStore(storeKey, EMPTY_PLAN);

  const today = todayKey();
  const day = plan[today] ?? EMPTY_DAY;

  // مواد اليوم: الأضعف أولاً ثم تدوير يومي على باقي المواد
  const focusSubjects = useMemo(() => {
    if (!subjects.length) return [];
    const avg = (id) => {
      const list = attempts.filter((a) => a.subjectId === id);
      return list.length ? list.map(scorePercent).reduce((x, y) => x + y, 0) / list.length : null;
    };
    const weak = subjects
      .map((s) => ({ s, avg: avg(s.id) }))
      .filter((x) => x.avg !== null && x.avg < 60)
      .sort((a, b) => a.avg - b.avg)
      .map((x) => x.s);
    const offset = dayOfYear() % subjects.length;
    const rotated = [...subjects.slice(offset), ...subjects.slice(0, offset)];
    return Array.from(new Map([...weak, ...rotated].map((s) => [s.id, s])).values()).slice(0, 2);
  }, [subjects, attempts]);

  const tasks = useMemo(() => {
    const list = [];
    focusSubjects.forEach((s, i) => {
      list.push({
        id: `quiz-${s.id}`,
        kind: "quiz",
        title: `حل كويز في ${s.title}`,
        hint: i === 0 ? "10 أسئلة بمستوى متوسط" : "5 أسئلة سريعة للمراجعة",
        href: `/quizzes?subject=${s.id}`,
        minutes: i === 0 ? 20 : 10,
        auto: true,
      });
      list.push({
        id: `ai-${s.id}`,
        kind: "ai",
        title: `اسأل المساعد الذكي في ${s.title}`,
        hint: "اطلب شرح أصعب درس واجهته هذا الأسبوع",
        href: `/ai-path?subject=${s.id}`,
        minutes: 10,
      });
    });
    if (focusSubjects[0]) {
      list.push({
        id: `read-${focusSubjects[0].id}`,
        kind: "read",
        title: `اقرأ 25 دقيقة من كتاب ${focusSubjects[0].title}`,
        hint: "استخدم مؤقت التركيز لجلسة مركّزة",
        href: "/home",
        minutes: 25,
      });
    }
    if (attempts.some((a) => a.correct < a.total)) {
      list.push({
        id: "review-mistakes",
        kind: "review",
        title: "راجع أخطاء آخر كويز",
        hint: "اقرأ شرح كل إجابة خاطئة",
        href: `/exams/archive?attempt=${attempts[0].id}`,
        minutes: 10,
      });
    }
    return list;
  }, [focusSubjects, attempts]);

  // مهمة الكويز تُعلّم تلقائياً عند حل كويز لتلك المادة اليوم
  const solvedToday = useMemo(
    () => new Set(attempts.filter((a) => todayKey(new Date(a.finishedAt)) === today).map((a) => a.subjectId)),
    [attempts, today],
  );

  const isDone = (t) => day.done.includes(t.id) || (t.auto && solvedToday.has(t.id.replace("quiz-", "")));

  function updateDay(fn) {
    setPlan((prev) => {
      // نحتفظ بآخر 30 يوماً فقط
      const next = { ...prev, [today]: fn(prev[today] ?? EMPTY_DAY) };
      return Object.fromEntries(Object.entries(next).sort(([a], [b]) => b.localeCompare(a)).slice(0, 30));
    });
  }

  const toggle = (id) =>
    updateDay((d) => ({ ...d, done: d.done.includes(id) ? d.done.filter((x) => x !== id) : [...d.done, id] }));

  const toggleCustom = (id) =>
    updateDay((d) => ({ ...d, custom: d.custom.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }));

  const removeCustom = (id) => updateDay((d) => ({ ...d, custom: d.custom.filter((x) => x.id !== id) }));

  // يرجّع true إذا انضافت المهمة
  function addCustom(text) {
    const t = text.trim();
    if (!t) return false;
    updateDay((d) => ({ ...d, custom: [...d.custom, { id: crypto.randomUUID(), text: t, done: false }] }));
    return true;
  }

  // الإحصائيات
  const total = tasks.length + day.custom.length;
  const completed = tasks.filter(isDone).length + day.custom.filter((c) => c.done).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const minutesLeft = tasks.filter((t) => !isDone(t)).reduce((s, t) => s + t.minutes, 0);

  // الأيام النشطة (كويز أو مهمة منجزة) → الأسبوع + السلسلة المتتالية
  const activeDays = useMemo(() => {
    const set = new Set(attempts.map((a) => todayKey(new Date(a.finishedAt))));
    for (const [k, v] of Object.entries(plan)) {
      if (v.done.length || v.custom.some((c) => c.done)) set.add(k);
    }
    return set;
  }, [attempts, plan]);

  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = todayKey(d);
    return {
      key,
      label: d.toLocaleDateString("ar-EG", { weekday: "short" }),
      num: d.getDate(),
      active: activeDays.has(key),
      isToday: key === today,
    };
  });

  const streak = useMemo(() => {
    const d = new Date();
    if (!activeDays.has(todayKey(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (activeDays.has(todayKey(d))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [activeDays]);

  const dateLabel = new Date().toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" });

  return {
    isLoading,
    tasks,
    custom: day.custom,
    isDone,
    toggle,
    toggleCustom,
    removeCustom,
    addCustom,
    total,
    completed,
    percent,
    minutesLeft,
    week,
    streak,
    dateLabel,
  };
}