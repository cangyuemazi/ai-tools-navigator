import { useLocation } from "wouter";
import Admin from "./pages/Admin";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AppShell from "./components/AppShell";

export default function App() {
  const [location] = useLocation();
  const path = location.split("?")[0];

  if (path === "/admin") return <Admin />;
  if (path === "/terms") return <Terms />;
  if (path === "/privacy") return <Privacy />;

  return <AppShell />;
}