import { useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowLeft, Check, Star } from "lucide-react";

import { CONFETTI_COLORS, EASE, NAVY, STEPS } from "./Data";

/* =====================================================
   قصاصات ملونة تنفجر من البطاقة اللي انضغطت
===================================================== */

// بتنادى من handler الضغط (مش من الـ render) عشان Math.random مش نقي
export function makeConfettiPieces(accent) {
  return Array.from({ length: 30 }, (_, i) => {
    const a = Math.random() * Math.PI * 2;
    return {
      i,
      dx: Math.cos(a) * (70 + Math.random() * 160),
      up: 70 + Math.random() * 130,
      fall: 90 + Math.random() * 200,
      rot: (Math.random() - 0.5) * 760,
      size: 8 + Math.random() * 8,
      shape: i % 3,
      color: i % 4 === 0 ? accent : CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    };
  });
}

export function Confetti({ x, y, pieces }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute z-30" style={{ left: x, top: y }}>
      {pieces.map((p) => (
        <motion.span
          key={p.i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.dx, y: [0, -p.up, p.fall], scale: [0, 1, 1], opacity: [1, 1, 0], rotate: p.rot }}
          transition={{ duration: 1.5, ease: "easeOut", times: [0, 0.35, 1] }}
          className="absolute"
          style={{ width: p.size, height: p.size }}
        >
          {p.shape === 0 && <span className="block h-full w-full rounded-full" style={{ background: p.color }} />}
          {p.shape === 1 && <span className="block h-full w-full rounded-[3px]" style={{ background: p.color }} />}
          {p.shape === 2 && <Star size={p.size + 6} fill={p.color} color={p.color} />}
        </motion.span>
      ))}
    </span>
  );
}

/* =====================================================
   نجمة: الشخصية الصغيرة (عيونها بتتابع المؤشر)
===================================================== */

