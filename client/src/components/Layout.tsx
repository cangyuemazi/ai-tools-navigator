import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import FloatingWidgets from "./FloatingWidgets";
import type { Category } from "@/types";

interface LayoutProps {
  children: React.ReactNode;
  selectedCategoryId?: string | null;
  onSelectCategory?: (categoryId: string | null, subCategoryId?: string | null) => void;
  showMobileHeader?: boolean;
}

export default function Layout({
  children,
  selectedCategoryId = null,
  onSelectCategory,
  showMobileHeader = true,
}: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // 👇 新增：用来存储从数据库获取的分类数据
  const [categories, setCategories] = useState<Category[]>([]);

  // 👇 新增：组件加载时，去后端 API 抓取分类数据
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("加载分类数据失败:", err));
  }, []);

  const handleSelectCategory = (categoryId: string | null, subCategoryId?: string | null) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId, subCategoryId);
    }
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-[#0071e3]/20">
      <Sidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main id="main-scroll-container" className="flex-1 overflow-y-auto scroll-smooth relative">
        {showMobileHeader && (
          <div className="lg:hidden sticky top-0 z-30 bg-[#f5f5f7]/70 backdrop-blur-[20px] border-b border-[#e8e8ed] px-4 py-3 flex items-center gap-3 transition-all">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-[12px] hover:bg-[#0071e3]/[0.05] text-[#1d1d1f] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-[#0071e3] flex items-center justify-center shadow-[0_2px_8px_rgba(0,113,227,0.3)]">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <span className="text-[15px] font-semibold text-[#1d1d1f]">智能零零AI工具</span>
            </div>
          </div>
        )}

        {children}
        <FloatingWidgets />
      </main>
    </div>
  );
}