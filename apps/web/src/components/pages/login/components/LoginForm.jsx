import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../../../context/AuthContext";
import FormInput from "../../forgot-password/components/FormInput";
import PasswordInput from "../../reset-password/components/PasswordInput";
import { EMAIL_REGEX, ErrorBox, SubmitButton } from "../../shared/AuthShell";

const API_URL = import.meta.env.VITE_API_URL;

const SERVER_ERRORS = {
  401: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  403: "الرجاء تأكيد بريدك الإلكتروني أولاً قبل تسجيل الدخول",
  429: "عدد المحاولات كبير، حاول بعد قليل",
};

export default function LoginForm({ onStage }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const emailOk = EMAIL_REGEX.test(form.email.trim());
  const passOk = form.password.length >= 8;
  const stage = done ? 3 : emailOk && passOk ? 2 : emailOk ? 1 : 0;

  useEffect(() => { onStage?.(stage); }, [stage, onStage]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors({});
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const email = form.email.trim();
    const found = {};
    if (!emailOk) found.email = email ? "الرجاء إدخال بريد إلكتروني صحيح" : "البريد الإلكتروني مطلوب";
    if (!passOk) found.password = form.password ? "كلمة المرور يجب ألا تقل عن 8 أحرف أو أرقام" : "كلمة المرور مطلوبة";
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000); // ما نضل نلف للأبد
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        signal: ctrl.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setDone(true);
        // نحفظ المستخدم ونتنقّل بنفس اللحظة، بعد احتفال قصير
        setTimeout(() => {
          login(data.user);
          navigate("/select-branch", { replace: true });
        }, 800);
        return;
      }
      setErrors({
        server:
          res.status === 400
            ? data.message || "البيانات المدخلة غير صحيحة"
            : SERVER_ERRORS[res.status] || "حدث خطأ، حاول مرة أخرى",
      });
    } catch (err) {
      setErrors({
        server: err.name === "AbortError"
          ? "السيرفر تأخر بالرد، حاول مرة أخرى"
          : "تعذر الاتصال بالسيرفر، تحقق من الإنترنت",
      });
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  const busy = loading || done;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <button
        type="button" disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#DCE6EE] bg-white py-3.5 text-base font-bold text-[#0F2A4A] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2DD4BF]/50 hover:shadow-[0_15px_35px_-20px_rgba(15,42,74,.4)] disabled:opacity-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F8FAFC] text-lg font-black text-[#4285F4]">G</span>
        المتابعة باستخدام Google
      </button>

      <div className="flex items-center gap-3 text-sm font-bold text-[#94A3B8]">
        <span className="h-px flex-1 bg-[#E7EEF4]" /> أو <span className="h-px flex-1 bg-[#E7EEF4]" />
      </div>

      <FormInput
        name="email" type="email" dir="ltr" autoComplete="email" label="البريد الإلكتروني"
        placeholder="example@email.com" value={form.email} onChange={set("email")}
        disabled={busy} error={errors.email} valid={emailOk}
      />

      <PasswordInput
        name="password" autoComplete="current-password" label="كلمة المرور"
        labelExtra={<Link to="/forgot-password" className="text-sm font-bold text-[#0F8B78] transition-colors hover:text-[#0F2A4A]">نسيت كلمة المرور؟</Link>}
        value={form.password} onChange={set("password")}
        disabled={busy} error={errors.password} valid={passOk}
      />

      <ErrorBox message={errors.server} />

      <SubmitButton loading={loading} done={done} ready={stage === 2} label="انطلق" loadingLabel="جاري الدخول..." doneLabel="أهلًا بعودتك 🎉" />

      <p className="text-center text-base font-medium text-[#64748B]">
        أول مرة معنا؟
        <Link to="/register" className="mr-1.5 font-extrabold text-[#0F8B78] transition-colors hover:text-[#0F2A4A]">أنشئ حسابك</Link>
      </p>
    </form>
  );
}