import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

function Hero({ hideCta = false }) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        .set(".hero-line", {
          clipPath: "inset(0 0 0 100%)",
        })
        .to(
          ".hero-line",
          {
            clipPath: "inset(0 0 0 0%)",
            duration: 0.9,
            stagger: 0.18,
          },
          "-=0.2"
        )
        .fromTo(
          ".hero-desc",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        );

      // زر "سجل الآن مجاناً" ممكن يكون مش موجود بالـ DOM أصلاً
      // (لما hideCta تكون true)، فمنتأكد قبل ما نحركه.
      if (!hideCta) {
        tl.fromTo(
          ".hero-cta",
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.6)",
          },
          "-=0.3"
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [hideCta]);

  return (
    <section
      id="hero"
      className="relative w-full h-[766px] px-8 py-20 text-white overflow-hidden flex flex-col justify-center"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      <div className="absolute top-0 left-0 w-full h-full bg-[#002C5A]/40 -z-10"></div>

      <div ref={containerRef}>
        <span className="hero-badge w-fit self-start border border-[#38B793] bg-transparent px-4 py-1 text-[14px] text-[#38B793] rounded-[32px] mb-6 inline-block">
          + بوابتك للتعلم التفاعلي
        </span>

        <h2 className="text-[36px] md:text-[60px] font-extrabold max-w-[618px] leading-[100%] tracking-[8%] font-Ubuntu">
          <span className="hero-line block overflow-hidden">
            تجربة تعلم شاملة عن بعد
          </span>

          <span className="hero-line block overflow-hidden">
            لتحقيق طموحك الأكاديمي
          </span>
        </h2>

        <p className="hero-desc mt-6 text-white/90 text-[18px] md:text-[20px] max-w-[672px] leading-relaxed">
          تُقَدّم منصة "مَسار التَّمَيُّز" بِيئَة تَعْلِيمِيَّة افْتِرَاضِيَّة
          مُتَكَامِلَة، تَجْمَع بَيْنَ المَنَاهِج القَوِيَّة وَالتِّقْنِيَّات
          الحَدِيثَة لِإِعْدَاد الطُّلَّاب لِلْقُبُول الجَامِعِي عَن بُعْد،
          مَع دُرُوس حَيَّة، مُحْتَوَى رَقَمِي مُتَقَدِّم، وَمُتَابَعَة
          فَرْدِيَّة.
        </p>

        {!hideCta && (
          <a
            href="/register"
            className="hero-cta mt-8 inline-block w-fit bg-[#002C5A] hover:bg-[#2fa07f] text-white px-12 py-3 text-[20px] rounded-full font-bold transition opacity-0"
          >
            سجل الآن مجاناً
          </a>
        )}
      </div>
    </section>
  );
}

export default Hero;