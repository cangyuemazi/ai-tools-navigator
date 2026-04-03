import { useCallback, useEffect } from 'react';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { toast } from 'sonner';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  token: string;
  placeholder?: string;
  height?: number;
}

/**
 * 动态注入 Tailwind CDN play 脚本，使预览区能渲染任意 Tailwind 类名的 HTML。
 * 全局仅注入一次，多编辑器实例共享。
 */
function useTailwindCDN() {
  useEffect(() => {
    const id = 'tailwind-cdn-play';
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.src = 'https://cdn.tailwindcss.com';
    script.async = true;
    document.head.appendChild(script);
  }, []);
}

export default function MarkdownEditor({
  value,
  onChange,
  token,
  placeholder,
  height = 700,
}: MarkdownEditorProps) {
  useTailwindCDN();

  // useCallback 避免每次父组件 re-render 都重建上传函数
  const handleUploadImg = useCallback(
    async (files: File[], callback: (urls: string[]) => void) => {
      const urls = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          try {
            const res = await fetch('/api/admin/upload', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
            const data = await res.json();
            if (data.url) return data.url;
            throw new Error(data.error || '上传失败');
          } catch (error) {
            toast.error(`图片上传失败: ${file.name}`);
            console.error('Markdown 图片上传报错:', error);
            return '';
          }
        }),
      );
      callback(urls.filter(Boolean));
    },
    [token],
  );

  return (
    <div
      className="rounded-xl overflow-hidden border border-[#d2d2d7] shadow-sm"
      style={{ resize: 'vertical', minHeight: '400px', maxHeight: '90vh' }}
    >
      <MdEditor
        modelValue={value}
        onChange={onChange}
        onUploadImg={handleUploadImg}
        placeholder={
          placeholder ||
          '在此输入内容，支持 Markdown 语法和 HTML 代码（含 Tailwind 类名），可直接拖拽图片上传...'
        }
        language="zh-CN"
        style={{ height: `${height}px` }}
        // 关闭 HTML 消毒，允许带 Tailwind/style 的原生 HTML 在预览区完整渲染
        sanitize={(html: string) => html}
        // 关闭不需要的重量级子功能，提升加载速度
        noKatex
        noMermaid
        toolbarsExclude={['github', 'mermaid', 'katex']}
      />
    </div>
  );
}