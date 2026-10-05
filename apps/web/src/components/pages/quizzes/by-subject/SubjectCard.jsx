import { Link } from "react-router-dom";
import { Bot, Clock3, Play, Trophy } from "lucide-react";
import SubjectIcon from "@/components/quiz/SubjectIcon";
import { formatDate, scoreTone } from "../../../../../lib/quiz";

const level = (st) =>
  !st.count ? "لم تبدأ بعد" : st.avg >= 80 ? "متمكّن 🔥" : st.avg >= 60 ? "في تقدّم" : "يحتاج تركيز";

const Stat = ({ value, label, className = "text-[#0F2A4A]" }) => (
  <div>
    <p className={`text-[17px] font-black ${className}`}>{value}</p>
    <p className="text-[11px] font-bold text-slate-400">{label}</p>
  </div>
);

export default function SubjectCard({ subject: s, st, index }) {
  const tone = scoreTone(st.avg);
  const started = st.count > 0;

  return (
    <article
      style={{ animationDelay: `${index * 40}ms` }}
      className="group relative flex animate-toast-in flex-col overflow-hidden rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 [animation-fill-mode:backwards] hover:-translate-y-1 hover:ring-[#BFE8DD] hover:shadow-[0_25px_50px_-25px_rgba(15,42,74,0.35)]"
    >
      <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#2DD4BF]/10 blur-2xl transition-opacity group-hover:opacity-100 md:opacity-0" />

      <div className="relative flex items-start gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8F7F3] to-[#C5E7DE] transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105">
          <SubjectIcon src={s.icon} title={s.title} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[18px] font-black text-[#0F2A4A]">{s.title}</h3>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[12px] font-black ${
              started ? `${tone.soft} ${tone.text}` : "bg-slate-100 text-slate-400"
            }`}
          >
            {level(st)}
          </span>
        </div>
      </div>

      <p className="relative mt-3 line-clamp-2 min-h-10 text-[13px] leading-5 text-slate-500">
        {s.description || "تدرّب على أسئلة مولّدة من امتحانات التوجيهي السابقة"}
      </p>

      <div className="relative mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#F7FAFC] p-3 text-center">
        <Stat value={st.count} label="محاولة" />
        <Stat value={started ? `${st.avg}%` : "—"} label="المعدل" className={started ? tone.text : "text-slate-300"} />
        <Stat
          value={
            started ? (
              <span className="flex items-center justify-center gap-1">
                <Trophy size={13} />
                {st.best}%
              </span>
            ) : (
              "—"
            )
          }
          label="الأفضل"
          className={started ? "text-amber-500" : "text-slate-300"}
        />
      </div>

      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-700 ${tone.bg}`} style={{ width: `${st.avg}%` }} />
      </div>

      <p className="relative mt-2 flex h-4 items-center gap-1 text-[12px] font-bold text-slate-400">
        {st.last && (
          <>
            <Clock3 size={12} aria-hidden="true" />
            آخر محاولة: {formatDate(st.last, true)}
          </>
        )}
      </p>

      <div className="relative mt-4 flex gap-2">
        <Link
          to={`/quizzes?subject=${s.id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0F2A4A] py-2.5 text-[14px] font-black text-white transition hover:bg-[#0F8B78]"
        >
          <Play size={15} aria-hidden="true" />
          {started ? "كويز جديد" : "ابدأ كويز"}
        </Link>
        <Link
          to={`/ai-path?subject=${s.id}`}
          aria-label={`اسأل المساعد الذكي عن ${s.title}`}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 text-[14px] font-black text-slate-600 transition hover:border-[#0F8B78] hover:bg-[#E8F7F3] hover:text-[#0F8B78]"
        >
          <Bot size={16} aria-hidden="true" />
          اسأل AI
        </Link>
      </div>
    </article>
  );
}