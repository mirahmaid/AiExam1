import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";

import HomeHero from "./components/HomeHero/HomeHero";
import Studyhub from "./components/QuickActions/Studyhub";
import StudyHub from "./components/Book/StudyHub/StudyHub";
import TeamSection from "./components/Team/TeamSection";


export default function HomePage() {
  const navigate = useNavigate();

  const {
    isLoggedIn,
    isLoading,
    selectedBranch,
  } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    if (!selectedBranch) {
      navigate("/select-branch", {
        replace: true,
      });
    }
  }, [
    isLoading,
    isLoggedIn,
    selectedBranch,
    navigate,
  ]);

  useEffect(() => {
    if (
      isLoading ||
      !isLoggedIn ||
      !selectedBranch
    ) {
      return;
    }

    window.history.pushState(
      null,
      "",
      window.location.href
    );

    const handlePopState = () => {
      navigate("/login");
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, [
    isLoading,
    isLoggedIn,
    selectedBranch,
    navigate,
  ]);

  if (
    isLoading ||
    !isLoggedIn ||
    !selectedBranch
  ) {
    return null;
  }


  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#F7FAFC] font-Ubuntu text-[#102A43]"
    >
      <Header />

      <main className="pt-20">
        {/* 01 — Hero */}
        <HomeHero
          selectedBranch={selectedBranch}
        />

        {/* 02 — Quick Actions + Subjects */}
      <Studyhub />

        {/* 03 — Books + AI */}
       <StudyHub />

      
       {/* 04 — Team */}
<section id="team">
  <TeamSection />
</section>
      </main>

      <Footer />
    </div>
  );
}