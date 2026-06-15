'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { SnapshotRow } from '../types'
import { barColor, tooltipStyle, axisTick } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ComparisonChartProps {
  members: { id: string; name: string }[]
  latestByMember: Map<string, SnapshotRow>
}

function fmtShort(d: Date) {
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function WeeklyTooltip({ active, payload }: {
  active?: boolean
  payload?: { payload: { name: string; value: number; weekStart: string; weekEnd: string } }[]
}) {
  if (!active || !payload?.length) return null
  const { value, weekStart, weekEnd } = payload[0].payload
  return (
    <div style={tooltipStyle.contentStyle}>
      <p className="text-xs text-muted-foreground mb-1">{weekStart} – {weekEnd}</p>
      <p className="font-semibold">{value}% <span className="text-muted-foreground font-normal text-xs">7-day weekly</span></p>
    </div>
  )
}

const BAR_H = 36

export function ComparisonChart({ members, latestByMember }: ComparisonChartProps) {
  const weeklyData = useMemo(() =>
    members.map(m => {
      const latest = latestByMember.get(m.id)
      const pct = latest?.seven_day_utilization ?? 0
      const resetDate = latest ? new Date(latest.seven_day_resets_at) : new Date()
      const startDate = new Date(resetDate.getTime() - 7 * 24 * 3600 * 1000)
      return { name: m.name, value: pct, fill: barColor(pct), weekStart: fmtShort(startDate), weekEnd: fmtShort(resetDate) }
    }).sort((a, b) => b.value - a.value),
    [members, latestByMember]
  )

  const sessionData = useMemo(() =>
    members.map(m => {
      const latest = latestByMember.get(m.id)
      const pct = latest?.five_hour_utilization ?? 0
      return { name: m.name, value: pct, fill: barColor(pct) }
    }).sort((a, b) => b.value - a.value),
    [members, latestByMember]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Usage Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-4">Current 5h Session</p>
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
            <p className="text-xs font-medium text-muted-foreground mb-4">Current 7-day Weekly</p>
            <ResponsiveContainer width="100%" height={BAR_H * weeklyData.length + 20}>
              <BarChart data={weeklyData} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<WeeklyTooltip />} cursor={tooltipStyle.cursor} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
