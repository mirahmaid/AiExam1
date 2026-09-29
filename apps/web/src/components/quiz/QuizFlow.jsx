import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, BookOpen, Check, Sparkles, Wand2 } from "lucide-react";
import { describeError, generateQuestions } from "../../../lib/api";

import {
  DIFFICULTY_LABELS,
  formatDate,
  scorePercent,
  scoreTone,
  takeQuizHandoff,
  useQuizHistory,
} from "../../../lib/quiz";

import { useBranchSubjects } from "../../../lib/subjects";
import QuizPlayer from "./QuizPlayer";
import QuizResult from "./QuizResult";
import QuotaCard from "./QuotaCard";

const QUESTION_COUNTS = [5, 10, 15, 20];

const DIFFICULTIES = [
  { value: "EASY", hint: "مراجعة المفاهيم الأساسية", dot: "bg-emerald-500" },
  { value: "MEDIUM", hint: "مستوى امتحان التوجيهي", dot: "bg-amber-500" },
  { value: "HARD", hint: "أسئلة تحليلية للمتفوقين", dot: "bg-rose-500" },
];

const LOADING_TIPS = [
  "نبحث في بنك الامتحانات الوزارية عن أسئلة مرجعية...",
  "نصمم أسئلة جديدة بنفس أسلوب امتحانات التوجيهي...",
  "نجهّز الشروحات لكل إجابة...",
];

