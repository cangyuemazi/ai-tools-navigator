/**
 * Validator Page
 * Validates tools.json and categories.json format for non-technical admins.
 */
import { useState } from "react";
import { FileCheck, Upload, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

type ValidationType = "tools" | "categories";
type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  count: number;
};

function validateCategories(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    return { valid: false, errors: ["数据必须是一个数组"], warnings: [], count: 0 };
  }

  const ids = new Set<string>();
  data.forEach((item: any, index: number) => {
    if (!item.id) errors.push(`第 ${index + 1} 项缺少 id 字段`);
    if (!item.name) errors.push(`第 ${index + 1} 项缺少 name 字段`);
    if (!item.icon) warnings.push(`第 ${index + 1} 项 "${item.name || "未知"}" 缺少 icon 字段`);

    if (item.id && ids.has(item.id)) {
      errors.push(`第 ${index + 1} 项 id "${item.id}" 重复`);
    }
    ids.add(item.id);

    if (item.children && Array.isArray(item.children)) {
      item.children.forEach((child: any, ci: number) => {
        if (!child.id) errors.push(`第 ${index + 1} 项子分类第 ${ci + 1} 项缺少 id`);
        if (!child.name) errors.push(`第 ${index + 1} 项子分类第 ${ci + 1} 项缺少 name`);
        if (!child.parentId) errors.push(`第 ${index + 1} 项子分类第 ${ci + 1} 项缺少 parentId`);
        if (child.parentId && child.parentId !== item.id) {
          errors.push(`子分类 "${child.name}" 的 parentId "${child.parentId}" 与父分类 id "${item.id}" 不匹配`);
        }
        if (child.id && ids.has(child.id)) {
          errors.push(`子分类 id "${child.id}" 重复`);
        }
        ids.add(child.id);
      });
    }
  });

  return { valid: errors.length === 0, errors, warnings, count: data.length };
}

function validateTools(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    return { valid: false, errors: ["数据必须是一个数组"], warnings: [], count: 0 };
  }

  const ids = new Set<string>();
  data.forEach((item: any, index: number) => {
    if (!item.id) errors.push(`第 ${index + 1} 项缺少 id 字段`);
    if (!item.name) errors.push(`第 ${index + 1} 项缺少 name 字段`);
    if (!item.description) warnings.push(`第 ${index + 1} 项 "${item.name || "未知"}" 缺少 description`);
    if (!item.url) errors.push(`第 ${index + 1} 项 "${item.name || "未知"}" 缺少 url`);
    if (!item.categoryId) errors.push(`第 ${index + 1} 项 "${item.name || "未知"}" 缺少 categoryId`);

    if (item.url && !item.url.startsWith("http")) {
      errors.push(`第 ${index + 1} 项 "${item.name}" 的 url 格式不正确，需要以 http 开头`);
    }

    if (item.description && item.description.length > 100) {
      warnings.push(`第 ${index + 1} 项 "${item.name}" 的 description 超过100字`);
    }

    if (item.id && ids.has(item.id)) {
      errors.push(`第 ${index + 1} 项 id "${item.id}" 重复`);
    }
    ids.add(item.id);

    if (item.tags && !Array.isArray(item.tags)) {
      errors.push(`第 ${index + 1} 项 "${item.name}" 的 tags 必须是数组`);
    }
  });

  return { valid: errors.length === 0, errors, warnings, count: data.length };
}

export default function Validator() {
  const [type, setType] = useState<ValidationType>("tools");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleValidate = () => {
    setParseError(null);
    setResult(null);

    if (!input.trim()) {
      setParseError("请输入或粘贴 JSON 数据");
      return;
    }

    try {
      const data = JSON.parse(input);
      const validationResult = type === "tools" ? validateTools(data) : validateCategories(data);
      setResult(validationResult);
    } catch (e) {
      setParseError(`JSON 解析失败：${(e as Error).message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(text);
    };
    reader.readAsText(file);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">数据校验</h1>
          <p className="text-gray-500 mt-2">
            校验 tools.json 或 categories.json 的格式是否正确，防止格式错误导致网站异常。
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">校验类型</label>
            <div className="flex gap-3">
              <button
                onClick={() => { setType("tools"); setResult(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  type === "tools"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                工具数据 (tools.json)
              </button>
              <button
                onClick={() => { setType("categories"); setResult(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  type === "categories"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                分类数据 (categories.json)
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">上传文件</label>
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">点击上传 JSON 文件</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">或粘贴 JSON 数据</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='[{"id": "example", "name": "示例工具", ...}]'
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <Button
            onClick={handleValidate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium"
          >
            <FileCheck className="w-4 h-4 mr-2" />
            开始校验
          </Button>

          {parseError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">解析错误</p>
                <p className="text-xs text-red-600 mt-1">{parseError}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className={`flex items-start gap-3 p-4 rounded-xl ${result.valid ? "bg-green-50" : "bg-red-50"}`}>
                {result.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${result.valid ? "text-green-700" : "text-red-700"}`}>
                    {result.valid ? "校验通过" : "校验未通过"}
                  </p>
                  <p className={`text-xs mt-1 ${result.valid ? "text-green-600" : "text-red-600"}`}>
                    共 {result.count} 条数据，{result.errors.length} 个错误，{result.warnings.length} 个警告
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-700">错误列表</h4>
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-red-600 bg-red-50/50 p-2 rounded-lg">
                      <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-amber-700">警告列表</h4>
                  {result.warnings.map((warn, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50/50 p-2 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
