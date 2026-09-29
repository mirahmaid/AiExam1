import { Link, useSearchParams } from "react-router-dom";
import { Layers, ListChecks } from "lucide-react";
import AppShell from "../../layout/AppShell";
import PageHeader from "../../ui/PageHeader";
import QuizFlow from "../../quiz/QuizFlow";
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
          <Link
            to="/quizzes/by-subject"
            className="flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/25"
          >
            <Layers size={16} />
            تصفح حسب المادة
          </Link>
        }
      />
      <div className="mt-8">
        <QuizzesContent />
      </div>
    </AppShell>
  );
}