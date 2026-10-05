import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Layers, PlayCircle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { fetchSubjectsByBranch } from "../pages/home/components/Book/Api/books";
import Header from "../Header/Header";

import { EASE, FONT, TONES } from "./Data";
import { fetchSubjectVideos } from "./videosApi";
import SubjectTabs from "./SubjectTabs";
import VideoPlayer from "./VideoPlayer";
import VideoPlaylist from "./VideoPlaylist";

/* =====================================================
   صفحة الفيديوهات
   الراوت: /videos/:subjectId/:videoId?
   - بدون videoId: بنفتح أول درس بالمادة تلقائيًا
   - subjectId ممكن يكون id حقيقي أو (مؤقتًا) slug من الـ hero،
     وبنتعرّف على المادة بالـ id أو باسمها اللي جاي بالـ state
===================================================== */

function Message({ children, tone, reduce }) {
  return (
    <div className="rounded-[32px] border border-[#0F2A4A]/10 bg-white p-10 text-center shadow-[0_40px_80px_-50px_rgba(15,42,74,0.55)]">
      <motion.span
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: tone.soft, color: tone.deep }}
        animate={reduce ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <PlayCircle size={26} aria-hidden="true" />
      </motion.span>
      <p className="text-[17px] font-bold text-[#475569]">{children}</p>
    </div>
  );
}

