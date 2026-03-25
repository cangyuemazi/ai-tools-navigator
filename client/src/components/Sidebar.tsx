import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Flame, PenTool, Presentation, Image, Video, Briefcase, Code,
  Palette, Music, Sparkles, UserCheck, Languages, GraduationCap, Scale,
  ShoppingCart, TrendingUp, Megaphone, Brain, Home, Send, FileCheck, Info,
  Handshake, PanelLeftClose, PanelLeftOpen, X,
} from "lucide-react";
import type { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame, PenTool, Presentation, Image, Video, Briefcase, Code, Palette, Music,
  Sparkles, UserCheck, Languages, GraduationCap, Scale, ShoppingCart, TrendingUp,
  Megaphone, Brain,
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
      <div 
        className="flex items-center h-20 px-6 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => {
          if (location !== "/") setLocation("/");
          onSelectCategory(null, null);
          if (mobileOpen) onMobileClose();
        }}
      >
        {collapsed ? (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 rounded-[10px] bg-black flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm tracking-widest">AI</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-black flex items-center justify-center shrink-0 shadow-md">
              <span className="text-white font-bold text-sm tracking-widest">AI</span>
            </div>
            <span className="text-[17px] font-bold text-zinc-900 tracking-tight">
              智能零零
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-3 scrollbar-thin">
        <nav className="space-y-1">
          {categories.map((category) => {
            const IconComp = iconMap[category.icon] || Flame;
            const hasChildren = category.children.length > 0;
            const isExpanded = expandedCategories.has(category.id);
            const active = isActive(category.id);

            return (
              <div key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category.id, hasChildren)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] transition-all duration-300 ease-out border
                    ${active
                      ? "bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-black/[0.04] text-zinc-900 font-semibold"
                      : "text-zinc-500 hover:bg-black/[0.04] hover:text-zinc-900 border-transparent"
                    }
                    ${collapsed ? "justify-center px-0" : ""}
                  `}
                  title={collapsed ? category.name : undefined}
                >
                  <IconComp className={`w-[18px] h-[18px] shrink-0 ${active ? "text-zinc-900" : "text-zinc-400"}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{category.name}</span>
                      {hasChildren && (
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
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
                        <div className="ml-5 pl-4 py-1 space-y-1">
                          {category.children.map((sub) => {
                            const subActive = isActive(category.id, sub.id);
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleSubCategoryClick(category.id, sub.id)}
                                className={`
                                  w-full text-left px-3 py-2 rounded-[10px] text-[13px] transition-all duration-300 border
                                  ${subActive
                                    ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-black/[0.04] text-zinc-900 font-semibold"
                                    : "text-zinc-500 hover:bg-black/[0.04] hover:text-zinc-900 border-transparent"
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

      <div className="p-3 shrink-0 space-y-1">
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
                flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] transition-all duration-300 ease-out border
                ${isLinkActive
                  ? "bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-black/[0.04] text-zinc-900 font-semibold"
                  : "text-zinc-500 hover:bg-black/[0.04] hover:text-zinc-900 border-transparent"
                }
                ${collapsed ? "justify-center px-0" : ""}
              `}
              title={collapsed ? link.label : undefined}
            >
              <link.icon className={`w-[18px] h-[18px] shrink-0 ${isLinkActive ? "text-zinc-900" : "text-zinc-400"}`} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-3 shrink-0 hidden lg:block">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-zinc-400 hover:bg-black/[0.04] hover:text-zinc-700 transition-all duration-300"
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
          hidden lg:flex flex-col h-screen shrink-0 border-r border-black/[0.04] bg-transparent
          transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] sticky top-0
          ${collapsed ? "w-20" : "w-[280px]"}
        `}
      >
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="fixed left-0 top-0 h-screen w-[280px] bg-[#F5F5F7] z-50 lg:hidden shadow-2xl"
            >
              <button onClick={onMobileClose} className="absolute top-6 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-black/[0.04]">
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