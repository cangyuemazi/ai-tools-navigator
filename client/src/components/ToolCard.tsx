import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Eye, Sparkles } from "lucide-react";
import type { Tool } from "@/types";

interface ToolCardProps {
  tool: Tool;
  index: number;
}

export default function ToolCard({ tool, index }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  // 用来区分当前是向下展开，还是向上弹出对话框
  const [hoverMode, setHoverMode] = useState<'expand' | 'tooltip'>('expand');

  // 鼠标移入时，智能判断整个页面是否滑动到了最底部
  const handleMouseEnter = () => {
    // 获取咱们在 Layout 中定义的全局滚动容器
    const container = document.getElementById('main-scroll-container');
    if (container) {
      // 判断：容器总内容高度 - 已经滚动的距离 <= 容器可视高度 (加上 10px 的像素误差防抖)
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
      
      if (isAtBottom) {
        setHoverMode('tooltip'); // 只要网页在最底部，所有被鼠标划过的卡片都变成气泡模式
      } else {
        setHoverMode('expand');  // 页面不在最底部，恢复向下展开
      }
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.9, 0.4, 1.1], delay: Math.min(index * 0.03, 0.3) }}
      // 👇 父容器加 z-index 提升，防止向上弹出的气泡被上一排的卡片遮挡
      className={`relative ${isHovered ? 'z-50' : 'z-10'}`} 
    >
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block outline-none relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`
            bg-[#ffffff] rounded-[20px] p-6 transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.4,1.1)]
            border active:scale-[0.98] relative
            ${tool.isSponsored ? "border-[#0071e3]/30" : "border-[#e8e8ed]"}
            ${isHovered
              ? tool.isSponsored 
                ? "shadow-[0_12px_28px_rgba(0,113,227,0.12)] -translate-y-1 border-[#0071e3]/50" 
                : "shadow-[0_12px_28px_rgba(0,0,0,0.08)] -translate-y-1"
              : tool.isSponsored
                ? "shadow-[0_8px_20px_rgba(0,113,227,0.06),0_2px_4px_rgba(0,113,227,0.04)]"
                : "shadow-[0_8px_20px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.02)]"
            }
          `}
        >
          {/* 付费高亮角标 */}
          {tool.isSponsored && (
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#0071e3] to-[#42a1ff] text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-bl-[12px] rounded-tr-[19px] shadow-sm flex items-center gap-1 z-10">
              <Sparkles className="w-3 h-3" />
              推荐
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className={`w-[52px] h-[52px] mt-1 rounded-[14px] bg-[#f5f5f7] border flex items-center justify-center shrink-0 overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)] ${tool.isSponsored ? "border-[#0071e3]/20" : "border-[#e8e8ed]"}`}>
              {logoError ? (
                <span className="text-[20px] font-semibold text-[#86868b]">{tool.name.charAt(0)}</span>
              ) : (
                <img src={tool.logo} alt={tool.name} className="w-8 h-8 object-contain" onError={() => setLogoError(true)} loading="lazy" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 pr-6 mb-2">
                {/* 名称支持两行完整显示 */}
                <h3 
                  className="text-[16px] font-semibold text-[#1d1d1f] line-clamp-2 tracking-tight leading-[1.3] group-hover:text-[#0071e3] transition-colors"
                  title={tool.name}
                >
                  {tool.name}
                </h3>
                <ExternalLink className={`w-4 h-4 mt-0.5 shrink-0 transition-all duration-300 ${isHovered ? "opacity-100 text-[#0071e3]" : "opacity-0 text-[#86868b]"}`} />
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className={`px-2.5 py-0.5 rounded-[12px] text-[12px] font-medium border ${tool.isSponsored ? "bg-[#0071e3]/[0.04] text-[#0071e3] border-[#0071e3]/10" : "bg-[#f5f5f7] text-[#6e6e73] border-[#e8e8ed]/60"}`}>
                    {tag}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-[12px] font-medium text-[#86868b] ml-auto">
                  <Eye className="w-3.5 h-3.5" />
                  {tool.views >= 10000 ? `${(tool.views / 10000).toFixed(1)}w` : tool.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 👇 模式一：页面不在底部时，传统的向下排版展开 👇 */}
          <AnimatePresence>
            {isHovered && hoverMode === 'expand' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0.9, 0.4, 1.1] }}
                className="overflow-hidden"
              >
                <p className={`mt-5 pt-4 border-t text-[14px] leading-[1.4] line-clamp-3 font-normal ${tool.isSponsored ? "border-[#0071e3]/10 text-[#4a4a4f]" : "border-[#e8e8ed] text-[#6e6e73]"}`}>
                  {tool.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 👇 模式二：页面处于最底部时，全局生效的向上悬浮对话气泡 👇 */}
          <AnimatePresence>
            {isHovered && hoverMode === 'tooltip' && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-[calc(100%+15px)] left-0 w-full z-[100] bg-white rounded-[16px] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-[#e8e8ed]"
              >
                {/* 气泡指向下方的小三角 */}
                <div className="absolute -bottom-[6px] left-10 w-3 h-3 bg-white border-b border-r border-[#e8e8ed] rotate-45"></div>
                <p className="text-[14px] leading-[1.5] text-[#4a4a4f] relative z-10">
                  {tool.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </a>
    </motion.div>
  );
}