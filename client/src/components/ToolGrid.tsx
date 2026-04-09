import { useState, useEffect, memo } from "react";
import { PackageOpen } from "lucide-react";
import ToolCard from "./ToolCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tool, Category } from "@/types";

interface ToolGridProps {
  tools: Tool[];
  categories: Category[];
  selectedCategoryId: string | null;
  isLoading?: boolean;
  isAllToolsView?: boolean;
  searchQuery?: string;
  showHotBadge?: boolean;
}

function ToolCardSkeleton() {
  return (
    <div className="bg-white rounded-[20px] p-4 border border-[#e8e8ed] shadow-[0_8px_20px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.02)]">
      <div className="flex items-start gap-4">
        <Skeleton className="w-[52px] h-[52px] rounded-[14px] shrink-0 bg-[#f5f5f7]" />
        <div className="flex-1 min-w-0 pt-1">
          <Skeleton className="h-[18px] w-3/4 mb-3 bg-[#f5f5f7]" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded-[12px] bg-[#f5f5f7]" />
            <Skeleton className="h-5 w-16 rounded-[12px] bg-[#f5f5f7]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolGrid({ tools, categories, selectedCategoryId, isLoading = false, isAllToolsView = false, searchQuery = "", showHotBadge = false }: ToolGridProps) {
  const [cols, setCols] = useState(5);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1536) setCols(5);
      else if (window.innerWidth >= 1280) setCols(4);
      else if (window.innerWidth >= 1024) setCols(3);
      else if (window.innerWidth >= 768) setCols(2);
      else setCols(1);
    };

    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const getCategoryName = () => {
    if (!selectedCategoryId) return "全部工具";
    for (const category of categories) {
      if (category.id === selectedCategoryId) return category.name;
      for (const subCategory of category.children) {
        if (subCategory.id === selectedCategoryId) return subCategory.name;
      }
    }
    return "全部工具";
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-3 bg-[#f5f5f7]" />
          <Skeleton className="h-5 w-32 bg-[#f5f5f7]" />
        </div>
        <div className="flex gap-6 items-start">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 flex flex-col gap-6 min-w-0">
              {Array.from({ length: 4 }).map((__, index) => <ToolCardSkeleton key={index} />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const columnsData = Array.from({ length: cols }, () => [] as Tool[]);
  tools.forEach((tool, index) => {
    columnsData[index % cols].push(tool);
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">{getCategoryName()}</h2>
        <p className="text-[15px] text-[#86868b] mt-2">为您收录了 {tools.length} 款优质工具</p>
      </div>

      {tools.length > 0 ? (
        <div className="flex gap-6 items-start">
          {columnsData.map((column, columnIndex) => (
            <div key={columnIndex} className="flex-1 flex flex-col gap-6 min-w-0">
              {column.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} isAllToolsView={isAllToolsView} showHotBadge={showHotBadge} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-[#86868b] bg-white rounded-[24px] border border-[#e8e8ed] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <PackageOpen className="w-16 h-16 mb-6 text-[#d2d2d7] stroke-[1.5]" />
          <p className="text-[17px] font-medium text-[#1d1d1f]">{searchQuery ? "未找到匹配结果" : "这里还是空的"}</p>
          <p className="text-[14px] mt-2 text-[#86868b]">{searchQuery ? "请尝试其他搜索关键词" : "该分类下暂未收录工具，敬请期待"}</p>
        </div>
      )}
    </div>
  );
}

export default memo(ToolGrid);
