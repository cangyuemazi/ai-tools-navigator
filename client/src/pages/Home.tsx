/**
 * Home Page
 * 包含搜索栏和支持 URL 参数的分类状态
 */
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import Layout from "@/components/Layout";
import ToolGrid from "@/components/ToolGrid";
import categoriesData from "@/data/categories.json";
import toolsData from "@/data/tools.json";
import type { Category, Tool } from "@/types";

const categories = categoriesData as Category[];
const tools = toolsData as Tool[];

export default function Home() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // 从网址参数中读取初始选中的分类
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("sub") || params.get("category") || null;
  });

  // 监听网址变化（解决从其他页面点击左侧栏跳回来的情况）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedCategoryId(params.get("sub") || params.get("category") || null);
  }, [location]);

  // 处理分类点击
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

  // 过滤工具数据
  const filteredTools = useMemo(() => {
    let result = tools;

    // 1. 按分类过滤
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

    // 2. 按搜索词过滤（支持搜名字和描述）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedCategoryId, searchQuery]);

  return (
    <Layout
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={handleSelectCategory}
    >
      <div className="p-6 lg:p-8 max-w-[1600px] flex flex-col gap-6">
        
        {/* 搜索框区域 */}
        <div className="relative max-w-xl w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索 AI 工具 (名称、描述)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-sm"
          />
        </div>

        {/* 工具展示网格 */}
        <ToolGrid
          tools={filteredTools}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
        />
      </div>
    </Layout>
  );
}