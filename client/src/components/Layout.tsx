import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import FloatingWidgets from "./FloatingWidgets";
import type { Category } from "@/types";

interface LayoutProps { children: React.ReactNode; selectedCategoryId?: string | null; onSelectCategory?: (c: string | null, s?: string | null) => void; showMobileHeader?: boolean; }

export default function Layout({ children, selectedCategoryId = null, onSelectCategory, showMobileHeader = true }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState({ name: "智能零零AI工具", logo: "", favicon: "", backgroundColor: "#f5f5f7", companyIntro: "", icp: "", email: "" });

  useEffect(() => {
    fetch("/api/categories").then(res => res.json()).then(data => setCategories(data)).catch(()=>{});
    fetch("/api/settings").then(r => r.json()).then(d => {
      setSiteSettings(d);
      // 👇 动态应用 Favicon 浏览器标签页图标
      if (d.favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = d.favicon;
      }
      // 动态更新网页的 Title
      document.title = d.name || "智能零零AI工具";
    }).catch(()=>{});
  }, []);

  const handleSelectCategory = (c: string | null, s?: string | null) => { if (onSelectCategory) onSelectCategory(c, s); setMobileOpen(false); };

  return (
    // 👇 整个网站的最外层，动态应用你在后台填写的背景颜色 👇
    <div className="flex h-screen text-[#1d1d1f] font-sans selection:bg-[#0071e3]/20" style={{ backgroundColor: siteSettings.backgroundColor || "#f5f5f7" }}>
      <Sidebar categories={categories} selectedCategoryId={selectedCategoryId} onSelectCategory={handleSelectCategory} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main id="main-scroll-container" className="flex-1 overflow-y-auto scroll-smooth relative flex flex-col">
        
        {showMobileHeader && (
          <div className="lg:hidden sticky top-0 z-30 bg-white/70 backdrop-blur-[20px] border-b border-[#e8e8ed] px-4 py-3 flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-[12px] hover:bg-[#0071e3]/[0.05]"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              {siteSettings.logo ? <img src={siteSettings.logo} className="w-7 h-7 rounded-[8px] object-contain" /> : <div className="w-7 h-7 rounded-[8px] bg-[#0071e3] flex items-center justify-center"><span className="text-white font-bold text-xs">AI</span></div>}
              <span className="text-[15px] font-semibold truncate">{siteSettings.name}</span>
            </div>
          </div>
        )}
        
        {/* 这里渲染中间的卡片内容 */}
        <div className="flex-1">
          {children}
        </div>

        {/* 👇 新增：网站底部展示信息区 (Footer) 👇 */}
        {(siteSettings.companyIntro || siteSettings.icp || siteSettings.email) && (
          <footer className="mt-16 py-8 px-6 border-t border-[#e8e8ed]/60 text-center text-[#86868b] text-[13px] bg-black/5">
            {siteSettings.companyIntro && <p className="mb-3 max-w-2xl mx-auto leading-relaxed">{siteSettings.companyIntro}</p>}
            <div className="flex flex-wrap items-center justify-center gap-4 font-medium">
              {siteSettings.email && <span>联系邮箱：{siteSettings.email}</span>}
              {siteSettings.icp && (
                <span>
                  备案号：<a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:text-[#0071e3] transition-colors">{siteSettings.icp}</a>
                </span>
              )}
            </div>
            <p className="mt-3 opacity-80">© {new Date().getFullYear()} {siteSettings.name}. All rights reserved.</p>
          </footer>
        )}

        <FloatingWidgets />
      </main>
    </div>
  );
}