
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import PublicShell from "../../layout/PublicShell";
import PageHeader from "../../ui/PageHeader.jsx";
const SECTIONS = [
  {
    id: "collect",
    title: "البيانات التي نجمعها",
    body: [
      "بيانات الحساب: الاسم، البريد الإلكتروني، والفرع الدراسي الذي تختاره.",
      "بيانات الاستخدام: الأسئلة التي تولّدها، ومحادثاتك مع المساعد الذكي، والملفات التي ترفعها لتحليلها.",
      "بيانات تقنية: نوع المتصفح والجهاز لأغراض الأمان وتحسين الأداء.",
    ],
  },
  {
    id: "use",
    title: "كيف نستخدم بياناتك",
    body: [
      "تقديم خدمات المنصة: توليد الأسئلة، والمحادثة الذكية، وإتاحة الكتب والمراجع.",
      "تخصيص تجربتك الدراسية حسب فرعك ومستواك.",
      "حماية حسابك، مثل التحقق من البريد الإلكتروني والمصادقة الثنائية.",
      "لا نبيع بياناتك الشخصية لأي طرف ثالث.",
    ],
  },
  {
    id: "ai",
    title: "الذكاء الاصطناعي والملفات المرفوعة",
    body: [
      "تُرسل نصوص أسئلتك والملفات التي ترفعها إلى مزوّد خدمة ذكاء اصطناعي لمعالجتها وتوليد الأسئلة فقط.",
      "تُحذف الملفات المرفوعة لتحليل النمط تلقائياً خلال 24 ساعة.",
      "لا ترفع ملفات تحتوي على معلومات شخصية حساسة.",
    ],
  },
  {
    id: "local",
    title: "التخزين على جهازك",
    body: [
      "نحفظ بعض البيانات على متصفحك مباشرة، مثل رموز تسجيل الدخول، وسجل الكويزات، وخطة اليوم.",
      "يمكنك حذفها في أي وقت عبر تسجيل الخروج أو مسح بيانات الموقع من متصفحك.",
    ],
  },
  {
    id: "rights",
    title: "حقوقك",
    body: [
      "طلب نسخة من بياناتك أو تصحيحها أو حذف حسابك نهائياً.",
      "للتواصل بخصوص الخصوصية راسلنا عبر صفحة التواصل.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="الشركة"
          icon={ShieldCheck}
          title="سياسة الخصوصية"
          description="نلتزم بحماية بياناتك وشفافية استخدامها. آخر تحديث: سبتمبر 2026."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
          <nav aria-label="محتويات الصفحة" className="hidden lg:block">
            <ul className="sticky top-28 flex flex-col gap-1 rounded-3xl bg-slate-50 p-3">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-white hover:text-[#002C5A]"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#12897A] shadow-sm">
                      {i + 1}
                    </span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-5">
            {SECTIONS.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-28 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8"
              >
                <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-[#002C5A]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#12897A]/10 text-sm text-[#12897A]">
                    {i + 1}
                  </span>
                  {s.title}
                </h2>

                <ul className="flex flex-col gap-3">
                  {s.body.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 leading-7 text-slate-600"
                    >
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#12897A]" />
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <p className="rounded-3xl bg-[#EFF6FF] p-6 text-sm leading-7 text-slate-600">
              باستخدامك للمنصة فإنك توافق على هذه السياسة وعلى{" "}
              <Link
                to="/terms"
                className="font-semibold text-[#002C5A] underline underline-offset-4"
              >
                الشروط والأحكام
              </Link>
              . لأي استفسار{" "}
              <Link
                to="/contact"
                className="font-semibold text-[#002C5A] underline underline-offset-4"
              >
                تواصل معنا
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
