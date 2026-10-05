import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

const FOCUS_OPTIONS = [15, 25, 45];
const BREAK_SECONDS = 5 * 60;
const R = 100;
const C = 2 * Math.PI * R;

const MODES = {
  focus: { label: "تركيز", sub: "تركيز عميق", from: "#2DD4BF", to: "#9FF6E9" },
  break: { label: "استراحة", sub: "استراحة قصيرة", from: "#FBBF24", to: "#FDE68A" },
};

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.22);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    // الصوت اختياري
  }
}

export default function FocusTimer() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState("focus");
  const [focusMin, setFocusMin] = useState(25);
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const endAt = useRef(0);

  const total = mode === "focus" ? focusMin * 60 : BREAK_SECONDS;
  const m = MODES[mode];
  const fraction = total ? left / total : 0;
  const mm = Math.floor(left / 60).toString().padStart(2, "0");
  const ss = (left % 60).toString().padStart(2, "0");

  // العدّ حسب الوقت الفعلي
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft(Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))), 250);
    return () => clearInterval(id);
  }, [running]);

  // نهاية الجلسة: نغمة + تبديل تلقائي بين التركيز والاستراحة
  useEffect(() => {
    if (left > 0 || !running) return;
    setRunning(false);
    beep();
    if (mode === "focus") setSessions((s) => s + 1);
    const next = mode === "focus" ? "break" : "focus";
    setMode(next);
    setLeft(next === "focus" ? focusMin * 60 : BREAK_SECONDS);
  }, [left, running, mode, focusMin]);

  // الوقت المتبقي في عنوان التبويب
  useEffect(() => {
    if (!running) return;
    const prev = document.title;
    document.title = `${mm}:${ss} • ${m.label}`;
    return () => {
      document.title = prev;
    };
  }, [running, mm, ss, m.label]);

  function toggle() {
    if (running) return setRunning(false);
    endAt.current = Date.now() + left * 1000;
    setRunning(true);
  }

  function reset(nextMode = mode, min = focusMin) {
    setRunning(false);
    setLeft(nextMode === "focus" ? min * 60 : BREAK_SECONDS);
  }

  function switchMode(next) {
    setMode(next);
    reset(next);
  }

  function pickMinutes(min) {
    setFocusMin(min);
    setMode("focus");
    reset("focus", min);
  }

  return (
    <section
      className={`relative overflow-hidden rounded-[34px] bg-[#0F2A4A] p-6 text-white shadow-[0_30px_65px_-42px_rgba(15,42,74,.85)] transition-shadow duration-700 ${
        running ? "ring-2 ring-[#2DD4BF]/40" : "ring-0"
      }`}
    >
      <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[#2DD4BF]/10 blur-3xl" />

      <div className="relative mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 text-[16px] font-black">
          <Timer size={18} className="text-[#9FF6E9]" aria-hidden="true" />
          مؤقت التركيز
        </p>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-[#9FF6E9]">{sessions} جلسة اليوم</span>
      </div>

      {/* تبديل الوضع */}
      <div className="relative flex rounded-full bg-white/10 p-1">
        {Object.keys(MODES).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => switchMode(key)}
            className={`relative z-10 flex-1 rounded-full py-2 text-[13px] font-black transition-colors ${
              mode === key ? "text-[#0F2A4A]" : "text-white/70 hover:text-white"
            }`}
          >
            {mode === key && (
              <motion.span
                layoutId="timer-pill"
                className="absolute inset-0 -z-10 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {MODES[key].label}
          </button>
        ))}
      </div>

      {/* الحلقة */}
      <div className="relative mx-auto my-6 flex h-[230px] w-[230px] items-center justify-center">
        {running && !reduce && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-3 rounded-full blur-2xl"
            style={{ background: m.from }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.18, 0.4, 0.18] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <svg width="230" height="230" viewBox="0 0 230 230" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id="timer-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={m.from} />
              <stop offset="100%" stopColor={m.to} />
            </linearGradient>
          </defs>
          <circle cx="115" cy="115" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
          <circle
            cx="115"
            cy="115"
            r={R}
            fill="none"
            stroke="url(#timer-grad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - fraction)}
            className="transition-[stroke-dashoffset] duration-300 ease-linear"
          />
        </svg>

        <div className="relative text-center">
          <p dir="ltr" aria-live="off" className="text-[54px] font-black leading-none tabular-nums">
            {mm}:{ss}
          </p>
          <p className="mt-2 text-[13px] font-black" style={{ color: m.to }}>
            {running ? m.sub : "جاهز؟"}
          </p>
          <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i < sessions % 4 ? "bg-[#2DD4BF]" : "bg-white/15"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* مدة التركيز */}
      {mode === "focus" && (
        <div className="relative mb-5 flex justify-center gap-2" role="group" aria-label="مدة التركيز">
          {FOCUS_OPTIONS.map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => pickMinutes(min)}
              disabled={running}
              aria-pressed={focusMin === min}
              className={`rounded-full px-4 py-1.5 text-[12px] font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
                focusMin === min ? "bg-[#2DD4BF] text-[#0F2A4A]" : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {min} د
            </button>
          ))}
        </div>
      )}

      <div className="relative flex gap-3">
        <motion.button
          type="button"
          onClick={toggle}
          whileTap={{ scale: 0.96 }}
          whileHover={reduce ? undefined : { y: -2 }}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2DD4BF] py-3.5 text-[15px] font-black text-[#0F2A4A] transition-shadow hover:shadow-[0_15px_30px_-15px_rgba(45,212,191,.9)]"
        >
          {running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {running ? "إيقاف مؤقت" : left === total ? "ابدأ التركيز" : "تابع"}
        </motion.button>

        <motion.button
          type="button"
          onClick={() => reset()}
          aria-label="إعادة ضبط"
          whileTap={{ scale: 0.9, rotate: -180 }}
          className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <RotateCcw size={17} aria-hidden="true" />
        </motion.button>
      </div>
    </section>
  );
}