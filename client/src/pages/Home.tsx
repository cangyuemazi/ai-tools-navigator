import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
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
  Box,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ToolGrid from "@/components/ToolGrid";
import ToolCard from "@/components/ToolCard";
import type { Category, SubCategory, Tool } from "@/types";

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
  Box,
};

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

const getToolAssignments = (tool: Tool) => (
  tool.categoryAssignments?.length
    ? tool.categoryAssignments
    : [{ categoryId: tool.categoryId, subCategoryId: tool.subCategoryId }]
);

const toolMatchesCategory = (tool: Tool, categoryId: string) => (
  getToolAssignments(tool).some((assignment) => assignment.categoryId === categoryId)
);

const toolMatchesSubCategory = (tool: Tool, subCategoryId: string) => (
  getToolAssignments(tool).some((assignment) => assignment.subCategoryId === subCategoryId)
);

export default function Home({
  mode = "home",
  categories: categoriesProp,
  resetToken = 0,
  searchQuery = "",
  isAllToolsView = false,
  onSelectionChange,
  onActiveSectionChange,
  onRegisterScrollHandler,
}: HomeProps) {
  const [location] = useLocation();
  const [internalCategories, setInternalCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, string | null>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [gridCols, setGridCols] = useState(5);
  const categories = categoriesProp && categoriesProp.length > 0 ? categoriesProp : internalCategories;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sub") || params.get("category") || null;
  });

  useEffect(() => {
    const fetchPromises: Promise<unknown>[] = [fetch("/api/tools").then((res) => res.json())];
    if (!categoriesProp || categoriesProp.length === 0) {
      fetchPromises.unshift(fetch("/api/categories").then((res) => res.json()));
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
      .catch((error) => {
        console.error("连接数据失败:", error);
        setLoadError("数据加载失败，请刷新页面重试");
        setLoading(false);
      });
  }, [categoriesProp]);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1536) setGridCols(5);
      else if (window.innerWidth >= 1280) setGridCols(4);
      else if (window.innerWidth >= 1024) setGridCols(3);
      else if (window.innerWidth >= 768) setGridCols(2);
      else setGridCols(1);
    };

    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedCategoryId(params.get("sub") || params.get("category") || null);
  }, [location]);

  const filteredTools = useMemo(() => {
    let result = tools;

    if (mode !== "all-tools" && selectedCategoryId) {
      const parentCategory = categories.find((category) => category.id === selectedCategoryId);
      if (parentCategory) {
        result = result.filter((tool) => toolMatchesCategory(tool, selectedCategoryId));
      } else {
        result = result.filter((tool) => toolMatchesSubCategory(tool, selectedCategoryId));
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((tool) => (
        tool.name.toLowerCase().includes(query)
        || tool.description.toLowerCase().includes(query)
      ));
    }

    if (mode === "all-tools" && !searchQuery.trim()) {
      result = [...result].sort((left, right) => {
        if (left.isSponsored && !right.isSponsored) return -1;
        if (!left.isSponsored && right.isSponsored) return 1;
        return 0;
      });
    }

    return result;
  }, [mode, selectedCategoryId, searchQuery, tools, categories]);

  const sponsoredTools = useMemo(() => tools.filter((tool) => tool.isSponsored), [tools]);

  const toolsByCategory = useMemo(() => {
    const map = new Map<string, Tool[]>();
    for (const category of categories) {
      const categoryTools = tools.filter((tool) => toolMatchesCategory(tool, category.id));
      if (categoryTools.length > 0) {
        map.set(category.id, categoryTools);
      }
    }
    return map;
  }, [categories, tools]);

  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const visibleToolLimit = gridCols * 2;

  const scrollToCategory = useCallback((categoryId: string, subCategoryId?: string) => {
    if (subCategoryId) {
      setActiveSubTabs((current) => ({ ...current, [categoryId]: subCategoryId }));
    }

    const container = document.getElementById("main-scroll-container");
    const section = document.getElementById(`category-${categoryId}`);
    if (!section || !container) return;

    const containerRect = container.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const isInView = sectionRect.top >= containerRect.top - 20 && sectionRect.top <= containerRect.top + containerRect.height * 0.3;
    if (subCategoryId && isInView) return;

    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimer.current) clearTimeout(programmaticScrollTimer.current);

    requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
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
    setExpandedSections({});
    const container = document.getElementById("main-scroll-container");
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
  }, [resetToken]);

  useEffect(() => {
    if (mode !== "home" || loading || searchQuery.trim()) return;
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category");
    const subCategoryId = params.get("sub") || undefined;
    if (categoryId) scrollToCategory(categoryId, subCategoryId);
  }, [location, loading, mode, scrollToCategory, searchQuery]);

  useEffect(() => {
    if (mode !== "home" || searchQuery || loading) return;
    const container = document.getElementById("main-scroll-container");
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id.replace("category-", ""));
          }
        }
      },
      { root: container, rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );

    const timer = setTimeout(() => {
      container.querySelectorAll('[id^="category-"]').forEach((section) => observer.observe(section));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [categories, tools, searchQuery, loading, mode]);

  const toggleSectionExpand = (key: string) => {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="p-6 pb-24 md:p-10 md:pb-28 lg:p-12 lg:pb-32 max-w-[1600px] flex flex-col gap-8 mx-auto overflow-visible">
      {mode === "home" && sponsoredTools.length > 0 && !loading && !searchQuery && !selectedCategoryId && (
        <div className="mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-5 pr-2">
            <div className="flex items-center gap-3">
              <span className="text-[20px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] to-[#42a1ff]">
                热门工具
              </span>
              <span className="text-[13px] font-medium text-[#86868b] bg-white px-2 py-0.5 rounded-[6px] border border-[#e8e8ed]">
                本周精选
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {sponsoredTools.map((tool, index) => (
              <ToolCard key={`hot-${tool.id}`} tool={tool} index={index} showHotBadge />
            ))}
          </div>
        </div>
      )}

      {loadError ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px] border border-red-100">
          <p className="text-[15px] text-red-500 font-medium mb-4">{loadError}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2 bg-[#0071e3] text-white rounded-[10px] text-[14px] font-medium hover:bg-[#0077ED] transition-colors">
            刷新页面
          </button>
        </div>
      ) : loading ? (
        <ToolGrid tools={[]} categories={categories} selectedCategoryId={null} isLoading />
      ) : mode === "all-tools" ? (
        <ToolGrid tools={filteredTools} categories={categories} selectedCategoryId={null} isAllToolsView={isAllToolsView} searchQuery={searchQuery} showHotBadge />
      ) : searchQuery ? (
        <ToolGrid tools={filteredTools} categories={categories} selectedCategoryId={selectedCategoryId} searchQuery={searchQuery} isAllToolsView={isAllToolsView} />
      ) : (
        categories.map((category) => {
          const categoryTools = toolsByCategory.get(category.id);
          if (!categoryTools?.length) return null;

          const IconComp = iconMap[category.icon] || Box;
          const activeTab = activeSubTabs[category.id] || null;
          const displayTools = activeTab
            ? categoryTools.filter((tool) => toolMatchesSubCategory(tool, activeTab))
            : categoryTools;
          const expansionKey = `${category.id}:${activeTab || "all"}`;
          const isExpanded = Boolean(expandedSections[expansionKey]);
          const shouldCollapse = displayTools.length > visibleToolLimit;
          const visibleTools = shouldCollapse && !isExpanded ? displayTools.slice(0, visibleToolLimit) : displayTools;

          return (
            <section key={category.id} id={`category-${category.id}`} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-[10px] bg-[#0071e3]/[0.08] flex items-center justify-center">
                  <IconComp className="w-[18px] h-[18px] text-[#0071e3]" />
                </div>
                <h2 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight">{category.name}</h2>
                <span className="text-[13px] text-[#86868b] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full">{categoryTools.length}</span>
              </div>

              {category.children?.length > 0 && (
                <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <button
                    onClick={() => setActiveSubTabs((current) => ({ ...current, [category.id]: null }))}
                    className={`shrink-0 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-200 ${
                      !activeTab
                        ? "bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                        : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                    }`}
                  >
                    全部
                  </button>
                  {category.children.map((subCategory: SubCategory) => (
                    <button
                      key={subCategory.id}
                      onClick={() => setActiveSubTabs((current) => ({ ...current, [category.id]: subCategory.id }))}
                      className={`shrink-0 px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-200 ${
                        activeTab === subCategory.id
                          ? "bg-[#0071e3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
                          : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                      }`}
                    >
                      {subCategory.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {visibleTools.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={index} isAllToolsView={isAllToolsView} />
                ))}
              </div>

              {displayTools.length === 0 && (
                <div className="py-12 text-center text-[#86868b] text-[14px]">该子分类下暂无工具</div>
              )}

              {shouldCollapse && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => toggleSectionExpand(expansionKey)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] border border-[#d2d2d7] bg-white text-[13px] font-medium text-[#1d1d1f] hover:border-[#0071e3] hover:text-[#0071e3] transition-colors"
                  >
                    {isExpanded ? "收起" : `展开剩余 ${displayTools.length - visibleTools.length} 个`}
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
