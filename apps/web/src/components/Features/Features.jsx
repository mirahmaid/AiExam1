import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { features } from "../../data";
import FeatureCard from "./FeatureCard";

gsap.registerPlugin(ScrollTrigger);

const RIGHT_CARD_SHAPE = {
  borderColor: "#38B793",
  bgColor: "bg-white",
  borderWidth: 1,
  radius: { topLeft: 0, topRight: 180, bottomRight: 180, bottomLeft: 180 },
};

const LEFT_CARD_SHAPE = {
  borderColor: "#D24D65",
  bgColor: "bg-[#D24D651A]",
  borderWidth: 1,
  radius: { topLeft: 180, topRight: 0, bottomRight: 180, bottomLeft: 180 },
};

const RIGHT_CARD_SHAPE_BOTTOM_ROW = {
  borderColor: "#00D4FF",
  bgColor: "bg-[#00D4FF1A]",
  borderWidth: 1,
  radius: { topLeft: 180, topRight: 180, bottomRight: 180, bottomLeft: 0 },
};

const LEFT_CARD_SHAPE_BOTTOM_ROW = {
  borderColor: "#F2FF00",
  bgColor: "bg-[#F2FF001A]",
  borderWidth: 1,
  radius: { topLeft: 180, topRight: 180, bottomRight: 0, bottomLeft: 180 },
};

const shapesCycle = [
  RIGHT_CARD_SHAPE,
  LEFT_CARD_SHAPE,
  RIGHT_CARD_SHAPE_BOTTOM_ROW,
  LEFT_CARD_SHAPE_BOTTOM_ROW,
];

function swapPairs(arr) {
  const result = [...arr];
  for (let i = 0; i + 1 < result.length; i += 2) {
    [result[i], result[i + 1]] = [result[i + 1], result[i]];
  }
  return result;
}

function Features() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".feature-blob-1", {
        y: -25,
        x: 12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      gsap.to(".feature-blob-2", {
        y: 30,
        x: -15,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.8,
        },
      });

      gsap.fromTo(
        ".features-header",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        }
      );

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const fromRight = i % 2 === 0;

        gsap.fromTo(
          card,
          { opacity: 0, y: 40, x: fromRight ? 70 : -70, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      dir="rtl"
      className="relative py-24 lg:py-48 overflow-hidden"
      ref={sectionRef}
    >
      <div className="feature-blob-1 pointer-events-none absolute -top-20 -left-32 w-[420px] h-[420px] rounded-full bg-sky-100/30 blur-3xl" />
      <div className="feature-blob-2 pointer-events-none absolute bottom-0 -right-24 w-[380px] h-[380px] rounded-full bg-blue-100/30 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="features-header text-center max-w-3xl mx-auto mb-16">
          <h2 className="features-title text-3xl md:text-4xl font-black text-[#002C5A] tracking-tight mb-4">
            لماذا منصتنا هي بوابتك الحقيقية للنجاح والتفوق؟
          </h2>
          <p className="features-sub text-[#767676] text-base md:text-lg">
            هيا نكتشف لماذا منصة مسار التميز هي البوابة الحقيقية للنجاح والتفوق
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {swapPairs(features).map((feature, index) => {
            const shape = shapesCycle[index % shapesCycle.length];
            return (
              <FeatureCard
                key={feature.id}
                ref={(el) => (cardRefs.current[index] = el)}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                bgColor={shape.bgColor}
                borderColor={shape.borderColor}
                borderWidth={shape.borderWidth}
                radius={shape.radius}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
