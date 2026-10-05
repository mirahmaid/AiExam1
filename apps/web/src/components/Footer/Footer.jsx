import { useState } from "react";
import { CheckCircle2, Mail, Phone } from "lucide-react";
import FooterLinksColumn from "./FooterLinksColumn";
import FooterBottom from "./FooterBottom";

const EXPLORE_LINKS = [
  { href: "#hero", label: "الرئيسية" },
  { href: "#features", label: "عن المنصة" },
  { href: "#success-stories", label: "قصص النجاح" },
  { href: "#asked-questions", label: "الأسئلة الشائعة" },
];

const HELP_LINKS = [
  { href: "#contact", label: "اتصل بنا" },
  { href: "/terms", label: "الشروط والأحكام" },
  { href: "/privacy", label: "سياسة الخصوصية" },
];

// محطات المسار (نفس ألوان الـ Hero)
const STEPS = [
  { label: "افهم", color: "#2DD4BF" },
  { label: "تدرّب", color: "#60A5FA" },
  { label: "اختبر", color: "#A78BFA" },
  { label: "تفوّق", color: "#FBBF24" },
];

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();

    // TODO: اربطها بالباك اند
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer
      dir="rtl"
      className="relative w-full overflow-hidden border-t border-[#DCE7F0] bg-white"
    >
      {/* نفس تدرّج مسار الـ Hero بعرض الصفحة كاملة */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#2DD4BF] via-[#A78BFA] to-[#FBBF24]" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-[#2DD4BF]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#A78BFA]/10 blur-3xl"
      />

      {/* المحتوى الرئيسي */}
      <div className="relative mx-auto max-w-[1180px] px-5 pb-10 pt-12 md:px-8 md:pb-12 md:pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] lg:gap-14">
          {/* ================= الشعار ================= */}
          <div className="flex flex-col items-start">
            <img
              src="/logo.png"
              alt="مسار التميز"
              className="mb-5 w-[105px] object-contain"
            />

            <p className="max-w-[270px] text-[15px] font-medium leading-7 text-[#475569]">
              تعلّم، تدرّب، اختبر، وتقدّم نحو هدفك بخطوات أوضح مع مسار التميز.
            </p>

            {/* محطات المسار */}
            <ul className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              {STEPS.map(({ label, color }) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}80`,
                    }}
                  />
                  <span className="text-sm font-black text-[#0F2A4A]">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <FooterLinksColumn title="استكشف" links={EXPLORE_LINKS} />
          <FooterLinksColumn title="مساعدة" links={HELP_LINKS} />

          {/* ================= التواصل ================= */}
          <div>
            <h3 className="mb-3 text-base font-black text-[#0F2A4A]">
              خليك على تواصل
            </h3>

            <p className="mb-4 max-w-[290px] text-[15px] font-medium leading-7 text-[#475569]">
              اشترك ليصلك كل جديد من مسار التميز.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex w-full items-center rounded-2xl border border-[#DCE7F0] bg-[#F7FAFC] p-1.5 transition-all duration-300 focus-within:border-[#0F8B78]/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#2DD4BF]/15"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubscribed(false);
                }}
                placeholder="بريدك الإلكتروني"
                aria-label="بريدك الإلكتروني"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-[#0F2A4A] outline-none placeholder:text-[#94A3B8]"
              />

              <button
                type="submit"
                className="shrink-0 rounded-xl bg-[#0F2A4A] px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-[#0F8B78]"
              >
                اشترك
              </button>
            </form>

            <div aria-live="polite" className="min-h-[24px]">
              {subscribed && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-extrabold text-[#0F8B78]">
                  <CheckCircle2 size={14} />
                  تم الاشتراك، شكرًا لك.
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-2.5 text-sm font-semibold text-[#475569]">
              <a
                href="tel:0912345678"
                dir="ltr"
                className="flex w-fit items-center gap-2 transition-colors hover:text-[#0F8B78]"
              >
                <Phone
                  size={15}
                  className="text-[#0F8B78]"
                  aria-hidden="true"
                />
                0912345678
              </a>

              <a
                href="mailto:support@pathtoexcellence.edu.com"
                dir="ltr"
                className="flex w-fit items-center gap-2 transition-colors hover:text-[#0F8B78]"
              >
                <Mail size={15} className="text-[#0F8B78]" aria-hidden="true" />
                support@pathtoexcellence.edu.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* الشريط السفلي */}
      <div className="relative border-t border-[#E7EEF4] bg-[#F7FAFC]">
        <div className="mx-auto max-w-[1180px] px-5 py-5 md:px-8">
          <FooterBottom />
        </div>
      </div>
    </footer>
  );
}

export default Footer;