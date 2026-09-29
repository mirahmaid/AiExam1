import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { getQuota } from "../../../lib/quiz";

// بطاقة الحصة اليومية لتوليد الأسئلة بالذكاء الاصطناعي
export default function QuotaCard({ refreshKey = 0 }) {
  const [quota, setQuota] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getQuota()
      .then((q) => {
        if (cancelled) return;
        setQuota(q);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const percent = quota ? (Number(quota.remaining) / Math.max(1, Number(quota.quotaLimit))) * 100 : 0;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <Zap size={19} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-[#002C5A]">رصيد التوليد اليومي</p>
          <p className="text-xs text-slate-400">يتجدد يومياً منتصف الليل</p>
        </div>
      </div>

      {failed ? (
        <p className="mt-4 text-xs text-slate-400">تعذر تحميل الرصيد حالياً</p>
      ) : !quota ? (
        <div className="mt-4 h-2 animate-pulse rounded-full bg-slate-100" />
      ) : (
        <>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#002C5A]">{quota.remaining}</span>
            <span className="text-xs text-slate-400">من {quota.quotaLimit} طلب متبقٍ</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${percent > 30 ? "bg-gradient-to-l from-amber-400 to-amber-500" : "bg-rose-500"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}