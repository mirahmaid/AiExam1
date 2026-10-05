import { CheckCircle2, Clock3, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { scorePercent, useQuizHistory } from "../../../../lib/quiz";

export default function QuizStatsStrip() {
  const { attempts } = useQuizHistory();
  if (!attempts.length) return null;

  const scores = attempts.map(scorePercent);
  const items = [
    [CheckCircle2, attempts.length, "محاولة"],
    [Target, `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%`, "معدلك"],
    [Trophy, `${Math.max(...scores)}%`, "أفضل نتيجة"],
    [Clock3, `${Math.round(attempts.reduce((t, a) => t + a.durationSec, 0) / 60)}د`, "وقت التدريب"],
  ];

  return (
    <Link
      to="/exams/results"
      className="group relative block overflow-hidden rounded-[28px] bg-[#0F2A4A] p-4 text-white shadow-[0_25px_55px_-40px_rgba(15,42,74,.9)] transition hover:-translate-y-0.5"
    >
      <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#2DD4BF]/10 blur-3xl" />
      <div className="relative grid grid-cols-2 gap-2 md:grid-cols-4">
        {items.map(([Icon, value, label]) => (
          <div key={label} className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[.06] px-3.5 py-2.5">
            <Icon size={17} className="text-[#9FF6E9]" aria-hidden="true" />
            <div>
              <p className="text-[15px] font-black">{value}</p>
              <p className="text-[12px] font-bold text-white/60">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}