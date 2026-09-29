import { useState } from "react";

function getStatus(field) {
  if (field.value.trim().length > 0) return "filled";
  if (field.touched) return "error";
  return "idle";
}

function StepDot({ status, isLast, isFirst, alignTop }) {
  const finalStatus = isFirst && status === "idle" ? "filled" : status;

  let dotColor = "bg-slate-300";
  let ringColor = "bg-slate-200/50 scale-75";

  if (finalStatus === "filled") {
    dotColor = "bg-[#4FB8EF]";
    ringColor = "bg-[#6EC3F5]/30 scale-100";
  } else if (finalStatus === "error") {
    dotColor = "bg-red-500";
    ringColor = "bg-red-500/20 scale-100";
  }

  return (
    <div
      className={`relative flex h-full w-full justify-center ${
        alignTop ? "items-start pt-[52px]" : "items-center"
      }`}
    >
      {!isLast && (
        <span
          className="absolute top-1/2 z-0 w-[2px] bg-gradient-to-b from-slate-200 via-[#6EC3F5]/40 to-slate-200"
          style={{ height: "calc(100% + 2rem)" }}
        />
      )}

      <span className="relative z-10 flex items-center justify-center">
        <span className={`absolute h-7 w-7 rounded-full transition-all duration-500 ${ringColor}`} />
        <span className={`relative h-3.5 w-3.5 rounded-full shadow-sm transition-all duration-300 ${dotColor}`} />
      </span>
    </div>
  );
}

const emptyField = { value: "", touched: false };

const initialFields = {
  fullName: { ...emptyField },
  email: { ...emptyField },
  phone: { ...emptyField },
  message: { ...emptyField },
};

function ContactForm() {
  const [fields, setFields] = useState(initialFields);
  const [sending, setSending] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], value },
    }));
  }

  function handleBlur(name) {
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], touched: true },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);

    console.log("البيانات المدخلة:", {
      fullName: fields.fullName.value,
      email: fields.email.value,
      phone: fields.phone.value,
      message: fields.message.value,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSending(false);
    setFields({
      fullName: { ...emptyField },
      email: { ...emptyField },
      phone: { ...emptyField },
      message: { ...emptyField },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-lg flex-col gap-6">
      <div className="grid grid-cols-[28px_1fr] items-stretch gap-x-6 gap-y-5">
        <StepDot status={getStatus(fields.fullName)} isFirst />
        <input
          type="text"
          name="fullName"
          placeholder="إسمك كامل"
          value={fields.fullName.value}
          onChange={handleChange}
          onBlur={() => handleBlur("fullName")}
          required
          className="contact-field rounded-full border border-slate-200 bg-slate-50/50 px-6 py-3.5 text-right text-base outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#4FB8EF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(79,184,239,0.15)]"
        />

        <StepDot status={getStatus(fields.email)} />
        <input
          type="email"
          name="email"
          placeholder="البريد الإلكتروني"
          value={fields.email.value}
          onChange={handleChange}
          onBlur={() => handleBlur("email")}
          required
          className="contact-field rounded-full border border-slate-200 bg-slate-50/50 px-6 py-3.5 text-right text-base outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#4FB8EF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(79,184,239,0.15)]"
        />

        <StepDot status={getStatus(fields.phone)} />
        <input
          type="tel"
          name="phone"
          placeholder="رقم الهاتف"
          value={fields.phone.value}
          onChange={handleChange}
          onBlur={() => handleBlur("phone")}
          required
          className="contact-field rounded-full border border-slate-200 bg-slate-50/50 px-6 py-3.5 text-right text-base outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#4FB8EF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(79,184,239,0.15)]"
        />

        <StepDot status={getStatus(fields.message)} isLast alignTop />
        <textarea
          name="message"
          placeholder="الرسالة"
          rows={6}
          value={fields.message.value}
          onChange={handleChange}
          onBlur={() => handleBlur("message")}
          required
          className="contact-field resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-3.5 text-right text-base outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#4FB8EF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(79,184,239,0.15)]"
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="group relative mt-2 flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#002C5A] px-6 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#003a73] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

        {sending ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            جاري الإرسال...
          </>
        ) : (
          "تواصل معنا"
        )}
      </button>
    </form>
  );
}

export default ContactForm;
