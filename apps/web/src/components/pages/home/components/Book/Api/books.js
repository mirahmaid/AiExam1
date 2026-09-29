import { fetchWithAuth } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchSubjectsByBranch(branchId) {
  const res = await fetch(
    `${API_URL}/api/v1/subjects/branch/${branchId}`
  );

  if (!res.ok) {
    throw new Error("تعذر تحميل المواد الدراسية");
  }

  return res.json();
}

export async function downloadSubjectBook(subjectId, subjectName) {
  const res = await fetchWithAuth(
    `${API_URL}/api/v1/subjects/${subjectId}/book/file`
  );

  if (!res.ok) {
    throw new Error("تعذر تحميل الكتاب");
  }

  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `${subjectName}.pdf`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}