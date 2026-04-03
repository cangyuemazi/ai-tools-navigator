import type { SiteSettings } from "@/lib/site-settings";

interface AdminContentProps {
  siteSettings: SiteSettings;
  setSiteSettings: (s: SiteSettings) => void;
  onSave: () => void;
}

export default function AdminContent({ siteSettings, setSiteSettings, onSave }: AdminContentProps) {
  return (
    <div className="bg-white p-8 rounded-[20px] shadow-sm border border-[#e8e8ed] animate-in fade-in">
      <h2 className="text-xl font-semibold mb-6 text-[#1d1d1f]">其他内容修改</h2>
      <div className="space-y-8">
        <div className="p-5 bg-[#f0faf0] rounded-[16px] border border-green-200">
          <h3 className="font-semibold text-green-700 mb-1">"关于我们"页面内容 (Markdown)</h3>
          <p className="text-[12px] text-[#86868b] mb-3">支持 Markdown 语法：# 标题、**加粗**、- 列表、[链接](url) 等。留空则用默认内容。</p>
          <textarea value={siteSettings.aboutContent} onChange={e => setSiteSettings({...siteSettings, aboutContent: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-green-300 rounded-[10px] outline-none min-h-[250px] font-mono text-sm" placeholder="# 关于我们&#10;&#10;我们是一支热爱AI技术的团队..." />
        </div>

        <div className="p-5 bg-[#fef9f0] rounded-[16px] border border-amber-200">
          <h3 className="font-semibold text-amber-700 mb-1">"商务合作"页面内容 (Markdown)</h3>
          <p className="text-[12px] text-[#86868b] mb-3">支持 Markdown 语法。留空则用默认内容。</p>
          <textarea value={siteSettings.partnersContent} onChange={e => setSiteSettings({...siteSettings, partnersContent: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-[10px] outline-none min-h-[250px] font-mono text-sm" placeholder="# 商务合作&#10;&#10;我们提供多种广告位供合作伙伴选择..." />
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-[#e8e8ed] flex justify-end">
        <button onClick={onSave} className="px-8 py-3 bg-[#0071e3] text-white rounded-[12px] font-semibold hover:bg-[#0077ED] shadow-md transition-all">保存内容</button>
      </div>
    </div>
  );
}
