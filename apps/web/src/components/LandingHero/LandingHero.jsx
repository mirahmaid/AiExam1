import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  PencilLine,
  PlayCircle,
  Sparkles,
  Timer,
  Trophy,
} from "lucide-react";

/* =====================================================
   CONSTANTS
===================================================== */

// نفس خط باقي السكاشن
const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

// أبعاد الـ viewBox للخريطة (مصدر واحد للحقيقة)
const MAP_WIDTH = 480;
const MAP_HEIGHT = 560;

// مسار الخريطة
const TRAIL =
  "M400 490 C260 490 80 470 120 390 C160 310 400 340 380 250 C360 160 100 190 110 80";

// مدة ورسم المسار (مشتركة بين التوهج والخط الأساسي)
const TRAIL_DRAW = { duration: 3.2, delay: 0.5, ease: "linear" };

// حركة الدخول الناعمة للنصوص
const EASE_OUT = [0.22, 1, 0.36, 1];

// مكان اسم المحطة نسبةً للدائرة
const LABEL_POSITION = {
  right: "right-full mr-3",
  left: "left-full ml-3",
};

const STATIONS = [
  {
    id: "understand",
    title: "افهم",
    text: "دروس بالفيديو",
    icon: PlayCircle,
    x: 400,
    y: 490,
    side: "right",
    color: "#2DD4BF",
    delay: 0.4,
  },
  {
    id: "practice",
    title: "تدرّب",
    text: "أسئلة على كل درس",
    icon: PencilLine,
    x: 120,
    y: 390,
    side: "left",
    color: "#60A5FA",
    delay: 1.6,
  },
  {
    id: "test",
    title: "اختبر",
    text: "امتحانات تجريبية",
    icon: Timer,
    x: 380,
    y: 250,
    side: "right",
    color: "#A78BFA",
    delay: 2.65,
  },
  {
    id: "goal",
    title: "تفوّق",
    text: "المعدّل الذي تحلم به",
    icon: Trophy,
    x: 110,
    y: 80,
    side: "left",
    color: "#FBBF24",
    delay: 3.7,
  },
];

const FEATURES = [
  {
    icon: PlayCircle,
    text: "شرح بالفيديو",
    tone: "bg-[#E6F8F2] text-[#0F8B78]",
  },
  {
    icon: PencilLine,
    text: "أسئلة تدريبية",
    tone: "bg-[#E7F1FF] text-[#2F6FDB]",
  },
  {
    icon: Timer,
    text: "امتحانات تجريبية",
    tone: "bg-[#F0EBFF] text-[#6D4AFF]",
  },
  {
    icon: Sparkles,
    text: "مساعد يشرح لك",
    tone: "bg-[#FFF3D1] text-[#B77900]",
  },
];

/* =====================================================
   HELPERS
===================================================== */

function scrollToSection(selector) {
  document.querySelector(selector)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/**
 * يرجع props جاهزة لحركة "ظهور + صعود".
 * إذا المستخدم مفعّل reduced motion، ما في حركة.
 */
function fadeIn(reduce, { delay = 0, duration = 0.6, y = 0 } = {}) {
  return {
    initial: reduce ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay },
  };
}

/* =====================================================
   SMALL COMPONENTS
===================================================== */

function Badge({ reduce }) {
  return (
    <motion.div
      {...fadeIn(reduce, { y: -12 })}
      className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#2DD4BF]/30 bg-white px-4 py-2 shadow-[0_8px_25px_-15px_rgba(15,42,74,0.25)]"
    >
      <Sparkles size={16} className="text-[#0F8B78]" aria-hidden="true" />
      <span className="text-[15px] font-extrabold text-[#0F8B78]">
        بوابتك للتعلّم التفاعلي
      </span>
    </motion.div>
  );
}

// سطر واحد من العنوان (ينزلق من تحت القناع)
function HeadingLine({ children, reduce, delay = 0, className, padding }) {
  return (
    <span className={`block overflow-hidden ${padding}`}>
      <motion.span
        initial={reduce ? false : { y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay, ease: EASE_OUT }}
        className={`block ${className}`}
      >
        {children}
      </motion.span>
    </span>
  );
}

