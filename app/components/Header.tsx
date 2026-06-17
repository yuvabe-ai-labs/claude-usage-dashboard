'use client'

import { useTheme } from 'next-themes'
import { RefreshCw, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  lastUpdated: Date | null
  onRefresh: () => void
  isRefreshing: boolean
}

export function Header({ lastUpdated, onRefresh, isRefreshing }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card shrink-0">
      <h1 className="text-xl font-semibold tracking-tight">Claude Usage Dashboard</h1>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-foreground/70">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </header>
  )
}
