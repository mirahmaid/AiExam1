import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, PlayCircle, VideoOff } from "lucide-react";

import { EASE, getYoutubeId } from "./Data";

/* =====================================================
   المشغّل: إطار داكن (نفس لغة لوحة الإنجاز) + معلومات الدرس
===================================================== */

// فيديو العينة الافتراضي (الوردة) ما بنعرضه، بنعتبره كأنه ما في فيديو
const SAMPLE_VIDEO = /mozilla\.net|flower\.(mp4|webm)/i;

function Player({ video, tone, reduce }) {
  const ytId = video.youtubeId || getYoutubeId(video.url);

  if (ytId) {
    return (
      <iframe
        key={video.id}
        title={video.title}
        src={`https://www.youtube.com/embed/${ytId}?rel=0`}
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    );
  }

  if (video.url && !SAMPLE_VIDEO.test(video.url)) {
    return <video key={video.id} src={video.url} controls className="h-full w-full bg-black" />;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#0B1F3A] to-[#12315A] text-white">
      <span
        className="relative flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: `${tone.color}33`, color: tone.color }}
      >
        {!reduce && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${tone.color}` }}
            animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <VideoOff size={34} aria-hidden="true" />
      </span>

      <div className="text-center">
        <p className="text-[17px] font-black">الفيديو غير متوفر حاليًا</p>
        <p className="mt-1 text-[14px] font-bold text-white/60"> قريبا</p>
      </div>
    </div>
  );
}

export default function VideoPlayer({ video, tone, index, total, onPrev, onNext, reduce }) {
  const navBtn =
    "group relative flex items-center gap-2 overflow-hidden rounded-2xl border-2 px-5 py-3 text-[14px] font-black transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";

  return (
    <div>
      {/* الإطار */}
      <div
        className="group/frame relative overflow-hidden rounded-[32px] bg-[#0B1F3A] p-2 transition-transform duration-500 hover:-translate-y-1"
        style={{ boxShadow: `0 40px 80px -40px ${tone.color}` }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full blur-3xl transition-opacity duration-500 group-hover/frame:opacity-100" style={{ background: `${tone.color}44` }} />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-10 h-40 w-40 rounded-full blur-3xl" style={{ background: "#A78BFA33" }} />
        <div className="relative aspect-video overflow-hidden rounded-[26px] bg-black">
          <Player video={video} tone={tone} reduce={reduce} />
        </div>
      </div>

      {/* معلومات الدرس */}
      <AnimatePresence mode="wait">
        <motion.div
          key={video.id}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-6"
        >
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-black"
            style={{ background: tone.soft, color: tone.deep }}
          >
            <PlayCircle size={14} aria-hidden="true" />
            الدرس {index + 1} من {total}
          </span>

          <h2 className="mt-3 text-[26px] font-black leading-[1.4] text-[#0F2A4A] md:text-[30px]">{video.title}</h2>

          {video.description && (
            <p className="mt-2 max-w-[640px] text-[16px] font-medium leading-8 text-[#475569]">{video.description}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* شريط موقعك بين الدروس */}
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#0F2A4A]/10" aria-hidden="true">
        <motion.div
          className="h-full rounded-full"
          initial={false}
          animate={{ width: `${((index + 1) / total) * 100}%`, backgroundColor: tone.color }}
          transition={{ duration: 0.7, ease: EASE }}
        />
      </div>

      {/* السابق / التالي */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          className={`${navBtn} border-[#0F2A4A]/15 bg-white text-[#0F2A4A] hover:border-[#0F2A4A]`}
          style={{ "--tw-ring-color": `${tone.color}66` }}
        >
          <ArrowRight size={17} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
          الدرس السابق
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={index === total - 1}
          className={`${navBtn} text-[#0B1F3A]`}
          style={{
            background: tone.color,
            borderColor: tone.color,
            boxShadow: `0 14px 28px -14px ${tone.color}`,
            "--tw-ring-color": `${tone.color}66`,
          }}
        >
          {/* لمعة بتمرق عالزر لما تمرري عليه */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
          <span className="relative">الدرس التالي</span>
          <ArrowLeft size={17} aria-hidden="true" className="relative transition-transform duration-300 group-hover:-translate-x-1" />
        </button>
      </div>
    </div>
  );
}