export default function VideosPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId, videoId } = useParams();
  const { selectedBranch } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [error, setError] = useState("");

  // ---------- مواد الفرع ----------
  useEffect(() => {
    if (!selectedBranch) return;
    let cancelled = false;

    fetchSubjectsByBranch(selectedBranch.id)
      .then((result) => !cancelled && setSubjects(result))
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("تعذر تحميل المواد");
      })
      .finally(() => !cancelled && setLoadingSubjects(false));

    return () => {
      cancelled = true;
    };
  }, [selectedBranch]);

  const subjectIndex = useMemo(() => {
    const byId = subjects.findIndex((s) => String(s.id) === String(subjectId));
    if (byId !== -1) return byId;
    return subjects.findIndex((s) => s.name === location.state?.subjectName);
  }, [subjects, subjectId, location.state]);

  const subject = subjects[subjectIndex];
  const tone = TONES[Math.max(subjectIndex, 0) % TONES.length];

  // ---------- فيديوهات المادة ----------
  useEffect(() => {
    if (!subject) return;
    let cancelled = false;

    setLoadingVideos(true);
    setError("");

    fetchSubjectVideos(subject.id)
      .then((list) => !cancelled && setVideos(list))
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setVideos([]);
          setError("تعذر تحميل الفيديوهات");
        }
      })
      .finally(() => !cancelled && setLoadingVideos(false));

    return () => {
      cancelled = true;
    };
  }, [subject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- بدون videoId: افتح أول درس ----------
  useEffect(() => {
    if (!subject || loadingVideos || !videos.length || videoId) return;
    navigate(`/videos/${subject.id}/${videos[0].id}`, { replace: true });
  }, [subject, loadingVideos, videos, videoId, navigate]);

  const currentIndex = Math.max(
    0,
    videos.findIndex((v) => String(v.id) === String(videoId))
  );
  const video = videos[currentIndex];

  const goVideo = (v) => subject && navigate(`/videos/${subject.id}/${v.id}`);
  const goSubject = (s) => navigate(`/videos/${s.id}`);

  const rise = (delay) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  // حركة الدوائر الخلفية: بتطفو ببطء، وبتتوقف لو المستخدم مفعّل تقليل الحركة
  const float = (distance, duration) =>
    reduce
      ? {}
      : {
          y: [0, distance, 0],
          transition: { y: { duration, repeat: Infinity, ease: "easeInOut" } },
        };

  const loading = loadingSubjects || loadingVideos;

  return (
    <>
    <Header />
    <section
      dir="rtl"
      aria-labelledby="videos-title"
      className="relative min-h-screen overflow-hidden bg-[#F7FAFC] pb-20 pt-28 md:pt-32"
      style={{ fontFamily: FONT }}
    >
      {/* نفس أجواء HomeHero: شبكة نقاط + دوائر بلون المادة */}
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
        className="pointer-events-none absolute -right-40 -top-44 h-[520px] w-[520px] rounded-full blur-3xl"
        initial={false}
        animate={{ backgroundColor: tone.color, opacity: 0.25, ...float(30, 11) }}
        transition={{ duration: 0.9 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -left-40 h-[460px] w-[460px] rounded-full bg-[#A78BFA]/15 blur-3xl"
        animate={float(-28, 13)}
      />

      {/* نفس عرض الـ Header: من الشعار لصورة الأدمن */}
      <div className="relative mx-auto w-full max-w-[1340px] px-5 md:px-8">
        {/* ============ العنوان ============ */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <motion.span
            {...rise(0)}
            className="inline-flex items-center gap-2.5 rounded-full border border-[#2DD4BF]/30 bg-white px-4 py-2 text-[15px] font-extrabold text-[#0F8B78] shadow-[0_8px_25px_-15px_rgba(15,42,74,0.25)]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#12897A] opacity-60" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-[#12897A]" />
            </span>
            مكتبة الفيديو
          </motion.span>

          {videos.length > 0 && !loading && (
            <motion.span
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-black"
              style={{ background: tone.soft, color: tone.deep }}
            >
              <Layers size={15} aria-hidden="true" />
              {videos.length} درس بانتظارك
            </motion.span>
          )}
        </div>

        <motion.h1
          {...rise(0.1)}
          id="videos-title"
          className="text-[38px] font-black leading-[1.3] text-[#0F2A4A] md:text-[52px]"
        >
          فيديوهات{" "}
          <motion.span
            initial={false}
            animate={{ color: tone.deep }}
            transition={{ duration: 0.6 }}
            className="relative inline-block"
          >
            {subject?.name ?? "المواد"}

            {/* خط مرسوم باليد تحت اسم المادة، بينرسم من جديد كل ما تتغير المادة */}
            <svg
              key={subject?.id}
              aria-hidden="true"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              className="absolute -bottom-1 right-0 h-3 w-full"
            >
              <motion.path
                d="M2 8 Q 25 0 50 7 T 100 7 T 150 7 T 198 6"
                fill="none"
                stroke={tone.color}
                strokeWidth="4"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
              />
            </svg>
          </motion.span>
        </motion.h1>

        <motion.div {...rise(0.25)} className="mb-8 mt-6">
          <SubjectTabs subjects={subjects} activeId={subject?.id} onSelect={goSubject} reduce={reduce} />
        </motion.div>

        {/* ============ المحتوى ============ */}
        {error ? (
          <Message tone={tone} reduce={reduce}>{error}</Message>
        ) : !loadingSubjects && !subject ? (
          <Message tone={tone} reduce={reduce}>ما لقينا هالمادة. اختر مادة من الأعلى.</Message>
        ) : loading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]" aria-busy="true">
            <div className="aspect-video animate-pulse rounded-[32px] bg-[#E2E8F0]" />
            <div className="h-[360px] animate-pulse rounded-[32px] bg-[#E2E8F0]" />
          </div>
        ) : videos.length === 0 ? (
          <Message tone={tone} reduce={reduce}>لسا ما في فيديوهات لهالمادة. رح تنزل قريبًا!</Message>
        ) : (
          video && (
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
              <VideoPlayer
                video={video}
                tone={tone}
                index={currentIndex}
                total={videos.length}
                reduce={reduce}
                onPrev={() => goVideo(videos[currentIndex - 1])}
                onNext={() => goVideo(videos[currentIndex + 1])}
              />
              <VideoPlaylist
                videos={videos}
                activeId={video.id}
                tone={tone}
                subjectName={subject.name}
                reduce={reduce}
                onSelect={goVideo}
              />
            </div>
          )
        )}
      </div>
    </section>
    </>
  );
}