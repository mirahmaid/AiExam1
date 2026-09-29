import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { downloadSubjectBook } from "./Api/books";

function BookCard({ book }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    if (!book.hasBook || downloading) return;

    setDownloading(true);
    setError("");

    try {
      await downloadSubjectBook(book.id, book.title);
    } catch (err) {
      console.error(err);
      setError("تعذر التحميل");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="h-full px-1">
      <div
        className="relative flex h-full w-full items-center overflow-hidden bg-[#00D4FF08] shadow-[0_0_30px_rgba(0,0,0,0.10)] ring-1 ring-black/[0.03]"
        style={{
          aspectRatio: "844 / 156",
          minHeight: "100px",
          borderTopLeftRadius: 0,
          borderTopRightRadius: "320px",
          borderBottomRightRadius: "320px",
          borderBottomLeftRadius: "640px",
        }}
      >
        <button
          type="button"
          onClick={handleDownload}
          disabled={!book.hasBook || downloading}
          className={`absolute left-6 top-5 z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
            book.hasBook
              ? "cursor-pointer bg-[#0F2A4A] text-white hover:bg-[#123761]"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          {book.hasBook ? (
            <>
              <Download size={12} />
              تحميل PDF
            </>
          ) : (
            "غير متوفر"
          )}
        </button>

        <div
          dir="rtl"
          className="flex h-full w-full items-center gap-5 px-7 py-6"
        >
          <button
            onClick={handleDownload}
            disabled={!book.hasBook || downloading}
            aria-label={
              book.hasBook ? "تحميل الكتاب" : "الكتاب غير متوفر بعد"
            }
            className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl transition-transform ${
              book.hasBook
                ? "cursor-pointer bg-[#D6F0F6] hover:scale-105"
                : "cursor-not-allowed bg-slate-300"
            }`}
          >
            {downloading ? (
              <Loader2 size={24} className="animate-spin text-white" />
            ) : book.iconSrc ? (
              <img
                src={book.iconSrc}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="h-full w-full bg-[#D6F0F6]" />
            )}
          </button>

          <div className="min-w-0 flex-1 pl-20 pt-1 text-right">
            <h3 className="text-base font-bold text-[#002C5A] sm:text-lg">
              كتاب {book.title}
            </h3>

            <p className="mt-1.5 line-clamp-6 text-[13px] leading-relaxed text-[#002C5A] font-bold">
              {book.description}
            </p>

            {error && (
              <p className="mt-1 text-[11px] text-red-500">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookCard;