import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../../../../context/AuthContext";
import { useSubjects } from "./useSubjects";
import SubjectCard from "./SubjectCard";

export default function SubjectsSection() {
  const { selectedBranch } = useAuth();
  const swiperRef = useRef(null);

  const { subjects, isLoading, error } = useSubjects(selectedBranch?.id);

  if (!isLoading && !subjects.length) return null;

  const displaySubjects =
    subjects.length > 0
      ? Array.from(
          { length: Math.max(3, Math.ceil(12 / subjects.length)) },
          () => subjects,
        ).flat()
      : [];

  return (
    <section dir="rtl" className="w-full overflow-hidden py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-[#002C5A] sm:text-3xl">
            المواد الدراسية{" "}
            {selectedBranch?.name?.replace("الفرع ", "").replace(/ي$/, "ية") || ""}
          </h2>
          <p className="mt-4 line-clamp-4 leading-none text-2xl text-[#002C5A] transition-all duration-500 group-hover:text-slate-600 pb-5">
            مناهج تعليمية متكاملة مصممة خصيصاً لمساعدتك على التفوق
          </p>

          {error && <p className="mt-2 text-sm text-amber-600">{error}</p>}
        </div>

        <div className="relative">
          <Swiper
            key={selectedBranch?.id || "default"}
            modules={[Autoplay, FreeMode]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            dir="rtl"
            slidesPerView="auto"
            spaceBetween={8}
            loop={true}
            freeMode={{
              enabled: true,
              momentum: false,
            }}
            speed={2500}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            allowTouchMove={true}
            className="subjects-slider !py-4"
          >
            {displaySubjects.map((subject, index) => (
              <SwiperSlide
                key={`${subject.id}-${index}`}
                className="!h-auto !w-[170px] sm:!w-[190px]"
              >
                <SubjectCard subject={subject} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            aria-label="السابق"
            onClick={() => swiperRef.current?.slidePrev(500)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#002C5A] shadow-sm transition-all duration-300 hover:border-[#12897A] hover:bg-[#12897A] hover:text-white hover:shadow-md active:scale-95"
          >
            <ChevronRight size={20} />
          </button>

          <button
            type="button"
            aria-label="التالي"
            onClick={() => swiperRef.current?.slideNext(500)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#002C5A] shadow-sm transition-all duration-300 hover:border-[#12897A] hover:bg-[#12897A] hover:text-white hover:shadow-md active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .subjects-slider .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </section>
  );
}