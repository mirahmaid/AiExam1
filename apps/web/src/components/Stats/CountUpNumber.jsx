import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * رقم يعدّ من 0 إلى end.
 * - start: متى تبدأ العدّة (الأب هو اللي يقرر، مثلاً لما المحطة تنضاء)
 * - duration: مدة العدّة بالميلي ثانية
 */
export default function CountUpNumber({
  end,
  start = true,
  duration = 2000,
  suffix = "",
}) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    // المستخدم مفعّل "تقليل الحركة": نعرض الرقم النهائي مباشرة
    if (reduce) {
      setCount(end);
      return;
    }

    let frame;
    let startTime = null;

    const tick = (timestamp) => {
      if (startTime === null) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setCount(Math.round(eased * end));

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    // تنظيف: نوقف الأنيميشن إذا انشال الكومبوننت أو تغيرت القيم
    return () => cancelAnimationFrame(frame);
  }, [start, end, duration, reduce]);

  return (
    <>
      {/* قارئ الشاشة يقرأ الرقم النهائي بس، مش كل الأرقام أثناء العدّ */}
      <span className="sr-only">
        {end}
        {suffix}
      </span>

      <span aria-hidden="true" className="tabular-nums">
        {count}
        {suffix}
      </span>
    </>
  );
}