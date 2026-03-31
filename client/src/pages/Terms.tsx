import { useState, useEffect } from "react";
import Layout from "@/components/Layout";

export default function Terms() {
  const [content, setContent] = useState("正在加载协议内容...");
  useEffect(() => { 
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => setContent(d.termsText || "管理员尚未发布提交服务协议。"))
      .catch(() => setContent("加载协议内容失败，请刷新重试。")); 
  }, []);
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8 md:p-14 bg-white min-h-[80vh] my-8 rounded-[24px] shadow-sm border border-[#e8e8ed]">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#1d1d1f]">提交服务协议</h1>
        <div className="whitespace-pre-wrap leading-relaxed text-[#4a4a4f] text-[15px]">{content}</div>
      </div>
    </Layout>
  );
}