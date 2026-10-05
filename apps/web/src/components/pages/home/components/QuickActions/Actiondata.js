import { Compass, Library, PenLine, Bot } from "lucide-react";

// scene = اسم المشهد المتحرك اللي بيظهر داخل البطاقة (انظر ActionTile.jsx)
export const actions = [
  {
    id: "subjects",
    title: "استكشف المواد",
    text: "كل مواد فرعك بمكان واحد.",
    href: "#subjects",
    icon: Compass,
    scene: "orbit",
    color: "#2DD4BF",
    deep: "#0F8B78",
    soft: "#E6F8F2",
  },
  {
    id: "books",
    title: "افتح مكتبتك",
    text: "الكتب والمراجع جاهزة.",
    href: "#books",
    icon: Library,
    scene: "books",
    color: "#FBBF24",
    deep: "#B77900",
    soft: "#FFF3D1",
  },
  {
    id: "exam",
    title: "اختبر نفسك",
    text: "اختبار على مقاس مستواك.",
    href: "/ai-path",
    icon: PenLine,
    scene: "check",
    color: "#A78BFA",
    deep: "#6D4AFF",
    soft: "#F0EBFF",
  },
  {
    id: "assistant",
    title: "اسأل المساعد الذكي",
    text: "اكتب سؤالك وبيجيك الشرح.",
    href: "/ai-path",
    icon: Bot,
    scene: "chat",
    color: "#60A5FA",
    deep: "#2F6FDB",
    soft: "#E7F1FF",
  },
];