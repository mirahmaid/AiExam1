import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import Hero from "../../Hero";
import StatsSection from "../../Stats/StatsSection";
import SubjectsSection from "./components/Subjects/SubjectsSection";
import TeachersSection from "./components/Teachers/TeachersSection";
import { BRANCH_IDS as TEACHER_BRANCH_IDS } from "./components/Teachers/teachersData";
import BooksSection from "./components/Book/BooksSection";
import HeroSection from "./components/AI/Herosection";

// خريطة معكوسة: من id الفرع لـ track (علمي/أدبي/شرعي/ريادة)
const BRANCH_ID_TO_TRACK = Object.fromEntries(
  Object.entries(TEACHER_BRANCH_IDS).map(([track, id]) => [id, track])
);

function HomePage() {
  const navigate = useNavigate();

  const {
    isLoggedIn,
    isLoading,
    selectedBranch,
  } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      navigate("/login", { replace: true });
    } else if (!selectedBranch) {
      navigate("/select-branch", { replace: true });
    }
  }, [
    isLoading,
    isLoggedIn,
    selectedBranch,
    navigate,
  ]);

  useEffect(() => {
    if (isLoading || !isLoggedIn || !selectedBranch) return;

    window.history.pushState(null, "", window.location.href);

    function handlePopState() {
      navigate("/login");
    }

    window.addEventListener("popstate", handlePopState);
    return () =>
      window.removeEventListener("popstate", handlePopState);
  }, [isLoading, isLoggedIn, selectedBranch, navigate]);

  if (isLoading || !isLoggedIn || !selectedBranch) {
    return null;
  }

  const teacherTrack = BRANCH_ID_TO_TRACK[selectedBranch.id];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-grow pt-20">
        <Hero hideCta />
        <StatsSection />
        <SubjectsSection />
       <TeachersSection 
  track={teacherTrack}
  title="نخبة المعلمين"
  description="كادر تعليمي مؤهل يرافقك خطوة بخطوة نحو النجاح"
/>
        <BooksSection />
        <HeroSection />
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;