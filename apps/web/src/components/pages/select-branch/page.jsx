import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BranchCard from "../../Branch/BranchCard";
import { useAuth } from "../../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const branchImages = {
  "الفرع العلمي": "/branches/image4.png",
  "الفرع الأدبي": "/branches/image3.png",
  "الفرع الشرعي": "/branches/image2.png",
  "الفرع الريادي": "/branches/image1.png",
};

export default function SelectBranch() {
  const navigate = useNavigate();

  const {
    isLoggedIn,
    isLoading: authLoading,
    selectedBranch,
    setSelectedBranch,
    logout,
  } = useAuth();

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState("");

  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // حماية الصفحة
  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }

    // إذا الفرع محفوظ أصلاً بالـ context، ما في داعي نضل بهالصفحة
    if (selectedBranch) {
      navigate("/home", { replace: true });
    }
  }, [authLoading, isLoggedIn, selectedBranch, navigate]);

  // جلب الفروع
  useEffect(() => {
    if (selectedBranch) return;

    async function fetchBranches() {
      setBranchesLoading(true);
      setBranchesError("");

      try {
        const res = await fetch(`${API_URL}/api/v1/branches`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) {
          setBranchesError("تعذر تحميل الفروع، حاول تحديث الصفحة");
          return;
        }

        const data = await res.json();

        setBranches(Array.isArray(data) ? data : data.branches ?? []);
      } catch (error) {
        console.error(error);
        setBranchesError("تعذر الاتصال بالسيرفر، تحقق من الإنترنت");
      } finally {
        setBranchesLoading(false);
      }
    }

    fetchBranches();
  }, [selectedBranch]);
async function postBranchSelection(path, branchId) {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ branchId }),
  });
}

  async function handleBranchResponse(res, token) {
    const chosenBranch = branches.find(
      (branch) => branch.id === selectedBranchId
    );

    if (res.ok) {
      if (!chosenBranch) {
        setServerError("تعذر حفظ الفرع المختار");
        return;
      }

      // تحديث الـ context (وهو بيتكفل بحفظ localStorage كمان)
      setSelectedBranch({
        id: chosenBranch.id,
        name: chosenBranch.name,
      });

      navigate("/home", { replace: true });
      return;
    }

    if (res.status === 401) {
      setServerError("انتهت صلاحية الجلسة، سجّل الدخول من جديد");
      logout();
      navigate("/login", { replace: true });
      return;
    }

    if (res.status === 400) {
      // الفرع محفوظ في الباك اند مسبقًا
      const changeRes = await postBranchSelection(
        "/api/v1/branches/change",
        selectedBranchId,
        token
      );

      if (changeRes.ok) {
        if (!chosenBranch) {
          setServerError("تعذر حفظ الفرع المختار");
          return;
        }

        setSelectedBranch({
          id: chosenBranch.id,
          name: chosenBranch.name,
        });

        navigate("/home", { replace: true });
      } else if (changeRes.status === 401) {
        setServerError("انتهت صلاحية الجلسة، سجّل الدخول من جديد");
        logout();
        navigate("/login", { replace: true });
      } else {
        setServerError("تعذر تغيير الفرع، حاول مرة أخرى");
      }

      return;
    }

    if (res.status === 404) {
      setServerError("الفرع المختار غير موجود");
      return;
    }

    setServerError("حدث خطأ أثناء حفظ اختيارك، حاول مرة أخرى");
  }

  async function handleContinue() {
  if (!selectedBranchId) return;

  setLoading(true);
  setServerError("");

  try {
    const res = await postBranchSelection(
      "/api/v1/branches/select",
      selectedBranchId
    );

    await handleBranchResponse(res);
  } catch (error) {
      console.error(error);
      setServerError("تعذر الاتصال بالسيرفر، تحقق من الإنترنت");
    } finally {
      setLoading(false);
    }
  }

  // لسا عم نتحقق من حالة تسجيل الدخول أو في فرع محفوظ أصلاً
  if (authLoading || selectedBranch) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-[#002C5A]" size={28} />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* زر الرجوع للـ Landing Page */}
        <div className="absolute right-5 top-5">
          <Link
            to="/"
            className="flex items-center text-slate-700 transition-colors hover:text-[#002C5A]"
          >
            <ArrowRight size={22} />
          </Link>
        </div>

        {/* العنوان */}
        <div className="mb-8 text-center">
          <h1 className="font-Ubuntu text-3xl font-bold text-[#002C5A]">
            اختار فرعك
          </h1>

          <p className="font-Ubuntu mt-1 text-[22px] font-normal leading-normal text-[#002C5A]">
            اختر فرعك في التوجيهي حسب رغبتك، لنتمكن من تقديم الأفضل لك.
          </p>
        </div>

        {/* الفروع */}
        {branchesLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#002C5A]" size={28} />
          </div>
        ) : branchesError ? (
          <p className="font-Ubuntu text-center text-sm text-red-500">
            {branchesError}
          </p>
        ) : branches.length === 0 ? (
          <p className="font-Ubuntu text-center text-sm text-slate-500">
            لا توجد فروع متاحة حالياً
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {branches.map((branch) => (
              <BranchCard
                key={branch.id}
                id={branch.id}
                label={branch.name}
                image={
                  branchImages[branch.name] ?? "/branches/default.png"
                }
                selected={selectedBranchId === branch.id}
                onSelect={setSelectedBranchId}
              />
            ))}
          </div>
        )}

        {/* الخطأ */}
        {serverError && (
          <p className="font-Ubuntu mt-4 text-center text-sm text-red-500">
            {serverError}
          </p>
        )}

        {/* زر المتابعة */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedBranchId || loading}
            className="font-Ubuntu rounded-full bg-[#002C5A] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2f4c6a] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                جاري الحفظ...
              </span>
            ) : (
              "انتقل الى الصفحة الرئيسية"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}