function Buddy({ accent, jump, reduce }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 220, damping: 18 });
  const py = useSpring(my, { stiffness: 220, damping: 18 });
  const happy = jump > 0;

  useEffect(() => {
    if (reduce) return;
    const move = (e) => {
      const b = ref.current?.getBoundingClientRect();
      if (!b) return;
      const dx = e.clientX - (b.left + b.width / 2);
      const dy = e.clientY - (b.top + b.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = (Math.min(d, 160) / 160) * 4;
      mx.set((dx / d) * k);
      my.set((dy / d) * k);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, mx, my]);

  return (
    <motion.div
      key={jump}
      initial={false}
      animate={reduce || !happy ? { y: 0 } : { y: [0, -22, 0, -10, 0], rotate: [0, -8, 8, 0, 0] }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="shrink-0"
    >
      <motion.svg
        ref={ref}
        viewBox="0 0 96 96"
        className="h-[88px] w-[88px]"
        aria-hidden="true"
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.circle
          cx="48"
          cy="14"
          r="6"
          fill="#FBBF24"
          animate={reduce ? undefined : { scale: [1, 1.35, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <line x1="48" y1="20" x2="48" y2="28" stroke="#0B1F3A" strokeWidth="3" strokeLinecap="round" />
        <motion.circle cx="48" cy="56" r="34" initial={false} animate={{ fill: accent.color }} transition={{ duration: 0.6 }} />
        <ellipse cx="34" cy="40" rx="10" ry="6" fill="#fff" opacity="0.28" transform="rotate(-25 34 40)" />

        <motion.g
          animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <circle cx="35" cy="52" r="9" fill="#fff" />
          <circle cx="61" cy="52" r="9" fill="#fff" />
          <motion.circle cx="35" cy="52" r="4.5" fill="#0B1F3A" style={{ x: px, y: py }} />
          <motion.circle cx="61" cy="52" r="4.5" fill="#0B1F3A" style={{ x: px, y: py }} />
        </motion.g>

        <motion.circle cx="24" cy="66" r="5" fill="#FB7185" initial={false} animate={{ opacity: happy ? 0.7 : 0 }} />
        <motion.circle cx="72" cy="66" r="5" fill="#FB7185" initial={false} animate={{ opacity: happy ? 0.7 : 0 }} />
        <motion.path
          fill="none"
          stroke="#0B1F3A"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={false}
          animate={{ d: happy ? "M36 68 Q48 84 60 68" : "M39 70 Q48 75 57 70" }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        />
      </motion.svg>
    </motion.div>
  );
}

/* =====================================================
   بطاقة مادة: ميلان ثلاثي الأبعاد + لمعة تتبع المؤشر
===================================================== */

export function SubjectTile({ s, selected, onPick, reduce }) {
  const Icon = s.icon;
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [9, -9]), { stiffness: 250, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-9, 9]), { stiffness: 250, damping: 20 });
  const gx = useTransform(x, (v) => v * 100);
  const gy = useTransform(y, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(170px circle at ${gx}% ${gy}%, rgba(255,255,255,0.85), transparent 65%)`;

  const move = (e) => {
    if (reduce) return;
    const b = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - b.left) / b.width);
    y.set((e.clientY - b.top) / b.height);
  };
  const leave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={(e) => onPick(s.id, e.currentTarget)}
      onPointerMove={move}
      onPointerLeave={leave}
      whileHover="hover"
      whileTap={reduce ? undefined : { scale: 0.96 }}
      variants={{ hover: reduce ? {} : { scale: 1.035 } }}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 700,
        borderColor: selected ? s.color : "rgba(15,42,74,0.10)",
        background: selected ? s.soft : "#fff",
        boxShadow: selected ? `0 22px 40px -18px ${s.color}` : "0 12px 30px -22px rgba(15,42,74,0.55)",
        "--tw-ring-color": `${s.color}66`,
      }}
      className="relative flex items-center gap-3.5 overflow-hidden rounded-[24px] border-2 p-4 text-right transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-4"
    >
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [button:hover_&]:opacity-60"
          style={{ background: glare }}
        />
      )}

      {/* موجة عند الاختيار */}
      {selected && !reduce && (
        <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2">
          <motion.span
            initial={{ scale: 0.5, opacity: 0.5 }}
            animate={{ scale: 9, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="block h-full w-full rounded-full"
            style={{ background: s.color }}
          />
        </span>
      )}

      <motion.span
        variants={{ hover: reduce ? {} : { rotate: [0, -14, 12, -6, 0], transition: { duration: 0.6 } } }}
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300"
        style={{ background: selected ? s.color : s.soft, color: selected ? "#0B1F3A" : s.deep }}
      >
        <Icon size={26} strokeWidth={2.3} aria-hidden="true" />
      </motion.span>

      <span className="relative flex-1 text-[18px] font-black text-[#0F2A4A]">{s.name}</span>

      <span
        className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 text-white transition-colors duration-300"
        style={{
          borderColor: selected ? s.deep : "#CBD5E1",
          background: selected ? s.deep : "transparent",
        }}
      >
        <AnimatePresence>
          {selected && (
            <motion.span
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 16 }}
              className="flex"
            >
              <Check size={15} strokeWidth={3.5} aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

/* =====================================================
   الطريق + الشخصية
===================================================== */

export function Path({ current, accent, subject, jump, reduce }) {
  const message = subject
    ? `ممتاز! ${subject.name} اختيار حلو. يلا نبدأ`
    : "أنا معك. اختر مادة وخلينا نبدأ";

  return (
    <div>
      <div className="mb-2 flex items-end gap-3 px-2">
        <Buddy accent={accent} jump={jump} reduce={reduce} />
        <div className="relative mb-3 min-h-[52px] rounded-2xl rounded-tr-md border border-[#0F2A4A]/10 bg-white px-4 py-3 shadow-[0_14px_30px_-20px_rgba(15,42,74,0.5)]">
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-[15px] font-extrabold leading-7 text-[#0F2A4A]"
              aria-live="polite"
            >
              {message}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[32px] border border-[#0F2A4A]/10 bg-white p-6 shadow-[0_40px_80px_-50px_rgba(15,42,74,0.55)] sm:p-8">
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5"
          initial={false}
          animate={{ backgroundColor: accent.color }}
          transition={{ duration: 0.6 }}
        />
        <h2 className="mb-6 text-xl font-black text-[#0F2A4A]">طريقك اليوم</h2>

        <ol>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < current;
            const now = i === current;
            const last = i === STEPS.length - 1;

            return (
              <li key={step.title} className="flex gap-4" aria-current={now ? "step" : undefined}>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {now && !reduce && (
                      <motion.span
                        aria-hidden="true"
                        animate={{ scale: [1, 2], opacity: [0.55, 0] }}
                        transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full"
                        style={{ background: accent.color }}
                      />
                    )}
                    <motion.span
                      key={done ? "d" : "n"}
                      initial={reduce || !done ? false : { scale: 0.4, rotate: -60 }}
                      animate={{ scale: done || now ? 1 : 0.9, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 14 }}
                      className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-500"
                      style={{
                        background: done ? accent.color : now ? "#fff" : "#EEF2F6",
                        borderColor: done || now ? accent.color : "#EEF2F6",
                        color: done ? "#0B1F3A" : now ? accent.deep : "#94A3B8",
                      }}
                    >
                      {done ? (
                        <Check size={22} strokeWidth={3} aria-hidden="true" />
                      ) : (
                        <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
                      )}
                    </motion.span>
                  </div>

                  {!last && (
                    <span className="relative my-1.5 w-1.5 flex-1 overflow-hidden rounded-full bg-[#EEF2F6]">
                      <motion.span
                        initial={false}
                        animate={{ scaleY: done ? 1 : 0 }}
                        transition={{ duration: 0.7, ease: EASE, delay: done ? 0.25 : 0 }}
                        className="absolute inset-0 origin-top rounded-full"
                        style={{ background: `linear-gradient(${accent.color}, ${accent.deep})` }}
                      />
                    </span>
                  )}
                </div>

                <div className={last ? "pt-1.5" : "pb-7 pt-1.5"}>
                  <p
                    className="text-[17px] font-extrabold transition-colors duration-300"
                    style={{ color: now || done ? NAVY : "#64748B" }}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-6 text-[#64748B]">{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* =====================================================
   زر مغناطيسي
===================================================== */

export function MagneticCTA({ subject, accent, onClick, reduce }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 15 });
  const sy = useSpring(my, { stiffness: 200, damping: 15 });
  const ready = Boolean(subject);

  const move = (e) => {
    if (!ready || reduce) return;
    const b = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - (b.left + b.width / 2)) * 0.22);
    my.set((e.clientY - (b.top + b.height / 2)) * 0.3);
  };
  const leave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div className="relative inline-block">
      {ready && !reduce && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl"
          animate={{ boxShadow: [`0 0 0 0 ${accent.color}99`, `0 0 0 18px ${accent.color}00`] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.button
        type="button"
        onClick={onClick}
        onPointerMove={move}
        onPointerLeave={leave}
        aria-disabled={!ready}
        whileTap={ready && !reduce ? { scale: 0.95 } : undefined}
        style={{ x: sx, y: sy }}
        className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl px-9 py-4 text-[16px] font-black transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 ${
          ready
            ? "bg-[#0F2A4A] text-white shadow-[0_20px_40px_-16px_rgba(15,42,74,0.75)] focus-visible:ring-[#0F8B78]/40"
            : "cursor-not-allowed bg-[#E2E8F0] text-[#64748B]"
        }`}
      >
        {ready && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0"
            style={{ background: accent.deep }}
          />
        )}
        <AnimatePresence mode="wait">
          <motion.span
            key={ready ? subject.id : "idle"}
            initial={reduce ? false : { y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: -14, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {ready ? `ابدأ ${subject.name}` : "اختر مادة لتبدأ"}
          </motion.span>
        </AnimatePresence>
        {ready && (
          <ArrowLeft
            size={19}
            aria-hidden="true"
            className="relative transition-transform duration-300 group-hover:-translate-x-1.5"
          />
        )}
      </motion.button>
    </div>
  );
}