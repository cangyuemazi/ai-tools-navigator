import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { Flame, PenTool, Presentation, Image, Video, Briefcase, Code, Palette, Music, Sparkles, UserCheck, Languages, GraduationCap, Scale, ShoppingCart, TrendingUp, Megaphone, Brain, Box } from "lucide-react";
import ToolGrid from "@/components/ToolGrid";
import ToolCard from "@/components/ToolCard";
import type { Category, SubCategory, Tool } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Flame, PenTool, Presentation, Image, Video, Briefcase, Code, Palette, Music, Sparkles, UserCheck, Languages, GraduationCap, Scale, ShoppingCart, TrendingUp, Megaphone, Brain, Box };

type HomeMode = "home" | "all-tools";

function getDescriptionSnippet(description: string, maxLength = 8) {
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength)}...`;
}

function SponsoredToolCard({ tool }: { tool: Tool }) {
  const [isHovered, setIsHovered] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [popoverRect, setPopoverRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const updatePopoverRect = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPopoverRect({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isHovered) {
      setPopoverRect(null);
      return;
    }

    updatePopoverRect();

    const handlePositionChange = () => updatePopoverRect();
    const mainScrollContainer = document.getElementById("main-scroll-container");
    const sponsorScrollRow = cardRef.current?.closest('[data-sponsored-scroll-row="true"]');

    window.addEventListener("resize", handlePositionChange);
    mainScrollContainer?.addEventListener("scroll", handlePositionChange, { passive: true });
    sponsorScrollRow?.addEventListener("scroll", handlePositionChange, { passive: true });

    return () => {
      window.removeEventListener("resize", handlePositionChange);
      mainScrollContainer?.removeEventListener("scroll", handlePositionChange);
      sponsorScrollRow?.removeEventListener("scroll", handlePositionChange);
    };
  }, [isHovered, updatePopoverRect]);

  return (
    <div
      ref={cardRef}
      className={`snap-start shrink-0 w-[290px] sm:w-[320px] relative ${isHovered ? "z-50" : "z-10"}`}
      onMouseEnter={() => {
        updatePopoverRect();
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white p-5 rounded-[20px] border border-[#0071e3]/20 shadow-[0_8px_20px_rgba(0,113,227,0.08)] hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,113,227,0.15)] transition-all duration-300 group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#0071e3] to-[#42a1ff] text-white text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-bl-[14px] shadow-sm z-10">
          SPONSORED
        </div>

        <div className="flex items-center gap-4">
          {logoError ? (
            <div className="w-[52px] h-[52px] rounded-[14px] bg-[#f5f5f7] border border-[#0071e3]/10 flex items-center justify-center shrink-0">
              <span className="text-[20px] font-semibold text-[#86868b]">{tool.name.charAt(0)}</span>
            </div>
          ) : (
            <img
              src={tool.logo || undefined}
              className="w-[52px] h-[52px] rounded-[14px] object-contain bg-[#f5f5f7] border border-[#0071e3]/10 shrink-0"
              alt={tool.name}
              onError={() => setLogoError(true)}
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[#1d1d1f] text-[16px] line-clamp-1 group-hover:text-[#0071e3] transition-colors pr-12">
              {tool.name}
            </h3>
            <p className="mt-1.5 text-[12px] text-[#6e6e73] leading-5 truncate pr-12">
              {getDescriptionSnippet(tool.description)}
            </p>
          </div>
        </div>
      </a>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isHovered && popoverRect && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.2, 0.9, 0.4, 1] }}
                className="fixed z-[120] pointer-events-none"
                style={{
                  top: popoverRect.top,
                  left: popoverRect.left,
                  width: popoverRect.width,
                }}
              >
                <div className="bg-white/95 backdrop-blur-xl rounded-[14px] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#e8e8ed]/80">
                  <p className="text-[13px] leading-[1.6] text-[#4a4a4f]">{tool.description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

interface HomeProps {
  mode?: HomeMode;
  resetToken?: number;
  searchQuery?: string;
  isAllToolsView?: boolean;
  onSelectionChange?: (selectedCategoryId: string | null) => void;
  onActiveSectionChange?: (activeSectionId: string | null) => void;
  onRegisterScrollHandler?: (handler: ((categoryId: string, subCategoryId?: string) => void) | null) => void;
}

export default function Home({ mode = "home", resetToken = 0, searchQuery = "", isAllToolsView = false, onSelectionChange, onActiveSectionChange, onRegisterScrollHandler }: HomeProps) {
  const [location, setLocation] = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, string | null>>({});

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sub") || params.get("category") || null;
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(res => res.json()),
      fetch("/api/tools").then(res => res.json())
    ])
    .then(([catsData, toolsData]) => {
      setCategories(catsData);
      setTools(toolsData);
      setLoading(false);
    })
    .catch(err => {
      console.error("连接数据库失败:", err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedCategoryId(params.get("sub") || params.get("category") || null);
  }, [location]);

  const handleSelectCategory = (categoryId: string | null, subCategoryId?: string | null) => {
    if (categoryId === null) {
      setSelectedCategoryId(null);
      setLocation("/");
    } else if (subCategoryId) {
      setSelectedCategoryId(subCategoryId);
      setLocation(`/?category=${categoryId}&sub=${subCategoryId}`);
    } else {
      setSelectedCategoryId(categoryId);
      setLocation(`/?category=${categoryId}`);
    }
  };

  const filteredTools = useMemo(() => {
    let result = tools;
    if (mode !== "all-tools" && selectedCategoryId) {
      const parentCategory = categories.find((c) => c.id === selectedCategoryId);
      if (parentCategory) {
        const subIds = parentCategory.children.map((s) => s.id);
        result = result.filter(
          (t) => t.categoryId === selectedCategoryId || subIds.includes(t.subCategoryId || "")
        );
      } else {
        result = result.filter((t) => t.subCategoryId === selectedCategoryId);
      }
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
      );
    }
    return result;
  }, [mode, selectedCategoryId, searchQuery, tools, categories]);

  const sponsoredTools = useMemo(() => tools.filter((tool) => tool.isSponsored), [tools]);

  const toolsByCategory = useMemo(() => {
    const map = new Map<string, Tool[]>();
    for (const cat of categories) {
      const catTools = tools.filter(t => t.categoryId === cat.id || cat.children.some(sub => sub.id === t.subCategoryId));
      if (catTools.length > 0) map.set(cat.id, catTools);
    }
    return map;
  }, [tools, categories]);

  const scrollToCategory = useCallback((categoryId: string, subCategoryId?: string) => {
    if (subCategoryId) {
      setActiveSubTabs(prev => ({ ...prev, [categoryId]: subCategoryId }));
    }
    setTimeout(() => {
      const section = document.getElementById(`category-${categoryId}`);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  useEffect(() => {
    if (typeof onRegisterScrollHandler === "function") {
      onRegisterScrollHandler(mode === "home" ? scrollToCategory : null);
      return () => onRegisterScrollHandler(null);
    }
  }, [mode, onRegisterScrollHandler, scrollToCategory]);

  useEffect(() => {
    onSelectionChange?.(mode === "all-tools" ? null : selectedCategoryId);
  }, [mode, onSelectionChange, selectedCategoryId]);

  useEffect(() => {
    onActiveSectionChange?.(mode === "home" ? activeSectionId : null);
  }, [mode, activeSectionId, onActiveSectionChange]);

  useEffect(() => {
    setSelectedCategoryId(null);
    setActiveSectionId(null);
    setActiveSubTabs({});
    const container = document.getElementById("main-scroll-container");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [resetToken]);

  useEffect(() => {
    if (mode !== "home" || loading || searchQuery.trim()) return;
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category");
    const subCategoryId = params.get("sub") || undefined;
    if (categoryId) {
      scrollToCategory(categoryId, subCategoryId);
    }
  }, [location, loading, mode, scrollToCategory, searchQuery]);

  useEffect(() => {
    if (mode !== "home" || searchQuery || loading) return;
    const container = document.getElementById('main-scroll-container');
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id.replace('category-', ''));
          }
        }
      },
      { root: container, rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );
    const timer = setTimeout(() => {
      container.querySelectorAll('[id^="category-"]').forEach(s => observer.observe(s));
    }, 100);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [categories, tools, searchQuery, loading, mode]);

  return (
    <div className="p-6 pb-24 md:p-10 md:pb-28 lg:p-12 lg:pb-32 max-w-[1600px] flex flex-col gap-8 mx-auto overflow-visible">

        {/* 赞助商展位 */}
        {mode === "home" && sponsoredTools.length > 0 && !loading && !searchQuery && !selectedCategoryId && (
          <div className="mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-5 pr-2">
              <div className="flex items-center gap-3">
                <span className="text-[20px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] to-[#42a1ff]">
                  💎 赞助商强推
                </span>
                <span className="text-[13px] font-medium text-[#86868b] bg-white px-2 py-0.5 rounded-[6px] border border-[#e8e8ed]">
                  本周精选
                </span>
              </div>
            </div>
            
            <div data-sponsored-scroll-row="true" className="flex gap-4 overflow-x-auto pt-2 pb-6 snap-x snap-mandatory items-start [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {sponsoredTools.map(tool => (
                <SponsoredToolCard key={`sponsor-${tool.id}`} tool={tool} />
              ))}
            </div>
          </div>
        )}

        {/* 内容区 */}
        {loading ? (
          <ToolGrid tools={[]} categories={categories} selectedCategoryId={null} isLoading={true} />
        ) : mode === "all-tools" ? (
          <ToolGrid tools={filteredTools} categories={categories} selectedCategoryId={null} isLoading={false} isAllToolsView={isAllToolsView} />
        ) : searchQuery ? (
          <ToolGrid tools={filteredTools} categories={categories} selectedCategoryId={selectedCategoryId} isLoading={false} isAllToolsView={isAllToolsView} />
        ) : (
          categories.map(cat => {
            const catTools = toolsByCategory.get(cat.id);
            if (!catTools || catTools.length === 0) return null;
            const IconComp = iconMap[cat.icon] || Box;
            const hasChildren = cat.children?.length > 0;
            const activeTab = activeSubTabs[cat.id] || null;
            const displayTools = activeTab ? catTools.filter(t => t.subCategoryId === activeTab) : catTools;

            return (
              <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-6">
                {/* 分类标题 + 图标 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-[10px] bg-[#0071e3]/[0.08] flex items-center justify-center">
                    <IconComp className="w-[18px] h-[18px] text-[#0071e3]" />
                  </div>
                  <h2 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight">{cat.name}</h2>
                  <span className="text-[13px] text-[#86868b] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full">{catTools.length}</span>
                </div>

                {/* 子分类 Tab 导航栏 */}
                {hasChildren && (
                  <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <button
                      onClick={() => setActiveSubTabs(prev => ({ ...prev, [cat.id]: null }))}
                      className={`shrink-0 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-200 ${
                        !activeTab
                          ? "bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                          : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                      }`}
                    >
                      全部
                    </button>
                    {cat.children.map((sub: SubCategory) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubTabs(prev => ({ ...prev, [cat.id]: sub.id }));
                        }}
                        className={`shrink-0 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-200 ${
                          activeTab === sub.id
                            ? "bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                            : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* 工具卡片网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {displayTools.map((tool, idx) => (
                    <ToolCard key={tool.id} tool={tool} index={idx} isAllToolsView={isAllToolsView} />
                  ))}
                </div>

                {displayTools.length === 0 && (
                  <div className="py-12 text-center text-[#86868b] text-[14px]">该子分类下暂无工具</div>
                )}
              </section>
            );
          })
        )}

      </div>
  );
}