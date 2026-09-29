import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import OtpInput from "./components/OtpInput";
import { usePendingEmail } from "./Pendingverification";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 59;

// غيّر هاد الرابط حسب طريقة الـ env عندك (Vite: import.meta.env.VITE_API_URL / CRA: process.env.REACT_APP_API_URL)
const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { email, clearPendingEmail } = usePendingEmail();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(() => (email ? "" : "انتهت الجلسة، الرجاء إعادة التسجيل"));

  // في حال صار الإيميل فاضي (مثلاً فتح الصفحة مباشرة بدون تسجيل)
  useEffect(() => {
    if (!email) {
      setError("انتهت الجلسة، الرجاء إعادة التسجيل");
    }
  }, [email]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
    secondsLeft % 60
  ).padStart(2, "0")}`;

  function handleOtpChange(newValue) {
    setOtp(newValue);
    if (error) setError("");
  }

  async function handleVerify(e) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setError("الرجاء إدخال الرمز كاملاً");
      return;
    }
    if (!email) {
      setError("انتهت الجلسة، الرجاء إعادة التسجيل");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (res.ok) {
        // انتهى الغرض من الإيميل المؤقت، نمسحه من sessionStorage
        clearPendingEmail();
        // replace: true لأنه ما في معنى ترجع بزر الرجوع لصفحة إدخال
        // رمز انتهى الغرض منه أصلاً
        navigate("/login", { replace: true });
        return;
      }
      if (res.status === 400) setError("البيانات المدخلة غير صحيحة");
      else if (res.status === 401) setError("الرمز غير صحيح أو منتهي الصلاحية، حاول مرة أخرى");
      else if (res.status === 429) setError("عدد المحاولات كبير، حاول بعد قليل");
      else setError("حدث خطأ، حاول مرة أخرى");
    } catch (err) {
      console.error(err);
      setError("تعذر الاتصال بالسيرفر، تحقق من الإنترنت");
    } finally {
      setLoading(false);
    }
  }

  const handleResend = useCallback(async () => {
    if (secondsLeft > 0 || resending || !email) return;
    setResending(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSecondsLeft(RESEND_SECONDS);
        setOtp(Array(OTP_LENGTH).fill(""));
      } else if (res.status === 429) {
        setError("عدد المحاولات كبير، حاول بعد قليل");
      } else {
        setError("تعذر إعادة إرسال الرمز");
      }
    } catch (err) {
      console.error(err);
      setError("تعذر الاتصال بالسيرفر");
    } finally {
      setResending(false);
    }
  }, [secondsLeft, resending, email]);

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 relative"
      style={{ background: "linear-gradient(to top, #90CDE1 0%, #C4E5EF 50%, #FFFFFF 100%)" }}
    >
      <div
        className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-8 w-full max-w-xl relative"
        style={{
          background:
            "linear-gradient(to top, rgba(200, 235, 245, 0.75) 0%, rgba(235, 247, 252, 0.85) 50%, rgba(255, 255, 255, 0.95) 100%)",
        }}
      >
        <div className="absolute top-6 right-6">
          <Link to="/register" className="flex items-center text-slate-700 transition-colors hover:text-[#002C5A]">
            <ArrowRight size={22} />
          </Link>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col items-center gap-5 pt-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#002C5A]">مصادقة OTP</h1>
            <p className="mt-1 text-sm text-slate-500">
              يرجى إدخال الرمز الذي أرسلناه إلى بريدك الإلكتروني.
            </p>
          </div>

          <OtpInput
            length={OTP_LENGTH}
            value={otp}
            onChange={handleOtpChange}
            disabled={loading || !email}
            hasError={!!error}
          />

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <p className="text-sm font-semibold text-slate-600">{formattedTime}</p>

          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0 || resending || !email}
            className="text-sm text-slate-500 disabled:cursor-not-allowed"
          >
            لم يصلك أي رمز؟{" "}
            <span className={secondsLeft > 0 ? "text-slate-300" : "font-semibold text-[#10B981] hover:underline"}>
              {resending ? "جاري الإرسال..." : "أعد إرسال الرمز"}
            </span>
          </button>

          <button
            type="submit"
            disabled={loading || !email}
            className="flex w-full items-center justify-center rounded-full bg-[#002C5A] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#2f4c6a] active:scale-[0.99] disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                جاري التحقق...
              </span>
            ) : (
              "تحقق الآن"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}