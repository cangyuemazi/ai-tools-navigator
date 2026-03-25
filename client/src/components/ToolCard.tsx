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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
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
            bg-white rounded-[24px] p-5 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] border
            ${isHovered
              ? "shadow-[0_24px_48px_rgba(0,0,0,0.06)] border-black/[0.08] -translate-y-1.5 scale-[1.01]"
              : "shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-black/[0.04]"
            }
          `}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-zinc-50 border border-black/[0.04] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {logoError ? (
                <span className="text-lg font-bold text-zinc-700">
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
                <h3 className="text-[15px] font-semibold text-zinc-900 truncate tracking-tight">
                  {tool.name}
                </h3>
                <ExternalLink className={`w-3.5 h-3.5 shrink-0 transition-opacity duration-300 ${isHovered ? "opacity-100 text-zinc-400" : "opacity-0"}`} />
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F5F5F7] text-zinc-600 border border-black/[0.04]"
                  >
                    {tag}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 ml-auto">
                  <Eye className="w-[14px] h-[14px]" />
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
                transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                className="overflow-hidden"
              >
                <p className="mt-4 pt-4 border-t border-black/[0.04] text-[13px] text-zinc-500 leading-relaxed line-clamp-3">
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