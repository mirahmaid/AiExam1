import { useEffect, useRef } from "react";
import { motion, animate, useInView, useMotionValue, useTransform } from "framer-motion";
import { Flame, Lock, PencilLine, PlayCircle, Sparkles, Target } from "lucide-react";

import { BADGES, EASE, WEEK_LABELS } from "./Data";

/* =====================================================
   لوحة "إنجازك"
   داكنة بنفس جو خريطة الـ landing: شبكة نقاط + توهجات
===================================================== */

const glass = "rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md";

// رقم بيعدّ من 0 للقيمة الحقيقية لما يظهر على الشاشة
function CountUp({ value, reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 1.4, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, value, reduce, mv]);

  return <motion.span ref={ref}>{text}</motion.span>;
}

// حلقة المستوى: كل 100 XP = مستوى جديد
function LevelRing({ xp, reduce }) {
  const level = Math.floor(xp / 100) + 1;
  const inLevel = xp % 100;
  const target = Math.max(inLevel / 100, 0.0001); // نقطة صغيرة عند الصفر

  return (
    <div className={`${glass} flex flex-col items-center justify-center p-4`}>
      <div className="relative h-[130px] w-[130px]">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id="levelGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2DD4BF" />
              <stop offset="0.55" stopColor="#A78BFA" />
              <stop offset="1" stopColor="#FBBF24" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 10" />
          <motion.circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="url(#levelGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 8px rgba(167,139,250,0.6))" }}
            initial={{ pathLength: reduce ? target : 0 }}
            whileInView={{ pathLength: target }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-bold text-white/60">المستوى</span>
          <span className="text-[44px] font-black leading-none text-white">
            <CountUp value={level} reduce={reduce} />
          </span>
        </div>
      </div>
      <p className="mt-2 text-[12px] font-bold text-[#FBBF24]">
        {xp === 0 ? "0 / 100 XP • ابدأ أول درس" : `باقي ${100 - inLevel} XP للمستوى التالي`}
      </p>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, suffix, tone, delay, reduce }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      whileHover={reduce ? undefined : { y: -3 }}
      className={`${glass} flex items-center gap-3 p-3.5`}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#0B1F3A]"
        style={{ background: tone, boxShadow: `0 0 18px ${tone}66` }}
      >
        <Icon size={20} strokeWidth={2.3} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="flex items-baseline gap-0.5 text-[28px] font-black leading-none text-white">
          <CountUp value={value} reduce={reduce} />
          {suffix && (
            <span className="text-[15px]" style={{ color: tone }}>
              {suffix}
            </span>
          )}
        </p>
        <p className="mt-1 truncate text-[12px] font-bold text-white/70">{label}</p>
      </div>
    </motion.div>
  );
}

function WeekChart({ data, reduce }) {
  const today = new Date().getDay(); // 0 = الأحد
  const max = Math.max(...data, 1);
  const empty = data.every((v) => v === 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-black text-white">نشاطك هذا الأسبوع</h3>
        {empty && <span className="text-[11px] text-white/50">أول درس بيضوّي أول عمود</span>}
      </div>

      <div className="mt-3 flex h-[64px] items-end justify-between gap-1.5">
        {WEEK_LABELS.map((label, i) => {
          const height = data[i] ? 10 + (data[i] / max) * 30 : 6;
          return (
            <div key={label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <motion.span
                initial={reduce ? { height } : { height: 0 }}
                whileInView={{ height }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
                className="w-full max-w-[22px] rounded-full"
                style={{
                  background: data[i] ? "linear-gradient(#A78BFA, #2DD4BF)" : "rgba(255,255,255,0.14)",
                  boxShadow: i === today ? "0 0 0 2px #FBBF24" : "none",
                }}
              />
              <span className="text-[10px] font-bold" style={{ color: i === today ? "#FBBF24" : "rgba(255,255,255,0.45)" }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Badges({ stats, reduce }) {
  const count = BADGES.filter((b) => b.done(stats)).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-black text-white">أوسمتك</h3>
        <span className="text-[11px] font-bold text-white/50">
          {count} / {BADGES.length}
        </span>
      </div>

      <ul className="mt-3 flex items-center gap-2.5">
        {BADGES.map((b, i) => {
          const unlocked = b.done(stats);
          const Icon = unlocked ? b.icon : Lock;
          return (
            <motion.li
              key={b.id}
              title={unlocked ? `${b.title} (مفتوح)` : `${b.title}: ${b.hint}`}
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.08 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={
                unlocked
                  ? { background: b.color, color: "#0B1F3A", boxShadow: `0 0 18px ${b.color}88` }
                  : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }
              }
            >
              <Icon size={18} strokeWidth={2.3} aria-label={b.title} />
            </motion.li>
          );
        })}
        <li className="mr-1 text-[11px] leading-5 text-white/50">مرّر المؤشر لتعرف الشرط</li>
      </ul>
    </div>
  );
}

export default function StatsPanel({ stats, reduce }) {
  return (
    <div
      role="region"
      aria-labelledby="stats-title"
      className="relative overflow-hidden rounded-[32px] bg-[#0B1F3A] p-5 shadow-[0_50px_100px_-40px_rgba(11,31,58,0.85)] sm:p-6"
    >
      {/* شبكة النقاط + التوهجات (نفس جو خريطة الـ landing) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 rounded-full bg-[#FBBF24]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-[#2DD4BF]/20 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <h2 id="stats-title" className="text-[20px] font-black text-white">
            لوحة إنجازك
          </h2>
          <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold text-[#FBBF24]">
            <Sparkles size={12} aria-hidden="true" />
            بتتحدّث تلقائيًا
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[170px_1fr_1fr]">
          <LevelRing xp={stats.xp} reduce={reduce} />

          <div className="grid grid-cols-2 gap-3">
            <StatTile icon={PlayCircle} label="دروس مكتملة" value={stats.lessons} tone="#2DD4BF" delay={0} reduce={reduce} />
            <StatTile icon={PencilLine} label="كويزات مقدّمة" value={stats.quizzes} tone="#60A5FA" delay={0.06} reduce={reduce} />
            <StatTile icon={Target} label="متوسط العلامات" value={stats.avgScore} suffix="%" tone="#A78BFA" delay={0.12} reduce={reduce} />
            <StatTile icon={Flame} label="أيام متواصلة" value={stats.streak} tone="#FBBF24" delay={0.18} reduce={reduce} />
          </div>

          <div className={`${glass} flex flex-col justify-between gap-4 p-4`}>
            <WeekChart data={stats.weekly} reduce={reduce} />
            <div className="border-t border-white/10 pt-4">
              <Badges stats={stats} reduce={reduce} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
