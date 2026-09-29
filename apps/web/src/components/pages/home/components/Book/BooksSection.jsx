import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

import { useAuth } from "../../../../../context/AuthContext";
import { fetchSubjectsByBranch } from "./Api/books";
import {
  bookDescriptionByName,
  defaultBookDescription,
} from "./bookMeta";
import BookCard from "./BookCard";

function ensureEnoughSlides(items, minCount = 16) {
  if (items.length === 0) return [];

  if (items.length >= minCount) {
    return items.map((item) => ({
      ...item,
      displayKey: item.id,
    }));
  }

  const repeated = [];
  let i = 0;

  while (repeated.length < minCount) {
    const original = items[i % items.length];

    repeated.push({
      ...original,
      displayKey: `${original.id}-dup-${Math.floor(
        i / items.length
      )}`,
    });

    i++;
  }

  return repeated;
}

function BooksSection() {
  const { selectedBranch } = useAuth();

  const swiperRef = useRef(null);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedBranch) return;

    const branchId = selectedBranch.id;
    let cancelled = false;

    async function loadBooks() {
      setLoading(true);
      setError("");

      try {
        const apiSubjects = await fetchSubjectsByBranch(branchId);

        if (cancelled) return;

        const mapped = apiSubjects.map((subject) => ({
          id: subject.id,
          title: subject.name,
          description:
            bookDescriptionByName[subject.name] ??
            defaultBookDescription,
          hasBook: !!subject.bookPdfKey,
          originalFileName: subject.bookPdfOriginalName,
          iconSrc: "/book.png",
        }));

        setBooks(mapped);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("تعذر تحميل الكتب، حاول تحديث الصفحة");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, [selectedBranch]);

  if (!selectedBranch) return null;

  const displayBooks = ensureEnoughSlides(books);

  return (
    <section
      dir="rtl"
      className="w-full overflow-hidden bg-white py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-[#002C5A] sm:text-3xl">
            الكتب والمراجع الدراسية
          </h2>

          <p className="mt-4 line-clamp-4 leading-none text-2xl text-[#002C5A] transition-all duration-500 group-hover:text-slate-600 pb-5">
  كل ما تحتاجه من مصادر ومراجع دراسية موثوقة في مكان واحد بين يديك
</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2
              className="animate-spin text-[#002C5A]"
              size={32}
            />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-500">
            {error}
          </p>
        ) : books.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            لا توجد كتب متاحة حالياً لهذا الفرع
          </p>
        ) : (
          <>
            <div
              className="relative"
              style={{
                maskImage:
                  "linear-gradient(to left, transparent 0%, black 4%, black 96%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to left, transparent 0%, black 4%, black 96%, transparent 100%)",
              }}
            >
              <Swiper
                modules={[Autoplay, Pagination]}
                dir="rtl"
                spaceBetween={24}
                slidesPerView="auto"
                grabCursor={true}
                speed={500}
                loop={true}
                watchSlidesProgress={true}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                  stopOnLastSlide: false,
                }}
                pagination={{
                  clickable: true,
                  el: ".books-pagination",
                  bulletClass: "books-bullet",
                  bulletActiveClass: "books-bullet-active",
                }}
                className="!cursor-grab !py-4 active:!cursor-grabbing"
              >
                {displayBooks.map((book) => (
                  <SwiperSlide
                    key={book.displayKey}
                    className="!h-auto !w-[420px] sm:!w-[460px]"
                  >
                    <BookCard book={book} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="mt-10 grid grid-cols-[auto_1fr_auto] items-center gap-4">

              <button
                type="button"
                aria-label="السابق"
                onClick={() => swiperRef.current?.slidePrev()}
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#001B3A] to-[#0F2A4A] text-white shadow-md shadow-[#001B3A]/25 transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#0F2A4A]/35 active:scale-95"
              >
                <ChevronRight
                  size={20}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
              </button>

              <div className="books-pagination flex items-center justify-center gap-2" />

              <button
                type="button"
                aria-label="التالي"
                onClick={() => swiperRef.current?.slideNext()}
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#001B3A] to-[#0F2A4A] text-white shadow-md shadow-[#001B3A]/25 transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#0F2A4A]/35 active:scale-95"
              >
                <ChevronLeft
                  size={20}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>

            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default BooksSection;