import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  Check,
  PencilLine,
  Play,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import CountUpNumber from "./../Stats/CountUpNumber";
import FeatureCard from "./FeatureCard";

/* =====================================================
   SHARED
===================================================== */

const EASE = [0.22, 1, 0.36, 1];

// حركة تتكرر للأبد (وتتعطل إذا المستخدم يفضّل تقليل الحركة)
const loop = (reduce, animate, duration, ease = "easeInOut") =>
  reduce
    ? {}
    : { animate, transition: { duration, repeat: Infinity, ease } };

/* =====================================================
   1) VIDEO — افهم
===================================================== */

function VideoStage() {
  const reduce = useReducedMotion();

  return (
    <div className="w-full max-w-[540px]">
      <div className="relative aspect-video overflow-hidden rounded-[28px] bg-[#0F2A4A] shadow-[0_40px_80px_-30px_rgba(15,42,74,.6)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,.35),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(167,139,250,.28),transparent_45%)]"
        />

        {/* زر التشغيل */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden="true"
            className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#0F2A4A] shadow-xl"
          >
            {!reduce && (
              <motion.span
                {...loop(
                  reduce,
                  { scale: [1, 1.9], opacity: [0.5, 0] },
                  2.2,
                  "easeOut"
                )}
                className="absolute inset-0 rounded-full bg-white"
              />
            )}
            <Play
              size={30}
              fill="currentColor"
              className="relative translate-x-0.5"
            />
          </span>
        </div>

        <span className="absolute right-5 top-5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          12:48
        </span>

        {/* العنوان + التقدّم */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="mb-3 text-base font-bold text-white">
            رياضيات • المتتاليات
          </p>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <motion.div
              initial={reduce ? false : { width: "0%" }}
              animate={{ width: "62%" }}
              transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
              className="h-full rounded-full bg-[#2DD4BF]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   2) PRACTICE — تدرّب (تفاعلي)
===================================================== */

const QUIZ = {
  question: "أي معادلة تعبّر عن قانون أوم؟",
  options: ["P = IV", "V = IR", "F = ma"],
  correct: 1,
};

const OPTION_STYLE = {
  idle: "border-[#E2E8F0] bg-white text-[#334E68] hover:border-[#60A5FA] hover:bg-[#F4FAFF]",
  right: "border-[#2DD4BF] bg-[#E6F8F2] text-[#0F8B78]",
  wrong: "border-[#F87171] bg-[#FEF2F2] text-[#B91C1C]",
  dim: "border-[#E2E8F0] bg-white text-[#94A3B8] opacity-60",
};

function ResultMark({ ok }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${
        ok ? "bg-[#2DD4BF]" : "bg-[#F87171]"
      }`}
    >
      {ok ? (
        <Check size={14} strokeWidth={3} />
      ) : (
        <X size={14} strokeWidth={3} />
      )}
    </motion.span>
  );
}

function PracticeStage() {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState(null);

  const answered = picked !== null;
  const isCorrect = picked === QUIZ.correct;

  return (
    <div className="w-full max-w-[460px] rounded-[28px] bg-white p-6 shadow-[0_40px_80px_-35px_rgba(47,111,219,.45)] sm:p-7">
      <p className="text-xs font-bold text-[#64748B]">
        فيزياء • سؤال 8 من 20
      </p>

      <p className="mt-2 text-lg font-extrabold leading-8 text-[#0F2A4A]">
        {QUIZ.question}
      </p>

      <div className="mt-5 grid gap-3">
        {QUIZ.options.map((text, index) => {
          const right = index === QUIZ.correct;
          const wrong = answered && picked === index && !right;
          const state = !answered
            ? "idle"
            : right
            ? "right"
            : wrong
            ? "wrong"
            : "dim";

          return (
            <motion.button
              key={text}
              type="button"
              disabled={answered}
              onClick={() => setPicked(index)}
              whileTap={answered ? undefined : { scale: 0.98 }}
              animate={
                wrong && !reduce ? { x: [0, -8, 8, -5, 0] } : { x: 0 }
              }
              transition={{ duration: 0.4 }}
              className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#60A5FA]/40 ${OPTION_STYLE[state]}`}
            >
              <span dir="ltr">{text}</span>
              {(state === "right" || state === "wrong") && (
                <ResultMark ok={state === "right"} />
              )}
            </motion.button>
          );
        })}
      </div>

      <div
        aria-live="polite"
        className="mt-4 flex min-h-[32px] items-center justify-between gap-3 text-xs font-bold"
      >
        {answered ? (
          <>
            <span
              className={isCorrect ? "text-[#0F8B78]" : "text-[#B91C1C]"}
            >
              {isCorrect
                ? "أحسنت! هذا قانون أوم."
                : "قريب! قانون أوم هو V = IR."}
            </span>

            <button
              type="button"
              onClick={() => setPicked(null)}
              className="inline-flex items-center gap-1.5 font-extrabold text-[#2F6FDB] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#60A5FA]/40"
            >
              <RotateCcw size={14} aria-hidden="true" />
              جرّب مجددًا
            </button>
          </>
        ) : (
          <span className="text-[#64748B]">
            اختر إجابة لترى النتيجة
          </span>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   3) EXAM — اختبر
===================================================== */

const EXAM_CHIPS = [
  {
    icon: Trophy,
    color: "text-[#F59E0B]",
    text: "نتيجة ممتازة",
    position: "right-0 top-6",
    duration: 4,
  },
  {
    icon: Zap,
    color: "text-[#2DD4BF]",
    text: "7 أيام متتالية",
    position: "left-0 bottom-8",
    duration: 5,
  },
];

function ExamStage() {
  const reduce = useReducedMotion();

  return (
    <div className="relative h-[300px] w-[300px] sm:h-[340px] sm:w-[340px]">
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <defs>
          <linearGradient id="examRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A78BFA" />
            <stop offset="1" stopColor="#6D4AFF" />
          </linearGradient>
        </defs>

        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.75"
          strokeWidth="10"
        />

        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="url(#examRing)"
          strokeWidth="10"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 0.86 }}
          transition={{ duration: 2, delay: 0.2, ease: EASE }}
        />
      </svg>

      {/* الرقم */}
      <div className="absolute inset-[17%] flex flex-col items-center justify-center rounded-full bg-white shadow-[0_20px_50px_-20px_rgba(109,74,255,.5)]">
        <strong className="text-5xl font-black text-[#0F2A4A]">
          <CountUpNumber end={86} suffix="%" duration={2000} />
        </strong>
        <span className="mt-1 text-sm font-bold text-[#64748B]">
          إتقانك
        </span>
      </div>

      {/* شارات عائمة */}
      {EXAM_CHIPS.map(
        ({ icon: Icon, color, text, position, duration }) => (
          <motion.div
            key={text}
            {...loop(reduce, { y: [0, -6, 0] }, duration)}
            className={`absolute flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-lg ${position}`}
          >
            <Icon size={18} className={color} aria-hidden="true" />
            <span className="text-xs font-extrabold text-[#334E68]">
              {text}
            </span>
          </motion.div>
        )
      )}
    </div>
  );
}

