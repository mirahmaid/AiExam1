import { useEffect, useRef } from "react";

/**
 * بديل خفيف لـ framer-motion whileInView.
 * بيراقب العنصر وبيحط data-revealed لما يظهر، والباقي CSS.
 * تحت prefers-reduced-motion منعلّمه ظاهر فوراً بدون أي مراقبة.
 */
export function useRevealOnScroll(options = {}) {
  const { threshold = 0.15, once = true } = options;
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.revealed = "true";
          if (once) observer.disconnect();
        } else if (!once) {
          element.dataset.revealed = "false";
        }
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once]);

  return ref;
}

/**
 * نفس الفكرة بس لعدة عناصر جوا حاوية: بيراقب كل [data-reveal] منهم
 * لحاله، فكل واحد بيظهر لما يوصل هو للشاشة بدل ما يظهروا سوا.
 */
export function useRevealChildren(options = {}) {
  const { threshold = 0.15, once = false } = options;
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = Array.from(container.querySelectorAll("[data-reveal]"));
    if (targets.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => (el.dataset.revealed = "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.dataset.revealed = "true";
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.dataset.revealed = "false";
          }
        }
      },
      { threshold },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold, once]);

  return containerRef;
}