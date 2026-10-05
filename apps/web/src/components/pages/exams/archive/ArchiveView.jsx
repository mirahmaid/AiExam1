import { useMemo, useState } from "react";
import { Archive, ArrowLeft, CheckCircle2, ChevronLeft, Clock3, FileQuestion, RotateCcw, Search, Sparkles, Trash2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

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

const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

const SOURCE_LABELS = {
  GENERATED: "مولّد بالذكاء الاصطناعي",
  CHAT: "من المساعد الذكي",
  RETAKE: "إعادة محاولة",
};
const sourceLabel = (source) => SOURCE_LABELS[source] ?? "محاولة محفوظة";

const SORT_OPTIONS = [
  ["newest", "الأحدث أولاً"],
  ["best", "الأعلى درجة"],
  ["worst", "الأقل درجة"],
];
const SORTERS = {
  best: (a, b) => scorePercent(b) - scorePercent(a),
  worst: (a, b) => scorePercent(a) - scorePercent(b),
};

const field =
  "rounded-2xl border-0 bg-[#F7FAFC] px-4 py-3 text-[14px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#0F8B78]/15";

/* =====================================================
   الصفحة: إما تفاصيل محاولة (?attempt=) أو القائمة
===================================================== */

export default function ArchiveView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { attempts, removeAttempt } = useQuizHistory();

  const attemptId = params.get("attempt");
  if (!attemptId) return <ArchiveList attempts={attempts} onRemove={removeAttempt} />;

  const attempt = attempts.find((item) => item.id === attemptId);

  if (!attempt) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="المحاولة غير موجودة"
        description="ربما تم حذفها أو أنها محفوظة على جهاز آخر."
        actionHref="/exams/archive"
        actionLabel="العودة للأرشيف"
      />
    );
  }

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/exams/archive"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14px] font-bold text-[#0F2A4A] shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          العودة للأرشيف
        </Link>

        <Link
          to={`/quizzes?retake=${attempt.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-[#0F2A4A] px-4 py-2.5 text-[13px] font-black text-white transition hover:bg-[#0F8B78]"
        >
          <RotateCcw size={14} aria-hidden="true" />
          أعد المحاولة
        </Link>
      </div>

      <div className="mb-5 rounded-[28px] bg-[#0F2A4A] p-5 text-white">
        <span className="text-[12px] font-bold text-[#9FF6E9]">{sourceLabel(attempt.source)}</span>
        <h2 className="mt-2 text-[26px] font-black">{attempt.subjectName}</h2>
        <p className="mt-1 text-[13px] text-white/60">{formatDate(attempt.finishedAt, true)}</p>
      </div>

      <QuizResult attempt={attempt} onRetake={() => navigate(`/quizzes?retake=${attempt.id}`)} />
    </div>
  );
}

/* =====================================================
   القائمة: ملخص + بحث وتصفية + المحاولات
===================================================== */

function ArchiveList({ attempts, onRemove }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState("newest");

  const subjects = useMemo(
    () => [...new Map(attempts.map((a) => [a.subjectId, a.subjectName]))],
    [attempts]
  );

  const filtered = useMemo(() => {
    const q = query.trim();

    const list = attempts.filter(
      (a) =>
        (subject === "all" || a.subjectId === subject) &&
        (!q || a.subjectName.includes(q) || a.questions.some((item) => item.questionText.includes(q)))
    );

    return SORTERS[sort] ? [...list].sort(SORTERS[sort]) : list;
  }, [attempts, query, subject, sort]);

  const latest = attempts[0];
  const latestScore = latest ? scorePercent(latest) : null;
  const filtering = query || subject !== "all";

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <PageHeader
        eyebrow="رحلة التعلّم"
        icon={Archive}
        title="رحلتك مع الاختبارات"
        description="كل محاولة هي خطوة. راجع إجاباتك، تعلّم من أخطائك، وشاهد كيف تتغير نتيجتك."
        actions={
          <Link
            to="/exams/results"
            className="inline-flex items-center gap-2 rounded-full bg-[#0F2A4A] px-5 py-2.5 text-[14px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0F8B78]"
          >
            <Sparkles size={15} aria-hidden="true" />
            تقدّمي
          </Link>
        }
      />

      {attempts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Archive}
            title="لسه ما بدأت رحلتك"
            description="حل أول كويز، وستظهر هنا محاولاتك ونتائجك."
            actionHref="/quizzes"
            actionLabel="ابدأ أول كويز"
          />
        </div>
      ) : (
        <>
          {/* ملخص */}
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
            <div className="relative overflow-hidden rounded-[32px] bg-[#0F2A4A] p-6 text-white shadow-[0_30px_60px_-40px_rgba(15,42,74,.8)]">
              <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-[#2DD4BF]/10 blur-3xl" />

              <div className="relative">
                <p className="text-[13px] font-black text-white/60">آخر محطة</p>

                <div className="mt-3 flex flex-wrap items-end gap-4">
                  <div>
                    <p className="text-[48px] font-black leading-none text-[#9FF6E9]">{latestScore}%</p>
                    <p className="mt-2 text-[15px] font-bold">{latest.subjectName}</p>
                  </div>
                  <p className="pb-1 text-[13px] leading-7 text-white/60">
                    آخر نتيجة لك.
                    <br />
                    ومن هنا نكمل الطريق.
                  </p>
                </div>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#2DD4BF]" style={{ width: `${latestScore}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-[#E8F7F3] p-6">
              <p className="text-[13px] font-black text-[#0F8B78]">إجمالي المحاولات</p>
              <p className="mt-2 text-[40px] font-black leading-none text-[#0F2A4A]">{attempts.length}</p>
              <p className="mt-2 text-[13px] font-bold text-slate-600">محاولة محفوظة في رحلتك</p>
              <div className="mt-5 flex items-center gap-2 text-[13px] font-black text-[#0F8B78]">
                <CheckCircle2 size={16} aria-hidden="true" />
                كل محاولة تضيف لك معلومة جديدة
              </div>
            </div>
          </div>

          {/* البحث والتصفية */}
          <div className="mt-5 flex flex-col gap-2.5 rounded-[26px] bg-white p-3 shadow-sm ring-1 ring-slate-100 lg:flex-row">
            <label className="relative flex-1">
              <Search size={17} aria-hidden="true" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن مادة أو سؤال..."
                className={`${field} w-full pl-4 pr-11`}
              />
            </label>

            <select value={subject} onChange={(e) => setSubject(e.target.value)} className={field} aria-label="المادة">
              <option value="all">كل المواد</option>
              {subjects.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            <select value={sort} onChange={(e) => setSort(e.target.value)} className={field} aria-label="الترتيب">
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 mt-6 flex items-center justify-between">
            <p className="text-[13px] font-bold text-slate-500">{filtered.length} محاولة</p>
            {filtering && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSubject("all");
                }}
                className="text-[13px] font-black text-[#0F8B78]"
              >
                مسح التصفية
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="ما لقينا نتائج" description="جرّب كلمة بحث مختلفة أو غيّر المادة." />
          ) : (
            <div className="space-y-3">
              {filtered.map((attempt) => (
                <ArchiveItem key={attempt.id} attempt={attempt} onRemove={onRemove} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* =====================================================
   بطاقة محاولة
===================================================== */

function ArchiveItem({ attempt, onRemove }) {
  const score = scorePercent(attempt);
  const tone = scoreTone(score);
  const detailsHref = `/exams/archive?attempt=${attempt.id}`;

  const handleDelete = () => {
    if (window.confirm("حذف هذه المحاولة من الأرشيف؟")) onRemove(attempt.id);
  };

  return (
    <div className="group relative rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:ring-[#BFE8DD] sm:p-5">
      <div className="flex items-center gap-4">
        <Link to={detailsHref} className="flex min-w-0 flex-1 items-center gap-4">
          <span className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ${tone.soft}`}>
            <span className={`text-[17px] font-black ${tone.text}`}>{score}%</span>
            <span className="text-[11px] font-bold opacity-60">نتيجة</span>
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-[16px] font-black text-[#0F2A4A]">{attempt.subjectName}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-black ring-1 ${DIFFICULTY_STYLES[attempt.difficulty]}`}>
                {DIFFICULTY_LABELS[attempt.difficulty]}
              </span>
            </span>

            <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-slate-500">
              <span>
                {attempt.correct}/{attempt.total} صحيحة
              </span>
              <span className="flex items-center gap-1">
                <Clock3 size={13} aria-hidden="true" />
                {formatDuration(attempt.durationSec)}
              </span>
              <span>{formatDate(attempt.finishedAt, true)}</span>
            </span>
          </span>

          <ChevronLeft size={19} aria-hidden="true" className="shrink-0 text-slate-300 transition group-hover:-translate-x-1 group-hover:text-[#0F8B78]" />
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          aria-label="حذف المحاولة"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[12px] font-bold text-slate-400">{sourceLabel(attempt.source)}</span>
        <Link to={`/quizzes?retake=${attempt.id}`} className="flex items-center gap-1 text-[13px] font-black text-[#0F8B78] opacity-0 transition group-hover:opacity-100">
          أعد المحاولة
          <RotateCcw size={12} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}