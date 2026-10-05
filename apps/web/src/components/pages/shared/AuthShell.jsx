import { useEffect } from "react";
import {
  AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, PencilLine, PlayCircle, Sparkles, Timer } from "lucide-react";
import { Link } from "react-router-dom";

const EASE = [0.22, 1, 0.36, 1];
const ORBITS = [
  { title: "افهم",  icon: PlayCircle, color: "#2DD4BF", r: 27, dur: 26, dir: 1,  start: 0 },
  { title: "تدرّب", icon: PencilLine, color: "#60A5FA", r: 38.5, dur: 36, dir: -1, start: 130 },
  { title: "اختبر", icon: Timer,      color: "#A78BFA", r: 50, dur: 48, dir: 1,  start: 250 },
];
const STAGE_COLOR = ["#64748B", "#2DD4BF", "#60A5FA", "#FBBF24"];
const PALETTE = ["#2DD4BF", "#60A5FA", "#A78BFA", "#FBBF24"];
const STARS = Array.from({ length: 14 }, (_, i) => ({ l: (i * 37) % 100, t: (i * 61) % 100, s: 2 + (i % 3), c: PALETTE[i % 4], d: 3 + (i % 4) }));
const CONFETTI = Array.from({ length: 20 }, (_, i) => ({ a: (i / 20) * Math.PI * 2, d: 130 + (i % 6) * 28, c: PALETTE[i % 4] }));

/* ---------- عناصر مشتركة بين كل الصفحات ---------- */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Tick = () => (
  <motion.span
    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 14 }}
    className="pointer-events-none absolute right-4 top-1/2 -mt-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#2DD4BF] text-[#0F2A4A]"
  >
    <Check size={14} strokeWidth={3} />
  </motion.span>
);

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <motion.div
      key={message} role="alert" animate={{ x: [0, -8, 8, -6, 6, 0] }} transition={{ duration: 0.4 }}
      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-bold leading-6 text-red-600"
    >
      {message}
    </motion.div>
  );
}

