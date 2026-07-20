"use client"

import { Bot, SendHorizontal, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { LoadingIndicator } from "@/components/loading-indicator"
import { MessageBubble } from "@/components/message-bubble"
import { askQuestion, type Source } from "@/lib/api"
import type { Message } from "@/lib/types"

type ChatWindowProps = {
  hasDocument: boolean
}

export function ChatWindow({ hasDocument }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, loading])

  async function handleSend() {
    const question = input.trim()
    if (!question || loading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await askQuestion(question)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.answer,
          sources: res.sources,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "خطا در دریافت پاسخ. لطفاً از اتصال به سرور مطمئن شوید و دوباره تلاش کنید.",
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSourceClick(source: Source) {
    console.log("[v0] source clicked:", source)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && !loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-7" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground text-balance">
                از سند خود سوال بپرسید
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground text-pretty">
                {hasDocument
                  ? "حالا می‌توانید هر سوالی درباره محتوای فایل بارگذاری‌شده بپرسید."
                  : "ابتدا یک فایل PDF بارگذاری کنید، سپس سوال خود را مطرح کنید."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onSourceClick={handleSourceClick}
              />
            ))}
            {loading && (
              <div className="flex flex-row-reverse gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Bot className="size-5" />
                </div>
                <div className="flex items-center rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-4">
                  <LoadingIndicator />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card/50 p-3 sm:p-4">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:border-primary/60">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="سوال خود را بنویسید..."
            className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="button"
            size="icon"
            aria-label="ارسال"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-xl"
          >
            <SendHorizontal className="size-5" />
          </Button>
        </div>
        <p className="mt-2 px-1 text-center text-xs text-muted-foreground">
          برای ارسال Enter و برای خط جدید Shift + Enter را بزنید.
        </p>
      </div>
    </div>
  )
}
