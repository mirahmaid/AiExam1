import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { CONTAINER } from "../../../../../../lib/layout"; // عدّلي المسار حسب مكان الملف
import TeamCard from "./TeamCard";
import { TEAM_MEMBERS } from "./teamData";

const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

export default function TeamSection() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden bg-[#F7FAFC] px-5 py-14 md:px-8 md:py-16"
      style={{ fontFamily: FONT }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-72 w-72 rounded-full bg-[#2DD4BF]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-[#A78BFA]/10 blur-3xl" />

      <div className={`relative ${CONTAINER}`}>
        {/* العنوان */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-black text-[#0F8B78] shadow-sm">
              <Sparkles size={14} className="text-[#A78BFA]" aria-hidden="true" />
              خلف مسار التميز
            </span>

            <h2 className="text-[28px] font-black leading-tight text-[#0F2A4A] sm:text-[34px]">فريق صنع الفكرة</h2>

            <p className="mt-2 max-w-[540px] text-[15px] font-medium leading-8 text-[#475569]">
              كل جزء من مسار التميز وراءه شخص ساهم بفكرة، تصميم أو سطر كود.
            </p>
          </div>

          <Link
            to="/team"
            className="group flex items-center gap-2 rounded-2xl bg-[#0F2A4A] px-5 py-3 text-[14px] font-black text-white shadow-[0_14px_30px_-18px_rgba(15,42,74,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0F8B78]"
          >
            تعرف على أعضاء الفريق
            <ArrowLeft size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* معاينة */}
        <div className="grid gap-4 md:grid-cols-3">
          {TEAM_MEMBERS.slice(0, 3).map((member, index) => (
            <TeamCard key={member.id} member={member} index={index} compact />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-5 flex items-center justify-center gap-2 text-[13px] font-bold text-[#64748B]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />
          {TEAM_MEMBERS.length} أعضاء يعملون معًا لبناء تجربة أفضل
        </motion.div>
      </div>
    </section>
  );
}