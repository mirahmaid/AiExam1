
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { BookOpen, GraduationCap, Sparkles, Users } from "lucide-react";
import CountUpNumber from "./CountUpNumber";

/* =====================================================
   DATA
===================================================== */

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 200;

const TRAIL =
  "M1000 140 H875 C750 140 750 60 625 60 C500 60 500 140 375 140 C250 140 250 60 125 60 H0";

const REACH_POINTS = [0.12, 0.375, 0.63, 0.885];

const STATS = [
  {
    id: "students",
    value: 300,
    suffix: "",
    label: "طالب ملتحق",
    icon: Users,
    color: "#2DD4BF",
    x: 875,
    y: 140,
    placement: "above",
  },
  {
    id: "courses",
    value: 32,
    suffix: "",
    label: "دورة متخصصة",
    icon: BookOpen,
    color: "#60A5FA",
    x: 625,
    y: 60,
    placement: "below",
  },
  {
    id: "teachers",
    value: 25,
    suffix: "",
    label: "معلم متخصص",
    icon: GraduationCap,
    color: "#A78BFA",
    x: 375,
    y: 140,
    placement: "above",
  },
  {
    id: "years",
    value: 10,
    suffix: "",
    label: "أعوام من الابتكار التعليمي",
    icon: Sparkles,
    color: "#FBBF24",
    x: 125,
    y: 60,
    placement: "below",
  },
];

const countReached = (progress) =>
  REACH_POINTS.filter((point) => progress >= point).length;

/* =====================================================
   NODE
===================================================== */

function StatNode({ stat, reached }) {
  const reduce = useReducedMotion();
  const Icon = stat.icon;

  return (
    <span className="relative block h-[44px] w-[44px]">
      {reached && !reduce && (
        <motion.span
          aria-hidden="true"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: stat.color }}
        />
      )}

      <span
        className="relative flex h-full w-full items-center justify-center rounded-full ring-4 ring-[#0B1F3A] transition-all duration-500 group-hover:scale-110"
        style={
          reached
            ? {
                backgroundColor: stat.color,
                color: "#0B1F3A",
                boxShadow: `0 0 28px ${stat.color}99`,
              }
            : {
                backgroundColor: "#132B4D",
                color: "rgba(255,255,255,0.4)",
              }
        }
      >
        <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
      </span>
    </span>
  );
}

/* =====================================================
   CARD
===================================================== */

function StatCard({ stat, reached, className = "" }) {
  return (
    <div
      style={{ "--c": stat.color }}
      className={`rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2 backdrop-blur-md transition-all duration-500 group-hover:-translate-y-1 group-hover:border-[color:var(--c)] group-hover:shadow-[0_0_35px_-12px_var(--c)] ${
        reached ? "opacity-100" : "opacity-30"
      } ${className}`}
    >
      <span className="block text-xl font-black leading-tight text-white transition-colors duration-300 group-hover:text-[color:var(--c)]">
        <CountUpNumber
          end={stat.value}
          suffix={stat.suffix}
          start={reached}
          duration={2200}
        />
      </span>

      <span className="block text-[11px] font-medium leading-4 text-white/65">
        {stat.label}
      </span>
    </div>
  );
}

/* =====================================================
   STATS SECTION
===================================================== */

export default function StatsSection() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.7", "end 0.7"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setActive(countReached(value));
  });

  useEffect(() => {
    setActive(countReached(scrollYProgress.get()));
  }, [scrollYProgress]);

  const isReached = (index) => reduce || active > index;
  const progress = reduce ? 1 : scrollYProgress;

  return (
    <section
      ref={sectionRef}
      id="stats"
      dir="rtl"
      aria-labelledby="stats-title"
      className="px-5 py-5 md:px-8 lg:px-10"
    >
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[32px] bg-[#0B1F3A] px-5 py-5 shadow-[0_40px_80px_-40px_rgba(11,31,58,0.85)] md:px-10 lg:py-6">
        {/* شبكة النقاط */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* إضاءات الزوايا */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-[#2DD4BF]/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-[#FBBF24]/20 blur-3xl"
        />

        {/* العنوان */}
        <div className="relative max-w-[520px] text-right">
          <h2
            id="stats-title"
            className="text-[28px] font-extrabold leading-[1.25] text-white md:text-[38px]"
          >
            أرقام تحكي مسارنا
          </h2>

          <p className="mt-1.5 text-sm leading-6 text-white/65 md:text-base">
            كل رقم هنا محطة على الطريق الذي مشيناه مع طلابنا.
          </p>
        </div>

        {/* ================= النسخة الكبيرة ================= */}
        <div className="relative mt-5 hidden h-[185px] lg:block">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="statsTrail"
                gradientUnits="userSpaceOnUse"
                x1="1000"
                y1="0"
                x2="0"
                y2="0"
              >
                <stop offset="0" stopColor="#2DD4BF" />
                <stop offset="0.5" stopColor="#A78BFA" />
                <stop offset="1" stopColor="#FBBF24" />
              </linearGradient>

              <filter
                id="statsGlow"
                x="-10%"
                y="-40%"
                width="120%"
                height="180%"
              >
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            {/* المسار المنقط */}
            <path
              d={TRAIL}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="2 11"
              vectorEffect="non-scaling-stroke"
            />

            {/* التوهج */}
            <motion.path
              d={TRAIL}
              fill="none"
              stroke="url(#statsTrail)"
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.55"
              filter="url(#statsGlow)"
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: progress }}
            />

            {/* الخط الأساسي */}
            <motion.path
              d={TRAIL}
              fill="none"
              stroke="url(#statsTrail)"
              strokeWidth="5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: progress }}
            />
          </svg>

          <ol className="absolute inset-0">
            {STATS.map((stat, index) => {
              const reached = isReached(index);

              return (
                <li
                  key={stat.id}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(stat.x / MAP_WIDTH) * 100}%`,
                    top: `${(stat.y / MAP_HEIGHT) * 100}%`,
                  }}
                >
                  <StatNode stat={stat} reached={reached} />

                  <StatCard
                    stat={stat}
                    reached={reached}
                    className={`absolute left-1/2 w-[140px] -translate-x-1/2 text-center ${
                      stat.placement === "above"
                        ? "bottom-full mb-2"
                        : "top-full mt-2"
                    }`}
                  />
                </li>
              );
            })}
          </ol>
        </div>

        {/* ================= النسخة الصغيرة ================= */}
        <div className="relative mt-5 lg:hidden">
          {/* الخط الخلفي */}
          <span
            aria-hidden="true"
            className="absolute bottom-8 right-[20.5px] top-8 w-[3px] rounded-full bg-white/10"
          />

          {/* الخط الملوّن */}
          <motion.span
            aria-hidden="true"
            className="absolute bottom-8 right-[20.5px] top-8 w-[3px] origin-top rounded-full bg-gradient-to-b from-[#2DD4BF] via-[#A78BFA] to-[#FBBF24]"
            style={{ scaleY: progress }}
          />

          <ol className="relative">
            {STATS.map((stat, index) => {
              const reached = isReached(index);

              return (
                <li
                  key={stat.id}
                  className="group flex min-h-[68px] items-center gap-3"
                >
                  <StatNode stat={stat} reached={reached} />

                  <StatCard
                    stat={stat}
                    reached={reached}
                    className="flex-1 text-right"
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
