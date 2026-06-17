'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { SnapshotRow } from '../types'
import { barColor, roundToHour, tooltipStyle, axisTick } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ComparisonChartProps {
  members: { id: string; name: string; email: string | null }[]
  latestByMember: Map<string, SnapshotRow>
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

function cellBg(pct: number) {
  if (pct === 0) return ''
  if (pct >= 90) return 'bg-red-500/10'
  if (pct >= 75) return 'bg-orange-500/10'
  if (pct >= 50) return 'bg-yellow-500/10'
  return 'bg-green-500/10'
}

const BAR_H = 36

export function ComparisonChart({ members, latestByMember, history }: ComparisonChartProps) {
  const sessionData = useMemo(() =>
    members.map(m => {
      const pct = latestByMember.get(m.id)?.five_hour_utilization ?? 0
      return { name: m.name, value: pct, fill: barColor(pct) }
    }).sort((a, b) => b.value - a.value),
    [members, latestByMember]
  )

  const weeklyBarData = useMemo(() =>
    members.map(m => {
      const latest = latestByMember.get(m.id)
      const pct = latest?.seven_day_utilization ?? 0
      const resetDate = latest ? new Date(latest.seven_day_resets_at) : new Date()
      const startDate = new Date(resetDate.getTime() - WEEK_MS)
      const fmt = (d: Date) => d.toLocaleDateString([], { day: '2-digit', month: 'short' })
      return { name: m.name, value: pct, fill: barColor(pct), weekStart: fmt(startDate), weekEnd: fmt(resetDate) }
    }).sort((a, b) => b.value - a.value),
    [members, latestByMember]
  )

  // Per-user relative weeks: Week 1 = oldest cycle, Week 4 = newest
  const tableRows = useMemo(() =>
    members.map(m => {
      const memberRows = history.filter(r => r.member_id === m.id)
      const byReset = new Map<string, SnapshotRow[]>()
      for (const r of memberRows) {
        const key = roundToHour(r.seven_day_resets_at)
        if (!byReset.has(key)) byReset.set(key, [])
        byReset.get(key)!.push(r)
      }

      const cycles = Array.from(byReset.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-4)
        .map(([key, rows]) => {
          const resetDate = new Date(key)
          const startDate = new Date(resetDate.getTime() - WEEK_MS)
          const latest = rows.reduce((a, b) => a.recorded_at > b.recorded_at ? a : b)
          return {
            pct: latest.seven_day_utilization,
            start: fmtShort(startDate),
            end: fmtShort(resetDate),
          }
        })

      while (cycles.length < 4) cycles.push({ pct: 0, start: '', end: '' })

      return { name: m.name, email: m.email, weeks: cycles }
    }),
    [members, history]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Bar charts */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-4">5h Session</p>
              <ResponsiveContainer width="100%" height={BAR_H * sessionData.length + 20}>
                <BarChart data={sessionData} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
                  <XAxis type="number" domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={100} />
                  <Tooltip {...tooltipStyle} formatter={(val) => [`${val ?? 0}%`, '5h session']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-4">7-day Weekly</p>
              <ResponsiveContainer width="100%" height={BAR_H * weeklyBarData.length + 20}>
                <BarChart data={weeklyBarData} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
                  <XAxis type="number" domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={100} />
                  <Tooltip {...tooltipStyle} formatter={(val) => [`${val ?? 0}%`, '7-day']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly history table */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Usage History</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-6 text-xs font-medium text-muted-foreground">Name</th>
                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(w => (
                  <th key={w} className="py-2 px-4 text-center text-xs font-medium text-muted-foreground">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map(row => (
                <tr key={row.name} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-6">
                    <p className="text-sm font-medium">{row.name}</p>
                    {row.email && <p className="text-xs text-muted-foreground">{row.email}</p>}
                  </td>
                  {row.weeks.map((w, i) => (
                    <td key={i} className="py-3 px-4">
                      {w.pct > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-muted-foreground text-center">{w.start} – {w.end}</span>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${w.pct}%`, backgroundColor: barColor(w.pct) }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className={cellColor(w.pct)}>{w.pct}%</span>
                            <span className="text-muted-foreground">Left: {100 - w.pct}%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="block text-center text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
