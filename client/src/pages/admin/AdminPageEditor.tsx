import { useState } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { SiteSettings } from "@/lib/site-settings";

interface AdminPageEditorProps {
  siteSettings: SiteSettings;
  setSiteSettings: (s: SiteSettings) => void;
  token: string;
  onSave: () => void;
}

const TABS = [
  { id: "about", label: "关于我们" },
  { id: "partners", label: "商务合作" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPageEditor({ siteSettings, setSiteSettings, token, onSave }: AdminPageEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>("about");

  return (
    <div className="bg-white p-8 rounded-[20px] shadow-sm border border-[#e8e8ed] animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#1d1d1f]">页面内容编辑</h2>
          <p className="text-sm text-[#86868b] mt-1">
            支持 Markdown 语法和原生 HTML（含 Tailwind 类名），可直接拖拽图片上传。留空则使用默认页面。
          </p>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6 border-b border-[#e8e8ed] pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-[10px] text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#0071e3] text-white shadow-sm"
                : "bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e8e8ed]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 编辑器区域 */}
      {activeTab === "about" && (
        <div key="about">
          <label className="block text-sm font-medium text-[#1d1d1f] mb-3">
            《关于我们》页面内容
          </label>
          <MarkdownEditor
            value={siteSettings.aboutContent || ""}
            onChange={(val) => setSiteSettings({ ...siteSettings, aboutContent: val })}
            token={token}
          />
        </div>
      )}

      {activeTab === "partners" && (
        <div key="partners">
          <label className="block text-sm font-medium text-[#1d1d1f] mb-3">
            《商务合作》页面内容
          </label>
          <MarkdownEditor
            value={siteSettings.partnersContent || ""}
            onChange={(val) => setSiteSettings({ ...siteSettings, partnersContent: val })}
            token={token}
          />
        </div>
      )}

      {/* 保存按钮 */}
      <div className="mt-8 pt-6 border-t border-[#e8e8ed] flex justify-end">
        <button
          onClick={onSave}
          className="px-8 py-3 bg-[#0071e3] text-white rounded-[12px] font-semibold hover:bg-[#0077ED] shadow-md transition-all"
        >
          保存页面内容
        </button>
      </div>
    </div>
  );
}
