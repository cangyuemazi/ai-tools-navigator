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
  const [siteSettings, setSiteSettings] = useState({ name: "智能零零AI工具", logo: "" });

  useEffect(() => {
    fetch("/api/categories").then(res => res.json()).then(data => setCategories(data)).catch(()=>{});
    fetch("/api/settings").then(r => r.json()).then(d => setSiteSettings(d)).catch(()=>{});
  }, []);

  const handleSelectCategory = (c: string | null, s?: string | null) => { if (onSelectCategory) onSelectCategory(c, s); setMobileOpen(false); };

  return (
    <div className="flex h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-[#0071e3]/20">
      <Sidebar categories={categories} selectedCategoryId={selectedCategoryId} onSelectCategory={handleSelectCategory} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main id="main-scroll-container" className="flex-1 overflow-y-auto scroll-smooth relative">
        {showMobileHeader && (
          <div className="lg:hidden sticky top-0 z-30 bg-[#f5f5f7]/70 backdrop-blur-[20px] border-b border-[#e8e8ed] px-4 py-3 flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-[12px] hover:bg-[#0071e3]/[0.05]"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              {siteSettings.logo ? <img src={siteSettings.logo} className="w-7 h-7 rounded-[8px] object-contain shadow-sm" /> : <div className="w-7 h-7 rounded-[8px] bg-[#0071e3] flex items-center justify-center"><span className="text-white font-bold text-xs">AI</span></div>}
              <span className="text-[15px] font-semibold truncate">{siteSettings.name}</span>
            </div>
          </div>
        )}
        {children}
        <FloatingWidgets />
      </main>
    </div>
  );
}