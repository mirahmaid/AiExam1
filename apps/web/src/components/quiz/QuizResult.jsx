import { useState } from "react";
import { Link } from "react-router-dom";
import { Archive, CheckCircle2, Clock3, MinusCircle, RotateCcw, Sparkles, XCircle } from "lucide-react";
import ScoreRing from "./ScoreRing";
import QuestionReview from "./QuestionReview";
import { formatDuration, scorePercent } from "../../../lib/quiz";

const FILTERS = [
  ["all", (a) => `الكل (${a.total})`],
  ["wrong", (a) => `الأخطاء (${a.total - a.correct})`],
];

function resultMessage(percent) {
  if (percent >= 85) return "أداء رائع! أنت جاهز لمستوى أعلى 🎉";
  if (percent >= 70) return "عمل جيد جداً، راجع الأخطاء القليلة وستصل للقمة";
  if (percent >= 50) return "بداية جيدة، ركّز على الشروحات أدناه لتحسين نتيجتك";
  return "لا بأس، كل محاولة خطوة للأمام — راجع الشروحات وأعد المحاولة";
}

export default function QuizResult({ attempt, onRetake, onNewQuiz }) {
  const [filter, setFilter] = useState("all");
  const percent = scorePercent(attempt);
  const skipped = attempt.questions.filter((q) => !attempt.answers[q.id]).length;
  const wrong = attempt.total - attempt.correct - skipped;

  const visible = attempt.questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => filter === "all" || attempt.answers[q.id] !== q.correctAnswer);

  const summaryStats = [
    { icon: CheckCircle2, label: "صحيحة", value: attempt.correct, color: "text-emerald-300" },
    { icon: XCircle, label: "خاطئة", value: wrong, color: "text-rose-300" },
    { icon: MinusCircle, label: "بدون إجابة", value: skipped, color: "text-white/60" },
    { icon: Clock3, label: "المدة", value: formatDuration(attempt.durationSec), color: "text-[#9FF6E9]" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <section className="relative overflow-hidden rounded-[34px] bg-[#0F2A4A] p-6 text-white shadow-[0_30px_65px_-42px_rgba(15,42,74,.85)] sm:p-9">
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#2DD4BF]/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-8 md:flex-row">
          <div className="rounded-full bg-white p-3 shadow-xl">
            <ScoreRing percent={percent} size={170} stroke={14} />
          </div>

          <div className="flex-1 text-center md:text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[12px] font-black text-[#9FF6E9]">
              <Sparkles size={13} aria-hidden="true" />
              {attempt.subjectName}
            </span>
            <h2 className="mt-3 text-[28px] font-black">
              {attempt.correct} من {attempt.total} <span className="text-[#9FF6E9]">إجابة صحيحة</span>
            </h2>
            <p className="mt-2 text-[15px] font-bold leading-8 text-white/70">{resultMessage(percent)}</p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {summaryStats.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[.06] px-3 py-2.5 text-right">
                  <Icon size={17} className={color} aria-hidden="true" />
                  <div>
                    <p className="text-[15px] font-black" dir="ltr">
                      {value}
                    </p>
                    <p className="text-[11px] font-bold text-white/60">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex flex-wrap justify-center gap-3 border-t border-white/10 pt-6 md:justify-start">
          {onRetake && (
            <button
              type="button"
              onClick={onRetake}
              className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-2.5 text-[14px] font-black text-white ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <RotateCcw size={16} aria-hidden="true" />
              أعد نفس الأسئلة
            </button>
          )}
          {onNewQuiz && (
            <button
              type="button"
              onClick={onNewQuiz}
              className="flex items-center gap-2 rounded-full bg-[#2DD4BF] px-6 py-2.5 text-[14px] font-black text-[#0F2A4A] transition hover:-translate-y-0.5"
            >
              <Sparkles size={16} aria-hidden="true" />
              كويز جديد
            </button>
          )}
          <Link
            to="/exams/archive"
            className="flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-black text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Archive size={16} aria-hidden="true" />
            أرشيف الاختبارات
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[22px] font-black text-[#0F2A4A]">مراجعة الإجابات</h3>
          <div className="flex rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100">
            {FILTERS.map(([key, labelFn]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`rounded-full px-4 py-2 text-[13px] font-black transition-colors ${
                  filter === key ? "bg-[#0F2A4A] text-white" : "text-slate-500 hover:text-[#0F8B78]"
                }`}
              >
                {labelFn(attempt)}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-[26px] bg-[#E8F7F3] p-6 text-center text-[15px] font-black text-[#0F8B78]">
            لا توجد أخطاء — كل إجاباتك صحيحة! 🌟
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map(({ q, i }) => (
              <QuestionReview key={q.id} question={q} index={i} selected={attempt.answers[q.id] ?? null} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}