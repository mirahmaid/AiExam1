import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, MinusCircle, Clock, RotateCcw, Sparkles, Archive } from "lucide-react";
import ScoreRing from "./ScoreRing";
import QuestionReview from "./QuestionReview";
import { formatDuration, scorePercent, scoreTone } from "../../../lib/quiz";

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
  const tone = scoreTone(percent);
  const skipped = attempt.questions.filter((q) => !attempt.answers[q.id]).length;
  const wrong = attempt.total - attempt.correct - skipped;

  const visible = attempt.questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => filter === "all" || attempt.answers[q.id] !== q.correctAnswer);

  const summaryStats = [
    { icon: CheckCircle2, label: "صحيحة", value: attempt.correct, cls: "text-emerald-600 bg-emerald-50" },
    { icon: XCircle, label: "خاطئة", value: wrong, cls: "text-rose-600 bg-rose-50" },
    { icon: MinusCircle, label: "بدون إجابة", value: skipped, cls: "text-slate-500 bg-slate-100" },
    { icon: Clock, label: "المدة", value: formatDuration(attempt.durationSec), cls: "text-[#002C5A] bg-[#002C5A]/[0.06]" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <section className="relative overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_25px_60px_-35px_rgba(0,44,90,0.45)] ring-1 ring-slate-100 sm:p-10">
        <div className={`pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full blur-3xl ${tone.soft}`} />
        <div className="relative flex flex-col items-center gap-8 md:flex-row">
          <ScoreRing percent={percent} size={170} stroke={14} />
          <div className="flex-1 text-center md:text-right">
            <p className="text-sm font-medium text-slate-400">{attempt.subjectName}</p>
            <h2 className="mt-1 text-2xl font-bold text-[#002C5A]">
              {attempt.correct} من {attempt.total} إجابة صحيحة
            </h2>
            <p className="mt-2 text-slate-500">{resultMessage(percent)}</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {summaryStats.map(({ icon: Icon, label, value, cls }) => (
                <div key={label} className="rounded-2xl border border-slate-100 p-3 text-center">
                  <span className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg ${cls}`}>
                    <Icon size={16} />
                  </span>
                  <p className="text-lg font-bold text-[#002C5A]" dir="ltr">
                    {value}
                  </p>
                  <p className="text-[11px] text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-6 md:justify-start">
          {onRetake && (
            <button
              type="button"
              onClick={onRetake}
              className="flex items-center gap-2 rounded-full bg-[#002C5A] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#002C5A]/20 transition-all hover:-translate-y-0.5 hover:bg-[#0B3B6E]"
            >
              <RotateCcw size={16} />
              أعد نفس الأسئلة
            </button>
          )}
          {onNewQuiz && (
            <button
              type="button"
              onClick={onNewQuiz}
              className="flex items-center gap-2 rounded-full bg-[#12897A] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#12897A]/20 transition-all hover:-translate-y-0.5 hover:bg-[#0F766A]"
            >
              <Sparkles size={16} />
              كويز جديد
            </button>
          )}
          <Link
            to="/exams/archive"
            className="flex items-center gap-2 rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Archive size={16} />
            أرشيف الاختبارات
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-[#002C5A]">مراجعة الإجابات</h3>
          <div className="flex rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100">
            {FILTERS.map(([key, labelFn]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === key ? "bg-[#002C5A] text-white" : "text-slate-500 hover:text-[#002C5A]"
                }`}
              >
                {labelFn(attempt)}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-2xl bg-emerald-50 p-6 text-center font-medium text-emerald-700">
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