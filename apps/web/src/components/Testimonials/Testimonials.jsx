import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import { testimonials } from "../../data";
import TestimonialCard from "./TestimonialCard";

function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="success-stories"
      dir="rtl"
      className="w-full max-w-[1200px] mx-auto px-4 pt-12 pb-10 bg-white overflow-hidden relative"
    >
      <h2 className="text-center text-[#002C5A] font-extrabold text-2xl md:text-[32px] leading-snug mb-10">
        قصص نجاح طلابنا في منصة مسار التميز
      </h2>

      <div className="w-full pb-10">
        <Swiper
          modules={[Autoplay, Pagination]}
          dir="rtl"
          loop={true}
          speed={400}
          autoplay={{
            delay: 1800,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            el: ".custom-pagination",
          }}
          slidesPerView={1}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full !overflow-visible"
        >
          {testimonials.map((item, i) => (
            <SwiperSlide key={item.id} className="h-auto flex">
              <TestimonialCard item={item} isActive={activeIndex === i} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="custom-pagination flex justify-center items-center gap-2.5 mt-8" />
      </div>

      <style>{`
        .custom-pagination .swiper-pagination-bullet {
          width: 9px;
          height: 9px;
          background-color: #d7dde7;
          opacity: 1;
          border-radius: 9999px;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .custom-pagination .swiper-pagination-bullet-active {
          background-color: #002C5A;
          transform: scale(1.25);
        }
      `}</style>
    </section>
  );
}

export default Testimonials;
