import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { useDailyPlan } from "./useDailyPlan";
import WeekStrip from "./WeekStrip";
import TaskList from "./TaskList";
import ProgressCard from "./ProgressCard";
import FocusTimer from "./FocusTimer";
import Confetti from "./Confetti";

const FONT = "'Cairo','Tajawal',system-ui,sans-serif";

export default function DailyPlanPage() {
  return (
    <AppShell>
      <DailyPlan />
    </AppShell>
  );
}

function DailyPlan() {
  const plan = useDailyPlan();
  const reduce = useReducedMotion();
  const [celebrate, setCelebrate] = useState(false);
  const prev = useRef(null);

  // احتفال لما تنتقل النسبة إلى 100% (مش عند فتح الصفحة وهي مكتملة أصلاً)
  useEffect(() => {
    if (plan.isLoading) return;
    if (prev.current !== null && prev.current < 100 && plan.percent === 100 && plan.total > 0) setCelebrate(true);
    prev.current = plan.percent;
  }, [plan.isLoading, plan.percent, plan.total]);

  useEffect(() => {
    if (!celebrate) return;
    const id = setTimeout(() => setCelebrate(false), 4200);
    return () => clearTimeout(id);
  }, [celebrate]);

  return (
    <div dir="rtl" style={{ fontFamily: FONT }}>
      {celebrate && !reduce && <Confetti />}

      <PageHeader
        eyebrow={plan.dateLabel}
        icon={CalendarCheck}
        title="خطة اليوم"
        description="خطة دراسية ذكية تتجدد يومياً وتركّز على المواد التي تحتاجها أكثر، مع مؤقت تركيز ومهام خاصة بك."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <WeekStrip week={plan.week} streak={plan.streak} />
          <TaskList
            tasks={plan.tasks}
            custom={plan.custom}
            isDone={plan.isDone}
            isLoading={plan.isLoading}
            completed={plan.completed}
            total={plan.total}
            percent={plan.percent}
            onToggle={plan.toggle}
            onToggleCustom={plan.toggleCustom}
            onRemoveCustom={plan.removeCustom}
            onAdd={plan.addCustom}
          />
        </div>

        <aside className="flex flex-col gap-6">
          <ProgressCard
            percent={plan.percent}
            completed={plan.completed}
            total={plan.total}
            minutesLeft={plan.minutesLeft}
            streak={plan.streak}
          />
          <FocusTimer />
        </aside>
      </div>
    </div>
  );
}