import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Check, ChevronLeft, Sparkles, Wand2 } from "lucide-react";
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
import { useToast } from "../ui/ToastProvider";
import QuizPlayer from "./QuizPlayer";
import QuizResult from "./QuizResult";
import QuotaCard from "./QuotaCard";
import SubjectIcon from "./SubjectIcon";

const QUESTION_COUNTS = [5, 10, 15, 20];

const DIFFICULTIES = [
  { value: "EASY", hint: "مراجعة المفاهيم الأساسية", dot: "bg-emerald-500", emoji: "🌱" },
  { value: "MEDIUM", hint: "مستوى امتحان التوجيهي", dot: "bg-amber-500", emoji: "⚡" },
  { value: "HARD", hint: "أسئلة تحليلية للمتفوقين", dot: "bg-rose-500", emoji: "🔥" },
];

const LOADING_TIPS = [
  "نبحث في بنك الامتحانات الوزارية عن أسئلة مرجعية...",
  "نصمم أسئلة جديدة بنفس أسلوب امتحانات التوجيهي...",
  "نجهّز الشروحات لكل إجابة...",
];

const section = "rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7";

export default function QuizFlow({ initialSubjectId, retakeAttemptId, fromHandoff }) {
  const { subjects, isLoading: subjectsLoading, error: subjectsError, branchName } = useBranchSubjects();
  const { attempts, saveAttempt } = useQuizHistory();
  const { showToast } = useToast();

  const [stage, setStage] = useState({ name: "setup" });
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? null);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [count, setCount] = useState(10);
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
      // لا فائدة من إعادة المحاولة إذا انتهى الرصيد اليومي
      showToast({ type: "error", message, onRetry: err?.status === 429 ? undefined : start });
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
    showToast({ type: "success", message: "تم حفظ محاولتك في الأرشيف 🎉" });
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
      <div className="relative mx-auto flex max-w-lg flex-col items-center overflow-hidden rounded-[34px] bg-[#0F2A4A] px-8 py-16 text-center text-white shadow-[0_30px_65px_-42px_rgba(15,42,74,.85)]">
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#2DD4BF]/10 blur-3xl" />
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#2DD4BF]/20" />
          <span className="absolute inset-2 animate-pulse rounded-full bg-[#2DD4BF]/15" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#0F8B78] text-[#0F2A4A] shadow-lg">
            <Wand2 size={28} />
          </span>
        </div>
        <h2 className="relative text-[24px] font-black">نجهّز كويزك الآن</h2>
        <p key={tipIndex} className="relative mt-3 min-h-7 animate-toast-in text-[14px] font-bold text-white/65">
          {LOADING_TIPS[tipIndex]}
        </p>
        <div className="relative mt-7 flex flex-wrap justify-center gap-2 text-[12px] font-black text-[#9FF6E9]">
          {[selectedSubject?.title, DIFFICULTY_LABELS[difficulty], `${count} أسئلة`].map((t) => (
            <span key={t} className="rounded-full bg-white/[.07] px-3 py-1.5 ring-1 ring-white/10">
              {t}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ---------- الإعداد ----------
  const recentAttempts = attempts.slice(0, 4);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
      <div className="flex flex-col gap-6">
        {/* 1. المادة */}
        <section className={section}>
          <StepTitle step={1} title="اختر المادة" subtitle={branchName ? `مواد الفرع ${branchName}` : undefined} />
          {subjectsLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-[22px] bg-[#F7FAFC]" />
              ))}
            </div>
          ) : subjectsError || subjects.length === 0 ? (
            <p className="rounded-2xl bg-[#F7FAFC] p-5 text-center text-[14px] font-bold text-slate-500">
              {subjectsError ?? "لا توجد مواد لهذا الفرع حالياً"}
            </p>
          ) : (
            <div role="radiogroup" aria-label="المادة" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {subjects.map((s) => {
                const active = s.id === subjectId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSubjectId(s.id)}
                    className={`group relative flex flex-col items-center gap-2.5 rounded-[22px] border-2 px-3 py-4 text-center transition-all duration-300 ${
                      active
                        ? "border-[#0F8B78] bg-[#E8F7F3] shadow-[0_14px_30px_-18px_rgba(15,139,120,.8)]"
                        : "border-transparent bg-[#F7FAFC] hover:-translate-y-1 hover:border-[#BFE8DD] hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-2.5 top-2.5 flex h-5 w-5 animate-toast-in items-center justify-center rounded-full bg-[#0F8B78] text-white">
                        <Check size={12} aria-hidden="true" />
                      </span>
                    )}
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8F7F3] to-[#C5E7DE] transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105">
                      <SubjectIcon src={s.icon} title={s.title} />
                    </span>
                    <span className="text-[14px] font-black text-[#0F2A4A]">{s.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. الصعوبة والعدد */}
        <section className={section}>
          <StepTitle step={2} title="حدد المستوى وعدد الأسئلة" />
          <div role="radiogroup" aria-label="المستوى" className="grid gap-3 sm:grid-cols-3">
            {DIFFICULTIES.map((d) => {
              const active = d.value === difficulty;
              return (
                <button
                  key={d.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDifficulty(d.value)}
                  className={`rounded-[22px] border-2 p-4 text-right transition-all duration-300 ${
                    active
                      ? "border-[#0F2A4A] bg-[#0F2A4A] text-white shadow-[0_18px_35px_-22px_rgba(15,42,74,.9)]"
                      : "border-transparent bg-[#F7FAFC] hover:-translate-y-0.5 hover:border-[#0F2A4A]/20 hover:bg-white"
                  }`}
                >
                  <span className="flex items-center gap-2 text-[15px] font-black">
                    <span aria-hidden="true">{d.emoji}</span>
                    {DIFFICULTY_LABELS[d.value]}
                    <span className={`mr-auto h-2.5 w-2.5 rounded-full ${d.dot}`} />
                  </span>
                  <span className={`mt-1.5 block text-[12px] font-bold ${active ? "text-white/60" : "text-slate-500"}`}>{d.hint}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="ml-1 text-[14px] font-black text-slate-500">عدد الأسئلة:</span>
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                aria-pressed={n === count}
                className={`h-11 w-14 rounded-full text-[14px] font-black transition-all ${
                  n === count
                    ? "bg-[#0F8B78] text-white shadow-md shadow-[#0F8B78]/25"
                    : "bg-[#F7FAFC] text-slate-500 hover:bg-[#E8F7F3] hover:text-[#0F8B78]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* ملخص + زر البدء */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-[30px] bg-[#0F2A4A] p-5 text-white shadow-[0_30px_60px_-40px_rgba(15,42,74,.8)] sm:p-6">
          <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[#2DD4BF]/10 blur-3xl" />
          <div className="relative">
            <p className="text-[12px] font-black text-[#9FF6E9]">جاهز للانطلاق؟</p>
            <p className="mt-1.5 text-[17px] font-black">
              {selectedSubject
                ? `${selectedSubject.title} · ${DIFFICULTY_LABELS[difficulty]} · ${count} أسئلة`
                : "اختر مادة لتبدأ رحلتك"}
            </p>
          </div>
          <button
            type="button"
            onClick={start}
            disabled={!selectedSubject}
            className="group relative inline-flex items-center gap-2.5 rounded-full bg-[#2DD4BF] px-7 py-3.5 text-[15px] font-black text-[#0F2A4A] transition-all hover:-translate-y-0.5 hover:shadow-[0_15px_30px_-15px_rgba(45,212,191,.9)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <Sparkles size={18} aria-hidden="true" />
            ابدأ الكويز
            <ArrowLeft size={17} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
          </button>
        </div>
      </div>

      {/* الشريط الجانبي */}
      <aside className="flex flex-col gap-5">
        <QuotaCard refreshKey={quotaKey} />

        <div className="rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[16px] font-black text-[#0F2A4A]">آخر محاولاتك</p>
            <Link to="/exams/archive" className="text-[13px] font-black text-[#0F8B78] hover:underline">
              عرض الكل
            </Link>
          </div>
          {recentAttempts.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-[#F7FAFC] py-7 text-center">
              <BookOpen size={26} className="mb-2 text-slate-300" aria-hidden="true" />
              <p className="text-[13px] font-bold text-slate-400">لم تحل أي كويز بعد — ابدأ الآن!</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {recentAttempts.map((a) => {
                const p = scorePercent(a);
                const tone = scoreTone(p);
                return (
                  <li key={a.id}>
                    <Link
                      to={`/exams/archive?attempt=${a.id}`}
                      className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-[#F7FAFC]"
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[14px] font-black ${tone.soft} ${tone.text}`}>
                        {p}%
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-black text-[#0F2A4A]">{a.subjectName}</span>
                        <span className="block text-[12px] font-bold text-slate-400">
                          {DIFFICULTY_LABELS[a.difficulty]} · {formatDate(a.finishedAt)}
                        </span>
                      </span>
                      <ChevronLeft size={16} aria-hidden="true" className="text-slate-300 transition group-hover:-translate-x-1 group-hover:text-[#0F8B78]" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-[30px] bg-[#E8F7F3] p-5">
          <p className="text-[14px] font-black text-[#0F8B78]">💡 نصيحة</p>
          <p className="mt-2 text-[13px] font-bold leading-7 text-slate-600">
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
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F2A4A] text-[14px] font-black text-white">{step}</span>
      <div>
        <h2 className="text-[18px] font-black text-[#0F2A4A]">{title}</h2>
        {subtitle && <p className="text-[12px] font-bold text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}