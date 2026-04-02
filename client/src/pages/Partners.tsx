/**
 * Partners Page
 * Business cooperation and advertising information.
 * Content is editable via admin settings (Markdown).
 */
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Megaphone, BarChart3, Star, Mail, MessageSquare } from "lucide-react";
const PARTNERS_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663305027998/HDfCavX5799Z5afQYedwzL/partners-bg-38coXdQr7ZvrTomhq4zwXn.webp";

export default function Partners() {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => { if (data.partnersContent) setContent(data.partnersContent); })
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
          <h1 className="text-2xl font-bold text-gray-900">商务合作</h1>
        </div>

        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden mb-8 h-48 relative">
          <img src={PARTNERS_BG} alt="Partners" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h2 className="text-white text-xl font-bold">携手共赢</h2>
            <p className="text-white/80 text-sm mt-1">与我们一起推广优质AI工具</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">广告投放</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              我们提供多种广告位供合作伙伴选择，帮助您的AI产品精准触达目标用户群体。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "首页推荐位", desc: "在首页热门工具区域展示，高曝光量" },
                { title: "分类置顶", desc: "在指定分类页面置顶展示，精准投放" },
                { title: "品牌专区", desc: "定制品牌展示页面，全方位展示产品" },
                { title: "内容合作", desc: "联合发布评测、教程等内容" },
              ].map((item) => (
                <div key={item.title} className="border border-gray-100 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">平台优势</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">50万+</div>
                <div className="text-sm text-gray-500 mt-1">月访问量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10万+</div>
                <div className="text-sm text-gray-500 mt-1">注册用户</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <div className="text-sm text-gray-500 mt-1">用户满意度</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">合作流程</h3>
            </div>
            <div className="space-y-4">
              {[
                { step: "01", title: "需求沟通", desc: "联系我们，说明您的合作需求和预算" },
                { step: "02", title: "方案定制", desc: "我们将根据您的需求制定专属合作方案" },
                { step: "03", title: "签约执行", desc: "双方确认方案后签订合作协议并执行" },
                { step: "04", title: "效果追踪", desc: "提供详细的数据报告，持续优化合作效果" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-sm p-8 text-white">
            <h3 className="text-lg font-bold mb-2">开始合作</h3>
            <p className="text-blue-100 text-sm mb-6">
              如果您对商务合作感兴趣，请通过以下方式联系我们，我们将在24小时内回复。
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                <span>business@ai00.tools</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>微信：ai00tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
