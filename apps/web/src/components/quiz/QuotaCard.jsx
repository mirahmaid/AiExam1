import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { getQuota } from "../../../lib/api";

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

  const percent = quota ? Math.min(100, (Number(quota.remaining) / Math.max(1, Number(quota.quotaLimit))) * 100) : 0;
  const low = percent <= 30;

  return (
    <div className="relative overflow-hidden rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl" />

      <div className="relative flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
          <Zap size={20} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-[15px] font-black text-[#0F2A4A]">رصيد التوليد اليومي</p>
          <p className="text-[12px] font-bold text-slate-400">يتجدد يومياً منتصف الليل</p>
        </div>
      </div>

      {failed ? (
        <p className="relative mt-4 rounded-2xl bg-[#F7FAFC] p-3 text-center text-[12px] font-bold text-slate-400">تعذر تحميل الرصيد حالياً</p>
      ) : !quota ? (
        <div className="relative mt-4 h-2.5 animate-pulse rounded-full bg-slate-100" />
      ) : (
        <div className="relative">
          <div className="mt-4 flex items-baseline justify-between">
            <span className={`text-[32px] font-black leading-none ${low ? "text-rose-500" : "text-[#0F2A4A]"}`}>{quota.remaining}</span>
            <span className="text-[12px] font-bold text-slate-400">من {quota.quotaLimit} طلب متبقٍ</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${low ? "bg-rose-500" : "bg-gradient-to-l from-amber-400 to-amber-500"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          {low && <p className="mt-2 text-[12px] font-black text-rose-500">رصيدك قارب على النفاد اليوم</p>}
        </div>
      )}
    </div>
  );
}