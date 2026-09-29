import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../forgot-password/components/FormInput";
import PasswordInput from "../reset-password/components/PasswordInput";
import { usePendingEmail } from "../verify-otp/Pendingverification";

// غيّر هاد الرابط حسب طريقة الـ env عندك (Vite: import.meta.env.VITE_API_URL / CRA: process.env.REACT_APP_API_URL)
const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const navigate = useNavigate();
  const { setPendingEmail } = usePendingEmail();
  const [loading, setLoading] = useState(false);

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");

  // Message Error Back End
  const [serverError, setServerError] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(() => {
    const accepted = localStorage.getItem("acceptedTerms");
    if (accepted === "true") {
      localStorage.removeItem("acceptedTerms");
      return true;
    }
    return false;
  });

  async function handleSubmit(e) {
    e.preventDefault();

    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");
    setServerError("");

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const termsChecked = formData.get("terms");

    let isValid = true;

    if (!firstName.trim()) {
      setFirstNameError("الاسم الأول مطلوب");
      isValid = false;
    }

    if (!lastName.trim()) {
      setLastNameError("الاسم الأخير مطلوب");
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("البريد الإلكتروني مطلوب");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("الرجاء إدخال بريد إلكتروني صحيح");
      isValid = false;
    }

    if (!password) {
      setPasswordError("كلمة المرور مطلوبة");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("كلمة المرور يجب ألا تقل عن 8 أحرف أو أرقام");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("تأكيد كلمة المرور مطلوب");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("كلمتا المرور غير متطابقتين");
      isValid = false;
    }

    if (!termsChecked) {
      setTermsError("يجب الموافقة على الشروط والأحكام");
      isValid = false;
    }

    if (!isValid) return;

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data = await res.json();

      if (res.status === 201) {
        // بدل تمرير الإيميل عبر الـ URL (?email=...)، نخزنه مؤقتاً بالـ sessionStorage
        setPendingEmail(email);
        // replace: true لأنه ما في معنى ترجع بزر الرجوع لفورم تسجيل
        // انحفظ أصلاً بالباك اند
        navigate("/verify-otp", { replace: true });
        return;
      }

      if (res.status === 409) {
        setEmailError("هذا البريد الإلكتروني مسجل مسبقاً");
        return;
      }

      if (res.status === 400) {
        setServerError(data.message || "البيانات المدخلة غير صحيحة");
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
        className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-8 w-full max-w-xl relative"
        style={{
          background:
            "linear-gradient(to top, rgba(200, 235, 245, 0.75) 0%, rgba(235, 247, 252, 0.85) 50%, rgba(255, 255, 255, 0.95) 100%)",
        }}
      >
        <div className="absolute top-6 right-6">
          <Link
            to="/login"
            className="flex items-center text-slate-700 transition-colors hover:text-[#002C5A]"
          >
            <ArrowRight size={22} />
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full items-center pt-4"
          noValidate
        >
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-[#002C5A]">
              انشئ حسابك المجاني
            </h1>
            <p className="text-lg text-[#002C5A] mt-1">انشئ حسابك الجديد</p>
          </div>

          <FormInput
            name="firstName"
            placeholder="الاسم الأول"
            disabled={loading}
            error={firstNameError}
            onChange={() => setFirstNameError("")}
          />

          <FormInput
            name="lastName"
            placeholder="الاسم الأخير"
            disabled={loading}
            error={lastNameError}
            onChange={() => setLastNameError("")}
          />

          <FormInput
            name="email"
            type="email"
            placeholder="البريد الإلكتروني"
            disabled={loading}
            error={emailError}
            onChange={() => setEmailError("")}
          />

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

          <div className="w-full max-w-md flex items-center justify-start gap-2 px-2 text-right">
            <input
              type="checkbox"
              name="terms"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (e.target.checked) setTermsError("");
              }}
              className="h-4 w-4 rounded border-slate-300 text-[#10B981] focus:ring-[#10B981] cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
              انا أوافق على{" "}
              <Link to="/terms" className="text-[#10B981] hover:underline font-medium">
                شروط الخدمة وسياسة الخصوصية
              </Link>
            </label>
          </div>
          {termsError && <p className="text-xs text-red-500 px-2">{termsError}</p>}

          {serverError && (
            <p className="text-center text-sm text-red-500 w-full max-w-md">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full max-w-md items-center justify-center rounded-full bg-[#002C5A] py-3.5 text-sm font-semibold text-white cursor-pointer transition-all hover:bg-[#2f4c6a] active:scale-[0.99] disabled:opacity-70 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                جاري التسجيل...
              </span>
            ) : (
              "سجل الآن"
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-2">
            هل لديك حساب ؟{" "}
            <Link to="/login" className="font-semibold text-[#10B981] hover:underline">
              تسجيل دخول
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}