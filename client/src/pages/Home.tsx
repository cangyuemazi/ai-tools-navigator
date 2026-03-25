import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import ToolGrid from "@/components/ToolGrid";
import type { Category, Tool } from "@/types";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // 👇 新增：存储后端传来的动态数据与加载状态
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sub") || params.get("category") || null;
  });

  // 👇 新增：打通任督二脉！同时向后端请求“分类”和“工具”数据
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(res => res.json()),
      fetch("/api/tools").then(res => res.json())
    ])
    .then(([catsData, toolsData]) => {
      setCategories(catsData);
      setTools(toolsData);
      setLoading(false); // 数据拿到了，关闭加载动画
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

  return (
    <Layout selectedCategoryId={selectedCategoryId} onSelectCategory={handleSelectCategory}>
      <div className="p-6 md:p-10 lg:p-12 max-w-[1600px] flex flex-col gap-8 mx-auto">
        
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

        {/* 👇 新增：优雅的加载状态展示 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#86868b]">
            <Loader2 className="w-10 h-10 animate-spin text-[#0071e3] mb-4" />
            <p className="text-[15px] font-medium">正在读取数据库...</p>
          </div>
        ) : (
          <ToolGrid tools={filteredTools} categories={categories} selectedCategoryId={selectedCategoryId} />
        )}
      </div>
    </Layout>
  );
}