import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

function FeatureCard({
  title,
  description,
  iconSrc,
  iconBg,
  index = 0,
}) {
  const cardRef = useRef(null);

  useLayoutEffect(() => {
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 25,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        delay: 0.5 + index * 0.08,
        ease: "power2.out",
      }
    );
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="
        flex w-full min-h-full flex-col rounded-2xl
        border border-[#B3D4FF]
        bg-white p-6
        opacity-0
        shadow-[inset_0_2px_15px_-3px_rgba(148,201,255,0.3),0_4px_12px_rgba(15,42,74,0.03)]
        transition-all duration-300
        hover:-translate-y-1.5
        hover:border-[#74B0FF]
        hover:shadow-[inset_0_2px_15px_-3px_rgba(148,201,255,0.4),0_20px_35px_-10px_rgba(15,42,74,0.12)]
        will-change-transform
      "
    >
      <div className="flex h-full flex-1 items-start gap-4">
        <span
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-transform duration-500 hover:rotate-12 ${iconBg}`}
        >
          <img
            src={iconSrc}
            alt=""
            className="h-7 w-7 transform object-contain transition-transform duration-300 hover:scale-110"
          />
        </span>

        <div className="flex-1 text-right">
        <h3 className="text-xl font-bold text-[#002C5A] transition-colors duration-300 hover:text-[#002C5A]">
            {title}
          </h3>

         <p className="mt-1.5 text-base leading-6 text-[#002C5A]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeatureCard;