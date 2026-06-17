'use client'

import { useMemo } from 'react'
import type { SnapshotRow } from '../types'
import { roundToHour, barColor } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WeeklyTableProps {
  members: { id: string; name: string; email: string | null }[]
  history: SnapshotRow[]
}

const WEEK_MS = 7 * 24 * 3600 * 1000

function fmtShort(d: Date) {
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' })
}

function cellColor(pct: number) {
  if (pct === 0) return 'text-muted-foreground'
  if (pct >= 90) return 'text-red-400'
  if (pct >= 75) return 'text-orange-400'
  if (pct >= 50) return 'text-yellow-400'
  return 'text-green-400'
}

export function WeeklyTable({ members, history }: WeeklyTableProps) {
  const tableRows = useMemo(() =>
    members.map(m => {
      const memberRows = history.filter(r => r.member_id === m.id)
      const byReset = new Map<string, SnapshotRow[]>()
      for (const r of memberRows) {
        const key = roundToHour(r.seven_day_resets_at)
        if (!byReset.has(key)) byReset.set(key, [])
        byReset.get(key)!.push(r)
      }

      const sorted = Array.from(byReset.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-4)

      const cycles = sorted.map(([key, rows], i) => {
        const resetDate = new Date(key)
        const startDate = new Date(resetDate.getTime() - WEEK_MS)
        const latest = rows.reduce((a, b) => a.recorded_at > b.recorded_at ? a : b)
        return {
          pct: latest.seven_day_utilization,
          start: fmtShort(startDate),
          end: fmtShort(resetDate),
          isCurrent: i === sorted.length - 1,
        }
      })

      while (cycles.length < 4) cycles.push({ pct: 0, start: '', end: '', isCurrent: false })

      return { name: m.name, email: m.email, weeks: cycles }
    }),
    [members, history]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Usage History</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 pr-6 text-sm font-medium text-muted-foreground">Name</th>
              {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(w => (
                <th key={w} className="py-3 px-5 text-center text-sm font-medium text-muted-foreground">{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map(row => (
              <tr key={row.name} className="border-b border-border/50 last:border-0">
                <td className="py-4 pr-6">
                  <p className="text-sm font-semibold">{row.name}</p>
                  {row.email && <p className="text-xs text-muted-foreground mt-0.5">{row.email}</p>}
                </td>
                {row.weeks.map((w, i) => (
                  <td key={i} className={cn('py-4 px-5', w.isCurrent && 'bg-blue-500/5')}>
                    {w.pct > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* <span className="text-xs text-muted-foreground">{w.start} – {w.end}</span> */}
                          {w.isCurrent && (
                            <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded-full">current</span>
                          )}
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${w.pct}%`, backgroundColor: w.isCurrent ? '#60a5fa' : barColor(w.pct) }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                          <span className={w.isCurrent ? 'text-blue-400' : cellColor(w.pct)}>{w.pct}%</span>
                          <span className="text-muted-foreground">Left: {100 - w.pct}%</span>
                        </div>
                      </div>
                    ) : (
                      <span className="block text-center text-muted-foreground text-sm">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
