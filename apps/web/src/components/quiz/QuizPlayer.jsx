import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Flag, LogOut } from "lucide-react";
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
  const progress = ((current + 1) / questions.length) * 100;

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
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_270px]">
      {/* بطاقة السؤال */}
      <div className="order-2 lg:order-1">
        <div className="rounded-[34px] bg-white p-5 shadow-[0_30px_65px_-45px_rgba(15,42,74,.6)] ring-1 ring-slate-100 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#E8F7F3] px-3.5 py-1.5 text-[12px] font-black text-[#0F8B78]">{subjectName}</span>
              <span className={`rounded-full px-3 py-1 text-[12px] font-black ring-1 ${DIFFICULTY_STYLES[difficulty]}`}>
                {DIFFICULTY_LABELS[difficulty]}
              </span>
            </div>
            <span className="text-[13px] font-bold text-slate-500">
              السؤال <b className="text-[16px] font-black text-[#0F2A4A]">{current + 1}</b> من {questions.length}
            </span>
          </div>

          {/* شريط التقدم */}
          <div className="mb-7 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#2DD4BF] to-[#0F8B78] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2
            key={question.id}
            dir="auto"
            className="animate-toast-in whitespace-pre-wrap text-[19px] font-black leading-9 text-[#0F2A4A] sm:text-[22px] sm:leading-10"
          >
            {question.questionText}
          </h2>

          <div role="radiogroup" aria-label="الخيارات" className="mt-7 grid gap-3">
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
                  className={`group flex w-full animate-toast-in items-center gap-4 rounded-[22px] border-2 px-4 py-3.5 text-right transition-all duration-200 [animation-fill-mode:backwards] ${
                    selected
                      ? "border-[#0F8B78] bg-[#E8F7F3] shadow-[0_14px_28px_-18px_rgba(15,139,120,.8)]"
                      : "border-transparent bg-[#F7FAFC] hover:-translate-y-0.5 hover:border-[#BFE8DD] hover:bg-white"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[14px] font-black transition-colors ${
                      selected ? "bg-[#0F8B78] text-white" : "bg-white text-slate-500 ring-1 ring-slate-100 group-hover:text-[#0F8B78]"
                    }`}
                  >
                    {choice.label}
                  </span>
                  <span dir="auto" className="flex-1 whitespace-pre-wrap text-[15px] font-bold leading-7 text-slate-700">
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
              className="flex items-center gap-1.5 rounded-full bg-[#F7FAFC] px-5 py-3 text-[14px] font-black text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} aria-hidden="true" />
              السابق
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={() => (answeredCount < questions.length ? setConfirmFinish(true) : finish())}
                className="flex items-center gap-2 rounded-full bg-[#0F8B78] px-7 py-3 text-[14px] font-black text-white shadow-md shadow-[#0F8B78]/25 transition hover:-translate-y-0.5 hover:bg-[#0F2A4A]"
              >
                <Flag size={16} aria-hidden="true" />
                إنهاء وتصحيح
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrent((c) => c + 1)}
                className="flex items-center gap-1.5 rounded-full bg-[#0F2A4A] px-7 py-3 text-[14px] font-black text-white transition hover:-translate-y-0.5 hover:bg-[#0F8B78]"
              >
                التالي
                <ChevronLeft size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-3 hidden text-center text-[12px] font-bold text-slate-400 sm:block">
          تلميح: استخدم الأرقام 1-4 للاختيار والأسهم للتنقل بين الأسئلة
        </p>
      </div>

      {/* اللوحة الجانبية */}
      <aside className="order-1 flex flex-col gap-4 lg:order-2">
        <div className="relative overflow-hidden rounded-[28px] bg-[#0F2A4A] p-4 text-white shadow-[0_25px_55px_-40px_rgba(15,42,74,.9)]">
          <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-[#2DD4BF]/10 blur-3xl" />
          <div className="relative flex items-center justify-between gap-3 lg:flex-col lg:items-stretch lg:gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-3.5 py-2.5">
              <Clock3 size={18} className="text-[#9FF6E9]" aria-hidden="true" />
              <div>
                <p className="font-mono text-[18px] font-black" dir="ltr">
                  {formatDuration(elapsed)}
                </p>
                <p className="text-[12px] font-bold text-white/60">الوقت المنقضي</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.06] px-3.5 py-2.5">
              <p className="text-[18px] font-black text-[#9FF6E9]">
                {answeredCount}/{questions.length}
              </p>
              <p className="text-[12px] font-bold text-white/60">تمت الإجابة</p>
            </div>
          </div>
        </div>

        <div className="hidden rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:block">
          <p className="mb-3 text-[13px] font-black text-slate-500">الانتقال السريع</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`السؤال ${i + 1}`}
                className={`h-10 rounded-xl text-[13px] font-black transition-all ${
                  i === current
                    ? "bg-[#0F2A4A] text-white ring-2 ring-[#0F2A4A]/20 ring-offset-2"
                    : answers[q.id]
                      ? "bg-[#E8F7F3] text-[#0F8B78]"
                      : "bg-[#F7FAFC] text-slate-400 hover:bg-slate-100"
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
          className="hidden items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-black text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 lg:flex"
        >
          <LogOut size={15} aria-hidden="true" />
          الخروج من الكويز
        </button>
      </aside>

      {/* تأكيد الإنهاء مع أسئلة غير مجابة */}
      {confirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2A4A]/60 p-4 backdrop-blur-sm" onClick={() => setConfirmFinish(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm animate-toast-in rounded-[30px] bg-white p-6 text-center shadow-2xl"
          >
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Flag size={24} aria-hidden="true" />
            </span>
            <h3 className="text-[19px] font-black text-[#0F2A4A]">لم تجب على كل الأسئلة</h3>
            <p className="mt-2 text-[14px] font-bold leading-7 text-slate-500">
              بقي {questions.length - answeredCount} سؤال بدون إجابة وسيُحتسب خطأ. هل تريد الإنهاء؟
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={finish} className="flex-1 rounded-full bg-[#0F2A4A] py-3 text-[14px] font-black text-white transition hover:bg-[#0F8B78]">
                إنهاء الآن
              </button>
              <button
                type="button"
                onClick={() => setConfirmFinish(false)}
                className="flex-1 rounded-full bg-[#F7FAFC] py-3 text-[14px] font-black text-slate-600 transition hover:bg-slate-100"
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