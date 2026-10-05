import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useContactSectionReveal() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    // إذا المستخدم مفعّل "تقليل الحركة" ما نحرّك شي
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // حركة واحدة متسلسلة: العنوان ← البطاقة ← الحقول
      gsap
        .timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        })
        .from(".contact-intro", { autoAlpha: 0, y: 16, duration: 0.6 })
        .from(".contact-shell", { autoAlpha: 0, y: 24, duration: 0.7 }, "-=0.3")
        .from(
          ".contact-field",
          { autoAlpha: 0, y: 10, duration: 0.4, stagger: 0.07 },
          "-=0.4"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return { sectionRef };
}