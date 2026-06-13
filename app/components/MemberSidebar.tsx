'use client'

import type { SnapshotRow } from '../types'
import { MEMBER_COLORS } from '../lib/utils'

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

function UsageBar({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-orange-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

export function MemberSidebar({ members, selectedMemberId, onSelect }: MemberSidebarProps) {
  return (
    <aside className="w-[210px] shrink-0 border-r border-zinc-800 overflow-y-auto bg-zinc-900">
      <div className="px-3 py-3">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium mb-2 px-1">
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
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    <span className="text-sm font-medium truncate">{m.name}</span>
                  </div>
                  <p className="text-[10px] text-zinc-600 pl-4 mb-1.5">Current Usage</p>
                  <div className="flex flex-col gap-1 pl-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500">5h session</span>
                      <span className="text-[10px] text-zinc-400">{m.sessionPct}%</span>
                    </div>
                    <UsageBar pct={m.sessionPct} />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500">7d weekly</span>
                      <span className="text-[10px] text-zinc-400">{m.weeklyPct}%</span>
                    </div>
                    <UsageBar pct={m.weeklyPct} />
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
