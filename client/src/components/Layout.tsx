import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import FloatingWidgets from "./FloatingWidgets";
import categoriesData from "@/data/categories.json";
import type { Category } from "@/types";

const categories = categoriesData as Category[];

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

  const handleSelectCategory = (categoryId: string | null, subCategoryId?: string | null) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId, subCategoryId);
    }
    setMobileOpen(false);
  };

  return (
    // 采用苹果经典的 #f5f5f7 主背景，全局文字基准为 #1d1d1f
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
          // 移动端顶部采用 20px 毛玻璃效果
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