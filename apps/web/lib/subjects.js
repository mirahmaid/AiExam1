import { useAuth } from "../src/context/AuthContext";
import { useSubjects } from "../src/components/pages/home/components/Subjects/useSubjects";
export function useBranchSubjects() {
  const { selectedBranch } = useAuth();

  const { subjects, isLoading, error } = useSubjects(
    selectedBranch?.id
  );

  return {
    subjects: error ? [] : subjects,
    isLoading,
    error,
    branchName: selectedBranch?.name,
  };
}