import { useState } from "react";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PasswordInput from "./components/PasswordInput";

// غيّر هاد الرابط حسب طريقة الـ env عندك (Vite: import.meta.env.VITE_API_URL / CRA: process.env.REACT_APP_API_URL)
const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setPasswordError("");
    setConfirmPasswordError("");
    setServerError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    let isValid = true;

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!password) {
      setPasswordError("كلمة المرور مطلوبة");
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError("يجب أن تتكون من 6 أحرف على الأقل، وتتضمن أرقاماً وحروفاً");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("تأكيد كلمة المرور مطلوب");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("كلمتا المرور غير متطابقتين");
      isValid = false;
    }

    if (!isValid) return;

    if (!token) {
      setServerError("الرابط غير صالح، الرجاء طلب رابط جديد");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (res.ok) {
        setSuccess(true);
        return;
      }

      if (res.status === 401) {
        setServerError("الرابط غير صالح أو منتهي الصلاحية، الرجاء طلب رابط جديد");
        return;
      }

      if (res.status === 400) {
        setServerError("البيانات المدخلة غير صحيحة");
        return;
      }

      if (res.status === 429) {
        setServerError("عدد المحاولات كبير، حاول بعد قليل");
        return;
      }

      setServerError("حدث خطأ، حاول مرة أخرى");
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
        className="w-full max-w-2xl rounded-[2.5rem] p-12 sm:p-20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.80)] border border-white/60 backdrop-blur-sm relative flex flex-col justify-center"
        style={{
          background:
            "linear-gradient(to top, rgba(200, 235, 245, 0.75) 0%, rgba(235, 247, 252, 0.85) 50%, rgba(255, 255, 255, 0.95) 100%)",
        }}
      >
        <div className="absolute top-8 right-8">
          <Link
            to="/login"
            className="flex items-center text-slate-700 transition-colors hover:text-[#002C5A]"
          >
            <ArrowRight size={24} />
          </Link>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 pt-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#002C5A]">
              <Check size={32} className="text-[#002C5A]" strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#002C5A]">تم تغيير كلمة المرور!</h1>
              <p className="mt-1 text-sm text-slate-500">تم تغيير كلمة المرور بنجاح.</p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="mt-2 rounded-full bg-[#002C5A] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2f4c6a] active:scale-[0.98]"
            >
              الانتقال إلى تسجيل الدخول
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 w-full items-center"
            noValidate
          >
            <div className="text-center mb-2">
              <h1 className="text-3xl font-bold text-[#002C5A] mb-3">
                إعادة تعيين كلمة المرور
              </h1>
              <p className="text-sm text-slate-600 font-medium">
                أدخل كلمة مرور تتكون من 6 أحرف على الأقل، وتتضمن أرقاماً وحروفاً.
              </p>
            </div>

            <PasswordInput
              name="password"
              placeholder="ادخل كلمة سر جديدة"
              disabled={loading}
              error={passwordError}
              onChange={() => setPasswordError("")}
            />

            <PasswordInput
              name="confirmPassword"
              placeholder="تأكيد كلمة السر"
              disabled={loading}
              error={confirmPasswordError}
              onChange={() => setConfirmPasswordError("")}
            />

            {serverError && (
              <p className="text-center text-sm text-red-500 w-full">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full max-w-md items-center justify-center rounded-full bg-[#002C5A] py-3.5 text-sm font-semibold text-white cursor-pointer transition-all hover:bg-[#2f4c6a] active:scale-[0.99] disabled:opacity-70 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  جاري الحفظ...
                </span>
              ) : (
                "حفظ"
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
