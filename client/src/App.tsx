import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import AppShell from "./components/AppShell";
import ErrorBoundary from "./components/ErrorBoundary";

const Admin = lazy(() => import("./pages/Admin"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
    <div className="w-8 h-8 border-3 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  const [location] = useLocation();
  const path = location.split("?")[0];

  let content;
  if (path === "/admin") content = <Suspense fallback={<PageLoading />}><Admin /></Suspense>;
  else if (path === "/terms") content = <Suspense fallback={<PageLoading />}><Terms /></Suspense>;
  else if (path === "/privacy") content = <Suspense fallback={<PageLoading />}><Privacy /></Suspense>;
  else content = <AppShell />;

  return <ErrorBoundary>{content}</ErrorBoundary>;
}