export default function QuizFlow({ initialSubjectId, retakeAttemptId, fromHandoff }) {
  const { subjects, isLoading: subjectsLoading, error: subjectsError, branchName } = useBranchSubjects();
  const { attempts, saveAttempt } = useQuizHistory();

  const [stage, setStage] = useState({ name: "setup" });
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? null);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [count, setCount] = useState(10);
  const [error, setError] = useState("");
  const [tipIndex, setTipIndex] = useState(0);
  const [quotaKey, setQuotaKey] = useState(0);
  const runCounter = useRef(0);
  const autoStarted = useRef(false);

  function play(quiz) {
    runCounter.current += 1;
    setStage({ name: "playing", quiz, runId: runCounter.current });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // بدء مباشر: أسئلة من المحادثة أو إعادة محاولة من الأرشيف (بدون استهلاك الرصيد)
  useEffect(() => {
    if (autoStarted.current) return;

    let quiz = null;
    if (fromHandoff) {
      quiz = takeQuizHandoff();
    } else if (retakeAttemptId) {
      // السجل يُقرأ من التخزين المحلي بعد الـ hydration — ننتظر وصوله
      const old = attempts.find((a) => a.id === retakeAttemptId);
      if (!old) return;
      quiz = { ...old, source: "RETAKE" };
    }

    autoStarted.current = true;
    if (quiz?.questions.length) play(quiz);
  }, [fromHandoff, retakeAttemptId, attempts]);

  useEffect(() => {
    if (stage.name !== "generating") return;
    const id = setInterval(() => setTipIndex((t) => (t + 1) % LOADING_TIPS.length), 2600);
    return () => clearInterval(id);
  }, [stage.name]);

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  async function start() {
    if (!selectedSubject) return;
    setError("");
    setStage({ name: "generating" });
    try {
      const res = await generateQuestions({ subjectId: selectedSubject.id, difficulty, count });
      if (!res.questions?.length) throw new Error("empty");
      play({
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.title,
        difficulty,
        source: "GENERATED",
        questions: res.questions,
      });
    } catch (err) {
      const message = err instanceof Error && err.message === "empty" ? "لم يتم توليد أي أسئلة، حاول مرة أخرى" : describeError(err);
      setError(message);
      setStage({ name: "setup" });
    } finally {
      setQuotaKey((k) => k + 1);
    }
  }

  function handleFinish(quiz, answers, durationSec) {
    const correct = quiz.questions.filter((q) => answers[q.id] === q.correctAnswer).length;
    const attempt = {
      id: crypto.randomUUID(),
      subjectId: quiz.subjectId,
      subjectName: quiz.subjectName,
      difficulty: quiz.difficulty,
      source: quiz.source,
      questions: quiz.questions,
      answers,
      correct,
      total: quiz.questions.length,
      durationSec,
      finishedAt: new Date().toISOString(),
    };
    saveAttempt(attempt);
    setStage({ name: "result", quiz, attempt });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- مراحل العرض ----------

  if (stage.name === "playing") {
    const { quiz } = stage;
    return (
      <QuizPlayer
        key={stage.runId}
        questions={quiz.questions}
        subjectName={quiz.subjectName}
        difficulty={quiz.difficulty}
        onFinish={({ answers, durationSec }) => handleFinish(quiz, answers, durationSec)}
        onExit={() => setStage({ name: "setup" })}
      />
    );
  }

  if (stage.name === "result") {
    return (
      <QuizResult
        attempt={stage.attempt}
        onRetake={() => play({ ...stage.quiz, source: "RETAKE" })}
        onNewQuiz={() => setStage({ name: "setup" })}
      />
    );
  }

  if (stage.name === "generating") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-[28px] bg-white px-8 py-16 text-center shadow-[0_25px_60px_-35px_rgba(0,44,90,0.45)] ring-1 ring-slate-100">
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#12897A]/15" />
          <span className="absolute inset-2 animate-pulse rounded-full bg-[#12897A]/10" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#002C5A] to-[#12897A] text-white shadow-lg">
            <Wand2 size={28} />
          </span>
        </div>
        <h2 className="text-xl font-bold text-[#002C5A]">نجهّز كويزك الآن</h2>
        <p key={tipIndex} className="mt-3 min-h-6 animate-toast-in text-sm text-slate-500">
          {LOADING_TIPS[tipIndex]}
        </p>
        <p className="mt-6 text-xs text-slate-400">
          {selectedSubject?.title} · {DIFFICULTY_LABELS[difficulty]} · {count} أسئلة
        </p>
      </div>
    );
  }

  // ---------- الإعداد ----------
  const recentAttempts = attempts.slice(0, 4);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        {error && (
          <div role="alert" className="flex animate-toast-in items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1">{error}</p>
            <button type="button" onClick={() => setError("")} className="text-xs font-semibold hover:underline">
              إخفاء
            </button>
          </div>
        )}

        {/* 1. المادة */}
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
          <StepTitle step={1} title="اختر المادة" subtitle={branchName ? `مواد الفرع ${branchName}` : undefined} />
          {subjectsLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : subjectsError || subjects.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
              {subjectsError ?? "لا توجد مواد لهذا الفرع حالياً"}
            </p>
          ) : (
            <div role="radiogroup" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {subjects.map((s) => {
                const active = s.id === subjectId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSubjectId(s.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-center transition-all ${
                      active
                        ? "border-[#12897A] bg-[#12897A]/[0.05] shadow-[0_10px_25px_-15px_rgba(18,137,122,0.7)]"
                        : "border-slate-100 hover:-translate-y-0.5 hover:border-[#12897A]/40"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#12897A] text-white">
                        <Check size={12} />
                      </span>
                    )}
                    <span className="relative h-10 w-10">
                      <img src={s.icon} alt="" className="h-full w-full object-contain" />
                    </span>
                    <span className="text-sm font-semibold text-[#002C5A]">{s.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. الصعوبة والعدد */}
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
          <StepTitle step={2} title="حدد المستوى وعدد الأسئلة" />
          <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">
            {DIFFICULTIES.map((d) => {
              const active = d.value === difficulty;
              return (
                <button
                  key={d.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDifficulty(d.value)}
                  className={`rounded-2xl border-2 p-4 text-right transition-all ${
                    active ? "border-[#002C5A] bg-[#002C5A]/[0.04]" : "border-slate-100 hover:border-[#002C5A]/30"
                  }`}
                >
                  <span className="flex items-center gap-2 font-bold text-[#002C5A]">
                    <span className={`h-2.5 w-2.5 rounded-full ${d.dot}`} />
                    {DIFFICULTY_LABELS[d.value]}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">{d.hint}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-500">عدد الأسئلة:</span>
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                aria-pressed={n === count}
                className={`h-10 w-12 rounded-xl text-sm font-bold transition-all ${
                  n === count ? "bg-[#002C5A] text-white shadow-md shadow-[#002C5A]/20" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={start}
          disabled={!selectedSubject}
          className="group flex items-center justify-center gap-3 rounded-full bg-gradient-to-l from-[#002C5A] to-[#12897A] py-4 text-base font-bold text-white shadow-lg shadow-[#002C5A]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Sparkles size={20} />
          {selectedSubject ? `ابدأ كويز ${selectedSubject.title}` : "اختر مادة للبدء"}
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        </button>
      </div>

      {/* الشريط الجانبي */}
      <aside className="flex flex-col gap-5">
        <QuotaCard refreshKey={quotaKey} />

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-[#002C5A]">آخر محاولاتك</p>
            <Link to="/exams/archive" className="text-xs font-semibold text-[#12897A] hover:underline">
              عرض الكل
            </Link>
          </div>
          {recentAttempts.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <BookOpen size={26} className="mb-2 text-slate-300" />
              <p className="text-xs text-slate-400">لم تحل أي كويز بعد — ابدأ الآن!</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentAttempts.map((a) => {
                const p = scorePercent(a);
                const tone = scoreTone(p);
                return (
                  <li key={a.id}>
                    <Link
                      to={`/exams/archive?attempt=${a.id}`}
                      className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-slate-50"
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${tone.soft} ${tone.text}`}>
                        {p}%
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#002C5A]">{a.subjectName}</span>
                        <span className="block text-xs text-slate-400">
                          {DIFFICULTY_LABELS[a.difficulty]} · {formatDate(a.finishedAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#E8F7F3] to-[#EFF6FF] p-5">
          <p className="text-sm font-bold text-[#002C5A]">💡 نصيحة</p>
          <p className="mt-1.5 text-xs leading-6 text-slate-600">
            الأسئلة تُولّد بالذكاء الاصطناعي اعتماداً على امتحانات التوجيهي السابقة. راجع شرح كل إجابة خاطئة قبل المحاولة التالية لتحقيق أفضل تحسّن.
          </p>
        </div>
      </aside>
    </div>
  );
}

function StepTitle({ step, title, subtitle }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#002C5A] text-sm font-bold text-white">
        {step}
      </span>
      <div>
        <h2 className="font-bold text-[#002C5A]">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}