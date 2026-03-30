import { useState, useEffect, useMemo } from "react";
import { LogIn, Plus, Pencil, Trash2, LogOut, Settings, Box, LayoutGrid, ClipboardList, CheckCircle2 } from "lucide-react";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("tools");
  const [tools, setTools] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  // 👇 状态里加入了 termsText 和 privacyText
  const [siteSettings, setSiteSettings] = useState({ name: "", logo: "", favicon: "", titleFontSize: 17, backgroundColor: "#f5f5f7", companyIntro: "", icp: "", email: "", termsText: "", privacyText: "" });
  const [pendingTools, setPendingTools] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [toolForm, setToolForm] = useState({ name: "", description: "", url: "", logo: "", categoryId: "", subCategoryId: "", tags: "", isSponsored: false, sponsorExpiry: "", order: 0 });
  const [pendingIdToResolve, setPendingIdToResolve] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [catForm, setCatForm] = useState({ name: "", parentId: "", icon: "Box" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (token) fetchData(); }, [token]);

  const handleLogin = async (e: React.FormEvent) => { e.preventDefault(); const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); if (res.ok) { setToken(password); localStorage.setItem("adminToken", password); } else alert("密码错误"); };

  const fetchData = async () => {
    try {
      const [tRes, cRes, sRes, pRes] = await Promise.all([
        fetch("/api/admin/tools", { headers: { Authorization: `Bearer ${token}` } }), fetch("/api/categories"), fetch("/api/settings"), fetch("/api/admin/pending-tools", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (tRes.status === 401) return setToken("");
      setTools(await tRes.json()); setCategories(await cRes.json()); 
      const settingsData = await sRes.json();
      // 确保如果是 null 则转为空字符串
      setSiteSettings({ ...settingsData, termsText: settingsData.termsText || "", privacyText: settingsData.privacyText || "" });
      setPendingTools(await pRes.json());
    } catch (err) {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true); const form = new FormData(); form.append("file", file);
    try { const res = await fetch("/api/admin/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form }); const data = await res.json(); if (data.url) setter(data.url); } catch (err) { alert("上传失败"); } setUploading(false);
  };

  const handleSaveTool = async () => {
    const method = editingTool ? "PUT" : "POST"; const url = editingTool ? `/api/admin/tools/${editingTool.id}` : "/api/admin/tools";
    await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...toolForm, tags: toolForm.tags.split(",").map(t => t.trim()).filter(Boolean) }) });
    if (pendingIdToResolve) await fetch(`/api/admin/pending-tools/${pendingIdToResolve}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setIsToolModalOpen(false); fetchData();
  };

  const handleSaveCat = async () => {
    const method = editingCat ? "PUT" : "POST"; const url = editingCat ? `/api/admin/categories/${editingCat.id}` : "/api/admin/categories";
    await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(catForm) });
    setIsCatModalOpen(false); fetchData();
  };

  const handleSaveSettings = async () => {
    await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(siteSettings) });
    alert("全站设置与法律协议已保存！");
  };

  const handleDelete = async (type: string, id: string) => { if (!confirm("确定执行此操作吗？不可恢复！")) return; await fetch(`/api/admin/${type}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); fetchData(); };

  const openToolModal = (tool: any = null) => {
    setPendingIdToResolve(null); setEditingTool(tool);
    if (tool) setToolForm({ ...tool, tags: tool.tags.join(", "), subCategoryId: tool.subCategoryId || "", sponsorExpiry: tool.sponsorExpiry?.split("T")[0] || "", order: tool.order || 0 });
    else setToolForm({ name: "", description: "", url: "", logo: "", categoryId: categories[0]?.id || "", subCategoryId: "", tags: "", isSponsored: false, sponsorExpiry: "", order: 0 });
    setIsToolModalOpen(true);
  };

  const approvePendingTool = (pending: any) => {
    setEditingTool(null); setPendingIdToResolve(pending.id);
    setToolForm({ name: pending.name, description: pending.description, url: pending.url, logo: pending.logo || "", categoryId: categories[0]?.id || "", subCategoryId: "", tags: "", isSponsored: false, sponsorExpiry: "", order: 0 });
    setIsToolModalOpen(true);
  };

  const openCatModal = (cat: any = null, parentId: string = "") => { setEditingCat(cat); setCatForm(cat ? { name: cat.name, parentId: cat.parentId || "", icon: cat.icon || "Box" } : { name: "", parentId, icon: "Box" }); setIsCatModalOpen(true); };

  const selectedCategoryObj = useMemo(() => categories.find(c => c.id === toolForm.categoryId), [toolForm.categoryId, categories]);

  if (!token) return (<div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center"><div className="bg-white p-8 rounded-[24px] shadow-lg w-full max-w-sm text-center"><h1 className="text-2xl font-semibold mb-6">管理控制台</h1><form onSubmit={handleLogin} className="space-y-4"><input type="password" placeholder="输入密码" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#f5f5f7] rounded-[12px] text-center" autoFocus /><button type="submit" className="w-full py-3 bg-[#0071e3] text-white rounded-[12px] font-medium">进入</button></form></div></div>);

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] pb-20">
      <header className="bg-white sticky top-0 z-30 border-b border-[#e8e8ed] px-6 py-4 flex justify-between items-center shadow-sm overflow-x-auto">
        <div className="flex gap-6 items-center whitespace-nowrap">
          <span className="font-semibold text-lg border-r pr-6 border-[#e8e8ed]">管理后台</span>
          <nav className="flex gap-2">
            {[{ id: 'pending', icon: ClipboardList, label: `审核中心 ${pendingTools.length > 0 ? `(${pendingTools.length})` : ''}` }, { id: 'tools', icon: Box, label: '工具管理' }, { id: 'categories', icon: LayoutGrid, label: '分类目录' }, { id: 'settings', icon: Settings, label: '全站高级设置' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'text-[#6e6e73] hover:bg-[#f5f5f7]'}`}><tab.icon className="w-4 h-4" /> {tab.label}</button>
            ))}
          </nav>
        </div>
        <button onClick={() => setToken("")} className="text-[#86868b] hover:text-[#1d1d1f] ml-4"><LogOut className="w-5 h-5" /></button>
      </header>

      <main className="max-w-[1100px] mx-auto p-6 mt-4">
        {activeTab === "pending" && (
          <div className="animate-in fade-in"><h2 className="text-xl font-semibold mb-6">客户提交审核池</h2><div className="bg-white rounded-[20px] shadow-sm border border-[#e8e8ed] overflow-hidden"><table className="w-full text-left text-sm"><thead><tr className="bg-[#fcfcfc] border-b border-[#e8e8ed] text-[#86868b]"><th className="p-4 font-medium">提交时间</th><th className="p-4 font-medium">Logo & 产品信息</th><th className="p-4 font-medium">联系方式</th><th className="p-4 text-right">操作</th></tr></thead><tbody>{pendingTools.length === 0 ? (<tr><td colSpan={4} className="p-8 text-center text-[#86868b]">目前没有待审核的工具</td></tr>) : pendingTools.map(item => (<tr key={item.id} className="border-b border-[#e8e8ed] hover:bg-[#f5f5f7]/50"><td className="p-4 text-[#86868b] whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</td><td className="p-4 flex items-center gap-3">{item.logo && <img src={item.logo} className="w-10 h-10 border rounded-md object-contain p-1 bg-white" />}<div><div className="font-medium text-[#1d1d1f] mb-1">{item.name}</div><a href={item.url} target="_blank" className="text-[#0071e3] hover:underline text-xs">{item.url}</a></div></td><td className="p-4"><span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 font-medium rounded-[6px] border border-green-200">{item.contactInfo || "无"}</span></td><td className="p-4 text-right"><button onClick={() => approvePendingTool(item)} className="mr-3 px-3 py-1.5 bg-[#0071e3] text-white rounded-[6px] hover:bg-[#0077ED] font-medium">收录</button><button onClick={() => handleDelete("pending-tools", item.id)} className="text-red-500 hover:underline">删除</button></td></tr>))}</tbody></table></div></div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white p-8 rounded-[20px] shadow-sm border border-[#e8e8ed] animate-in fade-in">
            <h2 className="text-xl font-semibold mb-6 text-[#1d1d1f]">全站视觉与品牌定制</h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">网站名称</label><input type="text" value={siteSettings.name} onChange={e => setSiteSettings({...siteSettings, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[10px] outline-none" /></div>
                <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">侧边栏网站名称字体大小</label><input type="number" value={siteSettings.titleFontSize} onChange={e => setSiteSettings({...siteSettings, titleFontSize: parseInt(e.target.value)})} className="w-full px-4 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[10px] outline-none" /></div>
                <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">网站全局背景颜色</label><input type="text" value={siteSettings.backgroundColor} onChange={e => setSiteSettings({...siteSettings, backgroundColor: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[10px] outline-none" /></div>
                <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">侧边栏网站 Logo</label><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-[12px] bg-[#f5f5f7] border flex items-center justify-center p-1">{siteSettings.logo ? <img src={siteSettings.logo} className="w-full h-full object-contain" /> : <span className="text-xs text-[#86868b]">无</span>}</div><label className="px-4 py-2 bg-white border border-[#d2d2d7] rounded-[8px] text-sm cursor-pointer hover:bg-[#f5f5f7]">{uploading ? "中..." : "上传Logo"}<input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, url => setSiteSettings({...siteSettings, logo: url}))} className="hidden" /></label></div></div>
                <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">浏览器标签页图标</label><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-[12px] bg-[#f5f5f7] border flex items-center justify-center p-1">{siteSettings.favicon ? <img src={siteSettings.favicon} className="w-full h-full object-contain" /> : <span className="text-xs text-[#86868b]">无</span>}</div><label className="px-4 py-2 bg-white border border-[#d2d2d7] rounded-[8px] text-sm cursor-pointer hover:bg-[#f5f5f7]">{uploading ? "中..." : "上传Favicon"}<input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, url => setSiteSettings({...siteSettings, favicon: url}))} className="hidden" /></label></div></div>
              </div>
              <div className="space-y-6">
                <div className="p-5 bg-[#f5f5f7] rounded-[16px] border border-[#e8e8ed]">
                  <h3 className="font-semibold text-[#1d1d1f] mb-4">页脚与联系信息</h3>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">公司/网站简介</label><textarea value={siteSettings.companyIntro} onChange={e => setSiteSettings({...siteSettings, companyIntro: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-[10px] outline-none min-h-[80px]" placeholder="用一句话介绍您的公司或网站使命..." /></div>
                    <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">联系邮箱</label><input type="text" value={siteSettings.email} onChange={e => setSiteSettings({...siteSettings, email: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-[10px] outline-none" placeholder="admin@example.com" /></div>
                    <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">工信部备案号</label><input type="text" value={siteSettings.icp} onChange={e => setSiteSettings({...siteSettings, icp: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-[10px] outline-none" placeholder="京ICP备12345678号" /></div>
                  </div>
                </div>

                {/* 👇 新增：协议配置大框 👇 */}
                <div className="p-5 bg-[#e6f0fa] rounded-[16px] border border-[#0071e3]/20">
                  <h3 className="font-semibold text-[#0071e3] mb-4">法律与合规协议 (支持直接换行排版)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] mb-2">《提交服务协议》内容</label>
                      <textarea value={siteSettings.termsText} onChange={e => setSiteSettings({...siteSettings, termsText: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-[#0071e3]/30 rounded-[10px] outline-none min-h-[120px]" placeholder="在此粘贴服务协议条款内容..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] mb-2">《隐私政策》内容</label>
                      <textarea value={siteSettings.privacyText} onChange={e => setSiteSettings({...siteSettings, privacyText: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-[#0071e3]/30 rounded-[10px] outline-none min-h-[120px]" placeholder="在此粘贴隐私政策条款内容..." />
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[#e8e8ed] flex justify-end">
              <button onClick={handleSaveSettings} className="px-8 py-3 bg-[#0071e3] text-white rounded-[12px] font-semibold hover:bg-[#0077ED] shadow-md transition-all">保存全部设置</button>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="bg-white rounded-[20px] shadow-sm border border-[#e8e8ed] p-6 animate-in fade-in"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-semibold">分类目录结构</h2><button onClick={() => openCatModal(null, "")} className="flex gap-2 px-4 py-2 bg-[#0071e3] text-white rounded-[8px] text-sm"><Plus className="w-4 h-4"/> 新增主分类</button></div><div className="space-y-4">{categories.map(cat => (<div key={cat.id} className="border border-[#e8e8ed] rounded-[12px] overflow-hidden"><div className="bg-[#fcfcfc] px-4 py-3 flex justify-between items-center border-b border-[#e8e8ed]"><span className="font-semibold text-[#1d1d1f]">{cat.name}</span><div className="flex gap-2"><button onClick={() => openCatModal(null, cat.id)} className="text-xs text-[#0071e3] hover:underline">添加子分类</button><button onClick={() => openCatModal(cat)} className="text-[#86868b] hover:text-[#0071e3]"><Pencil className="w-4 h-4"/></button><button onClick={() => handleDelete("categories", cat.id)} className="text-[#86868b] hover:text-red-500"><Trash2 className="w-4 h-4"/></button></div></div>{cat.children?.length > 0 && (<div className="p-4 flex flex-wrap gap-2 bg-white">{cat.children.map((sub: any) => (<div key={sub.id} className="flex items-center gap-2 px-3 py-1 bg-[#f5f5f7] rounded-full text-sm text-[#6e6e73]">{sub.name}<button onClick={() => openCatModal(sub, cat.id)} className="hover:text-[#0071e3]"><Pencil className="w-3 h-3"/></button><button onClick={() => handleDelete("categories", sub.id)} className="hover:text-red-500"><Trash2 className="w-3 h-3"/></button></div>))}</div>)}</div>))}</div></div>
        )}

        {activeTab === "tools" && (
          <div className="animate-in fade-in"><div className="flex justify-between items-center mb-6"><input type="text" placeholder="搜索已上线的工具..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-64 px-4 py-2 bg-white border border-[#d2d2d7] rounded-[10px] outline-none" /><button onClick={() => openToolModal()} className="flex gap-2 px-4 py-2 bg-[#0071e3] text-white rounded-[8px] text-sm hover:bg-[#0077ED]"><Plus className="w-4 h-4"/> 直接新增工具</button></div><div className="bg-white rounded-[20px] shadow-sm border border-[#e8e8ed] overflow-hidden"><table className="w-full text-left text-sm"><thead><tr className="bg-[#fcfcfc] border-b border-[#e8e8ed] text-[#86868b]"><th className="p-4 font-medium">名称</th><th className="p-4 font-medium">排位分</th><th className="p-4 font-medium">分类</th><th className="p-4 font-medium">赞助</th><th className="p-4 text-right">操作</th></tr></thead><tbody>{tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(tool => (<tr key={tool.id} className="border-b border-[#e8e8ed] hover:bg-[#f5f5f7]"><td className="p-4 font-medium">{tool.name} {tool.isSponsored && <CheckCircle2 className="w-4 h-4 inline text-[#0071e3]" />}</td><td className="p-4 font-bold text-[#0071e3]">{tool.order || 0}</td><td className="p-4 text-[#6e6e73]">{categories.find(c => c.id === tool.categoryId)?.name}</td><td className="p-4">{tool.isSponsored ? "是" : "否"}</td><td className="p-4 text-right"><button onClick={() => openToolModal(tool)} className="mr-3 text-[#0071e3] hover:underline">编辑</button><button onClick={() => handleDelete("tools", tool.id)} className="text-red-500 hover:underline">删除</button></td></tr>))}</tbody></table></div></div>
        )}
      </main>

      {/* 弹窗部分 */}
      {isCatModalOpen && (<div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center"><div className="bg-white p-6 rounded-[20px] w-[400px]"><h2 className="text-xl font-semibold mb-4">{editingCat ? "编辑分类" : "新增分类"}</h2><div className="space-y-4"><div><label className="block text-sm text-[#6e6e73] mb-1">分类名称</label><input type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-[8px]" /></div>{!catForm.parentId && <div><label className="block text-sm text-[#6e6e73] mb-1">图标</label><input type="text" value={catForm.icon} onChange={e => setCatForm({...catForm, icon: e.target.value})} className="w-full px-3 py-2 border rounded-[8px]" /></div>}</div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 bg-[#f5f5f7] rounded-[8px]">取消</button><button onClick={handleSaveCat} className="px-4 py-2 bg-[#0071e3] text-white rounded-[8px]">保存</button></div></div></div>)}
      {isToolModalOpen && (<div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4"><div className="bg-white p-6 rounded-[24px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"><h2 className="text-2xl font-semibold mb-6">{pendingIdToResolve ? "审核并正式收录" : (editingTool ? "编辑工具" : "新增工具")}</h2><div className="space-y-5"><div className="grid grid-cols-3 gap-4"><div className="col-span-2"><label className="block text-sm mb-1 text-[#6e6e73] font-medium">工具名称 *</label><input type="text" value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none" /></div><div><label className="block text-sm mb-1 text-[#0071e3] font-bold">排位分 (越高越前)</label><input type="number" value={toolForm.order} onChange={e => setToolForm({...toolForm, order: parseInt(e.target.value) || 0})} className="w-full px-3 py-2.5 bg-[#e6f0fa] border border-[#0071e3]/30 text-[#0071e3] font-bold rounded-[8px] outline-none" placeholder="0" /></div></div><div><label className="block text-sm mb-1 text-[#6e6e73] font-medium">链接 URL *</label><input type="text" value={toolForm.url} onChange={e => setToolForm({...toolForm, url: e.target.value})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm mb-1 text-[#6e6e73] font-medium">主分类 *</label><select value={toolForm.categoryId} onChange={e => setToolForm({...toolForm, categoryId: e.target.value, subCategoryId: ""})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none">{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>{selectedCategoryObj?.children?.length > 0 && (<div><label className="block text-sm mb-1 text-[#6e6e73] font-medium">子分类</label><select value={toolForm.subCategoryId} onChange={e => setToolForm({...toolForm, subCategoryId: e.target.value})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none"><option value="">(无)</option>{selectedCategoryObj.children.map((sub: any) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}</select></div>)}</div><div><label className="block text-sm mb-1 text-[#6e6e73] font-medium">一句话简介</label><textarea value={toolForm.description} onChange={e => setToolForm({...toolForm, description: e.target.value})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[8px] outline-none" /></div><div><label className="block text-sm mb-1 text-[#6e6e73] font-medium">Logo 图片</label><div className="flex gap-4 items-center"><div className="w-12 h-12 bg-[#f5f5f7] border rounded-[10px] flex items-center justify-center">{toolForm.logo ? <img src={toolForm.logo} className="w-full h-full object-contain p-1" /> : <span className="text-xs">无</span>}</div><input type="text" value={toolForm.logo} onChange={e => setToolForm({...toolForm, logo: e.target.value})} className="flex-1 px-3 py-2.5 bg-[#f5f5f7] border rounded-[8px]" /><label className="px-4 py-2.5 bg-white border rounded-[8px] cursor-pointer text-sm">{uploading ? "中..." : "上传"}<input type="file" accept="image/*" onChange={e => handleFileUpload(e, url => setToolForm({...toolForm, logo: url}))} className="hidden"/></label></div></div><div><label className="block text-sm mb-1 text-[#6e6e73] font-medium">标签 (逗号分隔)</label><input type="text" value={toolForm.tags} onChange={e => setToolForm({...toolForm, tags: e.target.value})} className="w-full px-3 py-2.5 bg-[#f5f5f7] border rounded-[8px]" /></div><div className="p-4 bg-[#0071e3]/[0.03] border border-[#0071e3]/20 rounded-[12px]"><label className="flex items-center gap-2 font-semibold cursor-pointer"><input type="checkbox" checked={toolForm.isSponsored} onChange={e => setToolForm({...toolForm, isSponsored: e.target.checked})} className="w-4 h-4 accent-[#0071e3]" /> ⭐ 设为付费赞助优先展示</label>{toolForm.isSponsored && <input type="date" value={toolForm.sponsorExpiry} onChange={e => setToolForm({...toolForm, sponsorExpiry: e.target.value})} className="mt-3 px-3 py-1.5 border rounded-[6px] text-sm" />}</div></div><div className="mt-8 flex justify-end gap-3"><button onClick={() => setIsToolModalOpen(false)} className="px-5 py-2.5 bg-[#f5f5f7] rounded-[10px]">取消</button><button onClick={handleSaveTool} className="px-5 py-2.5 bg-[#0071e3] text-white rounded-[10px]">保存发布</button></div></div></div>)}
    </div>
  );
}