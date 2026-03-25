import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Eye } from "lucide-react";
import type { Tool } from "@/types";

interface ToolCardProps {
  tool: Tool;
  index: number;
}

export default function ToolCard({ tool, index }: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.9, 0.4, 1.1], delay: Math.min(index * 0.03, 0.3) }}
    >
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block outline-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`
            bg-[#ffffff] rounded-[20px] p-6 transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.4,1.1)]
            border border-[#e8e8ed] active:scale-[0.98]
            ${isHovered
              ? "shadow-[0_12px_28px_rgba(0,0,0,0.08)] -translate-y-1"
              : "shadow-[0_8px_20px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.02)]"
            }
          `}
        >
          <div className="flex items-center gap-4">
            <div className="w-[52px] h-[52px] rounded-[14px] bg-[#f5f5f7] border border-[#e8e8ed] flex items-center justify-center shrink-0 overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              {logoError ? (
                <span className="text-[20px] font-semibold text-[#86868b]">
                  {tool.name.charAt(0)}
                </span>
              ) : (
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="w-8 h-8 object-contain"
                  onError={() => setLogoError(true)}
                  loading="lazy"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {/* 标题字重 600, 颜色 #1d1d1f */}
                <h3 className="text-[17px] font-semibold text-[#1d1d1f] truncate tracking-tight leading-[1.2]">
                  {tool.name}
                </h3>
                <ExternalLink className={`w-4 h-4 shrink-0 transition-all duration-300 ${isHovered ? "opacity-100 text-[#0071e3]" : "opacity-0 text-[#86868b]"}`} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-[12px] text-[12px] font-medium bg-[#f5f5f7] text-[#6e6e73] border border-[#e8e8ed]/60"
                  >
                    {tag}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-[12px] font-medium text-[#86868b] ml-auto">
                  <Eye className="w-3.5 h-3.5" />
                  {tool.views >= 10000
                    ? `${(tool.views / 10000).toFixed(1)}w`
                    : tool.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0.9, 0.4, 1.1] }}
                className="overflow-hidden"
              >
                {/* 正文色 #6e6e73, 行高 1.4 */}
                <p className="mt-5 pt-4 border-t border-[#e8e8ed] text-[14px] text-[#6e6e73] leading-[1.4] line-clamp-3 font-normal">
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