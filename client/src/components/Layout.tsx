/**
 * Layout Component
 * Provides the consistent left sidebar + right content area layout for all pages.
 * The sidebar is shared across all routes.
 */
import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
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
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        {showMobileHeader && (
          <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">智能零零AI工具</span>
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
