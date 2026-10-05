import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastProvider } from "./components/ui/ToastProvider";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Header from "./components/Header/Header";
import TeamPage from "./components/pages/home/components/Team/TeamPage";
import LandingHero from "./components/LandingHero/LandingHero";
import StatsSection from "./components/Stats/StatsSection";
import Features from "./components/Features/Features";
import Testimonials from "./components/Testimonials/Testimonials";
import FAQSection from "./components/FAQ/FAQSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer/Footer";
import HomePage from "./components/pages/home/page";
import SelectBranchPage from "./components/pages/select-branch/page";
import LoginPage from "./components/pages/login/page";
import RegisterPage from "./components/pages/register/page";
import ForgotPasswordPage from "./components/pages/forgot-password/page";
import ResetPasswordPage from "./components/pages/reset-password/page";
import AIAssistantPage from "./components/pages/ai-path/AIAssistantPage";
import VideosPage from "./components/Videos/VideosPage";

import QuizzesPage from "./components/pages/quizzes/page.jsx";
import QuizzesBySubjectPage from "./components/pages/quizzes/by-subject/page.jsx";
import ExamsArchivePage from "./components/pages/exams/archive/page";
import ResultsPage from "./components/pages/exams/results/page";
import DailyPlanPage from "./components/pages/daily-plan/page";
import ContactPage from "./components/pages/contact/page";
import PrivacyPage from "./components/pages/privacy/page";

function LandingPageContent() {
  return (
    <div className="min-h-screen">
      <Header landingPage />
      <main>
        <LandingHero />
        <StatsSection />
        <Features />
        <Testimonials />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

// بوابة الحماية: المسجّل يروح لـ /home أو /select-branch
function LandingRoute() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading, selectedBranch } = useAuth();

  useEffect(() => {
    if (isLoading || !isLoggedIn) return;
    navigate(selectedBranch ? "/home" : "/select-branch", { replace: true });
  }, [isLoading, isLoggedIn, selectedBranch, navigate]);

  if (isLoading || isLoggedIn) return null;
  return <LandingPageContent />;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/ai-path" element={<AIAssistantPage />} />

          {/* صفحة الفيديوهات: بدون videoId بتفتح أول درس بالمادة */}
          <Route path="/videos/:subjectId" element={<VideosPage />} />
          <Route path="/videos/:subjectId/:videoId" element={<VideosPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/select-branch" element={<SelectBranchPage />} />

          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/by-subject" element={<QuizzesBySubjectPage />} />
          <Route path="/exams/archive" element={<ExamsArchivePage />} />
          <Route path="/exams/results" element={<ResultsPage />} />

          <Route path="/daily-plan" element={<DailyPlanPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;