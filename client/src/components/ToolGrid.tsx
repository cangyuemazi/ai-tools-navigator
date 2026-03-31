import { useState, useEffect, memo } from "react";
import { PackageOpen } from "lucide-react";
import ToolCard from "./ToolCard";
import { Skeleton } from "@/components/ui/skeleton"; // 👇 引入骨架屏组件
import type { Tool, Category } from "@/types";

interface ToolGridProps {
  tools: Tool[];
  categories: Category[];
  selectedCategoryId: string | null;
  isLoading?: boolean; // 👇 新增：告诉网格当前是否正在加载数据
}

// 👇 新增：骨架屏卡片组件，完全复刻了你真实卡片的尺寸和阴影
function ToolCardSkeleton() {
  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed] shadow-[0_8px_20px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.02)]">
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

function ToolGrid({ tools, categories, selectedCategoryId, isLoading = false }: ToolGridProps) {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1536) setCols(4);
      else if (window.innerWidth >= 1280) setCols(3);
      else if (window.innerWidth >= 768) setCols(2);
      else setCols(1);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const getCategoryName = () => {
    if (!selectedCategoryId) return "全部工具";
    for (const cat of categories) {
      if (cat.id === selectedCategoryId) return cat.name;
      for (const sub of cat.children) {
        if (sub.id === selectedCategoryId) return sub.name;
      }
    }
    return "全部工具";
  };

  // 👇 核心视觉优化：如果正在加载，显示极其优雅的骨架屏阵列
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
              {/* 每列放 4 个骨架卡片作为占位 */}
              {Array.from({ length: 4 }).map((_, i) => (
                <ToolCardSkeleton key={i} />
              ))}
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
          {columnsData.map((col, colIndex) => (
            <div key={colIndex} className="flex-1 flex flex-col gap-6 min-w-0">
              {col.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-[#86868b] bg-white rounded-[24px] border border-[#e8e8ed] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <PackageOpen className="w-16 h-16 mb-6 text-[#d2d2d7] stroke-[1.5]" />
          <p className="text-[17px] font-medium text-[#1d1d1f]">这里还是空的</p>
          <p className="text-[14px] mt-2 text-[#86868b]">该分类下暂未收录工具，敬请期待</p>
        </div>
      )}
    </div>
  );
}

export default memo(ToolGrid);