import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, FolderTree, Loader2 } from "lucide-react";

import EditableLogoField from "@/components/EditableLogoField";
import type { Category } from "@/types";

export default function Submit() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    logo: "",
    name: "",
    description: "",
    url: "",
    contactInfo: "",
    categoryId: "",
    subCategoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [logoDirty, setLogoDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
        setFormData((current) => ({
          ...current,
          categoryId: current.categoryId || data[0]?.id || "",
        }));
      })
      .catch(() => {
        setError("分类加载失败，请稍后刷新重试");
      });
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === formData.categoryId) || null,
    [categories, formData.categoryId]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (logoDirty) {
      setError("Logo 已修改但尚未保存，请先点击“保存 Logo”");
      return;
    }

    if (!formData.logo || !formData.name || !formData.description || !formData.url || !formData.categoryId) {
      setError("请完整填写并保存 Logo、工具名称、简介、官网链接和分类");
      return;
    }

    if (!agreed) {
      setError("请先阅读并勾选同意用户协议");
      return;
    }

    setSubmitting(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch("/api/submit-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError("请求超时，请检查网络后重试");
      } else {
        setError("网络异常，提交失败，请稍后再试");
      }
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] max-w-md w-full text-center animate-in zoom-in duration-300 border border-[#e8e8ed]">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-3">提交成功，等待审核</h2>
          <p className="text-[#86868b] text-[15px] leading-relaxed mb-8">
            感谢您提交 <strong>{formData.name}</strong>。<br />
            我们的审核团队会尽快进行评估，审核通过后将自动展示在首页。
          </p>
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="inline-flex items-center justify-center w-full py-3.5 bg-[#f5f5f7] text-[#1d1d1f] font-medium rounded-[12px] hover:bg-[#e8e8ed] transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 font-sans selection:bg-[#0071e3]/20">
      <div className="mb-10 text-center">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#1d1d1f] mb-3">提交 AI 工具</h1>
        <p className="text-[16px] text-[#86868b]">左侧导航保持不动，您可以在这里直接提交工具并等待审核</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#e8e8ed]">
        <div className="space-y-6">
          <div className="grid lg:grid-cols-[180px_minmax(0,1fr)] gap-6 items-start">
            <EditableLogoField
              value={formData.logo}
              onChange={(logo) => {
                setFormData((current) => ({ ...current, logo }));
                setError("");
              }}
              uploadUrl="/api/upload-public"
              frameClassName="rounded-[24px]"
              helperTitle="Logo 仅支持本地上传"
              helperText="选择本地图片后，直接在左侧现有圆角 Logo 框内拖动和缩放，点击“保存 Logo”后，后台审核收录和前端 AI 卡片都会使用这个编辑后的成品图。"
              onDirtyChange={setLogoDirty}
            />

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                    主分类 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FolderTree className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                    <select
                      value={formData.categoryId}
                      onChange={(event) => setFormData({ ...formData, categoryId: event.target.value, subCategoryId: "" })}
                      className="w-full pl-11 pr-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all text-[15px] appearance-none"
                    >
                      <option value="">请选择主分类</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">子分类</label>
                  <select
                    value={formData.subCategoryId}
                    onChange={(event) => setFormData({ ...formData, subCategoryId: event.target.value })}
                    className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all text-[15px] appearance-none"
                    disabled={!selectedCategory?.children?.length}
                  >
                    <option value="">{selectedCategory?.children?.length ? "请选择子分类" : "该主分类暂无子分类"}</option>
                    {selectedCategory?.children?.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                工具名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="例如：ChatGPT"
                className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all text-[15px]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                官网链接 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(event) => setFormData({ ...formData, url: event.target.value })}
                placeholder="https://"
                className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all text-[15px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              工具简介 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              placeholder="简要说明核心功能、适用人群和亮点..."
              className="w-full min-h-[120px] px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all text-[15px] resize-y"
            />
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">联系方式 (仅管理员可见)</label>
            <input
              type="text"
              value={formData.contactInfo}
              onChange={(event) => setFormData({ ...formData, contactInfo: event.target.value })}
              placeholder="您的微信、邮箱或 Telegram，方便通知审核结果"
              className="w-full px-4 py-3 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[12px] outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all text-[15px]"
            />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-[14px] rounded-[8px] border border-red-100">{error}</div>}

          <div className="pt-4 pb-2 rounded-[18px] bg-[#f8fafc] border border-[#e8e8ed] px-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="peer w-5 h-5 appearance-none border-[1.5px] border-[#d2d2d7] rounded-[6px] checked:bg-[#0071e3] checked:border-[#0071e3] transition-colors cursor-pointer"
                />
                <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-[13px] text-[#86868b] leading-relaxed select-none">
                我已阅读并同意
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] hover:underline mx-1">《提交服务协议》</a>
                和
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] hover:underline mx-1">《隐私政策》</a>
                ，并确认提交内容真实有效。
              </span>
            </label>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#0071e3] text-white font-medium rounded-[12px] hover:bg-[#0077ED] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> 正在提交...</> : "提交成功后进入待审核列表"}
          </button>
        </div>
      </form>
    </div>
  );
}