import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

// غيّر هاد الرابط حسب طريقة الـ env عندك (Vite: import.meta.env.VITE_API_URL / CRA: process.env.REACT_APP_API_URL)
const API_URL = import.meta.env.VITE_API_URL;

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error storage cases for each field separately
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setServerError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    let isValid = true;

    // Validation Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("البريد الكتروني مطلوب");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("الرجاء ادخال البريد الكتروني صحيح");
      isValid = false;
    }

    // Validation password
    if (!password) {
      setPasswordError("كلمة المرور مطلوبة");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("كلمة المرور يجب ألا تقل عن 8 أحرف أو أرقام");
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);
    try {
     const res = await fetch(`${API_URL}/api/v1/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});

    const data = await res.json();

if (res.ok) {
  // الكوكيز (access_token, refresh_token) انحطت أوتوماتيكياً من المتصفح
  // (Set-Cookie من الباك اند)، إحنا هون بس بنحدث الـ state بالفرونت
  login(data.user);

  navigate("/select-branch", { replace: true });
  return;
}

      if (res.status === 401) {
        setServerError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        return;
      }

      if (res.status === 400) {
        setServerError(data.message || "البيانات المدخلة غير صحيحة");
        return;
      }
      if (res.status === 403) {
        setServerError("الرجاء تأكيد بريدك الإلكتروني أولاً قبل تسجيل الدخول");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full items-center">
      <div className="w-full max-w-md flex flex-col gap-1">
        <input
          name="email"
          type="email"
          dir="rtl"
          placeholder="إدخل بريدك الالكتروني"
          disabled={loading}
          className={`w-full rounded-full border bg-white px-6 py-3.5 text-right text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-1 disabled:opacity-50 ${
            emailError
              ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500"
              : "border-slate-300 focus:border-[#002C5A] focus:ring-[#002C5A]"
          }`}
        />
        {emailError && (
          <span className="text-xs text-red-500 px-4 text-right">{emailError}</span>
        )}
      </div>

      <div className="w-full max-w-md flex flex-col gap-1">
        <div className="relative w-full">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="ادخل كلمة السر"
            disabled={loading}
            className={`w-full rounded-full border bg-white px-6 py-3.5 pl-12 text-right text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-1 disabled:opacity-50 ${
              passwordError
                ? "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-[#002C5A] focus:ring-[#002C5A]"
            }`}
          />
          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        {passwordError && (
          <span className="text-xs text-red-500 px-4 text-right">{passwordError}</span>
        )}
      </div>

      <div className="w-full max-w-md text-right px-2">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-[#10B981] hover:underline mb-7"
        >
          هل نسيت كلمة المرور ؟
        </Link>
      </div>

      {serverError && (
        <p className="w-full max-w-md text-center text-sm text-red-500">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full max-w-md items-center justify-center rounded-full bg-[#002C5A] py-3.5 text-sm font-semibold text-white cursor-pointer transition-all hover:bg-[#2f4c6a] active:scale-[0.99] disabled:opacity-70"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            جاري الدخول...
          </span>
        ) : (
          "تسجيل دخول"
        )}
      </button>

      <p className="text-center text-sm text-slate-400 my-1">أو</p>

      {/* زر الدخول عن طريق جوجل */}
      <button
        type="button"
        className="flex w-full max-w-md items-center justify-center gap-2 rounded-full border cursor-pointer border-slate-200 bg-white py-3.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.13 0 9.87 0 12s.43 3.87 1.18 5.39l4.09-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
          />
        </svg>
        <span>الدخول عن طريق جوجل</span>
      </button>

      {/* زر الدخول عن طريق فيسبوك */}
      <button
        type="button"
        className="flex w-full max-w-md items-center justify-center gap-2 rounded-full border cursor-pointer border-slate-200 bg-white py-3.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
      >
        <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span>الدخول عن طريق فيسبوك</span>
      </button>

      <p className="text-center text-sm text-slate-500 mt-2">
        ليس لديك حساب ؟{" "}
        <Link to="/register" className="font-semibold text-[#10B981] hover:underline">
          انشئ حسابك
        </Link>
      </p>
    </form>
  );
}