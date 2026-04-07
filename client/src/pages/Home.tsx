import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Flame, PenTool, Presentation, Image, Video, Briefcase, Code, Palette, Music, Sparkles, UserCheck, Languages, GraduationCap, Scale, ShoppingCart, TrendingUp, Megaphone, Brain, Box } from "lucide-react";
import ToolGrid from "@/components/ToolGrid";
import ToolCard from "@/components/ToolCard";
import type { Category, SubCategory, Tool } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Flame, PenTool, Presentation, Image, Video, Briefcase, Code, Palette, Music, Sparkles, UserCheck, Languages, GraduationCap, Scale, ShoppingCart, TrendingUp, Megaphone, Brain, Box };

type HomeMode = "home" | "all-tools";

interface HomeProps {
  mode?: HomeMode;
  categories?: Category[];
  resetToken?: number;
  searchQuery?: string;
  isAllToolsView?: boolean;
  onSelectionChange?: (selectedCategoryId: string | null) => void;
  onActiveSectionChange?: (activeSectionId: string | null) => void;
  onRegisterScrollHandler?: (handler: ((categoryId: string, subCategoryId?: string) => void) | null) => void;
}

export default function Home({ mode = "home", categories: categoriesProp, resetToken = 0, searchQuery = "", isAllToolsView = false, onSelectionChange, onActiveSectionChange, onRegisterScrollHandler }: HomeProps) {
  const [location, setLocation] = useLocation();

  const [internalCategories, setInternalCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, string | null>>({});

  const categories = categoriesProp && categoriesProp.length > 0 ? categoriesProp : internalCategories;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sub") || params.get("category") || null;
  });

  useEffect(() => {
    const fetchPromises: Promise<unknown>[] = [
      fetch("/api/tools").then(res => res.json())
    ];
    if (!categoriesProp || categoriesProp.length === 0) {
      fetchPromises.unshift(fetch("/api/categories").then(res => res.json()));
    }
    Promise.all(fetchPromises)
    .then((results) => {
      if (results.length === 2) {
        setInternalCategories(results[0] as Category[]);
        setTools(results[1] as Tool[]);
      } else {
        setTools(results[0] as Tool[]);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("连接数据库失败:", err);
      setLoadError("数据加载失败，请刷新页面重试");
      setLoading(false);
    });
  }, [categoriesProp]);

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

  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scrollToCategory = useCallback((categoryId: string, subCategoryId?: string) => {
    if (subCategoryId) {
      setActiveSubTabs(prev => ({ ...prev, [categoryId]: subCategoryId }));
    }

    const container = document.getElementById('main-scroll-container');
    const section = document.getElementById(`category-${categoryId}`);
    if (!section || !container) return;

    // Check if the section header is already near the top of the viewport
    const containerRect = container.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const isInView = sectionRect.top >= containerRect.top - 20 &&
                     sectionRect.top <= containerRect.top + containerRect.height * 0.3;

    // Switching subcategory tabs within an already-visible section: skip vertical scroll
    if (subCategoryId && isInView) return;

    // Suppress IntersectionObserver during programmatic scroll
    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimer.current) clearTimeout(programmaticScrollTimer.current);

    requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      programmaticScrollTimer.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 600);
    });
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
        if (isProgrammaticScrollRef.current) return;
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

        {/* 热门工具展位 */}
        {mode === "home" && sponsoredTools.length > 0 && !loading && !searchQuery && !selectedCategoryId && (
          <div className="mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-5 pr-2">
              <div className="flex items-center gap-3">
                <span className="text-[20px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] to-[#42a1ff]">
                  🔥 热门工具
                </span>
                <span className="text-[13px] font-medium text-[#86868b] bg-white px-2 py-0.5 rounded-[6px] border border-[#e8e8ed]">
                  本周精选
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {sponsoredTools.map((tool, idx) => (
                <ToolCard key={`hot-${tool.id}`} tool={tool} index={idx} showHotBadge />
              ))}
            </div>
          </div>
        )}

        {/* 内容区 */}
        {loadError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px] border border-red-100">
            <p className="text-[15px] text-red-500 font-medium mb-4">{loadError}</p>
            <button onClick={() => window.location.reload()} className="px-5 py-2 bg-[#0071e3] text-white rounded-[10px] text-[14px] font-medium hover:bg-[#0077ED] transition-colors">刷新页面</button>
          </div>
        ) : loading ? (
          <ToolGrid tools={[]} categories={categories} selectedCategoryId={null} isLoading={true} />
        ) : mode === "all-tools" ? (
          <ToolGrid tools={filteredTools} categories={categories} selectedCategoryId={null} isLoading={false} isAllToolsView={isAllToolsView} searchQuery={searchQuery} />
        ) : searchQuery ? (
          <ToolGrid tools={filteredTools} categories={categories} selectedCategoryId={selectedCategoryId} isLoading={false} isAllToolsView={isAllToolsView} searchQuery={searchQuery} />
        ) : (
          categories.map(cat => {
            const catTools = toolsByCategory.get(cat.id);
            if (!catTools || catTools.length === 0) return null;
            const IconComp = iconMap[cat.icon] || Box;
            const hasChildren = cat.children?.length > 0;
            const activeTab = activeSubTabs[cat.id] || null;
            const displayTools = activeTab ? catTools.filter(t => t.subCategoryId === activeTab) : catTools;

            return (
              <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-20">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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