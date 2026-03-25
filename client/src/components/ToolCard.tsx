/**
 * ToolCard Component
 * Design: White card, rounded-xl, soft shadow, hover reveals description below.
 * Click opens tool URL in new tab.
 */
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

  const tagColors: Record<string, string> = {
    "热门": "bg-red-50 text-red-600",
    "免费": "bg-green-50 text-green-600",
    "付费": "bg-amber-50 text-amber-600",
    "开源": "bg-purple-50 text-purple-600",
    "中文": "bg-blue-50 text-blue-600",
    "英文": "bg-indigo-50 text-indigo-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
    >
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`
          bg-white rounded-2xl p-5 transition-all duration-300 ease-out border
          ${isHovered
            ? "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border-blue-100 -translate-y-1.5"
            : "shadow-sm border-gray-100/60"
          }
        `}
        >
          {/* Card Header */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
              {logoError ? (
                <span className="text-lg font-bold text-blue-600">
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

            {/* Name & Tags */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {tool.name}
                </h3>
                <ExternalLink className={`w-3.5 h-3.5 shrink-0 transition-opacity duration-200 ${isHovered ? "opacity-100 text-blue-500" : "opacity-0"}`} />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${tagColors[tag] || "bg-gray-50 text-gray-500"}`}
                  >
                    {tag}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
                  <Eye className="w-3 h-3" />
                  {tool.views >= 10000
                    ? `${(tool.views / 10000).toFixed(1)}万`
                    : tool.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Hover Description */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 leading-relaxed line-clamp-2">
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
