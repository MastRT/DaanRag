"use client"

import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/types"
import type { Source } from "@/lib/api"
import { SourceCard } from "@/components/source-card"

type MessageBubbleProps = {
  message: Message
  onSourceClick?: (source: Source) => void
}

export function MessageBubble({ message, onSourceClick }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isUser ? "flex-row" : "flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground",
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="size-5" /> : <Bot className="size-5" />}
      </div>

      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2",
          isUser ? "items-start" : "items-end",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : message.error
                ? "rounded-tl-sm bg-destructive/10 text-destructive"
                : "rounded-tl-sm bg-card text-card-foreground border border-border",
          )}
        >
          {message.content}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              منابع:
            </span>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, i) => (
                <SourceCard
                  key={`${source.page}-${i}`}
                  source={source}
                  onClick={onSourceClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
