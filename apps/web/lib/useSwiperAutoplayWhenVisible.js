import { useCallback, useEffect, useRef } from "react";

/**
 * بيشغّل autoplay تبع Swiper بس لما السلايدر يكون ظاهر على الشاشة،
 * وبيوقفه كلياً لو المستخدم طالب تقليل الحركة.
 */
export function useSwiperAutoplayWhenVisible() {
  const containerRef = useRef(null);
  const swiperRef = useRef(null);

  const setSwiper = useCallback((swiper) => {
    swiperRef.current = swiper;
    // ما منشغّله لحد ما الـ observer يقرر إنه ظاهر
    swiper.autoplay?.stop();
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      swiperRef.current?.autoplay?.stop();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const autoplay = swiperRef.current?.autoplay;
        if (!autoplay) return;
        if (entry.isIntersecting) autoplay.start();
        else autoplay.stop();
      },
      { threshold: 0 },
    );

    observer.observe(element);

    const onVisibilityChange = () => {
      const autoplay = swiperRef.current?.autoplay;
      if (!autoplay) return;
      if (document.hidden) autoplay.stop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return { containerRef, swiperRef, setSwiper };
}