'use client'

import type { SnapshotRow } from '../types'
import { MEMBER_COLORS } from '../lib/utils'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface MemberItem {
  id: string
  name: string
  email: string | null
  sessionPct: number
  weeklyPct: number
}

interface MemberSidebarProps {
  members: MemberItem[]
  selectedMemberId: string | null
  onSelect: (id: string) => void
}

function usageColor(pct: number) {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 75) return 'bg-orange-500'
  if (pct >= 50) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function MemberSidebar({ members, selectedMemberId, onSelect }: MemberSidebarProps) {
  return (
    <aside className="w-55 shrink-0 border-r border-border overflow-y-auto bg-card">
      <div className="px-3 py-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 px-2">
          Members
        </p>
        <ul className="flex flex-col gap-1">
          {members.map((m, i) => {
            const color = MEMBER_COLORS[i % MEMBER_COLORS.length]
            const isSelected = m.id === selectedMemberId
            return (
              <li key={m.id}>
                <button
                  onClick={() => onSelect(m.id)}
                  className={cn(
                    'w-full text-left px-3 py-3 rounded-lg transition-colors',
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-sm font-medium truncate">{m.name}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 pl-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">5h session</span>
                      <span className="text-[10px] font-medium">{m.sessionPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', usageColor(m.sessionPct))}
                        style={{ width: `${Math.min(m.sessionPct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground">7d weekly</span>
                      <span className="text-[10px] font-medium">{m.weeklyPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', usageColor(m.weeklyPct))}
                        style={{ width: `${Math.min(m.weeklyPct, 100)}%` }}
                      />
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

export function getLatestByMember(history: SnapshotRow[]): Map<string, SnapshotRow> {
  const map = new Map<string, SnapshotRow>()
  for (const r of history) {
    if (!r.member_id) continue
    const existing = map.get(r.member_id)
    if (!existing || r.recorded_at > existing.recorded_at) map.set(r.member_id, r)
  }
  return map
}
