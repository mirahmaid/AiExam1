import { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import FeatureSlider from "./FeatureSlider";

const HERO_IMAGE_SRC = "/AI/image33.png";
const BG_IMAGE_SRC = "/AI/bg.png";

function HeroSection() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const robotRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      tl.fromTo(
        ".hero-bg",
        {
          scale: 1.1,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 1.6,
          ease: "power2.out",
        }
      );

      tl.fromTo(
        [".hero-title", ".hero-subtitle", ".hero-desc"],
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
        },
        "-=1.2"
      );

      tl.fromTo(
        ".hero-btn",
        {
          opacity: 0,
          scale: 0.85,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        "-=0.6"
      );

      tl.fromTo(
        robotRef.current,
        {
          opacity: 0,
          scale: 0.9,
          y: 40,
          rotationY: -15,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationY: 0,
          duration: 1.2,
          ease: "power3.out",
        },
        "-=1.0"
      );

      gsap.to(robotRef.current, {
        y: -12,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.2,
      });

      tl.fromTo(
        ".feature-box",
        {
          opacity: 0,
          y: 60,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.5"
      );

      tl.fromTo(
        [".feature-badge", ".feature-title-main"],
        {
          opacity: 0,
          scale: 0.9,
          y: 10,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
        },
        "-=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      dir="rtl"
      className="relative overflow-hidden px-6 pb-10 pt-16 perspective-[1000px] lg:px-16 lg:pt-20"
    >
      <div className="hero-bg absolute inset-0 z-0 h-full w-full">
        <img
          src={BG_IMAGE_SRC}
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-10">

          <div className="order-2 text-right lg:order-1">
            <h1 className="hero-title text-[28px] font-extrabold leading-tight text-[#002C5A] opacity-0 sm:text-[34px] lg:text-[44px]">
              رفيقك الذكي للنجاح الدراسي
            </h1>

            <p className="hero-subtitle mt-3 text-lg font-bold text-[#002C5A] opacity-0 sm:text-xl lg:text-2xl">
              استوعب .. تدرّب .. تفوّق
            </p>

            <p className="hero-desc mt-4 max-w-md text-[15px] leading-7 text-[#002C5A] opacity-0 lg:text-[16px]">
              يتكفل "مَسار التَّمَيُّز AI" بإجابة كافة أسئلتك وحل التدريبات، مع
              تقديم شروحات وافية واختبارات مصممة خصيصاً لمستواك، ليوصلك إلى
              أهدافك الدراسية بأقل جهد.
            </p>

            <button
              type="button"
              onClick={() => navigate("/ai-path")}
              className="hero-btn mt-7 cursor-pointer transform rounded-full bg-[#0F2A4A] px-14 py-2.5 text-[15px] font-bold text-white opacity-0 shadow-lg shadow-[#0F2A4A]/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0B2038] hover:shadow-[#0F2A4A]/40"
            >
              ابدأ الآن
            </button>
          </div>

          <div className="order-1 lg:order-2">
            <div
              ref={robotRef}
              className="relative mx-auto aspect-square w-full max-w-[500px] opacity-0 will-change-transform"
            >
              <img
                src={HERO_IMAGE_SRC}
                alt="طالب يستخدم مساعد الذكاء الاصطناعي للدراسة"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="feature-box relative z-10 mt-16 rounded-[28px] border border-slate-100 bg-white p-6 opacity-0 shadow-[0_25px_70px_-25px_rgba(15,42,74,0.40)] sm:p-10 lg:mt-24">

        <div className="flex justify-center">
  <span
    dir="ltr"
    className="feature-badge inline-flex items-center gap-1.5 rounded-full border border-[#CFE0F7] bg-[#EFF6FF] px-4 py-1.5 text-xs font-bold text-[#94C9FF] opacity-0 shadow-sm"
  >
    <img
      src="/AI/star.png"
      alt=""
      className="h-4 w-4 shrink-0 object-contain"
    />

    <span dir="rtl">
      مسار التميز AI
    </span>
  </span>
</div>

          <h2 className="feature-title-main mt-5 text-center text-xl font-extrabold text-[#0F2A4A] opacity-0 sm:text-2xl">
            ماذا تحب أن نتعلم الآن؟
          </h2>

          <div className="mt-8">
            <FeatureSlider />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;