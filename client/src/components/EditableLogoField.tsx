import { useEffect, useRef, useState } from "react";
import { Loader2, Move, RefreshCw, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

type LogoEditorState = {
  source: string;
  width: number;
  height: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  dirty: boolean;
};

interface EditableLogoFieldProps {
  value: string;
  onChange: (value: string) => void;
  uploadUrl: string;
  uploadHeaders?: HeadersInit;
  frameSize?: number;
  outputSize?: number;
  disabled?: boolean;
  uploadLabel?: string;
  helperTitle?: string;
  helperText?: string;
  className?: string;
  frameClassName?: string;
  controlsClassName?: string;
  onDirtyChange?: (dirty: boolean) => void;
  savedStatusText?: string;
}

const MIN_LOGO_ZOOM = 1;
const MAX_LOGO_ZOOM = 3;

function getBaseScale(width: number, height: number, frameSize: number) {
  return Math.max(frameSize / width, frameSize / height);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampLogoOffsets(editor: LogoEditorState, frameSize: number, nextOffsetX: number, nextOffsetY: number, zoom = editor.zoom) {
  const scaledWidth = editor.width * getBaseScale(editor.width, editor.height, frameSize) * zoom;
  const scaledHeight = editor.height * getBaseScale(editor.width, editor.height, frameSize) * zoom;
  const maxOffsetX = Math.max(0, (scaledWidth - frameSize) / 2);
  const maxOffsetY = Math.max(0, (scaledHeight - frameSize) / 2);

  return {
    offsetX: clamp(nextOffsetX, -maxOffsetX, maxOffsetX),
    offsetY: clamp(nextOffsetY, -maxOffsetY, maxOffsetY),
  };
}

async function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片加载失败"));
    image.src = url;
  });
}

async function renderEditedLogo(editor: LogoEditorState, frameSize: number, outputSize: number) {
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("无法创建 Logo 画布");

  const image = await loadImage(editor.source);
  const scaleMultiplier = outputSize / frameSize;
  const baseScale = getBaseScale(editor.width, editor.height, frameSize);
  const drawWidth = editor.width * baseScale * editor.zoom * scaleMultiplier;
  const drawHeight = editor.height * baseScale * editor.zoom * scaleMultiplier;
  const centerX = outputSize / 2 + editor.offsetX * scaleMultiplier;
  const centerY = outputSize / 2 + editor.offsetY * scaleMultiplier;

  context.clearRect(0, 0, outputSize, outputSize);
  context.drawImage(image, centerX - drawWidth / 2, centerY - drawHeight / 2, drawWidth, drawHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png", 1);
  });

  if (!blob) throw new Error("Logo 导出失败");
  return blob;
}

