import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import BooksSection from "../BooksSection";
import AiStudyLab from "../Aistudylab";
import StudyHubHeader from "./StudyHubHeader";
import StudyHubBridge from "./StudyHubBridge";

const EASE = [0.22, 1, 0.36, 1];
const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

// نفس CONTAINER تبع HomeHero (نفس عرض الـ header)
const CONTAINER = "mx-auto w-full max-w-[1280px]";

/* =====================================================
   StudyHub: مساحة عمل وحدة بعمودين
   يمين: ١ الكتاب  |  يسار: ٢ أداة الـ AI  (على نفس الشاشة)
===================================================== */

export default function StudyHub() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const [book, setBook] = useState(null);
  const [tool, setTool] = useState(null);

  // خط Cairo (نفس الـ id تبع HomeHero فما بينضاف مرتين)
  useEffect(() => {
    if (document.getElementById("cairo-font")) return;
    const l = document.createElement("link");
    l.id = "cairo-font";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800;900&display=swap";
    document.head.appendChild(l);
  }, []);

  // Parallax: الدوائر الملونة بتتحرك أبطأ من السكرول
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const yTop = useTransform(scrollYProgress, [0, 1], [-70, 70]);
  const yBottom = useTransform(scrollYProgress, [0, 1], [70, -70]);

  return (
    <section
      ref={sectionRef}
      id="study-hub"
      className="relative overflow-hidden bg-[#F7FAFC] px-5 pb-14 pt-6 md:px-8 md:pb-16"
      style={{ fontFamily: FONT }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(15,42,74,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y: yTop }}
        className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-[#A78BFA]/20 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y: yBottom }}
        className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#2DD4BF]/20 blur-3xl"
      />

      <div className={`relative ${CONTAINER}`}>
        <StudyHubHeader tool={tool} />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative grid overflow-hidden rounded-[36px] border border-[#0F2A4A]/10 bg-white shadow-[0_40px_80px_-50px_rgba(15,42,74,0.55)] lg:grid-cols-[1fr_1.15fr]"
        >
          {/* يمين: الكتب */}
          <div className="border-b border-[#0F2A4A]/10 lg:border-b-0 lg:border-l">
            <BooksSection onBookChange={setBook} />
          </div>

          {/* يسار: الـ AI */}
          <div className="relative">
            <AiStudyLab book={book} onToolChange={setTool} />
            <StudyHubBridge tool={tool} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}