import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import About from "./pages/About";
import Submit from "./pages/Submit";
import Partners from "./pages/Partners";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/submit" component={Submit} />
      <Route path="/partners" component={Partners} />
      
      {/* 管理后台私密路由 */}
      <Route path="/admin" component={Admin} />

      <Route component={NotFound} />
    </Switch>
  );
}