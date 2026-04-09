import { useState, useEffect } from "react";
import { LogOut, Settings, Box, LayoutGrid, ClipboardList, BarChart3, FileText, Plus, Minus } from "lucide-react";
import EditableLogoField from "@/components/EditableLogoField";
import AdminDashboard from "./admin/AdminDashboard";
import AdminPending from "./admin/AdminPending";
import AdminSettings from "./admin/AdminSettings";
import AdminCategories from "./admin/AdminCategories";
import AdminTools from "./admin/AdminTools";
import AdminPageEditor from "./admin/AdminPageEditor";
import { cacheSiteSettings, fetchSiteSettings, getAdminDocumentTitle, readCachedSiteSettings, type SiteSettings } from "@/lib/site-settings";
import type { ToolCategoryAssignment } from "@/types";

type ToolFormState = {
  name: string;
  description: string;
  url: string;
  logo: string;
  categoryAssignments: ToolCategoryAssignment[];
  isSponsored: boolean;
  sponsorExpiry: string;
  order: number;
};

const emptyToolForm = (categories: any[]): ToolFormState => ({
  name: "",
  description: "",
  url: "",
  logo: "",
  categoryAssignments: categories[0] ? [{ categoryId: categories[0].id, subCategoryId: null }] : [],
  isSponsored: false,
  sponsorExpiry: "",
  order: 0,
});

