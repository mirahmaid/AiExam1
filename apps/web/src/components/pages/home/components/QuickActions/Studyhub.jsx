import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../../../context/AuthContext";
import { useSubjects } from "../Subjects/useSubjects";
import { actions } from "./Actiondata";
import ActionTile from "./ActionTile";
import SubjectsPanel from "./SubjectsPanel";

/* =====================================================
   StudyHub: الإجراءات السريعة + المواد في سيكشن واحد
   الإجراءات (2×2) على اليمين، والمواد بلوحة جنبها على اليسار
   ما في سكرول كتير: كله بشاشة وحدة
===================================================== */

const getBranchName = (b) => b?.name?.replace("الفرع ", "")?.replace(/ي$/, "ية") || "";

export default function StudyHub() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { selectedBranch } = useAuth();
  const { subjects, isLoading, error } = useSubjects(selectedBranch?.id);
  const [flash, setFlash] = useState(0);

  const handleAction = (href) => {
    if (href === "#subjects") {
      document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlash((k) => k + 1);
    } else if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(href);
    }
  };

  // عدّلي المسار حسب الراوتر عندك
  const openSubject = (s) => navigate(`/subjects/${s.id}`);

  return (
    <section
      dir="rtl"
      aria-labelledby="hub-title"
      className="relative overflow-hidden bg-[#F7FAFC] px-5 pb-16 pt-4 md:px-8"
      style={{ fontFamily: "'Cairo', system-ui, sans-serif" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-[#A78BFA]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#2DD4BF]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1280px]">
        <motion.h2
          id="hub-title"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-[26px] font-black text-[#0F2A4A] md:text-[32px]"
        >
          ماذا تريد أن تفعل اليوم؟
        </motion.h2>

        <div className="grid items-stretch gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {actions.map((a, i) => (
              <ActionTile key={a.id} action={a} index={i} reduce={reduce} onClick={() => handleAction(a.href)} />
            ))}
          </div>

          <SubjectsPanel
            subjects={subjects}
            isLoading={isLoading}
            error={error}
            branchName={getBranchName(selectedBranch)}
            flash={flash}
            reduce={reduce}
            onSelect={openSubject}
          />
        </div>
      </div>
    </section>
  );
}