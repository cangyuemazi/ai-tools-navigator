import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { toast } from 'sonner';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  token: string; // 接收来自父组件的鉴权 Token，保证上传安全
  placeholder?: string;
}

export default function MarkdownEditor({ value, onChange, token, placeholder }: MarkdownEditorProps) {
  // 核心：拦截编辑器的图片上传，并转交给我们自己的 OSS 接口
  const handleUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    // 支持多图同时拖拽上传
    const urls = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
          // 复用我们已经写好的安全上传接口
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
          console.error("Markdown 图片上传报错:", error);
          return '';
        }
      })
    );
    // 将成功上传的 OSS 链接回调给编辑器，它会自动在光标处生成 ![img](url)
    callback(urls.filter(Boolean));
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#d2d2d7] shadow-sm">
      <MdEditor
        modelValue={value}
        onChange={onChange}
        onUploadImg={handleUploadImg}
        placeholder={placeholder || '在此输入内容，支持 Markdown 语法，支持直接拖拽图片...'}
        language="zh-CN"
        style={{ height: '500px' }} // 默认高度，足够双屏预览
        toolbarsExclude={['github']} // 隐藏不必要的顶部工具栏按钮
      />
    </div>
  );
}