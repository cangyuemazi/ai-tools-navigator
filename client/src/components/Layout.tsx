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
    // 换成 Apple 经典高级灰背景和 Zinc 字体
    <div className="flex h-screen bg-[#F5F5F7] text-zinc-900 font-sans selection:bg-black/10">
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
          <div className="lg:hidden sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-black/[0.04] px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl hover:bg-black/[0.04] text-zinc-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-black flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <span className="text-sm font-semibold text-zinc-900">智能零零AI工具</span>
            </div>
          </div>
        )}

        {children}
        <FloatingWidgets />
      </main>
    </div>
  );
}