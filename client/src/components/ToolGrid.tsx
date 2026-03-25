import { useState, useEffect } from "react";
import { PackageOpen } from "lucide-react";
import ToolCard from "./ToolCard";
import type { Tool, Category } from "@/types";

interface ToolGridProps {
  tools: Tool[];
  categories: Category[];
  selectedCategoryId: string | null;
}

export default function ToolGrid({ tools, categories, selectedCategoryId }: ToolGridProps) {
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
      for (const sub of cat.children) return sub.name;
    }
    return "全部工具";
  };

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