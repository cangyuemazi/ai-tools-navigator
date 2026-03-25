import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Flame, PenTool, Presentation, Image, Video, Briefcase, Code,
  Palette, Music, Sparkles, UserCheck, Languages, GraduationCap, Scale,
  ShoppingCart, TrendingUp, Megaphone, Brain, Home, Send, FileCheck, Info,
  Handshake, PanelLeftClose, PanelLeftOpen, X, Box,
} from "lucide-react";
import type { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame, PenTool, Presentation, Image, Video, Briefcase, Code, Palette, Music,
  Sparkles, UserCheck, Languages, GraduationCap, Scale, ShoppingCart, TrendingUp,
  Megaphone, Brain, Box,
};

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null, subCategoryId?: string | null) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  categories, selectedCategoryId, onSelectCategory,
  collapsed, onToggleCollapse, mobileOpen, onMobileClose,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [location, setLocation] = useLocation();

  // 👇 新增：动态请求后台设置的名称和Logo
  const [siteSettings, setSiteSettings] = useState({ name: "智能零零AI工具", logo: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => setSiteSettings(d))
      .catch(() => {});
  }, []);
  // 👆 新增结束

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const handleCategoryClick = (categoryId: string, hasChildren: boolean) => {
    if (hasChildren && !collapsed) toggleExpand(categoryId);
    if (location !== "/") setLocation(`/?category=${categoryId}`);
    onSelectCategory(categoryId, null);
  };

  const handleSubCategoryClick = (categoryId: string, subCategoryId: string) => {
    if (location !== "/") setLocation(`/?category=${categoryId}&sub=${subCategoryId}`);
    onSelectCategory(categoryId, subCategoryId);
  };

  const isActive = (categoryId: string, subCategoryId?: string) => {
    if (subCategoryId) return selectedCategoryId === subCategoryId;
    return selectedCategoryId === categoryId;
  };

  const bottomLinks = [
    { path: "/", icon: Home, label: "首页" },
    { path: "/submit", icon: Send, label: "提交工具" },
    { path: "/validator", icon: FileCheck, label: "数据校验" },
    { path: "/about", icon: Info, label: "关于我们" },
    { path: "/partners", icon: Handshake, label: "商务合作" },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* 👇 顶部 Logo 与 标题（改为动态渲染） */}
      <div 
        className="flex items-center h-[72px] px-6 shrink-0 cursor-pointer transition-all duration-300 hover:opacity-80"
        onClick={() => {
          if (location !== "/") setLocation("/");
          onSelectCategory(null, null);
          if (mobileOpen) onMobileClose();
        }}
      >
        {collapsed ? (
          <div className="w-full flex justify-center">
            {siteSettings.logo ? (
              <img src={siteSettings.logo} className="w-10 h-10 rounded-[12px] object-contain shadow-[0_4px_12px_rgba(0,0,0,0.05)]" alt="logo" />
            ) : (
              <div className="w-10 h-10 rounded-[12px] bg-[#0071e3] flex items-center justify-center shadow-[0_4px_12px_rgba(0,113,227,0.3)]">
                <span className="text-white font-semibold text-sm">AI</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {siteSettings.logo ? (
              <img src={siteSettings.logo} className="w-9 h-9 rounded-[10px] object-contain shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" alt="logo" />
            ) : (
              <div className="w-9 h-9 rounded-[10px] bg-[#0071e3] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,113,227,0.3)]">
                <span className="text-white font-semibold text-[13px]">AI</span>
              </div>
            )}
            <span className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight truncate">
              {siteSettings.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <nav className="space-y-1.5">
          {categories.map((category) => {
            const IconComp = iconMap[category.icon] || Box; // 新增分类没有选图标时，默认用 Box 图标
            const hasChildren = category.children.length > 0;
            const isExpanded = expandedCategories.has(category.id);
            const active = isActive(category.id);

            return (
              <div key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category.id, hasChildren)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.4,1.1)]
                    ${active
                      ? "bg-[#0071e3]/[0.08] text-[#0071e3] font-semibold"
                      : "text-[#6e6e73] hover:bg-[#0071e3]/[0.04] hover:text-[#0071e3]"
                    }
                    ${collapsed ? "justify-center px-0" : ""}
                  `}
                  title={collapsed ? category.name : undefined}
                >
                  <IconComp className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? "text-[#0071e3]" : "text-[#86868b]"}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{category.name}</span>
                      {hasChildren && (
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight className="w-4 h-4 text-[#86868b]" />
                        </motion.div>
                      )}
                    </>
                  )}
                </button>

                {!collapsed && (
                  <AnimatePresence initial={false}>
                    {isExpanded && hasChildren && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="ml-5 pl-4 py-1.5 space-y-1">
                          {category.children.map((sub) => {
                            const subActive = isActive(category.id, sub.id);
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleSubCategoryClick(category.id, sub.id)}
                                className={`
                                  w-full text-left px-3 py-2 rounded-[10px] text-[13px] transition-all duration-300
                                  ${subActive
                                    ? "bg-[#0071e3]/[0.06] text-[#0071e3] font-semibold"
                                    : "text-[#86868b] hover:bg-[#0071e3]/[0.03] hover:text-[#0071e3]"
                                  }
                                `}
                              >
                                {sub.name}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-4 shrink-0 space-y-1.5 border-t border-[#e8e8ed] mt-4">
        {bottomLinks.map((link) => {
          const isLinkActive = location === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => {
                if (link.path === "/") onSelectCategory(null, null);
                onMobileClose();
              }}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.4,1.1)]
                ${isLinkActive
                  ? "bg-[#0071e3]/[0.08] text-[#0071e3] font-semibold"
                  : "text-[#6e6e73] hover:bg-[#0071e3]/[0.04] hover:text-[#0071e3]"
                }
                ${collapsed ? "justify-center px-0" : ""}
              `}
              title={collapsed ? link.label : undefined}
            >
              <link.icon className={`w-[18px] h-[18px] shrink-0 ${isLinkActive ? "text-[#0071e3]" : "text-[#86868b]"}`} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 pt-0 shrink-0 hidden lg:block">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-[#86868b] hover:bg-[#e8e8ed]/50 hover:text-[#1d1d1f] transition-all duration-300"
        >
          {collapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : (
            <><PanelLeftClose className="w-[18px] h-[18px]" /><span>收起边栏</span></>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`
          hidden lg:flex flex-col h-screen shrink-0 border-r border-[#e8e8ed] bg-[#f5f5f7]
          transition-all duration-400 ease-[cubic-bezier(0.2,0.9,0.4,1.1)] sticky top-0
          ${collapsed ? "w-[80px]" : "w-[280px]"}
        `}
      >
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40 lg:hidden backdrop-blur-sm"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.4, ease: [0.2, 0.9, 0.4, 1.1] }}
              className="fixed left-0 top-0 h-screen w-[280px] bg-[#f5f5f7] z-50 lg:hidden shadow-2xl"
            >
              <button onClick={onMobileClose} className="absolute top-5 right-4 p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#e8e8ed]/80 transition-colors">
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}