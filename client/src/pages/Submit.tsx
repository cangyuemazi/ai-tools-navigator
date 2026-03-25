/**
 * Submit Tool Page
 * Form to collect tool submissions from users.
 */
import { useState } from "react";
import { Link } from "wouter";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import categoriesData from "@/data/categories.json";
import type { Category } from "@/types";

const categories = categoriesData as Category[];

export default function Submit() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    url: "",
    description: "",
    categoryId: "",
    contactEmail: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.url || !form.description || !form.categoryId) {
      toast.error("请填写所有必填项");
      return;
    }
    console.log("Submitted tool:", form);
    setSubmitted(true);
    toast.success("提交成功，我们会尽快审核！");
  };

  if (submitted) {
    return (
      <Layout>
        <div className="flex items-center justify-center p-6 min-h-[80vh]">
          <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">提交成功</h2>
            <p className="text-gray-500 mb-6">感谢您的提交！我们会尽快审核并收录该工具。</p>
            <Link href="/">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">提交工具</h1>
          <p className="text-gray-500 mt-2">发现了好用的AI工具？提交给我们，审核通过后将收录到网站中。</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              工具名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="例如：ChatGPT"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              官网链接 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              工具简介 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="请简要描述该工具的功能和特点（不超过100字）"
              rows={3}
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所属分类 <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            >
              <option value="">请选择分类</option>
              {categories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.children.length > 0 ? (
                    cat.children.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))
                  ) : (
                    <option value={cat.id}>{cat.name}</option>
                  )}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系邮箱（选填）
            </label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium"
          >
            <Send className="w-4 h-4 mr-2" />
            提交工具
          </Button>
        </form>
      </div>
    </Layout>
  );
}
