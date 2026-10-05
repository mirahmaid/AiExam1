import {
  Atom,
  Briefcase,
  Calculator,
  Coins,
  Dna,
  Flame,
  FlaskConical,
  Globe,
  Landmark,
  Languages,
  Laptop,
  Lightbulb,
  MousePointerClick,
  PencilLine,
  PlayCircle,
  Receipt,
  ScrollText,
  Star,
  Target,
  Trophy,
} from "lucide-react";

/* =====================================================
   ثوابت + بيانات + دوال مساعدة للـ Dashboard
===================================================== */

export const EASE = [0.22, 1, 0.36, 1];
export const NAVY = "#0F2A4A";
export const DEFAULT_ACCENT = { color: "#2DD4BF", deep: "#0F8B78" };
export const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

// نفس عرض الـ header (من تحت اللوجو لتحت صورة المستخدم)
// إذا الـ header عندك بيستخدم عرض ثاني، غيّر الرقم هون بس
export const CONTAINER = "mx-auto w-full max-w-[1280px]";

/* ---------- الألوان ---------- */

const PALETTE = {
  teal: { color: "#2DD4BF", deep: "#0F8B78", soft: "#E6F8F2" },
  blue: { color: "#60A5FA", deep: "#2F6FDB", soft: "#E7F1FF" },
  purple: { color: "#A78BFA", deep: "#6D4AFF", soft: "#F0EBFF" },
  amber: { color: "#FBBF24", deep: "#B77900", soft: "#FFF3D1" },
  rose: { color: "#FB7185", deep: "#E11D48", soft: "#FFE9ED" },
};

/* ---------- المواد حسب الفرع ---------- */

const subject = (id, name, icon, tone) => ({
  id,
  name,
  icon,
  ...PALETTE[tone],
  // الزر بالـ hero بيودّي لصفحة فيديوهات المادة (أول درس بيفتح لحاله)
  to: `/videos/${id}`,
});

// استبدلها بمواد الطالب الحقيقية من الـ API
export const BRANCH_SUBJECTS = {
  scientific: [
    subject("math", "الرياضيات", Calculator, "teal"),
    subject("physics", "الفيزياء", Atom, "blue"),
    subject("chemistry", "الكيمياء", FlaskConical, "purple"),
    subject("biology", "الأحياء", Dna, "amber"),
  ],
  literary: [
    subject("arabic", "اللغة العربية", ScrollText, "teal"),
    subject("english", "اللغة الإنجليزية", Languages, "blue"),
    subject("islamic", "الثقافة الإسلامية", Star, "purple"),
    subject("history", "التاريخ", Landmark, "amber"),
    subject("geography", "الجغرافيا", Globe, "rose"),
    subject("computer", "الحاسوب", Laptop, "teal"),
  ],
  entrepreneurship: [
    subject("entrepreneurship", "الريادة والأعمال", Lightbulb, "teal"),
    subject("management", "الإدارة", Briefcase, "blue"),
    subject("accounting", "المحاسبة", Receipt, "purple"),
    subject("economics", "الاقتصاد", Coins, "amber"),
  ],
};

// كلمات بنفتش عنها باسم الفرع. فرع جديد؟ زيدي سطر هون + مواده فوق
const BRANCH_KEYWORDS = [
  ["scientific", ["علمي", "scientific", "science"]],
  ["literary", ["أدبي", "ادبي", "literary", "arts"]],
  ["entrepreneurship", ["ريادي", "ريادة", "entrepreneur", "business"]],
];

export function getBranchKey(branch) {
  const text = [branch?.name, branch?.slug, branch?.key, branch?.id]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const hit = BRANCH_KEYWORDS.find(([, words]) => words.some((w) => text.includes(w)));
  return hit ? hit[0] : "scientific"; // لو الفرع مش معروف نرجع للعلمي
}

/* ---------- الخطوات ---------- */

export const STEPS = [
  { icon: MousePointerClick, title: "اختر مادتك", text: "مادة وحدة تبدأ فيها اليوم" },
  { icon: PlayCircle, title: "شاهد أول درس", text: "شرح بالفيديو، تقدر توقفه وترجع له" },
  { icon: PencilLine, title: "جرّب أسئلته", text: "تأكد إنك فهمت قبل ما تكمل" },
  { icon: Trophy, title: "شوف مستواك", text: "بعدها بنعرض لك تقدمك الحقيقي" },
];

export const CONFETTI_COLORS = ["#2DD4BF", "#FBBF24", "#60A5FA", "#A78BFA", "#FB7185"];

/* ---------- لوحة الإنجاز ---------- */

// القيم الافتراضية = صفر. لما تربطي الباك بتبعتيها كـ prop
export const EMPTY_STATS = {
  lessons: 0,
  quizzes: 0,
  avgScore: 0,
  streak: 0,
  xp: 0,
  weekly: [0, 0, 0, 0, 0, 0, 0], // الأحد → السبت
};

export const WEEK_LABELS = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

// الأوسمة بتنفتح لحالها من الأرقام نفسها (ما بدها حقل إضافي بالباك)
export const BADGES = [
  { id: "first-lesson", icon: PlayCircle, title: "أول درس", hint: "أكمل درسًا واحدًا", color: "#2DD4BF", done: (s) => s.lessons >= 1 },
  { id: "first-quiz", icon: PencilLine, title: "أول كويز", hint: "قدّم كويزًا واحدًا", color: "#60A5FA", done: (s) => s.quizzes >= 1 },
  { id: "streak", icon: Flame, title: "٣ أيام متواصلة", hint: "ادرس ٣ أيام ورا بعض", color: "#FB7185", done: (s) => s.streak >= 3 },
  { id: "ace", icon: Target, title: "متفوّق", hint: "معدّل ٩٠٪ بعد ٣ كويزات", color: "#FBBF24", done: (s) => s.quizzes >= 3 && s.avgScore >= 90 },
];

/* ---------- دوال مساعدة ---------- */

export function getStudentName() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const full =
      user?.name ||
      user?.fullName ||
      user?.firstName ||
      localStorage.getItem("userName") ||
      localStorage.getItem("name") ||
      "";
    return full.toString().trim().split(/\s+/)[0] || "";
  } catch {
    return "";
  }
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "صباح الخير";
  if (h < 18) return "أهلًا";
  return "مساء الخير";
}