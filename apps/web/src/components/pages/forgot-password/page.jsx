
import { useState } from "react";
import { ArrowRight, Loader2, Mail, Check } from "lucide-react";
import { Link } from "react-router-dom";
import FormInput from "./components/FormInput";

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setEmailError("");
    setServerError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");

    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailError("البريد الإلكتروني مطلوب لاستعادة الحساب");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("الرجاء إدخال بريد إلكتروني صحيح");
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
        return;
      }

      if (res.status === 400) {
        setServerError("البريد الإلكتروني غير صحيح");
      } else if (res.status === 429) {
        setServerError("عدد المحاولات كبير، حاول بعد قليل");
      } else {
        setServerError("حدث خطأ، حاول مرة أخرى");
      }
    } catch (error) {
      console.error(error);
      setServerError("تعذر الاتصال بالسيرفر، تحقق من الإنترنت");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[#0F8B78]/10 blur-3xl" />

      <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#A78BFA]/10 blur-3xl" />

      <div className="relative w-full max-w-lg rounded-[2rem] bg-white border border-slate-200 shadow-[0_25px_70px_-25px_rgba(15,42,74,0.25)] p-7 sm:p-10">

        <Link
          to="/login"
          className="absolute top-7 right-7 h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#0F8B78] hover:border-[#0F8B78]/30 transition"
        >
          <ArrowRight size={18} />
        </Link>

        {success ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="h-16 w-16 rounded-2xl bg-[#0F8B78]/10 flex items-center justify-center">
              <Check size={30} className="text-[#0F8B78]" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[#0F2A4A]">
              تحقق من بريدك
            </h1>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
            </p>

            <Link
              to="/login"
              className="mt-7 rounded-full bg-[#0F2A4A] px-8 py-3 text-sm font-semibold text-white hover:bg-[#0F8B78] transition"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center"
            noValidate
          >
            <div className="h-14 w-14 rounded-2xl bg-[#0F2A4A] text-[#5EEAD4] flex items-center justify-center">
              <Mail size={27} />
            </div>

            <div className="text-center mt-5 max-w-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F2A4A]">
                نسيت كلمة المرور؟
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                ولا يهمك. أدخل بريدك وسنرسل لك رابطاً لاستعادة حسابك.
              </p>
            </div>

            <div className="w-full mt-8">
              <FormInput
                name="email"
                type="email"
                placeholder="البريد الإلكتروني"
                disabled={loading}
                error={emailError}
                onChange={() => setEmailError("")}
              />
            </div>

            {serverError && (
              <p className="text-center text-sm text-red-500 w-full max-w-md mt-2">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-md rounded-full bg-[#0F2A4A] py-3.5 text-sm font-semibold text-white transition hover:bg-[#0F8B78] active:scale-[0.99] disabled:opacity-60 mt-5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  جاري الإرسال...
                </span>
              ) : (
                "إرسال رابط الاستعادة"
              )}
            </button>

            <Link
              to="/login"
              className="mt-5 text-sm font-semibold text-[#0F8B78] hover:underline"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}

