import { useState, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Tool } from "@/types";

interface ToolCardProps {
  tool: Tool;
  index: number;
  isAllToolsView?: boolean;
}

function getDescriptionSnippet(description: string, maxLength = 8) {
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength)}...`;
}

function ToolCard({ tool, index, isAllToolsView = false }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const isTooltipMode = isHovered;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.9, 0.4, 1.1], delay: Math.min(index * 0.03, 0.3) }}
      className={`relative ${isTooltipMode ? 'z-50' : 'z-10'}`}
    >
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block outline-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`
            bg-[#ffffff] rounded-[20px] p-4 transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.4,1.1)]
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
                <img src={tool.logo || undefined} alt={tool.name} className="w-full h-full object-contain" onError={() => setLogoError(true)} loading="lazy" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <h3 className={`text-[16px] font-semibold truncate tracking-tight leading-[1.3] transition-colors duration-300 ${isTooltipMode ? "text-[#0071e3]" : "text-[#1d1d1f]"}`}>
                  {tool.name}
                </h3>
              </div>
              <p className="text-[12px] text-[#6e6e73] leading-5 truncate">
                {tool.description}
              </p>
            </div>
          </div>

        </div>
      </a>

      {/* tooltip 模式：统一向下弹出 */}
      <AnimatePresence>
        {isTooltipMode && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.2, 0.9, 0.4, 1] }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-[14px] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#e8e8ed]/80">
              <p className="text-[13px] leading-[1.6] text-[#4a4a4f]">
                {tool.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(ToolCard);