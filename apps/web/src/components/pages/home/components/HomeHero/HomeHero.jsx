import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../../../context/AuthContext";
import {
  BRANCH_SUBJECTS,
  CONTAINER,
  DEFAULT_ACCENT,
  EASE,
  EMPTY_STATS,
  FONT,
  NAVY,
  STEPS,
  getBranchKey,
  getStudentName,
  greeting,
} from "./Data";
import { Confetti, MagneticCTA, Path, SubjectTile, makeConfettiPieces } from "./Heroparts";
import StatsPanel from "./Statspanel";

/* =====================================================
   Dashboard الطالب
   - ترحيب باسم الطالب (من الـ register)
   - المواد بتتغير حسب الفرع المختار
   - لوحة "إنجازك": كل الأرقام بتجي من prop اسمه stats
     <HomeHero stats={{ lessons: 3, quizzes: 2, avgScore: 85, streak: 4, xp: 140, weekly: [0,1,0,2,0,0,1] }} />
===================================================== */

const FLOATERS = [
  { cls: "left-[6%] top-[14%] h-6 w-6 rounded-full border-[3px] border-[#2DD4BF]", d: 7 },
  { cls: "right-[8%] top-[9%] h-5 w-5 rounded-md bg-[#FBBF24]/80", d: 9 },
  { cls: "left-[46%] bottom-[7%] h-7 w-7 rounded-full bg-[#A78BFA]/40", d: 8 },
  { cls: "right-[3%] bottom-[24%] h-6 w-6 rounded-full border-[3px] border-[#60A5FA]", d: 10 },
  { cls: "left-[3%] bottom-[30%] h-4 w-4 rounded-md bg-[#FB7185]/60", d: 11 },
];

