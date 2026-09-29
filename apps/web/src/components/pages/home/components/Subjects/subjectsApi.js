const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchSubjectsByBranch(branchId, signal) {
const res = await fetch(`${API_BASE_URL}/api/v1/subjects/branch/${branchId}`, {    signal,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch subjects (status ${res.status})`);
  }

  return res.json();
}