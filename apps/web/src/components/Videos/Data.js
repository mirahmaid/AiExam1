// ثوابت صفحة الفيديوهات (نفس قيم باقي السكاشن عشان التناسق)

export const EASE = [0.22, 1, 0.36, 1];
export const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

// نفس عرض الـ header و HomeHero
export const CONTAINER = "mx-auto w-full max-w-[1000px]";

// ألوان المواد: بتتوزع حسب ترتيب المادة بالقائمة
export const TONES = [
  { color: "#2DD4BF", deep: "#0F8B78", soft: "#E6F8F2" },
  { color: "#60A5FA", deep: "#2F6FDB", soft: "#E7F1FF" },
  { color: "#A78BFA", deep: "#6D4AFF", soft: "#F0EBFF" },
  { color: "#FBBF24", deep: "#B77900", soft: "#FFF3D1" },
  { color: "#FB7185", deep: "#E11D48", soft: "#FFE9ED" },
];

// يطلّع id الفيديو من أي رابط يوتيوب (watch / youtu.be / embed)
export function getYoutubeId(url = "") {
  const match = String(url).match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? match[1] : "";
}

// 125 ثانية → "2:05"
export function formatDuration(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}