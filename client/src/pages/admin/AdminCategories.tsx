import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface AdminCategoriesProps {
  categories: any[];
  onOpenCatModal: (cat?: any, parentId?: string) => void;
  onDelete: (type: string, id: string) => void;
  onMoveCategory: (parentId: string | null, categoryId: string, direction: "up" | "down") => void;
}

export default function AdminCategories({ categories, onOpenCatModal, onDelete, onMoveCategory }: AdminCategoriesProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-[#e8e8ed] p-6 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">分类目录结构</h2>
          <p className="text-[13px] text-[#86868b] mt-1">主分类和子分类都支持可视化排序，子分类不会跨主分类移动。</p>
        </div>
        <button onClick={() => onOpenCatModal(null, "")} className="flex gap-2 px-4 py-2 bg-[#0071e3] text-white rounded-[8px] text-sm"><Plus className="w-4 h-4"/> 新增主分类</button>
      </div>
      <div className="space-y-4">
        {categories.map((cat, index) => (
          <div key={cat.id} className="border border-[#e8e8ed] rounded-[16px] overflow-hidden bg-[#fcfcfc]">
            <div className="bg-[#fcfcfc] px-4 py-4 flex justify-between items-center border-b border-[#e8e8ed] gap-4">
              <div>
                <div className="font-semibold text-[#1d1d1f]">{cat.name}</div>
                <div className="text-[12px] text-[#86868b] mt-1">排序值：{cat.order || index + 1}</div>
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={() => onMoveCategory(null, cat.id, "up")} disabled={index === 0} className="p-2 rounded-[8px] border border-[#d2d2d7] text-[#6e6e73] disabled:opacity-40"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => onMoveCategory(null, cat.id, "down")} disabled={index === categories.length - 1} className="p-2 rounded-[8px] border border-[#d2d2d7] text-[#6e6e73] disabled:opacity-40"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => onOpenCatModal(null, cat.id)} className="text-xs text-[#0071e3] hover:underline">添加子分类</button>
                <button onClick={() => onOpenCatModal(cat)} className="text-[#86868b] hover:text-[#0071e3]"><Pencil className="w-4 h-4"/></button>
                <button onClick={() => onDelete("categories", cat.id)} className="text-[#86868b] hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
            <div className="p-4 space-y-3 bg-white">
              {cat.children?.length > 0 ? cat.children.map((sub: any, subIndex: number) => (
                <div key={sub.id} className="flex items-center justify-between gap-4 px-4 py-3 rounded-[12px] bg-[#f5f5f7] text-sm text-[#6e6e73]">
                  <div>
                    <div className="font-medium text-[#1d1d1f]">{sub.name}</div>
                    <div className="text-[12px] text-[#86868b] mt-1">同组排序：{sub.order || subIndex + 1}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onMoveCategory(cat.id, sub.id, "up")} disabled={subIndex === 0} className="p-2 rounded-[8px] border border-[#d2d2d7] text-[#6e6e73] disabled:opacity-40"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onMoveCategory(cat.id, sub.id, "down")} disabled={subIndex === cat.children.length - 1} className="p-2 rounded-[8px] border border-[#d2d2d7] text-[#6e6e73] disabled:opacity-40"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onOpenCatModal(sub, cat.id)} className="hover:text-[#0071e3]"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={() => onDelete("categories", sub.id)} className="hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              )) : <div className="text-[13px] text-[#86868b] px-2 py-3">当前主分类下还没有子分类。</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
