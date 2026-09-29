import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import FormInput from "./components/FormInput";

// غيّر هاد الرابط حسب طريقة الـ env عندك (Vite: import.meta.env.VITE_API_URL / CRA: process.env.REACT_APP_API_URL)
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
        headers: { "Content-Type": "application/json" },
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
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 relative"
      style={{
        background: "linear-gradient(to top, #90CDE1 0%, #C4E5EF 50%, #FFFFFF 100%)",
      }}
    >
      <div
        className="w-full max-w-2xl rounded-[2.5rem] p-12 sm:p-20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] border border-white/60 backdrop-blur-sm relative flex flex-col justify-center"
        style={{
          background:
            "linear-gradient(to top, rgba(200, 235, 245, 0.75) 0%, rgba(235, 247, 252, 0.85) 50%, rgba(255, 255, 255, 0.95) 100%)",
        }}
      >
        <div className="absolute top-8 right-8">
          <Link to="/login" className="text-slate-700 hover:text-[#002C5A] transition-colors">
            <ArrowRight size={24} />
          </Link>
        </div>

        {success ? (
          <div className="text-center flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold text-[#002C5A]">تحقق من بريدك الإلكتروني</h1>
            <p className="text-[#002C5A] font-light text-xl">
              أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
            </p>
            <Link
              to="/login"
              className="mt-4 rounded-full bg-[#002C5A] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#2f4c6a]"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-[#002C5A] mb-3">استعادة كلمة المرور</h1>
              <p className="text-[#002C5A] font-light text-xl">
                يرجى إدخال بريدك الإلكتروني واتباع الخطوات.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center" noValidate>
              <FormInput
                name="email"
                type="email"
                placeholder="إدخل بريدك الإلكتروني"
                disabled={loading}
                error={emailError}
                onChange={() => setEmailError("")}
              />

              {serverError && (
                <p className="text-center text-sm text-red-500 w-full max-w-md">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-md rounded-full bg-[#002C5A] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#2f4c6a] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center mt-2 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    جاري الإرسال...
                  </span>
                ) : (
                  "ارسال الرمز"
                )}
              </button>

              <Link
                to="/login"
                className="text-[#10B981] font-semibold text-sm hover:underline mt-4 cursor-pointer"
              >
                العودة الى تسجيل الدخول
              </Link>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
