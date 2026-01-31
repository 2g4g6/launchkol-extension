export function ChatCardContent() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-3">
      <div className="w-12 h-12 rounded-full bg-kol-surface border border-kol-border flex items-center justify-center mb-3">
        <i className="ri-chat-3-line text-xl text-kol-text-muted" />
      </div>
      <p className="text-sm text-kol-text-muted font-medium">Coming Soon</p>
      <p className="text-[11px] text-kol-text-muted/60 mt-1">Chat features are under development</p>
    </div>
  )
}
