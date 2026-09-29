import { useMemo, useState } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  Archive,
  ArrowRight,
  ChevronLeft,
  Clock,
  FileQuestion,
  Search,
  Trash2,
} from "lucide-react";
import AppShell from "../../../layout/AppShell";
import PageHeader from "../../../ui/PageHeader";
import EmptyState from "../../../ui/EmptyState";
import QuizResult from "../../../quiz/QuizResult";

import {
  DIFFICULTY_LABELS,
  DIFFICULTY_STYLES,
  formatDate,
  formatDuration,
  scorePercent,
  scoreTone,
  useQuizHistory,
} from "../../../../../lib/quiz";
const SOURCE_LABELS = {
  GENERATED: "كويز مولّد",
  CHAT: "من المساعد الذكي",
  RETAKE: "إعادة محاولة",
};

export default function ExamsArchivePage() {
  return (
    <AppShell>
      <ArchiveContent />
    </AppShell>
  );
}

function ArchiveContent() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { attempts, removeAttempt } = useQuizHistory();
  const attemptId = params.get("attempt");

  if (attemptId) {
    const attempt = attempts.find((a) => a.id === attemptId);
    return (
      <>
        <Link
          to="/exams/archive"
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#002C5A] shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-slate-50"
        >
          <ArrowRight size={16} />
          العودة للأرشيف
        </Link>
        {attempt ? (
          <>
            <p className="mb-4 text-center text-sm text-slate-400">
              {SOURCE_LABELS[attempt.source]} · {formatDate(attempt.finishedAt, true)}
            </p>
            <QuizResult attempt={attempt} onRetake={() => navigate(`/quizzes?retake=${attempt.id}`)} />
          </>
        ) : (
          <EmptyState
            icon={FileQuestion}
            title="المحاولة غير موجودة"
            description="ربما تم حذفها أو أنها محفوظة على جهاز آخر"
            actionHref="/exams/archive"
            actionLabel="عرض الأرشيف"
          />
        )}
      </>
    );
  }

  return <ArchiveList attempts={attempts} onRemove={removeAttempt} />;
}

function ArchiveList({ attempts, onRemove }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState("newest");

  const subjects = useMemo(
    () => Array.from(new Map(attempts.map((a) => [a.subjectId, a.subjectName])).entries()),
    [attempts],
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    const list = attempts.filter(
      (a) =>
        (subject === "all" || a.subjectId === subject) &&
        (!q || a.subjectName.includes(q) || a.questions.some((x) => x.questionText.includes(q))),
    );
    if (sort === "best") return [...list].sort((a, b) => scorePercent(b) - scorePercent(a));
    if (sort === "worst") return [...list].sort((a, b) => scorePercent(a) - scorePercent(b));
    return list;
  }, [attempts, query, subject, sort]);

  return (
    <>
      <PageHeader
        eyebrow="الاختبارات السابقة"
        icon={Archive}
        title="أرشيف الاختبارات"
        description="كل الكويزات التي حللتها محفوظة هنا — راجع إجاباتك وشروحاتها أو أعد المحاولة بنفس الأسئلة دون استهلاك رصيدك."
        actions={
          <Link
            to="/exams/results"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#002C5A] shadow-md transition-transform hover:-translate-y-0.5"
          >
            عرض نتائجي
          </Link>
        }
      />

      {attempts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Archive}
            title="الأرشيف فارغ حالياً"
            description="عندما تُنهي أول كويز ستجده محفوظاً هنا مع كل الإجابات والشروحات."
            actionHref="/quizzes"
            actionLabel="ابدأ أول كويز"
          />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center">
            <label className="relative flex-1">
              <Search size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث باسم المادة أو نص سؤال..."
                className="w-full rounded-full border border-slate-200 bg-slate-50/60 py-2.5 pl-4 pr-11 text-sm outline-none transition-all focus:border-[#12897A] focus:bg-white focus:ring-2 focus:ring-[#12897A]/15"
              />
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-label="تصفية حسب المادة"
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-[#12897A]"
            >
              <option value="all">كل المواد</option>
              {subjects.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="الترتيب"
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-[#12897A]"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="best">الأعلى درجة</option>
              <option value="worst">الأقل درجة</option>
            </select>
          </div>

          <p className="mb-3 mt-6 text-sm text-slate-400">{filtered.length} محاولة</p>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="لا توجد نتائج مطابقة" description="جرّب كلمات بحث أخرى أو غيّر التصفية" />
          ) : (
            <ul className="grid gap-3">
              {filtered.map((a) => {
                const p = scorePercent(a);
                const tone = scoreTone(p);
                return (
                  <li
                    key={a.id}
                    className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-[#12897A]/20 sm:p-5"
                  >
                    <Link to={`/exams/archive?attempt=${a.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                      <span className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ${tone.soft}`}>
                        <span className={`text-base font-bold ${tone.text}`}>{p}%</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#002C5A]">{a.subjectName}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${DIFFICULTY_STYLES[a.difficulty]}`}>
                            {DIFFICULTY_LABELS[a.difficulty]}
                          </span>
                          <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 sm:inline">
                            {SOURCE_LABELS[a.source]}
                          </span>
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span>
                            {a.correct}/{a.total} صحيحة
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDuration(a.durationSec)}
                          </span>
                          <span>{formatDate(a.finishedAt, true)}</span>
                        </span>
                      </span>
                      <ChevronLeft size={18} className="shrink-0 text-slate-300 transition-transform group-hover:-translate-x-1 group-hover:text-[#12897A]" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("حذف هذه المحاولة من الأرشيف؟")) onRemove(a.id);
                      }}
                      aria-label="حذف المحاولة"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}