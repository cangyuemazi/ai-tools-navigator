import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import Layout from "./Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Partners from "@/pages/Partners";
import Submit from "@/pages/Submit";
import NotFound from "@/pages/NotFound";

type ScrollToCategoryHandler = (categoryId: string, subCategoryId?: string) => void;

export default function AppShell() {
  const [location, setLocation] = useLocation();
  const path = location.split("?")[0];
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [homeResetToken, setHomeResetToken] = useState(0);
  const scrollHandlerRef = useRef<ScrollToCategoryHandler | null>(null);

  useEffect(() => {
    if (path !== "/" && path !== "/all-tools") {
      setSelectedCategoryId(null);
      setActiveSectionId(null);
    }
  }, [path]);

  const handleNavigateHome = () => {
    setSelectedCategoryId(null);
    setActiveSectionId(null);
    setLocation("/");
    setHomeResetToken((value) => value + 1);
  };

  const handleNavigateAllTools = () => {
    setSelectedCategoryId(null);
    setActiveSectionId(null);
    setLocation("/all-tools");
    setHomeResetToken((value) => value + 1);
  };

  const handleSidebarSelect = (categoryId: string | null, subCategoryId?: string | null) => {
    setSelectedCategoryId(subCategoryId || categoryId);
    if (categoryId === null) {
      setActiveSectionId(null);
    }
  };

  const handleRegisterScrollHandler = (handler: ScrollToCategoryHandler | null) => {
    scrollHandlerRef.current = handler;
  };

  const handleScrollToCategory = (categoryId: string, subCategoryId?: string) => {
    scrollHandlerRef.current?.(categoryId, subCategoryId);
  };

  let content: React.ReactNode;
  switch (path) {
    case "/":
      content = (
        <Home
          mode="home"
          resetToken={homeResetToken}
          onSelectionChange={setSelectedCategoryId}
          onActiveSectionChange={setActiveSectionId}
          onRegisterScrollHandler={handleRegisterScrollHandler}
        />
      );
      break;
    case "/all-tools":
      content = (
        <Home
          mode="all-tools"
          resetToken={homeResetToken}
          onSelectionChange={setSelectedCategoryId}
          onActiveSectionChange={setActiveSectionId}
          onRegisterScrollHandler={handleRegisterScrollHandler}
        />
      );
      break;
    case "/submit":
      content = <Submit />;
      break;
    case "/about":
      content = <About />;
      break;
    case "/partners":
      content = <Partners />;
      break;
    default:
      content = <NotFound />;
      break;
  }

  return (
    <Layout
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={handleSidebarSelect}
      activeSectionId={path === "/" ? activeSectionId : null}
      onScrollToCategory={path === "/" ? handleScrollToCategory : undefined}
      onNavigateHome={handleNavigateHome}
      onNavigateAllTools={handleNavigateAllTools}
    >
      {content}
    </Layout>
  );
}