function FeatureList({ reduce }) {
  return (
    <motion.ul
      {...fadeIn(reduce, { delay: 0.75, duration: 0.7, y: 20 })}
      className="mt-10 grid max-w-[520px] grid-cols-2 gap-x-6 gap-y-4 border-t border-[#0F2A4A]/10 pt-7"
    >
      {FEATURES.map(({ icon: Icon, text, tone }) => (
        <li key={text} className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
          >
            <Icon size={18} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-extrabold text-[#0F2A4A]">
            {text}
          </span>
        </li>
      ))}
    </motion.ul>
  );
}

/* =====================================================
   STATION
===================================================== */

function PulseRing({ delay = 0 }) {
  return (
    <motion.span
      animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
      transition={{
        duration: 2.4,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
      className="absolute inset-0 rounded-full bg-[#FBBF24]"
    />
  );
}

function Station({ item, reduce }) {
  const { icon: Icon, id, title, text, x, y, side, color, delay } = item;
  const isGoal = id === "goal";

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${(x / MAP_WIDTH) * 100}%`,
        top: `${(y / MAP_HEIGHT) * 100}%`,
      }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 15, delay }}
        className="relative"
      >
        {/* حلقات نبض للهدف فقط */}
        {isGoal && !reduce && (
          <>
            <PulseRing />
            <PulseRing delay={1.2} />
          </>
        )}

        {/* الدائرة */}
        <span
          className={`relative flex items-center justify-center rounded-full text-[#0B1F3A] ring-4 ring-[#0B1F3A] ${
            isGoal ? "h-16 w-16" : "h-[52px] w-[52px]"
          }`}
          style={{
            backgroundColor: color,
            boxShadow: `0 0 32px ${color}99`,
          }}
        >
          <Icon size={isGoal ? 28 : 22} strokeWidth={2.2} aria-hidden="true" />
        </span>

        {/* اسم المحطة */}
        <span
          className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-right backdrop-blur-md ${LABEL_POSITION[side]}`}
        >
          <span className="block text-[17px] font-black" style={{ color }}>
            {title}
          </span>
          <span className="block text-[13px] font-medium text-white/85">
            {text}
          </span>
        </span>
      </motion.div>
    </div>
  );
}

/* =====================================================
   TRAIL MAP
===================================================== */

function TrailPath({ reduce, strokeWidth, opacity, filter }) {
  return (
    <motion.path
      d={TRAIL}
      fill="none"
      stroke="url(#masarTrail)"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      opacity={opacity}
      filter={filter}
      initial={reduce ? false : { pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={TRAIL_DRAW}
    />
  );
}

function TrailMap({ reduce }) {
  return (
    <div
      role="img"
      aria-label="خريطة رحلتك: افهم، تدرّب، اختبر، ثم تفوّق"
      className="relative mx-auto aspect-[480/560] w-full max-w-[480px] overflow-hidden rounded-[40px] bg-[#0B1F3A] shadow-[0_50px_100px_-40px_rgba(11,31,58,0.85)]"
    >
      {/* شبكة النقاط */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* إضاءة الهدف */}
      <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-[#FBBF24]/20 blur-3xl" />

      {/* إضاءة البداية */}
      <div className="absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-[#2DD4BF]/20 blur-3xl" />

      {/* الطريق */}
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="masarTrail"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="500"
            x2="0"
            y2="60"
          >
            <stop offset="0" stopColor="#2DD4BF" />
            <stop offset="0.5" stopColor="#A78BFA" />
            <stop offset="1" stopColor="#FBBF24" />
          </linearGradient>

          <filter id="masarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
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
        />

        {/* التوهج + الخط الأساسي */}
        <TrailPath
          reduce={reduce}
          strokeWidth={10}
          opacity={0.55}
          filter="url(#masarGlow)"
        />
        <TrailPath reduce={reduce} strokeWidth={5} />

        {/* النقطة المتحركة */}
        {!reduce &&
          [
            { r: 13, fill: "#fff", opacity: 0.2 },
            { r: 5, fill: "#fff" },
          ].map((dot) => (
            <circle key={dot.r} {...dot}>
              <animateMotion
                dur="7s"
                begin="4.2s"
                repeatCount="indefinite"
                path={TRAIL}
              />
            </circle>
          ))}
      </svg>

      {/* المحطات */}
      {STATIONS.map((item) => (
        <Station key={item.id} item={item} reduce={reduce} />
      ))}
    </div>
  );
}

/* =====================================================
   LANDING HERO
===================================================== */

function LandingHero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="hero"
      dir="rtl"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-[#F7FAFC] pt-20"
      style={{ fontFamily: FONT }}
    >
      {/* خلفيات ناعمة (زخرفية) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#2DD4BF]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -left-40 h-[520px] w-[520px] rounded-full bg-[#FBBF24]/10 blur-3xl"
      />

      {/* علامة مائية */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 right-[-20px] hidden select-none text-[320px] font-black leading-none text-[#0F2A4A]/[0.04] lg:block"
      >
        مسار
      </span>

      <div className="relative mx-auto grid min-h-[680px] max-w-[1280px] items-center gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:py-16">
        {/* ================= TEXT SIDE ================= */}
        <div className="relative z-10 text-right">
          <Badge reduce={reduce} />

          <h1
            id="hero-title"
            className="text-[40px] font-black leading-[1.3] md:text-[54px] lg:text-[62px]"
          >
            <HeadingLine
              reduce={reduce}
              padding="pb-1"
              className="text-[#0F2A4A]"
            >
              كل درس تدرسه
            </HeadingLine>

            <HeadingLine
              reduce={reduce}
              delay={0.15}
              padding="pb-2"
              className="text-[#0F8B78]"
            >
              خطوة نحو معدّلك
            </HeadingLine>
          </h1>

          <motion.p
            {...fadeIn(reduce, { delay: 0.35, duration: 0.7, y: 20 })}
            className="mt-5 max-w-[540px] text-[18px] font-medium leading-9 text-[#475569] md:text-[20px]"
          >
            منصة تعليمية متكاملة تساعدك على فهم دروسك، التدريب عليها، واختبار
            مستواك من خلال تجربة تعلم تفاعلية مصممة لتوصلك إلى هدفك الأكاديمي.
          </motion.p>

          {/* الأزرار */}
          <motion.div
            {...fadeIn(reduce, { delay: 0.55, y: 15 })}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="/register"
              className="group flex items-center gap-3 rounded-2xl bg-[#0F2A4A] px-7 py-4 text-[16px] font-extrabold text-white shadow-[0_18px_40px_-16px_rgba(15,42,74,0.7)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#0F8B78] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F8B78]/40"
            >
              ابدأ رحلتك مجانًا
              <ArrowLeft
                size={17}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
            </a>

            <button
              type="button"
              onClick={() => scrollToSection("#features")}
              className="rounded-2xl border-2 border-[#0F2A4A]/15 px-6 py-[14px] text-[16px] font-extrabold text-[#0F2A4A] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0F2A4A] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F2A4A]/20"
            >
              تعرّف على المنصة
            </button>
          </motion.div>

          <FeatureList reduce={reduce} />
        </div>

        {/* ================= TRAIL MAP ================= */}
        <TrailMap reduce={reduce} />
      </div>
    </section>
  );
}

export default LandingHero;