import { useState, useMemo } from "react";
import { Plus, CheckCircle2 } from "lucide-react";

interface AdminToolsProps {
  tools: any[];
  categories: any[];
  token: string;
  onOpenToolModal: (tool?: any) => void;
  onDelete: (type: string, id: string) => void;
  fetchData: () => void;
}

export default function AdminTools({ tools, categories, token, onOpenToolModal, onDelete, fetchData }: AdminToolsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToolIds, setSelectedToolIds] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSponsored, setFilterSponsored] = useState("");

  const filteredToolsList = useMemo(() => {
    let result = tools;
    if (filterCategory) result = result.filter(t => t.categoryId === filterCategory);
    if (filterSponsored === "yes") result = result.filter(t => t.isSponsored);
    if (filterSponsored === "no") result = result.filter(t => !t.isSponsored);
    if (searchQuery.trim()) result = result.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [tools, filterCategory, filterSponsored, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedToolIds.size === filteredToolsList.length) setSelectedToolIds(new Set());
    else setSelectedToolIds(new Set(filteredToolsList.map(t => t.id)));
  };
  const toggleSelectTool = (id: string) => {
    setSelectedToolIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const handleBatchDelete = async () => {
    if (!confirm(`确定删除选中的 ${selectedToolIds.size} 个工具？不可恢复！`)) return;
    for (const id of Array.from(selectedToolIds)) { await fetch(`/api/admin/tools/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); }
    setSelectedToolIds(new Set()); fetchData();
  };
  const handleBatchSponsor = async (sponsored: boolean) => {
    for (const id of Array.from(selectedToolIds)) {
      const tool = tools.find(t => t.id === id);
      if (!tool) continue;
      await fetch(`/api/admin/tools/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...tool, tags: Array.isArray(tool.tags) ? tool.tags : [], isSponsored: sponsored }) });
    }
    setSelectedToolIds(new Set()); fetchData();
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input type="text" placeholder="搜索工具名称..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-56 px-4 py-2 bg-white border border-[#d2d2d7] rounded-[10px] outline-none text-sm" />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 bg-white border border-[#d2d2d7] rounded-[10px] outline-none text-sm text-[#6e6e73]">
          <option value="">全部分类</option>
          {categories.filter(c => !c.parentId).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <select value={filterSponsored} onChange={e => setFilterSponsored(e.target.value)} className="px-3 py-2 bg-white border border-[#d2d2d7] rounded-[10px] outline-none text-sm text-[#6e6e73]">
          <option value="">赞助状态</option>
          <option value="yes">仅赞助</option>
          <option value="no">非赞助</option>
        </select>
        {selectedToolIds.size > 0 && (
          <div className="flex gap-2 ml-auto items-center">
            <span className="text-sm text-[#86868b]">已选 {selectedToolIds.size} 项</span>
            <button onClick={() => handleBatchSponsor(true)} className="px-3 py-1.5 bg-[#0071e3]/10 text-[#0071e3] rounded-[8px] text-sm font-medium hover:bg-[#0071e3]/20">设为赞助</button>
            <button onClick={() => handleBatchSponsor(false)} className="px-3 py-1.5 bg-[#f5f5f7] text-[#6e6e73] rounded-[8px] text-sm font-medium hover:bg-[#e8e8ed]">取消赞助</button>
            <button onClick={handleBatchDelete} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-[8px] text-sm font-medium hover:bg-red-100">批量删除</button>
          </div>
        )}
        <button onClick={() => onOpenToolModal()} className="flex gap-2 px-4 py-2 bg-[#0071e3] text-white rounded-[8px] text-sm hover:bg-[#0077ED] ml-auto"><Plus className="w-4 h-4"/> 新增工具</button>
      </div>
      <div className="bg-white rounded-[20px] shadow-sm border border-[#e8e8ed] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#fcfcfc] border-b border-[#e8e8ed] text-[#86868b]">
              <th className="p-4 w-10"><input type="checkbox" checked={filteredToolsList.length > 0 && selectedToolIds.size === filteredToolsList.length} onChange={toggleSelectAll} className="w-4 h-4 accent-[#0071e3] cursor-pointer" /></th>
              <th className="p-4 font-medium">名称</th>
              <th className="p-4 font-medium">排位分</th>
              <th className="p-4 font-medium">分类</th>
              <th className="p-4 font-medium">浏览量</th>
              <th className="p-4 font-medium">赞助</th>
              <th className="p-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredToolsList.map(tool => (
              <tr key={tool.id} className={`border-b border-[#e8e8ed] hover:bg-[#f5f5f7] ${selectedToolIds.has(tool.id) ? "bg-[#0071e3]/[0.03]" : ""}`}>
                <td className="p-4"><input type="checkbox" checked={selectedToolIds.has(tool.id)} onChange={() => toggleSelectTool(tool.id)} className="w-4 h-4 accent-[#0071e3] cursor-pointer" /></td>
                <td className="p-4 font-medium">{tool.name} {tool.isSponsored && <CheckCircle2 className="w-4 h-4 inline text-[#0071e3] ml-1" />}</td>
                <td className="p-4 font-bold text-[#0071e3]">{tool.order || 0}</td>
                <td className="p-4 text-[#6e6e73]">{categories.find(c => c.id === tool.categoryId)?.name || '-'}</td>
                <td className="p-4 text-[#86868b] tabular-nums">{(tool.views || 0).toLocaleString()}</td>
                <td className="p-4">{tool.isSponsored ? <span className="text-[#0071e3] font-medium">是</span> : "否"}</td>
                <td className="p-4 text-right"><button onClick={() => onOpenToolModal(tool)} className="mr-3 text-[#0071e3] hover:underline">编辑</button><button onClick={() => onDelete("tools", tool.id)} className="text-red-500 hover:underline">删除</button></td>
              </tr>
            ))}
            {filteredToolsList.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-[#86868b]">没有匹配的工具</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[13px] text-[#86868b]">共 {filteredToolsList.length} / {tools.length} 个工具</p>
    </div>
  );
}
