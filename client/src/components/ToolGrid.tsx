/**
 * ToolGrid Component
 * Displays tool cards in a responsive grid with category title and empty state.
 */
import { PackageOpen } from "lucide-react";
import ToolCard from "./ToolCard";
import type { Tool, Category } from "@/types";

interface ToolGridProps {
  tools: Tool[];
  categories: Category[];
  selectedCategoryId: string | null;
}

export default function ToolGrid({ tools, categories, selectedCategoryId }: ToolGridProps) {
  // Get current category name
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

  return (
    <div>
      {/* Category Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{getCategoryName()}</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {tools.length} 个工具
          </p>
        </div>
      </div>

      {/* Tool Cards Grid */}
      {tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <PackageOpen className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">暂无工具，敬请期待</p>
          <p className="text-sm mt-1">该分类下还没有收录工具</p>
        </div>
      )}
    </div>
  );
}
