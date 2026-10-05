import { Check, X, Lightbulb, MinusCircle } from "lucide-react";

const STATUS = {
  correct: { chip: "bg-[#E8F7F3] text-[#0F8B78]", label: "صحيحة" },
  wrong: { chip: "bg-rose-50 text-rose-600", label: "خاطئة" },
  skipped: { chip: "bg-slate-100 text-slate-500", label: "بدون إجابة" },
};

// مراجعة سؤال بعد انتهاء الكويز: الإجابة الصحيحة + إجابة الطالب + الشرح
export default function QuestionReview({ question, index, selected }) {
  const isCorrect = selected === question.correctAnswer;
  const status = selected == null ? "skipped" : isCorrect ? "correct" : "wrong";
  const StatusIcon = status === "correct" ? Check : status === "wrong" ? X : MinusCircle;

  return (
    <article className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:ring-[#BFE8DD] sm:p-6">
      <header className="mb-4 flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${STATUS[status].chip}`}>
          <StatusIcon size={18} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="mb-1 flex items-center gap-2 text-[12px] font-black text-slate-400">
            السؤال {index + 1}
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS[status].chip}`}>{STATUS[status].label}</span>
          </p>
          <h4 dir="auto" className="whitespace-pre-wrap text-[16px] font-black leading-8 text-[#0F2A4A]">
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
              className={`flex items-start gap-2.5 rounded-2xl border-2 px-3.5 py-2.5 text-[14px] font-bold ${
                isCorrectChoice
                  ? "border-[#BFE8DD] bg-[#E8F7F3] text-[#0B5E50]"
                  : isPicked
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-transparent bg-[#F7FAFC] text-slate-600"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${
                  isCorrectChoice ? "bg-[#0F8B78] text-white" : isPicked ? "bg-rose-500 text-white" : "bg-white text-slate-500"
                }`}
              >
                {choice.label}
              </span>
              <span dir="auto" className="flex-1 whitespace-pre-wrap leading-6">
                {choice.text}
              </span>
              {isPicked && <span className="shrink-0 text-[11px] font-black opacity-70">إجابتك</span>}
            </li>
          );
        })}
      </ul>

      {question.explanation && (
        <div className="mt-4 flex gap-3 rounded-2xl bg-[#0F2A4A] p-4 text-[14px] font-medium leading-7 text-white/85">
          <Lightbulb size={18} className="mt-1 shrink-0 text-[#FBBF24]" aria-hidden="true" />
          <p dir="auto" className="whitespace-pre-wrap">
            {question.explanation}
          </p>
        </div>
      )}
    </article>
  );
}