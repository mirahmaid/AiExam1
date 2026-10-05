import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Check, Download, Loader2, Lock } from "lucide-react";

import { downloadSubjectBook } from "./Api/books";

/* =====================================================
   غلاف الكتاب: كحلي + كعب تيل، وصفحات ظاهرة من الجنب
===================================================== */

function Cover({ title, locked, reduce }) {
  return (
    <div className="shrink-0" style={{ perspective: 700 }}>
      <motion.div
        whileHover={reduce ? undefined : { rotateY: -16 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="relative h-[160px] w-[114px] overflow-hidden rounded-l-[10px] rounded-r-[4px] bg-gradient-to-br from-[#0F2A4A] to-[#1B4570]"
        style={{
          boxShadow:
            "-3px 0 0 #fff, -4px 0 0 #CBD5E1, -7px 0 0 #fff, -8px 0 0 #CBD5E1, 14px 22px 28px -14px rgba(15,42,74,0.55)",
          filter: locked ? "saturate(0.4)" : undefined,
        }}
      >
        <span aria-hidden="true" className="absolute inset-y-0 right-0 w-3 bg-[#2DD4BF]" />
        <span aria-hidden="true" className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full border border-white/15" />

        <span className="relative flex h-full flex-col items-center justify-between py-4 pl-2 pr-5 text-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2DD4BF] text-[#0F2A4A]">
            {locked ? <Lock size={15} aria-hidden="true" /> : <BookOpen size={16} aria-hidden="true" />}
          </span>
          <span className="line-clamp-3 text-[16px] font-black leading-6 text-white">{title}</span>
          <span className="text-[11px] font-bold text-[#2DD4BF]">مسار التميز</span>
        </span>
      </motion.div>
    </div>
  );
}

/* =====================================================
   الكتاب المختار: الغلاف + المعلومات + التحميل
   نفس منطق التحميل القديم (downloadSubjectBook)
===================================================== */

export default function BookCard({ book }) {
  const reduce = useReducedMotion();
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 2600);
    return () => clearTimeout(t);
  }, [done]);

  async function handleDownload() {
    if (!book.hasBook || downloading) return;

    setDownloading(true);
    setError("");

    try {
      await downloadSubjectBook(book.id, book.title);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("تعذر تحميل الكتاب");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <Cover title={book.title} locked={!book.hasBook} reduce={reduce} />

      <div className="min-w-0 flex-1 text-center sm:text-right">
        {book.hasBook ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F8F2] px-3 py-1 text-[13px] font-black text-[#0F8B78]">
            <span className="h-2 w-2 rounded-full bg-[#0F8B78]" />
            جاهز للتحميل
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2F6] px-3 py-1 text-[13px] font-black text-[#475569]">
            <Lock size={13} aria-hidden="true" />
            غير متوفر حاليًا
          </span>
        )}

        <h3 className="mt-2 text-[24px] font-black leading-tight text-[#0F2A4A]">كتاب {book.title}</h3>
        <p className="mt-1.5 line-clamp-3 text-[14px] font-medium leading-7 text-[#475569]">{book.description}</p>

        <motion.button
          type="button"
          onClick={handleDownload}
          disabled={!book.hasBook || downloading}
          whileTap={reduce || !book.hasBook ? undefined : { scale: 0.95 }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0F2A4A] px-5 py-3 text-[15px] font-black text-white shadow-[0_14px_26px_-14px_rgba(15,42,74,0.8)] transition-colors hover:bg-[#0F8B78] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2DD4BF]/40 disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#64748B] disabled:shadow-none"
        >
          {downloading ? (
            <>
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
              جاري التحميل...
            </>
          ) : done ? (
            <>
              <Check size={17} strokeWidth={3} aria-hidden="true" />
              تم التحميل
            </>
          ) : (
            <>
              <Download size={17} aria-hidden="true" />
              {book.hasBook ? "تحميل الكتاب" : "غير متوفر"}
            </>
          )}
        </motion.button>

        {error && (
          <p role="alert" className="mt-2 text-[14px] font-bold text-[#BE3B55]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}