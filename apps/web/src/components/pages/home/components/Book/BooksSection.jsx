import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen } from "lucide-react";

import { useAuth } from "../../../../../context/AuthContext";
import { fetchSubjectsByBranch } from "./Api/books";
import { bookDescriptionByName, defaultBookDescription } from "./bookMeta";

import BookCard from "./BookCard";
import BookSpine, { BOOK_THEME } from "./BookSpine";

/* =====================================================
   الخطوة ١ (يمين): كتابك
   الكتاب المختار بغلافه ومعلوماته فوق، وتحته قائمة كل الكتب
===================================================== */

export default function BooksSection({ onBookChange }) {
  const { selectedBranch } = useAuth();
  const reduce = useReducedMotion();

  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- جلب الكتب (نفس المنطق القديم بدون تغيير) ---------- */
  useEffect(() => {
    if (!selectedBranch) return;

    let cancelled = false;

    async function loadBooks() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchSubjectsByBranch(selectedBranch.id);

        if (cancelled) return;

        setBooks(
          result.map((subject) => ({
            id: subject.id,
            title: subject.name,
            description: bookDescriptionByName[subject.name] ?? defaultBookDescription,
            hasBook: !!subject.bookPdfKey,
            originalFileName: subject.bookPdfOriginalName,
          }))
        );

        setSelected(0);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("تعذر تحميل الكتب");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, [selectedBranch]);

  const currentBook = books[selected];

  useEffect(() => {
    if (!onBookChange) return;

    onBookChange(currentBook ? { id: currentBook.id, title: currentBook.title, ...BOOK_THEME } : null);
  }, [currentBook, onBookChange]);

  if (!selectedBranch) return null;

  return (
    <div dir="rtl" className="relative flex h-full flex-col p-5 sm:p-6">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: `linear-gradient(90deg, ${BOOK_THEME.color}, ${BOOK_THEME.deep})` }}
      />

      {/* ============ العنوان ============ */}
      <div className="flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0F2A4A] text-[19px] font-black text-white">
          ١
        </span>
        <div>
          <h2 className="text-[22px] font-black text-[#0F2A4A] sm:text-[24px]">اختر كتابك</h2>
          <p className="text-[14px] font-bold text-[#475569]">الـ AI بيشتغل على الكتاب اللي بتختاره</p>
        </div>
      </div>

      {/* ============ الحالات ============ */}
      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
          <motion.span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F8F2] text-[#0F8B78]"
            animate={reduce ? undefined : { y: [0, -8, 0], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <BookOpen size={26} />
          </motion.span>
          <p className="text-[15px] font-bold text-[#475569]">نرتب مكتبتك...</p>
        </div>
      ) : error ? (
        <p role="alert" className="flex-1 py-16 text-center text-[15px] font-bold text-red-500">
          {error}
        </p>
      ) : books.length === 0 ? (
        <p className="flex-1 py-16 text-center text-[15px] font-bold text-[#475569]">لا توجد كتب متاحة حاليًا</p>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBook.id}
              className="mt-6"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
            >
              <BookCard book={currentBook} />
            </motion.div>
          </AnimatePresence>

          <div className="mt-auto pt-6">
            <p className="mb-2 text-[13px] font-black text-[#475569]">كل كتب فرعك ({books.length})</p>
            <div className="grid max-h-[190px] grid-cols-2 gap-2 overflow-y-auto" role="group" aria-label="كتب الفرع">
              {books.map((book, index) => (
                <BookSpine key={book.id} book={book} active={index === selected} onSelect={() => setSelected(index)} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}