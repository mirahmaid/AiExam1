import { useState } from "react";
import { BookOpen, Calculator, Globe, Landmark } from "lucide-react";

// أيقونة بديلة حسب اسم المادة إذا الصورة ما انفتحت
const FALLBACKS = [
  ["تاريخ", Landmark],
  ["جغرافيا", Globe],
  ["رياضيات", Calculator],
];

export default function SubjectIcon({ src, title = "", className = "h-10 w-10" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const Icon = FALLBACKS.find(([key]) => title.includes(key))?.[1] ?? BookOpen;
    return <Icon className={`${className} p-1 text-[#0F8B78]`} aria-hidden="true" />;
  }

  return (
    <img
      src={src}
      alt=""
      className={`${className} object-contain`}
      onError={() => setFailed(true)}
    />
  );
}