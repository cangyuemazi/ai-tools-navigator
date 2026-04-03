import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, Home, Send, Info, Handshake, LayoutGrid } from "lucide-react";
import Sidebar from "./Sidebar";
import FloatingWidgets from "./FloatingWidgets";
import CommandPalette from "./CommandPalette";
import type { Category } from "@/types";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { fetchSiteSettings, getFrontendDocumentTitle, getSiteName, readCachedSiteSettings, type SiteSettings } from "@/lib/site-settings";

interface LayoutProps { children: React.ReactNode; selectedCategoryId?: string | null; onSelectCategory?: (c: string | null, s?: string | null) => void; showMobileHeader?: boolean; activeSectionId?: string | null; onScrollToCategory?: (categoryId: string, subCategoryId?: string) => void; onNavigateHome?: () => void; onNavigateAllTools?: () => void; searchQuery?: string; onSearchChange?: (query: string) => void; }

export default function Layout({ children, selectedCategoryId = null, onSelectCategory, showMobileHeader = true, activeSectionId = null, onScrollToCategory, onNavigateHome, onNavigateAllTools, searchQuery = "", onSearchChange }: LayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => readCachedSiteSettings());

  useEffect(() => {
    fetch("/api/categories").then(res => res.json()).then(data => setCategories(data)).catch(err => console.error("Failed to fetch categories:", err));
    fetchSiteSettings().then(setSiteSettings).catch(err => console.error("Failed to fetch settings:", err));
  }, []);

  const handleSelectCategory = (c: string | null, s?: string | null) => { if (onSelectCategory) onSelectCategory(c, s); setMobileOpen(false); };

  // Task 3: Scroll to top on route or category change
  useEffect(() => {
    const el = mainScrollRef.current;
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location, selectedCategoryId]);

  const handleNavigateHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    window.location.assign("/");
  };

  const handleNavigateAllTools = () => {
    if (onNavigateAllTools) {
      onNavigateAllTools();
      return;
    }
    window.location.assign("/all-tools");
  };

  const siteName = getSiteName(siteSettings);
  const pageTitle = getFrontendDocumentTitle(siteSettings);

  return (
    <HelmetProvider>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={siteSettings.companyIntro || "发现并收录全球最好用的AI人工智能工具"} />
        {siteSettings.favicon && <link rel="icon" href={siteSettings.favicon} />}
      </Helmet>

      <div className="flex h-screen text-[#1d1d1f] font-sans selection:bg-[#0071e3]/20" style={{ backgroundColor: siteSettings.backgroundColor }}>
        <Sidebar categories={categories} selectedCategoryId={selectedCategoryId} onSelectCategory={handleSelectCategory} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} activeSectionId={activeSectionId} onScrollToCategory={onScrollToCategory} onNavigateHome={onNavigateHome} onNavigateAllTools={onNavigateAllTools} />
        <main ref={mainScrollRef} id="main-scroll-container" className="flex-1 overflow-y-auto scroll-smooth relative flex flex-col">
          
          {/* Desktop sticky top bar */}
          <div className="hidden lg:flex sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e8e8ed]/60 px-6 py-2.5 items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={handleNavigateHome} className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all text-[#6e6e73] hover:bg-[#0071e3]/[0.04] hover:text-[#0071e3]`}><Home className="w-4 h-4" /><span>首页</span></button>
              <Link href="/about" className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all text-[#6e6e73] hover:bg-[#0071e3]/[0.04] hover:text-[#0071e3] no-underline`}><Info className="w-4 h-4" /><span>关于我们</span></Link>
              <Link href="/submit" className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all text-[#6e6e73] hover:bg-[#0071e3]/[0.04] hover:text-[#0071e3] no-underline`}><Send className="w-4 h-4" /><span>提交收录</span></Link>
              <Link href="/partners" className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all text-[#6e6e73] hover:bg-[#0071e3]/[0.04] hover:text-[#0071e3] no-underline`}><Handshake className="w-4 h-4" /><span>商务合作</span></Link>
              <button onClick={handleNavigateAllTools} className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all text-[#6e6e73] hover:bg-[#0071e3]/[0.04] hover:text-[#0071e3]`}><LayoutGrid className="w-4 h-4" /><span>全部工具</span></button>
            </div>
            <div className="flex-1" />
            <div className="relative max-w-xs w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#86868b] transition-colors group-focus-within:text-[#0071e3]" />
              </div>
              <input
                type="text"
                placeholder="搜索 AI 工具..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-[#d2d2d7] rounded-[10px] leading-5 bg-white/90 text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/10 transition-all duration-300 text-[13px]"
              />
            </div>
          </div>

          {showMobileHeader && (
            <div className="lg:hidden sticky top-0 z-30 bg-white/70 backdrop-blur-[20px] border-b border-[#e8e8ed] px-4 py-3 flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[12px] hover:bg-[#0071e3]/[0.05]"><Menu className="w-5 h-5" /></button>
              <button type="button" onClick={handleNavigateHome} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                {siteSettings.logo ? <img src={siteSettings.logo} className="w-7 h-7 rounded-[8px] object-contain" /> : <div className="w-7 h-7 rounded-[8px] bg-[#0071e3] flex items-center justify-center"><span className="text-white font-bold text-xs">AI</span></div>}
                {siteName && <span className="text-[15px] font-semibold truncate">{siteName}</span>}
              </button>
              <button onClick={() => window.dispatchEvent(new Event('open-command-palette'))} className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[12px] hover:bg-[#0071e3]/[0.05]"><Search className="w-5 h-5 text-[#86868b]" /></button>
            </div>
          )}
          
          <div className="flex-1">
            {children}
          </div>

          {(siteSettings.companyIntro || siteSettings.icp || siteSettings.email) && (
            <footer className="mt-16 py-8 px-6 border-t border-[#e8e8ed]/60 text-center text-[#86868b] text-[13px] bg-black/5">
              {siteSettings.companyIntro && <p className="mb-3 max-w-2xl mx-auto leading-relaxed">{siteSettings.companyIntro}</p>}
              <div className="flex flex-wrap items-center justify-center gap-4 font-medium">
                {siteSettings.email && <span>联系邮箱：{siteSettings.email}</span>}
                {siteSettings.icp && (
                  <span>
                    备案号：<a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:text-[#0071e3] transition-colors">{siteSettings.icp}</a>
                  </span>
                )}
              </div>
              <p className="mt-3 opacity-80">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            </footer>
          )}

          <CommandPalette />
          <FloatingWidgets />
        </main>
      </div>
    </HelmetProvider>
  );
}