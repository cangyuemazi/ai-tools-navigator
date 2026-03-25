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
    // 动态监听屏幕宽度，决定分几列
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

  // 物理级隔离方案：把数据分配进独立的列数组中
  const columnsData = Array.from({ length: cols }, () => [] as Tool[]);
  tools.forEach((tool, index) => {
    columnsData[index % cols].push(tool);
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-[26px] font-bold tracking-tight text-zinc-900">{getCategoryName()}</h2>
        <p className="text-[15px] text-zinc-500 mt-2 font-medium">收录了 {tools.length} 款精选工具</p>
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
        <div className="flex flex-col items-center justify-center py-32 text-zinc-400 bg-white/40 rounded-[32px] border border-black/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
          <PackageOpen className="w-16 h-16 mb-6 text-zinc-300 stroke-[1.5]" />
          <p className="text-lg font-medium text-zinc-600">这里还是空的</p>
          <p className="text-sm mt-2 text-zinc-400">这个分类的工具正在赶来的路上</p>
        </div>
      )}
    </div>
  );
}