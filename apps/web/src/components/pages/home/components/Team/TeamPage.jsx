import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { CONTAINER } from "../../../../../../lib/layout";
import TeamCard from "./TeamCard";
import { TEAM_MEMBERS } from "./teamData";
const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

export default function TeamPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F7FAFC]" style={{ fontFamily: FONT }}>
      {/* الهيدر */}
      <header className="border-b border-[#E6EDF1] bg-white/85 backdrop-blur-xl">
        <div className={`flex h-[76px] items-center justify-between px-5 md:px-8 ${CONTAINER}`}>
          <Link
            to="/home"
            className="flex items-center gap-2 text-[14px] font-bold text-[#475569] transition-colors hover:text-[#0F2A4A]"
          >
            <ArrowRight size={17} aria-hidden="true" />
            العودة للرئيسية
          </Link>

          <img src="/logo.png" alt="مسار التميز" className="h-11 w-auto" />
        </div>
      </header>

      <main className="relative overflow-hidden px-5 py-12 md:px-8 md:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-[#2DD4BF]/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-10 h-80 w-80 rounded-full bg-[#A78BFA]/10 blur-3xl" />

        <div className={`relative ${CONTAINER}`}>
          <div className="mb-10 max-w-[680px]">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8F7F3] px-3.5 py-1.5 text-[12px] font-black text-[#0F8B78]">
              <Sparkles size={14} aria-hidden="true" />
              فريق مسار التميز
            </span>

            <h1 className="text-[32px] font-black leading-[1.35] text-[#0F2A4A] sm:text-[44px]">
              الأشخاص وراء <span className="text-[#0F8B78]">الفكرة</span>
            </h1>

            <p className="mt-3 max-w-[600px] text-[16px] font-medium leading-8 text-[#475569]">
              تعرّف على أعضاء الفريق الذين عملوا معًا على بناء مسار التميز وتحويل الفكرة إلى تجربة تعليمية متكاملة.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM_MEMBERS.map((member, index) => (
              <TeamCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}