export function SubmitButton({ loading, done, ready, label, loadingLabel, doneLabel = "تم بنجاح 🎉" }) {
  const busy = loading || done;
  return (
    <button
      type="submit" disabled={busy}
      className={`group relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl py-[18px] text-lg font-extrabold text-white transition-all duration-500 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F8B78]/25 disabled:opacity-80 ${
        ready || done ? "bg-[#0F8B78] shadow-[0_20px_45px_-18px_rgba(15,139,120,.7)]" : "bg-[#0F2A4A] shadow-[0_18px_40px_-20px_rgba(15,42,74,.6)] hover:bg-[#0F8B78]"
      }`}
    >
      {ready && !busy && (
        <motion.span
          className="absolute inset-y-0 w-1/4 -skew-x-12 bg-white/25"
          initial={{ x: "-200%" }} animate={{ x: "500%" }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
        />
      )}
      {loading ? (
        <><Loader2 size={20} className="animate-spin" /> {loadingLabel}</>
      ) : done ? (
        doneLabel
      ) : (
        <>
          {label}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2DD4BF] text-[#0F2A4A] transition-transform duration-300 group-hover:-translate-x-1">
            <ArrowLeft size={18} aria-hidden="true" />
          </span>
        </>
      )}
    </button>
  );
}

/* ---------- المدارات ---------- */
const Center = ({ children, className = "" }) => (
  <div className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className}`}>{children}</div>
);

function Orbit({ o, lit, reduce }) {
  const Icon = o.icon;
  const spin = reduce ? {} : { rotate: [o.start, o.start + 360 * o.dir] };
  const unspin = reduce ? {} : { rotate: [-o.start, -o.start - 360 * o.dir] };
  const t = { duration: o.dur, repeat: Infinity, ease: "linear" };
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `${o.r * 2}%`, height: `${o.r * 2}%` }}>
      <div
        className="absolute inset-0 rounded-full border-2 transition-all duration-700"
        style={{
          borderStyle: lit ? "solid" : "dashed",
          borderColor: lit ? `${o.color}aa` : "rgba(255,255,255,.25)",
          boxShadow: lit ? `0 0 44px ${o.color}44, inset 0 0 44px ${o.color}22` : "none",
        }}
      />
      <motion.div className="absolute inset-0" animate={spin} transition={t}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <motion.div animate={unspin} transition={t}>
            <span
              title={o.title}
              className="flex h-11 w-11 items-center justify-center rounded-full ring-4 ring-[#0B1F3A] transition-all duration-700"
              style={{ background: lit ? o.color : "#1B3556", color: lit ? "#0B1F3A" : "#7C93B0", boxShadow: lit ? `0 0 30px ${o.color}aa` : "none" }}
            >
              <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function VisualPanel({ stage, captions, gauge }) {
  const reduce = useReducedMotion();
  const color = STAGE_COLOR[stage];

  const v = useMotionValue(0);
  const shown = useTransform(v, (x) => Math.round(x));
  useEffect(() => {
    const c = animate(v, Math.round((stage * 100) / 3), { duration: 1.1, ease: "easeOut" });
    return () => c.stop();
  }, [stage, v]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const cfg = { stiffness: 60, damping: 14 };
  const x = useSpring(useTransform(mx, [-1, 1], [-18, 18]), cfg);
  const y = useSpring(useTransform(my, [-1, 1], [-18, 18]), cfg);
  const sx = useSpring(useTransform(mx, [-1, 1], [8, -8]), cfg);
  const sy = useSpring(useTransform(my, [-1, 1], [8, -8]), cfg);

  return (
    <section
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      className="relative hidden flex-col items-center justify-center gap-6 overflow-hidden bg-[#0B1F3A] lg:sticky lg:top-0 lg:flex lg:h-screen"
    >
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px]" style={{ background: "radial-gradient(circle, rgba(251,191,36,.22), transparent 65%)" }} />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[560px] w-[560px]" style={{ background: "radial-gradient(circle, rgba(45,212,191,.22), transparent 65%)" }} />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-12 -left-6 select-none text-[320px] font-extrabold leading-none text-white/[0.035]">مسار</span>

      <motion.div className="absolute inset-0" style={{ x: sx, y: sy }}>
        {STARS.map((s, i) => (
          <motion.span
            key={i} className="absolute rounded-full"
            style={{ left: `${s.l}%`, top: `${s.t}%`, width: s.s, height: s.s, background: s.c }}
            animate={reduce ? {} : { opacity: [0.15, 1, 0.15] }}
            transition={{ duration: s.d, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      <div className="absolute right-10 top-9 z-10 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2DD4BF] text-[#0F2A4A]"><Sparkles size={20} /></span>
        <div>
          <p className="text-lg font-extrabold text-white">مسار التميز</p>
          <p className="text-sm font-medium text-white/50">منصة التعلم الذكي</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }} style={{ x, y }}
        className="relative z-10 aspect-square w-[min(620px,62vh,42vw)] will-change-transform"
      >
        {ORBITS.map((o, i) => <Orbit key={o.title} o={o} lit={stage > i} reduce={reduce} />)}

        <Center>
          <motion.div
            className="h-[72%] w-[72%] rounded-full"
            style={{ background: `radial-gradient(circle, ${color}99, transparent 62%)` }}
            animate={reduce ? {} : { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </Center>

        {stage > 0 && (
          <Center>
            <motion.span
              key={stage} className="h-[36%] w-[36%] rounded-full border-[3px]" style={{ borderColor: color }}
              initial={{ scale: 0.8, opacity: 0.9 }} animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </Center>
        )}

        <Center>
          <div className="relative h-[38%] w-[38%]">
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="gauge" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#2DD4BF" /><stop offset=".5" stopColor="#A78BFA" /><stop offset="1" stopColor="#FBBF24" />
                </linearGradient>
              </defs>
              <g transform="rotate(-90 100 100)">
                <circle cx="100" cy="100" r="90" fill="rgba(11,31,58,.75)" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
                <motion.circle
                  cx="100" cy="100" r="90" fill="none" stroke="url(#gauge)" strokeWidth="10" strokeLinecap="round"
                  initial={{ pathLength: 0.001 }} animate={{ pathLength: Math.max(stage / 3, 0.001), opacity: stage > 0 ? 1 : 0 }}
                  transition={{ duration: 1.1, ease: EASE }}
                />
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <p className="flex items-baseline text-[clamp(44px,6.4vh,76px)] font-extrabold leading-none tabular-nums">
                <motion.span>{shown}</motion.span>
                <span className="mr-1 text-[0.4em] text-white/60">%</span>
              </p>
              <p className="mt-2 text-base font-bold text-white/60">{gauge}</p>
            </div>
          </div>
        </Center>

        {stage === 3 && (
          <Center className="z-20">
            {CONFETTI.map((c, k) => (
              <motion.span
                key={k} className="absolute h-2.5 w-2.5 rounded-sm" style={{ background: c.c }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(c.a) * c.d, y: Math.sin(c.a) * c.d + 50, opacity: 0, scale: 0.4, rotate: 420 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            ))}
          </Center>
        )}
      </motion.div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="h-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={stage} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.35 }} className="text-2xl font-extrabold text-white"
            >
              {captions[stage]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex gap-3">
          {ORBITS.map((o, i) => {
            const lit = stage > i;
            const Icon = o.icon;
            return (
              <span
                key={o.title}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-base font-extrabold transition-all duration-700"
                style={{
                  borderColor: lit ? `${o.color}99` : "rgba(255,255,255,.12)",
                  background: lit ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)",
                  color: lit ? o.color : "#8FA4BF",
                  boxShadow: lit ? `0 0 24px ${o.color}55` : "none",
                }}
              >
                <Icon size={18} aria-hidden="true" />
                {o.title}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- الهيكل المشترك لكل صفحات الحساب ---------- */
export default function AuthShell({
  stage = 0, captions, gauge = "جاهزيتك", badge, title, subtitle,
  back = { to: "/", label: "العودة للرئيسية" }, children,
}) {
  useEffect(() => {
    if (document.getElementById("cairo-font")) return;
    const l = document.createElement("link");
    l.id = "cairo-font";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap";
    document.head.appendChild(l);
  }, []);

  const k = title.join();
  return (
    <main
      dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', system-ui, sans-serif" }}
      className="grid min-h-screen bg-[#F7FAFC] lg:grid-cols-[1.05fr_1fr]"
    >
      <VisualPanel stage={stage} captions={captions} gauge={gauge} />

      <section className="relative flex flex-col overflow-hidden px-6 py-7 sm:px-12">
        <div className="pointer-events-none absolute -left-48 -top-48 h-[560px] w-[560px]" style={{ background: "radial-gradient(circle, rgba(45,212,191,.13), transparent 65%)" }} />
        <div className="pointer-events-none absolute -bottom-48 -right-48 h-[560px] w-[560px]" style={{ background: "radial-gradient(circle, rgba(251,191,36,.13), transparent 65%)" }} />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-12 right-[-10px] select-none text-[240px] font-extrabold leading-none text-[#0F2A4A]/[0.04]">مسار</span>

        <div className="relative flex items-center justify-between">
          <span className="flex items-center gap-2.5 text-base font-extrabold text-[#0F2A4A] lg:invisible">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2DD4BF]"><Sparkles size={17} /></span>
            مسار التميز
          </span>
          <Link to={back.to} className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-[#0F2A4A]">
            {back.label}
            <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-slate-200 lg:hidden">
          <div
            className="h-full origin-right rounded-full bg-gradient-to-l from-[#FBBF24] via-[#A78BFA] to-[#2DD4BF] transition-transform duration-700"
            style={{ transform: `scaleX(${stage / 3 || 0.05})` }}
          />
        </div>

        <div className="relative flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[470px]">
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2DD4BF]/30 bg-white px-5 py-2.5 shadow-[0_8px_25px_-15px_rgba(15,42,74,.25)]"
            >
              <Sparkles size={18} className="text-[#0F8B78]" aria-hidden="true" />
              <span className="text-sm font-bold text-[#0F8B78]">{badge}</span>
            </motion.div>

            <h1 key={k} className="text-[40px] font-extrabold leading-[1.3] sm:text-[52px]">
              {title.map((t, i) => (
                <span key={t} className="block overflow-hidden pb-1">
                  <motion.span
                    className={`block ${i ? "text-[#0F8B78]" : "text-[#0F2A4A]"}`}
                    initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: i * 0.15, ease: EASE }}
                  >
                    {t}
                  </motion.span>
                </span>
              ))}
            </h1>
            <p className="mt-3 text-lg font-medium leading-8 text-[#64748B]">{subtitle}</p>

            <motion.div
              key={`c-${k}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: EASE }} className="mt-7"
            >
              {children}
            </motion.div>

            <p className="mt-8 text-center text-xs font-medium text-slate-400">© {new Date().getFullYear()} مسار التميز</p>
          </div>
        </div>
      </section>
    </main>
  );
}