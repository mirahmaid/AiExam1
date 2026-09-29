import { Check, X, Lightbulb, MinusCircle } from "lucide-react";

const STATUS_STYLES = {
  correct: "bg-emerald-50 text-emerald-600",
  wrong: "bg-rose-50 text-rose-600",
  skipped: "bg-slate-100 text-slate-500",
};

// مراجعة سؤال بعد انتهاء الكويز: الإجابة الصحيحة + إجابة الطالب + الشرح
export default function QuestionReview({ question, index, selected }) {
  const isCorrect = selected === question.correctAnswer;
  const status = selected == null ? "skipped" : isCorrect ? "correct" : "wrong";
  const StatusIcon = status === "correct" ? Check : status === "wrong" ? X : MinusCircle;

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-4 flex items-start gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${STATUS_STYLES[status]}`}>
          <StatusIcon size={16} />
        </span>
        <div className="flex-1">
          <p className="mb-1 text-xs font-medium text-slate-400">السؤال {index + 1}</p>
          <h4 dir="auto" className="whitespace-pre-wrap text-[15px] font-semibold leading-7 text-[#002C5A]">
            {question.questionText}
          </h4>
        </div>
      </header>

      <ul className="grid gap-2 sm:grid-cols-2">
        {question.choices.map((choice) => {
          const isCorrectChoice = choice.label === question.correctAnswer;
          const isPicked = choice.label === selected;
          return (
            <li
              key={choice.label}
              className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm ${
                isCorrectChoice
                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                  : isPicked
                    ? "border-rose-200 bg-rose-50/70 text-rose-900"
                    : "border-slate-100 text-slate-600"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                  isCorrectChoice ? "bg-emerald-500 text-white" : isPicked ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {choice.label}
              </span>
              <span dir="auto" className="flex-1 whitespace-pre-wrap leading-6">
                {choice.text}
              </span>
              {isPicked && <span className="shrink-0 text-[11px] font-medium opacity-70">إجابتك</span>}
            </li>
          );
        })}
      </ul>

      {question.explanation && (
        <div className="mt-4 flex gap-2.5 rounded-xl bg-[#F2F8FF] p-3.5 text-sm leading-6 text-slate-700">
          <Lightbulb size={17} className="mt-0.5 shrink-0 text-amber-500" />
          <p dir="auto" className="whitespace-pre-wrap">
            {question.explanation}
          </p>
        </div>
      )}
    </article>
  );
}