export default function EditableLogoField({
  value,
  onChange,
  uploadUrl,
  uploadHeaders,
  frameSize = 112,
  outputSize = 224,
  disabled = false,
  uploadLabel = "上传 Logo",
  helperTitle,
  helperText,
  className,
  frameClassName,
  controlsClassName,
  onDirtyChange,
  savedStatusText = "Logo 已保存，当前保存的就是前端最终展示效果",
}: EditableLogoFieldProps) {
  const [editor, setEditor] = useState<LogoEditorState | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    onDirtyChange?.(editor?.dirty ?? false);
  }, [editor?.dirty, onDirtyChange]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      if (!file.type.startsWith("image/")) {
        setError("请上传图片文件");
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const image = await loadImage(objectUrl);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      objectUrlRef.current = objectUrl;
      setEditor({
        source: objectUrl,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        dirty: true,
      });
      setStatus("拖动和缩放到满意效果后，点击保存");
      setError("");
    } catch {
      setError("图片读取失败，请重新选择");
    }
  };

  const handleZoomChange = (nextZoomValue: number) => {
    setEditor((current) => {
      if (!current) return current;

      const nextZoom = clamp(nextZoomValue, MIN_LOGO_ZOOM, MAX_LOGO_ZOOM);
      const nextOffsets = clampLogoOffsets(current, frameSize, current.offsetX, current.offsetY, nextZoom);
      return {
        ...current,
        zoom: nextZoom,
        offsetX: nextOffsets.offsetX,
        offsetY: nextOffsets.offsetY,
        dirty: true,
      };
    });
    setStatus("Logo 已调整，记得保存当前效果");
  };

  const handleReset = () => {
    setEditor((current) => {
      if (!current) return current;
      return {
        ...current,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        dirty: true,
      };
    });
    setStatus("已重置，可继续拖动和缩放后保存");
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!editor || disabled) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: editor.offsetX,
      originY: editor.offsetY,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    setEditor((current) => {
      if (!current) return current;

      const nextOffsetX = dragState.originX + event.clientX - dragState.startX;
      const nextOffsetY = dragState.originY + event.clientY - dragState.startY;
      const nextOffsets = clampLogoOffsets(current, frameSize, nextOffsetX, nextOffsetY);

      return {
        ...current,
        offsetX: nextOffsets.offsetX,
        offsetY: nextOffsets.offsetY,
        dirty: true,
      };
    });
    setStatus("Logo 已调整，记得保存当前效果");
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
    setIsDragging(false);
  };

  const handleSave = async () => {
    if (!editor) {
      setError("请先选择本地图片");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const blob = await renderEditedLogo(editor, frameSize, outputSize);
      const form = new FormData();
      form.append("file", new File([blob], `logo-${Date.now()}.png`, { type: "image/png" }));

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: uploadHeaders,
        body: form,
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Logo 保存失败");
      }

      onChange(data.url);
      setEditor((current) => (current ? { ...current, dirty: false } : current));
      setStatus(savedStatusText);
    } catch {
      setError("Logo 保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "bg-[#f5f5f7] border border-[#d2d2d7] border-dashed flex flex-col items-center justify-center overflow-hidden relative select-none touch-none",
            editor ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "group",
            frameClassName
          )}
          style={{ width: frameSize, height: frameSize }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {editor ? (
            <img
              src={editor.source}
              alt="Logo 编辑预览"
              className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
              style={{
                width: editor.width * getBaseScale(editor.width, editor.height, frameSize) * editor.zoom,
                height: editor.height * getBaseScale(editor.width, editor.height, frameSize) * editor.zoom,
                transform: `translate(calc(-50% + ${editor.offsetX}px), calc(-50% + ${editor.offsetY}px))`,
              }}
            />
          ) : value ? (
            <img src={value} alt="Logo" className="w-full h-full object-contain bg-white" />
          ) : (
            <UploadCloud className="w-8 h-8 text-[#86868b] group-hover:text-[#0071e3] transition-colors" />
          )}

          {!editor && !value && <span className="mt-2 text-[12px] text-[#86868b]">本地上传</span>}
          {editor && (
            <div className="absolute inset-x-2 bottom-2 rounded-full bg-black/55 px-2 py-1 text-[11px] text-white flex items-center justify-center gap-1.5 backdrop-blur-sm">
              <Move className="w-3 h-3" />
              拖动调整位置
            </div>
          )}
          {saving && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#0071e3] animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className={cn("rounded-[16px] border border-[#e8e8ed] bg-[#fafafc] p-3 space-y-3", controlsClassName)}>
        <label className="block text-center text-[#0071e3] text-[14px] font-medium cursor-pointer hover:underline">
          {editor || value ? "重新选择图片" : uploadLabel}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={disabled || saving} />
        </label>

        <div>
          <div className="flex items-center justify-between text-[12px] text-[#6e6e73] mb-2">
            <span>缩放图片</span>
            <span>{editor ? `${editor.zoom.toFixed(2)}x` : "1.00x"}</span>
          </div>
          <input
            type="range"
            min={MIN_LOGO_ZOOM}
            max={MAX_LOGO_ZOOM}
            step={0.01}
            value={editor?.zoom ?? 1}
            onChange={(event) => handleZoomChange(Number(event.target.value))}
            disabled={!editor || disabled || saving}
            className="w-full accent-[#0071e3]"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={!editor || disabled || saving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-[#d2d2d7] rounded-[12px] text-[13px] text-[#1d1d1f] disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重置
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!editor || disabled || saving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-[#0071e3] text-white rounded-[12px] text-[13px] font-medium disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            保存 Logo
          </button>
        </div>
      </div>

      {(helperTitle || helperText || status || error) && (
        <div className="rounded-[16px] border border-[#e8e8ed] bg-[#f8fafc] px-4 py-4">
          {helperTitle ? <p className="text-[14px] font-medium text-[#1d1d1f] mb-2">{helperTitle}</p> : null}
          {helperText ? <p className="text-[13px] leading-relaxed text-[#6e6e73]">{helperText}</p> : null}
          {status ? <p className={cn("text-[13px] text-[#0071e3]", helperText ? "mt-3" : "")}>{status}</p> : null}
          {error ? <p className={cn("text-[13px] text-red-600", helperText || status ? "mt-3" : "")}>{error}</p> : null}
        </div>
      )}
    </div>
  );
}