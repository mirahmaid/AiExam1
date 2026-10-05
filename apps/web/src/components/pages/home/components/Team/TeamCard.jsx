import { motion } from "framer-motion";
import { Bot, Code2, Layers3, Palette, Phone, Server, Smartphone } from "lucide-react";
const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

const ROLE_ICONS = {
  "Frontend Developer": Code2,
  "UI/UX Designer": Palette,
  "Backend Developer": Server,
  "Flutter Developer": Smartphone,
  "AI Developer": Bot,
  "Project & Product": Layers3,
};

/* =====================================================
   بطاقة عضو في الفريق
   إذا في member.image بتظهر الصورة، وإلا أيقونة الدور
===================================================== */

export default function TeamCard({ member, compact = false, index = 0 }) {
  const Icon = ROLE_ICONS[member.role] ?? Layers3;
  const { color } = member;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-[28px] border border-[#0F2A4A]/10 bg-white shadow-[0_20px_45px_-32px_rgba(15,42,74,0.45)]"
      style={{ fontFamily: FONT }}
    >
      <span className="absolute inset-x-0 top-0 z-10 h-1" style={{ background: color }} />

      {/* الغلاف */}
      <div
        className={`relative overflow-hidden ${compact ? "h-[210px]" : "h-[280px] sm:h-[300px]"}`}
        style={{
          background: `radial-gradient(circle at 25% 20%, ${color}55, transparent 34%), linear-gradient(145deg, #0B1F3A 0%, #102A43 55%, #0F2A4A 100%)`,
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <span aria-hidden="true" className="absolute -right-10 top-6 h-32 w-32 rounded-full blur-3xl" style={{ background: color, opacity: 0.3 }} />
        <span aria-hidden="true" className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full blur-3xl" style={{ background: color, opacity: 0.18 }} />

        {member.image ? (
          <>
            <img src={member.image} alt={member.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B1F3A]/80 to-transparent" />
          </>
        ) : (
          <motion.div
            whileHover={{ rotate: 8, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[34px] border border-white/15 bg-white/[0.08] backdrop-blur-md"
            style={{ boxShadow: `0 0 55px ${color}30` }}
          >
            <div className="absolute inset-3 rounded-[26px] opacity-20 blur-md" style={{ background: color }} />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `${color}22`, color }}>
              <Icon size={32} strokeWidth={1.8} aria-hidden="true" />
            </div>
          </motion.div>
        )}

        <span
          className="absolute bottom-4 right-4 rounded-full px-3.5 py-1.5 text-[12px] font-black text-[#0B1F3A] shadow-lg"
          style={{ background: color }}
        >
          {member.shortRole}
        </span>
      </div>

      {/* المحتوى */}
      <div className="p-4 sm:p-5">
        <h3 className="text-[18px] font-black text-[#0F2A4A]">{member.name}</h3>
        <p className="mt-1 text-[13px] font-bold text-[#64748B]">{member.role}</p>

        {!compact && (
          <div className="mt-4 flex items-center gap-2">
            <a
              href={`tel:${member.phone}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#F5F8FA] px-3 py-2.5 text-[13px] font-bold text-[#0F2A4A] transition-colors hover:bg-[#E8F7F3] hover:text-[#0F8B78]"
            >
              <Phone size={14} aria-hidden="true" />
              {member.phone}
            </a>

            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={`LinkedIn - ${member.name}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7F3] text-[13px] font-black text-[#0F8B78] transition-all hover:-translate-y-0.5 hover:bg-[#0F8B78] hover:text-white"
            >
              in
            </a>
          </div>
        )}
      </div>
    </motion.article>
  );
}