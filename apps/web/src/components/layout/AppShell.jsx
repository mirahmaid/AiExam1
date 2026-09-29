// غلاف صفحات الطالب المسجّل: يحمي الصفحة (تسجيل دخول + فرع) ويضيف الهيدر والفوتر
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function AppShell({ children, requireBranch = true, bare = false }) {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading, selectedBranch } = useAuth();
  const blocked = !isLoggedIn || (requireBranch && !selectedBranch);

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) navigate("/login", { replace: true });
    else if (requireBranch && !selectedBranch) navigate("/select-branch", { replace: true });
  }, [isLoading, isLoggedIn, selectedBranch, requireBranch, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7FAFC]">
      <Header />
      <main className="flex-grow pt-16 lg:pt-20">
        {isLoading || blocked ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-[#002C5A]" size={30} />
          </div>
        ) : bare ? (
          children
        ) : (
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</div>
        )}
      </main>
      <Footer />
    </div>
  );
}