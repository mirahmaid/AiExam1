import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastProvider } from "./components/ui/ToastProvider";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Header from "./components/Header/Header";

import Hero from "./components/Hero";
import StatsSection from "./components/Stats/StatsSection";
import Features from "./components/Features/Features";
import ContactSection from "./components/Contact/ContactSection";
import Testimonials from "./components/Testimonials/Testimonials";
import FAQSection from "./components/FAQ/FAQSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer/Footer";

import HomePage from "./components/pages/home/page";
import SelectBranchPage from "./components/pages/select-branch/page";
import LoginPage from "./components/pages/login/page";
import RegisterPage from "./components/pages/register/page";
import VerifyOtpPage from "./components/pages/verify-otp/page";
import ForgotPasswordPage from "./components/pages/forgot-password/page";
import ResetPasswordPage from "./components/pages/reset-password/page";

import AIAssistantPage from "./components/pages/ai-path/AIAssistantPage";

// الصفحات الجديدة
import QuizzesPage from "./components/pages/quizzes/page";
import QuizzesBySubjectPage from "./components/pages/quizzes/by-subject/page";
import ExamsArchivePage from "./components/pages/exams/archive/page";
import ResultsPage from "./components/pages/exams/results/page";
import DailyPlanPage from "./components/pages/daily-plan/page";
import ContactPage from "./components/pages/contact/page";
import PrivacyPage from "./components/pages/privacy/page";

// =========================
// Landing Page (المحتوى نفسه)
// =========================

function LandingPageContent() {
  return (
    <div className="min-h-screen">
      <Header landingPage />

      <main>
        <Hero />
        <StatsSection />
        <Features />
        <ContactSection />
        <Testimonials />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

// =========================
// Landing Route (بوابة الحماية)
// =========================
function LandingRoute() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading, selectedBranch } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) return;

    navigate(selectedBranch ? "/home" : "/select-branch", {
      replace: true,
    });
  }, [isLoading, isLoggedIn, selectedBranch, navigate]);

  if (isLoading || isLoggedIn) {
    return null;
  }

  return <LandingPageContent />;
}

// =========================
// App
// =========================

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Landing */}
          <Route
            path="/"
            element={<LandingRoute />}
          />

          {/* Home بعد تسجيل الدخول واختيار الفرع */}
          <Route
            path="/home"
            element={<HomePage />}
          />

          {/* مساعد مسار التميز AI */}
          <Route
            path="/ai-path"
            element={<AIAssistantPage />}
          />

          {/* Authentication */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="/verify-otp"
            element={<VerifyOtpPage />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />

          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

          {/* Select Branch */}
          <Route
            path="/select-branch"
            element={<SelectBranchPage />}
          />

          {/* الكويزات */}
          <Route
            path="/quizzes"
            element={<QuizzesPage />}
          />

          <Route
            path="/quizzes/by-subject"
            element={<QuizzesBySubjectPage />}
          />

          {/* الاختبارات السابقة */}
          <Route
            path="/exams/archive"
            element={<ExamsArchivePage />}
          />

          <Route
            path="/exams/results"
            element={<ResultsPage />}
          />

          {/* خطة اليوم */}
          <Route
            path="/daily-plan"
            element={<DailyPlanPage />}
          />

          {/* تواصل معنا */}
          <Route
            path="/contact"
            element={<ContactPage />}
          />

          {/* سياسة الخصوصية */}
          <Route
            path="/privacy"
            element={<PrivacyPage />}
          />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;