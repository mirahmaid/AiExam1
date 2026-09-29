import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  const handleAccept = () => {
    localStorage.setItem("acceptedTerms", "true");
    navigate("/register");
  };

  const handleDecline = () => {
    navigate("/register");
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(to top, #90CDE1 0%, #C4E5EF 50%, #FFFFFF 100%)",
      }}
    >
      <div className="absolute top-10 right-12 z-10">
        <Link
          to="/register"
          className="flex items-center text-[#002C5A] transition-colors hover:opacity-75"
        >
          <ArrowRight size={24} />
        </Link>
      </div>
      <div
        className="w-full max-w-5xl min-h-[620px] rounded-[2.5rem] px-14 py-16 sm:px-20 sm:py-20 shadow-[0_20px_50px_rgba(0,0,0,0.50)] border border-white/80 backdrop-blur-sm relative flex flex-col justify-between"
        style={{
          background:
            "linear-gradient(to top, rgba(200, 235, 245, 0.75) 0%, rgba(235, 247, 252, 0.85) 50%, rgba(255, 255, 255, 0.95) 100%)",
        }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#002C5A] mb-2">الشروط والأحكام</h1>
          <p className="text-sm text-[#767676] font-medium">
            يرجى قراءة هذه الشروط بعناية قبل استخدام المنصة.
          </p>
        </div>
        <div className="text-right text-lg text-[#767676] leading-relaxed space-y-6 mb-8 px-6 font-normal">
          <p>
            أهلاً بكم في منصة مسار التميز. باستخدامكم لهذه المنصة، فإنكم توافقون على الالتزام
            بالشروط والأحكام التالية. صُممت هذه الشروط لضمان بيئة تعليمية آمنة ومحترمة وفعّالة
            لجميع المستخدمين.
          </p>
          <p>
            يُتوقع من المستخدمين استخدام المنصة للأغراض التعليمية فقط. يُحظر منعاً باتاً أي إساءة
            استخدام للمنصة، بما في ذلك السلوك غير اللائق، أو مشاركة المحتوى الضار، أو انتهاك حقوق
            الآخرين. الاحترام المتبادل بين الطلاب والمعلمين وجميع المستخدمين أمرٌ أساسي.
          </p>
          <p>
            جميع المحتويات المتاحة على هذه المنصة، بما في ذلك الدورات والمواد والموارد، محمية
            بموجب حقوق الملكية الفكرية. لا يُسمح للمستخدمين بنسخ أو توزيع أو إعادة استخدام أي
            محتوى دون إذن مُسبق.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-xl mx-auto mt-auto">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full sm:w-1/2 rounded-full bg-[#002C5A] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2f4c6a] active:scale-[0.99] text-center shadow-md cursor-pointer"
          >
            قبول
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="w-full sm:w-1/2 rounded-full bg-[#93939326] py-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-300 active:scale-[0.99] text-center cursor-pointer"
          >
            لا ؛ شكرا
          </button>
        </div>
      </div>
    </main>
  );
}
