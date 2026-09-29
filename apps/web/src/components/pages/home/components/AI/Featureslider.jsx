import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import FeatureCard from "./FeatureCard";
const features = [
  {
    id: "summarize",
    title: "لخّص الدرس",
    description: "احصل على ملخصات مركزة وخرائط ذهنية سهلة الفهم",
    iconSrc: "/AI/book (2).png",
    iconBg: "bg-[#EFFF9426]",
  },
  {
    id: "weak-points",
    title: "راجع نقاط ضعفي",
    description: "اعرف المجالات التي تحتاج إلى تطوير مع توصيات ذكية",
    iconSrc: "/AI/dart.png",
    iconBg: "bg-[#FBE3EA]",
  },
  {
    id: "study-plan",
    title: "أنشئ خطة دراستي",
    description: "احصل على خطة دراسة شخصية تتناسب مع وقتك ومستواك",
    iconSrc: "/AI/pencil.png",
    iconBg: "bg-[#00D4FF26]",
  },
  {
    id: "question",
    title: "اسأل مسار التميز !",
    description: "اطرح أي سؤال حول أي مادة وسنجيبك بشكل فوري وواضح",
    iconSrc: "/AI/question.png",
    iconBg: "bg-[#CC00FF26]",
  },
  {
    id: "search",
    title: "حل سؤال معي",
    description: "أرسل سؤالك أو صورة له وسنحله خطوة بخطوة",
    iconSrc: "/AI/search.png",
    iconBg: "bg-[#0CBC7B26]",
  },
  {
    id: "testing",
    title: "اختبرني",
    description: "أنشئ اختبارًا مخصصًا لمادتك ومستواك وامتحن معلوماتك",
    iconSrc: "/AI/testing.png",
    iconBg: "bg-[#0CBC7B26]",
  },
];

function FeatureSlider() {
  return (
    <div className="w-full select-none" dir="rtl bg-[#94C9FF80]">
      <Swiper
        key="feature-slider-rtl"
        dir="rtl"
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        grabCursor={true}
        autoHeight={false}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
        className="w-full !pb-14 [&>.swiper-wrapper]:items-stretch"
      >
        {features.map((feature, index) => (
          <SwiperSlide
            key={feature.id}
            className="!flex !h-auto items-stretch"
          >
            <FeatureCard {...feature} index={index} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default FeatureSlider;