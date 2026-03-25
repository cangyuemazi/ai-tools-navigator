/**
 * Sidebar Component
 * Design: Utility-First Efficiency — white background, blue accent for active state,
 * left blue bar indicator, collapsible to 80px icon-only mode.
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Flame,
  PenTool,
  Presentation,
  Image,
  Video,
  Briefcase,
  Code,
  Palette,
  Music,
  Sparkles,
  UserCheck,
  Languages,
  GraduationCap,
  Scale,
  ShoppingCart,
  TrendingUp,
  Megaphone,
  Brain,
  Home,
  Send,
  FileCheck,
  Info,
  Handshake,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";
import type { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  PenTool,
  Presentation,
  Image,
  Video,
  Briefcase,
  Code,
  Palette,
  Music,
  Sparkles,
  UserCheck,
  Languages,
  GraduationCap,
  Scale,
  ShoppingCart,
  TrendingUp,
  Megaphone,
  Brain,
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
  categories,
  selectedCategoryId,
  onSelectCategory,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [location, setLocation] = useLocation();

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleCategoryClick = (categoryId: string, hasChildren: boolean) => {
  if (hasChildren && !collapsed) {
    toggleExpand(categoryId);
  }
  // 如果当前不在首页，强制跳转回首页并带上分类参数
  if (location !== "/") {
    setLocation(`/?category=${categoryId}`);
  }
  onSelectCategory(categoryId, null);
};

  const handleSubCategoryClick = (categoryId: string, subCategoryId: string) => {
  // 如果当前不在首页，强制跳转回首页并带上子分类参数
  if (location !== "/") {
    setLocation(`/?category=${categoryId}&sub=${subCategoryId}`);
  }
  onSelectCategory(categoryId, subCategoryId);
};

  const isActive = (categoryId: string, subCategoryId?: string) => {
    if (subCategoryId) {
      return selectedCategoryId === subCategoryId;
    }
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
      {/* Logo Area */}
      <div 
        className="flex items-center h-16 px-5 border-b border-gray-100 shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => {
          // 1. 如果不在首页，跳回首页
          if (location !== "/") {
            setLocation("/");
          }
          // 2. 清空选中的分类，展示所有工具
          onSelectCategory(null, null);
          // 3. 如果是在手机端打开的侧边栏，点击后自动收起
          if (mobileOpen) {
            onMobileClose();
          }
        }}
      >
        {collapsed ? (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-base font-semibold text-gray-900 whitespace-nowrap">
              智能零零AI工具
            </span>
          </div>
        )}
      </div>

      {/* Category Menu */}
      <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
        <nav className="space-y-0.5">
          {categories.map((category) => {
            const IconComp = iconMap[category.icon] || Flame;
            const hasChildren = category.children.length > 0;
            const isExpanded = expandedCategories.has(category.id);
            const active = isActive(category.id);

            return (
              <div key={category.id}>
                {/* Parent Category */}
                <button
                  onClick={() => handleCategoryClick(category.id, hasChildren)}
                  className={`
                    relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                    ${active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                    ${collapsed ? "justify-center px-0" : ""}
                  `}
                  title={collapsed ? category.name : undefined}
                >
                  {active && !collapsed && (
                    <div className="absolute -left-3 w-[3px] h-6 bg-blue-600 rounded-r-full" />
                  )}
                  <IconComp className={`w-[18px] h-[18px] shrink-0 ${active ? "text-blue-600" : "text-gray-400"}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{category.name}</span>
                      {hasChildren && (
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </motion.div>
                      )}
                    </>
                  )}
                </button>

                {/* Sub Categories */}
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
                        <div className="ml-5 pl-4 border-l border-gray-100 py-1 space-y-0.5">
                          {category.children.map((sub) => {
                            const subActive = isActive(category.id, sub.id);
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleSubCategoryClick(category.id, sub.id)}
                                className={`
                                  w-full text-left px-3 py-1.5 rounded-md text-sm transition-all duration-150
                                  ${subActive
                                    ? "bg-blue-50 text-blue-700 font-medium"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
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

      {/* Bottom Links */}
      <div className="border-t border-gray-100 py-3 px-3 shrink-0 space-y-0.5">
        {bottomLinks.map((link) => {
          const isLinkActive = location === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => {
                if (link.path === "/") {
                  onSelectCategory(null, null);
                }
                onMobileClose();
              }}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                ${isLinkActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }
                ${collapsed ? "justify-center px-0" : ""}
              `}
              title={collapsed ? link.label : undefined}
            >
              <link.icon className={`w-[18px] h-[18px] shrink-0 ${isLinkActive ? "text-blue-600" : "text-gray-400"}`} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Collapse Toggle (Desktop only) */}
      <div className="border-t border-gray-100 p-3 shrink-0 hidden lg:block">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-150"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-[18px] h-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="w-[18px] h-[18px]" />
              <span>收起菜单</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen bg-white border-r border-gray-200 shrink-0
          transition-all duration-300 ease-in-out sticky top-0
          ${collapsed ? "w-20" : "w-[280px]"}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed left-0 top-0 h-screen w-[280px] bg-white z-50 lg:hidden shadow-xl"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
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
