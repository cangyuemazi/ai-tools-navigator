import { useMemo } from "react";
import { Box, ClipboardList, TrendingUp, Calendar, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Tool, Category, PendingTool } from "@/types";

interface AdminDashboardProps {
  tools: Tool[];
  categories: Category[];
  pendingTools: PendingTool[];
}

const toolMatchesCategory = (tool: Tool, categoryId: string) => (
  tool.categoryAssignments?.some((assignment) => assignment.categoryId === categoryId)
  || tool.categoryId === categoryId
);

export default function AdminDashboard({ tools, categories, pendingTools }: AdminDashboardProps) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thisWeekCount = tools.filter((tool) => tool.createdAt && new Date(tool.createdAt) >= weekAgo).length;
  const thisMonthCount = tools.filter((tool) => tool.createdAt && new Date(tool.createdAt) >= monthAgo).length;

  const categoryDistribution = useMemo(() => categories.map((category) => ({
    name: category.name.replace(/^AI/, "").replace(/工具$/, ""),
    count: tools.filter((tool) => toolMatchesCategory(tool, category.id)).length,
  })).filter((item) => item.count > 0), [tools, categories]);

  const hotTools = useMemo(() => [...tools].sort((left, right) => right.views - left.views).slice(0, 10), [tools]);

  const stats = [
    { label: "总工具数", value: tools.length, icon: Box, color: "bg-[#0071e3]" },
    { label: "待审核", value: pendingTools.length, icon: ClipboardList, color: "bg-orange-500" },
    { label: "本周新增", value: thisWeekCount, icon: TrendingUp, color: "bg-green-500" },
    { label: "本月新增", value: thisMonthCount, icon: Calendar, color: "bg-purple-500" },
  ];

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-[16px] p-5 border border-[#e8e8ed] shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 ${stat.color} rounded-[10px] flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-[13px] text-[#86868b] font-medium">{stat.label}</span>
            </div>
            <p className="text-[28px] font-bold text-[#1d1d1f]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed] shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-4">各分类工具分布</h3>
          {categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryDistribution} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#86868b" }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: "#86868b" }} allowDecimals={false} />
                <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid #e8e8ed", fontSize: 13 }} />
                <Bar dataKey="count" fill="#0071e3" radius={[6, 6, 0, 0]} name="工具数" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#86868b] text-center py-10">暂无数据</p>
          )}
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#e8e8ed] shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-4">
            <Eye className="w-4 h-4 inline mr-2" />热门工具 TOP 10
          </h3>
          <div className="space-y-2">
            {hotTools.map((tool, index) => (
              <div key={tool.id} className="flex items-center gap-3 px-3 py-2 rounded-[10px] hover:bg-[#f5f5f7] transition-colors">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${index < 3 ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-[#86868b]"}`}>{index + 1}</span>
                <span className="flex-1 text-[14px] font-medium text-[#1d1d1f] truncate">{tool.name}</span>
                <span className="text-[13px] text-[#86868b] tabular-nums">{tool.views.toLocaleString()} 次</span>
              </div>
            ))}
            {hotTools.length === 0 && <p className="text-[#86868b] text-center py-6">暂无数据</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