/* =====================================================
   4) AI — مساعد يشرح لك
===================================================== */

const TIPS = [
  "مش فاهم هذا الدرس؟ خلينا نبسطه خطوة بخطوة.",
  "جاهز أختبرك على اللي تعلمته الآن؟",
  "تحب نراجع النقاط الصعبة قبل الامتحان؟",
];

// النقاط المدارية بألوان الميزات الثلاث الباقية
const ORBITS = [
  {
    size: "h-40 w-40",
    turn: 360,
    duration: 6,
    dot: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[#A78BFA] shadow-[0_0_16px_#A78BFA]",
  },
  {
    size: "h-48 w-48",
    turn: -360,
    duration: 9,
    dot: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#2DD4BF] shadow-[0_0_16px_#2DD4BF]",
  },
  {
    size: "h-56 w-56",
    turn: 360,
    duration: 13,
    dot: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-[#60A5FA] shadow-[0_0_16px_#60A5FA]",
  },
];

function AIStage() {
  const reduce = useReducedMotion();
  const [tip, setTip] = useState(0);

  useEffect(() => {
    if (reduce) return;

    const id = setInterval(
      () => setTip((current) => (current + 1) % TIPS.length),
      3200
    );

    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className="flex w-full max-w-[440px] flex-col items-center gap-6">
      {/* الكرة */}
      <div
        aria-hidden="true"
        className="relative flex h-64 w-64 items-center justify-center"
      >
        <motion.div
          {...loop(reduce, { rotate: 360 }, 24, "linear")}
          className="absolute h-56 w-56 rounded-full border border-dashed border-[#B77900]/30"
        />

        <motion.div
          {...loop(reduce, { scale: [1, 1.06, 1] }, 3)}
          className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#FEF3C7,#FBBF24_45%,#B77900)] shadow-[0_0_80px_rgba(251,191,36,.55)]"
        >
          <div className="absolute inset-3 rounded-full border border-white/40" />
          <Sparkles
            size={38}
            strokeWidth={1.8}
            className="text-white drop-shadow"
          />
        </motion.div>

        {!reduce &&
          ORBITS.map(({ size, turn, duration, dot }) => (
            <motion.span
              key={size}
              {...loop(reduce, { rotate: turn }, duration, "linear")}
              className={`absolute ${size}`}
            >
              <span
                className={`absolute h-3 w-3 rounded-full ${dot}`}
              />
            </motion.span>
          ))}
      </div>

      {/* رسالة المساعد */}
      <div className="w-full rounded-3xl bg-white p-5 shadow-[0_30px_60px_-30px_rgba(183,121,0,.45)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF3D1] text-[#B77900]">
            <Sparkles size={18} aria-hidden="true" />
          </span>

          <div className="min-h-[68px]">
            <p className="text-xs font-bold text-[#64748B]">
              المساعد
            </p>

            <AnimatePresence mode="wait">
              <motion.p
                key={tip}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-1 text-sm font-bold leading-7 text-[#0F2A4A]"
              >
                {TIPS[tip]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   DATA
===================================================== */

const AUTOPLAY_MS = 6500;

// ألوان الميزات الأربع = نفس ألوان محطات الهيرو
const FEATURES = [
  {
    id: "video",
    label: "شرح بالفيديو",
    text: "اشرح لنفسك الدرس مرة ثانية وثالثة، لين تصير الفكرة واضحة.",
    icon: PlayCircle,
    color: "#2DD4BF",
    deep: "#0F8B78",
    tint: "#E6F8F2",
    Stage: VideoStage,
  },
  {
    id: "practice",
    label: "أسئلة تدريبية",
    text: "بعد كل درس، أسئلة تثبّت اللي فهمته قبل ما تنساه.",
    icon: PencilLine,
    color: "#60A5FA",
    deep: "#2F6FDB",
    tint: "#E7F1FF",
    Stage: PracticeStage,
  },
  {
    id: "exam",
    label: "امتحانات تجريبية",
    text: "جرّب أجواء الامتحان الحقيقي، وشوف وين وصلت بالضبط.",
    icon: Timer,
    color: "#A78BFA",
    deep: "#6D4AFF",
    tint: "#F0EBFF",
    Stage: ExamStage,
  },
  {
    id: "ai",
    label: "مساعد يشرح لك",
    text: "اسأل أي سؤال، وبيشرحه لك خطوة بخطوة بأسلوب بسيط.",
    icon: Sparkles,
    color: "#FBBF24",
    deep: "#B77900",
    tint: "#FFF3D1",
    Stage: AIStage,
  },
];

/* =====================================================
   FEATURES SECTION
===================================================== */

function Features() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { amount: 0.4 });

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const current = FEATURES[active];
  const Stage = current.Stage;

  // التبديل التلقائي: فقط لما القسم ظاهر ولا أحد يتفاعل معه
  const playing = inView && !paused && !reduce;

  useEffect(() => {
    if (!playing) return;

    const id = setTimeout(
      () => setActive((index) => (index + 1) % FEATURES.length),
      AUTOPLAY_MS
    );

    return () => clearTimeout(id);
  }, [playing, active]);

  const select = (index) => {
    setActive(index);
    setPaused(false);
  };

  const reveal = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section
      ref={sectionRef}
      id="features"
      dir="rtl"
      aria-labelledby="features-title"
      className="relative overflow-hidden bg-[#F7FAFC] py-24 lg:py-32"
    >
      {/* توهج كبير يتغير لونه مع الميزة النشطة */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[58%] h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px] transition-colors duration-700"
        style={{ backgroundColor: `${current.color}33` }}
      />

      <div className="relative mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
        {/* العنوان */}
        <motion.div
          {...reveal()}
          className="mx-auto max-w-3xl text-center"
        >
          <h2
            id="features-title"
            className="text-3xl font-black leading-[1.4] text-[#0F2A4A] sm:text-4xl lg:text-[48px]"
          >
            مش مجرد منصة...
            <span
              className="block transition-colors duration-700"
              style={{ color: current.deep }}
            >
              هذه هي الطريقة الجديدة للدراسة
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#64748B] sm:text-lg">
            من أول درس إلى آخر امتحان، كل شيء مترابط حتى تعرف أين وصلت في
            طريقك.
          </p>
        </motion.div>

        {/* القائمة + المسرح */}
        <motion.div
          {...reveal(0.1)}
          onPointerEnter={(e) =>
            e.pointerType === "mouse" && setPaused(true)
          }
          onPointerLeave={(e) =>
            e.pointerType === "mouse" && setPaused(false)
          }
          onFocus={(e) =>
            e.target.matches(":focus-visible") && setPaused(true)
          }
          onBlur={() => setPaused(false)}
          className="mt-14 grid items-center gap-8 lg:mt-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14"
        >
          <ul className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-2 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {FEATURES.map((item, index) => (
              <FeatureCard
                key={item.id}
                item={item}
                isActive={index === active}
                playing={playing}
                onSelect={() => select(index)}
              />
            ))}
          </ul>

          <div>
            <div
              onPointerDown={(e) =>
                e.pointerType !== "mouse" && setPaused(true)
              }
              className="relative flex min-h-[440px] items-center justify-center overflow-hidden rounded-[40px] p-6 transition-colors duration-700 sm:min-h-[500px] lg:min-h-[560px]"
              style={{ backgroundColor: current.tint }}
            >
              {/* شبكة النقاط (نفس الهيرو) */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(15,42,74,.07) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full blur-3xl transition-colors duration-700"
                style={{ backgroundColor: `${current.color}55` }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={
                    reduce
                      ? false
                      : { opacity: 0, y: 20, scale: 0.97 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="relative z-10 flex w-full justify-center"
                >
                  <Stage />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* وصف الميزة على الموبايل */}
            <p className="mt-4 text-center text-sm leading-7 text-[#64748B] lg:hidden">
              {current.text}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Features;