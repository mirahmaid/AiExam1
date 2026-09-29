import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BookMarked, Bot, Layers, Play, Trophy } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useBranchSubjects } from "../../../../../lib/subjects";
import { scorePercent, scoreTone, useQuizHistory } from "../../../../../lib/quiz";

export default function QuizzesBySubjectPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="الكويزات"
        icon={Layers}
        title="الكويزات حسب المادة"
        description="تابع مستواك في كل مادة على حدة وابدأ كويزاً جديداً أو اسأل المساعد الذكي مباشرة."
      />
      <div className="mt-8">
        <SubjectsGrid />
      </div>
    </AppShell>
  );
}

function SubjectsGrid() {
  const { subjects, isLoading, error, branchName } = useBranchSubjects();
  const { attempts } = useQuizHistory();

  const stats = useMemo(() => {
    const map = new Map();
    for (const s of subjects) {
      const list = attempts.filter((a) => a.subjectId === s.id);
      const percents = list.map(scorePercent);
      map.set(s.id, {
        count: list.length,
        best: percents.length ? Math.max(...percents) : 0,
        avg: percents.length ? Math.round(percents.reduce((x, y) => x + y, 0) / percents.length) : 0,
      });
    }
    return map;
  }, [subjects, attempts]);

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-3xl bg-white" />
        ))}
      </div>
    );
  }

  if (error || subjects.length === 0) {
    return (
      <EmptyState
        icon={BookMarked}
        tone={error ? "error" : "neutral"}
        title={error ? "تعذر تحميل المواد" : "لا توجد مواد بعد"}
        description={error ? "تحقق من اتصالك وحدّث الصفحة" : `لم تُضف مواد للفرع ${branchName ?? ""} حتى الآن`}
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((s, i) => {
        const st = stats.get(s.id);
        const tone = scoreTone(st.avg);
        return (
          <article
            key={s.id}
            style={{ animationDelay: `${i * 40}ms` }}
            className="group flex animate-toast-in flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 [animation-fill-mode:backwards] hover:-translate-y-1 hover:shadow-[0_25px_50px_-25px_rgba(0,44,90,0.35)]"
          >
            <div className="flex items-start gap-4">
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8F7F3] to-[#C5E7DE] transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105">
                <span className="relative h-10 w-10">
                  <img src={s.icon} alt="" className="h-full w-full object-contain" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-[#002C5A]">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                  {s.description || "تدرّب على أسئلة مولّدة من امتحانات التوجيهي السابقة"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
              <div>
                <p className="text-lg font-bold text-[#002C5A]">{st.count}</p>
                <p className="text-[11px] text-slate-400">محاولة</p>
              </div>
              <div>
                <p className={`text-lg font-bold ${st.count ? tone.text : "text-slate-300"}`}>{st.count ? `${st.avg}%` : "—"}</p>
                <p className="text-[11px] text-slate-400">المعدل</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-lg font-bold text-amber-500">
                  {st.count ? (
                    <>
                      <Trophy size={14} />
                      {st.best}%
                    </>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400">الأفضل</p>
              </div>
            </div>

            {st.count > 0 && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${tone.bg}`} style={{ width: `${st.avg}%` }} />
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <Link
                to={`/quizzes?subject=${s.id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#002C5A] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B3B6E]"
              >
                <Play size={15} />
                ابدأ كويز
              </Link>
              <Link
                to={`/ai-path?subject=${s.id}`}
                aria-label={`اسأل المساعد الذكي عن ${s.title}`}
                className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-[#12897A] hover:text-[#12897A]"
              >
                <Bot size={16} />
                اسأل AI
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}