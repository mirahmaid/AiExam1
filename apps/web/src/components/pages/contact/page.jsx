import { Link } from "react-router-dom";
import { Clock, HelpCircle, Mail, MessageCircle, Phone } from "lucide-react";
import PublicShell from "../../layout/PublicShell";
import PageHeader from "../../ui/PageHeader.jsx";
import ContactSection from "../../Contact/ContactSection";
const CHANNELS = [
  { icon: Phone, title: "اتصل بنا", value: "0912345678", href: "tel:0912345678", hint: "من الأحد إلى الخميس" },
  { icon: Mail, title: "راسلنا", value: "support@masar-altamayoz.edu", href: "mailto:support@masar-altamayoz.edu", hint: "نرد خلال 24 ساعة" },
  { icon: Clock, title: "ساعات الدعم", value: "9:00 ص – 5:00 م", hint: "بتوقيت فلسطين" },
];

export default function ContactPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="الدعم"
          icon={MessageCircle}
          title="نحن هنا لمساعدتك"
          description="لديك سؤال عن المنصة أو اقتراح لتحسينها؟ فريق مسار التميز جاهز للرد على استفساراتك."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, title, value, href, hint }) => {
            const body = (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12897A]/10 text-[#12897A] transition-transform group-hover:scale-110">
                  <Icon size={22} />
                </span>
                <div>
                  <p className="text-sm text-slate-400">{title}</p>
                  <p className="font-bold text-[#002C5A]" dir="ltr">
                    {value}
                  </p>
                  <p className="text-xs text-slate-400">{hint}</p>
                </div>
              </>
            );
            const cls =
              "group flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md";
            return href ? (
              <a key={title} href={href} className={cls}>
                {body}
              </a>
            ) : (
              <div key={title} className={cls}>
                {body}
              </div>
            );
          })}
        </div>
      </div>

      <ContactSection />

      <div className="mx-auto mb-8 max-w-6xl px-4">
        <Link
          to="/faq"
          className="flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-l from-[#EFF6FF] to-[#E8F7F3] p-6 transition-shadow hover:shadow-md"
        >
          <span className="flex items-center gap-3">
            <HelpCircle className="text-[#002C5A]" size={24} />
            <span>
              <span className="block font-bold text-[#002C5A]">ربما تجد إجابتك أسرع</span>
              <span className="text-sm text-slate-500">تصفح الأسئلة الشائعة حول المنصة</span>
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-[#002C5A] px-5 py-2 text-sm font-semibold text-white">الأسئلة الشائعة</span>
        </Link>
      </div>
    </PublicShell>
  );
}