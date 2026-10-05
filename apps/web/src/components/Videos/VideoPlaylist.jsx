import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, PlayCircle } from "lucide-react";

import { formatDuration } from "./Data";

/* =====================================================
   قائمة الدروس (بتتقسم حسب الفصل لو الباك بعت chapter)
===================================================== */

// أعمدة صغيرة بتتحرك عند الدرس اللي شغال
function Bars({ reduce }) {
  if (reduce) return <PlayCircle size={18} aria-hidden="true" />;

  return (
    <span aria-hidden="true" className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-[#0B1F3A]"
          animate={{ height: ["30%", "100%", "50%"] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export default function VideoPlaylist({ videos, activeId, tone, subjectName, onSelect, reduce }) {
  // نجمّع الدروس حسب الفصل مع الحفاظ على الترتيب
  const groups = useMemo(() => {
    const result = [];
    videos.forEach((video, index) => {
      const last = result[result.length - 1];
      if (last && last.chapter === video.chapter) last.items.push({ video, index });
      else result.push({ chapter: video.chapter, items: [{ video, index }] });
    });
    return result;
  }, [videos]);

  return (
    <aside className="relative overflow-hidden rounded-[32px] border border-[#0F2A4A]/10 bg-white shadow-[0_40px_80px_-50px_rgba(15,42,74,0.55)] lg:sticky lg:top-28">
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        initial={false}
        animate={{ backgroundColor: tone.color }}
        transition={{ duration: 0.6 }}
      />

      <div className="flex items-start justify-between gap-3 p-5 pb-3 pt-6">
        <div>
          <h3 className="text-[20px] font-black text-[#0F2A4A]">دروس {subjectName}</h3>
          <p className="mt-0.5 text-[13px] font-bold text-[#64748B]">اختاري الدرس اللي بدك إياه</p>
        </div>

        <span
          className="flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-[15px] font-black"
          style={{ background: tone.soft, color: tone.deep }}
        >
          {videos.length}
        </span>
      </div>

      <div className="max-h-[520px] overflow-y-auto px-3 pb-4 [scrollbar-color:#CBD5E1_transparent] [scrollbar-width:thin]">
        {groups.map((group, g) => (
          <div key={`${group.chapter}-${g}`} className="mb-2">
            {group.chapter && (
              <p className="flex items-center gap-2 px-2 pb-1.5 pt-3 text-[13px] font-black" style={{ color: tone.deep }}>
                {group.chapter}
                <span aria-hidden="true" className="h-px flex-1" style={{ background: `${tone.color}66` }} />
              </p>
            )}

            <ul className="space-y-1.5">
              {group.items.map(({ video, index }) => {
                const active = String(video.id) === String(activeId);
                return (
                  <motion.li
                    key={video.id}
                    initial={reduce ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.05 }}
                  >
                    <motion.button
                      type="button"
                      aria-current={active ? "true" : undefined}
                      onClick={() => onSelect(video)}
                      whileHover={reduce ? undefined : { x: -4 }}
                      whileTap={reduce ? undefined : { scale: 0.97 }}
                      className={`group flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-right transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 ${
                        active ? "" : "border-transparent hover:bg-[#F4F8FB]"
                      }`}
                      style={{
                        borderColor: active ? tone.color : undefined,
                        background: active ? tone.soft : undefined,
                        "--tw-ring-color": `${tone.color}66`,
                      }}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-black transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: active ? tone.color : "#EEF2F6",
                          color: active ? "#0B1F3A" : "#64748B",
                        }}
                      >
                        {active ? <Bars reduce={reduce} /> : index + 1}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-[15px] font-extrabold leading-6 text-[#0F2A4A]">
                          {video.title}
                        </span>
                        {video.duration > 0 && (
                          <span className="mt-0.5 flex items-center gap-1 text-[12px] font-bold text-[#64748B]">
                            <Clock size={12} aria-hidden="true" />
                            {formatDuration(video.duration)}
                          </span>
                        )}
                      </span>
                    </motion.button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}