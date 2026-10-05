import { useEffect, useId } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { CheckCircle2, Clock3, Flame, Sparkles } from "lucide-react";

const SIZE = 170;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

function message(percent, total) {
  if (!total) return "لا توجد مهام اليوم";
  if (percent === 100) return "أنجزت خطة اليوم بالكامل! 🎉";
  if (percent >= 50) return "أكثر من النصف — واصل! 🔥";
  if (percent > 0) return "بداية موفقة، كمّل 🚀";
  return "لنبدأ يوماً منتجاً 💪";
}

function CountUp({ value }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);

  return <motion.span>{rounded}</motion.span>;
}

export default function ProgressCard({ percent, completed, total, minutesLeft, streak }) {
  const reduce = useReducedMotion();
  const gid = useId().replace(/:/g, "");
  const full = percent === 100 && total > 0;

  const stats = [
    { Icon: CheckCircle2, value: `${completed}/${total}`, label: "مهام" },
    { Icon: Clock3, value: `${minutesLeft}د`, label: "متبقية" },
    { Icon: Flame, value: streak, label: "متتالية", flame: streak > 0 },
  ];

  return (
    <section className="relative overflow-hidden rounded-[34px] bg-[#0F2A4A] p-6 text-white shadow-[0_30px_65px_-42px_rgba(15,42,74,.85)]">
      <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#2DD4BF]/10 blur-3xl" />
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-24 -right-16 h-52 w-52 rounded-full bg-[#A78BFA]/15 blur-3xl"
        animate={reduce ? undefined : { x: [0, -24, 0], y: [0, -12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[12px] font-black text-[#9FF6E9]">
          <Sparkles size={13} aria-hidden="true" />
          إنجاز اليوم
        </span>

        <div className="relative mt-5" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden="true">
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="100%" stopColor="#9FF6E9" />
              </linearGradient>
            </defs>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={STROKE} />
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={`url(#${gid})`}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - (C * percent) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ filter: full ? "drop-shadow(0 0 8px rgba(45,212,191,.85))" : undefined }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span dir="ltr" className="text-[44px] font-black leading-none">
              <CountUp value={percent} />%
            </span>
            <span className="mt-1 text-[12px] font-bold text-white/60">من خطة اليوم</span>
          </div>
        </div>

        <p className="mt-5 text-[16px] font-black">{message(percent, total)}</p>

        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          {stats.map(({ Icon, value, label, flame }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[.06] px-2 py-3">
              <motion.span
                aria-hidden="true"
                className="mx-auto mb-1 flex w-fit text-[#9FF6E9]"
                animate={flame && !reduce ? { scale: [1, 1.25, 1] } : undefined}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <Icon size={17} />
              </motion.span>
              <p className="text-[15px] font-black">{value}</p>
              <p className="text-[11px] font-bold text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}