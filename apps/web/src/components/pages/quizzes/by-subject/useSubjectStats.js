import { useMemo } from "react";
import { scorePercent } from "../../../../../lib/quiz";

export function useSubjectStats(subjects, attempts) {
  return useMemo(() => {
    const stats = new Map();

    for (const s of subjects) {
      const list = attempts.filter((a) => a.subjectId === s.id);
      const percents = list.map(scorePercent);
      stats.set(s.id, {
        count: list.length,
        best: percents.length ? Math.max(...percents) : 0,
        avg: percents.length ? Math.round(percents.reduce((x, y) => x + y, 0) / percents.length) : 0,
        last: list[0]?.finishedAt ?? null, // attempts مرتبة من الأحدث
      });
    }

    const practiced = subjects.filter((s) => stats.get(s.id).count > 0);
    const weakest = practiced.length
      ? practiced.reduce((a, b) => (stats.get(b.id).avg < stats.get(a.id).avg ? b : a))
      : null;

    return { stats, practiced: practiced.length, weakest };
  }, [subjects, attempts]);
}