"use client"

import { FileText } from "lucide-react"
import { useState } from "react"
import { ChatWindow } from "@/components/chat-window"
import { ThemeToggle } from "@/components/theme-toggle"
import { UploadBox } from "@/components/upload-box"
import type { UploadResponse } from "@/lib/api"

export default function Page() {
  const [document, setDocument] = useState<UploadResponse | null>(null)

  return (
    <main className="flex h-dvh flex-col bg-muted/30">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileText className="size-5" />
          </span>
          <div className="flex flex-col leading-tight">
            <h1 className="text-base font-semibold text-foreground">
              دستیار هوشمند اسناد
            </h1>
            <p className="text-xs text-muted-foreground">
              پرسش و پاسخ از روی فایل‌های PDF
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:gap-6 lg:p-6">
        {/* Sidebar / Upload */}
        <aside className="flex shrink-0 flex-col gap-4 lg:w-80">
          <div className="rounded-2xl border border-border bg-background p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              بارگذاری سند
            </h2>
            <UploadBox onUploaded={setDocument} />
          </div>
        </aside>

        {/* Chat */}
        <section className="min-h-0 flex-1">
          <ChatWindow hasDocument={!!document} />
        </section>
      </div>
    </main>
  )
}
