import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import FloatingWidgets from "./FloatingWidgets";
import type { Category } from "@/types";
// 👇 引入强大的 SEO 管理组件
import { Helmet, HelmetProvider } from "react-helmet-async";

interface LayoutProps { children: React.ReactNode; selectedCategoryId?: string | null; onSelectCategory?: (c: string | null, s?: string | null) => void; showMobileHeader?: boolean; }

export default function Layout({ children, selectedCategoryId = null, onSelectCategory, showMobileHeader = true }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState({ name: "智能零零AI工具", logo: "", favicon: "", backgroundColor: "#f5f5f7", companyIntro: "", icp: "", email: "" });

  useEffect(() => {
    fetch("/api/categories").then(res => res.json()).then(data => setCategories(data)).catch(()=>{});
    fetch("/api/settings").then(r => r.json()).then(d => {
      setSiteSettings(prev => ({ ...prev, ...d }));
    }).catch(()=>{});
  }, []);

  const handleSelectCategory = (c: string | null, s?: string | null) => { if (onSelectCategory) onSelectCategory(c, s); setMobileOpen(false); };

  // 根据当前选择的分类，动态生成网页标题
  const currentCategoryName = categories.find(c => c.id === selectedCategoryId)?.name;
  // 👇 智能防重复判断：如果本来就以"工具"结尾，就不再追加
  const pageTitle = currentCategoryName 
    ? `${currentCategoryName}${currentCategoryName.endsWith("工具") ? "" : "工具"} - ${siteSettings.name}` 
    : `${siteSettings.name} - 发现最好用的AI工具`;

  return (
    <HelmetProvider>
      {/* 👇 这里是商业级动态 SEO 核心区域 👇 */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={siteSettings.companyIntro || "发现并收录全球最好用的AI人工智能工具"} />
        {siteSettings.favicon && <link rel="icon" href={siteSettings.favicon} />}
      </Helmet>

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
          
          <div className="flex-1">
            {children}
          </div>

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
    </HelmetProvider>
  );
}