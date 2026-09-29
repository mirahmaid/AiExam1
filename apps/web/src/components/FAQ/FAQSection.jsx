import { useState } from "react";
import { motion } from "framer-motion";
import FAQCard from "./FAQCard";

const faqData = [
  {
    id: 1,
    question: "ما هي منصة مسار التميز؟",
    answer:
      "هي منصة تعليمية تفاعلية مخصصة لطلاب التوجيهي والسنوات الدراسية المختلفة، تهدف إلى تبسيط المناهج وتوفير أدوات دراسية",
  },
  {
    id: 2,
    question: "كيف يمكنني التسجيل والبدء بالدراسة على المنصة؟",
    answer:
      "يمكنك إنشاء حساب جديد خلال ثوانٍ عبر إدخال اسمك، رقم الهاتف، والفرع الدراسي، وستتمكن فوراً من الوصول إلى المحتوى المتاح.",
  },
  {
    id: 3,
    question: "ماذا يقدم قسم فيديوهات الشرح؟",
    answer:
      "يقدم فيديوهات مصورة بدقة عالية ومقسمة لدروس قصيرة تسهل عليك الفهم والمراجعة المستمرة قبل الامتحانات.",
  },
  {
    id: 4,
    question: "هل تتوفر نماذج امتحانات سنوات سابقة؟",
    answer:
      "نعم، توفر المنصة بنكاً شاملاً يضم نماذج الامتحانات الوزارية والسابقة لكل مادة",
  },
  {
    id: 5,
    question: "كيف يساعدني قسم الذكاء الاصطناعي (AI) في دراستي؟",
    answer:
      "يوفر لك قسم الذكاء الاصطناعي مساعداً شخصياً تفاعلياً يُجيب عن أسئلتك على مدار الساعة، ويساعدك في تبسيط المفاهيم الصعبة وتلخيص الدروس بدقة وسرعة",
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState(1);

  function toggleFAQ(id) {
    setOpenId(openId === id ? null : id);
  }

  return (
    <section
      id="asked-questions"
      dir="rtl"
      className="w-full max-w-[1200px] mx-auto px-4 py-16 bg-white overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 1.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="lg:col-span-5 flex flex-col items-center justify-center text-center"
        >
          <div className="w-[180px] h-[120px] relative mb-4 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="شعار مسار التميز"
              className="w-full h-full object-contain"
            />
          </div>

          <h3 className="text-[#16233f] font-extrabold text-2xl md:text-[28px] leading-snug mb-2">
            مازلت تتساءل حتى الآن ؟!
          </h3>

          <p className="text-[#4b5975] text-sm md:text-base">
            مسار التميز يجاوبك على أكثر الأسئلة الشائعة
          </p>
        </motion.div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          {faqData.map((item, index) => (
            <FAQCard
              key={item.id}
              item={item}
              index={index}
              isOpen={openId === item.id}
              onToggle={() => toggleFAQ(item.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
