import type { Category, PendingTool } from "@/types";

interface AdminPendingProps {
  pendingTools: PendingTool[];
  categories: Category[];
  onApprove: (pending: PendingTool) => void;
  onDelete: (type: string, id: string) => void;
}

export default function AdminPending({ pendingTools, categories, onApprove, onDelete }: AdminPendingProps) {
  const getPendingCategoryLabel = (pending: PendingTool) => {
    const parentCategory = categories.find((category) => category.id === pending.categoryId);
    const subCategory = parentCategory?.children?.find((child) => child.id === pending.subCategoryId);
    if (parentCategory && subCategory) return `${parentCategory.name} / ${subCategory.name}`;
    return parentCategory?.name || "未选择";
  };

  return (
    <div className="animate-in fade-in">
      <h2 className="text-xl font-semibold mb-6">客户提交审核池</h2>
      <div className="bg-white rounded-[20px] shadow-sm border border-[#e8e8ed] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#fcfcfc] border-b border-[#e8e8ed] text-[#86868b]">
              <th className="p-4 font-medium">提交时间</th>
              <th className="p-4 font-medium">Logo & 产品信息</th>
              <th className="p-4 font-medium">分类</th>
              <th className="p-4 font-medium">联系方式</th>
              <th className="p-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {pendingTools.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-[#86868b]">目前没有待审核的工具</td></tr>
            ) : pendingTools.map(item => (
              <tr key={item.id} className="border-b border-[#e8e8ed] hover:bg-[#f5f5f7]/50">
                <td className="p-4 text-[#86868b] whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {item.logo && <img src={item.logo} className="w-10 h-10 border rounded-md object-contain p-1 bg-white" />}
                    <div>
                      <div className="font-medium text-[#1d1d1f] mb-1">{item.name}</div>
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-[#0071e3] hover:underline text-xs">{item.url}</a>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-[#6e6e73]">{getPendingCategoryLabel(item)}</td>
                <td className="p-4"><span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 font-medium rounded-[6px] border border-green-200">{item.contactInfo || "无"}</span></td>
                <td className="p-4 text-right"><button onClick={() => onApprove(item)} className="mr-3 px-3 py-1.5 bg-[#0071e3] text-white rounded-[6px] hover:bg-[#0077ED] font-medium">收录</button><button onClick={() => onDelete("pending-tools", item.id)} className="text-red-500 hover:underline">删除</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
