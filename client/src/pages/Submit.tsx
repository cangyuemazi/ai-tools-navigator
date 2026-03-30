import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, UploadCloud, Loader2 } from "lucide-react";

export default function Submit() {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    contactInfo: "",
    logo: ""
  });
  const [agreed, setAgreed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      // 调用我们在安全防御阶段保留的公开上传接口
      const res = await fetch("/api/upload-public", {
        method: "POST",
        body: form
      });
      const data = await res.json();
      if (data.url) setFormData({ ...formData, logo: data.url });
      else alert("图片上传失败");
    } catch (err) {
      alert("网络错误，上传失败");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. 基础校验
    if (!formData.name || !formData.url) {
      setError("请填写工具名称和链接");
      return;
    }
    // 2. 法律合规校验
    if (!agreed) {
      setError("请先阅读并勾选同意用户协议");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      // 捕获后端的限流提示 (比如 "一小时只能提交5次") 或其他错误
      if (data.error) {
        setError(data.error); 
      } else {
        setSubmitted(true); // 成功！切换到成功画面
      }
    } catch (err) {
      setError("网络异常，提交失败，请稍后再试");
    }
    setSubmitting(false);
  };

  // 👇 商业级转化：优雅的提交成功反馈弹窗 👇
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-3">提交成功！</h2>
          <p className="text-[#86868b] text-[15px] leading-relaxed mb-8">
            感谢您提交 <strong>{formData.name}</strong>。<br/>
            我们的审核团队会尽快进行评估，审核通过后将自动展示在首页。
          </p>
          <Link href="/">
            <a className="inline-block w-full py-3.5 bg-[#f5f5f7] text-[#1d1d1f] font-medium rounded-[12px] hover:bg-[#e8e8ed] transition-colors">
              返回首页
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans selection:bg-[#0071e3]/20 pb-20">
      {/* 顶部导航 */}
      <header className="bg-white sticky top-0 z-30 border-b border-[#e8e8ed] px-6 py-4 flex items-center shadow-sm">
        <Link href="/">
          <a className="flex items-center gap-2 text-[#86868b] hover:text-[#0071e3] transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" /> 返回首页
          </a>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-6 mt-8">
        <div className="mb-10 text-center">
          <h1 className="text-[32px] font-semibold tracking-tight text-[#1d1d1f] mb-3">提交 AI 工具</h1>
          <p className="text-[16px] text-[#86868b]">与成千上万的探索者分享您的优秀产品</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#e8e8ed]">
          <div className="space-y-6">
            
            {/* 改进：允许客户自己上传产品 Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-[#f5f5f7] border border-[#d2d2d7] border-dashed rounded-[20px] flex flex-col items-center justify-center mb-3 overflow-hidden relative group">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-2 bg-white" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-[#86868b] mb-2 group-hover:text-[#0071e3] transition-colors" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#0071e3] animate-spin" />
                  </div>
                )}
              </div>
              <label className="text-[#0071e3] text-[15px] font-medium cursor-pointer hover:underline">
                上传产品 Logo (可选)
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">产品名称 <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="例如：ChatGPT" className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all text-[15px]" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">网站链接 <span className="text-red-500">*</span></label>
                <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://" className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all text-[15px]" />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">一句话简介</label>
              <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="用最简短的话描述产品的核心功能..." className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all text-[15px]" />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">联系方式 (仅管理员可见)</label>
              <input type="text" value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} placeholder="您的微信或邮箱，方便我们通知您审核结果" className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all text-[15px]" />
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-[14px] rounded-[8px] border border-red-100">{error}</div>}

            {/* 合规校验：同意服务条款复选框 */}
            <div className="pt-4 pb-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="peer w-5 h-5 appearance-none border-[1.5px] border-[#d2d2d7] rounded-[6px] checked:bg-[#0071e3] checked:border-[#0071e3] transition-colors cursor-pointer" />
                  <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[13px] text-[#86868b] leading-relaxed select-none">
                  我已阅读并同意 
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] hover:underline mx-1">《提交服务协议》</a>
                  和 
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] hover:underline mx-1">《隐私政策》</a>。我保证提交的内容不包含违法、违规信息。
                </span>
              </label>
            </div>

            <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#0071e3] text-white font-medium rounded-[12px] hover:bg-[#0077ED] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> 正在提交...</> : "提交审核"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}