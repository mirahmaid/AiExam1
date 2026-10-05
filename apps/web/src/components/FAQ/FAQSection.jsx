import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import FAQCard from "./FAQCard";

/* =====================================================
   DATA
===================================================== */

const faqData = [
  {
    id: 1,
    question: "ما هي منصة مسار التميز؟",
    answer:
      "مسار التميز منصة تعليمية تفاعلية تساعدك على فهم دروسك، التدريب عليها، واختبار مستواك من خلال تجربة تعليمية بسيطة ومتكاملة.",
  },
  {
    id: 2,
    question: "كيف أبدأ الدراسة على المنصة؟",
    answer:
      "بكل بساطة، أنشئ حسابك، اختر فرعك الدراسي، ثم ابدأ باستكشاف الدروس والمواد المتاحة لك.",
  },
  {
    id: 3,
    question: "هل يمكنني مشاهدة الدروس ومراجعتها لاحقًا؟",
    answer:
      "نعم، يمكنك العودة إلى الدروس ومراجعتها في أي وقت، لتتعلم بالسرعة والطريقة التي تناسبك.",
  },
  {
    id: 4,
    question: "هل توجد امتحانات وأسئلة تدريبية؟",
    answer:
      "نعم، ستجد أسئلة تدريبية وامتحانات تجريبية تساعدك على تطبيق ما تعلمته وقياس مدى استعدادك.",
  },
  {
    id: 5,
    question: "كيف يساعدني الذكاء الاصطناعي؟",
    answer:
      "يمكنك الاستعانة بالمساعد الذكي لفهم المفاهيم الصعبة، طرح الأسئلة، وتبسيط المعلومات أثناء دراستك.",
  },
];

// ألوان محطات المسار (نقطة لكل سؤال)
const ACCENTS = ["#2DD4BF", "#60A5FA", "#A78BFA", "#FBBF24", "#2DD4BF"];
const DOT_COLORS = ["#2DD4BF", "#A78BFA", "#FBBF24"];

/* =====================================================
   SMALL COMPONENTS
===================================================== */

// نقاط "المساعد يكتب..."
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tr-md bg-[#F1F6FA] px-5 py-4">
      {DOT_COLORS.map((color, i) => (
        <motion.span
          key={color}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

/* =====================================================
   MAIN SECTION
===================================================== */

export default function FAQSection() {
  const [activeId, setActiveId] = useState(1);
  const [typing, setTyping] = useState(false);

  const activeQuestion =
    faqData.find((item) => item.id === activeId) || faqData[0];

  function selectQuestion(id) {
    if (id === activeId) return;
    setActiveId(id);
    setTyping(true);
  }

  // بعد ما يختار سؤال: المساعد "يكتب" لحظة ثم تظهر الإجابة
  useEffect(() => {
    if (!typing) return;

    const timer = setTimeout(() => setTyping(false), 700);
    return () => clearTimeout(timer);
  }, [typing, activeId]);

  return (
    <section
      id="asked-questions"
      dir="rtl"
      className="relative w-full overflow-hidden bg-[#F7FAFC] py-16 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-[#2DD4BF]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-[#A78BFA]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1100px] px-5 md:px-8">
        {/* ================= العنوان ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-10 max-w-[640px] text-center"
        >
          <h2 className="text-3xl font-black leading-[1.45] text-[#0F2A4A] md:text-4xl">
            عندك سؤال؟
            <span className="text-[#0F8B78]"> مسار عنده الإجابة.</span>
          </h2>

          <p className="mt-4 text-base font-medium leading-7 text-[#475569] md:text-lg">
            اختر أي سؤال وسيجيبك المساعد بإجابة بسيطة وواضحة.
          </p>
        </motion.div>

        {/* ================= نافذة المحادثة ================= */}
        <div className="relative mx-auto max-w-[850px] overflow-hidden rounded-[32px] border border-[#DCE7F0] bg-white p-5 shadow-[0_35px_100px_-45px_rgba(15,42,74,0.28)] md:p-8">
          {/* نفس تدرّج مسار الـ Hero */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#2DD4BF] via-[#A78BFA] to-[#FBBF24]" />

          {/* رأس المحادثة */}
          <div className="mb-6 flex items-center gap-3 border-b border-[#E7EEF4] pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F2A4A] text-[#5EEAD4]">
              <Sparkles size={20} aria-hidden="true" />
            </div>

            <div>
              <p className="text-base font-black text-[#0F2A4A]">مساعد مسار التميز</p>

              <div className="mt-0.5 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2DD4BF] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2DD4BF]" />
                </span>
                <span className="text-xs font-bold text-[#64748B]">
                  جاهز لمساعدتك
                </span>
              </div>
            </div>
          </div>

          {/* المحادثة */}
          <div className="min-h-[240px] space-y-5">
            {/* سؤال الطالب (على اليسار) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`question-${activeQuestion.id}`}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="flex justify-end"
              >
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[#0F2A4A] px-5 py-3.5 text-[15px] font-bold leading-7 text-white shadow-[0_10px_24px_-14px_rgba(15,42,74,0.6)]">
                  {activeQuestion.question}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* جواب المساعد (على اليمين) */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F2] text-[#0F8B78]">
                <Sparkles size={16} aria-hidden="true" />
              </div>

              <AnimatePresence mode="wait">
                {typing ? (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <TypingDots />
                  </motion.div>
                ) : (
                  <motion.div
                    key={`answer-${activeQuestion.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="max-w-[650px] rounded-2xl rounded-tr-md bg-[#F1F6FA] px-5 py-4"
                  >
                    <p className="mb-1 text-sm font-black text-[#0F8B78]">مسار</p>

                    <p className="text-base font-medium leading-8 text-[#334E68]">
                      {activeQuestion.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* الأسئلة المقترحة */}
          <div className="mt-7 border-t border-[#E7EEF4] pt-5">
            <div className="mb-3.5 flex items-center gap-3">
              <span className="text-sm font-black text-[#0F2A4A]">اسأل عن</span>
              <div className="h-px flex-1 bg-[#E7EEF4]" />
            </div>

            <div className="flex flex-wrap gap-2.5">
              {faqData.map((item, index) => (
                <FAQCard
                  key={item.id}
                  item={item}
                  accent={ACCENTS[index % ACCENTS.length]}
                  isActive={activeId === item.id}
                  onClick={() => selectQuestion(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}