/**
 * About Page
 * Introduces the team, vision, and contact information.
 * Content is editable via admin settings (Markdown).
 */
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Target, Users, Zap, Mail, Globe } from "lucide-react";
import { fetchSiteSettings, getSiteName, readCachedSiteSettings } from "@/lib/site-settings";
const ABOUT_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663305027998/HDfCavX5799Z5afQYedwzL/about-bg-8BTeZiLvbehD9zZefgNo7T.webp";

export default function About() {
  const [siteSettings, setSiteSettings] = useState(() => readCachedSiteSettings());
  const [content, setContent] = useState<string | null>(siteSettings.aboutContent || null);
  const siteName = getSiteName(siteSettings);

  useEffect(() => {
    fetchSiteSettings()
      .then(data => { setSiteSettings(data); setContent(data.aboutContent || null); })
      .catch(() => {});
  }, []);

  // 有后台 Markdown 内容 → 渲染 Markdown
  if (content) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-xl">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // 兜底：默认硬编码页面
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">关于我们</h1>
        </div>

        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden mb-8 h-48 relative">
          <img src={ABOUT_BG} alt="About" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h2 className="text-white text-xl font-bold">{siteName}</h2>
            <p className="text-white/80 text-sm mt-1">发现最好用的AI工具</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">我们的愿景</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {siteName}致力于成为中文互联网最全面、最权威的AI工具导航平台。我们相信AI技术正在改变每个人的工作和生活方式，而我们的使命是帮助用户快速发现和使用最适合自己的AI工具，降低AI技术的使用门槛。
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">我们做什么</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>收录和分类全球优质AI工具，覆盖写作、图片、视频、编程等18+个领域</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>定期更新工具信息，确保收录内容的准确性和时效性</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>提供真实的用户评价和使用建议，帮助用户做出明智选择</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <span>持续追踪AI行业动态，第一时间收录新兴工具</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">团队介绍</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              我们是一支热爱AI技术的团队，成员来自互联网、人工智能和产品设计领域。我们每天都在使用和研究各种AI工具，深知用户在选择工具时的困惑和需求。正是这份热爱和理解，驱动我们打造了这个平台。
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">联系我们</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>contact@ai00.tools</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Globe className="w-5 h-5 text-gray-400" />
                <span>www.ai00.tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
