export function LoadingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5"
      role="status"
      aria-label="در حال پردازش"
    >
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
      <span className="sr-only">در حال پردازش...</span>
    </div>
  )
}
