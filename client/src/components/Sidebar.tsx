import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Flame, PenTool, Presentation, Image, Video, Briefcase, Code, Palette, Music, Sparkles, UserCheck, Languages, GraduationCap, Scale, ShoppingCart, TrendingUp, Megaphone, Brain, Home, Send, Info, Handshake, PanelLeftClose, PanelLeftOpen, X, Box, LayoutGrid } from "lucide-react";
import type { Category, SubCategory } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Flame, PenTool, Presentation, Image, Video, Briefcase, Code, Palette, Music, Sparkles, UserCheck, Languages, GraduationCap, Scale, ShoppingCart, TrendingUp, Megaphone, Brain, Box };

interface SidebarProps { categories: Category[]; selectedCategoryId: string | null; onSelectCategory: (c: string | null, s?: string | null) => void; collapsed: boolean; onToggleCollapse: () => void; mobileOpen: boolean; onMobileClose: () => void; activeSectionId?: string | null; onScrollToCategory?: (categoryId: string, subCategoryId?: string) => void; onNavigateHome?: () => void; onNavigateAllTools?: () => void; }

export default function Sidebar({ categories, selectedCategoryId, onSelectCategory, collapsed, onToggleCollapse, mobileOpen, onMobileClose, activeSectionId, onScrollToCategory, onNavigateHome, onNavigateAllTools }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [location, setLocation] = useLocation();
  const [siteSettings, setSiteSettings] = useState({ name: "智能零零AI工具", logo: "", titleFontSize: 17 });

  const [sidebarWidth, setSidebarWidth] = useState(() => parseInt(localStorage.getItem("sidebarWidth") || "280"));
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [hoveredLinkIdx, setHoveredLinkIdx] = useState<number | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCatMouseEnter = useCallback((id: string, e: React.MouseEvent) => {
    if (!collapsed) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    hoverTimer.current = setTimeout(() => { setHoveredCatId(id); setHoveredRect(rect); }, 200);
  }, [collapsed]);
  const handleCatMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredCatId(null); setHoveredRect(null);
  }, []);
  const handleLinkMouseEnter = useCallback((idx: number, e: React.MouseEvent) => {
    if (!collapsed) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    hoverTimer.current = setTimeout(() => { setHoveredLinkIdx(idx); setHoveredRect(rect); }, 200);
  }, [collapsed]);
  const handleLinkMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredLinkIdx(null); setHoveredRect(null);
  }, []);

  useEffect(() => { fetch("/api/settings").then(r => r.json()).then(d => setSiteSettings(d)).catch(err => console.error("Failed to fetch site settings:", err)); }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newWidth = e.clientX;
      if (newWidth < 220) newWidth = 220; 
      if (newWidth > 450) newWidth = 450; 
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        localStorage.setItem("sidebarWidth", sidebarWidth.toString());
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = 'col-resize'; 
      document.body.style.userSelect = 'none'; 
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, sidebarWidth]);

  const toggleExpand = (id: string) => { setExpandedCategories(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const handleCatClick = (id: string, hasC: boolean) => { if (hasC && !collapsed) toggleExpand(id); if (onScrollToCategory && location === "/") { onScrollToCategory(id); return; } if (location !== "/") setLocation(`/?category=${id}`); onSelectCategory(id, null); };
  const handleSubClick = (cId: string, sId: string) => { if (onScrollToCategory && location === "/") { onScrollToCategory(cId, sId); return; } if (location !== "/") setLocation(`/?category=${cId}&sub=${sId}`); onSelectCategory(cId, sId); };
  const isActive = (cId: string, sId?: string) => { if (activeSectionId && !selectedCategoryId && location === "/") return sId ? false : cId === activeSectionId; return sId ? selectedCategoryId === sId : selectedCategoryId === cId; };

  const bottomLinks = [
    { path: "/", icon: Home, label: "首页", action: onNavigateHome },
    { path: "/all-tools", icon: LayoutGrid, label: "全部工具", action: onNavigateAllTools },
    { path: "/submit", icon: Send, label: "提交工具" },
    { path: "/about", icon: Info, label: "关于我们" },
    { path: "/partners", icon: Handshake, label: "商务合作" },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <Link href="/" className="flex items-center h-[72px] px-6 shrink-0 hover:opacity-80 no-underline" onClick={(e) => { e.preventDefault(); onNavigateHome?.(); onSelectCategory(null, null); if (mobileOpen) onMobileClose(); }}>
        {collapsed ? (
          <div className="w-full flex justify-center">{siteSettings.logo ? <img src={siteSettings.logo} className="w-10 h-10 rounded-[12px] object-contain shadow-sm" /> : <div className="w-10 h-10 rounded-[12px] bg-[#0071e3] flex items-center justify-center"><span className="text-white font-semibold text-sm">AI</span></div>}</div>
        ) : (
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {siteSettings.logo ? <img src={siteSettings.logo} className="w-9 h-9 rounded-[10px] object-contain shrink-0 shadow-sm" /> : <div className="w-9 h-9 rounded-[10px] bg-[#0071e3] flex items-center justify-center shrink-0"><span className="text-white font-semibold text-[13px]">AI</span></div>}
            <span className="font-semibold text-[#1d1d1f] tracking-tight truncate" style={{ fontSize: `${siteSettings.titleFontSize}px` }}>{siteSettings.name}</span>
          </div>
        )}
      </Link>

      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <nav className="space-y-1.5">{categories.map((cat) => { const IconComp = iconMap[cat.icon] || Box; const hasC = cat.children?.length > 0; const isExp = expandedCategories.has(cat.id); const act = isActive(cat.id); return (<div key={cat.id} onMouseEnter={(e) => handleCatMouseEnter(cat.id, e)} onMouseLeave={handleCatMouseLeave}><button onClick={() => handleCatClick(cat.id, hasC)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] transition-all ${act ? "bg-[#0071e3]/[0.08] text-[#0071e3] font-semibold" : "text-[#6e6e73] hover:bg-[#0071e3]/[0.04] hover:text-[#0071e3]"} ${collapsed ? "justify-center px-0" : ""}`}><IconComp className={`w-[18px] h-[18px] shrink-0 ${act ? "text-[#0071e3]" : "text-[#86868b]"}`} />{!collapsed && <><span className="flex-1 text-left truncate">{cat.name}</span>{hasC && <motion.div animate={{ rotate: isExp ? 90 : 0 }}><ChevronRight className="w-4 h-4 text-[#86868b]" /></motion.div>}</>}</button>{!collapsed && isExp && hasC && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="ml-5 pl-4 py-1.5 space-y-1">{cat.children.map((sub: SubCategory) => (<button key={sub.id} onClick={() => handleSubClick(cat.id, sub.id)} className={`w-full text-left px-3 py-2 rounded-[10px] text-[13px] transition-all ${isActive(cat.id, sub.id) ? "bg-[#0071e3]/[0.06] text-[#0071e3] font-semibold" : "text-[#86868b] hover:bg-[#0071e3]/[0.03] hover:text-[#0071e3]"}`}>{sub.name}</button>))}</div></motion.div>)}</div>); })}</nav>
      </div>

      <div className="p-4 shrink-0 space-y-1.5 border-t border-[#e8e8ed] mt-4">
        {bottomLinks.map((link, idx) => (
          <div key={link.path} onMouseEnter={(e) => handleLinkMouseEnter(idx, e)} onMouseLeave={handleLinkMouseLeave}>
            <Link href={link.path} onClick={(e) => { if (link.action) { e.preventDefault(); link.action(); onSelectCategory(null, null); } onMobileClose(); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] transition-all ${location === link.path ? "bg-[#0071e3]/[0.08] text-[#0071e3] font-semibold" : "text-[#6e6e73] hover:bg-[#0071e3]/[0.04] hover:text-[#0071e3]"} ${collapsed ? "justify-center px-0" : ""}`}><link.icon className={`w-[18px] h-[18px] shrink-0 ${location === link.path ? "text-[#0071e3]" : "text-[#86868b]"}`} />{!collapsed && <span>{link.label}</span>}</Link>
          </div>
        ))}
      </div>

      <div className="p-4 pt-0 shrink-0 hidden lg:block"><button onClick={onToggleCollapse} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[12px] text-[13px] font-medium text-[#86868b] hover:bg-[#e8e8ed]/50 hover:text-[#1d1d1f] transition-all">{collapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <><PanelLeftClose className="w-[18px] h-[18px]" /><span>收起边栏</span></>}</button></div>

      {/* Collapsed sidebar: floating glass-morphism tooltips */}
      <AnimatePresence>
        {collapsed && hoveredCatId && hoveredRect && (() => {
          const cat = categories.find(c => c.id === hoveredCatId);
          if (!cat) return null;
          const hasC = cat.children?.length > 0;
          return (
            <motion.div
              key={hoveredCatId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: [0.2, 0.9, 0.4, 1] }}
              className="fixed z-[9999] pointer-events-none"
              style={{ left: hoveredRect.right + 8, top: hoveredRect.top }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-[14px] px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 min-w-[180px]">
                <p className="text-[14px] font-semibold text-[#1d1d1f] whitespace-nowrap">{cat.name}</p>
                {hasC && (
                  <div className="mt-2 pt-2 border-t border-[#e8e8ed]/60 space-y-1">
                    {cat.children.map((sub: SubCategory) => (
                      <p key={sub.id} className="text-[12px] text-[#6e6e73] py-0.5">{sub.name}</p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      <AnimatePresence>
        {collapsed && hoveredLinkIdx !== null && hoveredRect && (
          <motion.div
            key={`link-${hoveredLinkIdx}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: [0.2, 0.9, 0.4, 1] }}
            className="fixed z-[9999] pointer-events-none"
            style={{ left: hoveredRect.right + 8, top: hoveredRect.top }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-[14px] px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50">
              <p className="text-[13px] font-medium text-[#1d1d1f] whitespace-nowrap">{bottomLinks[hoveredLinkIdx].label}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <aside 
        style={{ width: collapsed ? 80 : sidebarWidth }} 
        className={`hidden lg:flex flex-col h-screen shrink-0 border-r border-[#e8e8ed] bg-transparent sticky top-0 z-40 relative ${isDragging ? "" : "transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.4,1.1)]"}`}
      >
        {sidebarContent}
        {!collapsed && (
          <div
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#0071e3]/30 active:bg-[#0071e3]/50 z-50 transition-colors"
            onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
          />
        )}
      </aside>

      <AnimatePresence>{mobileOpen && <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-40 lg:hidden" onClick={onMobileClose} /><motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed left-0 top-0 h-screen w-[280px] bg-[#f5f5f7] z-50 lg:hidden shadow-2xl"><button onClick={onMobileClose} className="absolute top-5 right-4 p-2 rounded-full text-[#86868b] hover:bg-[#e8e8ed]/80"><X className="w-5 h-5" /></button>{sidebarContent}</motion.aside></>}</AnimatePresence>
    </>
  );
}