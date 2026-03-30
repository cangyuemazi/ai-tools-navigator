import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import Layout from "@/components/Layout";
import ToolGrid from "@/components/ToolGrid";
import type { Category, Tool } from "@/types";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (selectedCategoryId) {
      const parentCategory = categories.find((c) => c.id === selectedCategoryId);
      if (parentCategory) {
        const subIds = parentCategory.children.map((s) => s.id);
        result = result.filter(
          (t) => t.categoryId === selectedCategoryId || subIds.includes(t.subCategoryId)
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
  }, [selectedCategoryId, searchQuery, tools, categories]);

  // 👇 商业变现核心：挑出所有被后台标记为“赞助”的工具
  const sponsoredTools = useMemo(() => tools.filter(t => t.isSponsored), [tools]);

  return (
    <Layout selectedCategoryId={selectedCategoryId} onSelectCategory={handleSelectCategory}>
      <div className="p-6 md:p-10 lg:p-12 max-w-[1600px] flex flex-col gap-8 mx-auto overflow-hidden">
        
        <div className="relative max-w-2xl w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-[20px] w-[20px] text-[#86868b] transition-colors group-focus-within:text-[#0071e3]" />
          </div>
          <input
            type="text"
            placeholder="搜索 AI 工具 (名称、描述)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 border border-[#d2d2d7] rounded-[12px] leading-5 bg-[#ffffff] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-[4px] focus:ring-[#0071e3]/10 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[15px]"
          />
        </div>

        {/* 👇 商业变现大招：赞助商专属横向滚动展位 👇 */}
        {/* 只有在首页（没搜索、没选特定分类时）且有赞助工具时才显示 */}
        {sponsoredTools.length > 0 && !loading && !searchQuery && !selectedCategoryId && (
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
            
            {/* 横向滑动容器，隐藏滚动条 */}
            <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {sponsoredTools.map(tool => (
                <a 
                  key={`sponsor-${tool.id}`} 
                  href={tool.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="snap-start shrink-0 w-[290px] sm:w-[320px] bg-white p-5 rounded-[20px] border border-[#0071e3]/20 shadow-[0_8px_20px_rgba(0,113,227,0.08)] hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,113,227,0.15)] transition-all duration-300 group relative overflow-hidden"
                >
                  {/* 右上角高亮角标 */}
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#0071e3] to-[#42a1ff] text-white text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-bl-[14px] shadow-sm z-10">
                    SPONSORED
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <img 
                      src={tool.logo} 
                      className="w-[52px] h-[52px] rounded-[14px] object-contain bg-[#f5f5f7] p-1.5 border border-[#0071e3]/10" 
                      alt={tool.name}
                    />
                    <div>
                      <h3 className="font-semibold text-[#1d1d1f] text-[16px] line-clamp-1 group-hover:text-[#0071e3] transition-colors pr-12">
                        {tool.name}
                      </h3>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {tool.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-[11px] font-medium bg-[#0071e3]/[0.06] text-[#0071e3] px-2 py-0.5 rounded-[6px] border border-[#0071e3]/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#6e6e73] line-clamp-2 leading-[1.6]">
                    {tool.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 常规工具列表（含骨架屏） */}
        <ToolGrid tools={filteredTools} categories={categories} selectedCategoryId={selectedCategoryId} isLoading={loading} />

      </div>
    </Layout>
  );
}