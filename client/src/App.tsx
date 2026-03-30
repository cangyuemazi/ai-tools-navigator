import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import About from "./pages/About";
import Submit from "./pages/Submit";
import Partners from "./pages/Partners";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
// 👇 引入刚才创建的两个新页面
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/submit" component={Submit} />
      <Route path="/partners" component={Partners} />
      
      {/* 👇 注册协议页面的路由 */}
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      
      <Route path="/admin" component={Admin} />

      <Route component={NotFound} />
    </Switch>
  );
}