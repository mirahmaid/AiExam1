import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  BookOpen,
  CalendarCheck,
  Check,
  ChevronLeft,
  ListChecks,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Target,
  Timer,
  Trash2,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import ScoreRing from "@/components/quiz/ScoreRing";
import { useBranchSubjects } from "../../../../lib/subjects";
import { scorePercent, useQuizHistory } from "../../../../lib/quiz";
import { useLocalStore, useUserKey } from "../../../../lib/storage";
const EMPTY_PLAN = {};
const EMPTY_DAY = { done: [], custom: [] };

function todayKey(d = new Date()) {
  return d.toLocaleDateString("en-CA");
}

function dayOfYear(d = new Date()) {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
}

export default function DailyPlanPage() {
  return (
    <AppShell>
      <DailyPlan />
    </AppShell>
  );
}

function DailyPlan() {
  const { subjects, isLoading } = useBranchSubjects();
  const { attempts } = useQuizHistory();
  const storeKey = useUserKey("dailyPlan");
  const [plan, setPlan] = useLocalStore(storeKey, EMPTY_PLAN);
  const [newTask, setNewTask] = useState("");

  const today = todayKey();
  const day = plan[today] ?? EMPTY_DAY;

  // اختيار مواد اليوم: الأضعف أولاً ثم تدوير يومي على باقي المواد
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
        title: `حل كويز في ${s.title}`,
        hint: i === 0 ? "10 أسئلة بمستوى متوسط" : "5 أسئلة سريعة للمراجعة",
        href: `/quizzes?subject=${s.id}`,
        icon: ListChecks,
        minutes: i === 0 ? 20 : 10,
        auto: true,
      });
      list.push({
        id: `ai-${s.id}`,
        title: `اسأل المساعد الذكي في ${s.title}`,
        hint: "اطلب شرح أصعب درس واجهته هذا الأسبوع",
        href: `/ai-path?subject=${s.id}`,
        icon: Bot,
        minutes: 10,
      });
    });
    if (focusSubjects[0]) {
      list.push({
        id: `read-${focusSubjects[0].id}`,
        title: `اقرأ 25 دقيقة من كتاب ${focusSubjects[0].title}`,
        hint: "استخدم مؤقت التركيز لجلسة مركّزة",
        href: "/home",
        icon: BookOpen,
        minutes: 25,
      });
    }
    if (attempts.some((a) => a.correct < a.total)) {
      list.push({
        id: "review-mistakes",
        title: "راجع أخطاء آخر كويز",
        hint: "اقرأ شرح كل إجابة خاطئة",
        href: `/exams/archive?attempt=${attempts[0].id}`,
        icon: RotateCcw,
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

  function toggle(id) {
    updateDay((d) => ({ ...d, done: d.done.includes(id) ? d.done.filter((x) => x !== id) : [...d.done, id] }));
  }

  function addCustom(e) {
    e.preventDefault();
    const text = newTask.trim();
    if (!text) return;
    updateDay((d) => ({ ...d, custom: [...d.custom, { id: crypto.randomUUID(), text, done: false }] }));
    setNewTask("");
  }

  const total = tasks.length + day.custom.length;
  const completed = tasks.filter(isDone).length + day.custom.filter((c) => c.done).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const minutesLeft = tasks.filter((t) => !isDone(t)).reduce((s, t) => s + t.minutes, 0);

  // نشاط آخر 7 أيام
  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = todayKey(d);
    const quizzes = attempts.filter((a) => todayKey(new Date(a.finishedAt)) === key).length;
    const saved = plan[key];
    return {
      key,
      label: d.toLocaleDateString("ar-EG", { weekday: "short" }),
      num: d.getDate(),
      active: quizzes > 0 || (saved?.done.length ?? 0) > 0 || (saved?.custom.some((c) => c.done) ?? false),
      isToday: key === today,
    };
  });

  const dateLabel = new Date().toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <PageHeader
        eyebrow={dateLabel}
        icon={CalendarCheck}
        title="خطة اليوم"
        description="خطة دراسية ذكية تتجدد يومياً وتركّز على المواد التي تحتاجها أكثر، مع مؤقت تركيز ومهام خاصة بك."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          {/* شريط الأسبوع */}
          <div className="grid grid-cols-7 gap-2 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-100 sm:p-4">
            {week.map((d) => (
              <div
                key={d.key}
                className={`flex flex-col items-center gap-1 rounded-2xl py-2.5 text-center ${
                  d.isToday ? "bg-[#002C5A] text-white shadow-md shadow-[#002C5A]/25" : "text-slate-500"
                }`}
              >
                <span className="text-[11px]">{d.label}</span>
                <span className="text-base font-bold">{d.num}</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    d.active ? (d.isToday ? "bg-[#38B793]" : "bg-[#12897A]") : d.isToday ? "bg-white/30" : "bg-slate-200"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* المهام */}
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#002C5A]">مهام اليوم</h2>
              <span className="text-xs text-slate-400">
                {completed}/{total} مكتملة
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {tasks.map((t) => {
                  const done = isDone(t);
                  const Icon = t.icon;
                  return (
                    <li
                      key={t.id}
                      className={`group flex items-center gap-3 rounded-2xl border p-3.5 transition-all sm:gap-4 ${
                        done ? "border-emerald-100 bg-emerald-50/50" : "border-slate-100 hover:border-[#12897A]/30"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(t.id)}
                        aria-pressed={done}
                        aria-label={done ? "إلغاء الإكمال" : "تعليم كمكتملة"}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-[#12897A]"
                        }`}
                      >
                        {done && <Check size={15} strokeWidth={3} />}
                      </button>
                      <span
                        className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex ${
                          done ? "bg-emerald-100 text-emerald-600" : "bg-[#002C5A]/[0.06] text-[#002C5A]"
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${done ? "text-slate-400 line-through" : "text-[#002C5A]"}`}>{t.title}</p>
                        <p className="text-xs text-slate-400">
                          {t.hint} · {t.minutes} دقيقة
                        </p>
                      </div>
                      {t.href && !done && (
                        <Link
                          to={t.href}
                          className="flex shrink-0 items-center gap-1 rounded-full bg-[#002C5A]/[0.06] px-3 py-1.5 text-xs font-semibold text-[#002C5A] transition-colors hover:bg-[#002C5A] hover:text-white"
                        >
                          ابدأ
                          <ChevronLeft size={14} />
                        </Link>
                      )}
                    </li>
                  );
                })}

                {day.custom.map((c) => (
                  <li
                    key={c.id}
                    className={`group flex items-center gap-3 rounded-2xl border p-3.5 sm:gap-4 ${
                      c.done ? "border-emerald-100 bg-emerald-50/50" : "border-dashed border-slate-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updateDay((d) => ({ ...d, custom: d.custom.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)) }))
                      }
                      aria-pressed={c.done}
                      aria-label={c.done ? "إلغاء الإكمال" : "تعليم كمكتملة"}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        c.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-[#12897A]"
                      }`}
                    >
                      {c.done && <Check size={15} strokeWidth={3} />}
                    </button>
                    <p className={`flex-1 text-sm font-medium ${c.done ? "text-slate-400 line-through" : "text-slate-700"}`}>{c.text}</p>
                    <button
                      type="button"
                      onClick={() => updateDay((d) => ({ ...d, custom: d.custom.filter((x) => x.id !== c.id) }))}
                      aria-label="حذف المهمة"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 opacity-100 transition-all hover:bg-rose-50 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={addCustom} className="mt-5 flex gap-2">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                maxLength={120}
                placeholder="أضف مهمة خاصة بك... (مثلاً: حل ورقة عمل الفيزياء)"
                className="flex-1 rounded-full border border-slate-200 bg-slate-50/60 px-5 py-2.5 text-sm outline-none transition-all focus:border-[#12897A] focus:bg-white focus:ring-2 focus:ring-[#12897A]/15"
              />
              <button
                type="submit"
                disabled={!newTask.trim()}
                aria-label="إضافة مهمة"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12897A] text-white shadow-md shadow-[#12897A]/25 transition-all hover:bg-[#0F766A] disabled:opacity-40"
              >
                <Plus size={20} />
              </button>
            </form>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="flex flex-col items-center rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
            <ScoreRing percent={percent} size={150} stroke={13} label="من خطة اليوم" />
            <p className="mt-4 text-sm font-semibold text-[#002C5A]">
              {percent === 100 ? "أنجزت خطة اليوم بالكامل! 🎉" : percent >= 50 ? "أكثر من النصف — واصل!" : "لنبدأ يوماً منتجاً 💪"}
            </p>
            {minutesLeft > 0 && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <Target size={13} />
                متبقٍ حوالي {minutesLeft} دقيقة من المهام المقترحة
              </p>
            )}
          </div>

          <FocusTimer />
        </aside>
      </div>
    </>
  );
}

const MODES = {
  focus: { label: "تركيز", seconds: 25 * 60 },
  break: { label: "استراحة", seconds: 5 * 60 },
};

function FocusTimer() {
  const [mode, setMode] = useState("focus");
  const [left, setLeft] = useState(MODES.focus.seconds);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left > 0 || !running) return;
    setRunning(false);
    if (mode === "focus") setSessions((s) => s + 1);
    const next = mode === "focus" ? "break" : "focus";
    setMode(next);
    setLeft(MODES[next].seconds);
  }, [left, running, mode]);

  function switchMode(m) {
    setMode(m);
    setRunning(false);
    setLeft(MODES[m].seconds);
  }

  const total = MODES[mode].seconds;
  const progress = ((total - left) / total) * 100;
  const mm = Math.floor(left / 60).toString().padStart(2, "0");
  const ss = (left % 60).toString().padStart(2, "0");

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#002C5A] to-[#0B3B6E] p-6 text-white shadow-[0_25px_50px_-25px_rgba(0,44,90,0.8)]">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-bold">
          <Timer size={18} />
          مؤقت التركيز
        </p>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px]">{sessions} جلسة اليوم</span>
      </div>

      <div className="flex rounded-full bg-white/10 p-1">
        {Object.keys(MODES).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${mode === m ? "bg-white text-[#002C5A]" : "text-white/70 hover:text-white"}`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      <p className="my-6 text-center font-mono text-6xl font-bold tracking-wider" dir="ltr" aria-live="polite">
        {mm}:{ss}
      </p>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#38B793] transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#38B793] py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-[#2FA383]"
        >
          {running ? <Pause size={17} /> : <Play size={17} />}
          {running ? "إيقاف مؤقت" : "ابدأ"}
        </button>
        <button
          type="button"
          onClick={() => switchMode(mode)}
          aria-label="إعادة ضبط"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <RotateCcw size={17} />
        </button>
      </div>
    </div>
  );
}