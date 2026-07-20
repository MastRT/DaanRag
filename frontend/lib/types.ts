import type { Source } from "@/lib/api"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  error?: boolean
}
