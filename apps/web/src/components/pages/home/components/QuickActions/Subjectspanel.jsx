import { motion } from "framer-motion";
import { Orbit } from "lucide-react";

import SubjectChip from "./SubjectChip";

function Skeleton() {
  return <div className="h-[64px] animate-pulse rounded-2xl bg-[#EEF2F6]" />;
}

export default function SubjectsPanel({ subjects, isLoading, error, branchName, flash, onSelect, reduce }) {
  return (
    <div
      id="subjects"
      className="relative flex h-full flex-col overflow-hidden rounded-[32px] border border-[#0F2A4A]/10 bg-white p-5 shadow-[0_40px_80px_-50px_rgba(15,42,74,0.55)] sm:p-6"
    >
      {/* خط علوي بألوان الثيم */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: "linear-gradient(90deg,#2DD4BF,#A78BFA,#FBBF24)" }}
      />

      {/* وميض لما يضغط "استكشف المواد" */}
      {flash > 0 && !reduce && (
        <motion.span
          key={flash}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[32px]"
          initial={{ boxShadow: "inset 0 0 0 4px rgba(45,212,191,0.9)", opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        />
      )}

      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F8F2] text-[#0F8B78]">
          <Orbit size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-[20px] font-black leading-tight text-[#0F2A4A]">موادك</h2>
          {branchName && <p className="text-[12px] font-bold text-[#0F8B78]">{branchName}</p>}
        </div>
      </div>

      {error && <p className="mb-3 text-xs font-bold text-amber-600">{error}</p>}

      <div className="grid max-h-[400px] flex-1 content-start gap-2.5 overflow-y-auto pl-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 [scrollbar-width:thin]">
        {isLoading && !subjects.length
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
          : subjects.map((s, i) => (
              <SubjectChip key={s.id} subject={s} index={i} reduce={reduce} onClick={() => onSelect(s)} />
            ))}
      </div>
    </div>
  );
}