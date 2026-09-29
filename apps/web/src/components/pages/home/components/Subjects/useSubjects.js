import { useEffect, useState } from "react";
import { fetchSubjectsByBranch } from "./subjectsApi";
import {
  subjectsByBranch,
  defaultSubjects,
  BRANCH_IDS,
} from "./subjectsData";

const FALLBACK_ICON = "/Subject/subject.png";
const FALLBACK_DESCRIPTION = "";

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

function mergeWithLocalData(branchId, apiSubjects) {
  const localSubjects = subjectsByBranch[branchId] || [];

  // نطبّع المواد المحلية مرة واحدة بدل تكرار العملية لكل مادة
  const localByNormalizedTitle = new Map(
    localSubjects.map((local) => [
      normalizeArabic(local.title),
      local,
    ])
  );

  return apiSubjects.map((apiSubject) => {
    const localMatch = localByNormalizedTitle.get(
      normalizeArabic(apiSubject.name)
    );

    return {
      id: apiSubject.id,
      title: apiSubject.name,
      description: localMatch?.description ?? FALLBACK_DESCRIPTION,
      icon: localMatch?.icon ?? FALLBACK_ICON,
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
        const apiSubjects = await fetchSubjectsByBranch(
          effectiveBranchId,
          controller.signal
        );

        setSubjects(
          apiSubjects.length > 0
            ? mergeWithLocalData(effectiveBranchId, apiSubjects)
            : subjectsByBranch[effectiveBranchId] || defaultSubjects
        );
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Failed to load subjects:", err);

        setError("تعذر تحميل المواد الدراسية");

        setSubjects(
          subjectsByBranch[effectiveBranchId] || defaultSubjects
        );
      } finally {
        setIsLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [effectiveBranchId, initialSubjects]);

  return {
    subjects,
    isLoading,
    error,
  };
}