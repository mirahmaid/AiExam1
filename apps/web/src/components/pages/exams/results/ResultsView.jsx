import { useMemo } from "react";
import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Clock3,
  Flame,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

import PageHeader from "../../../ui/PageHeader";
import EmptyState from "../../../ui/EmptyState";
import ScoreRing from "../../../quiz/ScoreRing";

import { DIFFICULTY_LABELS, scorePercent, scoreTone, useQuizHistory } from "../../../../../lib/quiz";

const FONT = "'Cairo','Tajawal',system-ui,sans-serif";
const card = "rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6";

/* =====================================================
   مكونات صغيرة مكررة
===================================================== */

function Card({ title, aside, className = "", children }) {
  return (
    <section className={`${card} ${className}`}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[19px] font-black text-[#0F2A4A]">{title}</h3>
        {aside && <span className="text-[13px] font-bold text-slate-500">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function Bar({ percent, tone, track = "bg-slate-100" }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full ${track}`}>
      <div className={`h-full rounded-full ${tone.bg}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function MiniStat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[.06] px-3.5 py-2.5">
      <Icon size={17} className="text-[#9FF6E9]" aria-hidden="true" />
      <div>
        <p className="text-[15px] font-black">{value}</p>
        <p className="text-[12px] font-bold text-white/60">{label}</p>
      </div>
    </div>
  );
}

const ACTIONS = {
  strong: {
    box: "bg-[#E8F7F3]",
    text: "text-[#0F8B78]",
    btn: "bg-[#0F8B78]",
    Icon: Award,
    note: "حافظ على المستوى وجرب تحديًا أعلى.",
    cta: "اختبر نفسك",
  },
  focus: {
    box: "bg-[#FFF4F1]",
    text: "text-[#BE3B55]",
    btn: "bg-[#0F2A4A]",
    Icon: Target,
    note: "مراجعة قصيرة ثم تدريب جديد ستكون خطوة مناسبة.",
    cta: "ابدأ التركيز",
  },
};

function ActionCard({ type, title, subject, percent, href }) {
  const a = ACTIONS[type];

  return (
    <div className={`rounded-[28px] p-5 ${a.box}`}>
      <p className={`flex items-center gap-2 text-[14px] font-black ${a.text}`}>
        <a.Icon size={17} aria-hidden="true" />
        {title}
      </p>
      <h3 className="mt-3 text-[22px] font-black text-[#0F2A4A]">{subject}</h3>
      <p className="mt-1 text-[14px] leading-7 text-slate-600">
        معدلك {percent}% — {a.note}
      </p>
      <Link to={href} className={`mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[14px] font-black text-white ${a.btn}`}>
        {a.cta}
        <ArrowLeft size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

/* =====================================================
   الصفحة
===================================================== */

export default function ResultsView() {
  const { attempts } = useQuizHistory();
  const data = useMemo(() => buildResults(attempts), [attempts]);

  if (!data) {
    return (
      <EmptyState
        icon={BarChart3}
        title="مسارك لم يبدأ بعد"
        description="حل أول كويز، وبعدها سنبني لك صورة واضحة عن تقدّمك."
        actionHref="/quizzes"
        actionLabel="ابدأ كويز الآن"
      />
    );
  }

  const { subjects, trend } = data;
  const strongest = subjects[0];
  const weakest = subjects.length > 1 ? subjects[subjects.length - 1] : null;

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      <PageHeader
        eyebrow="رحلة التقدّم"
        icon={BarChart3}
        title="نتيجتك تتحول إلى مسار"
        description="تابع مستواك، اكتشف نقاط قوتك، واعرف أين يستحق وقتك القادم."
      />

      {/* المستوى العام */}
      <section className="relative mt-8 overflow-hidden rounded-[34px] bg-[#0F2A4A] p-5 text-white shadow-[0_30px_65px_-42px_rgba(15,42,74,.85)] sm:p-7">
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#2DD4BF]/10 blur-3xl" />

        <div className="relative grid items-center gap-7 lg:grid-cols-[200px_1fr]">
          <div className="flex justify-center">
            <ScoreRing percent={data.overall} size={165} stroke={14} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[12px] font-black text-[#9FF6E9]">
                <Sparkles size={13} aria-hidden="true" />
                مستواك الآن
              </span>

              {trend !== null && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-black ${
                    trend >= 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"
                  }`}
                >
                  {trend >= 0 ? <TrendingUp size={13} aria-hidden="true" /> : <TrendingDown size={13} aria-hidden="true" />}
                  {trend >= 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
            </div>

            <h2 className="mt-4 text-[30px] font-black">
              معدلّك الحالي <span className="text-[#9FF6E9]">{data.overall}%</span>
            </h2>

            <p className="mt-3 max-w-[570px] text-[15px] leading-8 text-white/70">
              هذا المؤشر مبني على إجاباتك الفعلية عبر المحاولات، لذلك كل اختبار جديد يساعدنا على رسم صورة أدق عن تقدّمك.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <MiniStat icon={Trophy} value={`${data.best}%`} label="أفضل نتيجة" />
              <MiniStat icon={Flame} value={data.streak} label="أيام متتالية" />
              <MiniStat icon={Clock3} value={`${data.studyMinutes}د`} label="وقت التدريب" />
            </div>
          </div>
        </div>
      </section>

      {/* آخر المحطات + الصعوبة */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <Card title="آخر محطاتك" aside={`${data.recent.length} محاولات`}>
          <div className="relative flex h-52 items-end gap-2 rounded-[22px] bg-[#F7FAFC] px-3 pb-3 pt-5 sm:gap-3">
            {[25, 50, 75].map((line) => (
              <span key={line} className="absolute inset-x-3 border-t border-dashed border-slate-200" style={{ bottom: `${line}%` }} />
            ))}

            {data.recent.map((attempt) => {
              const percent = scorePercent(attempt);

              return (
                <Link
                  key={attempt.id}
                  to={`/exams/archive?attempt=${attempt.id}`}
                  className="group relative flex h-full flex-1 items-end justify-center"
                >
                  <span className="absolute bottom-full mb-2 hidden whitespace-nowrap rounded-xl bg-[#0F2A4A] px-2.5 py-1.5 text-[12px] font-bold text-white shadow-lg group-hover:block">
                    {attempt.subjectName} · {percent}%
                  </span>
                  <span
                    className="w-full max-w-10 rounded-t-xl transition-all duration-500 group-hover:opacity-70"
                    style={{ height: `${Math.max(percent, 5)}%`, background: barColor(percent) }}
                  />
                </Link>
              );
            })}
          </div>
        </Card>

        <Card title="كيف تتعامل مع الصعوبة؟">
          <div className="space-y-5">
            {data.difficulty.map((item) => {
              const tone = scoreTone(item.percent);

              return (
                <div key={item.difficulty}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[15px] font-black text-[#0F2A4A]">{DIFFICULTY_LABELS[item.difficulty]}</span>
                    <span className={`text-[14px] font-black ${tone.text}`}>{item.count ? `${item.percent}%` : "—"}</span>
                  </div>
                  <Bar percent={item.count ? item.percent : 0} tone={tone} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* المواد */}
      <Card title="خريطة مستواك" className="mt-5">
        <div className="grid gap-3 md:grid-cols-2">
          {subjects.map((subject) => {
            const tone = scoreTone(subject.percent);

            return (
              <div key={subject.id} className="rounded-2xl bg-[#F8FAFC] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-black text-[#0F2A4A]">{subject.name}</p>
                    <p className="mt-1 text-[12px] font-bold text-slate-500">{subject.count} محاولة</p>
                  </div>
                  <span className={`text-[15px] font-black ${tone.text}`}>{subject.percent}%</span>
                </div>
                <div className="mt-3">
                  <Bar percent={subject.percent} tone={tone} track="bg-white" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* الخطوة الجاية */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {strongest && (
          <ActionCard type="strong" title="هذه نقطة قوتك" subject={strongest.name} percent={strongest.percent} href={`/quizzes?subject=${strongest.id}`} />
        )}
        {weakest && (
          <ActionCard type="focus" title="هذه تستحق وقتك القادم" subject={weakest.name} percent={weakest.percent} href={`/ai-path?subject=${weakest.id}`} />
        )}
      </div>

      <Link
        to="/exams/archive"
        className="group mt-5 flex items-center justify-between rounded-[24px] bg-white px-5 py-4 text-[15px] font-black text-[#0F2A4A] shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:ring-[#BFE8DD]"
      >
        <span className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-[#0F8B78]" aria-hidden="true" />
          راجع كل محاولاتك
        </span>
        <ArrowLeft size={17} aria-hidden="true" className="transition group-hover:-translate-x-1" />
      </Link>
    </div>
  );
}

/* =====================================================
   حسابات
===================================================== */

const sum = (list, key) => list.reduce((total, item) => total + item[key], 0);
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);
const average = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
const barColor = (percent) => (percent >= 80 ? "#2DD4BF" : percent >= 60 ? "#60A5FA" : "#FB7185");
const dayKey = (date) => date.toLocaleDateString("en-CA");

function buildResults(attempts) {
  if (!attempts.length) return null;

  const scores = attempts.map(scorePercent);

  const bySubject = new Map();
  attempts.forEach((a) => {
    const s = bySubject.get(a.subjectId) ?? { id: a.subjectId, name: a.subjectName, correct: 0, total: 0, count: 0 };
    s.correct += a.correct;
    s.total += a.total;
    s.count += 1;
    bySubject.set(a.subjectId, s);
  });

  const subjects = [...bySubject.values()]
    .map((s) => ({ ...s, percent: pct(s.correct, s.total) }))
    .sort((a, b) => b.percent - a.percent);

  // الاتجاه: متوسط النصف الأحدث مقابل الأقدم
  const half = Math.max(1, Math.floor(attempts.length / 2));
  const newer = average(scores.slice(0, half));
  const older = scores.length > half ? average(scores.slice(half)) : newer;

  const difficulty = ["EASY", "MEDIUM", "HARD"].map((level) => {
    const list = attempts.filter((a) => a.difficulty === level);
    return { difficulty: level, count: list.length, percent: pct(sum(list, "correct"), sum(list, "total")) };
  });

  return {
    overall: pct(sum(attempts, "correct"), sum(attempts, "total")),
    best: Math.max(...scores),
    studyMinutes: Math.round(sum(attempts, "durationSec") / 60),
    streak: calculateStreak(attempts),
    trend: attempts.length >= 4 ? Math.round(newer - older) : null,
    recent: attempts.slice(0, 8).reverse(),
    subjects,
    difficulty,
  };
}

function calculateStreak(attempts) {
  const days = new Set(attempts.map((a) => dayKey(new Date(a.finishedAt))));
  const date = new Date();

  if (!days.has(dayKey(date))) date.setDate(date.getDate() - 1);

  let streak = 0;
  while (days.has(dayKey(date))) {
    streak++;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}