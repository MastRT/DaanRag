"use client"

import { CheckCircle2, FileUp, Loader2, UploadCloud, XCircle } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { uploadPdf, type UploadResponse } from "@/lib/api"
import { cn } from "@/lib/utils"

type UploadBoxProps = {
  onUploaded?: (result: UploadResponse) => void
}

export function UploadBox({ onUploaded }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("لطفاً فقط فایل PDF بارگذاری کنید.")
      return
    }
    setError(null)
    setResult(null)
    setUploading(true)
    try {
      const res = await uploadPdf(file)
      setResult(res)
      onUploaded?.(res)
    } catch {
      setError("بارگذاری ناموفق بود. از روشن بودن سرور مطمئن شوید.")
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragging
            ? "border-primary bg-accent"
            : "border-border bg-card hover:border-primary/50 hover:bg-accent/50",
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <UploadCloud className="size-5" />
          )}
        </span>
        <p className="text-sm font-medium text-card-foreground">
          {uploading ? "در حال بارگذاری و پردازش..." : "فایل PDF را اینجا رها کنید"}
        </p>
        <p className="text-xs text-muted-foreground">یا برای انتخاب کلیک کنید</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ""
          }}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <FileUp className="size-4" />
        انتخاب فایل
      </Button>

      {result && (
        <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="flex flex-col gap-0.5 text-right">
            <span className="text-sm font-medium text-card-foreground break-all">
              {result.filename}
            </span>
            <span className="text-xs text-muted-foreground">
              {result.chunks} قطعه نمایه‌سازی شد
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}
    </div>
  )
}
