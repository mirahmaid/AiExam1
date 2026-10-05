import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookMarked, Layers, Search, Target } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useBranchSubjects } from "../../../../../lib/subjects";
import { useQuizHistory } from "../../../../../lib/quiz";
import { useSubjectStats } from "./useSubjectStats";
import SubjectCard from "./SubjectCard";

const FONT = "'Cairo','Tajawal',system-ui,sans-serif";
const FILTERS = [
  ["all", "كل المواد"],
  ["started", "بدأتها"],
  ["new", "لم أبدأها"],
];

export default function QuizzesBySubjectPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="الكويزات"
        icon={Layers}
        title="الكويزات حسب المادة"
        description="تابع مستواك في كل مادة على حدة وابدأ كويزاً جديداً أو اسأل المساعد الذكي مباشرة."
      />
      <div dir="rtl" style={{ fontFamily: FONT }} className="mt-8">
        <SubjectsGrid />
      </div>
    </AppShell>
  );
}

function SubjectsGrid() {
  const { subjects, isLoading, error, branchName } = useBranchSubjects();
  const { attempts } = useQuizHistory();
  const { stats, practiced, weakest } = useSubjectStats(subjects, attempts);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const visible = useMemo(
    () =>
      subjects.filter((s) => {
        const started = stats.get(s.id).count > 0;
        return (
          (filter === "all" || (filter === "started") === started) &&
          (!query.trim() || s.title.includes(query.trim()))
        );
      }),
    [subjects, stats, query, filter]
  );

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-[30px] bg-white ring-1 ring-slate-100" />
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
    <div className="space-y-5">
      {/* توصية ذكية */}
      {weakest && (
        <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-[28px] bg-[#0F2A4A] p-5 text-white">
          <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[#2DD4BF]/10 blur-3xl" />
          <div className="relative">
            <p className="flex items-center gap-2 text-[13px] font-black text-[#9FF6E9]">
              <Target size={15} aria-hidden="true" />
              اقتراحنا لك اليوم · جرّبت {practiced} من {subjects.length} مواد
            </p>
            <p className="mt-2 text-[18px] font-black">
              {weakest.title} <span className="text-[#9FF6E9]">({stats.get(weakest.id).avg}%)</span> تستحق جولة تركيز
            </p>
          </div>
          <Link
            to={`/quizzes?subject=${weakest.id}`}
            className="relative inline-flex items-center gap-1.5 rounded-full bg-[#2DD4BF] px-5 py-2.5 text-[14px] font-black text-[#0F2A4A] transition hover:-translate-y-0.5"
          >
            ابدأ الآن
            <ArrowLeft size={15} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* بحث وتصفية */}
      <div className="flex flex-col gap-2.5 rounded-[26px] bg-white p-3 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search size={17} aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مادة..."
            className="w-full rounded-2xl border-0 bg-[#F7FAFC] py-3 pl-4 pr-11 text-[14px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#0F8B78]/15"
          />
        </label>
        <div className="flex gap-1.5" role="group" aria-label="تصفية المواد">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`rounded-full px-4 py-2.5 text-[13px] font-black transition ${
                filter === key ? "bg-[#0F2A4A] text-white" : "bg-[#F7FAFC] text-slate-500 hover:bg-[#E8F7F3] hover:text-[#0F8B78]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Search} title="ما لقينا نتائج" description="جرّب كلمة بحث مختلفة أو غيّر التصفية." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s, i) => (
            <SubjectCard key={s.id} subject={s} st={stats.get(s.id)} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}