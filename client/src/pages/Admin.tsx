import { useState, useEffect, useMemo } from "react";
import { LogOut, Settings, Box, LayoutGrid, ClipboardList, BarChart3, FileText } from "lucide-react";

import EditableLogoField from "@/components/EditableLogoField";
import AdminDashboard from "./admin/AdminDashboard";
import AdminPending from "./admin/AdminPending";
import AdminSettings from "./admin/AdminSettings";
import AdminCategories from "./admin/AdminCategories";
import AdminTools from "./admin/AdminTools";
import AdminContent from "./admin/AdminContent";
import { cacheSiteSettings, fetchSiteSettings, getAdminDocumentTitle, readCachedSiteSettings, type SiteSettings } from "@/lib/site-settings";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tools, setTools] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => readCachedSiteSettings());
  const [pendingTools, setPendingTools] = useState<any[]>([]);

  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [toolForm, setToolForm] = useState({ name: "", description: "", url: "", logo: "", categoryId: "", subCategoryId: "", isSponsored: false, sponsorExpiry: "", order: 0 });
  const [toolLogoDirty, setToolLogoDirty] = useState(false);
  const [siteLogoDirty, setSiteLogoDirty] = useState(false);
  const [pendingIdToResolve, setPendingIdToResolve] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catForm, setCatForm] = useState({ name: "", parentId: "", icon: "Box" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (token) fetchData(); }, [token]);

  useEffect(() => {
    document.title = getAdminDocumentTitle(siteSettings);
  }, [siteSettings]);

  const handleLogin = async (e: React.FormEvent) => { e.preventDefault(); const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); if (res.ok) { const data = await res.json(); const jwtToken = data.token; setToken(jwtToken); localStorage.setItem("adminToken", jwtToken); } else alert("密码错误"); };

  const fetchData = async () => {
    try {
      const settingsRequest = fetchSiteSettings().catch((error) => {
        console.error("Failed to fetch site settings:", error);
        return null;
      });

      const [tRes, cRes, pRes, settingsData] = await Promise.all([
        fetch("/api/admin/tools", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/categories"),
        fetch("/api/admin/pending-tools", { headers: { Authorization: `Bearer ${token}` } }),
        settingsRequest,
      ]);
      if (tRes.status === 401) { setToken(""); localStorage.removeItem("adminToken"); return; }
      if (!tRes.ok || !cRes.ok || !pRes.ok) throw new Error("Failed to fetch admin data");

      const [toolsData, categoriesData, pendingToolsData] = await Promise.all([tRes.json(), cRes.json(), pRes.json()]);

      setTools(toolsData);
      setCategories(categoriesData);
      if (settingsData) setSiteSettings(settingsData);
      setPendingTools(pendingToolsData);
    } catch (err) { console.error("Failed to fetch admin data:", err); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true); const form = new FormData(); form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        alert(data.error || "上传失败");
        return;
      }
      setter(data.url);
    } catch (err) {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveTool = async () => {
    if (toolLogoDirty) {
      alert("Logo 已调整但还没有点击“保存 Logo”，请先保存后再发布工具。");
      return;
    }

    const method = editingTool ? "PUT" : "POST"; const url = editingTool ? `/api/admin/tools/${editingTool.id}` : "/api/admin/tools";
    await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...toolForm, tags: [] }) });
    if (pendingIdToResolve) await fetch(`/api/admin/pending-tools/${pendingIdToResolve}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setIsToolModalOpen(false); fetchData();
  };

  const handleSaveCat = async () => {
    const method = editingCat ? "PUT" : "POST"; const url = editingCat ? `/api/admin/categories/${editingCat.id}` : "/api/admin/categories";
    await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(catForm) });
    setIsCatModalOpen(false); fetchData();
  };

  const handleSaveSettings = async () => {
    if (siteLogoDirty) {
      alert("网站 Logo 已调整但还没有点击“保存 Logo”，请先保存 Logo 再保存站点设置。");
      return;
    }

    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(siteSettings) });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        alert(`保存失败：${payload?.error || "服务器错误，请检查后重试"}`);
        return;
      }
      if (payload) setSiteSettings(cacheSiteSettings(payload));
      alert("全站设置与法律协议已保存！");
    } catch (e) {
      alert("保存失败：网络错误，请检查连接后重试");
    }
  };

  const handleDelete = async (type: string, id: string) => { if (!confirm("确定执行此操作吗？不可恢复！")) return; await fetch(`/api/admin/${type}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); fetchData(); };

  const openToolModal = (tool: any = null) => {
    setPendingIdToResolve(null); setEditingTool(tool);
    setToolLogoDirty(false);
    if (tool) setToolForm({ ...tool, subCategoryId: tool.subCategoryId || "", sponsorExpiry: tool.sponsorExpiry?.split("T")[0] || "", order: tool.order || 0 });
    else setToolForm({ name: "", description: "", url: "", logo: "", categoryId: categories[0]?.id || "", subCategoryId: "", isSponsored: false, sponsorExpiry: "", order: 0 });
    setIsToolModalOpen(true);
  };

  const approvePendingTool = (pending: any) => {
    setEditingTool(null); setPendingIdToResolve(pending.id);
    setToolLogoDirty(false);
    setToolForm({ name: pending.name, description: pending.description, url: pending.url, logo: pending.logo || "", categoryId: pending.categoryId || categories[0]?.id || "", subCategoryId: pending.subCategoryId || "", isSponsored: false, sponsorExpiry: "", order: 0 });
    setIsToolModalOpen(true);
  };

  const openCatModal = (cat: any = null, parentId: string = "") => { setEditingCat(cat); setCatForm(cat ? { name: cat.name, parentId: cat.parentId || "", icon: cat.icon || "Box" } : { name: "", parentId, icon: "Box" }); setIsCatModalOpen(true); };

  const moveCategory = async (parentId: string | null, categoryId: string, direction: "up" | "down") => {
    const siblings = parentId ? (categories.find((category: any) => category.id === parentId)?.children || []) : categories;
    const currentIndex = siblings.findIndex((category: any) => category.id === categoryId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= siblings.length) return;

    const orderedIds = siblings.map((category: any) => category.id);
    [orderedIds[currentIndex], orderedIds[targetIndex]] = [orderedIds[targetIndex], orderedIds[currentIndex]];

    await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ parentId, orderedIds })
    });
    fetchData();
  };

  const selectedCategoryObj = useMemo(() => categories.find(c => c.id === toolForm.categoryId), [toolForm.categoryId, categories]);

  if (!token) return (<div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center"><div className="bg-white p-8 rounded-[24px] shadow-lg w-full max-w-sm text-center"><h1 className="text-2xl font-semibold mb-6">管理控制台</h1><form onSubmit={handleLogin} className="space-y-4"><input type="password" placeholder="输入密码" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#f5f5f7] rounded-[12px] text-center" autoFocus /><button type="submit" className="w-full py-3 bg-[#0071e3] text-white rounded-[12px] font-medium">进入</button></form></div></div>);

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] pb-20">
      <header className="bg-white sticky top-0 z-30 border-b border-[#e8e8ed] px-6 py-4 flex justify-between items-center shadow-sm overflow-x-auto">
        <div className="flex gap-6 items-center whitespace-nowrap">
          <span className="font-semibold text-lg border-r pr-6 border-[#e8e8ed]">管理后台</span>
          <nav className="flex gap-2">
            {[{ id: 'dashboard', icon: BarChart3, label: '数据概览' }, { id: 'pending', icon: ClipboardList, label: `审核中心 ${pendingTools.length > 0 ? `(${pendingTools.length})` : ''}` }, { id: 'tools', icon: Box, label: '工具管理' }, { id: 'categories', icon: LayoutGrid, label: '分类目录' }, { id: 'settings', icon: Settings, label: '全站高级设置' }, { id: 'content', icon: FileText, label: '其他内容修改' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'text-[#6e6e73] hover:bg-[#f5f5f7]'}`}><tab.icon className="w-4 h-4" /> {tab.label}</button>
            ))}
          </nav>
        </div>
        <button onClick={() => { setToken(""); localStorage.removeItem("adminToken"); }} className="text-[#86868b] hover:text-[#1d1d1f] ml-4"><LogOut className="w-5 h-5" /></button>
      </header>

      <main className="max-w-[1100px] mx-auto p-6 mt-4">
        {activeTab === "dashboard" && <AdminDashboard tools={tools} categories={categories} pendingTools={pendingTools} />}
        {activeTab === "pending" && <AdminPending pendingTools={pendingTools} categories={categories} onApprove={approvePendingTool} onDelete={handleDelete} />}
        {activeTab === "settings" && <AdminSettings siteSettings={siteSettings} setSiteSettings={setSiteSettings} token={token} uploading={uploading} siteLogoDirty={siteLogoDirty} setSiteLogoDirty={setSiteLogoDirty} onSave={handleSaveSettings} onFileUpload={handleFileUpload} />}
        {activeTab === "categories" && <AdminCategories categories={categories} onOpenCatModal={openCatModal} onDelete={handleDelete} onMoveCategory={moveCategory} />}
        {activeTab === "tools" && <AdminTools tools={tools} categories={categories} token={token} onOpenToolModal={openToolModal} onDelete={handleDelete} fetchData={fetchData} />}
        {activeTab === "content" && <AdminContent siteSettings={siteSettings} setSiteSettings={setSiteSettings} onSave={handleSaveSettings} />}
      </main>

      {isCatModalOpen && (<div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center"><div className="bg-white p-6 rounded-[20px] w-[400px]"><h2 className="text-xl font-semibold mb-4">{editingCat ? "编辑分类" : "新增分类"}</h2><div className="space-y-4"><div><label className="block text-sm text-[#6e6e73] mb-1">分类名称</label><input type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-[8px]" /></div>{!catForm.parentId && <div><label className="block text-sm text-[#6e6e73] mb-1">图标</label><input type="text" value={catForm.icon} onChange={e => setCatForm({...catForm, icon: e.target.value})} className="w-full px-3 py-2 border rounded-[8px]" /></div>}</div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 bg-[#f5f5f7] rounded-[8px]">取消</button><button onClick={handleSaveCat} className="px-4 py-2 bg-[#0071e3] text-white rounded-[8px]">保存</button></div></div></div>)}
      {isToolModalOpen && (<div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4"><div className="bg-white p-6 rounded-[24px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"><h2 className="text-2xl font-semibold mb-6">{pendingIdToResolve ? "审核并正式收录" : (editingTool ? "编辑工具" : "新增工具")}</h2><div className="space-y-5"><div className="grid grid-cols-3 gap-4"><div className="col-span-2"><label className="block text-sm mb-1 text-[#6e6e73] font-medium">工具名称 *</label><input type="text" value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none" /></div><div><label className="block text-sm mb-1 text-[#0071e3] font-bold">排位分 (越高越前)</label><input type="number" value={toolForm.order} onChange={e => setToolForm({...toolForm, order: parseInt(e.target.value) || 0})} className="w-full px-3 py-2.5 bg-[#e6f0fa] border border-[#0071e3]/30 text-[#0071e3] font-bold rounded-[8px] outline-none" placeholder="0" /></div></div><div><label className="block text-sm mb-1 text-[#6e6e73] font-medium">链接 URL *</label><input type="text" value={toolForm.url} onChange={e => setToolForm({...toolForm, url: e.target.value})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm mb-1 text-[#6e6e73] font-medium">主分类 *</label><select value={toolForm.categoryId} onChange={e => setToolForm({...toolForm, categoryId: e.target.value, subCategoryId: ""})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none">{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>{selectedCategoryObj?.children?.length > 0 && (<div><label className="block text-sm mb-1 text-[#6e6e73] font-medium">子分类</label><select value={toolForm.subCategoryId} onChange={e => setToolForm({...toolForm, subCategoryId: e.target.value})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none"><option value="">(无)</option>{selectedCategoryObj.children.map((sub: any) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}</select></div>)}</div><div><label className="block text-sm mb-1 text-[#6e6e73] font-medium">一句话简介</label><textarea value={toolForm.description} onChange={e => setToolForm({...toolForm, description: e.target.value})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none" /></div><div><label className="block text-sm mb-2 text-[#6e6e73] font-medium">Logo 图片</label><EditableLogoField key={`tool-logo-${editingTool?.id || pendingIdToResolve || 'new'}`} value={toolForm.logo} onChange={(logo) => setToolForm({...toolForm, logo})} uploadUrl="/api/admin/upload" uploadHeaders={{ Authorization: `Bearer ${token}` }} frameSize={112} frameClassName="rounded-[20px]" controlsClassName="bg-white" helperText="上传本地图片后，可在当前 Logo 框内拖动和缩放，点击保存 Logo 后再发布。" onDirtyChange={setToolLogoDirty} /></div><div className="p-4 bg-[#0071e3]/[0.03] border border-[#0071e3]/20 rounded-[12px]"><label className="flex items-center gap-2 font-semibold cursor-pointer"><input type="checkbox" checked={toolForm.isSponsored} onChange={e => setToolForm({...toolForm, isSponsored: e.target.checked})} className="w-4 h-4 accent-[#0071e3]" /> ⭐ 设为付费赞助优先展示</label>{toolForm.isSponsored && <input type="date" value={toolForm.sponsorExpiry} onChange={e => setToolForm({...toolForm, sponsorExpiry: e.target.value})} className="mt-3 px-3 py-1.5 border rounded-[6px] text-sm" />}</div></div><div className="mt-8 flex justify-end gap-3"><button onClick={() => setIsToolModalOpen(false)} className="px-5 py-2.5 bg-[#f5f5f7] rounded-[10px]">取消</button><button onClick={handleSaveTool} className="px-5 py-2.5 bg-[#0071e3] text-white rounded-[10px]">保存发布</button></div></div></div>)}
    </div>
  );
}