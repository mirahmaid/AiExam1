import FooterLinksColumn from "./FooterLinksColumn";
import FooterBottom from "./FooterBottom";

function Footer() {
  return (
    <footer className="w-full pt-[120px]" dir="rtl">
      <div className="rounded-t-[32px] bg-white px-6 py-[90px] shadow-[0_0_30px_rgba(0,0,0,0.12)] sm:px-10 lg:px-0">

        <div className="mx-auto max-w-[1160px]">

          {/* Main Footer */}
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">

            {/* Logo */}
            <div className="shrink-0">
              <img
                src="/logo.png"
                alt="مسار التميز"
                className="w-[105px] object-contain lg:w-[115px]"
              />
            </div>

            {/* Menu */}
            <div>
              <FooterLinksColumn
                title="القائمة"
                links={[
                  { href: "#hero", label: "الرئيسية" },
                  { href: "#features", label: "من نحن" },
                  { href: "#contact", label: "الخدمات" },
                  { href: "#success-stories", label: "قصص نجاح" },
                ]}
              />
            </div>

            {/* Company */}
            <div>
              <FooterLinksColumn
                title="الشركة"
                links={[
                  { href: "/terms", label: "الشروط والأحكام" },
                  { href: "/privacy", label: "سياسة الخصوصية" },
                ]}
              />
            </div>

            {/* Support */}
            <div>
              <FooterLinksColumn
                title="الدعم"
                links={[
                  { href: "/contact", label: "اتصل بنا" },
                  { href: "/faq", label: "الأسئلة الشائعة" },
                ]}
              />
            </div>

            {/* Contact */}
            <div className="flex w-full flex-col gap-[18px] lg:w-[300px]">

              <h3 className="relative -top-[25px] font-ubuntu text-[18px] font-bold leading-[100%] text-[#002C5A]">
                اتصل بنا
              </h3>

              <div className="flex flex-col items-start gap-[10px] text-[16px] text-[#002C5A]">

                <a
                  href="tel:0912345678"
                  className="transition-opacity hover:opacity-70"
                >
                  0912345678
                </a>

                <a
                  href="mailto:support@pathtoexcellence.edu.com"
                  className="transition-opacity hover:opacity-70"
                  dir="ltr"
                >
                  support@pathtoexcellence.edu.com
                </a>

              </div>

              <input
                type="email"
                placeholder="بريدك الالكتروني"
                aria-label="بريدك الالكتروني"
                className="mt-[6px] h-[44px] w-full rounded-full border border-[#002C5A] bg-white px-6 text-right text-[16px] text-[#002C5A] outline-none placeholder:text-[#002C5A] focus:ring-1 focus:ring-[#002C5A]"
              />

            </div>

          </div>

          {/* Divider */}
          <div className="my-[48px] h-px w-full bg-[#D9D9D9]" />

          <FooterBottom />

        </div>
      </div>
    </footer>
  );
}

export default Footer;