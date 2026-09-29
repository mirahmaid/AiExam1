import { useMemo } from "react";

import { Link } from "react-router-dom";

import {
  Award,
  BarChart3,
  Clock,
  Flame,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import AppShell from "../../../layout/AppShell";
import PageHeader from "../../../ui/PageHeader";
import EmptyState from "../../../ui/EmptyState";
import ScoreRing from "../../../quiz/ScoreRing";
import {
  DIFFICULTY_LABELS,
  formatDate,
  scorePercent,
  scoreTone,
  useQuizHistory,
} from "../../../../../lib/quiz";
export default function ResultsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="الاختبارات السابقة"
        icon={BarChart3}
        title="نتائجي وتقدّمي"
        description="صورة شاملة عن مستواك: معدلك العام، تطوّر درجاتك، ونقاط القوة والضعف في كل مادة."
      />
      <div className="mt-8">
        <ResultsContent />
      </div>
    </AppShell>
  );
}

function dayKey(iso) {
  return new Date(iso).toLocaleDateString("en-CA");
}

function computeStreak(attempts) {
  const days = new Set(attempts.map((a) => dayKey(a.finishedAt)));
  let streak = 0;
  const d = new Date();
  // اليوم الحالي لا يكسر السلسلة إن لم يُحل فيه شيء بعد
  if (!days.has(d.toLocaleDateString("en-CA"))) d.setDate(d.getDate() - 1);
  while (days.has(d.toLocaleDateString("en-CA"))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function ResultsContent() {
  const { attempts } = useQuizHistory();

  const data = useMemo(() => {
    if (!attempts.length) return null;
    const percents = attempts.map(scorePercent);
    const totalQuestions = attempts.reduce((s, a) => s + a.total, 0);
    const totalCorrect = attempts.reduce((s, a) => s + a.correct, 0);

    const bySubject = new Map();
    for (const a of attempts) {
      const cur = bySubject.get(a.subjectId) ?? { name: a.subjectName, correct: 0, total: 0, count: 0 };
      cur.correct += a.correct;
      cur.total += a.total;
      cur.count += 1;
      bySubject.set(a.subjectId, cur);
    }
    const subjects = Array.from(bySubject.entries())
      .map(([id, s]) => ({ id, ...s, percent: scorePercent(s) }))
      .sort((a, b) => b.percent - a.percent);

    const byDifficulty = ["EASY", "MEDIUM", "HARD"].map((d) => {
      const list = attempts.filter((a) => a.difficulty === d);
      const correct = list.reduce((s, a) => s + a.correct, 0);
      const total = list.reduce((s, a) => s + a.total, 0);
      return { d, count: list.length, percent: scorePercent({ correct, total }) };
    });

    const recent = attempts.slice(0, 12).reverse();
    const half = Math.floor(attempts.length / 2);
    const trend =
      attempts.length >= 4
        ? Math.round(
            attempts.slice(0, half).map(scorePercent).reduce((x, y) => x + y, 0) / half -
              attempts.slice(half).map(scorePercent).reduce((x, y) => x + y, 0) / (attempts.length - half),
          )
        : null;

    return {
      overall: scorePercent({ correct: totalCorrect, total: totalQuestions }),
      best: Math.max(...percents),
      totalQuestions,
      totalCorrect,
      studyMinutes: Math.round(attempts.reduce((s, a) => s + a.durationSec, 0) / 60),
      streak: computeStreak(attempts),
      subjects,
      byDifficulty,
      recent,
      trend,
    };
  }, [attempts]);

  if (!data) {
    return (
      <EmptyState
        icon={BarChart3}
        title="لا توجد نتائج بعد"
        description="حل كويزك الأول وسنعرض لك هنا تحليلاً كاملاً لمستواك وتقدمك."
        actionHref="/quizzes"
        actionLabel="ابدأ كويز الآن"
      />
    );
  }

  const strongest = data.subjects[0];
  const weakest = data.subjects.length > 1 ? data.subjects[data.subjects.length - 1] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* بطاقات الملخص */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Target, label: "إجمالي المحاولات", value: attempts.length, sub: `${data.totalQuestions} سؤال`, cls: "bg-sky-50 text-sky-600" },
          { icon: Trophy, label: "أفضل نتيجة", value: `${data.best}%`, sub: `${data.totalCorrect} إجابة صحيحة`, cls: "bg-amber-50 text-amber-500" },
          { icon: Clock, label: "وقت التدريب", value: data.studyMinutes, sub: "دقيقة", cls: "bg-violet-50 text-violet-600" },
          { icon: Flame, label: "أيام متتالية", value: data.streak, sub: data.streak ? "استمر على هذا!" : "ابدأ سلسلتك اليوم", cls: "bg-orange-50 text-orange-500" },
        ].map(({ icon: Icon, label, value, sub, cls }) => (
          <div key={label} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cls}`}>
              <Icon size={22} />
            </span>
            <div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-2xl font-bold text-[#002C5A]">{value}</p>
              <p className="text-[11px] text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* المعدل العام */}
        <div className="flex flex-col items-center rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
          <p className="mb-5 self-stretch text-right font-bold text-[#002C5A]">المعدل العام</p>
          <ScoreRing percent={data.overall} size={180} stroke={16} />
          {data.trend !== null && (
            <p
              className={`mt-5 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                data.trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              }`}
            >
              {data.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {data.trend >= 0 ? `تحسّن بمقدار ${data.trend}%` : `تراجع بمقدار ${Math.abs(data.trend)}%`} مقارنة بمحاولاتك الأقدم
            </p>
          )}
          <div className="mt-6 grid w-full gap-2">
            {data.byDifficulty.map(({ d, count, percent }) => (
              <div key={d} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-right text-slate-500">{DIFFICULTY_LABELS[d]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${scoreTone(percent).bg}`} style={{ width: count ? `${percent}%` : 0 }} />
                </div>
                <span className="w-10 text-left text-xs font-semibold text-slate-500">{count ? `${percent}%` : "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* تطور الدرجات */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <p className="font-bold text-[#002C5A]">تطوّر درجاتك</p>
            <span className="text-xs text-slate-400">آخر {data.recent.length} محاولات</span>
          </div>
          <div className="relative flex h-60 items-end gap-2 border-b border-slate-100 pb-1 sm:gap-3">
            {[25, 50, 75, 100].map((g) => (
              <div key={g} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-100" style={{ bottom: `${g}%` }}>
                <span className="absolute -top-2.5 left-0 bg-white pr-1 text-[10px] text-slate-300">{g}</span>
              </div>
            ))}
            {data.recent.map((a) => {
              const p = scorePercent(a);
              return (
                <Link
                  key={a.id}
                  to={`/exams/archive?attempt=${a.id}`}
                  className="group relative flex h-full flex-1 items-end justify-center"
                  aria-label={`${a.subjectName} ${p}%`}
                >
                  <span className="pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-lg bg-[#002C5A] px-2.5 py-1.5 text-[11px] text-white shadow-lg group-hover:block">
                    {a.subjectName} · {p}% · {formatDate(a.finishedAt)}
                  </span>
                  <span
                    className={`w-full max-w-10 rounded-t-lg transition-all duration-700 group-hover:opacity-80 ${scoreTone(p).bg}`}
                    style={{ height: `${Math.max(p, 3)}%` }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* الأداء حسب المادة */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <p className="mb-5 font-bold text-[#002C5A]">الأداء حسب المادة</p>
          <ul className="flex flex-col gap-4">
            {data.subjects.map((s) => {
              const tone = scoreTone(s.percent);
              return (
                <li key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#002C5A]">{s.name}</span>
                    <span className="text-xs text-slate-400">
                      {s.count} محاولة · <b className={tone.text}>{s.percent}%</b>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${tone.bg} transition-all duration-700`} style={{ width: `${s.percent}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* توصيات */}
        <div className="flex flex-col gap-4">
          {strongest && (
            <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                <Award size={17} />
                أقوى مادة
              </p>
              <p className="mt-2 text-lg font-bold text-[#002C5A]">{strongest.name}</p>
              <p className="text-xs text-slate-500">معدل {strongest.percent}% — جرّب المستوى الصعب لتحدٍّ أكبر</p>
            </div>
          )}
          {weakest && weakest.id !== strongest?.id && (
            <div className="rounded-3xl bg-gradient-to-br from-rose-50 to-orange-50 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-rose-600">
                <Target size={17} />
                تحتاج تركيزاً أكثر
              </p>
              <p className="mt-2 text-lg font-bold text-[#002C5A]">{weakest.name}</p>
              <p className="text-xs text-slate-500">معدل {weakest.percent}% — مراجعة قصيرة مع المساعد الذكي ستحدث فرقاً</p>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/quizzes?subject=${weakest.id}`}
                  className="rounded-full bg-[#002C5A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B3B6E]"
                >
                  تدرّب الآن
                </Link>
                <Link
                  to={`/ai-path?subject=${weakest.id}`}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#002C5A] ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  اسأل AI
                </Link>
              </div>
            </div>
          )}
          <Link
            to="/exams/archive"
            className="rounded-3xl bg-white p-5 text-sm font-semibold text-[#002C5A] shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-slate-50"
          >
            📚 راجع كل محاولاتك في الأرشيف ←
          </Link>
        </div>
      </div>
    </div>
  );
}