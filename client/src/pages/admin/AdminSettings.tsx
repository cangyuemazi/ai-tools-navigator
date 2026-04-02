import EditableLogoField from "@/components/EditableLogoField";

interface SiteSettingsData {
  name: string;
  logo: string;
  favicon: string;
  titleFontSize: number;
  backgroundColor: string;
  companyIntro: string;
  icp: string;
  email: string;
  customerServiceQrCode: string;
  termsText: string;
  privacyText: string;
  aboutContent: string;
  partnersContent: string;
}

interface AdminSettingsProps {
  siteSettings: SiteSettingsData;
  setSiteSettings: (s: SiteSettingsData) => void;
  token: string;
  uploading: boolean;
  siteLogoDirty: boolean;
  setSiteLogoDirty: (v: boolean) => void;
  onSave: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => void;
}

export default function AdminSettings({ siteSettings, setSiteSettings, token, uploading, siteLogoDirty, setSiteLogoDirty, onSave, onFileUpload }: AdminSettingsProps) {
  return (
    <div className="bg-white p-8 rounded-[20px] shadow-sm border border-[#e8e8ed] animate-in fade-in">
      <h2 className="text-xl font-semibold mb-6 text-[#1d1d1f]">全站视觉与品牌定制</h2>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">网站名称</label><input type="text" value={siteSettings.name} onChange={e => setSiteSettings({...siteSettings, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[10px] outline-none" /></div>
          <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">侧边栏网站名称字体大小</label><input type="number" value={siteSettings.titleFontSize} onChange={e => setSiteSettings({...siteSettings, titleFontSize: parseInt(e.target.value)})} className="w-full px-4 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[10px] outline-none" /></div>
          <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">网站全局背景颜色</label><input type="text" value={siteSettings.backgroundColor} onChange={e => setSiteSettings({...siteSettings, backgroundColor: e.target.value})} className="w-full px-4 py-2.5 bg-[#f5f5f7] border border-[#d2d2d7] rounded-[10px] outline-none" /></div>
          <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">侧边栏网站 Logo</label><EditableLogoField key="site-settings-logo" value={siteSettings.logo} onChange={(logo) => setSiteSettings({...siteSettings, logo})} uploadUrl="/api/admin/upload" uploadHeaders={{ Authorization: `Bearer ${token}` }} frameSize={92} frameClassName="rounded-[18px]" controlsClassName="bg-white" helperText="上传本地图片后，可在框内拖动和缩放，保存后前端侧边栏会使用这个成品图。" onDirtyChange={setSiteLogoDirty} /></div>
          <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">浏览器标签页图标</label><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-[12px] bg-[#f5f5f7] border flex items-center justify-center p-1">{siteSettings.favicon ? <img src={siteSettings.favicon} className="w-full h-full object-contain" /> : <span className="text-xs text-[#86868b]">无</span>}</div><label className="px-4 py-2 bg-white border border-[#d2d2d7] rounded-[8px] text-sm cursor-pointer hover:bg-[#f5f5f7]">{uploading ? "中..." : "上传Favicon"}<input type="file" accept="image/*" onChange={(e) => onFileUpload(e, url => setSiteSettings({...siteSettings, favicon: url}))} className="hidden" /></label></div></div>
          <div><label className="block text-sm font-medium text-[#6e6e73] mb-2">前端客服二维码</label><div className="flex items-center gap-4"><div className="w-20 h-20 rounded-[16px] bg-[#f5f5f7] border flex items-center justify-center p-1.5 overflow-hidden">{siteSettings.customerServiceQrCode ? <img src={siteSettings.customerServiceQrCode} className="w-full h-full object-cover" /> : <span className="text-xs text-[#86868b] text-center">未上传</span>}</div><label className="px-4 py-2 bg-white border border-[#d2d2d7] rounded-[8px] text-sm cursor-pointer hover:bg-[#f5f5f7]">{uploading ? "中..." : "上传二维码"}<input type="file" accept="image/*" onChange={(e) => onFileUpload(e, url => setSiteSettings({...siteSettings, customerServiceQrCode: url}))} className="hidden" /></label></div><p className="mt-2 text-[12px] text-[#86868b] leading-relaxed">仅支持本地上传图片。保存设置后，前端右下角客服悬浮入口会自动使用这里的二维码。</p></div>
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
        <button onClick={onSave} className="px-8 py-3 bg-[#0071e3] text-white rounded-[12px] font-semibold hover:bg-[#0077ED] shadow-md transition-all">保存全部设置</button>
      </div>
    </div>
  );
}