export default function HomeHero({ progress = 0, stats: statsProp }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { selectedBranch, user } = useAuth();
  const sectionRef = useRef(null);
  const [name] = useState(() => (user?.name || "").toString().trim().split(/\s+/)[0] || getStudentName());
  const [picked, setPicked] = useState(null);
  const [jump, setJump] = useState(0);
  const [confetti, setConfetti] = useState(null);

  const stats = { ...EMPTY_STATS, ...statsProp };

  // خط Cairo: الأفضل تنقل هالـ link إلى index.html
  useEffect(() => {
    if (document.getElementById("cairo-font")) return;
    const l = document.createElement("link");
    l.id = "cairo-font";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800;900&display=swap";
    document.head.appendChild(l);
  }, []);

  // المواد حسب الفرع المختار
  const subjects = BRANCH_SUBJECTS[getBranchKey(selectedBranch)];
  const subject = subjects.find((s) => s.id === picked);
  const accent = subject || DEFAULT_ACCENT;
  const blob2 = subject?.id === "biology" ? "#60A5FA" : "#FBBF24";
  const current = Math.min(Math.max(subject ? 1 : 0, progress), STEPS.length - 1);

  const pick = (id, el) => {
    if (id === picked) return;
    setPicked(id);
    setJump((k) => k + 1);
    const s = subjects.find((x) => x.id === id);
    if (!reduce && el && sectionRef.current && s) {
      const a = el.getBoundingClientRect();
      const b = sectionRef.current.getBoundingClientRect();
      setConfetti({
        id: Date.now(),
        x: a.left - b.left + a.width / 2,
        y: a.top - b.top + a.height / 2,
        pieces: makeConfettiPieces(s.color),
      });
    }
  };

  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  // "مرحبًا، ميرا" (أو "مرحبًا بك" إذا ما في اسم)
  const headline = ["مرحبًا،", name || "بك"];

  return (
    <section
      ref={sectionRef}
      id="dashboard"
      dir="rtl"
      aria-labelledby="dashboard-title"
      className="relative overflow-hidden bg-[#F7FAFC] px-5 pb-16 pt-10 md:px-8 md:pt-14"
      style={{ fontFamily: FONT }}
    >
      {/* شفق يتلوّن بلون المادة */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-44 h-[560px] w-[560px] rounded-full blur-3xl"
        initial={false}
        animate={{ backgroundColor: accent.color, opacity: subject ? 0.32 : 0.18, x: reduce ? 0 : [0, 40, 0] }}
        transition={{
          backgroundColor: { duration: 0.9 },
          opacity: { duration: 0.9 },
          x: { duration: 14, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -left-44 h-[560px] w-[560px] rounded-full blur-3xl"
        initial={false}
        animate={{ backgroundColor: blob2, opacity: 0.2, x: reduce ? 0 : [0, -50, 0] }}
        transition={{
          backgroundColor: { duration: 0.9 },
          x: { duration: 17, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-24 h-[380px] w-[380px] rounded-full bg-[#A78BFA]/15 blur-3xl"
      />

      {!reduce &&
        FLOATERS.map((f, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            animate={{ y: [0, -16, 0], rotate: [0, 14, 0] }}
            transition={{ duration: f.d, repeat: Infinity, ease: "easeInOut" }}
            className={`pointer-events-none absolute ${f.cls}`}
          />
        ))}

      {confetti && <Confetti key={confetti.id} x={confetti.x} y={confetti.y} pieces={confetti.pieces} />}

      <div className={`relative ${CONTAINER}`}>
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          {/* ============ الترحيب + الاختيار ============ */}
          <div>
            <motion.p {...rise(0)} className="mb-3 flex items-center gap-2 text-[16px] font-bold text-[#475569]">
              <motion.span
                aria-hidden="true"
                animate={reduce ? undefined : { rotate: [0, 18, -8, 18, 0] }}
                transition={{ duration: 1.4, delay: 0.9 }}
                className="inline-block origin-bottom-right"
              >
                👋
              </motion.span>
              {greeting()}
              {selectedBranch?.name ? ` • ${selectedBranch.name}` : ""}
            </motion.p>

            <h1
              id="dashboard-title"
              className="flex flex-wrap gap-x-4 text-[44px] font-black leading-[1.3] md:text-[58px]"
              style={{ color: NAVY }}
            >
              {headline.map((w, i) => (
                <span key={`${w}-${i}`} className="block overflow-hidden pb-2">
                  <motion.span
                    initial={reduce ? false : { y: "115%", rotate: 6 }}
                    animate={{ y: 0, rotate: 0, color: i === 1 ? accent.deep : NAVY }}
                    transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.1 + i * 0.13 }}
                    className="block"
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </h1>

            <svg viewBox="0 0 180 14" className="-mt-1 h-3.5 w-[190px]" aria-hidden="true">
              <motion.path
                d="M2 8 Q20 0 38 8 T74 8 T110 8 T146 8 T178 8"
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1, stroke: accent.color }}
                transition={{ pathLength: { duration: 0.9, delay: 0.7 }, stroke: { duration: 0.5 } }}
              />
            </svg>

            <motion.p {...rise(0.35)} className="mt-5 max-w-[480px] text-[18px] font-medium leading-8 text-[#334155]">
              اختر مادة وكمّل رحلتك اليوم. إنجازاتك كلها بتنتظرك تحت.
            </motion.p>

            <motion.div {...rise(0.5)} className="mt-7">
              <p id="pick-label" className="mb-3 text-[15px] font-black text-[#0F2A4A]">
                اختر المادة اللي بدك تبدأ فيها
              </p>
              <div className="grid gap-3.5 sm:grid-cols-2" role="group" aria-labelledby="pick-label">
                {subjects.map((s) => (
                  <SubjectTile key={s.id} s={s} selected={picked === s.id} onPick={pick} reduce={reduce} />
                ))}
              </div>
            </motion.div>

            <motion.div {...rise(0.65)} className="mt-8">
              <MagneticCTA
                subject={subject}
                accent={accent}
                reduce={reduce}
               onClick={() => subject && navigate(subject.to, { state: { subjectName: subject.name } })}
              />
            </motion.div>
          </div>

          {/* ============ الطريق ============ */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          >
            <Path current={current} accent={accent} subject={subject} jump={jump} reduce={reduce} />
          </motion.div>
        </div>

        {/* ============ لوحة الإنجاز ============ */}
        <div className="mt-10">
          <StatsPanel stats={stats} reduce={reduce} />
        </div>
      </div>
    </section>
  );
}