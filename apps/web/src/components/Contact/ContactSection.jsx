import { useContactSectionReveal } from "./hooks/useContactSectionReveal";
import ContactForm from "./ContactForm";

function ContactSection() {
  const { sectionRef } = useContactSectionReveal();

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="w-full bg-white px-4 py-16 sm:py-20"
    >
      <span className="contact-eyebrow mb-6 block text-center text-lg font-medium text-[#002C5A] sm:text-xl">
        تواصل معنا
      </span>

      <div className="relative mx-auto mt-6 max-w-6xl rounded-[32px] border-[3px] border-sky-200 bg-white px-6 pb-10 pt-8 sm:px-14 sm:pb-14 sm:pt-10">
        <h2 className="contact-title absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-white px-4 text-base font-bold text-[#002C5A] sm:text-2xl">
          فريقنا جاهز للرد على اسئلتكم
        </h2>

        <p className="contact-cta mb-8 text-center text-xl font-bold text-[#6EC3F5] sm:mb-10 sm:text-xl">
          تواصلوا معنا الآن
        </p>

        <div className="mx-auto max-w-lg">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
