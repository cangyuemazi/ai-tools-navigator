import { useState } from "react";
import Layout from "@/components/Layout";
import { Send, CheckCircle2, Sparkles, Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function Submit() {
  const [formData, setFormData] = useState({ name: "", url: "", description: "", contactInfo: "", logo: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload-public", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) setFormData({ ...formData, logo: data.url });
    } catch (err) { alert("图片上传失败"); }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return alert("请填写工具名称和链接");
    
    setLoading(true);
    try {
      const res = await fetch("/api/submit-tool", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
      });
      if (res.ok) setSubmitted(true);
      else alert("提交失败，请重试");
    } catch (err) { alert("网络连接出错"); }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[16px] bg-gradient-to-br from-[#0071e3] to-[#42a1ff] text-white shadow-lg mb-6"><Send className="w-8 h-8 ml-1" /></div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] mb-4">提交您的 AI 工具</h1>
            <p className="text-[16px] text-[#86868b] leading-relaxed">让优质的工具被更多人看见。提交后，我们的编辑团队将进行审核。</p>
          </div>

          {submitted ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[24px] p-10 text-center shadow-[0_12px_28px_rgba(0,0,0,0.06)] border border-[#e8e8ed]">
              <CheckCircle2 className="w-16 h-16 text-[#34c759] mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">提交成功！</h2>
              <p className="text-[#86868b] mb-8">您的工具资料已进入审核队列，请留意您留下的联系方式。</p>
              <button onClick={() => { setSubmitted(false); setFormData({ name: "", url: "", description: "", contactInfo: "", logo: "" }); }} className="px-6 py-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-[12px] font-medium transition-colors">继续提交</button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-[24px] p-6 md:p-10 shadow-[0_12px_28px_rgba(0,0,0,0.04)] border border-[#e8e8ed]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">产品名称 <span className="text-red-500">*</span></label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0071e3]" /></div>
                  <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">产品链接 (URL) <span className="text-red-500">*</span></label><input type="url" required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0071e3]" /></div>
                </div>

                {/* 👇 新增 Logo 上传 */}
                <div>
                  <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">产品 Logo 图标 (可选)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[12px] bg-[#f5f5f7] border border-[#d2d2d7] flex items-center justify-center overflow-hidden shrink-0">
                      {formData.logo ? <img src={formData.logo} className="w-full h-full object-contain p-1" /> : <span className="text-xs text-[#86868b]">暂无</span>}
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-[10px] cursor-pointer text-sm font-medium hover:bg-[#f5f5f7] transition-colors text-[#1d1d1f]">
                      <Upload className="w-4 h-4" /> {uploading ? "上传中..." : "上传本地 Logo"}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                </div>

                <div><label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">一句话简介</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0071e3] min-h-[80px]" /></div>
                <div className="p-5 bg-[#0071e3]/[0.03] border border-[#0071e3]/10 rounded-[16px]"><label className="flex items-center gap-2 text-[14px] font-semibold text-[#0071e3] mb-2"><Sparkles className="w-4 h-4" /> 联系方式 (微信号/邮箱)</label><p className="text-[13px] text-[#86868b] mb-3">方便我们审核通过后通知您，或商讨优先展示/置顶服务。</p><input type="text" value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} placeholder="微信号或邮箱 (强烈建议填写)" className="w-full px-4 py-3 bg-white border border-[#d2d2d7] rounded-[12px] focus:outline-none focus:border-[#0071e3]" /></div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-[12px] font-semibold text-[16px] transition-colors disabled:opacity-50 shadow-md">{loading ? "提交中..." : "提交审核"}</button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}