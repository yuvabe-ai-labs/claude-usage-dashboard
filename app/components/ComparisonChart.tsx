'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { SnapshotRow } from '../types'
import { barColor, tooltipStyle, axisTick } from '../lib/utils'

interface ComparisonChartProps {
  members: { id: string; name: string }[]
  latestByMember: Map<string, SnapshotRow>
  history: SnapshotRow[]
}

export function ComparisonChart({ members, latestByMember, history: _history }: ComparisonChartProps) {
  const weeklyData = useMemo(() =>
    members
      .map(m => {
        const latest = latestByMember.get(m.id)
        const pct = latest?.seven_day_utilization ?? 0
        return { name: m.name, value: pct, fill: barColor(pct) }
      })
      .sort((a, b) => b.value - a.value),
    [members, latestByMember]
  )

  const sessionData = useMemo(() =>
    members
      .map(m => {
        const latest = latestByMember.get(m.id)
        const pct = latest?.five_hour_utilization ?? 0
        return { name: m.name, value: pct, fill: barColor(pct) }
      })
      .sort((a, b) => b.value - a.value),
    [members, latestByMember]
  )

  const BAR_H = 32

  function Chart({ title, data, tooltipLabel }: {
    title: string
    data: { name: string; value: number; fill: string }[]
    tooltipLabel: string
  }) {
    return (
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-3">{title}</p>
        <ResponsiveContainer width="100%" height={BAR_H * data.length + 20}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
            <XAxis type="number" domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={100} />
            <Tooltip {...tooltipStyle} formatter={(val) => [`${val ?? 0}%`, tooltipLabel]} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-6">
      <h2 className="text-base font-semibold text-zinc-100">Team Usage Comparison</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Chart title="Current 5h Session" data={sessionData} tooltipLabel="5h session" />
        <Chart title="Current 7-day Weekly" data={weeklyData} tooltipLabel="7-day" />
      </div>
    </div>
  )
}
