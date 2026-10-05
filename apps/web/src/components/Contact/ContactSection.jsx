import { MessageCircle } from "lucide-react";
import { useContactSectionReveal } from "./hooks/useContactSectionReveal";
import ContactForm from "./ContactForm";

// محطات صغيرة على "المسار" في اللوحة الداكنة (نفس ألوان مسار الـ Hero)
const NOTES = [
  { label: "وقت الاستجابة", text: "نحاول الرد بأسرع وقت", color: "#2DD4BF" },
  { label: "اقتراحك", text: "ممكن يصير ميزة حقيقية", color: "#A78BFA" },
  { label: "رسالتك", text: "نقرأ كل رسالة بنفسنا", color: "#FBBF24" },
];

function ContactSection() {
  const { sectionRef } = useContactSectionReveal();

  return (
    <section
      id="contact"
      ref={sectionRef}
      dir="rtl"
      className="relative w-full overflow-hidden bg-[#F7FAFC] px-4 py-20 sm:px-6 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-32 h-[420px] w-[420px] rounded-full bg-[#2DD4BF]/10 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-[460px] w-[460px] rounded-full bg-[#A78BFA]/10 blur-[110px]"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* العنوان */}
        <div className="contact-intro mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-black leading-[1.4] text-[#0F2A4A] sm:text-4xl lg:text-[44px]">
            عندك سؤال؟
            <span className="block text-[#0F8B78]">خلينا نسمع منك</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#64748B] sm:text-base">
            سواء عندك استفسار عن المنصة، أو اقتراح لتحسين تجربتك، أو تحتاج
            مساعدة، فريقنا جاهز يسمعك ويرد عليك.
          </p>
        </div>

        {/* البطاقة الرئيسية */}
        <div className="contact-shell relative overflow-hidden rounded-[32px] border border-[#DCE7F0] bg-white shadow-[0_35px_100px_-45px_rgba(15,42,74,0.28)]">
          {/* نفس تدرّج مسار الـ Hero */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#2DD4BF] via-[#A78BFA] to-[#FBBF24]" />

          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            {/* اللوحة الداكنة */}
            <div className="relative hidden overflow-hidden bg-[#0B1F3A] p-10 lg:block xl:p-12">
              {/* شبكة النقاط (نفس خلفية خريطة الـ Hero) */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#2DD4BF]/15 blur-3xl"
              />

              <div className="relative">
                <span className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2DD4BF]/15 text-[#5EEAD4] ring-1 ring-[#2DD4BF]/20">
                  <MessageCircle size={25} />
                </span>

                <h3 className="text-3xl font-black leading-[1.4] text-white">
                  كل سؤال مهم،
                  <span className="block text-[#5EEAD4]">وكل رسالة بتفرق.</span>
                </h3>

                <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
                  تواصل معنا بكل أريحية. هدفنا نخلي رحلتك التعليمية أسهل وأوضح.
                </p>

                {/* مسار منقّط بمحطات */}
                <ul className="relative mt-12 space-y-7 pr-8 before:absolute before:bottom-2 before:right-[7px] before:top-2 before:border-r before:border-dashed before:border-white/25">
                  {NOTES.map(({ label, text, color }) => (
                    <li key={label} className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute -right-8 top-1 h-4 w-4 rounded-full ring-4 ring-[#0B1F3A]"
                        style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}80` }}
                      />
                      <p className="text-xs font-bold text-white/45">{label}</p>
                      <p className="mt-1 text-sm font-extrabold text-white">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* الفورم */}
            <div className="p-6 sm:p-10 lg:p-12">
              <h3 className="text-2xl font-black text-[#0F2A4A] sm:text-3xl">
                احكيلنا شو في بالك
              </h3>
              <p className="mb-8 mt-2 text-sm leading-6 text-[#94A3B8]">
                اكتب لنا رسالتك وسنتواصل معك بأقرب وقت.
              </p>

              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;