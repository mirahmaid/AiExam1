import { BRANCH_IDS } from "./teachersData";

// رابط الـ API الحقيقي عندك
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * يبني رابط صورة المعلم عبر الـ endpoint المخصص بالباك إند
 * GET /api/v1/teachers/{id}/photo — هاد هو الرابط الصح للاستخدام
 * (مش imageUrl المباشر من الـ response، لأنه بيرجع 401 كونه رابط خاص على B2)
 */
export function getTeacherPhotoUrl(id) {
  return `${API_BASE_URL}/api/v1/teachers/${id}/photo`;
}

/**
 * يجلب لائحة المعلمين من GET /api/v1/teachers، مع فلترة اختيارية حسب الفرع.
 *
 * آلية الفلترة:
 * كل معلم مرتبط بمادة (subject) عبر subjectId، وكل مادة مرتبطة بفرع عبر subject.branchId.
 * فبنفلتر المعلمين اللي subject.branchId تبعهم يطابق id الفرع المطلوب (BRANCH_IDS).
 *
 * ملاحظة: لحد ما الأدمن يربط كل معلم بمادة مناسبة من صفحة إدارة المعلمين،
 * subjectId/subject رح يضلوا null وبالتالي ما رح يظهر أي معلم تحت أي فرع محدد.
 * المعلمين اللي بدون تصنيف (subject: null) بيظهروا فقط لما ما يكون في track محدد.
 */
export async function getTeachers(options = {}) {
  const { track, limit = 50, page = 1 } = options; // الحد الأقصى المسموح به من الباك إند هو 50

  const url = new URL(`${API_BASE_URL}/api/v1/teachers`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`فشل جلب قائمة المعلمين: ${res.status}`);
  }

  const json = await res.json();
  const activeTeachers = json.data.filter((t) => t.isActive);

  if (!track) {
    return activeTeachers;
  }

  const branchId = BRANCH_IDS[track];
  return activeTeachers.filter((t) => t.subject?.branchId === branchId);
}