import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Flag, LogOut } from "lucide-react";
import { DIFFICULTY_LABELS, DIFFICULTY_STYLES, formatDuration } from "../../../lib/quiz";

export default function QuizPlayer({ questions, subjectName, difficulty, onFinish, onExit }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const question = questions[current];
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const isLast = current === questions.length - 1;

  function choose(label) {
    setAnswers((prev) => ({ ...prev, [question.id]: label }));
  }

  function finish() {
    const full = {};
    for (const q of questions) full[q.id] = answers[q.id] ?? null;
    onFinish({ answers: full, durationSec: Math.floor((Date.now() - startedAt.current) / 1000) });
  }

  // اختصارات لوحة المفاتيح: 1-4 أو A-D للاختيار، الأسهم للتنقل
  useEffect(() => {
    function onKey(e) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const numericIndex = "1234".indexOf(e.key);
      const letterIndex = "abcd".indexOf(e.key.toLowerCase());
      const idx = numericIndex >= 0 ? numericIndex : letterIndex;

      if (idx >= 0 && question.choices[idx]) {
        setAnswers((prev) => ({ ...prev, [question.id]: question.choices[idx].label }));
      } else if (e.key === "ArrowLeft") {
        setCurrent((c) => Math.min(questions.length - 1, c + 1));
      } else if (e.key === "ArrowRight") {
        setCurrent((c) => Math.max(0, c - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, questions.length]);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_260px]">
      {/* بطاقة السؤال */}
      <div className="order-2 lg:order-1">
        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_20px_50px_-30px_rgba(0,44,90,0.35)] sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#002C5A]/[0.06] px-3 py-1 text-xs font-semibold text-[#002C5A]">
                {subjectName}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${DIFFICULTY_STYLES[difficulty]}`}>
                {DIFFICULTY_LABELS[difficulty]}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-500">
              السؤال <b className="text-[#002C5A]">{current + 1}</b> من {questions.length}
            </span>
          </div>

          {/* شريط التقدم */}
          <div className="mb-7 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#12897A] to-[#38B793] transition-all duration-500"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>

          <h2
            key={question.id}
            dir="auto"
            className="animate-toast-in whitespace-pre-wrap text-lg font-bold leading-8 text-[#002C5A] sm:text-xl sm:leading-9"
          >
            {question.questionText}
          </h2>

          <div role="radiogroup" className="mt-7 grid gap-3">
            {question.choices.map((choice, i) => {
              const selected = answers[question.id] === choice.label;
              return (
                <button
                  key={`${question.id}-${choice.label}`}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => choose(choice.label)}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className={`group flex w-full animate-toast-in items-center [animation-fill-mode:backwards] gap-4 rounded-2xl border-2 px-4 py-3.5 text-right transition-all duration-200 ${
                    selected
                      ? "border-[#12897A] bg-[#12897A]/[0.06] shadow-[0_8px_20px_-12px_rgba(18,137,122,0.6)]"
                      : "border-slate-100 bg-white hover:border-[#12897A]/40 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                      selected ? "bg-[#12897A] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-[#12897A]/10 group-hover:text-[#12897A]"
                    }`}
                  >
                    {choice.label}
                  </span>
                  <span dir="auto" className="flex-1 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                    {choice.text}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
              السابق
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={() => (answeredCount < questions.length ? setConfirmFinish(true) : finish())}
                className="flex items-center gap-2 rounded-full bg-[#12897A] px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#12897A]/25 transition-all hover:-translate-y-0.5 hover:bg-[#0F766A]"
              >
                <Flag size={16} />
                إنهاء وتصحيح
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrent((c) => c + 1)}
                className="flex items-center gap-1.5 rounded-full bg-[#002C5A] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#002C5A]/20 transition-all hover:-translate-y-0.5 hover:bg-[#0B3B6E]"
              >
                التالي
                <ChevronLeft size={17} />
              </button>
            )}
          </div>
        </div>
        <p className="mt-3 hidden text-center text-xs text-slate-400 sm:block">
          تلميح: استخدم الأرقام 1-4 للاختيار والأسهم للتنقل بين الأسئلة
        </p>
      </div>

      {/* اللوحة الجانبية */}
      <aside className="order-1 flex flex-col gap-4 lg:order-2">
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:flex-col lg:items-stretch lg:gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#002C5A]/[0.06] text-[#002C5A]">
              <Clock size={19} />
            </span>
            <div>
              <p className="text-xs text-slate-400">الوقت المنقضي</p>
              <p className="font-mono text-lg font-bold text-[#002C5A]" dir="ltr">
                {formatDuration(elapsed)}
              </p>
            </div>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-xs text-slate-400">تمت الإجابة</p>
            <p className="text-lg font-bold text-[#12897A]">
              {answeredCount}/{questions.length}
            </p>
          </div>
        </div>

        <div className="hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:block">
          <p className="mb-3 text-xs font-semibold text-slate-500">الانتقال السريع</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`السؤال ${i + 1}`}
                className={`h-9 rounded-lg text-sm font-semibold transition-all ${
                  i === current
                    ? "bg-[#002C5A] text-white ring-2 ring-[#002C5A]/20 ring-offset-2"
                    : answers[q.id]
                      ? "bg-[#12897A]/10 text-[#12897A]"
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="hidden items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 lg:flex"
        >
          <LogOut size={15} />
          الخروج من الكويز
        </button>
      </aside>

      {/* تأكيد الإنهاء مع أسئلة غير مجابة */}
      {confirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setConfirmFinish(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm animate-toast-in rounded-3xl bg-white p-6 text-center shadow-2xl"
          >
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Flag size={24} />
            </span>
            <h3 className="text-lg font-bold text-[#002C5A]">لم تجب على كل الأسئلة</h3>
            <p className="mt-2 text-sm text-slate-500">
              بقي {questions.length - answeredCount} سؤال بدون إجابة وسيُحتسب خطأ. هل تريد الإنهاء؟
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={finish}
                className="flex-1 rounded-full bg-[#002C5A] py-2.5 text-sm font-semibold text-white hover:bg-[#0B3B6E]"
              >
                إنهاء الآن
              </button>
              <button
                type="button"
                onClick={() => setConfirmFinish(false)}
                className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                متابعة الحل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}