import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell, { ErrorBox, SubmitButton } from "../shared/AuthShell";
import PasswordInput from "./components/PasswordInput";

const API_URL = import.meta.env.VITE_API_URL;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

const CAPTIONS = [
  "اختر كلمة مرور قوية",
  "قوية! أكّدها مرة ثانية",
  "متطابقتان، اضغط تغيير",
  "تم! حسابك محمي 🔒",
];

const stageOf = (fd) => {
  const p = (fd.get("password") || "").toString();
  return PASSWORD_REGEX.test(p) ? (p === fd.get("confirmPassword") ? 2 : 1) : 0;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const token = useSearchParams()[0].get("token") || "";

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [stage, setStage] = useState(0);

  const clear = (k) => () => setErrors((e) => ({ ...e, [k]: "" }));

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password");
    const confirmPassword = fd.get("confirmPassword");

    const found = {};
    if (!password) found.password = "كلمة المرور مطلوبة";
    else if (!PASSWORD_REGEX.test(password)) found.password = "يجب أن تتكون من 6 أحرف على الأقل، وتتضمن أرقاماً وحروفاً";
    if (!confirmPassword) found.confirm = "تأكيد كلمة المرور مطلوب";
    else if (password !== confirmPassword) found.confirm = "كلمتا المرور غير متطابقتين";
    if (!found.password && !found.confirm && !token) found.server = "الرابط غير صالح، الرجاء طلب رابط جديد";

    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (res.ok) return setSuccess(true);

      setErrors({
        server:
          res.status === 401 ? "الرابط غير صالح أو منتهي الصلاحية، الرجاء طلب رابط جديد"
          : res.status === 400 ? "البيانات المدخلة غير صحيحة"
          : res.status === 429 ? "عدد المحاولات كبير، حاول بعد قليل"
          : "حدث خطأ، حاول مرة أخرى",
      });
    } catch (error) {
      console.error(error);
      setErrors({ server: "تعذر الاتصال بالسيرفر، تحقق من الإنترنت" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      stage={success ? 3 : stage} captions={CAPTIONS} gauge="أمان حسابك" badge="حماية حسابك"
      title={success ? ["تم تغيير", "كلمة المرور"] : ["كلمة مرور", "جديدة"]}
      subtitle={success ? "حسابك جاهز. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة." : "اختر كلمة مرور قوية لحماية حسابك."}
      back={{ to: "/login", label: "العودة لتسجيل الدخول" }}
    >
      {success ? (
        <button
          onClick={() => navigate("/login")}
          className="flex w-full items-center justify-center rounded-2xl bg-[#0F8B78] py-[18px] text-lg font-extrabold text-white shadow-[0_20px_45px_-18px_rgba(15,139,120,.7)] transition hover:-translate-y-0.5 hover:bg-[#0F2A4A]"
        >
          الانتقال إلى تسجيل الدخول
        </button>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5" onChange={(e) => setStage(stageOf(new FormData(e.currentTarget)))}>
          <PasswordInput name="password" label="كلمة المرور الجديدة" disabled={loading} error={errors.password} valid={stage >= 1} onChange={clear("password")} />
          <PasswordInput name="confirmPassword" label="تأكيد كلمة المرور" disabled={loading} error={errors.confirm} valid={stage === 2} onChange={clear("confirm")} />

          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-500">
            6 أحرف على الأقل، وتتضمن أرقاماً وحروفاً.
          </div>

          <ErrorBox message={errors.server} />
          <SubmitButton loading={loading} ready={stage === 2} label="تغيير كلمة المرور" loadingLabel="جاري الحفظ..." />
        </form>
      )}
    </AuthShell>
  );
}