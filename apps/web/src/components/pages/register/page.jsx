
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell, {
  EMAIL_REGEX,
  ErrorBox,
  SubmitButton,
} from "../shared/AuthShell";
import FormInput from "../forgot-password/components/FormInput";
import PasswordInput from "../reset-password/components/PasswordInput";

const API_URL = import.meta.env.VITE_API_URL;

const CAPTIONS = [
  "عرّفنا بنفسك وشغّل أول مدار",
  "ممتاز! باقي كلمة المرور والشروط",
  "حسابك جاهز، اضغط إنشاء",
  "تم إنشاء حسابك 🎉",
];

// 0 بداية · 1 الاسم والإيميل تمام · 2 كل شي جاهز
const stageOf = (fd) => {
  const g = (k) => (fd.get(k) || "").toString();

  if (
    !g("firstName").trim() ||
    !g("lastName").trim() ||
    !EMAIL_REGEX.test(g("email"))
  ) {
    return 0;
  }

  return g("password").length >= 8 &&
    g("password") === g("confirmPassword") &&
    fd.get("terms")
    ? 2
    : 1;
};

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [stage, setStage] = useState(0);

  const [termsAccepted, setTermsAccepted] = useState(() => {
    const accepted = localStorage.getItem("acceptedTerms");

    if (accepted === "true") {
      localStorage.removeItem("acceptedTerms");
      return true;
    }

    return false;
  });

  const clear = (k) => () =>
    setErrors((e) => ({
      ...e,
      [k]: "",
    }));

  async function handleSubmit(e) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const firstName = fd.get("firstName")?.toString().trim();
    const lastName = fd.get("lastName")?.toString().trim();
    const email = fd.get("email")?.toString().trim();
    const password = fd.get("password")?.toString();
    const confirmPassword = fd.get("confirmPassword")?.toString();

    const found = {};

    if (!firstName) found.firstName = "الاسم الأول مطلوب";

    if (!lastName) found.lastName = "الاسم الأخير مطلوب";

    if (!email) {
      found.email = "البريد الإلكتروني مطلوب";
    } else if (!EMAIL_REGEX.test(email)) {
      found.email = "الرجاء إدخال بريد إلكتروني صحيح";
    }

    if (!password) {
      found.password = "كلمة المرور مطلوبة";
    } else if (password.length < 8) {
      found.password =
        "كلمة المرور يجب ألا تقل عن 8 أحرف أو أرقام";
    }

    if (!confirmPassword) {
      found.confirm = "تأكيد كلمة المرور مطلوب";
    } else if (password !== confirmPassword) {
      found.confirm = "كلمتا المرور غير متطابقتين";
    }

    if (!fd.get("terms")) {
      found.terms = "يجب الموافقة على الشروط والأحكام";
    }

    setErrors(found);

    if (Object.keys(found).length) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setDone(true);

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1300);

        return;
      }

      if (res.status === 409) {
        return setErrors({
          email: "هذا البريد الإلكتروني مسجل مسبقاً",
        });
      }

      setErrors({
        server:
          res.status === 400
            ? data.message || "البيانات المدخلة غير صحيحة"
            : res.status === 429
            ? "عدد المحاولات كبير، حاول بعد قليل"
            : "حدث خطأ، حاول مرة أخرى",
      });
    } catch (error) {
      console.error(error);

      setErrors({
        server: "تعذر الاتصال بالسيرفر، تحقق من الإنترنت",
      });
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || done;

  return (
    <AuthShell
      stage={done ? 3 : stage}
      captions={CAPTIONS}
      gauge="اكتمال حسابك"
      badge="حساب جديد"
      title={["أنشئ حسابك", "وابدأ رحلتك"]}
      subtitle="خطوات بسيطة، والبداية تكون مع مسار."
      back={{
        to: "/login",
        label: "لديك حساب؟ سجّل الدخول",
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5"
        onChange={(e) =>
          setStage(stageOf(new FormData(e.currentTarget)))
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="firstName"
            label="الاسم الأول"
            autoComplete="given-name"
            disabled={busy}
            error={errors.firstName}
            onChange={clear("firstName")}
          />

          <FormInput
            name="lastName"
            label="الاسم الأخير"
            autoComplete="family-name"
            disabled={busy}
            error={errors.lastName}
            onChange={clear("lastName")}
          />
        </div>

        <FormInput
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          label="البريد الإلكتروني"
          placeholder="example@email.com"
          disabled={busy}
          error={errors.email}
          onChange={clear("email")}
        />

        <PasswordInput
          name="password"
          autoComplete="new-password"
          label="كلمة المرور"
          disabled={busy}
          error={errors.password}
          onChange={clear("password")}
        />

        <PasswordInput
          name="confirmPassword"
          autoComplete="new-password"
          label="تأكيد كلمة المرور"
          disabled={busy}
          error={errors.confirm}
          onChange={clear("confirm")}
        />

        <div>
          <div className="flex items-start gap-3 px-1">
            <input
              type="checkbox"
              name="terms"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);

                if (e.target.checked) {
                  clear("terms")();
                }
              }}
              className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-[#0F8B78] focus:ring-[#0F8B78]"
            />

            <label
              htmlFor="terms"
              className="cursor-pointer text-base leading-7 text-slate-600"
            >
              أوافق على{" "}
              <Link
                to="/terms"
                className="font-bold text-[#0F8B78] hover:underline"
              >
                شروط الخدمة وسياسة الخصوصية
              </Link>
            </label>
          </div>

          {errors.terms && (
            <p
              role="alert"
              className="mt-1.5 px-1 text-sm font-bold text-red-500"
            >
              {errors.terms}
            </p>
          )}
        </div>

        <ErrorBox message={errors.server} />

        <SubmitButton
          loading={loading}
          done={done}
          ready={stage === 2}
          label="إنشاء الحساب"
          loadingLabel="جاري إنشاء الحساب..."
          doneLabel="تم إنشاء حسابك 🎉"
        />
      </form>
    </AuthShell>
  );
}

