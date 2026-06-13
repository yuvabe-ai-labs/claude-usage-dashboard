'use client'

interface HeaderProps {
  lastUpdated: Date | null
  onRefresh: () => void
  isRefreshing: boolean
}

export function Header({ lastUpdated, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
      <h1 className="text-lg font-semibold text-zinc-100">Claude Usage Dashboard</h1>
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span className="text-xs text-zinc-500">
            Updated{' '}
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </header>
  )
}
