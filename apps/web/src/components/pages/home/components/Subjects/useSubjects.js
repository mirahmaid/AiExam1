import { useEffect, useState } from "react";
import { fetchSubjectsByBranch } from "./subjectsApi";
import { subjectsByBranch, defaultSubjects, BRANCH_IDS } from "./subjectsData";

const FALLBACK_ICON = "/Subject/math.png"; // صورة موجودة فعلاً
const FALLBACK_DESCRIPTION = "";

// أيقونة مخمّنة حسب الاسم للمواد اللي ما لها بيانات محلية
const ICON_BY_KEYWORD = [
  ["رياضيات", "/Subject/math.png"],
  ["عربية", "/Subject/arabic.png"],
  ["انجليزية", "/Subject/english.png"],
  ["اسلامية", "/Subject/quran.png"],
  ["كيمياء", "/Subject/chemistry.png"],
  ["فيزياء", "/Subject/physics.png"],
  ["احياء", "/Subject/biology.png"],
  ["تكنولوجيا", "/Subject/technology.png"],
  ["تاريخ", "/Subject/history.png"],
  ["جغرافيا", "/Subject/geography.png"],
];

// تطبيع النص العربي: إزالة التشكيل، توحيد الهمزات، وإزالة "ال" التعريف من كل كلمة
function normalizeArabic(text) {
  return text
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .split(/\s+/)
    .map((word) => word.replace(/^ال/, ""))
    .join(" ");
}

function guessIcon(name) {
  const n = normalizeArabic(name);
  return ICON_BY_KEYWORD.find(([key]) => n.includes(key))?.[1] ?? FALLBACK_ICON;
}

function mergeWithLocalData(branchId, apiSubjects) {
  const localSubjects = subjectsByBranch[branchId] || [];

  const localByNormalizedTitle = new Map(
    localSubjects.map((local) => [normalizeArabic(local.title), local])
  );

  return apiSubjects.map((apiSubject) => {
    const localMatch = localByNormalizedTitle.get(normalizeArabic(apiSubject.name));

    return {
      id: apiSubject.id,
      title: apiSubject.name,
      description: localMatch?.description ?? FALLBACK_DESCRIPTION,
      icon: localMatch?.icon ?? guessIcon(apiSubject.name),
    };
  });
}

export function useSubjects(branchId, initialSubjects = null) {
  const effectiveBranchId = branchId || BRANCH_IDS.SCIENTIFIC;

  const [subjects, setSubjects] = useState(() =>
    initialSubjects && initialSubjects.length > 0
      ? mergeWithLocalData(effectiveBranchId, initialSubjects)
      : subjectsByBranch[effectiveBranchId] || defaultSubjects
  );

  const [isLoading, setIsLoading] = useState(!initialSubjects);
  const [error, setError] = useState(null);

  useEffect(() => {
    // إذا المواد وصلت مسبقًا من السيرفر، لا نعيد الطلب
    if (initialSubjects) return;

    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const apiSubjects = await fetchSubjectsByBranch(effectiveBranchId, controller.signal);

        setSubjects(
          apiSubjects.length > 0
            ? mergeWithLocalData(effectiveBranchId, apiSubjects)
            : subjectsByBranch[effectiveBranchId] || defaultSubjects
        );
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Failed to load subjects:", err);
        setError("تعذر تحميل المواد الدراسية");
        setSubjects(subjectsByBranch[effectiveBranchId] || defaultSubjects);
      } finally {
        setIsLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [effectiveBranchId, initialSubjects]);

  return { subjects, isLoading, error };
}