const normalizeToolAssignments = (tool: any, categories: any[]): ToolCategoryAssignment[] => {
  if (Array.isArray(tool?.categoryAssignments) && tool.categoryAssignments.length > 0) {
    return tool.categoryAssignments.map((assignment: any) => ({
      categoryId: assignment.categoryId,
      subCategoryId: assignment.subCategoryId || null,
    }));
  }

  if (tool?.categoryId) {
    return [{ categoryId: tool.categoryId, subCategoryId: tool.subCategoryId || null }];
  }

  return emptyToolForm(categories).categoryAssignments;
};

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
  const [toolForm, setToolForm] = useState<ToolFormState>(emptyToolForm([]));
  const [toolLogoDirty, setToolLogoDirty] = useState(false);
  const [siteLogoDirty, setSiteLogoDirty] = useState(false);
  const [pendingIdToResolve, setPendingIdToResolve] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catForm, setCatForm] = useState({ name: "", parentId: "", icon: "Box" });
  const [uploading, setUploading] = useState(false);
  const [savingTool, setSavingTool] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    document.title = getAdminDocumentTitle(siteSettings);
  }, [siteSettings]);

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

      if (tRes.status === 401) {
        setToken("");
        localStorage.removeItem("adminToken");
        return;
      }
      if (!tRes.ok || !cRes.ok || !pRes.ok) throw new Error("Failed to fetch admin data");

      const [toolsData, categoriesData, pendingToolsData] = await Promise.all([tRes.json(), cRes.json(), pRes.json()]);
      setTools(toolsData);
      setCategories(categoriesData);
      setPendingTools(pendingToolsData);
      if (settingsData) setSiteSettings(settingsData);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem("adminToken", data.token);
      return;
    }

    alert("密码错误");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        alert(data.error || "上传失败");
        return;
      }
      setter(data.url);
    } catch {
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
    if (!toolForm.categoryAssignments.length) {
      alert("至少需要保留一个分类");
      return;
    }

    setSavingTool(true);
    try {
      const method = editingTool ? "PUT" : "POST";
      const url = editingTool ? `/api/admin/tools/${editingTool.id}` : "/api/admin/tools";
      const payload = { ...toolForm, tags: [] };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "保存失败");
        return;
      }
      if (pendingIdToResolve) {
        await fetch(`/api/admin/pending-tools/${pendingIdToResolve}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      }
      setIsToolModalOpen(false);
      fetchData();
    } catch {
      alert("保存失败：网络错误");
    } finally {
      setSavingTool(false);
    }
  };

  const handleSaveCat = async () => {
    setSavingCat(true);
    try {
      const method = editingCat ? "PUT" : "POST";
      const url = editingCat ? `/api/admin/categories/${editingCat.id}` : "/api/admin/categories";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(catForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "保存失败");
        return;
      }
      setIsCatModalOpen(false);
      fetchData();
    } catch {
      alert("保存失败：网络错误");
    } finally {
      setSavingCat(false);
    }
  };

  const handleSaveSettings = async () => {
    if (siteLogoDirty) {
      alert("网站 Logo 已调整但还没有点击“保存 Logo”，请先保存 Logo 再保存站点设置。");
      return;
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(siteSettings),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        alert(payload?.error || "保存失败");
        return;
      }
      if (payload) setSiteSettings(cacheSiteSettings(payload));
      alert("全站设置已保存");
    } catch {
      alert("保存失败：网络错误");
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm("确定执行此操作吗？不可恢复！")) return;
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "删除失败");
        return;
      }
      fetchData();
    } catch {
      alert("删除失败：网络错误");
    }
  };

  const openToolModal = (tool: any = null) => {
    setPendingIdToResolve(null);
    setEditingTool(tool);
    setToolLogoDirty(false);
    if (tool) {
      setToolForm({
        name: tool.name,
        description: tool.description,
        url: tool.url,
        logo: tool.logo || "",
        categoryAssignments: normalizeToolAssignments(tool, categories),
        isSponsored: Boolean(tool.isSponsored),
        sponsorExpiry: tool.sponsorExpiry?.split("T")[0] || "",
        order: tool.order || 0,
      });
    } else {
      setToolForm(emptyToolForm(categories));
    }
    setIsToolModalOpen(true);
  };

  const approvePendingTool = (pending: any) => {
    setEditingTool(null);
    setPendingIdToResolve(pending.id);
    setToolLogoDirty(false);
    setToolForm({
      name: pending.name,
      description: pending.description,
      url: pending.url,
      logo: pending.logo || "",
      categoryAssignments: pending.categoryId
        ? [{ categoryId: pending.categoryId, subCategoryId: pending.subCategoryId || null }]
        : emptyToolForm(categories).categoryAssignments,
      isSponsored: false,
      sponsorExpiry: "",
      order: 0,
    });
    setIsToolModalOpen(true);
  };

  const openCatModal = (cat: any = null, parentId = "") => {
    setEditingCat(cat);
    setCatForm(cat ? { name: cat.name, parentId: cat.parentId || "", icon: cat.icon || "Box" } : { name: "", parentId, icon: "Box" });
    setIsCatModalOpen(true);
  };

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
      body: JSON.stringify({ parentId, orderedIds }),
    });
    fetchData();
  };

  const updateAssignment = (index: number, nextValue: Partial<ToolCategoryAssignment>) => {
    setToolForm((current) => ({
      ...current,
      categoryAssignments: current.categoryAssignments.map((assignment, assignmentIndex) => {
        if (assignmentIndex !== index) return assignment;
        const nextCategoryId = nextValue.categoryId ?? assignment.categoryId;
        const nextSubCategoryId = nextValue.categoryId && nextValue.categoryId !== assignment.categoryId
          ? null
          : nextValue.subCategoryId ?? assignment.subCategoryId;
        return { categoryId: nextCategoryId, subCategoryId: nextSubCategoryId };
      }),
    }));
  };

  const addAssignment = () => {
    setToolForm((current) => ({
      ...current,
      categoryAssignments: [
        ...current.categoryAssignments,
        categories[0] ? { categoryId: categories[0].id, subCategoryId: null } : { categoryId: "", subCategoryId: null },
      ],
    }));
  };

  const removeAssignment = (index: number) => {
    setToolForm((current) => {
      if (current.categoryAssignments.length <= 1) return current;
      return {
        ...current,
        categoryAssignments: current.categoryAssignments.filter((_, assignmentIndex) => assignmentIndex !== index),
      };
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="bg-white p-8 rounded-[24px] shadow-lg w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold mb-6">管理后台</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="输入密码" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#f5f5f7] rounded-[12px] text-center" autoFocus />
            <button type="submit" className="w-full py-3 bg-[#0071e3] text-white rounded-[12px] font-medium">进入</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] pb-20">
      <header className="bg-white sticky top-0 z-30 border-b border-[#e8e8ed] px-6 py-4 flex justify-between items-center shadow-sm overflow-x-auto">
        <div className="flex gap-6 items-center whitespace-nowrap">
          <span className="font-semibold text-lg border-r pr-6 border-[#e8e8ed]">管理后台</span>
          <nav className="flex gap-2">
            {[
              { id: "dashboard", icon: BarChart3, label: "数据概览" },
              { id: "pending", icon: ClipboardList, label: `审核中心 ${pendingTools.length > 0 ? `(${pendingTools.length})` : ""}` },
              { id: "tools", icon: Box, label: "工具管理" },
              { id: "categories", icon: LayoutGrid, label: "分类目录" },
              { id: "settings", icon: Settings, label: "全站高级设置" },
              { id: "content", icon: FileText, label: "页面编辑" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-[#0071e3]/10 text-[#0071e3]" : "text-[#6e6e73] hover:bg-[#f5f5f7]"}`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={() => { setToken(""); localStorage.removeItem("adminToken"); }} className="text-[#86868b] hover:text-[#1d1d1f] ml-4">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-[1100px] mx-auto p-6 mt-4">
        {activeTab === "dashboard" && <AdminDashboard tools={tools} categories={categories} pendingTools={pendingTools} />}
        {activeTab === "pending" && <AdminPending pendingTools={pendingTools} categories={categories} onApprove={approvePendingTool} onDelete={handleDelete} />}
        {activeTab === "settings" && <AdminSettings siteSettings={siteSettings} setSiteSettings={setSiteSettings} token={token} uploading={uploading} siteLogoDirty={siteLogoDirty} setSiteLogoDirty={setSiteLogoDirty} onSave={handleSaveSettings} onFileUpload={handleFileUpload} />}
        {activeTab === "categories" && <AdminCategories categories={categories} onOpenCatModal={openCatModal} onDelete={handleDelete} onMoveCategory={moveCategory} />}
        {activeTab === "tools" && <AdminTools tools={tools} categories={categories} token={token} onOpenToolModal={openToolModal} onDelete={handleDelete} fetchData={fetchData} />}
        {activeTab === "content" && <AdminPageEditor siteSettings={siteSettings} setSiteSettings={setSiteSettings} token={token} onSave={handleSaveSettings} />}
      </main>

      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-[20px] w-[400px]">
            <h2 className="text-xl font-semibold mb-4">{editingCat ? "编辑分类" : "新增分类"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#6e6e73] mb-1">分类名称</label>
                <input type="text" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-[8px]" />
              </div>
              {!catForm.parentId && (
                <div>
                  <label className="block text-sm text-[#6e6e73] mb-1">图标</label>
                  <input type="text" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} className="w-full px-3 py-2 border rounded-[8px]" />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 bg-[#f5f5f7] rounded-[8px]">取消</button>
              <button onClick={handleSaveCat} disabled={savingCat} className="px-4 py-2 bg-[#0071e3] text-white rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed">{savingCat ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </div>
      )}

      {isToolModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-[24px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6">{pendingIdToResolve ? "审核并正式收录" : editingTool ? "编辑工具" : "新增工具"}</h2>
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm mb-1 text-[#6e6e73] font-medium">工具名称 *</label>
                  <input type="text" value={toolForm.name} onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[#0071e3] font-bold">排位分 (越高越前)</label>
                  <input type="number" value={toolForm.order} onChange={(e) => setToolForm({ ...toolForm, order: parseInt(e.target.value, 10) || 0 })} className="w-full px-3 py-2.5 bg-[#e6f0fa] border border-[#0071e3]/30 text-[#0071e3] font-bold rounded-[8px] outline-none" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 text-[#6e6e73] font-medium">链接 URL *</label>
                <input type="text" value={toolForm.url} onChange={(e) => setToolForm({ ...toolForm, url: e.target.value })} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-[#6e6e73] font-medium">主分类 / 子分类 *</label>
                  <button type="button" onClick={addAssignment} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-[#0071e3]/10 text-[#0071e3] text-sm font-medium hover:bg-[#0071e3]/20">
                    <Plus className="w-4 h-4" /> 添加分类
                  </button>
                </div>

                {toolForm.categoryAssignments.map((assignment, index) => {
                  const selectedCategory = categories.find((category: any) => category.id === assignment.categoryId);
                  return (
                    <div key={`${assignment.categoryId}-${assignment.subCategoryId || "none"}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end p-3 rounded-[12px] border border-[#e8e8ed] bg-[#fafafa]">
                      <div>
                        <label className="block text-xs mb-1 text-[#86868b] font-medium">主分类</label>
                        <select value={assignment.categoryId} onChange={(e) => updateAssignment(index, { categoryId: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-[#d2d2d7] rounded-[8px] outline-none">
                          {categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-[#86868b] font-medium">子分类</label>
                        <select value={assignment.subCategoryId || ""} onChange={(e) => updateAssignment(index, { subCategoryId: e.target.value || null })} className="w-full px-3 py-2.5 bg-white border border-[#d2d2d7] rounded-[8px] outline-none">
                          <option value="">(无)</option>
                          {selectedCategory?.children?.map((sub: any) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={addAssignment} className="w-10 h-10 rounded-[10px] bg-white border border-[#d2d2d7] flex items-center justify-center text-[#0071e3] hover:border-[#0071e3]">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => removeAssignment(index)} disabled={toolForm.categoryAssignments.length <= 1} className="w-10 h-10 rounded-[10px] bg-white border border-[#d2d2d7] flex items-center justify-center text-red-500 hover:border-red-400 disabled:opacity-40 disabled:cursor-not-allowed">
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-sm mb-1 text-[#6e6e73] font-medium">一句话简介</label>
                <textarea value={toolForm.description} onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none" />
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#6e6e73] font-medium">Logo 图片</label>
                <EditableLogoField
                  key={`tool-logo-${editingTool?.id || pendingIdToResolve || "new"}`}
                  value={toolForm.logo}
                  onChange={(logo) => setToolForm({ ...toolForm, logo })}
                  uploadUrl="/api/admin/upload"
                  uploadHeaders={{ Authorization: `Bearer ${token}` }}
                  frameSize={112}
                  frameClassName="rounded-[20px]"
                  controlsClassName="bg-white"
                  helperText="上传本地图片后，可在当前 Logo 框内拖动和缩放，点击保存 Logo 后再发布。"
                  onDirtyChange={setToolLogoDirty}
                />
              </div>

              <div className="p-4 bg-[#0071e3]/[0.03] border border-[#0071e3]/20 rounded-[12px]">
                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                  <input type="checkbox" checked={toolForm.isSponsored} onChange={(e) => setToolForm({ ...toolForm, isSponsored: e.target.checked })} className="w-4 h-4 accent-[#0071e3]" />
                  设为热门工具优先展示
                </label>
                {toolForm.isSponsored && (
                  <input type="date" value={toolForm.sponsorExpiry} onChange={(e) => setToolForm({ ...toolForm, sponsorExpiry: e.target.value })} className="mt-3 px-3 py-1.5 border rounded-[6px] text-sm" />
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsToolModalOpen(false)} className="px-5 py-2.5 bg-[#f5f5f7] rounded-[10px]">取消</button>
              <button onClick={handleSaveTool} disabled={savingTool} className="px-5 py-2.5 bg-[#0071e3] text-white rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed">{savingTool ? "保存中..." : "保存发布"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
