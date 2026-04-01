import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink } from "lucide-react";
import PinyinMatch from "pinyin-match";
import type { Tool } from "@/types";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tools, setTools] = useState<Tool[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch tools on first open
  useEffect(() => {
    if (open && tools.length === 0) {
      fetch("/api/tools").then(r => r.json()).then(setTools).catch(err => console.error("Failed to fetch tools:", err));
    }
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    const customHandler = () => setOpen(true);
    document.addEventListener("keydown", handler);
    window.addEventListener("open-command-palette", customHandler);
    return () => {
      document.removeEventListener("keydown", handler);
      window.removeEventListener("open-command-palette", customHandler);
    };
  }, [open]);

  // Filter with pinyin support
  const filteredTools = query.trim()
    ? tools.filter(t => {
        const q = query.toLowerCase();
        if (t.name.toLowerCase().includes(q)) return true;
        if (t.description.toLowerCase().includes(q)) return true;
        if (PinyinMatch.match(t.name, query)) return true;
        return false;
      })
    : tools.slice(0, 20);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => {
          const next = Math.min(i + 1, Math.min(filteredTools.length, 30) - 1);
          scrollToItem(next);
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => {
          const next = Math.max(i - 1, 0);
          scrollToItem(next);
          return next;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        const tool = filteredTools[selectedIndex];
        if (tool) {
          window.open(tool.url, "_blank", "noopener,noreferrer");
          setOpen(false);
        }
      }
    },
    [filteredTools, selectedIndex]
  );

  const scrollToItem = (index: number) => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[index] as HTMLElement;
    if (item) item.scrollIntoView({ block: "nearest" });
  };

  // Reset selection on query change
  useEffect(() => setSelectedIndex(0), [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: [0.2, 0.9, 0.4, 1] }}
            className="fixed top-[12%] left-1/2 -translate-x-1/2 w-[92vw] max-w-[600px] z-[9999]"
            onKeyDown={handleKeyDown}
          >
            <div className="bg-white rounded-[20px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] overflow-hidden border border-[#e8e8ed]">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e8e8ed]">
                <Search className="w-5 h-5 text-[#86868b] shrink-0" />
                <input
                  ref={inputRef}
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="搜索 AI 工具... (支持拼音、首字母)"
                  className="flex-1 text-[16px] bg-transparent outline-none placeholder-[#86868b] text-[#1d1d1f]"
                />
                <kbd className="hidden sm:inline-flex text-[11px] font-medium text-[#86868b] bg-[#f5f5f7] px-2 py-1 rounded-[6px] border border-[#e8e8ed]">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2 scroll-smooth">
                {filteredTools.length === 0 ? (
                  <p className="text-center text-[#86868b] py-10 text-[14px]">
                    未找到匹配的工具
                  </p>
                ) : (
                  filteredTools.slice(0, 30).map((tool, i) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        window.open(tool.url, "_blank", "noopener,noreferrer");
                        setOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-5 py-3 min-h-[44px] text-left transition-colors ${
                        i === selectedIndex
                          ? "bg-[#0071e3]/[0.08]"
                          : "hover:bg-[#f5f5f7]"
                      }`}
                    >
                      <img
                        src={tool.logo || undefined}
                        alt=""
                        className="w-8 h-8 rounded-[10px] object-contain bg-[#f5f5f7] shrink-0"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#1d1d1f] truncate">
                          {tool.name}
                        </p>
                        <p className="text-[12px] text-[#86868b] truncate">
                          {tool.description}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[#86868b] shrink-0 opacity-40" />
                    </button>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#e8e8ed] text-[12px] text-[#86868b]">
                <span>
                  {query ? `找到 ${filteredTools.length} 个工具` : `共 ${tools.length} 个工具`}
                </span>
                <div className="hidden sm:flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-[#f5f5f7] rounded border border-[#e8e8ed]">
                    ↑↓
                  </kbd>
                  <span>导航</span>
                  <kbd className="px-1.5 py-0.5 bg-[#f5f5f7] rounded border border-[#e8e8ed]">
                    ↵
                  </kbd>
                  <span>打开</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
