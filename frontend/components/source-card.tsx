"use client"

import { FileText } from "lucide-react"
import type { Source } from "@/lib/api"

type SourceCardProps = {
  source: Source
  onClick?: (source: Source) => void
}

export function SourceCard({ source, onClick }: SourceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(source)}
      className="group flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-right transition-colors hover:border-primary/50 hover:bg-accent"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileText className="size-4" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-card-foreground">
          صفحه {source.page}
        </span>
        <span className="text-xs text-muted-foreground">
          میزان تطابق: {Math.round(source.score * 100)}٪
        </span>
      </span>
    </button>
  )
}
