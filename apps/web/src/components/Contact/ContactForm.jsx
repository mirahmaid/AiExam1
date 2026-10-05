import { useState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  Mail,
  Phone,
  Send,
  UserRound,
} from "lucide-react";

/* =====================================================
   الحقول (كل حقل بياناته وشرط صحته في مكان واحد)
===================================================== */

const FIELDS = [
  {
    name: "fullName",
    label: "الاسم الكامل",
    placeholder: "اسمك الكامل",
    type: "text",
    icon: UserRound,
    error: "اكتب اسمك (٣ أحرف على الأقل)",
    isValid: (v) => v.trim().length >= 3,
  },
  {
    name: "email",
    label: "البريد الإلكتروني",
    placeholder: "البريد الإلكتروني",
    type: "email",
    icon: Mail,
    error: "اكتب بريد إلكتروني صحيح",
    isValid: (v) => /^\S+@\S+\.\S+$/.test(v.trim()),
  },
  {
    name: "phone",
    label: "رقم الهاتف",
    placeholder: "رقم الهاتف",
    type: "tel",
    icon: Phone,
    error: "اكتب رقم هاتف صحيح",
    isValid: (v) => /^\+?[\d\s-]{9,15}$/.test(v.trim()),
  },
  {
    name: "message",
    label: "الرسالة",
    placeholder: "اكتب رسالتك هنا...",
    textarea: true,
    error: "الرسالة قصيرة (١٠ أحرف على الأقل)",
    isValid: (v) => v.trim().length >= 10,
  },
];

const emptyValues = { fullName: "", email: "", phone: "", message: "" };

function inputClass(hasError, hasIcon) {
  const base =
    "peer w-full rounded-2xl border bg-[#F8FAFC] py-4 text-right text-sm font-medium text-[#0F2A4A] outline-none transition-all duration-300 placeholder:text-[#A7B3C0] focus:bg-white focus:ring-4";
  const padding = hasIcon ? "pl-5 pr-12" : "px-5";
  const color = hasError
    ? "border-red-300 focus:border-red-400 focus:ring-red-400/10"
    : "border-[#E3EAF0] focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/15";

  return `${base} ${padding} ${color}`;
}

/* =====================================================
   COMPONENT
===================================================== */

function ContactForm() {
  const [values, setValues] = useState(emptyValues);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setStatus("idle");
  }

  function handleBlur(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // إذا في حقل غلط، نظهر الأخطاء ونوقف
    const hasErrors = FIELDS.some((f) => !f.isValid(values[f.name]));
    if (hasErrors) {
      setTouched({ fullName: true, email: true, phone: true, message: true });
      return;
    }

    setStatus("sending");

    try {
      // TODO: استبدلها بطلب حقيقي للباك اند
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setValues(emptyValues);
      setTouched({});
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {FIELDS.map((field) => {
        const { name, label, placeholder, type, icon: Icon, error } = field;
        const showError = touched[name] && !field.isValid(values[name]);

        const shared = {
          id: name,
          name,
          placeholder,
          value: values[name],
          onChange: handleChange,
          onBlur: () => handleBlur(name),
          "aria-invalid": showError,
          "aria-describedby": showError ? `${name}-error` : undefined,
          className: inputClass(showError, Boolean(Icon)),
        };

        return (
          <div key={name} className="contact-field">
            <label htmlFor={name} className="sr-only">
              {label}
            </label>

            <div className="relative">
              {field.textarea ? (
                <>
                  <textarea {...shared} rows={5} className={`${shared.className} min-h-[140px] resize-none`} />
                  <span className="pointer-events-none absolute bottom-3 left-4 text-[11px] font-bold text-[#B3BFCA]">
                    {values.message.length} حرف
                  </span>
                </>
              ) : (
                <>
                  <input {...shared} type={type} />
                  <Icon
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#A7B6C5] transition-colors duration-300 peer-focus:text-[#0F8B78]"
                  />
                </>
              )}
            </div>

            {showError && (
              <p id={`${name}-error`} role="alert" className="mt-1.5 pr-1 text-xs font-bold text-red-500">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {/* رسائل الحالة */}
      <div aria-live="polite" className="min-h-[20px]">
        {status === "sent" && (
          <p className="flex items-center gap-2 rounded-2xl border border-[#2DD4BF]/25 bg-[#EAFBF6] px-4 py-3 text-xs font-extrabold text-[#0F8B78]">
            <CheckCircle2 size={17} />
            وصلتنا رسالتك، وسنرد عليك قريبًا.
          </p>
        )}

        {status === "error" && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-extrabold text-red-500">
            تعذّر إرسال الرسالة. جرّب مرة ثانية بعد قليل.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0F2A4A] px-6 py-4 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(15,42,74,.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0F8B78] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F8B78]/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <LoaderCircle size={19} className="animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            أرسل الرسالة
            <Send
              size={16}
              aria-hidden="true"
              className="-scale-x-100 transition-transform duration-300 group-hover:-translate-x-1"
            />
          </>
        )}
      </button>

      <p className="text-center text-[11px] font-bold text-[#A0AEBB]">
        معلوماتك تُستخدم فقط للرد على استفسارك.
      </p>
    </form>
  );
}

export default ContactForm;