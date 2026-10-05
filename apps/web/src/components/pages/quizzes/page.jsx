import { Link, useSearchParams } from "react-router-dom";
import { Archive, Layers, ListChecks } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import QuizFlow from "@/components/quiz/QuizFlow";
import QuizStatsStrip from "./QuizStatsStrip";
const FONT = "'Cairo','Tajawal',system-ui,sans-serif";
const glass =
  "flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/25 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/25";

function QuizzesContent() {
  const [params] = useSearchParams();
  return (
    <QuizFlow
      // إعادة التركيب عند تغيّر الرابط لبدء تدفق جديد
      key={params.toString()}
      initialSubjectId={params.get("subject")}
      retakeAttemptId={params.get("retake")}
      fromHandoff={params.get("from") === "chat"}
    />
  );
}

export default function QuizzesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="الكويزات"
        icon={ListChecks}
        title="اختبر نفسك بكويز ذكي"
        description="اختر المادة ومستوى الصعوبة، وسيجهّز لك مسار التميز AI أسئلة جديدة على نمط امتحانات التوجيهي مع شرح لكل إجابة."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/quizzes/by-subject" className={glass}>
              <Layers size={16} aria-hidden="true" />
              تصفح حسب المادة
            </Link>
            <Link to="/exams/archive" className={glass}>
              <Archive size={16} aria-hidden="true" />
              الأرشيف
            </Link>
          </div>
        }
      />

      <div dir="rtl" style={{ fontFamily: FONT }} className="mt-8 space-y-6">
        <QuizStatsStrip />
        <QuizzesContent />
      </div>
    </AppShell>
  );
}