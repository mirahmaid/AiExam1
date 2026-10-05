/* =====================================================
   طلبات الفيديوهات
   USE_MOCK = true  → بيانات تجريبية (للتصميم والتجربة بدون باك)
   USE_MOCK = false → الباك الحقيقي (لما يجهز endpoint الفيديوهات)
===================================================== */

const USE_MOCK = true;

// الباك بيشتغل على بورت 3002 وكل الراوتات تحت /api/v1
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3002/api/v1";

function authHeaders() {
  const token = localStorage.getItem("token"); // ⚠️ غيّري الاسم إذا بتخزنوه بمكان ثاني
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// كل تغيير بشكل الـ response من الباك بتعدليه هون بس
function mapVideo(raw, index) {
  return {
    id: raw.id,
    title: raw.title ?? raw.name ?? `الدرس ${index + 1}`,
    description: raw.description ?? "",
    duration: raw.durationSeconds ?? raw.duration ?? 0,
    url: raw.videoUrl ?? raw.url ?? "",
    youtubeId: raw.youtubeId ?? "",
    chapter: raw.chapterName ?? raw.chapter ?? "",
    order: raw.orderIndex ?? raw.order ?? index,
  };
}

/* ---------- بيانات تجريبية (نفس شكل رد الباك) ---------- */

// فيديو تجريبي مجاني من MDN، بس عشان تشوفي المشغّل شغال
const SAMPLE_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const MOCK_VIDEOS = [
  { id: "m1", title: "مقدمة المادة", description: "نظرة عامة على المنهاج وكيف رح نمشي فيه.", durationSeconds: 540, chapterName: "الوحدة الأولى", orderIndex: 0 },
  { id: "m2", title: "الدرس الأول: الأساسيات", description: "نبدأ بالمفاهيم الأساسية خطوة خطوة.", durationSeconds: 905, chapterName: "الوحدة الأولى", orderIndex: 1 },
  { id: "m3", title: "الدرس الثاني: أمثلة محلولة", description: "نحل أمثلة متنوعة على الدرس السابق.", durationSeconds: 780, chapterName: "الوحدة الأولى", orderIndex: 2 },
  { id: "m4", title: "الدرس الثالث: تطبيقات", description: "تطبيقات عملية وأسئلة وزارية.", durationSeconds: 660, chapterName: "الوحدة الثانية", orderIndex: 3 },
  { id: "m5", title: "مراجعة الوحدة", description: "مراجعة سريعة قبل الاختبار.", durationSeconds: 420, chapterName: "الوحدة الثانية", orderIndex: 4 },
].map((v) => ({ ...v, videoUrl: SAMPLE_URL }));

async function fetchMockVideos() {
  await new Promise((resolve) => setTimeout(resolve, 500)); // تأخير بسيط يشبه الشبكة
  return MOCK_VIDEOS.map(mapVideo);
}

/* ---------- الباك الحقيقي ---------- */

export async function fetchSubjectVideos(subjectId) {
  if (USE_MOCK) return fetchMockVideos();

  const res = await fetch(`${BASE}/subjects/${subjectId}/videos`, {
    headers: { ...authHeaders() },
  });

  if (!res.ok) throw new Error("Failed to load videos");

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.items ?? [];

  return list.map(mapVideo).sort((a, b) => a.order - b.order);
}